// [TC-196.01/MSS..TC-196.16/MSS][UC-IMP196] IMP-196 Diplomatic Immunity Feedback & Dice Readability Contract Suite
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  buildDeltaFromRoom,
  buildDeltaPayload,
  type PlayerDelta,
  type DeltaPayload,
} from '../../src/server/session_manager';
import { buildSparseDelta } from '../../src/server/network/delta_broadcaster';
import { ChanceCardId, MarketCardId } from '../../src/domain/event_card_engine';
import {
  handleLanding,
  LandingResult,
  type PropertyRegistry,
  type PropertyStateMap,
} from '../../src/domain/property_manager';
import {
  executeTurnRoll,
  executeTurnEnd,
} from '../../src/server/turn_loop';
import {
  createPlayer,
  createRoom,
  TurnPhase,
  type MarketModifier,
} from '../../src/domain/room';
import { applyPlayerDeltas } from '../../src/client/network/apply_delta_players';
import {
  resolveTransactionNarrative,
  resolveActionIcon,
  resolveFriendlyReason,
} from '../../src/client/ui/transaction_narrative';
import {
  FloatingTextType,
  type FloatingTextItem,
  type PlayerHudInfo,
  type FloatingActionType,
  type GameState,
} from '../../src/client/store/game_store';
import { PlayerCard } from '../../src/client/ui/player_card';

// ============================================================================
// DYNAMIC IMPORT HARNESS (Station 1 RED Gate for Station 2 Pending Modules)
// ============================================================================
let broadcasterMod: any = null;
try {
  broadcasterMod = await import('../../src/server/network/delta_broadcaster.js');
} catch {
  broadcasterMod = null;
}
const isPlayerEqual: (a: PlayerDelta, b: PlayerDelta) => boolean =
  broadcasterMod?.isPlayerEqual ??
  (() => {
    throw new TypeError('isPlayerEqual is not exported from delta_broadcaster (Station 1 RED: pending export)');
  });

const DICE_SCORE_BADGE_PATH = '../../src/client/ui/dice_score_badge';
let diceBadgeMod: any = null;
try {
  diceBadgeMod = await import(/* @vite-ignore */ DICE_SCORE_BADGE_PATH);
} catch {
  try {
    diceBadgeMod = await import(/* @vite-ignore */ `${DICE_SCORE_BADGE_PATH}.js`);
  } catch {
    diceBadgeMod = null;
  }
}
const DiceScoreBadge: React.ComponentType<{
  dice: readonly [number, number];
  isRolling?: boolean;
  isVisible?: boolean;
  hasRolledThisTurn?: boolean;
  turnPhase?: TurnPhase;
}> =
  diceBadgeMod?.DiceScoreBadge ??
  (() => {
    throw new TypeError('DiceScoreBadge is not implemented (Station 1 RED: dice_score_badge.tsx pending)');
  });

describe('[UC-IMP196] IMP-196 Diplomatic Immunity Feedback & Dice Readability Contract Tests', () => {
  // --------------------------------------------------------------------------
  // Facet 1: Boundary & Hand Synchronization
  // --------------------------------------------------------------------------
  describe('Facet 1: Boundary & Hand Synchronization', () => {
    it('[TC-196.01/MSS][UC-IMP196] Interface PlayerDelta & buildDeltaFromRoom: emit hand: [] khi hand rỗng (Array Tombstone Protocol)', () => {
      const room = createRoom('host_1', 'ROOM01');
      const p1 = createPlayer('p1');
      p1.hand = [];
      const p2 = createPlayer('p2');
      p2.hand = [ChanceCardId.CC_DIPLOMATIC];
      room.players = [p1, p2];

      const delta = buildDeltaFromRoom(room, new Map(), new Map(), 1);

      expect(delta.players?.[0]?.hand).toEqual([]);
      expect(delta.players?.[1]?.hand).toEqual([ChanceCardId.CC_DIPLOMATIC]);
    });

    it('[TC-196.02/MSS][UC-IMP196] Interface DeltaPayload & DeltaPayloadOptions: hỗ trợ lastDiplomaticEvent', () => {
      const diplomaticEvent = {
        playerId: 'p1',
        landlordId: 'p2',
        cellIndex: 5,
        savedRent: 1200,
      };
      const payload = buildDeltaPayload({
        tick: 10,
        cells: [],
        lastDiplomaticEvent: diplomaticEvent,
      } as any);

      expect((payload as any).lastDiplomaticEvent).toEqual(diplomaticEvent);

      const payloadNull = buildDeltaPayload({
        tick: 11,
        cells: [],
        lastDiplomaticEvent: null,
      } as any);
      expect((payloadNull as any).lastDiplomaticEvent).toBeNull();
    });

    it('[TC-196.03/MSS][UC-IMP196] Broadcaster isPlayerEqual: so sánh 2 player có hand khác nhau trả về false', () => {
      const p1: PlayerDelta = { id: 'p1', position: 0, balance: 15000, hand: [ChanceCardId.CC_DIPLOMATIC] } as any;
      const p2: PlayerDelta = { id: 'p1', position: 0, balance: 15000, hand: [] } as any;

      const resultDiff = isPlayerEqual(p1, p2);
      expect(resultDiff).toBe(false);

      const resultIdentical = isPlayerEqual(p1, { ...p1, hand: [ChanceCardId.CC_DIPLOMATIC] });
      expect(resultIdentical).toBe(true);
    });

    it('[TC-196.04/MSS][UC-IMP196] Broadcaster buildSparseDelta: lastDiplomaticEvent có mặt trong whitelist và được phát đi', () => {
      const prev: DeltaPayload = { tick: 1, cells: [] };
      const next: DeltaPayload = {
        tick: 2,
        cells: [],
        lastDiplomaticEvent: { playerId: 'p1', landlordId: 'p2', cellIndex: 3, savedRent: 500 },
      } as any;

      const sparse = buildSparseDelta(prev, next);
      expect((sparse as any).lastDiplomaticEvent).toEqual({
        playerId: 'p1',
        landlordId: 'p2',
        cellIndex: 3,
        savedRent: 500,
      });

      const sparseNull = buildSparseDelta(prev, { tick: 3, cells: [], lastDiplomaticEvent: null } as any);
      expect((sparseNull as any).lastDiplomaticEvent).toBeNull();
    });

    it('[TC-196.05/MSS][UC-IMP196] Type FloatingActionType: chấp nhận giá trị diplomatic và resolveActionIcon trả về 🤝', () => {
      const actionType: FloatingActionType = 'diplomatic' as unknown as FloatingActionType;
      const icon = resolveActionIcon(actionType, true);
      expect(icon).toBe('🤝');

      const item: FloatingTextItem = {
        id: 'ft_dip_reason',
        text: '+500 Tr.',
        type: FloatingTextType.Reward,
        playerId: 'p1',
        timestamp: Date.now(),
        actionType: 'diplomatic' as FloatingActionType,
        title: 'Miễn Trừ Ngoại Giao',
      };
      const friendlyReason = resolveFriendlyReason(item);
      expect(friendlyReason).toContain('Ngoại Giao');
    });
  });

  // --------------------------------------------------------------------------
  // Facet 2: Valuation Precedence & Domain Rent Invariants
  // --------------------------------------------------------------------------
  describe('Facet 2: Valuation Precedence & Domain Rent Invariants', () => {
    it('[TC-196.06/MSS][UC-IMP196] property_manager.ts - Pre-consumption valuation: dẫm BĐS đối thủ tính potentialRent, tiêu thụ thẻ và không trừ tiền', () => {
      const tenant = createPlayer('tenant_1');
      tenant.balance = 10000;
      tenant.hand = [ChanceCardId.CC_DIPLOMATIC];

      const owner = createPlayer('owner_1');
      owner.balance = 10000;

      // Cell 1: Cần Thơ (Property, deed price 600, rent 60)
      const registry: PropertyRegistry = new Map([[1, 'owner_1']]);
      const stateMap: PropertyStateMap = new Map([[1, { level: 0 }]]);
      const chanceDiscard: ChanceCardId[] = [];

      const landing = handleLanding(
        tenant, 1, registry, [tenant, owner], stateMap, 7, [], undefined, chanceDiscard
      );

      expect(landing.result).toBe(LandingResult.RentPaid);
      expect(tenant.balance).toBe(10000);
      expect((landing as any).diplomaticCardUsed).toBe(true);
      expect((landing as any).savedRentAmount).toBe(60);
    });

    it('[TC-196.07/MSS][UC-IMP196] property_manager.ts - Zero rent priority (Gotcha #260): Bão biển thoát sớm trước khi tiêu thụ thẻ', () => {
      const tenant = createPlayer('tenant_1');
      tenant.balance = 10000;
      tenant.hand = [ChanceCardId.CC_DIPLOMATIC];

      const owner = createPlayer('owner_1');
      owner.balance = 10000;

      const registry: PropertyRegistry = new Map([[1, 'owner_1']]);
      const stateMap: PropertyStateMap = new Map([[1, { level: 0 }]]);
      const chanceDiscard: ChanceCardId[] = [];

      const stormModifier: MarketModifier = {
        type: MarketCardId.MC_COASTAL_STORM,
        remainingRounds: 2,
        affectedCells: [1],
      };

      const landing = handleLanding(
        tenant, 1, registry, [tenant, owner], stateMap, 7, [stormModifier], undefined, chanceDiscard
      );

      expect(landing.rentAmount).toBe(0);
      expect(tenant.hand).toContain(ChanceCardId.CC_DIPLOMATIC);
      expect((landing as any).diplomaticCardUsed).toBe(false);
      expect(chanceDiscard).not.toContain(ChanceCardId.CC_DIPLOMATIC);
    });

    it('[TC-196.08/MSS][UC-IMP196] property_manager.ts - Railroad/Utility exclusion: dẫm Ga tàu/Tiện ích không tiêu thụ thẻ, trừ tiền bình thường', () => {
      const tenant = createPlayer('tenant_1');
      tenant.balance = 10000;
      tenant.hand = [ChanceCardId.CC_DIPLOMATIC];

      const owner = createPlayer('owner_1');
      owner.balance = 10000;

      // Cell 5 is Railroad (Ga Sài Gòn)
      const registry: PropertyRegistry = new Map([[5, 'owner_1']]);
      const stateMap: PropertyStateMap = new Map([[5, { level: 0 }]]);
      const chanceDiscard: ChanceCardId[] = [];

      const landing = handleLanding(
        tenant, 5, registry, [tenant, owner], stateMap, 7, [], undefined, chanceDiscard
      );

      expect((landing as any).diplomaticCardUsed).toBe(false);
      expect(landing.rentAmount).toBeGreaterThan(0);
      expect(tenant.balance).toBe(10000 - landing.rentAmount);
      expect(tenant.hand).toContain(ChanceCardId.CC_DIPLOMATIC);
    });
  });

  // --------------------------------------------------------------------------
  // Facet 3: Server Turn Loop Lifecycle & Multi-Turn Teardown
  // --------------------------------------------------------------------------
  describe('Facet 3: Server Turn Loop Lifecycle & Multi-Turn Teardown', () => {
    it('[TC-196.09/MSS][UC-IMP196] turn_loop.ts - executeTurnRoll: ghi nhận room.lastDiplomaticEvent khi diplomaticCardUsed === true', () => {
      const room = createRoom('host_1', 'ROOM09');
      const tenant = createPlayer('p1');
      tenant.position = 0;
      tenant.balance = 10000;
      tenant.hand = [ChanceCardId.CC_DIPLOMATIC];

      const owner = createPlayer('p2');
      owner.position = 0;
      owner.balance = 10000;

      room.players = [tenant, owner];
      room.currentPlayerIndex = 0;
      room.phase = TurnPhase.WaitingRoll;
      room.started = true;

      // Cell 3 is Ben Bach Dang (Property, price 600, rent 40)
      const reg: PropertyRegistry = new Map([[3, 'p2']]);
      const sm: PropertyStateMap = new Map([[3, { level: 0 }]]);
      const rolledThisTurn = new Map<string, boolean>();

      // Roll total = 3 (die1 = 1, die2 = 2)
      let rollStep = 0;
      const mockRng = () => {
        rollStep++;
        return rollStep === 1 ? 0.05 : 0.25;
      };

      executeTurnRoll(room, tenant, reg, sm, mockRng, () => 0.5, rolledThisTurn, 'ROOM09');

      expect((room as any).lastDiplomaticEvent).toEqual({
        playerId: 'p1',
        landlordId: 'p2',
        cellIndex: 3,
        savedRent: expect.any(Number),
      });
      expect((room as any).lastDiplomaticEvent.savedRent).toBeGreaterThan(0);
    });

    it('[TC-196.10/MSS][UC-IMP196] turn_loop.ts - Turn N+1 Teardown: room.lastDiplomaticEvent reset về null ở đầu lượt gieo và khi kết thúc lượt', () => {
      const room = createRoom('host_1', 'ROOM10');
      const p1 = createPlayer('p1');
      const p2 = createPlayer('p2');
      room.players = [p1, p2];
      room.currentPlayerIndex = 0;
      room.phase = TurnPhase.PropertyManagement;

      (room as any).lastDiplomaticEvent = {
        playerId: 'p1',
        landlordId: 'p2',
        cellIndex: 3,
        savedRent: 150,
      };

      const rolledMap = new Map<string, boolean>([['ROOM10', true]]);
      executeTurnEnd(room, p1, true, false, 'ROOM10', rolledMap);

      expect((room as any).lastDiplomaticEvent).toBeNull();

      // Test reset at start of next roll
      (room as any).lastDiplomaticEvent = {
        playerId: 'p2',
        landlordId: 'p1',
        cellIndex: 1,
        savedRent: 200,
      };
      p2.position = 0;
      p2.skipNextTurn = false;
      room.phase = TurnPhase.WaitingRoll;
      executeTurnRoll(room, p2, new Map(), new Map(), () => 0.1, () => 0.5, new Map(), 'ROOM10');

      expect((room as any).lastDiplomaticEvent).toBeNull();
    });
  });

  // --------------------------------------------------------------------------
  // Facet 4: Client Store Reactivity & Narrative Clarity
  // --------------------------------------------------------------------------
  describe('Facet 4: Client Store Reactivity & Narrative Clarity', () => {
    it('[TC-196.11/MSS][UC-IMP196] apply_delta_players.ts: OPTIONAL_PLAYER_KEYS bao gồm hand, cập nhật mảng hand vào store client', () => {
      const playersInfoMap: Record<string, PlayerHudInfo> = {
        p1: {
          id: 'p1',
          name: 'Player Alpha',
          balance: 15000,
          tokenColor: '#38BDF8',
          ownedProperties: [],
          hand: [ChanceCardId.CC_DIPLOMATIC],
        } as any,
      };

      const delta: DeltaPayload = {
        tick: 5,
        cells: [],
        players: [
          {
            id: 'p1',
            position: 3,
            balance: 15000,
            hand: [],
          } as any,
        ],
      };

      const mockState = {
        playerPositions: { p1: 0 },
        setPlayerPositions: vi.fn(),
        addFloatingText: vi.fn(),
        activeModal: null,
      } as unknown as GameState;

      applyPlayerDeltas(delta, mockState, playersInfoMap, false);

      expect((playersInfoMap.p1 as any).hand).toEqual([]);
    });

    it('[TC-196.12/MSS][UC-IMP196] transaction_narrative.ts - Khách thuê kích hoạt: resolveTransactionNarrative sinh category ĐẶC QUYỀN NGOẠI GIAO và detail Tiết kiệm', () => {
      const item: FloatingTextItem = {
        id: 'ft_dip_tenant',
        text: '+1.200 Tr.',
        type: FloatingTextType.Reward,
        playerId: 'p1',
        actionType: 'diplomatic' as any,
        title: 'Miễn Trừ Ngoại Giao',
        cellIndex: 3,
        timestamp: Date.now(),
      };

      const tenantInfo: PlayerHudInfo = {
        id: 'p1',
        name: 'Khách Thuê',
        balance: 10000,
        tokenColor: '#38BDF8',
        ownedProperties: [],
      };

      const narrative = resolveTransactionNarrative(item, tenantInfo, undefined, 'p1');

      expect(narrative.category).toBe('ĐẶC QUYỀN NGOẠI GIAO');
      expect(narrative.icon).toBe('🤝');
      expect(narrative.verb).toBe('kích hoạt');
      expect(narrative.target).toBe('Thẻ Ngoại Giao');
      expect(narrative.detail).toContain('Miễn 100% tiền thuê');
      expect(narrative.detail).toContain('Tiết kiệm');
    });

    it('[TC-196.13/MSS][UC-IMP196] transaction_narrative.ts - Chủ đất bị miễn thu: sinh thông điệp phản ánh khách dùng thẻ và Hụt thu', () => {
      const item: FloatingTextItem = {
        id: 'ft_dip_landlord',
        text: '-1.200 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'p2',
        targetPlayerId: 'p1',
        targetPlayerName: 'Khách Thuê',
        actionType: 'diplomatic' as any,
        title: 'Khách dùng Thẻ Ngoại Giao',
        cellIndex: 3,
        timestamp: Date.now(),
      };

      const landlordInfo: PlayerHudInfo = {
        id: 'p2',
        name: 'Chủ Đất',
        balance: 20000,
        tokenColor: '#F59E0B',
        ownedProperties: [3],
      };

      const narrative = resolveTransactionNarrative(item, landlordInfo, undefined, 'p2');

      expect(narrative.detail ?? narrative.target).toContain('Hụt thu');
    });

    it('[TC-196.14/MSS][UC-IMP196] transaction_narrative.ts - Ga tàu / Tiện ích bảo lưu thẻ: nộp tiền thuê khi cầm CC_DIPLOMATIC ghi rõ bảo lưu', () => {
      const item: FloatingTextItem = {
        id: 'ft_railroad_rent',
        text: '-500 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'p1',
        targetPlayerId: 'p2',
        targetPlayerName: 'Chủ Ga',
        actionType: 'rent_pay',
        cellIndex: 5, // Ga Sài Gòn (Railroad)
        timestamp: Date.now(),
      };

      const playerWithCard: PlayerHudInfo = {
        id: 'p1',
        name: 'Hành Khách',
        balance: 10000,
        tokenColor: '#38BDF8',
        ownedProperties: [],
        hand: [ChanceCardId.CC_DIPLOMATIC],
      } as any;

      const narrative = resolveTransactionNarrative(item, playerWithCard, undefined, 'p1');

      expect(narrative.detail).toContain('(Thẻ Ngoại Giao được bảo lưu - Không áp dụng cho Hạ tầng/Tiện ích)');
    });
  });

  // --------------------------------------------------------------------------
  // Facet 5: UI Micro-Affordance & Isometric Readability
  // --------------------------------------------------------------------------
  describe('Facet 5: UI Micro-Affordance & Isometric Readability', () => {
    it('[TC-196.15/MSS][UC-IMP196] PlayerCard - Micro-chip 🤝: renderToStaticMarkup hiển thị icon 🤝 với tooltip title="Giữ Thẻ Miễn Trừ Ngoại Giao"', () => {
      const playerWithCard: PlayerHudInfo = {
        id: 'p1',
        name: 'Diplomat',
        balance: 15000,
        tokenColor: '#38BDF8',
        ownedProperties: [],
        hand: [ChanceCardId.CC_DIPLOMATIC],
      } as any;

      const htmlWithCard = renderToStaticMarkup(
        React.createElement(PlayerCard, {
          player: playerWithCard,
          isCurrentTurn: false,
          levelMap: {},
        })
      );

      expect(htmlWithCard).toContain('🤝');
      expect(htmlWithCard).toContain('title="Giữ Thẻ Miễn Trừ Ngoại Giao"');

      const playerWithoutCard: PlayerHudInfo = { ...playerWithCard, hand: [] } as any;
      const htmlWithoutCard = renderToStaticMarkup(
        React.createElement(PlayerCard, {
          player: playerWithoutCard,
          isCurrentTurn: false,
          levelMap: {},
        })
      );
      expect(htmlWithoutCard).not.toContain('title="Giữ Thẻ Miễn Trừ Ngoại Giao"');
    });

    it('[TC-196.16/MSS][UC-IMP196] DiceScoreBadge - 2D HUD callout: render DiceScoreBadge [1, 5] hiển thị 1 + 5 = 6, và gieo đôi hiển thị (Đôi! 🎉)', () => {
      const htmlStandard = renderToStaticMarkup(
        React.createElement(DiceScoreBadge, {
          dice: [1, 5],
          isRolling: false,
          isVisible: true,
          hasRolledThisTurn: true,
        })
      );
      expect(htmlStandard).toContain('1 + 5 = 6');
      expect(htmlStandard).not.toContain('Đôi!');

      const htmlDoubles = renderToStaticMarkup(
        React.createElement(DiceScoreBadge, {
          dice: [3, 3],
          isRolling: false,
          isVisible: true,
          hasRolledThisTurn: true,
        })
      );
      expect(htmlDoubles).toContain('3 + 3 = 6');
      expect(htmlDoubles).toContain('(Đôi! 🎉)');
    });
  });
});
