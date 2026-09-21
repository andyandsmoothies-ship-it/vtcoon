# IMP-152 Report: Pending Trade Timeout Auto-Clear & Freeze Prevention

**Status**: ✅ COMPLETE  
**Date**: 2026-09-21  
**Trigger**: Log thực tế (tick 233–237) xác nhận game freeze khi `pendingTradeOffer` không được auto-clear sau khi hết hạn.

---

## Root Cause Summary

3 bug chồng nhau gây freeze màn hình:

| # | Bug | Severity |
|---|-----|----------|
| 1 | `checkPendingTradeTimeout()` không có caller trong production WebSocket flow | CRITICAL |
| 2 | `TurnWatchdog.executeEmergencyRecovery()` không clear `pendingTradeOffer` trước force-advance | CRITICAL |
| 3 | `coordTrade()` không guard turn-order — off-turn human có thể inject pending trade | MEDIUM |

---

## Changes

### `src/server/network/turn_watchdog.ts`

**Fix A** — `checkRoom()`: Piggyback auto-timeout vào setInterval 5s có sẵn. Mỗi Watchdog tick, nếu phòng có expired pending trade → tự động `cancelPendingTrade` + `broadcastRoomDelta`.

**Fix B** — `executeEmergencyRecovery()`: Guard đầu hàm, cancel pending trade trước khi vào switch-case force-advance.

Tất cả call mới dùng optional chaining (`?.`) để an toàn với mock objects trong test legacy.

### `src/server/room_property_coordinator.ts`

**Fix C** — `coordTrade()`: Turn-order guard sau validate seller/buyer, trước logic `isBotHuman`. Reject `NOT_YOUR_TURN` khi `requesterId !== currentTurnPlayerId` và `!requester.isBot`. Client hiển thị toast "Chưa Tới Lượt Chơi" qua `handleError` trong `use_app_session.ts`.

---

## Test Results

| Suite | Result |
|-------|--------|
| Contract tests (16 tests) | 16/16 ✅ |
| Full suite (275 files) | 273/275 ✅ (2 pre-existing không liên quan) |
| TypeScript | 0 errors ✅ |
| UI Lint | 0 violations ✅ |

---

## Station 3 Review Verdicts

| Reviewer | Verdict | Ghi chú |
|----------|---------|---------|
| `spec-reviewer` | APPROVED (sau fix) | Gotcha #203 đã có trong file, cập nhật domain index |
| `code-reviewer` | APPROVED (sau fix) | Đã thêm `?.` vào `cancelPendingTrade` tại Fix A L116 |

---

## Domain Learnings

- **Gotcha #203** `[NET/SYNC][FSM]` — TurnWatchdog Mock Resilience + Pending Trade Freeze triple-bug pattern. Ghi vào `docs/domain/gotchas.md`.
- **Invariant**: Mọi method RoomManager mới trong TurnWatchdog PHẢI dùng `?.`.
- **Invariant**: `executeEmergencyRecovery` PHẢI cancel pending trade trước switch-case.
- **Invariant**: `coordTrade` PHẢI reject non-bot off-turn requesters với `NOT_YOUR_TURN`.

---

## Evidence

[`.agents/evidence/imp152_snapshot.txt`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp152_snapshot.txt)
