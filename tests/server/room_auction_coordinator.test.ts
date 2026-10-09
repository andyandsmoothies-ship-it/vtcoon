// [IMP-305] Living Contract Tests: Room Auction Coordinator
import { describe, it, expect, beforeEach } from 'vitest';
import { RoomManager } from '../../src/server/room_manager.js';
import { TurnPhase } from '../../src/domain/room.js';
import {
  coordAuctionDecline,
  coordAuctionBid,
  coordAuctionPass,
  coordAuctionClose,
  coordGetLastAuctionResult,
  coordClearLastAuctionResult,
  coordStepAuctionBot,
  coordGetAuctionSession,
} from '../../src/server/room_auction_coordinator.js';

describe('Station 1 Contract Tests: RoomAuctionCoordinator', () => {
  let rm: RoomManager;
  let roomCode: string;

  beforeEach(() => {
    rm = new RoomManager(42);
    const room = rm.createRoom('pA');
    roomCode = room.roomCode;
    rm.joinRoom(roomCode, 'pB');
    rm.joinRoom(roomCode, 'pC');
    rm.startGame(roomCode);
    room.players[0]!.position = 3;
    room.phase = TurnPhase.ActionPhase;
  });

  it('TC-RAC.01 [UC-RAC/MSS] coordAuctionDecline returns error when session is undefined', () => {
    const res = coordAuctionDecline(undefined, 'pA', rm.auctions);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('INVALID_ROOM');
  });

  it('TC-RAC.02 [UC-RAC/MSS] coordAuctionDecline opens auction when called by active player', () => {
    const s = rm.getSession(roomCode);
    const res = coordAuctionDecline(s, 'pA', rm.auctions);
    expect(res.success).toBe(true);
    expect(s?.room.phase).toBe(TurnPhase.AuctionPhase);
  });

  it('TC-RAC.03 [UC-RAC/MSS] coordAuctionBid returns error when session is undefined', () => {
    const res = coordAuctionBid(undefined, 'pB', 500, rm.auctions);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('INVALID_ROOM');
  });

  it('TC-RAC.04 [UC-RAC/MSS] coordAuctionBid processes valid bid and updates highestBidder', () => {
    const s = rm.getSession(roomCode);
    coordAuctionDecline(s, 'pA', rm.auctions);
    const res = coordAuctionBid(s, 'pB', 400, rm.auctions);
    expect(res.success).toBe(true);
    expect(s?.auction?.highestBidder).toBe('pB');
  });

  it('TC-RAC.05 [UC-RAC/MSS] coordAuctionPass returns error when session is undefined', () => {
    const res = coordAuctionPass(undefined, 'pB', rm.auctions);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('INVALID_ROOM');
  });

  it('TC-RAC.06 [UC-RAC/MSS] coordAuctionPass records player pass in session', () => {
    const s = rm.getSession(roomCode);
    coordAuctionDecline(s, 'pA', rm.auctions);
    const res = coordAuctionPass(s, 'pB', rm.auctions);
    expect(res.success).toBe(true);
    expect(s?.auction?.passedPlayers?.has('pB')).toBe(true);
  });

  it('TC-RAC.07 [UC-RAC/MSS] coordAuctionClose records winning bid and transfers property', () => {
    const s = rm.getSession(roomCode);
    coordAuctionDecline(s, 'pA', rm.auctions);
    coordAuctionBid(s, 'pB', 400, rm.auctions);
    const res = coordAuctionClose(s, rm.auctions, roomCode);
    expect(res.winnerId).toBe('pB');
    expect(res.winningBid).toBe(400);
    expect(s?.registry.get(3)).toBe('pB');
  });

  it('TC-RAC.08 [UC-RAC/MSS] coordAuctionClose caches lastAuctionResult on session and room', () => {
    const s = rm.getSession(roomCode);
    coordAuctionDecline(s, 'pA', rm.auctions);
    coordAuctionBid(s, 'pB', 400, rm.auctions);
    coordAuctionClose(s, rm.auctions, roomCode);
    expect(s?.lastAuctionResult?.winnerId).toBe('pB');
    expect(s?.room.lastAuctionResult?.winningBid).toBe(400);
  });

  it('TC-RAC.09 [UC-RAC/MSS] coordGetLastAuctionResult retrieves cached auction result', () => {
    const s = rm.getSession(roomCode);
    coordAuctionDecline(s, 'pA', rm.auctions);
    coordAuctionBid(s, 'pB', 400, rm.auctions);
    coordAuctionClose(s, rm.auctions, roomCode);
    const res = coordGetLastAuctionResult(s);
    expect(res?.winnerId).toBe('pB');
    expect(res?.winningBid).toBe(400);
  });

  it('TC-RAC.10 [UC-RAC/MSS] coordClearLastAuctionResult clears cached auction result from session and room', () => {
    const s = rm.getSession(roomCode);
    coordAuctionDecline(s, 'pA', rm.auctions);
    coordAuctionBid(s, 'pB', 400, rm.auctions);
    coordAuctionClose(s, rm.auctions, roomCode);
    coordClearLastAuctionResult(s);
    expect(coordGetLastAuctionResult(s)).toBeUndefined();
    expect(s?.room.lastAuctionResult).toBeUndefined();
  });

  it('TC-RAC.11 [UC-RAC/MSS] coordGetAuctionSession returns auction session from GameRoomSession', () => {
    const s = rm.getSession(roomCode);
    expect(coordGetAuctionSession(s)).toBeUndefined();
    coordAuctionDecline(s, 'pA', rm.auctions);
    expect(coordGetAuctionSession(s)?.cellIndex).toBe(3);
  });

  it('TC-RAC.12 [UC-RAC/MSS] coordStepAuctionBot delegates bot auction stepping', () => {
    const s = rm.getSession(roomCode);
    coordAuctionDecline(s, 'pA', rm.auctions);
    const res = coordStepAuctionBot(rm, roomCode);
    expect(typeof res.changed).toBe('boolean');
    expect(typeof res.finished).toBe('boolean');
  });

  it('TC-RAC.13 [UC-RAC/MSS] RoomManager delegates auction operations seamlessly', () => {
    const decline = rm.handleDecline(roomCode, 'pA');
    expect(decline.success).toBe(true);
    const bid = rm.handleAuctionBid(roomCode, 'pB', 400);
    expect(bid.success).toBe(true);
    const close = rm.handleAuctionClose(roomCode);
    expect(close.winnerId).toBe('pB');
  });
});
