/**
 * scripts/visual_capture/viewport_capture_runner.mjs
 * 
 * Viewport screenshot capture runner for desktop, mobile, and custom bounding boxes.
 * Handles emulation metrics overrides, scenario injection, and physical file serialization.
 */

import fs from 'node:fs';
import path from 'node:path';
import { sleep } from './preview_server_manager.mjs';
import {
  injectScenario,
  extractBoundingBoxes,
  extractCameraTelemetry
} from './scenario_evaluator.mjs';

/**
 * Execute dual-viewport capture (Desktop 1280x800 + Mobile 360x740)
 */
export async function executeDualViewportCapture({
  send,
  opts,
  tmpDir,
  evidenceDir,
  visualScenariosDir,
  globalSignal
}) {
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
  await injectScenario(send, opts.scenario, opts.scenarioExpr, visualScenariosDir);
  await sleep(600, globalSignal);

  const desktopFile = `${opts.ticket.toLowerCase()}_desktop.jpg`;
  const desktopPath = path.join(tmpDir, desktopFile);
  const desktopShot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  fs.writeFileSync(desktopPath, Buffer.from(desktopShot.data, 'base64'));
  console.log(`\n📸 DUAL-VIEWPORT [1/2] DESKTOP CAPTURED:`);
  console.log(`   - File: ${desktopPath}`);
  console.log(`   - Dimensions: 1280x800`);
  await extractBoundingBoxes(send, evidenceDir, opts.ticket, 'desktop');
  await extractCameraTelemetry(send, evidenceDir, opts.ticket, 'desktop', opts.assertCameraY);

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
  await injectScenario(send, opts.scenario, opts.scenarioExpr, visualScenariosDir);
  await sleep(600, globalSignal);

  const mobileFile = `${opts.ticket.toLowerCase()}_mobile_360.jpg`;
  const mobilePath = path.join(tmpDir, mobileFile);
  const mobileShot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  fs.writeFileSync(mobilePath, Buffer.from(mobileShot.data, 'base64'));
  console.log(`\n📸 DUAL-VIEWPORT [2/2] MOBILE CAPTURED:`);
  console.log(`   - File: ${mobilePath}`);
  console.log(`   - Dimensions: 360x740`);
  await extractBoundingBoxes(send, evidenceDir, opts.ticket, 'mobile');
  await extractCameraTelemetry(send, evidenceDir, opts.ticket, 'mobile', opts.assertCameraY);
}

/**
 * Execute single viewport screenshot capture
 */
export async function executeSingleViewportCapture({
  send,
  opts,
  tmpDir,
  evidenceDir,
  visualScenariosDir
}) {
  const filename = `${opts.ticket.toLowerCase()}_${opts.name}.jpg`;
  const outputPath = path.join(tmpDir, filename);

  await injectScenario(send, opts.scenario, opts.scenarioExpr, visualScenariosDir);

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

/**
 * Parse CLI flags and options for visual evidence capture
 */
export function parseCaptureArgs() {
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
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--ticket' && args[i + 1]) {
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

