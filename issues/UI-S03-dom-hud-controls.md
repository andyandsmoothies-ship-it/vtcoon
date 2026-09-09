# Ticket UI-S03: DOM HUD Tài Chính & Bảng Điều Khiển Tương Tác Người Chơi

> **Epic:** 3D Visual & DOM UI/UX Overlay (Giai đoạn 2)  
> **Slice:** UI-03 (Thứ tự chuẩn theo Lộ trình)  
> **Ưu tiên:** P0 — Lớp giao diện người dùng trực quan điều khiển ván đấu  
> **Trạng thái:** ✅ ĐÃ HOÀN THÀNH (497/497 Tests PASS)  
> **Phụ thuộc:** UI-01 (Sa bàn 3D) & UI-02 (Pawn Spring & Dice 3D) ✅ Đã hoàn tất 474/474 Tests  

---

## 1. Bối Cảnh & Vấn Đề Cần Giải Quyết

Qua Slice UI-01 và UI-02, sa bàn 3D 40 ô khép kín, hoạt ảnh quân cờ lò xo parabol và khay xúc xắc 3D đã hoàn thành với 474 tests xanh 100%. Tuy nhiên:
- **Thiếu lớp hiển thị dữ liệu nghiệp vụ (HUD):** Người chơi chưa thể theo dõi số dư tiền mặt, tổng tài sản ròng (Net Worth), danh sách bất động sản sở hữu, hay ai đang đến lượt chơi.
- **Thiếu bảng điều khiển thao tác (Action Controls):** Người chơi chưa có các nút bấm DOM để gieo xúc xắc, quản lý tài sản, đàm phán P2P, hoặc kết thúc lượt.
- **Kiến trúc Hybrid 2 lớp (ADR-0002 §2):** Cần tách bạch tuyệt đối giữa Lớp 1 (WebGL Canvas Z-0) và Lớp 2 (HTML5/DOM Overlay Z-10). Ràng buộc nghiêm ngặt về `pointer-events` để không làm nghẽn tương tác xoay/pan/zoom sa bàn 3D bên dưới.

**Mục tiêu Slice UI-03:**
1. Cài đặt và cấu hình Tailwind CSS cho giao diện DOM hiện đại, chuẩn token thiết kế bản địa (`docs/domain/design.md`).
2. Xây dựng **Top Bar**: Thời gian đếm ngược lượt chơi, số vòng đấu, quỹ Kho Bạc (Treasury).
3. Xây dựng **Player HUD Cards**: Thẻ thông tin người chơi (Avatar, Tiền mặt, Net Worth, chấm màu nhóm đất sở hữu, huy hiệu trạng thái Kiểm Toán / Nợ).
4. Xây dựng **Action Dock**: Thanh công cụ cố định đáy màn hình (Nút Đổ Xúc Xắc nổi bật, Nâng cấp/Quản lý, Đàm phán, Kết thúc lượt).
5. Đảm bảo triệt để quy tắc **Pointer-Events Integrity**: Root container là `pointer-events-none`; chỉ các phần tử tương tác (cards, buttons, docks) mới kích hoạt `pointer-events-auto`.
6. Mở rộng `game_store.ts` với đầy đủ thông tin hiển thị tài chính và lượt chơi.

---

## 2. Use Case & Căn Cứ Kiến Trúc

| Căn cứ | Mục tham chiếu | Yêu cầu kỹ thuật |
|---|---|---|
| `ADR-0002` | §2 Hybrid Layout (Canvas vs DOM) | DOM UI Overlay Z-Index: 10, Tailwind CSS, giao tiếp qua Zustand Store |
| `ADR-0002` | §2 Tương tác thao tác | Các nút "Đổ xúc xắc", "Nâng cấp", "Thế chấp", "Đàm phán" |
| `UC-GAME-002` | Thông tin người chơi | Hiển thị tên, avatar, tiền mặt, danh sách tài sản, net worth |
| `UC-GAME-012` | Lượt chơi & Đồng hồ đếm ngược | Đếm ngược 60s mỗi lượt, highlight người chơi đang có lượt |
| `design.md` | Hệ màu sắc & Typography | Màu bản địa 8 nhóm đất, tối giản phẳng, không trang trí rườm rà |

---

## 3. Phạm Vi Công Việc (Scope)

### 3.1 Cài Đặt & Cấu Hình Tailwind CSS
- Cài đặt `tailwindcss` và `@tailwindcss/vite` (phiên bản tương thích Vite 6).
- Cấu hình plugin trong `vite.config.ts`.
- Tạo `src/client/index.css` với `@import "tailwindcss";` và import vào `src/client/main.tsx`.

### 3.2 Các Tệp Tạo Mới (New Files)
1. `src/client/ui/hud_container.tsx` (≤ 90 LOC): Container gốc của lớp DOM Overlay, cố định `fixed inset-0 pointer-events-none z-10`.
2. `src/client/ui/top_bar.tsx` (≤ 120 LOC): Thanh thông tin đỉnh màn hình (Vòng đấu, Thời gian đếm ngược, Quỹ Kho Bạc).
3. `src/client/ui/player_card.tsx` (≤ 140 LOC): Thẻ thông tin cá nhân của một người chơi (Avatar, Tiền mặt, Net Worth, BĐS).
4. `src/client/ui/player_hud_list.tsx` (≤ 90 LOC): Bố cục danh sách các thẻ người chơi (xếp gọn góc trên trái/phải).
5. `src/client/ui/action_dock.tsx` (≤ 130 LOC): Thanh hành động trung tâm đáy màn hình với các nút CTA trực quan.
6. `src/client/ui/ui_helpers.ts` (≤ 80 LOC): Hàm tiện ích thuần format tiền tệ ("12.500 Tr. VNĐ"), format thời gian ("00:45").
7. `tests/client/ui03_dom_hud.test.ts` (≤ 180 LOC): Test suite kiểm thử logic format tiền, trạng thái store HUD, đếm ngược lượt, phân loại Net Worth.

### 3.3 Các Tệp Cập Nhật (Modify Files)
1. `src/client/store/game_store.ts`: Mở rộng state (`playersInfo`, `currentTurnPlayerId`, `turnTimeRemaining`, `treasuryPool`, `roundInfo`) và actions liên quan.
2. `src/client/main.tsx`: Bọc `GameCanvas` bên dưới và `HudContainer` bên trên trong layout hybrid.
3. `docs/epics/client_ui/_epic_ledger.md`: Đánh dấu tiến độ Slice UI-03.

---

## 4. Đặc Tả Thiết Kế Chi Tiết

### 4.1 Bố Cục Phân Tầng Z-Index (Hybrid Viewport)
```
┌─────────────────────────────────────────────────────────────┐
│ DOM OVERLAY (z-index: 10, pointer-events-none)              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Top Bar: Vòng 3/30 | ⏱️ 00:45 | 🏦 Kho Bạc: 2.000 Tr.   │ │  (pointer-events-auto)
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌──────────────────────┐                                    │
│ │ Player HUD Cards     │                                    │  (pointer-events-auto)
│ │ [P1] 🟢 12.500 Tr.   │                                    │
│ │ [P2] ⚪  8.200 Tr.   │                                    │
│ └──────────────────────┘                                    │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Action Dock: [ 🎲 Đổ Xúc Xắc ] [ 🏛️ Tài Sản ] [ 🤝 Đàm Phán ] │ │  (pointer-events-auto)
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ WEBGL CANVAS (z-index: 0, R3F Sa bàn 40 ô + Xúc xắc 3D)    │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Ràng Buộc Pointer-Events (Chống Kẹt Chuột 3D)
- Container `HudContainer`: `pointer-events-none` tuyệt đối. Khi người chơi rê chuột vào các khoảng trống, sự kiện chuột/touch xuyên thẳng xuống Canvas R3F để xoay, pan hoặc zoom sa bàn mượt mà.
- Các component con (`TopBar`, `PlayerCard`, `ActionDock`): `pointer-events-auto`. Các click vào nút hay card sẽ được bắt trọn vẹn bởi DOM UI.

### 4.3 Format Tiền Tệ Chuẩn Bản Địa (`ui_helpers.ts`)
- Quy ước thống nhất theo `docs/requirements.md`: Đơn vị triệu đồng (`Tr. VNĐ`).
- Số dương: `12.500 Tr.`
- Số âm (nợ): `-1.200 Tr.` (chữ đỏ `text-rose-400`).
- Net Worth = Tiền mặt + Giá niêm yết các BĐS sở hữu + 50% chi phí công trình đã nâng cấp.

---

## 5. Hợp Đồng Kiểm Thử (Test Contracts)

| Mã TC | Kịch bản | Kết quả Kỳ vọng | Adversarial Inversion |
|---|---|---|---|
| `TC-UI03.1` | `formatCurrency(amount)` | Số nguyên được format phân tách hàng nghìn chuẩn tiếng Việt (12500 -> "12.500 Tr.") | Số âm được gắn dấu trừ chuẩn xác; giá trị NaN/vô hạn bị chặn |
| `TC-UI03.2` | `formatTimeRemaining(seconds)` | Đổi giây sang `MM:SS` (45 -> "00:45", 75 -> "01:15") | Giây âm tự động kẹp về "00:00" |
| `TC-UI03.3` | `calculatePlayerNetWorth(...)` | Tổng hợp đúng tiền mặt + giá đất + 50% chi phí nâng cấp | BĐS đã thế chấp chỉ tính 50% giá niêm yết |
| `TC-UI03.4` | `useGameStore` HUD state | Cập nhật `currentTurnPlayerId`, `turnTimeRemaining`, `playersInfo` phản ánh tức thì | Lượt không thể gán cho playerId không tồn tại |
| `TC-UI03.5` | Action button states | Nút "Đổ xúc xắc" disable khi `isRolling === true` hoặc không phải lượt của mình | Không thể kích hoạt gieo xúc xắc khi đang trong hoạt ảnh di chuyển |

---

## 6. Tiêu Chí Hoàn Thành (Definition of Done)
- [x] Tailwind CSS được cài đặt và cấu hình thành công với Vite.
- [x] 474 tests cũ giữ vững 100% PASS (Zero Regression, hiện tại: 497 tests PASS).
- [x] Bổ sung 15-20 unit tests logic trong `tests/client/ui03_dom_hud.test.ts` (23 tests PASS).
- [x] `npx tsc --noEmit` hoàn thành với 0 lỗi.
- [x] Ngân sách mỗi file ≤ 150-200 LOC, Cyclomatic Complexity ≤ 5.
- [x] Kiểm chứng tương tác Visual Smoke Gate trên trình duyệt.
