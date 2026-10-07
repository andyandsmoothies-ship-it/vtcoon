# KẾ HOẠCH TRIỂN KHAI MICRO-SLICE (LEAN PLAN SPECIFICATION)
# TICKET: IMP-289 — Disambiguate Pass-GO Debts, Property Taxes & Financial Notification Separation

> **Mã Nhiệm Vụ:** IMP-289 (Disambiguate Financial Notifications & Zero Netting)  
> **Phân hệ mục tiêu:** `client-network` & `client-ui`  
> **Phân loại rủi ro:** Tier 1 Micro-Slice (Lean Plan Specification, <= 180 lines, Delta <= 48 LOC, 3 files in `src/client/`)  
> **Chỉ tiêu kiểm thử:** Scaled Floor >= 8 atomic tests, Pure Logic Waiver = `true` (Pure algorithmic financial parsing & UI badge resolution)  

---

## 0. KHẢO SÁT BỀ MẶT MÃ NGUỒN & ĐIỂM BẮT ĐẦU (SURFACE INVENTORY & LOC BASELINE)

### 0.1 Danh Sách Tệp Mục Tiêu & Dòng Mã Thực Tế Trên Đĩa
* **Target physical file**: `src/client/network/activity_rent_matcher.ts` (323 lines, Tier 1 limit: 400 lines) — **Safe**.
* **Target physical file**: `src/client/network/activity_badge_dispatcher.ts` (252 lines, Tier 1 limit: 400 lines) — **Safe**.
* **Target physical file**: `src/client/ui/transaction_narrative.ts` (271 lines, Tier 2 limit: 500 lines) — **Safe**.
* **Target physical file**: `tests/contracts/imp289_financial_disambiguation_and_tax_separation.test.ts` (New file in Station 1/2, Living Test limit: 600 lines) — **Safe**.

### 0.2 Bảng Thống Kê Delta LOC Dự Kiến
| File | Tier | Current LOC | Expected LOC | Delta LOC | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `src/client/network/activity_rent_matcher.ts` | Tier 1 (Client Net) | 323 | 345 | +22 lines | Safe (<= 400) |
| `src/client/network/activity_badge_dispatcher.ts` | Tier 1 (Client Net) | 252 | 268 | +16 lines | Safe (<= 400) |
| `src/client/ui/transaction_narrative.ts` | Tier 2 (UI Views) | 271 | 279 | +8 lines | Safe (<= 500) |
| `tests/contracts/imp289_financial_disambiguation_and_tax_separation.test.ts` | Living Test | 0 | ~240 | +240 lines | Safe (<= 600) |
| **Tổng Delta Production (`src/**`)** | — | — | — | **+46 net LOC** (<= 50 LOC) | **Pass Micro-Slice** |

### 0.3 Phân Định Phạm Vi & Ranh Giới Phân Hệ (Scope Conservation Mandate)
1. [`src/client/network/activity_rent_matcher.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/activity_rent_matcher.ts) — **MODIFY (Target 1)**:
   - Trong `extractPassedGoActivities`: Thực hiện kế toán bóc tách tuần tự (Sequential Decomposition) các nghĩa vụ qua GO thay vì đoán mò ở `processPayerFee`:
     * Xây dựng helper `buildPropertyRegistryAndStateMap` adapter chuyển đổi `playersInfo` và `levelMap` thành `Map` tương thích domain.
     * Trích xuất nợ thấu chi `CC_OVERDRAFT` (-3.300 Tr.) khi `prevP.overdraftRoundsLeft === 1 && (!p.overdraftRoundsLeft || p.overdraftRoundsLeft === 0)`.
     * Trích xuất trích lãi tín dụng `CC_FREE_CREDIT` (-400 Tr.) khi người chơi đang giữ thẻ trong tay (`prevP.hand?.includes(ChanceCardId.CC_FREE_CREDIT)`).
     * Trích xuất thuế tài sản qua GO (`calculateGoPropertyTax`) với trần `GO_PROPERTY_TAX_CAP` (tối đa 1.000 Tr.).
     * Trừ dần các khoản khấu trừ trên khỏi `payer.diff`, đảm bảo Zero-Netting.
   - Trong `processPayerFee`: CẤM tự ý gán nhãn `Thuế Đất Đai` hay `Lệ Phí Đất Đai` nếu `currentPos !== 4`. Gán nhãn trung tính `Khấu trừ tài chính phát sinh`.
2. [`src/client/network/activity_badge_dispatcher.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/activity_badge_dispatcher.ts) — **MODIFY (Target 2)**:
   - Trong `handleTaxBadge`: Tách bạch `isCell4 = act.cellIndex === 4` mới gắn nhãn `"Lệ Phí Đất Đai"`. Với thuế tài sản qua GO, gán nhãn `"Nộp Thuế Tài Sản Qua GO ➔ Kho Bạc"` (triệt tiêu hoàn toàn chữ "Đất Đai" để không kích hoạt nhầm công thức Ô 04).
   - Trong `BADGE_HANDLERS`: Bổ sung handler `system` phân biệt rõ trợ cấp (`amount > 0` $\rightarrow$ badge `stimulus` xanh) với cước viễn thông Viettel (`amount < 0` $\rightarrow$ badge `rent_pay`).
   - Timing đồng bộ: Các badge sinh ra do Vượt GO được lên lịch đồng bộ quanh `getPawnPassGoDelay` có stagger offset (+200ms).
3. [`src/client/ui/transaction_narrative.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/transaction_narrative.ts) — **MODIFY (Target 3)**:
   - Trong `formatTax`: Khi title chứa `"Thuế Tài Sản"`, format chuẩn `"Nộp Thuế Tài Sản Qua GO ➔ Kho Bạc"`.
   - Triệt tiêu chuỗi fallback mù mờ `"giao dịch tài chính"`; thay bằng `"biến động tài chính theo quy định"`.
4. [`tests/contracts/imp289_financial_disambiguation_and_tax_separation.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp289_financial_disambiguation_and_tax_separation.test.ts) — **NEW (Target 4)**: Contract tests kiểm toán tách biệt toàn bộ các dòng tiền.
5. **Bảo toàn môi trường làm việc & baseline trước đó**:
   - `src/client/network/apply_delta.ts`
   - `src/client/network/apply_delta_players.ts`
   - `src/client/ui/action_dock.tsx`
   - `src/client/ui/floating_numbers.tsx`
   - `src/client/ui/transaction_formula.ts`
   - `src/server/special_cell_handler.ts`
   - `src/server/turn_loop.ts`
   - `tests/contracts/imp278_compact_floating_notifications.test.ts`
   - `tests/contracts/imp225_financial_activity_log_collision.test.ts`

---

## 1. MỤC TIÊU KỸ THUẬT & BẤT BIẾN NGHIỆP VỤ (SSOT)
1. **[BR-01 / Sequential Decomposition On Pass-GO]**: Toàn bộ dòng tiền qua GO (Lương, Thấu chi hết hạn, Lãi tín dụng, Thuế tài sản) BẮT BUỘC được bóc tách tuần tự trong `extractPassedGoActivities`, cấm dựa vào `absDiff` tại `processPayerFee`.
2. **[BR-02 / Falsy-Proof Overdraft Detection]**: Nhận diện thu hồi nợ thấu chi bắt buộc dùng `prevP.overdraftRoundsLeft === 1 && (!p.overdraftRoundsLeft || p.overdraftRoundsLeft === 0)`.
3. **[BR-03 / Registry Adapter For Property Tax]**: Sử dụng helper chuyển đổi trạng thái client sang Map để gọi `calculateGoPropertyTax` an toàn, chặn trần `GO_PROPERTY_TAX_CAP`.
4. **[BR-04 / Land Fee Sole Attribution (Ô 04)]**: Nhãn "Lệ Phí Đất Đai (Ô 04)" và công thức Ô 04 CHỈ áp dụng duy nhất khi người chơi dừng chân tại Ô số 04 (`cellIndex === 4`). Thuế tài sản qua GO cấm chứa từ "Đất Đai".
5. **[BR-05 / System Reward Badge Visibility & Viettel Handling]**: Các khoản thưởng/trợ cấp Quỹ Kho Bạc (`type: 'system'` và `amount > 0`) bắt buộc hiển thị pop-up xanh minh bạch (`FloatingBadge`).

---

## 2. KẾ HOẠCH TEST CASE CHI TIẾT (STATION 1 SPECIFICATION)
* **TC-289.01 [UC-IMP289/MSS]**: Given người chơi hết hạn thấu chi `CC_OVERDRAFT` qua GO đồng thời nhận lương (+2000 - 3300 = -1300), When `extractPassedGoActivities` xử lý, Then sinh 2 logs riêng biệt: lương 2.000 và thấu chi -3.300.
* **TC-289.02 [UC-IMP289/MSS]**: Given người chơi giữ thẻ `CC_FREE_CREDIT` qua GO, When `extractPassedGoActivities` xử lý, Then trích xuất khoản trừ lãi 400 Tr. độc lập khỏi lương.
* **TC-289.03 [UC-IMP289/MSS]**: Given người chơi có nhà qua GO chịu thuế tài sản, When `extractPassedGoActivities` tính toán qua adapter, Then sinh log thuế tài sản qua GO riêng biệt với `cellIndex: 0`.
* **TC-289.04 [UC-IMP289/MSS]**: Given tổ hợp đa giao dịch qua GO (Lương + Thấu chi + Thuế tài sản), When bóc tách tuần tự, Then từng log mang đúng số tiền và không khoản nào bị nuốt.
* **TC-289.05 [UC-IMP289/MSS]**: Given người chơi dừng chân tại Ô 04, When `processPayerFee` xử lý, Then gán nhãn "Lệ Phí Đăng Ký Đất Đai" với `cellIndex: 4`.
* **TC-289.06 [UC-IMP289/MSS]**: Given hoạt động thuế tài sản qua GO được chuyển sang `handleTaxBadge`, When tạo floating text, Then title hiển thị "Thuế Tài Sản Qua GO ➔ Kho Bạc" và không chứa chuỗi "Đất Đai".
* **TC-289.07 [UC-IMP289/MSS]**: Given `act.type === 'system'` với khoản trợ cấp kinh tế từ Kho Bạc, When dispatch qua `dispatchActivityFloatingBadges`, Then hiển thị badge thưởng màu xanh cho người chơi.
* **TC-289.08 [UC-IMP289/MSS]**: Given badge với title "Thuế Tài Sản Qua GO", When render narrative trong `FloatingBadge`, Then formula hiển thị đúng "Thuế tài sản qua GO (Tối đa 1.000 Tr.)".
