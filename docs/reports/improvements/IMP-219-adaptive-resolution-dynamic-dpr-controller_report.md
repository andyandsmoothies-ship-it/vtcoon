# [REPORT] IMP-219: Adaptive Resolution & Dynamic DPR Controller

## 1. THÔNG TIN TỔNG QUAN
- **Mã Ticket**: IMP-219
- **Tiêu Đề**: Adaptive Resolution & Dynamic DPR Controller (Điều Phối Độ Phân Giải Thích Ứng & Bộ Điều Khiển DPR Động).
- **Phân Hạng**: **Tier 2 (Full Rigor)** — R3F 3D Canvas, WebGL Performance Budget, Dynamic Resolution Scaling, Telemetry Metric Sync.
- **Trạng Thái**: ✅ **COMPLETE** (HOÀN TẤT TRỌN VẸN QUY TRÌNH 3 TRẠM).
- **Căn Cứ Pháp Lý & Kế Hoạch**:
  - Kế hoạch phê duyệt: [`c:/Users/HP/.gemini/antigravity/brain/7e49eebc-1e24-4f35-8dde-d08c5a6be193/plan_step1.md`](file:///c:/Users/HP/.gemini/antigravity/brain/7e49eebc-1e24-4f35-8dde-d08c5a6be193/plan_step1.md)
  - Bằng chứng kiểm thử tự động: [`.agents/evidence/imp219_snapshot.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp219_snapshot.json)
- **Hội Đồng Trạm 3 Độc Lập**:
  - `spec-reviewer`: **APPROVED** (100% đối soát tam giác vật lý trên đĩa, xác nhận đầy đủ C1–C5, I2, 17/17 contract tests pass).
  - `scout` (Trạm 2.5): **PASS** (Zero dirty cast `as any`, zero memory leak, live context extraction trong `useFrame`, ngân sách LOC tuân thủ nghiêm ngặt).

---

## 2. NGUYÊN NHÂN CỐT LÕI & GIẢI PHÁP KIẾN TRÚC

### 2.1. Phân Tích Hiện Trạng
Trước đợt cải tiến này:
- Canvas 3D của trò chơi sử dụng Device Pixel Ratio (DPR) cố định tĩnh: `1.0` trên Mobile và `[1, 1.5]` trên Desktop.
- Khi tải cảnh tăng cao (hiệu ứng thời tiết đổ mưa/sấm chớp, góc quay bao quát toàn đảo sa bàn, quân cờ nhảy liên tục hoặc thiết bị di động tầm trung bị nhiệt độ nóng lên), GPU bị quá tải dẫn đến hiện tượng tụt khung hình dưới 45 FPS hoặc lag giật cục bộ.
- Hệ thống thiếu cơ chế tự động điều chỉnh độ phân giải render (Dynamic Resolution Scaling) để bảo vệ ngưỡng mượt mà 60 FPS mục tiêu của Hiến pháp (`GEMINI.md`).

### 2.2. Kiến Trúc Điều Phối Độ Phân Giải Động (Dynamic DPR Architecture)

```
       [Live Render Loop - useFrame (60 FPS)]
                         │
                         ▼
        ┌───────────────────────────────────┐
        │  AdaptiveDprController (Deep Mod) │
        │  - Check document.hidden (I2)     │
        │  - Extract { gl, setDpr } (C3)    │
        │  - Monitor Pawn Motion (Lockout)  │
        └─────────────────┬─────────────────┘
                          │
                          ▼
        ┌───────────────────────────────────┐
        │ PerfBudgetController (Singleton)  │
        │ - Sliding Window FPS Calculation  │
        │ - Hysteresis Timers (1.5s / 3.0s) │
        │ - calculateAdaptiveDpr (C2)       │
        └─────────────────┬─────────────────┘
                          │
       ┌──────────────────┴──────────────────┐
       ▼ (FPS < 45 >= 1.5s)                  ▼ (FPS >= 55 >= 3.0s & !isMotionActive)
┌──────────────┐                       ┌──────────────┐
│  STEP_DOWN   │                       │   STEP_UP    │
│  (0.85/1.0/  │                       │  (1.0/1.25/  │
│   1.25)      │                       │   1.5)       │
└──────┬───────┘                       └──────┬───────┘
       │                                      │
       └──────────────────┬───────────────────┘
                          │
                          ▼
            ┌───────────────────────────┐
            │ Execute setDpr(targetDpr) │
            │ Reset Timers = 0 (C5)     │
            │ Sync Telemetry dpr (C4)   │
            └───────────────────────────┘
```

---

## 3. NĂM ĐIỂM CỨNG (C1–C5) VÀ CẢI TIẾN NỀN (I2) ĐÃ GIẢI QUYẾT

| Mã | Vấn Đề Trước Đây | Giải Pháp Vật Lý Trên Đĩa | Vị Trí File & Dòng |
| :---: | :--- | :--- | :--- |
| **C1** | `getRecommendedDpr(true)` trả về số vô hướng `1` khiến R3F Canvas clamp khoảng DPR thành `[1, 1]`, chặn đứng việc hạ độ phân giải xuống `0.85`. | Trả về khoảng hợp lệ `[0.85, 1.0]` cho Mobile và `[1.0, 1.5]` cho Desktop. | [`device_detect.ts:48-50`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/device_detect.ts#L48-L50) |
| **C2** | Ô nhiễm dữ liệu khung hình giữa các test case khi dùng singleton `perfBudgetController`. | Bổ sung phương thức công khai `calculateAdaptiveDpr(params: AdaptiveDprParams): AdaptiveDprResult` trên class `PerfBudgetController`; mỗi unit test khởi tạo instance độc lập. | [`perf_budget.ts:233`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/perf_budget.ts#L233) |
| **C3** | Nguy cơ Stale Closure khi lưu trữ `gl` hoặc `setDpr` ngoài vòng lặp nếu WebGL context bị recreation. | Trích xuất `{ gl, setDpr }` trực tiếp từ tham số đầu vào của callback `useFrame(({ gl, setDpr }, delta))` ở mỗi frame. | [`adaptive_dpr_controller.tsx:18,23`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/adaptive_dpr_controller.tsx#L18-L27) |
| **C4** | Khởi tạo DPR sai lệch khi Canvas khởi động hoặc sau khi reload. | Đọc trực tiếp `gl.getPixelRatio()` làm `initialDpr` và đồng bộ ngay lên `useTelemetryStore.getState().updateMetrics({ dpr })`. | [`adaptive_dpr_controller.tsx:25-28`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/adaptive_dpr_controller.tsx#L25-L28) |
| **C5** | Hiện tượng rung lắc / dao động liên tục (Oscillation Thrashing) nếu bộ đếm thời gian không được xóa sau khi đổi bước DPR. | Reset hoàn toàn `degradedTimeRef.current = 0` và `optimalTimeRef.current = 0` ngay sau khi kích hoạt `setDpr(targetDpr)`. | [`adaptive_dpr_controller.tsx:58-59`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/adaptive_dpr_controller.tsx#L58-L59) |
| **I2** | Trình duyệt bóp FPS tab nền (Background Throttling xuống 1-10 FPS) kích hoạt hạ DPR giả. | Bổ sung chốt chặn: `if (typeof document !== 'undefined' && document.hidden) return;`. | [`adaptive_dpr_controller.tsx:20`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/adaptive_dpr_controller.tsx#L20) |

---

## 4. MA TRẬN KIỂM THỬ HỢP ĐỒNG (UNIVERSAL 5-FACET MATRIX)

Bộ kiểm thử hợp đồng tại [`tests/client/adaptive_dpr_controller.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/adaptive_dpr_controller.test.ts) đạt **17/17 tests PASS (100%)**:

1. **Facet 1: Boundary & Range Clamping (4 tests)**
   - `[TC-DPR01.01/MSS]` `getRecommendedDpr(true)` trả về `[0.85, 1.0]` cho Mobile (C1).
   - `[TC-DPR01.02/MSS]` `getRecommendedDpr(false)` trả về `[1.0, 1.5]` cho Desktop (C1).
   - `[TC-DPR01.03/MSS]` `calculateAdaptiveDpr` không bao giờ trả về DPR < 0.85 trên mobile hoặc > 1.5 trên desktop.
   - `[TC-DPR01.04/MSS]` DPR tính toán luôn làm tròn đến 2 chữ số thập phân (0.85, 1.0, 1.25, 1.5).

2. **Facet 2: State Reactivity & Step-Down (4 tests - Fresh Instance C2)**
   - `[TC-DPR02.01/MSS]` Khi FPS < 45 duy trì >= 1.500ms trên mobile, DPR hạ từ 1.0 xuống 0.85.
   - `[TC-DPR02.02/MSS]` Khi FPS < 45 duy trì >= 1.500ms trên desktop, DPR hạ từ 1.5 xuống 1.25.
   - `[TC-DPR02.03/MSS]` Khi FPS < 35 duy trì >= 1.500ms trên desktop, DPR hạ tiếp từ 1.25 xuống 1.0.
   - `[TC-DPR02.04/MSS]` `PerfBudgetReport` phản ánh đúng trạng thái trung bình khung hình và tương thích thích ứng.

3. **Facet 3: Hysteresis, Anti-Jitter & Reset Verification (4 tests - C5)**
   - `[TC-DPR03.01/MSS]` Khi FPS tụt xuống 40 nhưng chỉ kéo dài 500ms rồi phục hồi, DPR giữ nguyên (chưa đủ 1.500ms).
   - `[TC-DPR03.02/MSS]` Khi DPR đang ở mức thấp và FPS phục hồi >= 55, DPR chỉ nâng sau đủ 3.000ms.
   - `[TC-DPR03.03/MSS]` Không có hiện tượng dao động DPR liên tiếp giữa các frame (Zero Thrashing).
   - `[TC-DPR03.04/MSS]` Sau khi thực thi `STEP_DOWN` hoặc `STEP_UP`, các bộ đếm thời gian được reset về 0 để ngăn oscillation tức thì.

4. **Facet 4: Motion Lockout Defense (3 tests)**
   - `[TC-DPR04.01/MSS]` Khi quân cờ đang nhảy (`activePawnAnimation`), khóa nâng DPR (Freeze Step-Up, MAINTAIN).
   - `[TC-DPR04.02/MSS]` Khi quân cờ đang nhảy nhưng FPS bị tụt nặng (< 45 kéo dài >= 1.500ms), vẫn cho phép hạ DPR để chống giật hình.
   - `[TC-DPR04.03/MSS]` Khi hoạt ảnh di chuyển kết thúc, bộ đếm thời gian nâng DPR được tái kích hoạt khi đủ 3.000ms.

5. **Facet 5: Telemetry Observability & Live Context Sync (2 tests - C3, C4)**
   - `[TC-DPR05.01/MSS]` Thay đổi DPR lập tức đồng bộ lên `useTelemetryStore.getState().metrics.dpr`.
   - `[TC-DPR05.02/MSS]` Component `AdaptiveDprController` đọc chính xác `initialDpr` từ `gl.getPixelRatio()` và fallback an toàn khi context rỗng.

---

## 5. ĐO LƯỜNG NGÂN SÁCH LOC (TIER BUDGET AUDIT)

Theo kết quả tự động từ `scripts/check_loc.mjs`:

| Tệp Vật Lý | Phân Loại Tier | Total Lines | Non-Empty SLOC | Trần Quy Định | Đánh Giá |
| :--- | :---: | :---: | :---: | :---: | :--- |
| [`src/client/3d/device_detect.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/device_detect.ts) | Tier 2 (UI/3D/Views) | **57** | 45 | $\le 500$ | ✔️ An toàn |
| [`src/client/telemetry/telemetry_types.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/telemetry/telemetry_types.ts) | Tier 3 (Types/Config) | **82** | 68 | $\le 800$ | ✔️ An toàn |
| [`src/client/3d/perf_budget.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/perf_budget.ts) | Tier 2 (UI/3D/Views) | **271** | 237 | $\le 500$ ($\le 300$ budget) | ✔️ An toàn |
| [`src/client/3d/adaptive_dpr_controller.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/adaptive_dpr_controller.tsx) | Tier 2 (UI/3D/Views) | **65** | 56 | $\le 500$ ($\le 100$ budget) | ✔️ An toàn |
| [`src/client/game_canvas.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/game_canvas.tsx) | Tier 2 (UI/3D/Views) | **446** | 410 | $\le 500$ ($\le 480$ budget) | ✔️ Đạt chuẩn |

- **Typecheck & Linter**:
  - `npx tsc --noEmit`: 0 lỗi.
  - `npm run lint:ui`: 0 lỗi trên 201 tệp client.
  - Không còn bất kỳ dirty cast (`as any`) nào trong mã nguồn sản phẩm lẫn test suite.

---

## 6. KẾT LUẬN & CHỮ KÝ NGHIỆM THU

Gói cải tiến **IMP-219** đã hoàn tất xuất sắc theo đúng tiến trình **3 Trạm** nghiêm ngặt của Hiến pháp `GEMINI.md`:
1. Trạm 1 (QA RED): 17 ca kiểm thử hợp đồng đối kháng 5 mặt được thiết lập và chứng minh đỏ trước khi viết mã nguồn.
2. Trạm 2 (GREEN Implementation): Triển khai chính xác 5 drop-in snippets, không rò rỉ bộ nhớ, không stale closures.
3. Trạm 2.5 (Sweeping Scout Audit): Rà soát 100% tệp sửa đổi, làm sạch import thừa và loại bỏ toàn bộ `as any`.
4. Trạm 3 (Independent Specification Review): `spec-reviewer` ký duyệt **APPROVED** trên physical disk.

Hệ thống đã sẵn sàng vận hành thực tế trên môi trường sản xuất với hiệu năng 60 FPS mượt mà và ổn định.
