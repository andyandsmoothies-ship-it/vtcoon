# KẾ HOẠCH TRIỂN KHAI — IMP-226 (HIỆU CHỈNH TOÀN DIỆN SAU PHẢN BIỆN GRILLER)

> **Mã Ticket**: `IMP-226` | **Loại Thay Đổi**: Tier 2 (Full Rigor — Game Engine / FSM / Network / UI Affordance)  
> **Mục Tiêu**: Thay thế công thức bảo lãnh `10% Net Worth` phức tạp, phi thực tế và sinh số lẻ (như 2.016 Tr.) bằng **Khung Chế Tài Tái Phạm Sát Thực Tế (Lần 1: 500 Tr. ➔ Lần 2: 1.000 Tr. ➔ Lần 3+: 2.000 Tr. VNĐ)**; khắc phục triệt để lỗi hardcode nhãn nút bấm `Bảo Lãnh (500)` trên thanh `ActionDock`; đồng bộ toàn diện pipeline 5 trạm từ Domain Model đến UI, Bot AI và Telemetry.

---

## 1. TIẾP THU TOÀN DIỆN 5 ĐIỂM PHẢN BIỆN ĐỐI KHÁNG (C1–C5)

1. **[C1 - Blocker P1 Lifecycle & Formatter Fixes]**:
   - `action_dock.tsx`: Import `formatCurrency` từ `./ui_helpers`; di chuyển toàn bộ khai báo biến (`auditCount`, `currentBailCost`, `canAffordBail`, `bailLabel`, `bailTitle`) ra thân component chính (ngoài JSX).
   - `activity_badge_dispatcher.ts`: Cập nhật `handleBailBadge` để format formula tái phạm chuẩn xác, không hardcode `10% Net Worth`.
2. **[C2 - Blocker P1 Bot AI Actor Parity in `bot_audit.ts`]**:
   - Loại bỏ hardcode `BAIL_OUT_FINE = 500` trong `decideAuditBailout`.
   - Bot AI gọi `calculateBailAmount(bot.auditCount ?? 1)` cho cả điều kiện kiểm tra tiền mặt và ngưỡng đệm an toàn (`bot.balance - bailCost < minBuffer`).
3. **[C3 - Blocker P1 Specification Evolution for `imp192a_anti_camping_audit.test.ts`]**:
   - Reconcile 5 test cases (`TC-192A.07, 08, 09, 13, 15`) theo nguyên lý Tiến hóa Đặc tả (§4 Hiến pháp): chuyển assertions từ công thức cũ `10% Net Worth` sang khung chế tài tái phạm (`calculateBailAmount`).
4. **[C4 - Safety P2 Negative Line Budget in `session_manager.ts`]**:
   - Khống chế `session_manager.ts` <= 397 LOC (dưới trần 400 LOC Tier 1) bằng cách đặt `auditCount` trên cùng dòng với `auditTurnsLeft` và dọn dẹp các dòng trống dôi dư.
5. **[C5 - Safety P2 Dead Code Pruning & A11y Standards]**:
   - `audit_manager.ts`: Xóa bỏ hàm `hasOwnedProperties` và import `calculateNetWorth` thừa (đã được thay thế hoàn toàn bởi `calculateBailAmount`).
   - `action_dock.tsx`: Giữ `aria-label="Nộp bảo lãnh kiểm toán để rời trạm ngay"` là nhãn hành động chuẩn WCAG; đưa thông báo lỗi và cảnh báo thiếu tiền vào `title`.

---

## 2. KHUNG CHẾ TÀI TÁI PHẠM MỚI (ESCALATING BAIL TIERS)

| Số Lần Vào Trạm (`auditCount`) | Mức Phí Bảo Lãnh / Cưỡng Chế | Ý Nghĩa Thực Tế & Trải Nghiệm Game | Nhãn Nút Bấm Desktop / Mobile |
| :---: | :---: | :--- | :--- |
| **Lần 1** (`auditCount = 1`) | **500 Tr. VNĐ** | Lệ phí hành chính giải tỏa ban đầu (25% lương GO 2.000 Tr.), chuẩn cờ tỷ phú. | `Bảo Lãnh (500)` / `⚖️ 500` |
| **Lần 2** (`auditCount = 2`) | **1.000 Tr. VNĐ** | Chế tài răn đe hành vi tái phạm thanh tra / đổ đôi gian lận. | `Bảo Lãnh - Lần 2 (1.000)` / `⚖️ 1.000` |
| **Lần 3 trở đi** (`auditCount >= 3`) | **2.000 Tr. VNĐ** | Khung phạt tối đa (bằng 100% lương vòng cơ sở). | `Bảo Lãnh - Tái Phạm (2.000)` / `⚖️ 2.000` |

*Ghi chú*: Luật Chống cắm trại (**Anti-Camping Invariant [IMP-192A]**) tiếp tục phong tỏa 100% doanh thu tiền thuê & điện nước của chủ đất trong thời gian thụ án.

---

## 3. DROP-IN CODE SNIPPETS

### Snippet 3.1: Hằng số & Hàm Tính Tiền Bảo Lãnh SSOT
**File**: `src/domain/property_rent.ts`  
**Toạ độ bao đóng**: Ngay sau `TELECOM_DATA_FEE` (dòng 16-19)

```typescript
// [IMP-216][IMP-226] SSOT Constants for Special Fees & Escalating Bail
export const TELECOM_DATA_FEE = 150;
export const MIN_BAIL_AMOUNT = 500;
export const ESCALATING_BAIL_TIERS = [500, 1_000, 2_000] as const;
export const MAX_BAIL_AMOUNT = 2_000;

/**
 * [IMP-226] Tính phí bảo lãnh / tiền phạt kiểm toán theo khung chế tài tái phạm:
 * - Lần 1: 500 Tr. VNĐ (chuẩn lệ phí hành chính, 25% lương GO)
 * - Lần 2: 1.000 Tr. VNĐ (răn đe tái phạm)
 * - Lần 3+: 2.000 Tr. VNĐ (khung phạt tối đa)
 */
export function calculateBailAmount(auditCount: number = 1): number {
  const normalized = Math.max(1, Math.floor(Number.isFinite(auditCount) ? auditCount : 1));
  const index = normalized - 1;
  return ESCALATING_BAIL_TIERS[index] ?? MAX_BAIL_AMOUNT;
}

// Deprecated alias for backward compatibility
export const BAIL_NET_WORTH_RATIO = 0.10;
```

---

### Snippet 3.2: Cập nhật Trí tuệ Bot AI trong `bot_audit.ts` [C2]
**File**: `src/domain/bot/bot_audit.ts`  
**Toạ độ bao đóng**: `decideAuditBailout`

```typescript
import { calculateBailAmount, MIN_BAIL_AMOUNT } from '../property_rent.js';

export const BAIL_OUT_FINE = MIN_BAIL_AMOUNT; // Deprecated backward compatibility
export const UNCLAIMED_EARLY_GAME_THRESHOLD = 8;
export const AUDIT_CELL_INDEX = 10;

// ...
export function decideAuditBailout(
  bot: Player,
  room: Room,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  personality?: BotPersonality,
): boolean {
  const bailCost = calculateBailAmount(bot.auditCount ?? 1);
  if (bot.auditTurnsLeft <= 0 || bot.balance < bailCost) return false;

  const auditBot = bot.position === AUDIT_CELL_INDEX ? bot : { ...bot, position: AUDIT_CELL_INDEX };
  const threat = calculateThreatHorizon(auditBot, room, registry, stateMap, personality);
  const minBuffer = threat?.safetyBuffer ?? DEFAULT_MIN_SAFETY_BUFFER;

  if (bot.balance - bailCost < minBuffer) return false;

  const unclaimedCount = countUnclaimedProperties(registry);
  if (unclaimedCount >= UNCLAIMED_EARLY_GAME_THRESHOLD) return true;

  return threat.dangerTilesCount === 0;
}
```

---

### Snippet 3.3: Quản Lý Vòng Đời `auditCount` & Dọn Dẹp Dead Code [C5]
**File**: `src/server/audit_manager.ts`  
**Toạ độ bao đóng**: `sendToAudit`, `handleBailOut`, `handleAuditTurnTransition`

```typescript
// Xóa bỏ import calculateNetWorth
import { MIN_BAIL_AMOUNT, calculateBailAmount } from '../domain/property_rent.js';

export function sendToAudit(room: Room, playerId: string): void {
  const player = room.players.find((p) => p.id === playerId);
  if (!player) return;
  player.position = 10;
  player.auditTurnsLeft = 3;
  player.consecutiveDoubles = 0;
  player.auditCount = (player.auditCount ?? 0) + 1; // [IMP-226] Chỉ tăng tại thời điểm vào trạm
  room.phase = TurnPhase.PropertyManagement;
  if (room.roomCode) {
    turnStartedInAudit.set(room.roomCode, false);
  }
}

// Xóa bỏ hoàn toàn hàm dead code hasOwnedProperties

export function handleBailOut(
  room: Room | undefined,
  playerId: string,
  rolledThisTurn: boolean,
  _registry?: PropertyRegistry,
  _stateMap?: PropertyStateMap,
): { success: boolean; reason?: string } {
  if (!room?.started) return { success: false, reason: ActionRejectReason.INVALID_PLAYER };
  const current = room.players[room.currentPlayerIndex];
  if (current?.id !== playerId) return { success: false, reason: ActionRejectReason.INVALID_PLAYER };
  if (current.auditTurnsLeft <= 0) return { success: false, reason: 'NOT_IN_AUDIT' };

  const bailAmount = calculateBailAmount(current.auditCount ?? 1);

  if (current.balance < bailAmount) return { success: false, reason: ActionRejectReason.INSUFFICIENT_FUNDS };
  current.balance -= bailAmount;
  room.treasury = (room.treasury ?? 0) + bailAmount;
  current.auditTurnsLeft = 0;
  if (current.inAudit) current.inAudit = false;
  room.phase = rolledThisTurn ? TurnPhase.PropertyManagement : TurnPhase.WaitingRoll;
  return { success: true };
}

export function handleAuditTurnTransition(
  room: Room,
  player: Player,
  _registry?: PropertyRegistry,
  _stateMap?: PropertyStateMap,
): void {
  if (player.auditTurnsLeft > 0) {
    player.auditTurnsLeft -= 1;
    if (player.auditTurnsLeft === 0) {
      if (player.inAudit) player.inAudit = false;
      const penaltyAmount = calculateBailAmount(player.auditCount ?? 1);
      player.balance -= penaltyAmount;
      room.treasury = (room.treasury ?? 0) + penaltyAmount;
    }
  }
}
```

---

### Snippet 3.4: Bổ sung `auditCount` vào Player Entity, Delta & Parser [C4]
**File**: `src/domain/room.ts`
```typescript
export interface Player {
  // ...
  skipNextTurn:         boolean;
  auditTurnsLeft:       number;
  auditCount?:          number; // [IMP-226] Lũy kế số lần bị đưa vào Trạm Kiểm Toán
  consecutiveDoubles:   number;
}
```
Và trong `createPlayer`:
```typescript
    skipNextTurn: false, auditTurnsLeft: 0, auditCount: 0, consecutiveDoubles: 0,
```

**File**: `src/server/session_manager.ts` (Giữ nguyên <= 397 LOC)
```typescript
export interface PlayerDelta {
  readonly id: string; readonly position: number; readonly balance: number;
  readonly bankrupt?: boolean; readonly isBot?: boolean; readonly overdraftRoundsLeft?: number;
  readonly inAudit?: boolean; readonly auditTurnsLeft?: number; readonly auditCount?: number; readonly skipNextTurn?: boolean;
  readonly consecutiveDoubles?: number; readonly extraTurns?: number;
  readonly bondContract?: BondContract | null; readonly hand?: readonly ChanceCardId[];
}
```
Và trong `buildDeltaFromRoom`:
```typescript
    ...(p.auditTurnsLeft !== undefined ? { auditTurnsLeft: p.auditTurnsLeft } : {}),
    ...(p.auditCount !== undefined ? { auditCount: p.auditCount } : {}),
```

**File**: `src/server/network/delta_broadcaster.ts`
```typescript
  (a.auditTurnsLeft ?? 0) === (b.auditTurnsLeft ?? 0) &&
  (a.auditCount ?? 0) === (b.auditCount ?? 0) &&
```

**File**: `src/client/store/game_store_types.ts`
```typescript
export interface PlayerHudInfo {
  // ...
  readonly inAudit?: boolean;
  readonly auditTurnsLeft?: number;
  readonly auditCount?: number;
}
```

**File**: `src/client/network/apply_delta_players.ts`
```typescript
const OPTIONAL_PLAYER_KEYS = [
  'bankrupt', 'overdraftRoundsLeft', 'inAudit',
  'auditTurnsLeft', 'auditCount', 'skipNextTurn', 'consecutiveDoubles', 'extraTurns',
  'bondContract', 'hand',
] as const;
```

---

### Snippet 3.5: Giao diện ActionDock Động & A11y [C1, C5]
**File**: `src/client/ui/action_dock.tsx`  
**Toạ độ bao đóng**: Trong thân hàm `ActionDock`

```tsx
import { calculateBailAmount } from '../../domain/property_rent';
import { formatCurrency } from './ui_helpers';

// Trong thân hàm component ActionDock (khoảng dòng 90-95):
  const auditCount = actingPlayer?.auditCount ?? 1;
  const currentBailCost = calculateBailAmount(auditCount);
  const canAffordBail = (actingPlayer?.balance ?? 0) >= currentBailCost;
  const bailLabel = auditCount > 1
    ? (auditCount === 2 ? `Bảo Lãnh - Lần 2 (${formatCurrency(currentBailCost)})` : `Bảo Lãnh - Tái Phạm (${formatCurrency(currentBailCost)})`)
    : `Bảo Lãnh (${formatCurrency(currentBailCost)})`;
  const bailTitle = !canAffordBail
    ? `Bạn cần ít nhất ${formatCurrency(currentBailCost)} để nộp tiền bảo lãnh`
    : (auditCount > 1
        ? `Nộp ${formatCurrency(currentBailCost)} bảo lãnh tái phạm (Lần ${auditCount}) để rời trạm ngay`
        : `Nộp ${formatCurrency(currentBailCost)} bảo lãnh kiểm toán để rời trạm ngay`);

// Khối JSX render nút Bảo Lãnh (dòng 254-270):
      {inAudit && isMyTurn && !isBankrupt && (
        <button
          type="button"
          onClick={() => canAffordBail && onBailOut?.()}
          disabled={!canAffordBail}
          title={bailTitle}
          className={`w-11 h-11 min-w-[44px] min-h-[44px] sm:w-auto sm:h-auto p-0 sm:px-3.5 sm:py-2 shrink-0 whitespace-nowrap flex items-center justify-center gap-1.5 rounded-2xl font-bold border text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
            !canAffordBail
              ? 'bg-slate-200 text-slate-400 border-slate-300 shadow-none cursor-not-allowed active:scale-100'
              : 'bg-amber-600 hover:bg-amber-700 text-white border-amber-800 shadow-sm active:scale-95 cursor-pointer'
          }`}
          aria-label="Nộp bảo lãnh kiểm toán để rời trạm ngay"
          data-testid="bailout-btn"
        >
          <span aria-hidden="true">⚖️</span>
          <span className="hidden sm:inline">{bailLabel}</span>
          <span className="sm:hidden text-xs font-bold">{formatCurrency(currentBailCost)}</span>
        </button>
      )}
```

---

### Snippet 3.6: Chuẩn Hóa Activity Badge & Activity Feed [C1]
**File**: `src/client/network/activity_badge_dispatcher.ts`
```typescript
function handleBailBadge(act: ActivityLogEntry, state: GameState): void {
  const amount = act.amount !== undefined ? -Math.abs(act.amount) : -MIN_BAIL_AMOUNT;
  const isTimeout = act.message.includes('Hết 3 lượt') || act.message.includes('bắt buộc');
  const formula = isTimeout
    ? 'Hết 3 lượt không ra đôi: Phạt bảo lãnh bắt buộc'
    : (Math.abs(amount) > MIN_BAIL_AMOUNT
        ? `Bảo lãnh tái phạm: Khung ${formatCurrency(Math.abs(amount))} Tr. ➔ Kho Bạc`
        : `Bảo lãnh chuẩn: Khung ${formatCurrency(MIN_BAIL_AMOUNT)} Tr. ➔ Kho Bạc`);
  state.addFloatingText({
    text: formatCurrency(amount), type: FloatingTextType.Penalty, playerId: act.playerId ?? '', actionType: 'bail',
    title: isTimeout ? 'Cưỡng chế kiểm toán ➔ Nộp Kho Bạc' : 'Bảo lãnh kiểm toán (Ô 10) ➔ Nộp Kho Bạc',
    cellIndex: act.cellIndex ?? 10, formula, bailKind: isTimeout ? 'forced' : 'voluntary',
  });
}
```

**File**: `src/client/network/activity_rent_matcher.ts`
```typescript
  if (wasInAudit && absDiff >= 500) {
    const isTimeout = prevP?.auditTurnsLeft === 1 || prevP?.auditTurnsLeft === 0;
    const auditCount = prevP?.auditCount ?? 1;
    const bailDesc = isTimeout
      ? 'Hết 3 lượt không ra đôi: Phạt bảo lãnh bắt buộc'
      : (auditCount > 1 ? `Bảo Lãnh Tái Phạm (Lần ${auditCount})` : 'Bảo Lãnh Kiểm Toán để rời Trạm');
    return {
      id: `bail_${Date.now()}_${payer.id}`, timestamp: Date.now(), type: 'bail',
      message: `⚖️ ${pName} đã nộp phí / nộp thuế ${formatCurrency(absDiff)} (${bailDesc})`,
      playerId: payer.id, playerName: pName, cellIndex: 10, amount: payer.diff,
      ...(payer.pInfo?.tokenColor ? { playerTokenColor: payer.pInfo.tokenColor } : {}),
    };
  }
```

---

## 4. MA TRẬN 16 CONTRACT TEST CASES (UNIVERSAL 5-FACET MATRIX)

**Tệp kiểm thử hợp đồng**: `tests/contracts/imp226_escalating_audit_bailout.test.ts`

| Mã Test | Facet Kiểm Thử | Kịch Bản & Khẳng Định Nghiệp Vụ (Behavioral Assertions) |
| :--- | :--- | :--- |
| **TC-226.01** | Facet 1: Tier Boundaries | `calculateBailAmount(1)` trả về 500 Tr. VNĐ cho lần đầu vi phạm. |
| **TC-226.02** | Facet 1: Tier Boundaries | `calculateBailAmount(2)` trả về 1.000 Tr. VNĐ cho lần tái phạm thứ hai. |
| **TC-226.03** | Facet 1: Tier Boundaries | `calculateBailAmount(3)` và `calculateBailAmount(5)` trả về trần 2.000 Tr. VNĐ cho các lần tái phạm tiếp theo. |
| **TC-226.04** | Facet 1: Tier Boundaries | `calculateBailAmount(undefined)` và `calculateBailAmount(0)` an toàn trả về 500 Tr. VNĐ (Fallback Guard). |
| **TC-226.05** | Facet 2: Server Bail Execution | Người chơi vào trạm lần 1 nộp bảo lãnh: trừ chính xác 500 Tr., Kho Bạc tăng 500 Tr., xóa án kiểm toán. |
| **TC-226.06** | Facet 2: Repeat Bail Execution | Người chơi tái phạm lần 2 (`auditCount = 2`) nộp bảo lãnh: trừ chính xác 1.000 Tr., Kho Bạc tăng 1.000 Tr. |
| **TC-226.07** | Facet 2: Third Offense Execution| Người chơi tái phạm lần 3 (`auditCount = 3`) nộp bảo lãnh: trừ chính xác 2.000 Tr. |
| **TC-226.08** | Facet 2: Timeout Transition | Hết 3 lượt không ra đôi tại lần 2: `handleAuditTurnTransition` tự động phạt cưỡng chế đúng 1.000 Tr. nộp Kho Bạc. |
| **TC-226.09** | Facet 3: Counter Lifecycle | `auditCount` chỉ tăng trong `sendToAudit`, không bị tăng đúp khi gọi `handleBailOut` hoặc `handleAuditTurnTransition`. |
| **TC-226.10** | Facet 3: Full Pipeline Sync | `auditCount` được truyền từ `Room.player` ➔ `PlayerDelta` ➔ `buildSparseDelta` ➔ `applyDeltaPlayers` ➔ `PlayerHudInfo`. |
| **TC-226.11** | Facet 4: ActionDock Labels | Lần 1: ActionDock hiển thị nhãn `Bảo Lãnh (500)` và `disabled = false` khi `balance >= 500`. |
| **TC-226.12** | Facet 4: ActionDock Repeat Labels| Lần 2: ActionDock hiển thị nhãn `Bảo Lãnh - Lần 2 (1.000)`, khóa nút nếu `balance = 700` (`< 1000`). |
| **TC-226.13** | Facet 4: ActionDock Tái Phạm | Lần 3+: ActionDock hiển thị nhãn `Bảo Lãnh - Tái Phạm (2.000)` và tooltip giải thích chi tiết. |
| **TC-226.14** | Facet 4: Mobile Ergonomics | Trên Mobile viewport 360px: ActionDock hiển thị `⚖️ 1.000`, đạt sàn chạm `min-h-[44px] min-w-[44px]`. |
| **TC-226.15** | Facet 5: Activity Log & Floating | Log hoạt động và FloatingBadge hiển thị đúng nhãn `Bảo Lãnh Tái Phạm (Lần 2)` và số tiền âm 1.000 Tr. |
| **TC-226.16** | Facet 5: Bot AI Decision Parity | `decideAuditBailout` trong `bot_audit.ts` nhận diện chính xác chi phí 1.000 Tr. cho Bot tái phạm lần 2 và từ chối khi không đủ đệm an toàn. |

---

## 5. QUY TRÌNH THỰC THI 3 TRẠM (AUTONOMOUS PIPELINE)

1. Phê duyệt Kế hoạch (đã qua kiểm định `plan-griller` và tiếp thu C1–C5).
2. **Trạm 1 (QA RED)**: `qa-tester` tạo `tests/contracts/imp226_escalating_audit_bailout.test.ts` (16 test cases, chứng minh Inversion Gate RED), đồng thời reconcile các assertions lỗi thời trong `imp192a_anti_camping_audit.test.ts`.
3. **Trạm 2 (GREEN)**: `implementer` cập nhật mã nguồn theo Snippets 3.1–3.6 để đạt 16/16 GREEN và bảo toàn toàn bộ test suite.
4. **Trạm 2.5 (Scout)**: `scout` quét 5 archetypes lỗi, kiểm tra ngân sách LOC (`session_manager.ts` <= 397 LOC).
5. **Trạm 3 (Review)**: `spec-reviewer` và `ui-craft-reviewer` kiểm định độc lập trên physical disk.
