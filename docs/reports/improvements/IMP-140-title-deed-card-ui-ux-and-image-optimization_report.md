# Báo Cáo Nghiệm Thu IMP-140: Tối Ưu Tải Ảnh Nền BĐS & Đại Tu UI/UX Thẻ Sổ Đỏ (Title Deed Card Overhaul)

## 1. Tổng Quan Triển Khai
- **Mã Cải Tiến**: IMP-140
- **Trạng Thái**: 🟢 **Hoàn Tất & Nghiệm Thu Trạm 3**
- **Mục Tiêu**: Giải quyết triệt để vấn đề ảnh nền BĐS load chậm lần đầu, vệt ảnh 24px bị cắt dở trên mobile và đại tu giao diện thẻ Sổ Đỏ tinh gọn, xúc giác, công thái học chuẩn Impeccable 2.0.

## 2. Kết Quả Kỹ Thuật Đạt Được
1. **Nạp Ngầm 28 Ảnh Base Tiles (`preloadBaseTileImages`)**:
   - Tự động nạp ngầm toàn bộ 28 tranh di sản (~1.1MB) vào cache trình duyệt ngay khi kết nối vào phòng (`use_app_session.ts`).
   - Guard an toàn `isTestEnv` bảo vệ 100% các bài test Vitest/Node không bị đụng độ spy `new Image()`.
2. **Eager Decode & Shimmer Skeleton (`TitleDeedArtShowcase`)**:
   - Chuyển sang `loading="eager"` và `decoding="async"`, triệt tiêu hoàn toàn hiện tượng hoãn gửi request của `loading="lazy"` trên mobile.
   - Bổ sung Shimmer Skeleton underlay `data-testid="art-shimmer-skeleton"`, tự mờ đi khi ảnh kích hoạt sự kiện `onLoad` và tự reset khi đổi BĐS.
   - Luôn render thẻ `<img>` trong SSR markup bảo đảm tương thích kiểm thử hồi quy.
3. **Căn Chỉnh Nút Đóng & Vùng Đệm Tiêu Đề**:
   - Nút đóng `(✕)` căn giữa dọc theo ruy-băng header `top-1/2 -translate-y-1/2 right-2 sm:right-2.5`, giữ nguyên kích thước chạm `min-w-[48px] min-h-[48px]`, không còn cắm xiên qua mép dưới ruy-băng cam.
   - Tiêu đề `<h2>` bổ sung vùng đệm `pr-12 sm:pr-14` bảo đảm không bao giờ bị nút đóng che khuất chữ.
4. **Phân Rã Kiến Trúc Dưới Trần LOC Archetype**:
   - `title_deed_modal.tsx`: Giảm từ 498 LOC xuống **291 LOC** (dưới trần cảnh báo 300 LOC).
   - `title_deed_action_footer.tsx`: 152 LOC (dưới trần 200 LOC).
   - `title_deed_art_showcase.tsx`: 74 LOC (dưới trần 200 LOC).
   - `title_deed_rent_table.tsx`: 118 LOC (dưới trần 200 LOC).
5. **Nâng Chuẩn Touch Target Carousel**: Nâng nút chuyển sổ đỏ "◀ Trước" và "Sau ▶" lên `min-h-[44px]`.

## 3. Bằng Chứng Kiểm Thử & Nghiệm Thu Trạm 3
- **Unit & Contract Tests**: 20/20 tests PASS 100% trong `tests/client/imp140_title_deed_ui_ux_and_preloading.test.ts`.
- **Hồi Quy 5 Suites**: 106/106 tests PASS 100% (`indigenous_diorama`, `phase3_visual_polish`, `part4_tactile_cards`, `ui04_business_modals`, `impeccable_tactile_modals`).
- **UI Linter (`npm run lint:ui`)**: 0 anti-patterns across 163 files.
- **Slop Linter (`npm run lint:slop`)**: 0 hard violations across 233 files (`title_deed_modal.tsx` sạch cảnh báo).
- **Biên Dịch TypeScript (`npx tsc --noEmit`)**: 0 lỗi.
- **Automated Evidence Snapshot**: Ghi nhận tại `.agents/evidence/imp140_snapshot.json`.
- **Phán Quyết Trạm 3**:
  - `spec-reviewer`: **APPROVED** (100% spec reconciliation)
  - `code-reviewer`: **APPROVED** (Archetype LOC compliant, 0 slop flags)
  - `ui-craft-reviewer`: **DISPOSITION SHIP** (P1-P4 resolved)
- **Domain Memory**: Lưu trữ Gotcha #186 trong `docs/domain/gotchas.md`.
