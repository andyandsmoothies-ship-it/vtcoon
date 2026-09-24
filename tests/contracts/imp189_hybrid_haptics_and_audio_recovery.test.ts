// [TC-189.01/MSS..TC-189.16/MSS][UC-IMP189]
// Universal Contract Test Suite: Hybrid Haptics (Android Mechanical & iOS WebAudio Synth Click) and Audio Recovery (Safari 'interrupted' State)
// Traceability: docs/plans/improvements/IMP-189-hybrid-haptics-and-audio-recovery_plan.md & .agents/audit/PLAN_AUDIT_IMP189.md
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

if (typeof (expect as any).toBeCloseTo !== 'function') {
  (expect as any).toBeCloseTo = (expect as any).closeTo;
}

declare module 'vitest' {
  interface ExpectStatic {
    toBeCloseTo: (expected: number, numDigits?: number) => any;
  }
}

if (typeof window === 'undefined') {
  (globalThis as any).window = {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
}

const { mockHowlerCtx } = vi.hoisted(() => ({
  mockHowlerCtx: {
    state: 'suspended' as AudioContextState,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    resume: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('howler', () => ({
  Howl: class {
    play = vi.fn();
    stop = vi.fn();
    fade = vi.fn();
    volume = vi.fn();
    rate = vi.fn();
    playing = vi.fn().mockReturnValue(false);
    mute = vi.fn();
    on = vi.fn();
  },
  Howler: {
    isMuted: false,
    mute(muted: boolean): void {
      (this as any).isMuted = muted;
    },
    ctx: mockHowlerCtx,
  },
}));

import { useAudioStore } from '../../src/client/store/audio_store';
import { useLobbyStore } from '../../src/client/store/lobby_store';
import { useGameStore } from '../../src/client/store/game_store';
import { applyDeltaToStore } from '../../src/client/network/apply_delta';
import { AudioEngine } from '../../src/client/audio/audio_engine';
import { SoundEngine } from '../../src/client/audio/sound_engine';
import { Howler } from 'howler';

// ============================================================================
// DYNAMIC IMPORT HARNESS (Station 1 RED Contract Gate)
// Dynamically resolves Station 2 haptic module to assert clean Business RED
// ============================================================================
const HAPTIC_MODULE_PATH = '../../src/client/haptics/haptic_engine';

let hapticMod: any = null;
try {
  hapticMod = await import(/* @vite-ignore */ HAPTIC_MODULE_PATH);
} catch {
  try {
    hapticMod = await import(/* @vite-ignore */ `${HAPTIC_MODULE_PATH}.js`);
  } catch {
    hapticMod = null;
  }
}

export interface HapticEngineInterface {
  selection: () => void;
  diceRoll: () => void;
  turnAlert: () => void;
  heavyImpact: () => void;
  playTactileClick: (ctx?: AudioContext | null) => void;
}

const HapticEngine: HapticEngineInterface =
  hapticMod?.HapticEngine ?? {
    selection: () => {
      throw new TypeError('HapticEngine is not implemented (Station 1 RED: haptic_engine.ts pending)');
    },
    diceRoll: () => {
      throw new TypeError('HapticEngine is not implemented (Station 1 RED: haptic_engine.ts pending)');
    },
    turnAlert: () => {
      throw new TypeError('HapticEngine is not implemented (Station 1 RED: haptic_engine.ts pending)');
    },
    heavyImpact: () => {
      throw new TypeError('HapticEngine is not implemented (Station 1 RED: haptic_engine.ts pending)');
    },
    playTactileClick: () => {
      throw new TypeError('HapticEngine is not implemented (Station 1 RED: haptic_engine.ts pending)');
    },
  };

describe('[IMP-189] Hybrid Haptics & Audio Recovery Contract Suite', () => {
  const originalVibrate = typeof navigator !== 'undefined' ? (navigator as any).vibrate : undefined;

  beforeEach(() => {
    vi.restoreAllMocks();
    mockHowlerCtx.state = 'suspended';
    mockHowlerCtx.addEventListener.mockClear();
    mockHowlerCtx.resume.mockClear();
    (Howler as any).ctx = mockHowlerCtx;

    useAudioStore.setState({
      masterVolume: 0.8,
      bgmVolume: 0.6,
      sfxVolume: 0.8,
      isMuted: false,
      currentBgmTrack: null,
    });
    useLobbyStore.setState({
      myPlayerId: '',
      isHost: false,
    });
    useGameStore.setState({
      currentTurnPlayerId: undefined,
      playersInfo: {},
    });
    (AudioEngine as any).dispose?.();
    (AudioEngine as any).isInitialized = false;
    (AudioEngine as any).isRecoveryArmed = false;
  });

  afterEach(() => {
    if (typeof navigator !== 'undefined') {
      if (originalVibrate !== undefined) {
        (navigator as any).vibrate = originalVibrate;
      } else {
        delete (navigator as any).vibrate;
      }
    }
    (AudioEngine as any).dispose?.();
  });

  // ==========================================================================
  // FACET 1: Boundary & Range (Stores & Haptic Pattern Profiles)
  // ==========================================================================
  it('[TC-189.01/MSS][UC-IMP189] useAudioStore provides hapticsEnabled (default true), setHapticsEnabled, and toggleHaptics', () => {
    const state = useAudioStore.getState() as any;
    expect(state.hapticsEnabled).toBe(true);
    expect(typeof state.setHapticsEnabled).toBe('function');
    expect(typeof state.toggleHaptics).toBe('function');
  });

  it('[TC-189.03/MSS][UC-IMP189] HapticEngine.selection calls navigator.vibrate(15) when available', () => {
    const vibrateSpy = vi.fn().mockReturnValue(true);
    (navigator as any).vibrate = vibrateSpy;
    (useAudioStore.getState() as any).setHapticsEnabled?.(true);
    HapticEngine.selection();
    expect(vibrateSpy).toHaveBeenCalledWith(15);
  });

  it('[TC-189.04/MSS][UC-IMP189] HapticEngine.diceRoll calls navigator.vibrate([25, 30, 25])', () => {
    const vibrateSpy = vi.fn().mockReturnValue(true);
    (navigator as any).vibrate = vibrateSpy;
    (useAudioStore.getState() as any).setHapticsEnabled?.(true);
    HapticEngine.diceRoll();
    expect(vibrateSpy).toHaveBeenCalledWith([25, 30, 25]);
  });

  it('[TC-189.05/MSS][UC-IMP189] HapticEngine.turnAlert calls navigator.vibrate([40, 50, 40])', () => {
    const vibrateSpy = vi.fn().mockReturnValue(true);
    (navigator as any).vibrate = vibrateSpy;
    (useAudioStore.getState() as any).setHapticsEnabled?.(true);
    HapticEngine.turnAlert();
    expect(vibrateSpy).toHaveBeenCalledWith([40, 50, 40]);
  });

  it('[TC-189.06/MSS][UC-IMP189] HapticEngine.heavyImpact calls navigator.vibrate([70, 40, 110])', () => {
    const vibrateSpy = vi.fn().mockReturnValue(true);
    (navigator as any).vibrate = vibrateSpy;
    (useAudioStore.getState() as any).setHapticsEnabled?.(true);
    HapticEngine.heavyImpact();
    expect(vibrateSpy).toHaveBeenCalledWith([70, 40, 110]);
  });

  it('[TC-189.16/MSS][UC-IMP189] Physical LOC budgets adhere to hard ceilings and haptic_engine.ts exists', () => {
    const root = path.resolve(__dirname, '../../');
    const soundEnginePath = path.join(root, 'src/client/audio/sound_engine.ts');
    const actionDockPath = path.join(root, 'src/client/ui/action_dock.tsx');
    const topBarPath = path.join(root, 'src/client/ui/top_bar.tsx');
    const audioEnginePath = path.join(root, 'src/client/audio/audio_engine.ts');
    const hapticEnginePath = path.join(root, 'src/client/haptics/haptic_engine.ts');

    const soundEngineLoc = fs.readFileSync(soundEnginePath, 'utf8').split('\n').length;
    const actionDockLoc = fs.readFileSync(actionDockPath, 'utf8').split('\n').length;
    const topBarLoc = fs.readFileSync(topBarPath, 'utf8').split('\n').length;
    const audioEngineLoc = fs.readFileSync(audioEnginePath, 'utf8').split('\n').length;

    expect(soundEngineLoc).toBeLessThanOrEqual(400);
    expect(actionDockLoc).toBeLessThanOrEqual(400);
    expect(topBarLoc).toBeLessThanOrEqual(250);
    expect(audioEngineLoc).toBeLessThanOrEqual(350);

    const hapticExists = fs.existsSync(hapticEnginePath);
    expect(hapticExists).toBe(true);
  });

  // ==========================================================================
  // FACET 2: State Reactivity & Multi-Turn Teardown (Audio Interruption Recovery & iOS Click)
  // ==========================================================================
  it('[TC-189.08/MSS][UC-IMP189] HapticEngine plays 1.2kHz Synth Click ramping to positive floor 0.0001 and cleans up nodes on iOS Safari', () => {
    delete (navigator as any).vibrate;
    useAudioStore.setState({ isMuted: false, masterVolume: 1.0, sfxVolume: 1.0 });
    (useAudioStore.getState() as any).setHapticsEnabled?.(true);

    const mockOsc = {
      type: 'sine',
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      disconnect: vi.fn(),
      onended: null as (() => void) | null,
    };
    const mockGain = {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
    const mockCtx = {
      currentTime: 100,
      destination: {},
      createOscillator: vi.fn().mockReturnValue(mockOsc),
      createGain: vi.fn().mockReturnValue(mockGain),
    } as unknown as AudioContext;

    HapticEngine.playTactileClick(mockCtx);

    expect(mockOsc.frequency.setValueAtTime).toHaveBeenCalledWith(1200, 100);
    expect(mockGain.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(0.0001, expect.toBeCloseTo(100.008, 3));
    expect(mockOsc.stop).toHaveBeenCalledWith(expect.toBeCloseTo(100.01, 3));
    mockOsc.onended?.();
    expect(mockOsc.disconnect).toHaveBeenCalled();
  });

  it('[TC-189.14/MSS][UC-IMP189] AudioEngine.resumeAudioContext successfully resumes AudioContext when in interrupted state', () => {
    const resumeSpy = vi.fn().mockResolvedValue(undefined);
    const mockCtx = {
      state: 'interrupted',
      resume: resumeSpy,
    };
    (Howler as any).ctx = mockCtx;
    const soundCtxSpy = vi.spyOn(SoundEngine, 'getContext').mockReturnValue(mockCtx as any);

    AudioEngine.resumeAudioContext();

    expect(resumeSpy).toHaveBeenCalled();
    soundCtxSpy.mockRestore();
  });

  // ==========================================================================
  // FACET 3: Resource Disposal & Event Listeners
  // ==========================================================================
  it('[TC-189.13/MSS][UC-IMP189] AudioEngine binds statechange listener on AudioContext to track interruption', () => {
    const mockCtx = {
      state: 'running',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    (Howler as any).ctx = mockCtx;
    AudioEngine.init();
    expect(mockCtx.addEventListener).toHaveBeenCalledWith('statechange', expect.any(Function));
  });

  it('[TC-189.15/MSS][UC-IMP189] AudioEngine uses isRecoveryArmed flag to prevent duplicate recovery listeners', () => {
    if (typeof (AudioEngine as any).armInterruptionRecovery !== 'function') {
      throw new TypeError('AudioEngine.armInterruptionRecovery is not implemented (Station 1 RED: audio_engine.ts pending)');
    }
    const windowAddSpy = vi.spyOn(window, 'addEventListener');
    (AudioEngine as any).armInterruptionRecovery();
    (AudioEngine as any).armInterruptionRecovery();
    (AudioEngine as any).armInterruptionRecovery();

    const pointerDownCalls = windowAddSpy.mock.calls.filter(
      (c) => c[0] === 'pointerdown' && (c[2] as any)?.capture === true
    );
    expect(pointerDownCalls.length).toBe(1);
    windowAddSpy.mockRestore();
  });

  // ==========================================================================
  // FACET 4: Error Defense & Terminal Invariants (Mute Isolation, Iframe Sandbox, Bankrupt & Actor Separation)
  // ==========================================================================
  it('[TC-189.02/MSS][UC-IMP189] HapticEngine skips vibration and click when hapticsEnabled is false', () => {
    const vibrateSpy = vi.fn();
    (navigator as any).vibrate = vibrateSpy;
    (useAudioStore.getState() as any).setHapticsEnabled?.(false);
    HapticEngine.selection();
    expect(vibrateSpy).not.toHaveBeenCalled();
  });

  it('[TC-189.07/MSS][UC-IMP189] HapticEngine safely swallows SecurityError from navigator.vibrate in restricted iframes', () => {
    (navigator as any).vibrate = vi.fn().mockImplementation(() => {
      throw new DOMException('Blocked by Permissions Policy', 'SecurityError');
    });
    (useAudioStore.getState() as any).setHapticsEnabled?.(true);
    expect(() => HapticEngine.selection()).not.toThrow();
  });

  it('[TC-189.09/MSS][UC-IMP189] HapticEngine skips Synth Click on iOS Safari when audio is muted', () => {
    delete (navigator as any).vibrate;
    useAudioStore.setState({ isMuted: true });
    (useAudioStore.getState() as any).setHapticsEnabled?.(true);

    const mockCtx = {
      currentTime: 100,
      destination: {},
      createOscillator: vi.fn(),
      createGain: vi.fn(),
    } as unknown as AudioContext;

    HapticEngine.playTactileClick(mockCtx);
    expect(mockCtx.createOscillator).not.toHaveBeenCalled();
  });

  it('[TC-189.11/MSS][UC-IMP189] apply_delta skips turnAlert if local player is bankrupt', () => {
    if (!hapticMod?.HapticEngine) {
      throw new TypeError('HapticEngine is not implemented (Station 1 RED: haptic_engine.ts pending)');
    }
    const turnAlertSpy = vi.spyOn(hapticMod.HapticEngine, 'turnAlert');
    useLobbyStore.setState({ myPlayerId: 'p1' });
    useGameStore.setState({
      currentTurnPlayerId: 'p2',
      playersInfo: {
        p1: { id: 'p1', bankrupt: true } as any,
        p2: { id: 'p2', bankrupt: false } as any,
      },
    });
    applyDeltaToStore({ currentTurnPlayerId: 'p1', tick: 101 } as any);
    expect(turnAlertSpy).not.toHaveBeenCalled();
  });

  it('[TC-189.12/MSS][UC-IMP189] apply_delta skips turnAlert when turn changes to opponent (Anti Phantom Vibration)', () => {
    if (!hapticMod?.HapticEngine) {
      throw new TypeError('HapticEngine is not implemented (Station 1 RED: haptic_engine.ts pending)');
    }
    const turnAlertSpy = vi.spyOn(hapticMod.HapticEngine, 'turnAlert');
    useLobbyStore.setState({ myPlayerId: 'p1' });
    useGameStore.setState({
      currentTurnPlayerId: 'p1',
      playersInfo: {
        p1: { id: 'p1', bankrupt: false } as any,
        p2: { id: 'p2', bankrupt: false } as any,
      },
    });
    applyDeltaToStore({ currentTurnPlayerId: 'p2', tick: 102 } as any);
    expect(turnAlertSpy).not.toHaveBeenCalled();
  });

  // ==========================================================================
  // FACET 5: Cross-Coupling Blast Radius & Consumer-Side Execution
  // ==========================================================================
  it('[TC-189.10/MSS][UC-IMP189] apply_delta calls HapticEngine.turnAlert when turn changes to local active player', () => {
    if (!hapticMod?.HapticEngine) {
      throw new TypeError('HapticEngine is not implemented (Station 1 RED: haptic_engine.ts pending)');
    }
    const turnAlertSpy = vi.spyOn(hapticMod.HapticEngine, 'turnAlert');
    useLobbyStore.setState({ myPlayerId: 'p1' });
    useGameStore.setState({
      currentTurnPlayerId: 'p2',
      playersInfo: {
        p1: { id: 'p1', bankrupt: false } as any,
        p2: { id: 'p2', bankrupt: false } as any,
      },
    });
    applyDeltaToStore({ currentTurnPlayerId: 'p1', tick: 100 } as any);
    expect(turnAlertSpy).toHaveBeenCalledTimes(1);
  });
});
