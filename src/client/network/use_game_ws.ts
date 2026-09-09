// [UC-GAME-009/MSS][TC-NET03.1/MSS][TC-NET03.2/MSS][UC-GAME-006..008/MSS]
// Client Hook kết nối WebSocket, gửi Intent, nhận STATE_DELTA và tự động Reconnect
import { useState, useEffect, useRef, useCallback } from 'react';
import type { DeltaPayload } from '../../server/session_manager.js';
import type { PlayerIntent } from '../../server/intent_dispatcher.js';
import type { WsClientMessage, WsServerMessage, ReasonCode } from '../../server/network/network_types.js';
import { saveReconnectToken, getReconnectToken, clearReconnectToken } from './reconnect_token.js';
import { applyDeltaToStore } from './apply_delta.js';

export { saveReconnectToken, getReconnectToken, clearReconnectToken };
export { applyDeltaToStore };

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
  readonly autoConnect?: boolean;
  readonly onDelta?: (delta: DeltaPayload) => void;
  readonly onError?: (reasonCode: ReasonCode) => void;
  readonly onGrace?: (playerId: string, secondsLeft: number) => void;
  readonly onBotTakeover?: (playerId: string) => void;
  readonly onReconnected?: (playerId: string) => void;
  readonly webSocketFactory?: (url: string) => WebSocketLike;
}

export interface UseGameWsReturn {
  readonly isConnected: boolean;
  readonly lastTick: number;
  readonly errorReason: ReasonCode | null;
  readonly sendIntent: (intent: PlayerIntent) => boolean;
  readonly requestResync: () => boolean;
  readonly connect: () => void;
  readonly disconnect: () => void;
}

export interface WsMessageHandlerContext {
  readonly roomCode: string;
  readonly playerId: string;
  readonly socket: { send: (data: string) => void };
  readonly onDelta?: (delta: DeltaPayload) => void;
  readonly onError?: (reasonCode: ReasonCode) => void;
  readonly onGrace?: (playerId: string, secondsLeft: number) => void;
  readonly onBotTakeover?: (playerId: string) => void;
  readonly onReconnected?: (playerId: string) => void;
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
    ctx.onDelta?.(msg.delta);
  } else if (msg.type === 'SESSION_INIT') {
    saveReconnectToken(msg.roomCode || ctx.roomCode, msg.reconnectToken);
  } else if (msg.type === 'PLAYER_GRACE') {
    ctx.onGrace?.(msg.playerId, msg.secondsLeft);
  } else if (msg.type === 'PLAYER_BOT_TAKEOVER') {
    ctx.onBotTakeover?.(msg.playerId);
  } else if (msg.type === 'PLAYER_RECONNECTED') {
    ctx.onReconnected?.(msg.playerId);
  } else if (msg.type === 'PING') {
    const pongMsg: WsClientMessage = { type: 'PONG', playerId: ctx.playerId, roomCode: ctx.roomCode };
    ctx.socket.send(JSON.stringify(pongMsg));
  } else if (msg.type === 'ERROR') {
    if (msg.reasonCode === 'TOKEN_INVALID' || msg.reasonCode === 'TOKEN_EXPIRED') {
      clearReconnectToken(ctx.roomCode);
    }
    ctx.setErrorReason?.(msg.reasonCode);
    ctx.onError?.(msg.reasonCode);
  }
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

  const connect = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === 1) return;

    const defaultUrl = typeof window !== 'undefined'
      ? `ws://${window.location.hostname || 'localhost'}:3001`
      : 'ws://localhost:3001';
    const targetUrl = url ?? defaultUrl;

    const socket: WebSocketLike = webSocketFactory
      ? webSocketFactory(targetUrl)
      : new WebSocket(targetUrl);

    socket.onopen = (ev) => {
      setIsConnected(true);
      setErrorReason(null);
      const savedToken = getReconnectToken(roomCode);
      if (savedToken) {
        const reconnectMsg: WsClientMessage = {
          type: 'RECONNECT',
          reconnectToken: savedToken,
          roomCode,
        };
        socket.send(JSON.stringify(reconnectMsg));
      }
    };

    socket.onmessage = (event) => {
      try {
        const raw = typeof event.data === 'string' ? event.data : String(event.data);
        const msg = JSON.parse(raw) as WsServerMessage;
        handleWsMessage(msg, {
          roomCode,
          playerId,
          socket,
          onDelta: onDeltaRef.current,
          onError: onErrorRef.current,
          onGrace: onGraceRef.current,
          onBotTakeover: onBotTakeoverRef.current,
          onReconnected: onReconnectedRef.current,
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
    };

    wsRef.current = socket;
  }, [url, roomCode, playerId, webSocketFactory]);

  const disconnect = useCallback(() => {
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
        roomCode,
        playerId,
        intent,
      };
      wsRef.current.send(JSON.stringify(msg));
      return true;
    },
    [roomCode, playerId],
  );

  const requestResync = useCallback((): boolean => {
    if (!wsRef.current || wsRef.current.readyState !== 1) return false;
    const msg: WsClientMessage = {
      type: 'INTENT_REQUEST_RESYNC',
      roomCode,
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
    requestResync,
    connect,
    disconnect,
  };
}
