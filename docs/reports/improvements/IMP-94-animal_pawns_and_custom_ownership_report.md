# Báo Cáo Nghiệm Thu Cải Tiến IMP-94: Quân Cờ Con Vật 3D, Màu Sắc Cá Nhân Hóa & Đánh Dấu Chủ Quyền Nhà Đất

> **Mã số:** IMP-94  
> **Tên gói cải tiến:** Animal Pawns, Personalized Colors & Custom Ownership Markers  
> **Trạng thái:** 🟢 **Hoàn Tất & Nghiệm Thu**  
> **Ngày hoàn thành:** 16/09/2026  
> **Quy trình áp dụng:** 3 Trạm Nghiêm Ngặt (Adversarial TDD ➔ GREEN Implementation ➔ Dual Reviewer Audit)  

---

## 1. Mục Tiêu Kỹ Thuật & Yêu Cầu Người Dùng

Gói cải tiến IMP-94 giải quyết trọn vẹn 3 yêu cầu cốt lõi của người dùng:
1. **Quân cờ hình dạng con vật**: Chuyển đổi toàn diện 4 quân cờ sang hình dạng con vật (🐕 Chó Corgi, 🐈 Mèo Maneki, 🐎 Ngựa Phong Vân, 🐘 Voi Hoàng Gia) theo cơ chế bốc thăm ngẫu nhiên tất định bằng `assignRandomPlayerPawns`.
2. **Đánh dấu chủ quyền nhà đất theo con vật**: Đánh dấu quyền sở hữu của người mua trên các ô đất bằng hình con vật đại diện của người đó. Nhận diện rõ ràng bằng mắt thường qua cọc cờ, khiên gia huy và huy hiệu ghim 2.5D xoay trực diện camera, không làm rối loạn dải màu ô cờ, tên đường hay khối nhà đồ chơi xanh/đỏ dập nổi.
3. **Màu sắc cá nhân hóa**: Mỗi người chơi được gắn ngẫu nhiên một màu sắc riêng biệt từ bảng màu văn hóa (`PLAYER_TOKEN_PALETTE`). Quân cờ 3D (đĩa hào quang, vòng men) và đánh dấu nhà đất (viền chân đế, cọc cờ, huy hiệu ghim) đi theo đúng màu sắc đó.

---

## 2. Nhật Ký Tiến Trình 3 Trạm (3-Station Pipeline)

### Trạm 1: RED Contract Test (Adversarial Inversion)
- **Tệp kiểm thử:** `tests/client/animal_pawns_and_custom_ownership.test.ts` (719 dòng).
- **Quy chuẩn 4 Facet:**
  * **Facet 1: Boundary & Determinism (10 tests)**: Phân bổ ngẫu nhiên xác định 4 slot con vật `[0..3]` và bảng màu văn hóa `PLAYER_TOKEN_PALETTE`, không trùng lặp, tất định theo seed/roomCode.
  * **Facet 2: State Reactivity & Visual Sheen (14 tests)**: Đồng bộ màu sắc `playerColor` vào đĩa hào quang `pawn-aura-pedestal`, vòng men `pawn-enamel-ring`, viền chân đế `owner-base-trim`, khiên gia huy `mascot-crest-shield`, và huy hiệu ghim `ownership-billboard-pin`.
  * **Facet 3: Resource Disposal & SSR Safety (4 tests)**: Render tĩnh không crash, idempotent markup, dọn dẹp an toàn store Zustand sau test.
  * **Facet 4: Error Defense & Preservation Invariants (10 tests)**: Phòng thủ seed rỗng, danh sách players rỗng, ô đất không chủ (`ownerColor: undefined`), bảo toàn 100% testids hiện hữu (`toy-property-building`, `toy-house`, `toy-hotel`, `miniature-city-diorama`, `dice-tray`).
- **Tổng số atomic tests:** **38 tests** (vượt chuẩn sàn >= 15 tests).
- **Inversion Gate:** Xác thực kiểm thử thất bại (10 tests failed Business RED) trước khi có code triển khai.

### Trạm 2: GREEN Implementation (Thực Thi Mã Nguồn Tối Thiểu)
1. `src/domain/pawn_assignment.ts`: Mở rộng `assignRandomPlayerPawns` xáo trộn đồng thời 4 slot con vật và các màu sắc từ `PLAYER_TOKEN_PALETTE` bằng thuật toán FNV-1a và Mulberry32 PRNG.
2. `src/client/store/game_store_types.ts`: Bổ sung `pawnSlot`, `ownerSlot`, `mascotIcon`, `mascotName`, `tokenColor` vào `PlayerHudInfo`.
3. `src/client/3d/board_layout.tsx`: `computeOwnerMap` lấy `ownerSlot`, `tokenColor`, và `mascotIcon` thực tế từ `playersInfo` truyền vào `LayeredDioramaTile`.
4. `src/client/3d/pawn_animator.tsx`: Nạp `playerColor` và `assignedSlot` vào `LuxuryPawnModel` (cả quân cờ đứng yên và nhảy lò xo `ActiveSpringPawn` / `SingleHopPawn`).
5. `src/client/store/lobby_store.ts`: `initLobby` tự động gán ngẫu nhiên `tokenColor`, `pawnSlot`, `mascotIcon` theo `roomCode`.
6. `src/client/network/use_app_session.ts` & `apply_delta_players.ts`: Đồng bộ `pawnSlot` và `mascotIcon` sang `playersInfo`.
7. `src/client/ui/player_card.tsx`: `getSlotFromPlayer` ưu tiên đọc `player.pawnSlot ?? player.ownerSlot` trước khi fallback ID.
8. `src/client/3d/luxury_pawn_models.tsx`: Đảm bảo `LuxuryPawnModel` nhận và hiển thị `playerColor` trên đĩa hào quang `pawn-aura-pedestal` và vòng men `pawn-enamel-ring`.

### Trạm 3: Independent Review & Physical Disk Verification
- **Spec Reviewer (`spec-reviewer`)**: **APPROVED** (100% tiêu chí đặc tả đối soát thành công, Zero Scope Drift, 11/11 file tuân thủ ngân sách LOC).
- **Game 3D Visual Critic (`game-3d-visual-critic`)**: Thẩm định bộ ảnh kết xuất 2K trên môi trường thực tế máy chủ.
- **Physical Disk Verification**:
  * Đã kiểm tra trực tiếp 3 file ảnh 2K trên đĩa: `stage3_model_railroad_day_2k.jpg`, `stage3_model_railroad_sunset_2k.jpg`, `lobby_tactile_deck_2k.jpg`.
  * PlayerCards hiển thị 4 người chơi với 4 linh vật và 4 màu sắc riêng biệt (🐕 Đỏ, 🐈 Xanh biển, 🐎 Cam, 🐘 Tím).
  * Các ô đất đã mua hiển thị đúng viền chân đế (`OwnerBaseTrim`) và cọc cờ mang màu sắc và linh vật tương ứng của chủ nhân.

---

## 3. Bằng Chứng Kiểm Định Thực Tế (Physical Evidence)

```
Test Files  1 passed (1)
     Tests  38 passed (38)
  Duration  1.24s

✓ tests/client/animal_pawns_and_custom_ownership.test.ts (38 tests) 100% PASS
✓ tests/client/chrome_pawns_and_toy_buildings.test.ts (35 tests) 100% PASS
✓ npm run lint:ui: 0 violations across 139 files
✓ npx tsc --noEmit: 0 errors
```

---

## 4. Invariant Mới Ghi Nhận (`docs/domain/gotchas.md`)

- **Gotcha #125**: `[3D/SSR/TEST] Bất Biến Đồng Bộ Màu Sắc & Slot Con Vật Quân Cờ 3D Trong Môi Trường SSR Headless (SSR Pawn Model URL & Dynamic Store Access Invariant - IMP-94)`:
  1. *SSR Model Traceability*: Thẻ `<group>` bọc ngoài của `LuxuryPawnModel` bắt buộc mang `data-model-url={config.modelUrl}` để trong môi trường SSR/Static Markup, hợp đồng kiểm định mô hình GLB luôn hiện diện và xác thực được.
  2. *Dual-Path SSR Store Access*: Trong `pawn_animator.tsx`, áp dụng `const isSSR = typeof window === 'undefined'; const playersInfo = isSSR ? useGameStore.getState().playersInfo : storePlayersInfo;` loại bỏ hoàn toàn bẫy snapshot cũ của React 19 SSR.

---

## 5. Kết Luận & Nghiệm Thu
Gói cải tiến IMP-94 đã được hoàn thiện 100%, đáp ứng trọn vẹn yêu cầu thẩm mỹ và kỹ thuật của người dùng, sẵn sàng vận hành trên máy chủ `http://localhost:3000/`.
