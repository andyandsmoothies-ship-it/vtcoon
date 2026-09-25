// [IMP-193] Verification Screenshot Capturer
// Captures real in-game screenshots via Microsoft Edge CDP on Mobile Viewport (390x844)
import { spawn, type ChildProcess } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';

const BROWSER_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const SCREENSHOT_DIR = path.resolve(process.cwd(), 'docs/reports/uat/screenshots/imp193');

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
  private port = 9333;

  constructor() {
    const sysTemp = process.env.TEMP || 'C:\\Users\\HP\\AppData\\Local\\Temp';
    this.tempDir = path.join(sysTemp, `edge_vtcoon_imp193_${Date.now()}`);
  }

  async start(targetUrl = 'http://localhost:4173/'): Promise<void> {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
    if (!fs.existsSync(SCREENSHOT_DIR)) {
      fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    }

    this.browserProc = spawn(
      BROWSER_PATH,
      [
        '--headless=new',
        `--remote-debugging-port=${this.port}`,
        '--window-size=390,844',
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
        // Retry until ready
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
        // ignore
      }
    });

    await this.sendCmd('Page.enable');
    await this.sendCmd('Runtime.enable');
    await this.sendCmd('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await sleep(2000);
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

  async eval(code: string): Promise<any> {
    return this.sendCmd('Runtime.evaluate', { expression: code, returnByValue: true });
  }

  async takeScreenshot(filename: string): Promise<string> {
    const shot = await this.sendCmd('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    const buf = Buffer.from(shot.data, 'base64');
    const outPath = path.join(SCREENSHOT_DIR, filename);
    fs.writeFileSync(outPath, buf);
    console.log(`[Capture] Saved: ${outPath} (${buf.length} bytes)`);
    return outPath;
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
      // ignore
    }
  }
}

async function main() {
  const capturer = new VerificationCapturer();
  try {
    console.log('[IMP-193] Starting headless Edge capturer on Mobile 390x844...');
    await capturer.start();

    console.log('[IMP-193] Initializing game state...');
    await capturer.eval(`
      (() => {
        if (window.__lobbyStore) {
          window.__lobbyStore.getState().initLobby('VT193', 'p1', true, 'Đại Gia Sài Gòn');
          window.__lobbyStore.setState({ roomCode: 'VT193', isJoining: false, gameStarted: true });
        }
      })()
    `);
    await sleep(2000);

    // Setup realistic 4-player in-game state
    await capturer.eval(`
      (() => {
        if (!window.__gameStore) return;
        const game = window.__gameStore.getState();
        const infoMap = {
          p1: {
            id: 'p1',
            name: 'Đại Gia Sài Gòn',
            balance: 6500,
            tokenColor: '#EF4444',
            ownedProperties: [1, 3, 6, 8, 9, 11, 13, 14, 16, 18, 19, 21, 23, 24, 26, 27, 29, 31, 32, 34, 37, 39],
            bankrupt: false,
            isBot: false,
          },
          bot_2: {
            id: 'bot_2',
            name: 'Tỷ Phú Hà Thành',
            balance: 4200,
            tokenColor: '#3B82F6',
            ownedProperties: [2, 4],
            bankrupt: false,
            isBot: true,
          },
          bot_3: {
            id: 'bot_3',
            name: 'Thương Gia Đà Nẵng',
            balance: 2900,
            tokenColor: '#10B981',
            ownedProperties: [5],
            bankrupt: false,
            isBot: true,
          },
          bot_4: {
            id: 'bot_4',
            name: 'Đầu Tư Cần Thơ',
            balance: 1800,
            tokenColor: '#F59E0B',
            ownedProperties: [],
            bankrupt: false,
            isBot: true,
          }
        };

        game.setPlayersInfo(infoMap);
        game.setCurrentTurnPlayerId('p1');
        game.setPlayerPositions({ p1: 1, bot_2: 4, bot_3: 10, bot_4: 15 });
        game.setDice([3, 4]);
        game.setLevelMap({ 1: 2, 3: 1, 6: 0 });
        game.setTreasuryPool(3500);
        game.setRoundInfo(5, 30);
        game.setTurnTimeRemaining(42);
        game.setTurnPhase('WaitingRoll');
        game.setHasRolledThisTurn(false);
      })()
    `);
    await sleep(1500);

    // SHOT 1: Action Dock + 22 Dots Player Card
    console.log('[IMP-193] Measuring Dots Geometry & Capturing Shot 1...');
    const metrics = await capturer.eval(`
      (() => {
        const card = document.querySelector('[data-testid="player-ribbon"]');
        const clusters = document.querySelector('[data-testid="player-property-clusters"]');
        if (!card || !clusters) return 'Elements not found';
        function findRules(ruleList, el) {
          const matched = [];
          for (const rule of ruleList) {
            try {
              if (rule.selectorText && el.matches(rule.selectorText)) {
                matched.push(rule.cssText);
              }
              if (rule.cssRules) {
                matched.push(...findRules(rule.cssRules, el));
              }
            } catch (e) {}
          }
          return matched;
        }
        const allRules = [];
        for (const sheet of document.styleSheets) {
          try {
            allRules.push(...findRules(sheet.cssRules, card));
          } catch (e) {}
        }
        const clRules = [];
        for (const sheet of document.styleSheets) {
          try {
            clRules.push(...findRules(sheet.cssRules, clusters));
          } catch (e) {}
        }
        const cRect = card.getBoundingClientRect();
        const clRect = clusters.getBoundingClientRect();
        const fDot = document.querySelector('[data-testid="dot-cell-1"]');
        const lDot = document.querySelector('[data-testid="dot-cell-39"]');
        const fRect = fDot ? fDot.getBoundingClientRect() : null;
        const lRect = lDot ? lDot.getBoundingClientRect() : null;
        return {
          card: { left: cRect.left, right: cRect.right, width: cRect.width, pLeft: window.getComputedStyle(card).paddingLeft, pRight: window.getComputedStyle(card).paddingRight },
          clusters: { left: clRect.left, right: clRect.right, width: clRect.width, pLeft: window.getComputedStyle(clusters).paddingLeft, pRight: window.getComputedStyle(clusters).paddingRight },
          firstDot: fRect ? { left: fRect.left, distFromCardLeft: fRect.left - cRect.left } : null,
          lastDot: lRect ? { right: lRect.right, distFromCardRight: cRect.right - lRect.right } : null
        };
      })()
    `);
    console.log('[IMP-193] Measured Dots Geometry:', JSON.stringify(metrics, null, 2));
    await capturer.takeScreenshot('imp193_01_mobile_dock_and_player_card.jpg');

    // SHOT 2: Floating Transaction Badges with New Copy Phrasing
    console.log('[IMP-193] Triggering floating badges...');
    await capturer.eval(`
      (() => {
        if (!window.__gameStore) return;
        const game = window.__gameStore.getState();
        game.addFloatingText({
          id: 'badge_rent_pay',
          text: '-350 Tr.',
          playerId: 'p1',
          type: 'penalty',
          actionType: 'rent_pay',
          targetPlayerName: 'Tỷ Phú Hà Thành',
          cellIndex: 6,
          durationMs: 15000,
        });
        game.addFloatingText({
          id: 'badge_auction_win',
          text: '-650 Tr.',
          playerId: 'p1',
          type: 'penalty',
          actionType: 'auction_win',
          title: 'Thắng đấu giá Quảng Ninh ➔ Nộp Kho Bạc',
          cellIndex: 1,
          durationMs: 15000,
        });
      })()
    `);
    await sleep(800);
    console.log('[IMP-193] Capturing Shot 2: Floating Badges...');
    await capturer.takeScreenshot('imp193_02_mobile_floating_badge_copy.jpg');

    // SHOT 3: Modernized Auction Modal with District Card
    console.log('[IMP-193] Opening Auction Modal...');
    await capturer.eval(`
      (() => {
        if (!window.__gameStore) return;
        const game = window.__gameStore.getState();
        game.openModal('auction', {
          cellIndex: 1,
          currentBid: 650,
          startingBid: 400,
          highestBidderId: 'p1',
          bidderName: 'Đại Gia Sài Gòn',
          timeRemaining: 18,
          playersInfo: game.playersInfo,
          levelMap: game.levelMap,
        });
      })()
    `);
    await sleep(1000);
    console.log('[IMP-193] Capturing Shot 3: Auction Modal...');
    await capturer.takeScreenshot('imp193_03_mobile_auction_modal_district_card.jpg');

    console.log('[IMP-193] Verification captures completed successfully!');
  } catch (err) {
    console.error('[IMP-193] Error during capture:', err);
  } finally {
    await capturer.close();
  }
}

main().catch(console.error);
