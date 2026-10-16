# PLAN_IMP_405: Diorama Static Blender Batches, Saigon Cathedral Realism & Mobile Draw-Call Diet (Phase 5.2)

## 1. Context & Architectural Goal
- **Source Strategy Reports**: [`VTCOON_UNIFIED_BLENDER_MOBILE_AND_CROSSPLATFORM_REPORT.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/analysis/VTCOON_UNIFIED_BLENDER_MOBILE_AND_CROSSPLATFORM_REPORT.md) (Phase 5.2 — V4.0) & [`VTCOON_ARCHITECTURAL_REALISM_AND_MATURE_TONE_REPORT.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/analysis/VTCOON_ARCHITECTURAL_REALISM_AND_MATURE_TONE_REPORT.md).
- **Strict Execution Order Gate**: Executes strictly after `IMP-403` and `IMP-404` complete Station 4 sign-off.
- **Problem**:
  1. **Mobile Draw-Call Bloat**: [`src/client/3d/miniature_city_diorama.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/miniature_city_diorama.tsx) (`365 LOC >= 350 LOC` Buffer Zone) and its child districts mount **73 static meshes/RoundedBoxes on Desktop** (`8` in `DioramaBoardRim`, `39` in [`DioramaContainerPort`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_container_port.tsx), and `26` in [`DioramaHeritageDistrict`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_heritage_district.tsx)).
  2. **Saigon Notre Dame Cathedral Architectural & Urban Planning Failure**: `landmark_cathedral.glb` previously resembled two rudimentary cones on a box (`~1.0m` tall) and was visually boxed in by 24 tall `CHO_LON_SHOPHOUSES` (`height = 0.42m–0.68m` + `0.2m` roof = `0.88m` at `Z = 5.35..5.95` and `X = -5.6`), juvenile pink Donut (`🍩`) / Coffee Cup (`☕`) 3D rooftop signs directly in front of the Cathedral ([`diorama_shophouse_blocks.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_shophouse_blocks.tsx)), and wide `HIGHRISE_CONFIGS` (`width = 0.46m–0.52m`, `Z = -2.8`) crowding the Northern backdrop ([`diorama_highrise_blocks.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_highrise_blocks.tsx)).
- **Refactor-First Solution, Architectural Realism & Living Contract Preservation**:
  1. **Blender 5.2 Low-Poly Tectonics Cathedral (`<= 1,500 Tris`) & Singleton Batches**: Create `scripts/blender/build_heritage_cathedral_and_diorama.py` to sculpt `public/models/landmarks/landmark_cathedral.glb` (`1,162 triangles <= 1,500 tris`, `89.7 KB <= 200 KB` preserving `TC-IMP29.5/MSS-03 & 04` in `tests/client/landmark_models.test.ts`, with `ShaderNodeVertexColor` `COLOR_0` wired into `Principled BSDF` `Base Color`) with cruciform Nave + Transept + 6-segment Apse, 3 recessed Romanesque portals, extruded Rose Window (`6 segments`), twin 6-tier bell towers (`#B45309` Marseille brick, white stringcourses, stepped louvred lancets, octagonal spires, 4-sided corner pinnacles, height **`1.42m`**, footprint **`0.68m × 0.76m`** at `local Z = 0.88m`, `Z_min = 0.50m`, maintaining `0.17m >= 0.15m` edge-to-edge AABB separation from `cong-xa-paris-plaza` at `local Z = -0.22m`, `R = 0.55m`, `Z_max = 0.33m`), and extract `src/client/3d/diorama/diorama_static_blender_batches.ts` (`<= 248 LOC`).
  2. **District 1 Urban Sightline Liberation (Zero Test Regression)**:
     - In [`diorama_shophouse_blocks.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_shophouse_blocks.tsx): Remove the pink Donut (`🍩`) and Coffee Cup (`☕`) meshes while retaining `Biển Sàn HOSE` inside `data-testid="diorama-rooftop-signs"` (preserving `TC-CPTB02.14 & 02.15`), lower `CHO_LON_SHOPHOUSES` (`24` units) heights to authentic low-rise heritage proportions **`0.22m–0.32m`** (`<= 0.34m`, $< 1/4$ of the `1.42m` Cathedral), and recede their coordinates (`distance >= 1.35m` from `[-4.3, 3.65]` within `X in [-6.0, -3.0], Z in [1.5, 6.5]`, preserving `TC-68.01`, `TC-68.09`, `TC-68.12`, and `TC-IMP31`).
     - In [`diorama_highrise_blocks.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_highrise_blocks.tsx): Slim `HIGHRISE_CONFIGS` (`10` towers) cross-sections to `width/depth = 0.32m–0.36m` and recede foreground towers to `Z <= -3.3` (preserving `TC-68.10..11`, `TC-69.12..15`, `TC-70.21..24`, `TC-84.13`).
  3. **Save `58` Meshes / `60` Daytime Draw Calls on Mobile (`73 -> 15` Meshes)**: Consolidate `DioramaBoardRim` (`isMobile: true` $\rightarrow$ `2` meshes vs `8` on Desktop, saving `6` draw calls for `TC-356`), `DioramaContainerPort` (`isMobile: true` $\rightarrow$ `5` meshes [`3` daytime meshes + `2` night strobes `#EF4444`] vs `39` on Desktop, saving `34` meshes / `36` daytime draw calls for `TC-337`/`TC-400`), and `DioramaHeritageDistrict` (`isMobile: true` $\rightarrow$ `8` meshes [`1` plaza box + `2` Cathedral batches + `3` stepped terrace cylinders + `2` Paris plaza batches] vs `26` on Desktop, saving `18` draw calls for `TC-400.11`/`TC-371.08`).

### Principles Applied
- **View-Model Seam Extraction** -> Extracted pure singleton geometry builders (`getBatchedBoardRimGeometries`, `getBatchedMobileContainerPortGeometries`, `getBatchedMobileHeritageGeometries`) and `URBAN_TREES` into `diorama_static_blender_batches.ts`.
- **Resource Disposal & Cache Hygiene** -> Module-level Singleton Cached `BufferGeometry` (`0` per-render allocations); `disposeDioramaStaticBlenderBatches()` disposes GPU buffers and resets cache references to `null` (`[ADV-03]`, bound to `import.meta.hot.dispose`).
- **Spatial AABB / Non-Occlusion** -> Cathedral footprint (`0.68m × 0.76m`, height `1.42m` at `[0.2, 0, 0.88]`, `Z_min = 0.50m`) clears `cong-xa-paris-plaza` (`[0.2, 0, -0.22]`, `R = 0.55m`, `Z_max = 0.33m`) with `0.17m >= 0.15m` edge-to-edge AABB separation and Metro tracks (`X = -7.0m`); low-rise `CHO_LON_SHOPHOUSES` (`height <= 0.34m`, `distance >= 1.35m`) liberate the Isometric Sightline Cone.
- **100% DTO & Call-Site Wiring** -> Every geometry field in `BatchedBoardRimGeometries`, `BatchedMobileContainerPortGeometries`, and `BatchedMobileHeritageGeometries` is wired into `DioramaBoardRim`, `DioramaContainerPort`, and `DioramaHeritageDistrict`.
- **Equivalence-Partition Testing** -> Partitioned across Mobile (`isMobile: true`) vs Desktop (`isMobile: false`), singleton cache hit vs disposal reset, and Cathedral Low-Poly Tectonics (`<= 1,500 tris`) vs urban sightline clearance.
- **Relational Multi-Point Assertion** -> Verifies Cathedral height dominance (`cathedralHeight >= 4 * maxShophouseHeight`), mobile mesh count reduction (`mobileMeshes.length === 5` vs `desktopMeshes.length >= 25`), and Baked AO luminance variance ($\Delta L \ge 0.22$).

---

## 2. Target Files & Honest LOC Accounting

| File Path | Tier | Current LOC | Expected LOC | Net Delta | Max Allowed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/3d/diorama/diorama_static_blender_batches.ts` | Tier 2 (3D) | 0 | 246 | +246 | 500 | Safe (New) |
| `src/client/3d/miniature_city_diorama.tsx` | Tier 2 (3D) | 365 | 328 | ~ -37 | 500 | Safe (Refactored) |
| `src/client/3d/diorama/diorama_container_port.tsx` | Tier 2 (3D) | 291 | 246 | ~ -45 | 500 | Safe (Refactored) |
| `src/client/3d/diorama/diorama_heritage_district.tsx` | Tier 2 (3D) | 337 | 286 | ~ -51 | 500 | Safe (Refactored) |
| `src/client/3d/diorama/diorama_shophouse_blocks.tsx` | Tier 2 (3D) | 136 | 100 | ~ -36 | 500 | Safe (Refactored) |
| `src/client/3d/diorama/diorama_highrise_blocks.tsx` | Tier 2 (3D) | 229 | 228 | ~ -1 | 500 | Safe (Refactored) |
| `docs/FEATURE_MAP.md` | Docs | 92 | 92 | +0 | N/A | Safe |
| `tests/client/imp405_diorama_static_blender_batches.test.ts` | Living Test | 0 | 428 | +428 | 600 | Safe (New) |

---

## 3. Lean Type & Exported Symbol Contracts

**Target physical file**: `src/client/3d/diorama/diorama_static_blender_batches.ts` (New file to be created in Station 1/2)
```typescript
import type { BufferGeometry } from 'three';

export interface UrbanTreeConfig {
  readonly x: number;
  readonly z: number;
  readonly color: string;
  readonly height: number;
  readonly radius: number;
}

export interface BatchedBoardRimGeometries {
  readonly walnutRimGeom: BufferGeometry;
  readonly brassTrimGeom: BufferGeometry;
}

export interface BatchedMobileContainerPortGeometries {
  readonly portStructuresVertexAoGeom: BufferGeometry;
  readonly gantryCranesVertexAoGeom: BufferGeometry;
}

export interface BatchedMobileHeritageGeometries {
  readonly cathedralBodyVertexAoGeom: BufferGeometry;
  readonly cathedralAccentsGeom: BufferGeometry;
  readonly parisStatueAndPedestalGeom: BufferGeometry;
  readonly parisStreetlampsGeom: BufferGeometry;
}

export const URBAN_TREES: ReadonlyArray<UrbanTreeConfig>;
export function getBatchedBoardRimGeometries(): BatchedBoardRimGeometries;
export function getBatchedMobileContainerPortGeometries(): BatchedMobileContainerPortGeometries;
export function getBatchedMobileHeritageGeometries(): BatchedMobileHeritageGeometries;
export function disposeDioramaStaticBlenderBatches(): void;
```

**Target physical file**: `src/client/3d/miniature_city_diorama.tsx`
- Import `URBAN_TREES`, `getBatchedBoardRimGeometries`, and `disposeDioramaStaticBlenderBatches` from `./diorama/diorama_static_blender_batches`.
- Update `DioramaBoardRim({ isMobile = false }: { readonly isMobile?: boolean } = {})` (`[ADV-01]`): when `isMobile === true`, render 2 `<mesh>` elements (`walnutRimGeom` `#78350F` and `brassTrimGeom` `#D97706`); when `isMobile === false` (default), preserve the 8 `<boxGeometry>` meshes for `TC-356.01` & `TC-356.03`. Bind `disposeDioramaStaticBlenderBatches()` in `import.meta.hot.dispose` (`[ADV-03]`). Leave `CentralMonumentPlaza`, `DioramaSkyline`, and `DioramaBridges` untouched.

**Target physical file**: `src/client/3d/diorama/diorama_container_port.tsx`
- When `isMobile === true`, preserve `<mesh position={[-0.85, 0.0925, 0]}>` (`<boxGeometry args={[0.08, 0.025, 2.16]} />`, `#FACC15`), preserve the 2 night-gated aviation beacons `<mesh visible={isNight}><sphereGeometry args={[0.02, 6, 6]} /><meshBasicMaterial color="#EF4444" /></mesh>` (`[ADV-02]`, `TC-337.02`/`TC-337.03`), and render the 2 Singleton Baked-AO `<mesh>` nodes from `getBatchedMobileContainerPortGeometries()`.

**Target physical file**: `src/client/3d/diorama/diorama_heritage_district.tsx`
- Position `HeritageCathedralGroup` at `position={[0.2, 0, 0.88]}` (`Z_min = 0.50m`) and `cong-xa-paris-plaza` at `position={[0.2, 0, -0.22]}` (`R = 0.55m`, `Z_max = 0.33m`) so the `0.68m × 0.76m × 1.42m` Cruciform Romanesque-Gothic volume maintains `0.17m >= 0.15m` edge-to-edge AABB separation from `cong-xa-paris-plaza`.
- Invoke `getBatchedMobileHeritageGeometries()` in `CathedralProceduralFallback` (`isMobile === true`) to render `cathedralBodyVertexAoGeom` (height `1.42m`) + `cathedralAccentsGeom` (`#0284C7` Rose Window + `#F59E0B` Brass Crosses), and in `cong-xa-paris-plaza` (`isMobile === true`) to keep the 3 stepped `<cylinderGeometry>` terrace meshes (`y = 0.012, 0.032, 0.050`) and render `parisStatueAndPedestalGeom` (`#CBD5E1` + `#F8FAFC`) + `parisStreetlampsGeom` (`#334155` + `#FDE047`), binding `color="#FFFFFF" vertexColors={true}` across all 4 batched materials.

**Target physical file**: `src/client/3d/diorama/diorama_shophouse_blocks.tsx`
- Lower `CHO_LON_SHOPHOUSES` (`24` configs) heights to `0.22m–0.32m` (`<= 0.34m`) and recede coordinates to `Z = 5.65..6.20` and `X = -5.75` (`Math.hypot(x - (-4.3), z - 3.65) >= 1.35m` within `X in [-6.0, -3.0], Z in [1.5, 6.5]`). Remove the Donut (`🍩`) and Coffee (`☕`) sign groups from `data-testid="diorama-rooftop-signs"`, keeping only `Biển Sàn HOSE` (`#10B981`).

**Target physical file**: `src/client/3d/diorama/diorama_highrise_blocks.tsx`
- Slim `HIGHRISE_CONFIGS` (`10` configs) `width` and `depth` to `0.32m–0.36m` and recede foreground towers (`tower-7..10`) to `Z <= -3.3` (`<= -2.4` and `>= 0.85m` from Bitexco `[-4.5, -4.4]`).

**Target physical file**: `docs/FEATURE_MAP.md`
- Update Row 13 (`3D Kinematics & Presentation`) with `diorama_static_blender_batches.ts` Mobile Draw-Call Diet (`-58` meshes / `-60` daytime Draw Calls) & District 1 Cathedral Sightline Masterplan (`IMP-405`).

---

## 4. Station 1: Core Contract Invariants (`tests/client/imp405_diorama_static_blender_batches.test.ts`)

- **TC-405.01 [UC-STATIC-BLENDER-BATCHES-SINGLETON-AND-DISPOSAL/MSS]**: Given `getBatchedBoardRimGeometries`, `getBatchedMobileContainerPortGeometries`, and `getBatchedMobileHeritageGeometries`, When invoked repeatedly, reset via `disposeDioramaStaticBlenderBatches()`, and invoked again, Then returns identical singleton `BufferGeometry` references on cache hit with valid `position`, `normal`, and `color` (`COLOR_0` Baked AO, $\Delta L \ge 0.22$) attributes, disposes all GPU buffers on reset, and lazily allocates fresh non-disposed geometries on subsequent calls (`[ADV-03]`).
- **TC-405.02 [UC-CATHEDRAL-TECTONICS-AND-URBAN-SIGHTLINE-LIBERATION/MSS]**: Given `public/models/landmarks/landmark_cathedral.glb`, `DioramaHeritageDistrict`, `SHOPHOUSE_CONFIGS` (`diorama_shophouse_blocks.tsx`), and `HIGHRISE_CONFIGS` (`diorama_highrise_blocks.tsx`), When inspecting physical model budgets and spatial coordinates, Then `landmark_cathedral.glb` satisfies Low-Poly Tectonics budget (`1000 <= triangles <= 1500`, `sizeBytes <= 200 KB`), `cathedralBodyVertexAoGeom` reaches monumental height `>= 1.38m` (`> 4x` max `CHO_LON_SHOPHOUSES` height `<= 0.34m`), all 24 `CHO_LON_SHOPHOUSES` maintain clearance `>= 1.35m` from `[-4.3, 3.65]`, `diorama-rooftop-signs` contains `HOSE` with `0` Donut (`🍩` / `#EC4899`) or Coffee (`☕`) meshes, and all 10 `HIGHRISE_CONFIGS` have slim profile `width <= 0.38m` and `z <= -3.3`.
- **TC-405.03 [UC-BOARD-RIM-AND-CONTAINER-PORT-MOBILE-BATCH-PARITY/MSS]**: Given `DioramaBoardRim` and `DioramaContainerPort` rendered with `isMobile: true` vs `isMobile: false`, When inspecting component trees, Then `DioramaBoardRim({ isMobile: true })` mounts 2 `<mesh>` (`#78350F` + `#D97706`) vs 8 on Desktop (`[ADV-01]`), and `DioramaContainerPort({ isMobile: true })` mounts 3 daytime-visible `<mesh>` (3D yellow curb `height = 0.025m` + `mobile-batched-port-hull` + `mobile-batched-port-cranes`) plus 2 night-gated `#EF4444` strobes (`[ADV-02]`), reducing mobile draw calls by `40` (`42` in daytime).
- **TC-405.04 [UC-HERITAGE-MOBILE-BATCH-AND-TERRACE-PARITY/MSS]**: Given `DioramaHeritageDistrict` and `CathedralProceduralFallback` rendered with `isMobile: true` vs `isMobile: false`, When inspecting the component tree, Then `isMobile: true` places `HeritageCathedralGroup` at `position={[0.2, 0, 0.88]}` with `>= 0.15m` edge-to-edge AABB separation from `cong-xa-paris-plaza` (`position={[0.2, 0, -0.22]}`, `R = 0.55m`), preserves the volumetric plaza `boxGeometry` (`height >= 0.02m`), `SafeGLTFModel` `forceFallback={true}`, and the 3 stepped `cylinderGeometry` garden tiers, while batching the Cathedral fallback and Paris Plaza lamps/statue into 4 `COLOR_0` (`vertexColors: true`, `color: '#FFFFFF'`) meshes (`26 -> 8` meshes, saving `18` draw calls).

---

## 5. Station 3 & 4 Verification & Evidence Plan
- **Mechanical Gates**:
  1. `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_405_DIORAMA_STATIC_BLENDER_BATCHES_AND_MOBILE_DRAWCALL_DIET.md --auto-sign`
  2. `npm run prefilter -- src/client/3d/diorama/diorama_static_blender_batches.ts src/client/3d/miniature_city_diorama.tsx src/client/3d/diorama/diorama_container_port.tsx src/client/3d/diorama/diorama_heritage_district.tsx src/client/3d/diorama/diorama_shophouse_blocks.tsx src/client/3d/diorama/diorama_highrise_blocks.tsx tests/client/imp405_diorama_static_blender_batches.test.ts`
  3. Verify 100% pass on living contracts: `npx --yes vitest run tests/client/landmark_models.test.ts tests/client/chrome_pawns_and_toy_buildings.test.ts tests/client/dense_metropolis_core_visual.test.ts tests/contracts/imp67_realistic_center_diorama_and_straight_corner.test.ts tests/contracts/imp68_cathedral_breathing_room_and_financial_skyline.test.ts tests/contracts/imp69_bitexco_skyline_and_cathedral_standout.test.ts tests/contracts/imp70_architectural_masterplan_and_tile_art.test.ts tests/contracts/imp84_bitexco_waterfront_skyline_realism.test.ts tests/client/imp356_android_depth_and_dice_landing.test.ts tests/client/imp337_diorama_mobile_freezing.test.ts tests/client/imp379_miniature_city_diorama_mobile_lod.test.ts tests/client/imp400_android_depth_and_terrain_zfighting.test.ts tests/client/imp371_mobile_diorama_draw_call_purge.test.ts tests/client/imp405_diorama_static_blender_batches.test.ts`
  4. `node scripts/capture_visual_evidence.mjs --ticket imp-405 --dual-viewport --scenario board_ownership_monopoly` -> `npm run sentinel -- --ticket imp-405 --test tests/client/imp405_diorama_static_blender_batches.test.ts` || `game-3d-visual-critic` -> `npm run report -- imp-405` -> `node scripts/check_evidence.mjs imp-405`.

## 6. Definition of Done (DoD)
- [ ] `scripts/blender/build_heritage_cathedral_and_diorama.py` generates `public/models/landmarks/landmark_cathedral.glb` (`1,100–1,450 tris <= 1,500 tris`, `<= 200 KB`, height `1.42m`, Cruciform Romanesque-Gothic + Baked AO) and populates `diorama_static_blender_batches.ts`, saving 58 Draw Calls on Mobile.
- [ ] `diorama_shophouse_blocks.tsx` removes the Donut (`🍩`) and Coffee (`☕`) signs (keeping `HOSE`), lowers `CHO_LON_SHOPHOUSES` to `0.22m–0.32m` (`distance >= 1.35m` from Cathedral), and `diorama_highrise_blocks.tsx` slims tower widths to `0.32m–0.36m` at `Z <= -3.3`.
- [ ] `miniature_city_diorama.tsx` (`<= 330 LOC`), `diorama_container_port.tsx` (`<= 250 LOC`), `diorama_heritage_district.tsx` (`<= 290 LOC`), `diorama_shophouse_blocks.tsx` (`<= 105 LOC`), and `diorama_highrise_blocks.tsx` (`<= 230 LOC`) pass all living contracts with zero regressions.
- [ ] Chaos Sentinel achieves 100% mutation kill rate and `check_evidence.mjs` exits `0`.
