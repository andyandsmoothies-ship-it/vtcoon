# Kế Hoạch Cải Tiến Kỹ Thuật: IMP-105 — 4 Quân Cờ Xe - Pháo - Mã - Hậu (Full Body Player Color & Zero Inox)

## 1. BỐI CẢNH & PHẢN HỒI NGƯỜI DÙNG
- **Yêu cầu từ người dùng**: "Cập nhật các con cờ thành 4 con random là con xe, pháo, mã, hậu và mỗi con có 1 màu riêng toàn bộ luôn, không còn màu inox nữa".
- **Các điểm bất cập trước cải tiến**:
  1. 4 quân cờ cũ là linh vật con vật (🐕 Chó, 🐈 Mèo, 🐎 Ngựa, 🐘 Voi).
  2. Toàn bộ thân quân cờ đúc bằng chất liệu chrome bạc/inox xám lạnh (`#F8FAFC`, `#E2E8F0`, `metalness: 0.96`), chỉ có đĩa hào quang nhỏ dưới chân mang màu người chơi, khiến người chơi khó phân biệt quân cờ của nhau từ góc nhìn xa trên bàn cờ.

## 2. THIẾT KẾ & GIẢI PHÁP THỰC THI (3-STATION PIPELINE)
1. **Chuẩn Hóa Bộ 4 Quân Cờ (Xe, Pháo, Mã, Hậu)**:
   - Slot 0: **Quân Xe Chiến Hoàng Gia** 🏰 (Rook) — model `/models/pawns/pawn_rook.glb`.
   - Slot 1: **Quân Pháo Thần Công Cổ Điển** 💣 (Cannon) — model `/models/pawns/pawn_cannon.glb`.
   - Slot 2: **Quân Mã Phong Vân Thượng Lưu** 🐎 (Knight) — model `/models/pawns/pawn_horse.glb`.
   - Slot 3: **Quân Hậu Quyền Quý Indochine** 👑 (Queen) — model `/models/pawns/pawn_queen.glb`.
2. **Triệt Tiêu 100% Màu Inox (Zero Inox Invariant)**:
   - Loại bỏ vĩnh viễn các mã màu xám bạc inox `#F8FAFC` và `#E2E8F0`.
   - Giảm độ phản xạ kim loại từ `metalness: 0.96` xuống `0.25` (trần <= 0.40).
   - Đặt độ nhám `roughness: 0.28` tạo chất liệu men sứ sơn bóng đồ chơi diorama cao cấp.
3. **Phủ 100% Màu Sắc Người Chơi Lên Toàn Thân Quân Cờ (Full-Body Player Color)**:
   - Mọi mesh tạo hình thân chính của 4 quân cờ đều nhận `activeColor = playerColor || config.color` (P1 Đỏ `#DC2626`, P2 Xanh lá `#27AE60`, P3 Cam `#E67E22`, P4 Xanh lục bảo `#10B981`).
   - Đĩa hào quang `PawnAuraPedestal` và vòng men `EnamelRing` đồng bộ cùng màu người chơi.
4. **Bốc Thăm Ngẫu Nhiên Tất Định Không Trùng Lặp**:
   - `assignRandomPlayerPawns` bốc ngẫu nhiên 4 slot và 4 màu sắc từ `PLAYER_TOKEN_PALETTE` bằng thuật toán Fisher-Yates kết hợp PRNG Mulberry32 theo mã phòng `roomCode`.
5. **Đồng Bộ Hóa Ground Truth SSOT**:
   - Cập nhật mục §I tại `docs/requirements.md` và ghi nhận Gotcha #141 vào `docs/domain/gotchas.md`.

## 3. CÁC TỆP CAN THIỆP
1. `src/client/3d/luxury_pawn_models.tsx`
2. `src/client/3d/luxury_pawn_fallbacks.tsx`
3. `src/domain/pawn_assignment.ts`
4. `docs/requirements.md`
5. `docs/domain/gotchas.md` (Gotcha #141)
6. `tests/client/chess_pawns_full_color_no_inox.test.ts`
