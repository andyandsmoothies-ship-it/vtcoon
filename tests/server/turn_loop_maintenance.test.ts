// [IMP-310] Living Contract Tests: Turn Loop Maintenance & GO Pass Debt Handlers
import { describe, it, expect } from 'vitest';
import {
  isTradeFrozen,
  processPendingDebts,
  processGoElectricBilling,
  processUnbuiltRounds,
} from '../../src/server/turn_loop_maintenance.js';
import { createPlayer, createRoom, TurnPhase } from '../../src/domain/room.js';
import { MarketCardId, ChanceCardId } from '../../src/domain/event_card_types.js';
import type { PropertyRegistry, PropertyStateMap } from '../../src/domain/property_manager.js';
import { PROPERTY_DEEDS } from '../../src/domain/property_manager.js';
import type { AuctionSession } from '../../src/server/auction_manager.js';

describe('Station 1 Contract Tests: Turn Loop Maintenance', () => {
  it('TC-TLM-TRD.01 [UC-TLM-TRD/MSS] isTradeFrozen returns true when MC_FREEZE_TRADE modifier has positive remaining rounds', () => {
    const room = createRoom('R-TRD-1', 'host-1');
    room.activeModifiers = [
      { type: MarketCardId.MC_FREEZE_TRADE, affectedCells: [], remainingRounds: 2, multiplier: 0 },
    ];

    expect(isTradeFrozen(room)).toBe(true);
  });

  it('TC-TLM-TRD.02 [UC-TLM-TRD/MSS] isTradeFrozen returns false when MC_FREEZE_TRADE modifier has zero remaining rounds', () => {
    const room = createRoom('R-TRD-2', 'host-2');
    room.activeModifiers = [
      { type: MarketCardId.MC_FREEZE_TRADE, affectedCells: [], remainingRounds: 0, multiplier: 0 },
    ];

    expect(isTradeFrozen(room)).toBe(false);
  });

  it('TC-TLM-TRD.03 [UC-TLM-TRD/MSS] isTradeFrozen returns false when no trade freeze modifiers exist in room', () => {
    const room = createRoom('R-TRD-3', 'host-3');
    room.activeModifiers = [];

    expect(isTradeFrozen(room)).toBe(false);
  });

  it('TC-TLM-DEBT.01 [UC-TLM-DEBT/MSS] processPendingDebts deducts 400 Tr. interest into treasury for player holding CC_FREE_CREDIT', () => {
    const player = createPlayer('p-debt-1');
    player.balance = 2000;
    player.hand = [ChanceCardId.CC_FREE_CREDIT];
    const room = createRoom('R-DEBT-1', player.id);
    room.treasury = 500;

    processPendingDebts(room, player);

    expect(player.balance).toBe(1600);
    expect(room.treasury).toBe(900);
  });

  it('TC-TLM-DEBT.02 [UC-TLM-DEBT/MSS] processPendingDebts decrements countdown when CC_OVERDRAFT has rounds left > 1', () => {
    const player = createPlayer('p-debt-2');
    player.balance = 5000;
    player.overdraftRoundsLeft = 3;
    player.pendingDebts = [ChanceCardId.CC_OVERDRAFT];
    const room = createRoom('R-DEBT-2', player.id);

    processPendingDebts(room, player);

    expect(player.overdraftRoundsLeft).toBe(2);
    expect(player.balance).toBe(5000);
    expect(player.pendingDebts.includes(ChanceCardId.CC_OVERDRAFT)).toBe(true);
  });

  it('TC-TLM-DEBT.03 [UC-TLM-DEBT/MSS] processPendingDebts reclaims 3300 Tr. and clears debt when overdraft reaches round 0', () => {
    const player = createPlayer('p-debt-3');
    player.balance = 4000;
    player.overdraftRoundsLeft = 1;
    player.pendingDebts = [ChanceCardId.CC_OVERDRAFT];
    const room = createRoom('R-DEBT-3', player.id);

    processPendingDebts(room, player);

    expect(player.overdraftRoundsLeft).toBe(0);
    expect(player.balance).toBe(700);
    expect(player.pendingDebts.includes(ChanceCardId.CC_OVERDRAFT)).toBe(false);
  });

  it('TC-TLM-EVN.01 [UC-TLM-EVN/MSS] processGoElectricBilling charges electric bill and pays EVN owner on cell 12', () => {
    const passingPlayer = createPlayer('p-pass');
    passingPlayer.balance = 5000;
    const evnOwner = createPlayer('p-evn');
    evnOwner.balance = 1000;

    const room = createRoom('R-EVN-1', passingPlayer.id);
    room.players = [passingPlayer, evnOwner];

    const registry: PropertyRegistry = new Map([[12, evnOwner.id], [1, passingPlayer.id]]);
    const stateMap: PropertyStateMap = new Map([[1, { level: 1 }]]);

    processGoElectricBilling(room, passingPlayer, registry, stateMap);

    expect(passingPlayer.balance).toBeLessThan(5000);
    expect(evnOwner.balance).toBeGreaterThan(1000);
  });

  it('TC-TLM-EVN.02 [UC-TLM-EVN/A1] processGoElectricBilling skips billing if passing player owns EVN utility themselves', () => {
    const player = createPlayer('p-self-evn');
    player.balance = 5000;
    const room = createRoom('R-EVN-2', player.id);
    room.players = [player];
    const registry: PropertyRegistry = new Map([[12, player.id]]);

    processGoElectricBilling(room, player, registry);

    expect(player.balance).toBe(5000);
  });

  it('TC-TLM-EVN.03 [UC-TLM-EVN/A2] processGoElectricBilling skips billing if EVN owner is bankrupt or in audit', () => {
    const passingPlayer = createPlayer('p-pass-2');
    passingPlayer.balance = 5000;
    const evnOwner = createPlayer('p-evn-aud');
    evnOwner.balance = 1000;
    evnOwner.inAudit = true;

    const room = createRoom('R-EVN-3', passingPlayer.id);
    room.players = [passingPlayer, evnOwner];
    const registry: PropertyRegistry = new Map([[12, evnOwner.id]]);

    processGoElectricBilling(room, passingPlayer, registry);

    expect(passingPlayer.balance).toBe(5000);
    expect(evnOwner.balance).toBe(1000);
  });

  it('TC-TLM-EVN.04 [UC-TLM-EVN/A3] processGoElectricBilling skips billing if cell 12 is mortgaged in stateMap', () => {
    const passingPlayer = createPlayer('p-pass-3');
    passingPlayer.balance = 5000;
    const evnOwner = createPlayer('p-evn-mort');
    evnOwner.balance = 1000;

    const room = createRoom('R-EVN-4', passingPlayer.id);
    room.players = [passingPlayer, evnOwner];
    const registry: PropertyRegistry = new Map([[12, evnOwner.id]]);
    const stateMap: PropertyStateMap = new Map([[12, { level: 0, isMortgaged: true }]]);

    processGoElectricBilling(room, passingPlayer, registry, stateMap);

    expect(passingPlayer.balance).toBe(5000);
    expect(evnOwner.balance).toBe(1000);
  });

  it('TC-TLM-UNB.01 [UC-TLM-UNB/MSS] processUnbuiltRounds increments unbuiltRounds counter when under ceiling', () => {
    const player = createPlayer('p-unb-1');
    const room = createRoom('R-UNB-1', player.id);
    const registry: PropertyRegistry = new Map([[1, player.id]]);
    const stateMap: PropertyStateMap = new Map([[1, { level: 0, unbuiltRounds: 0 }]]);
    const auctions = new Map<string, AuctionSession>();

    processUnbuiltRounds(room, player, registry, stateMap, auctions, room.roomCode);

    expect(stateMap.get(1)?.unbuiltRounds).toBe(1);
    expect(room.phase).toBe(TurnPhase.WaitingRoll);
  });

  it('TC-TLM-UNB.02 [UC-TLM-UNB/MSS] processUnbuiltRounds reclaims cell and opens 50% auction when unbuiltRounds exceeds 2', () => {
    const player = createPlayer('p-unb-2');
    const room = createRoom('R-UNB-2', player.id);
    room.phase = TurnPhase.PropertyManagement;

    const cellIndex = 1;
    const deed = PROPERTY_DEEDS.get(cellIndex);
    const expectedStartingBid = Math.floor((deed?.price ?? 1000) * 0.50);

    const registry: PropertyRegistry = new Map([[cellIndex, player.id]]);
    const stateMap: PropertyStateMap = new Map([[cellIndex, { level: 0, unbuiltRounds: 2 }]]);
    const auctions = new Map<string, AuctionSession>();

    processUnbuiltRounds(room, player, registry, stateMap, auctions, room.roomCode);

    expect(registry.has(cellIndex)).toBe(false);
    expect(stateMap.get(cellIndex)?.unbuiltRounds).toBeUndefined();
    expect(room.phase).toBe(TurnPhase.AuctionPhase);
    expect(auctions.get(room.roomCode)?.startingBid).toBe(expectedStartingBid);
  });

  it('TC-TLM-UNB.03 [UC-TLM-UNB/MSS] processUnbuiltRounds purges mortgaged state from player when property is reclaimed', () => {
    const player = createPlayer('p-unb-3');
    player.mortgagedProperties = [1];
    player.mortgageLoans = { 1: 500 };
    const room = createRoom('R-UNB-3', player.id);

    const registry: PropertyRegistry = new Map([[1, player.id]]);
    const stateMap: PropertyStateMap = new Map([[1, { level: 0, unbuiltRounds: 2, isMortgaged: true }]]);
    const auctions = new Map<string, AuctionSession>();

    processUnbuiltRounds(room, player, registry, stateMap, auctions, room.roomCode);

    expect(player.mortgagedProperties.includes(1)).toBe(false);
    expect(player.mortgageLoans[1]).toBeUndefined();
  });

  it('TC-TLM-UNB.04 [UC-TLM-UNB/MSS] processUnbuiltRounds ignores properties owned by other players', () => {
    const currentPlayer = createPlayer('p-curr');
    const otherPlayer = createPlayer('p-other');
    const room = createRoom('R-UNB-4', currentPlayer.id);

    const registry: PropertyRegistry = new Map([[1, otherPlayer.id]]);
    const stateMap: PropertyStateMap = new Map([[1, { level: 0, unbuiltRounds: 2 }]]);
    const auctions = new Map<string, AuctionSession>();

    processUnbuiltRounds(room, currentPlayer, registry, stateMap, auctions, room.roomCode);

    expect(registry.get(1)).toBe(otherPlayer.id);
    expect(stateMap.get(1)?.unbuiltRounds).toBe(2);
    expect(room.phase).toBe(TurnPhase.WaitingRoll);
  });
});
