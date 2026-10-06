# BÁO CÁO NGHIỆM THU KỸ THUẬT: TICKET IMP-276A
## ĐỒNG BỘ HIỂN THỊ GIÁ NÂNG CẤP & BẢO VỆ CHỐNG NÚT SÁNG ẢO TRÊN TITLE DEED MODAL

> **Mã Nhiệm Vụ:** IMP-276A (Micro-Slice 1 thuộc Lộ trình Tái cân bằng & Đồng bộ Giao diện MC_RATE_HIKE)  
> **Phân hệ thực hiện:** `client-ui`  
> **Ngày hoàn thành:** 06/10/2026  
> **Quy trình:** Closed-Loop 4-Station Pipeline (Tuân thủ nghiêm ngặt Hiến pháp AGENTS CONSTITUTION & Pure Logic Waiver Guard)  
> **Trạng thái:** **HOÀN THÀNH XUẤT SẮC (100% GREEN, 9/9 MUTANTS KILLED, DUAL-VIEWPORT VERIFIED, SHIP)**  

---

### 1. TỔNG QUAN THAY ĐỔI & BỐI CẢNH KỸ THUẬT

- **Thực trạng trước sửa đổi**:
  1. *Lỗi Nút Nâng Cấp "Sáng Ảo" (Ghost Upgrade Rejection)*: `title_deed_affordance.ts` chỉ đọc giá tĩnh `deed.upgradeCosts` mà không tích hợp `calculateUpgradeCost` cùng `activeModifiers`. Khi `MC_RATE_HIKE` tăng giá 1.2x (1.000M $\to$ 1.200M), người chơi có 1.100M vẫn thấy nút sáng, bấm vào bị Server từ chối `INSUFFICIENT_FUNDS`.
  2. *Lỗi Bất Đồng Bộ Thị Giác "Phân Liệt" (Visual Split-Brain)*: Bảng biểu `TitleDeedRentTable` ở trên đọc `deed.upgradeCosts` tĩnh (hiển thị +1.000), trong khi nút bấm ở dưới hiển thị (+1.200).
  3. *Lỗi Bỏ Sót Turn & Phase Guard*: Không kiểm tra `currentTurnPlayerId !== myId` và `turnPhase !== 'PropertyManagement'`, dẫn đến việc nút nâng cấp sáng ngoài lượt hoặc trong các pha không hợp lệ (như `WaitingRoll`, `Auction`), người chơi bấm vào bị Server từ chối `NOT_YOUR_TURN` hoặc `INVALID_PHASE`.
  4. *Thông điệp lỗi thiếu công thái học*: Câu thông báo cụt lủn `'Không đủ tiền mặt để nâng cấp'` không nêu rõ số tiền cần thiết và không có banner hiển thị tối ưu trên thiết bị di động cảm ứng.

- **Giải pháp triển khai trong IMP-276A**:
  1. Tích hợp `calculateUpgradeCost(cellIndex, currentLevel, activeModifiers)` tính giá động cho nút nâng cấp tại `title_deed_affordance.ts`.
  2. Tạo mảng `upgradeCosts` động và truyền thông suốt từ `DeedModalHost` $\to$ `TitleDeedModal` $\to$ `TitleDeedRentTable`, triệt tiêu hoàn toàn Visual Split-Brain.
  3. Bổ sung Turn & Phase Guard vào `specialUpgradeBlockedReason` (`'Chưa đến lượt của bạn'`, `'Chỉ có thể nâng cấp trong giai đoạn Quản Lý Tài Sản'`) với ưu tiên các luật chơi cơ bản (Monopoly, thế chấp) trước kiểm tra số dư tiền mặt.
  4. Chuẩn hóa câu thông báo thiếu tiền thành công thái học: ``Cần ${effectiveUpgradeCost} Tr. VNĐ để nâng cấp`` hiển thị rõ ràng trên cả mobile và desktop.
  5. Tuân thủ nghiêm ngặt **Pure Logic Waiver Guard**: Từ chối cấp waiver giả tạo; chụp ảnh thực địa Dual-Viewport Desktop (1280x800) & Mobile (360x740) và được `ui-craft-reviewer` phê duyệt `SHIP`.

---

### 2. BẢNG TỔNG HỢP BẰNG CHỨNG QUY TRÌNH 4 TRẠM KHÉP KÍN

| Trạm Kiểm Soát | Vai Trò & Tệp Bằng Chứng | Chỉ Số Đạt Được | Kết Quả Thẩm Định |
| :--- | :--- | :--- | :---: |
| **Stage 0 & Pre-Plan** | `plan-griller`<br>[`.agents/audit/PLAN_AUDIT_IMP-276A.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-276A.md) | Thẩm định 4 chiều (State, Seam, Boundaries, Symmetry) + Revision 2 giải quyết trọn vẹn 5 phản biện. `audit_plan.mjs` pass 0 defects. | **HARDENED_APPROVED** 🛡️ |
| **Trạm 1: RED Contract Test** | `qa-tester`<br>[`.agents/evidence/station1_IMP-276A.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/station1_IMP-276A.json) | 12 atomic contract tests tại [`tests/contracts/imp276a_title_deed_affordance.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp276a_title_deed_affordance.test.ts). Adversarial Inversion: 4/12 tests FAIL vì runtime assertion, 0 lỗi cú pháp/import. | **VERIFIED RED** 🎯 |
| **Trạm 2: GREEN Implementation** | `implementer`<br>[`.agents/evidence/IMP-276A_snapshot.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/IMP-276A_snapshot.json) | Thay đổi tối thiểu (+17 net LOC trên 3 files UI). Chạy 12/12 test tests chuyển sang 100% GREEN (14ms). | **VERIFIED GREEN** 🟢 |
| **Trạm 2.5: Fast Pre-Filter** | `scout` & `fast_prefilter.mjs` | Typecheck `tsc --noEmit`, LOC budgets, dirty casts (`as any`), console.log, linters (`lint_slop`, `lint_ui`, `check:i18n`) | **100% PASS (0 Defects)** 🚀 |
| **Trạm 3.0: Dual-Viewport Capture** | Puppeteer Live Headless Probe | Desktop 1280x800 ([`imp-276a_desktop.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-276a_desktop.jpg)) & Mobile 360x740 ([`imp-276a_mobile_360.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-276a_mobile_360.jpg)) | **CAPTURED** 📸 |
| **Trạm 3.1: Spec & Scope Gate** | `spec-reviewer`<br>[`.agents/audit/SPEC_REVIEW_IMP-276A.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-276A.md) | 100% plan fidelity, giải trình hợp lệ `IMPLEMENTATION DISCOVERY` (strict TurnPhase enum), zero scope creep, hoãn ticker sang IMP-276B. | **APPROVED** 📋 |
| **Trạm 3.2: Architecture & Anti-Slop** | `code-reviewer`<br>[`.agents/audit/CODE_REVIEW_IMP-276A.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-276A.md) | Deep modules, Zero TIDD, an toàn props optional chaining, deterministic, assertion density 1.83 asserts/test ($\le 4$). | **APPROVED** 🛡️ |
| **Trạm 3.2: 2D UI Craft Review** | `ui-craft-reviewer`<br>[`.agents/audit/UI_CRAFT_REVIEW_IMP-276A.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/UI_CRAFT_REVIEW_IMP-276A.md) | Chiều cao touch target nút bấm đạt 44px/48px, không tràn viền trên mobile 360px, đồng bộ Rent Table và Footer (+1.200), banner cảnh báo rõ ràng. | **SHIP** 🎨 |
| **Trạm 4: Chaos & Mutation Sentinel** | `chaos-sentinel`<br>[`.agents/evidence/chaos_sentinel_IMP-276A.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_IMP-276A.json) | 9/9 mutants mục tiêu bị tiêu diệt (100% kill rate, 0 survived) trên Turn/Phase/Solvency/Split-Brain. `node scripts/check_evidence.mjs IMP-276A` đạt 0 defects. | **PASSED (0 Defects)** 💥 |

---

### 3. THỐNG KÊ BIẾN ĐỘNG DÒNG MÃ (LOC ACCOUNTING)

| Tệp Mã Nguồn | Đường Dẫn | Baseline LOC | Delta LOC | LOC Sau Cùng | Đánh Giá Ngân Sách |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `title_deed_affordance.ts` | [`src/client/ui/modals/title_deed_affordance.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/title_deed_affordance.ts) | 289 | +14 | 303 | Safe (Tier 2 limit: 500) |
| `title_deed_modal.tsx` | [`src/client/ui/modals/title_deed_modal.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/title_deed_modal.tsx) | 390 | +2 | 392 | Safe (Tier 2 limit: 500) |
| `deed_modal_host.tsx` | [`src/client/ui/modals/hosts/deed_modal_host.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/hosts/deed_modal_host.tsx) | 105 | +1 | 106 | Safe (Tier 2 limit: 500) |
| `imp276a_...test.ts` | [`tests/contracts/imp276a_title_deed_affordance.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp276a_title_deed_affordance.test.ts) | 0 | +378 | 378 | Safe (Test suite limit: 600) |
| **Tổng Delta Production (`src/**`)** | — | — | **+17 net LOC** | — | **Thỏa mãn Micro-Slice (<= 50 LOC)** |

---

### 4. ĐÁNH GIÁ VẬN HÀNH & ĐỀ XUẤT CẢI TIẾN SETTING SDLC

Áp dụng quy trình thẩm tra đối kháng 2 vòng (Zero-Raw-Trust & Two-Round Adversarial Cross-Examination):

1. **Vòng 1 (Physical Evidence Cross-Examination)**:
   - *Claim từ QA/Implementer*: `useGameStore.setState` yêu cầu kiểu nghiêm ngặt `TurnPhase` enum từ `domain/room.js`, không nhận string `'WaitingRoll'`.
   - *Xác minh vật lý*: Terminal log khi chạy `tsc --noEmit` báo lỗi type mismatch chính xác.
   - *Claim từ UI Craft*: Nút bấm dài hơn `Nâng Cấp (+1.200)` trên mobile 360px có nguy cơ tràn viền nếu không co giãn linh hoạt. Bounding box JSON xác nhận nút rộng 138px, nằm gọn trong container 328px (không tràn).

2. **Vòng 2 (Adversarial Inversion & Guardrail Filter)**:
   - *Pure Logic Waiver Guard*: Việc loại bỏ waiver giả tạo và ép buộc chụp ảnh thực địa Phase 3.0 đã phát hiện và xác nhận thành công tính toàn vẹn của giao diện Modal trên Mobile 360px, chứng minh quy chế `GEMINI.md` mới cập nhật hoạt động hiệu quả 100%.

---

### 5. HẠNG MỤC BÀN GIAO TIẾP THEO: TICKET-IMP-276B

Chuyển sang lát cắt cuối cùng của Epic Tái cân bằng `MC_RATE_HIKE`:
👉 **`[TICKET-IMP-276B: Đồng Bộ Event Card Modal, Ticker & Visual Badges Cho MC_RATE_HIKE]`**:
1. `src/client/ui/modals/event_card_modal.tsx#L114`: Gỡ bỏ hardcode `isDefaultMacroMarket` đối với `MC_RATE_HIKE` để hiển thị đúng `targetScope` ("Toàn bộ thị trường") và `effectDetail` từ metadata.
2. `src/client/ui/market_event_ticker.tsx#L75,L127`: Cập nhật câu chữ chạy trên thanh ticker thông báo tăng 20% chi phí xây dựng.
3. `src/client/ui/event_card_punchy_summaries.ts#L14`: Cập nhật chuỗi tóm tắt punchy summary.
4. `src/client/ui/modals/event_card_visuals.ts#L26`: Cập nhật huy hiệu Hero Stat trực quan.
