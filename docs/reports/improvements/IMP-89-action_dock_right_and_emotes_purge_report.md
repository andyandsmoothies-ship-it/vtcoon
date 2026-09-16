# Báo Cáo Cải Tiến IMP-89: Dời ActionDock Sang Góc Dưới Bên Phải & Loại Bỏ SocialEmotesTray

## 1. Tổng Quan & Mục Tiêu Kỹ Thuật
- **Mã Ticket**: `IMP-89`
- **Mục tiêu**:
  - Di dời thanh tác vụ người chơi (`ActionDock`) sang góc dưới bên phải màn hình (Bottom-Right) nhằm tối ưu công thái học (Fitts's Law) và tăng tính thuận tiện khi tương tác với các nút Đổ Xúc Xắc, Quản Lý BĐS, Đàm Phán, Hết Lượt.
  - Loại bỏ hoàn toàn khay biểu cảm cảm xúc (`SocialEmotesTray`) khỏi giao diện HUD trong trận đấu để tinh giản không gian thị giác, loại bỏ các icon thừa thãi gây phân tâm.
  - Bố trí lại huy hiệu `TelemetryBadge` sang góc dưới bên trái (Bottom-Left), đảm bảo 2 thành phần tách biệt qua `justify-between`, không chồng chéo với thẻ danh sách người chơi (`PlayerHudList`) hay thanh điều khiển đỉnh (`TopBar`).

---

## 2. Chi Tiết Thực Thi & Tệp Sửa Đổi
1. **[`src/client/ui/hud_container.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/hud_container.tsx)**:
   - Loại bỏ import `SocialEmotesTray`.
   - Loại bỏ khối JSX render `<SocialEmotesTray onSendEmote={onSendEmote} />`.
   - Đổi bố cục trong thẻ `<footer>`:
     - Khối trái (`justify-start`): `<div className="pointer-events-auto hidden sm:block"><TelemetryBadge /></div>`.
     - Khối phải (`justify-end`): `<div className="pointer-events-auto"><ActionDock ... /></div>`.
   - Giữ lại prop `onSendEmote?: (emoteId: string) => void;` trong `HudContainerProps` để bảo toàn tính tương thích ngược với `main.tsx`.

2. **[`tests/contracts/imp88_telemetry_badge_relocation.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp88_telemetry_badge_relocation.test.ts)**:
   - Cập nhật assertion `TC-IMP88.09`: Kiểm tra thứ tự DOM `actionDockIndex > badgeIndex` khi `ActionDock` được đưa sang góc dưới bên phải.

3. **[`tests/contracts/imp89_action_dock_right_and_emotes_purge.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp89_action_dock_right_and_emotes_purge.test.ts)**:
   - Bộ 16 atomic tests bao phủ 4 mặt (Universal 4-Facet Behavioral Matrix):
     - Facet 1 (Boundary): Loại bỏ 100% SocialEmotesTray khỏi HUD.
     - Facet 2 (Layout): Neo ActionDock ở góc dưới bên phải.
     - Facet 3 (Performance & Unobstructed): TelemetryBadge ở góc dưới bên trái, giữ màn hình thông thoáng.
     - Facet 4 (A11y & Defense): Bảo toàn 4 nút bấm cốt lõi và tiêu chuẩn min-h-[44px].

---

## 3. Kết Quả Kiểm Thử Vật Lý & Linter
- **Vitest Contract Tests**:
  - `tests/contracts/imp89_action_dock_right_and_emotes_purge.test.ts`: **16/16 PASS** (100%).
  - `tests/contracts/imp88_telemetry_badge_relocation.test.ts`: **16/16 PASS** (100%).
- **TypeScript Compiler Check**:
  - `npx tsc --noEmit`: **0 lỗi** (`Process finished with exit code 0`).
- **UI Linter Check**:
  - `npm run lint:ui`: **0 vi phạm** (Clean! 0 Anti-patterns detected across 137 files).

---

## 4. Kiến Thức Ghi Nhận (Gotchas)
- **Gotcha #119 [UI/LAYOUT]**: Khi dời thanh tác vụ `ActionDock` sang góc phải và giữ `TelemetryBadge` ở tầng đáy, luôn bọc `ActionDock` trong container riêng `pointer-events-auto` và để `footer` sử dụng `justify-between items-end`. Điều này đảm bảo Fitts's Law cho người thuận tay phải mà không làm che khuất các phần tử nổi phía trên.
