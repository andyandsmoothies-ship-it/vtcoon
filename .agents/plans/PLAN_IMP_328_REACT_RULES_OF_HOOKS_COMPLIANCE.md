# Plan IMP-328: React Rules of Hooks Compliance & Mobile Error #310 Fix

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-328`
- **Subsystem**: `client-3d` & `client-ui`
- **Problem Statement**:
  1. **OwnerPricePill Early Return Trap**: In `src/client/3d/owner_property_markers.tsx:61-63`, `if (!hasOwner) return null;` precedes `useMemo` hooks (mascotTexture, priceTexture). When unowned property is acquired on mobile room load or gameplay, hook count jumps from 0 to 2, causing Minified React error #310 ("Rendered more hooks than during the previous render").
  2. **PostProcessingPipeline Conditional Hooks & Shell Flaws**: In `src/client/3d/post_processing_pipeline.tsx`, `useSafeTelemetryFps()` calls hook conditionally (`fps !== undefined ? fps : useSafeTelemetryFps()`), and `if (!enabled) return null;` precedes `useState` and `useEffect`. In addition, `targetVector` conditionally calls `React.useMemo` based on internal dispatcher checks. When `isMobile` or viewport orientation toggles `enabled`, hook execution desyncs.
  3. **FloatingNumbersOverlay & FloatingBadge Early Return Trap**: In `src/client/ui/floating_numbers.tsx:298-310`, `if (floatingTexts.length === 0) return null;` precedes `useIsMobile()` and `useVisibleFloatingTexts()`. When mobile client connects and receives first financial/event text, hook count increases. In `FloatingBadge:190-199`, milestone return precedes `useLobbyStore`.
- **Architectural Solution**:
  1. **Component Decomposition (Shell & Active Pattern)**:
     - For `OwnerPricePill`: decompose into outer boundary check and inner `<ActiveOwnerPricePill />` (or reorder hooks unconditionally to top of component before return).
     - For `PostProcessingPipeline`: decompose into outer early return shell `if (props.enabled === false) return null;` and inner `<ActivePostProcessingPipeline />` where all hooks (`useTelemetryStore`, `useMemo`, `useState`, `useEffect`) execute unconditionally on every active render without framework monkey-patching.
     - For `FloatingNumbersOverlay`: hoist `useIsMobile` and `useVisibleFloatingTexts` above the early exit conditions, or decompose into `<ActiveFloatingNumbersOverlay />`.
     - For `FloatingBadge`: hoist `useLobbyStore` above the milestone check so hook execution count is strictly invariant.
- **Direct Scope**:
  - `src/client/3d/owner_property_markers.tsx`
  - `src/client/3d/post_processing_pipeline.tsx`
  - `src/client/ui/floating_numbers.tsx`
  - `tests/client/imp328_react_rules_of_hooks_compliance.test.ts` (New)
  - `tests/contracts/threejs_pipeline_hardening.test.ts` (Harmonize TC-3D.13 with ActivePostProcessingPipeline)
- **Baseline Working Tree Dependencies**:
  - `src/server/insolvency_manager.ts`
  - `src/server/mortgage_manager.ts`
  - `src/server/room_property_coordinator.ts`
  - `tests/server/imp327_symmetric_fsm_insolvency_restoration.test.ts`

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `src/client/3d/owner_property_markers.tsx` | Tier 2 (UI/3D/Views) | 206 | 207 | +1 | <= 500 | ✔️ Safe |
| `src/client/3d/post_processing_pipeline.tsx` | Tier 2 (UI/3D/Views) | 363 | 378 | +15 | <= 500 | ✔️ Safe |
| `src/client/ui/floating_numbers.tsx` | Tier 2 (UI/3D/Views) | 372 | 373 | +1 | <= 500 | ✔️ Safe |
| `tests/client/imp328_react_rules_of_hooks_compliance.test.ts` | Living Test | 0 | 226 | +226 | <= 600 | ✔️ Safe |
| `tests/contracts/threejs_pipeline_hardening.test.ts` | Living Test | 255 | 255 | 0 | <= 600 | ✔️ Safe |

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
**Target physical file**: `tests/client/imp328_react_rules_of_hooks_compliance.test.ts` (Tệp mới)

Test Specifications:
- TC-328.01 [UC-HOOKS/MSS]: Given OwnerPricePill rendered with unowned property, When component re-renders with ownerColor prop, Then component updates without hook mismatch exception.
- TC-328.02 [UC-HOOKS/A1]: Given OwnerPricePill rendered with ownerColor prop, When component re-renders without ownerColor prop, Then component returns null without hook mismatch exception.
- TC-328.03 [UC-HOOKS/MSS]: Given PostProcessingPipeline rendered with enabled false, When component re-renders with enabled true, Then pipeline renders without hook mismatch exception.
- TC-328.04 [UC-HOOKS/A1]: Given PostProcessingPipeline rendered with isMobile true, When component re-renders with isMobile false, Then pipeline adapts bloom without hook count discrepancy.
- TC-328.05 [UC-HOOKS/MSS]: Given FloatingNumbersOverlay rendered with empty floating texts, When component re-renders with a newly added transaction item, Then overlay mounts active container without hook count discrepancy.
- TC-328.06 [UC-HOOKS/A1]: Given FloatingBadge rendered with monopoly action type, When component re-renders with rent action type, Then badge transitions smoothly without hook count discrepancy.

### Station 2: Implementation (GREEN)

#### Task 1: Reorder Hooks in `owner_property_markers.tsx`
**Target physical file**: `src/client/3d/owner_property_markers.tsx`
- Move `const mascotTexture = useMemo(...)` and `const priceTexture = useMemo(...)` before `if (!hasOwner) return null;`.
- Ensure `hasOwner` check guards texture generation inside `useMemo` safely without early component returns.

#### Task 2: Standardize Hooks in `post_processing_pipeline.tsx`
**Target physical file**: `src/client/3d/post_processing_pipeline.tsx`
- Replace conditional `fps !== undefined ? fps : useSafeTelemetryFps()` with unconditional hook call `useSafeTelemetryFps()`.
- Remove dangerous React internal dispatcher monkey-patching (`__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED`).
- Decompose into pure shell `PostProcessingPipeline` returning `null` when `enabled === false`, and `<ActivePostProcessingPipeline />` containing unconditional effects (`useMemo`, `useState`, `useEffect`).

#### Task 3: Reorder Hooks in `floating_numbers.tsx`
**Target physical file**: `src/client/ui/floating_numbers.tsx`
- In `FloatingNumbersOverlay`: hoist `useIsMobile()` and `useVisibleFloatingTexts()` to the top of the component above `if (floatingTexts.length === 0) return null;` and `if (activeModal !== null && !latestMilestone) return null;`.
- In `FloatingBadge`: hoist `useLobbyStore` above the milestone check `if (item.actionType === ...) return <MilestoneBanner />`.

### Station 3: Pre-Filter & Architecture Review
- Run `npm run prefilter -- src/client/3d/owner_property_markers.tsx src/client/3d/post_processing_pipeline.tsx src/client/ui/floating_numbers.tsx tests/client/imp328_react_rules_of_hooks_compliance.test.ts`.
- Run `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_328_REACT_RULES_OF_HOOKS_COMPLIANCE.md`.

### Station 4: Evidence & Verification
- Execute test suite: `npx vitest run tests/client/imp328_react_rules_of_hooks_compliance.test.ts`.
- Run sentinel probe verification: `npm run sentinel -- --ticket IMP-328 --test tests/client/imp328_react_rules_of_hooks_compliance.test.ts`.
- Verify physical evidence: `node scripts/check_evidence.mjs IMP-328`.
- Synthesize delivery report: `npm run report -- IMP-328`.
