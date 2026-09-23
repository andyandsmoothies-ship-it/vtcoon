# Báo Cáo Cải Tiến IMP-184: Khắc Phục Báo Động Ảo Lương GO & Sửa Lỗi Khóa Đấu Giá BĐS

## 1. Kết Quả Triển Khai
- **Mã Ticket**: IMP-184
- **Mục tiêu**: Khắc phục lỗi khóa đấu giá BĐS 1 giây (Auction Premature Timeout & Dual-Timer Desync), bảo đảm người chơi có đủ 20s đặt giá, chống treo CPU vòng lặp `while`, cô lập thực thể phá sản trong đấu giá, và triệt tiêu cảnh báo ảo `TREASURY_INVARIANT_VIOLATED` & `INVALID_POSITION_STEP` trên Hộp Đen Telemetry khi di chuyển x2.
- **Trạng thái**: **HOÀN TẤT & ĐÃ DUYỆT (STATION 1, 2, 3 ALL PASSED)**.

## 2. Thống Kê Thay Đổi Mã Nguồn
| Tệp Tin | Thao Tác | LOC Thay Đổi | Chức Năng |
| :--- | :---: | :---: | :--- |
| `src/server/room_bot_coordinator.ts` | CẬP NHẬT | +7 / 298 LOC | Trả về `finished: false` khi người chơi thật chưa pass; thêm ngắt an toàn chống treo CPU 100% |
| `src/server/network/turn_orchestrator.ts` | CẬP NHẬT | +3 / 396 LOC | Loại bỏ tham số 1000ms đè timer; dọn sạch `auctionSettleTimers` trong `clearRoom` |
| `src/server/auction_manager.ts` | CẬP NHẬT | +5 / 200 LOC | Đồng bộ `endTime = 20s`, anti-sniping +3s, lọc sạch `!p.bankrupt` trong `handleAuctionBid` |
| `src/client/telemetry/invariant_checker.ts` | CẬP NHẬT | +2 / 227 LOC | Chấp nhận bước đi x2 `(from + diceSum * 2) % 40` không báo vi phạm |
| `src/client/telemetry/telemetry_delta_hook.ts` | CẬP NHẬT | +9 / 390 LOC | Nhận diện bước đi x2, tính đúng lương GO +2.000 Tr, phân biệt ô 10 thăm tù tự do |
| `src/client/ui/modals/auction_modal.tsx` | CẬP NHẬT | 416 LOC | Mẫu số `timerPercent` động 20s, container `max-h-[90dvh]`, chống tràn mobile 360px |
| `tests/server/imp184_auction_human_window_and_telemetry_go.test.ts` | TẠO MỚI | 524 LOC | 17 kiểm thử hợp đồng đối kháng 4 phương diện |

## 3. Bằng Chứng Nghiệm Thu (Evidence & Quality Gates)
1. **Station 1 (RED Contract Test)**: `qa-tester` tạo 17 atomic tests và xác nhận trạng thái RED (10 RED / 7 GREEN) chứng minh chính xác các lỗi máy chủ và telemetry.
2. **Station 2 (GREEN Implementation)**: `implementer` hoàn thành mã nguồn, toàn bộ 17/17 tests pass 100%. Toàn bộ regression tests pass (23/23 in imp176, 38/38 in auction/foreclosure).
3. **Station 3 (Specification Review)**: `spec-reviewer` đã kiểm toán đĩa vật lý độc lập, xác nhận 100% tính toàn vẹn 10 business rules, 0 scope drift, APPROVED.
4. **Station 3 (2D UI Craft Review)**: `ui-craft-reviewer` phê duyệt APPROVED (disposition: ship, 0 vi phạm UI linter).
5. **Quality Gates Toàn Cục**:
   - `npm test`: Toàn bộ 17 contract tests pass.
   - `npx tsc --noEmit`: 0 lỗi TypeScript (Exit 0).
   - `npm run lint:ui`: 0 vi phạm (Exit 0).
6. **Domain Gotchas**: Ghi nhận Bất biến số 252 trong `docs/domain/gotchas.md`.
7. **Snapshot Bằng Chứng**: Ghi nhận tại `.agents/evidence/imp-184_snapshot.json`.
