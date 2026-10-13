# Plan IMP-382: Authoritative Server Domain Events Wire Pipeline (Ticket IMP-382)

## 0. Auto-Slicing Roadmap (Sprint 1 Architecture)
- **Slice 1A (IMP-382 - THIS TICKET)**: Authoritative Server Domain Events Wire Pipeline (Domain Core Schema, Pure CQS Delta Mapper, Sparse Broadcaster Retention, and Post-Broadcast Lifecycle Cleanup).
- **Slice 1B (IMP-383 - NEXT TICKET)**: Authoritative Bond Lifecycle Emission (`bond_manager.ts` dual emission: `BOND_REPAID` & `BOND_DEFAULT`) & Client Zero-Heuristic Financial Dispatch (`game_event_financial_synthesizer.ts`).
- **Sprint 2 (IMP-384)**: 3D Board Unified Overlay (<BoardPropertyMarkersOverlay />) and legacy single-mesh deletion.
- **Sprint 3 (IMP-385)**: AGENTS CONSTITUTION upgrade: Anti-Single-Consumer Helper rule and Deep Module exemption.

## 0.1. Context & Architectural Rationale
- **Vấn đề cốt lõi**: Khắc phục các khiếm khuyết trong đường ống vận chuyển sự kiện mạng: Loại bỏ hoàn toàn Hố đen Sparse Delta (`buildSparseDelta` làm rơi rụng sự kiện), bảo toàn nguyên lý Command-Query Separation (CQS) cho Mapper, thanh lọc Domain Model (không rò rỉ cờ mạng `emittedTick`), và loại trừ triệt để Race Condition "cướp sự kiện" giữa `resyncClient` và `broadcastRoomDelta`.
- **CQS & Broadcast-Driven Lifecycle Invariant**: `buildDeltaFromRoom` thuần túy đóng vai trò chiếu trạng thái (Pure Query Projection, 0 mutation). Sự kiện chỉ được dọn dẹp khỏi `room.pendingDomainEvents` sau khi `broadcastRoomDelta` đã hoàn tất phát sóng tới toàn bộ client trong phòng. Reconnect unicast (`resyncClient`) không bao giờ được xóa sự kiện của phòng.

## 1. Physical Target Files & Honest LOC Accounting
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/domain/room.ts` | Tier 1 (Domain/Server/Logic) | 295 | 306 | +11 | <= 400 | Warning (>= 300 LOC) |
| `src/server/delta_types.ts` | Tier 1 (Domain/Server/Logic) | 134 | 137 | +3 | <= 400 | Safe (< 160 LOC) |
| `src/server/delta_mapper.ts` | Tier 1 (Domain/Server/Logic) | 267 | 269 | +2 | <= 400 | Safe (< 300 LOC) |
| `src/server/network/delta_broadcaster.ts` | Tier 1 (Domain/Server/Logic) | 232 | 238 | +6 | <= 400 | Safe (< 280 LOC) |
| `tests/server/imp382_server_domain_events_pipeline.test.ts` | Living Test | 0 | 140 | +140 | <= 600 | 🆕 Tệp mới |
| `docs/FEATURE_MAP.md` | SSOT Matrix | 91 | 93 | +2 | N/A | Cập nhật Pillar 10 |

## 2. In-Action Visual Capture Registration
- Scenario: Non-UI (Server Domain Events Wire Architecture). Visual capture bypassed per Gotcha 13; mechanical verification via check_evidence.mjs.

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
- **TC-382.01 [UC-ROOM-DOMAIN-EVENTS-HOLDER/MSS]:** Given Room with pendingDomainEvents containing canonical ServerDomainEvent (type: 'BOND_REPAID'), When inspected, Then matches readonly ServerDomainEvent schema with zero dirty casts.
- **TC-382.02 [UC-DELTA-MAPPER-PURE-CQS-PROJECTION/MSS]:** Given Room with pendingDomainEvents, When buildRoomDelta runs multiple times consecutively, Then returns identical domainEvents without mutating or clearing room.pendingDomainEvents.
- **TC-382.03 [UC-DELTA-PAYLOAD-OPTIONS-FORWARDING/MSS]:** Given DeltaPayloadOptions containing domainEvents, When buildDeltaPayload is called, Then forwards domainEvents intact into the returned DeltaPayload.
- **TC-382.04 [UC-SPARSE-DELTA-DOMAIN-EVENTS-RETENTION/MSS]:** Given previous and next DeltaPayload where next contains domainEvents, When buildSparseDelta computes diff, Then returned sparse delta preserves domainEvents intact.
- **TC-382.05 [UC-BROADCAST-CLEANUP-AFTER-SEND/MSS]:** Given room with pendingDomainEvents, When broadcastRoomDelta runs, Then broadcasted delta contains domainEvents and room.pendingDomainEvents is deleted from room context afterwards.
- **TC-382.06 [UC-RESYNC-NON-DESTRUCTIVE-ISOLATION/MSS]:** Given room with pendingDomainEvents, When resyncClient is invoked for reconnecting socket, Then full delta is sent and room.pendingDomainEvents remains intact for subsequent room broadcasts.

### Station 2: Implementation (GREEN)

#### Task 1: Khai báo ServerDomainEvent schema thuần khiết và pendingDomainEvents trên Room
**Target physical file**: `src/domain/room.ts`
```typescript
<<<<
  pendingTransitWheel?:       { playerId: string; cellIndex: number; timestamp: number } | null;
  lastTransitResult?:         { playerId: string; cellIndex: number; outcome: string; targetCell?: number; payout?: number; boostSteps?: number } | null;
  lastTradeResult?:           TradeResultInfo | null;
}
====
  pendingTransitWheel?:       { playerId: string; cellIndex: number; timestamp: number } | null;
  lastTransitResult?:         { playerId: string; cellIndex: number; outcome: string; targetCell?: number; payout?: number; boostSteps?: number } | null;
  lastTradeResult?:           TradeResultInfo | null;
  pendingDomainEvents?:       ServerDomainEvent[];
}

export interface ServerDomainEvent {
  readonly type: 'BOND_REPAID' | 'BOND_DEFAULT';
  readonly playerId: string;
  readonly principal: number;
  readonly interest?: number;
  readonly repayAmount?: number;
  readonly trancheId?: string;
  readonly timestamp: number;
}
>>>>
```

#### Task 2: Cập nhật DeltaPayload và DeltaPayloadOptions
**Target physical file**: `src/server/delta_types.ts`
```typescript
<<<<
  TradeResultInfo,
} from '../domain/room.js';
export type { TradeResultInfo };
====
  TradeResultInfo,
  ServerDomainEvent,
} from '../domain/room.js';
export type { TradeResultInfo, ServerDomainEvent };
>>>>
```
```typescript
<<<<
  readonly lastTransitResult?:    { playerId: string; cellIndex: number; outcome: TransitWheelOutcome | string; targetCell?: number; payout?: number; boostSteps?: number } | null;
  readonly lastTradeResult?:      TradeResultInfo | null;
}
====
  readonly lastTransitResult?:    { playerId: string; cellIndex: number; outcome: TransitWheelOutcome | string; targetCell?: number; payout?: number; boostSteps?: number } | null;
  readonly lastTradeResult?:      TradeResultInfo | null;
  readonly domainEvents?:         ReadonlyArray<ServerDomainEvent>;
}
>>>>
```
```typescript
<<<<
  lastTransitResult?: { playerId: string; cellIndex: number; outcome: TransitWheelOutcome | string; targetCell?: number; payout?: number; boostSteps?: number } | null;
  lastTradeResult?: TradeResultInfo | null;
}
====
  lastTransitResult?: { playerId: string; cellIndex: number; outcome: TransitWheelOutcome | string; targetCell?: number; payout?: number; boostSteps?: number } | null;
  lastTradeResult?: TradeResultInfo | null;
  domainEvents?: ReadonlyArray<ServerDomainEvent>;
}
>>>>
```

#### Task 3: Thu hoạch domainEvents thuần túy CQS trong DeltaMapper
**Target physical file**: `src/server/delta_mapper.ts`
```typescript
<<<<
    pendingTransitWheel: room.pendingTransitWheel ?? null,
    lastTransitResult: room.lastTransitResult ?? null,
    lastTradeResult: room.lastTradeResult ?? null,
  });
}
====
    pendingTransitWheel: room.pendingTransitWheel ?? null,
    lastTransitResult: room.lastTransitResult ?? null,
    lastTradeResult: room.lastTradeResult ?? null,
    ...(room.pendingDomainEvents && room.pendingDomainEvents.length > 0 ? { domainEvents: [...room.pendingDomainEvents] } : {}),
  });
}
>>>>
```
```typescript
<<<<
      ...(tickOrOptions.pendingTransitWheel !== undefined ? { pendingTransitWheel: tickOrOptions.pendingTransitWheel } : {}),
      ...(tickOrOptions.lastTransitResult !== undefined ? { lastTransitResult: tickOrOptions.lastTransitResult } : {}),
      ...(tickOrOptions.lastTradeResult !== undefined ? { lastTradeResult: tickOrOptions.lastTradeResult } : {}),
    };
====
      ...(tickOrOptions.pendingTransitWheel !== undefined ? { pendingTransitWheel: tickOrOptions.pendingTransitWheel } : {}),
      ...(tickOrOptions.lastTransitResult !== undefined ? { lastTransitResult: tickOrOptions.lastTransitResult } : {}),
      ...(tickOrOptions.lastTradeResult !== undefined ? { lastTradeResult: tickOrOptions.lastTradeResult } : {}),
      ...(tickOrOptions.domainEvents !== undefined ? { domainEvents: tickOrOptions.domainEvents } : {}),
    };
>>>>
```

#### Task 4: Chuyển tiếp Sparse Delta và dọn dẹp sự kiện sau Broadcast
**Target physical file**: `src/server/network/delta_broadcaster.ts`
```typescript
<<<<
    ...(next.pendingTransitWheel !== undefined ? { pendingTransitWheel: next.pendingTransitWheel } : {}),
    ...(next.lastTransitResult !== undefined ? { lastTransitResult: next.lastTransitResult } : {}),
  };
}
====
    ...(next.pendingTransitWheel !== undefined ? { pendingTransitWheel: next.pendingTransitWheel } : {}),
    ...(next.lastTransitResult !== undefined ? { lastTransitResult: next.lastTransitResult } : {}),
    ...(next.domainEvents !== undefined ? { domainEvents: next.domainEvents } : {}),
  };
}
>>>>
```
```typescript
<<<<
      this.broadcastFn(roomCode, msg);
    }

    return {
====
      this.broadcastFn(roomCode, msg);
    }

    const ctx = this.roomManager?.getContext?.(roomCode);
    if (ctx?.room.pendingDomainEvents) {
      delete ctx.room.pendingDomainEvents;
    }

    return {
>>>>
```

### Station 3: Pre-Filter & Machine Gates
- `npm run prefilter -- src/domain/room.ts src/server/delta_types.ts src/server/delta_mapper.ts src/server/network/delta_broadcaster.ts`
- `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_382_SERVER_DRIVEN_DOMAIN_EVENTS.md`

### Station 4: Chaos Sentinel & Invariant Verification
- `npm run sentinel -- --ticket IMP-382 --test tests/server/imp382_server_domain_events_pipeline.test.ts`
- `node scripts/check_evidence.mjs IMP-382`

## 4. Definition of Done (DoD)
1. 100% 6/6 contract tests pass trong test suite `imp382_server_domain_events_pipeline.test.ts`.
2. Không sử dụng ép kiểu dirty cast (`as any`, `as Room & ...`).
3. `buildDeltaFromRoom` thuần túy CQS, không mutation hay xóa dữ liệu phòng chơi.
4. `buildSparseDelta` chuyển tiếp `domainEvents` nguyên vẹn qua đường truyền socket.
5. `broadcastRoomDelta` dọn dẹp sạch sự kiện sau khi gửi, `resyncClient` không làm mất sự kiện của phòng.
6. `FEATURE_MAP.md` được cập nhật tại Pillar 10.
