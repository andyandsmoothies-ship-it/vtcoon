# KẾ HOẠCH TRIỂN KHAI V2: ADAPTIVE RESOLUTION & DYNAMIC DPR CONTROLLER (IMP-219)

> **Mục tiêu**: Tự động điều chỉnh độ phân giải kết xuất (Device Pixel Ratio - DPR) theo tải thực tế của GPU và tốc độ khung hình (FPS), bảo vệ ngưỡng 60 FPS cố định trên thiết bị di động mà không gây nhấp nháy (jitter) hay gián đoạn hiển thị.
> **Tiêu chuẩn áp dụng**: Antigravity 2.0, GEMINI.md Harness, TDD Detroit Style, Universal 5-Facet Matrix (17 atomic tests), Zero `as any`.
> **Phiên bản cập nhật v2**: Đã khắc phục triệt để 5 Điểm Cứng Runtime (C1-C5) và bổ sung 3 Điểm Cải Tiến Kiến Trúc (I1-I3) sau đối soát vật lý đĩa cứng.

---

### 1. SƠ ĐỒ KIẾN TRÚC & DÒNG CHẢY DỮ LIỆU (VISUAL ARCHITECTURE)

```
[Khởi tạo Canvas: dpr={[0.85, 1.0]} Mobile / {[1.0, 1.5]} Desktop]
                               │ (Đọc gl.getPixelRatio() frame đầu)
                               ▼
[useFrame(({ gl, setDpr }, delta))] ──> [PerfBudgetController: recordFrameTime]
                                                    │
                                    [Đo FPS trượt 60 frames gần nhất]
                                                    │
                 ┌──────────────────────────────────┴──────────────────────────────────┐
                 ▼ (FPS < 45 liên tục >= 1.5s)                                         ▼ (FPS >= 55 liên tục >= 3.0s & Tĩnh)
       [KÍCH HOẠT HẠ DPR - Step Down]                                         [KÍCH HOẠT NÂNG DPR - Step Up]
       - Mobile:  1.0  ➔ 0.85 (giảm 35% fill-rate)                            - Mobile:  0.85 ➔ 1.0 (sắc nét)
       - Desktop: 1.5  ➔ 1.25 ➔ 1.0                                           - Desktop: 1.0  ➔ 1.25 ➔ 1.5
                 │                                                                     │
                 └──────────────────────────────────┬──────────────────────────────────┘
                                                    ▼
                             [Reset: degradedTimeRef = 0, optimalTimeRef = 0]
                                                    │
                                                    ▼
                                         [R3F setDpr(targetDpr)]
                                                    │
                                                    ▼
                                 [useTelemetryStore: updateMetrics({ dpr })]
```

---

### 2. PHÂN ĐỊNH TRỤC TƯƠNG HỖ: DPR SCALING VS GEOMETRY LOD (CẢI TIẾN I1, I2, I3)

#### 2.1 Mối quan hệ giữa DPR Scaling (45/55 FPS) và Geometry LOD (38/54 FPS) [I1]
Hai hệ thống can thiệp trên 2 trục thắt cổ chai hoàn toàn độc lập, không override lẫn nhau mà hoạt động tương hỗ theo 2 nấc thang phòng vệ:

| Tiêu Chí | Nấc 1: DPR Scaling (IMP-219) | Nấc 2: Geometry LOD (`perf_budget.ts`) |
| :--- | :--- | :--- |
| **Bản chất thắt nút** | **GPU Fill-Rate / Pixel Shading** | **GPU Vertex / Draw Calls / Geometry** |
| **Ngưỡng hạ cấp** | **FPS < 45** liên tục $\ge 1.500$ms | **FPS < 38** (chuyển sang `LOW` LOD) |
| **Ngưỡng phục hồi** | **FPS $\ge 55$** liên tục $\ge 3.000$ms | **FPS $\ge 54$** (chuyển sang `HIGH` LOD) |
| **Tác động thị giác** | Giảm độ phân giải bề mặt, **giữ nguyên hình học và ánh sáng** (Zero Pop) | Cắt giảm số hạt (72 ➔ 18), giảm kích thước bóng (1024 ➔ 256) |
| **Thứ tự can thiệp** | **Tuyến đầu**: Can thiệp ngay khi FPS chớm rớt dưới 45 để dập tắt nguy cơ giật hình. | **Phòng tuyến cuối**: Chỉ kích hoạt khi đã hạ DPR mà tải vẫn quá nặng rớt dưới 38 FPS. |
| **Thứ tự phục hồi** | Khi FPS hồi phục: Hệ thống nâng LOD lên `HIGH` trước (ở 54 FPS). Nếu máy tiếp tục ổn định $\ge 55$ FPS trong 3.0 giây, DPR mới nâng về cực đại. |

#### 2.2 Phòng vệ Tab Nền (`document.hidden`) [I2]
Trình duyệt web tự động điều tiết (throttle) xung nhịp CPU/GPU khi tab bị ẩn hoặc thu nhỏ xuống background, khiến FPS đo được tụt ảo xuống dưới 10-15 FPS. Guard:
```ts
// Bỏ qua tính toán khi tab chạy nền (Background Throttling Defense) để tránh hạ nhầm DPR do tụt FPS ảo
if (typeof document !== 'undefined' && document.hidden) return;
```
Bảo đảm chỉ điều phối độ phân giải khi người chơi đang thực sự nhìn thấy màn hình game.

#### 2.3 DPR Mặc định Frame đầu tiên [I3]
- **Mobile**: Khởi tạo với dải `[0.85, 1.0]`. Ở frame đầu tiên, R3F tính toán DPR mặc định là `1.0` (với `window.devicePixelRatio >= 1.0`).
- **Desktop**: Khởi tạo với dải `[1.0, 1.5]`. Ở frame đầu tiên, R3F tính toán DPR mặc định là $\min(1.5, \max(1.0, \text{window.devicePixelRatio}))$.
- `AdaptiveDprController` đọc giá trị pixel ratio thực tế này từ `gl.getPixelRatio()` ngay khi mount để đồng bộ Telemetry, bảo đảm không có độ trễ hay sai lệch.

---

### 3. KHẮC PHỤC 5 ĐIỂM CỨNG RUNTIME (C1 - C5)

1. **Khắc phục C1 (Xung đột dải DPR giữa `device_detect.ts` và R3F Canvas)**:
   - *Nguyên nhân*: `device_detect.ts` trả về `isMobile ? 1 : [1, 1.5]`. Khi truyền số vô hướng `1` vào `Canvas dpr={...}`, R3F clamp cứng dải DPR ở `[1, 1]`. Lệnh `setDpr(0.85)` bị R3F âm thầm ép ngược về `1.0`.
   - *Giải pháp*: Cập nhật `getRecommendedDpr` trong `device_detect.ts` trả về mảng biên `[0.85, 1.0]` cho Mobile và `[1.0, 1.5]` cho Desktop. R3F Canvas sẽ chấp nhận mọi giá trị `setDpr` trong dải hợp lệ này.
2. **Khắc phục C2 (Cô lập Singleton `perfBudget` trong Test Suite)**:
   - *Nguyên nhân*: Singleton global `perfBudget` tích lũy `frameTimes` qua các test case, gây ô nhiễm trạng thái chéo giữa các bài test.
   - *Giải pháp*: Thiết kế hàm tính toán `calculateAdaptiveDpr` dạng pure function (hoặc method của instance). Trong `adaptive_dpr_controller.test.ts`, mỗi test case khởi tạo một instance `new PerfBudgetController()` độc lập.
3. **Khắc phục C3 (Triệt tiêu Stale Closure trên `gl` và `setDpr`)**:
   - *Nguyên nhân*: Gọi `const { gl, setDpr } = useThree()` ở mức hook ngoài cùng sẽ capture tham chiếu tĩnh của context ban đầu. Khi WebGL context bị lost hoặc phục hồi, tham chiếu này bị stale.
   - *Giải pháp*: Trích xuất `gl` và `setDpr` trực tiếp từ tham số của `useFrame`: `useFrame(({ gl, setDpr }, delta) => { ... })`. R3F luôn cung cấp tham chiếu live mới nhất ở từng frame.
4. **Khắc phục C4 (Khởi tạo `initialDpr` từ WebGL Renderer thực tế)**:
   - *Nguyên nhân*: Hardcode `initialDpr = 1.5` trên desktop làm lệch chuẩn khi chạy trên màn hình tiêu chuẩn (DPR = 1.0) hoặc màn hình đã bị clamp.
   - *Giải pháp*: Trong `useEffect`, đọc trực tiếp `gl.getPixelRatio()` để gán vào `currentDprRef.current` và đẩy lên Telemetry.
5. **Khắc phục C5 (Bổ sung kiểm thử Reset bộ đếm Hysteresis)**:
   - *Nguyên nhân*: Thiếu test xác minh việc reset bộ đếm thời gian sau khi thay đổi DPR, dẫn đến nguy cơ dao động liên tục (oscillation thrashing).
   - *Giải pháp*: Thêm test case `[TC-DPR03.04/MSS]` kiểm tra nghiêm ngặt `degradedTimeRef` và `optimalTimeRef` được xóa về 0 ngay sau mỗi lần step-down hoặc step-up.

---

### 4. ĐO LƯỜNG NGÂN SÁCH LOC (PRE-CODING LOC BASELINE)

Đo lường tự động qua `scripts/check_loc.mjs` trước khi triển khai:

| Tệp Vật Lý | Phân Loại Tier | LOC Hiện Tại | Dự Kiến Delta | LOC Sau Khi Sửa | Đánh Giá Ngân Sách |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/device_detect.ts` | Tier 1 (Helper) | 58 | +4 | 62 | ✔️ An toàn (Trần <= 400) |
| `src/client/3d/perf_budget.ts` | Tier 2 (3D Logic) | 201 | +38 | 239 | ✔️ An toàn (Trần <= 500) |
| `src/client/telemetry/telemetry_types.ts` | Tier 1 (Types) | 82 | +2 | 84 | ✔️ An toàn (Trần <= 400) |
| `src/client/3d/adaptive_dpr_controller.tsx` | Tier 2 (New Module) | 0 | +85 | 85 | ✔️ An toàn (Trần <= 500) |
| `src/client/game_canvas.tsx` | Tier 2 (Canvas) | 447 | +2 | 449 | ✔️ An toàn (Trần <= 480) |
| `tests/client/adaptive_dpr_controller.test.ts` | Test Suite | 0 | +180 | 180 | ✔️ An toàn (Trần <= 600) |

> **LOC Safety Guard**: `game_canvas.tsx` (hiện tại 447 dòng) chỉ mount đúng 1 dòng component `<AdaptiveDprController isMobile={isMobileDevice} />`. Toàn bộ logic được đóng gói trong deep module mới `adaptive_dpr_controller.tsx` (85 dòng), bảo đảm không vi phạm trần 480 dòng của Tier 2.

---

### 5. MA TRẬN KIỂM THỬ HỢP ĐỒNG 5 MẶT (UNIVERSAL 5-FACET MATRIX - 17 ATOMIC TESTS)

Toàn bộ test case nằm trong [`tests/client/adaptive_dpr_controller.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/adaptive_dpr_controller.test.ts):

- **Facet 1: Boundary & Range Clamping (4 tests)**
  - `[TC-DPR01.01/MSS]` `getRecommendedDpr(true)` trả về `[0.85, 1.0]` cho Mobile (C1).
  - `[TC-DPR01.02/MSS]` `getRecommendedDpr(false)` trả về `[1.0, 1.5]` cho Desktop (C1).
  - `[TC-DPR01.03/MSS]` `calculateAdaptiveDpr` không bao giờ trả về DPR < 0.85 trên mobile hoặc > 1.5 trên desktop.
  - `[TC-DPR01.04/MSS]` DPR tính toán luôn làm tròn đến 2 chữ số thập phân (`0.85`, `1.0`, `1.25`, `1.5`).

- **Facet 2: State Reactivity & Step-Down (4 tests - Fresh Instance C2)**
  - `[TC-DPR02.01/MSS]` Khi FPS < 45 duy trì >= 1.500ms trên mobile, DPR hạ từ 1.0 xuống 0.85.
  - `[TC-DPR02.02/MSS]` Khi FPS < 45 duy trì >= 1.500ms trên desktop, DPR hạ từ 1.5 xuống 1.25.
  - `[TC-DPR02.03/MSS]` Khi FPS < 35 duy trì >= 1.500ms trên desktop (tải nặng), DPR hạ tiếp từ 1.25 xuống 1.0.
  - `[TC-DPR02.04/MSS]` `PerfBudgetReport` phản ánh đúng trạng thái DPR khuyến nghị.

- **Facet 3: Hysteresis, Anti-Jitter & Reset Verification (4 tests - Bổ sung C5)**
  - `[TC-DPR03.01/MSS]` Khi FPS tụt xuống 40 nhưng chỉ kéo dài 500ms rồi phục hồi, DPR KHÔNG đổi.
  - `[TC-DPR03.02/MSS]` Khi DPR đang ở mức thấp và FPS phục hồi >= 55, DPR chỉ nâng sau đủ 3.000ms.
  - `[TC-DPR03.03/MSS]` Không có hiện tượng dao động DPR liên tiếp giữa các frame (Zero Thrashing).
  - `[TC-DPR03.04/MSS]` **[C5 Check]** Sau khi thực thi `STEP_DOWN` hoặc `STEP_UP`, các bộ đếm `degradedTimeRef` và `optimalTimeRef` được reset hoàn toàn về 0 để ngăn chặn oscillation tức thì.

- **Facet 4: Motion Lockout Defense (3 tests)**
  - `[TC-DPR04.01/MSS]` Khi quân cờ đang nhảy (`activePawnAnimation.isAnimating = true`), khóa nâng DPR (Freeze Step-Up).
  - `[TC-DPR04.02/MSS]` Khi quân cờ đang nhảy nhưng FPS bị tụt nặng (< 45 kéo dài), VẪN CHO PHÉP hạ DPR để tránh giật hình.
  - `[TC-DPR04.03/MSS]` Khi hoạt ảnh di chuyển kết thúc, bộ đếm thời gian nâng DPR được tái kích hoạt.

- **Facet 5: Telemetry Observability & Live Context Sync (2 tests - C3, C4)**
  - `[TC-DPR05.01/MSS]` Thay đổi DPR lập tức đồng bộ lên `useTelemetryStore.getState().metrics.dpr`.
  - `[TC-DPR05.02/MSS]` Controller đọc chính xác `initialDpr` từ `gl.getPixelRatio()` (C4) và fallback an toàn khi context lost.

---

### 6. DROP-IN CODE SNIPPETS CỤ THỂ

#### Snippet 1: [`src/client/3d/device_detect.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/device_detect.ts) (Khắc phục C1)

```ts
// Thay thế hàm getRecommendedDpr tại L48-L50:
export function getRecommendedDpr(isMobile: boolean): [number, number] {
  return isMobile ? [0.85, 1.0] : [1.0, 1.5];
}
```

---

#### Snippet 2: [`src/client/telemetry/telemetry_types.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/telemetry/telemetry_types.ts)

Thêm `dpr` vào `TelemetryMetric`:
```ts
export interface TelemetryMetric {
  readonly fps: number;
  readonly frameTimeMs: number;
  readonly drawCalls: number;
  readonly triangles: number;
  readonly pingRttMs: number;
  readonly deltaBytes: number;
  readonly tickRate: number;
  readonly dpr?: number;
}
```

---

#### Snippet 3: [`src/client/3d/perf_budget.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/perf_budget.ts) (Khắc phục C2)

Mở rộng `PerfBudgetController` với pure calculation và giới hạn biên:
```ts
export const DPR_BOUNDS = {
  MOBILE_MIN: 0.85,
  MOBILE_MAX: 1.0,
  DESKTOP_MIN: 1.0,
  DESKTOP_MAX: 1.5,
  STEP_DOWN_DELAY_MS: 1500,
  STEP_UP_DELAY_MS: 3000,
  FPS_DOWN_THRESHOLD: 45,
  FPS_UP_THRESHOLD: 55,
} as const;

export interface AdaptiveDprParams {
  readonly isMobile: boolean;
  readonly currentFps: number;
  readonly currentDpr: number;
  readonly isMotionActive?: boolean;
  readonly degradedDurationMs: number;
  readonly optimalDurationMs: number;
}

export interface AdaptiveDprResult {
  readonly targetDpr: number;
  readonly shouldUpdate: boolean;
  readonly reason: 'MAINTAIN' | 'STEP_DOWN' | 'STEP_UP';
}

// Bổ sung method thuần túy vào class PerfBudgetController (Fresh instance testable - C2):
public calculateAdaptiveDpr(params: AdaptiveDprParams): AdaptiveDprResult {
  const {
    isMobile,
    currentFps,
    currentDpr,
    isMotionActive = false,
    degradedDurationMs,
    optimalDurationMs,
  } = params;

  const minDpr = isMobile ? DPR_BOUNDS.MOBILE_MIN : DPR_BOUNDS.DESKTOP_MIN;
  const maxDpr = isMobile ? DPR_BOUNDS.MOBILE_MAX : DPR_BOUNDS.DESKTOP_MAX;

  // Trường hợp cần hạ DPR (FPS thấp kéo dài)
  if (currentFps < DPR_BOUNDS.FPS_DOWN_THRESHOLD && currentDpr > minDpr) {
    if (degradedDurationMs >= DPR_BOUNDS.STEP_DOWN_DELAY_MS) {
      const nextDpr = isMobile ? DPR_BOUNDS.MOBILE_MIN : Math.max(minDpr, Number((currentDpr - 0.25).toFixed(2)));
      return { targetDpr: nextDpr, shouldUpdate: true, reason: 'STEP_DOWN' };
    }
  }

  // Trường hợp có thể nâng DPR (FPS cao kéo dài và không có hoạt ảnh chuyển động)
  if (currentFps >= DPR_BOUNDS.FPS_UP_THRESHOLD && currentDpr < maxDpr && !isMotionActive) {
    if (optimalDurationMs >= DPR_BOUNDS.STEP_UP_DELAY_MS) {
      const nextDpr = isMobile ? DPR_BOUNDS.MOBILE_MAX : Math.min(maxDpr, Number((currentDpr + 0.25).toFixed(2)));
      return { targetDpr: nextDpr, shouldUpdate: true, reason: 'STEP_UP' };
    }
  }

  return { targetDpr: currentDpr, shouldUpdate: false, reason: 'MAINTAIN' };
}
```

---

#### Snippet 4: [`src/client/3d/adaptive_dpr_controller.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/adaptive_dpr_controller.tsx) (Khắc phục C3, C4, C5, I2)

Deep module điều phối DPR không gây stale closure:
```tsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { perfBudget, DPR_BOUNDS } from './perf_budget';
import { useTelemetryStore } from '../telemetry/telemetry_store';
import { useGameStore } from '../store/game_store';

export interface AdaptiveDprControllerProps {
  readonly isMobile: boolean;
}

export function AdaptiveDprController({ isMobile }: AdaptiveDprControllerProps): null {
  const currentDprRef = useRef<number>(isMobile ? DPR_BOUNDS.MOBILE_MAX : 1.0);
  const degradedTimeRef = useRef<number>(0);
  const optimalTimeRef = useRef<number>(0);

  // [C3 & C4] Trích xuất live renderer và live setDpr từ useFrame, khởi tạo initialDpr từ gl.getPixelRatio()
  useFrame(({ gl, setDpr }, delta) => {
    // [I2] Guard chống tụt FPS ảo khi tab trình duyệt chạy nền
    if (typeof document !== 'undefined' && document.hidden) return;

    // Đọc chính xác DPR ban đầu từ WebGL Renderer nếu chưa thiết lập
    if (currentDprRef.current === (isMobile ? DPR_BOUNDS.MOBILE_MAX : 1.0) && gl && typeof gl.getPixelRatio === 'function') {
      const actualDpr = Number(gl.getPixelRatio().toFixed(2));
      if (actualDpr !== currentDprRef.current) {
        currentDprRef.current = actualDpr;
        useTelemetryStore.getState().updateMetrics({ dpr: actualDpr });
      }
    }

    const deltaMs = delta * 1000;
    const avgFps = perfBudget.getAverageFps();
    const isPawnAnimating = Boolean(useGameStore.getState().activePawnAnimation?.isAnimating);

    if (avgFps < DPR_BOUNDS.FPS_DOWN_THRESHOLD) {
      degradedTimeRef.current += deltaMs;
      optimalTimeRef.current = 0;
    } else if (avgFps >= DPR_BOUNDS.FPS_UP_THRESHOLD) {
      optimalTimeRef.current += deltaMs;
      degradedTimeRef.current = 0;
    } else {
      degradedTimeRef.current = 0;
      optimalTimeRef.current = 0;
    }

    const result = perfBudget.calculateAdaptiveDpr({
      isMobile,
      currentFps: avgFps,
      currentDpr: currentDprRef.current,
      isMotionActive: isPawnAnimating,
      degradedDurationMs: degradedTimeRef.current,
      optimalDurationMs: optimalTimeRef.current,
    });

    if (result.shouldUpdate && typeof setDpr === 'function') {
      setDpr(result.targetDpr);
      currentDprRef.current = result.targetDpr;
      // [C5] Reset triệt để cả 2 bộ đếm sau step-change để ngăn chặn rung giật (anti-oscillation)
      degradedTimeRef.current = 0;
      optimalTimeRef.current = 0;
      useTelemetryStore.getState().updateMetrics({ dpr: result.targetDpr });
    }
  });

  return null;
}
```

---

#### Snippet 5: [`src/client/game_canvas.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/game_canvas.tsx) (Tích hợp 1 dòng duy nhất)

```tsx
// Thêm import tại đầu file:
import { AdaptiveDprController } from './3d/adaptive_dpr_controller';

// Bên trong <Canvas ...>:
<AdaptiveDprController isMobile={isMobileDevice} />
```

---

### 7. QUY TRÌNH 3 TRẠM TỰ HÀNH (3-STATION PIPELINE)

1. **Station 1 (RED Contract Test)**: `qa-tester` tạo file `tests/client/adaptive_dpr_controller.test.ts` chứa 17 atomic tests theo đúng ma trận Universal 5-Facet (Facet 1 đến Facet 5), kiểm tra đầy đủ C1-C5. Chứng minh Business RED trước khi triển khai code sản xuất. Cấm chạm vào `src/**`.
2. **Station 2 (GREEN Implementation)**: `implementer` áp dụng 5 snippets trên đĩa để đưa toàn bộ 17 tests về GREEN.
3. **Station 2.5 (Sweeping Scout Audit)**: `scout` quét vật lý 100% các tệp đã sửa trên đĩa đối soát 5 nhóm lỗi (Stale state, unhandled async, memory leak, dirty casts, dead code) và kiểm tra trần LOC.
4. **Station 3 (Independent Review)**: Các reviewers độc lập (`spec-reviewer`, `code-reviewer`) thẩm định vật lý đĩa và bằng chứng snapshot tại `.agents/evidence/` để đưa ra phán quyết sign-off.
