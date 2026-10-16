# Plan IMP-399: Desktop Bay Archipelago & 4 Indochine Tycoon Sanctuaries (Ticket IMP-399)

## 0. Auto-Slicing Roadmap & Context
- **Ticket Objective**: Triển khai **Pha 1** trong Quy hoạch Tổng thể Desktop Ultra (`VTCOON_DESKTOP_ULTRA_STRATEGY_REPORT.md` V4.1), khắc phục triệt để các điểm phản biện trong `.agents/audit/FORENSIC_CRITIQUE_IMP-399.md` cùng 3 lỗ hổng nghiệm thu thị giác AAA (Bố cục 4 vùng biển cân xứng, Địa hình Đá vôi & Cây dừa đúc Voronoi/Noise từ Blender 5.2, và Bảo vệ script nguồn Blender 5.2):
  1. *Zero Mobile Pollution (`0` New Mobile Draw Calls, `0` RAM/VRAM Allocations)*: Tuyệt đối giữ nguyên hiện trạng của Mobile (`isMobile === true`) — không chạm `miniature_city_diorama.tsx` / `diorama_lod_helpers.ts`, chặn mount bằng `{!isMobile && <CornerTycoonSanctuaries ... />}` và short-circuit `useMemo` trả về `null` khi `isMobile === true`.
  2. *Balanced 4-Quadrant Archipelago Distribution, True Board Outer Boundary (`±10.15m`) Clearance $\ge 10.60\text{m}$, Pairwise Separation $d \ge R_1 + R_2 + 0.30\text{m}$, Zero GO Foreground & Zero 2D HUD Occlusion*: Biên ngoài thực tế của 40 ô cờ và `PricePillTray` nằm tại $\pm 10.15\text{m}$ (`GRID = 9.0 + depth/2 = 10.15m`). Phân bổ cân xứng 4 Bán Đảo và 4 Đảo Đá Vôi trên cả **4 vùng biển (4 Quadrants)** bao quanh bàn cờ:
     - **Vùng biển Trên-Trái (Tây / Tây-Bắc)**: 2 Bán Đảo (`[-12.4, -0.28, 1.6]` Chiến Mã, `[-12.3, -0.28, 6.2]` Tháp Hải Đăng) + 1 Đảo Đá Vôi (`[-16.2, -0.28, 2.8]`).
     - **Vùng biển Trên-Phải (Bắc / Đông-Bắc)**: 1 Bán Đảo (`[-0.5, -0.28, -12.0]` Siêu Du Thuyền) + 1 Đảo Đá Vôi (`[2.25, -0.28, -18.85]`).
     - **Vùng biển Dưới-Trái (Tây-Nam)**: 1 Bán Đảo (`[-1.2, -0.28, 12.6]` Xe Cổ Đông Dương) + 1 Đảo Đá Vôi (`[2.2, -0.28, 12.5]`).
     - **Vùng biển Dưới-Phải (Đông-Nam)**: 1 Đảo Đá Vôi (`[12.6, -0.28, 0.4]`).
     Mép ngoài cùng cách tâm bàn cờ $\max(|X|, |Z|) - 1.38 \ge \mathbf{10.62\text{m}}$ (cách mép ô cờ $\ge 0.47\text{m}$), khoảng cách từng cặp giữa toàn bộ 8 đảo $d \ge R_1 + R_2 + 0.30\text{m}$, nằm trọn trong khung nhìn `CAMERA_CONFIG.overview` (`|ndcX| <= 0.85, |ndcY| <= 0.82`), né hoàn toàn vùng phủ 2D `TopBar`, `PlayerHudList`, `ActionDock`, `FpsPill`, và không che khuất góc GO Đông-Nam (`X > 6 && Z > 6`).
  3. *Blender 5.2 Sculpted `.glb` Luxury Models (`SafeGLTFModel`, Heroic Monument Scale `[1.50..1.75]`) & Permanent Blender Generator Script*: Lưu trữ vĩnh viễn script `scripts/model_generators/blender_sanctuary_assets.py` và tích hợp vào `scripts/generate_high_fidelity_models.mjs` để đúc 4 mô hình `.glb` điêu khắc bằng **Blender 5.2.2 LTS** (`pawn_horse.glb`, `pawn_tower.glb`, `pawn_yacht.glb`, `pawn_car.glb`, `<= 32KB`, `<= 1188 tris`, `Pivot [0,0,0]` tại đáy, nâng cấp đồng thời cả 4 tượng đài bán đảo lẫn quân cờ người chơi trên bàn cờ). Trên đỉnh mỗi bệ đá cẩm thạch tiện tròn (`LatheGeometry` trong `marblePedestalsGeom`), đặt trực tiếp 4 mô hình `.glb` với `modelScale` trong `[1.50..1.75]` qua `<SafeGLTFModel fallback={<group />} />` kết hợp `SafeGLTFModel.preload(url)` trên Desktop.
  4. *Blender 5.2 Voronoi/Turbulence-Displaced Karst Islets & Ringed/V-Folded Sculpted Coconut Palms (`coastal_sanctuary_blender_meshes.ts`) & 100% DTO Property Wiring*: Loại bỏ hoàn toàn việc ghép khối `CylinderGeometry` / `BoxGeometry` thô của Three.js cho núi đá vôi và cây dừa. Sử dụng Blender 5.2 (`bmesh` + `mathutils.noise.voronoi` + `turbulence_vector`) trong `scripts/model_generators/blender_sanctuary_assets.py` để đúc và xuất các archetype địa hình/thực vật có độ sần tự nhiên sang `src/client/3d/coastal_sanctuary_blender_meshes.ts` (`BLENDER_KARST_SPIRE_A`, `BLENDER_KARST_SPIRE_B`, `BLENDER_KARST_SHRUB`, `BLENDER_RINGED_PALM_TRUNK`, `BLENDER_VFOLD_PALM_FROND`). Tuân thủ 100% DTO Property Wiring (`lagoonWidth`, `baseWidth`, `ndcX`, `ndcY`, `scale[1]`, `surfaceTopY`, `navigator.deviceMemory`).
- **Tech Debt Registry**: Phần JSX trong `coastal_island_environment.tsx` chỉ tăng +39 dòng (`236 -> 275 <= 300`, bảo toàn `TC-IMP30/MSS-06`).

## 1. Physical Target Files & Honest LOC Accounting
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/coastal_sanctuary_visuals.ts` (New file) | Tier 2 (UI/3D/Views) | 0 | 396 | +396 | <= 500 | Safe (365 SLOC / 396 Lines) |
| `src/client/3d/coastal_sanctuary_blender_meshes.ts` (New file) | Tier 2 (UI/3D/Views) | 0 | 145 | +145 | <= 500 | Safe (136 SLOC / 145 Lines) |
| `src/client/3d/coastal_island_environment.tsx` | Tier 2 (UI/3D/Views) | 275 | 275 | 0 | <= 300 | Safe (252 SLOC / 275 Lines <= 300 TC-IMP30/MSS-06) |
| `scripts/generate_high_fidelity_models.mjs` | Tooling Facade | 134 | 134 | 0 | <= 200 | Safe (119 SLOC / 134 Lines) |
| `tests/client/imp399_bay_archipelago_and_mobile_city_silhouette.test.ts` (New file) | Living Test | 0 | 262 | +262 | <= 600 | Contract Test Suite (236 SLOC / 262 Lines, 11 tests) |
| `docs/FEATURE_MAP.md` | SSOT Matrix | 92 | 92 | 0 | N/A | Cập nhật Section Gotchas Pillar 13 |
- **Blender 5.2 Sculpted Assets & Generator (In-Scope)**: `scripts/model_generators/blender_sanctuary_assets.py`, `public/models/pawns/pawn_horse.glb`, `public/models/pawns/pawn_tower.glb`, `public/models/pawns/pawn_yacht.glb`, `public/models/pawns/pawn_car.glb`, `scripts/sentinel_probes/IMP-399.json`.

## 2. In-Action Visual Capture Registration
- Scenario: Client 3D Desktop Bay Archipelago & 4 Indochine Tycoon Sanctuaries. Visual observation verified via `imp399_bay_archipelago_and_mobile_city_silhouette.test.ts`, `node scripts/capture_visual_evidence.mjs --ticket IMP-399 --dual-viewport --scenario default --wait 8000`, and `node scripts/check_evidence.mjs IMP-399`.

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
- **TC-399.01 [UC-ADAPTIVE-TIER-LOWRAM/MSS]:** Given `LODLevel.HIGH` and `deviceMemoryGb = 4` (or `NaN` / `0` / `LODLevel.MEDIUM` / `isMobile = true`), When calling `resolveDesktopQualityTier`, Then returns `'DESKTOP_BALANCED'` (`deckMetalness: 0.05`, `deckRoughness: 0.35`, `castSanctuaryShadows: false`, `palmInstanceCount: 16`) for low-RAM desktop and `'MOBILE_BYPASS'` (`palmInstanceCount: 0`) for mobile.
- **TC-399.02 [UC-ADAPTIVE-TIER-ULTRA/A1]:** Given `LODLevel.HIGH`, `deviceMemoryGb = 16` (or `undefined` reading `navigator.deviceMemory` or defaulting to `8`), and `isMobile = false`, When calling `resolveDesktopQualityTier`, Then returns `'DESKTOP_ULTRA'` with `deckMetalness: 0.12`, `deckRoughness: 0.22`, `castSanctuaryShadows: true`, and `palmInstanceCount: 20`.
- **TC-399.03 [UC-SANCTUARY-CLEARANCE-AND-MONUMENT-SCALE/MSS]:** Given true board outer edge `±10.15m` and `CAMERA_CONFIG.overview` (`[24.6, 25.3, 24.6] -> [2.2, 0, 2.2]`, `fov: 24`, aspect `1.6`), When calling `getCornerSanctuaryDescriptors`, Then all 4 sanctuaries span at least 3 distinct coastal flanks (West `X <= -12.0`, North `Z <= -12.0`, South-West `Z >= 12.0`, with `<= 2` per flank and zero in South-East GO foreground `X > 6 && Z > 6`), maintain inner lagoon clearance `max(|X|, |Z|) - lagoonRadius >= 10.60m` (`> 10.15m`), maintain pairwise non-overlap `d >= R1 + R2 + 0.30m`, project within `|ndcX| <= 0.85, |ndcY| <= 0.82`, bind 4 real `.glb` URLs (`/models/pawns/pawn_*.glb`), and enforce heroic monument `modelScale` in `[1.45, 1.75]` across all 3 axes.
- **TC-399.04 [UC-STEPPED-PODIUM-NON-OCCLUSION/MSS]:** Given `getCornerSanctuaryDescriptors`, When inspecting horizontal widths and elevations (`lagoon -> sand -> brassRim -> walnutDeck -> marblePedestal`), Then enforces strict stepped pyramid tapering (`lagoonWidth > baseWidth > rimWidth > deckWidth > pedestalWidth`) while elevations strictly ascend (`baseTopY < rimTopY < deckTopY < pedestalTopY`) with inter-volume embedding `>= 0.02m`.
- **TC-399.05 [UC-MULTI-PART-SCULPTED-GEOMETRY-AND-CACHE/MSS]:** Given `getBayArchipelagoDescriptors(20)` and `createBatchedSanctuaryGeometries`, When inspecting the 8 consolidated `BufferGeometry` layers (`lagoonRingsGeom`, `sandBasesGeom`, `limestoneCliffsGeom`, `brassRimsGeom`, `walnutDecksGeom`, `marblePedestalsGeom`, `palmTrunksGeom`, `foliageCanopyGeom`), Then verifies Blender 5.2 Voronoi-displaced multi-peak karst islet density (`limestoneCliffsGeom` `>= 48` vertices/islet), ringed S-curved trunks (`palmTrunksGeom` `>= 36` vertices/palm) on outer sand ring (`r > rimWidth * 0.5`), 6-frond V-folded radiating canopies (`foliageCanopyGeom` `>= 240` vertices/palm), active DTO wiring (`lagoonWidth`, `baseWidth`, `scale[1]`, `surfaceTopY`, `ndcX/ndcY` frustum filter), cache reuse on default args (`palmCount: 20` vs `16`), and clean reset via `disposeBatchedSanctuaryGeometries()`.
- **TC-399.06 [UC-DESKTOP-GLB-PRELOAD-AND-WALNUT-WIRING/MSS]:** Given `CoastalIslandEnvironment` rendered with `isMobile: false` (`deviceMemoryGb: 16` vs `4`), When inspecting `CornerTycoonSanctuaries`, Then renders the 8 batched terrain/podium meshes plus 4 `<SafeGLTFModel fallback={<group />} />` nodes with `modelScale >= 1.45`, triggers `SafeGLTFModel.preload` for all 4 `.glb` emblems, binds `createWalnutTabletopTexture()` and `deckMetalness` (`0.12` vs `0.05`), and preserves `IMP-107` SSR invariants (zero `#94A3B8`).
- **TC-399.07 [UC-MOBILE-ZERO-ALLOCATION-ISOLATION/A1]:** Given `CoastalIslandEnvironment` and `CornerTycoonSanctuaries` rendered with `isMobile: true`, When inspecting the component tree, Then `CoastalIslandEnvironment` omits `CornerTycoonSanctuaries` (`null`), and direct calls to `CornerTycoonSanctuaries({ isMobile: true })` short-circuit `useMemo` to `null` (`0` meshes, `0` `.glb` mounts, `0` geometry/texture allocations on Mobile).

### Station 2: Implementation (GREEN)

#### Task 1: Tạo Blender 5.2 Voronoi-Displaced Karst & Sculpted Coconut Palm Archetypes + Pure View-Model Builder
**Target physical files**: `src/client/3d/coastal_sanctuary_blender_meshes.ts` & `src/client/3d/coastal_sanctuary_visuals.ts`
```typescript
import type { BufferGeometry } from 'three';
import { LODLevel } from './perf_budget';

export interface BlenderSculptedArchetype {
  readonly positions: ReadonlyArray<number>;
  readonly indices: ReadonlyArray<number>;
}

export function createBlenderArchetypeGeometry(archetype: BlenderSculptedArchetype): BufferGeometry;

export interface DesktopQualityTierSpec {
  readonly tier: 'MOBILE_BYPASS' | 'DESKTOP_BALANCED' | 'DESKTOP_ULTRA';
  readonly deckMetalness: number;
  readonly deckRoughness: number;
  readonly castSanctuaryShadows: boolean;
  readonly palmInstanceCount: number;
}

export interface CornerSanctuaryDescriptor {
  readonly id: string;
  readonly position: readonly [number, number, number];
  readonly ndcX: number;
  readonly ndcY: number;
  readonly lagoonRadius: number;
  readonly baseRadius: number;
  readonly lagoonWidth: number;
  readonly baseWidth: number;
  readonly rimWidth: number;
  readonly deckWidth: number;
  readonly pedestalWidth: number;
  readonly baseBottomY: number;
  readonly baseTopY: number;
  readonly rimBottomY: number;
  readonly rimTopY: number;
  readonly deckBottomY: number;
  readonly deckTopY: number;
  readonly pedestalBottomY: number;
  readonly pedestalTopY: number;
  readonly modelUrl: string;
  readonly modelPosition: readonly [number, number, number];
  readonly modelScale: readonly [number, number, number];
  readonly modelRotationY: number;
}

export interface BayIsletDescriptor {
  readonly id: string;
  readonly position: readonly [number, number, number];
  readonly ndcX: number;
  readonly ndcY: number;
  readonly lagoonRadius: number;
  readonly scale: readonly [number, number, number];
  readonly bottomElevation: number;
  readonly rockTopElevation: number;
  readonly topElevation: number;
}

export interface SanctuaryPalmTransform {
  readonly position: readonly [number, number, number];
  readonly surfaceTopY: number;
  readonly trunkBottomY: number;
  readonly scale: number;
  readonly tiltX: number;
  readonly tiltZ: number;
  readonly rotationY: number;
}

export interface BatchedSanctuaryGeometries {
  readonly lagoonRingsGeom: BufferGeometry;
  readonly sandBasesGeom: BufferGeometry;
  readonly limestoneCliffsGeom: BufferGeometry;
  readonly brassRimsGeom: BufferGeometry;
  readonly walnutDecksGeom: BufferGeometry;
  readonly marblePedestalsGeom: BufferGeometry;
  readonly palmTrunksGeom: BufferGeometry;
  readonly foliageCanopyGeom: BufferGeometry;
}

export function resolveDesktopQualityTier(
  lodLevel?: LODLevel,
  deviceMemoryGb?: number,
  isMobile?: boolean
): DesktopQualityTierSpec;

export function getCornerSanctuaryDescriptors(): ReadonlyArray<CornerSanctuaryDescriptor>;

export function getBayArchipelagoDescriptors(palmCount?: number): {
  readonly islets: ReadonlyArray<BayIsletDescriptor>;
  readonly palms: ReadonlyArray<SanctuaryPalmTransform>;
};

export function createBatchedSanctuaryGeometries(
  palmCount?: number,
  corners?: ReadonlyArray<CornerSanctuaryDescriptor>,
  archipelago?: {
    readonly islets: ReadonlyArray<BayIsletDescriptor>;
    readonly palms: ReadonlyArray<SanctuaryPalmTransform>;
  }
): BatchedSanctuaryGeometries;

export function disposeBatchedSanctuaryGeometries(): void;
```

#### Task 2: Call-Site Wiring & Blender 5.2 Asset Pipeline Protection
**Target physical files**: `src/client/3d/coastal_island_environment.tsx` & `scripts/generate_high_fidelity_models.mjs`
- Tích hợp `CornerTycoonSanctuaries` (`Desktop-Only, 8 Stratified Meshes + 4 SafeGLTFModel`) vào `coastal_island_environment.tsx` (`<= 275` dòng).
- Bảo vệ 4 mô hình `.glb` điêu khắc từ Blender 5.2 (`pawn_horse.glb`, `pawn_tower.glb`, `pawn_yacht.glb`, `pawn_car.glb`) trong `scripts/generate_high_fidelity_models.mjs` bằng cách gọi `scripts/model_generators/blender_sanctuary_assets.py` qua Blender 5.2 CLI thay vì ghi đè bằng khối nguyên thủy Three.js.

#### Task 3: Cập nhật Feature Map Single Source of Truth
**Target physical file**: `docs/FEATURE_MAP.md`
- Cập nhật Pillar 13 (3D Kinematics & Presentation) ghi nhận `IMP-399` với bố cục cân xứng 4 góc biển, địa hình/thực vật đúc Voronoi từ Blender 5.2 (`coastal_sanctuary_blender_meshes.ts`) và bảo tồn script nguồn `scripts/model_generators/blender_sanctuary_assets.py`.

## 4. Definition of Done (DoD)
- Toàn bộ 11/11 contract tests trong `tests/client/imp399_bay_archipelago_and_mobile_city_silhouette.test.ts` và các bộ living tests (`imp62`, `asset_budget`, `imp107`, `imp197`, `imp338`, `imp371`, `imp379`, `imp383`, `imp385`, `dense_metropolis_architecture.test.ts`, `coastal_island_environment.test.ts`, `imp80_daylight_illumination_and_unified_tile_art.test.ts`) PASS 100%.
- Kiểm tra ảnh chụp WebGL thực tế qua `node scripts/capture_visual_evidence.mjs --ticket IMP-399 --dual-viewport --scenario default --wait 8000`: thấy rõ 8 hòn đảo phân bổ cân xứng trên cả 4 vùng biển quanh bàn cờ (4 Bán Đảo tượng đài `.glb` + 4 Đảo Đá Vôi Hạ Long đúc Voronoi từ Blender 5.2) trên `imp-399_desktop.jpg`, và `imp-399_mobile_360.jpg` sạch 100%.
- Vượt qua `npm run prefilter` và `node scripts/check_evidence.mjs IMP-399` với 0 defects.
