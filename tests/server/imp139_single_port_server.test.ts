// [TC-139.1/MSS][TC-139.2/MSS][TC-139.3/MSS][TC-139.4/MSS][TC-139.5/MSS]
// [TC-139.6/MSS][TC-139.7/MSS][TC-139.8/A1][TC-139.9/MSS][TC-139.10/MSS]
// [TC-139.11/MSS][TC-139.12/MSS][TC-139.13/MSS][TC-139.14/MSS][TC-139.15/MSS]
// [TC-139.16a/MSS][TC-139.16b/MSS][TC-139.16c/MSS][TC-139.17/A1][TC-139.18/A2][TC-139.19/A3]
// [UC-OPS-001][UC-OPS-002][UC-GAME-001] Single-Port Architecture (HTTP + WebSocket Upgrade) Contract Tests
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { WebSocket } from 'ws';
import { startServer, validateEnv } from '../../src/server/index.js';
import type { RunningServer } from '../../src/server/index.js';
import type { WsServerMessage } from '../../src/server/network/network_types.js';

// Dedicated port allocation to eliminate any port collision across test suites
const SINGLE_BIND_PORT = 4380;
const SHARED_SINGLE_PORT = 4381;
const DUAL_HTTP_PORT = 4382;
const DUAL_WSS_PORT = 4383;
const DISPOSAL_PORT_1 = 4384;
const DISPOSAL_PORT_2 = 4385;
const DISPOSAL_PORT_3 = 4386;
const DISPOSAL_PORT_4 = 4387;
const DISPOSAL_PORT_5 = 4388;

const savedEnv: NodeJS.ProcessEnv = { ...process.env };

function openSocket(port: number, subpath = ''): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}${subpath}`);
    const timer = setTimeout(() => {
      cleanup();
      try {
        ws.terminate();
      } catch {}
      reject(new Error(`Timeout connecting to ws://127.0.0.1:${port}${subpath}`));
    }, 3000);

    const onOpen = (): void => {
      cleanup();
      resolve(ws);
    };
    const onError = (err: Error): void => {
      cleanup();
      reject(err);
    };
    const cleanup = (): void => {
      clearTimeout(timer);
      ws.off('open', onOpen);
      ws.off('error', onError);
    };
    ws.on('open', onOpen);
    ws.on('error', onError);
  });
}

function collectMessages(socket: WebSocket, count: number, timeoutMs = 3000): Promise<WsServerMessage[]> {
  return new Promise((resolve, reject) => {
    const received: WsServerMessage[] = [];
    const timer = setTimeout(() => {
      socket.off('message', onMsg);
      reject(new Error(`Timeout waiting for ${count} messages, only received ${received.length}`));
    }, timeoutMs);

    const onMsg = (data: Buffer | string): void => {
      try {
        const parsed = JSON.parse(data.toString()) as WsServerMessage;
        received.push(parsed);
        if (received.length >= count) {
          clearTimeout(timer);
          socket.off('message', onMsg);
          resolve(received);
        }
      } catch (err) {
        clearTimeout(timer);
        socket.off('message', onMsg);
        reject(err);
      }
    };
    socket.on('message', onMsg);
  });
}

describe('[Facet 1: Boundary & Range] Single-Port Binding & Backward Compatibility', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    process.env.WSS_PORT = '3001';
    process.env.GRACE_PERIOD_MS = '5000';
  });

  afterAll(() => {
    process.env = { ...savedEnv };
  });

  it('[TC-139.1/MSS][UC-OPS-001] startServer with port === wssPort (Single-Port mode) binds a single port without EADDRINUSE error', async () => {
    const server = await startServer({
      port: SINGLE_BIND_PORT,
      wssPort: SINGLE_BIND_PORT,
      gracePeriodMs: 500,
    });
    try {
      expect(server.httpServer.listening).toBe(true);
      expect(server.wssServer.isRunning).toBe(true);
    } finally {
      await server.close();
    }
  });

  it('[TC-139.5/MSS][UC-OPS-001] Dual-port mode (port !== wssPort) continues to work without regression', async () => {
    const dualServer = await startServer({
      port: DUAL_HTTP_PORT,
      wssPort: DUAL_WSS_PORT,
      gracePeriodMs: 500,
    });
    try {
      const res = await fetch(`http://127.0.0.1:${DUAL_HTTP_PORT}/health`);
      expect(res.status).toBe(200);
      const ws = await openSocket(DUAL_WSS_PORT);
      expect(ws.readyState).toBe(WebSocket.OPEN);
      ws.close();
    } finally {
      await dualServer.close();
    }
  });
});

describe('Single-Port Operational Services (Facet 1 HTTP & Facet 2 Upgrade & Facet 4 Edge)', () => {
  let sharedServer: RunningServer | null = null;
  let startError: Error | null = null;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.WSS_PORT = '3001';
    process.env.GRACE_PERIOD_MS = '5000';
    try {
      sharedServer = await startServer({
        port: SHARED_SINGLE_PORT,
        wssPort: SHARED_SINGLE_PORT,
        gracePeriodMs: 500,
      });
    } catch (err) {
      startError = err as Error;
    }
  });

  afterAll(async () => {
    if (sharedServer) {
      await sharedServer.close();
    }
    process.env = { ...savedEnv };
  });

  // Facet 1: HTTP on Single-Port
  it('[TC-139.2/MSS][UC-OPS-001] HTTP GET /health returns 200 OK with status: ok on single port', async () => {
    expect(startError).toBeNull();
    const res = await fetch(`http://127.0.0.1:${SHARED_SINGLE_PORT}/health`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe('ok');
  });

  it('[TC-139.3/MSS][UC-OPS-001] HTTP GET / serves index.html or SPA asset on single port', async () => {
    expect(startError).toBeNull();
    const res = await fetch(`http://127.0.0.1:${SHARED_SINGLE_PORT}/`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
  });

  it('[TC-139.4/MSS][UC-OPS-001] HTTP HEAD /health returns 200 OK with no body', async () => {
    expect(startError).toBeNull();
    const res = await fetch(`http://127.0.0.1:${SHARED_SINGLE_PORT}/health`, { method: 'HEAD' });
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text.length).toBe(0);
  });

  // Facet 2: Reactivity / Network Upgrade
  it('[TC-139.6/MSS][UC-GAME-001] WebSocket connection to single port receives SESSION_INIT message', async () => {
    expect(startError).toBeNull();
    const ws = await openSocket(SHARED_SINGLE_PORT);
    try {
      const msgsPromise = collectMessages(ws, 2);
      ws.send(JSON.stringify({ type: 'CREATE_ROOM', playerId: 'qa-tester-init' }));
      const msgs = await msgsPromise;
      const sessionInit = msgs.find((m) => m.type === 'SESSION_INIT');
      expect(sessionInit).toBeDefined();
      if (sessionInit?.type === 'SESSION_INIT') {
        expect(sessionInit.playerId).toBe('qa-tester-init');
        expect(sessionInit.reconnectToken).toBeTruthy();
      }
    } finally {
      ws.close();
    }
  });

  it('[TC-139.7/MSS][UC-GAME-001] WebSocket connection can send CREATE_ROOM message and receive ROOM_CREATED', async () => {
    expect(startError).toBeNull();
    const ws = await openSocket(SHARED_SINGLE_PORT);
    try {
      const msgsPromise = collectMessages(ws, 1);
      ws.send(JSON.stringify({ type: 'CREATE_ROOM', playerId: 'qa-tester-creator' }));
      const msgs = await msgsPromise;
      const roomCreated = msgs.find((m) => m.type === 'ROOM_CREATED');
      expect(roomCreated).toBeDefined();
      if (roomCreated?.type === 'ROOM_CREATED') {
        expect(roomCreated.roomCode).toMatch(/^[A-Z0-9]{6}$/);
      }
    } finally {
      ws.close();
    }
  });

  it('[TC-139.8/A1][UC-GAME-001] WebSocket connection with invalid room code receives ERROR message with ROOM_NOT_FOUND', async () => {
    expect(startError).toBeNull();
    const ws = await openSocket(SHARED_SINGLE_PORT);
    try {
      const msgsPromise = collectMessages(ws, 1);
      ws.send(JSON.stringify({ type: 'JOIN_ROOM', roomCode: 'INV999', playerId: 'qa-tester-joiner' }));
      const [msg] = await msgsPromise;
      expect(msg).toBeDefined();
      expect(msg?.type).toBe('ERROR');
      if (msg?.type === 'ERROR') {
        expect(msg.reasonCode).toBe('ROOM_NOT_FOUND');
      }
    } finally {
      ws.close();
    }
  });

  it('[TC-139.9/MSS][UC-GAME-001] Multiple concurrent WebSocket connections to single port are accepted simultaneously', async () => {
    expect(startError).toBeNull();
    const [ws1, ws2, ws3] = await Promise.all([
      openSocket(SHARED_SINGLE_PORT),
      openSocket(SHARED_SINGLE_PORT),
      openSocket(SHARED_SINGLE_PORT),
    ]);
    try {
      expect(ws1.readyState).toBe(WebSocket.OPEN);
      expect(ws2.readyState).toBe(WebSocket.OPEN);
      expect(ws3.readyState).toBe(WebSocket.OPEN);
    } finally {
      ws1.close();
      ws2.close();
      ws3.close();
    }
  });

  it('[TC-139.10/MSS][UC-GAME-001] WebSocket ping/pong heartbeat works on single port', async () => {
    expect(startError).toBeNull();
    const ws = await openSocket(SHARED_SINGLE_PORT);
    try {
      const pongPromise = new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Pong frame timed out')), 3000);
        ws.once('pong', () => {
          clearTimeout(timer);
          resolve();
        });
      });
      ws.ping();
      await pongPromise;
      expect(ws.readyState).toBe(WebSocket.OPEN);
    } finally {
      ws.close();
    }
  });

  // Facet 4 Edge Cases on Running Single-Port Server
  it('[TC-139.18/A2][UC-GAME-001] WebSocket connection to an unknown path on single port is handled or rejected safely', async () => {
    expect(startError).toBeNull();
    let handledSafely = false;
    try {
      const ws = await openSocket(SHARED_SINGLE_PORT, '/nonexistent_route');
      handledSafely = ws.readyState === WebSocket.OPEN;
      ws.close();
    } catch {
      handledSafely = true;
    }
    expect(handledSafely).toBe(true);
    const healthRes = await fetch(`http://127.0.0.1:${SHARED_SINGLE_PORT}/health`);
    expect(healthRes.status).toBe(200);
  });

  it('[TC-139.19/A3][UC-GAME-001] Abruptly terminating client socket does not crash single-port server', async () => {
    expect(startError).toBeNull();
    const ws = await openSocket(SHARED_SINGLE_PORT);
    ws.terminate();
    await new Promise((r) => setTimeout(r, 100));
    const healthRes = await fetch(`http://127.0.0.1:${SHARED_SINGLE_PORT}/health`);
    expect(healthRes.status).toBe(200);
    const body = (await healthRes.json()) as { status: string };
    expect(body.status).toBe('ok');
  });
});

describe('[Facet 3: Disposal / Lifecycle] Single-Port Termination & Port Reclamation', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    process.env.WSS_PORT = '3001';
    process.env.GRACE_PERIOD_MS = '5000';
  });

  afterAll(() => {
    process.env = { ...savedEnv };
  });

  it('[TC-139.11/MSS][UC-OPS-002] server.close() in single-port mode closes WebSocket connections cleanly without hanging', async () => {
    const server = await startServer({
      port: DISPOSAL_PORT_1,
      wssPort: DISPOSAL_PORT_1,
      gracePeriodMs: 500,
    });
    try {
      const ws = await openSocket(DISPOSAL_PORT_1);
      const closePromise = new Promise<number>((resolve) => {
        ws.once('close', (code) => resolve(code));
      });
      await server.close();
      const code = await closePromise;
      expect([1000, 1001, 1005, 1006]).toContain(code);
      expect(ws.readyState).toBe(WebSocket.CLOSED);
    } finally {
      try {
        await server.close();
      } catch {}
    }
  });

  it('[TC-139.12/MSS][UC-OPS-002] server.close() terminates the HTTP server and releases the port', async () => {
    const server = await startServer({
      port: DISPOSAL_PORT_2,
      wssPort: DISPOSAL_PORT_2,
      gracePeriodMs: 500,
    });
    await server.close();
    expect(server.httpServer.listening).toBe(false);
    expect(server.wssServer.isRunning).toBe(false);
  });

  it('[TC-139.13/MSS][UC-OPS-002] After server.close(), new HTTP connection to the port is rejected (ECONNREFUSED)', async () => {
    const server = await startServer({
      port: DISPOSAL_PORT_3,
      wssPort: DISPOSAL_PORT_3,
      gracePeriodMs: 500,
    });
    await server.close();
    let connRefused = false;
    try {
      await fetch(`http://127.0.0.1:${DISPOSAL_PORT_3}/health`);
    } catch (err: any) {
      connRefused = err.cause?.code === 'ECONNREFUSED' || /fetch failed/i.test(err.message ?? '');
    }
    expect(connRefused).toBe(true);
  });

  it('[TC-139.14/MSS][UC-OPS-002] After server.close(), new WebSocket connection to the port is rejected (ECONNREFUSED)', async () => {
    const server = await startServer({
      port: DISPOSAL_PORT_4,
      wssPort: DISPOSAL_PORT_4,
      gracePeriodMs: 500,
    });
    await server.close();
    let wsRefused = false;
    try {
      await openSocket(DISPOSAL_PORT_4);
    } catch (err: any) {
      wsRefused = err.code === 'ECONNREFUSED' || /ECONNREFUSED|closed/i.test(err.message ?? '');
    }
    expect(wsRefused).toBe(true);
  });

  it('[TC-139.15/MSS][UC-OPS-002] Calling server.close() when no clients are connected resolves cleanly within 1s', async () => {
    const server = await startServer({
      port: DISPOSAL_PORT_5,
      wssPort: DISPOSAL_PORT_5,
      gracePeriodMs: 500,
    });
    const start = Date.now();
    await server.close();
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(1000);
  });
});

describe('[Facet 4: Error Defense / Edge Cases] Environment & Parameter Guarding', () => {
  afterAll(() => {
    process.env = { ...savedEnv };
  });

  it('[TC-139.16a/MSS][UC-OPS-001] validateEnv enforces valid numeric value for WSS_PORT', () => {
    process.env.NODE_ENV = 'production';
    process.env.WSS_PORT = 'invalid_port';
    process.env.GRACE_PERIOD_MS = '60000';
    expect(() => validateEnv()).toThrow(/WSS_PORT must be a valid number/);
  });

  it('[TC-139.16b/MSS][UC-OPS-001] validateEnv enforces valid numeric value for PORT', () => {
    process.env.NODE_ENV = 'production';
    process.env.WSS_PORT = '3001';
    process.env.PORT = 'nan_port';
    process.env.GRACE_PERIOD_MS = '60000';
    expect(() => validateEnv()).toThrow(/PORT must be a valid number/);
  });

  it('[TC-139.16c/MSS][UC-OPS-001] validateEnv enforces valid numeric value for GRACE_PERIOD_MS', () => {
    process.env.NODE_ENV = 'production';
    process.env.WSS_PORT = '3001';
    delete process.env.PORT;
    process.env.GRACE_PERIOD_MS = 'not_a_number';
    expect(() => validateEnv()).toThrow(/GRACE_PERIOD_MS must be a valid number/);
  });

  it('[TC-139.17/A1][UC-OPS-001] validateEnv throws error when NODE_ENV is missing', () => {
    delete process.env.NODE_ENV;
    process.env.WSS_PORT = '3001';
    process.env.GRACE_PERIOD_MS = '60000';
    expect(() => validateEnv()).toThrow(/NODE_ENV is required/);
  });
});
