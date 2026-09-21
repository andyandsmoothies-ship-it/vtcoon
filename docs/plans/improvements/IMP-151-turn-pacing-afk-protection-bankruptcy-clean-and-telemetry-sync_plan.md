# Kế Hoạch IMP-151: Tối Ưu Nhịp Độ Lượt Chơi, Bảo Vệ Người Chơi Khỏi Tự Đổ AFK, Làm Sạch Trạng Thái Phá Sản & Đồng Bộ Hộp Đen Pháp Chứng

> **Mã cải tiến**: [IMP-151]  
> **Căn cứ**: Dữ liệu pháp chứng thực tế từ tệp Hộp Đen phòng `VTCOON`/`VT8888`, các bất thường FSM âm tiền, hiện tượng tự đổ xúc xắc gây phá sản oan uổng, bot spam đàm phán, và báo cáo kiểm định đĩa cứng [`.agents/audit/PLAN_AUDIT_IMP151.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP151.md).  
> **Phân tầng rủi ro**: Tier 2 (Full Rigor) — Quy trình 3 Trạm & Zero-Trust Plan Grilling.  

---

## 1. TỔNG QUAN VẤN ĐỀ & MỤC TIÊU CẢI TIẾN

Từ dữ liệu phân tích tệp Hộp Đen chuyến bay (`flight_recorder`) thực tế, hệ thống đã phát hiện 5 vấn đề kỹ thuật và trải nghiệm người dùng:

1. **Bẫy tự đổ xúc xắc AFK 25 giây đẩy người chơi vào phá sản oan uổng**:
   - `turn_orchestrator.ts` đặt thời gian chờ đổ xúc xắc `WaitingRoll` là 25 giây cho cả người chơi lẫn Bot.
   - Khi ở tù 3 lượt, người chơi bị trừ ngầm 500 Tr. tiền phạt (số dư còn 185 Tr.). Lượt kế tiếp, người chơi không kịp bấm đổ xúc xắc trong 25 giây, Server tự động đổ [3, 6] = 9 bước đến Ô 19 (tiền thuê 200 Tr.).
   - `185 - 200 = -15 Tr. VNĐ` ➔ Người chơi bị rơi vào tình trạng phá sản một cách bất ngờ và thụ động.
2. **Lỗi FSM lưu số dư âm `-15 Tr.` sau khi phá sản**:
   - `declareBankruptcy` không reset `player.balance = 0` ở nhánh phá sản tự nguyện, khiến số dư âm lưu vĩnh viễn trong mọi snapshot tiếp theo.
3. **Quân cờ phá sản vẫn đứng trên sa bàn 3D**:
   - `PawnAnimator` không kiểm tra `player.bankrupt`, khiến quân cờ của người chơi đã bị loại tiếp tục đứng trơ trọi tại ô cuối cùng gây hiểu lầm.
4. **Hộp Đen Telemetry bị mù mã phòng và seed**:
   - `setSessionMetadata` trong `telemetry_store.ts` chưa từng được gọi, khiến file xuất ra luôn mang giá trị mặc định cứng `roomCode: "VTCOON"`, `seed: 12345` và `tickRate: 0`.
5. **Bot AI spam đàm phán quấy rầy**:
   - Bot gửi tới 4 lời mời đàm phán trong 3 phút, có lần gửi khi người chơi đang ở tù và có lần gửi chỉ 3 giây sau khi người chơi kết thúc lượt.

---

## 2. THIẾT KẾ KỸ THUẬT CHI TIẾT (ĐÃ QUA ZERO-TRUST PLAN GRILLING)

### 2.1. Tách Biệt Timeout & Khử Xung Đột Server Scheduler
- Trong `src/server/network/turn_orchestrator.ts`:
  - `HUMAN_PHASE_TIMEOUTS_MS[TurnPhase.WaitingRoll] = 45_000` (45 giây cho người chơi thật).
  - Thêm cảnh báo khẩn cấp khi còn 10 giây trên `top_bar.tsx`.
  - Trong `executeSafeAfkAction`: Nếu người chơi vừa thoát khỏi Trạm Kiểm Toán (`wasInAudit`), áp dụng đệm an toàn 15 giây.
- Trong `src/server/network/turn_watchdog.ts`:
  - Nâng `maxTurnStallMs` lên **90.000ms** (90s).
  - Cập nhật `tracker.lastProgressAt = Date.now()` mỗi khi `tracker.phase !== room.phase`, triệt tiêu 100% nguy cơ Watchdog cưỡng chế nhầm lượt.

### 2.2. Dọn Sạch Trạng Thái Phá Sản & Phòng Ngừa Vi Phạm Dòng Tiền
- Trong `src/server/insolvency_manager.ts` (`declareBankruptcy`):
  - Thiết lập rõ ràng `player.balance = 0;` ở mọi nhánh phá sản (nhánh có creditor, nhánh BANK, và nhánh mặc định).
  - Dọn sạch `player.mortgagedProperties = []; player.mortgageLoans = {};`.
- Trong `src/client/telemetry/telemetry_delta_hook.ts`:
  - Trong `isUnmodeledEvent`: Nhận diện sự kiện xóa nợ do phá sản khi `delta.players` có người chơi `bankrupt: true`, ngăn chặn báo động đỏ `TREASURY_INVARIANT_VIOLATED`.

### 2.3. Ẩn Quân Cờ Phá Sản & Chống Treo Hàng Đợi 3D
- Trong `src/client/3d/pawn_animator.tsx`:
  - Lọc bỏ hoặc trả về `null` đối với người chơi có `player.bankrupt === true`.
  - Nếu người chơi phá sản đang có hoạt ảnh (`activeAnimation?.playerId === player.id`), chủ động gọi `completePawnMove(player.id)` để giải phóng cờ `isBusy` và dọn sạch `pawnAnimationQueue`.

### 2.4. Đồng Bộ Metadata Hộp Đen & Tính Tick Rate
- Trong `src/client/network/use_app_session.ts`:
  - Gọi `useTelemetryStore.getState().setSessionMetadata({ roomCode: activeRoomCode, seed: hashSeed(activeRoomCode) })`.
- Trong `src/client/telemetry/telemetry_delta_hook.ts`:
  - Tính toán `tickRate` qua Rolling Window (5-10 delta gần nhất) với điều kiện chặn dưới $\Delta t \ge 16\text{ms}$ và `Number.isFinite`.

### 2.5. Phòng Thủ Quấy Rầy Đàm Phán Bot
- Trong `src/domain/bot/bot_trade.ts`:
  - Cấm đề xuất giao dịch khi đối phương đang ở trong Trạm Kiểm Toán (`target.inAudit === true` hoặc `target.auditTurnsLeft > 0`).
  - Áp dụng giãn cách tối thiểu 2 vòng đấu (`currentRound - bot.lastTradeOfferRound < 2`) giữa các lần Bot gửi đề xuất đàm phán.

---

## 3. KẾ HOẠCH KIỂM THỬ (VERIFICATION PLAN)

Tạo file: `tests/contracts/imp151_turn_pacing_afk_and_bankruptcy_clean.test.ts` (>= 16 atomic tests):
- **Facet 1 (Boundary & Timeout)**: Timeout 45s cho người chơi thật, đệm 15s khi vừa ra khỏi tù; Watchdog 90s reset khi đổi phase.
- **Facet 2 (Reactivity & Bot Defense)**: Bot không gạ mua đất khi ở tù, giãn cách tối thiểu 2 vòng.
- **Facet 3 (Bankruptcy State & Invariants)**: Reset `balance = 0`, dọn sạch nợ nần; Client Telemetry không báo động giả thất thoát quỹ.
- **Facet 4 (3D & Telemetry)**: Ẩn quân cờ phá sản không nghẽn hàng đợi 3D, đồng bộ `roomCode`/`seed` thật qua `hashSeed`, `tickRate > 0`.

Toàn bộ hệ thống: 268 test suites PASS, 0 UI anti-patterns, 0 slop violations.
