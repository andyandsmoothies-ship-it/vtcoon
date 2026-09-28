// [UC-GAME-001..003/MSS][UC-GAME-051..057/MSS] Player Intent Dispatcher — ADR-0001
import { TurnPhase, ActionRejectReason } from '../domain/room.js';
import { BuyResult } from '../domain/property_manager.js';
import type { RoomManager, RollResult } from './room_manager.js';
import { getActivePlayerFn } from './room_manager_lifecycle.js';
import {
  coordMortgage, coordRedeem, coordDowngrade, coordTrade,
  coordRespondTradeOffer, coordBankruptcy, coordExecuteCompulsoryBuyout,
  coordDeclineCompulsoryBuyout,
} from './room_property_coordinator.js';
import { handleUpgrade, handleUpgradeETC, handleUpgradeUtility, handleBuyProperty } from './property_actions.js';
import { handleHoseInvest, handleHoseSkip } from './hose_actions.js';
import { executeInsolvencyAfkRecovery } from './network/afk_recovery.js';
import type { BondTrancheId } from '../domain/bond_types.js';

export type PlayerIntent =
  | { type: 'INTENT_BUY' } | { type: 'INTENT_BUY_PROPERTY' } | { type: 'INTENT_DECLINE' }
  | { type: 'INTENT_BID'; amount: number; isBait?: boolean }
  | { type: 'INTENT_AUCTION_PASS' }
  | { type: 'INTENT_UPGRADE'; cellIndex: number }
  | { type: 'INTENT_UPGRADE_ETC' }
  | { type: 'INTENT_UPGRADE_UTILITY'; cellIndex: number }
  | { type: 'INTENT_DOWNGRADE'; cellIndex: number; stepByStep?: boolean; enforceEvenDowngrading?: boolean }
  | { type: 'INTENT_MORTGAGE'; cellIndex: number }
  | { type: 'INTENT_REDEEM'; cellIndex: number }
  | { type: 'INTENT_TRADE_OFFER'; sellerId: string; buyerId: string; cellIndex: number; price: number; offeredCellIndex?: number }
  | { type: 'INTENT_RESPOND_TRADE_OFFER'; offerId: string; accept: boolean }
  | { type: 'INTENT_EXECUTE_COMPULSORY_BUYOUT'; cellIndex: number }
  | { type: 'INTENT_DECLINE_COMPULSORY_BUYOUT' }
  | { type: 'INTENT_END_TURN' }
  | { type: 'INTENT_INVEST'; stake: number }
  | { type: 'INTENT_SKIP' }
  | { type: 'INTENT_BAIL_OUT' }
  | { type: 'INTENT_BANKRUPTCY'; creditorId?: string }
  | { type: 'INTENT_ISSUE_BOND'; trancheId?: BondTrancheId }
  | { type: 'INTENT_REPAY_BOND' }
  | { type: 'INTENT_AUTO_SOLVENCY' }
  | { type: 'INTENT_ROLL' };

type IntentHandler = (mgr: RoomManager, rc: string, p: string, intent: PlayerIntent) => { success: boolean; reason?: string; rollResult?: RollResult };

const INTENT_DISPATCH: Record<PlayerIntent['type'], IntentHandler> = {
  INTENT_ROLL: (m, rc, p) => {
    const res = m.handleRollDice(rc, p);
    return { success: res !== undefined, reason: res ? undefined : 'CANNOT_ROLL', rollResult: res };
  },
  INTENT_BUY: (m, rc, p) => {
    const ctx = m.getContext(rc);
    if (!ctx) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
    const player = getActivePlayerFn(ctx.room, p);
    const res = handleBuyProperty(ctx.room, player, ctx.reg);
    return { success: res?.result === BuyResult.Success, reason: res?.result };
  },
  INTENT_BUY_PROPERTY: (m, rc, p) => {
    const ctx = m.getContext(rc);
    if (!ctx) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
    const player = getActivePlayerFn(ctx.room, p);
    const res = handleBuyProperty(ctx.room, player, ctx.reg);
    return { success: res?.result === BuyResult.Success, reason: res?.result };
  },
  INTENT_DECLINE: (m, rc, p) => m.handleDecline(rc, p),
  INTENT_BID: (m, rc, p, i) => m.handleAuctionBid(rc, p, (i as { amount: number }).amount),
  INTENT_AUCTION_PASS: (m, rc, p) => m.handleAuctionPass(rc, p),
  INTENT_UPGRADE: (m, rc, p, i) => {
    const ctx = m.getContext(rc);
    if (!ctx) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
    const player = getActivePlayerFn(ctx.room, p);
    return handleUpgrade(player, ctx.room.phase, (i as { cellIndex: number }).cellIndex, ctx.reg, ctx.sm, ctx.room.activeModifiers, ctx.room);
  },
  INTENT_UPGRADE_ETC: (m, rc, p) => {
    const ctx = m.getContext(rc);
    if (!ctx) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
    const player = getActivePlayerFn(ctx.room, p);
    return handleUpgradeETC(player, ctx.room.phase, ctx.reg, ctx.sm, ctx.room);
  },
  INTENT_UPGRADE_UTILITY: (m, rc, p, i) => {
    const ctx = m.getContext(rc);
    if (!ctx) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
    const player = getActivePlayerFn(ctx.room, p);
    return handleUpgradeUtility(player, ctx.room.phase, (i as { cellIndex: number }).cellIndex, ctx.reg, ctx.sm, ctx.room);
  },
  INTENT_DOWNGRADE: (m, rc, p, i) => {
    const ctx = m.getContext(rc);
    if (!ctx) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
    const di = i as { cellIndex: number; stepByStep?: boolean; enforceEvenDowngrading?: boolean };
    const player = getActivePlayerFn(ctx.room, p);
    return coordDowngrade(ctx, player, di.cellIndex, rc, {
      stepByStep: di.stepByStep ?? true,
      enforceEvenDowngrading: di.enforceEvenDowngrading ?? true,
    });
  },
  INTENT_MORTGAGE: (m, rc, p, i) => {
    const ctx = m.getContext(rc);
    return ctx ? coordMortgage(ctx, p, (i as { cellIndex: number }).cellIndex) : { success: false, reason: ActionRejectReason.INVALID_ROOM };
  },
  INTENT_REDEEM: (m, rc, p, i) => {
    const ctx = m.getContext(rc);
    return ctx ? coordRedeem(ctx, p, (i as { cellIndex: number }).cellIndex) : { success: false, reason: ActionRejectReason.INVALID_ROOM };
  },
  INTENT_TRADE_OFFER: (m, rc, p, i) => {
    const ctx = m.getContext(rc);
    if (!ctx) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
    const ti = i as { sellerId: string; buyerId: string; cellIndex: number; price: number; offeredCellIndex?: number };
    return coordTrade(ctx, p, ti.sellerId, ti.buyerId, ti.cellIndex, ti.price, ti.offeredCellIndex);
  },
  INTENT_RESPOND_TRADE_OFFER: (m, rc, p, i) => {
    const ctx = m.getContext(rc);
    if (!ctx) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
    const ri = i as { offerId: string; accept: boolean };
    return coordRespondTradeOffer(ctx, p, ri.offerId, ri.accept);
  },
  INTENT_EXECUTE_COMPULSORY_BUYOUT: (m, rc, p, i) => {
    const ctx = m.getContext(rc);
    return ctx ? coordExecuteCompulsoryBuyout(ctx, p, (i as { cellIndex: number }).cellIndex) : { success: false, reason: ActionRejectReason.INVALID_ROOM };
  },
  INTENT_DECLINE_COMPULSORY_BUYOUT: (m, rc, p) => {
    const ctx = m.getContext(rc);
    return ctx ? coordDeclineCompulsoryBuyout(ctx, p) : { success: false, reason: ActionRejectReason.INVALID_ROOM };
  },
  INTENT_INVEST: (m, rc, p, i) => {
    const room = m.getRoom(rc);
    const player = getActivePlayerFn(room, p);
    return handleHoseInvest(room, player, m.getRng(), (i as { stake: number }).stake);
  },
  INTENT_SKIP: (m, rc, p) => {
    const room = m.getRoom(rc);
    const player = getActivePlayerFn(room, p);
    return handleHoseSkip(room, player);
  },
  INTENT_BAIL_OUT: (m, rc, p) => m.handleBailOut(rc, p),
  INTENT_BANKRUPTCY: (m, rc, p, i) => {
    const ctx = m.getContext(rc);
    if (!ctx) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
    const ci = i as { creditorId?: string };
    coordBankruptcy(ctx, p, ci.creditorId, m.auctionsMap, rc, m.rolledThisTurnMap);
    return { success: true };
  },
  INTENT_ISSUE_BOND: (m, rc, p, i) => m.handleIssueBond(rc, p, (i as { trancheId?: BondTrancheId })?.trancheId),
  INTENT_REPAY_BOND: (m, rc, p) => m.handleRepayBond(rc, p),
  INTENT_AUTO_SOLVENCY: (m, rc, p) => {
    const room = m.getRoom(rc);
    if (!room || room.phase !== TurnPhase.InsolvencyPhase) {
      return { success: false, reason: 'INVALID_PHASE' };
    }
    const current = room.players[room.currentPlayerIndex];
    if (!current || current.id !== p || current.balance >= 0) {
      return { success: false, reason: ActionRejectReason.NOT_YOUR_TURN };
    }
    const res = executeInsolvencyAfkRecovery(m, rc, p);
    return { success: res.rescued, reason: res.bankrupt ? 'BANKRUPT' : (res.rescued ? undefined : 'CANNOT_RECOVER') };
  },
  INTENT_END_TURN: (m, rc, p) => {
    const room = m.getRoom(rc);
    const current = room?.players[room.currentPlayerIndex];
    const continueDoubles = (current?.consecutiveDoubles ?? 0) > 0 && !current?.skipNextTurn;
    const r = m.handleEndTurn(rc, p, continueDoubles);
    return { success: r !== undefined, reason: r ? undefined : 'INVALID_PHASE' };
  },
};

export function dispatchPlayerIntent(
  mgr: RoomManager,
  roomCode: string,
  playerId: string,
  intent: PlayerIntent,
): { success: boolean; reason?: string; rollResult?: RollResult } {
  const room = mgr.getRoom(roomCode);
  if (room?.phase === TurnPhase.InsolvencyPhase) {
    if (
      intent.type !== 'INTENT_MORTGAGE' &&
      intent.type !== 'INTENT_DOWNGRADE' &&
      intent.type !== 'INTENT_BANKRUPTCY' &&
      intent.type !== 'INTENT_AUTO_SOLVENCY'
    ) {
      return { success: false, reason: 'INVALID_PHASE' };
    }
  }
  const handler = INTENT_DISPATCH[intent.type];
  return handler ? handler(mgr, roomCode, playerId, intent) : { success: false, reason: 'INVALID_INTENT' };
}
