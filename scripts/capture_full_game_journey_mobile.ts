import { spawn, type ChildProcess } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';

const ARTIFACT_DIR = path.resolve('C:\\Users\\HP\\.gemini\\antigravity\\brain\\e2fe7da3-174a-4efb-a786-63a9887ae769', 'slow_game_mobile');
const REPORT_DIR = path.resolve(process.cwd(), 'docs/reports/uat/screenshots/slow_game_mobile');

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

class SlowGameMobileRunner {
  private browserProc: ChildProcess | null = null;
  private ws: WebSocket | null = null;
  private messageId = 1;
  private pendingRequests = new Map<number, { resolve: (v: any) => void; reject: (e: any) => void }>();
  private port = 9350;

  async start(width = 390, height = 844, targetUrl = 'http://localhost:4173/?room=VTTEST&host=true'): Promise<void> {
    const browserPath = findBrowser();
    if (!browserPath) throw new Error('No browser executable found');

    if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });
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
    const reportPath = path.join(REPORT_DIR, filename);
    const artPath = path.join(ARTIFACT_DIR, filename);

    fs.writeFileSync(reportPath, buffer);
    fs.writeFileSync(artPath, buffer);
    console.log(`[Captured Screen] ${filename} -> ${reportPath}`);
    return reportPath;
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

  const runner = new SlowGameMobileRunner();
  try {
    console.log('Initializing Slow Game Session on Mobile (390x844)...');
    await runner.start(390, 844);
    await sleep(4000);

    // Initial clean-up of welcome overlays
    await runner.eval(`
      document.querySelector('[data-testid="welcome-hub-overlay"]')?.remove();
      const preDeck = document.querySelector('[data-testid="pre-match-deck"]');
      if (preDeck) preDeck.style.display = 'none';
    `);
    await sleep(1000);

    // Initialize 4-player game (1 human 'p1' + 3 bots)
    await runner.eval(`
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
            { slotIndex: 1, isOccupied: true, playerId: 'bot_1', playerName: 'Bot AI 1', isHost: false },
            { slotIndex: 2, isOccupied: true, playerId: 'bot_2', playerName: 'Bot AI 2', isHost: false },
            { slotIndex: 3, isOccupied: true, playerId: 'bot_3', playerName: 'Bot AI 3', isHost: false },
          ]
        });

        const initialPlayers = {
          p1: {
            id: 'p1',
            name: 'Bạn (Chủ Phòng)',
            balance: 15000,
            tokenColor: '#EF4444',
            ownedProperties: [1, 3], // Đã mua Cần Thơ, Hậu Giang
            mortgagedProperties: [],
            bankrupt: false,
            isBot: false,
          },
          bot_1: {
            id: 'bot_1',
            name: 'Bot AI 1 (Thần Tốc)',
            balance: 14000,
            tokenColor: '#3B82F6',
            ownedProperties: [6, 8, 9], // Độc quyền nhóm Cam
            mortgagedProperties: [],
            bankrupt: false,
            isBot: true,
            personality: 'aggressive',
          },
          bot_2: {
            id: 'bot_2',
            name: 'Bot AI 2 (Cẩn Trọng)',
            balance: 18000,
            tokenColor: '#10B981',
            ownedProperties: [11, 13],
            mortgagedProperties: [],
            bankrupt: false,
            isBot: true,
            personality: 'conservative',
          },
          bot_3: {
            id: 'bot_3',
            name: 'Bot AI 3 (Đầu Cơ)',
            balance: 12000,
            tokenColor: '#F59E0B',
            ownedProperties: [16, 18],
            mortgagedProperties: [],
            bankrupt: false,
            isBot: true,
            personality: 'opportunist',
          }
        };

        const game = window.__gameStore.getState();
        game.setPlayersInfo(initialPlayers);
        game.setCurrentTurnPlayerId('p1');
        game.setRoundInfo(1, 40);
        game.setTurnTimeRemaining(59);
        game.setTurnPhase('WaitingRoll');
        game.setHasRolledThisTurn(false);
        game.setIsRolling(false);
        game.setPlayerPositions({ p1: 0, bot_1: 0, bot_2: 0, bot_3: 0 });
        game.setLevelMap({ 1: 0, 3: 0, 6: 1, 8: 1, 9: 1, 11: 0, 13: 0, 16: 0, 18: 0 });
        game.closeModal();
      })()
    `);
    await sleep(1500);

    // =========================================================================
    // SCREEN 1: Bàn Cờ Khi Bắt Đầu Ván Đấu & Chờ Đổ Xúc Xắc (WaitingRoll)
    // =========================================================================
    console.log('[Phase 1] Capturing Screen 1: Game Start & Waiting Roll...');
    await runner.takeScreenshot('01_mobile_game_start.jpg');

    // =========================================================================
    // SCREEN 2: Sau Khi Đổ Xúc Xắc & Di Chuyển Đến Ô Đất (ActionPhase)
    // =========================================================================
    console.log('[Phase 2] Capturing Screen 2: Dice Rolled (5 + 3 = 8) & Action Phase...');
    await runner.eval(`
      (() => {
        const game = window.__gameStore.getState();
        window.__gameStore.setState({
          dice: [5, 3],
          hasRolledThisTurn: true,
          turnPhase: 'ActionPhase',
          hasUserCustomCamera: true, // Kích hoạt nút Góc Nhìn Chuẩn để test de-collision
          playerPositions: { p1: 8, bot_1: 0, bot_2: 0, bot_3: 0 }
        });
      })()
    `);
    await sleep(1500);
    await runner.takeScreenshot('02_mobile_dice_rolled.jpg');

    // =========================================================================
    // SCREEN 3: Mở Sổ Đỏ / Quyết Định Mua BĐS (Title Deed Modal)
    // =========================================================================
    console.log('[Phase 3] Capturing Screen 3: Title Deed / Purchase Decision Modal...');
    await runner.eval(`
      (() => {
        const game = window.__gameStore.getState();
        game.openModal('deed', {
          cellIndex: 6, // Bình Dương
          canBuy: true,
          isBuyOpportunity: true,
          ownedProperties: [1, 3]
        });
      })()
    `);
    await sleep(1500);
    await runner.takeScreenshot('03_mobile_title_deed_buy.jpg');

    // =========================================================================
    // SCREEN 4: Phiên Đấu Giá Công Khai Giữa 4 Người Chơi (Auction Modal)
    // =========================================================================
    console.log('[Phase 4] Capturing Screen 4: Live Auction Modal with 4 Players...');
    await runner.eval(`
      (() => {
        const game = window.__gameStore.getState();
        game.openModal('auction', {
          cellIndex: 6, // Bình Dương
          currentBid: 2800,
          startingBid: 2000,
          highestBidderId: 'bot_1',
          timeRemaining: 12,
          hasPassed: false,
          passedPlayerIds: ['bot_3'],
          myId: 'p1',
        });
      })()
    `);
    await sleep(1500);
    await runner.takeScreenshot('04_mobile_auction_live.jpg');

    // =========================================================================
    // SCREEN 5: Rút Thẻ Sự Kiện Thị Trường Vĩ Mô (Market Event Modal)
    // =========================================================================
    console.log('[Phase 5] Capturing Screen 5: Market Event Modal...');
    await runner.eval(`
      (() => {
        const game = window.__gameStore.getState();
        game.openModal('event', {
          cardType: 'market',
          cardId: 'MC_LAND_FEVER',
          title: 'Sốt Đất Đô Thị Vệ Tinh',
          description: 'Làn sóng đầu tư công và hạ tầng vành đai thúc đẩy giá chuyển nhượng đất và tiền thuê tăng vọt +50% trong 2 vòng.',
          activeModifier: {
            type: 'MC_LAND_FEVER',
            remainingRounds: 2,
            affectedCells: [1, 3, 6, 8, 9, 11]
          }
        });
      })()
    `);
    await sleep(1500);
    await runner.takeScreenshot('05_mobile_market_event.jpg');

    // =========================================================================
    // SCREEN 6: Rút Thẻ Cơ Hội / Khí Vận Bất Ngờ (Chance Card Modal)
    // =========================================================================
    console.log('[Phase 6] Capturing Screen 6: Chance Card Modal...');
    await runner.eval(`
      (() => {
        const game = window.__gameStore.getState();
        game.openModal('event', {
          cardType: 'chance',
          cardId: 'CC_TAX_AUDIT',
          title: 'Thanh Tra Thuế Đột Xuất',
          description: 'Cơ quan thuế tiến hành kiểm toán doanh nghiệp. Bạn phải nộp phạt 500 Tr. cho mỗi công trình cấp 2 trở lên hoặc vào Khu Kiểm Toán.',
          effectDelta: -1000,
        });
      })()
    `);
    await sleep(1500);
    await runner.takeScreenshot('06_mobile_chance_card.jpg');

    // =========================================================================
    // SCREEN 7: Danh Mục Tài Sản Sở Hữu (Property Portfolio Modal)
    // =========================================================================
    console.log('[Phase 7] Capturing Screen 7: Property Portfolio Modal...');
    await runner.eval(`
      (() => {
        const game = window.__gameStore.getState();
        game.openModal('portfolio', {
          playerId: 'p1'
        });
      })()
    `);
    await sleep(1500);
    await runner.takeScreenshot('07_mobile_property_portfolio.jpg');

    // =========================================================================
    // SCREEN 8: Đàm Phán & Trao Đổi Song Phương P2P (Trade Modal)
    // =========================================================================
    console.log('[Phase 8] Capturing Screen 8: P2P Trade Negotiation Modal...');
    await runner.eval(`
      (() => {
        const game = window.__gameStore.getState();
        game.openModal('trade', {
          targetPlayerId: 'bot_1',
          offeredProperties: [1],
          requestedProperties: [6],
          cashOffer: 500,
          cashRequest: 0
        });
      })()
    `);
    await sleep(1500);
    await runner.takeScreenshot('08_mobile_trade_negotiation.jpg');

    // =========================================================================
    // SCREEN 9: Sàn Giao Dịch Chứng Khoán HOSE (HOSE Mini-Game Modal)
    // =========================================================================
    console.log('[Phase 9] Capturing Screen 9: HOSE Stock Exchange Modal...');
    await runner.eval(`
      (() => {
        const game = window.__gameStore.getState();
        game.openModal('hose', {
          minStake: 500,
          maxStake: 5000,
          currentStake: 1000,
          lastDiceRoll: 11,
          lastMultiplier: 2.5,
          lastProfit: 1500,
          isReviewingResult: true
        });
      })()
    `);
    await sleep(1500);
    await runner.takeScreenshot('09_mobile_hose_stock_exchange.jpg');

    // =========================================================================
    // SCREEN 10: Xử Lý Khủng Hoảng Nợ & Mất Khả Năng Thanh Toán (Insolvency Modal)
    // =========================================================================
    console.log('[Phase 10] Capturing Screen 10: Insolvency & Debt Crisis Modal...');
    await runner.eval(`
      (() => {
        const game = window.__gameStore.getState();
        game.openModal('insolvency', {
          playerId: 'p1',
          deficit: 4500
        });
      })()
    `);
    await sleep(1500);
    await runner.takeScreenshot('10_mobile_insolvency_crisis.jpg');

    // =========================================================================
    // SCREEN 11: Bảng HUD Người Chơi Mở Rộng & Thẻ Phá Sản (Player HUD List)
    // =========================================================================
    console.log('[Phase 11] Capturing Screen 11: Expanded Player HUD List with Bankrupt Card...');
    await runner.eval(`
      (() => {
        const game = window.__gameStore.getState();
        game.closeModal();
        const updatedPlayers = {
          p1: {
            id: 'p1',
            name: 'Bạn (Dẫn Đầu)',
            balance: 24500,
            tokenColor: '#EF4444',
            ownedProperties: [1, 3, 6],
            mortgagedProperties: [],
            bankrupt: false,
            isBot: false,
          },
          bot_1: {
            id: 'bot_1',
            name: 'Bot AI 1',
            balance: 11000,
            tokenColor: '#3B82F6',
            ownedProperties: [8, 9],
            mortgagedProperties: [],
            bankrupt: false,
            isBot: true,
          },
          bot_2: {
            id: 'bot_2',
            name: 'Bot AI 2',
            balance: 6200,
            tokenColor: '#10B981',
            ownedProperties: [11],
            mortgagedProperties: [11],
            bankrupt: false,
            isBot: true,
          },
          bot_3: {
            id: 'bot_3',
            name: 'Bot AI 3 (Vỡ Nợ)',
            balance: -4800,
            tokenColor: '#64748B',
            ownedProperties: [],
            mortgagedProperties: [],
            bankrupt: true, // Bankrupt player
            isBot: true,
          }
        };
        window.__gameStore.setState({
          isPlayerHudVisible: true,
          playersInfo: updatedPlayers,
          activeModal: null
        });
      })()
    `);
    await sleep(1500);
    await runner.takeScreenshot('11_mobile_player_hud_expanded.jpg');

    // =========================================================================
    // SCREEN 12: Tổng Kết Trận Đấu & Vinh Danh Chiến Thắng (Game Over / Victory)
    // =========================================================================
    console.log('[Phase 12] Capturing Screen 12: Game Over / Victory Modal...');
    await runner.eval(`
      (() => {
        const game = window.__gameStore.getState();
        window.__gameStore.setState({ isPlayerHudVisible: false });
        game.openModal('game_over', {
          leaderboard: [
            { id: 'p1', netWorth: 48500 },
            { id: 'bot_1', netWorth: 22000 },
            { id: 'bot_2', netWorth: 12500 },
            { id: 'bot_3', netWorth: 0 },
          ]
        });
      })()
    `);
    await sleep(1500);
    await runner.takeScreenshot('12_mobile_game_over_victory.jpg');

    console.log('🎉 Full 12-Screen Mobile Game Journey Captured Successfully!');
  } finally {
    await runner.close();
    if (previewProc) previewProc.kill();
  }
}

run().catch((err) => {
  console.error('Error running slow game mobile journey:', err);
  process.exit(1);
});
