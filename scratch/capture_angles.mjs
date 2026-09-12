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
  console.log('Launching headless Chrome for Multi-Angle capture...');
  const tempDir = `C:\\Users\\HP\\AppData\\Local\\Temp\\chrome_vtcoon_angles_${Date.now()}`;
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
  await sleep(2000);

  // Setup game state
  console.log('Injecting game state: C1-C3, Tabletop, Diorama...');
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
        return { success: true };
      })()
    `,
    returnByValue: true,
  });

  await sleep(2500);

  async function captureAngle(filename, cameraFn) {
    console.log(`Setting up camera for ${filename}...`);
    const evalRes = await sendCmd('Runtime.evaluate', {
      expression: `(${cameraFn.toString()})()`,
      returnByValue: true,
    });
    console.log('Camera setup status:', JSON.stringify(evalRes.result?.value));
    await sleep(1200);
    const finalFilename = filename.replace(/\.png$/i, '.jpg');
    const shot = await sendCmd('Page.captureScreenshot', { format: 'jpeg', quality: 88 });
    const targetPath = `${ARTIFACT_DIR}\\${finalFilename}`;
    fs.writeFileSync(targetPath, Buffer.from(shot.data, 'base64'));
    console.log('Saved:', targetPath);
  }

  // 1. Isometric Overview
  await captureAngle('angle_1_isometric_overview.png', () => {
    window.__debugCameraManual = true;
    const cam = window.__threeCamera;
    const ctrl = window.__orbitControls;
    if (ctrl) ctrl.enabled = false;
    if (cam) {
      cam.position.set(22, 22, 22);
      cam.zoom = 35;
      cam.lookAt(-1.2, 0, -1.2);
      cam.updateProjectionMatrix();
      return { ok: true, zoom: cam.zoom, pos: [cam.position.x, cam.position.y, cam.position.z] };
    }
    return { ok: false, noCam: true };
  });

  // 2. North-West Skyline & C3 Landmark Twin Towers Close-Up
  await captureAngle('angle_2_northwest_skyline_closeup.png', () => {
    window.__debugCameraManual = true;
    const cam = window.__threeCamera;
    const ctrl = window.__orbitControls;
    if (ctrl) ctrl.enabled = false;
    if (cam) {
      cam.position.set(-11.0, 7.5, -11.0);
      cam.zoom = 58;
      cam.lookAt(-4.3, 0.5, -4.2);
      cam.updateProjectionMatrix();
      return { ok: true, zoom: cam.zoom, pos: [cam.position.x, cam.position.y, cam.position.z] };
    }
    return { ok: false, noCam: true };
  });

  // 3. Stadium, Marina & Lighthouse Close-Up
  await captureAngle('angle_3_southeast_stadium_marina.png', () => {
    window.__debugCameraManual = true;
    const cam = window.__threeCamera;
    const ctrl = window.__orbitControls;
    if (ctrl) ctrl.enabled = false;
    if (cam) {
      cam.position.set(11.0, 8.0, 9.0);
      cam.zoom = 54;
      cam.lookAt(4.3, 0.4, 0);
      cam.updateProjectionMatrix();
      return { ok: true, zoom: cam.zoom, pos: [cam.position.x, cam.position.y, cam.position.z] };
    }
    return { ok: false, noCam: true };
  });

  // 4. Low-Angle Cinematic Hero View (looking across the tabletop)
  await captureAngle('angle_4_low_cinematic_hero.png', () => {
    window.__debugCameraManual = true;
    const cam = window.__threeCamera;
    const ctrl = window.__orbitControls;
    if (ctrl) ctrl.enabled = false;
    if (cam) {
      cam.position.set(20, 8, 20);
      cam.zoom = 42;
      cam.lookAt(-1.0, 0.2, -1.0);
      cam.updateProjectionMatrix();
      return { ok: true, zoom: cam.zoom, pos: [cam.position.x, cam.position.y, cam.position.z] };
    }
    return { ok: false, noCam: true };
  });

  // 5. Classic Top-Down Board View
  await captureAngle('angle_5_topdown_board.png', () => {
    window.__debugCameraManual = true;
    const cam = window.__threeCamera;
    const ctrl = window.__orbitControls;
    if (ctrl) ctrl.enabled = false;
    if (cam) {
      cam.position.set(0, 35, 0.001);
      cam.zoom = 37;
      cam.lookAt(0, 0, 0);
      cam.updateProjectionMatrix();
      return { ok: true, zoom: cam.zoom, pos: [cam.position.x, cam.position.y, cam.position.z] };
    }
    return { ok: false, noCam: true };
  });

  console.log('All 5 angle screenshots captured successfully!');
  ws.close();
  chromeProc.kill();
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error in capture_angles:', err);
  process.exit(1);
});
