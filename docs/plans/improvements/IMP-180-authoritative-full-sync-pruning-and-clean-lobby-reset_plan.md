# [IMP-180] Khắc Phục Lỗi Start Game Thừa Bot: Authoritative Full-Sync Pruning & Clean Lobby State Reset (Plan)

> Ticket: IMP-180  
> Trạng Thái: Hoàn Tất (Approved & Verified)  
> Ngày: 2026-09-23  

---

## 1. Vấn Đề Người Dùng Báo Cáo
Người dùng phản ánh: *"kiểm tra lại logic start game, tôi mới add 2 bot xong start game nhưng vào game thấy có 3 bot"* (Chủ phòng thêm 2 Bot trong sảnh chờ, kỳ vọng ván đấu có 3 người chơi gồm 1 Human + 2 Bot, nhưng khi vào bàn cờ lại xuất hiện 3 Bot — tổng 4 người chơi).

---

## 2. Nguyên Nhân Gốc Rễ (Root Cause Analysis)
1. **Phía Server**:
   - Khi chủ phòng gửi `START_GAME` với danh sách 2 Bot `[{ id: 'bot_2' }, { id: 'bot_3' }]`, máy chủ `doStartGame` gọi `initRoomBots` và khởi tạo chính xác phòng 3 người chơi: `['p1', 'bot_2', 'bot_3']`.
   - Máy chủ phát `STATE_DELTA` đầu tiên với `forceFull: true` (`cells.length === 40`, `isFullSync = true`) và danh sách `players = ['p1', 'bot_2', 'bot_3']`.
2. **Khuyết tật rò rỉ trạng thái (Zombie State Retention) phía Client**:
   - Hàm `initPlayersInfoMap` sao chép nông toàn bộ `state.playersInfo` của ván trước đó (nơi từng có 4 người chơi `bot_4`).
   - Hàm `applyPlayerDeltas` chỉ cập nhật các người chơi có mặt trong `delta.players`, không có logic loại bỏ (pruning) các player ID dư thừa không có trong delta.
   - `nextPositions` giữ nguyên `bot_4: 36`.
   - `resetGameState` trong `game_store.ts` chỉ đặt lại các cờ điều hướng và modal, bỏ sót việc dọn dẹp `playersInfo: {}`, `playerPositions: {}`, `visualPositions: {}`, `levelMap: {}`.

---

## 3. Kiến Trúc Giải Pháp
1. **Full-Sync Pruning Guard**:
   - `initPlayersInfoMap` và `applyPlayerDeltas` chỉ thực hiện pruning khi: `isFullSync && Array.isArray(deltaPlayers)`.
   - Sparse delta (`isFullSync = false`) hoặc delta thiếu `players` bảo lưu 100% người chơi hiện hữu.
2. **SSOT INITIAL_GAME_STATE**:
   - Trích xuất `INITIAL_GAME_STATE` chứa toàn bộ 27 trường dữ liệu trạng thái sạch (zero actions).
   - `resetGameState: () => set(INITIAL_GAME_STATE)`.
3. **Non-Destructive Lobby Bot Reset**:
   - Bổ sung `resetBotSlots: () => set({ slots: get().slots.map((s, i) => s.isBot ? createEmptySlot(i) : s) })`.
   - Khi `delta.roomStarted === false`, gọi `state.resetGameState()` và `useLobbyStore.getState().resetBotSlots()`.
