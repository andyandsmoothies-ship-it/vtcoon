# Plan IMP-334: LOC De-escalation & Helper Extraction (Ticket IMP-334)

## 0. Context & Architectural Rationale
- **Prior Tickets**: Candidate 1 completed Slices 1..3B (IMP-330, IMP-331, IMP-332, IMP-333).
- **Knife-Edge Alert**: Both `badge_event_subscriber.ts` and `game_event_financial_synthesizer.ts` are currently standing at **399 / 400 LOC**, exactly 1 line away from triggering mechanical gate failure (`npm run check:loc` -> EXIT 1).
- **Objective**: Pure-move refactor extracting cohesive sub-domain helper modules to de-escalate both files from 399 LOC to ~270 LOC each, creating a generous safety buffer (> 100 LOC) without altering any runtime semantics.

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-334`
- **Subsystem**: `client-events` (Tier 1 Client Presentation Event Subscribers & Financial Synthesizer)
- **Direct Scope (Physical Files)**:
  - `src/client/events/subscribers/property_market_badge_handler.ts` (Tệp mới)
  - `src/client/events/subscribers/badge_event_subscriber.ts` (Refactor)
  - `src/client/events/game_event_financial_helpers.ts` (Tệp mới)
  - `src/client/events/game_event_financial_synthesizer.ts` (Refactor)
  - `tests/client/imp334_loc_deescalation_and_regression.test.ts` (Tệp mới)
- **Referenced Contracts / Stable Boundaries**:
  - `src/client/events/game_event_types.ts`
  - `src/client/events/game_event_bus.ts`
  - `src/client/events/pacing_context.ts`
  - `src/client/store/game_store.ts`
  - `src/client/store/vfx_store.ts`

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/events/subscribers/property_market_badge_handler.ts` | Tier 1 (Domain/Logic) | 0 | 153 | +153 | <= 400 | 🆕 Tệp mới |
| `src/client/events/subscribers/badge_event_subscriber.ts` | Tier 1 (Domain/Logic) | 399 | 260 | -139 | <= 400 | ✔️ Safe (< 300) |
| `src/client/events/game_event_financial_helpers.ts` | Tier 1 (Domain/Logic) | 0 | 114 | +114 | <= 400 | 🆕 Tệp mới |
| `src/client/events/game_event_financial_synthesizer.ts` | Tier 1 (Domain/Logic) | 399 | 267 | -132 | <= 400 | ✔️ Safe (< 300) |
| `tests/client/imp334_loc_deescalation_and_regression.test.ts` | Living Test | 0 | 355 | +355 | <= 600 | 🆕 Tệp mới |

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
- Write contract tests in `tests/client/imp334_loc_deescalation_and_regression.test.ts`:
  - TC-334.01 [UC-DEESC/MSS]: Given property and market events (PROPERTY_BOUGHT, UPGRADED, MORTGAGED, UNMORTGAGED, TRADE_COMPLETED, AUCTION_WON), When dispatched via property_market_badge_handler, Then emits identical floating badges with proper lean ergonomics (`formula: undefined`).
  - TC-334.02 [UC-DEESC/A1]: Given financial delta inputs with passed GO and mortgage loans, When processed via game_event_financial_helpers, Then produces identical mortgage interest deductions and registry state maps.
  - TC-334.03 [UC-DEESC/A2]: Given full game event batches dispatched to badge_event_subscriber, When processed, Then coordinates financial, property, and market badges seamlessly with zero dropouts.
  - TC-334.04 [UC-REGRESS/A3]: Given full test suite execution, When regression suite runs across imp330, imp331, imp332, imp333, Then all assertions pass with 100% green status.
- Verify Semantic Behavioral RED against initial stubs.

### Station 2: Implementation (GREEN)
- **Task 1**: Extract `handlePropertyBadges` and `handleMarketBadges` into `src/client/events/subscribers/property_market_badge_handler.ts`.
- **Task 2**: Wire `badge_event_subscriber.ts` to delegate to `property_market_badge_handler.ts`, reducing file to ~275 LOC.
- **Task 3**: Extract `buildRegistryAndStateMap`, `calculateMortgageInterest`, `deductInflowFromDeltas`, `adjustNetDeltaForTrade` into `src/client/events/game_event_financial_helpers.ts`.
- **Task 4**: Wire `game_event_financial_synthesizer.ts` to import helpers, reducing file to ~275 LOC.
- Verify 100% tests turn GREEN.

### Station 3: Pre-Filter & Mechanical Gates
- Run `npm run prefilter -- src/client/events/subscribers/property_market_badge_handler.ts src/client/events/subscribers/badge_event_subscriber.ts src/client/events/game_event_financial_helpers.ts src/client/events/game_event_financial_synthesizer.ts tests/client/imp334_loc_deescalation_and_regression.test.ts`.
- Run `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_334_LOC_DE_ESCALATION_HELPER_EXTRACTION.md --staged`.

### Station 4: Evidence & Sentinel Verification
- Add mutation sensitivity probes for `property_market_badge_handler.ts` and `game_event_financial_helpers.ts` in `scripts/station4_sentinel.ts`.
- Run sentinel: `npm run sentinel -- --ticket IMP-334 --test tests/client/imp334_loc_deescalation_and_regression.test.ts --src src/client/events/subscribers/property_market_badge_handler.ts`.
- Run evidence checker: `node scripts/check_evidence.mjs IMP-334`.
- Generate delivery report: `npm run report -- IMP-334`.
