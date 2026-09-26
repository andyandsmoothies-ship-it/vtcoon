// [IMP-201] Verification Screenshot Capturer
// Captures real in-game screenshots via Microsoft Edge CDP across Mobile 390x844, Mobile 360x780, and Desktop 1920x1080
import { spawn, type ChildProcess } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';

const BROWSER_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\f9891d7e-39d1-495e-a45a-eb937dfe0df4';
const REPORT_DIR = path.resolve(process.cwd(), 'docs/reports/uat/screenshots/imp201');

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
  private port = 9346;

  constructor() {
    const sysTemp = process.env.TEMP || 'C:\\Users\\HP\\AppData\\Local\\Temp';
    this.tempDir = path.join(sysTemp, `edge_vtcoon_imp201_${Date.now()}`);
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
      { stdio: 'ignore' }
    );

    let debuggerUrl: string | null = null;
    for (let i = 0; i < 30; i++) {
      await sleep(300);
      try {
        const versionData = await fetchJson<{ webSocketDebuggerUrl?: string }>(
          `http://127.0.0.1:${this.port}/json/version`
        );
        if (versionData.webSocketDebuggerUrl) {
          debuggerUrl = versionData.webSocketDebuggerUrl;
          break;
        }
      } catch {}
    }

    if (!debuggerUrl) {
      throw new Error('Failed to connect to Microsoft Edge CDP');
    }

    const pages = await fetchJson<Array<{ id: string; webSocketDebuggerUrl: string; type: string }>>(
      `http://127.0.0.1:${this.port}/json/list`
    );
    const targetPage = pages.find((p) => p.type === 'page') || pages[0];
    if (!targetPage?.webSocketDebuggerUrl) {
      throw new Error('No target page found in browser');
    }

    this.ws = new WebSocket(targetPage.webSocketDebuggerUrl);
    await new Promise<void>((resolve, reject) => {
      this.ws!.on('open', resolve);
      this.ws!.on('error', reject);
    });

    this.ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.id && this.pendingRequests.has(msg.id)) {
          const { resolve, reject } = this.pendingRequests.get(msg.id)!;
          this.pendingRequests.delete(msg.id);
          if (msg.error) {
            reject(new Error(msg.error.message || 'CDP Error'));
          } else {
            resolve(msg.result);
          }
        }
      } catch (e) {
        console.error('CDP message parse error:', e);
      }
    });

    await this.send('Page.enable');
    await this.send('DOM.enable');
    await this.send('Runtime.enable');
  }

  send<T = any>(method: string, params: Record<string, any> = {}): Promise<T> {
    const id = this.messageId++;
    return new Promise<T>((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      this.ws!.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression: string): Promise<any> {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result?.value;
  }

  async setViewport(width: number, height: number): Promise<void> {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 600,
    });
    await sleep(300);
  }

  async takeScreenshot(filename: string): Promise<void> {
    const res = await this.send<{ data: string }>('Page.captureScreenshot', {
      format: 'jpeg',
      quality: 90,
    });
    const buffer = Buffer.from(res.data, 'base64');
    const localReportPath = path.join(REPORT_DIR, filename);
    const artifactPath = path.join(ARTIFACT_DIR, filename);

    fs.writeFileSync(localReportPath, buffer);
    fs.writeFileSync(artifactPath, buffer);
    console.log(`[IMP-201] Saved screenshot: ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
  }

  async close(): Promise<void> {
    if (this.ws) {
      try { this.ws.close(); } catch {}
      this.ws = null;
    }
    if (this.browserProc) {
      this.browserProc.kill();
      this.browserProc = null;
    }
    await sleep(500);
    try {
      if (fs.existsSync(this.tempDir)) {
        fs.rmSync(this.tempDir, { recursive: true, force: true });
      }
    } catch {}
  }
}

async function main() {
  const capturer = new VerificationCapturer();
  try {
    console.log('[IMP-201] Starting Verification Capturer for IMP-201...');
    await capturer.start(390, 844, 'http://localhost:4173/');
    await sleep(3000); // Wait for preview server

    // 1. Setup in-game mock state matching actual scenario
    await capturer.eval(`
      (() => {
        if (window.__lobbyStore) {
          window.__lobbyStore.getState().initLobby('VT_TEST', 'p1', true, 'Đại Gia Sài Gòn');
          window.__lobbyStore.setState({ roomCode: 'VT_TEST', isJoining: false, gameStarted: true, myPlayerId: 'p1' });
        }
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
            name: 'Bot Tỷ Phú',
            balance: 28000,
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
        game.setRoundInfo(3, 30);
        game.setTurnTimeRemaining(28);
        game.setTurnPhase('ActionPhase');
        game.setHasRolledThisTurn(true);

        // Activity store with 95 unread messages to reproduce exact user scenario
        if (window.__activityStore) {
          window.__activityStore.setState({
            unreadCount: 95,
            isActivityFeedOpen: false,
          });
        }

        // Add a Floating transaction badge (Rent pay toast)
        game.addFloatingText({
          id: 'rent-toast-imp201',
          text: '-1.500 Tr.',
          type: 'penalty',
          playerId: 'p1',
          actionType: 'rent_pay',
          title: 'Trả thuê Bến Bạch Đằng',
          targetPlayerId: 'bot_nam',
          targetPlayerName: 'Bot Tỷ Phú',
          cellIndex: 3,
          timestamp: Date.now(),
        });
      })()
    `);
    await sleep(1500);

    // Shot 1: Mobile 390x844 - TopBar Zero Overflow, Unread Badge 95 Neat Anchor, Floating Toast ✕ Close Button, Player Edge Tab
    console.log('[IMP-201] Capturing Shot 1: Mobile 390x844 TopBar & Toast...');
    await capturer.setViewport(390, 844);
    await sleep(800);
    await capturer.takeScreenshot('imp201_01_mobile_390_topbar_and_toast.jpg');

    // Shot 2: Mobile 390x844 - Player HUD Expanded with pt-10 clearance
    console.log('[IMP-201] Capturing Shot 2: Mobile 390x844 Expanded Player HUD...');
    await capturer.eval(`
      (() => {
        const toggleBtn = document.querySelector('[data-testid="toggle-player-hud-btn"]');
        if (toggleBtn) (toggleBtn as HTMLButtonElement).click();
      })()
    `);
    await sleep(800);
    await capturer.takeScreenshot('imp201_02_mobile_390_expanded_player_hud.jpg');

    // Collapse player HUD back
    await capturer.eval(`
      (() => {
        const toggleBtn = document.querySelector('[data-testid="toggle-player-hud-btn"]');
        if (toggleBtn) (toggleBtn as HTMLButtonElement).click();
      })()
    `);
    await sleep(400);

    // Shot 3: Mobile 360x780 - Compact 360px TopBar (Verify leave-room-button 🚪 zero clipping)
    console.log('[IMP-201] Capturing Shot 3: Mobile 360x780 Compact TopBar...');
    await capturer.setViewport(360, 780);
    await sleep(800);
    await capturer.takeScreenshot('imp201_03_mobile_360_topbar_tight.jpg');

    // Shot 4: Desktop 1920x1080 - Desktop Layout (Weather ☀️ visible, full player cards)
    console.log('[IMP-201] Capturing Shot 4: Desktop 1920x1080 Full Overview...');
    await capturer.setViewport(1920, 1080);
    await sleep(800);
    await capturer.takeScreenshot('imp201_04_desktop_1920_overview.jpg');

    console.log('[IMP-201] All verification captures completed successfully!');
  } catch (err) {
    console.error('[IMP-201] Error during capture:', err);
    process.exit(1);
  } finally {
    await capturer.close();
  }
}

main();
