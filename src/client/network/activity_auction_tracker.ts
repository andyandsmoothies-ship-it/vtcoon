// [UI-S06/MSS] ActivityAuctionTracker — Auction Log Generation & Deduplication Subsystem
import type { DeltaPayload } from '../../server/session_manager.js';
import type { GameState } from '../store/game_store.js';
import { useActivityStore, type ActivityLogEntry } from '../store/activity_store.js';
import { formatCurrency } from '../ui/ui_helpers.js';
import { getPlayerName } from './activity_financial_tracker.js';
import { getCellName } from './activity_property_tracker.js';

export function resetAuctionActivityTracker(activityStore: typeof useActivityStore = useActivityStore): void {
  activityStore.getState().setLastAuctionBid(undefined);
}

export function detectAuctionActivities(
  delta: DeltaPayload,
  prevStateOrNextState: GameState,
  maybeNextState?: GameState,
  activityStore: typeof useActivityStore = useActivityStore,
): ActivityLogEntry[] {
  if (delta.auction === null) {
    const lastAuction = activityStore.getState().lastAuctionBid;
    activityStore.getState().setLastAuctionBid(undefined);
    if (lastAuction && lastAuction.highestBidderId) {
      const nextState = maybeNextState ?? prevStateOrNextState;
      const winner = nextState.playersInfo[lastAuction.highestBidderId];
      const winnerName = getPlayerName(winner, lastAuction.highestBidderId);
      return [
        {
          id: `auction_win_${Date.now()}_${lastAuction.cellIndex}_${lastAuction.currentBid}`,
          timestamp: Date.now(),
          type: 'auction',
          message: `🔨 [Đấu Giá] Búa gõ thành công! ${winnerName} đã trúng đấu giá ${getCellName(lastAuction.cellIndex)} với giá ${formatCurrency(lastAuction.currentBid)}!`,
          playerId: lastAuction.highestBidderId,
          playerName: winnerName,
          amount: -lastAuction.currentBid,
          cellIndex: lastAuction.cellIndex,
          ...(winner?.tokenColor ? { playerTokenColor: winner.tokenColor } : {}),
        },
      ];
    }
    return [];
  }

  if (
    delta.auction &&
    !delta.auction.isForeclosure &&
    !delta.auction.insolvencyPlayerId &&
    (!prevStateOrNextState.auction || prevStateOrNextState.auction.cellIndex !== delta.auction.cellIndex) &&
    delta.auction.declinedPlayerId
  ) {
    const nextState = maybeNextState ?? prevStateOrNextState;
    const declId = delta.auction.declinedPlayerId;
    const declPlayer = nextState.playersInfo[declId];
    if (declPlayer?.isBot) {
      const declName = getPlayerName(declPlayer, declId);
      const cellName = getCellName(delta.auction.cellIndex);
      return [{
        id: `decline_auction_${Date.now()}_${delta.auction.cellIndex}`,
        timestamp: Date.now(),
        type: 'auction',
        message: `${declName} đã bỏ qua ${cellName} ➔ Mở Đấu Giá`,
        playerId: declId,
        playerName: declName,
        cellIndex: delta.auction.cellIndex,
        ...(declPlayer.tokenColor ? { playerTokenColor: declPlayer.tokenColor } : {}),
      }];
    }
  }

  if (!delta.auction || !delta.auction.highestBidderId) return [];

  const { cellIndex, currentBid, highestBidderId } = delta.auction;
  const lastAuction = activityStore.getState().lastAuctionBid;

  if (
    lastAuction &&
    lastAuction.cellIndex === cellIndex &&
    lastAuction.currentBid === currentBid &&
    lastAuction.highestBidderId === highestBidderId
  ) {
    return [];
  }

  activityStore.getState().setLastAuctionBid({ cellIndex, currentBid, highestBidderId });

  const nextState = maybeNextState ?? prevStateOrNextState;
  const bidder = nextState.playersInfo[highestBidderId];
  const bidderName = getPlayerName(bidder, highestBidderId);

  return [
    {
      id: `auction_${Date.now()}_${cellIndex}_${currentBid}`,
      timestamp: Date.now(),
      type: 'auction',
      message: `${bidderName} đã đặt giá ${formatCurrency(currentBid)} cho ${getCellName(cellIndex)}`,
      playerId: highestBidderId,
      playerName: bidderName,
      amount: -currentBid,
      cellIndex: cellIndex,
      ...(bidder?.tokenColor ? { playerTokenColor: bidder.tokenColor } : {}),
    },
  ];
}
