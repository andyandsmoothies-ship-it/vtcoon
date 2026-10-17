# Lean Plan: IMP-432 Indochine Tabletop Phase 1: Asphalt Road Purge & Executive Chassis Refinement

> **Ticket:** `IMP-432`  
> **Classification:** Tier 2 3D Graphics & Architectural Realism  
> **Subsystem Boundaries:** `src/client/3d/diorama/`, `tests/client/`  
> **Roadmap Alignment (Indochine Executive Tabletop Master Plan):**
> - **`Phase 0` (Completed):** Blender 5.2 Procedural Chassis Prototype (`board_chassis_walnut.glb`, 11.6 KB, 664 tris, 45° chamfered walnut & brushed brass inlay).
> - **`IMP-432` (Phase 1):** Purge toy asphalt roads & zebra crossings across Desktop & Mobile, wiring the serene diorama landscape.
> - **`Phase 2` (Upcoming):** 40 Inlaid Ivory Marble deeds & Sunken Velvet Dong Son Dice Arena ($Y = -0.02$).
> - **`Phase 3` (Upcoming):** Curving S-shaped Saigon River spline, stone embankments, and tropical biome (frangipani & palms).

---

## 1. Principles Applied

- **[Anti-Box-Reductionism Guard]** -> Replaced flat planar box tray with authentic 45-degree chamfered walnut wood rails and brushed brass metallic inlay trim, matching the approved luxury Indochine concept art.
- **[View-Model Seam Extraction & Two-Stage Decoupling]** -> Preserved 100% of existing geometry generators (`createBatchedTerrainGeometries`) and material tokens (`#1E293B`, `#334155`, `#CBD5E1`, `#FFFFFF`) to shield living contract tests (`imp375`, `imp400`, `urban_diorama_redesign`), while introducing canonical `isSereneTabletop` mode across the diorama hierarchy to eliminate toy asphalt roads in production.
- **[Spatial AABB / Non-Occlusion & Raycast Bypass]** -> The executive chassis spans $22.4\text{m} \times 22.4\text{m}$ ($X, Z \in [-11.2, 11.2]$), seated under pawns (`BASE_PAWN_Y = 0.45` in `pawn_path.ts`).
- **[Resource Disposal & Cache Hygiene]** -> Single-material GLB chassis footprint is strictly bounded under 16 KB and 700 triangles (actual 664 tris with bevels), requiring exactly 1 draw call and eliminating 12 redundant draw calls from 37 asphalt sub-meshes.
- **[100% DTO & Call-Site Wiring]** -> `isSereneTabletop` is cleanly wired through `miniature_city_diorama.tsx` -> `diorama_terrain.tsx` -> `batched_diorama_terrain.tsx`.

---

## 2. Target Files & Honest LOC Accounting

| File Path | Tier | Current LOC | Expected LOC | Net Delta | Max Allowed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/3d/diorama/batched_diorama_terrain.tsx` | Tier 2 3D Component | 136 | 155 | +19 | 400 | Safe (Preserves geom cache, adds isSereneTabletop support) |
| `src/client/3d/diorama/diorama_terrain.tsx` | Tier 2 3D Component | 73 | 82 | +9 | 400 | Safe (Passes isSereneTabletop to BatchedDioramaLandmasses) |
| `src/client/3d/miniature_city_diorama.tsx` | Tier 2 3D Component | 373 | 382 | +9 | 500 | Safe (Coordinates isSereneTabletop to DioramaTerrain) |
| `tests/client/imp432_indochine_tabletop_phase_1.test.ts` | New Living Test Suite | 0 | 185 | +185 | 600 | Safe (Station 2 contract suite) |

---

## 3. Core Contract Invariants & Architectural Seams

1. **[INV-432.01: Executive Chassis Asset Geometry & PBR Material Parity]**:
   - `public/models/board/board_chassis_walnut.glb` maintains physical bounding box:
     - Width $X \in [-11.20, +11.20]$ ($\Delta X = 22.40\text{m} \pm 0.05$)
     - Depth $Z \in [-11.20, +11.20]$ ($\Delta Z = 22.40\text{m} \pm 0.05$)
     - Height $Y \in [-0.25, +0.124]$ ($\Delta Y = 0.374\text{m} \pm 0.01$)
     - Triangle budget $\le 700$ tris (actual 664 tris), file size $\le 32\text{ KB}$ (actual 11.6 KB).
   - Features 2 PBR material slots: `Mat_Executive_Walnut` (`#27170E`, roughness 0.26) and `Mat_Brushed_Brass` (`#D4AF37`, metallic 0.96, roughness 0.20).

2. **[INV-432.02: Serene Terrain Mode & Asphalt Road Purge (Desktop & Mobile)]**:
   - In `BatchedDioramaLandmasses`:
     - Accepts `isSereneTabletop?: boolean` and `showRoads?: boolean`.
     - When `isSereneTabletop === true` and `showRoads !== true`:
       - Suppresses rendering of West boulevard (`#1E293B`), East promenade (`#334155`), sidewalks (`#CBD5E1`), and 37 road markings (`#FFFFFF`), eliminating 12 draw calls on both Desktop and Mobile.
       - Preserves foundation soil (`soilGeom`) and grass lawn (`grassGeom`), expanding the pristine green diorama landscape.
     - When called without props (or `showRoads === true`):
       - Defaults to rendering all sub-meshes, maintaining 100% backward compatibility with living tests (`imp375`, `imp400`, `urban_diorama_redesign`).

3. **[INV-432.03: Presentation Wiring across Diorama Root Hierarchy]**:
   - In `miniature_city_diorama.tsx`:
     - Evaluates `const isSerene = isDesktopLean || isMobile;`
     - Passes `<DioramaTerrain isSereneTabletop={isSerene} />`.
   - In `diorama_terrain.tsx`:
     - Accepts `isSereneTabletop?: boolean`.
     - Forwards `<BatchedDioramaLandmasses isSereneTabletop={isSereneTabletop} />`.

4. **[INV-432.04: Living Test Contract Parity Guard]**:
   - `DioramaTerrain` and `BatchedDioramaLandmasses` preserve default zero-prop parameters ensuring living tests in `tests/client/urban_diorama_redesign.test.ts` and `tests/client/imp375_diorama_static_batching.test.ts` pass without regression.

### 3.1 Call-Site Wiring across Subsystems

```typescript
// 1. In batched_diorama_terrain.tsx
export interface BatchedDioramaLandmassesProps {
  readonly isSereneTabletop?: boolean;
  readonly showRoads?: boolean;
}

// 2. In diorama_terrain.tsx
export interface DioramaTerrainProps {
  readonly isSereneTabletop?: boolean;
}

// 3. In miniature_city_diorama.tsx
<DioramaTerrain isSereneTabletop={isDesktopLean || isMobile} />
```

---

## 4. Contract Test Scenarios (Station 2 Specification)

- **TC-432.01 [UC-CHASSIS-PHYSICAL-ASSET-BOUNDS/MSS]**: Given `public/models/board/board_chassis_walnut.glb`, When analyzing file and geometry metrics, Then file size $\le 32\text{KB}$, triangle count $\le 700$ (actual 664), width $\ge 22.0\text{m}$, and depth $\ge 22.0\text{m}$.
- **TC-432.02 [UC-SERENE-TERRAIN-ASPHALT-PURGE/MSS]**: Given `BatchedDioramaLandmasses` with `isSereneTabletop: true`, When inspecting rendered markup, Then suppresses asphalt color `#1E293B` and markings `#FFFFFF`, rendering exclusively pristine soil and grass.
- **TC-432.03 [UC-TERRAIN-BACKWARD-COMPATIBILITY/MSS]**: Given `BatchedDioramaLandmasses` called with zero arguments or `showRoads: true`, When inspecting markup, Then preserves 100% of all 4 colors (`#1E293B`, `#334155`, `#CBD5E1`, `#FFFFFF`) ensuring living test parity with `imp375` and `imp400`.
- **TC-432.04 [UC-DIORAMA-TERRAIN-PROP-FORWARDING/MSS]**: Given `DioramaTerrain` rendered with `isSereneTabletop: true`, When checking child nodes, Then passes `isSereneTabletop: true` to `BatchedDioramaLandmasses`.
- **TC-432.05 [UC-MINIATURE-CITY-DIORAMA-WIRING/MSS]**: Given `MiniatureCityDiorama` rendered with `isDesktopLean: true`, When capturing tree, Then forwards `isSereneTabletop: true` to `DioramaTerrain`.

---

## 5. Definition of Done (DoD) & Stopping Criteria

- [x] Plan audited and signed via `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_432_INDOCHINE_TABLETOP_PHASE_1.md --auto-sign`.
- [x] Blind adversarial challenge brief filed and addressed in `.agents/audit/PLAN_CHALLENGE_IMP-432.md`.
- [ ] Station 2: `tests/client/imp432_indochine_tabletop_phase_1.test.ts` authored with 5 atomic tests (Semantic Behavioral RED verified).
- [ ] Station 2.5: Implementation complete in `batched_diorama_terrain.tsx`, `diorama_terrain.tsx`, and `miniature_city_diorama.tsx` (All tests GREEN).
- [ ] Mechanical prefilter passes: `npm run prefilter -- src/client/3d/diorama/batched_diorama_terrain.tsx src/client/3d/diorama/diorama_terrain.tsx src/client/3d/miniature_city_diorama.tsx tests/client/imp432_indochine_tabletop_phase_1.test.ts`.
- [ ] Zero regression on living diorama test suites (`imp375`, `imp400`, `imp107`, `imp429`, `urban_diorama_redesign`).
- [ ] Physical visual capture executed via `node scripts/capture_visual_evidence.mjs --ticket IMP-432 --scenario board_ownership_monopoly`.
- [ ] Comprehensive evidence verified via `node scripts/check_evidence.mjs IMP-432`.
