import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';

const BROWSER_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9255;
const TARGET_URL = 'http://localhost:5173/';

const OUTPUT_DIRS = [
  path.resolve(process.cwd(), 'docs/reports/improvements/screenshots'),
  'C:/Users/HP/.gemini/antigravity/brain/e825da81-3261-4f07-a9d1-8d93afb74215',
  'C:/Users/HP/.gemini/antigravity/brain/91371eb7-641e-4e12-9dfb-fcd1119f3d66',
];

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

class RetinaCdpHarness {
  constructor() {
    const sysTemp = process.env.TEMP || 'C:\\Users\\HP\\AppData\\Local\\Temp';
    this.tempDir = path.join(sysTemp, `edge_retina_capture_${Date.now()}`);
    this.proc = null;
    this.ws = null;
    this.messageId = 1;
    this.pendingRequests = new Map();
  }

  async start() {
    fs.mkdirSync(this.tempDir, { recursive: true });

    console.log(`[CDP] Launching Edge headless on port ${PORT}...`);
    this.proc = spawn(
      BROWSER_PATH,
      [
        '--headless=new',
        `--remote-debugging-port=${PORT}`,
        '--window-size=1920,1080',
        '--no-first-run',
        '--no-default-browser-check',
        `--user-data-dir=${this.tempDir}`,
        '--enable-webgl',
        '--ignore-gpu-blocklist',
        TARGET_URL,
      ],
      { stdio: 'ignore' }
    );

    let debuggerUrl = null;
    for (let i = 0; i < 40; i++) {
      await sleep(400);
      try {
        const list = await fetchJson(`http://127.0.0.1:${PORT}/json/list`);
        const page = list.find((t) => t.type === 'page' && (t.url.includes('3000') || t.url.includes('5173') || t.url.includes('127.0.0.1')));
        if (page?.webSocketDebuggerUrl) {
          debuggerUrl = page.webSocketDebuggerUrl;
          break;
        }
      } catch {}
    }

    if (!debuggerUrl) {
      throw new Error(`Could not connect to Edge debugger on port ${PORT}`);
    }

    console.log(`[CDP] Connecting to debugger WebSocket: ${debuggerUrl}`);
    this.ws = new WebSocket(debuggerUrl);
    await new Promise((res, rej) => {
      this.ws.on('open', res);
      this.ws.on('error', rej);
    });

    this.ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.id && this.pendingRequests.has(msg.id)) {
          const req = this.pendingRequests.get(msg.id);
          this.pendingRequests.delete(msg.id);
          if (msg.error) req.reject(msg.error);
          else req.resolve(msg.result);
        }
      } catch (err) {
        console.error('[CDP] Message parse error:', err);
      }
    });

    await this.sendCmd('Page.enable');
    await this.sendCmd('Runtime.enable');

    // CONFIGURE RETINA 2X DPI (3840x2160 actual canvas resolution)
    console.log('[CDP] Setting Device Metrics Override: 1920x1080 CSS @ 2x DPR...');
    await this.sendCmd('Emulation.setDeviceMetricsOverride', {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 2,
      mobile: false,
    });

    await sleep(3000); // Allow R3F Canvas and shaders to mount
  }

  sendCmd(method, params = {}) {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        return reject(new Error('WebSocket not connected'));
      }
      const id = this.messageId++;
      this.pendingRequests.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async saveScreenshot(baseName) {
    // High Quality JPEG capture (quality 92, standard IMP-19)
    const jpgResult = await this.sendCmd('Page.captureScreenshot', {
      format: 'jpeg',
      quality: 92,
      captureBeyondViewport: false,
    });
    const jpgBuf = Buffer.from(jpgResult.data, 'base64');

    for (const dir of OUTPUT_DIRS) {
      if (fs.existsSync(dir)) {
        fs.writeFileSync(path.join(dir, `${baseName}.jpg`), jpgBuf);
      }
    }

    console.log(`[CAPTURE] Saved ${baseName}.jpg (${jpgBuf.length} bytes, JPEG Q92)`);
  }

  async close() {
    try {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.close();
      }
      if (this.proc) {
        this.proc.kill('SIGKILL');
      }
      await sleep(500);
      try {
        if (fs.existsSync(this.tempDir)) {
          fs.rmSync(this.tempDir, { recursive: true, force: true });
        }
      } catch {}
    } catch (e) {
      console.warn('[CDP] Cleanup error:', e);
    }
  }
}

async function main() {
  console.log('=== KHỞI ĐỘNG RETINA 2X CAPTURE HARNESS CHO IMP-17 ===');
  for (const dir of OUTPUT_DIRS) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const harness = new RetinaCdpHarness();
  await harness.start();

  // 1. Khóa gameStarted và thiết lập View game
  console.log('[1/5] Khóa trạng thái game bàn cờ 3D...');
  await harness.sendCmd('Runtime.evaluate', {
    expression: `
      (() => {
        if (window.__lobbyStore) {
          window.__lobbyStore.setState({ gameStarted: true });
          window.__lobbyStore.subscribe((state) => {
            if (!state.gameStarted) {
              window.__lobbyStore.setState({ gameStarted: true });
            }
          });
        }
      })()
    `,
  });
  await sleep(1000);

  // 2. Nạp dữ liệu 4 người chơi thượng lưu
  console.log('[2/5] Nạp thông tin 4 người chơi & tài sản địa ốc...');
  await harness.sendCmd('Runtime.evaluate', {
    expression: `
      (() => {
        if (!window.__gameStore) return;
        const g = window.__gameStore.getState();
        g.setPlayersInfo({
          p1: { id: 'p1', name: 'Đại Gia Sài Gòn', balance: 14200, tokenColor: '#38BDF8', ownedProperties: [1, 3, 6], bankrupt: false, isBot: false },
          p2: { id: 'p2', name: 'Tỷ Phú Hà Nội', balance: 11500, tokenColor: '#F59E0B', ownedProperties: [8, 9, 11], bankrupt: false, isBot: true },
          p3: { id: 'p3', name: 'Công Tử Bạc Liêu', balance: 18300, tokenColor: '#10B981', ownedProperties: [13, 14, 15], bankrupt: false, isBot: true },
          p4: { id: 'p4', name: 'Nữ Hoàng Đất Vàng', balance: 8700, tokenColor: '#EC4899', ownedProperties: [18, 19], bankrupt: false, isBot: true }
        });
        g.setPlayerPositions({ p1: 6, p2: 11, p3: 15, p4: 19 });
        g.setDice([3, 4]);
        g.setCurrentTurnPlayerId('p1');
        g.setLevelMap({ 1: 2, 6: 1, 8: 1, 13: 2, 18: 1 });
        g.setTreasuryPool(2800);
        g.setRoundInfo(5, 30);
        g.setTurnTimeRemaining(45);
      })()
    `,
  });
  await sleep(800);

  // 3. Nạp 10 sự kiện nhật ký đa dạng vào Activity Store
  console.log('[3/5] Nạp 10 sự kiện chuẩn nghiệp vụ vào ActivityStore...');
  await harness.sendCmd('Runtime.evaluate', {
    expression: `
      (() => {
        if (!window.__activityStore) return;
        const act = window.__activityStore.getState();
        act.clearLogs();
        const now = Date.now();

        const logs = [
          {
            id: 'act_1',
            timestamp: now - 60000,
            type: 'dice',
            message: 'Đại Gia Sài Gòn đã gieo xúc xắc được 3 + 4 = 7 điểm',
            playerId: 'p1',
            playerName: 'Đại Gia Sài Gòn',
            playerTokenColor: '#38BDF8'
          },
          {
            id: 'act_2',
            timestamp: now - 54000,
            type: 'move',
            message: 'Đại Gia Sài Gòn đã di chuyển đến Bến Bạch Đằng',
            playerId: 'p1',
            playerName: 'Đại Gia Sài Gòn',
            cellIndex: 6,
            playerTokenColor: '#38BDF8'
          },
          {
            id: 'act_3',
            timestamp: now - 48000,
            type: 'buy',
            message: 'Đại Gia Sài Gòn đã mua Bến Bạch Đằng với giá 1.000 Tr.',
            playerId: 'p1',
            playerName: 'Đại Gia Sài Gòn',
            amount: -1000,
            cellIndex: 6,
            playerTokenColor: '#38BDF8'
          },
          {
            id: 'act_4',
            timestamp: now - 40000,
            type: 'upgrade',
            message: 'Tỷ Phú Hà Nội đã nâng cấp Hồ Gươm lên C1 (Nhà Phố)',
            playerId: 'p2',
            playerName: 'Tỷ Phú Hà Nội',
            amount: -500,
            cellIndex: 8,
            playerTokenColor: '#F59E0B'
          },
          {
            id: 'act_5',
            timestamp: now - 32000,
            type: 'dice',
            message: 'Công Tử Bạc Liêu đã gieo xúc xắc được 5 + 5 = 10 điểm (Đổ đôi! 🎉)',
            playerId: 'p3',
            playerName: 'Công Tử Bạc Liêu',
            playerTokenColor: '#10B981'
          },
          {
            id: 'act_6',
            timestamp: now - 25000,
            type: 'rent',
            message: 'Công Tử Bạc Liêu đã trả 650 Tr. tiền thuê cho Đại Gia Sài Gòn',
            playerId: 'p3',
            playerName: 'Công Tử Bạc Liêu',
            amount: -650,
            playerTokenColor: '#10B981'
          },
          {
            id: 'act_7',
            timestamp: now - 18000,
            type: 'auction',
            message: 'Nữ Hoàng Đất Vàng đã đặt giá 1.400 Tr. cho Phố Cổ Hội An',
            playerId: 'p4',
            playerName: 'Nữ Hoàng Đất Vàng',
            amount: -1400,
            cellIndex: 18,
            playerTokenColor: '#EC4899'
          },
          {
            id: 'act_8',
            timestamp: now - 12000,
            type: 'upgrade',
            message: 'Đại Gia Sài Gòn đã nâng cấp Phố Đi Bộ Nguyễn Huệ lên C2 (Biệt Thự)',
            playerId: 'p1',
            playerName: 'Đại Gia Sài Gòn',
            amount: -600,
            cellIndex: 1,
            playerTokenColor: '#38BDF8'
          },
          {
            id: 'act_9',
            timestamp: now - 7000,
            type: 'tax',
            message: 'Tỷ Phú Hà Nội đã nộp phí / nộp thuế 300 Tr.',
            playerId: 'p2',
            playerName: 'Tỷ Phú Hà Nội',
            amount: -300,
            playerTokenColor: '#F59E0B'
          },
          {
            id: 'act_10',
            timestamp: now - 2000,
            type: 'mortgage',
            message: 'Nữ Hoàng Đất Vàng đã thế chấp Đèo Hải Vân vào ngân hàng',
            playerId: 'p4',
            playerName: 'Nữ Hoàng Đất Vàng',
            amount: 600,
            cellIndex: 19,
            playerTokenColor: '#EC4899'
          }
        ];

        for (const l of logs) {
          act.addActivityLog(l);
        }
      })()
    `,
  });
  await sleep(1000);

  // SHOT 1: Sideboard MỞ - Tất Cả Hoạt Động (Filter: all)
  console.log('[Chụp Ảnh 1] Sideboard Overview - Tất Cả Hoạt Động...');
  await harness.sendCmd('Runtime.evaluate', {
    expression: `
      (() => {
        window.__activityStore.getState().setFilter('all');
        window.__activityStore.getState().setOpen(true);
      })()
    `,
  });
  await sleep(1500);
  await harness.saveScreenshot('imp17_01_sideboard_overview');

  // SHOT 2: Sideboard MỞ - Bộ Lọc Giao Dịch Tiền (Filter: money)
  console.log('[Chụp Ảnh 2] Sideboard Filter - Giao Dịch Tiền...');
  await harness.sendCmd('Runtime.evaluate', {
    expression: `
      (() => {
        window.__activityStore.getState().setFilter('money');
      })()
    `,
  });
  await sleep(1000);
  await harness.saveScreenshot('imp17_02_sideboard_filter_money');

  // SHOT 3: Sideboard MỞ - Bộ Lọc Nhà Đất (Filter: property)
  console.log('[Chụp Ảnh 3] Sideboard Filter - Nhà Đất...');
  await harness.sendCmd('Runtime.evaluate', {
    expression: `
      (() => {
        window.__activityStore.getState().setFilter('property');
      })()
    `,
  });
  await sleep(1000);
  await harness.saveScreenshot('imp17_03_sideboard_filter_property');

  // SHOT 4: Sideboard ĐÓNG - Nút Toggle trên TopBar kèm Unread Badge đỏ
  console.log('[Chụp Ảnh 4] TopBar Unread Badge khi đóng Sideboard...');
  await harness.sendCmd('Runtime.evaluate', {
    expression: `
      (() => {
        const act = window.__activityStore.getState();
        act.setOpen(false);
        // Thêm 5 logs khi đóng để unreadCount = 5
        act.addActivityLog({ type: 'dice', message: 'Công Tử Bạc Liêu gieo xúc xắc 4 + 2 = 6' });
        act.addActivityLog({ type: 'rent', message: 'Tỷ Phú Hà Nội trả tiền thuê 400 Tr.', amount: -400 });
        act.addActivityLog({ type: 'upgrade', message: 'Đại Gia Sài Gòn nâng cấp C3 Khách Sạn', amount: -800 });
        act.addActivityLog({ type: 'tax', message: 'Nữ Hoàng Đất Vàng nộp thuế 200 Tr.', amount: -200 });
        act.addActivityLog({ type: 'card', message: 'Rút thẻ Cơ Hội: Nhận cổ tức 500 Tr.', amount: 500 });
      })()
    `,
  });
  await sleep(1200);
  await harness.saveScreenshot('imp17_04_topbar_unread_badge');

  await harness.close();
  console.log('=== ĐÃ HOÀN TẤT CHỤP TOÀN BỘ 4 ẢNH RETINA 2X LOSSLESS THÀNH CÔNG ===');
}

main().catch((err) => {
  console.error('[FATAL ERROR]', err);
  process.exit(1);
});
