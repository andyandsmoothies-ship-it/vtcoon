# [IMP-38] Tái Quy Hoạch Bố Cục Thẻ Bài: Triệt Tiêu Text Phân Loại, Nâng Tiêu Đề & Phóng Đại Tranh Di Sản +118%

## 1. BỐI CẢNH & YÊU CẦU NGƯỜI DÙNG

- **Hiện trạng bất cập**:
  - Dải trên cùng chiếm 70px chỉ để hiển thị text phân loại ("HẠ TẦNG", "BĐS NGHỈ DƯỠNG", "BĐS DỊCH VỤ", "BĐS ĐÔ THỊ").
  - Chữ tiêu đề tỉnh thành ("CAO TỐC", "NINH BÌNH", "NGHỆ AN") và phụ đề ("Bắc - Nam", "Tràng An", "TP. Vinh") bị đẩy sâu xuống thấp (y = 108 và y = 138).
  - Tranh đại diện di sản bị bóp nghẹt trong ô nhỏ (chỉ 144 x 114 px). Nhìn từ góc máy camera 3D gameplay ~38 độ, hình vẽ bị thu nhỏ như con tem, rất khó nhận diện.
- **Yêu cầu chỉ đạo**:
  1. Loại bỏ hoàn toàn text phân loại trên đỉnh thẻ cờ (Xóa bỏ `meta.category` trên top).
  2. Nâng 2 dòng text còn lại lên cao:
     - Tên địa danh chính ("CAO TỐC", "NINH BÌNH", "NGHỆ AN") nâng lên sát dải màu.
     - Phụ đề ("Bắc - Nam", "Tràng An", "TP. Vinh") nâng lên ngay bên dưới.
  3. Dành toàn bộ diện tích giải phóng để **phóng to tranh đại diện di sản** lên tối đa, giúp người chơi quan sát rõ ràng kiến trúc và danh lam thắng cảnh bản địa ngay từ bàn cờ.

---

## 2. THIẾT KẾ BỐI CẢNH TỌA ĐỘ MỚI (CANVAS 256 x 340)

```text
[BỐ CỤC CŨ: ẢNH BỊ THU HẸP, CHỮ DÀY ĐẶC]
┌──────────────────────────────────────┐
│ [y=0..70] DẢI MÀU NHÓM ĐẤT           │
│   y=35: "HẠ TẦNG" / "BĐS NGHỈ DƯỠNG" │ <── LÃNG PHÍ 70PX CHO TEXT PHÂN LOẠI
├──────────────────────────────────────┤
│   y=108: "CAO TỐC" / "NINH BÌNH"     │
│   y=138: "Bắc - Nam" / "Tràng An"    │
├──────────────────────────────────────┤
│ [y=148..270] ẢNH ĐẠI DIỆN (144 x 114)│ <── DIỆN TÍCH: 16,416 px² (Nhỏ như tem)
├──────────────────────────────────────┤
│ [y=274..324] KHAY GIÁ: 2,000 TỶ      │
└──────────────────────────────────────┘

                    │
                    ▼
[BỐ CỤC MỚI IMP-38: ẢNH MỞ RỘNG +118%, THÔNG THOÁNG]
┌──────────────────────────────────────┐
│ [y=0..28] VIỀN MÀU NHÓM ĐẤT TINH TẾ  │ <── GỌN GÀNG, KHÔNG CHỨA TEXT RÁC
├──────────────────────────────────────┤
│   y=56: "CAO TỐC" / "NINH BÌNH"      │ <── NÂNG LÊN CAO (+52px)
│   y=80: "Bắc - Nam" / "Tràng An"     │ <── NÂNG LÊN CAO (+58px)
├──────────────────────────────────────┤
│                                      │
│ [y=94..268] ẢNH ĐẠI DIỆN MỞ RỘNG     │ <── PHÓNG ĐẠI TỐI ĐA (216 x 166 px)
│   (Target: 216 x 166 px)             │     (+50% chiều rộng, +45% chiều cao)
│   (Diện tích: 35,856 px²: +118%)     │     (Rõ nét mồn một từ camera gameplay)
│                                      │
├──────────────────────────────────────┤
│ [y=274..324] KHAY GIÁ: 2,000 TỶ      │ <── GIỮ NGUYÊN BẤT BIẾN
└──────────────────────────────────────┘
```

### Chi Tiết Tọa Độ Kỹ Thuật (Resolution HiDPI 4x = 1024 x 1360):
1. **Dải màu nhóm cờ (Color Band)**:
   - `ctx.fillRect(0, 0, 256, 28)`: Dải màu nhận diện nhóm cờ mỏng, sang trọng chuẩn Monopoly thương mại.
   - Triệt tiêu 100% lệnh `ctx.fillText(meta.category, ...)`.
2. **Tiêu đề chính (`meta.title`)**:
   - Tọa độ Y: `y = 56` (dời từ 108 lên 56).
   - Font: `900 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`.
   - Màu: `#090D1A` (Tương phản cao tuyệt đối).
3. **Phụ đề (`meta.subtitle`)**:
   - Tọa độ Y: `y = 80` (dời từ 138 lên 80).
   - Font: `bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`.
   - Màu: `#334155`.
4. **Tranh di sản đại diện (`tileImageCache`)**:
   - Vùng clip an toàn: `rect(10, 92, 236, 176)` (y = 92..268, chiều cao khả dụng 176px).
   - Kích thước ảnh thực tế: `targetW = 216`, `targetH = 166`.
   - Vị trí vẽ ảnh: `dx = (256 - 216) / 2 = 20`, `dy = 97`.
   - Biểu tượng fallback: `drawIcon(ctx, meta.icon, 128, 180, meta.bannerColor, 1.5)`.
5. **Khay giá niêm yết**:
   - Giữ nguyên `roundRect(22, 274, 212, 50, 12)`, text căn giữa tại `y = 300`.

---

## 3. LỘ TRÌNH QUY TRÌNH 3 TRẠM (MANDATORY 3-STATION PIPELINE)

1. **Trạm 1 (RED Contract Test)**:
   - Tạo tệp kiểm thử hợp đồng nguyên tử: `tests/client/expanded_card_art_layout.test.ts` (15+ atomic tests theo Ma Trận 4 Khía Cạnh Hành Vi).
   - Đồng bộ hóa các assertions tọa độ cũ trong `tests/client/flat_tile_art_and_clean_c0.test.ts`.
   - Chạy Vitest để xác nhận bài test BÁO ĐỎ (RED) trên mã nguồn cũ.
2. **Trạm 2 (GREEN Implementation)**:
   - Cập nhật hàm `createStandardTileTexture` trong `src/client/3d/tile_texture_generator.ts`.
   - Chạy Vitest để xác nhận toàn bộ tests chuyển XANH (GREEN).
   - Chụp ảnh màn hình kiểm chứng bàn cờ 1920x1080 lưu vào `docs/reports/improvements/screenshots/imp38_expanded_card_art.jpg`.
3. **Trạm 3 (Independent Review & Disk Verification)**:
   - Thẩm định 2 Cổng: Spec Integrity & Code Quality.
   - Chạy `npm run gate:quick` và `npm test`.
   - Cập nhật Sổ cái `docs/master_roadmap.md` và `docs/domain/gotchas.md`.
