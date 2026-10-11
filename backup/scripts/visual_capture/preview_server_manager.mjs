import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Kills a process and its child processes cleanly.
 */
export function killProcessTree(proc) {
  if (!proc || !proc.pid) return;
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /pid ${proc.pid} /T /F`, { stdio: 'ignore' });
    } else {
      proc.kill('SIGTERM');
    }
  } catch {
    try {
      proc.kill('SIGKILL');
    } catch {}
  }
}

/**
 * Checks if a port is responding to HTTP requests.
 */
export async function checkPortOpen(port, signal) {
  try {
    const timeout = AbortSignal.timeout(1000);
    const combinedSignal = signal ? AbortSignal.any([timeout, signal]) : timeout;
    let res;
    try {
      res = await fetch(`http://localhost:${port}/`, { method: 'HEAD', signal: combinedSignal });
    } catch {
      res = await fetch(`http://127.0.0.1:${port}/`, { method: 'HEAD', signal: combinedSignal });
    }
    return res.status < 500;
  } catch {
    return false;
  }
}

/**
 * Abortable sleep timer.
 */
export function sleep(ms, signal) {
  return new Promise((res) => {
    if (signal?.aborted) return res();
    const timer = setTimeout(res, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      res();
    }, { once: true });
  });
}

/**
 * Automatically builds the client bundle if src/client/ is newer than dist/index.html.
 */
export function ensureFreshBuild(repoRoot) {
  const distHtml = path.join(repoRoot, 'dist', 'index.html');
  const srcClientDir = path.join(repoRoot, 'src', 'client');
  let needsBuild = !fs.existsSync(distHtml);

  if (!needsBuild && fs.existsSync(srcClientDir)) {
    const distMtime = fs.statSync(distHtml).mtimeMs;
    function checkDirNewer(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const ent of entries) {
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) {
          if (checkDirNewer(full)) return true;
        } else if (/\.(tsx?|css)$/.test(ent.name)) {
          if (fs.statSync(full).mtimeMs > distMtime) return true;
        }
      }
      return false;
    }
    needsBuild = checkDirNewer(srcClientDir);
  }

  if (needsBuild) {
    console.log('🔄 Source files in src/client/ are newer than dist/ (or dist missing). Running "npm run build" to ensure fresh bundle...');
    execSync('npm run build', { stdio: 'inherit' });
  }
}

/**
 * Ensures preview server is running on the given port; starts one if needed.
 */
export async function ensurePreviewServer(port, globalSignal) {
  const isServerRunning = await checkPortOpen(port, globalSignal);
  if (isServerRunning) {
    return null;
  }

  console.log(`📡 Preview server not detected on port ${port}. Launching 'npx --yes vite preview --port ${port}'...`);
  const previewProc = spawn('cmd.exe', ['/c', `npx --yes vite preview --port ${port}`], {
    stdio: 'ignore',
    detached: false,
  });

  let opened = false;
  for (let i = 0; i < 20; i++) {
    if (globalSignal.aborted) break;
    await sleep(500, globalSignal);
    if (await checkPortOpen(port, globalSignal)) {
      opened = true;
      break;
    }
  }

  if (!opened) {
    killProcessTree(previewProc);
    throw new Error(`Failed to start vite preview server on port ${port}.`);
  }

  return previewProc;
}
