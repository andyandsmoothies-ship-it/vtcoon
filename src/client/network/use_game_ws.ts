// [UC-GAME-009/MSS][TC-NET03.1/MSS][TC-NET03.2/MSS][UC-GAME-006..008/MSS]
// Client Hook kết nối WebSocket, gửi Intent, nhận STATE_DELTA và tự động Reconnect
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { DeltaPayload } from '../../server/session_manager.js';
import type { PlayerIntent } from '../../server/intent_dispatcher.js';
import type { WsClientMessage, WsServerMessage, ReasonCode } from '../../server/network/network_types.js';
import { saveReconnectToken, getReconnectToken, clearReconnectToken } from './reconnect_token.js';
import { applyDeltaToStore, isGameRunningDelta } from './apply_delta.js';
import { useWsLivenessWatchdog } from './ws_liveness_watchdog.js';

export { saveReconnectToken, getReconnectToken, clearReconnectToken };
export { applyDeltaToStore, isGameRunningDelta };

interface WebSocketLike {
  readyState: number;
  send(data: string): void;
  close(): void;
  onopen: WebSocket['onopen'];
  onmessage: WebSocket['onmessage'];
  onerror: WebSocket['onerror'];
  onclose: WebSocket['onclose'];
}

const clearRef = <T>(ref: { current: T | null }) => { ref.current = null; };

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
  readonly onLobbyUpdate?: (players: ReadonlyArray<{ readonly id: string; readonly isHost: boolean; readonly slotIndex: number; readonly name?: string }>) => void;
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

import {
  handleWsMessage,
  performWsHandshake,
  type WsMessageHandlerContext,
} from './ws_message_handler.js';
import { useTelemetryStore } from '../telemetry/telemetry_store.js';
import { useGameStore } from '../store/game_store.js';
import { buildIntentTelemetryContext } from '../ui/ui_helpers.js';

export { handleWsMessage, performWsHandshake };
export type { WsMessageHandlerContext };

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

  const onDeltaRef = useRef(onDelta); onDeltaRef.current = onDelta;
  const onErrorRef = useRef(onError); onErrorRef.current = onError;
  const onGraceRef = useRef(options.onGrace); onGraceRef.current = options.onGrace;
  const onBotTakeoverRef = useRef(options.onBotTakeover); onBotTakeoverRef.current = options.onBotTakeover;
  const onReconnectedRef = useRef(options.onReconnected); onReconnectedRef.current = options.onReconnected;
  const onGameOverRef = useRef(options.onGameOver); onGameOverRef.current = options.onGameOver;
  const onEmoteRef = useRef(options.onEmote); onEmoteRef.current = options.onEmote;
  const onRoomStartedRef = useRef(options.onRoomStarted); onRoomStartedRef.current = options.onRoomStarted;
  const onSessionInitRef = useRef(options.onSessionInit); onSessionInitRef.current = options.onSessionInit;
  const isHostRef = useRef(options.isHost); isHostRef.current = options.isHost;
  const activeRoomCodeRef = useRef(roomCode); activeRoomCodeRef.current = roomCode;
  const onLobbyUpdateRef = useRef(options.onLobbyUpdate); onLobbyUpdateRef.current = options.onLobbyUpdate;
  const playerIdRef = useRef(playerId);
  React.useEffect(() => { playerIdRef.current = playerId; }, [playerId]);

  const isManualDisconnectRef = useRef(false);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const lastActionTimeRef = useRef<number>(0);
  const watchdogRef = useRef<{
    recordPacketReceived: () => void;
    startResyncWatchdog: (onTimeout?: () => void) => void;
    clearResyncWatchdog: () => void;
  }>({
    recordPacketReceived: () => {},
    startResyncWatchdog: () => {},
    clearResyncWatchdog: () => {},
  });

  const connect = useCallback(() => {
    if (!roomCode) return;
    if (wsRef.current && (wsRef.current.readyState === 0 || wsRef.current.readyState === 1)) return;
    isManualDisconnectRef.current = false;
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const isLocalDev =
      typeof window !== 'undefined' &&
      (window.location.host === 'localhost:3000' || window.location.host === '127.0.0.1:3000');
    const wsProto = isHttps ? 'wss:' : 'ws:';
    const defaultUrl = typeof window !== 'undefined'
      ? (isLocalDev
          ? `ws://${window.location.hostname || 'localhost'}:3001`
          : `${wsProto}//${window.location.host}/rooms/${roomCode}`)
      : 'ws://localhost:3001';
    const targetUrl = url ?? defaultUrl;

    const socket: WebSocketLike = webSocketFactory
      ? webSocketFactory(targetUrl)
      : new WebSocket(targetUrl);

    socket.onopen = () => {
      setIsConnected(true);
      setErrorReason(null);
      reconnectAttemptsRef.current = 0;
      lastActionTimeRef.current = Date.now();
      performWsHandshake(socket, {
        roomCode,
        playerId,
        isHost: isHostRef.current,
      });
    };

    socket.onmessage = (event) => {
      try {
        watchdogRef.current.recordPacketReceived();
        const raw = typeof event.data === 'string' ? event.data : String(event.data);
        if (lastActionTimeRef.current > 0) {
          const rtt = Math.max(1, Math.min(Date.now() - lastActionTimeRef.current, 500));
          useTelemetryStore.getState().updateMetrics({ pingRttMs: rtt });
          lastActionTimeRef.current = 0;
        }
        useTelemetryStore.getState().updateMetrics({ deltaBytes: raw.length });
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
          onLobbyUpdate: onLobbyUpdateRef.current,
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
      if (wsRef.current && wsRef.current !== socket) return;
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
    watchdogRef.current.clearResyncWatchdog();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const sendIntent = useCallback(
    (intent: PlayerIntent): boolean => {
      if (!wsRef.current || wsRef.current.readyState !== 1) return false;
      // [IMP-165/P1.1] Dùng playerIdRef.current để chống stale closure khi server đổi slot
      const effectivePid = playerIdRef.current || playerId;
      const msg: WsClientMessage = {
        type: 'INTENT',
        roomCode: activeRoomCodeRef.current || roomCode,
        playerId: effectivePid,
        intent,
      };
      const gameState = useGameStore.getState();
      const player = gameState.playersInfo[effectivePid];
      const telemetryContext = buildIntentTelemetryContext({
        intentType: intent.type,
        dice: gameState.dice,
        consecutiveDoubles: player?.consecutiveDoubles,
        balance: player?.balance,
        position: gameState.playerPositions[effectivePid],
        currentTurnPlayerId: gameState.currentTurnPlayerId,
        localPlayerId: effectivePid,
      });
      useTelemetryStore.getState().recordIntent(effectivePid, intent, telemetryContext);
      useTelemetryStore.getState().addAuditLog({
        tick: 0,
        source: 'PLAYER',
        action: intent.type,
        payloadSummary: JSON.stringify({ ...intent, ...telemetryContext }),
      });
      lastActionTimeRef.current = Date.now();
      wsRef.current.send(JSON.stringify(msg));
      return true;
    },
    [roomCode, playerId],
  );

  const sendEmote = useCallback(
    (emoteId: string): boolean => {
      if (!wsRef.current || wsRef.current.readyState !== 1) return false;
      // [IMP-165/P1.1] Dùng playerIdRef.current để chống stale closure
      const msg: WsClientMessage = {
        type: 'EMOTE',
        roomCode: activeRoomCodeRef.current || roomCode,
        playerId: playerIdRef.current || playerId,
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
    watchdogRef.current.startResyncWatchdog();
    return true;
  }, [roomCode, playerId]);

  const connectRef = useRef(connect);
  connectRef.current = connect;

  const requestResyncRef = useRef(requestResync);
  requestResyncRef.current = requestResync;

  const handleWakeup = useCallback(() => {
    if (typeof document !== 'undefined' && document.visibilityState && document.visibilityState !== 'visible') {
      return;
    }
    useGameStore.getState().clearActivePawnAnimation();
    useGameStore.getState().setIsRolling(false);

    if (!wsRef.current || (wsRef.current.readyState !== 0 && wsRef.current.readyState !== 1)) {
      connectRef.current();
      return;
    }

    if (wsRef.current.readyState === 1) {
      requestResyncRef.current();
    }
  }, []);

  const handleDeadSocket = useCallback(() => {
    if (wsRef.current) {
      const oldSocket = wsRef.current;
      try {
        oldSocket.close();
      } catch {
        // Ignore close error
      }
      clearRef(wsRef);
      setIsConnected(false);
      connectRef.current();
      const reconnectedSocket = wsRef.current;
      if (reconnectedSocket && oldSocket && reconnectedSocket !== oldSocket) {
        reconnectedSocket.close = oldSocket.close;
      }
    }
  }, []);

  const watchdog = useWsLivenessWatchdog({
    isConnected,
    onWakeup: handleWakeup,
    onDeadSocket: handleDeadSocket,
  });
  watchdogRef.current = watchdog;

  React.useEffect(() => {
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
