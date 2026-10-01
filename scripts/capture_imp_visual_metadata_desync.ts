import { spawn, type ChildProcess } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';

const ARTIFACT_DIR = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\e2fe7da3-174a-4efb-a786-63a9887ae769';
const TMP_DIR = path.resolve(process.cwd(), '.agents/tmp');

const BROWSER_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
].filter(Boolean);

function findBrowser(): string | null {
  for (const p of BROWSER_CANDIDATES) {
    if (p && fs.existsSync(p)) return p;
  }
  return null;
}

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

async function checkPortOpen(port: number): Promise<boolean> {
  try {
    const res = await fetch(`http://localhost:${port}/`, { method: 'HEAD', signal: AbortSignal.timeout(1000) });
    return res.status < 500;
  } catch {
    return false;
  }
}

class ViewportCapturer {
  private browserProc: ChildProcess | null = null;
  private ws: WebSocket | null = null;
  private messageId = 1;
  private pendingRequests = new Map<number, { resolve: (v: any) => void; reject: (e: any) => void }>();
  private port = 9355;

  async start(width = 1280, height = 800, targetUrl = 'http://localhost:4173/?room=VTTEST&host=true'): Promise<void> {
    const browserPath = findBrowser();
    if (!browserPath) throw new Error('No browser found!');

    if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

    this.browserProc = spawn(
      browserPath,
      [
        '--headless=new',
        `--remote-debugging-port=${this.port}`,
        `--window-size=${width},${height}`,
        '--enable-webgl',
        '--ignore-gpu-blocklist',
        '--no-first-run',
        '--disable-extensions',
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
        // Retry
      }
    }

    if (!debuggerUrl) {
      throw new Error(`Could not connect to debugger on port ${this.port}`);
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
        // Ignore
      }
    });

    await this.send('Page.enable');
    await this.send('Runtime.enable');
  }

  send(method: string, params: Record<string, unknown> = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = this.messageId++;
      this.pendingRequests.set(id, { resolve, reject });
      this.ws?.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression: string): Promise<any> {
    return this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
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
    const res = await this.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    const buffer = Buffer.from(res.data, 'base64');
    const tmpPath = path.join(TMP_DIR, filename);
    const artPath = path.join(ARTIFACT_DIR, filename);

    fs.writeFileSync(tmpPath, buffer);
    fs.writeFileSync(artPath, buffer);
    console.log(`[Captured] ${filename} -> ${tmpPath}`);
    return tmpPath;
  }

  async close(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.browserProc) {
      this.browserProc.kill();
      this.browserProc = null;
    }
  }
}

async function run() {
  let previewProc: ChildProcess | null = null;
  const isServerUp = await checkPortOpen(4173);
  if (!isServerUp) {
    console.log('Starting preview server on port 4173...');
    previewProc = spawn('cmd.exe', ['/c', 'npx vite preview --port 4173'], { stdio: 'ignore' });
    for (let i = 0; i < 20; i++) {
      await sleep(500);
      if (await checkPortOpen(4173)) break;
    }
  }

  const capturer = new ViewportCapturer();
  try {
    console.log('Starting ViewportCapturer (1280x800)...');
    await capturer.start(1280, 800);
    await sleep(4000);

    // Initial clean-up of overlays
    await capturer.eval(`
      document.querySelector('[data-testid="welcome-hub-overlay"]')?.remove();
      const preDeck = document.querySelector('[data-testid="pre-match-deck"]');
      if (preDeck) preDeck.style.display = 'none';
      document.querySelectorAll('div').forEach(el => {
        if (el.textContent && el.textContent.includes('Chờ người chơi')) {
          el.style.display = 'none';
        }
      });
    `);
    await sleep(1000);

    // Setup state with active MC_LAND_FEVER modifier
    await capturer.eval(`
      (() => {
        if (!window.__lobbyStore || !window.__gameStore) return;
        window.__lobbyStore.setState({
          gameStarted: true,
          roomCode: 'VTTEST',
          isJoining: false,
          myPlayerId: 'p1',
          isHost: true,
          slots: [
            { slotIndex: 0, isOccupied: true, playerId: 'p1', playerName: 'Chủ Tịch HĐQT', isHost: true },
            { slotIndex: 1, isOccupied: true, playerId: 'p2', playerName: 'Bot Alpha', isHost: false },
          ]
        });

        window.__gameStore.setState({
          isPlayerHudVisible: false,
          activeModal: null,
          dice: [4, 4],
          isRolling: false,
          turnPhase: 'ACTION_PHASE',
          currentTurnPlayerId: 'p1',
          playersInfo: {
            p1: { id: 'p1', name: 'Chủ Tịch HĐQT', balance: 12000, tokenColor: '#EF4444', ownedProperties: [8], bankrupt: false, isBot: false },
            p2: { id: 'p2', name: 'Bot Alpha', balance: 6500, tokenColor: '#3B82F6', ownedProperties: [], bankrupt: false, isBot: true },
          },
          activeModifiers: [
            {
              type: 'MC_LAND_FEVER',
              affectedCells: [6, 8, 31],
              remainingRounds: 2,
              multiplier: 2,
            }
          ],
          activeMacroCycle: null,
          levelMap: { 8: 1 },
          cameraFocusCell: 8
        });
      })()
    `);
    await sleep(2000);

    // 1. Capture 3D Diorama & Ticker showing MC_LAND_FEVER (x2 Thuê)
    console.log('Capturing Scenario 1: 3D Board & Ticker with MC_LAND_FEVER...');
    await capturer.takeScreenshot('imp_visual_metadata_desync_3d_tile_aura.jpg');

    // 2. Open Title Deed Modal on cell 8 (which is under MC_LAND_FEVER)
    console.log('Capturing Scenario 2: Title Deed Modal under MC_LAND_FEVER...');
    await capturer.eval(`
      window.__gameStore.getState().openModal('deed', {
        cellIndex: 8,
        canBuy: false,
        ownedProperties: [8]
      });
    `);
    await sleep(1500);
    await capturer.takeScreenshot('imp_visual_metadata_desync_title_deed.jpg');

    // 3. Capture on Mobile viewport (390x844) to verify dual-viewport parity
    console.log('Capturing Scenario 3: Mobile Viewport Title Deed...');
    await capturer.setViewport(390, 844);
    await sleep(1500);
    await capturer.takeScreenshot('imp_visual_metadata_desync_mobile_title_deed.jpg');

    console.log('✅ All visual evidence successfully captured!');
  } finally {
    await capturer.close();
    if (previewProc) previewProc.kill();
  }
}

run().catch((e) => {
  console.error('Error in capture run:', e);
  process.exit(1);
});
