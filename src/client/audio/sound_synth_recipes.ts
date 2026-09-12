// [TC-IMP10.1/MSS] SoundSynthRecipes — Procedural WebAudio synthesis recipes for VTCOON
// Lightweight (<50KB), zero MP3 dependency, real-time tactile acoustic feedback

export function synthesizeDiceRoll(
  context: AudioContext,
  destination: AudioNode,
  volume: number
): void {
  if (volume <= 0) return;
  const now = context.currentTime;
  const impactCount = 4;

  for (let i = 0; i < impactCount; i++) {
    const hitTime = now + i * 0.05 + Math.random() * 0.02;
    const osc = context.createOscillator();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200 + Math.random() * 800, hitTime);
    filter.Q.setValueAtTime(5, hitTime);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400 + Math.random() * 600, hitTime);
    osc.frequency.exponentialRampToValueAtTime(300, hitTime + 0.04);

    const hitGain = volume * (0.35 + Math.random() * 0.25) * (1 - i * 0.15);
    gain.gain.setValueAtTime(hitGain, hitTime);
    gain.gain.exponentialRampToValueAtTime(0.001, hitTime + 0.045);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(destination);

    osc.start(hitTime);
    osc.stop(hitTime + 0.05);
  }
}

export function synthesizeAuctionGavel(
  context: AudioContext,
  destination: AudioNode,
  volume: number
): void {
  if (volume <= 0) return;
  const now = context.currentTime;
  const strikes = [0, 0.14]; // Nhịp gõ kép đanh thép

  strikes.forEach((offset, idx) => {
    const strikeTime = now + offset;
    const gainScale = idx === 0 ? 0.85 : 1.0;

    // Tiếng đanh vang (Transient crack)
    const oscCrack = context.createOscillator();
    const gainCrack = context.createGain();
    oscCrack.type = 'sine';
    oscCrack.frequency.setValueAtTime(680, strikeTime);
    oscCrack.frequency.exponentialRampToValueAtTime(180, strikeTime + 0.06);

    gainCrack.gain.setValueAtTime(volume * 0.9 * gainScale, strikeTime);
    gainCrack.gain.exponentialRampToValueAtTime(0.001, strikeTime + 0.08);

    oscCrack.connect(gainCrack);
    gainCrack.connect(destination);
    oscCrack.start(strikeTime);
    oscCrack.stop(strikeTime + 0.09);

    // Tiếng dội trầm của thớ gỗ (Wood resonance body)
    const oscRes = context.createOscillator();
    const gainRes = context.createGain();
    oscRes.type = 'triangle';
    oscRes.frequency.setValueAtTime(240, strikeTime);
    oscRes.frequency.exponentialRampToValueAtTime(120, strikeTime + 0.22);

    gainRes.gain.setValueAtTime(volume * 0.6 * gainScale, strikeTime);
    gainRes.gain.exponentialRampToValueAtTime(0.001, strikeTime + 0.25);

    oscRes.connect(gainRes);
    gainRes.connect(destination);
    oscRes.start(strikeTime);
    oscRes.stop(strikeTime + 0.26);
  });
}

export function synthesizeConstructionSlam(
  context: AudioContext,
  destination: AudioNode,
  volume: number
): void {
  if (volume <= 0) return;
  const now = context.currentTime;

  // Sóng trầm Sub-bass 42Hz
  const subOsc = context.createOscillator();
  const subGain = context.createGain();
  subOsc.type = 'sine';
  subOsc.frequency.setValueAtTime(130, now);
  subOsc.frequency.exponentialRampToValueAtTime(42, now + 0.09);
  subOsc.frequency.setValueAtTime(42, now + 0.35);

  subGain.gain.setValueAtTime(volume * 1.0, now);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

  subOsc.connect(subGain);
  subGain.connect(destination);
  subOsc.start(now);
  subOsc.stop(now + 0.56);

  // Tiếng đập nén bề mặt (Punch impact)
  const punchOsc = context.createOscillator();
  const punchGain = context.createGain();
  punchOsc.type = 'triangle';
  punchOsc.frequency.setValueAtTime(320, now);
  punchOsc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

  punchGain.gain.setValueAtTime(volume * 0.7, now);
  punchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  punchOsc.connect(punchGain);
  punchGain.connect(destination);
  punchOsc.start(now);
  punchOsc.stop(now + 0.13);
}

export function synthesizeMoneyTransfer(
  context: AudioContext,
  destination: AudioNode,
  volume: number
): void {
  if (volume <= 0) return;
  const now = context.currentTime;
  // Chuỗi nốt thăng hoa: E6, G#6, B6, E7
  const frequencies = [1318.5, 1661.2, 1975.5, 2637.0];

  frequencies.forEach((freq, i) => {
    const noteTime = now + i * 0.045;
    const osc = context.createOscillator();
    const gain = context.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, noteTime);

    const noteGain = volume * 0.45 * (1 + i * 0.1);
    gain.gain.setValueAtTime(noteGain, noteTime);
    gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.32);

    osc.connect(gain);
    gain.connect(destination);
    osc.start(noteTime);
    osc.stop(noteTime + 0.35);
  });
}

export function synthesizePawnStep(
  context: AudioContext,
  destination: AudioNode,
  volume: number,
  pitchVariation = 1.0
): void {
  if (volume <= 0) return;
  const now = context.currentTime;
  const osc = context.createOscillator();
  const gain = context.createGain();

  osc.type = 'triangle';
  const baseFreq = 380 * pitchVariation;
  osc.frequency.setValueAtTime(baseFreq, now);
  osc.frequency.exponentialRampToValueAtTime(140 * pitchVariation, now + 0.038);

  gain.gain.setValueAtTime(volume * 0.4, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.042);

  osc.connect(gain);
  gain.connect(destination);
  osc.start(now);
  osc.stop(now + 0.045);
}

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

export function synthesizeCardFlip(
  context: AudioContext,
  destination: AudioNode,
  volume: number
): void {
  if (volume <= 0) return;
  const now = context.currentTime;

  // 1. Tiếng xột xoạt lướt gió của thẻ (Card paper whoosh noise)
  const bufferSize = Math.floor(context.sampleRate * 0.12);
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }

  const noise = context.createBufferSource();
  noise.buffer = buffer;

  const bandpass = context.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.setValueAtTime(2400, now);
  bandpass.frequency.exponentialRampToValueAtTime(750, now + 0.11);
  bandpass.Q.setValueAtTime(3.5, now);

  const noiseGain = context.createGain();
  noiseGain.gain.setValueAtTime(volume * 0.55, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

  noise.connect(bandpass);
  bandpass.connect(noiseGain);
  noiseGain.connect(destination);

  noise.start(now);

  // 2. Tiếng đanh nảy vi mô khi thẻ bẻ cong và lật mặt (Tactile snap click)
  const snapOsc = context.createOscillator();
  const snapGain = context.createGain();
  snapOsc.type = 'triangle';
  snapOsc.frequency.setValueAtTime(1600, now + 0.03);
  snapOsc.frequency.exponentialRampToValueAtTime(350, now + 0.08);

  snapGain.gain.setValueAtTime(0.001, now);
  snapGain.gain.setValueAtTime(volume * 0.45, now + 0.03);
  snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  snapOsc.connect(snapGain);
  snapGain.connect(destination);

  snapOsc.start(now + 0.03);
  snapOsc.stop(now + 0.09);
}

export function synthesizeCoronationChime(
  context: AudioContext,
  destination: AudioNode,
  volume: number
): void {
  if (volume <= 0) return;
  const now = context.currentTime;
  // Hợp âm vinh quang C Major ngũ âm thăng hoa: C5, E5, G5, C6, E6
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];

  notes.forEach((freq, idx) => {
    const noteTime = now + idx * 0.075;

    // Âm cơ bản (Fundamental bell sine)
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, noteTime);

    // Họa âm chuông vàng (Crystalline bell overtone)
    const overtone = context.createOscillator();
    const overtoneGain = context.createGain();
    overtone.type = 'sine';
    overtone.frequency.setValueAtTime(freq * 2.76, noteTime);

    const noteVolume = volume * (0.35 + idx * 0.06);
    gain.gain.setValueAtTime(0.001, noteTime);
    gain.gain.linearRampToValueAtTime(noteVolume, noteTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 2.6);

    overtoneGain.gain.setValueAtTime(0.001, noteTime);
    overtoneGain.gain.linearRampToValueAtTime(noteVolume * 0.25, noteTime + 0.01);
    overtoneGain.gain.exponentialRampToValueAtTime(0.001, noteTime + 1.2);

    osc.connect(gain);
    gain.connect(destination);

    overtone.connect(overtoneGain);
    overtoneGain.connect(destination);

    osc.start(noteTime);
    osc.stop(noteTime + 2.7);

    overtone.start(noteTime);
    overtone.stop(noteTime + 1.3);
  });
}

