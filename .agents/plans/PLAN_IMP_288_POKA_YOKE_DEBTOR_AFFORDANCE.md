# KẾ HOẠCH TRIỂN KHAI MICRO-SLICE (LEAN PLAN SPECIFICATION)
# TICKET: IMP-288 — Poka-Yoke Debtor Insolvency Banner & Out-of-Turn Action Dock Affordance

> **Mã Nhiệm Vụ:** IMP-288 (Poka-Yoke Debtor Insolvency Banner & Action Dock Affordance)  
> **Phân hệ mục tiêu:** `client-ui` & `client-network`  
> **Phân loại rủi ro:** Tier 1 Micro-Slice (Lean Plan Specification, <= 180 lines, Delta <= 30 LOC, 3 files in `src/client/`)  
> **Chỉ tiêu kiểm thử:** Scaled Floor >= 8 atomic tests, Pure Logic Waiver = `false` (Dual-Viewport visual & state affordances)  

---

## 0. KHẢO SÁT BỀ MẶT MÃ NGUỒN & ĐIỂM BẮT ĐẦU (SURFACE INVENTORY & LOC BASELINE)

### 0.1 Danh Sách Tệp Mục Tiêu & Dòng Mã Thực Tế Trên Đĩa
* **Target physical file**: `src/client/network/apply_delta.ts` (376 lines, Tier 1 limit: 400 lines) — **Safe**.
* **Target physical file**: `src/client/ui/action_dock.tsx` (385 lines, Tier 2 limit: 500 lines) — **Safe**.
* **Target physical file**: `src/client/network/use_app_session.ts` (280 lines, Tier 1 limit: 400 lines) — **Safe**.
* **Target physical file**: `tests/contracts/imp288_poka_yoke_debtor_affordance.test.ts` (New file in Station 1/2, Living Test limit: 600 lines) — **Safe**.

### 0.2 Bảng Thống Kê Delta LOC Dự Kiến
| File | Tier | Current LOC | Expected LOC | Delta LOC | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `src/client/network/apply_delta.ts` | Tier 1 (Client Net) | 376 | 379 | +3 lines | Safe (<= 400) |
| `src/client/ui/action_dock.tsx` | Tier 2 (UI Views) | 385 | 399 | +14 lines | Safe (<= 500) |
| `src/client/network/use_app_session.ts` | Tier 1 (Client Net) | 280 | 281 | +1 line | Safe (<= 400) |
| `tests/contracts/imp288_poka_yoke_debtor_affordance.test.ts` | Living Test | 0 | ~180 | +180 lines | Safe (<= 600) |
| **Tổng Delta Production (`src/**`)** | — | — | — | **+18 net LOC** (<= 50 LOC) | **Pass Micro-Slice** |

### 0.3 Phân Định Phạm Vi & Ranh Giới Phân Hệ (Scope Conservation Mandate)
1. [`src/client/network/apply_delta.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/apply_delta.ts) — **MODIFY (Target 1)**:
   - Trong `syncOtherModals`: Khi `state.activeModal === 'insolvency'`, lấy ID con nợ từ `useLobbyStore.getState().myPlayerId` kết hợp fallback từ modal payload. Nếu người chơi cục bộ vẫn đang âm tiền (`balance < 0` và `!bankrupt`), TUYỆT ĐỐI KHÔNG đóng modal `insolvency` dù `delta.turnPhase` khác `InsolvencyPhase`.
2. [`src/client/ui/action_dock.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/action_dock.tsx) — **MODIFY (Target 2)**:
   - Trong `isStandingOnBuyable`: bổ sung điều kiện `!isInsolvent` để chặn hiển thị gợi ý mua đất khi đang vỡ nợ.
   - Tại nút tác vụ chính (Primary Action Button): Ràng buộc biến `isDebtorAlertActive` chặt chẽ: `Boolean(actingPlayer && !actingPlayer.isBot && actingPlayer.balance < 0 && !actingPlayer.bankrupt && (!localPlayerId || actingPlayerId === localPlayerId))`.
   - Khi `isDebtorAlertActive` là true, hiển thị nút cảnh báo nổi bật: 🚨 **Cứu Nợ Khẩn Cấp** (với hiệu ứng pulse viền đỏ). Khi bấm vào, kích hoạt `openModal('insolvency', { playerId: actingPlayerId, deficit: actingPlayer ? Math.max(0, -actingPlayer.balance) : 0 })` bảo đảm an toàn null-pointer và điểm neo cứu nguy cho con nợ kể cả khi ngoài lượt.
3. [`src/client/network/use_app_session.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/use_app_session.ts) — **MODIFY (Target 3)**:
   - Tại dòng 136: Bổ sung `&& currentModal !== 'portfolio'` vào điều kiện mở modal nợ tự động, ngăn chặn việc delta định kỳ đè modal `insolvency` đá văng người chơi khi họ đang chủ động thao tác cắm cọc trong Portfolio.
4. [`tests/contracts/imp288_poka_yoke_debtor_affordance.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp288_poka_yoke_debtor_affordance.test.ts) — **NEW (Target 4)**: Contract tests kiểm toán toàn diện.
5. **Bảo toàn môi trường làm việc & baseline trước đó**:
   - `src/client/network/activity_financial_tracker.ts`
   - `src/client/network/activity_property_tracker.ts`
   - `src/client/network/activity_tracker.ts`
   - `src/client/ui/floating_numbers.tsx`
   - `src/domain/room.ts`
   - `src/server/delta_mapper.ts`
   - `src/server/delta_types.ts`
   - `src/server/insolvency_manager.ts`
   - `src/server/intent_dispatcher.ts`
   - `src/server/mortgage_manager.ts`
   - `src/server/network/turn_orchestrator.ts`
   - `src/server/p2p_trade_actions.ts`
   - `src/server/security/intent_guard.ts`
   - `src/server/turn_loop.ts`
   - `tests/client/ui_linter.test.ts`
   - `tests/contracts/imp278_compact_floating_notifications.test.ts`
   - `tests/contracts/imp284_activity_feed_causal_ordering.test.ts`
   - `tests/contracts/imp285_sequential_turn_closure_guard.test.ts`
   - `tests/contracts/imp286_p2p_trade_delta_broadcast.test.ts`
   - `tests/contracts/imp287_out_of_turn_debtor_intent_whitelist.test.ts`
   - `tests/contracts/imp287_p2p_trade_activity_feed.test.ts`

---

## 1. MỤC TIÊU KỸ THUẬT & BẤT BIẾN NGHIỆP VỤ (SSOT)
1. **[BR-01 / Persistent Insolvency Banner Preservation]**: Trong `apply_delta.ts`, khi nhận delta mới có `turnPhase` khác `InsolvencyPhase`, modal `insolvency` chỉ được đóng nếu người chơi cục bộ (`useLobbyStore.getState().myPlayerId`) đã thoát nợ (`balance >= 0`) hoặc đã phá sản (`bankrupt: true`).
2. **[BR-02 / Primary Action Dock Urgent Recovery Button]**: Trong `action_dock.tsx`, khi con nợ người thật âm tiền (`isDebtorAlertActive`), nút tác vụ chính chuyển thành `data-testid="resolve-debt-primary-btn"` với icon 🚨 và nhãn "Cứu Nợ Khẩn Cấp", click vào sẽ gọi mở modal `insolvency` an toàn null-pointer.
3. **[BR-03 / Buy Suppression On Insolvency]**: Khi người chơi âm tiền (`isInsolvent`), `isStandingOnBuyable` trả về false, ngăn chặn việc gợi ý mua đất khi đang thâm hụt.
4. **[BR-04 / Bot and Spectator Isolation]**: Khi con nợ âm tiền là Bot hoặc người chơi đang ở chế độ xem, ActionDock tuyệt đối KHÔNG hiển thị nút `resolve-debt-primary-btn` thay cho Bot.
5. **[BR-05 / Portfolio Kickout Prevention]**: Trong `use_app_session.ts`, delta không được tự động đè modal `insolvency` khi người chơi đang chủ động mở modal `portfolio`.

---

## 2. KẾ HOẠCH TEST CASE CHI TIẾT (STATION 1 SPECIFICATION)
* **TC-288.01 [UC-IMP288/MSS]**: Given người chơi cục bộ có số dư âm (`balance = -500`) và `activeModal === 'insolvency'`, When `applyDelta` nhận delta có `turnPhase = WaitingRoll`, Then `activeModal` vẫn giữ nguyên là `'insolvency'`.
* **TC-288.02 [UC-IMP288/MSS]**: Given người chơi cục bộ có số dư dương (`balance = 200`) và `activeModal === 'insolvency'`, When `applyDelta` nhận delta có `turnPhase = PropertyManagement`, Then `activeModal` được đóng (`activeModal === null`).
* **TC-288.03 [UC-IMP288/MSS]**: Given người chơi có `balance = -300` và `isBankrupt = false`, When render `ActionDock`, Then nút có `data-testid="resolve-debt-primary-btn"` xuất hiện với nhãn "Cứu Nợ Khẩn Cấp".
* **TC-288.04 [UC-IMP288/MSS]**: Given người chơi có `balance = -300`, When click nút `resolve-debt-primary-btn`, Then modal insolvency hiển thị với deficit là 300.
* **TC-288.05 [UC-IMP288/MSS]**: Given người chơi có `balance = -300` và đứng ở ô đất chưa có chủ, When render `ActionDock`, Then `isStandingOnBuyable` là false và không hiển thị nút "Mua Đất".
* **TC-288.06 [UC-IMP288/MSS]**: Given người chơi có `balance = -300` và `isMyTurn = false`, When render `ActionDock`, Then nút `resolve-debt-primary-btn` vẫn hiển thị cho phép cứu nợ ngoài lượt.
* **TC-288.07 [UC-IMP288/MSS]**: Given người chơi âm tiền là Bot (`isBot = true`), When render `ActionDock`, Then không hiển thị nút `resolve-debt-primary-btn`.
* **TC-288.08 [UC-IMP288/MSS]**: Given người chơi đang mở modal portfolio (`activeModal === 'portfolio'`) và bị âm tiền, When kiểm tra `shouldAutoOpenInsolvencyModal`, Then trả về false.
* **TC-288.09 [UC-IMP288/MSS]**: Given người chơi đã ở trong modal insolvency (`activeModal === 'insolvency'`) và bị âm tiền, When kiểm tra `shouldAutoOpenInsolvencyModal`, Then trả về false.
* **TC-288.10 [UC-IMP288/MSS]**: Given ván đấu kết thúc (`activeModal === 'game_over'`) và người chơi bị âm tiền, When kiểm tra `shouldAutoOpenInsolvencyModal`, Then trả về false.
* **TC-288.11 [UC-IMP288/MSS]**: Given người chơi đã phá sản (`isBankrupt === true`) và bị âm tiền, When kiểm tra `shouldAutoOpenInsolvencyModal`, Then trả về false.
* **TC-288.12 [UC-IMP288/MSS]**: Given người chơi không mở modal nào và bị âm tiền không phá sản, When kiểm tra `shouldAutoOpenInsolvencyModal`, Then trả về true.
