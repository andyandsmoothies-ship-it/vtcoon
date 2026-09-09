// [UC-GAME-006/MSS][UC-GAME-007/MSS][UC-GAME-008/MSS]
// ReconnectManager — Quản lý ánh xạ token -> session, ân hạn 60s và Bot tiếp quản
import type { RoomManager } from '../room_manager.js';
import type { SessionManager } from '../session_manager.js';
import { SessionState, GRACE_PERIOD_MS } from '../session_manager.js';
import { BotEngine } from '../../domain/bot/bot_engine.js';
import type { DeltaBroadcaster } from './delta_broadcaster.js';
import type { WsServerMessage, ReasonCode } from './network_types.js';

export interface ReconnectTokenRecord {
  readonly token: string;
  readonly playerId: string;
  readonly roomCode: string;
  readonly createdAt: number;
  expired: boolean;
}

export interface ReconnectManagerConfig {
  readonly rooms: RoomManager;
  readonly sessions: SessionManager;
  readonly broadcaster: DeltaBroadcaster;
  readonly broadcast: (roomCode: string, msg: WsServerMessage) => void;
  readonly gracePeriodMs?: number;
}

export type VerifyTokenResult =
  | { readonly success: true; readonly record: ReconnectTokenRecord }
  | { readonly success: false; readonly reasonCode: ReasonCode };

export class ReconnectManager {
  private readonly rooms: RoomManager;
  private readonly sessions: SessionManager;
  private readonly broadcaster: DeltaBroadcaster;
  private readonly broadcast: (roomCode: string, msg: WsServerMessage) => void;
  private readonly gracePeriodMs: number;

  /** token -> ReconnectTokenRecord */
  private readonly tokens = new Map<string, ReconnectTokenRecord>();
  /** key: `${roomCode}:${playerId}` -> token */
  private readonly playerTokens = new Map<string, string>();
  /** key: `${roomCode}:${playerId}` -> timer */
  private readonly graceTimers = new Map<string, NodeJS.Timeout>();
  /** key: `${roomCode}:${playerId}` -> start time */
  private readonly graceStartTimes = new Map<string, number>();

  constructor(config: ReconnectManagerConfig) {
    this.rooms = config.rooms;
    this.sessions = config.sessions;
    this.broadcaster = config.broadcaster;
    this.broadcast = config.broadcast;
    this.gracePeriodMs = config.gracePeriodMs ?? GRACE_PERIOD_MS;
  }

  getGracePeriodMs(): number {
    return this.gracePeriodMs;
  }

  /** Cấp phát reconnect token UUID v4 cho player trong phòng [UC-GAME-007/MSS] */
  generateToken(playerId: string, roomCode: string): string {
    const token = crypto.randomUUID();
    const record: ReconnectTokenRecord = {
      token,
      playerId,
      roomCode,
      createdAt: Date.now(),
      expired: false,
    };
    this.tokens.set(token, record);
    this.playerTokens.set(`${roomCode}:${playerId}`, token);
    return token;
  }

  /** Xác thực token [UC-GAME-007/MSS][UC-GAME-007/A1][UC-GAME-007/A2] */
  verifyToken(token: string, roomCode?: string): VerifyTokenResult {
    const record = this.tokens.get(token);
    if (!record) {
      return { success: false, reasonCode: 'TOKEN_INVALID' };
    }
    if (record.expired) {
      return { success: false, reasonCode: 'TOKEN_EXPIRED' };
    }
    if (roomCode && record.roomCode !== roomCode) {
      return { success: false, reasonCode: 'TOKEN_INVALID' };
    }
    return { success: true, record };
  }

  isTokenValid(token: string): boolean {
    const record = this.tokens.get(token);
    return Boolean(record && !record.expired);
  }

  expireToken(token: string): void {
    const record = this.tokens.get(token);
    if (record) record.expired = true;
  }

  /** Bắt đầu thời gian ân hạn 60s cho người chơi [UC-GAME-006/MSS] */
  startGracePeriod(roomCode: string, playerId: string): void {
    const key = `${roomCode}:${playerId}`;
    if (this.graceTimers.has(key)) return;

    const session = this.sessions.getSession(playerId);
    if (session) {
      session.state = SessionState.GracePeriod;
    }

    const secondsLeft = Math.ceil(this.gracePeriodMs / 1000);
    this.broadcast(roomCode, {
      type: 'PLAYER_GRACE',
      playerId,
      secondsLeft,
    });

    this.graceStartTimes.set(key, Date.now());
    const timer = setTimeout(() => {
      this.handleGraceExpired(roomCode, playerId);
    }, this.gracePeriodMs);

    this.graceTimers.set(key, timer);
  }

  /** Hủy thời gian ân hạn khi người chơi reconnect thành công [UC-GAME-007/MSS] */
  cancelGracePeriod(roomCode: string, playerId: string): boolean {
    const key = `${roomCode}:${playerId}`;
    const timer = this.graceTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.graceTimers.delete(key);
      this.graceStartTimes.delete(key);
      return true;
    }
    return false;
  }

  /** Xử lý khi hết hạn 60s: Bot tiếp quản và token hết hạn [UC-GAME-008/MSS] */
  handleGraceExpired(roomCode: string, playerId: string): void {
    const key = `${roomCode}:${playerId}`;
    const timer = this.graceTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.graceTimers.delete(key);
    }
    this.graceStartTimes.delete(key);

    const token = this.playerTokens.get(key);
    if (token) {
      const record = this.tokens.get(token);
      if (record) record.expired = true;
    }

    const session = this.sessions.getSession(playerId);
    if (session) {
      session.state = SessionState.Disconnected;
    }

    const room = this.rooms.getRoom(roomCode);
    if (room) {
      BotEngine.takeover(room, playerId);
      const current = room.players[room.currentPlayerIndex];
      if (current && current.id === playerId && current.isBot) {
        this.rooms.runBotTurn(roomCode);
      }
    }

    this.broadcast(roomCode, {
      type: 'PLAYER_BOT_TAKEOVER',
      playerId,
    });

    this.broadcaster.broadcastRoomDelta(roomCode);
  }

  isPlayerInGrace(roomCode: string, playerId: string): boolean {
    return this.graceTimers.has(`${roomCode}:${playerId}`);
  }

  getToken(playerId: string, roomCode: string): string | undefined {
    return this.playerTokens.get(`${roomCode}:${playerId}`);
  }

  clear(): void {
    for (const timer of this.graceTimers.values()) {
      clearTimeout(timer);
    }
    this.graceTimers.clear();
    this.graceStartTimes.clear();
    this.tokens.clear();
    this.playerTokens.clear();
  }
}
