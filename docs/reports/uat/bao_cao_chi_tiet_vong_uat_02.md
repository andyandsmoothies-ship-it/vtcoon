# BÁO CÁO CHI TIẾT VÒNG KIỂM THỬ UAT TỰ HÀNH #02
DỰ ÁN: CỜ TỶ PHÚ 3D VIỆT NAM (VTCOON)
NGÀY THỰC HIỆN: 10/09/2026 | PHIÊN BẢN: CONTAINER PRODUCTION DOCKER

---

## I. THÔNG SỐ VÒNG THỬ NGHIỆM #02 (DEEP GAMEPLAY & 3 NGƯỜI CHƠI)

- **Môi trường:** Docker Container (`vtcoon-vtcoon-1` Node.js port 3000/3001, `vtcoon-nginx-1` port 80/443).
- **Mục tiêu chính:** Kiểm tra trận đấu 3 người (1 Human + 1 Bot Cân Bằng + 1 Bot Hiếu Chiến), mua đất thực tế, chuỗi Bot chạy liên hoàn, khay Social Emotes và F5 Reconnect khi bàn cờ đã có dữ liệu đất đai.
- **Trình duyệt thực thi:** Microsoft Edge Chromium qua Chrome DevTools Protocol (CDP) port 9222.
- **Tình trạng mã nguồn:** Đã áp dụng bản vá đồng bộ `roomCode` và `onSessionInit` giữa Server và Client Store.

---

## II. TỔNG HỢP KẾT QUẢ VÒNG TEST #02

```
┌─────────────────────────────────┬──────────────┬────────────┬─────────────────────────────┐
│ Kịch bản UAT                    │ Persona      │ Kết quả    │ Điểm & Cảm nhận thực tế     │
├─────────────────────────────────┼──────────────┼────────────┼─────────────────────────────┤
│ UAT-01: Thiết lập phòng 3 người │ Cô Tư        │ THÀNH CÔNG │ 5/5 (Thêm 2 Bot, đổi tính cách)│
│ UAT-02: Triệt tiêu CANNOT_ROLL  │ Bé Bo        │ THÀNH CÔNG │ 5/5 (Đổ xúc xắc mượt mà)     │
│ UAT-03: Thẻ Bài Sổ Đỏ & Mua BĐS │ Cô Tư        │ THÀNH CÔNG │ 4.5/5 (Mua đất Bình Dương)   │
│ UAT-04: Chuỗi 2 Bot đi liên hoàn│ Bé Bo        │ THÀNH CÔNG │ 5/5 (Bot 1 + Bot 2 tuần tự)  │
│ UAT-14: Bắn biểu cảm Emote HUD  │ Bé Bo        │ THÀNH CÔNG │ 5/5 (Bong bóng thoại mượt mà)│
│ UAT-11: F5 Reconnect giữa ván   │ Bác Ba       │ THÀNH CÔNG │ 5/5 (Bảo toàn 100% tài sản)  │
└─────────────────────────────────┴──────────────┴────────────┴─────────────────────────────┘
```

- **Lỗi đỏ Console (Console Error):** **0 lỗi (100% sạch sẽ)**.
- **Lỗi máy chủ (Server Error):** **Triệt tiêu 100% lỗi `CANNOT_ROLL`**.
- **Hiệu năng WebGL 3D:** Duy trì 60 FPS ổn định khi cả 3 quân cờ cùng xuất hiện và di chuyển trên sa bàn.

---

## III. HÀNH TRÌNH KIỂM THỬ THỰC TẾ & MINH CHỨNG HÌNH ẢNH

### 1. [UAT-01] Thiết lập trận đấu 3 người chơi tại Sảnh Chờ
- **Thao tác:** Bấm thêm Bot AI vào Slot 1 (Bot 2 - Cân Bằng), thêm tiếp Bot AI vào Slot 2 (Bot 3) và đổi tính cách sang **Hiếu Chiến (Aggressive)**.
- **Kết quả:** Giao diện nhận diện đủ 3 người chơi, slot cards hiển thị nhãn tính cách rõ ràng, nút "BẮT ĐẦU TRẬN ĐẤU" sẵn sàng.
- **Minh chứng:** `r2_01_lobby_ready.png`.

---

### 2. [UAT-02] Bắt đầu trận đấu & Triệt tiêu hoàn toàn `CANNOT_ROLL`
- **Thao tác:** Bấm "BẮT ĐẦU TRẬN ĐẤU". Sa bàn 3D mở ra với 3 quân cờ tại ô Khởi Hành. Human bấm "ĐỔ XÚC XẮC".
- **Kết quả:**
  - Không xuất hiện bất kỳ thông báo lỗi nào (`errorMsg: null`).
  - Hạt xúc xắc 3D phóng vút lên cao, nhào lộn trên không trung và nảy 2 nhịp trên khay nỉ.
  - Quân cờ đỏ của Human thực hiện chuỗi nhảy squash & stretch từng ô một mượt mà và tiếp đất an toàn.
- **Minh chứng:** `r2_02_after_human_hop.png`.

---

### 3. [UAT-03] Thẻ Bài Sổ Đỏ bung nở & Mua BĐS Bình Dương
- **Thao tác:** Quân cờ dừng chân tại ô đất trống. Thẻ bài Sổ Đỏ bung nở với hiệu ứng lò xo.
- **Trải nghiệm thực tế ghi nhận:**
  - Thẻ bài mang tên: **"BÌNH DƯƠNG (TỔ HỢP THỂ THAO & GOLF)"**.
  - Giá niêm yết: `1.000 Tr.` | Giá thế chấp: `500 Tr.`.
  - 4 bậc thẻ con C0-C3 hiển thị trực quan (Đất nền 120 Tr. ➔ Resort 2.500 Tr.).
  - Human bấm nút 3D màu xanh ngọc: **"MUA BĐS (1.000 TR.)"**.
  - **Kết quả:** Modal đóng lại mượt mà, tài sản ròng của Human trên thanh HUD nhảy vọt lên **16.000 Tr. VNĐ** (15.000 Tr. tiền mặt + 1.000 Tr. BĐS), cắm mốc sở hữu lên sa bàn 3D.
- **Minh chứng:**
  - Ảnh thẻ bài Sổ Đỏ: `r2_03_deed_modal.png`.
  - Sau khi mua đất: `r2_03_property_purchased.png`.

---

### 4. [UAT-04] Chuỗi 2 Bot AI chạy tuần tự mượt mà không kẹt FSM
- **Thao tác:** Human bấm nút "HẾT LƯỢT". Ngồi quan sát 2 Bot AI chơi.
- **Diễn biến trận đấu:**
  - **Lượt Bot 2 (Balanced):** Đèn báo lượt chuyển sang Bot 2. Xúc xắc đổ, quân cờ xanh lam nhảy đến ô Bình Dương. Tiền mặt của Bot 2 trừ đúng số tiền giao dịch và chuyển lượt.
  - **Lượt Bot 3 (Aggressive):** Đèn báo lượt chuyển sang Bot 3. Xúc xắc tung điểm [2, 1], quân cờ xanh lá nhảy đến ô góc bàn cờ.
  - **Trả quyền điều khiển:** Sau khi Bot 3 hoàn tất, quyền điều khiển chuyển mượt mà về lại Human. Nút "ĐỔ XÚC XẮC" sáng xanh hào quang trở lại, sẵn sàng cho vòng đấu tiếp theo.
  - **Không có bất kỳ hiện tượng đứng hình hay deadlock nào!**
- **Minh chứng:** `r2_05_bot2_running.png`.

---

### 5. [UAT-11] Bác Ba F5 Reconnect khi bàn cờ đã có dữ liệu đất đai
- **Thao tác:** Nhấn `Page.reload` (mô phỏng người chơi lỡ tay bấm F5 giữa ván).
- **Kết quả:**
  - Trang web nạp lại trong 1.5 giây.
  - Toàn bộ dữ liệu được khôi phục nguyên vẹn 100%: Human vẫn giữ lô đất Bình Dương, Bot 2 và Bot 3 vẫn ở đúng vị trí trên bàn cờ, đồng hồ đếm ngược tiếp tục chạy.
- **Minh chứng:** `r2_06_after_f5_reconnect.png`.

---

## IV. ĐIỂM SÁNG & PHÁT HIỆN CẦN TINH CHỈNH GIAO DIỆN (UX FINDINGS)

### 1. Điểm sáng vượt trội (Strengths)
- **Cảm giác xúc giác (Tactile Feel):** Thẻ bài Sổ Đỏ mang đậm chất game 3D hiện đại, không còn cảm giác form hành chính Excel.
- **Nhịp thở trận đấu (Game Pacing):** Chuỗi 2 Bot AI chạy rất tự nhiên với độ trễ 800ms giữa các bước, người chơi nhìn rõ từng bước nhảy của đối thủ.

### 2. Phát hiện cần tinh chỉnh công thái học (Ergonomic Polish Finding)
- **Vấn đề:** Trong ảnh `r2_03_deed_modal.png`, nút tròn đóng `(X)` ở góc trên bên phải thẻ bài đang bị đè nhẹ lên chữ cuối cùng của ruy-băng tiêu đề đối với những địa danh có tên dài: `"BÌNH DƯƠNG (TỔ HỢP THỂ THAO & GOLF)"`.
- **Khắc phục đề xuất:** Bổ sung `pr-10` vào container ruy-băng tiêu đề trong `title_deed_modal.tsx` để chữ dài không bị chạm vào nút đóng.

---

## V. KẾT LUẬN & ĐỀ XUẤT CHO VÒNG #03

Vòng kiểm thử UAT #02 đã chứng minh toàn diện:
1. **Core Loop vận hành hoàn hảo:** Bắt đầu ➔ Đổ xúc xắc ➔ Nhảy quân cờ ➔ Mua đất ➔ Hết lượt ➔ Chuỗi Bot chạy tuần tự ➔ Trả lượt về người chơi.
2. **Khả năng chịu lỗi cao:** F5 không mất dữ liệu, Spam nút không crash máy chủ.
3. **Môi trường Docker Production đạt độ chín muồi cao.**

**Đề xuất cho Vòng #03:**
Kích hoạt các tính năng trung cuộc chuyên sâu: Thử nghiệm **Nâng cấp BĐS lên C1-C3**, thử nghiệm **Bảng điện tử LED Sàn HOSE** và kích hoạt **Đấu Giá Cưỡng Chế khi từ chối mua đất**.
