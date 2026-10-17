# Implementation Plan: IMP-437 Indochine Executive Tabletop Art Direction & VIP Salon Atmosphere Overhaul

## 1. Physical Surface Area & Target Files
| Target File | Tier | Current LOC | Expected LOC | Net Delta | Subsystem | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/3d/board_layout.tsx` | Tier 2 | 278 | 329 | +51 | client-3d | Hardened |
| `src/client/3d/miniature_city_diorama.tsx` | Tier 2 | 393 | 393 | +0 | client-3d | Hardened |
| `src/client/3d/diorama/diorama_terrain.tsx` | Tier 2 | 166 | 169 | +3 | client-3d | Hardened |
| `src/client/3d/diorama/batched_diorama_terrain.tsx` | Tier 2 | 148 | 150 | +2 | client-3d | Hardened |
| `scripts/blender/build_indochine_paved_esplanade.py (New)` | Toolchain / Asset Gen | 0 | 280 | +280 | toolchain-blender | New |
| `tests/client/imp437_indochine_executive_atmosphere_and_esplanade.test.ts (New)` | Living Tests (New) | 0 | 280 | +280 | client-3d | New |

> **Architecture Commitment (LOC Buffer Zone Guard)**: All target files strictly conform to Tier 2 ceilings (<= 500 LOC). `miniature_city_diorama.tsx` (393 LOC) uses a 1-line in-place edit with Net Delta +0 preserving `TC-197.28` (<= 400 LOC living test barrier). Asset script `scripts/blender/build_indochine_paved_esplanade.py` generates `public/models/board/indochine_paved_esplanade.glb`.

## 2. Core Contract Invariants
- **[INV-SALON-ATMOSPHERE-COORDINATION]**: In `board_layout.tsx`, `TabletopSalonAtmosphere` mounts when `isDesktopLean` (`!isMobile`). In `useSafeFrame`, when `!isAuctionActive`, it maintains `scene.background.set('#0B110E')` and Three.js `Fog` with near: 20.0, far: 85.0, color: '#0B110E' (running after `TimeOfDayLighting` in render order, eliminating frame-1 erasure of `FogExp2` per ADV-01). When `isAuctionActive`, theatrical auction dimming (`#0F172A`) is respected.
- **[INV-THEATRICAL-CHANDELIER-LIGHT]**: `TabletopSalonAtmosphere` mounts warm 3200K key light (`#FFF2D6`, normal intensity $0.38 \le 0.40$, auction intensity $0.08 \le 0.10$) at $[10, 24, 14]$ with shadow camera frustum $[-16, 16]$ and `shadow-bias={-0.0001}` (ADV-05). Mobile suppresses salon lighting.
- **[INV-PAVED-ESPLANADE-ASSET-AND-SSOT]**: `PAVED_ESPLANADE_MODEL_URL = '/models/board/indochine_paved_esplanade.glb'`. Asset <= 180KB, <= 3,500 tris, 1 draw call. Contains: (1) circular beveled stone promenade ($R \in [1.68, 2.05]\text{m}$, curb height $Y = 0.018\text{m}$), (2) granite esplanades flanking S-river curves. Zero duplicate bronze drum medallion (preserving `indochine_master_landscape.glb` as SSOT per ADV-04). Dice floor stays at $Y \in [-0.010, 0.005]\text{m}$ matching `DICE_REST_Y = 0.26` physics (ADV-06).
- **[INV-MOSS-PALETTE-PRODUCTION-WIRING]**: `BatchedDioramaLandmasses` accepts `mossPalette?: boolean` defaulting to `false` (`#15803D`), protecting living test `imp432#L88` per ADV-02. `DioramaTerrain` propagates `mossPalette` to `BatchedDioramaLandmasses` and infill mesh. `miniature_city_diorama.tsx#L353` actively wires `mossPalette={isDesktopLean}` into production call-site, eliminating dead props and rendering `#0C2919` on desktop.
- **[INV-CITY-LAYER-COUPLING-AND-MOBILE-ISOLATION]**: In `board_layout.tsx`, `SafeGLTFModel(PAVED_ESPLANADE_MODEL_URL)` is mounted inside `<group visible={isCityVisible}>` guarded by `{!isMobile && ( ... )}`, correctly coupling esplanade visibility to the diorama city layer and preventing asset leakage onto mobile devices.

## 3. Principles Applied
- **[100% DTO & Call-Site Wiring]**: `mossPalette={isDesktopLean}` wired at `miniature_city_diorama.tsx#L353`, defeating dead-field traps.
- **[Spatial AABB & Layer Hierarchy]**: Paved esplanade nested in `isCityVisible`, preventing orphaned promenade meshes when city is off.
- **[Poka-Yoke Domain Affordance & Lighting Safety]**: Chandelier capped at 0.38 and auto-dims to 0.08 in auction, eliminating blowout.
- **[Resource Disposal & Single SSOT]**: Medallion retained strictly in master landscape GLB, preventing duplicate draw calls.

## 4. Drop-in Implementation Snippets

**Target physical file**: `src/client/3d/board_layout.tsx`
```tsx
<<<<
import React, { useCallback, useMemo } from 'react';
====
import React, { useCallback, useMemo } from 'react';
import { useSafeFrame } from './safe_frame';
import { useGameStore } from '../store/game_store';
import { isThreeFog, isThreeColor } from './time_of_day_lighting_helpers';
import { SafeGLTFModel } from './asset_loader/safe_gltf_model';
import { PAVED_ESPLANADE_MODEL_URL } from './diorama/diorama_terrain';
>>>>
```

```tsx
<<<<
export interface GameBoardProps {
====
export function TabletopSalonAtmosphere({ isDesktopLean = false }: { readonly isDesktopLean?: boolean }): React.ReactElement | null {
  const activeModal = useGameStore((s) => s.activeModal);
  const isAuctionActive = activeModal === 'auction';

  useSafeFrame(({ scene }) => {
    if (!isDesktopLean || isAuctionActive) return;
    if (scene.background && isThreeColor(scene.background)) {
      scene.background.set('#0B110E');
    }
    if (scene.fog && isThreeFog(scene.fog)) {
      scene.fog.color.set('#0B110E');
      scene.fog.near = 20.0;
      scene.fog.far = 85.0;
    }
  });

  if (!isDesktopLean) return null;
  return (
    <directionalLight
      position={[10, 24, 14]}
      intensity={isAuctionActive ? 0.08 : 0.38}
      color="#FFF2D6"
      castShadow
      shadow-camera-left={-16}
      shadow-camera-right={16}
      shadow-camera-top={16}
      shadow-camera-bottom={-16}
      shadow-camera-near={1}
      shadow-camera-far={60}
      shadow-bias={-0.0001}
      data-testid="tabletop-salon-light"
    />
  );
}

export interface GameBoardProps {
>>>>
```
```tsx
<<<<
      {/* 0.02. Mặt Bàn Gỗ Óc Chó Thượng Lưu Phòng VIP (Executive VIP Salon Tabletop Plinth) */}
      {isTableVisible && !isMobile && (
        <mesh receiveShadow position={[0, WALNUT_TABLE_Y - 0.005, 0]}>
          <boxGeometry args={[48.0, 0.19, 48.0]} />
          <meshStandardMaterial color="#1C140D" roughness={0.35} metalness={0.05} />
        </mesh>
      )}
====
      {/* 0.02. Mặt Bàn Gỗ Óc Chó Thượng Lưu Phòng VIP (Executive VIP Salon Tabletop Plinth) */}
      {isTableVisible && !isMobile && (
        <>
          <mesh receiveShadow position={[0, WALNUT_TABLE_Y - 0.005, 0]}>
            <boxGeometry args={[48.0, 0.19, 48.0]} />
            <meshStandardMaterial color="#1C140D" roughness={0.35} metalness={0.05} />
          </mesh>
          <TabletopSalonAtmosphere isDesktopLean={!isMobile} />
        </>
      )}
>>>>
```
```tsx
<<<<
      {/* 2. Sa bàn đô thị thu nhỏ: Đảo tài chính, cầu vượt, sân vận động & bến du thuyền */}
      <group visible={isCityVisible}>
        <MiniatureCityDiorama isMobile={isMobile} isDesktopLean={!isMobile} isVisible={isCityVisible} />
      </group>
====
      {/* 2. Sa bàn đô thị thu nhỏ: Đảo tài chính, cầu vượt, sân vận động & bến du thuyền */}
      <group visible={isCityVisible}>
        <MiniatureCityDiorama isMobile={isMobile} isDesktopLean={!isMobile} isVisible={isCityVisible} />
        {!isMobile && (
          <SafeGLTFModel
            url={PAVED_ESPLANADE_MODEL_URL}
            position={[0, 0, 0]}
            receiveShadow
            fallback={null}
          />
        )}
      </group>
>>>>
```

**Target physical file**: `src/client/3d/miniature_city_diorama.tsx`
```tsx
<<<<
      <DioramaTerrain isSereneTabletop={isSerene} />
====
      <DioramaTerrain isSereneTabletop={isSerene} mossPalette={isDesktopLean} />
>>>>
```

**Target physical file**: `src/client/3d/diorama/diorama_terrain.tsx`
```tsx
<<<<
export const SAIGON_RIVER_SPLINE_MODEL_URL = '/models/board/saigon_river_spline.glb';
====
export const SAIGON_RIVER_SPLINE_MODEL_URL = '/models/board/saigon_river_spline.glb';
export const PAVED_ESPLANADE_MODEL_URL = '/models/board/indochine_paved_esplanade.glb';
>>>>
```
```tsx
<<<<
export interface DioramaTerrainProps {
  readonly isSereneTabletop?: boolean;
}

export function DioramaTerrain({
  isSereneTabletop = false,
}: DioramaTerrainProps = {}): React.ReactElement {
====
export interface DioramaTerrainProps {
  readonly isSereneTabletop?: boolean;
  readonly mossPalette?: boolean;
}

export function DioramaTerrain({
  isSereneTabletop = false,
  mossPalette = false,
}: DioramaTerrainProps = {}): React.ReactElement {
>>>>
```
```tsx
<<<<
      <BatchedDioramaLandmasses isSereneTabletop={isSereneTabletop} />
====
      <BatchedDioramaLandmasses isSereneTabletop={isSereneTabletop} mossPalette={mossPalette} />
>>>>
```
```tsx
<<<<
          {/* Lớp thảm cỏ trung tâm nối liền bán đảo Tây/Đông với bờ kè đá S-Curve */}
          {infillGeom && (
            <mesh receiveShadow geometry={infillGeom} data-testid="diorama-tabletop-infill">
              <meshStandardMaterial color="#15803D" roughness={0.85} side={DoubleSide} />
            </mesh>
          )}
====
          {/* Lớp thảm cỏ trung tâm nối liền bán đảo Tây/Đông với bờ kè đá S-Curve */}
          {infillGeom && (
            <mesh receiveShadow geometry={infillGeom} data-testid="diorama-tabletop-infill">
              <meshStandardMaterial color={mossPalette ? '#0C2919' : '#15803D'} roughness={mossPalette ? 0.92 : 0.85} side={DoubleSide} />
            </mesh>
          )}
>>>>
```

**Target physical file**: `src/client/3d/diorama/batched_diorama_terrain.tsx`
```tsx
<<<<
export interface BatchedDioramaLandmassesProps {
  readonly isSereneTabletop?: boolean;
  readonly showRoads?: boolean;
}

export function BatchedDioramaLandmasses({
  isSereneTabletop = false,
  showRoads,
}: BatchedDioramaLandmassesProps = {}): React.ReactElement {
====
export interface BatchedDioramaLandmassesProps {
  readonly isSereneTabletop?: boolean;
  readonly showRoads?: boolean;
  readonly mossPalette?: boolean;
}

export function BatchedDioramaLandmasses({
  isSereneTabletop = false,
  showRoads,
  mossPalette = false,
}: BatchedDioramaLandmassesProps = {}): React.ReactElement {
>>>>
```

```tsx
<<<<
      <mesh geometry={geoms.grassGeom} receiveShadow raycast={noopRaycast}>
        <meshStandardMaterial color="#15803D" roughness={0.85} />
      </mesh>
====
      <mesh geometry={geoms.grassGeom} receiveShadow raycast={noopRaycast}>
        <meshStandardMaterial color={mossPalette ? '#0C2919' : '#15803D'} roughness={mossPalette ? 0.92 : 0.85} />
      </mesh>
>>>>
```

## 5. Station 1 Test Specifications
- TC-437.01 [UC-PAVED-ESPLANADE-ASSET-BOUNDS/MSS]: Given PAVED_ESPLANADE_MODEL_URL, When checking physical asset and GLB binary accessors, Then file size is <= 180KB, triangle count is <= 3500 tris, circular promenade has vertices within R in [1.68, 2.05]m with curb height Y <= 0.020m, and contains 0 duplicate bronze drum medallion vertices (ADV-04, ADV-06).
- TC-437.02 [UC-PAVED-ESPLANADE-PBR-MATERIALS/MSS]: Given paved esplanade asset, When inspecting material accessors, Then contains granite stone materials (#94A3B8 / #64748B, roughness >= 0.65).
- TC-437.03 [UC-TABLETOP-SALON-ATMOSPHERE-DESKTOP/MSS]: Given TabletopSalonAtmosphere, When rendered with isDesktopLean: true, Then mounts directional chandelier light with #FFF2D6, normal intensity <= 0.40, and dims to <= 0.10 when isAuctionActive (ADV-01, ADV-05).
- TC-437.04 [UC-TABLETOP-SALON-ATMOSPHERE-MOBILE-ISOLATION/MSS]: Given TabletopSalonAtmosphere, When rendered with isDesktopLean: false, Then returns null and mounts zero lights (ADV-03).
- TC-437.05 [UC-DEEP-MOSS-PALETTE-DECOUPLING/MSS]: Given BatchedDioramaLandmasses rendered with isSereneTabletop: true and mossPalette: false (default), Then retains #15803D (imp432 parity). When mossPalette: true, Then renders #0C2919 with roughness >= 0.90 (ADV-02).
- TC-437.06 [UC-DIORAMA-TERRAIN-MOSS-PARITY/MSS]: Given DioramaTerrain rendered with isSereneTabletop: true and mossPalette: false (default), Then retains #15803D for infill. When mossPalette: true, Then renders #0C2919 (ADV-02).
- TC-437.07 [UC-MINIATURE-CITY-DIORAMA-MOSS-WIRING/MSS]: Given MiniatureCityDiorama rendered with isDesktopLean: true, When inspecting DioramaTerrain child props, Then actively receives mossPalette: true. When isDesktopLean: false, Then passes mossPalette: false.
- TC-437.08 [UC-GAME-BOARD-DESKTOP-ESPLANADE-AND-CITY-LAYER/MSS]: Given GameBoard, When rendered with isMobile: false and isCityVisible: true, Then mounts SafeGLTFModel with PAVED_ESPLANADE_MODEL_URL inside city group. When isMobile: true, Then esplanade is suppressed.

## 6. Definition of Done
- 100% test pass on tests/client/imp437_indochine_executive_atmosphere_and_esplanade.test.ts
- Zero regressions across living tests (imp432, imp107, imp197, imp434, imp435, imp436, imp80, imp196)
- Full prefilter passes (npm run prefilter)
- Sentinel passes with 100% mutant kill (npm run sentinel -- --ticket IMP-437)
- Physical visual capture: npm run capture:visual -- --ticket IMP-437 --scenario default --dual-viewport
- Comprehensive evidence audit: node scripts/check_evidence.mjs IMP-437
