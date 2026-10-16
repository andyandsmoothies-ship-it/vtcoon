# PLAN_IMP_416: Server Transitional Shims Decommission & Direct Protocol Wiring (Nhóm 3 Giai đoạn 3)

## 1. Context & Architectural Goal
- **Source Strategy Reports**: [`ARCHITECTURAL_AUDIT_AND_AI_NATIVE_FACADE_BLUEPRINT.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/analysis/ARCHITECTURAL_AUDIT_AND_AI_NATIVE_FACADE_BLUEPRINT.md) (Mục 5.4 `[DEBT-SERVER-SHIMS]`: Thu hồi 3 Transitional Shims `< 30 LOC` ở Server) and GEMINI.md Section 2 (Deep Modules & Middle-Man Passthrough Ban).
- **Classification**: Tier 1.5 Structural Refactor & Type Rewiring (0 FSM transitions, 0 economic/cashflow formula changes, 0 DOM layout shifts).
- **Subsystem Boundary Isolation**: Slices Group 3 into cohesive `src/server/` and `src/domain/protocol/` boundaries across 2 cohesive families (`src/server`, `src/domain/protocol`), strictly satisfying `rules_scope.mjs` mechanical gate (0 cross-subsystem contamination, <= 3 cohesive units).
- **Problems**:
  1. **Trivial Middle-Man Shims `< 30 LOC`**: Three transitional files (`src/server/delta_types.ts` [14 LOC], `src/server/network/network_types.ts` [22 LOC], and `src/server/network/admin_types.ts` [24 LOC]) linger as redundant passthrough proxies solely re-exporting symbols from `src/domain/protocol/index.js`, violating the Anti-Micro-Splintering & Middle-Man Ban Iron Law.
  2. **Fragmented Wire Encoding**: `encodeMsg(msg: WsServerMessage)` is stranded in `src/server/network/network_types.ts` rather than being co-located with `WsServerMessage` inside the canonical wire protocol facade `src/domain/protocol/index.ts`.
  3. **Scattered Admin Types & Constants**: `MAX_ROOM_LOGS` and `AdminManagerOptions` reside in the passthrough shim `admin_types.ts` rather than in their authoritative consumers (`admin_event_store.ts` và `admin_manager.ts`).
  4. **The 45 Living Test Collision Trap ([ADV-01])**: Over 45 living test files in `tests/**` (plus `imp286` ambient module augmentation and `imp392` TC-392.07) import the shims. Sudden physical deletion would fracture test suites.
  5. **Admin Re-export Trap in `admin_manager.ts`**: `tests/client/admin_repro.test.ts#L4` imports `AdminRoomDetail, AdminRoomLogEntry` from `admin_manager.js`. Truncating re-exports breaks compilation (TS2614).
- **Architectural Solution & Seam Discipline (Two-Stage Decoupling - Phase 1)**:
  1. **Canonical Re-homing of `encodeMsg`**: Relocate `encodeMsg(msg: WsServerMessage): string` into [`src/domain/protocol/index.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/protocol/index.ts), pairing serializer with schema validators.
  2. **Local Re-homing of Admin Constructs**: Move `export const MAX_ROOM_LOGS = 100;` to [`src/server/network/admin_event_store.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/admin_event_store.ts) (re-exported by `admin_manager.ts`), and move `export interface AdminManagerOptions` directly to [`src/server/network/admin_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/admin_manager.ts).
  3. **Preserve Admin Facade Re-exports**: `admin_manager.ts` re-exports `AdminRoomDetail, AdminRoomLogEntry, RoomHealthStatus, AdminPlayerSummary, AdminRoomSummary, AdminArchivedRoomSummary, ServerVitals` from `@protocol` to protect `admin_repro.test.ts`.
  4. **Direct Protocol Wiring**: Rewire all 19 production server callers across `src/server/network/`, `src/server/logging/`, `src/server/storage/`, `src/server/security/`, and `src/server/delta_mapper.ts` to import directly from `src/domain/protocol/index.js`.
  5. **Downstream Re-export Protection**: Rewire `src/server/delta_mapper.ts` to `export * from '../domain/protocol/index.js'`, preserving 100% of transitive re-exports through `session_manager.ts`.
  6. **Slim Down to 1-Line Pure Stubs**: Reduce `delta_types.ts` (1 LOC), `network_types.ts` (1 LOC), and `admin_types.ts` (3 LOC) to lean backward-compatible re-export stubs (exempt from < 30 LOC rule per GEMINI.md barrel/pure-type exception). Phase 2 (IMP-417) will modernize the 45 test files and physically delete the stubs.
  7. **Pure-Move Quarantine**: Preserve 100% wire encoding, JSON serialization, room logging, socket dispatch, and delta mapping behavior. Zero new business logic in `admin_manager.ts`.

### Principles Applied
- **Deep Modules & Seam Discipline** -> Decoupled 100% of production callers from transitional shims to consume the authoritative facade `src/domain/protocol/index.js`.
- **100% DTO & Call-Site Wiring** -> Reconnected every production caller to canonical protocol interfaces with zero dropped properties or orphaned types.
- **Pure-Move Quarantine** -> Preserves 100% compile-time types, runtime functions, and wire serialization with zero semantic shifts.
- **Equivalence-Partition Testing** -> Partitioned contract tests across shim stubbing, wire serializer identity, admin options wiring, zero cycle, and backward compat.

---

## 2. Target Files & Honest LOC Accounting

| File Path | Tier | Current LOC | Expected LOC | Net Delta | Max Allowed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/domain/protocol/index.ts` | Tier 1 (Protocol Facade) | 152 | 156 | ~+4 | 400 | Safe (Re-homed encodeMsg) |
| `src/server/delta_types.ts` | Tier 1 (Transitional Shim) | 14 | 1 | -13 | 400 | Safe (Minimal Stub) |
| `src/server/network/network_types.ts` | Tier 1 (Transitional Shim) | 22 | 1 | -21 | 400 | Safe (Minimal Stub) |
| `src/server/network/admin_types.ts` | Tier 1 (Transitional Shim) | 24 | 3 | -21 | 400 | Safe (Minimal Stub) |
| `src/server/delta_mapper.ts` | Tier 1 (Server Mapper) | 270 | 270 | ~+0 | 400 | Safe (Rewired Import) |
| `src/server/network/admin_event_store.ts` | Tier 1 (Server Event Store) | 76 | 78 | ~+2 | 400 | Safe (Re-homed MAX_ROOM_LOGS) |
| `src/server/network/admin_manager.ts` | Tier 1 (Server Manager) | 350 | 345 | ~-5 | 400 | Warning (Buffer Zone >= 300 LOC) |
| `src/server/network/admin_inspector.ts` | Tier 1 (Server Helper) | 211 | 211 | ~+0 | 400 | Safe (Rewired Import) |
| `src/server/network/admin_message_handler.ts` | Tier 1 (Server Handler) | 213 | 213 | ~+0 | 400 | Safe (Rewired Import) |
| `src/server/network/admin_vitals.ts` | Tier 1 (Server Helper) | 48 | 48 | ~+0 | 400 | Safe (Rewired Import) |
| `src/server/network/delta_broadcaster.ts` | Tier 1 (Server Broadcaster) | 242 | 242 | ~+0 | 400 | Safe (Rewired Import) |
| `src/server/network/reconnect_manager.ts` | Tier 1 (Server Manager) | 287 | 287 | ~+0 | 400 | Safe (Rewired Import) |
| `src/server/network/wss_connection_handler.ts` | Tier 1 (Server Handler) | 96 | 96 | ~+0 | 400 | Safe (Rewired Import) |
| `src/server/network/wss_intent_handler.ts` | Tier 1 (Server Handler) | 147 | 147 | ~+0 | 400 | Safe (Rewired Import) |
| `src/server/network/wss_lobby_handlers.ts` | Tier 1 (Server Handler) | 308 | 308 | ~+0 | 400 | Warning (Buffer Zone >= 300 LOC) |
| `src/server/network/wss_server.ts` | Tier 1 (Server Core) | 345 | 345 | ~+0 | 400 | Warning (Buffer Zone >= 300 LOC) |
| `src/server/network/wss_server_lifecycle.ts` | Tier 1 (Server Helper) | 146 | 146 | ~+0 | 400 | Safe (Rewired Import) |
| `src/server/security/envelope_validator.ts` | Tier 1 (Server Security) | 202 | 202 | ~+0 | 400 | Safe (Rewired Import) |
| `src/server/security/intent_guard.ts` | Tier 1 (Server Security) | 87 | 87 | ~+0 | 400 | Safe (Rewired Import) |
| `src/server/logging/persistent_room_logger.ts` | Tier 1 (Server Logging) | 280 | 280 | ~+0 | 400 | Safe (Rewired Import) |
| `src/server/logging/room_logger_cloud_sync.ts` | Tier 1 (Server Logging) | 203 | 203 | ~+0 | 400 | Safe (Rewired Import) |
| `src/server/logging/room_logger_reindexer.ts` | Tier 1 (Server Logging) | 157 | 157 | ~+0 | 400 | Safe (Rewired Import) |
| `src/server/storage/supabase_log_sync.ts` | Tier 1 (Server Storage) | 278 | 278 | ~+0 | 400 | Safe (Rewired Import) |
| `tests/server/imp416_transitional_shims_decommission.test.ts` | Living Test | 0 | 180 | ~+180 | 600 | Safe (New Living Test) |

---

## 3. Lean Type & Exported Symbol Contracts

**Target physical file**: `src/domain/protocol/index.ts` (Modified)
```typescript
// Re-homes wire message serialization helper alongside WsServerMessage
export function encodeMsg(msg: WsServerMessage): string {
  return JSON.stringify(msg);
}
```

**Target physical file**: `src/server/network/admin_event_store.ts` (Modified)
```typescript
// Re-homes admin event log capacity constant
export const MAX_ROOM_LOGS = 100;
```

**Target physical file**: `src/server/network/admin_manager.ts` (Modified)
```typescript
// Re-exports admin interfaces directly from protocol to protect consumers (admin_repro.test.ts)
export type {
  RoomHealthStatus,
  AdminPlayerSummary,
  AdminRoomSummary,
  AdminRoomDetail,
  AdminRoomLogEntry,
  AdminArchivedRoomSummary,
  ServerVitals,
} from '../../domain/protocol/index.js';
export { MAX_ROOM_LOGS } from './admin_event_store.js';

// Re-homes AdminManager configuration interface
export interface AdminManagerOptions {
  readonly roomManager: RoomManager;
  readonly secret?: string;
  readonly onTerminateRoom?: (roomCode: string, reason?: string) => void;
  readonly loggerDir?: string;
}
```

**Target physical file**: `src/server/delta_types.ts` (Transformed to Minimal Pure Re-Export Stub)
```typescript
export * from '../domain/protocol/index.js';
```

**Target physical file**: `src/server/network/network_types.ts` (Transformed to Minimal Pure Re-Export Stub)
```typescript
export { encodeMsg, type WsClientMessage, type WsServerMessage, type ReasonCode, type WsErrorMessageReason } from '../../domain/protocol/index.js';
```

**Target physical file**: `src/server/network/admin_types.ts` (Transformed to Minimal Pure Re-Export Stub)
```typescript
export type { RoomHealthStatus, AdminPlayerSummary, AdminRoomSummary, AdminRoomDetail, AdminRoomLogEntry, AdminArchivedRoomSummary, ArchivedRoomStatus, ServerVitals } from '../../domain/protocol/index.js';
export { type AdminManagerOptions } from './admin_manager.js';
export { MAX_ROOM_LOGS } from './admin_event_store.js';
```

### Call-Site Wiring & Integration Anchors
- **`src/server/delta_mapper.ts`**:
  - Rewires imports and line 20 from `./delta_types.js` to `export * from '../domain/protocol/index.js'`.
- **`src/server/network/admin_manager.ts`**:
  - Rewires `encodeMsg, WsServerMessage, WsClientMessage` from `./network_types.js` to `../../domain/protocol/index.js`.
  - Re-exports `AdminRoomDetail, AdminRoomLogEntry, RoomHealthStatus, AdminPlayerSummary, AdminRoomSummary, AdminArchivedRoomSummary, ServerVitals` from `../../domain/protocol/index.js` (satisfying `admin_repro.test.ts`).
  - Re-exports `MAX_ROOM_LOGS` from `./admin_event_store.js`.
- **`src/server/network/admin_inspector.ts`**:
  - Rewires `RoomHealthStatus, AdminPlayerSummary, AdminRoomSummary, AdminRoomDetail, AdminRoomLogEntry` to `../../domain/protocol/index.js`.
- **`src/server/network/admin_vitals.ts`**:
  - Rewires `ServerVitals` to `../../domain/protocol/index.js`.
- **`src/server/network/admin_event_store.ts`**:
  - Rewires `AdminRoomLogEntry` to `../../domain/protocol/index.js`.
- **`src/server/network/admin_message_handler.ts`**:
  - Rewires `WsClientMessage, WsServerMessage, ReasonCode` to `../../domain/protocol/index.js`.
- **`src/server/network/delta_broadcaster.ts` & `reconnect_manager.ts`**:
  - Rewire `WsServerMessage, ReasonCode` to `../../domain/protocol/index.js`.
- **`src/server/network/wss_connection_handler.ts`, `wss_intent_handler.ts`, `wss_lobby_handlers.ts`, `wss_server.ts`, `wss_server_lifecycle.ts`**:
  - Rewire `encodeMsg, WsServerMessage, WsClientMessage, ReasonCode` to `../../domain/protocol/index.js`.
- **`src/server/security/envelope_validator.ts` & `intent_guard.ts`**:
  - Rewire `WsClientMessage, ReasonCode` to `../../domain/protocol/index.js`.
- **`src/server/logging/persistent_room_logger.ts`, `room_logger_cloud_sync.ts`, `room_logger_reindexer.ts`, `supabase_log_sync.ts`**:
  - Rewire `AdminRoomLogEntry, AdminArchivedRoomSummary, ArchivedRoomStatus` to `../../domain/protocol/index.js`.

---

## 4. Station 1: Core Contract Invariants (`tests/server/imp416_transitional_shims_decommission.test.ts`)

- **TC-416.01 [UC-SERVER-SHIMS-STUB-AND-PRODUCTION-DECOUPLING/MSS]**: Given the 3 server transitional shims (`delta_types.ts`, `network_types.ts`, `admin_types.ts`), When scanning `src/**`, Then proves zero production source files outside the stubs themselves import from these 3 paths, and each stub consists purely of 1-3 lines of re-exports.
- **TC-416.02 [UC-WIRE-ENCODER-FACADE-PARITY/MSS]**: Given `encodeMsg` re-homed in `src/domain/protocol/index.ts`, When serializing `WsServerMessage` payloads across distinct message variants (`ROOM_STARTED`, `SESSION_INIT`, `DELTA`, `ERROR`), Then proves deterministic JSON stringification matching strict protocol contracts across $\ge 2$ distinct cases ($f(x_1) \neq f(x_2)$).
- **TC-416.03 [UC-ADMIN-MANAGER-OPTIONS-AND-CONSTANTS-WIRING/MSS]**: Given `AdminManagerOptions` consolidated in `admin_manager.ts` and `MAX_ROOM_LOGS` in `admin_event_store.ts`, When instantiating `AdminManager` and managing event stores, Then verifies boundary integrity, capacity thresholds, and correct typing without relying on `admin_types.ts`.
- **TC-416.04 [UC-ZERO-CYCLIC-POLLUTION/MSS]**: Given Tarjan strongly connected components cycle detection, When evaluating the dependency graph across all rewired server files and `src/domain/protocol/index.ts`, Then proves zero new circular dependency cycles are created.
- **TC-416.05 [UC-BACKWARD-COMPAT-STUB-PARITY/MSS]**: Given living tests importing from server shims, When importing `encodeMsg`, `ServerDeltaPayload`, `MAX_ROOM_LOGS`, and `ServerAdminRoomDetail` through the stubs, Then verifies 100% value and type parity matching canonical protocol definitions.

---

## 5. Station 3 & 4 Verification & Evidence Plan
- **Mechanical Gates**:
  1. `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_416_SERVER_TRANSITIONAL_SHIMS_DECOMMISSION.md --auto-sign`
  2. `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_416_SERVER_TRANSITIONAL_SHIMS_DECOMMISSION.md`
  3. `npx --yes tsc --noEmit` (Exit 0)
  4. `npm run lint:boundaries` (Verifies 0 hard boundary violations and 0 cycles introduced)
  5. `npm run prefilter -- src/domain/protocol/index.ts src/server/delta_mapper.ts src/server/network/admin_event_store.ts src/server/network/admin_manager.ts src/server/network/wss_server.ts tests/server/imp416_transitional_shims_decommission.test.ts`
  6. **Evidence Snapshot Collection (Tier 1.5 Structural Refactor)**:
     `node scripts/collect_evidence.mjs imp-416 tests/server/imp416_transitional_shims_decommission.test.ts && npm run report -- imp-416 && node scripts/check_evidence.mjs imp-416`
  7. **Regression verification (100% Living Test Parity across 52 tests)**:
     `npx --yes vitest run tests/server/imp416_transitional_shims_decommission.test.ts tests/domain/imp392_shared_wire_protocol_and_network_boundary.test.ts tests/contracts/imp261_admin_security_and_resilience.test.ts tests/server/imp382_server_domain_events_pipeline.test.ts tests/server/admin_portal.test.ts tests/contracts/imp286_p2p_trade_delta_broadcast.test.ts tests/client/admin_repro.test.ts`

---

## 6. Definition of Done (DoD)
- [ ] `src/server/delta_types.ts` is reduced to 1-line re-export stub (`export * from '../domain/protocol/index.js';`).
- [ ] `src/server/network/network_types.ts` is reduced to 1-line re-export stub.
- [ ] `src/server/network/admin_types.ts` is reduced to 3-line re-export stub.
- [ ] 0 files in `src/**` outside the stubs import from the 3 transitional paths.
- [ ] `encodeMsg` is exported from `src/domain/protocol/index.ts`.
- [ ] `MAX_ROOM_LOGS` is exported from `src/server/network/admin_event_store.ts` and `admin_manager.ts`.
- [ ] `AdminManagerOptions` is defined and exported from `src/server/network/admin_manager.ts`.
- [ ] `admin_manager.ts` re-exports `AdminRoomDetail` and `AdminRoomLogEntry` from `@protocol` (protecting `admin_repro.test.ts`).
- [ ] `admin_manager.ts` stays strictly below 350 LOC (~345 LOC).
- [ ] `src/server/delta_mapper.ts` re-exports directly from `src/domain/protocol/index.js`.
- [ ] All 19 production server callers rewired directly to `src/domain/protocol/index.js`.
- [ ] `npm run lint:boundaries` confirms 0 hard boundary violations and 0 new cycles.
- [ ] Living test suite `tests/server/imp416_transitional_shims_decommission.test.ts` passes 100% across 5 atomic tests.
- [ ] 100% living regression test suites across 6 suites (52 tests) pass cleanly.
- [ ] `check_evidence.mjs imp-416` exits `0`.
