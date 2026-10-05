# BÁO CÁO NGHIỆM THU MICRO-SLICE: IMP-267
# MODAL CAROUSEL LẬT THẺ ĐA SỰ KIỆN THỊ TRƯỜNG & DYNAMIC DERIVATION

> **Mã Nhiệm Vụ:** IMP-267 (Micro-Slice)  
> **Tiêu đề:** Active Market Event Carousel Navigation & Dynamic Derivation  
> **Phân loại:** Tier 2 Micro-Slice (Lean Plan Specification, Single Subsystem)  
> **Phân hệ mục tiêu:** Client 2D UI & Ergonomics (`src/client/ui/modals/event_card_modal.tsx`, `src/client/ui/market_event_ticker.tsx`)  
> **Trạng thái:** **HOÀN THÀNH - SẴN SÀNG TÍCH HỢP (PASS 4 TRẠM KHÉP KÍN)**  
> **Ngày thực hiện:** 2026-10-05  

---

### 1. BẢNG ĐỐI SOÁT TRACEABILITY & FLOW TAXONOMY

| Mã Bài Test | Phân Loại Flow | Mục Tiêu Kiểm Chứng Hợp Đồng | Trạng Thái Trạm 1 | Trạng Thái Trạm 2 |
| :--- | :---: | :--- | :---: | :---: |
| **TC-267.01** | `[UC-IMP267/MSS]` | Store chỉ có 1 active modifier -> render EventCardModal không chứa carousel nav | 🔴 RED (nav hidden) | 🟢 GREEN (Passed) |
| **TC-267.02** | `[UC-IMP267/MSS]` | `cardType === 'chance'` -> render EventCardModal không chứa carousel nav | 🔴 RED (chance) | 🟢 GREEN (Passed) |
| **TC-267.03** | `[UC-IMP267/MSS]` | Store có 3 active modifiers -> render EventCardModal chứa `event-card-carousel-nav` và đủ 3 tab pills | 🔴 RED (not null) | 🟢 GREEN (Passed) |
| **TC-267.04** | `[UC-IMP267/MSS]` | Mở modal với `cardId` là modifier thứ 2 -> khởi tạo đúng `activeIdx = 1` | 🔴 RED (active pill) | 🟢 GREEN (Passed) |
| **TC-267.05** | `[UC-IMP267/MSS]` | Bấm nút Next -> chuyển sự kiện 2, tiêu đề và mô tả đổi theo sự kiện 2 (triệt tiêu Props Stale Shadowing) | 🔴 RED (shadowing) | 🟢 GREEN (Passed) |
| **TC-267.06** | `[UC-IMP267/MSS]` | Bấm nút Prev ở thẻ đầu tiên -> xoay vòng khép kín (modulo wrap-around) sang thẻ cuối cùng | 🔴 RED (prev wrap) | 🟢 GREEN (Passed) |
| **TC-267.07** | `[UC-IMP267/MSS]` | Bấm trực tiếp vào tab pill thứ 3 -> nhảy trực tiếp sang sự kiện thứ 3 | 🔴 RED (tab jump) | 🟢 GREEN (Passed) |
| **TC-267.08** | `[UC-IMP267/MSS]` | Bấm nút CTA ở thẻ trung gian (1/3) -> nhảy sang thẻ tiếp theo (2/3), không kích hoạt `onConfirm`/`onClose` | 🔴 RED (cta stepper) | 🟢 GREEN (Passed) |
| **TC-267.09** | `[UC-IMP267/A1]` | Bấm nút CTA ở thẻ cuối cùng (3/3) với nhãn "ĐÃ HIỂU TẤT CẢ" -> gọi `onConfirm` / `onClose` đóng modal | 🔴 RED (close call) | 🟢 GREEN (Passed) |
| **TC-267.10** | `[UC-IMP267/MSS]` | `MarketEventTicker` với 3 active modifiers -> tooltip báo "Bấm xem toàn bộ 3 sự kiện" và badge "+2 sự kiện" | 🔴 RED (ticker text) | 🟢 GREEN (Passed) |
| **TC-267.11** | `[UC-IMP267/MSS]` | Cập nhật động store từ 1 sang 3 modifiers khi modal đang mounted -> không gây lỗi vi phạm React Hook count | 🔴 RED (hook count) | 🟢 GREEN (Passed) |
| **TC-267.12** | `[UC-IMP267/MSS]` | A11y Keyboard Arrow Navigation: Phím `ArrowRight`/`ArrowLeft` lật thẻ sự kiện mượt mà | 🔴 RED (no keydown) | 🟢 GREEN (Passed) |
| **TC-267.13** | `[UC-IMP267/MSS]` | Fast Dismiss Affordance: Nút "Bỏ qua & Đóng tất cả" đóng modal ngay lập tức khi đang ở bước trung gian | 🔴 RED (no skip btn) | 🟢 GREEN (Passed) |

---

### 2. BẢNG ĐÁNH GIÁ TIÊU CHÍ NGHIỆM THU (DEFINITION OF DONE)

| Tiêu Chí DoD | Rào Chắn / Yêu Cầu Cơ Học | Bằng Chứng Vật Lý Thực Tế | Kết Quả |
| :--- | :--- | :--- | :---: |
| **DoD #1: Flow Taxonomy** | 100% ca test mang nhãn `[UC-IMP267/MSS]` hoặc `[UC-IMP267/A1]` | 13 bài test mang chuẩn Flow Taxonomy (12 MSS + 1 Alternate) | ✔️ PASS |
| **DoD #2: Anti-TIDD Compliance** | Cấm bọc React Hooks trong `try...catch` hay đặt điều kiện để chiều chuộng test rác | Xóa sạch 100% `isReactContext` và `try...catch`, chuẩn hóa test cũ `imp214` vào React render phase | ✔️ PASS |
| **DoD #3: Anti-Props Shadowing** | Toàn bộ dữ liệu hiển thị thẻ khi `isMultiEvent` phải derive động | `resolvedTitle`, `singleTruthDescription`, `heroStat`, `affectedCells` tính toán theo `candidateModifiers[activeIdx]` | ✔️ PASS |
| **DoD #4: Mobile 360px Ergonomics** | Touch target >= 44px (Hit-slop) và gradient mask làm mềm biên tab pills | Nút `‹` và `›` có `after:-inset-1.5` đạt 44px; tab container có `mask-image` không cắt cụt chữ | ✔️ PASS |
| **DoD #5: A11y Keyboard & Fast Dismiss** | Hỗ trợ phím mũi tên và nút thoát nhanh không ép buộc phải bấm hết Stepper | Lắng nghe `ArrowRight`/`ArrowLeft`, bổ sung nút "Bỏ qua & Đóng tất cả" giải quyết xung đột Mental Model | ✔️ PASS |
| **DoD #6: Mechanical Pre-Closing Gate** | `npm run prefilter` & `node scripts/check_evidence.mjs IMP-267` | Cả 2 script thoát mã 0 (PASS toàn diện typecheck, LOC, zero dirty casts, anti-slop, UI linter, i18n parity) | ✔️ PASS |

---

### 3. TỔNG HỢP SỐ LIỆU TỪ CÁC FILE BẰNG CHỨNG MÁY ĐỌC (MACHINE EVIDENCE)

Toàn bộ số liệu được trích xuất trực tiếp từ các tệp bằng chứng số trong `.agents/evidence/`:

- **Trạm 1 Evidence ([`station1_IMP-267.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/station1_IMP-267.json))**:
  - `executed`: `true`
  - `redVerified`: `true` (Tests ban đầu thất bại vì logic carousel nav và các tính năng tương tác chưa tồn tại)
  - `testCount`: 13
  - `expectCount`: 29
  - `assertDensityRatio`: 2.23 asserts/test (tất cả các test đều <= 4 asserts, tuân thủ nghiêm ngặt chuẩn nguyên tử)
  - `blastRadiusPassed`: `true` (58/58 regression tests passed, tổng 71/71 tests GREEN)
- **Trạm 2 Evidence ([`IMP-267_snapshot.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/IMP-267_snapshot.json))**:
  - `executed`: `true`
  - `greenVerified`: `true` (13/13 contract tests passed)
  - `regressionTestsPassed`: 58/58 passed
  - `modifiedFiles`: `src/client/ui/modals/event_card_modal.tsx` (386 LOC, Tier 2 safe <= 500 LOC), `src/client/ui/market_event_ticker.tsx` (273 LOC, Tier 2 safe <= 500 LOC)
- **Trạm 3 Review Reports**:
  - [`SPEC_REVIEW_IMP-267.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-267.md): 🟢 **APPROVED** (100% plan fidelity, zero scope drift)
  - [`CODE_REVIEW_IMP-267.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-267.md): 🟢 **APPROVED** (Fix round verified: triệt tiêu conditional React hook, thanh lọc sạch sẽ try...catch bảo đảm 100% React Rules of Hooks)
  - [`UI_CRAFT_REVIEW_IMP-267.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/UI_CRAFT_REVIEW_IMP-267.md): 🟢 **APPROVED** (Fix round verified: ảnh chụp thực địa dual-viewport hiển thị active modal 100%, 44px hit-slop cho nút lật, gradient mask biên mềm cho tab pills)
  - Ảnh thực địa vật lý: [`.agents/tmp/imp-267_desktop.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-267_desktop.jpg) (1280x800) và [`.agents/tmp/imp-267_mobile_360.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-267_mobile_360.jpg) (360x740)
- **Trạm 4 Evidence ([`chaos_sentinel_IMP-267.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_IMP-267.json))**:
  - `executed`: `true`
  - `isMicroSlice`: `true`
  - `closedLoopParity`: `PASS` (24/24 Intent symmetric parity, 0 gaps)
  - `ephemeralBoundaryProbe`: `PASS` (Live TCP WebSocket on dynamic port 51750, abrupt drop survived)
  - `mutationSensitivityProbe`: `PASS` (16/16 mutants killed, 100% kill rate, 0 survived)
  - `verdict`: `APPROVED`

---

### 4. ĐÁNH GIÁ VẬN HÀNH & ĐỀ XUẤT CẢI TIẾN SETTING SDLC (HARNESS RETRO)

#### Vòng 1: Kiểm Chứng Bằng Chứng Vật Lý (Physical Evidence Cross-Examination)
1. **Phát hiện về React Hooks trong `try...catch` và `if (isReactContext)`**: Mã nguồn production từng chứa đoạn bọc hooks dị tật để đối phó với bài test cũ `TC-214.11` gọi component như một hàm JS thông thường.
   - *Đánh giá:* **Physical Evidence Found**. Đã xóa sạch 100% `try...catch` và `isReactContext` khỏi `event_card_modal.tsx`, chuẩn hóa bài test `imp214` vào React context rendering bằng `renderToStaticMarkup(React.createElement(...))` mà không làm bẩn mã nguồn production.
2. **Phát hiện về Touch Target & Edge Masking trên Mobile 360px**: Nút `‹` và `›` hiển thị 32px trực quan nhưng cần đạt 44px touch floor; dải tab pills bị cắt biên đột ngột khi cuộn.
   - *Đánh giá:* **Physical Evidence Found**. Bổ sung CSS hit-slop `after:absolute after:-inset-1.5` nâng vùng cảm ứng thực tế lên 44x44px mà không làm vỡ bố cục 36px; thêm `[mask-image:linear-gradient(...)]` làm mềm hai biên trái/phải của danh sách tab pills.
3. **Phát hiện về A11y Keyboard Navigation & Mental Model CTA**: Thiếu phím mũi tên bàn phím và nút CTA biến thành Stepper gây cản trở người chơi muốn tắt nhanh popup.
   - *Đánh giá:* **Physical Evidence Found**. Thêm `useEffect` bắt phím `ArrowRight`/`ArrowLeft` và nút phụ "Bỏ qua & Đóng tất cả" (`event-skip-all-btn`) bên dưới CTA chính để người chơi có thể thoát modal bất kỳ lúc nào.

#### Vòng 2: Phản Biện Đối Kháng & Bộ Lọc Quy Tắc (Adversarial Inversion & Guardrail Filter)
- **Đề xuất từ re-reviewer & adversarial feedback**: Tích hợp quy tắc kiểm tra *React Rules of Hooks* vào script `fast_prefilter.mjs` để cơ học bẫy ngay lập tức mọi câu lệnh gọi hook bên trong `if`, `for`, `while` hoặc `try...catch` ở Station 2.5 trước khi chuyển giao sang Station 3.
  - *Phán quyết & Trạng thái xử lý:* `[VERIFIED SYSTEMIC FRICTION] - ĐÃ HOÀN TẤT TRIỂN KHAI TRỰC TIẾP`. Theo chỉ đạo tường minh từ Người dùng (miễn trừ thủ tục tạo ticket riêng để tối ưu hóa tiến độ), quy tắc đã được tích hợp cơ học bằng thuật toán AST/Regex trực tiếp trong Bước 3 của [`scripts/fast_prefilter.mjs`](file:///c:/Users/HP/Documents/GitHub/vtcoon/scripts/fast_prefilter.mjs). Cơ chế này hoạt động với zero-dependency (không làm phình `package.json` với gói ESLint nặng), tự động chặn đứng mọi hành vi bọc hook sai chuẩn ngay tại Station 2.5. Đồng thời đã cập nhật đồng bộ các bất biến vào `ui_ergonomics.md` (Gotcha 20), `testing_traps.md` (Gotcha 10), `implementer.md`, `ui-craft-reviewer.md`, và `GEMINI.md`.

---

### 5. TỔNG KẾT PULL REQUEST & NGUY CƠ HÒA NHẬP (MERGE DANGER)

- **Tóm tắt thay đổi**:
  - `src/client/ui/modals/event_card_modal.tsx`: Nâng cấp hiển thị dạng Carousel với thanh điều hướng đơn hàng (Single-row Nav), các nút lật thẻ `‹` / `›` có hit-slop 44px, dải tab pills có gradient mask biên cuộn, xóa bỏ bóng ma props bằng Dynamic Derivation, hỗ trợ phím mũi tên `ArrowLeft`/`ArrowRight`, nút CTA đóng vai trò Stepper chuyển thẻ và nút phụ "Bỏ qua & Đóng tất cả" giải tỏa áp lực mental model.
  - `src/client/ui/market_event_ticker.tsx`: Cập nhật tooltip thông báo rõ người dùng có thể nhấp chuột để xem toàn bộ danh sách N sự kiện đang hiệu lực.
  - `tests/contracts/imp267_active_market_event_carousel.test.ts`: 13 bài test hợp đồng Detroit Classical kiểm chứng 100% các luồng nghiệp vụ MSS và Alternate, bắt trúng các hành vi lật thẻ bàn phím và đóng nhanh.
  - `tests/contracts/imp214_ma_event_card_transparency.test.ts`: Chuẩn hóa lời gọi test cũ vào React rendering context, xóa sạch ép kiểu bẩn `(room as any).lastMaBuyout`.
- **Nguy cơ hòa nhập (Merge Danger)**: **RẤT THẤP (1.5/10)**.
  - *Lý do đánh giá 1.5/10 thay vì 0/10:*
    1. Thay đổi Mental Model của nút CTA đáy (từ Đóng trực tiếp sang Stepper lật thẻ) tạo ra một khoảng trễ nhận thức nhẹ đối với người chơi có thói quen bấm nhanh để đóng popup (đã được giảm thiểu triệt để nhờ nút "Bỏ qua & Đóng tất cả").
    2. Việc chuẩn hóa test cũ `imp214` tác động tới 1 tệp test hợp đồng của tính năng trước đó (dù toàn bộ 71/71 tests hồi quy chạy xanh 100%).
  - 100% test hợp đồng (13/13) và test hồi quy (58/58) đều đạt.
  - Không thay đổi schema mạng hay cơ sở dữ liệu server.
  - Giữ vững toàn bộ ngân sách LOC: `event_card_modal.tsx` (386/500 LOC), `market_event_ticker.tsx` (273/500 LOC).
  - Không sử dụng bất kỳ ép kiểu bẩn (`as any`, `as unknown as T`) nào.
