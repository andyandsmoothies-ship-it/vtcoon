# Plan IMP-399: Bay Archipelago, 4 Corner Tycoon Sanctuaries & Mobile City Silhouette (Ticket IMP-399)

## 0. Auto-Slicing Roadmap & Context
- **Ticket Objective**: Triển khai **Pha 1** trong Quy hoạch Tổng thể Desktop Ultra & Mobile Parity (`VTCOON_DESKTOP_ULTRA_STRATEGY_REPORT.md` V4.1), tích hợp đầy đủ 5 chỉ thị phản biện `.agents/audit/PLAN_CHALLENGE_IMP-399.md` (`[ADV-01]`..`[ADV-05]`) và 6 chốt chặn kỹ thuật (Draw Call Batching, LOC Ceiling, Anti-TIDD Wiring, Inter-Volume Embedding, Toàn đồ Va chạm Nội đô & SSR Safe Instancing):
  1. *Batched 4 Corner Tycoon Sanctuaries & Bay Archipelago (`<= 5 Draw Calls`, `0 useFrame`)*: Kiến tạo hàm `createBatchedSanctuaryGeometries` trong `coastal_sanctuary_visuals.ts` dùng `mergeGeometries` (và `.dispose()` tức thì các geometry tạm như `batched_diorama_terrain.tsx`) gộp toàn bộ 4 Mũi Bán Đảo Góc tại $(\pm 12.2\text{m}, -0.28\text{m}, \pm 12.2\text{m})$, 4 đảo vệ tinh vịnh biển và 12–20 cây dừa nhiệt đới thành **đúng 5 `BufferGeometry` tĩnh** (`sandBasesGeom`, `walnutDecksGeom`, `brassRimsGeom`, `isletsAndCrownsGeom`, `palmTrunksGeom`). Khóa chặt cắm ngập thể tích (Inter-Volume Embedding $\ge 0.02\text{m}$: đế cát $[-0.38\text{m}, -0.22\text{m}]$, sàn gỗ $[-0.24\text{m}, -0.14\text{m}]$, gờ đồng $[-0.16\text{m}, -0.12\text{m}]$, đảo vệ tinh $[-0.38\text{m}, -0.16\text{m}]$ cao hơn đỉnh sóng Gerstner $-0.248\text{m}$, gốc dừa cắm sâu $0.02\text{m}$).
  2. *Adaptive Desktop Quality Tier (`< 8GB RAM` / iGPU - 100% Wired)*: Thiết lập `resolveDesktopQualityTier` xử lý an toàn `undefined`/`NaN` từ `deviceMemoryGb` / `navigator.deviceMemory` và truyền toàn bộ thuộc tính (`usePhysicalClearcoat`, `castSanctuaryShadows`, `deckRoughness`, `palmInstanceCount`) vào `CornerTycoonSanctuaries` (`metalness={quality.usePhysicalClearcoat ? 0.14 : 0.05}`, `castShadow={quality.castSanctuaryShadows}`, `roughness={quality.deckRoughness}`).
  3. *Batched Mobile City Silhouette (`1 Draw Call`, `0 useFrame`, Full Exclusion Map)*: Khôi phục mật độ kiến trúc nội đô Sài Gòn trên Mobile qua `<BatchedMobileCitySilhouette />` (`miniature_city_diorama.tsx`) ủy quyền khởi tạo `InstancedBufferAttribute` cho `instanceColor`, `instanceMatrix` và `computeBoundingSphere()` sang `populateMobileCitySilhouetteInstancedMesh` tại `diorama_lod_helpers.ts` (kèm `frustumCulled={false}`, `frustumculled="false"`, `castShadow={false}`). Toàn bộ 18 khối có mặt đáy nhúng tại $Y_{\text{bottom}} = 0.012\text{m}$, nằm trong dải $|X| \in [2.35\text{m}, 5.80\text{m}]$ (tuyệt đối không lấn Sông Sài Gòn, Tượng đài trung tâm và Hành lang đi bộ $|X| \le 2.0\text{m}$), cách Nhà Thờ Đức Bà `[-4.3, 3.65]`, Bitexco `[-4.5, -4.4]`, Đồi công viên `[-2.7, -2.5]` $\ge 1.0\text{m}$, và không phạm vào vùng Cảng/Marina Đông Nam ($X > 3.6, Z > 3.2$).
- **Tech Debt Registry**: Nhờ gộp tĩnh 5 `BufferGeometry` ở `coastal_sanctuary_visuals.ts`, phần JSX trong `coastal_island_environment.tsx` chỉ tăng +32 dòng (`236 -> 268 <= 300`, `TC-IMP30/MSS-06`) và `miniature_city_diorama.tsx` chỉ tăng +16 dòng (`368 -> 384 <= 400`, `TC-197.28`) mà không cần code-golfing.

## 1. Physical Target Files & Honest LOC Accounting
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/coastal_sanctuary_visuals.ts` (New file) | Tier 2 (UI/3D/Views) | 0 | 165 | +165 | <= 500 | Safe (< 400 LOC) |
| `src/client/3d/coastal_island_environment.tsx` | Tier 2 (UI/3D/Views) | 236 | 268 | +32 | <= 300 | Safe (< 300 LOC TC-IMP30/MSS-06) |
| `src/client/3d/diorama/diorama_lod_helpers.ts` | Tier 2 (UI/3D/Views) | 89 | 155 | +66 | <= 500 | Safe (< 400 LOC) |
| `src/client/3d/miniature_city_diorama.tsx` | Tier 2 (UI/3D/Views) | 368 | 384 | +16 | <= 400 | Safe (< 400 LOC TC-197.28) |
| `tests/client/imp399_bay_archipelago_and_mobile_city_silhouette.test.ts` (New file) | Living Test | 0 | 190 | +190 | <= 600 | Contract Test Suite |
| `docs/FEATURE_MAP.md` | SSOT Matrix | 92 | 92 | 0 | N/A | Cập nhật Section Gotchas Pillar 13 |

## 2. In-Action Visual Capture Registration
- Scenario: Client 3D Coastal Bay Sanctuaries & Mobile City Silhouette. Visual observation verified via mechanical test suite `imp399_bay_archipelago_and_mobile_city_silhouette.test.ts`, `node scripts/capture_visual_evidence.mjs --ticket IMP-399 --scenario default`, and automated gate `node scripts/check_evidence.mjs IMP-399`.

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
- **TC-399.01 [UC-ADAPTIVE-TIER-LOWRAM/MSS]:** Given `LODLevel.HIGH` and `deviceMemoryGb = 4` (or `NaN` / `0` / `LODLevel.MEDIUM`), When calling `resolveDesktopQualityTier`, Then returns tier `'DESKTOP_BALANCED'` with `usePhysicalClearcoat: false`, `castSanctuaryShadows: false`, and `palmInstanceCount: 16`.
- **TC-399.02 [UC-ADAPTIVE-TIER-ULTRA/A1]:** Given `LODLevel.HIGH`, `deviceMemoryGb = 16` (or `undefined` defaulting to `8`), and `isMobile = false`, When calling `resolveDesktopQualityTier`, Then returns tier `'DESKTOP_ULTRA'` with `usePhysicalClearcoat: true`, `castSanctuaryShadows: true`, and `palmInstanceCount: 20`.
- **TC-399.03 [UC-CORNER-SANCTUARY-EMBEDDING/MSS]:** Given board perimeter bounds `[-9.9, +9.9]`, When calling `getCornerSanctuaryDescriptors`, Then returns 4 corner peninsulas at `(\pm 12.2, -0.28, \pm 12.2)` with inter-volume embedding `>= 0.02m` (sand `[-0.38, -0.22]`, deck `[-0.24, -0.14]`, rim `[-0.16, -0.12]`) and non-coplanar top steps `>= 0.02m`.
- **TC-399.04 [UC-BAY-ARCHIPELAGO-BATCH-GEOM/MSS]:** Given quality tier palm count, When calling `getBayArchipelagoDescriptors` or `createBatchedSanctuaryGeometries`, Then returns 4 islets with top elevation `-0.16m` (`> -0.248m` wave crest), palm trunks embedded `0.02m` into host surfaces, and 5 consolidated `BufferGeometry` instances with valid bounding spheres.
- **TC-399.05 [UC-COASTAL-SANCTUARY-WIRING/MSS]:** Given `CoastalIslandEnvironment` rendered with `isMobile: true` (`deviceMemoryGb: 4`) vs `isMobile: false` (`deviceMemoryGb: 16`), When inspecting `CornerTycoonSanctuaries`, Then renders exactly 5 batched `<mesh>` nodes (`<= 5 Draw Calls`), binds `castShadow` (`false` vs `true`) and walnut deck `metalness` (`0.05` vs `0.14` from `usePhysicalClearcoat`), and preserves `IMP-107` invariants.
- **TC-399.06 [UC-MOBILE-SILHOUETTE-EXCLUSION/MSS]:** Given `diorama_lod_helpers`, When calling `getMobileCitySilhouetteDescriptors`, Then returns 18 urban boxes with bottom elevation `0.012m`, `|X| in [2.35, 5.80]` (outside Saigon River and promenades `|X| <= 2.0`), distance `>= 1.0m` from Cathedral `[-4.3, 3.65]`, Bitexco `[-4.5, -4.4]`, and Park Relief `[-2.7, -2.5]`, and outside SE Port/Marina (`X > 3.6 && Z > 3.2`).
- **TC-399.07 [UC-MOBILE-SILHOUETTE-WIRING/MSS]:** Given `MiniatureCityDiorama` rendered with `isMobile: true` and an uninitialized `InstancedMesh` (`instanceColor === null`), When calling `populateMobileCitySilhouetteInstancedMesh`, Then safely allocates `instanceColor`, populates 18 matrices/colors, and mounts `BatchedMobileCitySilhouette` (`frustumCulled: false`, `frustumculled: "false"`, `castShadow: false`, `0` new `useFrame` subscribers) while keeping `DioramaShophouseBlocks` `null`.
- **TC-399.08 [UC-DESKTOP-SILHOUETTE-BYPASS/A1]:** Given `MiniatureCityDiorama` rendered with `isMobile: false`, When inspecting the component tree for `BatchedMobileCitySilhouette`, Then omits `BatchedMobileCitySilhouette` and renders full desktop `DioramaHighriseBlocks` and `DioramaShophouseBlocks`.

### Station 2: Implementation (GREEN)

#### Task 1: Tạo Pure View-Model & Batched Geometry Builder cho 4 Bán Đảo Góc, Quần Đảo Vịnh & Adaptive Tier
**Target physical file**: `src/client/3d/coastal_sanctuary_visuals.ts` (New file)
```typescript
import type { BufferGeometry } from 'three';
import { LODLevel } from './perf_budget';

export interface DesktopQualityTierSpec {
  readonly tier: 'MOBILE_TBDR' | 'DESKTOP_BALANCED' | 'DESKTOP_ULTRA';
  readonly usePhysicalClearcoat: boolean;
  readonly castSanctuaryShadows: boolean;
  readonly palmInstanceCount: number;
  readonly deckRoughness: number;
}

export interface CornerSanctuaryDescriptor {
  readonly id: string;
  readonly position: readonly [number, number, number];
  readonly baseBottomY: number;
  readonly baseTopY: number;
  readonly deckBottomY: number;
  readonly deckTopY: number;
  readonly rimBottomY: number;
  readonly rimTopY: number;
}

export interface BayIsletDescriptor {
  readonly id: string;
  readonly position: readonly [number, number, number];
  readonly scale: readonly [number, number, number];
  readonly bottomElevation: number;
  readonly topElevation: number;
  readonly color: string;
}

export interface SanctuaryPalmTransform {
  readonly position: readonly [number, number, number];
  readonly surfaceTopY: number;
  readonly trunkBottomY: number;
  readonly scale: number;
  readonly rotationY: number;
}

export interface BatchedSanctuaryGeometries {
  readonly sandBasesGeom: BufferGeometry;
  readonly walnutDecksGeom: BufferGeometry;
  readonly brassRimsGeom: BufferGeometry;
  readonly isletsAndCrownsGeom: BufferGeometry;
  readonly palmTrunksGeom: BufferGeometry;
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

export function createBatchedSanctuaryGeometries(palmCount?: number): BatchedSanctuaryGeometries;
```

#### Task 2: Call-Site Wiring — Tích hợp `CornerTycoonSanctuaries` (`5 Batched Meshes`) vào `coastal_island_environment.tsx`
**Target physical file**: `src/client/3d/coastal_island_environment.tsx`
- Mở rộng `CoastalIslandEnvironmentProps` thêm `readonly deviceMemoryGb?: number`.
- Import `createBatchedSanctuaryGeometries`, `getBayArchipelagoDescriptors`, `getCornerSanctuaryDescriptors`, `resolveDesktopQualityTier` từ `./coastal_sanctuary_visuals` và `perfBudget` từ `./perf_budget`.
- Khai báo `export function CornerTycoonSanctuaries(props?: { readonly isMobile?: boolean; readonly deviceMemoryGb?: number }): React.ReactElement` gọi `const quality = resolveDesktopQualityTier(perfBudget.getCurrentLOD(), props?.deviceMemoryGb, isMobile)` và `const geoms = useMemo(() => createBatchedSanctuaryGeometries(quality.palmInstanceCount, getCornerSanctuaryDescriptors(), getBayArchipelagoDescriptors(quality.palmInstanceCount)), [quality.palmInstanceCount])`, kết xuất đúng **5 thẻ `<mesh>` gộp tĩnh** (`sandBasesGeom` màu `#EFE5D8`, `walnutDecksGeom` màu `#2B1D14` với `castShadow={quality.castSanctuaryShadows}`, `roughness={quality.deckRoughness}`, `metalness={quality.usePhysicalClearcoat ? 0.14 : 0.05}`, `brassRimsGeom` màu `#D97706`, `isletsAndCrownsGeom` màu `#15803D`, `palmTrunksGeom` màu `#78350F` — không dùng `.map()`, không dùng `sphereGeometry`, `#94A3B8`, `#FDE68A`).
- Gắn `<CornerTycoonSanctuaries isMobile={isMobile} deviceMemoryGb={props.deviceMemoryGb} />` vào `CoastalIslandEnvironment` và giữ tổng dòng vật lý $\le 268$ dòng (`<= 300`).

#### Task 3: Call-Site Wiring — Bổ sung `getMobileCitySilhouetteDescriptors` & `populateMobileCitySilhouetteInstancedMesh` trong `diorama_lod_helpers.ts`
**Target physical file**: `src/client/3d/diorama/diorama_lod_helpers.ts`
- Khai báo `export interface MobileCitySilhouetteBox` (`id`, `position`, `scale`, `color`, `bottomElevation`) và `export function getMobileCitySilhouetteDescriptors(): ReadonlyArray<MobileCitySilhouetteBox>` trả về 18 khối kiến trúc tĩnh có mặt đáy nhúng tại $Y_{\text{bottom}} = 0.012\text{m}$, nằm trong dải $|X| \in [2.35\text{m}, 5.80\text{m}]$ (ngoài Sông Sài Gòn & hành lang đi bộ $|X| \le 2.0\text{m}$), cách Nhà Thờ Đức Bà `[-4.3, 3.65]`, Bitexco `[-4.5, -4.4]`, Đồi công viên `[-2.7, -2.5]` tối thiểu $\ge 1.0\text{m}$, và không phạm vào vùng Cảng/Marina Đông Nam ($X > 3.6, Z > 3.2$).
- Khai báo `export function populateMobileCitySilhouetteInstancedMesh(mesh: InstancedMesh | null, descriptors?: ReadonlyArray<MobileCitySilhouetteBox>): number` cấp phát `mesh.instanceColor = new InstancedBufferAttribute(new Float32Array(list.length * 3), 3)` nếu chưa có, ghi `setMatrixAt`, `setColorAt`, kiểm tra an toàn `if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true` và gọi `mesh.computeBoundingSphere()`.

#### Task 4: Call-Site Wiring — Tích hợp `BatchedMobileCitySilhouette` (`1 Draw Call`) vào `miniature_city_diorama.tsx`
**Target physical file**: `src/client/3d/miniature_city_diorama.tsx`
- Import `getMobileCitySilhouetteDescriptors`, `populateMobileCitySilhouetteInstancedMesh` từ `./diorama/diorama_lod_helpers` và dùng `const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : useEffect` (chống cảnh báo SSR khi `renderToStaticMarkup` chạy trên Node).
- Khai báo `export function BatchedMobileCitySilhouette(): React.ReactElement` gọi `populateMobileCitySilhouetteInstancedMesh(meshRef.current, descriptors)` trong `useIsomorphicLayoutEffect`, kết xuất `<instancedMesh ref={meshRef} data-testid="batched-mobile-city-silhouette" args={[undefined, undefined, descriptors.length]} frustumCulled={false} frustumculled="false" castShadow={false}>` (`0 useFrame`).
- Trong `MiniatureCityDiorama`, thay `{!isMobile && <DioramaShophouseBlocks />}` bằng `{isMobile ? <BatchedMobileCitySilhouette /> : <DioramaShophouseBlocks />}` và giữ tổng dòng vật lý $\le 384$ dòng (`<= 400`).

#### Task 5: Cập nhật Feature Map Single Source of Truth
**Target physical file**: `docs/FEATURE_MAP.md`
- Cập nhật Pillar 13 (3D Kinematics & Presentation) ghi nhận `IMP-399` (Batched 4 Corner Tycoon Sanctuaries 5 Draw Calls, Adaptive Desktop Quality Tier `< 8GB RAM`, và Batched Mobile City Silhouette 1 Draw Call).

## 4. Definition of Done (DoD)
- Toàn bộ 8/8 contract tests mới trong `tests/client/imp399_bay_archipelago_and_mobile_city_silhouette.test.ts` và các bộ living tests (`imp107`, `imp197`, `imp338`, `imp371`, `imp379`, `imp383`, `imp385`, `dense_metropolis_architecture.test.ts`, `coastal_island_environment.test.ts`, `imp80_daylight_illumination_and_unified_tile_art.test.ts`) PASS 100%.
- Kiểm tra visual capture qua `node scripts/capture_visual_evidence.mjs --ticket IMP-399 --scenario default`.
- Vượt qua `npm run prefilter -- src/client/3d/coastal_sanctuary_visuals.ts src/client/3d/coastal_island_environment.tsx src/client/3d/diorama/diorama_lod_helpers.ts src/client/3d/miniature_city_diorama.tsx` với exit code 0.
- Vượt qua kiểm toán toàn diện `node scripts/check_evidence.mjs IMP-399` với 0 defects.
