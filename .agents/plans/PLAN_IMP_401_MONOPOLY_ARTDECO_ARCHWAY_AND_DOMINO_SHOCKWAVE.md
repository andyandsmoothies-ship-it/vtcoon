# Plan IMP-401: Desktop Art Deco Monopoly Archways (.glb) & Domino Shockwave Ripple (Ticket IMP-401)

## 0. Auto-Slicing Roadmap & Context
- **Ticket Objective**: Triển khai **Pha 2 (Ticket IMP-401 — đổi mã từ IMP-400 để tránh xung đột với bộ báo cáo `400-android-depth-stabilization` trên đĩa)** trong Quy hoạch Tổng thể Desktop Ultra (`VTCOON_DESKTOP_ULTRA_STRATEGY_REPORT.md` V5.0 — Blender 5.2 Pipeline), tích hợp đầy đủ 5 chỉ thị phản biện `.agents/audit/PLAN_CHALLENGE_IMP-401.md` (`[ADV-01]`..`[ADV-05]`) và 4 chốt chặn hình học/nghiệp vụ:
  1. *Blender 5.2 Sculpted `.glb` Archway, Locked Base Dimensions (`0.72m x 0.68m x 0.14m`) & Persisted Python Generator (`scripts/blender/build_monopoly_archway.py`)*: Viết và lưu trữ vĩnh viễn kịch bản Python Blender 5.2 LTS `scripts/blender/build_monopoly_archway.py` để đúc mô hình Cổng Vòm Đại Lộ Độc Quyền Đông Dương Art Deco xuất ra `public/models/landmarks/monopoly_archway_artdeco.glb` (`<= 48KB`, `<= 1500 tris`, `Pivot [0, 0, 0]` chính giữa mặt đáy chân cổng). Khóa cứng hộp bao cơ sở (unscaled bounding box) trong Blender ở mức **rộng `0.72m` × cao `0.68m` × sâu `0.14m`**, dùng `bmesh` + `Boolean Modifier` khoét vòm cuốn bậc thang Art Deco + `Bevel Modifier (3 segments)` vát cạnh bắt sáng + `Weighted Normals` + 3 khe vật liệu PBR (`Mat_CarraraMarble` `#F8FAFC`, `Mat_BrushedBrass` `#D97706`, `Mat_EmissiveGold` `#F59E0B`). **CẤM TUYỆT ĐỐI** việc dùng `BoxGeometry`/`CylinderGeometry`/`ExtrudeGeometry` của Three.js trong file `.ts` để giả làm cổng vòm.
  2. *Contiguous Sub-Spans Math, Zero Header/Title Occlusion (`[ADV-01]`) & Zero Building Collision (`localZ = -1.24m`, Tangent Offset for 1-Cell Segments)*: Trong `BOARD_CONFIG`, cả 8 nhóm màu đều có ô chức năng xen giữa (`Nau [1, 3]` kẹp ô `2`; `XanhDaTroi [6, 8, 9]` kẹp ô `7`; `Hong [11, 13, 14]` kẹp ô `12`; `Cam [16, 18, 19]` kẹp ô `17`; `Do [21, 23, 24]` kẹp ô `22`; `Vang [26, 27, 29]` kẹp ô `28`; `XanhLa [31, 32, 34]` kẹp ô `33`; `Tim [37, 39]` kẹp ô `38`). Mặt thẻ ô cờ (`1.64m x 2.16m` tại `localY = 0.103m`) trải từ `localZ = -1.08m` đến `+1.08m` (dải màu tiêu đề và tên thành phố `meta.title` ở `[-1.080m, -0.724m]`), trong khi tòa nhà `ProceduralBuilding` đặt tại `localZ = -1.38m` (mặt tiền tòa nhà vươn ra tới `localZ = -1.102m`, khoảng trống giữa 2 tòa nhà trên 2 ô liền kề là `1.22m`). Do đó, `splitContiguousMonopolySegments` và `getMonopolyBoulevardSegments` trong `src/client/3d/monopoly_plaza_visuals.ts` tách mọi nhóm màu thành các phân đoạn liền kề (`|cellA - cellB| === 1` trên cùng 1 cạnh `Math.floor(c / 10)`):
     - Hành lang Đá Cẩm Thạch (`MarblePromenade`) chỉ nối liền các ô kề sát nhau trong cùng 1 phân đoạn và đặt hoàn toàn bên ngoài mép trên `-1.08m` của thẻ ô cờ (`localZ = -1.16m`, `promenadeDepth = 0.16m` trải từ `-1.24m` đến `-1.08m` sao cho `localZ + promenadeDepth / 2 <= -1.08m`, `promenadeHeight = 0.024m`, rộng `cells.length * 1.80 - 0.12`), tuyệt đối KHÔNG đè lên dải màu tiêu đề/tên thành phố và KHÔNG bắc cầu qua ô chức năng hay góc bàn cờ (`0, 10, 20, 30`).
     - Đặt Cổng Vòm `.glb` (`monopoly_archway_artdeco.glb`) qua `<SafeGLTFModel fallback={<group />} />` với `archwayScale: [1.25, 1.25, 1.25]` (trong khoảng `[1.15, 1.35]`, bề ngang thực tế `0.72m * 1.25 = 0.90m <= 1.05m` lọt gọn vào khe trống `1.22m` giữa 2 tòa nhà tại `localZ = -1.24m`, `Y = 0.118m`):
       - Với phân đoạn chính có `>= 2` ô liền kề (`[8,9]`, `[13,14]`, `[18,19]`, `[23,24]`, `[26,27]`, `[31,32]`): tâm phân đoạn nằm đúng tại ranh giới khe giữa 2 ô (`localX = 0` của phân đoạn), nên cổng vòm (`archwayScale: [1.25, 1.25, 1.25]`) đứng chính giữa khe `1.22m` giữa 2 tòa nhà mà không chạm vào bất kỳ tòa nhà nào.
       - Với phân đoạn chính chỉ có `1` ô (`cells.length === 1` ở nhóm `Nau [3]` và `Tim [39]`): dịch chuyển `archwayWorldPosition` dọc theo tiếp tuyến cạnh bàn cờ `localX = -0.56m` (`0.55m <= |localX| <= 0.65m`) tại `localZ = -1.24m` kèm `archwayScale: [0.75, 1.15, 1.15]` (bán kính ngang `0.27m`), đảm bảo mép ngoài cổng `|-0.56| + 0.27 = 0.83m <= 0.84m` nằm gọn 100% trong biên thảm đá `1.68m` (không tràn sang ô chức năng kế bên) và mép trong `-0.29m <= -0.283m` không chạm tòa nhà!
  3. *Damped Harmonic Spring Domino Shockwave on Both Construction Slam & Level-0 Monopoly Acquisition (`[ADV-03]`, `[ADV-04]`)*: Cung cấp `getCircularCellDistance`, `calculateDominoRippleTransform(distanceInCells, elapsedMs, options)` và `resolveNeighborDominoSlam(cellIndex, activeSlams, isMobile, nowMs)` (dùng vòng lặp `for (const key in activeSlams)` 0 cấp phát mảng mỗi frame) trong `src/client/3d/monopoly_plaza_visuals.ts`, kết nối vào `ProceduralBuilding` (`src/client/3d/procedural_building.tsx`), `LayeredDioramaTile` (`src/client/3d/board_tile.tsx`), và `MonopolyPlazaFusion` (`src/client/3d/monopoly_plaza_fusion.tsx`):
     - Khi phát hiện nhóm Độc quyền mới hình thành trên Desktop (`hasNewMonopolyGroup(prevMonopolyGroupsRef.current, monopolyGroups)` trong `useEffect` của `MonopolyPlazaFusion`), tự động kích hoạt `useVfxStore.getState().triggerConstructionSlam(anchorCellIndex, 1)` tại ô neo của nhóm độc quyền mới, đồng thời gắn `useSafeFrame` lên `MonopolyPlazaFusionGroup` và bật `showEmptyPlotBoundary={isMonopolyGroup && !isMobile}` tại `board_tile.tsx` để cả cọc ranh giới `SurveyorPlotBoundary` lẫn thảm đá/cổng chào đều nảy sóng Domino thật ở `level === 0`.
     - Trong `ProceduralBuilding`, cổng hóa Zustand selector chỉ theo `isMobile` (`const activeSlams = useVfxStore((s) => (isMobile ? undefined : s.activeSlams))`) và trong `useSafeFrame` tính trực tiếp `const liveNeighborDomino = resolveNeighborDominoSlam(cellIndex, liveSlams, isMobile)` (không fallback `?? neighborDomino` để ngắt ngay khi vượt TTL `900ms`).
     - Hàm `calculateDominoRippleTransform` trả về `{ yOffset: 0, scaleY: 1, pitchRad: 0, isSettled: false }` cho mọi `elapsedMs < distanceInCells * 65` (kể cả `elapsedMs < 0`), dao động tắt dần và tự nghỉ `{ yOffset: 0, scaleY: 1, pitchRad: 0, isSettled: true }` tại `elapsedMs >= 900` (TTL). Hàm `resolveNeighborDominoSlam` ưu tiên slam mới nhất chưa vượt TTL `900ms`, đồng thời reset `rootGroupRef.current.rotation.x = lotTransform.rotation[0]` ở cả nhánh `if (activeSlam)` và `else if (wasSlammingRef.current)` (`[ADV-03]`).
  4. *Strict Mobile Isolation, Hook Order Safety & 100% DTO/Cache Hygiene (`[ADV-02]`, `[ADV-05]`, `TC-IMP125-P3.25`)*: Gọi `useMemo`, `useRef`, `useEffect` và `useSafeFrame` vô điều kiện ở đầu hàm `MonopolyPlazaFusion` trước mọi lệnh `return null` (`[ADV-02]`), short-circuit `useMemo` trả về `null` khi `isMobile === true` hoặc `monopolyGroups` rỗng (`0` tải `.glb`, `0` cấp phát `BufferGeometry` trên Mobile). Sử dụng `seg.cells` tạo vạch nối đồng thau giữa các ô liền kề, gắn `data-board-side={seg.boardSide}` trên `InnerPlazaGarland`, và dùng cache 1-fingerprint tự động `.dispose()` gói `BufferGeometry` cũ khi fingerprint thay đổi (`[ADV-05]`).
  5. *Mandatory Visible `.glb` Archways in Acceptance Screenshot (`--scenario board_ownership_monopoly`)*: Chạy `capture_visual_evidence.mjs --ticket IMP-401 --dual-viewport --scenario board_ownership_monopoly --wait 8000` để kích hoạt đầy đủ 8 bộ Độc quyền, đảm bảo `imp-401_desktop.jpg` hiện rõ các cụm Hành lang Đá Cẩm Thạch và Cổng Vòm Art Deco `.glb` đã tải xong 100% không đè lên tòa nhà hay chữ trên ô cờ.

## 1. Physical Target Files & Honest LOC Accounting
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/monopoly_plaza_visuals.ts` | Tier 2 (UI/3D/Views) | 396 | 396 | 0 | <= 500 | Safe |
| `src/client/3d/monopoly_plaza_fusion.tsx` | Tier 2 (UI/3D/Views) | 165 | 165 | 0 | <= 500 | Safe |
| `src/client/3d/board_layout.tsx` | Tier 2 (UI/3D/Views) | 230 | 230 | 0 | <= 500 | Safe |
| `src/client/3d/board_tile.tsx` | Tier 2 (UI/3D/Views) | 363 | 363 | 0 | <= 500 | Safe |
| `src/client/3d/procedural_building.tsx` | Tier 2 (UI/3D/Views) | 382 | 382 | 0 | <= 500 | Safe |
| `tests/client/imp401_monopoly_artdeco_archway_and_domino_shockwave.test.ts` | Living Test | 486 | 486 | 0 | <= 600 | Contract Test Suite |
| `docs/FEATURE_MAP.md` | SSOT Matrix | 92 | 92 | 0 | N/A | Cập nhật Section Gotchas Pillar 13 |
- **Blender 5.2 Sculpted Assets & Regional Typology Sync (In-Scope)**: `scripts/blender/build_monopoly_archway.py`, `public/models/landmarks/monopoly_archway_artdeco.glb` (`<= 48KB`, `<= 1500 tris`, Base AABB `0.72m x 0.68m x 0.14m`, `Pivot [0,0,0]`), `src/client/3d/building_typology.ts`, `tests/contracts/imp65_building_scale_corner_clearance_and_regional_typologies.test.ts`, `tests/contracts/imp203_bespoke_landmarks_and_housing.test.ts`, `scripts/sentinel_probes/IMP-401.json`.

## 2. In-Action Visual Capture Registration
- Scenario: Client 3D Desktop Art Deco Monopoly Archways & Domino Shockwave Ripple. Visual observation verified via `imp401_monopoly_artdeco_archway_and_domino_shockwave.test.ts`, `node scripts/capture_visual_evidence.mjs --ticket IMP-401 --dual-viewport --scenario board_ownership_monopoly --wait 8000`, and `node scripts/check_evidence.mjs IMP-401`.

## 3. Implementation Steps

### Station 1: Core Contract Invariants (RED — QA Expands Autonomously into 10–14 Atomic 5-Facet Tests in Station 2)
- **TC-401.01 [UC-CONTIGUOUS-SUBSPANS-AND-NON-COLLIDING-ARCHWAY/MSS]:** Given `monopolyGroups` with intervening functional tiles (`[1, 3]` around cell `2`, `[21, 23, 24]` around cell `22`, `[37, 39]` around cell `38`) or cross-corner indices (`[9, 10, 11]`), When calling `splitContiguousMonopolySegments` and `getMonopolyBoulevardSegments`, Then splits strictly into same-side contiguous sub-spans (`[[1], [3]]`, `[[21], [23, 24]]`, `[[37], [39]]`), places `MarblePromenade` strictly outside the `-1.08m` card top edge (`localZ = -1.16m`, front edge `<= -1.08m`), scales `>= 2`-cell `archwayScale` within `[1.15, 1.35]` (total width `<= 1.05m` inside the `1.22m` inter-building gap at `localZ = -1.24m`), and offsets 1-cell primary segments (`[3]`, `[39]`) within `0.55m <= |localX| <= 0.65m` with `archwayScale = [0.75, 1.15, 1.15]` so the archway stays 100% within the `0.84m` promenade half-width and never collides with the building at `localX = 0`.
- **TC-401.02 [UC-BATCHED-PROMENADE-CACHE-AND-DYNAMIC-DISPOSAL/MSS]:** Given `getMonopolyBoulevardSegments` and `createBatchedMonopolyPromenadeGeometries`, When building the 4 consolidated `BufferGeometry` layers (`marblePromenadeGeom`, `brassTrimGeom`, `streetlampsGeom`, `lampBulbsGeom`) and mutating the monopoly fingerprint, Then generates non-empty vertex attributes (including inter-cell brass joint inlays from `seg.cells`), reuses the cached bundle on identical fingerprints, automatically calls `.dispose()` on the superseded geometry bundle when the fingerprint changes, and resets cleanly via `disposeBatchedMonopolyPromenadeGeometries()`.
- **TC-401.03 [UC-DOMINO-SPRING-WAVE-AND-LEVEL0-BUILDING-WIRING/MSS]:** Given circular board indices (`cellA = 39`, `cellB = 1`) and `activeSlams` containing an expired tail slam (`elapsedMs >= 900ms`) alongside a fresh slam at `cell 23`, When calling `getCircularCellDistance`, `calculateDominoRippleTransform`, and `resolveNeighborDominoSlam` wired into `LayeredDioramaTile` (`board_tile.tsx`) and `ProceduralBuilding` (`level = 0` and `level = 2`, `isMobile = false`), Then enforces `delayMs = d * 65` (returning `{ yOffset: 0, scaleY: 1, pitchRad: 0, isSettled: false }` for `elapsedMs < delayMs` including `elapsedMs < 0`), attenuates spring bounce across `1 <= d <= 4` before settling at `elapsedMs >= 900` (TTL), selects the newest unsettled slam with 0 array allocations, enables `showEmptyPlotBoundary` on Desktop `level = 0` Monopoly tiles, ripples both `level = 0` and `level >= 1` plots on Desktop, and resets `rotation.x = lotTransform.rotation[0]` on settle or direct slam interruption.
- **TC-401.04 [UC-DESKTOP-GLB-MONOPOLY-TRIGGER-AND-MOBILE-ISOLATION/MSS]:** Given `GameBoard` (`board_layout.tsx`) and `MonopolyPlazaFusion` transitioning from `{}` to active `monopolyGroups` on Desktop (`isMobile = false`) versus Mobile (`isMobile = true`), When inspecting the rendered tree and VFX state, Then Desktop transitions without Hook errors, triggers `triggerConstructionSlam` upon new monopoly formation (`hasNewMonopolyGroup`), renders the 4 batched promenade meshes + `<SafeGLTFModel url="/models/landmarks/monopoly_archway_artdeco.glb" fallback={<group />} />` with `SafeGLTFModel.preload`, preserves `name="InnerPlazaGarland"` / `data-testid="inner-plaza-garland"` with `data-board-side={seg.boardSide}`, and Mobile (`isMobile = true`) mounts `0` `.glb` models and allocates `0` promenade geometries.

### Station 2: Implementation (GREEN)

#### Task 1: Tạo Pure View-Model Đại Lộ Độc Quyền Phân Đoạn Liền Kề & Toán Học Sóng Domino Lò Xo
**Target physical file**: `src/client/3d/monopoly_plaza_visuals.ts` (New file)
```typescript
import type { BufferGeometry } from 'three';
import type { ActiveSlam } from '../store/vfx_store';
import type { MonopolyGroupInfo } from './monopoly_plaza_math';

export const MONOPOLY_ARCHWAY_MODEL_URL = '/models/landmarks/monopoly_archway_artdeco.glb' as const;
export const MONOPOLY_ARCHWAY_BASE_DIMENSIONS = { width: 0.72, height: 0.68, depth: 0.14 } as const;

export interface MonopolySegmentDescriptor {
  readonly id: string;
  readonly colorGroup: string;
  readonly ownerColor: string;
  readonly cells: ReadonlyArray<number>;
  readonly boardSide: number;
  readonly worldPosition: readonly [number, number, number];
  readonly rotationY: number;
  readonly promenadeWidth: number;
  readonly promenadeDepth: number;
  readonly promenadeHeight: number;
  readonly isPrimaryArchwaySegment: boolean;
  readonly archwayWorldPosition: readonly [number, number, number];
  readonly archwayScale: readonly [number, number, number];
  readonly streetlampPositions: ReadonlyArray<readonly [number, number, number]>;
}

export interface BatchedMonopolyPromenadeGeometries {
  readonly marblePromenadeGeom: BufferGeometry;
  readonly brassTrimGeom: BufferGeometry;
  readonly streetlampsGeom: BufferGeometry;
  readonly lampBulbsGeom: BufferGeometry;
}

export interface DominoRippleOptions {
  readonly waveDelayPerCellMs?: number;
  readonly maxDistanceInCells?: number;
  readonly ttlMs?: number;
  readonly baseAmplitudeY?: number;
  readonly basePitchRad?: number;
  readonly angularFrequency?: number;
  readonly dampingRatio?: number;
}

export interface DominoRippleTransform {
  readonly yOffset: number;
  readonly scaleY: number;
  readonly pitchRad: number;
  readonly isSettled: boolean;
}

export function splitContiguousMonopolySegments(
  cells: ReadonlyArray<number>
): ReadonlyArray<ReadonlyArray<number>>;

export function getMonopolyBoulevardSegments(
  monopolyGroups?: Record<string, MonopolyGroupInfo> | null
): ReadonlyArray<MonopolySegmentDescriptor>;

export function createBatchedMonopolyPromenadeGeometries(
  monopolyGroups?: Record<string, MonopolyGroupInfo> | null,
  segments?: ReadonlyArray<MonopolySegmentDescriptor>
): BatchedMonopolyPromenadeGeometries;

export function disposeBatchedMonopolyPromenadeGeometries(): void;

export function getCircularCellDistance(cellA: number, cellB: number): number;

export function calculateDominoRippleTransform(
  distanceInCells: number,
  elapsedMs: number,
  options?: DominoRippleOptions
): DominoRippleTransform;

export function resolveNeighborDominoSlam(
  cellIndex: number | undefined,
  activeSlams: Readonly<Record<number, ActiveSlam>> | null | undefined,
  isMobile?: boolean,
  nowMs?: number
): { readonly slam: ActiveSlam; readonly distanceInCells: number } | null;
```

#### Task 2: Call-Site Wiring — Nâng cấp `MonopolyPlazaFusion` & Truyền `isMobile` từ `GameBoard` (`board_layout.tsx`)
**Target physical file**: `src/client/3d/monopoly_plaza_fusion.tsx`
- Mở rộng `MonopolyPlazaFusionProps` thêm `readonly isMobile?: boolean`.
- Gọi `useMemo`, `useRef` và `useEffect` vô điều kiện ngay đầu thân hàm `MonopolyPlazaFusion` trước mọi lệnh `return null` (`[ADV-02]`). Bên trong `useMemo`, nếu `isMobile === true` hoặc `!monopolyGroups || Object.keys(monopolyGroups).length === 0` thì trả về `null` ngay lập tức (`0` tải `.glb`, `0` gọi `createBatchedMonopolyPromenadeGeometries`).
- Trong `useEffect` (khi `!isMobile`): dùng `hasNewMonopolyGroup(prevGroupsRef.current, monopolyGroups)` để phát hiện nhóm Độc quyền mới vừa hình thành (kể cả ở `level = 0`) và gọi `useVfxStore.getState().triggerConstructionSlam(anchorCell, 1)` để kích hoạt sóng chấn động Domino trên toàn bộ cụm ô độc quyền; đồng thời đăng ký `useEffect(() => () => disposeBatchedMonopolyPromenadeGeometries(), [])` để giải phóng VRAM khi unmount.
- Khi `!isMobile` (Desktop): gọi `splitContiguousMonopolySegments` qua `getMonopolyBoulevardSegments(monopolyGroups)` và `createBatchedMonopolyPromenadeGeometries(monopolyGroups, segments)` trong `useMemo`, gọi `SafeGLTFModel.preload(MONOPOLY_ARCHWAY_MODEL_URL)`, kết xuất 4 lớp `<mesh>` gộp tĩnh (`marblePromenadeGeom` `#F8FAFC`, `brassTrimGeom` `#D97706`, `streetlampsGeom` `#D97706`, `lampBulbsGeom` `#F59E0B`), giữ các nhóm `name="InnerPlazaGarland"` / `data-testid="inner-plaza-garland"` gắn `data-color-group={seg.colorGroup}`, `data-board-side={seg.boardSide}` và `color={seg.ownerColor}`, đồng thời mount `<SafeGLTFModel key={seg.id} url={MONOPOLY_ARCHWAY_MODEL_URL} position={[...seg.archwayWorldPosition]} rotation={[0, seg.rotationY, 0]} scale={[...seg.archwayScale]} castShadow receiveShadow fallback={<group />} />` cho các phân đoạn chính (`seg.isPrimaryArchwaySegment`).
- Viết kịch bản `scripts/blender/build_monopoly_archway.py` (khóa kích thước gốc `0.72m x 0.68m x 0.14m`, `Pivot [0,0,0]`) và chạy qua Blender 5.2.2 LTS CLI để xuất `public/models/landmarks/monopoly_archway_artdeco.glb` (`<= 48KB`, `<= 1500 tris`).

#### Task 3: Call-Site Wiring — Truyền `isMobile` trong `board_layout.tsx`, Bật `showEmptyPlotBoundary` trong `board_tile.tsx` & Kết nối Sóng Domino Lò Xo trong `procedural_building.tsx`
**Target physical file**: `src/client/3d/board_layout.tsx`
- Tại dòng 226 của `board_layout.tsx`, truyền `isMobile={isMobile}` vào `<MonopolyPlazaFusion monopolyGroups={monopolyGroups} isHeatmapActive={isHeatmapActive} isMobile={isMobile} />`.

**Target physical file**: `src/client/3d/board_tile.tsx`
- Tại dòng 334 của `board_tile.tsx`, truyền `showEmptyPlotBoundary={isMonopolyGroup && !isMobile}` vào `<ProceduralBuilding />` để các ô đất trống (`level = 0`) thuộc bộ Độc quyền trên Desktop hiển thị cọc ranh giới `SurveyorPlotBoundary` và nảy sóng Domino thật.

**Target physical file**: `src/client/3d/procedural_building.tsx`
- Import `calculateDominoRippleTransform`, `getCircularCellDistance`, và `resolveNeighborDominoSlam` từ `./monopoly_plaza_visuals`.
- Trong `ProceduralBuilding`, cổng hóa Zustand selector `const activeSlams = useVfxStore((s) => (isMobile ? undefined : s.activeSlams))` và tính `neighborDomino = resolveNeighborDominoSlam(cellIndex, activeSlams, isMobile)` bên ngoài selector (`[ADV-04]`, sử dụng `getCircularCellDistance(cellIndex, slam.cellIndex)` trong bán kính `1..4` và ưu tiên slam mới nhất chưa vượt quá TTL `900ms`), cập nhật `shouldBypassPlotFrame(level, Boolean(activeSlam || neighborDomino), wasSlammingRef.current)`. Trong `useSafeFrame`, đọc `useVfxStore.getState()?.activeSlams ?? activeSlams` để lấy trực tiếp `liveNeighborDomino = resolveNeighborDominoSlam(cellIndex, liveSlams, isMobile)` (không dùng `?? neighborDomino`), reset `rootGroupRef.current.rotation.x = lotTransform.rotation[0]` ở cả nhánh `if (activeSlam)` và `else if (wasSlammingRef.current)` (`[ADV-03]`), và khi không có `activeSlam` trực tiếp nhưng có `liveNeighborDomino` đang hoạt động thì tính `calculateDominoRippleTransform(liveNeighborDomino.distanceInCells, Date.now() - (liveNeighborDomino.slam.startTime + liveNeighborDomino.slam.impactTimeMs))` để cộng `ripple.yOffset`, nhân `ripple.scaleY` và nghiêng `rotation.x = lotTransform.rotation[0] + ripple.pitchRad`, khôi phục chuẩn về `lotTransform` ngay khi `ripple.isSettled` đạt `true`.

#### Task 4: Cập nhật Feature Map Single Source of Truth
**Target physical file**: `docs/FEATURE_MAP.md`
- Cập nhật Pillar 13 (3D Kinematics & Presentation) ghi nhận `IMP-401` (Desktop Art Deco Monopoly Archways `.glb` kích thước gốc `0.72m x 0.68m x 0.14m` đúc từ `scripts/blender/build_monopoly_archway.py`, hành lang phân đoạn liền kề `splitContiguousMonopolySegments` tại `localZ = -1.16m` và cổng vòm tại `localZ = -1.24m` không chạm chữ/tòa nhà, và sóng chấn động Domino lò xo `calculateDominoRippleTransform` cho cả nâng cấp nhà lẫn hoàn tất bộ Độc quyền `level = 0` với cô lập Mobile 100%).

## 4. Definition of Done (DoD)
- Kịch bản `scripts/blender/build_monopoly_archway.py` đúc thành công `public/models/landmarks/monopoly_archway_artdeco.glb` (`<= 48KB`, `<= 1500 tris`, Base AABB `0.72m x 0.68m x 0.14m`, `Pivot [0,0,0]`) bằng Blender 5.2 LTS (`bmesh` + `Boolean` + `Bevel` + `Weighted Normals` + 3 vật liệu PBR).
- Toàn bộ 10–14 atomic contract tests do `qa-tester` mở rộng từ 4 Core Contract Invariants trong `tests/client/imp401_monopoly_artdeco_archway_and_domino_shockwave.test.ts` và các bộ test tương thích ngược (`imp125_phase3_monopoly_plaza_fusion.test.ts`, `imp374_ios_webkit_60fps_hardening.test.ts`, `imp63_top_building_and_unobscured_card_title.test.ts`) PASS 100%.
- Kiểm tra ảnh chụp WebGL thực tế qua `node scripts/capture_visual_evidence.mjs --ticket IMP-401 --dual-viewport --scenario board_ownership_monopoly --wait 8000`: thấy rõ các cụm Hành lang Đá Cẩm Thạch phân đoạn liền kề và Cổng Vòm Art Deco `.glb` đứng gọn trong khe giữa các tòa nhà (0% đâm xuyên tòa nhà, 0% đè dải màu tiêu đề hay ô chức năng xen giữa) trên `imp-401_desktop.jpg`, trong khi `imp-401_mobile_360.jpg` được cô lập 100%.
- Vượt qua `npm run prefilter` và `node scripts/check_evidence.mjs IMP-401` với 0 defects.
