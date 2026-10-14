# BÁO CÁO NGHIỆM THU HOÀN THÀNH TICKET IMP-395
## PLAN_IMP_395_CORE_DOMAIN_AND_BOT_FACADES

> **Mã Ticket:** `IMP-395`  
> **Phân hệ thực tế:** `domain-core`  
> **Ngày hoàn thành:** 2026-10-14  
> **Quy trình:** Closed-Loop 4-Station Pipeline (Tuân thủ nghiêm ngặt Hiến pháp AGENTS CONSTITUTION)  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED**

---

## 1. TỔNG QUAN & BỐI CẢNH VẤN ĐỀ

Trước `IMP-395` (Phase 3 — Slice 3A), hai phân hệ lõi là `src/domain/` (28 tệp) và `src/domain/bot/` (15 tệp) chưa có cổng giao tiếp công khai (`index.ts`). Hệ quả là cụm 7 tệp điều phối phòng chơi `src/server/room_*.ts` (`room_manager.ts`, `room_bot_coordinator.ts`, `room_bot_manager.ts`, `room_manager_lifecycle.ts`, `room_property_coordinator.ts`, `room_trade_coordinator.ts`, `room_manager_queries.ts`) phải import phân tán trực tiếp vào từng tệp lá nội bộ (`room.js`, `action_reasons.js`, `property_manager.js`, `event_card_engine.js`, `transit_wheel.js`, `bot_engine.js`, `bot_types.js`,...). Đáng chú ý, `src/server/room_manager.ts` chạm ngưỡng `350 LOC` (vùng đệm đỏ `>= 350 LOC` của Tier 1) do chứa 39 dòng import rời rạc.

Ticket `IMP-395` giải quyết triệt để vấn đề này thông qua 3 cơ chế kỹ thuật cốt lõi:
1. **Thành lập Core Domain Public Facade ([`src/domain/index.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/index.ts) — 73 LOC)**: Tập trung hóa toàn bộ thực thể lõi (`Room`, `Player`, `TurnPhase`, `ActionRejectReason`), bảng cấu hình và hằng số bất biến (`BOARD_CONFIG`, `PROPERTY_DEEDS`, `LEVEL_MULTIPLIER`, `BOND_TRANCHES`, `TRANSIT_WHEEL_CONFIGS`, `MORTGAGE_DEFAULT_INTEREST_RATE`, `MORTGAGE_RATE_HIKE_INTEREST_RATE`, `MORTGAGE_LOAN_RATE`, `URBAN_PLANNING_MORTGAGE_RATE`, `MORTGAGE_REDEEM_FEE_RATE`, `vi`), cùng các hàm tính toán và xử lý nghiệp vụ chuẩn (`calculateCellNetWorth`, `calculateRent`, `resolveRent`, `calculateUpgradeCost`, `calculateBailAmount`, `calculateGoSalary`, `evaluateMacroCycle`, `buyProperty`, `handleLanding`, `upgradeProperty`, `downgradeProperty`,...). Đồng thời, Facade ẩn hoàn toàn 6 tệp thực thi lá nội bộ (`card_handlers.ts`, `chance_card_handlers.ts`, `chance_ma_handlers.ts`, `market_card_handlers.ts`, `compulsory_buyout.ts`, `types.ts`) — được kiểm chứng cơ học tại `TC-395.02`.
2. **Thành lập Autonomous Bot Brain Public Facade ([`src/domain/bot/index.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/bot/index.ts) — 30 LOC)**: Đóng gói 11/15 tệp giải thuật toán học, định giá và xác suất nội bộ (`valuation_engine.ts`, `solvency_solver.ts`, `threat_forecaster.ts`, `bot_softmax.ts`, `bot_auction_heuristics.ts`, `bot_hybrid_trade.ts`, `bot_liquidation.ts`, `bot_negotiation_calc.ts`, `bot_rent_projection.ts`, `bot_trade.ts`, `bot_upgrade_advisor.ts`), chỉ tái xuất khẩu từ 4 tệp đầu mối (`bot_types.js`, `bot_engine.js`, `bot_negotiation_brain.js`, `bot_posture.js`) với đúng 12 giá trị runtime thực tế (`BotPersonality`, `BotPosture`, `decideBotIntent`, `decideAuctionPhaseIntent`, `findEligibleBotTrade`, `evaluateBotTradeAcceptance`, `takeover`, `BotEngine`, `evaluateBotTradeDecision`, `recordTradeRejection`, `clearTradeRejectionForCell`, `evaluatePlayerNetWorth`) và 8 kiểu dữ liệu tĩnh (`BotConfig`, `BotIntent`, `TileValuation`, `BotTradeDecision`, `BotTradeIntent`, `BotSwapTradeIntent`, `BotNegotiationContext`, `BotNegotiationDecision`), tuyệt đối không tạo các hàm bí danh giả (tuân thủ luật Anti-TIDD).
3. **Chuyển đổi 100% cụm điều phối `src/server/room_*.ts` (7/7 tệp) qua Facade & Giải tỏa trần LOC**: Định tuyến toàn bộ 7/7 tệp thuộc họ `src/server/room_*.ts` sang sử dụng độc quyền `../domain/index.js` và `../domain/bot/index.js`, qua đó kéo [`src/server/room_manager.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts) từ `350 LOC` xuống `344 LOC` (thoát khỏi vùng đệm đỏ `>= 350 LOC`) và giữ vững `0 SCCs` trên toàn bộ `src/domain/**`. Đối với 8 tệp gọi Domain/Bot nằm ngoài họ `room_*` (gồm 5 tệp Server `trade_coordinator_helper.ts`, `game_room_session.ts`, `session_proxy_facade.ts`, `network/reconnect_manager.ts`, `turn_loop.ts` và 3 tệp Client Store `lobby_store.ts`, `lobby_types.ts`, `game_store_subtypes.ts`), việc chuyển đổi sang Facade được phân bổ sang **Slice 3B (`IMP-396`)** để tuân thủ nghiêm ngặt quy tắc `<= 3` cụm họ tệp gắn kết (`cohesiveFamilies`) của `audit_plan.mjs`.

---

## 2. BẢNG TỔNG HỢP BẰNG CHỨNG QUY TRÌNH 4 TRẠM KHÉP KÍN

| Trạm Kiểm Soát | Vai Trò & Tệp Bằng Chứng | Chỉ Số Đạt Được | Kết Quả Thẩm Định |
| :--- | :--- | :--- | :---: |
| **Stage 0: Plan Review** | `adversarial-challenger` & `audit_plan.mjs`<br>[`.agents/audit/PLAN_AUDIT_IMP-395.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-395.md) | Thẩm định kế hoạch đạt 0 defects, 10/10 target files khớp 3 cụm gắn kết, 6 contract tests clean. | **HARDENED_APPROVED 🛡️** |
| **Trạm 1: RED Contract Test** | `qa-tester`<br>[`tests/domain/imp395_core_domain_and_bot_facades.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/domain/imp395_core_domain_and_bot_facades.test.ts) | 6 atomic tests, 24 asserts, 0 loops. Adversarial Inversion: Đã chứng minh RED runtime | **VERIFIED RED** 🎯 |
| **Trạm 2: GREEN Implementation** | `implementer`<br>[`.agents/evidence/chaos_sentinel_IMP-395.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_IMP-395.json) | 10 production files verified, 100% tests chuyển sang GREEN | **VERIFIED GREEN** 🟢 |
| **Trạm 2.5: Fast Pre-Filter** | `scout` & `fast_prefilter.mjs` | Typecheck `tsc --noEmit` exit 0, 0 dirty casts (`as any`), LOC budgets đạt chuẩn | **100% PASS** 🚀 |
| **Trạm 3.1: Spec & Scope Gate** | `spec-reviewer`<br>[`.agents/audit/SPEC_REVIEW_IMP-395.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-395.md) | 100% Plan fidelity, zero scope creep, kiểm soát ranh giới phân hệ `domain-core` | **APPROVED** 📋 |
| **Trạm 3.2: Architecture & Anti-Slop** | `code-reviewer`<br>[`.agents/audit/CODE_REVIEW_IMP-395.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-395.md) | 0 Slop red flags, Zero TIDD, an toàn bộ nhớ/timer, assertion density 4.00 | **APPROVED** 🛡️ |
| **Trạm 4: Chaos & Mutation Sentinel** | `chaos-sentinel`<br>[`scripts/check_evidence.mjs`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/check_evidence.mjs) | 16/16 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived). | **APPROVED 💥** |

---

## 3. KẾT QUẢ VẬN HÀNH 4 TRẠM KHÉP KÍN & PHẢN HỒI THẨM ĐỊNH (AUDIT & SUBAGENT FEEDBACK)

### Trạm 0: Thẩm Định Đối Kháng Kế Hoạch (`adversarial-challenger` & `audit_plan.mjs`)
- **Phán quyết**: **HARDENED_APPROVED 🛡️**
- **Nhật ký thẩm tra**: Kế hoạch `PLAN_IMP_395_CORE_DOMAIN_AND_BOT_FACADES.md` đạt `0 defects` qua `node scripts/audit_plan.mjs --auto-sign`, đồng bộ 1:1 giữa Bảng 1 (Direct Scope) và Mục 4 (`**Target physical file**:`) với đúng 3 cụm họ tệp gắn kết (`src/domain/index`, `src/domain/bot/index`, `src/server/room`).
- **Điểm mù kiến trúc / phản biện đối kháng đã giải tỏa**:
  - **[CRITICAL-01] Đồng bộ 1:1 `**Target physical file**:` & Tuân thủ trần `<= 3` Cohesive Units**: Đã tách 8 tệp ngoài họ `room_*` (`trade_coordinator_helper.ts`, `game_room_session.ts`, `session_proxy_facade.ts`, `reconnect_manager.ts`, `turn_loop.ts`, `lobby_store.ts`, `lobby_types.ts`, `game_store_subtypes.ts`) sang **Slice 3B (`IMP-396`)**, đồng thời gắn nhãn `**Target physical file**:` đầy đủ cho cả 10 tệp của Slice 3A.
  - **[HIGH-02] Loại bỏ triệt để 5 bí danh giả vi phạm Anti-TIDD**: Đã xóa bỏ hoàn toàn các bí danh không có người gọi thực tế (`VI_MESSAGES`, `decideBotAction`, `decideBotAuctionAction`, `decideBotProactiveTrade`, `evaluateBotTradeOffer`) khỏi thiết kế và kiểm chứng bằng `TC-395.02` & `TC-395.04`.
  - **[MEDIUM-03] Chuyển đổi `room_manager.ts` ngay tại Slice 3A để kéo LOC từ `350 -> 344 LOC`**: Hợp nhất các luồng import từ 5 tệp lá trong `src/server/room_manager.ts` về `../domain/index.js`, giải phóng 6 dòng và đưa tệp xuống dưới ngưỡng cảnh báo đỏ `>= 350 LOC`.
  - **[ADV-01 & ADV-02] Bảo toàn bất biến `0 SCCs` tại `src/domain/room.ts#L5`**: Giữ nguyên `import type { BotPersonality } from './bot/bot_types'` bên trong nội bộ `src/domain/room.ts` để tránh tạo vòng lặp phụ thuộc 5 nút khi `src/domain/bot/index.ts` re-export các module phụ thuộc vào `room.ts`.

### Trạm 1: Bộ Kiểm Thử Hợp Đồng Độc Lập (`qa-tester`)
- **Tệp kiểm thử hợp đồng**: [`tests/domain/imp395_core_domain_and_bot_facades.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/domain/imp395_core_domain_and_bot_facades.test.ts)
- **Chỉ số kiểm thử**: **6 atomic tests**, **24 asserts** (mật độ trung bình: 4.00 asserts/test, 0 vòng lặp).
- **Adversarial Inversion Gate**:
  - Trạng thái: **Semantic Behavioral RED Verified (Thất bại do vi phạm ràng buộc runtime assertion khi chưa cập nhật code, không lỗi cú pháp)**.
  - **Bằng chứng thất bại (Failure Snippet)**:
```text
AssertionError: expected -1 to be 10000 // Object.is equality (6 failed: TC-395.01 -1 vs 10000, TC-395.02 10 vs 0, TC-395.03 27 vs 0, TC-395.04 false vs true, TC-395.05 false vs true, TC-395.06 -1 vs 10240)
```

### Trạm 2: Triển Khai Mã Nguồn Tối Thiểu (`implementer`)
- **Tệp mã nguồn trong phạm vi kiểm toán**:
  - [`src/domain/index.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/index.ts)
  - [`src/domain/bot/index.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/bot/index.ts)
  - [`src/server/room_manager.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts)
  - [`src/server/room_bot_coordinator.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/room_bot_coordinator.ts)
  - [`src/server/room_bot_manager.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/room_bot_manager.ts)
  - [`src/server/room_manager_lifecycle.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager_lifecycle.ts)
  - [`src/server/room_property_coordinator.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/room_property_coordinator.ts)
  - [`src/server/room_trade_coordinator.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/room_trade_coordinator.ts)
  - [`src/server/room_manager_queries.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager_queries.ts)
  - [`src/domain/room.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/room.ts)
- **Chuyển trạng thái**: Toàn bộ **6/6 contract tests chuyển sang GREEN**.
- **Living Test Suites**: Bảo toàn nguyên vẹn, zero hồi quy logic hiện hành.

### Trạm 2.5: Fast Pre-Filter Mechanical Sweep (`scout` / `fast_prefilter.mjs`)
- **TypeScript**: `tsc --noEmit` vượt qua với 0 lỗi (Exit Code 0).
- **Dirty Casts**: Tuyệt đối không sử dụng `as any` hoặc dirty type casting.
- **LOC Ceilings**: Tất cả các tệp đều nằm trong hạn mức trần của từng phân hệ (Tier 1 <= 400, Tier 2 <= 500, Tier 3 <= 800, Test <= 600).

### Trạm 3: Thẩm Định Độc Lập Từ Đĩa Vật Lý (Independent Station 3 Reviews)
1. **Spec & Scope Gatekeeper (`spec-reviewer`)**:
    - **Phán quyết**: **APPROVED** 📋
    - **Xác nhận phạm vi**: 100% các thay đổi nằm trong phạm vi đăng ký của `PLAN_IMP_395_CORE_DOMAIN_AND_BOT_FACADES.md`, zero scope creep.
2. **Deep Architecture & Anti-Slop Auditor (`code-reviewer`)**:
    - **Phán quyết**: **APPROVED** 🛡️
    - **Chỉ số Anti-Slop**: 0 violations trên 6 cờ cảnh báo (Deep modules, Zero pass-through wrappers, Zero TIDD).
    - **Bộ nhớ & Timer**: Không rò rỉ listener, không bỏ sót timer cleanup, an toàn đa luồng/bất đồng bộ.

### Trạm 4: Cơ Chế Biên & Tiêu Diệt Biến Dị (`chaos-sentinel`)
- **Phán quyết**: **APPROVED 💥**
- **Hiệu quả kiểm soát**: 16/16 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 4 source-level mutants tại `src/server/room_manager_queries.ts` và 12 wire-protocol/boundary probes, 0 survived).
- **Xác nhận**: Đã vượt qua kiểm toán cơ học `node scripts/check_evidence.mjs IMP-395` với 0 defects.

---

## 4. THỐNG KÊ BIẾN ĐỘNG DÒNG MÃ (LOC ACCOUNTING)

### 4.1. Phạm Vi Trực Tiếp Của Ticket IMP-395 (Direct Scope)

| Tệp Mã Nguồn | Đường Dẫn | Phân Hệ / Tier | LOC Thực Tế (SLOC) | Dòng Vật Lý (Disk) | Ngân Sách Trần | Trạng Thái |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `room.ts` | [`src/domain/room.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/room.ts) | Tier 1 (Domain/Server/Logic) | **315 SLOC** | 339 Lines | <= 400 LOC | ⚠️ Warning (315 > 300) |
| `room_bot_coordinator.ts` | [`src/server/room_bot_coordinator.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/room_bot_coordinator.ts) | Tier 1 (Domain/Server/Logic) | **271 SLOC** | 300 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `room_bot_manager.ts` | [`src/server/room_bot_manager.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/room_bot_manager.ts) | Tier 1 (Domain/Server/Logic) | **82 SLOC** | 88 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `room_manager.ts` | [`src/server/room_manager.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts) | Tier 1 (Domain/Server/Logic) | **303 SLOC** | 344 Lines | <= 400 LOC | ⚠️ Warning (303 > 300) |
| `room_manager_lifecycle.ts` | [`src/server/room_manager_lifecycle.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager_lifecycle.ts) | Tier 1 (Domain/Server/Logic) | **304 SLOC** | 330 Lines | <= 400 LOC | ⚠️ Warning (304 > 300) |
| `room_manager_queries.ts` | [`src/server/room_manager_queries.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager_queries.ts) | Tier 1 (Domain/Server/Logic) | **64 SLOC** | 72 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `room_property_coordinator.ts` | [`src/server/room_property_coordinator.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/room_property_coordinator.ts) | Tier 1 (Domain/Server/Logic) | **163 SLOC** | 178 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `room_trade_coordinator.ts` | [`src/server/room_trade_coordinator.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/room_trade_coordinator.ts) | Tier 1 (Domain/Server/Logic) | **200 SLOC** | 222 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `index.ts` | [`src/domain/bot/index.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/bot/index.ts) | Tier 1 (Domain/Server/Logic) | **27 SLOC** | 30 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `index.ts` | [`src/domain/index.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/index.ts) | Tier 1 (Domain/Server/Logic) | **73 SLOC** | 73 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `imp395_core_domain_and_bot_facades.test.ts` | [`tests/domain/imp395_core_domain_and_bot_facades.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/domain/imp395_core_domain_and_bot_facades.test.ts) | Living Test | **359 SLOC** | 404 Lines | <= 600 LOC | ✅ Đạt chuẩn |

---

## 5. ĐÁNH GIÁ VẬN HÀNH & BÀN GIAO TIẾP THEO

- **Tính toàn vẹn hệ thống**: Gói cải tiến `IMP-395` (Slice 3A) đã thiết lập thành công hai cổng giao tiếp công khai `src/domain/index.ts` và `src/domain/bot/index.ts`, đồng thời hoàn tất chuyển đổi 100% cụm **7/7 tệp `src/server/room_*.ts`** sang sử dụng Facade với `0 SCCs` phát sinh.
- **Lát cắt tiếp theo (Slice 3B — `IMP-396`)**: Tiếp tục chuyển đổi **8 callers còn lại ngoài họ `room_*`** (gồm 5 tệp điều phối Server: `trade_coordinator_helper.ts`, `game_room_session.ts`, `session_proxy_facade.ts`, `network/reconnect_manager.ts`, `turn_loop.ts` và 3 tệp Client Store: `lobby_store.ts`, `lobby_types.ts`, `game_store_subtypes.ts`) sang sử dụng `domain/index.js` và `domain/bot/index.js` để khóa kín 100% bề mặt gọi từ bên ngoài vào `src/domain/bot/`.

### Sổ Theo Dõi Nợ Kỹ Thuật (Tech Debt Watch)
- ⚠️ **Theo dõi mật độ LOC Tier 1 (`src/server/room_manager.ts`)** [`DEBT-SRV-395A`]: Nhờ hợp nhất các dòng import qua `../domain/index.js`, tệp [`src/server/room_manager.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts) đã giảm từ **350 LOC xuống 344 LOC** (303 SLOC), rút khỏi ngưỡng vùng đệm đỏ `>= 350 LOC`. Tuy nhiên, nếu các ticket nghiệp vụ tương lai bổ sung thêm phương thức mới vào `RoomManager`, cần ưu tiên ủy quyền sang các coordinator chuyên biệt (`room_property_coordinator.ts`, `room_trade_coordinator.ts`, `room_manager_lifecycle.ts`).
- ⚠️ **Theo dõi mật độ LOC Tier 1 (`src/domain/room.ts` & `src/server/room_manager_lifecycle.ts`)** [`DEBT-DOM-395B`]: Tệp [`src/domain/room.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/room.ts) hiện ở mức **339/400 LOC** (315 SLOC) và [`src/server/room_manager_lifecycle.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager_lifecycle.ts) đã giảm từ **335 xuống 330/400 LOC** (304 SLOC). Cả hai tệp đều nằm dưới vùng đệm đỏ `>= 350 LOC` nhưng cần giữ kỷ luật không nhồi nhét logic mới trực tiếp.
