# BÁO CÁO CHI TIẾT VÒNG KIỂM THỬ UAT TỰ HÀNH #08
DỰ ÁN: CỜ TỶ PHÚ 3D VIỆT NAM (VTCOON)  
NGÀY THỰC HIỆN: 10/09/2026 | PHIÊN BẢN: CONTAINER PRODUCTION DOCKER

---

## I. THÔNG SỐ VÒNG THỬ NGHIỆM #08 (BẪY ĐÀM PHÁN HOÀN THÀNH BỘ MÀU ĐỘC QUYỀN CAM & LUẬT XÂY EVEN-BUILDING)

- **Môi trường:** Docker Container Production (`vtcoon-vtcoon-1` Node.js port 3000/3001, `vtcoon-nginx-1` port 80/443).
- **Mục tiêu chính (Kịch bản Cấp độ 2 — Dễ vừa trong chuỗi 6 case sâu):**
  1. Thiết lập ván đấu 3 người chơi (1 Human P1 + 2 Bots P2, P3).
  2. Mô phỏng đàm phán P2P song phương (`TradeModal` & `INTENT_TRADE_OFFER`):
     - P1 mua lại Ô 19 Đà Nẵng từ Bot 1 (P2) với giá 1.500 Tr. tiền mặt.
     - Khấu trừ tự động 5% thuế chuyển nhượng nộp vào Kho bạc Nhà nước.
     - Hoàn thành bộ màu độc quyền Cam (Ô 16 Bình Định, Ô 18 Huế, Ô 19 Đà Nẵng).
  3. Kiểm chứng Độc Quyền C0 Nhân Đôi Tiền Thuê (`resolveRent` & `TitleDeedModal`):
     - Xác thực tiền thuê đất nền C0 của toàn bộ 3 ô tự động nhân đôi (x2).
     - Ô 16 & Ô 18: Phí C0 tăng từ 180 Tr. lên 360 Tr.
     - Ô 19: Phí C0 tăng từ 200 Tr. lên 400 Tr.
     - Thẻ bài Sổ Đỏ hiển thị nhãn nổi bật: `x2 ĐỘC QUYỀN`.
  4. Kiểm thử Chặn Hành Vi Phá Luật Even-Building (Xây lệch tầng không đồng đều):
     - Nâng Ô 19 lên C1 Nhà Phố (hợp lệ).
     - Cố gắng nâng tiếp Ô 19 lên C2 Khách Sạn trong khi Ô 16 và Ô 18 vẫn là Đất Nền C0.
     - FSM và UI phải khóa chặt nút nâng cấp, kèm cảnh báo: *"Quy tắc xây dựng đều tay: Cần nâng cấp Bình Định (Quy Nhơn), Thừa Thiên Huế lên C1 trước khi xây C2"*.
  5. Kiểm thử Nâng Cấp Đồng Bộ Hợp Lệ (Even-Building Compliant):
     - Nâng Ô 16 lên C1, Ô 18 lên C1 ➔ Toàn bộ nhóm đạt C1 đồng bộ.
     - Mở lại Sổ Đỏ Ô 19: Nút nâng cấp lên C2 tự động mở khóa hợp lệ.
- **Trình duyệt thực thi:** Microsoft Edge Chromium headless qua Chrome DevTools Protocol (CDP) port 9222.
- **Tình trạng mã nguồn:** 71/71 test files, 914/914 tests PASS 100%, `tsc --noEmit` 0 lỗi.

---

## II. TỔNG HỢP KẾT QUẢ VÒNG TEST #08

```
┌────────────────────────────────────────┬──────────────┬────────────┬─────────────────────────────────────────┐
│ Kịch bản UAT                           │ Persona      │ Kết quả    │ Điểm & Cảm nhận thực tế                 │
├────────────────────────────────────────┼──────────────┼────────────┼─────────────────────────────────────────┤
│ UAT-08.1: Đàm phán P2P sang tên Ô 19   │ Chú Sáu      │ HOÀN HẢO   │ 5/5 (5% thuế nộp chuẩn, đổi chủ mượt)   │
│ UAT-08.2: Độc quyền Cam C0 Rent x2     │ Bé Bo        │ HOÀN HẢO   │ 5/5 (C0 lên 400 Tr., nhãn x2 nổi bật)   │
│ UAT-08.3: Chặn phá luật Even-Building  │ Bác Ba       │ HOÀN HẢO   │ 5/5 (Khóa nút C2, dòng giải thích rõ)   │
│ UAT-08.4: Nâng cấp đồng bộ mở khóa     │ Cô Tư        │ HOÀN HẢO   │ 5/5 (Đồng bộ C1 mở khóa C2 mượt mà)     │
└────────────────────────────────────────┴──────────────┴────────────┴─────────────────────────────────────────┘
```

- **Lỗi đỏ Console (Console Error):** **0 lỗi (100% sạch sẽ)**.
- **Tính toàn vẹn kinh tế:** Bảo toàn dòng tiền tuyệt đối, thuế giao dịch 5% (75 Tr.) nạp chuẩn vào Quỹ Kho Bạc.

---

## III. HÀNH TRÌNH KIỂM THỬ THỰC TẾ & MINH CHỨNG HÌNH ẢNH

```
[Bắt đầu Vòng UAT 08: Độc Quyền Cam & Even-Building]
                   │
                   ▼
  [Chặng 1: Thiết lập phòng 3 người]
  P1 sở hữu Ô 16 (Bình Định C0), Ô 18 (Huế C0)
  Bot AI 1 (P2) sở hữu Ô 19 (Đà Nẵng C0)
                   │
                   ▼
  [Chặng 2: Giao dịch P2P chuyển nhượng Ô 19]
  P1 gửi Trade Offer mua Ô 19 từ P2 với giá 1.500 Tr. (+5% thuế Kho bạc)
  P2 đồng ý ➔ P1 hoàn thành trọn bộ Độc Quyền Cam
                   │
                   ▼
  [Chặng 3: Kiểm chứng Độc quyền C0 Rent x2]
  Tiền thuê C0 của Ô 16, 18, 19 tự động nhân đôi:
  Ô 16 (180 ➔ 360 Tr.), Ô 18 (180 ➔ 360 Tr.), Ô 19 (200 ➔ 400 Tr.)
  📸 Ảnh minh chứng: r8_01_monopoly_rent_doubled.png
                   │
                   ▼
  [Chặng 4: Thử thách phá luật Even-Building]
  P1 mở Ô 19 (đang C0) và nâng lên C1 (hợp lệ)
  P1 cố gắng bấm tiếp nâng Ô 19 lên C2 trong khi Ô 16, 18 vẫn ở C0
  UI khóa nút / hiển thị cảnh báo vi phạm
  Server từ chối với mã EVEN_BUILDING_VIOLATION
  📸 Ảnh minh chứng: r8_02_even_building_guard.png
                   │
                   ▼
  [Chặng 5: Nâng cấp đồng bộ hợp lệ C1 toàn bộ]
  P1 nâng Ô 16 lên C1, nâng Ô 18 lên C1
  Toàn bộ nhóm Cam đồng bộ C1 ➔ Nút C2 mở khóa hợp lệ
  📸 Ảnh minh chứng: r8_03_even_building_compliant.png
```

---

### 1. Chặng 3: Sổ Đỏ Ô 19 Đà Nẵng Hiển Thị Tiền Thuê C0 Nhân Đôi (x2) Khi Độc Quyền
- **Hình ảnh:** [`r8_01_monopoly_rent_doubled.png`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/r8_01_monopoly_rent_doubled.png)
- **Quan sát thực tế:**
  - Hàng biểu phí C0 Đất Nền hiển thị `400 Tr.` (thay vì 200 Tr. ban đầu).
  - Phía dưới có nhãn huy hiệu xanh ngọc phát sáng `x2 ĐỘC QUYỀN`.
  - Nút "Nâng Cấp (+1.000 Tr.)" sẵn sàng màu ngọc bích nổi bật.

---

### 2. Chặng 4: Chặn Vi Phạm Quy Tắc Xây Dựng Đều Tay (Even-Building Violation Guard)
- **Hình ảnh:** [`r8_02_even_building_guard.png`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/r8_02_even_building_guard.png)
- **Quan sát thực tế:**
  - Sau khi nâng Ô 19 lên C1, người chơi cố tình nâng tiếp lên C2 trong khi Ô 16 và Ô 18 vẫn ở C0.
  - Nút "Nâng Cấp (+1.500 Tr.)" lập tức chuyển sang màu xám Slate tối, thuộc tính `disabled = true` và con trỏ chuột `cursor-not-allowed`.
  - Phía dưới nút xuất hiện dải banner màu vàng cảnh báo rõ ràng:
    `⚠️ Quy tắc xây dựng đều tay: Cần nâng cấp Bình Định (Quy Nhơn), Thừa Thiên Huế lên C1 trước khi xây C2`.
  - Triệt tiêu hoàn toàn hành vi "dồn nhà một ô" gây mất cân bằng kinh tế game.

---

### 3. Chặng 5: Mở Khóa Nâng Cấp Khi Toàn Bộ Nhóm Đạt Đồng Bộ C1
- **Hình ảnh:** [`r8_03_even_building_compliant.png`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/r8_03_even_building_compliant.png)
- **Quan sát thực tế:**
  - Khi P1 nâng tiếp Ô 16 và Ô 18 lên C1 (`levelMap: { 16: 1, 18: 1, 19: 1 }`).
  - Mở lại Sổ Đỏ Ô 19: Dải banner cảnh báo biến mất.
  - Nút "Nâng Cấp (+1.500 Tr.)" trở lại màu xanh ngọc bích sống động, cho phép nâng cấp lên C2 Khách Sạn hoàn toàn hợp lệ.

---

## IV. ĐÁNH GIÁ CHUYÊN SÂU TỪ PERSONAS

1. **Chú Sáu (Chuyên gia kinh tế & Đàm phán BĐS):**
   > *"Tính năng đàm phán P2P rất sòng phẳng. Đổi ô đất lấy tiền mặt và nộp đúng 5% thuế cho Nhà nước thể hiện sự chặt chẽ. Cơ chế x2 tiền thuê đất nền khi độc quyền giúp người chơi có lợi thế khai thác dòng tiền ngay lập tức!"*

2. **Bác Ba (Thích tính công bằng & ghét bug/cheat):**
   > *"Quy tắc xây dựng đều tay là xương sống của game cờ tỷ phú. Chặn không cho xây C2 khi các ô khác còn ở C0 kèm theo câu giải thích tiếng Việt chỉ đích danh ô nào cần xây trước là cực kỳ xuất sắc!"*

3. **Bé Bo (Thích hình ảnh bắt mắt):**
   > *"Chữ 'x2 ĐỘC QUYỀN' màu xanh ngọc nhìn rất ngầu và dễ hiểu, không cần phải nhẩm tính toán trong đầu."*

---

## V. KẾT LUẬN & ĐỀ XUẤT BƯỚC TIẾP THEO

- **Kết luận:** Vòng UAT #08 hoàn thành mỹ mãn 100% mục tiêu của Cấp độ 2 (Dễ vừa).
- **Hệ thống hiện tại:** 71 test files, 914/914 tests PASS 100%, 0 lỗi TypeScript, 0 lỗi runtime console.
- **Kế hoạch tiếp theo theo lộ trình tuần tự:**
  - **Vòng UAT #09 (Cấp độ 3 — Trung bình)**: Hết Hạn 3 Vòng Trạm Kiểm Toán Ô 10 Nhưng Thiếu Tiền Nộp Bảo Lãnh 500 Tr. ➔ Cưỡng chế vỡ nợ ngay trong tù và mở nhánh xử lý tài sản.
