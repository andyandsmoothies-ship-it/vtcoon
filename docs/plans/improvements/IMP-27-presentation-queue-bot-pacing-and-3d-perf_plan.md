# [IMP-27] Kế Hoạch Hàng Đợi Hoạt Cảnh Con Cờ (Presentation Queue), Nhịp Độ Bot AI & Tối Ưu Hiệu Năng 3D (60 FPS)

## Bối Cảnh & Vấn Đề Gốc Rễ (Root Cause Analysis)
Khi vận hành thử nghiệm thực tế ván đấu 1 Người Chơi + 3 Bot AI, đã phát sinh 5 điểm nghẽn hiệu năng và hoạt ảnh nghiêm trọng:
1. **Chồng Lấn Hoạt Cảnh Bot (Teleportation & Drop Animation)**:
   - Backend phát các gói tin delta dồn dập trong 2.4 giây. Phía frontend chưa có hàng đợi thị giác độc lập; hoạt cảnh của Bot trước bị lệnh `clearActivePawnAnimation` hủy ngang khi Bot sau bắt đầu, làm các con cờ teleport và giật cục.
2. **Camera Nhảy Loạn Vào Khay Xúc Xắc**:
   - Khi Bot gieo xúc xắc, camera liên tục kích hoạt chế độ `dice_roll` cắm sâu vào lòng hồ rồi giật ngược ra ngoài, làm gián đoạn tầm nhìn và gây khó chịu cho người chơi.
3. **Quá Tải CPU Lưới Sóng Biển (CPU Normal Computation)**:
   - Lưới sóng đại dương PlaneGeometry(240, 240, 96, 96) với 9.409 đỉnh gọi `computeVertexNormals()` mỗi khung hình trong `useSafeFrame`, chiếm 5-7ms CPU chính mỗi frame và kéo tụt FPS.
4. **40 Standee Nhấp Nhô Gây Phân Tán**:
   - 40 Standee công trình chạy 40 hook `useFrame` độc lập tính hàm điều hòa sin, vừa lãng phí chu kỳ CPU vừa làm sa bàn 3D thiếu vững chãi.
5. **Nút Hành Động Mở Sớm Khi Bot Chưa Hạ Cánh**:
   - Nút "Đổ Xúc Xắc" mở khóa trước khi các con cờ Bot hoàn tất chuỗi nhảy tiếp đất.

---

## Giải Pháp Bất Biến (Architecture Invariants)
1. **Client Presentation Queue & Decoupled Visual State** (`Gotcha Invariant #40`):
   - Tách rời hoàn toàn `playerPositions` (logic máy chủ để tính tiền, mua đất) và `visualPositions` (tọa độ hiển thị 3D thực tế).
   - Nạp mọi chuyển động vào `pawnAnimationQueue`. Các quân cờ chưa tới lượt đứng yên ở vị trí xuất phát.
   - Khi quân cờ chạm đất ô đích (`completePawnMove`), mới cập nhật `visualPositions` và tự động kích hoạt quân cờ tiếp theo trong hàng đợi. Triệt tiêu 100% hiện tượng teleport.
2. **Tốc Độ Nhảy Turbo Cho Bot AI (0.20s/ô)**:
   - Áp dụng cấu hình bước nhảy Turbo: `BOT_HOP_DURATION = 0.13`, `BOT_LANDING_DURATION = 0.07` (tổng 0.20s/bước), duy trì hoạt cảnh nhịp nhàng mà không kéo dài thời gian chờ.
3. **Nhịp Độ Bot Phía Máy Chủ (`botTurnDelayMs`)**:
   - Bổ sung tham số cấu hình `botTurnDelayMs` trong `BotTurnScheduler`: mặc định 2000ms trong runtime thực tế để người chơi kịp quan sát, hỗ trợ 50ms - 800ms trong môi trường test để bảo toàn tốc độ test runner.
4. **Ổn Định Góc Máy Quay Khi Bot Chơi**:
   - Khi `isBotTurn === true`, camera duy trì góc nhìn toàn cảnh bán đảo (`overview`), không kích hoạt `dice_roll`.
5. **Hạ Tải CPU Sóng Biển 60 FPS**:
   - Giảm lưới sóng biển từ 96x96 xuống 24x24 segments (từ 9.409 đỉnh xuống 625 đỉnh).
   - Xóa bỏ hoàn toàn lệnh gọi `computeVertexNormals()` trong `useSafeFrame`.
6. **Cố Định Cao Độ 40 Standee**:
   - Xóa bỏ hook `useFrame` nhấp nhô ở cả 40 Standee, cố định cao độ chuẩn $y = 1.1$.

---

## Sơ Đồ Kiến Trúc Hàng Đợi Hoạt Cảnh (Presentation Queue Flowchart)
```
[Máy Chủ Phát Delta Di Chuyển]
             │
             ▼
[Client Presentation Queue (pawnAnimationQueue)]
             │
             ├──► Bot 1: Nhảy Turbo 0.20s/ô ──► Chạm Đất: visualPositions[bot_1] = đích
             │
             ├──► Bot 2: Nhảy Turbo 0.20s/ô ──► Chạm Đất: visualPositions[bot_2] = đích
             │
             └──► Bot 3: Nhảy Turbo 0.20s/ô ──► Chạm Đất: visualPositions[bot_3] = đích
                                                 │
                                                 ▼
                                [Mở Khóa Nút Bấm Cho Người Chơi]
```

---

## Chi Tiết Triển Khai (File Changes)
- `src/client/store/game_store.ts`: Bổ sung `visualPositions`, `pawnAnimationQueue`, `enqueuePawnMove`, `processPawnQueue`.
- `src/client/network/apply_delta.ts`: Nạp delta di chuyển vào hàng đợi thay vì gán tức thời `playerPositions`.
- `src/client/3d/pawn_path.ts` & `src/client/3d/pawn_animator.tsx`: Hỗ trợ `BOT_STEP_DURATION = 0.20`, loại bỏ `clearActivePawnAnimation()` phá hàng đợi.
- `src/client/3d/camera_state_machine.ts` & `src/client/game_canvas.tsx`: Giữ chế độ `overview` khi `isBotTurn === true`.
- `src/client/3d/coastal_island_environment.tsx`: Giảm lưới về 24x24, xóa `computeVertexNormals()`.
- `src/client/3d/board_tile.tsx`: Cố định cao độ Standee $y = 1.1$, bỏ `useFrame`.
- `src/server/network/bot_turn_scheduler.ts` & `wss_server.ts`: Bổ sung tham số `botTurnDelayMs`.
- `src/client/ui/action_dock.tsx`: Khóa nút bấm khi hàng đợi còn task.

---

## Kế Hoạch Nghiệm Thu (Verification Plan)
1. `tests/client/pawn_bot_movement_lifecycle.test.ts`: Kiểm tra toàn bộ vòng đời hàng đợi hoạt cảnh con cờ và tốc độ Turbo Bot.
2. `tests/server/round_cap_game_over.test.ts`: Kiểm tra bộ lập lịch Bot với độ trễ tùy chỉnh.
3. `tests/client/coastal_island_environment.test.ts` & `coastal_dynamics.test.ts`: Kiểm tra lưới sóng biển.
4. `npm run lint:ui`: Đảm bảo 0 vi phạm anti-patterns.
5. `npm test`: Toàn bộ 122 test files vượt qua 100%.
