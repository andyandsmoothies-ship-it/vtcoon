import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  resolveWsUrl,
  computeReconnectBackoff,
  dispatchWsIntent,
  dispatchWsEmote,
  dispatchWsMessage,
  dispatchWsResync,
  type WebSocketLike,
} from '../../src/client/network/game_ws_dispatcher.js';
import type { PlayerIntent } from '../../src/server/intent_dispatcher.js';
import type { WsClientMessage } from '../../src/server/network/network_types.js';

interface MockSocket extends WebSocketLike {
  readonly sentMessages: string[];
}

function createMockSocket(readyState = 1): MockSocket {
  const sentMessages: string[] = [];
  return {
    readyState,
    sentMessages,
    send(data: string) {
      sentMessages.push(data);
    },
    close() {},
    onopen: null,
    onmessage: null,
    onerror: null,
    onclose: null,
  };
}

describe('game_ws_dispatcher', () => {
  describe('resolveWsUrl', () => {
    it('returns provided explicit URL verbatim', () => {
      const url = resolveWsUrl('wss://custom.domain.com/ws');
      expect(url).toBe('wss://custom.domain.com/ws');
    });

    it('returns default localhost url when running in node-like environment without window', () => {
      const originalWindow = globalThis.window;
      // @ts-expect-error simulate node env without window
      delete globalThis.window;
      const url = resolveWsUrl(undefined, 'ROOM123');
      expect(url).toBe('ws://localhost:3001');
      if (originalWindow !== undefined) {
        globalThis.window = originalWindow;
      }
    });

    it('resolves cloud wss url based on window location when in browser', () => {
      const originalWindow = globalThis.window;
      const mockLocation = {
        protocol: 'https:',
        host: 'game.app.vn',
        hostname: 'game.app.vn',
      };
      // @ts-expect-error mock window for browser url test
      globalThis.window = { location: mockLocation };
      const url = resolveWsUrl(undefined, 'ROOM88');
      expect(url).toBe('wss://game.app.vn/rooms/ROOM88');
      if (originalWindow !== undefined) {
        globalThis.window = originalWindow;
      } else {
        // @ts-expect-error clean up mock window
        delete globalThis.window;
      }
    });

    it('resolves local dev url when window location host is localhost:3000', () => {
      const originalWindow = globalThis.window;
      const mockLocation = {
        protocol: 'http:',
        host: 'localhost:3000',
        hostname: 'localhost',
      };
      // @ts-expect-error mock window for local dev test
      globalThis.window = { location: mockLocation };
      const url = resolveWsUrl(undefined, 'LOCALROOM');
      expect(url).toBe('ws://localhost:3001');
      if (originalWindow !== undefined) {
        globalThis.window = originalWindow;
      } else {
        // @ts-expect-error clean up mock window
        delete globalThis.window;
      }
    });
  });

  describe('computeReconnectBackoff', () => {
    it('calculates initial base delay for zero attempts', () => {
      const delay = computeReconnectBackoff(0, 1000, 5000);
      expect(delay).toBe(1000);
    });

    it('calculates exponential delay for first and second attempts', () => {
      const delay1 = computeReconnectBackoff(1, 1000, 5000);
      const delay2 = computeReconnectBackoff(2, 1000, 5000);
      expect(delay1).toBe(1500);
      expect(delay2).toBe(2250);
    });

    it('clamps delay to maximum bound', () => {
      const delay = computeReconnectBackoff(10, 1000, 5000);
      expect(delay).toBe(5000);
    });
  });

  describe('dispatchWsIntent', () => {
    it('returns false when socket is null', () => {
      const intent: PlayerIntent = { type: 'INTENT_ROLL' };
      const result = dispatchWsIntent(null, { roomCode: 'ROOM1', playerId: 'p1', intent });
      expect(result).toBe(false);
    });

    it('returns false when socket readyState is not OPEN (1)', () => {
      const socket = createMockSocket(0); // CONNECTING
      const intent: PlayerIntent = { type: 'INTENT_ROLL' };
      const result = dispatchWsIntent(socket, { roomCode: 'ROOM1', playerId: 'p1', intent });
      expect(result).toBe(false);
      expect(socket.sentMessages.length).toBe(0);
    });

    it('sends INTENT message and invokes onAfterSend when socket is OPEN', () => {
      const socket = createMockSocket(1);
      let afterSendCalled = false;
      const intent: PlayerIntent = { type: 'INTENT_ROLL' };
      const result = dispatchWsIntent(socket, {
        roomCode: 'ROOM1',
        playerId: 'p1',
        intent,
        onAfterSend: () => {
          afterSendCalled = true;
        },
      });
      expect(result).toBe(true);
      expect(afterSendCalled).toBe(true);
      expect(socket.sentMessages.length).toBe(1);
      const parsed = JSON.parse(socket.sentMessages[0]!) as { type: string; roomCode: string; playerId: string };
      expect(parsed.type).toBe('INTENT');
    });
  });

  describe('dispatchWsEmote', () => {
    it('returns false when socket is null or not open', () => {
      const result1 = dispatchWsEmote(null, { roomCode: 'R1', playerId: 'p1', emoteId: 'THUMBS_UP' });
      const socket = createMockSocket(2); // CLOSING
      const result2 = dispatchWsEmote(socket, { roomCode: 'R1', playerId: 'p1', emoteId: 'THUMBS_UP' });
      expect(result1).toBe(false);
      expect(result2).toBe(false);
    });

    it('sends EMOTE message when socket is open', () => {
      const socket = createMockSocket(1);
      const result = dispatchWsEmote(socket, { roomCode: 'R1', playerId: 'p1', emoteId: 'THUMBS_UP' });
      expect(result).toBe(true);
      expect(socket.sentMessages.length).toBe(1);
      const parsed = JSON.parse(socket.sentMessages[0]!) as { type: string; emoteId: string };
      expect(parsed.type).toBe('EMOTE');
      expect(parsed.emoteId).toBe('THUMBS_UP');
    });
  });

  describe('dispatchWsMessage', () => {
    it('returns false when socket is null or closed', () => {
      const msg: WsClientMessage = { type: 'LEAVE_ROOM', roomCode: 'R1', playerId: 'p1' };
      const result = dispatchWsMessage(null, msg);
      expect(result).toBe(false);
    });

    it('sends message with default roomCode override when specified', () => {
      const socket = createMockSocket(1);
      const msg: WsClientMessage = { type: 'INTENT_REQUEST_RESYNC', roomCode: 'OLD_ROOM', playerId: 'p1' };
      const result = dispatchWsMessage(socket, msg, 'NEW_ROOM');
      expect(result).toBe(true);
      const parsed = JSON.parse(socket.sentMessages[0]!) as { type: string; roomCode?: string };
      expect(parsed.roomCode).toBe('NEW_ROOM');
    });
  });

  describe('dispatchWsResync', () => {
    it('returns false when socket is not open', () => {
      const socket = createMockSocket(3); // CLOSED
      const result = dispatchWsResync(socket, { roomCode: 'R1', playerId: 'p1' });
      expect(result).toBe(false);
    });

    it('sends resync message and triggers onWatchdogStart callback', () => {
      const socket = createMockSocket(1);
      let watchdogStarted = false;
      const result = dispatchWsResync(socket, {
        roomCode: 'R1',
        playerId: 'p1',
        onWatchdogStart: () => {
          watchdogStarted = true;
        },
      });
      expect(result).toBe(true);
      expect(watchdogStarted).toBe(true);
      const parsed = JSON.parse(socket.sentMessages[0]!) as { type: string; roomCode: string; playerId: string };
      expect(parsed.type).toBe('INTENT_REQUEST_RESYNC');
      expect(parsed.roomCode).toBe('R1');
    });
  });
});
