# Kế Hoạch Cải Tiến IMP-94: Quân Cờ Con Vật 3D, Màu Sắc Cá Nhân Hóa & Đánh Dấu Chủ Quyền Nhà Đất

## 1. Mục Tiêu Kỹ Thuật & Yêu Cầu Người Dùng
1. **Quân cờ hình dạng con vật**: Chuyển đổi toàn diện 4 quân cờ sang hình dạng con vật (🐕 Chó Corgi, 🐈 Mèo Maneki, 🐎 Ngựa Phong Vân, 🐘 Voi Hoàng Gia) theo cơ chế xáo trộn ngẫu nhiên tất định bằng `assignRandomPlayerPawns`.
2. **Đánh dấu chủ quyền nhà đất theo con vật**: Đánh dấu quyền sở hữu của người mua trên các ô đất bằng hình con vật đại diện của người đó. Nhận diện rõ bằng mắt thường qua cọc cờ, khiên gia huy và huy hiệu ghim 2.5D xoay trực diện camera, không làm rối loạn dải màu ô cờ, tên đường hay khối nhà đồ chơi.
3. **Màu sắc cá nhân hóa**: Mỗi người chơi được gán ngẫu nhiên một màu sắc riêng biệt từ bảng màu văn hóa (`PLAYER_TOKEN_PALETTE`). Quân cờ 3D (đĩa hào quang, vòng men) và đánh dấu nhà đất (viền chân đế, cọc cờ, huy hiệu ghim) đi theo đúng màu sắc đó.

---

## 2. Thiết Kế Kiến Trúc & Luồng Dữ Liệu

```
[Phòng Chơi / Seed]
        │
        ▼
[assignRandomPlayerPawns (Mulberry32 PRNG)]
        │
        ├─────────────────────────────┬─────────────────────────────┐
        ▼                             ▼                             ▼
[pawnSlot (0..3)]            [tokenColor (Màu)]             [mascotIcon (Linh Vật)]
        │                             │                             │
        ├─────────────────────────────┴─────────────────────────────┤
        ▼                                                           ▼
[PlayerHudInfo / Store]                                     [computeOwnerMap]
        │                                                           │
        ▼                                                           ▼
[LuxuryPawnModel]                                           [LayeredDioramaTile]
• Đĩa hào quang (PawnAuraPedestal)                          • Viền đế ô đất (OwnerBaseTrim)
• Vòng men (EnamelRing)                                     • Khiên gia huy (MascotCrestShield)
• Mô hình con vật GLB                                       • Cờ phướn & Huy hiệu ghim 2.5D
```

---

## 3. Các Trụ Cột Kỹ Thuật

### Trụ Cột 1: Phân Bổ Ngẫu Nhiên Xác Định Quân Cờ & Màu Sắc (`src/domain/pawn_assignment.ts`)
- Mở rộng hàm `assignRandomPlayerPawns`:
  * Nhận danh sách người chơi (`playerIds`) và mã phòng/seed (`roomCodeOrSeed`).
  * Sử dụng thuật toán FNV-1a hash và Mulberry32 PRNG để xáo trộn ngẫu nhiên nhưng tất định.
  * Xáo trộn đồng thời 4 slot con vật [0..3] và danh sách màu từ `PLAYER_TOKEN_PALETTE`.
  * Trả về mảng `PawnAssignmentResult`: `{ playerId, slotIndex, pawnConfig, tokenColor, mascotIcon, mascotName }`.
- Đảm bảo 100% người chơi trong phòng có màu sắc và con vật độc nhất, không trùng lặp.

### Trụ Cột 2: Đồng Bộ Trạng Thái Màu Sắc & Linh Vật Vào Client Store
- Mở rộng `PlayerHudInfo` trong `src/client/store/game_store_types.ts`:
  * Thêm các trường: `pawnSlot?: number; ownerSlot?: number; mascotIcon?: string; mascotName?: string; tokenColor?: string;`.
- Cập nhật `src/client/3d/board_layout.tsx` (`computeOwnerMap`):
  * Lấy `ownerSlot`, `tokenColor`, và `mascotIcon` thực tế từ `playersInfo`.
  * Truyền trực tiếp vào `LayeredDioramaTile` cho các ô đất đã mua.
- Cập nhật `src/client/3d/pawn_animator.tsx`:
  * Truyền `playerColor` và `assignedSlot` (từ `pawnSlot ?? ownerSlot`) vào `LuxuryPawnModel`.
  * Áp dụng cho cả quân cờ đứng tĩnh và quân cờ nhảy lò xo (`ActiveSpringPawn`, `SingleHopPawn`).
- Cập nhật Sảnh chờ (`src/client/store/lobby_store.ts` & `src/client/ui/player_card.tsx`):
  * `initLobby` tự động gán ngẫu nhiên màu sắc và slot con vật theo `roomCode`.
  * `PlayerCard` ưu tiên đọc `pawnSlot ?? ownerSlot` để render đúng icon con vật và màu sắc.

### Trụ Cột 3: Hiển Thị Quân Cờ 3D & Đánh Dấu Nhà Đất Trực Quan Nhẹ Nhàng
- **Quân Cờ 3D (`LuxuryPawnModel`)**:
  * Đĩa hào quang phát sáng (`PawnAuraPedestal`) hiển thị đúng `playerColor`.
  * Vòng men sứ (`EnamelRing`) hiển thị đúng `playerColor`.
  * Mô hình con vật đúc bạc/chrome nguyên khối (`pawn_dog.glb`, `pawn_cat.glb`, `pawn_horse.glb`, `pawn_elephant.glb`).
- **Đánh Dấu Nhà Đất (`LayeredDioramaTile` & `OwnershipMarkerInstances`)**:
  * Viền chân đế (`OwnerBaseTrim`): Bọc dưới chân ô đất mang màu sắc chủ sở hữu.
  * Khiên gia huy (`MascotCrestShield`): Vành vàng, mặt khiên mang màu chủ sở hữu và icon con vật.
  * Cờ phướn (`FlagCloth`): Nền mang màu chủ sở hữu.
  * Huy hiệu ghim 2.5D (`OwnershipBillboardPin`): Tự động xoay trực diện camera (`SafeBillboard`), hiển thị icon con vật trên nền màu chủ sở hữu mà không che khuất dải màu ô đất hay khối nhà đồ chơi.

---

## 4. Kế Hoạch Kiểm Thử & Tiêu Chí Nghiệm Thu (DoD)
1. **Kiểm thử hợp đồng Trạm 1 (RED Contract)**:
   - `tests/client/animal_pawns_and_custom_ownership.test.ts`: >= 30 atomic tests trên ma trận 4 Facets (Boundary, State Reactivity, Resource Disposal, Error Defense).
   - Xác thực Inversion Gate (chứng minh test FAILS trước khi triển khai).
2. **Kiểm thử hồi quy Trạm 2**:
   - 100% test suites liên quan PASS (`chrome_pawns_and_toy_buildings.test.ts`, `urban_density_and_craft.test.ts`, v.v.).
   - `npm run lint:ui`: 0 violations.
   - `npx tsc --noEmit`: 0 errors.
3. **Thẩm định độc lập Trạm 3**:
   - `spec-reviewer`: Đạt kiểm định kiến trúc và không rò rỉ ranh giới nghiệp vụ (Scope Drift).
   - `game-3d-visual-critic`: Đạt nghiệm thu thẩm mỹ 3D trên ảnh kết xuất 2K (`disposition: ship`).
