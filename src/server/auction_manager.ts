// [UC-GAME-028/MSS] Auction Manager — Bỏ Qua & Đấu Giá Tự Động
import type { Room, Player } from '../domain/room';
import { TurnPhase } from '../domain/room';
import { PROPERTY_DEEDS, type PropertyRegistry, type PropertyStateMap } from '../domain/property_manager';
import { ActionRejectReason } from '../domain/action_reasons';
import { handleStartFireSaleAuction } from './bond_manager';
import { advanceTurnToNextPlayer } from './turn_loop';
import { MarketCardId } from '../domain/event_card_types';


export interface AuctionSession {
  readonly cellIndex: number;
  readonly declinedPlayerId: string;
  highestBid: number;
  startingBid?: number;
  currentBid?: number;
  highestBidder?: string;
  passedPlayers?: Set<string>;
  insolvencyPlayerId?: string;  // [DEBT-S06-04] set when auction is a forced liquidation
  endTime?: number;
  isFireSale?: boolean;
}

export function handleDecline(
  room: Room | undefined,
  current: Player | undefined,
  auctions: Map<string, AuctionSession>,
  roomCode: string,
): { success: boolean; reason?: string } {
  if (!current || room?.phase !== TurnPhase.ActionPhase) return { success: false, reason: 'INVALID_PHASE' };
  if ((room?.activeModifiers ?? []).some((m) => m.type === MarketCardId.MC_FREEZE_TRADE && m.remainingRounds > 0)) {
    room.phase = TurnPhase.PropertyManagement;
    return { success: true };
  }
  const deed = PROPERTY_DEEDS.get(current.position);
  if (!deed) return { success: false, reason: 'NOT_PURCHASABLE' };
  const startingBid = Math.floor(deed.price * 0.50);
  const session: AuctionSession = {
    cellIndex: current.position,
    declinedPlayerId: current.id,
    highestBid: startingBid,
    startingBid,
    currentBid: startingBid,
    passedPlayers: new Set<string>(),
    endTime: Date.now() + 20_000,
  };
  auctions.set(roomCode, session);
  room.phase = TurnPhase.AuctionPhase;

  // [IMP-227] Zero-Ghost-Variable Guard: Nếu không còn bất kỳ ai khác đủ tư cách tham gia, lập tức cưỡng chế phát mãi Kho Bạc
  const eligiblePlayers = room.players.filter((p) => p.id !== current.id && !p.bankrupt);
  if (eligiblePlayers.length === 0) {
    handleAuctionClose(room, session, undefined, auctions, roomCode, undefined);
    return { success: true };
  }

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
  stateMap?: PropertyStateMap,
): { success: boolean; reason?: string } {
  if (!room?.started || room.phase !== TurnPhase.AuctionPhase || !session) return { success: false, reason: 'INVALID_PHASE' };
  if (playerId === session.declinedPlayerId) return { success: false, reason: ActionRejectReason.DECLINED_PLAYER_CANNOT_BID };
  if (session.passedPlayers?.has(playerId)) return { success: false, reason: 'PLAYER_ALREADY_PASSED' };
  const isZeroFireSaleBid = Boolean(session.isFireSale && session.highestBidder === undefined && amount === 0);
  if (!Number.isFinite(amount) || (!isZeroFireSaleBid && amount <= 0) || amount < 0 || !Number.isInteger(amount)) return { success: false, reason: 'BID_TOO_LOW' };
  const player = room.players.find((p) => p.id === playerId);
  if (!player) return { success: false, reason: 'PLAYER_NOT_FOUND' };
  if (player.bankrupt) return { success: false, reason: 'INVALID_PLAYER' };
  if (session.highestBidder === playerId) return { success: false, reason: 'ALREADY_HIGHEST_BIDDER' };
  if (player.balance < amount) return { success: false, reason: 'INSUFFICIENT_FUNDS' };
  const minBid = session.highestBidder !== undefined ? session.highestBid + 50 : (session.isFireSale ? 0 : session.highestBid);
  if (amount < minBid) return { success: false, reason: 'BID_TOO_LOW' };
  if (session.endTime !== undefined) {
    const remainingSec = (session.endTime - Date.now()) / 1000;
    if (remainingSec <= 0) return { success: false, reason: 'AUCTION_EXPIRED' };
    if (remainingSec <= 3 && remainingSec > 0) {
      session.endTime += 3_000;
    }
  }
  session.highestBid = amount;
  session.currentBid = amount;
  session.highestBidder = playerId;

  if (player.isBot) {
    session.endTime = Date.now() + 20_000;
  }

  const eligiblePlayers = room.players.filter((p) => p.id !== session.declinedPlayerId && !p.bankrupt);
  const otherPlayers = eligiblePlayers.filter((p) => p.id !== playerId);
  // [IMP-227] Khi không còn đối thủ nào khác (otherPlayers.length === 0) hoặc tất cả đối thủ còn lại đã Pass,
  // bidder hợp lệ này lập tức thắng phiên đấu giá mà không cần chờ timeout đếm ngược.
  if (otherPlayers.every((p) => session.passedPlayers?.has(p.id))) {
    handleAuctionClose(room, session, registry, auctions, roomCode, stateMap);
  }
  return { success: true };
}

export function handleAuctionPass(
  room: Room | undefined,
  session: AuctionSession | undefined,
  playerId: string,
  registry?: PropertyRegistry,
  auctions?: Map<string, AuctionSession>,
  roomCode?: string,
  stateMap?: PropertyStateMap,
): { success: boolean; reason?: string } {
  if (!room?.started || room.phase !== TurnPhase.AuctionPhase || !session) return { success: false, reason: 'INVALID_PHASE' };
  if (playerId === session.declinedPlayerId) return { success: false, reason: ActionRejectReason.DECLINED_PLAYER_CANNOT_BID };
  const player = room.players.find((p) => p.id === playerId);
  if (!player) return { success: false, reason: 'PLAYER_NOT_FOUND' };
  if (player.bankrupt) return { success: false, reason: 'INVALID_PLAYER' };
  if (session.highestBidder === playerId) return { success: false, reason: 'HIGHEST_BIDDER_CANNOT_PASS' };
  if (session.passedPlayers?.has(playerId)) return { success: false, reason: 'PLAYER_ALREADY_PASSED' };

  if (!session.passedPlayers) session.passedPlayers = new Set<string>();
  session.passedPlayers.add(playerId);
  if (player.isBot) {
    session.endTime = Date.now() + 20_000;
  }

  const eligiblePlayers = room.players.filter((p) => p.id !== session.declinedPlayerId && !p.bankrupt);
  const targetPlayers = session.highestBidder
    ? eligiblePlayers.filter((p) => p.id !== session.highestBidder)
    : eligiblePlayers;

  // [IMP-227] Actor Inversion Guard: Chỉ chờ Human nếu Human THỰC SỰ ĐỦ TƯ CÁCH đấu giá (không bị declined, không phá sản)
  const hasHumanEligible = eligiblePlayers.some((p) => !p.isBot);
  const shouldClose = session.highestBidder
    ? targetPlayers.every((p) => session.passedPlayers!.has(p.id))
    : targetPlayers.every((p) => session.passedPlayers!.has(p.id)) && (!player.isBot || !hasHumanEligible);

  if (shouldClose) {
    handleAuctionClose(room, session, registry, auctions, roomCode, stateMap);
  }
  return { success: true };
}

function processNextFireSaleQueueItem(
  room: Room,
  auctions: Map<string, AuctionSession> | undefined,
  roomCode: string | undefined,
  currentCellIndex: number,
): boolean {
  if (room.fireSaleQueue && room.fireSaleQueue.length > 0 && room.fireSaleQueue[0] === currentCellIndex) {
    room.fireSaleQueue.shift();
  }
  if (room.fireSaleQueue && room.fireSaleQueue.length > 0) {
    const nextCell = room.fireSaleQueue.shift()!;
    handleStartFireSaleAuction(room, nextCell, auctions, roomCode, room.fireSaleDebtorId);
    return true;
  }
  if (room.fireSaleQueue && room.fireSaleQueue.length === 0) {
    delete room.fireSaleQueue;
    delete room.fireSaleDebtorId;
    advanceTurnToNextPlayer(room);
    return true;
  }
  return false;
}

export function handleAuctionClose(
  room: Room | undefined,
  session: AuctionSession | undefined,
  registry: PropertyRegistry | undefined,
  auctions?: Map<string, AuctionSession>,
  roomCode?: string,
  stateMap?: PropertyStateMap,
): { winnerId?: string; winningBid: number; cellIndex: number; isForeclosure: boolean } {
  if (!room?.started || room.phase !== TurnPhase.AuctionPhase || !session) return { winnerId: undefined, winningBid: 0, cellIndex: session?.cellIndex ?? 0, isForeclosure: true };
  let winnerId: string | undefined;
  let winningBid = 0;
  if (session.highestBidder) {
    const winner = room.players.find((p) => p.id === session.highestBidder);
    if (winner && winner.balance >= session.highestBid) {
      winner.balance -= session.highestBid;
      registry?.set(session.cellIndex, winner.id);
      winnerId = session.highestBidder;
      winningBid = session.highestBid;

      if (stateMap) {
        const st = stateMap.get(session.cellIndex);
        if (st) {
          st.isMortgaged = false;
          delete (st as { unbuiltRounds?: number }).unbuiltRounds;
        }
      }

      for (const p of room.players) {
        if (p.mortgagedProperties?.includes(session.cellIndex)) {
          p.mortgagedProperties = p.mortgagedProperties.filter((c) => c !== session.cellIndex);
        }
      }

      if (session.insolvencyPlayerId) {
        const insolventPlayer = room.players.find((p) => p.id === session.insolvencyPlayerId);
        if (insolventPlayer) {
          const outstandingLoan = insolventPlayer.mortgageLoans?.[session.cellIndex] ?? 0;
          if (insolventPlayer.mortgageLoans) {
            delete insolventPlayer.mortgageLoans[session.cellIndex];
          }

          if (!insolventPlayer.bankrupt) {
            // [TREASURY-INVARIANT] Ưu tiên thu hồi nợ gốc thế chấp cho Kho Bạc
            const loanPayoff = Math.min(winningBid, outstandingLoan);
            const surplus = winningBid - loanPayoff;
            if (loanPayoff > 0) {
              room.treasury = (room.treasury ?? 0) + loanPayoff;
            }
            insolventPlayer.balance += surplus;
            if (insolventPlayer.balance >= 0) {
              room.phase = TurnPhase.PropertyManagement;
            }
          } else {
            room.treasury = (room.treasury ?? 0) + winningBid;
          }
        }
      } else {
        // [TREASURY-CONSERVATION] Đấu giá từ chối mua, thu hồi dự án treo, hoặc fire sale
        room.treasury = (room.treasury ?? 0) + winningBid;
      }
    }
  } else {
    if (session.isFireSale) {
      registry?.delete(session.cellIndex);
      stateMap?.delete(session.cellIndex);
    }
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

  if (room) {
    room.lastAuctionResult = {
      cellIndex: session.cellIndex,
      winnerId: winnerId ?? null,
      winningBid,
      finalPrice: winningBid,
      isForeclosure: !winnerId,
    };
  }
  if (auctions && roomCode) {
    auctions.delete(roomCode);
  }

  // Xử lý hàng đợi phát mãi
  if (processNextFireSaleQueueItem(room, auctions, roomCode, session.cellIndex)) {
    return { winnerId, winningBid, cellIndex: session.cellIndex, isForeclosure: !winnerId };
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
  return { winnerId, winningBid, cellIndex: session.cellIndex, isForeclosure: !winnerId };
}
