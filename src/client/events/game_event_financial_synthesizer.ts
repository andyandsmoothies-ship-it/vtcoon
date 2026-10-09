// [IMP-331] Game Event Financial Synthesizer
// Pure, deterministic domain module for synthesizing financial game events (Salary, Fees, Rent, Diplomatic Waiver)
import type { GameState, PlayerHudInfo } from '../store/game_store.js';
import type { DeltaPayload } from '../../server/session_manager.js';
import {
  type SynthesizedGameEvent, type SynthesizerOptions, SynthesizedGameEventType,
  type RentPaidEvent, type GoSalaryEvent, type FeePaidEvent,
  type PartialRentEvent, type PortSplitRentEvent, type DiplomaticWaiverEvent,
} from './game_event_types.js';
import { checkPassedGo, calculateGoSalary } from '../../domain/room.js';
import { calculateGoPropertyTax, GO_PROPERTY_TAX_CAP, TELECOM_DATA_FEE } from '../../domain/property_rent.js';
import { ChanceCardId } from '../../domain/event_card_types.js';
import { AIRPORT_CELLS } from '../telemetry/telemetry_expected_delta.js';
import {
  buildRegistryAndStateMap,
  calculateMortgageInterest,
  deductInflowFromDeltas,
  adjustNetDeltaForTrade,
  type InternalBalanceDelta,
} from './game_event_financial_helpers.js';

const CHANCE_MARKET_CELLS = new Set<number>([2, 7, 17, 22, 33, 36]);

function extractDiplomaticWaiver(delta: DeltaPayload, timestamp: number): DiplomaticWaiverEvent[] {
  if (!delta.lastDiplomaticEvent) return [];
  const ev = delta.lastDiplomaticEvent;
  return [{ type: SynthesizedGameEventType.DIPLOMATIC_WAIVER, timestamp, payerId: ev.playerId, landlordId: ev.landlordId, cellIndex: ev.cellIndex, waivedAmount: ev.savedRent }];
}

function buildInitialBalanceDeltas(
  delta: DeltaPayload,
  prevState: GameState,
  nextState: GameState,
): { payers: InternalBalanceDelta[]; receivers: InternalBalanceDelta[] } {
  const payers: InternalBalanceDelta[] = [];
  const receivers: InternalBalanceDelta[] = [];

  for (const p of delta.players ?? []) {
    const prevP = prevState.playersInfo[p.id];
    const prevBal = prevP?.balance ?? 0;
    const currBal = p.balance ?? nextState.playersInfo[p.id]?.balance ?? prevBal;
    const diff = currBal - prevBal;
    const prevPos = prevState.playerPositions?.[p.id];
    const newPos = nextState.playerPositions?.[p.id] ?? p.position ?? prevPos;
    const rawPassedGo = prevPos !== undefined && newPos !== undefined && prevPos !== newPos && checkPassedGo(prevPos, newPos);
    const isSentToAudit = Boolean(p.inAudit === true || ((p.auditTurnsLeft ?? 0) > 0) || nextState.playersInfo[p.id]?.inAudit === true);
    const hasPassedGo = rawPassedGo && !isSentToAudit;

    if (diff < 0) {
      payers.push({ id: p.id, diff, cellIndex: newPos, prevP, hasPassedGo, isSentToAudit });
    } else if (diff > 0) {
      receivers.push({ id: p.id, diff, cellIndex: newPos, prevP, hasPassedGo, isSentToAudit });
    } else if (hasPassedGo) {
      payers.push({ id: p.id, diff: 0, cellIndex: newPos, prevP, hasPassedGo, isSentToAudit });
    }
  }

  return { payers, receivers };
}

function reconstructGoSalary(
  delta: DeltaPayload,
  prevState: GameState,
  nextState: GameState,
  payers: InternalBalanceDelta[],
  receivers: InternalBalanceDelta[],
  timestamp: number,
): GoSalaryEvent[] {
  const salaryEvents: GoSalaryEvent[] = [];

  for (const p of delta.players ?? []) {
    const prevP = prevState.playersInfo[p.id];
    const prevPos = prevState.playerPositions?.[p.id];
    const newPos = nextState.playerPositions?.[p.id] ?? p.position ?? prevPos;
    const isSentToAudit = Boolean(p.inAudit === true || ((p.auditTurnsLeft ?? 0) > 0) || nextState.playersInfo[p.id]?.inAudit === true);
    if (prevPos === undefined || newPos === undefined || prevPos === newPos || isSentToAudit) continue;

    if (checkPassedGo(prevPos, newPos)) {
      const round = delta.roundNumber ?? prevState.roundNumber ?? 1;
      const grossSalary = delta.passedGoSalary ?? calculateGoSalary(round);
      const { registry, stateMap } = buildRegistryAndStateMap(prevState.playersInfo, prevState.levelMap);
      const goTax = Math.min(calculateGoPropertyTax(p.id, registry, stateMap), GO_PROPERTY_TAX_CAP);
      const activeMods = delta.activeModifiers ?? prevState.activeModifiers ?? [];
      const mortInterest = calculateMortgageInterest(prevP, activeMods);
      const isOverdraftDue = prevP?.overdraftRoundsLeft === 1 && (!p.overdraftRoundsLeft || p.overdraftRoundsLeft === 0);
      const hasFreeCredit = Boolean(prevP?.hand?.includes(ChanceCardId.CC_FREE_CREDIT));
      const totalDeductions = goTax + mortInterest + (isOverdraftDue ? 3300 : 0) + (hasFreeCredit ? 400 : 0);
      const netAmount = grossSalary - totalDeductions;

      salaryEvents.push({
        type: SynthesizedGameEventType.GO_SALARY,
        timestamp,
        playerId: p.id,
        grossSalary,
        deductions: {
          ...(goTax > 0 ? { propertyTax: goTax } : {}),
          ...(mortInterest > 0 ? { mortgageInterest: mortInterest } : {}),
          ...(isOverdraftDue ? { overdraft: 3300 } : {}),
          ...(hasFreeCredit ? { creditFee: 400 } : {}),
        },
        taxDeduction: goTax,
        netAmount,
      });

      deductInflowFromDeltas(p.id, netAmount, newPos, prevP, payers, receivers);
    }
  }

  return salaryEvents;
}

function extractGovernmentAndTelecomFees(
  payers: InternalBalanceDelta[],
  receivers: InternalBalanceDelta[],
  prevState: GameState,
  timestamp: number,
): FeePaidEvent[] {
  const feeEvents: FeePaidEvent[] = [];

  for (const payer of payers) {
    if (payer.diff >= 0) continue;

    if (payer.cellIndex !== undefined && CHANCE_MARKET_CELLS.has(payer.cellIndex)) {
      const viettelIdx = receivers.findIndex(
        (r) => r.diff === TELECOM_DATA_FEE && prevState.playersInfo[r.id]?.ownedProperties?.includes(28),
      );
      if (viettelIdx !== -1) {
        feeEvents.push({
          type: SynthesizedGameEventType.FEE_PAID, timestamp, payerId: payer.id,
          feeType: 'TELECOM_DATA', amount: TELECOM_DATA_FEE, receiverId: receivers[viettelIdx]!.id, cellIndex: 28,
        });
        receivers.splice(viettelIdx, 1);
        payer.diff += TELECOM_DATA_FEE;
        if (payer.diff >= 0) continue;
      }
    }

    if (payer.cellIndex === 4) {
      feeEvents.push({
        type: SynthesizedGameEventType.FEE_PAID, timestamp, payerId: payer.id,
        feeType: 'LAND_TAX', amount: Math.abs(payer.diff), cellIndex: 4,
      });
      payer.diff = 0;
      continue;
    }

    if (payer.cellIndex === 10) {
      const wasInAudit = Boolean(payer.prevP?.inAudit || (payer.prevP?.auditTurnsLeft && payer.prevP.auditTurnsLeft > 0));
      if (wasInAudit && Math.abs(payer.diff) >= 500) {
        feeEvents.push({
          type: SynthesizedGameEventType.FEE_PAID, timestamp, payerId: payer.id,
          feeType: 'BAIL', amount: Math.abs(payer.diff), cellIndex: 10,
        });
        payer.diff = 0;
      }
    }
  }

  return feeEvents;
}

function matchRentTransactions(
  payers: InternalBalanceDelta[],
  receivers: InternalBalanceDelta[],
  prevState: GameState,
  delta: DeltaPayload,
  nextState: GameState,
  timestamp: number,
): Array<RentPaidEvent | PartialRentEvent | PortSplitRentEvent> {
  const rentEvents: Array<RentPaidEvent | PartialRentEvent | PortSplitRentEvent> = [];

  // 1. Port Split Rent
  for (const payer of payers) {
    if (payer.diff >= 0 || payer.cellIndex === undefined) continue;
    if (AIRPORT_CELLS.has(payer.cellIndex)) {
      const rentAmount = Math.abs(payer.diff);
      const halfRent = Math.floor(rentAmount * 0.5);
      const matchingReceivers = receivers.filter((r) => r.diff === halfRent);
      if (matchingReceivers.length >= 2) {
        const [r1, r2] = matchingReceivers;
        rentEvents.push({
          type: SynthesizedGameEventType.PORT_SPLIT_RENT, timestamp, payerId: payer.id,
          receiverIds: [r1!.id, r2!.id], cellIndex: payer.cellIndex, totalAmount: rentAmount, amountPerReceiver: halfRent,
        });
        const r1Idx = receivers.findIndex((r) => r.id === r1!.id);
        if (r1Idx !== -1) receivers.splice(r1Idx, 1);
        const r2Idx = receivers.findIndex((r) => r.id === r2!.id);
        if (r2Idx !== -1) receivers.splice(r2Idx, 1);
        payer.diff = 0;
      }
    }
  }

  // 2. 1-to-1 Exact Rent Matching
  for (const payer of payers) {
    if (payer.diff >= 0) continue;
    const rentAmount = Math.abs(payer.diff);
    const recIdx = receivers.findIndex((r) => r.diff === rentAmount);
    if (recIdx !== -1) {
      rentEvents.push({
        type: SynthesizedGameEventType.RENT_PAID, timestamp, payerId: payer.id,
        receiverId: receivers[recIdx]!.id, cellIndex: payer.cellIndex ?? 0, amount: rentAmount,
      });
      receivers.splice(recIdx, 1);
      payer.diff = 0;
    }
  }

  // 3. Insolvent Partial Rent
  for (const payer of payers) {
    if (payer.diff >= 0 || payer.cellIndex === undefined) continue;
    const cellOwnerId = Object.keys(prevState.playersInfo).find((id) =>
      prevState.playersInfo[id]?.ownedProperties?.includes(payer.cellIndex!),
    );
    if (cellOwnerId && cellOwnerId !== payer.id) {
      const recIdx = receivers.findIndex((r) => r.id === cellOwnerId);
      if (recIdx !== -1) {
        const paidAmount = receivers[recIdx]!.diff;
        const payerBal = delta.players?.find((p) => p.id === payer.id)?.balance ?? nextState.playersInfo[payer.id]?.balance ?? 0;
        if (payerBal < 0) {
          rentEvents.push({
            type: SynthesizedGameEventType.PARTIAL_RENT, timestamp, payerId: payer.id,
            receiverId: cellOwnerId, paidAmount,
            remainingDebt: Math.max(0, Math.abs(payer.diff) - paidAmount), cellIndex: payer.cellIndex,
          });
          receivers.splice(recIdx, 1);
          payer.diff = 0;
        }
      }
    }
  }

  return rentEvents;
}

export function synthesizeFinancialEvents(
  prevState: GameState,
  nextState: GameState,
  delta: DeltaPayload,
  options?: SynthesizerOptions,
): readonly SynthesizedGameEvent[] {
  const timestamp = options?.baseTimestamp ?? delta.tick ?? 0;
  const waiverEvents = extractDiplomaticWaiver(delta, timestamp);

  if (!delta.players || delta.players.length === 0) {
    return waiverEvents;
  }

  const { payers, receivers } = buildInitialBalanceDeltas(delta, prevState, nextState);
  if (delta.lastTradeResult) {
    adjustNetDeltaForTrade(delta.lastTradeResult, payers, receivers);
  }
  const salaryEvents = reconstructGoSalary(delta, prevState, nextState, payers, receivers, timestamp);
  const feeEvents = extractGovernmentAndTelecomFees(payers, receivers, prevState, timestamp);
  const rentEvents = matchRentTransactions(payers, receivers, prevState, delta, nextState, timestamp);
  for (const payer of payers) {
    if (payer.diff < 0) {
      feeEvents.push({
        type: SynthesizedGameEventType.FEE_PAID, timestamp, payerId: payer.id,
        feeType: payer.cellIndex === 4 ? 'LAND_TAX' : 'TAX', amount: Math.abs(payer.diff),
        ...(payer.cellIndex !== undefined ? { cellIndex: payer.cellIndex } : {}),
      });
      payer.diff = 0;
    }
  }
  return [...salaryEvents, ...feeEvents, ...rentEvents, ...waiverEvents];
}
