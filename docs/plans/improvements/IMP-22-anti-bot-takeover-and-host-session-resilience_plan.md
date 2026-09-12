# KẾ HOẠCH CẢI TIẾN: IMP-22
# CHỐNG CƯỚP QUYỀN ĐIỀU KHIỂN BOT (ANTI-BOT TAKEOVER INVARIANT) & TĂNG CƯỜNG PHỤC HỒI PHIÊN KẾT NỐI MẠNG CHO HOST

> **Mã số cải tiến:** IMP-22  
> **Thuộc chu trình:** Continuous Improvement & Ad-hoc Persistence (Hiến pháp `GEMINI.md`)  
> **Mục tiêu:** Triệt tiêu hoàn toàn lỗi người chơi người thật (P1/Host) bị hệ thống biến thành Bot khi bắt đầu ván đấu; bảo đảm tính toàn vẹn phiên kết nối WebSocket và trải nghiệm điều khiển thủ công.  
> **Ngày lập kế hoạch:** 12/09/2026  
> **Trạng thái:** ĐÃ PHÊ DUYỆT & TRIỂN KHAI  

---

## 1. BỐI CẢNH & HIỆN TƯỢNG SỰ CỐ

### 1.1 Hiện tượng mắt thấy (Observed Behavior)
- Khi người chơi bấm **Bắt Đầu Trận Đấu** từ Sảnh Chờ:
  1. Thẻ người chơi `player_card.tsx` của Host ("Đại Gia Chủ Sảnh (P1)") lập tức bị gắn huy hiệu xanh `[BOT]`.
  2. Thanh Action Dock ở đáy màn hình bị khóa chặt ở trạng thái `Đang Đổ...` hoặc `Đang Đi...`, người chơi không thể bấm đổ xúc xắc hay mua bán tài sản.
  3. Toàn bộ 4 người chơi đều là Bot, ván cờ tự động xoay tua với tốc độ chóng mặt; Docker container liên tục ghi nhận các sự kiện tự động cưỡng chế thế chấp/phá sản (`INSOLVENCY_TRIGGERED`, `MORTGAGE_PROPERTY`).

### 1.2 Phân tích nguyên nhân gốc rễ (Root Cause Analysis - 5 Lỗ hổng)
Sơ đồ logic gây lỗi:
```
[Host ở Sảnh Chờ > 60s HOẶC Tab trình duyệt nền trễ nhịp Ping/Pong]
                         │
                         ▼
             [Grace Timer 60s đếm ngược]
                         │
                         ▼
            [handleGraceExpired() kích hoạt]
                         │
        ┌────────────────┴────────────────┐
        ▼ (Lỗ hổng 1 & 2)                  ▼
[Không kiểm tra !room.started]   [Không kiểm tra socket OPEN]
        │                                 │
        └────────────────┬────────────────┘
                         ▼
        [BotEngine.takeover: player.isBot = true] ◄── LỖI: Host thành Bot ngay ở Sảnh!
                         │
                         ▼
    [Host bấm Bắt Đầu Trận Đấu (handleStartGame)]
                         │
                         ▼ (Lỗ hổng 4)
    [Không reset isBot = false cho Host & Socket active]
                         │
                         ▼
    [scheduleBotTurn() kích hoạt cho P1 ➔ Vòng lặp 4 Bot chạy vô tận]
```

1. **Lỗ hổng 1 (`reconnect_manager.ts`)**: `handleGraceExpired` không kiểm tra `if (!room.started)`. Khi người chơi ở trong Sảnh Chờ quá 60 giây hoặc tab trình duyệt bị hệ điều hành throttle background ping/pong, Grace Timer (60s) hết hạn và tự động takeover biến P1 thành Bot ngay khi còn ở Sảnh Chờ!
2. **Lỗ hổng 2 (`reconnect_manager.ts`)**: `handleGraceExpired` không kiểm tra xem socket của người chơi có đang kết nối (`isSocketConnected`) hay không. Nếu socket vẫn sống hoặc vừa kết nối lại, hệ thống vẫn tiếp quản cướp quyền!
3. **Lỗ hổng 3 (`wss_server.ts`)**: Khi nhận lệnh `CREATE_ROOM` và `JOIN_ROOM`, server không dọn dẹp bộ đếm Grace Period cũ còn sót lại của session trước đó.
4. **Lỗ hổng 4 (`wss_server.ts`)**: Trong `handleStartGame`, server không ép buộc `hostPlayer.isBot = false`. Nếu P1 từng bị cờ `isBot = true` trước đó, khi bắt đầu game server lập tức chạy `scheduleBotTurn` cho P1 và cả 4 người chơi đều là Bot.
5. **Lỗ hổng 5 (`use_game_ws.ts`)**: Client thiếu cơ chế dọn sạch token rác khi nhận thông báo lỗi token hoặc kết thúc ván (`GAME_OVER`), gây nguy cơ handshake nhầm vào phiên cũ.

---

## 2. THIẾT KẾ GIẢI PHÁP KỸ THUẬT (ARCHITECTURAL SOLUTION)

### 2.1 Bất biến kiến trúc: Anti-Bot Takeover Invariant
- **Bất biến 1 (Lobby Immunity)**: Trong Sảnh Chờ (`!room.started`), người chơi người thật (đặc biệt là Host) TUYỆT ĐỐI KHÔNG BAO GIỜ bị chuyển đổi thành `isBot = true`.
- **Bất biến 2 (Active Socket Supremacy)**: Nếu kết nối WebSocket của người chơi đang ở trạng thái `WebSocket.OPEN`, bất kỳ bộ đếm thời gian ân hạn (Grace Timer) nào hết hạn đều phải bị HỦY BỎ NGAY LẬP TỨC và khôi phục trạng thái `SessionState.Connected`, không được kích hoạt takeover.
- **Bất biến 3 (Game Start Human Priority)**: Tại thời điểm bấm `START_GAME`, toàn bộ người chơi đang duy trì kết nối WebSocket mở bắt buộc phải được đặt lại cờ `isBot = false` và xóa mọi bộ đếm ân hạn trước khi FSM bàn cờ được khởi tạo.

### 2.2 Chi tiết can thiệp mã nguồn

#### A. Server Reconnect Manager (`src/server/network/reconnect_manager.ts`)
- Bổ sung cấu hình callback `isSocketConnected?: (roomCode: string, playerId: string) => boolean`.
- Trong `handleGraceExpired`:
  * Nếu `this.isSocketConnected?.(roomCode, playerId)` là `true`: lập tức phục hồi `SessionState.Connected`, cập nhật `lastPongAt = Date.now()` và hủy takeover.
  * Nếu `room && !room.started && room.hostId === playerId`: return ngay lập tức, cấm tuyệt đối takeover Host ở sảnh chờ.
  * Chỉ gọi `this.rooms.runBotTurn(roomCode)` khi `room.started === true`.

#### B. Server WSS Server (`src/server/network/wss_server.ts`)
- Cung cấp lambda kiểm tra socket `isOpen` cho `ReconnectManager`:
  `isSocketConnected: (rc, pid) => Boolean(this.sockets.getPlayerSocket(rc, pid)?.readyState === WebSocket.OPEN)`.
- Trong `bindSocket`: Gọi `this.reconnects.cancelGracePeriod(roomCode, playerId)`, đồng thời nếu `!room.started` thì ép `p.isBot = false`.
- Trong `route`: Gọi `cancelGracePeriod` khi nhận `CREATE_ROOM`, `JOIN_ROOM` và `PONG`.
- Trong `handleStartGame`:
  * Ép `hostP.isBot = false` và hủy ân hạn của Host.
  * Duyệt qua toàn bộ `room.players`, nếu người chơi có socket đang kết nối thì ép `p.isBot = false` và hủy ân hạn.
- Trong `handleLeaveRoom`: Nếu `!room.started`, chỉ gỡ người chơi khỏi mảng mà không phát sóng `PLAYER_BOT_TAKEOVER` hay phá sản.

#### C. Server Room Bot Manager (`src/server/room_bot_manager.ts`)
- Trong `initRoomBots`: Bỏ qua nếu `cleanId === room.hostId` để bảo đảm cấu hình bot không bao giờ ghi đè lên slot của Host.

#### D. Client Network Hook (`src/client/network/use_game_ws.ts`)
- Xóa bỏ `reconnectToken` khỏi LocalStorage khi nhận thông báo `GAME_OVER` hoặc mã lỗi `TOKEN_INVALID`/`TOKEN_EXPIRED`/`ROOM_NOT_FOUND`.

---

## 3. BỘ KIỂM THỬ ĐỐI KHÁNG (ADVERSARIAL TESTS SPECIFICATION)

Tạo mới tệp kiểm thử `tests/server/lobby_bot_takeover_prevention.test.ts`:
1. `[UC-GAME-008/ADV-1]`: Host ở trong Sảnh Chờ quá thời gian ân hạn (grace period) không bao giờ bị biến thành Bot.
2. `[UC-GAME-008/ADV-2]`: Host bị mất kết nối tạm thời ở Sảnh Chờ nhưng kết nối lại trước khi bắt đầu thì bắt đầu ván với `isBot = false`.
3. `[UC-GAME-008/ADV-3]`: Khi Host bấm Bắt Đầu Trận Đấu, server ép buộc Host và các người chơi đang kết nối có `isBot = false`.
4. `[UC-GAME-008/ADV-4]`: Socket của người chơi đang mở (OPEN) thì khi grace timeout kích hoạt, hệ thống tự động hủy ân hạn và không takeover.
5. `[UC-GAME-008/ADV-5]`: Xử lý PONG kèm roomCode hủy bỏ ân hạn cho người chơi.
6. `[UC-GAME-008/ADV-6]`: Người chơi gửi `LEAVE_ROOM` khi còn ở Sảnh Chờ không bị đánh dấu `isBot = true` hay `bankrupt = true`.

---

## 4. TIÊU CHUẨN HOÀN THÀNH (DEFINITION OF DONE)

1. 100% các ca kiểm thử đối kháng trong `lobby_bot_takeover_prevention.test.ts` đều PASS.
2. Bộ kiểm thử toàn hệ thống (Server, Client, Domain, Integration, Contracts) đạt 100% PASS.
3. Không làm ảnh hưởng đến cơ chế tiếp quản của Bot giữa trận đấu khi người chơi disconnect thật theo đúng chuẩn `[UC-GAME-008/MSS]`.
4. `npm run gate:quick` sạch 0 lỗi lint, 0 lỗi type TypeScript, 0 anti-slop violations.
5. Container Docker được rebuild và kiểm tra thực tế hoạt động bình thường.
