# Kế Hoạch Thi Công (Task DAG): Slice UI-03 — DOM HUD Tài Chính & Bảng Điều Khiển

> **Ticket:** `issues/UI-S03-dom-hud-controls.md`  
> **Căn cứ:** `ADR-0002` (§2 Hybrid Canvas vs DOM Overlay) · `docs/domain/design.md`  
> **Ràng buộc:** Ngân sách mỗi tệp ≤ 150–200 LOC, Zero Regression (giữ vững 474 tests), TypeScript Strict Mode.

---

## 1. Sơ Đồ Kiến Trúc Luồng & Phụ Thuộc (DAG 1 Chiều)

```
                       ┌────────────────────────────────────────┐
                       │  T1: Cài đặt & Cấu hình Tailwind CSS   │
                       │  @tailwindcss/vite + index.css         │
                       └───────────────────┬────────────────────┘
                                           │
         ┌─────────────────────────────────┴─────────────────────────────────┐
         ▼                                                                   ▼
┌───────────────────────────────┐                   ┌────────────────────────────────────────┐
│ T2: Tiện Ích Format Thuần     │                   │ T3: Mở Rộng Zustand Store              │
│ src/client/ui/ui_helpers.ts   │                   │ src/client/store/game_store.ts         │
│ (formatCurrency, Net Worth)   │                   │ (playersInfo, turn, timer, treasury)   │
└───────────────┬───────────────┘                   └───────────────────┬────────────────────┘
                │                                                       │
                ├───────────────────────────────────┬───────────────────┤
                ▼                                   ▼                   ▼
     ┌──────────────────────┐            ┌──────────────────────┐  ┌──────────────────────┐
     │ T4: Top Bar          │            │ T5: Player HUD Cards │  │ T6: Action Dock      │
     │ top_bar.tsx          │            │ player_card.tsx      │  │ action_dock.tsx      │
     │ (Timer, Treasury)    │            │ player_hud_list.tsx  │  │ (Roll, Trade, End)   │
     └──────────┬───────────┘            └──────────┬───────────┘  └──────────┬───────────┘
                │                                   │                         │
                └───────────────────┬───────────────┴─────────────────────────┘
                                    ▼
                      ┌───────────────────────────┐
                      │ T7: Root HUD Container    │
                      │ hud_container.tsx         │
                      │ (pointer-events-none root)│
                      └─────────────┬─────────────┘
                                    ▼
                      ┌───────────────────────────┐
                      │ T8: Tích Hợp Viewport     │
                      │ src/client/main.tsx       │
                      │ (Z-0 Canvas + Z-10 HUD)   │
                      └─────────────┬─────────────┘
                                    ▼
                      ┌───────────────────────────┐
                      │ T9: Bộ Kiểm Thử Logic     │
                      │ ui03_dom_hud.test.ts      │
                      └─────────────┬─────────────┘
                                    ▼
                      ┌───────────────────────────┐
                      │ T10: Verification Gate    │
                      │ tsc + 474+ Tests + Ledger │
                      └───────────────────────────┘
```

---

## 2. Chi Tiết Từng Micro-Task Trong DAG

### Task T1: Cài Đặt & Cấu Hình Tailwind CSS (Vite 6)
- **Mục tiêu:** Cài đặt `@tailwindcss/vite` và `tailwindcss` v4 cho hệ sinh thái Vite 6.
- **Thực thi:**
  - `cmd /c "npm install -D tailwindcss @tailwindcss/vite"`
  - Cập nhật `vite.config.ts`: Thêm import `tailwindcss from '@tailwindcss/vite'` và đưa vào `plugins: [tailwindcss(), react()]`.
  - Tạo `src/client/index.css` với nội dung `@import "tailwindcss";`.
  - Import `./index.css` vào `src/client/main.tsx`.

### Task T2: Tiện Ích Format Thuần Túy (`src/client/ui/ui_helpers.ts`) [NEW, ~70 LOC]
- **Mục tiêu:** Hàm toán học và chuỗi thuần túy phục vụ hiển thị tài chính và thời gian.
- **Cấu trúc:**
  ```typescript
  export function formatCurrency(amount: number): string; // "12.500 Tr." hoặc "-1.200 Tr."
  export function formatTimeRemaining(seconds: number): string; // "00:45"
  export function calculatePlayerNetWorth(
    cash: number,
    ownedCellIndices: readonly number[],
    levelMap: Record<number, 0 | 1 | 2 | 3>
  ): number;
  ```
- **Ngân sách:** ≤ 80 LOC. Zero UI dependency, kiểm thử 100% bằng unit tests.

### Task T3: Mở Rộng Zustand Store (`src/client/store/game_store.ts`) [MODIFY, ~150 LOC]
- **Mục tiêu:** Bổ sung state phục vụ hiển thị DOM HUD:
  - `playersInfo: Record<string, PlayerHudInfo>`
  - `currentTurnPlayerId: string | null`
  - `turnTimeRemaining: number` (đếm ngược 60s)
  - `treasuryPool: number` (tiền tích lũy Kho Bạc)
  - `roundNumber: number` & `maxRounds: number`
- **Actions:** `setPlayersInfo`, `setCurrentTurnPlayerId`, `setTurnTimeRemaining`, `setTreasuryPool`, `decrementTurnTimer`.
- **Ngân sách:** ≤ 160 LOC.

### Task T4: Thanh Thông Tin Đỉnh (`src/client/ui/top_bar.tsx`) [NEW, ~110 LOC]
- **Mục tiêu:** Hiển thị thời gian vòng đấu, quỹ Kho Bạc và trạng thái lượt chơi.
- **Thiết kế:** Glassmorphism (`bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl px-6 py-2`), `pointer-events-auto`.
  - Đồng hồ đếm ngược có hiệu ứng chữ đỏ cảnh báo khi còn dưới 10 giây.
  - Quỹ Kho Bạc biểu tượng `🏦 Kho Bạc: {formatCurrency(treasuryPool)}`.
- **Ngân sách:** ≤ 120 LOC.

### Task T5: Thẻ Thông Tin Người Chơi (`player_card.tsx` & `player_hud_list.tsx`) [NEW, ~180 LOC tổng]
- **`player_card.tsx` (≤ 120 LOC):** Thẻ cá nhân hiển thị:
  - Avatar hình tròn mang màu token tương ứng của người chơi.
  - Tên người chơi, số dư tiền mặt (`text-emerald-400` hoặc `text-rose-400`), tổng tài sản Net Worth.
  - Vòng viền vàng phát sáng khi đang đến lượt của người chơi (`ring-2 ring-amber-400 animate-pulse`).
  - Hàng chấm tròn nhỏ thể hiện các nhóm màu đất đang sở hữu.
- **`player_hud_list.tsx` (≤ 70 LOC):** Căn góc trên bên trái, xếp dọc các `PlayerCard` có `pointer-events-auto`.

### Task T6: Thanh Điều Khiển Tác Vụ (`src/client/ui/action_dock.tsx`) [NEW, ~120 LOC]
- **Mục tiêu:** Action Dock trung tâm dưới đáy màn hình (`bottom-4 left-1/2 -translate-x-1/2`).
- **Nút bấm:**
  - **"Đổ Xúc Xắc":** Nút chính Gradient Emerald (`bg-gradient-to-r from-emerald-600 to-teal-600`), icon xúc xắc. Disable khi `isRolling` hoặc không phải lượt mình.
  - **"Tài Sản":** Quản lý thế chấp / nâng cấp.
  - **"Đàm Phán":** Mở giao dịch P2P.
  - **"Kết Thúc Lượt":** Chuyển lượt khi đã hoàn tất các thao tác.
- **Ngân sách:** ≤ 130 LOC.

### Task T7: Root HUD Container (`src/client/ui/hud_container.tsx`) [NEW, ~60 LOC]
- **Mục tiêu:** Container cấp cao nhất của lớp DOM.
- **Thiết lập:** `fixed inset-0 pointer-events-none z-10 select-none flex flex-col justify-between p-4`.
- **Ngân sách:** ≤ 70 LOC.

### Task T8: Tích Hợp Viewport 2 Lớp (`src/client/main.tsx`) [MODIFY, ~35 LOC]
- **Mục tiêu:** Render song song `<GameCanvas />` ở tầng Z-0 và `<HudContainer />` ở tầng Z-10.
- **Ngân sách:** ≤ 40 LOC.

### Task T9: Bộ Kiểm Thử Logic Thuần (`tests/client/ui03_dom_hud.test.ts`) [NEW, ~150 LOC]
- **Mục tiêu:** 15–20 tests kiểm thử:
  - `TC-UI03.1`: Format tiền tệ chính xác các trường hợp dương, âm, 0, số lớn.
  - `TC-UI03.2`: Format thời gian đếm ngược và phòng thủ giá trị âm.
  - `TC-UI03.3`: Tính toán Net Worth kết hợp tiền mặt, giá đất và công trình nâng cấp.
  - `TC-UI03.4`: Store HUD transitions và các action cập nhật trạng thái ván đấu.
  - `TC-UI03.5`: Adversarial Inversion cho các trường hợp ngoại lệ.

### Task T10: Đóng Gói, Verification Gate & Cập Nhật Sổ Cái
- Chạy `npx tsc --noEmit` kiểm tra kiểu dữ liệu (0 errors).
- Chạy `npm test` chứng minh toàn bộ 474 tests cũ + tests mới UI-03 đều PASS (Dự kiến: ≥ 490 tests).
- Chạy `npm run build` xác nhận Vite đóng gói thành công.
- Cập nhật `docs/epics/client_ui/_epic_ledger.md` cho Slice UI-03.

---

## 3. Kế Hoạch Kiểm Chứng Visual Smoke Gate

1. Khởi động dev server: `cmd /c "npm run dev"`.
2. Mở trình duyệt tại `http://localhost:5173`.
3. Kiểm tra các tiêu chí:
   - **Xuyên thấu chuột (Pointer-Events):** Rê chuột vào khoảng trống màn hình và kéo chuột trái: Sa bàn 3D vẫn pan/zoom mượt mà.
   - **Tương tác DOM:** Click vào các nút trên Action Dock và Player Card: Bắt sự kiện click chính xác, không làm xoay sa bàn bên dưới.
   - **Giao diện:** Top Bar, Player Cards và Action Dock hiển thị đẹp mắt, sắc nét theo đúng bảng màu Tailwind.
