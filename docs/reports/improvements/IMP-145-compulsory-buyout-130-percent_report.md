# Báo Cáo Nghiệm Thu Cải Tiến Kỹ Thuật: [IMP-145]

## Quyền Ưu Tiên Mua Lại Dự Án C0 (Compulsory Buyout Đền Bù 130% & Quyền Tự Quyết)

> **Mã Cải Tiến**: `IMP-145`  
> **Trạng Thái**: 🟢 **Hoàn Tất Nghiệm Thu (Trạm 3 Verified & Signed Off)**  
> **Traceability**: `[TC-145.01..16]`, `[UC-IMP145]`, `tests/contracts/imp145_compulsory_buyout.test.ts`, Gotcha #193  
> **Căn Cứ SSOT**: [`docs/domain/chance_card_handlers.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/chance_card_handlers.ts), [`docs/master_roadmap.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/master_roadmap.md)  

---

## 1. TỔNG QUAN VẤN ĐỀ & BƯỚC ĐỘT PHÁ

Trước cải tiến IMP-145, thẻ bài `CC_SWAP_PROJECT` ("Quyền Ưu Tiên Hoán Đổi Dự Án") mắc phải 4 nghịch lý thiết kế game gây ức chế lớn cho người chơi:
1. **Tráo đổi đất ngang phi lý**: Ô đất Cần Thơ 600 Tr. bị ép đổi lấy ô Nguyễn Huệ 4.000 Tr. mà không có tiền bù trừ chênh lệch.
2. **Tự động tráo ngầm tước đoạt quyền tự quyết**: Người chơi rút thẻ hoặc bị Bot nhắm tới đều không được hỏi ý kiến, tự động bị mất đất vào tay đối thủ.
3. **Phá vỡ thế trận độc quyền**: Cơ chế cũ có thể cướp mất ô đất độc quyền của người chơi đã dày công tích lũy.

### Đột Phá Triển Khai Theo Phương Án 2 (Được Người Dùng Duyệt):
- **Đổi tên & Bản chất**: Chuyển thành **"Quyền Ưu Tiên Mua Lại Dự Án"** (Compulsory Project Buyout).
- **Đền bù tiền mặt $130\%$**: Người mua chi trả đúng $130\%$ giá gốc bằng tiền mặt vào tài khoản chủ cũ (chủ cũ nhận lãi $+30\%$).
- **Quyền tự quyết của Người chơi**: Khi Người chơi rút thẻ và đủ tiền, hệ thống mở hộp thoại `CompulsoryBuyoutModal` (15s) để người chơi tự do lựa chọn **[💰 MUA LẠI]** hoặc **[✕ BỎ QUA]**.
- **Miễn trừ độc quyền tuyệt đối (`Strict Monopoly Immunity`)**: Tuyệt đối không cho phép mua lại ô đất thuộc nhóm màu đối thủ đã độc quyền trọn bộ (kể cả khi có ô đang thế chấp).
- **Bảo vệ ngân sách an toàn**: Nếu không đủ tiền mặt $\ge 130\%$, tự động nhận trợ cấp $+800$ Tr. từ Kho Bạc (không bao giờ bị ép mua âm tiền).

---

## 2. BẢNG ĐỐI SOÁT MÃ NGUỒN VẬT LÝ

| Tệp Mã Nguồn | Thay Đổi Thực Tế | Chỉ Số LOC | Trạng Thái Linter / Test |
| :--- | :--- | :---: | :---: |
| [`src/domain/compulsory_buyout.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/compulsory_buyout.ts) | Định nghĩa `calculateCompulsoryBuyoutCost` và `isEligibleForCompulsoryBuyout` (miễn trừ độc quyền không truyền stateMap) | +40 LOC | Clean |
| [`src/domain/chance_card_handlers.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/chance_card_handlers.ts) | Tái cấu trúc `handleSwapProject`: Lọc ô C0 hợp lệ, tạo `pendingBuyout` cho người thật, mua đền bù 130% cho Bot, trợ cấp Kho Bạc | +65 LOC | Clean |
| [`src/domain/room.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/room.ts) | Bổ sung `PendingBuyoutSession` và trường `pendingBuyout` vào `Room` | +20 LOC | Clean |
| [`src/server/room_property_coordinator.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_property_coordinator.ts) | `coordExecuteCompulsoryBuyout`, `coordDeclineCompulsoryBuyout` | +95 LOC | Clean |
| [`src/server/room_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts) | Cung cấp `hasPendingBuyout`, `checkPendingBuyoutTimeout` (15s) | +40 LOC | Clean |
| [`src/server/room_bot_coordinator.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_bot_coordinator.ts) | Khóa tiến trình Bot trong 15s chờ phản hồi `pendingBuyout` | +15 LOC | Clean |
| [`src/client/ui/modals/compulsory_buyout_modal.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/compulsory_buyout_modal.tsx) | Hộp thoại RetroPoly xúc giác, đếm ngược 15s, nút WCAG AA $\ge 44$px | +140 LOC | Clean (0 anti-patterns) |
| [`src/client/ui/modals/modal_host.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/modal_host.tsx) | Tự động mount `CompulsoryBuyoutModal` khi có `pendingBuyout` | +15 LOC | Clean |
| [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md) | Ghi nhận bài học miền Gotcha #193 | +32 lines | SSOT Synced |

---

## 3. BẰNG CHỨNG KIỂM MINH QUY TRÌNH 3 TRẠM

- **Trạm 1 (RED Contract)**: `tests/contracts/imp145_compulsory_buyout.test.ts` đạt 16/16 tests Business RED.
- **Trạm 2 (GREEN Implementation)**:
  - 16/16 contract tests PASS 100%.
  - 266/266 test suites toàn dự án PASS 100% (**5.478/5.478 tests PASS**).
  - TypeScript strict `npx tsc --noEmit`: 0 lỗi.
  - UI Craft linter `npm run lint:ui`: 0 vi phạm trên 165 files.
- **Trạm 3 (Independent Reviews)**:
  - `spec-reviewer`: **APPROVED** (100% Spec Reconciliation, bảo toàn bất biến độc quyền).
  - `ui-craft-reviewer`: **DISPOSITION SHIP** (0 vi phạm Impeccable, touch targets 44px, đồng hồ 15s khẩn cấp).
