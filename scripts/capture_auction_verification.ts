// Verification Screenshot Capturer for Auction Modal & Title Deed Modal
import { spawn, type ChildProcess } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';

const BROWSER_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const SCREENSHOT_DIR = path.resolve(process.cwd(), 'docs/reports/uat/screenshots/imp193');
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
  private port = 9335;

  constructor() {
    const sysTemp = process.env.TEMP || 'C:\\Users\\HP\\AppData\\Local\\Temp';
    this.tempDir = path.join(sysTemp, `edge_vtcoon_auc_${Date.now()}`);
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

  async takeScreenshot(filename: string): Promise<string> {
    const shot = await this.sendCmd('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    const buf = Buffer.from(shot.data, 'base64');
    const outPath = path.join(SCREENSHOT_DIR, filename);
    fs.writeFileSync(outPath, buf);
    const artifactPath = path.join(ARTIFACT_DIR, filename);
    fs.writeFileSync(artifactPath, buf);
    console.log(`[Capture] Saved: ${outPath} & ${artifactPath} (${buf.length} bytes)`);
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
    console.log('[Verification] Starting headless Edge capturer on Mobile 390x844...');
    await capturer.start();

    console.log('[Verification] Initializing game state...');
    await capturer.eval(`
      (() => {
        if (window.__lobbyStore) {
          window.__lobbyStore.getState().initLobby('VT_AUC', 'p1', true, 'Bạn');
          window.__lobbyStore.setState({ roomCode: 'VT_AUC', isJoining: false, gameStarted: true });
        }
      })()
    `);
    await sleep(2000);

    // Setup players to reproduce exact context from user's screenshot
    // Cell 16: Bình Định (Quy Nhơn) - Nhóm Cam
    // P1 (Bạn) owns Thừa Thiên Huế (18), bot_2 owns nothing in orange, Đà Nẵng (19) is unowned
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
        game.setTurnTimeRemaining(19);
      })()
    `);
    await sleep(1000);

    // SHOT 1: Exact reproduction of user's scenario (Withdrawn / hasPassed: true)
    console.log('[Verification] Opening Auction Modal (Withdrawn State)...');
    await capturer.eval(`
      (() => {
        if (!window.__gameStore) return;
        const game = window.__gameStore.getState();
        game.openModal('auction', {
          cellIndex: 16, // Bình Định (Quy Nhơn) - Orange Group
          currentBid: 2250,
          startingBid: 1800,
          highestBidderId: 'bot_2',
          bidderName: 'Tỷ Phú Hà Thành',
          timeRemaining: 19,
          hasPassed: true,
          myId: 'p1',
          myBalance: 6500,
          playersInfo: game.playersInfo,
          levelMap: game.levelMap,
        });
      })()
    `);
    await sleep(1500);

    console.log('[Verification] Capturing Shot 1: Auction Modal Withdrawn...');
    await capturer.takeScreenshot('auction_modal_withdrawn_verified.jpg');

    // SHOT 2: Active Bidding State (hasPassed: false)
    console.log('[Verification] Switching to Active Bidding State...');
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
          timeRemaining: 19,
          hasPassed: false,
          myId: 'p1',
          myBalance: 6500,
          playersInfo: game.playersInfo,
          levelMap: game.levelMap,
        });
      })()
    `);
    await sleep(1000);

    console.log('[Verification] Capturing Shot 2: Auction Modal Active Bidding...');
    await capturer.takeScreenshot('auction_modal_active_bidding_verified.jpg');

    // SHOT 3: Title Deed Modal (canBuy: true)
    console.log('[Verification] Opening Title Deed Modal...');
    await capturer.eval(`
      (() => {
        if (!window.__gameStore) return;
        const game = window.__gameStore.getState();
        game.openModal('deed', {
          cellIndex: 16,
          canBuy: true,
          isOwned: false,
          buyerBalance: 6500,
          buyerId: 'p1',
          allPlayers: game.playersInfo,
        });
      })()
    `);
    await sleep(1000);

    console.log('[Verification] Capturing Shot 3: Title Deed Modal...');
    await capturer.takeScreenshot('title_deed_modal_verified.jpg');

    console.log('[Verification] All screenshots captured successfully!');
  } catch (err) {
    console.error('[Verification] Error during capture:', err);
  } finally {
    await capturer.close();
  }
}

main().catch(console.error);
