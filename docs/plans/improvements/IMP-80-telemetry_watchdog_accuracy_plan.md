# [IMP-80] Kế Hoạch Chuẩn Hóa Telemetry Watchdog & Triệt Tiêu Báo Động Giả (Telemetry Accuracy & Invariant Polish)

- **ID**: IMP-80
- **Lĩnh vực**: `[TELEMETRY]`, `[FSM]`, `[NET]`, `[UI]`
- **Mục tiêu**: Triệt tiêu 100% các báo động giả (False-Positives) của Telemetry Watchdog khi vượt ô GO, nộp bảo lãnh kiểm toán, thắng đấu giá BĐS và chuyển tab trình duyệt.

---

## 1. PHẠM VI CÔNG VIỆC

1. **Chuẩn hóa tính toán khi vượt ô GO (GO Property Tax & Treasury Invariant)**:
   - Khi người chơi vượt GO, ngân hàng phát 2.000 Tr. Dù người chơi bị trừ thuế BĐS (ví dụ 600 Tr.), khoản thuế này nộp vào Kho Bạc (`postTreasury - preTreasury`).
   - Tổng tài chính toàn phòng (`Players + Treasury`) tăng đúng `+2000 Tr.` (nếu treasury cập nhật) hoặc `2000 - tax` (nếu treasury chưa cập nhật).
   - `computeExpectedDelta` tính toán trọn vẹn cả phần người chơi nhận và phần kho bạc hấp thụ.

2. **Chuẩn hóa nộp bảo lãnh Trạm Kiểm Toán (Audit Bailout Invariant)**:
   - Khi người chơi nộp 500 Tr. bảo lãnh rời Trạm (`INTENT_BAIL_OUT`), tiền từ ví chuyển thẳng vào Kho Bạc (`room.treasury += 500`).
   - Tổng tài sản toàn hệ thống thay đổi `0 Tr.`. `computeAuditBailDelta` không trừ 500 Tr. khi Kho Bạc đã hấp thụ khoản tiền này.

3. **Chuẩn hóa giá trị trúng đấu giá (Auction Winning Bid Recognition)**:
   - Khi nhận delta gán quyền sở hữu ô đất từ đấu giá, `computeCellDelta` ưu tiên đọc giá trúng thầu thực tế (`lastAuctionBid.currentBid`) trước khi fallback về giá gốc `deed.price`.

4. **Bảo vệ vòng lặp render khi chuyển Tab (Background Tab Throttling Protection)**:
   - Trong `game_canvas.tsx`, tạm dừng đo thời gian kẹt hoạt ảnh khi `document.hidden === true` để triệt tiêu cảnh báo giả `FSM_ANIMATION_STALLED`.

---

## 2. QUY TRÌNH 3 TRẠM (MANDATORY 3-STATION PIPELINE)

- **Trạm 1 (RED)**: Viết >= 15 atomic contract tests tại `tests/contracts/imp80_telemetry_watchdog_accuracy.test.ts`, bao quát 4 phân hệ (Universal 4-Facet Behavioral Matrix) và chứng minh thất bại trước khi can thiệp mã nguồn.
- **Trạm 2 (GREEN)**: Triển khai mã nguồn tối thiểu tại `src/client/telemetry/` và `src/client/game_canvas.tsx` để 100% tests PASS.
- **Trạm 3 (REVIEW)**: Đánh giá độc lập bằng `spec-reviewer`, xác nhận kiểm toán tĩnh 0 lỗi và nghiệm thu thực tế.
