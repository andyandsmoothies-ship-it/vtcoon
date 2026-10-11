# Plan IMP-369: Activity Feed Financial Narrative & Timestamp Hardening (Ticket IMP-369)

## 0. Context & Architectural Rationale
- **Prior In-Flight Scope (Committed / Verified)**:
  - Ticket `IMP-367`: Disambiguated floating transaction narrative targets and formulas across 7 financial flows.
  - Ticket `IMP-368`: Enhanced Go Salary multi-deduction transparency across activity feed and floating badges.
- **Problem Statement & Root Cause Discovery**:
  - In gameplay testing (`media_1791734560629_68392af3.png` & Flight Recorder `VT11K6`), the Activity Feed ("NHẬT KÝ VÁN ĐẤU") emitted confusing technical logs:
    1. `⚙️ 08:00:00 | Breezy Badger đã nộp TELECOM_DATA 150 (-150)`
    2. `⚙️ 08:00:00 | Bot AI 4 (Aggressive) đã nộp TAX 200 (-200)`
  - **Physical Root Causes**:
    1. *Raw Enum Leak & Dev Icon Fallback*: In `activity_log_subscriber.ts`, `FEE_PAID` event handler directly interpolated raw enum code `event.feeType` (`TELECOM_DATA`, `TAX`). Since `isTaxOrBail` only checked `LAND_TAX` and `BAIL`, both `TAX` and `TELECOM_DATA` fell back to `type: 'system'` with the dev gear icon `⚙️`.
    2. *Epoch Timestamp Bug (`08:00:00`)*: In `apply_delta.ts`, `synthesizeGameEvents` was invoked without `options`. Synthesizers defaulted `timestamp` to `delta.tick` (e.g. 293). `new Date(293)` formatted as epoch zero (`08:00:00` in GMT+8 / `07:00:00` in GMT+7).
- **Resolution**:
  1. Map `TELECOM_DATA` to natural Vietnamese with recipient (`đã thanh toán 150 cước viễn thông cho [Tên] (Viettel Post)`) and first-class type `utility` (icon `📡`).
  2. Guard against Card Title Misattribution via `isCardPenaltyForPayer`: only attribute card title if card is a verified penalty card affecting this player, preventing reward cards or other players' cards from mislabeling fee logs.
  3. Map `BAIL` to type `bail` (icon `🚨`) and add icon support in `activity_feed_sidebar.tsx`.
  4. Fix SSOT fallback at `game_event_financial_synthesizer.ts` and `game_event_property_synthesizer.ts` to `options?.baseTimestamp ?? Date.now()`, eliminating sequence tick vs wall clock conflation.
  5. Decouple financial narrative logic into satellite module `src/client/events/subscribers/activity_log_financial_formatter.ts`, keeping `activity_log_subscriber.ts` safely at 351/400 LOC.

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-369`
- **Subsystem**: `client-ui` (Tier 2 UI/Views & Activity Presentation)
- **Direct Scope (Physical Files)**:
  - **Target physical file**: `src/client/events/subscribers/activity_log_subscriber.ts` (Refactor)
  - **Target physical file**: `src/client/events/subscribers/activity_log_financial_formatter.ts` (New)
  - **Target physical file**: `src/client/ui/activity_feed_sidebar.tsx` (Refactor)
  - **Target physical file**: `tests/contracts/imp369_activity_feed_financial_clarity.test.ts` (New)
- **Referenced Contracts / Stable Boundaries**:
  - `src/client/events/game_event_types.ts`
  - `src/client/store/activity_store.ts`
  - `src/client/events/game_event_financial_synthesizer.ts`
  - `src/client/events/game_event_property_synthesizer.ts`
  - `src/client/network/apply_delta.ts`
  - `tests/client/imp330_game_event_narrative_synthesizer.test.ts`

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/events/subscribers/activity_log_subscriber.ts` | Tier 1 (Domain/FSM/Server) | 351 | 351 | 0 | <= 400 | Warning (DEBT-ACTIVITY-LOG-SUBMODULE) |
| `src/client/events/subscribers/activity_log_financial_formatter.ts` | Tier 1 (Domain/FSM/Server) | 66 | 66 | 0 | <= 400 | Safe |
| `src/client/ui/activity_feed_sidebar.tsx` | Tier 2 (UI/3D/Views) | 349 | 349 | 0 | <= 500 | Safe |
| `tests/contracts/imp369_activity_feed_financial_clarity.test.ts` | Living Test | 229 | 229 | 0 | <= 600 | Safe |

## 3. Implementation Steps

### Station 1: Red Contract Test Specifications
**Target physical file**: `tests/contracts/imp369_activity_feed_financial_clarity.test.ts` (New)
- TC-369.01 [UC-IMP369/MSS]: Given FEE_PAID event with feeType TELECOM_DATA and receiverId, When mapEventToActivityLog processes event, Then message contains recipient name and Viettel Post, type is 'utility'.
- TC-369.02 [UC-IMP369/MSS]: Given FEE_PAID event with feeType LAND_TAX at cell 4, When mapEventToActivityLog processes event, Then message contains "Lệ Phí Đất (Ô 04) vào Kho Bạc", type is 'tax'.
- TC-369.03 [UC-IMP369/MSS]: Given FEE_PAID event with feeType BAIL at cell 10, When mapEventToActivityLog processes event, Then message contains "bảo lãnh Kiểm Toán (Ô 10) vào Kho Bạc", type is 'bail'.
- TC-369.04 [UC-IMP369/A1]: Given FEE_PAID event with feeType TAX and delta has lastEventCard title, When mapEventToActivityLog processes event, Then message contains card title and Kho Bạc, type is 'tax'.
- TC-369.05 [UC-IMP369/A2]: Given FEE_PAID event with feeType TAX and no active card, When mapEventToActivityLog processes event, Then message contains general government tax text, type is 'tax'.
- TC-369.06 [UC-IMP369/MSS]: Given ActivityFeedSidebar helper getActivityIcon, When type is 'bail' or 'utility', Then returns corresponding icon and money filter includes utility and bail.
- TC-369.07 [UC-IMP369/A3]: Given event with missing or zero timestamp, When mapEventToActivityLog executes, Then falls back to Date.now() preventing 08:00:00 display.
- TC-369.08 [UC-IMP369/A4]: Given positive reward event card (effectDelta > 0), When fee event is processed, Then card title is NOT misattributed and message falls back to general tax.
- TC-369.09 [UC-IMP369/A5]: Given card targeted to another player (drawnBy: 'p1'), When payer fee event is processed for 'bot_4', Then card title is NOT misattributed.

### Station 2: Implementation (GREEN)

#### Code Specification for New File: `src/client/events/subscribers/activity_log_financial_formatter.ts`
```typescript
import type { EventCardInfo } from '../../../domain/room.js';
import type { ActivityLogType } from '../../store/activity_store.js';
import type { SynthesizedGameEvent } from '../game_event_types.js';
import { SynthesizedGameEventType } from '../game_event_types.js';
import type { GameEventContext } from '../game_event_bus.js';
import { formatCurrency } from '../../ui/ui_helpers.js';

export function isCardPenaltyForPayer(card: EventCardInfo | null | undefined, payerId: string): boolean {
  if (!card) return false;
  const hasNegativeDelta = card.effectDelta !== undefined && card.effectDelta < 0;
  const hasPenaltyAction = card.action === 'pay_fine' || card.action === 'tax' || card.action === 'pay';
  const hasPenaltyText = Boolean(
    (card.destination && /Kho Bạc|nộp phạt|truy thu|phạt/i.test(card.destination)) ||
    (card.effectDetail && /nộp phạt|truy thu|phạt|lệ phí/i.test(card.effectDetail)) ||
    (card.description && /truy thu thuế|phạt|bồi thường/i.test(card.description)),
  );
  if (!hasNegativeDelta && !hasPenaltyAction && !hasPenaltyText) {
    return false;
  }
  const isTargeted = card.drawnBy === payerId || card.playerId === payerId || card.affectedPlayerId === payerId;
  const isGlobalMarket = card.type === 'Market' || card.cardType === 'market';
  return isTargeted || isGlobalMarket;
}

export function formatGoSalaryDeductionSuffix(
  deductions?: { propertyTax?: number; mortgageInterest?: number; overdraft?: number; creditFee?: number },
  fallbackTax = 0,
): string {
  const parts: string[] = [];
  const tax = deductions?.propertyTax ?? fallbackTax;
  if (tax > 0) parts.push(`thuế ${formatCurrency(tax)}`);
  if (deductions?.mortgageInterest && deductions.mortgageInterest > 0) parts.push(`lãi thế chấp ${formatCurrency(deductions.mortgageInterest)}`);
  if (deductions?.overdraft && deductions.overdraft > 0) parts.push(`thấu chi ${formatCurrency(deductions.overdraft)}`);
  if (deductions?.creditFee && deductions.creditFee > 0) parts.push(`phí thẻ ${formatCurrency(deductions.creditFee)}`);
  return parts.length > 0 ? ` (khấu trừ: ${parts.join(', ')})` : '';
}

export function resolveFeePaidDetails(
  event: Extract<SynthesizedGameEvent, { type: SynthesizedGameEventType.FEE_PAID }>,
  context: GameEventContext,
  playerName: string,
  targetPlayerName?: string,
): { logType: ActivityLogType; message: string } {
  const isTelecom = event.feeType === 'TELECOM_DATA';
  const isLand = event.feeType === 'LAND_TAX' || event.cellIndex === 4;
  const isBail = event.feeType === 'BAIL' || event.cellIndex === 10;
  const card = context.delta.lastEventCard;
  const hasValidCardPenalty = isCardPenaltyForPayer(card, event.payerId);
  const cardTitle = hasValidCardPenalty ? card?.title : undefined;

  const logType: ActivityLogType = isTelecom ? 'utility' : isBail ? 'bail' : 'tax';
  const receiverSuffix = targetPlayerName ? ` cho ${targetPlayerName} (Viettel Post)` : ' (Viettel Post)';
  const message = isTelecom
    ? `${playerName} đã thanh toán ${formatCurrency(event.amount)} cước viễn thông${receiverSuffix}`
    : isLand
    ? `${playerName} đã nộp ${formatCurrency(event.amount)} Lệ Phí Đất (Ô 04) vào Kho Bạc`
    : isBail
    ? `${playerName} đã nộp ${formatCurrency(event.amount)} bảo lãnh Kiểm Toán (Ô 10) vào Kho Bạc`
    : cardTitle
    ? `${playerName} đã nộp phạt ${formatCurrency(event.amount)} (${cardTitle}) vào Kho Bạc`
    : `${playerName} đã nộp ${formatCurrency(event.amount)} thuế/phạt vào Kho Bạc Nhà Nước`;
  return { logType, message };
}
```

#### Task 1: Drop-in Snippet in `src/client/events/subscribers/activity_log_subscriber.ts`
**Target physical file**: `src/client/events/subscribers/activity_log_subscriber.ts`
```typescript
<<<<
import { formatCurrency } from '../../ui/ui_helpers.js';
import {
  formatGoSalaryDeductionSuffix,
  resolveFeePaidDetails,
} from './activity_log_financial_formatter.js';
====
import { formatCurrency } from '../../ui/ui_helpers.js';
import {
  formatGoSalaryDeductionSuffix,
  resolveFeePaidDetails,
} from './activity_log_financial_formatter.js';
>>>>
```

#### Task 2: Drop-in Snippet in `src/client/ui/activity_feed_sidebar.tsx`
**Target physical file**: `src/client/ui/activity_feed_sidebar.tsx`
```typescript
<<<<
    case 'bail':
      return '🚨';
    case 'utility':
      return '📡';
    case 'trade':
====
    case 'bail':
      return '🚨';
    case 'utility':
      return '📡';
    case 'trade':
>>>>
```

```typescript
<<<<
          log.type === 'bail' ||
          log.type === 'utility' ||
          log.type === 'buy' ||
====
          log.type === 'bail' ||
          log.type === 'utility' ||
          log.type === 'buy' ||
>>>>
```

## 4. Verification & Hardening Gates
- **Station 1 (RED)**: Scaffold contract tests, verify runtime assertion failures.
- **Station 2 (GREEN)**: Apply verified snippets, verify 100% tests pass.
- **Station 3 (Pre-Filter)**: Run `npm run prefilter` (TypeScript, LOC, linters).
- **Station 4 (Evidence)**: Run `node scripts/check_evidence.mjs IMP-369` for physical audit verification.
- **Definition of Done (DoD)**: All 9 contract tests in `imp369` pass, living event suites pass 60/60, and activity feed messages show Vietnamese context with valid timestamps and zero card title misattribution.
