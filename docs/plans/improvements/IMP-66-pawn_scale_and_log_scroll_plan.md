# Kế Hoạch Cải Tiến IMP-66: Chuẩn Hóa Tỷ Lệ Quân Cờ VIP & Tự Động Cuộn Bảng Nhật Ký

> **Mã cải tiến**: IMP-66  
> **Trạng thái**: Đã thực thi & Đạt toàn bộ kiểm định (Passed Trạm 1 -> Trạm 2 -> Trạm 3)  
> **Phạm vi**: `src/client/3d/luxury_pawn_models.tsx`, `src/client/3d/luxury_pawn_fallbacks.tsx`, `src/client/ui/player_card.tsx`, `src/client/ui/player_hud_list.tsx`, `src/client/ui/activity_feed_sidebar.tsx`

---

## 1. Bối Cảnh & Vấn Đề

1. **Chênh lệch kích thước quân cờ bot (Pawn Stature Imbalance)**:
   - Tháp Landmark (Slot 0 của Host P1) cao 1.2m đứng sừng sững trên ô cờ.
   - Các linh vật của Bot gồm Du thuyền (Slot 1, cao 0.35m), Xe cổ (Slot 2, cao 0.25m) có dạng nằm ngang nên bị dẹt và quá nhỏ bé so với tháp Landmark.
   - Thẻ người chơi 2D (`PlayerCard`) chỉ hiển thị một chấm tròn nhỏ 16px không phân biệt được linh vật đặc trưng của bot so với người chơi.

2. **Bảng nhật ký không tự cuộn xuống dòng mới nhất (Activity Feed Stagnant Scroll)**:
   - Panel `ActivityFeedSidebar` sử dụng `scrollIntoView({ behavior: 'smooth' })` trên phần tử rỗng ở đáy nhưng hay bị trình duyệt hủy khi drawer đang mở (CSS transition 300ms) hoặc khi log phát sinh dồn dập.
   - Người chơi không quan sát được biến động tức thì trừ phi tự cuộn tay xuống dưới cùng.

---

## 2. Giải Pháp Thiết Kế

1. **Chuẩn hóa tỷ lệ 3D & Linh vật**:
   - Mở rộng cấu hình `LUXURY_PAWN_CONFIGS` bổ sung `scale`, `yOffset`, `icon`:
     - Slot 0 (Tháp Landmark): `scale: [1.0, 1.0, 1.0]`, `icon: '🏰'`, `yOffset: 0.03`
     - Slot 1 (Du thuyền): `scale: [1.6, 1.8, 1.6]`, `icon: '⛵'`, `yOffset: 0.06`
     - Slot 2 (Xe cổ): `scale: [1.8, 2.0, 1.8]`, `icon: '🚗'`, `yOffset: 0.06`
     - Slot 3 (Ngựa chiến): `scale: [1.4, 1.5, 1.4]`, `icon: '🐎'`, `yOffset: 0.04`
   - Bổ sung hàm `getPawnConfigBySlot(slotIndex)` fallback an toàn về Slot 0 khi vượt biên.
   - Nâng cấp `PlayerCard` hiển thị huy hiệu linh vật 32px (`w-8 h-8 rounded-xl border-2 border-slate-900`) với màu nền token và emoji tương ứng.

2. **Cơ chế neo đáy tự động bảng nhật ký**:
   - Gắn `scrollContainerRef` trực tiếp vào khung chứa log cuộn.
   - Kích hoạt cuộn tức thì `scrollTop = scrollHeight` khi mở panel và khi có log mới.
   - Bổ sung hàm `shouldShowScrollBottom(scrollTop, scrollHeight, clientHeight)` phát hiện trạng thái người dùng đang chủ động cuộn lên xem lịch sử cũ.
   - Hiển thị nút nổi tiện ích `data-testid="scroll-to-bottom-btn"` (⬇ Dòng mới nhất) để người chơi quay về đáy nhanh chóng với 1 chạm.

---

## 3. Kế Hoạch Kiểm Thử Quy Trình 3 Trạm

- **Trạm 1 (RED Contract Test)**:
  - Viết `tests/contracts/imp66_pawn_scale_and_log_scroll.test.ts` kiểm thử 3 nhóm yêu cầu:
    - 4 linh vật quân cờ đầy đủ scale cân đối và icon emoji.
    - PlayerCard hiển thị badge 32px kèm icon cho cả người chơi và bot.
    - ActivityFeedSidebar có neo đáy `activity-log-bottom-anchor` và logic `shouldShowScrollBottom`.
  - Chứng minh RED trước khi viết code.
- **Trạm 2 (GREEN Implementation)**:
  - Cập nhật mã nguồn tối thiểu theo đúng thiết kế.
  - Chạy vitest xác nhận 8/8 tests PASS.
- **Trạm 3 (Verification & Gate)**:
  - Chạy `npm run gate:quick` xác nhận 0 lỗi TypeScript, 0 lỗi UI lint, 0 lỗi mã trùng.
  - Chạy `npm test` xác nhận 180 test suites / 3.074 tests PASS 100%.
  - Chạy `npm run build` xác nhận bundle đóng gói thành công.
