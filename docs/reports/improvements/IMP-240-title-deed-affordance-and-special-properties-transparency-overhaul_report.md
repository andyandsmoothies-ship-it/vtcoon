# BÁO CÁO HOÀN THÀNH CẢI TIẾN: IMP-240
# TITLE DEED AFFORDANCE & SPECIAL PROPERTIES TRANSPARENCY OVERHAUL
# (Đại tu tính minh bạch và nút hành động Sổ Đỏ cho Tiện ích, Hạ tầng và Dịch vụ)

> **Mã Ticket**: `IMP-240`  
> **Tiêu đề**: Title Deed Affordance & Special Properties Transparency Overhaul  
> **Phân loại**: Tier 2 (Full Rigor — FSM Intent, Vertical Slice 5 Trạm, 11 Tệp UI/Domain/Server)  
> **Ngày hoàn thành**: 2026-10-01  
> **Trạng thái**: ✅ **HOÀN THÀNH TOÀN DIỆN (100% GATES APPROVED)**  
> **Tài liệu Kế hoạch**: [`docs/plans/improvements/IMP-240-title-deed-affordance-and-special-properties-transparency-overhaul_plan.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/plans/improvements/IMP-240-title-deed-affordance-and-special-properties-transparency-overhaul_plan.md)  
> **Tài liệu SSOT**: [`docs/domain/entity_model.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/entity_model.md) (§2.2, §2.4, §2.5), [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md) (Pillars I, II, IV, V)

---

## 1. TỔNG QUAN & BỐI CẢNH CẢI TIẾN

Từ thực tế trải nghiệm và kiểm toán vật lý trên thiết bị di động cũng như desktop, phát hiện 10 ô bất động sản đặc biệt (2 Tiện ích: Ô 12 EVN, Ô 28 Viettel; 4 Hạ tầng: Ô 05, Ô 15, Ô 25, Ô 35; 4 Dịch vụ: Ô 06, Ô 08, Ô 26, Ô 27) gặp 5 khuyết tật kiến trúc nghiêm trọng:

1. **Cảnh báo sai bộ màu (False Color Warning)**: Sổ Đỏ của Tiện ích và Hạ tầng luôn hiển thị cảnh báo `⚠️ Cần sở hữu trọn bộ màu trước khi nâng cấp` do `resolveEvenBuildRules` kiểm tra `!hasAllProperties` ngay cả khi ô đất không thuộc nhóm màu nào (`colorGroup === undefined`).
2. **Ẩn hoàn toàn nút Nâng Cấp Tiện ích & Kích hoạt ETC**: `hasUpgrades` đánh giá `deed.upgradeCosts.some(...)` trả về `false` vì mảng chi phí xây dựng của Tiện ích và Hạ tầng là `[0, 0, 0]`, làm ẩn nút mua Smart Grid/5G (+1.000 Tr.) và gói ETC (+1.500 Tr./ga).
3. **Đứt gãy Lát cắt dọc (Broken Vertical Slice / Silent Drop)**: Server FSM quản lý `isETC` và `isUpgradedUtility`, nhưng `session_manager` bỏ rơi `isUpgradedUtility` khỏi `CellDelta`, `delta_broadcaster` thiếu tombstone reset cờ khi thanh lý vỡ nợ, và Client Network Parser / Store hoàn toàn không lưu trữ các cờ này.
4. **Hố đen thông tin đặc quyền (Information Black Hole)**: Sổ Đỏ che giấu các cơ chế cốt lõi: EVN thu tiền điện qua GO (100–300 Tr./ô, tối đa 1.000 Tr.), Viettel thu cước data di động 150 Tr. khi đối thủ vào ô Cơ Hội / Thị Trường, ETC tăng +50% cước toàn mạng lưới, và Dịch vụ C2 (phụ thu 1D6 chẵn +200 Tr.) cùng C3 (ép đối thủ mất lượt tiếp theo).
5. **Thế chấp ma & Lệch pha Affordance**: Server cấm thế chấp BĐS đã nâng cấp đặc quyền (`HAS_BUILDING`), nhưng client chỉ kiểm tra `level > 0` (trong khi Utility/ETC có `level = 0`), dẫn tới việc người chơi tưởng mình có thể thế chấp được và bị server từ chối intent.

---

## 2. KẾT QUẢ THI CÔNG CHI TIẾT (11 TỆP MÃ NGUỒN)

### 2.1. Trạm 1 & 2: Server FSM, Intent Dispatcher & Network Broadcaster
- [`src/server/session_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/session_manager.ts): Mở rộng `CellDelta` và `buildDeltaFromRoom` serialize đầy đủ cả `isETC` và `isUpgradedUtility`.
- [`src/server/network/delta_broadcaster.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/delta_broadcaster.ts): So sánh biến động `isUpgradedUtility` trong `isCellEqual` và phát sóng tombstone `{ isETC: false, isUpgradedUtility: false }` khi ô đất được thanh lý hoặc reset.
- [`src/server/intent_dispatcher.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/intent_dispatcher.ts): Chuẩn hóa type `PlayerIntent` hỗ trợ `{ type: 'INTENT_UPGRADE_ETC'; cellIndex?: number }`, tương thích tuyệt đối giữa client và server handler.

### 2.2. Trạm 3 & 4: Client Network Parser, Store & Affordance Engine
- [`src/client/network/apply_delta_cells.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/apply_delta_cells.ts): Cập nhật `propertyStates` trong store khi nhận `CellDelta`, đồng thời xử lý an toàn dọn dẹp cờ khi `cell.isETC === false` hoặc khi `cell.ownerId === null`.
- [`src/client/store/game_store_types.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/game_store_types.ts) & [`src/client/store/game_store.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/game_store.ts): Khởi tạo và reset `propertyStates: Record<number, { isUpgradedUtility?: boolean; isETC?: boolean }>` theo chuẩn SRP.
- [`src/client/ui/modals/title_deed_affordance.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/title_deed_affordance.ts):
  - Bọc `if (groupCells.length > 0)` trong `resolveEvenBuildRules`, triệt tiêu hoàn toàn cảnh báo sai trọn bộ màu cho Tiện ích và Hạ tầng.
  - Loại trừ các ô đã nâng cấp (`isETC || isUpgradedUtility`) trong `resolvePurchaseAffordance`, bảo đảm không tính hạn mức thế chấp ma khi người chơi cân nhắc mua đất.
  - Tính toán chính xác `hasUpgrades`, `upgradeCost`, `upgradeBlockedReason`, và cờ `isUtility` / `isRailroad`.

### 2.3. Trạm 5: Giao Diện Người Dùng & Điều Hướng
- [`src/client/ui/modals/title_deed_modal.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/title_deed_modal.tsx): Truyền tường minh `cellIndex`, `isUtility`, `isRailroad`, `isUpgradedUtility`, `isETC` vào footer và bảng cước.
- [`src/client/ui/modals/title_deed_action_footer.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/title_deed_action_footer.tsx):
  - Cập nhật text nút nâng cấp: `Nâng Cấp Smart Grid (+1.000 Tr.)`, `Nâng Cấp 5G (+1.000 Tr.)`, hoặc `Kích Hoạt ETC (+N.000 Tr.)`.
  - Cập nhật `hasBuilding` và `mortgageBlockedTitle` chặn thế chấp minh bạch đối với ô đã nâng cấp đặc quyền.
- [`src/client/ui/modals/title_deed_rent_table.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/title_deed_rent_table.tsx):
  - Bổ sung card đặc quyền Mạng Lưới Điện Quốc Gia (EVN) và Viễn Thông Vệ Tinh (Viettel).
  - Bổ sung card Gói Cảng Thông Minh & ETC (+50% cước).
  - Gắn huy hiệu `Phụ thu 1D6` (C2) và `Giữ Chân Mất Lượt` (C3) cho các ô Dịch vụ.
  - Hiển thị badge xác nhận `ĐÃ NÂNG CẤP` / `ĐÃ KÍCH HOẠT (+50%)`.
- [`src/client/ui/modals/modal_host.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/modal_host.tsx):
  - Rẽ nhánh dispatch `INTENT_UPGRADE_UTILITY` và `INTENT_UPGRADE_ETC`.
  - Tái sử dụng `deedState.isUtility` và `deedState.isRailroad`, duy trì 485 LOC (< 500 LOC ceiling).

---

## 3. ĐỐI SOÁT NGÂN SÁCH DÒNG MÃ (LOC BUDGET RECONCILIATION)

Đo lường tự động cơ học bằng `scripts/check_loc.mjs`:

| Tệp Mã Nguồn | Tier | LOC Hiện Tại | SLOC | Trần Cho Phép | Kết Quả |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `src/server/session_manager.ts` | Tier 1 | **398** | 370 | <= 400 | ✔️ PASS |
| `src/server/network/delta_broadcaster.ts` | Tier 1 | **229** | 201 | <= 400 | ✔️ PASS |
| `src/server/intent_dispatcher.ts` | Tier 1 | **185** | 181 | <= 400 | ✔ |
| `src/client/network/apply_delta_cells.ts` | Tier 1 | **167** | 151 | <= 400 | ✔️ PASS |
| `src/client/store/game_store_types.ts` | Tier 1 | **391** | 366 | <= 400 | ✔️ PASS |
| `src/client/store/game_store.ts` | Tier 1 | **390** | 358 | <= 400 | ✔️ PASS |
| `src/client/ui/modals/title_deed_affordance.ts` | Tier 2 | **258** | 235 | <= 500 | ✔️ PASS |
| `src/client/ui/modals/title_deed_modal.tsx` | Tier 2 | **382** | 357 | <= 500 | ✔️ PASS |
| `src/client/ui/modals/title_deed_action_footer.tsx` | Tier 2 | **233** | 228 | <= 500 | ✔️ PASS |
| `src/client/ui/modals/title_deed_rent_table.tsx` | Tier 2 | **315** | 298 | <= 500 | ✔️ PASS |
| `src/client/ui/modals/modal_host.tsx` | Tier 2 | **485** | 468 | <= 500 | ✔️ PASS (<= 500) |
| `tests/contracts/imp240_title_deed_affordance_and_special_properties.test.ts` | Test Suite | **586** | 535 | <= 600 | ✔️ PASS |

---

## 4. KẾT QUẢ KIỂM THỬ & VẬN HÀNH 4 TRẠM (4-STATION PIPELINE AUDIT)

### 4.1. Trạm 1: RED Contract Test (qa-tester)
- **Suite**: `tests/contracts/imp240_title_deed_affordance_and_special_properties.test.ts` (18 atomic tests, 33 expects, floor >= 15).
- **Phân loại RED**: 17 tests Business RED trước khi triển khai, 1 test Even-Building regression anchor GREEN.
- **Inversion Gate**: Xác nhận thất bại đúng nguyên nhân kỹ thuật miền.

### 4.2. Trạm 2: GREEN Implementation (implementer)
- 11/11 tệp vật lý được cập nhật tối thiểu bằng native tool.
- 18/18 contract tests PASS (100%).
- 98/98 regression tests liên quan PASS 100%.

### 4.3. Trạm 2.5: Fast Pre-Filter Sweep (scout)
- `npx tsc --noEmit`: 0 lỗi biên dịch.
- `npm run lint:ui`: 0 vi phạm trên toàn bộ 209 tệp UI.
- Zero dirty casts (`as any`, `as unknown as`).
- Zero console.log thừa thãi.

### 4.4. Trạm 3: Independent Review Funnel
- **Phase 3.0 (Physical Visual Evidence Gate)**: Chụp thực tế 5 ảnh màn hình in-game lưu tại `.agents/tmp/`:
  - `imp240_desktop_utility_evn.jpg`: Ô 12 EVN với nút Nâng Cấp Smart Grid và card đặc quyền điện lực.
  - `imp240_desktop_utility_viettel.jpg`: Ô 28 Viettel với nút Nâng Cấp 5G và card đặc quyền viễn thông.
  - `imp240_desktop_railroad_etc.jpg`: Ô 15 Ga Cái Mép với nút Kích Hoạt ETC và card +50% cước.
  - `imp240_desktop_service_c2_c3.jpg`: Ô 08 Vinmec với huy hiệu C2 Phụ thu 1D6 và C3 Giữ Chân Mất Lượt.
  - `imp240_mobile_utility_evn.jpg`: Giao diện mobile 390x844 hoàn toàn vừa vặn, không tràn dọc.
- **Phase 3.1 (Spec Gate)**: `spec-reviewer` phê chuẩn **`SPEC_APPROVED`** (100% plan fidelity, zero scope drift).
- **Phase 3.2 (Deep Architecture & UI Craft)**:
  - `code-reviewer`: Phê chuẩn **`CODE_APPROVED`** (SRP sạch, zero listener leaks, tombstone dọn sạch zombie flags).
  - `ui-craft-reviewer`: Phê chuẩn **`UI_APPROVED`** (Dual-viewport hoàn hảo, typography sắc nét, WCAG AA pass).

### 4.5. Trạm 4: Chaos Sentinel (Station 4)
- **Runner**: `npx tsx scripts/station4_sentinel.ts --ticket IMP-240 --test tests/contracts/imp240_title_deed_affordance_and_special_properties.test.ts`
- **Probe 1 (Closed-Loop Parity)**: 24/24 Intent symmetric parity, 0 gaps.
- **Probe 2 (Ephemeral Boundary)**: Handshake WebSocket thời gian thực trên cổng động 54566, teardown sạch sẽ.
- **Probe 3 (Mutation Sensitivity)**: 6/6 mutants bị tiêu diệt hoàn toàn bởi test assertions (0 survived).
- **Phán quyết**: **`APPROVED`** (Snapshot xác thực tự động bởi `scripts/check_evidence.mjs`).

---

## 5. KẾT LUẬN & BÀN GIAO

Ticket **`IMP-240`** đã giải quyết dứt điểm toàn bộ các điểm nghẽn thông tin và lỗi affordance trên 10 ô tài sản đặc biệt, đồng bộ trọn vẹn Lát cắt Dọc 5 Trạm và đạt 100% tiêu chí Definition of Done theo Hiến chương GEMINI.md.
