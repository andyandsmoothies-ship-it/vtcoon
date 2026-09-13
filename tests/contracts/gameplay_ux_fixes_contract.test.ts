import { describe, it, expect } from 'vitest';
import { RoomManager } from '../../src/server/room_manager.js';
import { TurnPhase } from '../../src/domain/room.js';
import { CellType } from '../../src/domain/board_config.js';
import { handleSpecialCell } from '../../src/server/special_cell_handler.js';
import { buildDeltaFromRoom } from '../../src/server/session_manager.js';

describe('[CONTRACT-TEST] Gameplay UX & State Integrity Fixes', () => {
  // ---------------------------------------------------------------------------
  // 1. SỰ KIỆN THẺ: Server phải ghi nhận lastEventCard khi rút thẻ Cơ Hội / Thị Trường
  // ---------------------------------------------------------------------------
  it('[Contract 1: Event Card Sync] Rút thẻ Cơ Hội phải ghi nhận lastEventCard vào Room và truyền vào DeltaPayload', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.addBot(room.roomCode, 'bot_2');
    mgr.startGame(room.roomCode);

    const cur = room.players[0]!;
    const reg = mgr.getRegistry(room.roomCode)!;
    const sm = mgr.getPropertyStates(room.roomCode)!;

    // Giả lập dẫm ô Cơ hội
    const handled = handleSpecialCell(room, cur, CellType.Chance, reg, sm, () => 0.1);
    expect(handled).toBe(true);

    // Hợp đồng mới: room phải có lastEventCard với đầy đủ thông tin thực tế
    expect((room as any).lastEventCard).toBeDefined();
    expect((room as any).lastEventCard.cardType).toBe('chance');
    expect((room as any).lastEventCard.cardId).toBeDefined();
    expect((room as any).lastEventCard.title).toBeDefined();
    expect((room as any).lastEventCard.description).toBeDefined();

    // DeltaPayload phải mang trường lastEventCard
    const delta = buildDeltaFromRoom(room, reg, sm, 1);
    expect((delta as any).lastEventCard).toBeDefined();
    expect((delta as any).lastEventCard.cardId).toBe((room as any).lastEventCard.cardId);
  });

  // ---------------------------------------------------------------------------
  // 2. ĐẤU GIÁ: Khi Bot từ chối mua, declinedPlayerId là Bot, người chơi local là P1
  // ---------------------------------------------------------------------------
  it('[Contract 2: Auction Identity] Khi Bot từ chối mua ô đất, declinedPlayerId là Bot và P1 không bị cấm tham gia', () => {
    const mgr = new RoomManager(100);
    const room = mgr.createRoom('p1');
    mgr.addBot(room.roomCode, 'bot_2');
    mgr.startGame(room.roomCode);

    // Cho lượt chuyển sang Bot
    room.currentPlayerIndex = 1;
    const bot = room.players[1]!;
    bot.position = 24; // Ninh Bình
    room.phase = TurnPhase.ActionPhase;

    // Bot từ chối mua ô đất
    mgr.handleDecline(room.roomCode, 'bot_2');

    expect(room.phase).toBe(TurnPhase.AuctionPhase);
    const session = mgr.getAuctionSession(room.roomCode);
    expect(session).toBeDefined();
    expect(session?.declinedPlayerId).toBe('bot_2');

    // Kiểm tra tính hợp lệ: P1 không phải là người từ chối mua
    const localPlayerId = 'p1';
    const isLocalDeclined = session?.declinedPlayerId === localPlayerId;
    expect(isLocalDeclined, 'P1 phải được phép tham gia đấu giá, không bị nhận nhầm là Bot').toBe(false);
  });

  // ---------------------------------------------------------------------------
  // 3. THỜI GIAN ĐỒNG BỘ: scheduleTurnTimeout đặt deadline mới cho từng pha
  // ---------------------------------------------------------------------------
  it('[Contract 3: Time Remaining Sync] Delta timeRemaining phản ánh đúng deadline của pha hiện tại', () => {
    const mgr = new RoomManager(200);
    const room = mgr.createRoom('p1');
    mgr.startGame(room.roomCode);

    const reg = mgr.getRegistry(room.roomCode)!;
    const sm = mgr.getPropertyStates(room.roomCode)!;

    // Đặt pha PropertyManagement với timeRemaining = 20s
    const delta = buildDeltaFromRoom(room, reg, sm, 1, undefined, 20);
    expect(delta.timeRemaining).toBe(20);
    expect(delta.turnPhase).toBe(room.phase);
  });
});
