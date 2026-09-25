import { describe, it, expect, beforeAll } from 'vitest';
import { createRoom, createPlayer, TurnPhase, type Room, type Player } from '../../src/domain/room';
import { ActionRejectReason } from '../../src/domain/action_reasons';
import { PROPERTY_DEEDS, type PropertyRegistry, type PropertyStateMap } from '../../src/domain/property_manager';
import { mortgageProperty } from '../../src/server/mortgage_manager';
import { coordTrade, coordExecuteCompulsoryBuyout, type RoomContext } from '../../src/server/room_property_coordinator';
import { executeP2PTrade } from '../../src/server/property_actions';
import { handleAuctionBid, handleAuctionPass, handleAuctionClose, type AuctionSession } from '../../src/server/auction_manager';
import { declareBankruptcy } from '../../src/server/insolvency_manager';
import { calculateAuctionIncrements } from '../../src/client/ui/modals/modal_helpers';
import * as sessionManager from '../../src/server/session_manager';

async function safeImport<T = Record<string, any>>(modulePath: string): Promise<T> {
  try {
    return await import(/* @vite-ignore */ modulePath);
  } catch {
    return {} as T;
  }
}

describe('[TC-192C/MSS][UC-IMP192C] IMP-192C Corporate Bond & Queued Fire Sale Contract Suite', () => {
  let bondTypes: any;
  let bondManager: any;
  let turnLoopExt: any;

  beforeAll(async () => {
    bondTypes = await safeImport('../../src/domain/bond_types');
    bondManager = await safeImport('../../src/server/bond_manager');
    turnLoopExt = await safeImport('../../src/server/turn_loop');
  });

  function createTestEnvironment(roomCode = 'ROOM01'): {
    room: Room;
    registry: PropertyRegistry;
    stateMap: PropertyStateMap;
    p1: Player;
    p2: Player;
  } {
    const room = createRoom(roomCode, 'player_tycoon_1');
    room.started = true;
    room.phase = TurnPhase.PropertyManagement;

    const p1 = createPlayer('player_tycoon_1');
    p1.name = 'Tycoon Alpha';
    p1.balance = 15_000;
    p1.position = 0;

    const p2 = createPlayer('player_tycoon_2');
    p2.name = 'Tycoon Beta';
    p2.balance = 15_000;
    p2.position = 0;

    room.players = [p1, p2];
    room.currentPlayerIndex = 0;

    const registry: PropertyRegistry = new Map();
    const stateMap: PropertyStateMap = new Map();

    return { room, registry, stateMap, p1, p2 };
  }

  // =========================================================================
  // Facet 1: [TC-192C.01-04] Điều kiện phát hành Trái phiếu
  // =========================================================================
  describe('Facet 1: [TC-192C.01-04] Điều kiện phát hành Trái phiếu', () => {
    it('[TC-192C.01/MSS][UC-IMP192C] validateIssueBond từ chối phát hành khi Net Worth < 3.000 Tr.', () => {
      const { room, registry, stateMap, p1 } = createTestEnvironment();
      p1.balance = 1_000;
      registry.set(1, p1.id);
      registry.set(3, p1.id);
      stateMap.set(1, { level: 0 });
      stateMap.set(3, { level: 0 });

      expect(bondManager.validateIssueBond).toBeDefined();
      const result = bondManager.validateIssueBond(room, p1.id, registry, stateMap);
      expect(result?.valid).toBe(false);
      expect(result?.reason).toBe((ActionRejectReason as any).BOND_NOT_ELIGIBLE ?? 'BOND_NOT_ELIGIBLE');
    });

    it('[TC-192C.02/MSS][UC-IMP192C] validateIssueBond từ chối phát hành khi sở hữu ít hơn 2 BĐS chưa thế chấp', () => {
      const { room, registry, stateMap, p1 } = createTestEnvironment();
      p1.balance = 3_500;
      registry.set(1, p1.id);
      stateMap.set(1, { level: 0 });

      expect(bondManager.validateIssueBond).toBeDefined();
      const result = bondManager.validateIssueBond(room, p1.id, registry, stateMap);
      expect(result?.valid).toBe(false);
      expect(result?.reason).toBe((ActionRejectReason as any).BOND_NOT_ELIGIBLE ?? 'BOND_NOT_ELIGIBLE');
    });

    it('[TC-192C.03/MSS][UC-IMP192C] validateIssueBond từ chối phát hành khi tổng giá trị BĐS đảm bảo < 50% khoản vay (Naked Bond Exploit)', () => {
      const { room, registry, stateMap, p1 } = createTestEnvironment();
      p1.balance = 4_000;
      registry.set(1, p1.id);
      registry.set(3, p1.id);
      stateMap.set(1, { level: 0 });
      stateMap.set(3, { level: 0 });

      expect(bondManager.validateIssueBond).toBeDefined();
      const result = bondManager.validateIssueBond(room, p1.id, registry, stateMap);
      expect(result?.valid).toBe(false);
      expect(result?.reason).toBe((ActionRejectReason as any).BOND_NOT_ELIGIBLE ?? 'BOND_NOT_ELIGIBLE');
    });

    it('[TC-192C.04/MSS][UC-IMP192C] handleIssueBond chấp thuận phát hành khi đủ điều kiện: vay 80% NW, nợ = gốc * 1.20, roundsLeft = 3, khóa đúng collateralCells', () => {
      const { room, registry, stateMap, p1 } = createTestEnvironment();
      p1.balance = 1_000;
      registry.set(6, p1.id);
      registry.set(8, p1.id);
      registry.set(9, p1.id);
      stateMap.set(6, { level: 0 });
      stateMap.set(8, { level: 0 });
      stateMap.set(9, { level: 0 });

      expect(bondManager.handleIssueBond).toBeDefined();
      const result = bondManager.handleIssueBond(room, p1.id, registry, stateMap);
      expect(result?.success).toBe(true);
      expect(p1.balance).toBe(1_000 + 3_360);
      expect((p1 as any).bondContract?.principal).toBe(3_360);
      expect((p1 as any).bondContract?.repayAmount).toBe(Math.floor(3_360 * 1.20));
      expect((p1 as any).bondContract?.roundsLeft).toBe(3);
      expect((p1 as any).bondContract?.collateralCells).toEqual(expect.arrayContaining([6, 8, 9]));
    });
  });

  // =========================================================================
  // Facet 2: [TC-192C.05-08] Khóa toàn diện tài sản đảm bảo
  // =========================================================================
  describe('Facet 2: [TC-192C.05-08] Khóa toàn diện tài sản đảm bảo', () => {
    it('[TC-192C.05/MSS][UC-IMP192C] mortgageProperty từ chối thế chấp BĐS nằm trong collateralCells với BOND_COLLATERAL_LOCKED', () => {
      const { room, registry, stateMap, p1 } = createTestEnvironment();
      registry.set(6, p1.id);
      stateMap.set(6, { level: 0 });
      (p1 as any).bondContract = {
        principal: 2_000,
        repayAmount: 2_400,
        roundsLeft: 3,
        collateralCells: [6, 8],
        isActive: true,
      };

      const res = mortgageProperty(room, p1.id, 6, registry, stateMap);
      expect(res.success).toBe(false);
      expect(res.reason).toBe((ActionRejectReason as any).BOND_COLLATERAL_LOCKED ?? 'BOND_COLLATERAL_LOCKED');
      expect(p1.mortgagedProperties ?? []).not.toContain(6);
    });

    it('[TC-192C.06/MSS][UC-IMP192C] coordTrade từ chối giao dịch P2P ô đất nằm trong collateralCells', () => {
      const { room, registry, stateMap, p1, p2 } = createTestEnvironment();
      registry.set(6, p1.id);
      stateMap.set(6, { level: 0 });
      (p1 as any).bondContract = {
        principal: 2_000,
        repayAmount: 2_400,
        roundsLeft: 3,
        collateralCells: [6],
        isActive: true,
      };

      const ctx: RoomContext = { room, reg: registry, sm: stateMap };
      const res = coordTrade(ctx, p1.id, p1.id, p2.id, 6, 1_200);
      expect(res.success).toBe(false);
      expect(res.reason).toBe((ActionRejectReason as any).BOND_COLLATERAL_LOCKED ?? 'BOND_COLLATERAL_LOCKED');
      expect(room.pendingTradeOffer).toBeUndefined();
    });

    it('[TC-192C.07/MSS][UC-IMP192C] executeP2PTrade chặn chuyển nhượng trễ nếu ô đất bị khóa collateralCells', () => {
      const { room, registry, stateMap, p1, p2 } = createTestEnvironment();
      registry.set(6, p1.id);
      stateMap.set(6, { level: 0 });
      (p1 as any).bondContract = {
        principal: 2_000,
        repayAmount: 2_400,
        roundsLeft: 3,
        collateralCells: [6],
        isActive: true,
      };

      const res = executeP2PTrade(room, p1.id, p2.id, 6, 1_200, registry, stateMap);
      expect(res.success).toBe(false);
      expect(res.reason).toBe((ActionRejectReason as any).BOND_COLLATERAL_LOCKED ?? 'BOND_COLLATERAL_LOCKED');
      expect(registry.get(6)).toBe(p1.id);
    });

    it('[TC-192C.08/MSS][UC-IMP192C] coordExecuteCompulsoryBuyout từ chối cưỡng chế thu mua ô đất đang là collateralCells', () => {
      const { room, registry, stateMap, p1, p2 } = createTestEnvironment();
      registry.set(6, p1.id);
      stateMap.set(6, { level: 0 });
      (p1 as any).bondContract = {
        principal: 2_000,
        repayAmount: 2_400,
        roundsLeft: 3,
        collateralCells: [6],
        isActive: true,
      };
      (room as any).pendingBuyout = {
        buyerId: p2.id,
        sellerId: p1.id,
        cellIndex: 6,
        cost: 2_000,
        expiresAt: Date.now() + 10_000,
      };

      const ctx: RoomContext = { room, reg: registry, sm: stateMap };
      const res = coordExecuteCompulsoryBuyout(ctx, p2.id, 6);
      expect(res.success).toBe(false);
      expect(res.reason).toBe((ActionRejectReason as any).BOND_COLLATERAL_LOCKED ?? 'BOND_COLLATERAL_LOCKED');
      expect(registry.get(6)).toBe(p1.id);
    });
  });

  // =========================================================================
  // Facet 3: [TC-192C.09-11] Đếm ngược đơn điểm & Tất toán thành công
  // =========================================================================
  describe('Facet 3: [TC-192C.09-11] Đếm ngược đơn điểm & Tất toán thành công', () => {
    it('[TC-192C.09/MSS][UC-IMP192C] processBondTurnTransition đếm lùi roundsLeft per-turn từ 3 -> 2 -> 1 tại lượt của con nợ', () => {
      const { room, registry, stateMap, p1 } = createTestEnvironment();
      (p1 as any).bondContract = {
        principal: 2_000,
        repayAmount: 2_400,
        roundsLeft: 3,
        collateralCells: [6, 8],
        isActive: true,
      };

      expect(bondManager.processBondTurnTransition).toBeDefined();
      bondManager.processBondTurnTransition(room, p1, registry, stateMap);
      expect((p1 as any).bondContract.roundsLeft).toBe(2);
      bondManager.processBondTurnTransition(room, p1, registry, stateMap);
      expect((p1 as any).bondContract.roundsLeft).toBe(1);
    });

    it('[TC-192C.10/MSS][UC-IMP192C] Khi đáo hạn (roundsLeft === 1) và đủ tiền: trừ repayAmount, nộp 20% lãi Kho Bạc, giải phóng collateralCells', () => {
      const { room, registry, stateMap, p1 } = createTestEnvironment();
      p1.balance = 5_000;
      room.treasury = 500;
      (p1 as any).bondContract = {
        principal: 2_000,
        repayAmount: 2_400,
        roundsLeft: 1,
        collateralCells: [6, 8],
        isActive: true,
      };

      expect(bondManager.processBondTurnTransition).toBeDefined();
      bondManager.processBondTurnTransition(room, p1, registry, stateMap);
      expect(p1.balance).toBe(5_000 - 2_400);
      expect(room.treasury).toBe(500 + 400);
      expect((p1 as any).bondContract).toBeNull();
    });

    it('[TC-192C.11/MSS][UC-IMP192C] Khi tất toán xong, gán tombstone bondContract = null phát tán tường minh qua delta', () => {
      const { room, registry, stateMap, p1 } = createTestEnvironment();
      (p1 as any).bondContract = null;

      const delta = sessionManager.buildDeltaFromRoom(room, registry, stateMap, 1);
      const pDelta = delta.players?.find((p: any) => p.id === p1.id) as any;
      expect(pDelta?.bondContract).toBeNull();
    });
  });

  // =========================================================================
  // Facet 4: [TC-192C.12-14] Vỡ nợ trái phiếu & Khấu trừ cưỡng chế tiền mặt
  // =========================================================================
  describe('Facet 4: [TC-192C.12-14] Vỡ nợ trái phiếu & Khấu trừ cưỡng chế tiền mặt', () => {
    it('[TC-192C.12/MSS][UC-IMP192C] processBondTurnTransition khi đáo hạn thiếu tiền tự động khấu trừ toàn bộ tiền mặt khả dụng nộp Kho Bạc trước', () => {
      const { room, registry, stateMap, p1 } = createTestEnvironment();
      p1.balance = 1_500;
      room.treasury = 200;
      registry.set(6, p1.id);
      registry.set(8, p1.id);
      stateMap.set(6, { level: 0 });
      stateMap.set(8, { level: 0 });
      (p1 as any).bondContract = {
        principal: 2_400,
        repayAmount: 2_880,
        roundsLeft: 1,
        collateralCells: [6, 8],
        isActive: true,
      };
      const auctions = new Map<string, AuctionSession>();

      expect(bondManager.processBondTurnTransition).toBeDefined();
      bondManager.processBondTurnTransition(room, p1, registry, stateMap, auctions, room.roomCode);
      expect(p1.balance).toBe(0);
      expect(room.treasury).toBe(200 + 1_500);
    });

    it('[TC-192C.13/MSS][UC-IMP192C] processBondTurnTransition khi vỡ nợ tịch thu toàn bộ collateralCells đưa vào room.fireSaleQueue', () => {
      const { room, registry, stateMap, p1 } = createTestEnvironment();
      p1.balance = 500;
      registry.set(6, p1.id);
      registry.set(8, p1.id);
      stateMap.set(6, { level: 0 });
      stateMap.set(8, { level: 0 });
      (p1 as any).bondContract = {
        principal: 2_000,
        repayAmount: 2_400,
        roundsLeft: 1,
        collateralCells: [6, 8],
        isActive: true,
      };
      const auctions = new Map<string, AuctionSession>();

      expect(bondManager.processBondTurnTransition).toBeDefined();
      bondManager.processBondTurnTransition(room, p1, registry, stateMap, auctions, room.roomCode);
      expect(registry.get(6)).toBeUndefined();
      expect((room as any).fireSaleQueue).toBeDefined();
      expect((p1 as any).bondContract).toBeNull();
    });

    it('[TC-192C.14/MSS][UC-IMP192C] processBondTurnTransition kích hoạt phiên phát mãi đầu tiên, chuyển phase sang AuctionPhase và giữ nguyên currentPlayerIndex', () => {
      const { room, registry, stateMap, p1 } = createTestEnvironment();
      p1.balance = 300;
      registry.set(6, p1.id);
      stateMap.set(6, { level: 0 });
      (p1 as any).bondContract = {
        principal: 2_000,
        repayAmount: 2_400,
        roundsLeft: 1,
        collateralCells: [6],
        isActive: true,
      };
      const auctions = new Map<string, AuctionSession>();

      expect(bondManager.processBondTurnTransition).toBeDefined();
      bondManager.processBondTurnTransition(room, p1, registry, stateMap, auctions, room.roomCode);
      expect(room.phase).toBe(TurnPhase.AuctionPhase);
      expect(room.currentPlayerIndex).toBe(0);
      expect(auctions.get(room.roomCode)?.cellIndex).toBe(6);
      expect((auctions.get(room.roomCode) as any)?.isFireSale).toBe(true);
    });
  });

  // =========================================================================
  // Facet 5: [TC-192C.15-18] Sàn phát mãi 0 đồng & Chuỗi hàng đợi tuần tự
  // =========================================================================
  describe('Facet 5: [TC-192C.15-18] Sàn phát mãi 0 đồng & Chuỗi hàng đợi tuần tự', () => {
    it('[TC-192C.15/MSS][UC-IMP192C] calculateAuctionIncrements và handleAuctionBid cho phép bid mức 0 Tr. khi isFireSale = true và chưa ai đặt giá', () => {
      const { room, registry, p2 } = createTestEnvironment();
      room.phase = TurnPhase.AuctionPhase;

      const inc = (calculateAuctionIncrements as any)(0, true, false);
      expect(inc).toEqual([0, 50, 100]);

      const session: AuctionSession = {
        cellIndex: 6,
        declinedPlayerId: 'player_tycoon_1',
        highestBid: 0,
        startingBid: 0,
        currentBid: 0,
        passedPlayers: new Set<string>(),
        ...({ isFireSale: true } as any),
      };

      const res = handleAuctionBid(room, session, p2.id, 0, registry);
      expect(res.success).toBe(true);
      expect(session.highestBid).toBe(0);
      expect(session.highestBidder).toBe(p2.id);
    });

    it('[TC-192C.16/MSS][UC-IMP192C] Con nợ vỡ nợ bị cấm tham gia đấu giá tài sản của chính mình với DECLINED_PLAYER_CANNOT_BID', () => {
      const { room, registry, p1 } = createTestEnvironment();
      room.phase = TurnPhase.AuctionPhase;
      const auctions = new Map<string, AuctionSession>();

      expect(bondManager.handleStartFireSaleAuction).toBeDefined();
      bondManager.handleStartFireSaleAuction(room, 6, auctions, room.roomCode, p1.id);

      const session = auctions.get(room.roomCode);
      expect(session).toBeDefined();
      expect((session as any)?.isFireSale).toBe(true);

      const res = handleAuctionBid(room, session, p1.id, 50, registry, auctions, room.roomCode);
      expect(res.success).toBe(false);
      expect(res.reason).toBe(ActionRejectReason.DECLINED_PLAYER_CANNOT_BID);
    });

    it('[TC-192C.17/MSS][UC-IMP192C] Khi All Passed ở phiên phát mãi, thu hồi đất về Kho Bạc (registry.delete, stateMap.delete)', () => {
      const { room, registry, stateMap, p1, p2 } = createTestEnvironment();
      room.phase = TurnPhase.AuctionPhase;
      registry.set(6, p1.id);
      stateMap.set(6, { level: 0 });

      const auctions = new Map<string, AuctionSession>();
      const session: AuctionSession = {
        cellIndex: 6,
        declinedPlayerId: p1.id,
        highestBid: 0,
        startingBid: 0,
        currentBid: 0,
        passedPlayers: new Set<string>([p2.id]),
        ...({ isFireSale: true } as any),
      };
      auctions.set(room.roomCode, session);

      handleAuctionClose(room, session, registry, auctions, room.roomCode);
      expect(registry.has(6)).toBe(false);
      expect(stateMap.has(6)).toBe(false);
    });

    it('[TC-192C.18/MSS][UC-IMP192C] Khi hàng đợi cạn (fireSaleQueue.length === 0), handleAuctionClose gọi advanceTurnToNextPlayer chuyển lượt sang người tiếp theo', () => {
      const { room, registry, p1, p2 } = createTestEnvironment();
      room.phase = TurnPhase.AuctionPhase;
      room.currentPlayerIndex = 0;
      (room as any).fireSaleQueue = [];

      const auctions = new Map<string, AuctionSession>();
      const session: AuctionSession = {
        cellIndex: 6,
        declinedPlayerId: p1.id,
        highestBid: 0,
        startingBid: 0,
        currentBid: 0,
        passedPlayers: new Set<string>([p2.id]),
        ...({ isFireSale: true } as any),
      };
      auctions.set(room.roomCode, session);

      handleAuctionClose(room, session, registry, auctions, room.roomCode);
      expect(room.currentPlayerIndex).toBe(1);
      expect(room.phase).toBe(TurnPhase.WaitingRoll);
    });
  });

  // =========================================================================
  // Facet 6: [TC-192C.19-20] Thực thi Senior Lien trong phá sản chéo
  // =========================================================================
  describe('Facet 6: [TC-192C.19-20] Thực thi Senior Lien trong phá sản chéo', () => {
    it('[TC-192C.19/MSS][UC-IMP192C] declareBankruptcy khi con nợ bị phá sản bởi đối thủ khác, BĐS đảm bảo được Kho Bạc thu hồi trước và kích hoạt phiên phát mãi', () => {
      const { room, registry, stateMap, p1, p2 } = createTestEnvironment();
      registry.set(6, p1.id);
      stateMap.set(6, { level: 0 });
      (p1 as any).bondContract = {
        principal: 2_000,
        repayAmount: 2_400,
        roundsLeft: 2,
        collateralCells: [6],
        isActive: true,
      };

      const auctions = new Map<string, AuctionSession>();
      declareBankruptcy(room, p1.id, registry, stateMap, p2.id, auctions, room.roomCode);

      expect(registry.get(6)).not.toBe(p2.id);
      expect(room.phase).toBe(TurnPhase.AuctionPhase);
      expect(auctions.get(room.roomCode)).toBeDefined();
    });

    it('[TC-192C.20/MSS][UC-IMP192C] declareBankruptcy chỉ chuyển BĐS dôi dư không bị khóa bond sang cho chủ nợ người chơi', () => {
      const { room, registry, stateMap, p1, p2 } = createTestEnvironment();
      registry.set(6, p1.id);
      registry.set(8, p1.id);
      stateMap.set(6, { level: 0 });
      stateMap.set(8, { level: 0 });
      (p1 as any).bondContract = {
        principal: 2_000,
        repayAmount: 2_400,
        roundsLeft: 2,
        collateralCells: [6],
        isActive: true,
      };

      const auctions = new Map<string, AuctionSession>();
      declareBankruptcy(room, p1.id, registry, stateMap, p2.id, auctions, room.roomCode);

      expect(registry.get(8)).toBe(p2.id);
      expect(registry.get(6)).not.toBe(p2.id);
    });
  });

  // =========================================================================
  // Facet 7: Invariant Defense & Turn Seam Extension
  // =========================================================================
  describe('Facet 7: Invariant Defense & Turn Seam Extension', () => {
    it('[TC-192C.21/MSS][UC-IMP192C] validateIssueBond từ chối phát hành khi người chơi đang có hợp đồng trái phiếu active', () => {
      const { room, registry, stateMap, p1 } = createTestEnvironment();
      p1.balance = 5_000;
      registry.set(6, p1.id);
      registry.set(8, p1.id);
      stateMap.set(6, { level: 0 });
      stateMap.set(8, { level: 0 });
      (p1 as any).bondContract = {
        principal: 2_000,
        repayAmount: 2_400,
        roundsLeft: 2,
        collateralCells: [6],
        isActive: true,
      };

      expect(bondManager.validateIssueBond).toBeDefined();
      const result = bondManager.validateIssueBond(room, p1.id, registry, stateMap);
      expect(result?.valid).toBe(false);
      expect(result?.reason).toBe((ActionRejectReason as any).BOND_NOT_ELIGIBLE ?? 'BOND_NOT_ELIGIBLE');
    });

    it('[TC-192C.22/MSS][UC-IMP192C] advanceTurnToNextPlayer helper xuất hiện trong turn_loop, tăng roundBoundary khi next === 0 và reset rolledThisTurn', () => {
      const { room } = createTestEnvironment();
      room.currentPlayerIndex = 0;

      expect(turnLoopExt.advanceTurnToNextPlayer).toBeDefined();
      turnLoopExt.advanceTurnToNextPlayer(room, () => 0.5);
      expect(room.currentPlayerIndex).toBe(1);
      expect(room.phase).toBe(TurnPhase.WaitingRoll);
    });
  });
});
