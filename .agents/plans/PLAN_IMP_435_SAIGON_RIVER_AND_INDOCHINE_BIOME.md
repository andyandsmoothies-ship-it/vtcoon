# Implementation Plan: IMP-435 S-Shaped Saigon River Spline & Indochine Botanical Biome

## 1. Physical Surface Area & Target Files
| Target File | Tier | Current LOC | Expected LOC | Net Delta | Subsystem | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/3d/diorama/diorama_terrain.tsx` | Tier 2 | 80 | 101 | +21 | client-3d | Hardened |
| `src/client/3d/miniature_city_diorama.tsx` | Tier 2 | 394 | 411 | +17 | client-3d | Hardened |
| `src/client/3d/diorama/diorama_harbor_cruiser.tsx` | Tier 2 | 124 | 125 | +1 | client-3d | Hardened |
| `tests/client/imp435_saigon_river_and_indochine_biome.test.ts (New)` | Living Tests (New) | 0 | 210 | +210 | client-3d | New |

> **Architecture Commitment (LOC Buffer Zone Guard)**: `miniature_city_diorama.tsx` reaches 413 LOC (< 500 Tier 2 ceiling). Any subsequent diorama feature slice MUST execute a Refactor-First step extracting `DioramaUrbanCanopy` or `DioramaBoardRim` into standalone submodules (`src/client/3d/diorama/diorama_urban_canopy.tsx`) to return the file to <= 300 LOC.

## 2. Core Contract Invariants
- **[INV-RIVER-SPLINE-ASSET-AND-URL]**: `SAIGON_RIVER_SPLINE_MODEL_URL = '/models/board/saigon_river_spline.glb'`. Asset <= 48KB (actual 46.8KB), <= 1500 tris (actual 960), S-curve reaches apex $X \ge 2.60\text{m}$ at $Z = 0$, aligning under bridges at $|X| \le 0.10\text{m}$ at $Z = \pm 3.8\text{m}$, with 0 vertices penetrating $R < 1.68\text{m}$ of the Sunken Arena.
- **[INV-BIOME-ASSET-AND-URL]**: `INDOCHINE_BIOME_MODEL_URL = '/models/board/indochine_botanical_biome.glb'`. Asset <= 130KB (actual 121.3KB), <= 2500 tris (actual 1994), contains 3 materials (`Mat_IndochineBark` #5D4037, `Mat_TropicalFoliage` #2E7D32, `Mat_FrangipaniBlossom` #FFFDF0).
- **[INV-DIORAMA-TERRAIN-TABLETOP-PARITY]**: `DioramaTerrain({ isSereneTabletop?: boolean })` preserves `data-testid="diorama-river-waves"`, `data-testid="diorama-park-relief"`, `#64748B`, and `#15803D` in both modes, mounting `SafeGLTFModel` with `SAIGON_RIVER_SPLINE_MODEL_URL` when `isSereneTabletop = true`.
- **[INV-URBAN-CANOPY-HOOK-INTEGRITY-AND-BIOME]**: `DioramaUrbanCanopy` preserves unconditional top-level `useEffect` (0 React Hook violations) and root `data-testid="diorama-urban-canopy"`; renders JSX ternary mounting `SafeGLTFModel` with `fallback={<></>}` when `isSereneTabletop = true`, while rendering 3 `instancedMesh` layers when `false`.
- **[INV-MOORED-CRUISER-MARINA-DOCKING]**: `DioramaHarborCruiser({ isMoored: true })` docks at $X = 1.60\text{m}, Z = 2.2\text{m}$ floating in the expanded river basin ($X \in [0.74, 2.59]$), satisfying $Z = 2.2\text{m}$ and eliminating rock embankment collisions.
- **[INV-MINIATURE-CITY-DIORAMA-DUAL-WIRING]**: `MiniatureCityDiorama` passes `isSereneTabletop={isSerene}` where `isSerene = isDesktopLean || isMobile` to both `<DioramaTerrain />` and `<DioramaUrbanCanopy />`, closing dual-platform presentation wiring.

## 3. Principles Applied
- `[View-Model Seam Extraction & DCC Pipeline] -> Blender 5.2 sculpted organic river spline and botanical biome replace programmer art box collages and conical trees.`
- `[Spatial AABB / Non-Occlusion] -> S-shaped river sweeps around Sunken Arena (R=1.68m) with apex X=2.65m (0 penetrating vertices into R<1.68m) and marina basin cradles moored cruiser at X=1.60m, Z=2.2m.`
- `[Two-Stage Decoupling & Living Test Parity] -> DioramaTerrain and DioramaUrbanCanopy default isSereneTabletop to false and preserve data-testid="diorama-river-waves" and data-testid="diorama-urban-canopy" across all branches.`
- `[Resource Disposal & Single Draw Call] -> River spline and flora biome are batched into single GLB meshes with shared materials, locking 60 FPS / 14ms.`
- `[100% DTO & Call-Site Wiring] -> MiniatureCityDiorama propagates isSereneTabletop={isSerene} under both isDesktopLean and isMobile.`

## 4. Exact Drop-in Code Snippets

**Target physical file**: `src/client/3d/diorama/diorama_terrain.tsx`
```tsx
<<<<
export const SAIGON_RIVER_SPLINE_MODEL_URL = '';
====
import { SafeGLTFModel } from '../asset_loader/safe_gltf_model';

export const SAIGON_RIVER_SPLINE_MODEL_URL = '/models/board/saigon_river_spline.glb';
>>>>
```

```tsx
<<<<
      <group position={[0, 0, 0]}>
        {/* Đáy sông Sài Gòn trầm tích sẫm */}
====
      {isSereneTabletop ? (
        <SafeGLTFModel
          url={SAIGON_RIVER_SPLINE_MODEL_URL}
          position={[0, 0, 0]}
          receiveShadow
          fallback={
            <group position={[0, 0, 0]}>
              <mesh receiveShadow position={[0, RIVER_BED_Y, 0]}>
                <boxGeometry args={[1.8, 0.008, 15.0]} />
                <meshStandardMaterial color="#0284C7" roughness={0.25} metalness={0.10} transparent opacity={0.88} />
              </mesh>
              <mesh position={[0, RIVER_BED_Y + 0.005, 0]} data-testid="diorama-river-waves">
                <boxGeometry args={[1.6, 0.002, 14.8]} />
                <meshStandardMaterial color="#E0F2FE" transparent opacity={0.35} roughness={0.2} />
              </mesh>
            </group>
          }
        />
      ) : (
        <group position={[0, 0, 0]}>
        {/* Đáy sông Sài Gòn trầm tích sẫm */}
>>>>
```

```tsx
<<<<
        </mesh>
      </group>

      {/* ========================================================
          2 & 3. BÁN ĐẢO TÂY & ĐÔNG: Khối nền, đại lộ, vỉa hè & vạch kẻ đường (Batched Merged Geometries)
====
        </mesh>
      </group>
      )}

      {/* ========================================================
          2 & 3. BÁN ĐẢO TÂY & ĐÔNG: Khối nền, đại lộ, vỉa hè & vạch kẻ đường (Batched Merged Geometries)
>>>>
```

**Target physical file**: `src/client/3d/miniature_city_diorama.tsx`
```tsx
<<<<
export const INDOCHINE_BIOME_MODEL_URL = '';
====
export const INDOCHINE_BIOME_MODEL_URL = '/models/board/indochine_botanical_biome.glb';
>>>>
```

```tsx
<<<<
export function DioramaUrbanCanopy({ isMobile = false }: { readonly isMobile?: boolean } = {}): React.ReactElement {
====
export interface DioramaUrbanCanopyProps {
  readonly isMobile?: boolean;
  readonly isSereneTabletop?: boolean;
}

export function DioramaUrbanCanopy({ isMobile = false, isSereneTabletop = false }: DioramaUrbanCanopyProps = {}): React.ReactElement {
>>>>
```

```tsx
<<<<
  return (
    <group position={[0, 0.02, 0]} data-testid="diorama-urban-canopy">
      <instancedMesh ref={trunkRef} args={[undefined, undefined, URBAN_TREES.length]} castShadow={!isMobile} receiveShadow>
        <cylinderGeometry args={[0.025, 0.04, 0.24, 8]} />
        <meshStandardMaterial color="#78350F" roughness={0.8} />
      </instancedMesh>
      <instancedMesh ref={lowerCanopyRef} args={[undefined, undefined, URBAN_TREES.length]} castShadow={!isMobile}>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshStandardMaterial color="#15803D" roughness={0.65} />
      </instancedMesh>
      <instancedMesh ref={upperCanopyRef} args={[undefined, undefined, URBAN_TREES.length]} castShadow={!isMobile}>
        <sphereGeometry args={[0.11, 10, 10]} />
        <meshStandardMaterial color="#15803D" roughness={0.6} />
      </instancedMesh>
    </group>
  );
====
  return (
    <group position={[0, 0.02, 0]} data-testid="diorama-urban-canopy">
      {isSereneTabletop ? (
        <SafeGLTFModel
          url={INDOCHINE_BIOME_MODEL_URL}
          position={[0, 0, 0]}
          castShadow={!isMobile}
          receiveShadow
          fallback={<></>}
        />
      ) : (
        <>
          <instancedMesh ref={trunkRef} args={[undefined, undefined, URBAN_TREES.length]} castShadow={!isMobile} receiveShadow>
            <cylinderGeometry args={[0.025, 0.04, 0.24, 8]} />
            <meshStandardMaterial color="#78350F" roughness={0.8} />
          </instancedMesh>
          <instancedMesh ref={lowerCanopyRef} args={[undefined, undefined, URBAN_TREES.length]} castShadow={!isMobile}>
            <sphereGeometry args={[0.15, 12, 12]} />
            <meshStandardMaterial color="#15803D" roughness={0.65} />
          </instancedMesh>
          <instancedMesh ref={upperCanopyRef} args={[undefined, undefined, URBAN_TREES.length]} castShadow={!isMobile}>
            <sphereGeometry args={[0.11, 10, 10]} />
            <meshStandardMaterial color="#15803D" roughness={0.6} />
          </instancedMesh>
        </>
      )}
    </group>
  );
>>>>
```

```tsx
<<<<
      <DioramaPedestrianPromenades isMobile={isMobile} />
      <DioramaUrbanCanopy isMobile={isMobile} />
====
      <DioramaPedestrianPromenades isMobile={isMobile} />
      <DioramaUrbanCanopy isMobile={isMobile} isSereneTabletop={isSerene} />
>>>>
```

**Target physical file**: `src/client/3d/diorama/diorama_harbor_cruiser.tsx`
```tsx
<<<<
  const boatRef = useRef<Group>(null);
  const wakeRef = useRef<Mesh>(null);
  const initialZ = isMoored ? 2.2 : 5.2;

  return (
    <group ref={boatRef} position={[0, -0.032, initialZ]} data-testid="diorama-harbor-cruiser">
====
  const boatRef = useRef<Group>(null);
  const wakeRef = useRef<Mesh>(null);
  const initialX = isMoored ? 1.6 : 0;
  const initialZ = isMoored ? 2.2 : 5.2;

  return (
    <group ref={boatRef} position={[initialX, -0.032, initialZ]} data-testid="diorama-harbor-cruiser">
>>>>
```

```tsx
<<<<
        const y = -0.032 + Math.sin(t * 2.8) * 0.003;
        boatRef.current.position.set(0, y, 2.2);
====
        const y = -0.032 + Math.sin(t * 2.8) * 0.003;
        boatRef.current.position.set(1.6, y, 2.2);
>>>>
```

## 5. Station 1 Test Specifications
- TC-435.01 [UC-RIVER-SPLINE-ASSET-AND-BINARY-BOUNDS/MSS]: Given SAIGON_RIVER_SPLINE_MODEL_URL, When checking physical asset and GLB binary accessors, Then file size is <= 48KB, apex X is >= 2.60m around Z = 0, bridge crossings satisfy |X| <= 0.10m at Z = ±3.8m, and 0 vertices penetrate R < 1.68m.
- TC-435.02 [UC-BOTANICAL-BIOME-ASSET-AND-MATERIALS/MSS]: Given INDOCHINE_BIOME_MODEL_URL, When checking physical asset and GLB binary accessors, Then file size is <= 130KB, triangle count is <= 2500 tris, and contains 3 PBR materials (#5D4037, #2E7D32, #FFFDF0).
- TC-435.03 [UC-DIORAMA-TERRAIN-TABLETOP-AND-LEGACY-PARITY/MSS]: Given DioramaTerrain, When rendered with isSereneTabletop: false vs true, Then both preserve data-testid="diorama-river-waves" and data-testid="diorama-park-relief", with isSereneTabletop: true mounting SafeGLTFModel with SAIGON_RIVER_SPLINE_MODEL_URL.
- TC-435.04 [UC-URBAN-CANOPY-HOOK-INTEGRITY-AND-BIOME/MSS]: Given DioramaUrbanCanopy, When rendered with isSereneTabletop: false vs true, Then both preserve data-testid="diorama-urban-canopy" with invariant hook count, with isSereneTabletop: false rendering 3 instancedMesh layers (count=18) and isSereneTabletop: true mounting SafeGLTFModel with INDOCHINE_BIOME_MODEL_URL.
- TC-435.05 [UC-MINIATURE-CITY-DIORAMA-DUAL-WIRING/MSS]: Given MiniatureCityDiorama rendered with isDesktopLean: true or isMobile: true, When inspecting child props, Then propagates isSereneTabletop: true to both DioramaTerrain and DioramaUrbanCanopy across both platforms.
- TC-435.06 [UC-MOORED-CRUISER-MARINA-DOCKING/MSS]: Given DioramaHarborCruiser with isMoored: true, When inspecting initial position, Then docks at X = 1.60m, Z = 2.2m safely centered in the expanded river basin.

## 6. Definition of Done
- 100% test pass on tests/client/imp435_saigon_river_and_indochine_biome.test.ts
- Zero regressions across living tests (imp375, imp379, imp142, imp405, imp107, imp429, miniature_city_diorama)
- Full prefilter passes (npm run prefilter)
- Sentinel passes with 100% mutant kill (npm run sentinel -- --ticket IMP-435)
- Physical visual capture: npm run capture:visual -- --ticket IMP-435
- Comprehensive evidence audit: node scripts/check_evidence.mjs IMP-435
