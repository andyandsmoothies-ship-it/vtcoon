# KẾ HOẠCH TRIỂN KHAI MICRO-SLICE (LEAN PLAN SPECIFICATION)
# TICKET: IMP-280 — Khóa Đồng Thuận Phản Hồi Đề Xuất Giao Dịch Bot (Trade Offer Dual-Dispatch & Resolution Sentinel Guard)

> **Mã Nhiệm Vụ:** IMP-280 (Bot Trade Offer Dual-Dispatch & Resolution Sentinel Guard)  
> **Phân hệ mục tiêu:** `client-ui`  
> **Phân loại rủi ro:** Tier 2 Micro-Slice (Lean Plan Specification, <= 180 lines, Delta <= 50 LOC, 3 files in `src/**`)  
> **Chỉ tiêu kiểm thử:** Scaled Floor >= 8 atomic tests, Pure Logic Waiver = `false`

---

## 0. KHẢO SÁT BỀ MẶT MÃ NGUỒN & ĐIỂM BẮT ĐẦU (SURFACE INVENTORY & LOC BASELINE)

### 0.1 Danh Sách Tệp Mục Tiêu & Dòng Mã Thực Tế Trên Đĩa
* **Target physical file**: `src/client/ui/modals/bot_trade_offer_strip.tsx` (246 lines, Tier 2 limit: 500 lines) — **Safe**.
* **Target physical file**: `src/client/ui/modals/bot_trade_offer_modal.tsx` (317 lines, Tier 2 limit: 500 lines) — **Safe**.
* **Target physical file**: `src/client/ui/actionable_notification.ts` (479 lines, Tier 2 limit: 500 lines) — **Warning** (Tech Debt: tiệm cận trần Tier 2, khống chế delta <= 12 dòng, tổng <= 491 dòng).
* **Target physical file**: `tests/contracts/imp280_trade_offer_dual_dispatch_guard.test.ts` (New file in Station 1/2) — **Safe**.

### 0.2 Bảng Thống Kê Delta LOC Dự Kiến
| File | Tier | Current LOC | Expected LOC | Delta LOC | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `src/client/ui/modals/bot_trade_offer_strip.tsx` | Tier 2 (UI) | 246 | ~258 | +12 lines | Safe |
| `src/client/ui/modals/bot_trade_offer_modal.tsx` | Tier 2 (UI) | 317 | ~325 | +8 lines | Safe |
| `src/client/ui/actionable_notification.ts` | Tier 2 (UI) | 479 | ~491 | +12 lines | Warning |
| `tests/contracts/imp280_trade_offer_dual_dispatch_guard.test.ts` | Living Test | 0 | ~140 | +140 lines | Safe |
| **Tổng Delta Production (`src/**`)** | — | — | — | **+32 net LOC** (<= 50 LOC) | **Pass Micro-Slice** |

### 0.3 Phân Định Phạm Vi & Ranh Giới Phân Hệ (Scope Conservation Mandate)
1. [`src/client/ui/modals/bot_trade_offer_strip.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/bot_trade_offer_strip.tsx) — **MODIFY (Target 1)**: Xuất và tích hợp sentinel FIFO-100 module-scope khóa `offerId`, triệt tiêu hành vi gửi thừa intent từ chối khi modal chi tiết đã giải quyết.
2. [`src/client/ui/modals/bot_trade_offer_modal.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/bot_trade_offer_modal.tsx) — **MODIFY (Target 2)**: Tiêu thụ sentinel chia sẻ, bảo đảm thứ tự kiểm tra khả chi `canAccept` trước khi khóa offer.
3. [`src/client/ui/actionable_notification.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/actionable_notification.ts) — **MODIFY (Target 3)**: Định nghĩa thông báo hành động chuẩn cho `OFFER_ALREADY_RESOLVED`, `BANKRUPT` và alias `PLAYER_BANKRUPT` (delta <= 12 dòng).
4. **Bảo toàn môi trường làm việc & baseline trước đó**:
   - `src/server/room_property_coordinator.ts`
   - `src/server/intent_dispatcher.ts`
   - `tests/contracts/imp264_trade_idempotency_and_watchdog_resilience.test.ts`
   - `src/client/ui/floating_numbers.tsx`
   - `tests/contracts/imp278_compact_floating_notifications.test.ts`

---

## 1. BẢN THIẾT KẾ KIẾN TRÚC & BẤT BIẾN NGHIỆP VỤ (ARCHITECTURAL INVARIANTS)

### 1.1 Cơ Chế Khóa Đồng Thuận Có Giới Hạn Dung Lượng (Bounded Trade Offer Resolution Sentinel)
* **Giao diện công khai xuất từ `bot_trade_offer_strip.tsx`**:
```typescript
export function markTradeOfferResolved(offerId: string): boolean;
export function isTradeOfferResolved(offerId: string): boolean;
export function resetTradeOfferResolutions(): void;
```
* **Nguyên lý hoạt động & Làm cứng thù địch**:
  - `InlineBotTradeStrip` duy trì một module-level `Map<string, boolean>` hoặc `Set<string>` có giới hạn dung lượng FIFO tối đa 100 đề xuất gần nhất ([ADV-02]). Khi thêm phần tử thứ 101, tự động xóa phần tử cũ nhất (`eviction`).
  - Kiểm tra và đánh dấu nguyên tử ([ADV-01]): Tại timeout của Strip (`left <= 0`), bắt buộc gọi `if (!markTradeOfferResolved(pendingTradeOffer.offerId)) return;` thay vì chỉ kiểm tra thụ động.
  - Thứ tự rẽ nhánh trong Modal ([ADV-04]): Tại `accept-trade-btn`, kiểm tra `if (!canAccept) return;` BẮT BUỘC nằm trước `markTradeOfferResolved(offerId)`.

### 1.2 Bất Biến Miền (Domain Invariants)
* **Bất biến 1 (Single Dispatch Enforcement)**: Mỗi `offerId` chỉ phát tối đa 01 socket intent `INTENT_RESPOND_TRADE_OFFER`.
* **Bất biến 2 (Actionable Notification Completeness)**: Mọi mã reject (`OFFER_ALREADY_RESOLVED`, `BANKRUPT`) đều có giao diện tiếng Việt rõ ràng, không văng fallback `(REASON_CODE)`.
* **Bất biến 3 (WCAG & Accessibility Continuity)**: Bảo toàn 100% aria attributes và test IDs hiện hữu.

---

## 2. NHIỆM VỤ THỰC THI CHI TIẾT (EXACT IMPLEMENTATION TASKS)

### Task 1: Khởi Tạo Sentinel FIFO-100 Tại `bot_trade_offer_strip.tsx`
* **Target physical file**: `src/client/ui/modals/bot_trade_offer_strip.tsx`
* **Hành động cụ thể**:
  1. Khai báo và export `markTradeOfferResolved`, `isTradeOfferResolved`, `resetTradeOfferResolutions` với trần bộ nhớ 100 entries.
  2. Tại `updateTimer`: gọi `if (!markTradeOfferResolved(pendingTradeOffer.offerId)) return;` khi `left <= 0` trước khi gửi intent từ chối.
  3. Tại `handleAccept` và `handleReject`: kiểm tra `if (!markTradeOfferResolved(pendingTradeOffer.offerId)) return;`.

### Task 2: Tích Hợp Sentinel Khóa Vào `bot_trade_offer_modal.tsx`
* **Target physical file**: `src/client/ui/modals/bot_trade_offer_modal.tsx`
* **Hành động cụ thể**:
  1. Import `markTradeOfferResolved` từ `bot_trade_offer_strip.js`.
  2. Tại nút `accept-trade-btn`: giữ nguyên `if (!canAccept) return;` ở đầu, sau đó mới gọi `if (!markTradeOfferResolved(offerId)) return;`.
  3. Tại nút `reject-trade-btn` và timer timeout: gọi `if (!markTradeOfferResolved(offerId)) return;`.

### Task 3: Bổ Sung Định Nghĩa Thông Báo Hành Động Vào `actionable_notification.ts`
* **Target physical file**: `src/client/ui/actionable_notification.ts`
* **Hành động cụ thể**:
  1. Thêm key `OFFER_ALREADY_RESOLVED` và `BANKRUPT` vào `ACTIONABLE_NOTIFICATIONS_MAP`, kèm alias `PLAYER_BANKRUPT`. Định dạng cô đọng (delta <= 12 dòng, tổng dòng <= 491).

---

## 3. THIẾT KẾ KIỂM THỬ HỢP ĐỒNG (STATION 1 CONTRACT TEST SPECIFICATIONS)
* **Target physical file**: `tests/contracts/imp280_trade_offer_dual_dispatch_guard.test.ts` (New file in Station 1/2)

* TC-280.01 [UC-IMP280/MSS]: Given đề xuất `offer_1`, When invoking markTradeOfferResolved với `offer_1`, Then hàm trả về giá trị `true`.
* TC-280.02 [UC-IMP280/MSS]: Given đề xuất `offer_1` đã giải quyết, When invoking markTradeOfferResolved lặp lại với `offer_1`, Then hàm trả về giá trị `false`.
* TC-280.03 [UC-IMP280/MSS]: Given registry đạt 100 đề xuất, When invoking markTradeOfferResolved với đề xuất thứ 101, Then đề xuất cũ nhất được thu hồi giải phóng bộ nhớ.
* TC-280.04 [UC-IMP280/MSS]: Given đề xuất `offer_1` đã giải quyết trong Modal, When timer của `InlineBotTradeStrip` chạm mốc 0ms, Then không phát thêm `INTENT_RESPOND_TRADE_OFFER`.
* TC-280.05 [UC-IMP280/MSS]: Given đề xuất `offer_2` đã bấm từ chối ở Strip, When người chơi cố bấm chấp nhận ở Modal, Then intent chấp nhận bị chặn lại.
* TC-280.06 [UC-IMP280/MSS]: Given người chơi không đủ tiền trong Modal, When click nút chấp thuận, Then hàm markTradeOfferResolved không bị khóa nhầm.
* TC-280.07 [UC-IMP280/MSS]: Given mã lỗi `OFFER_ALREADY_RESOLVED`, When invoking resolveActionableNotification, Then trả về thông báo tiếng Việt có tiêu đề "Đề Xuất Đã Giải Quyết" và icon "🤝".
* TC-280.08 [UC-IMP280/MSS]: Given mã lỗi `BANKRUPT`, When invoking resolveActionableNotification, Then trả về thông báo tiếng Việt có tiêu đề "Đã Tuyên Bố Phá Sản" và icon "🚨".
* TC-280.09 [UC-IMP280/MSS]: Given mã lỗi `OFFER_ALREADY_RESOLVED` và `BANKRUPT`, When invoking formatServerErrorMessage, Then chuỗi trả về không chứa fallback lỗi dạng `(REASON_CODE)`.

---

## 4. QUY TRÌNH CHỐT CHẶN CƠ HỌC & NGHIỆM THU
1. **Kiểm tra Plan tự động**: `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_280_TRADE_OFFER_DUAL_DISPATCH_AND_RESOLVE_GUARD.md --auto-sign`
2. **Trạm 1 (RED)**: Tạo test contract chứng minh fail vì runtime assertions, có hook `beforeEach` reset registry.
3. **Trạm 2 (GREEN)**: Thực hiện Task 1, 2, 3 làm xanh 100% tests.
4. **Chốt chặn Fast Pre-Filter & Scope**:
   - `npm run prefilter -- src/client/ui/modals/bot_trade_offer_strip.tsx src/client/ui/modals/bot_trade_offer_modal.tsx src/client/ui/actionable_notification.ts tests/contracts/imp280_trade_offer_dual_dispatch_guard.test.ts`
   - `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_280_TRADE_OFFER_DUAL_DISPATCH_AND_RESOLVE_GUARD.md`
5. **Xuất Audit Reports & Kiểm toán Bằng chứng**:
   - `npm run report -- IMP-280`
   - `node scripts/check_evidence.mjs IMP-280`
