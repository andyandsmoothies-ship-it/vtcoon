import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const WebSocket = require('c:/Users/HP/Documents/GitHub/vtcoon/node_modules/ws');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TARGET_URL = 'http://127.0.0.1:3000/';
const ARTIFACT_DIRS = [
  'C:/Users/HP/.gemini/antigravity/brain/d0bd8bc6-c66e-48b4-96dc-82975fdb23d6',
  'C:/Users/HP/.gemini/antigravity/brain/72ac024d-b1c0-488c-a838-d31e5025c00d',
  'C:/Users/HP/.gemini/antigravity/brain/c9bb5650-7991-43d3-9325-583d272933ba',
];

function saveArtifact(filename, buffer) {
  for (const dir of ARTIFACT_DIRS) {
    if (fs.existsSync(dir)) {
      fs.writeFileSync(`${dir}\\${filename}`, buffer);
      console.log('Saved:', `${dir}\\${filename}`);
    }
  }
}

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
  console.log('Launching headless Chrome for Perspective Multi-Angle capture...');
  const tempDir = `C:\\Users\\HP\\AppData\\Local\\Temp\\chrome_vtcoon_angles_${Date.now()}`;
  fs.mkdirSync(tempDir, { recursive: true });

  const chromeProc = spawn(
    CHROME_PATH,
    [
      '--headless=new',
      '--remote-debugging-port=9226',
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
      const list = await fetchJson('http://127.0.0.1:9226/json/list');
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

  // 0. Setup and Capture Glassmorphic Lobby with Live 3D Background
  console.log('Setting up Lobby with Live 3D Background...');
  await sendCmd('Runtime.evaluate', {
    expression: `
      (() => {
        window.__lobbyStore.getState().initLobby('VT8888', 'p1', true, 'Đại Gia Sài Gòn');
        window.__lobbyStore.getState().toggleBotSlot(1, 'balanced');
        window.__lobbyStore.getState().toggleBotSlot(2, 'aggressive');
        window.__lobbyStore.getState().toggleBotSlot(3, 'passive');
        return { success: true };
      })()
    `,
    returnByValue: true,
  });
  await sleep(3000);
  const lobbyShot = await sendCmd('Page.captureScreenshot', { format: 'jpeg', quality: 88 });
  saveArtifact('journey_01_lobby_new.jpg', Buffer.from(lobbyShot.data, 'base64'));

  // 1. Setup in-game state
  console.log('Injecting game state: 4 Players, Buildings, Dice...');
  await sendCmd('Runtime.evaluate', {
    expression: `
      (() => {
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

  await sleep(3000);

  async function captureAngle(filename, cameraFn) {
    console.log(`Setting up camera for ${filename}...`);
    const evalRes = await sendCmd('Runtime.evaluate', {
      expression: `(${cameraFn.toString()})()`,
      returnByValue: true,
    });
    console.log('Camera setup status:', JSON.stringify(evalRes.result?.value));
    await sleep(1500);
    const finalFilename = filename.replace(/\.png$/i, '.jpg');
    const shot = await sendCmd('Page.captureScreenshot', { format: 'jpeg', quality: 88 });
    saveArtifact(finalFilename, Buffer.from(shot.data, 'base64'));
  }

  // 1. Isometric Cinematic Overview (Perspective fov=40, zoom=1)
  await captureAngle('angle_1_isometric_overview.png', () => {
    window.__debugCameraManual = true;
    const cam = window.__threeCamera;
    const ctrl = window.__orbitControls;
    if (ctrl) {
      ctrl.target.set(-1.2, 0, -1.2);
      ctrl.update();
    }
    if (cam) {
      cam.position.set(21, 23, 21);
      cam.zoom = 1;
      cam.fov = 40;
      cam.lookAt(-1.2, 0, -1.2);
      cam.updateProjectionMatrix();
      return { ok: true, isPerspective: cam.isPerspectiveCamera, fov: cam.fov, pos: [cam.position.x, cam.position.y, cam.position.z] };
    }
    return { ok: false, noCam: true };
  });

  // 2. North-West Skyline & C3 Landmark Twin Towers Close-Up
  await captureAngle('angle_2_northwest_skyline_closeup.png', () => {
    window.__debugCameraManual = true;
    const cam = window.__threeCamera;
    const ctrl = window.__orbitControls;
    if (ctrl) {
      ctrl.target.set(-8, 3, -6);
      ctrl.update();
    }
    if (cam) {
      cam.position.set(-3, 8, 2);
      cam.zoom = 1;
      cam.fov = 44;
      cam.lookAt(-8, 3, -6);
      cam.updateProjectionMatrix();
      return { ok: true, isPerspective: cam.isPerspectiveCamera, fov: cam.fov, pos: [cam.position.x, cam.position.y, cam.position.z] };
    }
    return { ok: false, noCam: true };
  });

  // 3. Stadium, Marina & Lighthouse Close-Up
  await captureAngle('angle_3_southeast_stadium_marina.png', () => {
    window.__debugCameraManual = true;
    const cam = window.__threeCamera;
    const ctrl = window.__orbitControls;
    if (ctrl) {
      ctrl.target.set(6, 1.5, 5);
      ctrl.update();
    }
    if (cam) {
      cam.position.set(2, 7, -1);
      cam.zoom = 1;
      cam.fov = 46;
      cam.lookAt(6, 1.5, 5);
      cam.updateProjectionMatrix();
      return { ok: true, isPerspective: cam.isPerspectiveCamera, fov: cam.fov, pos: [cam.position.x, cam.position.y, cam.position.z] };
    }
    return { ok: false, noCam: true };
  });

  // 4. Low-Angle Cinematic Hero View (dramatic perspective looking across the tabletop)
  await captureAngle('angle_4_low_cinematic_hero.png', () => {
    window.__debugCameraManual = true;
    const cam = window.__threeCamera;
    const ctrl = window.__orbitControls;
    if (ctrl) {
      ctrl.target.set(-2, 1.5, -2);
      ctrl.update();
    }
    if (cam) {
      cam.position.set(16, 7.5, 16);
      cam.zoom = 1;
      cam.fov = 38;
      cam.lookAt(-2, 1.5, -2);
      cam.updateProjectionMatrix();
      return { ok: true, isPerspective: cam.isPerspectiveCamera, fov: cam.fov, pos: [cam.position.x, cam.position.y, cam.position.z] };
    }
    return { ok: false, noCam: true };
  });

  // 5. Classic Top-Down Perspective View
  await captureAngle('angle_5_topdown_board.png', () => {
    window.__debugCameraManual = true;
    const cam = window.__threeCamera;
    const ctrl = window.__orbitControls;
    if (ctrl) {
      ctrl.target.set(0, 0, 0);
      ctrl.update();
    }
    if (cam) {
      cam.position.set(0, 36, 0.01);
      cam.zoom = 1;
      cam.fov = 37;
      cam.lookAt(0, 0, 0);
      cam.updateProjectionMatrix();
      return { ok: true, isPerspective: cam.isPerspectiveCamera, fov: cam.fov, pos: [cam.position.x, cam.position.y, cam.position.z] };
    }
    return { ok: false, noCam: true };
  });

  console.log('All 5 angle screenshots captured successfully!');
  ws.close();
  chromeProc.kill();
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error in capture_angles_perspective:', err);
  process.exit(1);
});
