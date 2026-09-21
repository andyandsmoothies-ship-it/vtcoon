# IMP-153: Pending Trade Timeout Auto-Clear & Freeze Prevention

**Ngày lập**: 2026-09-21  
**Nguồn gốc**: Phân tích log game thực tế `media_1789985367761.json` — freeze tại tick 233–237  
**Độ ưu tiên**: CRITICAL (game freeze)

---

## Vấn đề

Log ván đấu xác nhận 3 bug chồng nhau gây freeze màn hình:

### Bug #1 — CRITICAL: `checkPendingTradeTimeout` không có caller
`checkPendingTradeTimeout()` định nghĩa tại `room_manager.ts#L276` nhưng không có caller nào trong production WebSocket flow (`wss_server.ts` = 0 kết quả). Kết quả: offer hết hạn nhưng không bao giờ bị xóa.

### Bug #2 — CRITICAL: `executeEmergencyRecovery` không clear pending trade
`TurnWatchdog.executeEmergencyRecovery()` tại `turn_watchdog.ts#L172` gọi `handleEndTurn` mà không clear `pendingTradeOffer` trước. Nếu Watchdog kích hoạt trong khi `pendingTradeOffer !== null`, client vẫn thấy modal cũ.

### Bug #3 — MEDIUM: Turn-order không được validate trong `coordTrade`
`coordTrade()` chỉ kiểm tra `requesterId === sellerId || requesterId === buyerId` nhưng không kiểm tra `requesterId === currentTurnPlayerId`. Người chơi có thể gửi `INTENT_TRADE_OFFER` trong lượt của đối thủ.

---

## Blast Radius

| Chiều | Mô tả |
|-------|-------|
| **Risk Level** | Slice-Bound |
| **Direct Touch** | `turn_watchdog.ts`, `room_property_coordinator.ts` |
| **Downstream Consumers** | `pendingTradeManager`, `room.pendingTradeOffer`, `DeltaBroadcaster` |
| **Worst-Case Defense** | ~5s latency để clear expired offer — không ảnh hưởng UX bình thường |

---

## Proposed Changes

### Fix A — Auto-timeout trong `TurnWatchdog.checkRoom`

#### [MODIFY] [turn_watchdog.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/turn_watchdog.ts)

Trong `checkRoom()`, sau khi xác nhận room started, trước stall detection:

```typescript
if (this.rooms.hasPendingTrade?.(roomCode)) {
  const tradeTimeout = this.rooms.checkPendingTradeTimeout(roomCode, Date.now());
  if (tradeTimeout.timeout) {
    this.rooms.cancelPendingTrade?.(roomCode);
    this.broadcaster.broadcastRoomDelta(roomCode);
    console.log(`[TurnWatchdog] Pending trade expired and auto-cleared for room ${roomCode}`);
  }
}
```

Piggyback vào `setInterval(5_000)` có sẵn — không tạo timer mới.

---

### Fix B — Emergency recovery clear pending trade trước force-advance

#### [MODIFY] [turn_watchdog.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/turn_watchdog.ts)

Thêm guard đầu `executeEmergencyRecovery()` trước switch-case:

```typescript
if (this.rooms.hasPendingTrade?.(roomCode)) {
  this.rooms.cancelPendingTrade?.(roomCode);
  console.warn(`[TurnWatchdog] Emergency recovery: force-cancelled pending trade for room ${roomCode}`);
}
```

---

### Fix C — Turn-order guard trong `coordTrade`

#### [MODIFY] [room_property_coordinator.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_property_coordinator.ts)

Sau validate seller/buyer tồn tại, trước logic `isBotHuman`:

```typescript
const currentTurnPlayer = ctx.room.players[ctx.room.currentPlayerIndex];
const requester = ctx.room.players.find((p) => p.id === requesterId);
if (currentTurnPlayer?.id !== requesterId && !(requester?.isBot ?? false)) {
  return { success: false, reason: ActionRejectReason.NOT_YOUR_TURN };
}
```

Bot players được miễn trừ. Client hiển thị toast "Chưa Tới Lượt Chơi" qua `handleError` → `formatServerErrorMessage('NOT_YOUR_TURN')`.

---

## Verification Plan

### Automated Tests
- `npx vitest run tests/contracts/imp152_pending_trade_freeze_fix.test.ts` — 16/16 PASS
- `npm test` — toàn bộ suites PASS
- `npx tsc --noEmit` — 0 errors
- `npm run lint:ui` — 0 violations

### Evidence
- `.agents/evidence/imp152_snapshot.txt`
