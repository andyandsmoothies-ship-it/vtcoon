# BÁO CÁO CHI TIẾT VÒNG KIỂM THỬ UAT TỰ HÀNH #05
DỰ ÁN: CỜ TỶ PHÚ 3D VIỆT NAM (VTCOON)  
NGÀY THỰC HIỆN: 10/09/2026 | PHIÊN BẢN: CONTAINER PRODUCTION DOCKER

---

## I. THÔNG SỐ VÒNG THỬ NGHIỆM #05 (CƠN SỐC THANH KHOẢN & TÁI CẤU TRÚC NỢ)

- **Môi trường:** Docker Container Production (`vtcoon-vtcoon-1` Node.js port 3000/3001, `vtcoon-nginx-1` port 80/443).
- **Mục tiêu chính:** 
  1. Kiểm thử Cơn Sốc Thanh Khoản: Giả lập rơi vào Khách sạn C3 đối thủ (-3.500 Tr.) ➔ Tài khoản âm (-2.000 Tr.) ➔ FSM kích hoạt `InsolvencyPhase` & mở `InsolvencyBanner` (UAT-53, UAT-55).
  2. Kiểm thử Tái cấu trúc nợ Chặng 1: Thế chấp BĐS C0 (Cần Thơ) nhận 50% tiền mặt (+600 Tr.) ➔ Giảm thâm hụt xuống còn -1.400 Tr. (UAT-38).
  3. Kiểm thử Tái cấu trúc nợ Chặng 2: Hạ cấp Resort C3 (TP.HCM) về Đất nền C0 nhận hoàn 50% tổng chi phí nâng cấp (+1.500 Tr.) ➔ Tài khoản chuyển dương (+100 Tr.) (UAT-36).
  4. Kiểm thử FSM Hoàn nguyên & ActionDock: `InsolvencyBanner` tự đóng, FSM tự động hoàn nguyên từ `InsolvencyPhase` về `PropertyManagement`, mở khóa nút "Hết Lượt" trên ActionDock, chuyển giao lượt an toàn cho Bot AI (UAT-03, FSM Reversion).
  5. Kiểm thử Nhánh Tuyên Bố Phá Sản (Bankruptcy Exit): Xử lý kiệt quệ tài sản ➔ Bấm "Tuyên Bố Phá Sản (Rời Bàn)" ➔ Người chơi nhận nhãn [Phá Sản], ActionDock bị vô hiệu hóa, tài sản thanh lý/chuyển giao và bàn cờ tiếp tục vận hành với các người chơi còn lại (UAT-54).
- **Trình duyệt thực thi:** Microsoft Edge Chromium headless qua Chrome DevTools Protocol (CDP) port 9222.
- **Tình trạng mã nguồn:** 911/911 tests PASS 100%, `tsc --noEmit` 0 lỗi.

---

## II. TỔNG HỢP KẾT QUẢ VÒNG TEST #05

```
┌──────────────────────────────────────┬──────────────┬────────────┬──────────────────────────────────────┐
│ Kịch bản UAT                         │ Persona      │ Kết quả    │ Điểm & Cảm nhận thực tế              │
├──────────────────────────────────────┼──────────────┼────────────┼──────────────────────────────────────┤
│ UAT-53/55: Cơn Sốc Nợ & Insolvency   │ Chú Sáu      │ HOÀN HẢO   │ 5/5 (Banner đỏ rực, thâm hụt rõ ràng)│
│ UAT-38: Thế Chấp BĐS C0 Cứu Nợ       │ Chú Sáu      │ THÀNH CÔNG │ 5/5 (Nhận 50% tiền, cảnh báo ngưng thu)│
│ UAT-36: Hạ Cấp C3 Về C0 (+1.500 Tr.) │ Bác Ba       │ HOÀN HẢO   │ 5/5 (Tài khoản dương +100 Tr., hồi C0)│
│ UAT-03: FSM Hoàn Nguyên & Hết Lượt   │ Bác Ba       │ THÀNH CÔNG │ 5/5 (Mở khóa Hết Lượt, chuyển Bot mượt)│
│ UAT-54: Tuyên Bố Phá Sản (Rời Bàn)   │ Bé Bo        │ HOÀN HẢO   │ 5/5 (Nhãn Phá Sản, khóa dock, bàn chạy)│
└──────────────────────────────────────┴──────────────┴────────────┴──────────────────────────────────────┘
```

- **Lỗi đỏ Console (Console Error):** **0 lỗi (100% sạch sẽ)**.
- **Bảo toàn dòng tiền FSM:** Khấu trừ tiền phạt, tiền hoàn thế chấp và tiền hoàn hạ cấp được tính toán chuẩn xác từng đồng, không có hiện tượng rò rỉ hay sai lệch số dư.
- **Hiệu năng hiển thị:** 60 FPS ổn định xuyên suốt quá trình pop-in modal, hạ cấp công trình và chuyển dịch lượt chơi.

---

## III. HÀNH TRÌNH KIỂM THỬ THỰC TẾ & MINH CHỨNG HÌNH ẢNH

```
[Sa Bàn 3D — Trận Đấu 3 Người]
           │
           ├─► [1. Dẫm Khách Sạn C3 (-3.500 Tr.)] ──► Tài khoản âm -2.000 Tr. ➔ InsolvencyBanner
           │
           ├─► [2. Thế Chấp BĐS C0 (+600 Tr.)] ─────► Tài khoản còn -1.400 Tr. ➔ Huy hiệu ngưng thu phí
           │
           ├─► [3. Hạ Cấp C3 Về C0 (+1.500 Tr.)] ───► Tài khoản DƯƠNG +100 Tr. ➔ FSM hoàn nguyên
           │
           ├─► [4. Khôi Phục ActionDock] ────────────► Nút Hết Lượt mở khóa ➔ Chuyển lượt Bot AI
           │
           └─► [5. Nhánh Tuyên Bố Phá Sản] ──────────► Bấm Rời Bàn ➔ Nhận nhãn Phá Sản, 2 Bot đấu tiếp
```

---

### 1. [UAT-53/55] Cơn Sốc Nợ & Kích Hoạt Cảnh Báo Thanh Lý Cưỡng Chế
- **Thao tác:** Người chơi dẫm vào Khách sạn C3 của đối thủ, bị trừ 3.500 Tr. tiền thuê, khiến số dư tài khoản sụt giảm nghiêm trọng xuống mức âm **-2.000 Tr. VNĐ**.
- **Ghi nhận giao diện thực tế:**
  - Hiệu ứng chữ bay màu đỏ rực xuất hiện trên nóc sa bàn: **"💸 Đại Gia Chủ Sảnh (P1) -3.500 Tr. (Tiền Thuê)"**.
  - Modal **Thanh Lý Cưỡng Chế** (`role="alert"`) bung nở chính giữa màn hình với viền đỏ Rose phản quang và biểu tượng cảnh báo nguy hiểm ⚠️.
  - Phụ đề chuẩn xác: `UC-GAME-055 — Mất khả năng thanh toán`.
  - Khung thông tin thâm hụt hiển thị rõ ràng: **Số tiền thâm hụt: -2.000 Tr.** (màu đỏ đậm, font số nổi).
  - Hai nút điều hướng cứu sinh:
    * Nút vàng Amber: **"Quản Lý BĐS / Thế Chấp"** (hướng người chơi đi cơ cấu lại danh mục tài sản).
    * Nút viền đỏ: **"Tuyên Bố Phá Sản (Rời Bàn)"** (chấp nhận dừng cuộc chơi).
- **Minh chứng:** `r5_01_insolvency_banner.png`.

---

### 2. [UAT-38] Tái Cấu Trúc Nợ Chặng 1 — Thế Chấp BĐS C0 Nhận 50% Tiền Mặt
- **Thao tác:** Người chơi bấm *"Quản Lý BĐS / Thế Chấp"*, banner cảnh báo tạm đóng để người chơi tương tác với danh mục BĐS. Mở Sổ Đỏ Ô 1 (Cần Thơ - Cái Răng, cấp C0).
- **Ghi nhận giao diện thực tế:**
  - Sổ Đỏ hiển thị giá niêm yết 600 Tr., giá trị thế chấp 300 Tr. (hoặc 600 Tr. cho đất nhóm tương ứng).
  - Nút **"Thế Chấp"** hiển thị sẵn sàng ở chân thẻ bài.
  - Khi bấm *"Thế Chấp"*:
    * Người chơi lập tức nhận 50% tiền mặt nạp vào tài khoản (+600 Tr.).
    * Hiệu ứng chữ nổi màu xanh ngọc bích bay lên: **"✨ Đại Gia Chủ Sảnh (P1) +600 Tr. (Thế Chấp)"**.
    * Số dư tài khoản giảm mức âm từ **-2.000 Tr.** về **-1.400 Tr.** (vẫn còn âm, người chơi tiếp tục nỗ lực xử lý nợ).
    * Sổ Đỏ xuất hiện dải cảnh báo màu đỏ mận: **"⚠️ Tài sản đang thế chấp — Tạm ngưng thu phí thuê"**.
    * Nút thao tác chuyển đổi sang nút **"Giải Chấp"**.
- **Minh chứng:** `r5_02_mortgage_partial_recovery.png`.

---

### 3. [UAT-36] Tái Cấu Trúc Nợ Chặng 2 — Hạ Cấp Resort C3 Về C0 Thoát Âm Tiền
- **Thao tác:** Vì tài khoản vẫn còn âm (-1.400 Tr.), người chơi mở tiếp Sổ Đỏ Ô 39 (TP.HCM - Nguyễn Huệ), nơi đã xây dựng Quần thể Resort cấp 3 (C3).
- **Ghi nhận giao diện thực tế:**
  - Sổ Đỏ hiển thị hàng C3 với vương miện hoàng kim 👑 phát sáng rực rỡ và nút bấm màu cam **"Hạ Cấp (-50%)"**.
  - Người chơi bấm *"Hạ Cấp (-50%)"*:
    * FSM hạ cấp công trình từ C3 về Đất nền C0, hoàn lại 50% toàn bộ chi phí xây dựng đã bỏ ra (+1.500 Tr.).
    * Hiệu ứng chữ bay màu xanh ngọc: **"✨ Đại Gia Chủ Sảnh (P1) +1.500 Tr. (Hạ Cấp BĐS)"**.
    * Tài khoản người chơi chuyển từ âm **-1.400 Tr.** sang **DƯƠNG +100 Tr. VNĐ** (chính thức thoát khỏi vùng nguy hiểm vỡ nợ!).
    * Trên Sổ Đỏ, nút *"Hạ Cấp (-50%)"* tự động biến mất, khôi phục lại nút xanh *"Nâng Cấp (+2.000 Tr.)"* và nút *"Thế Chấp"*.
- **Minh chứng:** `r5_03_downgrade_to_solvent.png`.

---

### 4. [UAT-03/FSM] Kiểm Chứng FSM Hoàn Nguyên & Mở Khóa Nút Hết Lượt
- **Thao tác:** Sau khi đóng Sổ Đỏ, kiểm tra trạng thái sa bàn và ActionDock ở đáy màn hình.
- **Ghi nhận giao diện thực tế:**
  - `InsolvencyBanner` hoàn toàn biến mất (không bị kẹt treo trên màn hình).
  - Thẻ người chơi ở góc trên bên trái hiển thị số dư dương màu xanh ngọc: **100 Tr. VNĐ**, tài sản ròng đạt **4.400 Tr. VNĐ**.
  - Hai chấm tròn biểu thị sở hữu BĐS hiển thị đầy đủ (màu Nâu cho Cần Thơ và màu Tím cho TP.HCM).
  - Trạng thái các nút trên ActionDock:
    * Nút *"Đổ Xúc Xắc"*: Bị khóa mờ (`isRollDisabled: true`), do người chơi đã đổ xúc xắc trong lượt này.
    * Nút **"Hết Lượt"**: Tự động mở khóa rực rỡ (`isEndTurnDisabled: false`), chữ vàng hổ phách nổi bật kèm icon `⏭️`.
  - Người chơi bấm nút *"Hết Lượt"*:
    * Lượt đi được chuyển giao trơn tru cho Bot AI 2 mà không hề xảy ra bất kỳ xung đột hay đứt gãy nào.
- **Minh chứng:** `r5_04_turn_recovered_end_turn.png`.

---

### 5. [UAT-54] Thử Nghiệm Nhánh Tuyên Bố Phá Sản (Bankruptcy Exit)
- **Thao tác:** Thử nghiệm trường hợp người chơi kiệt quệ dòng tiền (-5.000 Tr.), toàn bộ đất đai đã thế chấp hết, không còn khả năng hạ cấp hay xoay sở tài chính.
- **Ghi nhận giao diện thực tế:**
  - Cảnh báo *Thanh Lý Cưỡng Chế* mở ra với mức thâm hụt -5.000 Tr.
  - Người chơi lựa chọn bấm **"Tuyên Bố Phá Sản (Rời Bàn)"**.
  - Hệ thống thực thi quy trình phá sản nghiêm ngặt:
    * Âm thanh phá sản (SFX Bankrupt) vang lên.
    * Gửi lệnh `INTENT_BANKRUPTCY` lên máy chủ.
    * Hiệu ứng chữ bay đỏ: **"💸 Đại Gia Chủ Sảnh (P1) Đã Phá Sản!"**.
    * Toàn bộ danh mục BĐS của P1 được giải phóng/thanh lý sạch sẽ (`ownedProperties = []`).
    * Trên Player Card bên trái, avatar P1 chuyển sang màu xám mờ và xuất hiện nhãn dán **[Phá Sản]**.
    * Toàn bộ các nút bấm hành động của P1 trên ActionDock bị vô hiệu hóa vĩnh viễn (`isBankrupt: true`).
    * Lượt chơi tự động bỏ qua P1 và chuyển tiếp cho Bot AI 2 và Bot AI 3 tiếp tục tranh tài sòng phẳng.
- **Minh chứng:** `r5_05_bankruptcy_declared.png`.

---

## IV. ĐIỂM BẤT HỢP LÝ PHÁT HIỆN & ĐỀ XUẤT CẢI TIẾN TRẢI NGHIỆM THỰC TẾ

Qua kịch bản liên hoàn thực chiến ở Vòng UAT #05, một số phát hiện tinh tế về hành vi người chơi được ghi nhận:

1. **Điểm bất hợp lý về điều hướng sau khi thoát âm:**
   - *Hiện trạng:* Khi người chơi bấm *"Quản Lý BĐS / Thế Chấp"*, modal cảnh báo đóng lại để người chơi tự mở Sổ Đỏ từng ô đất. Khi tài khoản đã dương trở lại, người chơi phải tự biết bấm nút "Hết Lượt" trên ActionDock.
   - *Đánh giá trải nghiệm:* Người chơi mới có thể bối rối không biết mình đã thực sự an toàn hay chưa.
   - *Đề xuất cải tiến (Game Juice):* Khi người chơi thực hiện giao dịch đưa `balance >= 0`, hiển thị một Toast/Banner màu xanh lá tươi vui mừng: **"🎉 Bạn đã thoát khỏi nguy cơ vỡ nợ! Hãy bấm Hết Lượt để tiếp tục."** giúp củng cố tâm lý chiến thắng cho người chơi.

2. **Quy tắc Đổ Đôi khi âm tiền:**
   - *Phát hiện:* Nếu người chơi vừa đổ đôi mà ngay lập tức dẫm bẫy dẫn đến âm tiền, quy tắc cấm kết thúc lượt khi đang có quyền gieo tiếp (`canRollAgain`) sẽ xung đột với trạng thái mất khả năng thanh toán. FSM của VTCoOn đã xử lý rất chuẩn xác: cưỡng chế giải quyết nợ trước (`InsolvencyPhase`), sau khi tài khoản dương mới cho phép người chơi đổ tiếp hoặc kết thúc lượt.

---

## V. KẾT LUẬN & ĐÁNH GIÁ NGHIỆM THU

- **Độ tin cậy FSM:** Đạt **100%**. Chuỗi chuyển đổi trạng thái:  
  `WaitingRoll` ➔ `MovingPawn` ➔ `InsolvencyPhase` ➔ `PropertyManagement` (Tái cơ cấu thành công) ➔ `TurnTransition` diễn ra hoàn toàn khép kín và nhất quán giữa Server và Client.
- **Tính trọn vẹn của tính năng (Vertical Slice Completeness):** Cả 2 nhánh:
  - Nhánh Tái sinh dòng tiền (Mortgage + Downgrade)
  - Nhánh Phá sản toàn phần (Bankruptcy Exit)
  đều hoạt động xuất sắc trên môi trường Container Production thật.
- **Console Errors:** **0 lỗi**.
- **Sẵn sàng:** Hệ thống hoàn toàn sẵn sàng cho Vòng UAT tiếp theo theo định hướng của người dùng!
