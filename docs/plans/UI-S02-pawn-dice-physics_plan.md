# Kế Hoạch Thi Công (Task DAG): Slice UI-02 — Pawn Spring & Xúc Xắc 3D Rơi Vật Lý

> **Ticket:** `issues/UI-S02-pawn-dice-physics.md`  
> **Căn cứ:** `docs/domain/adr/ADR-0002-r3f-rendering.md` (§3 Rapier Physics & §4 Spring Animation)  
> **Ràng buộc:** Ngân sách mỗi tệp ≤ 150–200 LOC, Zero Regression (giữ vững 451 tests), TypeScript Strict Mode.

---

## 1. Sơ Đồ Kiến Trúc Luồng & Phụ Thuộc (DAG)

```
                       ┌────────────────────────────┐
                       │  T1: Cài đặt package        │
                       │  @react-spring/three       │
                       └─────────────┬──────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
┌──────────────────┐       ┌──────────────────┐        ┌──────────────────┐
│ T2: Asset Loader │       │ T3: Pure Math    │        │ T4: Pure Math    │
│ tile_assets.ts   │       │ pawn_path.ts     │        │ dice_math.ts     │
│ (Trả nợ DEBT-01) │       │ (Waypoints/Arc)  │        │ (Euler Faces)    │
└──────────────────┘       └─────────┬────────┘        └─────────┬────────┘
                                     │                           │
                                     ▼                           ▼
                           ┌──────────────────────────────────────────────┐
                           │ T5: Store Expansion                          │
                           │ src/client/store/game_store.ts               │
                           │ (dice, isRolling, activePawnAnimation)       │
                           └──────────────────────┬───────────────────────┘
                                                  │
                                 ┌────────────────┴────────────────┐
                                 ▼                                 ▼
                    ┌────────────────────────┐        ┌────────────────────────┐
                    │ T6: Component Xúc Xắc  │        │ T7: Component Quân Cờ  │
                    │ dice_tray.tsx (3D Khay)│        │ pawn_animator.tsx      │
                    └────────────┬───────────┘        └────────────┬───────────┘
                                 │                                 │
                                 └────────────────┬────────────────┘
                                                  ▼
                                    ┌───────────────────────────┐
                                    │ T8: Tích Hợp Sa Bàn       │
                                    │ board_layout.tsx & Canvas │
                                    └─────────────┬─────────────┘
                                                  ▼
                                    ┌───────────────────────────┐
                                    │ T9: Bộ Kiểm Thử Logic     │
                                    │ ui02_pawn_dice.test.ts    │
                                    └─────────────┬─────────────┘
                                                  ▼
                                    ┌───────────────────────────┐
                                    │ T10: Verification Gate    │
                                    │ tsc + 451+ Tests + Ledger │
                                    └───────────────────────────┘
```

---

## 2. Chi Tiết Từng Micro-Task Trong DAG

### Task T1: Cài Đặt Thư Viện `@react-spring/three`
- **Mục tiêu:** Bổ sung gói animation lò xo cho Three.js tương thích React 19.
- **Lệnh thực thi:** `cmd /c "npm install @react-spring/three"`
- **Tiêu chuẩn nghiệm thu:** `package.json` ghi nhận `@react-spring/three`, `npm test` vẫn chạy mượt mà.

### Task T2: Thanh Toán Nợ Kỹ Thuật `DEBT-UI01-01` (`src/client/assets/tile_assets.ts`) [NEW, ~60 LOC]
- **Mục tiêu:** Quản lý tập trung quy chuẩn đường dẫn tài nguyên WebP 512x512 của 28 ô x 4 cấp độ và hàm nạp trước `preloadTileAssets()`.
- **Cấu trúc:**
  ```typescript
  export function getTileAssetUrl(tileIndex: number, level: 0 | 1 | 2 | 3): string;
  export function getAllTileAssetUrls(): string[];
  export function preloadTileAssets(): void;
  ```
- **Ngân sách:** ≤ 80 LOC. Không chứa React component hay Three.js dependency.

### Task T3: Hàm Tính Quỹ Đạo Bước Nhảy Quân Cờ (`src/client/3d/pawn_path.ts`) [NEW, ~70 LOC]
- **Mục tiêu:** Tính toán mảng các ô trung gian khi người chơi di chuyển (hỗ trợ wrap-around qua ô 0) và cung parabol nhảy.
- **Cấu trúc:**
  ```typescript
  export function calculatePathWaypoints(fromIndex: number, toIndex: number): number[];
  export function getParabolicHeight(progress: number, maxArc?: number): number;
  export function interpolatePawnPosition(
    fromIndex: number,
    toIndex: number,
    progress: number,
    arcHeight?: number
  ): [number, number, number];
  ```
- **Ngân sách:** ≤ 90 LOC. Hoàn toàn là hàm toán học thuần túy (Pure Math).

### Task T4: Hàm Góc Quay Xúc Xắc Chuẩn Hóa (`src/client/3d/dice_math.ts`) [NEW, ~80 LOC]
- **Mục tiêu:** Ánh xạ từ điểm số 1..6 sang góc xoay Euler `[x, y, z]` để mặt số tương ứng luôn hướng thẳng đứng lên trục Y (+Y) về phía camera.
- **Cấu trúc:**
  ```typescript
  export type DiceFace = 1 | 2 | 3 | 4 | 5 | 6;
  export function getDiceFaceRotation(face: DiceFace): [number, number, number];
  export function isValidDiceFace(val: number): val is DiceFace;
  ```
- **Ngân sách:** ≤ 90 LOC. Pure function, zero side effects.

### Task T5: Mở Rộng Store Trạng Thái (`src/client/store/game_store.ts`) [MODIFY, ~55 LOC]
- **Mục tiêu:** Quản lý vòng đời gieo xúc xắc và di chuyển quân cờ.
- **Trường dữ liệu bổ sung:**
  ```typescript
  dice: [number, number];
  isRolling: boolean;
  activePawnAnimation: {
    playerId: string;
    waypoints: number[];
    currentIndex: number;
    isAnimating: boolean;
  } | null;
  ```
- **Actions:**
  - `setDice: (dice: [number, number]) => void`
  - `setIsRolling: (isRolling: boolean) => void`
  - `triggerDiceRoll: (dice: [number, number]) => void`
  - `startPawnMove: (playerId: string, targetCell: number) => void`
  - `completePawnMove: (playerId: string) => void`
- **Ngân sách:** ≤ 80 LOC.

### Task T6: Component Khay & Xúc Xắc 3D (`src/client/3d/dice_tray.tsx`) [NEW, ~140 LOC]
- **Mục tiêu:** Render khay gỗ viền đồng ở trung tâm sa bàn (`[0, 0.05, 0]`) và 2 viên xúc xắc có chấm số 3D.
- **Hiệu ứng:** Khi `isRolling === true`, xúc xắc nảy rơi từ độ cao Y=3.5 xuống đáy khay, xoay ngẫu nhiên và ổn định ở góc Euler mục tiêu tương ứng `dice[0]` và `dice[1]`.
- **Ngân sách:** ≤ 160 LOC.

### Task T7: Component Quân Cờ Nhảy Lò Xo (`src/client/3d/pawn_animator.tsx`) [NEW, ~130 LOC]
- **Mục tiêu:** Thay thế quả cầu tĩnh bằng hoạt ảnh quân cờ nảy từng ô theo lò xo (`tension: 170, friction: 12`), nâng hạ độ cao theo hàm parabol `getParabolicHeight`.
- **Ngân sách:** ≤ 150 LOC.

### Task T8: Tích Hợp Lên Sa Bàn & Viewport Canvas [MODIFY]
- `src/client/3d/board_layout.tsx`: Gắn `<DiceTray />` vào giữa sàn bàn cờ.
- `src/client/game_canvas.tsx`: Dùng `<PawnAnimator />` thay thế cho token tĩnh, giữ vững re-export shim `cellPosition`.

### Task T9: Bộ Kiểm Thử Logic Thuần (`tests/client/ui02_pawn_dice.test.ts`) [NEW, ~140 LOC]
- **Mục tiêu:** 15–20 tests kiểm thử toàn diện các hợp đồng:
  - `TC-UI02.1`: `calculatePathWaypoints` tính đúng bước nhảy qua góc và wrap-around (VD: 38 ➔ 2).
  - `TC-UI02.2`: `getDiceFaceRotation` trả về 6 góc Euler phân biệt cho 6 mặt.
  - `TC-UI02.3`: `useGameStore` chuyển đổi trạng thái `isRolling` và `dice`.
  - `TC-UI02.4`: `activePawnAnimation` ngăn chặn ghi đè khi đang chạy hoạt ảnh.
  - `TC-UI02.5`: `preloadTileAssets` sinh đúng 112 URLs chuẩn format.
  - **Adversarial Inversions:** Thử nghiệm với các giá trị biên âm, vượt quá 39, và xúc xắc không hợp lệ.

### Task T10: Đóng Gói, Kiểm Thử Toàn Cục & Cập Nhật Sổ Cái
- Chạy `npx tsc --noEmit` chứng minh 0 lỗi compile.
- Chạy `npm test` chứng minh toàn bộ 451 tests cũ + tests mới UI-02 đều PASS (Dự kiến: ≥ 470 tests).
- Cập nhật `docs/epics/client_ui/_epic_ledger.md`: Đánh dấu `UI-02` hoàn thành và xác nhận đóng `DEBT-UI01-01`.

---

## 3. Kế Hoạch Kiểm Chứng Visual Smoke Gate

1. Chạy `npm run dev` để khởi động Vite dev server trên cổng 5173.
2. Kiểm tra trực quan:
   - Khay xúc xắc xuất hiện trang trọng ở giữa bàn cờ.
   - Thử nghiệm kích hoạt trạng thái gieo xúc xắc: 2 viên xúc xắc nảy rơi và dừng lại ngay ngắn.
   - Quân cờ nảy lò xo hình vòng cung parabol qua từng ô thay vì dịch chuyển tức thời.
