// [UC-GAME-009/MSS][TC-NET03.1/MSS][TC-NET03.2/MSS]
// Delta Broadcaster — Trích xuất DeltaPayload, tính toán Sparse Diff (< 10KB) và phát sóng WSS
import type { RoomManager } from '../room_manager.js';
import type { SessionManager, DeltaPayload, CellDelta, PlayerDelta } from '../session_manager.js';
import type { WsServerMessage } from './network_types.js';

export const MAX_DELTA_BYTES = 10_240; // 10KB NFR Baseline

export interface BroadcastResult {
  readonly delta: DeltaPayload;
  readonly byteLength: number;
  readonly isSparse: boolean;
}

export type BroadcastFn = (roomCode: string, msg: WsServerMessage) => void;

export function getPayloadByteLength(payload: unknown): number {
  const json = JSON.stringify(payload);
  return new TextEncoder().encode(json).byteLength;
}

export function isCellEqual(a: CellDelta, b: CellDelta): boolean {
  return (
    a.index === b.index &&
    (a.ownerId ?? null) === (b.ownerId ?? null) &&
    (a.level ?? 0) === (b.level ?? 0) &&
    Boolean(a.isETC) === Boolean(b.isETC) &&
    Boolean(a.isMortgaged) === Boolean(b.isMortgaged) &&
    (a.unbuiltRounds ?? 0) === (b.unbuiltRounds ?? 0)
  );
}

export function isPlayerEqual(a: PlayerDelta, b: PlayerDelta): boolean {
  return (
    a.id === b.id &&
    a.position === b.position &&
    a.balance === b.balance &&
    Boolean(a.bankrupt) === Boolean(b.bankrupt) &&
    Boolean(a.isBot) === Boolean(b.isBot) &&
    (a.overdraftRoundsLeft ?? 0) === (b.overdraftRoundsLeft ?? 0) &&
    Boolean(a.inAudit) === Boolean(b.inAudit)
  );
}

export function buildSparseDelta(prev: DeltaPayload, next: DeltaPayload): DeltaPayload {
  const prevCellMap = new Map<number, CellDelta>();
  for (const c of prev.cells) {
    prevCellMap.set(c.index, c);
  }

  const changedCells: CellDelta[] = [];
  for (const nextCell of next.cells) {
    const prevCell = prevCellMap.get(nextCell.index);
    if (!prevCell || !isCellEqual(prevCell, nextCell)) {
      const cellToSend: CellDelta = {
        ...nextCell,
        ...(Boolean(prevCell?.isMortgaged) && !nextCell.isMortgaged ? { isMortgaged: false } : {}),
      };
      changedCells.push(cellToSend);
    }
  }

  let changedPlayers: PlayerDelta[] | undefined;
  if (next.players) {
    const prevPlayerMap = new Map<string, PlayerDelta>();
    for (const p of prev.players ?? []) {
      prevPlayerMap.set(p.id, p);
    }
    const players: PlayerDelta[] = [];
    for (const nextP of next.players) {
      const prevP = prevPlayerMap.get(nextP.id);
      if (!prevP || !isPlayerEqual(prevP, nextP)) {
        players.push(nextP);
      }
    }
    changedPlayers = players;
  }

  return {
    tick: next.tick,
    cells: changedCells,
    ...(changedPlayers !== undefined ? { players: changedPlayers } : {}),
    ...(next.currentPlayerIndex !== undefined ? { currentPlayerIndex: next.currentPlayerIndex } : {}),
    ...(next.currentTurnPlayerId !== undefined ? { currentTurnPlayerId: next.currentTurnPlayerId } : {}),
    ...(next.dice !== undefined ? { dice: next.dice } : {}),
    ...(next.auction !== undefined ? { auction: next.auction } : {}),
    ...(next.roomStarted !== undefined ? { roomStarted: next.roomStarted } : {}),
  };
}

export class DeltaBroadcaster {
  private readonly roomManager: RoomManager;
  private readonly sessionManager: SessionManager;
  private readonly broadcastFn?: BroadcastFn;
  private readonly lastFullDeltas = new Map<string, DeltaPayload>();
  private readonly ticks = new Map<string, number>();

  constructor(
    roomManager: RoomManager,
    sessionManager: SessionManager,
    broadcastFn?: BroadcastFn,
  ) {
    this.roomManager = roomManager;
    this.sessionManager = sessionManager;
    this.broadcastFn = broadcastFn;
  }

  getNextTick(roomCode: string): number {
    const current = this.ticks.get(roomCode) ?? 0;
    const next = current + 1;
    this.ticks.set(roomCode, next);
    return next;
  }

  getCurrentTick(roomCode: string): number {
    return this.ticks.get(roomCode) ?? 0;
  }

  getLastFullDelta(roomCode: string): DeltaPayload | undefined {
    return this.lastFullDeltas.get(roomCode);
  }

  broadcastRoomDelta(
    roomCode: string,
    options?: { forceFull?: boolean },
  ): BroadcastResult | undefined {
    const tick = this.getNextTick(roomCode);
    const fullDelta = this.roomManager.createDelta(roomCode, tick);
    if (!fullDelta) return undefined;

    const prevDelta = this.lastFullDeltas.get(roomCode);
    this.lastFullDeltas.set(roomCode, fullDelta);

    let payloadToSend: DeltaPayload;
    let isSparse = false;

    if (options?.forceFull || !prevDelta) {
      payloadToSend = fullDelta;
      isSparse = false;
    } else {
      payloadToSend = buildSparseDelta(prevDelta, fullDelta);
      isSparse = true;
    }

    const byteLength = getPayloadByteLength(payloadToSend);
    if (byteLength >= MAX_DELTA_BYTES) {
      console.warn(
        `[WARN_DELTA_OVERSIZED] Delta payload size ${byteLength} bytes exceeds ${MAX_DELTA_BYTES} limit for room ${roomCode}`,
      );
    }

    this.sessionManager.broadcastDelta(payloadToSend);

    if (this.broadcastFn) {
      const msg: WsServerMessage = {
        type: 'STATE_DELTA',
        delta: payloadToSend,
      };
      this.broadcastFn(roomCode, msg);
    }

    return {
      delta: payloadToSend,
      byteLength,
      isSparse,
    };
  }

  resyncClient(
    roomCode: string,
    socket: { send: (data: string) => void },
  ): DeltaPayload | undefined {
    const tick = this.getNextTick(roomCode);
    const fullDelta = this.roomManager.createDelta(roomCode, tick);
    if (!fullDelta) return undefined;

    this.lastFullDeltas.set(roomCode, fullDelta);

    const msg: WsServerMessage = {
      type: 'STATE_DELTA',
      delta: fullDelta,
    };
    socket.send(JSON.stringify(msg));
    return fullDelta;
  }

  clearRoom(roomCode: string): void {
    this.lastFullDeltas.delete(roomCode);
    this.ticks.delete(roomCode);
  }
}
