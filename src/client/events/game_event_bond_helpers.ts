// [IMP-380] Game Event Bond Helpers — Dedicated corporate bond lifecycle event synthesis
import type { GameState } from '../store/game_store.js';
import type { DeltaPayload } from '../../server/session_manager.js';
import {
  type BondRepaidEvent,
  type BondIssuedEvent,
  type BondDefaultEvent,
  SynthesizedGameEventType,
} from './game_event_types.js';
import { BOND_TRANCHES, BondTrancheId } from '../../domain/bond_types.js';
import {
  type InternalBalanceDelta,
  deductInflowFromDeltas,
} from './game_event_financial_helpers.js';

function isValidBondTrancheId(val: unknown): val is BondTrancheId {
  return val === BondTrancheId.WORKING_CAPITAL || val === BondTrancheId.EXPANSION || val === BondTrancheId.ALL_IN;
}

function restoreDeltaOutflow(playerId: string, amount: number, payers: InternalBalanceDelta[], receivers: InternalBalanceDelta[]): void {
  const payIdx = payers.findIndex((py) => py.id === playerId);
  if (payIdx !== -1) {
    const newDiff = payers[payIdx]!.diff + amount;
    if (newDiff === 0) {
      payers.splice(payIdx, 1);
    } else if (newDiff > 0) {
      const payerObj = payers[payIdx]!;
      payers.splice(payIdx, 1);
      receivers.push({
        id: playerId,
        diff: newDiff,
        cellIndex: payerObj.cellIndex,
        prevP: payerObj.prevP,
        hasPassedGo: payerObj.hasPassedGo,
        isSentToAudit: payerObj.isSentToAudit,
      });
    } else {
      payers[payIdx]!.diff = newDiff;
    }
  } else {
    const recIdx = receivers.findIndex((r) => r.id === playerId);
    if (recIdx !== -1) {
      receivers[recIdx]!.diff += amount;
    } else if (amount > 0) {
      receivers.push({ id: playerId, diff: amount, cellIndex: undefined, prevP: undefined, hasPassedGo: false, isSentToAudit: false });
    }
  }
}

export function extractBondEvents(
  delta: DeltaPayload,
  prevState: GameState,
  nextState: GameState,
  payers: InternalBalanceDelta[],
  receivers: InternalBalanceDelta[],
  timestamp: number,
): Array<BondRepaidEvent | BondIssuedEvent | BondDefaultEvent> {
  const events: Array<BondRepaidEvent | BondIssuedEvent | BondDefaultEvent> = [];
  const isDefault = delta.lastEventCard?.id === 'EVENT_BOND_DEFAULT' || delta.lastEventCard?.cardId === 'EVENT_BOND_DEFAULT';
  const handledBondPlayerIds = new Set<string>();

  if (delta.domainEvents && delta.domainEvents.length > 0) {
    for (const ev of delta.domainEvents) {
      if (ev.type === 'BOND_REPAID') {
        handledBondPlayerIds.add(ev.playerId);
        const repayAmount = ev.repayAmount ?? (ev.principal + (ev.interest ?? 0));
        events.push({
          type: SynthesizedGameEventType.BOND_REPAID,
          timestamp: ev.timestamp || timestamp,
          playerId: ev.playerId,
          principal: ev.principal,
          interest: ev.interest ?? Math.max(0, repayAmount - ev.principal),
          totalRepaid: repayAmount,
          repayAmount,
          ...(isValidBondTrancheId(ev.trancheId) ? { trancheId: ev.trancheId } : {}),
        });
        restoreDeltaOutflow(ev.playerId, repayAmount, payers, receivers);
      } else if (ev.type === 'BOND_DEFAULT') {
        handledBondPlayerIds.add(ev.playerId);
        events.push({
          type: SynthesizedGameEventType.BOND_DEFAULT,
          timestamp: ev.timestamp || timestamp,
          playerId: ev.playerId,
          principal: ev.principal,
          repayAmount: ev.repayAmount ?? ev.principal,
          ...(ev.cashSeized !== undefined ? { cashSeized: ev.cashSeized } : {}),
          ...(isValidBondTrancheId(ev.trancheId) ? { trancheId: ev.trancheId } : {}),
        });
        if (ev.cashSeized && ev.cashSeized > 0) {
          restoreDeltaOutflow(ev.playerId, ev.cashSeized, payers, receivers);
        }
      }
    }
  }

  for (const p of delta.players ?? []) {
    const prevBond = prevState.playersInfo[p.id]?.bondContract;
    const currBond = p.bondContract !== undefined ? p.bondContract : nextState.playersInfo[p.id]?.bondContract;
    const isPrevActive = Boolean(prevBond && prevBond.isActive !== false);
    const isCurrActive = Boolean(currBond && currBond.isActive !== false);

    // 1. Bond Repayment on Maturity (prevBond active, nextBond cleared, not default)
    if (!handledBondPlayerIds.has(p.id) && isPrevActive && !isCurrActive && !isDefault && prevBond) {
      events.push({
        type: SynthesizedGameEventType.BOND_REPAID,
        timestamp,
        playerId: p.id,
        principal: prevBond.principal,
        interest: Math.max(0, prevBond.repayAmount - prevBond.principal),
        totalRepaid: prevBond.repayAmount,
        repayAmount: prevBond.repayAmount,
        ...(prevBond.trancheId ? { trancheId: prevBond.trancheId } : {}),
      });

      // Restore repayAmount into delta to resolve Netting Collision with concurrent inflows (e.g. GO salary)
      restoreDeltaOutflow(p.id, prevBond.repayAmount, payers, receivers);
    }

    // 2. Bond Issuance (prevBond inactive, or settled in same tick, nextBond active)
    if ((!isPrevActive || handledBondPlayerIds.has(p.id)) && isCurrActive && currBond) {
      const recIdx = receivers.findIndex((r) => r.id === p.id);
      if (recIdx !== -1 && receivers[recIdx]!.diff >= currBond.principal) {
        events.push({
          type: SynthesizedGameEventType.BOND_ISSUED,
          timestamp,
          playerId: p.id,
          principal: currBond.principal,
          repayAmount: currBond.repayAmount,
          roundsLeft: currBond.roundsLeft,
          interestRate: currBond.trancheId ? (BOND_TRANCHES[currBond.trancheId]?.interestRate ?? 0.2) : 0.2,
          ...(currBond.trancheId ? { trancheId: currBond.trancheId } : {}),
        });
        deductInflowFromDeltas(p.id, currBond.principal, undefined, prevState.playersInfo[p.id], payers, receivers);
      }
    }
  }

  return events;
}
