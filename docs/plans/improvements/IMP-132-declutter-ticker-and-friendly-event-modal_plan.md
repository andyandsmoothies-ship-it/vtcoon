# Kế Hoạch Cải Tiến Kỹ Thuật IMP-132: Tinh Giản Giao Diện Desktop, Streamline Market Event Ticker 1 Dòng & Thẻ Bài Sự Kiện Thân Thiện

## 1. Mục Tiêu Kỹ Thuật
- **Mã Ticket**: IMP-132
- **Mục tiêu**:
  1. Triệt tiêu mâu thuẫn dữ liệu nghiêm trọng ở thẻ sự kiện `MC_URBAN_PLANNING`: Xóa bỏ câu "Cấm thế chấp đất..." gây hiểu nhầm, khẳng định quyền lợi tăng 20% giá trị khi thế chấp (nhận 60% thay vì 50%), quy chuẩn phạm vi Hà Nội & TP.HCM thân thiện, bảo toàn SSOT và hợp đồng `imp57`.
  2. Streamline `MarketEventTicker` dưới TopBar thành thanh Capsule 1 dòng thanh mảnh (`items-center justify-between`), loại bỏ dòng subtitle lặp lại gây chật chội, pill đếm ngược màu hổ phách tương phản cao `bg-amber-100 text-amber-900 border-amber-400 font-extrabold`.
  3. Tinh giản `EventCardModal`: Loại bỏ chip điểm đến rác bị cắt cụt chữ `t...` (`Ngân sách người chơi thực hiện thế chấp...`), làm nổi bật chỉ số chính (Hero Stat), bảo tồn 100% các wrapper responsive của `imp123`.
  4. Sửa cấn mép bo góc trái TopBar: Nâng cấp đệm lề `match-info-capsule` từ `px-2` thành `px-3 sm:px-4` để chữ "VÒNG" có khoảng thở thẩm mỹ.

## 2. Danh Mục Tệp Triển Khai
- `src/domain/event_card_metadata.ts`: Sửa mâu thuẫn ngữ nghĩa `MC_URBAN_PLANNING`, giữ `destination: 'Ngân sách người chơi'`.
- `src/client/ui/market_event_ticker.tsx`: Tinh giản Ticker thành 1 dòng, loại bỏ subtitle lặp lại, tăng tương phản pill.
- `src/client/ui/modals/event_card_modal.tsx`: Tinh giản giao diện, lọc bỏ chip `destination` nội bộ người chơi, giữ `whitespace-nowrap` khi hiển thị đích đến bên thứ ba.
- `src/client/ui/top_bar.tsx`: Đệm lề trái an toàn cho TopBar capsule (`px-3 sm:px-4`).
- `tests/client/imp132_declutter_ticker_and_friendly_event_modal.test.ts`: Bộ test hợp đồng 23 atomic tests.
- `docs/domain/gotchas.md`: Ghi nhận Gotcha #172.
- `.agents/evidence/imp132_evidence_snapshot.json`: Bằng chứng số hóa định lượng trên đĩa vật lý.

## 3. Quy Trình Nghiệm Thu
- Tuân thủ Quy Trình 3 Trạm: Trạm 1 (RED Contract Test) -> Trạm 2 (GREEN Implementation) -> Trạm 3 (Independent Spec Review & Physical Disk Verification).
- 23/23 tests hợp đồng PASS 100%, 149/149 test suites liên quan pass xanh.
- TypeScript 0 errors, UI Lint 0 violations.
- Docker container live sync & healthy.
