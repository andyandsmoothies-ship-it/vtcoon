Hệ thống kiến trúc bổ trợ hoàn chỉnh dưới góc độ kỹ thuật và quản trị vận hành để sẵn sàng triển khai mã nguồn cho webapp bao gồm 5 thành phần cốt lõi:

### **1. MÁY TRẠNG THÁI VÀ VÒNG LẶP TRÒ CHƠI (GAME LOOP & FINITE STATE MACHINE)**

Toàn bộ logic vận hành của bàn cờ được kiểm soát thông qua Máy trạng thái hữu hạn (FSM). Mỗi lượt chơi của một người chơi (hoặc Bot) bắt buộc trải qua một chu trình khép kín, ngăn ngừa tuyệt đối tình trạng nhảy cóc bước đi hoặc xung đột dữ liệu.

```text
[START_TURN]  
      │  
      ▼  
[WAITING_ROLL] ──(Lắc xúc xắc)──► [MOVING] (Hoạt ảnh di chuyển)  
                                      │  
                                      ▼  
[ACTION_PHASE] ◄──(Kích hoạt ô)─── [TILE_RESOLUTION]  
      │  
      ├─► Mua đất (Trực tiếp)  
      ├─► Từ chối mua ──► [AUCTION_PHASE] ──► (Kết quả đấu giá)  
      ├─► Trả phí thuê / Dịch vụ  
      ├─► Rút thẻ Thị trường / Cơ hội  
      ├─► Khớp lệnh sàn HOSE (Ô 38)  
      └─► Xử lý Tạm giữ / Nộp phạt (Ô 10, Ô 30)  
      │  
      ▼  
[PROPERTY_MANAGEMENT] (Nâng cấp, Thế chấp, Giải chấp, [P2P_TRADING])  
      │  
      ▼  
[BANKRUPTCY_CHECK] ──(Dương tiền)──► [TURN_END] ──► Chuyển lượt kế tiếp  
      │  
      └──(Âm tiền)──► [LIQUIDATION] (Thanh lý tài sản bắt buộc / Bị loại)
```

**Chi tiết các trạng thái đặc biệt:**

* **Xử lý Đổ Đôi (Doubles Rule):** Nếu người chơi đổ được 2 mặt xúc xắc giống nhau, trạng thái TURN_END sẽ không chuyển quyền sang người kế tiếp mà tái kích hoạt WAITING_ROLL cho chính người đó. Hệ thống duy trì biến đếm consecutiveDoubles. Nếu biến này chạm mốc 3, FSM cưỡng chế đưa người chơi vào trạng thái JAILED_AUDIT tại Ô 10 và kết thúc lượt ngay lập tức.  
* **Bộ đếm thời gian (Turn Timer):** Mỗi giai đoạn có thời gian chờ tối đa (mặc định: 45 giây cho việc ra quyết định mua/bán, 15 giây cho việc chọn lệnh chứng khoán). Hết thời gian, hệ thống kích hoạt hành động mặc định: Tự động bỏ qua việc mua đất hoặc khớp lệnh ở mức tối thiểu an toàn để ván đấu không bị đình trệ.  
* **Pha Đấu giá Tự động (AUCTION_PHASE):** Khi người chơi dừng chân từ chối mua một ô đất trống, hệ thống lập tức mở phiên đấu giá cho toàn bộ những người chơi còn lại trong phòng (bao gồm cả Bot).  
  * *Thời gian phiên:* 15 giây đếm ngược.  
  * *Giá khởi điểm:* 50% giá niêm yết của ô đất.  
  * *Bước giá tối thiểu:* 100 Tr. VNĐ.  
  * *Cơ chế chốt:* Hết thời gian, người trả giá cao nhất nhận quyền sở hữu ô đất. Nếu không có ai đặt giá, ô đất giữ nguyên trạng thái vô chủ.  
* **Pha Giao dịch Song phương (P2P_TRADING):** Kích hoạt trong giai đoạn quản lý tài sản (PROPERTY_MANAGEMENT). Người chơi đang trong lượt có quyền gửi tối đa 01 đề xuất giao dịch đến một người chơi khác (Đổi đất lấy đất, bán đất lấy tiền mặt, hoặc mua quyền chuyển nhượng). Người nhận có 20 giây để chấp thuận, từ chối hoặc thương lượng lại.

### **2. KIẾN TRÚC PHÒNG CHƠI & ĐIỀU PHỐI ĐA NGƯỜI DÙNG (MULTIPLAYER & SESSION)**

Hệ thống điều phối phòng đấu (Matchmaking & Lobby) ưu tiên tính gọn nhẹ, tối ưu tài nguyên máy chủ và cho phép tham gia nhanh qua liên kết trực tiếp.

#### **Mô hình Vòng đời Phòng (Room Lifecycle)**

* **Giai đoạn Sảnh (Lobby):**  
  * Chủ phòng (Host) khởi tạo phòng, máy chủ cấp phát một **Mã phòng 6 ký tự** ngẫu nhiên không trùng lặp (ví dụ: VN7982).  
  * Hệ thống sinh một chuỗi **URL định danh** duy nhất và mã **QR Code**. Người tham gia chỉ cần truy cập đường dẫn là tự động gia nhập sảnh chờ mà không cần đăng ký tài khoản rườm rà.  
  * Chủ phòng có thẩm quyền cấu hình tham số: Giới hạn thời gian (15 vòng hoặc 60 phút), cấp quyền thêm/bớt vị trí Bot AI, hoặc kích người chơi mất kết nối.  
* **Giai đoạn Đang đấu (In-Game):**  
  * Hạn chế tối đa lưu lượng mạng bằng cơ chế truyền tin Delta (chỉ gửi sự thay đổi dữ liệu thay vì gửi lại toàn bộ bàn cờ sau mỗi hành động).  
* **Giai đoạn Kết thúc (Post-Game):**  
  * Tổng hợp bảng cân đối tài sản ròng, xuất biểu đồ biến động dòng tiền qua 15 vòng và tự động giải phóng vùng nhớ phòng sau 10 phút không hoạt động.

#### **Cơ chế Xử lý Mất kết nối (Heartbeat & Grace Period)**

* Mỗi kết nối giữa Client và Server được duy trì tín hiệu kiểm tra định kỳ (Ping/Pong mỗi 5 giây).  
* Nếu người chơi mất kết nối mạng đột ngột (đứt Wi-Fi, thoát trình duyệt), phòng **không hủy trận đấu** mà đưa người chơi đó vào trạng thái DISCONNECTED với **Thời gian ân hạn là 60 giây**.  
* Trong thời gian ân hạn này, Bot dự phòng sẽ tạm thời điều khiển tài khoản đó (chỉ thực hiện các hành động cơ bản: đóng thuế, trả phí thuê, từ chối mua đất mới).  
* Nếu người chơi tải lại trang trong vòng 60 giây, hệ thống dựa vào Session Token lưu trong bộ nhớ trình duyệt (localStorage) để khôi phục toàn bộ giao diện và quyền điều khiển ngay lập tức. Hết 60 giây, tài khoản đó chính thức chuyển đổi thành Bot vĩnh viễn cho đến hết trận.

#### **Giao thức Truyền thông Thời gian thực & Đồng bộ Trạng thái (WebSocket & State Reconciliation)**

* **Giao thức vận hành:** Sử dụng WebSocket 2 chiều toàn phần (Full-duplex WebSocket) thay cho HTTP Polling để triệt tiêu độ trễ mạng trong các tình huống yêu cầu phản hồi tức thời (đấu giá, đổ xúc xắc, kích hoạt thẻ).  
* **Cơ chế Client-Side Prediction & Server Reconciliation:**  
  * Khi người chơi nhấn đổ xúc xắc, Client mô phỏng quỹ đạo rơi vật lý cục bộ ngay lập tức để tạo cảm giác phản hồi thời gian thực (0ms delay).  
  * Kết quả điểm rơi chính thức từ Cryptographic PRNG của Server được gửi về qua gói tin WebSocket. Client thực hiện nội suy (Reconciliation) góc xoay cuối cùng của xúc xắc trùng khớp với con số từ Server.  
* **Bảo toàn tính nhất quán (State Lock):** Trong suốt quá trình xử lý AUCTION_PHASE hoặc thanh toán thuế, Server khóa toàn bộ trạng thái tài khoản của người chơi liên quan nhằm ngăn chặn lỗi Race Condition khi có xung đột dữ liệu gửi lên đồng thời.

### **3. MÁY CHỦ QUYỀN UY & CƠ CHẾ CHỐNG GIAN LẬN (AUTHORITATIVE SERVER)**

Để trò chơi công bằng và ngăn chặn can thiệp mã nguồn từ công cụ phát triển của trình duyệt (Browser DevTools), kiến trúc tuân thủ nguyên tắc **Server-Authoritative** tuyệt đối:

* **Không tin tưởng Client (Zero Client Trust):**  
  * Client chỉ đóng vai trò hiển thị giao diện và gửi **Ý định hành động (Intent)** lên Server (ví dụ: INTENT_ROLL_DICE, INTENT_BUY_PROPERTY).  
  * Mọi phép tính liên quan đến tiền tệ, khấu trừ thuế, nâng cấp công trình hay sang tên chủ quyền đều được tính toán và phê duyệt độc quyền bởi máy chủ.  
* **Máy tạo số ngẫu nhiên an toàn (Cryptographic PRNG):**  
  * Kết quả xúc xắc (từ 2 đến 12) và thứ tự rút thẻ sự kiện được Server sinh ra bằng thuật toán giả ngẫu nhiên có bảo mật.  
  * Sau khi Server chốt kết quả xúc xắc, dữ liệu này mới gửi về Client để kích hoạt hoạt ảnh 3D rơi xúc xắc. Hoạt ảnh vật lý ở màn hình người dùng chỉ là kỹ xảo mô phỏng thị giác sao cho điểm tiếp đất của mặt xúc xắc trùng khớp với con số Server đã cấp.  
* **Xáo thẻ Sự kiện (Deck Management):**  
  * Hai bộ bài *Phiếu Thị Trường* (16 thẻ) và *Phiếu Cơ Hội* (20 thẻ) được Server xáo trộn sẵn theo thuật toán Fisher-Yates ngay khi tạo phòng. Client hoàn toàn không biết trước thứ tự các thẻ tiếp theo nằm trong xấp bài.

### **4. ĐỘNG CƠ TRÍ TUỆ NHÂN TẠO CHO BOT (DYNAMIC BOT ENGINE)**

Để bot vận hành sinh động, tránh sự rập khuôn cứng nhắc nhưng vẫn đảm bảo tính toán chiến lược hiệu quả, hệ thống sử dụng mô hình **Cây quyết định kết hợp Trọng số Ngẫu nhiên (Weighted Random Utility Engine)**:

#### **Hồ sơ Tính cách của Bot (Bot Archetypes)**

Khi thêm Bot vào phòng, hệ thống tự động gán ngẫu nhiên 1 trong 3 tính cách kinh doanh:

| Tính cách Bot | Triết lý đầu tư | Hành vi đặc thù | Xác suất tham gia sàn HOSE |
| :---- | :---- | :---- | :---- |
| **Nhà Đầu Cơ Mạo Hiểm** | Tăng trưởng nóng, tối đa hóa tài sản | Sẵn sàng mua mọi ô đất dẫm vào; ưu tiên BĐS Giải trí; lạm dụng đòn bẩy vay vốn tối đa. | 80% cơ hội tham gia; cược mức tối đa 3.000 Tr. VNĐ. |
| **Nhà Tài Phiệt Thận Trọng** | Bảo toàn vốn, phòng thủ rủi ro | Chỉ mua đất nếu số dư tiền mặt sau mua lớn hơn 4.000 Tr. VNĐ; ưu tiên chuỗi Đô thị an toàn; luôn duy trì tiền dự phòng đóng thuế. | 15% cơ hội tham gia; nếu chơi chỉ đặt 500 Tr. VNĐ. |
| **Thương Gia Linh Hoạt** | Cân bằng dòng tiền | Ưu tiên mua gom để hoàn thành trọn bộ màu; tập trung đầu tư Hạ tầng Giao thông; tích cực nâng cấp công trình Cấp 1 & 2. | 50% cơ hội tham gia; cược ở mức trung bình 1.500 Tr. VNĐ. |

#### **Yếu tố Ngẫu nhiên hóa Quyết định (Entropy Factor)**

Thay vì dùng các công thức logic tuyệt đối dạng if...else, mọi quyết định của Bot đều được chấm điểm hữu dụng (Utility Score) từ 0 đến 100, sau đó cộng thêm một **Hệ số sai lệch ngẫu nhiên (±15%)**:

* *Mô phỏng sai sót con người:* Đôi khi một Bot thận trọng vẫn có 5% xác suất đưa ra quyết định liều lĩnh All-in vào chứng khoán vì "hưng phấn thị trường".  
* *Mô phỏng sự tiếc nuối:* Một Bot mạo hiểm vẫn có thể bỏ qua một ô đất đắt đỏ nếu vừa trải qua một đợt bị phạt tiền nặng nề ở vòng trước.

### **5. CẤU TRÚC ĐỒNG BỘ DỮ LIỆU & TRUYỀN THÔNG ĐIỆP SỰ KIỆN (REALTIME SYNC & EVENTS)**

Để giao diện webapp luôn mượt mà và trực quan hóa toàn bộ hoạt động của bàn cờ, dữ liệu giữa các máy người chơi được điều phối qua hai kênh:

#### **Kênh Đồng bộ Bảng Cân đối Kế toán (State Patching)**

Một bản ghi thu nhỏ (State Schema) liên tục được cập nhật ngầm, bao gồm:

* Danh sách 40 ô: Thuộc quyền sở hữu của ai, đang ở cấp nâng cấp mấy (0–3), có đang bị thế chấp hay không.  
* Dữ liệu từng người chơi: Tọa độ ô hiện tại, số dư tiền mặt, danh mục nợ vay ngân hàng, trạng thái tự do hay đang chịu kiểm toán.  
* Hiệu lực thẻ vĩ mô: Thẻ *Phiếu Thị Trường* nào đang chi phối toàn bàn cờ và thời gian hiệu lực còn lại bao nhiêu lượt.

#### **Kênh Bảng Tin Tài Chính (Activity Feed / Event Broadcaster)**

Hệ thống phát sóng các gói tin sự kiện để hiển thị khung thông báo chữ chạy (Ticker Bar) và âm thanh hiệu ứng trên màn hình mọi người chơi:

* *Sự kiện Giao dịch:* "Nguyễn Nam vừa nâng cấp Phú Quốc lên Cấp 3 (Mega Theme Park) với chi phí 2.600 Tr. VNĐ."  
* *Sự kiện Thị trường:* "Thẻ Thị Trường kích hoạt: Ngân Hàng Nhà Nước tăng lãi suất. Phí vay thế chấp tăng lên 10%."  
* *Sự kiện Cảnh báo:* "Cảnh báo: Tài khoản Lê Huy còn dưới 1.000 Tr. VNĐ, đứng trước nguy cơ vỡ nợ."

Toàn bộ khung kỹ thuật trên kết hợp cùng 6 quy chuẩn giao diện và mỹ thuật đã đề ra trước đó tạo thành một bản đặc tả hoàn chỉnh (Full Technical Specification), bao quát đầy đủ từ giao diện sa bàn 2.5D, thông số tài chính từng ô đến logic máy chủ và hành vi đa người chơi.