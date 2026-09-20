# [IMP-133] Kế Hoạch Khắc Phục Lỗi INVALID_PHASE Khi Hết Lượt Tại Trạm Kiểm Toán & Triệt Tiêu Cảnh Báo Sai Telemetry

> **Mã Cải Tiến**: `IMP-133`  
> **Mức Độ**: 🔴 CRITICAL (FSM Server & Telemetry Invariant Watchdog)  
> **Traceability**: `[UC-IMP133]`, `[TC-133.01..TC-133.24]`, Gotcha #174

---

## 1. Mục Tiêu & Phạm Vi
1. Khắc phục dứt điểm lỗi `INVALID_PHASE` khi người chơi tại Ô 10 (Trạm Kiểm Toán) bấm "Hết Lượt" mà không gieo xúc xắc.
2. Thiết lập cơ chế chuyển lượt ưu tiên số 1: Tự động đưa vào `TurnPhase.InsolvencyPhase` khi người chơi bắt đầu lượt với số dư âm.
3. Miễn trừ cảnh báo sai `NEGATIVE_BALANCE_OUTSIDE_INSOLVENCY` cho người chơi bị nợ thụ động ngoài lượt (Passive Debt).

---

## 2. Thiết Kế Kỹ Thuật & Causal Preemption
1. `src/server/turn_loop.ts`:
   - Dòng 174: Cho phép `INTENT_END_TURN` ở `WaitingRoll` khi `(current.auditTurnsLeft ?? 0) > 0`.
   - Dòng 209 & 237: Đặt `balance < 0` làm kiểm tra ưu tiên số 1 khi chuyển lượt và khi xử lý `extraTurns`.
2. `src/client/telemetry/invariant_checker.ts`:
   - Bổ sung `currentTurnPlayerId?: string` vào `verifyNonNegativeBalance` và `verifyAllInvariants`.
   - Miễn trừ người chơi âm tiền khi `currentTurnPlayerId !== p.id`.
3. `src/client/telemetry/telemetry_delta_hook.ts`:
   - Truyền `currentTurnPlayerId: delta.currentTurnPlayerId ?? postState.currentTurnPlayerId`.

---

## 3. Kế Hoạch Kiểm Thử 4 Facets
- Facet 1: Suy giảm 3 lượt án tại Ô 10 khi bấm Hết Lượt, trừ phạt 500 Tr. khi về 0.
- Facet 2: Bảo tồn cơ chế gieo đôi thoát trạm và nộp tiền bảo lãnh 500 Tr.
- Facet 3: Chuyển lượt sang người nợ thụ động tự động kích hoạt `InsolvencyPhase`.
- Facet 4: Bất biến số dư không âm phân biệt chính xác nợ trong lượt vs ngoài lượt.
