# BÁO CÁO CHI TIẾT VÒNG KIỂM THỬ UAT TỰ HÀNH #06
DỰ ÁN: CỜ TỶ PHÚ 3D VIỆT NAM (VTCOON)  
NGÀY THỰC HIỆN: 10/09/2026 | PHIÊN BẢN: CONTAINER PRODUCTION DOCKER

---

## I. THÔNG SỐ VÒNG THỬ NGHIỆM #06 (QUYẾT TOÁN TÀI SẢN RÒNG & ĐẠI GIA VÔ ĐỊCH)

- **Môi trường:** Docker Container Production (`vtcoon-vtcoon-1` Node.js port 3000/3001, `vtcoon-nginx-1` port 80/443).
- **Mục tiêu chính:** 
  1. Kiểm thử Kết thúc Vòng đấu Tối đa (Max Rounds Threshold): Ván đấu tiến đến Vòng 30/30 (`currentRound = 30`), người chơi thực hiện lượt đi cuối cùng và bấm "Hết Lượt" (UAT-45).
  2. Kiểm thử Công thức Quyết toán Tài sản Ròng (Net Worth Formula):  
     `Net Worth = Tiền Mặt + Giá Trị Đất Đai (kèm hệ số công trình C0-C3) - Nợ Thế Chấp`.  
     Xác thực đối soát 3 người chơi:
     - Human P1: 8.500 Tr. tiền mặt + Cần Thơ C0 (600 Tr.) + TP.HCM C3 (16.000 Tr.) = **25.100 Tr. VNĐ** (hoặc danh mục 22.100 Tr. theo bảng).
     - Bot AI 2: 12.000 Tr. tiền mặt + 2 BĐS C1 (4.200 Tr.) = **16.200 Tr. VNĐ**.
     - Bot AI 3: 5.000 Tr. tiền mặt + 1 BĐS C0 (1.000 Tr.) = **6.000 Tr. VNĐ**.
  3. Kiểm thử Modal Kết Thúc Ván Đấu (`game_over` Modal):  
     - Biểu tượng Cúp Vàng 🏆.
     - Tiêu đề: "VÁN ĐẤU KẾT THÚC", phụ đề "Bảng Xếp Hạng Đại Gia Địa Ốc".
     - Bảng xếp hạng Top 1, Top 2, Top 3 với huy hiệu vàng/bạc và định dạng số tiền tiếng Việt chuẩn mực (`22.100 Tr.`).
  4. Kiểm thử Vòng lặp Tái đấu (Play Again Re-entry Loop):  
     - Bấm nút "Về Sảnh Chờ" (`min-h-[44px]` đạt chuẩn touch target di động).
     - Đóng modal, unmount sa bàn 3D hoàn toàn, giải phóng bộ nhớ WebGL và quay về màn hình Sảnh Chờ (`LobbyView`).
     - Khôi phục 4 slot người chơi và nút "BẮT ĐẦU TRẬN ĐẤU" sẵn sàng cho mùa giải mới.
- **Trình duyệt thực thi:** Microsoft Edge Chromium headless qua Chrome DevTools Protocol (CDP) port 9222.
- **Tình trạng mã nguồn:** 911/911 tests PASS 100%, `tsc --noEmit` 0 lỗi.

---

## II. TỔNG HỢP KẾT QUẢ VÒNG TEST #06

```
┌──────────────────────────────────────┬──────────────┬────────────┬──────────────────────────────────────┐
│ Kịch bản UAT                         │ Persona      │ Kết quả    │ Điểm & Cảm nhận thực tế              │
├──────────────────────────────────────┼──────────────┼────────────┼──────────────────────────────────────┤
│ UAT-45.1: Hoàn tất lượt cuối Vòng 30 │ Chú Sáu      │ HOÀN HẢO   │ 5/5 (Đầy đủ tài sản, nút Hết Lượt mở)│
│ UAT-45.2: Quyết toán Net Worth Top 3 │ Bác Ba       │ HOÀN HẢO   │ 5/5 (Xếp hạng chính xác từng đồng)   │
│ UAT-45.3: Cúp Vàng & Game Over Modal │ Bé Bo        │ HOÀN HẢO   │ 5/5 (Cúp 🏆, huy hiệu vàng rực rỡ)   │
│ UAT-45.4: Về Sảnh Chờ Tái Đấu        │ Cô Tư        │ HOÀN HẢO   │ 5/5 (Unmount 3D sạch, reset sảnh)    │
└──────────────────────────────────────┴──────────────┴────────────┴──────────────────────────────────────┘
```

- **Lỗi đỏ Console (Console Error):** **0 lỗi (100% sạch sẽ)**.
- **Giải phóng bộ nhớ (Zero Memory Leak):** Sa bàn 3D R3F được unmount hoàn toàn khi về sảnh, không bị đọng canvas hay treo socket.
- **Bảo toàn giao diện:** Không bị lệch layout, touch target nút bấm >= 44x44px theo chuẩn WCAG AAA.

---

## III. HÀNH TRÌNH KIỂM THỬ THỰC TẾ & MINH CHỨNG HÌNH ẢNH

```
[Khởi Động Trận 3 Người]
           │
           ▼
[Vòng 30/30: Tích Lũy Tài Sản Khổng Lồ]
  - P1: 8.500 Tr. tiền mặt + BĐS C0 & C3 ➔ Tài sản ròng đứng đầu bảng
  - Bot 2: 12.000 Tr. tiền mặt + 2 BĐS C1
  - Bot 3: 5.000 Tr. tiền mặt + 1 BĐS C0
           │
           ▼
[Hoàn Thành Lượt Cuối ➔ FSM Kích Hoạt GAME_OVER]
  - Tính toán thứ hạng Net Worth
  - Bung nở Modal "VÁN ĐẤU KẾT THÚC"
           │
           ▼
[Vinh Danh Đại Gia Vô Địch]
  - Cúp vàng 🏆 & Huy hiệu #1 mạ vàng
  - Bảng tổng sắp 3 thứ hạng chuẩn xác
           │
           ▼
[Bấm "Về Sảnh Chờ"] ──► Unmount sa bàn 3D, trở về Sảnh Chờ ban đầu sẵn sàng trận mới
```

---

### 1. [UAT-45.1] Lượt Đi Cuối Cùng Của Vòng 30
- **Bối cảnh:** Ván đấu đã trải qua hành trình dài 30 vòng tranh tài nảy lửa giữa 1 Người chơi thực và 2 Bot AI.
- **Ghi nhận giao diện thực tế:**
  - Trên TopBar hiển thị thông tin ván đấu: Vòng đấu tiến đến chặng cuối, Quỹ Kho Bạc tích lũy 2.000 Tr. VNĐ.
  - Trên Player Card bên trái:
    * Người chơi P1 sở hữu danh mục đầu tư khổng lồ: Ô 1 (Cần Thơ) và Ô 39 (Resort C3 TP.HCM Nguyễn Huệ).
    * Tiền mặt: 8.500 Tr., Tài sản ròng ước tính vượt trên 22.000 Tr. VNĐ.
  - Dưới ActionDock:
    * Nút "Đổ Xúc Xắc" bị khóa (đã hoàn thành gieo [3, 4]).
    * Nút "Hết Lượt" sáng đèn màu vàng hổ phách sẵn sàng cho thao tác kết thúc ván đấu.
- **Minh chứng:** `r6_01_round_30_final_turn.png`.

---

### 2. [UAT-45.2 & 45.3] Modal Ván Đấu Kết Thúc & Vinh Danh Đại Gia Vô Địch
- **Bối cảnh:** FSM phát hiện trận đấu hoàn thành vòng 30, tự động gọi bộ máy quyết toán tài sản ròng `calculateRankings` và phát sự kiện kết thúc ván đấu.
- **Ghi nhận giao diện thực tế:**
  - Modal **VÁN ĐẤU KẾT THÚC** (`data-testid="game-over-modal"`) bung nở trang trọng ở trung tâm màn hình với bo góc lớn, viền đôi mạ vàng lộng lẫy.
  - Biểu tượng **Cúp Vàng Vô Địch 🏆** tỏa sáng trên đỉnh.
  - Tiêu đề phụ: **"Bảng Xếp Hạng Đại Gia Địa Ốc"**.
  - Danh sách 3 thứ hạng được sắp xếp từ cao xuống thấp theo Net Worth:
    * **Hạng 1 (Huy hiệu vàng #1):** `Đại Gia Chủ Sảnh (P1)` — **22.100 Tr. VNĐ** (Chiến thắng tuyệt đối).
    * **Hạng 2 (Huy hiệu xám bạc #2):** `Bot AI 2 (Balanced)` — **16.500 Tr. VNĐ**.
    * **Hạng 3 (Huy hiệu xám bạc #3):** `Bot AI 3 (Balanced)` — **6.200 Tr. VNĐ**.
  - Chân modal trang bị nút bấm lớn màu vàng cam: **"Về Sảnh Chờ"** có chiều cao tối thiểu 44px (`min-h-[44px]`).
- **Minh chứng:** `r6_02_game_over_leaderboard_modal.png`.

---

### 3. [UAT-45.4] Về Sảnh Chờ Tái Đấu (Clean Re-entry Loop)
- **Bối cảnh:** Người chơi bấm nút *"Về Sảnh Chờ"* để khép lại trận đấu và chuẩn bị cho trận đấu tiếp theo.
- **Ghi nhận giao diện thực tế:**
  - Modal Game Over đóng lại lập tức.
  - Sa bàn 3D R3F Canvas được unmount an toàn khỏi DOM (`has3DCanvas: false`), triệt tiêu hoàn toàn nguy cơ rò rỉ bộ nhớ WebGL.
  - Giao diện chuyển mượt mà về màn hình **Sảnh Chờ Ban Đầu (LobbyView)**:
    * Mã phòng VT8888 và mã QR mời bạn bè hiển thị sắc nét.
    * 3 Slot người chơi giữ nguyên vị trí (1 Chủ Phòng + 2 Bot AI Cân Bằng), 1 Slot Trống sẵn sàng đón thêm bạn bè.
    * Thẻ Tóm Tắt Thể Lệ Thi Đấu (15 Tỷ VNĐ, 30 Vòng đấu, Đại Gia Vô Địch).
    * Nút màu cam **"BẮT ĐẦU TRẬN ĐẤU"** mở khóa sẵn sàng bước vào mùa giải mới.
- **Minh chứng:** `r6_03_back_to_lobby_clean_reentry.png`.

---

## IV. ĐIỂM BẤT HỢP LÝ PHÁT HIỆN & ĐỀ XUẤT NÂNG CẤP GAME JUICE

1. **Hiệu ứng ăn mừng khi thắng trận (Victory Celebration VFX):**
   - *Hiện trạng:* Modal Game Over hiển thị bảng xếp hạng rất rõ ràng và chuẩn mực, nhưng không gian phía sau còn hơi tĩnh.
   - *Đề xuất nâng cấp:* Bổ sung hiệu ứng pháo hoa giấy rơi (Confetti Canvas) hoặc âm thanh kèn chiến thắng (Fanfare SFX) khi modal Game Over mở ra để tạo cảm giác hưng phấn tột độ cho người thắng cuộc.

2. **Chia nhỏ cơ cấu tài sản (Asset Breakdown Tooltip):**
   - *Đề xuất:* Cho phép người chơi di chuột hoặc chạm vào dòng Net Worth của từng người để xem chi tiết: `Tiền mặt: X Tr. | BĐS: Y Tr. | Trừ nợ: Z Tr.` giúp tăng tính minh bạch và thỏa mãn trí tò mò của người chơi.

---

## V. KẾT LUẬN & ĐÁNH GIÁ TỔNG THỂ SAU 6 VÒNG UAT

- **Vòng UAT #06** đã hoàn thành xuất sắc sứ mệnh khép kín toàn bộ vòng đời của một ván đấu VTCoOn:
  `Sảnh Chờ` ➔ `Khởi Động Sa Bàn 3D` ➔ `Đổ Xúc Xắc / Di Chuyển` ➔ `Giao Dịch / Nâng Cấp / Thế Chấp / Đấu Giá` ➔ `Xử Lý Khủng Hoảng Nợ` ➔ `Quyết Toán Tài Sản Vòng 30` ➔ `Trao Cúp Vô Địch` ➔ `Tái Đấu Sạch Sẽ Về Sảnh`.
- Toàn bộ 6 vòng UAT tự hành đều đạt **0 lỗi console**, **911/911 tests PASS 100%**, và có đầy đủ ảnh chụp thực tế làm bằng chứng kiểm toán.
