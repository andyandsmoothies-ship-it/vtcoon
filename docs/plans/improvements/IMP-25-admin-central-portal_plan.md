# KẾ HOẠCH CẢI TIẾN: IMP-25
# HỆ THỐNG TRANG QUẢN TRỊ ADMIN TẬP TRUNG (ADMIN CENTRAL PORTAL & MULTI-ROOM MONITOR)

> **Mã số cải tiến:** IMP-25  
> **Thuộc chu trình:** Continuous Improvement & Ad-hoc Persistence (Hiến pháp `GEMINI.md`)  
> **Mục tiêu:** Cung cấp trang quản trị tập trung thời gian thực (Admin Central Portal) giúp Quản trị viên giám sát đa phòng (Multi-Room / Multi-Tenant), nhận diện tức thì phòng bình thường (🟢) vs cảnh báo vi phạm bất biến / glitch / lặp bot (🔴), theo dõi Live Stream nhật ký hành động từng phòng, tải file Hộp Đen JSON, copy mã test Vitest tái hiện lỗi 1-click và đóng phòng khẩn cấp (Force Terminate).  
> **Ngày lập kế hoạch:** 12/09/2026  
> **Trạng thái:** ĐANG TRIỂN KHAI  

---

## 1. BỐI CẢNH & MỤC TIÊU NGHIỆM THU

### 1.1 Vấn Đề Thực Tế
1. Khi máy chủ VTCOON phục vụ nhiều phòng đấu cùng lúc (Multi-Room / Multi-Tenant), Admin không có cái nhìn tổng quan về số lượng bàn chơi, số lượng người chơi và tình trạng sức khỏe của từng bàn.
2. Nếu một bàn cờ phát sinh lỗi (bot lặp vô tận, vi phạm quỹ tiền tệ, số dư âm bất thường hoặc kẹt lượt), Admin không thể định vị ngay bàn nào đang gặp vấn đề để can thiệp.
3. Không có cơ chế đóng phòng khẩn cấp từ xa (Force Terminate) khi phát hiện gian lận hoặc treo bàn.
4. Thiếu công cụ trích xuất dữ liệu Hộp Đen (Flight Recorder Dump) và mã test Vitest độc lập từ góc nhìn quản trị server mà không cần phải truy cập trực tiếp vào client của từng người chơi.

### 1.2 Tiêu Chí Nghiệm Thu (Definition of Done)
- [ ] **Admin Authentication**: Xác thực quyền Admin qua WebSocket bằng khóa bí mật mặc định `vtcoon-admin-2026` (lưu vào `sessionStorage` ở client). Khóa sai bị từ chối với lý do `ADMIN_UNAUTHORIZED`.
- [ ] **Multi-Room Matrix Dashboard**:
  * Liệt kê toàn bộ bàn chơi đang hoạt động trên server từ `RoomManager.roomMap`.
  * Nhận diện trạng thái trực quan: 🟢 Normal, 🟡 Warning, 🔴 Critical (phát hiện tiền âm ngoài vỡ nợ, turn stall, bot loop, sở hữu đất bất thường).
  * Hiển thị thông số tổng quát: Mã phòng, Chủ phòng (Host), Số người chơi, Vòng đấu, Pha FSM, Quỹ kho bạc.
- [ ] **Deep Room Inspector (Trình Soi Phòng Chi Tiết)**:
  * Xem danh sách người chơi kèm số dư thực tế, vị trí ô, số lượng BĐS và tài sản ròng (Net Worth).
  * Luồng Live Stream nhật ký hành động (Activity/Event Stream) của phòng được chọn cập nhật thời gian thực qua WebSocket.
- [ ] **Hộp Đen Chẩn Đoán & Tái Hiện Lỗi 1-Click**:
  * Nút "Tải Hộp Đen JSON" xuất đầy đủ dữ liệu chẩn đoán của phòng đang soi.
  * Nút "Sao Chép Test Repro" sinh mã test Vitest hoàn chỉnh có thể dán vào chạy độc lập.
- [ ] **Cưỡng Chế Đóng Bàn (Force Terminate)**:
  * Nút bấm đóng phòng khẩn cấp, giải phóng tài nguyên trên máy chủ và thông báo tới các bên liên quan.
- [ ] **Chất Lượng Kỹ Thuật (Zero-Bloat & Anti-Slop)**:
  * Tệp UI `admin_portal.tsx` <= 450 LOC.
  * Đạt 0 lỗi linter UI (`npm run lint:ui`).
  * Đạt 0 lỗi TypeScript (`tsc --noEmit`).
  * Bộ test `tests/server/admin_portal.test.ts` kiểm thử toàn diện và đạt PASS 100%.

---

## 2. THIẾT KẾ KIẾN TRÚC HỆ THỐNG

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│ CLIENT: ADMIN PORTAL UI (?admin=true hoặc #/admin)                               │
│ • LockScreen: Nhập Admin Secret ──► Lưu sessionStorage ──► Gửi ADMIN_AUTH        │
│ • Cột Trái (Room Matrix): Danh sách bàn chơi kèm badge 🟢/🟡/🔴, lọc & làm mới   │
│ • Cột Phải (Room Inspector): Thông số người chơi + Live Stream Log + Thao tác    │
│   [Tải Hộp Đen JSON] [Copy Test Repro] [Đóng Bàn Chơi Khẩn Cấp]                  │
└──────────────────────────────────────┬───────────────────────────────────────────┘
                                       │ WebSocket (ADMIN_AUTH, ADMIN_SUBSCRIBE_ROOM, ...)
┌──────────────────────────────────────┴───────────────────────────────────────────┐
│ SERVER: WSS_SERVER & ADMIN_MANAGER                                               │
│ • AdminManager: Quản lý admin sockets, xác thực secret 'vtcoon-admin-2026'       │
│ • Room Snapshot Aggregator: Đọc roomMap, phân tích vi phạm bất biến              │
│ • Event Log Ring Buffer: Lưu 100 log/phòng, live stream tới subscribed admins    │
│ • Room Termination: Gọi roomManager.closeRoom(), dọn dẹp timers & sockets        │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. ĐẶC TẢ GIAO THỨC WEBSOCKET (ADMIN WIRE PROTOCOL)

### 3.1 Client ➔ Server
1. `{ type: 'ADMIN_AUTH', secret: string }`: Yêu cầu đăng nhập Admin.
2. `{ type: 'ADMIN_GET_ROOMS' }`: Yêu cầu làm mới danh sách phòng.
3. `{ type: 'ADMIN_SUBSCRIBE_ROOM', roomCode: string }`: Đăng ký nhận live stream nhật ký của một phòng.
4. `{ type: 'ADMIN_UNSUBSCRIBE_ROOM', roomCode: string }`: Hủy đăng ký nhận stream của phòng.
5. `{ type: 'ADMIN_TERMINATE_ROOM', roomCode: string, reason?: string }`: Đóng bàn chơi khẩn cấp.

### 3.2 Server ➔ Client
1. `{ type: 'ADMIN_AUTH_SUCCESS', message: string }`: Xác thực thành công.
2. `{ type: 'ADMIN_AUTH_FAILED', reason: string }`: Sai secret hoặc lỗi xác thực.
3. `{ type: 'ADMIN_ROOM_LIST', rooms: AdminRoomSummary[] }`: Danh sách tổng hợp toàn bộ các phòng.
4. `{ type: 'ADMIN_ROOM_DETAIL', roomCode: string, detail: AdminRoomDetail, recentLogs: AdminRoomLogEntry[] }`: Chi tiết phòng & lịch sử sự kiện.
5. `{ type: 'ADMIN_ROOM_LOG', roomCode: string, log: AdminRoomLogEntry }`: Sự kiện live stream mới.
6. `{ type: 'ADMIN_ACTION_SUCCESS', action: string, roomCode: string }`: Thông báo tác vụ quản trị thành công.
7. `{ type: 'ADMIN_ERROR', reasonCode: string, message: string }`: Thông báo lỗi tác vụ.

---

## 4. KẾ HOẠCH TRIỂN KHAI TỪNG BƯỚC

1. **Bước 1: Server AdminManager (`src/server/network/admin_manager.ts`)**:
   - Quản lý danh sách kết nối Admin đã xác thực.
   - Hàm `authenticate(socket, secret): boolean`.
   - Hàm `getRoomsSummary(): AdminRoomSummary[]` phân tích trạng thái từng phòng.
   - Hàm `getRoomDetail(roomCode): AdminRoomDetail | undefined`.
   - Hàm `recordRoomEvent(roomCode, action, source, payloadSummary)` lưu buffer và broadcast.
   - Hàm `terminateRoom(roomCode, reason): boolean`.
2. **Bước 2: Tích hợp vào `src/server/network/wss_server.ts`**:
   - Khởi tạo `AdminManager` trong `WssServer`.
   - Bắt các thông điệp `ADMIN_*` trong WebSocket route.
   - Ghi nhận sự kiện bàn cờ vào `AdminManager.recordRoomEvent()` khi các intent/roll/start diễn ra.
3. **Bước 3: Viết bộ test `tests/server/admin_portal.test.ts`**:
   - Kiểm thử xác thực thành công / thất bại.
   - Kiểm thử lấy danh sách phòng & nhận diện trạng thái cảnh báo.
   - Kiểm thử subscribe log và nhận live stream.
   - Kiểm thử force terminate phòng đóng sạch tài nguyên.
4. **Bước 4: Client Admin Portal (`src/client/ui/admin/admin_portal.tsx`)**:
   - Màn hình khóa (LockScreen) nhập secret, lưu sessionStorage.
   - Cột trái: Ma trận phòng chơi với thẻ trạng thái, tìm kiếm phòng.
   - Cột phải: Inspector hiển thị Player cards, Live Log terminal, các nút Hộp Đen, Copy Repro và Force Terminate.
   - Đảm bảo <= 450 LOC và 0 vi phạm `lint:ui`.
5. **Bước 5: Điều hướng Client (`src/client/main.tsx`)**:
   - Kiểm tra `?admin=true` hoặc `#/admin` để render `<AdminPortal />`.
6. **Bước 6: Nghiệm thu toàn diện**:
   - Chạy `npm run gate:quick` và `npm test`.
   - Lập báo cáo `docs/reports/improvements/IMP-25-admin-central-portal_report.md` và cập nhật `docs/master_roadmap.md`.
