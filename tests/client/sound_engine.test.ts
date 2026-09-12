// [TC-IMP10.1/MSS] SoundEngine & Tactile Audio Tests — WebAudio API Synthesizer
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SoundEngineImpl } from '../../src/client/audio/sound_engine';
import { useAudioStore } from '../../src/client/store/audio_store';

function createMockAudioParam(initialValue = 1) {
  return {
    value: initialValue,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };
}

class MockAudioNode {
  public connect = vi.fn();
  public disconnect = vi.fn();
}

class MockOscillatorNode extends MockAudioNode {
  public type = 'sine';
  public frequency = createMockAudioParam(440);
  public start = vi.fn();
  public stop = vi.fn();
}

class MockGainNode extends MockAudioNode {
  public gain = createMockAudioParam(1);
}

class MockBiquadFilterNode extends MockAudioNode {
  public type = 'lowpass';
  public frequency = createMockAudioParam(1000);
  public Q = createMockAudioParam(1);
}

class MockAudioBufferSourceNode extends MockAudioNode {
  public buffer: unknown = null;
  public loop = false;
  public start = vi.fn();
  public stop = vi.fn();
}

class MockAudioContext {
  public state: AudioContextState = 'suspended';
  public currentTime = 10.0;
  public sampleRate = 44100;
  public destination = new MockAudioNode();
  public resume = vi.fn().mockImplementation(async () => {
    this.state = 'running';
  });

  public createdOscillators: MockOscillatorNode[] = [];
  public createdGains: MockGainNode[] = [];
  public createdFilters: MockBiquadFilterNode[] = [];
  public createdBufferSources: MockAudioBufferSourceNode[] = [];

  public createOscillator(): MockOscillatorNode {
    const osc = new MockOscillatorNode();
    this.createdOscillators.push(osc);
    return osc;
  }

  public createGain(): MockGainNode {
    const gain = new MockGainNode();
    this.createdGains.push(gain);
    return gain;
  }

  public createBiquadFilter(): MockBiquadFilterNode {
    const filter = new MockBiquadFilterNode();
    this.createdFilters.push(filter);
    return filter;
  }

  public createBuffer(channels: number, length: number, sampleRate: number) {
    return {
      numberOfChannels: channels,
      length,
      sampleRate,
      getChannelData: () => new Float32Array(length),
    };
  }

  public createBufferSource(): MockAudioBufferSourceNode {
    const src = new MockAudioBufferSourceNode();
    this.createdBufferSources.push(src);
    return src;
  }
}

describe('[TC-IMP10.1/MSS] SoundEngine — Procedural Tactile Sound Synthesizer', () => {
  let engine: SoundEngineImpl;
  let originalAudioContext: unknown;

  beforeEach(() => {
    originalAudioContext = (globalThis as unknown as { AudioContext?: unknown }).AudioContext;
    (globalThis as unknown as { AudioContext: unknown }).AudioContext = MockAudioContext;

    useAudioStore.setState({
      masterVolume: 1.0,
      sfxVolume: 0.8,
      bgmVolume: 0.6,
      isMuted: false,
    });

    engine = new SoundEngineImpl();
  });

  afterEach(() => {
    engine.dispose();
    (globalThis as unknown as { AudioContext?: unknown }).AudioContext = originalAudioContext;
    vi.restoreAllMocks();
  });

  it('initializes AudioContext and dedicated Master/SFX/BGM buses lazily', async () => {
    const ctx = engine.getContext() as unknown as MockAudioContext;
    expect(ctx).toBeDefined();
    expect(ctx.state).toBe('suspended');
    expect(ctx.createdGains.length).toBe(3); // master, sfx, bgm buses
    expect(engine.masterGain).toBeDefined();
    expect(engine.sfxBus).toBeDefined();
    expect(engine.bgmBus).toBeDefined();

    await engine.resumeAudioContext();
    expect(ctx.resume).toHaveBeenCalled();
    expect(ctx.state).toBe('running');
  });

  it('reactively mutes master bus and scales category buses when useAudioStore updates', () => {
    engine.getContext();
    useAudioStore.setState({ isMuted: true });
    expect(engine.masterGain?.gain.setValueAtTime).toHaveBeenCalledWith(0, 10.0);

    useAudioStore.setState({ isMuted: false, masterVolume: 0.7, sfxVolume: 0.5, bgmVolume: 0.4 });
    expect(engine.masterGain?.gain.setValueAtTime).toHaveBeenCalledWith(0.7, 10.0);
    expect(engine.sfxBus?.gain.setValueAtTime).toHaveBeenCalledWith(0.5, 10.0);
    expect(engine.bgmBus?.gain.setValueAtTime).toHaveBeenCalledWith(0.4, 10.0);
  });

  it('playDiceRoll triggers rapid micro-click bursts routed to sfxBus', () => {
    engine.playDiceRoll();
    const ctx = engine.getContext() as unknown as MockAudioContext;

    expect(ctx.createdOscillators.length).toBe(4);
    expect(ctx.createdFilters.length).toBe(4);
    expect(ctx.createdGains.length).toBe(7); // 3 buses + 4 hit gains

    const firstOsc = ctx.createdOscillators[0]!;
    expect(firstOsc.type).toBe('triangle');
    expect(firstOsc.start).toHaveBeenCalled();
    expect(firstOsc.stop).toHaveBeenCalled();
  });

  it('playAuctionGavel triggers double strike and debounces rapid double calls', () => {
    engine.playAuctionGavel();
    const ctx = engine.getContext() as unknown as MockAudioContext;

    expect(ctx.createdOscillators.length).toBe(4);
    expect(ctx.createdGains.length).toBe(7); // 3 buses + 4 strike gains

    const crackOsc = ctx.createdOscillators[0]!;
    expect(crackOsc.type).toBe('sine');
    expect(crackOsc.frequency.setValueAtTime).toHaveBeenCalledWith(680, 10.0);

    // Call again within 100ms debounce window — should NOT create duplicate oscillators
    engine.playAuctionGavel();
    expect(ctx.createdOscillators.length).toBe(4);
  });

  it('playConstructionSlam triggers deep sub-bass 42Hz punch impact', () => {
    engine.playConstructionSlam();
    const ctx = engine.getContext() as unknown as MockAudioContext;

    expect(ctx.createdOscillators.length).toBe(2);
    const subOsc = ctx.createdOscillators[0]!;
    expect(subOsc.frequency.setValueAtTime).toHaveBeenCalledWith(130, 10.0);
    expect(subOsc.frequency.exponentialRampToValueAtTime).toHaveBeenCalledWith(42, 10.09);
    expect(subOsc.frequency.setValueAtTime).toHaveBeenCalledWith(42, 10.35);
  });

  it('playMoneyTransfer cascades 4 ascending chime arpeggio notes', () => {
    engine.playMoneyTransfer();
    const ctx = engine.getContext() as unknown as MockAudioContext;

    expect(ctx.createdOscillators.length).toBe(4);
    const expectedFreqs = [1318.5, 1661.2, 1975.5, 2637.0];
    expectedFreqs.forEach((freq, idx) => {
      const osc = ctx.createdOscillators[idx]!;
      expect(osc.frequency.setValueAtTime).toHaveBeenCalledWith(freq, expect.any(Number));
      expect(osc.start).toHaveBeenCalled();
    });
  });

  it('playPawnStep creates organic tap with pitch variation', () => {
    engine.playPawnStep(1.1);
    const ctx = engine.getContext() as unknown as MockAudioContext;

    expect(ctx.createdOscillators.length).toBe(1);
    const osc = ctx.createdOscillators[0]!;
    expect(osc.frequency.setValueAtTime).toHaveBeenCalledWith(380 * 1.1, 10.0);
  });

  it('playPenthouseOceanAmbient starts filtered noise with slow LFO and stops smoothly', () => {
    engine.playPenthouseOceanAmbient();
    const ctx = engine.getContext() as unknown as MockAudioContext;

    expect(ctx.createdBufferSources.length).toBe(1);
    expect(ctx.createdFilters.length).toBe(1);
    const bufferSource = ctx.createdBufferSources[0]!;
    expect(bufferSource.loop).toBe(true);
    expect(bufferSource.start).toHaveBeenCalled();

    // Calling play again while already active is a safe no-op
    engine.playPenthouseOceanAmbient();
    expect(ctx.createdBufferSources.length).toBe(1);

    // Stop ambient safely
    engine.stopPenthouseOceanAmbient();
    expect(ctx.createdGains[4]?.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(0.0001, expect.any(Number));
  });

  it('playJazzLoungeChords swells warm Rhodes chords', () => {
    engine.playJazzLoungeChords();
    const ctx = engine.getContext() as unknown as MockAudioContext;

    expect(ctx.createdOscillators.length).toBe(5);
    expect(ctx.createdFilters.length).toBe(5);
  });

  it('playCardFlip synthesizes tactile card paper flip and snap', () => {
    engine.playCardFlip();
    const ctx = engine.getContext() as unknown as MockAudioContext;

    expect(ctx.createdBufferSources.length).toBe(1);
    expect(ctx.createdFilters.length).toBe(1);
    expect(ctx.createdOscillators.length).toBe(1);
  });

  it('playCoronationChime synthesizes triumphant 5-note victory fanfare bell chimes', () => {
    engine.playCoronationChime();
    const ctx = engine.getContext() as unknown as MockAudioContext;

    // 5 fundamental oscillators + 5 overtone oscillators = 10 oscillators
    expect(ctx.createdOscillators.length).toBe(10);
  });
});

describe('[TC-IMP10.2/MSS] SoundEngine — Adversarial Inversion & Boundary Cases', () => {
  let engine: SoundEngineImpl;

  beforeEach(() => {
    (globalThis as unknown as { AudioContext: unknown }).AudioContext = MockAudioContext;
    useAudioStore.setState({ masterVolume: 1.0, sfxVolume: 0.8, isMuted: false });
    engine = new SoundEngineImpl();
  });

  afterEach(() => {
    engine.dispose();
  });

  it('[Adversarial Inversion] suppresses all sounds when isMuted = true', () => {
    useAudioStore.setState({ isMuted: true });
    engine.playDiceRoll();
    engine.playAuctionGavel();
    engine.playConstructionSlam();
    engine.playMoneyTransfer();
    engine.playPawnStep();
    engine.playCardFlip();
    engine.playCoronationChime();

    const ctx = engine.getContext() as unknown as MockAudioContext;
    expect(ctx.createdOscillators.length).toBe(0);
  });

  it('[Adversarial Inversion] handles environment without AudioContext without throwing', () => {
    (globalThis as unknown as { AudioContext?: unknown }).AudioContext = undefined;
    (globalThis as unknown as { webkitAudioContext?: unknown }).webkitAudioContext = undefined;
    const headlessEngine = new SoundEngineImpl();

    expect(() => {
      headlessEngine.playDiceRoll();
      headlessEngine.playAuctionGavel();
      headlessEngine.playConstructionSlam();
      headlessEngine.playMoneyTransfer();
      headlessEngine.playPawnStep();
      headlessEngine.playCardFlip();
      headlessEngine.playCoronationChime();
      headlessEngine.playPenthouseOceanAmbient();
      headlessEngine.stopPenthouseOceanAmbient();
      headlessEngine.playJazzLoungeChords();
      headlessEngine.stopAll();
      headlessEngine.dispose();
    }).not.toThrow();
  });

  it('[Adversarial Inversion] handles resume rejection gracefully without unhandled rejection', async () => {
    const ctx = engine.getContext() as unknown as MockAudioContext;
    ctx.resume = vi.fn().mockRejectedValue(new Error('Autoplay blocked by browser policy'));

    await expect(engine.resumeAudioContext()).resolves.toBeUndefined();
  });
});
