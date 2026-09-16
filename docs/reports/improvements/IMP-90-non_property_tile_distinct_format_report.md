# Báo Cáo Cải Tiến IMP-90: Định Dạng Trực Quan Riêng Biệt Cho Các Ô Không Phải Nhà Đất

## 1. Tổng Quan Kỹ Thuật
- **Mã Ticket**: `IMP-90`
- **Mục tiêu**:
  - Triệt tiêu 100% dải băng màu header 56px trên 14 ô phi nhà đất (Hạ tầng, Tiện ích, Cơ hội, Thị trường, Lệ phí đất, HOSE).
  - Phân định rạch ròi 3 nhóm ô cờ:
    1. **22 Ô Nhà Đất**: Giữ dải màu header, tiêu đề trắng đậm viền đen than, khay giá mua đất ở đáy.
    2. **6 Ô Hạ Tầng & Tiện Ích**: Nền ngà parchment `#F3EEDF`, tiêu đề chữ đen than `#0F172A`, đường chỉ viền phân cách, khay giá mua BĐS ở đáy.
    3. **8 Ô Sự Kiện & Chức Năng**: Nền ngà, tiêu đề chữ đen than, đáy ô hiển thị nhãn hành động tương ứng (`[RÚT THẺ CƠ HỘI]`, `[RÚT THẺ THỊ TRƯỜNG]`, `[NỘP 1.000 TR.]`, `[1D6 ĐẶT CƯỢC]`).

---

## 2. Chi Tiết Thực Thi
1. **[`src/client/3d/tile_texture_data.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/tile_texture_data.ts)**:
   - Thêm `actionLabel?: string` vào interface `TileMetadata`.
   - Cung cấp 2 helper xác thực kiểu ô: `isPropertyTile(index: number)` và `isInfrastructureTile(index: number)`.
   - Chuẩn hóa nhãn `actionLabel` cho 8 ô sự kiện.

2. **[`src/client/3d/tile_texture_generator.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/tile_texture_generator.ts)**:
   - Tách nhỏ hàm header thành `drawPropertyHeader` (18 LOC) và `drawNonPropertyHeader` (19 LOC), CC <= 2.
   - Tách nhỏ hàm footer thành `drawPriceTrayFooter` (15 LOC), `drawActionBadgeFooter` (16 LOC) và `getActionBadgeTheme` (9 LOC), CC <= 5.
   - Không vi phạm file limits, không code golf.

3. **[`tests/contracts/imp90_non_property_tile_distinct_format.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp90_non_property_tile_distinct_format.test.ts)**:
   - 18 atomic tests bao phủ 4 mặt (Universal 4-Facet Behavioral Matrix).
   - Chứng minh Inversion Gate ban đầu (10 tests RED) và chuyển hóa GREEN 18/18 tests PASS.

---

## 3. Bằng Chứng Nghiệm Thu Vật Lý
- **Vitest**:
  - `tests/contracts/imp90_non_property_tile_distinct_format.test.ts`: **18/18 PASS** (40ms).
  - `tests/contracts/imp80_daylight_illumination_and_unified_tile_art.test.ts`: **21/21 PASS** (17ms).
  - `tests/client/tile_text_crispness_and_overview_legibility.test.ts`: **30/30 PASS** (17ms).
  - `tests/contracts/imp89_action_dock_right_and_emotes_purge.test.ts`: **16/16 PASS** (29ms).
  - Tổng cộng 85/85 tests liên quan đều PASS 100%.
- **TypeScript**: `npx tsc --noEmit` -> **0 lỗi** (Exit code 0).
- **UI Linter**: `npm run lint:ui` -> **0 vi phạm** (137 tệp sạch).
