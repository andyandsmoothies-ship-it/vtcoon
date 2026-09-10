// [UC-GAME-028/MSS] Auction Manager — Bỏ Qua & Đấu Giá Tự Động
import type { Room, Player } from '../domain/room';
import { TurnPhase } from '../domain/room';
import { PROPERTY_DEEDS, type PropertyRegistry } from '../domain/property_manager';
import { ActionRejectReason } from '../domain/action_reasons';

export interface AuctionSession {
  readonly cellIndex: number;
  readonly declinedPlayerId: string;
  highestBid: number;
  highestBidder?: string;
  passedPlayers?: Set<string>;
  insolvencyPlayerId?: string;  // [DEBT-S06-04] set when auction is a forced liquidation
  endTime?: number;
}

export function handleDecline(
  room: Room | undefined,
  current: Player | undefined,
  auctions: Map<string, AuctionSession>,
  roomCode: string,
): { success: boolean; reason?: string } {
  if (!current || room?.phase !== TurnPhase.ActionPhase) return { success: false, reason: 'INVALID_PHASE' };
  const deed = PROPERTY_DEEDS.get(current.position);
  if (!deed) return { success: false, reason: 'NOT_PURCHASABLE' };
  auctions.set(roomCode, {
    cellIndex: current.position,
    declinedPlayerId: current.id,
    highestBid: Math.floor(deed.price * 0.5),
    passedPlayers: new Set<string>(),
    endTime: Date.now() + 15_000,
  });
  room.phase = TurnPhase.AuctionPhase;
  return { success: true };
}

export function handleAuctionBid(
  room: Room | undefined,
  session: AuctionSession | undefined,
  playerId: string,
  amount: number,
  registry?: PropertyRegistry,
  auctions?: Map<string, AuctionSession>,
  roomCode?: string,
): { success: boolean; reason?: string } {
  if (!room?.started || room.phase !== TurnPhase.AuctionPhase || !session) return { success: false, reason: 'INVALID_PHASE' };
  if (playerId === session.declinedPlayerId) return { success: false, reason: ActionRejectReason.DECLINED_PLAYER_CANNOT_BID };
  if (session.passedPlayers?.has(playerId)) return { success: false, reason: 'PLAYER_ALREADY_PASSED' };
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isInteger(amount)) return { success: false, reason: 'BID_TOO_LOW' };
  const player = room.players.find((p) => p.id === playerId);
  if (!player) return { success: false, reason: 'PLAYER_NOT_FOUND' };
  if (session.highestBidder === playerId) return { success: false, reason: 'ALREADY_HIGHEST_BIDDER' };
  if (player.balance < amount) return { success: false, reason: 'INSUFFICIENT_FUNDS' };
  const minBid = session.highestBidder !== undefined ? session.highestBid + 100 : session.highestBid;
  if (amount < minBid) return { success: false, reason: 'BID_TOO_LOW' };
  session.highestBid = amount;
  session.highestBidder = playerId;

  if (session.endTime !== undefined) {
    const remainingSec = (session.endTime - Date.now()) / 1000;
    if (remainingSec <= 0) return { success: false, reason: 'AUCTION_EXPIRED' };
    if (remainingSec <= 3) {
      session.endTime += 3_000;
    }
  }

  const eligiblePlayers = room.players.filter((p) => p.id !== session.declinedPlayerId);
  const otherPlayers = eligiblePlayers.filter((p) => p.id !== playerId);
  if (otherPlayers.length > 0 && otherPlayers.every((p) => session.passedPlayers?.has(p.id))) {
    handleAuctionClose(room, session, registry, auctions, roomCode);
  }
  return { success: true };
}

export function handleAuctionPass(
  room: Room | undefined,
  session: AuctionSession | undefined,
  playerId: string,
  registry: PropertyRegistry | undefined,
  auctions?: Map<string, AuctionSession>,
  roomCode?: string,
): { success: boolean; reason?: string } {
  if (!room?.started || room.phase !== TurnPhase.AuctionPhase || !session) return { success: false, reason: 'INVALID_PHASE' };
  if (playerId === session.declinedPlayerId) return { success: false, reason: ActionRejectReason.DECLINED_PLAYER_CANNOT_BID };
  const player = room.players.find((p) => p.id === playerId);
  if (!player) return { success: false, reason: 'PLAYER_NOT_FOUND' };
  if (session.highestBidder === playerId) return { success: false, reason: 'HIGHEST_BIDDER_CANNOT_PASS' };
  if (session.passedPlayers?.has(playerId)) return { success: false, reason: 'PLAYER_ALREADY_PASSED' };

  if (!session.passedPlayers) session.passedPlayers = new Set<string>();
  session.passedPlayers.add(playerId);

  const eligiblePlayers = room.players.filter((p) => p.id !== session.declinedPlayerId);
  const targetPlayers = session.highestBidder
    ? eligiblePlayers.filter((p) => p.id !== session.highestBidder)
    : eligiblePlayers;

  if (targetPlayers.every((p) => session.passedPlayers!.has(p.id))) {
    handleAuctionClose(room, session, registry, auctions, roomCode);
  }
  return { success: true };
}

export function handleAuctionClose(
  room: Room | undefined,
  session: AuctionSession | undefined,
  registry: PropertyRegistry | undefined,
  auctions?: Map<string, AuctionSession>,
  roomCode?: string,
): { winnerId?: string; winningBid: number } {
  if (!room?.started || room.phase !== TurnPhase.AuctionPhase || !session) return { winnerId: undefined, winningBid: 0 };
  let winnerId: string | undefined;
  let winningBid = 0;
  if (session.highestBidder) {
    const winner = room.players.find((p) => p.id === session.highestBidder);
    if (winner && winner.balance >= session.highestBid) {
      winner.balance -= session.highestBid;
      registry?.set(session.cellIndex, winner.id);
      winnerId = session.highestBidder;
      winningBid = session.highestBid;

      // [DEBT-S06-04] Insolvency auction: proceeds clear debt, surplus returned to insolvent player
      if (session.insolvencyPlayerId) {
        const insolventPlayer = room.players.find((p) => p.id === session.insolvencyPlayerId);
        if (insolventPlayer) {
          if (!insolventPlayer.bankrupt) {
            insolventPlayer.balance += winningBid;
            if (insolventPlayer.balance >= 0) {
              room.phase = TurnPhase.PropertyManagement;
            }
          } else {
            room.treasury = (room.treasury ?? 0) + winningBid;
          }
        }
      }
    }
  } else {
    // [EC-10] Không ai đấu giá -> Ô đất chuyển sang chế độ phát mãi cưỡng chế Kho Bạc 70%
    const deed = PROPERTY_DEEDS.get(session.cellIndex);
    const floorPrice = deed ? Math.floor(deed.price * 0.70) : 0;
    console.info(JSON.stringify({
      event: 'AUCTION_FORECLOSED',
      correlationId: roomCode ?? room.roomCode,
      timestamp: Date.now(),
      delta: { cellIndex: session.cellIndex, reason: 'ALL_PLAYERS_PASSED', foreclosureRate: 0.70, foreclosurePrice: floorPrice },
    }));
  }
  const current = room.players[room.currentPlayerIndex];
  if (current?.bankrupt) {
    const total = room.players.length;
    let next = (room.currentPlayerIndex + 1) % total;
    let steps = 0;
    while (steps < total) {
      if (!room.players[next]?.bankrupt) break;
      next = (next + 1) % total;
      steps++;
    }
    room.currentPlayerIndex = next;
    const nextPlayer = room.players[next];
    if (nextPlayer?.skipNextTurn) {
      nextPlayer.skipNextTurn = false;
      room.phase = TurnPhase.PropertyManagement;
    } else {
      room.phase = TurnPhase.WaitingRoll;
    }
  } else {
    room.phase = TurnPhase.PropertyManagement;
  }
  if (auctions && roomCode) {
    auctions.delete(roomCode);
  }
  return { winnerId, winningBid };
}
