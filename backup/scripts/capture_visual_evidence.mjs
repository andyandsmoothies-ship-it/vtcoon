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

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  killProcessTree,
  sleep,
  ensureFreshBuild,
  ensurePreviewServer
} from './visual_capture/preview_server_manager.mjs';
import {
  findBrowser,
  launchBrowser,
  connectCdp,
  applyClockPinning
} from './visual_capture/cdp_browser_client.mjs';
import {
  DEFAULT_SCENARIOS,
  cleanOverlayBanners
} from './visual_capture/scenario_evaluator.mjs';
import {
  parseCaptureArgs as parseArgs,
  executeDualViewportCapture,
  executeSingleViewportCapture
} from './visual_capture/viewport_capture_runner.mjs';

// Registered In-Action Scenarios (re-exported for plan audit compatibility)
export const REGISTERED_SCENARIOS = ['default', 'high-roller', 'property-tycoon', 'auction-fever', 'jail-bird', 'tile-aura', 'street-chase'];
export { DEFAULT_SCENARIOS };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = process.cwd();
const tmpDir = path.join(repoRoot, '.agents', 'tmp');
const evidenceDir = path.join(repoRoot, '.agents', 'evidence');
const visualScenariosDir = path.join(__dirname, 'visual_scenarios');

const abortController = new AbortController();
const globalSignal = abortController.signal;

let activeBrowserProc = null;
let activePreviewProc = null;
let activeWs = null;
let isCleanedUp = false;

function cleanup() {
  if (isCleanedUp) return;
  isCleanedUp = true;
  abortController.abort();

  if (activeWs) {
    try {
      activeWs.close();
    } catch {}
    activeWs = null;
  }

  if (activeBrowserProc) {
    killProcessTree(activeBrowserProc);
    activeBrowserProc = null;
  }

  if (activePreviewProc) {
    killProcessTree(activePreviewProc);
    activePreviewProc = null;
  }
}

process.on('SIGINT', () => {
  console.log('\n🛑 Interrupted by user (SIGINT). Terminating active browser and preview processes cleanly...');
  cleanup();
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Interrupted by system (SIGTERM). Terminating active browser and preview processes cleanly...');
  cleanup();
  process.exit(1);
});

async function main() {
  const opts = parseArgs();
  if (opts.help) {
    console.log(`
Usage: node scripts/capture_visual_evidence.mjs [options]
Options:
  --ticket <ID>         Ticket ID (e.g. IMP-233)
  --dual-viewport       Capture both mobile (360x740) and desktop (1280x800)
  --name <name>         Output filename slug (default: full_board)
  --url <url>           Target URL (default: http://localhost:4173/?room=VTTEST&host=true)
  --port <port>         Vite preview port (default: 4173)
  --debugPort <port>    Chrome remote debugging port (default: 9222)
  --wait <ms>           Wait time after page load in ms (default: 5000)
  --crop <x,y,w,h>      Crop rectangle [x, y, width, height]
  --scenario <name>     Pre-capture scenario to inject
  --help, -h            Show this help message
`);
    return;
  }

  const browserPath = findBrowser();
  if (!browserPath) {
    console.error('❌ No suitable Chrome or Edge browser executable found on system.');
    process.exit(1);
  }

  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  // 0. Auto-Build Check
  ensureFreshBuild(repoRoot);

  // 1. Verify Preview Server
  activePreviewProc = await ensurePreviewServer(opts.port, globalSignal);

  // 2. Launch Browser with CDP
  console.log(`🌐 Launching headless browser: ${browserPath}`);
  activeBrowserProc = launchBrowser(browserPath, opts.debugPort, opts.url);

  try {
    const { ws, send } = await connectCdp(opts.debugPort, opts.port, globalSignal);
    activeWs = ws;

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Network.enable');

    await applyClockPinning(send);

    console.log(`⏳ Waiting ${opts.waitMs}ms for 3D/UI scene rendering...`);
    await sleep(opts.waitMs, globalSignal);

    await cleanOverlayBanners(send);

    if (opts.dualViewport) {
      await executeDualViewportCapture({
        send,
        opts,
        tmpDir,
        evidenceDir,
        visualScenariosDir,
        globalSignal
      });
    } else {
      await executeSingleViewportCapture({
        send,
        opts,
        tmpDir,
        evidenceDir,
        visualScenariosDir
      });
    }

    try {
      ws.close();
    } catch {}
  } finally {
    cleanup();
  }
}

main().catch((err) => {
  console.error('❌ Error capturing screenshot:', err);
  process.exit(1);
});
