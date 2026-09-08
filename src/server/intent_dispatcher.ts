// [UC-GAME-001..003/MSS][UC-GAME-051..057/MSS] Player Intent Dispatcher — ADR-0001
import { TurnPhase } from '../domain/room';
import { BuyResult } from '../domain/property_manager';
import type { RoomManager } from './room_manager';

export type PlayerIntent =
  | { type: 'INTENT_BUY' } | { type: 'INTENT_DECLINE' }
  | { type: 'INTENT_BID'; amount: number }
  | { type: 'INTENT_AUCTION_PASS' }
  | { type: 'INTENT_UPGRADE'; cellIndex: number }
  | { type: 'INTENT_UPGRADE_ETC' }
  | { type: 'INTENT_UPGRADE_UTILITY'; cellIndex: number }
  | { type: 'INTENT_DOWNGRADE'; cellIndex: number }
  | { type: 'INTENT_MORTGAGE'; cellIndex: number }
  | { type: 'INTENT_REDEEM'; cellIndex: number }
  | { type: 'INTENT_TRADE_OFFER'; sellerId: string; buyerId: string; cellIndex: number; price: number }
  | { type: 'INTENT_END_TURN' }
  | { type: 'INTENT_INVEST'; stake: number }
  | { type: 'INTENT_SKIP' }
  | { type: 'INTENT_BAIL_OUT' };

type IntentHandler = (mgr: RoomManager, rc: string, p: string, intent: PlayerIntent) => { success: boolean; reason?: string };

const INTENT_DISPATCH: Record<PlayerIntent['type'], IntentHandler> = {
  INTENT_BUY: (m, rc, p) => {
    const res = m.handleBuyProperty(rc, p);
    return { success: res?.result === BuyResult.Success, reason: res?.result };
  },
  INTENT_DECLINE: (m, rc, p) => m.handleDecline(rc, p),
  INTENT_BID: (m, rc, p, i) => m.handleAuctionBid(rc, p, (i as { amount: number }).amount),
  INTENT_AUCTION_PASS: (m, rc, p) => m.handleAuctionPass(rc, p),
  INTENT_UPGRADE: (m, rc, p, i) => m.handleUpgrade(rc, p, (i as { cellIndex: number }).cellIndex),
  INTENT_UPGRADE_ETC: (m, rc, p) => m.handleUpgradeETC(rc, p),
  INTENT_UPGRADE_UTILITY: (m, rc, p, i) => m.handleUpgradeUtility(rc, p, (i as { cellIndex: number }).cellIndex),
  INTENT_DOWNGRADE: (m, rc, p, i) => m.handleDowngrade(rc, p, (i as { cellIndex: number }).cellIndex),
  INTENT_MORTGAGE: (m, rc, p, i) => m.handleMortgage(rc, p, (i as { cellIndex: number }).cellIndex),
  INTENT_REDEEM: (m, rc, p, i) => m.handleRedeem(rc, p, (i as { cellIndex: number }).cellIndex),
  INTENT_TRADE_OFFER: (m, rc, p, i) => {
    const ti = i as { sellerId: string; buyerId: string; cellIndex: number; price: number };
    return m.handleTradeOffer(rc, p, ti.sellerId, ti.buyerId, ti.cellIndex, ti.price);
  },
  INTENT_INVEST: (m, rc, p, i) => m.handleHoseInvest(rc, p, (i as { stake: number }).stake),
  INTENT_SKIP: (m, rc, p) => m.handleHoseSkip(rc, p),
  INTENT_BAIL_OUT: (m, rc, p) => m.handleBailOut(rc, p),
  INTENT_END_TURN: (m, rc, p) => {
    const r = m.handleEndTurn(rc, p);
    return { success: r !== undefined, reason: r ? undefined : 'INVALID_PHASE' };
  },
};

export function dispatchPlayerIntent(
  mgr: RoomManager,
  roomCode: string,
  playerId: string,
  intent: PlayerIntent,
): { success: boolean; reason?: string } {
  const room = mgr.getRoom(roomCode);
  if (room?.phase === TurnPhase.InsolvencyPhase) {
    if (intent.type !== 'INTENT_MORTGAGE' && intent.type !== 'INTENT_DOWNGRADE') {
      return { success: false, reason: 'INVALID_PHASE' };
    }
  }
  const handler = INTENT_DISPATCH[intent.type];
  return handler ? handler(mgr, roomCode, playerId, intent) : { success: false, reason: 'INVALID_INTENT' };
}

