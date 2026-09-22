# Kế Hoạch IMP-169: Rút Gọn Thông Báo Thẻ Sự Kiện & Hợp Nhất Ngăn Xếp Pop-up (Unified Pop-up Stack Architecture)

> **Mục tiêu:** Xử lý triệt để 2 vấn đề UX do người dùng phản ánh qua ảnh chụp thực tế trên thiết bị di động (`media_1790086701188.png`):
> 1. **Pop-up có text dài, UX không thân thiện:** Thẻ sự kiện (ví dụ `MC_MEGA_CONCERT` - "Đại Nhạc Hội Quốc Tế") đưa nguyên văn câu mô tả dài 72 ký tự vào pop-up nổi ngắn hạn (3.2s), dẫn đến bẻ 2 dòng dày đặc và bị cắt cụt đuôi `...` ("cấp nhà cao...").
> 2. **Nhiều pop-up cùng lúc cách xa nhau vô lý:** Thẻ sự kiện (`MilestoneBanner`) và thẻ biến động tài chính (`FloatingBadge`) nằm ở 2 container `fixed` tách biệt với tọa độ tĩnh (`top-20` = 80px và `top-[11.5rem]` = 184px), tạo ra khoảng trống rơi tự do hơn **52px** ở giữa, khiến các pop-up nhìn rời rạc và lệch pha.

---

## 1. Phân Tích Hiện Trạng & Bản Chất Vấn Đề

- **Nguyên nhân 1:** `activity_tracker.ts` sử dụng nguyên văn đoạn mô tả chi tiết của ticker tĩnh (`ACTIVE_MARKET_EFFECT_SUMMARIES`) đưa vào `floatingTexts`. Trong một pop-up chỉ hiện 3.2 giây, đoạn văn 72 ký tự bị `line-clamp-2` cắt cụt thành `"đến ô Dịch Vụ có cấp nhà cao..."`.
- **Nguyên nhân 2:** `MilestoneBanner` và `FloatingBadge` được đặt trong 2 thẻ `<div>` `fixed` riêng rẽ với tọa độ `top` ước tính tĩnh từ IMP-143. Việc giả định banner cao 100px đã tạo ra khoảng hở 52px vô lý giữa 2 thẻ.

---

## 2. Giải Pháp Triển Khai

1. **Từ điển tóm tắt súc tích (`src/client/ui/event_card_punchy_summaries.ts`)**:
   - Khai báo 100% (36/36) thẻ Sự Kiện (16 Market + 20 Chance) với độ dài <= 35 ký tự.
   - `MC_MEGA_CONCERT` đổi thành `"Di chuyển đến ô Dịch Vụ cao nhất"`.
   - `MilestoneBanner` hiển thị trên 1 dòng đơn sắc nét với class `truncate`, xóa bỏ `line-clamp-2`.
2. **Hợp nhất Flex Container (`src/client/ui/floating_numbers.tsx`)**:
   - Gộp toàn bộ pop-up vào 1 container Flexbox duy nhất (`flex flex-col items-center gap-2`).
   - Khoảng cách giữa thẻ sự kiện và thẻ giao dịch cố định tự nhiên ở **`gap-2` (8px)**, triệt tiêu hoàn toàn khoảng hở 52px.
   - Tọa độ `top` của container tự động thích ứng an toàn theo `activeMarketCount` (`top-20`, `top-[10.5rem]`, `top-[15.5rem]`).
3. **Đấu nối luồng dữ liệu (`src/client/network/activity_tracker.ts`)**:
   - Khi rút thẻ sự kiện, tự động gọi `resolvePunchyEventSummary` để gán câu hành động súc tích vào `item.text`.
