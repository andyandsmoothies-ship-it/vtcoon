// Comprehensive Audit Capturer for Auction Modal across Viewports & Lifecycle States
import { spawn, type ChildProcess } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';

const BROWSER_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const SCREENSHOT_DIR = path.resolve(process.cwd(), 'docs/reports/uat/screenshots/auction_audit');
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

class VerificationCapturer {
  private browserProc: ChildProcess | null = null;
  private ws: WebSocket | null = null;
  private messageId = 1;
  private pendingRequests = new Map<number, { resolve: (v: any) => void; reject: (e: any) => void }>();
  private tempDir: string;
  private port = 9336;

  constructor() {
    const sysTemp = process.env.TEMP || 'C:\\Users\\HP\\AppData\\Local\\Temp';
    this.tempDir = path.join(sysTemp, `edge_vtcoon_auc_audit_${Date.now()}`);
  }

  async start(targetUrl = 'http://localhost:4173/'): Promise<void> {
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
          const req = this.pendingRequests.get(msg.id)!;
          this.pendingRequests.delete(msg.id);
          if (msg.error) req.reject(msg.error);
          else req.resolve(msg.result);
        }
      } catch {
        // ignore
      }
    });

    await this.sendCmd('Page.enable');
    await this.sendCmd('Runtime.enable');
    await this.sendCmd('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await sleep(2000);
  }

  private sendCmd(method: string, params: Record<string, any> = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        return reject(new Error('WebSocket not connected'));
      }
      const id = this.messageId++;
      this.pendingRequests.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(code: string): Promise<any> {
    return this.sendCmd('Runtime.evaluate', { expression: code, returnByValue: true });
  }

  async setViewport(width: number, height: number, mobile: boolean): Promise<void> {
    await this.sendCmd('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: mobile ? 2 : 1,
      mobile,
    });
    await sleep(1000);
  }

  async takeScreenshot(filename: string): Promise<string> {
    const shot = await this.sendCmd('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    const buf = Buffer.from(shot.data, 'base64');
    const outPath = path.join(SCREENSHOT_DIR, filename);
    fs.writeFileSync(outPath, buf);
    const artifactPath = path.join(ARTIFACT_DIR, filename);
    fs.writeFileSync(artifactPath, buf);
    console.log(`[Capture] Saved: ${filename}`);
    return outPath;
  }

  async close(): Promise<void> {
    try {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.close();
      }
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
    console.log('[Audit] Starting headless Edge capturer on Mobile 390x844...');
    await capturer.start();

    console.log('[Audit] Initializing game state...');
    await capturer.eval(`
      (() => {
        if (window.__lobbyStore) {
          window.__lobbyStore.getState().initLobby('VT_AUC', 'p1', true, 'Bạn');
          window.__lobbyStore.setState({ roomCode: 'VT_AUC', isJoining: false, gameStarted: true });
        }
      })()
    `);
    await sleep(1500);

    await capturer.eval(`
      (() => {
        if (!window.__gameStore) return;
        const game = window.__gameStore.getState();
        const infoMap = {
          p1: {
            id: 'p1',
            name: 'Bạn',
            balance: 6500,
            tokenColor: '#EF4444',
            ownedProperties: [18], // Thừa Thiên Huế
            bankrupt: false,
            isBot: false,
          },
          bot_2: {
            id: 'bot_2',
            name: 'Tỷ Phú Hà Thành',
            balance: 7800,
            tokenColor: '#3B82F6',
            ownedProperties: [1, 3],
            bankrupt: false,
            isBot: true,
          },
          bot_3: {
            id: 'bot_3',
            name: 'Thương Gia Đà Nẵng',
            balance: 4500,
            tokenColor: '#10B981',
            ownedProperties: [8],
            bankrupt: false,
            isBot: true,
          }
        };

        game.setPlayersInfo(infoMap);
        game.setCurrentTurnPlayerId('bot_2');
        game.setRoundInfo(3, 30);
        game.setTurnTimeRemaining(18);
      })()
    `);
    await sleep(1000);

    // 1. Mobile 390x844 - Active Bidding
    console.log('[Audit] 1. Opening Mobile 390x844 Active Bidding...');
    await capturer.eval(`
      (() => {
        if (!window.__gameStore) return;
        const game = window.__gameStore.getState();
        game.openModal('auction', {
          cellIndex: 16,
          currentBid: 2250,
          startingBid: 1800,
          highestBidderId: 'bot_2',
          bidderName: 'Tỷ Phú Hà Thành',
          timeRemaining: 18,
          hasPassed: false,
          myId: 'p1',
          myBalance: 6500,
          playersInfo: game.playersInfo,
          levelMap: game.levelMap,
        });
      })()
    `);
    await sleep(1000);
    await capturer.takeScreenshot('audit_auction_mobile_390_active.jpg');

    // 2. Mobile 360x740 (Small device stress test)
    console.log('[Audit] 2. Setting Viewport to Mobile 360x740...');
    await capturer.setViewport(360, 740, true);
    await sleep(1000);
    await capturer.takeScreenshot('audit_auction_mobile_360_active.jpg');

    // 3. Desktop 1280x800 - Active Bidding
    console.log('[Audit] 3. Setting Viewport to Desktop 1280x800...');
    await capturer.setViewport(1280, 800, false);
    await sleep(1000);
    await capturer.takeScreenshot('audit_auction_desktop_active.jpg');

    // 4. Desktop 1280x800 - Foreclosure State
    console.log('[Audit] 4. Foreclosure on Desktop 1280x800...');
    await capturer.eval(`
      (() => {
        if (!window.__gameStore) return;
        const game = window.__gameStore.getState();
        game.openModal('auction', {
          cellIndex: 16,
          currentBid: 1260,
          startingBid: 1260,
          highestBidderId: null,
          timeRemaining: 15,
          hasPassed: false,
          isForeclosure: true,
          insolvencyPlayerId: 'bot_3',
          myId: 'p1',
          myBalance: 6500,
          playersInfo: game.playersInfo,
          levelMap: game.levelMap,
        });
      })()
    `);
    await sleep(1000);
    await capturer.takeScreenshot('audit_auction_desktop_foreclosure.jpg');

    // 5. Mobile 390x844 - Foreclosure State
    console.log('[Audit] 5. Foreclosure on Mobile 390x844...');
    await capturer.setViewport(390, 844, true);
    await sleep(1000);
    await capturer.takeScreenshot('audit_auction_mobile_390_foreclosure.jpg');

    // 6. Mobile 360x740 - Foreclosure State (Stress Test)
    console.log('[Audit] 6. Foreclosure on Mobile 360x740 (Small device stress test)...');
    await capturer.setViewport(360, 740, true);
    await sleep(1000);
    await capturer.takeScreenshot('audit_auction_mobile_360_foreclosure.jpg');

    // 7. Mobile 390x844 - Concluded Hammer Fall State
    console.log('[Audit] 7. Concluded Hammer Fall State on Mobile 390x844...');
    await capturer.setViewport(390, 844, true);
    await capturer.eval(`
      (() => {
        if (!window.__gameStore) return;
        const game = window.__gameStore.getState();
        game.openModal('auction', {
          cellIndex: 16,
          currentBid: 2450,
          startingBid: 1800,
          highestBidderId: 'bot_2',
          bidderName: 'Tỷ Phú Hà Thành',
          timeRemaining: 0,
          isConcluded: true,
          winnerId: 'bot_2',
          finalPrice: 2450,
          myId: 'p1',
          myBalance: 6500,
          playersInfo: game.playersInfo,
          levelMap: game.levelMap,
        });
      })()
    `);
    await sleep(1000);
    await capturer.takeScreenshot('audit_auction_mobile_390_concluded.jpg');

    console.log('[Audit] All audit screenshots captured successfully!');
  } catch (err) {
    console.error('[Audit] Error:', err);
  } finally {
    await capturer.close();
  }
}

main().catch(console.error);
