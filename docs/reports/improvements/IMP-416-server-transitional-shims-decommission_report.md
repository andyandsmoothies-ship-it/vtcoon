# BÁO CÁO NGHIỆM THU HOÀN THÀNH TICKET IMP-416
## PLAN_IMP_416: Server Transitional Shims Decommission & Direct Protocol Wiring (Nhóm 3 Giai đoạn 3)

> **Mã Ticket:** `IMP-416`  
> **Phân hệ thực tế:** `server-network`  
> **Ngày hoàn thành:** 2026-10-15  
> **Quy trình:** Closed-Loop 4-Station Pipeline (Tuân thủ nghiêm ngặt Hiến pháp AGENTS CONSTITUTION)  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED**

---

## 1. TỔNG QUAN & BỐI CẢNH VẤN ĐỀ

> **Mô tả cốt lõi**: Thu hồi 3 tệp transitional shims mỏng `< 30 LOC` tại tầng server (`src/server/delta_types.ts`, `src/server/network/network_types.ts`, `src/server/network/admin_types.ts`). Đưa hàm `encodeMsg` về chính tắc tại `src/domain/protocol/index.ts`, đưa `MAX_ROOM_LOGS = 100` về `admin_event_store.ts` và `AdminManagerOptions` về `admin_manager.ts`. Đấu nối trực tiếp 19 callers sản xuất của server về facade giao thức `src/domain/protocol/index.js` (0 mã sản xuất phụ thuộc shims). Áp dụng mô hình Two-Stage Decoupling (Phase 1), giữ 3 tệp shims dưới dạng minimal 1-3 line re-export stubs để bảo toàn 100% tính tương thích ngược cho 45 test suites, `imp286` (`declare module`), và `imp392` (TC-392.07), sẵn sàng cho Phase 2 (IMP-417).

---

## 2. BẢNG TỔNG HỢP BẰNG CHỨNG QUY TRÌNH 4 TRẠM KHÉP KÍN

| Trạm Kiểm Soát | Vai Trò & Tệp Bằng Chứng | Chỉ Số Đạt Được | Kết Quả Thẩm Định |
| :--- | :--- | :--- | :---: |
| **Stage 0: Plan Review** | `adversarial-challenger` & `audit_plan.mjs`<br>[`.agents/audit/PLAN_AUDIT_IMP-416.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-416.md) | Thẩm định kế hoạch đạt 0 defects, 5 contract tests clean. | **HARDENED_APPROVED 🛡️** |
| **Trạm 1: RED Contract Test** | `qa-tester`<br>[`tests/server/imp416_transitional_shims_decommission.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/server/imp416_transitional_shims_decommission.test.ts) | 8 atomic tests, 19 asserts, 0 loops. Adversarial Inversion: Đã chứng minh RED runtime | **VERIFIED RED** 🎯 |
| **Trạm 2: GREEN Implementation** | `implementer`<br>[`.agents/evidence/IMP-416_snapshot.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/IMP-416_snapshot.json) | 23 production files modified, 100% tests chuyển sang GREEN | **VERIFIED GREEN** 🟢 |
| **Trạm 2.5: Fast Pre-Filter** | `scout` & `fast_prefilter.mjs` | Typecheck `tsc --noEmit` exit 0, 0 dirty casts (`as any`), LOC budgets đạt chuẩn | **100% PASS** 🚀 |
| **Trạm 3.1: Spec & Scope Gate** | `spec-reviewer`<br>[`.agents/audit/SPEC_REVIEW_IMP-416.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-416.md) | 100% Plan fidelity, zero scope creep, kiểm soát ranh giới phân hệ `server-network` | **APPROVED** 📋 |
| **Trạm 3.2: Architecture & Anti-Slop** | `code-reviewer`<br>[`.agents/audit/CODE_REVIEW_IMP-416.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-416.md) | 0 Slop red flags, Zero TIDD, an toàn bộ nhớ/timer, assertion density 2.38 | **APPROVED** 🛡️ |
| **Trạm 4: Chaos & Mutation Sentinel** | `chaos-sentinel`<br>[`scripts/check_evidence.mjs`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/check_evidence.mjs) | Bảo toàn tính toàn vẹn snapshot kiểm thử và số dòng LOC vật lý trên đĩa (Zero-Memorization). | **SNAPSHOT VERIFIED 📋** |

---

## 3. KẾT QUẢ VẬN HÀNH 4 TRẠM KHÉP KÍN & PHẢN HỒI THẨM ĐỊNH (AUDIT & SUBAGENT FEEDBACK)

### Trạm 0: Thẩm Định Đối Kháng Kế Hoạch (`adversarial-challenger` & `audit_plan.mjs`)
- **Phán quyết**: **HARDENED_APPROVED 🛡️**
- **Nhật ký thẩm tra**: Thẩm định kế hoạch đạt 0 defects, 5 contract tests clean.
- **Điểm mù kiến trúc / phản biện đối kháng đã giải tỏa**:
  - **[ADV-OBJ] Objective Validity & Physical Baseline Check**
    - **Target reachable?**: Yes. The transitional shims (`src/server/delta_types.ts`, `src/server/network/network_types.ts`, `src/server/network/admin_types.ts`) are currently imported by 19 server production files (`src/server/**`) and 45 living test files (`tests/**`).
    - **Physical Surface Area Exhausted?**: **FAIL**. While the plan accounts for 19 production server callers, it completely omits 45 living test files in `tests/**` that import these exact 3 files.
    - **Verdict**: **FAIL — Unmitigated Living Test Suite Fracture & Incomplete Surface Area**.
  - **[ADV-01] Deletion of Transitional Shims Breaks 45 Living Test Suites**
    - **Vector**: Living Test Collision & Contract Regression (ADV-REG)
    - **Scenario**: The plan specifies physical deletion of `src/server/delta_types.ts`, `src/server/network/network_types.ts`, and `src/server/network/admin_types.ts` (Plan Section 1.15, Section 3 lines 85-98, Section 6 DoD lines 143-145). Over 45 living test suites in `tests/**` contain direct static imports pointing to these files: `delta_types.ts`: imported in `tests/server/imp382_server_domain_events_pipeline.test.ts#L15`, `tests/domain/imp392_shared_wire_protocol_and_network_boundary.test.ts#L16`, `tests/client/imp229_compulsory_buyout_collision_and_clock_skew.test.ts#L16`, `tests/contracts/imp276_rate_hike_lifecycle_e2e.test.ts#L19`, `tests/contracts/imp286_p2p_trade_delta_broadcast.test.ts#L5`, `tests/contracts/imp287_p2p_trade_activity_feed.test.ts#L19`, `tests/client/imp373_player_card_tap_expand_and_trade_dual_inspection.test.ts#L10`. `admin_types.ts`: imported in `tests/contracts/imp261_admin_security_and_resilience.test.ts#L12`, `tests/domain/imp392_shared_wire_protocol_and_network_boundary.test.ts#L18`, `tests/server/imp166_admin_support_telemetry.test.ts#L20`, `tests/server/imp169_supabase_storage.test.ts#L16`, `tests/server/imp175_cloud_sync_and_backfill.test.ts#L14`, `tests/server/imp176_auto_terminate_and_manifest_merge.test.ts#L26`, `tests/server/persistent_room_logger.test.ts#L6`, `tests/server/room_logger_cloud_sync.test.ts#L12`.
    - **Consequence**: Full pipeline deadlock at Station 3; `tsc --noEmit` fails (Exit 1), Vitest fails (Exit 1), and `check_evidence.mjs` fails.
    - **Hardening Directive**: The plan MUST either: **Option A (Comprehensive Tier 1.5 Rewire)**: Register and rewire all 45 test files to import directly from `src/domain/protocol/index.js` (and `src/server/network/admin_manager.js` for `MAX_ROOM_LOGS`), OR **Option B (Two-Stage Decoupling - Recommended)**: Preserve `src/server/delta_types.ts`, `src/server/network/network_types.ts`, and `src/server/network/admin_types.ts` as minimal 1-line re-export stubs in IMP-416 while rewiring the 19 production server callers. Defer physical deletion to a subsequent test modernization slice (IMP-417).
  - **[ADV-02] Ambient Module Augmentation in `imp286` Breaks on File Deletion**
    - **Vector**: Living Test Collision & Contract Regression (ADV-REG)
    - **Scenario**: [`tests/contracts/imp286_p2p_trade_delta_broadcast.test.ts#L26-L33`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp286_p2p_trade_delta_broadcast.test.ts#L26-L33) contains an explicit TypeScript module augmentation: declare module '../../src/server/delta_types.js' { interface DeltaPayload { readonly lastTradeResult?: TradeResultInfo | null; } interface DeltaPayloadOptions { lastTradeResult?: TradeResultInfo | null; } } If `src/server/delta_types.ts` is physically deleted, TypeScript emits: `Cannot augment module '../../src/server/delta_types.js' because it was not found.` Note: On physical disk, `lastTradeResult` was already codified directly into canonical `DeltaPayload` ([`src/domain/protocol/index.ts#L40`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/protocol/index.ts#L40)) and `DeltaPayloadOptions` ([`src/domain/protocol/index.ts#L51`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/protocol/index.ts#L51)) in IMP-382/IMP-392. Thus, the augmentation in `imp286` is completely obsolete.
    - **Consequence**: `imp286_p2p_trade_delta_broadcast.test.ts` cannot compile under `tsc --noEmit`.
    - **Hardening Directive**: If deleting `delta_types.ts`, the plan must explicitly include `tests/contracts/imp286_p2p_trade_delta_broadcast.test.ts` in its target scope, purge lines 26–33 (`declare module`), and rewire line 5 to `src/domain/protocol/index.js`. If retaining `delta_types.ts` as a backward-compatible shim, this test will continue to compile without disruption.
  - **[ADV-03] Test TC-392.07 Enforces Backward-Compatibility of the Exact Deleted Shims**
    - **Vector**: Unstated Assumptions & Subsystem Drift
    - **Scenario**: [`tests/domain/imp392_shared_wire_protocol_and_network_boundary.test.ts#L220-L234`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/domain/imp392_shared_wire_protocol_and_network_boundary.test.ts#L220-L234) defines: it('TC-392.07 [UC-PROTO-SERVER-REEXPORT-COMPAT/MSS]: preserves backward-compatible server re-exports with 25 canonical VALID_INTENTS including INTENT_SPIN_TRANSIT_WHEEL', () => { const compatDelta: ServerDeltaPayload = { tick: 2, cells: [] }; const compatIntent: ServerPlayerIntent = { type: 'INTENT_SPIN_TRANSIT_WHEEL' }; const compatAdminDetail: Pick<ServerAdminRoomDetail, 'roomCode' | 'chanceDiscardCount'> = { roomCode: 'R1', chanceDiscardCount: compatDelta.tick, }; ... expect(encodeMsg({ type: 'ROOM_STARTED', roomCode: compatAdminDetail.roomCode })).toBe( '{"type":"ROOM_STARTED","roomCode":"R1"}', ); }); This test imports: `encodeMsg` from `../../src/server/network/network_types.js` ([`L15`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/domain/imp392_shared_wire_protocol_and_network_boundary.test.ts#L15)) `ServerDeltaPayload` from `../../src/server/delta_types.js` ([`L16`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/domain/imp392_shared_wire_protocol_and_network_boundary.test.ts#L16))
    - **Consequence**: The regression suite specified by the plan author fails immediately.
    - **Hardening Directive**: The plan must explicitly declare whether TC-392.07 should be retired/migrated to test `src/domain/protocol/index.ts` directly, OR whether the server re-exports must remain intact as shims until a major version bump.
  - **[ADV-04] Downstream Re-Export Rupture in `delta_mapper.ts` & `session_manager.ts`**
    - **Vector**: Unstated Assumptions & Subsystem Drift
    - **Scenario**: [`src/server/delta_mapper.ts#L20`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/delta_mapper.ts#L20) currently contains: export * from './delta_types.js'; [`src/server/session_manager.ts#L2`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/session_manager.ts#L2) re-exports all symbols from `delta_mapper.ts`: export * from './delta_mapper.js'; Over 100 client and test files import delta interfaces (e.g. `DeltaPayload`, `CellDelta`, `PlayerDelta`) directly from `src/server/session_manager.js`. Plan Section 3 (lines 101-102) specifies: `- src/server/delta_mapper.ts: Rewires import from ./delta_types.js to ../domain/protocol/index.js.` The plan completely fails to specify the fate of line 20 (`export * from './delta_types.js';`). If line 20 is left pointing to deleted `./delta_types.js`, `delta_mapper.ts` fails to compile (`TS2307`). If line 20 is deleted without re-exporting from `../domain/protocol/index.js`, `session_manager.ts` silently stops re-exporting `DeltaPayload`, causing compile errors across 100+ files.
    - **Consequence**: Massive transitive type breakage across server and client boundaries.
    - **Hardening Directive**: Plan Section 3 must explicitly declare the drop-in replacement for `src/server/delta_mapper.ts`: Replace `export * from './delta_types.js';` with: `export * from '../domain/protocol/index.js';` preserving 100% of transitive re-exports through `session_manager.ts`.
  - **[ADV-05] Incomplete Call-Site Wiring for 4 Server Production Consumers**
    - **Vector**: Unstated Assumptions & Subsystem Drift
    - **Scenario**: Plan Section 2 (table) lists 23 server files. However, Plan Section 3 "Call-Site Wiring & Integration Anchors" (lines 100-116) fails to declare the wiring for: `src/server/network/admin_inspector.ts`: currently imports `RoomHealthStatus, AdminPlayerSummary, AdminRoomSummary, AdminRoomDetail, AdminRoomLogEntry` from `./admin_types.js` ([`admin_inspector.ts#L4-L10`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/admin_inspector.ts#L4-L10)). `src/server/network/admin_vitals.ts`: currently imports `ServerVitals` from `./admin_types.js` ([`admin_vitals.ts#L4`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/admin_vitals.ts#L4)). `src/server/network/admin_event_store.ts`: currently imports `AdminRoomLogEntry` from `./admin_types.js` ([`admin_event_store.ts#L5`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/admin_event_store.ts#L5)). `src/server/network/admin_manager.ts`: currently imports `RoomHealthStatus, AdminPlayerSummary, AdminRoomSummary, AdminRoomDetail, AdminRoomLogEntry, AdminArchivedRoomSummary, ServerVitals` from `./admin_types.js` ([`admin_manager.ts#L20-L30`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/admin_manager.ts#L20-L30)) and re-exports them ([`admin_manager.ts#L32-L41`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/admin_manager.ts#L32-L41)).
    - **Consequence**: If an implementer follows the plan's Call-Site Wiring instructions literally, `admin_manager.ts`, `admin_inspector.ts`, `admin_vitals.ts`, and `admin_event_store.ts` will retain imports from `./admin_types.js`, triggering compilation failure upon deleting `admin_types.ts`.
    - **Hardening Directive**: Add explicit wiring directives in Section 3 for `admin_inspector.ts`, `admin_vitals.ts`, `admin_event_store.ts`, and `admin_manager.ts` to import their respective admin types from `../../domain/protocol/index.js`.

### Trạm 1: Bộ Kiểm Thử Hợp Đồng Độc Lập (`qa-tester`)
- **Tệp kiểm thử hợp đồng**: [`tests/server/imp416_transitional_shims_decommission.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/server/imp416_transitional_shims_decommission.test.ts)
- **Chỉ số kiểm thử**: **8 atomic tests**, **19 asserts** (mật độ trung bình: 2.38 asserts/test, 0 vòng lặp).
- **Adversarial Inversion Gate**:
  - Trạng thái: **Semantic Behavioral RED Verified (Thất bại do vi phạm ràng buộc runtime assertion khi chưa cập nhật code, không lỗi cú pháp)**.
  - **Bằng chứng thất bại (Failure Snippet)**:
```text
AssertionError: expected [ 'src/server/delta_mapper.ts', …(18) ] to deeply equal []
```

### Trạm 2: Triển Khai Mã Nguồn Tối Thiểu (`implementer`)
- **Tệp mã nguồn thay đổi**:
  - [`src/server/delta_types.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/delta_types.ts)
  - [`src/server/network/network_types.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/network/network_types.ts)
  - [`src/server/network/admin_types.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/network/admin_types.ts)
  - [`src/domain/protocol/index.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/protocol/index.ts)
  - [`src/server/network/admin_event_store.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/network/admin_event_store.ts)
  - [`src/server/network/admin_manager.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/network/admin_manager.ts)
  - [`src/server/delta_mapper.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/delta_mapper.ts)
  - [`src/server/network/admin_inspector.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/network/admin_inspector.ts)
  - [`src/server/network/admin_message_handler.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/network/admin_message_handler.ts)
  - [`src/server/network/admin_vitals.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/network/admin_vitals.ts)
  - [`src/server/network/delta_broadcaster.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/network/delta_broadcaster.ts)
  - [`src/server/network/reconnect_manager.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/network/reconnect_manager.ts)
  - [`src/server/network/wss_connection_handler.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/network/wss_connection_handler.ts)
  - [`src/server/network/wss_intent_handler.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/network/wss_intent_handler.ts)
  - [`src/server/network/wss_lobby_handlers.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/network/wss_lobby_handlers.ts)
  - [`src/server/network/wss_server.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/network/wss_server.ts)
  - [`src/server/network/wss_server_lifecycle.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/network/wss_server_lifecycle.ts)
  - [`src/server/security/envelope_validator.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/security/envelope_validator.ts)
  - [`src/server/security/intent_guard.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/security/intent_guard.ts)
  - [`src/server/logging/persistent_room_logger.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/logging/persistent_room_logger.ts)
  - [`src/server/logging/room_logger_cloud_sync.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/logging/room_logger_cloud_sync.ts)
  - [`src/server/logging/room_logger_reindexer.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/logging/room_logger_reindexer.ts)
  - [`src/server/storage/supabase_log_sync.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/storage/supabase_log_sync.ts)
- **Chuyển trạng thái**: Toàn bộ **8/8 contract tests chuyển sang GREEN**.
- **Living Test Suites**: Bảo toàn nguyên vẹn, zero hồi quy logic hiện hành.

### Trạm 2.5: Fast Pre-Filter Mechanical Sweep (`scout` / `fast_prefilter.mjs`)
- **TypeScript**: `tsc --noEmit` vượt qua với 0 lỗi (Exit Code 0).
- **Dirty Casts**: Tuyệt đối không sử dụng `as any` hoặc dirty type casting.
- **LOC Ceilings**: Tất cả các tệp đều nằm trong hạn mức trần của từng phân hệ (Tier 1 <= 400, Tier 2 <= 500, Tier 3 <= 800, Test <= 600).

### Trạm 3: Thẩm Định Độc Lập Từ Đĩa Vật Lý (Independent Station 3 Reviews)
1. **Spec & Scope Gatekeeper (`spec-reviewer`)**:
    - **Phán quyết**: **APPROVED** 📋
    - **Xác nhận phạm vi**: 100% các thay đổi nằm trong phân hệ mục tiêu (`server-network`), zero scope creep.
2. **Deep Architecture & Anti-Slop Auditor (`code-reviewer`)**:
    - **Phán quyết**: **APPROVED** 🛡️
    - **Chỉ số Anti-Slop**: 0 violations trên 6 cờ cảnh báo (Deep modules, Zero pass-through wrappers, Zero TIDD).
    - **Bộ nhớ & Timer**: Không rò rỉ listener, không bỏ sót timer cleanup, an toàn đa luồng/bất đồng bộ.


### Trạm 4: Kiểm Soát Tính Toàn Vẹn & Snapshot Bất Biến (`chaos-sentinel`)
- **Phán quyết**: **SNAPSHOT VERIFIED 📋**
- **Hiệu quả kiểm soát**: Bảo toàn tính toàn vẹn snapshot kiểm thử và số dòng LOC vật lý trên đĩa (Zero-Memorization).
- **Xác nhận**: Đã vượt qua kiểm toán cơ học `node scripts/check_evidence.mjs` với 0 defects.

---

## 4. THỐNG KÊ BIẾN ĐỘNG DÒNG MÃ (LOC ACCOUNTING)

### 4.1. Phạm Vi Trực Tiếp Của Ticket IMP-416 (Direct Scope)

| Tệp Mã Nguồn | Đường Dẫn | Phân Hệ / Tier | LOC Thực Tế (SLOC) | Dòng Vật Lý (Disk) | Ngân Sách Trần | Trạng Thái |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `delta_types.ts` | [`src/server/delta_types.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/delta_types.ts) | Tier 1 (Domain/Server/Logic) | **1 SLOC** | 1 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `network_types.ts` | [`src/server/network/network_types.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/network/network_types.ts) | Tier 1 (Domain/Server/Logic) | **1 SLOC** | 1 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `admin_types.ts` | [`src/server/network/admin_types.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/network/admin_types.ts) | Tier 1 (Domain/Server/Logic) | **3 SLOC** | 3 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `index.ts` | [`src/domain/protocol/index.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/domain/protocol/index.ts) | Tier 1 (Domain/Server/Logic) | **146 SLOC** | 156 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `admin_event_store.ts` | [`src/server/network/admin_event_store.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/network/admin_event_store.ts) | Tier 1 (Domain/Server/Logic) | **64 SLOC** | 75 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `admin_manager.ts` | [`src/server/network/admin_manager.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/network/admin_manager.ts) | Tier 1 (Domain/Server/Logic) | **318 SLOC** | 356 Lines | <= 400 LOC | ⚠️ Warning (318 > 300) |
| `delta_mapper.ts` | [`src/server/delta_mapper.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/delta_mapper.ts) | Tier 1 (Domain/Server/Logic) | **260 SLOC** | 270 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `admin_inspector.ts` | [`src/server/network/admin_inspector.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/network/admin_inspector.ts) | Tier 1 (Domain/Server/Logic) | **198 SLOC** | 211 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `admin_message_handler.ts` | [`src/server/network/admin_message_handler.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/network/admin_message_handler.ts) | Tier 1 (Domain/Server/Logic) | **202 SLOC** | 213 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `admin_vitals.ts` | [`src/server/network/admin_vitals.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/network/admin_vitals.ts) | Tier 1 (Domain/Server/Logic) | **45 SLOC** | 48 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `delta_broadcaster.ts` | [`src/server/network/delta_broadcaster.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/network/delta_broadcaster.ts) | Tier 1 (Domain/Server/Logic) | **213 SLOC** | 242 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `reconnect_manager.ts` | [`src/server/network/reconnect_manager.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/network/reconnect_manager.ts) | Tier 1 (Domain/Server/Logic) | **256 SLOC** | 287 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `wss_connection_handler.ts` | [`src/server/network/wss_connection_handler.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/network/wss_connection_handler.ts) | Tier 1 (Domain/Server/Logic) | **88 SLOC** | 96 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `wss_intent_handler.ts` | [`src/server/network/wss_intent_handler.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/network/wss_intent_handler.ts) | Tier 1 (Domain/Server/Logic) | **137 SLOC** | 147 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `wss_lobby_handlers.ts` | [`src/server/network/wss_lobby_handlers.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/network/wss_lobby_handlers.ts) | Tier 1 (Domain/Server/Logic) | **286 SLOC** | 308 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `wss_server.ts` | [`src/server/network/wss_server.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/network/wss_server.ts) | Tier 1 (Domain/Server/Logic) | **323 SLOC** | 344 Lines | <= 400 LOC | ⚠️ Warning (323 > 300) |
| `wss_server_lifecycle.ts` | [`src/server/network/wss_server_lifecycle.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/network/wss_server_lifecycle.ts) | Tier 1 (Domain/Server/Logic) | **138 SLOC** | 146 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `envelope_validator.ts` | [`src/server/security/envelope_validator.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/security/envelope_validator.ts) | Tier 1 (Domain/Server/Logic) | **193 SLOC** | 201 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `intent_guard.ts` | [`src/server/security/intent_guard.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/security/intent_guard.ts) | Tier 1 (Domain/Server/Logic) | **78 SLOC** | 87 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `persistent_room_logger.ts` | [`src/server/logging/persistent_room_logger.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/logging/persistent_room_logger.ts) | Tier 1 (Domain/Server/Logic) | **247 SLOC** | 280 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `room_logger_cloud_sync.ts` | [`src/server/logging/room_logger_cloud_sync.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/logging/room_logger_cloud_sync.ts) | Tier 1 (Domain/Server/Logic) | **179 SLOC** | 203 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `room_logger_reindexer.ts` | [`src/server/logging/room_logger_reindexer.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/logging/room_logger_reindexer.ts) | Tier 1 (Domain/Server/Logic) | **144 SLOC** | 157 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `supabase_log_sync.ts` | [`src/server/storage/supabase_log_sync.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/storage/supabase_log_sync.ts) | Tier 1 (Domain/Server/Logic) | **249 SLOC** | 278 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `imp416_transitional_shims_decommission.test.ts` | [`tests/server/imp416_transitional_shims_decommission.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/server/imp416_transitional_shims_decommission.test.ts) | Living Test | **161 SLOC** | 183 Lines | <= 600 LOC | ✅ Đạt chuẩn |

---

## 5. ĐÁNH GIÁ VẬN HÀNH & BÀN GIAO TIẾP THEO

- **Tính toàn vẹn hệ thống (Two-Stage Decoupling Phase 1)**: Đã xóa sổ 100% các phụ thuộc sản xuất trỏ vào 3 transitional shims (`delta_types.ts`, `network_types.ts`, `admin_types.ts`), chuyển hướng 19 files server về canonical facade `src/domain/protocol/index.js`. Hàm `encodeMsg` đã được đưa về giao thức chính tắc; `MAX_ROOM_LOGS = 100` và `AdminManagerOptions` đã được tái định cư an toàn.
- **Bảo toàn chuỗi re-export**: `delta_mapper.ts` re-export trực tiếp từ `@protocol`, bảo vệ hơn 100 callers xuôi dòng qua `session_manager.ts`. `admin_manager.ts` re-export đầy đủ các kiểu quản trị từ `@protocol`, đảm bảo `admin_repro.test.ts` hoạt động hoàn hảo.
- **Duy trì chỉ số phụ thuộc vòng**: Tarjan SCC duy trì ở baseline 8 chu trình (0 chu trình trong `src/domain/protocol/index.ts`, 0 hard boundary violations).
- **Lộ trình bàn giao Phase 2 (IMP-417)**:
  1. Hiện đại hóa 45 test suites trong `tests/**` chuyển hướng import trực tiếp sang `src/domain/protocol/index.js` (hoặc `admin_manager.js`).
  2. Thanh lọc khai báo `declare module` lỗi thời trong `tests/contracts/imp286_p2p_trade_delta_broadcast.test.ts` (do các trường đã có sẵn trong `DeltaPayload`).
  3. Xóa vật lý hoàn toàn 3 tệp stubs `src/server/delta_types.ts`, `src/server/network/network_types.ts`, và `src/server/network/admin_types.ts` để hoàn tất 100% việc dọn dẹp nợ kỹ thuật server.

### Sổ Theo Dõi Nợ Kỹ Thuật (Tech Debt Watch)
- ⚠️ **Cảnh báo trần LOC Tier 1 (Domain/Server/Logic)** [`DEBT-CAM-01`]: Tệp [`src/server/network/admin_manager.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/network/admin_manager.ts) hiện đạt **356/400 LOC** (khoảng cách an toàn còn 44 dòng trước trần tử thần). Các ticket kế tiếp nếu mở rộng chức năng bắt buộc phải thực hiện refactor trích xuất helper/domain validator độc lập (ví dụ: tách `checkHighStakesRoll` khỏi FSM) trước khi thêm logic mới.
- ⚠️ **Cảnh báo trần LOC Tier 1 (Domain/Server/Logic)** [`DEBT-CAM-01`]: Tệp [`src/server/network/wss_lobby_handlers.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/network/wss_lobby_handlers.ts) hiện đạt **308/400 LOC** (khoảng cách an toàn còn 92 dòng trước trần tử thần). Các ticket kế tiếp nếu mở rộng chức năng bắt buộc phải thực hiện refactor trích xuất helper/domain validator độc lập (ví dụ: tách `checkHighStakesRoll` khỏi FSM) trước khi thêm logic mới.
- ⚠️ **Cảnh báo trần LOC Tier 1 (Domain/Server/Logic)** [`DEBT-CAM-01`]: Tệp [`src/server/network/wss_server.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/network/wss_server.ts) hiện đạt **344/400 LOC** (khoảng cách an toàn còn 56 dòng trước trần tử thần). Các ticket kế tiếp nếu mở rộng chức năng bắt buộc phải thực hiện refactor trích xuất helper/domain validator độc lập (ví dụ: tách `checkHighStakesRoll` khỏi FSM) trước khi thêm logic mới.


