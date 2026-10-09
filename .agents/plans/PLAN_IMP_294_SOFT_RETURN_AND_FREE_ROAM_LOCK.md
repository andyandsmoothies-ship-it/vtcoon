# KẾ HOẠCH TRIỂN KHAI MICRO-SLICE 3B: ORBITCONTROLS SOFT RETURN & FREE-ROAM LOCK (IMP-294) - REVISION 3 (HARDENED)
> **Phân hệ mục tiêu:** `client-3d`
> **Phạm vi kỹ thuật:** Hạng mục 3.3 (Spherical Slerp Orbit Return & Break-on-Touch) & Hạng mục 3.4 (Decoupled Free-Roam Lock & 3.5m Vertical Beacon).
> **Scope Conservation**: [DEFERRED: Giai đoạn 4 Chuyển động Chi tiết & VFX Môi trường Nước/Sóng theo lộ trình Auto-Slicing]
> **Baseline Living Tests & Camera Dependencies:** `src/client/3d/cinematic_chase_camera.ts`, `src/client/3d/cinematic_spline_flyby.ts`, `tests/client/cinematic_spline_flyby.test.ts`, `tests/client/dramatic_pacing_camera.test.ts`, `tests/client/spatial_kinematics_camera.test.ts`, `tests/contracts/imp126_camera_orientation_and_topbar_mobile.test.ts`
> **Hardening Directives Incorporated (Zero Dead-Path & Zero GPU Churn)**:
> 1. Phân biệt cử chỉ Kéo tự do (Drag > 220ms hoặc dịch chuyển góc nhìn) để bật `hasUserCustomCamera: true` và kích hoạt ngọn hải đăng 3.5m ngay trong lúc quân cờ đang nhảy, phân tách rạch ròi với Chạm nhanh (Tap-to-skip < 220ms), bảo toàn 100% hợp đồng `TC-190.08`.
> 2. Phân tách hoàn toàn Break-on-Touch và Tap-to-Skip qua cờ `justBrokeSoftReturnRef`, chặn đứng hiện tượng camera bị giật bắn đến ô đích khi người chơi chạm để dừng Soft Return.
> 3. Triệt tiêu 100% lỗi GPU Buffer Churn và Micro-Stutter: `CameraLocationBeacon` render thường trực và điều khiển qua `<group visible={isVisible}>`, cấm lệnh `return null` ở giữa component.
> 4. Bịt kín lỗ hổng NaN số học ở toàn bộ các nhánh tính toán trong `camera_soft_return.ts` với hằng số fallback SSOT `[24.6, 25.3, 24.6]` và `[2.2, 0.0, 2.2]`.
> 5. Triệt tiêu lỗi trượt gốc tọa độ (Spawn Warp Glitch) của ngọn hải đăng bằng snap tức thì ở frame 1 (`currentXRef === null`).
> 6. Pure-Move Refactor: Di chuyển 5 hàm toán học thuần túy (`resolveSideAwareCameraOffset`, `calculateTileFocusCameraPosition`, `calculateScreenShake`, `dampValue`, `calculateResponsiveCameraDistance`) sang `camera_kinematic_helpers.ts`, cắt giảm ròng 98 dòng mã, đưa `camera_state_machine.ts` từ 388 dòng về 290 dòng (xóa triệt để Báo Động Đỏ Tier 1).

---

### Bảng 1: Phân bổ Ranh giới Phân hệ (Subsystem Boundary Alignment)
| Tệp Mã Nguồn | Phân Hệ | Vai Trò Kiến Trúc |
| :--- | :--- | :--- |
| `src/client/3d/camera_kinematic_helpers.ts` | `client-3d` | **MỚI**: Module thuần toán học hình học 3D (offset 4 cạnh, tọa độ zoom ô đất, rung chấn suy giảm, damping) |
| `src/client/3d/camera_soft_return.ts` | `client-3d` | **MỚI**: Nội suy cầu Spherical Orbit Slerp trên mặt cầu R = const, Easing Cubic-Out 1.2s, Break-on-Touch, phòng thủ NaN toàn diện |
| `src/client/3d/camera_location_beacon.tsx` | `client-3d` | **MỚI**: Cột mốc định vị 3D 3.5m phát quang nhấp nháy 0.35..0.75 opacity kèm con trỏ kim cương chỉ điểm quân cờ (Zero GPU Churn via `visible`) |
| `src/client/3d/camera_state_machine.ts` | `client-3d` | **SỬA**: Tái xuất (re-export) các hàm kinematic helpers, hạ nhiệt LOC an toàn |
| `src/client/3d/adaptive_cinematic_camera.tsx` | `client-3d` | **SỬA**: Kích hoạt Spherical Soft Return khi bấm Reset, phân biệt Drag vs Tap trong onStart/onEnd, mở khóa Free-Roam Lock khi hasUserCustomCamera, gắn beacon |
| `tests/client/camera_soft_return_and_beacon.test.ts` | Living Test | **MỚI**: Bộ kiểm thử hợp đồng 16 ca cho Spherical Slerp, Break-on-Touch, Beacon Tracking, Kinematic Helpers và Free-Roam Lock |

---

### Bảng 2: Ngân Sách Dòng Mã (LOC Accounting)
| Tệp Mã Nguồn | Phân Tầng / Tier | LOC Hiện Tại | LOC Dự Kiến | Biến Động (Delta) | Trần Ngân Sách | Trạng Thái Rủi Ro |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/camera_kinematic_helpers.ts` | Tier 1 (Domain/Server/Logic) | 0 | 85 | +85 | <= 400 | ✔️ Safe |
| `src/client/3d/camera_soft_return.ts` | Tier 1 (Domain/Server/Logic) | 0 | 135 | +135 | <= 400 | ✔️ Safe |
| `src/client/3d/camera_location_beacon.tsx` | Tier 2 (UI/3D/Views) | 0 | 100 | +100 | <= 500 | ✔️ Safe |
| `src/client/3d/camera_state_machine.ts` | Tier 1 (Domain/Server/Logic) | 388 | 290 | -98 | <= 400 | ✔️ Safe |
| `src/client/3d/adaptive_cinematic_camera.tsx` | Tier 2 (UI/3D/Views) | 416 | 464 | +48 | <= 500 | ⚠️ Warning (464 > 400) |
| `tests/client/camera_soft_return_and_beacon.test.ts` | Living Test | 0 | 270 | +270 | <= 600 | ✔️ Safe |

*Sổ Theo Dõi Nợ Kỹ Thuật*: `camera_state_machine.ts` đã được giải phóng ngoạn mục (-98 dòng) xuống 290 dòng vật lý, hoàn toàn biến mất khỏi danh sách cảnh báo. `adaptive_cinematic_camera.tsx` được bổ sung mạch gọi Spherical Slerp, Break-on-Touch và bộ phân biệt cử chỉ nhưng giữ vững dưới 465 dòng, an toàn trong trần Tier 2 (<= 500).

---

### Trạm 1: Hợp Đồng Kiểm Thử Độc Lập (RED Contract Tests)
**Tệp kiểm thử**: `tests/client/camera_soft_return_and_beacon.test.ts`
1. **TC-RET.01 [UC-RET/MSS]**: Given máy quay đang ở vị trí tự do bất kỳ, When gọi `initSoftReturn`, Then khởi tạo trạng thái soft return hợp lệ với thời lượng mặc định 1200ms và tiến độ bắt đầu từ 0.
2. **TC-RET.02 [UC-RET/A1]**: Given trạng thái soft return tại thời điểm xuất phát t = 0, When gọi `sampleSoftReturn`, Then trả về vị trí và mục tiêu khớp chuẩn với tọa độ xuất phát.
3. **TC-RET.03 [UC-RET/MSS]**: Given trạng thái soft return sau khi vượt thời lượng (elapsed >= duration), When gọi `sampleSoftReturn`, Then trả về vị trí đích đến và cờ `isFinished` bằng true.
4. **TC-RET.04 [UC-RET/MSS]**: Given camera quay nửa vòng đối xứng qua tâm, When gọi `sampleSoftReturn` tại t = 0.5, Then bán kính mặt cầu được bảo tồn không bị sụp đổ xuyên qua tâm sa bàn ($R(0.5) \ge \min(R_0, R_1) \times 0.95$).
5. **TC-RET.05 [UC-RET/A2]**: Given góc phương vị azimuthal cắt qua ranh giới $\pm\pi$, When gọi `sampleSoftReturn`, Then góc quay đi theo cung ngắn nhất ($|\Delta\theta| \le \pi$).
6. **TC-RET.06 [UC-RET/A3]**: Given hàm làm mịn Cubic-Out, When đo đạc tiến trình nội suy tại nửa thời lượng $\tau = 0.5$, Then giá trị gia tốc chuyển động đạt $1 - (0.5)^3 = 0.875$.
7. **TC-RET.07 [UC-RET/A4]**: Given góc cực nghiêng polar angle sát cực thẳng đứng ($\phi \approx 0$), When tính toán vị trí mặt cầu, Then xử lý mượt mà với góc an toàn chống điểm kỳ dị gimbal lock.
8. **TC-RET.08 [UC-RET/A5]**: Given tham số đầu vào chứa giá trị NaN hoặc Infinite, When gọi `sampleSoftReturn`, Then cơ chế phòng thủ kích hoạt trả về tọa độ đích đến an toàn với fallback SSOT `[24.6, 25.3, 24.6]`.
9. **TC-RET.09 [UC-RET/MSS]**: Given đang diễn ra chuyển động hồi tiếp camera mà người chơi chạm vào màn hình, When kiểm tra `shouldBreakOnTouch`, Then trả về true để lập tức nhường quyền điều khiển cho cử chỉ tay.
10. **TC-BCN.01 [UC-BCN/MSS]**: Given chế độ camera tùy biến đang bật và quân cờ đang nhảy, When kiểm tra điều kiện hiển thị beacon, Then thuộc tính `visible` của group bằng true mà không unmount khỏi cây DOM Three.js.
11. **TC-BCN.02 [UC-BCN/A1]**: Given camera ở chế độ mặc định hoặc quân cờ không di chuyển, When kiểm tra điều kiện hiển thị beacon, Then thuộc tính `visible` bằng false và nhóm tọa độ được reset an toàn.
12. **TC-BCN.03 [UC-BCN/MSS]**: Given thời gian trôi qua, When tính toán độ mờ ảo của ngọn hải đăng qua `calculateBeaconPulseOpacity`, Then giá trị xung nhịp bảo tồn phân tầng độ sáng giữa thân trụ (0.55), đỉnh kim cương (0.75) và vòng tiếp đất (0.45).
13. **TC-BCN.04 [UC-BCN/A2]**: Given quân cờ đang di chuyển qua các ô cờ, When giải mã tọa độ định vị qua `resolveBeaconCoordinates`, Then trả về đúng tọa độ 3D trung tâm của ô cờ tương ứng.
14. **TC-KIN.01 [UC-KIN/MSS]**: Given di chuyển hàm sang `camera_kinematic_helpers.ts`, When gọi `resolveSideAwareCameraOffset` trên 4 cạnh bàn cờ, Then giữ nguyên 100% hướng nhìn thuận mắt chữ.
15. **TC-KIN.02 [UC-KIN/A1]**: Given rung chấn công trình nện xuống sa bàn, When gọi `calculateScreenShake`, Then bảo toàn phong bì suy giảm bậc hai và triệt tiêu về 0 khi hết thời lượng.

---

### Trạm 2: Triển Khai Mã Nguồn Tối Thiểu (GREEN Implementation)

#### Task 2.1: Tạo mới Module Toán học Động học `camera_kinematic_helpers.ts` (Pure-Move Refactor)
**Target physical file**: `src/client/3d/camera_kinematic_helpers.ts` (mới)

```typescript
// [IMP-294] Camera Kinematic Helpers — Pure 3D Spatial & Orientation Math
export function resolveSideAwareCameraOffset(
  tileCoords: readonly [number, number, number],
  baseOffset: readonly [number, number, number] = [5.2, 6.4, 5.2]
): [number, number, number] {
  const tx = Number.isFinite(tileCoords[0]) ? tileCoords[0] : 0;
  const tz = Number.isFinite(tileCoords[2]) ? tileCoords[2] : 0;
  const height = Number.isFinite(baseOffset[1]) ? baseOffset[1] : 6.4;
  const absX = Math.abs(tx);
  const absZ = Math.abs(tz);
  if (absZ >= absX) {
    if (tz < 0) return [-1.8, height, -6.8];
    return [Number.isFinite(baseOffset[0]) ? baseOffset[0] : 5.2, height, Number.isFinite(baseOffset[2]) ? baseOffset[2] : 5.2];
  } else {
    if (tx < 0) return [-6.8, height, 1.8];
    return [6.8, height, -1.8];
  }
}

export function calculateTileFocusCameraPosition(
  tileCoords: readonly [number, number, number],
  offset?: readonly [number, number, number]
): [number, number, number] {
  const tx = Number.isFinite(tileCoords[0]) ? tileCoords[0] : 0;
  const ty = Number.isFinite(tileCoords[1]) ? tileCoords[1] : 0;
  const tz = Number.isFinite(tileCoords[2]) ? tileCoords[2] : 0;
  const finalOffset = offset ?? resolveSideAwareCameraOffset(tileCoords);
  return [tx + finalOffset[0], ty + finalOffset[1], tz + finalOffset[2]];
}

export function calculateScreenShake(
  elapsedSeconds: number,
  durationSeconds: number = 0.35,
  amplitude: number = 0.25,
  frequency: number = 42
): [number, number, number] {
  if (!Number.isFinite(elapsedSeconds) || !Number.isFinite(durationSeconds) || !Number.isFinite(amplitude) || !Number.isFinite(frequency) || elapsedSeconds < 0 || elapsedSeconds >= durationSeconds) {
    return [0, 0, 0];
  }
  const progress = elapsedSeconds / durationSeconds;
  const decay = (1 - progress) * (1 - progress);
  const sx = Math.sin(elapsedSeconds * frequency) * amplitude * decay;
  const sy = Math.cos(elapsedSeconds * (frequency * 1.25)) * (amplitude * 0.7) * decay;
  const sz = Math.sin(elapsedSeconds * (frequency * 0.85) + 1.2) * (amplitude * 0.9) * decay;
  return [sx, sy, sz];
}

export function dampValue(current: number, target: number, speed: number, dt: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(target)) return Number.isFinite(target) ? target : 0;
  const safeDt = Math.max(0, Math.min(dt, 0.1));
  const factor = 1 - Math.exp(-safeDt * speed);
  return current + (target - current) * factor;
}

export function calculateResponsiveCameraDistance(aspect: number, baseDistance = 32): number {
  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 1.77;
  const safeBase = Number.isFinite(baseDistance) && baseDistance > 0 ? baseDistance : 32;
  if (safeAspect < 1.77) return safeBase * Math.max(1.0, 1.77 / Math.max(safeAspect, 0.75));
  return safeBase;
}
```

#### Task 2.2: Tạo mới Module Spherical Slerp Orbit Return `camera_soft_return.ts`
**Target physical file**: `src/client/3d/camera_soft_return.ts` (mới)

```typescript
// [IMP-294] Camera Soft Return — Spherical Orbit Slerp & Break-on-Touch Kinematics
export interface SoftReturnState {
  readonly startPos: readonly [number, number, number];
  readonly startTarget: readonly [number, number, number];
  readonly destPos: readonly [number, number, number];
  readonly destTarget: readonly [number, number, number];
  readonly startTime: number;
  readonly durationMs: number;
}

export interface SoftReturnSample {
  readonly position: [number, number, number];
  readonly target: [number, number, number];
  readonly isFinished: boolean;
}

const DEFAULT_FALLBACK_POS: readonly [number, number, number] = [24.6, 25.3, 24.6];
const DEFAULT_FALLBACK_TARGET: readonly [number, number, number] = [2.2, 0.0, 2.2];

export function initSoftReturn(
  startPos: readonly [number, number, number],
  startTarget: readonly [number, number, number],
  destPos: readonly [number, number, number],
  destTarget: readonly [number, number, number],
  startTime: number,
  durationMs: number = 1200
): SoftReturnState {
  return {
    startPos: [startPos[0], startPos[1], startPos[2]],
    startTarget: [startTarget[0], startTarget[1], startTarget[2]],
    destPos: [destPos[0], destPos[1], destPos[2]],
    destTarget: [destTarget[0], destTarget[1], destTarget[2]],
    startTime: Number.isFinite(startTime) ? startTime : 0,
    durationMs: durationMs > 0 ? durationMs : 1200,
  };
}

export function shouldBreakOnTouch(isInteracting: boolean, isResetting: boolean): boolean {
  return isInteracting && isResetting;
}

export function sampleSoftReturn(state: SoftReturnState, now: number): SoftReturnSample {
  const safeDestPos: [number, number, number] = [
    Number.isFinite(state.destPos[0]) ? state.destPos[0] : DEFAULT_FALLBACK_POS[0],
    Number.isFinite(state.destPos[1]) ? state.destPos[1] : DEFAULT_FALLBACK_POS[1],
    Number.isFinite(state.destPos[2]) ? state.destPos[2] : DEFAULT_FALLBACK_POS[2],
  ];
  const safeDestTarget: [number, number, number] = [
    Number.isFinite(state.destTarget[0]) ? state.destTarget[0] : DEFAULT_FALLBACK_TARGET[0],
    Number.isFinite(state.destTarget[1]) ? state.destTarget[1] : DEFAULT_FALLBACK_TARGET[1],
    Number.isFinite(state.destTarget[2]) ? state.destTarget[2] : DEFAULT_FALLBACK_TARGET[2],
  ];
  const safeStartPos: [number, number, number] = [
    Number.isFinite(state.startPos[0]) ? state.startPos[0] : safeDestPos[0],
    Number.isFinite(state.startPos[1]) ? state.startPos[1] : safeDestPos[1],
    Number.isFinite(state.startPos[2]) ? state.startPos[2] : safeDestPos[2],
  ];
  const safeStartTarget: [number, number, number] = [
    Number.isFinite(state.startTarget[0]) ? state.startTarget[0] : safeDestTarget[0],
    Number.isFinite(state.startTarget[1]) ? state.startTarget[1] : safeDestTarget[1],
    Number.isFinite(state.startTarget[2]) ? state.startTarget[2] : safeDestTarget[2],
  ];

  const elapsed = Math.max(0, now - state.startTime);
  const tau = Math.min(1, elapsed / state.durationMs);
  if (tau >= 1.0) {
    return {
      position: safeDestPos,
      target: safeDestTarget,
      isFinished: true,
    };
  }
  const u = 1 - Math.pow(1 - tau, 3);
  const tx = safeStartTarget[0] + (safeDestTarget[0] - safeStartTarget[0]) * u;
  const ty = safeStartTarget[1] + (safeDestTarget[1] - safeStartTarget[1]) * u;
  const tz = safeStartTarget[2] + (safeDestTarget[2] - safeStartTarget[2]) * u;

  const vx0 = safeStartPos[0] - safeStartTarget[0];
  const vy0 = safeStartPos[1] - safeStartTarget[1];
  const vz0 = safeStartPos[2] - safeStartTarget[2];
  const vx1 = safeDestPos[0] - safeDestTarget[0];
  const vy1 = safeDestPos[1] - safeDestTarget[1];
  const vz1 = safeDestPos[2] - safeDestTarget[2];

  const r0 = Math.hypot(vx0, vy0, vz0);
  const r1 = Math.hypot(vx1, vy1, vz1);
  if (r0 < 0.1 || r1 < 0.1 || !Number.isFinite(r0) || !Number.isFinite(r1)) {
    return {
      position: [
        Number.isFinite(safeStartPos[0] + (safeDestPos[0] - safeStartPos[0]) * u) ? safeStartPos[0] + (safeDestPos[0] - safeStartPos[0]) * u : safeDestPos[0],
        Number.isFinite(safeStartPos[1] + (safeDestPos[1] - safeStartPos[1]) * u) ? safeStartPos[1] + (safeDestPos[1] - safeStartPos[1]) * u : safeDestPos[1],
        Number.isFinite(safeStartPos[2] + (safeDestPos[2] - safeStartPos[2]) * u) ? safeStartPos[2] + (safeDestPos[2] - safeStartPos[2]) * u : safeDestPos[2],
      ],
      target: [
        Number.isFinite(tx) ? tx : safeDestTarget[0],
        Number.isFinite(ty) ? ty : safeDestTarget[1],
        Number.isFinite(tz) ? tz : safeDestTarget[2],
      ],
      isFinished: false,
    };
  }

  const phi0 = Math.acos(Math.max(-1, Math.min(1, vy0 / r0)));
  const theta0 = Math.atan2(vz0, vx0);
  const phi1 = Math.acos(Math.max(-1, Math.min(1, vy1 / r1)));
  const theta1 = Math.atan2(vz1, vx1);

  let dTheta = theta1 - theta0;
  while (dTheta > Math.PI) dTheta -= 2 * Math.PI;
  while (dTheta < -Math.PI) dTheta += 2 * Math.PI;

  const currentR = r0 + (r1 - r0) * u;
  const currentPhi = Math.max(0.02, Math.min(Math.PI - 0.02, phi0 + (phi1 - phi0) * u));
  const currentTheta = theta0 + dTheta * u;

  const sinPhi = Math.sin(currentPhi);
  const cosPhi = Math.cos(currentPhi);
  const cx = tx + currentR * sinPhi * Math.cos(currentTheta);
  const cy = ty + currentR * cosPhi;
  const cz = tz + currentR * sinPhi * Math.sin(currentTheta);

  return {
    position: [
      Number.isFinite(cx) ? cx : safeDestPos[0],
      Number.isFinite(cy) ? cy : safeDestPos[1],
      Number.isFinite(cz) ? cz : safeDestPos[2],
    ],
    target: [
      Number.isFinite(tx) ? tx : safeDestTarget[0],
      Number.isFinite(ty) ? ty : safeDestTarget[1],
      Number.isFinite(tz) ? tz : safeDestTarget[2],
    ],
    isFinished: false,
  };
}
```

#### Task 2.3: Tạo mới Ngọn Hải Đăng 3.5m Định Vị Quân Cờ `camera_location_beacon.tsx`
**Target physical file**: `src/client/3d/camera_location_beacon.tsx` (mới)

```typescript
// [IMP-294] Camera Location Beacon — 3.5m Glowing Vertical Beacon for Decoupled Free-Roam
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, type Group, type MeshBasicMaterial } from 'three';
import { useGameStore } from '../store/game_store';
import { cellPosition } from './board_coords';

export function calculateBeaconPulseOpacity(elapsedSeconds: number, baseOpacity: number = 0.55): number {
  if (!Number.isFinite(elapsedSeconds)) return baseOpacity;
  const pulseFactor = 0.8 + 0.4 * (0.5 + 0.5 * Math.sin(elapsedSeconds * 4));
  return Math.min(1, Math.max(0, baseOpacity * pulseFactor));
}

export function resolveBeaconCoordinates(
  waypoints?: readonly number[],
  currentIndex: number = 0,
  targetCell: number = 0
): [number, number, number] {
  const currentCell = (waypoints && waypoints.length > 0)
    ? (waypoints[currentIndex] ?? waypoints[waypoints.length - 1] ?? targetCell)
    : targetCell;
  const pos = cellPosition(currentCell);
  return [pos[0], 0, pos[2]];
}

export function CameraLocationBeacon(): React.ReactElement {
  const hasUserCustomCamera = useGameStore((s) => s.hasUserCustomCamera);
  const activeAnimation = useGameStore((s) => s.activePawnAnimation);
  const playersInfo = useGameStore((s) => s.playersInfo);

  const groupRef = useRef<Group>(null);
  const currentXRef = useRef<number | null>(null);
  const currentZRef = useRef<number | null>(null);
  const cylinderMatRef = useRef<MeshBasicMaterial>(null);
  const diamondMatRef = useRef<MeshBasicMaterial>(null);
  const ringMatRef = useRef<MeshBasicMaterial>(null);

  const isVisible = Boolean(hasUserCustomCamera && activeAnimation?.isAnimating);

  useFrame((state, delta) => {
    if (!groupRef.current || !isVisible) {
      currentXRef.current = null;
      currentZRef.current = null;
      return;
    }
    const targetCoords = resolveBeaconCoordinates(
      activeAnimation?.waypoints,
      activeAnimation?.currentIndex,
      activeAnimation?.targetCell
    );
    if (currentXRef.current === null || currentZRef.current === null) {
      currentXRef.current = targetCoords[0];
      currentZRef.current = targetCoords[2];
      groupRef.current.position.set(targetCoords[0], 0, targetCoords[2]);
    } else {
      const dt = Math.min(delta, 0.1);
      const lerpFactor = 1 - Math.exp(-dt * 12);
      currentXRef.current += (targetCoords[0] - currentXRef.current) * lerpFactor;
      currentZRef.current += (targetCoords[2] - currentZRef.current) * lerpFactor;
      groupRef.current.position.set(currentXRef.current, 0, currentZRef.current);
    }

    const t = state.clock.getElapsedTime();
    if (cylinderMatRef.current) cylinderMatRef.current.opacity = calculateBeaconPulseOpacity(t, 0.55);
    if (diamondMatRef.current) diamondMatRef.current.opacity = calculateBeaconPulseOpacity(t, 0.75);
    if (ringMatRef.current) ringMatRef.current.opacity = calculateBeaconPulseOpacity(t, 0.45);
  });

  const pInfo = activeAnimation?.playerId ? playersInfo[activeAnimation.playerId] : undefined;
  const tokenColor = pInfo?.tokenColor ?? '#38BDF8';

  return (
    <group ref={groupRef} position={[0, 0, 0]} visible={isVisible}>
      <mesh position={[0, 1.75, 0]}>
        <cylinderGeometry args={[0.08, 0.28, 3.5, 16, 1, true]} />
        <meshBasicMaterial ref={cylinderMatRef} color={tokenColor} transparent={true} opacity={0.55} depthWrite={false} blending={AdditiveBlending} />
      </mesh>
      <mesh position={[0, 3.65, 0]}>
        <octahedronGeometry args={[0.22, 0]} />
        <meshBasicMaterial ref={diamondMatRef} color={tokenColor} transparent={true} opacity={0.75} depthWrite={false} blending={AdditiveBlending} />
      </mesh>
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.65, 24]} />
        <meshBasicMaterial ref={ringMatRef} color={tokenColor} transparent={true} opacity={0.45} depthWrite={false} blending={AdditiveBlending} />
      </mesh>
    </group>
  );
}
```

#### Task 2.4: Tái Xuất Pure Kinematic Helpers Trong `camera_state_machine.ts`
**Target physical file**: `src/client/3d/camera_state_machine.ts`

```typescript
<<<<
/**
 * [IMP-126] Tính toán Camera Offset theo 4 cạnh bàn cờ (Side-Aware Orientation)
 * Đảm bảo Camera luôn đứng từ phía ngoài nhìn vào cạnh của ô cờ đó,
 * giúp toàn bộ chữ tên địa danh và tranh di sản luôn hiển thị thuận mắt 100% (không lộn ngược 180°).
 */
export function resolveSideAwareCameraOffset(
  tileCoords: readonly [number, number, number],
  baseOffset: readonly [number, number, number] = CAMERA_CONFIG.tile_focus.offset
): [number, number, number] {
  const tx = Number.isFinite(tileCoords[0]) ? tileCoords[0] : 0;
  const tz = Number.isFinite(tileCoords[2]) ? tileCoords[2] : 0;
  const height = Number.isFinite(baseOffset[1]) ? baseOffset[1] : 6.4;

  // Bàn cờ vuông 18x18 (chu vi tâm = 9.0).
  // Phân chia 4 cạnh dựa trên tọa độ cực đại của hình vuông (|z| vs |x|):
  const absX = Math.abs(tx);
  const absZ = Math.abs(tz);

  if (absZ >= absX) {
    if (tz < 0) {
      // Cạnh Bắc (Side 2, e.g. Đà Lạt, Cao Tốc, Hải Phòng: z = -9):
      // Camera nằm ở phía Bắc (Z < -9) nhìn về phía Nam (+Z) để chữ thuận mắt người xem
      return [-1.8, height, -6.8];
    }
    // Cạnh Nam (Side 0, e.g. Bến Thành, Cần Thơ: z = +9):
    // Camera nằm ở phía Nam (Z > 9) nhìn về phía Bắc (-Z). Giữ nguyên baseOffset để bảo toàn 100% test cũ.
    return [Number.isFinite(baseOffset[0]) ? baseOffset[0] : 5.2, height, Number.isFinite(baseOffset[2]) ? baseOffset[2] : 5.2];
  } else {
    if (tx < 0) {
      // Cạnh Tây (Side 1, e.g. Điện Lực EVN: x = -9):
      // Camera nằm ở phía Tây (X < -9) nhìn về phía Đông (+X) để chữ thuận mắt người xem
      return [-6.8, height, 1.8];
    }
    // Cạnh Đông (Side 3, e.g. Hoàn Kiếm, Ba Đình: x = +9):
    // Camera nằm ở phía Đông (X > 9) nhìn về phía Tây (-X) để chữ thuận mắt người xem
    return [6.8, height, -1.8];
  }
}

/**
 * Tính toán tọa độ vị trí Camera tập trung vào ô đất mục tiêu
 */
export function calculateTileFocusCameraPosition(
  tileCoords: readonly [number, number, number],
  offset?: readonly [number, number, number]
): [number, number, number] {
  const tx = Number.isFinite(tileCoords[0]) ? tileCoords[0] : 0;
  const ty = Number.isFinite(tileCoords[1]) ? tileCoords[1] : 0;
  const tz = Number.isFinite(tileCoords[2]) ? tileCoords[2] : 0;
  const finalOffset = offset ?? resolveSideAwareCameraOffset(tileCoords);
  return [tx + finalOffset[0], ty + finalOffset[1], tz + finalOffset[2]];
}

/**
 * Rung chấn màn hình vi mô theo hàm tắt dần (300ms - 400ms)
 * tạo cảm giác trọng lượng vật lý đanh chắc khi công trình cắm mạnh xuống mặt bàn cờ.
 */
export function calculateScreenShake(
  elapsedSeconds: number,
  durationSeconds: number = 0.35,
  amplitude: number = 0.25,
  frequency: number = 42
): [number, number, number] {
  if (
    !Number.isFinite(elapsedSeconds) ||
    !Number.isFinite(durationSeconds) ||
    !Number.isFinite(amplitude) ||
    !Number.isFinite(frequency) ||
    elapsedSeconds < 0 ||
    elapsedSeconds >= durationSeconds
  ) {
    return [0, 0, 0];
  }
  const progress = elapsedSeconds / durationSeconds;
  // Đường bao suy giảm bậc hai (quadratic decay envelope)
  const decay = (1 - progress) * (1 - progress);
  const sx = Math.sin(elapsedSeconds * frequency) * amplitude * decay;
  const sy = Math.cos(elapsedSeconds * (frequency * 1.25)) * (amplitude * 0.7) * decay;
  const sz = Math.sin(elapsedSeconds * (frequency * 0.85) + 1.2) * (amplitude * 0.9) * decay;
  return [sx, sy, sz];
}

/**
 * Hàm suy giảm hàm mũ (exponential damping) không phụ thuộc tốc độ khung hình (frame-rate independent)
 */
export function dampValue(current: number, target: number, speed: number, dt: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(target)) {
    return Number.isFinite(target) ? target : 0;
  }
  const safeDt = Math.max(0, Math.min(dt, 0.1));
  const factor = 1 - Math.exp(-safeDt * speed);
  return current + (target - current) * factor;
}
====
export {
  resolveSideAwareCameraOffset,
  calculateTileFocusCameraPosition,
  calculateScreenShake,
  dampValue,
} from './camera_kinematic_helpers';
>>>>
```

```typescript
<<<<
/**
 * [IMP-73] Tính toán cự ly camera thích ứng theo tỷ lệ khung hình (Aspect-Ratio Frustum Fit)
 * Đảm bảo 4 góc sa bàn luôn nằm trong vùng an toàn, không bị cắt mép đáy hoặc mép bên.
 */
export function calculateResponsiveCameraDistance(aspect: number, baseDistance = 32): number {
  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 1.77;
  const safeBase = Number.isFinite(baseDistance) && baseDistance > 0 ? baseDistance : 32;
  if (safeAspect < 1.77) {
    return safeBase * Math.max(1.0, 1.77 / Math.max(safeAspect, 0.75));
  }
  return safeBase;
}
====
export { calculateResponsiveCameraDistance } from './camera_kinematic_helpers';
>>>>
```

#### Task 2.5: Tích hợp Spherical Orbit Return, Gesture Discrimination & Gắn Beacon trong `adaptive_cinematic_camera.tsx`
**Target physical file**: `src/client/3d/adaptive_cinematic_camera.tsx`

```typescript
<<<<
import {
  resolveCameraMode,
  calculateTargetCameraState,
  calculateScreenShake,
  checkHighStakesRoll,
  CAMERA_CONFIG,
} from './camera_state_machine';
import {
  calculateSplineArcCameraState,
  resolveDynamicGamePhase,
  resolveOverviewConfigByPhase,
  resolveJailFlightProgress,
} from './cinematic_spline_flyby';
====
import {
  resolveCameraMode,
  calculateTargetCameraState,
  calculateScreenShake,
  checkHighStakesRoll,
  CAMERA_CONFIG,
} from './camera_state_machine';
import {
  calculateSplineArcCameraState,
  resolveDynamicGamePhase,
  resolveOverviewConfigByPhase,
  resolveJailFlightProgress,
} from './cinematic_spline_flyby';
import { initSoftReturn, sampleSoftReturn, shouldBreakOnTouch, type SoftReturnState } from './camera_soft_return';
import { CameraLocationBeacon } from './camera_location_beacon';
>>>>
```

```typescript
<<<<
  const lastSkipTimeRef = useRef<number>(0);
  const lastDestinationCellRef = useRef<number | null>(null);
  const gamePhaseRef = useRef<1 | 2 | 3>(1);
====
  const lastSkipTimeRef = useRef<number>(0);
  const lastDestinationCellRef = useRef<number | null>(null);
  const gamePhaseRef = useRef<1 | 2 | 3>(1);
  const softReturnRef = useRef<SoftReturnState | null>(null);
  const touchStartTimeRef = useRef<number>(0);
  const justBrokeSoftReturnRef = useRef<boolean>(false);
>>>>
```

```typescript
<<<<
      window.__resetCameraToDefault = () => {
        isUserInteractingRef.current = false;
        lastUserInteractionTimeRef.current = 0;
        isResettingRef.current = true;
        isManualOverviewResetRef.current = true;
        camBaseRef.current = [camera.position.x, camera.position.y, camera.position.z];
        targetBaseRef.current = controlsRef.current
          ? [controlsRef.current.target.x, controlsRef.current.target.y, controlsRef.current.target.z]
          : defaultTarget;
        useGameStore.getState().setCameraFocusCell(null);
        useGameStore.getState().setHasUserCustomCamera?.(false);
      };
====
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
>>>>
```

```typescript
<<<<
      const isDragging = isUserInteractingRef.current;
      const isActionOngoing = isRolling || isPawnMoving || activeScreenShake !== null
        || (cameraFocusCell !== null)
        || (!hasUserCustomCamera && activeModal !== null);

      if (isDragging) {
        camBaseRef.current[0] = camera.position.x;
        camBaseRef.current[1] = camera.position.y;
        camBaseRef.current[2] = camera.position.z;
        targetBaseRef.current[0] = controlsRef.current.target.x;
        targetBaseRef.current[1] = controlsRef.current.target.y;
        targetBaseRef.current[2] = controlsRef.current.target.z;
      } else if (isActionOngoing || isResettingRef.current) {
        targetBaseRef.current[0] += (targetState.target[0] - targetBaseRef.current[0]) * lerpFactor;
        targetBaseRef.current[1] += (targetState.target[1] - targetBaseRef.current[1]) * lerpFactor;
        targetBaseRef.current[2] += (targetState.target[2] - targetBaseRef.current[2]) * lerpFactor;

        camBaseRef.current[0] += (targetState.position[0] - camBaseRef.current[0]) * lerpFactor;
        camBaseRef.current[1] += (targetState.position[1] - camBaseRef.current[1]) * lerpFactor;
        camBaseRef.current[2] += (targetState.position[2] - camBaseRef.current[2]) * lerpFactor;

        controlsRef.current.target.set(targetBaseRef.current[0], targetBaseRef.current[1], targetBaseRef.current[2]);
        camera.position.set(camBaseRef.current[0] + shakeOffset[0], camBaseRef.current[1] + shakeOffset[1], camBaseRef.current[2] + shakeOffset[2]);

        controlsRef.current.minDistance = (mode === 'overview' || mode === 'pre_match') ? 14 : 3.8;
        controlsRef.current.update();

        if (
          Math.abs(camBaseRef.current[0] - targetState.position[0]) < 0.05 &&
          Math.abs(camBaseRef.current[1] - targetState.position[1]) < 0.05 &&
          Math.abs(camBaseRef.current[2] - targetState.position[2]) < 0.05
        ) {
          isResettingRef.current = false;
          isManualOverviewResetRef.current = false;
        }
      }
====
      const isDragging = isUserInteractingRef.current;
      const isActionOngoing = isRolling || (!hasUserCustomCamera && isPawnMoving) || activeScreenShake !== null
        || (cameraFocusCell !== null)
        || (!hasUserCustomCamera && activeModal !== null);

      if (isDragging) {
        camBaseRef.current[0] = camera.position.x;
        camBaseRef.current[1] = camera.position.y;
        camBaseRef.current[2] = camera.position.z;
        targetBaseRef.current[0] = controlsRef.current.target.x;
        targetBaseRef.current[1] = controlsRef.current.target.y;
        targetBaseRef.current[2] = controlsRef.current.target.z;
      } else if (softReturnRef.current) {
        const sample = sampleSoftReturn(softReturnRef.current, performance.now());
        camBaseRef.current[0] = sample.position[0];
        camBaseRef.current[1] = sample.position[1];
        camBaseRef.current[2] = sample.position[2];
        targetBaseRef.current[0] = sample.target[0];
        targetBaseRef.current[1] = sample.target[1];
        targetBaseRef.current[2] = sample.target[2];
        controlsRef.current.target.set(sample.target[0], sample.target[1], sample.target[2]);
        camera.position.set(sample.position[0] + shakeOffset[0], sample.position[1] + shakeOffset[1], sample.position[2] + shakeOffset[2]);
        controlsRef.current.minDistance = 14;
        controlsRef.current.update();
        if (sample.isFinished) {
          softReturnRef.current = null;
          isResettingRef.current = false;
          isManualOverviewResetRef.current = false;
        }
      } else if (isActionOngoing || isResettingRef.current) {
        targetBaseRef.current[0] += (targetState.target[0] - targetBaseRef.current[0]) * lerpFactor;
        targetBaseRef.current[1] += (targetState.target[1] - targetBaseRef.current[1]) * lerpFactor;
        targetBaseRef.current[2] += (targetState.target[2] - targetBaseRef.current[2]) * lerpFactor;

        camBaseRef.current[0] += (targetState.position[0] - camBaseRef.current[0]) * lerpFactor;
        camBaseRef.current[1] += (targetState.position[1] - camBaseRef.current[1]) * lerpFactor;
        camBaseRef.current[2] += (targetState.position[2] - camBaseRef.current[2]) * lerpFactor;

        controlsRef.current.target.set(targetBaseRef.current[0], targetBaseRef.current[1], targetBaseRef.current[2]);
        camera.position.set(camBaseRef.current[0] + shakeOffset[0], camBaseRef.current[1] + shakeOffset[1], camBaseRef.current[2] + shakeOffset[2]);

        controlsRef.current.minDistance = (mode === 'overview' || mode === 'pre_match') ? 14 : 3.8;
        controlsRef.current.update();

        if (
          Math.abs(camBaseRef.current[0] - targetState.position[0]) < 0.05 &&
          Math.abs(camBaseRef.current[1] - targetState.position[1]) < 0.05 &&
          Math.abs(camBaseRef.current[2] - targetState.position[2]) < 0.05
        ) {
          isResettingRef.current = false;
          isManualOverviewResetRef.current = false;
        }
      }
>>>>
```

```typescript
<<<<
  return (
    <OrbitControls
      ref={(node) => {
        controlsRef.current = node;
        if (typeof window !== 'undefined') {
          if (node) window.__orbitControls = node;
          else delete window.__orbitControls;
        }
      }}
      enableRotate
      enablePan
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2.25}
      minDistance={14}
      maxDistance={65}
      minZoom={20}
      maxZoom={65}
      onStart={() => {
====
  return (
    <>
      <OrbitControls
        ref={(node) => {
          controlsRef.current = node;
          if (typeof window !== 'undefined') {
            if (node) window.__orbitControls = node;
            else delete window.__orbitControls;
          }
        }}
        enableRotate
        enablePan
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.25}
        minDistance={14}
        maxDistance={65}
        minZoom={20}
        maxZoom={65}
        onStart={() => {
>>>>
```

```typescript
<<<<
      onStart={() => {
        if (activeAnimation?.isAnimating) {
          isSkippingCameraAnimRef.current = true;
          lastSkipTimeRef.current = Date.now();
          isUserInteractingRef.current = false;
        } else {
          isUserInteractingRef.current = true;
          isManualOverviewResetRef.current = false;
        }
      }}
      onEnd={() => {
        // [ADV-03][USER-BUG-02] Khoa cuon trong cua so 600ms sau khi skip hoac khi dang skip de khong kich hoat nham custom camera
        if (activeAnimation?.isAnimating || isSkippingCameraAnimRef.current || hasSkippedCurrentMoveRef.current || (Date.now() - lastSkipTimeRef.current < 600)) {
          isUserInteractingRef.current = false;
          return;
        }
        isUserInteractingRef.current = false;
        lastUserInteractionTimeRef.current = Date.now();
        const refPos = currentOverviewPosRef.current;
        const refTarget = currentOverviewTargetRef.current;
        const distPos = Math.hypot(camera.position.x - refPos[0], camera.position.y - refPos[1], camera.position.z - refPos[2]);
        const distTarget = controlsRef.current
          ? Math.hypot(controlsRef.current.target.x - refTarget[0], controlsRef.current.target.y - refTarget[1], controlsRef.current.target.z - refTarget[2])
          : 0;
        if (distPos > 0.8 || distTarget > 0.5) {
          useGameStore.getState().setHasUserCustomCamera?.(true);
        }
      }}
    />
  );
}
====
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
    />
    <CameraLocationBeacon />
    </>
  );
}
>>>>
```

---

### Trạm 3: Kiểm Toán Toàn Diện & Chốt Chặn Cơ Học (Verification & Mechanical Gates)
1. **Kiểm tra Fast Pre-Filter**:
   ```bash
   npm run prefilter -- src/client/3d/camera_kinematic_helpers.ts src/client/3d/camera_soft_return.ts src/client/3d/camera_location_beacon.tsx src/client/3d/camera_state_machine.ts src/client/3d/adaptive_cinematic_camera.tsx tests/client/camera_soft_return_and_beacon.test.ts
   ```
2. **Kiểm tra Giới Hạn Scope**:
   ```bash
   node scripts/check_scope.mjs .agents/plans/PLAN_IMP_294_SOFT_RETURN_AND_FREE_ROAM_LOCK.md
   ```
3. **Kiểm tra Giới Hạn Dòng Mã (LOC Check)**:
   ```bash
   node scripts/check_loc.mjs src/client/3d/camera_kinematic_helpers.ts src/client/3d/camera_soft_return.ts src/client/3d/camera_location_beacon.tsx src/client/3d/camera_state_machine.ts src/client/3d/adaptive_cinematic_camera.tsx tests/client/camera_soft_return_and_beacon.test.ts
   ```
4. **Kiểm tra Không Hồi Quy (Zero Regressions)**:
   ```bash
   npx vitest run tests/client/camera_soft_return_and_beacon.test.ts tests/client/cinematic_spline_flyby.test.ts tests/client/dramatic_pacing_camera.test.ts tests/client/spatial_kinematics_camera.test.ts tests/client/camera_state_machine.test.ts tests/contracts/imp126_camera_orientation_and_topbar_mobile.test.ts tests/client/pawn_jump_and_camera_smoothness.test.ts
   ```
5. **Ghi Nhận Bằng Chứng Thực Tế & Kiểm Toán Vật Lý**:
   ```bash
   npm run capture:visual -- --ticket IMP-294 --scenario camera_soft_return_and_beacon
   node scripts/check_evidence.mjs IMP-294
   ```

---

### Trạm 4: Bằng Chứng Thị Giác Hai Khung Nhìn (Dual-Viewport Visual Evidence)
- **Viewport Desktop**: 1280x720 (Xác nhận ngọn hải đăng 3.5m hiển thị rực rỡ và hồi tiếp góc nhìn mượt mà).
- **Viewport Mobile Portrait**: 360x780 (Xác nhận cử chỉ chạm Break-on-Touch phản hồi tức thì và không bị giật camera).
- **Bộ ghi hình ảnh**: `node scripts/capture_visual_evidence.mjs --ticket IMP-294 --scenario camera_soft_return_and_beacon` xuất ảnh ra `.agents/evidence/imp-294_desktop.jpg` và `.agents/evidence/imp-294_mobile_360.jpg`.
