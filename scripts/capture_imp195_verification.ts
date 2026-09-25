// [IMP-195] Verification Screenshot Capturer
// Captures real in-game screenshots via Microsoft Edge CDP across Mobile 360x740, Mobile 390x844, and Desktop 1280x800
import { spawn, type ChildProcess } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';

const BROWSER_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\8cca9836-b0ff-4bc7-a6c2-e675742fa525';
const REPORT_DIR = path.resolve(process.cwd(), 'docs/reports/uat/screenshots/imp195');

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
    this.tempDir = path.join(sysTemp, `edge_vtcoon_imp195_${Date.now()}`);
  }

  async start(width = 390, height = 844, targetUrl = 'http://localhost:4173/'): Promise<void> {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
    if (!fs.existsSync(REPORT_DIR)) {
      fs.mkdirSync(REPORT_DIR, { recursive: true });
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
      width,
      height,
      deviceScaleFactor: 2,
      mobile: width < 600,
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
    const reportPath = path.join(REPORT_DIR, filename);
    const artifactPath = path.join(ARTIFACT_DIR, filename);
    const buf = Buffer.from(res.data, 'base64');
    fs.writeFileSync(reportPath, buf);
    fs.writeFileSync(artifactPath, buf);
    console.log(`[Capture] Saved: ${artifactPath} (${buf.length} bytes)`);
    return artifactPath;
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
    console.log('[IMP-195] Launching Edge CDP Capturer...');
    await capturer.start(360, 740);

    console.log('[IMP-195] Initializing game lobby state...');
    await capturer.eval(`
      (() => {
        if (window.__lobbyStore) {
          window.__lobbyStore.getState().initLobby('VT195', 'p1', true, 'Đại Gia Sài Gòn');
          window.__lobbyStore.setState({ roomCode: 'VT195', isJoining: false, gameStarted: true });
        }
      })()
    `);
    await sleep(2000);

    // Setup realistic state: players, market modifiers, floating toast, and bot pending trade offer
    await capturer.eval(`
      (() => {
        if (!window.__gameStore) return;
        const game = window.__gameStore.getState();
        const infoMap = {
          p1: {
            id: 'p1',
            name: 'Đại Gia Sài Gòn',
            balance: 14500,
            tokenColor: '#38BDF8',
            ownedProperties: [1, 3, 5],
            bankrupt: false,
            isBot: false,
          },
          bot_nam: {
            id: 'bot_nam',
            name: 'Bot Nam',
            balance: 22000,
            tokenColor: '#F59E0B',
            ownedProperties: [6, 8, 9],
            bankrupt: false,
            isBot: true,
          },
          bot_lan: {
            id: 'bot_lan',
            name: 'Bot Lan',
            balance: 18000,
            tokenColor: '#EC4899',
            ownedProperties: [11, 13],
            bankrupt: false,
            isBot: true,
          }
        };

        game.setPlayersInfo(infoMap);
        game.setCurrentTurnPlayerId('p1');
        game.setRoundInfo(4, 30);
        game.setTurnTimeRemaining(38);
        game.setTurnPhase('WaitingRoll');
        game.setHasRolledThisTurn(false);

        // 1. Dải sự kiện thị trường vĩ mô (2 sự kiện)
        game.setActiveModifiers([
          { type: 'MC_PUBLIC_INVEST', remainingRounds: 2 },
          { type: 'MC_URBAN_PLANNING', remainingRounds: 1 }
        ]);

        // 2. Thông báo tài chính tự nhiên (Floating Badge ở top-28)
        game.addFloatingText({
          id: 'ft_rent_toast',
          text: '-400 Tr.',
          playerId: 'p1',
          type: 'penalty',
          actionType: 'rent_pay',
          targetPlayerName: 'Bot Nam',
          cellIndex: 6,
          title: 'Trả cước dừng chân tại Bình Dương',
          timestamp: Date.now(),
        });

        // 3. Đề xuất giao dịch Bot 1-chạm inline gắn trên ActionDock
        game.setPendingTradeOffer({
          offerId: 'bot_deal_99',
          cellIndex: 5,
          price: 3200,
          buyerId: 'bot_nam',
          sellerId: 'p1',
          expiresAt: Date.now() + 14000,
        });
      })()
    `);
    await sleep(1500);

    // Shot 1: Mobile 360x740 (Màn hình nhỏ nhất - kiểm tra Zero-Collision và Glanceable HUD)
    console.log('[IMP-195] Capturing Shot 1: Mobile 360x740...');
    await capturer.setViewport(360, 740);
    await sleep(800);
    await capturer.takeScreenshot('audit_hud_mobile_360_stacked_events.jpg');

    // Shot 2: Mobile 390x844 (iPhone standard)
    console.log('[IMP-195] Capturing Shot 2: Mobile 390x844...');
    await capturer.setViewport(390, 844);
    await sleep(800);
    await capturer.takeScreenshot('audit_hud_mobile_390_stacked_events.jpg');

    // Shot 3: Desktop 1280x800
    console.log('[IMP-195] Capturing Shot 3: Desktop 1280x800...');
    await capturer.setViewport(1280, 800);
    await sleep(800);
    await capturer.takeScreenshot('audit_hud_desktop_stacked_events.jpg');

    console.log('[IMP-195] All verification captures completed successfully!');
  } catch (err) {
    console.error('[IMP-195] Error during capture:', err);
  } finally {
    await capturer.close();
  }
}

main().catch(console.error);
