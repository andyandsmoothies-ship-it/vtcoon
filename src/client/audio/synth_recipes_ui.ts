// [TC-IMP295/MSS] Procedural Tactile UI WebAudio synthesis recipes for VTCOON
// Lightweight (<50KB), zero MP3 dependency, real-time tactile acoustic feedback

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

export function synthesizeCarHorn(
  context: AudioContext,
  destination: AudioNode,
  volume = 0.5
): void {
  if (volume <= 0) return;
  const now = context.currentTime;
  [440, 554].forEach((freq) => {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume * 0.4, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain);
    gain.connect(destination);
    osc.start(now);
    osc.stop(now + 0.19);
  });
}
