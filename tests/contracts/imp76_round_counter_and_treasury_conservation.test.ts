// [UC-GAME-009/MSS][UC-GAME-038/MSS][UC-GAME-041/MSS] Contract Tests for IMP-76
// Round Counter Network Synchronization, Treasury Conservation & Market Infrastructure Clarity
import { describe, it, expect, beforeEach } from 'vitest';
import { TurnPhase, MAX_ROUNDS, type Room, type Player, type MarketModifier } from '../../src/domain/room.js';
import { isRoomGameOver } from '../../src/domain/room.js';
import { buildDeltaFromRoom, type DeltaPayload } from '../../src/server/session_manager.js';
import { applyDeltaToStore } from '../../src/client/network/apply_delta.js';
import { useGameStore } from '../../src/client/store/game_store.js';
import { MarketCardId, INFRA_CELLS } from '../../src/domain/event_card_types.js';
import { decayModifiers } from '../../src/domain/event_card_engine.js';
import { resolveRent } from '../../src/domain/property_rent.js';
import { BOARD_CONFIG } from '../../src/domain/board_config.js';
import type { PropertyRegistry, PropertyStateMap } from '../../src/domain/property_data.js';
import { handlePublicInvest } from '../../src/domain/market_card_handlers.js';
import { buildSparseDelta } from '../../src/server/network/delta_broadcaster.js';

function createMockPlayer(id: string, balance: number = 15_000): Player {
  return {
    id,
    position: 0,
    balance,
    skipNextTurn: false,
    auditTurnsLeft: 0,
    consecutiveDoubles: 0,
    hand: [],
    pendingDebts: [],
    extraTurns: 0,
    doubleNextDice: false,
    mortgagedProperties: [],
    bankrupt: false,
    isBot: false,
  };
}

function createMockRoom(overrides?: Partial<Room>): Room {
  const p1 = createMockPlayer('p1');
  const p2 = createMockPlayer('p2');
  return {
    roomCode: 'IMP76_TEST',
    hostId: 'p1',
    players: [p1, p2],
    currentPlayerIndex: 0,
    phase: TurnPhase.WaitingRoll,
    started: true,
    roundCount: 1,
    round: 1,
    treasury: 10_000,
    activeModifiers: [],
    marketDeck: [],
    marketDiscard: [],
    chanceDeck: [],
    chanceDiscard: [],
    permanentRentBonus: {},
    diceSeq: 1,
    ...overrides,
  };
}

describe('[IMP-76] Round Counter & Treasury Conservation Contract Tests', () => {
  beforeEach(() => {
    const store = useGameStore.getState();
    store.setRoundInfo(1, 30);
    store.setTreasuryPool(2000);
    store.setActiveModifiers([]);
  });

  // =========================================================================
  // FACET 1: Boundary & Range Facet
  // =========================================================================
  describe('[TC-76-FACET-1] Boundary & Range Facet', () => {
    it('[TC-76.01/MSS][UC-GAME-009] buildDeltaFromRoom xuat roundNumber khoi dau la 1 khi roundCount chua dinh nghia', () => {
      const room = createMockRoom({ roundCount: undefined, round: undefined });
      const delta = buildDeltaFromRoom(room, new Map(), new Map(), 1);
      expect(delta.roundNumber).toBe(1);
    });

    it('[TC-76.01b/MSS][UC-GAME-009] buildDeltaFromRoom xuat roundNumber la 1 khi room.roundCount = 1', () => {
      const room = createMockRoom({ roundCount: 1, round: 1 });
      const delta = buildDeltaFromRoom(room, new Map(), new Map(), 1);
      expect(delta.roundNumber).toBe(1);
    });

    it('[TC-76.02/MSS][UC-GAME-009] buildDeltaFromRoom xuat roundNumber dung bang room.roundCount khi van dau o vong 15', () => {
      const room = createMockRoom({ roundCount: 15, round: 15 });
      const delta = buildDeltaFromRoom(room, new Map(), new Map(), 15);
      expect(delta.roundNumber).toBe(15);
    });

    it('[TC-76.03/MSS][UC-GAME-009] buildDeltaFromRoom xuat roundNumber 30 khi o vong toi da', () => {
      const room = createMockRoom({ roundCount: 30, round: 30 });
      const delta = buildDeltaFromRoom(room, new Map(), new Map(), 30);
      expect(delta.roundNumber).toBe(30);
    });

    it('[TC-76.04/MSS][UC-GAME-041] isRoomGameOver tra ve true khi roundCount > MAX_ROUNDS (vong 41)', () => {
      const room = createMockRoom({ roundCount: 41, round: 41 });
      expect(isRoomGameOver(room)).toBe(true);
    });

    it('[TC-76.05/MSS][UC-GAME-041] Quy Kho Bac room.treasury khong bao gio am (ve 0) khi giai ngan vuot qua so du', () => {
      const p1 = createMockPlayer('p1', 10_000);
      const p2 = createMockPlayer('p2', 10_000);
      const room = createMockRoom({ treasury: 1_500, players: [p1, p2] });
      const registry: PropertyRegistry = new Map([
        [5, 'p1'],
        [15, 'p1'],
        [25, 'p2'],
        [35, 'p2'],
      ]);
      handlePublicInvest(room.players, registry, room);
      expect(room.treasury).toBe(0);
    });
  });

  // =========================================================================
  // FACET 2: State Reactivity Facet
  // =========================================================================
  describe('[TC-76-FACET-2] State Reactivity Facet', () => {
    it('[TC-76.06/MSS][UC-GAME-009] applyDeltaToStore cap nhat state.roundNumber tu 1 len 2 khi nhan delta.roundNumber = 2', () => {
      applyDeltaToStore({ tick: 2, cells: [], roundNumber: 2 });
      expect(useGameStore.getState().roundNumber).toBe(2);
    });

    it('[TC-76.07/MSS][UC-GAME-009] buildSparseDelta bao toan roundNumber va applyDeltaToStore cap nhat roundNumber len 15', () => {
      const prevDelta: DeltaPayload = { tick: 14, cells: [], roundNumber: 14 };
      const nextDelta: DeltaPayload = { tick: 15, cells: [], roundNumber: 15 };
      const sparse = buildSparseDelta(prevDelta, nextDelta);
      expect(sparse.roundNumber).toBe(15);
      applyDeltaToStore(sparse);
      expect(useGameStore.getState().roundNumber).toBe(15);
    });

    it('[TC-76.08/MSS][UC-GAME-041] applyDeltaToStore cap nhat state.treasuryPool tu 2000 len 3500 khi nhan delta.treasury = 3500', () => {
      useGameStore.getState().setTreasuryPool(2000);
      applyDeltaToStore({ tick: 3, cells: [], treasury: 3500 });
      expect(useGameStore.getState().treasuryPool).toBe(3500);
    });

    it('[TC-76.09/MSS][UC-GAME-038] applyDeltaToStore cap nhat state.activeModifiers trong useGameStore khi nhan danh sach modifiers tu delta', () => {
      const activeMods: MarketModifier[] = [
        {
          type: MarketCardId.MC_FUEL_SURGE,
          affectedCells: [...INFRA_CELLS],
          remainingRounds: 1,
        },
      ];
      applyDeltaToStore({ tick: 4, cells: [], activeModifiers: activeMods });
      const currentMods = useGameStore.getState().activeModifiers;
      expect(currentMods).toHaveLength(1);
      expect(currentMods[0]?.type).toBe(MarketCardId.MC_FUEL_SURGE);
    });

    it('[TC-76.10/MSS][UC-GAME-009] applyDeltaToStore giu nguyen state.roundNumber hien tai neu delta gui xuong khong chua truong roundNumber', () => {
      useGameStore.getState().setRoundInfo(7, 30);
      applyDeltaToStore({ tick: 5, cells: [] });
      expect(useGameStore.getState().roundNumber).toBe(7);
    });
  });

  // =========================================================================
  // FACET 3: Resource & Treasury Conservation Facet
  // =========================================================================
  describe('[TC-76-FACET-3] Resource & Treasury Conservation Facet', () => {
    it('[TC-76.11/MSS][UC-GAME-038] handlePublicInvest tang so du nguoi choi so huu 1 o ha tang len 1.400 Tr. (400 kích cầu + 1.000 hạ tầng)', () => {
      const p1 = createMockPlayer('p1', 15_000);
      const room = createMockRoom({ treasury: 10_000, players: [p1] });
      const registry: PropertyRegistry = new Map([[5, 'p1']]); // 1 infra (Long Thành)

      expect(handlePublicInvest).toBeDefined();
      handlePublicInvest!(room.players, registry, room);
      expect(p1.balance).toBe(16_400);
    });

    it('[TC-76.12/MSS][UC-GAME-038] handlePublicInvest tang so du nguoi choi so huu 3 o ha tang len 3.400 Tr.', () => {
      const p1 = createMockPlayer('p1', 15_000);
      const room = createMockRoom({ treasury: 10_000, players: [p1] });
      const registry: PropertyRegistry = new Map([
        [5, 'p1'],
        [15, 'p1'],
        [25, 'p1'],
      ]); // 3 infra

      expect(handlePublicInvest).toBeDefined();
      handlePublicInvest!(room.players, registry, room);
      expect(p1.balance).toBe(18_400);
    });

    it('[TC-76.13/MSS][UC-GAME-041] handlePublicInvest khau tru dung tong so tien giai ngan tu room.treasury', () => {
      const p1 = createMockPlayer('p1', 10_000);
      const p2 = createMockPlayer('p2', 12_000);
      const room = createMockRoom({ treasury: 10_000, players: [p1, p2] });
      const registry: PropertyRegistry = new Map([
        [5, 'p1'],  // 1.000 Tr. cho p1
        [15, 'p1'], // 1.000 Tr. cho p1
        [25, 'p2'], // 1.000 Tr. cho p2
      ]); // Tổng giải ngân = 2 người * 400 + 3.000 Tr. = 3.800 Tr.

      expect(handlePublicInvest).toBeDefined();
      handlePublicInvest!(room.players, registry, room);
      expect(room.treasury).toBe(6_200);
    });

    it('[TC-76.14/MSS][UC-GAME-041] Tong tien te (Nguoi choi + Kho Bac) bao toan nguyen ven 100% truoc va sau khi giai ngan MC_PUBLIC_INVEST', () => {
      const p1 = createMockPlayer('p1', 10_000);
      const p2 = createMockPlayer('p2', 8_000);
      const room = createMockRoom({ treasury: 5_000, players: [p1, p2] });
      const registry: PropertyRegistry = new Map([
        [5, 'p1'],
        [15, 'p2'],
        [25, 'p2'],
      ]); // p1 +1.000, p2 +2.000, treasury -3.000

      const totalMoneyBefore = p1.balance + p2.balance + room.treasury;
      expect(handlePublicInvest).toBeDefined();
      handlePublicInvest!(room.players, registry, room);
      const totalMoneyAfter = p1.balance + p2.balance + room.treasury;

      expect(totalMoneyAfter).toBe(totalMoneyBefore);
      expect(totalMoneyAfter).toBe(23_000);
    });

    it('[TC-76.20/MSS][UC-GAME-038] handlePublicInvest chi giai ngan goi kich cau 400 Tr. cho nguoi khong co ha tang', () => {
      const p1 = createMockPlayer('p1', 10_000);
      const room = createMockRoom({ treasury: 5_000, players: [p1] });
      const registry: PropertyRegistry = new Map([[1, 'p1']]); // ô 1 là BĐS thông thường, không phải hạ tầng

      expect(handlePublicInvest).toBeDefined();
      handlePublicInvest!(room.players, registry, room);
      expect(p1.balance).toBe(10_400); // 400 Tr. kích cầu
      expect(room.treasury).toBe(4_600);
    });
  });

  // =========================================================================
  // FACET 4: Error Defense & Modifier Facet
  // =========================================================================
  describe('[TC-76-FACET-4] Error Defense & Modifier Facet', () => {
    it('[TC-76.15/MSS][UC-GAME-038] resolveRent cua o ha tang cong them 500 Tr. khi MC_FUEL_SURGE active', () => {
      const registry: PropertyRegistry = new Map([[5, 'p1']]);
      const activeMods: MarketModifier[] = [
        {
          type: MarketCardId.MC_FUEL_SURGE,
          affectedCells: [...INFRA_CELLS],
          remainingRounds: 1,
        },
      ];
      const rent = resolveRent(BOARD_CONFIG[5], 5, 'p1', registry, new Map(), undefined, activeMods);
      expect(rent).toBe(1000);
    });

    it('[TC-76.16/MSS][UC-GAME-038] decayModifiers giam remainingRounds va loai bo MC_FUEL_SURGE sau 1 vong', () => {
      const activeMods: MarketModifier[] = [
        {
          type: MarketCardId.MC_FUEL_SURGE,
          affectedCells: [...INFRA_CELLS],
          remainingRounds: 1,
        },
      ];
      expect(decayModifiers(activeMods)).toHaveLength(0);
    });

    it('[TC-76.17/MSS][UC-GAME-038] resolveRent cua o ha tang tro lai bieu phi goc sau khi modifier da decay', () => {
      const registry: PropertyRegistry = new Map([[5, 'p1']]);
      const activeMods: MarketModifier[] = [
        {
          type: MarketCardId.MC_FUEL_SURGE,
          affectedCells: [...INFRA_CELLS],
          remainingRounds: 1,
        },
      ];
      const decayedMods = decayModifiers(activeMods);
      const rent = resolveRent(BOARD_CONFIG[5], 5, 'p1', registry, new Map(), undefined, decayedMods);
      expect(rent).toBe(500);
    });

    it('[TC-76.18/MSS][UC-GAME-041] buildDeltaFromRoom dong bo treasury tu room.treasury sang delta.treasury', () => {
      const room = createMockRoom({ treasury: 8_500 });
      const delta = buildDeltaFromRoom(room, new Map(), new Map(), 1);
      expect(delta.treasury).toBe(8_500);
    });

    it('[TC-76.19/MSS][UC-GAME-038] buildDeltaFromRoom dong bo activeModifiers tu room sang delta', () => {
      const activeMods: MarketModifier[] = [
        {
          type: MarketCardId.MC_FUEL_SURGE,
          affectedCells: [...INFRA_CELLS],
          remainingRounds: 1,
        },
      ];
      const room = createMockRoom({ activeModifiers: activeMods });
      const delta = buildDeltaFromRoom(room, new Map(), new Map(), 1);
      expect(delta.activeModifiers).toHaveLength(1);
      expect(delta.activeModifiers?.[0]?.type).toBe(MarketCardId.MC_FUEL_SURGE);
    });

    it('[TC-76.21/MSS][UC-GAME-009] buildSparseDelta bao toan treasury va activeModifiers', () => {
      const activeMods: MarketModifier[] = [
        {
          type: MarketCardId.MC_FUEL_SURGE,
          affectedCells: [...INFRA_CELLS],
          remainingRounds: 1,
        },
      ];
      const prevDelta: DeltaPayload = { tick: 1, cells: [] };
      const nextDelta: DeltaPayload = { tick: 2, cells: [], treasury: 7000, activeModifiers: activeMods };
      const sparse = buildSparseDelta(prevDelta, nextDelta);
      expect(sparse.treasury).toBe(7000);
      expect(sparse.activeModifiers).toHaveLength(1);
    });
  });
});
