# Kế Hoạch Cải Tiến Kỹ Thuật: IMP-103 — Mobile UX Polish, Bot Camera Tracking, Mobile FPS Boost & Telemetry Hardening

## 1. BỐI CẢNH & MỤC TIÊU
Trong quá trình thử nghiệm thực tế trên thiết bị di động (màn hình dọc 390x844), phát hiện 3 điểm nghẽn chính:
1. **Camera không theo dõi Bot**: Khi Bot di chuyển, camera bị khóa cứng ở góc `overview`, không chuyển sang bám theo quân cờ (`pawn_chase`) và không zoom cận cảnh ô đất khi Bot hạ cánh (`tile_focus`), khiến người chơi khó theo dõi diễn biến trận đấu.
2. **Sảnh chờ chèn ép không gian**: Card sảnh chờ có tiêu đề trùng lặp, nút xóa Bot chữ to choán chỗ, nút sao chép mã phòng và nút bắt đầu chưa đồng bộ theo phong cách xúc giác tài phiệt.
3. **Hiệu năng GPU Mobile & Báo Động Telemetry Sai Lệch**: SSAO nặng (N8AO) làm tụt FPS từ 30 xuống ~12.5 FPS sau nhiều vòng chơi; `telemetry_delta_hook` phát báo động đỏ giả `INVALID_POSITION_STEP` khi di chuyển do thẻ sự kiện hoặc bước đi qua ô GO.

## 2. 3 MŨI NHỌN THỰC THI (3-STATION PIPELINE)
- **Mũi nhọn 1 (Camera & Sảnh Chờ)**:
  - Cho phép `resolveCameraMode` chuyển sang `pawn_chase` khi quân cờ Bot đang nhảy và `tile_focus` khi Bot hạ cánh ô đất.
  - Tinh gọn `PlayerSlotCard` thành 1 hàng ngang `min-h-[50px]`, nút xóa Bot vuông `w-7 h-7` icon `✕`.
  - Tinh gọn `PreMatchDeck`: Loại bỏ header trùng lặp, tích hợp mã phòng và badge sẵn sàng cùng 1 hàng, nút sao chép hoàng kim, nút bắt đầu Emerald Green, lưới 50/50 Hướng Dẫn & QR.
- **Mũi nhọn 2 (Tối Ưu Mobile FPS)**:
  - Bổ sung prop `isMobile` / `disableAoOnMobile` vào `PostProcessingPipelineProps`. Tự động vô hiệu hóa pass `N8AO` trên GPU mobile để giữ vững 45-60 FPS.
- **Mũi nhọn 3 (Khử Cảnh Báo Telemetry)**:
  - Mở rộng `checkIsTeleport` nhận diện tham số `hasEventCard`, các ô sự kiện và bước nhảy qua ô Khởi Hành (GO), triệt tiêu hoàn toàn báo động giả `INVALID_POSITION_STEP`.

## 3. CÁC FILE CAN THIỆP
1. `src/client/3d/camera_state_machine.ts`
2. `src/client/ui/lobby/pre_match_deck.tsx`
3. `src/client/ui/lobby/player_slot_card.tsx`
4. `src/client/telemetry/telemetry_delta_hook.ts`
5. `src/client/3d/post_processing_pipeline.tsx`
6. `tests/client/mobile_cam_perf_and_telemetry_hardening.test.ts`
7. `docs/domain/gotchas.md` (Gotcha #135)
