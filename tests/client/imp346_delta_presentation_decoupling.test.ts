// [IMP-346] Living Contract Tests: Presentation Subscribers Expansion & Delta Decoupling
// Protocol: Station 1 Contract RED Testing
// Universal 5-Facet Behavioral Matrix & Anti-TIDD Boundary

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createAudioEventSubscriber } from '../../src/client/events/subscribers/audio_event_subscriber.js';
import { createBadgeEventSubscriber } from '../../src/client/events/subscribers/badge_event_subscriber.js';
import { SoundEngine } from '../../src/client/audio/sound_engine.js';
import { useGameStore, type GameState, type PlayerHudInfo } from '../../src/client/store/game_store.js';
import { useLobbyStore } from '../../src/client/store/lobby_store.js';
import { clearGameEventListeners, getGlobalGameEventBus, type GameEventContext } from '../../src/client/events/game_event_bus.js';
import {
  SynthesizedGameEventType,
  type EventCardDrawnEvent,
  type TransitWheelLandedEvent,
} from '../../src/client/events/game_event_types.js';
import { TransitWheelOutcome } from '../../src/domain/transit_wheel.js';
import { applyDeltaToStore } from '../../src/client/network/apply_delta.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';
import type { PacingContext } from '../../src/client/events/pacing_context.js';

function createMockPlayer(overrides: Partial<PlayerHudInfo> & { id: string }): PlayerHudInfo {
  return {
    name: overrides.id.toUpperCase(),
    balance: 5000,
    tokenColor: '#38BDF8',
    isBot: false,
    ownedProperties: [],
    mortgagedProperties: [],
    ...overrides,
  };
}

function createMockGameState(
  overrides?: Omit<Partial<GameState>, 'playersInfo'> & {
    playersInfo?: Record<string, Partial<PlayerHudInfo>>;
  },
): GameState {
  const base = useGameStore.getState();
  const defaultPlayers: Record<string, PlayerHudInfo> = {
    p1: createMockPlayer({ id: 'p1', name: 'Player 1', balance: 5000, tokenColor: '#38BDF8' }),
    p2: createMockPlayer({ id: 'p2', name: 'Player 2', balance: 5000, tokenColor: '#F59E0B' }),
  };

  let playersInfo = defaultPlayers;
  if (overrides?.playersInfo) {
    const merged: Record<string, PlayerHudInfo> = { ...defaultPlayers };
    for (const [id, p] of Object.entries(overrides.playersInfo)) {
      merged[id] = createMockPlayer({ id, ...p });
    }
    playersInfo = merged;
  }

  const { playersInfo: _, ...restOverrides } = overrides ?? {};

  return {
    ...base,
    playerPositions: { p1: 0, p2: 5 },
    playersInfo,
    ...restOverrides,
  };
}

function createMockEventContext(
  prevOverrides?: Parameters<typeof createMockGameState>[0],
  nextOverrides?: Parameters<typeof createMockGameState>[0],
  deltaOverrides?: Partial<DeltaPayload>,
): GameEventContext {
  const prevState = createMockGameState(prevOverrides);
  const nextState = createMockGameState(nextOverrides);
  const delta: DeltaPayload = {
    roomCode: 'TEST_ROOM',
    tick: 2,
    cells: [],
    ...deltaOverrides,
  };
  return { prevState, nextState, delta };
}

const synchronousPacing: PacingContext = {
  getPawnLandingDelay: () => 0,
  getPawnPassGoDelay: () => 0,
  scheduleAction: (action) => {
    action();
    return null;
  },
  clearPendingTimers: () => {},
};

describe('Station 1 Contract Tests: Presentation Subscribers Expansion & Delta Decoupling (IMP-346)', () => {
  beforeEach(() => {
    useGameStore.setState({
      floatingTexts: [],
      isRolling: false,
      lastEventCard: null,
      playersInfo: {
        p1: createMockPlayer({ id: 'p1', name: 'Player 1' }),
        p2: createMockPlayer({ id: 'p2', name: 'Player 2', isBot: true }),
      },
    });
    useLobbyStore.setState({
      myPlayerId: 'p1',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    clearGameEventListeners();
  });

  it('TC-346.01 [UC-AUDIO/MSS] Given synthesized EVENT_CARD_DRAWN event, When listener in createAudioEventSubscriber executes, Then triggers card flip sound via injected soundEngine', () => {
    const cardSpy = vi.spyOn(SoundEngine, 'playCardFlip').mockImplementation(() => {});
    const subscriber = createAudioEventSubscriber(SoundEngine, synchronousPacing);
    const context = createMockEventContext();
    const event: EventCardDrawnEvent = {
      type: SynthesizedGameEventType.EVENT_CARD_DRAWN,
      playerId: 'p1',
      cardId: 'CC_SURPRISE',
      cardType: 'chance',
      title: 'Thẻ cơ hội bất ngờ',
      description: 'Nhận thưởng 500',
      effectDelta: 500,
      timestamp: 1000,
    };

    subscriber([event], context);

    expect(cardSpy).toHaveBeenCalledTimes(1);
  });

  it('TC-346.02 [UC-AUDIO/A1] Given synthesized TRANSIT_WHEEL_LANDED with FLIGHT_DELAY, When listener in createAudioEventSubscriber executes, Then triggers slump thud sound via injected soundEngine', () => {
    const slumpSpy = vi.spyOn(SoundEngine, 'playSlumpThud').mockImplementation(() => {});
    const subscriber = createAudioEventSubscriber(SoundEngine, synchronousPacing);
    const context = createMockEventContext();
    const event: TransitWheelLandedEvent = {
      type: SynthesizedGameEventType.TRANSIT_WHEEL_LANDED,
      playerId: 'p1',
      cellIndex: 5,
      outcome: TransitWheelOutcome.FLIGHT_DELAY,
      timestamp: 1000,
    };

    subscriber([event], context);

    expect(slumpSpy).toHaveBeenCalledTimes(1);
  });

  it('TC-346.03 [UC-AUDIO/A2] Given synthesized TRANSIT_WHEEL_LANDED with SPEED_BOOST, When listener in createAudioEventSubscriber executes, Then triggers victory chime sound via injected soundEngine', () => {
    const chimeSpy = vi.spyOn(SoundEngine, 'playVictoryChime').mockImplementation(() => {});
    const subscriber = createAudioEventSubscriber(SoundEngine, synchronousPacing);
    const context = createMockEventContext();
    const event: TransitWheelLandedEvent = {
      type: SynthesizedGameEventType.TRANSIT_WHEEL_LANDED,
      playerId: 'p1',
      cellIndex: 5,
      outcome: TransitWheelOutcome.SPEED_BOOST,
      boostSteps: 3,
      timestamp: 1000,
    };

    subscriber([event], context);

    expect(chimeSpy).toHaveBeenCalledTimes(1);
  });

  it('TC-346.04 [UC-BADGE/MSS] Given synthesized EVENT_CARD_DRAWN event for human player with personal card, When createBadgeEventSubscriber listener executes, Then adds 4800ms FloatingText notification', () => {
    useLobbyStore.setState({ myPlayerId: 'p1' });
    const subscriber = createBadgeEventSubscriber(useGameStore, synchronousPacing);
    const context = createMockEventContext();
    const event: EventCardDrawnEvent = {
      type: SynthesizedGameEventType.EVENT_CARD_DRAWN,
      playerId: 'p1',
      cardId: 'CC_PERSONAL_BONUS',
      cardType: 'chance',
      title: 'Thưởng cá nhân',
      description: 'Nhận 300',
      effectDelta: 300,
      timestamp: 1000,
    };

    subscriber([event], context);

    const items = useGameStore.getState().floatingTexts;
    expect(items).toHaveLength(1);
    expect(items[0]?.durationMs).toBe(4800);
    expect(items[0]?.title).toBe('Thưởng cá nhân');
  });

  it('TC-346.05 [UC-BADGE/A1] Given synthesized EVENT_CARD_DRAWN event for bot player, When createBadgeEventSubscriber listener executes, Then yields to syncEventCard to avoid duplicate toasts', () => {
    useLobbyStore.setState({ myPlayerId: 'p1' });
    const subscriber = createBadgeEventSubscriber(useGameStore, synchronousPacing);
    const context = createMockEventContext();
    const event: EventCardDrawnEvent = {
      type: SynthesizedGameEventType.EVENT_CARD_DRAWN,
      playerId: 'p2',
      cardId: 'CC_SURPRISE',
      cardType: 'chance',
      title: 'Thẻ cơ hội bất ngờ',
      description: 'Nhận thưởng 500',
      effectDelta: 500,
      timestamp: 1000,
    };

    subscriber([event], context);

    const items = useGameStore.getState().floatingTexts;
    expect(items).toHaveLength(0);
  });

  it('TC-346.06 [UC-BADGE/A2] Given synthesized EVENT_CARD_DRAWN event for board-wide card, When createBadgeEventSubscriber listener executes, Then yields to syncEventCard to avoid duplicate banners', () => {
    useLobbyStore.setState({ myPlayerId: 'p1' });
    const subscriber = createBadgeEventSubscriber(useGameStore, synchronousPacing);
    const context = createMockEventContext();
    const event: EventCardDrawnEvent = {
      type: SynthesizedGameEventType.EVENT_CARD_DRAWN,
      playerId: 'p1',
      cardId: 'MC_MEGA_CONCERT',
      cardType: 'market',
      title: 'Đại Nhạc Hội',
      description: 'Tất cả người chơi trả phí vé',
      effectDelta: -200,
      timestamp: 1000,
    };

    subscriber([event], context);

    const items = useGameStore.getState().floatingTexts;
    expect(items).toHaveLength(0);
  });

  it('TC-346.07 [UC-BADGE/A3] Given synthesized TRANSIT_WHEEL_LANDED event, When createBadgeEventSubscriber listener executes, Then adds transit FloatingText formatted via formatTransitWheelBroadcast', () => {
    const subscriber = createBadgeEventSubscriber(useGameStore, synchronousPacing);
    const context = createMockEventContext();
    const event: TransitWheelLandedEvent = {
      type: SynthesizedGameEventType.TRANSIT_WHEEL_LANDED,
      playerId: 'p1',
      cellIndex: 5,
      outcome: TransitWheelOutcome.CASH_BACK,
      payout: 500,
      timestamp: 1000,
    };

    subscriber([event], context);

    const items = useGameStore.getState().floatingTexts;
    expect(items).toHaveLength(1);
    expect(items[0]?.actionType).toBe('transit');
    expect(items[0]?.title).toBe('VÒNG XOAY VẬN TẢI');
    expect(items[0]?.text).toContain('500');
  });

  it('TC-346.08 [UC-DECOUPLE/MSS] Given DeltaPayload with dice and card events, When calling applyDeltaToStore, Then dispatches synthesized events through GameEventBus without legacy tracking', () => {
    let capturedEventsCount = 0;
    const unsubscribe = getGlobalGameEventBus().registerSubscriber('test_tc346', (events) => {
      capturedEventsCount += events.length;
    });

    useGameStore.setState({
      lastEventCard: null,
      floatingTexts: [],
    });

    const delta: DeltaPayload = {
      roomCode: 'TEST_ROOM',
      tick: 3,
      cells: [],
      lastEventCard: {
        id: 'MC_MEGA_CONCERT',
        type: 'Market',
        cardId: 'MC_MEGA_CONCERT',
        cardType: 'market',
        title: 'Đại Nhạc Hội',
        description: 'Tất cả trả phí',
        drawnBy: 'p1',
      },
    };

    applyDeltaToStore(delta);
    unsubscribe();

    expect(capturedEventsCount).toBeGreaterThanOrEqual(1);
    expect(useGameStore.getState().lastEventCard?.cardId).toBe('MC_MEGA_CONCERT');
  });
});
