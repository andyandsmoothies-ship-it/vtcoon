# BÁO CÁO NGHIỆM THU HOÀN THÀNH TICKET IMP-397
## PLAN_IMP_397_RECONNECT_AND_CLIENT_STORE_FACADE_WIRING

> **Mã Ticket:** `IMP-397`  
> **Phân hệ thực tế:** `server-network`, `client-state`  
> **Ngày hoàn thành:** 2026-10-14  
> **Quy trình:** Closed-Loop 4-Station Pipeline (Tuân thủ nghiêm ngặt Hiến pháp AGENTS CONSTITUTION)  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED**

---

## 1. TỔNG QUAN & BỐI CẢNH VẤN ĐỀ

Sau khi hoàn tất Slice 3A (`IMP-395`) và Slice 3B (`IMP-396`), trên toàn bộ kho mã nguồn `src/server/**` và `src/client/**` vẫn còn đúng 4 tệp chọc trực tiếp vào các tệp lá nội bộ của `src/domain/bot/` (`src/server/network/reconnect_manager.ts`, `src/client/store/lobby_store.ts`, `src/client/store/lobby_types.ts`, và `src/client/store/game_store_subtypes.ts`), đồng thời 5 tệp trong phân hệ `src/client/store/**` còn import phân tán vào các tệp lá của `src/domain/` (`pawn_assignment`, `name_generator`, `theme`, `room.js`, `bond_types.js`, `event_card_engine.js`, `transit_wheel.js`, `emotes`).

Ticket `IMP-397` (Phase 3 — Slice 3C) giải quyết triệt để điểm mù đóng gói này trên 3 cụm Cohesive Units (`src/server/network/reconnect`, `src/client/store/lobby`, `src/client/store/game`):
- **Tại `src/server/network/reconnect_manager.ts`**: Chuyển hướng import `BotEngine` từ `../../domain/bot/bot_engine.js` sang mặt tiền `../../domain/bot/index.js` (`287 -> 287 Lines`, `256 SLOC`), bảo toàn 100% cơ chế ân hạn 60s (`startGracePeriod`, `handleGraceExpired`), kiểm tra chống race condition socket đang mở (`isSocketConnected`), tự động tiếp quản ghế (`BotEngine.takeover`, `runBotTurn`), và thu hồi phòng khi không còn người chơi thật (`onAllHumansDisconnected`).
- **Tại `src/client/store/lobby_store.ts` & `src/client/store/lobby_types.ts`**: Trong `lobby_store.ts`, chuyển import `BotPersonality` sang `../../domain/bot/index.js` và hợp nhất `assignRandomPlayerPawns`, `generateRandomAnimalName` qua `../../domain/index.js` (`279 -> 278 Lines`, `243 SLOC`). Trong `lobby_types.ts`, chuyển import `PLAYER_TOKEN_PALETTE` sang `../../domain/index.js` và import + re-export `BotPersonality` qua `../../domain/bot/index.js` (`98 -> 98 Lines`, `89 SLOC`).
- **Tại `src/client/store/game_store_subtypes.ts`, `src/client/store/game_store_state_types.ts`, & `src/client/store/game_store.ts`**: Trong `game_store_subtypes.ts`, hợp nhất `TurnPhase`, `type EventCardInfo`, `type MarketModifier`, `type PendingBuyoutSession`, `type BondContract`, `type ChanceCardId`, `type TransitWheelOutcome` qua `../../domain/index.js` và chuyển `type BotPersonality` sang `../../domain/bot/index.js` (`230 -> 230 Lines`, `216 SLOC`). Trong `game_store_state_types.ts`, chuyển import `TurnPhase`, `type EventCardInfo`, `type PendingBuyoutSession` từ `../../domain/room.js` sang `../../domain/index.js` (`199 -> 199 Lines`, `187 SLOC`). Trong `game_store.ts`, chuyển import `EMOTE_DISPLAY_DURATION_MS` từ `../../domain/emotes` sang `../../domain/index.js` (`197 -> 197 Lines`, `180 SLOC`), đưa số cảnh báo `SEAM-02` (`DOMAIN_BOT_BYPASS`) trên toàn dự án về `0` và đóng gói 100% `src/client/store/**` qua các mặt tiền Domain chính thức.

---

## 2. BẢNG TỔNG HỢP BẰNG CHỨNG QUY TRÌNH 4 TRẠM KHÉP KÍN

| Trạm Kiểm Soát | Vai Trò & Tệp Bằng Chứng | Chỉ Số Đạt Được | Kết Quả Thẩm Định |
| :--- | :--- | :--- | :---: |
| **Stage 0: Plan Review** | `adversarial-challenger` & `audit_plan.mjs`<br>[`.agents/audit/PLAN_AUDIT_IMP-397.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-397.md) | Thẩm định kế hoạch đạt 0 defects, 6 contract tests clean. | **HARDENED_APPROVED 🛡️** |
| **Trạm 1: RED Contract Test** | `qa-tester`<br>[`tests/domain/imp397_reconnect_and_client_store_facade_wiring.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/domain/imp397_reconnect_and_client_store_facade_wiring.test.ts) | 6 atomic tests, 24 asserts, 0 loops. Adversarial Inversion: Đã chứng minh RED runtime | **VERIFIED RED** 🎯 |
| **Trạm 2: GREEN Implementation** | `implementer`<br>[`.agents/evidence/IMP-397_snapshot.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/IMP-397_snapshot.json) | 6 production files + `docs/FEATURE_MAP.md` modified, 100% tests chuyển sang GREEN | **VERIFIED GREEN** 🟢 |
| **Trạm 2.5: Fast Pre-Filter** | `scout` & `fast_prefilter.mjs` | Typecheck `tsc --noEmit` exit 0, 0 dirty casts (`as any`), 0 `SEAM-02` warnings, LOC budgets đạt chuẩn | **100% PASS** 🚀 |
| **Trạm 3.1: Spec & Scope Gate** | `spec-reviewer`<br>[`.agents/audit/SPEC_REVIEW_IMP-397.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-397.md) | 100% Plan fidelity, zero scope creep, kiểm soát ranh giới phân hệ `server-network` & `client-state` | **APPROVED** 📋 |
| **Trạm 3.2: Architecture & Anti-Slop** | `code-reviewer`<br>[`.agents/audit/CODE_REVIEW_IMP-397.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-397.md) | 0 Slop red flags, Zero TIDD, an toàn bộ nhớ/timer, assertion density 4.00 | **APPROVED** 🛡️ |
| **Trạm 4: Chaos & Mutation Sentinel** | `chaos-sentinel`<br>[`scripts/check_evidence.mjs`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/check_evidence.mjs) | 23/23 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived). | **APPROVED 💥** |

---

## 3. KẾT QUẢ VẬN HÀNH 4 TRẠM KHÉP KÍN & PHẢN HỒI THẨM ĐỊNH (AUDIT & SUBAGENT FEEDBACK)

### Trạm 0: Thẩm Định Đối Kháng Kế Hoạch (`adversarial-challenger` & `audit_plan.mjs`)
- **Phán quyết**: **HARDENED_APPROVED 🛡️**
- **Nhật ký thẩm tra**: Thẩm định kế hoạch đạt 0 defects, 6 contract tests clean.
- **Điểm mù kiến trúc / phản biện đối kháng đã giải tỏa**:
  - **[ADV-OBJ] Objective Validity**
    - **Target reachable?**: Yes — all 6 target source files (`src/server/network/reconnect_manager.ts#L6`, `src/client/store/lobby_store.ts#L4-L6`, `src/client/store/lobby_types.ts#L3-L5`, `src/client/store/game_store_subtypes.ts#L2-L7`, `src/client/store/game_store_state_types.ts#L2-L3`, and `src/client/store/game_store.ts#L3`) are active production modules in the WebSocket Reconnect Coordinator and Client Zustand Stores (`useLobbyStore`, `useGameStore`).
    - **Baselines verified?**: Yes — Physical line counts and `<<<< ==== >>>>` drop-in replacement blocks match disk 1:1 across all 7 target files.
    - **Verdict**: PASS — All physical baselines, symbol bindings, LOC budgets, and surface area claims are verified on disk.
  - **[ADV-01] Concurrency & Reconnect Socket Race Preservation (`handleGraceExpired`)**
    - **Vector**: Concurrency / Pure-Move Behavior Preservation
    - **Scenario**: A human player's grace timer expires in `ReconnectManager.handleGraceExpired` (`src/server/network/reconnect_manager.ts#L162-L180`) on the exact tick their WebSocket connection is live (`isSocketConnected(roomCode, playerId) === true`), or the last remaining human disconnects (`hasHuman === false` at `#L218`).
    - **Consequence**: If `BotEngine` facade rewiring altered import bindings or execution order, an active human could be erroneously converted into a Bot or a bot-only room could leak without triggering `onAllHumansDisconnected`.
    - **Hardening Directive**: Anticipated by Plan — Task 1 (`#L45-L56`) performs a strict 1-line pure import path swap (`../../domain/bot/bot_engine.js` -> `../../domain/bot/index.js`), and `TC-397.02` / `TC-397.03` (`#L36-L37`) explicitly verify both the live-socket early return (`isSocketConnected === true` keeping `p1.isBot === false` and `SessionState.Connected`), the `runBotTurn` trigger when `currentPlayerIndex === 0` (`[LOW-02]`), the `onAllHumansDisconnected` early return when `hasHuman === false`, and deterministic timer cleanup via `gracePeriodMs: 50` + `manager.clear()` (`[LOW-01]`).
  - **[ADV-02] Ephemeral Emote Timer Self-Healing & Store Re-Export Continuity**
    - **Vector**: Partial Failure / Living Test Contract Preservation (`ADV-REG`)
    - **Scenario**: Rewiring `src/client/store/lobby_types.ts` and `src/client/store/game_store.ts` to import from `../../domain/index.js` and `../../domain/bot/index.js` could break downstream consumers that import `BotPersonality` from `lobby_store.ts` / `lobby_types.ts` or stall ephemeral `activeEmotes` cleanup if `EMOTE_DISPLAY_DURATION_MS` is undefined.
    - **Consequence**: Downstream UI components importing `BotPersonality` from `lobby_store` would fail compilation, or `activeEmotes[playerId]` would remain stuck in the HUD.
    - **Hardening Directive**: Anticipated by Plan — Task 2 (`#L74-L84`) preserves `export { BotPersonality } from '../../domain/bot/index.js';` in `src/client/store/lobby_types.ts#L5` (re-exported by `lobby_store.ts#L18`), and `TC-397.05` (`#L39`) verifies deterministic auto-cleanup of `activeEmotes['p1']` after `EMOTE_DISPLAY_DURATION_MS` (`3000` ms) under fake timers.

### Trạm 1: Bộ Kiểm Thử Hợp Đồng Độc Lập (`qa-tester`)
- **Tệp kiểm thử hợp đồng**: [`tests/domain/imp397_reconnect_and_client_store_facade_wiring.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/domain/imp397_reconnect_and_client_store_facade_wiring.test.ts)
- **Chỉ số kiểm thử**: **6 atomic tests**, **24 asserts** (mật độ trung bình: 4.00 asserts/test, 0 vòng lặp).
- **Adversarial Inversion Gate**:
  - Trạng thái: **Semantic Behavioral RED Verified (Thất bại do vi phạm ràng buộc runtime assertion khi chưa cập nhật code, không lỗi cú pháp)**.
  - **Bằng chứng thất bại (Failure Snippet)**:
```text
AssertionError: expected 14 to be +0 // Object.is equality (at tests/domain/imp397_reconnect_and_client_store_facade_wiring.test.ts:292:48) and AssertionError: expected 279 to be less than or equal to 278 (at tests/domain/imp397_reconnect_and_client_store_facade_wiring.test.ts:413:29)
```

### Trạm 2: Triển Khai Mã Nguồn Tối Thiểu (`implementer`)
- **Tệp mã nguồn thay đổi**:
  - [`src/server/network/reconnect_manager.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/network/reconnect_manager.ts)
  - [`src/client/store/lobby_store.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/store/lobby_store.ts)
  - [`src/client/store/lobby_types.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/store/lobby_types.ts)
  - [`src/client/store/game_store_subtypes.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/store/game_store_subtypes.ts)
  - [`src/client/store/game_store_state_types.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/store/game_store_state_types.ts)
  - [`src/client/store/game_store.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/store/game_store.ts)
  - [`docs/FEATURE_MAP.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/docs/FEATURE_MAP.md)
- **Chuyển trạng thái**: Toàn bộ **6/6 contract tests chuyển sang GREEN**.
- **Living Test Suites**: Bảo toàn nguyên vẹn, zero hồi quy logic hiện hành.

### Trạm 2.5: Fast Pre-Filter Mechanical Sweep (`scout` / `fast_prefilter.mjs`)
- **TypeScript**: `tsc --noEmit` vượt qua với 0 lỗi (Exit Code 0).
- **Dirty Casts**: Tuyệt đối không sử dụng `as any` hoặc dirty type casting.
- **LOC Ceilings**: Tất cả các tệp đều nằm trong hạn mức trần của từng phân hệ (Tier 1 <= 400, Tier 2 <= 500, Tier 3 <= 800, Test <= 600).

### Trạm 3: Thẩm Định Độc Lập Từ Đĩa Vật Lý (Independent Station 3 Reviews)
1. **Spec & Scope Gatekeeper (`spec-reviewer`)**:
    - **Phán quyết**: **APPROVED** 📋
    - **Xác nhận phạm vi**: 100% các thay đổi nằm trong 3 cụm Cohesive Units mục tiêu (`src/server/network/reconnect`, `src/client/store/lobby`, `src/client/store/game`), zero scope creep.
2. **Deep Architecture & Anti-Slop Auditor (`code-reviewer`)**:
    - **Phán quyết**: **APPROVED** 🛡️
    - **Chỉ số Anti-Slop**: 0 violations trên 6 cờ cảnh báo (Deep modules, Zero pass-through wrappers, Zero TIDD).
    - **Bộ nhớ & Timer**: Không rò rỉ listener, dọn dẹp triệt để `graceTimers` qua `manager.clear()` và timer biểu cảm qua `vi.useRealTimers()`.


### Trạm 4: Cơ Chế Biên & Tiêu Diệt Biến Dị (`chaos-sentinel`)
- **Phán quyết**: **APPROVED 💥**
- **Hiệu quả kiểm soát**: 23/23 mutants mục tiêu bị tiêu diệt (9 source mutants trên `reconnect_manager.ts` và 14 contract mutants; kill rate: 100%, 0 survived).
- **Xác nhận**: Đã vượt qua kiểm toán cơ học `node scripts/check_evidence.mjs` với 0 defects.

---

## 4. THỐNG KÊ BIẾN ĐỘNG DÒNG MÃ (LOC ACCOUNTING)

### 4.1. Phạm Vi Trực Tiếp Của Ticket IMP-397 (Direct Scope)

| Tệp Mã Nguồn | Đường Dẫn | Phân Hệ / Tier | LOC Thực Tế (SLOC) | Dòng Vật Lý (Disk) | Ngân Sách Trần | Trạng Thái |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `reconnect_manager.ts` | [`src/server/network/reconnect_manager.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/server/network/reconnect_manager.ts) | Tier 1 (Domain/Server/Logic) | **256 SLOC** | 287 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `lobby_store.ts` | [`src/client/store/lobby_store.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/store/lobby_store.ts) | Tier 1 (Domain/Server/Logic) | **243 SLOC** | 278 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `lobby_types.ts` | [`src/client/store/lobby_types.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/store/lobby_types.ts) | Tier 1 (Domain/Server/Logic) | **89 SLOC** | 98 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `game_store_subtypes.ts` | [`src/client/store/game_store_subtypes.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/store/game_store_subtypes.ts) | Tier 1 (Domain/Server/Logic) | **216 SLOC** | 230 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `game_store_state_types.ts` | [`src/client/store/game_store_state_types.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/store/game_store_state_types.ts) | Tier 1 (Domain/Server/Logic) | **187 SLOC** | 199 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `game_store.ts` | [`src/client/store/game_store.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/store/game_store.ts) | Tier 1 (Domain/Server/Logic) | **180 SLOC** | 197 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `FEATURE_MAP.md` | [`docs/FEATURE_MAP.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/docs/FEATURE_MAP.md) | Tier 3 (Documentation/SSOT) | **73 SLOC** | 92 Lines | <= 800 LOC | ✅ Đạt chuẩn |
| `imp397_reconnect_and_client_store_facade_wiring.test.ts` | [`tests/domain/imp397_reconnect_and_client_store_facade_wiring.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/domain/imp397_reconnect_and_client_store_facade_wiring.test.ts) | Living Test | **363 SLOC** | 416 Lines | <= 600 LOC | ✅ Đạt chuẩn |

---

## 5. ĐÁNH GIÁ VẬN HÀNH & BÀN GIAO TIẾP THEO

- **Tính toàn vẹn hệ thống**: Hoàn tất 100% việc đóng gói mặt tiền `src/domain/bot/index.ts` trên toàn bộ `src/server/**` và `src/client/**` (`0` cảnh báo `SEAM-02` còn lại trên toàn dự án) và 100% đóng gói `src/client/store/**` qua mặt tiền Domain mà không phát sinh chu trình phụ thuộc (`0 SCCs`).
- **Sẵn sàng triển khai**: Mã nguồn đã sẵn sàng đóng gói và chuyển sang lát cắt tiếp theo của Phase 3 (Audio & Client UI Facade Wiring).


