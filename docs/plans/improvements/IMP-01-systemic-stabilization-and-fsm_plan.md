# [KẾ HOẠCH CẢI TIẾN IMP-01] ỔN ĐỊNH HỆ THỐNG, BẮT TAY MẠNG WEBSOCKET & VI TRẠNG THÁI FSM (5 PHASES P0 - P2)

## 1. BỐI CẢNH & MỤC TIÊU KỸ THUẬT

Sau đợt rà soát kiểm toán sâu toàn diện (`docs/reports/audits/deep_systemic_logic_audit_report.md` và `docs/reports/audits/deep_edge_cases_and_micro_states_audit_report.md`), hệ thống phát sinh 5 nhóm đứt gãy logic nghiêm trọng giữa Client và Server:
1. Client gửi Intent bị trả về `ROOM_NOT_FOUND` do chưa bắt tay phòng; Client tự sinh xúc xắc `Math.random()` tạo ra "ván đấu ma".
2. Lượt đi của Bot AI bị đóng băng trên server; người chơi có thể spam đổ xúc xắc nhiều lần trong một lượt.
3. Console xuất hiện 36 lỗi 404 do nạp ảnh WebP không tồn tại; 36 tấm biển trắng đục che khuất bề mặt ô cờ 3D; Modal Sổ Đỏ bị tràn màn hình và che nút đóng.
4. Nút Bỏ Qua không mở phiên đấu giá; người chơi bị giam ở Trạm Kiểm Toán Ô 10 ném lỗi `CANNOT_ROLL`.
5. Rò rỉ tiền tệ Kho Bạc do nộp thuế/phí không ghi nhận vào quỹ; thiếu cơ chế đấu giá phát mãi 70% khi phá sản vì nợ ngân hàng.

Mục tiêu của IMP-01 là tái thiết lập sự đồng bộ tuyệt đối giữa Client và Server qua 5 Phase tuần tự, đưa hệ thống về chuẩn Server-Authoritative.

---

## 2. PHÂN RÃ CÁC PHASE THỰC THI

```text
[Phase 1: Bắt tay Mạng] ──► [Phase 2: Lập lịch Bot] ──► [Phase 3: Dọn dẹp 3D]
          │                                                    │
          ▼                                                    ▼
[Phase 4: Sàn Đấu Giá FSM] ──────────────────────────► [Phase 5: Bảo Toàn Kho Bạc & VSC]
```

### Phase 1: Bắt Tay Mạng WebSocket & Triệt Tiêu Ván Đấu Ma (P0)
- **Tệp can thiệp**: `network_types.ts`, `envelope_validator.ts`, `use_game_ws.ts`, `lobby_view.tsx`, `wss_server.ts`, `main.tsx`.
- **Nghiệp vụ**:
  * Thêm thông điệp `{ type: 'START_GAME', roomCode, playerId }` qua validator.
  * Tự động gửi `CREATE_ROOM` (Host) hoặc `JOIN_ROOM` (Guest) ngay khi kết nối socket `onopen`.
  * Lưu trữ `reconnectToken` từ `SESSION_INIT` vào `localStorage`.
  * Xóa bỏ hoàn toàn `Math.random()` đổ xúc xắc ở Client, chuyển 100% quyền gieo xúc xắc và định vị quân cờ cho Server qua `STATE_DELTA`.

### Phase 2: Điều Phối Bot Tự Động & Khóa Nút Thao Tác (P0)
- **Tệp can thiệp**: `wss_server.ts`, `intent_dispatcher.ts`, `game_store.ts`, `ui_helpers.ts`, `action_dock.tsx`.
- **Nghiệp vụ**:
  * Xây dựng `scheduleBotTurn(roomCode)` tự động kích hoạt lượt đi của Bot trên Server với nhịp trễ 800ms.
  * Hỗ trợ chuỗi đệ quy nhiều Bot liên tiếp (Multi-bot sequence).
  * Khóa nút đổ xúc xắc bằng cờ `hasRolledThisTurn` ngay sau khi gieo; chặn bấm Hết Lượt khi chưa gieo.
  * Xử lý chuỗi Đổ Đôi (Doubles FSM): Bảo lưu lượt khi ra đôi (< 3 lần), cưỡng chế chuyển vào Ô 10 khi ra đôi lần 3.

### Phase 3: Dọn Sạch Không Gian 3D & Sửa Layout Modal Sổ Đỏ (P1)
- **Tệp can thiệp**: `board_tile.tsx`, `tile_assets.ts`, `title_deed_modal.tsx`.
- **Nghiệp vụ**:
  * Xóa bỏ request nạp 36 file WebP ảo, thay bằng bộ Texture Vector Canvas Procedural độ nét cao.
  * Gỡ bỏ hoàn toàn mesh tấm biển trắng đục `#FFFFFF`, đưa Standee về dạng biểu tượng 2.5D trong suốt.
  * Thêm `max-h-[85vh]` và `overflow-y-auto` cho thân Modal Sổ Đỏ chống cắt cụt nút footer; thêm khoảng đệm `pr-14 pl-14` cho tiêu đề chống đè nút đóng `✕`.

### Phase 4: Đấu Nối Sàn Đấu Giá BĐS & Vi Trạng Thái Nâng Cấp (P1)
- **Tệp can thiệp**: `auction_manager.ts`, `session_manager.ts`, `apply_delta.ts`, `audit_manager.ts`, `title_deed_modal.tsx`, `modal_host.tsx`.
- **Nghiệp vụ**:
  * Bấm "Bỏ Qua" phát `INTENT_DECLINE`, Server mở `AuctionSession` 15s và broadcast `delta.auction`.
  * Bổ sung quy tắc Anti-Sniping: Tự động cộng thêm +3 giây khi có lệnh đặt giá hợp lệ ở thời điểm <= 3s cuối.
  * Sửa hàm `processRollDoubles` tại Ô 10 trả về đầy đủ `result` khi không ra đôi, xóa lỗi `CANNOT_ROLL`.
  * Bổ sung nút Nâng Cấp (+tiền) và Hạ Cấp (-50%) trực tiếp trên Modal Sổ Đỏ khi là chủ sở hữu.

### Phase 5: Bảo Toàn Quỹ Kho Bạc & Phá Sản Dây Chuyền (P2)
- **Tệp can thiệp**: `special_cell_handler.ts`, `turn_loop.ts`, `mortgage_manager.ts`, `insolvency_manager.ts`, `delta_types.ts`, `apply_delta.ts`.
- **Nghiệp vụ**:
  * Nạp 100% thuế ô Tax, thuế đất vượt ô GO, lãi vay thế chấp 5% và phí bảo lãnh 500 Tr. vào `room.treasury`.
  * Cơ chế Phá Sản 2 nhánh: Nợ người chơi (sang tên toàn bộ đất và tiền mặt cho chủ nợ); Nợ ngân hàng (san phẳng nhà C1-C3 về C0, đưa đất vào Đấu Giá Phát Mãi sàn 70% niêm yết).
  * Đảm bảo Vertical Slice Completeness: Đồng bộ `inAudit`, `auditTurnsLeft`, `skipNextTurn` qua `PlayerDelta`.

---

## 3. RÀNG BUỘC KỸ THUẬT & NGHIỆM THU

- TypeScript Strict Mode: 0 lỗi tĩnh, không dùng `any` hay `as unknown as T`.
- Trần LOC: Tuân thủ 5-Tier (Core Logic <= 400 LOC, UI <= 500 LOC).
- Bảo toàn hồi quy: 100% tests hiện tại tiếp tục PASS.
