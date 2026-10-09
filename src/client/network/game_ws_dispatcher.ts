// [IMP-315] Modular Game WS Dispatcher & URL / Backoff Computation
import type { PlayerIntent } from '../../server/intent_dispatcher.js';
import type { WsClientMessage } from '../../server/network/network_types.js';
import { useTelemetryStore } from '../telemetry/telemetry_store.js';
import { useGameStore } from '../store/game_store.js';
import { buildIntentTelemetryContext } from '../ui/ui_helpers.js';

export interface WebSocketLike {
  readyState: number;
  send(data: string): void;
  close(): void;
  onopen: WebSocket['onopen'];
  onmessage: WebSocket['onmessage'];
  onerror: WebSocket['onerror'];
  onclose: WebSocket['onclose'];
}

export function resolveWsUrl(url?: string, roomCode?: string): string {
  if (url) return url;
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const isLocalDev =
    typeof window !== 'undefined' &&
    (window.location.host === 'localhost:3000' || window.location.host === '127.0.0.1:3000');
  const wsProto = isHttps ? 'wss:' : 'ws:';
  if (typeof window !== 'undefined') {
    if (isLocalDev) {
      return `ws://${window.location.hostname || 'localhost'}:3001`;
    }
    return `${wsProto}//${window.location.host}/rooms/${roomCode ?? ''}`;
  }
  return 'ws://localhost:3001';
}

export function computeReconnectBackoff(attempts: number, baseMs = 1000, maxMs = 5000): number {
  return Math.min(baseMs * Math.pow(1.5, attempts), maxMs);
}

export function dispatchWsIntent(
  socket: WebSocketLike | null,
  params: {
    readonly roomCode: string;
    readonly playerId: string;
    readonly intent: PlayerIntent;
    readonly onAfterSend?: () => void;
  },
): boolean {
  if (!socket || socket.readyState !== 1) return false;
  const { roomCode, playerId, intent, onAfterSend } = params;
  const msg: WsClientMessage = {
    type: 'INTENT',
    roomCode,
    playerId,
    intent,
  };
  const gameState = useGameStore.getState();
  const player = gameState.playersInfo[playerId];
  const telemetryContext = buildIntentTelemetryContext({
    intentType: intent.type,
    dice: gameState.dice,
    consecutiveDoubles: player?.consecutiveDoubles,
    balance: player?.balance,
    position: gameState.playerPositions[playerId],
    currentTurnPlayerId: gameState.currentTurnPlayerId,
    localPlayerId: playerId,
  });
  useTelemetryStore.getState().recordIntent(playerId, intent, telemetryContext);
  useTelemetryStore.getState().addAuditLog({
    tick: 0,
    source: 'PLAYER',
    action: intent.type,
    payloadSummary: JSON.stringify({ ...intent, ...telemetryContext }),
  });
  onAfterSend?.();
  socket.send(JSON.stringify(msg));
  return true;
}

export function dispatchWsEmote(
  socket: WebSocketLike | null,
  params: {
    readonly roomCode: string;
    readonly playerId: string;
    readonly emoteId: string;
  },
): boolean {
  if (!socket || socket.readyState !== 1) return false;
  const msg: WsClientMessage = {
    type: 'EMOTE',
    roomCode: params.roomCode,
    playerId: params.playerId,
    emoteId: params.emoteId,
  };
  socket.send(JSON.stringify(msg));
  return true;
}

export function dispatchWsMessage(
  socket: WebSocketLike | null,
  msg: WsClientMessage,
  defaultRoomCode?: string,
): boolean {
  if (!socket || socket.readyState !== 1) return false;
  const targetCode = defaultRoomCode || ('roomCode' in msg && msg.roomCode ? msg.roomCode : '');
  const activeMsg = 'roomCode' in msg && msg.roomCode ? { ...msg, roomCode: targetCode } : msg;
  socket.send(JSON.stringify(activeMsg));
  return true;
}

export function dispatchWsResync(
  socket: WebSocketLike | null,
  params: {
    readonly roomCode: string;
    readonly playerId: string;
    readonly onWatchdogStart?: () => void;
  },
): boolean {
  if (!socket || socket.readyState !== 1) return false;
  const msg: WsClientMessage = {
    type: 'INTENT_REQUEST_RESYNC',
    roomCode: params.roomCode,
    playerId: params.playerId,
  };
  socket.send(JSON.stringify(msg));
  params.onWatchdogStart?.();
  return true;
}
