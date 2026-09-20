# [IMP-138] Báo Cáo Nghiệm Thu: Thẻ Tình Báo Phân Khu & Cục Diện Độc Quyền Sàn Đấu Giá (Auction District Intelligence & Monopoly Radar)

> **Mã Cải Tiến**: `IMP-138`  
> **Trạng Thái**: 🟢 **Hoàn Tất & Phê Duyệt Xuất Xưởng (SHIP)**  
> **Phán Quyết Reviewer**:  
> - `spec-reviewer`: **APPROVED (100% SPEC RECONCILIATION - FIX ROUND VERIFIED)**  
> - `ui-craft-reviewer`: **DISPOSITION: SHIP (0 ANTI-PATTERNS, WCAG AAA CONTRAST, ZERO GRAY-ON-COLOR)**  
> **Traceability**: `[UC-GAME-022]`, `[TC-IMP138.01..TC-IMP138.27]`, Gotcha #182  

---

## 1. Tóm Tắt Kết Quả Triển Khai
Nhằm giải quyết triệt để phản hồi của người chơi về việc sàn đấu giá (`AuctionModal`) thiếu trầm trọng ngữ cảnh chiến lược của ô đất (không biết ô đất thuộc bộ nào, ai đã mua các ô lân cận, bản thân mình hay đối thủ đã gom được bao nhiêu ô, tiền thuê thế nào...), gói cải tiến IMP-138 đã triển khai toàn diện qua Quy trình 3 Trạm:

1. **Thẻ Tình Báo Phân Khu Xúc Giác (`AuctionDistrictCard`)**:
   - Được nhúng ngay dưới khối tiêu đề BĐS với thuộc tính `data-testid="auction-district-intelligence"`.
   - Hiển thị tên phân khu cùng dải màu nhận diện chính xác từ `DISTRICT_GROUPS` (8 bộ màu, Ga Tàu và Tiện Ích).
   - Chỉ số tổng hợp: Tổng số ô đất trong phân khu, số ô bạn đang sở hữu và số ô đối thủ dẫn đầu đang nắm giữ.

2. **Lưới Chip Trạng Thái Từng Ô Đất (`district-cell-chip-{cellIndex}`)**:
   - `🔨 ĐANG ĐẤU`: Huy hiệu vàng cam nổi bật `bg-amber-400 font-black border-amber-600` đánh dấu chính xác ô đất đang gõ búa.
   - `✓ Bạn`: Nền xanh ngọc emerald `bg-emerald-100 text-emerald-900 font-bold` kèm cấp công trình hiện tại (C0..C3).
   - `👤 Đối thủ`: Tên đối thủ sở hữu nền hồng/đỏ `bg-rose-100 text-rose-900` kèm cấp công trình.
   - `⚪ Trống`: Ô đất chưa ai mua với viền nét đứt thanh lịch `border-dashed border-slate-300 bg-white/90`.

3. **Banner Mách Nước Chiến Lược Động (`data-testid="auction-strategic-hint"`)**:
   - `👑 CƠ HỘI ĐỘC QUYỀN` (tone `emerald`): Khi bạn đã có $N-1$ ô, cảnh báo cơ hội vàng để mở khóa x2 tiền thuê và quyền xây dựng.
   - `🚨 CHẶN ĐỐI THỦ` (tone `rose`): Khi có đối thủ đã có $N-1$ ô, báo động đỏ nguy cơ đối thủ độc quyền nếu thắng phiên đấu giá.
   - `🚩 KHAI MỞ PHÂN KHU` (tone `blue`): Khi phân khu còn nguyên vẹn chưa ai sở hữu.
   - `⚔️ TRANH CHẤP CHIẾN LƯỢC` (tone `amber`): Khi phân khu bị phân mảnh giữa nhiều người chơi.
   - `🚂 MẠNG LƯỚI ĐƯỜNG SẮT` / `⚡ TIỆN ÍCH NĂNG LƯỢNG`: Chuyên biệt cho 4 ga tàu và 2 trạm điện nước.

4. **Thanh Tiền Thuê Mini Phân Nhánh (Mini Rent Bar)**:
   - BĐS thường: Thể hiện 3 mốc thu nhập then chốt: `C0 (ĐẤT)`, `2x (ĐỘC QUYỀN)` và `C3 (KHÁCH SẠN)`.
   - Ga tàu: Bảng cước phí 4 bậc rõ ràng: `500 / 1.000 / 2.000 / 4.000 Tr.`.
   - Tiện ích: Cước phí theo xúc xắc chuẩn SSOT: `Điểm xúc xắc x40 Tr. (1 ô) | x100 Tr. (2 ô)`.

5. **Thiết Kế Chống Tràn Mobile & Tối Ưu Tương Phản 2D**:
   - Khung `AuctionModal` bổ sung `max-h-[90vh] overflow-y-auto pr-1`, bảo đảm các nút đặt giá và nút rút lui không bao giờ bị trôi khỏi màn hình di động (< 667px).
   - Triệt tiêu hoàn toàn lỗi gray-on-color: nút đặt giá và auto-bid chuyển sang `text-amber-950 font-black`, thẻ gợi ý thừa kế trực tiếp bảng màu sắc độ từ container.

---

## 2. Minh Chứng Đo Lường Vật Lý & Kiểm Thử
- **Unit & Contract Tests**:
  - `tests/client/imp138_auction_district_intelligence.test.ts`: **27/27 atomic tests GREEN 100%**.
  - `tests/client/auction_modal.test.ts`: **8/8 tests GREEN 100%**.
- **Adversarial Inversion**: Đã kiểm minh đảo ngược logic `my_monopoly` khiến test lập tức báo RED và hồi phục GREEN khi hoàn tác.
- **Static Quality & Type Safety**:
  - `npm run lint:ui`: **0 Anti-patterns detected across 159 files**.
  - `npx tsc --noEmit`: **0 errors**.
- **Active Memory**:
  - Đã đúc kết và ghi nhận Gotcha #182 vào `docs/domain/gotchas.md`.
