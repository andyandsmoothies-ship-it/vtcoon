// [Simulation Harness] Headless Browser Turn-by-Turn Realtime CDP Capturer
// Controls Microsoft Edge via Chrome DevTools Protocol to capture real in-game screenshots
// after every turn before transitioning to the next turn.

import { spawn, type ChildProcess } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';

const BROWSER_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

export interface TurnSyncData {
  turnIndex: number;
  roundIndex: number;
  activePlayerId: string;
  dice: [number, number];
  playerPositions: Record<string, number>;
  players: Array<{
    id: string;
    name: string;
    balance: number;
    ownedProperties: number[];
    tokenColor: string;
    bankrupt: boolean;
  }>;
  levelMap: Record<number, number>;
  treasury: number;
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

export class BrowserTurnCapture {
  private browserProc: ChildProcess | null = null;
  private ws: WebSocket | null = null;
  private messageId = 1;
  private pendingRequests = new Map<number, { resolve: (v: any) => void; reject: (e: any) => void }>();
  private tempDir: string;
  private port: number;

  constructor(port: number) {
    this.port = port;
    const sysTemp = process.env.TEMP || 'C:\\Users\\HP\\AppData\\Local\\Temp';
    this.tempDir = path.join(sysTemp, `edge_vtcoon_uat_${port}_${Date.now()}`);
  }

  async start(targetUrl = 'http://127.0.0.1:3000/'): Promise<void> {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }

    this.browserProc = spawn(
      BROWSER_PATH,
      [
        '--headless=new',
        `--remote-debugging-port=${this.port}`,
        '--window-size=1600,1000',
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
        const page = list.find((t) => t.type === 'page' && t.url.includes('127.0.0.1:3000'));
        if (page?.webSocketDebuggerUrl) {
          debuggerUrl = page.webSocketDebuggerUrl;
          break;
        }
      } catch {
        // Retry until port is ready
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
      } catch {
        // Ignore unparseable frames
      }
    });

    await this.sendCmd('Page.enable');
    await this.sendCmd('Runtime.enable');
    await sleep(2500); // Allow R3F Canvas and bundle to mount
  }

  private sendCmd(method: string, params: Record<string, any> = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        return reject(new Error('WebSocket not connected'));
      }
      const id = this.messageId++;
      this.pendingRequests.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async initGameView(): Promise<void> {
    await this.sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          if (window.__lobbyStore) {
            window.__lobbyStore.getState().initLobby('VT8888', 'p1', true, 'Đại Gia Chủ Sảnh');
            window.__lobbyStore.getState().setGameStarted(true);
          }
        })()
      `,
    });
    await sleep(1500); // Allow GameCanvas to render
  }

  async syncTurnAndCapture(data: TurnSyncData, outputFilePath: string): Promise<void> {
    const parentDir = path.dirname(outputFilePath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    const payload = JSON.stringify(data);
    await this.sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const d = ${payload};
          if (!window.__gameStore) return;
          const game = window.__gameStore.getState();

          const infoMap = {};
          for (const pl of d.players) {
            infoMap[pl.id] = {
              id: pl.id,
              name: pl.name,
              balance: pl.balance,
              tokenColor: pl.tokenColor,
              ownedProperties: pl.ownedProperties,
              bankrupt: pl.bankrupt,
              isBot: true,
            };
          }

          game.setPlayersInfo(infoMap);
          game.setCurrentTurnPlayerId(d.activePlayerId);
          game.setPlayerPositions(d.playerPositions);
          game.setDice(d.dice);
          game.setLevelMap(d.levelMap);
          game.setTreasuryPool(d.treasury);
          game.setRoundInfo(d.roundIndex, 30);
          game.setTurnTimeRemaining(30);
        })()
      `,
    });

    await sleep(60); // Wait for React + Three.js to flush render frame

    const shot = await this.sendCmd('Page.captureScreenshot', { format: 'jpeg', quality: 85 });
    const buf = Buffer.from(shot.data, 'base64');
    fs.writeFileSync(outputFilePath, buf);
  }

  async close(): Promise<void> {
    try {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.close();
      }
      if (this.browserProc) {
        this.browserProc.kill('SIGKILL');
      }
      if (fs.existsSync(this.tempDir)) {
        fs.rmSync(this.tempDir, { recursive: true, force: true });
      }
    } catch {
      // Cleanup best effort
    }
  }
}
