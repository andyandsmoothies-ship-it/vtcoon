# Cải Tiến Liên Tục (IMP): IMP-140 — Tối Ưu Tải Ảnh Nền BĐS & Đại Tu UI/UX Thẻ Sổ Đỏ (Title Deed Card Overhaul)

## 1. Bối Cảnh & Vấn Đề
- Khi trải nghiệm game trên mobile (`https://vtcoon.onrender.com`), người chơi phát hiện 2 vấn đề lớn:
  1. Ảnh nền di sản tải rất chậm lần đầu và xuất hiện hiện tượng dải decode 24px bị cắt cụt do `loading="lazy"` trong modal cuộn và không có preloading.
  2. Nút đóng tròn 48px cắm ở `top-2.5` cắt ngang mép dưới ruy-băng cam; khoảng trống màu be chiếm tới 70% banner di sản; modal 498 LOC sát trần cứng.

## 2. Mục Tiêu & Giải Pháp Kiến Trúc
- **Preload 28 ảnh Base Tiles**: Nạp ngầm vào cache trình duyệt ngay khi kết nối vào phòng (`preloadBaseTileImages`). Bọc guard an toàn `isTestEnv` để bảo vệ test runner.
- **Eager Decode & Shimmer Skeleton**: Dùng `loading="eager"` và `decoding="async"`, kết hợp underlay `art-shimmer-skeleton` hiển thị êm ái khi tải ảnh.
- **Căn giữa dọc nút đóng 48px**: Chuyển sang `top-1/2 -translate-y-1/2 right-2 sm:right-2.5`, giữ nguyên kích thước chạm và không cắm vào thân modal.
- **Phân rã module dưới trần LOC**:
  - `title_deed_art_showcase.tsx` (74 LOC)
  - `title_deed_rent_table.tsx` (118 LOC)
  - `title_deed_action_footer.tsx` (152 LOC)
  - `title_deed_modal.tsx` (291 LOC, dưới trần cảnh báo 300 LOC)
- **Chuẩn hóa Touch Target**: Nâng nút Carousel lên `min-h-[44px]`.

## 3. Danh Sách Tệp Tác Động
- `src/client/assets/tile_assets.ts`
- `src/client/network/use_app_session.ts`
- `src/client/ui/modals/title_deed_modal.tsx`
- `src/client/ui/modals/title_deed_art_showcase.tsx` [NEW]
- `src/client/ui/modals/title_deed_rent_table.tsx` [NEW]
- `src/client/ui/modals/title_deed_action_footer.tsx` [NEW]
- `tests/client/imp140_title_deed_ui_ux_and_preloading.test.ts` [NEW]
