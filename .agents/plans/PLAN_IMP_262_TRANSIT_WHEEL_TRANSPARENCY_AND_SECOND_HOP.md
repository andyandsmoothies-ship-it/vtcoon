# KẾ HOẠCH TRIỂN KHAI IMP-262: MINH BẠCH HÓA VÒNG XOAY VẬN TẢI & CHUỖI HỆ QUẢ SECOND-HOP (REVISION 3)

> **Ticket**: IMP-262  
> **Tên**: Minh bạch hóa toàn diện Vòng Xoay Vận Tải (Transit Wheel) và chuỗi hệ quả bước 2 (Second-Hop Consequence Transparency)  
> **Trạng thái**: Chờ duyệt (Pending Plan Review Gate - Revision 3)  
> **Cấp độ**: Tier 2 Full Rigor (Domain FSM + Network Broadcaster + Client Feed + Bot Pacing + Visual Craft)  
> **Mục tiêu**: Người chơi và Bot khi quay Vòng Xoay Vận Tải (các trạm 5, 15, 25, 35) phải được thông báo công khai kết quả quay, hiển thị Toast/Milestone Banner trực quan cho toàn phòng đấu (bao gồm khán giả và đối thủ), ghi nhận lịch sử vào Activity Feed, và thông báo đầy đủ chuỗi hệ quả tiếp theo (tiến thêm X ô, mua đất, trả tiền thuê, nhận thưởng/nộp phạt) với nhịp độ quan sát hợp lý.

---

## 0. BẢNG ĐỐI SOÁT CHỈ THỊ THẨM ĐỊNH (REVISION DIRECTIVE COVERAGE)

| Mã chỉ thị | Nguồn | Nội dung chỉ thị | Vị trí khắc phục trong kế hoạch | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| **GRILL-01** | Stage A | Bổ sung `delta.tick` vào key deduplication của `activity_transit_tracker.ts` để không nuốt sự kiện giống hệt ở vòng sau, và nối `resetTransitActivityTracker` vào `purgeClientMatchSession`. | Task 4 & Task 6 (Snippets 4.1 & 6.1, 6.2) | ✅ ĐÃ ĐỐI SOÁT 100% |
| **GRILL-02** | Stage A | Đặt kiểm tra `room.lastTransitResult` lên đầu hàm `calculateBotStepDelay` trước `room.lastDice`, tính thêm thời gian di chuyển nếu là `SPEED_BOOST`. | Task 7 (Snippet 7.1, 7.2) | ✅ ĐÃ ĐỐI SOÁT 100% |
| **GRILL-03** | Stage A | Bổ sung giải trình Pure Event Stream: Nêu rõ `lastTransitResult` là sự kiện tức thời (ephemeral event), được chuyển hóa trực tiếp thành `useActivityStore` + `FloatingText` thay vì lưu cache vĩnh viễn trên Zustand GameState. | Mục 2.2 Kiến trúc Pure Event Stream | ✅ ĐÃ ĐỐI SOÁT 100% |
| **ADV-01** | Stage B | Chống tống tiền tiền thuê đúp (Double Rent Extortion) ở `SAFE_HAVEN`: Khi người chơi sở hữu 0 BĐS, ở lại trạm an toàn mà KHÔNG gọi lại `resolveSecondHopLanding` trên trạm để tránh bị trừ tiền thuê lần 2. | Task 3 (Snippet 3.3) | ✅ ĐÃ ĐỐI SOÁT 100% |
| **ADV-02** | Stage B | Khắc phục quên ghi nhận `payout` ở `PASS_GO_FLIGHT`: Gán `payout = sal` (khi nhận lương) hoặc `payout = stipend` (khi nhận trợ cấp kho bạc) vào `lastTransitResult`, và định dạng rõ số tiền trong thông điệp. | Task 1 (Snippet 1.1) & Task 3 (Snippet 3.4) | ✅ ĐÃ ĐỐI SOÁT 100% |
| **ADV-03** | Stage B | Tránh biến dạng Floating Text & Bỏ qua Milestone Banner: Tích hợp `actionType: 'transit'` vào `MilestoneBanner` (`floating_numbers.tsx`), `ACTION_ICONS` (`transaction_narrative.ts`), và `activity_feed_sidebar.tsx`. | Task 8 (Snippets 8.1, 8.2, 8.3) | ✅ ĐÃ ĐỐI SOÁT 100% |
| **ADV-04** | Stage B | Rào chắn pha cho Bot Transit Delay: Rào `(room.phase === PropertyManagement \|\| room.phase === ActionPhase)` để không kéo dãn 3.2s trễ vào các bước đấu giá (`AuctionPhase`). | Task 7 (Snippet 7.2) | ✅ ĐÃ ĐỐI SOÁT 100% |
| **ADV-05** | Stage B | Chống bẫy mở Modal zombie cho khán giả (`apply_delta.ts`): Bỏ `!myPid \|\|` lỏng lẻo, kiểm tra chính xác `delta.pendingTransitWheel.playerId === myPid` (chỉ cho phép fallback khi `state.isOfflineMode`). | Task 9 (Snippet 9.1) | ✅ ĐÃ ĐỐI SOÁT 100% |

---

## 1. BỐI CẢNH & KHẢO SÁT THỰC ĐỊA

### 1.1 Hiện trạng phát hiện trên mã nguồn thực tế
1. **Rào chắn lọc người xem tại `apply_delta.ts` (Dòng 201 & 209)**:
   - `if (!myPid || delta.pendingTransitWheel.playerId === myPid)` gây lỗi kép: Người xem chưa có PID (`myPid === ''`) bị mở popup modal oan (ADV-05), trong khi người chơi đối thủ thì không thấy thông báo gì.
2. **Thiếu vắng ghi nhận Activity Feed (`activity_tracker.ts`)**:
   - `trackDeltaActivities` hoàn toàn không xử lý `delta.lastTransitResult`. Bảng lịch sử hoạt động bên phải (Sideboard Feed) hoàn toàn trống rỗng khi có sự kiện quay trạm vận tải.
3. **Bot hành động tức thì, gây hiện tượng dịch chuyển đột ngột (Instant Teleport)**:
   - Trong `src/server/room_bot_coordinator.ts#L187-L190`, Bot quay số với độ trễ 0ms.
   - Tiếp theo, hệ quả bước 2 (Second-Hop: Bot mua đất hoặc trả tiền thuê) xảy ra chỉ sau 200-500ms mà không có khoảng đệm quan sát (observation delay), khiến người chơi thấy Bot như bị "dịch chuyển tức thời" và thực hiện giao dịch bất thình lình.
4. **Hao hụt thông tin bước nhảy tốc hành (Speed Boost) & Tiền thưởng bay GO**:
   - `boostSteps` không được lưu vào `lastTransitResult`.
   - `payout` trong `PASS_GO_FLIGHT` bị bỏ quên giá trị 0 mặc dù đã trừ tiền Kho Bạc hoặc cộng lương vòng (ADV-02).

---

## 2. KIẾN TRÚC GIẢI PHÁP (VISUAL ARCHITECTURE & SEAM DESIGN)

### 2.1 Luồng dữ liệu khép kín (End-to-End Pipeline)

```
[Người chơi / Bot vào Trạm 5, 15, 25, 35]
             │
             ▼
[Server: handleSpinTransitWheel]
  ├── Xác định Outcome (SPEED_BOOST, SAFE_HAVEN, CASH_BACK, PASS_GO_FLIGHT, FLIGHT_DELAY)
  ├── SAFE_HAVEN: Chỉ resolve second-hop nếu targetCell !== oldPos (chống phạt tiền thuê đúp - ADV-01)
  ├── PASS_GO_FLIGHT: Ghi nhận payout = sal hoặc payout = stipend (bảo toàn dòng tiền - ADV-02)
  ├── Ghi nhận: stationCell, targetCell, boostSteps, payout
  └── Gọi resolveSecondHopLanding(room, current, targetCell) nếu hợp lệ
             │
             ▼
[Server: delta_mapper -> DeltaPayload]
  └── lastTransitResult: { playerId, cellIndex, outcome, targetCell, payout, boostSteps }
             │
             ▼
[Client: applyDeltaToStore]
  ├── syncBusinessModals: Modal transit_wheel chỉ mở cho đúng player ID hoặc offline mode (ADV-05)
  └── syncTelemetryAndActivities: Gọi trackDeltaActivities
             │
             ▼
[Client: activity_transit_tracker.ts (DEEP MODULE MỚI)]
  ├── Định dạng thông điệp tiếng Việt súc tích qua formatTransitWheelBroadcast
  ├── Thêm ActivityLogEntry (type: 'transit') vào useActivityStore với icon 🚊
  └── Kích hoạt Milestone Banner toàn phòng đấu qua dispatchActivityFloatingBadges (ADV-03)
             │
             ▼
[Server: turn_orchestrator.ts (BOT PACING)]
  └── BOT_TRANSIT_OBSERVATION_DELAY_MS (chỉ trong PropertyManagement/ActionPhase - ADV-04):
      Bot dừng nghỉ quan sát để người chơi kịp đọc thông báo quay trạm trước khi Bot thực hiện bước 2
             │
             ▼
[Hệ Quả Bước 2 (Second-Hop Consequence Transparency)]
  ├── Ô chưa mua: Chuyển ActionPhase -> Bot/Người mua đất -> Thông báo [Mua BĐS] bình thường
  ├── Ô đối thủ: Trừ tiền thuê -> Thông báo [Tiền thuê] bình thường
  ├── Ô Sự Kiện: Rút thẻ Cơ Hội/Khí Vận -> Hiện Banner Thẻ Sự Kiện bình thường
  └── Đi qua GO: Nhận lương vòng -> Thông báo [Lương vòng] bình thường
```

### 2.2 Kiến trúc Pure Event Stream vs Persisted State (GRILL-03)
Theo thiết kế chuẩn của hệ thống VTCoOn:
- `lastTransitResult` là một **Action Transition Event** (sự kiện chuyển pha tức thời), không phải là thuộc tính trạng thái tĩnh kéo dài qua nhiều lượt.
- Do đó, việc không lưu `lastTransitResult` vĩnh viễn trên `GameState` của Zustand là một quyết định kiến trúc có chủ đích (Intentional Design Choice):
  1. Ngăn chặn hiện tượng stale snapshot hoặc modal zombie khi Reconnect / FullSync (tick <= 1).
  2. Dữ liệu sự kiện được chuyển hóa trực tiếp thành `useActivityStore` (bản ghi lịch sử bất biến trong feed, ring buffer 50 mục) và `MilestoneBanner` (hiển thị trực quan toàn màn hình có thời gian tự hủy `durationMs: 4000`).
  3. Client Modal `transit_wheel` chỉ cập nhật kết quả quay cho chính người chơi đang quay (`myPid`) để điều khiển kim quay dừng đúng góc độ nan quạt. Toàn bộ người chơi khác quan sát qua Banner/Feed.

---

## 3. ĐO ĐẠC LOC VÀ ĐĂNG KÝ NỢ KỸ THUẬT (PRE-CODING LOC BASELINE)

Theo kết quả đo đạc tự động từ `scripts/check_loc.mjs`:

| Tệp vật lý | Phân loại | Dòng hiện tại | SLOC | Ngưỡng trần | Dự kiến sau sửa | Trạng thái |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| `src/domain/transit_wheel.ts` | Tier 1 | 96 | 90 | <= 400 | ~135 | ✔️ Safe |
| `src/client/store/activity_store.ts` | Tier 1 | 141 | 125 | <= 400 | ~142 | ✔️ Safe |
| `src/client/store/game_store_types.ts` | Tier 1 | 394 | 369 | <= 400 | ~395 | ⚠️ Warning (395 > 300) |
| `src/server/delta_types.ts` | Tier 1 | 130 | 122 | <= 400 | ~132 | ✔️ Safe |
| `src/server/transit_wheel_handler.ts` | Tier 1 | 178 | 164 | <= 400 | ~189 | ✔️ Safe |
| `src/client/network/activity_transit_tracker.ts` | Tier 1 (Mới) | 0 | 0 | <= 400 | ~65 | ✔️ Safe (Mới) |
| `src/client/network/client_session_purger.ts` | Tier 1 | 42 | 36 | <= 400 | ~45 | ✔️ Safe |
| `src/client/network/activity_badge_dispatcher.ts` | Tier 1 | 237 | 211 | <= 400 | ~252 | ✔️ Safe |
| `src/client/network/activity_tracker.ts` | Tier 1 | 358 | 317 | <= 400 | ~361 | ⚠️ Warning (361 > 300) |
| `src/server/network/turn_orchestrator.ts` | Tier 1 | 365 | 319 | <= 400 | ~373 | ⚠️ Warning (373 > 300) |
| `src/client/ui/floating_numbers.tsx` | Tier 2 | 290 | 265 | <= 500 | ~292 | ✔️ Safe |
| `src/client/ui/transaction_narrative.ts` | Tier 2 | 270 | 248 | <= 500 | ~272 | ✔️ Safe |
| `src/client/ui/activity_feed_sidebar.tsx` | Tier 2 | 334 | 316 | <= 500 | ~336 | ✔️ Safe |
| `src/client/network/apply_delta.ts` | Tier 1 | 348 | 314 | <= 400 | ~352 | ⚠️ Warning (352 > 300) |
| `tests/contracts/imp262_transit_wheel_transparency.test.ts` | Test | 0 | 0 | <= 600 | ~280 | ✔️ Safe (Mới) |

> **Đăng ký Tech Debt Ledger** (`docs/epics/gameplay/_epic_ledger.md`):
> - `DEBT-ACTIVITY-TRACKER`: Tiếp tục ghi nhận (361 LOC > 300 Warning), duy trì tách module sâu (`activity_transit_tracker.ts`).
> - `DEBT-TURN-ORCHESTRATOR`: Tiếp tục ghi nhận (373 LOC > 300 Warning), kiểm soát không vượt ngưỡng trần 400 LOC.
> - `DEBT-APPLY-DELTA`: Tiếp tục ghi nhận (352 LOC > 300 Warning), kiểm soát không vượt ngưỡng trần 400 LOC.
> - `DEBT-GAME-STORE-TYPES`: Tiếp tục ghi nhận (395 LOC > 300 Warning), chỉ bổ sung 1 token kiểu action type.

---

## 4. CHI TIẾT CÁC TÁC VỤ TRIỂN KHAI (TASKS & DROP-IN SNIPPETS)

### Task 1: Bộ định dạng thông điệp tiếng Việt SSOT (`src/domain/transit_wheel.ts` - ADV-02)
**Target physical file**: `src/domain/transit_wheel.ts`

Snippet 1.1:
```typescript
<<<<
export function findSafeHaven(currentCell: number, ownedProperties: readonly number[] = []): number {
  if (ownedProperties.length === 0) {
    return currentCell; // An toàn tại chỗ, không nhảy bừa vào BĐS đối thủ
  }
  const forwardOwned = ownedProperties.filter((c) => c > currentCell).sort((a, b) => a - b);
  if (forwardOwned.length > 0) return forwardOwned[0]!;
  const wrapOwned = [...ownedProperties].sort((a, b) => a - b);
  return wrapOwned[0]!;
}
====
export function findSafeHaven(currentCell: number, ownedProperties: readonly number[] = []): number {
  if (ownedProperties.length === 0) {
    return currentCell; // An toàn tại chỗ, không nhảy bừa vào BĐS đối thủ
  }
  const forwardOwned = ownedProperties.filter((c) => c > currentCell).sort((a, b) => a - b);
  if (forwardOwned.length > 0) return forwardOwned[0]!;
  const wrapOwned = [...ownedProperties].sort((a, b) => a - b);
  return wrapOwned[0]!;
}

export interface TransitWheelBroadcastParams {
  readonly outcome: TransitWheelOutcome | string;
  readonly playerName: string;
  readonly stationName: string;
  readonly targetCellName?: string;
  readonly payout?: number;
  readonly boostSteps?: number;
}

export function formatTransitWheelBroadcast(params: TransitWheelBroadcastParams): string {
  const { outcome, playerName, stationName, targetCellName, payout, boostSteps } = params;
  switch (outcome) {
    case TransitWheelOutcome.SPEED_BOOST: {
      const stepText = boostSteps !== undefined ? ` ${boostSteps}` : '';
      const destText = targetCellName ? ` tới ${targetCellName}` : '';
      return `⚡ ${playerName} quay trúng Tốc Hành! Bay thêm${stepText} ô${destText}.`;
    }
    case TransitWheelOutcome.SAFE_HAVEN: {
      if (targetCellName && targetCellName !== stationName) {
        return `🛡️ ${playerName} kích hoạt Vé VIP Hồi Hương! Bay về BĐS an toàn tại ${targetCellName}.`;
      }
      return `🛡️ ${playerName} kích hoạt Vé VIP Hồi Hương! An toàn ở lại ${stationName}.`;
    }
    case TransitWheelOutcome.CASH_BACK: {
      const amtText = payout && payout > 0 ? ` +${payout} Tr.` : '';
      return `💰 ${playerName} quay trúng Hoàn Cước Cảng! Nhận hoàn tiền${amtText} từ Kho Bạc.`;
    }
    case TransitWheelOutcome.PASS_GO_FLIGHT: {
      const amtText = payout && payout > 0 ? ` (+${payout} Tr.)` : '';
      return `✈️ ${playerName} quay trúng Bay Xuyên Việt! Bay thẳng về ô Khởi Hành (GO) nhận thưởng${amtText}.`;
    }
    case TransitWheelOutcome.FLIGHT_DELAY:
    default:
      return `⏳ Chuyến bay của ${playerName} bị hoãn (Delay)! Quân cờ giữ nguyên tại ${stationName}.`;
  }
}
>>>>
```

---

### Task 2: Cập nhật kiểu dữ liệu (`src/client/store/activity_store.ts` & `src/client/store/game_store_types.ts`)
**Target physical file**: `src/client/store/activity_store.ts`

Snippet 2.1:
```typescript
<<<<
  | 'hose'
  | 'salary'
  | 'system';

export type ActivityFilterType = 'all' | 'money' | 'property';
====
  | 'hose'
  | 'salary'
  | 'transit'
  | 'system';

export type ActivityFilterType = 'all' | 'money' | 'property';
>>>>
```

**Target physical file**: `src/client/store/game_store_types.ts`

Snippet 2.2:
```typescript
<<<<
  | 'diplomatic'
  | 'trade'
  | 'decline_auction'
  | 'general';

export interface FloatingTextItem {
====
  | 'diplomatic'
  | 'trade'
  | 'decline_auction'
  | 'transit'
  | 'general';

export interface FloatingTextItem {
>>>>
```

---

### Task 3: Bổ sung `boostSteps`, bảo toàn Station Cell Index & Chống tống tiền đúp (`src/server/delta_types.ts` & `src/server/transit_wheel_handler.ts` - ADV-01, ADV-02)
**Target physical file**: `src/server/delta_types.ts`

Snippet 3.1:
```typescript
<<<<
  readonly pendingTransitWheel?:  { playerId: string; cellIndex: number; timestamp: number } | null;
  readonly lastTransitResult?:    { playerId: string; cellIndex: number; outcome: TransitWheelOutcome | string; targetCell?: number; payout?: number } | null;
}

export interface DeltaPayloadOptions {
====
  readonly pendingTransitWheel?:  { playerId: string; cellIndex: number; timestamp: number } | null;
  readonly lastTransitResult?:    { playerId: string; cellIndex: number; outcome: TransitWheelOutcome | string; targetCell?: number; payout?: number; boostSteps?: number } | null;
}

export interface DeltaPayloadOptions {
>>>>
```

Snippet 3.2:
```typescript
<<<<
  pendingTransitWheel?: { playerId: string; cellIndex: number; timestamp: number } | null;
  lastTransitResult?: { playerId: string; cellIndex: number; outcome: TransitWheelOutcome | string; targetCell?: number; payout?: number } | null;
}
====
  pendingTransitWheel?: { playerId: string; cellIndex: number; timestamp: number } | null;
  lastTransitResult?: { playerId: string; cellIndex: number; outcome: TransitWheelOutcome | string; targetCell?: number; payout?: number; boostSteps?: number } | null;
}
>>>>
```

**Target physical file**: `src/server/transit_wheel_handler.ts`

Snippet 3.3:
```typescript
<<<<
  const outcome = evaluateTransitWheelOutcome(rng());
  let targetCell = current.position;
  let payout = 0;

  switch (outcome) {
    case TransitWheelOutcome.SPEED_BOOST: {
      const boost = Math.floor(rng() * 6) + 1; // 1D6
      const oldPos = current.position;
      targetCell = (oldPos + boost) % BOARD_SIZE;
      current.position = targetCell;
====
  const outcome = evaluateTransitWheelOutcome(rng());
  const stationCell = current.position;
  let targetCell = current.position;
  let payout = 0;
  let boostSteps: number | undefined;

  switch (outcome) {
    case TransitWheelOutcome.SPEED_BOOST: {
      const boost = Math.floor(rng() * 6) + 1; // 1D6
      boostSteps = boost;
      const oldPos = current.position;
      targetCell = (oldPos + boost) % BOARD_SIZE;
      current.position = targetCell;
>>>>
```

Snippet 3.4:
```typescript
<<<<
        }
      }
      resolveSecondHopLanding(room, current, targetCell, registry, stateMap, rng, deckRng);
      break;
    }
    case TransitWheelOutcome.CASH_BACK: {
      payout = Math.min(300, Math.max(0, room.treasury ?? 0));
      room.treasury = (room.treasury ?? 0) - payout;
      current.balance += payout;
      break;
    }
    case TransitWheelOutcome.PASS_GO_FLIGHT: {
      const oldPos = current.position;
      targetCell = 0;
      current.position = 0;
      if (room.passedGoSalary === undefined) {
        const sal = calculateGoSalary(room.roundCount ?? 1);
        current.balance += sal;
        room.passedGoSalary = sal;
      } else {
        const stipend = Math.min(500, Math.max(0, room.treasury ?? 0));
        room.treasury = (room.treasury ?? 0) - stipend;
        current.balance += stipend;
      }
      break;
    }
    case TransitWheelOutcome.FLIGHT_DELAY:
    default:
      // Giữ nguyên vị trí, không thưởng phạt
      break;
  }

  room.lastTransitResult = {
    playerId: current.id,
    cellIndex: targetCell,
    outcome,
    targetCell,
    payout: payout > 0 ? payout : undefined,
  };

  return { success: true, outcome, targetCell, payout };
}
====
        }
      }
      // [ADV-01] Chống phạt tiền thuê đúp: Chỉ resolve second hop nếu thực sự di chuyển sang BĐS khác
      if (targetCell !== oldPos) {
        resolveSecondHopLanding(room, current, targetCell, registry, stateMap, rng, deckRng);
      }
      break;
    }
    case TransitWheelOutcome.CASH_BACK: {
      payout = Math.min(300, Math.max(0, room.treasury ?? 0));
      room.treasury = (room.treasury ?? 0) - payout;
      current.balance += payout;
      break;
    }
    case TransitWheelOutcome.PASS_GO_FLIGHT: {
      const oldPos = current.position;
      targetCell = 0;
      current.position = 0;
      if (room.passedGoSalary === undefined) {
        const sal = calculateGoSalary(room.roundCount ?? 1);
        current.balance += sal;
        room.passedGoSalary = sal;
        payout = sal; // [ADV-02] Bảo toàn hạch toán lương GO vào lastTransitResult
      } else {
        const stipend = Math.min(500, Math.max(0, room.treasury ?? 0));
        room.treasury = (room.treasury ?? 0) - stipend;
        current.balance += stipend;
        payout = stipend; // [ADV-02] Bảo toàn hạch toán phụ cấp kho bạc vào lastTransitResult
      }
      break;
    }
    case TransitWheelOutcome.FLIGHT_DELAY:
    default:
      // Giữ nguyên vị trí, không thưởng phạt
      break;
  }

  room.lastTransitResult = {
    playerId: current.id,
    cellIndex: stationCell,
    outcome,
    targetCell,
    payout: payout > 0 ? payout : undefined,
    ...(boostSteps !== undefined ? { boostSteps } : {}),
  };

  return { success: true, outcome, targetCell, payout };
}
>>>>
```

---

### Task 4: Module sâu trích xuất sự kiện vận tải (`src/client/network/activity_transit_tracker.ts`)
**Target physical file**: `src/client/network/activity_transit_tracker.ts` (New file)

Đặc tả mã nguồn toàn vẹn cho module mới với `delta.tick` và `roundNumber` trong key deduplication (GRILL-01):

```typescript
// [IMP-262] ActivityTransitTracker — Trích xuất nhật ký & thông báo Vòng Xoay Vận Tải
import type { DeltaPayload } from '../../server/session_manager.js';
import type { GameState } from '../store/game_store.js';
import { useActivityStore, type ActivityLogEntry } from '../store/activity_store.js';
import { formatTransitWheelBroadcast } from '../../domain/transit_wheel.js';
import { getCellName } from './activity_property_tracker.js';
import { getPlayerName } from './activity_rent_matcher.js';

let lastProcessedTransitKey: string | null = null;

export function resetTransitActivityTracker(): void {
  lastProcessedTransitKey = null;
}

export function detectTransitActivities(
  delta: DeltaPayload,
  _prevState: GameState,
  nextState: GameState,
  _activityStore: typeof useActivityStore = useActivityStore,
): ActivityLogEntry[] {
  const result = delta.lastTransitResult;
  if (!result || !result.playerId || !result.outcome) {
    return [];
  }

  // [GRILL-01] Gắn tick và roundNumber vào key để không nuốt sự kiện giống hệt ở vòng đấu sau
  const tickPrefix = delta.tick ?? delta.roundNumber ?? '';
  const key = `${tickPrefix}:${result.playerId}:${result.cellIndex}:${result.outcome}:${result.targetCell ?? ''}:${result.payout ?? 0}:${result.boostSteps ?? ''}`;
  if (key === lastProcessedTransitKey) {
    return [];
  }
  lastProcessedTransitKey = key;

  const pInfo = nextState.playersInfo[result.playerId];
  const playerName = getPlayerName(pInfo, result.playerId);
  const stationName = getCellName(result.cellIndex);
  const targetCellName = result.targetCell !== undefined ? getCellName(result.targetCell) : undefined;

  const message = formatTransitWheelBroadcast({
    outcome: result.outcome,
    playerName,
    stationName,
    targetCellName,
    payout: result.payout,
    boostSteps: result.boostSteps,
  });

  const entry: ActivityLogEntry = {
    id: `transit_${Date.now()}_${result.playerId}`,
    timestamp: Date.now(),
    type: 'transit',
    message,
    playerId: result.playerId,
    playerName,
    ...(pInfo?.tokenColor ? { playerTokenColor: pInfo.tokenColor } : {}),
    ...(result.payout && result.payout > 0 ? { amount: result.payout } : {}),
    cellIndex: result.targetCell ?? result.cellIndex,
  };

  return [entry];
}
```

---

### Task 5: Tích hợp vào Activity Tracker & Floating Badge Dispatcher (`src/client/network/activity_tracker.ts` & `src/client/network/activity_badge_dispatcher.ts`)
**Target physical file**: `src/client/network/activity_tracker.ts`

Snippet 5.1:
```typescript
<<<<
  activities.push(...detectFinancialAndStatusActivities(delta, prevState, nextState, context));
  activities.push(...detectAuctionActivities(delta, prevState, nextState, activityStore));

  const store = activityStore.getState();
  for (const entry of activities) {
    store.addActivityLog(entry);
  }
====
  activities.push(...detectFinancialAndStatusActivities(delta, prevState, nextState, context));
  activities.push(...detectAuctionActivities(delta, prevState, nextState, activityStore));
  activities.push(...detectTransitActivities(delta, prevState, nextState, activityStore));

  const store = activityStore.getState();
  for (const entry of activities) {
    store.addActivityLog(entry);
  }
>>>>
```

Snippet 5.2:
```typescript
<<<<
}

export { resetHoseActivityTracker } from './activity_financial_tracker.js';
====
}

import { detectTransitActivities, resetTransitActivityTracker } from './activity_transit_tracker.js';
export { resetTransitActivityTracker };
export { resetHoseActivityTracker } from './activity_financial_tracker.js';
>>>>
```

**Target physical file**: `src/client/network/activity_badge_dispatcher.ts`

Snippet 5.3:
```typescript
<<<<
const BADGE_HANDLERS: Record<string, (act: ActivityLogEntry, state: GameState, delta?: DeltaPayload) => void> = {
  rent: handleRentBadge, buy: handleBuyBadge, upgrade: handleUpgradeBadge, tax: handleTaxBadge, bail: handleBailBadge,
  salary: handleSalaryBadge, mortgage: handleMortgageBadge, unmortgage: handleUnmortgageBadge,
  auction: handleAuctionBadge, trade: handleTradeBadge, hose: handleHoseBadge,
  card: (act, state) => {
    if (act.id.startsWith('ma_buyout')) handleMaBuyoutBadge(act, state);
    else if (act.amount && act.amount < 0) handleCardPenaltyBadge(act, state);
  },
};
====
export function handleTransitBadge(act: ActivityLogEntry, state: GameState, _delta?: DeltaPayload): void {
  const isDelay = act.message.includes('bị hoãn');
  state.addFloatingText({
    text: act.message,
    type: isDelay ? FloatingTextType.Penalty : FloatingTextType.Bonus,
    playerId: act.playerId ?? '',
    actionType: 'transit',
    title: 'VÒNG XOAY VẬN TẢI',
    cellIndex: act.cellIndex,
    durationMs: 4000,
  });
}

const BADGE_HANDLERS: Record<string, (act: ActivityLogEntry, state: GameState, delta?: DeltaPayload) => void> = {
  rent: handleRentBadge, buy: handleBuyBadge, upgrade: handleUpgradeBadge, tax: handleTaxBadge, bail: handleBailBadge,
  salary: handleSalaryBadge, mortgage: handleMortgageBadge, unmortgage: handleUnmortgageBadge,
  auction: handleAuctionBadge, trade: handleTradeBadge, hose: handleHoseBadge,
  transit: handleTransitBadge,
  card: (act, state) => {
    if (act.id.startsWith('ma_buyout')) handleMaBuyoutBadge(act, state);
    else if (act.amount && act.amount < 0) handleCardPenaltyBadge(act, state);
  },
};
>>>>
```

Snippet 5.4:
```typescript
<<<<
export function dispatchActivityFloatingBadges(activities: readonly ActivityLogEntry[], state: GameState, delta?: DeltaPayload): void {
  if (typeof state?.addFloatingText !== 'function') return;
  for (const act of activities) {
    if (act.amount !== undefined && Math.abs(act.amount) <= 0 && act.type !== 'trade' && act.type !== 'card') continue;
    BADGE_HANDLERS[act.type]?.(act, state, delta);
  }
  if (delta?.lastDiplomaticEvent) handleDiplomaticEventBadge(delta.lastDiplomaticEvent, state);
}
====
export function dispatchActivityFloatingBadges(activities: readonly ActivityLogEntry[], state: GameState, delta?: DeltaPayload): void {
  if (typeof state?.addFloatingText !== 'function') return;
  for (const act of activities) {
    if (act.amount !== undefined && Math.abs(act.amount) <= 0 && act.type !== 'trade' && act.type !== 'card' && act.type !== 'transit') continue;
    BADGE_HANDLERS[act.type]?.(act, state, delta);
  }
  if (delta?.lastDiplomaticEvent) handleDiplomaticEventBadge(delta.lastDiplomaticEvent, state);
}
>>>>
```

---

### Task 6: Reset Session Lifecycle (`src/client/network/client_session_purger.ts` - GRILL-01)
**Target physical file**: `src/client/network/client_session_purger.ts`

Snippet 6.1:
```typescript
<<<<
import { resetEventCardActivityTracker, resetAuctionActivityTracker } from './activity_tracker.js';
====
import { resetEventCardActivityTracker, resetAuctionActivityTracker, resetTransitActivityTracker } from './activity_tracker.js';
>>>>
```

Snippet 6.2:
```typescript
<<<<
  // 2. Reset deduplication key của thẻ cơ hội / sự kiện thị trường và phiên đấu giá
  resetEventCardActivityTracker();
  resetAuctionActivityTracker();

  // 3. Reset flight recorder, audit logs, violations trong telemetry
====
  // 2. Reset deduplication key của thẻ cơ hội / sự kiện thị trường và phiên đấu giá
  resetEventCardActivityTracker();
  resetAuctionActivityTracker();
  resetTransitActivityTracker();

  // 3. Reset flight recorder, audit logs, violations trong telemetry
>>>>
```

---

### Task 7: Khoảng đệm quan sát cho Bot khi quay Vòng Xoay (`src/server/network/turn_orchestrator.ts` - GRILL-02, ADV-04)
**Target physical file**: `src/server/network/turn_orchestrator.ts`

Snippet 7.1:
```typescript
<<<<
export const AUCTION_SETTLE_DELAY_MS = 2500;
export const AUCTION_BOT_STEP_DELAY_MS = 1000;
export const BOT_UPGRADE_OBSERVATION_DELAY_MS = 1500;

export function calculateBotStepDelay(
  room: Room | undefined,
  baseDelayMs: number = 1500
): number {
====
export const AUCTION_SETTLE_DELAY_MS = 2500;
export const AUCTION_BOT_STEP_DELAY_MS = 1000;
export const BOT_UPGRADE_OBSERVATION_DELAY_MS = 1500;
export const BOT_TRANSIT_OBSERVATION_DELAY_MS = 2000;

export function calculateBotStepDelay(
  room: Room | undefined,
  baseDelayMs: number = 1500
): number {
>>>>
```

Snippet 7.2:
```typescript
<<<<
  if (!room || baseDelayMs <= 500) return baseDelayMs;
  if (
    (room.phase === TurnPhase.PropertyManagement || room.phase === TurnPhase.ActionPhase) &&
    room.lastDice &&
    (room.lastDice[0] > 0 || room.lastDice[1] > 0)
  ) {
    const steps = (room.lastDice[0] ?? 0) + (room.lastDice[1] ?? 0);
    const dynamicDelay = 1100 + steps * 200 + 800;
    return Math.max(baseDelayMs, dynamicDelay);
  }
  if (room.lastEventCard && baseDelayMs > 500) {
    return Math.max(baseDelayMs, 2500);
  }
  return baseDelayMs;
}
====
  if (!room || baseDelayMs <= 500) return baseDelayMs;
  // [GRILL-02][ADV-04] Rào pha PropertyManagement & ActionPhase, ưu tiên tính delay quan sát Vòng Xoay
  if (
    (room.phase === TurnPhase.PropertyManagement || room.phase === TurnPhase.ActionPhase) &&
    room.lastTransitResult &&
    baseDelayMs > 500
  ) {
    const boost = room.lastTransitResult.boostSteps ?? 0;
    const dynamicTransitDelay = 1200 + boost * 350 + BOT_TRANSIT_OBSERVATION_DELAY_MS;
    return Math.max(baseDelayMs, dynamicTransitDelay);
  }
  if (
    (room.phase === TurnPhase.PropertyManagement || room.phase === TurnPhase.ActionPhase) &&
    room.lastDice &&
    (room.lastDice[0] > 0 || room.lastDice[1] > 0)
  ) {
    const steps = (room.lastDice[0] ?? 0) + (room.lastDice[1] ?? 0);
    const dynamicDelay = 1100 + steps * 200 + 800;
    return Math.max(baseDelayMs, dynamicDelay);
  }
  if (room.lastEventCard && baseDelayMs > 500) {
    return Math.max(baseDelayMs, 2500);
  }
  return baseDelayMs;
}
>>>>
```

---

### Task 8: Tích hợp UI Milestone Banner & Narrative Icon (`src/client/ui/floating_numbers.tsx`, `src/client/ui/transaction_narrative.ts`, `src/client/ui/activity_feed_sidebar.tsx` - ADV-03)
**Target physical file**: `src/client/ui/floating_numbers.tsx`

Snippet 8.1:
```typescript
<<<<
  if (
    item.actionType === 'monopoly' ||
    item.actionType === 'debt_relief' ||
    item.actionType === 'chance' ||
    item.actionType === 'market' ||
    item.actionType === 'bankrupt'
  ) {
    return <MilestoneBanner item={item} />;
  }
====
  if (
    item.actionType === 'monopoly' ||
    item.actionType === 'debt_relief' ||
    item.actionType === 'chance' ||
    item.actionType === 'market' ||
    item.actionType === 'bankrupt' ||
    item.actionType === 'transit'
  ) {
    return <MilestoneBanner item={item} />;
  }
>>>>
```

**Target physical file**: `src/client/ui/transaction_narrative.ts`

Snippet 8.2:
```typescript
<<<<
  diplomatic: '🤝', bankrupt: '🚨', trade: '🤝', decline_auction: '🔨',
};
====
  diplomatic: '🤝', bankrupt: '🚨', trade: '🤝', decline_auction: '🔨',
  transit: '🚊',
};
>>>>
```

**Target physical file**: `src/client/ui/activity_feed_sidebar.tsx`

Snippet 8.3:
```typescript
<<<<
    case 'salary':
      return '🏁';
    case 'system':
    default:
      return '⚙️';
  }
====
    case 'salary':
      return '🏁';
    case 'transit':
      return '🚊';
    case 'system':
    default:
      return '⚙️';
  }
>>>>
```

---

### Task 9: Rào chắn Spectator Modal Takeover (`src/client/network/apply_delta.ts` - ADV-05)
**Target physical file**: `src/client/network/apply_delta.ts`

Snippet 9.1:
```typescript
<<<<
  if (delta.pendingTransitWheel) {
    const myPid = useLobbyStore.getState().myPlayerId;
    if (!myPid || delta.pendingTransitWheel.playerId === myPid) {
      state.openModal('transit_wheel', delta.pendingTransitWheel);
    }
  }

  if (delta.lastTransitResult !== undefined) {
    if (delta.lastTransitResult) {
      const myPid = useLobbyStore.getState().myPlayerId;
      if (!myPid || delta.lastTransitResult.playerId === myPid) {
        state.updateModalPayload<'transit_wheel'>({
          outcome: delta.lastTransitResult.outcome,
          targetCell: delta.lastTransitResult.targetCell,
          payout: delta.lastTransitResult.payout,
        });
      }
    } else if (state.activeModal === 'transit_wheel') {
      state.closeModal();
    }
  }
====
  if (delta.pendingTransitWheel) {
    const myPid = useLobbyStore.getState().myPlayerId;
    const isTarget = myPid ? delta.pendingTransitWheel.playerId === myPid : Boolean(state.isOfflineMode);
    if (isTarget) {
      state.openModal('transit_wheel', delta.pendingTransitWheel);
    }
  }

  if (delta.lastTransitResult !== undefined) {
    if (delta.lastTransitResult) {
      const myPid = useLobbyStore.getState().myPlayerId;
      const isTarget = myPid ? delta.lastTransitResult.playerId === myPid : Boolean(state.isOfflineMode);
      if (isTarget) {
        state.updateModalPayload<'transit_wheel'>({
          outcome: delta.lastTransitResult.outcome,
          targetCell: delta.lastTransitResult.targetCell,
          payout: delta.lastTransitResult.payout,
        });
      }
    } else if (state.activeModal === 'transit_wheel') {
      state.closeModal();
    }
  }
>>>>
```

---

## 5. MA TRẬN 16 BÀI KIỂM THỬ HỢP ĐỒNG (STATION 1 TEST SPECIFICATIONS - DOD #1)

**Target physical file**: `tests/contracts/imp262_transit_wheel_transparency.test.ts` (New file)

1. `TC-262.01 [UC-IMP262/MSS]`: Định dạng tiếng Việt chính xác cho kết quả SPEED_BOOST có kèm số bước và tên ô đến.
2. `TC-262.02 [UC-IMP262/MSS]`: Định dạng tiếng Việt chính xác cho kết quả SAFE_HAVEN khi người chơi đã có BĐS mục tiêu.
3. `TC-262.03 [UC-IMP262/A1]`: [ADV-01] SAFE_HAVEN khi người chơi có 0 BĐS thì ở lại trạm an toàn, không gọi lại `resolveSecondHopLanding` trên trạm và không bị trừ tiền thuê đúp.
4. `TC-262.04 [UC-IMP262/MSS]`: Định dạng tiếng Việt chính xác cho kết quả CASH_BACK hiển thị số tiền nhận hoàn cước từ Kho Bạc.
5. `TC-262.05 [UC-IMP262/MSS]`: [ADV-02] PASS_GO_FLIGHT bay thẳng về ô Khởi Hành, lưu chính xác `payout` (lương hoặc phụ cấp) vào `lastTransitResult` và hiển thị trên broadcast.
6. `TC-262.06 [UC-IMP262/MSS]`: Định dạng tiếng Việt chính xác cho kết quả FLIGHT_DELAY thông báo giữ nguyên vị trí.
7. `TC-262.07 [UC-IMP262/MSS]`: Module `detectTransitActivities` tạo ra `ActivityLogEntry` chuẩn với `type: 'transit'`, icon `🚊` và nạp vào store.
8. `TC-262.08 [UC-IMP262/A2]`: Cơ chế Idempotent Deduplication gắn tick/roundNumber chống nhân bản nhật ký khi nhận nhiều Delta tick cùng 1 kết quả quay.
9. `TC-262.09 [UC-IMP262/MSS]`: [ADV-03] `handleTransitBadge` phát hành `actionType: 'transit'` được render dưới dạng `MilestoneBanner` thay vì micro currency pill.
10. `TC-262.10 [UC-IMP262/A3]`: Kết quả không có tiền thưởng (FLIGHT_DELAY, SPEED_BOOST) không bị bộ lọc số dư loại bỏ khỏi Floating Badge.
11. `TC-262.11 [UC-IMP262/MSS]`: [ADV-04] `calculateBotStepDelay` tự động kéo dài tối thiểu 2000ms trong PropertyManagement/ActionPhase nhưng không kéo dãn trễ sang AuctionPhase.
12. `TC-262.12 [UC-IMP262/MSS]`: Chuỗi hệ quả bước 2: Bay đến đất trống chuyển phòng sang `TurnPhase.ActionPhase` và ghi nhận mua đất bình thường.
13. `TC-262.13 [UC-IMP262/MSS]`: Chuỗi hệ quả bước 2: Bay đến đất đối thủ trừ tiền thuê và kích hoạt nhật ký trả tiền thuê bình thường.
14. `TC-262.14 [UC-IMP262/MSS]`: Chuỗi hệ quả bước 2: Tốc hành vượt qua ô GO kích hoạt cộng lương vòng và ghi nhận nhật ký lương.
15. `TC-262.15 [UC-IMP262/MSS]`: `handleSpinTransitWheel` bảo toàn `cellIndex` là trạm xuất phát và `targetCell` là đích đến cùng `boostSteps`.
16. `TC-262.16 [UC-IMP262/A4]`: [ADV-05] Rào chắn Spectator: Người xem chưa có PID không bị ép mở modal popup khi người khác quay trạm.

---

## 6. LỆNH KIỂM CHỨNG CƠ HỌC (VERIFICATION COMMANDS)

```bash
# 1. Kiểm tra pre-flight kế hoạch
node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_262_TRANSIT_WHEEL_TRANSPARENCY_AND_SECOND_HOP.md

# 2. Chạy Station 1 Contract Tests (RED sau đó GREEN)
npx vitest run tests/contracts/imp262_transit_wheel_transparency.test.ts

# 3. Kiểm tra hồi quy toàn bộ test suite
npx vitest run tests/contracts/imp248_transit_wheel_navigator.test.ts
npx vitest run tests/client/activity_tracker.test.ts

# 4. Kiểm tra ngân sách LOC & linters
npm run prefilter -- src/domain/transit_wheel.ts src/client/store/activity_store.ts src/client/network/activity_transit_tracker.ts src/client/network/client_session_purger.ts src/client/network/activity_badge_dispatcher.ts src/client/network/activity_tracker.ts src/server/network/turn_orchestrator.ts src/server/transit_wheel_handler.ts src/client/ui/floating_numbers.tsx src/client/ui/transaction_narrative.ts src/client/ui/activity_feed_sidebar.tsx src/client/network/apply_delta.ts
```

---

## 7. TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE)

- [ ] 16/16 bài kiểm thử hợp đồng trong `tests/contracts/imp262_transit_wheel_transparency.test.ts` đạt GREEN với Adversarial Inversion.
- [ ] Mọi người chơi và khán giả đều nhận được Milestone Banner Toast và Activity Log khi bất kỳ ai (kể cả Bot) quay Vòng Xoay Vận Tải.
- [ ] Chuỗi hệ quả bước 2 (mua đất, nộp thuế, trả tiền thuê, qua GO) được thông báo đầy đủ và tách bạch với độ trễ quan sát 2000ms cho Bot.
- [ ] Tuân thủ nghiêm ngặt Anti-Slop, Deep Modules, 0 Dirty Casts, 0 Pass-Through Wrappers.
- [ ] Báo cáo nghiệm thu hoàn tất tại `docs/reports/improvements/IMP-262-transit-wheel-transparency_report.md`.
