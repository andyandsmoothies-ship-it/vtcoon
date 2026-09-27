# [REPORT] IMP-213: Chuẩn Hóa Thu Hồi Cưỡng Chế 130%, Sàn HOSE & Thể Lệ (Gói 3 Modernization)

## 1. THÔNG TIN TỔNG QUAN
- **Mã Ticket**: IMP-213
- **Tiêu Đề**: Chuẩn Hóa Thu Hồi Cưỡng Chế 130%, Sàn HOSE & Thể Lệ (Gói 3 trong Chiến dịch Cải tổ Clean Modern Tactile UI).
- **Phân Hạng**: **Two-Way Door** / High Craft Rigor.
- **Trạng Thái**: ✅ COMPLETE (HOÀN TẤT TRỌN VẸN QUY TRÌNH 3 TRẠM).
- **Cổng Độc Lập**:
  - `spec-reviewer`: **SPEC_PASS (APPROVED)** (100% spec reconciliation, 16/16 atomic contract tests).
  - `ui-craft-reviewer`: **VERDICT SHIP** (0 anti-patterns, touch target >= 44-48px, giải phóng 50px diện tích đọc thể lệ).
  - `code-reviewer`: **CODE_PASS** (Strict Intent Callback Isolation, Web Audio API cleanup, SSR store fallback, 0 any, 0 slop).

---

## 2. NGUYÊN NHÂN CỐT LÕI & GIẢI PHÁP

### 2.1. Hiện trạng trước cải tiến
1. **Thu Hồi Cưỡng Chế 130%**: Nút mang nhãn thụ động `✕ Bỏ Qua` không phản ánh tính chất thương mại; khi thiếu tiền mặt đền bù 130%, thiếu thẻ cảnh báo số tiền thiếu rõ ràng.
2. **Sàn HOSE**: Nhãn `✕ Bỏ Qua` không sát với ngữ cảnh cá cược chứng khoán; tồn tại thuộc tính ma `data-legacy-rates`; nút bấm thiếu gờ bóng tactile chuẩn.
3. **Modal Hướng Dẫn & Thể Lệ**: Tồn tại thanh `footer` chứa nút `Đã Hiểu` chiếm dụng 50px diện tích màn hình trong khi người dùng đã có nút Header [X], phím Esc và click nền.

### 2.2. Giải pháp thực thi
1. **Thu Hồi Cưỡng Chế 130% (`compulsory_buyout_modal.tsx` - 192 LOC)**:
   - Thống nhất nhãn dứt khoát `✕ Từ Chối Mua` (màu hồng phấn tao nhã `bg-rose-50 border-rose-300 text-rose-700`).
   - Nút `Mua Lại ({cost})` giữ nguyên định danh ở trạng thái disabled mờ khi thiếu tiền.
   - Bổ sung thẻ cảnh báo riêng `data-testid="buyout-shortfall-notice"` tone amber hiển thị số tiền thiếu chính xác.
   - Bố cục 2 nút đối xứng 1 hàng `grid-cols-2`, đạt chuẩn `h-full min-h-[48px]`.
   - Bổ sung cơ chế fallback store SSR tương thích hoàn hảo `renderToStaticMarkup`.
2. **Sàn HOSE (`hose_modal.tsx` - 333 LOC)**:
   - Đổi nhãn `✕ Bỏ Qua` thành `✕ Không Cược` chuẩn ngữ cảnh giao dịch.
   - Quét sạch 100% thuộc tính ma `data-legacy-rates` trong DOM.
   - Nút Cược và Không Cược đều đạt touch target `min-h-[46px]` kèm gờ bóng tactile 3D (`shadow-[0_4px_0_0_#065f46]` và `shadow-[0_4px_0_0_#fca5a5]`), độ lún cơ học `active:translate-y-[3px]`.
3. **Modal Thể Lệ (`game_rules_modal.tsx` - 333 LOC)**:
   - Tháo gỡ hoàn toàn thanh `footer` chứa nút `Đã Hiểu` thừa thãi, giải phóng 50px diện tích cuộn cho toàn bộ các tab hướng dẫn.
   - Nút đóng Header `[X]` đạt touch target chuẩn `min-w-[44px] min-h-[44px]`, bổ sung tooltip chỉ dẫn trực quan `title="Đóng hướng dẫn (Phím Esc hoặc click nền)"`.

---

## 3. KIỂM THỬ & CHỈ SỐ HOÀN TẤT
- **Contract Test Suite**: `tests/contracts/imp213_buyout_hose_rules_clean_affordance.test.ts` — **16/16 atomic tests PASS 100%**.
- **Adversarial Inversion**: Trạm 1 chứng minh RED (8 failed / 8 passed), Trạm 2 chuyển GREEN 16/16.
- **Specification Evolution**: Reconcile sạch 108 tests thuộc 7 test suites (`imp213`, `imp212`, `imp211`, `imp209`, `imp161`, `imp172`, `auction_modal`).
- **Linter & Typecheck**: `npm run lint:ui` (0 vi phạm), `npx tsc --noEmit` (0 lỗi).
- **Evidence Snapshot**: `.agents/evidence/imp213_snapshot.json` (`executed: true`).
