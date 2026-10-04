// [CONTRACT TEST] IMP-254: P2P Trade Actions Module Boundary & SSOT Tax Rate Invariants
// Traceability Tags: [TC-254.01..16] & [UC-P2P-MOD/MSS, A1..A5]
// Universal 5-Facet Behavioral Matrix & Anti-TIDD SSOT Enforcement
import { describe, it, expect } from 'vitest';
import { executeP2PTrade, validateP2PTrade } from '../../src/server/p2p_trade_actions.js';
import {
  P2P_TAX_RATE,
  P2P_ANTI_SPECULATE_TAX,
  type PropertyRegistry,
  type PropertyStateMap,
} from '../../src/domain/property_data.js';
import { ActionRejectReason } from '../../src/domain/action_reasons.js';
import { MarketCardId } from '../../src/domain/event_card_types.js';
import { createRoom, createPlayer, TurnPhase, type Room, type Player } from '../../src/domain/room.js';

function setupTradeRoom(opts?: {
  sellerBalance?: number;
  buyerBalance?: number;
  treasury?: number;
  started?: boolean;
}): {
  room: Room;
  seller: Player;
  buyer: Player;
  reg: PropertyRegistry;
  sm: PropertyStateMap;
} {
  const room = createRoom('p1_seller', 'ROOM01');
  room.started = opts?.started ?? true;
  room.phase = TurnPhase.PropertyManagement;
  room.treasury = opts?.treasury ?? 0;

  const seller = room.players[0]!;
  seller.balance = opts?.sellerBalance ?? 10000;

  const buyer = createPlayer('p2_buyer');
  buyer.balance = opts?.buyerBalance ?? 10000;
  room.players.push(buyer);

  const reg: PropertyRegistry = new Map();
  const sm: PropertyStateMap = new Map();

  return { room, seller, buyer, reg, sm };
}

describe('[TC-254][UC-P2P-MOD] P2P Trade Actions Boundary & Invariants Contract Suite', () => {
  // =========================================================================
  // FACET 1 & MSS: Main Success Scenario & SSOT Constants
  // =========================================================================
  describe('Main Success Scenario & SSOT Tax Constants', () => {
    it('[TC-254.01/MSS][UC-P2P-MOD/MSS] executeP2PTrade thuc hien hoan doi quyen so huu BDS va cap nhat so du cac ben chinh xac', () => {
      const { room, seller, buyer, reg, sm } = setupTradeRoom({ sellerBalance: 5000, buyerBalance: 10000 });
      reg.set(1, seller.id);

      const res = executeP2PTrade(room, seller.id, buyer.id, 1, 800, reg, sm);
      expect(res.success).toBe(true);
      expect(reg.get(1)).toBe(buyer.id);
      expect(buyer.balance).toBe(10000 - 800);
      expect(seller.balance).toBe(5000 + 760);
    });

    it('[TC-254.02/MSS][UC-P2P-MOD/MSS] validateP2PTrade tu choi giao dich khi nguoi mua khong du so du thanh toan tien mat', () => {
      const { room, seller, buyer, reg, sm } = setupTradeRoom({ buyerBalance: 500 });
      reg.set(1, seller.id);

      const v = validateP2PTrade(room, seller.id, buyer.id, 1, 800, reg, sm);
      expect(v.valid).toBe(false);
      expect(v.reason).toBe(ActionRejectReason.INSUFFICIENT_FUNDS);
    });

    it('[TC-254.03/MSS][UC-P2P-MOD/MSS] P2P_TAX_RATE dat 0.05 (5%) va P2P_ANTI_SPECULATE_TAX dat 0.20 (20%) theo dung dac ta requirements.md', () => {
      const { room, seller, buyer, reg, sm } = setupTradeRoom();
      reg.set(1, seller.id);

      const v = validateP2PTrade(room, seller.id, buyer.id, 1, 1000, reg, sm);
      expect(P2P_TAX_RATE).toBe(0.05);
      expect(P2P_ANTI_SPECULATE_TAX).toBe(0.20);
      expect(v.valid ? v.taxRate : undefined).toBe(0.05);
    });

    it('[TC-254.04/MSS][UC-P2P-MOD/MSS] Luong chinh MSS: executeP2PTrade chuyen quyen so huu o dat, tru tien nguoi mua, cong tien nguoi ban (sau thue 5%) va nap thue vao kho bac', () => {
      const { room, seller, buyer, reg, sm } = setupTradeRoom({ sellerBalance: 5000, buyerBalance: 10000, treasury: 100 });
      reg.set(1, seller.id);

      const res = executeP2PTrade(room, seller.id, buyer.id, 1, 1000, reg, sm);
      expect(res.success).toBe(true);
      expect(room.treasury).toBe(100 + 50);
      expect(seller.balance).toBe(5000 + 950);
      expect(buyer.balance).toBe(10000 - 1000);
    });

    it('[TC-254.05/MSS][UC-P2P-MOD/MSS] Su kien chong dau co: Khi MC_ANTI_SPECULATE kich hoat, thue chuyen nhuong tu dong nhay len 20% nop kho bac', () => {
      const { room, seller, buyer, reg, sm } = setupTradeRoom({ sellerBalance: 2000, buyerBalance: 5000, treasury: 0 });
      reg.set(1, seller.id);

      // 1. Unrelated modifier active: taxRate must remain 5%
      room.activeModifiers = [
        { type: MarketCardId.MC_PUBLIC_INVEST, affectedCells: [], remainingRounds: 2 },
      ];
      const normVal = validateP2PTrade(room, seller.id, buyer.id, 1, 1000, reg, sm);
      expect(normVal.valid ? normVal.taxRate : undefined).toBe(0.05);

      // 2. Anti-speculate active: taxRate jumps to 20%
      room.activeModifiers = [
        { type: MarketCardId.MC_ANTI_SPECULATE, affectedCells: [], remainingRounds: 2 },
      ];

      const res = executeP2PTrade(room, seller.id, buyer.id, 1, 1000, reg, sm);
      expect(res.success).toBe(true);
      expect(room.treasury).toBe(200);
      expect(seller.balance).toBe(2000 + 800);
    });

    it('[TC-254.06/MSS][UC-P2P-MOD/MSS] Chuyen giao no the chap: Thuc thi qua API cong khai executeP2PTrade voi o dat co stateMap.get(cellIndex).isMortgaged = true, xac nhan no chuyen giao chinh xac', () => {
      const { room, seller, buyer, reg, sm } = setupTradeRoom();
      delete (buyer as Partial<Player>).mortgagedProperties;
      reg.set(1, seller.id);
      seller.mortgagedProperties = [1];
      seller.mortgageLoans = { 1: 300 };
      sm.set(1, { level: 0, isMortgaged: true });

      const res = executeP2PTrade(room, seller.id, buyer.id, 1, 800, reg, sm);
      expect(res.success).toBe(true);
      expect(buyer.mortgagedProperties).toEqual([1]);
      expect(buyer.mortgageLoans?.[1]).toBe(300);
      expect(seller.mortgagedProperties).not.toContain(1);
    });

    it('[TC-254.07/MSS][UC-P2P-MOD/MSS] Hoan doi BDS (Asset Swap): Hai o dat doi chu dong thoi, xoa ban ghi tu choi giao dich cu cua ca hai ben', () => {
      const { room, seller, buyer, reg, sm } = setupTradeRoom();
      reg.set(1, seller.id);
      reg.set(3, buyer.id);
      buyer.cellTradeRejections = { 1: 2 };
      seller.cellTradeRejections = { 3: 1 };

      const res = executeP2PTrade(room, seller.id, buyer.id, 1, 0, reg, sm, 3);
      expect(res.success).toBe(true);
      expect(reg.get(1)).toBe(buyer.id);
      expect(reg.get(3)).toBe(seller.id);
      expect(buyer.cellTradeRejections?.[1]).toBeUndefined();
    });
  });

  // =========================================================================
  // FACET 2 & EXCEPTIONS: Insolvent Parties, Floor Price, Buildings
  // =========================================================================
  describe('Exceptions A1, A2: Party Status, Price Floor, Buildings', () => {
    it('[TC-254.08/A1][UC-P2P-MOD/A1] Ngoai le A1: Nguoi mua co so du am (buyer.balance < 0) bi tu choi voi INSUFFICIENT_FUNDS', () => {
      const { room, seller, buyer, reg, sm } = setupTradeRoom({ buyerBalance: -100 });
      reg.set(1, seller.id);

      const res = executeP2PTrade(room, seller.id, buyer.id, 1, 800, reg, sm);
      expect(res.success).toBe(false);
      expect(res.reason).toBe(ActionRejectReason.INSUFFICIENT_FUNDS);
    });

    it('[TC-254.09/A1][UC-P2P-MOD/A1] Ngoai le A1: Nguoi ban co so du am (seller.balance < 0) duoc phep ban tai san voi price > 0 de giai cuu pha san, nhung bi tu choi neu price <= 0', () => {
      const { room, seller, buyer, reg, sm } = setupTradeRoom({ sellerBalance: -500 });
      reg.set(1, seller.id);
      reg.set(3, buyer.id);

      const resPositive = validateP2PTrade(room, seller.id, buyer.id, 1, 800, reg, sm);
      const resNonPositive = validateP2PTrade(room, seller.id, buyer.id, 1, 0, reg, sm, 3);
      expect(resPositive.valid).toBe(true);
      expect(resNonPositive.reason).toBe(ActionRejectReason.INSUFFICIENT_FUNDS);

      // Price <= 0 without swap is rejected as INVALID_PRICE (testing line 55 boundary)
      const resNegNoSwap = validateP2PTrade(room, seller.id, buyer.id, 1, -100, reg, sm);
      expect(resNegNoSwap.reason).toBe(ActionRejectReason.INVALID_PRICE);
    });

    it('[TC-254.10/A2][UC-P2P-MOD/A2] Ngoai le A2: Gia chuyen nhuong duoi san (< 70% dat thuong, < 35% dat the chap) bi tu choi voi PRICE_BELOW_FLOOR', () => {
      const { room, seller, buyer, reg, sm } = setupTradeRoom();
      reg.set(1, seller.id); // Pho Hue price = 600; floor 70% = 420; floor 35% = 210

      // Exact floor: 420 is valid (kills 0.70 -> 0.75 mutant)
      const resNormalExact = validateP2PTrade(room, seller.id, buyer.id, 1, 420, reg, sm);
      expect(resNormalExact.valid).toBe(true);

      const resNormalBelow = validateP2PTrade(room, seller.id, buyer.id, 1, 419, reg, sm);
      expect(resNormalBelow.reason).toBe(ActionRejectReason.PRICE_BELOW_FLOOR);

      sm.set(1, { level: 0, isMortgaged: true });
      // Exact floor mortgaged: 210 is valid (kills 0.35 -> 0.40 mutant)
      const resMortExact = validateP2PTrade(room, seller.id, buyer.id, 1, 210, reg, sm);
      expect(resMortExact.valid).toBe(true);

      const resMortBelow = validateP2PTrade(room, seller.id, buyer.id, 1, 209, reg, sm);
      expect(resMortBelow.reason).toBe(ActionRejectReason.PRICE_BELOW_FLOOR);
    });

    it('[TC-254.11/A2][UC-P2P-MOD/A2] Ngoai le A2: Bat dong san da nang cap nha/khach san hoac tram ETC bi tu choi voi PROPERTY_HAS_BUILDING', () => {
      const { room, seller, buyer, reg, sm } = setupTradeRoom();
      reg.set(1, seller.id);
      sm.set(1, { level: 1 });

      const resHouse = validateP2PTrade(room, seller.id, buyer.id, 1, 800, reg, sm);
      expect(resHouse.reason).toBe(ActionRejectReason.PROPERTY_HAS_BUILDING);

      reg.set(5, seller.id);
      sm.set(5, { level: 0, isETC: true });
      const resETC = validateP2PTrade(room, seller.id, buyer.id, 5, 2000, reg, sm);
      expect(resETC.reason).toBe(ActionRejectReason.PROPERTY_HAS_BUILDING);
    });
  });

  // =========================================================================
  // FACET 3 & EXCEPTIONS: Collateral, Market Freeze, Lifecycle, Rounding Parity
  // =========================================================================
  describe('Exceptions A3, A4, A5: Collateral, Freeze, Lifecycle, Rounding', () => {
    it('[TC-254.12/A3][UC-P2P-MOD/A3] Ngoai le A3: O dat dang bi khoa the chap trong hop dong Trai Phieu Doanh Nghiep bi tu choi voi BOND_COLLATERAL_LOCKED', () => {
      const { room, seller, buyer, reg, sm } = setupTradeRoom();
      reg.set(1, seller.id);
      seller.bondContract = {
        principal: 1000,
        repayAmount: 1200,
        roundsLeft: 2,
        collateralCells: [1],
        isActive: true,
      };

      const res = validateP2PTrade(room, seller.id, buyer.id, 1, 800, reg, sm);
      expect(res.valid).toBe(false);
      expect(res.reason).toBe(ActionRejectReason.BOND_COLLATERAL_LOCKED);
    });

    it('[TC-254.13/A3][UC-P2P-MOD/A3] Ngoai le A3: The su kien MC_FREEZE_TRADE dang hieu luc tu choi moi giao dich voi FREEZE_ACTIVE', () => {
      const { room, seller, buyer, reg, sm } = setupTradeRoom();
      reg.set(1, seller.id);
      room.activeModifiers = [
        { type: MarketCardId.MC_FREEZE_TRADE, affectedCells: [], remainingRounds: 1 },
      ];

      const res = validateP2PTrade(room, seller.id, buyer.id, 1, 800, reg, sm);
      expect(res.valid).toBe(false);
      expect(res.reason).toBe(ActionRejectReason.FREEZE_ACTIVE);
    });

    it('[TC-254.14/A4][UC-P2P-MOD/A4] Ngoai le A4: Ban choi chua bat dau (room.started === false) tu choi voi GAME_NOT_STARTED', () => {
      const { room, seller, buyer, reg, sm } = setupTradeRoom({ started: false });
      reg.set(1, seller.id);

      const res = validateP2PTrade(room, seller.id, buyer.id, 1, 800, reg, sm);
      expect(res.valid).toBe(false);
      expect(res.reason).toBe(ActionRejectReason.GAME_NOT_STARTED);
    });

    it('[TC-254.15/A4][UC-P2P-MOD/A4] Ngoai le A4: Tu giao dich voi chinh minh (sellerId === buyerId) tu choi voi INVALID_TRADE', () => {
      const { room, seller, reg, sm } = setupTradeRoom();
      reg.set(1, seller.id);

      const res = validateP2PTrade(room, seller.id, seller.id, 1, 800, reg, sm);
      expect(res.valid).toBe(false);
      expect(res.reason).toBe(ActionRejectReason.INVALID_TRADE);
    });

    it('[TC-254.16/A5][UC-P2P-MOD/A5] Ngoai le A5: Khoa bat bien lam tron thue P2P hien tai (Server Math.round vs Client Math.floor) chong troi dat vo thuc', () => {
      const { room, seller, buyer, reg, sm } = setupTradeRoom();
      reg.set(1, seller.id);

      // Gia 801 (801 * 0.05 = 40.05 -> round 40)
      const v801 = validateP2PTrade(room, seller.id, buyer.id, 1, 801, reg, sm);
      // Gia 805 (805 * 0.05 = 40.25 -> round 40)
      const v805 = validateP2PTrade(room, seller.id, buyer.id, 1, 805, reg, sm);
      // Gia 810 (810 * 0.05 = 40.50 -> round 41, client Math.floor would be 40)
      const v810 = validateP2PTrade(room, seller.id, buyer.id, 1, 810, reg, sm);

      expect(v801.taxAmount).toBe(40);
      expect(v805.taxAmount).toBe(40);
      expect(v810.taxAmount).toBe(41);
    });

    it('[TC-254.17/A1][UC-P2P-MOD/A1] Ngoai le A1: Nguoi mua hoac nguoi ban da bi pha san (bankrupt === true) bi tu choi voi PLAYER_BANKRUPT', () => {
      const { room, seller, buyer, reg, sm } = setupTradeRoom();
      reg.set(1, seller.id);

      // 1. Buyer is bankrupt
      buyer.bankrupt = true;
      const vBuyer = validateP2PTrade(room, seller.id, buyer.id, 1, 800, reg, sm);
      expect(vBuyer.valid).toBe(false);
      expect(vBuyer.reason).toBe(ActionRejectReason.PLAYER_BANKRUPT);

      // 2. Seller is bankrupt
      buyer.bankrupt = false;
      seller.bankrupt = true;
      const vSeller = validateP2PTrade(room, seller.id, buyer.id, 1, 800, reg, sm);
      expect(vSeller.valid).toBe(false);
      expect(vSeller.reason).toBe(ActionRejectReason.PLAYER_BANKRUPT);
    });
  });
});
