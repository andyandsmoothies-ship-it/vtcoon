# Lean Plan: IMP-449 Mobile Board Framing Restoration & Slim Banner Integration

> **Ticket:** `IMP-449`  
> **Classification:** Tier 2 3D Kinematics & Mobile Ergonomics Architecture  
> **Subsystem Boundaries:** `src/client/3d/`, `src/client/ui/`, `tests/client/`  
> **Source Problem:** User feedback showing board shrunk to ~27% screen height with 70% dark void on mobile portrait due to IMP-446 over-engineering ($Y = 34.5\text{m}$, $\text{FOV} = 50^\circ$).

---

## 1. Principles Applied

- **[Spatial AABB / Non-Occlusion]** -> Recalibrate mobile portrait overview camera framing to Golden Compromise ($Y \approx 28.5\text{m} - 29.8\text{m}$, FOV $44^\circ - 46^\circ$, shift $\le 0.4\text{m}$), expanding board height span by $+39\%$ and visual area by $+93\%$ while keeping Cell 20 safe from banner occlusion ($NDC_y \le +0.41$).
- **[View-Model Seam Extraction]** -> Pure mathematical functions `calculateResponsiveOverviewFov` and `calculateResponsiveOverviewCameraState` in `camera_kinematic_helpers.ts` calculate responsive elevation, shift, and FOV without WebGL context mocking.
- **[Equivalence-Partition Testing]** -> Contract suite verifies landscape ($aspect = 1.77$), tablet ($aspect = 1.33$), and mobile portrait ($aspect = 0.48, 0.42$) partitions for elevation, FOV, pitch angle invariance, and board scale.
- **[Dropped Requirements & Anti-Phantom Complexity]** -> Drop rigid mathematical dogma of $|NDC_x| \le 0.95$ for extreme 45° diamond corners on portrait phones; accept mild corner overhang ($|NDC_x| \le 1.26$ on only 6-8 cell tips) in favor of nearly doubling board visual area.
- **[100% DTO & Call-Site Wiring]** -> Wire slim mobile event line with `+N` badge directly into `MarketEventTicker` and verify 100% production consumption by `HudContainer`.
- **[HARNESS_MUTATION_AUTHORIZED]** -> Preserves toolchain AST enhancements in `scripts/plan_audit/rules_architecture.mjs` and automatic Sean Goedecke extraction in `scripts/report/report_markdown_renderer.mjs`.

---

## 2. Target Files & LOC Accounting

| Target File | Tier | Current LOC | Expected LOC | Net Delta | Max Allowed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/3d/camera_kinematic_helpers.ts` | Tier 1 (3D Math) | 142 | 148 | +6 | 400 | Safe |
| `src/client/ui/market_event_ticker.tsx` | Tier 2 (UI) | 154 | 170 | +16 | 500 | Safe |
| `tests/client/imp446_board_overview_camera_tuning.test.ts` | Living Tests | 282 | 282 | 0 | 600 | Modernized |
| `tests/client/imp449_mobile_board_framing_and_banner.test.ts` | Living Tests (New) | 0 | 185 | +185 | 600 | Safe |

---

## 3. Core Contract Invariants

1. **[INV-449.01: Mobile Overview Camera Recalibration Invariant]**:
   - In `src/client/3d/camera_kinematic_helpers.ts`:
   - On portrait viewports ($aspect < 1.0$), `calculateResponsiveOverviewFov` clamps FOV to $[44^\circ, 46^\circ]$ on mobile portrait (instead of the old excessive $50^\circ$ or flawed $34^\circ$).
   - In `calculateResponsiveOverviewCameraState`, distance scaling factor `scale` is clamped to $\le 1.18$ (`Math.min(1.18, Math.max(1.0, 1.0 / Math.pow(safeAspect, 0.25)))`), keeping camera elevation on mobile portrait at $Y \in [28.0\text{m}, 29.8\text{m}]$ instead of ballooning to $34.5\text{m}$.
   - Diagonal target shift is moderated to $shift \le 0.4\text{m}$ (`0.4 * Math.min(1.0, portraitFactor)`), anchoring the diorama visual center while keeping Cell 20 (Free Parking) at $NDC_y \le +0.41$ to prevent banner occlusion.
   - The board expands vertically from $26.7\%$ to $\approx 37.1\%$ of screen height ($+39\%$ linear increase, $+93\%$ visual area), with 32 out of 40 tiles fully visible ($|NDC_x| \le 1.0$) and corner tips reaching only $|NDC_x| \le 1.26$.

2. **[INV-449.02: Slim Mobile Banner Collapse & Badge Invariant]**:
   - In `src/client/ui/market_event_ticker.tsx`:
   - On mobile portrait (`< 640px`), render only 1 primary active event line with compact height ($34\text{px} - 36\text{px}$) and a `+N khác` badge if additional events exist. On tablet/desktop (`sm:`), render up to 3 items as before.
   - Saves $\ge 80\text{px}$ vertical headroom on mobile viewports while preserving full modal inspection and cell spotlighting via `handleCardClick`.

3. **[INV-449.03: Living Contract Modernization Protocol]**:
   - In `tests/client/imp446_board_overview_camera_tuning.test.ts`:
   - Modernize `TC-446.02a` to assert calibrated bounds: `expect(state.fov).toBeGreaterThanOrEqual(42); expect(state.fov).toBeLessThanOrEqual(46); expect(state.position[1]).toBeLessThanOrEqual(30.0);`.
   - Modernize `TC-446.02b` to assert board prominence where center tiles remain fully inside $|NDC| \le 0.70$ and lateral corners span naturally to screen boundaries ($|NDC_x| \in [1.10, 1.28]$).

4. **[INV-449.04: Anti-TIDD & Zero Dirty Casts]**:
   - Zero `as any` or `@ts-ignore`. Public interfaces remain clean without test-only flags.

---

## 4. Explicitly Dropped Requirements (Sean Goedecke Rule)

- ❌ **NO Mathematical Dogma of Forcing $|NDC_x| \le 0.95$ for 45° Diamond Tips on Mobile**: On a narrow portrait phone, shrinking an entire diagonal square to fit width forces 70% vertical void. We explicitly drop $100\%$ corner clearance in overview in favor of $\approx +93\%$ board area enlargement.
- ❌ **NO Multi-touch Pinch-Zoom Library**: Standard Three.js OrbitControls and camera FSM transitions handle zoom naturally.
- ❌ **NO Dynamic 3D Board Scaling**: Board geometry remains strictly 18x18; all sizing improvements derive from camera frustum optics.

---

## 5. Specification for Modifications & Call-Site Wiring

### 5.1 `src/client/3d/camera_kinematic_helpers.ts`
```typescript
export function calculateResponsiveOverviewFov(aspect?: number, baseFov = 24): number {
  if (typeof aspect !== 'number' || !Number.isFinite(aspect) || aspect >= 1.0) {
    return baseFov;
  }
  const safeAspect = Math.max(0.42, aspect);
  const targetHalfRad = (baseFov * Math.PI) / 360;
  const neededHalfRad = Math.atan((Math.tan(targetHalfRad) * 1.05) / safeAspect);
  const calculatedFov = Math.round((neededHalfRad * 360) / Math.PI);
  // [IMP-449] Golden Compromise: clamped to <= 45 deg on portrait to prevent postage-stamp board shrinkage
  return Math.min(45, Math.max(baseFov, calculatedFov));
}

export function calculateResponsiveOverviewCameraState(
  aspect: number | undefined,
  baseConfig: { readonly position: readonly [number, number, number]; readonly target: readonly [number, number, number]; readonly fov: number; readonly speed: number }
): { position: [number, number, number]; target: [number, number, number]; fov: number; speed: number } {
  const fov = calculateResponsiveOverviewFov(aspect, baseConfig.fov);
  const tx = baseConfig.target[0];
  const ty = baseConfig.target[1];
  const tz = baseConfig.target[2];
  if (typeof aspect !== 'number' || !Number.isFinite(aspect) || aspect >= 1.0) {
    return {
      position: [baseConfig.position[0], baseConfig.position[1], baseConfig.position[2]],
      target: [tx, ty, tz],
      fov,
      speed: baseConfig.speed,
    };
  }
  const safeAspect = Math.max(0.42, aspect);
  // [IMP-449] Golden Compromise scaling curve prevents ballooning elevation to 34.5m
  const rawScale = 1.0 / Math.pow(safeAspect, 0.25);
  const scale = Math.min(1.18, Math.max(1.0, rawScale));
  const portraitFactor = Math.max(0, (1.0 - safeAspect) / (1.0 - 0.48));
  // [IMP-449] Shift restrained to <= 0.4m to prevent Cell 20 occlusion under top banners
  const shift = 0.4 * Math.min(1.0, portraitFactor);

  const targetX = tx + shift;
  const targetY = ty;
  const targetZ = tz + shift;

  const posX = targetX + (baseConfig.position[0] - tx) * scale;
  const posY = targetY + (baseConfig.position[1] - ty) * scale;
  const posZ = targetZ + (baseConfig.position[2] - tz) * scale;

  return {
    position: [posX, posY, posZ],
    target: [targetX, targetY, targetZ],
    fov,
    speed: baseConfig.speed,
  };
}
```

### 5.2 `src/client/ui/market_event_ticker.tsx`
- Mobile: Render 1 primary event line with compact height `min-h-[36px]` and glassmorphism.
- If `active.length > 1`, display compact pill `+N khác` with tooltip/clickable affordance opening event modal.
- Desktop (`sm:`): Continue rendering up to 3 items as before.

---

## 6. Station 1 Test Specifications (`tests/client/imp449_mobile_board_framing_and_banner.test.ts`)

- **TC-449.01 [UC-MOBILE-OVERVIEW-FOV-AND-ELEVATION/MSS]**: Given `CAMERA_CONFIG.overview` ($Y = 25.3\text{m}$, FOV $24^\circ$), When `calculateResponsiveOverviewCameraState` is evaluated for mobile portrait ($aspect = 0.48$ and $aspect = 0.42$), Then FOV is clamped within $[44^\circ, 46^\circ]$ and elevation $Y$ is clamped within $[28.0\text{m}, 29.9\text{m}]$.
- **TC-449.02 [UC-BOARD-SCREEN-OCCUPANCY-PROPORTION/MSS]**: Given a simulated PerspectiveCamera using `calculateResponsiveOverviewCameraState(0.48, CAMERA_CONFIG.overview)` vs old IMP-446 state (FOV $50^\circ$, $Y = 34.5\text{m}$), When projected on a $360 \times 740$ viewport, Then the board height occupancy increases by $\ge 35\%$ ($\approx 37\%$ of screen height vs $27\%$), Cell 20 is at $NDC_y \le +0.45$, and Cell 10 lateral tip is bounded within $|NDC_x| \le 1.28$.
- **TC-449.03 [UC-SLIM-BANNER-LAYOUT-AND-EVENT-DISPATCH/MSS]**: Given `MarketEventTicker` rendered with multiple active market modifiers, When rendered in mobile viewport, Then only 1 primary event item renders with compact styling and `+N` badge, and clicking triggers modal opening and cell spotlighting.
- **TC-449.04 [UC-PITCH-ANGLE-INVARIANCE-AND-LANDSCAPE-PARITY/A1]**: Given landscape ($aspect = 1.77$) vs portrait ($aspect = 0.48$), When `calculateResponsiveOverviewCameraState` is invoked, Then camera pitch angle relative to target remains invariant within $\pm 0.5^\circ$ ($\approx 38.6^\circ$).

---

## 7. Station 3 Verification & Stopping Criteria (DoD)

- Fast Pre-Filter: `npm run prefilter -- src/client/3d/camera_kinematic_helpers.ts src/client/ui/market_event_ticker.tsx tests/client/imp446_board_overview_camera_tuning.test.ts tests/client/imp449_mobile_board_framing_and_banner.test.ts`
- Scope Confinement: `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_449_MOBILE_BOARD_FRAMING_AND_SLIM_BANNER.md`
- Visual Capture: `npm run capture:visual -- --ticket IMP-449 --scenario bot_turn_overview`
- Chaos Sentinel: `npm run sentinel -- --ticket IMP-449 --test tests/client/imp449_mobile_board_framing_and_banner.test.ts`
- Evidence Audit: `node scripts/check_evidence.mjs IMP-449`
- Definition of Done:
  1. `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_449_MOBILE_BOARD_FRAMING_AND_SLIM_BANNER.md --auto-sign` exits `0`.
  2. Station 2: `qa-tester` authors `tests/client/imp449_mobile_board_framing_and_banner.test.ts` with verified Semantic Behavioral RED.
  3. Station 2.5: `implementer` modifies `camera_kinematic_helpers.ts`, `market_event_ticker.tsx`, and modernizes `imp446_board_overview_camera_tuning.test.ts`.
  4. Station 3: `npm run prefilter` passes 100%. Dual-viewport visual capture verified (`npm run capture:visual -- --ticket IMP-449 --scenario bot_turn_overview`).
  5. Station 3.5: Chaos Sentinel passes with 100% mutant kill rate.
  6. Station 4: Evidence synthesized via `node scripts/check_evidence.mjs IMP-449` and report rendered in `docs/reports/improvements/IMP-449-mobile-board-framing-and-slim-banner_report.md`.
