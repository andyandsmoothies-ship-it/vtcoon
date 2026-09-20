# [IMP-138] Kế Hoạch Cải Tiến: Thẻ Tình Báo Phân Khu & Cục Diện Độc Quyền Sàn Đấu Giá

> **Mã Cải Tiến**: `IMP-138`  
> **Mức Độ**: 🟡 Client UI/UX & Tactical Monopoly Intelligence (0 Schema, 0 FSM, 0 Network Protocol)  
> **Traceability**: `[UC-GAME-022]`, `[TC-IMP138.01..TC-IMP138.27]`, Gotcha #182  
> **Trạng Thái**: 🟢 Hoàn Tất (Trạm 1 RED -> Trạm 2 GREEN -> Trạm 3 SHIP)

---

## 1. Mục Tiêu & Vấn Đề Người Dùng
- **Hiện trạng trước cải tiến**:
  - Khi tham gia phiên đấu giá (`AuctionModal`), người chơi chỉ được cung cấp thông tin tối thiểu: tên ô đất, giá khởi điểm và giá thầu hiện tại.
  - Người chơi hoàn toàn mù ngữ cảnh chiến lược:
    - Không biết ô đất đang đấu giá thuộc phân khu nào trong 8 bộ màu, Ga Tàu hay Tiện Ích.
    - Không biết bản thân mình đã nắm giữ ô nào trong phân khu đó chưa (tiềm năng độc quyền).
    - Không biết đối thủ nào đã gom các ô còn lại trong phân khu (nguy cơ đối thủ độc quyền nếu họ thắng đấu giá).
    - Không biết tiền thuê đất khi độc quyền (x2 tiền thuê đất) hoặc khi nâng cấp khách sạn sẽ đem lại lợi tức bao nhiêu để định giá thầu hợp lý.
- **Mục tiêu đạt được**:
  1. Tích hợp khối **Thẻ Tình Báo Phân Khu & Cục Diện Độc Quyền** (`AuctionDistrictCard`, `data-testid="auction-district-intelligence"`) vào ngay dưới tiêu đề BĐS của sàn đấu giá.
  2. **Lưới chip trạng thái từng ô**:
     - `🔨 ĐANG ĐẤU`: Ô đất hiện tại với huy hiệu vàng cam nổi bật.
     - `✓ Bạn`: Các ô người chơi đang sở hữu trong bộ kèm cấp công trình.
     - `👤 Đối thủ`: Tên đối thủ đang nắm giữ ô đất kèm cấp công trình.
     - `⚪ Trống`: Ô đất chưa ai sở hữu trên bàn cờ.
  3. **Banner Mách Nước Chiến Lược Động** (`data-testid="auction-strategic-hint"`):
     - `👑 CƠ HỘI ĐỘC QUYỀN` (tone `emerald`): Khi người chơi đã có $N-1$ ô, thắng phiên này sẽ hoàn tất trọn bộ màu.
     - `🚨 CHẶN ĐỐI THỦ` (tone `rose`): Khi có đối thủ đã có $N-1$ ô, cảnh báo nguy cơ bị đối thủ độc quyền.
     - `🚩 KHAI MỞ PHÂN KHU` (tone `blue`): Khi toàn bộ phân khu chưa ai sở hữu.
     - `⚔️ TRANH CHẤP CHIẾN LƯỢC` (tone `amber`): Khi phân khu bị phân mảnh sở hữu.
     - `🚂 MẠNG LƯỚI ĐƯỜNG SẮT` / `⚡ TIỆN ÍCH NĂNG LƯỢNG`: Chuyên biệt cho 4 ga tàu và 2 trạm điện nước.
  4. **Thanh tiền thuê mini (Mini Rent Bar)**:
     - BĐS thường: Tiền thuê C0, Độc Quyền (x2 C0), C3 (Khách Sạn).
     - Ga tàu: 4 bậc cước theo số lượng ga sở hữu `[500, 1000, 2000, 4000]` Tr.
     - Tiện ích: Cước phí theo xúc xắc `2D6 x 40` Tr. (1 trạm) hoặc `2D6 x 100` Tr. (2 trạm).
  5. **Chống tràn màn hình di động**: Thêm `max-h-[90vh] overflow-y-auto pr-1` trên `AuctionModal`, bảo đảm nút đặt giá và nút rút lui luôn trong tầm với của ngón tay cái.

---

## 2. Thiết Kế Kiến Trúc & Tách Lớp Module
1. `src/client/ui/modals/auction_intelligence.ts` [NEW]:
   - Hàm thuần tính toán logic `resolveAuctionDistrictInfo(params)`.
   - Bảo toàn trần độ phức tạp Cyclomatic <= 4, LOC <= 260.
   - Fallback an toàn: Trả về `null` cho các ô ngoài biên bàn cờ, ô phi tài sản (`PROPERTY_DEEDS` null), và xử lý an toàn khi `myId` là `undefined`.
2. `src/client/ui/modals/auction_district_card.tsx` [NEW]:
   - Component hiển thị xúc giác, 0 anti-patterns Impeccable.
   - Nhận props hoặc đọc dự phòng từ `useGameStore`.
   - Trả về `null` sạch sẽ khi `resolveAuctionDistrictInfo` là `null`.
3. `src/client/ui/modals/auction_modal.tsx` [MODIFY]:
   - Mount `<AuctionDistrictCard />` dưới khối tiêu đề BĐS.
   - Nhận props tùy chọn `playersInfo` và `levelMap` phục vụ cả headless contract test và runtime thực tế.
   - Bổ sung `max-h-[90vh] overflow-y-auto pr-1` và thứ tự `data-testid` trước `className`.
