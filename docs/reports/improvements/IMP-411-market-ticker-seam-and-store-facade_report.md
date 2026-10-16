# BÁO CÁO NGHIỆM THU HOÀN THÀNH TICKET IMP-411
## PLAN_IMP_411: Market Event Ticker Seam & Client Store Public Facade (Nhóm 2 Slice 2C)

> **Mã Ticket:** `IMP-411`  
> **Phân hệ thực tế:** `client-ui`, `client-state`  
> **Ngày hoàn thành:** 2026-10-16  
> **Quy trình:** Closed-Loop 4-Station Pipeline (Tuân thủ nghiêm ngặt Hiến pháp AGENTS CONSTITUTION)  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED**

---

## 1. TỔNG QUAN & BỐI CẢNH VẤN ĐỀ

> **Mô tả cốt lõi**: Bóc tách toàn bộ từ điển và các hàm tính toán, định dạng hiển thị sự kiện thị trường ra khỏi `market_event_ticker.tsx` sang mô-đun seam thuần túy `market_event_helpers.ts` (0 React, 0 JSX), điều hướng `event_card_visuals.ts` import từ helper này để triệt tiêu hoàn toàn chu trình phụ thuộc vòng `[SCC-6]`. Đồng thời thiết lập facade công khai `src/client/store/index.ts` làm cổng giao tiếp chuẩn mực duy nhất cho các consumer tầng giao diện, đấu nối ngay `market_event_ticker.tsx` vào facade để đảm bảo 100% Anti-TIDD call-site wiring, đưa tổng số chu trình SCC toàn dự án từ 10 xuống còn 9 chu trình mà không làm phát sinh bất kỳ thay đổi hành vi runtime nào.

---

## 2. BẢNG TỔNG HỢP BẰNG CHỨNG QUY TRÌNH 4 TRẠM KHÉP KÍN

| Trạm Kiểm Soát | Vai Trò & Tệp Bằng Chứng | Chỉ Số Đạt Được | Kết Quả Thẩm Định |
| :--- | :--- | :--- | :---: |
| **Stage 0: Plan Review** | `adversarial-challenger` & `audit_plan.mjs`<br>[`.agents/audit/PLAN_AUDIT_IMP-411.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-411.md) | Thẩm định kế hoạch đạt 0 defects, 4 contract tests clean. | **HARDENED_APPROVED 🛡️** |
| **Trạm 1: RED Contract Test** | `qa-tester`<br>[`tests/client/imp411_market_ticker_seam_and_store_facade.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp411_market_ticker_seam_and_store_facade.test.ts) | 18 atomic tests, 57 asserts, 0 loops. Adversarial Inversion: Đã chứng minh RED runtime | **VERIFIED RED** 🎯 |
| **Trạm 2: GREEN Implementation** | `implementer`<br>[`.agents/evidence/IMP-411_snapshot.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/IMP-411_snapshot.json) | 4 production files, 100% tests (18/18) chuyển sang GREEN | **VERIFIED GREEN** 🟢 |
| **Trạm 2.5: Fast Pre-Filter** | `scout` & `fast_prefilter.mjs` | Typecheck `tsc --noEmit` exit 0, 0 dirty casts (`as any`), LOC budgets đạt chuẩn | **100% PASS** 🚀 |
| **Trạm 3.0: Dual-Viewport** | Puppeteer Headless Probe | Desktop (1280x800) [`imp-411_desktop.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-411_desktop.jpg) & Mobile (360x740) [`imp-411_mobile_360.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-411_mobile_360.jpg) | **CAPTURED** 📸 |
| **Trạm 3.1: Spec & Scope Gate** | `spec-reviewer`<br>[`.agents/audit/SPEC_REVIEW_IMP-411.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-411.md) | 100% Plan fidelity, zero scope creep, kiểm soát ranh giới phân hệ `client-ui`, `client-state` | **APPROVED** 📋 |
| **Trạm 3.2: Architecture & Anti-Slop** | `code-reviewer`<br>[`.agents/audit/CODE_REVIEW_IMP-411.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-411.md) | 0 Slop red flags, Zero TIDD, an toàn bộ nhớ/timer, assertion density 3.17 | **APPROVED** 🛡️ |
| **Trạm 3.2: UI/UX Craft Review** | `ui-craft-reviewer`<br>[`.agents/audit/UI_CRAFT_REVIEW_imp-411.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/UI_CRAFT_REVIEW_imp-411.md) | Công thái học touch target, khoảng cách an toàn (clearance), không tràn viền màn hình 360px | **APPROVED 🎨** |
| **Trạm 4: Chaos & Mutation Sentinel** | `chaos-sentinel`<br>[`scripts/check_evidence.mjs`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/check_evidence.mjs) | Bảo toàn tính toàn vẹn snapshot kiểm thử và số dòng LOC vật lý trên đĩa (Zero-Memorization). | **SNAPSHOT VERIFIED 📋** |

---

## 3. KẾT QUẢ VẬN HÀNH 4 TRẠM KHÉP KÍN & PHẢN HỒI THẨM ĐỊNH (AUDIT & SUBAGENT FEEDBACK)

### Trạm 0: Thẩm Định Đối Kháng Kế Hoạch (`adversarial-challenger` & `audit_plan.mjs`)
- **Phán quyết**: **HARDENED_APPROVED 🛡️**
- **Nhật ký thẩm tra**: Thẩm định kế hoạch đạt 0 defects, 4 contract tests clean.
- **Điểm mù kiến trúc / phản biện đối kháng đã giải tỏa**:
  - **[ADV-OBJ] Objective Validity**
    - **Target reachable?**: **Yes** — `MarketEventTicker` is actively mounted in production HUD [`src/client/ui/hud_container.tsx#L70`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/hud_container.tsx#L70) within `game_view.tsx`, rendering active market modifier banners in every match. `event_card_visuals.ts` is consumed by [`src/client/ui/modals/event_card_modal.tsx#L5`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/event_card_modal.tsx#L5), [`src/client/ui/modals/title_deed_modal.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/title_deed_modal.tsx), and `market_event_ticker.tsx`. Client stores (`game_store.ts`, `lobby_store.ts`, etc.) are actively bound at runtime.
    - **Baselines verified?**: **Yes** — Circular dependency cycle `[SCC-6]` verified on physical disk via `npm run lint:boundaries` (`market_event_ticker.tsx` $\leftrightarrow$ `modals/event_card_visuals.ts`).; Physical LOC baselines verified on disk: [`src/client/ui/market_event_ticker.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/market_event_ticker.tsx) (263 LOC), [`src/client/ui/modals/event_card_visuals.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/event_card_visuals.ts) (328 LOC), both within Tier 2 ceiling ($\le 500$ LOC).; Physical store subsystem cardinality: exactly 11 files verified in `src/client/store/`.; Raw external store imports: 190 call-sites across `src/**` outside `src/client/store/`, grounding the "41+ external call-sites" claim.; Store export contracts (`useGameStore`, `useLobbyStore`, `useEnvironmentStore`, `useVfxStore`, `useActivityStore`, `useAudioStore`, constants) verified against physical files on disk.
    - **Verdict**: **PASS**.
  - **[ADV-01] Partial AST Confinement Scope Blind-Spot (Coalescence of SCC-1 and SCC-2)**
    - **Vector**: Unstated Assumptions & Subsystem Drift (Vector 4 & Vector 8)
    - **Scenario**: TC-411.03 specifies: *"scans AST of all files in `src/client/events/**` and `src/client/network/**` to mechanically prove 0 files import from `store/index`, confirming `[SCC-1]` and `[SCC-2]` remain completely isolated without cycle coalescence."* However, physical graph analysis of `[SCC-1]` (16 files) reveals that it contains files OUTSIDE `src/client/events/**` and `src/client/network/**`: [`src/client/telemetry/telemetry_expected_delta.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/telemetry/telemetry_expected_delta.ts#L3) (currently imports `useActivityStore` from `../store/activity_store.js` and `GameState` from `../store/game_store.js`). [`src/client/store/game_store.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/game_store.ts) (member of SCC-1). Furthermore, `[SCC-2]` contains: [`src/client/offline_landing.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/offline_landing.ts) (imports `game_store.ts`). [`src/client/ui/modals/bot_trade_offer_strip.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/bot_trade_offer_strip.tsx) (imports `game_store.ts`). [`src/client/store/lobby_store.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/lobby_store.ts).
    - **Consequence**: An inadvertent future import in `telemetry_expected_delta.ts` or internal stores would silently bypass TC-411.03, collapsing the entire client networking, events, store, and telemetry layers into a giant circular dependency SCC.
    - **Hardening Directive**: In `tests/client/imp411_market_ticker_seam_and_store_facade.test.ts` (TC-411.03), expand the AST confinement inspection scope beyond `events/**` and `network/**` to include: `src/client/telemetry/**` (specifically `telemetry_expected_delta.ts`). `src/client/store/**` (all internal store files excluding `index.ts` itself, to prevent self-referential cycles).
  - **[ADV-02] Omission of Active Environment & Activity Pure Calculations from Facade**
    - **Vector**: Unstated Assumptions & Subsystem Drift (Vector 4)
    - **Scenario**: The plan establishes `src/client/store/index.ts` as the authoritative public facade for the `src/client/store/` subsystem. However, in `src/client/store/index.ts`'s exported symbol list (Plan §3), several live calculations actively consumed by external subsystems are omitted: `calculatePhaseFromProgress`: actively consumed by [`src/client/3d/time_of_day_lighting.tsx#L9`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/time_of_day_lighting.tsx#L9). `calculateAviationStrobe`: actively consumed by [`src/client/3d/diorama/diorama_container_port.tsx#L5`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_container_port.tsx#L5) and [`src/client/3d/diorama/diorama_skyline.tsx#L6`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_skyline.tsx#L6). `calculateLaserRotation`: live contract exported by [`src/client/store/environment_store.ts#L109`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/environment_store.ts#L109). `getNextTimeOfDayMode`: exported by [`src/client/store/environment_store.ts#L93`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/environment_store.ts#L93). `MAX_ACTIVITY_LOGS`: exported by [`src/client/store/activity_store.ts#L62`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/activity_store.ts#L62).
    - **Consequence**: External 3D and UI components attempting to comply with the Subsystem Facade Invariant (`GEMINI.md § Subsystem Facade Invariant: Primary subsystems MUST expose an authoritative index.ts public facade. External consumers MUST import exclusively via facades`) will be forced to violate boundary discipline by bypassing `store/index.ts` to import `calculatePhaseFromProgress` and `calculateAviationStrobe` from `src/client/store/environment_store.js`.
    - **Hardening Directive**: In `src/client/store/index.ts`, re-export `calculatePhaseFromProgress`, `calculateAviationStrobe`, `calculateLaserRotation`, and `getNextTimeOfDayMode` from `./environment_store.js`, and `MAX_ACTIVITY_LOGS` from `./activity_store.js`.
  - **[ADV-03] Direct ESM Re-export Invariant for Backward-Compatibility Parity**
    - **Vector**: Living Test Collision & Contract Regression (ADV-REG - Vector 6)
    - **Scenario**: Các tệp test sống như `imp141`, `imp276`, `visual_metadata_parity`, và `imp135` truy cập trực tiếp các hàm định dạng hoặc từ điển mô tả sự kiện thị trường. Nếu `market_event_ticker.tsx` tự ý tạo hàm bọc thay vì dùng direct ESM re-export, phép so sánh danh tính tham chiếu trong TC-411.04 sẽ thất bại.
    - **Consequence**: Phát sinh lỗi kiểm thử hồi quy hoặc phân bổ hàm closure không cần thiết trong vòng lặp render HUD.
    - **Hardening Directive**: [`src/client/ui/market_event_ticker.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/market_event_ticker.tsx) bắt buộc sử dụng trực tiếp cú pháp ESM re-export (`export { ALL_MARKET_TITLES, ... } from './market_event_helpers.js'`), bảo toàn 100% referential identity trong TC-411.04.
  - **[ADV-04] Strict Pure-Move Quarantine Check**
    - **Mutation Audit**: Extracted functions (`resolveMarketTitle`, `resolveMarketShortTag`, `resolveMarketEffectSummary`, `resolveMarketCompactFormula`, `resolveMarketIcon`) and constant dictionaries (`ALL_MARKET_TITLES`, `ACTIVE_MARKET_EFFECT_SUMMARIES`, `ACTIVE_MARKET_COMPACT_FORMULAS`) are verified to be moved 1:1 without semantic changes, input sanitization alterations, or error-swallowing try/catch blocks.
    - **Verdict**: Complies 100% with the Strict Pure-Move Quarantine Protocol. Zero smuggled mutations.

### Trạm 1: Bộ Kiểm Thử Hợp Đồng Độc Lập (`qa-tester`)
- **Tệp kiểm thử hợp đồng**: [`tests/client/imp411_market_ticker_seam_and_store_facade.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp411_market_ticker_seam_and_store_facade.test.ts)
- **Chỉ số kiểm thử**: **18 atomic tests**, **57 asserts** (mật độ trung bình: 3.17 asserts/test, 0 vòng lặp).
- **Adversarial Inversion Gate**:
  - Trạng thái: **Semantic Behavioral RED Verified (Thất bại do vi phạm ràng buộc runtime assertion khi chưa cập nhật code, không lỗi cú pháp)**.
  - **Bằng chứng thất bại (Failure Snippet)**:
```text
AssertionError: expected '' to be 'Sốt Đất Vĩ Mô' // Object.is equality (at tests/client/imp411_market_ticker_seam_and_store_facade.test.ts:120:56) and AssertionError: expected true to be false // Object.is equality (at tests/client/imp411_market_ticker_seam_and_store_facade.test.ts:209:31) and AssertionError: expected false to be true // Object.is equality (at tests/client/imp411_market_ticker_seam_and_store_facade.test.ts:217:32) and AssertionError: expected [Function resolveMarketTitle] to be [Function resolveMarketTitle] (at tests/client/imp411_market_ticker_seam_and_store_facade.test.ts:258:48)
```

### Trạm 2: Triển Khai Mã Nguồn Tối Thiểu (`implementer`)
- **Tệp mã nguồn thay đổi**:
  - `src/client/ui/market_event_helpers.ts` (Tạo mới: Seam định dạng và bảng ánh xạ 19 thẻ bài sự kiện thị trường/vĩ mô)
  - `src/client/ui/market_event_ticker.tsx` (Tái cấu trúc: Tiêu thụ store facade, re-export trực tiếp seam)
  - `src/client/ui/modals/event_card_visuals.ts` (Tái cấu trúc: Chuyển hướng import từ `market_event_helpers`, triệt tiêu `[SCC-6]`)
  - `src/client/store/index.ts` (Tạo mới: Facade công khai chuẩn mực cho phân hệ client store)
- **Chuyển trạng thái**: Toàn bộ **18/18 contract tests chuyển sang GREEN**.
- **Living Test Suites**: Bảo toàn nguyên vẹn, zero hồi quy logic hiện hành (82/82 tests pass across `imp411`, `imp135`, `imp141`, `visual_metadata_parity`, `imp276b`).

### Trạm 2.5: Fast Pre-Filter Mechanical Sweep (`scout` / `fast_prefilter.mjs`)
- **TypeScript**: `tsc --noEmit` vượt qua với 0 lỗi (Exit Code 0).
- **Dirty Casts**: Tuyệt đối không sử dụng `as any` hoặc dirty type casting.
- **LOC Ceilings**: Tất cả các tệp đều nằm trong hạn mức trần của từng phân hệ (Tier 1 <= 400, Tier 2 <= 500, Tier 3 <= 800, Test <= 600).

### Trạm 3: Thẩm Định Độc Lập Từ Đĩa Vật Lý (Independent Station 3 Reviews)
1. **Spec & Scope Gatekeeper (`spec-reviewer`)**:
    - **Phán quyết**: **APPROVED** 📋
    - **Xác nhận phạm vi**: 100% các thay đổi nằm trong phân hệ mục tiêu (`client-ui`, `client-state`), zero scope creep.
2. **Deep Architecture & Anti-Slop Auditor (`code-reviewer`)**:
    - **Phán quyết**: **APPROVED** 🛡️
    - **Chỉ số Anti-Slop**: 0 violations trên 6 cờ cảnh báo (Deep modules, Zero pass-through wrappers, Zero TIDD).
    - **Bộ nhớ & Timer**: Không rò rỉ listener, không bỏ sót timer cleanup, an toàn đa luồng/bất đồng bộ.
3. **UI/UX Craft & Ergonomics Auditor (`ui-craft-reviewer` / `game-3d-visual-critic`)**:
    - **Phán quyết**: **APPROVED 🎨**
   - **Desktop (1280x800)**: `.agents/tmp/imp-411_desktop.jpg`
   - **Mobile (360x740)**: `.agents/tmp/imp-411_mobile_360.jpg`
   - **Mobile Portrait (360x740)**:
   - **Touch Target Floor**: PASS (Các thẻ sự kiện trên thanh ticker dễ dàng chạm kích hoạt modal chi tiết).



### Trạm 4: Kiểm Soát Tính Toàn Vẹn & Snapshot Bất Biến (`chaos-sentinel`)
- **Phán quyết**: **SNAPSHOT VERIFIED 📋**
- **Hiệu quả kiểm soát**: Bảo toàn tính toàn vẹn snapshot kiểm thử và số dòng LOC vật lý trên đĩa (Zero-Memorization).
- **Xác nhận**: Đã vượt qua kiểm toán cơ học `node scripts/check_evidence.mjs` với 0 defects.

---

## 4. THỐNG KÊ BIẾN ĐỘNG DÒNG MÃ (LOC ACCOUNTING)

### 4.1. Phạm Vi Trực Tiếp Của Ticket IMP-411 (Direct Scope)

| Tệp Mã Nguồn | Đường Dẫn | Phân Hệ / Tier | LOC Thực Tế (SLOC) | Dòng Vật Lý (Disk) | Ngân Sách Trần | Trạng Thái |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `market_event_helpers.ts` | [`src/client/ui/market_event_helpers.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/market_event_helpers.ts) | Tier 2 (UI/3D/Views) | **126 SLOC** | 134 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `market_event_ticker.tsx` | [`src/client/ui/market_event_ticker.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/market_event_ticker.tsx) | Tier 2 (UI/3D/Views) | **140 SLOC** | 154 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `event_card_visuals.ts` | [`src/client/ui/modals/event_card_visuals.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/event_card_visuals.ts) | Tier 2 (UI/3D/Views) | **289 SLOC** | 327 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `src/client/store/index.ts` | [`src/client/store/index.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/index.ts) | Tier 1 (Domain/Server/Logic) | **60 SLOC** | 67 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `imp411_market_ticker_seam_and_store_facade.test.ts` | [`tests/client/imp411_market_ticker_seam_and_store_facade.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp411_market_ticker_seam_and_store_facade.test.ts) | Living Test | **237 SLOC** | 271 Lines | <= 600 LOC | ✅ Đạt chuẩn |

---

## 5. ĐÁNH GIÁ VẬN HÀNH & BÀN GIAO TIẾP THEO

### 5.1. Xác Nhận Triệt Tiêu Chu Trình Phụ Thuộc Vòng (SCC Metric)
- **Chỉ số SCC toàn dự án**: Giảm từ **10 xuống 9 chu trình**.
- **Chu trình xóa sổ**: Chu trình 2 tệp giữa [`src/client/ui/market_event_ticker.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/market_event_ticker.tsx) và [`src/client/ui/modals/event_card_visuals.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/event_card_visuals.ts) (trước đây là `[SCC-6]`) đã bị xóa sổ hoàn toàn nhờ bóc tách seam thuần túy [`src/client/ui/market_event_helpers.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/market_event_helpers.ts).
- **Thiết lập Facade Chuẩn**: Tạo lập [`src/client/store/index.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/index.ts) làm facade công khai duy nhất cho phân hệ store, kèm khóa kiểm thử AST chứng minh zero tệp từ `events/**`, `network/**`, `telemetry/**`, và `store/**` import từ facade, ngăn ngừa triệt để nguy cơ sáp nhập chu trình SCC-1/SCC-2.

### 5.2. Định Hướng Kỹ Thuật Cho Các Slice Kế Tiếp (Slice 2D / IMP-412+)
- **Hiện trạng 9 SCC còn lại trên toàn dự án**:
  - `[SCC-1]` (16 tệp): Client events & game_store / telemetry synthesizer.
  - `[SCC-2]` (15 tệp): Client events subscribers, network delta apply, lobby_store.
  - `[SCC-3]` (3 tệp): Client 3D pawn fallbacks (`legacy_pawn_fallbacks.tsx`, `luxury_pawn_fallbacks.tsx`, `luxury_pawn_models.tsx`).
  - `[SCC-4]` (3 tệp): Client 3D board (`instanced_toy_buildings.tsx`, `board_layout.tsx`, `batched_board_tiles.tsx`).
  - `[SCC-5]` (2 tệp): Client 3D penthouse lobby (`penthouse_lobby_scene.tsx`, `penthouse_enclosure.tsx`).
  - `[SCC-6]` (21 tệp): Server room session, turn loop, coordinators.
  - `[SCC-7]` (2 tệp): Server network turn bot scheduler (`turn_bot_timer_scheduler.ts`, `turn_orchestrator.ts`).
  - `[SCC-8]` (2 tệp): Server persistent room logger (`room_logger_cloud_sync.ts`, `persistent_room_logger.ts`).
  - `[SCC-9]` (2 tệp): Server admin manager (`admin_message_handler.ts`, `admin_manager.ts`).
- **Lộ trình đề xuất cho Slice 2D**:
  - Ưu tiên xử lý các cụm chu trình nhỏ độc lập trước: `[SCC-5]` (penthouse lobby, 2 tệp) hoặc `[SCC-3]` / `[SCC-4]` (3D pawns & board layout) ở client; hoặc `[SCC-7]`, `[SCC-8]`, `[SCC-9]` (các cặp 2 tệp ở server).
  - Chuẩn bị kế hoạch phân rã kiến trúc chuyên sâu cho hai siêu chu trình lớn `[SCC-1]` (16 tệp) và `[SCC-2]` (15 tệp) bằng các pure event/state seams tương tự như mẫu hình đã thành công ở IMP-409 và IMP-411.


