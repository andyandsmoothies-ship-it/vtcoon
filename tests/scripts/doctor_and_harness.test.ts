import { describe, it, expect } from 'vitest';
import net from 'node:net';
import path from 'node:path';
import { checkSystemEnvironment } from '../../scripts/doctor/system_env.mjs';
import { verifyDynamicPort0, checkNetworkPorts } from '../../scripts/doctor/network_ports.mjs';
import { checkWorkspaceIntegrity } from '../../scripts/doctor/workspace_integrity.mjs';
import { checkGraphicsContext } from '../../scripts/doctor/graphics_context.mjs';
import { runDoctor } from '../../scripts/doctor.mjs';
import { ManagedProcess, answersPort } from '../../scripts/harness/managed_process.mjs';
import {
  StallGuard,
  createStallGuard,
  filterEphemeralState,
  detectStateProgress,
  DEFAULT_EPHEMERAL_KEYS
} from '../../scripts/sentinel/stall_guard.mjs';

describe('SDLC Toolchain & Harness Contract Tests (e2e Learning Phase 2)', () => {
  describe('Pre-flight Environment Readiness Doctor', () => {
    it('[TC-E2E.01/MSS] checkSystemEnvironment verifies Node.js >= 18 and OS details', () => {
      const results = checkSystemEnvironment();
      expect(Array.isArray(results)).toBe(true);
      const nodeCheck = results.find((r) => r.name === 'Node.js Runtime');
      expect(nodeCheck).toBeDefined();
      expect(['PASS', 'WARN']).toContain(nodeCheck?.status);
    });

    it('[TC-E2E.02/MSS] verifyDynamicPort0 successfully binds an ephemeral port', async () => {
      const res = await verifyDynamicPort0();
      expect(res.success).toBe(true);
      expect(typeof res.allocatedPort).toBe('number');
      expect(res.allocatedPort).toBeGreaterThan(0);
    });

    it('[TC-E2E.03/MSS] checkWorkspaceIntegrity verifies core directories and SSOT', () => {
      const results = checkWorkspaceIntegrity(process.cwd());
      const dirCheck = results.find((r) => r.name === 'Essential Directories');
      const ssotCheck = results.find((r) => r.name === 'SSOT Feature Map');
      expect(dirCheck?.status).toBe('PASS');
      expect(ssotCheck?.status).toBe('PASS');
    });

    it('[TC-E2E.04/MSS] checkGraphicsContext verifies centralized R3F fixture seam', () => {
      const results = checkGraphicsContext(process.cwd());
      const r3fCheck = results.find((r) => r.name === 'R3F Graphics Fixture Seam');
      expect(r3fCheck?.status).toBe('PASS');
    });

    it('[TC-E2E.05/MSS] runDoctor facade executes without errors and reports healthy status', async () => {
      const isHealthy = await runDoctor(process.cwd());
      expect(isHealthy).toBe(true);
    });
  });

  describe('ManagedProcess & Process Lifecycle Harness', () => {
    it('[TC-E2E.06/MSS] answersPort distinguishes open vs closed TCP ports', async () => {
      const server = net.createServer();
      await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
      const address = server.address() as net.AddressInfo;
      const port = address.port;

      const openAnswer = await answersPort(port, '127.0.0.1', 200);
      expect(openAnswer).toBe(true);

      await new Promise<void>((resolve) => server.close(() => resolve()));

      const closedAnswer = await answersPort(port, '127.0.0.1', 100);
      expect(closedAnswer).toBe(false);
    });

    it('[TC-E2E.07/MSS] ManagedProcess spawns, tracks PID, and stops cleanly', async () => {
      const proc = new ManagedProcess('test-worker', {
        executable: process.execPath,
        args: ['-e', 'setInterval(() => {}, 1000)'],
        startupTimeout: 5000,
        shutdownTimeout: 3000
      });

      await proc.start();
      expect(proc.spawned).toBe(true);
      expect(typeof proc.processId).toBe('number');

      await proc.stop();
      expect(proc.processId).toBeUndefined();
    });

    it('[TC-E2E.08/A1] ManagedProcess preflight triggers APP_ALREADY_RUNNING when port is in use', async () => {
      const server = net.createServer();
      await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
      const address = server.address() as net.AddressInfo;
      const occupiedPort = address.port;

      const collidingProc = new ManagedProcess(
        'colliding-service',
        {
          executable: process.execPath,
          args: ['-e', 'process.exit(0)'],
          reuseExisting: false
        },
        { readyPort: occupiedPort }
      );

      await expect(collidingProc.start()).rejects.toThrow(/APP_ALREADY_RUNNING/);

      await new Promise<void>((resolve) => server.close(() => resolve()));
    });

    it('[TC-E2E.09/A2] ManagedProcess reuses existing process when reuseExisting is true', async () => {
      const server = net.createServer();
      await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
      const address = server.address() as net.AddressInfo;
      const occupiedPort = address.port;

      const reusingProc = new ManagedProcess(
        'reusable-service',
        {
          executable: process.execPath,
          args: ['-e', 'process.exit(0)'],
          reuseExisting: true
        },
        { readyPort: occupiedPort }
      );

      await reusingProc.start();
      expect(reusingProc.isReused).toBe(true);
      expect(reusingProc.spawned).toBe(false);

      await reusingProc.stop(); // Stops gracefully without killing the external server
      await new Promise<void>((resolve) => server.close(() => resolve()));
    });
  });

  describe('Timer-Aware StallGuard for Probes & Sentinel', () => {
    it('[TC-E2E.10/MSS] filterEphemeralState strips clock, timestamp, and tick counters', () => {
      const stateWithTicks = {
        phase: 'ACTION_WAIT',
        activePlayer: 0,
        turnTimeRemaining: 29,
        timestamp: 1728800000,
        ticks: 42
      };

      const fingerprint = filterEphemeralState(stateWithTicks);
      expect(fingerprint).toContain('ACTION_WAIT');
      expect(fingerprint).not.toContain('turnTimeRemaining');
      expect(fingerprint).not.toContain('timestamp');
      expect(fingerprint).not.toContain('ticks');
    });

    it('[TC-E2E.11/MSS] detectStateProgress ignores clock countdown ticks and detects real changes', () => {
      const t1 = { phase: 'ROLL', balance: 1000, turnTimeRemaining: 30, timestamp: 100 };
      const t2 = { phase: 'ROLL', balance: 1000, turnTimeRemaining: 29, timestamp: 101 };
      expect(detectStateProgress(t1, t2)).toBe(false);

      const t3 = { phase: 'ROLL', balance: 1200, turnTimeRemaining: 28, timestamp: 102 };
      expect(detectStateProgress(t2, t3)).toBe(true);
    });

    it('[TC-E2E.12a/MSS] StallGuard detects stall when 3 consecutive actions fail or yield zero progress', () => {
      const guard = createStallGuard({ maxStalledSteps: 3 });
      guard.recordStep({ action: 'ROLL_DICE', error: 'NOT_YOUR_TURN', phase: 'ACTION_WAIT' });
      guard.recordStep({ action: 'ROLL_DICE', error: 'NOT_YOUR_TURN', phase: 'ACTION_WAIT' });
      expect(guard.isStalled()).toBe(false);

      const stalled = guard.recordStep({ action: 'ROLL_DICE', error: 'NOT_YOUR_TURN', phase: 'ACTION_WAIT' });
      expect(stalled).toBe(true);
      expect(guard.isStalled()).toBe(true);
    });

    it('[TC-E2E.12b/MSS] StallGuard formats comprehensive diagnostic context in stall summary', () => {
      const guard = createStallGuard({ maxStalledSteps: 2 });
      guard.recordStep({ action: 'ROLL_DICE', error: 'NOT_YOUR_TURN', phase: 'ACTION_WAIT' });
      guard.recordStep({ action: 'ROLL_DICE', error: 'NOT_YOUR_TURN', phase: 'ACTION_WAIT' });

      const summary = guard.getStallSummary();
      expect(summary).toContain('🚨 STALL DETECTED');
      expect(summary).toContain('NOT_YOUR_TURN');
    });

    it('[TC-E2E.13/A1] StallGuard resets history and stall flag upon reset()', () => {
      const guard = new StallGuard({ maxStalledSteps: 2 });
      guard.recordStep({ action: 'BUY', error: 'INSUFFICIENT_FUNDS' });
      guard.recordStep({ action: 'BUY', error: 'INSUFFICIENT_FUNDS' });
      expect(guard.isStalled()).toBe(true);

      guard.reset();
      expect(guard.isStalled()).toBe(false);
      expect(guard.history.length).toBe(0);
    });
  });
});
