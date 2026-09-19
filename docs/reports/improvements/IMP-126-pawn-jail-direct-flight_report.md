# [IMP-126] Báo Cáo Nghiệm Thu: Cơ Chế Quân Cờ Tự Bay Vào Tù Lập Tức (Pawn Jail Direct Flight)

## 1. Thông Tin Chung
- **Mã Cải Tiến**: IMP-126
- **Tiêu Đề**: Cơ chế quân cờ tự bay vào tù lập tức (High-Arc Direct Flight)
- **Kế Hoạch**: [`docs/plans/improvements/IMP-126-pawn-jail-direct-flight_plan.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/plans/improvements/IMP-126-pawn-jail-direct-flight_plan.md)
- **Trạng Thái**: HOÀN THÀNH (Đã qua Quy trình 3 Trạm & Thẩm định đĩa vật lý độc lập)

## 2. Kết Quả Triển Khai
1. **Quỹ đạo bay trực diện 1 nhịp (Atomic High-Arc Direct Flight)**:
   - Thay thế việc sinh 20-35 waypoints tuần tự quanh bàn cờ bằng 1 waypoint trực tiếp `[10]` với cờ `isJailFlight: true` khi người chơi hoặc Bot bị tống vào tù (`isGoingToAudit = true`).
   - Triệt tiêu hoàn toàn hiện tượng quân cờ nhảy lóc cóc qua ô Khởi Hành (GO - Ô 0) về mặt thị giác.
2. **Hiệu ứng thị giác & Âm thanh chuẩn Diorama 3D**:
   - Vòng cung bay parabol cao vút: `JAIL_FLIGHT_ARC = 2.8` (so với `DEFAULT_JUMP_ARC = 0.8`), lướt qua phía trên các công trình trung tâm bàn cờ.
   - Thời lượng bay tối ưu: `0.55s` cho Người chơi, `0.45s` cho Bot; thời gian giảm chấn `0.12s`.
   - Âm thanh tiếp đất: Kích hoạt `SoundEffect.TAX_PENALTY` dứt khoát khi quân cờ chạm sàn Ô 10 (Trạm Kiểm Toán).
3. **Tính ổn định & Chống Race Condition**:
   - Bảo toàn cờ `isJailFlight` và `isBot` xuyên suốt qua `PendingPawnMove` khi xúc xắc đang lăn.
   - Xử lý đồng nhất cho cả trường hợp đáp Ô 30, đổ 3 lần đôi, hay thẻ bài phạt.

## 3. Danh Mục Tệp Đã Chỉnh Sửa
- [`src/client/3d/pawn_path.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/pawn_path.ts): Hằng số `JAIL_FLIGHT_ARC`, `JAIL_FLIGHT_DURATION`, `BOT_JAIL_FLIGHT_DURATION`, `JAIL_LANDING_DURATION` & hàm `calculateJailFlightWaypoints`.
- [`src/client/store/game_store_types.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/game_store_types.ts): Mở rộng `PawnMoveTask`, `PawnAnimationState`, `PendingPawnMove`, `GameState.startPawnMove`.
- [`src/client/store/game_store.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/game_store.ts): Đồng bộ tham số `isJailFlight` qua `startPawnMove`, `setIsRolling`, và `processPawnQueue`.
- [`src/client/network/apply_delta_players.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/apply_delta_players.ts): Nhận diện `isGoingToAudit` và gán `calculateJailFlightWaypoints(10)`.
- [`src/client/3d/pawn_animator.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/pawn_animator.tsx): Render chuyển động parabol 2.8 và phát âm thanh `TAX_PENALTY`.
- [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md): Ghi nhận Gotcha #165.

## 4. Minh Chứng Kiểm Thử
- **Test Hợp Đồng**: [`tests/contracts/imp126_pawn_jail_direct_flight.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp126_pawn_jail_direct_flight.test.ts) ➔ **19/19 PASS** (100%).
- **Kiểm Thử Hồi Quy**: `npm test` ➔ **241/241 suites PASS** (4,939 tests, 0 regressions).
- **Pháp Chứng Snapshot**: [`.agents/evidence/imp126_snapshot.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp126_snapshot.json) được ký duyệt bởi `spec-reviewer`.
