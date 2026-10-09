# Plan IMP-331: Property, Auction & Trade Event Synthesizer (Candidate 1 - Slice 2)

## 0. Auto-Slicing Protocol Roadmap (Candidate 1: Event Narrative Architecture)
- **Slice 1 (`IMP-330`)**: Pure `GameEventNarrativeSynthesizer` interface, typed event taxonomy, subtractive net-delta balance reconstruction, and rent/salary synthesis. (COMPLETED)
- **Slice 2 (`IMP-331`)**: Pure `GameEventPropertySynthesizer` for property acquisition, upgrades, mortgages, P2P trades, and auctions, with financial deduplication and unified façade composition.
- **Slice 3 (`IMP-332`)**: Presentation subscriber decoupling (Audio/3D/UI event bus) & `apply_delta` transport purification.

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-331`
- **Subsystem**: `client-events` (Tier 1 Client Pure Domain & Event Calculation)
- **Problem Statement**:
  1. **Seam Leakage in Property & Auction Trackers**: `activity_property_tracker.ts` (322 LOC) and `activity_auction_tracker.ts` (103 LOC) mutate store state directly, access global stores, and mix UI string formatting with domain event detection.
  2. **Subtractive Bleed (ADV-02)**: Property purchases (-price) occurring in the same tick risk bleeding into rent matching if financial context is not isolated.
  3. **Superposition Collision on Concluded Auction (ADV-03)**: Emitting both `PROPERTY_BOUGHT` (retail price) and `AUCTION_WON` (winning bid) for the same cell unless auction suppression is wired.
  4. **Buyout & Ghost Mortgage Suppression (ADV-04, ADV-05)**: M&A card buyouts must be suppressed from regular buys; foreclosure bank seizures must suppress ghost unmortgages.
  5. **Dual-Cell Trade Swap Order Dependency (ADV-06)**: Cell swaps must emit a single cohesive `TRADE_COMPLETED` event covering both cells.
  6. **Façade Modularization (ADV-08)**: Modularize financial synthesis into `game_event_financial_synthesizer.ts` and compose in `game_event_synthesizer.ts` to strictly maintain <= 400 LOC across all Tier 1 files.
- **Architectural Solution**:
  1. **Pure Deep Module**: Create `src/client/events/game_event_property_synthesizer.ts`.
  2. **Financial Extraction**: Extract financial helpers into `src/client/events/game_event_financial_synthesizer.ts`.
  3. **Unified Composition**: Compose financial and property synthesizers in `src/client/events/game_event_synthesizer.ts`.
- **Direct Scope**:
  - `src/client/events/game_event_types.ts` (Physical lines: 152)
  - `src/client/events/game_event_property_synthesizer.ts` (Physical lines: 14)
  - `src/client/events/game_event_financial_synthesizer.ts` (New file)
  - `src/client/events/game_event_synthesizer.ts` (Physical lines: 404)
  - `src/client/network/activity_property_tracker.ts` (Physical lines: 322)
  - `tests/client/imp331_property_auction_trade_synthesizer.test.ts` (New)
- **Baseline Working Tree Dependencies**:
  - `src/domain/property_upgrade.ts`
  - `src/domain/property_data.ts`
  - `src/domain/board_config.ts`

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/events/game_event_types.ts` | Tier 1 (Domain/Types) | 152 | 152 | 0 | <= 400 | ✔️ Safe |
| `src/client/events/game_event_property_synthesizer.ts` | Tier 1 (Domain/Logic) | 14 | 14 | 0 | <= 400 | ✔️ Safe |
| `src/client/events/game_event_financial_synthesizer.ts` | Tier 1 (Domain/Logic) | 14 | 14 | 0 | <= 400 | ✔️ Safe |
| `src/client/events/game_event_synthesizer.ts` | Tier 1 (Domain/Logic) | 404 | 404 | 0 | <= 400 | ⚠️ Warning (DEBT-IMP331-02) |
| `src/client/network/activity_property_tracker.ts` | Tier 1 (Domain/Logic) | 322 | 322 | 0 | <= 400 | ⚠️ Warning (DEBT-IMP331-01) |
| `tests/client/imp331_property_auction_trade_synthesizer.test.ts` | Living Test | 0 | 480 | +480 | <= 600 | ✔️ Safe |

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
**Target physical file**: `tests/client/imp331_property_auction_trade_synthesizer.test.ts` (Tệp mới)

Test Specifications:
- TC-331.01 [UC-PROP/MSS]: Given unowned property in delta.cells, When synthesizePropertyAndMarketEvents is called, Then returns typed PROPERTY_BOUGHT event with cellIndex, buyerId, and deed price.
- TC-331.02 [UC-PROP/A1]: Given property level increase from 0 to 1/2/3 in delta.cells, When synthesizePropertyAndMarketEvents is called, Then returns PROPERTY_UPGRADED with targetLevel and cost.
- TC-331.03 [UC-PROP/A2]: Given property isMortgaged changing to true, When synthesizePropertyAndMarketEvents is called, Then returns PROPERTY_MORTGAGED with loan amount.
- TC-331.04 [UC-PROP/A3]: Given property isMortgaged changing to false without owner change, When synthesizePropertyAndMarketEvents is called, Then returns PROPERTY_UNMORTGAGED with redeem cost.
- TC-331.05 [UC-PROP/A4]: Given property isMortgaged changing to false alongside ownership change, When synthesizePropertyAndMarketEvents is called, Then suppresses ghost unmortgage event.
- TC-331.06 [UC-TRADE/MSS]: Given delta.lastTradeResult with cash property transfer, When synthesizePropertyAndMarketEvents is called, Then returns TRADE_COMPLETED with sellerId, buyerId, cellIndex, price, and taxAmount.
- TC-331.07 [UC-TRADE/A1]: Given delta.lastTradeResult with property swap, When synthesizePropertyAndMarketEvents is called, Then returns single cohesive TRADE_COMPLETED with cellIndex and offeredCellIndex.
- TC-331.08 [UC-AUCT/MSS]: Given concluded auction hammer fell in delta, When synthesizePropertyAndMarketEvents is called, Then returns AUCTION_WON with winnerId and winningBid.
- TC-331.09 [UC-AUCT/A1]: Given active auction with new highest bid, When synthesizePropertyAndMarketEvents is called, Then returns AUCTION_BID_PLACED with bidderId and currentBid.
- TC-331.10 [UC-AUCT/A2]: Given unchanged auction state in delta, When synthesizePropertyAndMarketEvents is called, Then deduplicates without emitting redundant bid events.
- TC-331.11 [UC-TRIAD/A3]: Given trade cash inflow (+4750) while paying rent (-500), When synthesizeGameEvents is called, Then emits both TRADE_COMPLETED and RENT_PAID without bleed.
- TC-331.12 [UC-TRIAD/A4]: Given auction win (-3000) while receiving GO salary (+2000), When synthesizeGameEvents is called, Then emits both GO_SALARY and AUCTION_WON without collision.
- TC-331.13 [UC-TRIAD/A5]: Given property buy (-2000) while receiving GO salary (+2000), When synthesizeGameEvents is called, Then emits both GO_SALARY and PROPERTY_BOUGHT without drop.
- TC-331.14 [UC-COMP/A6]: Given complex tick with salary and property purchase, When synthesizeGameEvents is called, Then causal ordering guarantees financial events precede property events.

### Station 2: Implementation (GREEN)
#### Task 1: Scaffolding and Façade Extraction
- Extract financial synthesis to `src/client/events/game_event_financial_synthesizer.ts`.
- Refactor `src/client/events/game_event_synthesizer.ts` into a lightweight composite façade.

#### Task 2: Implement Pure Synthesizer in `game_event_property_synthesizer.ts`
- Implement `synthesizePropertyAndMarketEvents(prevState, nextState, delta, options)`:
  1. Detect direct buys, auction wins, and P2P trades with disambiguation and buyout suppression.
  2. Detect property upgrades with monotonic level check and modifier costs.
  3. Detect mortgages and unmortgages with ghost unmortgage suppression on owner change.
  4. Detect active auction bids and concluded auction hammer events.
  5. Causal ordering with deterministic timestamp fallback: `options?.baseTimestamp ?? delta.tick ?? 0`.

#### Task 3: Wire Transitional Consumer in `activity_property_tracker.ts`
- Re-export `synthesizePropertyAndMarketEvents` to guarantee non-orphan production status under Anti-TIDD.

### Station 3: Pre-Filter & Architecture Review
- Run `npm run prefilter -- src/client/events/game_event_types.ts src/client/events/game_event_property_synthesizer.ts src/client/events/game_event_financial_synthesizer.ts src/client/events/game_event_synthesizer.ts src/client/network/activity_property_tracker.ts tests/client/imp331_property_auction_trade_synthesizer.test.ts`.
- Run `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_331_PROPERTY_AUCTION_TRADE_SYNTHESIZER.md`.

### Station 4: Evidence & Verification
- Execute test suite: `npx vitest run tests/client/imp331_property_auction_trade_synthesizer.test.ts`.
- Run sentinel probe verification: `npm run sentinel -- --ticket IMP-331 --test tests/client/imp331_property_auction_trade_synthesizer.test.ts --src src/client/events/game_event_property_synthesizer.ts`.
- Verify evidence: `node scripts/check_evidence.mjs IMP-331`.
- Synthesize delivery report: `npm run report -- IMP-331`.
