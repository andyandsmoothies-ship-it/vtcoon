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

class MobileCapturer {
  private browserProc: ChildProcess | null = null;
  private ws: WebSocket | null = null;
  private messageId = 1;
  private pendingRequests = new Map<number, { resolve: (v: any) => void; reject: (e: any) => void }>();
  private port = 9345;

  async start(width = 390, height = 844, targetUrl = 'http://localhost:4173/?room=VTTEST&host=true'): Promise<void> {
    const browserPath = findBrowser();
    if (!browserPath) throw new Error('No browser executable found');

    if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });
    if (!fs.existsSync(ARTIFACT_DIR)) fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

    this.browserProc = spawn(
      browserPath,
      [
        '--headless=new',
        `--remote-debugging-port=${this.port}`,
        `--window-size=${width},${height}`,
        '--no-first-run',
        '--no-default-browser-check',
        '--enable-webgl',
        '--ignore-gpu-blocklist',
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
      } catch (e) {
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
  // Ensure preview server is up
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

  const capturer = new MobileCapturer();
  try {
    console.log('Starting MobileCapturer (390x844)...');
    await capturer.start(390, 844);
    await sleep(4000);

    // Initial clean-up of overlays
    await capturer.eval(`
      document.querySelector('[data-testid="welcome-hub-overlay"]')?.remove();
      const preDeck = document.querySelector('[data-testid="pre-match-deck"]');
      if (preDeck) preDeck.style.display = 'none';
    `);
    await sleep(1000);

    // -------------------------------------------------------------
    // SCENARIO 1: Mobile Viewport Harmonics (De-collision & Density)
    // -------------------------------------------------------------
    console.log('Configuring Scenario 1: Mobile HUD with Market Ticker + De-collided Camera Pill...');
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
            { slotIndex: 0, isOccupied: true, playerId: 'p1', playerName: 'Bạn', isHost: true },
            { slotIndex: 1, isOccupied: true, playerId: 'p2', playerName: 'Bot AI', isHost: false },
          ]
        });

        const game = window.__gameStore.getState();
        // 2 Active modifiers
        game.setActiveModifiers([
          { type: 'MC_LAND_FEVER', remainingRounds: 2, affectedCells: [1, 2] },
          { type: 'MC_RATE_HIKE', remainingRounds: 1, affectedCells: [] }
        ]);
        // Custom camera active so CameraResetPill is visible
        window.__gameStore.setState({
          hasUserCustomCamera: true,
          isPlayerHudVisible: false,
          activeModal: null,
          dice: [3, 4],
          isRolling: false,
          hasRolledThisTurn: true,
          turnPhase: 'ACTION_PHASE',
          currentTurnPlayerId: 'p1',
          playersInfo: {
            p1: { id: 'p1', name: 'Bạn', balance: 5000, tokenColor: '#EF4444', ownedProperties: [1], bankrupt: false, isBot: false },
            p2: { id: 'p2', name: 'Bot AI', balance: 4000, tokenColor: '#3B82F6', ownedProperties: [], bankrupt: false, isBot: true },
          }
        });
      })()
    `);
    await sleep(1500);
    await capturer.takeScreenshot('imp237_mobile_hud.jpg');

    // -------------------------------------------------------------
    // SCENARIO 2: EventCardModal (Sticky CTA & Clamped 12 Cells)
    // -------------------------------------------------------------
    console.log('Configuring Scenario 2: Event Card Modal (Sticky CTA & 12 Cells Cap)...');
    await capturer.eval(`
      (() => {
        if (!window.__gameStore) return;
        const game = window.__gameStore.getState();
        game.openModal('event', {
          cardId: 'MC_LAND_FEVER',
          cardType: 'market',
          title: 'Sốt Đất Ven Đô',
          description: 'Làn sóng đầu tư công và hạ tầng giao thông bùng nổ khiến giá trị chuyển nhượng và tiền thuê đất tăng gấp đôi trong 2 vòng đấu kế tiếp.',
          activeModifier: {
            type: 'MC_LAND_FEVER',
            remainingRounds: 2,
            affectedCells: [1, 3, 6, 8, 9, 11, 13, 14, 16, 18, 19, 21, 23, 24, 26, 27] // 16 cells -> cap at 12 + 4
          }
        });
      })()
    `);
    await sleep(1500);
    await capturer.takeScreenshot('imp237_event_modal.jpg');

    // -------------------------------------------------------------
    // SCENARIO 3: PlayerHudList (Compact Bankrupt Card & Backdrop)
    // -------------------------------------------------------------
    console.log('Configuring Scenario 3: Player HUD with Bankrupt Card Compactness & Backdrop...');
    await capturer.eval(`
      (() => {
        if (!window.__gameStore) return;
        const game = window.__gameStore.getState();
        game.closeModal();
        window.__gameStore.setState({
          isPlayerHudVisible: true,
          playersInfo: {
            p1: {
              id: 'p1',
              name: 'Đại Gia Hà Nội',
              balance: 12500,
              tokenColor: '#EF4444',
              ownedProperties: [1, 3, 6, 8],
              bankrupt: false,
              isBot: false,
            },
            p2: {
              id: 'p2',
              name: 'Thiếu Gia Vỡ Nợ',
              balance: -3400,
              tokenColor: '#64748B',
              ownedProperties: [],
              bankrupt: true, // Bankrupt player!
              isBot: true,
            }
          }
        });
      })()
    `);
    await sleep(1500);
    await capturer.takeScreenshot('imp237_player_hud.jpg');

    console.log('✅ All 3 verification screenshots captured successfully!');
  } finally {
    await capturer.close();
    if (previewProc) {
      previewProc.kill();
    }
  }
}

run().catch((err) => {
  console.error('Error running mobile capture:', err);
  process.exit(1);
});
