// [TC-IMP181/MSS][UC-GAME-038..041] Dynamic Event Card Delta Synchronization & Financial Audit
// Universal 4-Facet Behavioral Matrix:
// Facet 1: Boundary & Range (Dynamic deltas on CC_LAND_CHANGE, CC_VENUE_INCIDENT, CC_SLOW_BUILD)
// Facet 2: State Reactivity & Dynamic Calculations (CC_TAX_AUDIT, CC_FRANCHISE, CC_MA_FORCE, CC_LAND_RECLAIM, getCardHeroStat)
// Facet 3: Disposal & Turn N+1 Teardown (detectEventCardActivities singleton cleanup on null)
// Facet 4: Error Defense & Punchy Dictionary Accuracy (CC_DIPLOMATIC undefined delta, PUNCHY_EVENT_SUMMARIES audit)

import { describe, it, expect, beforeEach } from 'vitest';
import { createPlayer, createRoom, type Player, type Room } from '../../src/domain/room';
import { ChanceCardId, SERVICE_CELLS } from '../../src/domain/event_card_types';
import { drawChanceCard } from '../../src/domain/event_card_engine';
import {
  type PropertyRegistry,
  type PropertyStateMap,
} from '../../src/domain/property_manager';
import { getCardHeroStat } from '../../src/client/ui/modals/event_card_visuals';
import {
  detectEventCardActivities,
  resetEventCardActivityTracker,
} from '../../src/client/network/activity_tracker';
import { PUNCHY_EVENT_SUMMARIES } from '../../src/client/ui/event_card_punchy_summaries';

describe('[IMP-181] Dynamic Event Card Delta Synchronization & Financial Audit', () => {
  let p1: Player;
  let p2: Player;
  let p3: Player;
  let p4: Player;
  let room: Room;
  let registry: PropertyRegistry;
  let stateMap: PropertyStateMap;

  beforeEach(() => {
    p1 = createPlayer('p1');
    p2 = createPlayer('p2');
    p3 = createPlayer('p3');
    p4 = createPlayer('p4');
    room = createRoom('p1');
    room.players = [p1, p2];
    registry = new Map();
    stateMap = new Map();
    resetEventCardActivityTracker();
  });

  // ============================================================================
  // FACET 1: Boundary & Range (Dynamic deltas on CC_LAND_CHANGE, CC_VENUE_INCIDENT, CC_SLOW_BUILD)
  // ============================================================================
  describe('Facet 1: Boundary & Range (Dynamic Card Deltas)', () => {
    it('[TC-IMP181.01/MSS][UC-GAME-038..041] drawChanceCard CC_LAND_CHANGE khi người chơi có 0 ô đất: effectDelta = 600 và destination chứa Kho Bạc hỗ trợ', () => {
      room.chanceDeck = [ChanceCardId.CC_LAND_CHANGE];

      drawChanceCard(room, p1, () => 0.5, registry, stateMap);

      expect(room.lastEventCard?.effectDelta).toBe(600);
      expect(room.lastEventCard?.destination).toContain('Kho Bạc hỗ trợ');
    });

    it('[TC-IMP181.02/MSS][UC-GAME-038..041] drawChanceCard CC_LAND_CHANGE khi người chơi sở hữu ô C0: effectDelta = -500 và destination chứa Kho Bạc Nhà Nước', () => {
      room.chanceDeck = [ChanceCardId.CC_LAND_CHANGE];
      registry.set(1, 'p1');
      stateMap.set(1, { level: 0 });

      drawChanceCard(room, p1, () => 0.5, registry, stateMap);

      expect(room.lastEventCard?.effectDelta).toBe(-500);
      expect(room.lastEventCard?.destination).toContain('Kho Bạc Nhà Nước');
    });

    it('[TC-IMP181.03/MSS][UC-GAME-038..041] drawChanceCard CC_VENUE_INCIDENT khi người chơi KHÔNG sở hữu ô Dịch Vụ: effectDelta = -600', () => {
      room.chanceDeck = [ChanceCardId.CC_VENUE_INCIDENT];

      drawChanceCard(room, p1, () => 0.5, registry, stateMap);

      expect(room.lastEventCard?.effectDelta).toBe(-600);
    });

    it('[TC-IMP181.04/MSS][UC-GAME-038..041] drawChanceCard CC_VENUE_INCIDENT khi người chơi sở hữu ô Dịch Vụ: effectDelta = -1200', () => {
      room.chanceDeck = [ChanceCardId.CC_VENUE_INCIDENT];
      registry.set(SERVICE_CELLS[0]!, 'p1');

      drawChanceCard(room, p1, () => 0.5, registry, stateMap);

      expect(room.lastEventCard?.effectDelta).toBe(-1200);
    });

    it('[TC-IMP181.05/MSS][UC-GAME-038..041] drawChanceCard CC_SLOW_BUILD khi người chơi KHÔNG sở hữu ô C0: effectDelta = -300', () => {
      room.chanceDeck = [ChanceCardId.CC_SLOW_BUILD];

      drawChanceCard(room, p1, () => 0.5, registry, stateMap);

      expect(room.lastEventCard?.effectDelta).toBe(-300);
    });

    it('[TC-IMP181.06/MSS][UC-GAME-038..041] drawChanceCard CC_SLOW_BUILD khi người chơi sở hữu ô C0: effectDelta = -600', () => {
      room.chanceDeck = [ChanceCardId.CC_SLOW_BUILD];
      registry.set(1, 'p1');
      stateMap.set(1, { level: 0 });

      drawChanceCard(room, p1, () => 0.5, registry, stateMap);

      expect(room.lastEventCard?.effectDelta).toBe(-600);
    });
  });

  // ============================================================================
  // FACET 2: State Reactivity & Dynamic Calculations
  // ============================================================================
  describe('Facet 2: State Reactivity & Dynamic Calculations', () => {
    it('[TC-IMP181.07/MSS][UC-GAME-038..041] drawChanceCard CC_TAX_AUDIT khi người chơi sở hữu 2 ô đất trống C0: effectDelta = -1000', () => {
      room.chanceDeck = [ChanceCardId.CC_TAX_AUDIT];
      registry.set(1, 'p1');
      registry.set(3, 'p1');
      stateMap.set(1, { level: 0 });
      stateMap.set(3, { level: 0 });

      drawChanceCard(room, p1, () => 0.5, registry, stateMap);

      expect(room.lastEventCard?.effectDelta).toBe(-1000);
    });

    it('[TC-IMP181.08/MSS][UC-GAME-038..041] drawChanceCard CC_TAX_AUDIT khi người chơi có 0 ô đất C0: effectDelta không in phạt giả (undefined hoặc 0)', () => {
      room.chanceDeck = [ChanceCardId.CC_TAX_AUDIT];

      drawChanceCard(room, p1, () => 0.5, registry, stateMap);

      const delta = room.lastEventCard?.effectDelta;
      expect(delta === undefined || delta === 0).toBe(true);
    });

    it('[TC-IMP181.09/MSS][UC-GAME-038..041] drawChanceCard CC_FRANCHISE trên bàn 4 người (3 đối thủ còn sống): effectDelta = 2400', () => {
      room.players = [p1, p2, p3, p4];
      room.chanceDeck = [ChanceCardId.CC_FRANCHISE];

      drawChanceCard(room, p1, () => 0.5, registry, stateMap);

      expect(room.lastEventCard?.effectDelta).toBe(2400);
    });

    it('[TC-IMP181.10/MSS][UC-GAME-038..041] drawChanceCard CC_FRANCHISE trên bàn 2 người (1 đối thủ còn sống): effectDelta = 800', () => {
      room.players = [p1, p2];
      room.chanceDeck = [ChanceCardId.CC_FRANCHISE];

      drawChanceCard(room, p1, () => 0.5, registry, stateMap);

      expect(room.lastEventCard?.effectDelta).toBe(800);
    });

    it('[TC-IMP181.11/MSS][UC-GAME-038..041] drawChanceCard CC_MA_FORCE khi đối thủ không có ô C0 hợp lệ: effectDelta = 800 và destination chứa Kho Bạc hỗ trợ', () => {
      room.players = [p1, p2];
      room.chanceDeck = [ChanceCardId.CC_MA_FORCE];

      drawChanceCard(room, p1, () => 0.5, registry, stateMap);

      expect(room.lastEventCard?.effectDelta).toBe(800);
      expect(room.lastEventCard?.destination).toContain('Kho Bạc hỗ trợ');
    });

    it('[TC-IMP181.12/MSS][UC-GAME-038..041] drawChanceCard CC_LAND_RECLAIM khi người chơi sở hữu ô C0 giá 1.000 Tr.: effectDelta = 1500 (150% giá đất)', () => {
      room.chanceDeck = [ChanceCardId.CC_LAND_RECLAIM];
      registry.set(6, 'p1');
      stateMap.set(6, { level: 0 });

      drawChanceCard(room, p1, () => 0.5, registry, stateMap);

      expect(room.lastEventCard?.effectDelta).toBe(1500);
    });

    it('[TC-IMP181.13/MSS][UC-GAME-038..041] getCardHeroStat cho CC_LAND_CHANGE khi effectDelta === 600: trả về TRỢ CẤP QUY HOẠCH +600 Tr. positive', () => {
      const heroStat = getCardHeroStat(ChanceCardId.CC_LAND_CHANGE, 600);

      expect(heroStat.label).toBe('TRỢ CẤP QUY HOẠCH');
      expect(heroStat.value).toBe('+600 Tr.');
      expect(heroStat.variant).toBe('positive');
    });

    it('[TC-IMP181.14/MSS][UC-GAME-038..041] getCardHeroStat cho CC_LAND_CHANGE khi effectDelta === -500: trả về value -500 Tr. và variant positive', () => {
      const heroStat = getCardHeroStat(ChanceCardId.CC_LAND_CHANGE, -500);

      expect(heroStat.value).toBe('-500 Tr.');
      expect(heroStat.variant).toBe('positive');
    });

    it('[TC-IMP181.15/MSS][UC-GAME-038..041] getCardHeroStat cho CC_TAX_AUDIT khi effectDelta === -1000: trả về THANH TRA THUẾ -1.000 Tr. negative', () => {
      const heroStat = getCardHeroStat(ChanceCardId.CC_TAX_AUDIT, -1000);

      expect(heroStat.label).toBe('THANH TRA THUẾ');
      expect(heroStat.value).toBe('-1.000 Tr.');
      expect(heroStat.variant).toBe('negative');
    });
  });

  // ============================================================================
  // FACET 3: Disposal & Turn N+1 Teardown
  // ============================================================================
  describe('Facet 3: Disposal & Turn N+1 Teardown', () => {
    it('[TC-IMP181.16/MSS][UC-GAME-038..041] detectEventCardActivities dọn dẹp singleton khi delta.lastEventCard === null để cho phép thẻ cùng loại hiển thị ở lượt sau', () => {
      const mockCard = {
        id: ChanceCardId.CC_LAND_CHANGE,
        title: 'Quy Hoạch Lại Đất Đai',
        description: 'Nâng cấp C0 lên C1',
        drawnBy: 'p1',
        type: 'Chance',
      };
      const mockState = {
        playersInfo: { p1: { name: 'Player 1' } },
        currentTurnPlayerId: 'p1',
      } as any;

      // Turn N: Rút thẻ lần 1
      const entriesTurnN = detectEventCardActivities({ lastEventCard: mockCard } as any, mockState);
      expect(entriesTurnN.length).toBe(1);

      // Turn N+1 transition: máy chủ phát tombstone delta null
      detectEventCardActivities({ lastEventCard: null } as any, mockState);

      // Turn N+1: Rút lại thẻ cùng loại sau khi xáo bài
      const entriesTurnNext = detectEventCardActivities({ lastEventCard: mockCard } as any, mockState);
      expect(entriesTurnNext.length).toBe(1);
    });
  });

  // ============================================================================
  // FACET 4: Error Defense & Punchy Dictionary Accuracy
  // ============================================================================
  describe('Facet 4: Error Defense & Punchy Dictionary Accuracy', () => {
    it('[TC-IMP181.17/MSS][UC-GAME-038..041] drawChanceCard thẻ phi tài chính CC_DIPLOMATIC: room.lastEventCard.effectDelta phải là undefined', () => {
      room.chanceDeck = [ChanceCardId.CC_DIPLOMATIC];

      drawChanceCard(room, p1, () => 0.5, registry, stateMap);

      expect(room.lastEventCard?.effectDelta).toBeUndefined();
    });

    it('[TC-IMP181.18/MSS][UC-GAME-038..041] PUNCHY_EVENT_SUMMARIES[CC_CONCERT_SPONSOR] phải chứa Chi 600 Tr. hoặc x2 (KHÔNG ĐƯỢC chứa +800 Tr.)', () => {
      const summary = PUNCHY_EVENT_SUMMARIES[ChanceCardId.CC_CONCERT_SPONSOR];

      expect(summary).toBeDefined();
      expect(summary.includes('Chi 600 Tr.') || summary.includes('x2')).toBe(true);
      expect(summary).not.toContain('+800 Tr.');
    });

    it('[TC-IMP181.19/MSS][UC-GAME-038..041] PUNCHY_EVENT_SUMMARIES[CC_FRANCHISE] phải chứa 800 Tr. (KHÔNG ĐƯỢC chứa 1.200 Tr.)', () => {
      const summary = PUNCHY_EVENT_SUMMARIES[ChanceCardId.CC_FRANCHISE];

      expect(summary).toBeDefined();
      expect(summary).toContain('800 Tr.');
      expect(summary).not.toContain('1.200 Tr.');
    });

    it('[TC-IMP181.20/MSS][UC-GAME-038..041] PUNCHY_EVENT_SUMMARIES[CC_LAND_RECLAIM] phải chứa 150% (KHÔNG ĐƯỢC chứa 2.000)', () => {
      const summary = PUNCHY_EVENT_SUMMARIES[ChanceCardId.CC_LAND_RECLAIM];

      expect(summary).toBeDefined();
      expect(summary).toContain('150%');
      expect(summary).not.toContain('2.000');
    });

    it('[TC-IMP181.21/MSS][UC-GAME-038..041] PUNCHY_EVENT_SUMMARIES[CC_MEDIA_CRISIS] phải chứa 800 Tr. (KHÔNG ĐƯỢC chứa 700)', () => {
      const summary = PUNCHY_EVENT_SUMMARIES[ChanceCardId.CC_MEDIA_CRISIS];

      expect(summary).toBeDefined();
      expect(summary).toContain('800 Tr.');
      expect(summary).not.toContain('700');
    });
  });
});
