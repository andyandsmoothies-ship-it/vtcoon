// [UC-GAME-009/MSS][TC-NET03.1/MSS][IMP-24/MSS]
// WebSocket Message Handler & Handshake Subroutines with Telemetry Hook
import type { DeltaPayload } from '../../server/session_manager.js';
import type { WsClientMessage, WsServerMessage, ReasonCode } from '../../server/network/network_types.js';
import { saveReconnectToken, getReconnectToken, clearReconnectToken } from './reconnect_token.js';
import { applyDeltaToStore, isGameRunningDelta } from './apply_delta.js';
import { useTelemetryStore } from '../telemetry/telemetry_store.js';

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
    handleWsError(msg, ctx);
  }
}

function handleWsError(
  msg: Extract<WsServerMessage, { type: 'ERROR' | 'INTENT_REJECTED' }>,
  ctx: WsMessageHandlerContext
): void {
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

  const msg: WsClientMessage = effectiveIsHost
    ? { type: 'CREATE_ROOM', roomCode: options.roomCode, playerId: options.playerId }
    : { type: 'JOIN_ROOM', roomCode: options.roomCode, playerId: options.playerId };

  socket.send(JSON.stringify(msg));
  return msg;
}
