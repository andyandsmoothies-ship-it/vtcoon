import { spawn } from 'child_process';
import http from 'http';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const WebSocket = require('c:/Users/HP/Documents/GitHub/vtcoon/node_modules/ws');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TARGET_URL = 'http://127.0.0.1:3000/';

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
function fetchJson(url) {
  return new Promise((res, rej) => {
    http.get(url, (r) => {
      let d = ''; r.on('data', c => d += c);
      r.on('end', () => res(JSON.parse(d)));
    }).on('error', rej);
  });
}

async function main() {
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9223',
    '--no-first-run',
    '--no-default-browser-check',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    TARGET_URL,
  ], { stdio: 'ignore' });

  let debuggerUrl = null;
  for (let i = 0; i < 30; i++) {
    await sleep(400);
    try {
      const list = await fetchJson('http://127.0.0.1:9223/json/list');
      const page = list.find((t) => t.type === 'page' && t.url.includes('3000'));
      if (page && page.webSocketDebuggerUrl) {
        debuggerUrl = page.webSocketDebuggerUrl;
        break;
      }
    } catch {}
  }

  const ws = new WebSocket(debuggerUrl);
  await new Promise((r) => ws.on('open', r));

  let msgId = 1;
  const reqs = new Map();
  ws.on('message', (raw) => {
    const msg = JSON.parse(raw.toString());
    if (msg.id && reqs.has(msg.id)) {
      const { resolve, reject } = reqs.get(msg.id);
      reqs.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  });

  function sendCmd(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      reqs.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await sendCmd('Page.enable');
  await sendCmd('Runtime.enable');
  await sleep(1500);

  await sendCmd('Runtime.evaluate', {
    expression: `
      (() => {
        window.__lobbyStore.getState().initLobby('VT8888', 'p1', true, 'Đại Gia Sài Gòn');
        window.__lobbyStore.getState().setGameStarted(true);
        const game = window.__gameStore.getState();
        game.setPlayersInfo({
          p1: { id: 'p1', name: 'Đại Gia Sài Gòn', balance: 8500, tokenColor: '#ef4444', ownedProperties: [1, 3, 6] },
        });
        game.setCurrentTurnPlayerId('p1');
        game.setPlayerPositions({ p1: 6 });
      })()
    `,
  });
  await sleep(2500);

  const evalResult = await sendCmd('Runtime.evaluate', {
    expression: `
      (() => {
        const cam = window.__threeCamera;
        if (!cam) return { error: 'No __threeCamera' };
        let root = cam;
        while (root.parent) { root = root.parent; }
        
        const meshes = [];
        root.traverse((obj) => {
          if (obj.isMesh) {
            const mat = obj.material;
            const col = mat && mat.color ? '#' + mat.color.getHexString() : 'none';
            const geom = obj.geometry ? obj.geometry.type : 'none';
            const pos = [obj.position.x.toFixed(2), obj.position.y.toFixed(2), obj.position.z.toFixed(2)];
            let worldPos = new obj.position.constructor();
            obj.getWorldPosition(worldPos);
            meshes.push({
              uuid: obj.uuid.substring(0, 6),
              geom,
              col,
              pos,
              wPos: [worldPos.x.toFixed(2), worldPos.y.toFixed(2), worldPos.z.toFixed(2)],
              visible: obj.visible,
              roughness: mat?.roughness,
              metalness: mat?.metalness,
              opacity: mat?.opacity
            });
          }
        });
        return { totalMeshes: meshes.length, meshes: meshes.slice(0, 50), allColors: [...new Set(meshes.map(m => m.col))] };
      })()
    `,
    returnByValue: true,
  });

  console.log('Scene Inspection Result:', JSON.stringify(evalResult.result.value, null, 2));

  ws.close();
  chromeProc.kill();
}

main().catch(console.error);
