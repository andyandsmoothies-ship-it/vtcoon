// [IMP-203] Acceptance Verification Screenshot Capturer
// Captures real in-game 3D Diorama screenshots demonstrating Level 1-2 Housing & Level 3 Bespoke Landmarks
import { spawn, type ChildProcess } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';

const BROWSER_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\8cca9836-b0ff-4bc7-a6c2-e675742fa525';
const REPORT_DIR = path.resolve(process.cwd(), 'docs/reports/uat/screenshots/imp203');

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

class Imp203Capturer {
  private browserProc: ChildProcess | null = null;
  private ws: WebSocket | null = null;
  private messageId = 1;
  private pendingRequests = new Map<number, { resolve: (v: any) => void; reject: (e: any) => void }>();
  private tempDir: string;
  private port = 9355;

  constructor() {
    const sysTemp = process.env.TEMP || 'C:\\Users\\HP\\AppData\\Local\\Temp';
    this.tempDir = path.join(sysTemp, `edge_vtcoon_imp203_${Date.now()}`);
  }

  async start(width = 1280, height = 800, targetUrl = 'http://localhost:4173/'): Promise<void> {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
    if (!fs.existsSync(ARTIFACT_DIR)) {
      fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
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
    for (let i = 0; i < 40; i++) {
      await sleep(350);
      try {
        const list = await fetchJson<Array<{ type: string; url: string; webSocketDebuggerUrl?: string }>>(
          `http://127.0.0.1:${this.port}/json/list`
        );
        const page = list.find((t) => t.type === 'page' && t.url.includes('4173'));
        if (page?.webSocketDebuggerUrl) {
          debuggerUrl = page.webSocketDebuggerUrl;
          break;
        }
      } catch {}
    }

    if (!debuggerUrl) {
      throw new Error(`Failed to connect to Microsoft Edge CDP on port ${this.port}`);
    }

    this.ws = new WebSocket(debuggerUrl);
    await new Promise<void>((resolve, reject) => {
      this.ws!.on('open', resolve);
      this.ws!.on('error', reject);
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

  async setViewport(width: number, height: number, deviceScaleFactor = 2): Promise<void> {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor,
      mobile: false,
    });
    await this.send('Emulation.setVisibleSize', { width, height });
  }

  async takeScreenshot(filename: string): Promise<string> {
    const res = await this.send('Page.captureScreenshot', {
      format: 'jpeg',
      quality: 92,
      fromSurface: true,
    });
    const buffer = Buffer.from(res.data, 'base64');
    const artifactPath = path.join(ARTIFACT_DIR, filename);
    const reportPath = path.join(REPORT_DIR, filename);
    fs.writeFileSync(artifactPath, buffer);
    fs.writeFileSync(reportPath, buffer);
    console.log(`[Capture] Saved: ${artifactPath} (${buffer.length} bytes)`);
    return artifactPath;
  }

  async close(): Promise<void> {
    try {
      this.ws?.close();
      if (this.browserProc) this.browserProc.kill('SIGKILL');
      if (fs.existsSync(this.tempDir)) fs.rmSync(this.tempDir, { recursive: true, force: true });
    } catch {}
  }
}

async function main() {
  const capturer = new Imp203Capturer();
  try {
    console.log('[IMP-203] Starting Edge CDP Capturer at 1280x800...');
    await capturer.start(1280, 800);

    console.log('[IMP-203] Waiting for app stores and seeding match state...');
    await capturer.eval(`
      new Promise((resolve) => {
        const interval = setInterval(() => {
          if (window.__lobbyStore && window.__gameStore && window.__environmentStore) {
            clearInterval(interval);
            window.__lobbyStore.getState().initLobby('VT203', 'p1', true, 'Đại Gia Sài Gòn');
            window.__lobbyStore.setState({ roomCode: 'VT203', isJoining: false, gameStarted: true });
            resolve(true);
          }
        }, 100);
      })
    `);
    await sleep(2500);

    // Setup in-game properties with C1, C2, and C3 Landmark buildings
    console.log('[IMP-203] Injecting realistic multi-tier property grid...');
    await capturer.eval(`
      (() => {
        if (!window.__gameStore) return;
        const game = window.__gameStore.getState();
        
        // Close modal and focus on full diorama
        game.closeModal();
        game.setCameraFocusCell(null);

        const infoMap = {
          p1: {
            id: 'p1',
            name: 'Đại Gia Sài Gòn',
            balance: 18500,
            tokenColor: '#EF4444',
            ownedProperties: [1, 3, 37, 39],
            bankrupt: false,
            isBot: false,
            ownerSlot: 0,
            mascotIcon: '🏰',
          },
          bot_2: {
            id: 'bot_2',
            name: 'Tỷ Phú Hà Thành',
            balance: 24200,
            tokenColor: '#3B82F6',
            ownedProperties: [6, 8, 9, 11, 13, 14, 18, 19, 21, 24, 26, 27, 29, 31, 32, 34],
            bankrupt: false,
            isBot: true,
            ownerSlot: 1,
            mascotIcon: '🐎',
          }
        };

        // Level Map configuration:
        // C1 (Standardized Housing C1): Cell 3, Cell 8, Cell 14
        // C2 (Standardized Housing C2): Cell 6, Cell 19, Cell 37
        // C3 (Bespoke 3D Landmarks): Cell 1 (Bình Thủy), Cell 9 (Hải Đăng), Cell 13 (Đà Lạt), 
        //                            Cell 18 (Lầu Ngũ Phụng), Cell 24 (Bái Đính), Cell 26 (Hải Phòng),
        //                            Cell 29 (Quảng Ninh), Cell 32 (Keangnam), Cell 34 (Nhà Hát Lớn), Cell 39 (Bitexco)
        const levelMap = {
          1: 3,  // Dinh Bình Thủy - C3 Landmark
          3: 1,  // C1 House
          6: 2,  // C2 House
          8: 1,  // C1 House
          9: 3,  // Hải Đăng Vũng Tàu - C3 Landmark
          11: 3, // Resort Mũi Né - C3 Landmark
          13: 3, // Ga Xe Lửa Đà Lạt - C3 Landmark
          14: 1, // C1 House
          18: 3, // Lầu Ngũ Phụng Huế - C3 Landmark
          19: 2, // C2 House
          21: 3, // Khách Sạn Sầm Sơn - C3 Landmark
          24: 3, // Bảo Tháp Bái Đính - C3 Landmark
          26: 3, // Nhà Hát Hải Phòng - C3 Landmark
          27: 3, // Tháp Chuông Venice Phú Quốc - C3 Landmark
          29: 3, // Bảo Tàng Than Quảng Ninh - C3 Landmark
          31: 3, // Ecopark Hưng Yên - C3 Landmark
          32: 3, // Keangnam Landmark 72 - C3 Landmark
          34: 3, // Nhà Hát Lớn Hà Nội - C3 Landmark
          37: 2, // C2 House
          39: 3, // Tháp Bitexco Búp Sen - C3 Landmark
        };

        game.setPlayersInfo(infoMap);
        window.__gameStore.setState({
          levelMap,
          activeModal: null,
          modalPayload: null,
        });
        game.setCurrentTurnPlayerId('p1');
        game.setRoundInfo(8, 30);
        game.setTurnTimeRemaining(45);
        game.setTurnPhase('WaitingRoll');
        game.setHasRolledThisTurn(false);
      })()
    `);
    await sleep(3500);

    // 1. DAYLIGHT ISOMETRIC OVERVIEW
    console.log('[IMP-203] Shot 1: Capturing daylight 3D diorama overview (1280x800)...');
    await capturer.eval(`window.__environmentStore?.getState().setMode('day');`);
    await sleep(2500);
    await capturer.takeScreenshot('imp203_01_diorama_overview_day.jpg');

    // 2. CLOSEUP FOCUS ON BITEXCO & SOUTHERN LANDMARKS (Cell 39 & Cell 1)
    console.log('[IMP-203] Shot 2: Focusing camera on Cell 39 (Tháp Bitexco Búp Sen)...');
    await capturer.eval(`
      (() => {
        window.__gameStore.getState().setCameraFocusCell(39);
      })()
    `);
    await sleep(2500);
    await capturer.takeScreenshot('imp203_02_closeup_bitexco_landmark_c3.jpg');

    // 3. CLOSEUP FOCUS ON HUE CITADEL (Cell 18 Lầu Ngũ Phụng)
    console.log('[IMP-203] Shot 3: Focusing camera on Cell 18 (Lầu Ngũ Phụng Huế)...');
    await capturer.eval(`
      (() => {
        window.__gameStore.getState().setCameraFocusCell(18);
      })()
    `);
    await sleep(2500);
    await capturer.takeScreenshot('imp203_03_closeup_hue_citadel_c3.jpg');

    // 4. OVERHEAD TOP-DOWN PLAN (1000x1000)
    console.log('[IMP-203] Shot 4: Capturing overhead top-down view (1000x1000)...');
    await capturer.eval(`
      (() => {
        window.__gameStore.getState().setCameraFocusCell(null);
      })()
    `);
    await capturer.setViewport(1000, 1000);
    await sleep(2000);
    await capturer.takeScreenshot('imp203_04_topdown_architectural_plan.jpg');

    // 5. SUNSET GOLDEN HOUR MOOD LIGHTING (1280x800)
    console.log('[IMP-203] Shot 5: Setting mode to SUNSET (Golden Hour) (1280x800)...');
    await capturer.setViewport(1280, 800);
    await capturer.eval(`window.__environmentStore?.getState().setMode('sunset');`);
    await sleep(2500);
    await capturer.takeScreenshot('imp203_05_sunset_golden_hour.jpg');

    // 6. NIGHT NEON METROPOLIS WITH EMISSIVE LANDMARKS (1280x800)
    console.log('[IMP-203] Shot 6: Setting mode to NIGHT (Neon Metropolis) (1280x800)...');
    await capturer.eval(`window.__environmentStore?.getState().setMode('night');`);
    await sleep(2500);
    await capturer.takeScreenshot('imp203_06_night_neon_landmarks.jpg');

    console.log('[IMP-203] All 6 verification screenshots captured successfully!');
  } catch (err) {
    console.error('[IMP-203] Error during capture:', err);
  } finally {
    await capturer.close();
  }
}

main().catch(console.error);
