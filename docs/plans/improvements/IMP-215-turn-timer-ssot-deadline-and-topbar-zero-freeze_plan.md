# IMPLEMENTATION PLAN: IMP-215 — Turn Timer SSOT Deadline and TopBar Zero Freeze (Revision 2)

## 1. BỐI CẢNH & PHÂN TÍCH NGUYÊN NHÂN GỐC RỄ (ROOT CAUSE FORENSICS)

Trong ảnh hiện trường thực tế (`media_1790565038825.png`), tại Vòng 12/40, trong lượt của Bot AI 4 (Toast: *"Bạn thu +200 từ Bot AI 4"*), thanh TopBar hiển thị đồng hồ bị kẹt cứng tại `⏱️ 00:00` và nhấp nháy đỏ báo động (`text-rose-600 font-extrabold animate-pulse`).

Sau đợt thẩm định chuyên sâu từ `plan-griller` (`.agents/audit/PLAN_AUDIT_IMP215.md`), hệ thống đã xác định chính xác 5 nguyên nhân kỹ thuật:
1. **Server Bot Deadline Omission (`turn_orchestrator.ts`)**:
   Khi `orchestrate(roomCode)` chuyển lượt sang Bot (`current.isBot === true`), hệ thống gọi `this.clearRoom(roomCode)` (xóa sạch `this.deadlines.delete(roomCode)`), rồi gọi `scheduleBotStep(roomCode)`. `scheduleBotStep` KHÔNG HỀ thiết lập `this.deadlines.set(roomCode, ...)`. Hàm `getTimeRemaining(roomCode)` trả về `0` vì `!deadline`.
2. **Nghịch đảo thứ tự thực thi trong `turn_orchestrator.ts`**:
   Tại các dòng L143-L144, L221-L225, L234-L235, L276-L277, L322-L323, server gọi `broadcastRoomDelta(roomCode)` TRƯỚC KHI gọi `orchestrate(roomCode)`. Do đó delta phát ra luôn mang `timeRemaining: 0` của phase cũ trước khi `orchestrate` kịp thiết lập deadline mới!
3. **Client Mid-Turn Zero-Freeze Trap (`apply_delta.ts`)**:
   Trong ảnh hiện trường, sự cố xảy ra **giữa lượt** (Bot AI 4 đã gieo xúc xắc, di chuyển và trả tiền thuê +200). Khi delta thu tiền gửi xuống, `turnPlayerId` không đổi, luồng nhảy vào `else if (delta.timeRemaining !== undefined)` (L76). Tại L85: điều kiện `delta.timeRemaining <= state.turnTimeRemaining` (0 <= 25 là TRUE) đã kích hoạt ghi đè `state.setTurnTimeRemaining(0)` ngay giữa lượt Bot!
4. **Bảo toàn Invariant `wasInAudit` (IMP-151 Gotcha #200)**:
   Khi `wasInAudit === true`, cơ chế an toàn bắt buộc phải gạt cờ `wasInAudit = false` và `return` để `orchestrate` tái lập chu kỳ đệm 45s an toàn, tuyệt đối không được tự động đổ xí ngầu bất cẩn làm phá sản người chơi oan uổng (bảo vệ hợp đồng `TC-151.04`).
5. **Ngân sách LOC Tier 1 & Seam Delegation**:
   `turn_orchestrator.ts` hiện có 399 LOC (sát trần Tier 1 <= 400). Cần di dời logic `executeSafeAfkAction` sang `afk_recovery.ts` (146 LOC), đồng thời giữ lại phương thức ủy quyền (delegation wrapper) 3 dòng trên `TurnOrchestrator` nhận callback `(rc) => this.scheduleAuctionSettle(rc)` để tránh import vòng tròn và bảo vệ 100% các call-site trong test `imp60`/`imp151`.

---

## 2. KIẾN TRÚC MỤC TIÊU & BẢNG BẤT BIẾN DOMAIN (INVARIANTS)

```
[TurnOrchestrator.orchestrate(roomCode)]
       │
       ├──> current.isBot === true
       │    ├── deadlines.set(roomCode, Date.now() + phaseTimeoutMs)  <--- SSOT Deadline cho Bot
       │    └── scheduleBotStep(roomCode)
       │
       ▼
[ĐẢO THỨ TỰ: orchestrate() CHẠY TRƯỚC, broadcastRoomDelta() CHẠY SAU]
       │
       ▼
[broadcaster.broadcastRoomDelta(roomCode)]
       │
       └── getTimeRemaining(roomCode) > 0 (VD: 25s, 30s)
              │
              ▼
       [STATE_DELTA: timeRemaining: 25]
              │
              ▼
[Client apply_delta.ts]
       ├── Đổi lượt: delta.timeRemaining > 0 ? delta.timeRemaining : 60
       └── Giữa lượt: chỉ ghi đè khi delta.timeRemaining > 0
              │
              ▼
[TopBar.tsx] ──> Hiển thị đếm lùi mượt mà 00:25 -> 00:24... (Màu xanh text-emerald-700 font-bold)
```

### Bất biến Domain (SSOT):
- **Bất biến 1 (Monotonic Turn Timer)**: Bất kỳ thời điểm nào ván đấu đang diễn ra (`started === true`) và không phải Subphase đặc biệt (Đấu giá/Thương lượng/Mua đứt), `getTimeRemaining(roomCode)` trên server PHẢI trả về số nguyên dương $\ge 1$ (hoặc 0 khi và chỉ khi hết giờ thật).
- **Bất biến 2 (Non-Zero Turn Guard)**: Cả khi đổi lượt lẫn giữa lượt, `apply_delta.ts` không bao giờ được phép gán `turnTimeRemaining = 0` nếu server vô tình gửi $\le 0$ trong khi ván đấu chưa hết giờ.
- **Bất biến 3 (AFK Recovery Parity & Grace Buffer)**: Giữ nguyên hợp đồng `TC-151.04`: khi `player.wasInAudit === true`, xóa cờ và `return` để `orchestrate` tái lập chu kỳ đệm 45s, bảo vệ người chơi khỏi phá sản ngoài ý muốn.
- **Bất biến 4 (Execution Order Parity)**: Mọi chu kỳ kết thúc bước/chuyển phase trong `TurnOrchestrator` phải gọi `this.orchestrate(roomCode)` TRƯỚC KHI gọi `this.broadcaster.broadcastRoomDelta(roomCode)`.

---

## 3. CHI TIẾT CÁC STATION (QUY TRÌNH 3 TRẠM)

### Station 1: RED Contract Tests (`tests/contracts/imp215_turn_timer_ssot_deadline_and_topbar_zero_freeze.test.ts`)
Viết tối thiểu 16 atomic tests (1-4 asserts/test, zero loops, zero static checklist `fs.readFileSync`) phân bố trên 5 Facets:
- **Facet 1: Server Bot Deadline & Monotonic TimeRemaining ([TC-215.01] - [TC-215.04])**:
  - `orchestrate()` khi `current.isBot === true` thiết lập deadline hợp lệ trong `deadlines`.
  - `getTimeRemaining()` trả về $\ge 1$ (25s - 35s) trong lượt Bot.
  - Sau khi Bot bước 1 bước, `orchestrate` chạy trước `broadcastRoomDelta` phát delta chứa `timeRemaining > 0`.
  - Thứ tự thực thi tại L234-L235 bảo đảm delta nhận được deadline của phase kế tiếp.
- **Facet 2: Client Delta Non-Zero Fallback Guard ([TC-215.05] - [TC-215.08])**:
  - `syncTurnAndTimer` khi đổi lượt người chơi mà `delta.timeRemaining === 0` $\rightarrow$ fallback về 60s.
  - `syncTurnAndTimer` khi đổi lượt với `delta.timeRemaining === 25` $\rightarrow$ gán chính xác 25s.
  - `syncTurnAndTimer` khi nhận delta giữa lượt (mua đất / trả tiền thuê +200) với `delta.timeRemaining === 0` $\rightarrow$ KHÔNG ghi đè về 0, bảo toàn số giây đang đếm lùi.
  - `syncTurnAndTimer` khi nhận delta giữa lượt với `delta.timeRemaining > 0` và $\le$ thời gian hiện tại $\rightarrow$ cập nhật đồng bộ chính xác.
- **Facet 3: TopBar Rendering & Non-Freeze Contract ([TC-215.09] - [TC-215.11])**:
  - Khi lượt Bot với `turnTimeRemaining = 25`, TopBar hiển thị `00:25`, font `text-emerald-700 font-bold`.
  - Tuyệt đối không hiển thị `00:00` ở đầu hoặc giữa lượt Bot.
  - Khi `turnTimeRemaining <= 10`, class cảnh báo nhấp nháy đỏ chỉ kích hoạt đúng tiêu chuẩn.
- **Facet 4: AFK Recovery & Audit Grace Buffer ([TC-215.12] - [TC-215.14])**:
  - `executeSafeAfkAction` gạt cờ `wasInAudit = false` và không gọi `handleRollDice` (bảo toàn contract TC-151.04).
  - Phương thức ủy quyền `orchestrator.executeSafeAfkAction` hoạt động tương thích ngược 100% với call-sites của `imp60`/`imp151`.
  - AFK ở `TurnPhase.WaitingRoll` bình thường tự động gieo xúc xắc và chuyển lượt an toàn.
- **Facet 5: Multi-Turn Lifecycle Handoff ([TC-215.15] - [TC-215.16])**:
  - Kiểm tra vòng đời chuyển giao lượt từ Bot sang Bot bảo toàn deadline nguyên dương.
  - Kiểm tra vòng đời chuyển giao lượt từ Bot sang Người chơi thật bảo toàn deadline 45s.

### Station 2: GREEN Implementation
1. **`src/server/network/afk_recovery.ts`**:
   - Định nghĩa và xuất khẩu:
     ```typescript
     export function executeSafeAfkAction(
       rooms: RoomManager,
       roomCode: string,
       phase: TurnPhase,
       playerId: string,
       onScheduleAuctionSettle?: (roomCode: string) => void,
     ): void
     ```
   - Chuyển toàn bộ `switch (phase)` từ `turn_orchestrator.ts` sang.
   - Bảo toàn nhánh `wasInAudit`: gạt cờ `player.wasInAudit = false` và `return`.
2. **`src/server/network/turn_orchestrator.ts`**:
   - Import `executeSafeAfkAction as executeSafeAfkActionHelper` từ `./afk_recovery.js`.
   - Giữ lại wrapper ủy quyền:
     ```typescript
     private executeSafeAfkAction(roomCode: string, phase: TurnPhase, playerId: string): void {
       executeSafeAfkActionHelper(this.rooms, roomCode, phase, playerId, (rc) => this.scheduleAuctionSettle(rc));
     }
     ```
   - Trong `scheduleBotStep`:
     ```typescript
     const room = this.rooms.getRoom(roomCode);
     const phaseTimeoutMs = (room?.phase ? PHASE_TIMEOUTS_MS[room.phase] : undefined) ?? 25_000;
     this.deadlines.set(roomCode, Date.now() + phaseTimeoutMs);
     ```
   - Đảo ngược thứ tự thực thi tại 4 vị trí:
     - L143-L144 (Auction settle): `this.orchestrate(roomCode); this.broadcaster.broadcastRoomDelta(roomCode);`
     - L221-L225 (Auction bot step): `if (!stepRes.finished) this.orchestrate(roomCode); this.broadcaster.broadcastRoomDelta(roomCode);`
     - L234-L235 (Normal bot step): `this.orchestrate(roomCode); this.broadcaster.broadcastRoomDelta(roomCode);`
     - L276-L277 (Auction timeout): `this.orchestrate(roomCode); this.broadcaster.broadcastRoomDelta(roomCode);`
     - L322-L323 (Human AFK): `this.orchestrate(roomCode); this.broadcaster.broadcastRoomDelta(roomCode);`
   - Đo LOC: Giảm từ 399 LOC xuống ~336 LOC (Đạt chuẩn Tier 1 <= 400 LOC).
3. **`src/client/network/apply_delta.ts`**:
   - Trong `syncTurnAndTimer`:
     - Nhánh đổi lượt (L73):
       ```typescript
       state.setTurnTimeRemaining(delta.timeRemaining && delta.timeRemaining > 0 ? delta.timeRemaining : 60);
       ```
     - Nhánh giữa lượt (L83-L89):
       ```typescript
       if (
         isTurnReset ||
         (delta.timeRemaining > 0 && delta.timeRemaining <= state.turnTimeRemaining) ||
         delta.timeRemaining - state.turnTimeRemaining > 2
       ) {
         state.setTurnTimeRemaining(delta.timeRemaining);
       }
       ```
4. **`src/client/ui/top_bar.tsx`**:
   - Bảo toàn cấu trúc, 249 LOC (an toàn).

### Station 2.5: Sweeping Scout Audit
- Rà quét 5 tệp đối chiếu 5 nguyên mẫu lỗi phổ quát.

### Station 3: Independent Review Gates
- `spec-reviewer`: Đối chiếu 100% test cases với kế hoạch IMP-215 Revision 2.
- `code-reviewer`: Kiểm định De-Slop, Zero dirty cast, ngân sách LOC.
- `ui-craft-reviewer`: Thẩm định chất lượng TopBar và hiển thị đếm ngược.
