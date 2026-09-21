# [IMP-160 Report] Báo Cáo Nghiệm Thu: Triệt Tiêu Lỗi Kẹt Sàn Đấu Giá Ma & Rà Soát Toàn Diện Vòng Đời Trạng Thái Kinh Doanh

> **Mã Cải Tiến:** IMP-160  
> **Trạng Thái:** ĐÃ HOÀN THÀNH & NGHIỆM THU (UNANIMOUS SHIP)  
> **Kiểm Toán Viên:** Station 3 Spec Reviewer & Station 3 UI Craft Reviewer (Unanimous SHIP)  

## I. TỔNG KẾT KẾT QUẢ TRIỂN KHAI
1. **Server Settle Timer Độc Lập**:
   - Tách `auctionSettleTimers = new Map<string, { timer: NodeJS.Timeout; auctionKey: string }>()` trong `TurnOrchestrator`, không bị `clearRoom()` hủy nhầm.
   - Timer mang `auctionKey` đối soát chính xác trước khi dọn dẹp và phát delta `auction === null`.
2. **Dọn Dẹp Tàn Dư Khi Gieo Xúc Xắc Mới**:
   - `RoomManager.handleRollDice` tự động dọn sạch `lastAuctionResult` và `room.lastHoseResult = undefined`.
3. **Client Idempotent Projection**:
   - `apply_delta.ts`: Không mở lại sàn đấu giá đã kết luận khi game đã chuyển sang `WaitingRoll` hoặc lượt kế tiếp.
   - Khi modal đã đóng, các delta lặp lại không được tự ý mở lại.
4. **Triệt Tiêu Zombie UI**:
   - `AuctionModal`: Khi `isConcluded === true`, badge đổi sang `ĐÃ KẾT THÚC`, ẩn/disable cụm nút Bid và Auto-Bid, nút footer chuyển thành `Đóng / Xem Bàn Cờ` gọi trực tiếp `onClose()`.
5. **Gia Cố Sàn Chứng Khoán HOSE**:
   - `session_manager.ts` phát `lastHoseResult: room.lastHoseResult ?? null` để client dọn modal chứng khoán sạch sẽ.

## II. BẰNG CHỨNG KIỂM THỬ ĐỐI SOÁT
- `tests/server/imp160_ghost_auction_modal_and_lifecycle_hardening.test.ts`: **16/16 PASS (100%)**.
- Toàn bộ test suite: **5.826/5.826 tests PASS trên 285 files (100%)**.
- UI Linter: `npm run lint:ui` -> **0 vi phạm**.
- Tài liệu lưu vết: **Gotcha #217** trong `docs/domain/gotchas.md`.
