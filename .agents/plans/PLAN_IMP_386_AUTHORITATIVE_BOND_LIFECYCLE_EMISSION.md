# Plan IMP-386: Authoritative Bond Lifecycle Emission & Client Zero-Heuristic Financial Dispatch (Ticket IMP-386)
## 0. Auto-Slicing Roadmap & Context
- Slice 1A (IMP-382 - DONE): Wire Pipeline. Slice 1B (IMP-386 - THIS TICKET): Authoritative Bond Lifecycle Emission & Client Zero-Heuristic Dispatch. Sprints 2-3: IMP-387 & IMP-388.
- SSOT & Invariant: Server phát thải BOND_REPAID / BOND_DEFAULT (kèm cashSeized) vào room.pendingDomainEvents; Client nhận qua delta.domainEvents, hoàn trả payers/receivers triệt tiêu Netting Collision (kể cả trường hợp Zero-Net Inflow). Chặn fallback qua handledBondPlayerIds tại nhánh trả nợ cũ (bảo toàn BOND_ISSUED) và type guard isValidBondTrancheId. Khép kín Presentation Wire với Floating Badge và Activity Log.
- Architectural Waiver (Authoritative BOND_ISSUED): Để bảo đảm Scope Confinement (<= 3 cohesive families), việc chuyển BOND_ISSUED sang server-driven được dành cho ticket kế tiếp. TC-386.08 kiểm chứng heuristic BOND_ISSUED hoạt động song song ổn định.
## 1. Physical Target Files & Honest LOC Accounting
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/domain/room.ts` | Tier 1 (Domain/Server/Logic) | 306 | 307 | +1 | <= 400 | Warning (Debt: DEBT-DOM-01) |
| `src/server/bond_manager.ts` | Tier 1 (Domain/Server/Logic) | 239 | 266 | +27 | <= 400 | Safe (< 300 LOC) |
| `src/client/events/game_event_types.ts` | Tier 3 (Static Config / Types) | 247 | 257 | +10 | <= 800 | Safe (< 300 LOC) |
| `src/client/events/game_event_bond_helpers.ts` | Tier 1 (Domain/Server/Logic) | 93 | 139 | +46 | <= 400 | Safe (< 160 LOC) |
| `src/client/events/subscribers/activity_log_subscriber.ts` | Tier 1 (Domain/Server/Logic) | 342 | 348 | +6 | <= 400 | Warning (>= 300 LOC - Debt: DEBT-ACTIVITY-LOG-SUBMODULE) |
| `src/client/events/subscribers/activity_log_financial_formatter.ts` | Tier 1 (Domain/Server/Logic) | 115 | 124 | +9 | <= 400 | Safe (< 150 LOC) |
| `src/client/events/subscribers/badge_financial_helpers.ts` | Tier 1 (Domain/Server/Logic) | 105 | 121 | +16 | <= 400 | Safe (< 150 LOC) |
| `tests/client/imp386_authoritative_bond_lifecycle.test.ts` | Living Test | 0 | 250 | +250 | <= 600 | New contract suite |
| `docs/FEATURE_MAP.md` | SSOT Matrix | 93 | 93 | 0 | N/A | Cập nhật Pillar 10 |
## 2. In-Action Visual Capture Registration: Non-UI. Bypassed per Gotcha 13; mechanical audit via check_evidence.mjs.
## 3. Implementation Steps
### Station 1: Contract Testing (RED)
- **TC-386.01 [UC-BOND-ACTIVE-REPAY-EMISSION/MSS]:** Given active bond and sufficient balance, When handleRepayBond executes, Then pushes canonical BOND_REPAID to room.pendingDomainEvents with exact principal, interest, repayAmount, and timestamp.
- **TC-386.02 [UC-BOND-TURN-TRANSITION-REPAY-EMISSION/MSS]:** Given active bond expiring on turn transition (roundsLeft: 1) and sufficient funds, When processBondTurnTransition executes, Then pushes canonical BOND_REPAID to room.pendingDomainEvents.
- **TC-386.03 [UC-BOND-DEFAULT-EMISSION/MSS]:** Given active bond expiring on turn transition (roundsLeft: 1) and insufficient funds, When processBondTurnTransition executes, Then pushes canonical BOND_DEFAULT to room.pendingDomainEvents with cashSeized.
- **TC-386.04 [UC-CLIENT-DIRECT-BOND-REPAID-DISPATCH/MSS]:** Given DeltaPayload with domainEvents containing BOND_REPAID, When extractBondEvents is called, Then returns canonical BondRepaidEvent matching server event without heuristic guesswork.
- **TC-386.05 [UC-CLIENT-DIRECT-BOND-DEFAULT-DISPATCH/MSS]:** Given DeltaPayload with domainEvents containing BOND_DEFAULT with cashSeized, When extractBondEvents is called, Then returns canonical BondDefaultEvent and restores cashSeized into payers/receivers to eliminate phantom tax.
- **TC-386.06 [UC-COMPOSITE-TRANSACTION-NETTING-COLLISION/MSS]:** Given simultaneously crossing GO (+2000 salary) and defaulting bond (-500 cashSeized) in same tick, When synthesizeFinancialEvents runs with authoritative BOND_DEFAULT, Then emits BOTH BondDefaultEvent and GoSalaryEvent with 0 phantom TAX fee.
- **TC-386.07 [UC-ACTIVITY-LOG-FINANCIAL-FORMATTER/MSS]:** Given bond issue parameters, When formatBondIssuedMessage executes, Then returns accurate Vietnamese log with tranche name and interest; and When formatBondDefaultMessage executes, Then returns descriptive narrative with principal, repayAmount, and cashSeized.
- **TC-386.08 [UC-BOND-ISSUANCE-PRESERVATION-AND-PRESENTATION-WIRE/MSS]:** Given player repaying bond and issuing new bond in same turn, When extractBondEvents runs, Then emits both BOND_REPAID and BOND_ISSUED; and When dispatching BOND_DEFAULT, Then triggers floating penalty badge in handleBondAndInvestmentBadges and activity log entry in activityLogSubscriber without drop.
### Station 2: Implementation (GREEN)
#### Task 1: Bổ sung cashSeized và BondTrancheId vào ServerDomainEvent
**Target physical file**: `src/domain/room.ts`
```typescript
<<<<
import type { BondContract } from './bond_types';
import type { BotPersonality } from './bot/bot_types';
import type { TransitWheelOutcome } from './transit_wheel.js';
export { ActionRejectReason } from './action_reasons';
export type { BondContract } from './bond_types';
====
import type { BondContract, BondTrancheId } from './bond_types';
import type { BotPersonality } from './bot/bot_types';
import type { TransitWheelOutcome } from './transit_wheel.js';
export { ActionRejectReason } from './action_reasons';
export type { BondContract, BondTrancheId } from './bond_types';
>>>>
```
```typescript
<<<<
export interface ServerDomainEvent {
  readonly type: 'BOND_REPAID' | 'BOND_DEFAULT';
  readonly playerId: string;
  readonly principal: number;
  readonly interest?: number;
  readonly repayAmount?: number;
  readonly trancheId?: string;
  readonly timestamp: number;
}
====
export interface ServerDomainEvent {
  readonly type: 'BOND_REPAID' | 'BOND_DEFAULT';
  readonly playerId: string;
  readonly principal: number;
  readonly interest?: number;
  readonly repayAmount?: number;
  readonly cashSeized?: number;
  readonly trancheId?: BondTrancheId | string;
  readonly timestamp: number;
}
>>>>
```
#### Task 2: Phát thải sự kiện BOND_REPAID và BOND_DEFAULT có thẩm quyền (kèm cashSeized)
**Target physical file**: `src/server/bond_manager.ts`
```typescript
<<<<
import { TurnPhase, type Room, type Player } from '../domain/room';
====
import { TurnPhase, type Room, type Player, type ServerDomainEvent } from '../domain/room';
>>>>
```
```typescript
<<<<
  player.balance -= player.bondContract.repayAmount;
  const interestPaid = Math.max(0, player.bondContract.repayAmount - player.bondContract.principal);
  room.treasury = (room.treasury ?? 0) + interestPaid;
  player.bondContract = null;
  return { success: true };
====
  player.balance -= player.bondContract.repayAmount;
  const interestPaid = Math.max(0, player.bondContract.repayAmount - player.bondContract.principal);
  room.treasury = (room.treasury ?? 0) + interestPaid;
  (room.pendingDomainEvents ??= []).push({
    type: 'BOND_REPAID',
    playerId: player.id,
    principal: player.bondContract.principal,
    interest: interestPaid,
    repayAmount: player.bondContract.repayAmount,
    ...(player.bondContract.trancheId ? { trancheId: player.bondContract.trancheId } : {}),
    timestamp: Date.now(),
  });
  player.bondContract = null;
  return { success: true };
>>>>
```
```typescript
<<<<
  // Nhánh 2: Đáo hạn (roundsLeft === 1) và đủ tiền tất toán
  if (player.balance >= player.bondContract.repayAmount) {
    player.balance -= player.bondContract.repayAmount;
    const interestPaid = Math.max(0, player.bondContract.repayAmount - player.bondContract.principal);
    room.treasury = (room.treasury ?? 0) + interestPaid;
    player.bondContract = null;
    return;
  }

  // Nhánh 3: Đáo hạn (roundsLeft === 1) nhưng không đủ tiền -> VỠ NỢ TRÁI PHIẾU
  const cash = Math.min(Math.max(0, player.balance), player.bondContract.repayAmount);
  player.balance -= cash;
  room.treasury = (room.treasury ?? 0) + cash;

  const cells = [...player.bondContract.collateralCells];
  for (const cell of cells) {
    registry.delete(cell);
    stateMap.delete(cell);
  }

  room.fireSaleQueue = cells;
  room.fireSaleDebtorId = player.id;
  player.bondContract = null;
====
  // Nhánh 2: Đáo hạn (roundsLeft === 1) và đủ tiền tất toán
  if (player.balance >= player.bondContract.repayAmount) {
    player.balance -= player.bondContract.repayAmount;
    const interestPaid = Math.max(0, player.bondContract.repayAmount - player.bondContract.principal);
    room.treasury = (room.treasury ?? 0) + interestPaid;
    (room.pendingDomainEvents ??= []).push({
      type: 'BOND_REPAID',
      playerId: player.id,
      principal: player.bondContract.principal,
      interest: interestPaid,
      repayAmount: player.bondContract.repayAmount,
      ...(player.bondContract.trancheId ? { trancheId: player.bondContract.trancheId } : {}),
      timestamp: Date.now(),
    });
    player.bondContract = null;
    return;
  }

  // Nhánh 3: Đáo hạn (roundsLeft === 1) nhưng không đủ tiền -> VỠ NỢ TRÁI PHIẾU
  const cash = Math.min(Math.max(0, player.balance), player.bondContract.repayAmount);
  player.balance -= cash;
  room.treasury = (room.treasury ?? 0) + cash;

  const cells = [...player.bondContract.collateralCells];
  for (const cell of cells) {
    registry.delete(cell);
    stateMap.delete(cell);
  }

  room.fireSaleQueue = cells;
  room.fireSaleDebtorId = player.id;
  (room.pendingDomainEvents ??= []).push({
    type: 'BOND_DEFAULT',
    playerId: player.id,
    principal: player.bondContract.principal,
    repayAmount: player.bondContract.repayAmount,
    cashSeized: cash,
    ...(player.bondContract.trancheId ? { trancheId: player.bondContract.trancheId } : {}),
    timestamp: Date.now(),
  });
  player.bondContract = null;
>>>>
```
#### Task 3: Bổ sung SynthesizedGameEventType.BOND_DEFAULT & BondDefaultEvent
**Target physical file**: `src/client/events/game_event_types.ts`
```typescript
<<<<
  BOND_REPAID = 'BOND_REPAID',
  BOND_ISSUED = 'BOND_ISSUED',
  COMPULSORY_BUYOUT = 'COMPULSORY_BUYOUT',
====
  BOND_REPAID = 'BOND_REPAID',
  BOND_ISSUED = 'BOND_ISSUED',
  BOND_DEFAULT = 'BOND_DEFAULT',
  COMPULSORY_BUYOUT = 'COMPULSORY_BUYOUT',
>>>>
```
```typescript
<<<<
export interface BondRepaidEvent extends BaseSynthesizedEvent {
  readonly type: SynthesizedGameEventType.BOND_REPAID;
  readonly playerId: string;
  readonly principal: number;
  readonly interest: number;
  readonly totalRepaid: number;
  readonly repayAmount: number;
  readonly trancheId?: BondTrancheId;
}
====
export interface BondRepaidEvent extends BaseSynthesizedEvent {
  readonly type: SynthesizedGameEventType.BOND_REPAID;
  readonly playerId: string;
  readonly principal: number;
  readonly interest: number;
  readonly totalRepaid: number;
  readonly repayAmount: number;
  readonly trancheId?: BondTrancheId;
}

export interface BondDefaultEvent extends BaseSynthesizedEvent {
  readonly type: SynthesizedGameEventType.BOND_DEFAULT;
  readonly playerId: string;
  readonly principal: number;
  readonly repayAmount: number;
  readonly cashSeized?: number;
  readonly trancheId?: BondTrancheId;
}
>>>>
```
```typescript
<<<<
  | TransitWheelLandedEvent
  | BondRepaidEvent
  | BondIssuedEvent
  | CompulsoryBuyoutEvent
====
  | TransitWheelLandedEvent
  | BondRepaidEvent
  | BondIssuedEvent
  | BondDefaultEvent
  | CompulsoryBuyoutEvent
>>>>
```
#### Task 4: Client Direct Dispatch từ domainEvents, Zero-Net Inflow Fix & Fallback Guard
**Target physical file**: `src/client/events/game_event_bond_helpers.ts`
```typescript
<<<<
import {
  type BondRepaidEvent,
  type BondIssuedEvent,
  SynthesizedGameEventType,
} from './game_event_types.js';
import { BOND_TRANCHES } from '../../domain/bond_types.js';
====
import {
  type BondRepaidEvent,
  type BondIssuedEvent,
  type BondDefaultEvent,
  SynthesizedGameEventType,
} from './game_event_types.js';
import { BOND_TRANCHES, BondTrancheId } from '../../domain/bond_types.js';
>>>>
```
```typescript
<<<<
export function extractBondEvents(
  delta: DeltaPayload,
  prevState: GameState,
  nextState: GameState,
  payers: InternalBalanceDelta[],
  receivers: InternalBalanceDelta[],
  timestamp: number,
): Array<BondRepaidEvent | BondIssuedEvent> {
  const events: Array<BondRepaidEvent | BondIssuedEvent> = [];
  const isDefault = delta.lastEventCard?.id === 'EVENT_BOND_DEFAULT' || delta.lastEventCard?.cardId === 'EVENT_BOND_DEFAULT';

  for (const p of delta.players ?? []) {
====
function isValidBondTrancheId(val: unknown): val is BondTrancheId {
  return val === BondTrancheId.WORKING_CAPITAL || val === BondTrancheId.EXPANSION || val === BondTrancheId.ALL_IN;
}

function restoreDeltaOutflow(playerId: string, amount: number, payers: InternalBalanceDelta[], receivers: InternalBalanceDelta[]): void {
  const payIdx = payers.findIndex((py) => py.id === playerId);
  if (payIdx !== -1) {
    const newDiff = payers[payIdx]!.diff + amount;
    if (newDiff === 0) {
      payers.splice(payIdx, 1);
    } else if (newDiff > 0) {
      const payerObj = payers[payIdx]!;
      payers.splice(payIdx, 1);
      receivers.push({
        id: playerId,
        diff: newDiff,
        cellIndex: payerObj.cellIndex,
        prevP: payerObj.prevP,
        hasPassedGo: payerObj.hasPassedGo,
        isSentToAudit: payerObj.isSentToAudit,
      });
    } else {
      payers[payIdx]!.diff = newDiff;
    }
  } else {
    const recIdx = receivers.findIndex((r) => r.id === playerId);
    if (recIdx !== -1) {
      receivers[recIdx]!.diff += amount;
    } else if (amount > 0) {
      receivers.push({ id: playerId, diff: amount, cellIndex: undefined, prevP: undefined, hasPassedGo: false, isSentToAudit: false });
    }
  }
}

export function extractBondEvents(
  delta: DeltaPayload,
  prevState: GameState,
  nextState: GameState,
  payers: InternalBalanceDelta[],
  receivers: InternalBalanceDelta[],
  timestamp: number,
): Array<BondRepaidEvent | BondIssuedEvent | BondDefaultEvent> {
  const events: Array<BondRepaidEvent | BondIssuedEvent | BondDefaultEvent> = [];
  const isDefault = delta.lastEventCard?.id === 'EVENT_BOND_DEFAULT' || delta.lastEventCard?.cardId === 'EVENT_BOND_DEFAULT';
  const handledBondPlayerIds = new Set<string>();

  if (delta.domainEvents && delta.domainEvents.length > 0) {
    for (const ev of delta.domainEvents) {
      if (ev.type === 'BOND_REPAID') {
        handledBondPlayerIds.add(ev.playerId);
        const repayAmount = ev.repayAmount ?? (ev.principal + (ev.interest ?? 0));
        events.push({
          type: SynthesizedGameEventType.BOND_REPAID,
          timestamp: ev.timestamp || timestamp,
          playerId: ev.playerId,
          principal: ev.principal,
          interest: ev.interest ?? Math.max(0, repayAmount - ev.principal),
          totalRepaid: repayAmount,
          repayAmount,
          ...(isValidBondTrancheId(ev.trancheId) ? { trancheId: ev.trancheId } : {}),
        });
        restoreDeltaOutflow(ev.playerId, repayAmount, payers, receivers);
      } else if (ev.type === 'BOND_DEFAULT') {
        handledBondPlayerIds.add(ev.playerId);
        events.push({
          type: SynthesizedGameEventType.BOND_DEFAULT,
          timestamp: ev.timestamp || timestamp,
          playerId: ev.playerId,
          principal: ev.principal,
          repayAmount: ev.repayAmount ?? ev.principal,
          ...(ev.cashSeized !== undefined ? { cashSeized: ev.cashSeized } : {}),
          ...(isValidBondTrancheId(ev.trancheId) ? { trancheId: ev.trancheId } : {}),
        });
        if (ev.cashSeized && ev.cashSeized > 0) {
          restoreDeltaOutflow(ev.playerId, ev.cashSeized, payers, receivers);
        }
      }
    }
  }

  for (const p of delta.players ?? []) {
>>>>
```
```typescript
<<<<
    // 1. Bond Repayment on Maturity (prevBond active, nextBond cleared, not default)
    if (isPrevActive && !isCurrActive && !isDefault && prevBond) {
====
    // 1. Bond Repayment on Maturity (prevBond active, nextBond cleared, not default)
    if (!handledBondPlayerIds.has(p.id) && isPrevActive && !isCurrActive && !isDefault && prevBond) {
>>>>
```
```typescript
<<<<
      // Restore repayAmount into delta to resolve Netting Collision with concurrent inflows (e.g. GO salary)
      const payIdx = payers.findIndex((py) => py.id === p.id);
      if (payIdx !== -1) {
        const newDiff = payers[payIdx]!.diff + prevBond.repayAmount;
        if (newDiff === 0) {
          payers.splice(payIdx, 1);
        } else if (newDiff > 0) {
          const payerObj = payers[payIdx]!;
          payers.splice(payIdx, 1);
          receivers.push({
            id: p.id,
            diff: newDiff,
            cellIndex: payerObj.cellIndex,
            prevP: payerObj.prevP,
            hasPassedGo: payerObj.hasPassedGo,
            isSentToAudit: payerObj.isSentToAudit,
          });
        } else {
          payers[payIdx]!.diff = newDiff;
        }
      } else {
        const recIdx = receivers.findIndex((r) => r.id === p.id);
        if (recIdx !== -1) {
          receivers[recIdx]!.diff += prevBond.repayAmount;
        }
      }
====
      // Restore repayAmount into delta to resolve Netting Collision with concurrent inflows (e.g. GO salary)
      restoreDeltaOutflow(p.id, prevBond.repayAmount, payers, receivers);
>>>>
```
#### Task 5: Bổ sung format và dispatch cho BOND_DEFAULT trong Presentation Subscribers
**Target physical file**: `src/client/events/subscribers/activity_log_financial_formatter.ts`
```typescript
<<<<
export function formatBondIssuedMessage(
  playerName: string,
  principal: number,
  roundsLeft: number,
  interestRate: number,
  trancheId?: string,
): string {
  const trancheLabel = trancheId ? `[${trancheId}] ` : '';
  const percent = Math.round(interestRate * 100);
  return `${playerName} đã phát hành Trái Phiếu ${trancheLabel}+${formatCurrency(principal)} (kỳ hạn ${roundsLeft} vòng, lãi suất ${percent}%)`;
}
====
export function formatBondIssuedMessage(
  playerName: string,
  principal: number,
  roundsLeft: number,
  interestRate: number,
  trancheId?: string,
): string {
  const trancheLabel = trancheId ? `[${trancheId}] ` : '';
  const percent = Math.round(interestRate * 100);
  return `${playerName} đã phát hành Trái Phiếu ${trancheLabel}+${formatCurrency(principal)} (kỳ hạn ${roundsLeft} vòng, lãi suất ${percent}%)`;
}

export function formatBondDefaultMessage(
  playerName: string,
  principal: number,
  repayAmount: number,
  cashSeized?: number,
): string {
  const seizedPart = cashSeized && cashSeized > 0 ? `, bị tịch thu ${formatCurrency(cashSeized)} tiền mặt` : '';
  return `${playerName} vỡ nợ gói Trái Phiếu ${formatCurrency(principal)} (phải trả ${formatCurrency(repayAmount)}${seizedPart})`;
}
>>>>
```
**Target physical file**: `src/client/events/subscribers/activity_log_subscriber.ts`
```typescript
<<<<
  formatBondRepaidMessage,
  formatBondIssuedMessage,
  formatCompulsoryBuyoutMessage,
====
  formatBondRepaidMessage,
  formatBondIssuedMessage,
  formatBondDefaultMessage,
  formatCompulsoryBuyoutMessage,
>>>>
```
```typescript
<<<<
    case SynthesizedGameEventType.BOND_ISSUED: {
      const playerName = resolvePlayerName(context, event.playerId);
      const message = formatBondIssuedMessage(playerName, event.principal, event.roundsLeft, event.interestRate, event.trancheId);
      return createFinancialLogEntry(id, timestamp, 'bond', message, event.playerId, playerName, event.principal, resolvePlayerTokenColor(context, event.playerId));
    }
====
    case SynthesizedGameEventType.BOND_ISSUED: {
      const playerName = resolvePlayerName(context, event.playerId);
      const message = formatBondIssuedMessage(playerName, event.principal, event.roundsLeft, event.interestRate, event.trancheId);
      return createFinancialLogEntry(id, timestamp, 'bond', message, event.playerId, playerName, event.principal, resolvePlayerTokenColor(context, event.playerId));
    }

    case SynthesizedGameEventType.BOND_DEFAULT: {
      const playerName = resolvePlayerName(context, event.playerId);
      const message = formatBondDefaultMessage(playerName, event.principal, event.repayAmount, event.cashSeized);
      return createFinancialLogEntry(id, timestamp, 'bond', message, event.playerId, playerName, event.cashSeized ? -event.cashSeized : undefined, resolvePlayerTokenColor(context, event.playerId));
    }
>>>>
```
**Target physical file**: `src/client/events/subscribers/badge_financial_helpers.ts`
```typescript
<<<<
    case SynthesizedGameEventType.BOND_ISSUED: {
      const delay = pacing.getPawnLandingDelay(event.playerId);
      pacing.scheduleAction(() => {
        state.addFloatingText({
          text: `+${formatCurrency(event.principal)}`,
          type: FloatingTextType.Reward,
          playerId: event.playerId,
          actionType: 'bond',
          title: 'Phát Hành Trái Phiếu Doanh Nghiệp',
          formula: `Kỳ hạn: ${event.roundsLeft} vòng, Lãi suất: ${Math.round(event.interestRate * 100)}%`,
        });
      }, delay);
      break;
    }
====
    case SynthesizedGameEventType.BOND_ISSUED: {
      const delay = pacing.getPawnLandingDelay(event.playerId);
      pacing.scheduleAction(() => {
        state.addFloatingText({
          text: `+${formatCurrency(event.principal)}`,
          type: FloatingTextType.Reward,
          playerId: event.playerId,
          actionType: 'bond',
          title: 'Phát Hành Trái Phiếu Doanh Nghiệp',
          formula: `Kỳ hạn: ${event.roundsLeft} vòng, Lãi suất: ${Math.round(event.interestRate * 100)}%`,
        });
      }, delay);
      break;
    }

    case SynthesizedGameEventType.BOND_DEFAULT: {
      const delay = pacing.getPawnLandingDelay(event.playerId);
      const seized = event.cashSeized ?? 0;
      pacing.scheduleAction(() => {
        state.addFloatingText({
          text: seized > 0 ? formatCurrency(-seized) : 'VỠ NỢ',
          type: FloatingTextType.Penalty,
          playerId: event.playerId,
          actionType: 'bond',
          title: 'Vỡ Nợ Trái Phiếu Doanh Nghiệp',
          formula: `Nợ: ${formatCurrency(event.repayAmount)} Tr. (Gốc: ${formatCurrency(event.principal)} Tr.)`,
        });
      }, delay);
      break;
    }
>>>>
```
#### Task 6: Cập nhật Knowledge Fold SSOT
**Target physical file**: `docs/FEATURE_MAP.md` (Cập nhật Pillar 10).
## 4. Definition of Done (DoD)
- 100% 8/8 tests pass trong `tests/client/imp386_authoritative_bond_lifecycle.test.ts`. Full suites pass (0 regression). Prefilter & Sentinel pass.
