# Kế Hoạch Cải Tiến IMP-170: Rà Soát & Khử Trùng Lặp 36 Thẻ Sự Kiện, Tinh Giản Tag Hành Chính & Nút CTA Cảm Xúc Thân Thiện

> **Ticket**: IMP-170  
> **Trạng thái**: APPROVED & EXECUTED  
> **Phạm vi**: 36 Thẻ Sự Kiện (20 Thẻ Cơ Hội + 16 Thẻ Thị Trường) trên `EventCardModal`  
> **Tài liệu tham chiếu**: ADR-0001, Gotcha #236, `docs/domain/event_card_metadata.ts`

---

## 1. BỐI CẢNH & MỤC TIÊU CẢI TIẾN

### 1.1. Hiện trạng tồn đọng
- **Lặp từ 3 lớp**: Tiêu đề thẻ, mô tả chi tiết và khối Hero Stat hiển thị lặp lại cùng một cụm từ (ví dụ: Tiêu đề "Chốt Lời Danh Mục Đầu Tư Chứng Khoán", Mô tả "Chốt lời cổ phiếu...", Hero Stat "CHỐT LỜI CỔ PHIẾU | +2.500 Tr.", trong khi mô tả lại ghi thêm "+2.500 Tr.").
- **Nhiễu tag hành chính**: Các tag "🎯 Người chơi rút thẻ" và "⏳ Tức thì" là các nhãn hiển nhiên của một thẻ rút trên tay, gây rác giao diện trên mobile 360px.
- **Nút CTA đơn điệu**: 100% (36/36) thẻ đều dùng chung nút cứng `"Đã Hiểu / Tiếp Tục"`.

### 1.2. Mục tiêu kỹ thuật
1. Chuẩn hóa tiêu đề 36 thẻ ngắn gọn, gợi hình, mang hơi thở thương mại Việt Nam.
2. Mô tả thẻ mang tính tự sự sinh động (storytelling), tuyệt đối không lặp lại từ đầu của tiêu đề và không lặp lại số tiền lớn.
3. Hero Stat là nơi duy nhất hiển thị số liệu tài chính định lượng hoặc hiệu ứng cốt lõi.
4. Tự động ẩn các tag hành chính mặc định hiển nhiên.
5. Trang bị nút bấm CTA hành động ngữ cảnh hóa cảm xúc cho 36/36 thẻ sự kiện.

---

## 2. KIẾN TRÚC & PHÂN BỔ DỮ LIỆU

```
[vi.ts] (36 Tiêu Đề Mới)
   │
   ├──> [event_card_metadata.ts] (36 Mô Tả Kể Chuyện Không Lặp Từ & Không Lặp Số Tiền)
   │
   ├──> [event_card_visuals.ts] (36 Hero Stats + 36 Nút CTA Cảm Xúc KNOWN_CARD_CTA_BUTTONS)
   │
   └──> [EventCardModal.tsx] (Render Giao Diện, Ẩn Tag Mặc Định, data-testid="event-card-confirm-btn")
```

---

## 3. KẾ HOẠCH KIỂM THỬ & BẢO TOÀN HỢP ĐỒNG

- Chạy toàn bộ 298 test suites (6.097 tests) để chứng minh tính tương thích ngược và bảo toàn bất biến nghiệp vụ.
- Bảo đảm 0 lỗi TypeScript (`npx tsc --noEmit`) và 0 vi phạm UI Linter (`npm run lint:ui`).
