// [TC-IMP295/MSS] Procedural Gameplay WebAudio synthesis recipes for VTCOON
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
