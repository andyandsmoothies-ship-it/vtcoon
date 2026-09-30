// [CONTRACT TEST] IMP-207: Freeze Trade State Transition & UI Affordance Defenses
// Traceability Tags: [TC-207.01..16/MSS] & [UC-IMP207]
// Universal 5-Facet Behavioral Matrix & Detroit Classical Contract Suite

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { useGameStore } from '../../src/client/store/game_store.js';
import { useLobbyStore } from '../../src/client/store/lobby_store.js';
import { applyDelta } from '../../src/client/network/apply_delta.js';
import { ActionDock } from '../../src/client/ui/action_dock.js';
import { TitleDeedActionFooter } from '../../src/client/ui/modals/title_deed_action_footer.js';
import { PurchaseDecisionCard } from '../../src/client/ui/modals/purchase_decision_card.js';
import { resolveTitleDeedModalState } from '../../src/client/ui/modals/title_deed_affordance.js';
import { executeTurnRoll } from '../../src/server/turn_loop.js';
import { handleDecline, type AuctionSession } from '../../src/server/auction_manager.js';
import { TurnPhase, type Player, type Room } from '../../src/domain/room.js';
import { MarketCardId } from '../../src/domain/event_card_types.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';
import type { PropertyRegistry, PropertyStateMap } from '../../src/domain/property_manager.js';

function createPlayer(id: string, overrides: Partial<Player> = {}): Player {
  return {
    id,
    name: `Player ${id}`,
    position: 0,
    balance: 10000,
    hand: [],
    consecutiveDoubles: 0,
    inAudit: false,
    auditTurnsLeft: 0,
    doubleNextDice: false,
    skipNextTurn: false,
    pendingDebts: [],
    extraTurns: 0,
    mortgagedProperties: [],
    bankrupt: false,
    ...overrides,
  };
}

function createRoom(roomCode = 'ROOM_207', overrides: Partial<Room> = {}): Room {
  return {
    roomCode,
    hostId: 'p1',
    players: [],
    currentPlayerIndex: 0,
    phase: TurnPhase.WaitingRoll,
    started: true,
    roundCount: 1,
    activeModifiers: [],
    marketDeck: [],
    marketDiscard: [],
    chanceDeck: [],
    chanceDiscard: [],
    permanentRentBonus: {},
    treasury: 0,
    ...overrides,
  };
}

describe('[TC-207/MSS][UC-IMP207] Freeze Trade FSM Transition & UI Affordance Contract Suite', () => {
  beforeEach(() => {
    useGameStore.getState().resetGameState();
    useLobbyStore.setState({
      myPlayerId: 'p1',
      roomCode: 'ROOM_207',
      isHost: false,
      isReady: true,
      gameStarted: true,
    });
  });

  // =========================================================================
  // FACET 1: Server FSM & Turn Loop Invariant (TC-207.01 - 04)
  // =========================================================================
  describe('Facet 1: Server FSM & Turn Loop Invariant', () => {
    it('[TC-207.01/MSS][UC-IMP207] Khi MC_FREEZE_TRADE kích hoạt và người chơi hạ cánh ô BĐS chưa ai mua, handleTurnLoop chuyển phòng trực tiếp sang TurnPhase.PropertyManagement', () => {
      const room = createRoom('ROOM_207_01', {
        activeModifiers: [{ type: MarketCardId.MC_FREEZE_TRADE, affectedCells: [], remainingRounds: 2 }],
      });
      const player = createPlayer('p1', { position: 30, balance: 10000 });
      room.players = [player];
      room.currentPlayerIndex = 0;

      const reg: PropertyRegistry = new Map();
      const sm: PropertyStateMap = new Map();
      const rolledThisTurn = new Map<string, boolean>();

      // Dice roll = 2 + 3 = 5 (landing at cell 35: Cảng HKQT Nội Bài)
      let step = 0;
      const mockRng = () => {
        step++;
        return step === 1 ? 0.25 : 0.4;
      };

      executeTurnRoll(room, player, reg, sm, mockRng, () => 0.5, rolledThisTurn, room.roomCode);

      expect(player.position).toBe(35);
      expect(room.phase).toBe(TurnPhase.PropertyManagement);
    });

    it('[TC-207.02/MSS][UC-IMP207] Khi không có MC_FREEZE_TRADE, hạ cánh ô BĐS chưa ai mua chuyển phòng sang TurnPhase.ActionPhase', () => {
      const room = createRoom('ROOM_207_02', {
        activeModifiers: [],
      });
      const player = createPlayer('p1', { position: 30, balance: 10000 });
      room.players = [player];
      room.currentPlayerIndex = 0;

      const reg: PropertyRegistry = new Map();
      const sm: PropertyStateMap = new Map();
      const rolledThisTurn = new Map<string, boolean>();

      let step = 0;
      const mockRng = () => {
        step++;
        return step === 1 ? 0.25 : 0.4;
      };

      executeTurnRoll(room, player, reg, sm, mockRng, () => 0.5, rolledThisTurn, room.roomCode);

      expect(player.position).toBe(35);
      expect(room.phase).toBe(TurnPhase.ActionPhase);
    });

    it('[TC-207.03/MSS][UC-IMP207] Khi MC_FREEZE_TRADE kích hoạt, handleDecline chuyển phòng sang TurnPhase.PropertyManagement và không tạo session đấu giá trong auctions', () => {
      const room = createRoom('ROOM_207_03', {
        phase: TurnPhase.ActionPhase,
        activeModifiers: [{ type: MarketCardId.MC_FREEZE_TRADE, affectedCells: [], remainingRounds: 2 }],
      });
      const player = createPlayer('p1', { position: 35 });
      room.players = [player];
      const auctions = new Map<string, AuctionSession>();

      const res = handleDecline(room, player, auctions, room.roomCode);

      expect(res.success).toBe(true);
      expect(room.phase).toBe(TurnPhase.PropertyManagement);
      expect(auctions.has(room.roomCode)).toBe(false);
    });

    it('[TC-207.04/MSS][UC-IMP207] Khi không có MC_FREEZE_TRADE, handleDecline tạo session đấu giá và chuyển sang TurnPhase.AuctionPhase', () => {
      const room = createRoom('ROOM_207_04', {
        phase: TurnPhase.ActionPhase,
        activeModifiers: [],
      });
      const player = createPlayer('p1', { position: 35 });
      const opponent = createPlayer('p2', { position: 0 });
      room.players = [player, opponent];
      const auctions = new Map<string, AuctionSession>();

      const res = handleDecline(room, player, auctions, room.roomCode);

      expect(res.success).toBe(true);
      expect(room.phase).toBe(TurnPhase.AuctionPhase);
      expect(auctions.has(room.roomCode)).toBe(true);
    });
  });

  // =========================================================================
  // FACET 2: Client Delta Synchronization & Anti-Deadlock (TC-207.05 - 10)
  // =========================================================================
  describe('Facet 2: Client Delta Synchronization & Anti-Deadlock', () => {
    it('[TC-207.05/MSS][UC-IMP207] applyDelta khi nhận turnPhase: ActionPhase cho người chơi hiện tại cập nhật hasRolledThisTurn: true', () => {
      useGameStore.setState({
        currentTurnPlayerId: 'p1',
        hasRolledThisTurn: false,
      });

      const delta: DeltaPayload = {
        tick: 2,
        cells: [],
        currentTurnPlayerId: 'p1',
        turnPhase: TurnPhase.ActionPhase,
        diceRollerId: 'p1',
        dice: [2, 3],
      };

      applyDelta(delta);

      expect(useGameStore.getState().hasRolledThisTurn).toBe(true);
    });

    it('[TC-207.06/MSS][UC-IMP207] applyDelta khi nhận turnPhase: PropertyManagement cho người chơi hiện tại kèm bằng chứng xúc xắc cập nhật hasRolledThisTurn: true', () => {
      useGameStore.setState({
        currentTurnPlayerId: 'p1',
        hasRolledThisTurn: false,
      });

      const delta: DeltaPayload = {
        tick: 3,
        cells: [],
        currentTurnPlayerId: 'p1',
        turnPhase: TurnPhase.PropertyManagement,
        diceRollerId: 'p1',
        dice: [1, 4],
      };

      applyDelta(delta);

      expect(useGameStore.getState().hasRolledThisTurn).toBe(true);
    });

    it('[TC-207.07/MSS][UC-IMP207] applyDelta khi nhận turnPhase: WaitingRoll reset hasRolledThisTurn: false', () => {
      useGameStore.setState({
        currentTurnPlayerId: 'p1',
        hasRolledThisTurn: true,
        turnPhase: TurnPhase.PropertyManagement,
      });

      const delta: DeltaPayload = {
        tick: 4,
        cells: [],
        currentTurnPlayerId: 'p1',
        turnPhase: TurnPhase.WaitingRoll,
      };

      applyDelta(delta);

      expect(useGameStore.getState().hasRolledThisTurn).toBe(false);
    });

    it('[TC-207.08/MSS][UC-IMP207] Khi isTradeFrozen = true, ActionDock đặt isStandingOnBuyable = false dù người chơi đang đứng trên ô BĐS chưa ai mua', () => {
      useGameStore.setState({
        currentTurnPlayerId: 'p1',
        playerPositions: { p1: 35 },
        playersInfo: {
          p1: { id: 'p1', name: 'Alice', balance: 10000, position: 35, ownedProperties: [] } as any,
        },
        turnPhase: TurnPhase.ActionPhase,
        hasRolledThisTurn: true,
        activeModifiers: [{ type: MarketCardId.MC_FREEZE_TRADE, affectedCells: [], remainingRounds: 2 }],
      });

      const html = renderToStaticMarkup(
        React.createElement(ActionDock, {
          localPlayerId: 'p1',
          isMyTurn: true,
          hasRolledThisTurn: true,
          isTradeFrozen: true,
        })
      );

      expect(html).not.toContain('aria-label="Thị trường đóng băng (#35)"');
      expect(html).not.toContain('Mua ô đất số 35');
    });

    it('[TC-207.09/MSS][UC-IMP207] Khi isTradeFrozen = true và người chơi đổ ra đôi, ActionDock hiển thị nút chính là [🎲 Đổ Tiếp (Đôi)] thay vì [🔒 Đóng Băng]', () => {
      useGameStore.setState({
        currentTurnPlayerId: 'p1',
        playerPositions: { p1: 35 },
        playersInfo: {
          p1: { id: 'p1', name: 'Alice', balance: 10000, position: 35, ownedProperties: [], consecutiveDoubles: 1 } as any,
        },
        turnPhase: TurnPhase.ActionPhase,
        hasRolledThisTurn: true,
        dice: [3, 3],
        activeModifiers: [{ type: MarketCardId.MC_FREEZE_TRADE, affectedCells: [], remainingRounds: 2 }],
      });

      const html = renderToStaticMarkup(
        React.createElement(ActionDock, {
          localPlayerId: 'p1',
          isMyTurn: true,
          hasRolledThisTurn: true,
          canRollAgain: true,
          isTradeFrozen: true,
        })
      );

      expect(html).toContain('Đổ Tiếp (Đôi)');
      expect(html).not.toContain('Đóng Băng');
    });

    it('[TC-207.10/MSS][UC-IMP207] Khi isTradeFrozen = true và người chơi đã đổ không đôi, nút [⏭️ Kết Thúc Lượt] ở trạng thái active (bấm được, không bị disabled)', () => {
      useGameStore.setState({
        currentTurnPlayerId: 'p1',
        turnPhase: TurnPhase.WaitingRoll,
        hasRolledThisTurn: false,
        playersInfo: {
          p1: { id: 'p1', name: 'Alice', balance: 10000, position: 35, ownedProperties: [] } as any,
        },
      });

      applyDelta({
        tick: 10,
        cells: [],
        currentTurnPlayerId: 'p1',
        turnPhase: TurnPhase.PropertyManagement,
        diceRollerId: 'p1',
        dice: [2, 5],
        activeModifiers: [{ type: MarketCardId.MC_FREEZE_TRADE, affectedCells: [], remainingRounds: 2 }],
      });

      const html = renderToStaticMarkup(
        React.createElement(ActionDock, {
          localPlayerId: 'p1',
          isMyTurn: true,
          canRollAgain: false,
          isTradeFrozen: true,
        })
      );

      const endTurnBtnTag = html.match(/<button[^>]*aria-label="Kết thúc lượt"[^>]*>/)?.[0] ?? '';
      expect(endTurnBtnTag).not.toContain('disabled');
      expect(endTurnBtnTag).toContain('bg-emerald-600');
    });
  });

  // =========================================================================
  // FACET 3: TitleDeed Modal True Affordance & Visual Contrast (TC-207.11 - 14)
  // =========================================================================
  describe('Facet 3: TitleDeed Modal True Affordance & Visual Contrast', () => {
    it('[TC-207.11/MSS][UC-IMP207] Khi isTradeFrozen = true, resolveTitleDeedModalState trả về canBuy: false và isBuyOpportunity: true khi đứng tại ô đất', () => {
      const state = resolveTitleDeedModalState({
        cellIndex: 35,
        myId: 'p1',
        myPlayer: { id: 'p1', balance: 10000, position: 35, ownedProperties: [] },
        playersInfo: { p1: { id: 'p1', balance: 10000, position: 35, ownedProperties: [] } },
        levelMap: {},
        activeModifiers: [{ type: 'MC_FREEZE_TRADE', remainingRounds: 2 }],
        turnPhase: TurnPhase.PropertyManagement,
        currentTurnPlayerId: 'p1',
      });

      expect(state.canBuy).toBe(false);
      expect(state.isBuyOpportunity).toBe(true);
    });

    it('[TC-207.12/MSS][UC-IMP207] Khi isTradeFrozen = true, TitleDeedActionFooter render nút ❄️ Đóng Băng (Cấm Mua) với class disabled (cursor-not-allowed, bg-slate-200), tuyệt đối không có class bg-emerald-700 hay cursor-pointer', () => {
      const html = renderToStaticMarkup(
        React.createElement(TitleDeedActionFooter, {
          isOwned: false,
          canBuy: false,
          isTradeFrozen: true,
          deedPrice: 2000,
          isBuyOpportunity: true,
        } as any)
      );

      const freezeBtnMatch = html.match(/<button[^>]*>❄️ Đóng Băng[^<]*<\/button>/)?.[0] ?? '';
      expect(freezeBtnMatch).toContain('❄️ Đóng Băng (Cấm Mua)');
      expect(freezeBtnMatch).toContain('cursor-not-allowed');
      expect(freezeBtnMatch).not.toContain('bg-emerald-700');
      expect(freezeBtnMatch).not.toContain('cursor-pointer');
    });

    it('[TC-207.13/MSS][UC-IMP207] Khi isTradeFrozen = true, nút Từ Chối Mua hoàn toàn bị ẩn, hiển thị nút ✕ Đóng (chiếm 1 cột đối xứng col-span-1)', () => {
      const html = renderToStaticMarkup(
        React.createElement(TitleDeedActionFooter, {
          isOwned: false,
          canBuy: false,
          isTradeFrozen: true,
          deedPrice: 2000,
          isBuyOpportunity: true,
        } as any)
      );

      expect(html).not.toContain('Từ Chối Mua');
      expect(html).toContain('✕ Đóng');
      expect(html).not.toContain('col-span-2');
    });

    it('[TC-207.14/MSS][UC-IMP207] Khi isTradeFrozen = false và đủ tiền, nút Mua hiển thị màu xanh bg-emerald-700 và nút Từ Chối Mua hiển thị đầy đủ', () => {
      const html = renderToStaticMarkup(
        React.createElement(TitleDeedActionFooter, {
          isOwned: false,
          canBuy: true,
          isTradeFrozen: false,
          deedPrice: 2000,
          isBuyOpportunity: true,
        } as any)
      );

      expect(html).toContain('bg-emerald-700');
      expect(html).toContain('✕ Từ Chối Mua');
      expect(html).toContain('Mua BĐS (2.000)');
    });
  });

  // =========================================================================
  // FACET 4: PurchaseDecisionCard & Radar Integrity (TC-207.15 - 16)
  // =========================================================================
  describe('Facet 4: PurchaseDecisionCard & Radar Integrity', () => {
    it('[TC-207.15/MSS][UC-IMP207] Khi isTradeFrozen = true, PurchaseDecisionCard render chip mục tiêu với nhãn ❄️ ĐÓNG BĂNG thay vì 🎯 MUA NGAY', () => {
      const html = renderToStaticMarkup(
        React.createElement(PurchaseDecisionCard, {
          cellIndex: 35,
          deedPrice: 2000,
          buyerBalance: 10000,
          buyerId: 'p1',
          allPlayers: {
            p1: { id: 'p1', name: 'Alice', balance: 10000, ownedProperties: [] },
          },
          isTradeFrozen: true,
        } as any)
      );

      expect(html).toContain('❄️ ĐÓNG BĂNG');
      expect(html).not.toContain('🎯 MUA NGAY');
    });

    it('[TC-207.16/MSS][UC-IMP207] Khi isTradeFrozen = true, PurchaseDecisionCard render banner cảnh báo thị trường đóng băng thay cho khối thanh khoản sau mua 🟢 Dư Dả', () => {
      const html = renderToStaticMarkup(
        React.createElement(PurchaseDecisionCard, {
          cellIndex: 35,
          deedPrice: 2000,
          buyerBalance: 10000,
          buyerId: 'p1',
          allPlayers: {
            p1: { id: 'p1', name: 'Alice', balance: 10000, ownedProperties: [] },
          },
          isTradeFrozen: true,
        } as any)
      );

      expect(html).toContain('data-testid="freeze-trade-banner"');
      expect(html).toContain('Thị trường đóng băng');
      expect(html).not.toContain('cash-buffer-badge');
      expect(html).not.toContain('🟢 Dư Dả');
    });
  });
});
