# VTCoOn — Game Cờ Tỷ Phú 3D Việt Nam

Trò chơi bàn cờ tỷ phú bất động sản 3D trực tuyến lấy bối cảnh các tỉnh thành Việt Nam. Dự án phát triển theo kiến trúc **Server-Authoritative FSM**, hiển thị đồ họa 3D phong cách diorama ngoài trời rực rỡ qua **React Three Fiber (R3F)** và đồng bộ trạng thái thời gian thực qua **WebSocket**.

---

## 🌟 Tính Năng Nổi Bật

- **Sa bàn 3D sống động**: 40 ô cờ tương ứng các tỉnh thành, bến xe, tiện ích của Việt Nam; xúc xắc 3D vật lý, nhà phố C1-C2 chuẩn hóa và **22 Tòa nhà Landmark Cấp 3 biểu tượng độc bản** mang đậm bản sắc vùng miền (đai vàng hoàng kim, vương miện bảo ngọc tự xoay).
- **Bộ não máy chủ tối thượng (Server-Authoritative FSM)**: Toàn bộ luật chơi, di chuyển, thu tiền thuê và logic mua bán được kiểm soát tập trung ở server, chống gian lận.
- **Đồng bộ Realtime siêu tốc**: Kết nối WebSocket đồng bộ payload dạng Sparse Diff (< 10KB/lần gửi), hỗ trợ cơ chế tự động kết nối lại (Grace Period 60s).
- **Hệ sinh thái tài chính đa dạng & mô phỏng kinh tế thực tế**:
  - Đấu giá công khai thời gian thực (Online Auction) & Sàn phát mãi 0 đồng.
  - Thương lượng, hoán đổi P2P ngoài lượt; chuyển nhượng BĐS đang thế chấp kèm nợ (Loan Assumption P2P) định giá theo Net Equity, giá sàn 35%.
  - Đòn bẩy Trái phiếu Doanh nghiệp (vay 80% Net Worth từ Kho Bạc).
  - Chu kỳ kinh tế vĩ mô 6 vòng (Sốt đất x2.5 cước, Đóng băng thanh khoản, Hạ nhiệt).
  - Trạm Kiểm Toán với phí bảo lãnh động `max(500, 10% Net Worth)` nộp Kho Bạc & cơ chế Anti-Camping.
  - Cầm cố, chuộc tài sản, thẻ Khí Vận & Cơ Hội mang bản sắc Việt.
  - Tự động bổ sung Bot AI thông minh (3 phong cách: Aggressive, Balanced, Passive) khi thiếu người chơi.
- **Cổng Quản Trị Trực Tiếp (Admin Portal)**: Bảng điều khiển giám sát phòng chơi, chỉ số tài chính, telemetry và can thiệp ván đấu tại `/#/admin`.

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: React 19, React Three Fiber (Three.js), Tailwind CSS v4, Zustand.
- **Backend**: Node.js (TypeScript Strict Mode), WebSocket (`ws`), Native HTTP.
- **Lưu Trữ & Persistence**: Supabase Cloud Storage (RFC 7515 Compact Bearer), Local Buffered JSONL.
- **Triển khai & Mạng**: Docker & Docker Compose, Nginx Reverse Proxy, Ngrok / Cloudflared Tunnel.
- **Chất Lượng & Kiểm Thử**: Vitest (hơn 345+ living test suites, ~7.000 test cases PASS 100%), Quality Gates tự động.

---

## 🏛️ Kiến Trúc Hệ Thống (System Architecture)

Hệ thống lõi của VTCoOn được thiết kế theo nguyên lý **Domain-Driven Design (DDD)** và **Deep Modules** (Giao diện đơn giản giấu kín logic phức tạp), phân rã thành **7 Engine chuyên biệt** với ranh giới bất biến nghiêm ngặt:

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     BROWSER CLIENT RUNTIME                                         │
│                                                                                                    │
│  ┌───────────────────────────┐  ┌──────────────────────────────┐  ┌─────────────────────────────┐  │
│  │ Engine 5: 3D Diorama &    │  │ Engine 6A: 2D Tactile HUD    │  │ Engine 6B: Hybrid Audio     │  │
│  │ Physics Rendering Engine  │  │ Component Engine             │  │ & Haptic Engine             │  │
│  │ - Three.js / R3F Canvas   │  │ - Tailwind CSS v4 Touch HUD  │  │ - Howler.js Sound Engine    │  │
│  │ - 40 PBR Diorama Tiles    │  │ - Mobile 360px Ergonomics    │  │ - WebAudio Safari Resume    │  │
│  │ - 22 Bespoke Landmark GLBs│  │ - Deal Cockpit & Portfolio   │  │ - Android Navigator Vibrate │  │
│  │ - 3D Physics Dice Tray    │  │ - Responsive Floating Badges │  │ - iOS Acoustic Illusion     │  │
│  └─────────────┬─────────────┘  └──────────────┬───────────────┘  └──────────────┬──────────────┘  │
│                └───────────────────────────────┼─────────────────────────────────┘                 │
│                                                ▼                                                   │
│                                Client Reactive State (Zustand)                                     │
│                                & Sparse Delta Ingestion Layer                                      │
└────────────────────────────────────────────────┬───────────────────────────────────────────────────┘
                                                 │
                                                 │ WebSocket WSS (JSON Sparse Diffs < 10KB)
                                                 │ Native HTTP (Health Checks & Static Assets)
                                                 v
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 VTCOON SERVER RUNTIME (NODE.JS)                                    │
│                                                                                                    │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Engine 4: Server Orchestration & WebSocket Network Engine                                    │  │
│  │ - Single-Port HTTP/WSS Server (Port 3000/3001)     - GameRoomSession Aggregate Root (DDD)    │  │
│  │ - IntentDispatcher (Direct Domain Delegation)      - SessionFieldMapFacade (100% Map Parity) │  │
│  │ - TurnOrchestrator & Watchdog (Stall Recovery)     - DeltaBroadcaster (Sparse Diffs & Nulls) │  │
│  │ - Multi-Room Mutex & Zero Cross-Talk E2E           - AdminManager & Portal Telemetry Guard   │  │
│  └─────────────────────────────────────────────┬────────────────────────────────────────────────┘  │
│                                                │                                                   │
│  ┌─────────────────────────────────────────────┴────────────────────────────────────────────────┐  │
│  │                 PURE DOMAIN CORE (100% Đồng Bộ, Zero I/O, Không Dependency)                  │  │
│  │                                                                                              │  │
│  │  ┌────────────────────────────────────────┐     ┌─────────────────────────────────────────┐  │  │
│  │  │ Engine 1: Deterministic FSM Engine     │     │ Engine 2: Economic & Financial Engine   │  │  │
│  │  │ - Synchronous State Transitions        │◄───►│ - 28 Title Deeds & Progressive Rent     │  │  │
│  │  │ - Mulberry32 Seeded PRNG Engine        │     │ - Treasury Invariant: ΔSystem = 0       │  │  │
│  │  │ - Turn Lifecycle: Roll ➔ Action ➔      │     │ - P2P Loan Assumption (35% Floor Price) │  │  │
│  │  │   PropertyManagement ➔ TurnEnd         │     │ - Corporate Bond & 0đ Fire Sale Arena   │  │  │
│  │  │ - ActionRejectReason Validation Rules  │     │ - 6-Round Macro Cycles (Boom/Freeze)    │  │  │
│  │  └───────────────────┬────────────────────┘     └────────────────────┬────────────────────┘  │  │
│  │                      │                                               │                       │  │
│  │                      ▼                                               ▼                       │  │
│  │  ┌────────────────────────────────────────┐     ┌─────────────────────────────────────────┐  │  │
│  │  │ Engine 3: Bot AI Decision Engine       │     │ Domain Action Coordinators Subsystem    │  │  │
│  │  │ - 3 Personas: Aggressive/Balanced/Pass │◄───►│ - Property Actions & Even-Build Rule    │  │  │
│  │  │ - Softmax Sigmoid Probabilistic Model  │     │ - HOSE Stock Exchange & Bond Manager    │  │  │
│  │  │ - Monopoly Gap Detector (N-1 Strategy) │     │ - Auction Manager & Mortgage Sanitizer  │  │  │
│  │  │ - Solvency Recovery (Even-Downgrade)   │     │ - Market Shock & Personal Fate Cards    │  │  │
│  │  └────────────────────────────────────────┘     └─────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────┬────────────────────────────────────────────────┘  │
│                                                │                                                   │
│  ┌─────────────────────────────────────────────┴────────────────────────────────────────────────┐  │
│  │ Engine 7: Persistence, Logging & Cloud Storage Engine                                        │  │
│  │ - In-Memory Active Rooms & Disconnect Grace Map   - Batch Buffered RAM Logger (500ms flush)  │  │
│  │ - Self-Healing Manifest Re-Indexer                - Supabase Storage Client (RFC 7515 Bearer)│  │
│  └──────────────────────────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Chi Tiết 7 Cỗ Máy Chuyên Biệt (7 Specialized Engines):

1. **Deterministic FSM Engine (Máy Trạng Thái Hữu Hạn Xác Định - `src/domain/`)**:
   - Trực tiếp quản lý vòng lặp trạng thái của ván cờ: `WaitingRoll` ➔ `ActionPhase` ➔ `PropertyManagement` ➔ `AuctionPhase` / `HosePhase` / `InsolvencyPhase` ➔ `TurnEnd`.
   - **Hoàn toàn đồng bộ (100% Synchronous)**: Không chứa bất kỳ lệnh bất đồng bộ, `Promise` hay `setTimeout` nào trong lõi nghiệp vụ, triệt tiêu 100% nguy cơ race condition.
   - **Bộ tạo số ngẫu nhiên xác định (Deterministic PRNG)**: Sử dụng thuật toán Mulberry32 được gieo mầm (seeded) từ đầu ván, đảm bảo mọi kết quả đổ xúc xắc, rút thẻ và tính toán đều có thể tái lập (replayable) hoàn hảo.

2. **Economic & Financial Engine (Bộ Não Kinh Tế & Tài Chính Vĩ Mô - `src/domain/`)**:
   - Quản trị 28 Thẻ Chủ Quyền BĐS, biểu phí dừng chân lũy tiến và cơ chế nâng cấp đều tay (Even-Build Rule).
   - **Bất biến bảo toàn Kho Bạc (Treasury Conservation Invariant)**: `Δ Hệ Thống = Δ Người Chơi + Δ Kho Bạc = 0`. Mọi dòng tiền phạt, thuế, bảo lãnh đều nộp vào Kho Bạc và tái phân phối qua lương GO hoặc gói cứu trợ.
   - **Chuyển nhượng BĐS thế chấp kèm nợ (Loan Assumption P2P - IMP-204B)**: Định giá lại tài sản theo Giá trị ròng (Net Equity = Giá đất - Nợ vay), hạ sàn giao dịch xuống 35% giá niêm yết, di dời nghĩa vụ nợ nguyên tử sang người mua.
   - **Đòn bẩy Trái phiếu Doanh nghiệp & Sàn phát mãi 0 đồng (IMP-192C)**: Cho phép thế chấp danh mục vay 80% Net Worth từ Kho Bạc; vỡ nợ tự động kích hoạt sàn đấu giá phát mãi 0 đồng (Bắt đáy 0).
   - **Chu kỳ kinh tế vĩ mô 6 vòng (IMP-192B)**: Tự động xoay tua Sốt đất (x2.5 tiền thuê, giảm giá xây) ➔ Đóng băng thanh khoản (giảm tiền thuê, cấm mở khoản vay mới) ➔ Hạ nhiệt.
   - **Làm sạch thế chấp khi trúng đấu giá (Mortgage Sanitization - IMP-205)**: Đất trúng đấu giá phát mãi được giải phóng thế chấp ngay lập tức, tiền nợ gốc của người chơi vỡ nợ được hoàn trả ưu tiên cho Kho Bạc.

3. **Bot AI Decision Engine (Trí Tuệ Nhân Tạo Đối Kháng - `src/domain/bot/`)**:
   - Phân hóa 3 trường phái tính cách: **Aggressive** (Hiếu chiến, gom đất nhanh, ép giá), **Balanced** (Cân bằng thực dụng), **Passive** (Nhà đầu tư giá trị, tích lũy an toàn).
   - **Mô hình xác suất Softmax Sigmoid**: Kết hợp độ nhiễu xác định Seeded Jitter `[-0.12, +0.12]`, mô phỏng tâm lý cân nhắc đắn đo của con người thay vì ra quyết định cơ học.
   - **Chiến thuật Đàm phán Khoảng trống Độc quyền (Monopoly Gap)**: Chủ động phát hiện đối thủ hoặc chính mình chỉ còn thiếu 1 ô đất để hoàn thiện chuỗi màu (N-1 ô) để gửi đề xuất P2P Trade / Swap.
   - **Bộ giải cứu thanh khoản AFK (Solvency Recovery Solver)**: Khi đối mặt nguy cơ vỡ nợ, Bot tự động tính toán phương án tối ưu: hạ cấp công trình đều tay nhận lại 50% vốn, sau đó thế chấp các ô đất sinh lời thấp nhất để bảo toàn tính mạng.

4. **Server Orchestration & WebSocket Network Engine (Điều Phối & Mạng Realtime - `src/server/`)**:
   - Kiến trúc Single-Port phục vụ đồng thời giao thức HTTP REST và WebSocket trên cùng một cổng Node.js.
   - **GameRoomSession Aggregate Root (DDD - IMP-210)**: Gom cụm toàn bộ 10 cấu trúc dữ liệu phân tán (`Room`, `PropertyRegistry`, `PropertyStateMap`, `AuctionSession`, `rolledThisTurn`, `lastAuctionResult`, `activeTimers`, `lastActivity`, `botPersonalities`) vào một Aggregate Root nguyên tử duy nhất, quản trị vòng đời tập trung và triệt tiêu rò rỉ bộ nhớ qua chu trình Teardown nghiêm ngặt (`closeHooks` ➔ `pendingTradeManager.clearSession` ➔ `session.destroy()` ➔ `sessions.delete()`).
   - **Dynamic Map Facades & 100% Map Protocol Parity (`SessionFieldMapFacade`, `BotPersonalityMapFacade`)**: Cung cấp lớp bọc tương thích ngược chuẩn `Map` và `MapIterator` (chuẩn ES2025/TS 5.6+) cho các subsystem và test suites cũ mà không tốn chi phí RAM nhân đôi.
   - **Domain Action Coordinators (Khử Ping-Pong Surface - IMP-209)**: Tách bạch các điều phối viên nghiệp vụ chuyên biệt (`room_property_coordinator`, `hose_actions`, `bond_manager`, `auction_manager`). `IntentDispatcher` ủy quyền trực tiếp sang các Coordinators thay vì dội ngược qua `RoomManager`, giúp `RoomManager` tinh gọn (< 400 LOC, đạt chuẩn Tier 1).
   - **TurnOrchestrator & Watchdog**: Quản lý nhịp thở ván đấu, timer xác định, giải cứu AFK/Stall, đồng bộ vòng đời Turn N+1 dọn dẹp sạch sẽ ephemeral states.
   - **DeltaBroadcaster**: Nén và phát tán vi sai trạng thái cực nhỏ (**Sparse Diff < 10KB**), tích hợp giao thức mồ mả (Array Tombstones `[]` / `null`) giúp client cập nhật tức thì mà không cần nạp lại toàn bộ bàn cờ.
   - **Multi-Room Mutex & Zero Cross-Talk**: Cơ chế khóa Mutex theo từng phòng, bảo đảm cách ly tuyệt đối gói tin giữa các phòng chơi trong môi trường đa người dùng.

5. **3D Diorama & Physics Rendering Engine (Đồ Họa Sa Bàn & Vật Lý 3D - `src/client/3d/`)**:
   - Xây dựng trên nền tảng **React Three Fiber (Three.js)** kết hợp thư viện Drei, tối ưu hóa tốc độ khung hình 60 FPS trên cả thiết bị di động.
   - Sa bàn Metropolis Diorama 40 ô cờ phong cách thu nhỏ tinh xảo: Mặt bàn gỗ óc chó PBR véc-ni tự nhiên, thảm nỉ nhung cao cấp.
   - **Hệ thống kiến trúc 22 Tòa Nhà Landmark Cấp 3 Độc Bản (IMP-203)**: Mô hình GLB điêu khắc riêng cho 22 tỉnh thành Việt Nam (Bitexco, Keangnam, Ngọ Môn Huế, Dinh Bình Thủy...) với Bộ 3 Mỏ Neo Bất Biến (đai vàng chân đế, vương miện bảo ngọc tự xoay, khách sạn đỏ ruby).
   - **Khay gieo xúc xắc 3D vật lý**: Hiệu chỉnh góc nghiêng Euler Bias Tilt trực diện tầm mắt, triệt tiêu hoàn toàn ảo giác nhìn nhầm số chấm khi xúc xắc tiếp đất.
   - Hệ thống chiếu sáng điện ảnh: Tự động chuyển đổi mượt mà giữa Ban Ngày mát dịu, Hoàng Hôn vàng kim và Đêm Neon rực rỡ qua bộ lọc N8AO Ambient Occlusion.

6. **2D Tactile HUD, Audio & Haptic Engine (Giao Diện Xúc Giác, Âm Thanh & Rung - `src/client/ui/`, `src/client/audio/`)**:
   - Thiết kế theo chuẩn **Impeccable 2D Craft** và Tailwind CSS v4: Đổ bóng khuếch tán mềm (`shadow-sm`, `shadow-md`), tương tác nảy cơ học `active:scale-95`, bảo đảm vùng chạm WCAG >= 44px trên màn hình di động hẹp 360px.
   - **Hybrid Haptic Engine**: Kênh rung xúc giác đa nền tảng — rung cơ học trên Android (`navigator.vibrate`) và mô phỏng ảo giác xúc giác âm học tần số cao trên iOS Safari.
   - **Audio Engine**: Xử lý âm thanh đa luồng với Howler.js, tích hợp cơ chế tự động đánh thức lại WebAudio Context (`resumeAudioContext`) sau khi bị gián đoạn bởi cuộc gọi đến hoặc trợ lý ảo Siri.

7. **Persistence, Logging & Cloud Storage Engine (Lưu Trữ & Đồng Bộ Đám Mây - `src/server/storage/`)**:
   - Ghi nhật ký ván đấu bất đồng bộ qua bộ đệm RAM (Batch buffer 500ms), bảo vệ Event Loop của game server không bị nghẽn đĩa cứng.
   - **Bộ tự phục hồi chỉ mục (Self-Healing Re-indexer)**: Tự động quét và tái tạo tệp manifest ván đấu khi phát hiện hỏng hóc hoặc thiếu hụt dữ liệu.
   - Tự động đẩy nhật ký trận đấu và manifest lên **Supabase Cloud Storage** qua REST API (chuẩn RFC 7515 Compact Bearer Auth) với cơ chế timeout 15s và thử lại tự động khi rớt mạng.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Thử

### Yêu Cầu Tiên Quyết
- **Node.js** >= 20.x
- **npm** >= 10.x
- **Docker & Docker Compose** (nếu triển khai qua container)

### 1. Chạy Môi Trường Phát Triển (Local Dev)

```bash
# 1. Cài đặt dependencies
npm install

# 2. Tạo file cấu hình môi trường
cp .env.example .env

# 3. Khởi chạy dev server (Frontend & Server)
npm run dev
```

Trình duyệt mở tại: `http://localhost:5173`

---

### 2. Triển Khai Bằng Docker (Production)

Toàn bộ dịch vụ (Game Server, Nginx Reverse Proxy, Ngrok Tunnel) đã được đóng gói sẵn trong Docker Compose:

```bash
# 1. Khởi chạy và build container
docker compose up -d --build

# 2. Kiểm tra trạng thái dịch vụ
docker compose ps
```

- **Cổng Game (HTTP)**: `http://localhost:3000` (hoặc qua Nginx `http://localhost:80`)
- **WebSocket (WSS)**: `ws://localhost:3001` (hoặc qua Nginx `ws://localhost/rooms/`)
- **Trang Quản Trị (Admin Portal)**: `http://localhost:3000/#/admin`

---

## ⚙️ Cấu Hình Môi Trường (`.env`)

Sao chép từ `.env.example` và tùy chỉnh các biến sau:

| Biến Môi Trường | Mặc Định | Ý Nghĩa |
| :--- | :--- | :--- |
| `PORT` | `3000` | Cổng HTTP của Game Server |
| `WSS_PORT` | `3001` | Cổng WebSocket của Game Server |
| `GRACE_PERIOD_MS` | `60000` | Thời gian chờ kết nối lại (ms) |
| `VTCOON_ADMIN_SECRET` | *(bắt buộc)* | Mật mã đăng nhập trang Admin Portal |
| `MAX_CONCURRENT_ROOMS`| `50` | Giới hạn số phòng hoạt động đồng thời |
| `SUPABASE_URL` | *(tùy chọn)* | URL dự án Supabase để lưu trữ cloud log ván đấu |
| `SUPABASE_KEY` | *(tùy chọn)* | Secret Key / Anon Key xác thực Supabase Storage |
| `SUPABASE_BUCKET` | `game-logs` | Tên bucket lưu trữ file log `.jsonl` |
| `NGROK_AUTHTOKEN` | *(tùy chọn)* | Token ngrok nếu cần mở cổng ra Internet |
| `NGROK_DOMAIN` | *(tùy chọn)* | Tên miền tĩnh ngrok đã đăng ký |

> ⚠️ **Bảo Mật**: File `.env` chứa mật mã nhạy cảm và đã được đưa vào `.gitignore`. Tuyệt đối không commit file `.env` lên GitHub.

---

## 🧪 Lệnh Kiểm Thử & Kiểm Soát Chất Lượng

Dự án áp dụng quy trình kiểm soát chất lượng nghiêm ngặt (Quality Gate):

```bash
# Chạy toàn bộ unit & integration tests
npm test

# Kiểm tra giao diện, type checking và lint UI/UX
npm run lint:ui
npx tsc --noEmit

# Kiểm tra ngân sách dòng mã (LOC Budget) & chống code phình to
npm run check:loc

# Chạy toàn bộ cổng kiểm duyệt chất lượng trước khi bàn giao
npm run gate
```

- **345+ Living Test Suites (~7.000 test cases PASS 100%)**: Kiểm thử đa tầng từ Unit Tests, Living FSM Tests, Contract Suites đến E2E Multiplayer Flow.
- **Typecheck Gate Tự Động**: Bắt buộc kiểm tra biên dịch kiểu tĩnh qua `npx tsc --noEmit` trong pipeline nghiệm thu (`scripts/collect_evidence.mjs`), cấm tuyệt đối transpiler bypass (Vitest/esbuild) và bảo đảm 0 lỗi TypeScript trên toàn bộ codebase.
- **Anti-Slop & LOC Budget Guard**: Kiểm soát độ phức tạp cyclomatic (<= 5) và ngân sách LOC theo tầng kiến trúc (Tier 1 <= 400 LOC, Tier 2 <= 500 LOC) qua `scripts/lint_slop.mjs` và `scripts/check_loc.mjs`.

---

## 📁 Cấu Trúc Thư Mục Chính

```text
vtcoon/
├── src/
│   ├── domain/        # FSM lõi, bảng cờ, kinh tế, quy tắc nghiệp vụ thuần túy
│   ├── server/        # GameRoomSession, RoomManager, Domain Coordinators, WebSocket, Bot AI
│   └── client/        # Giao diện R3F 3D, âm thanh Howler, HUD, Modals, Stores
├── nginx/             # Cấu hình reverse proxy và chứng chỉ SSL
├── tests/             # 345+ living test suites (~7.000 tests: domain, server, client, contracts)
├── docs/              # Tài liệu kiến trúc, ADR, Design system và Domain gotchas
├── docker-compose.yml # Cấu hình triển khai multi-container
└── package.json       # Dependencies và scripts dự án
```

---

## 📄 Bản Quyền & Giấy Phép

Dự án thuộc quyền sở hữu riêng của tác giả. Mọi quyền được bảo lưu.
