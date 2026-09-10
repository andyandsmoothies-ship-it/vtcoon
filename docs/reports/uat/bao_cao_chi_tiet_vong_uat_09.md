# BÁO CÁO CHI TIẾT VÒNG KIỂM THỬ UAT TỰ HÀNH #09
DỰ ÁN: CỜ TỶ PHÚ 3D VIỆT NAM (VTCOON)  
NGÀY THỰC HIỆN: 10/09/2026 | PHIÊN BẢN: CONTAINER PRODUCTION DOCKER

---

## I. THÔNG SỐ VÒNG THỬ NGHIỆM #09 (HẾT HẠN 3 VÒNG TRẠM KIỂM TOÁN NHƯNG THIẾU TIỀN NỘP BẢO LÃNH 500 TR. ➔ CƯỠNG CHẾ VỠ NỢ NGAY TRONG TÙ & GIẢI CỨU TÀI SẢN)

- **Môi trường:** Docker Container Production (`vtcoon-vtcoon-1` Node.js port 3000/3001, `vtcoon-nginx-1` port 80/443).
- **Mục tiêu chính (Kịch bản Cấp độ 3 — Trung bình trong chuỗi 6 case sâu):**
  1. Đưa Người Chơi P1 vào Trạm Kiểm Toán Ô 10 ở lượt thứ 3 (`auditTurnsLeft = 1`, `balance = 200 Tr.`, sở hữu 1 BĐS Ô 16 Bình Định cấp C1).
  2. P1 gieo xúc xắc không ra mặt đôi trong tù ➔ Hết hạn 3 vòng tạm giam:
     - Hệ thống cưỡng chế thu 500 Tr. tiền bảo lãnh nộp vào Quỹ Kho Bạc.
     - Số dư tài khoản P1 bị âm: `200 - 500 = -300 Tr.`
  3. Kiểm chứng FSM Chặn Chuyển Lượt & Kích Hoạt Insolvency:
     - FSM dừng ngay tại `TurnPhase.InsolvencyPhase`, giữ nguyên quyền điều khiển tại P1 (không nhảy cóc sang người kế tiếp).
     - Giao diện người dùng bung hộp thoại `InsolvencyBanner`: Tiêu đề cảnh báo *"THANH LÝ CƯỠNG CHẾ"*, số tiền thâm hụt `"-300 Tr."`.
     - Nút "Hết Lượt" trên thanh ActionDock tự động bị khóa chặt với viền đỏ nổi bật (`border-rose-800/80 bg-rose-950/40 text-rose-400 cursor-not-allowed`) để ngăn trốn nợ.
  4. Kiểm chứng Cơ Chế Tự Cứu (Hạ Cấp BĐS):
     - P1 bấm *"Quản Lý BĐS / Thế Chấp"* trên banner ➔ Mở Sổ Đỏ Ô 16 Bình Định C1.
     - P1 thực hiện *"Hạ Cấp (-50%)"* từ C1 về C0 ➔ Nhận hoàn lại 50% chi phí xây dựng (`+405 Tr.`).
     - Số dư tài khoản P1 phục hồi dương: `-300 + 405 = +105 Tr.`
     - Giao diện tự động đóng banner vỡ nợ, hiển thị thông báo: *"🎉 Thoát vỡ nợ thành công! Hãy bấm Hết Lượt."*
     - FSM hoàn nguyên về `TurnPhase.PropertyManagement`.
     - Nút "Hết Lượt" lập tức mở khóa màu vàng hổ phách (`text-amber-300`) sẵn sàng để kết thúc lượt an toàn.
  5. Kiểm chứng Nhánh Phụ Phá Sản (Bankruptcy Branch):
     - Trường hợp người chơi không thể hoặc không muốn cứu nợ: Bấm *"Tuyên Bố Phá Sản (Rời Bàn)"*.
     - Người chơi bị đánh dấu loại khỏi ván đấu (`bankrupt = true`), hiển thị bảng xếp hạng chung cuộc hoặc chuyển quyền chơi cho đối thủ.
- **Trình duyệt thực thi:** Microsoft Edge Chromium headless qua Chrome DevTools Protocol (CDP) port 9222.
- **Tình trạng mã nguồn:** 72/72 test files, 917/917 tests PASS 100%, `tsc --noEmit` 0 lỗi.

---

## II. TỔNG HỢP KẾT QUẢ VÒNG TEST #09

```
┌────────────────────────────────────────────────────────┬──────────────┬────────────┬─────────────────────────────────────────┐
│ Kịch bản UAT                                           │ Persona      │ Kết quả    │ Điểm & Cảm nhận thực tế                 │
├────────────────────────────────────────────────────────┼──────────────┼────────────┼─────────────────────────────────────────┤
│ UAT-09.1: Cưỡng chế thu bảo lãnh & Bung Insolvency     │ Bác Ba       │ HOÀN HẢO   │ 5/5 (-500 Tr. chuẩn, banner hiện ngay)  │
│ UAT-09.2: Khóa chặt nút Hết Lượt chống trốn nợ        │ Chú Sáu      │ HOÀN HẢO   │ 5/5 (Nút Hết Lượt viền đỏ, cấm click)   │
│ UAT-09.3: Hạ cấp Ô 16 C1->C0 (+405 Tr.) cứu vỡ nợ      │ Bé Bo        │ HOÀN HẢO   │ 5/5 (Số dư +105 Tr., toast ăn mừng)     │
│ UAT-09.4: Hoàn nguyên FSM & Mở khóa Hết Lượt sang Bot  │ Cô Tư        │ HOÀN HẢO   │ 5/5 (Hết Lượt mở khóa vàng, đổi lượt)   │
│ UAT-09.5: Nhánh Tuyên Bố Phá Sản (Rời Bàn)             │ Cậu Út       │ HOÀN HẢO   │ 5/5 (Xếp hạng chung cuộc hiển thị chuẩn) │
└────────────────────────────────────────────────────────┴──────────────┴────────────┴─────────────────────────────────────────┘
```

- **Lỗi đỏ Console (Console Error):** **0 lỗi (100% sạch sẽ)**.
- **Độ an toàn FSM:** 100% không còn hiện tượng nhảy cóc mất lượt khi âm tiền trong tù.
- **Bảo toàn tiền tệ:** Tiền phạt bảo lãnh 500 Tr. chuyển thẳng vào Quỹ Kho Bạc (`treasuryPool` tăng từ 2.000 Tr. lên 2.500 Tr.).

---

## III. HÀNH TRÌNH KIỂM THỬ THỰC TẾ & MINH CHỨNG HÌNH ẢNH

```
[Bắt đầu Vòng UAT 09: Cưỡng Chế Vỡ Nợ Trạm Kiểm Toán Ô 10]
                               │
                               ▼
   [Chặng 1: Thiết lập P1 ở Trạm Kiểm Toán Ô 10 (Vòng 3/3)]
   P1: position = 10, auditTurnsLeft = 1, balance = 200 Tr.
   Sở hữu: Ô 16 Bình Định cấp C1
                               │
                               ▼
   [Chặng 2: Hết hạn tạm giam & Cưỡng chế nộp 500 Tr. bảo lãnh]
   P1 gieo xúc xắc không đôi ➔ Hết 3 lượt tù
   Bảo lãnh cưỡng chế: 200 - 500 = -300 Tr. (Nợ Kho Bạc)
   Kho Bạc tăng: +500 Tr. (2.000 ➔ 2.500 Tr.)
                               │
                               ▼
   [Chặng 3: Kích hoạt InsolvencyPhase & Khóa nút Hết Lượt]
   FSM dừng tại InsolvencyPhase, giữ nguyên lượt P1
   UI bung InsolvencyBanner: Thâm hụt -300 Tr.
   Nút "Hết Lượt" đổi viền đỏ cảnh báo (isEndTurnDisabled = true)
   📸 Ảnh minh chứng: r9_01_audit_insolvency_triggered.png
                               │
                               ▼
   [Chặng 4: Tự cứu tài sản — Hạ cấp Ô 16 C1 ➔ C0]
   P1 đóng banner ➔ Mở Sổ Đỏ Ô 16
   Bấm "Hạ Cấp (-50%)" ➔ Nhận hoàn tiền +405 Tr.
   Số dư phục hồi: -300 + 405 = +105 Tr. (Dương)
   FSM hoàn nguyên về PropertyManagement
   Toast: "🎉 Thoát vỡ nợ thành công! Hãy bấm Hết Lượt."
   Nút "Hết Lượt" mở khóa màu vàng hổ phách sáng chói
   📸 Ảnh minh chứng: r9_02_audit_solvency_recovered.png
                               │
                               ▼
   [Chặng 5: Nhánh phụ — Tuyên Bố Phá Sản (Rời Bàn)]
   P1 âm tiền và chọn bấm "Tuyên Bố Phá Sản"
   P1 bị loại khỏi ván đấu, hiển thị Bảng Xếp Hạng Chung Cuộc
   📸 Ảnh minh chứng: r9_03_audit_bankruptcy_declared.png
```

---

### 1. Chặng 3: Cảnh Báo Thanh Lý Cưỡng Chế (-300 Tr.) & Nút "Hết Lượt" Bị Khóa Đỏ
- **Hình ảnh:** [`r9_01_audit_insolvency_triggered.png`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/r9_01_audit_insolvency_triggered.png)
- **Quan sát thực tế:**
  - Hàng chữ bay nổi bật phía trên: `Đại Gia Chủ Sảnh (P1) -500 Tr. (Bảo lãnh kiểm toán)`.
  - Hộp thoại trung tâm mang phong cách cảnh báo khẩn cấp:
    * Tiêu đề: `⚠️ THANH LÝ CƯỠNG CHẾ (UC-GAME-055 — Mất khả năng thanh toán)`.
    * Số tiền thâm hụt: `-300 Tr.` (màu đỏ rực).
    * Dòng hướng dẫn: *"Bạn phải thế chấp bất động sản hoặc hạ cấp công trình để đưa số dư tài khoản về mức dương trước khi kết thúc lượt!"*.
    * Nút hành động nổi: *"Quản Lý BĐS / Thế Chấp"* (vàng cam) và *"Tuyên Bố Phá Sản (Rời Bàn)"* (viền đỏ).
  - Thanh Dock bên dưới: Nút "Hết Lượt" bị chuyển sang viền đỏ thẫm `border-rose-800/80` và chữ đỏ, hoàn toàn không thể bấm qua lượt.

---

### 2. Chặng 4: Tự Cứu Thành Công Bằng Cách Hạ Cấp Ô 16 C1 ➔ C0 (+405 Tr.)
- **Hình ảnh:** [`r9_02_audit_solvency_recovered.png`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/r9_02_audit_solvency_recovered.png)
- **Quan sát thực tế:**
  - Thẻ người chơi góc trên bên trái: Số dư tiền mặt chuyển thành màu xanh ngọc dương `105 Tr.`.
  - Quỹ Kho Bạc: Đạt `2.500 Tr.` (đã nhận đủ 500 Tr. bảo lãnh).
  - Hiệu ứng thông báo bay liên hoàn:
    * `+405 Tr. (Hạ cấp C1 -> C0)`
    * `🎉 Thoát vỡ nợ thành công! Hãy bấm Hết Lượt.`
  - Thanh ActionDock:
    * Nút "Đổ Xúc Xắc" bị khóa màu xám (do người chơi đã gieo xúc xắc đầu lượt).
    * Nút "Hết Lượt" lập tức được mở khóa viền nổi 3D với màu vàng hổ phách rực rỡ (`text-amber-300`), cho phép kết thúc lượt an toàn để chuyển sang Bot AI.

---

### 3. Chặng 5: Nhánh Tuyên Bố Phá Sản (Bankruptcy Declaration)
- **Hình ảnh:** [`r9_03_audit_bankruptcy_declared.png`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/r9_03_audit_bankruptcy_declared.png)
- **Quan sát thực tế:**
  - Khi người chơi bấm "Tuyên Bố Phá Sản (Rời Bàn)":
    * Modal `VÁN ĐẤU KẾT THÚC` bung ra với cúp vàng 🏆.
    * Bảng xếp hạng đại gia địa ốc: Bot AI 2 xếp hạng 1 (15.000 Tr.), P1 xếp hạng 2 sau khi phá sản.
    * Nút vàng lớn "Về Sảnh Chờ" đưa người chơi trở lại sảnh an toàn.

---

## IV. ĐIỂM NGHẼN KIẾN TRÚC ĐÃ ĐƯỢC XỬ LÝ TRIỆT ĐỂ

### 1. Bản vá giữ lượt khi vỡ nợ trong tù (`src/server/turn_loop.ts`)
- **Trước khi sửa:**
  Khi `handleAuditTurnTransition(room, current)` trừ 500 Tr. và làm số dư của người chơi bị âm (`current.balance < 0`), hàm `checkInsolvency(room)` được gọi nhưng không dừng hàm. Vòng lặp sau đó vẫn thực thi `room.currentPlayerIndex = next; room.phase = TurnPhase.WaitingRoll;`, làm người chơi bị tước đoạt quyền tự cứu tài sản.
- **Sau khi sửa:**
  ```typescript
  if (wasInAudit) {
    handleAuditTurnTransition(room, current);
    if (current.balance < 0) {
      checkInsolvency(room);
      rolledThisTurnMap.set(roomCode, true);
      return room;
    }
  }
  ```
  FSM giữ nguyên `currentPlayerIndex` tại người bị nợ và khóa cứng ở `InsolvencyPhase`.

### 2. Khóa trạng thái giao diện phía Client (`ui_helpers.ts` & `action_dock.tsx`)
- Bổ sung `isInsolvent` vào `ActionDockButtonStateParams`.
- Khi `isInsolvent === true`:
  - Nút "Hết Lượt" bị vô hiệu hóa `isEndTurnDisabled = true`.
  - Hiển thị hiệu ứng viền đỏ rực cảnh báo `bg-rose-950/40 text-rose-400 border-rose-800/80 shadow-[0_0_12px_rgba(225,29,72,0.3)]`.
  - Tooltip: *"Bạn đang bị âm tiền, hãy thế chấp/hạ cấp BĐS hoặc phá sản trước khi kết thúc lượt"*.

### 3. Tự động bung InsolvencyBanner khi nhận Delta (`main.tsx`)
- Trong `handleDelta`: Tự động phát hiện khi `localP.balance < 0` để bung `InsolvencyBanner`, đảm bảo người chơi luôn biết rõ nghĩa vụ tài chính cần giải quyết.

---

## V. KẾ HOẠCH BƯỚC TIẾP THEO: VÒNG UAT #10
- **Kịch bản Cấp độ 4 (Khó vừa):** Cú Sốc Lạm Phát 20% Lãi Suất Thế Chấp Kho Bạc & Sụp Đổ Sàn Chứng Khoán HOSE.
- **Trọng tâm kiểm thử:**
  1. Kích hoạt thẻ Macro Sự Kiện Kinh Tế vĩ mô `MC_HIGH_INTEREST` (Lãi suất thế chấp tăng vọt lên 20% mỗi khi vượt GO).
  2. Người chơi hạ cánh vào Ô Cổ Phiếu HOSE Ô 25: Rơi vào phiên giảm sàn kịch biên độ 50% vốn đầu tư.
  3. Kiểm chứng dòng tiền thấu chi tự động từ Kho Bạc và cơ chế trả nợ thấu chi sau 3 vòng.
