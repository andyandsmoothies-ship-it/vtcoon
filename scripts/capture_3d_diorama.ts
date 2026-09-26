// Capture script to inspect current 3D central diorama
import { spawn, type ChildProcess } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';

const BROWSER_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\8cca9836-b0ff-4bc7-a6c2-e675742fa525';

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

class DioramaCapturer {
  private browserProc: ChildProcess | null = null;
  private ws: WebSocket | null = null;
  private messageId = 1;
  private pendingRequests = new Map<number, { resolve: (v: any) => void; reject: (e: any) => void }>();
  private tempDir: string;
  private port = 9339;

  constructor() {
    const sysTemp = process.env.TEMP || 'C:\\Users\\HP\\AppData\\Local\\Temp';
    this.tempDir = path.join(sysTemp, `edge_diorama_${Date.now()}`);
  }

  async start(targetUrl = 'http://localhost:4173/'): Promise<void> {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }

    this.browserProc = spawn(
      BROWSER_PATH,
      [
        '--headless=new',
        `--remote-debugging-port=${this.port}`,
        '--window-size=1280,800',
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
          const req = this.pendingRequests.get(msg.id)!;
          this.pendingRequests.delete(msg.id);
          if (msg.error) req.reject(msg.error);
          else req.resolve(msg.result);
        }
      } catch (err) {
        console.error('WS parse error:', err);
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
      mobile: false,
    });
    await this.send('Emulation.setVisibleSize', { width, height });
  }

  async takeScreenshot(fileName: string): Promise<string> {
    const res = await this.send('Page.captureScreenshot', {
      format: 'jpeg',
      quality: 90,
      fromSurface: true,
    });
    const buffer = Buffer.from(res.data, 'base64');
    const artifactPath = path.join(ARTIFACT_DIR, fileName);
    fs.writeFileSync(artifactPath, buffer);
    console.log(`Saved screenshot: ${artifactPath}`);
    return artifactPath;
  }

  async close(): Promise<void> {
    try {
      if (this.ws) this.ws.close();
      if (this.browserProc) this.browserProc.kill('SIGKILL');
      if (fs.existsSync(this.tempDir)) fs.rmSync(this.tempDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }
}

async function main() {
  const capturer = new DioramaCapturer();
  try {
    console.log('[Diorama] Connecting to preview server on 4173...');
    await capturer.start();

    console.log('[Diorama] Initializing game view with no modal...');
    await capturer.eval(`
      (() => {
        if (window.__lobbyStore) {
          window.__lobbyStore.getState().initLobby('VTK_3D', 'p1', true, 'Bạn');
          window.__lobbyStore.setState({ roomCode: 'VTK_3D', isJoining: false, gameStarted: true });
        }
        if (window.__gameStore) {
          window.__gameStore.getState().closeModal();
          window.__gameStore.setState({
            activeModal: null,
            modalPayload: null,
          });
        }
      })()
    `);
    await sleep(2000);

    // 1. Isometric / Overview View
    console.log('[Diorama] 1. Capturing isometric overview (1280x800)...');
    await capturer.setViewport(1280, 800);
    await sleep(2000);
    await capturer.takeScreenshot('imp197_diorama_overview.jpg');

    // 2. Square Overhead View (like Monopoly Plus)
    console.log('[Diorama] 2. Capturing top-down overhead view (1000x1000)...');
    await capturer.setViewport(1000, 1000);
    await sleep(1500);
    await capturer.takeScreenshot('imp197_diorama_topdown.jpg');

    console.log('[Diorama] All captures complete!');
  } finally {
    await capturer.close();
  }
}

main().catch(console.error);
