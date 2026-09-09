// [UC-GAME-001/MSS][UC-GAME-003/MSS][UC-GAME-004/MSS]
// Wire Protocol Types — WsClientMessage / WsServerMessage
// Tất cả message qua WebSocket đều phải khớp union này.

import type { DeltaPayload } from '../session_manager.js';
import type { PlayerIntent } from '../intent_dispatcher.js';

export type ReasonCode =
  | 'ROOM_CODE_COLLISION'
  | 'ROOM_FULL'
  | 'ROOM_NOT_FOUND'
  | 'ROOM_STARTED'
  | 'NOT_HOST'
  | 'NOT_ENOUGH_PLAYERS'
  | 'SLOT_CONFLICT'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_INVALID'
  | 'INTENT_REJECTED'
  | 'INVALID_INTENT'
  | 'INVALID_ROOM'
  | 'NOT_YOUR_TURN'
  | 'WARN_DELTA_OVERSIZED'
  | 'OUT_OF_TURN'
  | 'RATE_LIMIT_EXCEEDED'
  | 'ABUSE_DETECTED'
  | 'INVALID_ENVELOPE'
  | 'INVALID_VALUE';

// ─── Client → Server ────────────────────────────────────────────
export type WsClientMessage =
  | { readonly type: 'CREATE_ROOM'; readonly playerId: string }
  | { readonly type: 'JOIN_ROOM';   readonly playerId: string; readonly roomCode: string }
  | { readonly type: 'PONG';        readonly playerId: string; readonly roomCode: string }
  | { readonly type: 'RECONNECT';   readonly reconnectToken: string; readonly roomCode?: string }
  | {
      readonly type: 'INTENT';
      readonly roomCode: string;
      readonly playerId: string;
      readonly intent: PlayerIntent;
    }
  | {
      readonly type: 'INTENT_REQUEST_RESYNC';
      readonly roomCode: string;
      readonly playerId: string;
    }
  | {
      readonly type: 'EMOTE';
      readonly roomCode: string;
      readonly playerId: string;
      readonly emoteId: string;
    };

// ─── Server → Client ────────────────────────────────────────────
export type WsServerMessage =
  | {
      readonly type: 'ROOM_CREATED';
      readonly roomCode: string;
      readonly playerId: string;
    }
  | {
      readonly type: 'ROOM_JOINED';
      readonly roomCode: string;
      readonly playerId: string;
      readonly playerCount: number;
    }
  | {
      readonly type: 'ERROR';
      readonly reasonCode: ReasonCode;
    }
  | {
      readonly type: 'INTENT_REJECTED';
      readonly reasonCode: ReasonCode;
      readonly playerId?: string;
    }
  | {
      readonly type: 'PING';
      readonly roomCode: string;
    }
  | {
      readonly type: 'SESSION_INIT';
      readonly playerId: string;
      readonly reconnectToken: string;
      readonly roomCode: string;
    }
  | {
      readonly type: 'STATE_DELTA';
      readonly delta: DeltaPayload;
    }
  | {
      readonly type: 'DELTA';
      readonly delta: DeltaPayload;
    }
  | {
      readonly type: 'PLAYER_GRACE';
      readonly playerId: string;
      readonly secondsLeft: number;
    }
  | {
      readonly type: 'PLAYER_BOT_TAKEOVER';
      readonly playerId: string;
    }
  | {
      readonly type: 'PLAYER_RECONNECTED';
      readonly playerId: string;
    }
  | {
      readonly type: 'PLAYER_EMOTE';
      readonly playerId: string;
      readonly emoteId: string;
      readonly timestamp: number;
    }
  | {
      readonly type: 'GAME_OVER';
      readonly roomCode: string;
      readonly leaderboard: ReadonlyArray<{ readonly id: string; readonly netWorth: number }>;
    };

// Hàm helper: serialize message thành JSON string
export function encodeMsg(msg: WsServerMessage): string {
  return JSON.stringify(msg);
}

// Hàm helper: parse JSON string thành WsClientMessage (throws nếu malformed)
export function decodeMsg(raw: string): WsClientMessage {
  return JSON.parse(raw) as WsClientMessage;
}
