// [IMP-196] Verification Screenshot Capturer for Golden Sunset & Vibrant Neon Night
// Captures real in-game screenshots via Microsoft Edge CDP on Mobile Viewport (390x844)
import { spawn, type ChildProcess } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';

const BROWSER_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const SCREENSHOT_DIR = path.resolve(process.cwd(), 'docs/reports/uat/screenshots/imp196');

function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

function fetchJson<T>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

class VerificationCapturer {
  private browserProc: ChildProcess | null = null;
  private ws: WebSocket | null = null;
  private messageId = 1;
  private pendingRequests = new Map<number, { resolve: (v: any) => void; reject: (e: any) => void }>();
  private tempDir: string;
  private port = 9336;

  constructor() {
    const sysTemp = process.env.TEMP || 'C:\\Users\\HP\\AppData\\Local\\Temp';
    this.tempDir = path.join(sysTemp, `edge_vtcoon_imp196_${Date.now()}`);
  }

  async start(targetUrl = 'http://127.0.0.1:4173/'): Promise<void> {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
    if (!fs.existsSync(SCREENSHOT_DIR)) {
      fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    }

    this.browserProc = spawn(
      BROWSER_PATH,
      [
        '--headless=new',
        `--remote-debugging-port=${this.port}`,
        '--window-size=390,844',
        '--no-first-run',
        '--no-default-browser-check',
        `--user-data-dir=${this.tempDir}`,
        '--enable-webgl',
        '--ignore-gpu-blocklist',
        targetUrl,
      ],
      { stdio: 'ignore' }
    );

    let debuggerUrl: string | null = null;
    for (let i = 0; i < 40; i++) {
      await sleep(400);
      try {
        const list = await fetchJson<Array<{ type: string; url: string; webSocketDebuggerUrl?: string }>>(
          `http://127.0.0.1:${this.port}/json/list`
        );
        const page = list.find((t) => t.type === 'page' && t.url.includes('4173'));
        if (page?.webSocketDebuggerUrl) {
          debuggerUrl = page.webSocketDebuggerUrl;
          break;
        }
      } catch {
        // retry
      }
    }

    if (!debuggerUrl) {
      throw new Error(`Could not connect to Edge debugger on port ${this.port}`);
    }

    this.ws = new WebSocket(debuggerUrl);
    await new Promise((res, rej) => {
      this.ws?.on('open', res);
      this.ws?.on('error', rej);
    });

    this.ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.id && this.pendingRequests.has(msg.id)) {
          const req = this.pendingRequests.get(msg.id)!;
          this.pendingRequests.delete(msg.id);
          if (msg.error) {
            req.reject(new Error(msg.error.message || 'CDP Error'));
          } else {
            req.resolve(msg.result);
          }
        }
      } catch (err) {
        console.error('WS parse error:', err);
      }
    });

    await this.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await this.send('Page.enable');
    await this.send('DOM.enable');
    await this.send('Runtime.enable');
  }

  send(method: string, params: Record<string, any> = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = this.messageId++;
      this.pendingRequests.set(id, { resolve, reject });
      this.ws?.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression: string): Promise<any> {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res?.result?.value;
  }

  async takeScreenshot(filename: string): Promise<string> {
    const res = await this.send('Page.captureScreenshot', {
      format: 'jpeg',
      quality: 90,
    });
    const filePath = path.join(SCREENSHOT_DIR, filename);
    fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
    console.log(`[Capture] Saved: ${filePath} (${fs.statSync(filePath).size} bytes)`);
    return filePath;
  }

  async close(): Promise<void> {
    try {
      this.ws?.close();
      if (this.browserProc) {
        this.browserProc.kill('SIGKILL');
      }
      if (fs.existsSync(this.tempDir)) {
        fs.rmSync(this.tempDir, { recursive: true, force: true });
      }
    } catch {
      // ignore
    }
  }
}

async function main() {
  const capturer = new VerificationCapturer();
  try {
    console.log('[IMP-196] Starting headless Edge capturer on Mobile 390x844...');
    await capturer.start();

    console.log('[IMP-196] Waiting for app stores and entering in-game session...');
    await capturer.eval(`
      new Promise((resolve) => {
        const interval = setInterval(() => {
          if (window.__lobbyStore && window.__gameStore && window.__environmentStore) {
            clearInterval(interval);
            window.__lobbyStore.getState().initLobby('VT196', 'p1', true, 'Đại Gia Sài Gòn');
            window.__lobbyStore.setState({ roomCode: 'VT196', isJoining: false, gameStarted: true });
            resolve(true);
          }
        }, 100);
      })
    `);
    await sleep(2500);

    // Setup realistic in-game state
    await capturer.eval(`
      (() => {
        if (!window.__gameStore) return;
        const game = window.__gameStore.getState();
        const infoMap = {
          p1: {
            id: 'p1',
            name: 'Đại Gia Sài Gòn',
            balance: 6500,
            tokenColor: '#EF4444',
            ownedProperties: [1, 3],
            bankrupt: false,
            isBot: false,
          },
          bot_2: {
            id: 'bot_2',
            name: 'Tỷ Phú Hà Thành',
            balance: 4200,
            tokenColor: '#3B82F6',
            ownedProperties: [6],
            bankrupt: false,
            isBot: true,
          }
        };

        game.setPlayersInfo(infoMap);
        game.setCurrentTurnPlayerId('p1');
        game.setRoundInfo(5, 30);
        game.setTurnTimeRemaining(42);
        game.setTurnPhase('WaitingRoll');
        game.setHasRolledThisTurn(false);
      })()
    `);
    await sleep(2000);

    // 1. Capture Day
    console.log('[IMP-196] Setting mode to DAY...');
    await capturer.eval(`
      (() => {
        if (window.__environmentStore) {
          window.__environmentStore.getState().setMode('day');
        }
      })()
    `);
    await sleep(3000);
    console.log('[IMP-196] Capturing Shot 1: Day lighting...');
    await capturer.takeScreenshot('imp196_01_day.jpg');

    // 2. Capture Sunset Golden Hour
    console.log('[IMP-196] Setting mode to SUNSET (Golden Hour)...');
    await capturer.eval(`
      (() => {
        if (window.__environmentStore) {
          window.__environmentStore.getState().setMode('sunset');
        }
      })()
    `);
    await sleep(3000);
    console.log('[IMP-196] Capturing Shot 2: Sunset Golden Hour...');
    await capturer.takeScreenshot('imp196_02_sunset_golden_hour.jpg');

    // 3. Capture Night Neon Metropolis
    console.log('[IMP-196] Setting mode to NIGHT (Neon Metropolis)...');
    await capturer.eval(`
      (() => {
        if (window.__environmentStore) {
          window.__environmentStore.getState().setMode('night');
        }
      })()
    `);
    await sleep(3000);
    console.log('[IMP-196] Capturing Shot 3: Night Neon Metropolis...');
    await capturer.takeScreenshot('imp196_03_night_neon_metropolis.jpg');

    console.log('[IMP-196] All 3 lighting verification screenshots captured successfully!');
  } catch (err) {
    console.error('[IMP-196] Error during capture:', err);
  } finally {
    await capturer.close();
  }
}

main().catch(console.error);
