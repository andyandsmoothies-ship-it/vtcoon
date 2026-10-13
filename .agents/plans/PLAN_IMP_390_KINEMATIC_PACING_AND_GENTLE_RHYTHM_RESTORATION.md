# Plan IMP-390: Kinematic Pacing Restoration & Gentle Turn Rhythm Tuning (Ticket IMP-390)

## 0. Auto-Slicing Roadmap & Context
- **Ticket Objective**: Khôi phục nhịp điệu chơi game êm ái, thư thái và loại bỏ hiện tượng dồn dập giữa các pha trong phân hệ `server-network`:
  1. *Pawn Landing Settle & Observation Restoration*: Bù trừ chính xác 1200ms khoảng dừng hiển thị ở Client (600ms `DICE_SETTLE_DWELL_MS` + 600ms `PAWN_LANDING_SETTLE_MS`) vào bộ định thời của Bot tại Server ([`turn_bot_timer_scheduler.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/turn_bot_timer_scheduler.ts)), bảo đảm người chơi có trọn vẹn 800ms quan sát sau khi quân cờ tiếp đất hoàn toàn trước khi Bot ra quyết định mua/thuê đất.
  2. *Turn Transition Breathing Room*: Tăng khoảng nghỉ đầu lượt (`WaitingRoll`) của Bot từ 1500ms lên 2200ms (`BOT_START_TURN_BREATHING_ROOM_MS`), mang lại khoảng thở êm ái trước khi xúc xắc quay tiếp (Căn cứ vật lý: 1200ms Camera Soft Return tại [`camera_soft_return.ts#L26`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/camera_soft_return.ts#L26) + 1000ms Idle Overview Settling = 2200ms).
  3. *Transit Wheel & Multi-Phase Guards*: Bảo vệ vòng xoay vận tải (`!room.lastTransitResult`) không bị cộng dồn đơ 1.2s; triệt tiêu hiện tượng đóng băng kép (double-dwell freeze) khi chuyển từ `ActionPhase` sang `PropertyManagement` qua cơ chế theo dõi lượt di chuyển `botKinematicsServedSeq`.
  4. *Zero Regression on Pure Contracts*: Giữ nguyên hàm `calculateBotStepDelay` cho các hợp đồng kiểm thử kế thừa; bao bọc logic mở rộng qua hàm thuần túy `resolveBotStepDelay` được re-export qua [`turn_orchestrator.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/turn_orchestrator.ts).
  5. *Fast Test Immunity*: Chế độ kiểm thử nhanh (`baseDelayMs <= 500`) được miễn trừ tuyệt đối, không bị kéo dãn thời gian chạy test CI.
- **Tech Debt Registry**: `src/server/network/turn_orchestrator.ts` đang ở mức 333 LOC (Warning >= 300 LOC Tier 1). Giữ nguyên phạm vi re-export tối thiểu (+3 dòng), không thêm logic điều phối mới.

## 1. Physical Target Files & Honest LOC Accounting
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| `src/server/network/turn_bot_timer_scheduler.ts` | Tier 1 (Domain/Server/Logic) | 133 | 189 | +56 | <= 400 | Safe (< 400 LOC) |
| `src/server/network/turn_orchestrator.ts` | Tier 1 (Domain/Server/Logic) | 330 | 333 | +3 | <= 400 | Warning (>= 300 LOC, Tech Debt logged) |
| `tests/client/imp390_kinematic_pacing_restoration.test.ts` | Living Test | 0 | 135 | +135 | <= 600 | Contract Test Suite |
| `tests/contracts/bot_pacing_and_camera_lock_contract.test.ts` | Living Test | 441 | 443 | +2 | <= 600 | Migration TC-IMP55.21..23 |
| `tests/contracts/bot_pacing_and_dice_runway_contract.test.ts` | Living Test | 368 | 368 | 0 | <= 600 | Migration TC-IMP51.17, 20 |
| `tests/server/turn_bot_timer_scheduler.test.ts` | Living Test | 329 | 331 | +2 | <= 600 | Migration TC-TB-SCHED.14 |
| `docs/FEATURE_MAP.md` | SSOT Matrix | 93 | 94 | +1 | N/A | Cập nhật Section Gotchas & Pacing |

## 2. In-Action Visual Capture Registration
- Scenario: Non-UI (Server Network Bot Pacing). Visual capture waived per Gotcha 13; mechanical verification via check_evidence.mjs & vitest.

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
- **TC-390.01 [UC-PACING-CALCULATE-BOT-STEP-DELAY/MSS]:** Given a room in TurnPhase.PropertyManagement with dice [3, 4], When calling calculateBotStepDelay(room, 1500), Then returns exactly 3300ms preserving legacy base contract.
- **TC-390.02 [UC-PACING-RESOLVE-WAITING-ROLL/MSS]:** Given a room in TurnPhase.WaitingRoll and botTurnDelayMs = 1500 (> 500), When calling resolveBotStepDelay(room, 1500), Then returns exactly 2200ms providing turn transition breathing room.
- **TC-390.03 [UC-PACING-RESOLVE-DWELL-COMPENSATION/MSS]:** Given a room in TurnPhase.ActionPhase with dice [3, 4] and botTurnDelayMs = 1500, When calling resolveBotStepDelay(room, 1500), Then returns 4500ms (3300ms legacy delay + 1200ms client dwell compensation).
- **TC-390.04 [UC-PACING-TRANSIT-WHEEL-FALLTHROUGH-GUARD/MSS]:** Given a room in ActionPhase with lastTransitResult and dice [2, 3], When calling resolveBotStepDelay(room, 1500), Then returns dynamicTransitDelay without adding 1200ms dwell compensation.
- **TC-390.05 [UC-PACING-MULTI-PHASE-DOUBLE-DWELL-GUARD/MSS]:** Given a room in PropertyManagement where kinematics was already served in ActionPhase (kinematicsServed = true), When calling resolveBotStepDelay(room, 1500, false, true), Then returns baseDelayMs (1500ms) avoiding double kinematic wait.
- **TC-390.06 [UC-PACING-FAST-TEST-OVERRIDE/MSS]:** Given a room in TurnPhase.ActionPhase with baseDelayMs <= 500, When calling resolveBotStepDelay(room, 500), Then returns exactly 500ms without adding dwell padding.
- **TC-390.07 [UC-PACING-SCHEDULER-WIRING/MSS]:** Given TurnBotTimerScheduler instance, When scheduleBotStep is executed, Then the scheduled timer uses the resolved delay and records kinematicsServed for room.diceSeq.
- **TC-IMP55.21 [UC-PACING-MIGRATION-IMP55-21/MSS]:** Given a room in PropertyManagement with dice [3, 4], When advancing timer by 2000ms and then 2600ms, Then stepBotTurn is invoked after dwell compensation.
- **TC-IMP55.22 [UC-PACING-MIGRATION-IMP55-22/MSS]:** Given a room in PropertyManagement with dice [1, 1], When advancing timer by 1800ms and then 1800ms, Then stepBotTurn is invoked after dwell compensation.
- **TC-IMP55.23 [UC-PACING-MIGRATION-IMP55-23/MSS]:** Given a room in WaitingRoll with botTurnDelayMs = 1500, When advancing timer by 1000ms and then 1300ms, Then stepBotTurn is invoked after breathing room delay.
- **TC-IMP51.17 [UC-PACING-MIGRATION-IMP51-17/MSS]:** Given a room in WaitingRoll, When advancing timer by 2300ms, Then room phase transitions to ActionPhase or PropertyManagement.
- **TC-IMP51.20 [UC-PACING-MIGRATION-IMP51-20/MSS]:** Given bots with 3 personalities in WaitingRoll, When advancing timer by 2300ms, Then roll occurs without completing the whole turn in one step.
- **TC-TB-SCHED.14 [UC-PACING-MIGRATION-TB-SCHED-14/MSS]:** Given a room in WaitingRoll with bot upgrade, When advancing timer by 2500ms, Then botJustUpgraded is set to true.

### Station 2: Implementation (GREEN)

#### Task 1: Khai báo hằng số Pacing & Hàm thuần túy resolveBotStepDelay
**Target physical file**: `src/server/network/turn_bot_timer_scheduler.ts`
```typescript
<<<<
export const AUCTION_BOT_STEP_DELAY_MS = 1000;
export const BOT_UPGRADE_OBSERVATION_DELAY_MS = 1500;
export const BOT_TRANSIT_OBSERVATION_DELAY_MS = 2000;

export function calculateBotStepDelay(
====
export const AUCTION_BOT_STEP_DELAY_MS = 1000;
export const BOT_UPGRADE_OBSERVATION_DELAY_MS = 1500;
export const BOT_TRANSIT_OBSERVATION_DELAY_MS = 2000;
// 1200ms Camera Soft Return (camera_soft_return.ts#L26) + 1000ms Idle Overview Settling = 2200ms
export const BOT_START_TURN_BREATHING_ROOM_MS = 2200;
// 600ms DICE_SETTLE_DWELL_MS (dice_tray.tsx#L20) + 600ms PAWN_LANDING_SETTLE_MS (pawn_animator.tsx#L35) = 1200ms
export const BOT_KINEMATIC_DWELL_COMPENSATION_MS = 1200;

export function resolveBotStepDelay(
  room: Room | undefined,
  baseDelayMs: number,
  hasUpgradeDelay: boolean = false,
  kinematicsServed: boolean = false
): number {
  if (hasUpgradeDelay) return BOT_UPGRADE_OBSERVATION_DELAY_MS;
  if (!room || baseDelayMs <= 500) return calculateBotStepDelay(room, baseDelayMs);

  if (room.phase === TurnPhase.WaitingRoll) {
    return Math.max(calculateBotStepDelay(room, baseDelayMs), BOT_START_TURN_BREATHING_ROOM_MS);
  }

  if (kinematicsServed) {
    return baseDelayMs;
  }

  const legacyDelay = calculateBotStepDelay(room, baseDelayMs);
  if (
    (room.phase === TurnPhase.PropertyManagement || room.phase === TurnPhase.ActionPhase) &&
    !room.lastTransitResult &&
    room.lastDice &&
    (room.lastDice[0] > 0 || room.lastDice[1] > 0)
  ) {
    return legacyDelay + BOT_KINEMATIC_DWELL_COMPENSATION_MS;
  }

  return legacyDelay;
}

export function calculateBotStepDelay(
>>>>
```

#### Task 2: Điều chỉnh scheduleBotStep tích hợp resolveBotStepDelay & botKinematicsServedSeq
**Target physical file**: `src/server/network/turn_bot_timer_scheduler.ts`
```typescript
<<<<
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
====
export class TurnBotTimerScheduler {
  public readonly botJustUpgraded = new Map<string, boolean>();
  public readonly botKinematicsServedSeq = new Map<string, number>();

  constructor(private readonly delegate: TurnBotSchedulerDelegate) {}

  clearUpgradeFlag(roomCode: string): void {
    if (!this.botJustUpgraded.has(roomCode)) return;
    this.botJustUpgraded.delete(roomCode);
  }

  clearRoomState(roomCode: string): void {
    this.botJustUpgraded.delete(roomCode);
    this.botKinematicsServedSeq.delete(roomCode);
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

    if (room?.phase === TurnPhase.WaitingRoll) {
      this.botKinematicsServedSeq.delete(roomCode);
      const _resetRoll = true;
    }
    const currentDiceSeq = room?.diceSeq;
    const kinematicsServed =
      currentDiceSeq !== undefined && this.botKinematicsServedSeq.get(roomCode) === currentDiceSeq;

    const delayMs = resolveBotStepDelay(
      room,
      this.delegate.botTurnDelayMs,
      hasUpgradeDelay,
      kinematicsServed
    );

    if (currentDiceSeq !== undefined && !kinematicsServed && (room?.phase === TurnPhase.ActionPhase || room?.phase === TurnPhase.PropertyManagement)) {
      this.botKinematicsServedSeq.set(roomCode, currentDiceSeq);
    }

    const timer = setTimeout(() => {
>>>>
```

#### Task 3: Re-export Facade trong `turn_orchestrator.ts`
**Target physical file**: `src/server/network/turn_orchestrator.ts`
```typescript
<<<<
export {
  calculateBotStepDelay,
  AUCTION_BOT_STEP_DELAY_MS,
  BOT_UPGRADE_OBSERVATION_DELAY_MS,
  BOT_TRANSIT_OBSERVATION_DELAY_MS,
  TurnBotTimerScheduler,
  type TurnBotSchedulerDelegate,
} from './turn_bot_timer_scheduler.js';
====
export {
  calculateBotStepDelay,
  resolveBotStepDelay,
  AUCTION_BOT_STEP_DELAY_MS,
  BOT_UPGRADE_OBSERVATION_DELAY_MS,
  BOT_TRANSIT_OBSERVATION_DELAY_MS,
  BOT_START_TURN_BREATHING_ROOM_MS,
  BOT_KINEMATIC_DWELL_COMPENSATION_MS,
  TurnBotTimerScheduler,
  type TurnBotSchedulerDelegate,
} from './turn_bot_timer_scheduler.js';
>>>>
```

## 4. Definition of Done (DoD) & Stopping Criteria
1. **Contract Parity**: Toàn bộ 7/7 contract tests trong `tests/client/imp390_kinematic_pacing_restoration.test.ts` đạt trạng thái GREEN.
2. **Regression Guard**: Toàn bộ các living contract test suites (`bot_pacing_and_camera_lock_contract.test.ts`, `bot_pacing_and_dice_runway_contract.test.ts`, `turn_bot_timer_scheduler.test.ts`, `imp358`, `imp326`) tiếp tục PASS 100%.
3. **Mechanical Gates**: `npm run prefilter` đạt PASS (0 typecheck errors, 0 dirty casts, 0 LOC violations, 0 slop violations).
4. **Evidence Audit**: Vượt qua `node scripts/check_evidence.mjs IMP-390` với Pure Logic Waiver hợp lệ.
