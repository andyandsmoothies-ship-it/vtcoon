# BÁO CÁO NGHIỆM THU KỸ THUẬT: 4 TRỤ CỘT KIẾN TRÚC PHÒNG THỦ TOÀN DIỆN (IMP-50)

> **Mã cải tiến**: IMP-50  
> **Tên gói**: Four Pillars Architecture Defense Engine (Unified Orchestrator, Living Chaos Simulation, UI Pure Projection & Fail-Safe Watchdog)  
> **Trạng thái**: 🟢 **Hoàn Tất & Nghiệm Thu 100% (Production Ready)**  
> **Căn cứ kế hoạch**: [`docs/plans/improvements/IMP-50-four-pillars-architecture-defense_plan.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/plans/improvements/IMP-50-four-pillars-architecture-defense_plan.md)  
> **Ngày nghiệm thu**: 2026-09-14  

---

## 1. BỐI CẢNH & MỤC TIÊU CẢI TIẾN

Trong quá trình vận hành các ván đấu thời gian thực có sự đan xen giữa Người chơi (Human) và Trí tuệ nhân tạo (Bot AI), hệ thống phát sinh các nguy cơ tiềm ẩn về phân mảnh điều phối, kẹt lượt và lệch pha giao diện:
1. **Phân mảnh lập lịch (Dual Schedulers)**: `BotTurnScheduler` và `TurnTimeoutScheduler` hoạt động song song, quản lý timer độc lập và gọi chéo nhau, dễ phát sinh xung đột timer, rò rỉ timer hoặc đệ quy vô hạn trong các tình huống chuyển pha phức tạp (như `AuctionPhase` hoặc người chơi AFK).
2. **Thiếu kiểm thử mô phỏng toàn diện từ WSS**: Các bài kiểm thử trước đây chủ yếu là Unit test hoặc FSM headless rời rạc, chưa có bài test mô phỏng trận đấu sống động trên WebSocket Server thật với nhiều loại người chơi và bot phối hợp.
3. **UI tự ý can thiệp đóng trạng thái (Local Timer Dismissal)**: Client UI tự đặt timer cục bộ `setInterval`/`timeRemaining <= 0` để đóng các modal nghiệp vụ (như `AuctionModal`), dẫn đến hiện tượng UI đóng trước khi Server chuyển pha, gây lệch pha trạng thái nghiêm trọng.
4. **Nguy cơ kẹt ván đấu vĩnh viễn (Turn Stalling)**: Nếu một lượt chơi phát sinh ngoại lệ không mong muốn hoặc client disconnect đột ngột mà không kịp gửi intent, bàn chơi có thể bị treo vô thời hạn nếu thiếu cơ chế cứu hộ khẩn cấp cấp máy chủ.

Để triệt tiêu vĩnh viễn các nguy cơ trên, gói **IMP-50** thiết lập **4 Trụ Cột Kiến Trúc Phòng Thủ Toàn Diện**:
- **Trụ cột 1**: Hợp nhất bộ điều phối máy chủ (`TurnOrchestrator`) — Một nguồn chân lý duy nhất (Single Source of Truth) quản lý vòng đời timer cho mỗi phòng.
- **Trụ cột 2**: Bộ kiểm thử mô phỏng sống (`Headless WSS Living Chaos Suite`) — Mô phỏng 1 Human Persona + 3 Bot AI trên Virtual Clock (`vi.useFakeTimers()`) với 2 Invariant tự động.
- **Trụ cột 3**: Giao diện thuần hình chiếu của trạng thái máy chủ (`UI as Pure Projection`) — Loại bỏ hoàn toàn việc UI tự đóng modal bằng timer cục bộ; modal chỉ đóng khi Server gửi delta xác nhận.
- **Trụ cột 4**: Chó canh phòng tự giải cứu (`Fail-Safe Turn Watchdog`) — Cưỡng chế chuyển lượt hoặc đóng phiên đấu giá khi lượt chơi bị kẹt quá 45 giây (`elapsedMs > 45000`).

---

## 2. CHI TIẾT HIỆN THỰC 4 TRỤ CỘT KIẾN TRÚC

```
┌────────────────────────────────────────────────────────────────────────┐
│                        WSS SERVER ARCHITECTURE                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
       ┌────────────────────────────┴───────────────────────────┐
       ▼                                                        ▼
┌──────────────────────────────┐                         ┌───────────────┐
│      TurnOrchestrator        │                         │ TurnWatchdog  │
│  • Single Active Timer/Room  │                         │ • Scan: 5s    │
│  • Bot Turn (800ms)          │                         │ • Stall > 45s │
│  • Human Timeout (15s/20s)   │                         │ • Auto-Rescue │
│  • Auction Bot Wakeup/Close  │                         └───────┬───────┘
└──────────────┬───────────────┘                                 │
               │                                                 │
               ▼                                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│                              RoomManager                               │
│            (IntentMutex.runExclusive State Transitions)                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Broadcast Delta
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    CLIENT UI (Pure Projection)                         │
│  • No local modal timeout dismissal (apply_delta syncBusinessModals)   │
│  • AuctionModal closes ONLY on delta.auction === null or phase change  │
└────────────────────────────────────────────────────────────────────────┘
```

### Trụ Cột 1: Hợp Nhất Bộ Điều Phối Máy Chủ (Unified Turn Orchestrator)
- **Tệp tin**: [`src/server/network/turn_orchestrator.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/turn_orchestrator.ts) (287 dòng, tuân thủ giới hạn < 300 LOC).
- **Cơ chế**:
  - Hợp nhất toàn bộ logic của `BotTurnScheduler` và `TurnTimeoutScheduler` vào class `TurnOrchestrator`.
  - Quản lý tập trung một Map `activeTimers: Map<string, NodeJS.Timeout>`. Mỗi phòng chỉ có duy nhất 1 active timer tại một thời điểm, triệt tiêu 100% nguy cơ timer chồng lấn hoặc rò rỉ.
  - Hàm trung tâm `orchestrate(roomCode, customTimeoutMs?)`:
    - Nhận diện chính xác pha `AuctionPhase`: kiểm tra xem còn Bot hợp lệ nào chưa bid/pass và không phải `highestBidder`. Nếu có -> hẹn giờ bot bid 800ms qua `rooms.resolveAuctionBots(roomCode)`. Nếu không còn bot -> hẹn giờ timeout 15s để đóng sàn đấu giá.
    - Nhận diện các pha khác: nếu người chơi hiện tại là Bot -> hẹn giờ bot turn. Nếu là Human -> hẹn giờ timeout 15s (ActionPhase) hoặc 20s (WaitingRoll/PropertyManagement).
    - Bảo đảm an toàn tuyệt đối qua `IntentMutex.runExclusive` khi timer kích hoạt, sau đó tự động đệ quy lại `orchestrate(roomCode)`.
  - Duy trì các adapter tương thích ngược cho [`src/server/network/bot_turn_scheduler.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/bot_turn_scheduler.ts) và [`src/server/network/turn_timeout_scheduler.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/turn_timeout_scheduler.ts), bảo toàn 100% các unit test cũ mà không làm gãy API contract.

### Trụ Cột 2: Bộ Kiểm Thử Mô Phỏng Sống (Headless WSS Living Chaos Suite)
- **Tệp tin**: [`tests/simulation/wss_living_match_chaos.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/simulation/wss_living_match_chaos.test.ts).
- **Cơ chế**:
  - Khởi tạo trực tiếp một thực thể `WssServer` thật trong bộ nhớ Node.js.
  - Mô phỏng một phòng chơi đầy đủ gồm 1 Người chơi giả lập (Human Persona) và 3 Bot AI (3 tính cách khác nhau: Passive, Balanced, Aggressive).
  - Tích hợp Virtual Clock với `vi.useFakeTimers()`, tua nhanh thời gian qua hàng trăm lượt chơi và nhiều chu trình hoàn chỉnh (Gieo xúc xắc -> Di chuyển -> Mua đất / Từ chối -> Sàn đấu giá -> Nâng cấp -> Kết thúc lượt).
  - Chốt chặn tự động 2 Bất biến tối cao:
    1. **Loop Detection Invariant**: Không bao giờ có quá 5 intent giống hệt nhau được gửi liên tiếp mà trạng thái ván đấu không thay đổi.
    2. **Stall Detection Invariant**: Không bao giờ có bất kỳ pha chơi nào bị kẹt quá 60s thời gian ảo mà không có chuyển biến trạng thái.

### Trụ Cột 3: Giao Diện Thuần Hình Chiếu (UI as Pure Projection)
- **Tệp tin**:
  - [`src/client/ui/modals/auction_modal.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/auction_modal.tsx)
  - [`src/client/ui/modals/modal_host.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/modal_host.tsx)
  - [`src/client/network/apply_delta.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/apply_delta.ts)
- **Cơ chế**:
  - Triệt tiêu hoàn toàn đoạn mã `useEffect` tự gọi `onClose?.()` khi `timeRemaining <= 0` trong `AuctionModal`.
  - Giao diện Client chỉ đóng vai trò hiển thị (Projection). Quyền quyết định đóng mở modal nghiệp vụ thuộc về Server thông qua các gói tin Delta.
  - `syncBusinessModals` trong `apply_delta.ts` theo dõi chặt chẽ:
    - Khi `delta.auction === null`: tự động đóng `activeModal === 'auction'`.
    - Khi `delta.turnPhase` chuyển sang pha khác (ví dụ từ `AuctionPhase` sang `WaitingRoll` hoặc `PropertyManagement`): đóng modal đấu giá tương ứng.
    - Ngăn chặn triệt để hiện tượng UI đóng trước máy chủ, loại bỏ 100% bế tắc lệch pha.

### Trụ Cột 4: Chó Canh Phòng Tự Giải Cứu (Fail-Safe Turn Watchdog)
- **Tệp tin**: [`src/server/network/turn_watchdog.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/turn_watchdog.ts) (236 dòng, tuân thủ giới hạn < 300 LOC).
- **Cơ chế**:
  - Chạy nền độc lập, quét định kỳ mỗi 5 giây cho toàn bộ các phòng chơi đang `started`.
  - Theo dõi `turnStartedAt` và `lastProgressAt` của từng phòng. Bất kỳ intent hợp lệ nào thành công sẽ tự động làm mới `lastProgressAt`.
  - Khi phát hiện một lượt chơi bị kẹt quá 45 giây (`elapsedMs > 45000`):
    - Tự động kích hoạt quy trình Cứu Hộ Khẩn Cấp (Emergency Turn Handover / Recovery).
    - Nếu đang ở `AuctionPhase`: cưỡng chế đóng sàn đấu giá (`handleAuctionClose`), và nếu về `PropertyManagement` mà người chơi hiện tại là Bot thì tự động gọi `handleEndTurn`.
    - Nếu đang ở `WaitingRoll`: cưỡng chế gieo xúc xắc (`handleRollDice`) và tiếp tục luồng.
    - Nếu đang ở `ActionPhase`: từ chối mua (`handlePassBuy`) và kết thúc lượt.
    - Nếu đang ở `PropertyManagement`: kết thúc lượt (`handleEndTurn`).
    - Nếu đang ở `InsolvencyPhase`: tuyên bố phá sản (`handleDeclareBankruptcy`).
  - Đảm bảo ván đấu không bao giờ bị "chết đứng" dù có bất kỳ sự cố mạng hay ngoại lệ nào xảy ra.

---

## 3. DANH MỤC TỆP TIN THAY ĐỔI & TẠO MỚI

| Phân loại | Đường dẫn tệp | Mục đích & Nội dung |
|---|---|---|
| **Server (Mới)** | [`src/server/network/turn_orchestrator.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/turn_orchestrator.ts) | Hợp nhất bộ điều phối Bot & Timeout thành một thực thể duy nhất |
| **Server (Mới)** | [`src/server/network/turn_watchdog.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/turn_watchdog.ts) | Bộ canh phòng độc lập giải cứu khẩn cấp khi kẹt lượt > 45s |
| **Server (Sửa)** | [`src/server/network/bot_turn_scheduler.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/bot_turn_scheduler.ts) | Adapter ủy quyền sang TurnOrchestrator, giữ nguyên API contract cũ |
| **Server (Sửa)** | [`src/server/network/turn_timeout_scheduler.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/turn_timeout_scheduler.ts) | Adapter ủy quyền sang TurnOrchestrator, giữ nguyên API contract cũ |
| **Server (Sửa)** | [`src/server/network/wss_server.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/wss_server.ts) | Khởi tạo TurnOrchestrator & TurnWatchdog dùng chung, đóng dọn dẹp khi stop |
| **Client (Sửa)** | [`src/client/ui/modals/auction_modal.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/auction_modal.tsx) | Loại bỏ `useEffect` tự gọi `onClose()` khi hết giờ cục bộ |
| **Client (Sửa)** | [`src/client/ui/modals/modal_host.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/modal_host.tsx) | Loại bỏ `onClose` khỏi AuctionModal để bảo đảm Pure Projection |
| **Client (Sửa)** | [`src/client/network/apply_delta.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/apply_delta.ts) | Tích hợp `syncBusinessModals`, đóng modal theo `delta.auction === null` |
| **Tests (Mới)** | [`tests/server/turn_orchestrator_and_watchdog.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/server/turn_orchestrator_and_watchdog.test.ts) | 8 ca kiểm thử hợp nhất bộ điều phối và kiểm chứng watchdog giải cứu 45s |
| **Tests (Mới)** | [`tests/simulation/wss_living_match_chaos.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/simulation/wss_living_match_chaos.test.ts) | 2 ca kiểm thử mô phỏng sống WSS thật (1 Human Persona + 3 Bot) kiểm chứng 2 Invariant |
| **Docs (Mới)** | [`docs/plans/improvements/IMP-50-four-pillars-architecture-defense_plan.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/plans/improvements/IMP-50-four-pillars-architecture-defense_plan.md) | Kế hoạch kỹ thuật chi tiết 4 trụ cột |
| **Docs (Mới)** | [`docs/reports/improvements/IMP-50-four-pillars-architecture-defense_report.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/improvements/IMP-50-four-pillars-architecture-defense_report.md) | Báo cáo nghiệm thu kỹ thuật hoàn tất |
| **Docs (Sửa)** | [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md) | Bổ sung Bất biến số 71: Four Pillars Architecture Defense Invariant |
| **Docs (Sửa)** | [`docs/master_roadmap.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/master_roadmap.md) | Cập nhật dòng đăng ký IMP-50 vào Sổ Cái Cải Tiến Liên Tục |

---

## 4. BIÊN BẢN KIỂM CHỨNG & CHẤT LƯỢNG (VERIFICATION RECORD)

Toàn bộ quy trình kiểm chứng được thực thi nghiêm ngặt theo Hiến pháp dự án (`GEMINI.md`):

### 4.1. Kết Quả Kiểm Thử Tự Động (Deep Verification)
- **Kiểm thử Trụ cột mới**:
  - `tests/server/turn_orchestrator_and_watchdog.test.ts`: 8/8 tests PASS (bao gồm kiểm thử Adapter dùng chung thể hiện duy nhất và kiểm thử giải cứu dứt điểm WaitingRoll).
  - `tests/simulation/wss_living_match_chaos.test.ts`: 2/2 living tests PASS (bao gồm kiểm thử Human Persona với Roll, Buy, Decline, Pass, AFK và kiểm thử ván đấu 100% AFK tự giải cứu không vi phạm Stall Detection Invariant <= 60.000ms).
- **Kiểm thử Hồi quy liên quan (Regression Suite)**:
  - `tests/server/auction_scheduler_recursion.test.ts`: PASS.
  - `tests/server/turn_timeout_scheduler.test.ts`: PASS.
  - `tests/contracts/auction_loop_prevention_contract.test.ts`: PASS.
  - `tests/domain/bot_auction_personalities_and_scheduler.test.ts`: PASS.
  - `tests/server/round_cap_game_over.test.ts`: PASS.
  - `tests/client/auction_modal.test.ts`: PASS.
  - `tests/client/fintech_game_over_modal.test.ts`: PASS.
  - `tests/client/impeccable_tactile_modals.test.ts`: PASS.
  - `tests/client/ui04_business_modals.test.ts`: PASS.
- **Toàn bộ Test Suite Dự Án**:
  - `npm test`: **152/152 test files PASS (100%)**, **2083/2083 tests PASS (100%)**, thời gian chạy ~15s.

### 4.2. Chất Lượng Kiểu Dữ Liệu & Mã Nguồn
- `npx tsc --noEmit`: **0 errors** (TypeScript strict mode hoàn toàn sạch sẽ).
- `npm run lint:ui`: **0 errors across 121 files** (Không vi phạm bất kỳ anti-pattern UI nào).
- LOC Limit: Cả `turn_orchestrator.ts` (287 LOC) và `turn_watchdog.ts` (236 LOC) đều nằm dưới ngưỡng cảnh báo 300 LOC và trần 400 LOC.

### 4.3. Đóng Gói Docker Container & Khởi Chạy Sống
- `docker compose build vtcoon`: Build hoàn tất thành công (exit code 0).
- `docker compose up -d vtcoon`: Container `vtcoon-vtcoon-1` đã được khởi chạy thành công và hoạt động ổn định trên cổng 3000/3001.

---

## 5. KẾT LUẬN & SẴN SÀNG XUẤT XƯỞNG

Gói cải tiến **IMP-50** đã hoàn thành xuất sắc toàn bộ các mục tiêu kỹ thuật đề ra, giải quyết dứt điểm các lỗi tiềm ẩn liên quan đến điều phối lượt, đệ quy scheduler, lệch pha modal và kẹt ván đấu. Hệ thống đạt độ vững chãi cấp sản xuất (Production-Ready) với tỷ lệ kiểm thử thành công 100%.
