// [UC-GAME-001/MSS][UC-GAME-003/MSS][UC-GAME-004/MSS]
// Wire Protocol Types — WsClientMessage / WsServerMessage
// Tất cả message qua WebSocket đều phải khớp union này.

import type { DeltaPayload } from '../session_manager.js';
import type { PlayerIntent } from '../intent_dispatcher.js';
import type { AdminRoomSummary, AdminRoomDetail, AdminRoomLogEntry, AdminArchivedRoomSummary, ServerVitals } from './admin_types.js';

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
  | 'INVALID_VALUE'
  | 'PRICE_BELOW_FLOOR'
  | 'EVEN_BUILDING_VIOLATION'
  | 'ADMIN_UNAUTHORIZED'
  | 'ADMIN_ROOM_NOT_FOUND'
  | 'TradeFrozen'
  | 'FREEZE_ACTIVE'
  | 'ACTION_REJECTED';

// ─── Client → Server ────────────────────────────────────────────
export type WsClientMessage =
  | { readonly type: 'CREATE_ROOM'; readonly playerId: string; readonly roomCode?: string }
  | { readonly type: 'JOIN_ROOM';   readonly playerId: string; readonly roomCode: string }
  | { readonly type: 'ADMIN_AUTH';  readonly secret: string }
  | { readonly type: 'ADMIN_GET_ROOMS' }
  | { readonly type: 'ADMIN_GET_ARCHIVED_ROOMS' }
  | { readonly type: 'ADMIN_GET_ARCHIVED_LOGS'; readonly roomCode: string; readonly timestamp?: number }
  | { readonly type: 'ADMIN_SUBSCRIBE_ROOM'; readonly roomCode: string }
  | { readonly type: 'ADMIN_UNSUBSCRIBE_ROOM'; readonly roomCode?: string }
  | { readonly type: 'ADMIN_TERMINATE_ROOM'; readonly roomCode: string; readonly reason?: string }
  | { readonly type: 'ADMIN_SYNC_CLOUD_STORAGE' }
  | {
      readonly type: 'START_GAME';
      readonly playerId: string;
      readonly roomCode: string;
      readonly bots?: ReadonlyArray<{
        readonly id: string;
        readonly name?: string;
        readonly personality?: string;
      }>;
    }
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
    }
  | {
      readonly type: 'LEAVE_ROOM';
      readonly playerId: string;
      readonly roomCode: string;
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
      readonly type: 'ROOM_STARTED';
      readonly roomCode: string;
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
      readonly type: 'LOBBY_UPDATE';
      readonly roomCode: string;
      readonly players: ReadonlyArray<{
        readonly id: string;
        readonly isHost: boolean;
        readonly slotIndex: number;
        readonly name?: string;
      }>;
    }
  | {
      readonly type: 'GAME_OVER';
      readonly roomCode: string;
      readonly leaderboard: ReadonlyArray<{ readonly id: string; readonly netWorth: number }>;
    }
  | { readonly type: 'ADMIN_AUTH_SUCCESS'; readonly message: string }
  | { readonly type: 'ADMIN_AUTH_FAILED'; readonly reason: string }
  | { readonly type: 'ADMIN_ROOM_LIST'; readonly rooms: readonly AdminRoomSummary[]; readonly vitals?: ServerVitals }
  | { readonly type: 'ADMIN_ARCHIVED_ROOM_LIST'; readonly rooms: readonly AdminArchivedRoomSummary[] }
  | {
      readonly type: 'ADMIN_ARCHIVED_LOG_DATA';
      readonly roomCode: string;
      readonly logs: readonly AdminRoomLogEntry[];
      readonly rawJsonl?: string;
    }
  | {
      readonly type: 'ADMIN_ROOM_DETAIL';
      readonly roomCode: string;
      readonly detail: AdminRoomDetail;
      readonly recentLogs: readonly AdminRoomLogEntry[];
    }
  | {
      readonly type: 'ADMIN_ROOM_LOG';
      readonly roomCode: string;
      readonly log: AdminRoomLogEntry;
    }
  | { readonly type: 'ADMIN_ACTION_SUCCESS'; readonly action: string; readonly roomCode: string }
  | { readonly type: 'ADMIN_ERROR'; readonly reasonCode: string; readonly message: string }
  | {
      readonly type: 'ADMIN_SYNC_CLOUD_RESULT';
      readonly success: boolean;
      readonly uploadedCount: number;
      readonly bucket: string;
      readonly message?: string;
      readonly error?: string;
      readonly reason?: string;
    };

// Hàm helper: serialize message thành JSON string
export function encodeMsg(msg: WsServerMessage): string {
  return JSON.stringify(msg);
}
