// [IMP-125-P2/MSS] Pawn Tension & Expressive Interaction Procedural WebAudio Synth Recipes
// Procedural synthesis, zero audio file dependencies, clean mathematical waves

/**
 * [IMP-125-P2] Nhịp tim hồi hộp dồn dập (Rapid Heartbeat Pulse)
 * Tạo xung kép (lub-dub) tần số thấp 60Hz - 85Hz theo chu kỳ
 */
export function synthesizeHeartbeatPulse(
  context: AudioContext,
  destination: AudioNode,
  volume = 0.8
): void {
  if (volume <= 0) return;
  const now = context.currentTime;

  // 2 xung nhịp dồn dập (lub-dub) cách nhau 120ms
  [0, 0.12].forEach((offset, idx) => {
    const t = now + offset;
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = 'sine';
    const startFreq = idx === 0 ? 85 : 75;
    const endFreq = idx === 0 ? 45 : 40;
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.08);
    const pulseVol = volume * (idx === 0 ? 0.9 : 0.7);
    gain.gain.setValueAtTime(pulseVol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    osc.connect(gain);
    gain.connect(destination);
    osc.start(t);
    osc.stop(t + 0.10);
  });
}

/**
 * [IMP-125-P2] Chuông vàng đắc thắng (Victory Chime)
 * Arpeggio chuông vàng (C5: 523Hz -> E5: 659Hz -> G5: 784Hz) ngân vang 0.5s
 */
export function synthesizeVictoryChime(
  context: AudioContext,
  destination: AudioNode,
  volume = 0.7
): void {
  if (volume <= 0) return;
  const now = context.currentTime;

  [523.25, 659.25, 783.99].forEach((freq, idx) => {
    const t = now + idx * 0.09;
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(volume * 0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    osc.connect(gain);
    gain.connect(destination);
    osc.start(t);
    osc.stop(t + 0.46);
  });
}

/**
 * [IMP-125-P2] Tiếng uỵch nhún lò xo hụt hẫng (Slump Recoil Thud)
 * Âm trầm va đập giảm tần số (120Hz -> 45Hz) nhún lò xo
 */
export function synthesizeSlumpThud(
  context: AudioContext,
  destination: AudioNode,
  volume = 0.7
): void {
  if (volume <= 0) return;
  const now = context.currentTime;

  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = 'sawtooth';
  const filter = context.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(280, now);
  filter.frequency.exponentialRampToValueAtTime(60, now + 0.22);
  osc.frequency.setValueAtTime(120, now);
  osc.frequency.exponentialRampToValueAtTime(45, now + 0.22);
  gain.gain.setValueAtTime(volume * 0.75, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  osc.start(now);
  osc.stop(now + 0.26);
}

/**
 * [IMP-125-P3] Hoan ca độc quyền (Monopoly Fanfare)
 * 4 nốt arpeggio kèn đồng (F4: 349.23Hz, A4: 440Hz, C5: 523.25Hz, F5: 698.46Hz)
 */
export function synthesizeMonopolyFanfare(
  context: AudioContext,
  destination: AudioNode,
  volume = 0.8
): void {
  if (!context || volume <= 0) return;
  const now = context.currentTime;

  const notes = [
    { freq: 349.23, start: 0, stop: 0.35 },
    { freq: 440.0, start: 0.25, stop: 0.60 },
    { freq: 523.25, start: 0.50, stop: 0.85 },
    { freq: 698.46, start: 0.75, stop: 1.25 },
  ];

  notes.forEach(({ freq, start, stop }) => {
    const t = now + start;
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(volume * 0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, now + stop);
    osc.connect(gain);
    gain.connect(destination);
    osc.start(t);
    osc.stop(now + stop);
  });
}

