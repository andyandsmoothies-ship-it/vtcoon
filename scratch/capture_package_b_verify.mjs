import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const WebSocket = require('c:/Users/HP/Documents/GitHub/vtcoon/node_modules/ws');

const BROWSER_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const TARGET_URL = 'http://127.0.0.1:3000/';
const SCRATCH_DIR = 'c:/Users/HP/Documents/GitHub/vtcoon/scratch';

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
  console.log('Launching headless browser to capture Package B verification screenshots...');
  const tempDir = `C:\\Users\\HP\\AppData\\Local\\Temp\\edge_vtcoon_verify_${Date.now()}`;
  fs.mkdirSync(tempDir, { recursive: true });

  const browserProc = spawn(
    BROWSER_PATH,
    [
      '--headless=new',
      '--remote-debugging-port=9231',
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
      const list = await fetchJson('http://127.0.0.1:9231/json/list');
      const page = list.find((t) => t.type === 'page' && t.url.includes('127.0.0.1:3000'));
      if (page && page.webSocketDebuggerUrl) {
        debuggerUrl = page.webSocketDebuggerUrl;
        break;
      }
    } catch {}
  }

  if (!debuggerUrl) {
    throw new Error('Could not connect to Edge debugger');
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
  await sleep(3000);

  // Setup rich game state with buildings and tokens
  console.log('Injecting game state: C1-C3 houses, pawns, diorama...');
  await sendCmd('Runtime.evaluate', {
    expression: `
      (() => {
        window.__lobbyStore.getState().initLobby('VT8888', 'p1', true, 'Đại Gia Sài Gòn');
        window.__lobbyStore.getState().setGameStarted(true);

        const game = window.__gameStore.getState();
        game.setPlayersInfo({
          p1: { id: 'p1', name: 'Đại Gia Sài Gòn', balance: 8500, tokenColor: '#ef4444', ownedProperties: [1, 3, 6, 8, 9, 11] },
          p2: { id: 'p2', name: 'Tỷ Phú Hà Nội', balance: 6200, tokenColor: '#3b82f6', ownedProperties: [16, 18, 19, 21, 23, 24] },
          p3: { id: 'p3', name: 'Đại Gia Đà Nẵng', balance: 4800, tokenColor: '#10b981', ownedProperties: [31, 32, 34] },
          p4: { id: 'p4', name: 'Bạch Thủ Phú Quốc', balance: 9100, tokenColor: '#f59e0b', ownedProperties: [37, 39] }
        });

        game.setCurrentTurnPlayerId('p1');
        game.setPlayerPositions({ p1: 6, p2: 18, p3: 31, p4: 37 });
        game.setDice([4, 2]);
        game.setLevelMap({
          1: 1, 3: 2, 6: 3, 8: 1, 9: 2, 11: 3,
          16: 1, 18: 2, 19: 3, 21: 2, 23: 3, 24: 1,
          31: 1, 32: 2, 34: 3, 37: 2, 39: 3
        });
        game.setTurnTimeRemaining(24);
        game.setTreasuryPool(1250);
        game.setRoundInfo(4, 30);
      })()
    `,
  });

  await sleep(4000);

  const phases = [
    { mode: 'day', filename: 'package_b_01_daylight.png' },
    { mode: 'sunset', filename: 'package_b_02_sunset.png' },
    { mode: 'night', filename: 'package_b_03_neon_night.png' },
  ];

  for (const { mode, filename } of phases) {
    console.log(`Setting environment mode to ${mode}...`);
    await sendCmd('Runtime.evaluate', {
      expression: `window.__environmentStore.getState().setMode('${mode}');`,
    });
    // Wait for smooth lerp and three rendering
    await sleep(3500);

    const finalFilename = filename.replace(/\.png$/i, '.jpg');
    const shot = await sendCmd('Page.captureScreenshot', { format: 'jpeg', quality: 88 });
    const targetPath = path.join(SCRATCH_DIR, finalFilename);
    fs.writeFileSync(targetPath, Buffer.from(shot.data, 'base64'));
    console.log(`Captured ${finalFilename}: size=${shot.data.length} bytes`);
  }

  ws.close();
  browserProc.kill();
  console.log('Capture complete!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
