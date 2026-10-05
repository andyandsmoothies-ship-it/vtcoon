# KẾ HOẠCH TRIỂN KHAI (IMPLEMENTATION PLAN)
# IMP-266: TRIỆT TIÊU TOÀN DIỆN NỢ KỸ THUẬT, LỖ HỔNG PHẢN ỨNG, NGHỊCH LÝ THỊ GIÁC VÀ KHUYẾT TẬT KIỂM THỬ

> **Mã Ticket:** IMP-266  
> **Tiêu đề:** Holistic Remediation of Technical Debt, Reactivity Blindspots, Visual Paradoxes & Testing Defects  
> **Phiên bản:** Revision 8 (Tái Cấu Trúc Toàn Diện Theo 5 Điểm Phản Biện Kiến Trúc Của Người Dùng)  
> **Phân loại:** Tier 2 (Full Rigor - Test Infrastructure, Reactivity Hooks, 3D Aesthetics & Standalone Tooling Helper)  
> **Tài liệu tham chiếu:** `docs/domain/gotchas/3d_cinematics.md` · `scripts/check_evidence.mjs` · `GEMINI.md` Hard Constraints  
> **Trạng thái:** DRAFTING REVISED / SẴN SÀNG KIỂM ĐỊNH HAI GIAI ĐOẠN  

---

## 0. BẢNG ĐỐI SOÁT 5 ĐIỂM PHẢN BIỆN KIẾN TRÚC CỦA NGƯỜI DÙNG & CHỈ THỊ HỆ THỐNG

| Mã Chỉ Thị | Lĩnh Vực | Tệp Tin Ảnh Hưởng | Vấn Đề Kỹ Thuật Được Người Dùng Chỉ Ra | Giải Pháp Triệt Để Trong Revision 8 |
| :--- | :--- | :--- | :--- | :--- |
| **USER-ARCH-01** | Xung đột kiến trúc / Split-Brain Timers | `src/client/3d/perf_budget.ts` & `adaptive_dpr_controller.tsx` | Tạo thêm 2 biến `degradedDurationMs` & `optimalDurationMs` trong `PerfBudgetController` gây phân đôi trạng thái với `AdaptiveDprController` (vốn tự đếm và tự reset khi đổi DPR). Tốn 3.600 phép tính/giây duyệt mảng FPS mỗi frame. | **Hủy bỏ hoàn toàn** việc tạo timer trong `PerfBudgetController`. Khẳng định `AdaptiveDprController` là SSOT duy nhất điều khiển thời gian thực và DPR. `PerfBudgetController` chỉ giữ vai trò tính toán thuần túy. |
| **USER-ARCH-02** | Lắng nghe kép & Re-render xung đột | `src/client/game_canvas.tsx` & `main.tsx` | `GameCanvas` gọi `useIsMobile()` tạo thêm 1 cặp listener `resize`/`orientationchange`. Khi xoay màn hình, cả cha lẫn con cùng `setState`, gây re-render kép (cascade re-render) làm giật 3D. | Áp dụng triệt để nguyên tắc **Explicit Environmental Prop Propagation**: `useIsMobile()` chỉ gọi tại gốc `main.tsx`. `GameCanvas` chỉ nhận prop `isMobile?: boolean`, tuyệt đối không gọi hook nội bộ. |
| **USER-ARCH-03** | Trung thực ngân sách LOC | `src/client/3d/perf_budget.ts` (Section 4) | Tệp thuộc Tier 1 chạm ngưỡng cảnh báo 300 LOC nhưng bảng lại dán nhãn `✔️ Safe`, vi phạm quy tắc Honest LOC Accounting trong `GEMINI.md`. | Đổi trạng thái `perf_budget.ts` thành **`⚠️ Warning (300 LOC)`** và đăng ký mục Tech Debt `DEBT-PERF-BUDGET-SUBMODULE` trong Epic Ledger. |
| **USER-ARCH-04** | Ca test meta bị cấm | Section 3 (`TC-266.13`) | Ca test kiểm tra xem file test khác có chạy xanh 18/18 hay không là dạng Static Checklist Test / Meta Change Detector bị cấm tuyệt đối bởi Hiến pháp. | **Xóa bỏ hoàn toàn `TC-266.13` meta**. Thay thế bằng kiểm chứng hợp đồng hành vi vật lý: unmount hải âu trên mobile (`seagullsPropNode === null`) và render đủ đàn trên desktop. |
| **USER-ARCH-05** | Phá vỡ SRP & Ghép tạp script CLI | `scripts/check_evidence.mjs` & Section 1.1 | Biến script CLI chốt chặn toàn repo thành module cho unit test import bằng cờ `isDirectExecution` làm phình to script, sai nguyên tắc đơn nhiệm; thiếu chính sách kích hoạt camera rõ ràng. | **Tách riêng helper** `scripts/helpers/camera_telemetry_validator.mjs`. `check_evidence.mjs` chỉ import trong 3 dòng. Định nghĩa chính sách kích hoạt rõ ràng: bắt buộc cho 3D Camera tickets, miễn trừ cho 2D/Logic. |
| **USER-01** | Kiến trúc / Anti-TIDD | `src/client/types/global.d.ts` | Khai báo `interface Object` cấy 4 thuộc tính `any` làm ô nhiễm prototype toàn dự án. | Xóa bỏ 100% `interface Object` khỏi `global.d.ts`. Trích xuất helper type-safe `TestReactElement<P>` sang `tests/helpers/threejs_test_utils.ts`. |
| **USER-03** | Nghịch lý mỹ thuật 3D | `coastal_seagulls.tsx`, `coastal_patrol_boat.tsx`, `diorama_harbor_cruiser.tsx` | 5 chim hải âu (25 meshes) đứng yên giữa trời như tiêu bản; ca-nô và du thuyền đỗ tĩnh nhưng bọt rẽ sóng `wake` vẫn xả trắng xóa. | Ẩn hoàn toàn hải âu trên mobile (`{!isMobile && <CoastalSeagulls />}`); ẩn toàn bộ các mesh bọt sóng `wake` khi `isMobile` là true. |
| **USER-05** | Khuyết tật kiểm thử | `tests/client/imp265_dual_platform_mobile_lod.test.ts` | TC-265.13 và TC-265.15 dùng `Reflect.get` soi biến private `maxSamples` và `frameIndex`. | Xóa bỏ toàn bộ `Reflect.get`. Chứng minh vòng đệm tròn và `reset()` bằng khẳng định hành vi công khai (Behavioral Assertion). |
| **GRILL-SPEC** | Hồi quy tiến hóa đặc tả | `imp265_dual_platform_mobile_lod.test.ts` (L219) | USER-03 ẩn hải âu trên mobile khiến `TC-265.09` gãy vì vẫn mong đợi `seagullsPropNode`. | Điều chỉnh `TC-265.09`: kiểm chứng `seagullsPropNode === null` trên mobile, render đủ đàn trên desktop. |
| **GRILL-TDZ** | Runtime TDZ | `scripts/check_evidence.mjs` | `ticketNum` và `matchesTicket` được gọi tại Mục 3.5 trước khi khai báo ở Mục 4. | Hoist toàn bộ khai báo `ticketRaw`, `ticketClean`, `ticketNum` và `matchesTicket` lên đầu file trước Mục 1. |
| **ADV-02** | False-Positive Bounds | `scripts/helpers/camera_telemetry_validator.mjs` | Camera Orthographic (`fov: null`) và controls unmounted (`pitchDeg: null`, `target: null`) bị chặn oan. | Kiểm tra dải `fov` và `pitchDeg` có điều kiện an toàn null, chấp nhận camera trực giao và góc quay tự do. |
| **ADV-03** | AST Array Fragment | `tests/helpers/threejs_test_utils.ts` | Component trả về mảng phần tử khiến `React.isValidElement(root)` trả về false và ngắt tìm kiếm. | Thêm nhánh `if (Array.isArray(root))` đệ quy duyệt mảng trong `findReactNode`/`findReactNodes`. |

---

## 1. KHẢO SÁT THỰC ĐỊA & TOÀN DIỆN BỀ MẶT MÃ NGUỒN (SURFACE AREA EXHAUSTION)

### 1.1. Danh Sách Điểm Gọi & Tệp Tin Bị Ảnh Hưởng (100% Call-Site Inventory)

| Tệp Tin Vật Lý | Tọa Độ Dòng | Phân Loại | Lý Do Kỹ Thuật & Hành Động Cụ Thể |
| :--- | :---: | :---: | :--- |
| `src/client/types/global.d.ts` | L24-L29 | **Modify** | Xóa bỏ monkey-patch `interface Object` (4 trường `any`), triệt tiêu vi phạm Anti-TIDD (USER-01). |
| `tests/helpers/threejs_test_utils.ts` | Mới (L1-L90) | **Create** | Chuẩn hóa các hàm `captureTree`, `findReactNode`, `findReactNodes`, `getNodeType`, `getNodeProps` hỗ trợ Array root và React 19 types. |
| `src/client/hooks/use_is_mobile.ts` | Mới (L1-L35) | **Create** | Hook phản ứng động `useIsMobile()` lắng nghe sự kiện `resize` và `orientationchange` (USER-02). |
| `src/client/main.tsx` | L25, L214 | **Modify** | Khởi tạo duy nhất `const isMobile = useIsMobile();` tại gốc và truyền cờ động xuống `<GameCanvas isMobile={isMobile} />` (USER-02, USER-ARCH-02). |
| `src/client/game_canvas.tsx` | L113 | **Keep / Waive** | Giữ nguyên nhận prop `isMobile?: boolean`, không gọi hook nội bộ; giữ fallback tĩnh `isMobileHardware()` cho test độc lập (USER-ARCH-02). |
| `src/client/3d/coastal_island_environment.tsx` | L228 | **Modify** | Ẩn hoàn toàn hải âu trên mobile: `{!isMobile && <CoastalSeagulls />}` (USER-03). |
| `src/client/3d/coastal_seagulls.tsx` | L23-L24 | **Modify** | Trả về `null` ngay lập tức khi `isMobile: true` để dọn sạch 25 meshes khỏi scene graph (USER-03). |
| `src/client/3d/coastal_patrol_boat.tsx` | L124-L144 | **Modify** | Ẩn 2 mặt phẳng bọt sóng `wakeLeftRef` và `wakeRightRef` khi `isMobile: true` (USER-03). |
| `src/client/3d/diorama/diorama_harbor_cruiser.tsx` | L60-L63 | **Modify** | Ẩn mặt phẳng bọt sóng `wakeRef` khi `isMobile: true` (USER-03). |
| `src/client/3d/perf_budget.ts` | L236-L242 | **Modify** | Loại bỏ hardcode `degradedDurationMs: 1500` trong `getBudgetReport()`; không tạo timer trùng lặp (USER-ARCH-01). |
| `tests/client/imp265_dual_platform_mobile_lod.test.ts` | L62-L95, L219, L325, L340 | **Modify** | Điều chỉnh `TC-265.09` theo đặc tả USER-03 (GRILL-SPEC); xóa bỏ `Reflect.get` (USER-05); import helper dùng chung (USER-01). |
| `scripts/helpers/camera_telemetry_validator.mjs` | Mới (L1-L75) | **Create** | Module thuần túy xuất khẩu `validateCameraTelemetryData` và `isCameraTelemetryRequired` (USER-ARCH-05). |
| `scripts/check_evidence.mjs` | L18, L70, L208 | **Modify** | Hoist ticket parsing giải quyết runtime TDZ; import helper kiểm tra camera; tích hợp chính sách kích hoạt rõ ràng (USER-ARCH-05). |
| `tests/scripts/check_evidence_camera_telemetry.test.ts` | Mới (L1-L100) | **Create** | Bộ test hợp đồng cho `camera_telemetry_validator.mjs`. |

---

## 2. KIẾN TRÚC SÂU & CHI TIẾT CÁC TÁC VỤ (DEEP ARCHITECTURE & LEAN TASKS)

```
[Nhánh 1: Type Cleanliness & Test Helper (USER-01)]
src/client/types/global.d.ts  ──(Xóa interface Object)──> Sạch 100% không còn 'any'
                                                               │
tests/helpers/threejs_test_utils.ts (Mới) <───────────────────┘
   ├── TestReactElement<P>: ReactElement & { readonly props: P & Record<string, unknown> }
   ├── captureTree<P>(Component, props?): TestReactElement<P> | null
   ├── findReactNode<P>(root, predicate): Hỗ trợ mảng gốc (ADV-03)
   ├── findReactNodes<P>(root, predicate): Thu thập toàn bộ nút thỏa mãn trên mảng hoặc cây
   ├── getNodeProps<P>(node): Partial<P>
   └── getNodeType(node): Trả về thẻ chuỗi hoặc fallback || 'Component' cho hàm ẩn danh

[Nhánh 2: Explicit Environmental Prop Propagation (USER-02, USER-ARCH-02)]
window (resize / orientationchange) ──> useIsMobile() [Chỉ gọi tại main.tsx]
                                              │
                                              ▼ (Prop isMobile)
                                          GameCanvas (Không gọi hook nội bộ, 0 re-render kép)
                                              │
                                              ▼
                                         3D Scene Graph

[Nhánh 3: Visual Polish & Unmount Foam/Birds (USER-03)]
Mobile (isMobile: true)
   ├── CoastalIslandEnvironment ──> {!isMobile && <CoastalSeagulls />} (Tiết kiệm 25 meshes)
   ├── CoastalPatrolBoat ──> {!isMobile && <group>...wake foam...</group>} (Mặt nước phẳng lặng)
   └── DioramaHarborCruiser ──> {!isMobile && <mesh ref={wakeRef} ... />} (Mặt nước phẳng lặng)

[Nhánh 4: DPR SSOT Architecture (USER-ARCH-01)]
AdaptiveDprController (SSOT duy nhất chạy trong useFrame, tích lũy real-time và reset khi setDpr)
   │
   └── Gọi: perfBudget.calculateAdaptiveDpr(params) [Hàm thuần tính toán, 0 timer nội bộ]

[Nhánh 5: Behavioral Tests & Standalone Telemetry Helper (USER-05, USER-ARCH-04, USER-ARCH-05)]
imp265 test: Xóa Reflect.get ──> Khẳng định hành vi nạp 61 mẫu xoay vòng & reset()
scripts/helpers/camera_telemetry_validator.mjs (Mới) ──> Pure validator & Activation policy
scripts/check_evidence.mjs ──> Import 3 dòng từ helper, giữ nguyên tính đơn nhiệm CLI
```

### Task 1: Chuẩn Hóa Helper Duyệt Cây AST 3D React 19 & Làm Sạch Global Types (USER-01)

- **Target physical file**: `tests/helpers/threejs_test_utils.ts` (mới)  
  Xây dựng module helper kiểm thử React 19 AST độc lập:
  - `TestReactElement<P>`: Interface mở rộng `React.ReactElement` với `readonly props: P & Record<string, unknown>`.
  - `captureTree<P>(Component, props?)`: Render component vào JSX tĩnh qua `renderToStaticMarkup` và bắt giữ `ReactElement` gốc.
  - `findReactNode<P>(root, predicate)` & `findReactNodes<P>(root, predicate)`: Duyệt đệ quy cây JSX hỗ trợ mảng gốc (Array fragments - ADV-03), component con và `React.Children`.
  - `getNodeType(node)`: Trả về chuỗi thẻ hoặc tên component với fallback `'Component'`.
  - `getNodeProps<P>(node)`: Trích xuất props an toàn.
- **Target physical file**: `src/client/types/global.d.ts`  
  Xóa bỏ hoàn toàn khai báo `interface Object` (dòng 24-29) chứa 4 thuộc tính `any` (`frames`, `isMobile`, `position`, `scale`).

```typescript
<<<<
  interface Object {
    readonly frames?: any;
    readonly isMobile?: any;
    readonly position?: any;
    readonly scale?: any;
  }
}
====
}
>>>>
```

### Task 2: Reactivity Hook `useIsMobile()` & Explicit Environmental Prop Propagation (USER-02, USER-ARCH-02)

- **Target physical file**: `src/client/hooks/use_is_mobile.ts` (mới - specification)

```typescript
import { useState, useEffect } from 'react';
import { isMobileDevice } from '../3d/device_detect';

/**
 * Reactive hook that tracks device and viewport changes (resize & orientationchange).
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => isMobileDevice());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setIsMobile(isMobileDevice());
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return isMobile;
}
```

- **Target physical file**: `src/client/main.tsx`  
  Import `useIsMobile` từ `./hooks/use_is_mobile`. Trong `App()`, khởi tạo `const isMobile = useIsMobile();` và truyền xuống `<GameCanvas isLobby={!gameStarted} players={effectivePlayers} isMobile={isMobile} />`.
- **Target physical file**: `src/client/game_canvas.tsx` (USER-ARCH-02)  
  Tuân thủ nghiêm ngặt quy tắc Explicit Environmental Prop Propagation: **Không gọi hook `useIsMobile()` bên trong `GameCanvas`**. Giữ nguyên signature hiện tại `isMobile: propIsMobile` và fallback tĩnh `propIsMobile ?? isMobileHardware()` chỉ phục vụ cho các test runner cô lập.

### Task 3: 3D Visual Polish - Unmount Seagulls & Water Wakes on Mobile (USER-03)

- **Target physical file**: `src/client/3d/coastal_island_environment.tsx`  
  Bảo vệ render `<CoastalSeagulls />` bằng điều kiện `{!isMobile && <CoastalSeagulls />}` (dòng 228).
- **Target physical file**: `src/client/3d/coastal_seagulls.tsx`  
  Short-circuit return `null` ở đầu component khi `isMobile` là true để dọn sạch 25 meshes khỏi scene graph:

```tsx
<<<<
export function CoastalSeagulls({ isMobile = false }: { readonly isMobile?: boolean } = {}): React.ReactElement {
  const birdsRef = useRef<(Group | null)[]>([]);
====
export function CoastalSeagulls({ isMobile = false }: { readonly isMobile?: boolean } = {}): React.ReactElement | null {
  if (isMobile) return null;
  const birdsRef = useRef<(Group | null)[]>([]);
>>>>
```

- **Target physical file**: `src/client/3d/coastal_patrol_boat.tsx`  
  Bao bọc cụm `<group position={[0, -0.01, -0.8]}>` chứa 2 mesh bọt sóng `wakeLeftRef` và `wakeRightRef` bằng điều kiện `{!isMobile && (...) }`.
- **Target physical file**: `src/client/3d/diorama/diorama_harbor_cruiser.tsx`  
  Bao bọc `<mesh ref={wakeRef} ... />` bằng điều kiện `{!isMobile && (...) }`.

### Task 4: Triệt Tiêu Split-Brain Timer & Xác Định DPR SSOT (USER-ARCH-01)

- **Nguyên lý kiến trúc:**  
  `AdaptiveDprController` (`src/client/3d/adaptive_dpr_controller.tsx`) là thực thể duy nhất làm chủ thời gian thực (`degradedTimeRef`, `optimalTimeRef`) và gọi `gl.setDpr`.  
  `PerfBudgetController` (`src/client/3d/perf_budget.ts`) là pure calculator, **tuyệt đối không duy trì timer nội bộ song song**, triệt tiêu nguy cơ trôi lệch pha và lãng phí chu kỳ tính toán 3.600 ops/s.
- **Target physical file**: `src/client/3d/perf_budget.ts`  
  Trong `getBudgetReport()`: Loại bỏ hardcode `degradedDurationMs: 1500`. Nhận thời gian tùy chọn từ `deviceContext?.degradedDurationMs ?? 0` và `deviceContext?.optimalDurationMs ?? 0`.

```typescript
<<<<
    const dprEval = this.calculateAdaptiveDpr({
      isMobile,
      currentFps: avgFps,
      currentDpr,
      degradedDurationMs: 1500,
      optimalDurationMs: 0,
    });
====
    const dprEval = this.calculateAdaptiveDpr({
      isMobile,
      currentFps: avgFps,
      currentDpr,
      degradedDurationMs: deviceContext?.degradedDurationMs ?? 0,
      optimalDurationMs: deviceContext?.optimalDurationMs ?? 0,
    });
>>>>
```

### Task 5: Làm Sạch Bài Test Khỏi Reflect.get & Reconcile TC-265.09 (USER-05, GRILL-SPEC, USER-ARCH-04)

- **Target physical file**: `tests/client/imp265_dual_platform_mobile_lod.test.ts`  
  - Thay thế định nghĩa cục bộ của `captureTree` và `findReactNode` bằng lệnh import từ `../helpers/threejs_test_utils`.
  - **Reconcile TC-265.09 (GRILL-SPEC)**: Khẳng định trên mobile `{ isMobile: true }`: `seagullsPropNode === null` và `CoastalSeagulls({ isMobile: true }) === null`; khẳng định trên desktop `{ isMobile: false }`: `seagullsPropNode !== null` và kết xuất đầy đủ đàn chim 5 con.
  - TC-265.13: Xóa `Reflect.get(controller, 'maxSamples')`, nạp thêm mẫu thứ 61 và kiểm tra `getAverageFps()` giữ nguyên giá trị 30.
  - TC-265.15: Xóa `Reflect.get(controller, 'frameIndex')`, gọi `reset()`, nạp mẫu 1 frame 20ms và kiểm tra FPS cập nhật ngay về 50.

### Task 6: Trích Xuất Helper Kiểm Tra Telemetry Camera & Tích Hợp Chính Sách Rõ Ràng (USER-ARCH-05, GRILL-TDZ, ADV-02)

- **Target physical file**: `scripts/helpers/camera_telemetry_validator.mjs` (mới)  
  Xây dựng module kiểm tra telemetry độc lập:
  - `validateCameraTelemetryData(tData, fileName)`: Kiểm tra các ngưỡng an toàn:
    - `elevationY > 0.5` (finite number, camera không chui xuống đất).
    - `pitchDeg`: nếu có giá trị (khác null), phải nằm trong khoảng 15.0° - 85.0° (ADV-02).
    - `fov`: đối với camera phối cảnh (Perspective), phải nằm trong khoảng 15.0° - 85.0° (ADV-02 chấp nhận camera Orthographic `fov: null`).
    - `position` & `target`: mảng 3 phần tử finite numbers (ADV-02 chấp nhận `target: null` khi controls unmounted).
  - `isCameraTelemetryRequired(evidence, ticketName)`:
    - Trả về `true` khi ticket thuộc nhóm 3D Canvas / Camera (nhận diện qua `evidence.cameraReview === true` hoặc tên ticket/test có chứa từ khóa: `3d_canvas`, `camera`, `street_chase`, `diorama_3d`).
    - Trả về `false` (miễn trừ tự động) cho các ticket 2D UI thuần túy (HUD, Modals, Cards, PreMatchDeck) hoặc domain logic thuần túy (FSM, economy, bot).
- **Target physical file**: `scripts/check_evidence.mjs`  
  - Hoist `ticketRaw`, `ticketClean`, `ticketNum` và hàm `matchesTicket` lên đầu file trước Mục 1 để khắc phục runtime TDZ (GRILL-TDZ).
  - Import `validateCameraTelemetryData` và `isCameraTelemetryRequired` từ `./helpers/camera_telemetry_validator.mjs` (3 dòng code, bảo đảm nguyên tắc SRP).
  - Áp dụng chính sách kiểm tra: Nếu `isCameraTelemetryRequired` trả về `true` mà không có file telemetry trong `.agents/evidence/`, báo lỗi `[Camera Telemetry Missing]`. Nếu file telemetry tồn tại, chạy qua `validateCameraTelemetryData`.
- **Target physical file**: `tests/scripts/check_evidence_camera_telemetry.test.ts` (mới)  
  Kiểm thử trực tiếp `scripts/helpers/camera_telemetry_validator.mjs` cho các trường hợp: Overview camera, Semi-cinematic camera, Orthographic camera, các vi phạm độ cao/góc quay/FOV/tọa độ, và kiểm thử chính sách kích hoạt (`isCameraTelemetryRequired`).

---

## 3. MA TRẬN TEST HỢP ĐỒNG TRẠM 1 (STATION 1 CONTRACT TEST SPECIFICATIONS)

> **Các bộ test hợp đồng:**  
> - `tests/helpers/threejs_test_utils.test.ts` (Nhánh AST Helper & Anti-TIDD)  
> - `tests/client/use_is_mobile.test.ts` (Nhánh Reactivity Hook)  
> - `tests/scripts/check_evidence_camera_telemetry.test.ts` (Nhánh Telemetry Camera Gate)  
> - `tests/client/imp265_dual_platform_mobile_lod.test.ts` (Bộ test hồi quy 18 ca)  

### Nhánh 1: Cây AST React 19 & Chuẩn Hóa Helper (`threejs_test_utils.test.ts`)
- TC-266.01 [UC-IMP266/MSS]: `captureTree` kết xuất component trong giai đoạn render thuần mà không gắn kết Three.js DOM thật, bắt giữ nút gốc ReactElement.
- TC-266.02 [UC-IMP266/MSS]: `findReactNode` tìm thấy nút con cấp 1 khớp với predicate typed TestReactElement.
- TC-266.03 [UC-IMP266/MSS]: `findReactNode` đệ quy qua các component lồng nhau và Fragment để tìm chính xác nút mục tiêu.
- TC-266.04 [UC-IMP266/MSS]: `findReactNodes` thu thập toàn bộ các nút thỏa mãn điều kiện lọc trên toàn bộ cây hoặc mảng phần tử gốc.
- TC-266.05 [UC-IMP266/MSS]: `getNodeType` trả về chuỗi thẻ nguyên bản cho phần tử JSX hoặc tên component với fallback Component cho hàm ẩn danh.
- TC-266.06 [UC-IMP266/A1]: `findReactNode` trả về null khi không tìm thấy nút mục tiêu trong cây.
- TC-266.07 [UC-IMP266/A2]: `findReactNode` xử lý an toàn với các nút con là null, undefined, boolean hoặc chuỗi văn bản thuần túy.
- TC-266.08 [UC-IMP266/A3]: `getNodeProps` trích xuất props với kiểu dữ liệu định sẵn hoặc trả về đối tượng rỗng khi nút là null.
- TC-266.09 [UC-IMP266/A4]: `captureTree` hỗ trợ gọi component không có props và trả về null một cách an toàn khi component trả về null.

### Nhánh 2: Làm Sạch Mã Nguồn Sản Xuất & Kiểm Thử Hành Vi Công Khai
- TC-266.10 [UC-IMP266/MSS]: Đối tượng rỗng thông thường `{}` trong TypeScript không bị gán các thuộc tính test như frames hay isMobile hay position.
- TC-266.11 [UC-IMP266/MSS]: `PerfBudgetController` chứng minh tính xoay vòng ghi đè mẫu thứ 61 bằng hàm tính `getAverageFps` công khai mà không soi biến private `maxSamples`.
- TC-266.12 [UC-IMP266/MSS]: `PerfBudgetController.reset()` chứng minh dữ liệu mẫu cũ bị xóa sạch bằng cách nạp mẫu mới và xác nhận FPS thay đổi ngay lập tức mà không dùng `Reflect.get`.
- TC-266.13 [UC-IMP266/MSS]: `CoastalIslandEnvironment` unmount hoàn toàn component `CoastalSeagulls` khi `isMobile: true` (tiết kiệm 25 meshes) và render đàn chim 5 con khi `isMobile: false` (thay thế test meta checklist cũ).

### Nhánh 3: Reactivity Hook `useIsMobile()` (`use_is_mobile.test.ts`)
- TC-266.14 [UC-IMP266/MSS]: `useIsMobile` trả về true trên môi trường di động và phản ứng cập nhật lại khi phát sinh sự kiện resize qua ngưỡng 768px.
- TC-266.15 [UC-IMP266/MSS]: `useIsMobile` lắng nghe và cập nhật lại trạng thái khi phát sinh sự kiện `orientationchange`.

### Nhánh 4: Mỹ Thuật 3D - Ẩn Hoàn Toàn Chim Hải Âu & Vệt Bọt Sóng Trên Mobile
- TC-266.16 [UC-IMP266/MSS]: `CoastalIslandEnvironment` không kết xuất component `CoastalSeagulls` khi `isMobile: true` (dọn sạch 25 meshes).
- TC-266.17 [UC-IMP266/MSS]: `CoastalPatrolBoat` và `DioramaHarborCruiser` không kết xuất các mesh vệt bọt rẽ sóng `wake` khi `isMobile: true`.

### Nhánh 5: Tự Động Hóa Chốt Chặn Telemetry Camera & Chính Sách Kích Hoạt (`check_evidence_camera_telemetry.test.ts`)
- TC-266.18 [UC-IMP266/MSS]: `validateCameraTelemetryData` chấp nhận telemetry camera toàn cảnh hợp lệ với elevationY dương và pitch 38 độ và FOV 24 độ.
- TC-266.19 [UC-IMP266/MSS]: `validateCameraTelemetryData` chấp nhận telemetry camera cận cảnh đường phố hợp lệ với elevationY 2.8 độ và pitch 24.5 độ và FOV 66.7 độ.
- TC-266.20 [UC-IMP266/A5]: `validateCameraTelemetryData` chấp nhận camera trực giao Orthographic có fov null và snapshot unmounted có pitchDeg null.
- TC-266.21 [UC-IMP266/A6]: `validateCameraTelemetryData` phát hiện lỗi vi phạm khi `elevationY` bé hơn hoặc bằng 0.5 (camera chui xuống lòng đất).
- TC-266.22 [UC-IMP266/A7]: `validateCameraTelemetryData` phát hiện lỗi vi phạm khi `pitchDeg` nhỏ hơn 15 độ (nhìn ngửa lên trời) hoặc lớn hơn 85 độ (cắm vuông góc).
- TC-266.23 [UC-IMP266/A8]: `validateCameraTelemetryData` phát hiện lỗi vi phạm khi `fov` nhỏ hơn 15 độ hoặc lớn hơn 85 độ trên camera phối cảnh.
- TC-266.24 [UC-IMP266/A9]: `validateCameraTelemetryData` phát hiện lỗi vi phạm khi tọa độ `position` hoặc `target` dính NaN hoặc thiếu phần tử.
- TC-266.25 [UC-IMP266/MSS]: `isCameraTelemetryRequired` trả về true đối với các ticket chứa `3d_canvas` hoặc `street_chase` và false đối với các ticket 2D UI thuần túy.

---

## 4. BẢNG ĐO LƯỜNG NGÂN SÁCH DÒNG MÃ (PRE-CODING LOC MEASUREMENT)

| Tệp Tin Mục Tiêu | Phân Hạng Tier | Dòng Hiện Tại | Dự Kiến Sau Sửa | Biến Thiên (Delta) | Trần Ngân Sách | Đánh Giá |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `src/client/types/global.d.ts` | Tier 1 (Logic) | 49 | 43 | -6 dòng | <= 400 dòng | ✔️ Safe |
| `src/client/hooks/use_is_mobile.ts` | Tier 1 (Hook) | 0 (Mới) | ~35 | +35 dòng | <= 400 dòng | ✔️ Safe |
| `src/client/main.tsx` | Tier 2 (View) | 268 | 268 | 0 dòng | <= 500 dòng | ✔️ Safe |
| `src/client/3d/coastal_island_environment.tsx` | Tier 2 (3D) | 231 | 231 | 0 dòng | <= 500 dòng | ✔️ Safe |
| `src/client/3d/coastal_seagulls.tsx` | Tier 2 (3D) | 147 | 148 | +1 dòng | <= 500 dòng | ✔️ Safe |
| `src/client/3d/coastal_patrol_boat.tsx` | Tier 2 (3D) | 148 | 150 | +2 dòng | <= 500 dòng | ✔️ Safe |
| `src/client/3d/diorama/diorama_harbor_cruiser.tsx` | Tier 2 (3D) | 67 | 69 | +2 dòng | <= 500 dòng | ✔️ Safe |
| `src/client/3d/perf_budget.ts` | Tier 1 (Logic) | 300 | 300 | 0 dòng | <= 400 dòng | ⚠️ **Warning (300 LOC)** |
| `scripts/helpers/camera_telemetry_validator.mjs` | Tier 1 (Script Helper) | 0 (Mới) | ~75 | +75 dòng | <= 400 dòng | ✔️ Safe |
| `scripts/check_evidence.mjs` | Tier 1 (Script) | 269 | 280 | +11 dòng | <= 400 dòng | ✔️ Safe |
| `tests/helpers/threejs_test_utils.ts` | Test Helper | 0 (Mới) | ~90 | +90 dòng | <= 300 dòng | ✔️ Safe |
| `tests/client/imp265_dual_platform_mobile_lod.test.ts` | Test Suite | 418 | 385 | -33 dòng | <= 600 dòng | ✔️ Safe |
| `tests/scripts/check_evidence_camera_telemetry.test.ts` | Test Suite | 0 (Mới) | ~100 | +100 dòng | <= 300 dòng | ✔️ Safe |

> ⚠️ **ĐĂNG KÝ MỤC NỢ KỸ THUẬT (TECH DEBT LEDGER):**  
> `DEBT-PERF-BUDGET-SUBMODULE`: Tệp `src/client/3d/perf_budget.ts` chạm ngưỡng 300 dòng (Tier 1 Warning). Khi tệp vượt 350 LOC, trích xuất logic `calculateAdaptiveDpr` sang `src/client/3d/adaptive_dpr_evaluator.ts`.

---

## 5. TIÊU CHÍ HOÀN THÀNH NGHIỆM THU (DEFINITION OF DONE)

- [ ] **DoD #1: Flow Taxonomy**: 100% ca test mang nhãn `[UC-IMP266/MSS]` hoặc `[UC-IMP266/A#]`.
- [ ] **DoD #2: Anti-TIDD Compliance**: Xóa sạch `interface Object` khỏi `src/client/types/global.d.ts`, không còn bất kỳ trường `any` nào cho test trong mã nguồn sản xuất.
- [ ] **DoD #3: Reactivity Complete**: Hook `useIsMobile()` chỉ gọi tại gốc `main.tsx`, truyền prop xuống các component con mà không gây re-render kép.
- [ ] **DoD #4: Visual Polish**: Ẩn hoàn toàn 5 chim hải âu trên mobile (`{!isMobile && <CoastalSeagulls />}`); ẩn bọt rẽ sóng đuôi thuyền khi đỗ tĩnh.
- [ ] **DoD #5: DPR SSOT Integrity**: `AdaptiveDprController` làm chủ thời gian thực; không có split-brain timer nào trong `PerfBudgetController`.
- [ ] **DoD #6: Clean Behavioral Tests**: Không còn bất kỳ lệnh `Reflect.get` hay bài test meta checklist nào; `TC-265.09` được reconcile sạch sẽ.
- [ ] **DoD #7: Mechanical Camera Telemetry Check**: `validateCameraTelemetryData` và `isCameraTelemetryRequired` trong helper độc lập kiểm soát chặt chẽ các ticket 3D Camera.
- [ ] **DoD #8: Pre-closing Gate**: `npm run prefilter` và `node scripts/check_evidence.mjs IMP-266` đạt kết quả PASS 100%.
