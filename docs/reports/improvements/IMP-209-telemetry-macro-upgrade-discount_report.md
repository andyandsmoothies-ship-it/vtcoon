# [REPORT] IMP-209: Đồng Bộ Hóa Chi Phí Nâng Cấp Vĩ Mô & Khắc Phục Báo Động Giả Hộp Đen Telemetry

## 1. THÔNG TIN TỔNG QUAN
- **Mã Ticket**: IMP-209
- **Tiêu Đề**: Đồng Bộ Hóa Chi Phí Nâng Cấp Khi Kích Hoạt Sốt Đất Vĩ Mô (`MACRO_LAND_FEVER`) & Loại Bỏ Báo Động Giả Thất Thoát Kho Bạc (`TREASURY_INVARIANT_VIOLATED`).
- **Phân Hạng**: **Two-Way Door** / Fast-Track (1 tệp logic Client Telemetry, 1 tệp Contract Test TDD 6 tests).
- **Trạng Thái**: ✅ COMPLETE (HOÀN TẤT TRỌN VẸN 3 TRẠM TDD & NGHIỆM THU).
- **Phạm vi tác động vật lý**:
  - `src/client/telemetry/telemetry_delta_hook.ts` (393 LOC — Tier 1 $\le$ 400 LOC, $\Delta = -3$ LOC).
  - `tests/contracts/imp209_telemetry_macro_upgrade_discount.test.ts` (161 LOC, 6 tests).

---

## 2. HIỆN TRẠNG & NGUYÊN NHÂN CỐT LÕI

### 2.1. Triệu chứng lâm sàng
- Trong phòng thi đấu `VTOAH2` (Seed: `867181505`), bảng Hộp Đen Telemetry giương cờ đỏ **7 vi phạm CRITICAL** `TREASURY_INVARIANT_VIOLATED` ("Thất thoát quỹ kho bạc hoặc tiền tệ"):
  - Tick 134: `actualDelta: -1312, expected: -1750`
  - Tick 261: `actualDelta: -225, expected: -300`
  - Tick 262: `actualDelta: -225, expected: -300`
  - Tick 263: `actualDelta: -337, expected: -450`
  - Tick 264: `actualDelta: -337, expected: -450`
  - Tick 265: `actualDelta: -450, expected: -600`
  - Tick 266: `actualDelta: -450, expected: -600`

### 2.2. Phân tích nguyên nhân
- Tỷ lệ chênh lệch:
  $$\frac{-450}{-600} = \frac{-337.5}{-450} = \frac{-225}{-300} = \frac{-1312.5}{-1750} = 0.75 \quad (-25\%)$$
- Trong phòng thi đấu `VTOAH2`, chu kỳ kinh tế vĩ mô **`MACRO_LAND_FEVER` (Sốt Đất Vĩ Mô)** đang kích hoạt: "Thuê x2.5, Xây nhà -25%".
- **Server vận hành 100% chuẩn xác**: Hàm `calculateUpgradeCost` tại Server trừ đúng $75\%$ giá gốc khi người chơi hoặc bot nâng cấp nhà trên các ô đất thuộc nhóm màu sốt đất (ô 1, 3, 37).
- **Hộp Đen Client bị lỗi thời**: Thuật toán `computeCellDelta` trong `telemetry_delta_hook.ts` chỉ mô hình hóa thẻ `MC_CREDIT_STIMULUS` (-20%) mà thiếu hoàn toàn `MACRO_LAND_FEVER` (-25%). Do đó, Hộp Đen vẫn kỳ vọng trừ $100\%$ giá gốc, dẫn đến báo động giả thất thoát tiền.

---

## 3. GIẢI PHÁP TRIỂN KHAI

1. **Chuẩn hóa Single Source of Truth (SSOT)**:
   - Thay thế việc tính nhẩm giá nâng cấp phân mảnh trong `computeCellDelta` bằng việc gọi trực tiếp hàm chuẩn domain `calculateUpgradeCost(cell.index, lvl, activeMods)`.
   - Hàm chuẩn hỗ trợ đầy đủ `MACRO_LAND_FEVER` (-25%), `MC_CREDIT_STIMULUS` (-20%), sàn chi phí tối thiểu 50% và bảo toàn số dư thực tế `upgraderSpent`.
2. **Kiểm soát ngân sách LOC**:
   - `src/client/telemetry/telemetry_delta_hook.ts`: Giảm từ 396 dòng xuống **393 dòng** (ngân sách trần Tier 1 $\le 400$ dòng).
3. **Bảo toàn khả năng phát hiện gian lận (Error Defense)**:
   - Nếu có gian lận hoặc sai lệch số dư thực tế không khớp với công thức giảm giá, Hộp Đen vẫn kích hoạt vi phạm chính xác.

---

## 4. KẾT QUẢ KIỂM THỬ & NGHIỆM THU

- **TDD Contract Test**: `tests/contracts/imp209_telemetry_macro_upgrade_discount.test.ts`
  - `TC-209.01/MSS` .. `TC-209.03/MSS`: Tính đúng -225, -337, -450 cho Ô 1 $\to$ **PASS**
  - `TC-209.04/MSS`: Tính đúng -1312 cho Ô 37 (Tick 134 Replay) $\to$ **PASS**
  - `TC-209.05/MSS`: Tái hiện Tick 266 phòng VTOAH2 phát sinh 0 vi phạm $\to$ **PASS**
  - `TC-209.06/A5`: Error defense phát hiện gian lận lệch tiền thật $\to$ **PASS**
- **Toàn bộ 49/49 tests** trong 3 bộ suite Telemetry (`telemetry_gameplay_invariants`, `telemetry_system`, `imp109`) đều đạt **PASS 100%**.
- **TypeScript Typecheck**: `npx tsc --noEmit` đạt **0 lỗi**.
- **UI Linter**: `npm run lint:ui` đạt **0 vi phạm**.
