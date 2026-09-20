# [IMP-139] Kế Hoạch Cải Tiến: Kiến Trúc Server Single-Port (HTTP + WebSocket Upgrade) Cho Triển Khai Cloud PaaS (Render, Docker)

> **Mã Cải Tiến**: `IMP-139`  
> **Mức Độ**: 🔴 Core Server Network Architecture & Cloud Deployment Protocol  
> **Traceability**: `[UC-OPS-001]`, `[UC-OPS-002]`, `[UC-GAME-001]`, Gotcha #184, `[TC-139.1..TC-139.19]`  
> **Trạng Thái**: 🟢 Hoàn Tất (Trạm 1 RED -> Trạm 2 GREEN -> Trạm 3 SHIP)

---

## 1. Mục Tiêu & Vấn Đề Kỹ Thuật

- **Vấn đề trước cải tiến**:
  - Máy chủ VTCoOn ban đầu phân tách 2 cổng độc lập: HTTP Server (`PORT` - 3000) và WebSocket Server (`WSS_PORT` - 3001).
  - Khi triển khai lên các nền tảng PaaS Cloud hiện đại (Render, Koyeb, Docker Cloud), nền tảng chỉ cấp duy nhất **1 cổng mạng công khai** (thông qua biến `$PORT`, ví dụ Render cấp `$PORT = 10000`).
  - Nếu cố tình cấu hình `PORT = WSS_PORT = 10000`, Node.js sẽ xảy ra lỗi xung đột cổng `EADDRINUSE: address already in use :::10000` do cả 2 máy chủ cố gắng gọi `listen()` trên cùng 1 cổng TCP.
  - Phía Client: Các hooks kết nối mạng (`use_game_ws.ts` và `use_admin_portal.ts`) bị hardcode fallback về `:3001` khi giao thức là `http:`, khiến client không kết nối được trên môi trường PaaS không dùng SSL hoặc cổng tùy biến.
- **Mục tiêu đạt được**:
  1. Hỗ trợ cơ chế **HTTP Upgrade** trên cùng một cổng duy nhất (`isSinglePort = port === wssPort`): `WebSocketServer` gắn trực tiếp vào `httpServer` qua `{ server: httpServer }`.
  2. Bảo toàn 100% tương thích ngược cho môi trường Local Development chạy 2 cổng độc lập (`port !== wssPort`).
  3. Thứ tự đóng socket chuẩn xác triệt tiêu Shutdown Deadlock: `await wssServer.close()` ngắt WebSocket clients trước khi đóng `httpServer`.
  4. Chuẩn hóa phân giải URL phía Client: tự động dùng `window.location.host` trên Cloud, chỉ fallback `:3001` khi đang chạy local dev `localhost:3000`.
  5. Cập nhật `Dockerfile` mở rộng `EXPOSE 3000 3001 8000 10000`.

---

## 2. Thiết Kế Kiến Trúc & Tách Lớp Module

1. **`src/server/network/wss_server_config.ts` [MODIFY]**:
   - Thêm `readonly server?: http.Server;`.
   - Chuyển `readonly port?: number;` thành optional khi `server` được cung cấp.
2. **`src/server/network/wss_server.ts` [MODIFY]**:
   - Khởi tạo: `this.wss = config.server ? new WebSocketServer({ server: config.server }) : new WebSocketServer({ port: config.port });`.
   - Hàm `close()`: Đóng sạch sẽ các client đang kết nối với mã `1001 SERVER_SHUTDOWN`, xử lý an toàn lỗi khi server đã đóng.
3. **`src/server/index.ts` [MODIFY]**:
   - Phân nhánh `startServer()`: nếu `isSinglePort`, khởi tạo `httpServer` trước và truyền vào `WssServer({ server: httpServer, ... })`.
   - Đóng server theo thứ tự an toàn: `await wssServer.close()` trước, sau đó `httpServer.close()`.
4. **`src/client/network/use_game_ws.ts` & `src/client/ui/admin/use_admin_portal.ts` [MODIFY]**:
   - Tự động nhận diện host/protocol, chỉ fallback `:3001` khi `isLocalDev`.
5. **`Dockerfile` [MODIFY]**:
   - `EXPOSE 3000 3001 8000 10000`.
