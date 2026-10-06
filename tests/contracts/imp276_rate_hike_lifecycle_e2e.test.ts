// @vitest-environment happy-dom
// [E2E CONTRACT TEST] IMP-276: End-to-End Multi-Turn Lifecycle Integration Suite
// Flow Tags: [TC-E2E.01/MSS..TC-E2E.09/MSS] & [UC-IMP276/E2E]
// Verifies 3-Round Temporal Parity: Activation -> Maintenance & GO Interest -> Natural Expiry & UI Reversion

import { describe, it, expect, beforeEach } from 'vitest';
import { MarketCardId } from '../../src/domain/event_card_types.js';
import { executeMarketCard } from '../../src/domain/market_card_handlers.js';
import { calculateUpgradeCost } from '../../src/domain/property_upgrade.js';
import { resolveTitleDeedModalState } from '../../src/client/ui/modals/title_deed_affordance.js';
import { resolveMarketCompactFormula } from '../../src/client/ui/market_event_ticker.js';
import { getCardHeroStat } from '../../src/client/ui/modals/event_card_visuals.js';
import { createRoom, createPlayer, TurnPhase } from '../../src/domain/room.js';
import { advanceRoundBoundary } from '../../src/server/turn_loop.js';
import { getMortgageInterestRate, collectMortgageInterest } from '../../src/server/mortgage_manager.js';
import { useGameStore } from '../../src/client/store/game_store.js';

describe('[IMP-276/E2E] Multi-Turn Lifecycle & Temporal Wire-to-Store Closed-Loop Parity', () => {
  beforeEach(() => {
    useGameStore.setState({
      activeModifiers: [],
      currentTurnPlayerId: 'p1',
      turnPhase: TurnPhase.PropertyManagement,
    });
  });

  // =========================================================================
  // VÒNG 1: KÍCH HOẠT (ACTIVATION & WIRE-TO-STORE)
  // =========================================================================
  it('[TC-E2E.01/MSS][UC-IMP276/E2E] Vòng 1: Rút thẻ MC_RATE_HIKE nạp modifier thời hạn 2 vòng vào Room', () => {
    const room = createRoom('host');
    room.activeModifiers = [];

    executeMarketCard(MarketCardId.MC_RATE_HIKE, room.activeModifiers);

    expect(room.activeModifiers).toHaveLength(1);
    expect(room.activeModifiers[0]?.type).toBe(MarketCardId.MC_RATE_HIKE);
    expect(room.activeModifiers[0]?.remainingRounds).toBe(2);
  });

  it('[TC-E2E.02/MSS][UC-IMP276/E2E] Vòng 1: Client Store đồng bộ modifier và Title Deed affordance phản ánh giá 1.2x (1.200M)', () => {
    const roomModifiers = [{ type: MarketCardId.MC_RATE_HIKE, affectedCells: [], remainingRounds: 2 }];
    useGameStore.setState({ activeModifiers: roomModifiers });

    const p1 = { id: 'p1', name: 'Player 1', balance: 2000, ownedProperties: [16, 18, 19] };
    const state = resolveTitleDeedModalState({
      cellIndex: 19,
      myId: 'p1',
      activeModifiers: useGameStore.getState().activeModifiers,
      currentTurnPlayerId: 'p1',
      turnPhase: 'PropertyManagement',
      myPlayer: p1,
      playersInfo: { p1 },
    });

    expect(state.upgradeCost).toBe(1200);
    expect(state.upgradeCosts).toEqual([1200, 1800, 2400]);
    expect(state.upgradeBlockedReason).toBeUndefined();
  });

  it('[TC-E2E.03/MSS][UC-IMP276/E2E] Vòng 1: Ticker và Hero Stat Box hiển thị đồng bộ công thức thắt chặt tiền tệ kép', () => {
    const formula = resolveMarketCompactFormula(MarketCardId.MC_RATE_HIKE);
    const heroStat = getCardHeroStat(MarketCardId.MC_RATE_HIKE);

    expect(formula).toBe('Xây nhà +20%, Lãi vay 10%');
    expect(heroStat.label).toBe('THẮT CHẶT TIỀN TỆ');
    expect(heroStat.value).toBe('+20% XÂY • 10% QUA GO');
  });

  // =========================================================================
  // VÒNG 2: DUY TRÌ & THU LÃI VAY KHI VƯỢT GO (MAINTENANCE & GO INTEREST)
  // =========================================================================
  it('[TC-E2E.04/MSS][UC-IMP276/E2E] Vòng 2: Người chơi có BĐS thế chấp đi qua GO bị thu lãi 10% (thay vì 5% mặc định)', () => {
    const room = createRoom('host');
    const p1 = createPlayer('p1');
    p1.balance = 2000;
    p1.mortgagedProperties = [16]; // Giá ô 16 là 1800 -> Nợ thế chấp 900
    room.players = [p1];
    room.activeModifiers = [{ type: MarketCardId.MC_RATE_HIKE, affectedCells: [], remainingRounds: 2 }];

    expect(getMortgageInterestRate(room)).toBe(0.10);
    collectMortgageInterest(room, 'p1');

    // 900 * 0.10 = 90M (gấp đôi mức 45M mặc định)
    expect(p1.balance).toBe(1910);
    expect(room.treasury).toBe(90);
  });

  it('[TC-E2E.05/MSS][UC-IMP276/E2E] Vòng 2: advanceRoundBoundary giảm remainingRounds từ 2 xuống 1, duy trì giá nâng cấp 1.2x', () => {
    const room = createRoom('host');
    room.roundCount = 1;
    room.activeModifiers = [{ type: MarketCardId.MC_RATE_HIKE, affectedCells: [], remainingRounds: 2 }];

    advanceRoundBoundary(room, () => 0.5);

    expect(room.roundCount).toBe(2);
    expect(room.activeModifiers[0]?.remainingRounds).toBe(1);
    expect(calculateUpgradeCost(19, 0, room.activeModifiers)).toBe(1200);
  });

  // =========================================================================
  // VÒNG 3: MÃN HẠN TỰ NHIÊN & HOÀN NGUYÊN (NATURAL EXPIRY & REVERSION)
  // =========================================================================
  it('[TC-E2E.06/MSS][UC-IMP276/E2E] Vòng 3: advanceRoundBoundary tiêu giảm modifier về 0 và prune sạch khỏi activeModifiers', () => {
    const room = createRoom('host');
    room.roundCount = 2;
    room.activeModifiers = [{ type: MarketCardId.MC_RATE_HIKE, affectedCells: [], remainingRounds: 1 }];

    advanceRoundBoundary(room, () => 0.5);

    expect(room.roundCount).toBe(3);
    expect(room.activeModifiers).toHaveLength(0);
  });

  it('[TC-E2E.07/MSS][UC-IMP276/E2E] Vòng 3: Client Store đồng bộ mảng rỗng, Title Deed affordance tự động hoàn nguyên về 1.000M', () => {
    // Giả lập server delta broadcast mảng rỗng []
    useGameStore.setState({ activeModifiers: [] });

    const p1 = { id: 'p1', name: 'Player 1', balance: 2000, ownedProperties: [16, 18, 19] };
    const state = resolveTitleDeedModalState({
      cellIndex: 19,
      myId: 'p1',
      activeModifiers: useGameStore.getState().activeModifiers,
      currentTurnPlayerId: 'p1',
      turnPhase: 'PropertyManagement',
      myPlayer: p1,
      playersInfo: { p1 },
    });

    expect(state.upgradeCost).toBe(1000);
    expect(state.upgradeCosts).toEqual([1000, 1500, 2000]);
  });

  it('[TC-E2E.08/MSS][UC-IMP276/E2E] Vòng 3: Lãi suất thế chấp và số tiền thu tại GO hoàn nguyên về mức 5% chuẩn', () => {
    const room = createRoom('host');
    const p1 = createPlayer('p1');
    p1.balance = 2000;
    p1.mortgagedProperties = [16]; // Nợ 900
    room.players = [p1];
    room.activeModifiers = []; // Đã mãn hạn

    expect(getMortgageInterestRate(room)).toBe(0.05);
    collectMortgageInterest(room, 'p1');

    // 900 * 0.05 = 45M
    expect(p1.balance).toBe(1955);
    expect(room.treasury).toBe(45);
  });

  it('[TC-E2E.09/MSS][UC-IMP276/E2E] Tương tác chính sách đối kháng: Kích hoạt cả hai thẻ kiểm chứng giá 960M và miễn lãi vay 0%', () => {
    const room = createRoom('host');
    const p1 = createPlayer('p1');
    p1.balance = 2000;
    p1.mortgagedProperties = [16];
    room.players = [p1];
    room.activeModifiers = [
      { type: MarketCardId.MC_CREDIT_STIMULUS, affectedCells: [], remainingRounds: 2 },
      { type: MarketCardId.MC_RATE_HIKE, affectedCells: [], remainingRounds: 2 },
    ];

    expect(calculateUpgradeCost(19, 0, room.activeModifiers)).toBe(960);
    expect(getMortgageInterestRate(room)).toBe(0);

    collectMortgageInterest(room, 'p1');
    expect(p1.balance).toBe(2000); // Miễn 100% lãi vay
  });
});
