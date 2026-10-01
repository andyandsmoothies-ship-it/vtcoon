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
  private port = 9349;

  async start(width = 1920, height = 1080, targetUrl = 'http://localhost:4173/?room=VTTEST&host=true'): Promise<void> {
    const browserPath = findBrowser();
    if (!browserPath) throw new Error('No browser found!');

    const userDataDir = path.resolve(process.cwd(), '.agents/tmp/chrome_profile_imp239');
    fs.mkdirSync(userDataDir, { recursive: true });

    this.browserProc = spawn(browserPath, [
      `--remote-debugging-port=${this.port}`,
      `--user-data-dir=${userDataDir}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--headless=new',
      '--disable-gpu',
      `--window-size=${width},${height}`,
      targetUrl,
    ]);

    let wsUrl: string | null = null;
    for (let i = 0; i < 30; i++) {
      await sleep(500);
      try {
        const versionData = await fetchJson<{ webSocketDebuggerUrl?: string }>(`http://localhost:${this.port}/json/version`);
        if (versionData.webSocketDebuggerUrl) {
          wsUrl = versionData.webSocketDebuggerUrl;
          break;
        }
      } catch {}
    }

    if (!wsUrl) throw new Error('Failed to obtain browser WebSocket debugger URL');

    this.ws = new WebSocket(wsUrl);
    await new Promise<void>((resolve, reject) => {
      this.ws!.on('open', resolve);
      this.ws!.on('error', reject);
    });

    this.ws.on('message', (msg: WebSocket.RawData) => {
      const resp = JSON.parse(msg.toString());
      if (resp.id && this.pendingRequests.has(resp.id)) {
        const { resolve, reject } = this.pendingRequests.get(resp.id)!;
        this.pendingRequests.delete(resp.id);
        if (resp.error) reject(resp.error);
        else resolve(resp.result);
      }
    });

    await this.send('Target.setDiscoverTargets', { discover: true });
    const targets = await fetchJson<Array<{ type: string; webSocketDebuggerUrl: string }>>(`http://localhost:${this.port}/json/list`);
    const pageTarget = targets.find((t) => t.type === 'page');
    if (pageTarget && pageTarget.webSocketDebuggerUrl) {
      this.ws.close();
      this.ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
      await new Promise<void>((resolve, reject) => {
        this.ws!.on('open', resolve);
        this.ws!.on('error', reject);
      });
      this.ws.on('message', (msg: WebSocket.RawData) => {
        const resp = JSON.parse(msg.toString());
        if (resp.id && this.pendingRequests.has(resp.id)) {
          const { resolve, reject } = this.pendingRequests.get(resp.id)!;
          this.pendingRequests.delete(resp.id);
          if (resp.error) reject(resp.error);
          else resolve(resp.result);
        }
      });
    }

    await this.send('Page.enable', {});
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
    });
  }

  async send(method: string, params: Record<string, any> = {}): Promise<any> {
    const id = this.messageId++;
    return new Promise((resolve, reject) => {
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

  async takeScreenshot(filename: string): Promise<string> {
    fs.mkdirSync(TMP_DIR, { recursive: true });
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

    const shot = await this.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    const buffer = Buffer.from(shot.data, 'base64');
    
    const tmpPath = path.join(TMP_DIR, filename);
    const artPath = path.join(ARTIFACT_DIR, filename);

    fs.writeFileSync(tmpPath, buffer);
    fs.writeFileSync(artPath, buffer);
    console.log(`📸 Saved screenshot to: ${tmpPath} and ${artPath}`);
    return tmpPath;
  }

  async close(): Promise<void> {
    try {
      if (this.ws) this.ws.close();
      if (this.browserProc) {
        this.browserProc.kill();
        await sleep(500);
      }
    } catch {}
  }
}

async function run(): Promise<void> {
  console.log('🚀 Launching preview server check for IMP-239 Physical Evidence...');
  let previewProc: ChildProcess | null = null;
  const isPort4173Open = await checkPortOpen(4173);

  if (!isPort4173Open) {
    console.log('Starting vite preview on port 4173...');
    previewProc = spawn('npx', ['vite', 'preview', '--port', '4173', '--host'], {
      shell: true,
      stdio: 'ignore',
    });
    for (let i = 0; i < 20; i++) {
      await sleep(500);
      if (await checkPortOpen(4173)) break;
    }
  }

  const capturer = new ViewportCapturer();

  try {
    console.log('Opening headless desktop browser at 1920x1080...');
    await capturer.start(1920, 1080, 'http://localhost:4173/?room=VTTEST&host=true');
    await sleep(3000);

    // Bootstrap game store with state
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
            { slotIndex: 3, isOccupied: true, playerId: 'p4', playerName: 'Bot Gamma (Balanced)', isHost: false },
          ]
        });

        window.__gameStore.setState({
          isPlayerHudVisible: false,
          activeModal: null,
          dice: [3, 4],
          isRolling: false,
          turnPhase: 'ACTION_PHASE',
          currentTurnPlayerId: 'p1',
          playersInfo: {
            p1: { id: 'p1', name: 'Đại Gia Sài Gòn', balance: 15000, tokenColor: '#EF4444', ownedProperties: [1, 2], bankrupt: false, isBot: false },
            p2: { id: 'p2', name: 'Bot Alpha (Aggressive)', balance: 4200, tokenColor: '#3B82F6', ownedProperties: [3, 4], bankrupt: false, isBot: true },
            p3: { id: 'p3', name: 'Bot Beta (Cautious)', balance: 3500, tokenColor: '#10B981', ownedProperties: [], bankrupt: false, isBot: true },
            p4: { id: 'p4', name: 'Bot Gamma (Balanced)', balance: 2800, tokenColor: '#8B5CF6', ownedProperties: [], bankrupt: false, isBot: true },
          },
          levelMap: { 1: 0, 2: 3, 3: 0, 4: 0 }
        });
      })()
    `);
    await sleep(1000);

    // -------------------------------------------------------------
    // SCENARIO 1: Desktop GameOverModal (Centered, not right-shifted)
    // -------------------------------------------------------------
    console.log('Capturing Scenario 1: Desktop GameOverModal Centered...');
    await capturer.eval(`
      window.__gameStore.getState().openModal('game_over', {
        winnerId: 'p1',
        rankings: [
          { playerId: 'p1', rank: 1, netWorth: 25000, reason: 'VICTORY' },
          { playerId: 'p2', rank: 2, netWorth: 12000, reason: 'ACTIVE' },
          { playerId: 'p3', rank: 3, netWorth: 8000, reason: 'ACTIVE' },
          { playerId: 'p4', rank: 4, netWorth: 4000, reason: 'ACTIVE' }
        ]
      });
    `);
    await sleep(1500);
    await capturer.takeScreenshot('imp239_desktop_game_over_centered.jpg');

    // -------------------------------------------------------------
    // SCENARIO 2: Desktop HoseModal (Centered)
    // -------------------------------------------------------------
    console.log('Capturing Scenario 2: Desktop HoseModal Centered...');
    await capturer.eval(`
      window.__gameStore.getState().openModal('hose', {});
    `);
    await sleep(1500);
    await capturer.takeScreenshot('imp239_desktop_hose_centered.jpg');

    // -------------------------------------------------------------
    // SCENARIO 3: Desktop AuctionModal (4 players, no truncation)
    // -------------------------------------------------------------
    console.log('Capturing Scenario 3: Desktop AuctionModal 4 Players...');
    await capturer.eval(`
      window.__gameStore.getState().openModal('auction', {
        propertyId: 1,
        currentBid: 1200,
        highestBidderId: 'p2',
        participants: ['p1', 'p2', 'p3', 'p4'],
        withdrawnParticipants: ['p4']
      });
    `);
    await sleep(1500);
    await capturer.takeScreenshot('imp239_desktop_auction_4players.jpg');

    // -------------------------------------------------------------
    // SCENARIO 4: Desktop TradeModal (Partner strip & sentiment meter)
    // -------------------------------------------------------------
    console.log('Capturing Scenario 4: Desktop TradeModal (Partner strip & Sentiment meter)...');
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
    await capturer.takeScreenshot('imp239_desktop_trade_modal.jpg');

    // -------------------------------------------------------------
    // SCENARIO 5: Desktop TitleDeedModal (C3 with Monopoly Badge, no truncation)
    // -------------------------------------------------------------
    console.log('Capturing Scenario 5: Desktop TitleDeedModal C3 Monopoly...');
    await capturer.eval(`
      window.__gameStore.getState().openModal('deed', {
        cellIndex: 1,
        canBuy: false,
        ownedProperties: [1, 2]
      });
    `);
    await sleep(1500);
    await capturer.takeScreenshot('imp239_desktop_title_deed_c3_monopoly.jpg');

    // -------------------------------------------------------------
    // SCENARIO 6: Desktop TitleDeedModal (Sufficient Funds - No "Thiếu 0")
    // -------------------------------------------------------------
    console.log('Capturing Scenario 6: Desktop TitleDeedModal Sufficient Funds...');
    await capturer.eval(`
      window.__gameStore.getState().openModal('deed', {
        cellIndex: 6,
        canBuy: false,
        shortfall: 0,
        isTradeFrozen: false,
        ownedProperties: []
      });
    `);
    await sleep(1500);
    await capturer.takeScreenshot('imp239_desktop_title_deed_sufficient_funds.jpg');

    // -------------------------------------------------------------
    // SCENARIO 7: Desktop Compulsory Buyout (Centered with selector)
    // -------------------------------------------------------------
    console.log('Capturing Scenario 7: Desktop Compulsory Buyout...');
    await capturer.eval(`
      window.__gameStore.getState().openModal('compulsory_buyout', {
        buyerId: 'p1',
        sellerId: 'p2',
        cellIndex: 3,
        cost: 1500,
        basePrice: 1000,
        eligibleTargets: [3, 4]
      });
    `);
    await sleep(1500);
    await capturer.takeScreenshot('imp239_desktop_compulsory_buyout_centered.jpg');

    console.log('✅ All 7 physical verification screenshots (Desktop 1920x1080) captured successfully!');
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
