import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const WebSocket = require('c:/Users/HP/Documents/GitHub/vtcoon/node_modules/ws');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TARGET_URL = 'http://127.0.0.1:3000/';
const ARTIFACT_DIR = 'C:/Users/HP/.gemini/antigravity/brain/72ac024d-b1c0-488c-a838-d31e5025c00d';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fetchJson(url) {
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

async function main() {
  console.log('Launching headless Chrome for Full-App Journey Survey...');
  const tempDir = `C:\\Users\\HP\\AppData\\Local\\Temp\\chrome_survey_${Date.now()}`;
  fs.mkdirSync(tempDir, { recursive: true });

  const chromeProc = spawn(
    CHROME_PATH,
    [
      '--headless=new',
      '--remote-debugging-port=9222',
      '--window-size=1600,1000',
      '--no-first-run',
      '--no-default-browser-check',
      `--user-data-dir=${tempDir}`,
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      TARGET_URL,
    ],
    { stdio: 'ignore' }
  );

  let debuggerUrl = null;
  for (let i = 0; i < 30; i++) {
    await sleep(500);
    try {
      const list = await fetchJson('http://127.0.0.1:9222/json/list');
      const page = list.find((t) => t.type === 'page' && t.url.includes('127.0.0.1:3000'));
      if (page && page.webSocketDebuggerUrl) {
        debuggerUrl = page.webSocketDebuggerUrl;
        break;
      }
    } catch {}
  }

  if (!debuggerUrl) {
    console.error('Failed to get webSocketDebuggerUrl from Chrome!');
    chromeProc.kill();
    process.exit(1);
  }

  const ws = new WebSocket(debuggerUrl);
  await new Promise((res, rej) => {
    ws.on('open', res);
    ws.on('error', rej);
  });

  let messageId = 1;
  const pendingRequests = new Map();
  ws.on('message', (raw) => {
    const msg = JSON.parse(raw.toString());
    if (msg.id && pendingRequests.has(msg.id)) {
      const { resolve, reject } = pendingRequests.get(msg.id);
      pendingRequests.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  });

  function sendCmd(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = messageId++;
      pendingRequests.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await sendCmd('Page.enable');
  await sendCmd('Network.enable');
  await sendCmd('Network.setCacheDisabled', { cacheDisabled: true });
  await sendCmd('Runtime.enable');
  await sleep(2500);

  async function captureShot(filename, description) {
    console.log(`[CAPTURING] ${filename} — ${description}`);
    await sleep(1000);
    const shot = await sendCmd('Page.captureScreenshot', { format: 'png' });
    const targetPath = `${ARTIFACT_DIR}\\${filename}`;
    fs.writeFileSync(targetPath, Buffer.from(shot.data, 'base64'));
    console.log(`[SAVED] ${targetPath}`);
  }

  async function evalInPage(fnString) {
    return sendCmd('Runtime.evaluate', {
      expression: `(${fnString})()`,
      returnByValue: true,
    });
  }

  // ==========================================
  // CASE 1: Trang chủ Sảnh Chờ ban đầu (Lobby Initial State)
  // ==========================================
  await evalInPage(`() => {
    window.__lobbyStore.getState().resetLobby();
    window.__lobbyStore.getState().initLobby('VT8888', 'p1', true, 'Đại Gia Sài Gòn');
    window.__lobbyStore.getState().setGameStarted(false);
    return true;
  }`);
  await captureShot('journey_01_lobby_initial.png', 'Màn hình Trang chủ Sảnh Chờ ban đầu với 1 người chơi Host');

  // ==========================================
  // CASE 2: Sảnh Chờ khi thêm đủ 3 Bot AI (Lobby with Bots)
  // ==========================================
  await evalInPage(`() => {
    const lobby = window.__lobbyStore.getState();
    lobby.toggleBotSlot(1, 'Cautious');
    lobby.toggleBotSlot(2, 'Aggressive');
    lobby.toggleBotSlot(3, 'Balanced');
    return true;
  }`);
  await captureShot('journey_02_lobby_with_bots.png', 'Sảnh Chờ khi thêm 3 Bot AI với đủ các tính cách và nút Bắt đầu sáng');

  // ==========================================
  // CASE 3: Vào Trận — Toàn cảnh Bàn Cờ Mặc Định (Fresh In-Game Board)
  // ==========================================
  await evalInPage(`() => {
    const lobby = window.__lobbyStore.getState();
    lobby.setGameStarted(true);

    const game = window.__gameStore.getState();
    game.closeModal();
    game.setPlayersInfo({
      p1: { id: 'p1', name: 'Đại Gia Sài Gòn', balance: 15000, tokenColor: '#ef4444', ownedProperties: [1, 3] },
      p2: { id: 'p2', name: 'Tỷ Phú Hà Nội (Bot)', balance: 14000, tokenColor: '#3b82f6', ownedProperties: [16, 18], isBot: true },
      p3: { id: 'p3', name: 'Đại Gia Đà Nẵng (Bot)', balance: 14500, tokenColor: '#10b981', ownedProperties: [31], isBot: true },
      p4: { id: 'p4', name: 'Bạch Thủ Phú Quốc (Bot)', balance: 13500, tokenColor: '#f59e0b', ownedProperties: [37], isBot: true }
    });
    game.setCurrentTurnPlayerId('p1');
    game.setPlayerPositions({ p1: 0, p2: 0, p3: 0, p4: 0 });
    game.setDice([0, 0]);
    game.setLevelMap({ 1: 1, 3: 0, 16: 1, 18: 0, 31: 0, 37: 0 });
    game.setTurnTimeRemaining(60);
    game.setTreasuryPool(2000);
    game.setRoundInfo(1, 30);
    return true;
  }`);
  await captureShot('journey_03_ingame_board_overview.png', 'Toàn cảnh Bàn cờ khi vừa bắt đầu trận đấu, HUD và ActionDock đầy đủ');

  // ==========================================
  // CASE 4: Modal Sổ Đỏ khi xem Ô đất chưa ai mua (Title Deed Unowned)
  // ==========================================
  await evalInPage(`() => {
    const game = window.__gameStore.getState();
    game.openModal('deed', { cellIndex: 39, canBuy: true });
    return true;
  }`);
  await captureShot('journey_04_modal_title_deed_unowned.png', 'Modal Sổ Đỏ mở xem ô đất Nguyễn Huệ (chưa mua), nút Mua BĐS & Bỏ Qua');

  // ==========================================
  // CASE 5: Modal Sổ Đỏ khi xem Ô đất đã có chủ (Title Deed Owned - Cấp 3 Landmark)
  // ==========================================
  await evalInPage(`() => {
    const game = window.__gameStore.getState();
    game.openModal('deed', { cellIndex: 1, canBuy: false });
    return true;
  }`);
  await captureShot('journey_05_modal_title_deed_owned.png', 'Modal Sổ Đỏ ô đất đã sở hữu, có biểu đồ tiền thuê và nút Thế Chấp/Giải Chấp');

  // ==========================================
  // CASE 6: Modal Sàn Giao Dịch Chứng Khoán / Xây Dựng (Hose Modal)
  // ==========================================
  await evalInPage(`() => {
    const game = window.__gameStore.getState();
    game.openModal('hose', {
      minStake: 500,
      maxStake: 5000,
      currentStake: 2000,
      lastDiceRoll: 8,
      lastPayout: 3200
    });
    return true;
  }`);
  await captureShot('journey_06_modal_hose_investment.png', 'Modal Sàn Giao Dịch Chứng Khoán HOSE với mức đặt cọc và hệ số nhân thưởng');

  // ==========================================
  // CASE 7: Modal Đàm Phán & Giao Dịch Tài Sản (Trade Modal)
  // ==========================================
  await evalInPage(`() => {
    const game = window.__gameStore.getState();
    game.openModal('trade', {
      targetPlayerId: 'p2',
      offeredProperties: [1],
      requestedProperties: [16],
      cashOffer: 1500,
      cashRequest: 0
    });
    return true;
  }`);
  await captureShot('journey_07_modal_trade_negotiation.png', 'Modal Đàm Phán & Giao Dịch giữa người chơi và đối thủ');

  // ==========================================
  // CASE 8: Modal Sàn Đấu Giá BĐS Cạnh Tranh (Auction Modal)
  // ==========================================
  await evalInPage(`() => {
    const game = window.__gameStore.getState();
    game.openModal('auction', {
      cellIndex: 37,
      currentBid: 3200,
      highestBidderId: 'p2',
      timeRemaining: 9,
      hasPassed: false
    });
    return true;
  }`);
  await captureShot('journey_08_modal_auction_live.png', 'Modal Sàn Đấu Giá BĐS khẩn cấp với đồng hồ đếm ngược và mức trả giá cao nhất');

  // ==========================================
  // CASE 9: Modal Thẻ Sự Kiện Cơ Hội / Vận May (Event Card Modal)
  // ==========================================
  await evalInPage(`() => {
    const game = window.__gameStore.getState();
    game.openModal('event', {
      cardType: 'chance',
      cardId: 'CHANCE_LUCKY_BONUS',
      title: 'TRÚNG THẦU DỰ ÁN ĐÔ THỊ',
      description: 'Dự án khu đô thị mới của bạn được chính quyền phê duyệt ưu đãi thuế. Nhận thưởng ngay từ Kho Bạc!',
      effectDelta: 2000
    });
    return true;
  }`);
  await captureShot('journey_09_modal_event_card.png', 'Modal Thẻ Sự Kiện Vận May / Cơ Hội với nội dung thưởng phạt');

  // ==========================================
  // CASE 10: Trạng thái Tung Xúc Xắc Trong Khay (Dice Rolling in action)
  // ==========================================
  await evalInPage(`() => {
    const game = window.__gameStore.getState();
    game.closeModal();
    game.setIsRolling(true);
    game.setDice([5, 3]);
    return true;
  }`);
  await captureShot('journey_10_ingame_dice_rolling.png', 'Trạng thái đang lắc và tung xúc xắc trong lòng khay sa bàn');

  // ==========================================
  // CASE 11: Khay Biểu Cảm Cảm Xúc & Phản Ứng (Social Emotes Active)
  // ==========================================
  await evalInPage(`() => {
    const game = window.__gameStore.getState();
    game.setIsRolling(false);
    game.triggerEmote('p1', 'money_rain');
    game.triggerEmote('p2', 'angry');
    return true;
  }`);
  await captureShot('journey_11_ingame_emotes_active.png', 'Khay biểu cảm và các icon tương tác cảm xúc trên bàn cờ');

  // ==========================================
  // CASE 12: Cảnh Báo Vỡ Nợ & Nguy Cơ Phá Sản (Insolvency Crisis Banner)
  // ==========================================
  await evalInPage(`() => {
    const game = window.__gameStore.getState();
    game.openModal('insolvency', {
      playerId: 'p1',
      deficit: 3500
    });
    return true;
  }`);
  await captureShot('journey_12_insolvency_crisis.png', 'Màn hình Cảnh Báo Vỡ Nợ khẩn cấp khi số dư tiền mặt bị âm');

  console.log('All 12 user journey screenshots captured successfully!');
  ws.close();
  chromeProc.kill();
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error in survey_entire_app:', err);
  process.exit(1);
});
