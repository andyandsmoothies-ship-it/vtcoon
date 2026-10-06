# BÁO CÁO NGHIỆM THU KỸ THUẬT: TICKET IMP-276B
## ĐỒNG BỘ HIỂN THỊ EVENT CARD MODAL, TICKER & VISUAL BADGES CHO THẺ MC_RATE_HIKE

> **Mã Nhiệm Vụ:** IMP-276B (Micro-Slice 2 / Lát cắt cuối cùng của Epic Tái cân bằng MC_RATE_HIKE)  
> **Phân hệ thực hiện:** `client-ui`  
> **Ngày hoàn thành:** 06/10/2026  
> **Quy trình:** Closed-Loop 4-Station Pipeline (Tuân thủ nghiêm ngặt Hiến pháp AGENTS CONSTITUTION & Pure Logic Waiver Guard)  
> **Trạng thái:** **HOÀN THÀNH XUẤT SẮC (100% GREEN, 9/9 MUTANTS KILLED, DUAL-VIEWPORT VERIFIED, SHIP)**  

---

### 1. TỔNG QUAN THAY ĐỔI & BỐI CẢNH KỸ THUẬT

- **Thực trạng trước sửa đổi**:
  1. *Lỗi Dead Metadata Override & Hardcode Scope*: Trong [`event_card_modal.tsx#L114`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/event_card_modal.tsx#L114), cờ `isDefaultMacroMarket` được hardcode cục bộ, vô hiệu hóa việc đọc trực tiếp `detail?.targetScope` từ Single Source of Truth (`src/domain/event_card_metadata.ts`), gây nguy cơ lệch pha khi metadata được cập nhật.
  2. *Lỗi Bất đồng bộ thông tin trên Ticker Bar*: `market_event_ticker.tsx` chỉ hiển thị thông báo thu lãi vay 10% khi qua GO, hoàn toàn bỏ quên chính sách tăng 20% chi phí xây nhà C1-C3 đã được bổ sung ở `IMP-275`.
  3. *Lỗi Bất đồng bộ Hero Stat Box*: `KNOWN_HERO_STATS` trong `event_card_visuals.ts` vẫn giữ nhãn `'LÃI SUẤT VAY MỚI'` và giá trị `'10% QUA GO'`, không phản ánh bản chất chính sách thắt chặt tiền tệ kép.
  4. *Lỗi Bất đồng bộ Punchy Summary*: `event_card_punchy_summaries.ts` chỉ tóm tắt thu lãi vay, thiếu thông tin tăng giá xây dựng.

- **Giải pháp triển khai trong IMP-276B**:
  1. *Subtractive Refactoring*: Gỡ bỏ hoàn toàn cờ hardcode `isDefaultMacroMarket` trong `event_card_modal.tsx`, chuyển `rawTargetScope` đọc trực tiếp từ `detail?.targetScope` với thứ tự fallback chuẩn hóa bảo vệ Legacy Caller Props Precedence (`targetScope || detail?.targetScope || (isMarket ? 'Toàn bộ thị trường' : 'Người chơi rút thẻ')`).
  2. *Đồng bộ Ticker Bar*: Cập nhật `ACTIVE_MARKET_EFFECT_SUMMARIES[MC_RATE_HIKE]` thành `'Tăng 20% chi phí xây nhà C1-C3 và thu lãi vay thế chấp 10% khi qua GO.'` và công thức rút gọn `'Xây nhà +20%, Lãi vay 10%'`.
  3. *Đồng bộ Hero Stat Box*: Cập nhật nhãn `'THẮT CHẶT TIỀN TỆ'`, giá trị `'+20% XÂY • 10% QUA GO'` (variant `'warning'`), nằm gọn trên 1 dòng duy nhất trên cả Mobile 360px và Desktop.
  4. *Đồng bộ Punchy Summary*: Cập nhật câu tóm tắt thành `'Tăng 20% xây nhà & thu lãi vay 10% tại GO'`.
  5. *Dual-Viewport Visual Parity*: Chụp ảnh thực tế Dual-Viewport (Desktop 1280x800 & Mobile 360x740) và được `ui-craft-reviewer` phê duyệt `SHIP`.

---

### 2. BẢNG TỔNG HỢP BẰNG CHỨNG QUY TRÌNH 4 TRẠM KHÉP KÍN

| Trạm Kiểm Soát | Vai Trò & Tệp Bằng Chứng | Chỉ Số Đạt Được | Kết Quả Thẩm Định |
| :--- | :--- | :--- | :---: |
| **Stage 0 & Pre-Plan** | `plan-griller`<br>[`.agents/audit/PLAN_AUDIT_IMP-276B.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-276B.md) | Thẩm định 4 chiều (State, Seam, Boundaries, Symmetry). `audit_plan.mjs` pass 0 defects. | **HARDENED_APPROVED** 🛡️ |
| **Trạm 1: RED Contract Test** | `qa-tester`<br>[`.agents/evidence/station1_IMP-276B.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/station1_IMP-276B.json) | 10 atomic contract tests tại [`tests/contracts/imp276b_event_card_sync.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp276b_event_card_sync.test.ts). Adversarial Inversion: 5/10 tests FAIL vì runtime assertion (Hero Stat & Ticker desync), 0 lỗi cú pháp/import. | **VERIFIED RED** 🎯 |
| **Trạm 2: GREEN Implementation** | `implementer`<br>[`.agents/evidence/IMP-276B_snapshot.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/IMP-276B_snapshot.json) | Thay đổi tối thiểu (-2 net LOC trên 4 files UI). Chạy 10/10 contract tests chuyển sang 100% GREEN (45ms). Regression 55/55 tests GREEN. | **VERIFIED GREEN** 🟢 |
| **Trạm 2.5: Fast Pre-Filter** | `scout` & `fast_prefilter.mjs` | Typecheck `tsc --noEmit`, LOC budgets, zero dirty casts (`as any`), console.log purge, linters (`lint_slop`, `lint_ui`, `check:i18n`) | **100% PASS (0 Defects)** 🚀 |
| **Trạm 3.0: Dual-Viewport Capture** | Puppeteer Live Headless Probe | Desktop 1280x800 ([`imp-276b_desktop.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-276b_desktop.jpg)) & Mobile 360x740 ([`imp-276b_mobile_360.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-276b_mobile_360.jpg)) | **CAPTURED** 📸 |
| **Trạm 3.1: Spec & Scope Gate** | `spec-reviewer`<br>[`.agents/audit/SPEC_REVIEW_IMP-276B.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-276B.md) | 100% plan fidelity, Legacy Caller Guard hợp lệ, zero scope creep, kiểm soát nợ kỹ thuật `DEBT-EVENT-CARD-MODAL-407`. | **APPROVED** 📋 |
| **Trạm 3.2: Architecture & Anti-Slop** | `code-reviewer`<br>[`.agents/audit/CODE_REVIEW_IMP-276B.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-276B.md) | Deep modules, Subtractive Refactoring (-2 net LOC), Zero TIDD, listener leak cleanup trong unmount, assertion density 1.7 asserts/test ($\le 4$). | **APPROVED** 🛡️ |
| **Trạm 3.2: 2D UI Craft Review** | `ui-craft-reviewer`<br>[`.agents/audit/UI_CRAFT_REVIEW_IMP-276B.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/UI_CRAFT_REVIEW_IMP-276B.md) | Hero Stat hiển thị gọn gàng trên 1 dòng, không tràn viền trên mobile 360px, CTA button >= 48px, close button >= 44px, độ tương phản cao đạt chuẩn commercial game. | **SHIP** 🎨 |
| **Trạm 4: Chaos & Mutation Sentinel** | `chaos-sentinel`<br>[`.agents/evidence/chaos_sentinel_IMP-276B.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_IMP-276B.json) | 9/9 mutants mục tiêu bị tiêu diệt (100% kill rate, 0 survived) trên Scope/HeroStat/Ticker/Precedence/MultiEvent. `node scripts/check_evidence.mjs IMP-276B` đạt 0 defects. | **PASSED (0 Defects)** 💥 |

---

### 3. THỐNG KÊ BIẾN ĐỘNG DÒNG MÃ (LOC ACCOUNTING)

| Tệp Mã Nguồn | Đường Dẫn | Baseline LOC | Delta LOC | LOC Sau Cùng | Đánh Giá Ngân Sách |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `event_card_modal.tsx` | [`src/client/ui/modals/event_card_modal.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/event_card_modal.tsx) | 407 | -1 | 406 | Warning (Tech Debt `DEBT-EVENT-CARD-MODAL-407`) |
| `market_event_ticker.tsx` | [`src/client/ui/market_event_ticker.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/market_event_ticker.tsx) | 274 | 0 | 274 | Safe (Tier 2 limit: 500) |
| `event_card_punchy_summaries.ts` | [`src/client/ui/event_card_punchy_summaries.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/event_card_punchy_summaries.ts) | 103 | 0 | 103 | Safe (Tier 2 limit: 500) |
| `event_card_visuals.ts` | [`src/client/ui/modals/event_card_visuals.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/event_card_visuals.ts) | 304 | 0 | 304 | Safe (Tier 2 limit: 500) |
| `imp276b_...test.ts` | [`tests/contracts/imp276b_event_card_sync.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp276b_event_card_sync.test.ts) | 0 | +176 | 176 | Safe (Test suite limit: 600) |
| `imp156_...test.ts` | [`tests/client/imp156_event_card_visual_declutter.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp156_event_card_visual_declutter.test.ts) | 193 | +3 | 196 | Safe (Phân tách atomic test $\le 4$ asserts) |
| **Tổng Delta Production (`src/**`)** | — | — | **-1 net LOC** | — | **Subtractive Refactor Thỏa Mãn Ngân Sách** |

---

### 4. ĐÁNH GIÁ VẬN HÀNH & ĐỀ XUẤT CẢI TIẾN SETTING SDLC

Áp dụng quy trình thẩm tra đối kháng 2 vòng (Zero-Raw-Trust & Two-Round Adversarial Cross-Examination):

1. **Vòng 1 (Physical Evidence Cross-Examination)**:
   - *Claim từ Code-Reviewer*: `tests/client/imp156_event_card_visual_declutter.test.ts` dòng 181 (`TC-156.16`) có 8 `expect()` calls làm vi phạm Rule 3.5 của `fast_prefilter.mjs`.
   - *Xác minh vật lý*: Terminal log của `fast_prefilter.mjs` báo lỗi `Test case contains 8 expect() calls (max 4 allowed)` tại dòng 181.
   - *Hành động giải quyết ngay*: Main Agent đã dùng `replace_file_content` phân tách `TC-156.16` thành `TC-156.16a` và `TC-156.16b` (mỗi test 4 asserts), đưa `fast_prefilter.mjs` về trạng thái 100% PASS mà không làm lơi lỏng khẳng định.

2. **Vòng 2 (Adversarial Inversion & Guardrail Filter)**:
   - *Legacy Caller Guard vs Dead Metadata Override*: Việc gỡ bỏ hardcode `isDefaultMacroMarket` và thay bằng `targetScope || detail?.targetScope` giải quyết triệt để vấn đề Single Truth mà không phá vỡ khả năng nhận props tùy chỉnh của caller.
   - *Visual Parity Guard*: Ảnh chụp thực địa chứng minh chuỗi `+20% XÂY • 10% QUA GO` (21 ký tự) hoàn toàn an toàn về mặt bố cục thị giác, không làm phình to Hero Stat Box trên màn hình hẹp 360px.
