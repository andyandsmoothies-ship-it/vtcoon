# Plan IMP-319: Layout-Safe Causal Disclosures & Notification Clarity

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-319`
- **Subsystem**: `client-ui` (Tier 2 UI & Client Notification Ergonomics)
- **Problem Statement**: Gameplay features (Treasury stimulus, monopoly rent multipliers, event card teleports) lack causal clarity in UI notifications. Players see large deductions (e.g. -9.750 Tr.) or bot subsidies (+1.184 Tr.) without understanding why. However, adding lengthy explanatory text risks breaking responsive layouts, particularly on mobile portrait viewports (390px width).
- **Architectural Solution**: Implement **Layout-Safe 2-Line Architecture & Compact Formula Tags**:
  1. In `src/client/ui/transaction_formula.ts`:
     - In `case 'stimulus'`: return compact causal formula `'Quỹ Kho Bạc ≥10.000 Tr. ➔ Trợ cấp 20% cho hộ nghèo nhất'` (<= 58 chars).
     - In `case 'rent_pay'` and `case 'rent_receive'`: inspect `item.cellIndex` against `PROPERTY_DEEDS` and `item.text` amount to dynamically format exact rent breakdown (e.g. `'C3 (6.500 Tr.) × Độc quyền 1.5x: Hải Phòng'` <= 40 chars).
  2. In `src/client/network/activity_rent_matcher.ts`:
     - In `processReceiverReward` for stimulus: attach compact causal attribution `(Quỹ ≥10k Tr. ➔ Hộ nghèo nhất)` to the activity log message.
- **Direct Scope**:
  - `src/client/ui/transaction_formula.ts`
  - `src/client/network/activity_rent_matcher.ts`
  - `tests/client/imp319_causal_notification_clarity.test.ts` (New)
- **Baseline Working Tree Dependencies**:
  - `src/server/room_manager.ts`
  - `tests/server/imp318_off_turn_debtor_downgrade.test.ts`
  - `src/client/network/activity_auction_tracker.ts`
  - `src/client/network/activity_badge_dispatcher.ts`
  - `src/client/network/activity_go_extractor.ts`
  - `src/client/network/activity_tracker.ts`
  - `src/client/network/apply_delta.ts`
  - `src/client/network/apply_delta_modals.ts`
  - `src/client/store/activity_store.ts`
  - `src/client/store/game_store.ts`
  - `src/client/store/game_store_subtypes.ts`
  - `src/client/ui/actionable_notification.ts`
  - `src/client/ui/floating_numbers.tsx`
  - `src/client/ui/transaction_narrative.ts`
  - `tests/client/actionable_notification_modular.test.ts`
  - `tests/client/activity_auction_tracker.test.ts`
  - `tests/client/activity_go_extractor.test.ts`
  - `tests/client/apply_delta_modals.test.ts`

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/ui/transaction_formula.ts` | Tier 2 (UI/3D/Views) | 77 | 102 | +25 | <= 500 | ✔️ Safe |
| `src/client/network/activity_rent_matcher.ts` | Tier 1 (Domain/Server/Logic) | 264 | 264 | 0 | <= 400 | ✔️ Safe |
| `tests/client/imp319_causal_notification_clarity.test.ts` | Living Test | 0 | ~180 | +180 | <= 600 | ✔️ Safe |

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
**Target physical file**: `tests/client/imp319_causal_notification_clarity.test.ts` (Tệp mới)

Test Specifications:
- TC-319.01 [UC-CAUSAL/MSS]: Given stimulus item with actionType stimulus, When resolveFormulaText is called, Then returns compact causal text `'Quỹ Kho Bạc ≥10.000 Tr. ➔ Trợ cấp 20% cho hộ nghèo nhất'`.
- TC-319.02 [UC-CAUSAL/MSS]: Given rent payment of 9750 on cell 26 with rent3 of 6500, When resolveFormulaText is called, Then returns formula `'C3 (6.500 Tr.) × Độc quyền 1.5x: Hải Phòng'`.
- TC-319.03 [UC-CAUSAL/A1]: Given rent payment of 624 on unbuilt cell 26 with rent0 of 312, When resolveFormulaText is called, Then returns formula `'C0 (312 Tr.) × Độc quyền 2x: Hải Phòng'`.
- TC-319.04 [UC-CAUSAL/A2]: Given rent payment of 6500 on cell 26 matching base rent3, When resolveFormulaText is called, Then returns formula `'Công trình C3 (6.500 Tr.): Hải Phòng'`.
- TC-319.05 [UC-CAUSAL/A3]: Given rent payment on EVN cell 12, When resolveFormulaText is called, Then preserves EVN utility formula without regressions.
- TC-319.06 [UC-CAUSAL/A4]: Given rent payment on Viettel cell 28, When resolveFormulaText is called, Then preserves Viettel telecom formula without regressions.
- TC-319.07 [UC-CAUSAL/MSS]: Given treasury disbursal event in activity rent matcher, When processReceiverReward runs, Then message includes compact causal attribution `(Quỹ ≥10k Tr. ➔ Hộ nghèo nhất)`.

### Station 2: Implementation (GREEN)

#### Task 2.1: Enhance `resolveFormulaText` in `transaction_formula.ts`
**Target physical file**: `src/client/ui/transaction_formula.ts`

```typescript
<<<<
import {
  TELECOM_DATA_FEE,
  MIN_BAIL_AMOUNT,
  GO_PROPERTY_TAX_CAP,
} from '../../domain/property_rent.js';
====
import {
  TELECOM_DATA_FEE,
  MIN_BAIL_AMOUNT,
  GO_PROPERTY_TAX_CAP,
} from '../../domain/property_rent.js';
import { PROPERTY_DEEDS } from '../../domain/property_data.js';
>>>>
```

```typescript
<<<<
      if (item.title?.includes('Độc quyền') || item.title?.includes('x2')) {
        const rawTitle = item.title?.replace(/^Độc\s+quyền\s+nhóm\s+màu\s*(?:\(x2\s+tiền\s+thuê\))?:\s*/i, '').replace(/^Tiền\s+thuê\s*/i, '').trim();
        return `Độc quyền nhóm màu (x2 tiền thuê): ${cellName || rawTitle || 'BĐS'}`;
      }
      const effectiveCell = cellName || item.title?.replace(/^Tiền\s+thuê\s*/i, '').trim() || '';
      return effectiveCell ? `Tiền thuê lưu trú tại ${effectiveCell}` : 'Tiền thuê lưu trú BĐS';
    }
    case 'salary':
      return 'Hoàn thành 1 vòng: Thưởng lương qua ô Khởi Hành';
    case 'buy':
      return '';
    case 'upgrade':
      return '';
    case 'mortgage':
      return 'Vay vốn tín dụng ngân hàng (50% giá trị đất)';
    case 'unmortgage':
      return 'Chuộc lại đất thế chấp (Gốc + 10% phí Kho Bạc)';
    case 'diplomatic':
      if (item.title?.includes('Hụt thu') || item.title?.includes('Khách dùng')) {
        return 'Khách dùng Thẻ Ngoại Giao: Hụt thu tiền thuê';
      }
      return 'Đặc quyền ngoại giao: Miễn 100% tiền thuê BĐS';
    case 'auction_win':
      return 'Thắng phiên đấu giá công khai BĐS';
    case 'hose':
      return isPositive ? 'Chi trả cổ tức từ sàn HOSE' : 'Đầu tư mua chứng khoán HOSE';
    case 'stimulus':
      return 'Nhận gói trợ cấp an sinh từ Quỹ Kho Bạc';
====
      if (item.cellIndex !== undefined) {
        const deed = PROPERTY_DEEDS.get(item.cellIndex);
        if (deed) {
          const rawAmount = parseInt(item.text.replace(/[^\d]/g, ''), 10);
          if (deed.rent3 && rawAmount === Math.floor(deed.rent3 * 1.5)) {
            return `C3 (${deed.rent3.toLocaleString('vi-VN')} Tr.) × Độc quyền 1.5x: ${cellName}`;
          }
          if (deed.rent3 && rawAmount === deed.rent3) {
            return `Công trình C3 (${deed.rent3.toLocaleString('vi-VN')} Tr.): ${cellName}`;
          }
          if (deed.rent2 && rawAmount === deed.rent2) {
            return `Công trình C2 (${deed.rent2.toLocaleString('vi-VN')} Tr.): ${cellName}`;
          }
          if (deed.rent1 && rawAmount === deed.rent1) {
            return `Công trình C1 (${deed.rent1.toLocaleString('vi-VN')} Tr.): ${cellName}`;
          }
          if (deed.rent0 && rawAmount === deed.rent0 * 2) {
            return `C0 (${deed.rent0.toLocaleString('vi-VN')} Tr.) × Độc quyền 2x: ${cellName}`;
          }
          if (deed.rent0 && rawAmount === deed.rent0) {
            return `Đất trống C0 (${deed.rent0.toLocaleString('vi-VN')} Tr.): ${cellName}`;
          }
        }
      }
      if (item.title?.includes('Độc quyền') || item.title?.includes('x2')) {
        const rawTitle = item.title?.replace(/^Độc\s+quyền\s+nhóm\s+màu\s*(?:\(x2\s+tiền\s+thuê\))?:\s*/i, '').replace(/^Tiền\s+thuê\s*/i, '').trim();
        return `Độc quyền nhóm màu (x2 tiền thuê): ${cellName || rawTitle || 'BĐS'}`;
      }
      const effectiveCell = cellName || item.title?.replace(/^Tiền\s+thuê\s*/i, '').trim() || '';
      return effectiveCell ? `Tiền thuê lưu trú tại ${effectiveCell}` : 'Tiền thuê lưu trú BĐS';
    }
    case 'salary':
      return 'Hoàn thành 1 vòng: Thưởng lương qua ô Khởi Hành';
    case 'buy':
      return '';
    case 'upgrade':
      return '';
    case 'mortgage':
      return 'Vay vốn tín dụng ngân hàng (50% giá trị đất)';
    case 'unmortgage':
      return 'Chuộc lại đất thế chấp (Gốc + 10% phí Kho Bạc)';
    case 'diplomatic':
      if (item.title?.includes('Hụt thu') || item.title?.includes('Khách dùng')) {
        return 'Khách dùng Thẻ Ngoại Giao: Hụt thu tiền thuê';
      }
      return 'Đặc quyền ngoại giao: Miễn 100% tiền thuê BĐS';
    case 'auction_win':
      return 'Thắng phiên đấu giá công khai BĐS';
    case 'hose':
      return isPositive ? 'Chi trả cổ tức từ sàn HOSE' : 'Đầu tư mua chứng khoán HOSE';
    case 'stimulus':
      return 'Quỹ Kho Bạc ≥10.000 Tr. ➔ Trợ cấp 20% cho hộ nghèo nhất';
>>>>
```

#### Task 2.2: Add compact causal note in `activity_rent_matcher.ts`
**Target physical file**: `src/client/network/activity_rent_matcher.ts`

```typescript
<<<<
      message: `🏛️ [Kích Cầu Kho Bạc] ${rName} đã nhận được ${formatCurrency(receiver.diff)} trợ cấp phục hồi kinh tế`,
====
      message: `🏛️ [Kích Cầu Kho Bạc] ${rName} đã nhận được ${formatCurrency(receiver.diff)} trợ cấp (Quỹ ≥10k Tr. ➔ Hộ nghèo nhất)`,
>>>>
```

### Station 3 & 4: Mechanical Verification Checklist
- Run `npm run prefilter -- src/client/ui/transaction_formula.ts src/client/network/activity_rent_matcher.ts tests/client/imp319_causal_notification_clarity.test.ts`.
- Run `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_319_LAYOUT_SAFE_CAUSAL_DISCLOSURES.md`.
- Run `node scripts/check_evidence.mjs IMP-319`.
- Run `npm run report -- IMP-319`.
