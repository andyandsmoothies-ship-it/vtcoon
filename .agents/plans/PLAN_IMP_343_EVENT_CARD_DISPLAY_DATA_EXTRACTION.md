# Plan IMP-343: Event Card Display Data Deep Extraction & Visual Hardening

## 0. Context & Prior In-Flight Scope (Uncommitted)
- **Prior In-Flight Scope (Uncommitted)**:
  - `src/client/3d/event_card_texture.ts`
  - `src/client/events/game_event_synthesizer.ts`
  - `src/client/events/game_event_types.ts`
  - `src/client/events/subscribers/activity_log_subscriber.ts`
  - `src/client/network/apply_delta.ts`
  - `src/client/events/game_event_kinematics_synthesizer.ts`
  - `src/client/events/subscribers/activity_log_kinematics_formatter.ts`
  - `tests/client/imp344_kinematic_game_event_synthesis.test.ts`
  - `src/client/3d/tile_icons.ts`
  - `src/client/3d/tile_icons/types.ts`
  - `src/client/3d/tile_icons/transports.ts`
  - `src/client/3d/tile_icons/landmarks.ts`
  - `src/client/3d/tile_icons/culture.ts`
  - `src/client/3d/tile_icons/systems.ts`
  - `src/server/bond_manager.ts`
  - `src/server/insolvency_manager.ts`
  - `src/server/auction_manager.ts`
  - `tests/server/imp339_bond_insolvency_and_cascade_gate.test.ts`

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-343`
- **Subsystem**: `client-ui`
- **Problem Statement**:
  1. `src/client/ui/modals/event_card_modal.tsx` previously stood at 405 physical LOC, triggering a soft warning threshold (`> 400 LOC`).
  2. In an initial extraction attempt, static dictionaries bloated `event_card_visuals.ts` to 446 LOC, creating tech debt displacement near the 500 LOC ceiling.
  3. Station 4 lacked physical dual-viewport visual verification evidence.
- **Architectural Solution (Deep Module Standard - Pillar VIII)**:
  1. **Strictly Ban Shallow Sub-Components**: Do NOT extract shallow JSX subviews which cause props explosion (>= 4 props).
  2. **Pure Data Derivation Extraction**: Extract pure derivation logic into `resolveEventCardDisplayData` inside `src/client/ui/modals/event_card_visuals.ts`.
  3. **Static Config Isolation**: Move `KNOWN_HERO_STATS` and `KNOWN_CARD_CTA_BUTTONS` into `src/client/ui/modals/event_card_configs.ts` (139 LOC), bringing `event_card_visuals.ts` safely down to 324 LOC.
  4. **Dual-Viewport Visual Evidence**: Physically capture 1280x800 desktop and 360x740 mobile viewport screenshots using Chrome headless runner.
- **Direct Scope (Physical Files)**:
  - `src/client/ui/modals/event_card_configs.ts` (New)
  - `src/client/ui/modals/event_card_visuals.ts`
  - `src/client/ui/modals/event_card_modal.tsx`
  - `tests/client/imp343_event_card_display_data.test.ts` (New)

## 2. Planned Changes & LOC Budget

| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/ui/modals/event_card_configs.ts` | Tier 2 (UI/3D/Views) | 0 | 139 | +139 | <= 500 | 🆕 Tệp mới (✔️ Safe) |
| `src/client/ui/modals/event_card_visuals.ts` | Tier 2 (UI/3D/Views) | 324 | 324 | 0 | <= 500 | ✔️ Safe |
| `src/client/ui/modals/event_card_modal.tsx` | Tier 2 (UI/3D/Views) | 352 | 352 | 0 | <= 500 | ✔️ Safe |
| `tests/client/imp343_event_card_display_data.test.ts` | Living Test | 0 | 167 | +167 | <= 600 | 🆕 Tệp mới (✔️ Safe) |

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
**Target physical file**: `tests/client/imp343_event_card_display_data.test.ts` (Tệp mới)

Test Specifications:
- TC-343.01 [UC-EVENT-CARD/MSS]: Given single Market card MC_FUEL_SURGE, When resolveEventCardDisplayData is invoked, Then computes title from ticker, duration "1 vòng chơi", and hero stat variant "negative".
- TC-343.02 [UC-EVENT-CARD/MSS]: Given single Chance card CC_STOCK_PROFIT, When resolveEventCardDisplayData is invoked, Then resolves chance card metadata, applies fallback scope "Người chơi rút thẻ", and sets default duration "Tức thì".
- TC-343.03 [UC-EVENT-CARD/MSS]: Given multiple activeModifiers and isMultiEvent true, When resolveEventCardDisplayData is invoked for currentIdx 0 of 2, Then computes isCtaNext true and formats CTA button with sequence counter.
- TC-343.04 [UC-EVENT-CARD/MSS]: Given destination requiring financial disbursement, When resolveEventCardDisplayData is invoked with non-zero effectDelta, Then sets shouldShowDestination to true and sanitizes destination string.
- TC-343.05 [UC-EVENT-CARD/A1]: Given explicit custom title and description props, When resolveEventCardDisplayData is invoked, Then custom overrides take precedence over card metadata fallbacks.
- TC-343.06 [UC-EVENT-CARD/A2]: Given activeModifier with remainingRounds, When resolveEventCardDisplayData is invoked, Then maps rounds into resolvedDuration string.
- TC-343.11 [UC-EVENT-CONFIG/MSS]: Given hero stat variants, When getHeroStatStyles is invoked, Then returns correct tailwind styling tokens.

### Station 2: Minimal Production Implementation (GREEN)

#### Task 1: Create `src/client/ui/modals/event_card_configs.ts`
**Target physical file**: `src/client/ui/modals/event_card_configs.ts` (Tệp mới)

```typescript
export type HeroStatVariant = 'positive' | 'negative' | 'warning' | 'info';

export interface HeroStat {
  readonly label: string;
  readonly value: string;
  readonly variant: HeroStatVariant;
}

export interface HeroStatStyles {
  readonly container: string;
  readonly label: string;
  readonly value: string;
  readonly badge: string;
}

export const KNOWN_HERO_STATS: Readonly<Record<string, HeroStat>>;
export const KNOWN_CARD_CTA_BUTTONS: Readonly<Record<string, string>>;
export function getHeroStatStyles(variant: HeroStatVariant): HeroStatStyles;
```

#### Task 2: Refactor `src/client/ui/modals/event_card_visuals.ts`
**Target physical file**: `src/client/ui/modals/event_card_visuals.ts`
- Import and re-export static configurations from `./event_card_configs.js`.
- Implement `resolveEventCardDisplayData` pure facade function for UI consumption.

#### Task 3: Simplify `src/client/ui/modals/event_card_modal.tsx`
**Target physical file**: `src/client/ui/modals/event_card_modal.tsx`
- Replace 70 lines of data derivation with single call to `resolveEventCardDisplayData`.
- Preserve 100% of DOM layout, keyboard controls, Dong Son watermark, and test-ids.

### Station 3: Pre-Filter & Architecture Review
- Run mechanical pre-filter: `npm run prefilter -- src/client/ui/modals/event_card_visuals.ts src/client/ui/modals/event_card_modal.tsx src/client/ui/modals/event_card_configs.ts tests/client/imp343_event_card_display_data.test.ts`.
- Run scope confinement check: `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_343_EVENT_CARD_DISPLAY_DATA_EXTRACTION.md`.

### Station 4: Evidence & Verification
- Execute test suite: `npx vitest run tests/client/imp343_event_card_display_data.test.ts`.
- Run Sentinel probe mutation: `npm run sentinel -- --ticket IMP-343 --test tests/client/imp343_event_card_display_data.test.ts`.
- Capture physical visual evidence: `node scripts/capture_visual_evidence.mjs --ticket IMP-343 --dual-viewport --scenario event_card_modal`.
- Verify evidence: `node scripts/check_evidence.mjs IMP-343`.
