// [IMP-199] Verification Screenshot Capturer
// Captures real in-game screenshots via Microsoft Edge CDP across Desktop 1920x1080, Laptop 1280x800, Mobile 390x844, and Mobile 360x740
import { spawn, type ChildProcess } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';

const BROWSER_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\f9891d7e-39d1-495e-a45a-eb937dfe0df4';
const REPORT_DIR = path.resolve(process.cwd(), 'docs/reports/uat/screenshots/imp199');

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
  private port = 9338;

  constructor() {
    const sysTemp = process.env.TEMP || 'C:\\Users\\HP\\AppData\\Local\\Temp';
    this.tempDir = path.join(sysTemp, `edge_vtcoon_imp199_${Date.now()}`);
  }

  async start(width = 1920, height = 1080, targetUrl = 'http://localhost:4173/'): Promise<void> {
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
    console.log('[IMP-199] Starting Edge in Headless mode...');
    await capturer.start(1920, 1080, 'http://localhost:4173/');
    console.log('[IMP-199] Connected. Waiting 2s for initial hydration...');
    await sleep(2000);

    console.log('[IMP-199] Initializing game lobby state (gameStarted: true)...');
    await capturer.eval(`
      (() => {
        if (window.__lobbyStore) {
          window.__lobbyStore.getState().initLobby('VT199', 'p1', true, 'Đại Gia Sài Gòn');
          window.__lobbyStore.setState({ roomCode: 'VT199', isJoining: false, gameStarted: true });
        }
      })()
    `);
    await sleep(2000);

    // Bật Game Demo State
    console.log('[IMP-199] Injecting Game State...');
    await capturer.eval(`
      (() => {
        if (!window.__gameStore) {
          console.error('[IMP-199] __gameStore not found on window!');
          return;
        }
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
        game.setInAudit(true, 2); // Kích hoạt Audit Notice Chip
      })()
    `);
    await sleep(1500);

    // Shot 1: Desktop 1920x1080 - Notice Chip (Trạm kiểm toán) trên ActionDock không bị clip
    console.log('[IMP-199] Capturing Shot 1: Desktop 1920x1080 Audit Notice Chip...');
    await capturer.setViewport(1920, 1080);
    await sleep(800);
    await capturer.takeScreenshot('imp199_01_desktop_1920_notice_chip.jpg');

    // Shot 2: Desktop 1920x1080 - Bot Pacing Chip
    console.log('[IMP-199] Injecting Bot Pacing and Capturing Shot 2...');
    await capturer.eval(`
      (() => {
        const game = window.__gameStore.getState();
        game.setInAudit(false, 0);
        game.setCurrentTurnPlayerId('bot_nam');
        game.setBotPacing({
          botId: 'bot_nam',
          botName: 'Bot Nam',
          isThinking: true,
          actionDescription: 'đang tính toán chiến lược...',
        });
      })()
    `);
    await sleep(1000);
    await capturer.takeScreenshot('imp199_02_desktop_1920_bot_pacing_chip.jpg');

    // Shot 3: Desktop 1920x1080 - Activity Feed Drawer Open with Backdrop z-20 & TopBar z-30
    console.log('[IMP-199] Opening Activity Feed Sidebar and Capturing Shot 3...');
    await capturer.eval(`
      (() => {
        const btn = document.querySelector('[data-testid="activity-feed-toggle-btn"]');
        if (btn) (btn as HTMLElement).click();
      })()
    `);
    await sleep(1000);
    await capturer.takeScreenshot('imp199_03_desktop_1920_activity_drawer.jpg');

    // Đóng drawer lại
    await capturer.eval(`
      (() => {
        const backdrop = document.querySelector('[data-testid="activity-feed-backdrop"]');
        if (backdrop) (backdrop as HTMLElement).click();
      })()
    `);
    await sleep(800);

    // Shot 4: Laptop 1280x800 - 2 Market Cards & Floating Numbers (top-36)
    console.log('[IMP-199] Injecting 2 Market Events and Capturing Shot 4: Laptop 1280x800...');
    await capturer.eval(`
      (() => {
        const game = window.__gameStore.getState();
        game.setCurrentTurnPlayerId('p1');
        game.setBotPacing(null);
        game.setInAudit(false, 0);
        game.setActiveMarketCards(['MC_TECH_BOOM', 'MC_INFLATION_SURGE']);
        game.addFloatingText({
          id: 'ft_1',
          text: '+2.000',
          type: 'gain',
          position: [0, 0, 0],
          timestamp: Date.now(),
        });
      })()
    `);
    await capturer.setViewport(1280, 800);
    await sleep(1000);
    await capturer.takeScreenshot('imp199_04_desktop_1280_floating_and_ticker.jpg');

    // Shot 5: Mobile 390x844 - ActionDock Notice Chip
    console.log('[IMP-199] Capturing Shot 5: Mobile 390x844 ActionDock Notice Chip...');
    await capturer.eval(`
      (() => {
        const game = window.__gameStore.getState();
        game.setInAudit(true, 1);
      })()
    `);
    await capturer.setViewport(390, 844);
    await sleep(800);
    await capturer.takeScreenshot('imp199_05_mobile_390_notice_chip.jpg');

    // Shot 6: Mobile 360x740 - Camera Pills Vertical Clearance (bottom-28)
    console.log('[IMP-199] Capturing Shot 6: Mobile 360x740 Camera Clearance...');
    await capturer.setViewport(360, 740);
    await sleep(800);
    await capturer.takeScreenshot('imp199_06_mobile_360_camera_clearance.jpg');

    console.log('[IMP-199] All verification captures completed successfully!');
  } catch (err) {
    console.error('[IMP-199] Error during capture:', err);
  } finally {
    await capturer.close();
  }
}

main().catch(console.error);
