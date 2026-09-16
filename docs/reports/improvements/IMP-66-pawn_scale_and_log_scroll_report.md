# Báo Cáo Cải Tiến Kỹ Thuật IMP-66: Chuẩn Hóa Tỷ Lệ Quân Cờ VIP & Tự Động Cuộn Bảng Nhật Ký

> **Mã cải tiến**: IMP-66  
> **Người thực hiện**: Lead QA & System Architect  
> **Ngày hoàn tất**: 15/09/2026  
> **Trạng thái**: TOÀN BỘ CÁC TRẠM ĐÃ ĐẠT (PASS 100%)

---

## 1. Mục Tiêu Đạt Được

1. **Chuẩn hóa tầm vóc 4 quân cờ VIP 3D**:
   - Khắc phục triệt để tình trạng các mô hình nằm ngang của Bot (Du thuyền Yacht cao 0.35m, Xe cổ Roadster cao 0.25m) bị lọt thỏm và dẹt nhỏ so với Tháp Landmark của người chơi (cao 1.2m).
   - Thiết lập bảng tỷ lệ scale riêng biệt trong `LUXURY_PAWN_CONFIGS` (Du thuyền scale [1.6, 1.8, 1.6], Xe cổ scale [1.8, 2.0, 1.8], Ngựa chiến scale [1.4, 1.5, 1.4]), giúp 4 quân cờ đứng trên bàn cờ có khối tích thị giác hoành tráng tương đương nhau.
   - Bổ sung hàm tiện ích `getPawnConfigBySlot(slotIndex)` với cơ chế fallback an toàn về Slot 0 (Host).

2. **Huy hiệu linh vật 2D tactile 32px cho cả Người chơi và Bot**:
   - Nâng cấp chấm tròn nhỏ 16px trên thẻ người chơi `PlayerCard` thành huy hiệu linh vật 32px (`w-8 h-8 rounded-xl border-2 border-slate-900`) hiển thị biểu tượng emoji linh vật (`🏰`, `⛵`, `🚗`, `🐎`) trên nền màu token cá nhân.
   - Giúp người chơi dễ dàng nhận diện danh tính và linh vật đại diện của từng đối thủ bot một cách trực quan, đồng bộ với mô hình 3D trên bàn cờ.

3. **Tự động cuộn đáy bảng nhật ký ván đấu (Activity Feed Auto-Scroll)**:
   - Thay thế cơ chế `scrollIntoView` gián tiếp dễ bị ngắt quãng bằng việc điều khiển trực tiếp container cuộn qua `scrollContainerRef`.
   - Bảng nhật ký luôn luôn tự động cuộn tức thì đến dòng mới nhất khi vừa mở panel và khi có sự kiện mới phát sinh.
   - Tích hợp hàm `shouldShowScrollBottom` kiểm tra khoảng cách cuộn và hiển thị nút nổi tiện ích `⬇ Dòng mới nhất` (`data-testid="scroll-to-bottom-btn"`) khi người chơi chủ động kéo lên xem lại các biến cố cũ trong trận đấu.

---

## 2. Danh Sách Tệp Thay Đổi & Kiểm Toán LOC

| Tệp | Thay Đổi | LOC Sau Sửa | Giới Hạn Kiến Trúc | Trạng Thái |
| :--- | :--- | :---: | :---: | :---: |
| `src/client/3d/luxury_pawn_models.tsx` | Cấu hình scale, icon, yOffset, hàm `getPawnConfigBySlot` | 125 | <= 400 | PASS |
| `src/client/3d/luxury_pawn_fallbacks.tsx` | Bọc procedural fallback trong `scale={config.scale}` | 248 | <= 400 | PASS |
| `src/client/ui/player_card.tsx` | Thay chấm 16px bằng badge linh vật 32px kèm emoji | 158 | <= 500 | PASS |
| `src/client/ui/player_hud_list.tsx` | Truyền `slotIndex={index}` cho `PlayerCard` | 33 | <= 500 | PASS |
| `src/client/ui/activity_feed_sidebar.tsx` | Cơ chế auto-scroll, `shouldShowScrollBottom`, nút cuộn đáy | 323 | <= 500 | PASS |
| `tests/contracts/imp66_pawn_scale_and_log_scroll.test.ts` | Test contract kiểm thử hồi quy và bảo đảm chất lượng | 134 | <= 300 | PASS |

---

## 3. Kết Quả Xác Minh Tự Động Hóa 100%

1. **Test hợp đồng IMP-66**:
   - `npx vitest run tests/contracts/imp66_pawn_scale_and_log_scroll.test.ts`: 8/8 tests PASS.
2. **Kiểm toán tĩnh & UI Lint**:
   - `npm run gate:quick`: 0 lỗi TypeScript (`tsc --noEmit`), 0 lỗi UI lint (`lint:ui`), 0 lỗi trùng lặp (`lint:dup`), 27/27 mô hình 3D đạt chuẩn ngân sách (1.11 MB / 2.5 MB).
3. **Toàn bộ Test Suites**:
   - `npm test`: 180/180 test files PASS (3.074/3.074 test cases PASS 100%).
4. **Đóng gói Production**:
   - `npm run build`: Đóng gói thành công Client và Server SSR bundle vào `dist/` trong 14.37s.
