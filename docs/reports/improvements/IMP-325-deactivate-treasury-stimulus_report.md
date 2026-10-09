# BÁO CÁO NGHIỆM THU HOÀN THÀNH TICKET IMP-325
## Plan IMP-325: Deactivate Treasury Public Stimulus in Domain & Server Loop

> **Mã Ticket:** `IMP-325`  
> **Phân hệ thực tế:** `domain-core`  
> **Ngày hoàn thành:** 2026-10-09  
> **Quy trình:** Closed-Loop 4-Station Pipeline (Tuân thủ nghiêm ngặt Hiến pháp AGENTS CONSTITUTION)  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED**

---

## 1. TỔNG QUAN & BỐI CẢNH VẤN ĐỀ

Triển khai gói hoàn thiện và đồng bộ kỹ thuật cho ticket `IMP-325` thuộc phân hệ `domain-core`.

- **Mục tiêu kỹ thuật**:
  - Bảo toàn 100% logic nghiệp vụ cốt lõi và các ràng buộc FSM/Domain.
  - Bảo vệ tính bất biến của FSM state machine và kho bạc kinh tế, 100% đối xứng giữa Wire và Core.
  - Tuân thủ nghiêm ngặt các ranh giới kiểm thử, Zero Dirty Casts (`as any`), và các trần giới hạn LOC.

---

## 2. BẢNG TỔNG HỢP BẰNG CHỨNG QUY TRÌNH 4 TRẠM KHÉP KÍN

| Trạm Kiểm Soát | Vai Trò & Tệp Bằng Chứng | Chỉ Số Đạt Được | Kết Quả Thẩm Định |
| :--- | :--- | :--- | :---: |
| **Stage 0: Plan Review** | `plan-griller` / Máy duyệt<br>[`.agents/audit/PLAN_AUDIT_IMP-325.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-325.md) | Thẩm định kế hoạch đạt 0 defects, 4 contract tests clean. | **HARDENED_APPROVED 🛡️** |
| **Trạm 1: RED Contract Test** | `qa-tester`<br>[`tests/server/imp325_treasury_stimulus_deactivation.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/server/imp325_treasury_stimulus_deactivation.test.ts) | 8 atomic tests, 12 asserts, 0 loops. Adversarial Inversion: Đã chứng minh RED runtime | **VERIFIED RED** 🎯 |
| **Trạm 2: GREEN Implementation** | `implementer`<br>[`.agents/evidence/chaos_sentinel_IMP-325.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_IMP-325.json) | 2 production files modified, 100% tests chuyển sang GREEN | **VERIFIED GREEN** 🟢 |
| **Trạm 2.5: Fast Pre-Filter** | `scout` & `fast_prefilter.mjs` | Typecheck `tsc --noEmit` exit 0, 0 dirty casts (`as any`), LOC budgets đạt chuẩn | **100% PASS** 🚀 |
| **Trạm 3.1: Spec & Scope Gate** | `spec-reviewer`<br>[`.agents/audit/SPEC_REVIEW_IMP-325.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-325.md) | 100% Plan fidelity, zero scope creep, kiểm soát ranh giới phân hệ `domain-core` | **APPROVED** 📋 |
| **Trạm 3.2: Architecture & Anti-Slop** | `code-reviewer`<br>[`.agents/audit/CODE_REVIEW_IMP-325.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-325.md) | 0 Slop red flags, Zero TIDD, an toàn bộ nhớ/timer, assertion density 1.50 | **APPROVED** 🛡️ |
| **Trạm 4: Chaos & Mutation Sentinel** | `chaos-sentinel`<br>[`scripts/check_evidence.mjs`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/check_evidence.mjs) | 25/25 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived). | **APPROVED 💥** |

---

## 3. KẾT QUẢ VẬN HÀNH 4 TRẠM KHÉP KÍN & PHẢN HỒI THẨM ĐỊNH (AUDIT & SUBAGENT FEEDBACK)

### Trạm 0: Thẩm Định Đối Kháng Kế Hoạch (`plan-griller` / `adversarial-challenger`)
- **Phán quyết**: **HARDENED_APPROVED 🛡️**
- **Nhật ký thẩm tra**: Thẩm định kế hoạch đạt 0 defects, 4 contract tests clean.
- **Điểm mù kiến trúc / phản biện đối kháng đã giải tỏa**:
  - **[ADV-OBJ] Objective Validity**
    - **Target reachable?**: Yes — `processTreasuryStimulus` is called in [turn_loop.ts#L162](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/turn_loop.ts#L162) inside `advanceRoundBoundary(room, rng)`. `advanceRoundBoundary` fires under normal runtime conditions upon round wrap in [turn_loop.ts#L266](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/turn_loop.ts#L266) (`nextIdx <= currentIdx || nextIdx === 0`) and in [insolvency_manager.ts#L286](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/insolvency_manager.ts#L286) during post-bankruptcy round wrap. In production, whenever `room.treasury >= 10,000`, 20% of public funds were systematically distributed to the poorest 1–2 players at every round boundary. This matches the user's explicit report: *"Tôi thấy chức năng nhà nước khi có trên 20k sẽ phát tiền lợi tức nên bỏ hoặc deactivate đi"*.
    - **Baselines verified?**: Yes — All physical constants and parameters verified from disk:
    - **Verdict**: PASS
  - **[ADV-01] Economic Invariant & Treasury Sink Longevity**
    - **Vector**: Exploits & Economic Arbitrage / Economic Balance
    - **Scenario**: When `ENABLE_TREASURY_STIMULUS` is deactivated, funds flowing into the Treasury (property land taxes via `turn_loop.ts#L94`, property maintenance fees via `turn_loop_maintenance.ts#L22`, audit bails & penalties via `audit_manager.ts#L73, L132`, bond interest via `bond_manager.ts#L154`, and auction foreclosures via `auction_manager.ts#L216, L223`) accumulate in `room.treasury` without the 20% round flush.
    - **Consequence**:
    - **Hardening Directive**: Maintain strict architectural decoupling between the global round-boundary stimulus policy and localized event-card/transit-wheel drains. Ensure no auxiliary drain handlers import or rely on `ENABLE_TREASURY_STIMULUS`.
  - **[ADV-02] Living Contract Regression Immunity (ADV-REG)**
    - **Vector**: Living Test Collision & Contract Regression
    - **Scenario**: The project has 20 living contract tests in [imp114_treasury_public_stimulus.test.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/domain/imp114_treasury_public_stimulus.test.ts). If an implementer placed `if (!ENABLE_TREASURY_STIMULUS) return null;` directly inside the pure function `processTreasuryStimulus`, all 20 tests would fail instantly due to returned nulls on test cases expecting active disbursements.
    - **Consequence**: Unmitigated test breakage across living domain contracts, violating Station 1/2 regression invariants.
    - **Hardening Directive**: The plan must strictly preserve `processTreasuryStimulus(room: Room)` as a pure calculation function without internal toggle guards. The toggle guard `if (ENABLE_TREASURY_STIMULUS)` must reside solely at the execution coordinator boundary in [turn_loop.ts#L161-L163](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/turn_loop.ts#L161-L163). All 20 tests in `imp114` will continue to pass deterministically.
  - **[ADV-03] Symmetric State Exit Invariant (Centralized Round Boundary)**
    - **Vector**: Concurrency, Re-entrancy & Symmetric State Exit
    - **Scenario**: Round transitions in VTcoon occur through two distinct pathways:
    - **Consequence**: If stimulus deactivation were placed in `executeTurnEnd` rather than `advanceRoundBoundary`, bankruptcy-triggered round wraps would bypass the guard and continue distributing stimulus funds, causing an asymmetric state anomaly.
    - **Hardening Directive**: The guard must remain strictly centralized inside `advanceRoundBoundary` in [turn_loop.ts#L158-L163](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/turn_loop.ts#L158-L163). Because `insolvency_manager.ts` delegates directly to `advanceRoundBoundary`, both normal turn ends and post-bankruptcy wraps are guaranteed symmetric deactivation without touching `insolvency_manager.ts`.
  - **[ADV-04] Subsystem Boundary & Zero Smuggled Presentation Changes**
    - **Vector**: Subsystem Drift & Strict Pure-Move Quarantine
    - **Scenario**: [activity_rent_matcher.ts#L239](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/activity_rent_matcher.ts#L239) contains the string `'(Quỹ ≥10k Tr. ➔ 20% hộ nghèo)'` displayed when a negative treasury delta is matched with receiver balance increases. An implementer might attempt to modify `activity_rent_matcher.ts` in this ticket.
    - **Consequence**: Violates the micro-slice confinement boundary (mixing Tier 2 client-network presentation into a Tier 1 domain-core/server-network ticket).
    - **Hardening Directive**: Do NOT modify `activity_rent_matcher.ts` in ticket `IMP-325`. Since the server no longer dispatches negative treasury deltas at round boundaries, the client presentation branch naturally stays dormant during turn progression. Any string cleanups or presentation refactors must be isolated to a separate UI polish ticket.

### Trạm 1: Bộ Kiểm Thử Hợp Đồng Độc Lập (`qa-tester`)
- **Tệp kiểm thử hợp đồng**: [`tests/server/imp325_treasury_stimulus_deactivation.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/server/imp325_treasury_stimulus_deactivation.test.ts)
- **Chỉ số kiểm thử**: **8 atomic tests**, **12 asserts** (mật độ trung bình: 1.50 asserts/test, 0 vòng lặp).
- **Adversarial Inversion Gate**:
  - Trạng thái: **Semantic Behavioral RED Verified (Thất bại do vi phạm ràng buộc runtime assertion khi chưa cập nhật code, không lỗi cú pháp)**.
  - **Bằng chứng thất bại (Failure Snippet)**:
```text
AssertionError: expected undefined to be false // Object.is equality
 ❯ tests/server/imp325_treasury_stimulus_deactivation.test.ts:40:20
     expect(toggle).toBe(false);
AssertionError: expected 40000 to be 50000 // Object.is equality
 ❯ tests/server/imp325_treasury_stimulus_deactivation.test.ts:49:27
     expect(room.treasury).toBe(50_000);
AssertionError: expected 6000 to be 1000 // Object.is equality
 ❯ tests/server/imp325_treasury_stimulus_deactivation.test.ts:58:24
     expect(p1.balance).toBe(1_000);
AssertionError: expected 7000 to be 2000 // Object.is equality
 ❯ tests/server/imp325_treasury_stimulus_deactivation.test.ts:67:24
     expect(p2.balance).toBe(2_000);
AssertionError: expected 8000 to be 10000 // Object.is equality
 ❯ tests/server/imp325_treasury_stimulus_deactivation.test.ts:76:27
     expect(room.treasury).toBe(10_000);
AssertionError: expected 32000 to be 50000 // Object.is equality
 ❯ tests/server/imp325_treasury_stimulus_deactivation.test.ts:86:27
     expect(room.treasury).toBe(50_000);
AssertionError: expected 40000 to be 50000 // Object.is equality
 ❯ tests/server/imp325_treasury_stimulus_deactivation.test.ts:96:27
     expect(room.treasury).toBe(50_000);
```

### Trạm 2: Triển Khai Mã Nguồn Tối Thiểu (`implementer`)
- **Tệp mã nguồn thay đổi**:
  - [`src/domain/treasury_stimulus.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/treasury_stimulus.ts)
  - [`src/server/turn_loop.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/turn_loop.ts)
- **Chuyển trạng thái**: Toàn bộ **8/8 contract tests chuyển sang GREEN**.
- **Living Test Suites**: Bảo toàn nguyên vẹn, zero hồi quy logic hiện hành.

### Trạm 2.5: Fast Pre-Filter Mechanical Sweep (`scout` / `fast_prefilter.mjs`)
- **TypeScript**: `tsc --noEmit` vượt qua với 0 lỗi (Exit Code 0).
- **Dirty Casts**: Tuyệt đối không sử dụng `as any` hoặc dirty type casting.
- **LOC Ceilings**: Tất cả các tệp đều nằm trong hạn mức trần của từng phân hệ (Tier 1 <= 400, Tier 2 <= 500, Tier 3 <= 800, Test <= 600).

### Trạm 3: Thẩm Định Độc Lập Từ Đĩa Vật Lý (Independent Station 3 Reviews)
1. **Spec & Scope Gatekeeper (`spec-reviewer`)**:
   - **Phán quyết**: **APPROVED** 📋
   - **Xác nhận phạm vi**: 100% các thay đổi nằm trong phân hệ mục tiêu (`domain-core`), zero scope creep.
2. **Deep Architecture & Anti-Slop Auditor (`code-reviewer`)**:
   - **Phán quyết**: **APPROVED** 🛡️
   - **Chỉ số Anti-Slop**: 0 violations trên 6 cờ cảnh báo (Deep modules, Zero pass-through wrappers, Zero TIDD).
   - **Bộ nhớ & Timer**: Không rò rỉ listener, không bỏ sót timer cleanup, an toàn đa luồng/bất đồng bộ.


### Trạm 4: Cơ Chế Biên & Tiêu Diệt Biến Dị (`chaos-sentinel`)
- **Phán quyết**: **APPROVED 💥**
- **Hiệu quả kiểm soát**: 25/25 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived).
- **Xác nhận**: Đã vượt qua kiểm toán cơ học `node scripts/check_evidence.mjs` với 0 defects.

---

## 4. THỐNG KÊ BIẾN ĐỘNG DÒNG MÃ (LOC ACCOUNTING)

### 4.1. Phạm Vi Trực Tiếp Của Ticket IMP-325 (Direct Scope)

| Tệp Mã Nguồn | Đường Dẫn | Phân Hệ / Tier | LOC Thực Tế | Ngân Sách Trần | Trạng Thái |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `treasury_stimulus.ts` | [`src/domain/treasury_stimulus.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/treasury_stimulus.ts) | Tier 1 (Domain/Server/Logic) | **43 LOC** | <= 400 LOC | ✅ Đạt chuẩn |
| `turn_loop.ts` | [`src/server/turn_loop.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/turn_loop.ts) | Tier 1 (Domain/Server/Logic) | **288 LOC** | <= 400 LOC | ✅ Đạt chuẩn |
| `imp325_treasury_stimulus_deactivation.test.ts` | [`tests/server/imp325_treasury_stimulus_deactivation.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/server/imp325_treasury_stimulus_deactivation.test.ts) | Living Test | **149 LOC** | <= 600 LOC | ✅ Đạt chuẩn |

---

## 5. ĐÁNH GIÁ VẬN HÀNH & BÀN GIAO TIẾP THEO

- **Tính toàn vẹn hệ thống**: Gói cải tiến hoàn thành theo đúng nguyên tắc Zero-Blindness, cung cấp đầy đủ bằng chứng vật lý từ mã nguồn, kiểm thử, hình ảnh trực quan đến biên bản kiểm toán độc lập.
- **Sẵn sàng triển khai**: Mã nguồn đã sẵn sàng đóng gói và triển khai lên môi trường sản phẩm.

