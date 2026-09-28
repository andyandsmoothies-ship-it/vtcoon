# KẾ HOẠCH TRIỂN KHAI BƯỚC 3: LIVING DIORAMA DYNAMICS (IMP-221) [HARDENED v3]

> **Mục tiêu**: Thổi hồn vào sa bàn đảo ngọc theo cảm hứng từ bài viết "Virtual Yosemite Photo Tour" (Trond Wuellner). Biến sa bàn từ một mô hình tĩnh thành một thế giới sống động: Cặp du thuyền bến cảng nhấp nhô dập dềnh hữu cơ trên mặt nước ngọc bích, tàu tuần du rẽ sóng chữ V, đàn hải âu mini đậu trên cọc cầu cảng với hành vi cất cánh/hạ cánh tương tác, và ngọn hải đăng xoay tia sáng quét 360 độ huyền ảo vào ban đêm.
> **Tiêu chuẩn áp dụng**: Antigravity 2.0, GEMINI.md Harness, TDD Detroit Style, Universal 5-Facet Matrix (16 atomic tests), Zero `as any`, Deep Modules & Anti-Slop.
> **Lịch sử Revisions**:
> - **v2**: Khắc phục 5 điểm từ `plan-griller` (P1-P5 audit).
> - **v3 (Hiện tại)**: Xử lý triệt để 4 điểm cứng vật lý (C1-C4) từ phản biện đĩa cứng: (C1) Làm rõ baseline 134 LOC vật lý và ghi nhận phase subscription re-render thưa thớt; (C2) Triệt tiêu hoàn toàn giật hình `CIRCLING` $\rightarrow$ `LANDING` bằng `landingFromRef` và `calculateCirclingExitPosition`; (C3) Xóa bỏ còi hải đăng khỏi click đàn chim; (C4) Chỉ định rõ phương thức `renderToStaticMarkup` cho test `[TC-221.14]`.

---

### 1. SƠ ĐỒ KIẾN TRÚC & DÒNG CHẢY DỮ LIỆU (VISUAL ARCHITECTURE)

```
                                 [useSafeFrame Loop (clock.elapsedTime)]
                                                    │
                 ┌──────────────────────────────────┼──────────────────────────────────┐
                 │                                  │                                  │
                 ▼                                  ▼                                  ▼
      [DioramaMarina Watercraft]          [PerchingCoastalBirds]              [HeritageLighthouse Beacon]
      - 2 Du thuyền neo đậu:              - 3 Hải âu đậu cọc bến thuyền:      - Đèn hải đăng chóp tháp:
        * Pitch bobbing (nhấp nhô mũi)      * Trạng thái IDLE (đậu rỉa lông)   * Tia sáng xoay quét 360 độ
        * Roll sway (lắc mạn trái/phải)     * Trạng thái SCARE (cất cánh)      * Chỉ bật khi sunset/night
        * Chu kỳ 3.2s & 3.8s lệch pha       * Lượn vòng cung rồi đáp lại       * Đặt đúng cao độ Fresnel y=0.72
      - Thuyền gỗ du ngoạn ven vịnh:        * C1 Continuity (không giật)       * Nón ánh sáng (spot/cone light)
        * V-wake trail bọt nước             * Click cất cánh (không còi)         quét trên mặt nước biển ngọc bích
        * Zero castShadow mobile            * e.stopPropagation() an toàn        * visible={isNightOrSunset}
                 │                                  │                                  │
                 └──────────────────────────────────┼──────────────────────────────────┘
                                                    ▼
                                        [Sa Bàn Saigon Living Diorama]
                                         (Thế giới sống động, chân thực)
```

---

### 2. BA HẠNG MỤC CỐT LÕI CỦA LIVING DIORAMA (BƯỚC 3)

#### 2.1 Động Lực Học Du Thuyền & Thuyền Du Ngoạn Bến Cảng (Harbor Watercraft Dynamics)
- **Cặp Du Thuyền Tại Bến Cảng (`DioramaMarina`)**:
  - Không còn bị "đóng băng" tĩnh tại chỗ, mà dao động theo nhịp sóng nước nhẹ nhàng trong `useSafeFrame`:
    - Du thuyền 1 (trắng sứ): $y(t) = -0.01 + \sin(t \times 2.8) \times 0.006$; lắc mạn $\text{rot}_z = \sin(t \times 2.4) \times 0.022$; nhấp nhô mũi $\text{rot}_x = \cos(t \times 2.1) \times 0.015$.
    - Du thuyền 2 (xanh navy): Dao động lệch pha $\phi = 1.6$ rad so với tàu 1 để tạo cảm giác hữu cơ tự nhiên, không rập khuôn máy móc.
- **Thuyền Tuần Du Bến Bạch Đằng (`DioramaHarborCruiser`)**:
  - Chiếc thuyền gỗ thanh lịch lướt chậm rãi ven bờ vịnh đảo (bán kính $r_X = 2.8, r_Z = 2.2$) với tốc độ êm ái ($0.16$ rad/s).
  - Góc xoay yaw luôn bám theo tiếp tuyến quỹ đạo $\arctan2(dx, dz)$.
  - Đuôi thuyền kéo theo vệt bọt rẽ sóng chữ V (V-wake trail co giãn $\pm 12\%$).
  - Toàn bộ mesh thuyền và bọt sóng tắt `castShadow` để bảo vệ ngân sách render GPU di động.

#### 2.2 Đàn Hải Âu / Bồ Câu Tương Tác Có Hành Vi Cất Cánh / Hạ Cánh (Perching Coastal Birds FSM)
- **Vị Trí Đậu Tự Nhiên**:
  - 3 chú chim mini đậu trên các cọc bích neo tàu (mooring bollards) và mỏm đá ngọn hải đăng của `DioramaMarina`.
- **Máy Trạng Thái Hành Vi (Micro-FSM)**:
  - `PERCHED` (Đang đậu): Thân chim hơi nhấp nhô theo nhịp thở ($\sin(t \times 3.0) \times 0.003$), đầu quay nhẹ ngẫu nhiên.
  - `TAKE_OFF` (Cất cánh - 1.5s): Kích hoạt khi người chơi click chuột/chạm tay vào đàn chim (`onPointerDown` kèm `e.stopPropagation()`), hoặc tự động kích hoạt ngẫu nhiên mỗi $18.0$ giây. Cánh chim vỗ đập nhanh ($14$ Hz), chim bay vút lên cao. Guard chống teleport: chỉ cất cánh khi chim đang ở trạng thái `PERCHED`. (Lưu ý: Không phát còi hải đăng khi chạm vào chim!).
  - `CIRCLING` (Lượn vòng - 5.0s): Chim bay lượn 1 vòng cung elip trên mặt nước vịnh ở cao độ $y \in [1.2, 2.0]$.
  - `LANDING` (Hạ cánh - 1.8s): Nội suy mượt mà $C^1$ từ chính tọa độ kết thúc lượn vòng `landingFrom` về cọc bích neo đậu cũ theo hàm Cosine smoothstep. Triệt tiêu 100% hiện tượng nhảy tọa độ (teleport snap).
- **Kiến trúc Zero Re-render 60 FPS**:
  - Dùng `flightStateRef = useRef<BirdFlightState>('PERCHED')` thay vì `useState`, triệt tiêu 100% chi phí React reconciliation trong render loop 60 FPS.
  - Ngoại hóa logic FSM thành hàm thuần túy `advanceBirdFlightFSM(state, elapsed)`, `triggerBirdScare(state)`, `calculateCirclingExitPosition(spot, birdIndex)` để bảo đảm 100% testable trong môi trường Vitest/Node.js.

#### 2.3 Ngọn Hải Đăng Xoay Tia Sáng Quét Ban Đêm (Heritage Lighthouse Rotating Beacon)
- **Đèn Tháp Tín Hiệu Thích Ứng Thời Gian Thực**:
  - **Ban Ngày (`day`)**: Đèn giữ mức mờ dịu (`intensity = 0.1`), nón tia sáng ẩn (`visible = false`) để tiết kiệm draw call.
  - **Hoàng Hôn (`sunset`)**: Đèn phát ra ánh sáng vàng hổ phách ấm áp (`#FDE047`, `intensity = 0.8`), chùm sáng nhẹ.
  - **Ban Đêm (`night`)**: Đèn đạt độ sáng rực rỡ (`intensity = 2.2`), chùm tia sáng quét $360^\circ$ liên tục trên mặt biển ngọc lam dạ quang (`angle = t * 1.2` rad/s).
  - Vị trí cụm đèn được gắn chính xác tại tâm thấu kính Fresnel pha lê $y = 0.72$ (không bị chôn vùi trong ruột tháp bê tông).
  - Điểm tương tác còi hải đăng (`heritage-lighthouse`) có `e.stopPropagation()` chống nổi bọt sự kiện xuống bàn cờ và kích hoạt `SoundEngine.playLighthouseHorn()`.
- **Note Về Phase Subscription**:
  - Hook `const phase = useEnvironmentStore((s) => s.phase);` trong `DioramaMarina` sẽ gây 1 lần re-render component khi phase đổi (day -> sunset -> night), đây là chuyển pha môi trường thưa thớt (sparse event, vài phút/lần), hoàn toàn chuẩn mực kiến trúc React.
  - Riêng toàn bộ chuyển động liên tục 60 FPS (tàu nhấp nhô pitch/roll, tia sáng quay 360 độ) đều được cập nhật trực tiếp qua three.js object references trong `useSafeFrame` với `useRef` mà KHÔNG gọi setState hay trigger bất kỳ React re-render nào trong render loop.

---

### 3. PHÂN TÍCH 5 NHÓM LỖI TIỀM ẨN ĐÃ ĐƯỢC KHẮC PHỤC (5 CRITICAL FAILURE MODES)

1. **FM1 (Frame-drop & Draw Call Explosion Khi Bổ Sung Nhiều Entity Nhỏ)**:
   - *Phòng vệ*: Tối đa 3 chim đậu + 1 thuyền tuần du. Toàn bộ hình học dùng Low-poly tối giản (< 35 vertices/chim, < 50 vertices/thuyền). Gỡ bỏ hoàn toàn `castShadow` trên thực thể vi mô, bảo đảm không tăng shadow map pass. Nón sáng hải đăng ẩn (`visible = false`) vào ban ngày.
2. **FM2 (Bird Flight Trajectory Desync / Air Teleport)**:
   - *Phòng vệ*: Guard chống click khi đang bay (`triggerBirdScare` chỉ kích hoạt khi `currentState === 'PERCHED'`). Quỹ đạo hạ cánh nội suy Cosine smoothstep từ chính vị trí bay `landingFrom` về cọc đích, triệt tiêu 100% giật hình.
3. **FM3 (Beacon Light Shadow & Ruột Tháp Clipping)**:
   - *Phòng vệ*: Đặt beacon tại đúng cao độ thấu kính Fresnel $y = 0.72$. Nón tia sáng hải đăng dùng hình học bán trong suốt kết hợp `PointLight` nhỏ KHÔNG đổ bóng (`castShadow = false`).
4. **FM4 (Click Interaction Conflict / Event Bubbling)**:
   - *Phòng vệ*: Sự kiện `onPointerDown` trên chim và `onClick`/`onPointerDown` trên ngọn hải đăng đều gọi `e.stopPropagation()` triệt để, ngăn chặn kích hoạt nhầm ô đất bàn cờ hoặc camera controls.
5. **FM5 (Backward Compatibility Regression Với Existing Diorama Tests)**:
   - *Phòng vệ*: Giữ nguyên thuộc tính `data-testid="heritage-lighthouse"`, màu thấu kính `#FEF08A`, tọa độ bến du thuyền `[4.5, 0.1, 4.2]`, bảo toàn 100% các hợp đồng hiện hành.

---

### 4. ĐO LƯỜNG NGÂN SÁCH LOC (PRE-CODING LOC BASELINE)

Đo lường vật lý thực tế trên đĩa cứng:

| Tệp Vật Lý | Phân Loại Tier | LOC Hiện Tại (Thực tế đĩa) | Dự Kiến Delta | LOC Sau Khi Sửa | Đánh Giá Ngân Sách |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/diorama/diorama_marina.tsx` | Tier 2 (3D View) | 134 dòng (120 non-empty) | +55 | 189 | ✔️ An toàn (Trần <= 500) |
| `src/client/3d/diorama/diorama_perching_birds.tsx` | Tier 2 (New Module) | 0 | +165 | 165 | ✔️ An toàn (Trần <= 500) |
| `src/client/3d/diorama/diorama_harbor_cruiser.tsx` | Tier 2 (New Module) | 0 | +120 | 120 | ✔️ An toàn (Trần <= 500) |
| `tests/client/living_diorama_dynamics.test.ts` | Test Suite | 0 | +250 | 250 | ✔️ An toàn (Trần <= 600) |

---

### 5. MA TRẬN KIỂM THỬ HỢP ĐỒNG 5 MẶT (UNIVERSAL 5-FACET MATRIX - 16 ATOMIC TESTS)

Toàn bộ test case nằm trong [`tests/client/living_diorama_dynamics.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/living_diorama_dynamics.test.ts):

- **Facet 1: Core Mechanics & Watercraft Dynamics (4 tests)**
  - `[TC-221.01/MSS][UC-IMP221][Facet-1/YachtBobbing]`: `calculateWatercraftBobbing(time, phase)` tính toán chuyển động nhấp nhô cao độ $y$ và góc nghiêng $\text{rot}_z, \text{rot}_x$ êm dịu, không giật, trả về $\{y, \text{rot}Z, \text{rot}X\}$.
  - `[TC-221.02/MSS][UC-IMP221][Facet-1/PhaseOffset]`: Hai du thuyền neo đậu có độ lệch pha $\Delta \phi = 1.6 \ge 1.2$ rad, bảo đảm không chuyển động rập khuôn đồng loạt.
  - `[TC-221.03/MSS][UC-IMP221][Facet-1/CruiserTrajectory]`: `calculateCruiserTrajectory(time)` tính toán vị trí $(x, z)$ và góc quay $\text{yaw}$ theo tiếp tuyến chuyển động liên tục $\arctan2(dx, dz)$.
  - `[TC-221.04/MSS][UC-IMP221][Facet-1/CruiserWake]`: `calculateCruiserWake(time)` dao động điều hòa trong dải $[0.88, 1.12]$ quanh mốc $1.0$.

- **Facet 2: Boundary & Range Clamping (3 tests)**
  - `[TC-221.05/MSS][UC-IMP221][Facet-2/BobbingBounds]`: Biên độ nhấp nhô $y$ của tàu neo đậu không vượt quá $\pm 0.012$, góc nghiêng không vượt quá $\pm 0.04$ rad (không lật tàu).
  - `[TC-221.06/MSS][UC-IMP221][Facet-2/BirdFlightAltitude]`: Độ cao bay `pos.y` của chim luôn nằm trong dải an toàn $[0.05, 2.5]$ ở mọi trạng thái FSM (không bay đâm xuyên lòng đất hay bay mất khỏi màn hình).
  - `[TC-221.07/MSS][UC-IMP221][Facet-2/BeaconIntensityClamp]`: `calculateBeaconIntensity(phase)` luôn kẹp trong dải an toàn $[0.0, 3.0]$ cho mọi pha thời gian.

- **Facet 3: Bird Behavior FSM & Reactivity (3 tests)**
  - `[TC-221.08/MSS][UC-IMP221][Facet-3/IdlePerching]`: Trạng thái ban đầu của chim là `PERCHED` tại đúng tọa độ cọc bích neo tàu với biên độ thở vi mô $\le 0.005$.
  - `[TC-221.09/MSS][UC-IMP221][Facet-3/ScareTriggerGuard]`: Kích hoạt `triggerBirdScare('PERCHED')` chuyển sang `'TAKE_OFF'`; nhưng nếu gọi khi chim đang `'CIRCLING'` hoặc `'LANDING'`, hàm giữ nguyên trạng thái hiện tại (chống air teleport).
  - `[TC-221.10/MSS][UC-IMP221][Facet-3/LandingDiscontinuityElimination]`: Vị trí bắt đầu của `'LANDING'` ($t=0$) khớp chính xác tuyệt đối với vị trí kết thúc của `'CIRCLING'` qua `calculateCirclingExitPosition` (sai lệch khoảng cách $= 0$).

- **Facet 4: Time-of-Day Lighting Integration (3 tests)**
  - `[TC-221.11/MSS][UC-IMP221][Facet-4/DayBeacon]`: Ở pha `'day'`, `calculateBeaconIntensity('day')` giữ mức cường độ mờ dịu $\le 0.2$.
  - `[TC-221.12/MSS][UC-IMP221][Facet-4/SunsetBeacon]`: Ở pha `'sunset'`, `calculateBeaconIntensity('sunset')` đạt $\ge 0.6$ và $\le 1.0$.
  - `[TC-221.13/MSS][UC-IMP221][Facet-4/NightBeaconSweep]`: Ở pha `'night'`, `calculateBeaconIntensity('night')` đạt $\ge 1.8$ và `calculateBeaconRotation(t, 1.2)` quay góc liên tục với tốc độ $1.2$ rad/s.

- **Facet 5: Backward Compatibility & Resource Teardown (3 tests)**
  - `[TC-221.14/MSS][UC-IMP221][Facet-5/LighthouseTestId]`: Chỉ định rõ: Dùng `renderToStaticMarkup(<DioramaMarina />)` trong Node.js, `expect(html).toContain('data-testid="heritage-lighthouse"')` và `expect(html).toContain('#FEF08A')`.
  - `[TC-221.15/MSS][UC-IMP221][Facet-5/ZeroShadowOverhead]`: Nón sáng hải đăng, chim đậu và thuyền tuần du không bật `castShadow`, bảo vệ ngân sách render GPU di động.
  - `[TC-221.16/MSS][UC-IMP221][Facet-5/SSRMarkupSafety]`: `renderToStaticMarkup` kết xuất toàn bộ bến thuyền, đàn chim và tàu tuần du trơn tru trong môi trường Node.js.

---

### 6. DROP-IN CODE SNIPPETS CỤ THỂ

#### Snippet 1: Deep Module Đàn Chim Đậu Cọc [`src/client/3d/diorama/diorama_perching_birds.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_perching_birds.tsx)

```tsx
// [UI-S02/MSS][IMP-221] DioramaPerchingBirds — Dynamic perching seagulls with takeoff & landing FSM
import React, { useRef } from 'react';
import type { Group } from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import { useSafeFrame } from '../safe_frame';

export type BirdFlightState = 'PERCHED' | 'TAKE_OFF' | 'CIRCLING' | 'LANDING';

export interface PerchSpot {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly baseRotY: number;
}

export interface BirdVector3Rot {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly rotY: number;
}

export const PERCH_SPOTS: readonly PerchSpot[] = [
  { x: -1.05, y: 0.055, z: 0.4, baseRotY: Math.PI / 2 },
  { x: -1.05, y: 0.055, z: -0.6, baseRotY: Math.PI / 2 },
  { x: 0.35, y: 0.12, z: 0.7, baseRotY: -Math.PI / 4 },
];

export const BIRD_FSM_DURATIONS = {
  TAKE_OFF: 1.5,
  CIRCLING: 5.0,
  LANDING: 1.8,
  AUTO_TAKEOFF_INTERVAL: 18.0,
} as const;

/**
 * Calculates exact exit coordinates of circling path at t = CIRCLING duration
 * to ensure 100% continuous Hermite landing without mid-air teleport.
 */
export function calculateCirclingExitPosition(spot: PerchSpot, birdIndex: number): BirdVector3Rot {
  const theta = BIRD_FSM_DURATIONS.CIRCLING * 1.5 + birdIndex * 0.8;
  const r = 1.2 + birdIndex * 0.3;
  return {
    x: spot.x + Math.cos(theta) * r,
    y: spot.y + 0.8 + Math.sin(BIRD_FSM_DURATIONS.CIRCLING * 2.0) * 0.15,
    z: spot.z + Math.sin(theta) * r,
    rotY: -theta,
  };
}

/**
 * Pure FSM transition helper for 100% testability outside R3F Canvas
 */
export function advanceBirdFlightFSM(
  currentState: BirdFlightState,
  elapsedStateTime: number
): { nextState: BirdFlightState; resetTime: boolean } {
  if (currentState === 'TAKE_OFF' && elapsedStateTime >= BIRD_FSM_DURATIONS.TAKE_OFF) {
    return { nextState: 'CIRCLING', resetTime: true };
  }
  if (currentState === 'CIRCLING' && elapsedStateTime >= BIRD_FSM_DURATIONS.CIRCLING) {
    return { nextState: 'LANDING', resetTime: true };
  }
  if (currentState === 'LANDING' && elapsedStateTime >= BIRD_FSM_DURATIONS.LANDING) {
    return { nextState: 'PERCHED', resetTime: true };
  }
  return { nextState: currentState, resetTime: false };
}

/**
 * Pure trigger function with anti-midair-teleport guard
 */
export function triggerBirdScare(currentState: BirdFlightState): BirdFlightState {
  if (currentState !== 'PERCHED') {
    return currentState; // Guard: No teleport if already in flight
  }
  return 'TAKE_OFF';
}

export function calculateBirdFlightPosition(
  state: BirdFlightState,
  elapsedStateTime: number,
  spot: PerchSpot,
  birdIndex: number,
  landingFrom?: BirdVector3Rot
): { x: number; y: number; z: number; rotY: number; wingFlap: number } {
  if (!Number.isFinite(elapsedStateTime)) {
    return { x: spot.x, y: spot.y, z: spot.z, rotY: spot.baseRotY, wingFlap: 0 };
  }

  if (state === 'PERCHED') {
    const breathe = Math.sin(elapsedStateTime * 3.0 + birdIndex) * 0.003;
    const headTurn = Math.sin(elapsedStateTime * 0.8 + birdIndex * 2) * 0.15;
    return {
      x: spot.x,
      y: spot.y + breathe,
      z: spot.z,
      rotY: spot.baseRotY + headTurn,
      wingFlap: 0,
    };
  }

  if (state === 'TAKE_OFF') {
    const progress = Math.min(1.0, elapsedStateTime / BIRD_FSM_DURATIONS.TAKE_OFF);
    const ease = progress * progress;
    const flap = Math.sin(elapsedStateTime * 14.0) * 0.45;
    return {
      x: spot.x + Math.sin(spot.baseRotY) * ease * 0.8,
      y: spot.y + ease * 0.8,
      z: spot.z + Math.cos(spot.baseRotY) * ease * 0.8,
      rotY: spot.baseRotY,
      wingFlap: flap,
    };
  }

  if (state === 'CIRCLING') {
    const theta = elapsedStateTime * 1.5 + birdIndex * 0.8;
    const r = 1.2 + birdIndex * 0.3;
    const flap = Math.sin(elapsedStateTime * 8.0) * 0.35;
    return {
      x: spot.x + Math.cos(theta) * r,
      y: spot.y + 0.8 + Math.sin(elapsedStateTime * 2.0) * 0.15,
      z: spot.z + Math.sin(theta) * r,
      rotY: -theta,
      wingFlap: flap,
    };
  }

  // LANDING: Continuous interpolation from actual exit location to perch spot
  const progress = Math.min(1.0, elapsedStateTime / BIRD_FSM_DURATIONS.LANDING);
  const smooth = 1.0 - Math.cos(progress * Math.PI * 0.5); // 0 at start, 1 at destination
  const start = landingFrom ?? calculateCirclingExitPosition(spot, birdIndex);

  const currentX = start.x + (spot.x - start.x) * smooth;
  const currentY = start.y + (spot.y - start.y) * smooth;
  const currentZ = start.z + (spot.z - start.z) * smooth;
  const currentRotY = start.rotY + (spot.baseRotY - start.rotY) * smooth;
  const flap = Math.sin(elapsedStateTime * 6.0) * (1.0 - progress) * 0.3;

  return {
    x: currentX,
    y: currentY,
    z: currentZ,
    rotY: currentRotY,
    wingFlap: flap,
  };
}

export function DioramaPerchingBirds(): React.ReactElement {
  const flightStateRef = useRef<BirdFlightState>('PERCHED');
  const stateTimeRef = useRef<number>(0);
  const idleTimeRef = useRef<number>(0);
  const landingFromRef = useRef<(BirdVector3Rot | null)[]>([null, null, null]);
  const birdsRef = useRef<(Group | null)[]>([]);
  const wingsRef = useRef<(Group | null)[]>([]);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (flightStateRef.current === 'PERCHED') {
      flightStateRef.current = triggerBirdScare(flightStateRef.current);
      stateTimeRef.current = 0;
      idleTimeRef.current = 0;
      // Note: Không gọi còi hải đăng tại đây
    }
  };

  useSafeFrame((_, delta) => {
    const clampedDelta = Math.min(delta, 0.1);
    stateTimeRef.current += clampedDelta;

    const transition = advanceBirdFlightFSM(flightStateRef.current, stateTimeRef.current);
    if (transition.resetTime) {
      if (transition.nextState === 'LANDING') {
        // Ghi lại vị trí kết thúc lượn vòng của từng chim để hạ cánh liên tục
        PERCH_SPOTS.forEach((spot, idx) => {
          const bird = birdsRef.current[idx];
          if (bird) {
            landingFromRef.current[idx] = {
              x: bird.position.x,
              y: bird.position.y,
              z: bird.position.z,
              rotY: bird.rotation.y,
            };
          } else {
            landingFromRef.current[idx] = calculateCirclingExitPosition(spot, idx);
          }
        });
      }
      flightStateRef.current = transition.nextState;
      stateTimeRef.current = 0;
    }

    if (flightStateRef.current === 'PERCHED') {
      idleTimeRef.current += clampedDelta;
      if (idleTimeRef.current >= BIRD_FSM_DURATIONS.AUTO_TAKEOFF_INTERVAL) {
        flightStateRef.current = triggerBirdScare(flightStateRef.current);
        stateTimeRef.current = 0;
        idleTimeRef.current = 0;
      }
    }

    PERCH_SPOTS.forEach((spot, idx) => {
      const bird = birdsRef.current[idx];
      const wing = wingsRef.current[idx];
      if (!bird) return;

      const pos = calculateBirdFlightPosition(
        flightStateRef.current,
        stateTimeRef.current,
        spot,
        idx,
        landingFromRef.current[idx] ?? undefined
      );
      bird.position.set(pos.x, pos.y, pos.z);
      bird.rotation.y = pos.rotY;

      if (wing) {
        wing.rotation.z = pos.wingFlap;
      }
    });
  });

  return (
    <group data-testid="diorama-perching-birds" onPointerDown={handlePointerDown}>
      {PERCH_SPOTS.map((_, idx) => (
        <group
          key={`perching-bird-${idx}`}
          ref={(el) => {
            birdsRef.current[idx] = el;
          }}
          scale={[0.22, 0.22, 0.22]}
        >
          {/* Thân chim bồ câu / hải âu mini (Zero castShadow theo [TC-221.15]) */}
          <mesh position={[0, 0.08, 0]}>
            <boxGeometry args={[0.12, 0.1, 0.28]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.5} />
          </mesh>
          {/* Mỏ chim vàng cam */}
          <mesh position={[0, 0.08, 0.16]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.03, 0.08, 4]} />
            <meshStandardMaterial color="#F59E0B" roughness={0.3} />
          </mesh>
          {/* Cánh chim */}
          <group
            ref={(el) => {
              wingsRef.current[idx] = el;
            }}
            position={[0, 0.11, 0]}
          >
            <mesh position={[-0.14, 0, 0]}>
              <boxGeometry args={[0.22, 0.015, 0.14]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.4} />
            </mesh>
            <mesh position={[0.14, 0, 0]}>
              <boxGeometry args={[0.22, 0.015, 0.14]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.4} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}
```

---

#### Snippet 2: Thuyền Tuần Du Bến Bạch Đằng [`src/client/3d/diorama/diorama_harbor_cruiser.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_harbor_cruiser.tsx)

```tsx
// [UI-S02/MSS][IMP-221] DioramaHarborCruiser — Scenic wooden boat cruising the marina bay
import React, { useRef } from 'react';
import type { Group, Mesh } from 'three';
import { useSafeFrame } from '../safe_frame';

export function calculateCruiserWake(time: number): number {
  if (!Number.isFinite(time)) return 1.0;
  return 1.0 + Math.sin(time * 5.0) * 0.12;
}

export function calculateCruiserTrajectory(time: number): { x: number; y: number; z: number; yaw: number } {
  if (!Number.isFinite(time)) return { x: -3.2, y: -0.01, z: 0.2, yaw: 0 };
  const speed = 0.16;
  const angle = time * speed;
  const rX = 2.8;
  const rZ = 2.2;
  const x = -3.2 + Math.cos(angle) * rX;
  const z = 0.2 + Math.sin(angle) * rZ;
  const y = -0.01 + Math.sin(time * 3.0) * 0.005;

  const dx = -Math.sin(angle) * rX;
  const dz = Math.cos(angle) * rZ;
  const yaw = Math.atan2(dx, dz);

  return { x, y, z, yaw };
}

export function DioramaHarborCruiser(): React.ReactElement {
  const boatRef = useRef<Group>(null);
  const wakeRef = useRef<Mesh>(null);

  useSafeFrame((state) => {
    const t = state.clock.elapsedTime;
    if (boatRef.current) {
      const traj = calculateCruiserTrajectory(t);
      boatRef.current.position.set(traj.x, traj.y, traj.z);
      boatRef.current.rotation.y = traj.yaw;
      boatRef.current.rotation.z = Math.sin(t * 2.8) * 0.02;
    }
    if (wakeRef.current) {
      const s = calculateCruiserWake(t);
      wakeRef.current.scale.set(s, 1, s);
    }
  });

  return (
    <group ref={boatRef} position={[-3.2, -0.01, 0.2]} data-testid="diorama-harbor-cruiser">
      {/* Zero castShadow theo chuẩn [TC-221.15] */}
      <mesh position={[0, 0.035, 0]}>
        <boxGeometry args={[0.26, 0.05, 0.72]} />
        <meshStandardMaterial color="#78350F" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.045, 0.42]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.2, 0.05, 0.2]} />
        <meshStandardMaterial color="#78350F" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.09, -0.04]}>
        <cylinderGeometry args={[0.13, 0.13, 0.38, 8, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#FEF3C7" roughness={0.4} />
      </mesh>
      <mesh ref={wakeRef} position={[0, -0.005, -0.45]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.35, 0.45]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}
```

---

#### Snippet 3: Tích hợp và Động lực học Du Thuyền trong [`src/client/3d/diorama/diorama_marina.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_marina.tsx)

```tsx
import React, { useRef } from 'react';
import type { Group } from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import { SoundEngine } from '../../audio/sound_engine';
import { useSafeFrame } from '../safe_frame';
import { useEnvironmentStore, type TimeOfDayPhase } from '../../store/environment_store';
import { DioramaPerchingBirds } from './diorama_perching_birds';
import { DioramaHarborCruiser } from './diorama_harbor_cruiser';

export function calculateWatercraftBobbing(time: number, phaseOffset: number = 0): { y: number; rotZ: number; rotX: number } {
  if (!Number.isFinite(time)) return { y: 0, rotZ: 0, rotX: 0 };
  const y = Math.sin(time * 2.8 + phaseOffset) * 0.006;
  const rotZ = Math.sin(time * 2.4 + phaseOffset) * 0.022;
  const rotX = Math.cos(time * 2.1 + phaseOffset) * 0.015;
  return { y, rotZ, rotX };
}

export function calculateBeaconIntensity(phase: TimeOfDayPhase): number {
  if (phase === 'night') return 2.2;
  if (phase === 'sunset') return 0.8;
  return 0.1;
}

export function calculateBeaconRotation(time: number, speed: number = 1.2): number {
  if (!Number.isFinite(time)) return 0;
  return time * speed;
}

export function DioramaMarina(): React.ReactElement {
  // Phase subscription: Chỉ re-render khi phase thay đổi (vài phút/lần). Không ảnh hưởng 60 FPS frame loop.
  const phase = useEnvironmentStore((s) => s.phase);
  const yacht1Ref = useRef<Group>(null);
  const yacht2Ref = useRef<Group>(null);
  const beaconRef = useRef<Group>(null);

  useSafeFrame((state) => {
    const t = state.clock.elapsedTime;
    if (yacht1Ref.current) {
      const b1 = calculateWatercraftBobbing(t, 0.0);
      yacht1Ref.current.position.y = -0.01 + b1.y;
      yacht1Ref.current.rotation.z = b1.rotZ;
      yacht1Ref.current.rotation.x = b1.rotX;
    }
    if (yacht2Ref.current) {
      const b2 = calculateWatercraftBobbing(t, 1.6);
      yacht2Ref.current.position.y = -0.01 + b2.y;
      yacht2Ref.current.rotation.z = b2.rotZ;
      yacht2Ref.current.rotation.x = b2.rotX;
    }
    if (beaconRef.current) {
      beaconRef.current.rotation.y = calculateBeaconRotation(t, 1.2);
    }
  });

  const beaconIntensity = calculateBeaconIntensity(phase);
  const isNightOrSunset = phase === 'night' || phase === 'sunset';

  const handleLighthouseInteraction = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    SoundEngine.playLighthouseHorn();
  };

  return (
    <group position={[4.5, 0.1, 4.2]}>
      {/* 1. CẦU CẢNG GỖ & SÀN PROMENADE VEN VỊNH */}
      <group position={[-1.2, 0.02, 0]}>
        <mesh receiveShadow castShadow position={[0, 0, 0]}>
          <boxGeometry args={[0.36, 0.04, 2.4]} />
          <meshStandardMaterial color="#854D0E" roughness={0.7} />
        </mesh>
        <mesh receiveShadow castShadow position={[-0.4, 0, 0.4]}>
          <boxGeometry args={[0.6, 0.035, 0.22]} />
          <meshStandardMaterial color="#854D0E" roughness={0.7} />
        </mesh>
        <mesh receiveShadow castShadow position={[-0.4, 0, -0.6]}>
          <boxGeometry args={[0.6, 0.035, 0.22]} />
          <meshStandardMaterial color="#854D0E" roughness={0.7} />
        </mesh>
        {[-0.8, -0.2, 0.4, 0.9].map((pz) => (
          <mesh key={`bollard-${pz}`} position={[0.15, 0.035, pz]}>
            <cylinderGeometry args={[0.015, 0.02, 0.04, 6]} />
            <meshStandardMaterial color="#B45309" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* 2. CẶP DU THUYỀN SIÊU SANG ĐIÊU KHẮC */}
      <group ref={yacht1Ref} position={[-1.8, -0.01, -0.6]} rotation={[0, -0.2, 0]}>
        <mesh castShadow receiveShadow position={[0, 0.04, 0]}>
          <boxGeometry args={[0.42, 0.07, 1.1]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.2} metalness={0.1} />
        </mesh>
        <mesh castShadow position={[0, 0.04, -0.62]} rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[0.3, 0.07, 0.3]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.2} metalness={0.1} />
        </mesh>
        <mesh castShadow position={[0, 0.09, -0.05]}>
          <boxGeometry args={[0.3, 0.06, 0.52]} />
          <meshStandardMaterial color="#0284C7" roughness={0.1} metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.13, 0.02]}>
          <boxGeometry args={[0.26, 0.025, 0.38]} />
          <meshStandardMaterial color="#F1F5F9" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.16, 0.1]}>
          <cylinderGeometry args={[0.01, 0.02, 0.04, 4]} />
          <meshStandardMaterial color="#CBD5E1" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      <group ref={yacht2Ref} position={[-1.8, -0.01, 0.5]} rotation={[0, 0.1, 0]}>
        <mesh castShadow receiveShadow position={[0, 0.035, 0]}>
          <boxGeometry args={[0.36, 0.06, 0.85]} />
          <meshStandardMaterial color="#0F172A" roughness={0.3} metalness={0.3} />
        </mesh>
        <mesh castShadow position={[0, 0.035, -0.48]} rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[0.25, 0.06, 0.25]} />
          <meshStandardMaterial color="#0F172A" roughness={0.3} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0.08, -0.05]}>
          <boxGeometry args={[0.26, 0.05, 0.35]} />
          <meshStandardMaterial color="#38BDF8" roughness={0.1} metalness={0.8} />
        </mesh>
      </group>

      {/* 3. NGỌN HẢI ĐĂNG CỔ ĐIỂN BIỂU TƯỢNG */}
      <group
        position={[0.6, 0.06, 0.5]}
        data-testid="heritage-lighthouse"
        onClick={handleLighthouseInteraction}
        onPointerDown={handleLighthouseInteraction}
      >
        <mesh castShadow receiveShadow position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.32, 0.38, 0.08, 16]} />
          <meshStandardMaterial color="#57534E" roughness={0.8} />
        </mesh>
        <mesh castShadow position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.22, 0.28, 0.24, 16]} />
          <meshStandardMaterial color="#DC2626" roughness={0.4} />
        </mesh>
        <mesh castShadow position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.17, 0.22, 0.2, 16]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
        </mesh>
        <mesh castShadow position={[0, 0.56, 0]}>
          <cylinderGeometry args={[0.13, 0.17, 0.16, 16]} />
          <meshStandardMaterial color="#DC2626" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.65, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.02, 16]} />
          <meshStandardMaterial color="#1E293B" roughness={0.5} />
        </mesh>

        {/* Thấu kính đèn biển Fresnel pha lê phát sáng vàng ấm (#FEF08A bảo toàn test cũ) */}
        <mesh position={[0, 0.72, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.12, 12]} />
          <meshBasicMaterial color="#FEF08A" />
        </mesh>

        {/* Tia sáng quét 360 độ đặt đúng cao độ Fresnel y = 0.72 */}
        <group ref={beaconRef} position={[0, 0.72, 0]} visible={isNightOrSunset}>
          <mesh position={[0, 0, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.3, 0.8, 12, 1, true]} />
            <meshBasicMaterial
              color={phase === 'sunset' ? '#FDE047' : '#FFFFFF'}
              transparent
              opacity={beaconIntensity * 0.25}
            />
          </mesh>
          <pointLight
            color={phase === 'sunset' ? '#FDE047' : '#FFFFFF'}
            intensity={beaconIntensity}
            distance={4}
            decay={2}
            castShadow={false}
          />
        </group>

        <mesh position={[0, 0.83, 0]} castShadow>
          <coneGeometry args={[0.14, 0.14, 16]} />
          <meshStandardMaterial color="#065F46" roughness={0.3} metalness={0.6} />
        </mesh>
      </group>

      {/* Đàn hải âu đậu cọc bến thuyền */}
      <DioramaPerchingBirds />

      {/* Thuyền tuần du rẽ sóng vịnh bến Bạch Đằng */}
      <DioramaHarborCruiser />
    </group>
  );
}
```

---

### 7. QUY TRÌNH 3 TRẠM TỰ HÀNH (3-STATION PIPELINE EXECUTION)

1. **Station 1 (RED Contract Test)**: `qa-tester` tạo tệp `tests/client/living_diorama_dynamics.test.ts` chứa 16 atomic tests theo đúng ma trận Universal 5-Facet (Facet 1 đến Facet 5), kiểm thử trực tiếp các pure functions và SSR markup contracts (`renderToStaticMarkup`). Chứng minh Business RED trước khi triển khai code sản xuất. Cấm chạm vào `src/**`.
2. **Station 2 (GREEN Implementation)**: `implementer` hiện thực mã nguồn tại `src/client/3d/diorama/diorama_perching_birds.tsx`, `src/client/3d/diorama/diorama_harbor_cruiser.tsx`, và cập nhật `src/client/3d/diorama/diorama_marina.tsx` để đưa toàn bộ 16 tests về GREEN (đồng thời bảo toàn 11/11 miniature_city_diorama tests tiếp tục PASS 100%).
3. **Station 2.5 (Sweeping Scout Audit)**: `scout` quét vật lý 100% các tệp đã sửa trên đĩa đối soát 5 nhóm lỗi (Stale state, unhandled async, memory leak, dirty casts, dead code) và kiểm tra trần LOC.
4. **Station 3 (Independent Review)**: Các reviewers độc lập (`spec-reviewer`, `game-3d-visual-critic`, `code-reviewer`) thẩm định vật lý đĩa và bằng chứng snapshot tại `.agents/evidence/` để đưa ra phán quyết sign-off.
