# BÁO CÁO CHI TIẾT VÒNG KIỂM THỬ UAT TỰ HÀNH #10
DỰ ÁN: CỜ TỶ PHÚ 3D VIỆT NAM (VTCOON)  
NGÀY THỰC HIỆN: 10/09/2026 | PHIÊN BẢN: CONTAINER PRODUCTION DOCKER

---

## I. THÔNG SỐ VÒNG THỬ NGHIỆM #10 (CÚ SỐC LÃI SUẤT THẾ CHẤP KHO BẠC & SỤP ĐỔ SÀN CHỨNG KHOÁN HOSE)

- **Môi trường:** Docker Container Production (`vtcoon-vtcoon-1` Node.js port 3000/3001, `vtcoon-nginx-1` port 80/443).
- **Mục tiêu chính (Kịch bản Cấp độ 4 — Khó vừa trong chuỗi 6 case sâu):**
  1. Kích hoạt sự kiện kinh tế vĩ mô Ngân Hàng Nhà Nước Tăng Lãi Suất (`MC_RATE_HIKE`):
     - Lãi suất thế chấp tăng từ 5% lên 10%/vòng.
     - Tiền phạt thuê đất trên toàn bàn cờ giảm 20% do thanh khoản thị trường thắt chặt.
  2. Kiểm chứng khấu trừ lãi suất thế chấp khi vượt Ô GO (Ô 0):
     - Người chơi P1 thế chấp Ô 39 (Tràng Tiền, định giá thế chấp 2.000 Tr.).
     - Khi vượt Ô GO: P1 được nhận thưởng vượt mốc +2.000 Tr., nhưng hệ thống lập tức cưỡng chế trích thu 10% lãi suất trên tổng dư nợ thế chấp (`2.000 Tr. x 10% = 200 Tr.`).
     - Toàn bộ 200 Tr. này được nộp trực tiếp vào Quỹ Kho Bạc (`treasuryPool`), bảo toàn 100% dòng tiền tệ trong game.
  3. Kiểm chứng cơ chế giao dịch tại Sàn Chứng Khoán HOSE (Ô 38):
     - Hiển thị bảng điện tử LED trực tuyến với chỉ số VN-INDEX, VN30 nhấp nháy.
     - Bảng ma trận tỷ lệ khớp lệnh 1D6 với 6 kịch bản (từ giảm sàn 0.50x đến kịch trần 2.00x).
     - Người chơi chọn hạn mức đầu tư lướt sóng 2.000 Tr. VNĐ.
  4. Kiểm chứng Cú Sốc Sập Sàn (-50% Vốn Đầu Tư):
     - Xúc xắc 1D6 đổ ra mặt 1 ➔ Giảm sàn kịch biên độ -50%.
     - Khoản tiền thu về chỉ còn 1.000 Tr. (mất đứt 1.000 Tr. tiền mặt).
     - Giao diện người dùng bung huy hiệu đỏ `KHỚP LỆNH LỖ (-50%)` và hiển thị chữ bay trừ tiền rõ ràng.
  5. Kiểm chứng Cơ Chế Cấp Tín Dụng Thấu Chi Khẩn Cấp (`CC_OVERDRAFT`):
     - Khi dòng tiền bị tổn thương, người chơi được giải cứu bằng thẻ cơ hội Thấu Chi.
     - Cấp hạn mức tiền mặt tức thì +3.000 Tr., đồng thời thiết lập đồng hồ thu hồi nợ 3 vòng (`overdraftRoundsLeft = 3`) với nghĩa vụ thanh toán 3.300 Tr. (bao gồm 10% phí cấp vốn).
- **Trình duyệt thực thi:** Microsoft Edge Chromium headless qua Chrome DevTools Protocol (CDP) port 9222.
- **Tình trạng mã nguồn:** 73/73 test files, 923/923 tests PASS 100%, `tsc --noEmit` 0 lỗi.

---

## II. TỔNG HỢP KẾT QUẢ VÒNG TEST #10

```
┌────────────────────────────────────────────────────────┬──────────────┬────────────┬─────────────────────────────────────────┐
│ Kịch bản UAT                                           │ Persona      │ Kết quả    │ Điểm & Cảm nhận thực tế                 │
├────────────────────────────────────────────────────────┼──────────────┼────────────┼─────────────────────────────────────────┤
│ UAT-10.1: Thẻ vĩ mô MC_RATE_HIKE tăng lãi 10%          │ Bác Ba       │ HOÀN HẢO   │ 5/5 (Giao diện thẻ vĩ mô rõ ràng, dễ đọc│
│ UAT-10.2: Cưỡng chế trừ lãi thế chấp vượt GO nộp Kho Bạc│ Chú Sáu     │ HOÀN HẢO   │ 5/5 (Trừ đúng 200 Tr. nộp Kho Bạc)      │
│ UAT-10.3: Trải nghiệm bảng điện tử Sàn HOSE Ô 38       │ Bé Bo        │ HOÀN HẢO   │ 5/5 (Ticker LED sinh động, tỷ lệ rõ ràng│
│ UAT-10.4: Khớp lệnh 1D6 ra Mặt 1 giảm sàn -50%         │ Cô Tư        │ HOÀN HẢO   │ 5/5 (Badge đỏ KHỚP LỆNH LỖ, trừ chuẩn)  │
│ UAT-10.5: Giải cứu dòng tiền với Thẻ Thấu Chi 3.000 Tr.│ Cậu Út       │ HOÀN HẢO   │ 5/5 (Cấp vốn kịp thời, minh bạch lãi vay│
└────────────────────────────────────────────────────────┴──────────────┴────────────┴─────────────────────────────────────────┘
```

- **Lỗi đỏ Console (Console Error):** **0 lỗi (100% sạch sẽ)**.
- **Bảo toàn tiền tệ (Global Monetary Invariant):** 200 Tr. lãi thế chấp trích từ P1 được cộng chính xác vào `treasuryPool` (tăng từ 2.000 Tr. lên 2.200 Tr.).
- **Độ ổn định Server FSM:** Bộ test `tests/server/rate_hike_hose_overdraft.test.ts` đạt 6/6 tests PASS.

---

## III. HÀNH TRÌNH KIỂM THỬ THỰC TẾ & MINH CHỨNG HÌNH ẢNH

```
[Bắt đầu Vòng UAT 10: Lạm Phát Lãi Suất Thế Chấp & Sụp Đổ Sàn HOSE]
                               │
                               ▼
     [Chặng 1: Thiết lập phòng đấu 1 Human (P1) + 1 Bot AI]
     Bàn cờ 3D khởi tạo, P1 giữ lượt đầu với số dư 15.000 Tr.
                               │
                               ▼
     [Chặng 2: Rút Thẻ Vĩ Mô MC_RATE_HIKE Ngân Hàng Tăng Lãi Suất]
     Lãi suất thế chấp thiết lập 10%/vòng
     EventCardModal hiển thị thông báo chính sách vĩ mô
     📸 Ảnh minh chứng: r10_01_macro_rate_hike_event.png
                               │
                               ▼
     [Chặng 3: Vượt Ô GO ➔ Thu 10% Lãi Thế Chấp Nộp Vào Kho Bạc]
     P1 thế chấp Ô 39 Tràng Tiền (dư nợ 2.000 Tr.)
     Vượt GO: Thưởng +2.000 Tr., cưỡng chế trừ -200 Tr. lãi suất
     Quỹ Kho Bạc tăng: 2.000 ➔ 2.200 Tr. (+200 Tr.)
     Số dư P1 cập nhật: 16.800 Tr.
     📸 Ảnh minh chứng: r10_02_mortgage_interest_deducted.png
                               │
                               ▼
     [Chặng 4: Đổ bộ Sàn Giao Dịch Chứng Khoán HOSE Ô 38]
     Bảng điện tử LED Ticker hiển thị VN-INDEX & VN30
     Bảng ma trận tỷ lệ 1D6 niêm yết công khai
     P1 chọn hạn mức đặt cược 2.000 Tr.
     📸 Ảnh minh chứng: r10_03_hose_market_entry.png
                               │
                               ▼
     [Chặng 5: Cú Sốc Khớp Lệnh Mặt 1 ➔ Giảm Sàn Kịch Biên Độ -50%]
     Gieo 1D6 ra Mặt 1: Hệ số 0.50x
     P1 nhận lại 1.000 Tr., chịu lỗ ròng -1.000 Tr. tiền mặt
     HoseModal hiển thị badge đỏ KHỚP LỆNH LỖ và highlight Mặt 1
     Số dư P1 còn lại: 15.800 Tr.
     📸 Ảnh minh chứng: r10_04_hose_crash_loss.png
                               │
                               ▼
     [Chặng 6: Đòn Bẩy Thấu Chi CC_OVERDRAFT Giải Cứu Dòng Tiền]
     Kho Bạc giải ngân tức thì +3.000 Tr. tiền mặt cứu trợ
     Thiết lập thời hạn thấu chi 3 vòng (nghĩa vụ hoàn trả 3.300 Tr.)
     Số dư P1 phục hồi lên: 18.800 Tr.
     📸 Ảnh minh chứng: r10_05_overdraft_credit_rescue.png
```

---

### 1. Chặng 2: Thông Báo Sự Kiện Vĩ Mô — Ngân Hàng Nhà Nước Tăng Lãi Suất
- **Hình ảnh:** [`r10_01_macro_rate_hike_event.png`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/r10_01_macro_rate_hike_event.png)
- **Quan sát thực tế:**
  - Hộp thoại sự kiện trung tâm mang nhận diện **Phiếu Thị Trường (Vĩ Mô)** với dải nhãn màu vàng cam nổi bật.
  - Tiêu đề dõng dạc: `NGÂN HÀNG NHÀ NƯỚC TĂNG LÃI SUẤT`.
  - Nội dung quy chế rõ ràng: *"Toàn bộ dư nợ vay thế chấp tăng lãi suất lên 10%/vòng. Tiền phạt thuê đất trên toàn bàn cờ giảm 20%."*
  - Nút bấm *"Đã Hiểu / Tiếp Tục"* thiết kế 3D dập nổi sang trọng, tạo cảm giác xúc giác bấm thực tế.

---

### 2. Chặng 3: Vượt Ô GO Bị Cưỡng Chế Trừ 10% Lãi Thế Chấp Nộp Vào Quỹ Kho Bạc
- **Hình ảnh:** [`r10_02_mortgage_interest_deducted.png`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/r10_02_mortgage_interest_deducted.png)
- **Quan sát thực tế:**
  - Cụm chữ bay tài chính xuất hiện nhịp nhàng trên sa bàn:
    * Chữ bay màu xanh ngọc: `+2.000 Tr. (Vượt GO)`.
    * Chữ bay màu đỏ hồng cảnh báo: `-200 Tr. (Lãi thế chấp vĩ mô 10%)`.
  - Thanh trạng thái đỉnh màn hình: Quỹ Kho Bạc cập nhật tức thì từ `2.000 Tr.` lên `2.200 Tr.` (đón nhận trọn vẹn 200 Tr. tiền lãi nợ, không thất thoát 1 đồng).
  - Bảng thông tin người chơi P1: Số dư tiền mặt tăng ròng đúng +1.800 Tr. (từ 15.000 Tr. lên 16.800 Tr.).

---

### 3. Chặng 4: Giao Diện Sàn Giao Dịch Chứng Khoán HOSE Ô 38
- **Hình ảnh:** [`r10_03_hose_market_entry.png`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/r10_03_hose_market_entry.png)
- **Quan sát thực tế:**
  - Bảng LED Ticker phong cách sàn giao dịch hiện đại: `VN-INDEX 1,288.6 ▲ +15.2 | VN30: 1,320.5 ▲ | HOSE LIVE`.
  - Bảng tỷ lệ khớp lệnh 1D6 hiển thị 6 ô màu trực quan:
    * Mặt 1: `0.50x (-50%)` (Đỏ giảm sàn)
    * Mặt 2: `0.75x (-25%)` (Hồng giảm nhẹ)
    * Mặt 3: `1.00x (Hoà)` (Vàng cam bảo toàn)
    * Mặt 4: `1.20x (+20%)` (Xanh ngọc tăng trưởng)
    * Mặt 5: `1.50x (+50%)` (Xanh lá bứt phá)
    * Mặt 6: `2.00x (+100%)` (Xanh tím kịch trần)
  - 4 nút hạn mức cược nhanh: `500 Tr.`, `1.000 Tr.`, `2.000 Tr.`, `3.000 Tr.` (nút 2.000 Tr. đang được chọn phát sáng cam).

---

### 4. Chặng 5: Cú Sốc Khớp Lệnh Mặt 1 ➔ Giảm Sàn Kịch Biên Độ -50%
- **Hình ảnh:** [`r10_04_hose_crash_loss.png`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/r10_04_hose_crash_loss.png)
- **Quan sát thực tế:**
  - Dải chữ bay đỏ thẫm phía trên: `Đại Gia Chủ Sảnh (P1) -1.000 Tr. (HOSE Giảm Sàn -50%)`.
  - Kết quả ván cược trong modal:
    * Icon xúc xắc ⚀ kèm điểm số: `Điểm xúc xắc 1D6: 1`.
    * Tiền thu về: `1.000 Tr.`
    * Huy hiệu trạng thái: `KHỚP LỆNH LỖ` nền đỏ bo viền sắc sảo.
  - Ô Mặt 1 trong bảng ma trận được viền vàng nổi bật kích hoạt trạng thái `selected`.
  - Số dư tài khoản người chơi lập tức bị khấu trừ 1.000 Tr., giảm còn `15.800 Tr.`.

---

### 5. Chặng 6: Đòn Bẩy Thấu Chi Khẩn Cấp (`CC_OVERDRAFT`) Cứu Nguy Thanh Khoản
- **Hình ảnh:** [`r10_05_overdraft_credit_rescue.png`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/r10_05_overdraft_credit_rescue.png)
- **Quan sát thực tế:**
  - Dải chữ bay xanh ngọc phát sáng: `+3.000 Tr. (Tín Dụng Thấu Chi)`.
  - Thẻ bài cơ hội bung mở trang trọng:
    * Tiêu đề: `TÍN DỤNG THẤU CHI KHẨN CẤP`.
    * Chi tiết điều khoản: *"Ngân hàng giải ngân hạn mức thấu chi 3.000 Tr. VNĐ cứu trợ thanh khoản! Thời hạn 3 vòng đấu, hoàn trả 3.300 Tr. VNĐ (bao gồm 10% lãi suất)."*
    * Nhãn thu nhập: `Thu Nhập: 3.000 Tr.`
  - Cung cấp điểm tựa tài chính then chốt để người chơi không bị cuốn vào vòng xoáy phá sản khi gặp biến cố kinh tế dồn dập.

---

## IV. ĐÁNH GIÁ TRẢI NGHIỆM THEO PERSONA

1. **Bác Ba (62 tuổi - Nhà đầu tư truyền thống, thích chắc chắn):**
   - *"Quy luật vĩ mô này rất đời thực! Đang vay mượn cắm sổ đỏ mà gặp đợt siết lãi suất là méo mặt ngay. Việc trừ 10% lãi thế chấp khi qua ô Khởi Hành nhắc người chơi phải lo chuộc lại sổ sớm, không được ỷ lại vào tiền thưởng vượt GO."*
2. **Chú Sáu (45 tuổi - Kỹ sư tài chính, soi xét dòng tiền):**
   - *"Dòng tiền Kho Bạc được bảo toàn tuyệt đối. 200 Tr. phạt của người chơi không hề bị 'cháy' vào không khí mà đổ thẳng vào Quỹ Kho Bạc để tái phân phối cho các sự kiện cộng đồng sau này. Logic khớp lệnh HOSE 1D6 cũng phản ánh trọn vẹn rủi ro biên độ chứng khoán Việt Nam."*
3. **Bé Bo (14 tuổi - Game thủ thế hệ Z, yêu thích đồ họa):**
   - *"Giao diện sàn HOSE nhìn ngầu xỉu! Có cả bảng điện tử LED chạy chữ VN-INDEX như trên tivi. Lúc quay ra mặt 1 bị lỗ nhìn cái badge đỏ nổi lên vừa thót tim vừa kích thích muốn gỡ lại."*
4. **Cô Tư (38 tuổi - Nội trợ & kinh doanh tự do):**
   - *"Rất thích cơ chế Thấu Chi! Lúc đang kẹt tiền mà có ngân hàng cho mượn vốn nóng 3.000 Tr. để giữ đất là phao cứu sinh cực kỳ hữu ích, dù phải trả lãi 10% nhưng vẫn rất công bằng."*

---

## V. KẾ HOẠCH BƯỚC TIẾP THEO: VÒNG UAT #11 (CẤP ĐỘ 5 — KHÓ CAO)

### Kịch bản đề xuất: "Khủng Hoảng Kép & Phát Mãi Cưỡng Chế 70% Khi 100% Người Chơi Đều Bấm Pass"
- **Độ khó:** Cấp độ 5 (Khó cao) trong lộ trình 6 kịch bản sâu.
- **Tình huống thực tế:**
  1. Người chơi P1 hạ cánh vào Ô Đất đắt đỏ (Ô 39 Tràng Tiền) nhưng từ chối mua (`onPass`).
  2. Sàn Đấu Giá Cạnh Tranh tự động mở ra. Tuy nhiên, do toàn bộ người chơi trên bàn cờ đang trong tình trạng cạn kiệt thanh khoản hoặc tính toán chiến thuật, **100% người chơi (cả Human lẫn Bot AI) đều lần lượt bấm Bỏ Qua (Pass)**.
  3. Kiểm chứng quy chế Phát Mãi Cưỡng Chế của Nhà Nước (Foreclosure):
     - Ô đất không bị bỏ quên mà lập tức được chuyển sang chế độ **Thanh Lý Kho Bạc Phát Mãi Cưỡng Chế với giá sàn chiết khấu sâu 70%** niêm yết.
     - Kiểm chứng quyền ưu tiên mua giá rẻ hoặc xung đột trả giá chớp nhoáng ở vòng tiếp theo.
     - Đảm bảo FSM thu hồi tài sản sạch sẽ, không gây bế tắc (deadlock) luồng ván đấu.
