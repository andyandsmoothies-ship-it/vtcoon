# Plan IMP-382: Server-Driven Domain Events & Zero-Heuristic Financial Dispatch (Ticket IMP-382)

## 0. Auto-Slicing Roadmap (Micro-Slices Matrix)
- **Slice 1 (IMP-382 - SPRINT 1 THIS TICKET)**: Server-driven domainEvents in delta, explicit bond lifecycle emission, and client direct event router (-90% heuristic code).
- **Slice 2 (IMP-383 - SPRINT 2)**: 3D Board Unified Overlay (<BoardPropertyMarkersOverlay />) and legacy single-mesh deletion.
- **Slice 3 (IMP-384 - SPRINT 3)**: AGENTS CONSTITUTION upgrade: Anti-Single-Consumer Helper rule and Deep Module exemption.

## 0.1. Context & Architectural Rationale
- **Vấn đề cốt lõi**: Client hiện phải đóng vai "thám tử tài chính" ngồi suy đoán số dư delta (`diff`), dẫn đến Netting Collision: khi người chơi vừa qua GO (+2000 M) vừa tất toán trái phiếu (-3689 M), hiệu số -1689 M rơi vào `FEE_PAID: TAX` ("nộp phạt Kho Bạc").
- **Giải pháp Deep Module**: Server phát sinh mảng tuần tự `delta.domainEvents` tức thời. Client `game_event_financial_synthesizer.ts` định tuyến trực tiếp 1-1 sang Badge/Log mà không cần giải toán số dư. Bảo toàn tuyệt đối authoritative snapshot khi reconnect.

## 1. Physical Target Files & Honest LOC Accounting
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/server/delta_types.ts` | Tier 1 (Domain/Server/Logic) | 134 | 148 | +14 | <= 400 | Safe (< 160 LOC) |
| `src/server/delta_mapper.ts` | Tier 1 (Domain/Server/Logic) | 267 | 269 | +2 | <= 400 | Safe (< 300 LOC) |
| `src/server/bond_manager.ts` | Tier 1 (Domain/Server/Logic) | 239 | 250 | +11 | <= 400 | Safe (< 280 LOC) |
| `src/client/events/game_event_financial_synthesizer.ts` | Tier 1 (Domain/Server/Logic) | 275 | 298 | +23 | <= 400 | Safe (< 310 LOC) |
| `tests/server/imp382_server_domain_events.test.ts` | Living Test | 0 | 120 | +120 | <= 600 | 🆕 Tệp mới |
| `tests/client/imp382_client_domain_events_router.test.ts` | Living Test | 0 | 150 | +150 | <= 600 | 🆕 Tệp mới |
| `docs/FEATURE_MAP.md` | SSOT Matrix | 91 | 93 | +2 | N/A | Cập nhật Pillar 10 |

## 2. In-Action Visual Capture Registration
- Scenario: Non-UI (Server-Domain & Client-Event-Router architectural pipeline). Visual capture bypassed per Gotcha 13; mechanical verification via check_evidence.mjs.

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
- **TC-382.01 [UC-SERVER-DOMAIN-EVENT-GENERATION/MSS]:** Given room with active bond at maturity, When handleBondMaturity is called with sufficient balance, Then pushes BOND_REPAID event to room.pendingDomainEvents with exact principal, interest, repayAmount, and timestamp.
- **TC-382.02 [UC-DELTA-MAPPER-FLUSH-DISPATCH/MSS]:** Given room with pendingDomainEvents, When buildRoomDelta is executed, Then populates delta.domainEvents in causal order and flushes room.pendingDomainEvents to empty array.
- **TC-382.03 [UC-CLIENT-ROUTER-DIRECT-MAPPING/MSS]:** Given delta with server domainEvents, When synthesizeFinancialEvents processes BOND_REPAID payload, Then maps directly to SynthesizedGameEvent without falling into tax fees.
- **TC-382.04 [UC-COMPOSITE-BIDIRECTIONAL-CASHFLOW/MSS]:** Given player passing GO (+2000 M salary) while simultaneously repaying maturing bond (-3689 M) yielding composite net diff -1689 M, When synthesizeFinancialEvents processes delta, Then synthesizes both BOND_REPAID and GO_SALARY without spurious FEE_PAID: TAX fallthrough.
- **TC-382.05 [UC-RECONNECT-EPHEMERAL-ISOLATION/MSS]:** Given client reconnecting receiving FULL_STATE_RESYNC delta with undefined domainEvents, When synthesizeFinancialEvents runs, Then emits zero phantom transient badges preserving authoritative store balance.

### Station 2: Implementation (GREEN)

#### Task 1: Bổ sung ServerDomainEvent schema và domainEvents vào DeltaPayload
**Target physical file**: `src/server/delta_types.ts`
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

export interface ServerDomainEvent {
  readonly type: 'BOND_REPAID' | 'BOND_ISSUED';
  readonly playerId: string;
  readonly principal: number;
  readonly interest?: number;
  readonly repayAmount: number;
  readonly roundsLeft?: number;
  readonly interestRate?: number;
  readonly trancheId?: string;
  readonly timestamp: number;
}
>>>>
```
```typescript
<<<<
  lastTradeResult?: TradeResultInfo | null;
}
====
  lastTradeResult?: TradeResultInfo | null;
  domainEvents?: ReadonlyArray<ServerDomainEvent>;
}
>>>>
```

#### Task 2: Thu hoạch và dọn dẹp domainEvents trong DeltaMapper
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
    ...((room as Room & { pendingDomainEvents?: ServerDomainEvent[] }).pendingDomainEvents?.length ? { domainEvents: [...(room as Room & { pendingDomainEvents?: ServerDomainEvent[] }).pendingDomainEvents!] } : {}),
  });
  const eventHolder = room as Room & { pendingDomainEvents?: ServerDomainEvent[] };
  if (eventHolder.pendingDomainEvents) eventHolder.pendingDomainEvents = [];
}
>>>>
```

#### Task 3: Server phát sinh sự kiện Trái phiếu chính danh
**Target physical file**: `src/server/bond_manager.ts`
```typescript
<<<<
  if (player.balance >= player.bondContract.repayAmount) {
    player.balance -= player.bondContract.repayAmount;
    const interestPaid = Math.max(0, player.bondContract.repayAmount - player.bondContract.principal);
    room.treasury = (room.treasury ?? 0) + interestPaid;
    player.bondContract = null;
    return;
  }
====
  if (player.balance >= player.bondContract.repayAmount) {
    const { principal, repayAmount, trancheId } = player.bondContract;
    player.balance -= repayAmount;
    const interestPaid = Math.max(0, repayAmount - principal);
    room.treasury = (room.treasury ?? 0) + interestPaid;
    player.bondContract = null;
    const roomEvents = room as Room & { pendingDomainEvents?: Array<{ type: 'BOND_REPAID'; playerId: string; principal: number; interest: number; repayAmount: number; trancheId?: string; timestamp: number }> };
    (roomEvents.pendingDomainEvents ??= []).push({
      type: 'BOND_REPAID',
      playerId: player.id,
      principal,
      interest: interestPaid,
      repayAmount,
      trancheId,
      timestamp: Date.now(),
    });
    return;
  }
>>>>
```

#### Task 4: Client Event Router trực tiếp từ Server Domain Events
**Target physical file**: `src/client/events/game_event_financial_synthesizer.ts`
```typescript
<<<<
  const bondEvents = extractBondEvents(delta, prevState, nextState, payers, receivers, timestamp);
  const buyoutEvents = extractCompulsoryBuyoutEvents(delta, prevState, nextState, payers, receivers, timestamp);
====
  const serverBondEvents: SynthesizedGameEvent[] = [];
  if (delta.domainEvents && delta.domainEvents.length > 0) {
    for (const dev of delta.domainEvents) {
      if (dev.type === 'BOND_REPAID') {
        serverBondEvents.push({
          type: SynthesizedGameEventType.BOND_REPAID,
          timestamp: dev.timestamp ?? timestamp,
          playerId: dev.playerId,
          principal: dev.principal,
          interest: dev.interest ?? 0,
          totalRepaid: dev.repayAmount,
          repayAmount: dev.repayAmount,
          ...(dev.trancheId ? { trancheId: dev.trancheId } : {}),
        });
        const pIdx = payers.findIndex((py) => py.id === dev.playerId);
        if (pIdx !== -1) {
          payers[pIdx]!.diff += dev.repayAmount;
          if (payers[pIdx]!.diff === 0) payers.splice(pIdx, 1);
        }
      }
    }
  }
  const bondEvents = serverBondEvents.length > 0 ? serverBondEvents : extractBondEvents(delta, prevState, nextState, payers, receivers, timestamp);
  const buyoutEvents = extractCompulsoryBuyoutEvents(delta, prevState, nextState, payers, receivers, timestamp);
>>>>
```

### Station 3: Pre-Filter & Machine Gates
- `npm run prefilter -- src/server/delta_types.ts src/server/delta_mapper.ts src/server/bond_manager.ts src/client/events/game_event_financial_synthesizer.ts`
- `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_382_SERVER_DRIVEN_DOMAIN_EVENTS.md`

### Station 4: Chaos Sentinel & Invariant Verification
- `npm run sentinel -- --ticket IMP-382 --test tests/client/imp382_client_domain_events_router.test.ts`
- `node scripts/check_evidence.mjs IMP-382`

## 4. Definition of Done (DoD)
1. 100% 5/5 contract tests pass trong cả 2 test suites server và client.
2. Netting collision được triệt tiêu hoàn toàn khi kiểm thử ca đa dòng tiền đồng thời (inflow + outflow).
3. Không hồi quy living test suites tài chính (`imp380`, `imp368`, `imp366`).
4. `FEATURE_MAP.md` được cập nhật tại Pillar 10.
