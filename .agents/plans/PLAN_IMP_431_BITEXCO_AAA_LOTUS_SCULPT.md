# Lean Plan: IMP-431 AAA Bitexco Lotus Tower Sculpt & Sapphire Glass Overhaul

> **Ticket:** `IMP-431`  
> **Classification:** Tier 2 3D Graphics & Architectural Modeling  
> **Subsystem Boundaries:** `src/client/3d/diorama/`, `tests/client/`  
> **Roadmap Alignment (Architectural Realism Overhaul):**
> - **`IMP-428` (Completed):** Desktop Diorama Lean Architecture & 60 FPS rescue (culled ~1,500 procedural clutter boxes).
> - **`IMP-429` (Completed):** Desktop 3D Visual Renaissance (restored Ba Son Bridge, Notre Dame, and Dong Son Plaza).
> - **`IMP-430` (Completed):** Desktop Glass & Brass Tycoon HUD Overhaul (compact card mode, unblocked cells 28–32).
> - **`IMP-431` (Current Slice):** AAA Bitexco Lotus Tower Sculpt & Sapphire Glass Overhaul (re-sculpting the crude procedural cylinder/cone into an authentic aerodynamic lotus bud silhouette with canted crescent crown, cantilevered petal saucer helipad, and sapphire glass mullions, matching real-world architectural reference photos).

---

## 1. Principles Applied

- **[View-Model Seam Extraction]** -> Pure spline curvature profile math, lathe geometry generator, and canted crown builders extracted into `bitexco_tower_visuals.ts`, decomposing `diorama_skyline.tsx` and bringing its line count down from 411 LOC to <= 340 LOC, safely below the 350 LOC buffer zone limit.
- **[Anti-Box-Reductionism Guard]** -> Banished the primitive straight cylinder and cone rocket cap; sculpted a genuine double-curved lotus bud silhouette with aerodynamic saucer underbelly helipad and canted crescent glass crown based directly on Carlos Zapata's real architectural design.
- **[Spatial AABB / Non-Occlusion]** -> The cantilevered helipad saucer extends outward towards the Saigon River at $y = 1.68 \in [1.60, 1.75]$ with a filleted petal profile and under-deck truss structure, preserving player viewport sightlines to adjacent colonial heritage tiles and board cells.
- **[Resource Disposal & Cache Hygiene]** -> Parametric geometries are cached as module-level singletons in `bitexco_tower_visuals.ts` with explicit `disposeBitexcoGeometries()`, eliminating WebGL VRAM leaks and preserving 60 FPS (< 65 draw calls).
- **[100% DTO & Call-Site Wiring]** -> Every visual helper (`createBitexcoLotusBudGeometry`, `createBitexcoLotusSheathGeometry`, `createBitexcoCrescentCrownGeometry`, `createBitexcoHelipadSaucerGeometry`) is actively consumed at the production call-site in `diorama_skyline.tsx`.
- **[Two-Stage Decoupling Pattern]** -> Retain 100% of all legacy testids (`bitexco-tower`, `bitexco-podium`, `bitexco-plaza`, `bitexco-lotus-sheath`, `bitexco-helipad`, `helipad-truss`, `micro-helicopter`, `bitexco-crown`) and apex height coordinate $y = 2.85$, ensuring zero breakage across 11 living test suites.

---

## 2. Target Files & Honest LOC Accounting

| File Path | Tier | Current LOC | Expected LOC | Net Delta | Max Allowed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/3d/diorama/diorama_skyline.tsx` | Tier 2 3D Component | 411 | 335 | -76 | 350 (Buffer) | Safe (Refactor-First: delegates math to bitexco_tower_visuals.ts) |
| `src/client/3d/diorama/bitexco_tower_visuals.ts` | New Tier 2 View-Model Seam | 0 | 225 | +225 | 500 | Safe (Pure geometry generators, profile curves, and material specs) |
| `tests/client/imp431_bitexco_aaa_lotus_sculpt.test.ts` | New Living Test Suite | 0 | 210 | +210 | 600 | Safe (Station 2 contract suite) |

---

## 3. Core Contract Invariants & Architectural Seams

1. **[INV-431.01: Lotus Bud Double-Curvature Profile & Base Pivot Alignment]**:
   - In `bitexco_tower_visuals.ts`, `computeBitexcoRadius(y)` computes a continuous smooth profile for $y \in [0.0, 2.45]$:
     - Base transition ($y = 0.0$ to $0.4$): $R(y) = 0.46 \to 0.40$
     - Lotus waist sweep ($y = 0.4$ to $1.2$): $R(y) = 0.40 \to 0.35$
     - Skydeck & Helipad neck ($y = 1.2$ to $1.8$): $R(y) = 0.35 \to 0.32$
     - Upper taper ($y = 1.8$ to $2.45$): $R(y) = 0.32 \to 0.24$
   - Anchored at `position={[0, 0, 0]}` (DIR-431.06) since Lathe points begin at $y=0$, preventing 1.1m levitation.

2. **[INV-431.02: Aerodynamic Petal Saucer Helipad & Non-Circle Primitives]**:
   - `data-testid="bitexco-helipad"` located at cantilever offset $[0.38, 1.68, 0.0]$ ($y = 1.68 \in [1.60, 1.75]$).
   - Utilizes `createBitexcoHelipadSaucerGeometry()` featuring a filleted aerodynamic underbelly dish rather than a flat disc.
   - Strictly BANS `<circleGeometry>` (DIR-431.04) to avoid tripping mobile culling test `imp379`. Retains `<ringGeometry>`, `helipad-truss`, `#F59E0B`, `#F8FAFC`, and `micro-helicopter`.

3. **[INV-431.03: Canted Crescent Crown Vertex Shear & Spire Apex]**:
   - `createBitexcoCrescentCrownGeometry()` applies vertex shear transform $y_{new} = y + z \cdot \tan(32^\circ)$ (DIR-431.01) ensuring elevation slope $\Delta y \ge 0.18$ between front and rear lip.
   - Preserves `bitexco-crown`, interior core (`#1E293B`), and spire apex explicitly at `position={[0, 2.85, 0]}` (`#F59E0B`) with red beacon (`#EF4444`).

4. **[INV-431.04: Sapphire Glass PBR Material & Lotus Sheath Anti-Z-Fighting]**:
   - `createBitexcoLotusSheathGeometry()` generates a matching curved sheath (DIR-431.05) with $R_{sheath}(y) = R(y) + 0.025$ and thetaLength $1.6\pi$, eliminating facade clipping and z-fighting.
   - Sheath features ice-cyan `#7DD3FC` / `#38BDF8` with silver trims `#E2E8F0`. Main tower uses sapphire `#0284C7` / `#0369A1`.

5. **[INV-431.05: Living Test Parity & AST Token Preservation]**:
   - Preserves 100% AST tokens in `diorama_skyline.tsx` required by `tests/client/time_of_day.test.ts` (DIR-431.03):
     `// Contract retention (Gotcha #31): calculateLaserRotation`, `calculateAviationStrobe`, `#EF4444`, `cylinderGeometry`, `useEnvironmentStore`.
   - Strictly quarantines peripheral island environment (`coastal_island_environment.tsx`) — 0 edits to outer board scene, honoring user directive for separate architectural redesign.

### 3.1 Interface Specification for `bitexco_tower_visuals.ts`

```typescript
import { BufferGeometry, LatheGeometry, Vector2, CylinderGeometry } from 'three';

let cachedLotusBudGeo: BufferGeometry | null = null;
let cachedLotusSheathGeo: BufferGeometry | null = null;
let cachedHelipadSaucerGeo: BufferGeometry | null = null;
let cachedCrescentCrownGeo: BufferGeometry | null = null;

export function computeBitexcoRadius(y: number): number {
  if (y <= 0.4) return 0.46 - (y / 0.4) * 0.06;
  if (y <= 1.2) return 0.40 - ((y - 0.4) / 0.8) * 0.05;
  if (y <= 1.8) return 0.35 - ((y - 1.2) / 0.6) * 0.03;
  return 0.32 - ((y - 1.8) / 0.65) * 0.08;
}

export function createBitexcoLotusBudGeometry(): BufferGeometry {
  if (!cachedLotusBudGeo) {
    const points: Vector2[] = [];
    for (let i = 0; i <= 24; i++) {
      const y = (i / 24) * 2.45;
      points.push(new Vector2(computeBitexcoRadius(y), y));
    }
    cachedLotusBudGeo = new LatheGeometry(points, 24);
  }
  return cachedLotusBudGeo;
}

export function createBitexcoLotusSheathGeometry(): BufferGeometry {
  if (!cachedLotusSheathGeo) {
    const points: Vector2[] = [];
    for (let i = 0; i <= 20; i++) {
      const y = 0.1 + (i / 20) * 1.95;
      points.push(new Vector2(computeBitexcoRadius(y) + 0.025, y));
    }
    cachedLotusSheathGeo = new LatheGeometry(points, 24, 0, Math.PI * 1.6);
  }
  return cachedLotusSheathGeo;
}

export function createBitexcoHelipadSaucerGeometry(): BufferGeometry {
  if (!cachedHelipadSaucerGeo) {
    const pts = [new Vector2(0.08, -0.06), new Vector2(0.20, -0.02), new Vector2(0.22, 0.0), new Vector2(0.0, 0.0)];
    cachedHelipadSaucerGeo = new LatheGeometry(pts, 20);
  }
  return cachedHelipadSaucerGeo;
}

export function createBitexcoCrescentCrownGeometry(): BufferGeometry {
  if (!cachedCrescentCrownGeo) {
    const geo = new CylinderGeometry(0.18, 0.24, 0.35, 24, 1, true);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const z = pos.getZ(i);
      if (y > 0) pos.setY(i, y + z * Math.tan((32 * Math.PI) / 180));
    }
    geo.computeVertexNormals();
    cachedCrescentCrownGeo = geo;
  }
  return cachedCrescentCrownGeo;
}

export function disposeBitexcoGeometries(): void {
  cachedLotusBudGeo?.dispose();
  cachedLotusBudGeo = null;
  cachedLotusSheathGeo?.dispose();
  cachedLotusSheathGeo = null;
  cachedHelipadSaucerGeo?.dispose();
  cachedHelipadSaucerGeo = null;
  cachedCrescentCrownGeo?.dispose();
  cachedCrescentCrownGeo = null;
}
```

### 3.2 Call-Site Wiring in `src/client/3d/diorama/diorama_skyline.tsx`

```typescript
import {
  createBitexcoLotusBudGeometry,
  createBitexcoLotusSheathGeometry,
  createBitexcoHelipadSaucerGeometry,
  createBitexcoCrescentCrownGeometry,
} from './bitexco_tower_visuals';
```

---

## 4. Contract Test Scenarios (Station 2 Specification)

- **TC-431.01 [UC-LOTUS-PROFILE-CURVATURE/MSS]**: Given `computeBitexcoRadius(y)`, When evaluating across key elevations $y \in [0.0, 0.8, 1.6, 2.4]$, Then asserts strict monotonic tapering and curvature bounds $0.22 \le R(y) \le 0.48$ with non-linear derivatives ($R'(y_1) \neq R'(y_2)$).
- **TC-431.02 [UC-LOTUS-TOWER-GEOMETRY-CACHING/MSS]**: Given `createBitexcoLotusBudGeometry()` and `disposeBitexcoGeometries()`, When called repeatedly, Then returns cached singleton instance, and clears cache on dispose.
- **TC-431.03 [UC-HELIPAD-SAUCER-PROFILE/MSS]**: Given `createBitexcoHelipadSaucerGeometry()`, When inspecting vertices, Then confirms aerodynamic curved underbelly cross-section with beveled rim radius $R \approx 0.22$.
- **TC-431.04 [UC-CANTED-CRESCENT-CROWN/MSS]**: Given `createBitexcoCrescentCrownGeometry()`, When inspecting height variance across vertices, Then confirms asymmetrical elevation slope $\Delta y \ge 0.18$ between front and rear lip.
- **TC-431.05 [UC-SKYLINE-LIVING-CONTRACT-PARITY/MSS]**: Given `DioramaSkyline` rendered in isolation, When inspecting static markup, Then verifies presence of all 8 legacy testids (`bitexco-tower`, `bitexco-podium`, `bitexco-plaza`, `bitexco-lotus-sheath`, `bitexco-helipad`, `helipad-truss`, `micro-helicopter`, `bitexco-crown`) and spire apex at $y = 2.85$.
- **TC-431.06 [UC-PALETTE-AND-MULLION-PARITY/MSS]**: Given `DioramaSkyline` markup, When checking material colors, Then confirms presence of sapphire `#0284C7`, ice-cyan `#7DD3FC`, silver `#E2E8F0`, amber `#F59E0B`, beacon red `#EF4444`, and zero instances of `circleGeometry`.
- **TC-431.07 [UC-LOC-BUFFER-ZONE-COMPLIANCE/MSS]**: Given `diorama_skyline.tsx` and `bitexco_tower_visuals.ts`, When reading physical lines, Then `diorama_skyline.tsx` is strictly under 350 LOC (buffer zone compliant).

---

## 5. Definition of Done (DoD)

- [ ] Plan audited and signed via `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_431_BITEXCO_AAA_LOTUS_SCULPT.md --auto-sign`.
- [ ] Adversarial challenge brief filed and addressed in `.agents/audit/PLAN_CHALLENGE_IMP-431.md`.
- [ ] Station 2: `tests/client/imp431_bitexco_aaa_lotus_sculpt.test.ts` authored with 7 atomic tests (Semantic RED verified).
- [ ] Station 2.5: Implementation complete in `src/client/3d/diorama/bitexco_tower_visuals.ts` and `src/client/3d/diorama/diorama_skyline.tsx` (All tests GREEN).
- [ ] Mechanical prefilter passes: `npm run prefilter -- src/client/3d/diorama/bitexco_tower_visuals.ts src/client/3d/diorama/diorama_skyline.tsx tests/client/imp431_bitexco_aaa_lotus_sculpt.test.ts`.
- [ ] 11 living diorama test suites pass 100% without regression (`imp67`, `imp68`, `imp69`, `imp71`, `imp84`, `imp197`, `imp371`, `imp379`, `imp385`, `time_of_day`, `miniature_city_diorama`).
- [ ] Visual capture executed via `node scripts/capture_visual_evidence.mjs --ticket IMP-431 --scenario default`.
- [ ] Chaos Sentinel AST mutation probe passes with 100% kill rate.
- [ ] Comprehensive evidence verified via `node scripts/check_evidence.mjs IMP-431`.
