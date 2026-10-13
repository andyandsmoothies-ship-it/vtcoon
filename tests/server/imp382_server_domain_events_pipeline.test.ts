// [TC-382.01..06/MSS][UC-ROOM-DOMAIN-EVENTS-HOLDER][UC-DELTA-MAPPER-PURE-CQS-PROJECTION]
// [UC-DELTA-PAYLOAD-OPTIONS-FORWARDING][UC-SPARSE-DELTA-DOMAIN-EVENTS-RETENTION]
// [UC-BROADCAST-CLEANUP-AFTER-SEND][UC-RESYNC-NON-DESTRUCTIVE-ISOLATION]
// Ticket IMP-382: Authoritative Server Domain Events Wire Pipeline Contract Suite
import { describe, it, expect } from 'vitest';
import { RoomManager } from '../../src/server/room_manager.js';
import { SessionManager } from '../../src/server/session_manager.js';
import { buildRoomDelta } from '../../src/server/room_manager_queries.js';
import { buildDeltaPayload } from '../../src/server/delta_mapper.js';
import {
  DeltaBroadcaster,
  buildSparseDelta,
} from '../../src/server/network/delta_broadcaster.js';
import type { WsServerMessage } from '../../src/server/network/network_types.js';
import type { DeltaPayload, DeltaPayloadOptions } from '../../src/server/delta_types.js';

export interface ServerDomainEvent {
  readonly type: 'BOND_REPAID' | 'BOND_DEFAULT';
  readonly playerId: string;
  readonly principal: number;
  readonly interest?: number;
  readonly repayAmount?: number;
  readonly trancheId?: string;
  readonly timestamp: number;
}

declare module '../../src/domain/room.js' {
  interface Room {
    pendingDomainEvents?: ServerDomainEvent[];
  }
}

declare module '../../src/server/delta_types.js' {
  interface DeltaPayload {
    readonly domainEvents?: ReadonlyArray<ServerDomainEvent>;
  }
  interface DeltaPayloadOptions {
    domainEvents?: ReadonlyArray<ServerDomainEvent>;
  }
}

describe('IMP-382: Authoritative Server Domain Events Wire Pipeline Contract Suite', () => {
  it('[TC-382.01/MSS][UC-ROOM-DOMAIN-EVENTS-HOLDER/MSS] Given Room with pendingDomainEvents containing canonical ServerDomainEvent (type: BOND_REPAID), When inspected, Then matches readonly ServerDomainEvent schema with zero dirty casts', () => {
    const roomMgr = new RoomManager(42);
    const room = roomMgr.createRoom('host-p1');
    const bondRepaidEvent: ServerDomainEvent = {
      type: 'BOND_REPAID',
      playerId: 'host-p1',
      principal: 2000,
      interest: 200,
      repayAmount: 2200,
      trancheId: 'tranche_a',
      timestamp: 1700000000,
    };

    room.pendingDomainEvents = [bondRepaidEvent];

    expect(room.pendingDomainEvents).toHaveLength(1);
    expect(room.pendingDomainEvents?.[0]?.type).toBe('BOND_REPAID');
    expect(room.pendingDomainEvents?.[0]?.principal).toBe(2000);
    expect(room.pendingDomainEvents?.[0]?.repayAmount).toBe(2200);
  });

  it('[TC-382.02/MSS][UC-DELTA-MAPPER-PURE-CQS-PROJECTION/MSS] Given Room with pendingDomainEvents, When buildRoomDelta runs multiple times consecutively, Then returns identical domainEvents without mutating or clearing room.pendingDomainEvents', () => {
    const roomMgr = new RoomManager(42);
    const room = roomMgr.createRoom('p1');
    const bondEvent: ServerDomainEvent = {
      type: 'BOND_REPAID',
      playerId: 'p1',
      principal: 1000,
      interest: 100,
      repayAmount: 1100,
      timestamp: 1700000000,
    };
    room.pendingDomainEvents = [bondEvent];
    const reg = roomMgr.getRegistry(room.roomCode)!;
    const sm = roomMgr.getPropertyStates(room.roomCode)!;

    const delta1 = buildRoomDelta(room, reg, sm, 1, roomMgr.auctions);
    const delta2 = buildRoomDelta(room, reg, sm, 2, roomMgr.auctions);

    expect(delta1.domainEvents).toEqual([bondEvent]);
    expect(delta2.domainEvents).toEqual([bondEvent]);
    expect(room.pendingDomainEvents).toEqual([bondEvent]);
    expect(delta1.domainEvents).not.toBe(room.pendingDomainEvents);
  });

  it('[TC-382.03/MSS][UC-DELTA-PAYLOAD-OPTIONS-FORWARDING/MSS] Given DeltaPayloadOptions containing domainEvents, When buildDeltaPayload is called, Then forwards domainEvents intact into the returned DeltaPayload', () => {
    const bondDefaultEvent: ServerDomainEvent = {
      type: 'BOND_DEFAULT',
      playerId: 'p2',
      principal: 5000,
      timestamp: 1700000100,
    };
    const options: DeltaPayloadOptions = {
      tick: 10,
      cells: [],
      domainEvents: [bondDefaultEvent],
    };

    const payload = buildDeltaPayload(options);

    expect(payload.domainEvents).toBeDefined();
    expect(payload.domainEvents).toEqual([bondDefaultEvent]);
    expect(payload.domainEvents?.[0]?.type).toBe('BOND_DEFAULT');
    expect(payload.domainEvents?.[0]?.principal).toBe(5000);
  });

  it('[TC-382.04/MSS][UC-SPARSE-DELTA-DOMAIN-EVENTS-RETENTION/MSS] Given previous and next DeltaPayload where next contains domainEvents, When buildSparseDelta computes diff, Then returned sparse delta preserves domainEvents intact', () => {
    const prev: DeltaPayload = {
      tick: 1,
      cells: [],
    };
    const bondRepaidEvent: ServerDomainEvent = {
      type: 'BOND_REPAID',
      playerId: 'p1',
      principal: 3000,
      repayAmount: 3300,
      timestamp: 1700000200,
    };
    const next: DeltaPayload = {
      tick: 2,
      cells: [],
      domainEvents: [bondRepaidEvent],
    };

    const sparse = buildSparseDelta(prev, next);

    expect(sparse.domainEvents).toBeDefined();
    expect(sparse.domainEvents).toEqual([bondRepaidEvent]);
    expect(sparse.domainEvents?.[0]?.type).toBe('BOND_REPAID');
    expect(sparse.tick).toBe(2);
  });

  it('[TC-382.05/MSS][UC-BROADCAST-CLEANUP-AFTER-SEND/MSS] Given room with pendingDomainEvents, When broadcastRoomDelta runs, Then broadcasted delta contains domainEvents and room.pendingDomainEvents is deleted from room context afterwards', () => {
    const roomMgr = new RoomManager(42);
    const sessionMgr = new SessionManager();
    let lastBroadcastMsg: WsServerMessage | undefined;
    const broadcaster = new DeltaBroadcaster(roomMgr, sessionMgr, (_rc, msg) => {
      lastBroadcastMsg = msg;
    });

    const room = roomMgr.createRoom('p1');
    const bondEvent: ServerDomainEvent = {
      type: 'BOND_REPAID',
      playerId: 'p1',
      principal: 1500,
      repayAmount: 1650,
      timestamp: 1700000300,
    };
    room.pendingDomainEvents = [bondEvent];

    const result = broadcaster.broadcastRoomDelta(room.roomCode);

    expect(result?.delta.domainEvents).toEqual([bondEvent]);
    expect(lastBroadcastMsg?.type === 'STATE_DELTA' ? lastBroadcastMsg.delta.domainEvents : undefined).toEqual([bondEvent]);
    expect(room.pendingDomainEvents).toBeUndefined();
    expect(roomMgr.getContext(room.roomCode)?.room.pendingDomainEvents).toBeUndefined();
  });

  it('[TC-382.06/MSS][UC-RESYNC-NON-DESTRUCTIVE-ISOLATION/MSS] Given room with pendingDomainEvents, When resyncClient is invoked for reconnecting socket, Then full delta is sent and room.pendingDomainEvents remains intact for subsequent room broadcasts', () => {
    const roomMgr = new RoomManager(42);
    const sessionMgr = new SessionManager();
    const broadcaster = new DeltaBroadcaster(roomMgr, sessionMgr);
    const room = roomMgr.createRoom('p1');
    const bondEvent: ServerDomainEvent = {
      type: 'BOND_DEFAULT',
      playerId: 'p1',
      principal: 4000,
      timestamp: 1700000400,
    };
    room.pendingDomainEvents = [bondEvent];

    let sentData = '';
    const mockSocket = {
      send: (data: string) => {
        sentData = data;
      },
    };

    const resyncDelta = broadcaster.resyncClient(room.roomCode, mockSocket);
    const parsedMsg: { type: string; delta?: DeltaPayload } = JSON.parse(sentData);
    const parsedSentPayload = parsedMsg.delta;

    expect(resyncDelta?.domainEvents).toEqual([bondEvent]);
    expect(parsedSentPayload?.domainEvents).toEqual([bondEvent]);
    expect(room.pendingDomainEvents).toEqual([bondEvent]);
    expect(roomMgr.getContext(room.roomCode)?.room.pendingDomainEvents).toEqual([bondEvent]);
  });
});
