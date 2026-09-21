# Báo Cáo Nghiệm Thu IMP-151: Tối Ưu Nhịp Độ Lượt Chơi, Bảo Vệ Tự Đổ AFK, Làm Sạch Trạng Thái Phá Sản & Đồng Bộ Hộp Đen Pháp Chứng

> **Mục tiêu:** Khắc phục triệt để các bất thường FSM và trải nghiệm người dùng thu thập từ dữ liệu hộp đen thực tế (Phòng `VTCOON`/`VT8888`): (1) Nâng thời gian đổ xúc xắc người chơi thật từ 25s lên 45s và đệm an toàn AFK khi ra tù (`wasInAudit`), ngăn chặn tự đổ xúc xắc gây phá sản oan uổng; (2) Reset số dư âm về 0 và dọn nợ thế chấp khi phá sản; (3) Ẩn quân cờ phá sản khỏi sa bàn 3D và tự giải phóng hàng đợi hoạt ảnh; (4) Khử cảnh báo vi phạm bảo toàn quỹ giả trên Telemetry; (5) Đồng bộ mã phòng và `seed` tất định qua `hashSeed(roomCode)`; (6) Chặn Bot gạ mua đất khi đối phương ở tù.  
> **Căn cứ pháp chứng:** Dữ liệu log hộp đen thực tế phòng `VTCOON`/`VT8888`, Báo cáo Plan Grilling ([`.agents/audit/PLAN_AUDIT_IMP151.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP151.md)), Snapshot bằng chứng vật lý ([`.agents/evidence/imp151_snapshot.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp151_snapshot.json)), Gotcha #200 trong [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md).  
> **Phân loại & Quy trình:** Tier 2 (Full Rigor — Quy trình 3 Trạm có Plan Grilling và kiểm toán độc lập đối kháng).

---

## 1. Bối Cảnh Thực Tế & Phân Tích Pháp Chứng

Từ dữ liệu Hộp Đen phòng đấu thực tế:
- **Nguyên nhân phá sản oan**: Người chơi ở tù 3 lượt bị phạt ngầm 500 Tr. (số dư từ 685 Tr. sụt xuống 185 Tr.). Lượt kế tiếp, do timeout đổ xúc xắc người chơi chỉ là 25 giây, người chơi chưa kịp thao tác thì Server tự động kích hoạt AFK auto-roll ra [3, 6] = 9 bước, tiến vào Ô 19 của đối thủ có tiền thuê 200 Tr. ➔ Số dư biến thành -15 Tr. và bị tuyên bố phá sản oan uổng.
- **Trạng thái phá sản dị dạng**: `declareBankruptcy` không reset số dư âm, ghi nhận số dư -15 Tr. trong cơ sở dữ liệu và FSM.
- **Rối loạn sa bàn 3D**: `PawnAnimator` vẫn tiếp tục vẽ quân cờ của người chơi phá sản trên sa bàn; nếu người chơi phá sản lúc đang di chuyển, cờ `isBusy` có nguy cơ bị kẹt.
- **Telemetry desync**: `telemetry_store` hardcode mã phòng và seed mặc định giả lập, làm giảm độ tin cậy của bộ sinh kịch bản tái hiện lỗi (`repro_generator`).
- **Bot quấy rầy**: Bot AI liên tục gửi lời mời chào đàm phán trong lúc người chơi đang bị thụ án kiểm toán.

---

## 2. Các Thay Đổi Kỹ Thuật Đã Triển Khai (Implemented Changes)

| Tệp Mã Nguồn | Vị Trí / Dòng | Thay Đổi Kỹ Thuật | Tác Động & Hợp Đồng Bảo Toàn |
| :--- | :--- | :--- | :--- |
| [`src/server/network/turn_orchestrator.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/turn_orchestrator.ts) | Dòng 21-25, 271-276 | Khai báo `HUMAN_PHASE_TIMEOUTS_MS` với `WaitingRoll = 45_000`; kiểm tra `wasInAudit === true` trong `executeSafeAfkAction` để không tự động đổ xí ngầu | Người chơi có 45 giây thong thả suy nghĩ; khi vừa ra tù được bảo vệ an toàn 15s đệm, không bị Server cưỡng chế đổ xúc xắc |
| [`src/server/network/turn_watchdog.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/turn_watchdog.ts) | Dòng 56, 127-129 | Nâng `maxTurnStallMs` mặc định lên 90.000ms; cập nhật `tracker.lastProgressAt = Date.now()` khi `tracker.phase !== room.phase` | Triệt tiêu xung đột điều phối (Scheduler Collision) giữa Watchdog 60s và Orchestrator 45s + 15s |
| [`src/domain/bot/bot_trade.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/bot/bot_trade.ts) | Dòng 225, 241, 282 | Miễn trừ đàm phán khi `targetOwner.inAudit === true` hoặc `targetOwner.auditTurnsLeft > 0`; cố định `cooldownRounds = 2` | Chặn đứng Bot quấy rầy người chơi đang ở tù và giãn cách nhịp độ đàm phán |
| [`src/server/insolvency_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/insolvency_manager.ts) | Dòng 178-185, 203 | Reset `player.balance = 0` ở tất cả các nhánh phá sản (default, BANK, creditor); dọn sạch `mortgagedProperties = []` và `mortgageLoans = {}` | Làm sạch 100% dữ liệu tài chính khi phá sản, đưa Net Worth về đúng 0 Tr. |
| [`src/client/telemetry/telemetry_delta_hook.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/telemetry/telemetry_delta_hook.ts) | Dòng 204, 246, 297 | `isUnmodeledEvent` và `computeExpectedDelta` nhận diện sự kiện xóa nợ phá sản; xuất hàm `calculateTickRate` với chặn dưới $\Delta t \ge 16$ms | Khử triệt để báo động đỏ giả `TREASURY_INVARIANT_VIOLATED` trên Client; tính tickRate an toàn không chia cho 0 |
| [`src/client/3d/pawn_animator.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/pawn_animator.tsx) | Dòng 371-387 | Lọc bỏ `player.bankrupt === true`; tự động gọi `completePawnMove` và dọn `activePawnAnimation` ngay trong render phase & effect | Sa bàn 3D sạch bóng quân cờ phá sản; giải phóng cờ `isBusy` không làm treo hàng đợi Presentation Queue |
| [`src/client/telemetry/telemetry_store.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/telemetry/telemetry_store.ts) | Dòng 155-158 | Tự động suy diễn `seed = hashSeed(roomCode)` khi metadata khuyết `seed` | Đảm bảo tính tất định cho bộ tái hiện lỗi Hộp Đen |
| [`src/client/network/use_app_session.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/use_app_session.ts) | Dòng 155 | Gọi `setSessionMetadata({ roomCode: activeRoomCode, seed: hashSeed(activeRoomCode) })` | Đồng bộ mã phòng và seed thực tế ngay từ lúc kết nối |
| [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md) | Dòng 3320 | Ghi nhận Gotcha #200 | Lưu trữ bất biến cho toàn bộ hệ thống |

---

## 3. Bằng Chứng Nghiệm Thu 3 Trạm (3-Station Verification Evidence)

### Trạm 1: RED Contract Tests (`qa-tester`)
- Tệp kiểm thử độc lập: `tests/contracts/imp151_turn_pacing_afk_and_bankruptcy_clean.test.ts`.
- 17 ca kiểm thử nguyên tử theo ma trận Universal 4-Facet:
  - **Facet 1 (Boundary & Range)**: 4 tests (`[TC-151.01..04]`) — Timeout 45s, Watchdog 90s, đệm AFK ra tù.
  - **Facet 2 (Reactivity & Bot Intelligence)**: 4 tests (`[TC-151.05..08]`) — Bot miễn trừ gạ mua khi ở tù, Cooldown 2 vòng.
  - **Facet 3 (Bankruptcy State & Invariants)**: 5 tests (`[TC-151.09..13]`) — Balance = 0, xóa nợ thế chấp, bypass báo động đỏ vi phạm quỹ.
  - **Facet 4 (3D Visual & Telemetry)**: 4 tests (`[TC-151.14..17]`) — Ẩn quân cờ 3D, dọn animation queue, hash seed tất định, safe tickRate.
- **Xác nhận Adversarial Inversion**: 17/17 tests FAIL (RED) trên mã nguồn gốc trước khi triển khai.

### Trạm 2: GREEN Implementation (`implementer`)
- Triển khai tối thiểu trên 8 tệp mã nguồn.
- Chạy kiểm thử hợp đồng: **17/17 tests PASS GREEN 100%**.
- Toàn bộ hệ thống: **273/273 test files (5.619 tests) PASS GREEN 100%**.
- Kiểm tra tính bất biến (Adversarial Inversion): Đảo ngược điều kiện timeout hoặc đệm AFK lập tức làm fail test; hoàn nguyên pass 100%.
- Kiểm tra tĩnh học: `npx tsc --noEmit` sạch 0 lỗi; `npm run lint:ui` sạch 0 vi phạm (165 files).
- Tạo snapshot bằng chứng vật lý: `.agents/evidence/imp151_snapshot.json`.

### Trạm 3: Independent Review & Disk Verification
1. **`spec-reviewer`**:
   - Đối soát vật lý 100% đặc tả kỹ thuật với từng dòng code trên đĩa cứng.
   - Xác nhận 17/17 tests có tính truy vết (`traceability`), không code-golf, không relax assertion.
   - Khớp bằng chứng snapshot `.agents/evidence/imp151_snapshot.json`.
   - **Phán quyết: APPROVED**.
2. **`ui-craft-reviewer`**:
   - Sa bàn 3D Three.js unmount quân cờ phá sản sạch sẽ qua React Fiber, giữ vững 60 FPS.
   - Giải phóng cờ `isBusy` triệt để, không gây nghẽn Presentation Queue.
   - 0 vi phạm trên 4 anti-patterns Impeccable (`npm run lint:ui`).
   - **Phán quyết: APPROVED (disposition: ship)**.

---

## 4. Kết Luận & Bàn Giao

Gói cải tiến **IMP-151** đã hoàn thành xuất sắc toàn bộ tiêu chí Definition of Done (DoD). Vấn đề nhịp độ lượt chơi, bẫy tự đổ xúc xắc AFK gây phá sản oan uổng, số dư âm làm sai lệch FSM, và quân cờ phá sản trên sa bàn 3D đã được giải quyết triệt để và an toàn.
