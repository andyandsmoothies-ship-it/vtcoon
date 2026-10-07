# KẾ HOẠCH TRIỂN KHAI MICRO-SLICE (LEAN PLAN SPECIFICATION)
# TICKET: IMP-287 — Minh Bạch Tài Chính Nhật Ký Giao Dịch P2P & Hoán Đổi BĐS (Client P2P Trade Activity Feed & Causal Financial Projection)

> **Mã Nhiệm Vụ:** IMP-287 (Client P2P Trade Activity Feed & Causal Financial Projection)  
> **Phân hệ mục tiêu:** `client-state`  
> **Phân loại rủi ro:** Tier 2 Micro-Slice (Lean Plan Specification, <= 180 lines, Delta <= 40 LOC, 3 files in `src/client/network/`)  
> **Chỉ tiêu kiểm thử:** Scaled Floor >= 8 atomic tests, Pure Logic Waiver = `false` (Visual Activity Log Feed & Financial Projection)

---

## 0. KHẢO SÁT BỀ MẶT MÃ NGUỒN & ĐIỂM BẮT ĐẦU (SURFACE INVENTORY & LOC BASELINE)

### 0.1 Danh Sách Tệp Mục Tiêu & Dòng Mã Thực Tế Trên Đĩa
* **Target physical file**: `src/client/network/activity_property_tracker.ts` (254 lines, Tier 1 limit: 400 lines) — **Safe**.
* **Target physical file**: `src/client/network/activity_financial_tracker.ts` (232 lines, Tier 1 limit: 400 lines) — **Safe**.
* **Target physical file**: `src/client/network/activity_tracker.ts` (367 lines, Tier 1 limit: 400 lines) — **Warning (>= 300 LOC, Tech Debt logged)**.
* **Target physical file**: `tests/contracts/imp287_p2p_trade_activity_feed.test.ts` (New file in Station 1/2, Living Test limit: 600 lines) — **Safe**.

### 0.2 Bảng Thống Kê Delta LOC Dự Kiến
| File | Tier | Current LOC | Expected LOC | Delta LOC | Risk / Status | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `src/client/network/activity_property_tracker.ts` | Tier 1 (Client State Tracker) | 254 | 280 | +26 lines | Template Projection | Safe (<= 400) |
| `src/client/network/activity_financial_tracker.ts` | Tier 1 (Client Finance Tracker) | 232 | 236 | +4 lines | Balance Deduplication | Safe (<= 400) |
| `src/client/network/activity_tracker.ts` | Tier 1 (Activity Dispatcher) | 367 | 371 | +4 lines | Ordering Invariant | Warning (>= 300 LOC) |
| `tests/contracts/imp287_p2p_trade_activity_feed.test.ts` | Living Test | 0 | ~220 | +220 lines | Contract Suite | Safe (<= 600) |
| **Tổng Delta Production (`src/**`)** | — | — | — | **+34 net LOC** (<= 50 LOC) | — | **Pass Micro-Slice** |

> **Tech Debt Item**: `src/client/network/activity_tracker.ts` đạt 371 LOC (gần trần Tier 1 400 LOC). Đã lên kế hoạch phân rã mô-đun sâu tại ticket kỹ thuật tiếp theo.

### 0.3 Phân Định Phạm Vi & Ranh Giới Phân Hệ (Scope Conservation Mandate)
1. [`src/client/network/activity_property_tracker.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/activity_property_tracker.ts) — **MODIFY (Target 1)**: Nâng cấp `detectCellTrade` và `processCellOwnerDiff` để đọc `delta.lastTradeResult`. Phân giải định dạng tiếng Việt tự nhiên cho giao dịch tiền mặt (`[Chuyển Nhượng]`) và giao dịch hoán đổi (`[Hoán Đổi]`), gắn đúng `amount: -price` và `taxAmount`, đồng thời khử trùng lặp khi cả 2 ô hoán đổi xuất hiện trong `delta.cells`.
2. [`src/client/network/activity_financial_tracker.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/activity_financial_tracker.ts) — **MODIFY (Target 2)**: Nhận diện `delta.lastTradeResult` trong `detectFinancialAndStatusActivities`, đánh dấu người mua và người bán đã được xử lý tài chính qua thẻ giao dịch BĐS để ngăn `extractMiscellaneousBalances` phát sinh dòng tiền rác không rõ nguồn gốc.
3. [`src/client/network/activity_tracker.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/activity_tracker.ts) — **MODIFY (Target 3)**: Bảo toàn trật tự nhân quả trong `trackDeltaActivities`: giao dịch P2P hiển thị liền mạch trong nhóm sự kiện BĐS & tài chính.
4. [`tests/contracts/imp287_p2p_trade_activity_feed.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp287_p2p_trade_activity_feed.test.ts) — **NEW (Target 4)**: Viết 8 atomic contract tests kiểm toán luồng sinh log nhật ký hoạt động cho giao dịch P2P tiền mặt, hoán đổi BĐS có bù tiền, hoán đổi ngang giá, và thuế chuyển nhượng.
5. **Bảo toàn môi trường làm việc & baseline trước đó**:
   - `src/domain/room.ts`
   - `src/server/delta_types.ts`
   - `src/server/delta_mapper.ts`
   - `src/server/p2p_trade_actions.ts`
   - `src/server/turn_loop.ts`
   - `src/server/insolvency_manager.ts`
   - `src/server/network/turn_orchestrator.ts`
   - `src/server/intent_dispatcher.ts`
   - `src/server/mortgage_manager.ts`
   - `src/server/security/intent_guard.ts`
   - `src/client/ui/floating_numbers.tsx`
   - `tests/client/ui_linter.test.ts`
   - `tests/contracts/imp278_compact_floating_notifications.test.ts`
   - `tests/contracts/imp284_activity_feed_causal_ordering.test.ts`
   - `tests/contracts/imp285_sequential_turn_closure_guard.test.ts`
   - `tests/contracts/imp286_p2p_trade_delta_broadcast.test.ts`
   - `tests/contracts/imp287_out_of_turn_debtor_intent_whitelist.test.ts`

---

## 1. BẢN THIẾT KẾ KIẾN TRÚC & BẤT BIẾN NGHIỆP VỤ (ARCHITECTURAL INVARIANTS)

### 1.1 Minh Bạch Tài Chính Trong Nhật Ký Giao Dịch (Trade Financial Visibility Invariant)
* **Bối cảnh**: Trước đây nhật ký hoạt động chỉ hiển thị `A đã nhận chuyển nhượng X từ B`, bỏ qua giá tiền, thuế và đất hoán đổi. Đồng thời `amount` bị bỏ trống khiến thông số biến động tiền không hiển thị trên giao diện người dùng.
* **Bất biến hiển thị**:
  - Giao dịch tiền mặt thuần:
    `🤝 [Chuyển Nhượng] <Người mua> đã mua <Tên BĐS> từ <Người bán> với giá <Giá tiền> (Thuế kho bạc: <Tiền thuế>)`
  - Giao dịch hoán đổi kèm tiền bù:
    `🤝 [Hoán Đổi] <Người mua> và <Người bán> đã hoán đổi <BĐS 1> ⇄ <BĐS 2> (kèm bù <Tiền bù>, Thuế kho bạc: <Tiền thuế>)`
  - Giao dịch hoán đổi ngang giá (price = 0):
    `🤝 [Hoán Đổi] <Người mua> và <Người bán> đã hoán đổi quyền sở hữu <BĐS 1> ⇄ <BĐS 2>`
  - Trường `amount` của log entry BẮT BUỘC mang giá trị tài chính thực tế (`-price` khi có chi trả tiền mặt).

### 1.2 Khử Trùng Lặp Hoán Đổi & Chống Thất Thoát Dòng Tiền (Swap Deduplication & Zero-Leak Invariant)
* **Bất biến**: Khi một phiên hoán đổi BĐS thành công, máy chủ phát sóng cả 2 ô đất đổi chủ trong cùng một mảng `delta.cells`. Client BẮT BUỘC chỉ sinh đúng **1 bản ghi nhật ký hoạt động duy nhất** đại diện cho phiên hoán đổi, tránh phát sinh 2 dòng log trùng lặp gây nhiễu màn hình.

---

## 2. THIẾT KẾ KIỂM THỬ HỢP ĐỒNG (STATION 1 CONTRACT TEST SPECIFICATIONS)
* **Target physical file**: `tests/contracts/imp287_p2p_trade_activity_feed.test.ts` (New file in Station 1/2)

* TC-287.01 [UC-IMP287/MSS]: Given delta chứa lastTradeResult mua bán BĐS bằng tiền thuần, When detectPropertyAndLevelActivities thực thi, Then nhật ký ghi nhận định dạng Chuyển Nhượng kèm đầy đủ tên người mua người bán tên ô đất và giá tiền.
* TC-287.02 [UC-IMP287/MSS]: Given delta chứa lastTradeResult có thuế chuyển nhượng 5 phần trăm, When detectPropertyAndLevelActivities thực thi, Then chuỗi message chứa thông tin Thuế kho bạc tương ứng.
* TC-287.03 [UC-IMP287/MSS]: Given delta chứa lastTradeResult có giá tiền price lớn hơn 0, When detectPropertyAndLevelActivities thực thi, Then thuộc tính amount của entry mang giá trị âm trừ price của người mua.
* TC-287.04 [UC-IMP287/MSS]: Given delta chứa lastTradeResult là giao dịch hoán đổi BĐS kèm tiền bù, When detectPropertyAndLevelActivities thực thi, Then nhật ký ghi nhận định dạng Hoán Đổi với cả 2 ô đất và số tiền bù.
* TC-287.05 [UC-IMP287/MSS]: Given giao dịch hoán đổi BĐS có cả 2 ô đất cùng đổi chủ trong delta cells, When detectPropertyAndLevelActivities thực thi, Then chỉ tạo đúng 1 bản ghi hoán đổi duy nhất.
* TC-287.06 [UC-IMP287/MSS]: Given giao dịch hoán đổi BĐS ngang giá price bằng 0, When detectPropertyAndLevelActivities thực thi, Then nhật ký ghi nhận hoán đổi không kèm tiền bù.
* TC-287.07 [UC-IMP287/A1]: Given delta không có lastTradeResult nhưng có ô đất đổi chủ cũ sang chủ mới, When detectPropertyAndLevelActivities thực thi, Then hàm fallback về thông báo chuyển nhượng cơ bản an toàn.
* TC-287.08 [UC-IMP287/A2]: Given giao dịch P2P hoàn tất, When trackDeltaActivities thực thi toàn diện, Then không sinh log thanh toán số dư rác từ extractMiscellaneousBalances.

---

## 3. QUY TRÌNH CHỐT CHẶN CƠ HỌC & NGHIỆM THU
1. **Kiểm tra Plan tự động**: `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_287_P2P_TRADE_ACTIVITY_FEED.md --auto-sign`
2. **Trạm 1 (RED)**: Tạo contract test `tests/contracts/imp287_p2p_trade_activity_feed.test.ts` chứng minh fail vì runtime assertions (`detectCellTrade` hiện tại chưa đọc `delta.lastTradeResult`).
3. **Trạm 2 (GREEN)**: Cập nhật `activity_property_tracker.ts`, `activity_financial_tracker.ts`, `activity_tracker.ts` làm xanh 100% tests.
4. **Chốt chặn Fast Pre-Filter & Scope**:
   - `npm run prefilter -- src/client/network/activity_property_tracker.ts src/client/network/activity_financial_tracker.ts src/client/network/activity_tracker.ts tests/contracts/imp287_p2p_trade_activity_feed.test.ts`
   - `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_287_P2P_TRADE_ACTIVITY_FEED.md`
5. **Kiểm toán Bằng chứng vật lý**:
   - `npm run sentinel -- --ticket IMP-287 --test tests/contracts/imp287_p2p_trade_activity_feed.test.ts`
   - `npm run report -- IMP-287`
   - `node scripts/check_evidence.mjs IMP-287`
