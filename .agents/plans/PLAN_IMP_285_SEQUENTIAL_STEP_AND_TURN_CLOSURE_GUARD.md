# KẾ HOẠCH TRIỂN KHAI MICRO-SLICE (LEAN PLAN SPECIFICATION)
# TICKET: IMP-285 — Chuẩn Hóa Thứ Tự Step Vòng Lượt & Cơ Chế Khóa Chuyển Lượt Khi Có Nợ Treo (Sequential Step Engine & Zero-Overrun Turn Closure Guard)

> **Mã Nhiệm Vụ:** IMP-285 (Sequential Step Engine & Zero-Overrun Turn Closure Guard)  
> **Phân hệ mục tiêu:** `server-fsm` & `server-network`  
> **Phân loại rủi ro:** Tier 1 Micro-Slice (Lean Plan Specification, <= 180 lines, Delta <= 38 LOC, 3 files in `src/server/`)  
> **Chỉ tiêu kiểm thử:** Scaled Floor >= 8 atomic tests, Pure Logic Waiver = `true` (Non-visual backend server FSM logic)  
> **Tham chiếu phản biện:** `.agents/audit/PLAN_CHALLENGE_IMP-285.md` (Giải quyết triệt để ADV-01, ADV-04, ADV-05)

---

## 0. KHẢO SÁT BỀ MẶT MÃ NGUỒN & ĐIỂM BẮT ĐẦU (SURFACE INVENTORY & LOC BASELINE)

### 0.1 Danh Sách Tệp Mục Tiêu & Dòng Mã Thực Tế Trên Đĩa
* **Target physical file**: `src/server/turn_loop.ts` (347 lines, Tier 1 limit: 400 lines) — **Safe**.
* **Target physical file**: `src/server/insolvency_manager.ts` (296 lines, Tier 1 limit: 400 lines) — **Safe**.
* **Target physical file**: `src/server/network/turn_orchestrator.ts` (377 lines, Tier 1 limit: 400 lines) — **Safe**.
* **Target physical file**: `tests/contracts/imp285_sequential_turn_closure_guard.test.ts` (New file in Station 1/2, Living Test limit: 600 lines) — **Safe**.

### 0.2 Bảng Thống Kê Delta LOC Dự Kiến
| File | Tier | Current LOC | Expected LOC | Delta LOC | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `src/server/turn_loop.ts` | Tier 1 (Server FSM) | 347 | 362 | +15 lines | Safe (<= 400) |
| `src/server/insolvency_manager.ts` | Tier 1 (Domain FSM) | 296 | 310 | +14 lines | Safe (<= 400) |
| `src/server/network/turn_orchestrator.ts` | Tier 1 (Server Net) | 377 | 388 | +11 lines | Safe (<= 400) |
| `tests/contracts/imp285_sequential_turn_closure_guard.test.ts` | Living Test | 0 | ~190 | +190 lines | Safe (<= 600) |
| **Tổng Delta Production (`src/**`)** | — | — | — | **+40 net LOC** (<= 50 LOC) | **Pass Micro-Slice** |

### 0.3 Phân Định Phạm Vi & Ranh Giới Phân Hệ (Scope Conservation Mandate)
1. [`src/server/turn_loop.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/turn_loop.ts) — **MODIFY (Target 1)**: 
   - Chốt chặn Zero-Overrun Turn Closure trong `executeTurnEnd`: từ chối chuyển lượt (`return undefined`) nếu có bất kỳ người chơi nào chưa phá sản bị âm tiền (`room.players.some(p => p.balance < 0 && !p.bankrupt)`).
   - Trong `executeTurnRoll`: sau khi phân giải ô tiếp đất và rút thẻ Sự kiện, quét phát hiện danh sách người chơi bị âm tiền, khởi tạo `room.pendingInsolvencyQueue` (ADV-05), gọi `checkInsolvency(room, landlordId, firstDebtorId)`.
2. [`src/server/insolvency_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/insolvency_manager.ts) — **MODIFY (Target 2)**: 
   - `checkInsolvency(room: Room, creditorId?: string, debtorId?: string)` gán `room.pendingInsolvencyDebtorId = debtorId` và chuyển `room.phase = TurnPhase.InsolvencyPhase`.
   - Trong `declareBankruptcy`: khi con nợ ngoài lượt phá sản (`room.currentPlayerIndex` không phải con nợ), chuyển tiếp sang con nợ kế tiếp trong `room.pendingInsolvencyQueue` nếu còn; nếu không còn con nợ nào, phục hồi `room.phase = TurnPhase.PropertyManagement` (ADV-04).
3. [`src/server/network/turn_orchestrator.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/turn_orchestrator.ts) — **MODIFY (Target 3)**: 
   - Trong `orchestrate`: khi `room.phase === TurnPhase.InsolvencyPhase`, định vị con nợ `activeDebtor = room.pendingInsolvencyDebtorId ? room.players.find(p => p.id === room.pendingInsolvencyDebtorId) : current`. Nếu `!activeDebtor.isBot`, lên lịch `scheduleHumanTimeoutStep` (45s) và ngắt lượt Bot.
   - Trong `scheduleHumanTimeoutStep`: lấy mục tiêu AFK là `activeDebtor` thay vì hardcode `currentPlayerIndex`, tránh AFK Catatonic Deadlock (ADV-01).
4. [`tests/contracts/imp285_sequential_turn_closure_guard.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp285_sequential_turn_closure_guard.test.ts) — **NEW (Target 4)**: Contract tests kiểm toán toàn diện.
5. **Bảo toàn môi trường làm việc & baseline trước đó**:
   - `src/server/intent_dispatcher.ts`
   - `src/server/security/intent_guard.ts`
   - `src/server/network/afk_recovery.ts`
   - `src/server/p2p_trade_actions.ts`
   - `src/server/delta_mapper.ts`
   - `src/server/delta_types.ts`
   - `src/domain/room.ts`
   - `src/client/network/activity_tracker.ts`
   - `src/client/network/apply_delta.ts`
   - `src/client/ui/floating_numbers.tsx`
   - `tests/contracts/imp278_compact_floating_notifications.test.ts`
   - `tests/contracts/imp281_auto_solvency_semantic_resolution.test.ts`
   - `tests/contracts/imp284_activity_feed_causal_ordering.test.ts`
   - `tests/contracts/imp286_p2p_trade_delta_broadcast.test.ts`

---

## 1. BẢN THIẾT KẾ KIẾN TRÚC & BẤT BIẾN NGHIỆP VỤ (ARCHITECTURAL INVARIANTS)

### 1.1 Khóa Chuyển Lượt Khi Có Nợ Treo (Zero-Overrun Turn Closure Invariant)
* **Bất biến**:
  $$\forall \text{TurnHandover}, \quad \text{CanEndTurn} \iff \forall p \in \text{room.players}, \ (p.\text{bankrupt} \lor p.\text{balance} \ge 0)$$
  Hàm `executeTurnEnd` BẮT BUỘC trả về `undefined` nếu có bất kỳ người chơi nào chưa phá sản mà có `balance < 0`.

### 1.2 Hàng Đợi Con Nợ Tuần Tự & Phục Hồi Pha (Debtor Queue & Phase Recovery Invariant)
* **Bất biến (ADV-04 & ADV-05)**:
  - Khi nhiều người chơi cùng âm tiền, hệ thống xếp hàng vào `room.pendingInsolvencyQueue`.
  - Khi một con nợ ngoài lượt phá sản hoặc cân đối xong số dư $\ge 0$, FSM lấy con nợ tiếp theo trong hàng đợi. Nếu hàng đợi rỗng và không còn ai âm tiền, `room.phase` bắt buộc được trả về `TurnPhase.PropertyManagement`.

### 1.3 Nhịp Trình Diễn Đóng Băng Bot & Điều Hướng AFK (Bot Pacing Suspension & Debtor AFK Invariant)
* **Bất biến (ADV-01)**:
  - Trong `InsolvencyPhase`, logic timeout `scheduleHumanTimeoutStep` nhắm vào Con Nợ (`activeDebtor`), không nhắm vào người cầm xúc xắc (`currentPlayerIndex`).
  - Nếu con nợ là người thật, Bot Pacing đóng băng hoàn toàn, bảo đảm con nợ có 45s để xử lý hoặc tự động AFK recovery nếu hết giờ.

---

## 2. THIẾT KẾ KIỂM THỬ HỢP ĐỒNG (STATION 1 CONTRACT TEST SPECIFICATIONS)
* **Target physical file**: `tests/contracts/imp285_sequential_turn_closure_guard.test.ts` (New file in Station 1/2)

* TC-285.01 [UC-IMP285/MSS]: Given người chơi ngoài lượt bị thâm hụt số dư âm, When gọi checkInsolvency kèm debtorId, Then room.pendingInsolvencyDebtorId được gán đúng và room.phase chuyển sang InsolvencyPhase.
* TC-285.02 [UC-IMP285/MSS]: Given trên bàn chơi có bất kỳ người chơi nào có balance < 0, When gọi executeTurnEnd, Then hàm trả về undefined và không cho phép chuyển lượt.
* TC-285.03 [UC-IMP285/MSS]: Given toàn bộ người chơi còn sống đều có balance >= 0, When gọi executeTurnEnd hợp lệ, Then hàm trả về Room hợp lệ và chuyển lượt thành công.
* TC-285.04 [UC-IMP285/MSS]: Given bot tiếp đất ô sự kiện rút thẻ phạt khiến đối thủ ngoài lượt âm tiền trong executeTurnRoll, When giải quyết xong bước nhảy, Then room.phase tự động chuyển thành InsolvencyPhase và debtor được đưa vào hàng đợi.
* TC-285.05 [UC-IMP285/MSS]: Given room đang ở InsolvencyPhase với con nợ là người thật còn người giữ lượt là Bot, When TurnOrchestrator điều phối nhịp độ lượt chơi, Then hệ thống cấp timeout 45s cho người thật và bot không được thực thi bước đi.
* TC-285.06 [UC-IMP285/MSS]: Given con nợ ngoài lượt là người thật bị AFK trong lượt của Bot, When hết hạn timeout 45s trong TurnOrchestrator, Then hệ thống thực thi AFK recovery đúng trên con nợ người thật thay vì return sớm (khắc phục ADV-01).
* TC-285.07 [UC-IMP285/MSS]: Given con nợ ngoài lượt tuyên bố phá sản bankrupt true, When declareBankruptcy hoàn tất, Then room.phase được phục hồi về PropertyManagement và người cầm lượt kết thúc lượt thành công (khắc phục ADV-04).
* TC-285.08 [UC-IMP285/MSS]: Given nhiều người chơi cùng bị âm tiền từ một sự kiện thẻ phạt, When khởi tạo xử lý nợ, Then pendingInsolvencyQueue lưu trữ đầy đủ danh sách con nợ và xử lý tuần tự (khắc phục ADV-05).

---

## 3. QUY TRÌNH CHỐT CHẶN CƠ HỌC & NGHIỆM THU
1. **Kiểm tra Plan tự động**: `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_285_SEQUENTIAL_STEP_AND_TURN_CLOSURE_GUARD.md --auto-sign`
2. **Trạm 1 (RED)**: Tạo contract test `tests/contracts/imp285_sequential_turn_closure_guard.test.ts` chứng minh fail vì runtime assertions (`executeTurnEnd` hiện tại vẫn cho chuyển lượt khi có người âm tiền).
3. **Trạm 2 (GREEN)**: Cập nhật `turn_loop.ts`, `insolvency_manager.ts`, `turn_orchestrator.ts` làm xanh 100% tests.
4. **Chốt chặn Fast Pre-Filter & Scope**:
   - `npm run prefilter -- src/server/turn_loop.ts src/server/insolvency_manager.ts src/server/network/turn_orchestrator.ts tests/contracts/imp285_sequential_turn_closure_guard.test.ts`
   - `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_285_SEQUENTIAL_STEP_AND_TURN_CLOSURE_GUARD.md`
5. **Kiểm toán Bằng chứng vật lý**:
   - `npm run report -- IMP-285`
   - `node scripts/check_evidence.mjs IMP-285`
