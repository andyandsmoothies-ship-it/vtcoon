# PLAN_IMP_411: Market Event Ticker Seam & Client Store Public Facade (Nhóm 2 Slice 2C)

## 1. Context & Architectural Goal
- **Source Strategy Reports**: [`ARCHITECTURAL_AUDIT_AND_AI_NATIVE_FACADE_BLUEPRINT.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/analysis/ARCHITECTURAL_AUDIT_AND_AI_NATIVE_FACADE_BLUEPRINT.md) (Giai đoạn 2: Cắt đứt chu trình vòng & Mục 6.3: Thiết lập Facade `@store`) & [`CODEBASE_REORGANIZATION_ROADMAP_REPORT.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/analysis/CODEBASE_REORGANIZATION_ROADMAP_REPORT.md).
- **Subsystem Boundary Isolation**: Slices Group 2 into cohesive `client-ui` and `client-state` boundaries, targeting files within `src/client/ui/` and `src/client/store/` across 3 cohesive families (`market`, `modals/event`, `store/index`), strictly satisfying `rules_scope.mjs` mechanical gate (0 cross-subsystem contamination, <= 3 cohesive units).
- **Problems**:
  1. **Circular Dependency Cycle `[SCC-6]`** (formerly cataloged as `[SCC-8]` prior to IMP-410 cycle removals): [`src/client/ui/market_event_ticker.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/market_event_ticker.tsx) $\leftrightarrow$ [`src/client/ui/modals/event_card_visuals.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/event_card_visuals.ts). `market_event_ticker.tsx` imports `getCardHeroStat` and `getHeroStatStyles` from `event_card_visuals.ts`, while `event_card_visuals.ts` imports `resolveMarketTitle` and `resolveMarketEffectSummary` from `market_event_ticker.tsx`. Embedding pure formatting and data tables in a React JSX component forces bidirectional coupling.
  2. **Missing Client Store Public Facade & Anti-TIDD Call-Site Gap**: The `src/client/store/` subsystem has 11 loose files with 41+ raw external call-sites directly reaching into internal leaf files (`game_store.ts`, `lobby_store.ts`, `environment_store.ts`, `vfx_store.ts`), violating the GEMINI.md Subsystem Facade Invariant. Furthermore, creating a facade without an immediate production consumer violates the Anti-TIDD iron law.
- **Architectural Solution & Seam Discipline**:
  1. **Tách Pure Seam `market_event_helpers.ts`**: Extract `ALL_MARKET_TITLES`, `resolveMarketTitle`, `resolveMarketShortTag`, `ACTIVE_MARKET_EFFECT_SUMMARIES`, `resolveMarketEffectSummary`, `ACTIVE_MARKET_COMPACT_FORMULAS`, `resolveMarketCompactFormula`, and `resolveMarketIcon` from `market_event_ticker.tsx` into a pure, testable helper [`src/client/ui/market_event_helpers.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/market_event_helpers.ts) (0 React, 0 JSX).
  2. **Triệt tiêu chu trình 2 chiều**: `event_card_visuals.ts` imports `resolveMarketTitle` and `resolveMarketEffectSummary` directly from `market_event_helpers.js`. `market_event_ticker.tsx` retains 100% backward-compatible re-exports for existing living tests (`imp135`, `imp141`, `imp276`, `imp276b`, `visual_metadata_parity`).
  3. **Thiết lập Public Facade `src/client/store/index.ts` & Call-Site Wiring Tức Thì**: Authoritative entrypoint re-exporting standardized store hooks (`useGameStore`, `useLobbyStore`, `useEnvironmentStore`, `useVfxStore`, `useActivityStore`, `useAudioStore`), key constants, and disk-verified state contracts (`LobbyState`, `EnvironmentState`, `TimeOfDayPhase`, `ActivityLogEntry`, `VfxState`). In the same turn, wire `market_event_ticker.tsx` to consume `useGameStore` from `../store/index.js`, becoming the 1st production consumer to satisfy 100% Anti-TIDD wiring parity.
  4. **Subsystem Facade Confinement Invariant (Mechanically Tested in TC-411.03)**: `src/client/store/index.ts` is strictly a public facade for presentation consumers. Internal modules residing inside `[SCC-1]` (`src/client/events/**`) and `[SCC-2]` (`src/client/network/**`) are mechanically verified to NOT import from `store/index`, preventing catastrophic super-cycle coalescence.

### Principles Applied
- **Subsystem Facade Invariant** -> Established `src/client/store/index.ts` as the single public gateway for state consumers.
- **100% DTO & Call-Site Wiring** -> Immediately wired `market_event_ticker.tsx` to consume `../store/index.js` (eliminating dead export / Anti-TIDD hazard).
- **View-Model Seam Extraction** -> Extracted pure string formatters and dictionary mappings from JSX presentation into `market_event_helpers.ts`.
- **Deep Modules & Seam Discipline** -> Dissolved circular dependency cycle `[SCC-6]` without breaking existing caller contracts.
- **Equivalence-Partition Testing** -> Partitioned test cases across macro cycles, market cards, chance cards, compact formulas, unknown fallbacks, AST facade confinement, and store referential integrity.
- **Pure-Move Quarantine** -> Preserved 100% runtime strings, compact formulas, and timing constants.

---

## 2. Target Files & Honest LOC Accounting

| File Path | Tier | Current LOC | Expected LOC | Net Delta | Max Allowed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/ui/market_event_helpers.ts` | Tier 2 (UI Seam) | 0 | 95 | ~+95 | 500 | Safe (New Seam) |
| `src/client/ui/market_event_ticker.tsx` | Tier 2 (UI JSX) | 263 | 195 | ~-68 | 500 | Safe (Refactored) |
| `src/client/ui/modals/event_card_visuals.ts` | Tier 2 (UI Seam) | 328 | 328 | ~+0 | 500 | Safe (Refactored) |
| `src/client/store/index.ts` | Subsystem Facade | 0 | 75 | ~+75 | 400 | Safe (New Facade) |
| `tests/client/imp411_market_ticker_seam_and_store_facade.test.ts` | Living Test | 0 | 210 | ~+210 | 600 | Safe (New) |

---

## 3. Lean Type & Exported Symbol Contracts

**Target physical file**: `src/client/ui/market_event_helpers.ts` (New Pure Seam)
```typescript
export const ALL_MARKET_TITLES: Readonly<Record<string, string>>;
export const ACTIVE_MARKET_EFFECT_SUMMARIES: Readonly<Record<string, string>>;
export const ACTIVE_MARKET_COMPACT_FORMULAS: Readonly<Record<string, string>>;

export function resolveMarketIcon(type: string): string;
export function resolveMarketTitle(type: string): string;
export function resolveMarketShortTag(type: string): string;
export function resolveMarketEffectSummary(type: string): string;
export function resolveMarketCompactFormula(type: string): string;
```

**Target physical file**: `src/client/store/index.ts` (New Subsystem Facade)
```typescript
// Game Store & Core Timing Constants
export {
  useGameStore,
  FLOATING_TEXT_DURATION_MS,
  EVENT_BANNER_DURATION_MS,
  TRANSACTION_POPUP_DURATION_MS,
  MAX_FLOATING_TEXTS,
} from './game_store.js';

export * from './game_store_types.js';

// Lobby Store & Contracts
export { useLobbyStore } from './lobby_store.js';
export {
  type LobbyState,
  type LobbySlot,
  type LobbyReasonCode,
  MAX_LOBBY_SLOTS,
  ROOM_CODE_REGEX,
  BotPersonality,
} from './lobby_types.js';

// Environment Store & Contracts
export {
  useEnvironmentStore,
  type EnvironmentState,
  type TimeOfDayPhase,
  type TimeOfDayMode,
  type LightingPreset,
  TIME_OF_DAY_PRESETS,
  AUTO_CYCLE_DURATION_SECONDS,
  calculatePhaseFromProgress,
  calculateAviationStrobe,
  calculateLaserRotation,
  getNextTimeOfDayMode,
} from './environment_store.js';

// VFX Store & Contracts
export {
  useVfxStore,
  type VfxState,
  type ActiveSlam,
  type PawnReactionState,
  SLAM_DEFAULT_DURATION_MS,
  SLAM_IMPACT_DELAY_MS,
} from './vfx_store.js';

// Activity Store & Contracts
export {
  useActivityStore,
  type ActivityStoreState,
  type ActivityLogEntry,
  type ActivityLogType,
  type ActivityFilterType,
  MAX_ACTIVITY_LOGS,
} from './activity_store.js';

// Audio Store & Contracts
export {
  useAudioStore,
  type AudioState,
} from './audio_store.js';
```

### Call-Site Wiring & Integration Anchors
- **Target physical file**: `src/client/ui/modals/event_card_visuals.ts`
  - Rewire line 8 import from `../market_event_ticker.js` to `../market_event_helpers.js`.
- **Target physical file**: `src/client/ui/market_event_ticker.tsx`
  - Rewire line 4 import from `../store/game_store.js` to `../store/index.js` (satisfying Anti-TIDD call-site wiring).
  - Use direct ESM re-export syntax (`export { ALL_MARKET_TITLES, ... } from './market_event_helpers.js'`) to guarantee 100% referential identity without wrapper overhead.

---

## 4. Station 1: Core Contract Invariants (`tests/client/imp411_market_ticker_seam_and_store_facade.test.ts`)

- **TC-411.01 [UC-MARKET-EVENT-HELPERS-FORMATTING/MSS]**: Given distinct market event card identifiers (`MC_PUBLIC_INVEST`, `MC_COASTAL_STORM`, `MC_RATE_HIKE`, `MACRO_LAND_FEVER`, `CC_PORT_EXCLUSIVE`), When `resolveMarketTitle`, `resolveMarketShortTag`, `resolveMarketEffectSummary`, and `resolveMarketCompactFormula` execute, Then returns exact authoritative Vietnamese text descriptions and compact formulas; and when passed empty or unrecognized identifiers, returns safe fallback strings without exceptions.
- **TC-411.02 [UC-ZERO-CYCLIC-DEPENDENCY-TICKER-VISUALS/MSS]**: Given the project dependency graph, When analyzed via Tarjan strongly connected components (SCC), Then proves cycle `[SCC-6]` between `market_event_ticker.tsx` and `event_card_visuals.ts` is completely dissolved (0 circular edges between them).
- **TC-411.03 [UC-STORE-FACADE-CONFINEMENT-AND-HOOK-INTEGRITY/MSS]**: Given `src/client/store/index.ts`, When inspected, Then exports authoritative instances of `useGameStore`, `useLobbyStore`, `useEnvironmentStore`, `useVfxStore`, `useActivityStore`, `useAudioStore`, and duration constants matching disk reality; AND scans AST of all files in `src/client/events/**`, `src/client/network/**`, `src/client/telemetry/**` (`telemetry_expected_delta.ts`), and `src/client/store/**` (excluding `index.ts`) to mechanically prove 0 files import from `store/index`, confirming `[SCC-1]` and `[SCC-2]` remain completely isolated without cycle coalescence.
- **TC-411.04 [UC-BACKWARD-COMPATIBILITY-RE-EXPORT-PARITY/MSS]**: Given existing test consumers importing `resolveMarketEffectSummary`, `resolveMarketCompactFormula`, `resolveMarketTitle`, and `ACTIVE_MARKET_EFFECT_SUMMARIES` from `market_event_ticker.tsx`, When evaluated, Then proves re-exported functions and dictionaries maintain exact referential equality with `market_event_helpers.ts` ($fn_{re-export} === fn_{source}$), maintaining 100% compliance across `imp135`, `imp141`, `imp276`, and `visual_metadata_parity.test.ts`.

---

## 5. Station 3 & 4 Verification & Evidence Plan
- **Mechanical Gates**:
  1. `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_411_MARKET_TICKER_SEAM_AND_STORE_FACADE.md --auto-sign`
  2. `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_411_MARKET_TICKER_SEAM_AND_STORE_FACADE.md`
  3. `npx --yes tsc --noEmit` (Exit 0)
  4. `npm run lint:boundaries` (Verifies cycle between ticker and visuals is dissolved, total SCC count drops to 9)
  5. `npm run prefilter -- src/client/ui/market_event_helpers.ts src/client/ui/market_event_ticker.tsx src/client/ui/modals/event_card_visuals.ts src/client/store/index.ts tests/client/imp411_market_ticker_seam_and_store_facade.test.ts`
  6. Visual Capture Gate: `node scripts/capture_visual_evidence.mjs --ticket imp-411 --scenario notifications_financial`
  7. **Evidence Snapshot Collection (Tier 1.5 Structural Refactor)**:
     `node scripts/collect_evidence.mjs imp-411 tests/client/imp411_market_ticker_seam_and_store_facade.test.ts && npm run report -- imp-411 && node scripts/check_evidence.mjs imp-411`
  8. **Regression verification (Scoped Collision Prevention)**:
     `npx --yes vitest run tests/client/imp411_market_ticker_seam_and_store_facade.test.ts tests/client/imp135_market_ticker_clarity_and_popup_duration.test.ts tests/client/imp141_market_card_clarity_and_notification_rules.test.ts tests/contracts/visual_metadata_parity.test.ts` && `npx --yes vitest run -t "resolveMarket" tests/contracts/imp276b_event_card_sync.test.ts`

## 6. Definition of Done (DoD)
- [ ] `src/client/ui/market_event_helpers.ts` created with `<= 100 LOC`, exporting pure event formatters and dictionaries.
- [ ] `src/client/ui/market_event_ticker.tsx` delegates to `market_event_helpers.ts`, dropping to `<= 200 LOC`, and wires `useGameStore` from `../store/index.js` (100% Anti-TIDD compliant).
- [ ] `src/client/ui/modals/event_card_visuals.ts` rewires import to `market_event_helpers.js`, breaking cyclic coupling.
- [ ] `src/client/store/index.ts` created with `<= 80 LOC`, providing unified facade for all reactive client stores.
- [ ] Boundary linter `npm run lint:boundaries` confirms `[SCC-6]` cycle eliminated and total SCCs reduce to 9.
- [ ] Living test suite `tests/client/imp411_market_ticker_seam_and_store_facade.test.ts` passes 100% with 4 atomic tests including mechanical Facade Confinement AST assertion.
- [ ] 100% regression tests pass across `imp135`, `imp141`, `visual_metadata_parity`, and scoped `resolveMarket` tests in `imp276b`.
- [ ] `check_evidence.mjs imp-411` exits `0`.
