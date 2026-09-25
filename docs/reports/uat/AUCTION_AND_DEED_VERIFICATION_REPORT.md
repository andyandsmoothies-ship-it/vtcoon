# 📸 BÁO CÁO NGHIỆM THU THỊ GIÁC — SÀN ĐẤU GIÁ & SỔ ĐỎ DI ĐỘNG (MOBILE 390x844)

> **Môi trường chụp nghiệm thu**: Microsoft Edge CDP Headless, Viewport di động chuẩn iPhone 390x844, DeviceScaleFactor = 2, Chất lượng ảnh JPEG Q90.
> **Thời điểm nghiệm thu**: 2026-09-25T21:40:00+07:00.

---

## 1. So Sánh Trước & Sau: Sàn Đấu Giá Trực Tuyến Khi Đã Rút Lui

| Trước Khi Sửa (Ảnh thực tế của bạn) | Sau Khi Sửa (Ảnh nghiệm thu vật lý) |
| :---: | :---: |
| ❌ Dòng "DẪN ĐẦU:" bị mép footer cắt ngang<br>❌ 100% "ĐẠI GIA THAM GIA" bị che lấp<br>❌ Huy hiệu bị cụt: `TRANH CHẤP CHIẾ...`<br>❌ Chân trang: nút `[Đã Rút Lui]` bị disabled chết | ✅ Bục giá `2.250 Tr.` + "DẪN ĐẦU" nổi hoàn toàn trên nếp gấp<br>✅ "ĐẠI GIA THAM GIA" hiển thị trọn vẹn 3 người chơi<br>✅ Huy hiệu tinh giản vừa vặn: `⚔️ TRANH CHẤP`<br>✅ Chân trang: nút `[Đã Rút Lui • Đóng]` vàng nổi bật, bấm đóng ngay |

---

## 2. Ảnh Nghiệm Thu Chi Tiết

### Ảnh 1: Sàn Đấu Giá — Trạng Thái Đã Rút Lui (`hasPassed: true`)
- **Đường dẫn**: [`auction_modal_withdrawn_verified.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/uat/screenshots/imp193/auction_modal_withdrawn_verified.jpg)
- **Kiểm tra công thái học**:
  - `Hero Header`: [Bình Định (Quy Nhơn) - 1.800 Tr.] hiển thị cố định trên đỉnh, không bị trôi khi cuộn.
  - `Bục Đấu Giá`: Đưa lên vị trí ưu tiên số 1, hiển thị rõ ràng [Thời gian: 18 GIÂY], [Giá: 2.250 Tr.], [Dẫn đầu: Tỷ Phú Hà Thành].
  - `Tình Báo Phân Khu & Biểu Phí Thuê`: [Nhóm Cam - ⚔️ TRANH CHẤP] + [C0: 180 Tr., 2x: 360 Tr., C3: 4.500 Tr.] lọt trọn trong màn hình nhìn (Above-the-fold) ngay dưới bục đấu giá!
  - `Đại Gia Tham Gia`: Danh sách người chơi hiển thị phía dưới bục và khu đất, có thể cuộn độc lập mượt mà.
  - `Nút Thoát Ngón Cái`: Nút vàng `Đã Rút Lui • Đóng` nổi bật, sẵn sàng đóng modal bằng một chạm giải phóng trạng thái dead-end.

### Ảnh 2: Sàn Đấu Giá — Trạng Thái Đang Đặt Giá Tích Cực (Zero-Scroll Tabletop)
- **Đường dẫn**: [`auction_modal_active_bidding_verified.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/uat/screenshots/imp193/auction_modal_active_bidding_verified.jpg)
- **Kiểm tra công thái học**:
  - **Zero-Scroll Tabletop**: Toàn bộ dữ liệu đưa ra quyết định đấu giá (Bục đấu giá 2.250 Tr., Thời gian 18s, Người dẫn đầu, Tình báo phân khu 3 ô đất, và Biểu phí thuê đất C0 / 2x / C3) cùng Cụm nút đặt giá (`+100 Tr.`, `+200 Tr.`, `+500 Tr.`, `AUTO-BID`, `Rút Lui`) hiển thị 100% TRỌN VẸN trên 1 màn hình nhìn (Above-the-fold) trên mobile 390px, người chơi không phải cuộn tay trong phiên đếm ngược!

### Ảnh 3: Trang Mua Đất / Sổ Đỏ — Cảng HKQT Long Thành (Hạ Tầng 4 Ga) [Zero-Scroll Tabletop]
- **Đường dẫn**: [`title_deed_modal_long_thanh_verified.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/uat/screenshots/imp193/title_deed_modal_long_thanh_verified.jpg)
- **Kiểm tra công thái học (Khắc phục triệt để lỗi cuộn lên cuộn xuống)**:
  - `Hero Media Row`: Ảnh 3D Diorama sân bay (`w-20 h-20`) đặt nằm ngang cạnh khối [Giá niêm yết: 2.000 Tr. | Giá trị thế chấp: 1.000 Tr.], tiết kiệm ngay 115px chiều cao.
  - `Purchase Decision Card`: Gom gọn dòng thanh khoản sau mua (`6.500 Tr. ➔ 4.500 Tr. [🟢 Dư Dả]`).
  - `Biểu Phí Theo Số Ga Sở Hữu`: Cả 4 cấp bậc ga (`1 Ga: 500 Tr.`, `2 Ga: 1.000 Tr.`, `3 Ga: 2.000 Tr.`, `4 Ga: 4.000 Tr.`) hiển thị đầy đủ, sắc nét, không bị che khuất một phần nào.
  - `Nút Hành Động`: Nằm trọn vẹn trên màn hình cùng toàn bộ thông tin trên, người chơi KHÔNG CẦN CUỘN TAY một pixel nào để ra quyết định mua.

### Ảnh 4: Trang Mua Đất / Sổ Đỏ — Đà Nẵng (Case Thực Tế Của Bạn Trên Desktop 1280x800) [Zero-Scroll 2 Cột]
- **Đường dẫn**: [`title_deed_modal_da_nang_desktop_verified.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/uat/screenshots/imp193/title_deed_modal_da_nang_desktop_verified.jpg)
- **Kiểm tra công thái học (Triệt tiêu 100% thanh cuộn trên Desktop)**:
  - `Bố cục 2 cột (md:grid md:grid-cols-2)`: Cột 1 chứa [Ảnh BĐS + Giá niêm yết + Thế chấp + Thẻ quy hoạch], Cột 2 chứa [Biểu phí dừng chân C0..C3].
  - Chiều cao modal chỉ còn ~380px, chiếm chưa tới 50% chiều cao màn hình desktop.
  - **Thanh cuộn xám biến mất hoàn toàn** (Zero Scrollbar), C3 Quần thể Resort/TTTM hiển thị nguyên vẹn kèm phí nâng cấp.

### Ảnh 5: Trang Mua Đất / Sổ Đỏ — Đà Nẵng (Mobile 390x844) [Zero-Scroll 1 Cột Tinh Gọn]
- **Đường dẫn**: [`title_deed_modal_da_nang_mobile_verified.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/uat/screenshots/imp193/title_deed_modal_da_nang_mobile_verified.jpg)
- **Kiểm tra công thái học**:
  - **Khắc phục triệt để lỗi ngắt dòng (Text-Wrapping)**: Tách dòng tiêu đề `Thanh khoản sau mua:` đi kèm huy hiệu `[🟢 Dư Dả]` (`whitespace-nowrap shrink-0`) riêng biệt với dòng số tiền `Ví: 6.500 Tr. ➔ Còn lại: 4.500 Tr.` dạng pill nền trắng dịu mắt.
  - Loại bỏ hoàn toàn hiện tượng chữ `mua:` hoặc `Tr.` bị rớt dòng đơn độc.
  - Cả 4 cấp bậc cước C0..C3 lọt 100% trong khung nhìn trên mobile mà không chạm đáy hay che lấp nút Mua/Bỏ Qua.

---

## 3. Bản Kê Linter & Test Suite
- `npm run lint:ui`: **0 anti-patterns** qua 184 files.
- `vitest run tests/client/auction_and_title_deed_mobile_ergonomics.test.ts`: **7/7 tests passed**.
- `vitest run tests/client/imp140_title_deed_ui_ux_and_preloading.test.ts`: **20/20 tests passed**.
- `vitest run tests/client/phase3_visual_polish.test.ts`: **21/21 tests passed**.
- `vitest run tests/client/property_purchase_decision.test.ts`: **16/16 tests passed**.
- `vitest run tests/client/auction_modal*.test.ts`: **100% contract tests passed**.



