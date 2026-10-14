// [CONTRACT TEST] IMP-392: Shared Wire Protocol Facade & Client Network/Events/Store/Telemetry Boundary Purge
// Universal 5-Facet Behavioral Matrix & Adversarial Inversion Verification
import { describe, it, expect, beforeEach } from 'vitest';
import {
  CELL_INTENTS,
  VALID_INTENTS,
  isValidPlayerIntentFields,
  type DeltaPayload,
} from '../../src/domain/protocol/index.js';
import { BondTrancheId } from '../../src/domain/bond_types.js';
import {
  EnvelopeValidator,
  VALID_INTENTS as ServerValidIntents,
} from '../../src/server/security/envelope_validator.js';
import { encodeMsg } from '../../src/server/network/network_types.js';
import type { DeltaPayload as ServerDeltaPayload } from '../../src/server/delta_types.js';
import type { PlayerIntent as ServerPlayerIntent } from '../../src/server/intent_dispatcher.js';
import type { AdminRoomDetail as ServerAdminRoomDetail } from '../../src/server/network/admin_types.js';
import { applyDeltaToStore } from '../../src/client/network/apply_delta.js';
import { useGameStore } from '../../src/client/store/game_store.js';

describe('[IMP-392] Shared Wire Protocol Facade & Network Boundary Contract Suite', () => {
  beforeEach(() => {
    useGameStore.getState().resetGameState?.();
  });

  it('TC-392.01 [UC-PROTO-INTENT-CELL-BOUNDS/MSS]: validates board cell index bounds [0, 39] for cell intents and optional INTENT_UPGRADE_ETC while rejecting unknown intent types', () => {
    const validCellIntents =
      isValidPlayerIntentFields({ type: 'INTENT_UPGRADE', cellIndex: 5 }) &&
      isValidPlayerIntentFields({ type: 'INTENT_UPGRADE', cellIndex: 0 }) &&
      isValidPlayerIntentFields({ type: 'INTENT_UPGRADE', cellIndex: 39 });
    const validEtcIntents =
      isValidPlayerIntentFields({ type: 'INTENT_UPGRADE_ETC' }) &&
      isValidPlayerIntentFields({ type: 'INTENT_UPGRADE_ETC', cellIndex: 15 });
    const invalidTypes =
      isValidPlayerIntentFields({ type: 'INVALID_INTENT' }) ||
      isValidPlayerIntentFields({ type: 123 });
    const outOfBoundsCells =
      isValidPlayerIntentFields({ type: 'INTENT_UPGRADE', cellIndex: 40 }) ||
      isValidPlayerIntentFields({ type: 'INTENT_UPGRADE', cellIndex: -1 }) ||
      isValidPlayerIntentFields({ type: 'INTENT_UPGRADE', cellIndex: 1.5 }) ||
      isValidPlayerIntentFields({ type: 'INTENT_UPGRADE_ETC', cellIndex: 99 });

    expect(validCellIntents).toBe(true);
    expect(validEtcIntents).toBe(true);
    expect(invalidTypes).toBe(false);
    expect(outOfBoundsCells).toBe(false);
  });

  it('TC-392.02 [UC-PROTO-INTENT-BUYOUT-BID/MSS]: validates INTENT_EXECUTE_COMPULSORY_BUYOUT board cell index and non-negative integer INTENT_BID amounts', () => {
    const validBuyout = isValidPlayerIntentFields({
      type: 'INTENT_EXECUTE_COMPULSORY_BUYOUT',
      cellIndex: 12,
    });
    const validBids =
      isValidPlayerIntentFields({ type: 'INTENT_BID', amount: 500 }) &&
      isValidPlayerIntentFields({ type: 'INTENT_BID', amount: 0 });
    const invalidBids =
      isValidPlayerIntentFields({ type: 'INTENT_BID', amount: -100 }) ||
      isValidPlayerIntentFields({ type: 'INTENT_BID', amount: 12.5 });
    const invalidBuyouts =
      isValidPlayerIntentFields({ type: 'INTENT_EXECUTE_COMPULSORY_BUYOUT', cellIndex: -1 }) ||
      isValidPlayerIntentFields({ type: 'INTENT_EXECUTE_COMPULSORY_BUYOUT', cellIndex: 40 });

    expect(validBuyout).toBe(true);
    expect(validBids).toBe(true);
    expect(invalidBids).toBe(false);
    expect(invalidBuyouts).toBe(false);
  });

  it('TC-392.03 [UC-PROTO-INTENT-INVEST-BOND/MSS]: validates non-negative integer INTENT_INVEST stake and valid BondTrancheId on INTENT_ISSUE_BOND', () => {
    const validInvest =
      isValidPlayerIntentFields({ type: 'INTENT_INVEST', stake: 1000 }) &&
      isValidPlayerIntentFields({ type: 'INTENT_INVEST', stake: 0 });
    const validBonds =
      isValidPlayerIntentFields({
        type: 'INTENT_ISSUE_BOND',
        trancheId: BondTrancheId.WORKING_CAPITAL,
      }) && isValidPlayerIntentFields({ type: 'INTENT_ISSUE_BOND' });
    const invalidTranches =
      isValidPlayerIntentFields({ type: 'INTENT_ISSUE_BOND', trancheId: 'INVALID_TRANCHE' }) ||
      isValidPlayerIntentFields({ type: 'INTENT_ISSUE_BOND', trancheId: 42 });
    const invalidStakes =
      isValidPlayerIntentFields({ type: 'INTENT_INVEST', stake: -10 }) ||
      isValidPlayerIntentFields({ type: 'INTENT_INVEST', stake: 3.14 });

    expect(validInvest).toBe(true);
    expect(validBonds).toBe(true);
    expect(invalidTranches).toBe(false);
    expect(invalidStakes).toBe(false);
  });

  it('TC-392.04 [UC-PROTO-INTENT-TRADE-TRANSIT/MSS]: validates INTENT_SPIN_TRANSIT_WHEEL and strictly positive price plus optional offeredCellIndex on INTENT_TRADE_OFFER', () => {
    const validTransitAndRespond =
      isValidPlayerIntentFields({ type: 'INTENT_SPIN_TRANSIT_WHEEL' }) &&
      isValidPlayerIntentFields({ type: 'INTENT_RESPOND_TRADE_OFFER', offerId: 'o1', accept: false });
    const validTrades =
      isValidPlayerIntentFields({
        type: 'INTENT_TRADE_OFFER',
        sellerId: 'p1',
        buyerId: 'p2',
        cellIndex: 5,
        price: 1200,
        offeredCellIndex: 8,
      }) &&
      isValidPlayerIntentFields({
        type: 'INTENT_TRADE_OFFER',
        sellerId: 'p1',
        buyerId: 'p2',
        cellIndex: 5,
        price: 1,
      });
    const invalidTradePricesOrIds =
      isValidPlayerIntentFields({
        type: 'INTENT_TRADE_OFFER',
        sellerId: 'p1',
        buyerId: 'p2',
        cellIndex: 5,
        price: 0,
      }) ||
      isValidPlayerIntentFields({
        type: 'INTENT_TRADE_OFFER',
        sellerId: 'p1',
        buyerId: 'p2',
        cellIndex: 5,
        price: -500,
      }) ||
      isValidPlayerIntentFields({
        type: 'INTENT_TRADE_OFFER',
        sellerId: '',
        buyerId: 'p2',
        cellIndex: 5,
        price: 1000,
      });
    const invalidOfferedCells =
      isValidPlayerIntentFields({
        type: 'INTENT_TRADE_OFFER',
        sellerId: 'p1',
        buyerId: 'p2',
        cellIndex: 5,
        price: 1200,
        offeredCellIndex: 40,
      }) ||
      isValidPlayerIntentFields({
        type: 'INTENT_TRADE_OFFER',
        sellerId: 'p1',
        buyerId: 'p2',
        cellIndex: 5,
        price: 1200,
        offeredCellIndex: 1.5,
      }) ||
      isValidPlayerIntentFields({
        type: 'INTENT_RESPOND_TRADE_OFFER',
        offerId: '',
        accept: true,
      });

    expect(validTransitAndRespond).toBe(true);
    expect(validTrades).toBe(true);
    expect(invalidTradePricesOrIds).toBe(false);
    expect(invalidOfferedCells).toBe(false);
  });

  it('TC-392.05 [UC-PROTO-ENVELOPE-WIRING/MSS]: wires EnvelopeValidator.parseAndValidate to isValidPlayerIntentFields without dirty casts and rejects price 0 trade offers', () => {
    const validator = new EnvelopeValidator();
    const validRespond = validator.parseAndValidate(
      JSON.stringify({
        type: 'INTENT',
        roomCode: 'R1',
        playerId: 'p1',
        intent: { type: 'INTENT_RESPOND_TRADE_OFFER', offerId: 'o1', accept: true },
      }),
    );
    const validTrade = validator.parseAndValidate(
      JSON.stringify({
        type: 'INTENT',
        roomCode: 'R1',
        playerId: 'p1',
        intent: { type: 'INTENT_TRADE_OFFER', sellerId: 'p1', buyerId: 'p2', cellIndex: 5, price: 1000 },
      }),
    );
    const invalidAccept = validator.parseAndValidate(
      JSON.stringify({
        type: 'INTENT',
        roomCode: 'R1',
        playerId: 'p1',
        intent: { type: 'INTENT_RESPOND_TRADE_OFFER', offerId: 'o1', accept: 'yes' },
      }),
    );
    const zeroPriceTrade = validator.parseAndValidate(
      JSON.stringify({
        type: 'INTENT',
        roomCode: 'R1',
        playerId: 'p1',
        intent: { type: 'INTENT_TRADE_OFFER', sellerId: 'p1', buyerId: 'p2', cellIndex: 5, price: 0 },
      }),
    );

    expect(zeroPriceTrade).toEqual({ success: false, reasonCode: 'INVALID_ENVELOPE' });
    expect(invalidAccept).toEqual({ success: false, reasonCode: 'INVALID_ENVELOPE' });
    expect(validRespond.success).toBe(true);
    expect(validTrade.success).toBe(true);
  });

  it('TC-392.06 [UC-PROTO-CLIENT-DELTA-WIRING/MSS]: synchronizes DeltaPayload from domain protocol facade into useGameStore via applyDeltaToStore and populates CELL_INTENTS', () => {
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      players: [{ id: 'p1', position: 0, balance: 14500 }],
    };

    applyDeltaToStore(delta);

    expect(CELL_INTENTS.has('INTENT_UPGRADE')).toBe(true);
    expect(CELL_INTENTS.size).toBe(5);
    expect(useGameStore.getState().playersInfo['p1']?.balance).toBe(14500);
    expect(useGameStore.getState().playerPositions['p1']).toBe(0);
  });

  it('TC-392.07 [UC-PROTO-SERVER-REEXPORT-COMPAT/MSS]: preserves backward-compatible server re-exports with 25 canonical VALID_INTENTS including INTENT_SPIN_TRANSIT_WHEEL', () => {
    const compatDelta: ServerDeltaPayload = { tick: 2, cells: [] };
    const compatIntent: ServerPlayerIntent = { type: 'INTENT_SPIN_TRANSIT_WHEEL' };
    const compatAdminDetail: Pick<ServerAdminRoomDetail, 'roomCode' | 'chanceDiscardCount'> = {
      roomCode: 'R1',
      chanceDiscardCount: compatDelta.tick,
    };

    expect(ServerValidIntents.size).toBe(25);
    expect(ServerValidIntents.has(compatIntent.type)).toBe(true);
    expect(ServerValidIntents).toBe(VALID_INTENTS);
    expect(encodeMsg({ type: 'ROOM_STARTED', roomCode: compatAdminDetail.roomCode })).toBe(
      '{"type":"ROOM_STARTED","roomCode":"R1"}',
    );
  });
});
