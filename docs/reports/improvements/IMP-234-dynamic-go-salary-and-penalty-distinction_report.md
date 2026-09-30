# BÁO CÁO NGHIỆM THU TÍNH NĂNG IMP-234
**Tên tính năng**: Đồng Bộ Lương Vượt GO Động, Tách Bạch Phiếu Phạt Cơ Hội & Hiển Thị Đa Huy Hiệu Trên Mobile  
**Mã phiếu (Issue Ticket)**: IMP-234  
**Ngày hoàn thành**: 2026-09-30  
**Quy trình thực thi**: Quy Trình 4 Trạm Khép Kín (4-Station Closed-Loop Pipeline Tier 2 Full Rigor)  
**Trạng thái nghiệm thu**: ✅ HOÀN THÀNH TOÀN DIỆN (100% PASSED)

---

## 1. TỔNG QUAN VẤN ĐỀ & GIẢI PHÁP TRIỆT ĐỂ

### 1.1 Hiện Tượng Gốc & Phản Ánh Của Người Dùng
1. **Lương qua ô GO bị cố định bằng text 2.000:**  
   * Trong quy tắc kinh tế chuẩn ([`src/domain/room.ts#L16-L20`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/room.ts#L16-L20)), hàm `calculateGoSalary(roundCount)` quy định mức lương giảm dần theo thời gian trận đấu: Vòng 1–20 nhận **2.000 Tr.**, Vòng 21–30 nhận **1.500 Tr.**, Vòng 31+ nhận **1.000 Tr.**  
   * Tuy nhiên, các vị trí hiển thị và thông báo (`activity_badge_dispatcher.ts`, `wss_intent_handler.ts`, `offline_landing.ts`, `game_rules_modal.tsx`) bị hardcode chuỗi cố định `+2.000 Tr.`, gây lệch pha giữa số tiền người chơi nhận được trên bảng điểm số dư và thông báo trên sa bàn.
2. **Bot vượt GO dẫm ô trừ tiền chỉ hiện 1 số tiền ròng (Net Balance Diff):**  
   * Khi bot đi qua GO đồng thời dẫm vào ô trừ tiền (như bốc phiếu phạt Cơ hội, nộp thuế, hoặc trả tiền thuê nhà), người chơi phản ánh UI chỉ hiện số tiền là kết quả cuối cùng chứ không tách bạch rõ số tiền được cộng lương và số tiền bị phạt.
   * **Nguyên nhân vật lý 1 (CSS Responsive nuốt huy hiệu):** Trong [`src/client/ui/floating_numbers.tsx#L280-L285`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/floating_numbers.tsx#L280-L285), điều kiện `className={(latestMilestone || (idx === 0 && displayItems.length > 1)) ? "hidden md:flex" : ...}` tự động ẩn đi Huy hiệu Lương (`idx === 0`) trên Mobile khi có giao dịch thứ hai hoặc có Banner sự kiện. Người dùng mobile chỉ nhìn thấy duy nhất huy hiệu trừ tiền.
   * **Nguyên nhân vật lý 2 (Gán nhầm loại):** Thẻ phạt Cơ hội / Thị trường nộp tiền về Kho bạc không có người nhận nên bị `processPayerFee` gán mặc định thành `type: 'tax'`, hiển thị nhầm thành *"Nộp Thuế Đất Đai ➔ Kho Bạc"*.
   * **Nguyên nhân vật lý 3 (Phát đúp thẻ):** Thẻ bài nổi bị phát 2 lần song song từ `syncEventCard` (2.5s) và `activity_tracker.ts` (4.8s).

### 1.2 Giải Pháp Triệt Để Tiếp Thu Trọn Vẹn 5 Phản Biện Chuyên Sâu
1. **Khép kín luồng 5 trạm truyền lương động qua WebSocket Delta (PB-1)**:
   - Thêm `readonly passedGoSalary?: number;` vào interface `RollResult` ([`room_manager.ts#L55`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts#L55)) và `DeltaPayload` ([`session_manager.ts#L93`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/session_manager.ts#L93)).
   - Hàm `executeTurnRoll` ([`turn_loop.ts#L175-L193`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/turn_loop.ts#L175-L193)) tính lương động theo vòng và trả về `passedGoSalary`.
   - `buildSparseDelta` ([`delta_broadcaster.ts#L115`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/delta_broadcaster.ts#L115)) và `SessionManager.broadcastDelta` ([`session_manager.ts#L392`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/session_manager.ts#L392)) bảo toàn `passedGoSalary` trên đường truyền mạng WebSocket.
   - Client `extractPassedGoActivities` ([`activity_rent_matcher.ts#L64`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/activity_rent_matcher.ts#L64)) ưu tiên nhận `delta.passedGoSalary ?? calculateGoSalary(round)`.
2. **Khóa chặt điều kiện nhận diện phiếu phạt sự kiện chống False-Positive (PB-2)**:
   - Trong `processPayerFee` ([`activity_rent_matcher.ts#L244-L262`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/activity_rent_matcher.ts#L244-L262)), loại bỏ hoàn toàn `currentTurnPlayerId`. Chỉ cho phép `(card.drawnBy === payer.id || card.playerId === payer.id)` kết hợp điều kiện bất biến: `Math.abs(card.effectDelta ?? 0) === absDiff`. Triệt tiêu hoàn toàn lỗi gán nhầm tiền thuê nhà hoặc thuế thành thẻ phạt.
   - Trả về `type: 'card'` mang đúng tên thẻ bài và kích hoạt handler chuyên biệt `handleCardPenaltyBadge` ([`activity_badge_dispatcher.ts#L205-L220`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/activity_badge_dispatcher.ts#L205-L220)) hiển thị: `Nộp Phạt: [Tên Thẻ] ➔ Kho Bạc`.
3. **Cải tiến công thái học Mobile 360px bảo vệ trần chiều cao (PB-3)**:
   - Trong [`floating_numbers.tsx#L278-L280`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/floating_numbers.tsx#L278-L280), điều kiện ẩn được cập nhật thành: `Boolean(latestMilestone && displayItems.length > 1 && idx < displayItems.length - 1)`.
   - Khi không có Milestone sự kiện: Cả 2 huy hiệu Lương và Phạt/Thuê đều hiển thị đầy đủ trên Mobile.
   - Khi có Milestone sự kiện: Hệ thống tự động co gọn còn 1 Milestone Banner + 1 Huy hiệu mới nhất trên Mobile, bảo vệ trần chiều cao $\le 120$px, không che khuất sa bàn 3D.
4. **Khử phát đúp thẻ bot, bảo toàn thẻ thưởng & IMP-205 (PB-4)**:
   - Giữ nguyên `syncEventCard` trong `apply_delta.ts` (bảo toàn 100% 4 tests hợp đồng IMP-205).
   - Trong `activity_tracker.ts#L338-L347`, chỉ chặn phát đúp cho Bot (`isBotCard`), giữ nguyên hiển thị `punchySummary` 4.8s cho Thẻ Thưởng, Thẻ Đầu Tư và Thẻ Thị Trường của Người chơi.
5. **Định dạng tóm tắt Intent độc lập Locale môi trường CI (PB-5 & Phản biện bổ sung)**:
   - Loại bỏ 100% `toLocaleString('vi-VN')` trong toàn bộ [`wss_intent_handler.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/wss_intent_handler.ts#L87-L98) cho cả 3 trường: tiền thuê đất `roll.rentCharged`, lương qua GO `sal`, và số dư cuối `roll.player.balance`, thay thế bằng hàm `formatVn` regex thuần túy phân tách dấu chấm: `(n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')`.
   - Đồng bộ hóa định dạng regex tương tự cho thuế tài sản tại [`offline_landing.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/offline_landing.ts#L181).
   - Bổ sung kiểm thử hồi quy nghiêm ngặt tại `[TC-234.04/MSS]` để xác thực cả `(Trả tiền thuê 2.500)`, `(Qua ô Bắt Đầu +1.500)`, và `Số dư: 11.500`, triệt tiêu hoàn toàn nguy cơ flaky test trên mọi nền tảng Linux / headless CI.

---

## 2. HẠ TẦNG MÃ NGUỒN VẬT LÝ ĐÃ TRIỂN KHAI

| Tệp Mã Nguồn | Tầng Kiến Trúc | LOC Thực Tế | Ngân Sách Trần | Tóm Tắt Thay Đổi |
| :--- | :--- | :---: | :---: | :--- |
| [`src/domain/room.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/room.ts#L16-L20) | Domain Model | 274 | $\le 400$ LOC | Bổ sung `passedGoSalary?: number;` vào interface `Room`. |
| [`src/server/room_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts#L55) | Server FSM Coordinator | 380 | $\le 400$ LOC | Bổ sung `readonly passedGoSalary?: number;` vào interface `RollResult`. |
| [`src/server/session_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/session_manager.ts#L93) | Server Wire Protocol DTO | 397 | $\le 400$ LOC | Bổ sung `readonly passedGoSalary?: number;` vào `DeltaPayload` và `broadcastDelta`. |
| [`src/server/turn_loop.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/turn_loop.ts#L175-L193) | Server Turn Loop FSM | 335 | $\le 400$ LOC | `executeTurnRoll` tính lương động theo vòng và trả về `passedGoSalary`. |
| [`src/server/network/delta_broadcaster.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/delta_broadcaster.ts#L115) | Network Broadcaster | 226 | $\le 400$ LOC | `buildSparseDelta` bảo toàn `passedGoSalary` trên đường truyền vi sai. |
| [`src/server/network/wss_intent_handler.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/wss_intent_handler.ts#L87-L98) | WSS Intent Logger | 144 | $\le 400$ LOC | Loại bỏ 100% `toLocaleString('vi-VN')`, dùng `formatVn` regex cho `rentCharged`, `passedGoSalary`, và `balance`. |
| [`src/client/network/activity_badge_dispatcher.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/activity_badge_dispatcher.ts#L130-L220) | Client Badge Dispatcher | 249 | $\le 400$ LOC | Formula động `Hoàn thành 1 vòng sa bàn (+1.500 Tr.)` và handler `handleCardPenaltyBadge`. |
| [`src/client/network/activity_rent_matcher.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/activity_rent_matcher.ts#L64-L260) | Client Financial Matcher | 323 | $\le 400$ LOC | Nhận diện thẻ phạt chính xác `isCardPenalty` và nhận `delta.passedGoSalary`. |
| [`src/client/network/activity_tracker.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/activity_tracker.ts#L338-L347) | Client Activity Tracker | 358 | $\le 400$ LOC | Chặn phát toast đúp cho bot, bảo toàn thẻ thưởng và thẻ thị trường cho human. |
| [`src/client/ui/floating_numbers.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/floating_numbers.tsx#L278-L280) | Client UI 2D Component | 297 | $\le 500$ LOC | Cải tiến điều kiện hiển thị đa huy hiệu không nuốt lương trên Mobile 360px. |
| [`src/client/offline_landing.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/offline_landing.ts#L181-L194) | Offline Game Logic | 211 | $\le 400$ LOC | Chế độ offline tính lương động theo `calculateGoSalary` và định dạng thuế bằng regex độc lập locale. |
| [`src/client/ui/modals/game_rules_modal.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/game_rules_modal.tsx#L118) | Client UI Rules Modal | 335 | $\le 500$ LOC | Cập nhật văn bản mô tả các mốc lương 2.000 / 1.500 / 1.000 Tr. |
| [`docs/domain/gotchas.md#L214-L218`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md#L214-L218) | Domain Gotchas Ledger | 237 | - | Ghi nhận [Bất biến số 30: Dynamic GO Salary & Event Penalty Separation Parity](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md#L214-L218). |

---

## 3. KẾT QUẢ KIỂM TOÁN QUY TRÌNH 4 TRẠM KHÉP KÍN

```
[Kế Hoạch SSOT v3] (Tiếp thu 100% 5 Phản biện PB-1..PB-5)
        ↓
[Trạm 1: QA Tester]   → 16 Tests Contract viết trước (Chứng minh 13 RED Business, 3 Regression PASS)
        ↓
[Trạm 2: Implementer] → Mã nguồn hoàn tất, xóa sạch 13 RED, 49/49 Tests GREEN (kèm regressions)
        ↓
[Trạm 2.5: Scout]     → PASS (Khắc phục typecast test, 0 compiler errors, LOC safe 12/12 files)
        ↓
[Trạm 3: Review Funnel]
  ├─ Phase 3.1: Spec Reviewer  → APPROVED (100% Plan Fidelity, Zero Scope Drift)
  ├─ Phase 3.2: UI Craft       → APPROVED (Điểm 10/10 tuyệt đối, Touch Target 44px, Zero Overflow)
  └─ Phase 3.2: Re-Reviewer    → APPROVED (Khắc phục triệt để lỗ hổng Sparse Delta tại Trạm Broadcaster)
        ↓
[Trạm 4: Chaos Sentinel]
  ├─ Probe 1: Wire-to-Core Parity    → PASSED (6/6 tests, 5 Trạm khép kín, 0 Parity Gaps)
  ├─ Probe 2: Ephemeral Boundary     → PASSED (6/6 tests, Falsy roundCount safe, Mobile pacing)
  └─ Probe 3: Mutation Sensitivity   → PASSED (18/18 tests, Mutants tested: 7, Killed: 7, Survived: 0)
        ↓
[Check Evidence Gate] → node scripts/check_evidence.mjs imp234 ➔ PASSED (Zero Tautological Mutants)
```

---

## 4. CHI TIẾT BỘ TEST HỢP ĐỒNG & PROBES (79/79 TESTS PASS)

### 4.1 Bộ Test Hợp Đồng Universal 5-Facet (16/16 Atomic Tests PASS)
Tệp kiểm thử: [`tests/contracts/imp234_dynamic_go_salary_and_penalty_distinction.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp234_dynamic_go_salary_and_penalty_distinction.test.ts)
- **Facet 1: Tính Toán & Đồng Bộ Lương GO Động Theo Vòng (Server & Client Sync)**:
  * `[TC-234.01/MSS][UC-GAME-020][Facet-1/Round1To20SalaryIs2000]`: Vòng 15, `executeTurnRoll` trả về `passedGoSalary === 2000`.
  * `[TC-234.02/MSS][UC-GAME-020][Facet-1/Round21To30SalaryIs1500]`: Vòng 25, `executeTurnRoll` trả về `passedGoSalary === 1500`.
  * `[TC-234.03/MSS][UC-GAME-020][Facet-1/Round31PlusSalaryIs1000]`: Vòng 35, `executeTurnRoll` trả về `passedGoSalary === 1000`.
  * `[TC-234.04/MSS][UC-GAME-020][Facet-1/WssIntentSummaryDynamicText]`: WSS intent log chứa `(Qua ô Bắt Đầu +1.500)` và `buildSparseDelta` bảo toàn `passedGoSalary`.
- **Facet 2: Định Dạng Huy Hiệu Lương Phía Client (Dynamic Formula & Text)**:
  * `[TC-234.05/MSS][UC-GAME-020][Facet-2/SalaryBadgeFormatsDynamicFormula]`: Lương 1.500 format formula `Hoàn thành 1 vòng sa bàn (+1.500 Tr.)`.
  * `[TC-234.06/MSS][UC-GAME-020][Facet-2/SalaryBadgeFormats1000Formula]`: Lương 1.000 format formula `Hoàn thành 1 vòng sa bàn (+1.000 Tr.)`.
  * `[TC-234.07/MSS][UC-GAME-020][Facet-2/OfflineLandingDynamicSalary]`: Chế độ offline cộng đúng 1.500 ở vòng 25.
- **Facet 3: Tách Bạch & Định Danh Phiếu Phạt Sự Kiện (Card Penalty Distinction)**:
  * `[TC-234.08/MSS][UC-GAME-020][Facet-3/ChancePenaltyTitledAccurately]`: Bot bốc thẻ phạt 500 sinh ActivityLogEntry type `'card'`, không gán nhầm tax.
  * `[TC-234.09/MSS][UC-GAME-020][Facet-3/CardPenaltyBadgeDisplaysTitle]`: Badge hiển thị title `Nộp Phạt: Chạy quá tốc độ ➔ Kho Bạc`.
  * `[TC-234.10/MSS][UC-GAME-020][Facet-3/ZeroDuplicateCardFloatingText]`: Bot nhận toast 2500ms duy nhất, tracker không phát đúp 4800ms.
- **Facet 4: Công Thái Học & Hiển Thị Đa Huy Hiệu Trên Mobile (Mobile Responsive Visibility)**:
  * `[TC-234.11/MSS][UC-GAME-020][Facet-4/MobileRendersBothSalaryAndPenaltyBadges]`: Không có milestone: Cả 2 huy hiệu hiển thị trên Mobile (không dính `hidden md:flex`).
  * `[TC-234.12/MSS][UC-GAME-020][Facet-4/MobileRendersMilestoneAndLatestBadge]`: Có milestone: Banner + 1 huy hiệu mới nhất hiển thị trên Mobile (tổng $\le 2$ mục).
  * `[TC-234.13/MSS][UC-GAME-020][Facet-4/SSRHeadlessRenderSafety]`: Kết xuất SSR `FloatingNumbersOverlay` an toàn 100%.
- **Facet 5: Độ Bền Vững & Bảo Toàn Luật Chơi (Robustness & Regression Guard)**:
  * `[TC-234.14/MSS][UC-GAME-020][Facet-5/Imp205BotToastsPreserved]`: Bảo toàn 100% cơ chế toast bot theo IMP-205.
  * `[TC-234.15/MSS][UC-GAME-020][Facet-5/RentPayersSeparationRemainsIntact]`: Trả tiền thuê cho đối thủ tiếp tục phân loại type `'rent'`, không bị nhầm sang card.
  * `[TC-234.16/MSS][UC-GAME-020][Facet-5/GameRulesModalExplainsDynamicSalary]`: Modal quy tắc giải thích rõ 3 mốc lương 2.000 / 1.500 / 1.000 Tr.

### 4.2 Bộ Probes Kiểm Toán Đối Kháng Của Chaos Sentinel (30/30 Tests PASS)
Tệp kiểm thử: [`tests/probes/imp234_chaos_sentinel_probes.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/probes/imp234_chaos_sentinel_probes.test.ts)
- **Probe 1 (Wire-to-Core Closed-Loop Parity)**: 6 tests khép kín 5 trạm từ FSM ➔ DTO ➔ Broadcaster ➔ Parser ➔ UI.
- **Probe 2 (Ephemeral Dynamic Boundary)**: 6 tests thử nghiệm các giá trị cực biên của `roundCount`, timing delay, và mobile item permutation.
- **Probe 3 (Targeted Mutation Sensitivity)**: 18 tests tiêu diệt 100% 7 Mutants A–G bằng cách gọi trực tiếp production exports thật (zero inline mocks).

### 4.3 Bảo Toàn Suite Kiểm Thử Hồi Quy (Legacy Suites)
- [`tests/contracts/imp205_bot_card_toast_and_hud_toggle.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp205_bot_card_toast_and_hud_toggle.test.ts): **17/17 tests PASS**.
- [`tests/contracts/imp230_pass_go_salary_and_rent_subtractive_clean.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp230_pass_go_salary_and_rent_subtractive_clean.test.ts): **16/16 tests PASS**.

---

## 5. BẰNG CHỨNG KIỂM CHỨNG VẬT LÝ TRÊN ĐĨA (PHYSICAL ARTIFACTS)
- **Báo cáo Kiểm toán Kế hoạch**: [`.agents/audit/PLAN_AUDIT_IMP234.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP234.md) (plan-griller).
- **Snapshot Thực thi**: [`.agents/evidence/imp234_execution.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp234_execution.json) (`executed: true`).
- **Chứng thư Ký duyệt Chaos Sentinel**: [`.agents/evidence/chaos_sentinel_imp234.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_imp234.json) (`verdict: "PASSED"`).
- **Xác thực tự động Evidence**: `node scripts/check_evidence.mjs imp234` ➔ **PASSED**.
- **Không có bất kỳ lệnh `git` nào được thực thi bởi AI.**

### 5.1 Điều Kiện Tiên Quyết Môi Trường Khi Kiểm Chứng (Prerequisites)
Để script tự động [`scripts/check_evidence.mjs`](file:///c:/Users/HP/Documents/GitHub/vtcoon/scripts/check_evidence.mjs) có thể thực thi suôn sẻ trên mọi máy trạm / môi trường review:
1. **Cài đặt đầy đủ dependencies**: Chạy `npm install` trước khi audit để đảm bảo binary `vitest` và các gói liên quan trong `node_modules/.bin` sẵn sàng trong môi trường local.
2. **Lệnh thực thi chuẩn xác**:
   ```bash
   npm install
   node scripts/check_evidence.mjs imp234
   ```
*(Lưu ý: Nếu chưa chạy `npm install` hoặc thiếu `node_modules`, lệnh `npx vitest` bên dưới background shell của script sẽ báo lỗi `Command failed: npx vitest run ...` do thiếu binary thực thi).*
