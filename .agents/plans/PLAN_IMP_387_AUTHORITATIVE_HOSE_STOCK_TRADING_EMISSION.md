# Plan IMP-387: Authoritative HOSE Stock Trading Emission & Client Zero-Heuristic Dispatch (Ticket IMP-387)

## 0. Auto-Slicing Roadmap & Context
- **Sprint 1 Roadmap**: Slice 1A (IMP-382 - DONE): Domain Events Wire Pipeline. Slice 1B (IMP-386 - DONE): Authoritative Bond Lifecycle Emission. Slice 1C (IMP-387 - THIS TICKET): Authoritative HOSE Stock Trading Emission & Client Zero-Heuristic Dispatch. Slice 1D (IMP-388 - NEXT TICKET): Core Navigation & Synthesizer De-Heuristication (Rent, Salary & Synthesizer reduction < 200 LOC).
- **SSOT & Invariants**: Server phát thải `HOSE_SETTLED` (stake, roll, payout, multiplier, profit, diceSeq, timestamp) vào `room.pendingDomainEvents` khi `handleHoseInvest` thành công. Khai báo `ServerDomainEvent` dưới dạng Discriminated Union chặt chẽ (ADV-03). Client trực tiếp tiêu thụ sự kiện từ `delta.domainEvents`, sử dụng type predicate (ADV-02) và đồng bộ `lastProcessedHoseKey` với cùng định dạng `${playerId}_${timestamp}_${roll}_${diceSeq ?? 0}` (ADV-01) để triệt tiêu hoàn toàn nguy cơ phát thải lặp khi tick sau rơi vào fallback. Tái sử dụng hàm chuẩn `restoreDeltaOutflow` từ `game_event_financial_helpers.ts` cho cả 2 nhánh (ADV-03) để xóa bỏ khớp nối chéo giữa HOSE và Bond, dập tắt triệt để va chạm cấn trừ (Netting Collision).

## 1. Physical Target Files & Honest LOC Accounting
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/domain/room.ts` | Tier 1 (Domain/Server/Logic) | 307 | 328 | +21 | <= 400 | Warning (Debt: DEBT-DOM-01) |
| `src/server/hose_actions.ts` | Tier 1 (Domain/Server/Logic) | 45 | 58 | +13 | <= 400 | Safe (< 100 LOC) |
| `src/client/events/game_event_financial_helpers.ts` | Tier 1 (Domain/Server/Logic) | 213 | 230 | +17 | <= 400 | Safe (< 250 LOC) |
| `src/client/events/game_event_bond_helpers.ts` | Tier 1 (Domain/Server/Logic) | 139 | 111 | -28 | <= 400 | Safe (< 150 LOC) |
| `src/client/events/game_event_hose_helpers.ts` | Tier 1 (Domain/Server/Logic) | 56 | 73 | +17 | <= 400 | Safe (< 150 LOC) |
| `tests/client/imp387_authoritative_hose_emission.test.ts` | Living Test | 0 | 250 | +250 | <= 600 | New contract suite |
| `docs/FEATURE_MAP.md` | SSOT Matrix | 93 | 93 | 0 | N/A | Cập nhật Pillar 07 |

## 2. In-Action Visual Capture Registration
- Scenario: Non-UI (Server Domain Events Wire & Client Financial Synthesizer). Visual capture bypassed per Gotcha 13; mechanical verification via check_evidence.mjs.

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
- **Suite Setup**: `tests/client/imp387_authoritative_hose_emission.test.ts` mandates `beforeEach(() => { resetHoseEventTracker(); })` to guarantee 0 state contamination between tests (ADV-04).
- **TC-387.01 [UC-HOSE-INVEST-SERVER-EMISSION/MSS]:** Given room in HosePhase and valid player stake, When handleHoseInvest executes successfully with win/loss/break-even outcome, Then pushes canonical HOSE_SETTLED to room.pendingDomainEvents with exact stake, roll, payout, multiplier, profit, diceSeq, and timestamp.
- **TC-387.02 [UC-HOSE-SKIP-ZERO-EMISSION/MSS]:** Given room in HosePhase, When handleHoseSkip executes, Then transitions to PropertyManagement without pushing any HOSE_SETTLED event to room.pendingDomainEvents.
- **TC-387.03 [UC-CLIENT-DIRECT-HOSE-DISPATCH/MSS]:** Given DeltaPayload with domainEvents containing HOSE_SETTLED, When extractHoseEvents is called, Then returns canonical HoseSettledEvent matching server payload without relying on mutable lastProcessedHoseKey state.
- **TC-387.04 [UC-HOSE-LOSS-NETTING-COLLISION-DEFENSE/MSS]:** Given player suffering HOSE loss (-1000) and simultaneously crossing GO (+2000 salary) in same tick, When extractHoseEvents processes authoritative loss alongside concurrent salary inflow, Then restores loss diff symmetrically via restoreDeltaOutflow so salary inflow is preserved with 0 phantom tax.
- **TC-387.05 [UC-HOSE-WIN-PROFIT-DEDUCTION/MSS]:** Given player winning HOSE profit (+2000), When extractHoseEvents runs with authoritative HOSE_SETTLED, Then synthesizes HoseSettledEvent and cleanly deducts inflow from balance deltas via deductInflowFromDeltas.
- **TC-387.06 [UC-HOSE-IDEMPOTENT-STREAM-IMMUNITY/MSS]:** Given repeated calls on the same DeltaPayload containing HOSE_SETTLED, When extractHoseEvents executes repeatedly, Then deduplicates using synchronized key format and returns empty array on subsequent passes without state corruption.
- **TC-387.07 [UC-HOSE-PRESENTATION-WIRE/MSS]:** Given HOSE_SETTLED event processed, When activity log subscriber and floating badge subscriber consume it, Then accurately dispatches profit/loss/break-even Vietnamese narrative and floating badge without dropped toasts.
- **TC-387.08 [UC-HOSE-MULTI-TICK-STALE-RESULT-IMMUNITY/MSS]:** Given Tick 1 with domainEvents containing HOSE_SETTLED and lastHoseResult, When Tick 2 arrives with domainEvents undefined and identical lastHoseResult, Then extractHoseEvents returns empty array without duplicate dispatch or balance corruption.

### Station 2: Implementation (GREEN)

#### Task 1: Khai báo Discriminated Union cho ServerDomainEvent (kèm diceSeq)
**Target physical file**: `src/domain/room.ts`
```typescript
<<<<
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
====
export interface BondRepaidServerEvent {
  readonly type: 'BOND_REPAID';
  readonly playerId: string;
  readonly principal: number;
  readonly interest?: number;
  readonly repayAmount?: number;
  readonly trancheId?: BondTrancheId | string;
  readonly timestamp: number;
}
export interface BondDefaultServerEvent {
  readonly type: 'BOND_DEFAULT';
  readonly playerId: string;
  readonly principal: number;
  readonly repayAmount?: number;
  readonly cashSeized?: number;
  readonly trancheId?: BondTrancheId | string;
  readonly timestamp: number;
}
export interface HoseSettledServerEvent {
  readonly type: 'HOSE_SETTLED';
  readonly playerId: string;
  readonly stake: number;
  readonly roll: number;
  readonly payout: number;
  readonly multiplier: number;
  readonly profit: number;
  readonly diceSeq?: number;
  readonly timestamp: number;
}
export type ServerDomainEvent = BondRepaidServerEvent | BondDefaultServerEvent | HoseSettledServerEvent;
>>>>
```

#### Task 2: Server phát thải HOSE_SETTLED vào pendingDomainEvents kèm diceSeq
**Target physical file**: `src/server/hose_actions.ts`
```typescript
<<<<
  room.lastHoseResult = hoseResult;
  room.diceSeq = hoseResult.diceSeq;
  room.phase = TurnPhase.PropertyManagement;
  return { success: true };
====
  room.lastHoseResult = hoseResult;
  room.diceSeq = hoseResult.diceSeq;
  if (!room.pendingDomainEvents) room.pendingDomainEvents = [];
  room.pendingDomainEvents.push({
    type: 'HOSE_SETTLED',
    playerId: current.id,
    stake,
    roll: face,
    payout,
    multiplier,
    profit,
    diceSeq: hoseResult.diceSeq,
    timestamp: hoseResult.timestamp,
  });
  room.phase = TurnPhase.PropertyManagement;
  return { success: true };
>>>>
```

#### Task 3: Xuất restoreDeltaOutflow tại helper tài chính trung tâm
**Target physical file**: `src/client/events/game_event_financial_helpers.ts`
```typescript
<<<<
  // 3. Clean up neutralized payers
  for (let i = payers.length - 1; i >= 0; i--) {
    if (payers[i]!.diff === 0) payers.splice(i, 1);
  }
}

export { extractBondEvents } from './game_event_bond_helpers.js';
====
  // 3. Clean up neutralized payers
  for (let i = payers.length - 1; i >= 0; i--) {
    if (payers[i]!.diff === 0) payers.splice(i, 1);
  }
}

export function restoreDeltaOutflow(playerId: string, amount: number, payers: InternalBalanceDelta[], receivers: InternalBalanceDelta[]): void {
  const payIdx = payers.findIndex((py) => py.id === playerId);
  if (payIdx !== -1) {
    const newDiff = payers[payIdx]!.diff + amount;
    if (newDiff === 0) payers.splice(payIdx, 1);
    else if (newDiff > 0) {
      const payerObj = payers[payIdx]!;
      payers.splice(payIdx, 1);
      receivers.push({ id: playerId, diff: newDiff, cellIndex: payerObj.cellIndex, prevP: payerObj.prevP, hasPassedGo: payerObj.hasPassedGo, isSentToAudit: payerObj.isSentToAudit });
    } else payers[payIdx]!.diff = newDiff;
  } else {
    const recIdx = receivers.findIndex((r) => r.id === playerId);
    if (recIdx !== -1) receivers[recIdx]!.diff += amount;
    else if (amount > 0) receivers.push({ id: playerId, diff: amount, cellIndex: undefined, prevP: undefined, hasPassedGo: false, isSentToAudit: false });
  }
}

export { extractBondEvents } from './game_event_bond_helpers.js';
>>>>
```

#### Task 4: Chuyển Bond sang dùng restoreDeltaOutflow từ financial helpers
**Target physical file**: `src/client/events/game_event_bond_helpers.ts`
```typescript
<<<<
import {
  type InternalBalanceDelta,
  deductInflowFromDeltas,
} from './game_event_financial_helpers.js';

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
====
import {
  type InternalBalanceDelta,
  deductInflowFromDeltas,
  restoreDeltaOutflow,
} from './game_event_financial_helpers.js';

function isValidBondTrancheId(val: unknown): val is BondTrancheId {
  return val === BondTrancheId.WORKING_CAPITAL || val === BondTrancheId.EXPANSION || val === BondTrancheId.ALL_IN;
}
>>>>
```

#### Task 5: Client tiêu thụ HOSE_SETTLED với Type Predicate, đồng bộ Key chuẩn và dập tắt Netting Collision
**Target physical file**: `src/client/events/game_event_hose_helpers.ts`
```typescript
<<<<
import {
  type InternalBalanceDelta,
  deductInflowFromDeltas,
} from './game_event_financial_helpers.js';
====
import type { HoseSettledServerEvent } from '../../domain/room.js';
import {
  type InternalBalanceDelta,
  deductInflowFromDeltas,
  restoreDeltaOutflow,
} from './game_event_financial_helpers.js';
>>>>
```
```typescript
<<<<
export function extractHoseEvents(
  delta: DeltaPayload,
  payers: InternalBalanceDelta[],
  receivers: InternalBalanceDelta[],
  timestamp: number,
): HoseSettledEvent[] {
  if (!delta.lastHoseResult) {
    lastProcessedHoseKey = null;
    return [];
  }

  const hr = delta.lastHoseResult;
  const hoseKey = `${hr.playerId}_${hr.timestamp}_${hr.roll}_${hr.diceSeq ?? 0}`;
  if (lastProcessedHoseKey === hoseKey) return [];
  lastProcessedHoseKey = hoseKey;

  const event: HoseSettledEvent = {
    type: SynthesizedGameEventType.HOSE_SETTLED,
    timestamp,
    playerId: hr.playerId,
    stake: hr.stake,
    roll: hr.roll,
    payout: hr.payout,
    multiplier: hr.multiplier,
    profit: hr.profit,
  };

  if (hr.profit < 0) {
    const payIdx = payers.findIndex((py) => py.id === hr.playerId);
    if (payIdx !== -1) {
      payers[payIdx]!.diff += Math.abs(hr.profit);
      if (payers[payIdx]!.diff === 0) payers.splice(payIdx, 1);
    }
  } else if (hr.profit > 0) {
    deductInflowFromDeltas(hr.playerId, hr.profit, undefined, undefined, payers, receivers);
  }

  return [event];
}
====
export function extractHoseEvents(
  delta: DeltaPayload,
  payers: InternalBalanceDelta[],
  receivers: InternalBalanceDelta[],
  timestamp: number,
): HoseSettledEvent[] {
  const serverEvents = (delta.domainEvents ?? []).filter(
    (e): e is HoseSettledServerEvent => e.type === 'HOSE_SETTLED',
  );
  if (serverEvents.length > 0) {
    const events: HoseSettledEvent[] = [];
    for (const ev of serverEvents) {
      const hoseKey = `${ev.playerId}_${ev.timestamp}_${ev.roll}_${ev.diceSeq ?? 0}`;
      if (lastProcessedHoseKey === hoseKey) continue;
      lastProcessedHoseKey = hoseKey;

      events.push({
        type: SynthesizedGameEventType.HOSE_SETTLED,
        timestamp: ev.timestamp ?? timestamp,
        playerId: ev.playerId, stake: ev.stake, roll: ev.roll,
        payout: ev.payout, multiplier: ev.multiplier, profit: ev.profit,
      });

      if (ev.profit < 0) restoreDeltaOutflow(ev.playerId, Math.abs(ev.profit), payers, receivers);
      else if (ev.profit > 0) deductInflowFromDeltas(ev.playerId, ev.profit, undefined, undefined, payers, receivers);
    }
    if (delta.lastHoseResult) {
      const hr = delta.lastHoseResult;
      lastProcessedHoseKey = `${hr.playerId}_${hr.timestamp}_${hr.roll}_${hr.diceSeq ?? 0}`;
    }
    return events;
  }

  if (!delta.lastHoseResult) {
    lastProcessedHoseKey = null;
    return [];
  }

  const hr = delta.lastHoseResult;
  const hoseKey = `${hr.playerId}_${hr.timestamp}_${hr.roll}_${hr.diceSeq ?? 0}`;
  if (lastProcessedHoseKey === hoseKey) return [];
  lastProcessedHoseKey = hoseKey;

  const event: HoseSettledEvent = {
    type: SynthesizedGameEventType.HOSE_SETTLED,
    timestamp, playerId: hr.playerId, stake: hr.stake, roll: hr.roll,
    payout: hr.payout, multiplier: hr.multiplier, profit: hr.profit,
  };

  if (hr.profit < 0) restoreDeltaOutflow(hr.playerId, Math.abs(hr.profit), payers, receivers);
  else if (hr.profit > 0) deductInflowFromDeltas(hr.playerId, hr.profit, undefined, undefined, payers, receivers);

  return [event];
}
>>>>
```

## 4. Definition of Done (DoD)
- 100% (8/8) ca kiểm thử hợp đồng trong `tests/client/imp387_authoritative_hose_emission.test.ts` chuyển sang GREEN.
- Toàn bộ các cổng cơ học (`prefilter`, `check:loc`, `check:scope`) pass 100% với exit code 0.
- Không phát sinh dirty cast (`as any`), tuân thủ Discriminated Union chặt chẽ, không vi phạm LOC buffer zone (tất cả các tệp đều $< 350$ LOC).
- Chaos Sentinel AST Mutation tiêu diệt 100% mutants mục tiêu liên quan đến phát thải và tiêu thụ sự kiện `HOSE_SETTLED`.
- Cập nhật tài liệu Single Source of Truth `docs/FEATURE_MAP.md` (Pillar 07).
