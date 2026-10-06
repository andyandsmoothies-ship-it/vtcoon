# KẾ HOẠCH TRIỂN KHAI MICRO-SLICE (LEAN PLAN SPECIFICATION)
# TICKET: IMP-282 — Poka-Yoke Vô Hiệu Hóa Hành Động Khi Phá Sản & Chế Độ Khán Giả (Poka-Yoke Bankrupt Action Dock & Spectator Mode UI Hardening)

> **Mã Nhiệm Vụ:** IMP-282 (Poka-Yoke Bankrupt Action Dock & Spectator Mode UI Hardening)  
> **Phân hệ mục tiêu:** `client-ui`  
> **Phân loại rủi ro:** Tier 2 Micro-Slice (Lean Plan Specification, <= 180 lines, Delta <= 40 LOC, 2 files in `src/**`)  
> **Chỉ tiêu kiểm thử:** Scaled Floor >= 8 atomic tests, Pure Logic Waiver = `false` (UI visual ticket)

---

## 0. KHẢO SÁT BỀ MẶT MÃ NGUỒN & ĐIỂM BẮT ĐẦU (SURFACE INVENTORY & LOC BASELINE)

### 0.1 Danh Sách Tệp Mục Tiêu & Dòng Mã Thực Tế Trên Đĩa
* **Target physical file**: `src/client/ui/action_dock.tsx` (381 lines, Tier 2 limit: 500 lines) — **Safe**.
* **Target physical file**: `src/client/ui/ui_helpers.ts` (454 lines, Tier 2 limit: 500 lines) — **Warning** (Khống chế delta <= 15 dòng, tổng <= 469 dòng).
* **Target physical file**: `tests/contracts/imp282_poka_yoke_bankrupt_hud_spectator.test.ts` (New file to be created in Station 1/2) — **Safe**.

### 0.2 Bảng Thống Kê Delta LOC Dự Kiến
| File | Tier | Current LOC | Expected LOC | Delta LOC | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `src/client/ui/action_dock.tsx` | Tier 2 (UI) | 381 | ~393 | +12 lines | Safe |
| `src/client/ui/ui_helpers.ts` | Tier 2 (UI) | 454 | ~465 | +11 lines | Warning |
| `tests/contracts/imp282_poka_yoke_bankrupt_hud_spectator.test.ts` | Living Test | 0 | ~160 | +160 lines | Safe |
| **Tổng Delta Production (`src/**`)** | — | — | — | **+23 net LOC** (<= 50 LOC) | **Pass Micro-Slice** |

### 0.3 Phân Định Phạm Vi & Ranh Giới Phân Hệ (Scope Conservation Mandate)
1. [`src/client/ui/action_dock.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/action_dock.tsx) — **MODIFY (Target 1)**: Vô hiệu hóa nút Quản Lý BĐS (`disabled`, styling Slate disabled, guard `if (isBankrupt) return;`), truyền cờ `isBankrupt` vào nhãn End Turn và chặn `isStandingOnBuyable` khi phá sản.
2. [`src/client/ui/ui_helpers.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/ui_helpers.ts) — **MODIFY (Target 2)**: Cập nhật `resolveEndTurnButtonLabel` hỗ trợ `isBankrupt` trả về `'👁️ Khán Giả (Đang Xem)'`, và `resolveActionDockNotice` ưu tiên trạng thái phá sản, loại trừ notice bỏ lượt nhầm lẫn.
3. [`tests/contracts/imp282_poka_yoke_bankrupt_hud_spectator.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp282_poka_yoke_bankrupt_hud_spectator.test.ts) — **NEW (Target 3)**: Contract tests kiểm toán toàn diện Poka-Yoke affordance và nhãn khán giả khi phá sản.
4. **Bảo toàn môi trường làm việc & baseline trước đó**:
   - `src/server/intent_dispatcher.ts`
   - `tests/contracts/imp210_auto_solvency_intent.test.ts`
   - `tests/contracts/imp281_auto_solvency_semantic_resolution.test.ts`
   - `src/server/network/afk_recovery.ts`
   - `src/server/network/wss_intent_handler.ts`
   - `src/client/ui/modals/bot_trade_offer_strip.tsx`
   - `src/client/ui/modals/bot_trade_offer_modal.tsx`
   - `src/client/ui/actionable_notification.ts`
   - `src/client/ui/floating_numbers.tsx`
   - `tests/contracts/imp278_compact_floating_notifications.test.ts`
   - `tests/contracts/imp280_trade_offer_dual_dispatch_guard.test.ts`

---

## 1. BẢN THIẾT KẾ KIẾN TRÚC & BẤT BIẾN NGHIỆP VỤ (ARCHITECTURAL INVARIANTS)

### 1.1 Triệt Tiêu Zombie HUD & Chuẩn Hóa Poka-Yoke Affordance Khi Phá Sản
* **Hiện trạng lỗi**: Khi người chơi phá sản (`isBankrupt: true`):
  1. Nút Quản Lý BĐS vẫn mang lớp màu xanh dương rực rỡ (`bg-blue-600 hover:bg-blue-700 text-white`), tạo ấn tượng giả rằng nút vẫn tương tác được. Handler click không có guard `if (isBankrupt) return;`.
  2. Nút kết thúc lượt hiển thị nhãn sai lệch `⏩ Mất Lượt (Hết Lượt)` do `resolveEndTurnButtonLabel` không kiểm tra `isBankrupt`.
  3. Action dock notice văng thông báo hiểu nhầm "Bạn bị tạm ngừng gieo xúc xắc lượt này (Bão duyên hải / Kiểm tra cồn)" do `shouldShowSkipTurnNotice` không loại trừ người phá sản.
* **Nguyên tắc Poka-Yoke & Chế độ khán giả**:
  - Khi `isBankrupt === true`: Nút Quản Lý BĐS lập tức chuyển sang giao diện xám thụ động `bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed opacity-50`, kèm title "Người chơi đã phá sản".
  - Nút End Turn chuyển nhãn thành `'👁️ Khán Giả (Đang Xem)'`, icon `👁️`.
  - Notice Action Dock hiển thị thông điệp khán giả nhẹ nhàng hoặc ẩn hoàn toàn notice bão/kiểm tra cồn.

### 1.2 Bất Biến Miền (Domain Invariants)
* **Bất biến 1 (Zero Zombie Affordance)**: Người chơi phá sản không bao giờ nhìn thấy nút hành động kinh doanh (Quản lý BĐS, Mua đất, Đàm phán) ở trạng thái kích hoạt (enabled/active/bright colors).
* **Bất biến 2 (Spectator Clarity)**: Nhãn hiển thị của người chơi phá sản luôn phản ánh chế độ Khán Giả, cấm hiển thị nhãn tạm thời như mất lượt hoặc tạm dừng gieo.
* **Bất biến 3 (WCAG & Keyboard Accessibility)**: Giữ nguyên `aria-label`, phím tắt và chỉ số tương phản trên các phần tử disabled.

---

## 2. NHIỆM VỤ THỰC THI CHI TIẾT (EXACT IMPLEMENTATION TASKS)

### Task 1: Nâng Cấp Helpers Độ Trễ & Nhãn Khán Giả Tại `ui_helpers.ts`
* **Target physical file**: `src/client/ui/ui_helpers.ts`
* **Hành động cụ thể**:
  1. Mở rộng `resolveEndTurnButtonLabel`:
     ```typescript
     export function resolveEndTurnButtonLabel(
       turnPhase?: string,
       hasRolledThisTurn?: boolean,
       inAudit?: boolean,
       isBankrupt?: boolean
     ): string {
       if (isBankrupt) return '👁️ Khán Giả (Đang Xem)';
       if (turnPhase === 'PropertyManagement' && !hasRolledThisTurn && !inAudit) {
         return '⏩ Mất Lượt (Hết Lượt)';
       }
       return 'Hết Lượt';
     }
     ```
  2. Bổ sung `isBankrupt?: boolean` vào `ActionDockNoticeParams` và tại `resolveActionDockNotice`:
     Nếu `params.isBankrupt`, trả về notice khán giả (hoặc null nếu không cần notice). Chặn tuyệt đối `isSkipped` khi `isBankrupt`.

### Task 2: Poka-Yoke Nút Quản Lý BĐS & Action Dock Tại `action_dock.tsx`
* **Target physical file**: `src/client/ui/action_dock.tsx`
* **Hành động cụ thể**:
  1. Trong `handleOpenManageProperty`: bổ sung `if (isBankrupt) return;` ở đầu hàm.
  2. Thêm `!isBankrupt` vào điều kiện `isStandingOnBuyable`.
  3. Cập nhật styling nút Quản Lý BĐS:
     ```tsx
     className={`... ${
       isBankrupt
         ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed opacity-50'
         : 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-800 shadow-sm active:scale-95 cursor-pointer'
     }`}
     title={isBankrupt ? 'Người chơi đã phá sản' : undefined}
     ```
  4. Truyền `isBankrupt` vào `resolveEndTurnButtonLabel(turnPhase, hasRolledThisTurn, inAudit, isBankrupt)`.

---

## 3. THIẾT KẾ KIỂM THỬ HỢP ĐỒNG (STATION 1 CONTRACT TEST SPECIFICATIONS)
* **Target physical file**: `tests/contracts/imp282_poka_yoke_bankrupt_hud_spectator.test.ts` (New file to be created in Station 1/2)

* TC-282.01 [UC-IMP282/MSS]: Given người chơi bị phá sản (`isBankrupt: true`), When invoking resolveEndTurnButtonLabel, Then nhãn trả về chính xác `'👁️ Khán Giả (Đang Xem)'`.
* TC-282.02 [UC-IMP282/MSS]: Given người chơi phá sản ở PropertyManagement chưa gieo xúc xắc, When invoking resolveEndTurnButtonLabel, Then nhãn trả về không chứa `'Mất Lượt'`.
* TC-282.03 [UC-IMP282/MSS]: Given người chơi phá sản ở PropertyManagement chưa gieo xúc xắc, When invoking resolveActionDockNotice, Then không trả về notice bỏ lượt gieo xúc xắc (`skip_turn`).
* TC-282.04 [UC-IMP282/MSS]: Given ActionDock render với `isBankrupt: true`, When kiểm tra nút Quản Lý BĐS, Then nút có thuộc tính `disabled` và class chứa `bg-slate-200`.
* TC-282.05 [UC-IMP282/MSS]: Given ActionDock render với `isBankrupt: true`, When kiểm tra nút Quản Lý BĐS, Then nút không chứa class `bg-blue-600`.
* TC-282.06 [UC-IMP282/MSS]: Given ActionDock render với `isBankrupt: true`, When click vào nút Quản Lý BĐS, Then callback `onOpenManageProperty` không được gọi.
* TC-282.07 [UC-IMP282/MSS]: Given ActionDock render với `isBankrupt: true`, When người chơi đứng trên ô đất chưa có chủ, Then nút Mua Đất không xuất hiện thay thế nút gieo xúc xắc.
* TC-282.08 [UC-IMP282/MSS]: Given ActionDock render với `isBankrupt: true`, When kiểm tra nút kết thúc lượt, Then nhãn hiển thị `'👁️ Khán Giả (Đang Xem)'`.

---

## 4. QUY TRÌNH CHỐT CHẶN CƠ HỌC & NGHIỆM THU
1. **Kiểm tra Plan tự động**: `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_282_POKA_YOKE_BANKRUPT_HUD_SPECTATOR.md --auto-sign`
2. **Trạm 1 (RED)**: Tạo contract test `tests/contracts/imp282_poka_yoke_bankrupt_hud_spectator.test.ts` chứng minh fail vì runtime assertions.
3. **Trạm 2 (GREEN)**: Thực hiện Task 1 và Task 2 làm xanh 100% tests.
4. **Chốt chặn Fast Pre-Filter & Scope**:
   - `npm run prefilter -- src/client/ui/action_dock.tsx src/client/ui/ui_helpers.ts tests/contracts/imp282_poka_yoke_bankrupt_hud_spectator.test.ts`
   - `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_282_POKA_YOKE_BANKRUPT_HUD_SPECTATOR.md`
5. **Chụp Dual-Viewport & Kiểm toán Bằng chứng vật lý**:
   - `node scripts/capture_visual_evidence.mjs --ticket IMP-282 --dual-viewport`
   - `npm run report -- IMP-282`
   - `node scripts/check_evidence.mjs IMP-282`
