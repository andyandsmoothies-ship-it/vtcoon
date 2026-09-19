# BÁO CÁO CẢI TIẾN IMP-112: ĐỒNG BỘ TUẦN TỰ XÚC XẮC 3D VÀ BƯỚC NHẢY QUÂN CỜ (DICE-TO-PAWN SEQUENTIAL SYNCHRONIZATION & WEB LATENCY RESILIENCE)

> **Mã cải tiến**: IMP-112  
> **Trạng thái**: 🟢 HOÀN TẤT (VERIFIED PASS)  
> **Ngày hoàn thành**: 2026-09-17  
> **Bộ kiểm thử**: `tests/contracts/imp112_dice_roll_to_pawn_hop_sequence_sync.test.ts` (16/16 tests PASS)  
> **Độ bao phủ toàn dự án**: 228 test files, 4.566 tests (100% PASS)  

---

## 1. NGUYÊN NHÂN GỐC RỄ ĐÃ ĐƯỢC GIẢI QUYẾT TRIỆT ĐỂ

1. **Nghịch đảo thứ tự xử lý Delta trong `applyDeltaToStore` (`src/client/network/apply_delta.ts`)**:
   - Trước đây `applyPlayerDeltas` chạy trước `applyPhaseAndTimerDeltas` (nơi gọi `syncDiceRoll`).
   - Khi nhận gói tin delta có xúc xắc và vị trí mới từ server, client thấy `isRolling === false` nên lập tức bắt đầu `startPawnMove` / `enqueuePawnMove`. Sau khi con cờ đã chạy thì `syncDiceRoll` mới kích hoạt xúc xắc quay.
   - **Giải pháp**: Đưa `syncDiceRoll` lên dòng đầu tiên của `applyDeltaToStore`. Khi delta có xúc xắc mới, store lập tức chuyển sang `isRolling: true`. Khi đó `applyPlayerDeltas` thấy `isRolling: true` nên định tuyến bước di chuyển vào `pendingPawnMove`, con cờ đứng yên tại chỗ chờ xúc xắc tiếp đất.

2. **Bẫy cache `lastAnimatedSeqRef` trong `SingleDie` (`src/client/3d/dice_tray.tsx`)**:
   - Khi chuyển sang lượt mới, `diceSeq` ở client vẫn mang giá trị của lượt trước nếu delta chưa kịp tới qua mạng. Nhánh điều kiện cũ `if (diceSeq !== undefined && diceSeq !== lastAnimatedSeqRef.current)` đánh giá `false`, khiến spring không reset. Do spring đã ở $t = 1$, react-spring lập tức phát sự kiện `onRest`, dập tắt cờ `isRolling` về `false` ngay mili-giây đầu tiên.
   - **Giải pháp**: Đổi logic rẽ nhánh thành `if (!prevRollingRef.current) { shouldReset = true; lastAnimatedSeqRef.current = diceSeq; }`. Bất kỳ khi nào `isRolling` chuyển từ `false` sang `true`, spring luôn được reset bắt đầu quay từ $t = 0$.

3. **Bổ sung khoảng dừng tĩnh 250ms (Settle Delay)**:
   - Khi xúc xắc hoàn thành 1100ms nhào lộn vật lý, thêm 250ms dừng tĩnh trên khay để người chơi quan sát rõ số điểm trước khi `setIsRolling(false)` giải phóng `pendingPawnMove` để quân cờ xuất phát.
   - Bộ đếm thời gian được bọc trong `settleTimerRef` và dọn dẹp trong `useEffect cleanup`.

---

## 2. KẾT QUẢ KIỂM THỬ TỔNG THỂ

| Hạng mục kiểm thử | Tập lệnh / Tệp kiểm thử | Kết quả |
| :--- | :--- | :--- |
| **Hợp đồng IMP-112** | `tests/contracts/imp112_dice_roll_to_pawn_hop_sequence_sync.test.ts` | 🟢 16/16 PASS (14ms) |
| **Vòng đời di chuyển Bot** | `tests/client/pawn_bot_movement_lifecycle.test.ts` | 🟢 20/20 PASS (29ms) |
| **Khóa Camera & Nhịp Bot** | `tests/contracts/bot_pacing_and_camera_lock_contract.test.ts` | 🟢 31/31 PASS (17ms) |
| **Toàn bộ 7 Test Suite Xúc Xắc** | `imp48`, `ui02`, `bot_pacing`, `bridge_craft`, `imp78`, `dice` | 🟢 134/134 PASS |
| **Toàn bộ Test Suite Dự Án** | `npm test` | 🟢 228/228 Files, 4.566/4.566 Tests PASS |
| **Kiểm tra Anti-Patterns UI** | `npm run lint:ui` | 🟢 0 Anti-patterns across 146 files |
| **Kiểm tra Ngân Sách Code Slop** | `node scripts/lint_slop.mjs` | 🟢 0 Hard Violations across 215 files |
| **Biên dịch Production** | `npm run build` | 🟢 Exit Code 0 (tsc & vite SSR build clean) |

---

## 3. THAY ĐỔI MÃ NGUỒN CHI TIẾT

1. [`src/client/network/apply_delta.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/apply_delta.ts):
   - Đưa `syncDiceRoll(delta, state)` lên thực thi trước `applyPlayerDeltas`.
   - Loại bỏ lệnh gọi trùng lặp `syncDiceRoll` trong `applyPhaseAndTimerDeltas`.
   - Truyền snapshot `state` ban đầu vào `applyPhaseAndTimerDeltas` để so sánh chính xác `prevState` vs `nextState`.
2. [`src/client/network/apply_delta_players.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/apply_delta_players.ts):
   - `dispatchPawnMove` định tuyến chuyển động vào `setPendingPawnMove` khi `isRolling === true`.
3. [`src/client/3d/dice_tray.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/dice_tray.tsx):
   - Cập nhật logic `shouldReset` của `SingleDie`.
   - Bổ sung khoảng đệm tĩnh 250ms với `settleTimerRef` và `clearTimeout` an toàn.
4. [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md):
   - Bổ sung Invariant #152: "Bất Biến Đồng Bộ Tuần Tự Xúc Xắc - Quân Cờ & Kháng Lệch Pha Độ Trễ Mạng".
