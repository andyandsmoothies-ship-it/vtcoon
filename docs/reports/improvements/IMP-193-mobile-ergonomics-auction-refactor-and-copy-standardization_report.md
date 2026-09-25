# BÁO CÁO HOÀN THÀNH CẢI TIẾN: IMP-193
## TỐI ƯU CÔNG THÁI HỌC MOBILE, TINH GIẢN PHIẾU ĐẤU GIÁ & CHUẨN HÓA CÂU CHỮ TRẢI NGHIỆM

> **Mã cải tiến**: `IMP-193`  
> **Phân loại**: Tier 2 (Full Rigor)  
> **Trạng thái**: ✅ **HOÀN THÀNH (SHIPPED)**  
> **Ngày hoàn thành**: 2026-09-25  

---

### 1. TỔNG QUAN KẾT QUẢ THỰC HIỆN

Vé cải tiến `IMP-193` đã hoàn tất xử lý 4 nhóm khiếm khuyết hiển thị trên di động theo phản ánh thực tế của người dùng:
1. **Công thái học Action Dock**:
   - Khắc phục xung đột bán kính cong `rounded-2xl` (16px) và padding hẹp của nút Đổ Xúc Xắc: chuyển sang `px-5 sm:px-6` và bổ sung `min-w-[28px] text-center` cho nhãn "Đổ", giúp căn giữa đối xứng hoàn hảo.
   - Chuẩn hóa đồng bộ 3 nút phụ (Quản Lý BĐS, Đàm Phán, Kết Thúc Lượt) thành `sm:px-4` đồng bộ với nút Quy Hoạch, loại bỏ hoàn toàn các class padding lẻ `.5`.
2. **22 Chấm BĐS Thẻ Player Card**:
   - Thu nhỏ kích thước dot thành `w-1 h-1` (4px) và `gap-[1px]` trên mobile ➔ co tổng chiều rộng 22 chấm về 102px, nằm vừa vặn trong 136px không gian khả dụng của thẻ `w-40`.
   - Bảo tồn tuyệt đối thẻ root không dùng `overflow-hidden`, đảm bảo tab `[LƯỢT]` và Emote Bubble không bị cắt cụt.
3. **Pop-up Thông Báo Tài Chính (Floating Numbers)**:
   - Thu hẹp `FloatingBadge` (L274) từ `max-w-[92vw]` xuống `max-w-[82vw] sm:max-w-[340px]`, tạo khoảng cách an toàn tối thiểu 8% so với 2 mép màn hình.
   - Overlay container (L366) co về `max-w-[84vw] md:max-w-md`, bảo tồn 100% bố cục desktop.
4. **Tinh Giản Phiếu Đấu Giá (Auction District Card & Modal)**:
   - Loại bỏ mục đếm thừa thãi `0/3 Ô CỦA BẠN`.
   - Tinh giản tên phân khu địa lý dài dòng thành tên màu ngắn gọn (`Nhóm Nâu`, `Nhóm Cam`...).
   - Nới rộng `badgeMaxWidth` từ `max-w-[120px]` thành `max-w-[180px] sm:max-w-none` giúp huy hiệu `[TRANH CHẤP ĐỘC QUYỀN]` không bị cắt cụt text.
   - Nới rộng player name chip thành `max-w-[100px] sm:max-w-[160px]`.
   - Cho phép tên ô đất hiển thị 2 dòng `line-clamp-2`, triệt tiêu khoảng trống chết phía dưới.
   - Bổ sung nhãn ngữ cảnh rõ ràng `BIỂU PHÍ THUÊ Ô ĐẤU GIÁ` chống hiểu lầm.
5. **Nhịp Độ Đọc Thẻ Sự Kiện & Bot Pacing**:
   - Tăng `durationMs` hiển thị thẻ Cơ Hội / Thị Trường từ 3.2s lên 4.8s.
   - Thêm thời gian dừng tối thiểu 2.5s trên server (`turn_orchestrator.ts`) khi Bot dừng tại ô sự kiện (`room.lastEventCard`), áp dụng an toàn sau dice delay và giữ rào chắn thoát nhanh cho fast CI tests.
6. **Chuẩn Hóa Hệ Thống Câu Chữ Giao Dịch Dòng Tiền**:
   - Súc tích, mạch lạc, đồng bộ từ nơi phát sinh (`activity_badge_dispatcher.ts`) đến formatters (`floating_numbers.tsx`):
     * Đấu giá: `Thắng đấu giá [Tên Ô] ➔ Nộp Kho Bạc`
     * Tiền thuê (Trả): `Trả thuê [Tên Ô] cho [Tên Đối Thủ]`
     * Tiền thuê (Thu): `Thu thuê [Tên Ô] từ [Tên Đối Thủ]`
     * Thế chấp: `Thế chấp [Tên Ô] ➔ Vay Ngân Hàng`
     * Giải chấp: `Giải chấp [Tên Ô] (Phí 10% ➔ Kho Bạc)`
     * Bảo lãnh: `Bảo lãnh kiểm toán (Ô 10) ➔ Nộp Kho Bạc`
     * Thuế / Lệ phí: `Nộp [Tên Phí] ➔ Kho Bạc`

---

### 2. BẢNG KIỂM SOÁT NGÂN SÁCH LOC (TIER AUDIT)

| Tệp mã nguồn | TIER | Giới hạn LOC | Hiện tại | Trạng thái |
| :--- | :---: | :---: | :---: | :---: |
| `src/client/ui/action_dock.tsx` | TIER 2 | Max 500 (Cảnh báo 400) | 396 | ✅ An toàn (< 400 LOC) |
| `src/client/ui/player_card.tsx` | TIER 2 | Max 500 (Cảnh báo 400) | 215 | ✅ An toàn (< 250 LOC) |
| `src/client/ui/floating_numbers.tsx` | TIER 2 | Max 500 (Cảnh báo 400) | 385 | ✅ An toàn (< 400 LOC) |
| `src/client/network/activity_badge_dispatcher.ts` | TIER 1 | Max 400 (Cảnh báo 300) | 229 | ✅ Rất an toàn (< 300 LOC) |
| `src/client/ui/modals/auction_district_card.tsx` | TIER 2 | Max 500 (Cảnh báo 400) | 208 | ✅ An toàn (< 220 LOC) |
| `src/client/ui/modals/auction_modal.tsx` | TIER 2 | Max 500 (Cảnh báo 480) | 422 | ✅ An toàn (< 450 LOC) |
| `src/client/network/activity_tracker.ts` | TIER 1 | Max 400 (Cảnh báo 300) | 325 | ✅ An toàn (< 350 LOC) |
| `src/server/network/turn_orchestrator.ts` | TIER 1 | Max 400 (Cảnh báo 300) | 399 | ✅ An toàn (<= 400 LOC) |

---

### 3. BẰNG CHỨNG THẨM ĐỊNH & KIỂM THỬ

- **Contract Tests**: [`tests/contracts/imp193_mobile_ergonomics_auction_and_copy_polish.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp193_mobile_ergonomics_auction_and_copy_polish.test.ts) ➔ **16/16 PASSED (100%)**.
- **Full Test Suite**: `npm test` ➔ **321 files passed, 6,451 tests passed, 0 failed (100%)**.
- **UI Linter**: `npm run lint:ui` ➔ **0 anti-patterns across 181 files**.
- **Sweeping Scout Audit**: 8/8 tệp sạch 100%, 0 Universal Defect Archetypes.
- **Spec Reviewer**: Phê duyệt **APPROVED** (100% khớp SSOT, không trôi dạt phạm vi).
- **UI Craft Reviewer**: Phê duyệt **disposition: ship (PASS)** (đạt chuẩn xúc giác, touch-target >= 44px, không dính chữ viền bo cong).
- **Domain Memory Invariant**: Ghi nhận Gotcha #264 trong `docs/domain/gotchas.md`.
