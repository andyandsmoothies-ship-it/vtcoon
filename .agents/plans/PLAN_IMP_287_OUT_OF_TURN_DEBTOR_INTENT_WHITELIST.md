# KẾ HOẠCH TRIỂN KHAI MICRO-SLICE (LEAN PLAN SPECIFICATION)
# TICKET: IMP-287 — Mở Khóa Quyền Giải Quyết Nợ Cho Con Nợ Ngoài Lượt (Out-of-Turn Debtor Intent Whitelist)

> **Mã Nhiệm Vụ:** IMP-287 (Out-of-Turn Debtor Intent Whitelist)  
> **Phân hệ mục tiêu:** `server-security` & `server-network`  
> **Phân loại rủi ro:** Tier 1 Micro-Slice (Lean Plan Specification, <= 180 lines, Delta <= 35 LOC, 3 files in `src/server/`)  
> **Chỉ tiêu kiểm thử:** Scaled Floor >= 8 atomic tests, Pure Logic Waiver = `true` (Non-visual backend server security and network intent logic)  

---

## 0. KHẢO SÁT BỀ MẶT MÃ NGUỒN & ĐIỂM BẮT ĐẦU (SURFACE INVENTORY & LOC BASELINE)

### 0.1 Danh Sách Tệp Mục Tiêu & Dòng Mã Thực Tế Trên Đĩa
* **Target physical file**: `src/server/security/intent_guard.ts` (77 lines, Tier 1 limit: 400 lines) — **Safe**.
* **Target physical file**: `src/server/intent_dispatcher.ts` (195 lines, Tier 1 limit: 400 lines) — **Safe**.
* **Target physical file**: `src/server/mortgage_manager.ts` (265 lines, Tier 1 limit: 400 lines) — **Safe**.
* **Target physical file**: `tests/contracts/imp287_out_of_turn_debtor_intent_whitelist.test.ts` (New file in Station 1/2, Living Test limit: 600 lines) — **Safe**.

### 0.2 Bảng Thống Kê Delta LOC Dự Kiến
| File | Tier | Current LOC | Expected LOC | Delta LOC | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `src/server/security/intent_guard.ts` | Tier 1 (Server Sec) | 77 | 95 | +18 lines | Safe (<= 400) |
| `src/server/intent_dispatcher.ts` | Tier 1 (Server Net) | 195 | 215 | +20 lines | Safe (<= 400) |
| `src/server/mortgage_manager.ts` | Tier 1 (Domain FSM) | 265 | 275 | +10 lines | Safe (<= 400) |
| `tests/contracts/imp287_out_of_turn_debtor_intent_whitelist.test.ts` | Living Test | 0 | ~180 | +180 lines | Safe (<= 600) |
| **Tổng Delta Production (`src/**`)** | — | — | — | **+48 net LOC** (<= 50 LOC) | **Pass Micro-Slice** |

### 0.3 Phân Định Phạm Vi & Ranh Giới Phân Hệ (Scope Conservation Mandate)
1. [`src/server/security/intent_guard.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/security/intent_guard.ts) — **MODIFY (Target 1)**: 
   - Trong `isPhaseSpecificAllowed`: Khi `room.phase === TurnPhase.InsolvencyPhase`, nếu `playerId` là con nợ (`room.pendingInsolvencyDebtorId ? room.pendingInsolvencyDebtorId === playerId : room.players[room.currentPlayerIndex]?.id === playerId`), cho phép các intent: `INTENT_AUTO_SOLVENCY`, `INTENT_MORTGAGE`, `INTENT_DOWNGRADE`, `INTENT_ISSUE_BOND`, `INTENT_BANKRUPTCY`.
   - Chặn người chơi khác ngoài lượt không phải con nợ với mã lỗi `OUT_OF_TURN`.
2. [`src/server/intent_dispatcher.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/intent_dispatcher.ts) — **MODIFY (Target 2)**: 
   - Trong `dispatchPlayerIntent`: khi `room.phase === TurnPhase.InsolvencyPhase`, chỉ từ chối `NOT_YOUR_TURN` nếu người gửi KHÔNG PHẢI là con nợ `isDebtor`.
   - Trong `INTENT_AUTO_SOLVENCY`: kiểm tra con nợ `isDebtor` và `player.balance < 0` thay vì kiểm tra `room.players[room.currentPlayerIndex]`.
   - Trong `INTENT_DOWNGRADE`: khi `room.phase === TurnPhase.InsolvencyPhase` và con nợ là `p`, lấy trực tiếp `player` từ room để cho phép con nợ ngoài lượt bán nhà thu hồi vốn.
3. [`src/server/mortgage_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/mortgage_manager.ts) — **MODIFY (Target 3)**: 
   - Trong `checkMortgageRoomState`: Cho phép cắm cọc nếu `isCurrentPlayer(room, playerId)` HOẶC `(room.phase === TurnPhase.InsolvencyPhase && (room.pendingInsolvencyDebtorId ? room.pendingInsolvencyDebtorId === playerId : isCurrentPlayer(room, playerId)))`.
   - Chặn người chơi khác ngoài lượt không nợ cắm cọc với lý do `NOT_YOUR_TURN`.
4. [`tests/contracts/imp287_out_of_turn_debtor_intent_whitelist.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp287_out_of_turn_debtor_intent_whitelist.test.ts) — **NEW (Target 4)**: Contract tests kiểm toán toàn diện.
5. **Bảo toàn môi trường làm việc & baseline trước đó**:
   - `src/client/network/activity_property_tracker.ts`
   - `src/client/network/activity_tracker.ts`
   - `src/client/ui/floating_numbers.tsx`
   - `src/domain/room.ts`
   - `src/server/delta_mapper.ts`
   - `src/server/delta_types.ts`
   - `src/server/insolvency_manager.ts`
   - `src/server/network/turn_orchestrator.ts`
   - `src/server/p2p_trade_actions.ts`
   - `src/server/turn_loop.ts`
   - `tests/client/ui_linter.test.ts`
   - `tests/contracts/imp278_compact_floating_notifications.test.ts`
   - `tests/contracts/imp284_activity_feed_causal_ordering.test.ts`
   - `tests/contracts/imp285_sequential_turn_closure_guard.test.ts`
   - `tests/contracts/imp286_p2p_trade_delta_broadcast.test.ts`
   - `tests/contracts/imp287_p2p_trade_activity_feed.test.ts`

---

## 1. MỤC TIÊU KỸ THUẬT & BẤT BIẾN NGHIỆP VỤ (SSOT)
1. **[BR-01 / Intent Guard Debtor Whitelist]**: Trong `InsolvencyPhase`, nếu `playerId` là con nợ (`room.pendingInsolvencyDebtorId ? room.pendingInsolvencyDebtorId === playerId : room.players[room.currentPlayerIndex]?.id === playerId`), `IntentGuard.validate` cho phép các intent: `INTENT_AUTO_SOLVENCY`, `INTENT_MORTGAGE`, `INTENT_DOWNGRADE`, `INTENT_ISSUE_BOND`, `INTENT_BANKRUPTCY`.
2. **[BR-02 / Intent Guard Non-Debtor Defense]**: Trong `InsolvencyPhase`, người chơi khác ngoài lượt không phải con nợ bị từ chối với lý do `OUT_OF_TURN`.
3. **[BR-03 / Dispatcher Insolvency Phase Whitelist]**: Trong `dispatchPlayerIntent`, khi `room.phase === TurnPhase.InsolvencyPhase`, chỉ từ chối `NOT_YOUR_TURN` nếu người gửi không phải con nợ `isDebtor`.
4. **[BR-04 / Auto-Solvency Out-of-Turn Debtor Resolution]**: Trong `INTENT_AUTO_SOLVENCY`, kiểm tra con nợ `isDebtor` thay vì `room.currentPlayerIndex`.
5. **[BR-05 / Downgrade Out-of-Turn Debtor Resolution]**: Trong `INTENT_DOWNGRADE`, khi `room.phase === TurnPhase.InsolvencyPhase` và con nợ là `p`, lấy trực tiếp `player` từ phòng để hạ cấp công trình.
6. **[BR-06 / Mortgage Out-of-Turn Debtor Resolution]**: Trong `checkMortgageRoomState` (`mortgage_manager.ts`), cho phép con nợ trong `InsolvencyPhase` cắm cọc tài sản (`isDebtorInInsolvency`) dù không cầm lượt.
7. **[BR-07 / Non-Debtor Out-of-Turn Mortgage Rejection]**: Người chơi khác ngoài lượt không phải con nợ cắm cọc vẫn bị từ chối với lý do `NOT_YOUR_TURN`.
8. **[BR-08 / Solvency Recovery Auto-Close Phase]**: Khi con nợ cắm cọc hoặc hạ cấp thành công đưa số dư `>= 0`, hệ thống xóa `pendingInsolvencyDebtorId`, `pendingInsolvencyCreditorId` và khôi phục phase về `PropertyManagement`.

---

## 2. DANH SÁCH CA KIỂM THỬ HỢP ĐỒNG (STATION 1 CONTRACT TESTS)
- **TC-287.01 [UC-IMP287/MSS]**: Given phòng ở InsolvencyPhase và con nợ ngoài lượt được gán tại pendingInsolvencyDebtorId, When IntentGuard validate INTENT_AUTO_SOLVENCY của con nợ ngoài lượt, Then kết quả allowed là true.
- **TC-287.02 [UC-IMP287/MSS]**: Given phòng ở InsolvencyPhase và con nợ ngoài lượt được gán tại pendingInsolvencyDebtorId, When IntentGuard validate INTENT_MORTGAGE của con nợ ngoài lượt, Then kết quả allowed là true.
- **TC-287.03 [UC-IMP287/MSS]**: Given phòng ở InsolvencyPhase, When IntentGuard validate INTENT_AUTO_SOLVENCY của người chơi khác không nợ và ngoài lượt, Then kết quả allowed là false với reasonCode OUT_OF_TURN.
- **TC-287.04 [UC-IMP287/MSS]**: Given phòng ở InsolvencyPhase với con nợ ngoài lượt, When dispatchPlayerIntent gửi INTENT_AUTO_SOLVENCY cho con nợ ngoài lượt, Then lệnh không bị chặn NOT_YOUR_TURN và xử lý giải cứu thành công.
- **TC-287.05 [UC-IMP287/MSS]**: Given phòng ở InsolvencyPhase với con nợ ngoài lượt có nhà cấp 2, When dispatchPlayerIntent gửi INTENT_DOWNGRADE cho con nợ ngoài lượt, Then hạ cấp thành công và số dư được hoàn lại.
- **TC-287.06 [UC-IMP287/MSS]**: Given phòng ở InsolvencyPhase với con nợ ngoài lượt sở hữu đất chưa cắm cọc, When dispatchPlayerIntent gửi INTENT_MORTGAGE cho con nợ ngoài lượt, Then cắm cọc thành công và nhận tiền vay.
- **TC-287.07 [UC-IMP287/MSS]**: Given phòng ở InsolvencyPhase với con nợ ngoài lượt, When người chơi khác ngoài lượt không nợ gửi INTENT_MORTGAGE, Then bị từ chối với reason NOT_YOUR_TURN.
- **TC-287.08 [UC-IMP287/MSS]**: Given con nợ ngoài lượt sau khi cắm cọc có số dư balance >= 0, When hoàn tất xử lý cắm cọc, Then pendingInsolvencyDebtorId được xóa và room.phase phục hồi về PropertyManagement.
