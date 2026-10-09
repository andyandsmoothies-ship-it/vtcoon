# KẾ HOẠCH TRIỂN KHAI MICRO-SLICE: BÓC TÁCH BOT ACTION EVALUATOR (IMP-302)
> **Phân hệ mục tiêu:** `domain-core`
> **Phạm vi kỹ thuật:** Giải phóng nợ dòng mã (LOC Debt) của `src/domain/bot/bot_engine.ts` (hiện chạm mức báo động đỏ số 1 toàn hệ thống: 388/400 LOC, Tier 1, chỉ còn đúng 12 dòng mã trước trần cứng) bằng cách bóc tách logic thẩm định hành động mua tài sản (`decideActionPhaseIntent`, `decidePassiveActionIntent`, `getPriceAtPosition`) và logic thẩm định điều kiện nâng cấp công trình (`getBuildableGroups`, `canUpgradeCell`, `findEligibleUpgradeCell`, `getUpgradeCost`) sang mô-đun chuyên trách `bot_action_evaluator.ts` tại `src/domain/bot/bot_action_evaluator.ts` (~175 LOC). `bot_engine.ts` tinh gọn từ 388 LOC xuống 200 LOC.
> **Cam kết cốt lõi:**
> 1. **Pure Move 100% (Zero Semantic Mutation & Quarantine):** Bảo toàn 100% các công thức thẩm định hành vi Bot: ngưỡng an toàn đe dọa `bot.balance - basePrice < threat.safetyBuffer`, quy tắc đối kháng tay đôi 2 người chơi `isCompetitiveDuel`, rút mẫu xác suất Softmax `sampleDecision`, và thuật toán xếp hạng ô phục kích `calculateAmbushScore`.
> 2. **Bảo Toàn Tương Thích Ngược Tuyệt Đối (Zero Interface Mutation):** Re-export 100% các hàm và types `getUpgradeCost`, `findEligibleUpgradeCell`, `decideActionPhaseIntent`, `getPriceAtPosition`, `decidePassiveActionIntent`, `getBuildableGroups`, `canUpgradeCell` từ `bot_engine.ts` để bảo đảm 100% các bài test và phân hệ gọi ngoài không phải sửa đổi bất kỳ dòng import nào.
> 3. **Giải Phóng Triệt Để Rủi Ro Trần Tier 1:** `bot_engine.ts` giảm mạnh từ 388 xuống 200 LOC (nằm an toàn tuyệt đối dưới trần 400 LOC), `bot_action_evaluator.ts` chỉ ~175 LOC (Tier 1 ✔️ Safe).
> 4. **Scaffolding Protocol & Semantic Behavioral RED:** Khởi tạo stub type-safe cho `bot_action_evaluator.ts` trước khi chạy test, bảo đảm test suite compile hoàn hảo và thất bại do runtime assertions thay vì loader error.
> 5. **Chống Bội Nhiễm Phạm Vi (Scope Bleed Prevention):** Tách bạch phạm vi trực tiếp của vé IMP-302 với dòng phụ thuộc working tree của các vé tiền nhiệm.
> **Baseline Working Tree Dependencies (Predecessor IMP-294..301):** `src/client/3d/adaptive_cinematic_camera.tsx`, `src/client/3d/camera_state_machine.ts`, `src/client/3d/cinematic_chase_camera.ts`, `src/client/audio/sound_engine.ts`, `src/client/audio/sound_synth_recipes.ts`, `src/client/store/game_store_types.ts`, `src/client/ui/actionable_notification.ts`, `src/server/logging/persistent_room_logger.ts`, `src/server/network/turn_orchestrator.ts`, `src/client/3d/camera_kinematic_helpers.ts`, `src/client/3d/camera_location_beacon.tsx`, `src/client/3d/camera_soft_return.ts`, `src/client/3d/cinematic_spline_flyby.ts`, `src/client/3d/use_camera_gestures.ts`, `src/client/audio/sound_engine_context.ts`, `src/client/audio/synth_recipes_ambient.ts`, `src/client/audio/synth_recipes_gameplay.ts`, `src/client/audio/synth_recipes_ui.ts`, `src/client/store/game_store_state_types.ts`, `src/client/store/game_store_subtypes.ts`, `src/client/ui/actionable_notification_gameplay.ts`, `src/client/ui/actionable_notification_map.ts`, `src/client/ui/actionable_notification_system.ts`, `src/server/logging/room_logger_cloud_sync.ts`, `src/server/network/turn_bot_timer_scheduler.ts`, `tests/client/actionable_notification_modular.test.ts`, `tests/client/camera_gestures.test.ts`, `tests/client/camera_soft_return_and_beacon.test.ts`, `tests/client/cinematic_spline_flyby.test.ts`, `tests/client/dramatic_pacing_camera.test.ts`, `tests/client/game_store_types_modular.test.ts`, `tests/client/sound_engine_modular.test.ts`, `tests/client/sound_synth_recipes_modular.test.ts`, `tests/client/spatial_kinematics_camera.test.ts`, `tests/server/room_logger_cloud_sync.test.ts`, `tests/server/turn_bot_timer_scheduler.test.ts`
---
### Bảng 1: Phân bổ Ranh giới Phân hệ (Subsystem Boundary Alignment)
| Tệp Mã Nguồn | Phân Hệ | Vai Trò Kiến Trúc |
| :--- | :--- | :--- |
| `src/domain/bot/bot_action_evaluator.ts` | `domain-core` | **MỚI**: Logic thẩm định hành động mua tài sản và điều kiện nâng cấp công trình tối ưu điểm phục kích của Bot AI |
| `src/domain/bot/bot_engine.ts` | `domain-core` | **SỬA**: Tinh gọn thành Bộ điều phối FSM lượt chơi cấp cao (`decideBotIntent`), ủy quyền thẩm định mua/nâng cấp sang mô-đun chuyên trách |
| `tests/domain/bot_action_evaluator.test.ts` | Living Test | **MỚI**: Living Contract Test kiểm tra độc lập các công thức thẩm định mua, ngưỡng an toàn tiền tệ và xếp hạng nâng cấp công trình |
---
### Bảng 2: Ngân Sách Dòng Mã (LOC Accounting)
| Target physical file | Tier Classification | Baseline LOC | Expected LOC | Net Change | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/domain/bot/bot_action_evaluator.ts` | Tier 1 (Domain/Server/Logic) | 0 | 175 | +175 | <= 400 | ✔️ Safe |
| `src/domain/bot/bot_engine.ts` | Tier 1 (Domain/Server/Logic) | 388 | 200 | -188 | <= 400 | ⚠️ Warning |
| `tests/domain/bot_action_evaluator.test.ts` | Living Test | 0 | 220 | +220 | <= 600 | ✔️ Safe |
---
### Trạm 1: Hợp Đồng Kiểm Thử Độc Lập (RED Contract Tests)
**Target physical file**: `tests/domain/bot_action_evaluator.test.ts` (Tệp mới)
> **Kỷ luật Seam Discipline (Iron Law):** Không monkey-patch framework internals. Kiểm thử trực tiếp qua các cấu trúc dữ liệu domain thuần túy.
> **Quy chuẩn Scaffolding Stub Type-Safe:** Tệp mới được scaffold trước với kiểu dữ liệu tường minh, tuyệt đối CẤM `as any` và `as unknown as T`.
> **Kỷ luật Zero Loops in it():** Cấm tuyệt đối vòng lặp trong `it()`. Mật độ duy trì nghiêm ngặt trong dải vàng 1-4 asserts/test.

1. **TC-BAE-EVAL.01 [UC-BAE-EVAL/MSS]**: Given ô không phải bất động sản (ô số 0 Xuất phát), When gọi `getPriceAtPosition(0)`, Then hàm trả về 0.
2. **TC-BAE-EVAL.02 [UC-BAE-EVAL/MSS]**: Given ô bất động sản hợp lệ trong PROPERTY_DEEDS, When gọi `getPriceAtPosition(1)`, Then hàm trả về giá niêm yết chính xác của ô.
3. **TC-BAE-EVAL.03 [UC-BAE-EVAL/MSS]**: Given ô bất động sản cấp 0, When gọi `getUpgradeCost(1, stateMap, modifiers)`, Then hàm trả về chi phí nâng cấp theo cấu hình.
4. **TC-BAE-EVAL.04 [UC-BAE-EVAL/MSS]**: Given Bot tính cách Passive không đủ tiền vượt ngưỡng an toàn sau mua, When gọi `decidePassiveActionIntent`, Then hàm trả về INTENT_DECLINE.
5. **TC-BAE-EVAL.05 [UC-BAE-EVAL/MSS]**: Given Bot tính cách Passive đáp ứng an toàn và ô là Đường sắt hoặc Tiện ích, When gọi `decidePassiveActionIntent`, Then hàm trả về INTENT_BUY.
6. **TC-BAE-EVAL.06 [UC-BAE-EVAL/MSS]**: Given Bot tính cách Passive có số dư thấp hơn bội số ngưỡng giá, When gọi `decidePassiveActionIntent`, Then hàm trả về INTENT_DECLINE.
7. **TC-BAE-EVAL.07 [UC-BAE-EVAL/MSS]**: Given Bot đứng tại ô có giá niêm yết lớn hơn số dư hiện có, When gọi `decideActionPhaseIntent`, Then hàm trả về INTENT_DECLINE.
8. **TC-BAE-EVAL.08 [UC-BAE-EVAL/MSS]**: Given Bot tính cách Passive trong ActionPhase, When gọi `decideActionPhaseIntent`, Then hàm ủy quyền chuẩn xác sang nhánh passive intent.
9. **TC-BAE-EVAL.09 [UC-BAE-EVAL/MSS]**: Given Bot có nguy cơ đe dọa cao và số dư sau mua nhỏ hơn safetyBuffer, When gọi `decideActionPhaseIntent`, Then hàm trả về INTENT_DECLINE.
10. **TC-BAE-EVAL.10 [UC-BAE-EVAL/MSS]**: Given Bot trong thế trận tay đôi 2 người có lượng tiền mặt dồi dào, When gọi `decideActionPhaseIntent`, Then hàm ưu tiên mua đất với INTENT_BUY.
11. **TC-BAE-EVAL.11 [UC-BAE-EVAL/MSS]**: Given Bot chưa sở hữu trọn bộ độc quyền nhóm màu nào, When gọi `getBuildableGroups`, Then tập hợp trả về là rỗng (size 0).
12. **TC-BAE-EVAL.12 [UC-BAE-EVAL/MSS]**: Given Bot sở hữu độc quyền nhưng có một ô trong nhóm đang bị thế chấp, When gọi `getBuildableGroups`, Then nhóm đó bị loại khỏi danh sách xây dựng.
13. **TC-BAE-EVAL.13 [UC-BAE-EVAL/MSS]**: Given Bot tính cách Passive có số dư nhỏ hơn 3 lần chi phí nâng cấp, When gọi `canUpgradeCell`, Then hàm trả về false.
14. **TC-BAE-EVAL.14 [UC-BAE-EVAL/MSS]**: Given Bot tính cách Aggressive ở tư thế Dẫn đầu (Leading), When gọi `canUpgradeCell`, Then hàm yêu cầu số dư sau nâng cấp vượt 1.45 lần safetyBuffer.
15. **TC-BAE-EVAL.15 [UC-BAE-EVAL/MSS]**: Given Bot có nhóm độc quyền hợp lệ và thỏa mãn chi phí nâng cấp, When gọi `findEligibleUpgradeCell`, Then hàm chọn ô có điểm phục kích ambushScore cao nhất.
16. **TC-BAE-EVAL.16 [UC-BAE-EVAL/MSS]**: Given bot_engine tích hợp bot_action_evaluator, When gọi `decideBotIntent` tại ActionPhase và PropertyManagement, Then kết quả trả về trùng khớp 100% với hành vi nguyên bản.
---
### Trạm 2: Kế Hoạch Triển Khai Chi Tiết (Implementation Tasks)

#### Task 1: Khởi Tạo Tệp Thẩm Định Hành Động Bot `src/domain/bot/bot_action_evaluator.ts`
**Target physical file**: `src/domain/bot/bot_action_evaluator.ts` (Tệp mới)

```typescript
// [IMP-302] Bot Action & Property Upgrade Valuation Engine
import type { Player, Room, MarketModifier } from '../room';
import { BOARD_CONFIG, CellType } from '../board_config';
import type { PropertyRegistry, PropertyStateMap } from '../property_data';
import { PROPERTY_DEEDS } from '../property_data';
import { hasMonopoly, checkEvenBuilding, calculateUpgradeCost } from '../property_upgrade';
import { BotPersonality, BotPosture, type BotIntent, type TileValuation, type BotConfig } from './bot_types';
import { calculateAmbushScore } from './bot_posture.js';
import { calculateThreatHorizon } from './threat_forecaster';
import { evaluateTileValuation } from './valuation_engine';
import { sampleDecision, createDeterministicRng, getTurnSeed } from './bot_softmax';

export function getPriceAtPosition(position: number): number {
  return PROPERTY_DEEDS.get(position)?.price ?? 0;
}

export function getUpgradeCost(
  cellIndex: number,
  stateMap: PropertyStateMap,
  modifiers?: readonly MarketModifier[],
): number {
  return calculateUpgradeCost(cellIndex, stateMap.get(cellIndex)?.level ?? 0, modifiers);
}

export function decidePassiveActionIntent(
  bot: Player,
  basePrice: number,
  valuation: TileValuation,
  safetyBuffer: number,
  balanceThresholdMultiplier?: number,
  config?: BotConfig,
  room?: Room,
  actionRng?: () => number,
): BotIntent {
  const cell = BOARD_CONFIG[bot.position];
  const isInfraOrUtility = cell?.type === CellType.Railroad || cell?.type === CellType.Utility;
  const isMonopolyOrStrategic = (valuation.monopolyScore ?? 1.0) >= 1.6 || (valuation.denialScore ?? 1.0) > 1.0;
  const hasSufficientCash = bot.balance - basePrice >= safetyBuffer;

  if (!hasSufficientCash) {
    return { type: 'INTENT_DECLINE' };
  }

  if (isInfraOrUtility || isMonopolyOrStrategic) {
    return { type: 'INTENT_BUY' };
  }

  const effectiveThreshold = balanceThresholdMultiplier ?? 1.25;
  if (bot.balance < basePrice * effectiveThreshold) {
    return { type: 'INTENT_DECLINE' };
  }

  if (config?.manualRoll !== undefined || config?.rng !== undefined || config?.seed !== undefined) {
    const rng = actionRng ?? config.rng ?? createDeterministicRng(config.seed ?? (room ? getTurnSeed(bot, room, bot.position) : 42));
    const buy = sampleDecision(valuation.buyProbability ?? 0.8, rng, config.manualRoll);
    return buy ? { type: 'INTENT_BUY' } : { type: 'INTENT_DECLINE' };
  }

  return { type: 'INTENT_BUY' };
}

export function decideActionPhaseIntent(
  bot: Player,
  room: Room,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  config: BotConfig,
): BotIntent {
  const { personality, balanceThresholdMultiplier } = config;
  const actionRng = config.rng ?? (
    config.seed !== undefined
      ? createDeterministicRng(config.seed)
      : createDeterministicRng(getTurnSeed(bot, room, bot.position))
  );
  const valuation = evaluateTileValuation(
    bot.position,
    bot,
    room,
    registry,
    stateMap,
    personality,
    undefined,
    actionRng,
  );
  const basePrice = valuation.basePrice > 0 ? valuation.basePrice : getPriceAtPosition(bot.position);
  if (basePrice <= 0 || bot.balance < basePrice) {
    return { type: 'INTENT_DECLINE' };
  }

  const threat = calculateThreatHorizon(bot, room, registry, stateMap, personality);

  if (personality === BotPersonality.Passive) {
    return decidePassiveActionIntent(bot, basePrice, valuation, threat.safetyBuffer, balanceThresholdMultiplier, config, room, actionRng);
  }

  if (balanceThresholdMultiplier !== undefined && bot.balance < basePrice * balanceThresholdMultiplier) {
    return { type: 'INTENT_DECLINE' };
  }

  if (threat.dangerTilesCount > 0 && bot.balance - basePrice < threat.safetyBuffer) {
    return { type: 'INTENT_DECLINE' };
  }

  const activePlayers = room?.players?.filter((p) => !p.bankrupt).length ?? 4;
  const isCompetitiveDuel = Boolean(room?.started && activePlayers <= 2);
  const hasAbundantCash = isCompetitiveDuel && config.manualRoll === undefined && bot.balance >= basePrice * 2.5 && bot.balance - basePrice >= threat.safetyBuffer;

  if (!hasAbundantCash && valuation.estimatedValue < valuation.basePrice) {
    if (valuation.pacingFactor !== undefined && valuation.pacingFactor < 1.0) {
      return { type: 'INTENT_DECLINE' };
    }
    if (balanceThresholdMultiplier === undefined || bot.balance < basePrice * balanceThresholdMultiplier) {
      return { type: 'INTENT_DECLINE' };
    }
  }

  if (config.manualRoll !== undefined || config.rng !== undefined || config.seed !== undefined) {
    const isMonopolyOrStrategic = (valuation.monopolyScore ?? 1.0) >= 1.6 || (valuation.denialScore ?? 1.0) > 1.0;
    const hasAbundantEarlyCash = config.manualRoll === undefined && bot.balance >= basePrice * 4 && (room?.round ?? room?.roundCount ?? 1) <= 2;
    if (!isMonopolyOrStrategic && !hasAbundantEarlyCash && !hasAbundantCash) {
      const buy = sampleDecision(valuation.buyProbability ?? 0.8, actionRng, config.manualRoll);
      return buy ? { type: 'INTENT_BUY' } : { type: 'INTENT_DECLINE' };
    }
  }

  return { type: 'INTENT_BUY' };
}

export function getBuildableGroups(
  botId: string,
  mortgagedProperties: readonly number[] | undefined,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
): Set<string> {
  const isMortgaged = (idx: number) =>
    Boolean(mortgagedProperties?.includes(idx) || stateMap.get(idx)?.isMortgaged);

  const ownedGroups = new Set<string>();
  for (const cell of BOARD_CONFIG) {
    if (cell.colorGroup && hasMonopoly(botId, cell.index, registry, stateMap)) {
      const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === cell.colorGroup);
      const hasMortgaged = groupCells.some((c) => isMortgaged(c.index));
      if (!hasMortgaged) ownedGroups.add(cell.colorGroup);
    }
  }
  return ownedGroups;
}

export function canUpgradeCell(
  cellIndex: number,
  bot: Player,
  safetyBuffer: number,
  dangerTilesCount: number,
  upgradeCost: number,
  personality: BotPersonality,
  posture?: BotPosture,
  round?: number,
): boolean {
  if (personality === BotPersonality.Passive) {
    if (bot.balance < upgradeCost * 3) return false;
    const isUnderdog = posture === BotPosture.Trailing || (round !== undefined && round >= 20);
    if (isUnderdog) {
      return bot.balance - upgradeCost >= safetyBuffer * 1.8;
    }
    if (dangerTilesCount > 0) {
      return bot.balance - upgradeCost >= safetyBuffer * 3 && bot.balance >= upgradeCost * 5;
    }
    return bot.balance - upgradeCost >= safetyBuffer * 1.2;
  }
  if (personality === BotPersonality.Aggressive && posture === BotPosture.Leading) {
    return bot.balance - upgradeCost >= safetyBuffer * 1.45;
  }
  return bot.balance - upgradeCost >= safetyBuffer;
}

export function findEligibleUpgradeCell(
  bot: Player,
  room: Room,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  personality: BotPersonality,
  posture?: BotPosture,
): number | null {
  const ownedGroups = getBuildableGroups(bot.id, bot.mortgagedProperties, registry, stateMap);
  if (ownedGroups.size === 0) return null;

  const threat = calculateThreatHorizon(bot, room, registry, stateMap, personality);
  const isMortgaged = (idx: number) =>
    Boolean(bot.mortgagedProperties?.includes(idx) || stateMap.get(idx)?.isMortgaged);
  const currentRound = room.roundCount ?? room.round ?? 1;

  const candidates: Array<{ cellIndex: number; ambushScore: number }> = [];

  for (const group of ownedGroups) {
    const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === group);
    for (const cell of groupCells) {
      if (isMortgaged(cell.index)) continue;
      const state = stateMap.get(cell.index) ?? { level: 0 };
      if (state.level >= 3 || !checkEvenBuilding(cell.index, stateMap).valid) continue;

      const upgradeCost = getUpgradeCost(cell.index, stateMap, room.activeModifiers);
      if (upgradeCost <= 0) continue;

      if (canUpgradeCell(cell.index, bot, threat.safetyBuffer, threat.dangerTilesCount, upgradeCost, personality, posture, currentRound)) {
        const ambush = calculateAmbushScore(cell.index, room.players, bot.id);
        candidates.push({ cellIndex: cell.index, ambushScore: ambush });
      }
    }
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => b.ambushScore - a.ambushScore);
  return candidates[0]!.cellIndex;
}
```

#### Task 2: Tinh Gọn `src/domain/bot/bot_engine.ts`
**Target physical file**: `src/domain/bot/bot_engine.ts`

##### Snippet 1: Thay thế khối thẩm định mua và nâng cấp bằng import ủy quyền
```typescript
<<<<
/** Tra ve gia niem yet cua o tai position; 0 neu khong phai o tai san. */
function getPriceAtPosition(position: number): number {
  return PROPERTY_DEEDS.get(position)?.price ?? 0;
}

/**
 * Tinh chi phi nang cap cho o dat cellIndex o cap tiep theo.
 */
export function getUpgradeCost(
  cellIndex: number,
  stateMap: PropertyStateMap,
  modifiers?: readonly MarketModifier[],
): number {
  return calculateUpgradeCost(cellIndex, stateMap.get(cellIndex)?.level ?? 0, modifiers);
}

function decidePassiveActionIntent(
  bot: Player,
  basePrice: number,
  valuation: TileValuation,
  safetyBuffer: number,
  balanceThresholdMultiplier?: number,
  config?: BotConfig,
  room?: Room,
  actionRng?: () => number,
): BotIntent {
  const cell = BOARD_CONFIG[bot.position];
  const isInfraOrUtility = cell?.type === CellType.Railroad || cell?.type === CellType.Utility;
  const isMonopolyOrStrategic = (valuation.monopolyScore ?? 1.0) >= 1.6 || (valuation.denialScore ?? 1.0) > 1.0;
  const hasSufficientCash = bot.balance - basePrice >= safetyBuffer;

  if (!hasSufficientCash) {
    return { type: 'INTENT_DECLINE' };
  }

  if (isInfraOrUtility || isMonopolyOrStrategic) {
    return { type: 'INTENT_BUY' };
  }

  const effectiveThreshold = balanceThresholdMultiplier ?? 1.25;
  if (bot.balance < basePrice * effectiveThreshold) {
    return { type: 'INTENT_DECLINE' };
  }

  if (config?.manualRoll !== undefined || config?.rng !== undefined || config?.seed !== undefined) {
    const rng = actionRng ?? config.rng ?? createDeterministicRng(config.seed ?? (room ? getTurnSeed(bot, room, bot.position) : 42));
    const buy = sampleDecision(valuation.buyProbability ?? 0.8, rng, config.manualRoll);
    return buy ? { type: 'INTENT_BUY' } : { type: 'INTENT_DECLINE' };
  }

  return { type: 'INTENT_BUY' };
}

function decideActionPhaseIntent(
  bot: Player,
  room: Room,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  config: BotConfig,
): BotIntent {
  const { personality, balanceThresholdMultiplier } = config;
  const actionRng = config.rng ?? (
    config.seed !== undefined
      ? createDeterministicRng(config.seed)
      : createDeterministicRng(getTurnSeed(bot, room, bot.position))
  );
  const valuation = evaluateTileValuation(
    bot.position,
    bot,
    room,
    registry,
    stateMap,
    personality,
    undefined,
    actionRng,
  );
  const basePrice = valuation.basePrice > 0 ? valuation.basePrice : getPriceAtPosition(bot.position);
  if (basePrice <= 0 || bot.balance < basePrice) {
    return { type: 'INTENT_DECLINE' };
  }

  const threat = calculateThreatHorizon(bot, room, registry, stateMap, personality);

  if (personality === BotPersonality.Passive) {
    return decidePassiveActionIntent(bot, basePrice, valuation, threat.safetyBuffer, balanceThresholdMultiplier, config, room, actionRng);
  }

  if (balanceThresholdMultiplier !== undefined && bot.balance < basePrice * balanceThresholdMultiplier) {
    return { type: 'INTENT_DECLINE' };
  }

  if (threat.dangerTilesCount > 0 && bot.balance - basePrice < threat.safetyBuffer) {
    return { type: 'INTENT_DECLINE' };
  }

  const activePlayers = room?.players?.filter((p) => !p.bankrupt).length ?? 4;
  const isCompetitiveDuel = Boolean(room?.started && activePlayers <= 2);
  const hasAbundantCash = isCompetitiveDuel && config.manualRoll === undefined && bot.balance >= basePrice * 2.5 && bot.balance - basePrice >= threat.safetyBuffer;

  if (!hasAbundantCash && valuation.estimatedValue < valuation.basePrice) {
    if (valuation.pacingFactor !== undefined && valuation.pacingFactor < 1.0) {
      return { type: 'INTENT_DECLINE' };
    }
    if (balanceThresholdMultiplier === undefined || bot.balance < basePrice * balanceThresholdMultiplier) {
      return { type: 'INTENT_DECLINE' };
    }
  }

  if (config.manualRoll !== undefined || config.rng !== undefined || config.seed !== undefined) {
    const isMonopolyOrStrategic = (valuation.monopolyScore ?? 1.0) >= 1.6 || (valuation.denialScore ?? 1.0) > 1.0;
    const hasAbundantEarlyCash = config.manualRoll === undefined && bot.balance >= basePrice * 4 && (room?.round ?? room?.roundCount ?? 1) <= 2;
    if (!isMonopolyOrStrategic && !hasAbundantEarlyCash && !hasAbundantCash) {
      const buy = sampleDecision(valuation.buyProbability ?? 0.8, actionRng, config.manualRoll);
      return buy ? { type: 'INTENT_BUY' } : { type: 'INTENT_DECLINE' };
    }
  }

  return { type: 'INTENT_BUY' };
}

function getBuildableGroups(
  botId: string,
  mortgagedProperties: readonly number[] | undefined,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
): Set<string> {
  const isMortgaged = (idx: number) =>
    Boolean(mortgagedProperties?.includes(idx) || stateMap.get(idx)?.isMortgaged);

  const ownedGroups = new Set<string>();
  for (const cell of BOARD_CONFIG) {
    if (cell.colorGroup && hasMonopoly(botId, cell.index, registry, stateMap)) {
      const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === cell.colorGroup);
      const hasMortgaged = groupCells.some((c) => isMortgaged(c.index));
      if (!hasMortgaged) ownedGroups.add(cell.colorGroup);
    }
  }
  return ownedGroups;
}

function canUpgradeCell(
  cellIndex: number,
  bot: Player,
  safetyBuffer: number,
  dangerTilesCount: number,
  upgradeCost: number,
  personality: BotPersonality,
  posture?: BotPosture,
  round?: number,
): boolean {
  if (personality === BotPersonality.Passive) {
    if (bot.balance < upgradeCost * 3) return false;
    const isUnderdog = posture === BotPosture.Trailing || (round !== undefined && round >= 20);
    if (isUnderdog) {
      return bot.balance - upgradeCost >= safetyBuffer * 1.8;
    }
    if (dangerTilesCount > 0) {
      return bot.balance - upgradeCost >= safetyBuffer * 3 && bot.balance >= upgradeCost * 5;
    }
    return bot.balance - upgradeCost >= safetyBuffer * 1.2;
  }
  if (personality === BotPersonality.Aggressive && posture === BotPosture.Leading) {
    return bot.balance - upgradeCost >= safetyBuffer * 1.45;
  }
  return bot.balance - upgradeCost >= safetyBuffer;
}

function findEligibleUpgradeCell(
  bot: Player,
  room: Room,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  personality: BotPersonality,
  posture?: BotPosture,
): number | null {
  const ownedGroups = getBuildableGroups(bot.id, bot.mortgagedProperties, registry, stateMap);
  if (ownedGroups.size === 0) return null;

  const threat = calculateThreatHorizon(bot, room, registry, stateMap, personality);
  const isMortgaged = (idx: number) =>
    Boolean(bot.mortgagedProperties?.includes(idx) || stateMap.get(idx)?.isMortgaged);
  const currentRound = room.roundCount ?? room.round ?? 1;

  const candidates: Array<{ cellIndex: number; ambushScore: number }> = [];

  for (const group of ownedGroups) {
    const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === group);
    for (const cell of groupCells) {
      if (isMortgaged(cell.index)) continue;
      const state = stateMap.get(cell.index) ?? { level: 0 };
      if (state.level >= 3 || !checkEvenBuilding(cell.index, stateMap).valid) continue;

      const upgradeCost = getUpgradeCost(cell.index, stateMap, room.activeModifiers);
      if (upgradeCost <= 0) continue;

      if (canUpgradeCell(cell.index, bot, threat.safetyBuffer, threat.dangerTilesCount, upgradeCost, personality, posture, currentRound)) {
        const ambush = calculateAmbushScore(cell.index, room.players, bot.id);
        candidates.push({ cellIndex: cell.index, ambushScore: ambush });
      }
    }
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => b.ambushScore - a.ambushScore);
  return candidates[0]!.cellIndex;
}
====
import {
  getPriceAtPosition,
  getUpgradeCost,
  decidePassiveActionIntent,
  decideActionPhaseIntent,
  getBuildableGroups,
  canUpgradeCell,
  findEligibleUpgradeCell,
} from './bot_action_evaluator.js';

export {
  getPriceAtPosition,
  getUpgradeCost,
  decidePassiveActionIntent,
  decideActionPhaseIntent,
  getBuildableGroups,
  canUpgradeCell,
  findEligibleUpgradeCell,
};
>>>>
```

---
### Trạm 3: Thẩm Định Độc Lập Từ Đĩa Vật Lý (Independent Station 3 Reviews)
* **Trạm 3.1 (Spec & Scope Gatekeeper)**: Rà soát 100% độ trung thực của Plan, không phát sinh file ngoài phân hệ `domain-core`, bảo đảm Zero Scope Creep.
* **Trạm 3.2 (Architecture & Anti-Slop Auditor)**: Rà soát Anti-Slop, an toàn logic Pure Move, assertion density trong dải vàng 1-4 asserts/test, và không có dirty casts (`as any`, `as unknown as T`).

---
### Trạm 4: Kiểm Thử Biến Dị & Cơ Chế Biên (Chaos & Mutation Sentinel)
Lệnh kích hoạt kiểm thử đột biến:
```bash
npm run sentinel -- --ticket IMP-302 --test tests/domain/bot_action_evaluator.test.ts --src src/domain/bot/bot_action_evaluator.ts
```
Mục tiêu: Vượt qua tối thiểu 10 mutants bị tiêu diệt (kill rate: 100%, 0 survived).

---
### Trạm 5: Thu Thập Bằng Chứng & Báo Cáo Nghiệm Thu
* Chạy `npm run prefilter -- src/domain/bot/bot_engine.ts src/domain/bot/bot_action_evaluator.ts tests/domain/bot_action_evaluator.test.ts`.
* Chạy `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_302_BOT_ACTION_EVALUATOR.md`.
* Sinh báo cáo nghiệm thu hoàn chỉnh tại `docs/reports/improvements/IMP-302-bot-action-evaluator_report.md`.
