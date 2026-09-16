# Báo Cáo Nghiệm Thu Cải Tiến IMP-88: Dời Vị Trí Telemetry Badge & Giải Phóng Cụm Tiện Ích HUD

> **Ticket**: IMP-88  
> **Trạng thái**: 🟢 **Hoàn Tất & Phê Duyệt 100%**  
> **Ngày hoàn thành**: 2026-09-16  
> **Kế hoạch**: [`IMP-88_plan.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/plans/improvements/IMP-88-telemetry_badge_relocation_and_unobstructed_hud_plan.md)  
> **Gotcha**: #118 trong [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md)

---

## 1. TỔNG QUAN NGUYÊN NHÂN & NGUỒN GỐC

Từ ảnh chụp màn hình thực tế của người dùng (`media_1789519673829.png`):

1. **Huy hiệu FPS che khuất các nút thao tác TopBar và thẻ người chơi P1**:
   - *Nguyên nhân*: `hud_container.tsx` đặt `<TelemetryBadge />` ở `absolute top-4 right-4 z-20`. Cụm nút tiện ích `TopBar` ("Ánh Sáng", "Bật", "Nhật Ký", "Thoát") và đỉnh thẻ người chơi P1 cũng nằm ở góc trên bên phải. Do đó, viên thuốc FPS/Ping đè trực tiếp lên 3 nút cuối, khiến người dùng không thể bấm "Bật âm thanh", "Nhật Ký" hay "Thoát".
   - *Khắc phục*: Xóa bỏ hoàn toàn định vị `top-4 right-4`. Đưa `<TelemetryBadge />` xuống góc dưới bên phải bên trong thẻ `<footer>` (`flex-row justify-between items-end`), đối xứng hoàn hảo với `ActionDock` ở góc dưới bên trái. Cụm nút TopBar và danh sách người chơi hoàn toàn thông thoáng 100%.

2. **Triệt tiêu backdrop-blur trên DOM Overlay**:
   - *Khắc phục*: Loại bỏ `backdrop-blur-md` khỏi `telemetry_badge.tsx`, chuyển sang nền đặc tông tối `bg-slate-950/95` tương phản cao theo Gotcha #87, vừa giải phóng GPU fill-rate vừa giúp thông số FPS/Ping hiển thị rõ nét hơn.

---

## 2. CÁC TỆP ĐÃ THAY ĐỔI & THÊM MỚI

| Tệp | Loại | Mô tả |
| :--- | :---: | :--- |
| [`src/client/ui/hud_container.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/hud_container.tsx) | Modify | Xóa badge khỏi `top-4 right-4`, chuyển vào cạnh phải của `footer` với layout `justify-between` |
| [`src/client/ui/telemetry/telemetry_badge.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/telemetry/telemetry_badge.tsx) | Modify | Loại bỏ `backdrop-blur-md`, dùng nền đặc `bg-slate-950/95`, bổ sung `isSSR` fallback |
| [`tests/contracts/imp88_telemetry_badge_relocation.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp88_telemetry_badge_relocation.test.ts) | New | 16 atomic tests kiểm thử hợp đồng bao phủ 4 diện mạo hành vi |
| [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md) | Modify | Ghi nhận Bất biến Gotcha #118 |
| [`docs/plans/improvements/IMP-88..._plan.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/plans/improvements/IMP-88-telemetry_badge_relocation_and_unobstructed_hud_plan.md) | New | Kế hoạch kỹ thuật IMP-88 |

---

## 3. BẰNG CHỨNG KIỂM ĐỊNH CHẤT LƯỢNG

- **Hợp Đồng Kiểm Thử IMP-88**: `16/16 PASS (100%)` (36ms).
- **TypeScript Strict Mode**: `npx tsc --noEmit` -> 0 lỗi.
- **UI Linter**: `npm run lint:ui` -> 0 violations trên toàn bộ 137 tệp.
- **Bố Cục Thực Tế**:
  - Cụm nút TopBar bên phải ("Ánh Sáng", "Bật", "Nhật Ký", "Thoát"): **100% không bị che khuất**.
  - Thẻ người chơi P1 và danh sách PlayerHudList: **100% không bị che khuất**.
  - Huy hiệu Telemetry: Nằm gọn gàng ở **Góc Dưới Bên Phải** (đối xứng ActionDock), vẫn hỗ trợ click mở hộp đen và phím tắt `~`.
