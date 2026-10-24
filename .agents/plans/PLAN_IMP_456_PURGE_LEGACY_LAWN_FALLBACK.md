# PLAN: IMP-456 Purge Legacy Lawn Fallback & Eliminate Desktop Ocean Hydration Pop

## 1. Context & Motivation
On desktop, when opening the game canvas, users observe a jarring visual pop: for the first ~0.5s–1.0s, a bright green circular grassland ("đồng cỏ" #22C55E) appears around the board, and then abruptly disappears as the scene pops into the open tropical ocean.

### Physical Root Cause:
In `src/client/3d/coastal_island_environment.tsx#L198-L298`, desktop renders `<SafeGLTFModel url={COASTAL_ARCHIPELAGO_BASE_MODEL_URL} fallback={<>...}/>` because `streamlined={false}` on desktop (`enableOuterBaySanctuaries = true`). While the ~115 KB GLB model is being fetched/parsed, React Suspense renders the legacy procedural fallback. This fallback contains an obsolete ~35m diameter green cylinder (`cylinderGeometry args={[15.6, 17.6, 0.26, 64]}` with material `#22C55E`), 60 palm trees, and 32 foliage trees leftover from IMP-81/IMP-107. Once the Blender model loads, this giant green cylinder vanishes, causing the noticeable visual pop.

## 2. Target Files & Scope Confinement
| File | Tier | Current LOC | Projected LOC | Delta | Max LOC | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/3d/coastal_island_environment.tsx` | Tier 2 (3D/UI) | 320 | 215 | -105 | 500 | Safe (Deletion-First) |
| `tests/contracts/imp80_daylight_illumination_and_unified_tile_art.test.ts` | Living Tests | 342 | 340 | -2 | 600 | Safe (Modernize) |
| `tests/client/cinematic_effects.test.ts` | Living Tests | 57 | 55 | -2 | 600 | Safe (Modernize) |
| `tests/contracts/coastal_island_environment.test.ts` | Living Tests | 94 | 94 | 0 | 600 | Safe (Modernize) |
| `tests/client/imp107_streamlined_tabletop_diorama.test.ts` | Living Tests | 188 | 185 | -3 | 600 | Safe (Modernize) |
| `tests/contracts/imp456_purge_legacy_lawn_fallback.test.ts` | Living Tests (New) | 0 | 135 | +135 | 600 | Safe |

> [!NOTE] Two-Stage Decoupling & Anti-TIDD Defense:
> - Secondary modules (`layered_tropical_foliage.tsx`, `tropical_palms_cluster.tsx`, `coastal_island_landmarks.tsx`) are preserved on physical disk as standalone modules to protect living test suites (`imp420`, `imp426`, `layered_tropical_foliage.test.ts`).
> - Exported descriptors (`DEFAULT_BALANCED_ISLAND_DIORAMA`, `DEFAULT_COASTAL_ISLAND_PROPS`, `resolveBalancedIslandDioramaProps`, `CoastalIslandPropDescriptor`) remain exported in `coastal_island_environment.tsx` so living tests do not break.
> - Only the dead imports in `coastal_island_environment.tsx` (`LayeredTropicalFoliage`, `TropicalPalmsCluster`, `AirportLandmark`, `TrainStationLandmark`) are deleted.
> - `[HARNESS_MUTATION_AUTHORIZED]`: Authorizes `scripts/sentinel_probes/IMP-456.json` (Sentinel AST mutation probe targeting purged lawn geometry and preload invariant).

## 3. Explicitly Dropped Requirements (Sean Goedecke Invariant)
- ❌ **NO Custom Low-Poly Grass Proxy**: Do not create a temporary low-poly grass or sand proxy mesh during GLTF loading; render clean ocean water directly.
- ❌ **NO Multi-Stage Fallback Cross-Fade Animation**: Do not add opacity blending or canvas cross-fade effects between fallback and loaded GLB.
- ❌ **NO Network Fallback Retries with Procedural Replacement**: If GLB fails, `SafeModelErrorBoundary` catches and logs cleanly; do not attempt to reconstruct procedural islands on error.
- ❌ **NO Immediate Deletion of Secondary Standalone Modules**: Retain `layered_tropical_foliage.tsx`, `tropical_palms_cluster.tsx`, and `coastal_island_landmarks.tsx` as standalone modules until independent tickets address them under Two-Stage Decoupling.

## 4. Principles Applied
- `View-Model Seam Extraction`: Pure fallback decoupling ensuring `SafeGLTFModel` operates with `fallback={null}` for zero-allocation initial render.
- `Resource Disposal & Cache Hygiene`: Eliminates over 105 lines of legacy Three.js procedural geometries and materials during loading.
- `Platform DI Isolation`: Preloads GLB asset via `SafeGLTFModel.preload` at module evaluation, removing network fetch delay.
- `SpecGuard Oracle & Anti-Overfitting Protocol`: Contract tests assert zero legacy token presence (`args={[15.6, 17.6`) and verify relational SSR cleanliness.
- `Dropped Requirements & Anti-Phantom Complexity (Sean Goedecke Invariant)`: Directly eliminates the pop-in by setting `fallback={null}` instead of building complex asset-swapping animators.

## 5. Core Contract Invariants
- **INV-456.01 [Zero-Lawn Pop-in Invariant]**: `src/client/3d/coastal_island_environment.tsx` MUST NOT contain the green lawn cylinder (`args={[15.6, 17.6, 0.26, 64]}`) or `Lush Tropical Lawn Plateau`.
- **INV-456.02 [Clean GLTF Fallback & Preload Invariant]**: `SafeGLTFModel` with `COASTAL_ARCHIPELAGO_BASE_MODEL_URL` in `coastal_island_environment.tsx` MUST specify `fallback={null}` and invoke `SafeGLTFModel.preload(COASTAL_ARCHIPELAGO_BASE_MODEL_URL)` at module scope.
- **INV-456.03 [Living Ocean Preservation Invariant]**: `TropicalWater`, `HorizonMountainRange`, `CoastalPatrolBoat`, and `CornerTycoonSanctuaries` MUST remain 100% active and unimpacted.
- **INV-456.04 [Living Test Parity Invariant]**: `imp80`, `cinematic_effects`, `coastal_island_environment`, and `imp107` living test suites MUST be modernized under authorized plan scope to reflect the clean archipelago diorama.

## 6. Specification for Modifications & Drop-In Snippets
### 6.1 `src/client/3d/coastal_island_environment.tsx`
Module-Scope Preload addition:
```typescript
<<<<
export const COASTAL_ARCHIPELAGO_BASE_MODEL_URL = '/models/board/coastal_archipelago_base.glb' as const;

export function ContainerShipProceduralFallback(): React.ReactElement {
====
export const COASTAL_ARCHIPELAGO_BASE_MODEL_URL = '/models/board/coastal_archipelago_base.glb' as const;
SafeGLTFModel.preload(COASTAL_ARCHIPELAGO_BASE_MODEL_URL);

export function ContainerShipProceduralFallback(): React.ReactElement {
>>>>
```

Call-Site Wiring for clean archipelago fallback (replacing lines 191–300):
```typescript
<<<<
      {/* 2. Các khối ngoại vi hòn đảo (Được ẩn ở chế độ streamlined để giải phóng tối đa tầm nhìn bàn cờ) */}
      {!streamlined && (
        <SafeGLTFModel
          url={COASTAL_ARCHIPELAGO_BASE_MODEL_URL}
          position={[0, 0, 0]}
          receiveShadow
          castShadow={!isMobile}
          fallback={
            <>
              {/* Cao nguyên cỏ xanh nhiệt đới viền quanh bàn cờ (Lush Tropical Lawn Plateau, #22C55E) */}
          <mesh receiveShadow position={[0, -0.34, 0]}>
            <cylinderGeometry args={[15.6, 17.6, 0.26, 64]} />
            <meshStandardMaterial color="#22C55E" roughness={0.78} metalness={0.02} />
          </mesh>

          {/* Bờ biển cát vát nghiêng ngà mịn tự nhiên (Sloped Fine Ivory Shoreline, #EFE5D8, roughness: 0.85) */}
          <mesh receiveShadow position={[0, -0.36, 0]}>
            <cylinderGeometry args={[17.4, 21.0, 0.24, 64]} />
            <meshStandardMaterial color="#EFE5D8" roughness={0.85} metalness={0.02} />
          </mesh>

          {/* Gờ vát nghiêng bờ cát chuẩn 15 độ tiếp giáp nước biển */}
          <mesh receiveShadow position={[0, -0.75, 0]}>
            <cylinderGeometry args={[27.8, 28.85, 0.28, 64]} />
            <meshStandardMaterial color="#EFE5D8" roughness={0.85} metalness={0.02} />
          </mesh>

          <mesh receiveShadow position={[0, -0.38, 0]}>
            <cylinderGeometry args={[16.2, 17.5, 0.14, 48]} />
            <meshStandardMaterial color="#F3EBE1" roughness={0.85} metalness={0.02} />
          </mesh>

          {/* Mũi bãi tắm & đảo ngoại vi 4 góc phần tư rải đều (IMP-420 Quadrant Guard) */}
          {DEFAULT_BALANCED_ISLAND_DIORAMA.props.map((p) => (
            <mesh key={p.id} receiveShadow position={[...p.position]}>
              <cylinderGeometry args={[p.topRadius, p.bottomRadius, p.height, p.segments]} />
              <meshStandardMaterial
                color={p.color ?? '#EFE5D8'}
                roughness={p.roughness ?? 0.85}
                metalness={p.metalness ?? 0.02}
              />
            </mesh>
          ))}

          {/* Dù che nắng bãi biển đa sắc */}
          {([
            [-12.2, 8.2, '#EF4444'],
            [-13.2, 9.5, '#F59E0B'],
            [-11.8, 10.5, '#3B82F6'],
            [-10.8, 9.0, '#10B981'],
          ] as const).map(([bx, bz, color], uIdx) => (
            <group key={`umbrella-${uIdx}`} position={[bx, -0.25, bz]}>
              <mesh position={[0, 0.4, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.8, 6]} />
                <meshStandardMaterial color="#F8FAFC" metalness={0.7} />
              </mesh>
              <mesh position={[0, 0.78, 0]} rotation={[0.1, 0, 0.1]}>
                <coneGeometry args={[0.55, 0.25, 8]} />
                <meshStandardMaterial color={color} roughness={0.3} />
              </mesh>
              <mesh position={[0.2, 0.04, 0]} rotation={[0, 0.3, -0.1]}>
                <boxGeometry args={[0.42, 0.05, 0.22]} />
                <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
              </mesh>
            </group>
          ))}

          {/* 3. Thảm thực vật nhiệt đới đa tầng & rừng dừa 60 cây (IMP-30) */}
          <LayeredTropicalFoliage />
          <TropicalPalmsCluster />

          {/* 6. Hạ tầng kết nối: Cầu cạn, Ga xe lửa Đông Nam & Sân bay Tây Bắc */}
          <group position={[-18, -0.26, 18]} rotation={[0, 0.78, 0]}>
            <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
              <boxGeometry args={[12, 0.18, 1.4]} />
              <meshStandardMaterial color="#CBD5E1" roughness={0.5} />
            </mesh>
            {[-4, 0, 4].map((px) => (
              <mesh key={`pier-${px}`} position={[px, -0.2, 0]}>
                <cylinderGeometry args={[0.25, 0.3, 0.6, 8]} />
                <meshStandardMaterial color="#64748B" roughness={0.7} />
              </mesh>
            ))}
          </group>
          <TrainStationLandmark />
          <AirportLandmark />

          {/* Tàu Container Tây Nam & Du thuyền ven bãi tắm (Ngoại vi bãi cát Tây - chỉ hiện khi streamlined=false) */}
          <group position={[-15.0, -0.30, 9.5]} rotation={[0, -0.85, 0]} scale={[0.75, 0.75, 0.75]}>
            <SafeGLTFModel url={VEHICLE_MODEL_URLS.container} fallback={<ContainerShipProceduralFallback />} castShadow receiveShadow />
            <mesh position={[6.2, 0.05, 0]}>
              <planeGeometry args={[4.2, 1.8]} />
              <meshBasicMaterial color="#FFFFFF" transparent opacity={0.4} />
            </mesh>
          </group>

          <group position={[-11.5, -0.30, 12.0]} rotation={[0, 0.6, 0]}>
            <mesh castShadow position={[0, 0.25, 0]}>
              <boxGeometry args={[3.2, 0.4, 1.0]} />
              <meshStandardMaterial color="#FFFFFF" roughness={0.2} metalness={0.1} />
            </mesh>
            <mesh castShadow position={[0.2, 0.55, 0]}>
              <boxGeometry args={[1.6, 0.35, 0.7]} />
              <meshStandardMaterial color="#0284C7" roughness={0.2} />
            </mesh>
          </group>
        </>
      }
    />
  )}
====
      {/* 2. Các khối ngoại vi hòn đảo (Được ẩn ở chế độ streamlined để giải phóng tối đa tầm nhìn bàn cờ) */}
      {!streamlined && (
        <SafeGLTFModel
          url={COASTAL_ARCHIPELAGO_BASE_MODEL_URL}
          position={[0, 0, 0]}
          receiveShadow
          castShadow={!isMobile}
          fallback={null}
        />
      )}
>>>>
```

### 6.2 `tests/contracts/imp80_daylight_illumination_and_unified_tile_art.test.ts`
- Modernize TC-80.18: Change from checking presence of lawn plateau `#22C55E` to checking that `Lush Tropical Lawn Plateau` is not in source.
- Modernize TC-80.19: Change from checking `color="#F3EBE1"` to asserting that `color="#F3EBE1"` is purged from `coastal_island_environment.tsx`.

### 6.3 `tests/client/cinematic_effects.test.ts`
- In line 48–56: Verify diorama rendering retains `#0284C7` (ocean) and `#EFE5D8` (sand), and assert that the legacy lawn cylinder `args="15.6,17.6,0.26,64"` is not present.

### 6.4 `tests/contracts/coastal_island_environment.test.ts`
- Remove checks expecting `<LayeredTropicalFoliage />`, `#22C55E`, and `args={[27.8, 28.85, 0.28, 64]}` in `envSource`.
- Add negative assertion: `expect(envSource).not.toContain('args={[15.6, 17.6, 0.26, 64]}');`
- Add negative assertion: `expect(envSource).not.toContain('Lush Tropical Lawn Plateau');`
- Assert permanent shoreline ring: `expect(envSource).toContain('ringGeometry');`

### 6.5 `tests/client/imp107_streamlined_tabletop_diorama.test.ts`
- In `UC-IMP107/MSS-F4.1`: Assert that with `streamlined=false`, `CoastalIslandEnvironment` mounts `COASTAL_ARCHIPELAGO_BASE_MODEL_URL` without `args="15.6,17.6,0.26,64"`, and retains `data-testid="horizon-mountain-range"`.

## 7. Contract Test Matrix (`imp456_purge_legacy_lawn_fallback.test.ts`)
- **TC-456.01 [UC-PURGE-LAWN/MSS]**: Given `coastal_island_environment.tsx` file, When inspecting `COASTAL_ARCHIPELAGO_BASE_MODEL_URL` element, Then `SafeGLTFModel` defines `fallback={null}` and `SafeGLTFModel.preload` is invoked.
- **TC-456.02 [UC-PURGE-LAWN/A1]**: Given `coastal_island_environment.tsx` source code, When scanning for obsolete tokens, Then neither `Lush Tropical Lawn Plateau` nor `args={[15.6, 17.6` exists in the source.
- **TC-456.03 [UC-PURGE-LAWN/A2]**: Given `coastal_island_environment.tsx` source code, When checking module imports, Then `LayeredTropicalFoliage` and `TropicalPalmsCluster` are not imported or rendered.
- **TC-456.04 [UC-SSR-CLEANLINESS/MSS]**: Given `CoastalIslandEnvironment` in SSR with `streamlined={false}`, When rendering to static markup, Then HTML contains zero occurrences of `args="15.6,17.6,0.26,64"`.
- **TC-456.05 [UC-LIVING-OCEAN-RETAINED/MSS]**: Given `CoastalIslandEnvironment` in SSR with `streamlined={false}`, When rendering to static markup, Then HTML retains `data-testid="horizon-mountain-range"`, `data-testid="coastal-patrol-boat"`, and `data-testid="coastal-seagulls"`.

## 8. Physical Visual Verification
- Visual capture scenario: `camera_chase_normal`
- Run command: `node scripts/capture_visual_evidence.mjs --ticket IMP-456 --name ocean_clean --scenario camera_chase_normal`
- Evidence audit: `node scripts/check_evidence.mjs IMP-456`

## 9. Definition of Done (DoD)
1. `npm test -- tests/contracts/imp456_purge_legacy_lawn_fallback.test.ts` passes 100% (5 atomic tests).
2. `npm test -- tests/contracts/imp80_daylight_illumination_and_unified_tile_art.test.ts tests/client/cinematic_effects.test.ts tests/contracts/coastal_island_environment.test.ts tests/client/imp107_streamlined_tabletop_diorama.test.ts` passes 100%.
3. `npm run prefilter -- src/client/3d/coastal_island_environment.tsx tests/contracts/imp80_daylight_illumination_and_unified_tile_art.test.ts tests/client/cinematic_effects.test.ts tests/contracts/coastal_island_environment.test.ts tests/client/imp107_streamlined_tabletop_diorama.test.ts tests/contracts/imp456_purge_legacy_lawn_fallback.test.ts` exits 0 (10/10 checks).
4. `node scripts/check_scope.mjs` exits 0.
