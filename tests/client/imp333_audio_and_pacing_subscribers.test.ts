// [IMP-333] Living Contract Tests: Audio & Pacing Presentation Subscribers
// Protocol: Station 1 Contract RED Testing
// Universal 5-Facet Behavioral Matrix & Anti-TIDD Boundary

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createAudioEventSubscriber,
} from '../../src/client/events/subscribers/audio_event_subscriber.js';
import {
  createDefaultPacingContext,
  type PacingContext,
} from '../../src/client/events/pacing_context.js';
import {
  getGlobalGameEventBus,
  registerDefaultSubscribers,
  clearGameEventListeners,
  type GameEventContext,
} from '../../src/client/events/game_event_bus.js';
import {
  SynthesizedGameEventType,
  type RentPaidEvent,
  type PortSplitRentEvent,
} from '../../src/client/events/game_event_types.js';
import {
  useGameStore,
  type GameState,
  type PlayerHudInfo,
} from '../../src/client/store/game_store.js';
import { SoundEngine } from '../../src/client/audio/sound_engine.js';
import { purgeClientMatchSession } from '../../src/client/network/client_session_purger.js';
import { applyDeltaToStore } from '../../src/client/network/apply_delta.js';
import { TurnPhase } from '../../src/domain/room.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';

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
    p3: createMockPlayer({ id: 'p3', name: 'Player 3', balance: 5000, tokenColor: '#10B981' }),
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
    playerPositions: { p1: 0, p2: 5, p3: 10 },
    playersInfo,
    roundNumber: 1,
    treasuryPool: 10000,
    turnPhase: TurnPhase.ActionPhase,
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

describe('Station 1 Contract Tests: Audio & Pacing Presentation Subscribers (IMP-333)', () => {
  beforeEach(() => {
    useGameStore.setState({
      floatingTexts: [],
      isRolling: false,
      pendingPawnMove: null,
      activePawnAnimation: null,
      pawnAnimationQueue: [],
      playersInfo: {
        p1: createMockPlayer({ id: 'p1', name: 'Player 1' }),
        p2: createMockPlayer({ id: 'p2', name: 'Player 2' }),
        p3: createMockPlayer({ id: 'p3', name: 'Player 3' }),
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    clearGameEventListeners();
  });

  it('TC-333.07 [UC-AUDIO/MSS] Given RENT_PAID, When audio subscriber executes, Then triggers SoundEngine.playSlumpThud for payer and SoundEngine.playVictoryChime for receiver', () => {
    const slumpSpy = vi.spyOn(SoundEngine, 'playSlumpThud').mockImplementation(() => {});
    const chimeSpy = vi.spyOn(SoundEngine, 'playVictoryChime').mockImplementation(() => {});
    const context = createMockEventContext();
    const subscriber = createAudioEventSubscriber(SoundEngine, synchronousPacing);
    const rentEvent: RentPaidEvent = {
      type: SynthesizedGameEventType.RENT_PAID,
      payerId: 'p1',
      receiverId: 'p2',
      cellIndex: 6,
      amount: 500,
      timestamp: 1000,
    };

    subscriber([rentEvent], context);

    expect(slumpSpy).toHaveBeenCalledTimes(1);
    expect(chimeSpy).toHaveBeenCalledTimes(1);
  });

  it('TC-333.08 [UC-AUDIO/A1] Given rapid duplicate cues or PORT_SPLIT_RENT, When audio subscriber executes, Then throttles identical audio cues to prevent clipping', () => {
    const chimeSpy = vi.spyOn(SoundEngine, 'playVictoryChime').mockImplementation(() => {});
    const context = createMockEventContext();
    const subscriber = createAudioEventSubscriber(SoundEngine, synchronousPacing, { throttleMs: 150 });
    const portEvent: PortSplitRentEvent = {
      type: SynthesizedGameEventType.PORT_SPLIT_RENT,
      payerId: 'p1',
      receiverIds: ['p2', 'p3'],
      cellIndex: 12,
      totalAmount: 600,
      amountPerReceiver: 300,
      timestamp: 1000,
    };

    subscriber([portEvent], context);

    expect(chimeSpy).toHaveBeenCalledTimes(1);
  });

  it('TC-333.09 [UC-AUDIO/A2] Given an audio playback error in SoundEngine, When audio subscriber executes, Then the error is caught and isolated without interrupting other subscribers', () => {
    vi.spyOn(SoundEngine, 'playSlumpThud').mockImplementation(() => {
      throw new Error('WebAudio Context AudioBuffer failure');
    });
    const chimeSpy = vi.spyOn(SoundEngine, 'playVictoryChime').mockImplementation(() => {});
    const context = createMockEventContext();
    const subscriber = createAudioEventSubscriber(SoundEngine, synchronousPacing);
    const rentEvent: RentPaidEvent = {
      type: SynthesizedGameEventType.RENT_PAID,
      payerId: 'p1',
      receiverId: 'p2',
      cellIndex: 6,
      amount: 500,
      timestamp: 1000,
    };

    expect(() => subscriber([rentEvent], context)).not.toThrow();
    expect(chimeSpy).toHaveBeenCalledTimes(1);
  });

  it('TC-333.10 [UC-PACE/A3] Given PacingContext adapter, When queried for landing or pass-GO delays, Then correctly calculates duration from config or falls back safely to 0', () => {
    useGameStore.setState({
      pendingPawnMove: {
        playerId: 'p1',
        targetCell: 5,
        fromCell: 0,
        isBot: false,
      },
      isRolling: true,
    });

    const pacing = createDefaultPacingContext(useGameStore);

    const p1LandingDelay = pacing.getPawnLandingDelay('p1');
    const p2LandingDelay = pacing.getPawnLandingDelay('p2');
    const unknownLandingDelay = pacing.getPawnLandingDelay(undefined);

    expect(p1LandingDelay).toBe(2350);
    expect(p2LandingDelay).toBe(0);
    expect(unknownLandingDelay).toBe(0);
  });

  it('TC-333.11 [UC-CLEAN/A4] Given registerDefaultSubscribers, When called, Then registers activity_log, badge_presentation, and audio_presentation subscribers; clearGameEventListeners removes all', () => {
    clearGameEventListeners();
    registerDefaultSubscribers();
    const bus = getGlobalGameEventBus();

    expect(bus.hasSubscriber('activity_log')).toBe(true);
    expect(bus.hasSubscriber('badge_presentation')).toBe(true);
    expect(bus.hasSubscriber('audio_presentation')).toBe(true);

    clearGameEventListeners();
    expect(bus.getListenerCount()).toBe(0);
  });

  it('TC-333.14 [UC-PURGE/A5] Given pending pacing timers, When purgeClientMatchSession runs, Then clears all pending timers preventing cross-match leakage', () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const pacing = createDefaultPacingContext(useGameStore);

    pacing.scheduleAction(callback, 500);
    purgeClientMatchSession();
    vi.advanceTimersByTime(600);

    expect(callback).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('TC-333.15 [UC-INT/A6] Given applyDeltaToStore receiving rent and salary delta, When executed, Then triggers both visual floating badges and audio effects without duplicate badges from legacy tracker', () => {
    vi.useFakeTimers();
    clearGameEventListeners();
    registerDefaultSubscribers();
    const chimeSpy = vi.spyOn(SoundEngine, 'playVictoryChime').mockImplementation(() => {});

    useGameStore.setState({
      floatingTexts: [],
      playerPositions: { p1: 38 },
      playersInfo: {
        p1: createMockPlayer({ id: 'p1', name: 'Player 1', balance: 5000 }),
        p2: createMockPlayer({ id: 'p2', name: 'Player 2', balance: 5000, ownedProperties: [1] }),
      },
    });

    const delta: DeltaPayload = {
      tick: 10,
      cells: [],
      players: [
        { id: 'p1', position: 2, balance: 7000 },
      ],
    };

    applyDeltaToStore(delta);
    vi.advanceTimersByTime(1000);

    const texts = useGameStore.getState().floatingTexts;
    const salaryBadges = texts.filter((t) => t.actionType === 'salary');

    expect(salaryBadges.length).toBe(1);
    expect(chimeSpy).toHaveBeenCalled();
    vi.useRealTimers();
  });


  it('TC-333.16 [UC-THROTTLE/A7] Given simultaneous playSlumpThud and playVictoryChime requests within 50ms, When audio subscriber executes, Then both distinct sound effects are played without cross-suppression', () => {
    const slumpSpy = vi.spyOn(SoundEngine, 'playSlumpThud').mockImplementation(() => {});
    const chimeSpy = vi.spyOn(SoundEngine, 'playVictoryChime').mockImplementation(() => {});
    const context = createMockEventContext();
    const subscriber = createAudioEventSubscriber(SoundEngine, synchronousPacing, { throttleMs: 150 });
    const rentEvent: RentPaidEvent = {
      type: SynthesizedGameEventType.RENT_PAID,
      payerId: 'p1',
      receiverId: 'p2',
      cellIndex: 6,
      amount: 500,
      timestamp: 1000,
    };

    subscriber([rentEvent], context);

    expect(slumpSpy).toHaveBeenCalledTimes(1);
    expect(chimeSpy).toHaveBeenCalledTimes(1);
  });
});
