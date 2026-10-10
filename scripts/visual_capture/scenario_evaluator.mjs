import fs from 'node:fs';
import path from 'node:path';
import { sleep } from './preview_server_manager.mjs';

export const DEFAULT_SCENARIOS = [
  'default',
  'high-roller',
  'property-tycoon',
  'auction-fever',
  'jail-bird',
  'tile-aura',
  'street-chase'
];

/**
 * Injects DOM cleanups and worst-case 4-player setup for HUD/Toast layout tests.
 */
export async function cleanOverlayBanners(send) {
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
}

/**
 * Injects scenario script or executes custom expression in the browser context.
 */
export async function injectScenario(send, scenarioName, scenarioExpr, visualScenariosDir) {
  if (scenarioName) {
    console.log(`🎬 Injecting UI scenario: "${scenarioName}"...`);
    const scenarioPath = path.resolve(visualScenariosDir, `${scenarioName}.js`);
    if (fs.existsSync(scenarioPath)) {
      const scenarioCode = fs.readFileSync(scenarioPath, 'utf8');
      await send('Runtime.evaluate', {
        expression: `(function() {\n${scenarioCode}\n})()`,
        returnByValue: true,
      });
    } else {
      console.warn(`⚠️ Scenario file not found: ${scenarioPath}`);
    }
    await sleep(1500);
  } else if (scenarioExpr) {
    console.log(`🎬 Evaluating scenario expression...`);
    const res = await send('Runtime.evaluate', { expression: scenarioExpr });
    if (res && res.exceptionDetails) {
      console.error('❌ Scenario expression failed:', JSON.stringify(res.exceptionDetails));
    }
    await sleep(700);
  }
}

/**
 * Extracts DOM element bounding boxes from browser context and writes to evidence dir.
 */
export async function extractBoundingBoxes(send, evidenceDir, ticket, viewportName) {
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
    const boundsFile = path.join(evidenceDir, `bounding_box_${ticket.toLowerCase()}_${viewportName}.json`);
    fs.writeFileSync(boundsFile, boundsJson, 'utf8');
    console.log(`   - Physical DOM Bounding Boxes: ${boundsFile}`);
    console.log(`     ${boundsJson}`);
  }
}

/**
 * Extracts Three.js camera telemetry and verifies elevation/pitch assertions.
 */
export async function extractCameraTelemetry(send, evidenceDir, ticket, viewportName, assertCameraY) {
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
          ticket: '${ticket}',
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
    const telemetryFile = path.join(evidenceDir, `camera_telemetry_${ticket.toLowerCase()}_${viewportName}.json`);
    fs.writeFileSync(telemetryFile, JSON.stringify(telemetryData, null, 2), 'utf8');
    console.log(`   - Physical Three.js Camera Telemetry: ${telemetryFile}`);
    console.log(`     Elevation Y: ${telemetryData.elevationY}m | Pitch: ${telemetryData.pitchDeg}° | FOV: ${telemetryData.fov}°`);

    if (assertCameraY) {
      const { min, max } = assertCameraY;
      if (telemetryData.elevationY < min || telemetryData.elevationY > max) {
        throw new Error(`❌ Camera Y assertion failed for ${viewportName}: got ${telemetryData.elevationY}, expected [${min}, ${max}]`);
      }
      console.log(`     ✅ Camera Y assertion passed [${min} <= ${telemetryData.elevationY} <= ${max}]`);
    }
    return telemetryData;
  }
  return null;
}
