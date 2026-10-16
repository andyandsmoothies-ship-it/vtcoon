// [CONTRACT TEST] IMP-422: Client Network Subscribers & Event Bus Zero-Cycle Suite
// Traceability: [TC-422.01..TC-422.06] & [UC-IMP422/MSS]
// Universal 5-Facet Behavioral Matrix & Anti-TIDD SSOT Enforcement
// Strict Invariants: 1-4 assertions/test, zero loops in it(), zero un-typed escape hatches

import path from 'node:path';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { detectCycles } from '../../scripts/boundary_linter/boundary_rules.mjs';
import { getSourceFiles } from '../../scripts/slop_linter/slop_constants.mjs';

import {
  ROOM_CODE_REGEX,
  generateRandomRoomCode,
  createNewRoomConfig,
  getInitialLobbyConfig,
} from '../../src/client/network/room_config_helpers.js';

import {
  BOARD_WIDE_CARDS,
  isBoardWideCard,
} from '../../src/client/events/event_card_constants.js';

import {
  markTradeOfferResolved,
  resetTradeOfferResolutions,
} from '../../src/client/network/trade_offer_tracker.js';

import { purgeClientMatchSession } from '../../src/client/network/client_session_purger.js';
import { applyDeltaToStore } from '../../src/client/network/apply_delta.js';
import { GameEventBus } from '../../src/client/events/game_event_bus.js';
import type { GameEventContext } from '../../src/client/events/game_event_bus_types.js';
import {
  SynthesizedGameEventType,
  type SynthesizedGameEvent,
  type EventCardDrawnEvent,
} from '../../src/client/events/game_event_types.js';
import { handleMarketBadges } from '../../src/client/events/subscribers/property_market_badge_handler.js';
import {
  trackDeltaActivities,
  resetEventCardActivityTracker,
  type TrackDeltaActivitiesOptions,
} from '../../src/client/network/activity_tracker.js';

import { useGameStore, type GameState } from '../../src/client/store/game_store.js';
import { useLobbyStore } from '../../src/client/store/lobby_store.js';
import { useVfxStore } from '../../src/client/store/vfx_store.js';
import { useActivityStore } from '../../src/client/store/activity_store.js';
import type { DeltaPayload } from '../../src/domain/protocol/index.js';

const REPO_ROOT = process.cwd();

interface Imp422TrackDeltaOptions extends TrackDeltaActivitiesOptions {
  readonly myPlayerId?: string;
}

// Helper outside it() to safely populate trade offer sentinel without in-test loops
function populateOffers(prefix: string, count: number): string[] {
  if (count <= 0) return [];
  const ids: string[] = [];
  for (let i = 0; i < count; i++) {
    const id = `${prefix}_${i}`;
    ids.push(id);
    markTradeOfferResolved(id);
  }
  return ids;
}

describe('[IMP-422] Client Network Subscribers & Event Bus Zero-Cycle Suite', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetTradeOfferResolutions();
    resetEventCardActivityTracker();
    useActivityStore.getState().clearLogs();
    useGameStore.getState().resetGameState();
    useLobbyStore.setState({ myPlayerId: 'p1' });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // =========================================================================
  // FACET 1: Boundary & Range (TC-422.01, TC-422.02)
  // =========================================================================
  it('[TC-422.01a/MSS][UC-IMP422/MSS] Given all TypeScript files in src/client, Tarjan SCC cycle detection proves zero multi-file circular components', () => {
    const clientFiles: string[] = getSourceFiles(path.resolve(REPO_ROOT, 'src/client'));
    const cycles: string[][] = detectCycles(clientFiles, REPO_ROOT);

    expect(clientFiles.length).toBeGreaterThan(50);
    expect(cycles.length).toBe(0);
  });

  it('[TC-422.01b/MSS][UC-IMP422/MSS] Given event_card_constants, verifies 21 board-wide card identifiers and predicate resolution', () => {
    expect(BOARD_WIDE_CARDS.size).toBe(21);
    expect(isBoardWideCard('MC_MEGA_CONCERT')).toBe(true);
    expect(isBoardWideCard('CC_FRANCHISE')).toBe(true);
    expect(isBoardWideCard('CC_TARGETED_GRANT')).toBe(false);
  });

  it('[TC-422.02a/MSS][UC-IMP422/MSS] Given generateRandomRoomCode, generates valid 6-character uppercase codes starting with VT', () => {
    const code = generateRandomRoomCode();

    expect(code.length).toBe(6);
    expect(code.startsWith('VT')).toBe(true);
    expect(ROOM_CODE_REGEX.test(code)).toBe(true);
  });

  it('[TC-422.02b/MSS][UC-IMP422/MSS] Given createNewRoomConfig(true), initializes host configuration bound to playerId p1', () => {
    const hostConfig = createNewRoomConfig(true);

    expect(hostConfig.isHost).toBe(true);
    expect(hostConfig.playerId).toBe('p1');
    expect(hostConfig.roomCode.startsWith('VT')).toBe(true);
    expect(hostConfig.playerName.length).toBeGreaterThan(0);
  });

  it('[TC-422.02c/MSS][UC-IMP422/MSS] Given createNewRoomConfig(false), initializes guest configuration bound to playerId p2', () => {
    const guestConfig = createNewRoomConfig(false);

    expect(guestConfig.isHost).toBe(false);
    expect(guestConfig.playerId).toBe('p2');
    expect(guestConfig.roomCode.startsWith('VT')).toBe(true);
    expect(guestConfig.playerName.length).toBeGreaterThan(0);
  });

  it('[TC-422.02d/MSS][UC-IMP422/MSS] Given getInitialLobbyConfig with admin URL parameter, sets admin room code and credentials', () => {
    const adminConfig = getInitialLobbyConfig('?admin=true');

    expect(adminConfig.roomCode).toBe('VTADMN');
    expect(adminConfig.playerId).toBe('admin');
    expect(adminConfig.isHost).toBe(false);
    expect(adminConfig.playerName).toBe('Admin');
  });

  it('[TC-422.02e/MSS][UC-IMP422/MSS] Given getInitialLobbyConfig with room and host parameters, parses stored room and p1 host', () => {
    const queryConfig = getInitialLobbyConfig('?room=VTHOST&host=true');

    expect(queryConfig.roomCode).toBe('VTHOST');
    expect(queryConfig.playerId).toBe('p1');
    expect(queryConfig.isHost).toBe(true);
    expect(queryConfig.playerName.length).toBeGreaterThan(0);
  });

  // =========================================================================
  // FACET 2: State Reactivity & Event Bus DAG Dispatch (TC-422.03)
  // =========================================================================
  it('[TC-422.03a/MSS][UC-IMP422/MSS] Given GameEventBus instance, dispatches events delivering context.myPlayerId to registered listeners', () => {
    const bus = new GameEventBus();
    let deliveredPlayerId: string | undefined = undefined;

    bus.registerSubscriber('audit_sub', (_events, context) => {
      deliveredPlayerId = context.myPlayerId;
    });

    const event: EventCardDrawnEvent = {
      type: SynthesizedGameEventType.EVENT_CARD_DRAWN,
      playerId: 'p2',
      cardId: 'MC_MARKET_SURGE',
      cardType: 'market',
      title: 'Thị Trường Khởi Sắc',
      description: 'Gia tăng tài sản',
      timestamp: 1000,
    };

    const context: GameEventContext = {
      prevState: useGameStore.getState(),
      nextState: useGameStore.getState(),
      delta: { tick: 1, cells: [] },
      myPlayerId: 'p2',
    };

    bus.dispatchGameEvents([event], context);

    expect(deliveredPlayerId).toBe('p2');
    expect(bus.getListenerCount()).toBe(1);
  });

  it('[TC-422.03b/MSS][UC-IMP422/MSS] Given GameEventBus subscriber registration, returned unregister closure cleanly removes listener', () => {
    const bus = new GameEventBus();
    let invocations = 0;

    const unregister = bus.registerSubscriber('transient_sub', () => {
      invocations++;
    });

    unregister();

    bus.dispatchGameEvents(
      [
        {
          type: SynthesizedGameEventType.DICE_ROLLED,
          playerId: 'p1',
          dice: [3, 4],
          total: 7,
          isDouble: false,
          timestamp: 1000,
        },
      ],
      {
        prevState: useGameStore.getState(),
        nextState: useGameStore.getState(),
        delta: { tick: 1, cells: [] },
      },
    );

    expect(invocations).toBe(0);
    expect(bus.hasSubscriber('transient_sub')).toBe(false);
  });

  it('[TC-422.03c/MSS][UC-IMP422/MSS] Given GameEventBus with multiple listeners, isolates throwing subscriber error so others execute', () => {
    const bus = new GameEventBus();
    let survivorExecuted = false;

    bus.registerSubscriber('faulty_sub', () => {
      throw new Error('Poison subscriber failure');
    });
    bus.registerSubscriber('healthy_sub', () => {
      survivorExecuted = true;
    });

    bus.dispatchGameEvents(
      [
        {
          type: SynthesizedGameEventType.DICE_ROLLED,
          playerId: 'p1',
          dice: [1, 2],
          total: 3,
          isDouble: false,
          timestamp: 1000,
        },
      ],
      {
        prevState: useGameStore.getState(),
        nextState: useGameStore.getState(),
        delta: { tick: 1, cells: [] },
      },
    );

    expect(survivorExecuted).toBe(true);
    expect(bus.getListenerCount()).toBe(2);
  });

  // =========================================================================
  // FACET 3: Resource Disposal & FIFO Sentinel Isolation (TC-422.05)
  // =========================================================================
  it('[TC-422.05a/MSS][UC-IMP422/MSS] Given markTradeOfferResolved, returns true on initial registration and false on duplicate offerId', () => {
    const isNew = markTradeOfferResolved('offer_imp422_01');
    const isDuplicate = markTradeOfferResolved('offer_imp422_01');

    expect(isNew).toBe(true);
    expect(isDuplicate).toBe(false);
  });

  it('[TC-422.05b/MSS][UC-IMP422/MSS] Given resetTradeOfferResolutions, clears recorded offer registry and permits re-registration', () => {
    markTradeOfferResolved('offer_imp422_02');
    resetTradeOfferResolutions();
    const canReRegister = markTradeOfferResolved('offer_imp422_02');

    expect(canReRegister).toBe(true);
  });

  it('[TC-422.05c/MSS][UC-IMP422/MSS] Given purgeClientMatchSession, invokes resetTradeOfferResolutions to clear trade offer registry', () => {
    markTradeOfferResolved('offer_imp422_purge');
    purgeClientMatchSession({ clearGameStore: false });
    const isAvailableAfterPurge = markTradeOfferResolved('offer_imp422_purge');

    expect(isAvailableAfterPurge).toBe(true);
  });

  it('[TC-422.05d/MSS][UC-IMP422/MSS] Given trade offer sentinel at 100 capacity, evicts oldest entry when 101st offer is recorded', () => {
    populateOffers('fifo_track', 100);
    const added101 = markTradeOfferResolved('fifo_track_100');
    const oldestReRegistered = markTradeOfferResolved('fifo_track_0');

    expect(added101).toBe(true);
    expect(oldestReRegistered).toBe(true);
  });

  // =========================================================================
  // FACET 4: Error Defense & Player Identity Attribution (TC-422.04)
  // =========================================================================
  it('[TC-422.04a/MSS][UC-IMP422/MSS] Given EVENT_CARD_DRAWN for guest p2, handleMarketBadges adds floating text badge using context.myPlayerId', () => {
    useLobbyStore.setState({ myPlayerId: 'p1' });
    const event: SynthesizedGameEvent = {
      type: SynthesizedGameEventType.EVENT_CARD_DRAWN,
      playerId: 'p2',
      cardId: 'MC_LOCAL_BOOST',
      cardType: 'market',
      title: 'Kích Cầu Đô Thị',
      description: 'Nhận trợ cấp xây dựng',
      effectDelta: 200,
      timestamp: 1000,
    };

    const context: GameEventContext = {
      prevState: useGameStore.getState(),
      nextState: useGameStore.getState(),
      delta: { tick: 1, cells: [] },
      myPlayerId: 'p2',
    };

    handleMarketBadges(event, context, useGameStore.getState(), useVfxStore);
    const badges = useGameStore.getState().floatingTexts;

    expect(badges.length).toBe(1);
    expect(badges[0]?.playerId).toBe('p2');
    expect(badges[0]?.title).toBe('Kích Cầu Đô Thị');
  });

  it('[TC-422.04b/MSS][UC-IMP422/MSS] Given EVENT_CARD_DRAWN for bot player, handleMarketBadges suppresses badge for non-board-wide card', () => {
    useLobbyStore.setState({ myPlayerId: 'p1' });
    const event: SynthesizedGameEvent = {
      type: SynthesizedGameEventType.EVENT_CARD_DRAWN,
      playerId: 'bot_fox',
      cardId: 'MC_LOCAL_BOOST',
      cardType: 'market',
      title: 'Kích Cầu Đô Thị',
      description: 'Nhận trợ cấp',
      effectDelta: 200,
      timestamp: 1000,
    };

    const context: GameEventContext = {
      prevState: useGameStore.getState(),
      nextState: useGameStore.getState(),
      delta: { tick: 1, cells: [] },
      myPlayerId: 'p2',
    };

    handleMarketBadges(event, context, useGameStore.getState(), useVfxStore);
    const badges = useGameStore.getState().floatingTexts;

    expect(badges.length).toBe(0);
  });

  it('[TC-422.04c/MSS][UC-IMP422/MSS] Given EVENT_CARD_DRAWN for board-wide card, handleMarketBadges suppresses individual badge display', () => {
    useLobbyStore.setState({ myPlayerId: 'p1' });
    const event: SynthesizedGameEvent = {
      type: SynthesizedGameEventType.EVENT_CARD_DRAWN,
      playerId: 'p2',
      cardId: 'MC_MEGA_CONCERT',
      cardType: 'market',
      title: 'Đại Nhạc Hội',
      description: 'Sự kiện toàn thành phố',
      effectDelta: 500,
      timestamp: 1000,
    };

    const context: GameEventContext = {
      prevState: useGameStore.getState(),
      nextState: useGameStore.getState(),
      delta: { tick: 1, cells: [] },
      myPlayerId: 'p2',
    };

    handleMarketBadges(event, context, useGameStore.getState(), useVfxStore);
    const badges = useGameStore.getState().floatingTexts;

    expect(badges.length).toBe(0);
  });

  it('[TC-422.04d/MSS][UC-IMP422/MSS] Given applyDeltaToStore with event card for guest p2, wires myPlayerId through GameEventContext to generate floating badge', () => {
    useLobbyStore.setState({ myPlayerId: 'p2' });
    useGameStore.getState().resetGameState();
    const delta: DeltaPayload = {
      tick: 20,
      cells: [],
      lastEventCard: {
        id: 'MC_INTEGRATION_BOOST',
        cardId: 'MC_INTEGRATION_BOOST',
        type: 'Market',
        cardType: 'market',
        title: 'Kích Cầu Hội Nhập',
        description: 'Nhận trợ cấp hội nhập',
        drawnBy: 'p2',
        playerId: 'p2',
        effectDelta: 500,
      },
    };

    applyDeltaToStore(delta, useGameStore);
    const badges = useGameStore.getState().floatingTexts;

    expect(badges.length).toBe(1);
    expect(badges[0]?.playerId).toBe('p2');
    expect(badges[0]?.title).toBe('Kích Cầu Hội Nhập');
  });

  // =========================================================================
  // FACET 5: Cross-Coupling Blast Radius & Options Seam (TC-422.06)
  // =========================================================================
  it('[TC-422.06a/MSS][UC-IMP422/MSS] Given event card delta and options.myPlayerId = p2, trackDeltaActivities creates badge for guest p2', () => {
    useLobbyStore.setState({ myPlayerId: 'p1' });
    const delta: DeltaPayload = {
      tick: 10,
      cells: [],
      lastEventCard: {
        id: 'MC_INCENTIVE',
        cardId: 'MC_INCENTIVE',
        type: 'Market',
        cardType: 'market',
        title: 'Gói Kích Thích Kinh Tế',
        description: 'Tăng thu nhập',
        drawnBy: 'p2',
        effectDelta: 200,
      },
    };

    const options: Imp422TrackDeltaOptions = {
      myPlayerId: 'p2',
    };

    const currentState: GameState = useGameStore.getState();
    trackDeltaActivities(delta, currentState, currentState, useActivityStore, options);
    const badges = useGameStore.getState().floatingTexts;

    expect(badges.length).toBe(1);
    expect(badges[0]?.playerId).toBe('p2');
    expect(badges[0]?.actionType).toBe('market');
  });

  it('[TC-422.06b/MSS][UC-IMP422/MSS] Given event card delta for bot player, trackDeltaActivities suppresses badge when options.myPlayerId is p2', () => {
    useLobbyStore.setState({ myPlayerId: 'p1' });
    const delta: DeltaPayload = {
      tick: 11,
      cells: [],
      lastEventCard: {
        id: 'MC_INCENTIVE',
        cardId: 'MC_INCENTIVE',
        type: 'Market',
        cardType: 'market',
        title: 'Gói Kích Thích Kinh Tế',
        description: 'Tăng thu nhập',
        drawnBy: 'bot_wolf',
        effectDelta: 200,
      },
    };

    const options: Imp422TrackDeltaOptions = {
      myPlayerId: 'p2',
    };

    const currentState: GameState = useGameStore.getState();
    trackDeltaActivities(delta, currentState, currentState, useActivityStore, options);
    const badges = useGameStore.getState().floatingTexts;

    expect(badges.length).toBe(0);
  });

  it('[TC-422.06c/MSS][UC-IMP422/MSS] Given event card delta, trackDeltaActivities records activity log entry for guest p2', () => {
    useLobbyStore.setState({ myPlayerId: 'p1' });
    const delta: DeltaPayload = {
      tick: 12,
      cells: [],
      lastEventCard: {
        id: 'MC_LOG_INSPECT',
        cardId: 'MC_LOG_INSPECT',
        type: 'Market',
        cardType: 'market',
        title: 'Kiểm Tra Sổ Sách',
        description: 'Ghi nhận vào nhật ký',
        drawnBy: 'p2',
      },
    };

    const options: Imp422TrackDeltaOptions = {
      myPlayerId: 'p2',
    };

    const currentState: GameState = useGameStore.getState();
    trackDeltaActivities(delta, currentState, currentState, useActivityStore, options);
    const logs = useActivityStore.getState().activityLogs;

    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0]?.type).toBe('card');
    expect(logs[0]?.playerId).toBe('p2');
  });
});
