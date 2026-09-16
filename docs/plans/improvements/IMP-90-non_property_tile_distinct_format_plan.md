# Kế Hoạch Cải Tiến IMP-90: Định Dạng Trực Quan Riêng Biệt Cho Các Ô Không Phải Nhà Đất

## 1. Bối Cảnh & Vấn Đề
- **Thực trạng**: Toàn bộ 36 ô thường trên bàn cờ VTCOON trước đây đều bị vẽ một dải màu header 56px (`meta.bannerColor`) ở đỉnh ô.
- **Vấn đề**:
  - Người chơi nhầm lẫn ô sự kiện *Cơ Hội* (cam `#EA580C`) với BĐS nhóm Cam (Bình Định, Huế, Đà Nẵng).
  - Nhầm ô ngân sách *Lệ Phí Đất* (đỏ `#E11D48`) với BĐS nhóm Đỏ (Thanh Hóa, Nghệ An, Ninh Bình).
  - Nhầm ô tiện ích *Điện Lực EVN* (xanh `#2563EB`) với BĐS nhóm Tím/Xanh (TP.HCM, Thủ Đức).
  - Người chơi không nhận diện được đâu là đất có thể mua xây nhà C1–C3, đâu là hạ tầng mua thu phí vé, và đâu là ô sự kiện/chức năng không thể mua.
- **Giải pháp**: Triển khai mô hình **Phân cấp 3 tầng trực quan (Chuẩn Monopoly Plus)**:
  1. **22 Ô BĐS Nhà Đất**: BẢO TOÀN dải băng màu header 56px theo 8 nhóm màu, tiêu đề trắng đậm viền đen than, khay giá mua đất ở đáy.
  2. **6 Ô Hạ Tầng & Tiện Ích (Mua được)**: BỎ HOÀN TOÀN dải màu header. Nền ngà parchment `#F3EEDF`, tiêu đề chữ than đen `#0F172A`, đường chỉ viền phân cách thanh lịch (`#CBD5E1`), giữ khay giá mua đất ở đáy ("2.000 Tr.", "1.500 Tr.").
  3. **8 Ô Sự Kiện & Chức Năng (Không thể mua)**: BỎ HOÀN TOÀN dải màu header, tiêu đề chữ than đen. Thay thế khay giá tiền mua đất ở đáy bằng **Thanh nhãn hành động nổi bật** (`[RÚT THẺ CƠ HỘI]`, `[RÚT THẺ THỊ TRƯỜNG]`, `[NỘP 1.000 TR.]`, `[1D6 ĐẶT CƯỢC]`).

```
[SO SÁNH BỐ CỤC 3 LOẠI Ô SAU KHI CẢI TIẾN]:

1. Ô BĐS NHÀ ĐẤT (22 ô)       2. Ô HẠ TẦNG & TIỆN ÍCH (6 ô)     3. Ô SỰ KIỆN / CHỨC NĂNG (8 ô)
+-----------------------+     +-----------------------+     +-----------------------+
| [ BĂNG MÀU NHÓM ĐẤT ] |     |       TÊN HẠ TẦNG     |     |      TÊN SỰ KIỆN      |
|  (Nâu/Cam/Đỏ/Vàng...) |     |   (Chữ đen - Nền ngà) |     |  (Chữ đen - Nền ngà)  |
+-----------------------+     + - - - - - - - - - - - +     + - - - - - - - - - - - +
|  Phụ đề: Tỉnh/Thành   |     |  Phụ đề: Sân bay/EVN  |     |  Phụ đề: Thể loại     |
|                       |     |  ───────────────────  |     |                       |
|   [ Tranh / Công trình|     |   [ Icon Toa Tàu /    |     |   [ Icon Khung Thẻ To:|
|      3D C1 - C3 ]     |     |     Máy Bay / Điện ]  |     |     ⚡ Cơ Hội / 🎴 TT ]|
|                       |     |                       |     |                       |
+-----------------------+     +-----------------------+     +-----------------------+
|  GIÁ ĐẤT: 2.000 Tr.   |     |   GIÁ MUA: 2.000 Tr.  |     |   [ RÚT THẺ CƠ HỘI ]  |
+-----------------------+     +-----------------------+     +-----------------------+
(Xây được nhà C1-C3, cắm cờ)  (Mua được sở hữu, thu phí)    (Không mua được, rút bài)
```

---

## 2. Quy Trình 3 Trạm Thực Hiện
1. **Trạm 1 (RED Contract Test)**:
   - Tạo `tests/contracts/imp90_non_property_tile_distinct_format.test.ts` (18 atomic tests).
   - Chứng minh thất bại RED ban đầu: 10 tests failed do code chưa phân loại ô cờ.
2. **Trạm 2 (GREEN Implementation)**:
   - Cập nhật `src/client/3d/tile_texture_data.ts`: thêm `isPropertyTile`, `isInfrastructureTile` và `actionLabel`.
   - Cập nhật `src/client/3d/tile_texture_generator.ts`: bóc tách `drawPropertyHeader`, `drawNonPropertyHeader`, `drawPriceTrayFooter`, `drawActionBadgeFooter`.
   - 18/18 tests PASS, 0 lỗi TypeScript, 0 lỗi UI linter.
3. **Trạm 3 (Thẩm Định Độc Lập)**:
   - Điều động `spec-reviewer`, `code-reviewer`, `game-3d-visual-critic` kiểm tra đĩa vật lý.
