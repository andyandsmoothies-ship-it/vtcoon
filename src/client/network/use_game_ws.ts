// [UC-GAME-009/MSS][TC-NET03.1/MSS][TC-NET03.2/MSS][UC-GAME-006..008/MSS]
// Client Hook kết nối WebSocket, gửi Intent, nhận STATE_DELTA và tự động Reconnect
import { useState, useEffect, useRef, useCallback } from 'react';
import type { DeltaPayload } from '../../server/session_manager.js';
import type { PlayerIntent } from '../../server/intent_dispatcher.js';
import type { WsClientMessage, WsServerMessage, ReasonCode } from '../../server/network/network_types.js';
import { saveReconnectToken, getReconnectToken, clearReconnectToken } from './reconnect_token.js';
import { applyDeltaToStore, isGameRunningDelta } from './apply_delta.js';

export { saveReconnectToken, getReconnectToken, clearReconnectToken };
export { applyDeltaToStore, isGameRunningDelta };

export interface WebSocketLike {
  readyState: number;
  send(data: string): void;
  close(): void;
  onopen: WebSocket['onopen'];
  onmessage: WebSocket['onmessage'];
  onerror: WebSocket['onerror'];
  onclose: WebSocket['onclose'];
}

export interface UseGameWsOptions {
  readonly url?: string;
  readonly roomCode: string;
  readonly playerId: string;
  readonly isHost?: boolean;
  readonly autoConnect?: boolean;
  readonly onDelta?: (delta: DeltaPayload) => void;
  readonly onError?: (reasonCode: ReasonCode) => void;
  readonly onGrace?: (playerId: string, secondsLeft: number) => void;
  readonly onBotTakeover?: (playerId: string) => void;
  readonly onReconnected?: (playerId: string) => void;
  readonly onGameOver?: (leaderboard: ReadonlyArray<{ readonly id: string; readonly netWorth: number }>) => void;
  readonly onEmote?: (playerId: string, emoteId: string, timestamp: number) => void;
  readonly onRoomStarted?: () => void;
  readonly onSessionInit?: (token: string, roomCode: string) => void;
  readonly webSocketFactory?: (url: string) => WebSocketLike;
}

export interface UseGameWsReturn {
  readonly isConnected: boolean;
  readonly lastTick: number;
  readonly errorReason: ReasonCode | null;
  readonly sendIntent: (intent: PlayerIntent) => boolean;
  readonly sendEmote: (emoteId: string) => boolean;
  readonly sendWsMessage: (msg: WsClientMessage) => boolean;
  readonly requestResync: () => boolean;
  readonly connect: () => void;
  readonly disconnect: () => void;
}

export interface WsMessageHandlerContext {
  readonly roomCode: string;
  readonly playerId: string;
  readonly isHost?: boolean;
  readonly socket: { send: (data: string) => void };
  readonly onDelta?: (delta: DeltaPayload) => void;
  readonly onError?: (reasonCode: ReasonCode) => void;
  readonly onGrace?: (playerId: string, secondsLeft: number) => void;
  readonly onBotTakeover?: (playerId: string) => void;
  readonly onReconnected?: (playerId: string) => void;
  readonly onGameOver?: (leaderboard: ReadonlyArray<{ readonly id: string; readonly netWorth: number }>) => void;
  readonly onEmote?: (playerId: string, emoteId: string, timestamp: number) => void;
  readonly onRoomStarted?: () => void;
  readonly onSessionInit?: (token: string, roomCode: string) => void;
  readonly setLastTick?: (tick: number) => void;
  readonly setErrorReason?: (reason: ReasonCode | null) => void;
}

export function handleWsMessage(
  msg: WsServerMessage,
  ctx: WsMessageHandlerContext,
): void {
  if (msg.type === 'STATE_DELTA' || msg.type === 'DELTA') {
    applyDeltaToStore(msg.delta);
    ctx.setLastTick?.(msg.delta.tick);
    if (isGameRunningDelta(msg.delta)) {
      ctx.onRoomStarted?.();
    }
    ctx.onDelta?.(msg.delta);
  } else if (msg.type === 'GAME_OVER') {
    clearReconnectToken(ctx.roomCode);
    ctx.onGameOver?.(msg.leaderboard);
  } else if (msg.type === 'ROOM_STARTED') {
    ctx.onRoomStarted?.();
  } else if (msg.type === 'ROOM_CREATED' || msg.type === 'ROOM_JOINED') {
    ctx.onSessionInit?.('', msg.roomCode);
  } else if (msg.type === 'SESSION_INIT') {
    const activeCode = msg.roomCode || ctx.roomCode;
    saveReconnectToken(activeCode, msg.reconnectToken);
    ctx.onSessionInit?.(msg.reconnectToken, activeCode);
  } else if (msg.type === 'PLAYER_GRACE') {
    ctx.onGrace?.(msg.playerId, msg.secondsLeft);
  } else if (msg.type === 'PLAYER_BOT_TAKEOVER') {
    ctx.onBotTakeover?.(msg.playerId);
  } else if (msg.type === 'PLAYER_RECONNECTED') {
    ctx.onReconnected?.(msg.playerId);
  } else if (msg.type === 'PLAYER_EMOTE') {
    ctx.onEmote?.(msg.playerId, msg.emoteId, msg.timestamp);
  } else if (msg.type === 'PING') {
    const activeCode = ('roomCode' in msg && msg.roomCode) ? msg.roomCode : ctx.roomCode;
    const pongMsg: WsClientMessage = { type: 'PONG', playerId: ctx.playerId, roomCode: activeCode };
    ctx.socket.send(JSON.stringify(pongMsg));
  } else if (msg.type === 'ERROR' || msg.type === 'INTENT_REJECTED') {
    if (msg.type === 'ERROR' && (msg.reasonCode === 'TOKEN_INVALID' || msg.reasonCode === 'TOKEN_EXPIRED' || msg.reasonCode === 'ROOM_NOT_FOUND')) {
      clearReconnectToken(ctx.roomCode);
      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const isExplicitGuest = Boolean(params?.has('room')) && params?.get('host') !== 'true';
      const isHost = ctx.isHost !== undefined ? ctx.isHost : !isExplicitGuest;
      const fallbackMsg: WsClientMessage = isHost
        ? { type: 'CREATE_ROOM', roomCode: ctx.roomCode, playerId: ctx.playerId }
        : { type: 'JOIN_ROOM', roomCode: ctx.roomCode, playerId: ctx.playerId };
      try {
        ctx.socket.send(JSON.stringify(fallbackMsg));
      } catch {
        /* safe-ignore: socket may be closing */
      }
    }
    if (msg.reasonCode === 'ROOM_STARTED') {
      ctx.onRoomStarted?.();
      try {
        const resyncMsg: WsClientMessage = {
          type: 'INTENT_REQUEST_RESYNC',
          roomCode: ctx.roomCode,
          playerId: ctx.playerId,
        };
        ctx.socket.send(JSON.stringify(resyncMsg));
      } catch {
        /* safe-ignore: socket may be disconnected or buffered */
      }
    }
    ctx.setErrorReason?.(msg.reasonCode);
    ctx.onError?.(msg.reasonCode);
  }
}

export interface HandshakeOptions {
  readonly roomCode: string;
  readonly playerId: string;
  readonly isHost?: boolean;
}

export function performWsHandshake(
  socket: { send: (data: string) => void },
  options: HandshakeOptions,
): WsClientMessage {
  const savedToken = getReconnectToken(options.roomCode);
  if (savedToken) {
    const reconnectMsg: WsClientMessage = {
      type: 'RECONNECT',
      reconnectToken: savedToken,
      roomCode: options.roomCode,
    };
    socket.send(JSON.stringify(reconnectMsg));
    return reconnectMsg;
  }

  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const hasRoomParam = Boolean(params?.has('room'));
  const isExplicitGuest = hasRoomParam && params?.get('host') !== 'true';
  const effectiveIsHost = options.isHost !== undefined ? options.isHost : !isExplicitGuest;

  if (effectiveIsHost) {
    const createMsg: WsClientMessage = {
      type: 'CREATE_ROOM',
      roomCode: options.roomCode,
      playerId: options.playerId,
    };
    socket.send(JSON.stringify(createMsg));
    return createMsg;
  }

  const joinMsg: WsClientMessage = {
    type: 'JOIN_ROOM',
    roomCode: options.roomCode,
    playerId: options.playerId,
  };
  socket.send(JSON.stringify(joinMsg));
  return joinMsg;
}

export function useGameWs(options: UseGameWsOptions): UseGameWsReturn {
  const {
    url,
    roomCode,
    playerId,
    autoConnect = true,
    onDelta,
    onError,
    webSocketFactory,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastTick, setLastTick] = useState(0);
  const [errorReason, setErrorReason] = useState<ReasonCode | null>(null);
  const wsRef = useRef<WebSocketLike | null>(null);

  const onDeltaRef = useRef(onDelta);
  onDeltaRef.current = onDelta;

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const onGraceRef = useRef(options.onGrace);
  onGraceRef.current = options.onGrace;

  const onBotTakeoverRef = useRef(options.onBotTakeover);
  onBotTakeoverRef.current = options.onBotTakeover;

  const onReconnectedRef = useRef(options.onReconnected);
  onReconnectedRef.current = options.onReconnected;

  const onGameOverRef = useRef(options.onGameOver);
  onGameOverRef.current = options.onGameOver;

  const onEmoteRef = useRef(options.onEmote);
  onEmoteRef.current = options.onEmote;

  const onRoomStartedRef = useRef(options.onRoomStarted);
  onRoomStartedRef.current = options.onRoomStarted;

  const onSessionInitRef = useRef(options.onSessionInit);
  onSessionInitRef.current = options.onSessionInit;

  const isHostRef = useRef(options.isHost);
  isHostRef.current = options.isHost;

  const activeRoomCodeRef = useRef(roomCode);
  activeRoomCodeRef.current = roomCode;

  const isManualDisconnectRef = useRef(false);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const connect = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === 1) return;
    isManualDisconnectRef.current = false;
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const defaultUrl = typeof window !== 'undefined'
      ? (isHttps
          ? `wss://${window.location.host}/rooms/${roomCode}`
          : `ws://${window.location.hostname || 'localhost'}:3001`)
      : 'ws://localhost:3001';
    const targetUrl = url ?? defaultUrl;

    const socket: WebSocketLike = webSocketFactory
      ? webSocketFactory(targetUrl)
      : new WebSocket(targetUrl);

    socket.onopen = () => {
      setIsConnected(true);
      setErrorReason(null);
      reconnectAttemptsRef.current = 0;
      performWsHandshake(socket, {
        roomCode,
        playerId,
        isHost: isHostRef.current,
      });
    };

    socket.onmessage = (event) => {
      try {
        const raw = typeof event.data === 'string' ? event.data : String(event.data);
        const msg = JSON.parse(raw) as WsServerMessage;
        handleWsMessage(msg, {
          roomCode: activeRoomCodeRef.current || roomCode,
          playerId,
          isHost: isHostRef.current,
          socket,
          onDelta: onDeltaRef.current,
          onError: onErrorRef.current,
          onGrace: onGraceRef.current,
          onBotTakeover: onBotTakeoverRef.current,
          onReconnected: onReconnectedRef.current,
          onGameOver: onGameOverRef.current,
          onEmote: onEmoteRef.current,
          onRoomStarted: onRoomStartedRef.current,
          onSessionInit: (tok, rc) => {
            if (rc) activeRoomCodeRef.current = rc;
            onSessionInitRef.current?.(tok, rc);
          },
          setLastTick,
          setErrorReason,
        });
      } catch {
        // Bỏ qua message không hợp lệ
      }
    };

    socket.onerror = () => {
      setIsConnected(false);
    };

    socket.onclose = () => {
      setIsConnected(false);
      if (!isManualDisconnectRef.current) {
        const delay = Math.min(1000 * Math.pow(1.5, reconnectAttemptsRef.current), 5000);
        reconnectAttemptsRef.current += 1;
        reconnectTimerRef.current = setTimeout(() => {
          connect();
        }, delay);
      }
    };

    wsRef.current = socket;
  }, [url, roomCode, playerId, options.isHost, webSocketFactory]);

  const disconnect = useCallback(() => {
    isManualDisconnectRef.current = true;
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const sendIntent = useCallback(
    (intent: PlayerIntent): boolean => {
      if (!wsRef.current || wsRef.current.readyState !== 1) return false;
      const msg: WsClientMessage = {
        type: 'INTENT',
        roomCode: activeRoomCodeRef.current || roomCode,
        playerId,
        intent,
      };
      wsRef.current.send(JSON.stringify(msg));
      return true;
    },
    [roomCode, playerId],
  );

  const sendEmote = useCallback(
    (emoteId: string): boolean => {
      if (!wsRef.current || wsRef.current.readyState !== 1) return false;
      const msg: WsClientMessage = {
        type: 'EMOTE',
        roomCode: activeRoomCodeRef.current || roomCode,
        playerId,
        emoteId,
      };
      wsRef.current.send(JSON.stringify(msg));
      return true;
    },
    [roomCode, playerId],
  );

  const sendWsMessage = useCallback(
    (msg: WsClientMessage): boolean => {
      if (!wsRef.current || wsRef.current.readyState !== 1) return false;
      const targetCode = activeRoomCodeRef.current || ('roomCode' in msg && msg.roomCode ? msg.roomCode : roomCode);
      const activeMsg = 'roomCode' in msg && msg.roomCode ? { ...msg, roomCode: targetCode } : msg;
      wsRef.current.send(JSON.stringify(activeMsg));
      return true;
    },
    [roomCode],
  );

  const requestResync = useCallback((): boolean => {
    if (!wsRef.current || wsRef.current.readyState !== 1) return false;
    const msg: WsClientMessage = {
      type: 'INTENT_REQUEST_RESYNC',
      roomCode: activeRoomCodeRef.current || roomCode,
      playerId,
    };
    wsRef.current.send(JSON.stringify(msg));
    return true;
  }, [roomCode, playerId]);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    isConnected,
    lastTick,
    errorReason,
    sendIntent,
    sendEmote,
    sendWsMessage,
    requestResync,
    connect,
    disconnect,
  };
}
