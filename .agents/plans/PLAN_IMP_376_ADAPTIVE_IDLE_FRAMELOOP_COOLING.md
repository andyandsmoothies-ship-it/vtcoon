# Plan IMP-376: Adaptive Idle Frameloop Cooldown & Thermal Hardening (Ticket IMP-376)

## 0. Context & Architectural Rationale
- **Physical Baseline & In-Game Telemetry Findings**:
  - Theo báo cáo tổng hợp ([`DRAW_CALL_OPTIMIZATION_MASTER_SYNTHESIS_REPORT.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/diagnostics/DRAW_CALL_OPTIMIZATION_MASTER_SYNTHESIS_REPORT.md)):
    - Trên các thiết bị di động (iPhone & Android), game chạy mượt 55–60 FPS khi máy mát lúc đầu trận, nhưng sau 2–3 phút thi đấu, nhiệt lượng tích tụ do WebGL liên tục phát ra hàng trăm draw calls mỗi 16.6ms khiến phần cứng kích hoạt **DVFS Thermal Throttling**, ép xung CPU/GPU giảm 40–50% và FPS tụt dốc còn 14–27 FPS.
    - Trong 70–80% thời gian ván đấu, bàn cờ ở trạng thái tĩnh (idle) — người chơi đang suy nghĩ chiến lược, đọc bảng tài chính (`property_deed`), hoặc chờ đợi đối thủ cân nhắc giao dịch (`trade`).
    - Duy trì vòng lặp 60/120 Hz liên tục vẽ 480+ draw calls trong trạng thái tĩnh là lãng phí năng lượng bán dẫn cực kỳ nghiêm trọng.
- **Refined Balanced Architecture (Micro-Slice Giai đoạn 2 - Hạ Nhiệt Thông Minh, 100% Hoạt Ảnh Mịn Màng, Zero Visual Loss)**:
  1. **Tách biệt Pure View-Model Seam (`idle_cooling_helpers.ts`)**:
     - Tuân thủ nghiêm ngặt *Graphics & UI View-Model Seam Invariant*: Mọi logic tính toán pacing thời gian, phân loại modal tĩnh/động (`is3DModalActive`), phát hiện chuyển động (`isGameMotionActive`), kiểm tra dictionary 0-allocation (`hasActiveDictionaryKeys`), thời gian ân hạn nghỉ (`calculateIdleGraceRemaining`), và chế độ làm mát (`calculateIdleCoolingMode`, `shouldRenderFrame`) được đóng gói thành các hàm thuần túy (pure functions), kiểm thử 100% không phụ thuộc WebGL context.
  2. **Thời Gian Ân Hạn Động Học (Kinematic SSOT Timing Invariant)**:
     - Thời gian nghỉ ân hạn $\tau_{\text{grace}} = 1200\text{ms}$ được xác lập từ phương trình động học: $\max(\tau_{\text{camera\_return}} = 800\text{ms}, \tau_{\text{dice\_settle}} = 600\text{ms}, \tau_{\text{pawn\_squash}} = 400\text{ms}) + 400\text{ms}$ biên an toàn. Khi vừa kết thúc chuyển động hoặc thay đổi ô focus, hệ thống giữ nguyên 60 FPS trong 1200ms để camera và hiệu ứng hạ cánh mượt mà trước khi chuyển sang chế độ làm mát.
  3. **Phân Loại Modal Tĩnh vs Động & Chống Khóa Chết Focus (Focus & Modal Taxonomy Decoupling)**:
     - Các modal 2D đọc thông tin (`property_deed`, `trade`, `settings`, `audit_report`, `game_over`) KHÔNG bị coi là chuyển động vĩnh viễn. Khi người chơi đọc khế đất hay đàm phán giao dịch, sau 1200ms camera zoom xong, hệ thống tự động kích hoạt chế độ làm mát 30 FPS.
     - Ô tiêu điểm camera (`cameraFocusCell`) được theo dõi theo **sự kiện dịch chuyển trạng thái** (`prevCameraFocusCellRef`): chỉ kích hoạt ân hạn 1200ms lúc vừa đổi ô, không bị khóa cứng ở 60 FPS suốt thời gian người chơi đọc khế đất.
     - Modal 3D tương tác động (`'auction'` và `'event'` lật thẻ 3D hào quang bụi vàng `EventCard3D`) được bảo toàn tuyệt đối ở 60 FPS trong suốt quá trình hiển thị.
  4. **Bắt Sự Kiện Giai Đoạn Capture & Khử Rác Bộ Nhớ (Capture-Phase & Zero-Alloc Invariants)**:
     - Lắng nghe sự kiện chạm ở **pha Capture** (`{ capture: true }`) trên window để đón đầu sự kiện trước khi các component con gọi `e.stopPropagation()`, triệt tiêu hoàn toàn lỗi kẹt vĩnh viễn ở 60 FPS.
     - Dọn dẹp an toàn khi mất tiêu điểm cửa sổ (`blur`), reset danh sách con trỏ `activePointersRef`.
     - Sử dụng hàm kiểm tra dictionary 0-allocation `hasActiveDictionaryKeys` thay thế `Object.keys()` trong `useFrame`, triệt tiêu hoàn toàn áp lực dọn rác Heap Churn 120-240 mảng/giây.
  5. **Cơ Chế Render Pacing & Chống Quá Nhiệt 120Hz ProMotion Với Biên Dung Sai Jitter (2ms Slack) & Khử Khuẩn NaN**:
     - Tuyệt đối KHÔNG thay đổi động thuộc tính `frameloop` trên Canvas (vì `setFrameloop` trong R3F làm reset `state.clock.elapsedTime = 0`, gây giật lùi vị trí đoàn tàu, sóng nước và hải âu).
     - Khử khuẩn triệt để số học bằng `Number.isFinite()` chống đóng băng vĩnh viễn màn hình khi gặp `NaN` delta.
     - Thay vào đó, trên môi trường Mobile (`isMobile = true`), `AdaptiveIdleCoolingController` đăng ký `useFrame` với `renderPriority = 1` để kiểm soát nhịp gọi `gl.render(scene, camera)`.
     - **Chống quá nhiệt 120Hz ProMotion**: Trên các màn hình tần số quét cao (iPhone 13–16 Pro, Galaxy S21–S24), RAF phát xung ở 120Hz. Hàm `shouldRenderFrame` chủ động kẹp trần 60 FPS ($16.6\text{ms}$) cho chế độ `ACTIVE_60FPS`, triệt tiêu hoàn toàn nguy cơ GPU mobile phải vẽ 120 lần/giây.
     - **Bảo toàn 60 FPS trên màn hình 60Hz với 2ms Jitter Slack (`JITTER_SLACK_SEC = 0.002`)**: Đảm bảo các khung hình RAF đến ở $16.4\text{ms}\text{--}16.8\text{ms}$ không bị rơi khung (dropped frame) oan uổng, duy trì độ mượt 60/60 FPS tuyệt đối.
     - Khi chuyển động tích cực (`isRolling`, `isPawnAnimating` bao gồm `pawnAnimationQueue`, `activeSlams` xây nhà, cử chỉ chạm đa điểm, mở modal 3D): kết xuất tối đa **60 FPS**.
     - Khi bàn cờ tĩnh sau thời gian ân hạn: điều tiết nhịp kết xuất về **30 FPS** ($\Delta t \approx 33.3\text{ms}$, bỏ qua khung hình xen kẽ). Khung hình giảm 50% số lần vẽ GPU/giây, cắt giảm tức thì 50% xung nhiệt, cho phép SoC tản nhiệt hiệu quả.
     - Khi tab chạy ngầm (`document.hidden = true`): lập tức treo kết xuất (0 FPS), triệt tiêu hao pin ngầm.
     - Khi quay trở lại foreground: làm mới cửa sổ ân hạn 1200ms để chống giật hình khựng khung (anti-cold-stutter).
     - Trên môi trường Desktop (`isMobile = false`): giữ nguyên `renderPriority = 0` mặc định, nhường quyền kết xuất cho `PostProcessingPipeline` ở 60 FPS toàn phần.

## 1. Physical Target Files & Honest LOC Accounting
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/idle_cooling_helpers.ts` | Tier 2 (UI/3D/Views) | 0 | 160 | +160 | <= 500 | 🆕 Tệp mới |
| `src/client/3d/adaptive_idle_cooling_controller.tsx` | Tier 2 (UI/3D/Views) | 0 | 125 | +125 | <= 500 | 🆕 Tệp mới |
| `src/client/game_canvas.tsx` | Tier 2 (UI/3D/Views) | 232 | 234 | +2 | <= 500 | Safe (< 250 LOC) |
| `tests/client/imp376_adaptive_idle_frameloop_cooling.test.ts` | Living Test | 0 | 190 | +190 | <= 600 | 🆕 Tệp mới |
| `tests/helpers/r3f_test_harness.ts` | Living Test | 155 | 161 | +6 | <= 600 | Safe (< 200 LOC) |

## 2. In-Action Visual Capture Registration
- Scenario: `camera_chase_normal` (`scripts/visual_scenarios/camera_chase_normal.js`)
- Verification Command: `node scripts/capture_visual_evidence.mjs --scenario camera_chase_normal`
- Viewport: Desktop HD (`1920x1080`) & Mobile WebKit (`390x844`)
- Target Assertion: Chuyển động nhảy quân cờ chạy trơn tru 60 FPS, chuyển tiếp êm dịu sang chế độ nghỉ 30 FPS không giật lag, màn hình hiển thị sắc nét trên cả 2 khung nhìn di động và máy tính.

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
- Viết bộ kiểm thử hợp đồng độc lập tại `tests/client/imp376_adaptive_idle_frameloop_cooling.test.ts`:
  - TC-376.01 [UC-MODAL-MOTION-TAXONOMY/MSS]: Given modal identifiers, When calling `is3DModalActive`, Then returns true for dynamic 3D auction and event card modals and false for static 2D reading modals.
  - TC-376.02 [UC-ZERO-ALLOC-DICTIONARY-CHECK/MSS]: Given dictionary records, When calling `hasActiveDictionaryKeys`, Then returns true if record contains properties without allocating heap arrays and false for empty or null records.
  - TC-376.03 [UC-MOTION-DETECTION/MSS]: Given game store activity flags, pawn animation queue, and VFX states, When calling `isGameMotionActive`, Then returns true if rolling, pawn hopping, queue non-empty, active slam VFX playing, or 3D modal active, and false when completely idle.
  - TC-376.04 [UC-IDLE-GRACE-PERIOD/MSS]: Given motion finishes at timestamp T, When calling `calculateIdleGraceRemaining`, Then returns positive remaining grace duration within 1200ms window and 0 after expiration.
  - TC-376.05 [UC-COOLING-MODE-SELECTION/MSS]: Given device and motion states, When calling `calculateIdleCoolingMode`, Then selects ACTIVE_60FPS during motion, IDLE_COOLING_30FPS on mobile after grace expiry, and SUSPENDED when document is hidden.
  - TC-376.06 [UC-FRAME-PACING-MATH/MSS]: Given active and idle pacing modes on mobile with 2ms jitter slack and NaN inputs, When calling `shouldRenderFrame`, Then sanitizes non-finite deltas, clamps active mode to 60 FPS ceiling on 120Hz ProMotion screens, preserves 60 FPS on 60Hz screens with slight jitter (16.5ms), and throttles idle mode to 30 FPS.
  - TC-376.07 [UC-CONTROLLER-R3F-WIRING/MSS]: Given AdaptiveIdleCoolingController mounted in R3F test harness on mobile with capture-phase pointer interaction, When frame clock advances, Then gates gl.render calls accurately, avoids heap allocation churn, and preserves 60 FPS during pinch gestures without pointerup stoppage.
  - TC-376.08 [UC-CALLSITE-CANVAS-WIRING/MSS]: Given GameCanvas rendered in component tree, When inspecting Canvas children, Then mounts AdaptiveIdleCoolingController with isMobile prop wired to device state.

### Station 2: Implementation (GREEN)

#### Task 1: Khởi tạo module tính toán thuần túy `src/client/3d/idle_cooling_helpers.ts`
**Target physical file**: `src/client/3d/idle_cooling_helpers.ts` (Tạo mới)
```typescript
// [UI-S02/MSS][IMP-376] idle_cooling_helpers.ts — Pure helper logic for adaptive idle frameloop cooling
export type IdleCoolingMode = 'ACTIVE_60FPS' | 'IDLE_COOLING_30FPS' | 'SUSPENDED_BACKGROUND';

export const JITTER_SLACK_SEC = 0.002;

export const IDLE_COOLING_CONFIG = {
  activeTargetFps: 60,
  idleTargetFps: 30,
  activeIntervalSec: 1 / 60,
  idleIntervalSec: 1 / 30,
  gracePeriodMs: 1200,
} as const;

export interface MotionDetectionParams {
  readonly isRolling?: boolean;
  readonly isPawnAnimating?: boolean;
  readonly isCameraTransitioning?: boolean;
  readonly isUserInteracting?: boolean;
  readonly activeModal?: string | null;
  readonly hasActiveVfx?: boolean;
}

export function is3DModalActive(modal: string | null | undefined): boolean {
  if (!modal) return false;
  return modal === 'auction' || modal === 'event';
}

export function hasActiveDictionaryKeys(dict?: Record<string | number, unknown> | null): boolean {
  if (!dict) return false;
  for (const _ in dict) return true;
  return false;
}

export function isGameMotionActive(params: MotionDetectionParams): boolean {
  return Boolean(
    params.isRolling ||
    params.isPawnAnimating ||
    params.isCameraTransitioning ||
    params.isUserInteracting ||
    is3DModalActive(params.activeModal) ||
    params.hasActiveVfx
  );
}

export function calculateIdleGraceRemaining(
  lastMotionTimeMs: number,
  nowMs: number,
  gracePeriodMs = IDLE_COOLING_CONFIG.gracePeriodMs
): number {
  if (!Number.isFinite(lastMotionTimeMs) || !Number.isFinite(nowMs) || !Number.isFinite(gracePeriodMs)) {
    return 0;
  }
  const elapsed = nowMs - lastMotionTimeMs;
  if (elapsed < 0) return gracePeriodMs;
  const remaining = gracePeriodMs - elapsed;
  return remaining > 0 ? remaining : 0;
}

export interface IdleCoolingParams {
  readonly isMobile: boolean;
  readonly isMotionActive: boolean;
  readonly isDocumentHidden?: boolean;
  readonly remainingGraceMs: number;
}

export function calculateIdleCoolingMode(params: IdleCoolingParams): IdleCoolingMode {
  if (params.isDocumentHidden) {
    return 'SUSPENDED_BACKGROUND';
  }
  if (!params.isMobile) {
    return 'ACTIVE_60FPS';
  }
  if (params.isMotionActive || params.remainingGraceMs > 0) {
    return 'ACTIVE_60FPS';
  }
  return 'IDLE_COOLING_30FPS';
}

export interface FramePacingParams {
  readonly mode: IdleCoolingMode;
  readonly isMobile: boolean;
  readonly deltaSec: number;
  readonly accumulatedDeltaSec: number;
  readonly targetIdleFps?: number;
  readonly jitterSlackSec?: number;
}

export interface FramePacingResult {
  readonly shouldRender: boolean;
  readonly nextAccumulatedDeltaSec: number;
}

export function shouldRenderFrame(params: FramePacingParams): FramePacingResult {
  const {
    mode,
    isMobile,
    deltaSec,
    accumulatedDeltaSec,
    targetIdleFps = IDLE_COOLING_CONFIG.idleTargetFps,
    jitterSlackSec = JITTER_SLACK_SEC,
  } = params;

  if (mode === 'SUSPENDED_BACKGROUND') {
    return { shouldRender: false, nextAccumulatedDeltaSec: 0 };
  }

  const safeDelta = Number.isFinite(deltaSec) ? Math.max(0, deltaSec) : 0;
  const safeAccum = Number.isFinite(accumulatedDeltaSec) ? Math.max(0, accumulatedDeltaSec) : 0;
  const currentAccum = safeAccum + safeDelta;

  if (mode === 'ACTIVE_60FPS') {
    if (isMobile) {
      const activeInterval = IDLE_COOLING_CONFIG.activeIntervalSec;
      if (currentAccum >= activeInterval - jitterSlackSec) {
        const remainder = currentAccum - activeInterval;
        return {
          shouldRender: true,
          nextAccumulatedDeltaSec: remainder > 0 && remainder < activeInterval ? remainder : 0,
        };
      }
      return {
        shouldRender: false,
        nextAccumulatedDeltaSec: currentAccum,
      };
    }
    return { shouldRender: true, nextAccumulatedDeltaSec: 0 };
  }

  // IDLE_COOLING_30FPS
  const safeTargetFps = targetIdleFps > 0 ? targetIdleFps : 30;
  const targetInterval = 1 / safeTargetFps;

  if (currentAccum >= targetInterval - jitterSlackSec) {
    const remainder = currentAccum - targetInterval;
    return {
      shouldRender: true,
      nextAccumulatedDeltaSec: remainder > 0 && remainder < targetInterval ? remainder : 0,
    };
  }

  return {
    shouldRender: false,
    nextAccumulatedDeltaSec: currentAccum,
  };
}
```

#### Task 2: Khởi tạo controller điều phối render `src/client/3d/adaptive_idle_cooling_controller.tsx`
**Target physical file**: `src/client/3d/adaptive_idle_cooling_controller.tsx` (Tạo mới)
```typescript
// [IMP-376/MSS] Adaptive Idle Frameloop Cooling Controller
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store/game_store';
import { useVfxStore } from '../store/vfx_store';
import {
  isGameMotionActive,
  calculateIdleGraceRemaining,
  calculateIdleCoolingMode,
  shouldRenderFrame,
  hasActiveDictionaryKeys,
  type IdleCoolingMode,
} from './idle_cooling_helpers';

export interface AdaptiveIdleCoolingControllerProps {
  readonly isMobile: boolean;
}

export function AdaptiveIdleCoolingController({ isMobile }: AdaptiveIdleCoolingControllerProps): null {
  const lastMotionTimeRef = useRef<number>(Date.now());
  const accumulatedDeltaRef = useRef<number>(0);
  const currentModeRef = useRef<IdleCoolingMode>('ACTIVE_60FPS');
  const activePointersRef = useRef<Set<number>>(new Set());
  const prevCameraFocusCellRef = useRef<number | null>(null);

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      activePointersRef.current.add(e.pointerId);
      lastMotionTimeRef.current = Date.now();
    };
    const handlePointerUp = (e: PointerEvent) => {
      activePointersRef.current.delete(e.pointerId);
      lastMotionTimeRef.current = Date.now();
    };
    const handleWindowBlur = () => {
      activePointersRef.current.clear();
    };
    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && !document.hidden) {
        lastMotionTimeRef.current = Date.now();
        accumulatedDeltaRef.current = 0;
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('pointerdown', handlePointerDown, { capture: true });
      window.addEventListener('pointerup', handlePointerUp, { capture: true });
      window.addEventListener('pointercancel', handlePointerUp, { capture: true });
      window.addEventListener('blur', handleWindowBlur);
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('pointerdown', handlePointerDown, { capture: true });
        window.removeEventListener('pointerup', handlePointerUp, { capture: true });
        window.removeEventListener('pointercancel', handlePointerUp, { capture: true });
        window.removeEventListener('blur', handleWindowBlur);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, []);

  useFrame(({ gl, scene, camera }, delta) => {
    if (!isMobile) return;

    const isHidden = typeof document !== 'undefined' && document.hidden;
    const isRolling = useGameStore.getState().isRolling;
    const isPawnAnimating = Boolean(
      useGameStore.getState().activePawnAnimation?.isAnimating ||
      (useGameStore.getState().pawnAnimationQueue?.length ?? 0) > 0
    );
    const cameraFocusCell = useGameStore.getState().cameraFocusCell;
    const activeModal = useGameStore.getState().activeModal;
    const vfxState = useVfxStore.getState();
    const hasActiveVfx = Boolean(
      vfxState.activeScreenShake !== null ||
      hasActiveDictionaryKeys(vfxState.activeSlams) ||
      hasActiveDictionaryKeys(vfxState.activePawnReactions)
    );

    let isCameraFocusChanged = false;
    if (cameraFocusCell !== prevCameraFocusCellRef.current) {
      prevCameraFocusCellRef.current = cameraFocusCell;
      isCameraFocusChanged = true;
      lastMotionTimeRef.current = Date.now();
    }

    const isMotion = isGameMotionActive({
      isRolling,
      isPawnAnimating,
      isCameraTransitioning: isCameraFocusChanged,
      isUserInteracting: activePointersRef.current.size > 0,
      activeModal,
      hasActiveVfx,
    });

    const now = Date.now();
    if (isMotion) {
      lastMotionTimeRef.current = now;
    }

    const graceRemaining = calculateIdleGraceRemaining(lastMotionTimeRef.current, now);
    const mode = calculateIdleCoolingMode({
      isMobile,
      isMotionActive: isMotion,
      isDocumentHidden: isHidden,
      remainingGraceMs: graceRemaining,
    });
    currentModeRef.current = mode;

    const pacing = shouldRenderFrame({
      mode,
      isMobile,
      deltaSec: delta,
      accumulatedDeltaSec: accumulatedDeltaRef.current,
    });
    accumulatedDeltaRef.current = pacing.nextAccumulatedDeltaSec;

    if (pacing.shouldRender && gl && typeof gl.render === 'function') {
      gl.render(scene, camera);
    }
  }, isMobile ? 1 : 0);

  return null;
}
```

#### Task 3: Bổ sung gián điệp `render` vào chuẩn kiểm thử `tests/helpers/r3f_test_harness.ts`
**Target physical file**: `tests/helpers/r3f_test_harness.ts`
```typescript
<<<<
export interface MockR3FGl {
  readonly getPixelRatio: () => number;
  readonly setPixelRatio?: (dpr: number) => void;
  readonly info?: {
====
export interface MockR3FGl {
  readonly getPixelRatio: () => number;
  readonly setPixelRatio?: (dpr: number) => void;
  readonly render?: (scene?: unknown, camera?: unknown) => void;
  readonly info?: {
>>>>
```

```typescript
<<<<
export class R3FTestHarness {
  private callbacks: Array<R3FFrameCallback> = [];
  private lastSetDpr: number | null = null;
  private currentElapsedTime = 0;
  private pixelRatio = 1.0;

  public readonly state: MockR3FRootState;
====
export class R3FTestHarness {
  private callbacks: Array<R3FFrameCallback> = [];
  private lastSetDpr: number | null = null;
  private currentElapsedTime = 0;
  private pixelRatio = 1.0;
  public renderCallCount = 0;

  public readonly state: MockR3FRootState;
>>>>
```

```typescript
<<<<
      gl: {
        getPixelRatio: () => this.pixelRatio,
        setPixelRatio: (dpr: number) => {
          this.pixelRatio = dpr;
          this.lastSetDpr = dpr;
        },
        info: {
====
      gl: {
        getPixelRatio: () => this.pixelRatio,
        setPixelRatio: (dpr: number) => {
          this.pixelRatio = dpr;
          this.lastSetDpr = dpr;
        },
        render: () => {
          this.renderCallCount++;
        },
        info: {
>>>>
```

```typescript
<<<<
  public reset(): void {
    this.callbacks = [];
    this.lastSetDpr = null;
    this.currentElapsedTime = 0;
    this.state.clock.elapsedTime = 0;
  }
====
  public reset(): void {
    this.callbacks = [];
    this.lastSetDpr = null;
    this.renderCallCount = 0;
    this.currentElapsedTime = 0;
    this.state.clock.elapsedTime = 0;
  }
>>>>
```

#### Task 4: Đấu dây `AdaptiveIdleCoolingController` vào `src/client/game_canvas.tsx`
**Target physical file**: `src/client/game_canvas.tsx`
```typescript
<<<<
import { AdaptiveDprController } from './3d/adaptive_dpr_controller';
====
import { AdaptiveDprController } from './3d/adaptive_dpr_controller';
import { AdaptiveIdleCoolingController } from './3d/adaptive_idle_cooling_controller';
>>>>
```

```typescript
<<<<
            <AdaptiveToneMappingSync isMobile={isMobileDevice} />
            <WebGLContextWatcher />
            <PerfTelemetryTracker isMobile={isMobileDevice} />
            <AdaptiveDprController isMobile={isMobileDevice} />
====
            <AdaptiveToneMappingSync isMobile={isMobileDevice} />
            <WebGLContextWatcher />
            <PerfTelemetryTracker isMobile={isMobileDevice} />
            <AdaptiveDprController isMobile={isMobileDevice} />
            <AdaptiveIdleCoolingController isMobile={isMobileDevice} />
>>>>
```

## 4. Definition of Done (DoD) & Stopping Boundary
- [ ] Tất cả 8 bài kiểm thử hợp đồng trong `tests/client/imp376_adaptive_idle_frameloop_cooling.test.ts` đều chuyển trạng thái sang GREEN.
- [ ] Toàn bộ các bộ kiểm thử sống hiện hữu liên quan đến 3D tiếp tục vượt qua 100%:
  - `tests/client/imp375_diorama_static_batching.test.ts` (pass)
  - `tests/client/urban_density_and_craft.test.ts` (pass)
  - `tests/contracts/imp283_mobile_3d_lod_throttling.test.ts` (pass)
  - `tests/helpers/r3f_test_harness.test.ts` (pass)
- [ ] Vượt qua kiểm toán tự động `npm run prefilter -- src/client/3d/idle_cooling_helpers.ts src/client/3d/adaptive_idle_cooling_controller.tsx src/client/game_canvas.tsx`.
- [ ] Chụp bằng chứng hình ảnh thị giác qua kịch bản `camera_chase_normal` và kiểm toán bằng chứng `node scripts/check_evidence.mjs IMP-376`.
- [ ] Cập nhật Single Source of Truth tại `docs/FEATURE_MAP.md` ghi nhận Phase 2 Adaptive Idle Frameloop Cooldown & Thermal Hardening.
