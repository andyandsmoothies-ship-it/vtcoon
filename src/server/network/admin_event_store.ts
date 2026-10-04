// [UC-ADM-MOD] Admin Event & Invariant Violations Store
import type { PersistentRoomLogger } from '../logging/persistent_room_logger.js';
import {
  MAX_ROOM_LOGS,
  type AdminRoomLogEntry,
} from './admin_types.js';
import { normalizeRoomCode } from './admin_security.js';

export class AdminEventStore {
  private readonly roomLogs = new Map<string, AdminRoomLogEntry[]>();
  private readonly roomViolations = new Map<string, Array<{ type: string; message: string; timestamp: number }>>();

  constructor(private readonly roomLogger: PersistentRoomLogger) {}

  recordRoomEvent(
    rawRoomCode: string,
    entry: Omit<AdminRoomLogEntry, 'id' | 'roomCode' | 'timestamp'> & { timestamp?: number; playerId?: string },
  ): AdminRoomLogEntry {
    const norm = normalizeRoomCode(rawRoomCode);
    const timestamp = entry.timestamp ?? Date.now();
    const id = `log_${timestamp}_${Math.random().toString(36).substring(2, 7)}`;
    const fullEntry: AdminRoomLogEntry = {
      id,
      roomCode: norm,
      timestamp,
      source: entry.source,
      action: entry.action,
      payloadSummary: entry.payloadSummary,
      ...(entry.playerId ? { playerId: entry.playerId } : {}),
    };

    this.roomLogger.appendEvent(norm, fullEntry);

    let list = this.roomLogs.get(norm);
    if (!list) {
      list = [];
      this.roomLogs.set(norm, list);
    }
    list.push(fullEntry);
    if (list.length > MAX_ROOM_LOGS) list.shift();

    return fullEntry;
  }

  recordViolation(rawRoomCode: string, type: string, message: string): void {
    const norm = normalizeRoomCode(rawRoomCode);
    const now = Date.now();
    let violations = this.roomViolations.get(norm);
    if (!violations) {
      violations = [];
      this.roomViolations.set(norm, violations);
    }
    violations.push({ type, message, timestamp: now });
    if (violations.length > MAX_ROOM_LOGS) {
      violations.shift();
    }
  }

  getRecentLogs(rawRoomCode: string, playerId?: string): AdminRoomLogEntry[] {
    const norm = normalizeRoomCode(rawRoomCode);
    const all = this.roomLogs.get(norm) ?? [];
    if (!playerId) return [...all];
    return all.filter((l) => l.playerId === playerId);
  }

  getViolations(rawRoomCode: string): Array<{ type: string; message: string; timestamp: number }> | undefined {
    const v = this.roomViolations.get(normalizeRoomCode(rawRoomCode));
    return v ? [...v] : undefined;
  }

  clearRoom(rawRoomCode: string): void {
    const norm = normalizeRoomCode(rawRoomCode);
    this.roomLogs.delete(norm);
    this.roomViolations.delete(norm);
  }
}
