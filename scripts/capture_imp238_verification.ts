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
  private port = 9348;

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
    console.log('Starting ViewportCapturer on Mobile (390x844)...');
    await capturer.start(390, 844);
    await sleep(4000);

    // Initial clean-up of overlays
    await capturer.eval(`
      document.querySelector('[data-testid="welcome-hub-overlay"]')?.remove();
      const preDeck = document.querySelector('[data-testid="pre-match-deck"]');
      if (preDeck) preDeck.style.display = 'none';
    `);
    await sleep(1000);

    // Common game state setup
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
            { slotIndex: 0, isOccupied: true, playerId: 'p1', playerName: 'Đại Gia Sài Gòn', isHost: true },
            { slotIndex: 1, isOccupied: true, playerId: 'p2', playerName: 'Bot Alpha (Aggressive)', isHost: false },
            { slotIndex: 2, isOccupied: true, playerId: 'p3', playerName: 'Bot Beta (Cautious)', isHost: false },
          ]
        });

        window.__gameStore.setState({
          isPlayerHudVisible: false,
          activeModal: null,
          dice: [4, 5],
          isRolling: false,
          turnPhase: 'ACTION_PHASE',
          currentTurnPlayerId: 'p1',
          playersInfo: {
            p1: { id: 'p1', name: 'Đại Gia Sài Gòn', balance: 8500, tokenColor: '#EF4444', ownedProperties: [1, 2], bankrupt: false, isBot: false },
            p2: { id: 'p2', name: 'Bot Alpha (Aggressive)', balance: 4200, tokenColor: '#3B82F6', ownedProperties: [3, 4], bankrupt: false, isBot: true },
            p3: { id: 'p3', name: 'Bot Beta (Cautious)', balance: -1500, tokenColor: '#64748B', ownedProperties: [], bankrupt: true, isBot: true },
          },
          levelMap: { 1: 0, 2: 1, 3: 0, 4: 0 }
        });
      })()
    `);
    await sleep(1000);

    // -------------------------------------------------------------
    // SCENARIO 1: Mobile Title Deed (Owner view)
    // -------------------------------------------------------------
    console.log('Capturing Scenario 1: Mobile Title Deed (Owner)...');
    await capturer.eval(`
      window.__gameStore.getState().openModal('deed', {
        cellIndex: 1,
        canBuy: false,
        ownedProperties: [1, 2]
      });
    `);
    await sleep(1500);
    await capturer.takeScreenshot('imp238_mobile_title_deed_owner.jpg');

    // -------------------------------------------------------------
    // SCENARIO 2: Mobile Title Deed (Opponent view)
    // -------------------------------------------------------------
    console.log('Capturing Scenario 2: Mobile Title Deed (Opponent)...');
    await capturer.eval(`
      window.__gameStore.getState().openModal('deed', {
        cellIndex: 3,
        canBuy: false,
        ownedProperties: [1, 2]
      });
    `);
    await sleep(1500);
    await capturer.takeScreenshot('imp238_mobile_title_deed_opponent.jpg');

    // -------------------------------------------------------------
    // SCENARIO 3: Mobile Trade Partner Strip (2-tier, no B.. truncation)
    // -------------------------------------------------------------
    console.log('Capturing Scenario 3: Mobile Trade Modal...');
    await capturer.eval(`
      window.__gameStore.getState().openModal('trade', {
        targetPlayerId: 'p2',
        offeredProperties: [1],
        requestedProperties: [3],
        cashOffer: 0,
        cashRequest: 0
      });
    `);
    await sleep(1500);
    await capturer.takeScreenshot('imp238_mobile_trade_partner.jpg');

    // -------------------------------------------------------------
    // SCENARIO 4: Mobile Player Card (Bankrupt state de-clutter)
    // -------------------------------------------------------------
    console.log('Capturing Scenario 4: Mobile Player Card (Bankrupt)...');
    await capturer.eval(`
      window.__gameStore.getState().closeModal();
      window.__gameStore.setState({ isPlayerHudVisible: true });
    `);
    await sleep(1500);
    await capturer.takeScreenshot('imp238_mobile_player_card_bankrupt.jpg');

    // -------------------------------------------------------------
    // SCENARIO 5: Mobile Compulsory Buyout (Non-wrapping Giá Gốc)
    // -------------------------------------------------------------
    console.log('Capturing Scenario 5: Mobile Compulsory Buyout...');
    await capturer.eval(`
      window.__gameStore.setState({ isPlayerHudVisible: false });
      window.__gameStore.getState().openModal('compulsory_buyout', {
        buyerId: 'p1',
        sellerId: 'p2',
        cellIndex: 3,
        cost: 1500,
        basePrice: 1000,
        eligibleTargets: [3]
      });
    `);
    await sleep(1500);
    await capturer.takeScreenshot('imp238_mobile_compulsory_buyout.jpg');

    // -------------------------------------------------------------
    // SWITCH TO DESKTOP VIEWPORT (1280x800)
    // -------------------------------------------------------------
    console.log('Switching to Desktop Viewport (1280x800)...');
    await capturer.setViewport(1280, 800);
    await sleep(1000);

    // -------------------------------------------------------------
    // SCENARIO 6: Desktop Title Deed (Dual-Viewport Parity)
    // -------------------------------------------------------------
    console.log('Capturing Scenario 6: Desktop Title Deed...');
    await capturer.eval(`
      window.__gameStore.getState().openModal('deed', {
        cellIndex: 3,
        canBuy: false,
        ownedProperties: [1, 2]
      });
    `);
    await sleep(1500);
    await capturer.takeScreenshot('imp238_desktop_title_deed.jpg');

    // -------------------------------------------------------------
    // SCENARIO 7: Desktop Trade Partner (Horizontal layout parity)
    // -------------------------------------------------------------
    console.log('Capturing Scenario 7: Desktop Trade Partner...');
    await capturer.eval(`
      window.__gameStore.getState().openModal('trade', {
        targetPlayerId: 'p2',
        offeredProperties: [1],
        requestedProperties: [3],
        cashOffer: 0,
        cashRequest: 0
      });
    `);
    await sleep(1500);
    await capturer.takeScreenshot('imp238_desktop_trade_partner.jpg');

    console.log('✅ All 7 physical verification screenshots (Mobile + Desktop) captured successfully!');
  } finally {
    await capturer.close();
    if (previewProc) {
      previewProc.kill();
    }
  }
}

run().catch((err) => {
  console.error('Error running verification capture:', err);
  process.exit(1);
});
