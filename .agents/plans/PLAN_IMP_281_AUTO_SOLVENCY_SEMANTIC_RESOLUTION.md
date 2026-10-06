# KẾ HOẠCH TRIỂN KHAI MICRO-SLICE (LEAN PLAN SPECIFICATION)
# TICKET: IMP-281 — Chuẩn Hóa Phản Hồi Ngữ Nghĩa INTENT_AUTO_SOLVENCY & Đồng Bộ Phá Sản (Auto-Solvency Semantic Resolution & Post-Insolvency Sync)

> **Mã Nhiệm Vụ:** IMP-281 (Auto-Solvency Semantic Resolution & Post-Insolvency Sync)  
> **Phân hệ mục tiêu:** `server-network`  
> **Phân loại rủi ro:** Tier 1 Micro-Slice (Lean Plan Specification, <= 180 lines, Delta <= 30 LOC, 1 file in `src/**`)  
> **Chỉ tiêu kiểm thử:** Scaled Floor >= 8 atomic tests, Pure Logic Waiver = `true` (Non-visual backend server logic)

---

## 0. KHẢO SÁT BỀ MẶT MÃ NGUỒN & ĐIỂM BẮT ĐẦU (SURFACE INVENTORY & LOC BASELINE)

### 0.1 Danh Sách Tệp Mục Tiêu & Dòng Mã Thực Tế Trên Đĩa
* **Target physical file**: `src/server/intent_dispatcher.ts` (192 lines, Tier 1 limit: 400 lines) — **Safe**.
* **Target physical file**: `tests/contracts/imp210_auto_solvency_intent.test.ts` (437 lines, Living Test limit: 600 lines) — **Safe**.
* **Target physical file**: `tests/contracts/imp281_auto_solvency_semantic_resolution.test.ts` (New file in Station 1/2) — **Safe**.

### 0.2 Bảng Thống Kê Delta LOC Dự Kiến
| File | Tier | Current LOC | Expected LOC | Delta LOC | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `src/server/intent_dispatcher.ts` | Tier 1 (Server) | 192 | ~195 | +3 lines | Safe |
| `tests/contracts/imp210_auto_solvency_intent.test.ts` | Living Test | 437 | 437 | ~2 lines | Safe |
| `tests/contracts/imp281_auto_solvency_semantic_resolution.test.ts` | Living Test | 0 | ~150 | +150 lines | Safe |
| **Tổng Delta Production (`src/**`)** | — | — | — | **+3 net LOC** (<= 50 LOC) | **Pass Micro-Slice** |

### 0.3 Phân Định Phạm Vi & Ranh Giới Phân Hệ (Scope Conservation Mandate)
1. [`src/server/intent_dispatcher.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/intent_dispatcher.ts) — **MODIFY (Target 1)**: Chuẩn hóa phản hồi `INTENT_AUTO_SOLVENCY`, trả về `{ success: true }` khi thanh lý dẫn đến phá sản hợp lệ (thay vì `{ success: false, reason: 'BANKRUPT' }`).
2. [`tests/contracts/imp210_auto_solvency_intent.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp210_auto_solvency_intent.test.ts) — **MODIFY (Target 2)**: Cập nhật TC-210.13 để đồng bộ với hợp đồng ngữ nghĩa mới (`res.success === true` khi phá sản).
3. [`tests/contracts/imp281_auto_solvency_semantic_resolution.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp281_auto_solvency_semantic_resolution.test.ts) — **NEW (Target 3)**: Contract tests kiểm toán toàn diện tính ngữ nghĩa và chuyển trạng thái đồng bộ sau phá sản.
4. **Bảo toàn môi trường làm việc & baseline trước đó**:
   - `src/server/network/afk_recovery.ts`
   - `src/server/network/wss_intent_handler.ts`
   - `src/client/ui/modals/bot_trade_offer_strip.tsx`
   - `src/client/ui/modals/bot_trade_offer_modal.tsx`
   - `src/client/ui/actionable_notification.ts`
   - `src/client/ui/floating_numbers.tsx`
   - `tests/contracts/imp278_compact_floating_notifications.test.ts`
   - `tests/contracts/imp280_trade_offer_dual_dispatch_guard.test.ts`

---

## 1. BẢN THIẾT KẾ KIẾN TRÚC & BẤT BIẾN NGHIỆP VỤ (ARCHITECTURAL INVARIANTS)

### 1.1 Chuẩn Hóa Ngữ Nghĩa Giải Quyết Thanh Khoản Tự Động (Semantic Solvency Resolution)
* **Hiện trạng lỗi**: Khi `executeInsolvencyAfkRecovery(m, rc, p)` hoàn tất thanh lý tài sản nhưng vẫn thâm hụt, hàm này đã thực thi `INTENT_BANKRUPTCY` hợp lệ đưa người chơi vào trạng thái phá sản (`player.bankrupt = true`). Tuy nhiên, `intent_dispatcher.ts` lại trả về `{ success: res.rescued, reason: res.bankrupt ? 'BANKRUPT' : ... }` khiến `success: false`.
* **Hậu quả**:
  - `wss_intent_handler.ts` coi đây là hành vi bị từ chối/lỗi, gửi `{ type: 'ERROR', reasonCode: 'BANKRUPT' }` về client.
  - Client hiện toast lỗi vô căn cứ `(BANKRUPT)`.
  - `wss_intent_handler.ts` return sớm, bỏ qua `syncRoomAfterIntent`, làm mất nhịp kiểm tra kết thúc ván đấu hoặc kích hoạt bot tiếp theo.
* **Giải pháp chuẩn hóa**:
  ```typescript
  INTENT_AUTO_SOLVENCY: (m, rc, p) => {
    const room = m.getRoom(rc);
    if (!room || room.phase !== TurnPhase.InsolvencyPhase) {
      return { success: false, reason: 'INVALID_PHASE' };
    }
    const current = room.players[room.currentPlayerIndex];
    if (!current || current.id !== p || current.balance >= 0) {
      return { success: false, reason: ActionRejectReason.NOT_YOUR_TURN };
    }
    const res = executeInsolvencyAfkRecovery(m, rc, p);
    if (res.rescued || res.bankrupt) {
      return { success: true };
    }
    return { success: false, reason: ActionRejectReason.CANNOT_RECOVER };
  },
  ```

### 1.2 Bất Biến Miền (Domain Invariants)
* **Bất biến 1 (Resolution Finality)**: Mọi quy trình giải cứu thanh khoản tự động kết thúc bằng cứu nguy (`rescued`) hoặc phá sản (`bankrupt`) đều là kết quả giải quyết thành công của Intent (`success: true`), không bao giờ bị coi là `ACTION_REJECTED`.
* **Bất biến 2 (Post-Insolvency Sync Invariant)**: Khi người chơi phá sản qua Auto-Solvency, `wss_intent_handler` tiếp tục thực thi `syncRoomAfterIntent`, kích hoạt kiểm tra `isRoomGameOver` hoặc `scheduleBotTurn` tức thì, triệt tiêu hoàn toàn hiện tượng nghẽn lượt hoặc zombie HUD.
* **Bất biến 3 (Strict Phase & Turn Guard)**: Vẫn chặn đứng các yêu cầu sai lượt hoặc sai phase với `ActionRejectReason.NOT_YOUR_TURN` hoặc `'INVALID_PHASE'`.

---

## 2. NHIỆM VỤ THỰC THI CHI TIẾT (EXACT IMPLEMENTATION TASKS)

### Task 1: Chuẩn Hóa Trả Về Của INTENT_AUTO_SOLVENCY
* **Target physical file**: `src/server/intent_dispatcher.ts`
* **Hành động cụ thể**:
  - Tại handler `INTENT_AUTO_SOLVENCY`: Nếu `res.rescued || res.bankrupt`, trả về `{ success: true }`.
  - Nếu không (`!res.rescued && !res.bankrupt`), trả về `{ success: false, reason: ActionRejectReason.CANNOT_RECOVER }`.

### Task 2: Cập Nhật Contract Test Bộ Cũ (IMP-210 Case 13)
* **Target physical file**: `tests/contracts/imp210_auto_solvency_intent.test.ts`
* **Hành động cụ thể**:
  - Tại test case số 13 trong Facet 5: Cập nhật kỳ vọng `expect(res.success).toBe(true)` và kiểm tra `expect(alpha.bankrupt).toBe(true)`.

---

## 3. THIẾT KẾ KIỂM THỬ HỢP ĐỒNG (STATION 1 CONTRACT TEST SPECIFICATIONS)
* **Target physical file**: `tests/contracts/imp281_auto_solvency_semantic_resolution.test.ts` (New file in Station 1/2)

* TC-281.01 [UC-IMP281/MSS]: Given người chơi âm tiền có nhà phố, When dispatch INTENT_AUTO_SOLVENCY cứu nguy thành công, Then trả về `{ success: true }` và số dư >= 0.
* TC-281.02 [UC-IMP281/MSS]: Given người chơi âm tiền không đủ tài sản cứu nguy, When dispatch INTENT_AUTO_SOLVENCY, Then trả về `{ success: true }` (không phải false) và người chơi bị đánh dấu phá sản (`bankrupt: true`).
* TC-281.03 [UC-IMP281/MSS]: Given người chơi phá sản qua INTENT_AUTO_SOLVENCY, When kết quả dispatch được xử lý bởi WssServer, Then socket KHÔNG nhận bất kỳ gói tin nào có `reasonCode: 'BANKRUPT'`.
* TC-281.04 [UC-IMP281/MSS]: Given ván chơi 2 người trong đó người thứ nhất phá sản qua INTENT_AUTO_SOLVENCY, When intent xử lý xong, Then phòng chơi lập tức kết thúc (`isGameOver: true`) và phát sóng Game Over.
* TC-281.05 [UC-IMP281/MSS]: Given ván chơi 3 người trong đó người phá sản xong tới lượt Bot, When intent xử lý xong, Then hệ thống tự động lên lịch lượt đi cho Bot (`scheduleBotTurn`).
* TC-281.06 [UC-IMP281/MSS]: Given phòng chơi không ở TurnPhase.InsolvencyPhase, When dispatch INTENT_AUTO_SOLVENCY, Then trả về `{ success: false, reason: 'INVALID_PHASE' }`.
* TC-281.07 [UC-IMP281/MSS]: Given người chơi không phải current player, When dispatch INTENT_AUTO_SOLVENCY, Then trả về `{ success: false, reason: NOT_YOUR_TURN }`.
* TC-281.08 [UC-IMP281/MSS]: Given người chơi có số dư dương (>= 0), When dispatch INTENT_AUTO_SOLVENCY, Then trả về `{ success: false, reason: NOT_YOUR_TURN }`.

---

## 4. QUY TRÌNH CHỐT CHẶN CƠ HỌC & NGHIỆM THU
1. **Kiểm tra Plan tự động**: `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_281_AUTO_SOLVENCY_SEMANTIC_RESOLUTION.md --auto-sign`
2. **Trạm 1 (RED)**: Tạo contract test `tests/contracts/imp281_auto_solvency_semantic_resolution.test.ts` chứng minh fail vì runtime assertions (`res.success` hiện tại trả về `false`).
3. **Trạm 2 (GREEN)**: Thực hiện Task 1 và Task 2 làm xanh 100% tests.
4. **Chốt chặn Fast Pre-Filter & Scope**:
   - `npm run prefilter -- src/server/intent_dispatcher.ts tests/contracts/imp210_auto_solvency_intent.test.ts tests/contracts/imp281_auto_solvency_semantic_resolution.test.ts`
   - `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_281_AUTO_SOLVENCY_SEMANTIC_RESOLUTION.md`
5. **Kiểm toán Bằng chứng vật lý**:
   - `npm run report -- IMP-281`
   - `node scripts/check_evidence.mjs IMP-281`
