// [IMP-28/MSS] Persistent Room Logger Tests
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { PersistentRoomLogger } from '../../src/server/logging/persistent_room_logger.js';
import type { AdminRoomLogEntry } from '../../src/server/network/admin_types.js';

const TEST_LOG_DIR = path.resolve(process.cwd(), 'server_logs', 'test_room_logs');

function cleanTestDir(): void {
  try {
    if (fs.existsSync(TEST_LOG_DIR)) {
      fs.rmSync(TEST_LOG_DIR, { recursive: true, force: true });
    }
  } catch {
    /* safe-ignore */
  }
}

describe('[IMP-28/MSS] Persistent Room Logger Tests', () => {
  beforeEach(() => {
    cleanTestDir();
  });

  afterEach(() => {
    cleanTestDir();
  });

  it('[TC-LOG01.1/MSS] initRoomLog tạo tệp .jsonl và cập nhật manifest trạng thái ACTIVE', () => {
    const logger = new PersistentRoomLogger({ logDir: TEST_LOG_DIR });
    const fileName = logger.initRoomLog('TEST01', { hostId: 'player_host', playerCount: 2, timestamp: 1700000000000 });

    expect(fileName).toBe('TEST01_1700000000000.jsonl');
    const fullPath = path.join(TEST_LOG_DIR, fileName);
    expect(fs.existsSync(fullPath)).toBe(true);

    const manifestFile = path.join(TEST_LOG_DIR, 'rooms_manifest.json');
    expect(fs.existsSync(manifestFile)).toBe(true);

    const list = logger.getArchivedRoomsList();
    expect(list.length).toBe(1);
    expect(list[0]?.roomCode).toBe('TEST01');
    expect(list[0]?.status).toBe('ACTIVE');
    expect(list[0]?.playerCount).toBe(2);
    expect(list[0]?.totalEvents).toBe(0);
  });

  it('[TC-LOG01.2/MSS] appendEvent ghi nối dòng (append-only) thời gian thực chuẩn JSON', () => {
    const logger = new PersistentRoomLogger({ logDir: TEST_LOG_DIR });
    logger.initRoomLog('TEST02', { hostId: 'player_host', timestamp: 1700000001000 });

    const entry1: AdminRoomLogEntry = {
      id: 'log_1',
      roomCode: 'TEST02',
      timestamp: 1700000001100,
      source: 'PLAYER',
      action: 'CREATE_ROOM',
      payloadSummary: 'Tạo phòng chơi',
    };

    const entry2: AdminRoomLogEntry = {
      id: 'log_2',
      roomCode: 'TEST02',
      timestamp: 1700000001200,
      source: 'PLAYER',
      action: 'START_GAME',
      payloadSummary: 'Bắt đầu ván',
    };

    logger.appendEvent('TEST02', entry1);
    logger.appendEvent('TEST02', entry2);

    const fullPath = path.join(TEST_LOG_DIR, 'TEST02_1700000001000.jsonl');
    const content = fs.readFileSync(fullPath, 'utf8').trim().split('\n');
    expect(content.length).toBe(2);

    const parsed1 = JSON.parse(content[0] ?? '{}') as AdminRoomLogEntry;
    expect(parsed1.id).toBe('log_1');
    expect(parsed1.action).toBe('CREATE_ROOM');

    const parsed2 = JSON.parse(content[1] ?? '{}') as AdminRoomLogEntry;
    expect(parsed2.id).toBe('log_2');
    expect(parsed2.action).toBe('START_GAME');

    const list = logger.getArchivedRoomsList();
    expect(list[0]?.totalEvents).toBe(2);
    expect((list[0]?.fileSizeBytes ?? 0)).toBeGreaterThan(0);
  });

  it('[TC-LOG01.3/MSS] finishRoomLog chốt trạng thái FINISHED và bảo toàn tệp .jsonl trên đĩa', () => {
    const logger = new PersistentRoomLogger({ logDir: TEST_LOG_DIR });
    logger.initRoomLog('TEST03', { hostId: 'host_a', timestamp: 1700000002000 });
    logger.appendEvent('TEST03', {
      id: 'log_roll',
      roomCode: 'TEST03',
      timestamp: 1700000002100,
      source: 'PLAYER',
      action: 'ROLL_DICE',
      payloadSummary: 'Đổ xúc xắc',
    });

    logger.finishRoomLog('TEST03', {
      status: 'FINISHED',
      winner: 'player_winner',
      endTime: 1700000003000,
    });

    const fullPath = path.join(TEST_LOG_DIR, 'TEST03_1700000002000.jsonl');
    expect(fs.existsSync(fullPath)).toBe(true);

    const list = logger.getArchivedRoomsList();
    expect(list.length).toBe(1);
    expect(list[0]?.status).toBe('FINISHED');
    expect(list[0]?.winner).toBe('player_winner');
    expect(list[0]?.endTime).toBe(1700000003000);
  });

  it('[TC-LOG01.4/MSS] getRoomFullLog truy xuất 100% dòng log theo đúng trình tự thời gian', () => {
    const logger = new PersistentRoomLogger({ logDir: TEST_LOG_DIR });
    logger.initRoomLog('TEST04', { timestamp: 1700000004000 });

    for (let i = 1; i <= 15; i++) {
      logger.appendEvent('TEST04', {
        id: `log_${i}`,
        roomCode: 'TEST04',
        timestamp: 1700000004000 + i * 100,
        source: 'BOT',
        action: `ACTION_${i}`,
        payloadSummary: `Thao tác thứ ${i}`,
      });
    }

    const logs = logger.getRoomFullLog('TEST04');
    expect(logs.length).toBe(15);
    expect(logs[0]?.action).toBe('ACTION_1');
    expect(logs[14]?.action).toBe('ACTION_15');
  });

  it('[TC-LOG01.5-inv/Adversarial] getRoomFullLog trả về mảng rỗng khi tra cứu phòng không tồn tại', () => {
    const logger = new PersistentRoomLogger({ logDir: TEST_LOG_DIR });
    const logs = logger.getRoomFullLog('KHONG_TON_TAI');
    expect(Array.isArray(logs)).toBe(true);
    expect(logs.length).toBe(0);
  });

  it('[TC-LOG01.6/MSS] loadManifest khôi phục dữ liệu từ tệp manifest có sẵn', () => {
    const logger1 = new PersistentRoomLogger({ logDir: TEST_LOG_DIR });
    logger1.initRoomLog('TEST06', { timestamp: 1700000006000, playerCount: 3 });
    logger1.finishRoomLog('TEST06', { status: 'TERMINATED', winner: 'player_term' });

    // Khởi tạo instance logger mới trên cùng thư mục lưu trữ
    const logger2 = new PersistentRoomLogger({ logDir: TEST_LOG_DIR });
    const list = logger2.getArchivedRoomsList();
    expect(list.length).toBe(1);
    expect(list[0]?.roomCode).toBe('TEST06');
    expect(list[0]?.status).toBe('TERMINATED');
    expect(list[0]?.playerCount).toBe(3);
  });

  it('[TC-LOG01.7-inv/Adversarial] getRoomFullLog phục hồi an toàn các dòng hợp lệ khi gặp dòng lỗi/corrupted do sập nguồn', () => {
    const logger = new PersistentRoomLogger({ logDir: TEST_LOG_DIR });
    const fileName = logger.initRoomLog('CRASH01', { timestamp: 1700000007000 });
    const fullPath = path.join(TEST_LOG_DIR, fileName);

    const valid1: AdminRoomLogEntry = {
      id: 'log_ok1',
      roomCode: 'CRASH01',
      timestamp: 1700000007100,
      source: 'SERVER',
      action: 'ACTION_OK1',
      payloadSummary: 'Valid entry 1',
    };
    const valid2: AdminRoomLogEntry = {
      id: 'log_ok2',
      roomCode: 'CRASH01',
      timestamp: 1700000007200,
      source: 'BOT',
      action: 'ACTION_OK2',
      payloadSummary: 'Valid entry 2',
    };

    // Giả lập ghi dòng corrupted xen giữa các dòng hợp lệ
    fs.appendFileSync(fullPath, JSON.stringify(valid1) + '\n', 'utf8');
    fs.appendFileSync(fullPath, '{"id": "broken", "action": INVALID_JSON_CORRUPTED...\n', 'utf8');
    fs.appendFileSync(fullPath, JSON.stringify(valid2) + '\n', 'utf8');

    const logs = logger.getRoomFullLog('CRASH01');
    expect(logs.length).toBe(2);
    expect(logs[0]?.id).toBe('log_ok1');
    expect(logs[1]?.id).toBe('log_ok2');
  });

  it('[TC-LOG01.8/MSS] finishRoomLog cập nhật đúng số người chơi cuối cùng playerCount và phân biệt rõ status', () => {
    const logger = new PersistentRoomLogger({ logDir: TEST_LOG_DIR });
    logger.initRoomLog('TEST08', { timestamp: 1700000008000, playerCount: 1 });

    logger.finishRoomLog('TEST08', {
      status: 'FINISHED',
      winner: 'p1_ba',
      playerCount: 4,
      endTime: 1700000009000,
    });

    const list = logger.getArchivedRoomsList();
    expect(list.length).toBe(1);
    expect(list[0]?.playerCount).toBe(4);
    expect(list[0]?.status).toBe('FINISHED');
    expect(list[0]?.winner).toBe('p1_ba');
  });

  it('[TC-LOG01.9/MSS] Chuẩn hóa khoảng trắng và chữ hoa chữ thường roomCode trong toàn bộ API', () => {
    const logger = new PersistentRoomLogger({ logDir: TEST_LOG_DIR });
    logger.initRoomLog('  test_norm  ', { timestamp: 1700000010000 });

    logger.appendEvent('test_norm', {
      id: 'log_norm',
      roomCode: 'TEST_NORM',
      timestamp: 1700000010100,
      source: 'PLAYER',
      action: 'ROLL',
      payloadSummary: 'Tung xúc xắc',
    });

    const logs = logger.getRoomFullLog(' TEST_NORM ');
    expect(logs.length).toBe(1);
    expect(logs[0]?.action).toBe('ROLL');
  });

  it('[TC-LOG01.10/MSS] appendEvent cập nhật in-memory manifest mà không gây nghẽn đĩa cứng (Zero I/O blocking)', () => {
    const logger = new PersistentRoomLogger({ logDir: TEST_LOG_DIR });
    logger.initRoomLog('TEST10', { timestamp: 1700000011000 });

    for (let i = 1; i <= 20; i++) {
      logger.appendEvent('TEST10', {
        id: `ev_${i}`,
        roomCode: 'TEST10',
        timestamp: 1700000011000 + i * 10,
        source: 'PLAYER',
        action: 'MOVE',
        payloadSummary: `Bước ${i}`,
      });
    }

    const list = logger.getArchivedRoomsList();
    expect(list[0]?.totalEvents).toBe(20);
    expect((list[0]?.fileSizeBytes ?? 0)).toBeGreaterThan(0);
  });

  it('[TC-LOG01.11/MSS] Hàng đợi đệm bất đồng bộ (Buffered Queue): appendEvent không chặn Event Loop, flushSync ghi toàn bộ đệm vào đĩa', () => {
    const logger = new PersistentRoomLogger({ logDir: TEST_LOG_DIR, flushIntervalMs: 500 });
    const fileName = logger.initRoomLog('ASYNC01', { timestamp: 1700000020000 });
    const fullPath = path.join(TEST_LOG_DIR, fileName);

    logger.appendEvent('ASYNC01', {
      id: 'async_ev1',
      roomCode: 'ASYNC01',
      timestamp: 1700000020100,
      source: 'PLAYER',
      action: 'DICE_ROLL',
      payloadSummary: 'Tung xí ngầu 6-6',
    });

    // Khi có buffer interval (500ms), dữ liệu chưa được ghi đồng bộ ngay vào file
    const contentBefore = fs.readFileSync(fullPath, 'utf8');
    expect(contentBefore).toBe('');

    // Gọi flushSync(): Toàn bộ hàng đợi được xả xuống đĩa
    logger.flushSync();
    const contentAfter = fs.readFileSync(fullPath, 'utf8').trim();
    expect(contentAfter).toContain('async_ev1');
    expect(contentAfter).toContain('Tung xí ngầu 6-6');

    logger.stop();
  });
});
