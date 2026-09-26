// [TRADE-UI-AUDIT] Capture real TradeModal screenshots across Desktop & Mobile
import { spawn, type ChildProcess } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';

const BROWSER_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\8cca9836-b0ff-4bc7-a6c2-e675742fa525';

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

class TradeAuditCapturer {
  private browserProc: ChildProcess | null = null;
  private ws: WebSocket | null = null;
  private messageId = 1;
  private pendingRequests = new Map<number, { resolve: (v: any) => void; reject: (e: any) => void }>();
  private tempDir: string;
  private port = 9345;

  constructor() {
    const sysTemp = process.env.TEMP || 'C:\\Users\\HP\\AppData\\Local\\Temp';
    this.tempDir = path.join(sysTemp, `edge_trade_audit_${Date.now()}`);
  }

  async start(width = 1280, height = 800, targetUrl = 'http://localhost:4173/'): Promise<void> {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
    if (!fs.existsSync(ARTIFACT_DIR)) {
      fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
    }

    this.browserProc = spawn(
      BROWSER_PATH,
      [
        '--headless=new',
        `--remote-debugging-port=${this.port}`,
        `--window-size=${width},${height}`,
        '--no-first-run',
        '--no-default-browser-check',
        `--user-data-dir=${this.tempDir}`,
        '--enable-webgl',
        '--ignore-gpu-blocklist',
        targetUrl,
      ],
      { stdio: 'ignore' },
    );

    let debuggerUrl: string | null = null;
    for (let i = 0; i < 40; i++) {
      await sleep(400);
      try {
        const list = await fetchJson<Array<{ type: string; url: string; webSocketDebuggerUrl?: string }>>(
          `http://127.0.0.1:${this.port}/json/list`,
        );
        const page = list.find((t) => t.type === 'page' && t.url.includes('4173'));
        if (page?.webSocketDebuggerUrl) {
          debuggerUrl = page.webSocketDebuggerUrl;
          break;
        }
      } catch {
        // Retry
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
          const { resolve, reject } = this.pendingRequests.get(msg.id)!;
          this.pendingRequests.delete(msg.id);
          if (msg.error) {
            reject(new Error(msg.error.message));
          } else {
            resolve(msg.result);
          }
        }
      } catch {
        // ignore
      }
    });

    await this.send('Page.enable');
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

  async setViewport(width: number, height: number): Promise<void> {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 2,
      mobile: width < 600,
    });
  }

  async takeScreenshot(filename: string): Promise<string> {
    const res = await this.send('Page.captureScreenshot', {
      format: 'jpeg',
      quality: 90,
    });
    const artifactPath = path.join(ARTIFACT_DIR, filename);
    const buf = Buffer.from(res.data, 'base64');
    fs.writeFileSync(artifactPath, buf);
    console.log(`[TradeAudit] Saved: ${artifactPath}`);
    return artifactPath;
  }

  async close(): Promise<void> {
    try {
      this.ws?.close();
    } catch {}
    try {
      this.browserProc?.kill();
    } catch {}
    await sleep(500);
    try {
      fs.rmSync(this.tempDir, { recursive: true, force: true });
    } catch {}
  }
}

async function run(): Promise<void> {
  const capturer = new TradeAuditCapturer();
  try {
    console.log('[TradeAudit] Launching headless Edge on port 4173...');
    await capturer.start(1280, 800);
    await sleep(2500);

    // Bơm trạng thái phòng và mở Trade Modal
    console.log('[TradeAudit] Initializing lobbyStore (gameStarted: true)...');
    await capturer.eval(`
      (() => {
        if (window.__lobbyStore) {
          window.__lobbyStore.getState().initLobby('VT999', 'p1', true, 'Đại Gia Sài Gòn');
          window.__lobbyStore.setState({ roomCode: 'VT999', isJoining: false, gameStarted: true });
        }
      })()
    `);
    await sleep(1500);

    console.log('[TradeAudit] Injecting mock state and opening TradeModal...');
    await capturer.eval(`
      (() => {
        const game = window.__gameStore.getState();
        const infoMap = {
          p1: {
            id: 'p1',
            name: 'Đại Gia Sài Gòn',
            balance: 14500,
            tokenColor: '#38BDF8',
            ownedProperties: [1, 3, 5],
            mortgagedProperties: [5],
            bankrupt: false,
            isBot: false,
          },
          bot_nam: {
            id: 'bot_nam',
            name: 'Bot Nam',
            balance: 22000,
            tokenColor: '#F59E0B',
            ownedProperties: [6, 8, 9],
            mortgagedProperties: [],
            bankrupt: false,
            isBot: true,
            personality: 'aggressive',
          },
          bot_lan: {
            id: 'bot_lan',
            name: 'Bot Lan',
            balance: 18000,
            tokenColor: '#EC4899',
            ownedProperties: [11, 13],
            mortgagedProperties: [],
            bankrupt: false,
            isBot: true,
            personality: 'conservative',
          }
        };

        game.setPlayersInfo(infoMap);
        game.setCurrentTurnPlayerId('p1');
        game.setRoundInfo(4, 30);
        game.setTurnTimeRemaining(45);
        game.setTurnPhase('WaitingRoll');
        game.setHasRolledThisTurn(false);

        // Mở Trade Modal
        game.openModal('trade', {
          targetPlayerId: 'bot_nam',
          offeredProperties: [1],
          requestedProperties: [6],
          cashOffer: 500,
          cashRequest: 0,
        });
      })()
    `);
    await sleep(1500);

    // 1. Desktop 1280x800
    console.log('[TradeAudit] Capturing Desktop 1280x800...');
    await capturer.setViewport(1280, 800);
    await sleep(600);
    await capturer.takeScreenshot('trade_ui_audit_desktop.jpg');

    // 2. Mobile 390x844 (Tab Bạn Đưa)
    console.log('[TradeAudit] Capturing Mobile 390x844 (Tab Bạn Đưa)...');
    await capturer.setViewport(390, 844);
    await sleep(600);
    await capturer.takeScreenshot('trade_ui_audit_mobile_390_mine.jpg');

    // 3. Mobile 390x844 (Tab Đối Tác)
    console.log('[TradeAudit] Switching to Partner Tab and Capturing...');
    await capturer.eval(`
      (() => {
        const tabs = document.querySelectorAll('[data-testid="trade-mobile-segmented-tabs"] button');
        if (tabs && tabs[1]) {
          tabs[1].click();
        }
      })()
    `);
    await sleep(600);
    await capturer.takeScreenshot('trade_ui_audit_mobile_390_partner.jpg');

    // 4. Mobile 360x740 (Smallest Mobile Standard)
    console.log('[TradeAudit] Capturing Mobile 360x740...');
    await capturer.setViewport(360, 740);
    await sleep(600);
    await capturer.takeScreenshot('trade_ui_audit_mobile_360.jpg');

    console.log('[TradeAudit] Done! All screenshots captured successfully.');
  } catch (err) {
    console.error('[TradeAudit] Error:', err);
  } finally {
    await capturer.close();
  }
}

run();
