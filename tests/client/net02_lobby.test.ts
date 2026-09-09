// [TC-NET02/MSS] Test Suite Slice NET-02: Giao Diện Sảnh Chờ (Lobby UI) & Chia Sẻ Mã QR
// Nguồn: docs/epics/networking/_epic_ledger.md § Slice NET-02
import { describe, it, expect, beforeEach } from 'vitest';
import { useLobbyStore } from '../../src/client/store/lobby_store';
import { BotPersonality } from '../../src/domain/bot/bot_engine';
import {
  generateQrSvg,
  generateQrDataUrl,
  buildRoomInviteUrl,
} from '../../src/client/ui/lobby/qr_helper';
describe('[TC-NET02.1/MSS][UC-GAME-002/MSS] Quản lý trạng thái Lobby Store (useLobbyStore)', () => {
  beforeEach(() => {
    useLobbyStore.getState().resetLobby();
  });

  it('Khởi tạo phòng hợp lệ với mã 6 ký tự, gán đúng slot Host', () => {
    const ok = useLobbyStore.getState().initLobby('ABC123', 'host_1', true, 'Đại Gia Sài Gòn');
    expect(ok).toBe(true);

    const state = useLobbyStore.getState();
    expect(state.roomCode).toBe('ABC123');
    expect(state.isHost).toBe(true);
    expect(state.isReady).toBe(true);
    expect(state.slots[0]?.isHost).toBe(true);
    expect(state.slots[0]?.isReady).toBe(true);
    expect(state.slots[0]?.playerId).toBe('host_1');
    expect(state.slots[0]?.isOccupied).toBe(true);
    expect(state.slots[1]?.isOccupied).toBe(false);
  });

  it('[UC-GAME-003/MSS] Thêm guest player vào slot tiếp theo, toggle trạng thái sẵn sàng', () => {
    useLobbyStore.getState().initLobby('XYZ789', 'host_1', true);
    const joinRes = useLobbyStore.getState().addGuestPlayer('guest_1', 'Khách VIP');
    expect(joinRes.success).toBe(true);

    let state = useLobbyStore.getState();
    expect(state.slots[1]?.isOccupied).toBe(true);
    expect(state.slots[1]?.playerId).toBe('guest_1');
    expect(state.slots[1]?.isReady).toBe(false);

    const readyRes = useLobbyStore.getState().setPlayerReady('guest_1', true);
    expect(readyRes.success).toBe(true);
    state = useLobbyStore.getState();
    expect(state.slots[1]?.isReady).toBe(true);
  });

  it('[UC-GAME-002/MSS] Cấu hình Bot AI, cập nhật và đổi vòng quanh (cycle) tính cách Bot AI', () => {
    useLobbyStore.getState().initLobby('ROOM01', 'host_1', true);
    const botRes = useLobbyStore.getState().toggleBotSlot(2, BotPersonality.Balanced);
    expect(botRes.success).toBe(true);

    let slot2 = useLobbyStore.getState().slots[2];
    expect(slot2?.isBot).toBe(true);
    expect(slot2?.isReady).toBe(true);
    expect(slot2?.botPersonality).toBe(BotPersonality.Balanced);

    // Cập nhật tính cách sang Aggressive bằng cách truyền personality mới
    const updateRes = useLobbyStore.getState().toggleBotSlot(2, BotPersonality.Aggressive);
    expect(updateRes.success).toBe(true);
    slot2 = useLobbyStore.getState().slots[2];
    expect(slot2?.botPersonality).toBe(BotPersonality.Aggressive);

    // Cycle tính cách qua cycleBotPersonality: Aggressive -> Passive
    const cycleRes = useLobbyStore.getState().cycleBotPersonality(2);
    expect(cycleRes.success).toBe(true);
    slot2 = useLobbyStore.getState().slots[2];
    expect(slot2?.botPersonality).toBe(BotPersonality.Passive);

    // Xóa bot khi gọi toggleBotSlot không tham số
    const removeRes = useLobbyStore.getState().toggleBotSlot(2);
    expect(removeRes.success).toBe(true);
    slot2 = useLobbyStore.getState().slots[2];
    expect(slot2?.isOccupied).toBe(false);
  });
});

describe('[TC-NET02.2/MSS][UC-GAME-002/A1][UC-GAME-003/A2] Quy tắc Bắt Đầu Trận Đấu & Phân quyền Host', () => {
  beforeEach(() => {
    useLobbyStore.getState().resetLobby();
  });

  it('[UC-GAME-002/A1] Chỉ Host mới có quyền bắt đầu trận đấu (Non-host bị từ chối NOT_HOST)', () => {
    useLobbyStore.getState().initLobby('ROOM02', 'guest_1', false);
    const check = useLobbyStore.getState().canStartGame();
    expect(check.canStart).toBe(false);
    expect(check.reasonCode).toBe('NOT_HOST');

    const startRes = useLobbyStore.getState().startGame();
    expect(startRes.success).toBe(false);
    expect(startRes.reasonCode).toBe('NOT_HOST');
    expect(useLobbyStore.getState().gameStarted).toBe(false);
  });

  it('[UC-GAME-003/A2] Từ chối khi chưa đủ 2 người chơi với NOT_ENOUGH_PLAYERS', () => {
    useLobbyStore.getState().initLobby('ROOM03', 'host_1', true);
    const check = useLobbyStore.getState().canStartGame();
    expect(check.canStart).toBe(false);
    expect(check.reasonCode).toBe('NOT_ENOUGH_PLAYERS');
  });

  it('Từ chối khi khách chưa sẵn sàng với PLAYERS_NOT_READY', () => {
    useLobbyStore.getState().initLobby('ROOM04', 'host_1', true);
    useLobbyStore.getState().addGuestPlayer('guest_2', 'Khách 2');
    const check = useLobbyStore.getState().canStartGame();
    expect(check.canStart).toBe(false);
    expect(check.reasonCode).toBe('PLAYERS_NOT_READY');
  });

  it('Bắt đầu thành công khi đủ 2 người và tất cả đã sẵn sàng (hoặc có Bot)', () => {
    useLobbyStore.getState().initLobby('ROOM05', 'host_1', true);
    useLobbyStore.getState().toggleBotSlot(1, BotPersonality.Balanced);

    const check = useLobbyStore.getState().canStartGame();
    expect(check.canStart).toBe(true);

    const startRes = useLobbyStore.getState().startGame();
    expect(startRes.success).toBe(true);
    expect(useLobbyStore.getState().gameStarted).toBe(true);

    // Không cho phép start lại khi trận đấu đã bắt đầu
    const secondStart = useLobbyStore.getState().canStartGame();
    expect(secondStart.canStart).toBe(false);
    expect(secondStart.reasonCode).toBe('ROOM_STARTED');
  });
});

describe('[TC-NET02.3/MSS] Sinh Mã QR & Liên Kết Mời Hợp Lệ', () => {
  it('buildRoomInviteUrl sinh đúng URL phòng viết hoa', () => {
    const url = buildRoomInviteUrl('abc123', 'https://vtcoon.game');
    expect(url).toBe('https://vtcoon.game/?room=ABC123');
  });

  it('generateQrSvg sinh chuỗi SVG hợp lệ chứa thẻ svg', async () => {
    const svg = await generateQrSvg('https://vtcoon.game/?room=VN8888');
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg.length).toBeGreaterThan(100);
  });

  it('generateQrDataUrl sinh chuỗi data URI chuẩn dạng SVG', async () => {
    const dataUrl = await generateQrDataUrl('https://vtcoon.game/?room=ROOM99');
    expect(dataUrl.startsWith('data:image/svg+xml;utf8,')).toBe(true);
    expect(decodeURIComponent(dataUrl)).toContain('<svg');
  });
});

describe('[TC-NET02.4-inv/Adversarial] Kiểm thử nghịch đảo phòng thủ lỗi', () => {
  beforeEach(() => {
    useLobbyStore.getState().resetLobby();
  });

  it('Từ chối thêm Bot vào slot 0 của Host hoặc slot đã có người thật -> SLOT_CONFLICT', () => {
    useLobbyStore.getState().initLobby('SAFE01', 'host_1', true);
    const botSlot0 = useLobbyStore.getState().toggleBotSlot(0);
    expect(botSlot0.success).toBe(false);
    expect(botSlot0.reasonCode).toBe('INVALID_SLOT');

    useLobbyStore.getState().addGuestPlayer('p2', 'Người Thật');
    const botSlot1 = useLobbyStore.getState().toggleBotSlot(1);
    expect(botSlot1.success).toBe(false);
    expect(botSlot1.reasonCode).toBe('SLOT_CONFLICT');
  });

  it('Từ chối thêm người chơi khi trùng playerId hoặc phòng đã đủ 4 người', () => {
    useLobbyStore.getState().initLobby('FULL01', 'host_1', true);
    const addP2 = useLobbyStore.getState().addGuestPlayer('p2', 'P2');
    expect(addP2.success).toBe(true);

    // Trùng playerId
    const dup = useLobbyStore.getState().addGuestPlayer('p2', 'P2 Duplicate');
    expect(dup.success).toBe(false);
    expect(dup.reasonCode).toBe('PLAYER_ALREADY_IN_ROOM');

    useLobbyStore.getState().addGuestPlayer('p3', 'P3');
    useLobbyStore.getState().addGuestPlayer('p4', 'P4');

    const extra = useLobbyStore.getState().addGuestPlayer('p5', 'P5');
    expect(extra.success).toBe(false);
    expect(extra.reasonCode).toBe('ROOM_FULL');
  });

  it('Bảo vệ Host không bị xóa bởi removePlayer và bảo vệ readiness của Host/Bot', () => {
    useLobbyStore.getState().initLobby('PROT01', 'host_1', true);
    useLobbyStore.getState().toggleBotSlot(1, BotPersonality.Balanced);

    // Không được xóa Host
    const removeHost = useLobbyStore.getState().removePlayer('host_1');
    expect(removeHost.success).toBe(false);
    expect(removeHost.reasonCode).toBe('CANNOT_REMOVE_HOST');

    // Không được sửa readiness của Host
    const unreadyHost = useLobbyStore.getState().setPlayerReady('host_1', false);
    expect(unreadyHost.success).toBe(false);
    expect(unreadyHost.reasonCode).toBe('NOT_HOST');

    // Không được sửa readiness của Bot
    const unreadyBot = useLobbyStore.getState().setPlayerReady('bot_2', false);
    expect(unreadyBot.success).toBe(false);
    expect(unreadyBot.reasonCode).toBe('SLOT_CONFLICT');
  });

  it('Từ chối mã phòng hoặc playerId sai quy cách', () => {
    expect(useLobbyStore.getState().initLobby('ABC', 'h1', true)).toBe(false);
    expect(useLobbyStore.getState().errorReason).toBe('INVALID_ROOM_CODE');

    expect(useLobbyStore.getState().initLobby('ROOM01', '   ', true)).toBe(false);
    expect(useLobbyStore.getState().errorReason).toBe('INVALID_PLAYER_ID');

    expect(() => buildRoomInviteUrl('INVALID')).toThrow();
  });

  it('generateQrSvg ném lỗi khi nội dung rỗng', async () => {
    await expect(generateQrSvg('')).rejects.toThrow();
    await expect(generateQrSvg('   ')).rejects.toThrow();
  });
});
