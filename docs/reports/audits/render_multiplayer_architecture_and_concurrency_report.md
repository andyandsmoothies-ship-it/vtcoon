# BÁO CÁO PHÂN TÍCH KIẾN TRÚC MẠNG & ĐỒNG THỜI KHI TRIỂN KHAI TRÊN RENDER.COM
## Multi-User Concurrency, WebSocket Handshake & Lobby Lifecycle Forensic Report

> **Thời gian lập báo cáo**: 22/09/2026  
> **Môi trường**: Production Web Service trên Render.com (WebSocket + SPA Static/Node)  
> **Phạm vi thẩm tra**: `src/client/offline_landing.ts`, `src/client/network/`, `src/client/store/lobby_store.ts`, `src/server/network/`, `src/server/room_manager_lifecycle.ts`, `src/domain/bot/`

---

## 1. TỔNG QUAN HỆ THỐNG MẠNG CLIENT - SERVER

Ứng dụng VTCOON hoạt động theo mô hình **Server-Authoritative** (Máy chủ nắm quyền kiểm soát trạng thái tuyệt đối):

```text
[Trình duyệt Người chơi A]       [Trình duyệt Người chơi B]       [Trình duyệt Người chơi C]
        │                                 │                                 │
        │                                 │                                 │
        ▼ (WebSocket: wss://<domain>/rooms/<roomCode>)                      │
┌───────────────────────────────────────────────────────────────────────────▼───────────┐
│                              RENDER.COM WEB SERVICE (Node.js)                         │
│                                                                                       │
│  ┌───────────────────────┐   ┌────────────────────────┐   ┌────────────────────────┐  │
│  │    SocketRegistry     │   │      RoomManager       │   │    TurnOrchestrator    │  │
│  │ (Map socket <-> player│   │(FSM Bàn cờ, Đất đai,   │   │(Điều phối lượt chơi,   │  │
│  │   & kiểm soát đá văng)│   │ người chơi, bot, deck) │   │ watchdog 60s, bot loop)│  │
│  └───────────────────────┘   └────────────────────────┘   └────────────────────────┘  │
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│  │                DeltaBroadcaster (Phát quảng bá STATE_DELTA định kỳ)             │  │
│  └─────────────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

- **Client**: Single Page Application (React 18 + React Three Fiber Canvas + Zustand).
- **Server**: Node.js + WebSocket Server (`ws`), chạy kiến trúc phòng in-memory (`RoomManager`).
- **Giao thức truyền dẫn**: JSON qua WebSocket với các tin nhắn định danh: `CREATE_ROOM`, `JOIN_ROOM`, `START_GAME`, `INTENT`, `STATE_DELTA`.

---

## 2. KỊCH BẢN 1: KHI CÓ 3 NGƯỜI TRUY CẬP VÀO GAME & CHƠI VỚI BOT

### 2.1. Tình huống: 3 người cùng vào trang chủ `https://<app>.onrender.com` độc lập
Khi 3 người chơi cùng mở trình duyệt và gõ tên miền chính (không kèm tham số URL):

1. **Khởi tạo phía Client ([`src/client/offline_landing.ts#L26-L31`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/offline_landing.ts#L26-L31))**:
   - Hàm `getInitialLobbyConfig()` không tìm thấy query param `?room=...`.
   - Cả 3 trình duyệt đều tự động cấu hình mặc định:
     * `roomCode`: `'VT8888'`
     * `playerId`: `'p1'`
     * `isHost`: `true`
     * `playerName`: `'Đại Gia Chủ Sảnh (P1)'`

2. **Bắt tay WebSocket ([`src/client/network/ws_message_handler.ts#L136-L141`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/ws_message_handler.ts#L136-L141))**:
   - Cả 3 client đều gửi tin nhắn:
     `{ type: 'CREATE_ROOM', roomCode: 'VT8888', playerId: 'p1' }`.

3. **Xử lý trên Server ([`src/server/network/wss_lobby_handlers.ts#L43-L67`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/wss_lobby_handlers.ts#L43-L67))**:
   - **Người 1 kết nối**: Tạo thành công phòng `VT8888` với `hostId = 'p1'`.
   - **Người 2 kết nối**: Gửi yêu cầu tạo phòng `VT8888` với `playerId = 'p1'`. Server kiểm tra:
     ```ts
     const existing = ctx.rooms.getRoom(upper);
     if (existing && existing.hostId === msg.playerId) {
       ctx.closeRoom(upper); // Đóng phòng cũ của Người 1 vì trùng mã phòng và hostId!
     }
     ```
   - Server gọi `closeRoom('VT8888')` ([`src/server/network/wss_server.ts#L304-L329`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/wss_server.ts#L304-L329)), ngắt toàn bộ socket của Người 1 với mã `ROOM_CLOSED`.
   - Server tạo phòng `VT8888` mới cho Người 2.
   - **Người 3 kết nối**: Lặp lại quy trình trên, đá văng Người 2 và chiếm phòng `VT8888`.
   - **Kết luận**: Người dùng vào web trực tiếp không tạo ra các bàn chơi riêng biệt mà tranh chấp một phòng tĩnh `VT8888`.

### 2.2. Tình huống: Người chơi tạo bàn và thêm Bot AI
1. **Thêm Bot tại Sảnh ([`src/client/ui/lobby/pre_match_deck.tsx#L69-L91`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/lobby/pre_match_deck.tsx#L69-L91))**:
   - Chủ phòng bật các slot 2, 3, 4 (`toggleBotSlot`) và chọn tính cách:
     * `Aggressive`: Tích cực thu gom đất, mua nhà tối đa, ép giá đối thủ.
     * `Balanced`: Cân bằng dòng tiền và tài sản.
     * `Passive`: Ưu tiên thanh khoản dự phòng an toàn.
2. **Kích hoạt trận đấu ([`src/server/network/wss_lobby_handlers.ts#L112-L143`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/wss_lobby_handlers.ts#L112-L143))**:
   - Client gửi `{ type: 'START_GAME', roomCode: '...', playerId: 'p1', bots: [...] }`.
   - Server gọi [`doStartGame`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager_lifecycle.ts#L65-L92) và [`initRoomBots`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_bot_manager.ts#L12-L35).
   - Khởi tạo vốn ban đầu theo số lượng thực tế: 2 người/bot = 15.000 Tr.; 3 người/bot = 12.000 Tr.; 4 người/bot = 10.000 Tr.
   - Server phát quảng bá `ROOM_STARTED` và đẩy `STATE_DELTA` (toàn bộ dữ liệu bàn cờ) xuống client.
3. **Vận hành AI Bot thời gian thực**:
   - Server kích hoạt [`turn_orchestrator.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/turn_orchestrator.ts) và [`bot_turn_scheduler.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/bot_turn_scheduler.ts).
   - Khi đến lượt Bot, máy chủ tính toán qua [`bot_engine.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/bot/bot_engine.ts) với độ trễ tự nhiên (Action Pacing 800ms - 1500ms):
     * Đổ xúc xắc ➔ Nhảy ô cờ ➔ Mua đất / Xây nhà / Đấu giá / Nộp thuế.
   - Client nhận `STATE_DELTA` và hiển thị chuyển động quân cờ 3D mượt mà.
   - **Đánh giá**: Chế độ chơi với Bot AI vận hành trọn vẹn, ổn định và tự động 100%.

---

## 3. KỊCH BẢN 2: TẠO BÀN XONG MỜI NGƯỜI KHÁC VÀO CHƠI (KHÔNG CÓ BOT)

### 3.1. Quy trình mời bạn bè
1. Chủ phòng bấm "📱 Mã QR" hoặc "Sao chép liên kết" ([`src/client/ui/lobby/qr_code_card.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/lobby/qr_code_card.tsx)).
2. Hệ thống gọi [`buildRoomInviteUrl`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/lobby/qr_helper.ts#L60-L71) sinh liên kết:
   `https://<ten-mien-render>.onrender.com/?room=VT8888` (hoặc mã phòng tương ứng).

### 3.2. Khi Người thứ 2 (Khách mời P2) bấm vào liên kết
1. **Phía Client**:
   - [`src/client/offline_landing.ts#L15-L25`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/offline_landing.ts#L15-L25) trích xuất tham số:
     ```ts
     const isGuest = params?.get('host') !== 'true';
     return {
       roomCode: roomParam.toUpperCase(),
       playerId: isGuest ? 'p2' : 'p1', // Gán là p2
       isHost: !isGuest,                // false
       playerName: isGuest ? 'Khách Mời (P2)' : 'Đại Gia Chủ Sảnh (P1)',
     };
     ```
2. **Gửi yêu cầu vào phòng**:
   - Client P2 gửi tin nhắn `{ type: 'JOIN_ROOM', roomCode: 'VT8888', playerId: 'p2' }`.
3. **Phía Server**:
   - [`src/server/network/wss_lobby_handlers.ts#L69-L91`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/wss_lobby_handlers.ts#L69-L91) gọi `doJoinRoom`.
   - `p2` được thêm vào danh sách `room.players`.
   - Server gắn socket `VT8888:p2` vào `SocketRegistry` và phản hồi `{ type: 'ROOM_JOINED', playerCount: 2 }` cho riêng P2.

### 3.3. Hai điểm nghẽn kiến trúc cần lưu ý (Critical Architectural Findings)

#### Điểm Nghẽn 1: Thiếu broadcast đồng bộ trạng thái Sảnh Chờ (Lobby Sync Gap)
- **Bằng chứng**: Tại dòng 89 của [`wss_lobby_handlers.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/wss_lobby_handlers.ts#L89), server chỉ dùng `ctx.sendSafe(socket, { type: 'ROOM_JOINED', ... })` để gửi về riêng socket của người mới vào.
- **Hệ quả**: Máy của Chủ phòng (Host) không nhận được thông báo có người vừa vào sảnh. Trên giao diện Host, danh sách slot vẫn ghi nhận (1/4 người).
- Nút "BẮT ĐẦU TRẬN ĐẤU" trên màn hình Host yêu cầu `canStartGame()` phải thấy ít nhất 2 slot có người ([`src/client/store/lobby_store.ts#L178`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/lobby_store.ts#L178)). Do đó nút này sẽ bị vô hiệu hóa (disabled) trừ khi Host bấm thêm Bot vào một slot khác.

#### Điểm Nghẽn 2: Gán cứng ID khách mời (`playerId: 'p2'`) dẫn đến đá văng người chơi
- **Bằng chứng**: Dòng 21 của [`src/client/offline_landing.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/offline_landing.ts#L21):
  ```ts
  playerId: isGuest ? 'p2' : 'p1'
  ```
- **Hệ quả khi có Người thứ 3 (P3) click vào link mời**:
  1. Client của Người 3 cũng đọc URL `?room=...` và tự gán mình là `playerId: 'p2'`.
  2. Client của Người 3 gửi `{ type: 'JOIN_ROOM', roomCode: 'VT8888', playerId: 'p2' }`.
  3. Server nhận kết nối mới cho cùng cặp khóa `VT8888:p2`.
  4. [`src/server/network/socket_registry.ts#L63-L75`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/socket_registry.ts#L63-L75) phát hiện socket cũ của Người 2:
     ```ts
     if (existing && existing !== newSocket) {
       this.unregister(existing);
       existing.close(1000, 'SUPERSEDED_BY_RECONNECT');
     }
     ```
  5. 👉 **Người 2 bị ngắt kết nối ngay lập tức** để nhường chỗ cho Người 3. Không thể chơi đồng thời 3 hoặc 4 người thật trong cùng một phòng qua cơ chế link mời hiện tại.

---

## 4. MA TRẬN BẰNG CHỨNG KIỂM TOÁN (EVIDENCE MATRIX)

| Thành phần | Tệp mã nguồn | Vấn đề / Cơ chế xác thực | Tác động thực tế |
| :--- | :--- | :--- | :--- |
| **Cấu hình Client mặc định** | [`src/client/offline_landing.ts#L26-L31`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/offline_landing.ts#L26-L31) | Cố định `roomCode: 'VT8888'` và `playerId: 'p1'` khi vào trang chủ. | Nhiều người dùng vào web độc lập sẽ ghi đè và đá văng lẫn nhau. |
| **Phân quyền Khách mời** | [`src/client/offline_landing.ts#L17-L25`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/offline_landing.ts#L17-L25) | Cố định `playerId: 'p2'` cho mọi khách mời mở link. | Giới hạn tối đa 1 khách thật (P2). Khách P3, P4 vào sẽ đá văng P2. |
| **Bảo vệ Trùng Phòng** | [`src/server/network/wss_lobby_handlers.ts#L45-L48`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/wss_lobby_handlers.ts#L45-L48) | Tự động gọi `closeRoom` nếu phòng cũ có cùng `hostId`. | Làm ngắt toàn bộ người chơi trong phòng cũ khi người mới tạo phòng trùng. |
| **Đăng ký Socket** | [`src/server/network/socket_registry.ts#L66-L73`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/socket_registry.ts#L66-L73) | Đóng socket cũ với lý do `SUPERSEDED_BY_RECONNECT`. | Ngắt kết nối socket bị trùng `roomCode:playerId`. |
| **Thông báo Vào phòng** | [`src/server/network/wss_lobby_handlers.ts#L89`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/wss_lobby_handlers.ts#L89) | Chỉ gửi `ROOM_JOINED` đơn hướng về socket người mới vào. | Host không thấy danh sách slot cập nhật trong sảnh chờ trước trận. |
| **Khởi tạo Bot AI** | [`src/server/room_bot_manager.ts#L12-L35`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_bot_manager.ts#L12-L35) | Khởi tạo mảng bot với các tính cách `Aggressive`, `Balanced`, `Passive`. | Hoạt động trơn tru 100% khi chơi Solo hoặc Host + Bot. |
| **Vòng lặp Lượt Bot** | [`src/server/network/turn_orchestrator.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/turn_orchestrator.ts) | Điều phối nhịp chơi của Bot tự động qua FSM. | Tự động hóa hoàn toàn lượt chơi của máy tính, đồng bộ 3D chuẩn xác. |

---

## 5. LỘ TRÌNH ĐỀ XUẤT NÂNG CẤP (ACTIONABLE ROADMAP)

Để hỗ trợ đầy đủ **2 đến 4 người thật** chơi trực tuyến mượt mà trên Render.com mà không gặp lỗi xung đột:

1. **Cấp phát Định Danh Phiên Duy Nhất (Unique Session Player ID)**:
   - Thay vì cố định `'p1'` và `'p2'`, client tự sinh một chuỗi ngẫu nhiên (ví dụ `usr_` + timestamp/hash) và lưu vào `sessionStorage` hoặc `localStorage`.
2. **Sinh Mã Phòng Tự Động Khi Vào Trang Chủ**:
   - Khi vào trang chủ `https://<domain>`, client tự sinh mã phòng ngẫu nhiên gồm 6 ký tự (ví dụ `VT` + 4 chữ số ngẫu nhiên) hoặc server tự cấp phát `roomCode` trong phản hồi `ROOM_CREATED`, sau đó cập nhật lên thanh địa chỉ bằng `window.history.replaceState`.
3. **Phát Quảng Bá Trạng Thái Sảnh Chờ (`LOBBY_STATE` Broadcast)**:
   - Bổ sung tin nhắn broadcast `LOBBY_PLAYERS_UPDATED` từ Server đến toàn bộ socket trong phòng mỗi khi có người mới gia nhập hoặc rời sảnh chờ, giúp Host lập tức nhìn thấy danh sách người chơi sẵn sàng.
