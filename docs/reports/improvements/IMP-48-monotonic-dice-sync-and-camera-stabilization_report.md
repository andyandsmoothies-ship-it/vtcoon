# [IMP-48] Báo Cáo Nghiệm Thu Triệt Tiêu Kích Hoạt Lại Xúc Xắc Dư Thừa & Ổn Định Góc Nhìn Khi Mua Nhà (Monotonic Dice Sync & Camera Stabilization)

## 1. TỔNG QUAN KẾT QUẢ THỰC HIỆN

| Chỉ số / Tiêu chí | Mục tiêu / Đặc tả kỹ thuật | Kết quả thực tế | Trạng thái |
| :--- | :--- | :--- | :---: |
| **Lọc trùng lặp xúc xắc chuỗi đơn điệu** | `syncDiceRoll` chỉ kích hoạt khi `delta.diceSeq > lastDiceSeq` | Triệt tiêu 100% việc gọi lại `triggerDiceRoll` khi mua nhà / nâng cấp / thế chấp | ✔️ ĐẠT |
| **Ổn định cờ `isRolling`** | Gói tin Delta mua nhà giữ nguyên `isRolling = false` | `isRolling` duy trì `false`, khay xúc xắc không reset lò xo hay phát lại SFX | ✔️ ĐẠT |
| **Bảo toàn góc nhìn Camera** | Camera duy trì `tile_focus` tại ô nhà vừa mua | Triệt tiêu 100% cú giật chuyển cảnh đột ngột về `overview` rồi quay lại | ✔️ ĐẠT |
| **Khả năng tương thích Fallback** | Fallback an toàn khi `delta.diceSeq = undefined` | Nếu đã đổ và cùng giá trị xúc xắc thì không kích hoạt lại | ✔️ ĐẠT |
| **Bộ kiểm thử hợp đồng IMP-48** | >= 15 atomic tests theo Ma trận 4 khía cạnh | 16 / 16 tests PASS (`imp48_monotonic_dice_sync.test.ts`) | ✔️ ĐẠT |
| **Toàn bộ hệ thống test dự án** | 149 test suites | 149 / 149 test suites PASS (2.057 tests) | ✔️ ĐẠT |
| **Chất lượng mã nguồn & Linter** | 0 lỗi TypeScript, 0 vi phạm linter | `npm run gate:quick` sạch 100% | ✔️ ĐẠT |

---

## 2. BẰNG CHỨNG KIỂM THỬ TỰ ĐỘNG (ADVERSARIAL INVERSION)

- **Trạm 1 (RED Contract Test)**: 
  - `tests/client/imp48_monotonic_dice_sync.test.ts` gồm 16 atomic tests.
  - Trên mã nguồn cũ: 13/16 tests thất bại rõ ràng (Adversarial Inversion PASS), chứng minh các gói tin mua nhà, nâng cấp công trình, thế chấp đều vô tình kích hoạt `isRolling = true` và kéo camera về `overview`.
- **Trạm 2 (GREEN Implementation)**:
  - Bổ sung `lastDiceSeq?: number` và `setLastDiceSeq` vào `GameState`.
  - Cập nhật `syncDiceRoll` trong `apply_delta.ts` với hàm vị từ `isDiceRollDuplicate`.
  - Toàn bộ 16/16 tests PASS 100%.

---

## 3. CHI TIẾT CÁC TỆP MÃ NGUỒN ĐÃ CHỈNH SỬA

1. [`src/client/store/game_store_types.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/game_store_types.ts):
   - Bổ sung trường `readonly lastDiceSeq?: number;` vào `GameState`.
   - Bổ sung phương thức `setLastDiceSeq: (seq: number | undefined) => void;` vào `GameState`.
   - Mở rộng `triggerDiceRoll: (dice: [number, number], diceSeq?: number) => void;`.
2. [`src/client/store/game_store.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/game_store.ts):
   - Khởi tạo `lastDiceSeq: undefined` trong `useGameStore`.
   - Cung cấp `setLastDiceSeq: (lastDiceSeq) => set({ lastDiceSeq })`.
   - Cập nhật `triggerDiceRoll` lưu `lastDiceSeq` đồng bộ khi gieo xúc xắc.
3. [`src/client/network/apply_delta.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/apply_delta.ts):
   - Xây dựng hàm `isDiceRollDuplicate(delta: DeltaPayload, state: GameState): boolean`:
     - Nếu `delta.diceSeq !== undefined`: kiểm tra `state.lastDiceSeq !== undefined && delta.diceSeq <= state.lastDiceSeq`.
     - Fallback: kiểm tra `state.hasRolledThisTurn && state.dice[0] === delta.dice[0] && state.dice[1] === delta.dice[1]`.
   - Cập nhật `syncDiceRoll(delta, state)` và đồng bộ `lastDiceSeq` trong `applyDeltaToStore` khi full sync.

---

## 4. BẤT BIẾN ĐƯỢC GHI NHẬN

- Gotcha #69 trong `docs/domain/gotchas.md`: `[CLIENT/3D/CAMERA] Bất Biến Lọc Trùng Lặp Chuỗi Đơn Điệu diceSeq & Triệt Tiêu Cú Giật Camera Khi Mua Nhà (Monotonic Dice Sync & Camera Stabilization Invariant - IMP-48)`.
