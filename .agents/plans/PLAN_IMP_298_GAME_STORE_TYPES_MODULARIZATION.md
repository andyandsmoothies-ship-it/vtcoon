# KẾ HOẠCH TRIỂN KHAI MICRO-SLICE: BÓC TÁCH HỆ THỐNG KIỂU DỮ LIỆU GAME STORE (IMP-298)
> **Phân hệ mục tiêu:** `client-state`
> **Phạm vi kỹ thuật:** Giải phóng nợ kỹ thuật dòng mã (LOC Debt) của `src/client/store/game_store_types.ts` (hiện chạm trần báo động đỏ nguy cấp số 1 toàn dự án: 396/400 LOC, Tier 1, chỉ còn vỏn vẹn đúng 4 dòng mã) bằng cách phân tách toàn bộ hệ thống Type System sang kiến trúc Deep Module (tương tự chuẩn IMP-295 & IMP-297): `game_store_subtypes.ts` (~220 LOC), `game_store_state_types.ts` (~190 LOC) và Facade re-export chuẩn ESM `.js` tại `game_store_types.ts` (~3 LOC).
> **Cam kết cốt lõi:**
> 1. **Pure Move 100% (Zero Semantic Mutation):** Bảo toàn nguyên vẹn 100% các interface, type alias, enum `FloatingTextType` và hằng số `INITIAL_GAME_STATE`. Không đổi tên hay biến tính bất kỳ trường dữ liệu nào.
> 2. **Ranh Giới Kiến Trúc Rõ Ràng (Deep Module Domain Separation):** Tách bạch giữa DTOs/Subtypes độc lập (Subsystem Types: Modal, Emote, FloatingText, Pawn, Player), Interface State & Actions (`GameState`, `InitialGameState`, `INITIAL_GAME_STATE`), và Facade tái xuất khẩu.
> 3. **Giải Phóng Triệt Để Cảnh Báo Vàng Tier 1:** 100% các tệp mã nguồn đều $\le 220$ LOC (cách rất xa ngưỡng cảnh báo 300 LOC và trần 400 LOC của Tier 1), tạo dư địa phát triển thênh thang > 180 dòng cho mỗi phân hệ.
> 4. **Scaffolding Protocol & Semantic Behavioral RED:** Khởi tạo stub rỗng cho các tệp mới trước khi chạy test, bảo đảm test suite thất bại do runtime assertions thay vì loader error.
> 5. **Facade Re-export 100% Tương Thích Ngược Chuẩn ESM .js:** Tái xuất khẩu toàn bộ kiểu dữ liệu qua `game_store_types.ts` với hậu tố `.js` chuẩn NodeNext ESM, bảo vệ 100% caller hiện hữu (hơn 30 file import) và bảo toàn tính duy nhất của tham chiếu bộ nhớ (Reference Identity Parity).
> **Baseline Working Tree Dependencies (Predecessor IMP-294/IMP-295/IMP-296/IMP-297):** `src/client/3d/adaptive_cinematic_camera.tsx`, `src/client/3d/camera_state_machine.ts`, `src/client/3d/cinematic_chase_camera.ts`, `src/client/audio/sound_synth_recipes.ts`, `src/client/3d/camera_kinematic_helpers.ts`, `src/client/3d/camera_location_beacon.tsx`, `src/client/3d/camera_soft_return.ts`, `src/client/3d/cinematic_spline_flyby.ts`, `src/client/3d/use_camera_gestures.ts`, `src/client/audio/synth_recipes_ambient.ts`, `src/client/audio/synth_recipes_gameplay.ts`, `src/client/audio/synth_recipes_ui.ts`, `src/client/ui/actionable_notification_gameplay.ts`, `src/client/ui/actionable_notification_system.ts`, `src/client/ui/actionable_notification_map.ts`, `src/client/ui/actionable_notification.ts`, `tests/client/actionable_notification_modular.test.ts`, `tests/client/camera_gestures.test.ts`, `tests/client/camera_soft_return_and_beacon.test.ts`, `tests/client/cinematic_spline_flyby.test.ts`, `tests/client/dramatic_pacing_camera.test.ts`, `tests/client/sound_synth_recipes_modular.test.ts`, `tests/client/spatial_kinematics_camera.test.ts`
---
### Bảng 1: Phân bổ Ranh giới Phân hệ (Subsystem Boundary Alignment)
| Tệp Mã Nguồn | Phân Hệ | Vai Trò Kiến Trúc |
| :--- | :--- | :--- |
| `src/client/store/game_store_subtypes.ts` | `client-state` | **MỚI**: Lưu trữ các types và DTOs độc lập: Pawn, Player, Modal, Emote, FloatingText và enum `FloatingTextType` |
| `src/client/store/game_store_state_types.ts` | `client-state` | **MỚI**: Lưu trữ giao diện trung tâm `GameState`, `InitialGameState` và đối tượng bất biến `INITIAL_GAME_STATE` |
| `src/client/store/game_store_types.ts` | `client-state` | **SỬA**: Tinh gọn thành Facade Re-export chuẩn ESM `.js` kết nối `game_store_subtypes.js` và `game_store_state_types.js` |
| `tests/client/game_store_types_modular.test.ts` | Living Test | **MỚI**: Living Contract Test kiểm tra độc lập tính toàn vẹn State khởi tạo, ánh xạ enum, reference identity và module hygiene |
---
### Bảng 2: Ngân Sách Dòng Mã (LOC Accounting)
| Target physical file | Tier Classification | Baseline LOC | Expected LOC | Net Change | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/store/game_store_subtypes.ts` | Tier 1 (Domain/Server/Logic) | 0 | 219 | +219 | <= 400 | ✔️ Safe |
| `src/client/store/game_store_state_types.ts` | Tier 1 (Domain/Server/Logic) | 0 | 194 | +194 | <= 400 | ✔️ Safe |
| `src/client/store/game_store_types.ts` | Tier 1 (Domain/Server/Logic) | 396 | 3 | -393 | <= 400 | ⚠️ Warning |
| `tests/client/game_store_types_modular.test.ts` | Living Test | 0 | 180 | +180 | <= 600 | ✔️ Safe |
---
### Trạm 1: Hợp Đồng Kiểm Thử Độc Lập (RED Contract Tests)
**Target physical file**: `tests/client/game_store_types_modular.test.ts` (Tệp mới)
> **Kỷ luật Seam Discipline (Iron Law):** Không can thiệp framework internals. Kiểm thử trực tiếp giá trị thực nghiệm quan sát được của `INITIAL_GAME_STATE`, enum `FloatingTextType`, và tính bất biến tham chiếu bộ nhớ.
> **Quy chuẩn Scaffolding Stub Type-Safe:** Các tệp mới được scaffold trước với kiểu dữ liệu tường minh, tuyệt đối CẤM `as any` và `as unknown as T`.
> **Kỷ luật Zero Loops in it():** Cấm tuyệt đối vòng lặp `for`, `for...of`, `.forEach()` trong `it()`. Mật độ duy trì nghiêm ngặt trong dải vàng 1-4 asserts/test.

1. **TC-ST-TYPE.01 [UC-ST-TYPE/MSS]**: Given hằng số INITIAL_GAME_STATE từ src/client/store/game_store_state_types.ts, When truy xuất trường dice, Then giá trị là mảng hai phần tử khởi điểm [1, 1].
2. **TC-ST-TYPE.02 [UC-ST-TYPE/MSS]**: Given hằng số INITIAL_GAME_STATE từ src/client/store/game_store_state_types.ts, When truy xuất các trường số vòng đấu, Then roundNumber bằng 1 và maxRounds bằng 40.
3. **TC-ST-TYPE.03 [UC-ST-TYPE/MSS]**: Given hằng số INITIAL_GAME_STATE từ src/client/store/game_store_state_types.ts, When truy xuất trường turnPhase, Then giá trị giai đoạn lượt chơi ban đầu tương ứng TurnPhase.WaitingRoll.
4. **TC-ST-TYPE.04 [UC-ST-TYPE/MSS]**: Given hằng số INITIAL_GAME_STATE từ src/client/store/game_store_state_types.ts, When truy xuất trường turnTimeRemaining, Then giá trị đếm ngược thời gian mặc định bằng 60 giây.
5. **TC-ST-TYPE.05 [UC-ST-TYPE/MSS]**: Given hằng số INITIAL_GAME_STATE từ src/client/store/game_store_state_types.ts, When truy xuất các cờ camera, Then cameraFocusCell có giá trị null và hasUserCustomCamera bằng false.
6. **TC-ST-TYPE.06 [UC-ST-TYPE/MSS]**: Given hằng số INITIAL_GAME_STATE từ src/client/store/game_store_state_types.ts, When truy xuất cờ hiển thị giao diện isPlayerHudVisible, Then giá trị mặc định là true.
7. **TC-ST-TYPE.07 [UC-ST-TYPE/MSS]**: Given hằng số INITIAL_GAME_STATE từ src/client/store/game_store_state_types.ts, When truy xuất trường quỹ kho bạc treasuryPool, Then giá trị số dư khởi điểm bằng 0.
8. **TC-ST-TYPE.08 [UC-ST-TYPE/MSS]**: Given hằng số INITIAL_GAME_STATE từ src/client/store/game_store_state_types.ts, When truy xuất trạng thái đổ xúc xắc, Then isRolling bằng false và hasRolledThisTurn bằng false.
9. **TC-ST-TYPE.09 [UC-ST-TYPE/MSS]**: Given hằng số INITIAL_GAME_STATE từ src/client/store/game_store_state_types.ts, When truy xuất các bảng từ điển levelMap và propertyStates, Then cả hai đều là các đối tượng rỗng.
10. **TC-ST-TYPE.10 [UC-ST-TYPE/MSS]**: Given hằng số INITIAL_GAME_STATE từ src/client/store/game_store_state_types.ts, When truy xuất các tập hợp người chơi playersInfo và playerPositions, Then cả hai tập hợp ban đầu đều là đối tượng rỗng.
11. **TC-ST-TYPE.11 [UC-ST-TYPE/MSS]**: Given hằng số INITIAL_GAME_STATE từ src/client/store/game_store_state_types.ts, When truy xuất các trường modal hoạt động activeModal và modalPayload, Then cả hai đều có giá trị ban đầu là null.
12. **TC-ST-TYPE.12 [UC-ST-TYPE/MSS]**: Given hằng số INITIAL_GAME_STATE từ src/client/store/game_store_state_types.ts, When truy xuất các trường biểu cảm activeEmotes và floatingTexts, Then activeEmotes là đối tượng rỗng và floatingTexts là mảng rỗng.
13. **TC-ST-TYPE.13 [UC-ST-TYPE/MSS]**: Given enum FloatingTextType từ src/client/store/game_store_subtypes.ts, When truy xuất các khóa Reward, Bonus và Penalty, Then Reward bằng 'reward', Bonus bằng 'reward' và Penalty bằng 'penalty'.
14. **TC-ST-TYPE.14 [UC-ST-TYPE/MSS]**: Given hằng số INITIAL_GAME_STATE được nhập khẩu từ game_store_types và game_store_state_types, When kiểm tra tham chiếu đối tượng trên bộ nhớ, Then hai định danh trỏ về cùng một địa chỉ reference duy nhất.
15. **TC-ST-TYPE.15 [UC-ST-TYPE/MSS]**: Given enum FloatingTextType được nhập khẩu từ game_store_types và game_store_subtypes, When kiểm tra tham chiếu định danh trên bộ nhớ, Then hai định danh trỏ về cùng một enum reference duy nhất.
16. **TC-ST-TYPE.16 [UC-ST-TYPE/MSS]**: Given quá trình nạp module game_store_types và game_store_subtypes, When kiểm tra cây phụ thuộc ESM một chiều, Then không xảy ra đệ quy vòng tròn circular dependency.
---
### Trạm 2: Kế Hoạch Triển Khai Chi Tiết (Implementation Tasks)

#### Task 1: Khởi Tạo Tệp Kiểu Dữ Liệu Phân Hệ `src/client/store/game_store_subtypes.ts`
**Target physical file**: `src/client/store/game_store_subtypes.ts` (Tệp mới)

```typescript
// [IMP-298] Game Store Subsystem Types & DTO Definitions
import { TurnPhase, type EventCardInfo, type MarketModifier, type PendingBuyoutSession } from '../../domain/room.js';
import type { PendingTradeOfferDelta, DiplomaticEventDelta } from '../../server/session_manager.js';
import type { BotPersonality } from '../../domain/bot/bot_types.js';
import type { BondContract } from '../../domain/bond_types.js';
import type { ChanceCardId } from '../../domain/event_card_engine.js';
import type { TransitWheelOutcome } from '../../domain/transit_wheel.js';

export interface PawnAnimationState {
  readonly playerId: string;
  readonly fromCell: number;
  readonly targetCell?: number;
  readonly waypoints: readonly number[];
  readonly currentIndex?: number;
  readonly isAnimating: boolean;
  readonly isBot?: boolean;
  readonly isJailFlight?: boolean;
}

export interface PawnMoveTask {
  readonly playerId: string;
  readonly fromCell: number;
  readonly targetCell: number;
  readonly waypoints: readonly number[];
  readonly isBot?: boolean;
  readonly isJailFlight?: boolean;
}

export interface PlayerHudInfo {
  readonly id: string;
  readonly name: string;
  readonly balance: number;
  readonly tokenColor: string;
  readonly ownedProperties: readonly number[];
  readonly mortgagedProperties?: readonly number[];
  readonly mortgageLoans?: Record<number, number>;
  readonly inAudit?: boolean;
  readonly auditTurnsLeft?: number;
  readonly auditCount?: number;
  readonly skipNextTurn?: boolean;
  readonly consecutiveDoubles?: number;
  readonly extraTurns?: number;
  readonly bankrupt?: boolean;
  readonly isBankrupt?: boolean;
  readonly personality?: BotPersonality;
  readonly isBot?: boolean;
  readonly overdraftRoundsLeft?: number;
  readonly pawnSlot?: number;
  readonly ownerSlot?: number;
  readonly mascotIcon?: string;
  readonly mascotName?: string;
  readonly avatar?: string;
  readonly bondContract?: BondContract | null;
  readonly hand?: readonly ChanceCardId[];
}

export type PlayerInfo = PlayerHudInfo;

export interface ActiveEmote {
  readonly playerId: string;
  readonly emoteId: string;
  readonly timestamp: number;
}

export enum FloatingTextType {
  Reward = 'reward',
  Bonus = 'reward',
  Penalty = 'penalty',
}

export type FloatingActionType =
  | 'buy'
  | 'upgrade'
  | 'rent'
  | 'rent_pay'
  | 'rent_receive'
  | 'tax'
  | 'bail'
  | 'salary'
  | 'monopoly'
  | 'debt_relief'
  | 'bankrupt'
  | 'stimulus'
  | 'chance'
  | 'market'
  | 'auction_win'
  | 'hose'
  | 'teleport'
  | 'audit_jail'
  | 'ma_buyout'
  | 'mortgage'
  | 'unmortgage'
  | 'diplomatic'
  | 'trade'
  | 'decline_auction'
  | 'transit'
  | 'general';

export interface FloatingTextItem {
  readonly id: string;
  readonly text: string;
  readonly type?: FloatingTextType;
  readonly playerId: string;
  readonly timestamp: number;
  readonly durationMs?: number;
  readonly actionType?: FloatingActionType;
  readonly title?: string;
  readonly cellIndex?: number;
  readonly targetPlayerId?: string;
  readonly targetPlayerName?: string;
  readonly formula?: string; // [IMP-216] Dòng 1: Lý do / công thức rõ nghĩa, súc tích
  readonly bailKind?: 'voluntary' | 'forced' | 'doubles'; // [IMP-216] Phân định chính xác loại bảo lãnh (No Magic Strings)
  readonly groupId?: string; // [IMP-252] Khóa nhóm giao dịch P2P đối ứng
}

export type ActiveModalType = 'deed' | 'portfolio' | 'auction' | 'trade' | 'event' | 'hose' | 'insolvency' | 'game_over' | 'rules' | 'masterplan' | 'bot_trade_offer' | 'compulsory_buyout' | 'transit_wheel' | null;

export interface ModalPayloadMap {
  deed: { cellIndex: number; canBuy?: boolean; ownedProperties?: readonly number[]; isBuyOpportunity?: boolean };
  portfolio: {
    playerId?: string;
    targetPurchaseCellIndex?: number;
  };
  auction: {
    cellIndex: number;
    currentBid?: number;
    highestBidderId?: string | null;
    timeRemaining?: number;
    deadline?: number;
    hasPassed?: boolean;
    passedPlayerIds?: readonly string[];
    declinedPlayerId?: string;
    isConcluded?: boolean;
    winnerId?: string | null;
    finalPrice?: number;
    insolvencyPlayerId?: string;
    isForeclosure?: boolean;
    isFireSale?: boolean;
    startingBid?: number;
    highestBid?: number;
    highestBidder?: string;
  };
  trade: {
    targetPlayerId: string;
    offeredProperties: number[];
    requestedProperties: number[];
    cashOffer: number;
    cashRequest: number;
  };
  event: {
    cardType: 'chance' | 'market';
    cardId: string;
    title: string;
    description: string;
    effectDelta?: number;
    targetScope?: string;
    effectDetail?: string;
    duration?: string;
    destination?: string;
  };
  hose: {
    minStake?: number;
    maxStake?: number;
    currentStake?: number;
    lastDiceRoll?: number;
    lastPayout?: number;
    lastMultiplier?: number;
    lastProfit?: number;
    isReviewingResult?: boolean;
  };
  insolvency: {
    playerId: string;
    deficit: number;
  };
  game_over: {
    leaderboard: ReadonlyArray<{ readonly id: string; readonly netWorth: number }>;
  };
  rules: {
    initialTab?: 'core' | 'cards' | 'mechanics';
  };
  masterplan: {
    initialTab?: 'blueprint' | 'districts';
    selectedCellIndex?: number;
  };
  bot_trade_offer: {
    offerId: string;
    cellIndex: number;
    price: number;
    buyerId: string;
    sellerId: string;
    expiresAt: number;
    offeredCellIndex?: number;
  };
  compulsory_buyout: PendingBuyoutSession;
  transit_wheel: { cellIndex: number; playerId?: string; outcome?: TransitWheelOutcome | string; targetCell?: number; payout?: number; boostSteps?: number };
}

export interface PendingPawnMove {
  readonly playerId: string;
  readonly targetCell: number;
  readonly fromCell: number;
  readonly isBot?: boolean;
  readonly isJailFlight?: boolean;
}

export interface LastLandedPawn {
  readonly playerId: string;
  readonly cellIndex: number;
  readonly timestamp: number;
}

export type ClientMarketModifier = MarketModifier | {
  readonly type: MarketModifier['type'] | string;
  readonly remainingRounds: number;
  readonly affectedCells?: readonly number[];
  readonly multiplier?: number;
  readonly beneficiaryId?: string;
};

```
---
#### Task 2: Khởi Tạo Tệp Kiểu Dữ Liệu State & Actions `src/client/store/game_store_state_types.ts`
**Target physical file**: `src/client/store/game_store_state_types.ts` (Tệp mới)

```typescript
// [IMP-298] Game Store State & Action Type Definitions
import { TurnPhase, type EventCardInfo, type PendingBuyoutSession } from '../../domain/room.js';
import type { PendingTradeOfferDelta, DiplomaticEventDelta } from '../../server/session_manager.js';
import type {
  PawnAnimationState,
  PawnMoveTask,
  PlayerHudInfo,
  ActiveEmote,
  FloatingTextItem,
  ActiveModalType,
  ModalPayloadMap,
  PendingPawnMove,
  LastLandedPawn,
  ClientMarketModifier,
} from './game_store_subtypes.js';

export interface GameState {
  readonly levelMap: Record<number, 0 | 1 | 2 | 3>;
  readonly propertyStates: Record<number, { level: 0 | 1 | 2 | 3; isETC?: boolean; isUpgradedUtility?: boolean }>;
  readonly playerPositions: Record<string, number>;
  readonly visualPositions: Record<string, number>;
  readonly dice: [number, number];
  readonly isRolling: boolean;
  readonly hasRolledThisTurn: boolean;
  readonly lastDiceSeq?: number;
  readonly activePawnAnimation: PawnAnimationState | null;
  readonly pawnAnimationQueue: readonly PawnMoveTask[];
  readonly pendingPawnMove: PendingPawnMove | null;
  readonly lastLandedPawn: LastLandedPawn | null;

  // UI-03 HUD Financial & Turn States
  readonly playersInfo: Record<string, PlayerHudInfo>;
  readonly currentTurnPlayerId: string | null;

  readonly turnTimeRemaining: number;
  readonly turnPhase?: TurnPhase;
  readonly treasuryPool: number;
  readonly roundNumber: number;
  readonly maxRounds: number;
  readonly activeModifiers: ReadonlyArray<ClientMarketModifier>;
  readonly isHeatmapActive: boolean;
  readonly isOfflineMode?: boolean;
  readonly spotlightedCellIndices?: readonly number[] | null;

  // UI-04 Business Modals State
  readonly activeModal: ActiveModalType;
  readonly modalPayload: ModalPayloadMap[keyof ModalPayloadMap] | null;
  readonly lastEventCard: EventCardInfo | null;
  readonly pendingBuyout?: PendingBuyoutSession | null;
  readonly pendingTradeOffer: PendingTradeOfferDelta | null;
  readonly auction?: ModalPayloadMap['auction'] | null;
  readonly dismissedAuctionCellIndex: number | null;
  setAuction: (auction: ModalPayloadMap['auction'] | null) => void;
  setDismissedAuctionCellIndex: (cellIndex: number | null) => void;
  dismissAuction: (cellIndex: number) => void;
  restoreAuction: () => void;

  // UI-05 Social Emotes & Micro-VFX
  readonly activeEmotes: Record<string, ActiveEmote>;
  readonly floatingTexts: readonly FloatingTextItem[];
  readonly lastDiplomaticEvent?: DiplomaticEventDelta | null;

  // IMP-133 Camera Sticky Focus & IMP-190 Custom Orbit Camera
  readonly cameraFocusCell: number | null;
  setCameraFocusCell: (cellIndex: number | null) => void;
  readonly hasUserCustomCamera: boolean;
  setHasUserCustomCamera: (hasUserCustomCamera: boolean) => void;
  resetGameState: () => void;

  setLastEventCard: (card: EventCardInfo | null) => void;
  setLevelMap: (map: Record<number, 0 | 1 | 2 | 3>) => void;
  setPropertyStates: (map: Record<number, { level: 0 | 1 | 2 | 3; isETC?: boolean; isUpgradedUtility?: boolean }>) => void;
  setPlayerPositions: (positions: Record<string, number>) => void;
  setVisualPositions: (positions: Record<string, number>) => void;
  setDice: (dice: [number, number]) => void;
  setIsRolling: (isRolling: boolean) => void;
  setHasRolledThisTurn: (hasRolled: boolean) => void;
  setLastDiceSeq: (seq: number | undefined) => void;
  triggerDiceRoll: (dice: [number, number], diceSeq?: number) => void;
  setPendingPawnMove: (move: PendingPawnMove | null) => void;
  enqueuePawnMove: (task: PawnMoveTask) => void;
  processPawnQueue: () => void;
  startPawnMove: (playerId: string, targetCell: number, fromCell?: number, isBot?: boolean, isJailFlight?: boolean) => void;
  completePawnMove: (playerId: string) => void;
  clearActivePawnAnimation: () => void;

  // UI-03 HUD Actions
  setPlayersInfo: (players: Record<string, PlayerHudInfo>) => void;
  updatePlayerInfo: (playerId: string, partial: Partial<PlayerHudInfo>) => void;
  setCurrentTurnPlayerId: (playerId: string | null) => void;
  setTurnTimeRemaining: (seconds: number) => void;
  decrementTurnTimer: () => void;
  setTurnPhase: (turnPhase?: TurnPhase) => void;
  setTreasuryPool: (amount: number) => void;
  setRoundInfo: (round: number, maxRounds?: number) => void;
  setRoundNumber: (round: number) => void;
  setActiveModifiers: (modifiers: ReadonlyArray<ClientMarketModifier>) => void;
  toggleHeatmap: () => void;
  setHeatmapActive: (active: boolean) => void;
  setSpotlightedCells: (cells: readonly number[] | null) => void;
  readonly isPlayerHudVisible: boolean;
  togglePlayerHudVisibility: () => void;

  // UI-04 Business Modals Actions
  openModal: <T extends keyof ModalPayloadMap>(type: T, payload: ModalPayloadMap[T]) => void;
  closeModal: () => void;
  updateModalPayload: <T extends keyof ModalPayloadMap>(patch: Partial<ModalPayloadMap[T]>) => void;
  setPendingBuyout: (pendingBuyout: PendingBuyoutSession | null) => void;
  setPendingTradeOffer: (offer: PendingTradeOfferDelta | null) => void;

  // UI-05 Social Emotes & Micro-VFX Actions
  triggerEmote: (playerId: string, emoteId: string) => void;
  clearEmote: (playerId: string) => void;
  addFloatingText: (item: Omit<FloatingTextItem, 'id' | 'timestamp'> & { id?: string }) => void;
  removeFloatingText: (id: string) => void;
  clearExpiredFloatingTexts: (now?: number) => void;
}

export type InitialGameState = Pick<
  GameState,
  | 'levelMap'
  | 'propertyStates'
  | 'playerPositions'
  | 'visualPositions'
  | 'dice'
  | 'isRolling'
  | 'hasRolledThisTurn'
  | 'lastDiceSeq'
  | 'activePawnAnimation'
  | 'pawnAnimationQueue'
  | 'pendingPawnMove'
  | 'lastLandedPawn'
  | 'playersInfo'
  | 'currentTurnPlayerId'
  | 'turnTimeRemaining'
  | 'turnPhase'
  | 'treasuryPool'
  | 'roundNumber'
  | 'maxRounds'
  | 'activeModifiers'
  | 'isHeatmapActive'
  | 'spotlightedCellIndices'
  | 'activeModal'
  | 'modalPayload'
  | 'lastEventCard'
  | 'pendingBuyout'
  | 'pendingTradeOffer'
  | 'auction'
  | 'dismissedAuctionCellIndex'
  | 'activeEmotes'
  | 'floatingTexts'
  | 'lastDiplomaticEvent'
  | 'cameraFocusCell'
  | 'hasUserCustomCamera'
  | 'isPlayerHudVisible'
>;

export const INITIAL_GAME_STATE: InitialGameState = {
  levelMap: {},
  propertyStates: {},
  playerPositions: {},
  visualPositions: {},
  dice: [1, 1],
  isRolling: false,
  hasRolledThisTurn: false,
  lastDiceSeq: undefined,
  activePawnAnimation: null,
  pawnAnimationQueue: [],
  pendingPawnMove: null,
  lastLandedPawn: null,
  playersInfo: {},
  currentTurnPlayerId: null,
  turnTimeRemaining: 60,
  turnPhase: TurnPhase.WaitingRoll,
  treasuryPool: 0,
  roundNumber: 1,
  maxRounds: 40,
  activeModifiers: [],
  isHeatmapActive: false,
  spotlightedCellIndices: null,
  isPlayerHudVisible: true,
  activeModal: null,
  modalPayload: null,
  lastEventCard: null,
  pendingBuyout: null,
  pendingTradeOffer: null,
  auction: null,
  dismissedAuctionCellIndex: null,
  activeEmotes: {},
  floatingTexts: [],
  lastDiplomaticEvent: null,
  cameraFocusCell: null,
  hasUserCustomCamera: false,
};
```
---
#### Task 3: Chuyển Đổi Facade Re-export Chuẩn ESM `.js` Trong `src/client/store/game_store_types.ts`
**Target physical file**: `src/client/store/game_store_types.ts`

```typescript
<<<<
import { TurnPhase, type EventCardInfo, type MarketModifier, type PendingBuyoutSession } from '../../domain/room';
import type { PendingTradeOfferDelta, DiplomaticEventDelta } from '../../server/session_manager';
import type { BotPersonality } from '../../domain/bot/bot_types';
import type { BondContract } from '../../domain/bond_types';
import type { ChanceCardId } from '../../domain/event_card_engine';
import type { TransitWheelOutcome } from '../../domain/transit_wheel';

export interface PawnAnimationState {
  readonly playerId: string;
  readonly fromCell: number;
  readonly targetCell?: number;
  readonly waypoints: readonly number[];
  readonly currentIndex?: number;
  readonly isAnimating: boolean;
  readonly isBot?: boolean;
  readonly isJailFlight?: boolean;
}

export interface PawnMoveTask {
  readonly playerId: string;
  readonly fromCell: number;
  readonly targetCell: number;
  readonly waypoints: readonly number[];
  readonly isBot?: boolean;
  readonly isJailFlight?: boolean;
}

export interface PlayerHudInfo {
  readonly id: string;
  readonly name: string;
  readonly balance: number;
  readonly tokenColor: string;
  readonly ownedProperties: readonly number[];
  readonly mortgagedProperties?: readonly number[];
  readonly mortgageLoans?: Record<number, number>;
  readonly inAudit?: boolean;
  readonly auditTurnsLeft?: number;
  readonly auditCount?: number;
  readonly skipNextTurn?: boolean;
  readonly consecutiveDoubles?: number;
  readonly extraTurns?: number;
  readonly bankrupt?: boolean;
  readonly isBankrupt?: boolean;
  readonly personality?: BotPersonality;
  readonly isBot?: boolean;
  readonly overdraftRoundsLeft?: number;
  readonly pawnSlot?: number;
  readonly ownerSlot?: number;
  readonly mascotIcon?: string;
  readonly mascotName?: string;
  readonly avatar?: string;
  readonly bondContract?: BondContract | null;
  readonly hand?: readonly ChanceCardId[];
}

export type PlayerInfo = PlayerHudInfo;

export interface ActiveEmote {
  readonly playerId: string;
  readonly emoteId: string;
  readonly timestamp: number;
}

export enum FloatingTextType {
  Reward = 'reward',
  Bonus = 'reward',
  Penalty = 'penalty',
}

export type FloatingActionType =
  | 'buy'
  | 'upgrade'
  | 'rent'
  | 'rent_pay'
  | 'rent_receive'
  | 'tax'
  | 'bail'
  | 'salary'
  | 'monopoly'
  | 'debt_relief'
  | 'bankrupt'
  | 'stimulus'
  | 'chance'
  | 'market'
  | 'auction_win'
  | 'hose'
  | 'teleport'
  | 'audit_jail'
  | 'ma_buyout'
  | 'mortgage'
  | 'unmortgage'
  | 'diplomatic'
  | 'trade'
  | 'decline_auction'
  | 'transit'
  | 'general';

export interface FloatingTextItem {
  readonly id: string;
  readonly text: string;
  readonly type?: FloatingTextType;
  readonly playerId: string;
  readonly timestamp: number;
  readonly durationMs?: number;
  readonly actionType?: FloatingActionType;
  readonly title?: string;
  readonly cellIndex?: number;
  readonly targetPlayerId?: string;
  readonly targetPlayerName?: string;
  readonly formula?: string; // [IMP-216] Dòng 1: Lý do / công thức rõ nghĩa, súc tích
  readonly bailKind?: 'voluntary' | 'forced' | 'doubles'; // [IMP-216] Phân định chính xác loại bảo lãnh (No Magic Strings)
  readonly groupId?: string; // [IMP-252] Khóa nhóm giao dịch P2P đối ứng
}

export type ActiveModalType = 'deed' | 'portfolio' | 'auction' | 'trade' | 'event' | 'hose' | 'insolvency' | 'game_over' | 'rules' | 'masterplan' | 'bot_trade_offer' | 'compulsory_buyout' | 'transit_wheel' | null;

export interface ModalPayloadMap {
  deed: { cellIndex: number; canBuy?: boolean; ownedProperties?: readonly number[]; isBuyOpportunity?: boolean };
  portfolio: {
    playerId?: string;
    targetPurchaseCellIndex?: number;
  };
  auction: {
    cellIndex: number;
    currentBid?: number;
    highestBidderId?: string | null;
    timeRemaining?: number;
    deadline?: number;
    hasPassed?: boolean;
    passedPlayerIds?: readonly string[];
    declinedPlayerId?: string;
    isConcluded?: boolean;
    winnerId?: string | null;
    finalPrice?: number;
    insolvencyPlayerId?: string;
    isForeclosure?: boolean;
    isFireSale?: boolean;
    startingBid?: number;
    highestBid?: number;
    highestBidder?: string;
  };
  trade: {
    targetPlayerId: string;
    offeredProperties: number[];
    requestedProperties: number[];
    cashOffer: number;
    cashRequest: number;
  };
  event: {
    cardType: 'chance' | 'market';
    cardId: string;
    title: string;
    description: string;
    effectDelta?: number;
    targetScope?: string;
    effectDetail?: string;
    duration?: string;
    destination?: string;
  };
  hose: {
    minStake?: number;
    maxStake?: number;
    currentStake?: number;
    lastDiceRoll?: number;
    lastPayout?: number;
    lastMultiplier?: number;
    lastProfit?: number;
    isReviewingResult?: boolean;
  };
  insolvency: {
    playerId: string;
    deficit: number;
  };
  game_over: {
    leaderboard: ReadonlyArray<{ readonly id: string; readonly netWorth: number }>;
  };
  rules: {
    initialTab?: 'core' | 'cards' | 'mechanics';
  };
  masterplan: {
    initialTab?: 'blueprint' | 'districts';
    selectedCellIndex?: number;
  };
  bot_trade_offer: {
    offerId: string;
    cellIndex: number;
    price: number;
    buyerId: string;
    sellerId: string;
    expiresAt: number;
    offeredCellIndex?: number;
  };
  compulsory_buyout: PendingBuyoutSession;
  transit_wheel: { cellIndex: number; playerId?: string; outcome?: TransitWheelOutcome | string; targetCell?: number; payout?: number; boostSteps?: number };
}

export interface PendingPawnMove {
  readonly playerId: string;
  readonly targetCell: number;
  readonly fromCell: number;
  readonly isBot?: boolean;
  readonly isJailFlight?: boolean;
}

export interface LastLandedPawn {
  readonly playerId: string;
  readonly cellIndex: number;
  readonly timestamp: number;
}

export type ClientMarketModifier = MarketModifier | {
  readonly type: MarketModifier['type'] | string;
  readonly remainingRounds: number;
  readonly affectedCells?: readonly number[];
  readonly multiplier?: number;
  readonly beneficiaryId?: string;
};

export interface GameState {
  readonly levelMap: Record<number, 0 | 1 | 2 | 3>;
  readonly propertyStates: Record<number, { level: 0 | 1 | 2 | 3; isETC?: boolean; isUpgradedUtility?: boolean }>;
  readonly playerPositions: Record<string, number>;
  readonly visualPositions: Record<string, number>;
  readonly dice: [number, number];
  readonly isRolling: boolean;
  readonly hasRolledThisTurn: boolean;
  readonly lastDiceSeq?: number;
  readonly activePawnAnimation: PawnAnimationState | null;
  readonly pawnAnimationQueue: readonly PawnMoveTask[];
  readonly pendingPawnMove: PendingPawnMove | null;
  readonly lastLandedPawn: LastLandedPawn | null;

  // UI-03 HUD Financial & Turn States
  readonly playersInfo: Record<string, PlayerHudInfo>;
  readonly currentTurnPlayerId: string | null;

  readonly turnTimeRemaining: number;
  readonly turnPhase?: TurnPhase;
  readonly treasuryPool: number;
  readonly roundNumber: number;
  readonly maxRounds: number;
  readonly activeModifiers: ReadonlyArray<ClientMarketModifier>;
  readonly isHeatmapActive: boolean;
  readonly isOfflineMode?: boolean;
  readonly spotlightedCellIndices?: readonly number[] | null;

  // UI-04 Business Modals State
  readonly activeModal: ActiveModalType;
  readonly modalPayload: ModalPayloadMap[keyof ModalPayloadMap] | null;
  readonly lastEventCard: EventCardInfo | null;
  readonly pendingBuyout?: PendingBuyoutSession | null;
  readonly pendingTradeOffer: PendingTradeOfferDelta | null;
  readonly auction?: ModalPayloadMap['auction'] | null;
  readonly dismissedAuctionCellIndex: number | null;
  setAuction: (auction: ModalPayloadMap['auction'] | null) => void;
  setDismissedAuctionCellIndex: (cellIndex: number | null) => void;
  dismissAuction: (cellIndex: number) => void;
  restoreAuction: () => void;

  // UI-05 Social Emotes & Micro-VFX
  readonly activeEmotes: Record<string, ActiveEmote>;
  readonly floatingTexts: readonly FloatingTextItem[];
  readonly lastDiplomaticEvent?: DiplomaticEventDelta | null;

  // IMP-133 Camera Sticky Focus & IMP-190 Custom Orbit Camera
  readonly cameraFocusCell: number | null;
  setCameraFocusCell: (cellIndex: number | null) => void;
  readonly hasUserCustomCamera: boolean;
  setHasUserCustomCamera: (hasUserCustomCamera: boolean) => void;
  resetGameState: () => void;

  setLastEventCard: (card: EventCardInfo | null) => void;
  setLevelMap: (map: Record<number, 0 | 1 | 2 | 3>) => void;
  setPropertyStates: (map: Record<number, { level: 0 | 1 | 2 | 3; isETC?: boolean; isUpgradedUtility?: boolean }>) => void;
  setPlayerPositions: (positions: Record<string, number>) => void;
  setVisualPositions: (positions: Record<string, number>) => void;
  setDice: (dice: [number, number]) => void;
  setIsRolling: (isRolling: boolean) => void;
  setHasRolledThisTurn: (hasRolled: boolean) => void;
  setLastDiceSeq: (seq: number | undefined) => void;
  triggerDiceRoll: (dice: [number, number], diceSeq?: number) => void;
  setPendingPawnMove: (move: PendingPawnMove | null) => void;
  enqueuePawnMove: (task: PawnMoveTask) => void;
  processPawnQueue: () => void;
  startPawnMove: (playerId: string, targetCell: number, fromCell?: number, isBot?: boolean, isJailFlight?: boolean) => void;
  completePawnMove: (playerId: string) => void;
  clearActivePawnAnimation: () => void;

  // UI-03 HUD Actions
  setPlayersInfo: (players: Record<string, PlayerHudInfo>) => void;
  updatePlayerInfo: (playerId: string, partial: Partial<PlayerHudInfo>) => void;
  setCurrentTurnPlayerId: (playerId: string | null) => void;
  setTurnTimeRemaining: (seconds: number) => void;
  decrementTurnTimer: () => void;
  setTurnPhase: (turnPhase?: TurnPhase) => void;
  setTreasuryPool: (amount: number) => void;
  setRoundInfo: (round: number, maxRounds?: number) => void;
  setRoundNumber: (round: number) => void;
  setActiveModifiers: (modifiers: ReadonlyArray<ClientMarketModifier>) => void;
  toggleHeatmap: () => void;
  setHeatmapActive: (active: boolean) => void;
  setSpotlightedCells: (cells: readonly number[] | null) => void;
  readonly isPlayerHudVisible: boolean;
  togglePlayerHudVisibility: () => void;

  // UI-04 Business Modals Actions
  openModal: <T extends keyof ModalPayloadMap>(type: T, payload: ModalPayloadMap[T]) => void;
  closeModal: () => void;
  updateModalPayload: <T extends keyof ModalPayloadMap>(patch: Partial<ModalPayloadMap[T]>) => void;
  setPendingBuyout: (pendingBuyout: PendingBuyoutSession | null) => void;
  setPendingTradeOffer: (offer: PendingTradeOfferDelta | null) => void;

  // UI-05 Social Emotes & Micro-VFX Actions
  triggerEmote: (playerId: string, emoteId: string) => void;
  clearEmote: (playerId: string) => void;
  addFloatingText: (item: Omit<FloatingTextItem, 'id' | 'timestamp'> & { id?: string }) => void;
  removeFloatingText: (id: string) => void;
  clearExpiredFloatingTexts: (now?: number) => void;
}

export type InitialGameState = Pick<
  GameState,
  | 'levelMap'
  | 'propertyStates'
  | 'playerPositions'
  | 'visualPositions'
  | 'dice'
  | 'isRolling'
  | 'hasRolledThisTurn'
  | 'lastDiceSeq'
  | 'activePawnAnimation'
  | 'pawnAnimationQueue'
  | 'pendingPawnMove'
  | 'lastLandedPawn'
  | 'playersInfo'
  | 'currentTurnPlayerId'
  | 'turnTimeRemaining'
  | 'turnPhase'
  | 'treasuryPool'
  | 'roundNumber'
  | 'maxRounds'
  | 'activeModifiers'
  | 'isHeatmapActive'
  | 'spotlightedCellIndices'
  | 'activeModal'
  | 'modalPayload'
  | 'lastEventCard'
  | 'pendingBuyout'
  | 'pendingTradeOffer'
  | 'auction'
  | 'dismissedAuctionCellIndex'
  | 'activeEmotes'
  | 'floatingTexts'
  | 'lastDiplomaticEvent'
  | 'cameraFocusCell'
  | 'hasUserCustomCamera'
  | 'isPlayerHudVisible'
>;

export const INITIAL_GAME_STATE: InitialGameState = {
  levelMap: {},
  propertyStates: {},
  playerPositions: {},
  visualPositions: {},
  dice: [1, 1],
  isRolling: false,
  hasRolledThisTurn: false,
  lastDiceSeq: undefined,
  activePawnAnimation: null,
  pawnAnimationQueue: [],
  pendingPawnMove: null,
  lastLandedPawn: null,
  playersInfo: {},
  currentTurnPlayerId: null,
  turnTimeRemaining: 60,
  turnPhase: TurnPhase.WaitingRoll,
  treasuryPool: 0,
  roundNumber: 1,
  maxRounds: 40,
  activeModifiers: [],
  isHeatmapActive: false,
  spotlightedCellIndices: null,
  isPlayerHudVisible: true,
  activeModal: null,
  modalPayload: null,
  lastEventCard: null,
  pendingBuyout: null,
  pendingTradeOffer: null,
  auction: null,
  dismissedAuctionCellIndex: null,
  activeEmotes: {},
  floatingTexts: [],
  lastDiplomaticEvent: null,
  cameraFocusCell: null,
  hasUserCustomCamera: false,
};
====
// [IMP-298] Game Store Type System Modular Facade
export * from './game_store_subtypes.js';
export * from './game_store_state_types.js';
>>>>
```
---
### Trạm 3: Thẩm Định Độc Lập Từ Đĩa Vật Lý (Independent Station 3 Reviews)
* **Trạm 3.1 (Spec & Scope Gatekeeper)**: Rà soát 100% độ trung thực của Plan, không phát sinh file ngoài phân hệ `client-state`, bảo đảm Zero Scope Creep.
* **Trạm 3.2 (Architecture & Anti-Slop Auditor)**: Rà soát kiểm tra Anti-Slop, an toàn bộ nhớ/timer, mật độ assertion density trong dải vàng 1-4 asserts/test, không vòng lặp trong it(), và kiểm tra tính duy nhất của tham chiếu bộ nhớ `INITIAL_GAME_STATE`.
---
### Trạm 4: Kiểm Thử Biến Dị & Cơ Chế Biên (Chaos & Mutation Sentinel)
Lệnh kích hoạt kiểm thử đột biến:
```bash
npm run sentinel -- --ticket IMP-298 --test tests/client/game_store_types_modular.test.ts --src src/client/store/game_store_state_types.ts
```
* **Mục tiêu**: Vượt qua tối thiểu 14 mutants bị tiêu diệt (kill rate: 100%, 0 survived).
* **Đối tượng đột biến**:
  - Đột biến giá trị xúc xắc khởi điểm trong `INITIAL_GAME_STATE.dice` (`[1, 1]` -> `[2, 2]`).
  - Đột biến cờ `isPlayerHudVisible` (`true` -> `false`).
  - Đột biến số vòng đấu mặc định `roundNumber` (`1` -> `2`).
  - Đột biến thời gian lượt đếm ngược `turnTimeRemaining` (`60` -> `0`).
---
### Trạm 5: Kiểm Toán Bằng Chứng Vật Lý Toàn Diện (Evidence Audit & Reporting)
* **Lệnh xác thực vật lý**: `node scripts/check_evidence.mjs IMP-298`
* **Lệnh xuất bản báo cáo**: `npm run report -- IMP-298`
