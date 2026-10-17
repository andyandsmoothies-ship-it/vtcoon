# Implementation Plan: IMP-439 Indochine Tabletop Restoration & 4-Pillar Spatial Remediation (Desktop & Mobile)

## 1. Physical Surface Area & Target Files
| Target File | Tier | Current LOC | Expected LOC | Net Delta | Subsystem | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/3d/board_layout.tsx` | Tier 2 | 341 | 343 | +2 | client-3d | Safe |
| `src/client/3d/time_of_day_lighting.tsx` | Tier 2 | 223 | 225 | +2 | client-3d | Safe |
| `src/client/3d/miniature_city_diorama.tsx` | Tier 2 | 392 | 386 | -6 | client-3d | Safe |
| `src/client/3d/diorama/diorama_terrain.tsx` | Tier 2 | 204 | 202 | -2 | client-3d | Safe |
| `src/client/3d/diorama/diorama_heritage_district.tsx` | Tier 2 | 286 | 288 | +2 | client-3d | Safe |
| `src/client/3d/diorama/diorama_skyline.tsx` | Tier 2 | 313 | 313 | +0 | client-3d | Safe |
| `src/client/3d/diorama/diorama_bridges.tsx` | Tier 2 | 382 | 384 | +2 | client-3d | Safe |
| `src/client/3d/toybox_wealth_tray_visuals.ts` | Tier 2 | 305 | 305 | +0 | client-3d | Safe |
| `tests/client/imp437_indochine_executive_atmosphere_and_esplanade.test.ts` | Living Tests | 344 | 344 | +0 | client-3d | Safe |
| `tests/client/imp439_indochine_tabletop_restoration.test.ts (New)` | Living Tests (New) | 0 | 280 | +280 | client-3d | New |

> **Architecture Commitment (LOC Buffer Zone Guard)**: All 8 production target files strictly obey Tier 2 ceilings (`<= 500 LOC`) and `miniature_city_diorama.tsx` reduces from 392 to 386 LOC (`<= 400 LOC`).

## 2. Core Contract Invariants
- **[INV-BANISH-VOID-OCEAN-AND-FRAME-LOOP-PEACE]**: In `board_layout.tsx`, `GameBoard` mounts `<CoastalIslandEnvironment />` inside `<group visible={isOceanVisible}>` across both Desktop and Mobile (`&& isMobile` gate removed), wraps the 48m VIP plinth (`args={[48.0, 0.19, 48.0]}`) and `TabletopSalonAtmosphere` inside `<group visible={!isOceanVisible}>`, and sets `forceFallback` on `PAVED_ESPLANADE_MODEL_URL`. When `!isOceanVisible && !isAuctionActive`, `TabletopSalonAtmosphere` sets `scene.background` and `scene.fog.color` to warm studio slate `#1E293B` while `TimeOfDayLighting` (`time_of_day_lighting.tsx`) guards `updateDiffuseAndAtmosphere` scene background/fog mutation so the two frame loops never fight over `scene.background` or `scene.fog`.
- **[INV-SOUTH-NO-BUILD-ZONE-AND-NE-HORIZON-SYNC]**: Across both Desktop and Mobile (`isSerene = isDesktopLean || isMobile`), the South foreground ($Z \in [0.0, +6.0]$) enforces a strict No-Build Zone ($Y \le 0.08\text{m}$ for central plaza; South Long Bien Bridge at $Z = +3.8$ suppressed via `isDesktopLean={isSerene}` in `DioramaBridges` while preserving North Ba Son Bridge at $Z = -3.8$). `DioramaHeritageDistrict` relocates from `[-4.5, 0.16, 2.9]` to North-East `[4.2, 0.16, -4.2]` ($Z \le 0$) with `forceFallback={true}`, `diorama_skyline.tsx` shifts the NE streetlamp from `[4.1, -4.0]` to `[3.4, -4.0]` (clearance $\approx 1.085\text{m} > 0.55\text{m}$ from `cong-xa-paris-plaza` at `(4.40, -4.42)`), and `toybox_wealth_tray_visuals.ts` syncs `CHAIN_REACTION_STAGE_SPECS[4].worldPosition` (`notre-dame-cathedral`) to `[4.4, 0.20, -3.32]`.
- **[INV-GLB-CLUTTER-PURGE-AND-CROSS-PLATFORM-DONG-SON]**: In `miniature_city_diorama.tsx`, `CentralMonumentPlaza` evaluates `if (isDesktopLean)` before `if (desc.isMobile)` and sets `forceFallback` on `SUNKEN_ARENA_MODEL_URL`; `MiniatureCityDiorama` passes `isDesktopLean={isSerene}` (`isDesktopLean || isMobile`) so both Desktop and Mobile render the 14-ray `createDongSonPlazaTexture()` medallion ($Y \le 0.0505\text{m}$). Raw script GLBs (`BOARD_TERRAIN_BASE_URL`, `DICE_ARENA_PLINTH_URL`, `LANDMARKS_CLUSTER_URL`) are purged, `INDOCHINE_BIOME_MODEL_URL`, `INDOCHINE_MASTER_LANDSCAPE_URL`, and `BRIDGE_PLAZAS_MODEL_URL` enforce `forceFallback`, and `DioramaBridges`, `DioramaSkyline` (Bitexco + 20 `InstancedDioramaTrees`), and `DioramaHeritageDistrict` are visible on both platforms.
- **[INV-ROYAL-EMERALD-TURF-AND-TURQUOISE-RIVER]**: In `miniature_city_diorama.tsx`, `MiniatureCityDiorama` passes `mossPalette={false}` to `DioramaTerrain`. In `diorama_terrain.tsx`, `DioramaTerrain` removes `visible={!mossPalette}` suppression gates, sets `forceFallback` on `SAIGON_RIVER_SPLINE_MODEL_URL` so live WebGL renders `#0284C7` turquoise water (`roughness={0.25}`, `metalness={0.10}`, `opacity={0.88}`), and restores `diorama-tabletop-infill` to `position={[0, 0, 0]}` ($Y = 0.005\text{m}$) with `#15803D` emerald turf.

## 3. Principles Applied
- **[View-Model Seam Extraction]**: Deterministic prop-driven coordinate switching (`isDesktopLean` -> `[4.2, 0.16, -4.2]` vs `[-4.5, 0.16, 2.9]`) and synchronized `CHAIN_REACTION_STAGE_SPECS[4]` at `[4.4, 0.20, -3.32]`.
- **[Spatial AABB / Non-Occlusion]**: Clears South foreground ($Z \in [0.0, +6.0]$) by suppressing Long Bien Bridge ($Z = +3.8, Y = 0.43\text{m}$), relocating Notre Dame Cathedral to NE `[4.2, 0.16, -4.2]`, and shifting NE streetlamp from `[4.1, -4.0]` to `[3.4, -4.0]` to eliminate AABB overlap with `cong-xa-paris-plaza` ($R = 0.55\text{m}$).
- **[100% DTO & Call-Site Wiring]**: `isSerene = isDesktopLean || isMobile` wired from `MiniatureCityDiorama` to `CentralMonumentPlaza`, `DioramaBridges`, and `DioramaHeritageDistrict` for full Desktop + Mobile parity.
- **[Resource Disposal & Cache Hygiene]**: Explicit `forceFallback` props asserted directly on React VDOM nodes to defeat SSR headless mutant survival and prevent redundant GLB network loads.

## 4. Call-Site Wiring & Contract Specifications

### 4.1 `src/client/3d/board_layout.tsx` & `src/client/3d/time_of_day_lighting.tsx` (Pillar 1: Banish the Void & Frame-Loop Peace)
- **`board_layout.tsx`**:
  - In `TabletopSalonAtmosphere`, read `isOceanVisible` from `useDiagnostic3DStore`; early-return in `useSafeFrame` when `!isDesktopLean || isAuctionActive || isOceanVisible`; set `scene.background` and `scene.fog.color` to `#1E293B` when `!isOceanVisible`.
  - In `GameBoard`, change `<group visible={isOceanVisible && isMobile}>` around `<CoastalIslandEnvironment />` to `<group visible={isOceanVisible}>`, wrap the 48m walnut plinth and `<TabletopSalonAtmosphere isDesktopLean={!isMobile} />` in `<group visible={!isOceanVisible}>`, and add `forceFallback` to `<SafeGLTFModel url={PAVED_ESPLANADE_MODEL_URL} ... forceFallback fallback={null} />`.
- **`time_of_day_lighting.tsx`**:
  - Read `isOceanVisible` from `useDiagnostic3DStore`. In `useSafeFrame`, pass `const activeScene = (useDiagnostic3DStore.getState()?.isOceanVisible ?? isOceanVisible) || isAuctionActive ? state.scene : undefined;` into `updateDiffuseAndAtmosphere` so `TimeOfDayLighting` never overwrites `scene.background` or `scene.fog` when `isOceanVisible === false`.

### 4.2 `src/client/3d/miniature_city_diorama.tsx` (Pillar 3: GLB Clutter Purge & Desktop/Mobile Dong Son Unification)
- **`CentralMonumentPlaza`**:
  - Place `if (isDesktopLean)` block BEFORE `const desc = getCentralMonumentLODDescriptor(isMobile); if (desc.isMobile)` and add `forceFallback` to `<SafeGLTFModel url={SUNKEN_ARENA_MODEL_URL} position={[0, 0, 0]} receiveShadow forceFallback fallback={...} />`.
- **`DioramaUrbanCanopy`**:
  - Add `visible={false} forceFallback` to `<SafeGLTFModel url={INDOCHINE_BIOME_MODEL_URL} ... />`.
- **`MiniatureCityDiorama`**:
  - Pass `mossPalette={false}` to `<DioramaTerrain isSereneTabletop={isSerene} mossPalette={false} />`.
  - Render `<CentralMonumentPlaza isMobile={isMobile} isDesktopLean={isSerene} />` outside `<group visible={!isDesktopLean}>` so both Desktop and Mobile (`isSerene = isDesktopLean || isMobile`) render the flat Dong Son Medallion.
  - Purge `BOARD_TERRAIN_BASE_URL`, `DICE_ARENA_PLINTH_URL`, and `LANDMARKS_CLUSTER_URL`; add `forceFallback` to `INDOCHINE_MASTER_LANDSCAPE_URL` (`visible={false} forceFallback`) and `BRIDGE_PLAZAS_MODEL_URL` (`forceFallback fallback={null}`).
  - Remove `visible={!isDesktopLean}` from `ChainLandmark_bason-bridge`, `ChainLandmark_bitexco-tower`, and `ChainLandmark_notre-dame-cathedral`, and pass `isDesktopLean={isSerene}` to `<DioramaBridges isMobile={isMobile} isVisible={isVisible} isDesktopLean={isSerene} />` and `<DioramaHeritageDistrict isMobile={isMobile} isDesktopLean={isSerene} />`.

### 4.3 `src/client/3d/diorama/diorama_terrain.tsx` (Pillar 4: Royal Emerald Turf & Turquoise River)
- Replace `visible={!mossPalette}` on `<SafeGLTFModel url={SAIGON_RIVER_SPLINE_MODEL_URL} ... />` with `forceFallback`, and update fallback water `meshStandardMaterial` to `color="#0284C7" roughness={0.25} metalness={0.10} transparent opacity={0.88}`.
- Restore `diorama-tabletop-infill` to `position={[0, 0, 0]}` and remove `visible={!mossPalette}` from `diorama-tabletop-infill`, `diorama-void-guard`, `BatchedDioramaLandmasses`, and `diorama-park-relief`.

### 4.4 `src/client/3d/diorama/diorama_heritage_district.tsx`, `diorama_skyline.tsx`, `diorama_bridges.tsx` & `toybox_wealth_tray_visuals.ts` (Pillar 2: South No-Build Zone & NE Horizon Sync)
- **`diorama_heritage_district.tsx`**: Add `readonly isDesktopLean?: boolean` to `DioramaHeritageDistrictProps`; set `districtPos = isDesktopLean ? [4.2, 0.16, -4.2] : [-4.5, 0.16, 2.9]` and `forceFallback={isMobile || isDesktopLean ? true : undefined}` on `LANDMARK_MODEL_URLS.cathedral`.
- **`diorama_skyline.tsx`**: Shift NE streetlamp in `STREETLAMP_LOCATIONS` from `[4.1, -4.0]` to `[3.4, -4.0]` so distance to `cong-xa-paris-plaza` `(4.40, -4.42)` is $1.085\text{m} > 0.55\text{m}$.
- **`diorama_bridges.tsx`**: Add `readonly isDesktopLean?: boolean` to `DioramaBridgesProps`; set `visible={!isDesktopLean}` on the South Long Bien Bridge group (`<group position={[0, 0.12, 3.8]} visible={!isDesktopLean}>`) while keeping North Ba Son Bridge (`position={[0, 0, -3.8]}`) visible.
- **`toybox_wealth_tray_visuals.ts`**: Update `CHAIN_REACTION_STAGE_SPECS[4]` (`notre-dame-cathedral`) `worldPosition` from `[-4.3, 0.20, 3.65]` to `[4.4, 0.20, -3.32]` to match the relocated NE Cathedral (`[4.2 + 0.2, 0.20, -4.2 + 0.88]`).

### 4.5 `tests/client/imp437_indochine_executive_atmosphere_and_esplanade.test.ts` (Station 2 QA Living Test Sync)
In Station 2 (QA/Main Agent), update the `MiniatureCityDiorama` moss-wiring assertion (line 324, `TC-437.07`) to `expect(desktopTerrain?.props?.mossPalette).toBe(false)` to reflect the restored Royal Emerald `#15803D` palette on Desktop.

## 5. Station 1 Test Specifications
- TC-439.01 [UC-BANISH-VOID-OCEAN-AND-ESPLANADE-FALLBACK/MSS]: Given `GameBoard` rendered on Desktop (`isMobile: false`) and Mobile (`isMobile: true`) with `isOceanVisible: true`, When inspecting the React element tree, Then `CoastalIslandEnvironment` wrapper group has `visible === true` on both platforms, the 48m VIP plinth wrapper group has `visible === false`, and `PAVED_ESPLANADE_MODEL_URL` `SafeGLTFModel` has `forceFallback === true`.
- TC-439.02 [UC-STUDIO-SLATE-NO-FRAME-FIGHTING/A1]: Given `TabletopSalonAtmosphere({ isDesktopLean: true })` and `TimeOfDayLighting({ isMobile: false })` with `isOceanVisible: false` and `activeModal: null`, When `useSafeFrame` ticks across both components, Then `scene.background` and `scene.fog.color` settle deterministically at `#1E293B` without `TimeOfDayLighting` lerping them back toward `#BAE6FD`.
- TC-439.03 [UC-SOUTH-NO-BUILD-ZONE-AND-NE-CATHEDRAL-SYNC/MSS]: Given `MiniatureCityDiorama` rendered on Desktop (`isDesktopLean: true, isMobile: false`) and Mobile (`isMobile: true`), When inspecting `DioramaHeritageDistrict`, `DioramaBridges`, `DioramaSkyline`, and `CHAIN_REACTION_STAGE_SPECS[4]`, Then `DioramaHeritageDistrict` sits at `[4.2, 0.16, -4.2]` with `forceFallback === true`, South Long Bien Bridge (`[0, 0.12, 3.8]`) has `visible === false` while North Ba Son Bridge (`[0, 0, -3.8]`) is visible, `CHAIN_REACTION_STAGE_SPECS[4].worldPosition` equals `[4.4, 0.20, -3.32]`, and all NE streetlamps maintain distance $> 0.55\text{m}$ from `(4.40, -4.42)`.
- TC-439.04 [UC-GLB-CLUTTER-PURGE-AND-CROSS-PLATFORM-DONG-SON/MSS]: Given `MiniatureCityDiorama` rendered on Desktop (`isDesktopLean: true`) and Mobile (`isMobile: true`), When inspecting `CentralMonumentPlaza` and `SafeGLTFModel` nodes, Then `BOARD_TERRAIN_BASE_URL`, `DICE_ARENA_PLINTH_URL`, and `LANDMARKS_CLUSTER_URL` are absent, `SUNKEN_ARENA_MODEL_URL`, `INDOCHINE_BIOME_MODEL_URL`, and `BRIDGE_PLAZAS_MODEL_URL` all have `forceFallback === true`, and both Desktop and Mobile render the `#8C6239` / `#D4AF37` Dong Son Medallion ($Y \le 0.0505\text{m}$).
- TC-439.05 [UC-ROYAL-EMERALD-TURF-AND-RIVER-RESTORE/MSS]: Given `DioramaTerrain` wired from `MiniatureCityDiorama` on Desktop and Mobile, When inspecting `DioramaTerrain` props and `SAIGON_RIVER_SPLINE_MODEL_URL` node, Then `mossPalette` is `false`, `SAIGON_RIVER_SPLINE_MODEL_URL` has `forceFallback === true`, `diorama-tabletop-infill` sits at `position [0, 0, 0]` with `#15803D` emerald turf, and river water renders `#0284C7`.

## 6. Definition of Done
- 100% test pass on `tests/client/imp439_indochine_tabletop_restoration.test.ts`
- Zero regressions across living tests (`imp68`, `imp70`, `imp379`, `imp402`, `imp428`, `imp429`, `imp431`, `imp432`, `imp433`, `imp434`, `imp435`, `imp436`, `imp437`)
- Full prefilter passes (`npm run prefilter`)
- Sentinel passes with 100% mutant kill (`npm run sentinel -- --ticket IMP-439 --test tests/client/imp439_indochine_tabletop_restoration.test.ts`)
- Physical visual capture: `npm run capture:visual -- --ticket IMP-439 --scenario default --dual-viewport`
- Comprehensive evidence audit: `node scripts/check_evidence.mjs IMP-439`
