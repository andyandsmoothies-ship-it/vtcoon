# KẾ HOẠCH CẢI TIẾN IMP-09: SẢNH CHỜ 3D PENTHOUSE LOUNGE (GIAI ĐOẠN 3)

## 1. BỐI CẢNH & MỤC TIÊU
- **Hiện trạng trước cải tiến**: Màn hình Sảnh Chờ (Lobby) sử dụng các thẻ HTML chiếm gần như toàn bộ diện tích màn hình trên nền bàn cờ sa bàn mờ nhạt, chưa truyền tải được đẳng cấp thượng lưu và trải nghiệm gặp gỡ trước trận đấu của các đại gia bất động sản.
- **Mục tiêu thương mại 2026**: Hiện thực hóa 100% Ảnh Concept 3 (VIP Waiting Room Penthouse Lounge):
  1. Dựng không gian nội thất căn Penthouse tầng 80 với vách kính cong kịch trần, khung nhôm xước mờ nhìn ra toàn cảnh bán đảo vịnh biển ngập tràn ánh hoàng hôn ấm áp.
  2. Mặt sàn đá cẩm thạch trắng Carrara bóng loáng phản chiếu chân thực (`MeshReflectorMaterial`).
  3. Bàn tròn cẩm thạch trung tâm viền gỗ óc chó bo mép, tích hợp máy chiếu ba chiều (Hologram Projector) phát ra mô hình thu nhỏ phát quang của bàn cờ VTCOON và màn hình HUD holographic lơ lửng.
  4. 4 ghế da sang trọng quanh bàn tròn (góc 125°, 215°, 305°, 35°) tương ứng 4 vị trí kết nối thời gian thực, hiển thị avatar người chơi/bot kèm bảng tên 3D phát quang và nhịp thở vi mô.
  5. Tinh gọn giao diện Sảnh Chờ (LobbyView): Thu nhỏ bảng điều khiển thành một thẻ Glassmorphism mỏng nổi bên cánh phải, giữ lại 80% màn hình cho người chơi thưởng ngoạn và tự do xoay góc nhìn phòng Penthouse 3D.

---

## 2. PHẠM VI & NỘI DUNG TRIỂN KHAI
- `src/client/3d/penthouse_texture_generator.ts` (NEW): Bộ sinh `CanvasTexture` thủ tục cho màn hình HUD holographic và hậu cảnh vịnh biển hoàng hôn với các vệt sáng đô thị rực rỡ.
- `src/client/3d/penthouse_lobby_scene.tsx` (NEW): Kiến trúc nội thất Penthouse VIP, sàn phản chiếu `MeshReflectorMaterial`, thảm nhung viền vàng, trần giật cấp đèn cove LED, bàn cờ sa bàn mini holographic lơ lửng và 4 ghế da kèm avatar người chơi.
- `src/client/game_canvas.tsx`: Bổ sung `isLobby` prop, khi ở sảnh chờ sẽ kích hoạt `PenthouseLobbyScene` với hệ thống chiếu sáng hoàng hôn ấm áp.
- `src/client/main.tsx`: Truyền `isLobby` vào `<GameCanvas />` khi `!gameStarted`, cấu hình `pointer-events` cho phép xoay tự do sa bàn 3D trong sảnh chờ.
- `src/client/ui/lobby/lobby_view.tsx`: Chuyển đổi layout thành thẻ Glassmorphism mỏng nổi bên cánh phải (`aside`), bảo toàn 100% data-testids và chức năng điều khiển phòng.
- `tests/client/penthouse_lobby_scene.test.ts` (NEW): 21 bài kiểm thử tự động xác thực kích thước kiến trúc, tọa độ 4 ghế, dao động điều hòa hologram, nhịp thở vi mô và hợp đồng kiến trúc.

---

## 3. CHỈ TIÊU NGHIỆM THU (DOD)
1. 100% kiểm tra TypeScript biên dịch sạch sẽ (`npx tsc --noEmit` = 0 lỗi).
2. Toàn bộ 102 test suites vượt qua với 1.190+ automated tests (Zero Regression).
3. Kiến trúc căn phòng tuân thủ tỷ lệ vàng phòng khách VIP, 4 ghế bọc da nằm trọn vẹn trên thảm nhung tròn.
4. Giao diện sảnh chờ duy trì thông thoáng 80% diện tích màn hình, hỗ trợ thao tác chuột xoay OrbitControls mượt mà.
