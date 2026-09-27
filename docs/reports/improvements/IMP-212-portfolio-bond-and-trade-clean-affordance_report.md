# [REPORT] IMP-212: Tinh Giản Danh Mục BĐS, Trái Phiếu & Đàm Phán P2P (Gói 2 Modernization)

## 1. THÔNG TIN TỔNG QUAN
- **Mã Ticket**: IMP-212
- **Tiêu Đề**: Tinh Giản Danh Mục BĐS, Trái Phiếu & Đàm Phán P2P (Gói 2 trong Chiến dịch Cải tổ Clean Modern Tactile UI).
- **Phân Hạng**: **Two-Way Door** / High Craft Rigor.
- **Trạng Thái**: ✅ COMPLETE (HOÀN TẤT TRỌN VẸN QUY TRÌNH 3 TRẠM).
- **Cổng Độc Lập**:
  - `spec-reviewer`: **SPEC_PASS (APPROVED)** (100% spec reconciliation, 16/16 atomic contract tests).
  - `ui-craft-reviewer`: **VERDICT SHIP** (Khắc phục gờ bóng tất toán đạt chuẩn tactile, 0 anti-patterns).
  - `code-reviewer`: **CODE_PASS** (Quét sạch mã ma, SRP, subtractive refactoring -31 lines, 0 any, 0 slop).

---

## 2. NGUYÊN NHÂN CỐT LÕI & GIẢI PHÁP

### 2.1. Hiện trạng trước cải tiến
1. **Nút [✕ Đóng] footer trùng lặp tại Danh Mục BĐS**: `PropertyPortfolioModal` duy trì cả nút [X] header và nút Đóng footer chiếm dụng 50px diện tích cuộn của danh mục BĐS và tab trái phiếu.
2. **Nút Phát Hành Trái Phiếu bị biến dạng text**: Khi không đủ điều kiện, nút biến thành text `[ THIẾU ĐIỀU KIỆN PHÁT HÀNH ]`, làm mất đi định danh hành động.
3. **Nút ma tàng hình trong Đàm Phán P2P**: Trong `TradeModal` và `trade_column.tsx`, tồn tại nút ma ẩn `className="hidden"` mang nhãn 'Thế chấp' và thuộc tính `data-legacy-style`. Chân modal có nút Hủy thừa thãi làm nút gửi bị chia nhỏ.

### 2.2. Giải pháp thực thi
1. **Danh Mục BĐS (`property_portfolio_modal.tsx` - 450 LOC)**:
   - Xóa bỏ 100% thẻ `<footer>`, giải phóng không gian cuộn cho cả 2 tab BĐS và Trái Phiếu.
   - Đưa số liệu tài sản lên tiêu đề phụ: `Quản lý {ownedProperties.length} tài sản sở hữu • Nâng cấp nhanh 1-click`.
2. **Tab Trái Phiếu (`bond_issuance_tab.tsx` - 101 LOC)**:
   - Nút phát hành luôn giữ nhãn cố định `PHÁT HÀNH TRÁI PHIẾU` (kể cả khi disabled).
   - Tách cảnh báo lý do chặn ra thẻ riêng `data-testid="bond-blocked-notice"`.
   - Nút tất toán giữ nhãn `TẤT TOÁN TRƯỚC HẠN`, touch target min-h-[46px] với gờ bóng tactile `shadow-[0_4px_0_0_#065f46]`.
3. **Đàm Phán P2P (`trade_modal.tsx` - 279 LOC & `trade_column.tsx` - 246 LOC)**:
   - Quét sạch toàn bộ nút ma `hidden` 'Thế chấp' và thuộc tính `data-legacy-style`.
   - Chân modal tinh gọn 1 nút duy nhất `data-testid="submit-trade-btn"` chiếm `w-full min-h-[48px]` với gờ bóng ngọc lục bảo `shadow-[0_4px_0_0_#065f46]`.

---

## 3. KIỂM THỬ & CHỈ SỐ HOÀN TẤT
- **Contract Test Suite**: `tests/contracts/imp212_portfolio_bond_and_trade_clean_affordance.test.ts` — **16/16 atomic tests PASS 100%**.
- **Adversarial Inversion**: Trạm 1 chứng minh RED (14 failed / 2 passed), Trạm 2 chuyển GREEN 16/16.
- **Specification Evolution**: Reconcile sạch 172 tests thuộc 10 test suites (`imp212`, `imp153`, `imp202`, `imp200`, `imp211`, `imp209`, `imp208`, `imp75`, `imp188`, `imp199`).
- **Linter & Typecheck**: `npm run lint:ui` (0 vi phạm), `npx tsc --noEmit` (0 lỗi).
- **Evidence Snapshot**: `.agents/evidence/imp212_snapshot.json` (`executed: true`).
