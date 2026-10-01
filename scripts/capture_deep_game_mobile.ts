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

class DeepGameMobileRunner {
  private browserProc: ChildProcess | null = null;
  private ws: WebSocket | null = null;
  private messageId = 1;
  private pendingRequests = new Map<number, { resolve: (v: any) => void; reject: (e: any) => void }>();
  private port = 9360;

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
      throw new Error(`Failed to find inspectable page on port ${this.port}`);
    }

    this.ws = new WebSocket(debuggerUrl);
    await new Promise<void>((resolve, reject) => {
      this.ws!.once('open', resolve);
      this.ws!.once('error', reject);
    });

    this.ws.on('message', (raw) => {
      const msg = JSON.parse(raw.toString());
      if (msg.id && this.pendingRequests.has(msg.id)) {
        const p = this.pendingRequests.get(msg.id)!;
        this.pendingRequests.delete(msg.id);
        if (msg.error) p.reject(msg.error);
        else p.resolve(msg.result);
      }
    });

    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 2,
      mobile: true,
      fitWindow: false,
    });
    await this.send('Page.enable', {});
    await this.send('Runtime.enable', {});
  }

  send(method: string, params: any = {}): Promise<any> {
    const id = this.messageId++;
    return new Promise((resolve, reject) => {
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
    if (res.exceptionDetails) {
      console.error('Eval error:', res.exceptionDetails);
    }
    return res.result?.value;
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

  const runner = new DeepGameMobileRunner();
  try {
    console.log('Initializing Deep Game Extended Mobile Simulation (390x844)...');
    await runner.start(390, 844);
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
            ownedProperties: [1, 3, 5, 12], // BĐS thường + Ga Xe Lửa + EVN
            mortgagedProperties: [],
            bankrupt: false,
            isBot: false,
          },
          bot_1: {
            id: 'bot_1',
            name: 'Bot AI 1 (Táo Bạo)',
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
            ownedProperties: [11, 13, 28], // Viễn Thông 5G VNPT
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
    // SCREEN 13: Bot Trade Offer Modal
    // ==========================================
    console.log('Navigating to Screen 13: Bot Trade Offer Modal...');
    await runner.eval(`
      window.__gameStore.setState({
        activeModal: 'bot_trade_offer',
        modalPayload: {
          offerId: 'offer_bot_1',
          buyerId: 'bot_1',
          sellerId: 'p1',
          cellIndex: 1, // Can Tho Cai Rang
          offeredCellIndex: 8, // Binh Thuan
          price: 1500,
          expiresAt: Date.now() + 25000,
        }
      });
    `);
    await runner.captureScreenshot('13_mobile_bot_trade_offer.jpg');

    // ==========================================
    // SCREEN 14: Compulsory Buyout Modal
    // ==========================================
    console.log('Navigating to Screen 14: Compulsory Buyout Modal...');
    await runner.eval(`
      window.__gameStore.setState({
        activeModal: 'compulsory_buyout',
        modalPayload: {
          buyerId: 'p1',
          sellerId: 'bot_1',
          cellIndex: 6, // Dong Nai
          cost: 1200,
          basePrice: 1000,
          expiresAt: Date.now() + 30000,
          eligibleTargets: [6, 8, 9],
        }
      });
    `);
    await runner.captureScreenshot('14_mobile_compulsory_buyout.jpg');

    // ==========================================
    // SCREEN 15: Property Portfolio - Tab Trái Phiếu
    // ==========================================
    console.log('Navigating to Screen 15: Property Portfolio - Tab Trái Phiếu...');
    await runner.eval(`
      window.__gameStore.setState({
        activeModal: 'portfolio',
        modalPayload: { playerId: 'p1' },
      });
    `);
    await sleep(600);
    // Click on Tab Trái Phiếu
    await runner.eval(`
      const tabs = Array.from(document.querySelectorAll('button'));
      const bondTab = tabs.find(b => b.textContent && b.textContent.includes('Trái Phiếu'));
      if (bondTab) bondTab.click();
    `);
    await runner.captureScreenshot('15_mobile_bond_issuance_tab.jpg');

    // ==========================================
    // SCREEN 16: Property Portfolio - Filter Có Thể Xây & Thế Chấp
    // ==========================================
    console.log('Navigating to Screen 16: Property Portfolio - Filter Có Thể Xây...');
    await runner.eval(`
      // Switch back to properties tab, then filter 'Có Thể Xây'
      const tabs = Array.from(document.querySelectorAll('button'));
      const propTab = tabs.find(b => b.textContent && b.textContent.includes('Bất Động Sản'));
      if (propTab) propTab.click();
    `);
    await sleep(400);
    await runner.eval(`
      const pills = Array.from(document.querySelectorAll('button'));
      const buildPill = pills.find(b => b.textContent && b.textContent.includes('Có Thể Xây'));
      if (buildPill) buildPill.click();
    `);
    await runner.captureScreenshot('16_mobile_portfolio_filter_upgradeable.jpg');

    // ==========================================
    // SCREEN 17: Masterplan Modal (Urban Blueprint)
    // ==========================================
    console.log('Navigating to Screen 17: Masterplan Modal...');
    await runner.eval(`
      window.__gameStore.setState({
        activeModal: 'masterplan',
        modalPayload: { selectedCellIndex: 1 },
      });
    `);
    await runner.captureScreenshot('17_mobile_masterplan_modal.jpg');

    // ==========================================
    // SCREEN 18: Game Rules Modal
    // ==========================================
    console.log('Navigating to Screen 18: Game Rules Modal...');
    await runner.eval(`
      window.__gameStore.setState({
        activeModal: 'rules',
        modalPayload: {},
      });
    `);
    await runner.captureScreenshot('18_mobile_game_rules_modal.jpg');

    // ==========================================
    // SCREEN 19: Game Over Modal - Tab Báo Cáo FinTech
    // ==========================================
    console.log('Navigating to Screen 19: Game Over Modal - Tab FinTech...');
    await runner.eval(`
      window.__gameStore.setState({
        activeModal: 'game_over',
        modalPayload: {
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
    // Click on Tab Báo Cáo FinTech
    await runner.eval(`
      const btns = Array.from(document.querySelectorAll('button'));
      const fintechTab = btns.find(b => b.textContent && b.textContent.includes('Báo Cáo FinTech'));
      if (fintechTab) fintechTab.click();
    `);
    await runner.captureScreenshot('19_mobile_game_over_fintech.jpg');

    // ==========================================
    // SCREEN 20: Game Over Modal - Tab Danh Mục Sổ Đỏ
    // ==========================================
    console.log('Navigating to Screen 20: Game Over Modal - Tab Sổ Đỏ...');
    await runner.eval(`
      const btns = Array.from(document.querySelectorAll('button'));
      const deedsTab = btns.find(b => b.textContent && b.textContent.includes('Danh Mục Sổ Đỏ'));
      if (deedsTab) deedsTab.click();
    `);
    await runner.captureScreenshot('20_mobile_game_over_deeds.jpg');

    // ==========================================
    // SCREEN 21: Activity Feed Sidebar Drawer
    // ==========================================
    console.log('Navigating to Screen 21: Activity Feed Sidebar Drawer...');
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
    await runner.captureScreenshot('21_mobile_activity_feed_drawer.jpg');

    // ==========================================
    // SCREEN 22: Title Deed Modal - Ga Xe Lửa (Railroad)
    // ==========================================
    console.log('Navigating to Screen 22: Title Deed Modal - Ga Xe Lửa...');
    await runner.eval(`
      if (window.__activityStore) {
        window.__activityStore.setState({ isActivityFeedOpen: false });
      }
      window.__gameStore.setState({
        activeModal: 'deed',
        modalPayload: {
          cellIndex: 5, // Bến Xe Miền Đông (Railroad)
          canBuy: true,
          isBuyOpportunity: true,
          ownedProperties: [1, 3],
        }
      });
    `);
    await runner.captureScreenshot('22_mobile_title_deed_railroad.jpg');

    // ==========================================
    // SCREEN 23: Title Deed Modal - Tiện Ích Điện Lực / 5G (Utility)
    // ==========================================
    console.log('Navigating to Screen 23: Title Deed Modal - Tiện Ích Viễn Thông 5G...');
    await runner.eval(`
      window.__gameStore.setState({
        activeModal: 'deed',
        modalPayload: {
          cellIndex: 28, // Viễn Thông 5G VNPT (Utility)
          canBuy: true,
          isBuyOpportunity: true,
          ownedProperties: [1, 3, 5],
        }
      });
    `);
    await runner.captureScreenshot('23_mobile_title_deed_utility.jpg');

    // ==========================================
    // SCREEN 24: Title Deed Modal - Đất Đối Thủ Sở Hữu (Trả tiền thuê)
    // ==========================================
    console.log('Navigating to Screen 24: Title Deed Modal - Đất Đối Thủ Sở Hữu...');
    await runner.eval(`
      window.__gameStore.setState({
        activeModal: 'deed',
        modalPayload: {
          cellIndex: 6, // Đồng Nai (thuộc Bot AI 1 sở hữu, cấp 2 Khách Sạn)
          canBuy: false,
          isBuyOpportunity: false,
          ownedProperties: [1, 3, 5],
        }
      });
    `);
    await runner.captureScreenshot('24_mobile_title_deed_opponent_owned.jpg');

    // ==========================================
    // SCREEN 25: Foreclosure Auction (-30% giá sàn)
    // ==========================================
    console.log('Navigating to Screen 25: Foreclosure Auction Modal...');
    await runner.eval(`
      window.__gameStore.setState({
        activeModal: 'auction',
        modalPayload: {
          cellIndex: 11, // Nha Trang
          currentBid: 980,
          startingBid: 980,
          highestBidderId: 'bot_1',
          timeRemaining: 12,
          isForeclosure: true,
          floorPrice: 980, // 70% của 1400
          insolvencyPlayerId: 'bot_3', // Bot 3 bị vỡ nợ phát mãi tài sản
          hasPassed: false,
          passedPlayerIds: [],
        }
      });
    `);
    await runner.captureScreenshot('25_mobile_auction_foreclosure.jpg');

    // ==========================================
    // SCREEN 26: Audit / Jail Cell #10 Actions
    // ==========================================
    console.log('Navigating to Screen 26: Audit / Jail Cell #10...');
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
    await runner.captureScreenshot('26_mobile_audit_jail_cell.jpg');

    // ==========================================
    // SCREEN 27: Double Dice Rolled (Roll Again affordance)
    // ==========================================
    console.log('Navigating to Screen 27: Double Dice Rolled...');
    await runner.eval(`
      window.__gameStore.setState({
        turnPhase: 'TurnDecisions',
        hasRolledThisTurn: true,
        lastDiceRoll: { dice1: 4, dice2: 4, sum: 8, isDouble: true },
        playersInfo: {
          ...window.__gameStore.getState().playersInfo,
          p1: {
            ...window.__gameStore.getState().playersInfo['p1'],
            position: 18,
            inAudit: false,
            turnsInAudit: 0,
            consecutiveDoubles: 1,
          }
        }
      });
    `);
    await runner.captureScreenshot('27_mobile_double_dice_roll.jpg');

    console.log('\n========================================');
    console.log('🎉 DEEP SIMULATION COMPLETE: All 15 additional screens captured successfully!');
    console.log('========================================');
  } finally {
    await runner.close();
    if (previewProc) {
      previewProc.kill();
    }
  }
}

run().catch((err) => {
  console.error('Fatal error during deep game simulation:', err);
  process.exit(1);
});
