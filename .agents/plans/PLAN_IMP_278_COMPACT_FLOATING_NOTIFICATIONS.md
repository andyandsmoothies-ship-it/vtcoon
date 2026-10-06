# KẾ HOẠCH TRIỂN KHAI MICRO-SLICE (LEAN PLAN SPECIFICATION)
# TICKET: IMP-278 — Gọn Hóa Thẻ Thông Báo Nổi (Compact Floating Badges & Milestone Banners: Header-to-Footer Integration)

> **Mã Nhiệm Vụ:** IMP-278 (Micro-Slice Gọn Hóa Thông Báo Nổi HUD)  
> **Phân hệ mục tiêu:** `client-ui`  
> **Phân loại rủi ro:** Tier 2 Micro-Slice (Lean Plan Specification, <= 180 lines, Delta <= 50 LOC, 1 file in `src/**`)  
> **Chỉ tiêu kiểm thử:** Scaled Floor >= 8 atomic tests, Pure Logic Waiver = `false`

---

## 0. KHẢO SÁT BỀ MẶT MÃ NGUỒN & ĐIỂM BẮT ĐẦU (SURFACE INVENTORY & LOC BASELINE)

### 0.1 Danh Sách Tệp Mục Tiêu & Dòng Mã Thực Tế Trên Đĩa
* **Target physical file**: `src/client/ui/floating_numbers.tsx` (334 lines, Tier 2 limit: 500 lines) — **Safe**.
* **Target physical file**: `tests/contracts/imp278_compact_floating_notifications.test.ts` (New file in Station 1/2) — **Safe**.

### 0.2 Bảng Thống Kê Delta LOC Dự Kiến
| File | Current LOC | Expected LOC | Delta LOC | Status |
| :--- | :---: | :---: | :---: | :---: |
| `src/client/ui/floating_numbers.tsx` | 334 | ~330 | -4 lines | Safe |
| `tests/contracts/imp278_compact_floating_notifications.test.ts` | 0 | ~120 | +120 lines | Safe |
| **Tổng Delta Production (`src/**`)** | — | — | **-4 net LOC** (<= 50 LOC) | **Pass Micro-Slice** |

### 0.3 Phân Định Phạm Vi & Ranh Giới Phân Hệ (Scope Conservation Mandate)
1. [`src/client/ui/floating_numbers.tsx#L97-L146,L192-L246`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/floating_numbers.tsx#L97-L246) — **MODIFY (Target 1)**: Đảo ngược phân cấp thị giác trong `FloatingBadge` và `MilestoneBanner`: đưa dòng diễn giải/tiêu đề chính lên đầu cạnh nút đóng `✕`, bỏ đường kẻ `border-b` chia cắt, đưa nhãn danh mục xuống dưới thành hàng phụ (footer).
2. **Bảo toàn môi trường làm việc**:
   - `src/client/ui/transaction_narrative.ts`
   - `src/client/ui/transaction_formula.ts`
   - `tests/contracts/imp253_floating_toast_ergonomics.test.ts`
   - `tests/contracts/imp229_lean_flow_financial_notification.test.ts`
   - `tests/contracts/imp194_natural_narrative_floating_badges.test.ts`

---

## 1. BẢN THIẾT KẾ KIẾN TRÚC & BẤT BIẾN NGHIỆP VỤ (ARCHITECTURAL INVARIANTS)

### 1.1 Cơ Chế Gọn Hóa Thông Báo Nổi (Compact Visual Hierarchy)
* **Mục tiêu**: Giảm ~35%-40% chiều cao thẻ thông báo nổi, ưu tiên hiển thị dòng tiền / sự kiện chính trước mắt người chơi, tiết kiệm tối đa diện tích bàn cờ 3D trên mobile và desktop.
* **Quy chuẩn**:
  - Hàng chính: `transaction-flow-line` (hoặc `milestone-card-title`) hiển thị ở trên cùng, flex với nút đóng `✕`.
  - Hàng phụ (footer): nhãn danh mục (`category` + `icon`) và công thức (`transaction-formula-line` nếu có) hiển thị nhỏ gọn ở hàng dưới.
  - Loại bỏ hoàn toàn dải phân cách `border-b border-slate-200/80 pb-0.5`.

### 1.2 Bất Biến Miền (Domain Invariants)
* **Bất biến 1 (Accessibility & Target Size)**: Nút đóng `✕` duy trì tối thiểu `min-w-[24px] min-h-[24px]`, `aria-label="Đóng thông báo"`, `focus-visible:ring-2`.
* **Bất biến 2 (Test ID Stability)**: Giữ nguyên 100% các định danh `contextual-transaction-badge`, `transaction-flow-line`, `floating-amount-pill`, `transaction-formula-line`, `milestone-card-title`, `milestone-card-desc`.
* **Bất biến 3 (A11y Label)**: Thuộc tính `aria-label` trên container duy trì `${category}: nhấn để đóng`.

---

## 2. NHIỆM VỤ THỰC THI CHI TIẾT (EXACT IMPLEMENTATION TASKS)

### Task 1: Tối Ưu Cấu Trúc Bố Cục `MilestoneBanner` Trong `floating_numbers.tsx`
* **Target physical file**: `src/client/ui/floating_numbers.tsx`
* **Phạm vi tác động**: Block render nội dung `MilestoneBanner` (dòng 97–146).
* **Quy tắc bố cục & Phân cấp thị giác**:
  1. **Hàng 1 (Tiêu đề chính + Nút đóng)**:
     - Container: `flex items-start justify-between gap-1.5 min-w-0`.
     - Nhánh trái: Flex container chứa badge người chơi (`player.tokenColor`, `formatShortPlayerName`) và nhãn tiêu đề `data-testid="milestone-card-title"` (`font-bold text-xs sm:text-[13px] text-slate-900 truncate flex-1`).
     - Nhánh phải: Nút đóng `✕` (`min-w-[24px] min-h-[24px]`, `aria-label="Đóng thông báo"`, `shrink-0`).
  2. **Hàng 2 (Diễn giải chi tiết nếu có)**:
     - Element `data-testid="milestone-card-desc"` (`line-clamp-2 break-words text-[11px] sm:text-xs text-slate-600 font-medium`).
  3. **Hàng 3 (Footer danh mục định danh)**:
     - Container: `flex items-center gap-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate pt-0.5`.
     - Hiển thị icon sự kiện và nhãn `category`.
  4. **Triệt tiêu dải phân cách**: Loại bỏ hoàn toàn `border-b border-slate-200/80 pb-0.5` chia cắt 3 tầng cũ.

### Task 2: Tối Ưu Cấu Trúc Bố Cục `FloatingBadge` Trong `floating_numbers.tsx`
* **Target physical file**: `src/client/ui/floating_numbers.tsx`
* **Phạm vi tác động**: Block render nội dung `FloatingBadge` (dòng 192–246).
* **Quy tắc bố cục & Phân cấp thị giác**:
  1. **Hàng 1 (Dòng tiền chính + Nút đóng)**:
     - Container: `flex items-start justify-between gap-1.5 min-w-0`.
     - Nhánh trái: Element `data-testid="transaction-flow-line"` (`text-xs sm:text-[13px] font-semibold text-slate-800 break-words flex-1 min-w-0`) chứa `narrative.subject`, `narrative.verb`, `data-testid="floating-amount-pill"` (`item.text`, bảng màu xanh/đỏ theo `isPositive`), và `narrative.target`.
     - Nhánh phải: Nút đóng `✕` (`min-w-[24px] min-h-[24px]`, `aria-label="Đóng thông báo"`, `shrink-0`).
  2. **Hàng 2 (Footer danh mục + Công thức nếu có)**:
     - Container: `flex items-center gap-1.5 flex-wrap min-w-0 text-[10px] sm:text-[11px] text-slate-500 pt-0.5`.
     - Phân vùng 1 (Danh mục): Flex container chứa `narrative.icon` và `narrative.category` in hoa (`font-bold uppercase tracking-wider`).
     - Phân vùng 2 (Công thức): Khi `Boolean(narrative.formula?.trim())`, render `data-testid="transaction-formula-line"` dạng inline badge nối tiếp với dấu chấm tròn phân cách (`before:content-['•'] before:text-slate-300 before:mr-0.5`), icon thước đo `📐`, và text `narrative.formula`.
  3. **Triệt tiêu dải phân cách**: Loại bỏ hoàn toàn `border-b border-slate-200/80 pb-0.5` chia cắt cũ.

---

## 3. THIẾT KẾ KIỂM THỬ HỢP ĐỒNG (STATION 1 CONTRACT TEST SPECIFICATIONS)
* **Target physical file**: `tests/contracts/imp278_compact_floating_notifications.test.ts` (New file in Station 1/2)

* TC-278.01 [UC-IMP278/MSS]: Given `FloatingBadge` với hành động mua đất `buy`, When render HTML, Then dòng `transaction-flow-line` nằm ở khối đầu tiên cùng cấp với nút đóng `✕`.
* TC-278.02 [UC-IMP278/MSS]: Given `FloatingBadge`, When render HTML, Then nhãn danh mục `narrative.category` hiển thị ở khối phụ phía dưới dòng diễn giải.
* TC-278.03 [UC-IMP278/MSS]: Given `FloatingBadge` có công thức, When render HTML, Then dòng `transaction-formula-line` xuất hiện chung khối hàng phụ với nhãn danh mục.
* TC-278.04 [UC-IMP278/MSS]: Given `MilestoneBanner` cho sự kiện thị trường `market`, When render HTML, Then tiêu đề `milestone-card-title` nằm ở khối đầu tiên cùng cấp với nút đóng `✕`.
* TC-278.05 [UC-IMP278/MSS]: Given `MilestoneBanner`, When render HTML, Then nhãn danh mục `category` hiển thị ở khối phụ phía dưới tiêu đề.
* TC-278.06 [UC-IMP278/MSS]: Given `FloatingBadge` và `MilestoneBanner`, When kiểm tra nút đóng `✕`, Then bảo toàn kích thước chuẩn WCAG 2.2 AA (`min-w-[24px] min-h-[24px]`) và `aria-label="Đóng thông báo"`.
* TC-278.07 [UC-IMP278/MSS]: Given `FloatingBadge` và `MilestoneBanner`, When kiểm tra `aria-label` trên container, Then bảo toàn chuỗi chuẩn `${category}: nhấn để đóng`.
* TC-278.08 [UC-IMP278/MSS]: Given HTML render của cả hai component, When kiểm tra phân cách, Then không còn class `border-b border-slate-200/80`.

---

## 4. QUY TRÌNH CHỐT CHẶN CƠ HỌC & NGHIỆM THU
1. **Kiểm tra Plan tự động**: `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_278_COMPACT_FLOATING_NOTIFICATIONS.md --auto-sign`
2. **Trạm 1 (RED)**: Tạo `tests/contracts/imp278_compact_floating_notifications.test.ts` chứng minh fail vì runtime assertions (do code hiện tại vẫn chia 3 tầng và có `border-b`).
3. **Trạm 2 (GREEN)**: Thực hiện Task 1 & 2 làm xanh 100% tests.
4. **Chốt chặn Fast Pre-Filter & Scope**:
   - `npm run prefilter -- src/client/ui/floating_numbers.tsx tests/contracts/imp278_compact_floating_notifications.test.ts`
   - `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_278_COMPACT_FLOATING_NOTIFICATIONS.md`
5. **Xuất Audit Reports & Kiểm toán Bằng chứng**:
   - `npm run report -- IMP-278`
   - `node scripts/check_evidence.mjs IMP-278`
