// [TC-NET04-CLI.1/MSS] useGameWs lưu reconnectToken vào localStorage khi nhận SESSION_INIT
// [TC-NET04-CLI.2/MSS] useGameWs lấy đúng token khi socket mở lại nếu có token trong localStorage
// [TC-NET04-CLI.3/MSS] useGameWs xóa token trong localStorage khi nhận TOKEN_INVALID hoặc TOKEN_EXPIRED
// [TC-NET04-CLI.4/MSS] useGameWs kích hoạt đúng các callback onGrace, onBotTakeover, onReconnected
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
import type { WsClientMessage } from '../../src/server/network/network_types.js';

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
});
