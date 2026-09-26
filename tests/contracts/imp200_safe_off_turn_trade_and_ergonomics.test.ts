// [TC-200.01..25/MSS][UC-IMP200] Contract Tests — Safe Off-Turn Trade & P2P TradeModal Ergonomics
// Traceability: Gotcha #280, ADR-0001, Ticket IMP-200
// Facet 1: Quiescent State Protocol & Phase Guard
// Facet 2: Two-Way Asset Mutex Invariant
// Facet 3: Turn N+1 Teardown & Lifecycle Parity
// Facet 4: P2P Symmetry & Anti-Self-Targeting Guard
// Facet 5: UI Ergonomics & 44px Touch Targets

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { RoomManager } from '../../src/server/room_manager.js';
import { coordTrade, coordMortgage, coordRedeem, coordRespondTradeOffer, type RoomContext } from '../../src/server/room_property_coordinator.js';
import { pendingTradeManager } from '../../src/server/pending_trade_manager.js';
import { TurnPhase, ActionRejectReason, type Room, type Player, type PendingTradeOfferInfo } from '../../src/domain/room.js';
import { applyDelta } from '../../src/client/network/apply_delta.js';
import { useGameStore } from '../../src/client/store/game_store.js';
import { useLobbyStore } from '../../src/client/store/lobby_store.js';
import * as TradeModalExports from '../../src/client/ui/modals/trade_modal.js';

const TradeModal = TradeModalExports.TradeModal;
const ASSET_LOCKED = (ActionRejectReason as Record<string, string>).ASSET_LOCKED ?? 'ASSET_LOCKED';
const TRADE_ALREADY_PENDING = (ActionRejectReason as Record<string, string>).TRADE_ALREADY_PENDING ?? 'TRADE_ALREADY_PENDING';

interface TradeTestSetup {
  room: Room;
  ctx: RoomContext;
  reg: Map<number, string>;
  sm: Map<number, any>;
}

function makeTradeContext(rooms: RoomManager, hostId: string = 'alice_host', guestId: string = 'bob_investor', thirdId?: string): TradeTestSetup {
  const room = rooms.createRoom(hostId);
  rooms.joinRoom(room.roomCode, guestId);
  if (thirdId) rooms.joinRoom(room.roomCode, thirdId);
  rooms.startGame(room.roomCode);
  const reg = (rooms as any).registries.get(room.roomCode) as Map<number, string>;
  const sm = (rooms as any).propertyStates.get(room.roomCode) as Map<number, any>;
  const botPersonalities = (rooms as any).botPersonalities as Map<string, any> | undefined;
  return { room, ctx: { room, reg, sm, botPersonalities }, reg, sm };
}

// ---   ---
describe('[IMP-200][Facet-1/PhaseGuard] Quiescent State Protocol & Phase Guard', () => {
  let rooms: RoomManager;

  beforeEach(() => {
    rooms = new RoomManager(4242);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('[TC-200.01/MSS][UC-IMP200][Facet-1/PhaseGuard] Cho phép đề xuất trade khi phòng ở pha WaitingRoll (kể cả khi không phải lượt của requester)', () => {
    const { room, ctx, reg } = makeTradeContext(rooms, 'alice_host', 'bob_investor');
    room.phase = TurnPhase.WaitingRoll;
    room.currentPlayerIndex = 0; // alice's turn
    reg.set(1, 'alice_host');
    room.players[0]!.balance = 15_000;
    room.players[1]!.balance = 15_000;
    // Bob is off-turn human requester
    const result = coordTrade(ctx, 'bob_investor', 'alice_host', 'bob_investor', 1, 1000);
    expect(result.reason).not.toBe(ActionRejectReason.NOT_YOUR_TURN);
    expect(result.success || result.pending).toBe(true);
  });

  it('[TC-200.02/MSS][UC-IMP200][Facet-1/PhaseGuard] Cho phép đề xuất trade khi phòng ở pha PropertyManagement', () => {
    const { room, ctx, reg } = makeTradeContext(rooms, 'alice_host', 'bob_investor');
    room.phase = TurnPhase.PropertyManagement;
    room.currentPlayerIndex = 0; // alice's turn
    reg.set(1, 'alice_host');
    room.players[0]!.balance = 15_000;
    room.players[1]!.balance = 15_000;
    // Bob is off-turn human requester in PropertyManagement
    const result = coordTrade(ctx, 'bob_investor', 'alice_host', 'bob_investor', 1, 1000);
    expect(result.reason).not.toBe(ActionRejectReason.NOT_YOUR_TURN);
    expect(result.success || result.pending).toBe(true);
  });

  it.each([
    ['human', 'alice_host', false],
    ['bot', 'bot_trader', true],
  ])(
    '[TC-200.03/MSS][UC-IMP200][Facet-1/PhaseGuard] Từ chối với INVALID_PHASE khi phòng ở ActionPhase (%s requester)',
    (_label, requesterId, isBot) => {
      const { room, ctx, reg } = makeTradeContext(rooms, 'alice_host', 'bob_investor', 'bot_trader');
      room.phase = TurnPhase.ActionPhase;
      const trader = room.players.find((p) => p.id === requesterId);
      if (trader) trader.isBot = isBot;
      reg.set(1, 'alice_host');
      room.players.forEach((p) => { p.balance = 15_000; });
      const result = coordTrade(ctx, requesterId, 'alice_host', 'bob_investor', 1, 1000);
expect(result.success).toBe(false);
      expect(result.reason).toBe(ActionRejectReason.INVALID_PHASE);
    },
  );
  it('[TC-200.04/MSS][UC-IMP200][Facet-1/PhaseGuard] Từ chối với INVALID_PHASE khi phòng ở AuctionPhase hoặc room.auction !== null', () => {
    const { room, ctx, reg } = makeTradeContext(rooms, 'alice_host', 'bob_investor');
    room.phase = TurnPhase.AuctionPhase;
    reg.set(1, 'alice_host');
    const result = coordTrade(ctx, 'alice_host', 'alice_host', 'bob_investor', 1, 1000);
expect(result.success).toBe(false);
    expect(result.reason).toBe(ActionRejectReason.INVALID_PHASE);
  });

  it('[TC-200.05/MSS][UC-IMP200][Facet-1/PhaseGuard] Từ chối với INVALID_PHASE khi phòng ở InsolvencyPhase', () => {
    const { room, ctx, reg } = makeTradeContext(rooms, 'alice_host', 'bob_investor');
    room.phase = TurnPhase.InsolvencyPhase;
    reg.set(1, 'alice_host');
    const result = coordTrade(ctx, 'alice_host', 'alice_host', 'bob_investor', 1, 1000);
expect(result.success).toBe(false);
    expect(result.reason).toBe(ActionRejectReason.INVALID_PHASE);
  });

  it('[TC-200.06/MSS][UC-IMP200][Facet-1/PhaseGuard] Từ chối với INVALID_PHASE khi room.pendingBuyout !== null (Compound Quiescence Guard)', () => {
    const { room, ctx, reg } = makeTradeContext(rooms, 'alice_host', 'bob_investor');
    room.phase = TurnPhase.PropertyManagement;
    room.pendingBuyout = { buyerId: 'alice_host', sellerId: 'bob_investor', cellIndex: 6, cost: 2000, basePrice: 1000, createdAt: Date.now(), expiresAt: Date.now() + 15_000 };
    reg.set(1, 'alice_host');
    const result = coordTrade(ctx, 'alice_host', 'alice_host', 'bob_investor', 1, 1000);
expect(result.success).toBe(false);
    expect(result.reason).toBe(ActionRejectReason.INVALID_PHASE);
  });

  it('[TC-200.07/MSS][UC-IMP200][Facet-1/PhaseGuard] Từ chối với TRADE_ALREADY_PENDING khi phòng đã có một phiên trade pending khác', () => {
    const { room, ctx, reg } = makeTradeContext(rooms, 'alice_host', 'bob_investor');
    room.phase = TurnPhase.PropertyManagement;
    reg.set(1, 'alice_host');
    reg.set(3, 'bob_investor');
    // Inject an active pending trade offer session
    pendingTradeManager.createSession(
      room.roomCode,
      'bob_investor',
      'alice_host',
      1,
      1000,
      1000,
      15_000,
    );
    room.pendingTradeOffer = {
      offerId: 'offer_in_flight',
      cellIndex: 1,
      price: 1000,
      buyerId: 'bob_investor',
      sellerId: 'alice_host',
      requesterId: 'alice_host',
      targetPlayerId: 'bob_investor',
      expiresAt: Date.now() + 15_000,
    };
    const result = coordTrade(ctx, 'alice_host', 'alice_host', 'bob_investor', 3, 1200);
expect(result.success).toBe(false);
    expect(result.reason).toBe(TRADE_ALREADY_PENDING);
  });

});

// ---   ---
describe('[IMP-200][Facet-2/AssetMutex] Two-Way Asset Mutex Invariant', () => {
  let rooms: RoomManager;

  beforeEach(() => {
    rooms = new RoomManager(5555);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('[TC-200.08/MSS][UC-IMP200][Facet-2/AssetMutex] coordMortgage từ chối với ASSET_LOCKED khi cellIndex là pendingTradeOffer.cellIndex', () => {
    const { room, ctx, reg, sm } = makeTradeContext(rooms, 'alice_host', 'bob_investor');
    reg.set(1, 'alice_host');
    sm.set(1, { level: 0, isMortgaged: false });
    room.pendingTradeOffer = {
      offerId: 'offer_mutex_cell',
      cellIndex: 1,
      price: 1000,
      buyerId: 'bob_investor',
      sellerId: 'alice_host',
      requesterId: 'bob_investor',
      targetPlayerId: 'alice_host',
      expiresAt: Date.now() + 15_000,
    };
    const result = coordMortgage(ctx, 'alice_host', 1);
expect(result.success).toBe(false);
    expect(result.reason).toBe(ASSET_LOCKED);
  });

  it('[TC-200.09/MSS][UC-IMP200][Facet-2/AssetMutex] coordMortgage từ chối với ASSET_LOCKED khi cellIndex là pendingTradeOffer.offeredCellIndex', () => {
    const { room, ctx, reg, sm } = makeTradeContext(rooms, 'alice_host', 'bob_investor');
    reg.set(3, 'bob_investor');
    sm.set(3, { level: 0, isMortgaged: false });
    room.pendingTradeOffer = {
      offerId: 'offer_mutex_offered',
      cellIndex: 1,
      offeredCellIndex: 3,
      price: 0,
      buyerId: 'bob_investor',
      sellerId: 'alice_host',
      requesterId: 'bob_investor',
      targetPlayerId: 'alice_host',
      expiresAt: Date.now() + 15_000,
    };
    const result = coordMortgage(ctx, 'bob_investor', 3);
expect(result.success).toBe(false);
    expect(result.reason).toBe(ASSET_LOCKED);
  });

  it('[TC-200.10/MSS][UC-IMP200][Facet-2/AssetMutex] coordRedeem (Unmortgage) từ chối với ASSET_LOCKED khi cellIndex là pendingTradeOffer.cellIndex', () => {
    const { room, ctx, reg, sm } = makeTradeContext(rooms, 'alice_host', 'bob_investor');
    reg.set(1, 'alice_host');
    sm.set(1, { level: 0, isMortgaged: true });
    room.players[0]!.mortgagedProperties = [1];
    room.players[0]!.balance = 20_000;
    room.pendingTradeOffer = {
      offerId: 'offer_redeem_cell',
      cellIndex: 1,
      price: 1000,
      buyerId: 'bob_investor',
      sellerId: 'alice_host',
      requesterId: 'bob_investor',
      targetPlayerId: 'alice_host',
      expiresAt: Date.now() + 15_000,
    };
    const result = coordRedeem(ctx, 'alice_host', 1);
expect(result.success).toBe(false);
    expect(result.reason).toBe(ASSET_LOCKED);
  });

  it('[TC-200.11/MSS][UC-IMP200][Facet-2/AssetMutex] coordRedeem (Unmortgage) từ chối với ASSET_LOCKED khi cellIndex là pendingTradeOffer.offeredCellIndex', () => {
    const { room, ctx, reg, sm } = makeTradeContext(rooms, 'alice_host', 'bob_investor');
    reg.set(3, 'bob_investor');
    sm.set(3, { level: 0, isMortgaged: true });
    room.players[1]!.mortgagedProperties = [3];
    room.players[1]!.balance = 20_000;
    room.pendingTradeOffer = {
      offerId: 'offer_redeem_offered',
      cellIndex: 1,
      offeredCellIndex: 3,
      price: 0,
      buyerId: 'bob_investor',
      sellerId: 'alice_host',
      requesterId: 'bob_investor',
      targetPlayerId: 'alice_host',
      expiresAt: Date.now() + 15_000,
    };
    const result = coordRedeem(ctx, 'bob_investor', 3);
expect(result.success).toBe(false);
    expect(result.reason).toBe(ASSET_LOCKED);
  });

  it('[TC-200.12/MSS][UC-IMP200][Facet-2/AssetMutex] handleUpgrade từ chối với ASSET_LOCKED khi ô đất nằm trong pendingTradeOffer', () => {
    const { room, reg, sm } = makeTradeContext(rooms, 'alice_host', 'bob_investor');
    room.phase = TurnPhase.PropertyManagement;
    // Alice owns monopoly on Brown group (1 and 3)
    reg.set(1, 'alice_host');
    reg.set(3, 'alice_host');
    sm.set(1, { level: 0, isMortgaged: false });
    sm.set(3, { level: 0, isMortgaged: false });
    room.players[0]!.balance = 20_000;
    room.pendingTradeOffer = {
      offerId: 'offer_upgrade_locked',
      cellIndex: 1,
      price: 1000,
      buyerId: 'bob_investor',
      sellerId: 'alice_host',
      requesterId: 'bob_investor',
      targetPlayerId: 'alice_host',
      expiresAt: Date.now() + 15_000,
    };
    const result = rooms.handleUpgrade(room.roomCode, 'alice_host', 1);
expect(result.success).toBe(false);
    expect(result.reason).toBe(ASSET_LOCKED);
  });

  it('[TC-200.13/MSS][UC-IMP200][Facet-2/AssetMutex] handleDowngrade từ chối với ASSET_LOCKED khi ô đất nằm trong pendingTradeOffer', () => {
    const { room, reg, sm } = makeTradeContext(rooms, 'alice_host', 'bob_investor');
    room.phase = TurnPhase.PropertyManagement;
    reg.set(1, 'alice_host');
    reg.set(3, 'alice_host');
    sm.set(1, { level: 1, isMortgaged: false });
    sm.set(3, { level: 0, isMortgaged: false });
    room.players[0]!.balance = 20_000;
    room.pendingTradeOffer = {
      offerId: 'offer_downgrade_locked',
      cellIndex: 1,
      price: 1000,
      buyerId: 'bob_investor',
      sellerId: 'alice_host',
      requesterId: 'bob_investor',
      targetPlayerId: 'alice_host',
      expiresAt: Date.now() + 15_000,
    };
    const result = rooms.handleDowngrade(room.roomCode, 'alice_host', 1);
expect(result.success).toBe(false);
    expect(result.reason).toBe(ASSET_LOCKED);
  });

});

// ---   ---
describe('[IMP-200][Facet-3/TurnTeardown] Turn N+1 Teardown & Lifecycle Parity', () => {
  let rooms: RoomManager;

  beforeEach(() => {
    rooms = new RoomManager(7777);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('[TC-200.14/MSS][UC-IMP200][Facet-3/TurnTeardown] handleEndTurn tự động hủy pendingTradeOffer nếu sellerId === currentTurnPlayerId', () => {
    const { room } = makeTradeContext(rooms, 'alice_host', 'bob_investor');
    room.phase = TurnPhase.PropertyManagement;
    room.currentPlayerIndex = 0; // alice_host
    (rooms as any).rolledThisTurn.set(room.roomCode, true);
    pendingTradeManager.createSession(
      room.roomCode,
      'bob_investor',
      'alice_host',
      1,
      1000,
      1000,
      15_000,
    );
    room.pendingTradeOffer = {
      offerId: 'offer_alice_seller',
      cellIndex: 1,
      price: 1000,
      buyerId: 'bob_investor',
      sellerId: 'alice_host',
      requesterId: 'bob_investor',
      targetPlayerId: 'alice_host',
      expiresAt: Date.now() + 15_000,
    };
    rooms.handleEndTurn(room.roomCode, 'alice_host');
expect(room.pendingTradeOffer).toBeNull();
    expect(rooms.hasPendingTrade(room.roomCode)).toBe(false);
  });

  it('[TC-200.15/MSS][UC-IMP200][Facet-3/TurnTeardown] handleEndTurn tự động hủy pendingTradeOffer nếu buyerId === currentTurnPlayerId', () => {
    const { room } = makeTradeContext(rooms, 'alice_host', 'bob_investor');
    room.phase = TurnPhase.PropertyManagement;
    room.currentPlayerIndex = 0; // alice_host
    (rooms as any).rolledThisTurn.set(room.roomCode, true);
    pendingTradeManager.createSession(
      room.roomCode,
      'alice_host',
      'bob_investor',
      3,
      1000,
      1000,
      15_000,
    );
    room.pendingTradeOffer = {
      offerId: 'offer_alice_buyer',
      cellIndex: 3,
      price: 1000,
      buyerId: 'alice_host',
      sellerId: 'bob_investor',
      requesterId: 'alice_host',
      targetPlayerId: 'bob_investor',
      expiresAt: Date.now() + 15_000,
    };
    rooms.handleEndTurn(room.roomCode, 'alice_host');
expect(room.pendingTradeOffer).toBeNull();
    expect(rooms.hasPendingTrade(room.roomCode)).toBe(false);
  });

  it('[TC-200.16/MSS][UC-IMP200][Facet-3/TurnTeardown] handleEndTurn KHÔNG hủy pendingTradeOffer nếu phiên trade diễn ra giữa 2 người chơi khác ngoài lượt (P2 và P3)', () => {
    const { room } = makeTradeContext(rooms, 'alice_host', 'bob_investor', 'charlie_tycoon');
    room.phase = TurnPhase.PropertyManagement;
    room.currentPlayerIndex = 0; // alice_host
    (rooms as any).rolledThisTurn.set(room.roomCode, true);
    pendingTradeManager.createSession(
      room.roomCode,
      'charlie_tycoon',
      'bob_investor',
      6,
      2000,
      2000,
      15_000,
    );
    room.pendingTradeOffer = {
      offerId: 'offer_bob_charlie_off_turn',
      cellIndex: 6,
      price: 2000,
      buyerId: 'charlie_tycoon',
      sellerId: 'bob_investor',
      requesterId: 'charlie_tycoon',
      targetPlayerId: 'bob_investor',
      expiresAt: Date.now() + 15_000,
    };
    rooms.handleEndTurn(room.roomCode, 'alice_host');
    expect(room.pendingTradeOffer).not.toBeNull();
    expect(rooms.hasPendingTrade(room.roomCode)).toBe(true);
  });

});

// ---   ---
describe('[IMP-200][Facet-4/P2PSymmetry] P2P Symmetry & Anti-Self-Targeting Guard', () => {
  let rooms: RoomManager;

  beforeEach(() => {
    rooms = new RoomManager(8888);
    useGameStore.setState({ pendingTradeOffer: null });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('[TC-200.17/MSS][UC-IMP200][Facet-4/P2PSymmetry] apply_delta gán pendingTradeOffer = null khi offer.requesterId === myPid (Anti-Self-Targeting Guard)', () => {
    useLobbyStore.getState().setMyPlayerId('alice_host');
    const offerWithRequester = {
      offerId: 'offer_ast_01',
      cellIndex: 1,
      price: 1000,
      sellerId: 'alice_host',
      buyerId: 'bob_investor',
      requesterId: 'alice_host',
      targetPlayerId: 'bob_investor',
      expiresAt: Date.now() + 15_000,
    };
    applyDelta({
      tick: 1,
      cells: [],
      pendingTradeOffer: offerWithRequester as any,
    });

expect(useGameStore.getState().pendingTradeOffer).toBeNull();
  });

  it('[TC-200.18/MSS][UC-IMP200][Facet-4/P2PSymmetry] apply_delta gán pendingTradeOffer = offer khi offer.targetPlayerId === myPid', () => {
    useLobbyStore.getState().setMyPlayerId('bob_investor');
    const offerForBob = {
      offerId: 'offer_ast_02',
      cellIndex: 1,
      price: 1000,
      sellerId: 'alice_host',
      buyerId: 'bob_investor',
      requesterId: 'alice_host',
      targetPlayerId: 'bob_investor',
      expiresAt: Date.now() + 15_000,
    };
    applyDelta({
      tick: 2,
      cells: [],
      pendingTradeOffer: offerForBob as any,
    });

expect(useGameStore.getState().pendingTradeOffer).toEqual(
      expect.objectContaining({ offerId: 'offer_ast_02' }),
    );
  });

  it('[TC-200.19/MSS][UC-IMP200][Facet-4/P2PSymmetry] apply_delta fallback sang offer.sellerId === myPid nếu targetPlayerId không có', () => {
    useLobbyStore.getState().setMyPlayerId('seller_legacy');
    const legacyOffer = {
      offerId: 'offer_legacy_03',
      cellIndex: 3,
      price: 1200,
      sellerId: 'seller_legacy',
      buyerId: 'buyer_bob',
      expiresAt: Date.now() + 15_000,
    };
    applyDelta({
      tick: 3,
      cells: [],
      pendingTradeOffer: legacyOffer as any,
    });

expect(useGameStore.getState().pendingTradeOffer).toEqual(
      expect.objectContaining({ offerId: 'offer_legacy_03' }),
    );
  });

  it('[TC-200.20/MSS][UC-IMP200][Facet-4/P2PSymmetry] coordRespondTradeOffer từ chối với UNAUTHORIZED nếu playerId !== expectedTarget', () => {
    const { ctx } = makeTradeContext(rooms, 'alice_host', 'bob_investor', 'charlie_stranger');
    const session = pendingTradeManager.createSession(
      ctx.room.roomCode,
      'bob_investor',
      'alice_host',
      1,
      1000,
      1000,
      15_000,
    );
    const result = coordRespondTradeOffer(ctx, 'charlie_stranger', session.offerId, true);
expect(result.success).toBe(false);
    expect(result.reason).toBe(ActionRejectReason.UNAUTHORIZED);
  });

  it.each([
    ['buyer_bankrupt', true, false],
    ['seller_bankrupt', false, true],
  ])(
    '[TC-200.21/MSS][UC-IMP200][Facet-4/P2PSymmetry] coordRespondTradeOffer từ chối với PLAYER_BANKRUPT nếu bên mua hoặc bên bán đã phá sản (%s)',
    (_label, buyerBankrupt, sellerBankrupt) => {
      const { room, ctx } = makeTradeContext(rooms, 'alice_host', 'bob_investor');
      room.players[0]!.bankrupt = sellerBankrupt;
      room.players[1]!.bankrupt = buyerBankrupt;
      const session = pendingTradeManager.createSession(
        room.roomCode,
        'bob_investor',
        'alice_host',
        1,
        1000,
        1000,
        15_000,
      );
      const responderId = buyerBankrupt ? 'alice_host' : 'bob_investor';
      const result = coordRespondTradeOffer(ctx, responderId, session.offerId, true);
expect(result.success).toBe(false);
      expect(result.reason).toBe(ActionRejectReason.PLAYER_BANKRUPT);
    },
  );
  it.each([
    ['buyer_insufficient_when_price_positive', 2000, 500, 5000],
    ['seller_insufficient_when_price_negative', -2000, 5000, 500],
  ])(
    '[TC-200.22/MSS][UC-IMP200][Facet-4/P2PSymmetry] Kiểm tra thanh khoản 2 chiều: từ chối với INSUFFICIENT_FUNDS nếu price > 0 và buyer thiếu tiền, hoặc price < 0 và seller thiếu tiền bù (%s)',
    (_label, price, buyerBalance, sellerBalance) => {
      const { room, ctx, reg, sm } = makeTradeContext(rooms, 'alice_host', 'bob_investor');
      reg.set(1, 'alice_host');
      reg.set(3, 'bob_investor');
      sm.set(1, { level: 0, isMortgaged: false });
      sm.set(3, { level: 0, isMortgaged: false });
      room.players[0]!.balance = sellerBalance; // alice is seller
      room.players[1]!.balance = buyerBalance;  // bob is buyer
      const session = pendingTradeManager.createSession(
        room.roomCode,
        'bob_investor',
        'alice_host',
        1,
        price,
        1000,
        15_000,
        3,
      );
      const result = coordRespondTradeOffer(ctx, 'bob_investor', session.offerId, true);
expect(result.success).toBe(false);
      expect(result.reason).toBe(ActionRejectReason.INSUFFICIENT_FUNDS);
    },
  );
});

// ---   ---
describe('[IMP-200][Facet-5/TouchErgonomics] UI Ergonomics & 44px Touch Targets', () => {
  it('[TC-200.23/MSS][UC-IMP200][Facet-5/TouchErgonomics] Stepper tiền tệ có các nút [-], [+], +100, +500 tuân thủ vùng chạm min-h-[44px]', () => {
    const html = renderToStaticMarkup(
      React.createElement(TradeModal, {
        targetPlayerId: 'bob_investor',
        myProperties: [1],
        targetProperties: [3],
        myBalance: 15_000,
      }),
    );
    // Assert stepper buttons exist with tactile minimum height
    expect(html).toMatch(/<button[^>]*class="[^"]*min-h-\[44px\][^"]*"[^>]*>[\s\S]*?-<\/button>/);
    expect(html).toMatch(/<button[^>]*class="[^"]*min-h-\[44px\][^"]*"[^>]*>[\s\S]*?\+<\/button>/);
    expect(html).toMatch(/<button[^>]*class="[^"]*min-h-\[44px\][^"]*"[^>]*>[\s\S]*?\+100<\/button>/);
    expect(html).toMatch(/<button[^>]*class="[^"]*min-h-\[44px\][^"]*"[^>]*>[\s\S]*?\+500<\/button>/);
  });

  it('[TC-200.24/MSS][UC-IMP200][Facet-5/TouchErgonomics] Dải chọn đối tác TradePartnerStrip có class partner-selector-tab và min-h-[44px]', () => {
    const TradePartnerStrip = (TradeModalExports as Record<string, any>).TradePartnerStrip;
    const html = renderToStaticMarkup(
      React.createElement(TradePartnerStrip, {
        availablePartners: [
          { id: 'bot_shark', name: 'Shark Bot', balance: 18_000, isBot: true },
          { id: 'human_guest', name: 'Guest Player', balance: 12_000, isBot: false },
        ],
        selectedPartnerId: 'bot_shark',
        onSelectPartner: vi.fn(),
      }),
    );
expect(html).toContain('partner-selector-tab');
    expect(html).toContain('min-h-[44px]');
  });

  it('[TC-200.25/MSS][UC-IMP200][Facet-5/TouchErgonomics] TradeModal giữ nguyên data-testid="trade-modal" và data-legacy-style="max-w-md lg:max-w-lg"', () => {
    const html = renderToStaticMarkup(
      React.createElement(TradeModal, {
        targetPlayerId: 'bob_investor',
        myProperties: [1],
        targetProperties: [3],
        myBalance: 15_000,
      }),
    );
expect(html).toContain('data-testid="trade-modal"');
    expect(html).toContain('data-legacy-style="max-w-md lg:max-w-lg"');
  });

});
