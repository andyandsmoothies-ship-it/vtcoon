import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';

const BROWSER_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9226;
const APP_URL = 'http://127.0.0.1:3000/';

const ARTIFACTS_DIR = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\9712aca6-8125-42ae-b3ce-05d065c3f4e0';
const DOCS_SCREENSHOTS_DIR = path.resolve('docs/reports/improvements/screenshots');

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

async function main() {
  if (!fs.existsSync(DOCS_SCREENSHOTS_DIR)) {
    fs.mkdirSync(DOCS_SCREENSHOTS_DIR, { recursive: true });
  }

  const tempDir = path.join(process.env.TEMP || 'C:\\Temp', `edge_shot_${Date.now()}`);
  fs.mkdirSync(tempDir, { recursive: true });

  console.log('Spawning headless browser on port', PORT);
  const browserProc = spawn(
    BROWSER_PATH,
    [
      '--headless=new',
      `--remote-debugging-port=${PORT}`,
      '--window-size=1280,850',
      '--no-first-run',
      '--no-default-browser-check',
      `--user-data-dir=${tempDir}`,
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      APP_URL,
    ],
    { stdio: 'ignore' }
  );

  let debuggerUrl = null;
  for (let i = 0; i < 40; i++) {
    await sleep(400);
    try {
      const list = await fetchJson(`http://127.0.0.1:${PORT}/json/list`);
      const page = list.find((t) => t.type === 'page' && t.url.includes('127.0.0.1:3000'));
      if (page?.webSocketDebuggerUrl) {
        debuggerUrl = page.webSocketDebuggerUrl;
        break;
      }
    } catch {
      // retry
    }
  }

  if (!debuggerUrl) {
    browserProc.kill();
    throw new Error('Failed to connect to browser CDP');
  }

  console.log('Connected to debugger:', debuggerUrl);
  const ws = new WebSocket(debuggerUrl);
  await new Promise((res, rej) => {
    ws.on('open', res);
    ws.on('error', rej);
  });

  let messageId = 1;
  const pending = new Map();
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.id && pending.has(msg.id)) {
        const p = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) p.reject(msg.error);
        else p.resolve(msg.result);
      }
    } catch {}
  });

  function sendCmd(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = messageId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await sendCmd('Page.enable');
  await sendCmd('Runtime.enable');
  await sendCmd('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 850,
    deviceScaleFactor: 1,
    mobile: false,
  });

  console.log('Waiting for app bundle to load...');
  await sleep(3000);

  // 1. Setup lobby and game store
  console.log('Setting up game state...');
  await sendCmd('Runtime.evaluate', {
    expression: `
      (() => {
        if (window.__lobbyStore) {
          window.__lobbyStore.getState().initLobby('VT8888', 'p1', true, 'Đại Gia Sài Gòn');
          window.__lobbyStore.getState().setGameStarted(true);
        }
        if (window.__gameStore) {
          const game = window.__gameStore.getState();
          game.setPlayersInfo({
            p1: { id: 'p1', name: 'Đại Gia Sài Gòn', balance: 12000, tokenColor: '#c0392b', avatar: '🦁', ownedProperties: [1, 6, 8] },
            p2: { id: 'p2', name: 'Tỷ Phú Hà Thành', balance: 8500, tokenColor: '#2980b9', avatar: '🦅', ownedProperties: [9, 11] },
            p3: { id: 'p3', name: 'Công Tử Bạc Liêu', balance: 15000, tokenColor: '#27ae60', avatar: '🐯', ownedProperties: [16, 18] },
            p4: { id: 'p4', name: 'Nữ Hoàng Địa Ốc', balance: 6200, tokenColor: '#f39c12', avatar: '👑', ownedProperties: [19] }
          });
          game.setPropertyStates({
            1: { ownerId: 'p1', level: 0, isMortgaged: false },
            6: { ownerId: 'p1', level: 1, isMortgaged: false },
            8: { ownerId: 'p1', level: 2, isMortgaged: false },
            9: { ownerId: 'p2', level: 0, isMortgaged: false },
            11: { ownerId: 'p2', level: 0, isMortgaged: true },
            16: { ownerId: 'p3', level: 0, isMortgaged: false },
            18: { ownerId: 'p3', level: 0, isMortgaged: false },
            19: { ownerId: 'p4', level: 0, isMortgaged: false }
          });
          game.setLevelMap({ 6: 1, 8: 2 });
        }
      })()
    `,
  });

  await sleep(1500);

  // 2. Click the Masterplan button or trigger openModal
  console.log('Triggering Masterplan modal...');
  const modalOpened = await sendCmd('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.querySelector('[data-testid="heatmap-toggle-btn"]');
        if (btn) {
          btn.click();
        } else if (window.__gameStore) {
          window.__gameStore.getState().openModal('masterplan', { initialTab: 'districts' });
        }
        return Boolean(document.querySelector('[data-testid="masterplan-modal"]'));
      })()
    `,
  });
  console.log('Modal element check 1:', modalOpened?.result?.value);

  await sleep(1000);

  const modalCheck2 = await sendCmd('Runtime.evaluate', {
    expression: `Boolean(document.querySelector('[data-testid="masterplan-modal"]'))`,
  });
  console.log('Modal element check 2 (after 1s):', modalCheck2?.result?.value);

  // 3. Capture Desktop Screenshot
  console.log('Capturing Desktop Masterplan Screenshot (1280x850)...');
  const desktopShot = await sendCmd('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  const desktopBuf = Buffer.from(desktopShot.data, 'base64');
  const desktopPath = path.join(DOCS_SCREENSHOTS_DIR, 'imp151_desktop_masterplan.jpg');
  const desktopArtifactPath = path.join(ARTIFACTS_DIR, 'imp151_desktop_masterplan.jpg');
  fs.writeFileSync(desktopPath, desktopBuf);
  fs.writeFileSync(desktopArtifactPath, desktopBuf);
  console.log('Saved desktop screenshot to:', desktopPath);

  // 4. Switch to iPhone Mobile Viewport (390x844)
  console.log('Switching to iPhone mobile viewport (390x844)...');
  await sendCmd('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });

  await sleep(1000);

  // Capture Mobile Screenshot
  console.log('Capturing Mobile Masterplan Screenshot...');
  const mobileShot = await sendCmd('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  const mobileBuf = Buffer.from(mobileShot.data, 'base64');
  const mobilePath = path.join(DOCS_SCREENSHOTS_DIR, 'imp151_mobile_masterplan.jpg');
  const mobileArtifactPath = path.join(ARTIFACTS_DIR, 'imp151_mobile_masterplan.jpg');
  fs.writeFileSync(mobilePath, mobileBuf);
  fs.writeFileSync(mobileArtifactPath, mobileBuf);
  console.log('Saved mobile screenshot to:', mobilePath);

  // Cleanup
  ws.close();
  browserProc.kill('SIGKILL');
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch {}
  console.log('Capture completed successfully!');
}

main().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
