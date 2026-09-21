# [IMP-159 Plan] Tinh Giản Toàn Diện Sàn Đấu Giá: Triệt Tiêu Lồng Thẻ (De-Nesting), Đồng Nhất Bục Đấu Giá & Trải Nghiệm Tối Giản Cao Cấp

> **Mã Cải Tiến:** IMP-159  
> **Căn Cứ Phản Hồi:** *"tôi vẫn thấy giao diện đấu giá này chưa clean, UI UX vẫn rườm rà"*  
> **Chẩn Đoán Căn Nguyên:**  
> 1. Hội chứng lồng thẻ đa tầng (12 viền border, 6 sắc độ nền).  
> 2. Bục đấu giá chắp vá (khối đen giá thầu đứng cạnh khối trắng dẫn đầu).  
> 3. Bảng danh sách người chơi đóng khung thô ráp.  
> 4. Trùng lặp thông tin BĐS 2 lần.

## I. MỤC TIÊU VÀ NGUYÊN TẮC
1. Triệt tiêu hội chứng lồng thẻ đa tầng (Zero Card-Nesting).
2. Hợp nhất bục đấu giá thành 1 khối duy nhất `auction-unified-podium`.
3. Thu gọn danh sách người tham gia dạng list dọc không border (`max-w-[120px]`, `(Bạn)`, `👑 Dẫn đầu`).
4. Hero Property Header `auction-hero-header` ở cánh trái.
5. Bảo tồn 100% hợp đồng kiểm thử, WCAG AA touch targets và màu nền bàn cờ `#FFFBEB`.

## II. DANH MỤC THAY ĐỔI
- `src/client/ui/modals/auction_modal.tsx`
- `src/client/ui/modals/auction_district_card.tsx`
- `tests/client/imp159_clean_tactile_auction_redesign.test.ts`
