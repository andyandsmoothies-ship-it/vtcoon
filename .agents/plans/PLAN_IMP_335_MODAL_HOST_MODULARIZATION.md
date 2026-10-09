# Plan IMP-335: Modal Host Modularization & Sub-Host Extraction (Ticket IMP-335)

## 0. Context & Architectural Rationale
- **Prior Tickets**: Candidate 1 completed Presentation Subscribers (IMP-330..IMP-334) and de-escalated all Tier 1 files.
- **Warning Alert**: `modal_host.tsx` is currently standing at **441 LOC** (SLOC 424), approaching Tier 2 ceiling (<= 500 LOC) and triggering `scripts/check_loc.mjs` warning (> 400 LOC).
- **Objective**: Pure-move architectural refactor extracting cohesive sub-hosts into `src/client/ui/modals/hosts/` to de-escalate `modal_host.tsx` from 441 LOC to ~240 LOC, creating a large buffer (> 250 LOC) for future 3D card/chance modals without changing any runtime semantics.
- **Adversarial Gate Resolution**:
  - ADV-01: Update `findVNode` in `imp217`, `imp232`, and `imp232_chaos` living test suites to unwrap functional sub-host components, preventing VNode traversal breakage.
  - ADV-02: Include `onClose` in `AuctionModalHostProps` wired to `dismissAuction` to prevent trapped concluded auction state.
  - ADV-03: Preserve `setCameraFocusCell(null)` cleanup in `PortfolioModalHost` on modal close and deed transitions.
  - ADV-04: Anchor 250ms auction timer in `AuctionModalHost` on modal lifecycle (`useEffect(..., [])`).
  - ADV-05: Preserve exact intent generation and fallback pricing in `buildTradeOfferIntent` and `resolveAvailableTradePartners`.

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-335`
- **Subsystem**: `client-ui` (Tier 2 Client Presentation Modals & Sub-Hosts)
- **Direct Scope (Physical Files)**:
  - `src/client/ui/modals/hosts/portfolio_modal_host.tsx` (Tệp mới)
  - `src/client/ui/modals/hosts/trade_modal_host.tsx` (Tệp mới)
  - `src/client/ui/modals/hosts/auction_modal_host.tsx` (Tệp mới)
  - `src/client/ui/modals/modal_host.tsx` (Refactor)
  - `tests/client/imp335_modal_host_modularization.test.ts` (Tệp mới)
  - `tests/contracts/imp217_corporate_bond_tranches_and_pipeline.test.ts` (Refactor unwrap)
  - `tests/client/imp232_auction_leading_bidder_dismiss_affordance.test.ts` (Refactor unwrap)
  - `tests/probes/imp232_chaos_sentinel_probes.test.ts` (Refactor unwrap)

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/ui/modals/hosts/portfolio_modal_host.tsx` | Tier 2 (UI/3D/Views) | 0 | 21 | +21 | <= 500 | 🆕 Tệp mới (Post-GREEN: ~85 LOC) |
| `src/client/ui/modals/hosts/trade_modal_host.tsx` | Tier 2 (UI/3D/Views) | 0 | 48 | +48 | <= 500 | 🆕 Tệp mới (Post-GREEN: ~120 LOC) |
| `src/client/ui/modals/hosts/auction_modal_host.tsx` | Tier 2 (UI/3D/Views) | 0 | 20 | +20 | <= 500 | 🆕 Tệp mới (Post-GREEN: ~90 LOC) |
| `src/client/ui/modals/modal_host.tsx` | Tier 2 (UI/3D/Views) | 442 | 442 | 0 | <= 500 | ⚠️ Warning (442 > 400, Post-GREEN: ~240 LOC) |
| `tests/client/imp335_modal_host_modularization.test.ts` | Living Test | 0 | 320 | +320 | <= 600 | 🆕 Tệp mới |


## 3. Implementation Steps

### Station 1: Contract Testing (RED)
- Write contract tests in `tests/client/imp335_modal_host_modularization.test.ts`:
  - TC-335.01 [UC-MODAL/MSS]: Given `PortfolioModalHost` mounted with local player info, When rendering portfolio modal, Then displays player net worth and passes property states.
  - TC-335.02 [UC-MODAL/A1]: Given property swap parameters, When calling `buildTradeOfferIntent`, Then constructs `INTENT_TRADE_OFFER` with both `cellIndex` and `offeredCellIndex`.
  - TC-335.03 [UC-MODAL/A2]: Given single property purchase or sale parameters, When calling `buildTradeOfferIntent`, Then constructs `INTENT_TRADE_OFFER` with expected buyer/seller polarity.
  - TC-335.04 [UC-MODAL/A3]: Given lobby players, When calling `resolveAvailableTradePartners`, Then excludes local player and populates bot personalities.
  - TC-335.05 [UC-MODAL/A4]: Given active auction, When `AuctionModalHost` submits bid, Then triggers `AUCTION_BID` audio SFX and dispatches `INTENT_BID`.
  - TC-335.06 [UC-MODAL/A5]: Given active auction, When `AuctionModalHost` submits pass, Then dispatches `INTENT_AUCTION_PASS` and updates `hasPassed`.
  - TC-335.07 [UC-MODAL/A6]: Given `ModalHost` switchboard, When activeModal changes between 'portfolio', 'trade', 'auction', and 'deed', Then delegates to matching sub-host with identical props.
- Verify Semantic Behavioral RED against initial stubs.

### Station 2: Implementation (GREEN)
- **Task 1**: Implement `PortfolioModalHost` in `src/client/ui/modals/hosts/portfolio_modal_host.tsx` extracting portfolio view, Net Worth calculation, and camera cleanup.
- **Task 2**: Implement `TradeModalHost`, `buildTradeOfferIntent`, and `resolveAvailableTradePartners` in `src/client/ui/modals/hosts/trade_modal_host.tsx`.
- **Task 3**: Implement `AuctionModalHost` in `src/client/ui/modals/hosts/auction_modal_host.tsx` extracting auction callbacks, 250ms countdown lifecycle, audio sfx, and `onClose` dismiss seam.
- **Task 4**: Refactor `src/client/ui/modals/modal_host.tsx` to delegate to `PortfolioModalHost`, `TradeModalHost`, and `AuctionModalHost`, de-escalating from 441 to ~240 LOC.
- **Task 5**: Update `findVNode` in `imp217`, `imp232`, and `imp232_chaos` living test suites to unwrap functional sub-host components.
- Verify 100% tests turn GREEN.

### Station 3: Pre-Filter & Mechanical Gates
- Run `npm run prefilter -- src/client/ui/modals/hosts/portfolio_modal_host.tsx src/client/ui/modals/hosts/trade_modal_host.tsx src/client/ui/modals/hosts/auction_modal_host.tsx src/client/ui/modals/modal_host.tsx tests/client/imp335_modal_host_modularization.test.ts`.
- Run `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_335_MODAL_HOST_MODULARIZATION.md --staged`.

### Station 4: Evidence & Sentinel Verification
- Add mutation sensitivity probes in `scripts/station4_sentinel.ts`.
- Run sentinel: `npm run sentinel -- --ticket IMP-335 --test tests/client/imp335_modal_host_modularization.test.ts --src src/client/ui/modals/hosts/trade_modal_host.tsx`.
- Run evidence checker: `node scripts/check_evidence.mjs IMP-335`.
- Generate delivery report: `npm run report -- IMP-335`.
