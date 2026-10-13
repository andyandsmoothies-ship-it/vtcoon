# Plan IMP-388: Server Authoritative Auction Settlement & Bid Emission Pipeline (Ticket IMP-388)

## 0. Auto-Slicing Roadmap & Context
- **Sprint 1 Roadmap**: Slice 1A (IMP-382 - DONE): Domain Events Wire Pipeline. Slice 1B (IMP-386 - DONE): Authoritative Bond Lifecycle Emission. Slice 1C (IMP-387 - DONE): Authoritative HOSE Stock Trading Emission. Slice 1D (IMP-388 - THIS TICKET): Server Authoritative Auction Settlement & Bid Emission Pipeline.
- **SSOT & Invariants**: Server phát thải `AUCTION_BID_PLACED` (playerId, cellIndex, bidAmount, timestamp) trong `handleAuctionBid` và `AUCTION_WON` (playerId, cellIndex, winningBid, isForeclosure, timestamp) trong `handleAuctionClose` vào `room.pendingDomainEvents`. Mở rộng `ServerDomainEvent` dưới dạng Discriminated Union với `isForeclosure?: boolean` (ADV-04). Client trực tiếp tiêu thụ sự kiện từ `delta.domainEvents` trong `extractAuctionEvents` (map bidEvents trước wonEvents per ADV-03), loại bỏ diffing mỏng manh và chặn đứng tái phát thải giả ở Tick N+1 nhờ kiểm tra `!prevState.auction?.isConcluded` ở cả 2 nhánh (ADV-01). Trong `adjustNetDeltaForPropertyTransactions`, `auctionEvents` được kiểm tra ở cả Section 1 (khấu trừ tiền trúng đấu giá qua `restoreDeltaOutflow` hỗ trợ cả payers và receivers per ADV-02) và Section 2 (ngăn chặn nhầm lẫn thành mua trực tiếp ngân hàng `isDirectBankPurchase`).

## 1. Physical Target Files & Honest LOC Accounting
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| `src/domain/room.ts` | Tier 1 (Domain/Server/Logic) | 327 | 346 | +19 | <= 400 | Warning (Debt: DEBT-ROOM-01) |
| `src/server/auction_manager.ts` | Tier 1 (Domain/Server/Logic) | 323 | 345 | +22 | <= 400 | Warning (Debt: DEBT-AUCT-01) |
| `src/client/events/game_event_property_synthesizer.ts` | Tier 1 (Domain/Server/Logic) | 208 | 237 | +29 | <= 400 | Safe (< 300 LOC) |
| `src/client/events/game_event_financial_helpers.ts` | Tier 1 (Domain/Server/Logic) | 230 | 246 | +16 | <= 400 | Safe (< 300 LOC) |
| `src/client/events/game_event_financial_synthesizer.ts` | Tier 1 (Domain/Server/Logic) | 275 | 275 | 0 | <= 400 | Safe (< 300 LOC) |
| `tests/client/imp388_authoritative_auction_emission.test.ts` | Living Test | 0 | 320 | +320 | <= 600 | New contract suite |
| `docs/FEATURE_MAP.md` | SSOT Matrix | 94 | 94 | 0 | N/A | Cập nhật Pillar 09 |

## 2. In-Action Visual Capture Registration
- Scenario: Non-UI (Server Domain Events Wire & Client Financial Synthesizer). Visual capture bypassed per Gotcha 13; mechanical verification via check_evidence.mjs.

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
- **TC-388.01 [UC-AUCTION-BID-SERVER-EMISSION/MSS]:** Given room in AuctionPhase, When player places valid higher bid in handleAuctionBid, Then pushes canonical AUCTION_BID_PLACED to room.pendingDomainEvents with exact playerId, cellIndex, bidAmount, and timestamp.
- **TC-388.02 [UC-AUCTION-CLOSE-WINNER-SERVER-EMISSION/MSS]:** Given room in AuctionPhase with active highestBidder, When handleAuctionClose executes, Then deducts winner balance, transfers cell in registry, and pushes canonical AUCTION_WON to room.pendingDomainEvents with winnerId, winningBid, cellIndex, and isForeclosure flag.
- **TC-388.03 [UC-AUCTION-CLOSE-NO-BID-ZERO-EMISSION/MSS]:** Given room in AuctionPhase with no bidders, When handleAuctionClose executes, Then does NOT push any AUCTION_WON event to room.pendingDomainEvents.
- **TC-388.04 [UC-CLIENT-DIRECT-AUCTION-BID-DISPATCH/MSS]:** Given DeltaPayload with domainEvents containing AUCTION_BID_PLACED, When extractAuctionEvents runs, Then directly synthesizes AuctionBidPlacedEvent matching server payload without relying on auction state diffing.
- **TC-388.05 [UC-CLIENT-DIRECT-AUCTION-WON-DISPATCH/MSS]:** Given DeltaPayload with domainEvents containing AUCTION_WON, When extractAuctionEvents runs, Then marks handledAuctionCells and directly synthesizes AuctionWonEvent matching server payload.
- **TC-388.06 [UC-AUCTION-WIN-CAPITAL-DEDUCTION-DEFENSE/MSS]:** Given player winning auction for 1500 and DeltaPayload with domainEvents containing AUCTION_WON, When adjustNetDeltaForPropertyTransactions runs with authoritative event, Then absorbs winningBid via restoreDeltaOutflow without triggering phantom tax toast.
- **TC-388.07 [UC-AUCTION-WIN-NATIVE-PRESENTATION-WIRE/MSS]:** Given synthesized AUCTION_WON event, When dispatched through activity log and property market badge subscribers, Then formats descriptive Vietnamese winning announcement and floating badge with correct cell name and winning price.
- **TC-388.08 [UC-AUCTION-FALLBACK-LEGACY-DELTA-COMPATIBILITY/MSS]:** Given legacy DeltaPayload without domainEvents but with concluded delta.auction, When extractAuctionEvents and adjustNetDeltaForPropertyTransactions execute, Then backward-compatible diff logic seamlessly synthesizes events and absorbs bids with zero regression.
- **TC-388.09 [UC-AUCTION-COMPOSITE-BIDIRECTIONAL-NETTING/MSS]:** Given player winning auction for 1500 and simultaneously crossing GO collecting 2000 salary in same tick (net balance shift +500), When synthesizeFinancialEvents and synthesizePropertyEvents execute, Then emits both GO_SALARY and AUCTION_WON without phantom FEE_PAID: TAX toast, and residual +500 inflow is cleanly preserved (ADV-02).
- **TC-388.10 [UC-AUCTION-MULTI-TICK-STALE-RESULT-IMMUNITY/MSS]:** Given Tick 1 emits AUCTION_WON and delta.auction isConcluded true, When Tick 2 arrives with domainEvents undefined and lingering delta.auction isConcluded true (prevState.auction.isConcluded true), Then extractAuctionEvents returns empty array [] avoiding duplicate gavel toast and floating badge (ADV-01).

### Station 2: Implementation (GREEN)

#### Task 1: Bổ sung AuctionWonServerEvent và AuctionBidServerEvent vào ServerDomainEvent Discriminated Union
**Target physical file**: `src/domain/room.ts`
```typescript
<<<<
export type ServerDomainEvent = BondRepaidServerEvent | BondDefaultServerEvent | HoseSettledServerEvent;
====
export interface AuctionWonServerEvent {
  readonly type: 'AUCTION_WON';
  readonly playerId: string;
  readonly cellIndex: number;
  readonly winningBid: number;
  readonly isForeclosure?: boolean; // isForeclosure: optional flag
  readonly timestamp: number;
}
export interface AuctionBidServerEvent {
  readonly type: 'AUCTION_BID_PLACED';
  readonly playerId: string;
  readonly cellIndex: number;
  readonly bidAmount: number;
  readonly timestamp: number;
}
export type ServerDomainEvent =
  | BondRepaidServerEvent
  | BondDefaultServerEvent
  | HoseSettledServerEvent
  | AuctionWonServerEvent
  | AuctionBidServerEvent;
>>>>
```

#### Task 2: Server phát thải AUCTION_BID_PLACED và AUCTION_WON vào room.pendingDomainEvents
**Target physical file**: `src/server/auction_manager.ts`
```typescript
<<<<
  session.highestBid = amount;
  session.currentBid = amount;
  session.highestBidder = playerId;
====
  session.highestBid = amount;
  session.currentBid = amount;
  session.highestBidder = playerId;

  if (!room.pendingDomainEvents) room.pendingDomainEvents = [];
  room.pendingDomainEvents.push({
    type: 'AUCTION_BID_PLACED',
    playerId,
    cellIndex: session.cellIndex,
    bidAmount: amount,
    timestamp: Date.now(),
  });
>>>>
```
```typescript
<<<<
    if (winner && winner.balance >= session.highestBid) {
      winner.balance -= session.highestBid;
      registry?.set(session.cellIndex, winner.id);
      winnerId = session.highestBidder;
      winningBid = session.highestBid;
====
    if (winner && winner.balance >= session.highestBid) {
      winner.balance -= session.highestBid;
      registry?.set(session.cellIndex, winner.id);
      winnerId = session.highestBidder;
      winningBid = session.highestBid;

      const isFireSale = Boolean(session.isFireSale);
      const isForeclosure = Boolean(session.insolvencyPlayerId || isFireSale);
      if (!room.pendingDomainEvents) room.pendingDomainEvents = [];
      room.pendingDomainEvents.push({
        type: 'AUCTION_WON',
        playerId: winner.id,
        cellIndex: session.cellIndex,
        winningBid: session.highestBid,
        isForeclosure,
        timestamp: Date.now(),
      });
>>>>
```

#### Task 3: Client trích xuất có thẩm quyền AUCTION_BID_PLACED và AUCTION_WON trong property_synthesizer
**Target physical file**: `src/client/events/game_event_property_synthesizer.ts`
```typescript
<<<<
import { calculateUpgradeCost } from '../../domain/property_upgrade.js';
====
import { calculateUpgradeCost } from '../../domain/property_upgrade.js';
import type { AuctionWonServerEvent, AuctionBidServerEvent } from '../../domain/room.js';
>>>>
```
```typescript
<<<<
function extractAuctionEvents(
  delta: DeltaPayload,
  prevState: GameState,
  nextState: GameState,
  timestamp: number,
  handledAuctionCells: Set<number>,
): Array<AuctionWonEvent | AuctionBidPlacedEvent> {
  const events: Array<AuctionWonEvent | AuctionBidPlacedEvent> = [];
  const isAuctionConcluded = Boolean(delta.auction?.isConcluded || delta.auction?.winnerId !== undefined);
====
function extractAuctionEvents(
  delta: DeltaPayload,
  prevState: GameState,
  nextState: GameState,
  timestamp: number,
  handledAuctionCells: Set<number>,
): Array<AuctionWonEvent | AuctionBidPlacedEvent> {
  const serverEvents = delta.domainEvents ?? [];
  const wonEvents = serverEvents.filter((e): e is AuctionWonServerEvent => e.type === 'AUCTION_WON');
  const bidEvents = serverEvents.filter((e): e is AuctionBidServerEvent => e.type === 'AUCTION_BID_PLACED');
  if (wonEvents.length > 0 || bidEvents.length > 0) {
    const res: Array<AuctionWonEvent | AuctionBidPlacedEvent> = [];
    for (const b of bidEvents) {
      res.push({
        type: SynthesizedGameEventType.AUCTION_BID_PLACED,
        timestamp: b.timestamp ?? timestamp,
        cellIndex: b.cellIndex,
        bidderId: b.playerId,
        bidAmount: b.bidAmount,
      });
    }
    for (const w of wonEvents) {
      handledAuctionCells.add(w.cellIndex);
      res.push({
        type: SynthesizedGameEventType.AUCTION_WON,
        timestamp: w.timestamp ?? timestamp,
        cellIndex: w.cellIndex,
        winnerId: w.playerId,
        winningBid: w.winningBid,
      });
    }
    return res;
  }

  const events: Array<AuctionWonEvent | AuctionBidPlacedEvent> = [];
  const isConcluded = Boolean(delta.auction?.isConcluded);
  const isAuctionConcluded = Boolean(isConcluded || delta.auction?.winnerId !== undefined);
>>>>
```
```typescript
<<<<
  if (isAuctionConcluded && delta.auction) {
====
  if (isAuctionConcluded && delta.auction && !prevState.auction?.isConcluded) {
>>>>
```
```typescript
<<<<
  } else if (delta.auction === null && prevState.auction?.highestBidderId && nextState.auction === null) {
====
  } else if (delta.auction === null && prevState.auction?.highestBidderId && !prevState.auction?.isConcluded && nextState.auction === null) {
>>>>
```

#### Task 4: Khấu trừ dòng tiền AUCTION_WON có thẩm quyền trong adjustNetDeltaForPropertyTransactions
**Target physical file**: `src/client/events/game_event_financial_helpers.ts`
```typescript
<<<<
import { calculateUpgradeCost, type UpgradeCostModifier } from '../../domain/property_upgrade.js';
import type { DeltaPayload } from '../../server/session_manager.js';
====
import { calculateUpgradeCost, type UpgradeCostModifier } from '../../domain/property_upgrade.js';
import type { DeltaPayload } from '../../server/session_manager.js';
import type { AuctionWonServerEvent } from '../../domain/room.js';
>>>>
```
```typescript
<<<<
    readonly auction?: { readonly cellIndex?: number; readonly highestBidderId?: string | null; readonly currentBid?: number } | null;
  },
  nextState: {
    readonly playersInfo: Record<string, PlayerHudInfo>;
    readonly activeModifiers?: readonly UpgradeCostModifier[];
    readonly auction?: unknown;
  },
  payers: InternalBalanceDelta[],
): void {
  // 1. Auction settlement deduction
  const auctionWinnerId = delta.auction && (delta.auction.isConcluded || delta.auction.winnerId !== undefined)
    ? (delta.auction.winnerId ?? delta.auction.highestBidderId)
    : (delta.auction === null && prevState.auction?.highestBidderId && nextState.auction === null)
    ? prevState.auction.highestBidderId
    : undefined;
  const winningBid = delta.auction
    ? (delta.auction.finalPrice ?? delta.auction.currentBid ?? 0)
    : (prevState.auction?.currentBid ?? 0);
  if (auctionWinnerId && winningBid > 0) creditPayerDiff(payers, auctionWinnerId, winningBid);
====
    readonly auction?: { readonly cellIndex?: number; readonly highestBidderId?: string | null; readonly currentBid?: number; readonly isConcluded?: boolean } | null;
  },
  nextState: {
    readonly playersInfo: Record<string, PlayerHudInfo>;
    readonly activeModifiers?: readonly UpgradeCostModifier[];
    readonly auction?: unknown;
  },
  payers: InternalBalanceDelta[],
  receivers: InternalBalanceDelta[],
): void {
  // 1. Auction settlement deduction
  const auctionEvents = (delta.domainEvents ?? []).filter(
    (e): e is AuctionWonServerEvent => e.type === 'AUCTION_WON',
  );
  if (auctionEvents.length > 0) {
    for (const ev of auctionEvents) {
      if (ev.winningBid > 0) restoreDeltaOutflow(ev.playerId, ev.winningBid, payers, receivers);
    }
  } else {
    const isConcluded = Boolean(delta.auction?.isConcluded);
    const auctionWinnerId = delta.auction && (isConcluded || delta.auction.winnerId !== undefined) && !prevState.auction?.isConcluded
      ? (delta.auction.winnerId ?? delta.auction.highestBidderId)
      : (delta.auction === null && prevState.auction?.highestBidderId && !prevState.auction?.isConcluded && nextState.auction === null)
      ? prevState.auction.highestBidderId
      : undefined;
    const winningBid = delta.auction
      ? (delta.auction.finalPrice ?? delta.auction.currentBid ?? 0)
      : (prevState.auction?.currentBid ?? 0);
    if (auctionWinnerId && winningBid > 0) restoreDeltaOutflow(auctionWinnerId, winningBid, payers, receivers);
  }
>>>>
```
```typescript
<<<<
    const isAuction = Boolean(delta.auction?.cellIndex === cell.index || prevState.auction?.cellIndex === cell.index);
====
    const isAuction = Boolean(
      auctionEvents.some((e) => e.cellIndex === cell.index) ||
      delta.auction?.cellIndex === cell.index ||
      prevState.auction?.cellIndex === cell.index,
    );
>>>>
```

#### Task 5: Truyền receivers vào adjustNetDeltaForPropertyTransactions tại financial_synthesizer
**Target physical file**: `src/client/events/game_event_financial_synthesizer.ts`
```typescript
<<<<
  adjustNetDeltaForPropertyTransactions(delta, prevState, nextState, payers);
====
  adjustNetDeltaForPropertyTransactions(delta, prevState, nextState, payers, receivers);
>>>>
```

### Station 3: Review & Gate
- **Definition of Done (DoD)**: 100% 10/10 contract tests pass; prefilter clean (0 errors); Chaos Sentinel kills 100% mutants; `docs/FEATURE_MAP.md` updated with Auction domain emission invariant.
