import { spawn, type ChildProcess } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';

const ARTIFACT_DIR = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\70648213-a2f7-42df-9dde-99f489dc4aec';
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

  async start(width = 1920, height = 1080, targetUrl = 'http://localhost:4173/?room=VTTEST&host=true'): Promise<void> {
    const browserPath = findBrowser();
    if (!browserPath) throw new Error('No supported Chrome/Edge browser found.');

    const userDataDir = path.resolve(process.cwd(), '.agents/tmp/chrome_profile_imp248');
    fs.mkdirSync(userDataDir, { recursive: true });

    this.browserProc = spawn(browserPath, [
      `--remote-debugging-port=${this.port}`,
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      `--user-data-dir=${userDataDir}`,
      `--window-size=${width},${height}`,
      targetUrl,
    ], { stdio: 'ignore' });

    let connected = false;
    for (let i = 0; i < 30; i++) {
      await sleep(500);
      try {
        const ver = await fetchJson<{ webSocketDebuggerUrl?: string }>(`http://localhost:${this.port}/json/version`);
        if (ver.webSocketDebuggerUrl) {
          this.ws = new WebSocket(ver.webSocketDebuggerUrl);
          await new Promise<void>((resolve, reject) => {
            this.ws!.on('open', resolve);
            this.ws!.on('error', reject);
          });
          connected = true;
          break;
        }
      } catch {}
    }
    if (!connected) throw new Error('Failed to connect to CDP.');

    this.ws!.on('message', (msg: WebSocket.RawData) => {
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

    const shot = await this.send('Page.captureScreenshot', { format: 'png' });
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
  console.log('🚀 Launching preview server check for IMP-248 Physical Evidence...');
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

    // Bootstrap game store with state and open transit_wheel modal
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
          activeModal: 'transit_wheel',
          modalPayload: { cellIndex: 5, playerId: 'p1' },
          dice: [2, 3],
          isRolling: false,
          turnPhase: 'PROPERTY_MANAGEMENT',
          currentTurnPlayerId: 'p1',
          playersInfo: {
            p1: { id: 'p1', name: 'Chủ Tịch HĐQT', balance: 12000, tokenColor: '#EF4444', ownedProperties: [5, 12, 15], bankrupt: false, isBot: false },
            p2: { id: 'p2', name: 'Bot Alpha', balance: 6500, tokenColor: '#3B82F6', ownedProperties: [], bankrupt: false, isBot: true },
          },
          propertyStates: {
            5: { isUpgradedUtility: false, isETC: false },
            12: { isUpgradedUtility: false, isETC: false },
            15: { isUpgradedUtility: false, isETC: false },
          },
          activeModifiers: [],
          levelMap: { 5: 0, 12: 0, 15: 0 },
        });
      })()
    `);
    await sleep(1500);

    // 1. Capture Desktop Viewport (1920x1080)
    console.log('Capturing Scenario 1: Transit Wheel Modal Desktop (1920x1080)...');
    await capturer.takeScreenshot('imp248_transit_wheel_desktop.png');

    // 2. Capture Result State on Desktop
    console.log('Updating Transit Wheel outcome to SPEED_BOOST...');
    await capturer.eval(`
      window.__gameStore.getState().updateModalPayload({
        outcome: 'SPEED_BOOST',
        targetCell: 8,
        payout: 0,
      });
    `);
    await sleep(4000);
    await capturer.takeScreenshot('imp248_transit_wheel_desktop_result.png');

    // 3. Capture Mobile Viewport (360x740)
    console.log('Capturing Scenario 2: Transit Wheel Modal Mobile 360px (360x740)...');
    await capturer.setViewport(360, 740, true);
    await sleep(1000);
    await capturer.takeScreenshot('imp248_transit_wheel_mobile_360.png');

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
