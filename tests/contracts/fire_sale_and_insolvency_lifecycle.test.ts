// [CONTRACT TEST] IMP-240: Fire Sale & Insolvency Lifecycle Resilience
// Traceability Tags: [TC-FS.01/MSS..TC-FS.17/TurnAdvance] & [UC-IMP240]
// Universal 5-Facet Behavioral Matrix & Adversarial Inversion Verification
// Strict QA Protocol: No production source files modified in src/**

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { createRoom, createPlayer, TurnPhase, type Room, type Player } from '../../src/domain/room';
import { ActionRejectReason } from '../../src/domain/action_reasons';
import { type PropertyRegistry, type PropertyStateMap } from '../../src/domain/property_manager';
import { BondTrancheId } from '../../src/domain/bond_types';
import { handleStartFireSaleAuction } from '../../src/server/bond_manager';
import { calculateAuctionIncrements } from '../../src/client/ui/modals/modal_helpers';
import { handleAuctionBid, handleAuctionClose, type AuctionSession } from '../../src/server/auction_manager';
import { AuctionModal } from '../../src/client/ui/modals/auction_modal';
import { declareBankruptcy } from '../../src/server/insolvency_manager';
import { executeInsolvencyAfkRecovery } from '../../src/server/network/afk_recovery';
import { RoomManager } from '../../src/server/room_manager';
import { buildDeltaFromRoom } from '../../src/server/session_manager';
import { ModalHost } from '../../src/client/ui/modals/modal_host';
import { useGameStore } from '../../src/client/store/game_store.js';
import { coordMortgage, coordDowngrade, type RoomContext } from '../../src/server/room_property_coordinator';
import { advanceTurnToNextPlayer } from '../../src/server/turn_loop';

declare module '../../src/domain/room' {
  interface Room {
    fireSaleDebtorId?: string;
    pendingInsolvencyCreditorId?: string;
    pendingInsolvencyDebtorId?: string;
  }
}

declare module '../../src/client/ui/modals/auction_modal' {
  interface AuctionModalProps {
    readonly isBankrupt?: boolean;
  }
}

function createTestEnvironment(roomCode = 'ROOM_FS'): {
  room: Room;
  registry: PropertyRegistry;
  stateMap: PropertyStateMap;
  p1: Player;
  p2: Player;
} {
  const room = createRoom(roomCode, 'p1');
  room.started = true;
  room.phase = TurnPhase.PropertyManagement;

  const p1 = createPlayer('p1');
  p1.name = 'Tycoon Alpha';
  p1.balance = 5_000;
  p1.position = 0;

  const p2 = createPlayer('p2');
  p2.name = 'Tycoon Beta';
  p2.balance = 5_000;
  p2.position = 0;

  room.players = [p1, p2];
  room.currentPlayerIndex = 0;

  const registry: PropertyRegistry = new Map();
  const stateMap: PropertyStateMap = new Map();

  return { room, registry, stateMap, p1, p2 };
}

describe('[TC-FS/MSS][UC-IMP240] Fire Sale & Insolvency Lifecycle Contract Suite', () => {
  // =========================================================================
  // Facet 1: [TC-FS.01 - TC-FS.03] Khởi Tạo Sàn Phát Mãi & Bước Giá 0đ
  // =========================================================================
  describe('Facet 1: Khởi Tạo Sàn Phát Mãi & Bước Giá 0đ', () => {
    it('[TC-FS.01/MSS][UC-IMP240] Phiên đấu giá phát mãi handleStartFireSaleAuction khởi tạo startingBid: 0, isFireSale: true, insolvencyPlayerId', () => {
      const { room } = createTestEnvironment('ROOM_01');
      const auctions = new Map<string, AuctionSession>();
      handleStartFireSaleAuction(room, 5, auctions, room.roomCode, 'p_debtor');
      const session = auctions.get(room.roomCode);

      expect(session?.startingBid).toBe(0);
      expect(session?.isFireSale).toBe(true);
      expect(session?.insolvencyPlayerId).toBe('p_debtor');
      expect(session?.declinedPlayerId).toBe('p_debtor');
    });

    it('[TC-FS.02/MSS][UC-IMP240] calculateAuctionIncrements(0, true, false) trả về chính xác [0, 50, 100]', () => {
      const increments = calculateAuctionIncrements(0, true, false);
      expect(increments).toEqual([0, 50, 100]);
    });

    it('[TC-FS.03/MSS][UC-IMP240] Khi đã có người đặt giá (hasBidder = true), calculateAuctionIncrements(0, true, true) trả về các bước giá tăng dần', () => {
      const increments = calculateAuctionIncrements(0, true, true);
      expect(increments).toEqual([100, 200, 500]);
    });
  });

  // =========================================================================
  // Facet 2: [TC-FS.04 - TC-FS.05] Rào Chắn Tham Gia & Chế Độ Spectator Phá Sản
  // =========================================================================
  describe('Facet 2: Rào Chắn Tham Gia & Chế Độ Spectator Phá Sản', () => {
    it('[TC-FS.04/Boundary][UC-IMP240] Người sở hữu tài sản phát mãi (bankruptPlayerId) bị cấm đặt giá (isDeclinedPlayer = true)', () => {
      const { room, registry, stateMap } = createTestEnvironment('ROOM_04');
      room.phase = TurnPhase.AuctionPhase;
      const auctions = new Map<string, AuctionSession>();
      handleStartFireSaleAuction(room, 5, auctions, room.roomCode, 'p1');
      const session = auctions.get(room.roomCode);

      const bidRes = handleAuctionBid(room, session, 'p1', 50, registry, auctions, room.roomCode, stateMap);
      expect(bidRes.success).toBe(false);
      expect(bidRes.reason).toBe(ActionRejectReason.DECLINED_PLAYER_CANNOT_BID);
    });

    it('[TC-FS.05/Boundary][UC-IMP240] Người chơi đã phá sản (isMyPlayerBankrupt = true) không được render cụm nút cược, hiển thị thông báo spectator, và tắt Auto-Bid', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 5,
          currentBid: 0,
          highestBidderId: null,
          timeRemaining: 15,
          myId: 'p_bankrupt',
          isBankrupt: true,
          playersInfo: {
            p_bankrupt: { id: 'p_bankrupt', name: 'Đại gia vỡ nợ', bankrupt: true },
            p2: { id: 'p2', name: 'Đại gia 2', balance: 5000 },
          },
        })
      );

      expect(html).toContain('Bạn đã phá sản và đang theo dõi phiên đấu giá tài sản phát mãi.');
      expect(html).not.toContain('Bắt Đáy (0)');
      expect(html).toContain('TỰ ĐỘNG ĐẶT GIÁ: TẮT');
      expect(html).toContain('disabled');
    });
  });

  // =========================================================================
  // Facet 3: [TC-FS.06, TC-FS.07, TC-FS.17] Vòng Đời Hàng Đợi Phát Mãi & Dọn Dẹp Trạng Thái Quá Độ
  // =========================================================================
  describe('Facet 3: Vòng Đời Hàng Đợi Phát Mãi & Dọn Dẹp Trạng Thái Quá Độ', () => {
    it('[TC-FS.06/Lifecycle][UC-IMP240] Khi ô đất đầu tiên trong fireSaleQueue kết thúc, ô tiếp theo nhận đúng room.fireSaleDebtorId', () => {
      const { room, registry, stateMap } = createTestEnvironment('ROOM_06');
      room.phase = TurnPhase.AuctionPhase;
      room.fireSaleQueue = [6, 8];
      room.fireSaleDebtorId = 'p_debtor';

      const auctions = new Map<string, AuctionSession>();
      const session: AuctionSession = {
        cellIndex: 6,
        declinedPlayerId: 'p_debtor',
        highestBid: 100,
        currentBid: 100,
        highestBidder: 'p1',
        isFireSale: true,
        insolvencyPlayerId: 'p_debtor',
      };
      auctions.set(room.roomCode, session);
      registry.set(6, 'p_debtor');
      registry.set(8, 'p_debtor');

      handleAuctionClose(room, session, registry, auctions, room.roomCode, stateMap);
      const nextSession = auctions.get(room.roomCode);

      expect(nextSession?.cellIndex).toBe(8);
      expect(nextSession?.declinedPlayerId).toBe('p_debtor');
      expect(nextSession?.insolvencyPlayerId).toBe('p_debtor');
    });

    it('[TC-FS.07/Lifecycle][UC-IMP240] Khi fireSaleQueue hết, room.fireSaleDebtorId và room.fireSaleQueue được dọn dẹp sạch sẽ (teardown)', () => {
      const { room, registry, stateMap } = createTestEnvironment('ROOM_07');
      room.phase = TurnPhase.AuctionPhase;
      room.fireSaleQueue = [];
      room.fireSaleDebtorId = 'p_debtor';

      const auctions = new Map<string, AuctionSession>();
      const session: AuctionSession = {
        cellIndex: 8,
        declinedPlayerId: 'p_debtor',
        highestBid: 100,
        currentBid: 100,
        highestBidder: 'p1',
        isFireSale: true,
        insolvencyPlayerId: 'p_debtor',
      };
      auctions.set(room.roomCode, session);

      handleAuctionClose(room, session, registry, auctions, room.roomCode, stateMap);

      expect(room.fireSaleQueue).toBeUndefined();
      expect(room.fireSaleDebtorId).toBeUndefined();
    });

    it('[TC-FS.17/TurnAdvance][UC-IMP240] Khi chuyển sang lượt người chơi tiếp theo qua advanceTurnToNextPlayer, các cờ pendingInsolvencyCreditorId và pendingInsolvencyDebtorId cũ bị xóa sạch', () => {
      const { room, p1, p2 } = createTestEnvironment('ROOM_17');
      p1.balance = 1000;
      p2.balance = 1000;
      room.currentPlayerIndex = 0;
      room.pendingInsolvencyCreditorId = 'p2';
      room.pendingInsolvencyDebtorId = 'p1';

      advanceTurnToNextPlayer(room);

      expect(room.pendingInsolvencyCreditorId).toBeUndefined();
      expect(room.pendingInsolvencyDebtorId).toBeUndefined();
      expect(room.currentPlayerIndex).toBe(1);
    });
  });

  // =========================================================================
  // Facet 4: [TC-FS.08 - TC-FS.10, TC-FS.16] Chuyển Nhượng Phá Sản, Senior Lien & AFK Recovery
  // =========================================================================
  describe('Facet 4: Chuyển Nhượng Phá Sản, Senior Lien & AFK Recovery', () => {
    it('[TC-FS.08/AssetTransfer][UC-IMP240] Người chơi p1 phá sản vì nợ tiền thuê của p2, toàn bộ BĐS không thế chấp của p1 được sang tên cho p2', () => {
      const { room, registry, stateMap, p1, p2 } = createTestEnvironment('ROOM_08');
      room.phase = TurnPhase.InsolvencyPhase;
      p1.balance = -500;
      room.pendingInsolvencyCreditorId = p2.id;
      room.pendingInsolvencyDebtorId = p1.id;

      registry.set(1, p1.id);
      registry.set(3, p1.id);

      declareBankruptcy(room, p1.id, registry, stateMap);

      expect(registry.get(1)).toBe(p2.id);
      expect(registry.get(3)).toBe(p2.id);
      expect(room.pendingInsolvencyCreditorId).toBeUndefined();
      expect(room.pendingInsolvencyDebtorId).toBeUndefined();
    });

    it('[TC-FS.09/AssetTransfer][UC-IMP240] Tài sản đảm bảo trái phiếu của p1 KHÔNG sang tên cho p2 mà chuyển vào fireSaleQueue', () => {
      const { room, registry, stateMap, p1, p2 } = createTestEnvironment('ROOM_09');
      room.phase = TurnPhase.InsolvencyPhase;
      p1.balance = -500;
      room.pendingInsolvencyCreditorId = p2.id;
      room.pendingInsolvencyDebtorId = p1.id;

      registry.set(1, p1.id);
      registry.set(3, p1.id);
      p1.bondContract = {
        trancheId: BondTrancheId.WORKING_CAPITAL,
        principal: 1000,
        repayAmount: 1080,
        roundsLeft: 2,
        collateralCells: [3],
        isActive: true,
      };

      declareBankruptcy(room, p1.id, registry, stateMap);

      expect(registry.get(1)).toBe(p2.id);
      expect(registry.get(3)).toBeUndefined();
      expect(room.fireSaleQueue).toContain(3);
      expect(room.fireSaleDebtorId).toBe(p1.id);
    });

    it('[TC-FS.10/AFKRecovery][UC-IMP240] Khi người chơi AFK trong InsolvencyPhase, executeInsolvencyAfkRecovery dispatch bankruptcy kèm pendingInsolvencyCreditorId nếu debtor trùng khớp', () => {
      const rooms = new RoomManager(1234);
      const room = rooms.createRoom('p1');
      room.phase = TurnPhase.InsolvencyPhase;
      const p1 = room.players[0]!;
      p1.balance = -500;
      room.pendingInsolvencyCreditorId = 'p2';
      room.pendingInsolvencyDebtorId = 'p1';

      const intentSpy = vi.spyOn(rooms, 'handlePlayerIntent');
      executeInsolvencyAfkRecovery(rooms, room.roomCode, 'p1');

      expect(intentSpy).toHaveBeenCalledWith(room.roomCode, 'p1', {
        type: 'INTENT_BANKRUPTCY',
        creditorId: 'p2',
      });
    });

    it('[TC-FS.16/TerminalEntity][UC-IMP240] Khi chủ nợ p2 đã phá sản (p2.bankrupt === true), BĐS không được sang tên cho p2 mà rơi vào thanh lý an toàn', () => {
      const { room, registry, stateMap, p1, p2 } = createTestEnvironment('ROOM_16');
      room.phase = TurnPhase.InsolvencyPhase;
      p1.balance = -500;
      p2.balance = 0;
      p2.bankrupt = true;

      registry.set(1, p1.id);
      stateMap.set(1, { level: 0 });

      declareBankruptcy(room, p1.id, registry, stateMap, p2.id);

      expect(registry.get(1)).not.toBe(p2.id);
      expect(registry.get(1)).toBeUndefined();
    });
  });

  // =========================================================================
  // Facet 5: [TC-FS.11 - TC-FS.15] Wire Protocol, UI Modal Host & Phục Hồi Dung Môi
  // =========================================================================
  describe('Facet 5: Wire Protocol, UI Modal Host & Phục Hồi Dung Môi', () => {
    it('[TC-FS.11/Wire][UC-IMP240] session_manager.ts serialize isFireSale: true và insolvencyPlayerId vào delta', () => {
      const { room, registry, stateMap } = createTestEnvironment('ROOM_11');
      room.phase = TurnPhase.AuctionPhase;
      const auctions = new Map<string, AuctionSession>();
      handleStartFireSaleAuction(room, 5, auctions, room.roomCode, 'p_debtor');

      const delta = buildDeltaFromRoom(room, registry, stateMap, 1, auctions);

      expect(delta.auction?.isFireSale).toBe(true);
      expect(delta.auction?.insolvencyPlayerId).toBe('p_debtor');
      expect(delta.auction?.isForeclosure).toBe(true);
    });

    it('[TC-FS.12/UI][UC-IMP240] modal_host.tsx chuyển tiếp đúng prop isFireSale và isBankrupt vào <AuctionModal />', () => {
      const basePayload = {
        cellIndex: 1,
        currentBid: 0,
        highestBidderId: null,
        timeRemaining: 15,
        insolvencyPlayerId: 'p_debtor',
      };
      const fireSalePayload: typeof basePayload & { isFireSale?: boolean } = {
        ...basePayload,
        isFireSale: true,
      };

      useGameStore.setState({
        activeModal: 'auction',
        modalPayload: fireSalePayload,
        playersInfo: {
          p1: { id: 'p1', name: 'Đại gia 1', balance: 5000, tokenColor: '#f59e0b', ownedProperties: [], bankrupt: false },
          p_debtor: { id: 'p_debtor', name: 'Đại gia vỡ nợ', balance: -500, tokenColor: '#ef4444', ownedProperties: [], bankrupt: true },
        },
      });

      const htmlSolvent = renderToStaticMarkup(React.createElement(ModalHost, { localPlayerId: 'p1' }));
      expect(htmlSolvent).toContain('Bắt Đáy (0)');

      const htmlBankrupt = renderToStaticMarkup(React.createElement(ModalHost, { localPlayerId: 'p_debtor' }));
      expect(htmlBankrupt).toContain('Bạn đã phá sản và đang theo dõi phiên đấu giá tài sản phát mãi.');
    });

    it('[TC-FS.13/SolvencyRecovery][UC-IMP240] Khi người chơi tự thế chấp cứu nguy thành công (balance >= 0), room.pendingInsolvencyCreditorId và room.pendingInsolvencyDebtorId được xóa bỏ', () => {
      const { room, registry, stateMap, p1 } = createTestEnvironment('ROOM_13');
      room.phase = TurnPhase.InsolvencyPhase;
      p1.balance = -100;
      room.pendingInsolvencyCreditorId = 'p2';
      room.pendingInsolvencyDebtorId = p1.id;

      registry.set(1, p1.id);
      stateMap.set(1, { level: 0 });
      const ctx: RoomContext = { room, reg: registry, sm: stateMap };

      const res = coordMortgage(ctx, p1.id, 1);

      expect(res.success).toBe(true);
      expect(p1.balance).toBeGreaterThanOrEqual(0);
      expect(room.pendingInsolvencyCreditorId).toBeUndefined();
      expect(room.pendingInsolvencyDebtorId).toBeUndefined();
    });

    it('[TC-FS.14/SolvencyRecovery][UC-IMP240] Khi người chơi tự hạ cấp nhà cứu nguy thành công (balance >= 0), room.pendingInsolvencyCreditorId và room.pendingInsolvencyDebtorId được xóa bỏ', () => {
      const { room, registry, stateMap, p1 } = createTestEnvironment('ROOM_14');
      room.phase = TurnPhase.InsolvencyPhase;
      p1.balance = -50;
      room.pendingInsolvencyCreditorId = 'p2';
      room.pendingInsolvencyDebtorId = p1.id;

      registry.set(1, p1.id);
      stateMap.set(1, { level: 1 });
      const ctx: RoomContext = { room, reg: registry, sm: stateMap };

      const res = coordDowngrade(ctx, p1, 1, room.roomCode);

      expect(res.success).toBe(true);
      expect(p1.balance).toBeGreaterThanOrEqual(0);
      expect(room.pendingInsolvencyCreditorId).toBeUndefined();
      expect(room.pendingInsolvencyDebtorId).toBeUndefined();
    });

    it('[TC-FS.15/CleanState][UC-IMP240] Phá sản do nợ Ngân Hàng (effectiveCreditorId === \'BANK\') đưa tài sản vào đấu giá thanh lý bình thường', () => {
      const { room, registry, stateMap, p1 } = createTestEnvironment('ROOM_15');
      room.phase = TurnPhase.InsolvencyPhase;
      p1.balance = -500;
      room.pendingInsolvencyCreditorId = 'BANK';
      room.pendingInsolvencyDebtorId = p1.id;

      registry.set(1, p1.id);
      stateMap.set(1, { level: 0 });
      const auctions = new Map<string, AuctionSession>();

      declareBankruptcy(room, p1.id, registry, stateMap, undefined, auctions, room.roomCode);

      expect(registry.get(1)).toBeUndefined();
      expect(auctions.get(room.roomCode)?.cellIndex).toBe(1);
      expect(room.phase).toBe(TurnPhase.AuctionPhase);
    });
  });
});
