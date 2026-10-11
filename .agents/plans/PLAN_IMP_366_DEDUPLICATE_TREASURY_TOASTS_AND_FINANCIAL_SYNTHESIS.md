# Plan IMP-366: Deduplicate Treasury Toasts & Financial Event Synthesis (Ticket IMP-366)

## 0. Context & Architectural Rationale
- **Prior In-Flight Scope (Committed / Verified)**:
  - Ticket `IMP-363`: Board tiles merged batching, collapsing 80 static terrain draw calls to <= 3 (-96.25%) to eliminate WebKit IPC message bottleneck.
  - Ticket `IMP-364`: Static shadow map caching & idle workload thermal hardening, freezing shadow depth passes during idle turns.
  - Ticket `IMP-365`: Mobile water shader LOD & ALU optimization, cutting >80% ALU in 16-bit half-precision.
- **Problem Statement & Empirical Evidence**:
  - In screenshot `media_1791720833992_d8ac2c82.png`, when `Bot AI 4` buys Nghệ An (TP. Vinh, Cell 23) for 2,200 M VND, two conflicting and stacked toasts appear simultaneously:
    1. `🏷️ Bot AI 4 thanh toán -2.200 mua sở hữu Nghệ An (TP. Vinh)`
    2. `🏛️ Bot AI 4 nộp -2.200 vào Kho Bạc` (*Nộp ngân sách nhà nước*)
  - **Physical Root Cause**:
    - `synthesizePropertyAndMarketEvents` in `game_event_property_synthesizer.ts` inspects `delta.cells`, detects `isOwnerTransferred`, and emits `PROPERTY_BOUGHT`.
    - Concurrently, `synthesizeFinancialEvents` in `game_event_financial_synthesizer.ts` observes `payer.diff = -2200`. Because no player received rent and cell 23 is neither cell 4 (Land Tax) nor cell 10 (Bail), `payer.diff` falls through to lines 256–264:
      ```typescript
      for (const payer of payers) {
        if (payer.diff < 0) {
          feeEvents.push({
            type: SynthesizedGameEventType.FEE_PAID, timestamp, payerId: payer.id,
            feeType: payer.cellIndex === 4 ? 'LAND_TAX' : 'TAX', amount: Math.abs(payer.diff),
            ...(payer.cellIndex !== undefined ? { cellIndex: payer.cellIndex } : {}),
          });
        }
      }
      ```
    - The financial synthesizer erroneously classifies every property-related capital expenditure (purchases, building upgrades, auction winning bids, and unmortgage fees) as a generic `TAX` fee remitted to Kho Bạc.
    - This creates duplicate visual badges, cluttering mobile viewports (360px) and misleading users into believing they were debited twice (-4,400 M VND total).
  - **Hardened Architectural Resolution of Adversarial Findings ([ADV-01] to [ADV-06] + Latent Flaws 1-3)**:
    1. **[ADV-01] Pipeline Ordering Correction**: Invoke `adjustNetDeltaForPropertyTransactions` strictly AFTER `reconstructGoSalary` and BEFORE `extractGovernmentAndTelecomFees` / `matchRentTransactions`. Reconstructing inflows first ensures `payers` reflects the player's true gross debt obligation before property capital expenditures are absorbed, permanently blocking phantom Kho Bạc toasts when crossing GO.
    2. **[ADV-02 & LATENT-02] Macroeconomic Upgrade Modifiers & Strong Typing**: Import authoritative `type UpgradeCostModifier` and call `calculateUpgradeCost(cell.index, lvl, activeMods)` across all upgraded tiers with full `affectedCells` support, preventing residual debt leaks under `MC_RATE_HIKE` (+20%), over-crediting under `MC_CREDIT_STIMULUS` (-20%), and honoring `MACRO_LAND_FEVER` (1.5x).
    3. **[ADV-03 & LATENT-01] Bankruptcy Liquidation & Null Owner Trap Guard**: Enforce `prevOwnerId === undefined && Boolean(cell.ownerId)` to guard against JavaScript `null !== undefined` truthy traps on unowned/reset cells and ensure asset transfers from bankrupt debtors to creditors (cost 0 VND) are never misattributed as bank purchases.
    4. **[ADV-04] Infrastructure Upgrades (ETC & Utility)**: Detect Railroad `cell.isETC === true` (`ETC_COST_PER_CELL = 1500`) and Utility `cell.isUpgradedUtility === true` (`UTILITY_UPGRADE_COST = 1000`), absorbing their capital costs from `payers`.
    5. **[LATENT-03] Discounted Upgrade Card CC_LAND_CHANGE Awareness**: When upgrading C0 to C1 via `CC_LAND_CHANGE`, absorb exactly 500 M VND rather than standard listed upgrade cost (which can be up to 2,000 M VND on Cell 39), preventing over-crediting and swallowing concurrent penalties.
    6. **[ADV-05] SSOT Alignment**: Verified Cell 23 (Nghệ An, 2,200 M VND) in `property_data.ts` and `board_config.ts`.
    7. **[ADV-06] Treasury Conservation Invariant**: Eliminating false client-side tax badges preserves Treasury mathematical conservation and eliminates phantom money creation while reliably preserving authentic Treasury remittance fees: Cell 04 Land Tax (`LAND_TAX`), Cell 10 Bail (`BAIL`), Chance/Market administrative penalties, and Pass-GO property taxes (`GO_SALARY` deduction).

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-366`
- **Subsystem**: `client-events` (Tier 1 Domain/FSM/Server/Helpers & Financial Event Synthesis)
- **Direct Scope (Physical Files)**:
  - **Target physical file**: `src/client/events/game_event_financial_helpers.ts` (Refactor)
  - **Target physical file**: `src/client/events/game_event_financial_synthesizer.ts` (Refactor)
  - **Target physical file**: `tests/client/imp366_deduplicate_treasury_toasts.test.ts` (Tệp mới)
- **Referenced Contracts / Stable Boundaries**:
  - `src/client/events/game_event_synthesizer.ts`
  - `src/client/events/game_event_property_synthesizer.ts`
  - `src/client/events/subscribers/badge_event_subscriber.ts`
  - `src/client/ui/transaction_narrative.ts`
  - `tests/client/imp330_game_event_narrative_synthesizer.test.ts`
  - `tests/client/imp331_property_auction_trade_synthesizer.test.ts`
  - `tests/client/imp333_badge_presentation_subscriber.test.ts`

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/events/game_event_financial_helpers.ts` | Tier 1 (Domain/FSM/Server) | 114 | 249 | +135 | <= 400 | Safe (< 300 LOC) |
| `src/client/events/game_event_financial_synthesizer.ts` | Tier 1 (Domain/FSM/Server) | 267 | 269 | +2 | <= 400 | Safe (< 300 LOC) |
| `tests/client/imp366_deduplicate_treasury_toasts.test.ts` | Living Test | 0 | 240 | +240 | <= 600 | 🆕 Tệp mới |

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
- Write living contract test suite in `tests/client/imp366_deduplicate_treasury_toasts.test.ts`:
  - TC-366.01 [UC-DEDUP-BUY/MSS]: Given player balance drops by property price and delta.cells transfers ownership, When synthesizing game events, Then produces PROPERTY_BOUGHT and elides redundant FEE_PAID TAX event.
  - TC-366.02 [UC-DEDUP-UPGRADE/MSS]: Given player balance drops by upgrade cost under Rate Hike modifier, When synthesizing game events, Then produces PROPERTY_UPGRADED and elides redundant FEE_PAID TAX event.
  - TC-366.03 [UC-DEDUP-AUCTION/MSS]: Given winning bidder balance drops by winning bid in concluding auction, When synthesizing game events, Then produces AUCTION_WON and elides duplicate fallback FEE_PAID TAX event.
  - TC-366.04 [UC-DEDUP-UNMORTGAGE/MSS]: Given property owner unmortgages tile with 55% fee, When synthesizing game events, Then produces PROPERTY_UNMORTGAGED and elides duplicate FEE_PAID TAX event.
  - TC-366.05 [UC-DEDUP-INFRASTRUCTURE/MSS]: Given railroad ETC activation or utility upgrade, When synthesizing game events, Then absorbs capital cost and elides fallback FEE_PAID TAX event.
  - TC-366.06 [UC-PASS-GO-COLLISION/MSS]: Given player passes GO (+2000 salary) and purchases property in same tick, When synthesizing game events, Then produces GO_SALARY and PROPERTY_BOUGHT with exactly zero FEE_PAID TAX events.
  - TC-366.07 [UC-BANKRUPTCY-IMMUNITY/MSS]: Given creditor receives property from bankrupt debtor at zero cost, When synthesizing game events, Then does not grant illegitimate fee immunity to creditor.
  - TC-366.08 [UC-PRESERVE-GENUINE-FEES/MSS]: Given player lands on Cell 04 (Land Tax) or pays audit bail at Cell 10, When synthesizing game events, Then reliably preserves FEE_PAID with LAND_TAX and BAIL types.
  - TC-366.09 [UC-HELPER-PARITY/MSS]: Given adjustNetDeltaForPropertyTransactions called directly with purchase and upgrade deltas, When inspecting payers array, Then neutralizes corresponding debt and splices zero-balance payers.
  - TC-366.10 [UC-WIRING-SYNTHESIZER/MSS]: Given synthesizeFinancialEvents invoked with unowned property purchase delta, When verifying consumer integration call-site wiring, Then proves adjustNetDeltaForPropertyTransactions suppresses fallback TAX event at runtime.
  - TC-366.11 [UC-LAND-CHANGE-CARD/MSS]: Given player upgrades C0 to C1 via CC_LAND_CHANGE card, When synthesizing game events, Then absorbs strictly 500 M VND rather than full standard deed cost.
  - TC-366.12 [UC-LAND-FEVER-MODIFIER/MSS]: Given property upgrade during MACRO_LAND_FEVER cycle on affected cell, When synthesizing game events, Then applies 1.5x cost multiplier via UpgradeCostModifier.

### Station 2: Implementation (GREEN)

#### Task 1: Implement `adjustNetDeltaForPropertyTransactions` in `src/client/events/game_event_financial_helpers.ts`
**Target physical file**: `src/client/events/game_event_financial_helpers.ts`
```typescript
<<<<
import { PROPERTY_DEEDS, type PropertyRegistry, type PropertyStateMap } from '../../domain/property_data.js';
====
import {
  PROPERTY_DEEDS,
  type PropertyRegistry,
  type PropertyStateMap,
  ETC_COST_PER_CELL,
  UTILITY_UPGRADE_COST,
} from '../../domain/property_data.js';
import { calculateUpgradeCost, type UpgradeCostModifier } from '../../domain/property_upgrade.js';
import type { DeltaPayload } from '../../server/session_manager.js';
>>>>
```

```typescript
<<<<
  // 2. Buyer paid price: restore outflow towards 0
  const buyerPayIdx = payers.findIndex((p) => p.id === trade.buyerId);
  if (buyerPayIdx !== -1) {
    const newDiff = payers[buyerPayIdx]!.diff + price;
    if (newDiff === 0) {
      payers.splice(buyerPayIdx, 1);
    } else if (newDiff < 0) {
      payers[buyerPayIdx]!.diff = newDiff;
    } else {
      const buyer = payers[buyerPayIdx]!;
      payers.splice(buyerPayIdx, 1);
      receivers.push({ id: buyer.id, diff: newDiff, cellIndex: buyer.cellIndex, prevP: buyer.prevP, hasPassedGo: buyer.hasPassedGo, isSentToAudit: buyer.isSentToAudit });
    }
  }
}
====
  // 2. Buyer paid price: restore outflow towards 0
  const buyerPayIdx = payers.findIndex((p) => p.id === trade.buyerId);
  if (buyerPayIdx !== -1) {
    const newDiff = payers[buyerPayIdx]!.diff + price;
    if (newDiff === 0) {
      payers.splice(buyerPayIdx, 1);
    } else if (newDiff < 0) {
      payers[buyerPayIdx]!.diff = newDiff;
    } else {
      const buyer = payers[buyerPayIdx]!;
      payers.splice(buyerPayIdx, 1);
      receivers.push({ id: buyer.id, diff: newDiff, cellIndex: buyer.cellIndex, prevP: buyer.prevP, hasPassedGo: buyer.hasPassedGo, isSentToAudit: buyer.isSentToAudit });
    }
  }
}

export function adjustNetDeltaForPropertyTransactions(
  delta: DeltaPayload,
  prevState: { readonly playersInfo: Record<string, PlayerHudInfo>; readonly levelMap?: Record<number, number>; readonly propertyStates?: Record<number, { readonly isETC?: boolean; readonly isUpgradedUtility?: boolean }>; readonly activeModifiers?: readonly UpgradeCostModifier[]; readonly auction?: { readonly cellIndex?: number; readonly highestBidderId?: string; readonly currentBid?: number } | null },
  nextState: { readonly playersInfo: Record<string, PlayerHudInfo>; readonly activeModifiers?: readonly UpgradeCostModifier[]; readonly auction?: unknown },
  payers: InternalBalanceDelta[],
): void {
  // 1. Auction settlement deduction
  if (delta.auction && (delta.auction.isConcluded || delta.auction.winnerId !== undefined)) {
    const winnerId = delta.auction.winnerId ?? delta.auction.highestBidderId;
    const winningBid = delta.auction.finalPrice ?? delta.auction.currentBid ?? 0;
    if (winnerId && winningBid > 0) {
      const idx = payers.findIndex((p) => p.id === winnerId);
      if (idx !== -1) {
        payers[idx]!.diff += winningBid;
        if (payers[idx]!.diff >= 0) payers[idx]!.diff = 0;
      }
    }
  } else if (delta.auction === null && prevState.auction?.highestBidderId && nextState.auction === null) {
    const winnerId = prevState.auction.highestBidderId;
    const winningBid = prevState.auction.currentBid ?? 0;
    if (winnerId && winningBid > 0) {
      const idx = payers.findIndex((p) => p.id === winnerId);
      if (idx !== -1) {
        payers[idx]!.diff += winningBid;
        if (payers[idx]!.diff >= 0) payers[idx]!.diff = 0;
      }
    }
  }

  const activeMods = (delta.activeModifiers ?? nextState.activeModifiers ?? prevState.activeModifiers ?? []) as readonly UpgradeCostModifier[];

  // 2. Cell transactions deduction (Purchase, Upgrade, ETC, Utility, Unmortgage)
  for (const cell of delta.cells ?? []) {
    const prevOwnerId = Object.keys(prevState.playersInfo).find((id) =>
      prevState.playersInfo[id]?.ownedProperties?.includes(cell.index),
    );

    // 2a. Direct purchase from bank (prevOwnerId must be undefined and Boolean(cell.ownerId) truthy to prevent null trap & liquidation misattribution)
    const isDirectBankPurchase = prevOwnerId === undefined && Boolean(cell.ownerId);
    const isAuction = Boolean(delta.auction?.cellIndex === cell.index || prevState.auction?.cellIndex === cell.index);
    const isTrade = Boolean(delta.lastTradeResult?.cellIndex === cell.index || delta.lastTradeResult?.offeredCellIndex === cell.index);
    const isBuyoutCard = delta.lastEventCard?.cardId === 'CC_MA_FORCE' || delta.lastEventCard?.cardId === 'CC_SWAP_PROJECT';

    if (isDirectBankPurchase && !isAuction && !isTrade && !isBuyoutCard && cell.ownerId) {
      const price = PROPERTY_DEEDS.get(cell.index)?.price ?? 0;
      if (price > 0) {
        const idx = payers.findIndex((p) => p.id === cell.ownerId);
        if (idx !== -1) {
          payers[idx]!.diff += price;
          if (payers[idx]!.diff >= 0) payers[idx]!.diff = 0;
        }
      }
    }

    // 2b. Building upgrades with macroeconomic policy awareness & CC_LAND_CHANGE card discount handling
    const prevLevel = prevState.levelMap?.[cell.index] ?? 0;
    if (cell.level !== undefined && cell.level > prevLevel) {
      const ownerId = cell.ownerId ?? prevOwnerId ?? '';
      const isLandChangeCard = delta.lastEventCard?.cardId === 'CC_LAND_CHANGE' ||
        (delta.lastEventCard as { readonly id?: string } | undefined)?.id === 'CC_LAND_CHANGE';
      let totalUpgradeCost = 0;
      for (let lvl = prevLevel; lvl < cell.level; lvl++) {
        totalUpgradeCost += (isLandChangeCard && lvl === 0)
          ? 500
          : calculateUpgradeCost(cell.index, lvl, activeMods);
      }
      if (ownerId && totalUpgradeCost > 0) {
        const idx = payers.findIndex((p) => p.id === ownerId);
        if (idx !== -1) {
          payers[idx]!.diff += totalUpgradeCost;
          if (payers[idx]!.diff >= 0) payers[idx]!.diff = 0;
        }
      }
    }

    // 2c. Railroad ETC upgrade
    const wasETC = Boolean(prevState.propertyStates?.[cell.index]?.isETC);
    if (cell.isETC === true && !wasETC) {
      const ownerId = cell.ownerId ?? prevOwnerId ?? '';
      if (ownerId && ETC_COST_PER_CELL > 0) {
        const idx = payers.findIndex((p) => p.id === ownerId);
        if (idx !== -1) {
          payers[idx]!.diff += ETC_COST_PER_CELL;
          if (payers[idx]!.diff >= 0) payers[idx]!.diff = 0;
        }
      }
    }

    // 2d. Utility upgrade (Smart Grid / 5G)
    const wasUpgradedUtil = Boolean(prevState.propertyStates?.[cell.index]?.isUpgradedUtility);
    if (cell.isUpgradedUtility === true && !wasUpgradedUtil) {
      const ownerId = cell.ownerId ?? prevOwnerId ?? '';
      if (ownerId && UTILITY_UPGRADE_COST > 0) {
        const idx = payers.findIndex((p) => p.id === ownerId);
        if (idx !== -1) {
          payers[idx]!.diff += UTILITY_UPGRADE_COST;
          if (payers[idx]!.diff >= 0) payers[idx]!.diff = 0;
        }
      }
    }

    // 2e. Unmortgage fee
    const wasMortgaged = prevOwnerId
      ? (prevState.playersInfo[prevOwnerId]?.mortgagedProperties?.includes(cell.index) ?? false)
      : false;
    if (cell.isMortgaged === false && wasMortgaged) {
      const ownerId = cell.ownerId ?? prevOwnerId ?? '';
      const deed = PROPERTY_DEEDS.get(cell.index);
      const cost = deed ? Math.floor(deed.price * 0.55) : 0;
      if (ownerId && cost > 0) {
        const idx = payers.findIndex((p) => p.id === ownerId);
        if (idx !== -1) {
          payers[idx]!.diff += cost;
          if (payers[idx]!.diff >= 0) payers[idx]!.diff = 0;
        }
      }
    }
  }

  // 3. Clean up neutralized payers
  for (let i = payers.length - 1; i >= 0; i--) {
    if (payers[i]!.diff === 0) {
      payers.splice(i, 1);
    }
  }
}
>>>>
```

#### Task 2: Integrate Property Delta Deduction in `src/client/events/game_event_financial_synthesizer.ts`
**Target physical file**: `src/client/events/game_event_financial_synthesizer.ts`
```typescript
<<<<
import {
  buildRegistryAndStateMap,
  calculateMortgageInterest,
  deductInflowFromDeltas,
  adjustNetDeltaForTrade,
  type InternalBalanceDelta,
} from './game_event_financial_helpers.js';
====
import {
  buildRegistryAndStateMap,
  calculateMortgageInterest,
  deductInflowFromDeltas,
  adjustNetDeltaForTrade,
  adjustNetDeltaForPropertyTransactions,
  type InternalBalanceDelta,
} from './game_event_financial_helpers.js';
>>>>
```

```typescript
<<<<
  const { payers, receivers } = buildInitialBalanceDeltas(delta, prevState, nextState);
  if (delta.lastTradeResult) {
    adjustNetDeltaForTrade(delta.lastTradeResult, payers, receivers);
  }
  const salaryEvents = reconstructGoSalary(delta, prevState, nextState, payers, receivers, timestamp);
  const feeEvents = extractGovernmentAndTelecomFees(payers, receivers, prevState, timestamp);
====
  const { payers, receivers } = buildInitialBalanceDeltas(delta, prevState, nextState);
  if (delta.lastTradeResult) {
    adjustNetDeltaForTrade(delta.lastTradeResult, payers, receivers);
  }
  const salaryEvents = reconstructGoSalary(delta, prevState, nextState, payers, receivers, timestamp);
  adjustNetDeltaForPropertyTransactions(delta, prevState, nextState, payers);
  const feeEvents = extractGovernmentAndTelecomFees(payers, receivers, prevState, timestamp);
>>>>
```

### Station 3: Pre-Filter & Architecture Review
- Run mechanical pre-filter: `npm run prefilter -- src/client/events/game_event_financial_helpers.ts src/client/events/game_event_financial_synthesizer.ts tests/client/imp366_deduplicate_treasury_toasts.test.ts`.
- Verify LOC budgets:
  - `game_event_financial_helpers.ts` <= 400 LOC.
  - `game_event_financial_synthesizer.ts` <= 400 LOC.
  - `tests/client/imp366_deduplicate_treasury_toasts.test.ts` <= 600 LOC.
- Zero dirty casts (`as any`, `as unknown as`).
- Update `docs/FEATURE_MAP.md` row 13/14 for IMP-366.

### Station 4: Evidence & Verification
- Execute regression sweep:
  - `npx vitest run tests/client/imp366_deduplicate_treasury_toasts.test.ts tests/client/imp330_game_event_narrative_synthesizer.test.ts tests/client/imp331_property_auction_trade_synthesizer.test.ts tests/client/imp333_badge_presentation_subscriber.test.ts`.
- Run sentinel and immutable evidence audit:
  - `node scripts/collect_evidence.mjs IMP-366`.
  - `node scripts/check_evidence.mjs IMP-366`.

## 4. Definition of Done (DoD) & Stopping Boundary
- **Hard Stopping Boundary (Anti-Churn Invariant)**:
  1. Station 1 (RED): 12 atomic tests in `tests/client/imp366_deduplicate_treasury_toasts.test.ts` fail strictly due to runtime assertions (Adversarial Inversion).
  2. Station 2 (GREEN): Minimal implementation in `game_event_financial_helpers.ts` and `game_event_financial_synthesizer.ts` turns all 12 contract tests GREEN.
  3. Station 3 (Pre-Filter): `npm run prefilter` passes exit code 0; `check_scope.mjs` reports 0 scope creep.
  4. Station 4 (Evidence): Regression suites pass and `node scripts/check_evidence.mjs IMP-366` passes.
  5. Once all checks pass, execution MUST CEASE immediately. Zero speculative refactoring.
