// [IMP-380] Game Event Bond Helpers — Dedicated corporate bond lifecycle event synthesis
import type { GameState } from '../store/game_store.js';
import type { DeltaPayload } from '../../server/session_manager.js';
import {
  type BondRepaidEvent,
  type BondIssuedEvent,
  SynthesizedGameEventType,
} from './game_event_types.js';
import { BOND_TRANCHES } from '../../domain/bond_types.js';
import {
  type InternalBalanceDelta,
  deductInflowFromDeltas,
} from './game_event_financial_helpers.js';

export function extractBondEvents(
  delta: DeltaPayload,
  prevState: GameState,
  nextState: GameState,
  payers: InternalBalanceDelta[],
  receivers: InternalBalanceDelta[],
  timestamp: number,
): Array<BondRepaidEvent | BondIssuedEvent> {
  const events: Array<BondRepaidEvent | BondIssuedEvent> = [];
  const isDefault = delta.lastEventCard?.id === 'EVENT_BOND_DEFAULT' || delta.lastEventCard?.cardId === 'EVENT_BOND_DEFAULT';

  for (const p of delta.players ?? []) {
    const prevBond = prevState.playersInfo[p.id]?.bondContract;
    const currBond = p.bondContract !== undefined ? p.bondContract : nextState.playersInfo[p.id]?.bondContract;
    const isPrevActive = Boolean(prevBond && prevBond.isActive !== false);
    const isCurrActive = Boolean(currBond && currBond.isActive !== false);

    // 1. Bond Repayment on Maturity (prevBond active, nextBond cleared, not default)
    if (isPrevActive && !isCurrActive && !isDefault && prevBond) {
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
      const payIdx = payers.findIndex((py) => py.id === p.id);
      if (payIdx !== -1) {
        const newDiff = payers[payIdx]!.diff + prevBond.repayAmount;
        if (newDiff === 0) {
          payers.splice(payIdx, 1);
        } else if (newDiff > 0) {
          const payerObj = payers[payIdx]!;
          payers.splice(payIdx, 1);
          receivers.push({
            id: p.id,
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
        const recIdx = receivers.findIndex((r) => r.id === p.id);
        if (recIdx !== -1) {
          receivers[recIdx]!.diff += prevBond.repayAmount;
        }
      }
    }

    // 2. Bond Issuance (prevBond inactive, nextBond active)
    if (!isPrevActive && isCurrActive && currBond) {
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
