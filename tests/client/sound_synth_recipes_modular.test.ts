// [TC-IMP295/MSS] Modular Audio Synthesis Contract Tests
// Verifies semantic procedural WebAudio contracts across leaf submodules.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  synthesizeDiceRoll,
  synthesizeAuctionGavel,
  synthesizeConstructionSlam,
  synthesizeMoneyTransfer,
  synthesizePawnStep,
} from '../../src/client/audio/synth_recipes_gameplay';
import {
  createOceanAmbientGraph,
  synthesizeJazzLoungeChords,
  synthesizeLighthouseFoghorn,
  synthesizeWaterSplash,
} from '../../src/client/audio/synth_recipes_ambient';
import {
  synthesizeCardFlip,
  synthesizeCoronationChime,
  synthesizeCarHorn,
} from '../../src/client/audio/synth_recipes_ui';

function createMockAudioParam(initial = 0) {
  return {
    value: initial,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };
}

class MockAudioNode {
  connect = vi.fn();
  disconnect = vi.fn();
}

class MockOscillatorNode extends MockAudioNode {
  type: OscillatorType = 'sine';
  frequency = createMockAudioParam(440);
  start = vi.fn();
  stop = vi.fn();
}

class MockGainNode extends MockAudioNode {
  gain = createMockAudioParam(1);
}

class MockBiquadFilterNode extends MockAudioNode {
  type: BiquadFilterType = 'lowpass';
  frequency = createMockAudioParam(1000);
  Q = createMockAudioParam(1);
}

class MockAudioBufferSourceNode extends MockAudioNode {
  buffer: unknown = null;
  loop = false;
  start = vi.fn();
  stop = vi.fn();
}

function toAudioNode(node: MockAudioNode): AudioNode {
  const intermediate: unknown = node;
  return intermediate as AudioNode;
}

function toAudioContext(ctx: MockAudioContext): AudioContext {
  const intermediate: unknown = ctx;
  return intermediate as AudioContext;
}

class MockAudioContext {
  currentTime = 10.0;
  sampleRate = 44100;
  destination = toAudioNode(new MockAudioNode());

  createdOscillators: MockOscillatorNode[] = [];
  createdGains: MockGainNode[] = [];
  createdFilters: MockBiquadFilterNode[] = [];
  createdBuffers: Array<{ length: number; sampleRate: number }> = [];

  createOscillator(): MockOscillatorNode {
    const osc = new MockOscillatorNode();
    this.createdOscillators.push(osc);
    return osc;
  }

  createGain(): MockGainNode {
    const gain = new MockGainNode();
    this.createdGains.push(gain);
    return gain;
  }

  createBiquadFilter(): MockBiquadFilterNode {
    const filter = new MockBiquadFilterNode();
    this.createdFilters.push(filter);
    return filter;
  }

  createBuffer(channels: number, length: number, sampleRate: number) {
    const buf = {
      numberOfChannels: channels,
      length,
      sampleRate,
      getChannelData: () => new Float32Array(length),
    };
    this.createdBuffers.push(buf);
    return buf;
  }

  createBufferSource(): MockAudioBufferSourceNode {
    return new MockAudioBufferSourceNode();
  }
}

describe('[TC-IMP295/MSS] Modular Procedural Audio Synthesis Recipes', () => {
  let mockCtx: MockAudioContext;
  let audioCtx: AudioContext;
  let destination: AudioNode;

  beforeEach(() => {
    mockCtx = new MockAudioContext();
    audioCtx = toAudioContext(mockCtx);
    destination = mockCtx.destination;
  });

  // Gameplay Recipes
  it('TC-REC.01 [UC-RECIPES/MSS]: synthesizeDiceRoll creates 4 bandpass oscillators', () => {
    synthesizeDiceRoll(audioCtx, destination, 0.8);
    expect(mockCtx.createdOscillators.length).toBe(4);
    expect(mockCtx.createdFilters[0]?.type).toBe('bandpass');
  });

  it('TC-REC.02 [UC-RECIPES/MSS]: synthesizeAuctionGavel triggers dual strike with transient and resonance', () => {
    synthesizeAuctionGavel(audioCtx, destination, 0.9);
    expect(mockCtx.createdOscillators.length).toBe(4);
    expect(mockCtx.createdOscillators[0]?.type).toBe('sine');
    expect(mockCtx.createdOscillators[1]?.type).toBe('triangle');
  });

  it('TC-REC.03 [UC-RECIPES/MSS]: synthesizeConstructionSlam generates 42Hz sub-bass and punch body', () => {
    synthesizeConstructionSlam(audioCtx, destination, 1.0);
    expect(mockCtx.createdOscillators.length).toBe(2);
    expect(mockCtx.createdOscillators[0]?.type).toBe('sine');
    expect(mockCtx.createdOscillators[1]?.type).toBe('triangle');
  });

  it('TC-REC.04 [UC-RECIPES/MSS]: synthesizeMoneyTransfer plays 4-note ascending arpeggio', () => {
    synthesizeMoneyTransfer(audioCtx, destination, 0.7);
    expect(mockCtx.createdOscillators.length).toBe(4);
    expect(mockCtx.createdOscillators[0]?.frequency.setValueAtTime).toHaveBeenCalledWith(1318.5, 10.0);
  });

  it('TC-REC.05 [UC-RECIPES/MSS]: synthesizePawnStep modulates triangle frequency with pitchVariation', () => {
    synthesizePawnStep(audioCtx, destination, 0.5, 1.2);
    expect(mockCtx.createdOscillators.length).toBe(1);
    expect(mockCtx.createdOscillators[0]?.frequency.setValueAtTime).toHaveBeenCalledWith(456, 10.0);
  });

  // Ambient & Environment Recipes
  it('TC-REC.06 [UC-RECIPES/MSS]: createOceanAmbientGraph returns noise source, filter, gain, and 0.1Hz LFO', () => {
    const graph = createOceanAmbientGraph(audioCtx, destination, 0.5);
    expect(graph.source).toBeDefined();
    expect(graph.filter).toBeDefined();
    expect(graph.lfo.frequency.setValueAtTime).toHaveBeenCalledWith(0.1, 10.0);
  });

  it('TC-REC.07 [UC-RECIPES/MSS]: synthesizeJazzLoungeChords generates 5 Rhodes sine tones with 950Hz filter', () => {
    synthesizeJazzLoungeChords(audioCtx, destination, 0.4);
    expect(mockCtx.createdOscillators.length).toBe(5);
    expect(mockCtx.createdFilters[0]?.frequency.setValueAtTime).toHaveBeenCalledWith(950, 10.0);
  });

  it('TC-REC.08 [UC-RECIPES/MSS]: synthesizeLighthouseFoghorn creates sawtooth wave with 110Hz to 105Hz ramp', () => {
    synthesizeLighthouseFoghorn(audioCtx, destination, 0.7);
    expect(mockCtx.createdOscillators.length).toBe(1);
    expect(mockCtx.createdOscillators[0]?.type).toBe('sawtooth');
    expect(mockCtx.createdOscillators[0]?.frequency.linearRampToValueAtTime).toHaveBeenCalledWith(105, 10.8);
  });

  it('TC-REC.09 [UC-RECIPES/MSS]: synthesizeWaterSplash allocates noise buffer and sweeps lowpass 800Hz to 200Hz', () => {
    synthesizeWaterSplash(audioCtx, destination, 0.6);
    expect(mockCtx.createdBuffers.length).toBe(1);
    expect(mockCtx.createdFilters[0]?.frequency.exponentialRampToValueAtTime).toHaveBeenCalledWith(200, 10.35);
  });

  // Tactile UI Recipes
  it('TC-REC.10 [UC-RECIPES/MSS]: synthesizeCardFlip triggers card whoosh noise and tactile snap click', () => {
    synthesizeCardFlip(audioCtx, destination, 0.6);
    expect(mockCtx.createdBuffers.length).toBe(1);
    expect(mockCtx.createdOscillators.length).toBe(1);
    expect(mockCtx.createdOscillators[0]?.type).toBe('triangle');
  });

  it('TC-REC.11 [UC-RECIPES/MSS]: synthesizeCoronationChime triggers 5 fundamental bells and crystalline overtones', () => {
    synthesizeCoronationChime(audioCtx, destination, 0.7);
    expect(mockCtx.createdOscillators.length).toBe(10);
  });

  it('TC-REC.12 [UC-RECIPES/MSS]: synthesizeCarHorn generates dual-tone horn notes at 440Hz and 554Hz', () => {
    synthesizeCarHorn(audioCtx, destination, 0.5);
    expect(mockCtx.createdOscillators.length).toBe(2);
    expect(mockCtx.createdOscillators[0]?.frequency.setValueAtTime).toHaveBeenCalledWith(440, 10.0);
    expect(mockCtx.createdOscillators[1]?.frequency.setValueAtTime).toHaveBeenCalledWith(554, 10.0);
  });

  // Guard Clause
  it('TC-REC.13 [UC-RECIPES/A1]: synthesizeDiceRoll exits early and allocates zero nodes when volume <= 0', () => {
    synthesizeDiceRoll(audioCtx, destination, 0);
    expect(mockCtx.createdOscillators.length).toBe(0);
    expect(mockCtx.createdFilters.length).toBe(0);
  });
});
