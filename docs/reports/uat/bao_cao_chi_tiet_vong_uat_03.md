# BÁO CÁO CHI TIẾT VÒNG KIỂM THỬ UAT TỰ HÀNH #03
DỰ ÁN: CỜ TỶ PHÚ 3D VIỆT NAM (VTCOON)  
NGÀY THỰC HIỆN: 10/09/2026 | PHIÊN BẢN: CONTAINER PRODUCTION DOCKER

---

## I. THÔNG SỐ VÒNG THỬ NGHIỆM #03 (TRUNG CUỘC, SÀN HOSE & ĐẤU GIÁ)

- **Môi trường:** Docker Container Production (`vtcoon-vtcoon-1` Node.js port 3000/3001, `vtcoon-nginx-1` port 80/443).
- **Mục tiêu chính:** 
  1. Kiểm chứng nghiệm thu thực tế bản vá công thái học (UX Polish) cho Header Thẻ Bài Sổ Đỏ (UAT-03).
  2. Kiểm thử Sàn Đấu Giá Cưỡng Chế 15s trực tuyến, tính năng Đặt Giá Nhanh và cơ chế gia hạn chống bắn tỉa Anti-Sniping +3s (UAT-13).
  3. Kiểm thử Sàn Giao Dịch Chứng Khoán HOSE Ô 38: Bảng LED Ticker trực tuyến, bảng tỷ lệ khớp lệnh 1D6 3 màu và hoạt ảnh lắc xúc xắc (UAT-21, UAT-22).
  4. Kiểm thử Nâng Cấp Bất Động Sản từ Đất Nền C0 lên Quần thể Resort/TTTM Hoàng Kim C3 (UAT-17, UAT-18).
  5. Kiểm thử Quản Lý Danh Mục BĐS, Thế Chấp 50% tiền mặt và Giải Chấp chịu phí 10% (UAT-37, UAT-38).
- **Trình duyệt thực thi:** Microsoft Edge Chromium headless qua Chrome DevTools Protocol (CDP) port 9222.
- **Tình trạng mã nguồn:** 911/911 tests PASS 100%, `tsc --noEmit` 0 lỗi.

---

## II. TỔNG HỢP KẾT QUẢ VÒNG TEST #03

```
┌──────────────────────────────────────┬──────────────┬────────────┬──────────────────────────────────────┐
│ Kịch bản UAT                         │ Persona      │ Kết quả    │ Điểm & Cảm nhận thực tế              │
├──────────────────────────────────────┼──────────────┼────────────┼──────────────────────────────────────┤
│ UAT-03-VERIFY: Nghiệm thu Header Sổ Đỏ│ Cô Tư        │ HOÀN HẢO   │ 5/5 (Cách nút đóng 76px, 0 overlap) │
│ UAT-13: Đấu Giá Cưỡng Chế 15s        │ Chú Sáu      │ THÀNH CÔNG │ 5/5 (Đếm ngược, đặt giá nhanh mượt)  │
│ UAT-13-ANTI: Gia hạn Anti-Sniping    │ Chú Sáu      │ THÀNH CÔNG │ 5/5 (Tự động +3s khi bid ở 2s cuối)  │
│ UAT-21/22: Sàn Chứng Khoán HOSE      │ Chú Sáu      │ HOÀN HẢO   │ 5/5 (LED Ticker, nảy 1D6 khớp lệnh)  │
│ UAT-17/18: Nâng Cấp BĐS C0 ➔ C3      │ Cô Tư        │ THÀNH CÔNG │ 5/5 (Resort C3 sáng vàng, tự ẩn nút) │
│ UAT-37/38: Thế Chấp & Giải Chấp BĐS  │ Bác Ba       │ THÀNH CÔNG │ 5/5 (Cảnh báo đỏ, đổi nút chuẩn FSM) │
└──────────────────────────────────────┴──────────────┴────────────┴──────────────────────────────────────┘
```

- **Lỗi đỏ Console (Console Error):** **0 lỗi (100% sạch sẽ)**.
- **Lỗi bảo mật FSM / Intent Guard:** **Xác nhận 100%** (Máy chủ từ chối đặt giá khi phòng không ở `AuctionPhase` và hiển thị Toast đỏ cho người chơi, không nuốt lỗi).
- **Kiểm định Touch Target:** Nút đóng đạt chuẩn `48x48px` theo tiêu chuẩn WCAG accessibility.

---

## III. HÀNH TRÌNH KIỂM THỬ THỰC TẾ & MINH CHỨNG HÌNH ẢNH

```
[Khởi tạo Ván Đấu] ──► [Kiểm chứng Header Sổ Đỏ (Khoảng cách 76px)]
                             │
                             ▼
              [Sàn Đấu Giá Trực Tuyến 15s] ──► [Đặt Giá Nhanh + Anti-Sniping]
                             │
                             ▼
              [Sàn Chứng Khoán HOSE Ô 38] ──► [Lắc Xúc Xắc 1D6 Khớp Lệnh]
                             │
                             ▼
              [Nâng Cấp BĐS C0 ➔ C3 Resort] ──► [Thế Chấp 50% & Giải Chấp]
```

---

### 1. [UAT-03-VERIFY] Kiểm chứng Header Thẻ Bài Sổ Đỏ & Nút Đóng (X)
- **Vấn đề tồn đọng từ Vòng #02:** Tiêu đề địa danh dài bị đè nhẹ lên nút đóng tròn `(X)`.
- **Thao tác đo đạc vật lý (DOM Bounding Box Analysis via CDP):**
  - Mở Sổ Đỏ ô địa danh.
  - Tọa độ nút đóng `(X)`: `x = 791px, y = 225.7px, width = 48px, height = 48px`.
  - Độ rộng hộp tiêu đề `<h2>`: `width = 310px` (đã được neo giới hạn `max-w-[310px] mx-auto`).
  - Khoảng cách an toàn giữa lề phải tiêu đề và lề trái nút đóng: **+76 pixels (DƯƠNG)**.
  - Tỷ lệ đè lấn: **`isOverlap = false` (HOÀN TOÀN TÁCH RỜI)**.
- **Minh chứng:** `r3_01_title_deed_header_fix.png`.

---

### 2. [UAT-13] Sàn Đấu Giá Cưỡng Chế 15s Trực Tuyến & Anti-Sniping
- **Thao tác:** Kích hoạt phiên đấu giá trực tuyến cho BĐS:
  - Giá khởi điểm: `500 Tr. VNĐ` | Người dẫn đầu ban đầu: `Bot-1`.
  - Đồng hồ đếm ngược: `15s` kèm thanh tiến trình vàng chuyển cam/đỏ.
- **Trải nghiệm thực tế:**
  - Khay 3 nút Đặt Giá Nhanh hiển thị rõ ràng: `+50 Tr. (550 Tr.)`, `+100 Tr. (600 Tr.)`, `+200 Tr. (700 Tr.)`.
  - Người chơi bấm `+100 Tr.` ➔ Giá thầu lập tức nhảy lên `600 Tr. VNĐ`.
  - Huy hiệu dẫn đầu chuyển sang màu ngọc bích: **"✓ Bạn đang dẫn đầu mức giá!"**.
- **Kiểm thử Anti-Sniping:**
  - Đồng hồ đếm ngược trôi về `2s` cuối (thời điểm các bot/sniper hay nhảy vào ép giá).
  - Người chơi đặt giá thầu ➔ Hệ thống kích hoạt quy tắc Anti-Sniping, thời gian lập tức được cộng thêm **+3 giây** để đảm bảo tính công bằng.
- **Minh chứng:**
  - Mở sàn đấu giá: `r3_02_auction_modal_active.png`.
  - Đặt giá thầu dẫn đầu: `r3_02_auction_bid_placed.png`.
  - Kích hoạt Anti-Sniping: `r3_02_auction_anti_sniping.png`.

---

### 3. [UAT-21/22] Sàn Giao Dịch Chứng Khoán HOSE Ô 38 (1D6 Lướt Sóng)
- **Thao tác:** Dừng chân tại Sàn Giao Dịch Chứng Khoán HOSE Ô 38.
- **Giao diện bảng điện tử LED:**
  - Ticker trên cùng chạy dải thông tin thị trường thực: `VN-INDEX 1,288.6 ▲ +15.2 | VN30: 1,320.5 ▲ | HOSE LIVE`.
  - Bảng tỷ lệ khớp lệnh 1D6 phân chia 3 dải màu rõ rệt:
    * Mặt 1 (0.50x, Giảm sàn -50%): Viền đỏ Rose.
    * Mặt 2 (0.75x, Giảm -25%): Viền đỏ Rose.
    * Mặt 3 (1.00x, Tham chiếu Hoà): Viền vàng Amber.
    * Mặt 4 (1.20x, Tăng +20%): Viền xanh Emerald.
    * Mặt 5 (1.50x, Tăng +50%): Viền xanh Emerald.
    * Mặt 6 (2.00x, Tăng trần +100%): Viền xanh Emerald rực rỡ.
- **Thao tác đầu tư:**
  - Người chơi chọn hạn mức cược: `1.000 Tr. VNĐ`.
  - Bấm nút 3D: **"Đặt Cược 1.000 Tr."**.
  - Âm thanh chuông sàn vang lên, xúc xắc 1D6 nảy liên tục 6 nhịp khớp lệnh.
  - Kết quả: Xúc xắc dừng ở **Mặt 6** ➔ Thu về **2.000 Tr. VNĐ** (+100% lợi nhuận), huy hiệu **"KHỚP LỆNH LÃI"** phát sáng rực rỡ, ô Mặt 6 viền hào quang vàng.
- **Minh chứng:**
  - Giao diện sàn HOSE: `r3_03_hose_modal_opened.png`.
  - Kết quả khớp lệnh lãi mặt 6: `r3_03_hose_trading_rolling.png`.

---

### 4. [UAT-17/18] Nâng Cấp Bất Động Sản C0 ➔ C1 ➔ C2 ➔ C3 (Resort Hoàng Kim)
- **Thao tác:** Người chơi sở hữu khu đất Cần Thơ / Bình Dương và tiến hành nâng cấp.
- **Diễn biến FSM:**
  - **Cấp C0 (Đất Nền):** Nút **"Nâng Cấp (+300 Tr.)"** màu xanh ngọc xuất hiện nổi bật.
  - **Nâng cấp lên C3 (Resort / TTTM Hoàng Kim):**
    * Biểu phí dừng chân nhảy vọt lên mức tối đa `1.320 Tr. VNĐ`.
    * Thẻ con C3 phát sáng viền vàng hoàng kim `border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.15)]`.
    * **Cơ chế tự bảo vệ:** Nút "Nâng Cấp" tự động ẩn (không thể nâng quá cấp 3).
    * Nút **"Hạ Cấp (-50%)"** màu cam đỏ xuất hiện để hỗ trợ tái cơ cấu dòng tiền khi cần thiết.
- **Minh chứng:**
  - BĐS C0 sẵn sàng nâng cấp: `r3_04_deed_c0_upgrade.png`.
  - BĐS C3 Resort tối đa: `r3_04_deed_c3_max.png`.

---

### 5. [UAT-37/38] Quản Lý Danh Mục BĐS, Thế Chấp & Giải Chấp
- **Thao tác Thế Chấp:**
  - Người chơi mở Sổ Đỏ của BĐS sở hữu.
  - Bấm nút màu cam: **"Thế Chấp"**.
  - Hệ thống cộng ngay `50% giá trị niêm yết` vào tài khoản người chơi.
  - Xuất hiện dải cờ đỏ cảnh báo: **"⚠️ Tài sản đang thế chấp — Tạm ngưng thu phí thuê"**.
  - Nút bấm lập tức chuyển thành: **"Giải Chấp"**.
- **Thao tác Giải Chấp:**
  - Người chơi bấm nút: **"Giải Chấp"**.
  - Hệ thống trừ tiền gốc thế chấp + 10% phí giải chấp theo luật định.
  - Dải cảnh báo đỏ lập tức biến mất, tài sản phục hồi quyền thu phí dừng chân bình thường, nút bấm chuyển lại thành **"Thế Chấp"**.
- **Minh chứng:**
  - Trạng thái đang thế chấp: `r3_05_property_mortgaged.png`.
  - Trạng thái sau khi giải chấp: `r3_05_property_redeemed.png`.

---

## IV. ĐÁNH GIÁ CHẤT LƯỢNG & TÍNH TOÀN VẸN HỆ THỐNG

1. **Hiến pháp GEMINI.md & Thước đo Slop Red Flags:**
   - Hoàn toàn không phát sinh mã rác (Zero Dead Abstractions).
   - TypeScript strict mode: 0 lỗi cảnh báo, zero dirty cast.
   - Toàn bộ 70 test files với 911 bài kiểm thử tự động tiếp tục PASS 100%.
2. **Trải nghiệm người chơi (Player Immersion):**
   - Sự kết hợp giữa sa bàn 3D góc nhìn chéo và các thẻ bài nghiệp vụ 3D tạo cảm giác bàn cờ sang trọng, chân thực như đang ngồi tại phòng VIP sòng bài tỷ phú.
   - Các hiệu ứng vi mô (LED HOSE, nhấp nháy Anti-sniping, nút bấm có độ lún vật lý 3D) mang lại độ thỏa mãn xúc giác cao.

---

## V. KẾT LUẬN & ĐỀ XUẤT BƯỚC TIẾP THEO

Vòng kiểm thử UAT #03 đã hoàn thành xuất sắc 100% mục tiêu:
- Nghiệm thu hoàn tất bản sửa lỗi công thái học tiêu đề Sổ Đỏ.
- Xác thực hoạt động mượt mà của toàn bộ cụm tính năng trung cuộc và tàn cuộc: **Đấu giá 15s, Anti-sniping, Sàn HOSE, Nâng cấp C3, Thế chấp & Giải chấp**.
- Hệ thống duy trì độ ổn định tuyệt đối với 0 lỗi đỏ console trong suốt quá trình chạy trên môi trường Docker Production.
