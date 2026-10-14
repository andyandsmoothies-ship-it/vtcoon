# VTCoOn — Game Cờ Tỷ Phú 3D Việt Nam

**VTCoOn** là trò chơi cờ tỷ phú bất động sản 3D trực tuyến nhiều người chơi, lấy bối cảnh các địa danh, tỉnh thành và văn hóa kinh tế Việt Nam. Dự án được xây dựng theo kiến trúc **Server-Authoritative**, đồ họa **3D Diorama** chân thực trên nền tảng **React Three Fiber (Three.js)**, phân tách biên giới giao thức **Shared Wire Protocol (`@protocol`)** và đồng bộ dữ liệu thời gian thực qua **WebSocket**.

---

## 🌟 Tính Năng Nổi Bật

- **Sa bàn 3D sống động, tối ưu di động sâu (Mobile TBDR & Adaptive Cooling)**: 40 ô cờ mang bản sắc các tỉnh thành, bến xe, tiện ích của Việt Nam; xúc xắc 3D vật lý; hệ thống công trình nhà phố và tòa nhà Landmark biểu tượng; hiệu ứng thời gian thực chuyển đổi Ngày, Hoàng Hôn và Đêm Neon. Tối ưu hóa sâu cho WebGL/GPU di động (< 60 draw calls, BatchedBoardTiles, InstancedMesh, Headless FrameLoop, Adaptive Idle Cooling 30/60 FPS, Static Shadow Caching, clamped Retina DPR 0.82) duy trì 60 FPS mượt mà không nóng máy trên cả iPhone và Android.
- **Bộ não máy chủ tối thượng (Server-Authoritative) & Server Domain Events Pipeline**: Toàn bộ luật chơi, di chuyển bàn cờ, thu thuế phí, mua bán và chuyển nhượng đều được xác thực và xử lý tập trung tại máy chủ, chống gian lận tuyệt đối. Máy chủ phát sóng trực tiếp các **Authoritative Domain Events** (`HOSE_SETTLED`, `AUCTION_BID_PLACED`, `AUCTION_WON`, `BOND_REPAID`, `BOND_DEFAULT`), kết hợp kỹ thuật `restoreDeltaOutflow` triệt tiêu 100% lỗi xung đột bù trừ (Netting Collisions).
- **Ranh giới cơ học & Giao thức chia sẻ (Shared Wire Protocol `@protocol`)**: Tách biệt hoàn toàn Client và Server qua tầng giao thức mạng độc lập `src/domain/protocol/` (25 intents chuẩn, zero direct imports giữa Client và Server, xóa sạch 100% coupling trái phép).
- **Thống nhất định giá tài sản ròng duy nhất (Authoritative Net Worth SSOT)**: Một công thức định giá duy nhất `calculateCellNetWorth` tại `src/domain/property_data.ts` dùng chung cho Server, Bot AI và Client UI, đảm bảo đồng bộ 100% số liệu tài sản và tôn trọng nợ thế chấp thực tế.
- **Đồng bộ thời gian thực siêu tốc (Realtime Delta Sync)**: Kết nối WebSocket truyền phát vi sai trạng thái cực nhỏ (Sparse Diff < 10KB/lần gửi), hỗ trợ cơ chế tự động kết nối lại khi mất mạng (Grace Period 60s).
- **Nhịp điệu điện ảnh êm dịu (Kinematic Pacing)**: Bù trừ 1200ms thời gian đáp đất của xúc xắc & quân cờ và 2200ms nghỉ thở (`WaitingRoll`) ở đầu lượt mới để người chơi kịp quan sát diễn biến trận đấu trước khi Bot ra quyết định.
- **Mô phỏng tài chính & kinh tế đa tầng**:
  - **Đấu giá công khai (Auction)** & Sàn đấu giá phát mãi 0 đồng khi vỡ nợ.
  - **Thương lượng P2P song phương**: Hoán đổi, mua bán tiền mặt, BĐS và cổ phiếu; cho phép chuyển nhượng BĐS đang thế chấp kèm nghĩa vụ nợ (Loan Assumption).
  - **Mua đứt cưỡng chế (Compulsory Buyout / M&A)**: Quyền thâu tóm ô đất cuối cùng để hoàn thiện chuỗi độc quyền với giá đền bù 2.5x.
  - **Thị trường Chứng khoán HOSE**: Giao dịch 4 mã cổ phiếu Blue-chip (VNM, VIC, FPT, VCB) biến động theo nhịp xúc xắc và sự kiện vĩ mô.
  - **Đòn bẩy tài chính & Trái phiếu doanh nghiệp**: Phát hành trái phiếu huy động thanh khoản ngắn hạn, trả lãi định kỳ khi qua ô GO.
  - **Chu kỳ kinh tế vĩ mô**: Tự động luân chuyển giữa các chu kỳ Sốt đất, Đóng băng thanh khoản, Tăng lãi suất và Hạ nhiệt.
  - **Kho Bạc, Thuế & Trạm Kiểm Toán**: Hệ thống điều tiết dòng tiền với phí bảo lãnh động, phí dừng chân lũy tiến, thẻ Cơ Hội & Khí Vận.
- **Trí tuệ nhân tạo (Bot AI) đàm phán thông minh**: Đóng gói hoàn toàn trong Autonomous Bot Brain Facade (`src/domain/bot/index.ts`) với 3 trường phái tính cách (Aggressive, Balanced, Passive), có khả năng định giá danh mục, dự báo luồng tiền (`threat_forecaster.ts`), phát hiện khoảng trống độc quyền và chủ động đàm phán trao đổi tài sản (`bot_negotiation_brain.ts`).
- **Cổng Quản Trị Trực Tiếp (Admin Portal)**: Bảng điều khiển giám sát phòng chơi, trạng thái người chơi, luồng tài chính và telemetry theo thời gian thực tại `/#/admin`.

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: React 19, React Three Fiber, Three.js, Tailwind CSS v4, Zustand.
- **Backend**: Node.js (TypeScript Strict Mode), WebSocket (`ws`), Native HTTP.
- **Giao Thức Mạng**: Shared Wire Protocol (`@protocol` / `src/domain/protocol/`).
- **Lưu Trữ & Persistence**: Supabase Cloud Storage, Buffered Memory Logger.
- **Hạ Tầng Triển Khai**: Docker & Docker Compose, Nginx Reverse Proxy.
- **Kiểm Thử & Đảm Bảo Chất Lượng**: Vitest (hơn **560+ living test suites**, **~8.500+ test cases** PASS 100%), hệ thống kiểm định tự động đa trạm: Fast Pre-Filter (Typecheck, LOC Ceilings, zeroDirtyCasts), Live Socket Port 0 AST Mutation Sentinel (`sentinel`), Boundary & Zero SCCs Linter (`lint:boundaries`).

---

## 🏛️ Kiến Trúc Hệ Thống (System Architecture)

Hệ thống VTCoOn được thiết kế theo nguyên lý **Domain-Driven Design (DDD)**, **Deep Modules** và **Public Subsystem Facades** (Mặt tiền công khai đóng gói logic sâu, triệt tiêu 100% vòng lặp phụ thuộc tròn - 0 SCCs), chia thành **7 Engine chuyên biệt** kết nối qua **Shared Wire Protocol**:

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     BROWSER CLIENT RUNTIME                                         │
│                                                                                                    │
│  ┌───────────────────────────┐  ┌──────────────────────────────┐  ┌─────────────────────────────┐  │
│  │ Engine 5: 3D Diorama &    │  │ Engine 6A: 2D Tactile HUD    │  │ Engine 6B: Hybrid Audio     │  │
│  │ Mobile Graphics Engine    │  │ & Ergonomics Engine          │  │ & Haptic Engine             │  │
│  │ - Three.js / R3F Canvas   │  │ - Responsive Dual-Viewport   │  │ - Howler.js Sound Engine    │  │
│  │ - BatchedBoardTiles (-96%)│  │ - Tailwind CSS v4 Touch UI   │  │ - WebAudio Context Wakeup   │  │
│  │ - Headless FrameLoop      │  │ - Modal & Banner Cockpit     │  │ - Android Vibrate API       │  │
│  │ - Adaptive Idle Cooling   │  │ - Poka-Yoke Action Dock      │  │ - iOS Acoustic Haptics      │  │
│  └─────────────┬─────────────┘  └──────────────┬───────────────┘  └──────────────┬──────────────┘  │
│                └───────────────────────────────┼─────────────────────────────────┘                 │
│                                                ▼                                                   │
│                                Client Reactive State (Zustand)                                     │
│                                & Sparse Delta Ingestion Layer                                      │
└────────────────────────────────────────────────┬───────────────────────────────────────────────────┘
                                                 │
                                                 │ ◄─── SHARED WIRE PROTOCOL (@protocol) ───►
                                                 │      - DTOs, Envelopes & 25 PlayerIntents
                                                 │      - Zero Client/Server Coupling
                                                 v
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 VTCOON SERVER RUNTIME (NODE.JS)                                    │
│                                                                                                    │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Engine 4: Server Orchestration & WebSocket Network Engine                                    │  │
│  │ - Single-Port HTTP/WSS Server (Cổng 3000/3001)     - GameRoomSession Aggregate Root (DDD)    │  │
│  │ - IntentDispatcher (Điều phối Domain trực tiếp)    - Authoritative Domain Events Pipeline    │  │
│  │ - TurnOrchestrator & Watchdog chống treo lượt       - DeltaBroadcaster (Truyền vi sai < 10KB) │  │
│  │ - Disconnect Grace Period & Auto Reconnection      - Kinematic Pacing Delay Compensator      │  │
│  └─────────────────────────────────────────────┬────────────────────────────────────────────────┘  │
│                                                │                                                   │
│  ┌─────────────────────────────────────────────┴────────────────────────────────────────────────┐  │
│  │       PURE DOMAIN CORE (100% Đồng Bộ, Zero I/O, Subsystem Facades, Zero SCCs)                │  │
│  │                                                                                              │  │
│  │  ┌────────────────────────────────────────┐     ┌─────────────────────────────────────────┐  │  │
│  │  │ Engine 1: Deterministic FSM Engine     │     │ Engine 2: Economic & Financial Engine   │  │  │
│  │  │ - Máy trạng thái ván đấu xác định      │◄───►│ - 28 Thẻ BĐS, Even-Build, Thuế & Lãi    │  │  │
│  │  │ - Thuật toán ngẫu nhiên Mulberry32     │     │ - Authoritative Net Worth SSOT          │  │  │
│  │  │ - Phục hồi đối xứng khi vỡ nợ          │     │ - Sàn HOSE & Trái phiếu Doanh nghiệp    │  │  │
│  │  │ - Bộ quy tắc kiểm duyệt ActionReject   │     │ - Bảo toàn dòng tiền Kho Bạc            │  │  │
│  │  └───────────────────┬────────────────────┘     └────────────────────┬────────────────────┘  │  │
│  │                      │                                               │                       │  │
│  │                      ▼                                               ▼                       │  │
│  │  ┌────────────────────────────────────────┐     ┌─────────────────────────────────────────┐  │  │
│  │  │ Engine 3: Autonomous Bot AI Brain      │     │ Domain Action Coordinators Subsystem    │  │  │
│  │  │ - Mặt tiền src/domain/bot/index.ts     │◄───►│ - Điều phối nâng cấp BĐS (Even-Build)   │  │  │
│  │  │ - Mô hình xác suất Softmax Sigmoid     │     │ - Quản trị Đấu giá & Phát mãi           │  │  │
│  │  │ - Bot Negotiation Brain & Luồng tiền   │     │ - Quản trị Cổ phiếu & Thẻ sự kiện       │  │  │
│  │  │ - Bộ giải cứu thanh khoản khi nguy cấp │     │ - Cơ chế xử lý thế chấp & chuộc tài sản │  │  │
│  │  └────────────────────────────────────────┘     └─────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────┬────────────────────────────────────────────────┘  │
│                                                │                                                   │
│  ┌─────────────────────────────────────────────┴────────────────────────────────────────────────┐  │
│  │ Engine 7: Persistence, Logging & Telemetry Engine                                            │  │
│  │ - Bộ đệm nhật ký ván đấu trong RAM (Flush 500ms)  - Tự động đồng bộ Supabase Cloud Storage    │  │
│  │ - In-game Flight Recorder & Log Analyzer          - Telemetry & Admin Portal Realtime Metrics │  │
│  └──────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                    │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ PUBLIC SUBSYSTEM FACADES: src/domain/index.ts | src/domain/bot/index.ts | @protocol          │  │
│  └──────────────────────────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Chi Tiết 7 Cỗ Máy Chuyên Biệt

1. **Deterministic FSM Engine (Máy Trạng Thái Hữu Hạn Xác Định)**:
   - Quản trị toàn bộ vòng đời trạng thái ván đấu: `WaitingRoll` ➔ `ActionPhase` ➔ `PropertyManagement` ➔ `AuctionPhase` / `HosePhase` / `InsolvencyPhase` ➔ `TurnEnd`.
   - Hoàn toàn đồng bộ (100% Synchronous), không chứa các lệnh chờ bất đồng bộ trong lõi nghiệp vụ để triệt tiêu race condition.
   - Cơ chế phục hồi đối xứng (Symmetric FSM Restoration): Khôi phục chính xác trạng thái trước khủng hoảng khi giải quyết xong nợ nần.
   - Thuật toán ngẫu nhiên Mulberry32 với hạt giống cố định (seeded PRNG), đảm bảo khả năng tái lập (replay) hoàn hảo mọi ván đấu.

2. **Economic & Financial Engine (Bộ Não Kinh Tế & Tài Chính Vĩ Mô)**:
   - Quản lý biểu phí dừng chân lũy tiến của 28 bất động sản, quy tắc xây dựng đều tay (Even-Build Rule).
   - **Authoritative Net Worth SSOT**: Thống nhất công thức định giá tài sản ròng và trừ nợ thế chấp thực tế giữa Server, Bot AI và Client UI.
   - Bảo toàn dòng tiền Kho Bạc: Mọi khoản phạt, thuế, bảo lãnh nộp về Kho Bạc và tái phân phối qua lương GO.
   - Hệ thống đòn bẩy tài chính: Phát hành trái phiếu doanh nghiệp, thế chấp BĐS, chuyển nhượng BĐS đang thế chấp kèm nợ (P2P Loan Assumption) và phát mãi phá sản tự động.
   - Sàn giao dịch chứng khoán HOSE với 4 mã Blue-chip và chu kỳ kinh tế vĩ mô xoay tua (Sốt đất, Đóng băng, Tăng lãi suất).

3. **Autonomous Bot AI Decision Engine (Trí Tuệ Nhân Tạo Đối Kháng)**:
   - Đóng gói trọn vẹn qua cổng Public Facade `src/domain/bot/index.ts`, bảo vệ mã nguồn thuật toán sâu.
   - 3 phong cách hành vi: Hiếu chiến (Aggressive), Cân bằng (Balanced), Thận trọng (Passive).
   - Mô hình ra quyết định xác suất Softmax Sigmoid kèm độ nhiễu tự nhiên, mô phỏng tâm lý đắn đo như người thật.
   - **Bot Negotiation Brain & Threat Forecaster**: Nhận diện khoảng trống độc quyền (Monopoly Gap), dự báo rủi ro dòng tiền và chủ động đàm phán trao đổi tài sản công bằng.
   - Thuật toán giải cứu thanh khoản: Tự động hạ cấp công trình đều tay nhận 50% tiền gốc và cầm cố tài sản tối ưu khi đối mặt nguy cơ phá sản.

4. **Server Orchestration & WebSocket Network Engine (Điều Phối & Mạng Thời Gian Thực)**:
   - Phục vụ song song HTTP và WebSocket trên cùng một cổng máy chủ.
   - Mô hình `GameRoomSession` Aggregate Root quản lý toàn bộ trạng thái phòng chơi trong bộ nhớ, dọn dẹp sạch sẽ tài nguyên sau khi kết thúc trận.
   - **Authoritative Domain Events Pipeline**: Máy chủ phát sóng trực tiếp các sự kiện kinh tế nghiệp vụ, kết hợp kỹ thuật `restoreDeltaOutflow` triệt tiêu lỗi xung đột bù trừ (Netting Collisions).
   - Bộ phát vi sai (DeltaBroadcaster) nén dữ liệu gửi qua WebSocket (< 10KB/lần gửi), hỗ trợ cơ chế tombstone để xóa trạng thái tức thời.
   - Cơ chế khóa Mutex độc lập theo phòng, ngăn chặn hoàn toàn việc rò rỉ dữ liệu giữa các phòng chơi khác nhau.
   - Bộ điều phối nhịp điệu (Kinematic Pacing): Bù trừ 1200ms cho xúc xắc & quân cờ đáp đất và 2200ms nghỉ thở đầu lượt.

5. **3D Diorama & Mobile Graphics Engine (Đồ Họa Sa Bàn & Không Gian 3D)**:
   - Xây dựng trên React Three Fiber và Three.js, tối ưu hóa tốc độ 60 FPS ổn định trên thiết bị di động.
   - Sa bàn thu nhỏ 40 ô cờ với hiệu ứng vật liệu PBR, công trình kiến trúc procedural, xúc xắc vật lý 3D trực quan.
   - **Chiến dịch tối ưu sâu WebGL/TBDR**: Gộp draw calls mặt ô cờ (BatchedBoardTiles -96% draw call), gộp 46 bán đảo thành 6 BufferGeometry (BatchedDioramaLandmasses), 5 InstancedMesh nodes cho 140 viền/khay giá, Canvas Texture Atlas cho nhãn giá (< 60 draw calls toàn cảnh).
   - **Bảo vệ pin và nhiệt độ**: Headless Child FrameLoop Pattern (triệt tiêu 100% callback useFrame nhàn rỗi trên mobile), Adaptive Idle Frameloop Cooldown (tự động hạ từ 60 xuống 30 FPS khi bàn cờ đứng yên), Static Shadow Caching (tắt bóng đổ khi tĩnh), khống chế Retina DPR 0.82 cho iOS.

6. **2D Tactile HUD, Audio & Haptic Engine (Giao Diện Xúc Giác, Âm Thanh & Rung)**:
   - Giao diện người dùng chuẩn Impeccable Craft với Tailwind CSS v4, tối ưu công thái học cho cả Desktop lẫn màn hình cảm ứng điện thoại hẹp (360px).
   - Thiết kế theo nguyên tắc Poka-Yoke: Nút bấm và hành động lấy trực tiếp từ Domain Validators, hiển thị minh bạch công thức và biến động số dư.
   - Kênh rung xúc giác đa nền tảng: Rung vật lý trên Android (`navigator.vibrate`) và giả lập xúc giác âm học tần số cao trên iOS Safari.
   - Âm thanh vòm phản ứng nhanh qua Howler.js, hỗ trợ tự phục hồi audio context khi bị gián đoạn.

7. **Persistence, Logging & Telemetry Engine (Lưu Trữ, Nhật Ký & Đo Kiểm)**:
   - Ghi nhật ký ván đấu bất đồng bộ đệm qua RAM (flush mỗi 500ms), không làm nghẽn Event Loop của game server.
   - Tự động xuất và tải các tệp nhật ký trận đấu (.jsonl) lên Supabase Cloud Storage.
   - Bộ phục hồi chỉ mục (Self-Healing Re-indexer) tự động quét và sửa chữa manifest khi có sự cố.
   - In-game Flight Recorder & Log Analyzer phục vụ truy vết sự cố trạng thái trận đấu.

---

## 📄 Bản Quyền & Giấy Phép

Dự án thuộc quyền sở hữu riêng của tác giả. Mọi quyền được bảo lưu.
