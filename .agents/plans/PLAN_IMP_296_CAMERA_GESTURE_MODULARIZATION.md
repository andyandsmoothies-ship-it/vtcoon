# KẾ HOẠCH TRIỂN KHAI MICRO-SLICE: BÓC TÁCH MÔ-ĐUN CỬ CHỈ MÁY QUAY 3D (IMP-296)
> **Phân hệ mục tiêu:** `client-3d`
> **Phạm vi kỹ thuật:** Giải phóng nợ kỹ thuật dòng mã (LOC Debt) của `src/client/3d/adaptive_cinematic_camera.tsx` (hiện chạm ngưỡng cảnh báo 463/500 LOC, Tier 2) bằng cách trích xuất custom hook `useCameraGestures`, các hàm đánh giá cử chỉ thuần túy và debug camera globals sang `src/client/3d/use_camera_gestures.ts`.
> **Cam kết cốt lõi:**
> 1. **Pure Move 100% (Zero Semantic Mutation):** Bảo toàn nguyên vẹn 100% logic cử chỉ touch/orbit, ngưỡng phát hiện Tap-to-Skip (< 220ms, khoảng cách < 0.4 / 0.2), khóa góc nhìn tự do Free-Roam (> 0.8 / > 0.5) và ngắt Soft-Return khi chạm màn hình.
> 2. **R3F Transient Unmount Invariant:** Bảo toàn kiến trúc vòng lặp `useFrame`, không gây unmount/mount đột ngột, không tạo churn GPU shader/buffer.
> 3. **Giải Phóng Triệt Để Cảnh Báo Vàng Tier 2:** Đưa `adaptive_cinematic_camera.tsx` từ 463 LOC xuống 386 LOC (-77 LOC), cách xa trần 500 LOC và thoát khỏi ngưỡng cảnh báo vàng 400 LOC.
> 4. **Scaffolding Protocol & Semantic Behavioral RED:** Khởi tạo stub rỗng cho `src/client/3d/use_camera_gestures.ts` trước khi chạy test, đảm bảo test fail tại runtime assertions thay vì loader error.
> **Baseline Working Tree Dependencies (Predecessor IMP-294/IMP-295):** `src/client/3d/adaptive_cinematic_camera.tsx`, `src/client/3d/camera_state_machine.ts`, `src/client/3d/cinematic_chase_camera.ts`, `src/client/audio/sound_synth_recipes.ts`, `src/client/3d/camera_kinematic_helpers.ts`, `src/client/3d/camera_location_beacon.tsx`, `src/client/3d/camera_soft_return.ts`, `src/client/3d/cinematic_spline_flyby.ts`, `src/client/audio/synth_recipes_ambient.ts`, `src/client/audio/synth_recipes_gameplay.ts`, `src/client/audio/synth_recipes_ui.ts`, `tests/client/camera_soft_return_and_beacon.test.ts`, `tests/client/cinematic_spline_flyby.test.ts`, `tests/client/dramatic_pacing_camera.test.ts`, `tests/client/sound_synth_recipes_modular.test.ts`, `tests/client/spatial_kinematics_camera.test.ts`

---

### Bảng 1: Phân bổ Ranh giới Phân hệ (Subsystem Boundary Alignment)
| Tệp Mã Nguồn | Phân Hệ | Vai Trò Kiến Trúc |
| :--- | :--- | :--- |
| `src/client/3d/use_camera_gestures.ts` | `client-3d` | **MỚI**: Quản lý cử chỉ orbit/touch, cờ bỏ qua animation (Tap-to-Skip) và khóa góc nhìn tự do (Free-Roam Lock) |
| `src/client/3d/adaptive_cinematic_camera.tsx` | `client-3d` | **SỬA**: Component điều phối camera chính, tích hợp hook `useCameraGestures` và tập trung vào luồng tính toán `useFrame` |
| `tests/client/camera_gestures.test.ts` | Living Test | **MỚI**: Living Contract Test kiểm tra độc lập các quyết định cử chỉ, snap skip, và state lifecycle |

---

### Bảng 2: Ngân Sách Dòng Mã (LOC Accounting)
| Target physical file | Tier Classification | Baseline LOC | Expected LOC | Net Change | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/use_camera_gestures.ts` | Tier 2 (UI/3D/Views) | 0 | 145 | +145 | <= 500 | ✔️ Safe |
| `src/client/3d/adaptive_cinematic_camera.tsx` | Tier 2 (UI/3D/Views) | 463 | 386 | -77 | <= 500 | ✔️ Safe |
| `tests/client/camera_gestures.test.ts` | Living Test | 0 | 220 | +220 | <= 600 | ✔️ Safe |

---

### Trạm 1: Hợp Đồng Kiểm Thử Độc Lập (RED Contract Tests)
**Target physical file**: `tests/client/camera_gestures.test.ts` (Tệp mới)
> **Kỷ luật Seam Discipline (Iron Law):** Tuyệt đối CẤM `spyOn(React)` hoặc monkey-patch `__CLIENT_INTERNALS_*`. Kiểm thử hook (`useCameraGestures`, `useDebugCameraGlobals`) được bọc qua component harness thực tế với `createRoot` và `act(...)` từ `react` / `react-dom/client` (môi trường `@vitest-environment happy-dom`).
> **Quy chuẩn Scaffolding Stub Type-Safe:** File stub được khởi tạo trước Trạm 1 với chữ ký hàm và kiểu dữ liệu tường minh 100%, tuyệt đối CẤM `as any` và `as unknown as T` để thỏa mãn Fast Pre-Filter và đạt Semantic Behavioral RED.

1. **TC-GES.01 [UC-GESTURE/MSS]**: Given `evaluateOrbitGestureEnd` với `justBrokeSoftReturn` là true và khoảng cách lệch vị trí lớn (`distPos > 0.8`), When gọi `evaluateOrbitGestureEnd` phân giải tương tác, Then trả về action `'set_custom_camera'` và cờ `shouldClearJustBroke` là true.
2. **TC-GES.02 [UC-GESTURE/MSS]**: Given `evaluateOrbitGestureEnd` với `justBrokeSoftReturn` là true nhưng không có độ lệch vị trí (`distPos <= 0.8`), When gọi `evaluateOrbitGestureEnd` phân giải tương tác, Then trả về action `'none'` và cờ `shouldClearJustBroke` là true.
3. **TC-GES.03 [UC-GESTURE/MSS]**: Given `evaluateOrbitGestureEnd` với `touchDuration < 220ms`, độ lệch nhỏ (`distPos < 0.4`, `distTarget < 0.2`) và quân cờ đang nhảy (`isPawnAnimating` là true), When gọi `evaluateOrbitGestureEnd` phân giải tương tác, Then trả về action `'skip_animation'`.
4. **TC-GES.04 [UC-GESTURE/MSS]**: Given `evaluateOrbitGestureEnd` với `touchDuration < 220ms` nhưng quân cờ không di chuyển (`isPawnAnimating` là false), When gọi `evaluateOrbitGestureEnd` phân giải tương tác, Then trả về action `'none'`.
5. **TC-GES.05 [UC-GESTURE/MSS]**: Given `evaluateOrbitGestureEnd` với thao tác kéo xoay lệch góc chuẩn (`distPos > 0.8` hoặc `distTarget > 0.5`), When gọi `evaluateOrbitGestureEnd` phân giải tương tác, Then trả về action `'set_custom_camera'`.
6. **TC-GES.06 [UC-GESTURE/MSS]**: Given `evaluateOrbitGestureEnd` với thao tác xoay nhẹ dưới ngưỡng và không trong trạng thái skip, When gọi `evaluateOrbitGestureEnd` phân giải tương tác, Then trả về action `'none'`.
7. **TC-GES.07 [UC-GESTURE/MSS]**: Given `applyCameraSkipSnap` với dữ liệu mục tiêu `skipTargetState`, When gọi `applyCameraSkipSnap` cập nhật máy quay, Then gán vị trí camera và target của controls chính xác, đồng thời cập nhật `camBaseRef` và `targetBaseRef`.
8. **TC-GES.08 [UC-GESTURE/MSS]**: Given controls là null trong `applyCameraSkipSnap`, When gọi `applyCameraSkipSnap` cập nhật máy quay, Then vẫn cập nhật vị trí camera và các mảng tham chiếu an toàn không phát sinh exception.
9. **TC-GES.09 [UC-GESTURE/MSS]**: Given hook `useCameraGestures`, When gọi `useCameraGestures` và invoke onOrbitStart trong khi soft return đang diễn ra, Then ngắt trạng thái soft return và đánh dấu cờ `justBrokeSoftReturnRef` thành true.
10. **TC-GES.10 [UC-GESTURE/MSS]**: Given hook `useCameraGestures`, When gọi `useCameraGestures` và invoke onOrbitStart ở trạng thái bình thường, Then kích hoạt cờ `isUserInteractingRef` thành true và ghi nhận mốc `touchStartTimeRef`.
11. **TC-GES.11 [UC-GESTURE/MSS]**: Given hook `useCameraGestures`, When gọi `useCameraGestures` và invoke onOrbitEnd thỏa mãn điều kiện tap-to-skip, Then bật cờ `isSkippingCameraAnimRef` và ghi nhận `lastSkipTimeRef`.
12. **TC-GES.12 [UC-GESTURE/MSS]**: Given hook `useCameraGestures`, When gọi `useCameraGestures` và invoke handleFrameSkip trong vòng lặp frame khi `isSkippingCameraAnimRef` là true, Then thực thi snap, chốt giữ `hasSkippedCurrentMoveRef` và trả về true.
13. **TC-GES.13 [UC-GESTURE/MSS]**: Given `checkTargetOwnedByHuman` với cell thuộc sở hữu của người chơi người thật không bị thế chấp, When gọi `checkTargetOwnedByHuman` kiểm tra quyền sở hữu, Then trả về true.
14. **TC-GES.14 [UC-GESTURE/MSS]**: Given `useDebugCameraGlobals` trong môi trường window tồn tại, When gọi `useDebugCameraGlobals` thiết lập biến toàn cục, Then đăng ký đầy đủ các hàm debug `__resetCameraToDefault` và cleanup an toàn khi unmount.

---

### Trạm 2: Kế Hoạch Triển Khai Chi Tiết (Implementation Tasks)

#### Task 1: Khởi Tạo Mô-Đun Cử Chỉ Máy Quay `src/client/3d/use_camera_gestures.ts`
**Target physical file**: `src/client/3d/use_camera_gestures.ts` (Tệp mới)

```typescript
// [UC-GESTURE/MSS] Camera Gestures, Interaction Controller & Debug Globals
import React, { useRef, useEffect } from 'react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { type Camera } from 'three';
import { useGameStore } from '../store/game_store';
import { initSoftReturn, shouldBreakOnTouch, type SoftReturnState } from './camera_soft_return';

export interface GestureEndEvaluationParams {
  readonly touchDurationMs: number;
  readonly currentCamPos: readonly [number, number, number];
  readonly overviewPos: readonly [number, number, number];
  readonly currentTargetPos: readonly [number, number, number];
  readonly overviewTarget: readonly [number, number, number];
  readonly isPawnAnimating: boolean;
  readonly justBrokeSoftReturn: boolean;
}

export interface GestureEndEvaluationResult {
  readonly action: 'skip_animation' | 'set_custom_camera' | 'none';
  readonly shouldClearJustBroke: boolean;
}

export function evaluateOrbitGestureEnd(params: GestureEndEvaluationParams): GestureEndEvaluationResult {
  const distPos = Math.hypot(
    params.currentCamPos[0] - params.overviewPos[0],
    params.currentCamPos[1] - params.overviewPos[1],
    params.currentCamPos[2] - params.overviewPos[2]
  );
  const distTarget = Math.hypot(
    params.currentTargetPos[0] - params.overviewTarget[0],
    params.currentTargetPos[1] - params.overviewTarget[1],
    params.currentTargetPos[2] - params.overviewTarget[2]
  );

  if (params.justBrokeSoftReturn) {
    const shouldSetCustom = distPos > 0.8 || distTarget > 0.5;
    return { action: shouldSetCustom ? 'set_custom_camera' : 'none', shouldClearJustBroke: true };
  }

  if (params.isPawnAnimating && params.touchDurationMs < 220 && distPos < 0.4 && distTarget < 0.2) {
    return { action: 'skip_animation', shouldClearJustBroke: false };
  }

  if (distPos > 0.8 || distTarget > 0.5) {
    return { action: 'set_custom_camera', shouldClearJustBroke: false };
  }

  return { action: 'none', shouldClearJustBroke: false };
}

export interface CameraSkipSnapParams {
  readonly skipTarget: {
    readonly position: readonly [number, number, number];
    readonly target: readonly [number, number, number];
  };
  readonly camera: {
    readonly position: { set: (x: number, y: number, z: number) => void };
  };
  readonly controls: {
    readonly target: { set: (x: number, y: number, z: number) => void };
    readonly update?: () => void;
  } | null;
  readonly camBaseRef: React.MutableRefObject<[number, number, number]>;
  readonly targetBaseRef: React.MutableRefObject<[number, number, number]>;
}

export function applyCameraSkipSnap(params: CameraSkipSnapParams): void {
  const { skipTarget, camera, controls, camBaseRef, targetBaseRef } = params;
  camBaseRef.current[0] = skipTarget.position[0];
  camBaseRef.current[1] = skipTarget.position[1];
  camBaseRef.current[2] = skipTarget.position[2];
  targetBaseRef.current[0] = skipTarget.target[0];
  targetBaseRef.current[1] = skipTarget.target[1];
  targetBaseRef.current[2] = skipTarget.target[2];
  camera.position.set(skipTarget.position[0], skipTarget.position[1], skipTarget.position[2]);
  if (controls) {
    controls.target.set(skipTarget.target[0], skipTarget.target[1], skipTarget.target[2]);
    controls.update?.();
  }
}

export function checkTargetOwnedByHuman(
  playersInfo: Record<string, { readonly isBot?: boolean; readonly bankrupt?: boolean; readonly isBankrupt?: boolean; readonly ownedProperties?: readonly number[]; readonly mortgagedProperties?: readonly number[] }>,
  cell: number
): boolean {
  for (const pId in playersInfo) {
    const p = playersInfo[pId];
    if (p && !p.isBot && !p.bankrupt && !p.isBankrupt && p.ownedProperties?.includes(cell) && !p.mortgagedProperties?.includes(cell)) {
      return true;
    }
  }
  return false;
}

export interface UseCameraGesturesOptions {
  readonly camera: Camera;
  readonly controlsRef: React.RefObject<OrbitControlsImpl | null>;
  readonly currentOverviewPosRef: React.RefObject<[number, number, number]>;
  readonly currentOverviewTargetRef: React.RefObject<[number, number, number]>;
  readonly isResettingRef: React.MutableRefObject<boolean>;
  readonly softReturnRef: React.MutableRefObject<SoftReturnState | null>;
  readonly isManualOverviewResetRef: React.MutableRefObject<boolean>;
  readonly camBaseRef: React.MutableRefObject<[number, number, number]>;
  readonly targetBaseRef: React.MutableRefObject<[number, number, number]>;
  readonly activeAnimation?: { readonly isAnimating?: boolean } | null;
}

export interface UseCameraGesturesReturn {
  readonly onOrbitStart: () => void;
  readonly onOrbitEnd: () => void;
  readonly isUserInteractingRef: React.MutableRefObject<boolean>;
  readonly hasSkippedCurrentMoveRef: React.MutableRefObject<boolean>;
  readonly lastSkipTimeRef: React.MutableRefObject<number>;
  readonly isSkippingCameraAnimRef: React.MutableRefObject<boolean>;
  readonly handleFrameSkip: (skipTargetState: { position: [number, number, number]; target: [number, number, number] }) => boolean;
}

export function useCameraGestures(options: UseCameraGesturesOptions): UseCameraGesturesReturn {
  const isUserInteractingRef = useRef<boolean>(false);
  const touchStartTimeRef = useRef<number>(0);
  const justBrokeSoftReturnRef = useRef<boolean>(false);
  const isSkippingCameraAnimRef = useRef<boolean>(false);
  const hasSkippedCurrentMoveRef = useRef<boolean>(false);
  const lastSkipTimeRef = useRef<number>(0);

  const onOrbitStart = () => {
    touchStartTimeRef.current = Date.now();
    if (shouldBreakOnTouch(true, options.isResettingRef.current || options.softReturnRef.current !== null)) {
      options.isResettingRef.current = false;
      options.softReturnRef.current = null;
      options.isManualOverviewResetRef.current = false;
      justBrokeSoftReturnRef.current = true;
    } else {
      justBrokeSoftReturnRef.current = false;
    }
    isUserInteractingRef.current = true;
  };

  const onOrbitEnd = () => {
    isUserInteractingRef.current = false;
    const touchDuration = Date.now() - touchStartTimeRef.current;
    const refPos = options.currentOverviewPosRef.current ?? [0, 0, 0];
    const refTarget = options.currentOverviewTargetRef.current ?? [0, 0, 0];
    const curTarget: [number, number, number] = options.controlsRef.current
      ? [options.controlsRef.current.target.x, options.controlsRef.current.target.y, options.controlsRef.current.target.z]
      : refTarget;

    const result = evaluateOrbitGestureEnd({
      touchDurationMs: touchDuration,
      currentCamPos: [options.camera.position.x, options.camera.position.y, options.camera.position.z],
      overviewPos: refPos,
      currentTargetPos: curTarget,
      overviewTarget: refTarget,
      isPawnAnimating: Boolean(options.activeAnimation?.isAnimating),
      justBrokeSoftReturn: justBrokeSoftReturnRef.current,
    });

    if (result.shouldClearJustBroke) {
      justBrokeSoftReturnRef.current = false;
    }
    if (result.action === 'set_custom_camera') {
      useGameStore.getState().setHasUserCustomCamera?.(true);
    } else if (result.action === 'skip_animation') {
      isSkippingCameraAnimRef.current = true;
      lastSkipTimeRef.current = Date.now();
    }
  };

  const handleFrameSkip = (skipTargetState: { position: [number, number, number]; target: [number, number, number] }): boolean => {
    if (isSkippingCameraAnimRef.current) {
      hasSkippedCurrentMoveRef.current = true;
      applyCameraSkipSnap({
        skipTarget: skipTargetState,
        camera: options.camera,
        controls: options.controlsRef.current,
        camBaseRef: options.camBaseRef,
        targetBaseRef: options.targetBaseRef,
      });
      options.isResettingRef.current = false;
      options.isManualOverviewResetRef.current = false;
      isSkippingCameraAnimRef.current = false;
      isUserInteractingRef.current = false;
      return true;
    }
    return false;
  };

  return {
    onOrbitStart,
    onOrbitEnd,
    isUserInteractingRef,
    hasSkippedCurrentMoveRef,
    lastSkipTimeRef,
    isSkippingCameraAnimRef,
    handleFrameSkip,
  };
}

export interface UseDebugCameraGlobalsOptions {
  readonly scene: import('three').Scene;
  readonly camera: Camera;
  readonly controlsRef: React.RefObject<OrbitControlsImpl | null>;
  readonly defaultTarget: [number, number, number];
  readonly camBaseRef: React.MutableRefObject<[number, number, number]>;
  readonly targetBaseRef: React.MutableRefObject<[number, number, number]>;
  readonly currentOverviewPosRef: React.RefObject<[number, number, number]>;
  readonly currentOverviewTargetRef: React.RefObject<[number, number, number]>;
  readonly isResettingRef: React.MutableRefObject<boolean>;
  readonly isManualOverviewResetRef: React.MutableRefObject<boolean>;
  readonly softReturnRef: React.MutableRefObject<SoftReturnState | null>;
  readonly isUserInteractingRef: React.MutableRefObject<boolean>;
}

export function useDebugCameraGlobals(options: UseDebugCameraGlobalsOptions): void {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__threeScene = options.scene;
      window.__threeCamera = options.camera;
      window.__resetCameraToDefault = () => {
        options.isUserInteractingRef.current = false;
        options.isResettingRef.current = true;
        options.isManualOverviewResetRef.current = true;
        options.camBaseRef.current = [options.camera.position.x, options.camera.position.y, options.camera.position.z];
        const curTarget: [number, number, number] = options.controlsRef.current
          ? [options.controlsRef.current.target.x, options.controlsRef.current.target.y, options.controlsRef.current.target.z]
          : options.defaultTarget;
        options.targetBaseRef.current = curTarget;
        const refPos = options.currentOverviewPosRef.current ?? [0, 0, 0];
        const refTarget = options.currentOverviewTargetRef.current ?? [0, 0, 0];
        options.softReturnRef.current = initSoftReturn(
          [options.camera.position.x, options.camera.position.y, options.camera.position.z],
          curTarget,
          refPos,
          refTarget,
          performance.now()
        );
        useGameStore.getState().setCameraFocusCell(null);
        useGameStore.getState().setHasUserCustomCamera?.(false);
      };
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete window.__resetCameraToDefault;
        delete window.__threeScene;
        delete window.__threeCamera;
        delete window.__orbitControls;
      }
    };
  }, [options.scene, options.camera]);
}
```

#### Task 2: Tinh Gọn `src/client/3d/adaptive_cinematic_camera.tsx`
**Target physical file**: `src/client/3d/adaptive_cinematic_camera.tsx`

Snippet 2.1: Thay thế import:
```typescript
<<<<
import { initSoftReturn, sampleSoftReturn, shouldBreakOnTouch, type SoftReturnState } from './camera_soft_return';
====
import { initSoftReturn, sampleSoftReturn, type SoftReturnState } from './camera_soft_return';
import { useCameraGestures, checkTargetOwnedByHuman, useDebugCameraGlobals } from './use_camera_gestures';
>>>>
```

Snippet 2.2: Thay thế hàm helper cục bộ:
```typescript
<<<<
function checkTargetOwnedByHuman(
  playersInfo: Record<string, { readonly isBot?: boolean; readonly bankrupt?: boolean; readonly isBankrupt?: boolean; readonly ownedProperties?: readonly number[]; readonly mortgagedProperties?: readonly number[] }>,
  cell: number
): boolean {
  for (const pId in playersInfo) {
    const p = playersInfo[pId];
    if (p && !p.isBot && !p.bankrupt && !p.isBankrupt && p.ownedProperties?.includes(cell) && !p.mortgagedProperties?.includes(cell)) {
      return true;
    }
  }
  return false;
}
====
// checkTargetOwnedByHuman moved to use_camera_gestures.ts
>>>>
```

Snippet 2.3: Thay thế khai báo refs rời rạc bằng gọi hook `useCameraGestures`:
```typescript
<<<<
  const isUserInteractingRef = useRef<boolean>(false);
  const lastUserInteractionTimeRef = useRef<number>(0);
  const isResettingRef = useRef<boolean>(true);
  const isManualOverviewResetRef = useRef<boolean>(false);
  const prevModeRef = useRef<string | null>(null);
  const prevHasUserCustomCameraRef = useRef<boolean>(false);
  const isSkippingCameraAnimRef = useRef<boolean>(false);
  const hasSkippedCurrentMoveRef = useRef<boolean>(false);
  const lastSkipTimeRef = useRef<number>(0);
  const lastDestinationCellRef = useRef<number | null>(null);
  const gamePhaseRef = useRef<1 | 2 | 3>(1);
  const softReturnRef = useRef<SoftReturnState | null>(null);
  const touchStartTimeRef = useRef<number>(0);
  const justBrokeSoftReturnRef = useRef<boolean>(false);
====
  const isResettingRef = useRef<boolean>(true);
  const isManualOverviewResetRef = useRef<boolean>(false);
  const prevModeRef = useRef<string | null>(null);
  const prevHasUserCustomCameraRef = useRef<boolean>(false);
  const lastDestinationCellRef = useRef<number | null>(null);
  const gamePhaseRef = useRef<1 | 2 | 3>(1);
  const softReturnRef = useRef<SoftReturnState | null>(null);

  const {
    onOrbitStart,
    onOrbitEnd,
    isUserInteractingRef,
    hasSkippedCurrentMoveRef,
    handleFrameSkip,
  } = useCameraGestures({
    camera,
    controlsRef,
    currentOverviewPosRef,
    currentOverviewTargetRef,
    isResettingRef,
    softReturnRef,
    isManualOverviewResetRef,
    camBaseRef,
    targetBaseRef,
    activeAnimation,
  });
>>>>
```

Snippet 2.4: Thay thế khối window debug camera setup:
```typescript
<<<<
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__threeScene = scene;
      window.__threeCamera = camera;
      window.__resetCameraToDefault = () => {
        isUserInteractingRef.current = false;
        lastUserInteractionTimeRef.current = 0;
        isResettingRef.current = true;
        isManualOverviewResetRef.current = true;
        camBaseRef.current = [camera.position.x, camera.position.y, camera.position.z];
        const curTarget: [number, number, number] = controlsRef.current
          ? [controlsRef.current.target.x, controlsRef.current.target.y, controlsRef.current.target.z]
          : defaultTarget;
        targetBaseRef.current = curTarget;
        softReturnRef.current = initSoftReturn(
          [camera.position.x, camera.position.y, camera.position.z],
          curTarget,
          currentOverviewPosRef.current,
          currentOverviewTargetRef.current,
          performance.now()
        );
        useGameStore.getState().setCameraFocusCell(null);
        useGameStore.getState().setHasUserCustomCamera?.(false);
      };
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete window.__resetCameraToDefault;
        delete window.__threeScene;
        delete window.__threeCamera;
        delete window.__orbitControls;
      }
    };
  }, [scene, camera]);
====
  useDebugCameraGlobals({
    scene,
    camera,
    controlsRef,
    defaultTarget,
    camBaseRef,
    targetBaseRef,
    currentOverviewPosRef,
    currentOverviewTargetRef,
    isResettingRef,
    isManualOverviewResetRef,
    softReturnRef,
    isUserInteractingRef,
  });
>>>>
```

Snippet 2.5: Thay thế khối xử lý skip trong `useFrame`:
```typescript
<<<<
    // [ADV-03][USER-BUG-02] Co che cham de bo qua (Tap-to-Skip) tuc thi: snap thang ve o dich den cuoi cung va chot giu hasSkippedCurrentMoveRef
    if (isSkippingCameraAnimRef.current) {
      hasSkippedCurrentMoveRef.current = true;
      camBaseRef.current[0] = skipTargetState.position[0];
      camBaseRef.current[1] = skipTargetState.position[1];
      camBaseRef.current[2] = skipTargetState.position[2];
      targetBaseRef.current[0] = skipTargetState.target[0];
      targetBaseRef.current[1] = skipTargetState.target[1];
      targetBaseRef.current[2] = skipTargetState.target[2];
      camera.position.set(skipTargetState.position[0], skipTargetState.position[1], skipTargetState.position[2]);
      if (controlsRef.current) {
        controlsRef.current.target.set(skipTargetState.target[0], skipTargetState.target[1], skipTargetState.target[2]);
        controlsRef.current.update();
      }
      isResettingRef.current = false;
      isManualOverviewResetRef.current = false;
      isSkippingCameraAnimRef.current = false;
      isUserInteractingRef.current = false;
    }
====
    handleFrameSkip(skipTargetState);
>>>>
```

Snippet 2.6: Thay thế OrbitControls event handlers:
```typescript
<<<<
        onStart={() => {
          touchStartTimeRef.current = Date.now();
          if (shouldBreakOnTouch(true, isResettingRef.current || softReturnRef.current !== null)) {
            isResettingRef.current = false;
            softReturnRef.current = null;
            isManualOverviewResetRef.current = false;
            justBrokeSoftReturnRef.current = true;
          } else {
            justBrokeSoftReturnRef.current = false;
          }
          isUserInteractingRef.current = true;
        }}
        onEnd={() => {
          isUserInteractingRef.current = false;
          const touchDuration = Date.now() - touchStartTimeRef.current;
          const refPos = currentOverviewPosRef.current;
          const refTarget = currentOverviewTargetRef.current;
          const distPos = Math.hypot(camera.position.x - refPos[0], camera.position.y - refPos[1], camera.position.z - refPos[2]);
          const distTarget = controlsRef.current
            ? Math.hypot(controlsRef.current.target.x - refTarget[0], controlsRef.current.target.y - refTarget[1], controlsRef.current.target.z - refTarget[2])
            : 0;

          if (justBrokeSoftReturnRef.current) {
            justBrokeSoftReturnRef.current = false;
            if (distPos > 0.8 || distTarget > 0.5) {
              useGameStore.getState().setHasUserCustomCamera?.(true);
            }
            return;
          }

          // Tap-to-skip: cham nhe < 220ms va khong xoay goc nhin khi quan co dang nhay
          if (activeAnimation?.isAnimating && touchDuration < 220 && distPos < 0.4 && distTarget < 0.2) {
            isSkippingCameraAnimRef.current = true;
            lastSkipTimeRef.current = Date.now();
            return;
          }

          // Kéo xoay tự do (Free-Roam): kích hoạt khi xoay lệch khỏi góc mặc định
          if (distPos > 0.8 || distTarget > 0.5) {
            useGameStore.getState().setHasUserCustomCamera?.(true);
          }
        }}
====
        onStart={onOrbitStart}
        onEnd={onOrbitEnd}
>>>>
```

---

### Trạm 3: Tiêu Chí Nghiệm Thu Độc Lập (Station 3 Verification Criteria)
1. **Spec & Scope Gate (Station 3.1)**:
   - 100% tệp thay đổi thuộc phân hệ `client-3d`.
   - Zero Scope Creep, không can thiệp ngoài phạm vi máy quay 3D.
2. **Deep Architecture & Anti-Slop (Station 3.2)**:
   - Zero Dirty Casts: Tuyệt đối không dùng `as any`, `as unknown as T`.
   - Seam Discipline: `evaluateOrbitGestureEnd` là hàm thuần túy có thể kiểm thử không phụ thuộc DOM/Canvas.
   - Poka-Yoke & R3F Invariant: Giữ nguyên cấu trúc phân nhánh render, không render rỗng gây gián đoạn GPU.
3. **Physical Visual Capture (Station 3.3)**:
   - Thực thi lệnh chụp hình ảnh hành vi thực tế: `npm run capture:visual -- --ticket IMP-296 --scenario camera_soft_return_and_beacon --dual-viewport`
   - Xác minh toàn vẹn bằng chứng vật lý: `node scripts/check_evidence.mjs IMP-296`
