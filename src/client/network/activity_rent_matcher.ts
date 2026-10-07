// [UI-S06/MSS][IMP-225][IMP-289] ActivityRentMatcher — Multi-layered rent matching, GO salary & fee processor
import type { DeltaPayload } from '../../server/session_manager.js';
import type { GameState, PlayerHudInfo } from '../store/game_store.js';
import { type ActivityLogEntry } from '../store/activity_store.js';
import { checkPassedGo, calculateGoSalary } from '../../domain/room.js';
import { formatCurrency } from '../ui/ui_helpers.js';
import { PROPERTY_DEEDS, type PropertyRegistry, type PropertyStateMap } from '../../domain/property_data.js';
import { TELECOM_DATA_FEE, calculateGoPropertyTax, GO_PROPERTY_TAX_CAP } from '../../domain/property_rent.js';
import { ChanceCardId } from '../../domain/event_card_types.js';
import { AIRPORT_CELLS } from '../telemetry/telemetry_expected_delta.js';

export const CHANCE_MARKET_CELLS = new Set<number>([2, 7, 17, 22, 33, 36]);

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

export interface MatchRentResult {
  readonly rentLogs: ActivityLogEntry[]; readonly handledPayerIds: Set<string>; readonly handledReceiverIds: Set<string>; readonly remainingPayers?: readonly BalanceDelta[];
}

/**
 * Khớp giao dịch tiền thuê đa tầng: Khớp 1-1, Chia phí cảng (CC_PORT_EXCLUSIVE), Cước Viettel, và Con nợ âm vốn / Đa giao dịch.
 */
export function matchRentTransactions(
  payers: readonly BalanceDelta[],
  receivers: readonly BalanceDelta[],
  initialHandledPayers?: ReadonlySet<string>,
  initialHandledReceivers?: ReadonlySet<string>,
  prevState?: GameState,
  nextState?: GameState,
  delta?: DeltaPayload,
): MatchRentResult {
  const rentLogs: ActivityLogEntry[] = [];
  const handledPayerIds = new Set<string>(initialHandledPayers ?? []);
  const handledReceiverIds = new Set<string>(initialHandledReceivers ?? []);
  const currentPayers = [...payers];

  // [IMP-225/C5] Nhận diện cước viễn thông Viettel Ô 28 (150 Tr.) CHỈ khi người chơi dừng ở ô Chance/Market
  for (const payer of currentPayers) {
    if (handledPayerIds.has(payer.id)) continue;
    if (payer.cellIndex !== undefined && CHANCE_MARKET_CELLS.has(payer.cellIndex)) {
      const viettelOwnerReceiver = receivers.find(
        (r) => !handledReceiverIds.has(r.id) && r.diff === TELECOM_DATA_FEE && prevState?.playersInfo[r.id]?.ownedProperties?.includes(28),
      );
      if (viettelOwnerReceiver) {
        const payerName = getPlayerName(payer.pInfo, payer.id), receiverName = getPlayerName(viettelOwnerReceiver.pInfo, viettelOwnerReceiver.id);
        rentLogs.push({
          id: `viettel_${Date.now()}_${payer.id}_${viettelOwnerReceiver.id}`, timestamp: Date.now(), type: 'system',
          message: `📡 ${payerName} đã thanh toán ${formatCurrency(TELECOM_DATA_FEE)} cước data viễn thông Viettel cho ${receiverName}`,
          playerId: payer.id, playerName: payerName, targetPlayerId: viettelOwnerReceiver.id, targetPlayerName: receiverName,
          amount: -TELECOM_DATA_FEE, cellIndex: 28, ...(payer.pInfo?.tokenColor ? { playerTokenColor: payer.pInfo.tokenColor } : {}),
        });
        handledPayerIds.add(payer.id); handledReceiverIds.add(viettelOwnerReceiver.id);
      }
    }
  }

  for (let i = 0; i < currentPayers.length; i++) {
    const payer = currentPayers[i]!;
    if (handledPayerIds.has(payer.id) || Math.abs(payer.diff) <= 0) continue;
    const rentAmount = Math.abs(payer.diff);

    // 1. Khớp 1-1 chính xác
    const receiver = receivers.find((r) => !handledReceiverIds.has(r.id) && r.diff === rentAmount);
    if (receiver) {
      const payerName = getPlayerName(payer.pInfo, payer.id), receiverName = getPlayerName(receiver.pInfo, receiver.id);
      rentLogs.push({
        id: `rent_${Date.now()}_${payer.id}_${receiver.id}`, timestamp: Date.now(), type: 'rent',
        message: `${payerName} đã trả ${formatCurrency(rentAmount)} tiền thuê cho ${receiverName}`,
        playerId: payer.id, playerName: payerName, targetPlayerId: receiver.id, targetPlayerName: receiverName,
        amount: -rentAmount, ...(payer.cellIndex !== undefined ? { cellIndex: payer.cellIndex } : {}),
        ...(payer.pInfo?.tokenColor ? { playerTokenColor: payer.pInfo.tokenColor } : {}),
      });
      handledPayerIds.add(payer.id); handledReceiverIds.add(receiver.id);
      continue;
    }

    // 2. Khớp chia đôi phí cảng (CC_PORT_EXCLUSIVE) với guard ô cảng chuẩn xác
    const isPort = payer.cellIndex !== undefined && AIRPORT_CELLS.has(payer.cellIndex);
    if (isPort) {
      const halfRent = Math.floor(rentAmount * 0.5);
      const halfReceivers = receivers.filter((r) => !handledReceiverIds.has(r.id) && r.diff === halfRent);
      if (halfReceivers.length >= 2) {
        const [r1, r2] = halfReceivers;
        const payerName = getPlayerName(payer.pInfo, payer.id), r1Name = getPlayerName(r1!.pInfo, r1!.id), r2Name = getPlayerName(r2!.pInfo, r2!.id);
        rentLogs.push({
          id: `rent_port_${Date.now()}_${payer.id}`, timestamp: Date.now(), type: 'rent',
          message: `⚓ ${payerName} đã trả ${formatCurrency(rentAmount)} phí cảng (chia đều cho ${r1Name} và ${r2Name})`,
          playerId: payer.id, playerName: payerName, targetPlayerId: r1!.id, targetPlayerName: r1Name,
          amount: -rentAmount, ...(payer.cellIndex !== undefined ? { cellIndex: payer.cellIndex } : {}),
          ...(payer.pInfo?.tokenColor ? { playerTokenColor: payer.pInfo.tokenColor } : {}),
        });
        handledPayerIds.add(payer.id); handledReceiverIds.add(r1!.id); handledReceiverIds.add(r2!.id);
        continue;
      }
    }

    // 3. Khớp con nợ âm vốn (Insolvent Debtor) hoặc đa giao dịch khấu trừ
    if (payer.cellIndex !== undefined && prevState) {
      const cellOwnerId = Object.keys(prevState.playersInfo).find((id) =>
        prevState.playersInfo[id]?.ownedProperties?.includes(payer.cellIndex!),
      );
      if (cellOwnerId && cellOwnerId !== payer.id) {
        const ownerReceiver = receivers.find((r) => r.id === cellOwnerId && !handledReceiverIds.has(r.id));
        if (ownerReceiver && ownerReceiver.diff > 0 && ownerReceiver.diff <= rentAmount) {
          const payerName = getPlayerName(payer.pInfo, payer.id);
          const receiverName = getPlayerName(ownerReceiver.pInfo, ownerReceiver.id);
          const payerBalance =
            delta?.players?.find((p) => p.id === payer.id)?.balance ??
            nextState?.playersInfo[payer.id]?.balance ??
            ((prevState.playersInfo[payer.id]?.balance ?? 0) + payer.diff);
          const isInsolvent = payerBalance < 0;
          const msg = isInsolvent
            ? `${payerName} (mất thanh khoản) đã nộp ${formatCurrency(ownerReceiver.diff)} tiền thuê cho ${receiverName}`
            : `${payerName} đã trả ${formatCurrency(ownerReceiver.diff)} tiền thuê cho ${receiverName}`;

          rentLogs.push({
            id: `rent_${isInsolvent ? 'insolvent_' : ''}${Date.now()}_${payer.id}_${cellOwnerId}`, timestamp: Date.now(), type: 'rent',
            message: msg, playerId: payer.id, playerName: payerName, targetPlayerId: cellOwnerId, targetPlayerName: receiverName,
            amount: -ownerReceiver.diff, cellIndex: payer.cellIndex,
            ...(payer.pInfo?.tokenColor ? { playerTokenColor: payer.pInfo.tokenColor } : {}),
          });
          handledReceiverIds.add(cellOwnerId);

          if (isInsolvent) {
            handledPayerIds.add(payer.id);
          } else {
            const remainingDiff = payer.diff + ownerReceiver.diff;
            if (remainingDiff === 0) handledPayerIds.add(payer.id);
            else currentPayers[i] = { ...payer, diff: remainingDiff };
          }
          continue;
        }
      }
    }
  }

  return { rentLogs, handledPayerIds, handledReceiverIds, remainingPayers: currentPayers };
}

export function processPayerFee(
  payer: BalanceDelta, context: PropertyFinancialContext, delta?: DeltaPayload, prevState?: GameState,
): ActivityLogEntry | null {
  const absDiff = Math.abs(payer.diff);
  if (absDiff <= 0) return null;
  if (context.boughtCellIndices.length > 0 && delta?.cells?.some((c) => c.ownerId === payer.id && context.boughtCellIndices.includes(c.index))) return null;
  if (context.boughtCellIndices.some((idx) => PROPERTY_DEEDS.get(idx)?.price === absDiff)) return null;
  if (context.upgradedCells.some((u) => u.ownerId === payer.id && u.cost === absDiff)) return null;
  if (context.unmortgagedCells.some((um) => um.ownerId === payer.id && Math.abs(um.cost - absDiff) <= 50)) return null;

  const pName = getPlayerName(payer.pInfo, payer.id);
  const deltaP = delta?.players?.find((p) => p.id === payer.id);
  const currentPos = deltaP?.position ?? prevState?.playerPositions?.[payer.id] ?? payer.cellIndex;

  if (currentPos === 4) {
    return {
      id: `tax_${Date.now()}_${payer.id}`, timestamp: Date.now(), type: 'tax',
      message: `🏛️ ${pName} đã nộp phí / nộp thuế ${formatCurrency(absDiff)} (Lệ Phí Đăng Ký Đất Đai)`,
      playerId: payer.id, playerName: pName, cellIndex: 4, amount: payer.diff,
      ...(payer.pInfo?.tokenColor ? { playerTokenColor: payer.pInfo.tokenColor } : {}),
    };
  }

  const card = delta?.lastEventCard;
  const isDrawnByPayer = Boolean(
    card && (card.drawnBy === payer.id || card.playerId === payer.id)
  );
  const isCardPenalty = isDrawnByPayer && typeof card?.effectDelta === 'number' && card.effectDelta < 0 && Math.abs(card.effectDelta) === absDiff;
  if (isCardPenalty && card) {
    const cardTitle = card.title || 'Phiếu Sự Kiện';
    return {
      id: `card_penalty_${Date.now()}_${payer.id}`,
      timestamp: Date.now(),
      type: 'card',
      message: `🎟️ ${pName} đã nộp phạt ${formatCurrency(absDiff)} (${cardTitle})`,
      playerId: payer.id,
      playerName: pName,
      amount: payer.diff,
      ...(payer.cellIndex !== undefined ? { cellIndex: payer.cellIndex } : {}),
      ...(payer.pInfo?.tokenColor ? { playerTokenColor: payer.pInfo.tokenColor } : {}),
    };
  }

  const prevP = prevState?.playersInfo[payer.id];
  const wasInAudit = Boolean(prevP?.inAudit || (prevP?.auditTurnsLeft && prevP.auditTurnsLeft > 0));
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

  return {
    id: `tax_${Date.now()}_${payer.id}`, timestamp: Date.now(), type: 'tax',
    message: `${pName} đã nộp phí / Khấu trừ tài chính phát sinh ${formatCurrency(absDiff)}`,
    playerId: payer.id, playerName: pName, amount: payer.diff,
    ...(payer.cellIndex !== undefined ? { cellIndex: payer.cellIndex } : {}),
    ...(payer.pInfo?.tokenColor ? { playerTokenColor: payer.pInfo.tokenColor } : {}),
  };
}

export function processReceiverReward(
  receiver: BalanceDelta, context: PropertyFinancialContext, delta?: DeltaPayload, prevState?: GameState,
): ActivityLogEntry | null {
  if (receiver.diff <= 0) return null;
  if (context.mortgagedCells.some((m) => m.ownerId === receiver.id && m.loan === receiver.diff)) return null;

  const rName = getPlayerName(receiver.pInfo, receiver.id);

  if (delta?.treasury !== undefined && prevState && prevState.treasuryPool > delta.treasury) {
    return {
      id: `stimulus_${Date.now()}_${receiver.id}`, timestamp: Date.now(), type: 'system',
      message: `🏛️ [Kích Cầu Kho Bạc] ${rName} đã nhận được ${formatCurrency(receiver.diff)} trợ cấp phục hồi kinh tế`,
      playerId: receiver.id, playerName: rName, amount: receiver.diff,
      ...(receiver.pInfo?.tokenColor ? { playerTokenColor: receiver.pInfo.tokenColor } : {}),
    };
  }

  return {
    id: `reward_${Date.now()}_${receiver.id}`, timestamp: Date.now(), type: 'system',
    message: `${rName} đã nhận được ${formatCurrency(receiver.diff)} tiền thưởng`,
    playerId: receiver.id, playerName: rName, amount: receiver.diff,
    ...(receiver.pInfo?.tokenColor ? { playerTokenColor: receiver.pInfo.tokenColor } : {}),
  };
}

export function extractMiscellaneousBalances(
  payers: readonly BalanceDelta[], receivers: readonly BalanceDelta[],
  handledPayerIds: Set<string>, handledReceiverIds: Set<string>,
  context: PropertyFinancialContext, delta?: DeltaPayload, prevState?: GameState,
): ActivityLogEntry[] {
  const logs: ActivityLogEntry[] = [];
  for (const p of payers) if (!handledPayerIds.has(p.id)) { const f = processPayerFee(p, context, delta, prevState); if (f) logs.push(f); }
  for (const r of receivers) if (!handledReceiverIds.has(r.id)) { const rew = processReceiverReward(r, context, delta, prevState); if (rew) logs.push(rew); }
  return logs;
}
