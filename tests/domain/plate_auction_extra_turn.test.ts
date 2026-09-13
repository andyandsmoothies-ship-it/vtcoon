import { describe, it, expect } from 'vitest';
import { executeChanceCard } from '../../src/domain/chance_card_handlers.js';
import { ChanceCardId } from '../../src/domain/event_card_types.js';
import { RoomManager } from '../../src/server/room_manager.js';
import { TurnPhase, createPlayer } from '../../src/domain/room.js';

describe('[TC-CHANCE-AUCTION] Thẻ Cơ Hội CC_PLATE_AUCTION (Bất biến ExtraTurns vs ConsecutiveDoubles)', () => {
  it('[Facet 1: Boundary] Rút thẻ CC_PLATE_AUCTION chỉ tăng extraTurns, tuyệt đối không tăng consecutiveDoubles', () => {
    const p1 = createPlayer('p1');
    const initialBalance = p1.balance;
    executeChanceCard(ChanceCardId.CC_PLATE_AUCTION, 'p1', [p1]);

    expect(p1.balance).toBe(initialBalance - 500);
    expect(p1.extraTurns).toBe(1);
    expect(p1.consecutiveDoubles).toBe(0);
  });

  it('[Facet 2: State Reactivity] Sau khi rút thẻ, không được phép gieo xúc xắc tiếp khi đang ở PropertyManagement', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.addBot(room.roomCode, 'bot_2');
    mgr.startGame(room.roomCode);

    const cur = room.players[0]!;
    executeChanceCard(ChanceCardId.CC_PLATE_AUCTION, 'p1', [cur]);
    room.phase = TurnPhase.PropertyManagement;

    // Không được gieo xúc xắc vì consecutiveDoubles === 0
    const rollRes = mgr.handleRollDice(room.roomCode, 'p1');
    expect(rollRes).toBeUndefined();
  });

  it('[Facet 3: State Transition] Sau khi tiêu hết 1 lượt extraTurns, lượt BẮT BUỘC chuyển sang Bot', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.addBot(room.roomCode, 'bot_2');
    mgr.startGame(room.roomCode);

    const p1 = room.players[0]!;
    executeChanceCard(ChanceCardId.CC_PLATE_AUCTION, 'p1', [p1]);
    expect(p1.extraTurns).toBe(1);

    // P1 gieo xúc xắc lượt 1 (tại ô 7 Cơ hội) rồi kết thúc lượt
    mgr.handleRollDice(room.roomCode, 'p1');
    const end1 = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_END_TURN' });
    expect(end1.success).toBe(true);

    // Lượt phụ kích hoạt: Vẫn là P1, extraTurns về 0, phase về WaitingRoll
    expect(room.currentPlayerIndex).toBe(0);
    expect(p1.extraTurns).toBe(0);
    expect(room.phase).toBe(TurnPhase.WaitingRoll);

    // P1 gieo xúc xắc lượt bổ sung (2+6)
    mgr.handleRollDice(room.roomCode, 'p1');
    const end2 = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_END_TURN' });
    expect(end2.success).toBe(true);

    // Hết lượt phụ: BẮT BUỘC chuyển sang Bot (currentPlayerIndex = 1)
    expect(room.currentPlayerIndex).toBe(1);
    expect(room.players[1]!.id).toBe('bot_2');
  });
});
