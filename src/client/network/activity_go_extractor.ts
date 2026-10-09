// [IMP-303] Activity GO Salary & Financial Deduction Extractor
import type { DeltaPayload } from '../../server/session_manager.js';
import type { GameState, PlayerHudInfo } from '../store/game_store.js';
import { type ActivityLogEntry } from '../store/activity_store.js';
import { checkPassedGo, calculateGoSalary } from '../../domain/room.js';
import { formatCurrency } from '../ui/ui_helpers.js';
import { type PropertyRegistry, type PropertyStateMap, PROPERTY_DEEDS } from '../../domain/property_data.js';
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

import {
  MORTGAGE_DEFAULT_INTEREST_RATE,
  MORTGAGE_RATE_HIKE_INTEREST_RATE,
  MORTGAGE_LOAN_RATE,
} from '../../domain/mortgage_constants.js';

function calculateGoMortgageInterest(
  prevP: PlayerHudInfo | undefined,
  activeMods: readonly { readonly type: string; readonly remainingRounds: number }[],
): { mortInterest: number; isRateHike: boolean } {
  const mortDebt = (prevP?.mortgagedProperties ?? []).reduce((sum, cell) => {
    const loan = prevP?.mortgageLoans?.[cell];
    if (loan !== undefined) return sum + loan;
    const deed = PROPERTY_DEEDS.get(cell);
    return sum + (deed ? Math.floor(deed.price * MORTGAGE_LOAN_RATE) : 0);
  }, 0);
  const isStimulus = activeMods.some((m) => m.type === 'MC_CREDIT_STIMULUS' && m.remainingRounds > 0);
  const isRateHike = activeMods.some((m) => m.type === 'MC_RATE_HIKE' && m.remainingRounds > 0);
  const mortRate = isStimulus ? 0 : (isRateHike ? MORTGAGE_RATE_HIKE_INTEREST_RATE : MORTGAGE_DEFAULT_INTEREST_RATE);
  return { mortInterest: Math.floor(mortDebt * mortRate), isRateHike };
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
      ((p.auditTurnsLeft ?? 0) > 0) ||
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

      const { mortInterest, isRateHike } = calculateGoMortgageInterest(
        prevP,
        delta.activeModifiers ?? prevState.activeModifiers ?? [],
      );
      if (mortInterest > 0) {
        salaryLogs.push({
          id: `mort_interest_${Date.now()}_${p.id}`, timestamp: Date.now(), type: 'tax',
          message: `🏦 ${pName} đã nộp ${formatCurrency(mortInterest)} lãi thế chấp qua GO (${isRateHike ? '10%' : '5%'} nợ)`,
          amount: -mortInterest, cellIndex: 0, playerId: p.id, playerName: pName,
          ...(pInfo?.tokenColor ? { playerTokenColor: pInfo.tokenColor } : {}),
        });
      }

      const totalGoDeductions = (isOverdraftDue ? 3300 : 0) + (hasFreeCredit ? 400 : 0) + goTax + mortInterest;
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
