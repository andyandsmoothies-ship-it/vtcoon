# [REPORT] IMP-211: Tinh Giản Sàn Đấu Giá 15s & Đề Xuất Đổi Đất Bot (Gói 1 Modernization)

## 1. THÔNG TIN TỔNG QUAN
- **Mã Ticket**: IMP-211
- **Tiêu Đề**: Tinh Giản Sàn Đấu Giá 15s & Đề Xuất Đổi Đất Bot (Gói 1 trong Chiến dịch Cải tổ Clean Modern Tactile UI).
- **Phân Hạng**: **Two-Way Door** / High Craft Rigor.
- **Trạng Thái**: ✅ COMPLETE (HOÀN TẤT TRỌN VẸN QUY TRÌNH 3 TRẠM).
- **Cổng Độc Lập**:
  - `spec-reviewer`: **SPEC_PASS (APPROVED)** (100% spec reconciliation, 16/16 atomic contract tests).
  - `ui-craft-reviewer`: **VERDICT SHIP** (0 anti-patterns, xúc giác gờ đáy chuẩn tactile, touch target >= 44-46px).
  - `code-reviewer`: **CODE_PASS** (Strict Intent Callback Isolation, dọn dẹp timer unmount, 0 any, 0 slop).

---

## 2. NGUYÊN NHÂN CỐT LÕI & GIẢI PHÁP

### 2.1. Hiện trạng trước cải tiến
1. **Fallback ngầm `onPass ?? onClose`**: Trong `auction_modal.tsx`, việc gọi `onPass ?? onClose` vi phạm nguyên lý phân lập callback intent, gây nguy cơ gửi sai intent hoặc đóng modal ngoài ý muốn.
2. **Footer đấu giá thiếu phân minh**: Khi người chơi rút lui (`hasPassed`), bị từ chối (`isDeclinedPlayer`), hoặc phiên kết thúc (`isConcluded`), footer render các thẻ `div` tĩnh không thể focus được, hoặc thiếu nút đóng dứt khoát.
3. **Nút đổi đất bot biến dạng thành text thiếu nợ**: Khi thiếu tiền bù giao dịch, nút bấm biến đổi nhãn và layout làm người chơi bối rối.

### 2.2. Giải pháp thực thi
1. **Sàn Đấu Giá (`auction_modal.tsx` - 443 LOC)**:
   - Khử hoàn toàn `onPass ?? onClose`, tách biệt tuyệt đối giữa intent bỏ cuộc và đóng modal.
   - Bố cục lưới 2 cột đối xứng `grid-cols-2`:
     * Cột 1: Nút Auto-Bid thuần Việt `TỰ ĐỘNG ĐẶT GIÁ: BẬT / TẮT` (`data-testid="auction-autobid-btn"`).
     * Cột 2: Phân định 4 trạng thái đối ứng:
       - Đang tham gia: Nút `✕ Rút Lui` (`data-testid="auction-pass-btn"`, gọi `onPass`).
       - Đã rút lui: Nút `✕ Đã Rút Lui • Đóng` (`data-testid="auction-passed-close-btn"`, gọi `onClose`).
       - Không đủ điều kiện tham gia: Nút `✕ Đóng / Xem Bàn Cờ` (`data-testid="auction-declined-close-btn"`, gọi `onClose`).
       - Phiên kết thúc: Nút `✕ Đóng / Xem Bàn Cờ` (`data-testid="auction-concluded-close-btn"`, gọi `onClose`).
   - Mọi nút kết thúc/rút lui đều là focusable buttons chuẩn WCAG.
   - Thống nhất nhãn SSOT: `✕ Rút Lui` (assert chuỗi chính xác tại TC-211.02), `🚫 Từ chối mua` (TC-211.05).
   - *Ghi chú phạm vi kiểm thử*: TC-211.06, TC-211.07, TC-211.08 assert theo `data-testid` để bảo vệ hợp đồng hành vi (`onClose` được gọi dứt khoát) thay vì trói buộc chuỗi text hiển thị cụ thể của 3 nút đóng phụ, giúp tách bạch ranh giới giữa kiểm thử chức năng và copy-writing.
2. **Đổi Đất Bot (`bot_trade_offer_modal.tsx` - 284 LOC)**:
   - Tách biệt cảnh báo thiếu tiền mặt bù giao dịch ra thẻ riêng `data-testid="trade-shortfall-notice"`.
   - Nút `✓ ĐỒNG Ý ĐỔI` bảo toàn định danh ở trạng thái disabled mờ khi thiếu tiền.
   - Nút từ chối mang phong cách hồng phấn `bg-rose-50 border-rose-300 text-rose-700`, touch target min-h-[46px].

---

## 3. KIỂM THỬ & CHỈ SỐ HOÀN TẤT
- **Contract Test Suite**: `tests/contracts/imp211_auction_and_bot_trade_clean_affordance.test.ts` — **16/16 atomic tests PASS 100%**.
- **Adversarial Inversion**: Trạm 1 chứng minh RED (12 failed / 4 passed), Trạm 2 chuyển GREEN 16/16.
- **Specification Evolution**: Reconcile sạch 108 tests (`auction_modal.test.ts`, `imp156`, `imp138`, `imp196`, `imp106`).
- **Linter & Typecheck**: `npm run lint:ui` (0 vi phạm), `npx tsc --noEmit` (0 lỗi).
- **Evidence Snapshot**: `.agents/evidence/imp211_snapshot.json` (`executed: true`).
