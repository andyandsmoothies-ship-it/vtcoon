// [IMP-25/MSS][IMP-28/MSS] Admin Inspector & Health Evaluator Helpers
import type { RoomManager } from '../room_manager.js';
import { TurnPhase, type Room, type Player } from '../../domain/room.js';
import type {
  RoomHealthStatus,
  AdminPlayerSummary,
  AdminRoomSummary,
  AdminRoomDetail,
  AdminRoomLogEntry,
} from './admin_types.js';

export function evaluateRoomHealth(
  room: Room,
  violations: Array<{ type: string; message: string }> | undefined,
  rooms: RoomManager,
): { status: RoomHealthStatus; warningReason?: string } {
  if (violations && violations.length > 0) {
    const latest = violations[violations.length - 1];
    return { status: 'CRITICAL', warningReason: `[${latest?.type}] ${latest?.message}` };
  }
  for (const p of room.players) {
    if (p.balance < 0 && !p.bankrupt && room.phase !== TurnPhase.InsolvencyPhase) {
      return { status: 'CRITICAL', warningReason: `Số dư âm ngoài vỡ nợ (Người chơi ${p.id}: ${p.balance} Tr)` };
    }
    if (p.consecutiveDoubles > 2) {
      return { status: 'WARNING', warningReason: `Đổ đôi liên tiếp > 2 lần (Người chơi ${p.id})` };
    }
  }
  const reg = rooms.getRegistry(room.roomCode);
  if (reg && reg.size > 28) {
    return { status: 'CRITICAL', warningReason: `Số lượng BĐS vượt trần quy định: ${reg.size}/28` };
  }
  if (room.started && !room.players.every((p) => p.bankrupt)) {
    const lastAct = rooms.getLastActivity(room.roomCode);
    if (lastAct && Date.now() - lastAct > 60_000) {
      return { status: 'WARNING', warningReason: `Bàn chơi không có thao tác > 60s (Nghi ngờ kẹt lượt)` };
    }
  }
  return { status: 'NORMAL' };
}

function mapPlayers(room: Room, norm: string, rooms: RoomManager): AdminPlayerSummary[] {
  const reg = rooms.getRegistry(norm);
  const rankings = rooms.getRankings(norm);
  const netWorthMap = new Map(rankings.map((r) => [r.id, r.netWorth]));
  return room.players.map((p: Player) => {
    let propCount = 0;
    if (reg) {
      for (const ownerId of reg.values()) {
        if (ownerId === p.id) propCount++;
      }
    }
    return {
      id: p.id,
      balance: p.balance,
      position: p.position,
      isBot: Boolean(p.isBot),
      bankrupt: Boolean(p.bankrupt),
      propertyCount: propCount,
      netWorth: netWorthMap.get(p.id) ?? p.balance,
    };
  });
}

export function buildRoomSummary(
  room: Room,
  rooms: RoomManager,
  violations?: Array<{ type: string; message: string }>,
): AdminRoomSummary {
  const norm = room.roomCode;
  const health = evaluateRoomHealth(room, violations, rooms);
  return {
    roomCode: norm,
    hostId: room.hostId,
    started: room.started,
    phase: room.phase,
    round: room.round ?? 1,
    playerCount: room.players.length,
    players: mapPlayers(room, norm, rooms),
    treasuryPool: room.treasury,
    status: health.status,
    warningReason: health.warningReason,
    lastActivity: rooms.getLastActivity(norm) ?? Date.now(),
    activeTimersCount: rooms.getActiveTimers(norm)?.size ?? 0,
    hasAuction: Boolean(room.currentAuction),
  };
}

function buildPropertyStates(
  norm: string,
  rooms: RoomManager,
): Record<number, { ownerId?: string; level: number; isMortgaged: boolean }> {
  const reg = rooms.getRegistry(norm);
  const sm = rooms.getPropertyStates(norm);
  const propertyStates: Record<number, { ownerId?: string; level: number; isMortgaged: boolean }> = {};
  if (reg || sm) {
    for (let i = 0; i < 40; i++) {
      const ownerId = reg?.get(i);
      const st = sm?.get(i);
      if (ownerId || st) {
        propertyStates[i] = { ownerId, level: st?.level ?? 0, isMortgaged: Boolean(st?.isMortgaged) };
      }
    }
  }
  return propertyStates;
}

export function buildRoomDetail(
  rawRoomCode: string,
  rooms: RoomManager,
  violations?: Array<{ type: string; message: string }>,
): AdminRoomDetail | undefined {
  const room = rooms.getRoom(rawRoomCode);
  if (!room) return undefined;
  const norm = room.roomCode;
  const summary = buildRoomSummary(room, rooms, violations);
  return {
    ...summary,
    propertyStates: buildPropertyStates(norm, rooms),
    chanceDiscardCount: room.chanceDiscard?.length ?? 0,
    marketDiscardCount: room.marketDiscard?.length ?? 0,
  };
}

export function buildDiagnosticDump(
  rawRoomCode: string,
  rooms: RoomManager,
  violations: Array<{ type: string; message: string }> | undefined,
  auditLogs: AdminRoomLogEntry[],
): Record<string, unknown> | undefined {
  const detail = buildRoomDetail(rawRoomCode, rooms, violations);
  if (!detail) return undefined;
  return {
    exportedAt: Date.now(),
    roomCode: detail.roomCode,
    seed: 12345,
    metrics: {
      playerCount: detail.playerCount,
      round: detail.round,
      phase: detail.phase,
      treasuryPool: detail.treasuryPool,
      status: detail.status,
    },
    violations: violations ?? [],
    players: detail.players,
    propertyStates: detail.propertyStates,
    auditLogs,
  };
}
