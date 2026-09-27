// [CONTRACT] IMP-205: Auction Mortgage Sanitization & Treasury Conservation
// Universal 5-Facet Behavioral Contract Test Suite
// Traceability: IMP-205 · UC-GAME-028
// Strict QA Protocol: No production source files modified

import { describe, it, expect } from 'vitest';
import { RoomManager } from '../../src/server/room_manager.js';
import { TurnPhase, type Room } from '../../src/domain/room.js';
import { PROPERTY_DEEDS, type PropertyRegistry, type PropertyStateMap } from '../../src/domain/property_manager.js';
import { handleAuctionClose, type AuctionSession } from '../../src/server/auction_manager.js';
import { detectPropertyAndLevelActivities, detectCellMortgage } from '../../src/client/network/activity_property_tracker.js';
import type { DeltaPayload, CellDelta } from '../../src/server/session_manager.js';
import type { GameState } from '../../src/client/store/game_store.js';
import { INITIAL_GAME_STATE } from '../../src/client/store/game_store_types.js';

function setup(rng = () => 0) {
  const mgr = new RoomManager(rng);
  const room = mgr.createRoom('player_alpha');
  mgr.joinRoom(room.roomCode, 'player_beta');
  mgr.startGame(room.roomCode);
  const reg = mgr.getRegistry(room.roomCode)!;
  const sm = mgr.getPropertyStates(room.roomCode)!;
  return { mgr, room, reg, sm };
}

function createTestState(overrides?: Partial<GameState>): GameState {
  return {
    ...INITIAL_GAME_STATE,
    ...overrides,
    playersInfo: {
      ...INITIAL_GAME_STATE.playersInfo,
      ...(overrides?.playersInfo ?? {}),
    },
  } as GameState;
}

describe('[IMP-205] Auction Mortgage Sanitization & Treasury Conservation Contract', () => {
  // =========================================================================
  // FACET 1: VÒNG LẶP ĐẾM VÒNG UNBUILTROUNDS ([TC-IMP205.01] - [TC-IMP205.05])
  // =========================================================================
  describe('Facet 1: Vòng lặp đếm vòng unbuiltRounds', () => {
    it('[TC-IMP205.01/MSS][UC-GAME-028] Thu hồi ô đất khi unbuiltRounds > 2 xóa bỏ hoàn toàn unbuiltRounds (delete state.unbuiltRounds)', () => {
      const { mgr, room, reg, sm } = setup();
      const alpha = room.players[0]!;
      reg.set(1, alpha.id);
      sm.set(1, { level: 0, unbuiltRounds: 2 });
      room.phase = TurnPhase.PropertyManagement;

      mgr.handleEndTurn(room.roomCode, alpha.id);

      expect(reg.get(1)).toBeUndefined();
      expect(sm.get(1)?.unbuiltRounds).toBeUndefined();
    });

    it('[TC-IMP205.02/MSS][UC-GAME-028] Ô đất sau khi bị thu hồi và mua lại không bị đếm tiếp unbuiltRounds ở các lượt tiếp theo', () => {
      const { mgr, room, reg, sm } = setup();
      const alpha = room.players[0]!;
      const beta = room.players[1]!;

      reg.set(1, alpha.id);
      sm.set(1, { level: 0, unbuiltRounds: 2 });
      room.phase = TurnPhase.PropertyManagement;
      mgr.handleEndTurn(room.roomCode, alpha.id);

      reg.set(1, beta.id);
      room.currentPlayerIndex = 1;
      room.phase = TurnPhase.PropertyManagement;
      mgr.handleEndTurn(room.roomCode, beta.id);

      expect(reg.get(1)).toBe(beta.id);
      expect(sm.get(1)?.unbuiltRounds).toBeUndefined();
    });

    it('[TC-IMP205.03/MSS][UC-GAME-028] Ô đất không có unbuiltRounds không bị kích hoạt thu hồi sau 3 vòng chơi', () => {
      const { mgr, room, reg, sm } = setup();
      const alpha = room.players[0]!;
      reg.set(1, alpha.id);
      sm.set(1, { level: 0 });

      room.currentPlayerIndex = 0;
      room.phase = TurnPhase.PropertyManagement;
      mgr.handleEndTurn(room.roomCode, alpha.id);

      room.currentPlayerIndex = 0;
      room.phase = TurnPhase.PropertyManagement;
      mgr.handleEndTurn(room.roomCode, alpha.id);

      room.currentPlayerIndex = 0;
      room.phase = TurnPhase.PropertyManagement;
      mgr.handleEndTurn(room.roomCode, alpha.id);

      expect(reg.get(1)).toBe(alpha.id);
      expect(mgr.getAuctionSession(room.roomCode)).toBeUndefined();
    });

    it('[TC-IMP205.04/MSS][UC-GAME-028] Phiên đấu giá thu hồi đất treo có đầy đủ endTime (+20s) và currentBid', () => {
      const { mgr, room, reg, sm } = setup();
      const alpha = room.players[0]!;
      reg.set(1, alpha.id);
      sm.set(1, { level: 0, unbuiltRounds: 2 });
      room.phase = TurnPhase.PropertyManagement;

      mgr.handleEndTurn(room.roomCode, alpha.id);

      const session = mgr.getAuctionSession(room.roomCode);
      expect(session?.endTime).toBeGreaterThan(Date.now() + 10_000);
      expect(session?.currentBid).toBe(session?.startingBid);
    });

    it('[TC-IMP205.05/MSS][UC-GAME-028] Người chơi có >= 2 ô đất treo cùng đến hạn chỉ mở 1 phiên đấu giá (lệnh break bảo vệ)', () => {
      const { mgr, room, reg, sm } = setup();
      const alpha = room.players[0]!;
      reg.set(1, alpha.id);
      sm.set(1, { level: 0, unbuiltRounds: 2 });
      reg.set(3, alpha.id);
      sm.set(3, { level: 0, unbuiltRounds: 2 });
      room.phase = TurnPhase.PropertyManagement;

      mgr.handleEndTurn(room.roomCode, alpha.id);

      const session = mgr.getAuctionSession(room.roomCode);
      expect(session?.cellIndex).toBe(1);
      expect(room.phase).toBe(TurnPhase.AuctionPhase);
    });
  });

  // =========================================================================
  // FACET 2: LÀM SẠCH THẾ CHẤP KHI TRÚNG ĐẤU GIÁ ([TC-IMP205.06] - [TC-IMP205.09])
  // =========================================================================
  describe('Facet 2: Làm sạch thế chấp khi trúng đấu giá', () => {
    it('[TC-IMP205.06/MSS][UC-GAME-028] Người trúng đấu giá ô đất từng bị thế chấp nhận BĐS với isMortgaged = false', () => {
      const { mgr, room, reg, sm } = setup();
      sm.set(1, { level: 0, isMortgaged: true });
      room.phase = TurnPhase.AuctionPhase;

      const auctions = mgr.auctionsMap;
      const session: AuctionSession = {
        cellIndex: 1,
        declinedPlayerId: '',
        highestBid: 500,
        startingBid: 300,
        currentBid: 500,
        highestBidder: 'player_beta',
        passedPlayers: new Set(['player_alpha']),
      };
      auctions.set(room.roomCode, session);

      handleAuctionClose(room, session, reg, auctions, room.roomCode, sm);

      expect(reg.get(1)).toBe('player_beta');
      expect(sm.get(1)?.isMortgaged).toBe(false);
    });

    it('[TC-IMP205.07/MSS][UC-GAME-028] Cựu chủ sở hữu có ô đất bị thu hồi bị xóa cellIndex khỏi mortgagedProperties', () => {
      const { mgr, room, reg, sm } = setup();
      const alpha = room.players[0]!;
      alpha.mortgagedProperties = [1, 3];
      reg.set(1, alpha.id);
      sm.set(1, { level: 0, isMortgaged: true, unbuiltRounds: 2 });
      room.phase = TurnPhase.PropertyManagement;

      mgr.handleEndTurn(room.roomCode, alpha.id);

      expect(alpha.mortgagedProperties).not.toContain(1);
      expect(alpha.mortgagedProperties).toContain(3);
    });

    it('[TC-IMP205.08/MSS][UC-GAME-028] Cựu chủ sở hữu có ô đất bị thu hồi bị xóa nợ trong mortgageLoans', () => {
      const { mgr, room, reg, sm } = setup();
      const alpha = room.players[0]!;
      alpha.mortgageLoans = { 1: 300, 3: 400 };
      reg.set(1, alpha.id);
      sm.set(1, { level: 0, isMortgaged: true, unbuiltRounds: 2 });
      room.phase = TurnPhase.PropertyManagement;

      mgr.handleEndTurn(room.roomCode, alpha.id);

      expect(alpha.mortgageLoans?.[1]).toBeUndefined();
      expect(alpha.mortgageLoans?.[3]).toBe(400);
    });

    it('[TC-IMP205.09/MSS][UC-GAME-028] Người trúng đấu giá không bị gán nợ vào mortgagedProperties hoặc mortgageLoans', () => {
      const { mgr, room, reg, sm } = setup();
      const beta = room.players[1]!;
      beta.mortgagedProperties = [];
      beta.mortgageLoans = {};
      room.phase = TurnPhase.AuctionPhase;

      const auctions = mgr.auctionsMap;
      const session: AuctionSession = {
        cellIndex: 1,
        declinedPlayerId: '',
        highestBid: 500,
        startingBid: 300,
        currentBid: 500,
        highestBidder: 'player_beta',
        passedPlayers: new Set(['player_alpha']),
      };
      auctions.set(room.roomCode, session);

      handleAuctionClose(room, session, reg, auctions, room.roomCode, sm);

      expect(beta.mortgagedProperties).not.toContain(1);
      expect(beta.mortgageLoans?.[1]).toBeUndefined();
    });
  });

  // =========================================================================
  // FACET 3: BẢO TOÀN QUỸ KHO BẠC (TREASURY CONSERVATION) ([TC-IMP205.10] - [TC-IMP205.14])
  // =========================================================================
  describe('Facet 3: Bảo toàn quỹ Kho Bạc (Treasury Conservation)', () => {
    it('[TC-IMP205.10/MSS][UC-GAME-028] Đấu giá đất từ chối mua nộp 100% tiền thắng đấu giá vào room.treasury', () => {
      const { mgr, room, reg, sm } = setup();
      room.treasury = 500;
      room.phase = TurnPhase.AuctionPhase;
      const initialBetaBalance = room.players[1]!.balance;

      const auctions = mgr.auctionsMap;
      const session: AuctionSession = {
        cellIndex: 1,
        declinedPlayerId: 'player_alpha',
        highestBid: 400,
        startingBid: 300,
        currentBid: 400,
        highestBidder: 'player_beta',
        passedPlayers: new Set(['player_alpha']),
      };
      auctions.set(room.roomCode, session);

      handleAuctionClose(room, session, reg, auctions, room.roomCode, sm);

      expect(room.treasury).toBe(900);
      expect(room.players[1]!.balance).toBe(initialBetaBalance - 400);
    });

    it('[TC-IMP205.11/MSS][UC-GAME-028] Đấu giá đất thu hồi dự án treo nộp 100% tiền thắng đấu giá vào room.treasury', () => {
      const { mgr, room, reg, sm } = setup();
      room.treasury = 1000;
      room.phase = TurnPhase.AuctionPhase;

      const auctions = mgr.auctionsMap;
      const session: AuctionSession = {
        cellIndex: 1,
        declinedPlayerId: '',
        highestBid: 650,
        startingBid: 300,
        currentBid: 650,
        highestBidder: 'player_beta',
        passedPlayers: new Set(['player_alpha']),
      };
      auctions.set(room.roomCode, session);

      handleAuctionClose(room, session, reg, auctions, room.roomCode, sm);

      expect(room.treasury).toBe(1650);
      expect(reg.get(1)).toBe('player_beta');
    });

    it('[TC-IMP205.12/MSS][UC-GAME-028] Đấu giá cưỡng chế người chơi phá sản (bankrupt = true) nộp tiền vào room.treasury', () => {
      const { mgr, room, reg, sm } = setup();
      room.treasury = 200;
      room.players[0]!.bankrupt = true;
      room.phase = TurnPhase.AuctionPhase;

      const auctions = mgr.auctionsMap;
      const session: AuctionSession = {
        cellIndex: 1,
        declinedPlayerId: '',
        highestBid: 800,
        startingBid: 300,
        currentBid: 800,
        highestBidder: 'player_beta',
        passedPlayers: new Set(),
        insolvencyPlayerId: 'player_alpha',
      };
      auctions.set(room.roomCode, session);

      handleAuctionClose(room, session, reg, auctions, room.roomCode, sm);

      expect(room.treasury).toBe(1000);
      expect(reg.get(1)).toBe('player_beta');
    });

    it('[TC-IMP205.13/MSS][UC-GAME-028] Đấu giá trả nợ (bankrupt = false): Kho Bạc thu nợ gốc thế chấp trước, con nợ chỉ nhận thặng dư', () => {
      const { mgr, room, reg, sm } = setup();
      const alpha = room.players[0]!;
      alpha.bankrupt = false;
      alpha.balance = -200;
      alpha.mortgageLoans = { 1: 300 };
      room.treasury = 500;
      room.phase = TurnPhase.AuctionPhase;

      const auctions = mgr.auctionsMap;
      const session: AuctionSession = {
        cellIndex: 1,
        declinedPlayerId: '',
        highestBid: 700,
        startingBid: 300,
        currentBid: 700,
        highestBidder: 'player_beta',
        passedPlayers: new Set(),
        insolvencyPlayerId: 'player_alpha',
      };
      auctions.set(room.roomCode, session);

      handleAuctionClose(room, session, reg, auctions, room.roomCode, sm);

      expect(room.treasury).toBe(800);
      expect(alpha.balance).toBe(200);
      expect(alpha.mortgageLoans?.[1]).toBeUndefined();
    });

    it('[TC-IMP205.14/MSS][UC-GAME-028] Tổng lượng tiền toàn phòng trước và sau đấu giá đất công giữ nguyên không đổi (Actual Delta = 0)', () => {
      const { mgr, room, reg, sm } = setup();
      room.players[0]!.balance = 2000;
      room.players[1]!.balance = 3000;
      room.treasury = 1000;
      room.phase = TurnPhase.AuctionPhase;

      const auctions = mgr.auctionsMap;
      const session: AuctionSession = {
        cellIndex: 1,
        declinedPlayerId: 'player_alpha',
        highestBid: 1200,
        startingBid: 300,
        currentBid: 1200,
        highestBidder: 'player_beta',
        passedPlayers: new Set(['player_alpha']),
      };
      auctions.set(room.roomCode, session);

      handleAuctionClose(room, session, reg, auctions, room.roomCode, sm);

      const totalMoneyAfter = room.players[0]!.balance + room.players[1]!.balance + (room.treasury ?? 0);
      expect(totalMoneyAfter).toBe(6000);
    });
  });

  // =========================================================================
  // FACET 4: ĐỒNG BỘ TRẠNG THÁI CLIENT & ACTIVITY LOG ([TC-IMP205.15] - [TC-IMP205.17])
  // =========================================================================
  describe('Facet 4: Đồng bộ trạng thái Client & Activity Log', () => {
    it('[TC-IMP205.15/MSS][UC-GAME-028] Client nhận delta trúng đấu giá không sinh log thế chấp ma đã thế chấp vào ngân hàng (+600)', () => {
      const prevState = createTestState({
        playersInfo: {
          player_alpha: {
            id: 'player_alpha',
            name: 'Người chơi Alpha',
            balance: 10_000,
            tokenColor: '#ef4444',
            ownedProperties: [1],
            mortgagedProperties: [1],
            isBot: false,
          },
          player_beta: {
            id: 'player_beta',
            name: 'Người chơi Beta',
            balance: 10_000,
            tokenColor: '#3b82f6',
            ownedProperties: [],
            mortgagedProperties: [],
            isBot: false,
          },
        },
      });

      const nextState = createTestState({
        playersInfo: {
          player_alpha: {
            id: 'player_alpha',
            name: 'Người chơi Alpha',
            balance: 10_000,
            tokenColor: '#ef4444',
            ownedProperties: [],
            mortgagedProperties: [],
            isBot: false,
          },
          player_beta: {
            id: 'player_beta',
            name: 'Người chơi Beta',
            balance: 9_500,
            tokenColor: '#3b82f6',
            ownedProperties: [1],
            mortgagedProperties: [],
            isBot: false,
          },
        },
      });

      const delta: DeltaPayload = {
        tick: 1,
        cells: [{ index: 1, ownerId: 'player_beta', isMortgaged: false }],
      };

      const { entries } = detectPropertyAndLevelActivities(delta, prevState, nextState);
      expect(entries.some((e) => e.type === 'unmortgage')).toBe(false);
      expect(entries.some((e) => e.message.includes('chuộc lại'))).toBe(false);
    });

    it('[TC-IMP205.16/MSS][UC-GAME-028] Ô đất chuyển về vô chủ không sinh log chuộc lại đất ma cho chủ cũ', () => {
      const prevState = createTestState({
        playersInfo: {
          player_alpha: {
            id: 'player_alpha',
            name: 'Người chơi Alpha',
            balance: 10_000,
            tokenColor: '#ef4444',
            ownedProperties: [1],
            mortgagedProperties: [1],
            isBot: false,
          },
        },
      });

      const nextState = createTestState({
        playersInfo: {
          player_alpha: {
            id: 'player_alpha',
            name: 'Người chơi Alpha',
            balance: 10_000,
            tokenColor: '#ef4444',
            ownedProperties: [],
            mortgagedProperties: [],
            isBot: false,
          },
        },
      });

      const cell: CellDelta = { index: 1, ownerId: '', isMortgaged: false };
      const res = detectCellMortgage(cell, true, nextState, prevState);

      expect(res).toBeNull();
    });

    it('[TC-IMP205.17/MSS][UC-GAME-028] Người chơi thắng đấu giá BĐS từng thế chấp chỉ có log đấu giá, không có log chuộc đất', () => {
      const prevState = createTestState({
        playersInfo: {
          player_alpha: {
            id: 'player_alpha',
            name: 'Người chơi Alpha',
            balance: 10_000,
            tokenColor: '#ef4444',
            ownedProperties: [1],
            mortgagedProperties: [1],
            isBot: false,
          },
          player_beta: {
            id: 'player_beta',
            name: 'Người chơi Beta',
            balance: 10_000,
            tokenColor: '#3b82f6',
            ownedProperties: [],
            mortgagedProperties: [],
            isBot: false,
          },
        },
        auction: {
          cellIndex: 1,
          highestBid: 500,
          highestBidder: 'player_beta',
          currentBid: 500,
          highestBidderId: 'player_beta',
        },
      });

      const nextState = createTestState({
        playersInfo: {
          player_alpha: {
            id: 'player_alpha',
            name: 'Người chơi Alpha',
            balance: 10_000,
            tokenColor: '#ef4444',
            ownedProperties: [],
            mortgagedProperties: [],
            isBot: false,
          },
          player_beta: {
            id: 'player_beta',
            name: 'Người chơi Beta',
            balance: 9_500,
            tokenColor: '#3b82f6',
            ownedProperties: [1],
            mortgagedProperties: [],
            isBot: false,
          },
        },
      });

      const delta: DeltaPayload = {
        tick: 2,
        cells: [{ index: 1, ownerId: 'player_beta', isMortgaged: false }],
      };

      const { entries } = detectPropertyAndLevelActivities(delta, prevState, nextState);
      expect(entries.filter((e) => e.type === 'buy')).toHaveLength(1);
      expect(entries.some((e) => e.type === 'unmortgage')).toBe(false);
    });
  });

  // =========================================================================
  // FACET 5: PHÒNG THỦ BIÊN & CÔ LẬP PHÒNG CHƠI ([TC-IMP205.18] - [TC-IMP205.19])
  // =========================================================================
  describe('Facet 5: Phòng thủ biên & Cô lập phòng chơi', () => {
    it('[TC-IMP205.18/MSS][UC-GAME-028] Đấu giá kết thúc tại Phòng 1 không làm ảnh hưởng trạng thái thế chấp của cùng ô tại Phòng 2', () => {
      const mgr = new RoomManager(1234);
      const room1 = mgr.createRoom('p1_room1');
      mgr.joinRoom(room1.roomCode, 'p2_room1');
      mgr.startGame(room1.roomCode);

      const room2 = mgr.createRoom('p1_room2');
      mgr.joinRoom(room2.roomCode, 'p2_room2');
      mgr.startGame(room2.roomCode);

      const sm1 = mgr.getPropertyStates(room1.roomCode)!;
      const sm2 = mgr.getPropertyStates(room2.roomCode)!;
      const reg1 = mgr.getRegistry(room1.roomCode)!;
      const reg2 = mgr.getRegistry(room2.roomCode)!;

      reg1.set(1, 'p1_room1');
      sm1.set(1, { level: 0, isMortgaged: true });

      reg2.set(1, 'p1_room2');
      sm2.set(1, { level: 0, isMortgaged: true });

      room1.phase = TurnPhase.AuctionPhase;
      const auctions = mgr.auctionsMap;
      auctions.set(room1.roomCode, {
        cellIndex: 1,
        declinedPlayerId: 'p1_room1',
        highestBid: 500,
        startingBid: 300,
        currentBid: 500,
        highestBidder: 'p2_room1',
        passedPlayers: new Set(['p1_room1']),
      });

      mgr.handleAuctionClose(room1.roomCode);

      expect(sm1.get(1)?.isMortgaged).toBe(false);
      expect(sm2.get(1)?.isMortgaged).toBe(true);
    });

    it('[TC-IMP205.19/MSS][UC-GAME-028] [Adversarial Inversion] Nếu unbuiltRounds bị gán = 0 thay vì xóa, test chứng minh lỗi đếm lặp xuất hiện', () => {
      const { mgr, room, reg, sm } = setup();
      const alpha = room.players[0]!;
      reg.set(1, alpha.id);
      sm.set(1, { level: 0 });

      room.phase = TurnPhase.PropertyManagement;
      mgr.handleEndTurn(room.roomCode, alpha.id);

      expect(sm.get(1)?.unbuiltRounds).toBeUndefined();
      expect(sm.get(1)?.unbuiltRounds).not.toBe(1);
    });
  });
});
