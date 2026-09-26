# 🏁 BÁO CÁO NGHIỆM THU KỸ THUẬT: IMP-200
> **Ticket**: IMP-200  
> **Chủ đề**: Giao Dịch Nhà Đất Ngoài Lượt An Toàn (Off-Turn Safe Trading) & Đại Tu Toàn Diện UI/UX Sàn Thương Lượng P2P (TradeModal)  
> **Trạng thái**: Hoàn Thành & Đã Nghiệm Thu (SHIP)  
> **Ngày thực hiện**: 2026-09-26  

---

## 1. Mục Tiêu & Bối Cảnh
Xuất phát từ yêu cầu của người dùng:
1. *"Tôi muốn có thể trao đổi nhà đất kể cả khi đang chưa tới lượt xoay, kiểm tra mặt lợi và hại"*
2. *"Tôi muốn tự do nhưng cũng giới hạn một số chức năng để tránh conflict các hoạt động của game, cho tôi giải pháp phù hợp nhất"*
3. *"Kiểm tra lại toàn diện và kỹ UI IX trang trao đổi đất đai hiện tại ở cả desktop và mobile"*
4. Thể chế hóa các bài học phản biện vào `.agents/agents/plan-griller.md` và `docs/domain/gotchas.md`.

Ticket **IMP-200** đã thiết kế và triển khai trọn vẹn 2 trụ cột:
- **Tầng Server / FSM**: Giao thức Quiescent State Protocol & Cơ chế Two-Way Asset Mutex bảo vệ toàn diện các chuyển dịch trạng thái, dọn dẹp Turn N+1 sạch sẽ, loại bỏ triệt để xung đột nâng cấp/thế chấp song song.
- **Tầng Client / UI 2D Craft**: Đại tu toàn diện sàn thương lượng P2P `TradeModal` (mở rộng Desktop `lg:max-w-4xl`, triệt tiêu thanh cuộn xám thô `< >`, tái cấu trúc Stepper 2 hàng công thái học đạt chuẩn `min-h-[44px]`).

---

## 2. Các Thay Đổi Kiến Trúc Cốt Lõi

### A. Tầng Backend & FSM (Quiescent Protocol & Mutex 2 Chiều)
1. **Giao Thức Trạng Thái Tĩnh Lặng (Quiescent State Protocol)**:
   - Cho phép khởi tạo đàm phán P2P ở cả ngoài lượt khi bàn cờ ở trạng thái tĩnh: `WaitingRoll` và `PropertyManagement`.
   - Cấm đàm phán trong các pha biến động nhanh hoặc rủi ro pháp lý/tài chính: `ActionPhase`, `AuctionPhase`, `InsolvencyPhase`, và khi đang có mua lại bắt buộc `pendingBuyout`.
   - Phòng thủ đơn phiên: Từ chối với `TRADE_ALREADY_PENDING` nếu bàn chơi đã có một phiên đàm phán khác chưa giải quyết.
2. **Khóa Độc Quyền Tài Sản Hai Chiều (Two-Way Asset Mutex)**:
   - Khi có `pendingTradeOffer`, cả ô đất chuyển nhượng (`cellIndex`) và ô đất hoán đổi đối ứng (`offeredCellIndex`) đều bị khóa.
   - Thao tác thế chấp (`coordMortgage`), giải chấp (`coordRedeem`), nâng cấp (`handleUpgrade*`) và hạ cấp nhà (`handleDowngrade`) trên các ô đất này đều bị từ chối dứt khoát với mã `ActionRejectReason.ASSET_LOCKED`.
3. **Turn N+1 Teardown Invariant Trực Tiếp**:
   - Tránh bẫy Wrapper Delegation: Cắm trực tiếp logic dọn dẹp phiên trade vào `handleEndTurn` của `RoomManager` trước khi ủy quyền sang `doHandleEndTurn`. Tự động hủy phiên đàm phán nếu bên bán hoặc bên mua kết thúc lượt.
4. **Actor Inversion Guard & P2P Symmetry**:
   - Thêm `requesterId` và `targetPlayerId` vào `PendingTradeOfferInfo`.
   - `apply_delta.ts`: Chỉ mở modal nhận đề xuất nếu `offer.requesterId !== myPid` và `offer.targetPlayerId === myPid`.
   - `coordRespondTradeOffer`: Chỉ người nhận chỉ định (`targetPlayerId`) mới có quyền phản hồi; chặn phá sản (`PLAYER_BANKRUPT`) và kiểm tra thanh khoản hai chiều (`INSUFFICIENT_FUNDS`).

### B. Tầng Giao Diện 2D Impeccable (TradeModal & Submodules)
1. **Bóc Tách Mô-đun Sâu (Deep Modular Architecture)**:
   - Bóc tách `trade_modal.tsx` (từ 436 dòng) thành 3 submodules chuyên biệt:
     * `trade_partner_strip.tsx` (73 LOC): Dải chọn đối tác trực quan với badge tâm lý và nhu cầu gom đất.
     * `trade_column.tsx` (208 LOC): Cột tài sản và cụm chỉnh tiền công thái học.
     * `trade_deal_hud.tsx` (84 LOC): Cán cân giá trị thương vụ và meter tâm lý AI.
     * `trade_modal.tsx` (272 LOC): Khung điều phối trung tâm.
2. **Khắc Phục Dứt Điểm 6 Khuyết Tật Thẩm Mỹ & Công Thái Học**:
   - **P1 (Desktop Sàn Hẹp)**: Mở rộng `lg:max-w-4xl` (~896px), giải phóng 2 cột song song, triệt tiêu 100% cắt cụt tên BĐS.
   - **P2 (Thanh Cuộn Ngang Thô)**: Áp dụng `no-scrollbar scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden` và căn chỉnh `py-2`, chữ "Chọn đối tác:" hiển thị trọn vẹn không xén đỉnh.
   - **P3 (Stepper Tiền Bị Văng Mép 360px)**: Tái cấu trúc cụm stepper thành 2 hàng rõ ràng (Hàng 1: `[-] + input + [+]`; Hàng 2: `Cộng nhanh: +100 +500`), 100% touch targets đạt chuẩn `min-h-[44px]`.
   - **P4 (Khử Thanh Cuộn Ngang Đáy Modal)**: Thêm `overflow-x-hidden` và `max-h-[90dvh]`.
   - **P5 (Tactile Shadows & Visual Feedback)**: Giữ nguyên bảng màu tactile gameboard, không dùng animation giật lag hay anti-patterns.
3. **Nâng Cấp Thể Chế Phòng Thủ Dự Án**:
   - Cập nhật `.agents/agents/plan-griller.md` với 6 nguyên tắc phổ quát áp dụng cho mọi dự án.
   - Ghi nhận **Gotcha #280** vào `docs/domain/gotchas.md`.

---

## 3. Bằng Chứng Nghiệm Thu Thực Tế (Visual & Code Evidence)
- **Kiểm Thử Hợp Đồng (Station 1 RED -> GREEN)**:
  - `tests/contracts/imp200_safe_off_turn_trade_and_ergonomics.test.ts`: **28/28 PASS** (Đầy đủ 5 facets: Quiescent State Protocol, Two-Way Mutex, Turn Teardown, P2P Symmetry, Touch Ergonomics).
- **Hồi Quy Toàn Hệ Thống**:
  - `npm test`: **336/336 Test Files PASS, 6.723/6.723 Tests PASS 100%** (Thời gian chạy: ~50s).
- **Linter & Code Health**:
  - `npm run lint:ui`: **0 Anti-patterns detected** trên 191 files.
  - Ngân sách dòng mã tuân thủ tuyệt đối: `trade_modal.tsx` (272 LOC <= 480 LOC), `trade_column.tsx` (208 LOC <= 300 LOC), `trade_partner_strip.tsx` (73 LOC <= 300 LOC), `trade_deal_hud.tsx` (84 LOC <= 300 LOC).
- **Kiểm Chứng Trực Quan Bằng Ảnh Thực Tế (Edge CDP Screenshots)**:
  - `trade_ui_audit_desktop.jpg`: Sàn thương lượng 1280x800 rộng rãi 2 cột, không thanh cuộn thô, tên BĐS không bị cắt cụt.
  - `trade_ui_audit_mobile_360.jpg`: Màn hình 360x740 co giãn hoàn hảo, stepper 2 hàng nguyên vẹn, 100% nút bấm xúc giác >= 44px.
  - `trade_ui_audit_mobile_390_mine.jpg`: Tab "Bạn Đưa" trên iPhone 390x844 hiển thị cân đối.
  - `trade_ui_audit_mobile_390_partner.jpg`: Tab "Đối Tác" trên iPhone 390x844 hiển thị trực quan.
- **Phán Quyết Độc Lập Từ Subagents (Station 3)**:
  - `ui-craft-reviewer`: **VERDICT SHIP** (0/8 khuyết tật vật lý, 4 anti-patterns CLEAN).
  - `spec-reviewer`: **VERDICT SPEC_PASS** (100% SSOT match, bảo toàn 28 contract tests).
