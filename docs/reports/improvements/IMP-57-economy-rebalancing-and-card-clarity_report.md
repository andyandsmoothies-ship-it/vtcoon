# [IMP-57] Báo Cáo Nghiệm Thu Tái Cân Bằng Dòng Tiền Bàn Cờ, Khơi Thông Quỹ Kho Bạc & Chuẩn Hóa 36 Thẻ Bài

- **Mã Ticket**: `IMP-57`
- **Ngày Hoàn Thành**: 2026-09-14
- **Trạng Thái**: SHIPPED & VERIFIED (Quy Trình 3 Trạm Đạt Chuẩn 100%)

---

## 1. Tóm Tắt Kết Quả Triển Khai

| Hạng Mục | Trước Cải Tiến | Sau Cải Tiến (IMP-57) | Lợi Ích Gameplay |
| :--- | :--- | :--- | :--- |
| **Ô 20 (Nghỉ Dưỡng Miễn Phí)** | Từng bị chỉnh sai sang chi trả Kho Bạc gây desync `DeltaPayload` và vỡ telemetry | Bảo toàn đúng SSOT `docs/requirements.md §II`: Ô an toàn, dừng chân tự do, 0đ dòng tiền | Bảo vệ tính toàn vẹn FSM, không desync Client-Server, 100% test E2E xanh mượt |
| **Đệm An Toàn Bot AI** | Từng bị ép cứng 1.500 Tr. làm tê liệt tính toán rủi ro 2D6 và mất bản sắc Bot | Bảo tồn `DEFAULT_MIN_SAFETY_BUFFER = 300 Tr.` và mô hình dự báo rủi ro 2D6 (`threat.safetyBuffer`) | Bot giữ trọn bản sắc tính cách 3 phong cách (Aggressive, Balanced, Passive), ván cờ kịch tính |
| **Sàn Chứng Khoán HOSE** | Lệch SSOT: Tỷ lệ hoàn vốn 0.3 - 2.0 (kỳ vọng E = 0%), thua lỗ tới 70% | Khôi phục đúng SSOT: 0.50, 0.75, 1.00, 1.20, 1.50, 2.00 (E = +15.83%) | Kênh đầu tư sinh lời có quản trị rủi ro, bảo vệ thanh khoản |
| **36 Thẻ Sự Kiện** | Mô tả mờ mịt, thiếu số liệu, sai sót 6 thẻ bài lệch handler | Bảng thông số minh bạch 4 chiều (`targetScope`, `effectDetail`, `duration`, `destination`), chuẩn hóa 100% metadata khớp logic code | Người chơi nắm rõ 100% quy tắc tài chính, dòng tiền và thời hạn hiệu lực |

---

## 2. Minh Chứng Kiểm Thử & Thẩm Định Độc Lập

1. **Bộ Kiểm Thử Hợp Đồng (`tests/contracts/imp57_economy_and_card_clarity.test.ts`)**:
   - `63/63 PASSED` (100% GREEN trong 13ms).
   - Kiểm chứng 4 mặt ma trận hành vi: Facet 1 (Ô 20 an toàn 0đ), Facet 2 (Bot AI 2D6 & đệm an toàn), Facet 3 (Sàn HOSE E = +15.83%), Facet 4 (36 thẻ bài minh bạch 4 chiều & 6 thẻ bài chuẩn hóa).
2. **Kiểm Thử Hồi Quy Toàn Hệ Thống (`npm test`)**:
   - `159/159 Test Files PASSED` (100% GREEN).
   - `2.302/2.302 Tests PASSED` (0 failures).
3. **Thẩm Định Độc Lập**:
   - `spec-reviewer`: **APPROVED** — Đối soát tam giác 3 chiều khớp 100%, 0 scope drift, 0 assertion relaxation.
   - `ui-craft-reviewer`: **DISPOSITION: SHIP** — 0 vi phạm 4 anti-patterns, đạt chuẩn Impeccable 2D, tactile shadow chuẩn xác, hoa văn Trống Đồng Đông Sơn chìm tinh tế.
4. **Kiểm Tra Cổng Chất Lượng (`npm run gate:quick`)**:
   - `tsc -b`: 0 TypeScript errors.
   - `lint:ui`: 0 violations.
   - `lint:duplication`: 2.17% (đạt ngân sách < 2.5%).
   - `lint:assets`: 0.33 MB / 2.5 MB (15/15 3D models PASS).

---

## 3. Invariants Đã Được Lưu Vào `docs/domain/gotchas.md`

- **Gotcha #78**: `[FSM/BOT/ECONOMY] Bất Biến Bảo Toàn Ô 20 Nghỉ Dưỡng Miễn Phí (SSOT Cell 20 Free Parking Safe Zone), Bảo Tồn Mô Hình Rủi Ro Bot 2D6 (minBuffer 300 Tr.) & Thấu Suốt 100% Siêu Dữ Liệu Thẻ Sự Kiện (IMP-57)`:
  - Quy tắc xử lý Ô 20: Giữ nguyên SSOT §II là ô an toàn, 0 Tr. dòng tiền, bảo toàn `room.treasury` và số dư người chơi.
  - Quy tắc Bot: Bảo tồn `minBuffer = 300 Tr.` và mô hình dự báo rủi ro 2D6 (`threat.safetyBuffer`), chỉ từ chối khi thực tế có ô nguy hiểm phía trước.
  - Sàn HOSE: Chuẩn hóa 6 tỷ lệ hoàn vốn với E = +15.83%.
  - 36 Thẻ bài: Bảng thông số 4 chiều và chuẩn hóa chính xác số liệu metadata 6 thẻ bài khớp logic code.
