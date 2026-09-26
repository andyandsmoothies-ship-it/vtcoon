// [TC-201.01/MSS..TC-201.20/MSS][UC-IMP201] Client Session Lifecycle Purge & Cross-Match State Isolation Contract Suite
// Universal 5-Facet Behavioral Matrix:
// Facet 1: Egress Teardown Isolation (TC-201.01 - 08)
// Facet 2: HandleLeaveRoom & Store Order E2E Execution (TC-201.09 - 11)
// Facet 3: Lobby Ingress Pre-Purge (TC-201.12 - 15)
// Facet 4: Genesis Sync vs Reconnect Protection (TC-201.16 - 18)
// Facet 5: Cross-Match Event Processing & Anti-Stale Invariant (TC-201.19 - 20)

import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { useActivityStore } from '../../src/client/store/activity_store.js';
import { useTelemetryStore } from '../../src/client/telemetry/telemetry_store.js';
import { useGameStore } from '../../src/client/store/game_store.js';
import { useLobbyStore } from '../../src/client/store/lobby_store.js';
import { useVfxStore } from '../../src/client/store/vfx_store.js';
import { applyDeltaToStore } from '../../src/client/network/apply_delta.js';
import {
  trackDeltaActivities,
  detectEventCardActivities,
  resetEventCardActivityTracker,
  resetAuctionActivityTracker,
} from '../../src/client/network/activity_tracker.js';
import { useAppTurnControls } from '../../src/client/network/use_app_turn_controls.js';
import { saveReconnectToken, getReconnectToken } from '../../src/client/network/reconnect_token.js';
import { BOARD_SIZE } from '../../src/domain/room.js';
import { createDefaultSlots } from '../../src/client/store/lobby_types.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';
import { purgeClientMatchSession } from '../../src/client/network/client_session_purger.js';

function getLeaveRoomHandler(roomCode = 'VTTEST', onSendWs = vi.fn()) {
  let handlers: ReturnType<typeof useAppTurnControls> | null = null;
  function Harness() {
    handlers = useAppTurnControls(
      true,
      roomCode,
      'p1',
      'p1',
      true,
      vi.fn(),
      vi.fn(),
      vi.fn().mockReturnValue(true),
      vi.fn().mockReturnValue(true),
      onSendWs,
      { current: null },
    );
    return null;
  }
  renderToStaticMarkup(React.createElement(Harness));
  return handlers!.handleLeaveRoom;
}

describe('[TC-201.01/MSS..TC-201.20/MSS][UC-IMP201] Client Session Lifecycle Purge Contract Suite', () => {
  beforeEach(() => {
    useActivityStore.setState({
      activityLogs: [],
      unreadCount: 0,
      activeFilter: 'all',
      isActivityFeedOpen: false,
      lastDiceSeq: undefined,
      lastAuctionBid: undefined,
    });
    useTelemetryStore.getState().reset();
    useGameStore.getState().resetGameState();
    useGameStore.getState().closeModal();
    useVfxStore.getState().clearAllSlams();
    useVfxStore.getState().clearScreenShake();
    useVfxStore.setState({ activePawnReactions: {} });
    useLobbyStore.setState({
      roomCode: null,
      isJoining: false,
      myPlayerId: '',
      isHost: false,
      isReady: false,
      gameStarted: false,
      slots: createDefaultSlots(),
      errorReason: null,
    });
    resetEventCardActivityTracker();
    resetAuctionActivityTracker();

    const storageMap = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storageMap.get(key) ?? null,
      setItem: (key: string, val: string) => { storageMap.set(key, val); },
      removeItem: (key: string) => { storageMap.delete(key); },
      clear: () => { storageMap.clear(); },
    });
  });

  // =========================================================================
  // FACET 1: Egress Teardown Isolation (TC-201.01 - 08)
  // =========================================================================
  describe('Facet 1: Egress Teardown Isolation', () => {
    it('[TC-201.01/MSS][UC-IMP201] purgeClientMatchSession() xóa sạch mảng activityLogs ([]) và đưa unreadCount về 0', () => {
      useActivityStore.setState({
        activityLogs: [
          { id: 'act_1', timestamp: Date.now(), type: 'buy', message: 'Player 1 mua ô 1' },
          { id: 'act_2', timestamp: Date.now(), type: 'tax', message: 'Player 2 nộp thuế 100' },
        ],
        unreadCount: 5,
      });

      expect(purgeClientMatchSession).toBeDefined();
      purgeClientMatchSession();

      const state = useActivityStore.getState();
      expect(state.activityLogs).toEqual([]);
      expect(state.unreadCount).toBe(0);
    });

    it('[TC-201.02/MSS][UC-IMP201] purgeClientMatchSession() reset activeFilter về all và đóng feed (isActivityFeedOpen === false)', () => {
      useActivityStore.setState({
        activeFilter: 'property',
        isActivityFeedOpen: true,
      });

      expect(purgeClientMatchSession).toBeDefined();
      purgeClientMatchSession();

      const state = useActivityStore.getState();
      expect(state.activeFilter).toBe('all');
      expect(state.isActivityFeedOpen).toBe(false);
    });

    it('[TC-201.03/MSS][UC-IMP201] purgeClientMatchSession() xóa lastDiceSeq và lastAuctionBid trong activityStore', () => {
      useActivityStore.setState({
        lastDiceSeq: 7,
        lastAuctionBid: { cellIndex: 5, currentBid: 300, highestBidderId: 'p1' },
      });

      expect(purgeClientMatchSession).toBeDefined();
      purgeClientMatchSession();

      const state = useActivityStore.getState();
      expect(state.lastDiceSeq).toBeUndefined();
      expect(state.lastAuctionBid).toBeUndefined();
    });

    it('[TC-201.04/MSS][UC-IMP201] purgeClientMatchSession() reset telemetryStore (auditLogs, recordedIntents, violations về rỗng)', () => {
      useTelemetryStore.getState().addAuditLog({ tick: 5, source: 'SERVER', action: 'ROLL_DICE', payloadSummary: 'Test roll' });
      useTelemetryStore.getState().recordIntent('p1', { type: 'ROLL_DICE' });
      useTelemetryStore.getState().reportViolation({ tick: 5, type: 'NEGATIVE_BALANCE_OUTSIDE_INSOLVENCY', severity: 'CRITICAL', message: 'Test violation', details: {} });

      expect(purgeClientMatchSession).toBeDefined();
      purgeClientMatchSession();

      const telemetry = useTelemetryStore.getState();
      expect(telemetry.auditLogs).toEqual([]);
      expect(telemetry.recordedIntents).toEqual([]);
      expect(telemetry.violations).toEqual([]);
    });

    it('[TC-201.05/MSS][UC-IMP201] purgeClientMatchSession({ clearGameStore: true }) đưa useGameStore về INITIAL_GAME_STATE', () => {
      useGameStore.setState({
        activeModal: 'insolvency',
        modalPayload: { cellIndex: 10 } as any,
        playersInfo: { p1: { name: 'Alice', balance: 500 } as any },
        playerPositions: { p1: 12 },
        levelMap: { 12: 2 },
      });

      expect(purgeClientMatchSession).toBeDefined();
      purgeClientMatchSession({ clearGameStore: true });

      const game = useGameStore.getState();
      expect(game.activeModal).toBeNull();
      expect(game.playersInfo).toEqual({});
      expect(game.playerPositions).toEqual({});
      expect(game.levelMap).toEqual({});
    });

    it('[TC-201.06/MSS][UC-IMP201] purgeClientMatchSession({ clearGameStore: false }) giữ nguyên dữ liệu trong useGameStore (Genesis sync)', () => {
      useGameStore.setState({
        playersInfo: { p1: { name: 'Alice', balance: 1500 } as any },
        playerPositions: { p1: 0 },
      });

      expect(purgeClientMatchSession).toBeDefined();
      purgeClientMatchSession({ clearGameStore: false });

      const game = useGameStore.getState();
      expect(game.playersInfo['p1']).toBeDefined();
      expect(game.playerPositions['p1']).toBe(0);
    });

    it('[TC-201.07/MSS][UC-IMP201] purgeClientMatchSession() dọn sạch activeSlams, activeScreenShake và reactions trong useVfxStore', () => {
      useVfxStore.setState({
        activeSlams: {
          5: { id: 'slam_5', cellIndex: 5, level: 3, startTime: 1000, durationMs: 1500, impactTimeMs: 380 },
        },
        activeScreenShake: { startTime: 1000, durationMs: 350, intensity: 0.3 },
        activePawnReactions: { p1: { type: 'victory_spin', startTime: 1000, durationMs: 600 } },
      });

      expect(purgeClientMatchSession).toBeDefined();
      purgeClientMatchSession();

      const vfx = useVfxStore.getState();
      expect(vfx.activeSlams).toEqual({});
      expect(vfx.activeScreenShake).toBeNull();
      expect(vfx.activePawnReactions).toEqual({});
    });

    it('[TC-201.08/MSS][UC-IMP201] purgeClientMatchSession() gọi resetEventCardActivityTracker và resetAuctionActivityTracker', () => {
      const mockCard = {
        id: 'CC_CONCERT_SPONSOR',
        cardId: 'CC_CONCERT_SPONSOR',
        type: 'Chance',
        title: 'Tài Trợ Ca Nhạc',
        description: 'Tài trợ 200tr',
        drawnBy: 'p1',
      } as any;
      const delta = { lastEventCard: mockCard } as any;
      const dummyState = { playersInfo: { p1: { name: 'Player 1' } } } as any;

      const entries1 = detectEventCardActivities(delta, dummyState);
      expect(entries1.length).toBe(1);

      const entriesDuplicate = detectEventCardActivities(delta, dummyState);
      expect(entriesDuplicate.length).toBe(0);

      expect(purgeClientMatchSession).toBeDefined();
      purgeClientMatchSession();

      const entriesAfterPurge = detectEventCardActivities(delta, dummyState);
      expect(entriesAfterPurge.length).toBe(1);
    });
  });

  // =========================================================================
  // FACET 2: HandleLeaveRoom & Store Order E2E Execution (TC-201.09 - 11)
  // =========================================================================
  describe('Facet 2: HandleLeaveRoom & Store Order E2E Execution', () => {
    it('[TC-201.09/MSS][UC-IMP201] handleLeaveRoom kích hoạt resetLobby(), chuyển gameStarted: false trước khi purge gameStore', () => {
      useLobbyStore.setState({ gameStarted: true, roomCode: 'VTTEST' });
      useGameStore.setState({ playersInfo: { p1: { name: 'Player 1' } as any } });

      let gameStartedWhenGameStorePurged: boolean | null = null;
      const unsub = useGameStore.subscribe((state) => {
        if (Object.keys(state.playersInfo).length === 0 && gameStartedWhenGameStorePurged === null) {
          gameStartedWhenGameStorePurged = useLobbyStore.getState().gameStarted;
        }
      });

      const handleLeaveRoom = getLeaveRoomHandler('VTTEST');
      handleLeaveRoom();
      unsub();

      expect(gameStartedWhenGameStorePurged).toBe(false);
      expect(useLobbyStore.getState().gameStarted).toBe(false);
    });

    it('[TC-201.10/MSS][UC-IMP201] handleLeaveRoom dọn dẹp sạch activityLogs và đóng toàn bộ modal đang mở mà không gọi đúp purge', () => {
      useActivityStore.setState({
        activityLogs: [
          { id: 'act_leave', timestamp: Date.now(), type: 'system', message: 'Ván đang diễn ra' },
        ],
        unreadCount: 1,
      });
      useGameStore.setState({
        activeModal: 'insolvency',
        modalPayload: { reason: 'bankrupt' } as any,
      });

      const handleLeaveRoom = getLeaveRoomHandler('VTTEST');
      handleLeaveRoom();

      expect(useActivityStore.getState().activityLogs).toEqual([]);
      expect(useGameStore.getState().activeModal).toBeNull();
    });

    it('[TC-201.11/MSS][UC-IMP201] handleLeaveRoom xóa reconnect token của roomCode', () => {
      saveReconnectToken('VTLIVE', 'valid_tok_999');
      expect(getReconnectToken('VTLIVE')).toBe('valid_tok_999');

      const handleLeaveRoom = getLeaveRoomHandler('VTLIVE');
      handleLeaveRoom();

      expect(getReconnectToken('VTLIVE')).toBeNull();
    });
  });

  // =========================================================================
  // FACET 3: Lobby Ingress Pre-Purge (TC-201.12 - 15)
  // =========================================================================
  describe('Facet 3: Lobby Ingress Pre-Purge', () => {
    it('[TC-201.12/MSS][UC-IMP201] useLobbyStore.getState().resetLobby() gọi purgeClientMatchSession, cô lập hoàn toàn trạng thái giữa 2 ván', () => {
      useActivityStore.setState({
        activityLogs: [{ id: 'lobby_reset_test', timestamp: 1, type: 'buy', message: 'Mua ô 5' }],
        unreadCount: 3,
      });
      useTelemetryStore.getState().addAuditLog({ tick: 4, source: 'PLAYER', action: 'BUY', payloadSummary: 'buy' });

      useLobbyStore.getState().resetLobby();

      expect(useActivityStore.getState().activityLogs).toEqual([]);
      expect(useTelemetryStore.getState().auditLogs).toEqual([]);
    });

    it('[TC-201.13/MSS][UC-IMP201] createCustomRoom() chủ động purge activityLogs và telemetryStore trước khi khởi tạo phòng mới', () => {
      useActivityStore.setState({
        activityLogs: [{ id: 'match1_log', timestamp: 100, type: 'tax', message: 'Đóng thuế 100' }],
      });
      useTelemetryStore.getState().addAuditLog({ tick: 20, source: 'SERVER', action: 'TAX', payloadSummary: 'tax' });

      useLobbyStore.getState().createCustomRoom();

      expect(useActivityStore.getState().activityLogs).toEqual([]);
      expect(useTelemetryStore.getState().auditLogs).toEqual([]);
    });

    it('[TC-201.14/MSS][UC-IMP201] joinCustomRoom() chủ động purge activityLogs và telemetryStore trước khi tham gia phòng mới', () => {
      useActivityStore.setState({
        activityLogs: [{ id: 'prev_game_log', timestamp: 100, type: 'rent', message: 'Trả tiền thuê' }],
      });
      useTelemetryStore.getState().addAuditLog({ tick: 15, source: 'SERVER', action: 'RENT', payloadSummary: 'rent' });

      const res = useLobbyStore.getState().joinCustomRoom('VT1234');

      expect(res.success).toBe(true);
      expect(useActivityStore.getState().activityLogs).toEqual([]);
      expect(useTelemetryStore.getState().auditLogs).toEqual([]);
    });

    it('[TC-201.15/MSS][UC-IMP201] startGame() chủ động purge state cũ trước khi set gameStarted: true (chế độ Solo Bot / Offline)', () => {
      useLobbyStore.setState({
        roomCode: 'VTSOLO',
        isHost: true,
        slots: [
          { slotIndex: 0, playerId: 'p1', playerName: 'Player 1', isOccupied: true, isHost: true, isReady: true, isBot: false, tokenColor: '#ef4444' },
          { slotIndex: 1, playerId: 'p2', playerName: 'Bot 1', isOccupied: true, isHost: false, isReady: true, isBot: true, tokenColor: '#3b82f6' },
          { slotIndex: 2, playerId: '', playerName: '', isOccupied: false, isHost: false, isReady: false, isBot: false, tokenColor: '#10b981' },
          { slotIndex: 3, playerId: '', playerName: '', isOccupied: false, isHost: false, isReady: false, isBot: false, tokenColor: '#f59e0b' },
        ],
        gameStarted: false,
      });
      useActivityStore.setState({
        activityLogs: [{ id: 'solo_old_log', timestamp: 1, type: 'dice', message: 'Đổ 10' }],
      });

      const startRes = useLobbyStore.getState().startGame();

      expect(startRes.success).toBe(true);
      expect(useLobbyStore.getState().gameStarted).toBe(true);
      expect(useActivityStore.getState().activityLogs).toEqual([]);
    });
  });

  // =========================================================================
  // FACET 4: Genesis Sync vs Reconnect Protection (TC-201.16 - 18)
  // =========================================================================
  describe('Facet 4: Genesis Sync vs Reconnect Protection', () => {
    it('[TC-201.16/MSS][UC-IMP201] applyDelta với isFullSync và delta.tick <= 1 dọn sạch logs cũ còn sót từ trước khi ván cờ bắt đầu', () => {
      useActivityStore.setState({
        activityLogs: [
          { id: 'pre_game_residual', timestamp: 1, type: 'system', message: 'Residual from lobby' },
        ],
        unreadCount: 1,
      });

      const genesisDelta: DeltaPayload = {
        tick: 1,
        cells: Array(BOARD_SIZE).fill(null).map((_, i) => ({ index: i, ownerId: null, level: 0 })),
      } as any;

      applyDeltaToStore(genesisDelta, useGameStore);

      expect(useActivityStore.getState().activityLogs).toEqual([]);
      expect(useActivityStore.getState().unreadCount).toBe(0);
    });

    it('[TC-201.17/MSS][UC-IMP201] (Reconnect Guard) applyDelta với isFullSync và delta.tick > 1 BẢO TOÀN activityLogs hiện tại', () => {
      const inGameLogs = [
        { id: 'match_log_1', timestamp: 100, type: 'dice' as const, message: 'P1 đổ 5' },
        { id: 'match_log_2', timestamp: 200, type: 'buy' as const, message: 'P1 mua Nhà hát lớn' },
      ];
      useActivityStore.setState({
        activityLogs: inGameLogs,
        unreadCount: 2,
      });

      const reconnectDelta: DeltaPayload = {
        tick: 15,
        cells: Array(BOARD_SIZE).fill(null).map((_, i) => ({ index: i, ownerId: null, level: 0 })),
      } as any;

      applyDeltaToStore(reconnectDelta, useGameStore);

      expect(useActivityStore.getState().activityLogs).toEqual(inGameLogs);
      expect(useActivityStore.getState().unreadCount).toBe(2);
    });

    it('[TC-201.18/MSS][UC-IMP201] Khi kết thúc ván (roomStarted không đổi), syncTelemetryAndActivities vẫn trích xuất đầy đủ log kết thúc', () => {
      useActivityStore.setState({ activityLogs: [], unreadCount: 0 });

      const gameOverDelta: DeltaPayload = {
        tick: 50,
        players: [
          { id: 'p1', bankrupt: true, balance: -100 } as any,
        ],
      } as any;
      const prevState = {
        playersInfo: { p1: { name: 'Alice', bankrupt: false, balance: 100 } },
        playerPositions: { p1: 10 },
      } as any;
      const nextState = {
        playersInfo: { p1: { name: 'Alice', bankrupt: true, balance: -100 } },
        playerPositions: { p1: 10 },
      } as any;

      trackDeltaActivities(gameOverDelta, prevState, nextState);

      const logs = useActivityStore.getState().activityLogs;
      expect(logs.length).toBeGreaterThan(0);
      expect(logs.some((l) => l.type === 'bankrupt')).toBe(true);
    });
  });

  // =========================================================================
  // FACET 5: Cross-Match Event Processing & Anti-Stale Invariant (TC-201.19 - 20)
  // =========================================================================
  describe('Facet 5: Cross-Match Event Processing & Anti-Stale Invariant', () => {
    it('[TC-201.19/MSS][UC-IMP201] Ván 1 ghi nhận thẻ cơ hội X -> Thoát ván -> Ván 2 rút lại đúng thẻ X -> trackDeltaActivities không bị nuốt log', () => {
      const cardX = {
        id: 'CC_CONCERT_SPONSOR',
        cardId: 'CC_CONCERT_SPONSOR',
        type: 'Chance',
        title: 'Tài Trợ Ca Nhạc',
        description: 'Tài trợ 200tr',
        drawnBy: 'p1',
      } as any;

      const deltaMatch1: DeltaPayload = {
        lastEventCard: cardX,
        currentTurnPlayerId: 'p1',
      } as any;

      const state = {
        playersInfo: { p1: { name: 'Alice' } },
        currentTurnPlayerId: 'p1',
      } as any;

      // Match 1: draw card X
      trackDeltaActivities(deltaMatch1, state, state);
      expect(useActivityStore.getState().activityLogs.some((l) => l.message.includes('Tài Trợ Ca Nhạc'))).toBe(true);

      // Player leaves room / purges session
      expect(purgeClientMatchSession).toBeDefined();
      purgeClientMatchSession();

      // Match 2: draw card X again
      const deltaMatch2: DeltaPayload = {
        lastEventCard: cardX,
        currentTurnPlayerId: 'p1',
      } as any;

      trackDeltaActivities(deltaMatch2, state, state);
      const match2Logs = useActivityStore.getState().activityLogs;
      expect(match2Logs.length).toBe(1);
      expect(match2Logs[0]!.message).toContain('Tài Trợ Ca Nhạc');
    });

    it('[TC-201.20/MSS][UC-IMP201] Ván 1 ghi nhận xúc xắc seq=10 -> Thoát ván -> Ván 2 tung xúc xắc seq=1 -> trackDeltaActivities không bị lọc bỏ', () => {
      useActivityStore.setState({
        activityLogs: [],
        lastDiceSeq: 10,
      });

      expect(purgeClientMatchSession).toBeDefined();
      purgeClientMatchSession();

      expect(useActivityStore.getState().lastDiceSeq).toBeUndefined();

      // Match 2: roll dice with seq=1
      const diceDelta: DeltaPayload = {
        diceSeq: 1,
        dice: [3, 4],
        currentTurnPlayerId: 'p1',
      } as any;
      const dicePrevState = {
        playersInfo: { p1: { name: 'Alice' } },
        currentTurnPlayerId: 'p1',
      } as any;
      const diceNextState = {
        playersInfo: { p1: { name: 'Alice' } },
        currentTurnPlayerId: 'p1',
      } as any;

      trackDeltaActivities(diceDelta, dicePrevState, diceNextState);
      const diceLogs = useActivityStore.getState().activityLogs;
      expect(diceLogs.length).toBe(1);
      expect(diceLogs[0]!.type).toBe('dice');
    });
  });
});
