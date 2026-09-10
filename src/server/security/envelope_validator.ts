// [UC-SEC-003/MSS] Envelope Validator — Kiểm Chuẩn Cấu Trúc JSON & Chống Giá Trị Âm
import type { WsClientMessage } from '../network/network_types.js';
import { isValidEmoteId } from '../../domain/emotes.js';

export type EnvelopeValidationResult =
  | { success: true; message: WsClientMessage }
  | { success: false; reasonCode: 'INVALID_ENVELOPE' | 'INVALID_VALUE' | 'INVALID_INTENT'; ignore?: false }
  | { success: false; ignore: true };

const VALID_CLIENT_TYPES = new Set([
  'CREATE_ROOM', 'JOIN_ROOM', 'START_GAME', 'PONG', 'RECONNECT', 'INTENT', 'INTENT_REQUEST_RESYNC', 'EMOTE', 'LEAVE_ROOM',
]);

const CELL_INTENTS = new Set([
  'INTENT_UPGRADE', 'INTENT_UPGRADE_UTILITY', 'INTENT_DOWNGRADE', 'INTENT_MORTGAGE', 'INTENT_REDEEM',
]);

const VALID_INTENTS = new Set([
  ...CELL_INTENTS,
  'INTENT_ROLL', 'INTENT_BUY', 'INTENT_BUY_PROPERTY', 'INTENT_DECLINE', 'INTENT_BID',
  'INTENT_AUCTION_PASS', 'INTENT_UPGRADE_ETC', 'INTENT_TRADE_OFFER', 'INTENT_END_TURN',
  'INTENT_INVEST', 'INTENT_SKIP', 'INTENT_BAIL_OUT', 'INTENT_BANKRUPTCY',
]);

export class EnvelopeValidator {
  parseAndValidate(raw: string | Buffer): EnvelopeValidationResult {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw.toString());
    } catch {
      this.logSecurityEvent('SECURITY_MALFORMED_JSON', 'INVALID_ENVELOPE');
      return { success: false, reasonCode: 'INVALID_ENVELOPE' };
    }
    return this.validateEnvelope(parsed);
  }

  validateEnvelope(parsed: unknown): EnvelopeValidationResult {
    if (parsed === null || parsed === undefined) return { success: false, ignore: true };
    if (typeof parsed !== 'object' || Array.isArray(parsed)) {
      this.logSecurityEvent('SECURITY_INVALID_ENVELOPE', 'INVALID_ENVELOPE');
      return { success: false, reasonCode: 'INVALID_ENVELOPE' };
    }
    const obj = parsed as Record<string, unknown>;
    const type = obj['type'];
    if (typeof type !== 'string' || !VALID_CLIENT_TYPES.has(type)) {
      this.logSecurityEvent('SECURITY_INVALID_ENVELOPE', 'INVALID_ENVELOPE');
      return { success: false, reasonCode: 'INVALID_ENVELOPE' };
    }
    if (!this.checkValidNumbers(obj)) {
      this.logSecurityEvent('SECURITY_INVALID_VALUE', 'INVALID_VALUE');
      return { success: false, reasonCode: 'INVALID_VALUE' };
    }
    return this.validateFieldsByType(type, obj);
  }

  private checkValidNumbers(target: unknown): boolean {
    if (typeof target === 'number') return Number.isFinite(target) && target >= 0;
    if (typeof target !== 'object' || target === null) return true;
    const record = target as Record<string, unknown>;
    for (const key of Object.keys(record)) {
      const val = record[key];
      if (typeof val === 'number') {
        if (!Number.isFinite(val) || val < 0) return false;
        if (key === 'cellIndex' && (!Number.isInteger(val) || val < 0 || val >= 40)) return false;
        if ((key === 'amount' || key === 'price' || key === 'stake') && (!Number.isInteger(val) || val < 0)) return false;
      } else if (typeof val === 'object' && val !== null && !this.checkValidNumbers(val)) {
        return false;
      }
    }
    return true;
  }

  private validateFieldsByType(type: string, obj: Record<string, unknown>): EnvelopeValidationResult {
    const pId = obj['playerId'], rc = obj['roomCode'];
    if (type === 'CREATE_ROOM') {
      return typeof pId === 'string' && pId.length > 0
        ? { success: true, message: { type, playerId: pId, ...(typeof rc === 'string' && rc ? { roomCode: rc } : {}) } }
        : { success: false, reasonCode: 'INVALID_ENVELOPE' };
    }
    if (type === 'JOIN_ROOM') {
      return typeof pId === 'string' && typeof rc === 'string' && pId.length > 0 && rc.length > 0
        ? { success: true, message: { type, playerId: pId, roomCode: rc } }
        : { success: false, reasonCode: 'INVALID_ENVELOPE' };
    }
    if (type === 'START_GAME') {
      if (typeof pId !== 'string' || typeof rc !== 'string' || pId.length === 0 || rc.length === 0) {
        return { success: false, reasonCode: 'INVALID_ENVELOPE' };
      }
      const rawBots = obj['bots'];
      let bots: Array<{ id: string; name?: string; personality?: string }> | undefined;
      if (Array.isArray(rawBots)) {
        bots = [];
        for (const b of rawBots) {
          if (typeof b === 'object' && b !== null && typeof (b as Record<string, unknown>).id === 'string') {
            const botObj = b as Record<string, unknown>;
            const botId = (botObj.id as string).trim();
            if (botId.length > 0) {
              bots.push({
                id: botId,
                ...(typeof botObj.name === 'string' && botObj.name.trim().length > 0 ? { name: botObj.name.trim() } : {}),
                ...(typeof botObj.personality === 'string' && botObj.personality.trim().length > 0 ? { personality: botObj.personality.trim() } : {}),
              });
            }
          }
        }
      }
      return { success: true, message: { type, playerId: pId, roomCode: rc, ...(bots ? { bots } : {}) } };
    }
    if (type === 'RECONNECT') {
      const token = obj['reconnectToken'];
      return typeof token === 'string' && token.length > 0
        ? { success: true, message: { type, reconnectToken: token, roomCode: typeof rc === 'string' ? rc : undefined } }
        : { success: false, reasonCode: 'INVALID_ENVELOPE' };
    }
    if (type === 'PONG') {
      return { success: true, message: { type, playerId: typeof pId === 'string' ? pId : '', roomCode: typeof rc === 'string' ? rc : '' } };
    }
    if (type === 'INTENT_REQUEST_RESYNC') {
      return typeof pId === 'string' && typeof rc === 'string' && pId.length > 0 && rc.length > 0
        ? { success: true, message: { type, roomCode: rc, playerId: pId } }
        : { success: false, reasonCode: 'INVALID_ENVELOPE' };
    }
    if (type === 'EMOTE') {
      const emoteId = obj['emoteId'];
      return typeof pId === 'string' && typeof rc === 'string' && pId.length > 0 && rc.length > 0 && isValidEmoteId(emoteId)
        ? { success: true, message: { type, roomCode: rc, playerId: pId, emoteId } }
        : { success: false, reasonCode: 'INVALID_ENVELOPE' };
    }
    if (type === 'LEAVE_ROOM') {
      return typeof pId === 'string' && typeof rc === 'string' && pId.length > 0 && rc.length > 0
        ? { success: true, message: { type, playerId: pId, roomCode: rc } }
        : { success: false, reasonCode: 'INVALID_ENVELOPE' };
    }
    return this.validateIntentEnvelope(obj);
  }

  private validateIntentEnvelope(obj: Record<string, unknown>): EnvelopeValidationResult {
    const raw = obj['intent'];
    if (!raw || typeof raw !== 'object') return { success: false, reasonCode: 'INVALID_INTENT' };
    const it = raw as Record<string, unknown>;
    if (typeof it['type'] !== 'string' || !VALID_INTENTS.has(it['type'])) {
      return { success: false, reasonCode: 'INVALID_INTENT' };
    }
    const roomCode = obj['roomCode'], playerId = obj['playerId'];
    if (typeof roomCode !== 'string' || !roomCode || typeof playerId !== 'string' || !playerId) {
      return { success: false, reasonCode: 'INVALID_ENVELOPE' };
    }
    if (CELL_INTENTS.has(it['type']) && typeof it['cellIndex'] !== 'number') {
      return { success: false, reasonCode: 'INVALID_ENVELOPE' };
    }
    if (it['type'] === 'INTENT_BID' && typeof it['amount'] !== 'number') {
      return { success: false, reasonCode: 'INVALID_ENVELOPE' };
    }
    if (it['type'] === 'INTENT_INVEST' && typeof it['stake'] !== 'number') {
      return { success: false, reasonCode: 'INVALID_ENVELOPE' };
    }
    if (it['type'] === 'INTENT_TRADE_OFFER') {
      const ok = typeof it['sellerId'] === 'string' && it['sellerId'] &&
        typeof it['buyerId'] === 'string' && it['buyerId'] &&
        typeof it['cellIndex'] === 'number' && typeof it['price'] === 'number';
      if (!ok) return { success: false, reasonCode: 'INVALID_ENVELOPE' };
    }
    return {
      success: true,
      message: { type: 'INTENT', roomCode, playerId, intent: raw as import('../intent_dispatcher.js').PlayerIntent },
    };
  }

  private logSecurityEvent(event: string, reasonCode: string): void {
    console.warn(JSON.stringify({ event, reasonCode, timestamp: Date.now() }));
  }
}
