# BÁO CÁO HOÀN THÀNH CẢI TIẾN: IMP-247
# UTILITY MONOPOLY UPGRADE REQUIREMENT & P2P INCENTIVE ALIGNMENT
# (Yêu cầu Độc Quyền Tiện Ích & Cân Bằng Cơ Chế Đàm Phán / Trao Đổi Song Phương P2P)

> **Mã Ticket**: `IMP-247`  
> **Tiêu đề**: Utility Monopoly Upgrade Requirement & P2P Incentive Alignment  
> **Phân loại**: Tier 2 (Full Rigor — FSM Intent, Economic Rules, Concurrency Locks, 7 Physical Files)  
> **Ngày hoàn thành**: 2026-10-03  
> **Trạng thái**: ✅ **HOÀN THÀNH TOÀN DIỆN (100% GATES APPROVED)**  
> **Tài liệu Kế hoạch**: [`docs/plans/improvements/IMP-247-utility-monopoly-upgrade-requirement_plan.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/plans/improvements/IMP-247-utility-monopoly-upgrade-requirement_plan.md)  
> **Bằng chứng Station 4**: [`.agents/evidence/chaos_sentinel_imp247.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_imp247.json) (`verdict: APPROVED`)  
> **Tài liệu SSOT**: [`docs/domain/entity_model.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/entity_model.md) (§2.5), [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md) (Gotcha #37)

---

## 1. TỔNG QUAN & BỐI CẢNH CẢI TIẾN

Từ phản biện kinh tế và kiểm toán thực nghiệm mã nguồn trước cải tiến, phát hiện 2 bất cập lớn về cân bằng động lực trong nhóm ô Tiện ích (Ô 12 EVN và Ô 28 Viettel):

1. **Nghịch lý giá trị độc quyền (Monopoly ROI Paradox)**:
   - Trước đây, khi sở hữu cả 2 ô tiện ích, tiền thuê là 2.500 Tr. VNĐ.
   - Nhưng người chơi chỉ cần sở hữu 1 ô lẻ rồi bỏ 1.000 Tr. VNĐ nâng cấp ngay thành Smart Grid / 5G, tiền thuê lập tức vọt lên **3.500 Tr. VNĐ** (cao hơn 1.000 Tr. so với việc kỳ công gom đủ 2 ô).
   - Điều này triệt tiêu hoàn toàn động lực tích lũy trọn bộ tiện ích và vô hiệu hóa nhu cầu đàm phán P2P Trade/Swap.
2. **Khai thác chốt lời phi đối xứng (Arbitrage Cashout Exploit)**:
   - Người chơi có thể sở hữu 2 ô, nâng cấp ô 12 (1.000 Tr.), sau đó thế chấp ô 28 để rút 750 Tr. VNĐ tiền mặt, nhưng ô 12 vẫn thu cước tối đa 3.500 Tr. VNĐ mà không chịu tổn thất rủi ro.
3. **Lỗ hổng tương tranh đàm phán (Trade Concurrency Hazard)**:
   - Kiểm tra `handleUpgradeUtility` trước đây chỉ khóa ô hiện tại nếu nằm trong `pendingTradeOffer`, cho phép người chơi nâng cấp ô đối tác trong lúc đang gửi lời mời giao dịch chéo.

---

## 2. GIẢI PHÁP ĐÃ TRIỂN KHAI THEO 4 TRẠM KHÉP KÍN

### 2.1. Trạm 1 & 2: Domain FSM, Economic Defense & Server Concurrency
- [`src/domain/action_reasons.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/action_reasons.ts): Khai báo mã lý do từ chối `NEED_ALL_UTILITIES`.
- [`src/domain/i18n/vi.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/i18n/vi.ts): Bản địa hóa: `"Cần sở hữu trọn bộ cả 2 Tiện ích (EVN & Viettel)"`.
- [`src/client/ui/actionable_notification.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/actionable_notification.ts): Bổ sung cấu hình Actionable Notification với icon `⚡`, hướng dẫn người chơi đàm phán P2P đổi chéo.
- [`src/domain/property_upgrade.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_upgrade.ts):
  - Hàm `upgradeUtilityFull` kiểm tra `s.isUpgradedUtility` trước (`MAX_LEVEL`), sau đó bắt buộc `UTILITY_CELLS.every(...)` thuộc quyền sở hữu của người chơi (`NEED_ALL_UTILITIES`).
  - Kiểm tra bất biến thế chấp qua cả `stateMap` lẫn `player.mortgagedProperties` (`GROUP_MORTGAGED`).
- [`src/domain/property_rent.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_rent.ts):
  - Hàm `calcUtilityFee` tính số lượng ô sạch `unmortgagedOwned`.
  - Cơ chế **Rent De-escalation Fallback**: cước 3.500 Tr. VNĐ CHỈ được thu khi duy trì trọn bộ 2 ô sạch (`hasMonopoly === true`). Nếu một ô bị thế chấp hoặc chuyển nhượng, cước tự động giải trừ về 1.000 Tr. VNĐ.
- [`src/server/property_actions.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/property_actions.ts):
  - Mở rộng khóa `ASSET_LOCKED` cho toàn bộ `UTILITY_CELLS` khi có bất kỳ ô tiện ích nào nằm trong `pendingTradeOffer`.
  - Xuất hàm `validateP2PTrade` phục vụ kiểm thử hợp đồng và bảo đảm cấm giao dịch ô đã nâng cấp (`PROPERTY_HAS_BUILDING`).

### 2.2. Client Affordance & UI Consistency
- [`src/client/ui/modals/title_deed_affordance.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/title_deed_affordance.ts):
  - Nhận diện chính xác trạng thái sở hữu cả 2 tiện ích và tình trạng thế chấp với **zero dirty casts** (dùng type narrowing `'ownedProperties' in params.myPlayer`).
  - Hiển thị tooltip chuẩn: `"Cần sở hữu trọn bộ cả 2 Tiện ích (EVN & Viettel) để nâng cấp"` hoặc `"Không thể nâng cấp khi có Tiện ích đang bị thế chấp"`.

### 2.3. SSOT Documentation & Gotchas Invariant
- [`docs/domain/entity_model.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/entity_model.md): Cập nhật §2.5 điều kiện nâng cấp gói Lưới điện / 5G.
- [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md): Ghi nhận Gotcha #37 (*Utility Monopoly Upgrade Requirement & Rent De-escalation Fallback*).
- [`docs/epics/gameplay/_epic_ledger.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/epics/gameplay/_epic_ledger.md): Cập nhật tiến độ ticket và đối soát Tech Debt Ledger (DoD #5).
- [`docs/master_roadmap.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/master_roadmap.md): Cập nhật bảng Continuous Improvement Registry.

---

## 3. ĐỐI SOÁT NGÂN SÁCH DÒNG MÃ (LOC BUDGET RECONCILIATION)

Đo lường cơ học bằng `scripts/check_loc.mjs`:

| Tệp Mã Nguồn | Phân Loại Tier | Baseline Trước | LOC Sau | SLOC | Ngân Sách Trần | Trạng Thái |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| `src/domain/action_reasons.ts` | Tier 1 (Domain Logic) | 44 | **45** | 44 | <= 400 | ✔️ An Toàn |
| `src/domain/i18n/vi.ts` | Tier 1 (Domain Logic) | 104 | **105** | 99 | <= 400 | ✔️ An Toàn |
| `src/client/ui/actionable_notification.ts` | Tier 2 (UI Component) | 353 | **360** | 353 | <= 500 | ✔️ An Toàn |
| `src/domain/property_upgrade.ts` | Tier 1 (Domain Logic) | 190 | **207** | 187 | <= 400 | ✔️ An Toàn |
| `src/client/ui/modals/title_deed_affordance.ts` | Tier 2 (UI Component) | 260 | **275** | 250 | <= 500 | ✔️ An Toàn |
| `src/domain/property_rent.ts` | Tier 1 (Domain Logic) | 202 | **205** | 189 | <= 400 | ✔️ An Toàn |
| `src/server/property_actions.ts` | Tier 1 (Domain Logic) | 384 | **385** | 344 | <= 400 | ⚠️ **Cảnh Báo** (> 300 LOC, còn 15 dòng tới trần; đã log `DEBT-PROP-ACT-01`) |
| `tests/contracts/imp247_utility_monopoly_upgrade_requirement.test.ts` | Contract Tests | 0 | **256** | 228 | <= 600 | ✔️ An Toàn |
| `tests/contracts/imp240_title_deed_affordance_and_special_properties.test.ts` | Contract Tests | 544 | **545** | 497 | <= 600 | ⚠️ Cảnh Báo (545 > 500) |
| `tests/contracts/imp214_utility_mechanics_revamp.test.ts` | Contract Tests | 505 | **505** | 415 | <= 600 | ⚠️ Cảnh Báo (505 > 500) |

---

## 4. KẾT QUẢ KIỂM THỬ & KIỂM TOÁN 4 TRẠM (CLOSED-LOOP GATES)

### 4.1. Trạm 1: RED Contract Test Gate (`qa-tester`)
- Tạo bộ test hợp đồng: [`tests/contracts/imp247_utility_monopoly_upgrade_requirement.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp247_utility_monopoly_upgrade_requirement.test.ts) (18 atomic tests, floor >= 15).
- **Cam kết Traceability 100% (DoD #1)**: Toàn bộ 18 test cases đều được gắn nhãn truy xuất chuẩn xác:
  - `[TC-IMP247.01/MSS][UC-IMP247]` đến `[TC-IMP247.04/MSS][UC-IMP247]` (Domain Upgrade Preconditions).
  - `[TC-IMP247.05/A1][UC-IMP247]` đến `[TC-IMP247.07/A1][UC-IMP247]` (Mortgage Invariants).
  - `[TC-IMP247.08/A2][UC-IMP247]` đến `[TC-IMP247.11/A2][UC-IMP247]` (Boundary & Re-Upgrade Guards).
  - `[TC-IMP247.12/A3][UC-IMP247]` đến `[TC-IMP247.15/A3][UC-IMP247]` (Client Affordance & UI Tooltips).
  - `[TC-IMP247.16/A4][UC-IMP247]` đến `[TC-IMP247.18/A4][UC-IMP247]` (Exploit Defense & Concurrency Locks).
- Xác minh Adversarial Inversion: 10/18 tests Business RED trước khi sửa mã nguồn sản xuất (thất bại đúng vì thiếu rào cản độc quyền và thế chấp).
- 0 tệp trong `src/**` bị chỉnh sửa tại Trạm 1.

### 4.2. Trạm 2: GREEN Implementation Gate
- Triển khai drop-in snippets tối thiểu vào 7 tệp production.
- 18/18 tests `imp247_...test.ts` chuyển sang GREEN (100% PASS).
- Reconcile điều kiện tiên quyết (precondition) cho 3 bài test kế thừa (`imp240`, `imp214`, `threat_forecaster_edge`).
- Toàn bộ 74/74 tests trên cả 5 test suites liên quan đều PASS 100%.

### 4.3. Trạm 2.5: Fast Pre-Filter Sweep
- `npm run typecheck`: 0 lỗi biên dịch (`tsc --noEmit` exit code 0).
- `npm run lint:slop`: 0 hard violations trên 300 tệp.
- `npm run lint:ui`: 0 anti-patterns trên 212 tệp UI.
- 0 dirty casts (`as any`, `as unknown as T`).
- 0 console.log thừa thãi.

### 4.4. Trạm 3: Independent Review Funnel
- **Phase 3.0 (Physical Visual Evidence Waiver)**: Các thay đổi UI trong `src/client/ui/**` chỉ bao gồm `actionable_notification.ts` (dictionary ánh xạ icon và chuỗi thông báo lỗi) và `title_deed_affordance.ts` (pure functional state resolver). Do **không chứa mã JSX/CSS DOM hay WebGL Canvas**, Phase 3.0 được miễn trừ chụp ảnh màn hình vật lý theo cơ chế Pure Logic Waiver và được bảo chứng qua `npm run lint:ui` (0 vi phạm) cùng Facet 4 tests.
- **Phase 3.1 (Spec & Scope Gate)**: `spec-reviewer` ký duyệt **APPROVED** (100% fidelity, zero scope drift).
- **Phase 3.2 (Deep Architecture Gate)**: `code-reviewer` và `re-reviewer` ký duyệt **APPROVED** sau khi xác minh reconcile precondition và cập nhật Gotcha #37.

### 4.5. Trạm 4: Adversarial Boundary & Mutation Sentinel (`chaos-sentinel`)
- Chạy runner chuẩn hóa: `npm run sentinel -- --ticket IMP-247 --test tests/contracts/imp247_utility_monopoly_upgrade_requirement.test.ts --src src/domain/property_upgrade.ts`
- Xác minh bằng `node scripts/check_evidence.mjs IMP-247`: Exit code 0.
- Kết quả 3 probes vật lý:
  1. **Closed-Loop Parity**: 24/24 Intent symmetric parity (0 gaps).
  2. **Ephemeral Boundary**: Port động 53332 mở thành công qua TCP thật, chịu được ngắt kết nối đột ngột mà không treo process hay rò rỉ timer.
  3. **Mutation Sensitivity**: 8/8 mutants bị tiêu diệt (4 source mutants, 4 contract mutants, 0 survived).
- Phán quyết: **APPROVED**. Bằng chứng lưu tại `.agents/evidence/chaos_sentinel_imp247.json`.

---

## 5. KẾT LUẬN & ĐÓNG TICKET

Cải tiến **`IMP-247`** đã giải quyết dứt điểm nghịch lý kinh tế của nhóm Tiện ích, thiết lập cơ chế phòng thủ giải trừ cước tự động vững chắc, bảo vệ tính cân bằng cho cơ chế P2P Trade / Swap, và đạt **100% tiêu chí Definition of Done** theo Hiến chương GEMINI.md.
