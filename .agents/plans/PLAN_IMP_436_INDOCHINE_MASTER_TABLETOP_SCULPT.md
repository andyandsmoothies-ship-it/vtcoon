# Implementation Plan: IMP-436 Indochine Master Tabletop Sculpt & VIP Atmosphere

## 1. Physical Surface Area & Target Files
| Target File | Tier | Current LOC | Expected LOC | Net Delta | Subsystem | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/3d/board_layout.tsx` | Tier 2 | 270 | 278 | +8 | client-3d | Hardened |
| `src/client/3d/miniature_city_diorama.tsx` | Tier 2 | 388 | 393 | +5 | client-3d | Hardened |
| `src/client/3d/diorama/diorama_terrain.tsx` | Tier 2 | 159 | 159 | +0 | client-3d | Hardened |
| `scripts/blender/build_indochine_master_landscape.py (New)` | Toolchain / Asset Gen | 0 | 280 | +280 | toolchain-blender | New |
| `tests/client/imp436_indochine_master_tabletop_sculpt.test.ts (New)` | Living Tests (New) | 0 | 260 | +260 | client-3d | New |

> **Architecture Commitment (LOC Buffer Zone Guard)**: `miniature_city_diorama.tsx` reaches 393 LOC (< 400 test barrier in `imp197` and < 500 Tier 2 ceiling). No micro-splintering needed; logic remains strictly focused on master diorama presentation wiring.

## 2. Core Contract Invariants
- **[INV-MASTER-LANDSCAPE-ASSET]**: `INDOCHINE_MASTER_LANDSCAPE_URL = '/models/board/indochine_master_landscape.glb'`. Asset <= 380KB, <= 7,500 tris. Contains 4 additive sculpted master features: (1) 3D embossed Dong Son relief medallion (14-ray sun star, 8 chim Lạc cranes, concentric chevron rings at $Y = -0.0185\text{m}$ with bronze `#8C6239`, metallic 0.90, roughness 0.18), (2) Gilded Golden Pagoda pavilion at Northeast river terrace ($X \approx 2.7\text{m}, Z \approx -1.6\text{m}$), (3) 4 corner Bonsai Penjing planters at $(\pm 4.2\text{m}, 0.015\text{m}, \pm 4.2\text{m})$, (4) Organic riverbank boulders clustering along the river curves.
- **[INV-ARENA-RELIEF-AND-CLEARANCE]**: Bronze drum medallion sits within $R \le 1.35\text{m}$ at $Y \in [-0.020, -0.018]\text{m}$. Peripheral features (Golden Pagoda, bonsai planters, boulders) strictly satisfy $R \ge 1.68\text{m}$ non-penetration of the Sunken Arena. Collar peak $Y \le 0.038\text{m}$ preserves $\ge 0.20\text{m}$ dice clearance below `DICE_REST_Y = 0.26\text{m}`.
- **[INV-VIP-TABLETOP-ATMOSPHERE]**: In `board_layout.tsx`, declare `const isDesktopLean = !isMobile;`. Desktop tabletop suppresses `CoastalIslandEnvironment` via `visible={isOceanVisible && !isDesktopLean}` and mounts the extended VIP walnut table plinth (`args={[48.0, 0.19, 48.0]}` at $Y = \text{WALNUT\_TABLE\_Y} - 0.005$) guarded by `{isTableVisible && isDesktopLean}` without altering the $19.2 \times 0.2 \times 19.2$ inner table required by `imp107`.
- **[INV-TURF-SEAM-ELIMINATION]**: In `diorama_terrain.tsx`, `getSereneTerrainInfillGeometry()` elevation is aligned to $Y = 0.005\text{m}$ matching the east/west peninsula grass boxes exactly, eliminating the 1mm step and white arc specular reflection.
- **[INV-DIORAMA-MASTER-WIRING]**: `MiniatureCityDiorama` imports and mounts `SafeGLTFModel(INDOCHINE_MASTER_LANDSCAPE_URL)` guarded by `{isDesktopLean && ...}`, preserving all living testids (`data-testid="miniature-city-diorama"`, `data-testid="central-monument-plaza"`, `data-testid="diorama-urban-canopy"`).
- **[INV-SPATIAL-NON-OCCLUSION]**: Golden Pagoda at $(2.7, -1.6)$ has spatial separation $\ge 3.5\text{m}$ from moored cruiser at $(1.6, 2.2)$, eliminating AABB collisions. 4 bonsai planters at $(\pm 4.2, 0.015, \pm 4.2)$ anchor inner board corners.

## 3. Principles Applied
- **[Spatial AABB / Non-Occlusion]**: Golden Pagoda at $(2.7, -1.6)$ and boulders respect $R \ge 1.68\text{m}$ arena clearance and $>3.5\text{m}$ clearance from harbor cruiser; VIP table plinth extends beneath board at $Y = -0.355\text{m}$ avoiding Z-fighting.
- **[View-Model Seam Extraction & PBR Tuning]**: High-specular antique bronze drum (`#8C6239`, roughness 0.18, metalness 0.90) and gold pagoda (`#D4AF37`, roughness 0.20, metalness 0.85) shine under daylight camera.
- **[Resource Disposal & Cache Hygiene]**: Additive master GLB adds only new VIP features without duplicating existing meshes, avoiding Z-fighting and keeping total diorama draw-calls optimal.
- **[Platform DI Isolation]**: Heavy master GLB and 48m plinth guarded by `isDesktopLean` (`!isMobile`), protecting mobile VRAM and draw-call budget.

## 4. Drop-in Implementation Snippets

**Target physical file**: `src/client/3d/board_layout.tsx`
```tsx
<<<<
      {/* 0. Môi trường Bán đảo Đảo Ngọc nhiệt đới (Vịnh biển, bãi cát, đồi núi & mây trời) */}
      <group visible={isOceanVisible}>
        <CoastalIslandEnvironment
          isMobile={isMobile}
          streamlined={!tierProfile.enableOuterBaySanctuaries}
        />
      </group>
====
      {/* 0. Môi trường Bán đảo Đảo Ngọc nhiệt đới (Ẩn trong chế độ Serene Tabletop để đưa về mặt bàn gỗ VIP) */}
      <group visible={isOceanVisible && isMobile}>
        <CoastalIslandEnvironment
          isMobile={isMobile}
          streamlined={!tierProfile.enableOuterBaySanctuaries}
        />
      </group>

      {/* 0.02. Mặt Bàn Gỗ Óc Chó Thượng Lưu Phòng VIP (Executive VIP Salon Tabletop Plinth) */}
      {isTableVisible && !isMobile && (
        <mesh receiveShadow position={[0, WALNUT_TABLE_Y - 0.005, 0]}>
          <boxGeometry args={[48.0, 0.19, 48.0]} />
          <meshStandardMaterial color="#1C140D" roughness={0.35} metalness={0.05} />
        </mesh>
      )}
>>>>
```

**Target physical file**: `src/client/3d/miniature_city_diorama.tsx`
```tsx
<<<<
export const SUNKEN_ARENA_MODEL_URL = '/models/board/sunken_velvet_dice_arena.glb';
export const BRIDGE_PLAZAS_MODEL_URL = '/models/board/bridge_landing_plazas.glb';
export const INDOCHINE_BIOME_MODEL_URL = '/models/board/indochine_botanical_biome.glb';
====
export const SUNKEN_ARENA_MODEL_URL = '/models/board/sunken_velvet_dice_arena.glb';
export const BRIDGE_PLAZAS_MODEL_URL = '/models/board/bridge_landing_plazas.glb';
export const INDOCHINE_BIOME_MODEL_URL = '/models/board/indochine_botanical_biome.glb';
export const INDOCHINE_MASTER_LANDSCAPE_URL = '/models/board/indochine_master_landscape.glb';
>>>>
```

```tsx
<<<<
      {/* Bệ đá cẩm thạch ngà tiếp đất 4 mố cầu (Bridge Landing Plazas) */}
      <SafeGLTFModel url={BRIDGE_PLAZAS_MODEL_URL} position={[0, 0, 0]} receiveShadow fallback={null} />
====
      {/* Sa bàn Đông Dương Thượng Lưu (Master Landscape Sculpt: Trống Đồng 3D Relief, Chùa Vàng, Bonsai, Đá Tảng) */}
      {isDesktopLean && (
        <SafeGLTFModel url={INDOCHINE_MASTER_LANDSCAPE_URL} position={[0, 0, 0]} receiveShadow fallback={null} />
      )}
      {/* Bệ đá cẩm thạch ngà tiếp đất 4 mố cầu (Bridge Landing Plazas) */}
      <SafeGLTFModel url={BRIDGE_PLAZAS_MODEL_URL} position={[0, 0, 0]} receiveShadow fallback={null} />
>>>>
```

**Target physical file**: `src/client/3d/diorama/diorama_terrain.tsx`
```tsx
<<<<
  const positions: number[] = [];
  const y = 0.004;

  for (let i = 0; i < slices.length - 1; i += 1) {
====
  const positions: number[] = [];
  const y = 0.005;

  for (let i = 0; i < slices.length - 1; i += 1) {
>>>>
```

## 5. Station 1 Test Specifications
- TC-436.01 [UC-MASTER-LANDSCAPE-ASSET/MSS]: Given INDOCHINE_MASTER_LANDSCAPE_URL, When checking physical asset and GLB binary accessors, Then file size is <= 380KB, triangle count is <= 7500 tris, peripheral features have 0 vertices penetrating R < 1.68m, and arena relief vertices are bounded within R <= 1.35m.
- TC-436.02 [UC-BRONZE-DRUM-3D-RELIEF/MSS]: Given master landscape asset, When inspecting Dong Son drum medallion, Then contains 14-ray sun star, chim Lạc birds, and metalness >= 0.85 with Y in [-0.020, -0.018]m.
- TC-436.03 [UC-GOLDEN-PAGODA-AND-BONSAI-COORDS/MSS]: Given master landscape asset, When inspecting landmark coordinates, Then Golden Pagoda is positioned at X ≈ 2.7m, Z ≈ -1.6m (clearance >= 3.5m from cruiser) and 4 bonsai planters are at (±4.2, 0.015, ±4.2).
- TC-436.04 [UC-VIP-TABLETOP-ATMOSPHERE/MSS]: Given GameBoard in desktop tabletop mode, When inspecting rendered groups, Then isolates CoastalIslandEnvironment with visible={isOceanVisible && isMobile} and mounts expanded VIP walnut plinth args={[48.0, 0.19, 48.0]} under !isMobile.
- TC-436.05 [UC-TURF-SEAM-ELEVATION-ALIGNMENT/MSS]: Given DioramaTerrain getSereneTerrainInfillGeometry, When inspecting vertex coordinates, Then top elevation is Y = 0.005m matching east/west peninsula grass boxes.
- TC-436.06 [UC-MINIATURE-CITY-DIORAMA-MASTER-WIRING/MSS]: Given MiniatureCityDiorama, When rendered with isDesktopLean: true, Then mounts SafeGLTFModel with INDOCHINE_MASTER_LANDSCAPE_URL while preserving all living testids.

## 6. Definition of Done
- 100% test pass on tests/client/imp436_indochine_master_tabletop_sculpt.test.ts
- Zero regressions across living tests (imp107, imp434, imp435, imp379, imp142, imp405, imp429)
- Full prefilter passes (npm run prefilter)
- Sentinel passes with 100% mutant kill (npm run sentinel -- --ticket IMP-436)
- Physical visual capture: npm run capture:visual -- --ticket IMP-436 --scenario default --dual-viewport
- Comprehensive evidence audit: node scripts/check_evidence.mjs IMP-436
