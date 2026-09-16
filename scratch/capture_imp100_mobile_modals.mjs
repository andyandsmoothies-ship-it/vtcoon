import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';

const BROWSER_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const DEBUG_PORT = 9555;
const TARGET_URL = 'http://127.0.0.1:3000/';
const BRAIN_DIR = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\2f79305b-d634-4d54-bef6-28716ebe7ab0';

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
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

async function run() {
  const tempDir = path.join(process.env.TEMP || 'C:\\Users\\HP\\AppData\\Local\\Temp', `edge_mobile_imp100_${Date.now()}`);
  fs.mkdirSync(tempDir, { recursive: true });

  const proc = spawn(
    BROWSER_PATH,
    [
      '--headless=new',
      `--remote-debugging-port=${DEBUG_PORT}`,
      '--window-size=390,844',
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
    await sleep(400);
    try {
      const list = await fetchJson(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
      const page = list.find((t) => t.type === 'page' && t.url.includes('127.0.0.1:3000'));
      if (page?.webSocketDebuggerUrl) {
        debuggerUrl = page.webSocketDebuggerUrl;
        break;
      }
    } catch {}
  }

  if (!debuggerUrl) {
    proc.kill();
    throw new Error('Failed to connect to browser CDP');
  }

  const ws = new WebSocket(debuggerUrl);
  await new Promise((res, rej) => {
    ws.on('open', res);
    ws.on('error', rej);
  });

  let messageId = 1;
  const pendingRequests = new Map();
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.id && pendingRequests.has(msg.id)) {
        const req = pendingRequests.get(msg.id);
        pendingRequests.delete(msg.id);
        if (msg.error) req.reject(msg.error);
        else req.resolve(msg.result);
      }
    } catch {}
  });

  function sendCmd(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = messageId++;
      pendingRequests.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  try {
    await sendCmd('Page.enable');
    await sendCmd('DOM.enable');
    await sendCmd('Runtime.enable');

    await sendCmd('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });

    console.log('Waiting for Lobby...');
    await sleep(3500);

    // Setup match with bots
    console.log('Adding bot...');
    await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.querySelector('button[data-testid="toggle-bot-btn-1"]') ||
                    Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Thêm Bot'));
        if (btn) btn.click();
      })()`,
    });
    await sleep(1000);

    console.log('Starting game...');
    await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const startBtn = document.querySelector('button[data-testid="start-game-btn"]');
        if (startBtn && !startBtn.disabled) startBtn.click();
      })()`,
    });

    console.log('Waiting for In-Game board render...');
    await sleep(4000);

    // Populate game state with properties, cash, badges
    await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        if (window.__gameStore) {
          const game = window.__gameStore.getState();
          const myId = window.__lobbyStore ? window.__lobbyStore.getState().playerId : 'p1';
          game.setPlayersInfo({
            p1: {
              id: 'p1',
              name: 'Đại Gia Sài Gòn',
              balance: 12500,
              tokenColor: '#EF4444',
              ownedProperties: [1, 3, 6, 8, 9],
              mortgagedProperties: [6],
              isBot: false,
              inAudit: true,
            },
            bot_2: {
              id: 'bot_2',
              name: 'Bot AI 2 (Balanced)',
              balance: 8400,
              tokenColor: '#3B82F6',
              ownedProperties: [11, 13],
              mortgagedProperties: [],
              isBot: true,
            },
            bot_3: {
              id: 'bot_3',
              name: 'Bot AI 3 (Aggressive)',
              balance: 6200,
              tokenColor: '#10B981',
              ownedProperties: [16, 18],
              mortgagedProperties: [],
              isBot: true,
            },
            bot_4: {
              id: 'bot_4',
              name: 'Bot AI 4 (Cautious)',
              balance: 14880,
              tokenColor: '#F59E0B',
              ownedProperties: [21, 23, 24],
              mortgagedProperties: [],
              isBot: true,
            }
          });
          game.setLevelMap({ 1: 2, 3: 1, 6: 0, 8: 1, 9: 3, 11: 0, 13: 1, 16: 0, 18: 2, 21: 0, 23: 1, 24: 0 });
          game.setCurrentTurnPlayerId('p1');
          game.setRoundInfo(5, 30);
          game.setTurnTimeRemaining(25);
          game.closeModal();
        }
      })()`,
    });
    await sleep(1000);

    // 1. CAPTURE PLAYER HUD (Compact Drawer Open)
    console.log('1. Ensuring Player HUD drawer is open...');
    await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        const toggleBtn = document.querySelector('button[data-testid="toggle-player-hud-btn"]');
        if (toggleBtn && toggleBtn.textContent.includes('👥') && !toggleBtn.textContent.includes('✕')) {
          toggleBtn.click();
        }
      })()`,
    });
    await sleep(1500);

    const shot1 = await sendCmd('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    const out1 = path.join(BRAIN_DIR, 'mobile_imp100_player_hud_open.jpg');
    fs.writeFileSync(out1, Buffer.from(shot1.data, 'base64'));
    console.log(`[Captured] ${out1}`);

    // 2. CAPTURE PROPERTY PORTFOLIO MODAL (Safe Area Check)
    console.log('2. Opening Property Portfolio Modal...');
    await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        if (window.__gameStore) {
          window.__gameStore.getState().openModal('portfolio', { playerId: 'p1' });
        }
      })()`,
    });
    await sleep(1500);

    const shot2 = await sendCmd('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    const out2 = path.join(BRAIN_DIR, 'mobile_imp100_portfolio_safe_area.jpg');
    fs.writeFileSync(out2, Buffer.from(shot2.data, 'base64'));
    console.log(`[Captured] ${out2}`);

    // 3. CAPTURE EVENT CARD MODAL (Quick Impact Summary Check)
    console.log('3. Opening Event Card Modal...');
    await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        if (window.__gameStore) {
          window.__gameStore.getState().openModal('event', {
            cardType: 'market',
            cardId: 'MC_LAND_FEVER',
            title: 'Cơn Sốt Đất Nền',
            description: 'Làn sóng đầu tư công và phát triển hạ tầng tạo nên cơn sốt đất nền tại các vùng vệ tinh lân cận.',
            targetScope: 'Bình Dương, Đồng Nai, Hưng Yên',
            effectDetail: 'Tiền thuê tăng +100% (gấp đôi) cho toàn bộ BĐS Đất nền & Đô thị thuộc phạm vi',
            duration: 'Có hiệu lực trong 2 vòng đấu tiếp theo',
            destination: 'Dòng tiền chuyển trực tiếp cho chủ sở hữu khi có khách dừng chân'
          });
        }
      })()`,
    });
    await sleep(1000);

    const shot3 = await sendCmd('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    const out3 = path.join(BRAIN_DIR, 'mobile_imp100_event_card_quick_summary.jpg');
    fs.writeFileSync(out3, Buffer.from(shot3.data, 'base64'));
    console.log(`[Captured] ${out3}`);

    // 4. CAPTURE INSOLVENCY BANNER
    console.log('4. Opening Insolvency Banner...');
    await sendCmd('Runtime.evaluate', {
      expression: `(() => {
        if (window.__gameStore) {
          window.__gameStore.getState().openModal('insolvency', {
            playerId: 'p1',
            deficit: 750
          });
        }
      })()`,
    });
    await sleep(1000);

    const shot4 = await sendCmd('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    const out4 = path.join(BRAIN_DIR, 'mobile_imp100_insolvency_retropoly.jpg');
    fs.writeFileSync(out4, Buffer.from(shot4.data, 'base64'));
    console.log(`[Captured] ${out4}`);

    console.log('ALL 4 MOBILE VERIFICATION SCREENSHOTS CAPTURED SUCCESSFULLY!');
  } finally {
    ws.close();
    proc.kill();
  }
}

run().catch((err) => {
  console.error('Error during capture:', err);
  process.exit(1);
});
