import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const WebSocket = require('c:/Users/HP/Documents/GitHub/vtcoon/node_modules/ws');

const BROWSER_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const TARGET_URL = 'http://127.0.0.1:3000/';
const ARTIFACT_DIR = 'C:/Users/HP/.gemini/antigravity/brain/72ac024d-b1c0-488c-a838-d31e5025c00d';
const PROJECT_OUTPUT_DIR = 'c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/improvements/screenshots/missing';

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
  console.log('=== STARTING SIMULATION & CAPTURE FOR ALL MISSING SCREENS ===');
  fs.mkdirSync(PROJECT_OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

  const tempDir = `C:\\Users\\HP\\AppData\\Local\\Temp\\edge_vtcoon_missing_${Date.now()}`;
  fs.mkdirSync(tempDir, { recursive: true });

  const browserProc = spawn(
    BROWSER_PATH,
    [
      '--headless=new',
      '--remote-debugging-port=9244',
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
  for (let i = 0; i < 40; i++) {
    await sleep(500);
    try {
      const list = await fetchJson('http://127.0.0.1:9244/json/list');
      const page = list.find((t) => t.type === 'page' && t.url.includes('127.0.0.1:3000'));
      if (page && page.webSocketDebuggerUrl) {
        debuggerUrl = page.webSocketDebuggerUrl;
        break;
      }
    } catch {}
  }

  if (!debuggerUrl) {
    browserProc.kill();
    throw new Error('Could not connect to Edge debugger on port 9244');
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

  // Helper save screenshot
  async function saveScreenshot(filename) {
    const shot = await sendCmd('Page.captureScreenshot', { format: 'png' });
    const buf = Buffer.from(shot.data, 'base64');
    fs.writeFileSync(path.join(PROJECT_OUTPUT_DIR, filename), buf);
    fs.writeFileSync(path.join(ARTIFACT_DIR, filename), buf);
    console.log(`[SAVED] ${filename} (${buf.length} bytes)`);
  }

  // 1. Khởi tạo trạng thái game đầy đủ 4 người chơi
  console.log('1. Khởi tạo trạng thái bàn cờ 4 người chơi...');
  await sendCmd('Runtime.evaluate', {
    expression: `
      (() => {
        window.__lobbyStore.getState().initLobby('VT8888', 'p1', true, 'Đại Gia Sài Gòn');
        window.__lobbyStore.getState().setGameStarted(true);

        const game = window.__gameStore.getState();
        game.setPlayersInfo({
          p1: { id: 'p1', name: 'Đại Gia Sài Gòn', balance: 14500, tokenColor: '#ef4444', ownedProperties: [1, 3, 6, 8, 9, 11] },
          p2: { id: 'p2', name: 'Tỷ Phú Hà Nội', balance: 8200, tokenColor: '#3b82f6', ownedProperties: [16, 18, 19, 21, 23, 24] },
          p3: { id: 'p3', name: 'Đại Gia Đà Nẵng', balance: 5400, tokenColor: '#10b981', ownedProperties: [31, 32, 34] },
          p4: { id: 'p4', name: 'Bạch Thủ Phú Quốc', balance: 11200, tokenColor: '#f59e0b', ownedProperties: [37, 39] }
        });

        game.setCurrentTurnPlayerId('p1');
        game.setPlayerPositions({ p1: 6, p2: 18, p3: 31, p4: 37 });
        game.setDice([4, 2]);
        game.setLevelMap({
          1: 1, 3: 2, 6: 3, 8: 1, 9: 2, 11: 3,
          16: 1, 18: 2, 19: 3, 21: 2, 23: 3, 24: 1,
          31: 1, 32: 2, 34: 3, 37: 2, 39: 3
        });
        game.setTurnTimeRemaining(25);
        game.setTreasuryPool(2500);
        game.setRoundInfo(8, 30);
      })()
    `,
  });
  await sleep(1500);

  // Cảnh 1: Sunset Golden Hour
  console.log('2. Chụp Cảnh 1: Hoàng Hôn Mật Ong (Sunset Golden Hour)...');
  await sendCmd('Runtime.evaluate', { expression: `window.__environmentStore.getState().setMode('sunset');` });
  await sleep(2500);
  await saveScreenshot('missing_01_sunset_golden_hour.png');

  // Cảnh 2: Đô Thị Đêm Neon (Cyberpunk / Neon Metropolis Night)
  console.log('3. Chụp Cảnh 2: Đô Thị Đêm Neon (Neon Metropolis Night)...');
  await sendCmd('Runtime.evaluate', { expression: `window.__environmentStore.getState().setMode('night');` });
  await sleep(2500);
  await saveScreenshot('missing_02_neon_metropolis_night.png');

  // Chuyển lại ban ngày để kiểm tra các modal
  await sendCmd('Runtime.evaluate', { expression: `window.__environmentStore.getState().setMode('day');` });
  await sleep(1500);

  // Cảnh 3: Action Cam Dice Roll
  console.log('4. Chụp Cảnh 3: Action Cam Gieo Xúc Xắc Cận Cảnh...');
  await sendCmd('Runtime.evaluate', { expression: `window.__gameStore.getState().setIsRolling(true);` });
  await sleep(1500);
  await saveScreenshot('missing_03_dice_roll_action_cam.png');
  await sendCmd('Runtime.evaluate', { expression: `window.__gameStore.getState().setIsRolling(false);` });
  await sleep(500);

  // Cảnh 4: Third-Person Pawn Chase Cam
  console.log('5. Chụp Cảnh 4: Chase Cam Bám Sát Gót Quân Cờ...');
  await sendCmd('Runtime.evaluate', { expression: `window.__gameStore.getState().startPawnMove('p1', 12, 6);` });
  await sleep(1500);
  await saveScreenshot('missing_04_pawn_chase_cam.png');
  await sendCmd('Runtime.evaluate', { expression: `window.__gameStore.getState().completePawnMove('p1');` });
  await sleep(500);

  // Cảnh 5: Modal Sổ Đỏ (Title Deed) + Camera Tile Focus
  console.log('6. Chụp Cảnh 5: Modal Sổ Đỏ Bất Động Sản (Tile Focus Drawer)...');
  await sendCmd('Runtime.evaluate', {
    expression: `
      window.__gameStore.getState().openModal('deed', {
        cellIndex: 6,
        canBuy: true,
      });
    `,
  });
  await sleep(2000);
  await saveScreenshot('missing_05_title_deed_modal_drawer.png');
  await sendCmd('Runtime.evaluate', { expression: `window.__gameStore.getState().closeModal();` });
  await sleep(500);

  // Cảnh 6: Modal Sàn Chứng Khoán HOSE
  console.log('7. Chụp Cảnh 6: Modal Sàn Chứng Khoán HOSE...');
  await sendCmd('Runtime.evaluate', {
    expression: `
      window.__gameStore.getState().openModal('hose', {
        currentStake: 1000,
        lastDiceRoll: 6,
        lastPayout: 2000,
      });
    `,
  });
  await sleep(1500);
  await saveScreenshot('missing_06_hose_stock_market_modal.png');
  await sendCmd('Runtime.evaluate', { expression: `window.__gameStore.getState().closeModal();` });
  await sleep(500);

  // Cảnh 7: Modal Đàm Phán Chuyển Nhượng P2P Trade
  console.log('8. Chụp Cảnh 7: Modal Đàm Phán P2P Trade...');
  await sendCmd('Runtime.evaluate', {
    expression: `
      window.__gameStore.getState().openModal('trade', {
        targetPlayerId: 'p2',
        offeredProperties: [6],
        requestedProperties: [18, 19],
        cashOffer: 500,
        cashRequest: 0,
      });
    `,
  });
  await sleep(1500);
  await saveScreenshot('missing_07_p2p_trade_modal.png');
  await sendCmd('Runtime.evaluate', { expression: `window.__gameStore.getState().closeModal();` });
  await sleep(500);

  // Cảnh 8: Modal Thẻ Khí Vận / Cơ Hội (Event Card)
  console.log('9. Chụp Cảnh 8: Modal Thẻ Cơ Hội / Khí Vận...');
  await sendCmd('Runtime.evaluate', {
    expression: `
      window.__gameStore.getState().openModal('event', {
        cardType: 'opportunity',
        cardId: 'OPP-001',
        title: 'Cơ Hội Đầu Tư Bất Động Sản',
        description: 'Thị trường địa ốc Quận 1 tăng nhiệt độ đột biến. Nhận ngay cổ tức đặc biệt từ ngân quỹ phát triển đô thị.',
        effectDelta: 2000,
      });
    `,
  });
  await sleep(1500);
  await saveScreenshot('missing_08_event_card_modal.png');
  await sendCmd('Runtime.evaluate', { expression: `window.__gameStore.getState().closeModal();` });
  await sleep(500);

  // Cảnh 9: Modal Khủng Hoảng Thanh Khoản & Cứu Trợ Phá Sản (Insolvency)
  console.log('10. Chụp Cảnh 9: Modal Khủng Hoảng Thanh Khoản (Insolvency)...');
  await sendCmd('Runtime.evaluate', {
    expression: `
      window.__gameStore.getState().openModal('insolvency', {
        playerId: 'p1',
        deficit: 3500,
      });
    `,
  });
  await sleep(1500);
  await saveScreenshot('missing_09_insolvency_crisis_modal.png');
  await sendCmd('Runtime.evaluate', { expression: `window.__gameStore.getState().closeModal();` });
  await sleep(500);

  // Cảnh 10: Modal Game Over & Vinh Danh Đại Gia Vô Địch
  console.log('11. Chụp Cảnh 10: Modal Game Over & Vinh Danh Đại Gia Vô Địch...');
  await sendCmd('Runtime.evaluate', {
    expression: `
      window.__gameStore.getState().openModal('game_over', {
        leaderboard: [
          { id: 'p1', netWorth: 45800 },
          { id: 'p4', netWorth: 28400 },
          { id: 'p2', netWorth: 19200 },
          { id: 'p3', netWorth: 9600 }
        ]
      });
    `,
  });
  await sleep(1500);
  await saveScreenshot('missing_10_game_over_victory_modal.png');
  await sendCmd('Runtime.evaluate', { expression: `window.__gameStore.getState().closeModal();` });
  await sleep(500);

  ws.close();
  browserProc.kill();
  console.log('=== TOÀN BỘ 10 MÀN HÌNH CÒN THIẾU ĐÃ ĐƯỢC CHỤP THÀNH CÔNG ===');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
