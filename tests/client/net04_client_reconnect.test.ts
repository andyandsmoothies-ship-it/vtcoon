// [TC-NET04-CLI.1/MSS] useGameWs lưu reconnectToken vào localStorage khi nhận SESSION_INIT
// [TC-NET04-CLI.2/MSS] useGameWs lấy đúng token khi socket mở lại nếu có token trong localStorage
// [TC-NET04-CLI.3/MSS] useGameWs xóa token trong localStorage khi nhận TOKEN_INVALID hoặc TOKEN_EXPIRED
// [TC-NET04-CLI.4/MSS] useGameWs kích hoạt đúng các callback onGrace, onBotTakeover, onReconnected
// [TC-NET04-CLI.6/MSS] Reconnect vào ván đấu đang diễn ra kích hoạt gameStarted = true
// [TC-NET04-CLI.7/MSS] Khôi phục toàn diện dữ liệu ván đấu khi Reconnect (players, positions, levels, properties)
// [TC-NET04-CLI.8/MSS] Nhận lỗi ROOM_STARTED tự kích hoạt onRoomStarted và resync
// [TC-NET04-CLI.9-inv/Adversarial] Delta tick = 0 không kích hoạt nhầm gameStarted
// [TC-NET04-CLI.10/MSS] Delta với roomStarted = false không kích hoạt nhầm gameStarted dù tick > 0
// [TC-NET04-CLI.11/MSS] Nhận ROOM_STARTED khi Reconnect kích hoạt onRoomStarted
// [TC-NET04-CLI.12/MSS] applyDeltaToStore nạp xong dữ liệu useGameStore trước khi đổi gameStarted (không race condition)
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  saveReconnectToken,
  getReconnectToken,
  clearReconnectToken,
  handleWsMessage,
  applyDeltaToStore,
  type WsMessageHandlerContext,
} from '../../src/client/network/use_game_ws.js';
import { useGameStore } from '../../src/client/store/game_store.js';
import { useLobbyStore } from '../../src/client/store/lobby_store.js';
import { BOARD_SIZE } from '../../src/domain/room.js';
import type { WsClientMessage } from '../../src/server/network/network_types.js';
import type { DeltaPayload, CellDelta } from '../../src/server/session_manager.js';

describe('[Client NET-04] useGameWs Reconnect & LocalStorage Integration', () => {
  let mockStorage: Record<string, string>;
  let sentData: string[];

  beforeEach(() => {
    mockStorage = {};
    sentData = [];

    vi.stubGlobal('localStorage', {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, val: string) => {
        mockStorage[key] = val;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
      clear: () => {
        mockStorage = {};
      },
    });
  });

  function createMockContext(overrides?: Partial<WsMessageHandlerContext>): WsMessageHandlerContext {
    return {
      roomCode: 'ROOM01',
      playerId: 'player-1',
      socket: {
        send: (data: string) => {
          sentData.push(data);
        },
      },
      ...overrides,
    };
  }

  it('[TC-NET04-CLI.1/MSS] Nhận SESSION_INIT → lưu reconnectToken vào localStorage với tiền tố vtcoon_token_', () => {
    const ctx = createMockContext({ roomCode: 'ROOM01' });

    handleWsMessage(
      {
        type: 'SESSION_INIT',
        playerId: 'player-1',
        reconnectToken: 'test-token-uuid-1',
        roomCode: 'ROOM01',
      },
      ctx,
    );

    expect(mockStorage['vtcoon_token_ROOM01']).toBe('test-token-uuid-1');
    expect(getReconnectToken('ROOM01')).toBe('test-token-uuid-1');
  });

  it('[TC-NET04-CLI.2/MSS] getReconnectToken lấy đúng token đã lưu và tạo message RECONNECT', () => {
    saveReconnectToken('ROOM02', 'saved-token-uuid-2');
    const token = getReconnectToken('ROOM02');
    expect(token).toBe('saved-token-uuid-2');

    const reconnectMsg: WsClientMessage = {
      type: 'RECONNECT',
      reconnectToken: token!,
      roomCode: 'ROOM02',
    };
    expect(reconnectMsg.type).toBe('RECONNECT');
    expect(reconnectMsg.reconnectToken).toBe('saved-token-uuid-2');
  });

  it('[TC-NET04-CLI.3/MSS] Nhận ERROR TOKEN_EXPIRED hoặc TOKEN_INVALID → xóa token khỏi localStorage', () => {
    saveReconnectToken('ROOM03', 'expired-token');
    expect(getReconnectToken('ROOM03')).toBe('expired-token');

    const ctx = createMockContext({ roomCode: 'ROOM03' });
    handleWsMessage(
      {
        type: 'ERROR',
        reasonCode: 'TOKEN_EXPIRED',
      },
      ctx,
    );

    expect(getReconnectToken('ROOM03')).toBeNull();
    expect(mockStorage['vtcoon_token_ROOM03']).toBeUndefined();

    // Thử lại với TOKEN_INVALID
    saveReconnectToken('ROOM03', 'invalid-token');
    handleWsMessage(
      {
        type: 'ERROR',
        reasonCode: 'TOKEN_INVALID',
      },
      ctx,
    );
    expect(getReconnectToken('ROOM03')).toBeNull();
  });

  it('[TC-NET04-CLI.4/MSS] Nhận PLAYER_GRACE, PLAYER_BOT_TAKEOVER, PLAYER_RECONNECTED → gọi đúng callback', () => {
    const onGrace = vi.fn();
    const onBotTakeover = vi.fn();
    const onReconnected = vi.fn();

    const ctx = createMockContext({
      roomCode: 'ROOM04',
      playerId: 'player-4',
      onGrace,
      onBotTakeover,
      onReconnected,
    });

    handleWsMessage(
      {
        type: 'PLAYER_GRACE',
        playerId: 'player-other',
        secondsLeft: 60,
      },
      ctx,
    );
    expect(onGrace).toHaveBeenCalledWith('player-other', 60);

    handleWsMessage(
      {
        type: 'PLAYER_BOT_TAKEOVER',
        playerId: 'player-other',
      },
      ctx,
    );
    expect(onBotTakeover).toHaveBeenCalledWith('player-other');

    handleWsMessage(
      {
        type: 'PLAYER_RECONNECTED',
        playerId: 'player-other',
      },
      ctx,
    );
    expect(onReconnected).toHaveBeenCalledWith('player-other');
  });

  it('[TC-NET04-CLI.5/MSS] applyDeltaToStore cập nhật isBot = true vào playersInfo khi Bot tiếp quản', () => {
    useGameStore.setState({
      playersInfo: {
        'player-takeover': {
          id: 'player-takeover',
          name: 'Player 1',
          balance: 1500,
          tokenColor: '#ff0000',
          ownedProperties: [],
          isBot: false,
        },
      },
    });

    applyDeltaToStore({
      tick: 42,
      cells: [],
      players: [
        {
          id: 'player-takeover',
          position: 0,
          balance: 1500,
          isBot: true,
        },
      ],
    });

    const info = useGameStore.getState().playersInfo['player-takeover'];
    expect(info?.isBot).toBe(true);
  });

  it('[TC-NET04-CLI.6/MSS] Reconnect vào ván đấu đang diễn ra: Nhận STATE_DELTA (tick > 0) -> tự động kích hoạt gameStarted = true và onRoomStarted', () => {
    useLobbyStore.setState({ gameStarted: false });
    const onRoomStarted = vi.fn();
    const ctx = createMockContext({
      roomCode: 'RECON_GAME',
      playerId: 'p1',
      onRoomStarted,
    });

    handleWsMessage(
      {
        type: 'STATE_DELTA',
        delta: {
          tick: 9,
          cells: [],
          players: [
            { id: 'p1', position: 12, balance: 14000 },
            { id: 'p2', position: 8, balance: 16000 },
          ],
        },
      },
      ctx,
    );

    expect(onRoomStarted).toHaveBeenCalled();
    expect(useLobbyStore.getState().gameStarted).toBe(true);
  });

  it('[TC-NET04-CLI.7/MSS] Khôi phục toàn diện dữ liệu ván đấu khi Reconnect: applyDeltaToStore nạp đầy đủ danh sách người chơi, vị trí, cấp công trình và quyền sở hữu tài sản', () => {
    useLobbyStore.setState({ gameStarted: false });
    useGameStore.setState({
      playersInfo: {},
      playerPositions: {},
      levelMap: {},
      currentTurnPlayerId: null,
    });

    const fullSyncCells: CellDelta[] = Array.from({ length: BOARD_SIZE }, (_, i) => ({
      index: i,
      level: 0 as const,
      ownerId: null,
      isMortgaged: false,
    }));

    // Thiết lập dữ liệu ô đất cụ thể
    fullSyncCells[1] = { index: 1, level: 2, ownerId: 'p1', isMortgaged: false };
    fullSyncCells[3] = { index: 3, level: 1, ownerId: 'p1', isMortgaged: true };
    fullSyncCells[6] = { index: 6, level: 3, ownerId: 'p2', isMortgaged: false };

    const fullDelta: DeltaPayload = {
      tick: 15,
      cells: fullSyncCells,
      players: [
        { id: 'p1', position: 15, balance: 13500, isBot: false },
        { id: 'p2', position: 22, balance: 16800, isBot: true },
      ],
      currentTurnPlayerId: 'p1',
      dice: [4, 2],
    };

    applyDeltaToStore(fullDelta, useGameStore);

    const gameState = useGameStore.getState();
    const lobbyState = useLobbyStore.getState();

    // 1. Tự động chuyển màn hình sang Sa Bàn 3D
    expect(lobbyState.gameStarted).toBe(true);

    // 2. Vị trí người chơi được khôi phục chính xác
    expect(gameState.playerPositions['p1']).toBe(15);
    expect(gameState.playerPositions['p2']).toBe(22);

    // 3. Thông tin người chơi & quyền sở hữu tài sản
    const p1 = gameState.playersInfo['p1'];
    const p2 = gameState.playersInfo['p2'];
    expect(p1).toBeDefined();
    expect(p2).toBeDefined();
    expect(p1?.balance).toBe(13500);
    expect(p2?.balance).toBe(16800);
    expect(p2?.isBot).toBe(true);

    // p1 sở hữu ô 1 và ô 3, ô 3 đang thế chấp
    expect(p1?.ownedProperties).toContain(1);
    expect(p1?.ownedProperties).toContain(3);
    expect(p1?.mortgagedProperties).toContain(3);
    expect(p1?.mortgagedProperties).not.toContain(1);

    // p2 sở hữu ô 6
    expect(p2?.ownedProperties).toContain(6);

    // 4. Cấp công trình
    expect(gameState.levelMap[1]).toBe(2);
    expect(gameState.levelMap[3]).toBe(1);
    expect(gameState.levelMap[6]).toBe(3);

    // 5. Lượt chơi & thời gian
    expect(gameState.currentTurnPlayerId).toBe('p1');
    expect(gameState.turnTimeRemaining).toBe(60);
  });

  it('[TC-NET04-CLI.8/MSS] Nhận lỗi ROOM_STARTED (do gửi START_GAME khi phòng đã chạy) -> tự động kích hoạt onRoomStarted và gửi INTENT_REQUEST_RESYNC', () => {
    const onRoomStarted = vi.fn();
    const ctx = createMockContext({
      roomCode: 'ROOM_BUSY',
      playerId: 'p1',
      onRoomStarted,
    });

    handleWsMessage(
      {
        type: 'ERROR',
        reasonCode: 'ROOM_STARTED',
      },
      ctx,
    );

    expect(onRoomStarted).toHaveBeenCalled();
    expect(sentData).toHaveLength(1);
    const sentMsg = JSON.parse(sentData[0]!) as WsClientMessage;
    expect(sentMsg.type).toBe('INTENT_REQUEST_RESYNC');
    if (sentMsg.type === 'INTENT_REQUEST_RESYNC') {
      expect(sentMsg.roomCode).toBe('ROOM_BUSY');
      expect(sentMsg.playerId).toBe('p1');
    }
  });

  it('[TC-NET04-CLI.9-inv/Adversarial] Delta với tick = 0 và không có dữ liệu ván đấu -> không kích hoạt nhầm gameStarted khi đang ở Sảnh Chờ', () => {
    useLobbyStore.setState({ gameStarted: false });
    const onRoomStarted = vi.fn();
    const ctx = createMockContext({
      roomCode: 'LOBBY_ROOM',
      playerId: 'p1',
      onRoomStarted,
    });

    handleWsMessage(
      {
        type: 'STATE_DELTA',
        delta: {
          tick: 0,
          cells: [],
          players: [
            { id: 'p1', position: 0, balance: 15000 },
          ],
        },
      },
      ctx,
    );

    expect(onRoomStarted).not.toHaveBeenCalled();
    expect(useLobbyStore.getState().gameStarted).toBe(false);
  });

  it('[TC-NET04-CLI.10/MSS] Delta với roomStarted = false không kích hoạt nhầm gameStarted dù tick > 0 (phòng ở Sảnh Chờ)', () => {
    useLobbyStore.setState({ gameStarted: false });
    const onRoomStarted = vi.fn();
    const ctx = createMockContext({
      roomCode: 'LOBBY_ROOM',
      playerId: 'p1',
      onRoomStarted,
    });

    handleWsMessage(
      {
        type: 'STATE_DELTA',
        delta: {
          tick: 1,
          roomStarted: false,
          cells: [],
          players: [
            { id: 'p1', position: 0, balance: 15000 },
          ],
        },
      },
      ctx,
    );

    expect(onRoomStarted).not.toHaveBeenCalled();
    expect(useLobbyStore.getState().gameStarted).toBe(false);
  });

  it('[TC-NET04-CLI.11/MSS] Nhận ROOM_STARTED khi Reconnect kích hoạt onRoomStarted', () => {
    const onRoomStarted = vi.fn();
    const ctx = createMockContext({
      roomCode: 'PLAYING_ROOM',
      playerId: 'p1',
      onRoomStarted,
    });

    handleWsMessage(
      {
        type: 'ROOM_STARTED',
        roomCode: 'PLAYING_ROOM',
      },
      ctx,
    );

    expect(onRoomStarted).toHaveBeenCalledTimes(1);
  });

  it('[TC-NET04-CLI.12/MSS] applyDeltaToStore nạp xong dữ liệu useGameStore trước khi đổi gameStarted (không race condition)', () => {
    useLobbyStore.setState({ gameStarted: false });
    useGameStore.setState({
      playersInfo: {},
      playerPositions: {},
    });

    let playersInfoWhenGameStartedChanged: Record<string, any> | null = null;
    const unsub = useLobbyStore.subscribe((state) => {
      if (state.gameStarted && !playersInfoWhenGameStartedChanged) {
        playersInfoWhenGameStartedChanged = { ...useGameStore.getState().playersInfo };
      }
    });

    try {
      applyDeltaToStore({
        tick: 5,
        roomStarted: true,
        cells: [],
        players: [
          { id: 'p1', position: 10, balance: 12000 },
          { id: 'p2', position: 4, balance: 15500 },
        ],
      });

      expect(useLobbyStore.getState().gameStarted).toBe(true);
      // Lúc gameStarted vừa chuyển sang true, playersInfo trong gameStore ĐÃ PHẢI có đủ dữ liệu
      expect(playersInfoWhenGameStartedChanged).not.toBeNull();
      expect(playersInfoWhenGameStartedChanged!['p1']).toBeDefined();
      expect(playersInfoWhenGameStartedChanged!['p1'].balance).toBe(12000);
      expect(playersInfoWhenGameStartedChanged!['p2']).toBeDefined();
      expect(playersInfoWhenGameStartedChanged!['p2'].balance).toBe(15500);
    } finally {
      unsub();
    }
  });
});
