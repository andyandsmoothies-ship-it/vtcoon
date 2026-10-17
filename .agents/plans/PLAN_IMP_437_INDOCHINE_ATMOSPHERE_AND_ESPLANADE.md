# Implementation Plan: IMP-437 Indochine Executive Tabletop Art Direction & VIP Salon Atmosphere Overhaul

## 1. Physical Surface Area & Target Files
| Target File | Tier | Current LOC | Expected LOC | Net Delta | Subsystem | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/3d/board_layout.tsx` | Tier 2 | 278 | 309 | +31 | client-3d | Hardened |
| `src/client/3d/diorama/diorama_terrain.tsx` | Tier 2 | 166 | 174 | +8 | client-3d | Hardened |
| `src/client/3d/diorama/batched_diorama_terrain.tsx` | Tier 2 | 148 | 148 | +0 | client-3d | Hardened |
| `tests/client/imp437_indochine_executive_atmosphere_and_esplanade.test.ts (New)` | Living Tests (New) | 0 | 280 | +280 | client-3d | New |

> **Architecture Commitment (LOC Buffer Zone Guard)**: All target files remain strictly within Tier 2 ceilings (<= 500 LOC). `miniature_city_diorama.tsx` (393 LOC) is frozen and excluded from modification to prevent breaking `TC-197.28` (<= 400 LOC ceiling). Asset build script `scripts/blender/build_indochine_paved_esplanade.py` generates `public/models/board/indochine_paved_esplanade.glb`.

## 2. Core Contract Invariants
- **[INV-SALON-ATMOSPHERE-DESKTOP]**: In `board_layout.tsx`, `TabletopSalonAtmosphere` mounts when `!isMobile`, setting `scene.background = new Color('#0B110E')`, `scene.fog = new FogExp2('#0B110E', 0.012)`, and activating warm 3200K chandelier key light (`#FFF2D6`, intensity $\ge 0.75$) at $[10, 24, 14]$. Mobile mode and unmounted environments retain standard daylight.
- **[INV-PAVED-ESPLANADE-ASSET]**: `PAVED_ESPLANADE_MODEL_URL = '/models/board/indochine_paved_esplanade.glb'`. Asset <= 180KB, <= 3,500 tris, 1 draw call. Contains: (1) circular beveled stone promenade around arena ($R \in [1.68, 2.05]\text{m}$), (2) granite esplanades flanking S-river curves, (3) deepened central velvet well ($Y = -0.035\text{m}$) with enlarged high-contrast Dong Son bronze medallion ($R \approx 1.52\text{m}$, dual-tone `#D4AF37` / `#2E2012`).
- **[INV-DEEP-MOSS-TURF-SERENE]**: When `isSereneTabletop = true`, `BatchedDioramaLandmasses` and `DioramaTerrain` render terrain grass as deep forest moss `#0C2919` (roughness $\ge 0.90$), eliminating the bright `#15803D` soccer turf.
- **[INV-RAYCAST-AND-CLEARANCE]**: Raycast datum $Y = 0.103$ (corner $0.115$) and 40 tile coordinates remain immutable. Promenade curbstones respect $R \ge 1.68\text{m}$ clearance and provide $>3.5\text{m}$ clearance from docked cruiser.

## 3. Principles Applied
- **[View-Model Seam Extraction & Lighting Decoupling]**: Desktop VIP salon atmosphere encapsulated in `TabletopSalonAtmosphere` without mutating shared `TIME_OF_DAY_PRESETS`, protecting living test suites (`imp80`, `imp196`).
- **[Spatial AABB / Non-Occlusion]**: Paved esplanade follows S-curve riverbanks and circular arena rim without clipping bridge abutments or docked harbor cruiser.
- **[Resource Disposal & Cache Hygiene]**: Additive esplanade GLB merged into single draw call (<= 180 KB), avoiding VRAM accumulation.
- **[Platform DI Isolation]**: Heavy salon atmosphere and esplanade GLB guarded under `!isMobile` / `isDesktopLean`, protecting mobile GPU and battery.

## 4. Drop-in Implementation Snippets

**Target physical file**: `src/client/3d/board_layout.tsx`
```tsx
<<<<
import React, { useCallback, useMemo } from 'react';
====
import React, { useCallback, useMemo, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Color, FogExp2 } from 'three';
>>>>
```

```tsx
<<<<
export interface GameBoardProps {
====
export function TabletopSalonAtmosphere({ isDesktopLean = false }: { readonly isDesktopLean?: boolean }): React.ReactElement | null {
  const { scene } = useThree();
  useEffect(() => {
    if (!isDesktopLean) return;
    const prevBg = scene.background;
    const prevFog = scene.fog;
    scene.background = new Color('#0B110E');
    scene.fog = new FogExp2('#0B110E', 0.012);
    return () => {
      scene.background = prevBg;
      scene.fog = prevFog;
    };
  }, [isDesktopLean, scene]);

  if (!isDesktopLean) return null;
  return (
    <directionalLight
      position={[10, 24, 14]}
      intensity={0.85}
      color="#FFF2D6"
      castShadow
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
          {/* Lớp thảm cỏ trung tâm nối liền bán đảo Tây/Đông với bờ kè đá S-Curve */}
          {infillGeom && (
            <mesh receiveShadow geometry={infillGeom} data-testid="diorama-tabletop-infill">
              <meshStandardMaterial color="#15803D" roughness={0.85} side={DoubleSide} />
            </mesh>
          )}
====
          {/* Lớp thảm rêu nhung trung tâm nối liền bán đảo Tây/Đông với bờ kè đá S-Curve */}
          {infillGeom && (
            <mesh receiveShadow geometry={infillGeom} data-testid="diorama-tabletop-infill">
              <meshStandardMaterial color="#0C2919" roughness={0.92} side={DoubleSide} />
            </mesh>
          )}
          {/* Đại lộ dạo bộ lát đá Granite & Bờ kè esplanade (Indochine Paved Esplanade) */}
          <SafeGLTFModel
            url={PAVED_ESPLANADE_MODEL_URL}
            position={[0, 0, 0]}
            receiveShadow
            fallback={null}
          />
>>>>
```

**Target physical file**: `src/client/3d/diorama/batched_diorama_terrain.tsx`
```tsx
<<<<
      <mesh geometry={geoms.grassGeom} receiveShadow raycast={noopRaycast}>
        <meshStandardMaterial color="#15803D" roughness={0.85} />
      </mesh>
====
      <mesh geometry={geoms.grassGeom} receiveShadow raycast={noopRaycast}>
        <meshStandardMaterial color={isSereneTabletop ? "#0C2919" : "#15803D"} roughness={0.92} />
      </mesh>
>>>>
```

## 5. Station 1 Test Specifications
- TC-437.01 [UC-PAVED-ESPLANADE-ASSET-BOUNDS/MSS]: Given PAVED_ESPLANADE_MODEL_URL, When checking physical asset and GLB binary accessors, Then file size is <= 180KB, triangle count is <= 3500 tris, circular promenade has vertices within R in [1.68, 2.05]m, and bronze medallion satisfies R in [1.45, 1.55]m.
- TC-437.02 [UC-PAVED-ESPLANADE-PBR-MATERIALS/MSS]: Given paved esplanade asset, When inspecting material accessors, Then contains granite stone material (#94A3B8 / #475569) and high-contrast dual-tone bronze (#D4AF37, metalness >= 0.85).
- TC-437.03 [UC-TABLETOP-SALON-ATMOSPHERE-DESKTOP/MSS]: Given GameBoard in desktop tabletop mode (!isMobile), When inspecting TabletopSalonAtmosphere, Then mounts warm directional chandelier light with color #FFF2D6 and intensity >= 0.75 at [10, 24, 14].
- TC-437.04 [UC-TABLETOP-SALON-ATMOSPHERE-MOBILE-ISOLATION/MSS]: Given GameBoard in mobile mode (isMobile: true), When rendered, Then TabletopSalonAtmosphere is suppressed to protect battery and mobile performance.
- TC-437.05 [UC-DEEP-MOSS-TURF-SERENE-PALETTE/MSS]: Given DioramaTerrain and BatchedDioramaLandmasses rendered with isSereneTabletop: true, When checking grass materials, Then both use deep moss tone #0C2919 with roughness >= 0.90 instead of bright #15803D.
- TC-437.06 [UC-DIORAMA-TERRAIN-ESPLANADE-WIRING/MSS]: Given DioramaTerrain in serene tabletop mode, When rendered, Then mounts SafeGLTFModel with PAVED_ESPLANADE_MODEL_URL while preserving living testids.

## 6. Definition of Done
- 100% test pass on tests/client/imp437_indochine_executive_atmosphere_and_esplanade.test.ts
- Zero regressions across living tests (imp107, imp197, imp434, imp435, imp436, imp80, imp196)
- Full prefilter passes (npm run prefilter)
- Sentinel passes with 100% mutant kill (npm run sentinel -- --ticket IMP-437)
- Physical visual capture: npm run capture:visual -- --ticket IMP-437 --scenario default --dual-viewport
- Comprehensive evidence audit: node scripts/check_evidence.mjs IMP-437
