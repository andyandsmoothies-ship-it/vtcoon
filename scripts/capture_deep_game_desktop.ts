import { spawn, type ChildProcess } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';

const ARTIFACT_DIR = path.resolve('C:\\Users\\HP\\.gemini\\antigravity\\brain\\e2fe7da3-174a-4efb-a786-63a9887ae769', 'slow_game_desktop');
const REPORT_DIR = path.resolve(process.cwd(), 'docs/reports/uat/screenshots/slow_game_desktop');

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

class DeepGameDesktopRunner {
  private browserProc: ChildProcess | null = null;
  private ws: WebSocket | null = null;
  private messageId = 1;
  private pendingRequests = new Map<number, { resolve: (v: any) => void; reject: (e: any) => void }>();
  private port = 9362;

  async start(width = 1920, height = 1080, targetUrl = 'http://localhost:4173/?room=VTTEST&host=true'): Promise<void> {
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
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
    });
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

  async captureScreenshot(filename: string): Promise<string> {
    await sleep(600);
    const data = await this.send('Page.captureScreenshot', {
      format: 'jpeg',
      quality: 85,
    });
    const buffer = Buffer.from(data.data, 'base64');
    const reportPath = path.join(REPORT_DIR, filename);
    const artifactPath = path.join(ARTIFACT_DIR, filename);

    fs.writeFileSync(reportPath, buffer);
    fs.writeFileSync(artifactPath, buffer);
    console.log(`[Captured] ${filename} (${buffer.length} bytes) -> Saved to report & artifact.`);
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

  const runner = new DeepGameDesktopRunner();
  try {
    console.log('Initializing Deep Game Extended Desktop Simulation (1920x1080)...');
    await runner.start(1920, 1080);
    await sleep(4000);

    // Initial clean-up of welcome overlays
    await runner.eval(`
      document.querySelector('[data-testid="welcome-hub-overlay"]')?.remove();
      const preDeck = document.querySelector('[data-testid="pre-match-deck"]');
      if (preDeck) preDeck.style.display = 'none';
    `);
    await sleep(1000);

    // Initialize full game state
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

        const players = {
          p1: {
            id: 'p1',
            name: 'Bạn (Chủ Phòng)',
            balance: 15000,
            tokenColor: '#EF4444',
            ownedProperties: [1, 3, 5, 12],
            mortgagedProperties: [],
            bankrupt: false,
            isBot: false,
          },
          bot_1: {
            id: 'bot_1',
            name: 'Bot AI 1 (Táo Bạo)',
            balance: 14000,
            tokenColor: '#3B82F6',
            ownedProperties: [6, 8, 9],
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
            ownedProperties: [11, 13, 28],
            mortgagedProperties: [],
            bankrupt: false,
            isBot: true,
            personality: 'conservative',
          },
          bot_3: {
            id: 'bot_3',
            name: 'Bot AI 3 (Cân Bằng)',
            balance: 12000,
            tokenColor: '#F59E0B',
            ownedProperties: [16, 18],
            mortgagedProperties: [],
            bankrupt: false,
            isBot: true,
            personality: 'balanced',
          },
        };

        window.__gameStore.setState({
          gameStarted: true,
          roundNumber: 8,
          maxRounds: 40,
          turnTimeRemaining: 42,
          currentTurnPlayerId: 'p1',
          turnPhase: 'WaitingRoll',
          playersInfo: players,
          playerCount: 4,
          levelMap: { 1: 0, 3: 0, 6: 2, 8: 2, 9: 3, 11: 1, 13: 1 },
          activeModifiers: [
            { type: 'TAX_INSPECTION', remainingRounds: 2, affectedCells: [10] },
            { type: 'TOURISM_BOOM', remainingRounds: 3, affectedCells: [1, 3] }
          ],
          activeModal: null,
          modalPayload: null,
        });
      })();
    `);
    await sleep(1500);

    // ==========================================
    // SCREEN 01: 3D Board Overview
    // ==========================================
    console.log('Capturing Screen 01: 3D Board Overview Desktop...');
    await runner.captureScreenshot('01_desktop_board_overview.jpg');

    // ==========================================
    // SCREEN 02: Active Market Event Tickers
    // ==========================================
    console.log('Capturing Screen 02: Active Market Events Desktop...');
    await runner.eval(`
      window.__gameStore.setState({
        activeModifiers: [
          { type: 'TOURISM_BOOM', remainingRounds: 3, affectedCells: [1, 3] },
          { type: 'LAND_FEVER', remainingRounds: 2, affectedCells: [6, 8, 9] },
          { type: 'CREDIT_CRUNCH', remainingRounds: 1, affectedCells: [] }
        ]
      });
    `);
    await runner.captureScreenshot('02_desktop_active_market_events.jpg');

    // ==========================================
    // SCREEN 03: Purchase Decision - Unowned Land
    // ==========================================
    console.log('Capturing Screen 03: Purchase Decision Unowned Land...');
    await runner.eval(`
      window.__gameStore.setState({
        turnPhase: 'TurnDecisions',
        activeModal: 'deed',
        modalPayload: {
          cellIndex: 1,
          canBuy: true,
          isBuyOpportunity: true,
          ownedProperties: [],
        }
      });
    `);
    await runner.captureScreenshot('03_desktop_purchase_decision_unowned.jpg');

    // ==========================================
    // SCREEN 04: Purchase Decision - Shortfall / Mortgage
    // ==========================================
    console.log('Capturing Screen 04: Purchase Decision Shortfall...');
    await runner.eval(`
      window.__gameStore.setState({
        modalPayload: {
          cellIndex: 39,
          canBuy: false,
          isBuyOpportunity: true,
          shortfall: 2000,
          canCoverWithMortgage: true,
          totalMortgageCapacity: 3500,
          ownedProperties: [1, 3, 5],
        }
      });
    `);
    await runner.captureScreenshot('04_desktop_purchase_decision_shortfall.jpg');

    // ==========================================
    // SCREEN 05: Title Deed Modal - Own Property
    // ==========================================
    console.log('Capturing Screen 05: Title Deed Modal (Own Property)...');
    await runner.eval(`
      window.__gameStore.setState({
        modalPayload: {
          cellIndex: 1,
          canBuy: false,
          isBuyOpportunity: false,
          ownedProperties: [1, 3, 5],
        }
      });
    `);
    await runner.captureScreenshot('05_desktop_title_deed_own_property.jpg');

    // ==========================================
    // SCREEN 06: Live Auction Modal
    // ==========================================
    console.log('Capturing Screen 06: Live Auction Modal...');
    await runner.eval(`
      window.__gameStore.setState({
        activeModal: 'auction',
        modalPayload: {
          cellIndex: 14,
          currentBid: 1600,
          startingBid: 1000,
          highestBidderId: 'bot_1',
          timeRemaining: 9,
          hasPassed: false,
          passedPlayerIds: ['bot_3'],
          declinedPlayerId: null,
        }
      });
    `);
    await runner.captureScreenshot('06_desktop_auction_modal_bidding.jpg');

    // ==========================================
    // SCREEN 07: Event Card Modal
    // ==========================================
    console.log('Capturing Screen 07: Event Card Modal...');
    await runner.eval(`
      window.__gameStore.setState({
        activeModal: 'event',
        modalPayload: {
          cardType: 'opportunity',
          cardId: 'OPP_CLEAN_ENERGY',
          title: 'Dự Án Năng Lượng Tái Tạo',
          description: 'Chính phủ phê duyệt gói trợ giá điện mặt trời và điện gió. Bạn nhận 1.000 Tr. hỗ trợ và miễn toàn bộ tiền điện trong 3 vòng kế tiếp.',
          effectDelta: 1000,
          targetScope: 'GLOBAL',
          duration: 3,
        }
      });
    `);
    await runner.captureScreenshot('07_desktop_event_card_modal.jpg');

    // ==========================================
    // SCREEN 08: P2P Trade Negotiation Modal
    // ==========================================
    console.log('Capturing Screen 08: P2P Trade Modal...');
    await runner.eval(`
      window.__gameStore.setState({
        activeModal: 'trade',
        modalPayload: {
          targetPlayerId: 'bot_1',
          offeredProperties: [1],
          requestedProperties: [6],
          cashOffer: 500,
          cashRequest: 0,
        }
      });
    `);
    await runner.captureScreenshot('08_desktop_trade_modal_overview.jpg');

    // ==========================================
    // SCREEN 09: HOSE Stock Exchange Modal
    // ==========================================
    console.log('Capturing Screen 09: HOSE Stock Exchange Modal...');
    await runner.eval(`
      window.__gameStore.setState({
        activeModal: 'hose',
        modalPayload: {
          currentStake: 1000,
          lastDiceRoll: 5,
          lastPayout: 2500,
          isReviewingResult: false,
        }
      });
    `);
    await runner.captureScreenshot('09_desktop_hose_stock_exchange.jpg');

    // ==========================================
    // SCREEN 10: Insolvency Crisis Banner
    // ==========================================
    console.log('Capturing Screen 10: Insolvency Crisis Modal...');
    await runner.eval(`
      window.__gameStore.setState({
        activeModal: 'insolvency',
        modalPayload: {
          playerId: 'p1',
          deficit: 2500,
        }
      });
    `);
    await runner.captureScreenshot('10_desktop_insolvency_crisis.jpg');

    // ==========================================
    // SCREEN 11: Expanded Player HUD List
    // ==========================================
    console.log('Capturing Screen 11: Expanded Player HUD List...');
    await runner.eval(`
      window.__gameStore.setState({
        activeModal: null,
        modalPayload: null,
        isPlayerHudVisible: true,
      });
    `);
    await runner.captureScreenshot('11_desktop_player_hud_expanded.jpg');

    // ==========================================
    // SCREEN 12: Game Over - Victory Coronation
    // ==========================================
    console.log('Capturing Screen 12: Game Over Victory Modal...');
    await runner.eval(`
      window.__gameStore.setState({
        isPlayerHudVisible: false,
        activeModal: 'game_over',
        modalPayload: {
          winnerId: 'p1',
          leaderboard: [
            { id: 'p1', name: 'Bạn (Dẫn Đầu)', rank: 1, netWorth: 48500, cash: 18500, propertyValue: 30000, propertiesCount: 4, roi: 223.3 },
            { id: 'bot_1', name: 'Bot AI 1', rank: 2, netWorth: 22000, cash: 7000, propertyValue: 15000, propertiesCount: 3, roi: 46.7 },
            { id: 'bot_2', name: 'Bot AI 2', rank: 3, netWorth: 12500, cash: 4500, propertyValue: 8000, propertiesCount: 2, roi: -16.7 },
            { id: 'bot_3', name: 'Bot AI 3', rank: 4, netWorth: 0, cash: 0, propertyValue: 0, propertiesCount: 0, roi: -100, isBankrupt: true },
          ]
        },
      });
    `);
    await runner.captureScreenshot('12_desktop_game_over_victory.jpg');

    // ==========================================
    // SCREEN 13: Bot Trade Offer Modal
    // ==========================================
    console.log('Capturing Screen 13: Bot Trade Offer Modal...');
    await runner.eval(`
      window.__gameStore.setState({
        activeModal: 'bot_trade_offer',
        modalPayload: {
          offerId: 'offer_bot_1',
          buyerId: 'bot_1',
          sellerId: 'p1',
          cellIndex: 1,
          offeredCellIndex: 8,
          price: 1500,
          expiresAt: Date.now() + 25000,
        }
      });
    `);
    await runner.captureScreenshot('13_desktop_bot_trade_offer.jpg');

    // ==========================================
    // SCREEN 14: Compulsory Buyout Modal
    // ==========================================
    console.log('Capturing Screen 14: Compulsory Buyout Modal...');
    await runner.eval(`
      window.__gameStore.setState({
        activeModal: 'compulsory_buyout',
        modalPayload: {
          buyerId: 'p1',
          sellerId: 'bot_1',
          cellIndex: 6,
          cost: 1200,
          basePrice: 1000,
          expiresAt: Date.now() + 30000,
          eligibleTargets: [6, 8, 9],
        }
      });
    `);
    await runner.captureScreenshot('14_desktop_compulsory_buyout.jpg');

    // ==========================================
    // SCREEN 15: Property Portfolio - Tab Trái Phiếu
    // ==========================================
    console.log('Capturing Screen 15: Property Portfolio - Tab Trái Phiếu...');
    await runner.eval(`
      window.__gameStore.setState({
        activeModal: 'portfolio',
        modalPayload: { playerId: 'p1' },
      });
    `);
    await sleep(600);
    await runner.eval(`
      const tabs = Array.from(document.querySelectorAll('button'));
      const bondTab = tabs.find(b => b.textContent && b.textContent.includes('Trái Phiếu'));
      if (bondTab) bondTab.click();
    `);
    await runner.captureScreenshot('15_desktop_bond_issuance_tab.jpg');

    // ==========================================
    // SCREEN 16: Property Portfolio - Tab Danh Mục BĐS
    // ==========================================
    console.log('Capturing Screen 16: Property Portfolio - Tab BĐS...');
    await runner.eval(`
      const tabs = Array.from(document.querySelectorAll('button'));
      const propTab = tabs.find(b => b.textContent && b.textContent.includes('Bất Động Sản'));
      if (propTab) propTab.click();
    `);
    await runner.captureScreenshot('16_desktop_portfolio_filter_upgradeable.jpg');

    // ==========================================
    // SCREEN 17: Urban Masterplan Modal
    // ==========================================
    console.log('Capturing Screen 17: Masterplan Modal...');
    await runner.eval(`
      window.__gameStore.setState({
        activeModal: 'masterplan',
        modalPayload: {},
      });
    `);
    await runner.captureScreenshot('17_desktop_masterplan_modal.jpg');

    // ==========================================
    // SCREEN 18: Game Rules Modal
    // ==========================================
    console.log('Capturing Screen 18: Game Rules Guidebook...');
    await runner.eval(`
      window.__gameStore.setState({
        activeModal: 'rules',
        modalPayload: {},
      });
    `);
    await runner.captureScreenshot('18_desktop_game_rules_modal.jpg');

    // ==========================================
    // SCREEN 19: Game Over Modal - Tab FinTech
    // ==========================================
    console.log('Capturing Screen 19: Game Over Modal - Tab FinTech...');
    await runner.eval(`
      window.__gameStore.setState({
        activeModal: 'game_over',
        modalPayload: {
          winnerId: 'p1',
          leaderboard: [
            { id: 'p1', name: 'Bạn (Dẫn Đầu)', rank: 1, netWorth: 48500, cash: 18500, propertyValue: 30000, propertiesCount: 4, roi: 223.3 },
            { id: 'bot_1', name: 'Bot AI 1', rank: 2, netWorth: 22000, cash: 7000, propertyValue: 15000, propertiesCount: 3, roi: 46.7 },
            { id: 'bot_2', name: 'Bot AI 2', rank: 3, netWorth: 12500, cash: 4500, propertyValue: 8000, propertiesCount: 2, roi: -16.7 },
            { id: 'bot_3', name: 'Bot AI 3', rank: 4, netWorth: 0, cash: 0, propertyValue: 0, propertiesCount: 0, roi: -100, isBankrupt: true },
          ]
        },
      });
    `);
    await sleep(600);
    await runner.eval(`
      const btns = Array.from(document.querySelectorAll('button'));
      const fintechTab = btns.find(b => b.textContent && b.textContent.includes('Báo Cáo FinTech'));
      if (fintechTab) fintechTab.click();
    `);
    await runner.captureScreenshot('19_desktop_game_over_fintech.jpg');

    // ==========================================
    // SCREEN 20: Game Over Modal - Tab Sổ Đỏ
    // ==========================================
    console.log('Capturing Screen 20: Game Over Modal - Tab Sổ Đỏ...');
    await runner.eval(`
      const btns = Array.from(document.querySelectorAll('button'));
      const deedsTab = btns.find(b => b.textContent && b.textContent.includes('Danh Mục Sổ Đỏ'));
      if (deedsTab) deedsTab.click();
    `);
    await runner.captureScreenshot('20_desktop_game_over_deeds.jpg');

    // ==========================================
    // SCREEN 21: Activity Feed Sidebar Drawer
    // ==========================================
    console.log('Capturing Screen 21: Activity Feed Sidebar Drawer...');
    await runner.eval(`
      window.__gameStore.setState({ activeModal: null, modalPayload: null });
      if (window.__activityStore) {
        window.__activityStore.setState({
          isActivityFeedOpen: true,
          activities: [
            { id: '1', timestamp: Date.now() - 60000, type: 'DICE_ROLLED', text: 'Bạn đã đổ được 5 + 3 = 8 điểm.' },
            { id: '2', timestamp: Date.now() - 45000, type: 'PROPERTY_BOUGHT', text: 'Bạn đã mua ô #1 Cần Thơ với giá 600 Tr.' },
            { id: '3', timestamp: Date.now() - 30000, type: 'RENT_PAID', text: 'Bot AI 1 trả cho bạn 120 Tr. tiền thuê tại Cần Thơ.' },
            { id: '4', timestamp: Date.now() - 15000, type: 'EVENT_CARD', text: 'Sự kiện thị trường: Sốt Đất Đô Thị Vệ Tinh (+30% tiền thuê).' },
            { id: '5', timestamp: Date.now() - 5000, type: 'BOND_ISSUED', text: 'Bot AI 2 phát hành 3.000 Tr. Trái phiếu doanh nghiệp.' },
          ]
        });
      }
    `);
    await runner.captureScreenshot('21_desktop_activity_feed_drawer.jpg');

    // ==========================================
    // SCREEN 22: Title Deed Modal - Ga Xe Lửa (Railroad)
    // ==========================================
    console.log('Capturing Screen 22: Title Deed Modal - Ga Xe Lửa...');
    await runner.eval(`
      if (window.__activityStore) {
        window.__activityStore.setState({ isActivityFeedOpen: false });
      }
      window.__gameStore.setState({
        activeModal: 'deed',
        modalPayload: {
          cellIndex: 5,
          canBuy: true,
          isBuyOpportunity: true,
          ownedProperties: [1, 3],
        }
      });
    `);
    await runner.captureScreenshot('22_desktop_title_deed_railroad.jpg');

    // ==========================================
    // SCREEN 23: Title Deed Modal - Tiện Ích Viễn Thông 5G (Utility)
    // ==========================================
    console.log('Capturing Screen 23: Title Deed Modal - Tiện Ích Viễn Thông 5G...');
    await runner.eval(`
      window.__gameStore.setState({
        activeModal: 'deed',
        modalPayload: {
          cellIndex: 28,
          canBuy: true,
          isBuyOpportunity: true,
          ownedProperties: [1, 3, 5],
        }
      });
    `);
    await runner.captureScreenshot('23_desktop_title_deed_utility.jpg');

    // ==========================================
    // SCREEN 24: Title Deed Modal - Đất Đối Thủ Sở Hữu
    // ==========================================
    console.log('Capturing Screen 24: Title Deed Modal - Đất Đối Thủ Sở Hữu...');
    await runner.eval(`
      window.__gameStore.setState({
        activeModal: 'deed',
        modalPayload: {
          cellIndex: 6,
          canBuy: false,
          isBuyOpportunity: false,
          ownedProperties: [1, 3, 5],
        }
      });
    `);
    await runner.captureScreenshot('24_desktop_title_deed_opponent_owned.jpg');

    // ==========================================
    // SCREEN 25: Foreclosure Auction (-30% giá sàn)
    // ==========================================
    console.log('Capturing Screen 25: Foreclosure Auction Modal...');
    await runner.eval(`
      window.__gameStore.setState({
        activeModal: 'auction',
        modalPayload: {
          cellIndex: 11,
          currentBid: 980,
          startingBid: 980,
          highestBidderId: 'bot_1',
          timeRemaining: 12,
          isForeclosure: true,
          floorPrice: 980,
          insolvencyPlayerId: 'bot_3',
          hasPassed: false,
          passedPlayerIds: [],
        }
      });
    `);
    await runner.captureScreenshot('25_desktop_auction_foreclosure.jpg');

    // ==========================================
    // SCREEN 26: Audit / Jail Cell #10 Actions
    // ==========================================
    console.log('Capturing Screen 26: Audit / Jail Cell #10...');
    await runner.eval(`
      window.__gameStore.setState({
        activeModal: null,
        modalPayload: null,
        turnPhase: 'TurnDecisions',
        hasRolledThisTurn: false,
        playersInfo: {
          ...window.__gameStore.getState().playersInfo,
          p1: {
            ...window.__gameStore.getState().playersInfo['p1'],
            position: 10,
            inAudit: true,
            turnsInAudit: 2,
            hasDiplomaticImmunity: true,
          }
        }
      });
    `);
    await runner.captureScreenshot('26_desktop_audit_jail_cell.jpg');

    // ==========================================
    // SCREEN 27: Double Dice Roll Overlay
    // ==========================================
    console.log('Capturing Screen 27: Double Dice Roll Overlay...');
    await runner.eval(`
      window.__gameStore.setState({
        dice: [5, 5],
        isRolling: false,
        hasRolledThisTurn: true,
        consecutiveDoubles: 1,
      });
    `);
    await runner.captureScreenshot('27_desktop_double_dice_roll.jpg');

    console.log('🎉 COMPLETED: All 27 physical desktop screenshots successfully captured!');
  } finally {
    await runner.close();
    if (previewProc) {
      previewProc.kill();
    }
  }
}

run().catch((err) => {
  console.error('Error during desktop simulation capture:', err);
  process.exit(1);
});
