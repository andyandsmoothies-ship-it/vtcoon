// [TC-IMP295/MSS] Procedural Ambient & Environment WebAudio synthesis recipes for VTCOON
// Lightweight (<50KB), zero MP3 dependency, real-time tactile acoustic feedback

export function createOceanAmbientGraph(
  context: AudioContext,
  destination: AudioNode,
  volume: number
): {
  source: AudioBufferSourceNode;
  filter: BiquadFilterNode;
  gain: GainNode;
  lfo: OscillatorNode;
} {
  const bufferSize = context.sampleRate * 3;
  const noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0;

  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    output[i] = (b0 + b1 + b2 + white * 0.1) * 0.2;
  }

  const noiseSource = context.createBufferSource();
  noiseSource.buffer = noiseBuffer;
  noiseSource.loop = true;
  const filter = context.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(320, context.currentTime);

  const lfo = context.createOscillator();
  const lfoGain = context.createGain();
  lfo.frequency.setValueAtTime(0.1, context.currentTime);
  lfoGain.gain.setValueAtTime(220, context.currentTime);
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);

  const gain = context.createGain();
  const targetGain = Math.max(0.001, volume * 0.28);
  gain.gain.setValueAtTime(0.001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(targetGain, context.currentTime + 1.5);
  noiseSource.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  noiseSource.start();
  lfo.start();
  return { source: noiseSource, filter, gain, lfo };
}

export function synthesizeJazzLoungeChords(
  context: AudioContext,
  destination: AudioNode,
  volume: number
): void {
  if (volume <= 0) return;
  const now = context.currentTime;
  const chordFrequencies = [146.83, 174.61, 220.0, 261.63, 329.63];

  chordFrequencies.forEach((freq, idx) => {
    const osc = context.createOscillator();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(950, now);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    const noteGain = volume * 0.12 * (1 - idx * 0.1);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(noteGain, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(destination);
    osc.start(now);
    osc.stop(now + 2.9);
  });
}

export function synthesizeLighthouseFoghorn(
  context: AudioContext,
  destination: AudioNode,
  volume = 0.7
): void {
  if (volume <= 0) return;
  const now = context.currentTime;
  const osc = context.createOscillator();
  const gain = context.createGain();
  const filter = context.createBiquadFilter();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(110, now);
  osc.frequency.linearRampToValueAtTime(105, now + 0.8);
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(220, now);
  filter.Q.setValueAtTime(3, now);
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(volume * 0.7, now + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  osc.start(now);
  osc.stop(now + 0.82);
}

export function synthesizeWaterSplash(
  context: AudioContext,
  destination: AudioNode,
  volume = 0.6
): void {
  if (volume <= 0) return;
  const now = context.currentTime;
  const bufferSize = Math.floor(context.sampleRate * 0.35);
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const noise = context.createBufferSource();
  noise.buffer = buffer;
  const filter = context.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800, now);
  filter.frequency.exponentialRampToValueAtTime(200, now + 0.35);
  filter.Q.setValueAtTime(4, now);
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(volume * 0.5, now + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  noise.start(now);
  noise.stop(now + 0.36);
}
