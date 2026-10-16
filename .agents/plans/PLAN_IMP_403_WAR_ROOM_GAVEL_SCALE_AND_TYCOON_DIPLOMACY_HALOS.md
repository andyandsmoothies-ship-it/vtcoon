# Plan IMP-403: Desktop War Room Gavel/Scale (.glb) & Tycoon Diplomacy Halos (Ticket IMP-403)

## 0. Auto-Slicing Roadmap & Context
- **Ticket Objective**: Triển khai **Pha 4 (Ticket IMP-403 — Pha cuối cùng)** trong Quy hoạch Tổng thể Desktop Ultra (`VTCOON_DESKTOP_ULTRA_STRATEGY_REPORT.md` V5.0 — Mục 3.1.4 & Mục 4 - Pha 4), tích hợp đầy đủ các chỉ thị phản biện `.agents/audit/PLAN_CHALLENGE_IMP-403.md` (`[ADV-OBJ]`, `[ADV-01]`..`[ADV-04]`) và 3 chốt chặn hiển thị WebGL thực tế:
  1. *Đường ống Blender 5.2 đúc Búa Đấu Giá Gỗ Mun Vung Nghiêng $35^\circ$ & Cân Công Lý P2P (`scripts/blender/build_war_room_artifacts.py` -> `public/models/landmarks/auction_gavel.glb` & `public/models/landmarks/trade_balance_scale.glb`)*: Viết và lưu trữ vĩnh viễn kịch bản Python Blender 5.2.2 LTS `scripts/blender/build_war_room_artifacts.py` (`bpy`, `bmesh`, `Spin/Lathe` tiện tay cầm gỗ óc chó/gỗ mun uốn lượn và trụ đồng, đai đồng thau chạm nổi, `Bevel Modifier` 3 segments, `Weighted Normals`, vật liệu PBR đa tầng) để xuất 2 tệp `.glb` nguyên khối (`<= 48KB` mỗi tệp, `<= 1500 tris`, `Pivot [0, 0, 0]` chính giữa mặt đáy bệ đỡ):
     - `public/models/landmarks/auction_gavel.glb` (Base AABB `0.44m x 0.42m x 0.44m`): Búa đấu giá gỗ óc chó thượng lưu `#2B1D14` bọc đai đồng thau `#F59E0B` đặt ở **tư thế vung nghiêng $35^\circ$ uy lực** trên bệ Sound Block cao bằng đá cẩm thạch Carrara `#F8FAFC` & gỗ óc chó viền vàng 999.9.
     - `public/models/landmarks/trade_balance_scale.glb` (Base AABB `0.52m x 0.48m x 0.32m`): Cân công lý thương trường Đông Dương bằng đồng thau phay xước `#D97706` & vàng ròng `#FBBF24` đặt trên bệ đá cẩm thạch trắng Carrara, có trụ đồng tiện cao, thanh đòn ngang đối xứng và 2 đĩa cân vàng đường kính lớn treo trang trọng.
     - **CẤM TUYỆT ĐỐI** ghép khối `BoxGeometry`/`CylinderGeometry` thô trong Three.js (`.ts`/`.tsx`) để giả làm búa đấu giá hay bàn cân; kết xuất qua `<SafeGLTFModel fallback={<group />} />` kèm `scale = [1.40, 1.40, 1.40]` để nổi bật Macro Silhouette từ khoảng cách camera `~38m` (`CAMERA_CONFIG.overview`).
  2. *Sân khấu Nghị sự Thương trường Đảo Ngọc 4 Tầng (`WarRoomStageLayer` & `war_room_stage_visuals.ts`) & Liên kết Poka-Yoke với Domain Bot Facade (`[ADV-01]`, `[ADV-02]`, `[ADV-04]`)*:
     - Đặt Bệ Nghị Sự Thương Trường (`WarRoomDais`) tại vùng biển mở Đông-Nam `daisCenter = [11.5, -0.28, 2.2]` (`ndcX = +0.5435, ndcY = -0.5734` nằm gọn trong `|ndcX| <= 0.85, |ndcY| <= 0.80`, `minX = 10.32m > 10.15m` ngoài biên bàn cờ, cách toàn bộ 4 bán đảo `> 12.0m >= 2.56m`), kết xuất theo đúng **cấu trúc phân tầng Đảo Ngọc 4 lớp** đồng bộ với 4 Bán đảo Pha 1 (`W_lower > W_upper`, mỗi tầng cắm ngập `>= 0.02m`): (1) Lagoon Ring `#06B6D4` (`lagoonRadius = 1.18m`), (2) Ivory Sand Base `#EFE5D8` (`sandRadius = 1.06m`, `bottomY = -0.34m, topY = -0.22m`), (3) Brushed Brass Rim `#D97706` (`rimWidth = 1.56m`, `bottomY = -0.24m, topY = -0.16m`), và (4) Satin Walnut & Carrara Marble Dais `#2B1D14`/`#F8FAFC` (`deckWidth = 1.42m`, `bottomY = -0.18m, topY = -0.08m`).
     - Trưng bày cả `auction_gavel.glb` (`[11.12, -0.08, 2.02]`, `scale = [1.40, 1.40, 1.40]`) và `trade_balance_scale.glb` (`[11.88, -0.08, 2.38]`, `scale = [1.40, 1.40, 1.40]`, khoảng cách tâm 2D `0.841m >= 0.80m`) ở trạng thái nghỉ để hiện diện rõ nét 100% ở góc biển mở Đông-Nam trên ảnh chụp `imp-403_desktop.jpg` (`--scenario board_ownership_monopoly --wait 8000`) dưới cả Camera Pha 1 lẫn Pha 3.
     - Liên kết Poka-Yoke 100% với Domain Bot Facade (import từ `../../domain/bot/index`):
       - Hàm `evaluateWarRoomTradeScale` (có cache theo chữ ký thương vụ để đạt `0` cấp phát heap trong `useSafeFrame` theo `[ADV-04]`) khởi tạo `room.players` đủ `>= 3` người chơi, đặt mặc định `seller.balance = 2500` khi `balance` bị khuyết/`<= 0`, chuẩn hóa `'EMBARGO_LEADER'` thành `'KINGMAKING_DEFENSE'` khi `buyer.balance >= 30000 || buyer.balance > seller.balance * 3` (`[ADV-02]`), và tính góc nghiêng cán cân P2P (`scaleTiltRad` trong `[-0.35, +0.35]`).
       - Hàm `evaluateWarRoomAuctionGavel` tính nhịp gõ búa đấu giá (`gavelStrikeAngleRad` trong `[-0.48, +0.22]`, `gavelYOffset >= 0`) với Dead Man's Switch (`WAR_ROOM_TTL_MS = 2600 <= 3000ms`), gài `auctionStartMsRef.current = Date.now()` duy nhất trong `useEffect` theo chữ ký `auction` và reset tức thì tư thế `gavelGroupRef`/`scaleGroupRef` khi về `null` hoặc hết TTL (`[ADV-04]`).
  3. *Vòng Hào Quang Chiến Thuật Thu Gọn (`outerRadius = 0.46m`) & Bóng Thoại Thương Trường Việt `CanvasTexture` Hiển Thị Thật Trên Đỉnh Tượng (`Y = 1.48m`) (`[ADV-01]`, `[ADV-03]`)*:
     - Dẫn xuất đủ **3 giá trị `BotPosture`** (`Leading`, `Parity`, `Trailing`), **4 chế độ `TycoonTacticalMode` khác biệt** (`MONOPOLY_OVERLORD | EXPANSION | DEFENSIVE | RESCUE`), và **4 khẩu hiệu thương trường tiếng Việt (`viSlogan`) khác biệt** (`"👑 Bá Chủ Độc Quyền"`, `"📈 Mở Rộng Đế Chế"`, `"🛡️ Phòng Thủ Vốn"`, `"🚨 Cứu Thanh Khoản"`) cho 4 đại gia `p1..p4` trong `board_ownership_monopoly` (`[ADV-03]`).
     - **Thu gọn Vòng Hào Quang ôm sát chân tượng linh vật (`innerRadius = 0.36m, outerRadius = 0.46m` tại `[cx, 0.086, cz]`, `bottomY = 0.078m, topY = 0.094m`)**: đảm bảo `halo.aabbMaxX = cx + 0.46m < cx + 0.487m < tray.aabbMinX (cx + 0.6448m)`, tuyệt đối không va chạm với Khay Tài Sản `IMP-402`.
     - **Vẽ Bóng Thoại Tiếng Việt bằng `CanvasTexture` lên `<mesh>` Billboard WebGL thật trên đỉnh tượng (`Y = 1.48m`, lọc bỏ ký tự Emoji lỗi font `▯` khi vẽ lên `CanvasTexture`)**: Tạo `CanvasTexture` (`512x160`, có cache + hàm `disposeDiplomacySpeechBubbleTextures()`) lọc sạch ký tự Emoji đầu chuỗi (`viSlogan.replace(/^[^\p{L}\p{N}]+/u, '').trim()`) và vẽ huy hiệu vector + khung capsule Gỗ Óc Chó `#2B1D14` viền vàng / màu chiến thuật `accentColor` kèm chữ Tiếng Việt có dấu sắc nét lên tấm `<mesh data-testid="diplomacy-speech-bubble-...">` (`planeGeometry args={[1.65, 0.52]}`) đặt trên đỉnh tượng tại `bubbleWorldPosition` (`Y = 1.48m`, dịch bảng hiệu Tây-Nam vào `[cx + 0.85, 1.48, cz - 0.65]` = `[-0.35, 1.48, 11.95]` để không bị cắt mép trái màn hình) hướng thẳng về camera.
     - Bảo vệ tuyệt đối living contract `399.06b`: trong `WarRoomStageLayer`, nếu `isMobile === true` hoặc `Object.keys(effectivePlayers ?? {}).length === 0` (`INITIAL_GAME_STATE`), trả về `null` TRƯỚC khi gọi `SafeGLTFModel.preload`. Cô lập Mobile 100% (`isMobile === true` -> `0` lượt tải `.glb`, `0` `CanvasTexture`, `0` Draw Calls mới, `0` đăng ký `useSafeFrame`).
- **Principles Applied**:
  - *(1) View-Model Seam Extraction* -> Tách toàn bộ toán học `evaluateBotTradeDecision`/`BotPosture`, bộ tạo `createDiplomacySpeechBubbleTexture`, và tọa độ AABB/NDC sang `src/client/3d/war_room_stage_visuals.ts`.
  - *(4) Ephemeral TTL / Dead Man's Switch* -> Khóa cứng `WAR_ROOM_TTL_MS = 2600` (`<= 3000ms`), gài `auctionStartMsRef` theo chữ ký `auction` trong `useEffect` và trả búa/cán cân về tư thế tĩnh khi hết TTL (`[ADV-04]`).
  - *(6) Poka-Yoke Domain Affordance* -> Gọi trực tiếp `evaluateBotTradeDecision` và `BotPosture` qua facade `../../domain/bot/index`, bảo toàn nhánh `PRICE_TOO_LOW` / `PREVENT_MONOPOLY` / `KINGMAKING_DEFENSE` (`[ADV-02]`), và chặn `SafeGLTFModel.preload` khi `playersInfo` rỗng.
  - *(7) Spatial AABB / Non-Occlusion* -> Đặt Bệ Nghị Sự 4 tầng tại `[11.5, -0.28, 2.2]` (`ndcX = +0.5435, ndcY = -0.5734`), thu gọn vòng hào quang `outerRadius = 0.46m` (`halo.aabbMaxX = cx + 0.46m < 0.487m < tray.aabbMinX`), và đặt Bóng thoại Billboard trên đỉnh tượng tại `Y = 1.48m` nằm gọn trong `|ndcX| <= 0.85, |ndcY| <= 0.80`.
  - *(8) Resource Disposal & Cache Hygiene* -> Cache tĩnh `CanvasTexture` bóng thoại theo khoá `${tacticalMode}:${accentColor}:${viSlogan}` kèm `disposeDiplomacySpeechBubbleTextures()` khi unmount.
  - *(9) Platform DI Isolation* -> Tách `useSafeFrame` sang `WarRoomStageFrameLoop` chỉ mount khi `!isMobile`.

## 1. Physical Target Files & Honest LOC Accounting
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/war_room_stage_visuals.ts` | Tier 2 (UI/3D/Views) | 0 | 405 | +405 | <= 500 | New file |
| `src/client/3d/war_room_stage_layer.tsx` | Tier 2 (UI/3D/Views) | 0 | 289 | +289 | <= 500 | New file |
| `src/client/3d/coastal_island_environment.tsx` | Tier 2 (UI/3D/Views) | 275 | 276 | +1 | <= 500 | Safe (<= 300 living ceiling) |
| `tests/client/imp403_war_room_gavel_scale_and_diplomacy_halos.test.ts` | Living Test | 0 | 460 | +460 | <= 600 | New Contract Test Suite |
| `docs/FEATURE_MAP.md` | SSOT Matrix | 92 | 92 | 0 | N/A | Cập nhật Section Gotchas Pillar 13 |
- **Blender 5.2 Sculpted Assets & Sentinel Probes (In-Scope)**: `scripts/blender/build_war_room_artifacts.py`, `public/models/landmarks/auction_gavel.glb`, `public/models/landmarks/trade_balance_scale.glb`, `scripts/sentinel_probes/IMP-403.json`.

## 2. In-Action Visual Capture Registration
- Scenario: Client 3D Desktop War Room Gavel & Balance Scale (`.glb`) and Tycoon Diplomacy Halos & Vietnamese Speech Bubbles. Visual observation verified via `imp403_war_room_gavel_scale_and_diplomacy_halos.test.ts`, `node scripts/capture_visual_evidence.mjs --ticket IMP-403 --dual-viewport --scenario board_ownership_monopoly --wait 8000`, and `node scripts/check_evidence.mjs IMP-403`.

## 3. Implementation Steps

### Station 1: Core Contract Invariants (RED — QA Expands Autonomously into 10–14 Atomic 5-Facet Tests in Station 2)
- **TC-403.01 [UC-POKA-YOKE-BOT-TRADE-SCALE-AND-AUCTION-GAVEL/MSS]:** Given active/idle `pendingTradeOffer` payloads and `auction` states evaluated across elapsed times `-40ms .. 3200ms`, When calling `evaluateWarRoomTradeScale` and `evaluateWarRoomAuctionGavel`, Then delegates trade acceptance strictly to `evaluateBotTradeDecision`, maps accepted vs rejected (`PRICE_TOO_LOW`, `PREVENT_MONOPOLY`, `KINGMAKING_DEFENSE` including normalized `EMBARGO_LEADER` when `buyer.balance >= 30000`) offers to bounded positive vs negative `scaleTiltRad` within `[-0.35, +0.35]`, drives damped harmonic `gavelStrikeAngleRad` within `[-0.48, +0.22]` during active auction windows, and self-heals via Dead Man's Switch (`isActive = false, isExpired = true, gavelStrikeAngleRad = 0, gavelYOffset = 0`) at `elapsedMs >= 2600` (`<= 3000ms`).
- **TC-403.02 [UC-DIPLOMACY-HALOS-AND-WEBGL-VIETNAMESE-SPEECH-BUBBLES/MSS]:** Given player snapshots (`cash`, `ownedProperties`, `levelMap`, `mortgagedProperties`, `bankrupt`, `isBankrupt`) across `p1..p4`, When calling `resolveTycoonDiplomacyPosture`, `getTycoonDiplomacyHaloDescriptors`, `createDiplomacySpeechBubbleTexture`, and `disposeDiplomacySpeechBubbleTextures`, Then resolves all 4 distinct `tacticalMode` values (`RESCUE`, `DEFENSIVE`, `EXPANSION`, `MONOPOLY_OVERLORD`), 4 distinct Vietnamese slogans (`viSlogan`), and all 3 canonical `BotPosture` values (`Trailing`, `Parity`, `Leading`) across `p1..p4` in `board_ownership_monopoly`, excludes bankrupt players (`bankrupt || isBankrupt -> isVisible: false`), strips leading emoji characters when rendering text onto the `CanvasTexture`, and caches/disposes WebGL `CanvasTexture` instances for each slogan.
- **TC-403.03 [UC-WAR-ROOM-SPATIAL-AABB-AND-HUD-SAFE-NDC/MSS]:** Given `getWarRoomStageDescriptor()` and `getTycoonDiplomacyHaloDescriptors()` checked against the 40-tile board (`[-10.15, +10.15]`), the 4 sanctuaries (`getCornerSanctuaryDescriptors()`), and the 4 scaled wealth tray aprons (`getSanctuaryWealthTrayDescriptors()`), When verifying 3D AABB bounds and `1280x800` screen projections, Then places the 4-tier War Room Dais (`lagoonRadius = 1.18m > sandRadius = 1.06m > rimHalf = 0.78m > deckHalf = 0.71m`, `embedDepth >= 0.02m`) in the open Southeast bay at `[11.5, -0.28, 2.2]` (`minX = 10.32m > 10.15m`, gavel-to-scale 2D distance `>= 0.80m`, `gavelWorldPosition = [11.12, -0.08, 2.02]`, `scaleWorldPosition = [11.88, -0.08, 2.38]`, `gavelScale = [1.4, 1.4, 1.4]`, `scaleModelScale = [1.4, 1.4, 1.4]`), places each Halo ring at `[cx, 0.086, cz]` with `innerRadius = 0.36m, outerRadius = 0.46m` (`halo.aabbMaxX = cx + 0.46m < cx + 0.487m < tray.aabbMinX`) and Speech Bubble billboard above the statue top at `Y = 1.48m` (shifting `sanctuary-southwest` inward to `[-0.35, 1.48, 11.95]`), keeping all stage, halo, and bubble coordinates strictly within `|ndcX| <= 0.85, |ndcY| <= 0.80` outside `TopBar`, `PlayerHudList`, and `ActionDock`.
- **TC-403.04 [UC-DESKTOP-GLB-MOUNT-SPEECH-BUBBLE-AND-MOBILE-ISOLATION/MSS]:** Given `CoastalIslandEnvironment` and `WarRoomStageLayer` rendered on Desktop (`isMobile = false`) versus Mobile (`isMobile = true`), When inspecting the rendered tree with empty vs populated `playersInfo` and active/cleared/expired `auction` and `pendingTradeOffer`, Then Desktop bypasses `SafeGLTFModel.preload` when `playersInfo` is `{}` (`INITIAL_GAME_STATE` guard for living contract `399.06b`), preloads and mounts both `<SafeGLTFModel url="/models/landmarks/auction_gavel.glb" />` and `<SafeGLTFModel url="/models/landmarks/trade_balance_scale.glb" />` + 4 Diplomacy Halo rings + 4 WebGL `DiplomacySpeechBubble` billboard meshes (`data-testid="diplomacy-speech-bubble-..."`) with `WarRoomStageFrameLoop` when `playersInfo` is populated, resets gavel/scale transforms without re-triggering after `2600ms` TTL or modal close, and Mobile (`isMobile = true`) mounts `0` `.glb` models, `0` halo/bubble meshes, and registers `0` `useSafeFrame` subscribers.

### Station 2: Implementation (GREEN)

#### Task 1: Tạo Pure View-Model Sân Khấu Nghị Sự 4 Tầng, Hào Quang `outerRadius = 0.46m` & `CanvasTexture` Bóng Thoại Tiếng Việt
**Target physical file**: `src/client/3d/war_room_stage_visuals.ts` (New file)
```typescript
import type { CanvasTexture } from 'three';
import { BotPosture } from '../../domain/bot/index';
import type { PendingTradeOfferDelta } from '../../domain/protocol/index';
import type { ModalPayloadMap, PlayerHudInfo } from '../store/game_store_types';
import type { CornerSanctuaryDescriptor } from './coastal_sanctuary_visuals';

export const WAR_ROOM_MODEL_URLS = {
  gavel: '/models/landmarks/auction_gavel.glb',
  scale: '/models/landmarks/trade_balance_scale.glb',
} as const;

export const WAR_ROOM_GAVEL_BASE_DIMENSIONS = { width: 0.44, height: 0.42, depth: 0.44 } as const;
export const WAR_ROOM_SCALE_BASE_DIMENSIONS = { width: 0.52, height: 0.48, depth: 0.32 } as const;
export const WAR_ROOM_TTL_MS = 2600;
export const WAR_ROOM_MAX_SCALE_TILT_RAD = 0.35;

export type TycoonTacticalMode = 'MONOPOLY_OVERLORD' | 'EXPANSION' | 'DEFENSIVE' | 'RESCUE';

export interface WarRoomStageDescriptor {
  readonly daisPosition: readonly [number, number, number];
  readonly daisRadius: number;
  readonly sandRadius: number;
  readonly rimWidth: number;
  readonly deckWidth: number;
  readonly daisBottomY: number;
  readonly sandTopY: number;
  readonly rimTopY: number;
  readonly daisTopY: number;
  readonly embedDepth: number;
  readonly gavelWorldPosition: readonly [number, number, number];
  readonly gavelScale: readonly [number, number, number];
  readonly gavelRotationY: number;
  readonly scaleWorldPosition: readonly [number, number, number];
  readonly scaleModelScale: readonly [number, number, number];
  readonly scaleRotationY: number;
  readonly ndcX: number;
  readonly ndcY: number;
}

export interface WarRoomTradeScaleState {
  readonly isActive: boolean;
  readonly accept: boolean;
  readonly reason: string;
  readonly scaleTiltRad: number;
  readonly leftPanYOffset: number;
  readonly rightPanYOffset: number;
}

export interface WarRoomAuctionGavelState {
  readonly isActive: boolean;
  readonly isExpired: boolean;
  readonly gavelStrikeAngleRad: number;
  readonly gavelYOffset: number;
  readonly soundBlockPulseScale: number;
}

export interface TycoonDiplomacyHaloDescriptor {
  readonly id: string;
  readonly sanctuaryId: string;
  readonly playerId: string;
  readonly isVisible: boolean;
  readonly posture: BotPosture;
  readonly tacticalMode: TycoonTacticalMode;
  readonly viSlogan: string;
  readonly accentColor: string;
  readonly worldPosition: readonly [number, number, number];
  readonly bubbleWorldPosition: readonly [number, number, number];
  readonly bubbleRotation: readonly [number, number, number];
  readonly bubbleSize: readonly [number, number];
  readonly innerRadius: number;
  readonly outerRadius: number;
  readonly bottomY: number;
  readonly topY: number;
  readonly aabbMaxX: number;
  readonly ndcX: number;
  readonly ndcY: number;
  readonly bubbleNdcX: number;
  readonly bubbleNdcY: number;
}

export function getWarRoomStageDescriptor(): WarRoomStageDescriptor;

export function evaluateWarRoomTradeScale(
  pendingTradeOffer?: PendingTradeOfferDelta | null,
  playersInfo?: Readonly<Record<string, PlayerHudInfo>> | null,
  levelMap?: Record<number, 0 | 1 | 2 | 3>
): WarRoomTradeScaleState;

export function evaluateWarRoomAuctionGavel(
  auction?: ModalPayloadMap['auction'] | null,
  elapsedMs?: number,
  ttlMs?: number
): WarRoomAuctionGavelState;

export function resolveTycoonDiplomacyPosture(
  playerId: string,
  playersInfo?: Readonly<Record<string, PlayerHudInfo>> | null,
  levelMap?: Record<number, 0 | 1 | 2 | 3>
): {
  readonly isVisible: boolean;
  readonly posture: BotPosture;
  readonly tacticalMode: TycoonTacticalMode;
  readonly viSlogan: string;
  readonly accentColor: string;
  readonly netWorth: number;
};

export function getTycoonDiplomacyHaloDescriptors(
  playersInfo?: Readonly<Record<string, PlayerHudInfo>> | null,
  levelMap?: Record<number, 0 | 1 | 2 | 3>,
  sanctuaries?: ReadonlyArray<CornerSanctuaryDescriptor>
): ReadonlyArray<TycoonDiplomacyHaloDescriptor>;

export function createDiplomacySpeechBubbleTexture(
  viSlogan: string,
  accentColor: string,
  tacticalMode: TycoonTacticalMode
): CanvasTexture;

export function disposeDiplomacySpeechBubbleTextures(): void;
```

#### Task 2: Tạo Component `WarRoomStageLayer`, `WarRoomStageFrameLoop` & Đúc 2 Mô Hình `.glb` từ Blender 5.2 LTS
**Target physical file**: `src/client/3d/war_room_stage_layer.tsx` (New file)
```tsx
import React from 'react';
import type { Group, Mesh } from 'three';
import type { PendingTradeOfferDelta } from '../../domain/protocol/index';
import type { ModalPayloadMap, PlayerHudInfo } from '../store/game_store_types';

export interface WarRoomStageLayerProps {
  readonly isMobile?: boolean;
  readonly playersInfo?: Readonly<Record<string, PlayerHudInfo>> | null;
  readonly levelMap?: Record<number, 0 | 1 | 2 | 3>;
  readonly auction?: ModalPayloadMap['auction'] | null;
  readonly pendingTradeOffer?: PendingTradeOfferDelta | null;
}

export interface WarRoomStageFrameLoopProps {
  readonly auction: ModalPayloadMap['auction'] | null | undefined;
  readonly pendingTradeOffer: PendingTradeOfferDelta | null | undefined;
  readonly playersInfo: Readonly<Record<string, PlayerHudInfo>> | null | undefined;
  readonly levelMap: Record<number, 0 | 1 | 2 | 3> | undefined;
  readonly gavelGroupRef: React.MutableRefObject<Group | null>;
  readonly scaleGroupRef: React.MutableRefObject<Group | null>;
  readonly daisRingRef: React.MutableRefObject<Mesh | null>;
  readonly auctionStartMsRef: React.MutableRefObject<number | null>;
}

export function WarRoomStageFrameLoop(props: WarRoomStageFrameLoopProps): null;
export function WarRoomStageLayer(props?: WarRoomStageLayerProps): React.ReactElement | null;
```
- Trong `WarRoomStageLayer`: gọi `useGameStore`, `useRef`, `useEffect`, và `useMemo` vô điều kiện ở đầu hàm; nếu `isMobile === true` hoặc `!effectivePlayers || Object.keys(effectivePlayers).length === 0` thì trả về `null` ngay lập tức TRƯỚC khi gọi `SafeGLTFModel.preload` để bảo toàn tuyệt đối living contract `399.06b`. Khi có người chơi đang hoạt động, preload `WAR_ROOM_MODEL_URLS.gavel` và `WAR_ROOM_MODEL_URLS.scale`, gọi `getWarRoomStageDescriptor()`, `getTycoonDiplomacyHaloDescriptors(effectivePlayers, effectiveLevelMap)`, `resolveTycoonDiplomacyPosture`, `evaluateWarRoomTradeScale`, `evaluateWarRoomAuctionGavel`, và `createDiplomacySpeechBubbleTexture` (đăng ký `disposeDiplomacySpeechBubbleTextures()` khi unmount), gài `auctionStartMsRef.current = Date.now()` trong `useEffect` theo chữ ký `auction`, đồng thời kết xuất Bệ Nghị Sự Đảo Ngọc 4 tầng tại `[11.5, -0.28, 2.2]` (`Lagoon Ring #06B6D4 -> Sand Base #EFE5D8 -> Brass Rim #D97706 -> Walnut & Marble Dais #2B1D14/#F8FAFC`), `<SafeGLTFModel url={WAR_ROOM_MODEL_URLS.gavel} scale={[1.4, 1.4, 1.4]} fallback={<group />} />`, `<SafeGLTFModel url={WAR_ROOM_MODEL_URLS.scale} scale={[1.4, 1.4, 1.4]} fallback={<group />} />`, 4 vòng hào quang thu gọn (`innerRadius = 0.36m, outerRadius = 0.46m`) `data-testid="tycoon-diplomacy-halo-..."`, 4 tấm `<mesh name="DiplomacySpeechBubble" data-testid="diplomacy-speech-bubble-...">` (`planeGeometry args={[1.65, 0.52]}` trên đỉnh tượng `Y = 1.48m` gắn `map={bubbleTexture}`), và `<WarRoomStageFrameLoop />` khi `!isMobile`.
- Viết kịch bản `scripts/blender/build_war_room_artifacts.py` và chạy qua Blender 5.2.2 LTS CLI để xuất `public/models/landmarks/auction_gavel.glb` (`0.44m x 0.42m x 0.44m`, búa vung nghiêng $35^\circ$ trên Sound Block cao) và `public/models/landmarks/trade_balance_scale.glb` (`0.52m x 0.48m x 0.32m`, trụ đồng cao + 2 đĩa cân vàng lớn) (`<= 48KB` mỗi tệp, `<= 1500 tris`, `Pivot [0,0,0]`).

#### Task 3: Call-Site Wiring — Mount `WarRoomStageLayer` trong `CornerTycoonSanctuaries` (`coastal_island_environment.tsx`)
**Target physical file**: `src/client/3d/coastal_island_environment.tsx`
- Import `WarRoomStageLayer` từ `./war_room_stage_layer` (trong đó `WarRoomStageLayer` tự ủy quyền cho `WarRoomStageFrameLoop`) và mount `<WarRoomStageLayer isMobile={false} />` bên trong `<group data-testid="corner-tycoon-sanctuaries">` của `CornerTycoonSanctuaries` (chỉ render trên Desktop khi `!isMobile && quality.tier !== 'MOBILE_BYPASS'`).

#### Task 4: Cập nhật Feature Map Single Source of Truth
**Target physical file**: `docs/FEATURE_MAP.md`
- Cập nhật Pillar 13 (3D Kinematics & Presentation) ghi nhận `IMP-403` (Búa Đấu Giá Gỗ Mun vung nghiêng $35^\circ$ `auction_gavel.glb` & Cân Công Lý Thương Trường `trade_balance_scale.glb` đúc từ Blender 5.2 `scripts/blender/build_war_room_artifacts.py` trên Bệ Nghị Sự Đảo Ngọc 4 tầng `[11.5, -0.28, 2.2]`, kết nối Poka-Yoke với `evaluateBotTradeDecision`/`BotPosture` từ `../../domain/bot/index`, kèm 4 Vòng Hào Quang Chiến Thuật `outerRadius = 0.46m` & 4 Bóng Thoại Thương Trường Việt `CanvasTexture` Billboard trên đỉnh tượng `Y = 1.48m` với Dead Man's Switch `2600ms` và cô lập Mobile 100%).

## 4. Definition of Done (DoD)
- Kịch bản `scripts/blender/build_war_room_artifacts.py` đúc thành công `public/models/landmarks/auction_gavel.glb` (`0.44m x 0.42m x 0.44m`, vung nghiêng $35^\circ$) và `public/models/landmarks/trade_balance_scale.glb` (`0.52m x 0.48m x 0.32m`) (`<= 48KB` mỗi tệp, `<= 1500 tris`, `Pivot [0,0,0]`) bằng Blender 5.2.2 LTS (`bmesh` + `Spin/Lathe` + `Bevel` + `Weighted Normals` + vật liệu PBR).
- Toàn bộ 10–14 atomic contract tests do `qa-tester` mở rộng từ 4 Core Contract Invariants trong `tests/client/imp403_war_room_gavel_scale_and_diplomacy_halos.test.ts` và các bộ test tương thích ngược (`imp399_bay_archipelago_and_mobile_city_silhouette.test.ts`, `dense_metropolis_architecture.test.ts`) PASS 100%.
- Kiểm tra ảnh chụp WebGL thực tế qua `node scripts/capture_visual_evidence.mjs --ticket IMP-403 --dual-viewport --scenario board_ownership_monopoly --wait 8000`: thấy rõ Bệ Nghị Sự Đảo Ngọc 4 tầng với `auction_gavel.glb` + `trade_balance_scale.glb` (`scale = 1.4x`) tại vùng biển mở Đông-Nam `[11.5, -0.28, 2.2]`, 4 Vòng Hào Quang Chiến Thuật (`outerRadius = 0.46m`, 0% chạm Khay Tài Sản `IMP-402`) và 4 Bóng Thoại Thương Trường Tiếng Việt (`CanvasTexture` Billboard trên đỉnh tượng `Y = 1.48m`, lọc sạch ký tự Emoji lỗi font) hiện rõ chữ Tiếng Việt trên `imp-403_desktop.jpg` (0% đè HUD), trong khi `imp-403_mobile_360.jpg` được cô lập 100%.
- Vượt qua `npm run prefilter`, `npm run lint:boundaries` và `node scripts/check_evidence.mjs IMP-403` với 0 defects.
