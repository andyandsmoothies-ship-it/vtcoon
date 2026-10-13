# VTCoOn — Game Cờ Tỷ Phú 3D Việt Nam

**VTCoOn** là trò chơi cờ tỷ phú bất động sản 3D trực tuyến nhiều người chơi, lấy bối cảnh các địa danh, tỉnh thành và văn hóa kinh tế Việt Nam. Dự án được xây dựng theo kiến trúc **Server-Authoritative**, đồ họa **3D Diorama** chân thực trên nền tảng **React Three Fiber (Three.js)** và đồng bộ dữ liệu thời gian thực qua **WebSocket**.

---

## 🌟 Tính Năng Nổi Bật

- **Sa bàn 3D sống động, tối ưu di động**: 40 ô cờ mang bản sắc các tỉnh thành, bến xe, tiện ích của Việt Nam; xúc xắc 3D vật lý; hệ thống công trình nhà phố và tòa nhà Landmark biểu tượng; hiệu ứng thời gian thực chuyển đổi giữa Ban Ngày, Hoàng Hôn và Đêm Neon.
- **Bộ não máy chủ tối thượng (Server-Authoritative)**: Toàn bộ luật chơi, di chuyển bàn cờ, thu thuế phí, mua bán và chuyển nhượng đều được xác thực và xử lý tập trung tại máy chủ, chống gian lận tuyệt đối.
- **Đồng bộ thời gian thực siêu tốc (Realtime Delta Sync)**: Kết nối WebSocket truyền phát vi sai trạng thái cực nhỏ (Sparse Diff < 10KB/lần gửi), hỗ trợ cơ chế tự động kết nối lại khi mất mạng (Grace Period 60s).
- **Mô phỏng tài chính & kinh tế đa tầng**:
  - **Đấu giá công khai (Auction)** & Sàn đấu giá phát mãi 0 đồng khi vỡ nợ.
  - **Thương lượng P2P song phương**: Hoán đổi, mua bán tiền mặt, BĐS và cổ phiếu; cho phép chuyển nhượng BĐS đang thế chấp kèm nghĩa vụ nợ (Loan Assumption).
  - **Mua đứt cưỡng chế (Compulsory Buyout / M&A)**: Quyền thâu tóm ô đất cuối cùng để hoàn thiện chuỗi độc quyền với giá đền bù 2.5x.
  - **Thị trường Chứng khoán HOSE**: Giao dịch 4 mã cổ phiếu Blue-chip (VNM, VIC, FPT, VCB) biến động theo nhịp xúc xắc và sự kiện vĩ mô.
  - **Đòn bẩy tài chính & Trái phiếu doanh nghiệp**: Phát hành trái phiếu huy động thanh khoản ngắn hạn, trả lãi định kỳ khi qua ô GO.
  - **Chu kỳ kinh tế vĩ mô**: Tự động luân chuyển giữa các chu kỳ Sốt đất, Đóng băng thanh khoản, Tăng lãi suất và Hạ nhiệt.
  - **Kho Bạc, Thuế & Trạm Kiểm Toán**: Hệ thống điều tiết dòng tiền với phí bảo lãnh động, phí dừng chân lũy tiến, thẻ Cơ Hội & Khí Vận.
- **Trí tuệ nhân tạo (Bot AI) đàm phán thông minh**: Tự động tham gia ván đấu khi thiếu người chơi với 3 trường phái tính cách (Aggressive, Balanced, Passive), có khả năng định giá danh mục, phát hiện khoảng trống độc quyền và chủ động đàm phán trao đổi tài sản.
- **Đồ họa mượt mà trên mọi thiết bị**: Tối ưu hóa sâu cho WebGL/GPU di động (gộp draw calls, culling động, chia sẻ vật liệu Instanced, tự động hạ xung nhịp frameloop khi nhàn rỗi, triệt tiêu callback animation thừa), duy trì 60 FPS ổn định trên cả máy tính lẫn điện thoại (360px).
- **Cổng Quản Trị Trực Tiếp (Admin Portal)**: Bảng điều khiển giám sát phòng chơi, trạng thái người chơi, luồng tài chính và telemetry theo thời gian thực tại `/#/admin`.

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: React 19, React Three Fiber, Three.js, Tailwind CSS v4, Zustand.
- **Backend**: Node.js (TypeScript Strict Mode), WebSocket (`ws`), Native HTTP.
- **Lưu Trữ & Persistence**: Supabase Cloud Storage, Buffered Memory Logger.
- **Hạ Tầng Triển Khai**: Docker & Docker Compose, Nginx Reverse Proxy.
- **Kiểm Thử & Đảm Bảo Chất Lượng**: Vitest (hơn 350+ living test suites, ~7.000 test cases PASS 100%), hệ thống kiểm định tự động đa trạm (Quality Gates).

---

## 🏛️ Kiến Trúc Hệ Thống (System Architecture)

Hệ thống VTCoOn được thiết kế theo nguyên lý **Domain-Driven Design (DDD)** và **Deep Modules** (Giao diện tinh gọn, đóng gói logic phức tạp), chia thành **7 Engine chuyên biệt**:

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     BROWSER CLIENT RUNTIME                                         │
│                                                                                                    │
│  ┌───────────────────────────┐  ┌──────────────────────────────┐  ┌─────────────────────────────┐  │
│  │ Engine 5: 3D Diorama &    │  │ Engine 6A: 2D Tactile HUD    │  │ Engine 6B: Hybrid Audio     │  │
│  │ Graphics Engine           │  │ & Ergonomics Engine          │  │ & Haptic Engine             │  │
│  │ - Three.js / R3F Canvas   │  │ - Responsive Dual-Viewport   │  │ - Howler.js Sound Engine    │  │
│  │ - Procedural Buildings    │  │ - Tailwind CSS v4 Touch UI   │  │ - WebAudio Context Wakeup   │  │
│  │ - Batched Tiles & Trays   │  │ - Modal & Banner Cockpit     │  │ - Android Vibrate API       │  │
│  │ - Adaptive Frame Pacing   │  │ - Poka-Yoke Action Dock      │  │ - iOS Acoustic Haptics      │  │
│  └─────────────┬─────────────┘  └──────────────┬───────────────┘  └──────────────┬──────────────┘  │
│                └───────────────────────────────┼─────────────────────────────────┘                 │
│                                                ▼                                                   │
│                                Client Reactive State (Zustand)                                     │
│                                & Sparse Delta Ingestion Layer                                      │
└────────────────────────────────────────────────┬───────────────────────────────────────────────────┘
                                                 │
                                                 │ WebSocket WSS (Sparse Diffs < 10KB)
                                                 │ Native HTTP (Health Checks & Static Assets)
                                                 v
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 VTCOON SERVER RUNTIME (NODE.JS)                                    │
│                                                                                                    │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Engine 4: Server Orchestration & WebSocket Network Engine                                    │  │
│  │ - Single-Port HTTP/WSS Server (Cổng 3000/3001)     - GameRoomSession Aggregate Root (DDD)    │  │
│  │ - IntentDispatcher (Điều phối Domain trực tiếp)    - Multi-Room Mutex & Zero Cross-Talk      │  │
│  │ - TurnOrchestrator & Watchdog chống treo lượt       - DeltaBroadcaster (Truyền vi sai)        │  │
│  │ - Disconnect Grace Period & Auto Reconnection      - AdminManager & Telemetry Metrics        │  │
│  └─────────────────────────────────────────────┬────────────────────────────────────────────────┘  │
│                                                │                                                   │
│  ┌─────────────────────────────────────────────┴────────────────────────────────────────────────┐  │
│  │                 PURE DOMAIN CORE (100% Đồng Bộ, Zero I/O, Không Phụ Thuộc Môi Trường)         │  │
│  │                                                                                              │  │
│  │  ┌────────────────────────────────────────┐     ┌─────────────────────────────────────────┐  │  │
│  │  │ Engine 1: Deterministic FSM Engine     │     │ Engine 2: Economic & Financial Engine   │  │  │
│  │  │ - Máy trạng thái ván đấu xác định      │◄───►│ - 28 Thẻ BĐS & Biểu phí dừng chân      │  │  │
│  │  │ - Thuật toán ngẫu nhiên Mulberry32     │     │ - Bảo toàn dòng tiền Kho Bạc            │  │  │
│  │  │ - Vòng lặp lượt chơi & Xử lý sự kiện   │     │ - Giao dịch P2P, M&A & Trái phiếu DN    │  │  │
│  │  │ - Bộ quy tắc kiểm duyệt ActionReject   │     │ - Sàn chứng khoán HOSE & Chu kỳ kinh tế │  │  │
│  │  └───────────────────┬────────────────────┘     └────────────────────┬────────────────────┘  │  │
│  │                      │                                               │                       │  │
│  │                      ▼                                               ▼                       │  │
│  │  ┌────────────────────────────────────────┐     ┌─────────────────────────────────────────┐  │  │
│  │  │ Engine 3: Bot AI Decision Engine       │     │ Domain Action Coordinators Subsystem    │  │  │
│  │  │ - 3 Tính cách: Aggressive/Balanced/Pass│◄───►│ - Điều phối nâng cấp BĐS (Even-Build)   │  │  │
│  │  │ - Mô hình xác suất Softmax Sigmoid     │     │ - Quản trị Đấu giá & Phát mãi           │  │  │
│  │  │ - Nhận diện khoảng trống độc quyền     │     │ - Quản trị Cổ phiếu & Thẻ sự kiện       │  │  │
│  │  │ - Bộ giải cứu thanh khoản khi nguy cấp │     │ - Cơ chế xử lý thế chấp & chuộc tài sản │  │  │
│  │  └────────────────────────────────────────┘     └─────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────┬────────────────────────────────────────────────┘  │
│                                                │                                                   │
│  ┌─────────────────────────────────────────────┴────────────────────────────────────────────────┐  │
│  │ Engine 7: Persistence, Logging & Cloud Storage Engine                                        │  │
│  │ - Bộ đệm nhật ký ván đấu trong RAM (Flush 500ms)  - Tự động đồng bộ Supabase Cloud Storage    │  │
│  │ - Cơ chế tự phục hồi chỉ mục Manifest ván đấu     - Lưu trữ tệp nhật ký JSONL chuẩn hóa       │  │
│  └──────────────────────────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Chi Tiết 7 Cỗ Máy Chuyên Biệt

1. **Deterministic FSM Engine (Máy Trạng Thái Hữu Hạn Xác Định)**:
   - Quản trị toàn bộ vòng đời trạng thái ván đấu: `WaitingRoll` ➔ `ActionPhase` ➔ `PropertyManagement` ➔ `AuctionPhase` / `HosePhase` / `InsolvencyPhase` ➔ `TurnEnd`.
   - Hoàn toàn đồng bộ (100% Synchronous), không chứa các lệnh chờ bất đồng bộ trong lõi nghiệp vụ để triệt tiêu race condition.
   - Thuật toán ngẫu nhiên Mulberry32 với hạt giống cố định (seeded PRNG), đảm bảo khả năng tái lập (replay) hoàn hảo mọi ván đấu.

2. **Economic & Financial Engine (Bộ Não Kinh Tế & Tài Chính Vĩ Mô)**:
   - Quản lý biểu phí dừng chân lũy tiến của 28 bất động sản, quy tắc xây dựng đều tay (Even-Build Rule).
   - Bảo toàn dòng tiền Kho Bạc: Mọi khoản phạt, thuế, bảo lãnh nộp về Kho Bạc và tái phân phối qua lương GO.
   - Hệ thống đòn bẩy tài chính: Phát hành trái phiếu doanh nghiệp, thế chấp BĐS, chuyển nhượng BĐS đang thế chấp kèm nợ (P2P Loan Assumption) và phát mãi phá sản tự động.
   - Sàn giao dịch chứng khoán HOSE với 4 mã Blue-chip và chu kỳ kinh tế vĩ mô xoay tua (Sốt đất, Đóng băng, Tăng lãi suất).

3. **Bot AI Decision Engine (Trí Tuệ Nhân Tạo Đối Kháng)**:
   - 3 phong cách hành vi: Hiếu chiến (Aggressive), Cân bằng (Balanced), Thận trọng (Passive).
   - Mô hình ra quyết định xác suất Softmax Sigmoid kèm độ nhiễu tự nhiên, mô phỏng tâm lý đắn đo như người thật.
   - Nhận diện khoảng trống độc quyền (Monopoly Gap) để chủ động đề xuất trao đổi tài sản hoặc ép giá đối thủ.
   - Thuật toán giải cứu thanh khoản: Tự động hạ cấp công trình đều tay nhận 50% tiền gốc và cầm cố tài sản tối ưu khi đối mặt nguy cơ phá sản.

4. **Server Orchestration & WebSocket Network Engine (Điều Phối & Mạng Thời Gian Thực)**:
   - Phục vụ song song HTTP và WebSocket trên cùng một cổng máy chủ.
   - Mô hình `GameRoomSession` Aggregate Root quản lý toàn bộ trạng thái phòng chơi trong bộ nhớ, dọn dẹp sạch sẽ tài nguyên sau khi kết thúc trận.
   - Bộ phát vi sai (DeltaBroadcaster) nén dữ liệu gửi qua WebSocket (< 10KB/lần gửi), hỗ trợ cơ chế tombstone để xóa trạng thái tức thời.
   - Cơ chế khóa Mutex độc lập theo phòng, ngăn chặn hoàn toàn việc rò rỉ dữ liệu giữa các phòng chơi khác nhau.

5. **3D Diorama & Graphics Engine (Đồ Họa Sa Bàn & Không Gian 3D)**:
   - Xây dựng trên React Three Fiber và Three.js, tối ưu hóa tốc độ 60 FPS ổn định trên thiết bị di động.
   - Sa bàn thu nhỏ 40 ô cờ với hiệu ứng vật liệu PBR, công trình kiến trúc procedural, xúc xắc vật lý 3D trực quan.
   - Tối ưu hóa GPU chuyên sâu cho di động: Gộp draw calls mặt ô cờ (BatchedBoardTiles), chia sẻ khay nhãn giá (Instanced Trays & Atlas), giảm tải shader mặt nước biển, tự động hạ xung nhịp render khi bàn cờ đứng yên (Adaptive Idle Cooling), và mô hình Headless FrameLoop triệt tiêu 100% callback nhàn rỗi trên mobile.

6. **2D Tactile HUD, Audio & Haptic Engine (Giao Diện Xúc Giác, Âm Thanh & Rung)**:
   - Giao diện người dùng chuẩn Impeccable Craft với Tailwind CSS v4, tối ưu công thái học cho cả Desktop lẫn màn hình cảm ứng điện thoại hẹp (360px).
   - Thiết kế theo nguyên tắc Poka-Yoke: Nút bấm và hành động lấy trực tiếp từ Domain Validators, hiển thị minh bạch công thức và biến động số dư.
   - Kênh rung xúc giác đa nền tảng: Rung vật lý trên Android (`navigator.vibrate`) và giả lập xúc giác âm học tần số cao trên iOS Safari.
   - Âm thanh vòm phản ứng nhanh qua Howler.js, hỗ trợ tự phục hồi audio context khi bị gián đoạn.

7. **Persistence, Logging & Cloud Storage Engine (Lưu Trữ & Nhật Ký Đám Mây)**:
   - Ghi nhật ký ván đấu bất đồng bộ đệm qua RAM (flush mỗi 500ms), không làm nghẽn Event Loop của game server.
   - Tự động xuất và tải các tệp nhật ký trận đấu (.jsonl) lên Supabase Cloud Storage.
   - Bộ phục hồi chỉ mục (Self-Healing Re-indexer) tự động quét và sửa chữa manifest khi có sự cố.

---

## 📄 Bản Quyền & Giấy Phép

Dự án thuộc quyền sở hữu riêng của tác giả. Mọi quyền được bảo lưu.
