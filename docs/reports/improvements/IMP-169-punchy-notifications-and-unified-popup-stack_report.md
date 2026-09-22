# Báo Cáo Triển Khai IMP-169: Rút Gọn Thông Báo Thẻ Sự Kiện & Hợp Nhất Ngăn Xếp Pop-up (Unified Pop-up Stack Architecture)

- **Ticket:** IMP-169
- **Mục tiêu:** Khắc phục 2 nhược điểm UX do người dùng phản ánh qua ảnh thực tế di động (`media_1790086701188.png`): (1) Thẻ sự kiện text dài bị cắt cụt dấu ba chấm; (2) Khoảng cách 52px rời rạc giữa 2 pop-up.
- **Trạng thái:** HOÀN THÀNH (Quy trình 3 Trạm: Trạm 1 RED -> Trạm 2 GREEN -> Trạm 3 Independent Review).

---

## 1. Các Thay Đổi Cụ Thể

1. **`src/client/ui/event_card_punchy_summaries.ts` [NEW]**:
   - Khai báo trọn vẹn 100% (36/36) thẻ Sự Kiện (16 Market + 20 Chance) với độ dài <= 35 ký tự.
   - `MC_MEGA_CONCERT`: `"Di chuyển đến ô Dịch Vụ cao nhất"`.
   - Hàm `resolvePunchyEventSummary` có fallback an toàn dưới 38 ký tự.

2. **`src/client/network/activity_tracker.ts` [MODIFY]**:
   - Tích hợp `resolvePunchyEventSummary` vào luồng `detectEventCardActivities`, gán câu hành động súc tích vào `item.text`.

3. **`src/client/ui/floating_numbers.tsx` [MODIFY]**:
   - `MilestoneBanner`: chuyển mô tả sang 1 dòng đơn `truncate`, loại bỏ `line-clamp-2`.
   - `FloatingNumbersOverlay`: hợp nhất thành 1 container Flexbox duy nhất (`gap-2` = 8px) đa kích thước (`max-w-[92vw] md:max-w-md`), triệt tiêu khoảng cách 52px.
   - Điều phối tọa độ đỉnh tự động theo `activeMarketCount` (`top-20`, `top-[10.5rem]`, `top-[15.5rem]`).

4. **Kiểm thử & Điều hòa hợp đồng**:
   - `tests/client/imp169_punchy_notifications_and_unified_stack.test.ts`: 57 atomic tests kiểm chứng toàn diện 4 facets.
   - `tests/client/imp143_notification_safe_offsets_decollision.test.ts`: 24 tests điều hòa theo kiến trúc Unified Stack.
   - Toàn bộ suite `imp128`, `imp129`, `imp135`, `imp139`, `imp155` đều đạt 100% PASS.

---

## 2. Kết Quả Kiểm Thử Quy Chuẩn

- **Type Check (`npx tsc --noEmit`)**: 0 errors.
- **UI Linter (`npm run lint:ui`)**: 0 anti-patterns qua 171 files.
- **Suite toàn dự án (`npm test`)**: **297 / 297 test files PASS** (6.074 / 6.074 tests pass, 100%).
- **Thẩm định Trạm 3**:
  - `ui-craft-reviewer`: **SHIP** (0 lỗi vật lý, đạt chuẩn Impeccable 2D Craft).
  - `spec-reviewer`: **PASS** (100% khớp đặc tả SSOT).
- **Ghi nhận Domain Gotchas**: Đã bổ sung **Gotcha #234** vào [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md).
