# PLAN_IMP_404: Unified RenderTierProfile & Instanced Regional Buildings Pool (Phase 5.1)

## 1. Context & Architectural Goal
- **Source Strategy Report**: [`docs/reports/analysis/VTCOON_UNIFIED_BLENDER_MOBILE_AND_CROSSPLATFORM_REPORT.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/analysis/VTCOON_UNIFIED_BLENDER_MOBILE_AND_CROSSPLATFORM_REPORT.md) (Phase 5.1 — Hardened V3.0).
- **Strict Execution Order Gate**: **FORBIDDEN** to execute Station 2 implementation of `IMP-404` until Phase 4 (`IMP-403`) of `VTCOON_DESKTOP_ULTRA_STRATEGY_REPORT.md` is 100% completed and signed off.
- **Problem**: On Mobile (`isMobile === true`), [`src/client/3d/procedural_building.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/procedural_building.tsx) (`382 LOC`) currently mounts 3–4 separate `<RoundedBox>` / `<mesh>` primitives per built property (`60–80 Draw Calls` when 20 properties are built) while both `procedural_building.tsx` (`382 LOC`) and `board_tile.tsx` (`363 LOC`) sit above the `350 LOC` Buffer Zone threshold.
- **Refactor-First Solution**:
  1. **Refactor-First Deep Module Extraction**: Extract the 4-tier cross-platform capability resolver (`resolveRenderTierProfile`) and Frame-0 synchronous Blender 5.2 Baked-AO (`COLOR_0` Vertex-Color + Cavity AO) regional building meshes (`riverine`, `resort`, `heritage`, `metropolis` for C1 & C2, sculpted offline via `scripts/blender/build_mobile_regional_archetypes.py`) into `src/client/3d/procedural_mobile_blender_meshes.ts`, reducing `procedural_building.tsx` from `382` to `282 LOC` (`-100 LOC`) and `board_tile.tsx` from `363` to `345 LOC` (`-18 LOC`).
  2. **Channel-Split Dynamic Coloring, Zero-GC Instancing & Slam Animation Settlement (`[ADV-02]`)**: Create `src/client/3d/instanced_regional_buildings_pool.tsx` (`<InstancedRegionalBuildingsPool />`) using pre-allocated `<instancedMesh frustumCulled={false}>` pools for `COLOR_0` Baked-AO building hulls + a shared 22-slot `instanceColor` fascia/awning `<instancedMesh frustumCulled={false}>` updated via `setMatrixAt` and `setColorAt(groupColor)` inside `useLayoutEffect` AND animated during active construction/domino slams via a single `useSafeFrame` loop with a `wasSlammingRef` settlement pass (`0` runtime `mergeGeometries` calls, `< 0.02ms` CPU update).
  3. **Dual-Seam Living Test & Level-3 Landmark Preservation (`TC-378`, `TC-65` & `[ADV-01]`)**: `GameBoard` resolves `resolveRenderTierProfile({ isMobile })` (`[ADV-03]`), mounts `<InstancedRegionalBuildingsPool />`, and passes `renderProceduralBuilding={!isMobile || (levelMap[cell.index] ?? 0) === 3}` to `<LayeredDioramaTile />` (which defaults `renderProceduralBuilding = true` for standalone unit tests and always mounts `<ProceduralBuilding />` when `currentLevel === 3` so bespoke C3 landmarks and rotating crowns remain visible on Mobile). Inside `ProceduralBuilding`, `data-testid="shophouse-mobile-lod"`, `data-testid="complex-mobile-lod"`, and `DefaultBuildingBoxFallback` (1-mesh atomic fallback) are preserved using the shared Blender Baked-AO geometry.

### Principles Applied
- **View-Model Seam Extraction** -> Extracted `resolveRenderTierProfile`, `getMobileArchetypeGeometry`, and `computeRegionalBuildingPoolDescriptors` into pure testable seams decoupled from WebGL context.
- **Ephemeral TTL / Dead Man's Switch** -> `InstancedRegionalBuildingsPool` runs `useSafeFrame` only while `activeSlams` is non-empty and executes a deterministic `wasSlammingRef` settlement pass restoring base matrices (`[ADV-02]`).
- **Resource Disposal & Cache Hygiene** -> Pre-allocated `InstancedMesh` pools update via `setMatrixAt`/`setColorAt` with zero runtime `mergeGeometries` allocations; `disposeMobileArchetypeGeometries` releases cached GPU buffers on teardown.
- **Spatial AABB / Non-Occlusion** -> Preserves exact `getBuildingLotTransform` (`localZ = -1.38m`, corner splay `±0.24m`, `scale = 0.975`), sets `frustumCulled={false}` on all `<instancedMesh>` nodes, and enforces $\ge 20\text{mm}$ fascia clearance to prevent Android 16-bit depth Z-fighting.
- **100% DTO & Call-Site Wiring** -> Every field of `RenderTierProfile` and `RegionalBuildingPoolDescriptor` is actively consumed by `InstancedRegionalBuildingsPool`, `ProceduralBuilding`, and `GameBoard` (`[ADV-03]`).
- **Equivalence-Partition Testing** -> Partitioned across 4 hardware render tiers, 4 regional typologies $\times$ 2 levels (C1/C2), C3 bespoke landmark delegation (`[ADV-01]`), and Dual-Seam standalone vs board-level rendering.
- **Relational Multi-Point Assertion** -> Asserts relational vertex count and bounding-box differences across regional archetypes (`riverine` vs `resort` vs `heritage` vs `metropolis`) and DPR caps across tiers (`IOS_WEBKIT_TBDR < ANDROID_MOBILE < DESKTOP_BALANCED < DESKTOP_ULTRA`).

---

## 2. Target Files & Honest LOC Accounting

| File Path | Tier | Current LOC | Expected LOC | Net Delta | Max Allowed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/3d/procedural_mobile_blender_meshes.ts` | Tier 2 (3D) | 0 | 240 | +240 | 500 | Safe (New) |
| `src/client/3d/instanced_regional_buildings_pool.tsx` | Tier 2 (3D) | 0 | 235 | +235 | 500 | Safe (New) |
| `src/client/3d/procedural_building.tsx` | Tier 2 (3D) | 382 | 282 | ~ -100 | 500 | Safe (Refactored) |
| `src/client/3d/board_tile.tsx` | Tier 2 (3D) | 363 | 345 | ~ -18 | 500 | Safe (Refactored) |
| `src/client/3d/board_layout.tsx` | Tier 2 (3D) | 230 | 238 | +8 | 500 | Safe |
| `docs/FEATURE_MAP.md` | Docs | 92 | 94 | +2 | N/A | Safe |
| `tests/client/imp404_render_tier_and_instanced_buildings_pool.test.ts` | Living Test | 0 | 330 | +330 | 600 | Safe (New) |

---

## 3. Lean Type & Exported Symbol Contracts

**Target physical file**: `src/client/3d/procedural_mobile_blender_meshes.ts` (New file to be created in Station 1/2)
```typescript
import type { BufferGeometry } from 'three';
import type { RegionalTypology } from './building_typology';

export type RenderTierId = 'IOS_WEBKIT_TBDR' | 'ANDROID_MOBILE' | 'DESKTOP_BALANCED' | 'DESKTOP_ULTRA';

export interface RenderTierCapabilitiesInput {
  readonly isMobile?: boolean;
  readonly isIOS?: boolean;
  readonly deviceMemoryGb?: number;
  readonly hardwareConcurrency?: number;
}

export interface RenderTierProfile {
  readonly tierId: RenderTierId;
  readonly maxDpr: number;
  readonly activeFpsCap: number;
  readonly idleFpsCap: number;
  readonly buildingRenderMode: 'INSTANCED_POOL_VERTEX_AO' | 'BLENDER_GLB_STANDARD' | 'BLENDER_GLB_PBR_SHADOW';
  readonly monopolyArchwayMode: 'INSTANCED_POOL_SINGLE_MAT' | 'GLB_INSTANCE' | 'GLB_INSTANCE_SHADOW';
  readonly enableOuterBaySanctuaries: boolean;
  readonly enableDominoShockwave: boolean;
  readonly minVerticalStepMm: number;
}

export interface QuantizedVertexColorMeshData {
  readonly positions: Float32Array;
  readonly normals: Float32Array;
  readonly colors: Float32Array;
  readonly indices: Uint16Array;
}

export interface TypologyAwningTransform {
  readonly yOffset: number;
  readonly zOffset: number;
  readonly scale: readonly [number, number, number];
}

export const MOBILE_BUILDING_BLENDER_MESHES: Readonly<
  Record<RegionalTypology, { readonly c1: QuantizedVertexColorMeshData; readonly c2: QuantizedVertexColorMeshData }>
>;
export function resolveRenderTierProfile(input?: RenderTierCapabilitiesInput): RenderTierProfile;
export function getMobileArchetypeGeometry(typology: RegionalTypology, level: 1 | 2): BufferGeometry;
export function getMobileAwningBandGeometry(level: 1 | 2): BufferGeometry;
export function getTypologyAwningTransform(typology: RegionalTypology, level: 1 | 2): TypologyAwningTransform;
export function disposeMobileArchetypeGeometries(): void;
```

**Target physical file**: `src/client/3d/instanced_regional_buildings_pool.tsx` (New file to be created in Station 1/2)
```typescript
import type React from 'react';
import type { ActiveSlam } from '../store/vfx_store';
import type { RegionalTypology } from './building_typology';

export interface RegionalBuildingPoolDescriptor {
  readonly slotIndex: number;
  readonly cellIndex: number;
  readonly typology: RegionalTypology;
  readonly level: 0 | 1 | 2 | 3;
  readonly groupColor: string;
  readonly worldPosition: readonly [number, number, number];
  readonly awningWorldPosition: readonly [number, number, number];
  readonly awningScale: readonly [number, number, number];
  readonly rotationY: number;
  readonly scale: readonly [number, number, number];
}

export interface InstancedRegionalBuildingsPoolProps {
  readonly levelMap?: Readonly<Record<number, number>>;
  readonly isMobile?: boolean;
  readonly isIOS?: boolean;
}

export function computeRegionalBuildingPoolDescriptors(
  levelMap?: Readonly<Record<number, number>>,
  activeSlams?: Readonly<Record<number, ActiveSlam>> | null,
  nowMs?: number
): ReadonlyArray<RegionalBuildingPoolDescriptor>;
export function InstancedRegionalBuildingsPool(props: InstancedRegionalBuildingsPoolProps): React.ReactElement | null;
// Internal call-site wiring inside InstancedRegionalBuildingsPool:
// const tierProfile = resolveRenderTierProfile({ isMobile, isIOS });
// const descriptors = computeRegionalBuildingPoolDescriptors(levelMap, activeSlams);
// const bodyGeom = getMobileArchetypeGeometry(typology, level);
// const awningGeom = getMobileAwningBandGeometry(level);
// const awningTransform = getTypologyAwningTransform(typology, level);
// useSafeFrame updates instanceMatrix while activeSlams is non-empty and settles via wasSlammingRef ([ADV-02]);
// all <instancedMesh frustumCulled={false}>;
// useEffect(() => () => disposeMobileArchetypeGeometries(), []);
```

**Target physical file**: `src/client/3d/procedural_building.tsx`
- Export atomic 1-mesh safety net `export function DefaultBuildingBoxFallback(props: { readonly groupColor?: string; readonly level?: 1 | 2 | 3 }): React.ReactElement;` (`<= 15 LOC`), consumed inside `SafeGLTFModel` fallback when `url` fails.
- Refactor `ShophouseFallback` and `ComplexFallback` mobile branches (`isMobile === true`) to invoke `getMobileArchetypeGeometry(palette.typology, 1)`, `getMobileArchetypeGeometry(palette.typology, 2)`, `getMobileAwningBandGeometry(1)`, `getMobileAwningBandGeometry(2)`, and `getTypologyAwningTransform(palette.typology, level)`, rendering `<group data-testid="shophouse-mobile-lod" data-typology={palette.typology}>` and `<group data-testid="complex-mobile-lod" data-typology={palette.typology}>`.

**Target physical file**: `src/client/3d/board_tile.tsx`
- Add `readonly renderProceduralBuilding?: boolean;` (default `true`) to `LayeredDioramaTileProps`.
- Guard `<ProceduralBuilding ... />` with `{(renderProceduralBuilding || currentLevel === 3) && <ProceduralBuilding ... />}` (`[ADV-01]`) while preserving standalone default `renderProceduralBuilding = true` for `TC-378.04`.

**Target physical file**: `src/client/3d/board_layout.tsx`
- Import and invoke `resolveRenderTierProfile({ isMobile })` (`[ADV-03]`) and `InstancedRegionalBuildingsPool({ levelMap, isMobile })` (`<InstancedRegionalBuildingsPool levelMap={levelMap} isMobile={isMobile} />`) inside `<group visible={isBoardVisible}>`, and wire `disposeMobileArchetypeGeometries()` on cleanup.
- Pass `renderProceduralBuilding={!isMobile || (levelMap[cell.index] ?? 0) === 3}` (`[ADV-01]`) to `<LayeredDioramaTile />` inside `BOARD_CONFIG.map`.

**Target physical file**: `docs/FEATURE_MAP.md`
- Update Row 10 (`3D Graphics, Camera & Perf`) with `RenderTierProfile`, `InstancedRegionalBuildingsPool`, and `procedural_mobile_blender_meshes.ts` (`IMP-404`).

---

## 4. Station 1: Core Contract Invariants (`tests/client/imp404_render_tier_and_instanced_buildings_pool.test.ts`)

- **TC-404.01 [UC-RENDER-TIER-PROFILE-MATRIX/MSS]**: Given hardware capability inputs across iOS WebKit (`isMobile: true, isIOS: true`), Android (`isMobile: true, isIOS: false`), Desktop iGPU (`isMobile: false, deviceMemoryGb: 4`), and Desktop Ultra (`isMobile: false, deviceMemoryGb: 16, hardwareConcurrency: 12`), When calling `resolveRenderTierProfile`, Then returns deterministic `RenderTierProfile` objects with relational DPR ordering `0.82 < 1.00 < 1.25 < 2.00`, `buildingRenderMode: 'INSTANCED_POOL_VERTEX_AO'` on Mobile, `enableOuterBaySanctuaries: false` on Mobile vs `true` on Desktop, and `minVerticalStepMm >= 20`.
- **TC-404.02 [UC-FRAME0-LOWPOLY-TECTONICS-AND-BAKED-AO-ARCHETYPES/MSS]**: Given all 4 regional typologies (`riverine`, `resort`, `heritage`, `metropolis`) and levels `1 | 2`, When calling `getMobileArchetypeGeometry(typology, level)`, `getMobileAwningBandGeometry(level)`, and `getTypologyAwningTransform(typology, level)`, Then synchronously returns cached `BufferGeometry` instances at Frame 0 with sculpted Low-Poly Tectonics (`count >= 160` vertices for C1 and `count >= 220` vertices for C2 with recessed window/arch cavities, extruded cornices, and distinct regional roof silhouettes), non-flat `COLOR_0` Baked AO + vertical sun gradient ($\max(L) - \min(L) \ge 0.22$), distinct typology-aligned `yOffset` fascia transforms ($\ge 20\text{mm}$ Z-separation), and clean GPU disposal via `disposeMobileArchetypeGeometries()`.
- **TC-404.03 [UC-POOL-DESCRIPTOR-TRANSFORM-AND-SLAM-SETTLEMENT/MSS]**: Given `levelMap` transitions across 22 property cells (including corner-splayed cells `1, 9, 11, 19, 21, 29, 31, 39` and mid-side cells) and active construction slams across `elapsed = 0ms` (drop peak) and `elapsed >= 600ms` (settled), When calling `computeRegionalBuildingPoolDescriptors` and advancing `useSafeFrame` on `InstancedRegionalBuildingsPool`, Then maps built C1/C2 cells to exact world positions matching `getBuildingLotTransform` (`scale = 0.975`, corner splay `±0.24m`) and typology-specific `awningWorldPosition`/`awningScale`, collapses unbuilt (`level = 0`) and C3 slots to `scale: [0, 0, 0]`, modulates `worldPosition[1]` / `scale` during slam impact, and executes the `wasSlammingRef` settlement pass restoring `lotTransform.position[1]` (`0.16m`) with `0` `mergeGeometries` calls (`[ADV-02]`).
- **TC-404.04 [UC-INSTANCED-POOL-CALLSITE-AND-LEVEL3-DUAL-SEAM-PARITY/MSS]**: Given `GameBoard`, `InstancedRegionalBuildingsPool`, `LayeredDioramaTile`, and `ProceduralBuilding` rendered with `isMobile: true` vs `isMobile: false` across `level = 1, 2, 3`, When inspecting the component trees and running `useLayoutEffect`, Then `GameBoard` mounts `data-testid="instanced-regional-buildings-pool"` (`frustumCulled={false}`) with `instanceColor` fascia bands on Mobile while passing `renderProceduralBuilding={false}` for C1/C2 tiles and `renderProceduralBuilding={true}` for `level = 3` Landmark tiles (`[ADV-01]`), and preserves `data-testid="shophouse-mobile-lod"`, `data-testid="complex-mobile-lod"`, and `DefaultBuildingBoxFallback` when `ProceduralBuilding` or `LayeredDioramaTile` is rendered standalone.

---

## 5. Station 3 & 4 Verification & Evidence Plan
- **Mechanical Gates**:
  1. `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_404_RENDER_TIER_PROFILE_AND_INSTANCED_REGIONAL_BUILDINGS_POOL.md --auto-sign`
  2. `npm run prefilter -- src/client/3d/procedural_mobile_blender_meshes.ts src/client/3d/instanced_regional_buildings_pool.tsx src/client/3d/procedural_building.tsx src/client/3d/board_tile.tsx src/client/3d/board_layout.tsx tests/client/imp404_render_tier_and_instanced_buildings_pool.test.ts`
  3. Verify 100% pass on living contracts: `npx --yes vitest run tests/client/imp378_procedural_building_mobile_lod.test.ts tests/contracts/imp65_building_scale_corner_clearance_and_regional_typologies.test.ts tests/client/imp404_render_tier_and_instanced_buildings_pool.test.ts`
  4. `node scripts/capture_visual_evidence.mjs --ticket imp-404 --dual-viewport --scenario board_ownership_monopoly` (while `src/**` is static) -> `npm run sentinel -- --ticket imp-404 --test tests/client/imp404_render_tier_and_instanced_buildings_pool.test.ts` || `game-3d-visual-critic` -> `npm run report -- imp-404` -> `node scripts/check_evidence.mjs imp-404`.

## 6. Definition of Done (DoD)
- [ ] `scripts/blender/build_mobile_regional_archetypes.py` generates `public/models/buildings/mobile_archetypes_baked_ao.glb` and quantized `MOBILE_BUILDING_BLENDER_MESHES` (`>= 160` C1 / `>= 220` C2 vertices, recessed openings, extruded cornices, `COLOR_0` Baked AO $\Delta L \ge 0.22$) in `src/client/3d/procedural_mobile_blender_meshes.ts`.
- [ ] `InstancedRegionalBuildingsPool` renders C1–C2 regional buildings + typology-aligned `groupColor` fascia bands on Mobile (`frustumCulled={false}`) via `setMatrixAt` and `setColorAt` in `useLayoutEffect` and settles `useSafeFrame` slam animations via `wasSlammingRef` (`[ADV-02]`) with `0` runtime `mergeGeometries` calls.
- [ ] `procedural_building.tsx` (`<= 285 LOC`) and `board_tile.tsx` (`<= 348 LOC`) are refactored below the `350 LOC` Buffer Zone while preserving 100% of `TC-378`, `TC-65`, and Mobile Level-3 Landmarks (`[ADV-01]`).
- [ ] Chaos Sentinel achieves 100% mutation kill rate (`0` survived mutants) and `check_evidence.mjs` exits `0`.
