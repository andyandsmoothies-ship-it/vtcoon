# KẾ HOẠCH TRIỂN KHAI MICRO-SLICE: BÓC TÁCH ACTIVITY GO EXTRACTOR (IMP-303)
> **Phân hệ mục tiêu:** `client-state`
> **Phạm vi kỹ thuật:** Giải phóng nợ dòng mã (LOC Debt) của `src/client/network/activity_rent_matcher.ts` (hiện chạm mức báo động đỏ số 2 toàn hệ thống: 385/400 LOC, Tier 1, chỉ còn 15 dòng mã trước trần cứng) bằng cách bóc tách logic xử lý tiền lương Vượt GO (`extractPassedGoActivities`), khấu trừ nợ thấu chi (`overdraftRoundsLeft`), phí tín dụng (`CC_FREE_CREDIT`), thuế tài sản qua GO (`calculateGoPropertyTax`), bộ dựng registry/stateMap (`buildPropertyRegistryAndStateMap`), và tiện ích nhãn người chơi (`getPlayerName`) sang mô-đun chuyên trách `activity_go_extractor.ts` tại `src/client/network/activity_go_extractor.ts` (~150 LOC). `activity_rent_matcher.ts` tinh gọn từ 385 LOC xuống 262 LOC.
> **Cam kết cốt lõi:**
> 1. **Pure Move 100% (Zero Semantic Mutation & Quarantine):** Bảo toàn 100% các công thức tài chính khi qua GO: tính lương `delta.passedGoSalary ?? calculateGoSalary(round)`, trừ nợ thấu chi 3.300, trừ phí trích lãi tín dụng 400, trần thuế tài sản `GO_PROPERTY_TAX_CAP`, và thuật toán bù trừ công nợ `netGoBonus`.
> 2. **Bảo Toàn Tương Thích Ngược Tuyệt Đối (Zero Interface Mutation):** Re-export 100% các hàm và types `extractPassedGoActivities`, `buildPropertyRegistryAndStateMap`, `getPlayerName`, `PassedGoExtractionResult`, `BalanceDelta` từ `activity_rent_matcher.ts` để bảo đảm 100% các bài test và phân hệ gọi ngoài không phải sửa đổi bất kỳ dòng import nào.
> 3. **Giải Phóng Triệt Để Rủi Ro Trần Tier 1:** `activity_rent_matcher.ts` giảm mạnh từ 385 xuống 262 LOC (nằm an toàn dưới trần 400 LOC), `activity_go_extractor.ts` chỉ ~150 LOC (Tier 1 ✔️ Safe).
> 4. **Scaffolding Protocol & Semantic Behavioral RED:** Khởi tạo stub type-safe cho `activity_go_extractor.ts` trước khi chạy test, bảo đảm test suite compile hoàn hảo và thất bại do runtime assertions thay vì loader error.
> 5. **Chống Bội Nhiễm Phạm Vi (Scope Bleed Prevention):** Tách bạch phạm vi trực tiếp của vé IMP-303 với dòng phụ thuộc working tree của các vé tiền nhiệm.
> **Baseline Working Tree Dependencies (Predecessor IMP-294..302):** `src/client/3d/adaptive_cinematic_camera.tsx`, `src/client/3d/camera_state_machine.ts`, `src/client/3d/cinematic_chase_camera.ts`, `src/client/audio/sound_engine.ts`, `src/client/audio/sound_synth_recipes.ts`, `src/client/store/game_store_types.ts`, `src/client/ui/actionable_notification.ts`, `src/server/logging/persistent_room_logger.ts`, `src/server/network/turn_orchestrator.ts`, `src/domain/bot/bot_engine.ts`, `src/client/3d/camera_kinematic_helpers.ts`, `src/client/3d/camera_location_beacon.tsx`, `src/client/3d/camera_soft_return.ts`, `src/client/3d/cinematic_spline_flyby.ts`, `src/client/3d/use_camera_gestures.ts`, `src/client/audio/sound_engine_context.ts`, `src/client/audio/synth_recipes_ambient.ts`, `src/client/audio/synth_recipes_gameplay.ts`, `src/client/audio/synth_recipes_ui.ts`, `src/client/store/game_store_state_types.ts`, `src/client/store/game_store_subtypes.ts`, `src/client/ui/actionable_notification_gameplay.ts`, `src/client/ui/actionable_notification_map.ts`, `src/client/ui/actionable_notification_system.ts`, `src/server/logging/room_logger_cloud_sync.ts`, `src/server/network/turn_bot_timer_scheduler.ts`, `src/domain/bot/bot_action_evaluator.ts`, `tests/client/actionable_notification_modular.test.ts`, `tests/client/camera_gestures.test.ts`, `tests/client/camera_soft_return_and_beacon.test.ts`, `tests/client/cinematic_spline_flyby.test.ts`, `tests/client/dramatic_pacing_camera.test.ts`, `tests/client/game_store_types_modular.test.ts`, `tests/client/sound_engine_modular.test.ts`, `tests/client/sound_synth_recipes_modular.test.ts`, `tests/client/spatial_kinematics_camera.test.ts`, `tests/server/room_logger_cloud_sync.test.ts`, `tests/server/turn_bot_timer_scheduler.test.ts`, `tests/domain/bot_action_evaluator.test.ts`
---
### Bảng 1: Phân bổ Ranh giới Phân hệ (Subsystem Boundary Alignment)
| Tệp Mã Nguồn | Phân Hệ | Vai Trò Kiến Trúc |
| :--- | :--- | :--- |
| `src/client/network/activity_go_extractor.ts` | `client-state` | **MỚI**: Bộ xử lý thuần hàm trích xuất dòng tiền và biến động tài chính khi người chơi vượt ô Bắt Đầu (GO Salary & Deductions) |
| `src/client/network/activity_rent_matcher.ts` | `client-state` | **SỬA**: Tinh gọn thành Bộ khớp tiền thuê và phí phạt đa tầng, ủy quyền trích xuất lương GO sang mô-đun chuyên trách |
| `tests/client/activity_go_extractor.test.ts` | Living Test | **MỚI**: Living Contract Test kiểm tra độc lập các công thức lương GO, khấu trừ nợ thấu chi, trần thuế tài sản và bù trừ công nợ |
---
### Bảng 2: Ngân Sách Dòng Mã (LOC Accounting)
| Target physical file | Tier Classification | Baseline LOC | Expected LOC | Net Change | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/network/activity_go_extractor.ts` | Tier 1 (Domain/Server/Logic) | 0 | 150 | +150 | <= 400 | ✔️ Safe |
| `src/client/network/activity_rent_matcher.ts` | Tier 1 (Domain/Server/Logic) | 385 | 262 | -123 | <= 400 | ⚠️ Warning |
| `tests/client/activity_go_extractor.test.ts` | Living Test | 0 | 220 | +220 | <= 600 | ✔️ Safe |
---
### Trạm 1: Hợp Đồng Kiểm Thử Độc Lập (RED Contract Tests)
**Target physical file**: `tests/client/activity_go_extractor.test.ts` (Tệp mới)
> **Kỷ luật Seam Discipline (Iron Law):** Không monkey-patch framework internals. Kiểm thử trực tiếp qua các cấu trúc dữ liệu domain và client thuần túy.
> **Quy chuẩn Scaffolding Stub Type-Safe:** Tệp mới được scaffold trước với kiểu dữ liệu tường minh, tuyệt đối CẤM `as any` và `as unknown as T`.
> **Kỷ luật Zero Loops in it():** Cấm tuyệt đối vòng lặp trong `it()`. Mật độ duy trì nghiêm ngặt trong dải vàng 1-4 asserts/test.

1. **TC-AGE-GO.01 [UC-AGE-GO/MSS]**: Given người chơi không vượt qua ô GO (từ ô 5 đến ô 10), When gọi `extractPassedGoActivities`, Then hàm trả về danh sách salaryLogs rỗng.
2. **TC-AGE-GO.02 [UC-AGE-GO/MSS]**: Given người chơi vượt ô GO từ vị trí 38 đến 2, When gọi `extractPassedGoActivities`, Then hàm sinh ra log lương chuẩn xác theo vòng chơi.
3. **TC-AGE-GO.03 [UC-AGE-GO/MSS]**: Given người chơi bị đưa vào diện kiểm toán (inAudit là true), When gọi `extractPassedGoActivities`, Then người chơi không được phát lương.
4. **TC-AGE-GO.04 [UC-AGE-GO/MSS]**: Given người chơi đến hạn trả nợ thấu chi (overdraftRoundsLeft = 1), When gọi `extractPassedGoActivities`, Then hàm sinh thêm log khấu trừ 3.300 nợ ngân hàng.
5. **TC-AGE-GO.05 [UC-AGE-GO/MSS]**: Given người chơi sở hữu thẻ CC_FREE_CREDIT, When gọi `extractPassedGoActivities`, Then hàm sinh thêm log nộp 400 phí trích lãi tín dụng.
6. **TC-AGE-GO.06 [UC-AGE-GO/MSS]**: Given người chơi sở hữu nhiều bất động sản phải nộp thuế qua GO, When gọi `extractPassedGoActivities`, Then hàm sinh log thuế bị chặn trên ở mức GO_PROPERTY_TAX_CAP.
7. **TC-AGE-GO.07 [UC-AGE-GO/MSS]**: Given delta truyền giá trị passedGoSalary tường minh, When gọi `extractPassedGoActivities`, Then hàm ưu tiên lấy giá trị passedGoSalary trong delta.
8. **TC-AGE-GO.08 [UC-AGE-GO/MSS]**: Given delta không có người chơi nào di chuyển, When gọi `extractPassedGoActivities`, Then hàm trả về mảng rỗng và bảo toàn danh sách payers/receivers ban đầu.
9. **TC-AGE-GO.09 [UC-AGE-GO/MSS]**: Given người chơi đang có khoản thu (receivers) trùng khớp với netGoBonus, When gọi `extractPassedGoActivities`, Then hàm đánh dấu handledReceiverIds và đặt diff về 0.
10. **TC-AGE-GO.10 [UC-AGE-GO/MSS]**: Given người chơi đang có khoản thu lớn hơn netGoBonus, When gọi `extractPassedGoActivities`, Then hàm trừ netGoBonus khỏi diff của receiver.
11. **TC-AGE-GO.11 [UC-AGE-GO/MSS]**: Given người chơi đang là payer có nợ lớn hơn netGoBonus, When gọi `extractPassedGoActivities`, Then hàm giảm khoản nợ của payer.
12. **TC-AGE-GO.12 [UC-AGE-GO/MSS]**: Given người chơi đang là payer có nợ nhỏ hơn netGoBonus, When gọi `extractPassedGoActivities`, Then hàm chuyển payer thành receiver với số dư ròng.
13. **TC-AGE-GO.13 [UC-AGE-GO/MSS]**: Given cấu trúc playersInfo và levelMap hợp lệ, When gọi `buildPropertyRegistryAndStateMap`, Then hàm trả về đối tượng registry và stateMap chính xác.
14. **TC-AGE-GO.14 [UC-AGE-GO/MSS]**: Given đối tượng pInfo có chứa thuộc tính name, When gọi `getPlayerName`, Then hàm trả về đúng tên người chơi.
15. **TC-AGE-GO.15 [UC-AGE-GO/MSS]**: Given đối tượng pInfo không có tên nhưng có fallbackId, When gọi `getPlayerName`, Then hàm trả về fallbackId viết in hoa.
16. **TC-AGE-GO.16 [UC-AGE-GO/MSS]**: Given activity_rent_matcher re-export các hàm từ activity_go_extractor, When gọi `extractPassedGoActivities` qua activity_rent_matcher, Then kết quả bảo toàn 100% tính tương thích ngược.
---
### Trạm 2: Kế Hoạch Triển Khai Chi Tiết (Implementation Tasks)

#### Task 1: Khởi Tạo Tệp Trích Xuất Tiền Lương GO `src/client/network/activity_go_extractor.ts`
**Target physical file**: `src/client/network/activity_go_extractor.ts` (Tệp mới)

```typescript
// [IMP-303] Activity GO Salary & Financial Deduction Extractor
import type { DeltaPayload } from '../../server/session_manager.js';
import type { GameState, PlayerHudInfo } from '../store/game_store.js';
import { type ActivityLogEntry } from '../store/activity_store.js';
import { checkPassedGo, calculateGoSalary } from '../../domain/room.js';
import { formatCurrency } from '../ui/ui_helpers.js';
import { type PropertyRegistry, type PropertyStateMap } from '../../domain/property_data.js';
import { calculateGoPropertyTax, GO_PROPERTY_TAX_CAP } from '../../domain/property_rent.js';
import { ChanceCardId } from '../../domain/event_card_types.js';

export interface BalanceDelta {
  readonly id: string;
  readonly diff: number;
  readonly pInfo?: PlayerHudInfo;
  readonly cellIndex?: number;
}

export interface PassedGoExtractionResult {
  readonly salaryLogs: ActivityLogEntry[];
  readonly payers: BalanceDelta[];
  readonly receivers: BalanceDelta[];
  readonly handledReceiverIds: Set<string>;
}

export function buildPropertyRegistryAndStateMap(
  playersInfo: Record<string, PlayerHudInfo>,
  levelMap?: Record<number, number>,
): { registry: PropertyRegistry; stateMap: PropertyStateMap } {
  const registry: PropertyRegistry = new Map();
  const stateMap: PropertyStateMap = new Map();
  if (playersInfo) {
    for (const [id, info] of Object.entries(playersInfo)) {
      for (const cell of info?.ownedProperties ?? []) registry.set(cell, id);
    }
  }
  if (levelMap) {
    for (const [cellStr, lvl] of Object.entries(levelMap)) stateMap.set(Number(cellStr), { level: lvl });
  }
  return { registry, stateMap };
}

export function getPlayerName(pInfo?: PlayerHudInfo, fallbackId?: string): string {
  return pInfo?.name || (fallbackId ? fallbackId.toUpperCase() : 'Người chơi');
}

export function extractPassedGoActivities(
  delta: DeltaPayload,
  prevState: GameState,
  nextState: GameState,
  initialPayers: readonly BalanceDelta[],
  initialReceivers: readonly BalanceDelta[],
  initialHandledReceiverIds: ReadonlySet<string>,
): PassedGoExtractionResult {
  if (!delta.players || delta.players.length === 0) {
    return { salaryLogs: [], payers: [...initialPayers], receivers: [...initialReceivers], handledReceiverIds: new Set(initialHandledReceiverIds) };
  }

  const salaryLogs: ActivityLogEntry[] = [];
  let payers = [...initialPayers];
  let receivers = [...initialReceivers];
  const handledReceiverIds = new Set(initialHandledReceiverIds);

  for (const p of delta.players) {
    const prevPos = prevState.playerPositions?.[p.id];
    const newPos = nextState.playerPositions?.[p.id] ?? p.position;
    if (prevPos === undefined || newPos === undefined || prevPos === newPos) continue;

    const prevP = prevState.playersInfo[p.id];
    const isSentToAudit = Boolean(
      p.inAudit === true ||
      (p.auditTurnsLeft && p.auditTurnsLeft > 0) ||
      nextState.playersInfo[p.id]?.inAudit === true,
    );
    if (isSentToAudit) continue;

    if (checkPassedGo(prevPos, newPos)) {
      const round = delta.roundNumber ?? prevState.roundNumber ?? 1;
      const salary = delta.passedGoSalary ?? calculateGoSalary(round);
      const pInfo = nextState.playersInfo[p.id] ?? prevP;
      const pName = getPlayerName(pInfo, p.id);

      salaryLogs.push({
        id: `salary_${Date.now()}_${p.id}`, timestamp: Date.now(), type: 'salary',
        message: `🏁 ${pName} đã vượt qua ô Bắt Đầu và nhận ${formatCurrency(salary)} tiền lương`,
        playerId: p.id, playerName: pName, amount: salary,
        ...(pInfo?.tokenColor ? { playerTokenColor: pInfo.tokenColor } : {}),
      });

      const isOverdraftDue = prevP?.overdraftRoundsLeft === 1 && (!p.overdraftRoundsLeft || p.overdraftRoundsLeft === 0);
      if (isOverdraftDue) {
        salaryLogs.push({
          id: `overdraft_${Date.now()}_${p.id}`, timestamp: Date.now(), type: 'card',
          message: `💳 ${pName} đã hoàn trả 3.300 nợ thấu chi ngân hàng khi hết hạn`,
          amount: -3300, cellIndex: 0, playerId: p.id, playerName: pName,
          ...(pInfo?.tokenColor ? { playerTokenColor: pInfo.tokenColor } : {}),
        });
      }

      const hasFreeCredit = Boolean(prevP?.hand?.includes(ChanceCardId.CC_FREE_CREDIT));
      if (hasFreeCredit) {
        salaryLogs.push({
          id: `credit_${Date.now()}_${p.id}`, timestamp: Date.now(), type: 'card',
          message: `🏦 ${pName} đã nộp 400 phí trích lãi tín dụng Kho Bạc (CC_FREE_CREDIT)`,
          amount: -400, cellIndex: 0, playerId: p.id, playerName: pName,
          ...(pInfo?.tokenColor ? { playerTokenColor: pInfo.tokenColor } : {}),
        });
      }

      const { registry, stateMap } = buildPropertyRegistryAndStateMap(prevState.playersInfo, prevState.levelMap);
      const rawGoTax = calculateGoPropertyTax(p.id, registry, stateMap);
      const goTax = Math.min(rawGoTax, GO_PROPERTY_TAX_CAP);
      if (goTax > 0) {
        salaryLogs.push({
          id: `tax_prop_go_${Date.now()}_${p.id}`, timestamp: Date.now(), type: 'tax',
          message: `🏛️ ${pName} đã nộp thuế ${formatCurrency(goTax)} (Thuế Tài Sản Qua GO)`,
          amount: -goTax, cellIndex: 0, playerId: p.id, playerName: pName,
          ...(pInfo?.tokenColor ? { playerTokenColor: pInfo.tokenColor } : {}),
        });
      }

      const totalGoDeductions = (isOverdraftDue ? 3300 : 0) + (hasFreeCredit ? 400 : 0) + goTax;
      const netGoBonus = salary - totalGoDeductions;

      const recIdx = receivers.findIndex((r) => r.id === p.id);
      if (recIdx !== -1) {
        const currentDiff = receivers[recIdx]!.diff;
        if (currentDiff === netGoBonus) {
          handledReceiverIds.add(p.id);
          receivers[recIdx] = { ...receivers[recIdx]!, diff: 0 };
        } else if (currentDiff > netGoBonus) {
          receivers[recIdx] = { ...receivers[recIdx]!, diff: currentDiff - netGoBonus };
        } else {
          receivers = receivers.filter((_, idx) => idx !== recIdx);
          payers.push({ id: p.id, diff: currentDiff - netGoBonus, pInfo: prevP, cellIndex: newPos });
        }
      } else {
        const payIdx = payers.findIndex((py) => py.id === p.id);
        if (payIdx !== -1) {
          const updatedDiff = payers[payIdx]!.diff - netGoBonus;
          if (updatedDiff > 0) {
            receivers.push({ id: p.id, diff: updatedDiff, pInfo: prevP, cellIndex: newPos });
            payers = payers.filter((_, idx) => idx !== payIdx);
          } else {
            payers[payIdx] = { ...payers[payIdx]!, diff: updatedDiff };
          }
        } else {
          payers.push({ id: p.id, diff: -netGoBonus, pInfo: prevP, cellIndex: newPos });
        }
      }
    }
  }

  return { salaryLogs, payers, receivers, handledReceiverIds };
}
```

#### Task 2: Tinh Gọn `src/client/network/activity_rent_matcher.ts`
**Target physical file**: `src/client/network/activity_rent_matcher.ts`

##### Snippet 1: Thay thế khối xử lý qua GO bằng import ủy quyền
```typescript
<<<<
export interface BalanceDelta { readonly id: string; readonly diff: number; readonly pInfo?: PlayerHudInfo; readonly cellIndex?: number; }
export interface PropertyFinancialContext {
  readonly boughtCellIndices: readonly number[]; readonly buyoutCellIndices?: readonly number[];
  readonly upgradedCells: ReadonlyArray<{ cellIndex: number; cost: number; ownerId: string }>;
  readonly mortgagedCells: ReadonlyArray<{ cellIndex: number; loan: number; ownerId: string }>;
  readonly unmortgagedCells: ReadonlyArray<{ cellIndex: number; cost: number; ownerId: string }>;
}

export function buildPropertyRegistryAndStateMap(
  playersInfo: Record<string, PlayerHudInfo>,
  levelMap?: Record<number, number>,
): { registry: PropertyRegistry; stateMap: PropertyStateMap } {
  const registry: PropertyRegistry = new Map(), stateMap: PropertyStateMap = new Map();
  if (playersInfo) {
    for (const [id, info] of Object.entries(playersInfo)) {
      for (const cell of info?.ownedProperties ?? []) registry.set(cell, id);
    }
  }
  if (levelMap) {
    for (const [cellStr, lvl] of Object.entries(levelMap)) stateMap.set(Number(cellStr), { level: lvl });
  }
  return { registry, stateMap };
}

export function getPlayerName(pInfo?: PlayerHudInfo, fallbackId?: string): string {
  return pInfo?.name || (fallbackId ? fallbackId.toUpperCase() : 'Người chơi');
}

export interface PassedGoExtractionResult {
  readonly salaryLogs: ActivityLogEntry[]; readonly payers: BalanceDelta[]; readonly receivers: BalanceDelta[]; readonly handledReceiverIds: Set<string>;
}

/**
 * Tách độc lập dòng tiền Lương Vượt GO bằng các phép biến đổi thuần hàm (Immutable).
 */
export function extractPassedGoActivities(
  delta: DeltaPayload,
  prevState: GameState,
  nextState: GameState,
  initialPayers: readonly BalanceDelta[],
  initialReceivers: readonly BalanceDelta[],
  initialHandledReceiverIds: ReadonlySet<string>,
): PassedGoExtractionResult {
  if (!delta.players || delta.players.length === 0) {
    return { salaryLogs: [], payers: [...initialPayers], receivers: [...initialReceivers], handledReceiverIds: new Set(initialHandledReceiverIds) };
  }

  const salaryLogs: ActivityLogEntry[] = [];
  let payers = [...initialPayers];
  let receivers = [...initialReceivers];
  const handledReceiverIds = new Set(initialHandledReceiverIds);

  for (const p of delta.players) {
    const prevPos = prevState.playerPositions?.[p.id];
    const newPos = nextState.playerPositions?.[p.id] ?? p.position;
    if (prevPos === undefined || newPos === undefined || prevPos === newPos) continue;

    const prevP = prevState.playersInfo[p.id];
    const isSentToAudit = Boolean(
      p.inAudit === true ||
      (p.auditTurnsLeft && p.auditTurnsLeft > 0) ||
      nextState.playersInfo[p.id]?.inAudit === true,
    );
    if (isSentToAudit) continue;

    if (checkPassedGo(prevPos, newPos)) {
      const round = delta.roundNumber ?? prevState.roundNumber ?? 1;
      const salary = delta.passedGoSalary ?? calculateGoSalary(round);
      const pInfo = nextState.playersInfo[p.id] ?? prevP;
      const pName = getPlayerName(pInfo, p.id);

      salaryLogs.push({
        id: `salary_${Date.now()}_${p.id}`, timestamp: Date.now(), type: 'salary',
        message: `🏁 ${pName} đã vượt qua ô Bắt Đầu và nhận ${formatCurrency(salary)} tiền lương`,
        playerId: p.id, playerName: pName, amount: salary,
        ...(pInfo?.tokenColor ? { playerTokenColor: pInfo.tokenColor } : {}),
      });

      const isOverdraftDue = prevP?.overdraftRoundsLeft === 1 && (!p.overdraftRoundsLeft || p.overdraftRoundsLeft === 0);
      if (isOverdraftDue) {
        salaryLogs.push({
          id: `overdraft_${Date.now()}_${p.id}`, timestamp: Date.now(), type: 'card',
          message: `💳 ${pName} đã hoàn trả 3.300 nợ thấu chi ngân hàng khi hết hạn`,
          amount: -3300, cellIndex: 0, playerId: p.id, playerName: pName,
          ...(pInfo?.tokenColor ? { playerTokenColor: pInfo.tokenColor } : {}),
        });
      }

      const hasFreeCredit = Boolean(prevP?.hand?.includes(ChanceCardId.CC_FREE_CREDIT));
      if (hasFreeCredit) {
        salaryLogs.push({
          id: `credit_${Date.now()}_${p.id}`, timestamp: Date.now(), type: 'card',
          message: `🏦 ${pName} đã nộp 400 phí trích lãi tín dụng Kho Bạc (CC_FREE_CREDIT)`,
          amount: -400, cellIndex: 0, playerId: p.id, playerName: pName,
          ...(pInfo?.tokenColor ? { playerTokenColor: pInfo.tokenColor } : {}),
        });
      }

      const { registry, stateMap } = buildPropertyRegistryAndStateMap(prevState.playersInfo, prevState.levelMap);
      const rawGoTax = calculateGoPropertyTax(p.id, registry, stateMap);
      const goTax = Math.min(rawGoTax, GO_PROPERTY_TAX_CAP);
      if (goTax > 0) {
        salaryLogs.push({
          id: `tax_prop_go_${Date.now()}_${p.id}`, timestamp: Date.now(), type: 'tax',
          message: `🏛️ ${pName} đã nộp thuế ${formatCurrency(goTax)} (Thuế Tài Sản Qua GO)`,
          amount: -goTax, cellIndex: 0, playerId: p.id, playerName: pName,
          ...(pInfo?.tokenColor ? { playerTokenColor: pInfo.tokenColor } : {}),
        });
      }

      const totalGoDeductions = (isOverdraftDue ? 3300 : 0) + (hasFreeCredit ? 400 : 0) + goTax;
      const netGoBonus = salary - totalGoDeductions;

      const recIdx = receivers.findIndex((r) => r.id === p.id);
      if (recIdx !== -1) {
        const currentDiff = receivers[recIdx]!.diff;
        if (currentDiff === netGoBonus) {
          handledReceiverIds.add(p.id);
          receivers[recIdx] = { ...receivers[recIdx]!, diff: 0 };
        } else if (currentDiff > netGoBonus) {
          receivers[recIdx] = { ...receivers[recIdx]!, diff: currentDiff - netGoBonus };
        } else {
          receivers = receivers.filter((_, idx) => idx !== recIdx);
          payers.push({ id: p.id, diff: currentDiff - netGoBonus, pInfo: prevP, cellIndex: newPos });
        }
      } else {
        const payIdx = payers.findIndex((py) => py.id === p.id);
        if (payIdx !== -1) {
          const updatedDiff = payers[payIdx]!.diff - netGoBonus;
          if (updatedDiff > 0) {
            receivers.push({ id: p.id, diff: updatedDiff, pInfo: prevP, cellIndex: newPos });
            payers = payers.filter((_, idx) => idx !== payIdx);
          } else {
            payers[payIdx] = { ...payers[payIdx]!, diff: updatedDiff };
          }
        } else {
          payers.push({ id: p.id, diff: -netGoBonus, pInfo: prevP, cellIndex: newPos });
        }
      }
    }
  }

  return { salaryLogs, payers, receivers, handledReceiverIds };
}
====
import {
  type BalanceDelta,
  type PassedGoExtractionResult,
  buildPropertyRegistryAndStateMap,
  getPlayerName,
  extractPassedGoActivities,
} from './activity_go_extractor.js';

export {
  type BalanceDelta,
  type PassedGoExtractionResult,
  buildPropertyRegistryAndStateMap,
  getPlayerName,
  extractPassedGoActivities,
};

export interface PropertyFinancialContext {
  readonly boughtCellIndices: readonly number[]; readonly buyoutCellIndices?: readonly number[];
  readonly upgradedCells: ReadonlyArray<{ cellIndex: number; cost: number; ownerId: string }>;
  readonly mortgagedCells: ReadonlyArray<{ cellIndex: number; loan: number; ownerId: string }>;
  readonly unmortgagedCells: ReadonlyArray<{ cellIndex: number; cost: number; ownerId: string }>;
}
>>>>
```

---
### Trạm 3: Thẩm Định Độc Lập Từ Đĩa Vật Lý (Independent Station 3 Reviews)
* **Trạm 3.1 (Spec & Scope Gatekeeper)**: Rà soát 100% độ trung thực của Plan, không phát sinh file ngoài phân hệ `client-state`, bảo đảm Zero Scope Creep.
* **Trạm 3.2 (Architecture & Anti-Slop Auditor)**: Rà soát Anti-Slop, an toàn logic Pure Move, assertion density trong dải vàng 1-4 asserts/test, và không có dirty casts (`as any`, `as unknown as T`).

---
### Trạm 4: Kiểm Thử Biến Dị & Cơ Chế Biên (Chaos & Mutation Sentinel)
Lệnh kích hoạt kiểm thử đột biến:
```bash
npm run sentinel -- --ticket IMP-303 --test tests/client/activity_go_extractor.test.ts --src src/client/network/activity_go_extractor.ts
```
Mục tiêu: Vượt qua tối thiểu 10 mutants bị tiêu diệt (kill rate: 100%, 0 survived).

---
### Trạm 5: Thu Thập Bằng Chứng & Báo Cáo Nghiệm Thu
* Chạy `npm run prefilter -- src/client/network/activity_rent_matcher.ts src/client/network/activity_go_extractor.ts tests/client/activity_go_extractor.test.ts`.
* Chạy `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_303_ACTIVITY_GO_EXTRACTOR.md`.
* Sinh báo cáo nghiệm thu hoàn chỉnh tại `docs/reports/improvements/IMP-303-activity-go-extractor_report.md`.
