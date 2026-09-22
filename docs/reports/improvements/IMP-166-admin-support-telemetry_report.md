# BÁO CÁO TRIỂN KHAI: ĐÀI QUAN SÁT HỖ TRỢ NGƯỜI CHƠI TỪNG BƯỚC & GIÁM SÁT ĐA PHÒNG (IMP-166)

> **Mã số ticket**: IMP-166  
> **Tên tính năng**: Admin Step-by-Step Player Support & Multi-Room Live Telemetry Portal  
> **Ngày hoàn thành**: 2026-09-22  
> **Triết lý**: Thuần túy Quan sát & Hỗ trợ (Read-Only Monitoring & Deep Visibility) — 0 nút can thiệp FSM  
> **Kết quả kiểm thử**: **PASS 100% — Zero Regression (25/25 IMP-166 suite, 5,975/5,975 full suite)**  
> **Pipeline**: 3-Trạm Adversarial TDD (Station 1 RED → Station 2 GREEN → Station 3 REVIEW)

---

## 1. Tóm Tắt Tính Năng

IMP-166 hoàn thiện đài quan sát `/ #/admin` nhằm cung cấp đầy đủ thông tin bối cảnh thời gian thực để Admin nắm trọn tình hình hệ thống và hỗ trợ người chơi từng bước một (step-by-step):

1. **Khẳng định Log Hệ thống bền vững (Crash-Resilient Logging)**:
   - Module `PersistentRoomLogger` (IMP-28) ghi nhật ký tự động xuống đĩa dưới định dạng `server_logs/rooms/<ROOMCODE>_<TIMESTAMP>.jsonl` cho mọi bàn chơi từ lúc tạo phòng tới khi kết thúc.
   - IMP-166 làm giàu sự kiện (Event Data Enrichment): ghi nhận giá trị xúc xắc, ô đến, tiền thuê, thưởng qua vạch, số dư mới và `playerId`.
2. **5 Chiều Giám Sát Quản Trị**:
   - **Sức khỏe Máy chủ (Server Vitals)**: Giám sát RAM RSS/Heap, Uptime, phân loại Sảnh chờ vs Đang chơi, kéo theo chu kỳ 4s (pull-driven, 0 timer cô nhi).
   - **Mạng & Ân hạn 60s (Network Telemetry)**: Đèn báo 🟢 Online | 🟡 Ân hạn Xs | 🤖 Bot; phân biệt rõ Khách sảnh chờ, Host sảnh chờ và Người chơi trong trận.
   - **Chỉ báo Lượt Trực Quan (Turn Step Indicator)**: Banner phân biệt Sảnh chờ vs Trong trận, dịch nghĩa 8 pha FSM tiếng Việt, đếm ngược giây chuẩn xác từ `TurnOrchestrator`.
   - **Kính Lúp Hỗ Trợ Từng Bước (Player Support Inspector)**: Click vào thẻ người chơi để xem số dư, tài sản ròng, danh sách BĐS và 10 bước hành động gần nhất của riêng người đó.
   - **Bộ Lọc Hai Trục Sidebar 360px**: Tách biệt trực giao Trục Sức khỏe (`Tất cả / Xanh / Cảnh báo / Lỗi`) và Trục Vòng đời (`Tất cả / Sảnh chờ / Đang chơi`).

---

## 2. Danh Sách Tệp Đã Triển Khai

| File | Trách nhiệm |
|:-----|:------------|
| [`src/server/network/admin_types.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/admin_types.ts) | Bổ sung `ServerVitals`, mở rộng `AdminPlayerSummary` (network flags), `AdminRoomSummary` (turn fields), `AdminRoomLogEntry` (`playerId`). |
| [`src/server/network/network_types.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/network_types.ts) | Cập nhật `ADMIN_ROOM_LIST` payload kèm trường `vitals?: ServerVitals`. |
| [`src/server/network/reconnect_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/reconnect_manager.ts) | Bổ sung helper `isPlayerInGrace` và `getGraceRemainingSeconds`. |
| [`src/server/network/admin_inspector.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/admin_inspector.ts) | Xuất `resolveTurnStepName` (8 pha FSM + `inAudit` + Lobby guard), trích xuất `turnSecondsLeft` và network flags. |
| [`src/server/network/admin_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/admin_manager.ts) | `getServerVitals()`, setters cho providers, `getRecentLogs(roomCode, playerId)`, ghi nhận `playerId` trong `recordRoomEvent`. |
| [`src/server/network/admin_message_handler.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/admin_message_handler.ts) | Gửi `vitals: adminManager.getServerVitals()` trong thông điệp phản hồi `ADMIN_ROOM_LIST`. |
| [`src/server/intent_dispatcher.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/intent_dispatcher.ts) | `INTENT_ROLL` trả về đối tượng `rollResult`. |
| [`src/server/network/wss_intent_handler.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/wss_intent_handler.ts) | Làm giàu chuỗi `payloadSummary` với chi tiết xúc xắc, ô cờ đến, tiền thuê, thưởng và số dư mới. |
| [`src/server/network/wss_server.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/wss_server.ts) | Tiêm `timeRemainingProvider`, `reconnectManager`, `sessionManager` vào `adminManager`. |
| [`src/client/ui/admin/use_admin_portal.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/admin/use_admin_portal.ts) | State `serverVitals`, sao chép đầy đủ turn telemetry trong `handleRoomListUpdate`. |
| [`src/client/ui/admin/admin_portal.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/admin/admin_portal.tsx) | Header Server Vitals widget và bộ lọc danh sách phòng 2 trục độc lập. |
| [`src/client/ui/admin/admin_live_view.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/admin/admin_live_view.tsx) | Turn Step Banner, Micro-badge ân hạn mạng, Kính lúp hỗ trợ người chơi theo theme Amber chuẩn mực. |
| [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md) | Ghi nhận Invariant Gotcha #227. |

---

## 3. Kết Quả Kiểm Thử Quy Chuẩn

### Station 1: RED Contract Test (`qa-tester`)
- Bộ test hợp đồng: `tests/server/imp166_admin_support_telemetry.test.ts`
- 25 atomic tests bao phủ Ma trận 4 Góc (Boundary, Reactivity, Disposal, Error Defense).
- Trạng thái RED được xác nhận ban đầu (23 fail | 2 pass) trước khi viết mã nguồn.

### Station 2: GREEN Implementation (`implementer`)
- Hoàn thành toàn diện mã nguồn server và client.
- 25/25 test cases trong `tests/server/imp166_admin_support_telemetry.test.ts` chuyển XANH.

### Station 3: Independent Review & Disk Verification
- **Spec Reviewer**: VERDICT SIGN-OFF (khắc phục 100% 4 điểm mù P1 và 5 rủi ro P2 từ bản Grilling Audit, 0 ép kiểu bẩn, 0 scope drift).
- **2D UI Craft Reviewer**: Phán quyết DISPOSITION SHIP sau khi chuẩn hóa tông màu Amber hoàng kim đồng bộ và thêm `min-w-0 truncate` bảo vệ 360px viewport.
- **Evidence Snapshot**: Đã tạo và lưu tại `.agents/evidence/imp-166_snapshot.json`.
- **Tổng thể**: `npx tsc --noEmit` đạt 0 lỗi, `npm run lint:ui` đạt 0 lỗi trên 169 tệp, toàn bộ 293 suites tests đều PASS.
