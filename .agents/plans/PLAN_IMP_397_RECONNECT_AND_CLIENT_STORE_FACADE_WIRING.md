# PLAN_IMP_397_RECONNECT_AND_CLIENT_STORE_FACADE_WIRING

## 0. Mục Tiêu Kiến Trúc (Architectural Objective - Phase 3 / Slice 3C)
1. **Đóng gói 100% bề mặt tiêu thụ `domain/bot/` trên toàn bộ kho mã nguồn (`src/server/**` & `src/client/**`) và chuẩn hóa 100% `src/client/store/**` qua Facade (`3` Cohesive Units)**:
   - Chuyển đổi toàn bộ các câu lệnh import trực tiếp vào tệp lá của `domain/` và `domain/bot/` trong 3 cụm họ tệp gắn kết còn lại:
     1. Cụm `src/server/network/reconnect` (`src/server/network/reconnect_manager.ts` — `287 -> 287 LOC`): Chuyển `../../domain/bot/bot_engine.js` sang `../../domain/bot/index.js`.
     2. Cụm `src/client/store/lobby` (`src/client/store/lobby_store.ts` — `279 -> 278 LOC`, và `src/client/store/lobby_types.ts` — `98 -> 98 LOC`): Gộp import `pawn_assignment` + `name_generator` và chuyển `theme` sang `../../domain/index.js`; chuyển `bot_engine` sang `../../domain/bot/index.js`.
     3. Cụm `src/client/store/game` (`src/client/store/game_store_subtypes.ts` — `230 -> 230 LOC`, `src/client/store/game_store_state_types.ts` — `199 -> 199 LOC`, và `src/client/store/game_store.ts` — `197 -> 197 LOC`): Gộp import `room.js`, `bond_types.js`, `event_card_engine.js`, `transit_wheel.js`, và `emotes` sang `../../domain/index.js`; chuyển `bot_types.js` sang `../../domain/bot/index.js`.
2. **Bảo toàn 100% hành vi nghiệp vụ (Pure-Move Quarantine & Zero Barrel Cycle)**:
   - Giữ nguyên 100% logic tiếp quản Bot khi hết hạn 60s (`ReconnectManager.handleGraceExpired` -> `BotEngine.takeover`, kiểm tra `isSocketConnected`, thông báo `onAllHumansDisconnected`), xoay vòng tính cách Bot tại sảnh chờ (`toggleBotSlot`, `cycleBotPersonality`), và bộ hẹn giờ tự xóa biểu cảm (`triggerEmote` sau `EMOTE_DISPLAY_DURATION_MS`).
   - Duy trì `0` chu trình phụ thuộc vòng (`0 SCCs`) trên toàn bộ `src/domain/**` và không phát sinh bất kỳ SCC mới nào trên `src/server/**` hay `src/client/**`.

## 1. Phạm Vi Tệp & Ngân Sách Dòng Lệnh (Direct Scope & Honest LOC Accounting)
- **Direct Scope**: `src/server/network/reconnect_manager.ts`, `src/client/store/lobby_store.ts`, `src/client/store/lobby_types.ts`, `src/client/store/game_store_subtypes.ts`, `src/client/store/game_store_state_types.ts`, `src/client/store/game_store.ts`, `docs/FEATURE_MAP.md`, `tests/domain/imp397_reconnect_and_client_store_facade_wiring.test.ts`

| File Path | Tier | Current LOC | Expected LOC | Net Delta | Ceiling | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/server/network/reconnect_manager.ts` | Tier 1 (Server) | 287 | 287 | 0 | 400 | Safe |
| `src/client/store/lobby_store.ts` | Tier 1 (Store) | 279 | 278 | ~-1 | 400 | Safe |
| `src/client/store/lobby_types.ts` | Tier 1 (Store) | 98 | 98 | 0 | 400 | Safe |
| `src/client/store/game_store_subtypes.ts` | Tier 1 (Store) | 230 | 230 | 0 | 400 | Safe |
| `src/client/store/game_store_state_types.ts` | Tier 1 (Store) | 199 | 199 | 0 | 400 | Safe |
| `src/client/store/game_store.ts` | Tier 1 (Store) | 197 | 197 | 0 | 400 | Safe |
| `docs/FEATURE_MAP.md` | Tier 3 (Docs) | 92 | 92 | 0 | 800 | Safe |
| `tests/domain/imp397_reconnect_and_client_store_facade_wiring.test.ts` | Living Test | 0 | 240 | ~+240 | 600 | Safe (New File) |

## 2. Nghiên Cứu Tiền Trạm & Bất Biến (Pre-Flight Research & Invariants)
- **1:1 Target Physical File & Cohesive Unit Parity**: Cả 6 tệp nguồn (`reconnect_manager.ts`, `lobby_store.ts`, `lobby_types.ts`, `game_store_subtypes.ts`, `game_store_state_types.ts`, `game_store.ts`) cùng `docs/FEATURE_MAP.md` đều có khai báo `**Target physical file**:` khớp 1:1 giữa Mục 1 và Mục 4 (`7/7` files, `3` cohesive units `<= 3` max).
- **100% Repository-Wide External `domain/bot/` Encapsulation Invariant**: Sau khi hoàn tất Slice 3C (`IMP-397`), trên toàn bộ kho mã nguồn `src/**` (bên ngoài `src/domain/bot/**` và tham chiếu kiểu nội bộ trong `src/domain/room.ts`), `0` tệp nào còn import trực tiếp vào tệp lá của `src/domain/bot/` (`bot_engine.ts`, `bot_types.ts`, `bot_negotiation_brain.ts`, `bot_posture.ts`,...); 100% giao tiếp đều đi qua mặt tiền `src/domain/bot/index.ts`.
- **100% Client Store Facade Encapsulation Invariant**: Toàn bộ các tệp trong `src/client/store/**` chỉ import các ký hiệu từ tầng Domain qua 3 mặt tiền chính thức (`../../domain/index.js`, `../../domain/bot/index.js`, `../../domain/protocol/index.js`), xóa sổ hoàn toàn import trỏ vào tệp lá của `src/domain/`.

## 3. Station 1: Đặc Tả Kiểm Thử Hợp Đồng (RED - Contract Specification)
**Target test file**: `tests/domain/imp397_reconnect_and_client_store_facade_wiring.test.ts`

1. **`TC-397.01`**: `[UC-ARCH-003/MSS]` **Given** toàn bộ các tệp nguồn trong `src/server/**` và `src/client/**` (đặc biệt là 6 tệp mục tiêu của `IMP-397`: `reconnect_manager.ts`, `lobby_store.ts`, `lobby_types.ts`, `game_store_subtypes.ts`, `game_store_state_types.ts`, `game_store.ts`), **When** phân tích AST toàn bộ các câu lệnh `import` / `export` trỏ vào `domain/`, **Then** số câu lệnh import trỏ vào tệp lá của `src/domain/bot/` trên toàn bộ `src/server/**` và `src/client/**` bằng `0`, và số câu lệnh import trỏ vào tệp lá của `src/domain/` trong toàn bộ `src/client/store/**` bằng `0`.
2. **`TC-397.02`**: `[UC-GAME-008/MSS]` **Given** một thực thể `ReconnectManager` (`gracePeriodMs: 50`, gọi `manager.clear()` khi kết thúc) quản lý phòng `'VT397R'` đã bắt đầu (`room.started = true`, `room.currentPlayerIndex = 0`) gồm 2 người chơi thật `p1` (dòng tiền hỗn hợp `balance = 5000 + 2000 - 500` sau khi qua GO `+2000` và nộp thuế `-500`) và `p2`, trong đó `p1` đang có token kết nối lại và bước vào thời gian ân hạn (`startGracePeriod('VT397R', 'p1')`), **When** gọi `handleGraceExpired('VT397R', 'p1')` khi socket của `p1` đã ngắt kết nối (`isSocketConnected` trả về `false`), **Then** `BotEngine.takeover` chuyển `p1.isBot` thành `true`, token của `p1` bị đánh dấu hết hạn (`isTokenValid(token) === false`), trạng thái phiên chuyển sang `SessionState.Disconnected`, hệ thống kích hoạt `runBotTurn('VT397R')` và phát thông điệp `'PLAYER_BOT_TAKEOVER'`.
3. **`TC-397.03`**: `[UC-GAME-008/A1]` **Given** một thực thể `ReconnectManager` (`gracePeriodMs: 50`, gọi `manager.clear()` khi kết thúc) với phòng `'VT397A'` đã bắt đầu (`room.started = true`), **When** thực thi `manager.handleGraceExpired('VT397A', 'p1')` khi socket của `p1` vẫn đang kết nối (`isSocketConnected` trả về `true`) hoặc khi người chơi thật cuối cùng `p2` bị `BotEngine` tiếp quản (`hasHuman === false`), **Then** ở trường hợp đầu `p1.isBot` giữ nguyên `false` và `session.state === SessionState.Connected`, còn ở trường hợp sau callback `onAllHumansDisconnected` nhận mã phòng `'VT397A'` đúng `1` lần và kết thúc sớm trước khi phát thông điệp `'PLAYER_BOT_TAKEOVER'`.
4. **`TC-397.04`**: `[UC-NET-002/MSS]` **Given** store sảnh chờ `useLobbyStore` (`src/client/store/lobby_store.ts`) và hàm `getNextBotPersonality` (`src/client/store/lobby_types.ts`), **When** khởi tạo sảnh chờ `initLobby('VT397L', 'p1', true)` và chuyển đổi tính cách Bot tại slot `1`, **Then** slot `0` của Host được gán màu từ `PLAYER_TOKEN_PALETTE` cùng tên động vật ngẫu nhiên hợp lệ, `toggleBotSlot(1)` tạo Bot với `BotPersonality.Balanced`, và `cycleBotPersonality(1)` xoay vòng chính xác từ `BotPersonality.Balanced` sang `BotPersonality.Aggressive` rồi `BotPersonality.Passive`.
5. **`TC-397.05`**: `[UC-UI-S01/MSS]` **Given** store trận đấu `useGameStore` (`src/client/store/game_store.ts`) chạy với bộ đếm thời gian giả lập (`vi.useFakeTimers()`), **When** kích hoạt biểu cảm cho người chơi `'p1'` qua `useGameStore` và để trôi qua khoảng thời gian `EMOTE_DISPLAY_DURATION_MS`, **Then** `turnPhase` khởi tạo bằng `TurnPhase.WaitingRoll`, ngay khi kích hoạt `activeEmotes['p1']?.emoteId === 'emote_laugh'`, và sau đúng `EMOTE_DISPLAY_DURATION_MS` mục `activeEmotes['p1']` tự động được dọn sạch (`undefined`).
6. **`TC-397.06`**: `[UC-ARCH-003/A2]` **Given** toàn bộ các tệp nguồn trong `src/domain/**` và `src/client/store/lobby_store.ts` sau khi đấu nối qua `src/domain/index.ts` cùng `src/domain/bot/index.ts`, **When** thực thi thuật toán Tarjan `detectCycles` từ `scripts/boundary_linter/boundary_rules.mjs`, **Then** số chu trình phụ thuộc vòng (`SCCs`) trong `src/domain/**` bằng `0` (`[]`) và dung lượng vật lý của `src/client/store/lobby_store.ts` giảm xuống `<= 278` dòng.

## 4. Station 2: Đặc Tả Triển Khai (GREEN - Implementation Specification)

### Task 1: Chuyển đổi `src/server/network/reconnect_manager.ts` sang `../../domain/bot/index.js`
**Target physical file**: `src/server/network/reconnect_manager.ts`
```typescript
<<<<
import { SessionState, GRACE_PERIOD_MS } from '../session_manager.js';
import { BotEngine } from '../../domain/bot/bot_engine.js';
import type { DeltaBroadcaster } from './delta_broadcaster.js';
====
import { SessionState, GRACE_PERIOD_MS } from '../session_manager.js';
import { BotEngine } from '../../domain/bot/index.js';
import type { DeltaBroadcaster } from './delta_broadcaster.js';
>>>>
```

### Task 2: Chuyển đổi `src/client/store/lobby_store.ts` và `src/client/store/lobby_types.ts` sang `../../domain/index.js` và `../../domain/bot/index.js`
**Target physical file**: `src/client/store/lobby_store.ts`
```typescript
<<<<
import { create } from 'zustand';
import { BotPersonality } from '../../domain/bot/bot_engine';
import { assignRandomPlayerPawns } from '../../domain/pawn_assignment';
import { generateRandomAnimalName } from '../../domain/name_generator';
====
import { create } from 'zustand';
import { BotPersonality } from '../../domain/bot/index.js';
import { assignRandomPlayerPawns, generateRandomAnimalName } from '../../domain/index.js';
>>>>
```

**Target physical file**: `src/client/store/lobby_types.ts`
```typescript
<<<<
import { PLAYER_TOKEN_PALETTE } from '../../domain/theme';
import { BotPersonality } from '../../domain/bot/bot_engine';
export { BotPersonality } from '../../domain/bot/bot_engine';
====
import { PLAYER_TOKEN_PALETTE } from '../../domain/index.js';
import { BotPersonality } from '../../domain/bot/index.js';
export { BotPersonality } from '../../domain/bot/index.js';
>>>>
```

### Task 3: Chuyển đổi `src/client/store/game_store_subtypes.ts`, `src/client/store/game_store_state_types.ts`, và `src/client/store/game_store.ts` sang `../../domain/index.js` và `../../domain/bot/index.js`
**Target physical file**: `src/client/store/game_store_subtypes.ts`
```typescript
<<<<
import { TurnPhase, type EventCardInfo, type MarketModifier, type PendingBuyoutSession } from '../../domain/room.js';
import type { PendingTradeOfferDelta, DiplomaticEventDelta } from '../../domain/protocol/index.js';
import type { BotPersonality } from '../../domain/bot/bot_types.js';
import type { BondContract } from '../../domain/bond_types.js';
import type { ChanceCardId } from '../../domain/event_card_engine.js';
import type { TransitWheelOutcome } from '../../domain/transit_wheel.js';
====
import {
  TurnPhase, type EventCardInfo, type MarketModifier, type PendingBuyoutSession,
  type BondContract, type ChanceCardId, type TransitWheelOutcome,
} from '../../domain/index.js';
import type { PendingTradeOfferDelta, DiplomaticEventDelta } from '../../domain/protocol/index.js';
import type { BotPersonality } from '../../domain/bot/index.js';
>>>>
```

**Target physical file**: `src/client/store/game_store_state_types.ts`
```typescript
<<<<
// [IMP-298] Game Store State & Action Type Definitions (Station 1 Stub)
import { TurnPhase, type EventCardInfo, type PendingBuyoutSession } from '../../domain/room.js';
import type { PendingTradeOfferDelta, DiplomaticEventDelta } from '../../domain/protocol/index.js';
====
// [IMP-298] Game Store State & Action Type Definitions (Station 1 Stub)
import { TurnPhase, type EventCardInfo, type PendingBuyoutSession } from '../../domain/index.js';
import type { PendingTradeOfferDelta, DiplomaticEventDelta } from '../../domain/protocol/index.js';
>>>>
```

**Target physical file**: `src/client/store/game_store.ts`
```typescript
<<<<
import { create } from 'zustand';
import { EMOTE_DISPLAY_DURATION_MS } from '../../domain/emotes';
import { createPawnActions } from './game_store_pawn_actions.js';
====
import { create } from 'zustand';
import { EMOTE_DISPLAY_DURATION_MS } from '../../domain/index.js';
import { createPawnActions } from './game_store_pawn_actions.js';
>>>>
```

### Task 4: Cập nhật `docs/FEATURE_MAP.md` (Knowledge Fold)
**Target physical file**: `docs/FEATURE_MAP.md`
- **Call-Site Wiring**: Cập nhật dòng Pillar **11 (FSM Lifecycle & WebSocket Sync)**, Pillar **12 (Bot AI Negotiation Brain & Strategy)** và Pillar **14 (UI & Tactile Ergonomics)** tại `docs/FEATURE_MAP.md` ghi nhận `IMP-397` (đóng gói 100% bề mặt tiêu thụ `src/domain/bot/` trên toàn bộ `src/server/**` và `src/client/**` qua `src/domain/bot/index.ts`, đồng thời chuẩn hóa 100% `src/client/store/**` qua `src/domain/index.ts`, `src/domain/bot/index.ts`, và `src/domain/protocol/index.ts`), giữ nguyên tổng số dòng của tệp (`92 lines`).

## 5. Definition of Done (DoD) & Ranh Giới Dừng (Stopping Boundary)
1. **100% External `domain/bot/` & Client Store Facade Encapsulation**: Không còn bất kỳ tệp nào trong `src/server/**` hay `src/client/**` import trực tiếp vào tệp lá của `src/domain/bot/`, và không còn tệp nào trong `src/client/store/**` import trực tiếp vào tệp lá của `src/domain/`, đồng thời duy trì `0 SCCs` trên toàn bộ `src/domain/**`.
2. **1:1 Target Physical File Parity (`7/7` files across `3` Cohesive Units)**: Khớp tuyệt đối danh mục tệp giữa Bảng 1 và các nhãn `**Target physical file**:` tại Mục 4 (`src/server/network/reconnect`, `src/client/store/lobby`, `src/client/store/game`).
3. **Mechanical Gates & Evidence Verification**: Pass 100% `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_397_RECONNECT_AND_CLIENT_STORE_FACADE_WIRING.md --auto-sign`, `npm run prefilter`, `node scripts/check_scope.mjs`, `npm run sentinel -- --ticket IMP-397 --test tests/domain/imp397_reconnect_and_client_store_facade_wiring.test.ts --src src/server/network/reconnect_manager.ts`, và `node scripts/check_evidence.mjs IMP-397`.
4. **Stopping Boundary**: Hoàn tất trọn vẹn Phase 3 — Slice 3C (`IMP-397`) và dừng lại báo cáo trước khi chuyển sang bước tiếp theo.

<!-- AUDIT_STATUS: HARDENED_APPROVED -->
