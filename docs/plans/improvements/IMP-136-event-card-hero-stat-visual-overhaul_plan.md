# [IMP-136] Kế Hoạch Đại Tu Thẩm Mỹ & Trải Nghiệm Thẻ Bài Sự Kiện: Khối Hero Stat Fintech "1 Giây Hiểu Ngay"

> **Mã Cải Tiến**: `IMP-136` (hoặc `IMP-134-CARD-OVERHAUL`)  
> **Mức Độ**: 🟡 Client UI/UX & Craft Overhaul (0 Schema, 0 FSM, 0 Network Protocol)  
> **Traceability**: `[UC-IMP134]`, `[TC-IMP134.01..TC-IMP134.28]`, Gotcha #179  
> **Trạng Thái**: 🟢 Hoàn Tất (Trạm 1 RED -> Trạm 2 GREEN -> Trạm 3 SHIP)

---

## 1. Mục Tiêu & Vấn Đề Người Dùng
- **Hiện trạng trước cải tiến**:
  - Giao diện `EventCardModal` đọc như công văn hành chính khô cứng, dày đặc chữ.
  - Văn bản bị trùng lặp giữa câu dẫn `description` và chi tiết `effectDetail`.
  - Chip phạm vi hiển thị chuỗi số ô cờ thô ráp `(Ô 5, 15, 25, 35)` hay `(Ô 6, 8, 26, 27)`.
  - Chưa có điểm nhấn thị giác để người chơi hiểu ngay trong 0.5s tác động của thẻ bài.
  - Khối cash delta badge cũ sinh chuỗi cấm `'Thu Nhập:'` / `'Khoản Chi:'` gây va chạm hợp đồng hồi quy.
- **Mục tiêu đạt được**:
  1. **Khối Hero Stat Box Fintech "1 Giây Hiểu Ngay"** (`data-testid="event-hero-stat"`, font-mono, số to bản, 4 variant màu sắc rõ ràng).
  2. **Icon chuyên đề (Themed Emoji)** riêng biệt cho 36 thẻ bài (`⛽`, `🚨`, `🏖️`, `🚘`...), fallback an toàn `📰`/`⚡`.
  3. **Bộ lọc làm sạch số ô thô kệch** `sanitizeTargetScope` triệt tiêu dãy số ô kỹ thuật, giữ nguyên ngữ cảnh tự nhiên.
  4. **Triệt tiêu lặp đúp văn bản** tại SSOT `event_card_metadata.ts`.
  5. **An toàn responsive & touch target**: `pt-7`, `max-h-[90vh] overflow-y-auto`, nút đóng $\ge 38$px, nút CTA $\ge 46$px, 0 anti-patterns Impeccable.

---

## 2. Thiết Kế Kỹ Thuật

### A. Mô-đun thuần túy `src/client/ui/modals/event_card_visuals.ts`
- Bảng ánh xạ `THEMED_EMOJIS` cho toàn bộ 36 thẻ bài sự kiện.
- Bảng ánh xạ `KNOWN_HERO_STATS` với nhãn đanh thép: `PHỤ THU CƯỚC`, `PHẠT NỒNG ĐỘ CỒN`, `LÃI SUẤT VAY`, `QUY HOẠCH ĐÔ THỊ`, `CHỐT LỜI CỔ PHIẾU`, `THANH TRA THUẾ`,...
- Hàm `getCardThemedEmoji(cardId, cardType)` trả về emoji chuyên đề hoặc fallback.
- Hàm `getCardHeroStat(cardId, effectDelta)` trả về nhãn, giá trị và biến thể sắc thái.
- Hàm `sanitizeTargetScope(scope)` loại bỏ regex `/\s*\([ÔO0-9,\s]+\)/gi`.
- Hàm `sanitizeDestination(destination)` chuẩn hóa tên đích đến.
- Hàm `getHeroStatStyles(variant)` xuất stylesheet Tailwind chuẩn tương phản cao.

### B. Cập nhật `src/client/ui/modals/event_card_modal.tsx`
- Đệm lề an toàn: `pt-7 pb-6 px-5 sm:px-6 max-h-[90vh] overflow-y-auto`.
- Render khối `data-testid="event-hero-stat"` to bản với font-mono, typography sắc nét.
- Đặt `data-testid` trước `className` để bảo đảm tương thích kiểm thử tĩnh regex.
- Bảo tồn 100% wrapper responsive: `hidden sm:block`, `event-specs-table` (`hidden sm:flex`), `event-impact-summary` (`sm:hidden`).
- Nút CTA và nút đóng gọi `onConfirm ?? onClose` và `onClose`.

---

## 3. Danh Mục Kiểm Thử (28 Tests Universal 4-Facet)
- **Facet 1 (Boundary)**: Giới hạn chiều cao mobile, touch targets, fallback dummy ID.
- **Facet 2 (Reactivity)**: Hero Stat cập nhật theo cardId và delta, emoji chuyên đề.
- **Facet 3 (Disposal)**: Nút CTA và Đóng giải phóng modal an toàn.
- **Facet 4 (Error Defense)**: Triệt tiêu số ô thô kệch, không chứa nhãn cấm `'Thu Nhập:'`/`'Khoản Chi:'`.
