# BÁO CÁO NGHIỆM THU HOÀN THÀNH TICKET IMP-422
## Implementation Plan: IMP-422 Client Network Subscribers & Event Bus Zero-Cycle

> **Mã Ticket:** `IMP-422`  
> **Phân hệ thực tế:** `client-state`  
> **Ngày hoàn thành:** 2026-10-16  
> **Quy trình:** Closed-Loop 4-Station Pipeline (Tuân thủ nghiêm ngặt Hiến pháp AGENTS CONSTITUTION)  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED**

---

## 1. TỔNG QUAN & BỐI CẢNH VẤN ĐỀ

Ticket IMP-422 giải quyết triệt để chu trình phụ thuộc vòng phức tạp 15 tệp `[SCC-1]` trong phân hệ `client-state` và `client-events` của trò chơi Phú Hào Đại Chiến (VTCOON). Chu trình này xuất phát từ 4 điểm nghẽn kiến trúc đan xen:
1. **Khớp nối hai chiều giữa Store và Landing**: `lobby_store.ts` phụ thuộc vào `offline_landing.ts` để gọi hàm sinh cấu hình phòng `createNewRoomConfig`, trong khi `offline_landing.ts` lại import ngược `useLobbyStore`.
2. **Chu trình kiểu dữ liệu giữa Event Bus và Subscribers**: 6 subscriber và helper trình diễn (`property_market_badge_handler.ts`, `activity_log_subscriber.ts`, `badge_event_subscriber.ts`, `audio_event_subscriber.ts`, `badge_financial_helpers.ts`, `activity_log_financial_formatter.ts`) import `GameEventContext` và `GameEventListener` từ `game_event_bus.ts`, trong khi `game_event_bus.ts` import các subscriber này để đăng ký listener.
3. **Vi phạm ranh giới tầng giữa Network và UI Modal**: Tầng mạng `client_session_purger.ts` import trực tiếp `resetTradeOfferResolutions` từ component giao diện `bot_trade_offer_strip.tsx`.
4. **Xâm thực Store trong Subscriber**: `property_market_badge_handler.ts` và `activity_tracker.ts` đọc trực tiếp `useLobbyStore.getState().myPlayerId` để phân loại thẻ bot/người chơi, gây phụ thuộc vòng ngược vào store.

**Cơ chế giải quyết kiến trúc cốt lõi**:
- Trích xuất 4 seam thuần túy (Leaf Modules): `room_config_helpers.ts` (Tier 1 <= 70 LOC), `game_event_bus_types.ts` (Tier 1 <= 20 LOC), `event_card_constants.ts` (Tier 1 <= 20 LOC), và `trade_offer_tracker.ts` (Tier 1 <= 25 LOC).
- Thiết lập ranh giới DAG đơn hướng nghiêm ngặt: `apply_delta` -> `game_event_bus` -> `subscribers`.
- Đảm bảo 100% DTO & Call-Site Wiring Parity: Truyền `myPlayerId` qua `GameEventContext` và `TrackDeltaActivitiesOptions`, giải quyết dứt điểm rủi ro nuốt huy hiệu và lệch định danh của người chơi khách (`p2`, `p3`, `p4`). Kết quả kiểm toán chu trình đồ thị Tarjan xác nhận: `src/client/**` đạt trạng thái 0 chu trình vòng (Zero Cycle).

---

## 2. BẢNG TỔNG HỢP BẰNG CHỨNG QUY TRÌNH 4 TRẠM KHÉP KÍN

| Trạm Kiểm Soát | Vai Trò & Tệp Bằng Chứng | Chỉ Số Đạt Được | Kết Quả Thẩm Định |
| :--- | :--- | :--- | :---: |
| **Stage 0: Plan Review** | `adversarial-challenger` & `audit_plan.mjs`<br>[`.agents/audit/PLAN_AUDIT_IMP-422.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-422.md) | Thẩm định kế hoạch đạt 0 defects, 6 contract tests clean. | **HARDENED_APPROVED 🛡️** |
| **Trạm 1: RED Contract Test** | `qa-tester`<br>[`tests/client/imp422_client_network_subscribers_zero_cycle.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp422_client_network_subscribers_zero_cycle.test.ts) | 21 atomic tests, 52 asserts, 0 loops. Adversarial Inversion: Đã chứng minh RED runtime | **VERIFIED RED** 🎯 |
| **Trạm 2: GREEN Implementation** | `implementer`<br>[`.agents/evidence/IMP-422_snapshot.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/IMP-422_snapshot.json) | 17 production files modified, 100% tests chuyển sang GREEN | **VERIFIED GREEN** 🟢 |
| **Trạm 2.5: Fast Pre-Filter** | `scout` & `fast_prefilter.mjs` | Typecheck `tsc --noEmit` exit 0, 0 dirty casts (`as any`), LOC budgets đạt chuẩn | **100% PASS** 🚀 |
| **Trạm 3.1: Spec & Scope Gate** | `spec-reviewer`<br>[`.agents/audit/SPEC_REVIEW_IMP-422.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-422.md) | 100% Plan fidelity, zero scope creep, kiểm soát ranh giới phân hệ `client-state` | **APPROVED** 📋 |
| **Trạm 3.2: Architecture & Anti-Slop** | `code-reviewer`<br>[`.agents/audit/CODE_REVIEW_IMP-422.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-422.md) | 0 Slop red flags, Zero TIDD, an toàn bộ nhớ/timer, assertion density 2.48 | **APPROVED** 🛡️ |
| **Trạm 4: Chaos & Mutation Sentinel** | `chaos-sentinel`<br>[`scripts/check_evidence.mjs`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/check_evidence.mjs) | 23/23 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived). | **APPROVED 💥** |

---

## 3. KẾT QUẢ VẬN HÀNH 4 TRẠM KHÉP KÍN & PHẢN HỒI THẨM ĐỊNH (AUDIT & SUBAGENT FEEDBACK)

### Trạm 0: Thẩm Định Đối Kháng Kế Hoạch (`adversarial-challenger` & `audit_plan.mjs`)
- **Phán quyết**: **HARDENED_APPROVED 🛡️**
- **Nhật ký thẩm tra**: Thẩm định kế hoạch đạt 0 defects, 6 contract tests clean.
- **Điểm mù kiến trúc / phản biện đối kháng đã giải tỏa**:
  - **[ADV-OBJ] Objective Validity**
    - **Target reachable?**: Yes — `applyDeltaToStore` ([`apply_delta.ts#L223`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/apply_delta.ts#L223)), `GameEventBus.dispatchGameEvents` ([`game_event_bus.ts#L35`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/events/game_event_bus.ts#L35)), `purgeClientMatchSession` ([`client_session_purger.ts#L26`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/client_session_purger.ts#L26)), and `createNewRoomConfig` ([`lobby_store.ts#L15`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/lobby_store.ts#L15)) fire under normal runtime gameplay and lobby init.
    - **Baselines verified?**: PARTIALLY — Physical LOC counts are verified from disk within ±1 LOC (`client_session_purger.ts` 60 LOC, `apply_delta.ts` 251 LOC, `activity_tracker.ts` 295 LOC, `game_event_bus.ts` 110 LOC, `property_market_badge_handler.ts` 201 LOC, `lobby_store.ts` 279 LOC, `offline_landing.ts` 214 LOC). However, the plan's claim that `[SCC-1]` is eliminated is **UNVERIFIED & FALSE**: 5 subscriber consumers importing `game_event_bus.ts` are omitted from scope, which keeps the cycle alive.
    - **Verdict**: **FAIL** — Incomplete physical surface area (omitting 5 subscriber consumers) guarantees that `npm run lint:boundaries` will continue to exit 1 with circular dependency cycles.
  - **[ADV-01] Incomplete Surface Area Reconstructs Cycle in Tarjan's SCC-1**
    - **Vector**: Unstated Assumption / Incomplete Surface Area
    - **Scenario**: The boundary linter cycle detector ([`scripts/boundary_linter/boundary_rules.mjs#L130`](file:///c:/Users/HP/Documents/GitHub/vtcoon/scripts/boundary_linter/boundary_rules.mjs#L130)) treats all `ts.isImportDeclaration` statements (including `import type`) as dependency graph edges. The plan creates `src/client/events/game_event_bus_types.ts` and re-exports types from `game_event_bus.ts`, but rewires ONLY `property_market_badge_handler.ts`. Five active subscribers and formatters continue importing types from `game_event_bus.ts`: [`src/client/events/subscribers/activity_log_subscriber.ts#L3`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/events/subscribers/activity_log_subscriber.ts#L3) [`src/client/events/subscribers/badge_event_subscriber.ts#L5`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/events/subscribers/badge_event_subscriber.ts#L5) [`src/client/events/subscribers/audio_event_subscriber.ts#L3`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/events/subscribers/audio_event_subscriber.ts#L3) [`src/client/events/subscribers/badge_financial_helpers.ts#L4`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/events/subscribers/badge_financial_helpers.ts#L4)
    - **Consequence**: Tarjan's SCC algorithm will STILL identify a 6-node circular dependency component between `game_event_bus.ts` and its subscribers. `npm run lint:boundaries` will fail at Station 3.
    - **Hardening Directive**: Expand target files to include all 5 subscriber/formatter files and rewire their type imports from `../game_event_bus.js` to `../game_event_bus_types.js`.
  - **[ADV-02] Target Function Mismatch & ReferenceError in Property Market Badge Handler**
    - **Vector**: Partial Failure / Scope Drift
    - **Scenario**: In Section 3 of the plan (lines 364–378), the author proposes modifying `handlePropertyBadges` to accept `localPlayerId = 'p1'`: export function handlePropertyBadges(event, state, pacing, localPlayerId = 'p1'): void However, lines 380–391 then show replacing `useLobbyStore.getState().myPlayerId` with `localPlayerId` inside `case SynthesizedGameEventType.EVENT_CARD_DRAWN:`. On physical disk ([`property_market_badge_handler.ts#L97-L170`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/events/subscribers/property_market_badge_handler.ts#L97-L170)), `EVENT_CARD_DRAWN` is NOT inside `handlePropertyBadges`; it is inside `handleMarketBadges(event: SynthesizedGameEvent, context: GameEventContext, state: GameState, vfx: typeof useVfxStore)`. `handlePropertyBadges` only handles `PROPERTY_BOUGHT`, `PROPERTY_UPGRADED`, `PROPERTY_MORTGAGED`, etc.
    - **Consequence**: Inside `handleMarketBadges`, `localPlayerId` is not defined. The implementation will immediately fail TypeScript compilation (`Cannot find name 'localPlayerId'`) or throw a runtime `ReferenceError`.
    - **Hardening Directive**: Leave `handlePropertyBadges` signature untouched. In `handleMarketBadges`, consume `context.myPlayerId` directly: case SynthesizedGameEventType.EVENT_CARD_DRAWN: {; const myPid = context.myPlayerId || 'p1';; `context: GameEventContext` is already passed into `handleMarketBadges` at [`badge_event_subscriber.ts#L287`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/events/subscribers/badge_event_subscriber.ts#L287).
  - **[ADV-03] Severed Presentation Wire: myPlayerId Omitted at apply_delta Call-Site**
    - **Vector**: Closed-Loop Presentation Wire (ADV-WIRE)
    - **Scenario**: The plan updates `GameEventContext` in `game_event_bus_types.ts` to include `readonly myPlayerId?: string;`. In production, `dispatchGameEvents` is called inside `syncTelemetryAndActivities` at [`apply_delta.ts#L147-L151`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/apply_delta.ts#L147-L151). However, Section 3's snippet for `apply_delta.ts` ONLY replaces `BOARD_WIDE_CARDS` with an export re-export; it completely omits modifying `syncTelemetryAndActivities`.
    - **Consequence**: At runtime, `context.myPlayerId` will always be `undefined`. Any subscriber relying on `context.myPlayerId` will fall back to `'p1'`. If the local human player is `p2`, `p3`, or `p4`: Their own drawn cards will be flagged as bot cards (`isBotCard = true`).; Opponent or bot cards will be misattributed as local cards.; Floating badges and sounds will fire inverted for the wrong player.
    - **Hardening Directive**: Modify `syncTelemetryAndActivities` in `src/client/network/apply_delta.ts` to pass `myPlayerId: useLobbyStore.getState().myPlayerId`: dispatchGameEvents(events, {; prevState: state,; nextState,; delta,; myPlayerId: useLobbyStore.getState().myPlayerId,; });
  - **[ADV-04] Contract Regression on Living Test TC-280.11 & Unregistered Dynamic Purge Hook**
    - **Vector**: Living Test Collision (ADV-REG) / Trapped State
    - **Scenario**: Living contract test [`tests/contracts/imp280_trade_offer_dual_dispatch_guard.test.ts#L326-L333`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp280_trade_offer_dual_dispatch_guard.test.ts#L326-L333) (`TC-280.11`) asserts: markTradeOfferResolved?.('adversarial_test_0'); purgeClientMatchSession(); expect(markTradeOfferResolved?.('adversarial_test_0')).toBe(true); The plan removes `resetTradeOfferResolutions()` from `client_session_purger.ts` and replaces it with dynamic iteration over `sessionPurgeHooks`. However, `src/client/ui/modals/bot_trade_offer_strip.tsx` is NOT in the plan's target files, has no snippet, and is never wired to register with `registerSessionPurgeHook`. Even if wired inside `bot_trade_offer_strip.tsx` via `useEffect`, when the component unmounts (e.g., when the trade offer expires or closes), the cleanup removes the hook from `sessionPurgeHooks`. When `purgeClientMatchSession()` runs later on match exit or reset, the hook is not in the set!
    - **Consequence**: `TC-280.11` fails immediately with a living contract regression. `resolvedTradeOfferIds` leaks across matches. Bot trade offers with previously resolved IDs are permanently suppressed in new matches.
    - **Hardening Directive**: Decouple trade tracking from UI by extracting `resolvedTradeOfferIds`, `markTradeOfferResolved`, and `resetTradeOfferResolutions` into a pure Tier 1 leaf module: `src/client/network/trade_offer_tracker.ts` (<= 35 LOC). `client_session_purger.ts` statically imports `resetTradeOfferResolutions` from `trade_offer_tracker.ts` (zero cycles, zero UI imports). `bot_trade_offer_strip.tsx` imports `markTradeOfferResolved` from `trade_offer_tracker.ts`. Discard `registerSessionPurgeHook` entirely.
  - **[ADV-05] Compilation Failure & Identity Desync in Activity Tracker Options**
    - **Vector**: Unstated Assumption / Subsystem Drift
    - **Scenario**: In `src/client/network/activity_tracker.ts`, the plan replaces `useLobbyStore.getState().myPlayerId || 'p1'` with `options?.myPlayerId || 'p1'`. However, `TrackDeltaActivitiesOptions` at [`activity_tracker.ts#L201-L204`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/activity_tracker.ts#L201-L204) is declared as: export interface TrackDeltaActivitiesOptions { readonly suppressFinancialAndProperty?: boolean; readonly suppressKinematicLogging?: boolean; } The plan does not update `TrackDeltaActivitiesOptions` to include `readonly myPlayerId?: string;`.
    - **Consequence**: TypeScript compilation fails with `Property 'myPlayerId' does not exist on type 'TrackDeltaActivitiesOptions'`.
    - **Hardening Directive**: Update `TrackDeltaActivitiesOptions` in `src/client/network/activity_tracker.ts` to include `readonly myPlayerId?: string;`.

### Trạm 1: Bộ Kiểm Thử Hợp Đồng Độc Lập (`qa-tester`)
- **Tệp kiểm thử hợp đồng**: [`tests/client/imp422_client_network_subscribers_zero_cycle.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp422_client_network_subscribers_zero_cycle.test.ts)
- **Chỉ số kiểm thử**: **21 atomic tests**, **52 asserts** (mật độ trung bình: 2.48 asserts/test, 0 vòng lặp).
- **Adversarial Inversion Gate**:
  - Trạng thái: **Semantic Behavioral RED Verified (Thất bại do vi phạm ràng buộc runtime assertion khi chưa cập nhật code, không lỗi cú pháp)**.
  - **Bằng chứng thất bại (Failure Snippet)**:
```text
AssertionError: expected 1 to be 0 // Object.is equality
    at tests/client/imp422_client_network_subscribers_zero_cycle.test.ts:85:27
```

### Trạm 2: Triển Khai Mã Nguồn Tối Thiểu (`implementer`)
- **Tệp mã nguồn thay đổi**:
  - [`src/client/network/room_config_helpers.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/network/room_config_helpers.ts)
  - [`src/client/events/game_event_bus_types.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/game_event_bus_types.ts)
  - [`src/client/events/event_card_constants.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/event_card_constants.ts)
  - [`src/client/network/trade_offer_tracker.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/network/trade_offer_tracker.ts)
  - [`src/client/store/lobby_store.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/store/lobby_store.ts)
  - [`src/client/offline_landing.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/offline_landing.ts)
  - [`src/client/network/client_session_purger.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/network/client_session_purger.ts)
  - [`src/client/network/apply_delta.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/network/apply_delta.ts)
  - [`src/client/network/activity_tracker.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/network/activity_tracker.ts)
  - [`src/client/events/game_event_bus.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/game_event_bus.ts)
  - [`src/client/events/subscribers/property_market_badge_handler.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/subscribers/property_market_badge_handler.ts)
  - [`src/client/events/subscribers/activity_log_subscriber.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/subscribers/activity_log_subscriber.ts)
  - [`src/client/events/subscribers/badge_event_subscriber.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/subscribers/badge_event_subscriber.ts)
  - [`src/client/events/subscribers/audio_event_subscriber.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/subscribers/audio_event_subscriber.ts)
  - [`src/client/events/subscribers/badge_financial_helpers.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/subscribers/badge_financial_helpers.ts)
  - [`src/client/events/subscribers/activity_log_financial_formatter.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/subscribers/activity_log_financial_formatter.ts)
  - [`src/client/ui/modals/bot_trade_offer_strip.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/bot_trade_offer_strip.tsx)
- **Chuyển trạng thái**: Toàn bộ **21/21 contract tests chuyển sang GREEN**.
- **Living Test Suites**: Bảo toàn nguyên vẹn, zero hồi quy logic hiện hành.

### Trạm 2.5: Fast Pre-Filter Mechanical Sweep (`scout` / `fast_prefilter.mjs`)
- **TypeScript**: `tsc --noEmit` vượt qua với 0 lỗi (Exit Code 0).
- **Dirty Casts**: Tuyệt đối không sử dụng `as any` hoặc dirty type casting.
- **LOC Ceilings**: Tất cả các tệp đều nằm trong hạn mức trần của từng phân hệ (Tier 1 <= 400, Tier 2 <= 500, Tier 3 <= 800, Test <= 600).

### Trạm 3: Thẩm Định Độc Lập Từ Đĩa Vật Lý (Independent Station 3 Reviews)
1. **Spec & Scope Gatekeeper (`spec-reviewer`)**:
    - **Phán quyết**: **APPROVED** 📋
    - **Xác nhận phạm vi**: 100% các thay đổi nằm trong phân hệ mục tiêu (`client-state`), zero scope creep.
2. **Deep Architecture & Anti-Slop Auditor (`code-reviewer`)**:
    - **Phán quyết**: **APPROVED** 🛡️
    - **Chỉ số Anti-Slop**: 0 violations trên 6 cờ cảnh báo (Deep modules, Zero pass-through wrappers, Zero TIDD).
    - **Quản lý Bộ nhớ & Bất đồng bộ V8**: Vòng đời listener giải phóng triệt để qua closure unregister (Set-based cleanup, zero memory leak); cơ chế cô lập ngoại lệ (subscriber isolation via try/catch) đảm bảo lỗi ở subscriber độc hại không làm đứt chuỗi dispatch đồng bộ trên V8 event loop; bộ đệm FIFO-100 của trade offer tracker giới hạn trần 100 mục, chặn đứng nguy cơ phình bộ nhớ heap. Loại bỏ hoàn toàn các khái niệm văn mẫu đa luồng không phù hợp với runtime V8.


### Trạm 4: Cơ Chế Biên & Tiêu Diệt Biến Dị (`chaos-sentinel`)
- **Phán quyết**: **APPROVED 💥**
- **Hiệu quả kiểm soát**: 23/23 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived).
- **Xác nhận**: Đã vượt qua kiểm toán cơ học `node scripts/check_evidence.mjs` với 0 defects.

---

## 4. THỐNG KÊ BIẾN ĐỘNG DÒNG MÃ (LOC ACCOUNTING)

### 4.1. Phạm Vi Trực Tiếp Của Ticket IMP-422 (Direct Scope)

| Tệp Mã Nguồn | Đường Dẫn | Phân Hệ / Tier | LOC Thực Tế (SLOC) | Dòng Vật Lý (Disk) | Ngân Sách Trần | Trạng Thái |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `room_config_helpers.ts` | [`src/client/network/room_config_helpers.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/network/room_config_helpers.ts) | Tier 1 (Domain/Server/Logic) | **59 SLOC** | 66 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `game_event_bus_types.ts` | [`src/client/events/game_event_bus_types.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/game_event_bus_types.ts) | Tier 1 (Domain/Server/Logic) | **14 SLOC** | 16 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `event_card_constants.ts` | [`src/client/events/event_card_constants.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/event_card_constants.ts) | Tier 1 (Domain/Server/Logic) | **13 SLOC** | 14 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `trade_offer_tracker.ts` | [`src/client/network/trade_offer_tracker.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/network/trade_offer_tracker.ts) | Tier 1 (Domain/Server/Logic) | **16 SLOC** | 18 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `lobby_store.ts` | [`src/client/store/lobby_store.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/store/lobby_store.ts) | Tier 1 (Domain/Server/Logic) | **243 SLOC** | 278 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `offline_landing.ts` | [`src/client/offline_landing.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/offline_landing.ts) | Tier 1 (Domain/Server/Logic) | **137 SLOC** | 145 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `client_session_purger.ts` | [`src/client/network/client_session_purger.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/network/client_session_purger.ts) | Tier 1 (Domain/Server/Logic) | **50 SLOC** | 59 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `apply_delta.ts` | [`src/client/network/apply_delta.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/network/apply_delta.ts) | Tier 1 (Domain/Server/Logic) | **214 SLOC** | 239 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `activity_tracker.ts` | [`src/client/network/activity_tracker.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/network/activity_tracker.ts) | Tier 1 (Domain/Server/Logic) | **259 SLOC** | 295 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `game_event_bus.ts` | [`src/client/events/game_event_bus.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/game_event_bus.ts) | Tier 1 (Domain/Server/Logic) | **81 SLOC** | 98 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `property_market_badge_handler.ts` | [`src/client/events/subscribers/property_market_badge_handler.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/subscribers/property_market_badge_handler.ts) | Tier 1 (Domain/Server/Logic) | **184 SLOC** | 199 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `activity_log_subscriber.ts` | [`src/client/events/subscribers/activity_log_subscriber.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/subscribers/activity_log_subscriber.ts) | Tier 1 (Domain/Server/Logic) | **314 SLOC** | 349 Lines | <= 400 LOC | 🛑 Vùng đệm phong tỏa (349/350 LOC) |
| `badge_event_subscriber.ts` | [`src/client/events/subscribers/badge_event_subscriber.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/subscribers/badge_event_subscriber.ts) | Tier 1 (Domain/Server/Logic) | **265 SLOC** | 293 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `audio_event_subscriber.ts` | [`src/client/events/subscribers/audio_event_subscriber.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/subscribers/audio_event_subscriber.ts) | Tier 1 (Domain/Server/Logic) | **115 SLOC** | 132 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `badge_financial_helpers.ts` | [`src/client/events/subscribers/badge_financial_helpers.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/subscribers/badge_financial_helpers.ts) | Tier 1 (Domain/Server/Logic) | **113 SLOC** | 121 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `activity_log_financial_formatter.ts` | [`src/client/events/subscribers/activity_log_financial_formatter.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/subscribers/activity_log_financial_formatter.ts) | Tier 1 (Domain/Server/Logic) | **115 SLOC** | 125 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `bot_trade_offer_strip.tsx` | [`src/client/ui/modals/bot_trade_offer_strip.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/bot_trade_offer_strip.tsx) | Tier 2 (UI/3D/Views) | **228 SLOC** | 253 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `imp422_client_network_subscribers_zero_cycle.test.ts` | [`tests/client/imp422_client_network_subscribers_zero_cycle.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp422_client_network_subscribers_zero_cycle.test.ts) | Living Test | **406 SLOC** | 481 Lines | <= 600 LOC | ✅ Đạt chuẩn |

---

## 5. ĐÁNH GIÁ VẬN HÀNH & BÀN GIAO TIẾP THEO

- **Tính toàn vẹn hệ thống**: Gói cải tiến hoàn thành theo đúng nguyên tắc Zero-Blindness, cung cấp đầy đủ bằng chứng vật lý từ mã nguồn, kiểm thử hợp đồng, giải thuật đồ thị Tarjan SCC (0 chu trình vòng) đến biên bản kiểm toán độc lập. Vé cải tiến thuộc phân hệ Client State / Event Bus / Network (không can thiệp lưới 3D hay camera viewport).
- **Sẵn sàng triển khai**: Mã nguồn đã sẵn sàng đóng gói và triển khai lên môi trường sản phẩm.

### Sổ Theo Dõi Nợ Kỹ Thuật & Cổng Chặn Cơ Học (Tech Debt Hard Gates)
- 🛑 **QUY TẮC CHẶN CƠ HỌC: PHONG TỎA VÙNG ĐỆM LOC [DEBT-CAM-01 / HARD GATE]**: Tệp [`src/client/events/subscribers/activity_log_subscriber.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/events/subscribers/activity_log_subscriber.ts) hiện đạt **349 LOC vật lý** (314 SLOC), chỉ cách lằn ranh đỏ phong tỏa 350 LOC đúng **1 dòng duy nhất**. Kích hoạt điều khoản hiến pháp *LOC Buffer Zone Guard*: **NGHIÊM CẤM** bổ sung trực tiếp bất kỳ dòng code logic nào vào tệp này. Mọi ticket/PR tương lai can thiệp tệp này **BẮT BUỘC** phải có bước **Refactor-First** trích xuất các helper định dạng chuỗi, phân loại sự kiện (e.g. `activity_log_formatters.ts`) thành leaf seam độc lập để hạ tệp xuống dưới <= 250 LOC trước khi được phê duyệt.


