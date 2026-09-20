# [IMP-139] Báo Cáo Nghiệm Thu: Kiến Trúc Server Single-Port (HTTP + WebSocket Upgrade) Cho Triển Khai Cloud PaaS (Render, Docker)

> **Mã Cải Tiến**: `IMP-139`  
> **Phạm Vi**: 🔴 Core Server Network Architecture & Cloud Deployment Protocol  
> **Traceability**: `[UC-OPS-001]`, `[UC-OPS-002]`, `[UC-GAME-001]`, Gotcha #184, `[TC-139.1..TC-139.19]`  
> **Trạng Thái Nghiệm Thu**: 🟢 HOÀN TẤT (Trạm 1 RED -> Trạm 2 GREEN -> Trạm 3 SHIP)

---

## 1. Tóm Tắt Kết Quả Triển Khai

| Hạng mục | Trạng thái | Bằng chứng kiểm chứng |
| :--- | :---: | :--- |
| **Trạm 1 (RED Contract Tests)** | ✔️ PASS | 21 atomic tests tại `tests/server/imp139_single_port_server.test.ts`. Chứng minh lỗi 16/21 tests do xung đột cổng `EADDRINUSE`. |
| **Trạm 2 (GREEN Implementation)** | ✔️ PASS | Cập nhật tối thiểu 5 tệp nguồn, toàn bộ 21/21 tests chuyển sang GREEN. Test server hồi quy 508/508 tests PASS 100%. |
| **Trạm 3 (Code Reviewer)** | ✔️ APPROVED | Không vi phạm 6 Slop Red Flags, thứ tự đóng socket chuẩn triệt tiêu Shutdown Deadlock. |
| **Trạm 3 (Spec Reviewer)** | ✔️ APPROVED | Đối soát 100% hợp đồng kỹ thuật, bảo toàn tương thích ngược local dev dual-port. |
| **Linter & Type Check** | ✔️ PASS | `tsc --noEmit` 0 lỗi; `npm run lint:ui` 0 lỗi; `npm run lint:slop` 0 lỗi. |

---

## 2. Chi Tiết Thay Đổi Mã Nguồn

1. **`src/server/network/wss_server_config.ts`**: Bổ sung trường `readonly server?: http.Server;`, cho phép `port` là optional.
2. **`src/server/network/wss_server.ts`**: Hỗ trợ khởi tạo `WebSocketServer` nhận instance `http.Server` có sẵn hoặc mở port độc lập. Phương thức `close()` đóng sạch sẽ các WebSocket clients với mã `1001 SERVER_SHUTDOWN`.
3. **`src/server/index.ts`**: Tự động nhận diện `isSinglePort` khi `port === wssPort` để chia sẻ `httpServer`, đảo ngược thứ tự `await wssServer.close()` trước khi đóng `httpServer`.
4. **`src/client/network/use_game_ws.ts` & `src/client/ui/admin/use_admin_portal.ts`**: Nhận diện môi trường động, kết nối tới `window.location.host` khi chạy cloud/HTTPS, chỉ fallback `:3001` khi đang ở local dev `localhost:3000`.
5. **`Dockerfile`**: Cập nhật `EXPOSE 3000 3001 8000 10000`.
6. **`docs/domain/gotchas.md`**: Ghi nhận bất biến Gotcha #184.

---

## 3. Bản Ghi Bất Biến Miền Gotcha #184
- **Single-Port Upgrade Invariant**: Khi chạy trên Cloud chỉ có 1 port, bắt buộc chia sẻ `http.Server` qua HTTP Upgrade, cấm tạo 2 instance server độc lập gọi `listen()` cùng port.
- **Shutdown Order Invariant**: Bắt buộc đóng `wssServer.close()` trước `httpServer.close()` để tránh treo socket giải phóng cổng.
- **Container EXPOSE Invariant**: Dockerfile phải hỗ trợ cả các port local (3000, 3001) và cloud ports (8000, 10000).
