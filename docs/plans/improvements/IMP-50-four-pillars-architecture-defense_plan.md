# KẾ HOẠCH KỸ THUẬT: TRIỂN KHAI 4 TRỤ CỘT KIẾN TRÚC PHÒNG THỦ TOÀN DIỆN (IMP-50)

## 1. MỤC TIÊU & BỐI CẢNH
- **Mục tiêu**: Thiết lập 4 Trụ Cột Kiến Trúc cốt lõi để triệt tiêu hoàn toàn mọi nguy cơ bế tắc, đệ quy, lệch pha trạng thái và kẹt lượt chơi trong toàn bộ vòng đời ván đấu:
  1. **TRỤ CỘT 1: HỢP NHẤT BỘ ĐIỀU PHỐI MÁY CHỦ (Unified Turn Orchestrator)**:
     - Tạo `src/server/network/turn_orchestrator.ts`. Hợp nhất `BotTurnScheduler` và `TurnTimeoutScheduler` thành một bộ điều phối duy nhất `TurnOrchestrator`.
     - Tuyệt đối không cho phép 2 bộ scheduler chạy độc lập hoặc gọi chéo nhau. Bảo tồn 100% tương thích ngược cho 150 test suites hiện hữu.
  2. **TRỤ CỘT 2: BỘ KIỂM THỬ MÔ PHỎNG SỐNG (Headless WSS Living Chaos Suite)**:
     - Tạo `tests/simulation/wss_living_match_chaos.test.ts`. Khởi tạo `WssServer` thật trong bộ nhớ Node.js.
     - Mô phỏng phòng chơi 1 Người chơi giả lập (Human Persona: Roll, Buy, Decline, Pass, AFK) + 3 Bot AI.
     - Sử dụng `vi.useFakeTimers()` để tua nhanh thời gian (Virtual Clock) qua chu trình đầy đủ (Roll -> Move -> Property -> Auction -> EndTurn).
     - Chốt chặn tự động 2 Bất Biến: Loop Detection Invariant (> 5 lệnh lặp không đổi state) và Stall Detection Invariant (> 60s ảo không đổi lượt).
  3. **TRỤ CỘT 3: GIAO DIỆN THUẦN HÌNH CHIẾU (UI as Pure Projection)**:
     - Khóa chặt nguyên tắc: UI là hàm thuần túy của Server State.
     - Cấm UI tự đóng trạng thái nghiệp vụ (như `state.closeModal()`) dựa trên `setInterval` hoặc `timeRemaining <= 0` cục bộ.
     - Mọi modal nghiệp vụ (Auction, Deed, Insolvency, Hose) chỉ đóng khi server phát `delta.auction === null` hoặc phase thay đổi.
  4. **TRỤ CỘT 4: CHÓ CANH PHÒNG TỰ GIẢI CỨU (Fail-Safe Watchdog Auto-Recovery)**:
     - Tạo `src/server/network/turn_watchdog.ts`.
     - Khi một lượt chơi bị kẹt quá 45 giây (`elapsedMs > 45000` không có intent hợp lệ): Server tự động kích hoạt Cưỡng Chế Chuyển Lượt Khẩn Cấp (Emergency Turn Handover / Recovery), bảo đảm bàn chơi tự động thoát kẹt và tiếp tục vận hành.

- **Phạm vi tệp tin**:
  - `src/server/network/turn_orchestrator.ts` (mới)
  - `src/server/network/turn_watchdog.ts` (mới)
  - `src/server/network/bot_turn_scheduler.ts` (cập nhật tương thích)
  - `src/server/network/turn_timeout_scheduler.ts` (cập nhật tương thích)
  - `src/server/network/wss_server.ts` (cập nhật tích hợp)
  - `src/client/ui/modals/auction_modal.tsx` (loại bỏ đóng modal cục bộ)
  - `src/client/ui/modals/modal_host.tsx` (loại bỏ timer đóng modal cục bộ)
  - `src/client/network/apply_delta.ts` (đồng bộ đóng modal theo phase / delta)
  - `tests/simulation/wss_living_match_chaos.test.ts` (mới)
  - `tests/server/turn_orchestrator_and_watchdog.test.ts` (mới)

## 2. KIẾN TRÚC & PHÂN TÍCH KỸ THUẬT

```
[ WssServer ]
     │
     ├──> [ TurnOrchestrator ] ──(Điều phối duy nhất)──> [ RoomManager ]
     │         │                                               │
     │         ├──> Lượt Bot (800ms)                           │
     │         ├──> Timeout Human (15s/20s)                    │
     │         └──> Auction Coordination                       │
     │                                                         │
     └──> [ TurnWatchdog ] ──(Canh phòng >45s)─────────────────┘
               │
               └──> Emergency Turn Handover / Recovery
```

1. **TurnOrchestrator**:
   - Xóa bỏ hoàn toàn mối quan hệ phụ thuộc lẫn nhau (circular dependency) giữa `BotTurnScheduler` và `TurnTimeoutScheduler`.
   - Một hàm điều phối trung tâm `orchestrate(roomCode, customTimeoutMs?)`:
     - Nếu `AuctionPhase`: kiểm tra có bot hợp lệ chưa bid/pass và không phải `highestBidder`? Nếu có -> hẹn giờ bot bid. Nếu không -> hẹn giờ timeout 15s cho sàn đấu giá.
     - Nếu phase khác: nếu người chơi hiện tại là bot -> hẹn giờ bot turn. Nếu là người -> hẹn giờ phase timeout cho người.
     - Khi hết giờ timeout hoặc bot hành động xong: thực thi an toàn trong `IntentMutex.runExclusive`, sau đó lại gọi `orchestrate(roomCode)`.
   - Adapter backward-compatible: Giữ lại class `BotTurnScheduler` và `TurnTimeoutScheduler` dưới dạng adapter gọi vào `TurnOrchestrator` hoặc ủy quyền chuẩn, bảo đảm 100% test suites hiện có không cần sửa code.

2. **TurnWatchdog**:
   - Theo dõi từng phòng chơi đã `started`.
   - Lưu trữ `lastProgressAt` cho mỗi lượt chơi.
   - Khi `elapsedMs > 45000`: thực thi giải cứu khẩn cấp:
     - Đang ở `AuctionPhase`: đóng phiên đấu giá, nếu về `PropertyManagement` và bot dẫm ô thì gọi `handleEndTurn`.
     - Đang ở `PropertyManagement`: gọi `handleEndTurn`.
     - Đang ở `ActionPhase`: từ chối mua và kết thúc lượt.
     - Đang ở `WaitingRoll`: gieo xúc xắc và giải phóng lượt.
     - Đang ở `InsolvencyPhase`: tuyên bố phá sản.

3. **UI as Pure Projection**:
   - UI client không có thẩm quyền nghiệp vụ để tự quyết định khi nào đóng sàn đấu giá hay thoát khỏi tình trạng vỡ nợ.
   - Gỡ bỏ `if (timeRemaining <= 0) onClose?.()` trong `AuctionModal`.
   - Gỡ bỏ các `setTimeout` tự đóng modal trong `ModalHost`.
   - Modal chỉ đóng khi `delta.auction === null` hoặc khi `delta.turnPhase` chuyển sang pha không tương ứng với modal hiện tại trong `apply_delta.ts`.

4. **Wss Living Match Chaos Suite**:
   - Kết nối client giả lập (Persona: Human) với WssServer thật.
   - Chạy với `vi.useFakeTimers()` tua nhanh qua hàng trăm lượt chơi.
   - Thẩm định 2 Invariant: Không vòng lặp lệnh trùng > 5 lần, Không kẹt pha > 60s.

## 3. TIẾN ĐỘ THỰC THI THEO QUY TRÌNH 3 TRẠM
- **Trạm 1: RED Contract Test**:
  - Viết `tests/server/turn_orchestrator_and_watchdog.test.ts` (kiểm tra hợp nhất orchestrator, khử đệ quy, watchdog giải cứu 45s).
  - Viết `tests/simulation/wss_living_match_chaos.test.ts` (mô phỏng sống 1 Human + 3 Bot, tua nhanh fake timers, kiểm chứng 2 Invariants).
  - Chứng minh các test mới ở trạng thái RED trước khi implement.
- **Trạm 2: GREEN Implementation**:
  - Hiện thực `src/server/network/turn_orchestrator.ts`.
  - Hiện thực `src/server/network/turn_watchdog.ts`.
  - Cập nhật `src/server/network/bot_turn_scheduler.ts` và `src/server/network/turn_timeout_scheduler.ts`.
  - Tích hợp `turnOrchestrator` và `turnWatchdog` vào `src/server/network/wss_server.ts`.
  - Tinh chỉnh `src/client/ui/modals/auction_modal.tsx`, `src/client/ui/modals/modal_host.tsx`, `src/client/network/apply_delta.ts`.
  - Chạy toàn bộ test suites để chuyển sang GREEN.
- **Trạm 3: Độc lập Thẩm định & Xác thực Vật lý**:
  - `npx vitest run tests/server/turn_orchestrator_and_watchdog.test.ts` PASS.
  - `npx vitest run tests/simulation/wss_living_match_chaos.test.ts` PASS.
  - `npm test` toàn bộ 150+ suites PASS 100%.
  - `npx tsc --noEmit` đạt 0 lỗi.
  - `npm run lint:ui` đạt 0 vi phạm.
  - Ghi nhận `gotchas.md`, cập nhật `master_roadmap.md`, báo cáo `IMP-50...report.md`.
  - Rebuild Docker container.
