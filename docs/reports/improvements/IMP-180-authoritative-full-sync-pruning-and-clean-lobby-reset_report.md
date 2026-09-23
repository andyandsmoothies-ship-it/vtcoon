# [IMP-180] Khắc Phục Lỗi Start Game Thừa Bot: Authoritative Full-Sync Pruning & Clean Lobby State Reset (Report)

> Ticket: IMP-180  
> Trạng Thái: Hoàn Tất (Station 3 Verified)  
> Ngày: 2026-09-23  

---

## 1. Kết Quả Kiểm Thử Định Lượng (Quantitative Test Results)
- **Tập Kiểm Thử Contract Mới**: `tests/client/imp180_match_start_bot_count_and_zombie_purge.test.ts`
  - Đạt 19/19 tests PASS (100%) bao phủ toàn diện 4 khía cạnh của Universal Matrix:
    - **Facet 1: Boundary (`TC-180.01..05`)**: 1 Host + 2 Bot -> 3 players/positions; 1 Host + 1 Bot -> 2 players/positions; 1 Host + 3 Bot -> 4 players/positions.
    - **Facet 2: Reactivity (`TC-180.06..10`)**: Full sync prune `bot_4` khỏi `playersInfo`, `playerPositions`, `visualPositions`, và kích hoạt update store Zustand.
    - **Facet 3: Disposal (`TC-180.11..17`)**: `resetGameState()` xóa sạch toàn bộ map; `resetBotSlots()` dọn sạch slot bot; delta `roomStarted: false` tự động gọi reset.
    - **Facet 4: Error Defense (`TC-180.18..19`)**: Sparse delta và delta thiếu `players` bảo lưu 100% người chơi hiện hữu.
- **Toàn Bộ Test Suites**: 304/304 test files PASS, 6.175/6.175 tests PASS 100%.
- **Chất Lượng Mã Nguồn**:
  - `npx tsc --noEmit`: 0 lỗi.
  - `npm run lint:ui`: 0 lỗi (0 anti-patterns across 171 files).
  - LOC Budget: `game_store.ts` (368 LOC), `game_store_types.ts` (347 LOC), `lobby_types.ts` (99 LOC), `lobby_store.ts` (274 LOC), `apply_delta_players.ts` (279 LOC), `apply_delta.ts` (256 LOC). Toàn bộ dưới trần 400 LOC.

---

## 2. Các Tập Tin Đã Thay Đổi
1. `src/client/store/game_store_types.ts`: Trích xuất `INITIAL_GAME_STATE` cho 27 trường dữ liệu trạng thái sạch; `resetGameState: () => void;` trong `GameState`.
2. `src/client/store/game_store.ts`: Sử dụng `...INITIAL_GAME_STATE` và `resetGameState: () => set(INITIAL_GAME_STATE)`.
3. `src/client/store/lobby_types.ts`: Bổ sung action `resetBotSlots: () => void;` trong `LobbyState`.
4. `src/client/store/lobby_store.ts`: Triển khai `resetBotSlots` biến các slot bot thành empty slot.
5. `src/client/network/apply_delta_players.ts`: Prune người chơi trong `initPlayersInfoMap` và `applyPlayerDeltas` khi `isFullSync && Array.isArray(deltaPlayers)`; đồng bộ vị trí trong `syncFinalPositions`.
6. `src/client/network/apply_delta.ts`: Truyền `delta.players` vào `initPlayersInfoMap`; gọi `resetBotSlots()` khi `roomStarted: false`.
7. `tests/client/imp180_match_start_bot_count_and_zombie_purge.test.ts`: 19 contract tests.
8. `docs/domain/gotchas.md`: Ghi nhận Invariant #248.
9. `docs/master_roadmap.md`: Cập nhật lộ trình.

---

## 3. Bất Biến Đúc Kết (Gotcha #248)
- Authoritative Full-Sync Pruning Guard: Chỉ prune người chơi khi `isFullSync && Array.isArray(deltaPlayers)`.
- Comprehensive INITIAL_GAME_STATE SSOT: Đặt lại toàn bộ dữ liệu bàn cờ về sạch khi reset.
- Non-Destructive Lobby Bot Reset: Làm trống slot bot nhưng giữ nguyên phòng và người chơi thật.
