# KẾ HOẠCH CẢI TIẾN IMP-112: ĐỒNG BỘ TUẦN TỰ XÚC XẮC 3D VÀ BƯỚC NHẢY QUÂN CỜ (DICE-TO-PAWN SEQUENTIAL SYNCHRONIZATION & WEB LATENCY RESILIENCE)

> **Mã cải tiến**: IMP-112  
> **Căn cứ phản hồi**: Người chơi phản ánh "kiểm tra lại thứ tự xúc xắc quay và con cờ chạy, tôi thấy xúc xắc chưa quay xong mà con cờ đã chạy rồi, có thể delay do web"  
> **Mục tiêu**: Đảm bảo 100% xúc xắc 3D hoàn thành quỹ đạo quay -> tiếp đất phẳng trên khay sa bàn -> dừng nghỉ quan sát 250ms -> quân cờ mới bắt đầu nhảy từng ô. Tuyệt đối không để quân cờ chạy trước hoặc chạy song song khi xúc xắc đang quay.

---

## 1. PHÂN TÍCH BLAST RADIUS & NGUY CƠ TÁC ĐỘNG (PRE-FLIGHT BLAST RADIUS AUDIT)

- **Mức độ rủi ro**: Slice-Bound (Tác động chuỗi xử lý mạng `apply_delta.ts`, `apply_delta_players.ts`, component 3D `dice_tray.tsx`, store `game_store.ts` và `game_store_types.ts`).
- **Tác động trực tiếp**:
  1. `src/client/network/apply_delta.ts`: Đưa `syncDiceRoll` lên thực thi trước `applyPlayerDeltas`. Đồng thời bảo toàn truyền snapshot `state` ban đầu cho `applyPhaseAndTimerDeltas` để các hệ thống telemetry và activity tracker nhận diện chính xác bước di chuyển.
  2. `src/client/network/apply_delta_players.ts`: Chuẩn hóa `dispatchPawnMove` định tuyến vào `setPendingPawnMove` khi `isRolling === true`.
  3. `src/client/3d/dice_tray.tsx`: Sửa lỗi bẫy cache `lastAnimatedSeqRef` trong `SingleDie`, đảm bảo chuyển trạng thái `!prevRollingRef.current` luôn kích hoạt reset spring; bổ sung 250ms settle delay và timer cleanup an toàn.
  4. `src/client/store/game_store.ts`: Xử lý giải phóng `pendingPawnMove` mượt mà khi `setIsRolling(false)`.
- **Đối tượng tiêu thụ hạ tầng**:
  - `ActionDock`, `PawnAnimator`, `CameraStateMachine`, `ActivityTracker`.
- **Phương án phòng thủ xấu nhất**:
  - Bộ đếm an toàn 2500ms fallback đảm bảo không bao giờ bị treo trạng thái `isRolling` nếu WebGL crash.
  - 100% các bộ kiểm thử đơn vị, hợp đồng và stress pass (4566/4566 tests).

---

## 2. MA TRẬN YÊU CẦU KỸ THUẬT CHI TIẾT (TECHNICAL SPECIFICATION)

### Chốt 1: Thứ Tự Đồng Bộ Bắt Buộc Trong `applyDeltaToStore`
```
[Server Delta Nhận Về]
       │
       ▼
[syncDiceRoll] ────────────────► Kích hoạt triggerDiceRoll([d1, d2], seq) ──► isRolling: true
       │
       ▼
[applyPlayerDeltas] ───────────► Nhận thấy isRolling === true ──► Lưu vào pendingPawnMove
       │
       ▼
[applyCellDeltas]
       │
       ▼
[applyPhaseAndTimerDeltas] ───► So sánh prevState vs nextState ──► Ghi log activity chính xác
```

### Chốt 2: Khắc Phục Lỗi Reset Lò Xo `SingleDie`
- Khắc phục điều kiện rẽ nhánh trong `SingleDie`:
  Khi `!prevRollingRef.current` (bắt đầu lượt gieo), bất kể `diceSeq` có trùng với lượt trước hay không, BẮT BUỘC gán `shouldReset = true` và đồng bộ `lastAnimatedSeqRef.current = diceSeq`.

### Chốt 3: Khoảng Đệm Nghỉ Đọc Số 250ms (Settle Delay)
- Khi lò xo đạt điểm dừng (`result?.finished === true`), tạo `setTimeout(250ms)` để xúc xắc nằm yên trên khay giúp người chơi đọc rõ mặt xúc xắc.
- Sau 250ms, gọi `setIsRolling(false)`. Hàm này lập tức kích hoạt `startPawnMove` từ `pendingPawnMove`.

---

## 3. KẾ HOẠCH KIỂM THỬ (VERIFICATION PLAN)

- Tạo bộ kiểm thử hợp đồng 4 góc cạnh `tests/contracts/imp112_dice_roll_to_pawn_hop_sequence_sync.test.ts` (16 atomic tests).
- Xác minh toàn bộ 228 file kiểm thử dự án với 4566 tests đạt 100% GREEN.
- Kiểm tra linter anti-slop, UI linter (0 vi phạm) và production build TypeScript (`npm run build`).
