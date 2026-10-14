# PLAN_IMP_396_SERVER_SESSION_AND_TRADE_FACADE_WIRING

## 0. Mục Tiêu Kiến Trúc (Architectural Objective - Phase 3 / Slice 3B)
1. **Đấu nối 1:1 Cụm Session, Proxy & Trade Helper phía Server (`3` Cohesive Units) qua `src/domain/index.ts` và `src/domain/bot/index.ts`**:
   - Chuyển đổi toàn bộ các câu lệnh import trực tiếp vào tệp lá của `src/domain/` (`room.js`, `property_manager.js`) và `src/domain/bot/` (`bot_negotiation_brain.js`, `bot_engine.js`) trong 3 mô-đun điều phối trọng yếu phía Server:
     1. `src/server/trade_coordinator_helper.ts` (`cohesiveFamily`: `src/server/trade`) — chuyển `../domain/room.js` sang `../domain/index.js` và `../domain/bot/bot_negotiation_brain.js` sang `../domain/bot/index.js` (`34 -> 32 LOC`).
     2. `src/server/game_room_session.ts` (`cohesiveFamily`: `src/server/game`) — gộp 2 dòng import từ `../domain/room.js` và `../domain/property_manager.js` thành 1 dòng import từ `../domain/index.js`, đồng thời chuyển `../domain/bot/bot_engine.js` sang `../domain/bot/index.js` (`130 -> 129 LOC`).
     3. `src/server/session_proxy_facade.ts` (`cohesiveFamily`: `src/server/session`) — chuyển `../domain/bot/bot_engine.js` sang `../domain/bot/index.js` (`295 -> 295 LOC`).
2. **Bảo toàn 100% đồng bộ `RoomBotPersonalityMap`, `BotPersonalityMapFacade` & `handleBotRecipientTrade` (Pure-Move Quarantine & Zero Barrel Cycle)**:
   - Giữ nguyên 100% hành vi chuẩn hóa khóa phòng (`normalizeKey`, tiền tố `${roomCode.toUpperCase()}:`) giữa `RoomBotPersonalityMap` (`game_room_session.ts`) và `BotPersonalityMapFacade` (`session_proxy_facade.ts`), cũng như bộ nhớ từ chối giao dịch `recordTradeRejection` khi `buyer.isBot === true` trong `handleBotRecipientTrade` (`trade_coordinator_helper.ts`).
   - Duy trì `0` chu trình phụ thuộc vòng (`0 SCCs`) trên toàn bộ `src/domain/**` và không phát sinh bất kỳ SCC mới nào trên `src/server/**`.
3. **Tuân thủ nghiêm ngặt trần `<= 3` Cohesive Units của `audit_plan.mjs`**:
   - Khai báo tường minh `**Target physical file**:` cho toàn bộ **4/4 tệp** trong Bảng 1 (thuộc đúng `3` cụm họ tệp gắn kết `src/server/trade`, `src/server/game`, `src/server/session`).
   - 3 cụm họ tệp còn lại ngoài họ `room_*` có gọi vào `domain/bot/` (`src/server/network/reconnect_manager.ts`, `src/client/store/lobby_store.ts` & `lobby_types.ts`, `src/client/store/game_store_subtypes.ts` & `game_store_state_types.ts` & `game_store.ts`) được phân bổ sang `[DEFERRED TO TICKET-IMP-397: Phase 3 Slice 3C Reconnect Manager and Client Store Bot/Domain Facade Encapsulation]` để tuân thủ trần tối đa `<= 3` cohesive units mỗi Plan của `rules_scope.mjs`.

## 1. Phạm Vi Tệp & Ngân Sách Dòng Lệnh (Direct Scope & Honest LOC Accounting)

| File Path | Tier | Current LOC | Expected LOC | Net Delta | Ceiling | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/server/trade_coordinator_helper.ts` | Tier 1 (Server) | 34 | 32 | ~-2 | 400 | Safe |
| `src/server/game_room_session.ts` | Tier 1 (Server) | 130 | 129 | ~-1 | 400 | Safe |
| `src/server/session_proxy_facade.ts` | Tier 1 (Server) | 295 | 295 | 0 | 400 | Safe |
| `docs/FEATURE_MAP.md` | Tier 3 (Docs) | 92 | 92 | 0 | 800 | Safe |
| `tests/domain/imp396_server_session_and_trade_facade_wiring.test.ts` | Living Test | 0 | 220 | ~+220 | 600 | Safe (New File) |

## 2. Nghiên Cứu Tiền Trạm & Bất Biến (Pre-Flight Research & Invariants)
- **1:1 Target Physical File & Cohesive Unit Parity**: Cả 3 tệp nguồn trong `src/server/` (`trade_coordinator_helper.ts`, `game_room_session.ts`, `session_proxy_facade.ts`) cùng `docs/FEATURE_MAP.md` đều có khai báo `**Target physical file**:` khớp 1:1 giữa Mục 1 và Mục 4 (`4/4` files, `3` cohesive units `<= 3` max).
- **Zero Leaf Domain/Bot Import Invariant**: Sau khi hoàn tất Slice 3B, cả 3 tệp `trade_coordinator_helper.ts`, `game_room_session.ts`, `session_proxy_facade.ts` cộng với 7 tệp `src/server/room_*.ts` từ Slice 3A (tổng cộng **10/10 tệp** lõi điều phối phòng và phiên của Server) đều import độc quyền qua `../domain/index.js` và `../domain/bot/index.js` (`0` import trỏ vào tệp lá của `src/domain/` hoặc `src/domain/bot/`).
- **Bot Trade Rejection Memory & Buyer-Bot Gate Invariant (`[ADV-01]`)**: Trong `handleBotRecipientTrade` (`src/server/trade_coordinator_helper.ts#L26-L32`), khi `decision.accept === false`, hệ thống chỉ gọi `recordTradeRejection(buyer, cellIndex, round, offeredCellIndex)` khi `buyer.isBot === true` (sử dụng `round = ctx.room.roundCount ?? ctx.room.round ?? 1`, cập nhật `buyer.cellTradeRejections` và `buyer.cellLastRejectedRound`) và trả về `{ success: false, reason: ActionRejectReason.TRADE_REJECTED }`.
- **Session & BotPersonality Map Proxy Protocol Invariant (`[ADV-02]`)**: `RoomBotPersonalityMap` (`game_room_session.ts`) và `BotPersonalityMapFacade` (`session_proxy_facade.ts`) bảo toàn đối xứng khóa kép (`botId` và `${roomCode}:${botId}` không phân biệt hoa thường trên tập giá trị chuẩn `BotPersonality.Passive | BotPersonality.Balanced | BotPersonality.Aggressive`) cùng việc dọn sạch bộ hẹn giờ (`clearTimers`) khi xóa phiên qua `SessionFieldMapFacade`.

## 3. Station 1: Đặc Tả Kiểm Thử Hợp Đồng (RED - Contract Specification)
**Target test file**: `tests/domain/imp396_server_session_and_trade_facade_wiring.test.ts`

1. **`TC-396.01`**: `[UC-ARCH-003/MSS]` **Given** 3 tệp điều phối phiên và giao dịch Server (`src/server/trade_coordinator_helper.ts`, `src/server/game_room_session.ts`, `src/server/session_proxy_facade.ts`) cùng tập hợp 7 tệp `src/server/room_*.ts`, **When** phân tích AST toàn bộ các câu lệnh `import` trỏ vào `domain/` và `domain/bot/`, **Then** cả 3 tệp mục tiêu của `IMP-396` có `0` câu lệnh import trỏ vào tệp lá (`room.js`, `property_manager.js`, `bot_engine.js`, `bot_negotiation_brain.js`) và toàn bộ 10/10 tệp đều định tuyến độc quyền qua `../domain/index.js` và `../domain/bot/index.js`.
2. **`TC-396.02`**: `[UC-GAME-007/MSS]` **Given** ngữ cảnh thương lượng trong `src/server/trade_coordinator_helper.ts` với người bán là Bot `b1` (`BotPersonality.Balanced`, sở hữu ô `1` giá gốc `600`) và người mua là Bot `b2` (`b2.isBot = true`, sở hữu ô `3`, dòng tiền hỗn hợp `balance = 5000 + 2000 - 500` sau khi nhận lương GO `+2000` và trả nợ trái phiếu `-500`, đề nghị đổi ô `offeredCellIndex = 3` kèm giá bù thấp `100` ở `roundCount = 4`), **When** gọi `handleBotRecipientTrade` cho đề nghị mua ô `1` với giá `100` và `offeredCellIndex = 3`, **Then** hàm trả về `{ success: false, reason: ActionRejectReason.TRADE_REJECTED }`, ghi nhận `b2.cellTradeRejections[1] === 1`, `b2.cellLastRejectedRound[1] === 4`, và `b2.swapPairLastRejectedRound['1_3'] === 4`.
3. **`TC-396.03`**: `[UC-GAME-007/A1]` **Given** ngữ cảnh thương lượng trong `src/server/trade_coordinator_helper.ts` với người bán là Bot `b1` (`BotPersonality.Aggressive`, sở hữu ô `39` giá gốc `4000`) và người mua là người chơi thật `p1` (`p1.isBot = false`, trả giá thấp `500`) hoặc đề nghị mua đứt giá cao hợp lệ (`price = 12000` cho ô `1` của Bot `Balanced`), **When** gọi `handleBotRecipientTrade` trên cả hai trường hợp, **Then** đề nghị trả giá thấp của người chơi thật bị từ chối với `ActionRejectReason.TRADE_REJECTED` mà không tạo `p1.cellTradeRejections` (`undefined`), còn đề nghị giá cao hợp lệ được chấp thuận với `{ success: true }`.
4. **`TC-396.04`**: `[UC-GAME-002/MSS]` **Given** một thực thể `GameRoomSession` khởi tạo từ `createRoom('p1', 'vt396s')` trong `src/server/game_room_session.ts`, **When** thiết lập tính cách `BotPersonality.Aggressive` qua khóa có tiền tố `'VT396S:bot-1'` trên `session.botPersonalities` và kiểm tra vòng đời `toContext()` / `destroy()`, **Then** `session.botPersonalities.get('bot-1')` và `session.botPersonalities.get('vt396s:bot-1')` đều trả về `BotPersonality.Aggressive`, `session.toContext().botPersonalities` tham chiếu đúng bản đồ này, và sau `session.destroy()` kích thước `session.botPersonalities.size` về `0`.
5. **`TC-396.05`**: `[UC-GAME-008/MSS]` **Given** bảng phiên `sessions = new Map([['VT396P', session]])` được bọc bởi `createBotPersonalityMapFacade(sessions)` và `createSessionFieldProxy(sessions, 'rolledThisTurn')` từ `src/server/session_proxy_facade.ts`, **When** gọi `set('vt396p:b1', BotPersonality.Passive)` trên facade tính cách Bot và cập nhật `rolledThisTurn` qua proxy, **Then** `botFacade.get('VT396P:b1')` và `botFacade.get('b1')` đều trả về `BotPersonality.Passive`, `Array.from(botFacade.entries())` chứa `['VT396P:b1', BotPersonality.Passive]`, và `rolledProxy.get('vt396p')` phản ánh đúng trạng thái `session.rolledThisTurn`.
6. **`TC-396.06`**: `[UC-ARCH-003/A2]` **Given** toàn bộ các tệp nguồn trong `src/domain/**` sau khi đấu nối `trade_coordinator_helper.ts`, `game_room_session.ts`, và `session_proxy_facade.ts` vào `src/domain/index.ts` cùng `src/domain/bot/index.ts`, **When** thực thi thuật toán Tarjan `detectCycles` từ `scripts/boundary_linter/boundary_rules.mjs`, **Then** số chu trình phụ thuộc vòng (`SCCs`) trong `src/domain/**` bằng `0` (`[]`) và dung lượng vật lý của `trade_coordinator_helper.ts` giảm xuống `<= 32 LOC`, `game_room_session.ts` giảm xuống `<= 129 LOC`.

## 4. Station 2: Đặc Tả Triển Khai (GREEN - Implementation Specification)

### Task 1: Chuyển đổi `src/server/trade_coordinator_helper.ts` sang `../domain/index.js` và `../domain/bot/index.js`
**Target physical file**: `src/server/trade_coordinator_helper.ts`
```typescript
<<<<
import { ActionRejectReason, type Player } from '../domain/room.js';
import {
  evaluateBotTradeDecision,
  recordTradeRejection,
} from '../domain/bot/bot_negotiation_brain.js';
====
import { ActionRejectReason, type Player } from '../domain/index.js';
import { evaluateBotTradeDecision, recordTradeRejection } from '../domain/bot/index.js';
>>>>
```

### Task 2: Chuyển đổi `src/server/game_room_session.ts` sang `../domain/index.js` và `../domain/bot/index.js` (loại bỏ dead type import `CurrentAuctionState`)
**Target physical file**: `src/server/game_room_session.ts`
```typescript
<<<<
import type { Room, CurrentAuctionState } from '../domain/room.js';
import type { PropertyRegistry, PropertyStateMap } from '../domain/property_manager.js';
import type { AuctionSession } from './auction_manager.js';
import type { AuctionResult } from './room_manager.js';
import type { RoomContext } from './room_property_coordinator.js';
import { BotPersonality } from '../domain/bot/bot_engine.js';
====
import type { Room, PropertyRegistry, PropertyStateMap } from '../domain/index.js';
import type { AuctionSession } from './auction_manager.js';
import type { AuctionResult } from './room_manager.js';
import type { RoomContext } from './room_property_coordinator.js';
import { BotPersonality } from '../domain/bot/index.js';
>>>>
```

### Task 3: Chuyển đổi `src/server/session_proxy_facade.ts` sang `../domain/bot/index.js`
**Target physical file**: `src/server/session_proxy_facade.ts`
```typescript
<<<<
import type { GameRoomSession } from './game_room_session.js';
import type { AuctionResult } from './room_manager.js';
import { BotPersonality } from '../domain/bot/bot_engine.js';
====
import type { GameRoomSession } from './game_room_session.js';
import type { AuctionResult } from './room_manager.js';
import { BotPersonality } from '../domain/bot/index.js';
>>>>
```

### Task 4: Cập nhật `docs/FEATURE_MAP.md` (Knowledge Fold)
**Target physical file**: `docs/FEATURE_MAP.md`
- **Call-Site Wiring**: Cập nhật dòng Pillar **04 (Bilateral P2P Trade & Diplomacy)**, Pillar **11 (FSM Lifecycle & WebSocket Sync)** và Pillar **12 (Bot AI Negotiation Brain & Strategy)** tại `docs/FEATURE_MAP.md` ghi nhận `IMP-396` (đấu nối `trade_coordinator_helper.ts`, `game_room_session.ts`, và `session_proxy_facade.ts` qua mặt tiền chuẩn `src/domain/index.ts` và `src/domain/bot/index.ts`, nâng tổng số tệp điều phối phòng/phiên Server sử dụng Facade lên 10/10 tệp với 0 SCCs trong `src/domain/**`), giữ nguyên tổng số dòng của tệp (`92 lines`).

## 5. Definition of Done (DoD) & Ranh Giới Dừng (Stopping Boundary)
1. **100% Facade Encapsulation cho Session, Proxy & Trade Helper**: Cả 3 tệp `src/server/trade_coordinator_helper.ts`, `src/server/game_room_session.ts`, và `src/server/session_proxy_facade.ts` không còn bất kỳ câu lệnh import nào trỏ vào tệp lá của `src/domain/` hay `src/domain/bot/`, đồng thời duy trì `0 SCCs` trên toàn bộ `src/domain/**`.
2. **1:1 Target Physical File Parity (`4/4` files across `3` Cohesive Units)**: Khớp tuyệt đối danh mục tệp giữa Bảng 1 và các nhãn `**Target physical file**:` tại Mục 4 (`src/server/trade`, `src/server/game`, `src/server/session`).
3. **Mechanical Gates & Evidence Verification**: Pass 100% `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_396_SERVER_SESSION_AND_TRADE_FACADE_WIRING.md --auto-sign`, `npm run prefilter`, `node scripts/check_scope.mjs`, `npm run sentinel -- --ticket IMP-396 --test tests/domain/imp396_server_session_and_trade_facade_wiring.test.ts --src src/server/trade_coordinator_helper.ts`, và `node scripts/check_evidence.mjs IMP-396`.
4. **Stopping Boundary**: Hoàn tất trọn vẹn Phase 3 — Slice 3B (`IMP-396`) và dừng lại báo cáo trước khi chuyển sang Slice 3C (`IMP-397`).

<!-- AUDIT_STATUS: HARDENED_APPROVED -->
