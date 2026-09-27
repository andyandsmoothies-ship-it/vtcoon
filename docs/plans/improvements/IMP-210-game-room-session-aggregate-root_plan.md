# [PLAN] IMP-210: GameRoomSession Aggregate Root & RoomManager Structural Pruning

> **Mã Ticket**: IMP-210 (Bước 2 của Chiến Lược Tái Cấu Trúc `RoomManager`)  
> **Phiên Bản**: Revision 3 (Cập nhật sau phản biện vật lý: Bổ sung Full Map Protocol cho Proxy, trích xuất `session_proxy_facade.ts`, và chuyển `doHandleEndTurn` sang Aggregate Root)  
> **Phân Hạng**: **One-Way Door** / Full Architectural Rigor (Thay đổi mô hình lưu trữ vi trạng thái phòng chơi sang DDD Aggregate Root)  
> **Cổng Phê Chuẩn**: **BẮT BUỘC DUYỆT (APPROVAL GATE REQUIRED)** trước khi kích hoạt quy trình 3 Trạm  
> **Mục Tiêu Cốt Lõi**:
> 1. Triệt tiêu hoàn toàn 9-10 `Map<string, T>` phân tán cấp class trong `RoomManager`.
> 2. Đóng gói toàn bộ vi trạng thái của một phòng chơi vào **`GameRoomSession` Aggregate Root** (DDD), giải quyết dứt điểm rủi ro rò rỉ bộ nhớ (Memory Leak) và trạng thái thây ma (Zombie State) khi tạo/đóng phòng.
> 3. Cung cấp cơ chế **Dynamic Map Facade** (`SessionFieldProxy`, `BotPersonalityMapFacade`, alias `rooms`) với **đầy đủ 100% Map protocol** (`[Symbol.iterator]`, `entries()`, `keys()`, `values()`, `size`, `forEach()`, `clear()`, `get()`, `set()`, `has()`, `delete()`), đặt tại module chuyên biệt `src/server/session_proxy_facade.ts`.
> 4. Chuyển giao điều phối vòng lặp lượt `doHandleEndTurnSession(session, ...)` nhận trực tiếp `GameRoomSession` thay vì ép nén/giải nén 5 Map qua proxy, giữ `doHandleEndTurn` cũ làm adapter.
> 5. Bảo toàn nguyên vẹn chữ ký các hàm exported trong `room_manager_lifecycle.ts` (`doCreateRoom`, `doJoinRoom`, `doStartGame`) để bảo vệ 100% các test suite import trực tiếp (`name_generator.test.ts`, `imp165_multiplayer_lobby_sync.test.ts`).
> 6. Đưa `src/server/room_manager.ts` từ 518 LOC về **~340 - 360 LOC** (dưới trần Tier 1 <= 400 LOC), chính thức đóng vĩnh viễn khoản nợ **`DEBT-ROOM-MGR-01`**.

---

## 1. PHẠM VI XÁC ĐỊNH (STRICT CONFINED SCOPE)

Phạm vi của Bước 2 bao gồm đúng 4 tệp server:
1. `src/server/game_room_session.ts` *(MỚI - ~95 LOC)*: Định nghĩa class `GameRoomSession` Aggregate Root đóng gói `Room`, `PropertyRegistry`, `PropertyStateMap`, `AuctionSession`, `rolledThisTurn`, `lastAuctionResult`, `activeTimers`, `lastActivity`, `botPersonalities`, tự động đồng bộ `room.currentAuction`.
2. `src/server/session_proxy_facade.ts` *(MỚI - ~95 LOC)*: Cung cấp `createSessionFieldProxy` và `createBotPersonalityMapFacade` với đầy đủ giao thức `Map` chuẩn (`[Symbol.iterator]`, `entries`, `keys`, `values`, `size`, `forEach`, `clear`). Bóc tách riêng để không làm phình `room_manager.ts`.
3. `src/server/room_manager.ts` *(REFACTOR SÂU - Giảm từ 518 về ~340-360 LOC)*: Chuyển sang lưu trữ duy nhất `sessions: Map<string, GameRoomSession>`, ủy quyền trực tiếp cho `GameRoomSession`, cung cấp Facades tương thích ngược cho tests.
4. `src/server/room_manager_lifecycle.ts` *(BỔ SUNG AGGREGATE ROOT & ADAPTER BẢO TOÀN)*: Thêm `doCreateRoomSession` và `doHandleEndTurnSession` (nhận trực tiếp `GameRoomSession`); giữ nguyên 100% các exported functions cũ làm adapter để bảo vệ test suite.

> [!IMPORTANT]
> **Cam Kết Bất Biến Tương Thích Ngược (Zero Test Breakage)**:
> Không sửa đổi chữ ký của bất kỳ public API nào trên `RoomManager`. 54 call sites trong 18 test suite cũ, toàn bộ 103 contract tests (2.549 tests) và toàn bộ 52 test files server (676 tests) phải tiếp tục pass 100% mà không cần sửa một dòng test code nào.

---

## 2. HIỆN TRẠNG VẬT LÝ & LÝ DO CẦN CHUYỂN ĐỔI SANG AGGREGATE ROOT

### 2.1. Hiện trạng: 9-10 Map Song Song Phân Tán (Scattered State Antipattern)
Hiện tại trong `src/server/room_manager.ts` (L59-L70):
```ts
export class RoomManager {
  private readonly rooms = new Map<string, Room>();
  private readonly registries = new Map<string, PropertyRegistry>();
  private readonly propertyStates = new Map<string, PropertyStateMap>();
  private readonly auctions = new Map<string, AuctionSession>();
  private readonly rolledThisTurn = new Map<string, boolean>();
  private readonly activeTimersMap = new Map<string, Set<NodeJS.Timeout>>();
  private readonly lastActivity = new Map<string, number>();
  private readonly botPersonalities = new Map<string, BotPersonality>();
  private readonly lastAuctionResults = new Map<string, AuctionResult>();
```

### 2.2. Hậu quả kiến trúc nghiêm trọng:
1. **Thiếu tính nguyên tử khi giải phóng tài nguyên (Non-Atomic Lifecycle)**:
   Khi đóng phòng (`doCloseRoom`), hàm phải nhận đến **11 tham số** và thực hiện `.delete(roomCode)` thủ công trên từng Map riêng rẽ. Nếu có một thuộc tính mới được thêm vào mà quên xóa trong `doCloseRoom` (như đã từng xảy ra với `lastAuctionResults`), tài nguyên của phòng cũ sẽ bị rò rỉ vĩnh viễn trong RAM.
2. **Khâu vá bối cảnh liên tục (Context Stitching Overhead)**:
   Mỗi khi gọi `getContext(roomCode)` hoặc thực hiện một nước đi, `RoomManager` phải truy vấn đồng thời 4-5 Map khác nhau để khâu vá thành `RoomContext`.
3. **Quản lý khóa toàn cục tùy tiện (Global Prefix Scraping)**:
   `botPersonalities` lưu trữ key dạng `${roomCode}:${botId}` trên một Map toàn cục dùng chung cho cả server, buộc `doCloseRoom` phải duyệt qua toàn bộ keys bằng `startsWith(`${roomCode}:`)` để dọn rác.
4. **Vi phạm LOC Budget Tier 1**:
   File đang có 534 LOC (> 400 LOC Tier 1) vì phải duy trì hàng trăm dòng code boilerplate chỉ để forward tham số giữa 10 Map.

---

## 3. THIẾT KẾ KIẾN TRÚC MỚI: `GameRoomSession` AGGREGATE ROOT

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                 RoomManager                                 │
│  • sessions: Map<string, GameRoomSession>                                   │
│  • rng / deckRng                                                            │
│  • closeHooks: Array<(roomCode, room) => void>                              │
│  • Map Facades (registries, propertyStates, auctions, rolledThisTurn...)    │
│  • BotPersonalityMapFacade (xử lý composite key ${roomCode}:${botId})       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ 1:N
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          GameRoomSession (Aggregate)                        │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • readonly roomCode: string                                                │
│  • readonly room: Room                                                      │
│  • readonly registry: PropertyRegistry                                      │
│  • readonly propertyStates: PropertyStateMap                                │
│  • auction?: AuctionSession (setter tự động sync sang room.currentAuction)   │
│  • rolledThisTurn: boolean                                                  │
│  • lastAuctionResult?: AuctionResult                                        │
│  • readonly activeTimers: Set<NodeJS.Timeout>                               │
│  • lastActivity: number                                                     │
│  • readonly botPersonalities: Map<string, BotPersonality>                   │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • toContext(): RoomContext                                                 │
│  • touchActivity(ts?: number): void                                         │
│  • registerTimer(t: NodeJS.Timeout): void                                   │
│  • clearTimers(): void                                                      │
│  • destroy(): void (Dọn dẹp sạch sẽ toàn bộ 100% tài nguyên)                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. PHÂN TÍCH RỦI RO & 8 NGUYÊN MẪU THẤT BẠI (FAILURE MODES & DEFENSE)

| Mã Lỗi | Nguyên Mẫu Thất Bại | Nguy Cơ Tiềm Ẩn | Biện Pháp Phòng Thủ Cụ Thể Trong Plan |
| :---: | :--- | :--- | :--- |
| **FM-1** | **Test Write-Through Failure** | Các test cũ giả lập dữ liệu bằng `(mgr as any).propertyStates.get(code).set(...)` hoặc `(mgr as any).rolledThisTurn.set(code, true)` không tác động lên `GameRoomSession`. | Sử dụng **SessionFieldProxy**: Proxy Map trả về trực tiếp instance `session.propertyStates` hoặc ghi thẳng vào `session.rolledThisTurn`. Đảm bảo mutation 2 chiều (write-through) 100% trong suốt. Đối với lệnh `delete`, gọi `.clear()` trên Map của session thay vì gán `undefined`. |
| **FM-2** | **Case-Insensitive Room Code Miss** | Người chơi gửi roomCode chữ thường (`vtd8j8`) trong khi session lưu chữ hoa (`VTD8J8`), khiến `this.sessions.get(rc)` trả về `undefined`. | Helper `this.getSession(rc)` và các Facade Maps luôn tra cứu: `this.sessions.get(rc) ?? this.sessions.get(rc?.toUpperCase())`. |
| **FM-3** | **Teardown Inversion in Close Hooks** | `closeRoom` xóa session khỏi `sessions` trước khi gọi `closeHooks`, khiến callback hook không truy cập được dữ liệu phòng để broadcast hoặc log telemetry. | **Đúng thứ tự chuẩn**: Kích hoạt toàn bộ `closeHooks(session.roomCode, session.room)` TRƯỚC, gọi `pendingTradeManager.clearSession(session.roomCode)`, dọn dẹp timers qua `session.destroy()`, sau cùng mới `this.sessions.delete(session.roomCode)`. |
| **FM-4** | **Bot Personality Composite Key Crash** | `tests/domain/bot_auction_hose.test.ts#L277` và `room_bot_manager.ts` ghi personality qua key composite `${roomCode}:${botId}`. Nếu dùng proxy thông thường, `sessions.get(`${rc}:${id}`)` sẽ trả về `undefined` và nuốt chửng lệnh `.set()`. | Xây dựng riêng **`BotPersonalityMapFacade`**: Tự động bóc tách `roomCode` và `botId` từ chuỗi `${rc}:${id}`, tra cứu đúng `session`, rồi ghi đồng thời vào cả `session.botPersonalities(botId)` lẫn key composite. |
| **FM-5** | **Orphaned Watchdog Timers Leak** | Khi một phòng bị đóng hoặc reset, timer watchdog hoặc anti-sniping không được hủy dẫn đến rò rỉ timer event loop. | `session.destroy()` bắt buộc lặp qua `this.activeTimers`, gọi `clearTimeout(t)` triệt để trước khi giải phóng bộ nhớ. |
| **FM-6** | **Lifecycle Exported Function Test Breakage** | `tests/domain/name_generator.test.ts#L8,L56` và `tests/server/imp165_multiplayer_lobby_sync.test.ts#L9,L593` import trực tiếp `doCreateRoom`, `doJoinRoom`, `doStartGame`. | **Giữ nguyên 100% các hàm exported cũ** trong `room_manager_lifecycle.ts` với chữ ký cũ (đóng vai trò backward-compatible adapter). Bổ sung hàm mới `doCreateRoomSession`. |
| **FM-7** | **SessionFieldProxy Iterator & Size Blindspot** | Bất kỳ lời gọi `for (const [code, val] of this.auctions)`, `this.rooms.size`, `this.rooms.values()`, `this.rooms.keys()` qua Proxy đều fallback vào `target` rỗng nếu proxy chỉ bẫy `get/set/has/delete`, gây lỗi runtime lặp 0 lần hoặc size = 0. | Cài đặt **đầy đủ 100% Map protocol** trên Proxy: bẫy `size` (getter đếm sessions active), `[Symbol.iterator]` & `entries()` (generators lặp `[code, val]`), `keys()`, `values()`, `forEach()`, `clear()`. |
| **FM-8** | **EndTurn Map Packing Overhead & Readonly Drift** | `doHandleEndTurn` nhận 5 Map Facade rời rạc (`this.rooms`, `this.rolledThisTurn`, `this.registries`, `this.propertyStates`, `this.auctions`). `this.rooms` qua Proxy có thể bị xung đột với `readonly room: Room` hoặc overhead unpack. | Chuyển `RoomManager.handleEndTurn` sang gọi hàm mới **`doHandleEndTurnSession(session, ...)`** nhận trực tiếp `GameRoomSession`. Aggregate Root sở hữu trọn vẹn state mà không cần unwrap qua 5 tầng proxy. Giữ `doHandleEndTurn` cũ làm adapter. |

---

## 5. CHI TIẾT TRIỂN KHAI MÃ NGUỒN (CONCRETE DROP-IN SPECIFICATIONS)

### Tệp 1: `src/server/game_room_session.ts` *(MỚI - ~95 LOC)*

```ts
import type { Room } from '../domain/room.js';
import type { PropertyRegistry, PropertyStateMap } from '../domain/property_manager.js';
import type { AuctionSession } from './auction_manager.js';
import type { AuctionResult } from './room_manager.js';
import type { RoomContext } from './room_property_coordinator.js';
import { BotPersonality } from '../domain/bot/bot_engine.js';

export class GameRoomSession {
  readonly roomCode: string;
  readonly room: Room;
  readonly registry: PropertyRegistry = new Map();
  readonly propertyStates: PropertyStateMap = new Map();
  private _auction?: AuctionSession;
  rolledThisTurn: boolean = false;
  lastAuctionResult?: AuctionResult;
  readonly activeTimers: Set<NodeJS.Timeout> = new Set();
  lastActivity: number = Date.now();
  readonly botPersonalities: Map<string, BotPersonality> = new Map();

  constructor(room: Room) {
    this.roomCode = room.roomCode;
    this.room = room;
  }

  get auction(): AuctionSession | undefined {
    return this._auction;
  }

  set auction(val: AuctionSession | undefined) {
    this._auction = val;
    this.room.currentAuction = val as any;
  }

  toContext(): RoomContext {
    return {
      room: this.room,
      reg: this.registry,
      sm: this.propertyStates,
      botPersonalities: this.botPersonalities,
    };
  }

  touchActivity(timestamp: number = Date.now()): void {
    this.lastActivity = timestamp;
  }

  registerTimer(timer: NodeJS.Timeout): void {
    this.activeTimers.add(timer);
  }

  clearTimers(): void {
    for (const timer of this.activeTimers) {
      clearTimeout(timer);
    }
    this.activeTimers.clear();
  }

  destroy(): void {
    this.clearTimers();
    this._auction = undefined;
    this.room.currentAuction = undefined as any;
    this.lastAuctionResult = undefined;
    this.room.lastAuctionResult = undefined;
    this.registry.clear();
    this.propertyStates.clear();
    this.botPersonalities.clear();
  }
}
```

---

### Tệp 2: `src/server/session_proxy_facade.ts` *(MỚI - ~95 LOC)*

Cung cấp các Dynamic Map Facade tuân thủ **đầy đủ 100% giao thức `Map` chuẩn** của TypeScript/JavaScript (`[Symbol.iterator]`, `entries()`, `keys()`, `values()`, `size`, `forEach()`, `clear()`, `get()`, `set()`, `has()`, `delete()`). Module này giải quyết triệt để rủi ro **FM-7** khi có code hoặc test lặp qua Map (`for..of`), kiểm tra `.size`, hay gọi `.entries()`, đồng thời tách toàn bộ mã proxy ra khỏi `room_manager.ts` để tiết kiệm LOC.

```ts
import type { GameRoomSession } from './game_room_session.js';
import { BotPersonality } from '../domain/bot/bot_engine.js';

export function createSessionFieldProxy<T>(
  sessions: Map<string, GameRoomSession>,
  field: keyof GameRoomSession,
): Map<string, T> {
  const isOptionalField = field === 'auction' || field === 'lastAuctionResult';
  return new Proxy(new Map<string, T>(), {
    get(target, prop, receiver) {
      if (prop === 'get') {
        return (code: string): T | undefined => {
          if (!code) return undefined;
          const s = sessions.get(code) ?? sessions.get(code.toUpperCase());
          return s ? (s as any)[field] : undefined;
        };
      }
      if (prop === 'set') {
        return (code: string, value: any) => {
          if (!code) return receiver;
          const s = sessions.get(code) ?? sessions.get(code.toUpperCase());
          if (s) (s as any)[field] = value;
          return receiver;
        };
      }
      if (prop === 'has') {
        return (code: string): boolean => {
          if (!code) return false;
          const s = sessions.get(code) ?? sessions.get(code.toUpperCase());
          if (!s) return false;
          return isOptionalField ? (s as any)[field] !== undefined : true;
        };
      }
      if (prop === 'delete') {
        return (code: string): boolean => {
          if (!code) return false;
          const s = sessions.get(code) ?? sessions.get(code.toUpperCase());
          if (s) {
            const val = (s as any)[field];
            if (val && typeof val.clear === 'function') {
              val.clear();
            } else {
              (s as any)[field] = undefined;
            }
            return true;
          }
          return false;
        };
      }
      if (prop === 'clear') {
        return () => {
          for (const s of sessions.values()) {
            const val = (s as any)[field];
            if (val && typeof val.clear === 'function') {
              val.clear();
            } else {
              (s as any)[field] = undefined;
            }
          }
        };
      }
      if (prop === 'size') {
        if (!isOptionalField) return sessions.size;
        let count = 0;
        for (const s of sessions.values()) {
          if ((s as any)[field] !== undefined) count++;
        }
        return count;
      }
      if (prop === 'keys') {
        return function* () {
          for (const [code, s] of sessions.entries()) {
            if (!isOptionalField || (s as any)[field] !== undefined) yield code;
          }
        };
      }
      if (prop === 'values') {
        return function* () {
          for (const s of sessions.values()) {
            const val = (s as any)[field];
            if (!isOptionalField || val !== undefined) yield val as T;
          }
        };
      }
      if (prop === 'entries' || prop === Symbol.iterator) {
        return function* () {
          for (const [code, s] of sessions.entries()) {
            const val = (s as any)[field];
            if (!isOptionalField || val !== undefined) yield [code, val as T] as [string, T];
          }
        };
      }
      if (prop === 'forEach') {
        return (callbackfn: (value: T, key: string, map: Map<string, T>) => void, thisArg?: any) => {
          for (const [code, s] of sessions.entries()) {
            const val = (s as any)[field];
            if (!isOptionalField || val !== undefined) {
              callbackfn.call(thisArg, val as T, code, receiver);
            }
          }
        };
      }
      return Reflect.get(target, prop, receiver);
    }
  });
}

export function createBotPersonalityMapFacade(sessions: Map<string, GameRoomSession>): Map<string, BotPersonality> {
  return new Proxy(new Map<string, BotPersonality>(), {
    get(target, prop, receiver) {
      if (prop === 'get') {
        return (key: string): BotPersonality | undefined => {
          if (!key) return undefined;
          const idx = key.indexOf(':');
          if (idx !== -1) {
            const rc = key.slice(0, idx);
            const bid = key.slice(idx + 1);
            const s = sessions.get(rc) ?? sessions.get(rc.toUpperCase());
            return s ? (s.botPersonalities.get(bid) ?? s.botPersonalities.get(key)) : undefined;
          }
          for (const s of sessions.values()) {
            const found = s.botPersonalities.get(key);
            if (found !== undefined) return found;
          }
          return undefined;
        };
      }
      if (prop === 'set') {
        return (key: string, val: BotPersonality) => {
          if (!key) return receiver;
          const idx = key.indexOf(':');
          if (idx !== -1) {
            const rc = key.slice(0, idx);
            const bid = key.slice(idx + 1);
            const s = sessions.get(rc) ?? sessions.get(rc.toUpperCase());
            if (s) {
              s.botPersonalities.set(bid, val);
              s.botPersonalities.set(key, val);
            }
          }
          return receiver;
        };
      }
      if (prop === 'has') {
        return (key: string): boolean => {
          const idx = key.indexOf(':');
          if (idx !== -1) {
            const rc = key.slice(0, idx);
            const bid = key.slice(idx + 1);
            const s = sessions.get(rc) ?? sessions.get(rc.toUpperCase());
            return s ? (s.botPersonalities.has(bid) || s.botPersonalities.has(key)) : false;
          }
          for (const s of sessions.values()) {
            if (s.botPersonalities.has(key)) return true;
          }
          return false;
        };
      }
      if (prop === 'delete') {
        return (key: string): boolean => {
          const idx = key.indexOf(':');
          if (idx !== -1) {
            const rc = key.slice(0, idx);
            const bid = key.slice(idx + 1);
            const s = sessions.get(rc) ?? sessions.get(rc.toUpperCase());
            if (s) {
              s.botPersonalities.delete(bid);
              s.botPersonalities.delete(key);
              return true;
            }
          }
          return false;
        };
      }
      if (prop === 'clear') {
        return () => {
          for (const s of sessions.values()) {
            s.botPersonalities.clear();
          }
        };
      }
      if (prop === 'size') {
        let count = 0;
        for (const s of sessions.values()) {
          count += s.botPersonalities.size;
        }
        return count;
      }
      if (prop === 'entries' || prop === Symbol.iterator) {
        return function* () {
          for (const [rc, s] of sessions.entries()) {
            for (const [bid, val] of s.botPersonalities.entries()) {
              yield [`${rc}:${bid}`, val] as [string, BotPersonality];
            }
          }
        };
      }
      if (prop === 'keys') {
        return function* () {
          for (const [rc, s] of sessions.entries()) {
            for (const bid of s.botPersonalities.keys()) {
              yield `${rc}:${bid}`;
            }
          }
        };
      }
      if (prop === 'values') {
        return function* () {
          for (const s of sessions.values()) {
            for (const val of s.botPersonalities.values()) {
              yield val;
            }
          }
        };
      }
      if (prop === 'forEach') {
        return (callbackfn: (value: BotPersonality, key: string, map: Map<string, BotPersonality>) => void, thisArg?: any) => {
          for (const [rc, s] of sessions.entries()) {
            for (const [bid, val] of s.botPersonalities.entries()) {
              callbackfn.call(thisArg, val, `${rc}:${bid}`, receiver);
            }
          }
        };
      }
      return Reflect.get(target, prop, receiver);
    }
  });
}
```

---

### Tệp 3: `src/server/room_manager.ts` *(REFACTOR SÂU - Giảm từ 518 xuống ~340 - 360 LOC)*

```ts
import { GameRoomSession } from './game_room_session.js';
import { createSessionFieldProxy, createBotPersonalityMapFacade } from './session_proxy_facade.js';
import {
  doCreateRoomSession,
  doHandleEndTurnSession,
  doJoinRoom,
  doStartGame,
  doAddBot,
  doRemoveBot,
  doSetBotPersonality,
  doGetBotPersonality,
  doRegisterTimer,
  doClearRoomTimers,
  doGetActiveTimers,
  doTouchActivity,
  doGetLastActivity,
  doGetAllRoomCodes,
  doGetRoomCount,
  doHasRoom,
} from './room_manager_lifecycle.js';

export class RoomManager {
  private readonly sessions = new Map<string, GameRoomSession>();
  private readonly rng: () => number;
  private readonly deckRng: () => number;
  private readonly closeHooks: Array<(roomCode: string, room: Room) => void> = [];

  // --- Dynamic Facade Maps cho 54 call sites trong 18 Test Suites (Full Map Protocol) ---
  get registries(): Map<string, PropertyRegistry> { return createSessionFieldProxy(this.sessions, 'registry'); }
  get propertyStates(): Map<string, PropertyStateMap> { return createSessionFieldProxy(this.sessions, 'propertyStates'); }
  get auctions(): Map<string, AuctionSession> { return createSessionFieldProxy(this.sessions, 'auction'); }
  get rolledThisTurn(): Map<string, boolean> { return createSessionFieldProxy(this.sessions, 'rolledThisTurn'); }
  get activeTimersMap(): Map<string, Set<NodeJS.Timeout>> { return createSessionFieldProxy(this.sessions, 'activeTimers'); }
  get lastAuctionResults(): Map<string, AuctionResult> { return createSessionFieldProxy(this.sessions, 'lastAuctionResult'); }
  get roomMap(): Map<string, Room> { return createSessionFieldProxy(this.sessions, 'room'); }
  get rooms(): Map<string, Room> { return this.roomMap; } // Alias bắt buộc cho imp152
  get botPersonalities(): Map<string, BotPersonality> { return createBotPersonalityMapFacade(this.sessions); }
  get auctionsMap(): Map<string, AuctionSession> { return this.auctions; }
  get rolledThisTurnMap(): Map<string, boolean> { return this.rolledThisTurn; }
  get activeTimers(): Map<string, Set<NodeJS.Timeout>> { return this.activeTimersMap; }

  constructor(seed?: number | (() => number)) {
    if (typeof seed === 'function') {
      this.rng = seed;
      this.deckRng = seed;
    } else {
      const s = seed ?? Date.now();
      this.rng = mulberry32(s);
      this.deckRng = mulberry32((s ^ 0x9e3779b9) | 0);
    }
  }

  getSession(roomCode: string): GameRoomSession | undefined {
    if (!roomCode) return undefined;
    return this.sessions.get(roomCode) ?? this.sessions.get(roomCode.toUpperCase());
  }

  createRoom(hostId: string, customRoomCode?: string): Room {
    const session = doCreateRoomSession(this.sessions, this.deckRng, hostId, customRoomCode, (rc) => this.touchActivity(rc));
    return session.room;
  }

  getRoom(roomCode: string): Room | undefined {
    return this.getSession(roomCode)?.room;
  }

  getContext(roomCode: string): RoomContext | undefined {
    return this.getSession(roomCode)?.toContext();
  }

  closeRoom(roomCode: string): boolean {
    const session = this.getSession(roomCode);
    if (!session) return false;
    // Thứ tự chuẩn xác: Hook -> PendingTrade -> Destroy -> Delete
    for (const hook of this.closeHooks) hook(session.roomCode, session.room);
    pendingTradeManager.clearSession(session.roomCode);
    session.destroy();
    this.sessions.delete(session.roomCode);
    return true;
  }

  handleEndTurn(roomCode: string, playerId: string, continueDoubles?: boolean): Room | undefined {
    const session = this.getSession(roomCode);
    if (!session) return undefined;
    return doHandleEndTurnSession(session, playerId, continueDoubles, this.deckRng, (rc) => this.touchActivity(rc));
  }

  // Toàn bộ các methods điều phối (handleRollDice, handleAuctionBid, ...)
  // giữ nguyên 100% signatures, tinh giản lấy session qua getSession(roomCode)
}
```

---

### Tệp 4: `src/server/room_manager_lifecycle.ts` *(BỔ SUNG AGGREGATE ROOT & ADAPTER BẢO TOÀN)*

1. **Thêm hàm mới `doCreateRoomSession`**:
```ts
export function doCreateRoomSession(
  sessions: Map<string, GameRoomSession>,
  deckRng: () => number,
  hostId: string,
  customRoomCode?: string,
  touchActivityFn?: (rc: string) => void,
): GameRoomSession {
  const upperCode = customRoomCode?.toUpperCase();
  const existing = upperCode ? sessions.get(upperCode) : undefined;
  const canUseCustom = upperCode && (!existing || existing.room.hostId === hostId);
  const code = canUseCustom ? upperCode : undefined;
  const room = domainCreateRoom(hostId, code);
  const hostPlayer = room.players.find((p) => p.id === hostId);
  if (hostPlayer && !hostPlayer.name) {
    hostPlayer.name = generateRandomAnimalName([], `${room.roomCode}_${hostId}`);
  }
  room.marketDeck = createMarketDeck(deckRng);
  room.chanceDeck = createChanceDeck(deckRng);

  const session = new GameRoomSession(room);
  sessions.set(room.roomCode, session);
  pendingTradeManager.clearSession(room.roomCode);
  touchActivityFn?.(room.roomCode);
  return session;
}
```

2. **Thêm hàm mới `doHandleEndTurnSession` (FM-8 Solution - Local Single-Entry Maps, Zero Proxy Overhead)**:
```ts
export function doHandleEndTurnSession(
  session: GameRoomSession,
  playerId: string,
  continueDoubles?: boolean,
  rng: () => number = Math.random,
  touchActivityFn?: (rc: string) => void,
): Room | undefined {
  touchActivityFn?.(session.roomCode);
  const room = session.room;
  const current = getActivePlayerFn(room, playerId);
  if (!current || !room) return undefined;
  
  // Single-entry local maps: Zero proxy overhead, type-safe, direct mutation sync
  const rolledMap = new Map<string, boolean>([[session.roomCode, session.rolledThisTurn]]);
  const auctionsMap = new Map<string, AuctionSession>();
  if (session.auction) {
    auctionsMap.set(session.roomCode, session.auction);
  }

  const result = executeTurnEnd(
    room,
    current,
    session.rolledThisTurn,
    continueDoubles ?? false,
    session.roomCode,
    rolledMap,
    session.registry,
    session.propertyStates,
    auctionsMap,
    rng,
  );

  // Đồng bộ nguyên tử hai chiều về GameRoomSession (setter session.auction tự động sync room.currentAuction)
  session.rolledThisTurn = rolledMap.get(session.roomCode) ?? false;
  session.auction = auctionsMap.get(session.roomCode);

  return result;
}
```

3. **Giữ nguyên 100% chữ ký các hàm exported cũ làm adapter**:
   - `doCreateRoom(...)`, `doHandleEndTurn(...)`, `doJoinRoom(...)`, `doStartGame(...)`
   - `doAddBot(...)`, `doRemoveBot(...)`, `doSetBotPersonality(...)`, `doGetBotPersonality(...)`
   - `doRegisterTimer(...)`, `doClearRoomTimers(...)`, `doGetActiveTimers(...)`
   - `doTouchActivity(...)`, `doGetLastActivity(...)`, `doGetAllRoomCodes(...)`, `doGetRoomCount(...)`, `doHasRoom(...)`

Nhờ việc giữ nguyên các hàm này làm adapter, hai test suite `name_generator.test.ts` và `imp165_multiplayer_lobby_sync.test.ts` sẽ chạy bình thường 100% mà không bị vỡ biên dịch.

---

## 6. DỰ KIẾN BIẾN ĐỘNG NGÂN SÁCH LOC (THỰC TẾ & TRUNG THỰC)

| Tệp Vật Lý | Phân Loại Tier | LOC Hiện Tại | LOC Dự Kiến Sau Bước 2 | Chênh Lệch ($\Delta$) | Đánh Giá Tuân Thủ |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `src/server/game_room_session.ts` *(MỚI)* | Tier 1 (Domain/Server/Logic) | 0 | **~90 - 95** | **+95 dòng** | ✔️ An toàn (Aggregate Root thuần túy) |
| `src/server/session_proxy_facade.ts` *(MỚI)* | Tier 1 (Domain/Server/Logic) | 0 | **~210 - 230** | **+220 dòng** | ✔️ An toàn (Full 11 Map Protocol Facades, <= 400 LOC) |
| `src/server/room_manager.ts` | Tier 1 (Domain/Server/Logic) | **518** | **~340 - 360** | **-158 đến -178 dòng** | ✔️ **ĐẠT CHUẨN TIER 1** (<= 400 LOC) |
| `src/server/room_manager_lifecycle.ts` | Tier 1 (Domain/Server/Logic) | **270** | **~285** | **+15 dòng** | ✔️ Bảo toàn adapter (<= 400 LOC) |

> [!TIP]
> **Đóng Nợ Kỹ Thuật `DEBT-ROOM-MGR-01`**:
> Sau khi hoàn tất Bước 2, `src/server/room_manager.ts` sẽ giảm gần 170 dòng code cồng kềnh, đưa file từ 518 dòng về mức an toàn **~340 - 360 dòng** (dưới trần 400 LOC Tier 1). Đồng thời toàn bộ 10 Map phân tán được gom trọn vẹn vào `GameRoomSession`, triệt tiêu hoàn toàn khoản nợ kỹ thuật tồn đọng.

---

## 7. KẾ HOẠCH KIỂM CHỨNG & TIÊU CHÍ HOÀN TẤT (DEFINITION OF DONE)

1. **Station 1 (QA RED - Hợp đồng kiểm thử mới)**:
   - Tạo bộ test hợp đồng `tests/contracts/imp210_game_room_session_aggregate_root.test.ts` kiểm thử 5 Facets:
     - **Facet 1 (Lifecycle)**: Tạo phòng và xác thực `GameRoomSession` khởi tạo nguyên tử đầy đủ các trường.
     - **Facet 2 (Teardown & Clean)**: Đóng phòng giải phóng sạch sẽ 100% timers, pending trades và Maps, không rò rỉ session.
     - **Facet 3 (Two-Way Write-Through Facades)**: `registries`, `propertyStates`, `auctions`, `rolledThisTurn` phản ứng ghi/đọc 2 chiều chuẩn xác.
     - **Facet 4 (Composite Key & Bot Personality)**: `botPersonalities` facade bóc tách key `${roomCode}:${botId}` và delegate chuẩn xác.
     - **Facet 5 (Case-Insensitive & Alias Guard)**: Tra cứu không phân biệt hoa thường (`vtd8j8` == `VTD8J8`), alias `get rooms()` hoạt động.
2. **Station 2 (GREEN Implementation)**:
   - Triển khai `src/server/game_room_session.ts`, `src/server/room_manager.ts`, và `src/server/room_manager_lifecycle.ts`.
   - Chứng minh toàn bộ hợp đồng kiểm thử mới PASS 100%.
3. **Station 2.5 (Sweeping Scout Audit)**:
   - Scout rà soát 5 universal defect archetypes, đảm bảo không có rò rỉ closure hay dirty cast.
4. **Hồi Quy Hệ Thống (Zero Regression Mandate)**:
   - `npx tsc --noEmit` đạt 0 error, 0 warning.
   - Toàn bộ **52 tệp test server (676 test)** chạy lệnh `npx vitest run tests/server/` PASS 100%.
   - Toàn bộ **hợp đồng kiểm thử IMP-205** (`tests/contracts/imp205_...test.ts`) PASS 19/19 tests.
   - Toàn bộ các bài test có `(mgr as any)` trong `tests/contracts/` và `tests/integration/` PASS 100%.
5. **Station 3 (Independent Dual Review)**:
   - `spec-reviewer` và `code-reviewer` thẩm định đĩa vật lý, ký duyệt báo cáo nghiệm thu `IMP-210_report.md`.
