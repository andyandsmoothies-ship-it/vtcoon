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

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

const repoRoot = process.cwd();
const tmpDir = path.join(repoRoot, '.agents', 'tmp');

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
      `,
    });
    await sleep(800);

    // Scenario Injection if specified
    if (opts.scenario) {
      console.log(`🎬 Injecting UI scenario: "${opts.scenario}"...`);
      await send('Runtime.evaluate', {
        expression: `
          (function() {
            if ('${opts.scenario}' === 'deed_modal') {
              const buyBtn = document.querySelector('[data-testid="action-dock-buy"]');
              if (buyBtn) buyBtn.click();
            } else if ('${opts.scenario}' === 'transit_wheel') {
              const wheelBtn = document.querySelector('[data-testid="action-dock-transit-wheel"]');
              if (wheelBtn) wheelBtn.click();
            }
          })();
        `,
      });
      await sleep(1000);
    } else if (opts.scenarioExpr) {
      console.log(`🎬 Evaluating scenario expression...`);
      await send('Runtime.evaluate', { expression: opts.scenarioExpr });
      await sleep(1000);
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
      await sleep(1000);

      const desktopFile = `${opts.ticket.toLowerCase()}_desktop.jpg`;
      const desktopPath = path.join(tmpDir, desktopFile);
      const desktopShot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
      fs.writeFileSync(desktopPath, Buffer.from(desktopShot.data, 'base64'));
      console.log(`\n📸 DUAL-VIEWPORT [1/2] DESKTOP CAPTURED:`);
      console.log(`   - File: ${desktopPath}`);
      console.log(`   - Dimensions: 1280x800`);

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
      await sleep(1000);

      const mobileFile = `${opts.ticket.toLowerCase()}_mobile_360.jpg`;
      const mobilePath = path.join(tmpDir, mobileFile);
      const mobileShot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
      fs.writeFileSync(mobilePath, Buffer.from(mobileShot.data, 'base64'));
      console.log(`\n📸 DUAL-VIEWPORT [2/2] MOBILE CAPTURED:`);
      console.log(`   - File: ${mobilePath}`);
      console.log(`   - Dimensions: 360x740`);
    } else {
      const filename = `${opts.ticket.toLowerCase()}_${opts.name}.jpg`;
      const outputPath = path.join(tmpDir, filename);

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
