// [TC-219.01/MSS..TC-219.16/MSS][UC-IMP219] Bot Action Pacing & Visual Feedback Hardening Contract Suite
// Universal 5-Facet Behavioral Matrix:
// Facet 1: Phân Định Rạch Ròi Sự Kiện Giao Dịch P2P ([TC-219.01] - [TC-219.04])
// Facet 2: Phản Hồi Thị Giác Sàn Chứng Khoán HOSE & Chống Lặp Badge ([TC-219.05] - [TC-219.07])
// Facet 3: Thông Báo Bot Bỏ Qua Đất ➔ Kích Hoạt Đấu Giá & Loại Trừ Phát Mãi ([TC-219.08] - [TC-219.10])
// Facet 4: Tối Ưu Nhịp Thở Quan Sát Nâng Cấp Công Trình ([TC-219.11] - [TC-219.13])
// Facet 5: Chống Tiền Thuê Ma, Khử Trùng Lặp HOSE & Kiểm Tra Hành Vi Runtime ([TC-219.14] - [TC-219.16])

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import * as activityPropertyTrackerModule from '../../src/client/network/activity_property_tracker.js';
import * as activityFinancialTrackerModule from '../../src/client/network/activity_financial_tracker.js';
import * as activityBadgeDispatcherModule from '../../src/client/network/activity_badge_dispatcher.js';
import * as activityTrackerModule from '../../src/client/network/activity_tracker.js';
import * as transactionNarrativeModule from '../../src/client/ui/transaction_narrative.js';
import * as turnOrchestratorModule from '../../src/server/network/turn_orchestrator.js';

import { RoomManager } from '../../src/server/room_manager.js';
import { SessionManager } from '../../src/server/session_manager.js';
import { IntentMutex } from '../../src/server/network/intent_mutex.js';
import { DeltaBroadcaster } from '../../src/server/network/delta_broadcaster.js';
import {
  FloatingTextType,
  type FloatingTextItem,
  type PlayerHudInfo,
} from '../../src/client/store/game_store.js';
import type { CellDelta } from '../../src/server/session_manager.js';
import type { ActivityLogEntry } from '../../src/client/store/activity_store.js';

// Safe namespace accessor aliases for newly introduced symbols
const detectCellTrade = activityPropertyTrackerModule.detectCellTrade;
const detectFinancialAndStatusActivities = activityFinancialTrackerModule.detectFinancialAndStatusActivities;
const detectAuctionActivities = activityTrackerModule.detectAuctionActivities;
const dispatchActivityFloatingBadges = activityBadgeDispatcherModule.dispatchActivityFloatingBadges;
const resolveTransactionNarrative = transactionNarrativeModule.resolveTransactionNarrative;
const TurnOrchestrator = turnOrchestratorModule.TurnOrchestrator;

// ============================================================================
// FIXTURES
// ============================================================================
const mockPlayerBuyer: PlayerHudInfo = {
  id: 'player-buyer',
  name: 'Tỷ Phú Hà Thành',
  balance: 10_000,
  tokenColor: '#3B82F6',
  ownedProperties: [],
  isBankrupt: false,
};

const mockPlayerSeller: PlayerHudInfo = {
  id: 'player-seller',
  name: 'Đại Gia Sài Gòn',
  balance: 8_000,
  tokenColor: '#EF4444',
  ownedProperties: [1],
  isBankrupt: false,
};

const mockBotPlayer: PlayerHudInfo = {
  id: 'bot-1',
  name: 'Bot 1',
  balance: 5_000,
  tokenColor: '#10B981',
  isBot: true,
  ownedProperties: [],
  isBankrupt: false,
};

const mockPlayersInfo: Record<string, PlayerHudInfo> = {
  'player-buyer': mockPlayerBuyer,
  'player-seller': mockPlayerSeller,
  'bot-1': mockBotPlayer,
};

describe('[TC-219.01/MSS..TC-219.16/MSS][UC-IMP219] Bot Action Pacing & Visual Feedback Hardening Contract Suite', () => {
  // ===========================================================================
  // FACET 1: Phân Định Rạch Ròi Sự Kiện Giao Dịch P2P ([TC-219.01] - [TC-219.04])
  // ===========================================================================
  describe('Facet 1: Phân Định Rạch Ròi Sự Kiện Giao Dịch P2P', () => {
    it('[TC-219.01/MSS][UC-IMP219] detectCellTrade: Khi có prevOwnerId và prevOwnerName, sinh entry có type: "trade", targetPlayerId, và message chứa tên bên bán', () => {
      const cell: CellDelta = { index: 1, ownerId: 'player-buyer' };
      const cellName = activityPropertyTrackerModule.getCellName(1);
      const entry = (detectCellTrade as any)(
        cell,
        'player-seller',
        'Tỷ Phú Hà Thành',
        '#3B82F6',
        undefined,
        'Đại Gia Sài Gòn',
      );

      expect(entry.type).toBe('trade');
      expect(entry.targetPlayerId).toBe('player-seller');
      expect(entry.targetPlayerName).toBe('Đại Gia Sài Gòn');
      expect(entry.message).toContain(`Tỷ Phú Hà Thành đã nhận chuyển nhượng ${cellName} từ Đại Gia Sài Gòn`);
    });

    it('[TC-219.02/MSS][UC-IMP219] detectCellTrade: Khi mua trực tiếp từ Ngân Hàng (!prevOwnerId), bảo toàn type: "buy", amount: -price', () => {
      const cell: CellDelta = { index: 1, ownerId: 'player-buyer' };
      const cellName = activityPropertyTrackerModule.getCellName(1);
      const entry = (detectCellTrade as any)(cell, undefined, 'Tỷ Phú Hà Thành', '#3B82F6');

      expect(entry.type).toBe('buy');
      expect(entry.amount).toBe(-600);
      expect(entry.targetPlayerId).toBeUndefined();
      expect(entry.message).toContain(`Tỷ Phú Hà Thành đã mua ${cellName} với giá 600`);
    });

    it('[TC-219.03/MSS][UC-IMP219] detectCellTrade: Khi thắng đấu giá (winningBid !== undefined), bảo toàn type: "buy", amount: -winningBid (SSOT TC-54 & TC-205)', () => {
      const cell: CellDelta = { index: 1, ownerId: 'player-buyer' };
      const cellName = activityPropertyTrackerModule.getCellName(1);
      const entry = (detectCellTrade as any)(
        cell,
        'player-seller',
        'Tỷ Phú Hà Thành',
        '#3B82F6',
        850,
        'Đại Gia Sài Gòn',
      );

      expect(entry.type).toBe('buy');
      expect(entry.amount).toBe(-850);
      expect(entry.message).toContain(`Tỷ Phú Hà Thành đã thắng đấu giá ${cellName} với giá 850`);
    });

    it('[TC-219.04/MSS][UC-IMP219] handleTradeBadge: Sinh FloatingTextItem song phương cho cả bên mua (Reward: nhận BĐS) và bên bán (Penalty: chuyển BĐS)', () => {
      const addFloatingTextSpy = vi.fn();
      const mockState: any = {
        playersInfo: mockPlayersInfo,
        addFloatingText: addFloatingTextSpy,
      };
      const cellName = activityPropertyTrackerModule.getCellName(1);
      const act: ActivityLogEntry = {
        id: 'trade_123',
        timestamp: Date.now(),
        type: 'trade' as any,
        message: `Tỷ Phú Hà Thành đã nhận chuyển nhượng ${cellName} từ Đại Gia Sài Gòn`,
        playerId: 'player-buyer',
        playerName: 'Tỷ Phú Hà Thành',
        targetPlayerId: 'player-seller',
        targetPlayerName: 'Đại Gia Sài Gòn',
        cellIndex: 1,
      };

      const handleTradeBadge = (activityBadgeDispatcherModule as any).handleTradeBadge;
      handleTradeBadge?.(act, mockState);

      expect(addFloatingTextSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          playerId: 'player-buyer',
          type: FloatingTextType.Reward,
          actionType: 'trade',
          formula: 'Chuyển nhượng quyền sở hữu P2P',
        }),
      );
      expect(addFloatingTextSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          playerId: 'player-seller',
          type: FloatingTextType.Penalty,
          actionType: 'trade',
          formula: 'Chuyển nhượng quyền sở hữu P2P',
        }),
      );
    });
  });

  // ===========================================================================
  // FACET 2: Phản Hồi Thị Giác Sàn Chứng Khoán HOSE & Chống Lặp Badge ([TC-219.05] - [TC-219.07])
  // ===========================================================================
  describe('Facet 2: Phản Hồi Thị Giác Sàn Chứng Khoán HOSE & Chống Lặp Badge', () => {
    it('[TC-219.05/MSS][UC-IMP219] activity_financial_tracker: Khi delta.lastHoseResult xuất hiện, gán entry type: "hose" thay vì "system"', () => {
      const delta: any = {
        players: [{ id: 'player-buyer', balance: 10500, position: 0 }],
        lastHoseResult: {
          playerId: 'player-buyer',
          playerName: 'Tỷ Phú Hà Thành',
          stake: 1000,
          payout: 1500,
          profit: 500,
          multiplier: 1.5,
          roll: 4,
          timestamp: 1710000001,
        },
      };
      const prevState: any = { playersInfo: mockPlayersInfo };
      const nextState: any = {
        playersInfo: {
          ...mockPlayersInfo,
          'player-buyer': { ...mockPlayerBuyer, balance: 10500 },
        },
      };

      const entries = detectFinancialAndStatusActivities(delta, prevState, nextState, {
        boughtCellIndices: [],
        buyoutCellIndices: [],
        upgradedCells: [],
        mortgagedCells: [],
        unmortgagedCells: [],
      });
      const hoseEntry = entries.find((e) => e.id.startsWith('hose_') || (e.type as string) === 'hose');

      expect(hoseEntry).toBeDefined();
      expect(hoseEntry?.type as string).toBe('hose');
      expect(hoseEntry?.amount).toBe(500);
      expect(hoseEntry?.playerId).toBe('player-buyer');
    });

    it('[TC-219.06/MSS][UC-IMP219] handleHoseBadge: Khi khớp lệnh thắng, đọc từ delta.lastHoseResult, sinh FloatingTextItem loại Reward với text mang dấu "+"', () => {
      const addFloatingTextSpy = vi.fn();
      const mockState: any = { addFloatingText: addFloatingTextSpy, playersInfo: mockPlayersInfo };
      const act: ActivityLogEntry = {
        id: 'hose_1710000001_player-buyer',
        timestamp: 1710000001,
        type: 'hose' as any,
        message: '📈 [HOSE] Tỷ Phú Hà Thành đầu tư 1.000 ➔ Khớp lệnh Mặt 4 (+50%): Thu về 1.500 (Lãi +500)',
        playerId: 'player-buyer',
        playerName: 'Tỷ Phú Hà Thành',
        amount: 500,
      };
      const delta: any = {
        lastHoseResult: {
          playerId: 'player-buyer',
          playerName: 'Tỷ Phú Hà Thành',
          stake: 1000,
          payout: 1500,
          profit: 500,
          multiplier: 1.5,
          roll: 4,
          timestamp: 1710000001,
        },
      };

      const handleHoseBadge = (activityBadgeDispatcherModule as any).handleHoseBadge;
      handleHoseBadge?.(act, mockState, delta);

      expect(addFloatingTextSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: FloatingTextType.Reward,
          text: '+500',
          actionType: 'hose',
          formula: 'Khớp lệnh sàn HOSE: Mặt 4',
        }),
      );
    });

    it('[TC-219.07/MSS][UC-IMP219] handleHoseBadge: Khi khớp lệnh lỗ, sinh FloatingTextItem loại Penalty với text mang dấu "-"', () => {
      const addFloatingTextSpy = vi.fn();
      const mockState: any = { addFloatingText: addFloatingTextSpy, playersInfo: mockPlayersInfo };
      const act: ActivityLogEntry = {
        id: 'hose_1710000002_player-buyer',
        timestamp: 1710000002,
        type: 'hose' as any,
        message: '📉 [HOSE] Tỷ Phú Hà Thành đầu tư 1.000 ➔ Khớp lệnh Mặt 1 (-40%): Thu về 600 (Lỗ -400)',
        playerId: 'player-buyer',
        playerName: 'Tỷ Phú Hà Thành',
        amount: -400,
      };
      const delta: any = {
        lastHoseResult: {
          playerId: 'player-buyer',
          playerName: 'Tỷ Phú Hà Thành',
          stake: 1000,
          payout: 600,
          profit: -400,
          multiplier: 0.6,
          roll: 1,
          timestamp: 1710000002,
        },
      };

      const handleHoseBadge = (activityBadgeDispatcherModule as any).handleHoseBadge;
      handleHoseBadge?.(act, mockState, delta);

      expect(addFloatingTextSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: FloatingTextType.Penalty,
          text: '-400',
          actionType: 'hose',
          formula: 'Khớp lệnh sàn HOSE: Mặt 1',
        }),
      );
    });
  });

  // ===========================================================================
  // FACET 3: Thông Báo Bot Bỏ Qua Đất ➔ Kích Hoạt Đấu Giá & Loại Trừ Phát Mãi ([TC-219.08] - [TC-219.10])
  // ===========================================================================
  describe('Facet 3: Thông Báo Bot Bỏ Qua Đất ➔ Kích Hoạt Đấu Giá & Loại Trừ Phát Mãi', () => {
    it('[TC-219.08/MSS][UC-IMP219] detectAuctionActivities: Khi delta.auction xuất hiện với declinedPlayerId là Bot, sinh ActivityLogEntry loại auction với thông báo bỏ qua; loại trừ phát mãi nợ', () => {
      const deltaBotDecline: any = {
        auction: {
          cellIndex: 1,
          currentBid: 420,
          highestBidderId: undefined,
          declinedPlayerId: 'bot-1',
        },
      };
      const prevState: any = { auction: null, playersInfo: mockPlayersInfo };
      const nextState: any = {
        auction: deltaBotDecline.auction,
        playersInfo: mockPlayersInfo,
      };

      const cellName = activityPropertyTrackerModule.getCellName(1);
      // Case 1: Bot từ chối mua -> phát sinh thông báo bỏ qua đất để mở đấu giá
      const entries = detectAuctionActivities(deltaBotDecline, prevState, nextState);
      expect(entries).toHaveLength(1);
      expect(entries[0]?.type).toBe('auction');
      expect(entries[0]?.message).toContain(`Bot 1 đã bỏ qua ${cellName} ➔ Mở Đấu Giá`);

      // Case 2: Phát mãi nợ (isForeclosure: true) -> không phát sinh thông báo bỏ qua đất
      const deltaForeclosure: any = {
        auction: {
          cellIndex: 1,
          currentBid: 420,
          highestBidderId: undefined,
          declinedPlayerId: 'bot-1',
          isForeclosure: true,
        },
      };
      const entriesForeclosure = detectAuctionActivities(deltaForeclosure, prevState, nextState);
      expect(entriesForeclosure.some((e) => e.message?.includes('bỏ qua'))).toBe(false);
    });

    it('[TC-219.09/MSS][UC-IMP219] handleAuctionBadge: Nhận diện entry bỏ qua đất và sinh FloatingBadge mang actionType: "decline_auction"', () => {
      const addFloatingTextSpy = vi.fn();
      const mockState: any = { addFloatingText: addFloatingTextSpy, playersInfo: mockPlayersInfo };
      const cellName = activityPropertyTrackerModule.getCellName(1);
      const act: ActivityLogEntry = {
        id: 'decline_auction_1710000003_1',
        timestamp: 1710000003,
        type: 'auction',
        message: `Bot 1 đã bỏ qua ${cellName} ➔ Mở Đấu Giá`,
        playerId: 'bot-1',
        playerName: 'Bot 1',
        cellIndex: 1,
      };

      dispatchActivityFloatingBadges([act], mockState);

      expect(addFloatingTextSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          actionType: 'decline_auction',
          type: FloatingTextType.Penalty,
          formula: 'Từ chối mua quyền sử dụng đất',
          text: cellName,
        }),
      );
    });

    it('[TC-219.10/MSS][UC-IMP219] resolveTransactionNarrative: Sinh câu hoàn chỉnh tự nhiên không lặp từ ("Bot 1 bỏ qua Phố Huế để mở đấu giá")', () => {
      const cellName = activityPropertyTrackerModule.getCellName(1);
      const item: FloatingTextItem = {
        id: 'fl-decline-1',
        text: cellName,
        type: FloatingTextType.Penalty,
        playerId: 'bot-1',
        actionType: 'decline_auction' as any,
        title: `Bot 1 đã bỏ qua ${cellName} ➔ Mở Đấu Giá`,
        cellIndex: 1,
        timestamp: Date.now(),
      };

      const narrative = resolveTransactionNarrative(item, mockBotPlayer, mockPlayersInfo, 'bot-1');

      expect(narrative.category).toBe('ĐẤU GIÁ CÔNG KHAI');
      expect(narrative.icon).toBe('🔨');
      expect(narrative.verb).toBe('bỏ qua');
      expect(narrative.target).toBe('để mở đấu giá');
    });
  });

  // ===========================================================================
  // FACET 4: Tối Ưu Nhịp Thở Quan Sát Nâng Cấp Công Trình ([TC-219.11] - [TC-219.13])
  // ===========================================================================
  describe('Facet 4: Tối Ưu Nhịp Thở Quan Sát Nâng Cấp Công Trình', () => {
    let rooms: RoomManager;
    let sessions: SessionManager;
    let intentMutex: IntentMutex;
    let broadcaster: DeltaBroadcaster;

    beforeEach(() => {
      rooms = new RoomManager(1234);
      sessions = new SessionManager();
      intentMutex = new IntentMutex();
      broadcaster = new DeltaBroadcaster(rooms, sessions, () => {});
    });

    afterEach(() => {
      vi.clearAllTimers();
      vi.useRealTimers();
    });

    it('[TC-219.11/MSS][UC-IMP219] TurnOrchestrator: Khi phát hiện Bot vừa nâng cấp công trình (nextLevelSum > prevLevelSum), bước kế tiếp nhận delay BOT_UPGRADE_OBSERVATION_DELAY_MS (1500ms)', async () => {
      vi.useFakeTimers();
      const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');

      const orchestrator = new TurnOrchestrator({
        rooms,
        intentMutex,
        broadcaster,
        onGameOver: () => {},
        botTurnDelayMs: 200,
      });

      const room = rooms.createRoom('bot_1');
      rooms.addBot(room.roomCode, 'bot_2');
      rooms.startGame(room.roomCode);
      room.players[0]!.isBot = true;

      // Mock property level change during stepBotTurn to simulate an upgrade
      const propMap = new Map<number, any>([[1, { level: 0 }]]);
      vi.spyOn(rooms, 'getPropertyStates').mockImplementation(() => propMap);
      vi.spyOn(rooms, 'stepBotTurn').mockImplementation(() => {
        propMap.set(1, { level: 1 });
        return {} as any;
      });

      orchestrator.orchestrate(room.roomCode);
      setTimeoutSpy.mockClear();

      // Trigger the first step (stepBotTurn)
      await vi.advanceTimersByTimeAsync(250);

      // Verify that the subsequent step scheduled after upgrade receives 1500ms delay
      const scheduledDelays = setTimeoutSpy.mock.calls.map((c) => c[1]);
      expect(scheduledDelays).toContain(1500);

      orchestrator.clearRoom(room.roomCode);
    });

    it('[TC-219.12/MSS][UC-IMP219] botJustUpgraded được bảo toàn qua clearRoom() và chỉ tự động dọn dẹp sau khi tiêu thụ trong scheduleBotStep hoặc khi gọi destroyRoom', () => {
      const orchestrator = new TurnOrchestrator({
        rooms,
        intentMutex,
        broadcaster,
        onGameOver: () => {},
      });
      const roomCode = 'ROOM_OBSERVE_TEST';

      // Manually set flag on orchestrator to verify teardown lifecycle
      const map = (orchestrator as any).botJustUpgraded;
      if (map) {
        map.set(roomCode, true);
      }

      // clearRoom should NOT clear botJustUpgraded (premature teardown defense)
      orchestrator.clearRoom(roomCode);
      const flagAfterClear = (orchestrator as any).botJustUpgraded?.get(roomCode);
      expect(flagAfterClear).toBe(true);

      // destroyRoom MUST clear botJustUpgraded (memory leak defense)
      orchestrator.destroyRoom(roomCode);
      const flagAfterDestroy = (orchestrator as any).botJustUpgraded?.get(roomCode);
      expect(flagAfterDestroy).toBeUndefined();
    });

    it('[TC-219.13/MSS][UC-IMP219] BOT_UPGRADE_OBSERVATION_DELAY_MS được xuất khẩu tập trung (= 1500ms)', () => {
      const delayConst = (turnOrchestratorModule as any).BOT_UPGRADE_OBSERVATION_DELAY_MS;
      expect(delayConst).toBe(1500);
    });
  });

  // ===========================================================================
  // FACET 5: Chống Tiền Thuê Ma, Khử Trùng Lặp HOSE & Kiểm Tra Hành Vi Runtime ([TC-219.14] - [TC-219.16])
  // ===========================================================================
  describe('Facet 5: Chống Tiền Thuê Ma, Khử Trùng Lặp HOSE & Kiểm Tra Hành Vi Runtime', () => {
    it('[TC-219.14/MSS][UC-IMP219] Chống Ghost Rent: Trong giao dịch P2P chuyển nhượng có tiền mặt, detectFinancialAndStatusActivities không phát sinh log tiền thuê (rent) giữa bên mua và bên bán', () => {
      const prevState: any = {
        playersInfo: {
          'player-seller': { ...mockPlayerSeller, balance: 5000, ownedProperties: [1] },
          'player-buyer': { ...mockPlayerBuyer, balance: 5000, ownedProperties: [] },
        },
      };
      const nextState: any = {
        playersInfo: {
          'player-seller': { ...mockPlayerSeller, balance: 6000, ownedProperties: [] }, // +1000 cash
          'player-buyer': { ...mockPlayerBuyer, balance: 4000, ownedProperties: [1] },  // -1000 cash
        },
      };
      const delta: any = {
        players: [
          { id: 'player-buyer', balance: 4000, position: 0 },
          { id: 'player-seller', balance: 6000, position: 0 },
        ],
        cells: [{ index: 1, ownerId: 'player-buyer' }],
      };
      const context = {
        boughtCellIndices: [1],
        buyoutCellIndices: [],
        upgradedCells: [],
        mortgagedCells: [],
        unmortgagedCells: [],
      };

      const entries = detectFinancialAndStatusActivities(delta, prevState, nextState, context);
      const rentEntries = entries.filter((e) => e.type === 'rent');

      expect(rentEntries).toHaveLength(0);
    });

    it('[TC-219.15/MSS][UC-IMP219] Khử trùng lặp HOSE: Nhiều gói delta kế tiếp trong pha PropertyManagement chứa cùng một lastHoseResult chỉ phát sinh 1 log duy nhất; gọi resetHoseActivityTracker cho phép nhận diện lại', () => {
      const resetHoseTracker = (activityFinancialTrackerModule as any).resetHoseActivityTracker;
      resetHoseTracker?.();

      const deltaHose: any = {
        players: [{ id: 'player-buyer', balance: 10500, position: 0 }],
        lastHoseResult: {
          playerId: 'player-buyer',
          playerName: 'Tỷ Phú Hà Thành',
          stake: 1000,
          payout: 1500,
          profit: 500,
          multiplier: 1.5,
          roll: 4,
          timestamp: 1710000099,
        },
      };
      const prevState: any = { playersInfo: mockPlayersInfo };
      const nextState: any = {
        playersInfo: {
          ...mockPlayersInfo,
          'player-buyer': { ...mockPlayerBuyer, balance: 10500 },
        },
      };
      const context = {
        boughtCellIndices: [],
        buyoutCellIndices: [],
        upgradedCells: [],
        mortgagedCells: [],
        unmortgagedCells: [],
      };

      // Gói delta 1: Phát sinh đúng 1 entry
      const entries1 = detectFinancialAndStatusActivities(deltaHose, prevState, nextState, context);
      const hoseEntries1 = entries1.filter((e) => (e.type as string) === 'hose' || e.id.startsWith('hose_'));
      expect(hoseEntries1).toHaveLength(1);

      // Gói delta 2 kế tiếp với cùng lastHoseResult: Bị khử trùng lặp (0 entries)
      const entries2 = detectFinancialAndStatusActivities(deltaHose, prevState, nextState, context);
      const hoseEntries2 = entries2.filter((e) => (e.type as string) === 'hose' || e.id.startsWith('hose_'));
      expect(hoseEntries2).toHaveLength(0);

      // Reset tracker và nhận lại delta: Cho phép ghi nhận lại
      if (typeof resetHoseTracker === 'function') {
        resetHoseTracker();
      }
      const entries3 = detectFinancialAndStatusActivities(deltaHose, prevState, nextState, context);
      const hoseEntries3 = entries3.filter((e) => (e.type as string) === 'hose' || e.id.startsWith('hose_'));
      expect(hoseEntries3).toHaveLength(1);
    });

    it('[TC-219.16/MSS][UC-IMP219] dispatchActivityFloatingBadges: Tích hợp đầy đủ trade, hose, và decline_auction, điều phối chính xác các thẻ nổi vào state.addFloatingText', () => {
      const addFloatingTextSpy = vi.fn();
      const mockState: any = {
        addFloatingText: addFloatingTextSpy,
        playersInfo: mockPlayersInfo,
      };
      const cellName = activityPropertyTrackerModule.getCellName(1);
      const activities: ActivityLogEntry[] = [
        {
          id: 'trade_1',
          timestamp: Date.now(),
          type: 'trade' as any,
          message: `Tỷ Phú Hà Thành đã nhận chuyển nhượng ${cellName} từ Đại Gia Sài Gòn`,
          playerId: 'player-buyer',
          playerName: 'Tỷ Phú Hà Thành',
          targetPlayerId: 'player-seller',
          targetPlayerName: 'Đại Gia Sài Gòn',
          cellIndex: 1,
        },
        {
          id: 'hose_1',
          timestamp: Date.now(),
          type: 'hose' as any,
          message: '📈 [HOSE] Tỷ Phú Hà Thành đầu tư 1.000 ➔ Khớp lệnh Mặt 4: Thu về 1.500 (Lãi +500)',
          playerId: 'player-buyer',
          playerName: 'Tỷ Phú Hà Thành',
          amount: 500,
        },
        {
          id: 'decline_auction_1',
          timestamp: Date.now(),
          type: 'auction',
          message: `Bot 1 đã bỏ qua ${cellName} ➔ Mở Đấu Giá`,
          playerId: 'bot-1',
          playerName: 'Bot 1',
          cellIndex: 1,
        },
      ];
      const delta: any = {
        lastHoseResult: {
          playerId: 'player-buyer',
          playerName: 'Tỷ Phú Hà Thành',
          stake: 1000,
          payout: 1500,
          profit: 500,
          multiplier: 1.5,
          roll: 4,
          timestamp: Date.now(),
        },
      };

      dispatchActivityFloatingBadges(activities, mockState, delta);

      const dispatchedActionTypes = addFloatingTextSpy.mock.calls.map((call) => call[0]?.actionType);
      expect(dispatchedActionTypes).toContain('trade');
      expect(dispatchedActionTypes).toContain('hose');
      expect(dispatchedActionTypes).toContain('decline_auction');
    });
  });
});
