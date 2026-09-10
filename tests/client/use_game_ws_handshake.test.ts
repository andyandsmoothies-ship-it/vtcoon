// [TC-NET-CLI-HS.1/MSS][TC-NET-CLI-HS.2/MSS][TC-NET-CLI-HS.3/MSS][TC-NET-CLI-HS.4/MSS][TC-NET-CLI-HS.5/MSS][TC-NET-CLI-HS.6/MSS][TC-NET-CLI-HS.7/MSS]
// Client WebSocket Handshake & Lifecycle Contract Tests
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  performWsHandshake,
  handleWsMessage,
  type WsMessageHandlerContext,
} from '../../src/client/network/use_game_ws.js';
import { saveReconnectToken, getReconnectToken } from '../../src/client/network/reconnect_token.js';
import type { ReasonCode, WsClientMessage } from '../../src/server/network/network_types.js';

describe('[Client NET-HS] performWsHandshake & Lifecycle Contract Tests', () => {
  let mockStorage: Record<string, string>;
  let sentMessages: string[];

  const mockSocket = {
    send: (data: string) => {
      sentMessages.push(data);
    },
  };

  beforeEach(() => {
    mockStorage = {};
    sentMessages = [];

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

    vi.stubGlobal('window', {
      location: {
        search: '',
        protocol: 'http:',
        host: 'localhost:3000',
        hostname: 'localhost',
      },
    });
  });

  it('[TC-NET-CLI-HS.1/MSS] Host kết nối lần đầu (không token) -> gửi CREATE_ROOM', () => {
    const msg = performWsHandshake(mockSocket, {
      roomCode: 'HOST01',
      playerId: 'p1-host',
      isHost: true,
    });

    expect(msg.type).toBe('CREATE_ROOM');
    if (msg.type === 'CREATE_ROOM') {
      expect(msg.roomCode).toBe('HOST01');
      expect(msg.playerId).toBe('p1-host');
    }

    expect(sentMessages).toHaveLength(1);
    const parsed = JSON.parse(sentMessages[0]!) as WsClientMessage;
    expect(parsed).toEqual(msg);
  });

  it('[TC-NET-CLI-HS.2/MSS] Guest kết nối qua vai trò khách (không token) -> gửi JOIN_ROOM', () => {
    const msg = performWsHandshake(mockSocket, {
      roomCode: 'GUEST1',
      playerId: 'p2-guest',
      isHost: false,
    });

    expect(msg.type).toBe('JOIN_ROOM');
    if (msg.type === 'JOIN_ROOM') {
      expect(msg.roomCode).toBe('GUEST1');
      expect(msg.playerId).toBe('p2-guest');
    }

    expect(sentMessages).toHaveLength(1);
    const parsed = JSON.parse(sentMessages[0]!) as WsClientMessage;
    expect(parsed).toEqual(msg);
  });

  it('[TC-NET-CLI-HS.3/MSS] Client có savedToken trong localStorage -> gửi RECONNECT', () => {
    saveReconnectToken('RECON1', 'jwt-token-alpha-123');
    expect(getReconnectToken('RECON1')).toBe('jwt-token-alpha-123');

    const msg = performWsHandshake(mockSocket, {
      roomCode: 'RECON1',
      playerId: 'p1-host',
      isHost: true,
    });

    expect(msg.type).toBe('RECONNECT');
    if (msg.type === 'RECONNECT') {
      expect(msg.reconnectToken).toBe('jwt-token-alpha-123');
      expect(msg.roomCode).toBe('RECON1');
    }

    expect(sentMessages).toHaveLength(1);
  });

  it('[TC-NET-CLI-HS.4/MSS] Client nhận SESSION_INIT -> lưu token vào localStorage và gọi onSessionInit', () => {
    let capturedToken = '';
    let capturedRoom = '';
    const ctx: WsMessageHandlerContext = {
      roomCode: 'INIT01',
      playerId: 'p1',
      socket: mockSocket,
      onSessionInit: (tok, rc) => {
        capturedToken = tok;
        capturedRoom = rc;
      },
    };

    handleWsMessage(
      {
        type: 'SESSION_INIT',
        playerId: 'p1',
        reconnectToken: 'issued-token-999',
        roomCode: 'INIT01',
      },
      ctx,
    );

    expect(getReconnectToken('INIT01')).toBe('issued-token-999');
    expect(capturedToken).toBe('issued-token-999');
    expect(capturedRoom).toBe('INIT01');
  });

  it('[TC-NET-CLI-HS.5/MSS] Client nhận ERROR -> không nuốt lỗi, gọi onError và setErrorReason', () => {
    let capturedReason: ReasonCode | null = null;
    let storeReason: ReasonCode | null = null;

    const ctx: WsMessageHandlerContext = {
      roomCode: 'ERR001',
      playerId: 'p1',
      socket: mockSocket,
      onError: (rc) => {
        capturedReason = rc;
      },
      setErrorReason: (rc) => {
        storeReason = rc;
      },
    };

    handleWsMessage(
      {
        type: 'ERROR',
        reasonCode: 'ROOM_NOT_FOUND',
      },
      ctx,
    );

    expect(capturedReason).toBe('ROOM_NOT_FOUND');
    expect(storeReason).toBe('ROOM_NOT_FOUND');
  });

  it('[TC-NET-CLI-HS.6/MSS] Client nhận ROOM_STARTED -> kích hoạt onRoomStarted', () => {
    let started = false;
    const ctx: WsMessageHandlerContext = {
      roomCode: 'START1',
      playerId: 'p1',
      socket: mockSocket,
      onRoomStarted: () => {
        started = true;
      },
    };

    handleWsMessage(
      {
        type: 'ROOM_STARTED',
        roomCode: 'START1',
      },
      ctx,
    );

    expect(started).toBe(true);
  });

  it('[TC-NET-CLI-HS.7/MSS] Guest kết nối qua tham số URL ?room=ROOM99 -> gửi JOIN_ROOM', () => {
    vi.stubGlobal('window', {
      location: {
        search: '?room=ROOM99',
        protocol: 'http:',
        host: 'localhost:3000',
        hostname: 'localhost',
      },
    });

    const msg = performWsHandshake(mockSocket, {
      roomCode: 'ROOM99',
      playerId: 'p2-guest',
    });

    expect(msg.type).toBe('JOIN_ROOM');
    if (msg.type === 'JOIN_ROOM') {
      expect(msg.roomCode).toBe('ROOM99');
      expect(msg.playerId).toBe('p2-guest');
    }
  });
});
