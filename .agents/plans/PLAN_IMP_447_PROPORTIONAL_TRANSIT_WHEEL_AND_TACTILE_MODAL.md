# PLAN: IMP-447 Proportional Transit Wheel & Tactile Modal Polish

## 1. Problem Statement & Scope Accountability
- **Scope Accountability (Macro-Architecture Tracking)**:
  - Ticket IMP-446 successfully delivered 3D Board Overview Camera Tuning & Deep-Round Auto-Zoom Suppression ($Y = 25.35\text{m}$, responsive FOV $47.7^\circ$).
  - Ticket **IMP-447** exclusively executes the user's explicit request: Proportional Transit Wheel ($35\%, 20\%, 20\%, 15\%, 10\%$) & Tactile Modal Polish.
  - Multi-ticket worktree: `[HARNESS_MUTATION_AUTHORIZED]` Preserves sentinel runner floor fix and prior visual scenarios across multi-ticket batch commits.
- **Problem**:
  1. In "Vòng Xoay Vận Tải" (Transit Wheel), probability percentages vary widely ($35\%, 20\%, 20\%, 15\%, 10\%$), but all 5 sectors render with identical equal arcs of $72^\circ$ ($360^\circ / 5$), creating a visual deceit where 35% looks equal to 10%.
  2. Static vs Dynamic Typography Paradox: Baseline applied manual $180^\circ$ inversion to half the wheel (`midDeg > 90 && midDeg < 270`), causing winning sectors to halt upside-down under the 12h needle.
  3. Narrow Sector Clipping ($36^\circ$, 10%): Sector #3 has arc chord width of only $\approx 22.25\text{px}$ at $r=36\text{px}$, causing 22px icon and 22.5px text to collide with border strokes.
  4. WebKit SVG Bounding Box Invalidation & Wobble: Elements with `fill="none"` and `stroke="none"` are dropped from `getBBox()` in WebKit. Length `transformOrigin: '100px 100px'` in `fill-box` computes from $(5, 5)$, shifting pivot to $(105, 105)$ and wobbling by $7.07\text{px}$.
  5. Degenerate Arc Collapse: $360^\circ$ arcs collapse in SVG; floating point roundoff leaves 0.5px black seams; needle tip at $-12\text{px}$ barely grazes the $6.4\text{px}$ rim.
- **Decision**: Proportional sector geometry matching weights via pure View-Model seam `transit_wheel_visuals.ts`, Casino Wheel radial typography with narrow sector scaling, W3C degenerate arc & underflow guards, Safari transparent bounding anchor with `transformOrigin: 'center'`, and penetrating tactile needle.

## 2. Target Files & LOC Budget

| Target Physical File | Type | Existing LOC | Budgeted LOC | Description |
| -------------------- | ---- | ------------ | ------------ | ----------- |
| `src/client/ui/modals/transit_wheel_visuals.ts` | New Presentation Seam | 0 | ~115 | Pure View-Model geometry, sector layout, degenerate guards, proportional landing |
| `src/client/ui/modals/transit_wheel_modal.tsx` | Presentation UI | 239 | ~240 | Proportional SVG arc paths, Casino radial text, anti-wobble anchor, tactile needle |

## 3. Core Contract Invariants (1 per Distinct Rule)
1. **INV-447.01 (Proportional Sector Geometry & Degenerate Guards)**: Slices in `TRANSIT_WHEEL_CONFIGS` MUST map $100\%$ weight directly to $360^\circ$ ($3.6^\circ$ per $1\%$).
   - `SPEED_BOOST` (35%): span = $126^\circ$, start = $0^\circ$, end = $126^\circ$, mid = $63^\circ$.
   - `SAFE_HAVEN` (20%): span = $72^\circ$, start = $126^\circ$, end = $198^\circ$, mid = $162^\circ$.
   - `CASH_BACK` (20%): span = $72^\circ$, start = $198^\circ$, end = $270^\circ$, mid = $234^\circ$.
   - `PASS_GO_FLIGHT` (10%): span = $36^\circ$, start = $270^\circ$, end = $306^\circ$, mid = $288^\circ$.
   - `FLIGHT_DELAY` (15%): span = $54^\circ$, start = $306^\circ$, end = $360^\circ$, mid = $333^\circ$.
   - **Degenerate Arc & Underflow Guard**: If `spanDeg >= 359.99^\circ`, emit dual-arc full circle. If `spanDeg <= 0.01^\circ`, emit empty `pathData: ''` and `isCollapsed: true`. Snap final sector `endDeg = 360^\circ` to eliminate floating-point gap.
2. **INV-447.02 (Needle Landing Angle Covariance & Call-Site Wiring)**: `getProportionalWheelTargetDeg(outcomeIndex)` MUST align the target sector's mid-angle exactly at $12\text{h}$ ($0^\circ / 360^\circ$ needle position):
   - Formula: $1800^\circ + (360^\circ - \text{midDeg}_i)$.
   - Modulo invariance: $(\text{midDeg}_i + \text{getProportionalWheelTargetDeg}(i)) \pmod{360} \equiv 0^\circ$ for all $i \in [0..4]$.
   - Safe fallback `(360 - (targetSector?.midDeg ?? 0))` against empty configs array.
   - Integration test verifies `TransitWheelModal` mounts and passes rotation (e.g. `2097deg`) to `<g style={{ transform: 'rotate(2097deg)' }}>`.
3. **INV-447.03 (Casino Radial Typography & View-Model DTO Pass-Through)**:
   - Content follows traditional Casino Wheel radial layout along each sector's radial spoke (`midDeg`). When winning sector halts under 12h needle, text is 100% upright.
   - `TransitWheelSectorAngle` encodes presentation properties directly: `color`, `icon`, `iconY`, `textY`, `iconSize`, `fontSize`, `isNarrow`, `isCollapsed`. Zero parallel array lookups in JSX.
   - For narrow sectors (`spanDeg < 45^\circ`, e.g. 10%): `iconY = 32`, `textY = 54`, `iconSize = 16`, `fontSize = 10`, `isNarrow = true` to prevent clipping across 2px borders.
   - For standard sectors (`spanDeg >= 45^\circ`): `iconY = 36`, `textY = 56`, `iconSize = 22`, `fontSize = 12`, `isNarrow = false`.
   - Collapsed sectors (`isCollapsed: true`) are skipped in JSX, preventing ghost text collision on adjacent borders.
4. **INV-447.04 (Visual Affordance, Needle Penetration & Safari Pivot Invariance)**:
   - Primary action buttons MUST satisfy minimum touch target $\ge 44\text{px}$ (Pillar V Gotcha).
   - Needle indicator at top has `left-1/2 -translate-x-1/2` and `-top-1.5` with `border-t-[18px]` so its tip reaches $+12\text{px}$ (penetrating $\approx 5.6\text{px}$ into outer rim $Y_{\text{rim}} = 6.4\text{px}$).
   - **Safari Pivot Invariance**: Rotating `<g>` uses `transformOrigin: 'center'` (or `'50% 50%'`) combined with transparent bounding anchor `<circle cx="100" cy="100" r="95" fill="transparent" stroke="transparent" strokeWidth="1" pointerEvents="none" />`, guaranteeing rock-solid $(100, 100)$ pivot in WebKit regardless of reference-box mode.
   - CTA buttons use tactile Indochine styling (`bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500`, `shadow-[0_4px_0_0_#b45309] active:translate-y-[3px]`).
5. **INV-447.05 (Living Test & Domain Stability Quarantine)**:
   - Strict quarantine on `src/domain/transit_wheel.ts`. Legacy `getWheelTargetDeg` remains untouched, guaranteeing 100% green living tests `imp250`, `imp279`, `imp414`.
   - `transit_wheel_modal.tsx` explicitly protects and re-exports `getTransitWheelDismissText` with identical signature, guaranteeing 100% green living tests on `imp249`.

## 4. Explicitly Dropped Requirements (Sean Goedecke Invariant)
- **NO physics engine simulation**: No Box2D or spring physics; deterministic CSS `cubic-bezier(0.15, 0.9, 0.2, 1)` over 3500ms fulfills all requirements.
- **NO dynamic per-station odds**: Outcome probabilities remain locked to `TRANSIT_WHEEL_CONFIGS` (SSOT), not modified dynamically per cell index.
- **NO sound file generation**: Audio continues using existing registered SFX (`SoundEffect.DICE_ROLL`, `SoundEffect.CARD_DRAW`).
- **NO 3D Camera Overview bundling**: Handled and completed in ticket IMP-446.

## 5. Principles Applied
- `[View-Model Seam Extraction]` -> Pure helper `getTransitWheelSectorAngles` in `transit_wheel_visuals.ts` calculates geometry, colors, font sizes, and radial anchors, freeing JSX from layout math.
- `[Equivalence-Partition Testing]` -> 5 distinct sector partitions tested for both boundary angles and center landing alignment.
- `[Relational Multi-Point Assertion]` -> Verifies non-constant angle covariance across all 5 sectors ($f(x_1) \neq f(x_2)$).
- `[Poka-Yoke Domain Affordance]` -> CTA button states derive directly from spin phase; needle has `left-1/2 -translate-x-1/2` and $-top-1.5$ penetration; anti-wobble transparent anchor and `transformOrigin: 'center'` ensure rock-solid center on iOS.
- `[Dropped Requirements & Anti-Phantom Complexity]` -> Dropped arbitrary friction simulations, dynamic odds, and 3D bundling.

## 6. Specification for New File: `src/client/ui/modals/transit_wheel_visuals.ts`

```typescript
import { TRANSIT_WHEEL_CONFIGS, type TransitWheelConfig, TransitWheelOutcome } from '../../../domain/index.js';

export interface TransitWheelSectorAngle {
  readonly outcome: TransitWheelOutcome;
  readonly weight: number;
  readonly color: string;
  readonly icon: string;
  readonly startDeg: number;
  readonly endDeg: number;
  readonly midDeg: number;
  readonly spanDeg: number;
  readonly pathData: string;
  readonly iconY: number;
  readonly textY: number;
  readonly iconSize: number;
  readonly fontSize: number;
  readonly isNarrow: boolean;
  readonly isCollapsed: boolean;
}

const WHEEL_FULL_SPINS_DEG = 1800;

export function getTransitWheelSectorAngles(
  configs: readonly TransitWheelConfig[] = TRANSIT_WHEEL_CONFIGS,
  radius: number = 95,
  cx: number = 100,
  cy: number = 100,
): readonly TransitWheelSectorAngle[] {
  const totalWeight = configs.reduce((sum, c) => sum + (c.weight > 0 ? c.weight : 0), 0) || 100;
  let currentAngle = 0;
  return configs.map((cfg, idx) => {
    const safeWeight = Math.max(0, cfg.weight);
    const rawSpan = (safeWeight / totalWeight) * 360;
    const startDeg = currentAngle;
    let endDeg = currentAngle + rawSpan;
    if (idx === configs.length - 1 && Math.abs(endDeg - 360) < 0.05) endDeg = 360;
    const spanDeg = endDeg - startDeg;
    const midDeg = startDeg + spanDeg / 2;
    currentAngle = endDeg;

    const isCollapsed = spanDeg <= 0.01;
    let pathData = '';
    if (!isCollapsed) {
      if (spanDeg >= 359.99) {
        pathData = `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx} ${cy + radius} A ${radius} ${radius} 0 1 1 ${cx} ${cy - radius} Z`;
      } else {
        const startRad = (startDeg * Math.PI) / 180;
        const endRad = (endDeg * Math.PI) / 180;
        const x1 = cx + radius * Math.sin(startRad);
        const y1 = cy - radius * Math.cos(startRad);
        const x2 = cx + radius * Math.sin(endRad);
        const y2 = cy - radius * Math.cos(endRad);
        const largeArc = spanDeg > 180 ? 1 : 0;
        pathData = `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radius} ${radius} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
      }
    }

    const isNarrow = spanDeg < 45;
    return {
      outcome: cfg.outcome,
      weight: cfg.weight,
      color: cfg.color,
      icon: cfg.icon,
      startDeg,
      endDeg,
      midDeg,
      spanDeg,
      pathData,
      iconY: isNarrow ? 32 : 36,
      textY: isNarrow ? 54 : 56,
      iconSize: isNarrow ? 16 : 22,
      fontSize: isNarrow ? 10 : 12,
      isNarrow,
      isCollapsed,
    };
  });
}

export function getProportionalWheelTargetDeg(
  outcomeIndex: number,
  configs: readonly TransitWheelConfig[] = TRANSIT_WHEEL_CONFIGS,
): number {
  const sectors = getTransitWheelSectorAngles(configs);
  const targetSector = sectors[outcomeIndex] ?? sectors[0];
  const midDeg = targetSector?.midDeg ?? 0;
  return WHEEL_FULL_SPINS_DEG + (360 - midDeg);
}
```

### Call-Site Wiring in Consumer `src/client/ui/modals/transit_wheel_modal.tsx`
- **Target physical file**: `src/client/ui/modals/transit_wheel_modal.tsx`
- Imports `getTransitWheelSectorAngles` and `getProportionalWheelTargetDeg` from `./transit_wheel_visuals.js`.
- Protects and retains canonical export `export function getTransitWheelDismissText(outcome, targetCell, cellIndex)` for living tests.
- Replaces inline angle loops with `const sectors = getTransitWheelSectorAngles(TRANSIT_WHEEL_CONFIGS);`.
- Consumes `sector.pathData`, `sector.color`, `sector.icon`, `sector.iconY`, `sector.textY`, `sector.iconSize`, `sector.fontSize` directly without parallel array lookups.
- Guards degenerate sectors: `{sectors.map((s) => s.isCollapsed || !s.pathData ? null : <g ...>)}`.
- Adds transparent bounding anchor `<circle cx="100" cy="100" r="95" fill="transparent" stroke="transparent" strokeWidth="1" pointerEvents="none" />` inside rotating `<g>`.
- Rotating `<g>` specifies `transformOrigin: 'center'` (or `'50% 50%'`).
- Needle indicator updated to `absolute -top-1.5 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-amber-400 drop-shadow`.

## 7. Station 1 Test Contracts (`tests/contracts/imp447_proportional_transit_wheel_and_tactile_modal.test.ts`)
- `TC-447.01` `[UC-PROPORTIONAL-ANGLES/MSS]`: Given default `TRANSIT_WHEEL_CONFIGS`, When calling `getTransitWheelSectorAngles()`, Then returns 5 sectors with proportional spans ($126^\circ, 72^\circ, 72^\circ, 36^\circ, 54^\circ$) summing to $360^\circ$ with zero gap.
- `TC-447.02` `[UC-DEGENERATE-AND-UNDERFLOW-GUARDS/MSS]`: Given a test configuration with 100% weight ($360^\circ$) or 0% weight, When calling `getTransitWheelSectorAngles()`, Then returns dual-arc path for 100% and empty `pathData: ''` with `isCollapsed: true` for 0% underflow.
- `TC-447.03` `[UC-TARGET-LANDING-DEG/MSS]`: Given outcome index $i \in [0..4]$, When calling `getProportionalWheelTargetDeg(i)`, Then rotation aligns that sector's geometric center under $12\text{h}$ needle ($(\text{midDeg}_i + \text{targetDeg}_i) \pmod{360} \equiv 0^\circ$).
- `TC-447.04` `[UC-RELATIONAL-COVARIANCE/MSS]`: Given two distinct outcomes (index 0 and index 1), When evaluating landing degrees, Then returns distinct angles covariance ($f(0) \neq f(1)$), $\ge 1800^\circ$, and handles empty configs safely without throw.
- `TC-447.05` `[UC-NARROW-SECTOR-LAYOUT-SEAM/MSS]`: Given 10% narrow sector ($36^\circ$), When evaluating `TransitWheelSectorAngle` presentation properties, Then returns `isNarrow === true`, `fontSize === 10`, `iconSize === 16`, `iconY === 32`, and `textY === 54` to prevent border collision.
- `TC-447.06` `[UC-CALL-SITE-WIRING-ROTATION/MSS]`: Given `TransitWheelModal` mounted with outcome `SPEED_BOOST`, When rendered, Then wheel group `<g>` style contains `transform: rotate(2097deg)` proving active call-site wiring of `getProportionalWheelTargetDeg`.
- `TC-447.07` `[UC-TACTILE-CTA-AND-A11Y/MSS]`: Given rendered modal, When inspecting action buttons and indicators, Then enforces touch target $\ge 44\text{px}$, needle centering class `left-1/2 -translate-x-1/2`, needle top `-top-1.5`, transparent bounding anchor circle, and tactile amber styling.

## 8. Station 3 Verification & Stopping Criteria (DoD)
- Fast Pre-Filter: `npm run prefilter -- src/client/ui/modals/transit_wheel_visuals.ts src/client/ui/modals/transit_wheel_modal.tsx tests/contracts/imp447_proportional_transit_wheel_and_tactile_modal.test.ts`
- Scope Confinement: `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_447_PROPORTIONAL_TRANSIT_WHEEL_AND_TACTILE_MODAL.md`
- Visual Capture: `node scripts/capture_visual_evidence.mjs --ticket IMP-447 --scenario transit_wheel`
- Chaos Sentinel: `npm run sentinel -- --ticket IMP-447 --test tests/contracts/imp447_proportional_transit_wheel_and_tactile_modal.test.ts`
- Evidence Audit: `node scripts/check_evidence.mjs IMP-447`
- Definition of Done:
  - 100% contract tests pass GREEN.
  - Zero regression across all living transit wheel tests (`imp249`, `imp250`, `imp279`, `imp414`).
  - Chaos Sentinel kills 100% mutants.
  - `docs/FEATURE_MAP.md` updated and <= 30 KB.
