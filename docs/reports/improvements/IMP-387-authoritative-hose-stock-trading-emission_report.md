# BÁO CÁO NGHIỆM THU HOÀN THÀNH TICKET IMP-387
## Plan IMP-387: Authoritative HOSE Stock Trading Emission & Client Zero-Heuristic Dispatch (Ticket IMP-387)

> **Mã Ticket:** `IMP-387`  
> **Phân hệ thực tế:** `client-events`  
> **Ngày hoàn thành:** 2026-10-13  
> **Quy trình:** Closed-Loop 4-Station Pipeline (Tuân thủ nghiêm ngặt Hiến pháp AGENTS CONSTITUTION)  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED**

---

## 1. TỔNG QUAN & BỐI CẢNH VẤN ĐỀ

Trước ticket IMP-387, các sự kiện khớp lệnh đầu tư cổ phiếu sàn HOSE trên client được phát hiện thông qua cơ chế suy đoán (heuristic) dựa vào chênh lệch số dư kết hợp dữ liệu phụ `delta.lastHoseResult`. Khi phát sinh nhiều biến động tài chính trong cùng một nhịp (tick), ví dụ người chơi chịu lỗ khớp lệnh HOSE (-1.000) đồng thời nhận thưởng hoặc qua ô GO nhận lương (+1.500), cơ chế cấn trừ delta gây ra hiện tượng va chạm (Netting Collision) làm dương hóa biến động hoặc không tìm thấy người chịu chi phí, dẫn đến mất dấu sự kiện HOSE và kích hoạt thông báo thuế phạt oan uổng (`FEE_PAID: TAX`). Ngoài ra, do `room.lastHoseResult` tồn tại qua nhiều tick sau khi kết thúc lượt gieo, client dễ bị lặp lại sự kiện (duplicate emission) khi nhận các gói delta tiếp theo.

Gói cải tiến IMP-387 giải quyết dứt điểm các vấn đề trên bằng cách:
1. **Chuyển đổi sang mô hình sự kiện có thẩm quyền từ máy chủ**: Hàm `handleHoseInvest` tại máy chủ trực tiếp phát thải sự kiện chuẩn `HOSE_SETTLED` vào `room.pendingDomainEvents`.
2. **Khử suy đoán tại Client**: Client trích xuất sự kiện `HOSE_SETTLED` từ `domainEvents`, đồng bộ chuỗi khóa `${playerId}_${timestamp}_${roll}_${diceSeq ?? 0}` với `delta.lastHoseResult` để miễn nhiễm hoàn toàn trước tình trạng double emission trên chuỗi multi-tick.
3. **Triệt tiêu Netting Collision**: Xuất khẩu và tái sử dụng helper dùng chung `restoreDeltaOutflow` để tái cân bằng dòng tiền giữa `payers` và `receivers`, triệt tiêu dứt điểm hiện tượng va chạm cấn trừ tài chính.

---

## 2. BẢNG TỔNG HỢP BẰNG CHỨNG QUY TRÌNH 4 TRẠM KHÉP KÍN

| Trạm Kiểm Soát | Vai Trò & Tệp Bằng Chứng | Chỉ Số Đạt Được | Kết Quả Thẩm Định |
| :--- | :--- | :--- | :---: |
| **Stage 0: Plan Review** | `adversarial-challenger` & `audit_plan.mjs`<br>[`.agents/audit/PLAN_AUDIT_IMP-387.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-387.md) | Thẩm định kế hoạch đạt 0 defects, 8 contract tests clean. | **HARDENED_APPROVED 🛡️** |
| **Trạm 1: RED Contract Test** | `qa-tester`<br>[`tests/client/imp387_authoritative_hose_emission.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp387_authoritative_hose_emission.test.ts) | 8 atomic tests, 24 asserts, 0 loops. Adversarial Inversion: Đã chứng minh RED runtime | **VERIFIED RED** 🎯 |
| **Trạm 2: GREEN Implementation** | `implementer`<br>[`.agents/evidence/chaos_sentinel_IMP-387.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_IMP-387.json) | 5 production files modified, 100% tests chuyển sang GREEN | **VERIFIED GREEN** 🟢 |
| **Trạm 2.5: Fast Pre-Filter** | `scout` & `fast_prefilter.mjs` | Typecheck `tsc --noEmit` exit 0, 0 dirty casts (`as any`), LOC budgets đạt chuẩn | **100% PASS** 🚀 |
| **Trạm 3.1: Spec & Scope Gate** | `spec-reviewer`<br>[`.agents/audit/SPEC_REVIEW_IMP-387.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-387.md) | 100% Plan fidelity, zero scope creep, kiểm soát ranh giới phân hệ `client-events` | **APPROVED** 📋 |
| **Trạm 3.2: Architecture & Anti-Slop** | `code-reviewer`<br>[`.agents/audit/CODE_REVIEW_IMP-387.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-387.md) | 0 Slop red flags, Zero TIDD, an toàn bộ nhớ/timer, assertion density 3.00 | **APPROVED** 🛡️ |
| **Trạm 4: Chaos & Mutation Sentinel** | `chaos-sentinel`<br>[`scripts/check_evidence.mjs`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/check_evidence.mjs) | 15/15 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived). | **APPROVED 💥** |

---

## 3. KẾT QUẢ VẬN HÀNH 4 TRẠM KHÉP KÍN & PHẢN HỒI THẨM ĐỊNH (AUDIT & SUBAGENT FEEDBACK)

### Trạm 0: Thẩm Định Đối Kháng Kế Hoạch (`adversarial-challenger` & `audit_plan.mjs`)
- **Phán quyết**: **HARDENED_APPROVED 🛡️**
- **Nhật ký thẩm tra**: Thẩm định kế hoạch đạt 0 defects, 8 contract tests clean.
- **Điểm mù kiến trúc / phản biện đối kháng đã giải tỏa**:
  - **[ADV-OBJ] Objective Validity**
    - **Target reachable?**: **Yes**.
    - **Baselines verified?**: **Yes** (100% verified against physical disk):
      - `src/domain/room.ts`: 308 LOC baseline
      - `src/server/hose_actions.ts`: 46 LOC baseline
      - `src/client/events/game_event_hose_helpers.ts`: 57 LOC baseline
      - `src/client/events/game_event_bond_helpers.ts`: 140 LOC baseline
      - `src/client/events/game_event_financial_helpers.ts`: 210 LOC baseline
    - **Physical surface area exhausted?**: **Verified**.
    - **Verdict**: **PASS**.
  - **[ADV-01] Multi-Tick Fallthrough Duplicate Emission & Stale Result Replay Hazard**
    - **Vector**: Concurrency & Trapped States (Vectors 2 & 3).
    - **Scenario**: In `src/server/hose_actions.ts`, `handleHoseInvest` sets `room.lastHoseResult = hoseResult` and transitions to `TurnPhase.PropertyManagement`. Tick 1 broadcast transmits delta containing both `domainEvents: [HOSE_SETTLED]` and `lastHoseResult`. Tick 1 extracts the event but previously did not sync `lastProcessedHoseKey`. On Tick 2, `delta.lastHoseResult` remains attached while `domainEvents` is absent, causing the legacy fallback path to re-emit the identical trade.
    - **Consequence**: Duplicate floating badges and activity log spam on every HOSE transaction in production; regression on living test suite.
    - **Hardening Directive**: In `src/client/events/game_event_hose_helpers.ts`, ensure `serverEvents` updates `lastProcessedHoseKey = `${ev.playerId}_${ev.timestamp}_${ev.roll}_${ev.diceSeq ?? 0}`` AND synchronizes with `delta.lastHoseResult` so that subsequent ticks carrying stale `delta.lastHoseResult` exit immediately with `[]`.
  - **[ADV-02] Broken Netting Arithmetic on Positive Differential Fallthrough (`newDiff > 0`)**
    - **Vector**: Full Branch Path Trace & Logic Fallthrough (Vector 5, `[ADV-BRANCH]`).
    - **Scenario**: When a player incurs a HOSE loss (-1,000) while simultaneously experiencing an inflow (+1,500) and another minor fee (-800) in the same tick:
      ```typescript
      // Net initial delta = -1,000 + 1,500 - 800 = -300
      // If code simply adds 1000 to payers[payIdx].diff:
      // payers[payIdx].diff = -300 + 1000 = +700 (trapped in payers!)
      ```
      The player remains trapped in `payers` with a positive differential (`+700`), causing downstream salary and rent matchers to miss the inflow and falsely announce tax penalties.
    - **Consequence**: Positive balance deltas get trapped in `payers`, triggering spurious tax announcements.
    - **Hardening Directive**: Export and reuse `restoreDeltaOutflow` from `src/client/events/game_event_financial_helpers.ts`. When `newDiff > 0`, cleanly splice the entry from `payers` and push to `receivers` while preserving `cellIndex`, `prevP`, `hasPassedGo`, and `isSentToAudit`.
  - **[ADV-03] Loose "Bag of Optionals" Interface Violates Discriminated Union & Type Safety**
    - **Vector**: Unstated Assumptions & Subsystem Drift (Vector 4).
    - **Scenario**: Making all fields optional across `ServerDomainEvent` breaks compile-time exhaustiveness:
      ```typescript
      export type ServerDomainEvent =
        | BondRepaidServerEvent
        | BondDefaultServerEvent
        | HoseSettledServerEvent;
      ```
      Without a discriminated union, `HOSE_SETTLED` could emit missing fields without compiler warnings, forcing downstream consumers into defensive nullish coalescing and violating Universal Iron Law #1.
    - **Consequence**: Loss of compile-time exhaustiveness; risk of runtime `NaN` propagation.
    - **Hardening Directive**: Define `ServerDomainEvent` in `src/domain/room.ts` as a strict Discriminated Union with dedicated sub-types (`BondRepaidServerEvent`, `BondDefaultServerEvent`, `HoseSettledServerEvent`).
  - **[ADV-04] Asymmetrical Restitution in Legacy Fallback Branch**
    - **Vector**: Full Branch Path Trace & Living Contract Regression (Vectors 5 & 6, `[ADV-REG]`).
    - **Scenario**: Fixing Netting Collision only for `serverEvents` while leaving the `delta.lastHoseResult` fallback branch with unmitigated arithmetic:
      ```typescript
      // Asymmetric fallback causes regression on legacy deltas
      restoreDeltaOutflow(playerId, loss, payers, receivers);
      ```
      When legacy fixtures without `domainEvents` execute, concurrent GO salary triggers spurious tax events.
    - **Consequence**: Inconsistent behavior between authoritative and fallback paths; latent regression on test mocks.
    - **Hardening Directive**: Route both authoritative `serverEvents` and `delta.lastHoseResult` fallback through the identical `restoreDeltaOutflow(playerId, loss, payers, receivers)` helper.
  - **[ADV-05] Living Test Coverage Gap for Stale Multi-Tick Sequence**
    - **Vector**: Living Test Collision & Verification Invariant (Vector 6).
    - **Scenario**: Isolated single-tick tests fail to expose stale `delta.lastHoseResult` replay across multi-tick turn progressions.
    - **Consequence**: Blind spot in test coverage allowing duplicate event emissions to slip past CI.
    - **Hardening Directive**: Add explicit contract test `TC-387.08 [UC-HOSE-MULTI-TICK-STALE-RESULT-IMMUNITY/MSS]` verifying that Tick 1 with `domainEvents` + `lastHoseResult` followed by Tick 2 with stale `lastHoseResult` returns `[]`.

### Trạm 1: Bộ Kiểm Thử Hợp Đồng Độc Lập (`qa-tester`)
- **Tệp kiểm thử hợp đồng**: [`tests/client/imp387_authoritative_hose_emission.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp387_authoritative_hose_emission.test.ts)
- **Chỉ số kiểm thử**: **8 atomic tests**, **24 asserts** (mật độ trung bình: 3.00 asserts/test, 0 vòng lặp).
- **Adversarial Inversion Gate**:
  - Trạng thái: **Semantic Behavioral RED Verified (Thất bại do vi phạm ràng buộc runtime assertion khi chưa cập nhật code, không lỗi cú pháp)**.

### Trạm 2: Triển Khai Mã Nguồn Tối Thiểu (`implementer`)
- **Tệp mã nguồn thay đổi**:
  - [`src/client/events/game_event_bond_helpers.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/game_event_bond_helpers.ts)
  - [`src/client/events/game_event_financial_helpers.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/game_event_financial_helpers.ts)
  - [`src/client/events/game_event_hose_helpers.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/game_event_hose_helpers.ts)
  - [`src/domain/room.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/room.ts)
  - [`src/server/hose_actions.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/hose_actions.ts)
- **Chuyển trạng thái**: Toàn bộ **8/8 contract tests chuyển sang GREEN**.
- **Living Test Suites**: Bảo toàn nguyên vẹn, zero hồi quy logic hiện hành.

### Trạm 2.5: Fast Pre-Filter Mechanical Sweep (`scout` / `fast_prefilter.mjs`)
- **TypeScript**: `tsc --noEmit` vượt qua với 0 lỗi (Exit Code 0).
- **Dirty Casts**: Tuyệt đối không sử dụng `as any` hoặc dirty type casting.
- **LOC Ceilings**: Tất cả các tệp đều nằm trong hạn mức trần của từng phân hệ (Tier 1 <= 400, Tier 2 <= 500, Tier 3 <= 800, Test <= 600).

### Trạm 3: Thẩm Định Độc Lập Từ Đĩa Vật Lý (Independent Station 3 Reviews)
1. **Spec & Scope Gatekeeper (`spec-reviewer`)**:
    - **Phán quyết**: **APPROVED** 📋
    - **Xác nhận phạm vi**: 100% các thay đổi nằm trong phân hệ mục tiêu (`client-events`), zero scope creep.
2. **Deep Architecture & Anti-Slop Auditor (`code-reviewer`)**:
    - **Phán quyết**: **APPROVED** 🛡️
    - **Chỉ số Anti-Slop**: 0 violations trên 6 cờ cảnh báo (Deep modules, Zero pass-through wrappers, Zero TIDD).
    - **Bộ nhớ & Timer**: Không rò rỉ listener, không bỏ sót timer cleanup, an toàn đa luồng/bất đồng bộ.

### Trạm 4: Cơ Chế Biên & Tiêu Diệt Biến Dị (`chaos-sentinel`)
- **Phán quyết**: **APPROVED 💥**
- **Hiệu quả kiểm soát**: 15/15 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived).
- **Xác nhận**: Đã vượt qua kiểm toán cơ học `node scripts/check_evidence.mjs` với 0 defects.

---

## 4. THỐNG KÊ BIẾN ĐỘNG DÒNG MÃ (LOC ACCOUNTING)

### 4.1. Phạm Vi Trực Tiếp Của Ticket IMP-387 (Direct Scope)

| Tệp Mã Nguồn | Đường Dẫn | Phân Hệ / Tier | LOC Thực Tế (SLOC) | Dòng Vật Lý (Disk) | Ngân Sách Trần | Trạng Thái |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `game_event_bond_helpers.ts` | [`src/client/events/game_event_bond_helpers.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/game_event_bond_helpers.ts) | Tier 1 (Domain/Server/Logic) | **102 SLOC** | 110 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `game_event_financial_helpers.ts` | [`src/client/events/game_event_financial_helpers.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/game_event_financial_helpers.ts) | Tier 1 (Domain/Server/Logic) | **206 SLOC** | 230 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `game_event_hose_helpers.ts` | [`src/client/events/game_event_hose_helpers.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/game_event_hose_helpers.ts) | Tier 1 (Domain/Server/Logic) | **78 SLOC** | 88 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `room.ts` | [`src/domain/room.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/room.ts) | Tier 1 (Domain/Server/Logic) | **301 SLOC** | 327 Lines | <= 400 LOC | ⚠️ Safe (< 350 buffer zone) |
| `hose_actions.ts` | [`src/server/hose_actions.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/hose_actions.ts) | Tier 1 (Domain/Server/Logic) | **55 SLOC** | 57 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `imp387_authoritative_hose_emission.test.ts` | [`tests/client/imp387_authoritative_hose_emission.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp387_authoritative_hose_emission.test.ts) | Living Test | **284 SLOC** | 322 Lines | <= 600 LOC | ✅ Đạt chuẩn |

---

## 5. ĐÁNH GIÁ VẬN HÀNH & BÀN GIAO TIẾP THEO

- **Tính toàn vẹn hệ thống**: Gói cải tiến hoàn thành theo đúng nguyên tắc Zero-Blindness, cung cấp đầy đủ bằng chứng vật lý từ mã nguồn, kiểm thử hợp đồng và báo cáo kiểm toán độc lập.
- **Sẵn sàng triển khai**: Mã nguồn đã sẵn sàng đóng gói và triển khai lên môi trường sản phẩm.

### Sổ Theo Dõi Nợ Kỹ Thuật (Tech Debt Watch)
- ⚠️ **Cảnh báo trần LOC Tier 1 (Domain/Server/Logic)** [`DEBT-ROOM-01`]: Tệp [`src/domain/room.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/room.ts) hiện đạt **327/400 LOC** (khoảng cách an toàn còn 73 dòng trước trần tử thần). Tệp này thuần túy chứa các Type Interface của phòng chơi (Room, PlayerState, AuctionSession, BondContract, ServerDomainEvent). Khi tiếp cận vùng đệm 350 LOC, phương án xử lý nợ kỹ thuật là trích xuất các sub-interface (như `room_auction_types.ts`, `room_contract_types.ts`) sang tệp chuyên biệt thay vì giữ tập trung.
