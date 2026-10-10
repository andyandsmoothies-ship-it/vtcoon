import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { sleep } from './preview_server_manager.mjs';

export const BROWSER_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  process.env.CHROME_BIN,
  process.env.EDGE_BIN,
].filter(Boolean);

/**
 * Discovers Chrome or Edge executable on system.
 */
export function findBrowser() {
  for (const p of BROWSER_CANDIDATES) {
    if (p && fs.existsSync(p)) return p;
  }
  return null;
}

/**
 * Spawns headless browser with remote debugging enabled.
 */
export function launchBrowser(browserPath, debugPort, url) {
  return spawn(browserPath, [
    '--headless=new',
    `--remote-debugging-port=${debugPort}`,
    '--window-size=1280,800',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--no-first-run',
    '--disable-extensions',
    '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    url,
  ], { stdio: 'ignore' });
}

/**
 * Establishes CDP WebSocket connection and returns send dispatcher.
 */
export async function connectCdp(debugPort, port, globalSignal) {
  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    if (globalSignal.aborted) break;
    await sleep(400, globalSignal);
    try {
      const timeout = AbortSignal.timeout(1000);
      const combined = AbortSignal.any([timeout, globalSignal]);
      const res = await fetch(`http://127.0.0.1:${debugPort}/json/list`, { signal: combined });
      const pages = await res.json();
      const target = pages.find((p) => p.url && p.url.includes(String(port))) || pages[0];
      if (target?.webSocketDebuggerUrl) {
        wsUrl = target.webSocketDebuggerUrl;
        break;
      }
    } catch {
      // Wait for CDP endpoint
    }
  }

  if (!wsUrl) {
    throw new Error(`Could not connect to CDP WebSocket on port ${debugPort}`);
  }

  const { WebSocket } = await import('ws');
  const ws = new WebSocket(wsUrl);

  await new Promise((resolve, reject) => {
    ws.on('open', resolve);
    ws.on('error', reject);
  });

  let msgId = 1;
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = msgId++;
      const handler = (raw) => {
        try {
          const data = JSON.parse(raw.toString());
          if (data.id === id) {
            ws.removeListener('message', handler);
            if (data.error) reject(data.error);
            else resolve(data.result);
          }
        } catch (err) {
          reject(err);
        }
      };
      ws.on('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });

  return { ws, send };
}

/**
 * Pins Date.now() and Date constructor to deterministic baseline for reproducible visual captures.
 */
export async function applyClockPinning(send) {
  const CLOCK_PIN_SCRIPT = `
    (() => {
      const T = 1770000000000, P = performance.now(), N = Date;
      const now = () => Math.floor(T + performance.now() - P);
      const D = new Proxy(N, {
        construct(t, a, nt) { return Reflect.construct(N, a.length ? a : [now()], nt); },
        apply() { return new N(now()).toString(); },
        get(t, k, r) { return k === "now" ? now : Reflect.get(t, k, r); }
      });
      try {
        Object.defineProperty(globalThis, "Date", { value: D, writable: true, configurable: true, enumerable: false });
        Object.defineProperty(N.prototype, "constructor", { value: D, writable: true, configurable: true, enumerable: false });
      } catch (_) {}
    })();
  `;
  try {
    await send('Page.addScriptToEvaluateOnNewDocument', { source: CLOCK_PIN_SCRIPT });
    await send('Runtime.evaluate', { expression: CLOCK_PIN_SCRIPT });
  } catch (_) {
    // Continue if browser environment restricts evaluateOnNewDocument
  }
}
