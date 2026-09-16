# BÁO CÁO CẢI TIẾN: IMP-79 — ĐỒNG BỘ TRẢI NGHIỆM & XỬ LÝ TƯƠNG TÁC ĐẶC THÙ

> **Mã cải tiến**: IMP-79  
> **Lĩnh vực**: `[FSM]`, `[UI]`, `[NET]`, `[CRAFT]`  
> **Trạng thái**: 🟢 Hoàn Tất  
> **Ngày hoàn tất**: 15/09/2026  

---

## 1. TỔNG QUAN KẾT QUẢ
Đã rà soát và giải quyết triệt để 4 điểm bất cập trong trải nghiệm và tính toàn vẹn tương tác (tương tự bẫy Sàn HOSE):

1. **Thoát Kẹt Lượt & Bảo Lãnh Trạm Kiểm Toán (Ô 10)**:
   - Cập nhật [`ui_helpers.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/ui_helpers.ts): Khóa đổ xúc xắc khi `inAudit = true` nhưng mở khóa `isEndTurnDisabled = false` để người chơi kết thúc lượt khi đang chịu án giam giữ, xóa bỏ vĩnh viễn bẫy kẹt mềm (softlock).
   - Bổ sung nút `⚖️ Bảo Lãnh (500 Tr.) (Còn X lượt)` trên [`action_dock.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/action_dock.tsx), tự động disable khi số dư < 500 Tr., nối callback `onBailOut` gửi `{ type: 'INTENT_BAIL_OUT' }` lên Server WSS.

2. **Định Danh Nhật Ký Thẻ Sự Kiện (Phiếu Cơ Hội & Thị Trường)**:
   - Triển khai `detectEventCardActivities` trong [`activity_tracker.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/activity_tracker.ts): Ghi log chi tiết có biểu tượng `🎴 [Thị Trường]` và `⚡ [Cơ Hội]`, hiển thị tên thẻ và tác động kinh tế/dịch chuyển.
   - Tích hợp bộ đệm chống ghi trùng lặp thẻ giữa các sparse delta liên tiếp từ server.

3. **Vinh Danh Búa Gõ Đấu Giá (Auction Victory Fanfare & Log)**:
   - Khắc phục tình trạng đóng modal âm thầm khi kết thúc đấu giá: Trong [`activity_tracker.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/activity_tracker.ts), khi nhận `delta.auction === null`, đọc `lastAuctionBid` và phát sinh log búa gõ vinh danh người trúng thầu (`🔨 [Đấu Giá] Búa gõ thành công!`).
   - Mở rộng [`auction_modal.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/auction_modal.tsx) hỗ trợ cờ `isConcluded`, hiển thị banner fanfare chúc mừng người chiến thắng.

4. **Bóc Tách Phân Loại Ngữ Cảnh Tài Chính (Financial Context Disambiguation)**:
   - Cập nhật [`activity_financial_tracker.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/activity_financial_tracker.ts): Nhận diện người chơi nộp phí tại Ô 04 là `🏛️ ... đã nộp phí / nộp thuế ... (Lệ Phí Đăng Ký Đất Đai)` và nộp tiền tại Ô 10 là `⚖️ ... (Bảo Lãnh Kiểm Toán để rời Trạm)` thay vì thông báo chung chung "nộp phí / nộp thuế".

---

## 2. KẾT QUẢ KIỂM ĐỊNH 3 TRẠM (PHYSICAL DISK VERIFICATION)

- **Trạm 1 (RED Contract Test)**:
  - Tệp: [`tests/contracts/imp79_experience_consistency.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp79_experience_consistency.test.ts).
  - 18/18 atomic contract tests tuân thủ Atomic Test Mandate (1-4 asserts/test, không lặp loop bên trong `it()`).
  - Trải qua Adversarial Inversion (chứng minh 18/18 tests thất bại trước khi can thiệp code sản xuất).

- **Trạm 2 (GREEN Implementation)**:
  - Cài đặt tối thiểu, chính xác tại `src/**` đáp ứng 100% assertions mà không relaxation hay sửa sai đặc tả.
  - 18/18 contract tests chuyển trạng thái PASS (18ms).

- **Trạm 3 (Independent Review & Quality Gates)**:
  - Subagent `spec-reviewer` kiểm tra vật lý trên đĩa: Đạt 100% Spec Reconciliation, ký duyệt **APPROVED (SIGN-OFF)**.
  - `npm run gate:quick`: 0 lỗi TypeScript, 0 vi phạm UI lint, 0 vi phạm trùng lặp, ngân sách tài nguyên 3D đạt 1.11 MB / 2.5 MB.
  - `npm test`: **184/184 test suites PASS 100% (3.124/3.124 tests PASS)**.
  - `npm run build`: Đóng gói Production Bundle thành công.

---

## 3. MÃ NGUỒN THAY ĐỔI
1. [`src/client/store/game_store_types.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/game_store_types.ts): Bổ sung `isConcluded`, `winnerId`, `finalPrice` vào `ModalPayloadMap['auction']`.
2. [`src/client/network/activity_tracker.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/activity_tracker.ts): Bổ sung `detectEventCardActivities`, cập nhật `detectAuctionActivities` phát log búa gõ chiến thắng khi `delta.auction === null`.
3. [`src/client/network/activity_financial_tracker.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/activity_financial_tracker.ts): Bóc tách ngữ cảnh Lệ Phí Đất Đai Ô 04 và Bảo Lãnh Ô 10.
4. [`src/client/ui/ui_helpers.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/ui_helpers.ts): Bổ sung `inAudit` vào `ActionDockButtonStateParams`, khóa xúc xắc và cho phép kết thúc lượt.
5. [`src/client/ui/action_dock.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/action_dock.tsx): Nút `⚖️ Bảo Lãnh (500 Tr.) (Còn X lượt)` kích hoạt `onBailOut`.
6. [`src/client/ui/hud_container.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/hud_container.tsx): Nối callback `onBailOut` gửi intent `INTENT_BAIL_OUT`.
7. [`src/client/ui/modals/auction_modal.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/auction_modal.tsx): Hỗ trợ banner fanfare gõ búa thắng cuộc khi `isConcluded = true`.
8. [`tests/contracts/imp79_experience_consistency.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp79_experience_consistency.test.ts): 18 atomic contract tests bảo vệ tính năng.
9. [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md): Ghi nhận Gotcha #106.
