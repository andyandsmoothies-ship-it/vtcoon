# PLAN_IMP_414: Unified Domain Public Facade & SEAM-01 Deep Import Purge (Nhóm 3 Giai đoạn 3)

## 1. Context & Architectural Goal
- **Source Strategy Reports**: [`ARCHITECTURAL_AUDIT_AND_AI_NATIVE_FACADE_BLUEPRINT.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/analysis/ARCHITECTURAL_AUDIT_AND_AI_NATIVE_FACADE_BLUEPRINT.md) (Mục 5.2 `[DEBT-SEAM-01]` & Giai đoạn 3: Thiết lập Public Facades), and `npm run lint:boundaries` AST diagnostic scan.
- **Classification**: Tier 1.5 Structural Refactor & Import Path Rewiring (0 FSM transitions, 0 economic/cashflow formula changes, 0 DOM layout shifts).
- **Subsystem Boundary Isolation**: Strictly confined to `client-ui` within cohesive family `src/client/ui/modals` across 10 modal files, satisfying `rules_scope.mjs` mechanical gate (0 cross-subsystem contamination, <= 3 cohesive units).
- **Problems**:
  1. **24 Residual `SEAM-01` Boundary Warnings across 10 Modal Files**: Exactly 24 deep relative import warnings (`[SEAM-01: Relative import exceeds depth threshold (>= 3 levels)]`) in `src/client/ui/modals/*` reach into domain leaf files (`theme`, `bond_types`, `macro_cycle_types`, `property_upgrade`, `property_data`, `board_config`, `event_card_types`, `room`, `transit_wheel`, `types`). All 24 originate from 10 modal files: `property_portfolio_modal.tsx` (4), `purchase_decision_card.tsx` (1), `purchase_decision_logic.ts` (2), `title_deed_affordance.ts` (4), `title_deed_modal.tsx` (5), `trade/trade_column.tsx` (1), `trade_intelligence.ts` (1), `transit_wheel_modal.tsx` (1), `modal_helpers.ts` (3), `portfolio_monopoly_analytics.ts` (2).
  2. **Fragile Subsystem Coupling**: Modals directly couple to 10 separate internal domain leaves instead of depending on the centralized domain public facade [`src/domain/index.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/index.ts).
- **Architectural Solution & Seam Discipline**:
  1. **Authoritative Facade Consumption**: Rewire all 24 deep leaf imports across the 10 modal files to import strictly from the centralized facade `../../../domain/index.js` (and `../../../../domain/index.js` for nested `trade_column.tsx`).
  2. **Import Consolidation**: In each modal file, collapse multiple fragmented domain import statements into a single, cohesive facade import.
  3. **Zero Runtime Mutation (Pure-Move Quarantine)**: Preserve 100% runtime calculations, DTO shapes, UI rendering, and user interactions.
  4. **Triệt tiêu 100% Cảnh báo `SEAM-01` trong Phân hệ Modals**: Reduce boundary linter warnings across target modal files from 24 down to exactly 0 (reducing total project-wide warnings by 24, from 80 down to 56).

### Principles Applied
- **Deep Modules & Seam Discipline** -> Replaced fragile 3-to-4-level deep relative leaf imports with authoritative public facade consumption (`domain/index.js`), respecting the Subsystem Facade Invariant.
- **100% DTO & Call-Site Wiring** -> Consolidated fragmented leaf imports into single facade import statements while preserving 100% active consumption at every production call-site.
- **Pure-Move Quarantine** -> Preserves 100% compile-time types, runtime functions, and visual affordance logic with zero semantic shifts.
- **Equivalence-Partition Testing** -> Partitioned contract tests across static AST boundary compliance, linter zero-warning verification, runtime functional identity, and zero cyclic pollution.

---

## 2. Target Files & Honest LOC Accounting

| File Path | Tier | Current LOC | Expected LOC | Net Delta | Max Allowed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/ui/modals/modal_helpers.ts` | Tier 1 (UI Helper) | 372 | 370 | ~-2 | 400 | Warning (Buffer Zone >= 300 LOC) |
| `src/client/ui/modals/portfolio_monopoly_analytics.ts` | Tier 1 (UI Helper) | 223 | 222 | ~-1 | 400 | Safe (Rewired Import) |
| `src/client/ui/modals/property_portfolio_modal.tsx` | Tier 2 (UI Modal) | 398 | 395 | ~-3 | 500 | Safe (Rewired Import) |
| `src/client/ui/modals/purchase_decision_card.tsx` | Tier 2 (UI Modal) | 162 | 162 | ~+0 | 500 | Safe (Rewired Import) |
| `src/client/ui/modals/purchase_decision_logic.ts` | Tier 1 (UI Helper) | 120 | 119 | ~-1 | 400 | Safe (Rewired Import) |
| `src/client/ui/modals/title_deed_affordance.ts` | Tier 1 (UI Helper) | 303 | 300 | ~-3 | 400 | Warning (Buffer Zone >= 300 LOC) |
| `src/client/ui/modals/title_deed_modal.tsx` | Tier 2 (UI Modal) | 392 | 388 | ~-4 | 500 | Safe (Rewired Import) |
| `src/client/ui/modals/trade/trade_column.tsx` | Tier 2 (UI Modal) | 337 | 337 | ~+0 | 500 | Safe (Rewired Import) |
| `src/client/ui/modals/trade_intelligence.ts` | Tier 1 (UI Helper) | 382 | 382 | ~+0 | 400 | Warning (Buffer Zone >= 300 LOC) |
| `src/client/ui/modals/transit_wheel_modal.tsx` | Tier 2 (UI Modal) | 231 | 231 | ~+0 | 500 | Safe (Rewired Import) |
| `tests/client/imp414_domain_facade_and_seam_01_purge.test.ts` | Living Test | 0 | 190 | ~+190 | 600 | Safe (New Living Test) |

---

## 3. Lean Type & Exported Symbol Contracts

**Target physical file**: `src/client/ui/modals/modal_helpers.ts` (Refactored)
```typescript
// Consolidates leaf imports from property_data, board_config, property_upgrade.js into domain/index.js
import { PROPERTY_DEEDS, RAILROAD_FEES, P2P_TAX_RATE, BOARD_CONFIG, ColorGroup, CellType, calculateUpgradeCost, type UpgradeCostModifier } from '../../../domain/index.js';
```

**Target physical file**: `src/client/ui/modals/portfolio_monopoly_analytics.ts` (Refactored)
```typescript
// Consolidates leaf imports from board_config and property_data into domain/index.js
import { BOARD_CONFIG, CellType, PROPERTY_DEEDS } from '../../../domain/index.js';
```

**Target physical file**: `src/client/ui/modals/property_portfolio_modal.tsx` (Refactored)
```typescript
// Consolidates leaf imports from theme, bond_types, macro_cycle_types, property_upgrade.js into domain/index.js
import { COLOR_GROUP_HEX, BondTrancheId, MacroCycleType, type BondContract, type UpgradeCostModifier } from '../../../domain/index.js';
```

**Target physical file**: `src/client/ui/modals/purchase_decision_card.tsx` (Refactored)
```typescript
// Rewires leaf import from property_data to domain/index.js
import { PROPERTY_DEEDS } from '../../../domain/index.js';
```

**Target physical file**: `src/client/ui/modals/purchase_decision_logic.ts` (Refactored)
```typescript
// Consolidates leaf imports from board_config and property_data into domain/index.js
import { BOARD_CONFIG, CellType, type BoardCell, PROPERTY_DEEDS } from '../../../domain/index.js';
```

**Target physical file**: `src/client/ui/modals/title_deed_affordance.ts` (Refactored)
```typescript
// Consolidates leaf imports from property_data.js, board_config.js, types.js, property_upgrade.js into domain/index.js
import { PROPERTY_DEEDS, UTILITY_CELLS, BOARD_CONFIG, CellType, calculateUpgradeCost, type ColorGroup, type Player, type UpgradeCostModifier } from '../../../domain/index.js';
```

**Target physical file**: `src/client/ui/modals/title_deed_modal.tsx` (Refactored)
```typescript
// Consolidates leaf imports from theme, board_config, event_card_types, macro_cycle_types into domain/index.js
import { COLOR_GROUP_HEX, CellType, MarketCardId, ChanceCardId, MacroCycleType, type MarketModifier } from '../../../domain/index.js';
```

**Target physical file**: `src/client/ui/modals/trade/trade_column.tsx` (Refactored)
```typescript
// Rewires leaf import from theme to domain/index.js
import { COLOR_GROUP_HEX } from '../../../../domain/index.js';
```

**Target physical file**: `src/client/ui/modals/trade_intelligence.ts` (Refactored)
```typescript
// Rewires leaf import from property_data to domain/index.js
import { PROPERTY_DEEDS } from '../../../domain/index.js';
```

**Target physical file**: `src/client/ui/modals/transit_wheel_modal.tsx` (Refactored)
```typescript
// Rewires leaf import from transit_wheel to domain/index.js
import { TRANSIT_WHEEL_CONFIGS, TransitWheelOutcome, getWheelTargetDeg } from '../../../domain/index.js';
```

### Call-Site Wiring & Integration Anchors
- **`src/client/ui/modals/modal_helpers.ts`**:
  - Consolidates 3 domain leaf imports into `domain/index.js` (`PROPERTY_DEEDS`, `RAILROAD_FEES`, `P2P_TAX_RATE`, `BOARD_CONFIG`, `ColorGroup`, `CellType`, `calculateUpgradeCost`, `UpgradeCostModifier`).
- **`src/client/ui/modals/portfolio_monopoly_analytics.ts`**:
  - Consolidates 2 domain leaf imports into `domain/index.js` (`BOARD_CONFIG`, `CellType`, `PROPERTY_DEEDS`).
- **`src/client/ui/modals/property_portfolio_modal.tsx`**:
  - Consolidates 4 separate leaf imports into `domain/index.js` (`COLOR_GROUP_HEX`, `BondTrancheId`, `MacroCycleType`, `BondContract`, `UpgradeCostModifier`).
- **`src/client/ui/modals/purchase_decision_card.tsx`**:
  - Rewires `PROPERTY_DEEDS` import from `property_data` to `domain/index.js`.
- **`src/client/ui/modals/purchase_decision_logic.ts`**:
  - Consolidates `BOARD_CONFIG`, `CellType`, `BoardCell`, and `PROPERTY_DEEDS` into `domain/index.js`.
- **`src/client/ui/modals/title_deed_affordance.ts`**:
  - Consolidates 4 domain leaf imports into `domain/index.js` (`PROPERTY_DEEDS`, `UTILITY_CELLS`, `BOARD_CONFIG`, `CellType`, `calculateUpgradeCost`, `ColorGroup`, `Player`, `UpgradeCostModifier`).
- **`src/client/ui/modals/title_deed_modal.tsx`**:
  - Consolidates 4 domain leaf imports into `domain/index.js` (`COLOR_GROUP_HEX`, `CellType`, `MarketCardId`, `ChanceCardId`, `MacroCycleType`, `MarketModifier`).
- **`src/client/ui/modals/trade/trade_column.tsx`**:
  - Rewires `COLOR_GROUP_HEX` import from `theme` to `domain/index.js`.
- **`src/client/ui/modals/trade_intelligence.ts`**:
  - Rewires `PROPERTY_DEEDS` import from `property_data` to `domain/index.js`.
- **`src/client/ui/modals/transit_wheel_modal.tsx`**:
  - Rewires `TRANSIT_WHEEL_CONFIGS`, `TransitWheelOutcome`, and `getWheelTargetDeg` to `domain/index.js`.

---

## 4. Station 1: Core Contract Invariants (`tests/client/imp414_domain_facade_and_seam_01_purge.test.ts`)

- **TC-414.01 [UC-MODAL-DOMAIN-FACADE-WIRING-PARITY/MSS]**: Given the 10 modal files in `src/client/ui/modals/`, When inspected via a pure AST aggregation helper outside `it()` to obey the Assertion Density Iron Law (zero `for/forEach` loops inside test), Then proves 100% of domain-bound import declarations target `domain/index.js` (or `domain/index`), and zero imports reference internal domain leaf modules (`board_config`, `property_data`, `property_upgrade`, `bond_types`, `macro_cycle_types`, `theme`, `transit_wheel`, `types`).
- **TC-414.02 [UC-BOUNDARY-LINTER-SEAM-01-ELIMINATION/MSS]**: Given the boundary linter AST scanner (`scripts/boundary_linter/boundary_rules.mjs`), When executed against the 10 modal files, Then verifies exactly 0 `SEAM-01` deep relative import warnings are emitted across all 10 files, eliminating all 24 baseline warnings.
- **TC-414.03 [UC-RUNTIME-FACADE-FUNCTIONAL-IDENTITY/MSS]**: Given the symbols re-exported from `src/domain/index.ts`, When consumed by modal affordance calculators (`title_deed_affordance.ts`, `purchase_decision_logic.ts`, `trade_intelligence.ts`, `modal_helpers.ts`, `portfolio_monopoly_analytics.ts`), Then proves strict functional identity across property deed lookups, rent/upgrade cost formulas, and monopoly color mappings across $\ge 2$ distinct input cases ($f(x_1) \neq f(x_2)$).
- **TC-414.04 [UC-ZERO-CYCLIC-POLLUTION/MSS]**: Given Tarjan strongly connected components cycle detection, When evaluating the dependency graph across all 10 modal files and `src/domain/index.ts`, Then proves zero new circular dependency cycles are created.

---

## 5. Station 3 & 4 Verification & Evidence Plan
- **Mechanical Gates**:
  1. `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_414_DOMAIN_FACADE_AND_SEAM_01_PURGE.md --auto-sign`
  2. `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_414_DOMAIN_FACADE_AND_SEAM_01_PURGE.md`
  3. `npx --yes tsc --noEmit` (Exit 0)
  4. `npm run lint:boundaries` (Verifies 0 hard boundary violations and 0 SEAM-01 warnings in target modal files)
  5. `npm run prefilter -- src/client/ui/modals/modal_helpers.ts src/client/ui/modals/portfolio_monopoly_analytics.ts src/client/ui/modals/property_portfolio_modal.tsx src/client/ui/modals/purchase_decision_card.tsx src/client/ui/modals/purchase_decision_logic.ts src/client/ui/modals/title_deed_affordance.ts src/client/ui/modals/title_deed_modal.tsx src/client/ui/modals/trade/trade_column.tsx src/client/ui/modals/trade_intelligence.ts src/client/ui/modals/transit_wheel_modal.tsx tests/client/imp414_domain_facade_and_seam_01_purge.test.ts`
  6. **Evidence Snapshot Collection (Tier 1.5 Structural Refactor)**:
     `node scripts/collect_evidence.mjs imp-414 tests/client/imp414_domain_facade_and_seam_01_purge.test.ts && npm run report -- imp-414 && node scripts/check_evidence.mjs imp-414`
  7. **Regression verification (100% Living Test Parity across 135 tests)**:
     `npx --yes vitest run tests/client/imp414_domain_facade_and_seam_01_purge.test.ts tests/client/imp161_modal_360px_ergonomics_and_cross_browser.test.ts tests/client/property_purchase_decision.test.ts tests/contracts/imp276a_title_deed_affordance.test.ts tests/contracts/imp240_title_deed_affordance_and_special_properties.test.ts tests/client/imp154_trade_bot_intelligence_and_sentiment.test.ts tests/contracts/imp248_transit_wheel_navigator.test.ts tests/client/imp136_portfolio_monopoly_insights.test.ts tests/client/imp188_portfolio_region_sorting.test.ts`

---

## 6. Definition of Done (DoD)
- [ ] All 24 deep relative leaf imports in `src/client/ui/modals/*` rewired to `domain/index.js`.
- [ ] `src/client/ui/modals/modal_helpers.ts` imports domain symbols from `domain/index.js`.
- [ ] `src/client/ui/modals/portfolio_monopoly_analytics.ts` imports domain symbols from `domain/index.js`.
- [ ] `src/client/ui/modals/property_portfolio_modal.tsx` imports domain symbols from `domain/index.js`.
- [ ] `src/client/ui/modals/purchase_decision_card.tsx` imports domain symbols from `domain/index.js`.
- [ ] `src/client/ui/modals/purchase_decision_logic.ts` imports domain symbols from `domain/index.js`.
- [ ] `src/client/ui/modals/title_deed_affordance.ts` imports domain symbols from `domain/index.js`.
- [ ] `src/client/ui/modals/title_deed_modal.tsx` imports domain symbols from `domain/index.js`.
- [ ] `src/client/ui/modals/trade/trade_column.tsx` imports domain symbols from `domain/index.js`.
- [ ] `src/client/ui/modals/trade_intelligence.ts` imports domain symbols from `domain/index.js`.
- [ ] `src/client/ui/modals/transit_wheel_modal.tsx` imports domain symbols from `domain/index.js`.
- [ ] `npm run lint:boundaries` confirms 0 SEAM-01 warnings in target modal files and 0 hard boundary violations.
- [ ] Living test suite `tests/client/imp414_domain_facade_and_seam_01_purge.test.ts` passes 100% across 4 atomic tests with zero loops inside `it()`.
- [ ] 100% living regression test suites across 8 modal test suites (135 tests) pass cleanly.
- [ ] `check_evidence.mjs imp-414` exits `0`.
