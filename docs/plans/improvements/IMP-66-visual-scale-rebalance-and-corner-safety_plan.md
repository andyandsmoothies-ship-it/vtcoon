# [KẾ HOẠCH CẢI TIẾN IMP-66] Tái Cân Bằng Tỷ Lệ Trực Quan Sa Bàn: Giảm 50% Kích Thước Con Cờ & Tăng 50% Kích Thước Công Trình C1-C3

> **Trạng thái**: 🟢 **ĐÃ PHÊ DUYỆT & THỰC THI HOÀN TẤT**
> **Mã cải tiến**: IMP-66
> **Mục tiêu**: Điều chỉnh kích thước con cờ giảm ~50% (scale 0.625x) và tăng kích thước công trình C1-C3 +50% (scale 0.975x), định vị an toàn ngoài mép trên thẻ cờ Z = -1.38m và mở rộng hành lang góc an toàn 0.397m.

---

## 1. BỐI CẢNH & PHÂN TÍCH KỸ THUẬT

1. **Kích Thước Con Cờ (Pawn Scale)**:
   - Trước đây `LuxuryPawnModel` đặt `scale = 1.25x`, đường kính đế thực tế ~1.05m (chiếm 64% bề ngang ô cờ 1.64m).
   - Khi 4 người chơi cùng đứng 1 ô, các linh vật va chạm và che khuất thông tin thẻ cờ.
   - Giải pháp: Giảm 50% về `0.625x` (đường kính đế ~0.52m, đế tiếp xúc ~0.31m), giải phóng 75% lòng ô cờ.

2. **Kích Thước Công Trình C1-C3 (Building Scale)**:
   - Ở đợt cập nhật trước, công trình vừa có chân đế 0.55m vừa bị nhân hệ số `scale = 0.65x`, khiến khổ đế thực tế chỉ ~0.358m x 0.358m (quá nhỏ).
   - Giải pháp: Tăng 50% từ 0.65x lên `0.975x`, đưa chân đế thực tế về ~0.536m x 0.536m (chuẩn ~0.55m).

3. **Hành Lang An Toàn Ngoài Ô Cờ & Góc Vuông (Corner Safety & Clearance Invariant)**:
   - Dịch vị trí chuẩn từ `Z = -1.35m` ra `Z = -1.38m`. Mép trong chân đế tại `-1.38 + 0.536 / 2 = -1.112m <= -1.08m`, cách mép thẻ cờ 3.2cm an toàn trên thềm promenade.
   - 8 ô giáp góc (1, 39, 9, 11, 19, 21, 29, 31) áp dụng độ trượt ngang `±0.24m` và xoay `±0.25 rad` (~14.3°).
   - Khoảng cách Euclid tâm công trình $D \approx 0.933\text{m} \ge 0.85\text{m}$, khoảng hở an toàn thực tế đạt $\text{Clearance} = 0.397\text{m} \ge 0.35\text{m}$, triệt tiêu 100% va chạm góc.

---

## 2. KIẾN TRÚC MÃ NGUỒN & PHẠM VI TÁC ĐỘNG (BLAST RADIUS)

- `src/client/3d/luxury_pawn_models.tsx`: Cập nhật root group `scale={[0.625, 0.625, 0.625]}`.
- `src/client/3d/pawn_animator.tsx`: `PawnMesh` bọc group `scale={[0.625, 0.625, 0.625]}`.
- `src/client/3d/procedural_building.tsx`: `STANDARD_LOT_TRANSFORM` và 8 `CORNER_SPLAY_TRANSFORMS` cập nhật `scale: [0.975, 0.975, 0.975]`, `Z = -1.38`, trượt `±0.24`, xoay `±0.25 rad`.
- `src/client/3d/sunny_island_lobby_scene.tsx`: Hạ billboard nameplate xuống `[0, 0.85, 0]`.
- `src/client/3d/construction_slam_vfx.tsx`: Bổ sung guard `Number.isFinite(cellIndex)`.
- `docs/domain/gotchas.md`: Bổ sung Gotcha #89.

---

## 3. QUY TRÌNH 3 TRẠM (3-STATION PIPELINE)

1. **Trạm 1 (RED Contract Test)**: `tests/contracts/imp66_visual_scale_rebalance_and_corner_safety.test.ts` (61 atomic tests, 4 facets).
2. **Trạm 2 (GREEN Implementation)**: Triển khai tối thiểu để toàn bộ 61 tests PASS và 169/169 test suites hệ thống PASS.
3. **Trạm 3 (Independent Review & Visual Audit)**:
   - `spec-reviewer`: Độc lập đối chiếu mã nguồn và hợp đồng kiểm thử, duyệt 100% không scope drift.
   - `game-3d-visual-critic`: Độc lập chấm điểm thị giác trên ảnh chụp thực tế qua Edge CDP, đạt phán quyết SHIP (9.6/10).
