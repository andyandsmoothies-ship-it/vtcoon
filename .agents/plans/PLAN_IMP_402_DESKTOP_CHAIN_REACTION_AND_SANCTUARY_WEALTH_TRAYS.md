# Plan IMP-402: Desktop Chain-Reaction Diorama Awakening & Sanctuary Wealth Trays (Ticket IMP-402)

## 0. Auto-Slicing Roadmap & Context
- **Ticket Objective**: Triển khai **Pha 3 (Ticket IMP-402)** trong Quy hoạch Tổng thể Desktop Ultra (`VTCOON_DESKTOP_ULTRA_STRATEGY_REPORT.md` V5.0 — Mục 3.1.3 & Mục 4 - Pha 3), tích hợp đầy đủ 5 chỉ thị phản biện `.agents/audit/PLAN_CHALLENGE_IMP-402.md` (`[ADV-01]`..`[ADV-05]`):
  1. *Đường ống Blender 5.2 đúc 4 Khay Tài Sản Đại Gia (`scripts/blender/build_wealth_trays.py` -> `public/models/landmarks/wealth_tray_tier1..4.glb`)*: Viết và lưu trữ vĩnh viễn kịch bản Python Blender 5.2 LTS `scripts/blender/build_wealth_trays.py` (`bpy`, `bmesh`, `Boolean Modifier` khoét lòng khay gỗ óc chó, `Bevel Modifier` 3 segments vát cạnh bắt sáng, `Weighted Normals`) để đúc 4 file `.glb` nguyên khối (`<= 48KB` mỗi file, `<= 1500 tris`, hộp bao cơ sở khóa cứng `width = 0.36m, height = 0.44m, depth = 0.48m`, `trayScale = [1.10, 1.35, 1.10]`, `Pivot [0, 0, 0]` chính giữa mặt đáy bệ đỡ giật cấp tích hợp) tương ứng 4 cấp độ tài sản ròng (`tier = 1..4`) của 4 người chơi `p1..p4` dẫn xuất Poka-Yoke trực tiếp từ `calculatePlayerNetWorth` và ngưỡng chuẩn `WEALTH_TRAY_TIER_THRESHOLDS = { tier2: 10000, tier3: 12000, tier4: 30000 }` (`p1: 4400 -> Tier 1`, `p2: 10800 -> Tier 2`, `p3: 12000 -> Tier 3`, `p4: 91750 -> Tier 4` trong `board_ownership_monopoly.js`, `[ADV-05]`):
     - Cấu trúc 2 tầng theo chiều cao cơ sở `height = 0.44m` nhân `trayScale[1] = 1.35` (`bottomY = -0.24m` đến `topY = +0.354m`): Phần Chân Đế Bậc Thang Đá Cẩm Thạch & Đồng Thau ôm khít bậc tam cấp bán đảo; Phần Lòng Khay Nhung Đỏ, Thỏi Vàng 999.9, Sổ Đỏ & Vương Miện vươn cao lên tới `topY = +0.354m` (cao hơn mặt sàn gỗ `-0.11m` tới `+0.464m` và cao hơn mặt bệ đá cẩm thạch `+0.08m` tới `+0.274m`), giúp khay vàng và chồng sổ đỏ hoàn toàn không bị sàn gỗ cắt ngang và nổi bật rõ nét trên ảnh `1280x800`.
     - `wealth_tray_tier1.glb` (Khởi nghiệp): Khay gỗ óc chó `#2B1D14` viền đồng thau `#D97706` lót nhung đỏ `#BE123C`, kèm bệ đỡ đá cẩm thạch trắng Carrara `#F8FAFC` giật cấp tích hợp, bên trong đặt các thỏi vàng 999.9 vát cạnh hình thang (`Mat_Gold9999` `#FBBF24`) & 1 cuốn Sổ Đỏ (`Mat_CrimsonDeed` `#DC2626`).
     - `wealth_tray_tier2.glb` (Thương gia): Chồng thỏi vàng đôi + cọc tiền polymer buộc đai (`Mat_PolymerNotes` `#0EA5E9`) + 2 cuốn Sổ Đỏ.
     - `wealth_tray_tier3.glb` (Đại gia): Kim tự tháp vàng thỏi 999.9 bóng loáng (`Mat_Gold9999`) + chồng Sổ Đỏ Đông Dương.
     - `wealth_tray_tier4.glb` (Bá chủ Độc quyền): Kho báu vàng thỏi đầy tràn khay + biểu tượng vương miện/ấn vàng phát sáng nhẹ (`Mat_EmissiveGold` `#FDE047`).
     - **CẤM TUYỆT ĐỐI** ghép khối `BoxGeometry`/`CylinderGeometry` trong Three.js (`.ts`/`.tsx`) để giả làm thỏi vàng hay sổ đỏ; kết xuất qua 1 `<SafeGLTFModel fallback={<group />} />` mỗi bán đảo góc với Macro Silhouette rõ nét từ khoảng cách camera `35m–50m` (`CAMERA_CONFIG.overview`).
  2. *Định vị Không gian Chuẩn Toán học AABB Thực Tế (Đã Nhân `trayScale` & Góc Xoay `rotationY`) trên 4 Bán Đảo Góc (`getCornerSanctuaryDescriptors()`) & Bảo vệ Living Contract `TC-399.06b` (`[ADV-01]`)*: Đặt mỗi Khay Tài Sản lên phần thềm phía trước (`apronOffset = [+0.88, +0.23]`, `worldPosition = [cx + 0.88, -0.24, cz + 0.23]`, `trayScale = [1.10, 1.35, 1.10]`, `rotationY = -0.15`) của 4 bán đảo góc (`[-12.4, -0.28, 1.6]`, `[-12.3, -0.28, 6.2]`, `[-0.5, -0.28, -12.0]`, `[-1.2, -0.28, 12.6]`):
     - Hộp bao va chạm AABB và bán kính `maxRadialExtent` trong `getSanctuaryWealthTrayDescriptors` **BẮT BUỘC nhân đầy đủ `trayScale` và ma trận xoay `rotationY = -0.15`** (`scaledHalfW = 0.18 * 1.10 = 0.198m`, `scaledHalfD = 0.24 * 1.10 = 0.264m`, `rotHalfW = scaledHalfW * |cos(-0.15)| + scaledHalfD * |sin(-0.15)| = 0.2352m`, `rotHalfD = scaledHalfW * |sin(-0.15)| + scaledHalfD * |cos(-0.15)| = 0.2906m`).
     - Không va chạm AABB hay bán kính tròn thực tế với Bệ đá cẩm thạch trung tâm (`pedestalWidth = 1.24m`, `pedestalRadius = 0.62m`): `aabbMinX = cx + 0.88 - 0.2352 = cx + 0.6448m >= cx + 0.64m > cx + 0.62m` (`+0.0248m` khe hở thực tế sau khi đã phóng to và xoay), và không va chạm với toàn bộ 20 gốc cây dừa (`minPalmDistance = 0.559m >= 0.55m`).
     - Bệ đỡ giật cấp tích hợp của khay (`bottomY = -0.24m`, `topY = -0.24 + 0.44 * 1.35 = +0.354m`) cắm sâu `embedDepth = 0.02m` vào nền bờ cát (`baseTopY = -0.22m`), nằm gọn 100% trong bán kính nền bán đảo (`maxRadialExtent = 1.2307m < baseRadius 1.24m`), trong vùng an toàn `1280x800` (`|ndcX| <= 0.85, -0.78 <= ndcY <= 0.82`) và nằm ngoài hoàn toàn vùng `ActionDock (x: 350..930, y: 700..780)`.
     - Trong `ToyboxWealthTrayLayer`, nếu `isMobile === true` hoặc `Object.keys(effectivePlayers ?? {}).length === 0`, short-circuit trả về `null` TRƯỚC khi gọi `SafeGLTFModel.preload` để bảo vệ tuyệt đối `TC-399.06b` (`[ADV-01]`), trong khi gọi trực tiếp `getSanctuaryWealthTrayDescriptors()` vẫn trả về 4 descriptor `tier = 1` mặc định.
  3. *Chuỗi Phản ứng Liên hoàn Sa bàn Trung tâm Gắn Kết 5 Công Trình 3D Thật & Zero-Allocation FrameLoop (`DioramaChainReaction`, `DioramaChainReactionFrameLoop` & `UnifiedToyboxHitPlane` $O(1)$) (`[ADV-02]`..`[ADV-05]`)*: Dùng 1 mặt phẳng tương tác duy nhất `UnifiedToyboxHitPlane` (`14.4m x 14.4m` tại `[0, 0.025, 0]`, gọi `e?.stopPropagation?.()` khi click theo `[ADV-05]`) kết hợp tự động kích hoạt khi có sự kiện kinh tế lớn để tạo sóng đánh thức liên hoàn 5 mắt xích: Du thuyền Sông Sài Gòn (`0ms`, `DioramaHarborCruiser`) -> Tàu Metro (`180ms`, `DioramaModelRailroad`) -> Tháp Bitexco (`360ms`, `DioramaSkyline`) -> Cầu Ba Son (`540ms`, `DioramaBridges`) -> Khu Di sản Nhà thờ Đức Bà (`720ms`, `DioramaHeritageDistrict`). Truyền `landmarkGroupRefs` từ `MiniatureCityDiorama` vào `DioramaChainReaction` / `DioramaChainReactionFrameLoop` để cả 5 cụm công trình 3D thật đều nảy cao độ `yOffset` và đàn hồi `scale.y = 1 + yOffset * 0.75` đồng bộ với vòng sóng xung kích. Sử dụng bộ đệm tái sử dụng `createScratchChainReactionSnapshot()` truyền vào `evaluateDioramaChainReaction(elapsedMs, ttlMs, outSnapshot)` để đạt **0 cấp phát mảng/object trong `useSafeFrame`**. Trang bị Dead Man's Switch (`CHAIN_REACTION_TTL_MS = 2800 <= 3000ms`): khi `isExpired === true`, khôi phục `landmarkGrp.position.y = 0`, `landmarkGrp.scale.set(1, 1, 1)` và ẩn vòng sóng (`ring.visible = false`) (`[ADV-03]`).
- **Principles Applied**:
  - *(1) View-Model Seam Extraction* -> Tách toàn bộ toán học phân tầng tài sản Poka-Yoke (`WEALTH_TRAY_TIER_THRESHOLDS`), tọa độ AABB thực tế đã nhân `trayScale` + `rotationY` của 4 Khay Tài Sản và hàm trạng thái 5 mắt xích sóng liên hoàn in-place sang `src/client/3d/toybox_wealth_tray_visuals.ts`.
  - *(4) Ephemeral TTL / Dead Man's Switch* -> Khóa cứng `CHAIN_REACTION_TTL_MS = 2800` (`<= 3000ms`) trong `evaluateDioramaChainReaction`, tự động ẩn vòng sóng (`ring.visible = false`) và đưa 5 cụm công trình 3D về trạng thái nghỉ tĩnh sau `2800ms` (`[ADV-03]`).
  - *(5) 100% DTO & Call-Site Wiring* -> Kết nối trực tiếp `landmarkGroupRefs` của 5 phân khu công trình 3D trong `MiniatureCityDiorama` vào `DioramaChainReactionFrameLoop`, đọc tín hiệu HOSE từ `activeModal === 'hose'` (`modalPayload`) và `floatingTexts` (`actionType === 'hose'`) (`[ADV-02]`), kết hợp kiểm tra kép `Boolean(p.bankrupt || p.isBankrupt)` (`[ADV-05]`).
  - *(6) Poka-Yoke Domain Affordance* -> Dẫn xuất cấp độ khay `tier = 0..4` trực tiếp từ `calculatePlayerNetWorth` (`src/client/ui/ui_helpers.ts`) với `WEALTH_TRAY_TIER_THRESHOLDS = { tier2: 10000, tier3: 12000, tier4: 30000 }`, và chặn `SafeGLTFModel.preload` khi `playersInfo` rỗng để bảo vệ `TC-399.06b` (`[ADV-01]`).
  - *(7) Spatial AABB / Non-Occlusion* -> Khóa cứng `apronOffset = [+0.88, +0.23]`, hộp bao cơ sở `0.36m x 0.44m x 0.48m`, `trayScale = [1.10, 1.35, 1.10]`, `rotationY = -0.15`, `bottomY = -0.24m`, `topY = +0.354m`, `aabbMinX = cx + 0.6448m > cx + 0.62m`, `maxRadialExtent = 1.2307m < 1.24m`, `|ndcX| <= 0.85, -0.78 <= ndcY <= 0.82` và né hoàn toàn `ActionDock (x: 350..930, y: 700..780)`.
  - *(8) Resource Disposal & Cache Hygiene* -> Tái sử dụng `createScratchChainReactionSnapshot()` in-place trong `evaluateDioramaChainReaction` để triệt tiêu 100% cấp phát mảng/object trong `useSafeFrame`.
  - *(9) Platform DI Isolation* -> Ủy quyền `useSafeFrame` cho `DioramaChainReactionFrameLoop` chỉ mount khi `!isMobile` (`[ADV-04]`), đảm bảo Mobile (`isMobile = true`) tốn `0` Draw Calls, `0` frame subscribers và `0` lượt tải `.glb`.

## 1. Physical Target Files & Honest LOC Accounting
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/toybox_wealth_tray_visuals.ts` | Tier 2 (UI/3D/Views) | 0 | 285 | +285 | <= 500 | New file |
| `src/client/3d/toybox_wealth_tray_layer.tsx` | Tier 2 (UI/3D/Views) | 0 | 60 | +60 | <= 500 | New file |
| `src/client/3d/diorama_chain_reaction.tsx` | Tier 2 (UI/3D/Views) | 0 | 185 | +185 | <= 500 | New file |
| `src/client/3d/coastal_island_environment.tsx` | Tier 2 (UI/3D/Views) | 277 | 277 | 0 | <= 500 | Safe (<= 300 living ceiling) |
| `src/client/3d/miniature_city_diorama.tsx` | Tier 2 (UI/3D/Views) | 366 | 366 | 0 | <= 500 | Safe (<= 400 living ceiling) |
| `tests/client/imp402_desktop_chain_reaction_and_wealth_trays.test.ts` | Living Test | 0 | 455 | +455 | <= 600 | New Contract Test Suite |
| `docs/FEATURE_MAP.md` | SSOT Matrix | 92 | 92 | 0 | N/A | Cập nhật Section Gotchas Pillar 13 |
- **Blender 5.2 Sculpted Assets & Cohesive Diorama Wiring (In-Scope)**: `scripts/blender/build_wealth_trays.py`, `public/models/landmarks/wealth_tray_tier1.glb`, `public/models/landmarks/wealth_tray_tier2.glb`, `public/models/landmarks/wealth_tray_tier3.glb`, `public/models/landmarks/wealth_tray_tier4.glb`, `src/client/3d/miniature_city_diorama.tsx`, `scripts/sentinel_probes/IMP-402.json`.

## 2. In-Action Visual Capture Registration
- Scenario: Client 3D Desktop Sanctuary Wealth Trays (`.glb` Tiers 1..4) & Diorama Chain-Reaction Awakening. Visual observation verified via `imp402_desktop_chain_reaction_and_wealth_trays.test.ts`, `node scripts/capture_visual_evidence.mjs --ticket IMP-402 --dual-viewport --scenario board_ownership_monopoly --wait 8000`, and `node scripts/check_evidence.mjs IMP-402`.

## 3. Implementation Steps

### Station 1: Core Contract Invariants (RED — QA Expands Autonomously into 10–14 Atomic 5-Facet Tests in Station 2)
- **TC-402.01 [UC-POKA-YOKE-WEALTH-TIER-DERIVATION/MSS]:** Given player snapshots (`cash`, `ownedProperties`, `levelMap`, `mortgagedProperties`, `mortgageLoans`, `bankrupt`, `isBankrupt`) evaluated against `WEALTH_TRAY_TIER_THRESHOLDS` (`{ tier2: 10000, tier3: 12000, tier4: 30000 }`), When calling `resolvePlayerWealthTier` and `getSanctuaryWealthTrayDescriptors`, Then derives `netWorth` strictly via `calculatePlayerNetWorth` (`src/client/ui/ui_helpers.ts`), maps active players monotonically across tiers `1 -> 2 -> 3 -> 4` (`/models/landmarks/wealth_tray_tier1..4.glb`), maps bankrupt players (`bankrupt: true` or `isBankrupt: true`) to `tier = 0` (`modelUrl: null`), and resolves all 4 distinct tiers (`1, 2, 3, 4`) purely via `resolvePlayerWealthTier` for `p1..p4` (`4400, 10800, 12000, 91750`) in the `board_ownership_monopoly` scenario.
- **TC-402.02 [UC-SANCTUARY-APRON-SPATIAL-AABB-AND-NDC/MSS]:** Given the 4 corner sanctuaries (`getCornerSanctuaryDescriptors()`) and bay palms (`getBayArchipelagoDescriptors().palms`), When computing `getSanctuaryWealthTrayDescriptors`, Then places each tray on the foreground apron (`worldPosition = [cx + 0.88, -0.24, cz + 0.23]`, base AABB `0.36m x 0.44m x 0.48m`, `trayScale = [1.10, 1.35, 1.10]`, `rotationY = -0.15`, `bottomY = -0.24m`, `topY = +0.354m > deckTopY -0.11m & pedestalTopY +0.08m`) with AABB bounds (`aabbMinX..aabbMaxZ`) and `maxRadialExtent` computed from the **scaled and rotated** geometry (`rotHalfW = 0.2352m`, `rotHalfD = 0.2906m`), guaranteeing zero collision against the central marble pedestal (`aabbMinX >= cx + 0.64m > pedestalMaxX = cx + 0.62m`), `>= 0.55m` 2D center clearance from all 20 palms, `embedDepth >= 0.02m` into the sanctuary platform (`maxRadialExtent <= 1.235m < baseRadius = 1.24m`), and `|ndcX| <= 0.85, -0.78 <= ndcY <= 0.82` outside the `ActionDock` pixel region (`x: 350..930, y: 700..780`) on `1280x800`.
- **TC-402.03 [UC-CHAIN-REACTION-STAGGER-AND-TTL-WATCHDOG/MSS]:** Given `CHAIN_REACTION_STAGE_SPECS` (`0ms, 180ms, 360ms, 540ms, 720ms` across Saigon River, Metro Line, Bitexco, Ba Son Bridge, and Notre Dame Cathedral) and elapsed times from `-50ms` to `3500ms`, When calling `evaluateDioramaChainReaction(elapsedMs, ttlMs, outSnapshot)` and `computeEconomicAwakeningSignature`, Then activates stages sequentially at `i * 180ms` with positive `intensity`, `ringScale > 1`, and `yOffset > 0`, mutates `outSnapshot` in-place with `0` new array/object allocations when `outSnapshot` is provided, clamps negative/pre-delay stages to `isTriggered = false`, self-heals via Dead Man's Switch (`isActive = false, isExpired = true`, all intensities `0`) at `elapsedMs >= 2800` (`<= 3000ms`), and produces distinct signatures whenever property ownership, building levels, or HOSE tuples change.
- **TC-402.04 [UC-DESKTOP-GLB-MOUNT-HITPLANE-AND-MOBILE-ISOLATION/MSS]:** Given `CoastalIslandEnvironment`, `ToyboxWealthTrayLayer`, `MiniatureCityDiorama`, and `DioramaChainReaction` rendered on Desktop (`isMobile = false`) versus Mobile (`isMobile = true`), When inspecting the rendered scene tree and triggering `UnifiedToyboxHitPlane` (`onClick` with `stopPropagation`), store economic updates, or frame ticks across `0..2800ms`, Then Desktop bypasses `SafeGLTFModel.preload` when `playersInfo` is empty (`{}`) to preserve `TC-399.06b`, mounts `<SafeGLTFModel url="/models/landmarks/wealth_tray_tier1..4.glb" fallback={<group />} />` with `scale={[1.10, 1.35, 1.10]}` when `playersInfo` is populated, couples the 5 central landmark groups (`landmarkGroupRefs`) so both the 3D landmarks and stage pulse rings bounce (`position.y > 0`, `scale.y > 1`) while active and auto-reset (`landmark.position.y = 0, landmark.scale.y = 1, ring.visible = false`) when `isExpired === true` (`>= 2800ms`), while Mobile (`isMobile = true`) mounts `0` `.glb` models, `0` hit-plane meshes, and registers `0` `useSafeFrame` subscribers.

### Station 2: Implementation (GREEN)

#### Task 1: Tạo Pure View-Model Khay Tài Sản Đại Gia Poka-Yoke & Toán Học Chuỗi Phản Ứng Liên Hoàn 5 Mắt Xích In-Place
**Target physical file**: `src/client/3d/toybox_wealth_tray_visuals.ts` (New file)
```typescript
import type { PlayerHudInfo } from '../store/game_store_types';
import type { CornerSanctuaryDescriptor } from './coastal_sanctuary_visuals';

export type WealthTrayTier = 0 | 1 | 2 | 3 | 4;

export const WEALTH_TRAY_MODEL_URLS: Record<1 | 2 | 3 | 4, string> = {
  1: '/models/landmarks/wealth_tray_tier1.glb',
  2: '/models/landmarks/wealth_tray_tier2.glb',
  3: '/models/landmarks/wealth_tray_tier3.glb',
  4: '/models/landmarks/wealth_tray_tier4.glb',
} as const;

export const WEALTH_TRAY_BASE_DIMENSIONS = { width: 0.36, height: 0.44, depth: 0.48 } as const;
export const WEALTH_TRAY_TIER_THRESHOLDS = { tier2: 10000, tier3: 12000, tier4: 30000 } as const;
export const CHAIN_REACTION_TTL_MS = 2800;
export const CHAIN_REACTION_STAGE_DELAY_MS = 180;

export interface SanctuaryWealthTrayDescriptor {
  readonly id: string;
  readonly sanctuaryId: string;
  readonly playerId: string;
  readonly playerSlot: number;
  readonly tier: WealthTrayTier;
  readonly netWorth: number;
  readonly propertyCount: number;
  readonly modelUrl: string | null;
  readonly worldPosition: readonly [number, number, number];
  readonly trayScale: readonly [number, number, number];
  readonly rotationY: number;
  readonly bottomY: number;
  readonly topY: number;
  readonly embedDepth: number;
  readonly aabbMinX: number;
  readonly aabbMaxX: number;
  readonly aabbMinZ: number;
  readonly aabbMaxZ: number;
  readonly maxRadialExtent: number;
  readonly ndcX: number;
  readonly ndcY: number;
}

export interface ChainReactionStageSpec {
  readonly stageIndex: number;
  readonly id: 'saigon-river-cruiser' | 'metro-line-station' | 'bitexco-tower' | 'bason-bridge' | 'notre-dame-cathedral';
  readonly delayMs: number;
  readonly worldPosition: readonly [number, number, number];
  readonly baseRadius: number;
  readonly accentColor: string;
}

export interface ChainReactionStageState {
  stageIndex: number;
  id: ChainReactionStageSpec['id'];
  isTriggered: boolean;
  intensity: number;
  ringScale: number;
  yOffset: number;
}

export interface DioramaChainReactionSnapshot {
  isActive: boolean;
  isExpired: boolean;
  elapsedMs: number;
  stages: ChainReactionStageState[];
}

export const CHAIN_REACTION_STAGE_SPECS: ReadonlyArray<ChainReactionStageSpec> = [
  { stageIndex: 0, id: 'saigon-river-cruiser', delayMs: 0, worldPosition: [0, 0.04, 2.2], baseRadius: 0.48, accentColor: '#06B6D4' },
  { stageIndex: 1, id: 'metro-line-station', delayMs: 180, worldPosition: [0, 0.45, -6.9], baseRadius: 0.44, accentColor: '#38BDF8' },
  { stageIndex: 2, id: 'bitexco-tower', delayMs: 360, worldPosition: [-4.5, 0.20, -4.4], baseRadius: 0.62, accentColor: '#F59E0B' },
  { stageIndex: 3, id: 'bason-bridge', delayMs: 540, worldPosition: [-0.8, 0.18, -3.8], baseRadius: 0.52, accentColor: '#22D3EE' },
  { stageIndex: 4, id: 'notre-dame-cathedral', delayMs: 720, worldPosition: [-4.3, 0.20, 3.65], baseRadius: 0.56, accentColor: '#FDE047' },
];

export function createScratchChainReactionSnapshot(): DioramaChainReactionSnapshot;

export function resolvePlayerWealthTier(
  cash: number,
  ownedCellIndices?: ReadonlyArray<number>,
  levelMap?: Record<number, 0 | 1 | 2 | 3>,
  mortgagedCellIndices?: ReadonlyArray<number>,
  mortgageLoans?: Record<number, number>,
  isBankrupt?: boolean
): { readonly tier: WealthTrayTier; readonly netWorth: number; readonly propertyCount: number };

export function getSanctuaryWealthTrayDescriptors(
  playersInfo?: Readonly<Record<string, PlayerHudInfo>> | null,
  levelMap?: Record<number, 0 | 1 | 2 | 3>,
  sanctuaries?: ReadonlyArray<CornerSanctuaryDescriptor>
): ReadonlyArray<SanctuaryWealthTrayDescriptor>;

export function evaluateDioramaChainReaction(
  elapsedMs: number,
  ttlMs?: number,
  outSnapshot?: DioramaChainReactionSnapshot
): DioramaChainReactionSnapshot;

export function computeEconomicAwakeningSignature(
  playersInfo?: Readonly<Record<string, PlayerHudInfo>> | null,
  levelMap?: Record<number, 0 | 1 | 2 | 3>,
  lastHoseTuple?: readonly [string | number | null | undefined, number | null | undefined]
): string;
```

#### Task 2: Tạo Component `ToyboxWealthTrayLayer` & Đúc 4 Mô Hình `.glb` từ Blender 5.2 LTS
**Target physical file**: `src/client/3d/toybox_wealth_tray_layer.tsx` (New file)
```tsx
import React from 'react';
import type { PlayerHudInfo } from '../store/game_store_types';

export interface ToyboxWealthTrayLayerProps {
  readonly isMobile?: boolean;
  readonly playersInfo?: Readonly<Record<string, PlayerHudInfo>> | null;
  readonly levelMap?: Record<number, 0 | 1 | 2 | 3>;
}

export function ToyboxWealthTrayLayer(props?: ToyboxWealthTrayLayerProps): React.ReactElement | null;
```
- Trong `ToyboxWealthTrayLayer`: gọi `useGameStore` và `useMemo` vô điều kiện ở đầu hàm; nếu `isMobile === true` hoặc `!effectivePlayers || Object.keys(effectivePlayers).length === 0` thì trả về `null` ngay lập tức TRƯỚC khi gọi `SafeGLTFModel.preload(url)` để bảo toàn tuyệt đối living contract `399.06b` (`[ADV-01]`). Khi có người chơi đang hoạt động, gọi `getSanctuaryWealthTrayDescriptors(effectivePlayers, effectiveLevelMap)` và `resolvePlayerWealthTier`, preload `WEALTH_TRAY_MODEL_URLS`, và render `<SafeGLTFModel url={desc.modelUrl} position={[...desc.worldPosition]} rotation={[0, desc.rotationY, 0]} scale={[...desc.trayScale]} castShadow receiveShadow fallback={<group />} />` trong `<group name="ToyboxWealthTrayLayer" data-testid="toybox-wealth-tray-layer">`.
- Viết kịch bản `scripts/blender/build_wealth_trays.py` và chạy qua Blender 5.2.2 LTS CLI để xuất 4 file `public/models/landmarks/wealth_tray_tier1..4.glb` (`<= 48KB`, `<= 1500 tris`, Base AABB `0.36m x 0.44m x 0.48m` với bệ tam cấp `0.00..0.14m` và khay nhung/thỏi vàng/sổ đỏ/vương miện `0.14..0.44m`, `Pivot [0,0,0]`).

#### Task 3: Tạo Component `DioramaChainReaction`, `DioramaChainReactionFrameLoop` & Mặt Phẳng Tương Tác $O(1)$ `UnifiedToyboxHitPlane`
**Target physical file**: `src/client/3d/diorama_chain_reaction.tsx` (New file)
```tsx
import React from 'react';
import type { Group, Mesh } from 'three';

export interface DioramaChainReactionProps {
  readonly isMobile?: boolean;
  readonly isVisible?: boolean;
  readonly lastHoseTuple?: readonly [string | number | null | undefined, number | null | undefined];
  readonly landmarkGroupRefs?: React.MutableRefObject<Array<Group | null>>;
}

export interface DioramaChainReactionFrameLoopProps {
  readonly isVisible: boolean;
  readonly triggerStartMsRef: React.MutableRefObject<number | null>;
  readonly stageGroupRefs: React.MutableRefObject<Array<Group | null>>;
  readonly stageRingRefs: React.MutableRefObject<Array<Mesh | null>>;
  readonly landmarkGroupRefs?: React.MutableRefObject<Array<Group | null>>;
}

export function DioramaChainReactionFrameLoop(props: DioramaChainReactionFrameLoopProps): null;
export function DioramaChainReaction(props?: DioramaChainReactionProps): React.ReactElement | null;
```
- Trong `DioramaChainReaction`: đọc `playersInfo`, `levelMap`, `activeModal`, `modalPayload`, và `floatingTexts` từ `useGameStore` để trích xuất tín hiệu HOSE hợp chuẩn `GameState` (`[ADV-02]`), tính `computeEconomicAwakeningSignature`, và kích hoạt `triggerStartMsRef.current = Date.now()` trong `useEffect` khi signature thay đổi. Ủy quyền `useSafeFrame` sang component con `DioramaChainReactionFrameLoop` chỉ mount khi `!isMobile` (`[ADV-04]`). Trong `DioramaChainReactionFrameLoop`, khởi tạo 1 lần `scratchSnapshotRef = useRef(createScratchChainReactionSnapshot())` và gọi `evaluateDioramaChainReaction(elapsedMs, CHAIN_REACTION_TTL_MS, scratchSnapshotRef.current)` để cập nhật 5 mắt xích `CHAIN_REACTION_STAGE_SPECS` cùng 5 cụm công trình 3D thật `landmarkGroupRefs` với **0 cấp phát mảng/object trong `useSafeFrame`**, và khi `snapshot.isExpired` đạt `true` thì đưa `grp.position.y = spec.worldPosition[1]`, `landmark.position.y = 0`, `landmark.scale.set(1, 1, 1)`, `ring.scale.set(1, 1, 1)`, **ẩn vòng sóng (`ring.visible = false`)** và đặt `triggerStartMsRef.current = null` (`[ADV-03]`). Trên `UnifiedToyboxHitPlane` (`14.4m x 14.4m`), gọi `e?.stopPropagation?.()` trước `SoundEngine.playWaterRipple()` (`[ADV-05]`).

#### Task 4: Call-Site Wiring — Mount `ToyboxWealthTrayLayer` trong `CornerTycoonSanctuaries` & Kết nối 5 Cụm Công trình 3D với `DioramaChainReaction` trong `MiniatureCityDiorama`
**Target physical file**: `src/client/3d/coastal_island_environment.tsx`
- Import `ToyboxWealthTrayLayer` từ `./toybox_wealth_tray_layer` và mount `<ToyboxWealthTrayLayer isMobile={false} />` bên trong `<group data-testid="corner-tycoon-sanctuaries">` của `CornerTycoonSanctuaries`.
- Đồng thời trong `src/client/3d/miniature_city_diorama.tsx`, bọc 5 cụm công trình biểu tượng (`DioramaHarborCruiser`, `DioramaModelRailroad`, `DioramaSkyline`, `DioramaBridges`, `DioramaHeritageDistrict`) trong `<group name="ChainLandmark_*" ref={(el) => { landmarkGroupRefs.current[idx] = el; }}>` và truyền `landmarkGroupRefs={landmarkGroupRefs}` vào `{!isMobile && <DioramaChainReaction isMobile={isMobile} isVisible={isVisible} landmarkGroupRefs={landmarkGroupRefs} />}`.

#### Task 5: Cập nhật Feature Map Single Source of Truth
**Target physical file**: `docs/FEATURE_MAP.md`
- Cập nhật Pillar 13 (3D Kinematics & Presentation) ghi nhận `IMP-402` (4 Khay Tài Sản Đại Gia `.glb` `wealth_tray_tier1..4.glb` đúc từ Blender 5.2 `scripts/blender/build_wealth_trays.py` dẫn xuất Poka-Yoke từ `calculatePlayerNetWorth` với ngưỡng `10000/12000/30000` đặt tại thềm trước `[cx + 0.88, -0.24, cz + 0.23]` với `trayScale = [1.10, 1.35, 1.10]`, `rotationY = -0.15` của 4 Bán đảo Góc, kết hợp `DioramaChainReaction` gắn kết 5 cụm công trình 3D thật với `0` cấp phát trong `useSafeFrame`, `UnifiedToyboxHitPlane` $O(1)$ và Dead Man's Switch `2800ms` tự động ẩn `ring.visible = false` khi hết TTL và cô lập Mobile 100%).

## 4. Definition of Done (DoD)
- Kịch bản `scripts/blender/build_wealth_trays.py` đúc thành công 4 mô hình `public/models/landmarks/wealth_tray_tier1..4.glb` (`<= 48KB` mỗi file, `<= 1500 tris`, Base AABB `0.36m x 0.44m x 0.48m`, `trayScale = [1.10, 1.35, 1.10]`, `Pivot [0,0,0]`) bằng Blender 5.2 LTS (`bmesh` + `Boolean` + `Bevel` + `Weighted Normals` + vật liệu PBR).
- Toàn bộ 10–14 atomic contract tests do `qa-tester` mở rộng từ 4 Core Contract Invariants trong `tests/client/imp402_desktop_chain_reaction_and_wealth_trays.test.ts` và các bộ test tương thích ngược (`imp399_bay_archipelago_and_mobile_city_silhouette.test.ts`, `dense_metropolis_architecture.test.ts`, `imp197_diorama_ground_modernization.test.ts`) PASS 100%.
- Kiểm tra ảnh chụp WebGL thực tế qua `node scripts/capture_visual_evidence.mjs --ticket IMP-402 --dual-viewport --scenario board_ownership_monopoly --wait 8000`: ảnh tĩnh `imp-402_desktop.jpg` ở `--wait 8000` nghiệm thu đủ cả 4 Khay Tài Sản `.glb` (Tiers 1..4) sắc nét trên thềm trước 4 bán đảo góc (`0%` va chạm bệ đá cẩm thạch hay cây dừa kể cả sau khi nhân `trayScale` và xoay `rotationY`, `0%` bị HUD/ActionDock che khuất) và đảm bảo Lõi Đô Thị trung tâm sạch sẽ 100% không bị vòng tròn hình học che khuất (`ring.visible = false` sau `2800ms`), còn hiệu ứng sóng động `DioramaChainReaction` làm nảy cả 5 cụm công trình 3D thật với `0` cấp phát mảng/object trong `useSafeFrame`; `imp-402_mobile_360.jpg` được cô lập 100%.
- Vượt qua `npm run prefilter` và `node scripts/check_evidence.mjs IMP-402` với 0 defects.
