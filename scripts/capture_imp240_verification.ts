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
    if (!browserPath) throw new Error('No browser executable found!');

    this.browserProc = spawn(browserPath, [
      `--remote-debugging-port=${this.port}`,
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
    console.log(`[Captured] ${filename} -> ${tmpPath}`);
    return tmpPath;
  }

  async setViewport(width: number, height: number, mobile = false): Promise<void> {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile,
    });
  }

  async close(): Promise<void> {
    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
      this.ws = null;
    }
    if (this.browserProc) {
      this.browserProc.kill();
      this.browserProc = null;
    }
  }
}

async function run(): Promise<void> {
  console.log('🚀 Launching preview server check for IMP-240 Physical Evidence...');
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
    console.log('Opening headless desktop browser at 1280x800...');
    await capturer.start(1280, 800, 'http://localhost:4173/?room=VTTEST&host=true');
    await sleep(3000);

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
            { slotIndex: 0, isOccupied: true, playerId: 'p1', playerName: 'Chủ Tịch HĐQT', isHost: true },
            { slotIndex: 1, isOccupied: true, playerId: 'p2', playerName: 'Bot Alpha', isHost: false },
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
            p1: { id: 'p1', name: 'Chủ Tịch HĐQT', balance: 12000, tokenColor: '#EF4444', ownedProperties: [5, 12, 15, 28, 8], bankrupt: false, isBot: false },
            p2: { id: 'p2', name: 'Bot Alpha', balance: 6500, tokenColor: '#3B82F6', ownedProperties: [], bankrupt: false, isBot: true },
          },
          propertyStates: {
            12: { isUpgradedUtility: false, isETC: false },
            28: { isUpgradedUtility: false, isETC: false },
            5: { isUpgradedUtility: false, isETC: false },
            15: { isUpgradedUtility: false, isETC: false },
            8: { isUpgradedUtility: false, isETC: false },
          },
          activeModifiers: [],
          levelMap: { 8: 2, 12: 0, 28: 0, 5: 0, 15: 0 },
        });
      })()
    `);
    await sleep(1000);

    // 1. Capture Cell 12 (EVN) Title Deed Modal on Desktop (1280x800)
    console.log('Capturing Scenario 1: EVN Ô 12 Title Deed (Smart Grid + Passive Electric info)...');
    await capturer.eval(`
      window.__gameStore.getState().openModal('deed', {
        cellIndex: 12,
        canBuy: false,
        ownedProperties: [5, 12, 15, 28, 8]
      });
    `);
    await sleep(1500);
    await capturer.takeScreenshot('imp240_desktop_utility_evn.jpg');

    // 2. Capture Cell 28 (Viettel) Title Deed Modal on Desktop
    console.log('Capturing Scenario 2: Viettel Ô 28 Title Deed (5G + Satellite data fee info)...');
    await capturer.eval(`
      window.__gameStore.getState().openModal('deed', {
        cellIndex: 28,
        canBuy: false,
        ownedProperties: [5, 12, 15, 28, 8]
      });
    `);
    await sleep(1500);
    await capturer.takeScreenshot('imp240_desktop_utility_viettel.jpg');

    // 3. Capture Cell 15 (Railroad) Title Deed Modal on Desktop
    console.log('Capturing Scenario 3: Railroad Ô 15 Title Deed (ETC package info & button)...');
    await capturer.eval(`
      window.__gameStore.getState().openModal('deed', {
        cellIndex: 15,
        canBuy: false,
        ownedProperties: [5, 12, 15, 28, 8]
      });
    `);
    await sleep(1500);
    await capturer.takeScreenshot('imp240_desktop_railroad_etc.jpg');

    // 4. Capture Cell 8 (Vinmec Service) Title Deed Modal on Desktop
    console.log('Capturing Scenario 4: Service Ô 08 Title Deed (C2 Phụ thu 1D6 & C3 Giữ Chân Mất Lượt)...');
    await capturer.eval(`
      window.__gameStore.getState().openModal('deed', {
        cellIndex: 8,
        canBuy: false,
        ownedProperties: [5, 12, 15, 28, 8]
      });
    `);
    await sleep(1500);
    await capturer.takeScreenshot('imp240_desktop_service_c2_c3.jpg');

    // 5. Capture Mobile Viewport (390x844) on Cell 12 EVN
    console.log('Capturing Scenario 5: Mobile Viewport EVN Ô 12...');
    await capturer.setViewport(390, 844, true);
    await capturer.eval(`
      window.__gameStore.getState().openModal('deed', {
        cellIndex: 12,
        canBuy: false,
        ownedProperties: [5, 12, 15, 28, 8]
      });
    `);
    await sleep(1500);
    await capturer.takeScreenshot('imp240_mobile_utility_evn.jpg');

    console.log('✅ All Phase 3.0 visual evidence successfully captured!');
  } finally {
    await capturer.close();
    if (previewProc) previewProc.kill();
  }
}

run().catch((e) => {
  console.error('Error in capture run:', e);
  process.exit(1);
});
