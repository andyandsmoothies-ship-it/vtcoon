// [IMP-305] Room Auction Coordinator
import {
  handleDecline,
  handleAuctionBid,
  handleAuctionPass,
  handleAuctionClose,
  type AuctionSession,
} from './auction_manager.js';
import { stepAuctionBot as delegateStepAuctionBot } from './room_bot_coordinator.js';
import { getActivePlayerFn } from './room_manager_lifecycle.js';
import type { GameRoomSession } from './game_room_session.js';
import type { RoomManager, AuctionResult } from './room_manager.js';

export function syncAuctionSession(s: GameRoomSession | undefined): void {
  if (s) s.auction = s.auction;
}

export function coordAuctionDecline(
  s: GameRoomSession | undefined,
  playerId: string,
  auctions: Map<string, AuctionSession>,
): { success: boolean; reason?: string } {
  if (!s) return { success: false, reason: 'INVALID_ROOM' };
  const player = getActivePlayerFn(s.room, playerId);
  const res = handleDecline(s.room, player, auctions, s.roomCode);
  syncAuctionSession(s);
  return res;
}

export function coordAuctionBid(
  s: GameRoomSession | undefined,
  playerId: string,
  amount: number,
  auctions: Map<string, AuctionSession>,
): { success: boolean; reason?: string } {
  if (!s) return { success: false, reason: 'INVALID_ROOM' };
  const res = handleAuctionBid(s.room, s.auction, playerId, amount, s.registry, auctions, s.roomCode, s.propertyStates);
  syncAuctionSession(s);
  if (s.room.lastAuctionResult) s.lastAuctionResult = s.room.lastAuctionResult;
  return res;
}

export function coordAuctionPass(
  s: GameRoomSession | undefined,
  playerId: string,
  auctions: Map<string, AuctionSession>,
): { success: boolean; reason?: string } {
  if (!s) return { success: false, reason: 'INVALID_ROOM' };
  const res = handleAuctionPass(s.room, s.auction, playerId, s.registry, auctions, s.roomCode, s.propertyStates);
  syncAuctionSession(s);
  if (s.room.lastAuctionResult) s.lastAuctionResult = s.room.lastAuctionResult;
  return res;
}

export function coordAuctionClose(
  s: GameRoomSession | undefined,
  auctions: Map<string, AuctionSession>,
  fallbackRoomCode: string,
): { winnerId?: string; winningBid: number; cellIndex: number; isForeclosure: boolean } {
  const session = s?.auction;
  const cellIndex = session?.cellIndex ?? 0;
  const roomCode = s?.roomCode ?? fallbackRoomCode;
  const res = handleAuctionClose(s?.room, session, s?.registry, auctions, roomCode, s?.propertyStates);
  syncAuctionSession(s);
  const result: AuctionResult = {
    cellIndex,
    winnerId: res.winnerId ?? null,
    winningBid: res.winningBid,
    finalPrice: res.winningBid,
    isForeclosure: !res.winnerId,
  };
  if (s) {
    s.lastAuctionResult = result;
    s.room.lastAuctionResult = result;
  }
  return res;
}

export function coordGetLastAuctionResult(
  s: GameRoomSession | undefined,
): AuctionResult | undefined {
  return s?.room.lastAuctionResult ?? s?.lastAuctionResult;
}

export function coordClearLastAuctionResult(
  s: GameRoomSession | undefined,
): void {
  if (s) {
    s.lastAuctionResult = undefined;
    s.room.lastAuctionResult = undefined;
  }
}

export function coordStepAuctionBot(
  rm: RoomManager,
  roomCode: string,
): { changed: boolean; finished: boolean } {
  const res = delegateStepAuctionBot(rm, roomCode);
  syncAuctionSession(rm.getSession(roomCode));
  return res;
}

export function coordGetAuctionSession(
  s: GameRoomSession | undefined,
): AuctionSession | undefined {
  return s?.auction;
}
