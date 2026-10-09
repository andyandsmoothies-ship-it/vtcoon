# KẾ HOẠCH TRIỂN KHAI MICRO-SLICE: BÓC TÁCH QUẢN LÝ CONTEXT SOUND ENGINE (IMP-299)
> **Phân hệ mục tiêu:** `client-audio`
> **Phạm vi kỹ thuật:** Giải phóng nợ dòng mã (LOC Debt) của `src/client/audio/sound_engine.ts` (hiện chạm mức báo động đỏ nguy cấp: 390/400 LOC, Tier 1, chỉ còn đúng 10 dòng mã trước trần cứng) bằng cách phân tách hệ thống khởi tạo AudioContext, bus graph, volume synchronization và context teardown sang `SoundEngineContextManager` tại `src/client/audio/sound_engine_context.ts` (~116 LOC). `sound_engine.ts` kế thừa `SoundEngineContextManager` và tinh gọn còn ~284 LOC.
> **Cam kết cốt lõi:**
> 1. **Pure Move 100% (Zero Semantic Mutation & Quarantine):** Bảo toàn nguyên vẹn 100% logic resolve AudioContext, gain buses, store synchronization và teardown. CẤM tự ý thêm event listener (`touchend`, `click`, unlock gesture) vào window/document để bảo toàn ranh giới cách ly bộ lọc cử chỉ và chống rò rỉ bộ nhớ.
> 2. **Naming Invariant (Bảo Toàn Ký Hiệu Singleton Export):** Giữ nguyên tuyệt đối tên định danh xuất khẩu PascalCase `export const SoundEngine = new SoundEngineImpl();` (chữ S hoa) tương thích ngược 100% với hơn 15 consumers trong codebase.
> 3. **Giải Phóng Triệt Để Cảnh Báo Vàng Tier 1:** Cả hai tệp `sound_engine_context.ts` (116 LOC) và `sound_engine.ts` (284 LOC) đều nằm sâu trong vùng xanh an toàn (< 300 LOC, trần 400 LOC Tier 1).
> 4. **Scaffolding Protocol & Semantic Behavioral RED:** Khởi tạo stub type-safe cho `sound_engine_context.ts` trước khi chạy test, bảo đảm test suite thất bại do runtime assertions thay vì loader error.
> 5. **Chống Bội Nhiễm Phạm Vi (Scope Bleed Prevention):** Tách bạch phạm vi trực tiếp của vé IMP-299 với dòng phụ thuộc working tree của các vé tiền nhiệm.
> **Baseline Working Tree Dependencies (Predecessor IMP-294..298):** `src/client/3d/adaptive_cinematic_camera.tsx`, `src/client/3d/camera_state_machine.ts`, `src/client/3d/cinematic_chase_camera.ts`, `src/client/audio/sound_synth_recipes.ts`, `src/client/store/game_store_types.ts`, `src/client/ui/actionable_notification.ts`, `src/client/3d/camera_kinematic_helpers.ts`, `src/client/3d/camera_location_beacon.tsx`, `src/client/3d/camera_soft_return.ts`, `src/client/3d/cinematic_spline_flyby.ts`, `src/client/3d/use_camera_gestures.ts`, `src/client/audio/synth_recipes_ambient.ts`, `src/client/audio/synth_recipes_gameplay.ts`, `src/client/audio/synth_recipes_ui.ts`, `src/client/store/game_store_state_types.ts`, `src/client/store/game_store_subtypes.ts`, `src/client/ui/actionable_notification_gameplay.ts`, `src/client/ui/actionable_notification_map.ts`, `src/client/ui/actionable_notification_system.ts`, `tests/client/actionable_notification_modular.test.ts`, `tests/client/camera_gestures.test.ts`, `tests/client/camera_soft_return_and_beacon.test.ts`, `tests/client/cinematic_spline_flyby.test.ts`, `tests/client/dramatic_pacing_camera.test.ts`, `tests/client/game_store_types_modular.test.ts`, `tests/client/sound_synth_recipes_modular.test.ts`, `tests/client/spatial_kinematics_camera.test.ts`
---
### Bảng 1: Phân bổ Ranh giới Phân hệ (Subsystem Boundary Alignment)
| Tệp Mã Nguồn | Phân Hệ | Vai Trò Kiến Trúc |
| :--- | :--- | :--- |
| `src/client/audio/sound_engine_context.ts` | `client-audio` | **MỚI**: Quản lý AudioContext lifecycle, WebAudio gain bus graph, volume sync và teardown |
| `src/client/audio/sound_engine.ts` | `client-audio` | **SỬA**: Kế thừa SoundEngineContextManager, tập trung vào sound dispatch và ambient scheduler |
| `tests/client/sound_engine_modular.test.ts` | Living Test | **MỚI**: Living Contract Test kiểm tra độc lập AudioContext lifecycle, bus connection và singleton parity |
---
### Bảng 2: Ngân Sách Dòng Mã (LOC Accounting)
| Target physical file | Tier Classification | Baseline LOC | Expected LOC | Net Change | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/audio/sound_engine_context.ts` | Tier 1 (Domain/Server/Logic) | 0 | 116 | +116 | <= 400 | ✔️ Safe |
| `src/client/audio/sound_engine.ts` | Tier 1 (Domain/Server/Logic) | 390 | 284 | -106 | <= 400 | ✔️ Safe |
| `tests/client/sound_engine_modular.test.ts` | Living Test | 0 | 145 | +145 | <= 600 | ✔️ Safe |
---
### Trạm 1: Hợp Đồng Kiểm Thử Độc Lập (RED Contract Tests)
**Target physical file**: `tests/client/sound_engine_modular.test.ts` (Tệp mới)
> **Kỷ luật Seam Discipline (Iron Law):** Không monkey-patch framework internals. Kiểm thử trực tiếp giá trị thực nghiệm quan sát được của `SoundEngineContextManager`, `SoundEngine` singleton, gain values và context states.
> **Quy chuẩn Scaffolding Stub Type-Safe:** Tệp mới được scaffold trước với kiểu dữ liệu tường minh, tuyệt đối CẤM `as any` và `as unknown as T`.
> **Kỷ luật Zero Loops in it():** Cấm tuyệt đối vòng lặp trong `it()`. Mật độ duy trì nghiêm ngặt trong dải vàng 1-4 asserts/test.

1. **TC-SE-MOD.01 [UC-SE-MOD/MSS]**: Given môi trường test với MockAudioContext, When gọi resolveAudioContext(), Then hàm trả về constructor MockAudioContext.
2. **TC-SE-MOD.02 [UC-SE-MOD/MSS]**: Given môi trường không có AudioContext trong window và globalThis, When gọi resolveAudioContext(), Then hàm trả về null an toàn.
3. **TC-SE-MOD.03 [UC-SE-MOD/MSS]**: Given SoundEngineContextManager mới khởi tạo, When truy xuất getContext(), Then đồ thị âm thanh khởi tạo masterGain, sfxBus và bgmBus.
4. **TC-SE-MOD.04 [UC-SE-MOD/MSS]**: Given đồ thị âm thanh đã khởi tạo, When kiểm tra các kết nối bus, Then sfxBus và bgmBus kết nối tới masterGain và masterGain kết nối tới destination.
5. **TC-SE-MOD.05 [UC-SE-MOD/MSS]**: Given âm lượng audio store là master 0.8 và sfx 0.5, When gọi getEffectiveSfxVolume(), Then giá trị trả về bằng 0.4.
6. **TC-SE-MOD.06 [UC-SE-MOD/MSS]**: Given âm lượng audio store là master 0.8 và bgm 0.6, When gọi getEffectiveBgmVolume(), Then giá trị trả về bằng 0.48.
7. **TC-SE-MOD.07 [UC-SE-MOD/MSS]**: Given audio store được đặt trạng thái isMuted là true, When gọi getEffectiveSfxVolume(), Then giá trị hiệu dụng sfx bằng 0.
8. **TC-SE-MOD.08 [UC-SE-MOD/MSS]**: Given audio store được đặt trạng thái isMuted là true, When gọi getEffectiveBgmVolume(), Then giá trị hiệu dụng bgm bằng 0.
9. **TC-SE-MOD.09 [UC-SE-MOD/MSS]**: Given audio store thay đổi âm lượng, When gọi syncVolumesWithStore(), Then setValueAtTime được gọi trên gain của các node bus.
10. **TC-SE-MOD.10 [UC-SE-MOD/MSS]**: Given AudioContext đang ở trạng thái suspended, When gọi resumeAudioContext(), Then trạng thái context được gọi resume thành công.
11. **TC-SE-MOD.11 [UC-SE-MOD/MSS]**: Given SoundEngineContextManager đang quản lý context và bus, When gọi disposeContext(), Then context được close và các tham chiếu gain node đặt về null.
12. **TC-SE-MOD.12 [UC-SE-MOD/MSS]**: Given lớp SoundEngineImpl kế thừa từ SoundEngineContextManager, When kiểm tra nguyên mẫu prototype với instanceof, Then đối tượng trả về true.
13. **TC-SE-MOD.13 [UC-SE-MOD/MSS]**: Given singleton SoundEngine xuất khẩu từ sound_engine.ts, When kiểm tra định danh PascalCase và instance, Then SoundEngine là một instance của SoundEngineImpl.
14. **TC-SE-MOD.14 [UC-SE-MOD/MSS]**: Given AudioContext bị thiếu hoặc null trong môi trường headless, When gọi SoundEngine.playDiceRoll(), Then phương thức bypass an toàn không ném lỗi.
15. **TC-SE-MOD.15 [UC-SE-MOD/MSS]**: Given SoundEngine đang chạy các hiệu ứng âm thanh lặp, When gọi SoundEngine.stopAll(), Then các tiến trình lặp được dọn dẹp sạch sẽ mà không phát sinh lỗi.
16. **TC-SE-MOD.16 [UC-SE-MOD/MSS]**: Given việc import SoundEngine và SoundEngineContextManager từ hai tệp khác nhau, When kiểm tra cây phụ thuộc module, Then không phát sinh circular dependency.
---
### Trạm 2: Kế Hoạch Triển Khai Chi Tiết (Implementation Tasks)

#### Task 1: Khởi Tạo Tệp Quản Lý Context `src/client/audio/sound_engine_context.ts`
**Target physical file**: `src/client/audio/sound_engine_context.ts` (Tệp mới)

```typescript
// [IMP-299] SoundEngine Web Audio Context & Bus Graph Manager
import { useAudioStore } from '../store/audio_store.js';

export type AudioContextClass = typeof AudioContext;

export function resolveAudioContext(): AudioContextClass | null {
  if (typeof window !== 'undefined') {
    const ctx = window.AudioContext || window.webkitAudioContext;
    if (ctx) return ctx;
  }
  if (typeof globalThis !== 'undefined' && 'AudioContext' in globalThis) {
    return globalThis.AudioContext;
  }
  return null;
}

export class SoundEngineContextManager {
  protected ctx: AudioContext | null = null;
  public masterGain: GainNode | null = null;
  public sfxBus: GainNode | null = null;
  public bgmBus: GainNode | null = null;
  private unsubscribeStore: (() => void) | null = null;

  public getContext(): AudioContext | null {
    if (!this.ctx) {
      const CtxClass = resolveAudioContext();
      if (CtxClass) {
        try {
          this.ctx = new CtxClass();
          this.initAudioGraph(this.ctx);
        } catch {
          this.ctx = null;
        }
      }
    }
    return this.ctx;
  }

  protected initAudioGraph(context: AudioContext): void {
    try {
      this.masterGain = context.createGain();
      this.sfxBus = context.createGain();
      this.bgmBus = context.createGain();

      this.sfxBus.connect(this.masterGain);
      this.bgmBus.connect(this.masterGain);
      this.masterGain.connect(context.destination);

      this.syncVolumesWithStore(context.currentTime);

      if (!this.unsubscribeStore) {
        this.unsubscribeStore = useAudioStore.subscribe(() => {
          if (this.ctx) {
            this.syncVolumesWithStore(this.ctx.currentTime);
          }
        });
      }
    } catch {
      // Safe fallback in restricted environments
    }
  }

  public syncVolumesWithStore(atTime?: number): void {
    const { isMuted, masterVolume, sfxVolume, bgmVolume } = useAudioStore.getState();
    const t = atTime ?? this.ctx?.currentTime ?? 0;

    if (this.masterGain) {
      const effectiveMaster = isMuted ? 0 : Math.max(0, Math.min(1, masterVolume));
      this.masterGain.gain.setValueAtTime(effectiveMaster, t);
    }
    if (this.sfxBus) {
      const effectiveSfx = Math.max(0, Math.min(1, sfxVolume));
      this.sfxBus.gain.setValueAtTime(effectiveSfx, t);
    }
    if (this.bgmBus) {
      const effectiveBgm = Math.max(0, Math.min(1, bgmVolume));
      this.bgmBus.gain.setValueAtTime(effectiveBgm, t);
    }
  }

  public async resumeAudioContext(): Promise<void> {
    const context = this.getContext();
    if (context && context.state === 'suspended') {
      try {
        await context.resume();
      } catch {
        // Fallback im lặng khi trình duyệt chặn tương tác
      }
    }
  }

  public getEffectiveSfxVolume(): number {
    const { isMuted, masterVolume, sfxVolume } = useAudioStore.getState();
    return isMuted ? 0 : Math.max(0, Math.min(1, masterVolume * sfxVolume));
  }

  public getEffectiveBgmVolume(): number {
    const { isMuted, masterVolume, bgmVolume } = useAudioStore.getState();
    return isMuted ? 0 : Math.max(0, Math.min(1, masterVolume * bgmVolume));
  }

  public disposeContext(): void {
    if (this.unsubscribeStore) {
      this.unsubscribeStore();
      this.unsubscribeStore = null;
    }
    if (this.ctx && this.ctx.state !== 'closed') {
      try {
        void this.ctx.close();
      } catch {
        // Safe close
      }
    }
    this.ctx = null;
    this.masterGain = null;
    this.sfxBus = null;
    this.bgmBus = null;
  }
}
```

#### Task 2: Kế Thừa Context Manager và Tinh Gọn `src/client/audio/sound_engine.ts`
**Target physical file**: `src/client/audio/sound_engine.ts` (Sửa đổi)

```typescript
<<<<
type AudioContextClass = typeof AudioContext;

function resolveAudioContext(): AudioContextClass | null {
  if (typeof window !== 'undefined') {
    const ctx = window.AudioContext || window.webkitAudioContext;
    if (ctx) return ctx;
  }
  if (typeof globalThis !== 'undefined' && 'AudioContext' in globalThis) {
    return globalThis.AudioContext;
  }
  return null;
}

export class SoundEngineImpl {
  private ctx: AudioContext | null = null;
  public masterGain: GainNode | null = null;
  public sfxBus: GainNode | null = null;
  public bgmBus: GainNode | null = null;
  private unsubscribeStore: (() => void) | null = null;
  private lastGavelTime = 0;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private oceanAmbientNodes: {
    source: AudioBufferSourceNode;
    filter: BiquadFilterNode;
    gain: GainNode;
    lfo?: OscillatorNode;
  } | null = null;

  public getContext(): AudioContext | null {
    if (!this.ctx) {
      const CtxClass = resolveAudioContext();
      if (CtxClass) {
        try {
          this.ctx = new CtxClass();
          this.initAudioGraph(this.ctx);
        } catch {
          this.ctx = null;
        }
      }
    }
    return this.ctx;
  }

  private initAudioGraph(context: AudioContext): void {
    try {
      this.masterGain = context.createGain();
      this.sfxBus = context.createGain();
      this.bgmBus = context.createGain();

      this.sfxBus.connect(this.masterGain);
      this.bgmBus.connect(this.masterGain);
      this.masterGain.connect(context.destination);

      this.syncVolumesWithStore(context.currentTime);

      if (!this.unsubscribeStore) {
        this.unsubscribeStore = useAudioStore.subscribe(() => {
          if (this.ctx) {
            this.syncVolumesWithStore(this.ctx.currentTime);
          }
        });
      }
    } catch {
      // Safe fallback in restricted environments
    }
  }

  public syncVolumesWithStore(atTime?: number): void {
    const { isMuted, masterVolume, sfxVolume, bgmVolume } = useAudioStore.getState();
    const t = atTime ?? this.ctx?.currentTime ?? 0;

    if (this.masterGain) {
      const effectiveMaster = isMuted ? 0 : Math.max(0, Math.min(1, masterVolume));
      this.masterGain.gain.setValueAtTime(effectiveMaster, t);
    }
    if (this.sfxBus) {
      const effectiveSfx = Math.max(0, Math.min(1, sfxVolume));
      this.sfxBus.gain.setValueAtTime(effectiveSfx, t);
    }
    if (this.bgmBus) {
      const effectiveBgm = Math.max(0, Math.min(1, bgmVolume));
      this.bgmBus.gain.setValueAtTime(effectiveBgm, t);
    }
  }

  public async resumeAudioContext(): Promise<void> {
    const context = this.getContext();
    if (context && context.state === 'suspended') {
      try {
        await context.resume();
      } catch {
        // Fallback im lặng khi trình duyệt chặn tương tác
      }
    }
  }

  private getEffectiveSfxVolume(): number {
    const { isMuted, masterVolume, sfxVolume } = useAudioStore.getState();
    return isMuted ? 0 : Math.max(0, Math.min(1, masterVolume * sfxVolume));
  }

  private getEffectiveBgmVolume(): number {
    const { isMuted, masterVolume, bgmVolume } = useAudioStore.getState();
    return isMuted ? 0 : Math.max(0, Math.min(1, masterVolume * bgmVolume));
  }
====
import { SoundEngineContextManager, resolveAudioContext } from './sound_engine_context.js';

export { SoundEngineContextManager, resolveAudioContext };

export class SoundEngineImpl extends SoundEngineContextManager {
  private lastGavelTime = 0;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private oceanAmbientNodes: {
    source: AudioBufferSourceNode;
    filter: BiquadFilterNode;
    gain: GainNode;
    lfo?: OscillatorNode;
  } | null = null;
>>>>
```

```typescript
<<<<
  public dispose(): void {
    this.stopAll();
    if (this.unsubscribeStore) {
      this.unsubscribeStore();
      this.unsubscribeStore = null;
    }
    if (this.ctx && this.ctx.state !== 'closed') {
      try {
        void this.ctx.close();
      } catch {
        // Safe close
      }
    }
    this.ctx = null;
    this.masterGain = null;
    this.sfxBus = null;
    this.bgmBus = null;
  }
====
  public dispose(): void {
    this.stopAll();
    this.disposeContext();
  }
>>>>
```

---
### Trạm 3: Thẩm Định Độc Lập Từ Đĩa Vật Lý (Independent Station 3 Reviews)
* **Trạm 3.1 (Spec & Scope Gatekeeper)**: Rà soát 100% độ trung thực của Plan, không phát sinh file ngoài phân hệ `client-audio`, bảo đảm Zero Scope Creep.
* **Trạm 3.2 (Architecture & Anti-Slop Auditor)**: Rà soát Anti-Slop, an toàn bộ nhớ/timer, assertion density trong dải vàng 1-4 asserts/test, không vòng lặp trong `it()`, và kiểm tra prototype chain kế thừa của SoundEngine.

---
### Trạm 4: Kiểm Thử Biến Dị & Cơ Chế Biên (Chaos & Mutation Sentinel)
Lệnh kích hoạt kiểm thử đột biến:
```bash
npm run sentinel -- --ticket IMP-299 --test tests/client/sound_engine_modular.test.ts --src src/client/audio/sound_engine_context.ts
```
* **Mục tiêu**: Vượt qua tối thiểu 10 mutants bị tiêu diệt (kill rate: 100%, 0 survived).
* **Đối tượng đột biến trọng yếu**:
  - Đột biến công thức âm lượng hiệu dụng (`masterVolume * sfxVolume` -> `masterVolume + sfxVolume` hoặc `0`).
  - Đột biến kiểm tra tắt tiếng `isMuted ? 0 : ...` -> `isMuted ? 1 : ...`.
  - Đột biến trạng thái `context.state === 'suspended'`.

---
### Trạm 5: Kiểm Toán Bằng Chứng Vật Lý Toàn Diện (Evidence Audit & Reporting)
* **Lệnh xác thực vật lý**: `node scripts/check_evidence.mjs IMP-299`
* **Lệnh xuất bản báo cáo**: `npm run report -- IMP-299`

