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
    '--remote-debugging-port=9224',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    TARGET_URL,
  ], { stdio: 'ignore' });

  let debuggerUrl = null;
  for (let i = 0; i < 30; i++) {
    await sleep(400);
    try {
      const list = await fetchJson('http://127.0.0.1:9224/json/list');
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
    if (msg.method === 'Runtime.consoleAPICalled') {
      console.log('CONSOLE:', msg.params.type, msg.params.args.map(a => a.value || a.description).join(' '));
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      console.error('EXCEPTION:', JSON.stringify(msg.params.exceptionDetails));
    }
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
      })()
    `,
  });
  await sleep(2500);

  const evalRes = await sendCmd('Runtime.evaluate', {
    expression: `
      (() => {
        const scene = window.__threeScene;
        if (!scene) return { error: 'no scene' };

        const results = [];
        scene.traverse((obj) => {
          if (obj.isMesh) {
            const mat = obj.material;
            const color = mat?.color ? '#' + mat.color.getHexString() : null;
            const geom = obj.geometry?.type;
            const pos = [obj.position.x, obj.position.y, obj.position.z];
            let worldPos = new obj.position.constructor();
            obj.getWorldPosition(worldPos);
            results.push({
              name: obj.name || 'unnamed',
              parent: obj.parent?.name || obj.parent?.type,
              color,
              geom,
              visible: obj.visible,
              pos,
              wPos: [worldPos.x, worldPos.y, worldPos.z],
              roughness: mat?.roughness,
              metalness: mat?.metalness,
              opacity: mat?.opacity
            });
          }
        });
        return { total: results.length, meshes: results };
      })()
    `,
    returnByValue: true,
  });

  console.log('Total meshes found:', evalRes.result?.value?.total);
  if (evalRes.result?.value?.meshes) {
    const list = evalRes.result.value.meshes;
    // Filter large meshes (pos or wPos near center)
    console.log('Center/Board meshes:', JSON.stringify(list.filter(m => Math.abs(m.wPos[0]) < 8 && Math.abs(m.wPos[2]) < 8).slice(0, 30), null, 2));
  }

  ws.close();
  chromeProc.kill();
}

main().catch(console.error);
