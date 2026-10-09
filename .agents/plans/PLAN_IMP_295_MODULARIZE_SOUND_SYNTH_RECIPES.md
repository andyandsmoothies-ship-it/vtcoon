# KẾ HOẠCH TRIỂN KHAI MICRO-SLICE: BÓC TÁCH MÔ-ĐUN CÔNG THỨC ÂM THANH (IMP-295)
> **Phân hệ mục tiêu:** `client-audio`
> **Phạm vi kỹ thuật:** Giải phóng nợ kỹ thuật dòng mã (LOC Debt) của `src/client/audio/sound_synth_recipes.ts` (hiện chạm trần 399/400 LOC, Tier 1) bằng mô thức Facade Re-export sang 3 tệp lá thuần túy (`synth_recipes_gameplay.ts`, `synth_recipes_ambient.ts`, `synth_recipes_ui.ts`).
> **Cam kết cốt lõi:**
> 1. **Pure Move 100% (Zero Semantic Mutation):** Bảo toàn 100% công thức tổng hợp sóng âm WebAudio, tham số tần số, envelope biên độ và đồ thị kết nối node. Tuyệt đối không thay đổi bất kỳ hành vi âm thanh nào.
> 2. **Facade Re-export (Zero Caller Breakage):** `sound_synth_recipes.ts` đóng vai trò Facade mỏng (~7 LOC), re-export toàn bộ 12 hàm, bảo đảm 100% tương thích ngược cho `sound_engine.ts` và toàn bộ codebase mà không cần sửa 1 dòng import nào tại các module tiêu thụ.
> 3. **Giải Phóng Triệt Để Báo Động Đỏ Tier 1:** Đưa `sound_synth_recipes.ts` từ 399 LOC xuống 7 LOC (-392 LOC), 3 file mới đều duy trì trong ngưỡng cực kỳ an toàn (~120-155 LOC), cách xa trần 400 LOC.
> 4. **Scaffolding Protocol & Semantic Behavioral RED:** Khởi tạo stub rỗng cho 3 file mới trước khi chạy test, đảm bảo test fail rực rỡ tại runtime assertions (không văng lỗi loader missing module).
> **Baseline Working Tree Dependencies (Predecessor IMP-294):** `src/client/3d/adaptive_cinematic_camera.tsx`, `src/client/3d/camera_state_machine.ts`, `src/client/3d/cinematic_chase_camera.ts`, `src/client/3d/camera_kinematic_helpers.ts`, `src/client/3d/camera_location_beacon.tsx`, `src/client/3d/camera_soft_return.ts`, `src/client/3d/cinematic_spline_flyby.ts`, `tests/client/camera_soft_return_and_beacon.test.ts`, `tests/client/cinematic_spline_flyby.test.ts`, `tests/client/dramatic_pacing_camera.test.ts`, `tests/client/spatial_kinematics_camera.test.ts`

---

### Bảng 1: Phân bổ Ranh giới Phân hệ (Subsystem Boundary Alignment)
| Tệp Mã Nguồn | Phân Hệ | Vai Trò Kiến Trúc |
| :--- | :--- | :--- |
| `src/client/audio/synth_recipes_gameplay.ts` | `client-audio` | **MỚI**: Công thức âm thanh cơ chế bàn cờ (`synthesizeDiceRoll`, `synthesizeAuctionGavel`, `synthesizeConstructionSlam`, `synthesizeMoneyTransfer`, `synthesizePawnStep`) |
| `src/client/audio/synth_recipes_ambient.ts` | `client-audio` | **MỚI**: Công thức âm nền & môi trường sa bàn (`createOceanAmbientGraph`, `synthesizeJazzLoungeChords`, `synthesizeLighthouseFoghorn`, `synthesizeWaterSplash`) |
| `src/client/audio/synth_recipes_ui.ts` | `client-audio` | **MỚI**: Công thức âm thanh tương tác xúc giác 2D (`synthesizeCardFlip`, `synthesizeCoronationChime`, `synthesizeCarHorn`) |
| `src/client/audio/sound_synth_recipes.ts` | `client-audio` | **SỬA**: Facade Re-export mỏng tập hợp toàn bộ công thức âm thanh |
| `tests/client/sound_synth_recipes_modular.test.ts` | Living Test | **MỚI**: Living Contract Test kiểm tra trực tiếp tính khả dụng và hoạt động đúng chuẩn của các module sau bóc tách |

---

### Bảng 2: Ngân Sách Dòng Mã (LOC Accounting)
| Target physical file | Tier Classification | Baseline LOC | Expected LOC | Net Change | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/audio/synth_recipes_gameplay.ts` | Tier 1 (Domain/Server/Logic) | 0 | 155 | +155 | <= 400 | ✔️ Safe |
| `src/client/audio/synth_recipes_ambient.ts` | Tier 1 (Domain/Server/Logic) | 0 | 140 | +140 | <= 400 | ✔️ Safe |
| `src/client/audio/synth_recipes_ui.ts` | Tier 1 (Domain/Server/Logic) | 0 | 120 | +120 | <= 400 | ✔️ Safe |
| `src/client/audio/sound_synth_recipes.ts` | Tier 1 (Domain/Server/Logic) | 399 | 7 | -392 | <= 400 | ✔️ Safe |
| `tests/client/sound_synth_recipes_modular.test.ts` | Living Test | 0 | 185 | +185 | <= 600 | ✔️ Safe |

---

### Trạm 1: Hợp Đồng Kiểm Thử Độc Lập (RED Contract Tests)
**Target physical file**: `tests/client/sound_synth_recipes_modular.test.ts` (Tệp mới)

1. **TC-REC.01 [UC-RECIPES/MSS]**: Given AudioContext giả lập và AudioNode đích, When gọi `synthesizeDiceRoll` với volume 0.8, Then tạo ít nhất 4 dao động oscillator với tần số dải bandpass 2200Hz.
2. **TC-REC.02 [UC-RECIPES/MSS]**: Given AudioContext giả lập, When gọi `synthesizeAuctionGavel` với volume 0.9, Then kích hoạt 2 nhịp gõ đanh thép với tần số hạ từ 680Hz xuống 180Hz và dội thớ gỗ.
3. **TC-REC.03 [UC-RECIPES/MSS]**: Given AudioContext giả lập, When gọi `synthesizeConstructionSlam` với volume 1.0, Then kích hoạt sóng trầm Sub-bass 42Hz và tiếng nện bề mặt.
4. **TC-REC.04 [UC-RECIPES/MSS]**: Given AudioContext giả lập, When gọi `synthesizeMoneyTransfer` với volume 0.7, Then phát chuỗi 4 nốt arpeggio E6, G#6, B6, E7 ngân vang.
5. **TC-REC.05 [UC-RECIPES/MSS]**: Given AudioContext giả lập, When gọi `synthesizePawnStep` với volume 0.5 và pitchVariation 1.2, Then tạo dao động triangle với tần số cơ sở biến thiên theo tỷ lệ.
6. **TC-REC.06 [UC-RECIPES/MSS]**: Given AudioContext giả lập, When gọi `createOceanAmbientGraph` với volume 0.5, Then trả về đồ thị âm thanh biển gồm buffer source lặp, lowpass filter 320Hz, gain node và bộ điều chế LFO 0.1Hz.
7. **TC-REC.07 [UC-RECIPES/MSS]**: Given AudioContext giả lập, When gọi `synthesizeJazzLoungeChords` với volume 0.4, Then tạo hợp âm Rhodes 5 nốt jazz với bộ lọc lowpass 950Hz.
8. **TC-REC.08 [UC-RECIPES/MSS]**: Given AudioContext giả lập, When gọi `synthesizeLighthouseFoghorn` với volume 0.7, Then tạo sóng sawtooth dải tần 110Hz hạ dần về 105Hz kết hợp bandpass filter.
9. **TC-REC.09 [UC-RECIPES/MSS]**: Given AudioContext giả lập, When gọi `synthesizeWaterSplash` với volume 0.6, Then kích hoạt buffer nhiễu 0.35s quét tần số lowpass từ 800Hz về 200Hz.
10. **TC-REC.10 [UC-RECIPES/MSS]**: Given AudioContext giả lập, When gọi `synthesizeCardFlip` với volume 0.6, Then tạo nhiễu trắng lướt gió kết hợp dao động snap tần số 1600Hz.
11. **TC-REC.11 [UC-RECIPES/MSS]**: Given AudioContext giả lập, When gọi `synthesizeCoronationChime` với volume 0.7, Then phát 5 nốt hợp âm C Major kèm họa âm chuông vàng 2.76x ngân vang.
12. **TC-REC.12 [UC-RECIPES/MSS]**: Given AudioContext giả lập, When gọi `synthesizeCarHorn` với volume 0.5, Then phát đồng thời 2 nốt kèn xe tần số 440Hz và 554Hz.
13. **TC-REC.13 [UC-RECIPES/A1]**: Given volume âm hoặc bằng 0, When gọi `synthesizeDiceRoll` với volume bằng 0, Then thoát ngay lập tức và bảo toàn tài nguyên không tạo node.

---

### Trạm 2: Kế Hoạch Triển Khai Chi Tiết (Implementation Tasks)

#### Task 1: Tạo Module Âm Thanh Cơ Chế Bàn Cờ `src/client/audio/synth_recipes_gameplay.ts`
**Target physical file**: `src/client/audio/synth_recipes_gameplay.ts` (Tệp mới)

```typescript
// [UC-GAME-058/MSS] Procedural Gameplay WebAudio synthesis recipes
export function synthesizeDiceRoll(context: AudioContext, destination: AudioNode, volume: number): void {
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

export function synthesizeAuctionGavel(context: AudioContext, destination: AudioNode, volume: number): void;
export function synthesizeConstructionSlam(context: AudioContext, destination: AudioNode, volume: number): void;
export function synthesizeMoneyTransfer(context: AudioContext, destination: AudioNode, volume: number): void;
export function synthesizePawnStep(context: AudioContext, destination: AudioNode, volume: number, pitchVariation?: number): void;
```

#### Task 2: Tạo Module Âm Thanh Môi Trường Sa Bàn `src/client/audio/synth_recipes_ambient.ts`
**Target physical file**: `src/client/audio/synth_recipes_ambient.ts` (Tệp mới)

```typescript
// [UC-GAME-058/MSS] Procedural Ambient & Environment WebAudio synthesis recipes
export function createOceanAmbientGraph(context: AudioContext, destination: AudioNode, volume: number): {
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

export function synthesizeJazzLoungeChords(context: AudioContext, destination: AudioNode, volume: number): void;
export function synthesizeLighthouseFoghorn(context: AudioContext, destination: AudioNode, volume?: number): void;
export function synthesizeWaterSplash(context: AudioContext, destination: AudioNode, volume?: number): void;
```

#### Task 3: Tạo Module Âm Thanh Giao Diện Xúc Giác `src/client/audio/synth_recipes_ui.ts`
**Target physical file**: `src/client/audio/synth_recipes_ui.ts` (Tệp mới)

```typescript
// [UC-GAME-058/MSS] Procedural Tactile UI WebAudio synthesis recipes
export function synthesizeCardFlip(context: AudioContext, destination: AudioNode, volume: number): void {
  if (volume <= 0) return;
  const now = context.currentTime;
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

export function synthesizeCoronationChime(context: AudioContext, destination: AudioNode, volume: number): void;
export function synthesizeCarHorn(context: AudioContext, destination: AudioNode, volume?: number): void;
```

#### Task 4: Chuyển Đổi `sound_synth_recipes.ts` Thành Facade Re-export Mỏng
**Target physical file**: `src/client/audio/sound_synth_recipes.ts`

Snippet 4.1: Thay thế toàn bộ mã nguồn cũ bằng Facade Re-export sạch sẽ:
```typescript
<<<<
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
====
// [TC-IMP295/MSS] SoundSynthRecipes — Procedural WebAudio synthesis recipes facade
// Re-exports pure recipes from modular domains: gameplay, ambient, and tactile UI.

export * from './synth_recipes_gameplay';
export * from './synth_recipes_ambient';
export * from './synth_recipes_ui';
>>>>
```
