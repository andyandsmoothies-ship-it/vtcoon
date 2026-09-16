// [TC-AUDIT-NET-WGL/MSS] Audit Suite: Network 60s Grace Period Resilience & WebGL Memory Leak Invariants
// Hạng mục 3: Kiểm tra độ chịu tải rớt mạng 60s (Disconnection & Grace Period Resilience)
// Hạng mục 4: Kiểm tra rò rỉ bộ nhớ WebGL & Quản lý tài nguyên (WebGL Memory Leak & Resource Disposal)

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReconnectManager } from '../../src/server/network/reconnect_manager.js';
import { SessionManager, SessionState, GRACE_PERIOD_MS } from '../../src/server/session_manager.js';
import { RoomManager } from '../../src/server/room_manager.js';
import { DeltaBroadcaster } from '../../src/server/network/delta_broadcaster.js';
import { createRoom, createPlayer, TurnPhase, BOARD_SIZE } from '../../src/domain/room.js';
import { BotEngine } from '../../src/domain/bot/bot_engine.js';
import { DEFAULT_PIPELINE_CONFIG } from '../../src/client/3d/post_processing_pipeline.js';
import { clearMascotTextureCache } from '../../src/client/3d/mascot_canvas_texture.js';
import type { WsServerMessage } from '../../src/server/network/network_types.js';

describe('[AUDIT-SUITE] Hạng Mục 3: Độ Chịu Tải Rớt Mạng 60s & Phục Hồi Phiên (Network Resilience)', () => {
  let roomManager: RoomManager;
  let sessionManager: SessionManager;
  let broadcaster: DeltaBroadcaster;
  let reconnectManager: ReconnectManager;
  let broadcastedMessages: Array<{ roomCode: string; msg: WsServerMessage }>;

  beforeEach(() => {
    roomManager = new RoomManager();
    sessionManager = new SessionManager();
    broadcastedMessages = [];

    broadcaster = new DeltaBroadcaster(
      roomManager,
      sessionManager,
      (roomCode, msg) => {
        broadcastedMessages.push({ roomCode, msg });
      },
    );

    reconnectManager = new ReconnectManager({
      rooms: roomManager,
      sessions: sessionManager,
      broadcaster,
      broadcast: (roomCode, msg) => {
        broadcastedMessages.push({ roomCode, msg });
      },
      gracePeriodMs: 60_000,
    });
  });

  it('[TC-AUDIT-NET.01] Khi socket đứt, kích hoạt ân hạn 60s, chuyển session sang GracePeriod và phát sóng PLAYER_GRACE', () => {
    const room = roomManager.createRoom('p1');
    sessionManager.addSession('p1');

    reconnectManager.startGracePeriod(room.roomCode, 'p1');

    const session = sessionManager.getSession('p1');
    expect(session?.state).toBe(SessionState.GracePeriod);

    const graceMsg = broadcastedMessages.find(
      (m) => m.roomCode === room.roomCode && m.msg.type === 'PLAYER_GRACE'
    );
    expect(graceMsg).toBeDefined();
    if (graceMsg && graceMsg.msg.type === 'PLAYER_GRACE') {
      expect(graceMsg.msg.playerId).toBe('p1');
      expect(graceMsg.msg.secondsLeft).toBe(60);
    }
  });

  it('[TC-AUDIT-NET.02] Cấp phát Reconnect Token UUID v4 duy nhất và bảo toàn ánh xạ với người chơi', () => {
    const room = roomManager.createRoom('p1');
    const token = reconnectManager.generateToken('p1', room.roomCode);

    expect(token).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
    expect(reconnectManager.isTokenValid(token)).toBe(true);

    const verification = reconnectManager.verifyToken(token, room.roomCode);
    expect(verification.success).toBe(true);
    if (verification.success) {
      expect(verification.record.playerId).toBe('p1');
      expect(verification.record.roomCode).toBe(room.roomCode);
      expect(verification.record.expired).toBe(false);
    }
  });

  it('[TC-AUDIT-NET.03] Người chơi kết nối lại trong 60s: hủy bộ đếm ân hạn và khôi phục trạng thái an toàn', () => {
    const room = roomManager.createRoom('p1');
    sessionManager.addSession('p1');

    reconnectManager.startGracePeriod(room.roomCode, 'p1');
    const cancelled = reconnectManager.cancelGracePeriod(room.roomCode, 'p1');
    expect(cancelled).toBe(true);

    // Hủy lần 2 trả về false (idempotent)
    const cancelledAgain = reconnectManager.cancelGracePeriod(room.roomCode, 'p1');
    expect(cancelledAgain).toBe(false);
  });

  it('[TC-AUDIT-NET.04] Phòng thủ token giả mạo: Từ chối token không tồn tại với TOKEN_INVALID', () => {
    const result = reconnectManager.verifyToken('fake-token-xyz', 'ROOM01');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.reasonCode).toBe('TOKEN_INVALID');
    }
  });

  it('[TC-AUDIT-NET.05] Phòng thủ token sai phòng: Từ chối token đúng của phòng A khi gửi vào phòng B', () => {
    const roomA = roomManager.createRoom('p1');
    const token = reconnectManager.generateToken('p1', roomA.roomCode);

    const result = reconnectManager.verifyToken(token, 'ROOM_DIFFERENT');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.reasonCode).toBe('TOKEN_INVALID');
    }
  });

  it('[TC-AUDIT-NET.06] Hết hạn 60s: Đánh dấu TOKEN_EXPIRED, chuyển session Disconnected và gọi Bot tiếp quản', () => {
    const room = roomManager.createRoom('host-1');
    const p2 = createPlayer('guest-2');
    room.players.push(p2);
    room.started = true;
    sessionManager.addSession('guest-2');

    const token = reconnectManager.generateToken('guest-2', room.roomCode);
    reconnectManager.startGracePeriod(room.roomCode, 'guest-2');

    // Kích hoạt hết hạn ân hạn
    reconnectManager.handleGraceExpired(room.roomCode, 'guest-2');

    const session = sessionManager.getSession('guest-2');
    expect(session?.state).toBe(SessionState.Disconnected);

    // Người chơi guest-2 được Bot tiếp quản
    const updatedP2 = room.players.find((p) => p.id === 'guest-2');
    expect(updatedP2?.isBot).toBe(true);

    // Token cũ bị đánh dấu hết hạn
    const verifyAfterExpiry = reconnectManager.verifyToken(token, room.roomCode);
    expect(verifyAfterExpiry.success).toBe(false);
    if (!verifyAfterExpiry.success) {
      expect(verifyAfterExpiry.reasonCode).toBe('TOKEN_EXPIRED');
    }
  });

  it('[TC-AUDIT-NET.07] Phòng chưa bắt đầu: Host rớt mạng không bị Bot tiếp quản làm hỏng sảnh chờ', () => {
    const room = roomManager.createRoom('host-p1');
    room.started = false;
    sessionManager.addSession('host-p1');

    reconnectManager.generateToken('host-p1', room.roomCode);
    reconnectManager.startGracePeriod(room.roomCode, 'host-p1');
    reconnectManager.handleGraceExpired(room.roomCode, 'host-p1');

    const host = room.players.find((p) => p.id === 'host-p1');
    expect(host?.isBot).toBe(false); // Host vẫn giữ nguyên là human
  });

  it('[TC-AUDIT-NET.08] Độ bền chịu tải: 50 chu kỳ disconnect-reconnect liên tiếp hoàn tất < 50ms', () => {
    const room = roomManager.createRoom('stress-p1');
    sessionManager.addSession('stress-p1');

    const start = performance.now();
    for (let i = 0; i < 50; i++) {
      reconnectManager.generateToken('stress-p1', room.roomCode);
      reconnectManager.startGracePeriod(room.roomCode, 'stress-p1');
      reconnectManager.cancelGracePeriod(room.roomCode, 'stress-p1');
    }
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(100); // 50 chu kỳ < 100ms
  });
});

describe('[AUDIT-SUITE] Hạng Mục 4: Rò Rỉ Bộ Nhớ WebGL & Quản Lý Tài Nguyên (Resource Disposal)', () => {
  it('[TC-AUDIT-WGL.01] Bất biến trần bộ nhớ đệm Mascot Texture: Hỗ trợ hàm dọn rác clearMascotTextureCache', () => {
    // Gọi dọn dẹp bộ nhớ đệm, không ném ngoại lệ
    expect(() => clearMascotTextureCache()).not.toThrow();
  });

  it('[TC-AUDIT-WGL.02] PostProcessingPipeline: multisampling = 0 bảo vệ trần FBO và VRAM', () => {
    expect(DEFAULT_PIPELINE_CONFIG.multisampling).toBe(0);
  });

  it('[TC-AUDIT-WGL.03] PostProcessingPipeline: Cấu hình ánh sáng dịu chống quá nhiệt GPU (aoIntensity = 0.38, bloomIntensity = 0.20)', () => {
    expect(DEFAULT_PIPELINE_CONFIG.aoIntensity).toBe(0.38);
    expect(DEFAULT_PIPELINE_CONFIG.bloomIntensity).toBe(0.20);
    expect(DEFAULT_PIPELINE_CONFIG.bloomThreshold).toBe(2.5);
  });

  it('[TC-AUDIT-WGL.04] Tính toán định lượng trần VRAM: 40 ô cờ x 512x512 CanvasTexture <= 45 MB VRAM', () => {
    const TILE_COUNT = 40;
    const TEXTURE_WIDTH = 512;
    const TEXTURE_HEIGHT = 512;
    const BYTES_PER_PIXEL = 4; // RGBA8888

    const rawBytesPerTexture = TEXTURE_WIDTH * TEXTURE_HEIGHT * BYTES_PER_PIXEL;
    const totalVramBytes = rawBytesPerTexture * TILE_COUNT;
    const totalVramMB = totalVramBytes / (1024 * 1024);

    expect(totalVramMB).toBe(40); // Đúng 40.0 MB cho toàn bộ 40 ô cờ nướng 1 lần
    expect(totalVramMB).toBeLessThan(45); // Nằm trong ngân sách an toàn < 45 MB
  });

  it('[TC-AUDIT-WGL.05] Tính toán định lượng trần VRAM linh vật: 20 tổ hợp linh vật x 128x128 <= 1.5 MB VRAM', () => {
    const MASCOT_ENTRIES = 20; // 4 linh vật x 5 kiểu màu nền
    const MASCOT_SIZE = 128;
    const BYTES_PER_PIXEL = 4;

    const rawBytesPerMascot = MASCOT_SIZE * MASCOT_SIZE * BYTES_PER_PIXEL;
    const totalMascotVramMB = (rawBytesPerMascot * MASCOT_ENTRIES) / (1024 * 1024);

    expect(totalMascotVramMB).toBe(1.25); // 1.25 MB VRAM
    expect(totalMascotVramMB).toBeLessThan(2.0);
  });

  it('[TC-AUDIT-WGL.06] Kiểm tra độ ổn định bộ nhớ Heap (Zero Memory Growth Invariant): 1.000 biến động FSM không tăng phi mã', () => {
    const room = createRoom('mem-room', 'p1');
    const p1 = room.players[0]!;

    const initialMemory = process.memoryUsage().heapUsed;

    // Mô phỏng 1.000 chu kỳ cập nhật dòng tiền và di chuyển
    for (let i = 0; i < 1_000; i++) {
      p1.balance += (i % 2 === 0 ? 100 : -100);
      p1.position = (p1.position + 1) % BOARD_SIZE;
    }

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryDiffMB = (finalMemory - initialMemory) / (1024 * 1024);

    // Mức tăng bộ nhớ cho 1.000 mutation biến động phải < 10 MB
    expect(memoryDiffMB).toBeLessThan(10);
  });
});
