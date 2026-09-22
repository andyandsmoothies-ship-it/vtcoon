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
import type { ReconnectManager } from './reconnect_manager.js';

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

export function resolveTurnStepName(
  phaseOrRoom: TurnPhase | Room,
  auditOrPlayer?: boolean | { inAudit?: boolean } | Player,
  started?: boolean,
): string {
  const isStarted = typeof phaseOrRoom === 'object' && phaseOrRoom !== null && 'started' in phaseOrRoom
    ? phaseOrRoom.started
    : (started !== undefined ? started : true);
  if (!isStarted) return 'Sảnh chờ';

  const phase = typeof phaseOrRoom === 'object' && phaseOrRoom !== null && 'phase' in phaseOrRoom
    ? phaseOrRoom.phase
    : phaseOrRoom;

  const inAudit = auditOrPlayer === true ||
    (typeof auditOrPlayer === 'object' && auditOrPlayer !== null && 'inAudit' in auditOrPlayer && Boolean(auditOrPlayer.inAudit));

  if (inAudit && phase === TurnPhase.WaitingRoll) {
    return 'Đang trong diện Kiểm toán (Đóng bảo lãnh / Thẻ ngoại giao)';
  }

  switch (phase) {
    case TurnPhase.WaitingRoll: return 'Chờ gieo xúc xắc';
    case TurnPhase.ActionPhase: return 'Đang chọn hành động (Mua đất / Nâng cấp / Kết thúc lượt)';
    case TurnPhase.AuctionPhase: return 'Đang diễn ra phiên đấu giá BĐS';
    case TurnPhase.PropertyManagement: return 'Quản lý tài sản (Xây dựng / Thế chấp)';
    case TurnPhase.InsolvencyPhase: return 'Xử lý khủng hoảng nợ / Bán tài sản trả nợ';
    case TurnPhase.BankruptcyCheck: return 'Kiểm tra điều kiện phá sản';
    case TurnPhase.HosePhase: return 'Thực hiện sự kiện Vòi Rồng / Thiên tai';
    case TurnPhase.TurnEnd: return 'Kết thúc lượt';
    default: return String(phase);
  }
}

export interface BuildRoomSummaryOptions {
  readonly timeRemainingProvider?: (rc: string) => number;
  readonly reconnectManager?: ReconnectManager;
}

function mapPlayers(
  room: Room,
  norm: string,
  rooms: RoomManager,
  reconnectManager?: ReconnectManager,
): AdminPlayerSummary[] {
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
    const inGracePeriod = reconnectManager ? reconnectManager.isPlayerInGrace(norm, p.id) : false;
    const graceSecondsLeft = reconnectManager ? reconnectManager.getGraceRemainingSeconds(norm, p.id) : 0;
    const isConnected = !inGracePeriod && !p.isBot;
    return {
      id: p.id,
      balance: p.balance,
      position: p.position,
      isBot: Boolean(p.isBot),
      bankrupt: Boolean(p.bankrupt),
      propertyCount: propCount,
      netWorth: netWorthMap.get(p.id) ?? p.balance,
      inGracePeriod,
      graceSecondsLeft,
      isConnected,
    };
  });
}

export function buildRoomSummary(
  room: Room,
  rooms: RoomManager,
  violations?: Array<{ type: string; message: string }>,
  opts?: BuildRoomSummaryOptions,
): AdminRoomSummary {
  const norm = room.roomCode;
  const health = evaluateRoomHealth(room, violations, rooms);
  const turnSecondsLeft = opts?.timeRemainingProvider ? opts.timeRemainingProvider(norm) : 0;
  const currentTurnPlayerId = room.started ? room.players[room.currentPlayerIndex]?.id : undefined;
  const currentTurnStepName = room.started
    ? resolveTurnStepName(room.phase, room.players[room.currentPlayerIndex], room.started)
    : 'Sảnh chờ';

  return {
    roomCode: norm,
    hostId: room.hostId,
    started: room.started,
    phase: room.phase,
    round: room.round ?? 1,
    playerCount: room.players.length,
    players: mapPlayers(room, norm, rooms, opts?.reconnectManager),
    treasuryPool: room.treasury,
    status: health.status,
    warningReason: health.warningReason,
    lastActivity: rooms.getLastActivity(norm) ?? Date.now(),
    activeTimersCount: rooms.getActiveTimers(norm)?.size ?? 0,
    hasAuction: Boolean(room.currentAuction),
    currentTurnPlayerId,
    currentTurnStepName,
    turnSecondsLeft,
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
  opts?: BuildRoomSummaryOptions,
): AdminRoomDetail | undefined {
  const room = rooms.getRoom(rawRoomCode);
  if (!room) return undefined;
  const norm = room.roomCode;
  const summary = buildRoomSummary(room, rooms, violations, opts);
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
