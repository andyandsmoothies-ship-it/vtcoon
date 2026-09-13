# [IMP-26] Kế Hoạch Chuyển Đổi Sảnh Chờ Tabletop-First, Thẻ PreMatchDeck & Đối Chuẩn Retropoly

## Bối Cảnh & Vấn Đề Gốc Rễ (Root Cause Analysis)
Qua các đợt đánh giá giao diện sảnh chờ trước đây (`IMP-20`, `IMP-21`), giao diện vẫn chưa đạt được cảm giác tự nhiên, hấp dẫn của các tựa game cờ bàn tỷ phú hàng đầu như Retropoly:
1. **Lobby và Trận Đấu Bị Chia Cắt**: Sảnh chờ dùng một bối cảnh riêng biệt (đĩa tròn cẩm thạch trắng) thay vì để người chơi tương tác trực tiếp với bàn cờ 40 ô thật ngay từ đầu.
2. **Hội Chứng Bảng Biểu Admin**: Thẻ sảnh chờ cũ chiếm diện tích lớn, dùng nền đen tối (`bg-slate-950/85`) che khuất đến 60% sa bàn nhiệt đới, tạo cảm giác như một form cài đặt phần mềm quản trị thay vì một game cờ tỷ phú tươi sáng.
3. **Quân Cờ Thiếu Vắng Khi Chuẩn Bị**: Người chơi và các Bot AI vào phòng nhưng bàn cờ 3D không hiển thị quân cờ của họ, làm mất đi sự kết nối trực quan.
4. **Chuyển Cảnh Gián Đoạn**: Khi nhấn bắt đầu trận đấu, Canvas phải unmount hoặc reload cảnh 3D gây giật màn hình.

---

## Giải Pháp Bất Biến (Tabletop-First Invariant)
1. **Mô Hình Tabletop-First 100%**:
   - `GameCanvas` khởi tạo và hiển thị trực tiếp `GameBoard` (bàn cờ 40 ô, đô thị Landmark, biển ngọc bích, bãi cát nhiệt đới) ngay từ khi mở game, không dùng cảnh sảnh chờ riêng biệt.
2. **Thẻ Sảnh Chờ Tinh Gọn `PreMatchDeck`**:
   - Thẻ mỏng nhẹ bo tròn chuẩn thương mại (`bg-[#0A1628]/80 backdrop-blur-2xl border-amber-400/50 ring-1 ring-amber-300/30`).
   - Cố định ở góc trên bên phải màn hình (rộng 360-380px), giải phóng 88% diện tích cho sa bàn 3D.
   - Nút ẩn/hiện `🏙️ Ngắm 3D` / `📋 Bảng` mở rộng không gian chiêm ngưỡng 100%.
   - Footer 2 tầng (2-Tier Stack): Hàng trên hiển thị hướng dẫn nổi bật, hàng dưới là nút `← Rời Phòng` và nút `BẮT ĐẦU TRẬN ĐẤU` vát cạnh 3D tactile.
3. **Triệu Hồi Quân Cờ Trực Tiếp Trên Ô Khởi Hành (Live Pawn Placement)**:
   - Các vị trí người chơi và Bot AI trong sảnh chờ được đặt trực tiếp lên Ô Khởi Hành (GO / Cell 0) của bàn cờ 3D thật với 4 tượng kim loại PBR sang trọng (Tháp vàng, Du thuyền bạc, Xe cổ đồng, Ngựa chiến sapphire).
4. **Góc Máy Quay Điện Ảnh Chuẩn Retropoly (38° Perspective)**:
   - Cấu hình chế độ `pre_match` trong `CameraStateMachine`: `position: [18.5, 19.5, 18.5]`, `target: [-0.8, 0, -0.8]`, `fov: 40`, bao quát toàn cảnh vịnh biển ngọc bích và đô thị sầm uất.
5. **Chuyển Cảnh Không Gián Đoạn (Zero-Loading Transition)**:
   - Nhấn "BẮT ĐẦU TRẬN ĐẤU": Thẻ sảnh chờ trượt êm ra ngoài, HUD trong trận trượt vào, camera swoop-in và xúc xắc rơi xuống bàn cờ tức thì mà không cần tải lại trang.

---

## Sơ Đồ Luồng Khởi Tạo & Chuyển Cảnh
```
[Mở Ứng Dụng / Vào Sảnh Chờ]
            │
            ▼
[GameCanvas Khởi Tạo Tabletop Thật] ──► Render 40 Ô Bàn Cờ, Sa Bàn Đảo Ngọc & Biển Sống
            │
            ├──► Camera: Chế độ pre_match (Góc 38°, FoV 40)
            ├──► Ô Khởi Hành (Cell 0): Hiển thị quân cờ thật của Host & Bot AI
            └──► Góc Phải: Thẻ PreMatchDeck Navy Thủy Tinh (Chiếm < 12% màn hình)
            │
[Bấm "BẮT ĐẦU TRẬN ĐẤU"]
            │
            ▼
[Zero-Loading Transition] ──► PreMatchDeck trượt ra, HUD in-game trượt vào, Xúc xắc 3D rơi
```

---

## Chi Tiết Triển Khai (File Changes)

### 1. `src/client/main.tsx` & `src/client/game_canvas.tsx`
- Loại bỏ logic tách rẽ sảnh chờ cũ, hiển thị `GameBoard` ngay khi khởi tạo ứng dụng.
- Truyền danh sách người chơi sảnh chờ vào hệ thống quân cờ với vị trí mặc định tại Cell 0.

### 2. `src/client/3d/camera_state_machine.ts`
- Bổ sung cấu hình chế độ máy quay `pre_match` bao quát toàn bộ hòn đảo nhiệt đới ở góc nghiêng 38°.

### 3. `src/client/ui/lobby/pre_match_deck.tsx`
- Xây dựng component thẻ sảnh chờ thủy tinh Navy Hoàng Gia siêu mỏng nhẹ.
- Tích hợp sao chép mã phòng 6 ký tự, quét mã QR, cấu hình luật chơi tóm tắt và danh sách 4 vị trí người chơi / Bot AI.

### 4. `src/client/ui/action_dock.tsx` & `src/client/ui/hud/top_bar.tsx`
- Tinh chỉnh nút "Đổ Xúc Xắc" sang phong cách 3D tactile đỏ cam rực rỡ với đổ bóng đa tầng.
- Bổ sung viền vàng Champagne và nút bật/tắt âm thanh trực tiếp trên thanh điều hướng trên cùng.

---

## Kế Hoạch Nghiệm Thu (Verification Plan)
1. **Kiểm thử tự động**:
   - Chạy toàn bộ test suite client và server: `npm test` đạt 100% pass.
   - Kiểm tra linter giao diện: `npm run lint:ui` đạt 0 vi phạm anti-patterns.
   - Kiểm tra TypeScript nghiêm ngặt: `npx tsc --noEmit` không có lỗi.
2. **Nghiệm thu hình ảnh thực tế (1080p)**:
   - Chụp ảnh sảnh chờ 1 người chơi: `stage2_pre_match_1920x1080.jpg`.
   - Chụp ảnh sảnh chờ 4 người chơi (1 Người + 3 Bot AI) có quân cờ đứng tại Ô Khởi Hành: `stage2_lobby_with_bots_1080p.jpg`.
   - Chụp ảnh giao diện lượt đầu tiên trong trận sau khi chuyển cảnh: `stage2_ingame_turn1_1080p.jpg`.
