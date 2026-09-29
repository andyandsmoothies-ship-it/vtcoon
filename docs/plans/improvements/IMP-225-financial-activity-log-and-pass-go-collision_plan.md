# KẾ HOẠCH TRIỂN KHAI — IMP-225 (HIỆU CHỈNH TOÀN DIỆN SAU PHẢN BIỆN NGƯỜI DÙNG)

> **Mã Ticket**: `IMP-225` | **Loại Thay Đổi**: Tier 2 (Full Rigor - Network / Activity Stream / Financial Matcher)  
> **Mục Tiêu**: Giải quyết triệt để sự cố va chạm dòng tiền khi người chơi vừa vượt ô Bắt Đầu (nhận lương GO) vừa dẫm vào BĐS có nhà (trả tiền thuê) trong cùng 1 tick; tách submodule `activity_rent_matcher.ts` để đưa cả 2 tệp về <= 250 dòng (dưới trần 400 LOC); bảo toàn 100% tính bất biến (immutability) và tương thích ngược; chuẩn hóa toàn diện 6 ca suy biến tài chính.

---

## 1. TIẾP THU TOÀN DIỆN 5 ĐIỂM PHẢN BIỆN CỦA NGƯỜI DÙNG (P1–P5)

1. **[C1 - Blocker P1 Constants Resolution]**:
   - `CHANCE_MARKET_CELLS`: Khai báo tập trung SSOT `export const CHANCE_MARKET_CELLS = new Set<number>([2, 7, 17, 22, 33, 36]);` ngay trong `activity_rent_matcher.ts`.
   - `PORT_CELLS`: Thay thế hoàn toàn bằng `AIRPORT_CELLS` import trực tiếp từ `../telemetry/telemetry_expected_delta.js` (hoặc `RAILROAD_CELLS` từ `../../domain/property_data.js`), triệt tiêu hoàn toàn lỗi import ghost constant.
2. **[C2 - Blocker P2 Pure Functional Immutability for BalanceDelta]**:
   - Bảo toàn 100% `readonly diff: number;` trong `BalanceDelta`.
   - Tuyệt đối CẤM mutate in-place (`receivers[i].diff = ...`).
   - Hàm `extractPassedGoActivities` trả về `{ salaryLogs: ActivityLogEntry[]; payers: BalanceDelta[]; receivers: BalanceDelta[] }` bằng cách tạo bản sao đối tượng mới (`{ ...p, diff: newDiff }`), đáp ứng trọn vẹn TypeScript strict mode.
3. **[C3 - P3 ProcessReceiverReward Signature & Export Guard]**:
   - `processReceiverReward` giữ nguyên 2 tham số bắt buộc gốc `(receiver, context)` và bổ sung 2 tham số tùy chọn `(delta?, prevState?)` cho các tính năng mới (Kho Bạc, Viettel).
   - Re-export từ `activity_financial_tracker.ts` để phục vụ test mở rộng, không làm ảnh hưởng các suite cũ.
4. **[C4 - P4 Loại bỏ Banned Static Checklist Test TC-225.16]**:
   - Xóa bỏ hoàn toàn bài test đếm LOC file tĩnh `TC-225.16` vi phạm GEMINI.md §1.
   - Thay thế bằng bài test nghiệp vụ biên thực tế:
     * **TC-225.16**: Con nợ vượt GO (+2.000) đồng thời bị thu hồi khoản vay thấu chi `CC_OVERDRAFT` (-3.300) và phải trả tiền thuê đất (-1.500) -> Hệ thống bóc tách chính xác 3 dòng: Lương GO (+2.000), Thu nợ thấu chi (-3.300) và Tiền thuê đất (-1.500).
5. **[C5 - P5 Khử False Positive Cước Viettel Ô 28]**:
   - Xóa bỏ điều kiện `payer.cellIndex === 28`. Dẫm ô 28 là phí dừng chân tiện ích phẳng (1.000/2.500/3.500 Tr.).
   - Chỉ nhận diện cước data Viettel 150 Tr. khi `payer.cellIndex !== undefined && CHANCE_MARKET_CELLS.has(payer.cellIndex)` và người nhận sở hữu Ô 28 với `receiver.diff === TELECOM_DATA_FEE` (150 Tr.).

---

## 2. SƠ ĐỒ DÒNG CHẢY DỮ LIỆU CHUẨN HÓA

```
[Server Turn Roll] ──(Passed GO: +2.000 Salary)──> [Player Balance Diff: -1.750]
                 ──(Landed Cell 6: -3.750 Rent)──> [Landlord Diff: +3.750]
                               │
                               ▼
        [detectFinancialAndStatusActivities (Trạm 4/5)]
                               │
              ┌────────────────┴────────────────┐
              ▼                                 ▼
   [extractPassedGoActivities]       [matchRentTransactions]
   • checkPassedGo(prev, new)         • Immutable Net Rent: -3.750
   • Pure new BalanceDelta objects    • Landlord Received: +3.750
   • Log: "🏁 Spunky Hamster đã       • Math.abs(-3.750) === +3.750 (KHỚP 100%!)
     vượt GO và nhận 2.000 lương"     • Log: "Spunky Hamster đã trả 3.750
                                        tiền thuê cho Bot AI 3"
              │                                 │
              └────────────────┬────────────────┘
                               ▼
            [dispatchActivityFloatingBadges]
            • Reward Badge: +2.000 Lương GO (delayed by pawn landing)
            • Penalty Badge: -3.750 Trả Thuê (slump_recoil + sound)
            • Landlord Victory Spin (victory_spin + chime)
```

---

## 3. NGÂN SÁCH LOC (PHYSICAL LOC BUDGETS)

| Tệp Vật Lý | Phân Loại | LOC Trước Refactor | LOC Sau Refactor | Ngân Sách Trần |
| :--- | :---: | :---: | :---: | :---: |
| `src/client/network/activity_financial_tracker.ts` | Tier 1 (Logic) | 338 | **~180** | <= 400 (Cảnh báo 300) |
| `src/client/network/activity_rent_matcher.ts` *(Mới)* | Tier 1 (Logic) | 0 | **~240** | <= 400 (Cảnh báo 300) |
| `src/client/network/activity_badge_dispatcher.ts` | Tier 1 (Logic) | 277 | **~290** | <= 400 (Cảnh báo 300) |
| `src/client/store/activity_store.ts` | Tier 1 (Store) | 141 | **~145** | <= 400 (Cảnh báo 300) |
| `src/client/ui/activity_feed_sidebar.tsx` | Tier 2 (UI) | 333 | **~336** | <= 500 (Cảnh báo 400) |

---

## 4. CHI TIẾT CÁC ĐOẠN MÃ TRIỂN KHAI (DROP-IN CODE SNIPPETS)

### Snippet 4.1: Tạo mới `src/client/network/activity_rent_matcher.ts`
Chứa toàn bộ logic trích xuất tiền lương GO thuần hàm (pure functional), khớp tiền thuê đa tầng, xử lý phí nộp và thưởng:

```typescript
// [UI-S06/MSS][IMP-225] ActivityRentMatcher — Multi-layered rent matching, GO salary & fee processor
import type { DeltaPayload } from '../../server/session_manager.js';
import type { GameState, PlayerHudInfo } from '../store/game_store.js';
import { type ActivityLogEntry } from '../store/activity_store.js';
import { checkPassedGo, calculateGoSalary } from '../../domain/room.js';
import { formatCurrency } from '../ui/ui_helpers.js';
import { PROPERTY_DEEDS } from '../../domain/property_data.js';
import { TELECOM_DATA_FEE } from '../../domain/property_rent.js';
import { AIRPORT_CELLS } from '../telemetry/telemetry_expected_delta.js';

export const CHANCE_MARKET_CELLS = new Set<number>([2, 7, 17, 22, 33, 36]);

export interface BalanceDelta {
  readonly id: string;
  readonly diff: number;
  readonly pInfo?: PlayerHudInfo;
  readonly cellIndex?: number;
}

export interface PropertyFinancialContext {
  readonly boughtCellIndices: readonly number[];
  readonly buyoutCellIndices?: readonly number[];
  readonly upgradedCells: ReadonlyArray<{ cellIndex: number; cost: number; ownerId: string }>;
  readonly mortgagedCells: ReadonlyArray<{ cellIndex: number; loan: number; ownerId: string }>;
  readonly unmortgagedCells: ReadonlyArray<{ cellIndex: number; cost: number; ownerId: string }>;
}

export function getPlayerName(pInfo?: PlayerHudInfo, fallbackId?: string): string {
  return pInfo?.name || (fallbackId ? fallbackId.toUpperCase() : 'Người chơi');
}

export interface PassedGoExtractionResult {
  readonly salaryLogs: ActivityLogEntry[];
  readonly payers: BalanceDelta[];
  readonly receivers: BalanceDelta[];
  readonly handledReceiverIds: Set<string>;
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
    return {
      salaryLogs: [],
      payers: [...initialPayers],
      receivers: [...initialReceivers],
      handledReceiverIds: new Set(initialHandledReceiverIds),
    };
  }

  const salaryLogs: ActivityLogEntry[] = [];
  let payers = [...initialPayers];
  let receivers = [...initialReceivers];
  const handledReceiverIds = new Set(initialHandledReceiverIds);

  for (const p of delta.players) {
    const prevPos = prevState.playerPositions[p.id];
    const newPos = p.position;
    if (prevPos === undefined || prevPos === newPos) continue;

    const prevP = prevState.playersInfo[p.id];
    const isSentToAudit = Boolean(p.inAudit === true || (p.auditTurnsLeft && p.auditTurnsLeft > 0));
    if (isSentToAudit) continue;

    if (checkPassedGo(prevPos, newPos)) {
      const round = delta.roundNumber ?? prevState.roundNumber ?? 1;
      const salary = calculateGoSalary(round);
      const pInfo = nextState.playersInfo[p.id] ?? prevP;
      const pName = getPlayerName(pInfo, p.id);

      salaryLogs.push({
        id: `salary_${Date.now()}_${p.id}`,
        timestamp: Date.now(),
        type: 'salary',
        message: `🏁 ${pName} đã vượt qua ô Bắt Đầu và nhận ${formatCurrency(salary)} tiền lương`,
        playerId: p.id,
        playerName: pName,
        amount: salary,
        ...(pInfo?.tokenColor ? { playerTokenColor: pInfo.tokenColor } : {}),
      });

      const recIdx = receivers.findIndex((r) => r.id === p.id);
      if (recIdx !== -1) {
        const currentDiff = receivers[recIdx]!.diff;
        if (currentDiff === salary) {
          handledReceiverIds.add(p.id);
        } else if (currentDiff > salary) {
          receivers[recIdx] = { ...receivers[recIdx]!, diff: currentDiff - salary };
        } else {
          const rentDeficit = currentDiff - salary;
          receivers = receivers.filter((_, idx) => idx !== recIdx);
          payers.push({
            id: p.id,
            diff: rentDeficit,
            pInfo: prevP,
            cellIndex: newPos,
          });
        }
      } else {
        const payIdx = payers.findIndex((py) => py.id === p.id);
        if (payIdx !== -1) {
          payers[payIdx] = { ...payers[payIdx]!, diff: payers[payIdx]!.diff - salary };
        } else {
          payers.push({
            id: p.id,
            diff: -salary,
            pInfo: prevP,
            cellIndex: newPos,
          });
        }
      }
    }
  }

  return { salaryLogs, payers, receivers, handledReceiverIds };
}

/**
 * Khớp giao dịch tiền thuê đa tầng: Khớp 1-1, Chia phí cảng (CC_PORT_EXCLUSIVE), Cước Viettel, và Con nợ âm vốn.
 */
export function matchRentTransactions(
  payers: readonly BalanceDelta[],
  receivers: readonly BalanceDelta[],
  initialHandledPayers?: ReadonlySet<string>,
  initialHandledReceivers?: ReadonlySet<string>,
  prevState?: GameState,
): {
  rentLogs: ActivityLogEntry[];
  handledPayerIds: Set<string>;
  handledReceiverIds: Set<string>;
} {
  const rentLogs: ActivityLogEntry[] = [];
  const handledPayerIds = new Set<string>(initialHandledPayers ?? []);
  const handledReceiverIds = new Set<string>(initialHandledReceivers ?? []);

  // [IMP-225/C5] Nhận diện cước viễn thông Viettel Ô 28 (150 Tr.) CHỈ khi người chơi dừng ở ô Chance/Market
  for (const payer of payers) {
    if (handledPayerIds.has(payer.id)) continue;
    if (payer.cellIndex !== undefined && CHANCE_MARKET_CELLS.has(payer.cellIndex)) {
      const viettelOwnerReceiver = receivers.find(
        (r) => !handledReceiverIds.has(r.id) && r.diff === TELECOM_DATA_FEE && prevState?.playersInfo[r.id]?.ownedProperties?.includes(28)
      );
      if (viettelOwnerReceiver) {
        const payerName = getPlayerName(payer.pInfo, payer.id);
        const receiverName = getPlayerName(viettelOwnerReceiver.pInfo, viettelOwnerReceiver.id);
        rentLogs.push({
          id: `viettel_${Date.now()}_${payer.id}_${viettelOwnerReceiver.id}`,
          timestamp: Date.now(),
          type: 'system',
          message: `📡 ${payerName} đã thanh toán ${formatCurrency(TELECOM_DATA_FEE)} cước data viễn thông Viettel cho ${receiverName}`,
          playerId: payer.id,
          playerName: payerName,
          targetPlayerId: viettelOwnerReceiver.id,
          targetPlayerName: receiverName,
          amount: -TELECOM_DATA_FEE,
          cellIndex: 28,
          ...(payer.pInfo?.tokenColor ? { playerTokenColor: payer.pInfo.tokenColor } : {}),
        });
        handledPayerIds.add(payer.id);
        handledReceiverIds.add(viettelOwnerReceiver.id);
      }
    }
  }

  for (const payer of payers) {
    if (handledPayerIds.has(payer.id)) continue;
    const rentAmount = Math.abs(payer.diff);

    // 1. Khớp 1-1 chính xác
    const receiver = receivers.find((r) => !handledReceiverIds.has(r.id) && r.diff === rentAmount);
    if (receiver) {
      const payerName = getPlayerName(payer.pInfo, payer.id);
      const receiverName = getPlayerName(receiver.pInfo, receiver.id);
      rentLogs.push({
        id: `rent_${Date.now()}_${payer.id}_${receiver.id}`,
        timestamp: Date.now(),
        type: 'rent',
        message: `${payerName} đã trả ${formatCurrency(rentAmount)} tiền thuê cho ${receiverName}`,
        playerId: payer.id,
        playerName: payerName,
        targetPlayerId: receiver.id,
        targetPlayerName: receiverName,
        amount: -rentAmount,
        ...(payer.cellIndex !== undefined ? { cellIndex: payer.cellIndex } : {}),
        ...(payer.pInfo?.tokenColor ? { playerTokenColor: payer.pInfo.tokenColor } : {}),
      });
      handledPayerIds.add(payer.id);
      handledReceiverIds.add(receiver.id);
      continue;
    }

    // 2. Khớp chia đôi phí cảng (CC_PORT_EXCLUSIVE) với guard ô cảng chuẩn xác
    const isPort = payer.cellIndex !== undefined && AIRPORT_CELLS.has(payer.cellIndex);
    if (isPort) {
      const halfRent = Math.floor(rentAmount * 0.5);
      const halfReceivers = receivers.filter((r) => !handledReceiverIds.has(r.id) && r.diff === halfRent);
      if (halfReceivers.length >= 2) {
        const r1 = halfReceivers[0]!;
        const r2 = halfReceivers[1]!;
        const payerName = getPlayerName(payer.pInfo, payer.id);
        const r1Name = getPlayerName(r1.pInfo, r1.id);
        const r2Name = getPlayerName(r2.pInfo, r2.id);
        rentLogs.push({
          id: `rent_port_${Date.now()}_${payer.id}`,
          timestamp: Date.now(),
          type: 'rent',
          message: `⚓ ${payerName} đã trả ${formatCurrency(rentAmount)} phí cảng (chia đều cho ${r1Name} và ${r2Name})`,
          playerId: payer.id,
          playerName: payerName,
          targetPlayerId: r1.id,
          targetPlayerName: r1Name,
          amount: -rentAmount,
          ...(payer.cellIndex !== undefined ? { cellIndex: payer.cellIndex } : {}),
          ...(payer.pInfo?.tokenColor ? { playerTokenColor: payer.pInfo.tokenColor } : {}),
        });
        handledPayerIds.add(payer.id);
        handledReceiverIds.add(r1.id);
        handledReceiverIds.add(r2.id);
        continue;
      }
    }

    // 3. Khớp con nợ âm vốn (Insolvent Debtor)
    if (payer.cellIndex !== undefined && prevState) {
      const cellOwnerId = Object.keys(prevState.playersInfo).find((id) =>
        prevState.playersInfo[id]?.ownedProperties?.includes(payer.cellIndex!)
      );
      if (cellOwnerId && cellOwnerId !== payer.id) {
        const ownerReceiver = receivers.find((r) => r.id === cellOwnerId && !handledReceiverIds.has(r.id));
        if (ownerReceiver && ownerReceiver.diff > 0 && ownerReceiver.diff <= rentAmount) {
          const payerName = getPlayerName(payer.pInfo, payer.id);
          const receiverName = getPlayerName(ownerReceiver.pInfo, ownerReceiver.id);
          rentLogs.push({
            id: `rent_insolvent_${Date.now()}_${payer.id}_${cellOwnerId}`,
            timestamp: Date.now(),
            type: 'rent',
            message: `${payerName} (mất thanh khoản) đã nộp ${formatCurrency(ownerReceiver.diff)} tiền thuê cho ${receiverName}`,
            playerId: payer.id,
            playerName: payerName,
            targetPlayerId: cellOwnerId,
            targetPlayerName: receiverName,
            amount: -ownerReceiver.diff,
            cellIndex: payer.cellIndex,
            ...(payer.pInfo?.tokenColor ? { playerTokenColor: payer.pInfo.tokenColor } : {}),
          });
          handledPayerIds.add(payer.id);
          handledReceiverIds.add(cellOwnerId);
          continue;
        }
      }
    }
  }

  return { rentLogs, handledPayerIds, handledReceiverIds };
}

export function processPayerFee(
  payer: BalanceDelta,
  context: PropertyFinancialContext,
  delta?: DeltaPayload,
  prevState?: GameState,
): ActivityLogEntry | null {
  const absDiff = Math.abs(payer.diff);
  if (
    context.boughtCellIndices.length > 0 &&
    delta?.cells?.some((c) => c.ownerId === payer.id && context.boughtCellIndices.includes(c.index))
  ) {
    return null;
  }

  const isPurchase = context.boughtCellIndices.some((idx) => PROPERTY_DEEDS.get(idx)?.price === absDiff);
  if (isPurchase) return null;

  const isUpgrade = context.upgradedCells.some((u) => u.ownerId === payer.id && u.cost === absDiff);
  if (isUpgrade) return null;

  const isUnmortgage = context.unmortgagedCells.some(
    (um) => um.ownerId === payer.id && Math.abs(um.cost - absDiff) <= 50,
  );
  if (isUnmortgage) return null;

  const pName = getPlayerName(payer.pInfo, payer.id);

  // Ô 04: Lệ Phí Đăng Ký Đất Đai
  const deltaP = delta?.players?.find((p) => p.id === payer.id);
  const currentPos = deltaP?.position ?? prevState?.playerPositions[payer.id] ?? payer.cellIndex;
  if (currentPos === 4) {
    return {
      id: `tax_${Date.now()}_${payer.id}`,
      timestamp: Date.now(),
      type: 'tax',
      message: `🏛️ ${pName} đã nộp phí / nộp thuế ${formatCurrency(absDiff)} (Lệ Phí Đăng Ký Đất Đai)`,
      playerId: payer.id,
      playerName: pName,
      cellIndex: 4,
      amount: payer.diff,
      ...(payer.pInfo?.tokenColor ? { playerTokenColor: payer.pInfo.tokenColor } : {}),
    };
  }

  // Ô 10: Tiền Bảo Lãnh Kiểm Toán
  const prevP = prevState?.playersInfo[payer.id];
  const wasInAudit = Boolean(prevP?.inAudit || (prevP?.auditTurnsLeft && prevP.auditTurnsLeft > 0));
  if (wasInAudit && absDiff >= 500) {
    const isTimeout = prevP?.auditTurnsLeft === 1 || prevP?.auditTurnsLeft === 0;
    const bailDesc = isTimeout
      ? 'Hết 3 lượt không ra đôi: Phạt bảo lãnh bắt buộc'
      : 'Bảo Lãnh Kiểm Toán để rời Trạm';
    return {
      id: `bail_${Date.now()}_${payer.id}`,
      timestamp: Date.now(),
      type: 'bail',
      message: `⚖️ ${pName} đã nộp phí / nộp thuế ${formatCurrency(absDiff)} (${bailDesc})`,
      playerId: payer.id,
      playerName: pName,
      cellIndex: 10,
      amount: payer.diff,
      ...(payer.pInfo?.tokenColor ? { playerTokenColor: payer.pInfo.tokenColor } : {}),
    };
  }

  return {
    id: `tax_${Date.now()}_${payer.id}`,
    timestamp: Date.now(),
    type: 'tax',
    message: `${pName} đã nộp phí / nộp thuế ${formatCurrency(absDiff)}`,
    playerId: payer.id,
    playerName: pName,
    amount: payer.diff,
    ...(payer.cellIndex !== undefined ? { cellIndex: payer.cellIndex } : {}),
    ...(payer.pInfo?.tokenColor ? { playerTokenColor: payer.pInfo.tokenColor } : {}),
  };
}

export function processReceiverReward(
  receiver: BalanceDelta,
  context: PropertyFinancialContext,
  delta?: DeltaPayload,
  prevState?: GameState,
): ActivityLogEntry | null {
  const isMortgageLoan = context.mortgagedCells.some(
    (m) => m.ownerId === receiver.id && m.loan === receiver.diff,
  );
  if (isMortgageLoan) return null;

  const rName = getPlayerName(receiver.pInfo, receiver.id);

  // [IMP-225] Nhận diện Gói Kích Cầu Kho Bạc
  if (delta?.treasury !== undefined && prevState && prevState.treasuryPool > delta.treasury) {
    return {
      id: `stimulus_${Date.now()}_${receiver.id}`,
      timestamp: Date.now(),
      type: 'system',
      message: `🏛️ [Kích Cầu Kho Bạc] ${rName} đã nhận được ${formatCurrency(receiver.diff)} trợ cấp phục hồi kinh tế`,
      playerId: receiver.id,
      playerName: rName,
      amount: receiver.diff,
      ...(receiver.pInfo?.tokenColor ? { playerTokenColor: receiver.pInfo.tokenColor } : {}),
    };
  }

  return {
    id: `reward_${Date.now()}_${receiver.id}`,
    timestamp: Date.now(),
    type: 'system',
    message: `${rName} đã nhận được ${formatCurrency(receiver.diff)} tiền thưởng`,
    playerId: receiver.id,
    playerName: rName,
    amount: receiver.diff,
    ...(receiver.pInfo?.tokenColor ? { playerTokenColor: receiver.pInfo.tokenColor } : {}),
  };
}

export function extractMiscellaneousBalances(
  payers: readonly BalanceDelta[],
  receivers: readonly BalanceDelta[],
  handledPayerIds: Set<string>,
  handledReceiverIds: Set<string>,
  context: PropertyFinancialContext,
  delta?: DeltaPayload,
  prevState?: GameState,
): ActivityLogEntry[] {
  const logs: ActivityLogEntry[] = [];
  for (const payer of payers) {
    if (handledPayerIds.has(payer.id)) continue;
    const feeLog = processPayerFee(payer, context, delta, prevState);
    if (feeLog) logs.push(feeLog);
  }
  for (const receiver of receivers) {
    if (handledReceiverIds.has(receiver.id)) continue;
    const rewardLog = processReceiverReward(receiver, context, delta, prevState);
    if (rewardLog) logs.push(rewardLog);
  }
  return logs;
}
```

### Snippet 4.2: Tinh gọn `src/client/network/activity_financial_tracker.ts`
Re-export 100% chữ ký cũ và thu gọn file về ~180 LOC:

```typescript
// [UI-S06/MSS][IMP-225] ActivityFinancialTracker — Financial event dispatcher & M&A tracker
import type { DeltaPayload } from '../../server/session_manager.js';
import type { GameState } from '../store/game_store.js';
import { type ActivityLogEntry } from '../store/activity_store.js';
import { PROPERTY_DEEDS } from '../../domain/property_data.js';
import { BOARD_CONFIG } from '../../domain/board_config.js';
import { formatCurrency } from '../ui/ui_helpers.js';
import { checkPassedGo } from '../../domain/room.js';
import {
  extractPassedGoActivities,
  matchRentTransactions,
  processPayerFee,
  processReceiverReward,
  extractMiscellaneousBalances,
  getPlayerName,
  type BalanceDelta,
  type PropertyFinancialContext,
} from './activity_rent_matcher.js';

export {
  matchRentTransactions,
  processPayerFee,
  processReceiverReward,
  extractMiscellaneousBalances,
  getPlayerName,
  type BalanceDelta,
  type PropertyFinancialContext,
};

let lastProcessedHoseKey: string | null = null;
export function resetHoseActivityTracker(): void {
  lastProcessedHoseKey = null;
}

export function detectFinancialAndStatusActivities(
  delta: DeltaPayload,
  prevState: GameState,
  nextState: GameState,
  contextOrBoughtIndices: PropertyFinancialContext | readonly number[],
): ActivityLogEntry[] {
  if (!delta.players || delta.players.length === 0) return [];
  const entries: ActivityLogEntry[] = [];
  let payers: BalanceDelta[] = [];
  let receivers: BalanceDelta[] = [];
  const context: PropertyFinancialContext = Array.isArray(contextOrBoughtIndices)
    ? {
        boughtCellIndices: contextOrBoughtIndices,
        buyoutCellIndices: [],
        upgradedCells: [],
        mortgagedCells: [],
        unmortgagedCells: [],
      }
    : (contextOrBoughtIndices as PropertyFinancialContext);

  for (const p of delta.players) {
    const prevP = prevState.playersInfo[p.id];
    if (p.bankrupt === true && !prevP?.bankrupt) {
      const pName = getPlayerName(prevP, p.id);
      entries.push({
        id: `bankrupt_${Date.now()}_${p.id}`,
        timestamp: Date.now(),
        type: 'bankrupt',
        message: `🚨 ${pName} đã tuyên bố PHÁ SẢN và rời khỏi ván đấu!`,
        playerId: p.id,
        playerName: pName,
        ...(prevP?.tokenColor ? { playerTokenColor: prevP.tokenColor } : {}),
      });
    }

    const prevPos = prevState.playerPositions[p.id];
    const hasPassedGo = prevPos !== undefined && p.position !== undefined && checkPassedGo(prevPos, p.position);

    if (prevP && (prevP.balance !== p.balance || hasPassedGo)) {
      const diff = p.balance - prevP.balance;
      const playerPos = p.position ?? (nextState.playersInfo[p.id] as { position?: number } | undefined)?.position ?? nextState.playerPositions?.[p.id] ?? prevState.playerPositions?.[p.id];
      if (diff < 0) payers.push({ id: p.id, diff, pInfo: prevP, cellIndex: playerPos });
      else if (diff > 0) receivers.push({ id: p.id, diff, pInfo: nextState.playersInfo[p.id] ?? prevP, cellIndex: playerPos });
      else if (hasPassedGo) {
        payers.push({ id: p.id, diff: 0, pInfo: prevP, cellIndex: playerPos });
      }
    }
  }

  let handledReceiverIds = new Set<string>();

  // [IMP-225] Bước 1: Tách độc lập lương Vượt GO (Pure Functional)
  const salaryResult = extractPassedGoActivities(delta, prevState, nextState, payers, receivers, handledReceiverIds);
  entries.push(...salaryResult.salaryLogs);
  payers = salaryResult.payers;
  receivers = salaryResult.receivers;
  handledReceiverIds = salaryResult.handledReceiverIds;

  const handledPayerIds = new Set<string>();

  // Bước 2: Xử lý M&A Buyout
  if (context.buyoutCellIndices && context.buyoutCellIndices.length > 0 && delta.cells && delta.cells.length > 0) {
    for (const buyoutIndex of context.buyoutCellIndices) {
      const cellDelta = delta.cells.find((c) => c.index === buyoutIndex);
      if (!cellDelta?.ownerId) continue;
      const buyerId = cellDelta.ownerId;
      const prevOwner = Object.values(prevState.playersInfo).find((p) => p.ownedProperties?.includes(buyoutIndex));
      const targetScopeId = (delta.lastEventCard as { targetScope?: string } | undefined)?.targetScope;
      const sellerId = prevOwner?.id ?? (targetScopeId && targetScopeId in prevState.playersInfo ? targetScopeId : undefined);

      const payer = payers.find((p) => p.id === buyerId && !handledPayerIds.has(p.id));
      const receiver = sellerId ? receivers.find((r) => r.id === sellerId && !handledReceiverIds.has(r.id)) : undefined;

      const buyerInfo = nextState.playersInfo[buyerId] ?? prevState.playersInfo[buyerId];
      const buyerName = getPlayerName(buyerInfo, buyerId);
      const sellerInfo = sellerId ? (nextState.playersInfo[sellerId] ?? prevState.playersInfo[sellerId]) : undefined;
      const sellerName = sellerId ? getPlayerName(sellerInfo, sellerId) : 'đối thủ';
      const cellName = BOARD_CONFIG[buyoutIndex]?.name ?? `Ô #${buyoutIndex}`;
      const amount = payer ? Math.abs(payer.diff) : (receiver ? receiver.diff : (PROPERTY_DEEDS.get(buyoutIndex)?.price ?? 0));

      entries.push({
        id: `ma_buyout_${Date.now()}_${buyoutIndex}_${buyerId}`,
        timestamp: Date.now(),
        type: 'card',
        message: `⚡ [M&A] ${buyerName} đã chi trả ${formatCurrency(amount)} thâu tóm ${cellName} từ ${sellerName}`,
        playerId: buyerId,
        playerName: buyerName,
        amount: -amount,
        cellIndex: buyoutIndex,
        ...(buyerInfo?.tokenColor ? { playerTokenColor: buyerInfo.tokenColor } : {}),
      });

      if (payer) handledPayerIds.add(payer.id);
      if (receiver) handledReceiverIds.add(receiver.id);
    }
  }

  // Bước 3: Mua đất thường
  if (context.boughtCellIndices && delta.cells) {
    for (const boughtIndex of context.boughtCellIndices) {
      const cellDelta = delta.cells.find((c) => c.index === boughtIndex);
      if (!cellDelta?.ownerId) continue;
      const prevOwnerId = Object.keys(prevState.playersInfo).find((id) =>
        prevState.playersInfo[id]?.ownedProperties.includes(boughtIndex),
      );
      if (prevOwnerId && prevOwnerId !== cellDelta.ownerId) {
        handledPayerIds.add(cellDelta.ownerId);
        handledReceiverIds.add(prevOwnerId);
      }
    }
  }

  // Bước 4: Khớp tiền thuê đa tầng
  const { rentLogs, handledPayerIds: rentPayers, handledReceiverIds: rentReceivers } = matchRentTransactions(
    payers,
    receivers,
    handledPayerIds,
    handledReceiverIds,
    prevState,
  );
  entries.push(...rentLogs);
  for (const id of rentPayers) handledPayerIds.add(id);
  for (const id of rentReceivers) handledReceiverIds.add(id);

  // Bước 5: HOSE
  if (delta.lastHoseResult) {
    const hr = delta.lastHoseResult;
    const hoseKey = `${hr.playerId}_${hr.timestamp}_${hr.roll}`;
    if (lastProcessedHoseKey !== hoseKey) {
      lastProcessedHoseKey = hoseKey;
      const pInfo = nextState.playersInfo[hr.playerId] ?? prevState.playersInfo[hr.playerId];
      const pName = hr.playerName ?? getPlayerName(pInfo, hr.playerId);
      const multiplierPct = Math.round((hr.multiplier - 1) * 100);
      const sign = multiplierPct > 0 ? `+${multiplierPct}%` : multiplierPct < 0 ? `${multiplierPct}%` : 'Hòa vốn';
      const outcomeLabel =
        hr.profit > 0
          ? `Lãi +${formatCurrency(hr.profit)}`
          : hr.profit < 0
          ? `Lỗ -${formatCurrency(Math.abs(hr.profit))}`
          : 'Hòa vốn';
      const icon = hr.profit > 0 ? '📈' : hr.profit < 0 ? '📉' : '⚖️';

      entries.push({
        id: `hose_${hr.timestamp}_${hr.playerId}`,
        timestamp: hr.timestamp,
        type: 'hose',
        message: `${icon} [HOSE] ${pName} đầu tư ${formatCurrency(hr.stake)} ➔ Khớp lệnh Mặt ${hr.roll} (${sign}): Thu về ${formatCurrency(hr.payout)} (${outcomeLabel})`,
        playerId: hr.playerId,
        playerName: pName,
        amount: hr.profit,
        ...(pInfo?.tokenColor ? { playerTokenColor: pInfo.tokenColor } : {}),
      });
      handledPayerIds.add(hr.playerId);
      handledReceiverIds.add(hr.playerId);
    }
  }

  // Bước 6: Phí và thưởng vãng lai
  entries.push(...extractMiscellaneousBalances(payers, receivers, handledPayerIds, handledReceiverIds, context, delta, prevState));
  return entries;
}
```

### Snippet 4.3: Cập nhật `src/client/network/activity_badge_dispatcher.ts`
Bổ sung `handleSalaryBadge` đồng bộ nhịp hạ quân cờ và âm thanh `playVictoryChime`:

```typescript
function handleSalaryBadge(act: ActivityLogEntry, state: GameState): void {
  const amount = act.amount ?? 2000;
  const delay = getPawnLandingDelay(act.playerId);
  scheduleAction(() => {
    SoundEngine.playVictoryChime();
    state.addFloatingText({
      text: `+${formatCurrency(amount)}`,
      type: FloatingTextType.Reward,
      playerId: act.playerId ?? '',
      actionType: 'salary',
      title: 'Lương Vượt Ô Bắt Đầu',
      formula: 'Hoàn thành 1 vòng sa bàn (+2.000 Tr.)',
    });
  }, delay);
}

// Trong BADGE_HANDLERS:
salary: handleSalaryBadge,
```

### Snippet 4.4: Cập nhật `src/client/store/activity_store.ts`
Bổ sung `'salary'` vào `ActivityLogType`:
```typescript
export type ActivityLogType =
  | 'dice'
  | 'move'
  | 'buy'
  | 'upgrade'
  | 'rent'
  | 'tax'
  | 'bail'
  | 'card'
  | 'auction'
  | 'mortgage'
  | 'unmortgage'
  | 'bankrupt'
  | 'trade'
  | 'hose'
  | 'salary'
  | 'system';
```

### Snippet 4.5: Cập nhật `src/client/ui/activity_feed_sidebar.tsx`
Bổ sung case `'salary'` trả về icon lá cờ `🏁`:
```typescript
    case 'salary':
      return '🏁';
```

---

## 5. MA TRẬN 5 DIỆN KIỂM THỬ HỢP ĐỒNG (TC-225.01 .. TC-225.16)

| Mã Test | Diện Kiểm Thử (Facet) | Kịch Bản & Khẳng Định Mong Muốn (Expectation) |
| :--- | :--- | :--- |
| **TC-225.01** | Facet 1: Pass GO & Rent Collision | Vượt GO (Lương +2.000) và dẫm vào BĐS đối thủ (-3.750) -> Phát sinh 2 log: Lương GO +2.000 và Tiền thuê -3.750. |
| **TC-225.02** | Facet 1: Net Positive Rent | Vượt GO (+2.000) dẫm BĐS tiền thuê nhỏ hơn (-800) -> Net diff +1.200 -> Phát sinh đủ 2 log: Lương GO và Trả thuê. |
| **TC-225.03** | Facet 1: Exact Equal Collision | Vượt GO (+2.000) dẫm BĐS tiền thuê đúng bằng lương (-2.000) -> Net diff 0 -> Vẫn phát sinh đủ 2 log Lương và Thuê. |
| **TC-225.04** | Facet 1: Pure Pass GO | Vượt GO vào ô đất trống không có chủ -> Phát sinh log Lương GO chuẩn xác, không dùng từ "tiền thưởng". |
| **TC-225.05** | Facet 2: Port Exclusive Split | `CC_PORT_EXCLUSIVE` chia đôi phí cảng 50/50 -> Phát sinh log phí cảng chia đều cho 2 bên, không rơi vào "tiền thưởng". |
| **TC-225.06** | Facet 2: Insolvent Debtor Rent | Con nợ âm vốn chỉ trả được một phần tiền thuê -> Khớp đúng khoản thực nhận của chủ đất, không quy thành thuế. |
| **TC-225.07** | Facet 2: Service C2 Surcharge | Lô đất Dịch vụ C2 xúc xắc mặt chẵn thu phụ phí +200 Tr. -> Tiền thuê tổng hợp được nhận diện đầy đủ. |
| **TC-225.08** | Facet 2: Macro Modifier Multiplier | BĐS chịu ảnh hưởng `MACRO_LAND_FEVER` x2.5 -> Khớp số tiền thuê sau nhân x2.5 chuẩn xác. |
| **TC-225.09** | Facet 3: Utility Flat Fee | Dẫm ô Tiện ích EVN (12) hoặc Viettel (28) biểu phí phẳng (1.000 / 2.500 / 3.500) -> Khớp tiền thuê tiện ích chuẩn. |
| **TC-225.10** | Facet 3: Telecom Data Fee | Rút thẻ sự kiện phát sinh cước Viettel 150 Tr. -> Log ghi nhận "Cước data viễn thông Viettel", không dùng "tiền thưởng". |
| **TC-225.11** | Facet 3: Multi-Obligation GO Tax | Vượt GO chịu thuế đất `calculateGoPropertyTax` -> Lương và thuế được ghi nhận tách bạch minh bạch. |
| **TC-225.12** | Facet 3: Railroad ETC Surcharge | Ga hàng không / Sân bay có ETC (+50% phí) -> Khớp phí dịch vụ chính xác. |
| **TC-225.13** | Facet 4: Treasury Stimulus | Gói kích cầu Kho Bạc giải ngân -> Log mang nhãn "🏛️ [Kích Cầu Kho Bạc] ... trợ cấp phục hồi kinh tế". |
| **TC-225.14** | Facet 4: Stimulus & Rent Isolation | Kích cầu xảy ra đồng thời với lượt trả tiền thuê -> Tách biệt 2 giao dịch, không bị nuốt số dư. |
| **TC-225.15** | Facet 5: Visual Badge & Audio Sync | Va chạm Vượt GO + Trả thuê phát đủ Badge Lương (Reward) và Badge Thuê (Penalty với slump_recoil và âm thanh thud). |
| **TC-225.16** | Facet 5: Multi-Event Debt Recovery | Vượt GO (+2.000), thu hồi nợ thấu chi `CC_OVERDRAFT` (-3.300) và trả tiền thuê (-1.500) -> Tách đủ 3 log độc lập, không quy chụp thành thuế. |

---

## 6. QUY TRÌNH THỰC THI 3 TRẠM (AUTONOMOUS 3-STATION PIPELINE)

1. **Phê duyệt kế hoạch**: Đã tiếp thu 100% 5 điểm phản biện từ người dùng (P1–P5).
2. **Trạm 1 (QA RED)**: `qa-tester` tạo `tests/contracts/imp225_financial_activity_log_collision.test.ts` (16 test cases, chứng minh Inversion Gate RED).
3. **Trạm 2 (GREEN)**: `implementer` tạo `activity_rent_matcher.ts`, tinh gọn `activity_financial_tracker.ts`, cập nhật `activity_store.ts`, `activity_badge_dispatcher.ts`, `activity_feed_sidebar.tsx` để đạt 16/16 GREEN và giữ nguyên độ xanh của toàn bộ test cũ.
4. **Trạm 2.5 (Scout)**: `scout` quét 5 archetypes lỗi, kiểm tra `check:loc` và type safety.
5. **Trạm 3 (Review)**: `spec-reviewer` và `ui-craft-reviewer` thẩm định đĩa vật lý và snapshot bằng chứng.
