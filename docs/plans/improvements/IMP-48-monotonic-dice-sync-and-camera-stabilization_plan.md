# [IMP-48] Kế Hoạch Triệt Tiêu Kích Hoạt Lại Xúc Xắc Dư Thừa & Ổn Định Góc Nhìn Khi Mua Nhà (Monotonic Dice Sync & Camera Stabilization)

## 1. Phân Tích Hiện Tượng & Nguyên Nhân Kỹ Thuật

Người dùng phản ánh: *"mỗi lần tôi quay xúc xắc xong, tôi mua nhà và tôi thấy có animation chuyển cảnh qua 2 con xúc xắc xong chuyển cảnh lại tôi tại vị trí nhà vừa mua đúng không"*.

### Chuỗi nhân quả lỗi (Causal Trace):
```text
[Người chơi ấn Mua Nhà]
       │
       ▼ Gửi intent INTENT_BUY_PROPERTY lên Server
[Server xử lý mua đất & broadcast DeltaPayload]
       │
       ▼ Gói tin Delta chứa: cells (cập nhật chủ sở hữu), players (trừ tiền)
         VÀ VẪN MANG TRƯỜNG: dice: room.lastDice, diceSeq: room.diceSeq
[Client nhận Delta tại applyDeltaToStore]
       │
       ▼ Gọi applyPhaseAndTimerDeltas -> syncDiceRoll(delta.dice, state)
         HIỆN TẠI: syncDiceRoll THIẾU KIỂM TRA delta.diceSeq!
       ▼
[Client gọi state.triggerDiceRoll([dice[0], dice[1]]) LẦN THỨ HAI]
       │
       ├──────────────────────────────────────────────┐
       ▼                                              ▼
[useGameStore.isRolling = true]              [DiceTray nhận isRolling = true]
       │                                              │
       ▼                                              ▼
CameraStateMachine.resolveCameraMode()       Lò xo reset, 2 con xúc xắc rơi
thấy isRolling=true ──> ép về 'overview'!   và quay lại giữa sa bàn Đại Lộ!
       │
       ▼ Sau khi xúc xắc rơi xong (~1.5s - 2.5s), isRolling trở về false
CameraStateMachine.resolveCameraMode() thấy hasRolledThisTurn & targetCell
──> Zoom ngược trở lại 'tile_focus' tại ô nhà vừa mua!
```

---

## 2. Giải Pháp Kiến Trúc Cốt Lõi

1. **Thêm `lastDiceSeq?: number` vào `GameState`**:
   - `src/client/store/game_store_types.ts`: Bổ sung `readonly lastDiceSeq?: number;` và hàm `setLastDiceSeq: (seq: number) => void`.
   - `src/client/store/game_store.ts`: Khởi tạo `lastDiceSeq: undefined`, cập nhật `lastDiceSeq` khi gieo xúc xắc thực tế.

2. **Lọc Khử Trùng Lặp Chuỗi Đơn Điệu Trong `syncDiceRoll`**:
   - `src/client/network/apply_delta.ts`:
     - Nhận diện `delta.diceSeq`.
     - Nếu `delta.diceSeq !== undefined`:
       - Nếu `state.lastDiceSeq !== undefined && delta.diceSeq <= state.lastDiceSeq`: Bỏ qua hoàn toàn, không gọi `triggerDiceRoll`!
       - Nếu `delta.diceSeq > (state.lastDiceSeq ?? -1)`: Cập nhật `lastDiceSeq` và kích hoạt `state.triggerDiceRoll(delta.dice)`.
     - Nếu `delta.diceSeq === undefined` (kịch bản fallback):
       - Nếu người chơi đã dẫm ô và đang ở `ActionPhase` hoặc `PropertyManagement`, và `dice` giống với `state.dice`, bỏ qua không re-trigger.

3. **Bảo Toàn Trạng Thái Camera Khi Mua Bán BĐS**:
   - Khi nhận Delta cập nhật tài sản mua/nâng cấp/thế chấp, `isRolling` giữ nguyên `false`.
   - `CameraStateMachine` duy trì góc nhìn `tile_focus` êm đềm tại ô đất, triệt tiêu 100% cú giật máy quay ra trung tâm bàn cờ.

---

## 3. Các Tệp Mã Nguồn Thay Đổi

- `src/client/store/game_store_types.ts`: Bổ sung trường `lastDiceSeq` và setter.
- `src/client/store/game_store.ts`: Khởi tạo và quản lý `lastDiceSeq`.
- `src/client/network/apply_delta.ts`: Cập nhật `syncDiceRoll` với bộ lọc đơn điệu `diceSeq`.

---

## 4. Kế Hoạch Kiểm Thử (Quy Trình 3 Trạm)

- **Trạm 1 (RED Contract Test)**:
  - Tạo `tests/client/imp48_monotonic_dice_sync.test.ts` (>= 15 atomic contract tests) phủ đầy đủ 4 khía cạnh:
    1. *Boundary*: Biên giá trị `diceSeq` (undefined, 0, 1, nhảy cóc, thụt lùi).
    2. *State Reactivity*: Gói tin Delta mua nhà không kích hoạt `triggerDiceRoll`, `isRolling` giữ nguyên false, camera giữ `tile_focus`. Gói tin gieo xúc xắc mới (`diceSeq` tăng) kích hoạt chuẩn xác.
    3. *Resource Disposal*: Khay xúc xắc không reset lò xo ngoài ý muốn, `lastDiceSeq` reset an toàn khi bắt đầu trận mới.
    4. *Error Defense*: Chặn xúc xắc `[0, 0]`, null, undefined, âm.
  - Xác nhận thất bại trên mã nguồn cũ (Inversion Gate PASS).
- **Trạm 2 (GREEN Implementation)**:
  - Triển khai giải pháp tối thiểu trên `src/client/store/` và `src/client/network/`.
  - Xác nhận toàn bộ test suites PASS 100%.
- **Trạm 3 (Independent Review & Physical Disk Verification)**:
  - `spec-reviewer` và `code-reviewer` thẩm định tính nguyên tử và đối chiếu 100% yêu cầu.
  - Ghi nhận Gotcha #69 vào `docs/domain/gotchas.md`.
  - Cập nhật `docs/reports/improvements/IMP-48-monotonic-dice-sync-and-camera-stabilization_report.md` và `docs/master_roadmap.md`.
