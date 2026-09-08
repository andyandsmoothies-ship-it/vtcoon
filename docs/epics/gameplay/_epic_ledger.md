# Sổ Cái Tiến Độ Epic: Gameplay Core (VTCoOn)

## Danh sách Lát cắt dọc (Vertical Slices)

### Slice 00: Bộ Xương Sống Kỹ Thuật (Walking Skeleton)
- **Use Case Ref:** UC-GAME-004, UC-GAME-006, UC-GAME-009
- **Traceability Chain:** Requirement -> Epic Gameplay -> Slice 00
- **Flow Paths:** Khởi tạo hạ tầng WebSocket, cơ chế ping-pong heartbeat định kỳ, ân hạn mất mạng, đồng bộ vi sai trạng thái.
- **Value Delivered:** Khung WebGL R3F sa bàn 40 ô cơ bản và hạ tầng kết nối Client/Server qua WebSocket ổn định.
- **Lifecycle Status:** Done (2026-09-07)
- **Deliverables:** board_config.ts (64L) · session_manager.ts (73L) · game_canvas.tsx (41L)
- **Test Coverage:** 22/22 tests PASS · 6 files · Adversarial Inversion ×3 PASS
- **LOC Final:** 380/400
- **Preconditions Required:** Môi trường server hoạt động, client hỗ trợ WebGL.
- **Exit Guarantees:** 
  - Success: Client kết nối vững chắc với Server, sa bàn hiển thị và trạng thái đồng bộ liên tục.
  - Failure: Cảnh báo mất kết nối, hệ thống không lưu trạng thái rác.
- **Architectural Scope:** UI (R3F), WebSocket Server, State Sync Manager
- **LOC Budget:** < 400 dòng
- **Test Contracts:**
  - `TC-00.1`: [Khởi tạo kết nối Client] -> [Server phản hồi thành công và duy trì tín hiệu heartbeat định kỳ 5s]
  - `TC-00.2`: [Có cập nhật vi sai trạng thái từ Server] -> [Client nhận và đồng bộ khung hình sa bàn R3F chính xác]
  - `TC-00.3`: [Mất kết nối mạng đột ngột] -> [Hệ thống ân hạn 60s để khôi phục qua mã định danh, bảo vệ state]

### Slice 01: Sảnh Đấu & Vòng Lặp Lượt Chơi Cơ Bản
- **Use Case Ref:** UC-GAME-001, UC-GAME-002, UC-GAME-003, UC-GAME-005, UC-GAME-007, UC-GAME-008, UC-GAME-010, UC-GAME-011, UC-GAME-012, UC-GAME-013, UC-GAME-014, UC-GAME-015, UC-GAME-016, UC-GAME-017, UC-GAME-018, UC-GAME-019
- **Traceability Chain:** Requirement -> Epic Gameplay -> Slice 01
- **Flow Paths:** Khởi tạo phòng, gia nhập, FSM Turn Loop, đổ xúc xắc, di chuyển, xử lý ô GO.
- **Value Delivered:** Hoàn thiện luồng Sảnh Đấu chờ, vòng lặp FSM lượt chơi cơ bản, cơ chế đổ xúc xắc 2D6 và vượt qua ô Khởi Hành.
- **Lifecycle Status:** Done (2026-09-07)
- **Deliverables:** room.ts · dice.ts · room_manager.ts
- **Test Coverage:** 61/61 tests PASS · 9 files · Adversarial Inversion ×3 PASS
- **LOC Final:** ≤400
- **Preconditions Required:** Slice 00 hoàn tất, Client vào trang chủ hệ thống.
- **Exit Guarantees:** 
  - Success: Vòng lặp lượt chơi xoay vòng ổn định, tiền thưởng cộng tự động, kết thúc ván bình thường.
  - Failure: Không thao tác kích hoạt tự động đi hoặc chuyển Bot.
- **Architectural Scope:** Room Manager, FSM Turn Engine, PRNG Service
- **LOC Budget:** < 400 dòng
- **Test Contracts:**
  - `TC-01.1`: [Tạo phòng đấu mới] -> [Trả về mã 6 ký tự và cho phép người chơi khác gia nhập thành công]
  - `TC-01.2`: [Đến lượt người chơi] -> [FSM kích hoạt đếm ngược thời gian, kết thúc tự động nếu quá hạn 60s]
  - `TC-01.3`: [Người chơi đổ xúc xắc 2D6] -> [Di chuyển quân cờ đúng số điểm, nếu đổ đôi 3 lần liên tiếp cưỡng chế vào Trạm Kiểm Toán]
  - `TC-01.4`: [Quân cờ đi qua hoặc dừng tại ô GO] -> [Cộng 2.000 Tr. VNĐ và trừ phí thuế tài sản lũy tiến tương ứng]

### Slice 02: Bất Động Sản Đất Nền & Thu Tiền Thuê Cơ Bản
- **Use Case Ref:** UC-GAME-020, UC-GAME-027, UC-GAME-028, UC-GAME-029
- **Traceability Chain:** Requirement -> Epic Gameplay -> Slice 02
- **Flow Paths:** Mua đất nền cấp 0, thanh toán phí dừng chân, giao dịch P2P song phương.
- **Value Delivered:** Xây dựng luồng sở hữu bất động sản sơ cấp, cơ chế nộp tiền thuê khi dẫm vào đất có chủ và thỏa thuận chuyển nhượng.
- **Lifecycle Status:** Done (2026-09-08)
- **Deliverables:** property_manager.ts (116L) · room_manager.ts (+15L)
- **Test Coverage:** 69/69 tests PASS · 11 files · Adversarial Inversion ×4 PASS
- **LOC Final:** ≤65/80
- **Preconditions Required:** Slice 01 hoàn tất, người chơi có đủ tiền mặt và đứng tại ô đất trống.
- **Exit Guarantees:** 
  - Success: Quyền sở hữu được cập nhật, tiền trong quỹ các bên thay đổi chính xác.
  - Failure: Hủy bỏ giao dịch nếu không đủ tiền mặt.
- **Architectural Scope:** Property Manager, Transaction Ledger
- **LOC Budget:** < 400 dòng
- **Test Contracts:**
  - `TC-02.1`: [Người chơi dừng tại ô đất trống chưa chủ] -> [Cho phép mua với giá niêm yết, quỹ tiền mặt giảm tương ứng]
  - `TC-02.2`: [Đối thủ dẫm vào ô đất đã có chủ] -> [Tự động trừ tiền mặt của người dẫm và cộng quỹ cho chủ sở hữu]
  - `TC-02.3`: [Thỏa thuận mua bán P2P đất nền] -> [Chuyển nhượng thành công, trừ 5% thuế chuyển nhượng vào Kho bạc]

### Slice 03: Nâng Cấp Công Trình C1-C3, Đấu Giá & Tiện Ích Đặc Biệt
- **Use Case Ref:** UC-GAME-021, UC-GAME-022, UC-GAME-023, UC-GAME-024, UC-GAME-025, UC-GAME-026, UC-GAME-030, UC-GAME-031, UC-GAME-032, UC-GAME-033, UC-GAME-034, UC-GAME-035, UC-GAME-036, UC-GAME-037
- **Traceability Chain:** Requirement -> Epic Gameplay -> Slice 03
- **Flow Paths:** Mở phiên đấu giá, nâng cấp công trình (C1-C3), thu phí Tiện ích/Hạ tầng.
- **Value Delivered:** Quản trị vòng đời tài sản chuyên sâu (đấu giá, nâng cấp khi đủ màu) và khai thác đặc quyền hạ tầng giao thông, viễn thông.
- **Lifecycle Status:** Done (2026-09-08)
- **Deliverables:** board_config.ts (+15L) · property_manager.ts (+65L) · room.ts (+4L) · room_manager.ts (+55L)
- **Test Coverage:** 81/81 tests PASS · 15 files · Adversarial Inversion ×4 PASS · E2E Golden Flow PASS
- **Defects Resolved:** Bổ sung ô 35 Short Line Railroad vào PROPERTY_DEEDS
- **LOC Final:** ≤140/150
- **Preconditions Required:** Slice 02 hoàn tất, có người bỏ qua mua đất hoặc người chơi có đủ bộ màu.
- **Exit Guarantees:** 
  - Success: Tài sản thăng cấp, đấu giá kết thúc xác định người mua hợp lệ.
  - Failure: Hủy nâng cấp nếu thiếu màu, hủy đấu giá nếu không ai tham gia.
- **Architectural Scope:** Property Upgrades, Auction System, Special Utilities Manager
- **LOC Budget:** < 400 dòng
- **Test Contracts:**
  - `TC-03.1`: [Người chơi từ chối mua đất] -> [Mở phiên đấu giá công khai tự động, sang tên cho người trả giá cao nhất]
  - `TC-03.2`: [Chủ sở hữu có đủ bộ màu yêu cầu nâng cấp] -> [Cấu trúc tài sản thăng Cấp 1-3, trừ chi phí tương ứng và tăng mức phí thuê]
  - `TC-03.3`: [Người chơi dừng tại ô Giao thông (Railroad)] -> [Thu phí lũy tiến theo số ô sở hữu và tăng 50% khi đã lắp ETC]
  - `TC-03.4`: [Người chơi dừng tại ô Tiện ích (Utility)] -> [Tính phí biến thiên 2D6 theo số ô sở hữu hoặc nhân 150 khi đã nâng cấp Full]
  - `TC-03.5`: [Chưa sở hữu trọn bộ màu] -> [Từ chối yêu cầu nâng cấp công trình với lỗi MISSING_MONOPOLY]
  - `TC-03.6`: [Yêu cầu hạ cấp công trình] -> [Thanh lý công trình về Cấp 0 và hoàn tiền 50% tổng chi phí nâng cấp]

### Slice 04: Biến Cố Thị Trường Vĩ Mô & Thẻ Cơ Hội Cá Nhân
- **Use Case Ref:** UC-GAME-038, UC-GAME-039, UC-GAME-040, UC-GAME-041, UC-GAME-042, UC-GAME-043, UC-GAME-044, UC-GAME-045, UC-GAME-046, UC-GAME-047, UC-GAME-048, UC-GAME-049, UC-GAME-050
- **Traceability Chain:** Requirement -> Epic Gameplay -> Slice 04
- **Flow Paths:** Rút thẻ thị trường/cơ hội, áp dụng hiệu ứng mùa vụ, đầu tư chứng khoán HOSE, vào Trạm Kiểm Toán.
- **Value Delivered:** Kích hoạt hệ thống Thẻ Bài (Phiếu Cơ Hội, Phiếu Thị Trường) gây ảnh hưởng biến động toàn bàn cờ hoặc cá nhân.
- **Lifecycle Status:** Pending
- **Preconditions Required:** Slice 03 hoàn tất, người chơi dẫm vào ô Sự kiện, ô HOSE hoặc Trạm Kiểm Toán.
- **Exit Guarantees:** 
  - Success: Các chỉ số giá trị đất/thuế phí thay đổi đúng theo biến cố.
  - Failure: Thẻ lỗi bị vô hiệu hóa, không phá vỡ state.
- **Architectural Scope:** Event Card Engine, Modifier System, Stock Market System
- **LOC Budget:** < 400 dòng
- **Test Contracts:**
  - `TC-04.1`: [Rút Phiếu Thị Trường vĩ mô] -> [Áp dụng hiệu ứng lập tức lên toàn bộ người chơi hoặc thay đổi mức phí các ô tương ứng]
  - `TC-04.2`: [Kích hoạt thẻ Mùa Cao Điểm Du Lịch / Cực Đoan Miền Trung] -> [Doanh thu nhóm Nghỉ dưỡng tăng x2 hoặc đưa về 0]
  - `TC-04.3`: [Quyết định đầu tư chứng khoán HOSE với vốn cược] -> [Tung xúc xắc 1D6 và cập nhật quỹ tiền mặt theo đúng biên độ lời/lỗ quy định]

### Slice 05: Nghiệp Vụ Tài Chính, Thế Chấp, Thanh Lý Cưỡng Chế & Phá Sản
- **Use Case Ref:** UC-GAME-051, UC-GAME-052, UC-GAME-053, UC-GAME-054, UC-GAME-055, UC-GAME-056, UC-GAME-057, UC-GAME-058
- **Traceability Chain:** Requirement -> Epic Gameplay -> Slice 05
- **Flow Paths:** Cầm cố tài sản, trả lãi vay, thanh lý khi âm tiền, tuyên bố phá sản, kết thúc ván.
- **Value Delivered:** Hoàn thiện đòn bẩy tín dụng, kịch bản xấu nhất (phá sản) và quyết toán tài sản ròng khi kết thúc trận đấu.
- **Lifecycle Status:** Pending
- **Preconditions Required:** Slice 04 hoàn tất, quỹ tiền mặt âm hoặc cần vay thế chấp.
- **Exit Guarantees:** 
  - Success: Quỹ tiền được bơm từ thế chấp, hoặc game loại người chơi phá sản thành công.
  - Failure: Dừng game nếu tất cả trừ 1 người phá sản.
- **Architectural Scope:** Bank Credit Ledger, Insolvency Engine
- **LOC Budget:** < 400 dòng
- **Test Contracts:**
  - `TC-05.1`: [Gửi yêu cầu thế chấp BĐS] -> [Nhận 50% giá trị gốc bằng tiền mặt, tài sản bị úp và tự động trừ 5% lãi vay mỗi khi qua GO]
  - `TC-05.2`: [Quỹ tiền mặt âm vượt ngưỡng tài sản] -> [Kích hoạt chế độ cưỡng chế thanh lý tài sản tự động]
  - `TC-05.3`: [Bán sạch tài sản vẫn không đủ trả nợ] -> [Tuyên bố phá sản, loại bỏ người chơi và giải phóng toàn bộ tài sản về trạng thái trống]
  - `TC-05.4`: [Hết thời gian hoặc số vòng quy định] -> [Quyết toán tổng tài sản ròng và xếp hạng người chiến thắng]
