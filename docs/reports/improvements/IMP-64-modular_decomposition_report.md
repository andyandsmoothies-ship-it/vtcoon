# IMP-64 — Modular Decomposition Report

**Ngày hoàn thành**: 2026-09-15  
**Trạng thái**: ✅ COMPLETE  
**Kế hoạch**: [`docs/plans/improvements/IMP-64-modular_decomposition_plan.md`](../../../plans/improvements/IMP-64-modular_decomposition_plan.md)

---

## 1. Mục tiêu

Đưa 5 file cốt lõi vượt ngưỡng LOC budget về chuẩn an toàn, không thay đổi logic, không làm gãy consumer imports.

| File mục tiêu | Trước | Sau | Đạt chuẩn |
|---|---|---|---|
| `src/server/room_manager.ts` | 402 LOC | 329 LOC | ✅ (Hard limit 400) |
| `src/server/network/wss_server.ts` | 414 LOC | 340 LOC | ✅ (Hard limit 400) |
| `src/client/network/apply_delta.ts` | 432 LOC | 139 LOC | ✅ |
| `src/client/main.tsx` | 480 LOC | 224 LOC | ✅ |
| `src/client/3d/auction_3d_stage.tsx` | 497 LOC | 273 LOC | ✅ |

---

## 2. Phương pháp thực hiện

**Pattern**: Facade Re-Export — file gốc trở thành shell mỏng delegating xuống sub-module, re-export 100% public API để consumer imports không thay đổi.

**Quy trình 4 Slice tuần tự**:
```
Slice 1 → test:chaos → Slice 2 → contracts → Slice 3 → build → Slice 4 → Final Gate
```

---

## 3. Files tạo mới (10 files)

### Slice 1: Server Core
| File | LOC | Nội dung |
|---|---|---|
| `src/server/room_manager_lifecycle.ts` | 254 | 19 pure functions: doCreateRoom, doJoinRoom, doStartGame, doAddBot, doRemoveBot, doHandleEndTurn, doCloseRoom, doOnCloseRoom, doRegisterTimer, doClearRoomTimers, doGetActiveTimers, doTouchActivity, doGetLastActivity, doGetAllRoomCodes, doGetRoomCount, doHasRoom, getActivePlayerFn, doSetBotPersonality, doGetBotPersonality |
| `src/server/room_manager_queries.ts` | 39 | 3 pure query functions: calcPropertyRent, calcRankings, buildRoomDelta |
| `src/server/network/wss_connection_handler.ts` | 93 | attachConnectionHandlers, bindSocketTo, sendSessionInitMsg, ConnectionHandlerDeps interface |
| `src/server/network/wss_intent_handler.ts` | 119 | handleIntentMsg, handleReconnectMsg, syncRoomAfterIntent, IntentHandlerDeps/ReconnectHandlerDeps interfaces |

### Slice 2: Client Network Delta
| File | LOC | Nội dung |
|---|---|---|
| `src/client/network/apply_delta_players.ts` | 170 | Player section verbatim: initPlayersInfoMap, applyPlayerDeltas + 10 helpers |
| `src/client/network/apply_delta_cells.ts` | 145 | Cell section verbatim: applyCellDeltas + 8 helpers |

### Slice 3: Client App Lifecycle
| File | LOC | Nội dung |
|---|---|---|
| `src/client/network/use_app_session.ts` | 252 | WS event handlers + useGameWs call + AudioEngine init + game init effect + landedPawn effect |
| `src/client/network/use_app_turn_controls.ts` | 123 | handleRollDice, handleEndTurn, AFK timer effect, handleSendEmote, handleLeaveRoom |

### Slice 4: 3D Visual Arena
| File | LOC | Nội dung |
|---|---|---|
| `src/client/3d/auction_particle_engine.ts` | 156 | 3 const objects, GoldParticle interface, 6 pure math functions |
| `src/client/3d/use_auction_card_animation.ts` | 69 | AuctionAnimationRefs interface + useAuctionCardAnimation hook |

---

## 4. Consumer Safety — Zero Breaking Change

Tất cả consumer imports của 5 file gốc được giữ nguyên qua facade re-exports:

| Consumer | Import path | Vẫn hoạt động |
|---|---|---|
| 50+ server files | RoomManager class từ room_manager.ts | ✅ Class giữ nguyên |
| src/server/index.ts | WssServer class từ wss_server.ts | ✅ Class giữ nguyên |
| use_game_ws.ts, ws_message_handler.ts, 12 test files | applyDeltaToStore, isGameRunningDelta từ apply_delta.ts | ✅ Giữ trong file gốc |
| tests/client/ops02_bundle_perf.test.ts | export const GameCanvas từ main.tsx | ✅ Giữ nguyên |
| tests/client/auction_3d_stage.test.ts | All pure functions từ auction_3d_stage.tsx | ✅ Re-exported qua facade |
| time_of_day_lighting.tsx | calculateTheatricalAmbientIntensity từ auction_3d_stage.tsx | ✅ Re-exported qua facade |

---

## 5. Fixes phát sinh (type-only, zero logic change)

1. **Template literal corruption** (Slice 1): Backtick characters bị strip khi write qua Python string escaping — 7 instances được repair bằng replace_file_content.
2. **TypeScript re-export + internal use** (Slice 2): `export { x } from '...'` không tạo local binding — thêm `import { x }` kép để applyDeltaToStore gọi được initPlayersInfoMap, applyPlayerDeltas, applyCellDeltas.
3. **Type narrowing** (Slice 3):
   - currentTurnPlayerId: string | null | undefined → thêm `?? null` cho executeCellLanding
   - roomCode: string | undefined → string | null để khớp kiểu thực của useLobbyStore
   - sendIntent/sendWsMessage type widened để khớp contravariance strict TypeScript

---

## 6. Kết quả kiểm thử

### Sau Slice 1
| Gate | Kết quả |
|---|---|
| npm test | ✅ 177 files / 3044 tests PASS — 23.27s |
| npm run test:chaos | ✅ 1000/1000 ván — Deadlock 0% — Treasury Leak 0 Tr. |

### Sau Slice 2
| Gate | Kết quả |
|---|---|
| Contract tests (imp57, imp63) | ✅ 95/95 PASS — 824ms |

### Sau Slice 3
| Gate | Kết quả |
|---|---|
| npm run build | ✅ Exit 0 — 797 modules — 12.88s |
| TypeScript --noEmit | ✅ Exit 0 |

### Sau Slice 4
| Gate | Kết quả |
|---|---|
| npm run build | ✅ Exit 0 — 797 modules — 10.42s |
| TypeScript --noEmit | ✅ Exit 0 |

### Final Gate
| Gate | Kết quả |
|---|---|
| npm test | ✅ 177 files / 3044 tests PASS — 22.15s |
| npm run test:chaos | ✅ 1000/1000 ván — Deadlock 0% — Treasury Leak 0 Tr. |
| node scripts/lint_slop.mjs | ✅ 0 Hard Violations (28 soft warnings — không phải lỗi) |

---

## 7. Domain Learnings

Gotcha **#98** đã được ghi nhận vào `docs/domain/gotchas.md`:

- **Facade Barrel Pattern**: file gốc PHẢI re-export 100% public symbols
- **Import + Export kép**: cần cho symbols được dùng nội bộ trong file gốc
- **Test từng slice**: npm test + test:chaos sau mỗi slice trước khi tiếp tục
- **lint_slop.mjs**: phân biệt Soft warning (300–400 LOC) vs Hard violation (>400 LOC)

---

## 8. Tech Debt còn lại (Soft Warnings — không phải lỗi)

Các file sau đạt 300–400 LOC (soft warning zone) — chưa cần action ngay:

| File | LOC | Ghi chú |
|---|---|---|
| src/server/room_manager.ts | 329 | Delegating shell — LOC đến từ method signatures |
| src/server/network/wss_server.ts | 340 | Constructor phức tạp — khó tách thêm |
| src/client/store/game_store.ts | 350 | Store state — xem xét IMP tương lai |
| src/server/network/turn_orchestrator.ts | 317 | Xem xét IMP tương lai |