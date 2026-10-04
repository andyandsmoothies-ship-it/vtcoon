#!/usr/bin/env node

/**
 * scripts/capture_visual_evidence.mjs
 * 
 * Standardized Physical Visual Capture Runner for 2D UI & 3D WebGL Canvas.
 * Automatically discovers Chrome/Edge, starts preview server if needed,
 * connects via Chrome DevTools Protocol (CDP), and captures real in-game screenshots.
 * 
 * Usage:
 *   node scripts/capture_visual_evidence.mjs --ticket IMP-233
 *   node scripts/capture_visual_evidence.mjs --ticket IMP-233 --crop 0,200,700,600 --name corner_close_up
 */

import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

const repoRoot = process.cwd();
const tmpDir = path.join(repoRoot, '.agents', 'tmp');
const evidenceDir = path.join(repoRoot, '.agents', 'evidence');

const BROWSER_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  process.env.CHROME_BIN,
  process.env.EDGE_BIN,
].filter(Boolean);

function findBrowser() {
  for (const p of BROWSER_CANDIDATES) {
    if (p && fs.existsSync(p)) return p;
  }
  return null;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    ticket: 'MANUAL',
    url: 'http://localhost:4173/?room=VTTEST&host=true',
    name: 'full_board',
    crop: null, // [x, y, width, height]
    waitMs: 5000,
    port: 4173,
    debugPort: 9222,
    dualViewport: false,
    scenario: null,
    scenarioExpr: null,
    assertCameraY: null, // { min, max }
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--ticket' && args[i + 1]) {
      options.ticket = args[++i];
    } else if (arg === '--url' && args[i + 1]) {
      options.url = args[++i];
    } else if (arg === '--name' && args[i + 1]) {
      options.name = args[++i];
    } else if (arg === '--dual-viewport' || arg === '--dual') {
      options.dualViewport = true;
    } else if (arg === '--scenario' && args[i + 1]) {
      options.scenario = args[++i];
    } else if (arg === '--scenario-expr' && args[i + 1]) {
      options.scenarioExpr = args[++i];
    } else if (arg === '--assert-camera-y' && args[i + 1]) {
      const parts = args[++i].split(',').map((n) => parseFloat(n.trim()));
      if (parts.length === 2 && !Number.isNaN(parts[0]) && !Number.isNaN(parts[1])) {
        options.assertCameraY = { min: parts[0], max: parts[1] };
      }
    } else if (arg === '--crop' && args[i + 1]) {
      const parts = args[++i].split(',').map((n) => parseInt(n.trim(), 10));
      if (parts.length === 4) {
        options.crop = { x: parts[0], y: parts[1], width: parts[2], height: parts[3], scale: 1 };
      }
    } else if (arg === '--wait' && args[i + 1]) {
      options.waitMs = parseInt(args[++i], 10);
    }
  }
  return options;
}

async function checkPortOpen(port) {
  try {
    const res = await fetch(`http://localhost:${port}/`, { method: 'HEAD', signal: AbortSignal.timeout(1000) });
    return res.status < 500;
  } catch {
    return false;
  }
}

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function main() {
  const opts = parseArgs();
  const browserPath = findBrowser();
  if (!browserPath) {
    console.error('❌ No suitable Chrome or Edge browser executable found on system.');
    process.exit(1);
  }

  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  // 0. Auto-Build Check: Check if src/client/ is newer than dist/index.html
  const distHtml = path.join(repoRoot, 'dist', 'index.html');
  const srcClientDir = path.join(repoRoot, 'src', 'client');
  let needsBuild = !fs.existsSync(distHtml);
  if (!needsBuild && fs.existsSync(srcClientDir)) {
    const distMtime = fs.statSync(distHtml).mtimeMs;
    function checkDirNewer(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const ent of entries) {
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) {
          if (checkDirNewer(full)) return true;
        } else if (/\.(tsx?|css)$/.test(ent.name)) {
          if (fs.statSync(full).mtimeMs > distMtime) return true;
        }
      }
      return false;
    }
    needsBuild = checkDirNewer(srcClientDir);
  }

  if (needsBuild) {
    console.log('🔄 Source files in src/client/ are newer than dist/ (or dist missing). Running "npm run build" to ensure fresh bundle...');
    execSync('npm run build', { stdio: 'inherit' });
  }

  // 1. Verify Preview Server
  let previewProc = null;
  const isServerRunning = await checkPortOpen(opts.port);
  if (!isServerRunning) {
    console.log(`📡 Preview server not detected on port ${opts.port}. Launching 'npx vite preview --port ${opts.port}'...`);
    previewProc = spawn('cmd.exe', ['/c', `npx vite preview --port ${opts.port}`], {
      stdio: 'ignore',
      detached: false,
    });

    let opened = false;
    for (let i = 0; i < 20; i++) {
      await sleep(500);
      if (await checkPortOpen(opts.port)) {
        opened = true;
        break;
      }
    }
    if (!opened) {
      console.error(`❌ Failed to start vite preview server on port ${opts.port}.`);
      if (previewProc) previewProc.kill();
      process.exit(1);
    }
  }

  // 2. Launch Browser with CDP
  console.log(`🌐 Launching headless browser: ${browserPath}`);
  const browserProc = spawn(browserPath, [
    '--headless=new',
    `--remote-debugging-port=${opts.debugPort}`,
    '--window-size=1280,800',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--no-first-run',
    '--disable-extensions',
    '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    opts.url,
  ], { stdio: 'ignore' });

  try {
    let wsUrl = null;
    for (let i = 0; i < 30; i++) {
      await sleep(400);
      try {
        const res = await fetch(`http://127.0.0.1:${opts.debugPort}/json/list`);
        const pages = await res.json();
        const target = pages.find((p) => p.url && p.url.includes(String(opts.port))) || pages[0];
        if (target?.webSocketDebuggerUrl) {
          wsUrl = target.webSocketDebuggerUrl;
          break;
        }
      } catch {
        // Wait for CDP endpoint
      }
    }

    if (!wsUrl) {
      throw new Error(`Could not connect to CDP WebSocket on port ${opts.debugPort}`);
    }

    const { WebSocket } = await import('ws');
    const ws = new WebSocket(wsUrl);
    await new Promise((resolve, reject) => {
      ws.on('open', resolve);
      ws.on('error', reject);
    });

    let msgId = 1;
    const send = (method, params = {}) =>
      new Promise((resolve, reject) => {
        const id = msgId++;
        const handler = (raw) => {
          try {
            const data = JSON.parse(raw.toString());
            if (data.id === id) {
              ws.removeListener('message', handler);
              if (data.error) reject(data.error);
              else resolve(data.result);
            }
          } catch (err) {
            reject(err);
          }
        };
        ws.on('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Network.enable');

    console.log(`⏳ Waiting ${opts.waitMs}ms for 3D/UI scene rendering...`);
    await sleep(opts.waitMs);

    // Clean overlay banners to ensure clear view of the diorama
    await send('Runtime.evaluate', {
      expression: `
        document.querySelector('[data-testid="welcome-hub-overlay"]')?.remove();
        const rightSidebar = document.querySelector('.w-\\\\[360px\\\\], .w-\\\\[380px\\\\], [data-testid="pre-match-deck"]');
        if (rightSidebar) rightSidebar.style.display = 'none';
        document.querySelectorAll('div').forEach(el => {
          if (el.textContent && el.textContent.includes('Chờ người chơi')) {
            el.style.display = 'none';
          }
        });
        // Ensure In-Game HUD mounts (gameStarted === true) for physical UI captures
        if (window.__lobbyStore && !window.__lobbyStore.getState().gameStarted) {
          window.__lobbyStore.getState().initLobby('VTTEST', 'p1', true, 'Tester');
          window.__lobbyStore.getState().setGameStarted(true);
        }
        // Worst-case 4-player setup for HUD/Toast layout tests
        if (window.__gameStore) {
          const s = window.__gameStore.getState();
          if (!s.playersInfo || Object.keys(s.playersInfo).length <= 1) {
            window.__gameStore.setState({
              playersInfo: {
                p1: { id: 'p1', name: 'Tester', balance: 15000, tokenColor: '#38BDF8', ownedProperties: [] },
                p2: { id: 'p2', name: 'Bot AI 1', balance: 12000, tokenColor: '#F43F5E', ownedProperties: [] },
                p3: { id: 'p3', name: 'Bot AI 2', balance: 9500, tokenColor: '#10B981', ownedProperties: [] },
                p4: { id: 'p4', name: 'Bot AI 3', balance: 7000, tokenColor: '#F59E0B', ownedProperties: [] },
              },
              isPlayerHudVisible: true,
            });
          }
        }
      `,
    });
    await sleep(800);

    // Helper to extract physical bounding boxes from browser DOM
    async function extractBoundingBoxes(viewportName) {
      const evalRes = await send('Runtime.evaluate', {
        expression: `
          (function() {
            const getRect = (sel) => {
              const el = document.querySelector(sel);
              if (!el) return null;
              const r = el.getBoundingClientRect();
              return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height), top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right) };
            };
            const toastContainer = document.querySelector('[data-testid="floating-numbers-overlay"] > div');
            const toastCards = Array.from(document.querySelectorAll('[data-testid="contextual-transaction-badge"]')).map(el => {
              const r = el.getBoundingClientRect();
              return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height), top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right) };
            });
            const pillEl = document.querySelector('[data-testid="camera-reset-pill-btn"]');
            const cameraPillsContainer = document.querySelector('div[class*="bottom-[calc(5rem"]') || (pillEl && pillEl.parentElement);
            return JSON.stringify({
              viewport: '${viewportName}',
              toastContainer: toastContainer ? {
                top: Math.round(toastContainer.getBoundingClientRect().top),
                bottom: Math.round(toastContainer.getBoundingClientRect().bottom),
                left: Math.round(toastContainer.getBoundingClientRect().left),
                right: Math.round(toastContainer.getBoundingClientRect().right),
                width: Math.round(toastContainer.getBoundingClientRect().width),
                height: Math.round(toastContainer.getBoundingClientRect().height)
              } : null,
              toastCards,
              hud: getRect('[aria-label="Danh sách người chơi"]'),
              cameraPills: cameraPillsContainer ? {
                top: Math.round(cameraPillsContainer.getBoundingClientRect().top),
                bottom: Math.round(cameraPillsContainer.getBoundingClientRect().bottom),
                height: Math.round(cameraPillsContainer.getBoundingClientRect().height),
                left: Math.round(cameraPillsContainer.getBoundingClientRect().left),
                right: Math.round(cameraPillsContainer.getBoundingClientRect().right),
              } : null,
            });
          })()
        `,
        returnByValue: true,
      });
      if (evalRes && evalRes.result && evalRes.result.value) {
        const boundsJson = evalRes.result.value;
        const boundsFile = path.join(evidenceDir, `bounding_box_${opts.ticket.toLowerCase()}_${viewportName}.json`);
        fs.writeFileSync(boundsFile, boundsJson, 'utf8');
        console.log(`   - Physical DOM Bounding Boxes: ${boundsFile}`);
        console.log(`     ${boundsJson}`);
      }
    }

    // Helper to inject scenario
    async function injectScenario(scenarioName, scenarioExpr) {
      if (scenarioName) {
        console.log(`🎬 Injecting UI scenario: "${scenarioName}"...`);
        await send('Runtime.evaluate', {
          expression: `
            (function() {
              if ('${scenarioName}' === 'deed_modal') {
                const buyBtn = document.querySelector('[data-testid="action-dock-buy"]');
                if (buyBtn) buyBtn.click();
              } else if ('${scenarioName}' === 'transit_wheel') {
                const wheelBtn = document.querySelector('[data-testid="action-dock-transit-wheel"]');
                if (wheelBtn) wheelBtn.click();
              } else if ('${scenarioName}' === 'camera_chase_cinematic') {
                if (window.__gameStore) {
                  window.__gameStore.setState({
                    currentTurnPlayerId: 'p1',
                    playerPositions: { p1: 0, p2: 0, p3: 0, p4: 0 },
                    activePawnAnimation: {
                      isAnimating: true,
                      playerId: 'p1',
                      fromCell: 0,
                      targetCell: 15,
                      currentIndex: 0,
                      waypoints: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
                    },
                    isRolling: false,
                    hasRolledThisTurn: false,
                    activeModal: null,
                    cameraFocusCell: null,
                    hasUserCustomCamera: false,
                  });
                }
              } else if ('${scenarioName}' === 'camera_chase_normal') {
                if (window.__gameStore) {
                  window.__gameStore.setState({
                    currentTurnPlayerId: 'p1',
                    playerPositions: { p1: 0, p2: 0, p3: 0, p4: 0 },
                    activePawnAnimation: {
                      isAnimating: true,
                      playerId: 'p1',
                      fromCell: 0,
                      targetCell: 8,
                      currentIndex: 0,
                      waypoints: [1, 2, 3, 4, 5, 6, 7, 8],
                    },
                    isRolling: false,
                    hasRolledThisTurn: false,
                    activeModal: null,
                    cameraFocusCell: null,
                    hasUserCustomCamera: false,
                  });
                }
              } else if ('${scenarioName}' === 'dice_rolling') {
                if (window.__gameStore) {
                  window.__gameStore.setState({
                    currentTurnPlayerId: 'p1',
                    isRolling: true,
                    hasRolledThisTurn: false,
                    activePawnAnimation: null,
                  });
                }
              }
            })();
          `,
        });
        await sleep(1100);
      } else if (scenarioExpr) {
        console.log(`🎬 Evaluating scenario expression...`);
        const res = await send('Runtime.evaluate', { expression: scenarioExpr });
        if (res && res.exceptionDetails) {
          console.error('❌ Scenario expression failed:', JSON.stringify(res.exceptionDetails));
        }
        await sleep(700);
      }
    }

    // Helper to extract physical Three.js camera telemetry
    async function extractCameraTelemetry(viewportName) {
      const evalRes = await send('Runtime.evaluate', {
        expression: `
          (function() {
            const cam = window.__threeCamera;
            const controls = window.__orbitControls;
            const gameStore = window.__gameStore ? window.__gameStore.getState() : null;
            if (!cam) return null;
            const pos = [
              Number(cam.position.x.toFixed(3)),
              Number(cam.position.y.toFixed(3)),
              Number(cam.position.z.toFixed(3))
            ];
            const target = controls ? [
              Number(controls.target.x.toFixed(3)),
              Number(controls.target.y.toFixed(3)),
              Number(controls.target.z.toFixed(3))
            ] : null;
            const fov = cam.fov ? Number(cam.fov.toFixed(1)) : null;
            const elevationY = pos[1];
            let pitchDeg = null;
            if (target) {
              const dx = pos[0] - target[0];
              const dy = pos[1] - target[1];
              const dz = pos[2] - target[2];
              const horizontalDist = Math.hypot(dx, dz);
              pitchDeg = Number((Math.atan2(dy, horizontalDist) * (180 / Math.PI)).toFixed(1));
            }
            return JSON.stringify({
              ticket: '${opts.ticket}',
              viewport: '${viewportName}',
              cameraType: cam.isPerspectiveCamera ? 'PerspectiveCamera' : (cam.isOrthographicCamera ? 'OrthographicCamera' : 'Unknown'),
              position: pos,
              target,
              elevationY,
              pitchDeg,
              fov,
              gameState: gameStore ? {
                isRolling: Boolean(gameStore.isRolling),
                hasRolledThisTurn: Boolean(gameStore.hasRolledThisTurn),
                currentTurnPlayerId: gameStore.currentTurnPlayerId,
                isPawnAnimating: Boolean(gameStore.activePawnAnimation?.isAnimating),
                activeAnimationTarget: gameStore.activePawnAnimation?.targetCell ?? null,
                hasUserCustomCamera: Boolean(gameStore.hasUserCustomCamera),
              } : null
            });
          })()
        `,
        returnByValue: true,
      });

      if (evalRes && evalRes.result && evalRes.result.value) {
        const telemetryJson = evalRes.result.value;
        const telemetryData = JSON.parse(telemetryJson);
        const telemetryFile = path.join(evidenceDir, `camera_telemetry_${opts.ticket.toLowerCase()}_${viewportName}.json`);
        fs.writeFileSync(telemetryFile, JSON.stringify(telemetryData, null, 2), 'utf8');
        console.log(`   - Physical Three.js Camera Telemetry: ${telemetryFile}`);
        console.log(`     Elevation Y: ${telemetryData.elevationY}m | Pitch: ${telemetryData.pitchDeg}° | FOV: ${telemetryData.fov}°`);

        if (opts.assertCameraY) {
          const { min, max } = opts.assertCameraY;
          if (telemetryData.elevationY < min || telemetryData.elevationY > max) {
            throw new Error(`❌ Camera Y assertion failed for ${viewportName}: got ${telemetryData.elevationY}, expected [${min}, ${max}]`);
          }
          console.log(`     ✅ Camera Y assertion passed [${min} <= ${telemetryData.elevationY} <= ${max}]`);
        }
        return telemetryData;
      }
      return null;
    }

    if (opts.dualViewport) {
      // 1. Desktop Capture (1280x800)
      console.log(`📐 Setting Desktop Viewport (1280x800)...`);
      await send('Emulation.setDeviceMetricsOverride', {
        width: 1280,
        height: 800,
        deviceScaleFactor: 1,
        mobile: false,
      });
      await send('Network.setUserAgentOverride', {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      });
      await injectScenario(opts.scenario, opts.scenarioExpr);

      const desktopFile = `${opts.ticket.toLowerCase()}_desktop.jpg`;
      const desktopPath = path.join(tmpDir, desktopFile);
      const desktopShot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
      fs.writeFileSync(desktopPath, Buffer.from(desktopShot.data, 'base64'));
      console.log(`\n📸 DUAL-VIEWPORT [1/2] DESKTOP CAPTURED:`);
      console.log(`   - File: ${desktopPath}`);
      console.log(`   - Dimensions: 1280x800`);
      await extractBoundingBoxes('desktop');
      await extractCameraTelemetry('desktop');

      // 2. Mobile Capture (360x740)
      console.log(`📐 Setting Mobile Viewport (360x740)...`);
      await send('Emulation.setDeviceMetricsOverride', {
        width: 360,
        height: 740,
        deviceScaleFactor: 2,
        mobile: true,
      });
      await send('Network.setUserAgentOverride', {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
      });
      await injectScenario(opts.scenario, opts.scenarioExpr);

      const mobileFile = `${opts.ticket.toLowerCase()}_mobile_360.jpg`;
      const mobilePath = path.join(tmpDir, mobileFile);
      const mobileShot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
      fs.writeFileSync(mobilePath, Buffer.from(mobileShot.data, 'base64'));
      console.log(`\n📸 DUAL-VIEWPORT [2/2] MOBILE CAPTURED:`);
      console.log(`   - File: ${mobilePath}`);
      console.log(`   - Dimensions: 360x740`);
      await extractBoundingBoxes('mobile');
      await extractCameraTelemetry('mobile');
    } else {
      const filename = `${opts.ticket.toLowerCase()}_${opts.name}.jpg`;
      const outputPath = path.join(tmpDir, filename);

      await injectScenario(opts.scenario, opts.scenarioExpr);

      const captureParams = { format: 'jpeg', quality: 90 };
      if (opts.crop) {
        captureParams.clip = opts.crop;
      }

      const screenshot = await send('Page.captureScreenshot', captureParams);
      fs.writeFileSync(outputPath, Buffer.from(screenshot.data, 'base64'));

      console.log(`\n📸 PHYSICAL SCREENSHOT CAPTURED:`);
      console.log(`   - File: ${outputPath}`);
      console.log(`   - Dimensions: ${opts.crop ? `${opts.crop.width}x${opts.crop.height} (Cropped)` : '1280x800 (Full)'}`);
      console.log(`   - Ticket: ${opts.ticket}`);
      await extractCameraTelemetry(opts.name);
    }

    ws.close();
  } finally {
    browserProc.kill();
    if (previewProc) {
      previewProc.kill();
    }
  }
}

main().catch((err) => {
  console.error('❌ Error capturing screenshot:', err);
  process.exit(1);
});
