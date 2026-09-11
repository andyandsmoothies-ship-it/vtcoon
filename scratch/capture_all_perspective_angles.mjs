import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const WebSocket = require('c:/Users/HP/Documents/GitHub/vtcoon/node_modules/ws');

const BROWSER_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const TARGET_URL = 'http://127.0.0.1:3000/';
const ARTIFACT_DIR = 'C:/Users/HP/.gemini/antigravity/brain/36cc250f-e23c-4371-ac4c-bee4ef383619';

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
  console.log('Launching headless browser for Multi-Angle Perspective capture...');
  const tempDir = `C:\\Users\\HP\\AppData\\Local\\Temp\\edge_vtcoon_multi_${Date.now()}`;
  fs.mkdirSync(tempDir, { recursive: true });

  const browserProc = spawn(
    BROWSER_PATH,
    [
      '--headless=new',
      '--remote-debugging-port=9229',
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
      const list = await fetchJson('http://127.0.0.1:9229/json/list');
      const page = list.find((t) => t.type === 'page' && t.url.includes('127.0.0.1:3000'));
      if (page && page.webSocketDebuggerUrl) {
        debuggerUrl = page.webSocketDebuggerUrl;
        break;
      }
    } catch {}
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

  // Setup rich game state
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

  await sleep(3500);

  async function captureAngle(filename, setupFn) {
    console.log('Setting up angle for', filename);
    if (setupFn) {
      await sendCmd('Runtime.evaluate', {
        expression: `(${setupFn.toString()})()`,
      });
      await sleep(1500);
    }
    const shot = await sendCmd('Page.captureScreenshot', { format: 'png' });
    const targetPath = `${ARTIFACT_DIR}\\${filename}`;
    fs.writeFileSync(targetPath, Buffer.from(shot.data, 'base64'));
    console.log('Saved:', targetPath);
  }

  // 1. Perspective Overview (Default Camera)
  await captureAngle('perspective_1_cinematic_overview.png', () => {
    window.__debugCameraManual = false;
  });

  // 2. Perspective Close-Up Diorama & Landmark Tower
  await captureAngle('perspective_2_diorama_closeup.png', () => {
    window.__debugCameraManual = true;
    const cam = window.__threeCamera;
    const ctrl = window.__orbitControls;
    if (ctrl) ctrl.enabled = false;
    if (cam) {
      cam.position.set(-10, 8, -10);
      cam.lookAt(-1.5, 0.5, -1.5);
      cam.updateProjectionMatrix();
    }
  });

  // 3. Low-Angle Cinematic Hero Shot across the Tabletop
  await captureAngle('perspective_3_low_angle_hero.png', () => {
    window.__debugCameraManual = true;
    const cam = window.__threeCamera;
    const ctrl = window.__orbitControls;
    if (ctrl) ctrl.enabled = false;
    if (cam) {
      cam.position.set(16, 6.5, 16);
      cam.lookAt(-1.0, 0.4, -1.0);
      cam.updateProjectionMatrix();
    }
  });

  ws.close();
  browserProc.kill();
  console.log('Multi-angle capture complete!');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
