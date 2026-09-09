# Ticket UI-S02: Chuyển Động Quân Cờ Lò Xo & Xúc Xắc 3D Rơi Vật Lý

> **Epic:** 3D Visual & DOM UI/UX Overlay (Giai đoạn 2)  
> **Slice:** UI-02 (Thứ tự chuẩn theo Lộ trình)  
> **Ưu tiên:** P0 — Trực quan hóa vòng lặp vận động cốt lõi của trò chơi  
> **Trạng thái:** ✅ HOÀN THÀNH (474/474 Tests PASS)  
> **Phụ thuộc:** UI-01 (Sa Bàn 3D & Standee 2.5D) ✅ Đã hoàn tất 451/451 Tests  

---

## 1. Bối Cảnh & Vấn Đề Cần Giải Quyết

Ở Slice UI-01, sa bàn 40 ô khép kín chuẩn văn hóa Việt Nam và hệ thống tọa độ không gian `board_coords.ts` đã hoàn thành. Tuy nhiên:
- **Quân cờ (Pawn):** Vẫn là hình cầu tĩnh (`PlayerToken`), dịch chuyển tức thời khi vị trí thay đổi, thiếu sức sống và cảm giác nhịp điệu của một board game thực thụ.
- **Xúc xắc (Dice):** Chưa có hiển thị 3D trên bàn cờ. Khi FSM phát sự kiện `DICE_ROLLED`, người chơi chưa nhìn thấy hành động tung xúc xắc và kết quả trực quan.
- **Nợ kỹ thuật kế thừa từ UI-01 (`DEBT-UI01-01`):** Chưa có hệ thống nạp trước (preloading) bộ tài nguyên WebP 28 ô tài sản, dễ gây giật/chớp texture khi nâng cấp công trình sau này.

**Mục tiêu Slice UI-02:**
1. Quân cờ di chuyển theo từng ô bằng bước nhảy đàn hồi (Spring Animation) với quỹ đạo hình parabol (`tension: 170, friction: 12`), xử lý mượt mà khi đi qua góc và vòng qua ô GO (wrap-around 39 ➔ 0).
2. Khay lắc xúc xắc 3D đặt tại trung tâm sa bàn với 2 viên xúc xắc nảy rơi sống động, tự xoay về đúng các mặt số tương ứng với kết quả Server-authoritative từ FSM.
3. Mở rộng `game_store.ts` để quản lý trạng thái gieo xúc xắc (`dice`, `isRolling`) và tiến trình hoạt ảnh quân cờ (`activePawnAnimation`).
4. Xử lý triệt để nợ kỹ thuật `DEBT-UI01-01` với cơ chế `preloadTileAssets()` chuẩn hóa.

---

## 2. Use Case & Căn Cứ Kiến Trúc

| Căn cứ | Mục tham chiếu | Yêu cầu kỹ thuật |
|---|---|---|
| `ADR-0002` | §1 & §4 Spring Animation | `@react-spring/three` điều khiển bước nhảy lò xo `tension: 170, friction: 12` |
| `ADR-0002` | §3 Xúc xắc 3D | Mô phỏng xúc xắc rơi vào khay giữa sân sa bàn, khớp 100% kết quả FSM |
| `UC-GAME-011` | Đổ xúc xắc 2D6 | Hiển thị 2 viên xúc xắc, nhận diện đổ đôi (Doubles) |
| `UC-GAME-016` | Di chuyển quân cờ | Nhảy lần lượt từng ô theo chiều kim đồng hồ, tính đúng wrap-around |
| `_epic_ledger.md` | Tech Debt UI-01 | Thanh toán `DEBT-UI01-01` (Preload 28 bộ WebP asset) |

---

## 3. Phạm Vi Công Việc (Scope)

### 3.1 Cài Đặt Gói Bổ Trợ
- Cài đặt `@react-spring/three` (phiên bản tương thích React 19).

### 3.2 Các Tệp Tạo Mới (New Files)
1. `src/client/3d/pawn_animator.tsx` (≤ 150 LOC): Component quân cờ chuyển động lò xo parabol qua từng ô.
2. `src/client/3d/pawn_path.ts` (≤ 80 LOC): Hàm toán học thuần tính toán mảng tọa độ bước nhảy (waypoint traversal) từ `fromIndex` đến `toIndex` (hỗ trợ wrap-around 40 ô).
3. `src/client/3d/dice_tray.tsx` (≤ 160 LOC): Khay đổ xúc xắc 3D đặt tại tâm bàn cờ cùng 2 viên xúc xắc có chấm số 1–6, hiệu ứng nảy và xoay mặt số chuẩn xác.
4. `src/client/3d/dice_math.ts` (≤ 90 LOC): Tính toán góc quay Euler chuẩn `[rx, ry, rz]` để hiển thị chính xác mặt số 1..6 hướng lên trên camera Orthographic.
5. `src/client/assets/tile_assets.ts` (≤ 90 LOC): Manifest và hàm nạp trước `preloadTileAssets()` cho 28 ô x 4 cấp độ.
6. `tests/client/ui02_pawn_dice.test.ts` (≤ 180 LOC): Test suite kiểm thử logic thuần: bước nhảy, wrap-around, góc xúc xắc, store state, asset URLs.

### 3.3 Các Tệp Cập Nhật (Modify Files)
1. `src/client/store/game_store.ts`: Thêm `dice`, `isRolling`, `activePawnAnimation`, các setters và helper kích hoạt gieo xúc xắc/di chuyển.
2. `src/client/3d/board_layout.tsx`: Thêm `<DiceTray />` vào giữa sân sa bàn.
3. `src/client/game_canvas.tsx`: Thay thế `PlayerToken` tĩnh bằng `<PawnAnimator />`.
4. `docs/epics/client_ui/_epic_ledger.md`: Cập nhật trạng thái Slice UI-02 sang In-Progress và đóng `DEBT-UI01-01`.

---

## 4. Đặc Tả Kỹ Thuật Chi Tiết

### 4.1 Quỹ Đạo Parabol & Bước Nhảy Quân Cờ (`pawn_path.ts`)
- Mỗi bước nhảy từ ô $i$ sang ô $i+1$ được biểu diễn bởi:
  - Điểm đầu: $P_0 = \text{cellPosition}(i)$
  - Điểm cuối: $P_1 = \text{cellPosition}((i+1) \pmod{40})$
  - Điểm đỉnh nhảy ở giữa: $P_{\text{apex}} = \left[\frac{x_0+x_1}{2}, \text{jumpHeight}, \frac{z_0+z_1}{2}\right]$ với `jumpHeight = 0.8`.
- Hàm `calculatePathWaypoints(from: number, to: number): number[]`:
  - Trả về danh sách các ô trung gian theo chiều tăng dần $\pmod{40}$.
  - Ví dụ: `from: 38, to: 2` ➔ `[39, 0, 1, 2]`.

### 4.2 Góc Xoay Xúc Xắc Chuẩn Hóa (`dice_math.ts`)
- Lập phương 3D có 6 mặt với quy ước đối diện: 1 đối 6, 2 đối 5, 3 đối 4.
- Hàm `getDiceFaceRotation(value: 1..6): [number, number, number]` trả về góc Euler đưa mặt mong muốn hướng lên trục Y (+Y):
  - Mặt 1 (+Y): `[0, 0, 0]`
  - Mặt 6 (-Y): `[Math.PI, 0, 0]`
  - Mặt 2 (+Z): `[-Math.PI / 2, 0, 0]`
  - Mặt 5 (-Z): `[Math.PI / 2, 0, 0]`
  - Mặt 3 (+X): `[0, 0, Math.PI / 2]`
  - Mặt 4 (-X): `[0, 0, -Math.PI / 2]`

### 4.3 Khay Xúc Xắc & Hoạt Ảnh Rơi (`dice_tray.tsx`)
- Khay gỗ viền đồng kích thước $4 \times 4 \times 0.35$ đặt tại `[0, 0.05, 0]`.
- Hai viên xúc xắc màu ngà `#FFFDF0`, chấm đen/đỏ truyền thống, rơi từ $Y=3.5$ với vận tốc quay ngẫu nhiên trước khi dừng về góc Euler mục tiêu.

---

## 5. Hợp Đồng Kiểm Thử (Test Contracts)

| Mã TC | Kịch bản | Kết quả Kỳ vọng | Adversarial Inversion |
|---|---|---|---|
| `TC-UI02.1` | `calculatePathWaypoints(38, 2)` | Danh sách gồm đúng 4 bước `[39, 0, 1, 2]` | Bước đi lùi (negative steps) bị chặn hoặc phát hiện sai |
| `TC-UI02.2` | `getDiceFaceRotation(face)` cho 1..6 | Tất cả góc quay là số thực hữu hạn, 6 mặt có góc khác nhau | Mặt 1 và mặt 6 không được trùng góc quay |
| `TC-UI02.3` | `useGameStore` kích hoạt xúc xắc | `isRolling` chuyển `true`, cập nhật `dice: [d1, d2]` | Giá trị xúc xắc ngoài 1-6 bị chặn hoặc kẹp về ngưỡng hợp lệ |
| `TC-UI02.4` | `activePawnAnimation` trạng thái | Quản lý đúng người chơi đang di chuyển, không cho ghi đè khi đang chạy | Không thể gán `from === to` thành một animation hợp lệ |
| `TC-UI02.5` | `preloadTileAssets()` manifest | Sinh đủ 112 URLs chuẩn format `/assets/tiles/tile_{id}_lvl{level}.webp` | Thiếu ô hoặc cấp độ vượt quá 3 bị phát hiện |

---

## 6. Tiêu Chí Hoàn Thành (Definition of Done)
- [x] `@react-spring/three` được cài đặt thành công, không xung đột dependency.
- [x] 451 tests cũ giữ vững trạng thái PASS 100% (Zero Regression).
- [x] Thêm mới tối thiểu 15-20 unit tests logic trong `tests/client/ui02_pawn_dice.test.ts` (23 tests mới, tổng 474 tests).
- [x] `npx tsc --noEmit` hoàn thành với 0 lỗi.
- [x] Mỗi tệp mới hoặc sửa đổi tuân thủ nghiêm ngặt ngân sách ≤ 150-200 LOC.
- [x] Xác minh Visual Smoke Gate trên trình duyệt.
