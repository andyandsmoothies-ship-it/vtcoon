# BÁO CÁO CHI TIẾT VÒNG KIỂM THỬ UAT TỰ HÀNH #07
DỰ ÁN: CỜ TỶ PHÚ 3D VIỆT NAM (VTCOON)  
NGÀY THỰC HIỆN: 10/09/2026 | PHIÊN BẢN: CONTAINER PRODUCTION DOCKER

---

## I. THÔNG SỐ VÒNG THỬ NGHIỆM #07 (ĐỘNG LỰC HỌC SA BÀN 3D & CHỐNG CHỒNG LẤN 4 QUÂN CỜ)

- **Môi trường:** Docker Container Production (`vtcoon-vtcoon-1` Node.js port 3000/3001, `vtcoon-nginx-1` port 80/443).
- **Mục tiêu chính (Kịch bản Cấp độ 1 — Dễ nhất trong chuỗi 6 case sâu):**
  1. Kiểm thử Bố cục 4 Người Chơi Tối Đa (Max 4 Players Layout): Phòng đấu 1 Human + 3 Bots (Balanced).
  2. Kiểm thử Chống Chồng Lấn 4 Quân Cờ tại Ô 0 Khởi Hành (Pawn Crowding at GO):
     - Xác thực thuật toán `PLAYER_OFFSETS`: 4 góc `[±0.2, 0, ±0.2]` ngăn cách nhau khoảng cách Euclid tối thiểu $d \ge 0.4$ đơn vị 3D.
     - Triệt tiêu hoàn toàn hiện tượng xuyên tâm hoặc nuốt hình (Clipping Artifacts).
  3. Kiểm thử Động Học Nhảy Độc Lập (Isolated Movement):
     - P1 nhảy di chuyển từ Ô 0 đến Ô 5 theo quỹ đạo Spring Squash & Stretch.
     - Xác thực 3 quân cờ còn lại của Bot 2, Bot 3, Bot 4 giữ vững vị trí neo tĩnh, không bị rung lắc hay đẩy lệch khỏi quadrant.
  4. Kiểm thử Đại Tụ Hội tại Trạm Kiểm Toán Ô 10 (Audit Cluster):
     - Cả 4 người chơi cùng chịu phạt giam tại Ô 10.
     - Xác thực hiển thị đồng thời 4 huy hiệu [Kiểm Toán] trên Player Card và bố cục 2x2 gọn gàng trên góc sa bàn.
  5. Kiểm thử Bong Bóng Biểu Cảm Đồng Thời (Simultaneous Social Emotes):
     - Kích hoạt biểu cảm cùng lúc trên cả 4 người chơi.
     - Kiểm tra Billboard Texture 2.5D trên đầu quân cờ và bong bóng trên HUD không đè chữ.
- **Trình duyệt thực thi:** Microsoft Edge Chromium headless qua Chrome DevTools Protocol (CDP) port 9222.
- **Tình trạng mã nguồn:** 911/911 tests PASS 100%, `tsc --noEmit` 0 lỗi.

---

## II. TỔNG HỢP KẾT QUẢ VÒNG TEST #07

```
┌──────────────────────────────────────┬──────────────┬────────────┬──────────────────────────────────────┐
│ Kịch bản UAT                         │ Persona      │ Kết quả    │ Điểm & Cảm nhận thực tế              │
├──────────────────────────────────────┼──────────────┼────────────┼──────────────────────────────────────┤
│ UAT-05.1: 4 Quân cờ Ô 0 không đè nhau│ Bé Bo        │ HOÀN HẢO   │ 5/5 (Tách 4 góc rõ rệt, 0 clipping)  │
│ UAT-05.2: 1 Quân nhảy, 3 quân đứng yên│ Chú Sáu     │ HOÀN HẢO   │ 5/5 (Quỹ đạo mượt, neo góc chuẩn)    │
│ UAT-05.3: Đại tụ hội Trạm Kiểm Toán  │ Bác Ba       │ HOÀN HẢO   │ 5/5 (Góc Ô 10 gọn gàng, 4 huy hiệu)  │
│ UAT-05.4: Emotes 4 người đồng thời   │ Cô Tư        │ HOÀN HẢO   │ 5/5 (Bong bóng HUD & 3D không đè)    │
└──────────────────────────────────────┴──────────────┴────────────┴──────────────────────────────────────┘
```

- **Lỗi đỏ Console (Console Error):** **0 lỗi (100% sạch sẽ)**.
- **Hiệu năng 3D (R3F Render Loop):** Khung hình duy trì vững vàng ở 60 FPS ngay cả khi render đồng thời 4 quân cờ đa mesh, shadow maps và hiệu ứng nảy hạt.

---

## III. HÀNH TRÌNH KIỂM THỬ THỰC TẾ & MINH CHỨNG HÌNH ẢNH

```
[Khởi Động Phòng Đấu Đủ 4 Người (1 Human + 3 Bots)]
                        │
                        ├─► [Chặng 1: Ô 0 Khởi Hành] ────────► 4 Quân cờ tách 4 góc (±0.2), không clipping
                        │
                        ├─► [Chặng 2: P1 Nhảy Đi Ô 5] ──────► 3 Quân Bot đứng yên tuyệt đối tại Ô 0
                        │
                        ├─► [Chặng 3: Hội Quân Ô 10 Kiểm Toán] 4 Huy hiệu HUD, lưới 2x2 góc sa bàn
                        │
                        └─► [Chặng 4: Bắn 4 Emotes Cùng Lúc] ─► Bong bóng nổi rõ trên đầu, không đè lấn
```

---

### 1. [UAT-05.1] Chống Chồng Lấn 4 Quân Cờ Tại Ô Khởi Hành (GO)
- **Bối cảnh:** Bắt đầu trận đấu 4 người, cả 4 quân cờ cùng xuất phát tại tọa độ Ô 0.
- **Ghi nhận không gian 3D thực tế:**
  - 4 quân cờ với 4 màu nhận diện độc lập:
    * P1 (Chủ phòng): Đỏ Ruby (`#c0392b`)
    * Bot AI 2: Xanh Biển (`#2980b9`)
    * Bot AI 3: Xanh Lục (`#27ae60`)
    * Bot AI 4: Cam Hổ Phách (`#e67e22`)
  - Thuật toán `PLAYER_OFFSETS` chia tách chính xác:
    * Tây Bắc: `[-0.2, 0, -0.2]`
    * Đông Bắc: `[+0.2, 0, -0.2]`
    * Tây Nam: `[-0.2, 0, +0.2]`
    * Đông Nam: `[+0.2, 0, +0.2]`
  - Cả 4 khối quân cờ đứng thẳng hàng lối, bóng đổ tiếp xúc (Contact Shadows) tách bạch, không hề xảy ra hiện tượng xuyên tâm (Z-fighting hoặc mesh clipping).
- **Minh chứng:** `r7_01_4_pawns_at_go_no_clipping.png`.

---

### 2. [UAT-05.2] Động Học Bước Nhảy — 1 Quân Di Chuyển, 3 Quân Còn Lại Đứng Yên
- **Bối cảnh:** P1 đến lượt, đổ xúc xắc và nhảy từ Ô 0 đến Ô 5 (Nha Trang).
- **Ghi nhận không gian 3D thực tế:**
  - Quân cờ P1 biến dạng co dãn Squash & Stretch chân thực, bay vút trên không trung qua các ô trung gian.
  - ActionDock chuyển sang trạng thái: **"🎲 Đang Đi..."**.
  - **Kiểm chứng tính cô lập động học:** 3 quân cờ của Bot 2, Bot 3, Bot 4 vẫn neo giữ 100% tọa độ tĩnh tại Ô 0, không bị dịch chuyển hay rung chấn do bước nhảy của P1.
  - Khi P1 chạm đất tại Ô 5, vị trí kết thúc ổn định tại tâm ô Nha Trang với offset tương ứng.
- **Minh chứng:** `r7_02_pawn_hop_isolated_movement.png`.

---

### 3. [UAT-05.3] Đại Tụ Hội 4 Quân Cờ Tại Trạm Kiểm Toán Ô 10
- **Bối cảnh:** Cả 4 người chơi cùng dính án phạt kiểm toán và bị áp giải vào Ô 10.
- **Ghi nhận không gian 3D thực tế:**
  - Trên Player Card bên trái: Cả 4 thẻ người chơi cùng sáng huy hiệu màu hổ phách **[Kiểm Toán]**.
  - Tại góc Ô 10 của sa bàn: Khối ô góc lớn chứa trọn vẹn cả 4 quân cờ theo bố cục ma trận 2x2.
  - Tên bảng hiệu "TRẠM KIỂM TOÁN" và standee hải đăng văn hóa vẫn nhìn thấy rõ, không bị quân cờ che khuất tầm nhìn.
- **Minh chứng:** `r7_03_4_pawns_in_audit_crowding.png`.

---

### 4. [UAT-05.4] Bắn Social Emotes Đồng Thời Trên 4 Quân Cờ
- **Bối cảnh:** 4 người chơi cùng lúc phát emote biểu cảm tương tác (Cười 😂, Khóc 😭, Đốt tiền 💸, Thả tim ❤️).
- **Ghi nhận không gian 3D thực tế:**
  - Trên Player Card (HUD): 4 bong bóng thoại xuất hiện bên cạnh avatar của từng người.
  - Trong không gian 3D: Biểu tượng cảm xúc dạng Billboard Texture 2.5D hướng thẳng về camera, bay lơ lửng ngay trên đầu cụm quân cờ.
  - Không có hiện tượng chồng chéo ký tự hay lỗi texture đen.
- **Minh chứng:** `r7_04_4_emotes_simultaneous.png`.

---

## IV. ĐIỂM BẤT HỢP LÝ PHÁT HIỆN & ĐỀ XUẤT NÂNG CẤP

1. **Hiệu ứng va chạm nhẹ khi cùng đứng 1 ô (Soft Bumping Interaction):**
   - *Hiện trạng:* 4 quân cờ đứng tĩnh theo 4 góc rất ngăn nắp, nhưng trông hơi nghiêm trang.
   - *Đề xuất (Game Juice):* Khi có một quân cờ mới nhảy vào ô đã có người đứng sẵn, các quân cờ đang đứng yên có thể nhún nhẹ một nhịp (micro-bounce 0.05 units) như phản ứng chào đón hoặc giật mình, tạo cảm giác sống động hơn.

---

## V. KẾT LUẬN & CHUẨN BỊ CHO CẤP ĐỘ KẾ TIẾP

- **Vòng UAT #07** đã giải quyết triệt để bài toán không gian sa bàn 3D khi số lượng người chơi đạt tối đa (4 người).
- Toàn bộ các tiêu chí: Chống chồng lấn, động học bước nhảy độc lập, hội tụ góc kiểm toán và bong bóng emote đều đạt điểm tối đa **5/5**.
- **Tiếp tục lộ trình "Từ dễ tới khó":**  
  Sẵn sàng tiến tới **Cấp độ 2 (Độ khó trung bình thấp):**  
  **Kịch bản 3: Bẫy Đàm Phán Hoàn Thành Bộ Màu Độc Quyền Cam & Kiểm Chứng Luật Xây Đồng Bộ (Even-Building Violation Guard)**.
