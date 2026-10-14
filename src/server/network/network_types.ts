// [UC-GAME-001/MSS][UC-GAME-003/MSS][UC-GAME-004/MSS]
// Wire Protocol Types — WsClientMessage / WsServerMessage
// Tất cả message qua WebSocket đều phải khớp union này.

import type {
  ReasonCode,
  WsErrorMessageReason,
  WsClientMessage,
  WsServerMessage,
} from '../../domain/protocol/index.js';

export type {
  ReasonCode,
  WsErrorMessageReason,
  WsClientMessage,
  WsServerMessage,
};

// Hàm helper: serialize message thành JSON string
export function encodeMsg(msg: WsServerMessage): string {
  return JSON.stringify(msg);
}
