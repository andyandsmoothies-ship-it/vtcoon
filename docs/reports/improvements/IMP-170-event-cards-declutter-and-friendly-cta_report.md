# Báo Cáo Cải Tiến IMP-170: Rà Soát & Khử Trùng Lặp 36 Thẻ Sự Kiện, Tinh Giản Tag Hành Chính & Nút CTA Cảm Xúc Thân Thiện

> **Ticket**: IMP-170  
> **Trạng thái**: COMPLETED & VERIFIED  
> **Kết quả kiểm thử**: 298/298 test suites PASS (6.097/6.097 tests, 100%), TypeScript 0 errors, UI Linter 0 errors  
> **Gotcha**: #236  

---

## 1. TỔNG KẾT THỰC HIỆN

Đã rà soát và hiện thực hóa thành công toàn bộ 36 thẻ sự kiện (20 Thẻ Cơ Hội + 16 Thẻ Thị Trường):
1. **Xóa bỏ triệt để trùng lặp từ ngữ**:
   - Tiêu đề, Mô tả và Hero Stat phân bổ rành mạch 3 tầng thông tin.
   - Mô tả mang tính tự sự bối cảnh thị trường thực tế (storytelling), không lặp từ đầu tiên của tiêu đề và không lặp lại số tiền đã hiển thị ở Hero Stat.
2. **Loại bỏ tag hành chính rườm rà**:
   - Tự động ẩn `'Người chơi rút thẻ'` và `'Tức thì'` trên cả Mobile và Desktop.
   - Chỉ hiển thị chip khi có phạm vi địa bàn đặc thù hoặc thời hạn kéo dài nhiều vòng.
3. **Nút CTA cảm xúc thân thiện 100% (36/36 thẻ)**:
   - Thay thế nút khô cứng `"Đã Hiểu / Tiếp Tục"` bằng các nút hành động cảm xúc:
     - `CC_PLATE_AUCTION`: *Lên Xe Đi Tiếp! 🎲*
     - `CC_TAX_AUDIT`: *Nộp Truy Thu 💸*
     - `CC_STOCK_PROFIT`: *Bỏ Túi Ngay 💰*
     - `CC_DIPLOMATIC`: *Cất Vào Túi 🎴*
     - `CC_OVERDRAFT`: *Giải Ngân Ngay 💵*
     - `MC_FREEZE_TRADE`: *Bảo Toàn Tiền Mặt ❄️*
     - `MC_URBAN_PLANNING`: *Nắm Bắt Thời Cơ 🏙️*
     - `MC_CASINO_PILOT`: *Nhận Thưởng Ngay 🎰*
     - v.v.

---

## 2. DANH SÁCH FILE THAY ĐỔI

1. `src/domain/i18n/vi.ts`: Cập nhật tiêu đề 36 thẻ chuẩn hóa. (93 LOC <= 400)
2. `src/domain/event_card_metadata.ts`: Cập nhật mô tả storytelling, giữ nguyên các regex invariants kinh tế. (323 LOC <= 400)
3. `src/client/ui/modals/event_card_visuals.ts`: Cập nhật `KNOWN_HERO_STATS`, thêm `KNOWN_CARD_CTA_BUTTONS` và `getCardCtaButtonText`. (296 LOC <= 400)
4. `src/client/ui/modals/event_card_modal.tsx`: Tích hợp nút CTA động, ẩn tag hành chính mặc định, gắn `data-testid="event-card-confirm-btn"`. (225 LOC <= 500)
5. `tests/client/imp134_event_card_hero_stat_visual_overhaul.test.ts`: Điều chỉnh selector nút bấm tương thích tiến hóa đặc tả.
6. `tests/client/imp156_event_card_visual_declutter.test.ts`: Điều chỉnh selector nút bấm tương thích tiến hóa đặc tả.
7. `docs/domain/gotchas.md`: Bổ sung Invariant #236.

---

## 3. KẾT QUẢ KIỂM THỬ ĐỊNH LƯỢNG

- **Vitest Unit & Contract Suites**: 298/298 files passed (6.097/6.097 tests, 100%).
- **TypeScript Static Verification**: `npx tsc --noEmit` hoàn tất với 0 lỗi.
- **2D UI Craft Gate**: `npm run lint:ui` quét 171 files, phát hiện 0 anti-patterns.
