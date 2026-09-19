# [IMP-126] Kế Hoạch: Cơ Chế Quân Cờ Tự Bay Vào Tù Lập Tức (Pawn Jail Direct Flight)

## 1. Bối Cảnh & Vấn Đề (Problem Statement)
- **Hiện trạng**: Khi người chơi hoặc bot bị tống vào tù (Trạm Kiểm Toán - Ô 10) do đáp vào Ô 30 ("Lệnh Thanh Tra Thuế"), do đổ 3 lần đôi liên tiếp, hoặc do hiệu ứng thẻ bài:
  - Hàm `processSinglePlayerPosition` trong `src/client/network/apply_delta_players.ts` nhận vị trí đích `p.position = 10`.
  - Hàm gọi `calculatePathWaypoints(fromCell, 10)` tính toán theo chiều kim đồng hồ, sinh ra 20 đến 35 bước nhảy tuần tự quanh bàn cờ.
  - Quân cờ nhảy lóc cóc qua từng ô, đi ngang qua cả ô Khởi Hành (GO - Ô 0) về mặt thị giác, mất 4 đến 7 giây chờ đợi vô lý, vi phạm nguyên tắc cốt lõi của cờ tỷ phú quốc tế ("Go directly to jail, do not pass GO").
  - Hơn nữa, cấu trúc `PendingPawnMove` trong `game_store_types.ts` chưa lưu cờ quỹ đạo đặc biệt (`isJailFlight`), dẫn đến việc khi xúc xắc dừng lăn (`setIsRolling(false)`), hàm `startPawnMove` tính lại `calculatePathWaypoints`, làm mất đi cơ chế bay thẳng.

## 2. Kết Quả Thẩm Định Đối Kháng (Plan-Griller Adversarial Audit)
- Đã kích hoạt subagent `plan-griller` quét thực tế trên mã nguồn đĩa cứng. Đã phát hiện và triệt tiêu 3 điểm mù kỹ thuật:
  - **P1 (Broken Domain Causality)**: Bãi bỏ phương án 2 nhịp (hop tới 30 rồi bay về 10) vì server delta không gửi tick trung gian Ô 30, và `pendingPawnMove` là single-object sẽ bị ghi đè gây mất task / visual teleport đột ngột giữa lúc xúc xắc lăn.
  - **P2 (Consumer Desync & Double Penalty)**: Bay 1 nhịp trực diện triệt tiêu lỗi lặp phạt thuế ảo (`lastLandedPawn` tại Ô 30 rồi lại tại Ô 10) và chống giật gián đoạn camera theo dõi.
  - **P3 (Type Signature Mismatch)**: Bổ sung đồng bộ `isJailFlight?: boolean` và `isBot?: boolean` xuyên suốt từ `PendingPawnMove`, `GameState.startPawnMove`, `PawnAnimationState` xuống tới `SingleHopPawn` và `interpolatePawnPosition`.

## 3. Mục Tiêu Kỹ Thuật (Engineering Objectives)
1. **Quỹ đạo bay trực diện 1 nhịp (Atomic High-Arc Direct Flight)**:
   - Khi vào tù (`isGoingToAudit = true`), quân cờ không sinh 20+ waypoints lặp vòng mà chỉ có 1 waypoint trực tiếp `[10]` với cờ `isJailFlight = true`.
2. **Trải nghiệm thị giác & Âm học chuẩn Diorama 3D**:
   - Vòng cung bay cao (`JAIL_FLIGHT_ARC = 2.8`), lượn qua không trung phía trên các tòa nhà trung tâm đảo, thời gian dứt khoát mượt mà (`0.55s` cho người, `0.45s` cho bot).
   - Âm thanh: Phát `SoundEffect.TAX_PENALTY` dứt khoát khi tiếp đất tại Trạm Kiểm Toán.
3. **Độ ổn định tuyệt đối (Zero Race Conditions)**:
   - Xử lý đồng nhất cho cả Bot và Người chơi, cả trường hợp đáp Ô 30, 3 lần đôi, hay thẻ bài phạt.
4. **Bảo toàn tính bất biến & Tương thích ngược**:
   - 100% test suites hiện tại tiếp tục PASS, không phá vỡ `PendingPawnMove` của các bước nhảy bình thường.

## 4. Sơ Đồ Kiến Trúc (Architecture & Flow)

```
[Server Delta: inAudit=true, position=10]
           │
           ▼
[apply_delta_players: processSinglePlayerPosition]
           │
     Is going to Audit? (p.position === 10 && inAudit && !wasInAudit)
           │
           ├── YES:
           │     waypoints = [10]
           │     task = { playerId, fromCell, targetCell: 10, waypoints: [10], isJailFlight: true, isBot }
           │     dispatchPawnMove(task)
           │        ├── isRolling? --> setPendingPawnMove({ ..., isJailFlight: true, isBot })
           │        └── notRolling? -> enqueuePawnMove(task)
           │
           ▼
[game_store: PawnMoveTask with isJailFlight]
           │
     setIsRolling(false) --> startPawnMove(..., isJailFlight: true)
     processPawnQueue() --> activePawnAnimation = { ..., isJailFlight: true }
           │
           ▼
[pawn_animator: ActiveSpringPawn -> SingleHopPawn]
           │
     isJailFlight === true:
     ├── interpolatePawnPosition(fromCell, toCell, progress, arcHeight: 2.8)
     ├── hopDuration: 0.55s (Player) / 0.45s (Bot)
     └── landing: AudioEngine.playSfx(SoundEffect.TAX_PENALTY)
```

## 5. Danh Mục Tệp Thay Đổi (Files to Modify)
1. `src/client/3d/pawn_path.ts`:
   - Bổ sung hằng số `JAIL_FLIGHT_ARC = 2.8`, `JAIL_FLIGHT_DURATION = 0.55`, `BOT_JAIL_FLIGHT_DURATION = 0.45`, `JAIL_LANDING_DURATION = 0.12`.
   - Bổ sung hàm helper thuần túy `calculateJailFlightWaypoints(targetCell?: number): number[]`.
2. `src/client/store/game_store_types.ts`:
   - Mở rộng `PawnMoveTask`: thêm `readonly isJailFlight?: boolean;`.
   - Mở rộng `PawnAnimationState`: thêm `readonly isJailFlight?: boolean;`.
   - Mở rộng `PendingPawnMove`: thêm `readonly isBot?: boolean; readonly isJailFlight?: boolean;`.
   - Mở rộng `GameState.startPawnMove`: thêm `isJailFlight?: boolean`.
3. `src/client/store/game_store.ts`:
   - Cập nhật `startPawnMove`: nhận thêm tham số `isJailFlight?: boolean`. Nếu `isJailFlight === true`, gán `waypoints = [targetCell]`.
   - Cập nhật `setIsRolling`: truyền `pending.isBot, pending.isJailFlight` vào `startPawnMove`.
   - Cập nhật `processPawnQueue`: truyền `isJailFlight: nextTask.isJailFlight` sang `activePawnAnimation`.
4. `src/client/network/apply_delta_players.ts`:
   - Nhận diện trạng thái đi tù:
     ```ts
     const existingInfo = state.playersInfo[p.id];
     const existingWasInAudit = Boolean(existingInfo?.inAudit || (existingInfo?.auditTurnsLeft && existingInfo.auditTurnsLeft > 0));
     const isGoingToAudit = p.position === 10 && Boolean(p.inAudit || (p.auditTurnsLeft && p.auditTurnsLeft > 0)) && !existingWasInAudit;
     ```
   - Khi `isGoingToAudit && fromCell !== 10`:
     - Gán `waypoints = calculateJailFlightWaypoints(10)`.
     - Dispatch task với `targetCell: 10, waypoints, isJailFlight: true, isBot: Boolean(p.isBot)`.
   - Cập nhật `dispatchPawnMove`: bảo toàn `isJailFlight` và `isBot` khi lưu vào `pendingPawnMove`.
5. `src/client/3d/pawn_animator.tsx`:
   - Mở rộng `SingleHopProps` với `isJailFlight?: boolean`.
   - Cấu hình `arcHeight = isJailFlight ? JAIL_FLIGHT_ARC : DEFAULT_JUMP_ARC` khi gọi `interpolatePawnPosition`.
   - Cấu hình `hopDuration` và phát `SoundEffect.TAX_PENALTY` khi tiếp đất.
   - `ActiveSpringPawn` truyền `isJailFlight={animation.isJailFlight}` xuống `<SingleHopPawn />`.
6. `tests/contracts/imp126_pawn_jail_direct_flight.test.ts`:
   - Suite test hợp đồng tuân thủ Universal 4-Facet Behavioral Matrix, kiểm thử toàn diện cả 4 khía cạnh: Boundary, Reactivity, Audio/Visual, Defense.
