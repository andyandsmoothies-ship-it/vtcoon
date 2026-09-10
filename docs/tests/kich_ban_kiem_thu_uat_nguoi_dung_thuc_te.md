# BẢN ĐẶC TẢ KỊCH BẢN KIỂM THỬ CHẤP NHẬN NGƯỜI DÙNG THỰC TẾ (REAL-WORLD UAT SPECIFICATION)
DỰ ÁN: CỜ TỶ PHÚ 3D BẢN SẮC VIỆT NAM (VTCOON)

---

## I. TÔN CHỈ KIỂM THỬ UAT THỰC TẾ (UAT PHILOSOPHY)

Khác với Unit Test (kiểm tra hàm toán học) hay E2E Test (kiểm tra selector DOM), **Kiểm thử UAT (User Acceptance Testing)** đánh giá sản phẩm dưới con mắt và thói quen của một **người chơi bình thường ngoài đời thực**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        3 TẦNG ĐÁNH GIÁ CỦA UAT                         │
├────────────────────────────────────────────────────────────────────────┤
│ 1. CẢM QUAN & TRỰC GIÁC (Intuitive Feel)                               │
│    "Tôi có hiểu chuyện gì đang xảy ra không? Có bị hoa mắt không?"     │
├────────────────────────────────────────────────────────────────────────┤
│ 2. NHỊP THỞ TRẬN ĐẤU (Game Pacing & Agency)                            │
│    "Tôi có phải chờ đợi vô nghĩa không? Có cảm giác làm chủ không?"    │
├────────────────────────────────────────────────────────────────────────┤
│ 3. ĐỘ BỀN TRƯỚC THAO TÁC HỖN LOẠN (Chaos & Fault Tolerance)            │
│    "Nếu tôi bấm nhầm, spam nút, đổi tab, F5 thì game có sập không?"   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## II. HỒ SƠ 4 PERSONA NGƯỜI DÙNG NGOÀI ĐỜI (REAL-LIFE PERSONAS)

### Persona 1: Bé Bo — "Tay Nhanh Hơn Não" (The Impatient Spammer)
- **Độ tuổi:** 14 tuổi.
- **Tâm lý:** Thiếu kiên nhẫn, thích cảm giác phản hồi tức thì, không thích đọc chữ dài.
- **Thói quen bấm chuột/màn hình:**
  - Nhấp đúp (double-click) hoặc nhấp liên tục 4-5 lần vào nút "ĐỔ XÚC XẮC".
  - Trong lúc quân cờ đang nhảy, tay vẫn tiếp tục bấm vào bàn cờ, bấm nút "Tài Sản", "Xây Dựng".
  - Khi Modal Sổ Đỏ mở ra, chưa đọc hết đã bấm liên tiếp nút Mua hoặc nút Đóng.
- **Mục tiêu bẫy lỗi:**
  - Lỗi gửi trùng lặp gói tin (Double dispatch).
  - Trạng thái nút bấm không bị disable kịp thời.
  - Lỗi xung đột hoạt ảnh (Animation race condition) khiến FSM bị kẹt.

### Persona 2: Bác Ba — "Mạng Chập Chờn & Hay Đổi Tab" (The Distracted Multitasker)
- **Độ tuổi:** 38 tuổi, chơi game trong giờ nghỉ giải lao.
- **Tâm lý:** Vừa chơi cờ vừa lướt web, đọc tin tức, trả lời tin nhắn Zalo.
- **Thói quen thao tác:**
  - Sau khi đổ xúc xắc xong, chuyển sang tab khác 20 giây rồi mới quay lại mua đất.
  - Thấy mạng hơi giật hoặc quân cờ đứng yên 2 giây là bấm ngay phím `F5` hoặc `Ctrl + F5`.
  - Có thể mở game trên điện thoại bằng 4G sóng yếu hoặc Wi-Fi quán cafe hay rớt gói.
- **Mục tiêu bẫy lỗi:**
  - Lỗi ngắt kết nối WebSocket và khôi phục phiên (`SESSION_INIT`, `RECONNECT`).
  - Lỗi bộ đếm 60 giây bị trôi hoặc tiêu hủy khi đổi tab (`visibilitychange`).
  - Lỗi văng khỏi phòng khi tải lại trang (`ROOM_STARTED`).

### Persona 3: Chú Sáu — "Đại Gia Bất Động Sản Liều Lĩnh" (The High-Roller Gambler)
- **Độ tuổi:** 45 tuổi, thích cảm giác phiêu lưu tài chính và dốc sạch túi.
- **Tâm lý:** Đi đến đâu mua đất đến đó, vay thế chấp tối đa, thích all-in sàn HOSE.
- **Thói quen thao tác:**
  - Luôn chọn nâng cấp kịch khung lên Resort C3 ngay khi có cơ hội.
  - Tiêu đến đồng bạc cuối cùng (tiền mặt < 100 Tr. VNĐ).
  - Khi bị người khác thu tiền thuê vượt quá tiền mặt: Cố tình bấm thế chấp nhiều lô đất cùng lúc, hoặc bấm Từ bỏ để xem game xử lý phá sản ra sao.
- **Mục tiêu bẫy lỗi:**
  - Tính toàn vẹn của FSM khi chuyển sang trạng thái Thấu Chi / Vỡ Nợ (`Insolvency`).
  - Modal Thế Chấp & Giải Chấp có tính đúng 50% và 55% không.
  - Bàn cờ có bị khóa cứng nếu người chơi hết sạch tiền không.

### Persona 4: Cô Tư — "Người Chơi Cẩn Thận & Soi Chi Tiết" (The Meticulous Inspector)
- **Độ tuổi:** 29 tuổi, người dùng khó tính về thẩm mỹ và độ hoàn thiện.
- **Tâm lý:** Để ý từng lỗi chính tả, font chữ, độ mượt 60 FPS, độ che khuất của bảng biểu.
- **Thói quen thao tác:**
  - Bấm vào từng ô đất của đối thủ để xem thông tin sở hữu và giá thuê.
  - Xoay camera, zoom to nhỏ để ngắm sa bàn 3D và hồ nước trung tâm.
  - Bấm thử khay biểu cảm (Emotes) xem có hiện bóng thoại trên đầu quân cờ không.
  - Chú ý nghe tiếng bước chân quân cờ, tiếng xúc xắc nảy, tiếng chuông sàn chứng khoán.
- **Mục tiêu bẫy lỗi:**
  - Lỗi che khuất giao diện (Z-index, clipping, che mất nút quan trọng).
  - Lỗi âm thanh không phát hoặc phát lệch nhịp.
  - Sai lệch quy chuẩn ghi tiền tệ Việt Nam (thống nhất "Tr." và "Tỷ VNĐ").

---

## III. MA TRẬN 15 KỊCH BẢN UAT ĐỜI THỰC (UAT-01 ĐẾN UAT-15)

```
┌────────┬───────────────────────────────────┬──────────────┬─────────────────────────┐
│ Mã UAT │ Tên Tình Huống Đời Thực           │ Persona      │ Trọng Tâm Trải Nghiệm   │
├────────┼───────────────────────────────────┼──────────────┼─────────────────────────┤
│ UAT-01 │ Ấn tượng đầu tiên tại Sảnh Chờ    │ Cô Tư        │ Bố cục, QR, Luật chơi   │
│ UAT-02 │ Nhát đổ xúc xắc mở màn trận đấu   │ Bé Bo        │ Xúc cảm vật lý, Âm thanh│
│ UAT-03 │ Cầm Thẻ Bài Sổ Đỏ 3D mua đất      │ Cô Tư        │ Độ lún nút, Biểu phí    │
│ UAT-04 │ Ngồi xem Bot AI thực hiện lượt đi │ Bé Bo        │ Nhịp thở, Không kẹt FSM │
│ UAT-05 │ Khoảnh khắc Đổ Đôi (Doubles)      │ Bé Bo        │ Phản hồi được đi tiếp   │
│ UAT-06 │ Vượt qua Ô Khởi Hành nhận 2 Tỷ    │ Chú Sáu      │ Tiền bay +2.000 Tr.     │
│ UAT-07 │ Bị áp giải vào Trạm Kiểm Toán     │ Cô Tư        │ 3 lựa chọn nộp phạt     │
│ UAT-08 │ Nghịch ngợm khi chờ người khác đi │ Bé Bo        │ Khóa tương tác an toàn  │
│ UAT-09 │ Lên Sàn Chứng Khoán HOSE          │ Chú Sáu      │ Bảng LED, Chuông sàn    │
│ UAT-10 │ Cơn khủng hoảng cạn kiệt tiền mặt │ Chú Sáu      │ Thế chấp, Giải chấp     │
│ UAT-11 │ Lỡ tay bấm F5 giữa ván đấu        │ Bác Ba       │ Khôi phục tức thì 100%  │
│ UAT-12 │ Rút dây mạng / Mất kết nối 30s    │ Bác Ba       │ Grace period 60s        │
│ UAT-13 │ Đấu giá nảy lửa ô đất bỏ qua      │ Chú Sáu      │ Anti-sniping +3s        │
│ UAT-14 │ Bắn biểu cảm Emotes trêu đối thủ  │ Bé Bo        │ Bong bóng thoại 3s      │
│ UAT-15 │ Đại gia vô địch / Cảnh báo phá sản│ Cả 4 Persona │ Màn hình kết thúc ván   │
└────────┴───────────────────────────────────┴──────────────┴─────────────────────────┘
```

---

## IV. CHI TIẾT TỪNG KỊCH BẢN UAT

### [UAT-01] Ấn tượng đầu tiên tại Sảnh Chờ (Lobby First Impression)
- **Thao tác thực tế:** Mở trình duyệt vào `http://localhost:3000`. Quan sát Sảnh Chờ, thử nhập tên "Đại Gia Sài Gòn", bấm nút thêm 1 Bot, kiểm tra mã phòng và thẻ tóm tắt thể lệ.
- **Tiêu chí người dùng chấp nhận:**
  - Nền sảnh đô thị có chiều sâu sang trọng, không bị màu đen tuyền đơn điệu.
  - Thẻ thể lệ 3 huy hiệu (Vốn 15 Tỷ, 30 Vòng, Cúp vô địch) đọc hiểu trong 3 giây.
  - Bấm "Thêm Bot" xuất hiện ngay slot Bot với nhãn nhận diện rõ ràng.
  - Bấm "BẮT ĐẦU TRẬN ĐẤU" chuyển cảnh mượt mà sang bàn cờ 3D trong dưới 1 giây.
- **Dấu hiệu lỗi trải nghiệm (Friction Red Flag):**
  - Nút bắt đầu bị đơ hoặc báo lỗi `NOT_ENOUGH_PLAYERS` khi đã có Bot.

### [UAT-02] Nhát đổ xúc xắc mở màn trận đấu (The First Roll Sensation)
- **Thao tác thực tế:** Người chơi đến lượt đầu tiên. Nút "ĐỔ XÚC XẮC" phát sáng hào quang vàng. Bấm chuột vào nút.
- **Tiêu chí người dùng chấp nhận:**
  - Nút bấm có hiệu ứng lún cơ học khi nhấn xuống.
  - 2 hạt xúc xắc 3D phóng lên cao, nhào lộn trên không trung và nảy 2 nhịp trên mặt khay nỉ.
  - Âm thanh lắc xúc xắc giòn giã đồng bộ với hoạt cảnh.
  - Mặt số dừng lại khớp hoàn toàn với tổng số ô quân cờ sắp bước đi.
- **Dấu hiệu lỗi trải nghiệm (Friction Red Flag):**
  - Xúc xắc rơi đơ cứng như khối hộp tĩnh, không nghe thấy âm thanh.
  - Bấm nhanh 2 lần nút đổ làm xúc xắc giật lag.

### [UAT-03] Cầm Thẻ Bài Sổ Đỏ 3D mua đất (Title Deed Tactile Moment)
- **Thao tác thực tế:** Quân cờ hạ cánh vào ô đất trống (ví dụ: Ô 1 - Tràng Tiền). Modal Sổ Đỏ bung nở dạng lò xo đàn hồi.
- **Tiêu chí người dùng chấp nhận:**
  - Thẻ bài có viền đôi mạ vàng dập nổi, ruy-băng màu nhận diện địa lý nổi bật.
  - 4 mức phí C0-C3 hiển thị dạng thẻ con có icon sinh động (🚩 Đất nền, 🏡 Nhà phố, 🏨 Khách sạn, 👑 Quần thể Resort).
  - Nút "MUA BẤT ĐỘNG SẢN" màu ngọc bích có chân đế 3D dày 4px, nhấn vào có cảm giác lún thật.
  - Bấm Mua: Tiền mặt trừ đúng giá niêm yết, cờ sở hữu cắm lên ô đất trên bàn cờ 3D ngay lập tức.
- **Dấu hiệu lỗi trải nghiệm (Friction Red Flag):**
  - Modal trông phẳng lì như bảng hóa đơn Excel. Nút bấm phẳng không có phản hồi thị giác.

### [UAT-04] Ngồi xem Bot AI thực hiện lượt đi (Bot Turn Pacing)
- **Thao tác thực tế:** Người chơi bấm "HẾT LƯỢT", chuyển lượt sang Bot 1 và Bot 2. Người chơi ngồi quan sát màn hình.
- **Tiêu chí người dùng chấp nhận:**
  - Không có khoảng "chết" (Dead Air): Đèn báo lượt chuyển sang Avatar của Bot.
  - Có độ trễ tự nhiên (khoảng 800ms) để người chơi kịp thấy xúc xắc của Bot đổ và quân cờ của Bot nhảy từng bước.
  - Người chơi nhìn thấy rõ Bot mua đất hay bỏ qua qua dòng thông báo Toast hoặc nhật ký trận đấu.
  - Khi hết lượt của chuỗi Bot, quyền điều khiển chuyển mượt mà về lại người chơi.
- **Dấu hiệu lỗi trải nghiệm (Friction Red Flag):**
  - Bot nhảy dịch chuyển tức thời (teleport) khiến người chơi không hiểu chuyện gì xảy ra.
  - Bot bị đứng hình vô tận, ván đấu bị đóng băng.

### [UAT-05] Khoảnh khắc Đổ Đôi (The Doubles Surprise)
- **Thao tác thực tế:** Người chơi gieo được 2 mặt số giống nhau (ví dụ: 4 và 4).
- **Tiêu chí người dùng chấp nhận:**
  - Có hiệu ứng hào quang hoặc thông báo nổi bật: "ĐỔ ĐÔI! BẠN ĐƯỢC THÊM MỘT LƯỢT ĐI".
  - Nút "ĐỔ XÚC XẮC" sáng trở lại cho phép gieo tiếp.
  - Người chơi không bị nhầm lẫn giữa "game bị lỗi đổ lại" và "được thưởng lượt do đổ đôi".
  - Nếu đổ đôi lần 3 liên tiếp: Quân cờ bị cưỡng chế đưa thẳng vào Ô 10 (Trạm Kiểm Toán) kèm âm thanh còi báo động.
- **Dấu hiệu lỗi trải nghiệm (Friction Red Flag):**
  - Hiện nút đổ tiếp nhưng không có chữ giải thích lý do khiến người chơi tưởng game bị lag.

### [UAT-06] Vượt qua Ô Khởi Hành nhận 2 Tỷ (Passing GO Cash Euphoria)
- **Thao tác thực tế:** Quân cờ hoàn thành 1 vòng bàn cờ và bước qua hoặc dừng tại Ô 0 (Khởi Hành).
- **Tiêu chí người dùng chấp nhận:**
  - Xuất hiện dòng chữ bay màu xanh ngọc: `+2.000 Tr. VNĐ` bay lướt lên trên đầu quân cờ.
  - Nghe tiếng leng keng của tiền vàng rót vào tài khoản.
  - Con số tiền mặt trên thanh HUD nhảy số tăng dần đầy thỏa mãn.
- **Dấu hiệu lỗi trải nghiệm (Friction Red Flag):**
  - Tiền âm thầm nhảy số trên HUD mà không có bất kỳ hiệu ứng thị giác hay âm thanh nào.

### [UAT-07] Bị áp giải vào Trạm Kiểm Toán (Audit Station & Jail Clarity)
- **Thao tác thực tế:** Người chơi bước vào ô "Vào Tù" hoặc đổ đôi 3 lần, bị đưa đến Ô 10 (Trạm Kiểm Toán).
- **Tiêu chí người dùng chấp nhận:**
  - Có lớp lưới sắt hoặc huy hiệu ổ khóa hiển thị trên ô cờ.
  - Bảng hướng dẫn hiện rõ 3 con đường thoát: (1) Nộp 500 Tr. tiền bảo lãnh, (2) Gieo xúc xắc tìm mặt đôi, (3) Tự do sau 3 vòng.
  - Người chơi biết chính xác mình đang bị khóa những quyền gì (vẫn được thu tiền thuê đất nhưng không được tự do di chuyển).
- **Dấu hiệu lỗi trải nghiệm (Friction Red Flag):**
  - Đến lượt nhưng nút Đổ bị khóa mà không hiện bảng giải thích lý do tại sao bị khóa.

### [UAT-08] Nghịch ngợm khi chờ người khác đi (Fiddling during Downtime)
- **Thao tác thực tế:** Đang là lượt của Bot hoặc đối thủ. Người chơi rảnh tay bấm chuột liên tục vào bàn cờ, bấm vào ô đất của đối thủ, bấm nút Đổ xúc xắc.
- **Tiêu chí người dùng chấp nhận:**
  - Nút "ĐỔ XÚC XẮC" bị vô hiệu hóa an toàn (màu xám mờ, không nhận click).
  - Bấm vào ô đất của đối thủ vẫn mở được Thẻ Bài Sổ Đỏ để xem giá trị nhưng nút "Mua BĐS" bị ẩn hoặc đổi thành "Thuộc sở hữu của Bot 1".
  - Thao tác nghịch ngợm không làm gián đoạn lượt đi của người khác.
- **Dấu hiệu lỗi trải nghiệm (Friction Red Flag):**
  - Mở thẻ bài xem ô đất khác làm mất lượt hoặc gây crash bàn cờ.

### [UAT-09] Lên Sàn Chứng Khoán HOSE (HOSE Stock Thrill)
- **Thao tác thực tế:** Quân cờ dừng tại ô Sàn Chứng Khoán HOSE. Modal Bảng điện tử LED hiện lên.
- **Tiêu chí người dùng chấp nhận:**
  - Giao diện LED 3 màu đặc trưng thị trường chứng khoán Việt Nam: Xanh lá (tăng trần), Đỏ (giảm sàn), Vàng (tham chiếu).
  - Có tiếng chuông gõ sàn (Opening Bell) vang lên khi bảng điện tử mở ra.
  - Kết quả biến động cổ phiếu nhảy số giật giật tạo cảm giác hồi hộp trước khi chốt số.
- **Dấu hiệu lỗi trải nghiệm (Friction Red Flag):**
  - Bảng điện tử như bảng text tĩnh, không có cảm giác sôi động của sàn chứng khoán.

### [UAT-10] Cơn khủng hoảng cạn tiền & Thế chấp (Liquidity Squeeze)
- **Thao tác thực tế:** Người chơi dừng chân tại ô đất C3 của đối thủ và phải trả 3.500 Tr., trong khi tiền mặt chỉ còn 1.000 Tr.
- **Tiêu chí người dùng chấp nhận:**
  - Hệ thống không vội vàng tuyên bố thua ngay lập tức.
  - Màn hình chuyển sang chế độ Cảnh Báo Thiếu Thanh Khoản với tone màu đỏ cảnh báo.
  - Danh sách BĐS hiện ra với nút "Thế Chấp" nhận ngay 50% giá trị để bù vào khoản nợ.
  - Sau khi gom đủ tiền trả nợ, người chơi được tiếp tục ván đấu bình thường.
- **Dấu hiệu lỗi trải nghiệm (Friction Red Flag):**
  - Số tiền mặt bị âm vô tận mà không có cơ chế chặn hoặc ép giải quyết nợ.

### [UAT-11] Lỡ tay bấm F5 giữa ván đấu (Accidental Refresh)
- **Thao tác thực tế:** Ván đấu đang diễn ra ở vòng 5. Người chơi lỡ tay nhấn `F5` hoặc `Ctrl + F5`.
- **Tiêu chí người dùng chấp nhận:**
  - Trình duyệt nạp lại trang trong 1-2 giây.
  - Game tự động dùng `reconnectToken` trong localStorage để nối lại phiên cũ.
  - Màn hình lập tức đưa người chơi trở lại đúng vị trí trên bàn cờ, đúng số tiền, đúng danh sách đất đai và đúng lượt đi hiện tại.
  - Không bao giờ xuất hiện lỗi đỏ `ROOM_STARTED` hoặc bị đẩy ra sảnh ngoài.
- **Dấu hiệu lỗi trải nghiệm (Friction Red Flag):**
  - Bị đá văng ra màn hình ngoài và mất luôn phòng chơi.

### [UAT-12] Rút dây mạng / Chập chờn sóng 30 giây (Network Resilience)
- **Thao tác thực tế:** Ngắt kết nối mạng (hoặc bật chế độ máy bay) trong 20 giây rồi bật lại.
- **Tiêu chí người dùng chấp nhận:**
  - Góc trên màn hình hiện chỉ báo "Đang kết nối lại... (Thử lại sau Xs)".
  - Trong thời gian 60s grace period, phòng chơi không bị hủy.
  - Khi có mạng trở lại, trạng thái ván đấu tự động đồng bộ trơn tru mà không cần người dùng can thiệp thủ công.
- **Dấu hiệu lỗi trải nghiệm (Friction Red Flag):**
  - Mất mạng làm treo vĩnh viễn tab trình duyệt, phải đóng tab mở lại từ đầu.

### [UAT-13] Đấu giá nảy lửa ô đất bỏ qua (High-Stakes Auction)
- **Thao tác thực tế:** Người chơi chính từ chối mua ô đất ➔ Phòng mở phiên Đấu Giá Cưỡng Chế. Các người chơi khác tham gia đặt giá.
- **Tiêu chí người dùng chấp nhận:**
  - Đồng hồ đếm ngược 15 giây hiển thị to rõ ràng.
  - Khi có người đặt giá ở 2 giây cuối, đồng hồ tự động cộng thêm +3 giây (Anti-sniping) kèm âm thanh tích tắc hồi hộp.
  - Người vừa từ chối mua bị khóa nút đặt giá đúng theo quy chuẩn luật chơi.
- **Dấu hiệu lỗi trải nghiệm (Friction Red Flag):**
  - Bị người chơi khác dùng bot bấm giá ở giây thứ 0.1 mà không có cơ chế chống cướp phiên.

### [UAT-14] Bắn biểu cảm Emotes trêu đối thủ (Social Emotes Tray)
- **Thao tác thực tế:** Bấm vào khay Emotes góc màn hình, chọn biểu cảm "Cười lớn" hoặc "Đốt tiền".
- **Tiêu chí người dùng chấp nhận:**
  - Xuất hiện bong bóng thoại chứa icon biểu cảm bay nhấp nhô trên đầu quân cờ của người chơi trong 3 giây.
  - Tất cả người chơi khác trong phòng (kể cả trên thiết bị khác) đều nhìn thấy bong bóng này.
  - Có âm thanh chọc ngoáy ngắn vui nhộn kèm theo.
- **Dấu hiệu lỗi trải nghiệm (Friction Red Flag):**
  - Bấm emote không thấy phản hồi gì hoặc che khuất bàn cờ quá lâu.

### [UAT-15] Đại gia vô địch / Cảnh báo phá sản (Climax & GameOver)
- **Thao tác thực tế:** Tất cả đối thủ bị phá sản hoặc trận đấu hoàn thành 30 vòng.
- **Tiêu chí người dùng chấp nhận:**
  - Màn hình vinh danh "ĐẠI GIA VÔ ĐỊCH ĐỊA ỐC" bùng nổ với pháo hoa giấy và cúp vàng 3D lấp lánh.
  - Bảng tổng kết tài sản chi tiết (Tiền mặt, BĐS, Cổ phiếu) xếp hạng từ hạng 1 đến hạng 4.
  - Có 2 nút bấm rõ ràng: "CHƠI LẠI TRẬN MỚI" hoặc "VỀ SẢNH CHỜ".
- **Dấu hiệu lỗi trải nghiệm (Friction Red Flag):**
  - Ván đấu kết thúc đột ngột mà không có màn hình tổng kết, người chơi ngơ ngác không biết ai thắng ai thua.

---

## V. THANG ĐO TRẢI NGHIỆM THỰC TẾ (HEURISTIC FRICTION INDEX)

Mỗi kịch bản UAT khi thực hiện sẽ được chấm điểm trên thang 5 mức độ:

| Điểm | Phân loại | Cảm xúc của người chơi thực tế |
| :---: | :--- | :--- |
| **1** | **Gây ức chế (Frustrating)** | Bị kẹt ván, văng game, tiền nhảy sai, muốn tắt ứng dụng ngay lập tức. |
| **2** | **Gây bối rối (Confusing)** | Không hiểu tại sao nút bị khóa, không biết đến lượt ai, phải tự đoán luật. |
| **3** | **Tạm chấp nhận (Passable)** | Chơi được nhưng giống phần mềm kế toán/văn phòng, thiếu cảm xúc game. |
| **4** | **Thỏa mãn (Satisfying)** | Thao tác mượt mà, xúc giác tốt, âm thanh hình ảnh đồng điệu, chơi cuốn hút. |
| **5** | **Xuất sắc (Delightful)** | Đạt chuẩn game thương mại cao cấp, giàu bản sắc văn hóa Việt Nam, cảm xúc chiến thắng bùng nổ. |

---

## VI. BẢNG THEO DÕI NGHIỆM THU UAT THỰC TẾ (LIVING UAT SCORECARD)

| Mã UAT | Kịch bản kiểm thử | Persona thực hiện | Điểm UAT (1-5) | Hiện trạng ghi nhận (Vòng #02) | Hành động tiếp theo |
| :--- | :--- | :--- | :---: | :--- | :--- |
| UAT-01 | Ấn tượng Sảnh Chờ | Cô Tư | **5/5** | Thêm 2 Bot AI, nhận đủ 3 người chơi, đổi tính cách mượt | Đạt chuẩn nghiệm thu |
| UAT-02 | Nhát đổ & Triệt lỗi | Bé Bo | **5/5** | Triệt tiêu 100% CANNOT_ROLL, xúc xắc nảy 3D sống động | Đạt chuẩn nghiệm thu |
| UAT-03 | Cầm Thẻ Bài Sổ Đỏ | Cô Tư | **4.5/5** | Mua đất Bình Dương 1.000 Tr., tài sản nhảy 16.000 Tr. | Cần thêm pr-10 tránh đè nút X |
| UAT-04 | Nhịp thở Bot AI | Bé Bo | **5/5** | Chuỗi Bot 1 + Bot 2 chạy tuần tự, 0 deadlock, trả lượt mượt | Đạt chuẩn nghiệm thu |
| UAT-05 | Khoảnh khắc Đổ Đôi | Bé Bo | **Chờ test #03** | Cơ chế consecutiveDoubles đã sẵn sàng | Kích hoạt trong vòng 3 |
| UAT-06 | Nhận 2 Tỷ ô Khởi Hành | Chú Sáu | **Chờ test #03** | Chờ pawn hoàn thành 1 vòng bàn cờ | Kích hoạt trong vòng 3 |
| UAT-07 | Trạm Kiểm Toán Ô 10 | Cô Tư | **Chờ test #03** | 3 lựa chọn ra tù đã code | Kích hoạt trong vòng 3 |
| UAT-08 | Thao tác khi chờ đợi | Bé Bo | **5/5** | Nút Hết Lượt và Đổ khóa an toàn khi đối thủ đang đi | Đạt chuẩn nghiệm thu |
| UAT-09 | Bảng LED sàn HOSE | Chú Sáu | **Chờ test #03** | Bảng LED 3 màu và chuông sàn sẵn sàng | Kích hoạt trong vòng 3 |
| UAT-10 | Khủng hoảng cạn tiền | Chú Sáu | **Chờ test #03** | Thế chấp 50% và giải chấp 110% | Kích hoạt trong vòng 3 |
| UAT-11 | Bấm F5 giữa ván đấu | Bác Ba | **5/5** | Khôi phục 100% bàn cờ có đất, 0 lỗi đỏ, không văng | Đạt chuẩn nghiệm thu |
| UAT-12 | Mất mạng 30 giây | Bác Ba | **Chờ test #03** | Grace period 60s trên server | Thử nghiệm ngắt mạng |
| UAT-13 | Đấu giá nảy lửa | Chú Sáu | **Chờ test #03** | Anti-sniping +3s đã code | Thử nghiệm từ chối mua đất |
| UAT-14 | Bắn biểu cảm Emotes | Bé Bo | **5/5** | Bấm biểu cảm 😄 trên ActionDock mượt mà | Đạt chuẩn nghiệm thu |
| UAT-15 | Đại gia vô địch | Cả 4 Persona | **Chờ test #03** | Màn hình vinh danh khi đối thủ phá sản | Kích hoạt trong vòng 3 |

---

## VII. BỘ KỊCH BẢN UAT CHUYÊN SÂU TRUNG CUỘC & TÀN CUỘC (DEEP MID-GAME & ENDGAME BATTERY)

Để phản ánh chân thực một ván cờ tỷ phú VTCoOn kéo dài từ vòng 6 đến vòng 30, hệ thống kiểm thử bổ sung **30 kịch bản UAT chuyên sâu (UAT-16 đến UAT-45)** khai thác các tính năng mới, lạ và các tình huống va chạm tài chính phức tạp:

```
┌────────────────────────────────────────────────────────────────────────┐
│             MA TRẬN 6 NHÓM TÍNH NĂNG MỚI LẠ & ĐỘT BIẾN                 │
├────────────────────────────────────────────────────────────────────────┤
│ NHÓM A: ĐẾ CHẾ ĐỘC QUYỀN MÀU & NÂNG CẤP RESORT C3 (UAT-16 ➔ UAT-20)   │
│ NHÓM B: SÀN CHỨNG KHOÁN HOSE & TRẠM THU PHÍ ETC   (UAT-21 ➔ UAT-25)   │
│ NHÓM C: SÓNG GIÓ THẺ SỰ KIỆN & M&A THÂU TÓM       (UAT-26 ➔ UAT-30)   │
│ NHÓM D: TRẠM KIỂM TOÁN Ô 10 & CHUỖI ĐỔ ĐÔI X3     (UAT-31 ➔ UAT-35)   │
│ NHÓM E: KHỦNG HOẢNG THANH KHOẢN & PHÁ SẢN 2 NHÁNH (UAT-36 ➔ UAT-40)   │
│ NHÓM F: ĐÀM PHÁN P2P & TÂM LÝ CHƠI GAME ĐỜI THỰC  (UAT-41 ➔ UAT-45)   │
└────────────────────────────────────────────────────────────────────────┘
```

---

### NHÓM A: ĐẾ CHẾ ĐỘC QUYỀN MÀU & NÂNG CẤP RESORT C3

#### [UAT-16] Gom đủ Bộ Màu Độc Quyền Hà Nội / Sài Gòn (Monopoly Set Completion)
- **Bối cảnh:** Vòng 7. Chú Sáu đã sở hữu Tràng Tiền, Đinh Tiên Hoàng và vừa mua được Hàng Đào.
- **Thao tác thực tế:** Mua thành công ô cuối cùng trong nhóm màu xanh dương. Quan sát hiệu ứng bàn cờ.
- **Tiêu chí chấp nhận:**
  - Có tiếng chuông kèn vang lên và hiệu ứng hào quang quét qua toàn bộ 3 ô trong nhóm.
  - Thông báo Toast hiển thị: *"ĐỘC QUYỀN HÀ NỘI! Giá thuê cơ bản của toàn bộ nhóm màu tự động nhân đôi (x2)!"*.
  - Nút "Xây Dựng" trên ActionDock sáng đèn cho phép nâng cấp nhà.
- **Friction Red Flag:** Giá thuê trên thẻ bài không tự nhân đôi; người chơi không biết mình đã gom đủ bộ màu.

#### [UAT-17] Quy Tắc Xây Dựng Đều Tay (Even Building Rule)
- **Bối cảnh:** Chú Sáu muốn dồn hết tiền xây Resort C3 ngay tại Tràng Tiền trong khi Hàng Đào vẫn là đất nền C0.
- **Thao tác thực tế:** Mở Modal Xây Dựng, bấm nâng cấp liên tục ô Tràng Tiền lên C2.
- **Tiêu chí chấp nhận:**
  - Nút nâng cấp Tràng Tiền lên C2 bị khóa với dòng giải thích: *"Quy tắc xây dựng đều tay: Cần nâng cấp Hàng Đào và Đinh Tiên Hoàng lên C1 trước khi xây C2"*.
  - Ngăn chặn triệt để hành vi "dồn nhà một ô" phá vỡ cân bằng kinh tế game.
- **Friction Red Flag:** Cho phép nâng cấp lệch mà không có cảnh báo, hoặc báo lỗi bằng mã code tiếng Anh khô khan.

#### [UAT-18] Cột Mốc Quần Thể Resort / TTTM C3 (The Golden Crown C3 Moment)
- **Bối cảnh:** Vòng 12. Chú Sáu dốc 3.000 Tr. nâng cấp lô đất lên Resort C3.
- **Thao tác thực tế:** Nhấn nút "Nâng Cấp C3".
- **Tiêu chí chấp nhận:**
  - Hiệu ứng Golden Glow lấp lánh bùng nổ quanh ô đất trên sa bàn 3D.
  - Xuất hiện vương miện hoàng kim 👑 phát sáng cạnh tên địa phương.
  - Phí dừng chân nhảy vọt lên mức cực đại (ví dụ: 4.000 Tr. VNĐ).
  - Khay Social Emotes của đối thủ tự động nhấp nháy gợi ý biểu cảm "Khóc thét" hoặc "Cay cú".
- **Friction Red Flag:** Lên C3 nhưng mô hình 3D trên bàn cờ không đổi, không có hào quang, cảm giác giống hệt C1.

#### [UAT-19] Bẫy Thuê C3 Khiến Đối Thủ Mất Phanh (The C3 Extortion)
- **Bối cảnh:** Vòng 14. Bot AI 2 hoặc người chơi khác gieo xúc xắc và hạ cánh đúng vào Resort C3 của Chú Sáu.
- **Thao tác thực tế:** Quan sát trừ tiền và camera 3D.
- **Tiêu chí chấp nhận:**
  - Camera điện ảnh (`AdaptiveCinematicCamera`) tự động zoom cận cảnh vào ô Resort C3.
  - Dòng chữ bay màu đỏ khổng lồ: `-4.000 Tr.` bay lên từ đầu quân cờ đối thủ kèm âm thanh thu thuế ngân vang.
  - Tiền mặt của Chú Sáu nhảy số tăng vọt `+4.000 Tr.` màu xanh ngọc.
- **Friction Red Flag:** Trừ tiền trong im lặng, camera không đổi góc, không tạo được cảm giác thỏa mãn khi đối thủ dẫm bẫy.

#### [UAT-20] Bán Hạ Cấp Nhà Khi Kẹt Tiền (Downgrade Property for Cash)
- **Bối cảnh:** Người chơi kẹt tiền mặt cần thanh khoản khẩn cấp.
- **Thao tác thực tế:** Mở Modal Sổ Đỏ của ô đất C2, bấm nút "Hạ Cấp (-50%)".
- **Tiêu chí chấp nhận:**
  - Có hộp thoại xác nhận: *"Hạ cấp Khách Sạn C2 về Nhà Phố C1? Bạn sẽ nhận lại 50% chi phí xây dựng (1.000 Tr. VNĐ)"*.
  - Bấm Đồng ý: Mô hình khách sạn trên bàn cờ thu nhỏ về nhà phố, tài khoản cộng ngay 1.000 Tr., phí thuê giảm về mức C1.
- **Friction Red Flag:** Bấm hạ cấp bị trừ thẳng tay không có xác nhận; bàn cờ 3D vẫn giữ nguyên mô hình khách sạn cũ.

---

### NHÓM B: SÀN CHỨNG KHOÁN HOSE & TRẠM THU PHÍ ETC

#### [UAT-21] Đặt Cược Sàn HOSE Tăng Trần (HOSE Ceiling Rally)
- **Bối cảnh:** Vòng 8. Chú Sáu dừng chân tại Ô 12 (Sàn Chứng Khoán HOSE).
- **Thao tác thực tế:** Bảng LED hiện lên với tiếng chuông gõ sàn. Chọn mức cược 1.000 Tr. VNĐ vào cửa "Tăng Trần".
- **Tiêu chí chấp nhận:**
  - Các chỉ số VN-Index, HNX nhảy số xanh lá giật giật tạo cảm giác nghẹt thở.
  - Bảng điện tử chốt số: Tăng trần +7%!
  - Âm thanh chuông reo ăn mừng, tài khoản nhận thưởng `+1.000 Tr.` lãi ròng (tổng thu 2.000 Tr.).
- **Friction Red Flag:** Bảng LED không có hoạt ảnh nhảy số, kết quả hiện ra ngay lập tức làm mất tính hồi hộp.

#### [UAT-22] Sàn HOSE Giảm Sàn Đo Ván (HOSE Floor Crash)
- **Bối cảnh:** Bé Bo vào sàn HOSE và cược 1.000 Tr. nhưng thị trường lao dốc.
- **Thao tác thực tế:** Bảng điện tử hiện màu đỏ sàn rực rỡ kèm tiếng còi giảm điểm.
- **Tiêu chí chấp nhận:**
  - Toàn bộ bảng LED đổi sang màu xanh lơ (Floor / Giảm sàn -7%).
  - Dòng chữ bay đỏ `-1.000 Tr.` bay lên, người chơi mất sạch khoản tiền cược.
  - Toast an ủi: *"Thị trường điều chỉnh mạnh! Chúc bạn may mắn lần sau"*.
- **Friction Red Flag:** Bị trừ tiền nhưng bảng LED vẫn hiện màu xanh hoặc không có âm thanh báo thua.

#### [UAT-23] Đi Qua Trạm Thu Phí Không Dừng ETC (BOT Toll Gate)
- **Bối cảnh:** Quân cờ vượt qua Ô 28 (Trạm Thu Phí Cao Tốc ETC).
- **Thao tác thực tế:** Dừng chân tại ô ETC.
- **Tiêu chí chấp nhận:**
  - Màn hình hiển thị biển báo giao thông điện tử: *"Trạm Thu Phí Không Dừng VETC / ePass"*.
  - Nếu chưa nâng cấp thẻ ETC: Bị tự động trừ 300 Tr. phí cầu đường nộp vào Quỹ Kho Bạc.
- **Friction Red Flag:** Tiền trừ nhưng không cộng vào Quỹ Kho Bạc; thiếu âm thanh "Bíp" nhận diện thẻ ETC.

#### [UAT-24] Nâng Cấp Thẻ ETC VIP Giảm Phí Trọn Đời (ETC VIP Upgrade)
- **Bối cảnh:** Chú Sáu có nhiều tiền muốn tối ưu hóa chi phí đường dài.
- **Thao tác thực tế:** Bấm "Nâng Cấp Thẻ ETC" với giá 1.000 Tr. VNĐ.
- **Tiêu chí chấp nhận:**
  - Nhận ngay huy hiệu thẻ xanh `VETC VIP` trên Avatar người chơi.
  - Từ vòng sau trở đi, mỗi lần qua trạm thu phí được miễn phí 100% hoặc giảm 50% trọn đời ván đấu.
- **Friction Red Flag:** Đã nộp 1.000 Tr. nâng cấp nhưng các vòng sau qua trạm vẫn bị trừ tiền bình thường.

#### [UAT-25] Mạng Lưới 4 Trạm Giao Thông Liên Hoàn (Railroad & Airport Network)
- **Bối cảnh:** Cô Tư thâu tóm Ga Cát Bi, Ga Đà Nẵng và Sân Bay Tân Sơn Nhất (3/4 trạm).
- **Thao tác thực tế:** Đối thủ dẫm chân vào Ga Đà Nẵng.
- **Tiêu chí chấp nhận:**
  - Thẻ bài hiển thị biểu phí bậc 3: `3 Trạm Liên Kết = 2.000 Tr. VNĐ`.
  - Đối thủ phải nộp đúng 2.000 Tr. thay vì mức 500 Tr. của 1 trạm đơn lẻ.
- **Friction Red Flag:** Biểu phí trạm giao thông không lũy tiến theo số lượng trạm sở hữu.

---

### NHÓM C: SÓNG GIÓ THẺ SỰ KIỆN & M&A THÂU TÓM

#### [UAT-26] Thẻ Cơ Hội "Bão Lũ Miền Trung" (Typhoon Freeze Rent)
- **Bối cảnh:** Rút phải thẻ Thị Trường: *"Bão Lũ Miền Trung: Đóng băng thu tiền thuê 1 vòng toàn bộ ô miền Trung"*.
- **Thao tác thực tế:** Đối thủ dẫm vào ô Huế hoặc Đà Nẵng có Resort C3 trong vòng này.
- **Tiêu chí chấp nhận:**
  - Ô đất hiện biểu tượng đám mây mưa và huy hiệu tạm dừng thu phí.
  - Đối thủ dừng chân KHÔNG bị mất tiền thuê.
  - Toast thông báo: *"Miễn tiền thuê do ảnh hưởng thiên tai bão lũ!"*.
- **Friction Red Flag:** Thẻ đã kích hoạt nhưng đối thủ dẫm vào vẫn bị đè ra trừ tiền.

#### [UAT-27] Thẻ Phạt Kiểm Tra PCCC Khách Sạn (Fire Safety Audit Penalty)
- **Bối cảnh:** Chú Sáu sở hữu 4 nhà C1, 2 khách sạn C2 và 1 Resort C3. Rút phải thẻ *"Kiểm Tra An Toàn PCCC Toàn Quốc"*.
- **Thao tác thực tế:** Hệ thống tính toán mức phạt: 100 Tr./C1, 300 Tr./C2, 500 Tr./C3.
- **Tiêu chí chấp nhận:**
  - Bảng kê chi tiết hiện lên: `(4 x 100) + (2 x 300) + (1 x 500) = 1.500 Tr. VNĐ`.
  - Tiền bị trừ chính xác 1.500 Tr. và chuyển thẳng vào Kho Bạc Nhà Nước.
- **Friction Red Flag:** Tính sai số tiền phạt hoặc trừ tiền ảo không nộp vào Kho Bạc.

#### [UAT-28] Thẻ Miễn Trừ Ngoại Giao (Get Out of Jail Free)
- **Bối cảnh:** Cô Tư rút được Thẻ Miễn Trừ Ngoại Giao và cất vào kho đồ cá nhân.
- **Thao tác thực tế:** Ở vòng sau, Cô Tư bị áp giải vào Trạm Kiểm Toán Ô 10.
- **Tiêu chí chấp nhận:**
  - Modal ra tù xuất hiện nút đặc biệt: *"SỬ DỤNG THẺ MIỄN TRỪ NGOẠI GIAO"*.
  - Nhấp vào: Thẻ biến mất khỏi kho đồ, quân cờ lập tức được tự do mà không mất 500 Tr. tiền bảo lãnh.
- **Friction Red Flag:** Có thẻ trong người nhưng game không cho dùng, vẫn bắt nộp 500 Tr.

#### [UAT-29] Thẻ M&A Thâu Tóm Cưỡng Chế (Hostile Takeover)
- **Bối cảnh:** Rút được thẻ M&A: Cho phép mua lại 1 ô đất C0 bất kỳ của đối thủ với giá 150% niêm yết.
- **Thao tác thực tế:** Chọn ô đất C0 của Bot AI để thâu tóm nhằm hoàn thành bộ màu.
- **Tiêu chí chấp nhận:**
  - Tiền mặt của người mua trừ 150% giá niêm yết.
  - Đối thủ nhận 150% tiền mặt tương ứng.
  - Cờ sở hữu trên sa bàn 3D đổi màu sang phe người mua ngay lập tức.
- **Friction Red Flag:** Cho phép thâu tóm cả ô đất đã xây nhà C1-C3 (vi phạm luật cấm M&A đất đã xây dựng).

#### [UAT-30] Thẻ Sốt Đất Đông Anh / Thủ Đức (Real Estate Boom)
- **Bối cảnh:** Rút phải thẻ kích hoạt sóng đầu tư bất động sản.
- **Thao tác thực tế:** Toàn bộ khu vực đất ven đô tăng giá thuê 200% trong 3 lượt chơi.
- **Tiêu chí chấp nhận:**
  - Có hiệu ứng lửa bốc cháy màu vàng cam trên các ô đất được kích sóng.
  - Sau 3 lượt chơi, hiệu ứng tự động hết hạn và giá thuê trở về bình thường.
- **Friction Red Flag:** Hiệu ứng sốt đất tồn tại vĩnh viễn không chịu hết hạn.

---

### NHÓM D: TRẠM KIỂM TOÁN Ô 10, ĐỔ ĐÔI X3 & TẠM GIAM

#### [UAT-31] Chuỗi Đổ Đôi Chaining Lần 1 và Lần 2 (Doubles Streak)
- **Bối cảnh:** Bé Bo gieo được mặt [3, 3] ở lượt đầu, sau đó tiếp tục gieo được [5, 5].
- **Thao tác thực tế:** Quan sát nút Đổ và trạng thái lượt.
- **Tiêu chí chấp nhận:**
  - Lần 1: Quân cờ đi 6 bước, nút Đổ đổi tên thành `Đổ Tiếp (Đôi)`. Lượt chơi KHÔNG bị chuyển cho người khác.
  - Lần 2: Quân cờ đi tiếp 10 bước, nút Đổ tiếp tục cho phép gieo tiếp.
- **Friction Red Flag:** Vừa đổ đôi xong thì game tự động kết thúc lượt hoặc khóa nút không cho đi tiếp.

#### [UAT-32] Đổ Đôi Lần 3 — Còi Hú Bị Tống Giam (Three Doubles to Jail)
- **Bối cảnh:** Bé Bo hưng phấn gieo tiếp lần 3 và ra tiếp [2, 2] (3 lần đôi liên tiếp).
- **Thao tác thực tế:** Quan sát phản ứng của FSM.
- **Tiêu chí chấp nhận:**
  - Còi báo động rú vang. Đèn đỏ nhấp nháy trên màn hình.
  - Quân cờ KHÔNG được bước 4 bước, mà bị cưỡng chế bốc thẳng về Ô 10 (Trạm Kiểm Toán).
  - Lượt chơi lập tức kết thúc và chuyển giao ngay cho đối thủ.
- **Friction Red Flag:** Vẫn cho người chơi bước tiếp 4 bước hoặc không chuyển quân cờ về Ô 10.

#### [UAT-33] Nộp Tiền Bảo Lãnh 500 Tr. Ra Tù Ngay (Instant Bailout)
- **Bối cảnh:** Bác Ba không muốn ngồi tù làm mất nhịp trận đấu.
- **Thao tác thực tế:** Đến lượt trong Trạm Kiểm Toán, bấm nút *"NỘP 500 TR. TIỀN BẢO LÃNH"*.
- **Tiêu chí chấp nhận:**
  - Tiền mặt trừ 500 Tr. nộp vào Quỹ Kho Bạc.
  - Ổ khóa trên quân cờ mở ra, nút "ĐỔ XÚC XẮC" lập tức sáng đèn cho phép gieo xúc xắc và di chuyển ngay trong lượt này.
- **Friction Red Flag:** Nộp tiền xong nhưng bị bắt hết lượt luôn mà không được đổ xúc xắc.

#### [UAT-34] Cầu May Đổ Đôi Trong Tù (Rolling for Doubles in Jail)
- **Bối cảnh:** Người chơi cạn tiền không muốn nộp 500 Tr., chọn phương án gieo tìm mặt đôi.
- **Thao tác thực tế:** Bấm gieo xúc xắc từ trong Trạm Kiểm Toán.
- **Tiêu chí chấp nhận:**
  - Nếu đổ được mặt đôi (ví dụ: [4, 4]): Được thả tự do ngay lập tức, quân cờ bước đi đúng 8 bước, KHÔNG bị trừ 500 Tr.
  - Nếu không ra mặt đôi: Quân cờ đứng yên tại Ô 10, lượt chơi kết thúc, bộ đếm số vòng giam tăng lên 1/3.
- **Friction Red Flag:** Không ra mặt đôi nhưng quân cờ vẫn tự động bước đi.

#### [UAT-35] Thu Tiền Thuê Thụ Động Khi Đang Ngồi Tù (Earning Rent while Incarcerated)
- **Bối cảnh:** Bác Ba đang bị giam ở Ô 10. Đối thủ ngoài bàn cờ dẫm vào ô đất có Resort C3 của Bác Ba.
- **Thao tác thực tế:** Quan sát dòng tiền thu về.
- **Tiêu chí chấp nhận:**
  - Đúng theo luật cờ tỷ phú hiện đại: Người chơi trong tù VẪN ĐƯỢC THU ĐỦ 100% TIỀN THUÊ ĐẤT.
  - Tiền mặt của Bác Ba vẫn tăng lên kèm âm thanh leng keng bình thường.
- **Friction Red Flag:** Game tước quyền thu tiền thuê của người chơi đang trong tù.

---

### NHÓM E: KHỦNG HOẢNG THANH KHOẢN, CƯỠNG CHẾ THẾ CHẤP & PHÁ SẢN 2 NHÁNH

#### [UAT-36] Cơn Ác Mộng Cạn Kiệt Tiền Mặt (Insolvency Trigger)
- **Bối cảnh:** Chú Sáu còn 500 Tr. nhưng dẫm vào ô Resort đối thủ bị đòi 3.500 Tr. (Thiếu 3.000 Tr.).
- **Thao tác thực tế:** Quân cờ hạ cánh.
- **Tiêu chí chấp nhận:**
  - Màn hình chuyển sang chế độ Khủng Hoảng Thanh Khoản (Viền màn hình nhấp nháy đỏ cảnh báo).
  - Bảng điều khiển hiện rõ: *"Khoản nợ: 3.500 Tr. | Tiền mặt: 500 Tr. | Cần thanh khoản thêm: 3.000 Tr."*.
  - Toàn bộ các nút Đổ xúc xắc, Hết lượt bị khóa chặt. Người chơi chỉ được chọn: Thế Chấp BĐS, Bán Hạ Cấp Nhà, hoặc Tuyên Bố Phá Sản.
- **Friction Red Flag:** Tiền mặt bị trừ âm xuống `-3.000 Tr.` và ván đấu vẫn cho bấm Hết Lượt như không có gì xảy ra.

#### [UAT-37] Thế Chấp Bất Động Sản Nhận 50% Tiền Mặt (Mortgage Asset)
- **Bối cảnh:** Chú Sáu bấm thế chấp lô đất Nha Trang (giá niêm yết 2.000 Tr.).
- **Thao tác thực tế:** Bấm nút "Thế Chấp" trên thẻ bài.
- **Tiêu chí chấp nhận:**
  - Nhận ngay 1.000 Tr. VNĐ tiền mặt (50% giá niêm yết).
  - Ô đất trên sa bàn 3D chuyển sang trạng thái thế chấp (màu xám mờ, cắm biển "ĐANG THẾ CHẤP").
  - Ô đất bị đóng băng: Người khác dẫm vào ô này trong thời gian thế chấp sẽ KHÔNG PHẢI TRẢ TIỀN THUÊ.
- **Friction Red Flag:** Ô đất đã thế chấp nhưng người khác dẫm vào vẫn bị thu tiền thuê.

#### [UAT-38] Giải Chấp Bất Động Sản Chịu Lãi Suất 10% (Redeem Mortgage)
- **Bối cảnh:** Vòng sau Chú Sáu kiếm lại được tiền và muốn chuộc lại lô đất Nha Trang.
- **Thao tác thực tế:** Mở thẻ bài ô đất đang thế chấp, bấm nút "Giải Chấp".
- **Tiêu chí chấp nhận:**
  - Số tiền chuộc phải nộp đúng bằng: `Giá thế chấp (1.000 Tr.) + 10% phí lãi suất ngân hàng (100 Tr.) = 1.100 Tr. VNĐ`.
  - 100 Tr. tiền lãi được nộp vào Quỹ Kho Bạc.
  - Ô đất khôi phục lại màu sắc rực rỡ và quyền thu tiền thuê bình thường.
- **Friction Red Flag:** Chuộc lại đất nhưng chỉ phải trả đúng 1.000 Tr. (thiếu 10% phí giải chấp theo luật).

#### [UAT-39] Phá Sản Nhánh 1: Sang Tên Toàn Bộ Cho Chủ Nợ (Player-to-Player Bankruptcy)
- **Bối cảnh:** Chú Sáu thế chấp hết tài sản vẫn thiếu 1.000 Tr., bấm chấp nhận "Phá Sản".
- **Thao tác thực tế:** Kích hoạt phá sản vì nợ người chơi khác.
- **Tiêu chí chấp nhận:**
  - Toàn bộ số tiền mặt còn lại và tất cả sổ đỏ của Chú Sáu tự động sang tên cho chủ nợ.
  - Đối với các ô đất đang thế chấp được bàn giao: Chủ nợ có quyền nộp 10% lãi để giữ nguyên thế chấp hoặc nộp 110% để giải chấp ngay.
  - Quân cờ của Chú Sáu biến mất khỏi sa bàn 3D kèm thông báo: *"Chú Sáu đã tuyên bố phá sản!"*.
- **Friction Red Flag:** Đất của người phá sản bị trả về ngân hàng thay vì sang tên cho chủ nợ.

#### [UAT-40] Phá Sản Nhánh 2: Tịch Thu Đấu Giá Cưỡng Chế 70% (Foreclosure Auction)
- **Bối cảnh:** Một người chơi phá sản do nợ Thuế / Phạt Kho Bạc / Không đủ tiền nộp PCCC.
- **Thao tác thực tế:** Kích hoạt phá sản vì nợ Nhà Nước / Ngân Hàng.
- **Tiêu chí chấp nhận:**
  - Toàn bộ nhà cửa C1-C3 bị san phẳng về đất nền C0 (triệt tiêu tài sản dư thừa).
  - Toàn bộ đất đai bị tịch thu và đưa vào phiên Đấu Giá Cưỡng Chế cho tất cả người chơi còn sống với giá sàn 70% giá niêm yết.
  - Đảm bảo đất đai được tái phân phối công bằng cho thị trường.
- **Friction Red Flag:** Nhà cửa giữ nguyên không san phẳng hoặc đất bị xóa vĩnh viễn khỏi bàn cờ.

---

### NHÓM F: ĐÀM PHÁN P2P & TÂM LÝ CHƠI GAME ĐỜI THỰC

#### [UAT-41] Gạ Kèo Đổi Đất Song Phương P2P (P2P Trade Proposal)
- **Bối cảnh:** Cô Tư thiếu ô Đinh Tiên Hoàng để đủ bộ Hà Nội, ô này đang do Bot AI 2 nắm giữ.
- **Thao tác thực tế:** Mở Modal Đàm Phán, chọn đề nghị: *"Đổi ô Vũng Tàu + 800 Tr. VNĐ tiền mặt lấy ô Đinh Tiên Hoàng của Bot 2"*. Bấm Gửi Đề Nghị.
- **Tiêu chí chấp nhận:**
  - Bot AI tính toán giá trị chiến lược (đánh giá theo tính cách Balanced / Aggressive / Passive).
  - Nếu đề nghị có lợi: Bot đồng ý, tiền mặt và đất đai tự động hoán đổi.
  - Trừ 5% thuế chuyển nhượng tài sản nộp về Quỹ Kho Bạc.
- **Friction Red Flag:** Bot luôn từ chối 100% mọi đề nghị vô điều kiện, hoặc đồng ý những kèo đổi đất lỗ trắng mắt.

#### [UAT-42] Cấm Tuyệt Đối Đổi Đất Đang Có Công Trình C1-C3 (Trade Integrity Guard)
- **Bối cảnh:** Người chơi cố tình chọn một ô đất đã xây Khách Sạn C2 để đưa vào danh sách trao đổi P2P.
- **Thao tác thực tế:** Chọn ô đất C2 trong Modal Đàm Phán.
- **Tiêu chí chấp nhận:**
  - Hệ thống báo lỗi ngay lập tức: *"Không thể giao dịch bất động sản đã xây dựng công trình! Hãy bán hạ cấp nhà về C0 trước khi chuyển nhượng"*.
  - Đảm bảo tính toàn vẹn của quy tắc xây dựng đồng bộ.
- **Friction Red Flag:** Cho phép đổi cả đất lẫn khách sạn làm vỡ quy tắc Even-building của người nhận.

#### [UAT-43] Đấu Giá Cướp Hàng Giây Cuối & Anti-Sniping (Auction Sniping Battle)
- **Bối cảnh:** Phiên đấu giá ô đất Bến Thành mở ra. Đồng hồ đếm ngược từ 15s xuống còn 2s.
- **Thao tác thực tế:** Chú Sáu bấm đặt giá 2.500 Tr. ở giây thứ 1.8.
- **Tiêu chí chấp nhận:**
  - Đồng hồ đấu giá tự động nhảy thêm `+3 giây` (thời gian nhảy lên 4.8s).
  - Âm thanh tích tắc dồn dập vang lên.
  - Thông báo hiển thị: *"Gia hạn +3s chống cướp phiên đấu giá!"*.
  - Người chơi khác có đủ thời gian phản xạ để cân nhắc đặt giá cao hơn.
- **Friction Red Flag:** Không gia hạn thời gian khiến người dùng mạng nhanh bấm ở giây thứ 0.1 cướp mất đất của người khác.

#### [UAT-44] Người Chơi AFK Quá 60 Giây — Bot Tiếp Quản Tự Động (Bot Takeover)
- **Bối cảnh:** Bác Ba đang chơi thì có cuộc gọi điện thoại, bỏ máy không thao tác suốt 60 giây.
- **Thao tác thực tế:** Đồng hồ 60s đếm ngược về 0.
- **Tiêu chí chấp nhận:**
  - Server kích hoạt trạng thái Grace Period 60s, sau đó tự động chuyển quyền điều khiển cho Bot AI tiếp quản (`PLAYER_BOT_TAKEOVER`).
  - Bot AI tự động đổ xúc xắc, mua đất hoặc hết lượt để 3 người chơi còn lại không bị kẹt trận đấu.
  - Khi Bác Ba quay lại bấm vào màn hình: Nhận lại quyền điều khiển từ Bot và tiếp tục chơi.
- **Friction Red Flag:** Người chơi AFK làm phòng chơi bị treo vĩnh viễn, mọi người phải thoát game.

#### [UAT-45] Cảm Xúc Chiến Thắng Hoành Tráng (Epic Grand Finale & Leaderboard)
- **Bối cảnh:** Trận đấu kết thúc ở vòng 30.
- **Thao tác thực tế:** Hoàn thành lượt đi cuối cùng.
- **Tiêu chí chấp nhận:**
  - Pháo hoa giấy 3D nổ tung trên nền sa bàn.
  - Cúp vàng lấp lánh xuất hiện vinh danh Nhà Vô Địch với danh hiệu *"ĐẠI GIA ĐỊA ỐC BẢN LĨNH NHẤT VIỆT NAM"*.
  - Bảng tổng kết tài sản chi tiết 3 cột rõ ràng: Tiền Mặt + Giá Trị Đất Đai + Danh Mục Đầu Tư = Tổng Tài Sản Ròng.
  - Nút "CHƠI LẠI TRẬN MỚI" đưa tất cả về sảnh chờ sạch sẽ.
- **Friction Red Flag:** Hết ván hiện một dòng alert đơn điệu rồi đơ màn hình.

---

## VII. BẢNG THEO DÕI TIẾN ĐỘ UAT THỰC TẾ (LIVING UAT SCORECARD)

| Vòng UAT | Ngày chạy | Trọng tâm kiểm thử | Kịch bản bao phủ | Kết quả | Báo cáo chi tiết |
| :---: | :---: | :--- | :--- | :---: | :--- |
| **#01** | 09/09/2026 | Bắt tay mạng & Khởi động trận đấu | UAT-01, UAT-02, UAT-08 | ⚠️ Bắt được Seam Bug `CANNOT_ROLL` & Hotfix thành công | [`bao_cao_chi_tiet_vong_uat_01.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/uat/bao_cao_chi_tiet_vong_uat_01.md) |
| **#02** | 10/09/2026 | Trận đấu 3 người, Chuỗi 2 Bot, Mua đất & F5 Reconnect | UAT-01, UAT-02, UAT-03, UAT-04, UAT-11, UAT-14 | ✅ THÀNH CÔNG (0 lỗi console, triệt tiêu `CANNOT_ROLL`) | [`bao_cao_chi_tiet_vong_uat_02.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/uat/bao_cao_chi_tiet_vong_uat_02.md) |
| **#03** | 10/09/2026 | Sàn HOSE, Đấu giá 15s, Anti-sniping, Nâng cấp C3, Thế chấp | UAT-03 (Polish), UAT-13, UAT-17, UAT-18, UAT-21, UAT-22, UAT-37, UAT-38 | ✅ HOÀN HẢO (Header cách 76px, 0 overlap, 0 lỗi console) | [`bao_cao_chi_tiet_vong_uat_03.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/uat/bao_cao_chi_tiet_vong_uat_03.md) |
| **#04** | 10/09/2026 | Trạm Kiểm Toán Ô 10, Đổ Đôi x3, Thẻ Sự Kiện & Đàm Phán P2P | UAT-08, UAT-09, UAT-19, UAT-20, UAT-41, UAT-42 | ✅ HOÀN HẢO (Huy hiệu kiểm toán, nộp 500 Tr., 5% thuế P2P) | [`bao_cao_chi_tiet_vong_uat_04.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/uat/bao_cao_chi_tiet_vong_uat_04.md) |
| **#05** | 10/09/2026 | Cơn Sốc Nợ, Thế Chấp, Hạ Cấp C3, Thoát Âm & Phá Sản | UAT-03, UAT-36, UAT-38, UAT-53, UAT-54, UAT-55 | ✅ HOÀN HẢO (FSM hoàn nguyên, mở khóa Hết Lượt, 0 lỗi console) | [`bao_cao_chi_tiet_vong_uat_05.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/uat/bao_cao_chi_tiet_vong_uat_05.md) |
| **#06** | 10/09/2026 | Quyết Toán Net Worth Vòng 30, Cúp Vàng & Tái Đấu Về Sảnh | UAT-45.1, UAT-45.2, UAT-45.3, UAT-45.4 | ✅ HOÀN HẢO (Cúp vàng 🏆, xếp hạng 3 người, unmount 3D sạch sẽ) | [`bao_cao_chi_tiet_vong_uat_06.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/uat/bao_cao_chi_tiet_vong_uat_06.md) |
| **#07** | 10/09/2026 | Động Lực Học Sa Bàn 3D, Chống Chồng Lấn 4 Quân Cờ & Emotes | UAT-05.1, UAT-05.2, UAT-05.3, UAT-05.4 | ✅ HOÀN HẢO (Tách 4 góc ±0.2, 1 nhảy 3 đứng yên, 0 clipping) | [`bao_cao_chi_tiet_vong_uat_07.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/uat/bao_cao_chi_tiet_vong_uat_07.md) |
| **#08** | 10/09/2026 | Bẫy Đàm Phán Hoàn Thành Bộ Màu Độc Quyền Cam & Luật Xây Even-Building | UAT-16, UAT-17, UAT-41, UAT-42 | ✅ HOÀN HẢO (Đàm phán P2P 5% thuế, C0 x2 rent, chặn vi phạm Even-Building) | [`bao_cao_chi_tiet_vong_uat_08.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/uat/bao_cao_chi_tiet_vong_uat_08.md) |
| **#09** | 10/09/2026 | Hết Hạn 3 Vòng Trạm Kiểm Toán ➔ Cưỡng Chế Vỡ Nợ & Tự Cứu / Phá Sản | UAT-09.1, UAT-09.2, UAT-09.3, UAT-09.4, UAT-09.5 | ✅ HOÀN HẢO (Thu bảo lãnh 500 Tr., khóa đỏ Hết Lượt, hạ cấp cứu nợ, FSM chuẩn) | [`bao_cao_chi_tiet_vong_uat_09.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/uat/bao_cao_chi_tiet_vong_uat_09.md) |
| **#10** | 10/09/2026 | Lạm Phát Lãi Suất Thế Chấp Kho Bạc & Sụp Đổ Sàn Chứng Khoán HOSE | UAT-10.1, UAT-10.2, UAT-10.3, UAT-10.4, UAT-10.5 | ✅ HOÀN HẢO (Thẻ vĩ mô 10%, vượt GO trừ lãi nộp Kho Bạc, HOSE giảm 50%, Thấu chi) | [`bao_cao_chi_tiet_vong_uat_10.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/uat/bao_cao_chi_tiet_vong_uat_10.md) |
| **#11** | 10/09/2026 | Khủng Hoảng Kép & Phát Mãi Cưỡng Chế 70% Khi 100% Người Chơi Bấm Pass | UAT-11.1, UAT-11.2, UAT-11.3, UAT-11.4, UAT-11.5 | ✅ HOÀN HẢO (P1 pass Ô 39, 2 Bot pass, phát mãi Kho Bạc 70% sàn 2.800 Tr., 0 deadlock) | [`bao_cao_chi_tiet_vong_uat_11.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/uat/bao_cao_chi_tiet_vong_uat_11.md) |
| **#12** | 10/09/2026 | Rớt Mạng WebSocket Khi Đang Giữ Giá Cao Nhất Ở 3s Cuối Sàn Đấu Giá | UAT-12.1, UAT-12.2, UAT-12.3, UAT-12.4, UAT-12.5 | ✅ HOÀN HẢO (Grace 60s, Server chốt thắng, Reconnect token sang tên Ô 37, 0 socket leak) | [`bao_cao_chi_tiet_vong_uat_12.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/uat/bao_cao_chi_tiet_vong_uat_12.md) |
