# Kế Hoạch Cải Tiến IMP-89: Dời ActionDock Sang Góc Dưới Bên Phải & Loại Bỏ SocialEmotesTray

## 1. Bối Cảnh & Vấn Đề
- Người dùng yêu cầu trong trận đấu:
  > "thanh này nên dời qua góc phải và bỏ hết phần icon emotion"
  > (Kèm ảnh chụp màn hình hiển thị thanh `ActionDock` nằm bên trái cạnh khay biểu cảm `SocialEmotesTray`).
- **Phân tích công thái học (Ergonomics)**:
  - Hiện tại, thanh `ActionDock` đặt ở góc dưới bên trái cùng `SocialEmotesTray`.
  - Khay biểu cảm cảm xúc (emotes 😂😭💸❤️😡) gây rối mắt, chiếm diện tích và không thuộc luồng tác vụ cốt lõi trong gameplay bàn cờ tài chính.
  - Người dùng mong muốn dời `ActionDock` sang góc dưới bên phải (Bottom-Right) để thuận tay thao tác (Fitts's Law) và loại bỏ hoàn toàn `SocialEmotesTray` khỏi giao diện HUD trong trận.

```
[BỐ CỤC CŨ]:
+-------------------------------------------------------------------+
| [Vòng 1/30 | ⏱️ 25s | 🏦 500 Tr.]          [🌤️ Auto | 🔊 | 📜]   |
|                                            [Thẻ Người Chơi]       |
|                                                                   |
| [ActionDock] [SocialEmotesTray]                 [TelemetryBadge]  |
+-------------------------------------------------------------------+

[BỐ CỤC MỚI IMP-89]:
+-------------------------------------------------------------------+
| [Vòng 1/30 | ⏱️ 25s | 🏦 500 Tr.]          [🌤️ Auto | 🔊 | 📜]   |
|                                            [Thẻ Người Chơi]       |
|                                                                   |
| [TelemetryBadge (hidden sm:block)]                   [ActionDock] |
+-------------------------------------------------------------------+
```

---

## 2. Phạm Vi Thực Hiện (Blast Radius Audit)
- **Cấp độ rủi ro**: Slice-Bound (UI Layout & Components).
- **Tệp trực tiếp sửa đổi**:
  - `src/client/ui/hud_container.tsx`:
    - Loại bỏ import `SocialEmotesTray`.
    - Loại bỏ render `<SocialEmotesTray onSendEmote={onSendEmote} />`.
    - Đảo vị trí trong thẻ `<footer>`:
      - Khối bên trái: `<div className="pointer-events-auto hidden sm:block"><TelemetryBadge /></div>`.
      - Khối bên phải: `<div className="pointer-events-auto"><ActionDock ... /></div>`.
  - `tests/contracts/imp88_telemetry_badge_relocation.test.ts`:
    - Cập nhật test `TC-IMP88.09` để phản ánh thứ tự mới (ActionDock nằm sau TelemetryBadge theo chiều ngang từ trái sang phải).
  - `tests/contracts/imp89_action_dock_right_and_emotes_purge.test.ts`:
    - Bộ 16 atomic tests kiểm định 4 mặt (Boundary, Layout, Unobstructed, Defense).

---

## 3. Quy Trình 3 Trạm (3-Station Pipeline)
1. **Trạm 1 (RED Contract Test)**: Đã hoàn tất 16 tests tại `tests/contracts/imp89_action_dock_right_and_emotes_purge.test.ts` (5 tests RED xác nhận trạng thái thất bại ban đầu).
2. **Trạm 2 (GREEN Implementation)**:
   - Sửa `src/client/ui/hud_container.tsx`.
   - Cập nhật assertion `TC-IMP88.09` trong `tests/contracts/imp88_telemetry_badge_relocation.test.ts`.
   - Chạy Vitest kiểm tra 100% tests PASS.
   - Chạy `npx tsc --noEmit` và `npm run lint:ui` đạt 0 lỗi.
3. **Trạm 3 (Độc Lập Đọc & Thẩm Định Đĩa Vật Lý)**:
   - Điều động `spec-reviewer` và `code-reviewer` kiểm tra đĩa vật lý và ra phán quyết.
