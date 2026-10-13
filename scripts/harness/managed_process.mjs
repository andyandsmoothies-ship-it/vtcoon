import { spawn } from 'node:child_process';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';

/**
 * Tracks all currently active spawned child processes for forced cleanup on exit.
 */
const liveProcesses = new Set();

/**
 * Sends a termination signal to child process or process tree.
 *
 * @param {import('node:child_process').ChildProcess} child
 * @param {NodeJS.Signals} signal
 */
function signalProcess(child, signal) {
  const pid = child.pid;
  if (pid === undefined) return;
  try {
    if (process.platform === 'win32') {
      if (signal === 'SIGKILL') {
        try {
          execSync(`taskkill /pid ${pid} /T /F`, { stdio: 'ignore' });
        } catch {
          child.kill(signal);
        }
      } else {
        child.kill(signal);
      }
    } else {
      process.kill(-pid, signal);
    }
  } catch {
    // Process already gone
  }
}

/**
 * Checks if a process group or child process is still running.
 *
 * @param {import('node:child_process').ChildProcess} child
 * @returns {boolean}
 */
function isProcessRunning(child) {
  if (child.exitCode !== null || child.signalCode !== null) return false;
  if (child.pid === undefined) return false;
  if (process.platform === 'win32') return child.exitCode === null;
  try {
    process.kill(-child.pid, 0);
    return true;
  } catch {
    return false;
  }
}

/**
 * Synchronously kills every managed child process that was spawned and not yet released.
 * Safe to call multiple times; leaves reused processes untouched.
 */
export function killAllManagedProcesses() {
  for (const child of liveProcesses) {
    signalProcess(child, 'SIGKILL');
  }
  liveProcesses.clear();
}

// Global exit hooks to prevent orphaned zombie processes
process.once('exit', () => killAllManagedProcesses());
process.once('SIGINT', () => {
  killAllManagedProcesses();
  process.exit(130);
});
process.once('SIGTERM', () => {
  killAllManagedProcesses();
  process.exit(143);
});

/**
 * Probes HTTP endpoint readiness. Returns true if status 200..499 within timeout.
 *
 * @param {string} url
 * @param {number} timeoutMs
 * @param {AbortSignal} [signal]
 * @returns {Promise<boolean>}
 */
export async function answersHttp(url, timeoutMs, signal) {
  try {
    const timeout = AbortSignal.timeout(timeoutMs);
    const combinedSignal = signal ? AbortSignal.any([timeout, signal]) : timeout;
    const res = await fetch(url, { redirect: 'manual', signal: combinedSignal });
    return res.status >= 200 && res.status <= 499;
  } catch {
    return false;
  }
}

/**
 * Probes raw TCP port readiness.
 *
 * @param {number} port
 * @param {string} [host='127.0.0.1']
 * @param {number} [timeoutMs=500]
 * @returns {Promise<boolean>}
 */
export function answersPort(port, host = '127.0.0.1', timeoutMs = 500) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;

    const finish = (result) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(timeoutMs);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));

    socket.connect(port, host);
  });
}

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new Error('Aborted'));
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new Error('Aborted'));
    }, { once: true });
  });
}

/**
 * ManagedProcess orchestrates process lifecycle:
 * 1. Preflight collision probe (fails fast with APP_ALREADY_RUNNING)
 * 2. Spawn and PID registration
 * 3. Exponential backoff readiness polling
 * 4. Graceful SIGTERM -> polling -> SIGKILL shutdown
 */
export class ManagedProcess {
  /**
   * @param {string} label
   * @param {{
   *   executable: string,
   *   args?: string[],
   *   cwd?: string,
   *   env?: Record<string, string>,
   *   startupTimeout?: number,
   *   shutdownTimeout?: number,
   *   reuseExisting?: boolean,
   *   log?: string
   * }} command
   * @param {{ readyUrl?: string, readyPort?: number }} [readiness={}]
   * @param {string} [projectRoot=process.cwd()]
   */
  constructor(label, command, readiness = {}, projectRoot = process.cwd()) {
    this.label = label;
    this.command = command;
    this.readiness = readiness;
    this.projectRoot = projectRoot;
    this.child = null;
    this.reusedExisting = false;
    this.spawnedProcess = false;
  }

  get spawned() {
    return this.spawnedProcess;
  }

  get isReused() {
    return this.reusedExisting;
  }

  get processId() {
    return this.child?.pid;
  }

  /**
   * Starts the managed process and waits until ready.
   *
   * @param {AbortSignal} [signal]
   * @returns {Promise<void>}
   */
  async start(signal) {
    if (signal?.aborted) return;
    const { readyUrl, readyPort } = this.readiness;
    const startupTimeout = this.command.startupTimeout ?? 30000;
    const reuse = this.command.reuseExisting === true;

    // 1. Pre-flight probe: if port/URL already answers, prevent orphan collisions
    if (readyUrl) {
      if (await answersHttp(readyUrl, Math.min(1000, startupTimeout), signal)) {
        if (reuse) {
          this.reusedExisting = true;
          return;
        }
        throw new Error(
          `APP_ALREADY_RUNNING: ${readyUrl} already answered before ${this.label} started. Stop that process or set reuseExisting: true.`
        );
      }
    } else if (readyPort) {
      if (await answersPort(readyPort, '127.0.0.1', Math.min(500, startupTimeout))) {
        if (reuse) {
          this.reusedExisting = true;
          return;
        }
        throw new Error(
          `APP_ALREADY_RUNNING: Port ${readyPort} is already in use before ${this.label} started. Stop that process or set reuseExisting: true.`
        );
      }
    }

    if (signal?.aborted) return;

    // 2. Spawn Child Process
    const logPath = this.command.log ? path.resolve(this.projectRoot, this.command.log) : undefined;
    let logFd;
    if (logPath) {
      fs.mkdirSync(path.dirname(logPath), { recursive: true });
      logFd = fs.openSync(logPath, 'a');
    }

    let child;
    try {
      child = spawn(this.command.executable, this.command.args || [], {
        cwd: path.resolve(this.projectRoot, this.command.cwd || '.'),
        env: { ...process.env, ...(this.command.env || {}) },
        detached: process.platform !== 'win32',
        stdio: logFd === undefined ? 'ignore' : ['ignore', logFd, logFd]
      });
    } finally {
      if (logFd !== undefined) fs.closeSync(logFd);
    }

    this.child = child;
    this.spawnedProcess = child.pid !== undefined;
    if (this.spawnedProcess) {
      liveProcesses.add(child);
    }

    let spawnError;
    child.once('error', (err) => {
      spawnError = err;
    });

    let exitStatus;
    child.once('exit', (code, sig) => {
      exitStatus = { code, sig };
      liveProcesses.delete(child);
    });

    // 3. Readiness polling loop
    const deadline = Date.now() + startupTimeout;
    let pollInterval = 25;

    while (Date.now() < deadline) {
      if (signal?.aborted) {
        await this.stop();
        throw new Error(`Aborted while starting ${this.label}`);
      }

      if (spawnError) {
        throw new Error(`${this.label} failed to spawn: ${spawnError.message}`);
      }

      if (exitStatus) {
        throw new Error(
          `${this.label} exited prematurely with code ${exitStatus.code} (signal ${exitStatus.sig}) before becoming ready`
        );
      }

      if (readyUrl) {
        if (await answersHttp(readyUrl, 500, signal)) return;
      } else if (readyPort) {
        if (await answersPort(readyPort, '127.0.0.1', 200)) return;
      } else {
        // Without readiness probe, successful spawn is ready
        return;
      }

      await sleep(pollInterval, signal).catch(() => {});
      pollInterval = Math.min(250, pollInterval * 1.5);
    }

    await this.stop();
    throw new Error(`${this.label} timed out after ${startupTimeout}ms waiting for readiness`);
  }

  /**
   * Gracefully terminates the managed process (SIGTERM -> poll -> SIGKILL).
   *
   * @param {number} [timeout]
   * @returns {Promise<void>}
   */
  async stop(timeout) {
    if (this.reusedExisting) return;
    const child = this.child;
    this.child = null;
    if (!child || child.pid === undefined) return;

    const shutdownTimeout = timeout ?? this.command.shutdownTimeout ?? 5000;
    signalProcess(child, 'SIGTERM');

    const deadline = Date.now() + shutdownTimeout;
    while (isProcessRunning(child) && Date.now() < deadline) {
      await sleep(25).catch(() => {});
    }

    if (isProcessRunning(child)) {
      signalProcess(child, 'SIGKILL');
      await sleep(50).catch(() => {});
    }

    liveProcesses.delete(child);
  }
}
