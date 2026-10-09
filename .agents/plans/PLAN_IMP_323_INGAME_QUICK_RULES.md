# Plan IMP-323: In-Game Quick Rules on TopBar & Enriched Content

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-323`
- **Subsystem**: `client-ui` (Tier 2 Client UI & Modal System)
- **Problem Statement**:
  1. **In-Game Rules Inaccessibility**: During a match, players (especially newcomers) cannot easily access the game rules modal from the main HUD without exiting to lobby, leaving them confused by sudden events such as debt recovery, mortgage interest deductions, treasury stimulus, or monopoly multipliers.
  2. **Mechanics Disclosure Gaps**: The existing rules modal lacks concise, explicit explanations for the 4 core mechanics that commonly puzzle players: debt clearance via building downgrades (50% refund), passing GO deductions (5%/10% mortgage interest & taxes), treasury stimulus disbursals (>= 10,000 Tr. -> 20% to poorest), and monopoly rent multipliers (1.5x / 2x).
- **Architectural Solution**:
  1. In `src/client/ui/top_bar.tsx`, add an accessible `quick-rules-topbar-btn` button (📖 Luật Chơi) styled consistently with TopBar tactile pill buttons, invoking `useGameStore.getState().openModal('rules', { initialTab: 'mechanics' })`.
  2. In `src/client/ui/modals/game_rules_modal.tsx`, enrich the `'mechanics'` and `'core'` sections with explicit breakdowns of building downgrades for debt recovery, mortgage interest rates upon passing GO, automatic treasury stimulus thresholds, and monopoly multipliers.
- **Direct Scope**:
  - `src/client/ui/top_bar.tsx`
  - `src/client/ui/modals/game_rules_modal.tsx`
  - `tests/client/imp323_ingame_quick_rules.test.ts` (New)
- **Baseline Working Tree Dependencies**:
  - `src/client/store/game_store.ts`
  - `src/client/ui/modals/modal_host.tsx`
  - `src/client/network/activity_badge_dispatcher.ts`
  - `src/client/network/activity_go_extractor.ts`
  - `src/client/network/activity_rent_matcher.ts`
  - `src/client/network/apply_delta.ts`
  - `src/client/store/game_store_subtypes.ts`
  - `src/client/ui/floating_numbers.tsx`
  - `src/client/ui/transaction_formula.ts`
  - `src/server/insolvency_manager.ts`
  - `src/server/room_manager.ts`
  - `src/server/room_property_coordinator.ts`
  - `tests/server/imp318_off_turn_debtor_downgrade.test.ts`
  - `tests/client/imp319_causal_notification_clarity.test.ts`
  - `tests/server/imp320_fsm_restoration_and_deep_coordinator.test.ts`
  - `tests/client/imp321_mortgage_interest_go_disclosure.test.ts`
  - `tests/client/imp322_global_event_banner.test.ts`
  - `src/domain/mortgage_constants.ts`
  - `src/domain/property_upgrade.ts`
  - `src/domain/treasury_stimulus.ts`
  - `src/server/mortgage_manager.ts`

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/ui/top_bar.tsx` | Tier 2 (UI/3D/Views) | 259 | 272 | +13 | <= 500 | ✔️ Safe |
| `src/client/ui/modals/game_rules_modal.tsx` | Tier 2 (UI/3D/Views) | 335 | 335 | +0 | <= 500 | ✔️ Safe |
| `tests/client/imp323_ingame_quick_rules.test.ts` | Living Test | 0 | 146 | +146 | <= 600 | ✔️ Safe |

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
**Target physical file**: `tests/client/imp323_ingame_quick_rules.test.ts` (Tệp mới)

Test Specifications:
- TC-323.01 [UC-QRULES/MSS]: Given TopBar rendered on screen, When player clicks quick-rules-topbar-btn, Then calls openModal with 'rules' and initialTab 'mechanics'.
- TC-323.02 [UC-QRULES/MSS]: Given TopBar rendered on mobile viewport, When rendered, Then quick-rules-topbar-btn preserves touch target size min-w-[36px] min-h-[36px].
- TC-323.03 [UC-QRULES/MSS]: Given GameRulesModal opened with mechanics tab, When rendered, Then displays insolvency section detailing building downgrades and 50% refund.
- TC-323.04 [UC-QRULES/MSS]: Given GameRulesModal opened with mechanics tab, When rendered, Then displays passing GO deductions covering 5% and 10% mortgage interest and treasury taxes.
- TC-323.05 [UC-QRULES/MSS]: Given GameRulesModal opened with mechanics tab, When rendered, Then displays treasury stimulus explaining the >= 10,000 Tr. threshold and 20% aid to poorest player.
- TC-323.06 [UC-QRULES/A1]: Given GameRulesModal close button clicked, When dismissed, Then invokes onClose callback without residual state.

### Station 2: Implementation (GREEN)

#### Task 2.1: Add Quick Rules Button in `top_bar.tsx`
**Target physical file**: `src/client/ui/top_bar.tsx`
- Layout & Location: Insert Quick Rules button immediately preceding the activity feed toggle button within the top bar right-side action cluster.
- Touch Ergonomics: Maintain minimum touch target `min-w-[36px] min-h-[36px]` with relative pseudo-element `after:absolute after:-inset-1.5`.
- Affordance & Event Handler: On click, invoke `useGameStore.getState().openModal('rules', { initialTab: 'mechanics' })`.
- Test ID & Accessibility: Expose `data-testid="quick-rules-topbar-btn"`, `aria-label="Xem Luật Chơi & Cơ Chế Game"`, and title tooltip.

#### Task 2.2: Enrich Mechanics Breakdown in `game_rules_modal.tsx`
**Target physical file**: `src/client/ui/modals/game_rules_modal.tsx`
- Section 1 (Mortgage & GO Deductions): Detail 5% standard interest, 10% under Rate Hike (`MC_RATE_HIKE`), 0% exemption under Credit Stimulus (`MC_CREDIT_STIMULUS`), and progressive property tax cap.
- Section 2 (Insolvency & Debt Recovery): Detail building downgrades yielding 50% upgrade cost refund, 1-click auto-solvency ordering, and final bankruptcy boundary.
- Section 3 (Treasury Stimulus): Reiterate >= 10,000 Tr. treasury threshold and 20% emergency disbursal to lowest balance player.
- Layout & Typography: Retain responsive padding, two-tone alert boxes, and semantic `<strong>` highlighting.

### Station 3: Verification & Mechanical Gates
- Fast Pre-Filter: `npm run prefilter -- src/client/ui/top_bar.tsx src/client/ui/modals/game_rules_modal.tsx tests/client/imp323_ingame_quick_rules.test.ts`
- Live Sentinel & Mutation Gate: `npm run sentinel -- --ticket IMP-323 --test tests/client/imp323_ingame_quick_rules.test.ts`
- Scope Auditor: `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_323_INGAME_QUICK_RULES.md`
- Comprehensive Evidence Audit: `node scripts/check_evidence.mjs IMP-323`
