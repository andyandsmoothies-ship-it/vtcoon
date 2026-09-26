// [IMP-196-BUGFIX] Verification Screenshot Capturer for Dice Score Badge Entry Visibility
// Verifies that DiceScoreBadge is hidden upon game entry (WaitingRoll) across Mobile & Desktop
import { spawn, type ChildProcess } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';

const BROWSER_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\f9891d7e-39d1-495e-a45a-eb937dfe0df4';
const REPORT_DIR = path.resolve(process.cwd(), 'docs/reports/uat/screenshots/dice_badge_fix');

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
  private port = 9340;

  constructor() {
    const sysTemp = process.env.TEMP || 'C:\\Users\\HP\\AppData\\Local\\Temp';
    this.tempDir = path.join(sysTemp, `edge_vtcoon_dice_badge_${Date.now()}`);
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
        '--disable-gpu',
        '--enable-unsafe-swiftshader',
        targetUrl,
      ],
      { stdio: 'ignore' }
    );

    let targets: any[] = [];
    for (let i = 0; i < 30; i++) {
      await sleep(500);
      try {
        targets = await fetchJson<any[]>(`http://127.0.0.1:${this.port}/json`);
        if (targets.length > 0) break;
      } catch {
        // waiting for port
      }
    }

    const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
    if (!pageTarget || !pageTarget.webSocketDebuggerUrl) {
      throw new Error('Failed to find CDP target');
    }

    this.ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      this.ws!.on('open', resolve);
      this.ws!.on('error', reject);
    });

    this.ws!.on('message', (data: string) => {
      try {
        const msg = JSON.parse(data);
        if (msg.id && this.pendingRequests.has(msg.id)) {
          const req = this.pendingRequests.get(msg.id)!;
          this.pendingRequests.delete(msg.id);
          if (msg.error) req.reject(msg.error);
          else req.resolve(msg.result);
        }
      } catch {
        // ignore parse error
      }
    });

    await this.send('Page.enable');
    await this.send('DOM.enable');
  }

  private send(method: string, params: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = this.messageId++;
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
    return res?.result?.value;
  }

  async setViewport(width: number, height: number): Promise<void> {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 2,
      mobile: width < 768,
    });
  }

  async takeScreenshot(filename: string): Promise<string> {
    const res = await this.send('Page.captureScreenshot', {
      format: 'jpeg',
      quality: 88,
      fromSurface: true,
    });
    const buffer = Buffer.from(res.data, 'base64');
    const artifactPath = path.join(ARTIFACT_DIR, filename);
    const reportPath = path.join(REPORT_DIR, filename);

    fs.writeFileSync(artifactPath, buffer);
    fs.writeFileSync(reportPath, buffer);
    console.log(`[CAPTURED] Saved -> ${filename} (${buffer.length} bytes)`);
    return artifactPath;
  }

  async close(): Promise<void> {
    if (this.ws) {
      try { this.ws.close(); } catch {}
    }
    if (this.browserProc) {
      this.browserProc.kill();
    }
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
    console.log('[DiceBadgeFix] Starting Verification Capturer for Dice Score Badge Entry Visibility...');
    await capturer.start(390, 844, 'http://localhost:4173/');
    await sleep(3000); // Đợi Vite preview server load

    // Thiết lập trạng thái game khởi đầu: Vừa vào phòng (WaitingRoll), chưa quay gì
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
            balance: 15000,
            tokenColor: '#38BDF8',
            ownedProperties: [],
            bankrupt: false,
            isBot: false,
          },
          bot_nam: {
            id: 'bot_nam',
            name: 'Bot Tỷ Phú',
            balance: 20000,
            tokenColor: '#F59E0B',
            ownedProperties: [6],
            bankrupt: false,
            isBot: true,
          }
        };

        game.setPlayersInfo(infoMap);
        game.setCurrentTurnPlayerId('p1');
        game.setRoundInfo(1, 30);
        game.setTurnTimeRemaining(60);
        game.setTurnPhase('WaitingRoll');
        game.setHasRolledThisTurn(false);
      })()
    `);
    await sleep(1500);

    // Shot 1: Mobile 390x844 - Vừa vào game, màn hình chờ đổ xúc xắc (Tuyệt đối KHÔNG hiện 1 + 1 = 2 đôi)
    console.log('[DiceBadgeFix] Capturing Shot 1: Mobile 390x844 Fresh Game Entry (WaitingRoll)...');
    await capturer.setViewport(390, 844);
    await sleep(800);
    await capturer.takeScreenshot('dice_badge_fix_01_mobile_390_waiting_roll.jpg');

    // Shot 2: Mobile 360x780 - Mobile màn hình hẹp, WaitingRoll (Tuyệt đối KHÔNG hiện 1 + 1 = 2 đôi)
    console.log('[DiceBadgeFix] Capturing Shot 2: Mobile 360x780 Fresh Game Entry (WaitingRoll)...');
    await capturer.setViewport(360, 780);
    await sleep(800);
    await capturer.takeScreenshot('dice_badge_fix_02_mobile_360_waiting_roll.jpg');

    // Shot 3: Desktop 1920x1080 - Desktop view, WaitingRoll
    console.log('[DiceBadgeFix] Capturing Shot 3: Desktop 1920x1080 Fresh Game Entry (WaitingRoll)...');
    await capturer.setViewport(1920, 1080);
    await sleep(800);
    await capturer.takeScreenshot('dice_badge_fix_03_desktop_1920_waiting_roll.jpg');

    // Shot 4: Sau khi gieo xúc xắc thực sự (ActionPhase: [3, 4]), huy hiệu điểm số hiển thị chuẩn xác
    console.log('[DiceBadgeFix] Simulating dice roll and capturing Shot 4...');
    await capturer.eval(`
      (() => {
        const game = window.__gameStore.getState();
        game.setDice([3, 4]);
        game.setHasRolledThisTurn(true);
        game.setTurnPhase('ActionPhase');
      })()
    `);
    await capturer.setViewport(390, 844);
    await sleep(800);
    await capturer.takeScreenshot('dice_badge_fix_04_mobile_390_rolled_action_phase.jpg');

    console.log('[DiceBadgeFix] All verification captures completed successfully!');
  } catch (err) {
    console.error('[DiceBadgeFix] Error during capture:', err);
  } finally {
    await capturer.close();
  }
}

main().catch(console.error);
