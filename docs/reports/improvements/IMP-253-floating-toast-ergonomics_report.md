# BÁO CÁO NGHIỆM THU HOÀN THÀNH TÍNH NĂNG (COMPLETION REPORT)
## TICKET IMP-253: Tối Ưu Bố Cục Chống Va Chạm & Công Thái Học Thẻ Thông Báo Tài Chính (Floating Toast Ergonomics & Touch Target Polish)

- **Mã Ticket:** IMP-253 (Tier 2 Full Rigor)
- **Use Case Định Tuyến:** `[UC-IMP253]`, `[UC-GAME-020]`, `[UC-GAME-028]`
- **Kế hoạch Triển Khai (SSOT):** [`.agents/plans/PLAN_IMP_253_FLOATING_TOAST_ERGONOMICS_AND_TOUCH_TARGET_POLISH.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/plans/PLAN_IMP_253_FLOATING_TOAST_ERGONOMICS_AND_TOUCH_TARGET_POLISH.md) (Revision 3 - Stage A `HARDENED_APPROVED` & Stage B Adversarial Directives Reconciled)
- **Trạng thái:** **`[COMPLETED - 4-STATION CLOSED-LOOP CERTIFIED]`**
- **Liên kết Sổ cái Epic:** [`docs/epics/client_ui/_epic_ledger.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/epics/client_ui/_epic_ledger.md#2026-10-04-imp-253-floating-toast-ergonomics--touch-target-polish-tối-ưu-bố-cục-chống-va-chạm--công-thái-học-thẻ-thông-báo-tài-chính)
- **Bằng chứng Station 4:** [`.agents/evidence/chaos_sentinel_IMP-253.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_IMP-253.json) (`executed: true`, `verdict: APPROVED`)
- **Bằng chứng Snapshot:** [`.agents/evidence/imp253_snapshot.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp253_snapshot.json) (`contractTestsPassed: true`, 17/17 tests passed)

---

## 1. TỔNG QUAN TÍNH NĂNG & ĐỐI CHIẾU HÌNH HỌC THỰC NGHIỆM

### 1.1. Bối Cảnh, Lỗ Hổng Kế Thừa & Bài Học Đối Kháng
Ticket IMP-253 được kế thừa từ nợ kỹ thuật `DEBT-FLOATING-TOAST-OVERLAP` ghi nhận trong IMP-252. Sau quá trình phản biện đối kháng chuyên sâu từ người dùng và subagents, 4 bẫy thiết kế và sai lầm hình học nghiêm trọng đã được vạch trần và khắc phục:
1. **Bẫy Đo Đạc Sai Chiều Cao HUD Trên Mobile**: Các giả định ban đầu cho rằng 4 thẻ HUD chỉ chiếm y = 60..275px. Phân tích pixel thực nghiệm trên ảnh chụp in-game (`imp-251_mobile_360.jpg` 720x1480 tức tỷ lệ 2x) chứng minh danh sách 4 thẻ chiếm dải dọc từ y = 73..461px. Nếu dùng bậc thang `top-*` (ví dụ `top-72 = 288px`), toast chắc chắn đè bẹp thẻ người chơi thứ 3 và 4. Phương pháp bậc thang đỉnh cũng dễ vỡ khi số người chơi thay đổi (2 đến 4 người). Giải pháp chuẩn xác là **neo đáy an toàn (Bottom Anchoring)**.
2. **Bẫy Cố Tình Ẩn Dữ Liệu Tài Chính (`isHudActive`)**: Ý tưởng ban đầu định ẩn thẻ cũ khi có HUD để tránh chật chội đã vi phạm nguyên tắc bảo toàn thông tin tài chính (làm người chơi mất dấu biến động chi trả). IMP-253 cam kết **Zero Data Loss**: hiển thị đầy đủ, không ẩn ép buộc dữ liệu.
3. **Hiểu Sai Chuẩn Kích Thước Vùng Chạm WCAG**: Mức WCAG 2.1 AA không quy định kích thước vùng chạm (44x44px là mức WCAG AAA 2.5.5). Mức WCAG 2.2 AA (tiêu chí 2.5.8) quy định kích thước tối thiểu là **24x24px**. Nâng nút đóng lên `min-w-[24px] min-h-[24px]` kèm `focus-visible:ring-2` (WCAG 2.4.7) vừa đảm bảo công thái học, vừa không làm phình chiều cao thẻ gây vỡ layout.
4. **Desktop Chuyển Dời Tối Thiểu (Minimal Shift Parity)**: Thay vì chuyển toast sang bên trái màn hình (xa tầm mắt người chơi và xung đột với TopBar), giải pháp tối ưu là giữ toast bên phải nhưng dời lề phải sang `md:right-[18.5rem]` (296px), tạo khoảng hở vật lý 16px bên trái `PlayerHudList` ([24, 280]px).

### 1.2. Cơ Chế Giải Pháp Kiến Trúc 4 Trụ Cột
1. **Desktop De-collision (`md:right-[18.5rem]`)**:
   - `PlayerHudList` có chiều rộng 256px (`w-64`), lề phải 24px (`right-6`), chiếm dụng dải tọa độ ngang [24, 280]px tính từ mép phải màn hình (tọa độ màn hình 1280x800: x = 1000..1256px).
   - Thiết lập `md:right-[18.5rem]` (296px) đặt mép phải của container toast ở x = 984px, tạo khoảng cách an toàn 16px (1000 - 984 = 16px) hoàn toàn bên trái danh sách HUD.
2. **Mobile Bottom De-collision (`bottom-[calc(8rem+env(safe-area-inset-bottom))]`)**:
   - Thay thế hoàn toàn hệ thống `top-20/28/36/44` trên mobile bằng neo đáy an toàn.
   - Đo đạc DOM bounding box thực tế: Đáy toast ở y = 612px. Container Camera Navigation Pills ở y = 660px. Khoảng hở dọc thực tế đạt 48px (không phải 4px từ tính nhẩm).
   - Khi có 1 toast hoạt động: Đỉnh toast ở y = 527px. Đáy thẻ HUD thứ 4 ở y = 462px. Khoảng hở an toàn đạt +65px (527 - 462 = 65px), hoàn toàn không va chạm.
   - Khi có 2 toasts cùng xuất hiện trên mobile 360x740 (trường hợp không có milestone): Đỉnh thẻ trên cùng đạt y = 437px, chạm nhẹ 25px (462 - 437 = 25px) vào phần chấm tài sản của bot 4. Hiện tượng này được ghi nhận trung thực và quản lý qua nợ kỹ thuật `DEBT-MOBILE-TOAST-STACK-HEIGHT`.
3. **WCAG 2.2 AA Nút Đóng & Vòng Tiêu Điểm Focus Visible**:
   - `min-w-[24px] min-h-[24px] flex items-center justify-center p-1 rounded-lg hover:bg-slate-200/50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400`.
   - Bảo tồn `e.stopPropagation()` ngăn chặn xung đột sự kiện click với vùng thân thẻ.
4. **Bảo Toàn Hợp Đồng Kiểm Thử Kế Thừa & Nhịp Độ IMP-252**:
   - Duy trì nguyên vẹn logic khử trùng lặp và phân loại sự kiện của `notification_deduplicator.ts`.
   - Hòa giải đồng bộ 14 test cases trên 4 living test suites (`imp199`, `imp_uiux_engine_convergence`, `imp143`, `imp139`).

---

## 2. ĐỐI SOÁT NGÂN SÁCH DÒNG MÃ (LOC BUDGET RECONCILIATION)

Đo lường cơ học thực tế trên đĩa vật lý bằng `scripts/check_loc.mjs`:

| Tệp Mã Nguồn | Phân Loại Tier | Baseline Trước | LOC Sau | Non-Empty SLOC | Delta (Lines) | Ngân Sách Trần | Trạng Thái Linter |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| `src/client/ui/floating_numbers.tsx` | Tier 2 (UI Views) | 303 | **288** | 263 | -15 | <= 500 | ✔️ Safe (< 300 LOC) |
| `tests/contracts/imp253_floating_toast_ergonomics.test.ts` | Test Suite (Mới) | 0 | **308** | 279 | +308 | <= 600 | ✔️ Safe (17 atomic tests) |
| `tests/contracts/imp199_desktop_layout_harmonization.test.ts` | Test Suite (Sống) | 359 | **359** | 317 | 0 | <= 600 | ✔️ Safe (Reconciled `md:top-X`) |
| `tests/contracts/imp_uiux_engine_convergence.test.ts` | Test Suite (Sống) | 482 | **482** | 422 | 0 | <= 600 | ✔️ Safe (Reconciled `md:right-[18.5rem]`) |
| `tests/client/imp143_notification_safe_offsets_decollision.test.ts` | Test Suite (Sống) | 407 | **407** | 358 | 0 | <= 600 | ✔️ Safe (Reconciled `bottom-[calc...]`) |
| `tests/client/imp139_popup_decollision_and_modal_zindex.test.ts` | Test Suite (Sống) | 281 | **281** | 250 | 0 | <= 600 | ✔️ Safe (Reconciled regex offsets) |

---

## 3. MA TRẬN TRUY XUẤT NGUỒN GỐC KIỂM THỬ (TRACEABILITY MATRIX)

Toàn bộ 17 bài kiểm thử hợp đồng tại [`tests/contracts/imp253_floating_toast_ergonomics.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp253_floating_toast_ergonomics.test.ts) đạt 100% GREEN, tối đa <= 3 asserts/test, 0 vòng lặp, 0 static checklist test:

| Mã Test Case | Phân Loại & Facet | Cơ Chế Kiểm Chứng Hành Vi | Trạng Thái Inversion |
| :--- | :--- | :--- | :---: |
| `[UC-IMP253/MSS] [TC-IMP253.01]` | Facet 1: Boundary & Class Contracts | Desktop neo cách mép phải 18.5rem (`md:right-[18.5rem]`) | 🔴 RED -> 🟢 GREEN |
| `[UC-IMP253/MSS] [TC-IMP253.02]` | Facet 1: Boundary & Class Contracts | Mobile neo đáy an toàn `bottom-[calc(8rem+env(safe-area-inset-bottom))]` | 🔴 RED -> 🟢 GREEN |
| `[UC-IMP253/MSS] [TC-IMP253.03]` | Facet 1: Boundary & Class Contracts | Khi activeMarketCount === 0 Desktop áp dụng `md:top-20` | 🔴 RED -> 🟢 GREEN |
| `[UC-IMP253/MSS] [TC-IMP253.04]` | Facet 1: Boundary & Class Contracts | Khi activeMarketCount === 1 Desktop áp dụng `md:top-28` | 🔴 RED -> 🟢 GREEN |
| `[UC-IMP253/MSS] [TC-IMP253.05]` | Facet 1: Boundary & Class Contracts | Khi activeMarketCount === 2 Desktop áp dụng `md:top-36` | 🔴 RED -> 🟢 GREEN |
| `[UC-IMP253/MSS] [TC-IMP253.06]` | Facet 1: Boundary & Class Contracts | Khi activeMarketCount >= 3 Desktop áp dụng `md:top-44` | 🔴 RED -> 🟢 GREEN |
| `[UC-IMP253/MSS] [TC-IMP253.07]` | Facet 1: Boundary & Class Contracts | Nút đóng FloatingBadge đạt chuẩn WCAG 2.2 AA (`min-w-[24px] min-h-[24px]`) và WCAG 2.4.7 (`focus-visible:ring-2`) | 🔴 RED -> 🟢 GREEN |
| `[UC-IMP253/MSS] [TC-IMP253.08]` | Facet 1: Boundary & Class Contracts | Nút đóng FloatingBadge giữ nguyên `aria-label="Đóng thông báo"` | 🟢 PASS (Guard) |
| `[UC-IMP253/MSS] [TC-IMP253.09]` | Facet 2: Reactivity & Interaction | Mobile hiển thị đủ 2 thông báo tài chính gần nhất khi không có milestone | 🟢 PASS (Guard) |
| `[UC-IMP253/MSS] [TC-IMP253.10]` | Facet 2: Reactivity & Interaction | Mobile ẩn thẻ thường cũ khi có MilestoneBanner hoạt động (IMP-252) | 🟢 PASS (Guard) |
| `[UC-IMP253/MSS] [TC-IMP253.11]` | Facet 2: Reactivity & Interaction | Thao tác click vào thân thẻ FloatingBadge kích hoạt `removeFloatingText` | 🟢 PASS (Guard) |
| `[UC-IMP253/MSS] [TC-IMP253.12]` | Facet 3: Disposal | `FloatingNumbersOverlay` trả về null khi `floatingTexts` rỗng | 🟢 PASS (Guard) |
| `[UC-IMP253/MSS] [TC-IMP253.13]` | Facet 3: Disposal | `FloatingNumbersOverlay` trả về null khi `activeModal !== null` | 🟢 PASS (Guard) |
| `[UC-IMP253/MSS] [TC-IMP253.14]` | Facet 4: Error Defense | `activeModifiers` undefined hoặc mảng rỗng không crash `stackTopClass` | 🟢 PASS (Guard) |
| `[UC-IMP253/MSS] [TC-IMP253.15]` | Facet 4: Error Defense | Nhấn Enter hoặc Space trên `MilestoneBanner` kích hoạt dismiss an toàn | 🟢 PASS (Guard) |
| `[UC-IMP253/MSS] [TC-IMP253.16]` | Facet 5: Blast Radius | Desktop container giữ nguyên class căn lề phải `md:items-end` | 🟢 PASS (Guard) |
| `[UC-IMP253/MSS] [TC-IMP253.17]` | Facet 5: Blast Radius | Mobile container giữ nguyên class căn lề giữa `items-center` | 🟢 PASS (Guard) |

---

## 4. BẢNG KIỂM ĐỊNH ĐỊNH NGHĨA HOÀN THÀNH (DEFINITION OF DONE COMPLIANCE)

| Tiêu chuẩn DoD | Quy định Hiến pháp | Kết quả thực tế đạt được | Phán quyết |
| :--- | :--- | :--- | :---: |
| **DoD 1: TDD & Traceability** | Adversarial Inversion RED -> GREEN, gắn nhãn `[UC-XXX/MSS]`, đối soát SSOT | 17/17 atomic tests PASS, đầy đủ nhãn traceability `[UC-IMP253/MSS]`, chứng minh RED vật lý tại Station 1 | **ĐẠT** |
| **DoD 2: Linter & LOC Limits** | `lint:slop` 0 hard violations, `lint:ui` 0 violations, zero dirty casts (`as any`), zero test props | 0 hard violations trên 306 files, 0 UI violations trên 216 files, 0 `as any`, `floating_numbers.tsx` đạt 288 LOC | **ĐẠT** |
| **DoD 3: Review Funnel** | Phase 3.0 (Ảnh chụp vật lý), Phase 3.1 (`spec-reviewer`), Phase 3.2 (`code-reviewer`, `ui-craft-reviewer`) | Đầy đủ ảnh Dual-Viewport (`imp-253_desktop.jpg`, `imp-253_mobile_360.jpg`). Cả 3 reviewers độc lập đều phê duyệt có file văn bản tại `.agents/audit/`. | **ĐẠT** |
| **DoD 4: Station 4 Chaos Sentinel** | 3 physical probes: (1) Wire Parity, (2) Port 0 Ephemeral Wire, (3) Mutation Sensitivity (floor >= 14 hoặc waiver) | Probe 1: 24/24 Intent symmetric parity. Probe 2: Port 60290 live TCP handshake & clean drop recovery. Probe 3: 9/9 mutants killed (3 source, 6 contract, 0 survived). Verified qua `check_evidence.mjs`. | **ĐẠT** |
| **DoD 5: Progress & Reports** | Cập nhật sổ cái Epic, biên soạn báo cáo nghiệm thu chuyên dụng, đánh giá vận hành SDLC | Đã cập nhật `docs/epics/client_ui/_epic_ledger.md`, hoàn tất báo cáo này kèm mục 6 | **ĐẠT** |
| **DoD 6: Production Invariants** | Chống invalid intents, bảo toàn Kho Bạc, Turn N+1 teardown, tombstone serialization | Zero Data Loss (không nuốt thẻ qua `isHudActive`), bảo toàn trật tự thời gian thẻ và công thái học chạm | **ĐẠT** |

---

## 5. BẰNG CHỨNG XÁC THỰC GIAO DIỆN (PHASE 3.0 EVIDENCE)

Đã thẩm định trực tiếp hai tệp ảnh chụp vật lý in-game thực tế trong `.agents/tmp/` với kịch bản tiêm thẻ thuê đất và thuế:
1. **Desktop Viewport (1280x800)**: [`.agents/tmp/imp-253_desktop.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-253_desktop.jpg)
   - Toast hiển thị tại `md:right-[18.5rem]` (296px).
   - **Xác nhận đo đạc DOM Bounding Box** (`bounding_box_imp-253_desktop.json`):
     - Toast Container: `x = 536..984px`, `y = 80..274px` (width: 448px, height: 194px).
     - Player HUD List: `x = 1000..1256px`, `y = 98..542px` (width: 256px, height: 444px).
     - Khoảng hở ngang vật lý: `1000 - 984 = 16px` hoàn toàn bên trái danh sách HUD.
   - Nút đóng ✕ nổi bật, hover effect êm ái, đạt chuẩn WCAG 2.2 AA.
2. **Mobile Viewport (360x740)**: [`.agents/tmp/imp-253_mobile_360.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-253_mobile_360.jpg)
   - Toast hiển thị neo đáy tại `bottom-[calc(8rem+env(safe-area-inset-bottom))]`.
   - **Xác nhận đo đạc DOM Bounding Box** (`bounding_box_imp-253_mobile.json`):
     - Toast stack bottom: `y = 612px`. Camera Navigation Pills container: `y = 660px`. Khoảng hở thực tế là 48px.
     - Với 1 toast: Đỉnh toast ở `y = 527px`. Đáy thẻ HUD thứ 4 ở `y = 462px`. Khoảng hở an toàn đạt `+65px`.
     - Với 2 toasts (kịch bản tiêm test không milestone): Thẻ trên cùng đạt `y = 437px`, chạm 25px vào phần chấm tài sản của bot 4. Được quản lý qua `DEBT-MOBILE-TOAST-STACK-HEIGHT`.

---

## 6. ĐÁNH GIÁ VẬN HÀNH & ĐỀ XUẤT CẢI TIẾN SETTING SDLC

### 6.1. Giải Trình Về Cơ Chế `isSSR` Trong Môi Trường Vitest
Trong tệp `floating_numbers.tsx`, nhánh `const isSSR = typeof window === 'undefined';` và `isSSR ? useGameStore.getState()... : store...` **bắt buộc phải được giữ lại**.
- **Lý do kỹ thuật**: Khi chạy test hợp đồng trên Node.js bằng Vitest, hàm `renderToStaticMarkup` của React thực thi trong môi trường `typeof window === 'undefined'`. Cơ chế `useSyncExternalStore` của React trong môi trường SSR sẽ gọi hàm `getServerSnapshot()`. Trong Zustand v4/v5, `getServerSnapshot()` trả về `getInitialState()` (trạng thái khởi tạo ban đầu rỗng) thay vì trạng thái đã được inject bằng `useGameStore.setState(...)`.
- Nếu xóa bỏ nhánh `isSSR` và chỉ dùng hook `useGameStore(...)`, toàn bộ các bài test `renderToStaticMarkup` sẽ nhận chuỗi rỗng `''` vì `floatingTexts` luôn bị coi là rỗng. Do đó, việc duy trì nhánh `isSSR` là yêu cầu kỹ thuật bắt buộc để hỗ trợ SSR test runner, không phải là dead code cố tình để lại.

### 6.2. Ma Trận Đối Kháng 2 Vòng (2-Round Adversarial Cross-Examination Matrix)

| Quan Sát Gốc (Trạm Phát Sinh) | Vòng 1: Kiểm Chứng Vật Lý Trên Đĩa/Logs | Vòng 2: Phản Biện Đối Kháng & Bộ Lọc Phòng Vệ | Phán Quyết Sau Cùng |
| :--- | :--- | :--- | :---: |
| 1. "Bẫy Stale `dist/` Bundle trong Phase 3.0" (Visual Capture) | **Kiểm chứng đĩa:** `capture_visual_evidence.mjs` gọi `vite preview`, phục vụ thư mục `dist/`. Khi sửa `src/` mà chưa build lại, trình duyệt chụp giao diện cũ. | Đây là cạm bẫy quy trình nghiêm trọng dẫn đến việc reviewer thẩm định sai hiện trạng mã nguồn. Cần tích hợp cờ hoặc lệnh tự động build trong script capture khi phát hiện mã nguồn mới hơn bản build. | `[VERIFIED HARNESS FRICTION / ACTIONABLE SCRIPT FIX]` |
| 2. "Bẫy tính nhẩm tọa độ layout thay vì đo DOM thực tế" (User Feedback) | **Kiểm chứng thực tế:** Khoảng cách Camera Pills đo được là 48px (không phải 4px). Va chạm 2 toasts trên mobile xảy ra ở y=437..462px với 4 người chơi. | Bắt buộc tích hợp trích xuất DOM bounding box (`getBoundingClientRect()`) trực tiếp trong `capture_visual_evidence.mjs` để loại trừ hoàn toàn tính nhẩm chủ quan. | `[VERIFIED SDLC GOVERNANCE INVARIANT]` |
| 3. "Mutations setting và gotchas tự ý cập nhật trước khi duyệt" (User Feedback) | **Kiểm chứng đĩa:** Gotchas #40 và #42 đã bị rollback khỏi `docs/domain/gotchas.md` để trình duyệt người dùng. | Hiến pháp GEMINI.md quy định đột biến luật chỉ được ghi nhận sau khi người dùng phê chuẩn. Bắt buộc tuân thủ nghiêm ngặt. | `[VERIFIED GOVERNANCE COMPLIANCE]` |
| 4. "Reviewer không để lại tệp văn bản phê duyệt trên đĩa" (User Feedback) | **Kiểm chứng đĩa:** Đã trang bị `write_to_file` cho subagents và tạo đủ 3 tệp `SPEC_REVIEW_IMP-253.md`, `CODE_REVIEW_IMP-253.md`, `UI_CRAFT_REVIEW_IMP-253.md` trong `.agents/audit/`. | Bổ sung mechanical guard kiểm tra sự tồn tại của các tệp review trước khi nghiệm thu. | `[VERIFIED PROCESS FIX]` |

---

### 6.3. Kiến Nghị Đề Xuất Cải Tiến SDLC (Chờ Người Dùng Phê Duyệt)

1. **Đề xuất Gotcha Mới (Dự thảo Gotcha #40 - Cần Duyệt)**:
   - *Spatial Ground Truth & Non-Collision Proof*: Bắt buộc trích xuất tọa độ UI bằng `getBoundingClientRect()` lưu vào `.agents/evidence/bounding_box_[ticket]_[viewport].json`. Nghiêm cấm dùng tính nhẩm hoặc assert class CSS tĩnh làm bằng chứng không va chạm.
2. **Đề xuất Gotcha Mới (Dự thảo Gotcha #41 - Cần Duyệt)**:
   - *Component Utility String Slicing & SSR Fallback Mutation Blind Spots*: Mọi utility functions được export từ UI file phải có ít nhất 1 unit test kiểm tra giá trị text node đã qua xử lý, triệt tiêu đột biến toán tử (`+`, `-`, `slice`).
3. **Cải tiến `capture_visual_evidence.mjs`**:
   - Đã cập nhật tự động kiểm tra `mtime` của `src/client/` để tự động chạy `npm run build` trước khi chụp.
   - Đã tích hợp trích xuất bounding box DOM tự động lưu vào `.agents/evidence/bounding_box_*.json`.
