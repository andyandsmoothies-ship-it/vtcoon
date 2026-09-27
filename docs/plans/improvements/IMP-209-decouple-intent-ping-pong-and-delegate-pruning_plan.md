# [PLAN] IMP-209: Decouple Intent Ping-Pong & Safe Delegate Pruning in RoomManager

> **Mã Ticket**: IMP-209 (Bước 1 của Chiến Lược Tái Cấu Trúc RoomManager)  
> **Phân Hạng**: Two-Way Door / Architectural Decoupling (Bước đệm an toàn trước Bước 2 `GameRoomSession`)  
> **Mục Tiêu Cốt Lõi**: Triệt tiêu chuỗi dội ngược (Ping-Pong Antipattern) giữa `intent_dispatcher` và `room_manager`, chuyển `intent_dispatcher` sang gọi trực tiếp Domain Coordinators, bảo toàn 100% thân hàm các bộ điều phối đấu giá & watchdog, và giữ nguyên vẹn tương thích ngược cho 54 call sites trong 18 test suite.

---

## 1. PHẠM VI XÁC ĐỊNH (STRICT CONFINED SCOPE)

Sau khi rà soát các rủi ro side-effect (vòng lặp AFK calling `touchActivity`), phạm vi của Bước 1 được **khu biệt nghiêm ngặt chỉ trong 2 tệp duy nhất**:
1. `src/server/intent_dispatcher.ts`: Bẻ gãy toàn bộ chuỗi dội ngược, gọi thẳng Domain Coordinators qua `m.getContext(rc)`.
2. `src/server/room_manager.ts`: Rút gọn thân hàm các delegate thừa, trích xuất bộ parse tham số `handleTradeOffer`, bảo toàn nguyên vẹn thân hàm của các method phục vụ Bot AI & Watchdog.

> [!IMPORTANT]
> **Quyết Định Kiến Trúc Về `afk_recovery.ts`**:
> Loại bỏ hoàn toàn `src/server/network/afk_recovery.ts` khỏi phạm vi sửa đổi của Bước 1. Vòng lặp cứu nguy AFK (`while (player.balance < 0 && attempts < 50)`) cần gọi trực tiếp hạ cấp/thế chấp mà không kích hoạt `touchActivity` liên tục trong 1 tick. Giữ nguyên 100% hiện trạng của tệp này để triệt tiêu mọi rủi ro hồi quy.

---

## 2. KIẾN TRÚC & NGUYÊN LÝ THỰC HIỆN

### 2.1. Hiện Trạng: Chuỗi Dội Ngược 5-6 Tầng (Ping-Pong Antipattern)
```
[Client / WSS]
       │
       ▼ (1)
[room_manager.handlePlayerIntent(roomCode, playerId, intent)]
       │
       ▼ (2)
[intent_dispatcher.ts: INTENT_MORTGAGE]
       │
       ▼ (3) DỘI NGƯỢC LẠI ROOM_MANAGER!
[room_manager.handleMortgage(roomCode, playerId, cellIndex)]
       │
       ▼ (4)
[room_property_coordinator.coordMortgage(ctx, playerId, cellIndex)]
       │
       ▼ (5)
[mortgage_manager.handleMortgage(...)]
```

### 2.2. Mục Tiêu Bước 1: Khử Dội Ngược Trực Tiếp (Direct Dispatch)
```
[Client / WSS]
       │
       ▼ (1)
[room_manager.handlePlayerIntent(roomCode, playerId, intent)]
       │
       ▼ (2)
[intent_dispatcher.ts: INTENT_MORTGAGE]
       │
       ▼ (3) GỌI THẲNG DOMAIN COORDINATOR (Dùng m.getContext(rc))
[room_property_coordinator.coordMortgage(ctx, playerId, cellIndex)]
       │
       ▼ (4)
[mortgage_manager.handleMortgage(...)]

* Ghi chú: room_manager.handleMortgage() được giữ nguyên signature dưới dạng 1-line delegate 
  dành riêng cho các bài test cũ và afk_recovery.ts, hoàn toàn thoát khỏi luồng Intent của Client.
```

---

## 3. PHÂN TÍCH RỦI RO & 4 NGUYÊN MẪU LỖI (FAILURE MODES & DEFENSE)

| Mã Lỗi | Nguyên Mẫu Thất Bại | Nguy Cơ Tiềm Ẩn | Biện Pháp Phòng Thủ Cụ Thể |
| :---: | :--- | :--- | :--- |
| **FM-1** | **Bot AI Auction Crash** | `coordStepAuctionBot` (tại `room_bot_coordinator.ts:18`) gọi `roomManager.handleAuctionBid` / `handleAuctionPass` bị crash nếu thân hàm bị tinh giản quá mức. | **BẢO TOÀN NGUYÊN VẸN 100% THÂN HÀM** của `handleAuctionBid`, `handleAuctionPass`, `handleAuctionClose` trong `room_manager.ts`, bao gồm: gọi `auction_manager`, `this.syncAuction(roomCode)` và `this.lastAuctionResults.set(roomCode, ...)`. Tuyệt đối không xóa hoặc rút gọn các method này. |
| **FM-2** | **Watchdog Timeout Crash** | `turn_watchdog.ts` và `turn_orchestrator.ts` gọi `mgr.handleAuctionClose` và `mgr.handleHoseSkip` khi hết giờ bị gãy. | Giữ nguyên vẹn signature và logic timeout hệ thống trên `RoomManager`. |
| **FM-3** | **Context Null Hazard** | `intent_dispatcher` gọi domain coordinator bằng `m.getContext(rc)` khi phòng chưa khởi tạo xong (`ctx === undefined`). | Mọi handler trong `intent_dispatcher` đều phải guard an toàn: `if (!ctx) return { success: false, reason: ActionRejectReason.INVALID_ROOM }`. |
| **FM-4** | **Test Compilation Failure** | 54 call sites trong 18 tệp test gọi `mgr.handleX(...)` bị lỗi kiểu TS2339. | **Giữ nguyên 100% public method signatures** trên `RoomManager`. Chỉ tinh giản thân hàm bên trong, gắn chú thích `@deprecated — Prefer handlePlayerIntent in new code`. |

---

## 4. CHI TIẾT TRIỂN KHAI MÃ NGUỒN (CONCRETE DROP-IN SPECIFICATION)

### Tệp 1: `src/server/intent_dispatcher.ts` (Ping-Pong Decoupling)

#### 4.1. Import các Domain Coordinators & Handlers:
```ts
import { TurnPhase, ActionRejectReason } from '../domain/room.js';
import { BuyResult } from '../domain/property_manager.js';
import type { RoomManager, RollResult } from './room_manager.js';
import {
  coordMortgage, coordRedeem, coordDowngrade, coordTrade,
  coordRespondTradeOffer, coordBankruptcy, coordExecuteCompulsoryBuyout,
  coordDeclineCompulsoryBuyout,
} from './room_property_coordinator.js';
import { handleUpgrade, handleUpgradeETC, handleUpgradeUtility, handleBuyProperty } from './property_actions.js';
import { handleHoseInvest, handleHoseSkip } from './hose_actions.js';
import { handleIssueBond, handleRepayBond } from './bond_manager.js';
import { handleBailOut } from './audit_manager.js';
import { handleDecline, handleAuctionBid, handleAuctionPass } from './auction_manager.js';
```

#### 4.2. Bẻ gãy chuỗi dội ngược trong `INTENT_DISPATCH`:
```ts
const INTENT_DISPATCH: Record<PlayerIntent['type'], IntentHandler> = {
  INTENT_ROLL: (m, rc, p) => {
    const res = m.handleRollDice(rc, p);
    return { success: res !== undefined, reason: res ? undefined : 'CANNOT_ROLL', rollResult: res };
  },
  INTENT_BUY: (m, rc, p) => {
    const ctx = m.getContext(rc);
    if (!ctx) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
    const player = ctx.room.players.find((pl) => pl.id === p);
    const res = handleBuyProperty(ctx.room, player, ctx.reg);
    return { success: res?.result === BuyResult.Success, reason: res?.result };
  },
  INTENT_BUY_PROPERTY: (m, rc, p) => {
    const ctx = m.getContext(rc);
    if (!ctx) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
    const player = ctx.room.players.find((pl) => pl.id === p);
    const res = handleBuyProperty(ctx.room, player, ctx.reg);
    return { success: res?.result === BuyResult.Success, reason: res?.result };
  },
  INTENT_DECLINE: (m, rc, p) => {
    const ctx = m.getContext(rc);
    if (!ctx) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
    const player = ctx.room.players.find((pl) => pl.id === p);
    return handleDecline(ctx.room, player, m.auctionsMap, rc);
  },
  INTENT_BID: (m, rc, p, i) => m.handleAuctionBid(rc, p, (i as { amount: number }).amount),
  INTENT_AUCTION_PASS: (m, rc, p) => m.handleAuctionPass(rc, p),
  INTENT_UPGRADE: (m, rc, p, i) => {
    const ctx = m.getContext(rc);
    if (!ctx) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
    const player = ctx.room.players.find((pl) => pl.id === p);
    return handleUpgrade(player, ctx.room.phase, (i as { cellIndex: number }).cellIndex, ctx.reg, ctx.sm, ctx.room.activeModifiers, ctx.room);
  },
  INTENT_UPGRADE_ETC: (m, rc, p) => {
    const ctx = m.getContext(rc);
    if (!ctx) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
    const player = ctx.room.players.find((pl) => pl.id === p);
    return handleUpgradeETC(player, ctx.room.phase, ctx.reg, ctx.sm, ctx.room);
  },
  INTENT_UPGRADE_UTILITY: (m, rc, p, i) => {
    const ctx = m.getContext(rc);
    if (!ctx) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
    const player = ctx.room.players.find((pl) => pl.id === p);
    return handleUpgradeUtility(player, ctx.room.phase, (i as { cellIndex: number }).cellIndex, ctx.reg, ctx.sm, ctx.room);
  },
  INTENT_DOWNGRADE: (m, rc, p, i) => {
    const ctx = m.getContext(rc);
    if (!ctx) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
    const di = i as { cellIndex: number; stepByStep?: boolean; enforceEvenDowngrading?: boolean };
    const player = ctx.room.players.find((pl) => pl.id === p);
    return coordDowngrade(ctx, player, di.cellIndex, rc, {
      stepByStep: di.stepByStep ?? true,
      enforceEvenDowngrading: di.enforceEvenDowngrading ?? true,
    });
  },
  INTENT_MORTGAGE: (m, rc, p, i) => {
    const ctx = m.getContext(rc);
    return ctx ? coordMortgage(ctx, p, (i as { cellIndex: number }).cellIndex) : { success: false, reason: ActionRejectReason.INVALID_ROOM };
  },
  INTENT_REDEEM: (m, rc, p, i) => {
    const ctx = m.getContext(rc);
    return ctx ? coordRedeem(ctx, p, (i as { cellIndex: number }).cellIndex) : { success: false, reason: ActionRejectReason.INVALID_ROOM };
  },
  INTENT_TRADE_OFFER: (m, rc, p, i) => {
    const ctx = m.getContext(rc);
    if (!ctx) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
    const ti = i as { sellerId: string; buyerId: string; cellIndex: number; price: number; offeredCellIndex?: number };
    return coordTrade(ctx, p, ti.sellerId, ti.buyerId, ti.cellIndex, ti.price, ti.offeredCellIndex);
  },
  INTENT_RESPOND_TRADE_OFFER: (m, rc, p, i) => {
    const ctx = m.getContext(rc);
    if (!ctx) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
    const ri = i as { offerId: string; accept: boolean };
    return coordRespondTradeOffer(ctx, p, ri.offerId, ri.accept);
  },
  INTENT_EXECUTE_COMPULSORY_BUYOUT: (m, rc, p, i) => {
    const ctx = m.getContext(rc);
    return ctx ? coordExecuteCompulsoryBuyout(ctx, p, (i as { cellIndex: number }).cellIndex) : { success: false, reason: ActionRejectReason.INVALID_ROOM };
  },
  INTENT_DECLINE_COMPULSORY_BUYOUT: (m, rc, p) => {
    const ctx = m.getContext(rc);
    return ctx ? coordDeclineCompulsoryBuyout(ctx, p) : { success: false, reason: ActionRejectReason.INVALID_ROOM };
  },
  INTENT_INVEST: (m, rc, p, i) => {
    const room = m.getRoom(rc);
    const player = room?.players.find((pl) => pl.id === p);
    return handleHoseInvest(room, player, m.getRng(), (i as { stake: number }).stake);
  },
  INTENT_SKIP: (m, rc, p) => {
    const room = m.getRoom(rc);
    const player = room?.players.find((pl) => pl.id === p);
    return handleHoseSkip(room, player);
  },
  INTENT_BAIL_OUT: (m, rc, p) => m.handleBailOut(rc, p),
  INTENT_BANKRUPTCY: (m, rc, p, i) => {
    const ctx = m.getContext(rc);
    if (!ctx) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
    const ci = i as { creditorId?: string };
    coordBankruptcy(ctx, p, ci.creditorId, m.auctionsMap, rc, (m as any).rolledThisTurn);
    return { success: true };
  },
  INTENT_ISSUE_BOND: (m, rc, p) => m.handleIssueBond(rc, p),
  INTENT_REPAY_BOND: (m, rc, p) => m.handleRepayBond(rc, p),
  INTENT_END_TURN: (m, rc, p) => {
    const room = m.getRoom(rc);
    const current = room?.players[room.currentPlayerIndex];
    const continueDoubles = (current?.consecutiveDoubles ?? 0) > 0 && !current?.skipNextTurn;
    const r = m.handleEndTurn(rc, p, continueDoubles);
    return { success: r !== undefined, reason: r ? undefined : 'INVALID_PHASE' };
  },
};
```

---

### Tệp 2: `src/server/room_manager.ts` (Thin Delegate Pruning & Trade Overload Helper)

#### 4.3. Trích xuất Helper Parse Tham Số `handleTradeOffer`:
Trích xuất hàm pure helper đặt ở cuối file hoặc trong module để rút gọn 35 dòng parse:
```ts
function parseTradeOfferArgs(
  arg2: string,
  arg3: string,
  arg4: string | number,
  arg5?: number,
  arg6?: number,
  arg7?: number,
): { requesterId: string; sellerId: string; buyerId: string; cellIndex: number; price: number; offeredCellIndex?: number } {
  if (typeof arg4 === 'number') {
    return { requesterId: arg2, sellerId: arg2, buyerId: arg3, cellIndex: arg4, price: arg5 ?? 0, offeredCellIndex: arg6 };
  }
  return { requesterId: arg2, sellerId: arg3, buyerId: arg4, cellIndex: arg5!, price: arg6!, offeredCellIndex: arg7 };
}
```
Nhờ đó `handleTradeOffer` trở thành 3 dòng:
```ts
  handleTradeOffer(rc: string, a2: string, a3: string, a4: string | number, a5?: number, a6?: number, a7?: number) {
    const p = parseTradeOfferArgs(a2, a3, a4, a5, a6, a7);
    return coordTrade(this.getContext(rc), p.requesterId, p.sellerId, p.buyerId, p.cellIndex, p.price, p.offeredCellIndex);
  }
```

#### 4.4. Giữ nguyên 100% logic điều phối của Auction:
Các method `handleAuctionBid`, `handleAuctionPass`, `handleAuctionClose` giữ nguyên vẹn luồng logic:
- Gọi `handleAuctionBid(...)` / `handleAuctionPass(...)` / `handleAuctionClose(...)`.
- Gọi `this.syncAuction(roomCode)`.
- Cập nhật `this.lastAuctionResults.set(roomCode, ...)`.
- Trả về đúng kết quả cho Bot AI và Watchdog.

---

## 5. DỰ KIẾN BIẾN ĐỘNG NGÂN SÁCH LOC (THỰC TẾ & TRUNG THỰC)

| Tệp Vật Lý | LOC Hiện Tại | LOC Sau Bước 1 | Chênh Lệch ($\Delta$) | Đánh Giá Tuân Thủ |
| :--- | :---: | :---: | :---: | :--- |
| `src/server/room_manager.ts` | **533** | **~490 - 500** | **-35 đến -43 dòng** | Tinh gọn thực chất, giữ 100% tương thích ngược |
| `src/server/intent_dispatcher.ts` | **108** | **~140** | **+32 dòng** | Độc lập, gọi thẳng Domain (<< 300 LOC) |
| `src/server/network/afk_recovery.ts` | **162** | **162** | **0 dòng** | Không can thiệp (tránh side-effect loop) |

> [!NOTE]
> Mục tiêu cốt lõi của Bước 1 **không phải là ép LOC bằng mọi giá (LOC-golf)**, mà là **khử đứt liên kết ping-pong giữa Intent và RoomManager**, bảo đảm 0 lỗi hồi quy và chuẩn bị cấu trúc sạch sẽ cho Bước 2 (`GameRoomSession`).

---

## 6. KẾ HOẠCH KIỂM CHỨNG & TIÊU CHÍ HOÀN TẤT (DEFINITION OF DONE)

1. **Không có lỗi biên dịch (Zero Compile Errors)**:
   - `npx tsc --noEmit` đạt 0 error, 0 warning.
2. **Không có hồi quy kiểm thử (Zero Test Regressions)**:
   - Toàn bộ **52 tệp test server (676 test)** chạy lệnh `npx vitest run tests/server/` PASS 100%.
   - Toàn bộ **hợp đồng kiểm thử IMP-205** (`tests/contracts/imp205_...test.ts`) PASS 19/19 tests.
3. **Bảo toàn hành vi Bot AI và Watchdog**:
   - `coordStepAuctionBot` và `turn_watchdog` chạy bình thường không văng exception.
