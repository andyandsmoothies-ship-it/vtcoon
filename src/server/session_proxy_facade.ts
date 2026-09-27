// [IMP-210] Dynamic Map Facades for GameRoomSession
// 100% Map protocol parity ([Symbol.iterator], entries, keys, values, size, forEach, clear, get, set, has, delete)
import type { GameRoomSession } from './game_room_session.js';
import type { AuctionResult } from './room_manager.js';
import { BotPersonality } from '../domain/bot/bot_engine.js';

interface Clearable {
  clear(): void;
}

function isClearable(obj: unknown): obj is Clearable {
  return obj != null && typeof obj === 'object' && 'clear' in obj && typeof (obj as Clearable).clear === 'function';
}

export class SessionFieldMapFacade<T> extends Map<string, T> {
  private readonly sessions: Map<string, GameRoomSession>;
  private readonly field: keyof GameRoomSession;
  private readonly isOptionalField: boolean;

  constructor(sessions: Map<string, GameRoomSession>, field: keyof GameRoomSession) {
    super();
    this.sessions = sessions;
    this.field = field;
    this.isOptionalField = field === 'auction' || field === 'lastAuctionResult' || field === 'rolledThisTurn';
  }

  private resolveSession(code: string): GameRoomSession | undefined {
    if (!code) return undefined;
    return this.sessions.get(code) ?? this.sessions.get(code.toUpperCase()) ?? this.sessions.get(code.toLowerCase());
  }

  private getFieldValue(s: GameRoomSession): T | undefined {
    if (this.field === 'rolledThisTurn') {
      return s.rawRolledThisTurn as T | undefined;
    }
    return Reflect.get(s, this.field) as T | undefined;
  }

  private setFieldValue(s: GameRoomSession, value: unknown): void {
    if (this.field === 'rolledThisTurn') {
      s.rolledThisTurn = value as boolean | undefined;
      return;
    }
    Reflect.set(s, this.field, value);
    if (this.field === 'lastAuctionResult') {
      s.room.lastAuctionResult = value as AuctionResult | undefined;
    }
  }

  override get(code: string): T | undefined {
    const s = this.resolveSession(code);
    return s ? this.getFieldValue(s) : undefined;
  }

  override set(code: string, value: T): this {
    if (!code) return this;
    const s = this.resolveSession(code);
    if (s) {
      this.setFieldValue(s, value);
    }
    return this;
  }

  override has(code: string): boolean {
    const s = this.resolveSession(code);
    if (!s) return false;
    return this.isOptionalField ? this.getFieldValue(s) !== undefined : true;
  }

  override delete(code: string): boolean {
    const s = this.resolveSession(code);
    if (!s) return false;
    const val = this.getFieldValue(s);
    if (this.field === 'activeTimers') {
      s.clearTimers();
    } else if (this.field === 'rolledThisTurn') {
      s.rolledThisTurn = undefined;
    } else if (isClearable(val)) {
      val.clear();
    } else {
      this.setFieldValue(s, undefined);
    }
    return true;
  }

  override clear(): void {
    for (const s of this.sessions.values()) {
      const val = this.getFieldValue(s);
      if (this.field === 'activeTimers') {
        s.clearTimers();
      } else if (this.field === 'rolledThisTurn') {
        s.rolledThisTurn = undefined;
      } else if (isClearable(val)) {
        val.clear();
      } else {
        this.setFieldValue(s, undefined);
      }
    }
  }

  override get size(): number {
    if (!this.isOptionalField) return this.sessions.size;
    let count = 0;
    for (const s of this.sessions.values()) {
      if (this.getFieldValue(s) !== undefined) count++;
    }
    return count;
  }

  override entries(): MapIterator<[string, T]> {
    const map = new Map<string, T>();
    for (const [code, s] of this.sessions.entries()) {
      const val = this.getFieldValue(s);
      if (!this.isOptionalField || val !== undefined) {
        map.set(code, val as T);
      }
    }
    return map.entries();
  }

  override keys(): MapIterator<string> {
    const map = new Map<string, unknown>();
    for (const [code, s] of this.sessions.entries()) {
      if (!this.isOptionalField || this.getFieldValue(s) !== undefined) {
        map.set(code, undefined);
      }
    }
    return map.keys();
  }

  override values(): MapIterator<T> {
    const map = new Map<string, T>();
    for (const s of this.sessions.values()) {
      const val = this.getFieldValue(s);
      if (!this.isOptionalField || val !== undefined) {
        map.set(s.roomCode, val as T);
      }
    }
    return map.values();
  }

  override [Symbol.iterator](): MapIterator<[string, T]> {
    return this.entries();
  }

  override forEach(callbackfn: (value: T, key: string, map: Map<string, T>) => void, thisArg?: unknown): void {
    for (const [code, s] of this.sessions.entries()) {
      const val = this.getFieldValue(s);
      if (!this.isOptionalField || val !== undefined) {
        callbackfn.call(thisArg, val as T, code, this);
      }
    }
  }
}

export class BotPersonalityMapFacade extends Map<string, BotPersonality> {
  private readonly sessions: Map<string, GameRoomSession>;

  constructor(sessions: Map<string, GameRoomSession>) {
    super();
    this.sessions = sessions;
  }

  private resolveKey(key: string): { session?: GameRoomSession; botId: string } {
    if (!key) return { botId: key };
    const idx = key.indexOf(':');
    if (idx !== -1) {
      const rc = key.slice(0, idx);
      const bid = key.slice(idx + 1);
      const s = this.sessions.get(rc) ?? this.sessions.get(rc.toUpperCase()) ?? this.sessions.get(rc.toLowerCase());
      return { session: s, botId: bid };
    }
    return { botId: key };
  }

  override get(key: string): BotPersonality | undefined {
    if (!key) return undefined;
    const { session, botId } = this.resolveKey(key);
    if (session) {
      return session.botPersonalities.get(botId) ?? session.botPersonalities.get(key);
    }
    for (const s of this.sessions.values()) {
      const found = s.botPersonalities.get(key);
      if (found !== undefined) return found;
    }
    return undefined;
  }

  override set(key: string, val: BotPersonality): this {
    if (!key) return this;
    const { session, botId } = this.resolveKey(key);
    if (session) {
      session.botPersonalities.set(botId, val);
      return this;
    }
    for (const s of this.sessions.values()) {
      if (s.botPersonalities.has(key)) {
        s.botPersonalities.set(key, val);
        return this;
      }
    }
    return this;
  }

  override has(key: string): boolean {
    if (!key) return false;
    const { session, botId } = this.resolveKey(key);
    if (session) {
      return session.botPersonalities.has(botId) || session.botPersonalities.has(key);
    }
    for (const s of this.sessions.values()) {
      if (s.botPersonalities.has(key)) return true;
    }
    return false;
  }

  override delete(key: string): boolean {
    if (!key) return false;
    const { session, botId } = this.resolveKey(key);
    if (session) {
      return session.botPersonalities.delete(botId) || session.botPersonalities.delete(key);
    }
    for (const s of this.sessions.values()) {
      if (s.botPersonalities.delete(key)) return true;
    }
    return false;
  }

  override clear(): void {
    for (const s of this.sessions.values()) {
      s.botPersonalities.clear();
    }
  }

  override get size(): number {
    let count = 0;
    for (const s of this.sessions.values()) {
      count += s.botPersonalities.size;
    }
    return count;
  }

  override entries(): MapIterator<[string, BotPersonality]> {
    const map = new Map<string, BotPersonality>();
    for (const [rc, s] of this.sessions.entries()) {
      for (const [bid, val] of s.botPersonalities.entries()) {
        map.set(`${rc}:${bid}`, val);
      }
    }
    return map.entries();
  }

  override keys(): MapIterator<string> {
    const map = new Map<string, BotPersonality>();
    for (const [rc, s] of this.sessions.entries()) {
      for (const bid of s.botPersonalities.keys()) {
        map.set(`${rc}:${bid}`, BotPersonality.Aggressive);
      }
    }
    return map.keys();
  }

  override values(): MapIterator<BotPersonality> {
    const map = new Map<string, BotPersonality>();
    for (const [rc, s] of this.sessions.entries()) {
      for (const [bid, val] of s.botPersonalities.entries()) {
        map.set(`${rc}:${bid}`, val);
      }
    }
    return map.values();
  }

  override [Symbol.iterator](): MapIterator<[string, BotPersonality]> {
    return this.entries();
  }

  override forEach(callbackfn: (value: BotPersonality, key: string, map: Map<string, BotPersonality>) => void, thisArg?: unknown): void {
    for (const [rc, s] of this.sessions.entries()) {
      for (const [bid, val] of s.botPersonalities.entries()) {
        callbackfn.call(thisArg, val, `${rc}:${bid}`, this);
      }
    }
  }
}

export function createSessionFieldProxy<T>(
  sessions: Map<string, GameRoomSession>,
  field: keyof GameRoomSession,
): Map<string, T> {
  return new SessionFieldMapFacade<T>(sessions, field);
}

export function createBotPersonalityMapFacade(sessions: Map<string, GameRoomSession>): Map<string, BotPersonality> {
  return new BotPersonalityMapFacade(sessions);
}
