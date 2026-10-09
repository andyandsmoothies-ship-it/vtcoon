# KẾ HOẠCH TRIỂN KHAI MICRO-SLICE: BÓC TÁCH TURN BOT TIMER SCHEDULER (IMP-301)
> **Phân hệ mục tiêu:** `server-network`
> **Phạm vi kỹ thuật:** Giải phóng nợ dòng mã (LOC Debt) của `src/server/network/turn_orchestrator.ts` (hiện chạm mức báo động: 390/400 LOC, Tier 1, chỉ còn đúng 10 dòng mã trước trần cứng) bằng cách bóc tách logic tính toán độ trễ nhịp thở của Bot AI (`calculateBotStepDelay`), các hằng số trễ quan sát, cờ quan sát nâng cấp công trình (`botJustUpgraded`) và logic điều phối bước đi của Bot (`scheduleBotStep`) sang mô-đun chuyên trách `TurnBotTimerScheduler` tại `src/server/network/turn_bot_timer_scheduler.ts` (~125 LOC). `turn_orchestrator.ts` tinh gọn từ 390 LOC xuống 327 LOC.
> **Cam kết cốt lõi:**
> 1. **Pure Move 100% (Zero Semantic Mutation & Quarantine):** Bảo toàn 100% các công thức tính toán độ trễ nhịp bước của Bot: độ trễ xúc xắc động `1100 + steps * 200 + 800`, độ trễ Vòng Xoay Bến Xe `1200 + boost * 350 + BOT_TRANSIT_OBSERVATION_DELAY_MS`, độ trễ thẻ Cơ hội / Thị trường `2500ms`, và nhịp thở nâng cấp công trình `BOT_UPGRADE_OBSERVATION_DELAY_MS = 1500ms`.
> 2. **Bảo Toàn Tương Thích Ngược Tuyệt Đối (Zero Interface Mutation):** Re-export 100% các hàm và hằng số `calculateBotStepDelay`, `AUCTION_BOT_STEP_DELAY_MS`, `BOT_UPGRADE_OBSERVATION_DELAY_MS`, `BOT_TRANSIT_OBSERVATION_DELAY_MS` từ `turn_orchestrator.ts` chuẩn ESM `.js`. Bảo toàn getter `orchestrator.botJustUpgraded` trỏ cùng tham chiếu Map để không làm gãy contract suite `imp219`.
> 3. **Giải Phóng Triệt Để Rủi Ro Trần Tier 1:** `turn_orchestrator.ts` giảm mạnh từ 390 xuống 327 LOC (nằm an toàn dưới trần 400 LOC), `turn_bot_timer_scheduler.ts` chỉ ~125 LOC (Tier 1 ✔️ Safe).
> 4. **Scaffolding Protocol & Semantic Behavioral RED:** Khởi tạo stub type-safe cho `turn_bot_timer_scheduler.ts` trước khi chạy test, bảo đảm test suite compile hoàn hảo và thất bại do runtime assertions thay vì loader error.
> 5. **Chống Bội Nhiễm Phạm Vi (Scope Bleed Prevention):** Tách bạch phạm vi trực tiếp của vé IMP-301 với dòng phụ thuộc working tree của các vé tiền nhiệm.
> **Baseline Working Tree Dependencies (Predecessor IMP-294..300):** `src/client/3d/adaptive_cinematic_camera.tsx`, `src/client/3d/camera_state_machine.ts`, `src/client/3d/cinematic_chase_camera.ts`, `src/client/audio/sound_engine.ts`, `src/client/audio/sound_synth_recipes.ts`, `src/client/store/game_store_types.ts`, `src/client/ui/actionable_notification.ts`, `src/server/logging/persistent_room_logger.ts`, `src/client/3d/camera_kinematic_helpers.ts`, `src/client/3d/camera_location_beacon.tsx`, `src/client/3d/camera_soft_return.ts`, `src/client/3d/cinematic_spline_flyby.ts`, `src/client/3d/use_camera_gestures.ts`, `src/client/audio/sound_engine_context.ts`, `src/client/audio/synth_recipes_ambient.ts`, `src/client/audio/synth_recipes_gameplay.ts`, `src/client/audio/synth_recipes_ui.ts`, `src/client/store/game_store_state_types.ts`, `src/client/store/game_store_subtypes.ts`, `src/client/ui/actionable_notification_gameplay.ts`, `src/client/ui/actionable_notification_map.ts`, `src/client/ui/actionable_notification_system.ts`, `src/server/logging/room_logger_cloud_sync.ts`, `tests/client/actionable_notification_modular.test.ts`, `tests/client/camera_gestures.test.ts`, `tests/client/camera_soft_return_and_beacon.test.ts`, `tests/client/cinematic_spline_flyby.test.ts`, `tests/client/dramatic_pacing_camera.test.ts`, `tests/client/game_store_types_modular.test.ts`, `tests/client/sound_engine_modular.test.ts`, `tests/client/sound_synth_recipes_modular.test.ts`, `tests/client/spatial_kinematics_camera.test.ts`, `tests/server/room_logger_cloud_sync.test.ts`
---
### Bảng 1: Phân bổ Ranh giới Phân hệ (Subsystem Boundary Alignment)
| Tệp Mã Nguồn | Phân Hệ | Vai Trò Kiến Trúc |
| :--- | :--- | :--- |
| `src/server/network/turn_bot_timer_scheduler.ts` | `server-network` | **MỚI**: Tính toán độ trễ nhịp bước của Bot, quản lý cờ quan sát nâng cấp và lập lịch thực thi bước bot an toàn qua Mutex |
| `src/server/network/turn_orchestrator.ts` | `server-network` | **SỬA**: Tinh gọn thành Bộ điều phối trung tâm lượt chơi & timeout người thật, ủy quyền lập lịch bước bot sang TurnBotTimerScheduler |
| `tests/server/turn_bot_timer_scheduler.test.ts` | Living Test | **MỚI**: Living Contract Test kiểm tra độc lập các công thức delay bot, cơ chế quan sát nâng cấp và tích hợp TurnOrchestrator |
---
### Bảng 2: Ngân Sách Dòng Mã (LOC Accounting)
| Target physical file | Tier Classification | Baseline LOC | Expected LOC | Net Change | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/server/network/turn_bot_timer_scheduler.ts` | Tier 1 (Domain/Server/Logic) | 0 | 125 | +125 | <= 400 | ✔️ Safe |
| `src/server/network/turn_orchestrator.ts` | Tier 1 (Domain/Server/Logic) | 390 | 330 | -60 | <= 400 | ⚠️ Warning |
| `tests/server/turn_bot_timer_scheduler.test.ts` | Living Test | 0 | 220 | +220 | <= 600 | ✔️ Safe |
---
### Trạm 1: Hợp Đồng Kiểm Thử Độc Lập (RED Contract Tests)
**Target physical file**: `tests/server/turn_bot_timer_scheduler.test.ts` (Tệp mới)
> **Kỷ luật Seam Discipline (Iron Law):** Không monkey-patch framework internals. Kiểm thử trực tiếp qua mock Room / RoomManager và quan sát trạng thái timer.
> **Quy chuẩn Scaffolding Stub Type-Safe:** Tệp mới được scaffold trước với kiểu dữ liệu tường minh, tuyệt đối CẤM `as any` và `as unknown as T`.
> **Kỷ luật Zero Loops in it():** Cấm tuyệt đối vòng lặp trong `it()`. Mật độ duy trì nghiêm ngặt trong dải vàng 1-4 asserts/test.

1. **TC-TB-SCHED.01 [UC-TB-SCHED/MSS]**: Given phòng chơi chưa xác định (undefined), When gọi `calculateBotStepDelay(undefined, 1500)`, Then hàm trả về baseDelayMs mặc định (1500ms).
2. **TC-TB-SCHED.02 [UC-TB-SCHED/MSS]**: Given phòng chơi ở chế độ test nhanh với baseDelayMs <= 500, When gọi `calculateBotStepDelay(room, 500)`, Then hàm trả về 500ms ngay cả khi phòng có lastTransitResult.
3. **TC-TB-SCHED.03 [UC-TB-SCHED/MSS]**: Given phòng chơi ở TurnPhase.PropertyManagement và có kết quả vòng xoay lastTransitResult với boostSteps = 2, When gọi `calculateBotStepDelay(room, 1500)`, Then hàm trả về 3900ms.
4. **TC-TB-SCHED.04 [UC-TB-SCHED/MSS]**: Given phòng chơi ở TurnPhase.ActionPhase và có lastDice = [3, 4] không có transit, When gọi `calculateBotStepDelay(room, 1500)`, Then hàm trả về 3300ms.
5. **TC-TB-SCHED.05 [UC-TB-SCHED/MSS]**: Given phòng chơi có lastEventCard và baseDelayMs > 500 ở pha khác, When gọi `calculateBotStepDelay(room, 1500)`, Then hàm trả về 2500ms.
6. **TC-TB-SCHED.06 [UC-TB-SCHED/MSS]**: Given phòng chơi ở WaitingRoll không có thẻ sự kiện, When gọi `calculateBotStepDelay(room, 1500)`, Then hàm trả về baseDelayMs (1500ms).
7. **TC-TB-SCHED.07 [UC-TB-SCHED/MSS]**: Given các hằng số nhịp độ bot được xuất khẩu, When kiểm tra giá trị hằng số, Then AUCTION_BOT_STEP_DELAY_MS bằng 1000, BOT_UPGRADE_OBSERVATION_DELAY_MS bằng 1500, và BOT_TRANSIT_OBSERVATION_DELAY_MS bằng 2000.
8. **TC-TB-SCHED.08 [UC-TB-SCHED/MSS]**: Given TurnBotTimerScheduler vừa khởi tạo, When gọi clearUpgradeFlag trên roomCode, Then cờ botJustUpgraded của phòng chơi bị xóa sạch và không còn tồn tại.
9. **TC-TB-SCHED.09 [UC-TB-SCHED/MSS]**: Given TurnBotTimerScheduler được kích hoạt scheduleBotStep cho Bot, When bộ lập lịch chạy, Then onScheduleBotTurn được kích hoạt và timer được đăng ký vào delegate.
10. **TC-TB-SCHED.10 [UC-TB-SCHED/MSS]**: Given phòng chơi có cờ botJustUpgraded là true, When gọi scheduleBotStep, Then độ trễ được cấp là BOT_UPGRADE_OBSERVATION_DELAY_MS (1500ms) và cờ nâng cấp được tự động tiêu thụ.
11. **TC-TB-SCHED.11 [UC-TB-SCHED/MSS]**: Given phòng chơi đã kết thúc (isRoomGameOver trả về true) khi timer hết hạn, When bước bot thực thi, Then onGameOver được kích hoạt và cờ nâng cấp được xóa sạch.
12. **TC-TB-SCHED.12 [UC-TB-SCHED/MSS]**: Given phòng chơi ở TurnPhase.AuctionPhase có bot đủ điều kiện, When timer hết hạn và stepAuctionBot trả về finished false, Then orchestrator và broadcastRoomDelta được gọi lại để tiếp tục đấu giá.
13. **TC-TB-SCHED.13 [UC-TB-SCHED/MSS]**: Given phòng chơi ở TurnPhase.AuctionPhase khi bot cuối cùng bước và stepAuctionBot trả về finished true, When timer hết hạn, Then scheduleAuctionSettle và setDeadline được gọi với delay đóng sàn.
14. **TC-TB-SCHED.14 [UC-TB-SCHED/MSS]**: Given bot thực hiện bước đi trong lượt bình thường và nâng cấp tài sản thành công (nextLevelSum > prevLevelSum), When bước bot hoàn tất, Then cờ botJustUpgraded được ghi nhận bằng true cho bước kế tiếp.
15. **TC-TB-SCHED.15 [UC-TB-SCHED/MSS]**: Given TurnOrchestrator khởi tạo, When truy cập getter botJustUpgraded, Then thuộc tính trả về đúng tham chiếu Map botJustUpgraded từ TurnBotTimerScheduler và bảo toàn qua clearRoom.
16. **TC-TB-SCHED.16 [UC-TB-SCHED/MSS]**: Given TurnOrchestrator gọi destroyRoom, When phòng chơi bị tiêu hủy, Then cờ botJustUpgraded trong scheduler được dọn dẹp triệt để chống rò rỉ bộ nhớ.
---
### Trạm 2: Kế Hoạch Triển Khai Chi Tiết (Implementation Tasks)

#### Task 1: Khởi Tạo Tệp Bộ Lập Lịch Bước Bot `src/server/network/turn_bot_timer_scheduler.ts`
**Target physical file**: `src/server/network/turn_bot_timer_scheduler.ts` (Tệp mới)

```typescript
// [IMP-301] Turn Bot Timer Scheduler & Observation Pacing Engine
import type { RoomManager } from '../room_manager.js';
import type { IntentMutex } from './intent_mutex.js';
import type { DeltaBroadcaster } from './delta_broadcaster.js';
import { TurnPhase, isRoomGameOver, type Room } from '../../domain/room.js';
import { PHASE_TIMEOUTS_MS, AUCTION_SETTLE_DELAY_MS } from './turn_orchestrator.js';

export const AUCTION_BOT_STEP_DELAY_MS = 1000;
export const BOT_UPGRADE_OBSERVATION_DELAY_MS = 1500;
export const BOT_TRANSIT_OBSERVATION_DELAY_MS = 2000;

export function calculateBotStepDelay(
  room: Room | undefined,
  baseDelayMs: number = 1500
): number {
  if (!room || baseDelayMs <= 500) return baseDelayMs;
  if (
    (room.phase === TurnPhase.PropertyManagement || room.phase === TurnPhase.ActionPhase) &&
    room.lastTransitResult &&
    baseDelayMs > 500
  ) {
    const boost = room.lastTransitResult.boostSteps ?? 0;
    const dynamicTransitDelay = 1200 + boost * 350 + BOT_TRANSIT_OBSERVATION_DELAY_MS;
    return Math.max(baseDelayMs, dynamicTransitDelay);
  }
  if (
    (room.phase === TurnPhase.PropertyManagement || room.phase === TurnPhase.ActionPhase) &&
    room.lastDice &&
    (room.lastDice[0] > 0 || room.lastDice[1] > 0)
  ) {
    const steps = (room.lastDice[0] ?? 0) + (room.lastDice[1] ?? 0);
    const dynamicDelay = 1100 + steps * 200 + 800;
    return Math.max(baseDelayMs, dynamicDelay);
  }
  if (room.lastEventCard && baseDelayMs > 500) {
    return Math.max(baseDelayMs, 2500);
  }
  return baseDelayMs;
}

export interface TurnBotSchedulerDelegate {
  readonly rooms: RoomManager;
  readonly intentMutex: IntentMutex;
  readonly broadcaster: DeltaBroadcaster;
  readonly botTurnDelayMs: number;
  readonly onGameOver: (roomCode: string) => void;
  readonly onScheduleBotTurn?: (roomCode: string) => void;
  hasEligibleAuctionBot(room: Room): boolean;
  scheduleAuctionSettle(roomCode: string, auctionKey?: string): void;
  clearAuctionSettleTimer(roomCode: string): void;
  orchestrate(roomCode: string, customTimeoutMs?: number): void;
  registerActiveTimer(roomCode: string, timer: NodeJS.Timeout, deadline: number): void;
  clearActiveTimer(roomCode: string): void;
  setDeadline(roomCode: string, deadline: number): void;
}

export class TurnBotTimerScheduler {
  public readonly botJustUpgraded = new Map<string, boolean>();

  constructor(private readonly delegate: TurnBotSchedulerDelegate) {}

  clearUpgradeFlag(roomCode: string): void {
    if (!this.botJustUpgraded.has(roomCode)) return;
    this.botJustUpgraded.delete(roomCode);
  }

  scheduleBotStep(roomCode: string): void {
    this.delegate.onScheduleBotTurn?.(roomCode);
    const room = this.delegate.rooms.getRoom(roomCode);
    const phaseTimeoutMs = (room?.phase ? PHASE_TIMEOUTS_MS[room.phase] : undefined) ?? 25_000;
    const deadline = Date.now() + phaseTimeoutMs;
    const hasUpgradeDelay = this.botJustUpgraded.get(roomCode) === true;
    if (hasUpgradeDelay) {
      this.botJustUpgraded.delete(roomCode);
      const isConsumed = true;
      if (!isConsumed) return;
    }
    const delayMs = hasUpgradeDelay
      ? BOT_UPGRADE_OBSERVATION_DELAY_MS
      : calculateBotStepDelay(room, this.delegate.botTurnDelayMs);
    const timer = setTimeout(() => {
      this.delegate.clearActiveTimer(roomCode);
      void this.delegate.intentMutex.runExclusive(roomCode, async () => {
        const r = this.delegate.rooms.getRoom(roomCode);
        if (!r?.started) return;
        if (isRoomGameOver(r)) {
          this.botJustUpgraded.delete(roomCode);
          this.delegate.onGameOver(roomCode);
          return;
        }

        const curr = r.players[r.currentPlayerIndex];
        const hasBots =
          r.phase === TurnPhase.AuctionPhase ? this.delegate.hasEligibleAuctionBot(r) : Boolean(curr?.isBot && !curr.bankrupt);
        if (!hasBots) return;

        if (r.phase === TurnPhase.AuctionPhase) {
          const stepRes = this.delegate.rooms.stepAuctionBot(roomCode);
          if (stepRes.finished) {
            this.delegate.scheduleAuctionSettle(roomCode);
            this.delegate.setDeadline(roomCode, Date.now() + AUCTION_SETTLE_DELAY_MS + 500);
          } else {
            this.delegate.orchestrate(roomCode);
          }
          this.delegate.broadcaster.broadcastRoomDelta(roomCode);
        } else {
          const prevLevelSum = Array.from(this.delegate.rooms.getPropertyStates?.(roomCode)?.values() ?? []).reduce((acc, st) => acc + (st.level ?? 0), 0);
          this.roomsStepTurn(roomCode, prevLevelSum);
        }
      });
    }, delayMs);

    this.delegate.registerActiveTimer(roomCode, timer, deadline);
  }

  private roomsStepTurn(roomCode: string, prevLevelSum: number): void {
    this.delegate.rooms.stepBotTurn(roomCode);
    const nextLevelSum = Array.from(this.delegate.rooms.getPropertyStates?.(roomCode)?.values() ?? []).reduce((acc, st) => acc + (st.level ?? 0), 0);
    if (nextLevelSum > prevLevelSum) {
      const upgradeDetected = true;
      this.botJustUpgraded.set(roomCode, upgradeDetected);
    }
    const rAfter = this.delegate.rooms.getRoom(roomCode);
    if (rAfter && isRoomGameOver(rAfter)) {
      this.delegate.clearAuctionSettleTimer(roomCode);
      this.botJustUpgraded.delete(roomCode);
      this.delegate.onGameOver(roomCode);
    } else {
      this.delegate.orchestrate(roomCode);
      this.delegate.broadcaster.broadcastRoomDelta(roomCode);
    }
  }
}
```

#### Task 2: Tinh Gọn `src/server/network/turn_orchestrator.ts`
**Target physical file**: `src/server/network/turn_orchestrator.ts`

##### Snippet 1: Re-export Pacing Constants & Engine Function
```typescript
<<<<
export const AUCTION_BOT_STEP_DELAY_MS = 1000;
export const BOT_UPGRADE_OBSERVATION_DELAY_MS = 1500;
export const BOT_TRANSIT_OBSERVATION_DELAY_MS = 2000;

export function calculateBotStepDelay(
  room: Room | undefined,
  baseDelayMs: number = 1500
): number {
  if (!room || baseDelayMs <= 500) return baseDelayMs;
  // [GRILL-02][ADV-04] Rào pha PropertyManagement & ActionPhase, ưu tiên tính delay quan sát Vòng Xoay
  if (
    (room.phase === TurnPhase.PropertyManagement || room.phase === TurnPhase.ActionPhase) &&
    room.lastTransitResult &&
    baseDelayMs > 500
  ) {
    const boost = room.lastTransitResult.boostSteps ?? 0;
    const dynamicTransitDelay = 1200 + boost * 350 + BOT_TRANSIT_OBSERVATION_DELAY_MS;
    return Math.max(baseDelayMs, dynamicTransitDelay);
  }
  if (
    (room.phase === TurnPhase.PropertyManagement || room.phase === TurnPhase.ActionPhase) &&
    room.lastDice &&
    (room.lastDice[0] > 0 || room.lastDice[1] > 0)
  ) {
    const steps = (room.lastDice[0] ?? 0) + (room.lastDice[1] ?? 0);
    const dynamicDelay = 1100 + steps * 200 + 800;
    return Math.max(baseDelayMs, dynamicDelay);
  }
  if (room.lastEventCard && baseDelayMs > 500) {
    return Math.max(baseDelayMs, 2500);
  }
  return baseDelayMs;
}
====
export {
  calculateBotStepDelay,
  AUCTION_BOT_STEP_DELAY_MS,
  BOT_UPGRADE_OBSERVATION_DELAY_MS,
  BOT_TRANSIT_OBSERVATION_DELAY_MS,
  TurnBotTimerScheduler,
  type TurnBotSchedulerDelegate,
} from './turn_bot_timer_scheduler.js';
import {
  AUCTION_BOT_STEP_DELAY_MS,
  TurnBotTimerScheduler,
} from './turn_bot_timer_scheduler.js';
>>>>
```

##### Snippet 2: Cài Đặt TurnBotTimerScheduler Trong TurnOrchestrator
```typescript
<<<<
  private readonly activeTimers = new Map<string, NodeJS.Timeout>();
  private readonly deadlines = new Map<string, number>();
  private readonly auctionSettleTimers = new Map<string, { timer: NodeJS.Timeout; auctionKey: string }>();
  private readonly botJustUpgraded = new Map<string, boolean>();

  constructor(options: TurnOrchestratorOptions) {
    this.rooms = options.rooms;
    this.intentMutex = options.intentMutex;
    this.broadcaster = options.broadcaster;
    this.onGameOver = options.onGameOver;
    this.onScheduleTurnTimeout = options.onScheduleTurnTimeout;
    this.onScheduleBotTurn = options.onScheduleBotTurn;
    this.botTurnDelayMs = options.botTurnDelayMs ?? 1500;
    this.customDefaultTimeoutMs = options.defaultTimeoutMs;
    this.defaultTimeoutMs = options.defaultTimeoutMs ?? 60_000;
  }
====
  private readonly activeTimers = new Map<string, NodeJS.Timeout>();
  private readonly deadlines = new Map<string, number>();
  private readonly auctionSettleTimers = new Map<string, { timer: NodeJS.Timeout; auctionKey: string }>();
  private readonly botScheduler: TurnBotTimerScheduler;

  constructor(options: TurnOrchestratorOptions) {
    this.rooms = options.rooms;
    this.intentMutex = options.intentMutex;
    this.broadcaster = options.broadcaster;
    this.onGameOver = options.onGameOver;
    this.onScheduleTurnTimeout = options.onScheduleTurnTimeout;
    this.onScheduleBotTurn = options.onScheduleBotTurn;
    this.botTurnDelayMs = options.botTurnDelayMs ?? 1500;
    this.customDefaultTimeoutMs = options.defaultTimeoutMs;
    this.defaultTimeoutMs = options.defaultTimeoutMs ?? 60_000;
    this.botScheduler = new TurnBotTimerScheduler(this);
  }

  public get botJustUpgraded(): Map<string, boolean> {
    return this.botScheduler.botJustUpgraded;
  }

  registerActiveTimer(roomCode: string, timer: NodeJS.Timeout, deadline: number): void {
    this.deadlines.set(roomCode, deadline);
    this.activeTimers.set(roomCode, timer);
    this.rooms.registerTimer(roomCode, timer);
  }

  clearActiveTimer(roomCode: string): void {
    this.deadlines.delete(roomCode);
    this.activeTimers.delete(roomCode);
  }

  setDeadline(roomCode: string, deadline: number): void {
    if (deadline <= 0) return;
    this.deadlines.set(roomCode, deadline);
  }
>>>>
```

##### Snippet 3: Dọn Dẹp Cờ Nâng Cấp Trong destroyRoom
```typescript
<<<<
  destroyRoom(roomCode: string): void {
    this.clearRoom(roomCode);
    this.clearAuctionSettleTimer(roomCode);
    this.activeTimers.delete(roomCode);
    this.deadlines.delete(roomCode);
    this.auctionSettleTimers.delete(roomCode);
    this.botJustUpgraded.delete(roomCode);
  }
====
  destroyRoom(roomCode: string): void {
    this.clearRoom(roomCode);
    this.clearAuctionSettleTimer(roomCode);
    this.activeTimers.delete(roomCode);
    this.deadlines.delete(roomCode);
    this.auctionSettleTimers.delete(roomCode);
    this.botScheduler.clearUpgradeFlag(roomCode);
  }
>>>>
```

##### Snippet 4: Ủy Quyền Lập Lịch Bước Bot Trong orchestrate
```typescript
<<<<
    if (room.phase === TurnPhase.AuctionPhase) {
      if (this.hasEligibleAuctionBot(room)) {
        this.scheduleBotStep(roomCode);
      } else {
        this.onScheduleTurnTimeout?.(roomCode);
        const timeoutMs = customTimeoutMs && customTimeoutMs > 5000 ? customTimeoutMs : undefined;
        this.scheduleAuctionTimeoutStep(roomCode, timeoutMs);
      }
      return;
    }

    if (room.phase === TurnPhase.InsolvencyPhase) {
      const debtor = room.pendingInsolvencyDebtorId
        ? room.players.find((p) => p.id === room.pendingInsolvencyDebtorId)
        : room.players[room.currentPlayerIndex];
      if (debtor && !debtor.isBot && !debtor.bankrupt) {
        this.botJustUpgraded.delete(roomCode);
        this.onScheduleTurnTimeout?.(roomCode);
        this.scheduleHumanTimeoutStep(roomCode, customTimeoutMs);
        return;
      }
    }

    const current = room.players[room.currentPlayerIndex];
    if (!current || current.bankrupt) return;

    if (current.isBot) {
      this.scheduleBotStep(roomCode);
    } else {
      this.botJustUpgraded.delete(roomCode);
      this.onScheduleTurnTimeout?.(roomCode);
      this.scheduleHumanTimeoutStep(roomCode, customTimeoutMs);
    }
====
    if (room.phase === TurnPhase.AuctionPhase) {
      if (this.hasEligibleAuctionBot(room)) {
        this.botScheduler.scheduleBotStep(roomCode);
      } else {
        this.onScheduleTurnTimeout?.(roomCode);
        const timeoutMs = customTimeoutMs && customTimeoutMs > 5000 ? customTimeoutMs : undefined;
        this.scheduleAuctionTimeoutStep(roomCode, timeoutMs);
      }
      return;
    }

    if (room.phase === TurnPhase.InsolvencyPhase) {
      const debtor = room.pendingInsolvencyDebtorId
        ? room.players.find((p) => p.id === room.pendingInsolvencyDebtorId)
        : room.players[room.currentPlayerIndex];
      if (debtor && !debtor.isBot && !debtor.bankrupt) {
        this.botScheduler.clearUpgradeFlag(roomCode);
        this.onScheduleTurnTimeout?.(roomCode);
        this.scheduleHumanTimeoutStep(roomCode, customTimeoutMs);
        return;
      }
    }

    const current = room.players[room.currentPlayerIndex];
    if (!current || current.bankrupt) return;

    if (current.isBot) {
      this.botScheduler.scheduleBotStep(roomCode);
      return;
    }
    this.botScheduler.clearUpgradeFlag(roomCode);
    this.onScheduleTurnTimeout?.(roomCode);
    this.scheduleHumanTimeoutStep(roomCode, customTimeoutMs);
>>>>
```

##### Snippet 5: Loại Bỏ Hàm scheduleBotStep Đã Được Chuyển Sang Mô-đun Riêng
```typescript
<<<<
  private scheduleBotStep(roomCode: string): void {
    this.onScheduleBotTurn?.(roomCode);
    const room = this.rooms.getRoom(roomCode);
    const phaseTimeoutMs = (room?.phase ? PHASE_TIMEOUTS_MS[room.phase] : undefined) ?? 25_000;
    this.deadlines.set(roomCode, Date.now() + phaseTimeoutMs);
    const hasUpgradeDelay = this.botJustUpgraded.get(roomCode) === true;
    if (hasUpgradeDelay) {
      this.botJustUpgraded.delete(roomCode);
    }
    const delayMs = hasUpgradeDelay
      ? BOT_UPGRADE_OBSERVATION_DELAY_MS
      : calculateBotStepDelay(room, this.botTurnDelayMs);
    const timer = setTimeout(() => {
      this.activeTimers.delete(roomCode);
      this.deadlines.delete(roomCode);
      void this.intentMutex.runExclusive(roomCode, async () => {
        const r = this.rooms.getRoom(roomCode);
        if (!r?.started) return;
        if (isRoomGameOver(r)) {
          this.botJustUpgraded.delete(roomCode);
          this.onGameOver(roomCode);
          return;
        }

        const curr = r.players[r.currentPlayerIndex];
        const hasBots =
          r.phase === TurnPhase.AuctionPhase ? this.hasEligibleAuctionBot(r) : Boolean(curr?.isBot && !curr.bankrupt);
        if (!hasBots) return;

        if (r.phase === TurnPhase.AuctionPhase) {
          const stepRes = this.rooms.stepAuctionBot(roomCode);
          if (stepRes.finished) {
            this.scheduleAuctionSettle(roomCode);
            this.deadlines.set(roomCode, Date.now() + AUCTION_SETTLE_DELAY_MS + 500);
          } else {
            this.orchestrate(roomCode);
          }
          this.broadcaster.broadcastRoomDelta(roomCode);
        } else {
          const prevLevelSum = Array.from(this.rooms.getPropertyStates?.(roomCode)?.values() ?? []).reduce((acc, st) => acc + (st.level ?? 0), 0);
          this.rooms.stepBotTurn(roomCode);
          const nextLevelSum = Array.from(this.rooms.getPropertyStates?.(roomCode)?.values() ?? []).reduce((acc, st) => acc + (st.level ?? 0), 0);
          if (nextLevelSum > prevLevelSum) {
            this.botJustUpgraded.set(roomCode, true);
          }
          const rAfter = this.rooms.getRoom(roomCode);
          if (rAfter && isRoomGameOver(rAfter)) {
            this.clearAuctionSettleTimer(roomCode);
            this.botJustUpgraded.delete(roomCode);
            this.onGameOver(roomCode);
          } else {
            this.orchestrate(roomCode);
            this.broadcaster.broadcastRoomDelta(roomCode);
          }
        }
      });
    }, delayMs);

    this.activeTimers.set(roomCode, timer);
    this.rooms.registerTimer(roomCode, timer);
  }
====
  // Bot step scheduling delegated to TurnBotTimerScheduler
>>>>
```
---
### Trạm 3: Thẩm Định Độc Lập Từ Đĩa Vật Lý (Independent Station 3 Reviews)
* **Trạm 3.1 (Spec & Scope Gatekeeper)**: Rà soát 100% độ trung thực của Plan, không phát sinh file ngoài phân hệ `server-network`, bảo đảm Zero Scope Creep.
* **Trạm 3.2 (Architecture & Anti-Slop Auditor)**: Rà soát Anti-Slop, an toàn bộ nhớ/timer, assertion density trong dải vàng 1-4 asserts/test, không vòng lặp trong `it()`.
* **Phê chuẩn Pure Logic Waiver**: `pureLogicWaiver: true` (Gói thay đổi thuần túy thuộc backend/server logic, không phát sinh giao diện DOM/client).
---
### Trạm 4: Kiểm Thử Biến Dị & Cơ Chế Biên (Chaos & Mutation Sentinel)
Lệnh kích hoạt kiểm thử đột biến:
```bash
npm run sentinel -- --ticket IMP-301 --test tests/server/turn_bot_timer_scheduler.test.ts --src src/server/network/turn_bot_timer_scheduler.ts
```
Mục tiêu: Vượt qua tối thiểu 14 mutants bị tiêu diệt (kill rate: 100%, 0 survived).
---
### Trạm 5: Nghiệm Thu Bằng Chứng Vật Lý Toàn Diện (Evidence Audit & Signoff)
Lệnh kiểm toán vật lý:
```bash
node scripts/check_evidence.mjs IMP-301
```
Bảo đảm tạo báo cáo nghiệm thu tiếng Việt tại `docs/reports/improvements/IMP-301-turn-bot-timer-scheduler_report.md`.
