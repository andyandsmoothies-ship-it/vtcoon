# Kế Hoạch Cải Tiến IMP-155 (B): Điều Hòa Nhịp Độ Hành Động Bot AI, Đấu Giá Trực Tiếp Từng Bước & Banner / Toast Minh Bạch Kết Quả Đấu Giá

> **Mã Cải Tiến:** IMP-155 (B)  
> **Tài Liệu Kế Hoạch Gốc:** [`implementation_plan.md`](file:///C:/Users/HP/.gemini/antigravity/brain/9712aca6-8125-42ae-b3ce-05d065c3f4e0/implementation_plan.md)  
> **Báo Cáo Kiểm Toán Đối Kháng:** [`.agents/audit/PLAN_AUDIT_IMP-155.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-155.md)  
> **Căn Cứ Phản Hồi:**  
> - "giữ mức 50% nhưng hành động của bot cần chậm lại để người chơi theo dõi được từng bot đang làm gì"  
> - "đồng ý bổ sung banner / toast"  
> - "hiện tại các hành động của riêng bot đang diễn ra quá nhanh, trừ việc con cờ chạy"  

---

## 1. MỤC TIÊU CỐT LÕI
1. **Bảo tồn giá khởi điểm 50%**: Giữ nguyên `startingBid = Math.floor(deed.price * 0.50)`.
2. **Đấu giá trực tiếp từng bước (Step-by-Step Live Auction Pacing)**:
   - Xóa bỏ vòng lặp đồng bộ `while` 0ms của bot trong `room_bot_coordinator.ts`.
   - Triển khai `stepAuctionBot(roomManager, roomCode)`: mỗi bot suy xét và ra quyết định riêng biệt trong từng nhịp, phát broadcast delta để client hiển thị bước nhảy giá thời gian thực.
3. **Minh bạch kết quả đấu giá & Khắc phục đóng Modal câm lặng**:
   - Bổ sung `isConcluded`, `winnerId`, `finalPrice` vào `AuctionPayload` và `DeltaPayload`.
   - `RoomManager` lưu `lastAuctionResults` để phát delta kết luận trước khi set `delta.auction = null`.
   - `apply_delta.ts` không đóng modal khi `isConcluded === true`, giữ lại 2.5s cho `AuctionModal` hiển thị banner búa gõ trước khi đóng.
   - `TurnOrchestrator` đệm `AUCTION_SETTLE_DELAY_MS = 2500ms` trước khi chuyển lượt, tránh bot tiếp theo chạy ngầm khi người chơi đang xem kết quả.
4. **Phân nhánh kết luận & Tránh lỗi phản cảm "Chưa có ai trúng"**:
   - Khi có người thắng: Hiển thị banner **BÚA GÕ THÀNH CÔNG** màu hổ phách.
   - Khi tất cả bot/người chơi cùng pass: Hiển thị banner **ĐẤU GIÁ BẤT THÀNH** màu xám cảnh báo, chuyển sang phát mãi Kho Bạc 70%.
5. **Khắc phục Z-Index & Gia hạn phiên đấu giá**:
   - Nâng `MilestoneBanner` container lên `z-[60]` để nổi trên `ModalBackdrop` (`z-50`).
   - Tự động gia hạn `session.endTime = Date.now() + 10_000` sau mỗi lệnh bid/pass hợp lệ, chống lỗi `AUCTION_EXPIRED`.
6. **Điều hòa nhịp độ hành động Bot**:
   - Bổ sung đệm thời gian và hiển thị trạng thái bot rõ ràng qua `bot-pacing-chip`.
