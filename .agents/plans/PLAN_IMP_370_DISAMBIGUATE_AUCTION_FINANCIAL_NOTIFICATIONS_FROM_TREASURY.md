# KẾ HOẠCH TRIỂN KHAI MICRO-SLICE (LEAN PLAN SPECIFICATION)
# TICKET: IMP-370 — Disambiguate Auction Win & Unmortgage Notifications From Treasury Artifacts

> **Mã Nhiệm Vụ:** IMP-370 (Disambiguate Auction & Financial Notifications From Treasury Artifacts)  
> **Phân hệ mục tiêu:** `client-ui` (Tier 2 UI/Views & Natural Narrative Presentation)  
> **Phân loại rủi ro:** Tier 1 Micro-Slice (Lean Plan Specification, <= 180 lines, Delta <= 30 LOC, 3 files in `src/client/ui/`)  
> **Chỉ tiêu kiểm thử:** Scaled Floor >= 6 atomic tests, Pure Logic Waiver = `true` (Pure algorithmic string parsing & UI badge resolution)  

---

## 0. KHẢO SÁT BỀ MẶT MÃ NGUỒN & ĐIỂM BẮT ĐẦU (SURFACE INVENTORY & LOC BASELINE)

### 0.1 Danh Sách Tệp Mục Tiêu & Dòng Mã Thực Tế Trên Đĩa
* **Target physical file**: `src/client/ui/transaction_narrative.ts` (279 lines, Tier 2 limit: 500 lines, contract limit: 280 lines) — **Safe**.
* **Target physical file**: `src/client/ui/transaction_formula.ts` (105 lines, Tier 2 limit: 500 lines) — **Safe**.
* **Target physical file**: `src/client/ui/floating_numbers.tsx` (373 lines, Tier 2 limit: 500 lines, contract limit: 390 lines) — **Safe**.
* **Target physical file**: `tests/contracts/imp370_auction_and_financial_notification_clarity.test.ts` (New file in Station 1/2, Living Test limit: 600 lines) — **Safe**.
* **Target physical file**: `tests/contracts/imp367_financial_narrative_clarity.test.ts` (162 lines, Living Test limit: 600 lines) — **Safe**.
* **Target physical file**: `tests/contracts/imp194_natural_narrative_floating_badges.test.ts` (524 lines, Living Test limit: 600 lines) — **Safe**.

### 0.2 Bảng Thống Kê Delta LOC Dự Kiến
| File | Tier | Current LOC | Expected LOC | Delta LOC | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `src/client/ui/transaction_narrative.ts` | Tier 2 (UI Views) | 279 | 279 | 0 lines | Safe (<= 280) |
| `src/client/ui/transaction_formula.ts` | Tier 2 (UI Views) | 105 | 105 | 0 lines | Safe (<= 500) |
| `src/client/ui/floating_numbers.tsx` | Tier 2 (UI Views) | 373 | 373 | 0 lines | Safe (<= 390) |
| `tests/contracts/imp370_auction_and_financial_notification_clarity.test.ts` | Living Test | 6 | ~120 | +114 lines | Safe (<= 600) |
| `tests/contracts/imp367_financial_narrative_clarity.test.ts` | Living Test | 162 | 162 | 0 lines | Safe (<= 600) |
| `tests/contracts/imp194_natural_narrative_floating_badges.test.ts` | Living Test | 524 | 524 | 0 lines | Safe (<= 600) |
| **Tổng Delta Production (`src/**`)** | — | — | — | **0 net LOC** (<= 50 LOC) | **Pass Micro-Slice** |

### 0.3 Phân Định Phạm Vi & Ranh Giới Phân Hệ (Scope Conservation Mandate)
1. [`src/client/ui/transaction_narrative.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/transaction_narrative.ts) — **MODIFY (Target 1)**:
   - Trong `case 'auction_win'`: Đổi `verb` từ `'nộp'` thành `'thanh toán'`; đổi `target` từ `'tiền trúng đấu giá ... ➔ Kho Bạc'` thành `'tiền trúng đấu giá ${aucProp || 'BĐS'}'`.
   - Trong `formatAuction`: Xóa bỏ hậu tố `➔ Nộp Kho Bạc`, trả về `'Thắng đấu giá ${cell}'`.
   - Trong `case 'unmortgage'` & `formatUnmortgage`: Chuẩn hóa đích đến phí giải chấp 10% từ `Kho Bạc` sang `Ngân Hàng`.
   - Trong `case 'bail'`: Chuẩn hóa `target = 'bảo lãnh Trạm Kiểm Toán (Ô 10)'`, bỏ `➔ Kho Bạc`.
2. [`src/client/ui/transaction_formula.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/transaction_formula.ts) — **MODIFY (Target 2)**:
   - Trong `case 'unmortgage'`: Trả về `'Chuộc lại đất thế chấp (Gốc + 10% phí giải chấp Ngân Hàng)'`.
3. [`src/client/ui/floating_numbers.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/floating_numbers.tsx) — **MODIFY (Target 3)**:
   - Dòng 250: Thay thế việc render trực tiếp `item.text` bằng `narrative.amountText || item.text`.
4. [`tests/contracts/imp370_auction_and_financial_notification_clarity.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp370_auction_and_financial_notification_clarity.test.ts) — **NEW (Target 4)**
5. **Bảo toàn môi trường làm việc & baseline trước đó**:
   - `src/client/events/subscribers/activity_log_subscriber.ts`
   - `src/client/events/subscribers/badge_event_subscriber.ts`
   - `src/client/network/apply_delta.ts`
   - `src/client/ui/activity_feed_sidebar.tsx`

---

## 1. MỤC TIÊU KỸ THUẬT & BẤT BIẾN NGHIỆP VỤ (SSOT)
1. **[BR-01 / Zero Treasury In Auction Win]**: Trúng đấu giá BĐS là hành vi mua tài sản, người thụ hưởng tiền là Ngân Hàng/Phòng chơi. CẤM gán hậu tố `➔ Kho Bạc` vào thông báo trúng đấu giá.
2. **[BR-02 / Zero Double Negative In Contextual Badges]**: Trong câu thông báo tự nhiên đã có động từ chi tiền (`thanh toán`, `nộp`, `trả`), số tiền trong capsule pill BẮT BUỘC hiển thị dạng số dương sạch (`2.350` thay vì `-2.350`).
3. **[BR-03 / Banking Affordance In Unmortgage]**: Giải chấp là nghiệp vụ tín dụng với Ngân Hàng, phí giải chấp nộp về Ngân Hàng, không liên quan Kho Bạc.

---

## 2. TRIỂN KHAI THEO 4 TRẠM (4-STATION SDLC)

### Station 1: Red Contract Test Specifications
**Target physical file**: `tests/contracts/imp370_auction_and_financial_notification_clarity.test.ts`
- TC-370.01 [UC-IMP370/MSS]: Given floating text item with actionType `auction_win`, When resolveTransactionNarrative is executed, Then returns narrative verb `'thanh toán'` and target `'tiền trúng đấu giá [Tên]'` without `'Kho Bạc'`.
- TC-370.02 [UC-IMP370/MSS]: Given floating text item with actionType `auction_win` and text `'-2.350'`, When rendered in FloatingBadge, Then amount pill displays clean positive number `'2.350'` without negative sign.
- TC-370.03 [UC-IMP370/MSS]: Given floating text item with actionType `unmortgage`, When resolveTransactionNarrative is executed, Then returns detail containing `'Ngân Hàng'` and not `'Kho Bạc'`.
- TC-370.04 [UC-IMP370/MSS]: Given floating text item with actionType `unmortgage`, When resolveFormulaText is executed, Then returns formula `'Chuộc lại đất thế chấp (Gốc + 10% phí giải chấp Ngân Hàng)'`.
- TC-370.05 [UC-IMP370/MSS]: Given floating text item with actionType `bail`, When resolveTransactionNarrative is executed, Then returns target `'bảo lãnh Trạm Kiểm Toán (Ô 10)'` without `'Kho Bạc'`.
- TC-370.06 [UC-IMP370/MSS]: Given floating text item with actionType `auction_win`, When formatAuction helper is executed, Then returns `'Thắng đấu giá [Tên]'` without `'Kho Bạc'`.

---

### Station 2: Implementation (GREEN)

#### Task 1: Clean Narrative Formatting in `transaction_narrative.ts`
**Target physical file**: `src/client/ui/transaction_narrative.ts`
```typescript
<<<<
function formatUnmortgage(item: FloatingTextItem): string {
  return `Giải chấp ${resolveCellName(item.cellIndex) || item.title?.replace(/^Giải\s+chấp\s+/i, '').replace(/\s*\(Phí\s+10%\s*➔\s*(?:Vào\s+)?Kho\s+Bạc\)/i, '').trim() || 'BĐS'} (Phí 10% ➔ Kho Bạc)`;
}

function formatAuction(item: FloatingTextItem): string {
  return `Thắng đấu giá ${resolveCellName(item.cellIndex) || item.title?.replace(/^(?:Thắng\s+)?(?:đấu\s+giá|Đấu\s+Giá)\s+/i, '').replace(/\s*➔\s*(?:Vào\s+|Nộp\s+)?Kho\s+Bạc/i, '').trim() || 'BĐS'} ➔ Nộp Kho Bạc`;
}
====
function formatUnmortgage(item: FloatingTextItem): string {
  return `Giải chấp ${resolveCellName(item.cellIndex) || item.title?.replace(/^Giải\s+chấp\s+/i, '').replace(/\s*\(Phí\s+10%\s*➔\s*(?:Vào\s+)?(?:Kho\s+Bạc|Ngân\s+Hàng)\)/i, '').trim() || 'BĐS'} (Phí 10% ➔ Ngân Hàng)`;
}

function formatAuction(item: FloatingTextItem): string {
  return `Thắng đấu giá ${resolveCellName(item.cellIndex) || item.title?.replace(/^(?:Thắng\s+)?(?:đấu\s+giá|Đấu\s+Giá)\s+/i, '').replace(/\s*➔\s*(?:Vào\s+|Nộp\s+)?(?:Kho\s+Bạc|Ngân\s+Hàng)/i, '').trim() || 'BĐS'}`;
}
>>>>
```

```typescript
<<<<
    case 'auction_win': {
      category = 'ĐẤU GIÁ BẤT ĐỘNG SẢN'; verb = 'nộp';
      const m = item.title?.match(/Thắng\s+đấu\s+giá\s+(.+?)(?:\s*➔|$)/i);
      const aucProp = (m && m[1]) ? m[1].trim() : cellName;
      target = `tiền trúng đấu giá ${aucProp || 'BĐS'} ➔ Kho Bạc`;
      detail = aucProp ? `(Trúng đấu giá ${aucProp})` : '(Trúng đấu giá)';
      break;
    }
====
    case 'auction_win': {
      category = 'ĐẤU GIÁ BẤT ĐỘNG SẢN'; verb = 'thanh toán';
      const m = item.title?.match(/Thắng\s+đấu\s+giá\s+(.+?)(?:\s*➔|$)/i);
      const aucProp = (m && m[1]) ? m[1].trim() : cellName;
      target = `tiền trúng đấu giá ${aucProp || 'BĐS'}`;
      detail = aucProp ? `(Trúng đấu giá ${aucProp})` : '(Trúng đấu giá)';
      break;
    }
>>>>
```

```typescript
<<<<
    case 'bail': category = 'BẢO LÃNH KIỂM TOÁN'; verb = 'nộp'; target = 'bảo lãnh Kiểm Toán (Ô 10) ➔ Kho Bạc'; detail = '(Bảo lãnh Kiểm Toán - Ô 10)'; break;
    case 'audit_jail': category = 'TRẠM KIỂM TOÁN'; verb = 'vào'; target = 'Trạm Kiểm Toán'; detail = '(Bị kiểm toán thuế)'; break;
    case 'mortgage': category = 'TÍN DỤNG NGÂN HÀNG'; verb = 'vay'; target = cellName ? `thế chấp ${cellName} từ Ngân Hàng` : 'từ Ngân Hàng'; detail = cellName ? `(Thế chấp ${cellName})` : '(Thế chấp BĐS)'; break;
    case 'unmortgage': category = 'GIẢI CHẤP BẤT ĐỘNG SẢN'; verb = 'trả'; target = `giải chấp ${cellName || 'BĐS'}`; detail = '(Phí 10% ➔ Kho Bạc)'; break;
====
    case 'bail': category = 'BẢO LÃNH KIỂM TOÁN'; verb = 'nộp'; target = 'bảo lãnh Trạm Kiểm Toán (Ô 10)'; detail = '(Bảo lãnh Kiểm Toán - Ô 10)'; break;
    case 'audit_jail': category = 'TRẠM KIỂM TOÁN'; verb = 'vào'; target = 'Trạm Kiểm Toán'; detail = '(Bị kiểm toán thuế)'; break;
    case 'mortgage': category = 'TÍN DỤNG NGÂN HÀNG'; verb = 'vay'; target = cellName ? `thế chấp ${cellName} từ Ngân Hàng` : 'từ Ngân Hàng'; detail = cellName ? `(Thế chấp ${cellName})` : '(Thế chấp BĐS)'; break;
    case 'unmortgage': category = 'GIẢI CHẤP BẤT ĐỘNG SẢN'; verb = 'trả'; target = `giải chấp ${cellName || 'BĐS'}`; detail = '(Phí 10% ➔ Ngân Hàng)'; break;
>>>>
```

#### Task 2: Clean Formula in `transaction_formula.ts`
**Target physical file**: `src/client/ui/transaction_formula.ts`
```typescript
<<<<
    case 'unmortgage':
      return 'Chuộc lại đất thế chấp (Gốc + 10% phí Kho Bạc)';
====
    case 'unmortgage':
      return 'Chuộc lại đất thế chấp (Gốc + 10% phí giải chấp Ngân Hàng)';
>>>>
```

#### Task 3: Zero Double-Negative in `floating_numbers.tsx`
**Target physical file**: `src/client/ui/floating_numbers.tsx`
```typescript
<<<<
              {item.actionType === 'diplomatic' && narrative.isPositive ? narrative.amountText : item.text}
====
              {narrative.amountText || item.text}
>>>>
```

---

### Station 3: Pre-Filter & Visual Evidence Verification
- Chạy `npm run prefilter -- src/client/ui/transaction_narrative.ts src/client/ui/transaction_formula.ts src/client/ui/floating_numbers.tsx`
- Chạy `node scripts/check_scope.mjs`
- Chạy `npm run capture:visual` và `node scripts/check_evidence.mjs IMP-370` để ghi nhận bằng chứng Dual-Viewport.

---

## 3. DEFINITION OF DONE (DoD) & STOPPING BOUNDARY
1. 100% các bài test trong `tests/contracts/imp370_auction_and_financial_notification_clarity.test.ts` chuyển sang màu XANH (PASS).
2. Toàn bộ các bài test liên quan trong `tests/contracts/imp367_financial_narrative_clarity.test.ts` và `tests/contracts/imp194_natural_narrative_floating_badges.test.ts` đều PASS mà không bị hồi quy (Zero Regression).
3. Không còn bất kỳ chữ `➔ Kho Bạc` nào trong các sự kiện đấu giá BĐS và giải chấp BĐS.
4. Lỗi double negative ("Bạn nộp -2.350") được loại bỏ hoàn toàn, thay bằng số dương sạch ("Bạn thanh toán 2.350").
5. Đạt chuẩn Station 3 Pre-filter (typecheck, LOC limits <= 280, zero dirty casts). DỪNG NGAY sau khi đạt nghiệm thu.
