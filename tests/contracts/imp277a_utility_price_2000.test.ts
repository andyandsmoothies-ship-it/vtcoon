// [TC-277A.01/MSS..TC-277A.10/MSS][UC-IMP277A] Utility Purchase Price SSOT 2000 Contract Test Suite
import { describe, it, expect } from 'vitest';
import { PROPERTY_DEEDS } from '../../src/domain/property_data.js';
import { RoomManager } from '../../src/server/room_manager.js';
import { TurnPhase } from '../../src/domain/types.js';
import { mortgageProperty, redeemProperty } from '../../src/server/mortgage_manager.js';
import { handleBuyProperty } from '../../src/server/property_actions.js';
import { evaluateTileValuation } from '../../src/domain/bot/valuation_engine.js';
import { BotPersonality } from '../../src/domain/bot/bot_types.js';
import { validateP2PTrade } from '../../src/server/p2p_trade_actions.js';
import { ActionRejectReason } from '../../src/domain/action_reasons.js';

describe('[IMP-277A] Nâng Giá Mua Hai Ô Tiện Ích EVN & Viettel Lên 2.000 Tr. VNĐ', () => {
  // =========================================================================
  // FACET 1: DOMAIN SSOT PRICING & RENT INVARIANTS (TC-277A.01 .. 02)
  // =========================================================================
  describe('Facet 1: Domain SSOT Pricing & Rent Invariants', () => {
    it('[TC-277A.01/MSS][UC-IMP277A] Ô 12 EVN và Ô 28 Viettel trong PROPERTY_DEEDS có giá niêm yết chính xác bằng 2000', () => {
      expect(PROPERTY_DEEDS.get(12)?.price).toBe(2000);
      expect(PROPERTY_DEEDS.get(28)?.price).toBe(2000);
    });

    it('[TC-277A.02/MSS][UC-IMP277A] Ô 12 EVN và Ô 28 Viettel bảo toàn cước cơ sở rent0 chính xác bằng 1000', () => {
      expect(PROPERTY_DEEDS.get(12)?.rent0).toBe(1000);
      expect(PROPERTY_DEEDS.get(28)?.rent0).toBe(1000);
    });
  });

  // =========================================================================
  // FACET 2: MORTGAGE & AUCTION CASCADE INVARIANTS (TC-277A.03 .. 06)
  // =========================================================================
  describe('Facet 2: Mortgage & Auction Cascade Invariants', () => {
    it('[TC-277A.03/MSS][UC-IMP277A] Thế chấp Ô 12 EVN thu về chính xác 1.000 Tr. VNĐ nợ gốc (50% của 2000)', () => {
      const mgr = new RoomManager(27701);
      const room = mgr.createRoom('p1');
      mgr.addBot(room.roomCode, 'bot_2');
      mgr.startGame(room.roomCode);
      room.phase = TurnPhase.PropertyManagement;
      const reg = new Map([[12, 'p1']]);
      const sm = new Map();
      const p1 = room.players[0]!;
      p1.balance = 5000;
      p1.ownedProperties = [12];

      const res = mortgageProperty(room, 'p1', 12, reg, sm);
      expect(res.success).toBe(true);
      expect(p1.balance).toBe(6000);
      expect(p1.mortgageLoans?.[12]).toBe(1000);
    });

    it('[TC-277A.04/MSS][UC-IMP277A] Thế chấp Ô 28 Viettel thu về chính xác 1.000 Tr. VNĐ nợ gốc (50% của 2000)', () => {
      const mgr = new RoomManager(27702);
      const room = mgr.createRoom('p1');
      mgr.addBot(room.roomCode, 'bot_2');
      mgr.startGame(room.roomCode);
      room.phase = TurnPhase.PropertyManagement;
      const reg = new Map([[28, 'p1']]);
      const sm = new Map();
      const p1 = room.players[0]!;
      p1.balance = 5000;
      p1.ownedProperties = [28];

      const res = mortgageProperty(room, 'p1', 28, reg, sm);
      expect(res.success).toBe(true);
      expect(p1.balance).toBe(6000);
      expect(p1.mortgageLoans?.[28]).toBe(1000);
    });

    it('[TC-277A.05/MSS][UC-IMP277A] Từ chối mua Ô 12 EVN mở phiên đấu giá với startingBid đúng bằng 1.000 Tr. VNĐ', () => {
      const mgr = new RoomManager(27703);
      const room = mgr.createRoom('p1');
      mgr.addBot(room.roomCode, 'bot_2');
      mgr.startGame(room.roomCode);
      room.phase = TurnPhase.ActionPhase;
      room.players[0]!.position = 12;

      mgr.handleDecline(room.roomCode, 'p1');
      expect(room.phase).toBe(TurnPhase.AuctionPhase);
      const auction = mgr.auctions.get(room.roomCode);
      expect(auction?.startingBid).toBe(1000);
    });

    it('[TC-277A.06/MSS][UC-IMP277A] Từ chối mua Ô 28 Viettel mở phiên đấu giá với startingBid đúng bằng 1.000 Tr. VNĐ', () => {
      const mgr = new RoomManager(27704);
      const room = mgr.createRoom('p1');
      mgr.addBot(room.roomCode, 'bot_2');
      mgr.startGame(room.roomCode);
      room.phase = TurnPhase.ActionPhase;
      room.players[0]!.position = 28;

      mgr.handleDecline(room.roomCode, 'p1');
      expect(room.phase).toBe(TurnPhase.AuctionPhase);
      const auction = mgr.auctions.get(room.roomCode);
      expect(auction?.startingBid).toBe(1000);
    });
  });

  // =========================================================================
  // FACET 3: BOT VALUATION & SOLVENCY BOUNDARIES (TC-277A.07 .. 08)
  // =========================================================================
  describe('Facet 3: Bot Valuation & Solvency Boundaries', () => {
    it('[TC-277A.07/MSS][UC-IMP277A] Bot AI thẩm định Ô 12 EVN ở vòng 1 ghi nhận basePrice = 2000 và estimatedValue = 2800', () => {
      const mgr = new RoomManager(27705);
      const room = mgr.createRoom('bot_1');
      mgr.startGame(room.roomCode);
      const bot = room.players[0]!;
      const reg = new Map();
      const sm = new Map();

      const val = evaluateTileValuation(12, bot, room, reg, sm, BotPersonality.Balanced, 0);
      expect(val.basePrice).toBe(2000);
      expect(val.estimatedValue).toBe(2800);
    });

    it('[TC-277A.08/A1][UC-IMP277A] Người chơi dừng tại Ô 12 có balance = 1999 bị từ chối mua với lý do INSUFFICIENT_FUNDS', () => {
      const mgr = new RoomManager(27706);
      const room = mgr.createRoom('p1');
      mgr.startGame(room.roomCode);
      room.phase = TurnPhase.ActionPhase;
      const p1 = room.players[0]!;
      p1.position = 12;
      p1.balance = 1999;
      const reg = new Map();

      const res = handleBuyProperty(room, p1, reg);
      expect(res?.result).toBe('InsufficientFunds');
      expect(p1.balance).toBe(1999);
    });
  });

  // =========================================================================
  // FACET 4: ADVERSARIAL BOUNDARY PROBES (TC-277A.09 .. 10)
  // =========================================================================
  describe('Facet 4: Adversarial Boundary Probes', () => {
    it('[TC-277A.09/A2][UC-IMP277A] Sàn P2P từ chối chuyển nhượng Ô 12 với giá 1.399 Tr. (dưới mức sàn 70% là 1.400 Tr.)', () => {
      const mgr = new RoomManager(27707);
      const room = mgr.createRoom('seller');
      mgr.addBot(room.roomCode, 'buyer');
      mgr.startGame(room.roomCode);
      const seller = room.players[0]!;
      const buyer = room.players[1]!;
      const reg = new Map([[12, seller.id]]);
      const sm = new Map();

      const val = validateP2PTrade(room, seller.id, buyer.id, 12, 1399, reg, sm);
      expect(val.valid).toBe(false);
      expect(val.reason).toBe(ActionRejectReason.PRICE_BELOW_FLOOR);
    });

    it('[TC-277A.10/MSS][UC-IMP277A] Giải chấp Ô 12 nợ gốc 1.000 Tr. trừ 1.100 Tr. người chơi và nộp 100 Tr. tiền lãi vào Kho Bạc', () => {
      const mgr = new RoomManager(27708);
      const room = mgr.createRoom('p1');
      mgr.addBot(room.roomCode, 'bot_2');
      mgr.startGame(room.roomCode);
      room.phase = TurnPhase.PropertyManagement;
      room.treasury = 500;
      const p1 = room.players[0]!;
      p1.balance = 5000;
      p1.ownedProperties = [12];
      p1.mortgagedProperties = [12];
      p1.mortgageLoans = { 12: 1000 };
      const reg = new Map([[12, p1.id]]);
      const sm = new Map([[12, { level: 0, isMortgaged: true }]]);

      const res = redeemProperty(room, p1.id, 12, reg, sm);
      expect(res.success).toBe(true);
      expect(p1.balance).toBe(5000 - 1100);
      expect(room.treasury).toBe(500 + 100);
      expect(p1.mortgageLoans?.[12]).toBeUndefined();
    });
  });
});
