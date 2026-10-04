// [CONTRACT TEST] IMP-204: Giao Dịch P2P Bất Động Sản Đang Cầm Cố & Định Giá Lại Nghĩa Vụ Nợ
// Universal 5-Facet Behavioral Matrix & Adversarial Inversion Verification
// Traceability Tags: [TC-204.01..22] & [UC-IMP204]
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { RoomManager } from '../../src/server/room_manager.js';
import { TurnPhase } from '../../src/domain/room.js';
import { ActionRejectReason } from '../../src/domain/action_reasons.js';
import { executeP2PTrade } from '../../src/server/p2p_trade_actions.js';
import { collectMortgageInterest, redeemProperty } from '../../src/server/mortgage_manager.js';
import { upgradeProperty } from '../../src/domain/property_upgrade.js';
import { findAllMonopolyGaps } from '../../src/domain/bot/bot_monopoly_utils.js';
import { findEligibleBotTrade, evaluateBotTradeAcceptance } from '../../src/domain/bot/bot_trade.js';
import { BotPersonality } from '../../src/domain/bot/bot_types.js';
import { TradeColumn } from '../../src/client/ui/modals/trade/trade_column.js';
import { TradeModal } from '../../src/client/ui/modals/trade_modal.js';

function setupRoom(opts?: {
  sellerBalance?: number;
  buyerBalance?: number;
  roundCount?: number;
}) {
  const mgr = new RoomManager(() => 0);
  const room = mgr.createRoom('p1_seller');
  mgr.joinRoom(room.roomCode, 'p2_buyer');
  mgr.startGame(room.roomCode);

  room.roundCount = opts?.roundCount ?? 5;
  room.phase = TurnPhase.PropertyManagement;

  const seller = room.players.find((p) => p.id === 'p1_seller')!;
  const buyer = room.players.find((p) => p.id === 'p2_buyer')!;

  seller.balance = opts?.sellerBalance ?? 10000;
  buyer.balance = opts?.buyerBalance ?? 10000;

  const reg = mgr.getRegistry(room.roomCode)!;
  const sm = mgr.getPropertyStates(room.roomCode)!;

  return { mgr, room, seller, buyer, reg, sm };
}

describe('[TC-204][UC-IMP204] Mortgaged Property P2P Trading & Debt Restructuring Contract Suite', () => {
  // =========================================================================
  // FACET 1: P2P Trade Server Validation & Floor Price
  // =========================================================================
  describe('Facet 1: P2P Trade Server Validation & Floor Price', () => {
    it('[TC-204.01/MSS][UC-IMP204] Cho phép tạo đề xuất P2P mua BĐS đang thế chấp (isMortgaged: true)', () => {
      const { room, seller, buyer, reg, sm } = setupRoom();
      reg.set(1, seller.id);
      seller.mortgagedProperties = [1];
      seller.mortgageLoans = { 1: 300 };
      sm.set(1, { level: 0, isMortgaged: true });

      const res = executeP2PTrade(room, seller.id, buyer.id, 1, 500, reg, sm);
      expect(res.success).toBe(true);
      expect(res.reason).toBeUndefined();
    });

    it('[TC-204.02/MSS][UC-IMP204] BĐS đang thế chấp chấp nhận giá sàn floorPrice = Math.floor(deed.price * 0.35)', () => {
      const { room, seller, buyer, reg, sm } = setupRoom();
      reg.set(1, seller.id);
      seller.mortgagedProperties = [1];
      seller.mortgageLoans = { 1: 300 };
      sm.set(1, { level: 0, isMortgaged: true });

      // Ô 1 (Đồng Nai) giá 600 -> sàn thế chấp 35% = 210
      const res = executeP2PTrade(room, seller.id, buyer.id, 1, 210, reg, sm);
      expect(res.success).toBe(true);
      expect(reg.get(1)).toBe(buyer.id);
    });

    it('[TC-204.03/MSS][UC-IMP204] BĐS đang thế chấp từ chối giá dưới 35% (PRICE_BELOW_FLOOR)', () => {
      const { room, seller, buyer, reg, sm } = setupRoom();
      reg.set(1, seller.id);
      seller.mortgagedProperties = [1];
      seller.mortgageLoans = { 1: 300 };
      sm.set(1, { level: 0, isMortgaged: true });

      // Ô 1 giá 600 -> giá 209 < sàn 210 -> từ chối
      const res = executeP2PTrade(room, seller.id, buyer.id, 1, 209, reg, sm);
      expect(res.success).toBe(false);
      expect(res.reason).toBe(ActionRejectReason.PRICE_BELOW_FLOOR);
    });

    it('[TC-204.04/MSS][UC-IMP204] BĐS thế chấp có công trình (nếu có lỗi dữ liệu level > 0) vẫn bị từ chối PROPERTY_HAS_BUILDING', () => {
      const { room, seller, buyer, reg, sm } = setupRoom();
      reg.set(1, seller.id);
      seller.mortgagedProperties = [1];
      seller.mortgageLoans = { 1: 300 };
      sm.set(1, { level: 1, isMortgaged: true });

      const res = executeP2PTrade(room, seller.id, buyer.id, 1, 500, reg, sm);
      expect(res.success).toBe(false);
      expect(res.reason).toBe(ActionRejectReason.PROPERTY_HAS_BUILDING);
    });

    it('[TC-204.05/MSS][UC-IMP204] BĐS đang nằm trong hợp đồng Trái phiếu (bondContract.collateralCells) vẫn bị cấm BOND_COLLATERAL_LOCKED', () => {
      const { room, seller, buyer, reg, sm } = setupRoom();
      reg.set(1, seller.id);
      seller.mortgagedProperties = [1];
      seller.mortgageLoans = { 1: 300 };
      sm.set(1, { level: 0, isMortgaged: true });
      seller.bondContract = { isActive: true, collateralCells: [1] } as any;

      const res = executeP2PTrade(room, seller.id, buyer.id, 1, 500, reg, sm);
      expect(res.success).toBe(false);
      expect(res.reason).toBe(ActionRejectReason.BOND_COLLATERAL_LOCKED);
    });
  });

  // =========================================================================
  // FACET 2: Atomic Debt Migration & Invariants
  // =========================================================================
  describe('Facet 2: Atomic Debt Migration & Invariants', () => {
    it('[TC-204.06/MSS][UC-IMP204] executeP2PTrade xóa cellIndex khỏi seller.mortgagedProperties và seller.mortgageLoans', () => {
      const { room, seller, buyer, reg, sm } = setupRoom();
      reg.set(1, seller.id);
      reg.set(3, seller.id);
      seller.mortgagedProperties = [1, 3];
      seller.mortgageLoans = { 1: 300, 3: 300 };
      sm.set(1, { level: 0, isMortgaged: true });
      sm.set(3, { level: 0, isMortgaged: true });

      const res = executeP2PTrade(room, seller.id, buyer.id, 1, 500, reg, sm);
      expect(res.success).toBe(true);
      expect(seller.mortgagedProperties).not.toContain(1);
      expect(seller.mortgageLoans?.[1]).toBeUndefined();
    });

    it('[TC-204.07/MSS][UC-IMP204] executeP2PTrade thêm cellIndex vào buyer.mortgagedProperties và gán đúng số nợ vào buyer.mortgageLoans', () => {
      const { room, seller, buyer, reg, sm } = setupRoom();
      reg.set(1, seller.id);
      seller.mortgagedProperties = [1];
      seller.mortgageLoans = { 1: 300 };
      sm.set(1, { level: 0, isMortgaged: true });

      const res = executeP2PTrade(room, seller.id, buyer.id, 1, 500, reg, sm);
      expect(res.success).toBe(true);
      expect(buyer.mortgagedProperties).toContain(1);
      expect(buyer.mortgageLoans?.[1]).toBe(300);
    });

    it('[TC-204.08/MSS][UC-IMP204] Cờ stateMap.get(cellIndex).isMortgaged được bảo toàn true sau giao dịch', () => {
      const { room, seller, buyer, reg, sm } = setupRoom();
      reg.set(1, seller.id);
      seller.mortgagedProperties = [1];
      seller.mortgageLoans = { 1: 300 };
      sm.set(1, { level: 0, isMortgaged: true });

      const res = executeP2PTrade(room, seller.id, buyer.id, 1, 500, reg, sm);
      expect(res.success).toBe(true);
      expect(sm.get(1)?.isMortgaged).toBe(true);
      expect(reg.get(1)).toBe(buyer.id);
    });

    it('[TC-204.09/MSS][UC-IMP204] Quỹ Kho Bạc nhận đúng 5% thuế P2P trên giá chuyển nhượng thực tế', () => {
      const { room, seller, buyer, reg, sm } = setupRoom();
      reg.set(1, seller.id);
      seller.mortgagedProperties = [1];
      seller.mortgageLoans = { 1: 300 };
      sm.set(1, { level: 0, isMortgaged: true });
      room.treasury = 0;

      const res = executeP2PTrade(room, seller.id, buyer.id, 1, 1000, reg, sm);
      expect(res.success).toBe(true);
      expect(room.treasury).toBe(50);
    });

    it('[TC-204.10/MSS][UC-IMP204] Đổi 2 BĐS cùng đang thế chấp (Swap): Di dời nợ 2 chiều đối xứng không mất mát', () => {
      const { room, seller, buyer, reg, sm } = setupRoom();
      reg.set(1, buyer.id);
      buyer.mortgagedProperties = [1];
      buyer.mortgageLoans = { 1: 300 };
      sm.set(1, { level: 0, isMortgaged: true });

      reg.set(3, seller.id);
      seller.mortgagedProperties = [3];
      seller.mortgageLoans = { 3: 300 };
      sm.set(3, { level: 0, isMortgaged: true });

      const res = (executeP2PTrade as any)(room, seller.id, buyer.id, 3, 0, reg, sm, 1);
      expect(res.success).toBe(true);
      expect(buyer.mortgagedProperties).toContain(3);
      expect(seller.mortgagedProperties).toContain(1);
      expect(buyer.mortgageLoans?.[3]).toBe(300);
      expect(seller.mortgageLoans?.[1]).toBe(300);
    });
  });

  // =========================================================================
  // FACET 3: Post-Trade Economy & Monopoly Rules
  // =========================================================================
  describe('Facet 3: Post-Trade Economy & Monopoly Rules', () => {
    it('[TC-204.11/MSS][UC-IMP204] Buyer đi qua ô GO sau khi mua đất thế chấp bị trừ lãi thế chấp định kỳ nộp Kho Bạc', () => {
      const { room, seller, buyer, reg, sm } = setupRoom({ buyerBalance: 5000 });
      reg.set(1, seller.id);
      seller.mortgagedProperties = [1];
      seller.mortgageLoans = { 1: 300 };
      sm.set(1, { level: 0, isMortgaged: true });
      room.treasury = 0;

      const tradeRes = executeP2PTrade(room, seller.id, buyer.id, 1, 500, reg, sm);
      expect(tradeRes.success).toBe(true);

      const balBefore = buyer.balance;
      const treasBefore = room.treasury ?? 0;
      collectMortgageInterest(room, buyer.id);
      expect(buyer.balance).toBe(balBefore - 15);
      expect(room.treasury).toBe(treasBefore + 15);
    });

    it('[TC-204.12/MSS][UC-IMP204] Seller không còn bị trừ lãi cho ô đất thế chấp đã bán khi đi qua ô GO', () => {
      const { room, seller, buyer, reg, sm } = setupRoom({ sellerBalance: 5000 });
      reg.set(1, seller.id);
      seller.mortgagedProperties = [1];
      seller.mortgageLoans = { 1: 300 };
      sm.set(1, { level: 0, isMortgaged: true });

      const tradeRes = executeP2PTrade(room, seller.id, buyer.id, 1, 500, reg, sm);
      expect(tradeRes.success).toBe(true);

      const balBefore = seller.balance;
      const treasBefore = room.treasury ?? 0;
      collectMortgageInterest(room, seller.id);
      expect(seller.balance).toBe(balBefore);
      expect(room.treasury).toBe(treasBefore);
    });

    it('[TC-204.13/MSS][UC-IMP204] Buyer sở hữu đủ bộ màu nhưng có 1 ô thế chấp: Bị cấm xây nhà trên toàn bộ nhóm màu (ActionRejectReason.GROUP_MORTGAGED)', () => {
      const { room, seller, buyer, reg, sm } = setupRoom();
      reg.set(1, seller.id);
      seller.mortgagedProperties = [1];
      seller.mortgageLoans = { 1: 300 };
      sm.set(1, { level: 0, isMortgaged: true });
      reg.set(3, buyer.id);
      sm.set(3, { level: 0, isMortgaged: false });

      const tradeRes = executeP2PTrade(room, seller.id, buyer.id, 1, 500, reg, sm);
      expect(tradeRes.success).toBe(true);

      const res = upgradeProperty(buyer, 3, reg, sm);
      expect(res.success).toBe(false);
      expect(res.reason).toBe(ActionRejectReason.GROUP_MORTGAGED);
    });

    it('[TC-204.14/MSS][UC-IMP204] (Bắt buộc Sequential Test): Chạy executeP2PTrade chuyển ô đất thế chấp sang Buyer -> Sau đó Buyer giải chấp ô đất thành công với redeemProperty với giá loan * 1.10 nộp Kho Bạc', () => {
      const { room, seller, buyer, reg, sm } = setupRoom({ buyerBalance: 10000, sellerBalance: 5000 });
      reg.set(1, seller.id);
      seller.mortgagedProperties = [1];
      seller.mortgageLoans = { 1: 300 };
      sm.set(1, { level: 0, isMortgaged: true });
      room.treasury = 0;

      const tradeRes = executeP2PTrade(room, seller.id, buyer.id, 1, 500, reg, sm);
      expect(tradeRes.success).toBe(true);

      const redeemRes = redeemProperty(room, buyer.id, 1, reg, sm);
      expect(redeemRes.success).toBe(true);
      expect(buyer.mortgagedProperties).not.toContain(1);
      expect(sm.get(1)?.isMortgaged).toBe(false);
      expect(room.treasury).toBe(25 + 30);
    });

    it('[TC-204.15/MSS][UC-IMP204] Sau khi Buyer giải chấp thành công, nhóm màu mở khóa cho phép nâng cấp bình thường', () => {
      const { room, seller, buyer, reg, sm } = setupRoom({ buyerBalance: 10000 });
      reg.set(1, seller.id);
      seller.mortgagedProperties = [1];
      seller.mortgageLoans = { 1: 300 };
      sm.set(1, { level: 0, isMortgaged: true });
      reg.set(3, buyer.id);
      sm.set(3, { level: 0, isMortgaged: false });

      const tradeRes = executeP2PTrade(room, seller.id, buyer.id, 1, 500, reg, sm);
      expect(tradeRes.success).toBe(true);

      const redeemRes = redeemProperty(room, buyer.id, 1, reg, sm);
      expect(redeemRes.success).toBe(true);

      const res = upgradeProperty(buyer, 3, reg, sm);
      expect(res.success).toBe(true);
      expect(sm.get(3)?.level).toBe(1);
    });
  });

  // =========================================================================
  // FACET 4: Insolvency Restructuring & Bot AI Strategy
  // =========================================================================
  describe('Facet 4: Insolvency Restructuring & Bot AI Strategy', () => {
    it('[TC-204.16/MSS][UC-IMP204] Người chơi cá nhân có số dư âm (seller.balance < 0) được phép bán BĐS thế chấp với giá > 0 qua executeP2PTrade để kéo số dư về >= 0 thoát phá sản', () => {
      const { room, seller, buyer, reg, sm } = setupRoom({ sellerBalance: -500, buyerBalance: 10000 });
      reg.set(1, seller.id);
      seller.mortgagedProperties = [1];
      seller.mortgageLoans = { 1: 300 };
      sm.set(1, { level: 0, isMortgaged: true });

      const res = executeP2PTrade(room, seller.id, buyer.id, 1, 1000, reg, sm);
      expect(res.success).toBe(true);
      expect(seller.balance).toBe(450);
    });

    it('[TC-204.17/MSS][UC-IMP204] Bot nhận diện Monopoly Gap là ô đất thế chấp (isMortgaged: true) và đề xuất mua với giá đã khấu trừ RedeemCost = loan * 1.10', () => {
      const { room, seller, buyer, reg, sm } = setupRoom();
      seller.isBot = true;
      seller.personality = BotPersonality.Aggressive;
      reg.set(1, seller.id);
      reg.set(3, buyer.id);
      buyer.mortgagedProperties = [3];
      buyer.mortgageLoans = { 3: 300 };
      sm.set(1, { level: 0, isMortgaged: false });
      sm.set(3, { level: 0, isMortgaged: true });

      const gaps = findAllMonopolyGaps(seller, room, reg, sm);
      expect(gaps).toContainEqual({ cellIndex: 3, targetOwnerId: buyer.id });

      const intent = findEligibleBotTrade(seller, room, reg, sm, BotPersonality.Aggressive, 1);
      expect(intent).not.toBeNull();
      expect(intent?.cellIndex).toBe(3);
      expect(intent?.price).toBeLessThanOrEqual(510);
    });

    it('[TC-204.18/MSS][UC-IMP204] Bot kiểm tra safetyBuffer có cộng thêm đệm lãi nợ trước khi gửi đề xuất mua ô thế chấp', () => {
      const { room, seller, buyer, reg, sm } = setupRoom({ sellerBalance: 1700 });
      seller.isBot = true;
      seller.personality = BotPersonality.Balanced;
      reg.set(1, seller.id);
      reg.set(3, buyer.id);
      buyer.mortgagedProperties = [3];
      buyer.mortgageLoans = { 3: 300 };
      sm.set(1, { level: 0, isMortgaged: false });
      sm.set(3, { level: 0, isMortgaged: true });

      // Với ô thế chấp: giá đề xuất ~510, bot có 1700 -> dư 1190.
      // Chuẩn monopoly gap yêu cầu buffer 1000. Nhưng có nợ 300 + lãi giải chấp 30 = 330,
      // tổng đệm cần là 1330 > 1190 -> Bot từ chối gửi đề xuất.
      const intent = findEligibleBotTrade(seller, room, reg, sm, BotPersonality.Balanced, 1);
      expect(intent).toBeNull();
    });

    it('[TC-204.19/MSS][UC-IMP204] Bot khi bán ô thế chấp hạ thấp ngưỡng chấp nhận giá tương ứng với khoản vay đã giải ngân', () => {
      const { room, seller, buyer, reg, sm } = setupRoom();
      seller.isBot = true;
      reg.set(3, seller.id);
      seller.mortgagedProperties = [3];
      seller.mortgageLoans = { 3: 300 };
      sm.set(3, { level: 0, isMortgaged: true });

      const decision = evaluateBotTradeAcceptance(3, 550, seller, buyer, room, reg, sm, BotPersonality.Balanced);
      expect(decision.accept).toBe(true);
    });
  });

  // =========================================================================
  // FACET 5: Client UI & TradeModal Ergonomics
  // =========================================================================
  describe('Facet 5: Client UI & TradeModal Ergonomics', () => {
    it('[TC-204.20/MSS][UC-IMP204] Thẻ BĐS thế chấp trong TradeColumn không còn mang thuộc tính disabled', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeColumn, {
          title: 'Tài Sản Của Bạn',
          isMine: true,
          properties: [1],
          mortgagedProperties: [1],
          selectedProperties: [],
          onToggleProperty: () => {},
          cashVal: 0,
          onCashChange: () => {},
        })
      );
      expect(html).not.toMatch(/<button[^>]*disabled/);
      expect(html).not.toContain('cursor-not-allowed');
    });

    it('[TC-204.21/MSS][UC-IMP204] Thẻ BĐS thế chấp hiển thị huy hiệu nợ ⚠️ Nợ -Xđ và cho phép click chọn', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeColumn, {
          title: 'Tài Sản Của Bạn',
          isMine: true,
          properties: [1],
          mortgagedProperties: [1],
          selectedProperties: [],
          onToggleProperty: () => {},
          cashVal: 0,
          onCashChange: () => {},
        })
      );
      expect(html).toContain('⚠️ Nợ -');
      expect(html).not.toContain('>Thế chấp<');
    });

    it('[TC-204.22/MSS][UC-IMP204] TradeModal tính toán offeredBaseCost & requestedBaseCost dựa trên Net Equity đã khấu trừ nợ thế chấp', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'p2_buyer',
          myProperties: [1],
          targetProperties: [3],
          myMortgagedProperties: [1],
          myBalance: 5000,
          initialOffered: [1],
        })
      );
      expect(html).toContain('100% Gốc (300');
      expect(html).not.toContain('100% Gốc (600');
    });
  });
});
