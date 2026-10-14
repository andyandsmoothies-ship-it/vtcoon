# BÁO CÁO NGHIỆM THU HOÀN THÀNH TICKET IMP-392
## PLAN_IMP_392_SHARED_WIRE_PROTOCOL_AND_NETWORK_BOUNDARY

> **Mã Ticket:** `IMP-392`  
> **Phân hệ thực tế:** `domain-protocol / server-network / client-network`  
> **Ngày hoàn thành:** 2026-10-14  
> **Quy trình:** Closed-Loop 4-Station Pipeline (Tuân thủ nghiêm ngặt Hiến pháp AGENTS CONSTITUTION)  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED**

---

## 1. TỔNG QUAN & BỐI CẢNH VẤN ĐỀ

Trước `IMP-392` (Slice 1B của Gói "Nền Tảng Vàng"), kiến trúc giao thức đường truyền mạng giữa Client và Server tồn tại 3 điểm nghẽn lớn:
1. **Rò rỉ ranh giới Client $\rightarrow$ Server tại tầng Network / Events / Store / Telemetry**: 30 tệp thuộc `src/client/network/**` (17 tệp), `src/client/events/**` (9 tệp), `src/client/store/**` (2 tệp) và `src/client/telemetry/**` (2 tệp) phải import trực tiếp các kiểu `DeltaPayload`, `CellDelta`, `PlayerDelta`, `PendingTradeOfferDelta`, `DiplomaticEventDelta`, `TradeResultInfo`, `PlayerIntent`, `ReasonCode`, `WsClientMessage`, `WsServerMessage` từ các module nội bộ của Server (`src/server/session_manager.ts`, `src/server/intent_dispatcher.ts`, `src/server/network/network_types.ts`).
2. **Ép kiểu bẩn (`Dirty Cast`) và lỗ hổng kiểm tra trường trong `EnvelopeValidator`**: Tại `src/server/security/envelope_validator.ts`, hàm `validateIntentEnvelope` sử dụng ép kiểu `raw as import('../intent_dispatcher.js').PlayerIntent`, chưa kiểm tra `cellIndex` tùy chọn của `INTENT_UPGRADE_ETC`, chưa chặn `price <= 0` trong `INTENT_TRADE_OFFER`, và dùng điều kiện chắp vá `&& !isTransitWheel` vì `INTENT_SPIN_TRANSIT_WHEEL` vắng mặt trong `VALID_INTENTS`.
3. **Giải pháp kiến trúc thực thi trong `IMP-392`**:
   - Thiết lập mặt tiền chuẩn [`src/domain/protocol/index.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/protocol/index.ts) tuân thủ *Subsystem Facade Invariant*, quy tụ toàn bộ hợp đồng đường truyền mạng, chính danh hóa đủ **25 mã lệnh** trong `VALID_INTENTS` (bao gồm `INTENT_SPIN_TRANSIT_WHEEL`), và cung cấp hàm bảo vệ kiểu tự chứa `isValidPlayerIntentFields(it): it is PlayerIntent` kiểm tra chặt chẽ số nguyên biên bàn cờ `[0, 39]`, số nguyên không âm cho `amount`/`stake`, và `price > 0` cho `INTENT_TRADE_OFFER`.
   - Xóa bỏ hoàn toàn ép kiểu `as` trong [`envelope_validator.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/security/envelope_validator.ts), giữ re-export tương thích ngược 100% tại 5 tệp Server, và chuyển hướng toàn bộ **30 tệp Client** sang import từ `src/domain/protocol/index.js`.

---

## 2. BẢNG TỔNG HỢP BẰNG CHỨNG QUY TRÌNH 4 TRẠM KHÉP KÍN

| Trạm Kiểm Soát | Vai Trò & Tệp Bằng Chứng | Chỉ Số Đạt Được | Kết Quả Thẩm Định |
| :--- | :--- | :--- | :---: |
| **Stage 0: Plan Review** | `adversarial-challenger` & `audit_plan.mjs`<br>[`.agents/audit/PLAN_AUDIT_IMP-392.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-392.md) | Thẩm định kế hoạch đạt 0 defects, 7 contract tests clean. | **HARDENED_APPROVED 🛡️** |
| **Trạm 1: RED Contract Test** | `qa-tester`<br>[`tests/domain/imp392_shared_wire_protocol_and_network_boundary.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/domain/imp392_shared_wire_protocol_and_network_boundary.test.ts) | 7 atomic tests, 28 asserts, 0 loops. Adversarial Inversion: Đã chứng minh RED runtime | **VERIFIED RED** 🎯 |
| **Trạm 2: GREEN Implementation** | `implementer`<br>[`.agents/evidence/chaos_sentinel_IMP-392.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_IMP-392.json) | 1 facade mới (`src/domain/protocol/index.ts`) + 35 production files modified, 100% tests chuyển sang GREEN | **VERIFIED GREEN** 🟢 |
| **Trạm 2.5: Fast Pre-Filter** | `scout` & `fast_prefilter.mjs` | Typecheck `tsc --noEmit` exit 0, 0 dirty casts (`as any`), LOC budgets & Boundary Linter đạt chuẩn | **100% PASS** 🚀 |
| **Trạm 3.1: Spec & Scope Gate** | `spec-reviewer`<br>[`.agents/audit/SPEC_REVIEW_IMP-392.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-392.md) | 100% Plan fidelity, zero scope creep, kiểm soát ranh giới phân hệ | **APPROVED** 📋 |
| **Trạm 3.2: Architecture & Anti-Slop** | `code-reviewer`<br>[`.agents/audit/CODE_REVIEW_IMP-392.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-392.md) | 0 Slop red flags, Zero TIDD, an toàn bộ nhớ/timer, assertion density 4.00 | **APPROVED** 🛡️ |
| **Trạm 4: Chaos & Mutation Sentinel** | `chaos-sentinel`<br>[`scripts/check_evidence.mjs`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/check_evidence.mjs) | 20/20 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived). | **APPROVED 💥** |

---

## 3. KẾT QUẢ VẬN HÀNH 4 TRẠM KHÉP KÍN & PHẢN HỒI THẨM ĐỊNH (AUDIT & SUBAGENT FEEDBACK)

### Trạm 0: Thẩm Định Đối Kháng Kế Hoạch (`adversarial-challenger` & `audit_plan.mjs`)
- **Phán quyết**: **HARDENED_APPROVED 🛡️**
- **Nhật ký thẩm tra**: Thẩm định kế hoạch đạt 0 defects, 7 contract tests clean.
- **Điểm mù kiến trúc / phản biện đối kháng đã giải tỏa**:
  - **Chuẩn hóa vị trí Facade (`src/domain/protocol/index.ts`)**: Đặt hợp đồng đường truyền tại mặt tiền chuẩn `src/domain/protocol/index.ts` thay vì tạo tệp lá phẳng trong `src/domain/`, tuân thủ 100% *Subsystem Facade Invariant*.
  - **[ADV-01] Kiểm tra biên tự chứa trong `isValidPlayerIntentFields` (`[ADV-BRANCH]`)**:
    - **Scenario**: Khi kiểm tra `PlayerIntent` trên đường truyền (`INTENT_UPGRADE_ETC`, `INTENT_ISSUE_BOND`, `INTENT_SHORT_HOSE`, `INTENT_TRADE_OFFER`), nếu chỉ dùng `typeof x === 'number'` thì giá trị `NaN`, số thực hoặc `price <= 0` sẽ lọt qua bộ lọc của `EnvelopeValidator`.
    - **Hardening Directive**: Bổ sung các hàm kiểm tra tự chứa `isValidBoardCellIndex` (`[0, 39]` số nguyên, bao gồm cả `cellIndex` tùy chọn của `INTENT_UPGRADE_ETC`), `isNonNegativeInt` (`>= 0` số nguyên cho `amount`/`stake`), và `isPositiveInt` (`price > 0` số nguyên dương cho `INTENT_TRADE_OFFER`).
  - **[ADV-02] Chính danh hóa 25 mã lệnh trong `VALID_INTENTS` & chống sống sót biến dị Sentinel (`[ADV-REG]`)**:
    - **Scenario**: Trước đây `INTENT_SPIN_TRANSIT_WHEEL` vắng mặt trong `VALID_INTENTS` (chỉ có 24 mã), buộc `envelope_validator.ts` phải nối thêm nhánh ngoại lệ `&& !isTransitWheel`, đồng thời nếu chỉ kiểm tra trên `validateIntentEnvelope` thì biến dị tại `isValidPlayerIntentFields` có thể sống sót khi `EnvelopeValidator` kiểm tra trùng lặp phía trước.
    - **Hardening Directive**: Đưa `INTENT_SPIN_TRANSIT_WHEEL` vào `VALID_INTENTS` (25 mã lệnh chính danh), xóa bỏ nhánh đặc cách `&& type !== 'INTENT_SPIN_TRANSIT_WHEEL'`, kiểm thử trực tiếp cả `isValidPlayerIntentFields` lẫn `validateIntentEnvelope`, và bổ sung `TC-392.07` kiểm chứng tương thích ngược re-export phía Server.
  - **[ADV-03] Chuyển hướng trọn vẹn 30 tệp Client & cập nhật Pillar 11 trong `docs/FEATURE_MAP.md`**:
    - **Scenario**: Nếu để sót bất kỳ tệp nào trong 4 thư mục `src/client/{network,events,store,telemetry}/**` hoặc ghi nhầm số thứ tự Pillar trong `docs/FEATURE_MAP.md`, công cụ `npm run lint:boundaries` và tính toàn vẹn SSOT sẽ bị sai lệch.
    - **Hardening Directive**: Cắt đứt 100% kết nối sang `src/server/**` tại cả 30 tệp thuộc `src/client/{network,events,store,telemetry}/**` và cập nhật chính xác Pillar 11 (`FSM Lifecycle & WebSocket Sync`) tại dòng 58 của `docs/FEATURE_MAP.md`.

### Trạm 1: Bộ Kiểm Thử Hợp Đồng Độc Lập (`qa-tester`)
- **Tệp kiểm thử hợp đồng**: [`tests/domain/imp392_shared_wire_protocol_and_network_boundary.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/domain/imp392_shared_wire_protocol_and_network_boundary.test.ts)
- **Chỉ số kiểm thử**: **7 atomic tests**, **28 asserts** (mật độ trung bình: 4.00 asserts/test, 0 vòng lặp).
- **Adversarial Inversion Gate**:
  - Trạng thái: **Semantic Behavioral RED Verified (Thất bại do vi phạm ràng buộc runtime assertion khi chưa cập nhật code, không lỗi cú pháp)**.
  - **Bằng chứng thất bại (Failure Snippet)**:
```text
AssertionError: expected false to be true // Object.is equality (7 failed: TC-392.01..04 false vs true, TC-392.05 zeroPriceTrade success: true vs false, TC-392.06 CELL_INTENTS false vs true, TC-392.07 ServerValidIntents.size 24 vs 25)
```

### Trạm 2: Triển Khai Mã Nguồn Tối Thiểu (`implementer`)
- **Tệp mã nguồn tạo mới & thay đổi**:
  - **Tạo mới**: [`src/domain/protocol/index.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/protocol/index.ts) (153 dòng)
  - **Cập nhật 5 tệp Server**: [`src/server/security/envelope_validator.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/security/envelope_validator.ts), [`src/server/delta_types.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/delta_types.ts), [`src/server/intent_dispatcher.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/intent_dispatcher.ts), [`src/server/network/network_types.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/network/network_types.ts), [`src/server/network/admin_types.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/network/admin_types.ts)
  - **Chuyển hướng 30 tệp Client**: 17 tệp trong `src/client/network/**`, 9 tệp trong `src/client/events/**`, 2 tệp trong `src/client/store/**`, 2 tệp trong `src/client/telemetry/**`
- **Chuyển trạng thái**: Toàn bộ **7/7 contract tests chuyển sang GREEN**, cùng 62/62 tests thuộc các bộ hợp đồng liên quan (`imp224`, `imp248`, `imp146`) đạt GREEN 100%.

### Trạm 2.5: Fast Pre-Filter Mechanical Sweep (`scout` / `fast_prefilter.mjs`)
- **TypeScript**: `tsc --noEmit` vượt qua với 0 lỗi (Exit Code 0).
- **Dirty Casts**: Tuyệt đối không sử dụng `as any` hoặc dirty type casting; xóa sạch ép kiểu `raw as ...` trong `envelope_validator.ts`.
- **Boundary & Cycle Linter (`npm run lint:boundaries`)**: Quét 399 tệp, 0 lỗi vi phạm ranh giới cứng, 0 tệp thuộc `src/client/{network,events,store,telemetry}/**` còn xuất hiện trong danh sách cảnh báo ranh giới.

### Trạm 3: Thẩm Định Độc Lập Từ Đĩa Vật Lý (Independent Station 3 Reviews)
1. **Spec & Scope Gatekeeper (`spec-reviewer`)**:
    - **Phán quyết**: **APPROVED** 📋
    - **Xác nhận phạm vi**: 100% các thay đổi khớp với phạm vi kế hoạch `IMP-392`, zero scope creep.
2. **Deep Architecture & Anti-Slop Auditor (`code-reviewer`)**:
    - **Phán quyết**: **APPROVED** 🛡️
    - **Chỉ số Anti-Slop**: 0 violations trên 6 cờ cảnh báo (Deep modules, Zero pass-through wrappers, Zero TIDD).

### Trạm 4: Cơ Chế Biên & Tiêu Diệt Biến Dị (`chaos-sentinel`)
- **Phán quyết**: **APPROVED 💥**
- **Hiệu quả kiểm soát**:
  - **Probe 1 (Wire-to-Core Parity)**: **25/25 Intents** đối xứng tuyệt đối giữa `VALID_INTENTS` và `dispatchPlayerIntent` (0 gaps).
  - **Probe 2 (Ephemeral Wire Port 0)**: Khởi chạy WebSocket sống trên cổng động `port: 51851`, vượt qua kiểm tra ngắt kết nối đột ngột.
  - **Probe 3 (Mutation Sensitivity)**: **20/20 mutants mục tiêu bị tiêu diệt** (9 biến dị mã nguồn trên `src/domain/protocol/index.ts` + 11 biến dị hợp đồng, kill rate: **100%**, 0 survived).

---

## 4. THỐNG KÊ BIẾN ĐỘNG DÒNG MÃ (LOC ACCOUNTING)

### 4.1. Phạm Vi Trực Tiếp Của Ticket IMP-392 (Direct Scope)

| Tệp Mã Nguồn | Đường Dẫn | Phân Hệ / Tier | LOC Thực Tế (SLOC) | Dòng Vật Lý (Disk) | Ngân Sách Trần | Trạng Thái |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `index.ts` | [`src/domain/protocol/index.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/protocol/index.ts) | Tier 1 (Domain Protocol Facade) | **144 SLOC** | 153 Lines | <= 400 LOC | ✅ Mới tạo |
| `envelope_validator.ts` | [`src/server/security/envelope_validator.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/security/envelope_validator.ts) | Tier 1 (Server Security) | **194 SLOC** | 203 Lines | <= 400 LOC | ✅ Đạt chuẩn (-41 dòng) |
| `delta_types.ts` | [`src/server/delta_types.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/delta_types.ts) | Tier 1 (Server Re-export) | **14 SLOC** | 15 Lines | <= 400 LOC | ✅ Đạt chuẩn (-123 dòng) |
| `intent_dispatcher.ts` | [`src/server/intent_dispatcher.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/intent_dispatcher.ts) | Tier 1 (Server Dispatcher) | **175 SLOC** | 179 Lines | <= 400 LOC | ✅ Đạt chuẩn (-23 dòng) |
| `network_types.ts` | [`src/server/network/network_types.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/network/network_types.ts) | Tier 1 (Server Re-export) | **19 SLOC** | 23 Lines | <= 400 LOC | ✅ Đạt chuẩn (-182 dòng) |
| `admin_types.ts` | [`src/server/network/admin_types.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/network/admin_types.ts) | Tier 1 (Server Re-export) | **21 SLOC** | 25 Lines | <= 400 LOC | ✅ Đạt chuẩn (-70 dòng) |
| `game_event_bond_helpers.ts` | [`src/client/events/game_event_bond_helpers.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/game_event_bond_helpers.ts) | Tier 1 (Client Events) | **102 SLOC** | 110 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `game_event_bus.ts` | [`src/client/events/game_event_bus.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/game_event_bus.ts) | Tier 1 (Client Events) | **90 SLOC** | 109 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `game_event_buyout_helpers.ts` | [`src/client/events/game_event_buyout_helpers.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/game_event_buyout_helpers.ts) | Tier 1 (Client Events) | **74 SLOC** | 78 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `game_event_financial_helpers.ts` | [`src/client/events/game_event_financial_helpers.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/game_event_financial_helpers.ts) | Tier 1 (Client Events) | **221 SLOC** | 245 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `game_event_financial_synthesizer.ts` | [`src/client/events/game_event_financial_synthesizer.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/game_event_financial_synthesizer.ts) | Tier 1 (Client Events) | **249 SLOC** | 275 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `game_event_hose_helpers.ts` | [`src/client/events/game_event_hose_helpers.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/game_event_hose_helpers.ts) | Tier 1 (Client Events) | **78 SLOC** | 88 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `game_event_kinematics_synthesizer.ts` | [`src/client/events/game_event_kinematics_synthesizer.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/game_event_kinematics_synthesizer.ts) | Tier 1 (Client Events) | **97 SLOC** | 105 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `game_event_property_synthesizer.ts` | [`src/client/events/game_event_property_synthesizer.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/game_event_property_synthesizer.ts) | Tier 1 (Client Events) | **222 SLOC** | 237 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `game_event_synthesizer.ts` | [`src/client/events/game_event_synthesizer.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/game_event_synthesizer.ts) | Tier 1 (Client Events) | **25 SLOC** | 28 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `activity_auction_tracker.ts` | [`src/client/network/activity_auction_tracker.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/network/activity_auction_tracker.ts) | Tier 1 (Client Network) | **93 SLOC** | 102 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `activity_badge_dispatcher.ts` | [`src/client/network/activity_badge_dispatcher.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/network/activity_badge_dispatcher.ts) | Tier 1 (Client Network) | **186 SLOC** | 209 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `activity_financial_tracker.ts` | [`src/client/network/activity_financial_tracker.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/network/activity_financial_tracker.ts) | Tier 1 (Client Network) | **211 SLOC** | 236 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `activity_go_extractor.ts` | [`src/client/network/activity_go_extractor.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/network/activity_go_extractor.ts) | Tier 1 (Client Network) | **170 SLOC** | 189 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `activity_property_tracker.ts` | [`src/client/network/activity_property_tracker.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/network/activity_property_tracker.ts) | Tier 1 (Client Network) | **299 SLOC** | 322 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `activity_rent_matcher.ts` | [`src/client/network/activity_rent_matcher.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/network/activity_rent_matcher.ts) | Tier 1 (Client Network) | **243 SLOC** | 270 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `activity_tracker.ts` | [`src/client/network/activity_tracker.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/network/activity_tracker.ts) | Tier 1 (Client Network) | **258 SLOC** | 294 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `activity_transit_tracker.ts` | [`src/client/network/activity_transit_tracker.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/network/activity_transit_tracker.ts) | Tier 1 (Client Network) | **56 SLOC** | 64 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `apply_delta.ts` | [`src/client/network/apply_delta.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/network/apply_delta.ts) | Tier 1 (Client Network) | **224 SLOC** | 250 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `apply_delta_cells.ts` | [`src/client/network/apply_delta_cells.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/network/apply_delta_cells.ts) | Tier 1 (Client Network) | **151 SLOC** | 167 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `apply_delta_modals.ts` | [`src/client/network/apply_delta_modals.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/network/apply_delta_modals.ts) | Tier 1 (Client Network) | **162 SLOC** | 179 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `apply_delta_players.ts` | [`src/client/network/apply_delta_players.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/network/apply_delta_players.ts) | Tier 1 (Client Network) | **243 SLOC** | 269 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `game_ws_dispatcher.ts` | [`src/client/network/game_ws_dispatcher.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/network/game_ws_dispatcher.ts) | Tier 1 (Client Network) | **118 SLOC** | 125 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `use_app_session.ts` | [`src/client/network/use_app_session.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/network/use_app_session.ts) | Tier 1 (Client Network) | **254 SLOC** | 283 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `use_app_turn_controls.ts` | [`src/client/network/use_app_turn_controls.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/network/use_app_turn_controls.ts) | Tier 1 (Client Network) | **109 SLOC** | 123 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `use_game_ws.ts` | [`src/client/network/use_game_ws.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/network/use_game_ws.ts) | Tier 1 (Client Network) | **288 SLOC** | 321 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `ws_message_handler.ts` | [`src/client/network/ws_message_handler.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/network/ws_message_handler.ts) | Tier 1 (Client Network) | **175 SLOC** | 188 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `game_store_state_types.ts` | [`src/client/store/game_store_state_types.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/store/game_store_state_types.ts) | Tier 1 (Client Store) | **187 SLOC** | 199 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `game_store_subtypes.ts` | [`src/client/store/game_store_subtypes.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/store/game_store_subtypes.ts) | Tier 1 (Client Store) | **216 SLOC** | 230 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `telemetry_delta_hook.ts` | [`src/client/telemetry/telemetry_delta_hook.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/telemetry/telemetry_delta_hook.ts) | Tier 1 (Client Telemetry) | **131 SLOC** | 143 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `telemetry_expected_delta.ts` | [`src/client/telemetry/telemetry_expected_delta.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/telemetry/telemetry_expected_delta.ts) | Tier 1 (Client Telemetry) | **301 SLOC** | 322 Lines | <= 400 LOC | ⚠️ Warning (301 > 300) |
| `imp224_auto_solvency_wire_envelope.test.ts` | [`tests/contracts/imp224_auto_solvency_wire_envelope.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp224_auto_solvency_wire_envelope.test.ts) | Living Test | **373 SLOC** | 428 Lines | <= 600 LOC | ✅ Đạt chuẩn |
| `imp392_shared_wire_protocol_and_network_boundary.test.ts` | [`tests/domain/imp392_shared_wire_protocol_and_network_boundary.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/domain/imp392_shared_wire_protocol_and_network_boundary.test.ts) | Living Test | **219 SLOC** | 235 Lines | <= 600 LOC | ✅ Đạt chuẩn |

---

## 5. ĐÁNH GIÁ VẬN HÀNH, 3 ĐIỂM PHẢN BIỆN TỒN ĐỌNG & BÀN GIAO TIẾP THEO

- **Tính toàn vẹn hệ thống**: Slice 1B (`IMP-392`) hoàn thành trọn vẹn việc thiết lập mặt tiền giao thức đường truyền `src/domain/protocol/index.ts`, xóa bỏ ép kiểu bẩn tại `envelope_validator.ts`, và cắt đứt 100% phụ thuộc từ 4 phân hệ `src/client/{network,events,store,telemetry}/**` sang `src/server/**`.
- **Bước tiếp theo (Slice 1C — `IMP-393`)**: Hợp nhất công thức tính Net Worth trong `src/client/ui/ui_helpers.ts` về SSOT `calculateCellNetWorth`, chuyển hướng toàn bộ **14 tệp giao diện 2D (`src/client/ui/**`)** còn lại từ `src/server/**` sang `src/domain/protocol/index.ts`, và khóa chặt Ratchet Baseline về `0`.

### Sổ Theo Dõi Nợ Kỹ Thuật & 3 Điểm Phản Biện Tồn Đọng (Tech Debt Watch)

1. ⚠️ **Rủi ro ngộ nhận về "100% Client Boundary Purged" (Còn 14 tệp `src/client/ui/**` chờ xử lý ở Slice 1C)** [`DEBT-BOUNDARY-UI`]:
   - **Thực trạng**: Dù 4 phân hệ `src/client/{network,events,store,telemetry}/**` (30 tệp) đã sạch 100% vi phạm ranh giới, trên đĩa vật lý vẫn còn **14 tệp thuộc phân hệ UI (`src/client/ui/**`)** đang import trực tiếp từ `src/server/**`:
     - **5 tệp Admin UI** (`admin_archive_view.tsx`, `admin_live_view.tsx`, `admin_log_row.tsx`, `admin_repro.ts`, `use_admin_portal.ts`) trỏ vào `server/network/admin_manager.ts`, `admin_types.ts`, `network_types.ts`.
     - **6 tệp Modal Hosts & Strip** (`auction_modal_host.tsx`, `deed_modal_host.tsx`, `portfolio_modal_host.tsx`, `trade_modal_host.tsx`, `modal_host.tsx`, `bot_trade_offer_strip.tsx`) trỏ vào `server/intent_dispatcher.ts`.
     - **3 tệp tiện ích & HUD** (`hud_container.tsx`, `pre_match_deck.tsx`, `player_card_helpers.ts`).
   - **Chỉ thị bảo vệ**: **TUYỆT ĐỐI KHÔNG tắt cảnh báo Ratchet Baseline (`KNOWN_LEGACY_CLIENT_SERVER_VIOLATIONS`) tại thời điểm kết thúc `IMP-392`**. Toàn bộ 14 tệp này được bàn giao có chủ đích sang **Slice 1C (`IMP-393`)** để xóa sổ triệt để.
2. ⚠️ **Nguy cơ phình to của "Fat Facade" `src/domain/protocol/index.ts`** [`DEBT-FAT-FACADE`]:
   - **Thực trạng**: Tệp [`src/domain/protocol/index.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/protocol/index.ts) hiện dài `153 LOC` (an toàn dưới trần `400 LOC`), nhưng đang đóng vai trò gom chung 4 nhóm hợp đồng (Giao thức Delta, Ý định người chơi & Type Guard `isValidPlayerIntentFields`, Hợp đồng WebSocket `WsClientMessage`/`WsServerMessage`, và Hợp đồng quản trị `AdminRoomSummary`/`ServerVitals`).
   - **Kiến nghị lộ trình**: Khi `src/domain/protocol/` mở rộng thêm tính năng mới (Chat, Emote thời gian thực, Giải đấu nhiều bàn) tiệm cận ngưỡng Buffer Zone `350 LOC`, bắt buộc tách thành các tệp nội bộ chuyên biệt (`wire_delta.ts`, `wire_intent.ts`, `wire_ws.ts`, `wire_admin.ts`) và giữ `src/domain/protocol/index.ts` chỉ làm mặt tiền re-export thuần túy.
3. ⚠️ **Tồn tại các tệp "Middle-Man Passthrough Shims" ở Server** [`DEBT-SERVER-SHIMS`]:
   - **Thực trạng**: Các tệp [`src/server/delta_types.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/delta_types.ts) (`15 LOC`), [`src/server/network/network_types.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/network/network_types.ts) (`23 LOC`), và [`src/server/network/admin_types.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/network/admin_types.ts) (`25 LOC`) hiện chỉ đóng vai trò Lớp Đệm Chuyển Tiếp (Transitional Shims `< 30 LOC`) thuần túy re-export từ `src/domain/protocol/index.js` nhằm bảo vệ tính tương thích ngược cho các module Server và bài kiểm thử lịch sử.
   - **Kiến nghị lộ trình**: Lên lịch trình dẹp bỏ hoàn toàn các Transitional Shims này sau khi toàn bộ các tệp nội bộ `src/server/**` và `tests/**` chuyển hẳn sang import trực tiếp từ `src/domain/protocol/index.js`.
4. ⚠️ **Cảnh báo trần LOC Tier 1** [`DEBT-NET-01`]: Các tệp [`src/client/network/activity_property_tracker.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/network/activity_property_tracker.ts) (322/400 LOC), [`src/client/network/use_game_ws.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/network/use_game_ws.ts) (321/400 LOC) và [`src/client/telemetry/telemetry_expected_delta.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/telemetry/telemetry_expected_delta.ts) (322/400 LOC) đang nằm trên ngưỡng cảnh báo 300 LOC. Các ticket tiếp theo nếu thêm logic mới vào các tệp này cần tách sub-helper trước khi mở rộng.

