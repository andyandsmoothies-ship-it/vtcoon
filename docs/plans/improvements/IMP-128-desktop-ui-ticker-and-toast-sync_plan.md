# Kế Hoạch Cải Tiến Kỹ Thuật IMP-128: Giao Diện Desktop Polish, Thanh Trạng Thái Thị Trường (Market Event Ticker), Khử Chèn Đè Toast & Đồng Bộ 40 Vòng

## 1. Mục Tiêu Kỹ Thuật
- **Mã Ticket**: IMP-128
- **Mục tiêu**:
  1. Triệt tiêu 100% lỗi Toast thông báo tài chính/lương trên Desktop (`FloatingNumbersOverlay`) đè nát Thẻ Người Chơi P1 ở góc trên bên phải màn hình.
  2. Bổ sung Thanh Trạng Thái Thị Trường (`MarketEventTicker`) hiển thị realtime các hiệu ứng thẻ sự kiện thị trường toàn cầu (`MC_FREEZE_TRADE`, `MC_COASTAL_STORM`, `MC_PUBLIC_INVEST`, v.v.) kèm số vòng còn lại và tra cứu SSOT Metadata.
  3. Khóa toàn diện quyền Mua Đất, Thế Chấp, Đàm Phán khi thị trường đang đóng băng (`MC_FREEZE_TRADE`), thay nút "Bỏ Qua" thành "Đóng" trong `TitleDeedModal` để triệt tiêu bẫy cưỡng chế kích hoạt sàn Đấu Giá ngoài ý muốn.
  4. Đẩy Toast thông báo xúc giác tức thì giải thích lý do khi Server từ chối giao dịch với mã lỗi `TradeFrozen` / `FREEZE_ACTIVE`.
  5. Đồng bộ trần 40 vòng đấu mặc định trong `game_store.ts` để TopBar hiển thị chính xác `Vòng x/40`.

## 2. Danh Mục Tệp Triển Khai
- `src/server/network/network_types.ts`: Mở rộng `ReasonCode` thêm `'TradeFrozen' | 'FREEZE_ACTIVE' | 'ACTION_REJECTED'`.
- `src/client/ui/market_event_ticker.tsx`: Component mới hiển thị Ticker trạng thái sự kiện thị trường dưới TopBar.
- `src/client/ui/floating_numbers.tsx`: Căn giữa Toast Desktop tại `top-28 md:top-32 left-1/2 -translate-x-1/2`, cắt tỉa tối đa 2 badges, giải phóng DOM khi rỗng.
- `src/client/ui/hud_container.tsx`: Tích hợp `MarketEventTicker` vào HUD cây giao diện.
- `src/client/ui/action_dock.tsx`: Khóa nút Mua Đất (`🔒 Đóng Băng (#pos)`) và nút Đàm Phán khi có `MC_FREEZE_TRADE`.
- `src/client/ui/modals/title_deed_modal.tsx`: Khóa Mua BĐS, khóa Thế Chấp, chuyển nút Bỏ Qua thành Đóng khi đóng băng.
- `src/client/network/ws_message_handler.ts`: Toast cảnh báo xúc giác khi nhận lỗi `TradeFrozen` / `FREEZE_ACTIVE`.
- `src/client/store/game_store.ts`: Đồng bộ `maxRounds: 40`.
- `src/client/store/game_store_types.ts`: Khai báo kiểu cho ActionPhase.
- `tests/client/imp128_desktop_ui_ticker_and_toast_sync.test.ts`: Bộ test hợp đồng 28 atomic tests.
- `docs/domain/gotchas.md`: Ghi nhận Gotcha #168.
- `.agents/evidence/imp128_evidence_snapshot.json`: Snapshot bằng chứng số hóa.

## 3. Quy Trình Nghiệm Thu
- Tuân thủ nghiêm ngặt Quy Trình 3 Trạm: Trạm 1 (RED Contract Test) -> Trạm 2 (GREEN Implementation) -> Trạm 3 (Independent Spec Review & Physical Disk Verification).
- 243/243 test suites (4.973/4.973 tests) pass xanh 100%.
- Docker container live sync và restart thành công.
