# BÁO CÁO NGHIỆM THU HOÀN THÀNH TICKET IMP-VISUAL-METADATA-DESYNC

> **Mã Ticket:** `IMP-VISUAL-METADATA-DESYNC`  
> **Tiêu đề:** Đồng Bộ Dữ Liệu Miền & Chuẩn Hóa Kiến Trúc Trực Quan (Domain SSOT Visual Metadata Bridge & Zero-Desync Architecture)  
> **Phân loại:** Tier 2 (Full Rigor — Cross-module UI/3D Engine Refactor, Closed-Loop 4 Stations)  
> **Ngày hoàn thành:** 2026-10-01  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED**

---

## 1. TỔNG QUAN & BỐI CẢNH VẤN ĐỀ

Trước khi thực hiện ticket này, hệ thống giao diện và sa bàn 3D gặp phải hiện tượng lệch pha nghiêm trọng giữa dữ liệu logic nghiệp vụ miền (SSOT) và các bề mặt trực quan người dùng:
1. **Lệch hệ số tiền thuê `MC_LAND_FEVER`**: Thẻ Sốt Đất Vùng Ven trong domain áp dụng nhân đôi tiền thuê (`x2`, `multiplier = 2`), nhưng trên 3D Billboard và Ticker lại hiển thị "+50%".
2. **Thiếu hỗ trợ Chu Kỳ Vĩ Mô**: Hai chu kỳ `MACRO_LAND_FEVER` (x2.5 tiền thuê) và `MACRO_LIQUIDITY_FREEZE` (-50% tiền thuê, cấm vay) chưa được đồng bộ nhãn, màu sắc và tóm tắt trên Sổ Đỏ và Hero Stat.
3. **Mã màu & Cờ hiệu sai lệch**: Thẻ `MC_COASTAL_STORM` (miễn 100% tiền thuê) bị fallback thành cờ buff vàng; thẻ `CC_PORT_EXCLUSIVE` (thụ hưởng 50% cước cảng của người khác) bị tính nhầm thành giảm tiền thuê.
4. **Phân mảnh mã nguồn (Code Slop)**: Tồn tại nhiều bản đồ icon và màu sắc trùng lặp (`EVENT_VISUAL_MAP` trong `tile_event_aura.tsx`, `THEMED_EMOJIS` trong `event_card_visuals.ts`, switch-case 22 nhánh trong `market_event_ticker.tsx`).

---

## 2. KIẾN TRÚC GIẢI PHÁP ĐÃ TRIỂN KHAI

### 2.1. Module Cầu Nối SSOT `src/client/domain_visual_bridge.ts`
- **Single Source of Truth**: Tập trung hóa toàn bộ biểu tượng và quy tắc suy diễn nhãn vào một module duy nhất (148 LOC, Tier 1 <= 400 LOC).
- **Pure Type Predicate Guard**: Hiện thực hàm `isEventIdentifiable(id: string): id is EventIdentifiable` loại bỏ 100% nhu cầu ép kiểu bẩn (`as any` / `as unknown as`).
- **Thứ tự ưu tiên nghiêm ngặt trong `deriveModifierVisual`**:
  1. *Quyền lợi đặc thù*: `CC_PORT_EXCLUSIVE` hoặc `modifier.beneficiaryId !== undefined` -> `icon: 🚢`, nhãn `'Hưởng 50%'`, màu vàng hổ phách `#F59E0B`, `isBuff: true`.
  2. *Chu kỳ vĩ mô đóng băng*: `MACRO_LIQUIDITY_FREEZE` -> `icon: 🧊`, nhãn `'Thuê -50%'`, màu cyan `#06B6D4`, `isBuff: false`.
  3. *Phụ phí & Quy hoạch*: `MC_FUEL_SURGE` -> `+500 Phí` (`#EF4444`), `MC_URBAN_PLANNING` -> `Thế chấp 60%` (`#F59E0B`).
  4. *Đình chỉ công trình*: `CC_BUILD_HALT` / `BUILD_HALT` / `CC_MEDIA_CRISIS` -> `Đình chỉ` (`#EF4444`).
  5. *Multiplier động*: mult = 0 -> `Miễn thuê`, mult < 1 -> `-[pct]%`, mult > 1 -> `x[mult] Thuê`.
  6. *Fail-Safe Fallback*: Màu xám slate `#94A3B8`, `isBuff: false`, nhãn `'Hiệu lực'`.

### 2.2. Tái Cấu Trúc Khấu Trừ (Subtractive Refactoring)
- **`src/client/3d/tile_event_aura.tsx`**: Xóa sổ hoàn toàn `EVENT_VISUAL_MAP` và `DEFAULT_EVENT_META`, giảm 33 dòng mã (còn 192 LOC).
- **`src/client/ui/modals/event_card_visuals.ts`**: Xóa sạch 41 dòng của `THEMED_EMOJIS`, giảm 39 dòng mã (còn 303 LOC), đồng bộ `KNOWN_HERO_STATS`.
- **`src/client/ui/market_event_ticker.tsx`**: Xóa switch-case 22 nhánh trong `resolveMarketIcon`, giảm 20 dòng mã (còn 269 LOC).
- **`src/client/ui/modals/title_deed_modal.tsx`**: Chuẩn hóa `MODIFIER_DESCS` bằng enum keys và icon registry, hiển thị huy hiệu `🔥 Sốt Đất Vệ Tinh: Nhân đôi tiền thuê (x2)`.
- **`src/client/ui/event_card_punchy_summaries.ts`**: Thêm 2 thẻ macro và chuẩn hóa `MC_LAND_FEVER`.
- **`src/domain/event_card_metadata.ts`**: Cập nhật mô tả nghiệp vụ chuẩn hóa x2.

---

## 3. KẾT QUẢ VẬN HÀNH 4 TRẠM KHÉP KÍN (4-STATION CLOSED-LOOP EVIDENCE)

### Trạm 1: Station 1 RED Contract Test (`qa-tester`)
- Bộ test hợp đồng mới: `tests/contracts/visual_metadata_parity.test.ts`.
- Gồm 17 atomic contract tests bao phủ Universal 5-Facet Matrix (MSS, Boundary, Terminology, Cross-module text sync, Fallback neutrality).
- Adversarial Inversion Gate: 17/17 tests thất bại Business RED khi chưa có implementation trên đĩa.

### Trạm 2: Station 2 GREEN Implementation (`implementer`)
- Tạo mới `src/client/domain_visual_bridge.ts` và thực hiện 9 bước khấu trừ trên đĩa cứng.
- Chuyển toàn bộ 17/17 tests sang trạng thái GREEN.
- Hòa giải (reconcile) 2 bộ test cũ: `imp234` (16 tests) và `imp141` (21 tests).

### Trạm 2.5: Station 2.5 Fast Pre-Filter Sweep (`scout`)
- **Typecheck**: `npx tsc --noEmit` -> 0 lỗi biên dịch.
- **Ngân sách LOC**: 10/10 tệp đều an toàn dưới trần quy định.
- **Zero Dirty Casts**: 100% sạch `as any` / `as unknown as`.
- **Console.log Purge**: Sạch toàn bộ mã nguồn `src/**`.

### Trạm 3: Station 3 Independent Review Funnel
- **Phase 3.0 (Physical Visual Evidence Gate)**: Chụp 3 ảnh in-game WebGL/DOM thực tế:
  * `imp_visual_metadata_desync_3d_tile_aura.jpg`: Sa bàn 3D hiển thị phù hiệu `🔥 x2 Thuê • 2V` và ticker đồng bộ.
  * `imp_visual_metadata_desync_title_deed.jpg`: Sổ Đỏ Desktop hiển thị huy hiệu hổ phách `🔥 Sốt Đất Vệ Tinh: Nhân đôi tiền thuê (x2)`.
  * `imp_visual_metadata_desync_mobile_title_deed.jpg`: Sổ Đỏ Mobile (390x844) co giãn đàn hồi, nhãn không bị cắt chữ.
- **Phase 3.1 (`spec-reviewer`)**: Phê chuẩn `SPEC_APPROVED` (100% plan fidelity, 0 scope drift).
- **Phase 3.2 (`code-reviewer`)**: Phê chuẩn `CODE_APPROVED` (Deep module SSOT, pure functions, zero memory leaks).
- **Phase 3.2 (`ui-craft-reviewer`)**: Phê chuẩn `UI_APPROVED` (Độ tương phản WCAG 2.1 AA, tactile styling, dual-viewport parity).
- **Phase 3.2 (`game-3d-visual-critic`)**: Phê chuẩn `3D_VISUAL_APPROVED` (Phù hiệu Drei HTML sắc nét, 60 FPS mượt mà).

### Trạm 4: Station 4 Adversarial Gatekeeper (`chaos-sentinel`)
- **Probe 1 (Closed-Loop Parity)**: 24/24 Intent đối xứng qua wire.
- **Probe 2 (Ephemeral Boundary)**: Kết nối WebSocket độc lập cổng 57503 và dọn dẹp sạch.
- **Probe 3 (Targeted Mutation Sensitivity)**: Tiêu diệt 4/4 mutants đối kháng, 0 mutants sống sót.
- **Cơ học bằng chứng**: `node scripts/check_evidence.mjs IMP-VISUAL-METADATA-DESYNC` -> PASS. Phán quyết: `APPROVED`.

---

## 4. BẢNG THỐNG KÊ NGÂN SÁCH DÒNG MÃ (LOC BUDGET METRICS)

| Tệp vật lý | Phân loại Tier | Tổng dòng | SLOC thực tế | Hạn mức trần | Trạng thái |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/domain_visual_bridge.ts` | Tier 1 (Domain/Logic) | **148** | 129 | <= 400 LOC | ✔️ Đạt chuẩn |
| `src/client/3d/tile_event_aura.tsx` | Tier 2 (UI/3D) | **192** | 173 | <= 500 LOC | ✔️ Đạt chuẩn (Delta -33) |
| `src/client/ui/modals/event_card_visuals.ts` | Tier 2 (UI/Views) | **303** | 280 | <= 500 LOC | ✔️ Đạt chuẩn (Delta -39) |
| `src/client/ui/market_event_ticker.tsx` | Tier 2 (UI/Views) | **269** | 248 | <= 500 LOC | ✔️ Đạt chuẩn (Delta -20) |
| `src/client/ui/modals/title_deed_modal.tsx` | Tier 2 (UI/Views) | **371** | 346 | <= 500 LOC | ✔️ Đạt chuẩn |
| `src/client/ui/event_card_punchy_summaries.ts` | Tier 2 (UI/Views) | **102** | 90 | <= 500 LOC | ✔️ Đạt chuẩn |
| `src/domain/event_card_metadata.ts` | Tier 1 (Domain/Logic) | **322** | 316 | <= 400 LOC | ⚠️ Cảnh báo an toàn (<=400) |
| `tests/contracts/visual_metadata_parity.test.ts` | Test Suite | **244** | 218 | <= 600 LOC | ✔️ Đạt chuẩn |
| `tests/contracts/imp234_dynamic_board_cell_event_highlights.test.ts` | Test Suite | **394** | 339 | <= 600 LOC | ✔️ Đạt chuẩn |
| `tests/client/imp141_market_card_clarity_and_notification_rules.test.ts` | Test Suite | **198** | 176 | <= 600 LOC | ✔️ Đạt chuẩn |

---

## 5. KẾT LUẬN & BÀN GIAO

Ticket `IMP-VISUAL-METADATA-DESYNC` đã được thực thi hoàn tất 100% theo đúng quy trình 4 Trạm khép kín nghiêm ngặt của Điều lệ Dự án (`GEMINI.md`). Mã nguồn được bàn giao với:
- 0 lỗi biên dịch TypeScript (`tsc --noEmit`).
- 0 cảnh báo linter UI (`npm run lint:ui`).
- 121/121 bài kiểm thử PASS trên toàn bộ các test suites liên đới.
- 0 dirty casts, 0 rò rỉ bộ nhớ, 0 code slop.
- Sổ cái tiến độ `docs/epics/client_ui/_epic_ledger.md` đã cập nhật.
