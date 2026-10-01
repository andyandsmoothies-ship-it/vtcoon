# BÁO CÁO NGHIỆM THU HOÀN THÀNH: IMP-236
## TỐI ƯU BỐ CỤC DESKTOP, DUAL-VIEWPORT PARITY & ANTI-TRUNCATION POLISH

> **Mã số Ticket**: IMP-236  
> **Phân loại**: Tier 2 (Full Rigor)  
> **Ngày hoàn thành**: 2026-10-01  
> **Trạng thái**: ✅ **HOÀN THÀNH TOÀN DIỆN (100% GATES APPROVED)**

---

### 1. TỔNG QUAN HẠNG MỤC THI CÔNG
Khắc phục dứt điểm 4 khuyết tật UI/UX tồn đọng trên màn hình Desktop được phát hiện qua 4 ảnh chụp thực tế:
1. **Modal Sổ Đỏ (`title_deed_rent_table.tsx`)**:
   - Triệt tiêu hoàn toàn khoảng trắng chết 60% ở cột phải trên Desktop.
   - Bảng cước 4 cấp (C0 Đất Nền, C1 Nhà Phố, C2 Khách Sạn, C3 Quần thể Resort/TTTM) luôn luôn hiển thị trên Desktop (`hidden md:block`), phơi bày tức thì thông tin ROI cho người chơi.
   - Giữ nguyên Mini Rent Bar cho màn hình di động (`md:hidden`) để chống tràn dọc trên màn hình nhỏ.
   - Tinh gọn nhãn nút accordion thành `'Xem chi tiết 4 cấp nâng cấp (C0 - C3)'`, xóa bỏ hiện tượng bẻ dòng 3 hàng nham nhở.
   - Bảo toàn nút thu gọn `data-testid="collapse-rent-tiers"` với class `md:hidden` cho người dùng di động.
2. **Modal Danh Mục BĐS (`property_portfolio_modal.tsx`)**:
   - Khi người chơi chỉ sở hữu 1 BĐS ("Bà Rịa - Vũng Tàu"), thẻ đơn mở rộng chiếm `sm:col-span-2`, xóa bỏ 50% khoảng trắng chết bên phải modal.
   - Bảo toàn 100% 5 props hover/focus Sa bàn 3D: `data-onmouseenter="true"`, `onMouseEnter`, `onMouseLeave`, `onFocus`, `onBlur`.
   - Chuyển `hidden sm:inline` thành `hidden lg:inline` tại L320-L323, giải phóng 80px bề ngang, xóa bỏ triệt để hiện tượng cắt cụt ba chấm `#6 Bình D...` và `#8 Đồng ...` ngay cả khi có từ 2 BĐS trở lên.
3. **Băng Chọn Đối Tác Đàm Phán P2P (`trade_partner_strip.tsx`)**:
   - Bảo toàn chuỗi gốc `truncate max-w-[120px]` để tương thích ngược 100% với các bài test hồi quy `TC-106` và `TC-154.15`, đồng thời nới rộng theo breakpoint: `truncate max-w-[120px] sm:max-w-[180px] md:max-w-none font-bold`.
   - Nới rộng badge nhu cầu `max-w-[90px] md:max-w-none`. Tên bot `Bot AI 2 (Aggressive)` và badge `💰 Dư tiền gom đất` hiển thị trọn vẹn trên Desktop, không còn dấu ba chấm `...`.
4. **Phân Cấp Tương Phản Tab Trái Phiếu (`bond_issuance_tab.tsx`)**:
   - Đồng bộ màu cảnh báo đỏ `text-rose-700 font-bold` cho cả chỉ số Net Worth (L142) và chỉ số BĐS sạch (L151) khi không thỏa mãn điều kiện phát hành, đạt chuẩn phân cấp tương phản WCAG 2.1 AA (4.54:1).

---

### 2. KẾT QUẢ THỰC NGHIỆM TẠI CÁC TRẠM KIỂM SOÁT

#### Trạm 1: RED Contract Testing (Adversarial Inversion)
- Tệp kiểm thử: `tests/contracts/imp236_desktop_uiux_viewport_harmonization.test.ts`.
- Số lượng: **17 atomic contract tests** (phủ trọn Universal 5-Facet Matrix).
- Trạng thái ban đầu: **Business RED** (10 tests fail do logic cũ, 7 tests pass bảo vệ hồi quy).

#### Trạm 2: GREEN Implementation
- Áp dụng thành công 7 drop-in snippets chuẩn xác trên 4 tệp sản phẩm.
- Trạng thái kiểm thử hợp đồng: **17/17 atomic contract tests PASS 100%** (trong 41ms).
- Kiểm thử hồi quy (Verbatim Evidence): **120/120 regression tests PASS 100%** trên 7 suites liên quan:
  ```bash
  npx vitest run tests/client/imp136_portfolio_monopoly_insights.test.ts \
    tests/client/imp154_trade_bot_intelligence_and_sentiment.test.ts \
    tests/client/imp133_camera_sticky_focus_and_quick_build.test.ts \
    tests/client/auction_and_title_deed_mobile_ergonomics.test.ts \
    tests/contracts/imp209_clean_single_row_purchase_footer.test.ts \
    tests/client/imp106_cross_platform_ui_ux_polish.test.ts \
    tests/client/imp218_trade_modal_ergonomics_redesign.test.ts
  ```
  *Chi tiết số lượng test hồi quy:*
  + `imp136_portfolio_monopoly_insights.test.ts`: 12/12 passed
  + `imp154_trade_bot_intelligence_and_sentiment.test.ts`: 22/22 passed
  + `imp133_camera_sticky_focus_and_quick_build.test.ts`: 27/27 passed
  + `auction_and_title_deed_mobile_ergonomics.test.ts`: 10/10 passed
  + `imp209_clean_single_row_purchase_footer.test.ts`: 17/17 passed
  + `imp106_cross_platform_ui_ux_polish.test.ts`: 16/16 passed
  + `imp218_trade_modal_ergonomics_redesign.test.ts`: 16/16 passed
  + **Tổng cộng: 120 tests passed (100%)**.

#### Trạm 2.5: Fast Pre-Filter Sweep (Scout)
- `npx tsc --noEmit`: 0 lỗi biên dịch.
- Đo lường LOC vật lý chi tiết (`node scripts/check_loc.mjs` - minh bạch Total Lines vs Non-Empty SLOC):
  | Tệp Vật Lý | Phân Loại Tier | Total Lines | Non-Empty SLOC | Ngân Sách Trần | Trạng Thái |
  | :--- | :---: | :---: | :---: | :---: | :--- |
  | `src/client/ui/modals/title_deed_rent_table.tsx` | Tier 2 (UI Views) | **268** | 252 | Trần 500 (Cảnh báo 400) | ✔️ Safe |
  | `src/client/ui/modals/property_portfolio_modal.tsx` | Tier 2 (UI Views) | **396** | 377 | Trần 500 (Cảnh báo 400) | ✔️ Safe |
  | `src/client/ui/modals/trade/trade_partner_strip.tsx` | Tier 2 (UI Views) | **115** | 107 | Trần 500 (Cảnh báo 400) | ✔️ Safe |
  | `src/client/ui/modals/bond_issuance_tab.tsx` | Tier 2 (UI Views) | **213** | 198 | Trần 500 (Cảnh báo 400) | ✔️ Safe |
  | `tests/contracts/imp236_desktop_uiux_viewport_harmonization.test.ts` | Contract Tests | **352** | 312 | Trần 600 | ✔️ Safe |
- *Làm rõ ngân sách Tier 2*: Theo GEMINI.md, các Modal UI thuộc Tier 2 có trần cứng (Ceiling) là **500 LOC** (ngưỡng cảnh báo 400 LOC). Tệp `property_portfolio_modal.tsx` đạt 396 Total Lines / 377 Non-Empty SLOC — an toàn dưới cả ngưỡng cảnh báo và trần cứng.
- Zero dirty casts: 0 `as any`, 0 `as unknown as`, 0 `as Record<string, any>`.
- Console.log purge: 0 trailing logs.

#### Trạm 3: Independent Review Funnel
- **Phase 3.0 (Physical Visual Evidence Gate)**: Chụp ảnh thực tế in-game thành công tại `.agents/tmp/imp-236_desktop_views.jpg` (1280x800).
- **Phase 3.1 (Spec Gate)**: `spec-reviewer` phê chuẩn **`SPEC_APPROVED`** (100% plan fidelity, 0 scope drift).
- **Phase 3.2 (Deep Architecture & Anti-Slop)**: `code-reviewer` phê chuẩn **`CODE_APPROVED`** (Bảo toàn 5 props hover 3D, zero memory leaks, clean transient teardown).
- **Phase 3.2 (2D UI Craft)**: `ui-craft-reviewer` phê chuẩn **`UI_APPROVED`** (0 vi phạm thẩm mỹ, đạt chuẩn WCAG 2.1 AA, đạt sàn touch target >= 44px).

#### Trạm 4: Adversarial Boundary & Mutation Sentinel (Chaos Sentinel)
- Thực thi thông qua runner chuẩn hóa: `npx tsx scripts/station4_sentinel.ts --ticket IMP-236 --test tests/contracts/imp236_desktop_uiux_viewport_harmonization.test.ts`.
- **Probe 1 (Closed-Loop Parity)**: 24/24 Intent đối xứng giữa Client Gateway và Server Core (0 gap).
- **Probe 2 (Ephemeral Boundary Wire)**: Dynamic WebSocket port 56761 (port 0), live handshake thành công, clean teardown.
- **Probe 3 (Mutation Sensitivity)**:
  + Sàn kiểm định đột biến (Mutation floor): Yêu cầu tối thiểu >= 5 mutants (hoặc >= 14 probe tests).
  + Thực nghiệm trên sandbox test directory: **6 mutants được tạo và kích hoạt** (Inversion string containment, Regex fail substitution, Negative regex inversion, Literal string mismatch, Spy call corruption, String containment negation).
  + Kết quả: **6/6 mutants bị tiêu diệt hoàn toàn** (`killed: 6`, `survived: 0`, 100% kill rate).
  + Vượt sàn kiểm định: **6 >= 5** (Đạt chuẩn Hard Floor).
- Ký duyệt và lưu trữ: `.agents/evidence/chaos_sentinel_IMP-236.json` (`verdict: APPROVED`).
- Cơ học xác minh: `node scripts/check_evidence.mjs IMP-236` — PASS 100%.

---

### 3. TỆP MÃ NGUỒN ĐÃ THAY ĐỔI
- `src/client/ui/modals/title_deed_rent_table.tsx`
- `src/client/ui/modals/property_portfolio_modal.tsx`
- `src/client/ui/modals/trade/trade_partner_strip.tsx`
- `src/client/ui/modals/bond_issuance_tab.tsx`
- `tests/contracts/imp236_desktop_uiux_viewport_harmonization.test.ts`
- `docs/plans/improvements/IMP-236-desktop-uiux-viewport-harmonization_plan.md`
- `.agents/evidence/chaos_sentinel_IMP-236.json`
- `.agents/tmp/imp-236_desktop_views.jpg`
