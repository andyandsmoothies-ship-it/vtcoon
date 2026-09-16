# BÁO CÁO CẢI TIẾN: IMP-78 — CHUẨN HÓA XÚC XẮC 1D6 & TRẢI NGHIỆM KHỚP LỆNH SÀN CHỨNG KHOÁN HOSE

> **Mã cải tiến**: IMP-78  
> **Lĩnh vực**: `[FSM]`, `[UI]`, `[NET]`, `[CRAFT]`  
> **Trạng thái**: 🟢 Hoàn Tất  
> **Ngày hoàn tất**: 15/09/2026  

---

## 1. TỔNG QUAN KẾT QUẢ
Đã giải quyết triệt để 4 khiếm khuyết trong trải nghiệm giao dịch Sàn HOSE (Ô 38):
1. **Khắc phục bẫy đóng modal sớm**: `apply_delta.ts` bảo vệ trạng thái xem kết quả qua cờ `isReviewingResult`, không còn bị delta chuyển pha đè bẹp sau 5ms.
2. **Đồng bộ xúc xắc chuẩn Server (SSOT)**: `Room` và `DeltaPayload` bổ sung cấu trúc `lastHoseResult: HoseResultInfo`. Loại bỏ hoàn toàn việc client tự sinh `Math.random()` lệch pha.
3. **Hoạt ảnh xúc xắc 1D6 xúc giác**: Xúc xắc 1D6 to rõ, quay nảy kịch tính trong 1 giây, hãm phanh mượt mà và dừng chuẩn xác ở mặt kết quả (1..6). Bảng tỷ lệ khớp lệnh kích hoạt viền sáng `ring-4 ring-amber-500` nổi bật ô kết quả.
4. **Nhật ký hoạt động minh bạch**: `activity_financial_tracker.ts` ghi nhận chi tiết: `📈 [HOSE] P1 đầu tư 500 Tr. ➔ Khớp lệnh Mặt 4 (+20%): Thu về 600 Tr. (Lãi +100 Tr.)`, triệt tiêu vĩnh viễn thông báo "tiền thưởng" mơ hồ.

---

## 2. KẾT QUẢ KIỂM ĐỊNH 3 TRẠM (PHYSICAL DISK VERIFICATION)
- **Trạm 1 (RED Contract Test)**:
  - Tệp: `tests/contracts/imp78_hose_dice_roll_ux.test.ts`.
  - 5/5 atomic contract tests trải qua Adversarial Inversion (chứng minh thất bại trước khi can thiệp code sản xuất).
- **Trạm 2 (GREEN Implementation)**:
  - 5/5 contract tests PASS 100%.
- **Trạm 3 (Verification & Quality Gates)**:
  - `npm run gate:quick`: 0 lỗi TypeScript (`tsc --noEmit`), 0 vi phạm UI Lint, 0 vi phạm trùng lặp (`jscpd`), 27/27 mô hình 3D đạt chuẩn ngân sách (1.11 MB / 2.5 MB).
  - `npm test`: **182/182 test files PASS (3.085/3.085 atomic test cases PASS 100%)**.
  - `npm run build`: Production bundle đóng gói thành công trong **9.97s** (Client 9.37s + SSR Server 603ms).

---

## 3. MÃ NGUỒN THAY ĐỔI
1. [`src/domain/room.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/room.ts): Thêm interface `HoseResultInfo` và trường `lastHoseResult` trong `Room`.
2. [`src/server/session_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/session_manager.ts): Bổ sung `lastHoseResult` vào `DeltaPayload`, ánh xạ qua `buildDeltaFromRoom` và `buildDeltaPayload`.
3. [`src/server/hose_actions.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/hose_actions.ts): Gán `room.lastHoseResult` và tăng `room.diceSeq` khi khớp lệnh.
4. [`src/client/store/game_store_types.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/game_store_types.ts): Mở rộng payload `hose` với `isReviewingResult`, `lastMultiplier`, `lastProfit`.
5. [`src/client/network/apply_delta.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/apply_delta.ts): Nhận `delta.lastHoseResult`, cập nhật payload và miễn trừ đóng modal sớm khi `isReviewingResult: true`.
6. [`src/client/network/activity_financial_tracker.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/activity_financial_tracker.ts): Trích xuất log giao dịch HOSE và chặn log tiền thưởng chung chung.
7. [`src/client/ui/modals/hose_modal.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/hose_modal.tsx): Hoạt ảnh xúc xắc 1D6 quay nảy 1s, highlight ô tỷ lệ trúng thưởng và nút bấm `[Tiếp Tục ➔]`.
8. [`src/client/ui/modals/modal_host.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/modal_host.tsx): Bỏ `Math.random()` cục bộ, truyền `isReviewingResult` và `onConfirm` vào `HoseModal`.
9. [`tests/contracts/imp78_hose_dice_roll_ux.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp78_hose_dice_roll_ux.test.ts): Bộ 5 test hợp đồng bảo vệ tính năng.
10. [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md): Ghi nhận Gotcha #105.
