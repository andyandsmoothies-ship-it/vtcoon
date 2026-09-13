# KẾ HOẠCH KỸ THUẬT: HỆ THỐNG GHI NHẬT KÝ THỜI GIAN THỰC & TRUY CỨU LỊCH SỬ VÁN ĐẤU CHO ADMIN (IMP-28)

> **Mã số:** IMP-28  
> **Tên gói cải tiến:** Persistent Real-Time Admin Logging & Historical Match Retrieval Engine  
> **Căn cứ:** Hiến pháp `GEMINI.md`, Yêu cầu vận hành thực tế & Nâng cấp hệ thống giám sát Admin (`IMP-25`).  
> **Mục tiêu:** Lưu trữ vĩnh viễn 100% nhật ký hành động từng ván đấu theo cơ chế append-only chống sập (Crash-Resilient JSONL), quản lý chỉ mục qua `rooms_manifest.json`, cung cấp giao thức truy cứu lịch sử ván đấu cho Admin Portal, bổ sung nút tải tệp log vật lý, tuân thủ nghiêm ngặt các chỉ số NFR (Core Logic <= 400 LOC, UI <= 500 LOC, Zero I/O Blocking).

---

## 1. BỐI CẢNH & VẤN ĐỀ CẦN GIẢI QUYẾT

Trong hệ thống Admin Central Portal (`IMP-25`), cơ chế giám sát thời gian thực hiện có các hạn chế:
1. **Log bị giới hạn 100 sự kiện trên RAM**: Mỗi phòng chỉ lưu tối đa 100 sự kiện gần nhất (`MAX_ROOM_LOGS = 100`). Khi trận đấu kéo dài trên 10-15 vòng, toàn bộ nhật ký đầu trận bị đẩy ra khỏi bộ nhớ.
2. **Log bị xóa hoàn toàn khi đóng phòng**: Khi trận đấu kết thúc (`broadcastGameOver`) hoặc phòng bị đóng giải phóng tài nguyên, `handleRoomClosed` giải phóng `roomLogs`, khiến Admin không thể xem lại lịch sử các trận đấu đã kết thúc.
3. **Chưa ghi tệp vật lý**: Chưa có cơ chế lưu trữ bền vững xuống đĩa cứng máy chủ để phục vụ kiểm toán độc lập, điều tra gian lận và tái hiện sự cố ngoại tuyến.

---

## 2. KIẾN TRÚC GIẢI PHÁP KỸ THUẬT

```text
               ┌─────────────────────────────────────────────────────────────┐
               │    BÀN CHƠI (NGƯỜI CHƠI / BOT / FSM STATE TRANSITIONS)      │
               └──────────────────────────────┬──────────────────────────────┘
                                              │
                                              ▼ (Mỗi khi phát sinh sự kiện)
                      [PersistentRoomLogger (Server Engine)]
                                              │
                      ┌───────────────────────┴────────────────────────┐
                      ▼                                                ▼
     [Ghi Real-Time Xuống Đĩa Cứng]                    [Stream Real-Time Qua WebSocket]
  • Tệp: "server_logs/rooms/<ROOM>_<TIME>.jsonl"     • Gói tin: "ADMIN_ROOM_LOG"
  • Cơ chế: Append-Only (An toàn, 0 crash)            • Admin xem live stream từng giây
  • Lưu 100% sự kiện từ vòng 1 đến 30                 • Không giới hạn 100 dòng
                      │                                                │
                      ▼                                                ▼
     [KHI VÁN ĐẤU KẾ THÚC / PHÒNG ĐÓNG]               [TRANG QUẢN TRỊ ADMIN PORTAL]
  • Ghi sự kiện chốt sổ "GAME_OVER_SUMMARY"           • Tab 1: 🟢 Bàn Đang Diễn Ra (Live)
  • Cập nhật tệp chỉ mục "rooms_manifest.json"        • Tab 2: 📁 Lịch Sử Đã Chơi (Archive)
  • File log VĨNH VIỄN không bị xóa                   • Xem lại 100% log ván cũ & Tải file
```

---

## 3. CÁC HẠNG MỤC TRIỂN KHAI

### Tầng 1: Persistent Room Logger Engine
- Tạo mới `src/server/logging/persistent_room_logger.ts` (<= 250 LOC).
- Quản lý thư mục lưu trữ `server_logs/rooms/`.
- Quản lý tệp chỉ mục `server_logs/rooms/rooms_manifest.json`.
- Ghi log nối dòng từng sự kiện JSON (`fs.appendFileSync` bọc trong `try/catch` có chú thích `/* safe-ignore */`).
- Khi đóng phòng: Đổi trạng thái trong manifest sang `FINISHED` hoặc `TERMINATED`, bảo tồn tệp vĩnh viễn trên đĩa.
- Cung cấp API `initRoomLog`, `appendEvent`, `finishRoomLog`, `getArchivedRoomsList`, `getRoomFullLog`.

### Tầng 2: Admin Protocol & Message Handlers
- Cập nhật `src/server/network/admin_types.ts`: Bổ sung `AdminArchivedRoomSummary`.
- Cập nhật `src/server/network/network_types.ts`: Bổ sung các thông điệp `ADMIN_GET_ARCHIVED_ROOMS`, `ADMIN_ARCHIVED_ROOM_LIST`, `ADMIN_GET_ARCHIVED_LOGS`, `ADMIN_ARCHIVED_LOG_DATA`.
- Cập nhật `src/server/security/envelope_validator.ts`: Đăng ký các message type mới vào `VALID_CLIENT_TYPES`.
- Tách mô-đun `src/server/network/admin_inspector.ts` và `src/server/network/admin_message_handler.ts` để giữ `admin_manager.ts` <= 300 LOC.
- Đấu nối `initRoomLog` và `finishRoomLog` vào vòng đời tạo và đóng phòng trong `wss_server.ts` và `wss_lobby_handlers.ts`.

### Tầng 3: Client Admin Portal UI
- Tách custom hook `src/client/ui/admin/use_admin_portal.ts`.
- Tách `src/client/ui/admin/admin_live_view.tsx` và `src/client/ui/admin/admin_archive_view.tsx`.
- Tách `src/client/ui/admin/admin_log_row.tsx` để khử duplicate AST tokens (JSCPD).
- Nâng cấp `src/client/ui/admin/admin_portal.tsx` với 2 Tab: "🟢 Đang Chơi (Live)" và "📁 Lịch Sử (Archive)".
- Bổ sung nút tải tệp log vật lý (`.jsonl` và `.json`).
- Tuân thủ nghiêm ngặt 4 quy tắc chống anti-pattern của `npm run lint:ui`.

### Tầng 4: Kiểm Thử & Kiểm Toán NFR
- Tạo `tests/server/persistent_room_logger.test.ts` kiểm thử toàn diện engine ghi log.
- Cập nhật `tests/server/admin_portal.test.ts` kiểm thử giao thức WebSocket tra cứu lịch sử.
- Chạy toàn bộ các cổng chất lượng: `gate:quick` (lint:ui, lint:slop, lint:dup, tsc), `vitest run`.
