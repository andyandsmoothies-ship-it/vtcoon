# Sổ Cái Tiến Độ Epic 2: 3D Visual & DOM UI/UX Overlay (VTCoOn)

> **Kích hoạt:** 2026-09-09 — Giai đoạn 1 Sign-off hoàn tất (433/433 Tests PASS).
> **Căn cứ kiến trúc:** `docs/domain/adr/ADR-0002-r3f-rendering.md` · `docs/domain/design.md`
> **Mục tiêu Epic:** Nâng cấp `game_canvas.tsx` (56 dòng khối hộp hình học thô) thành hệ thống giao diện hoàn chỉnh:
> Sa bàn 3D mặt gỗ/đá 40 ô địa phương · Standee 2.5D Billboard · Hoạt ảnh Lò Xo · Xúc Xắc Vật Lý · HUD Tài Chính · Modals Nghiệp Vụ · Audio Không Gian Vùng Miền.

---

## Kiến Trúc Phân Tầng (Stack Blueprint)

```
[LỚP 2: DOM/HTML UI Overlay — Z-Index 10, Tailwind CSS + Framer Motion]
  → HUD Tài chính (Zustand)  → Modals (Title Deed, Đấu Giá, P2P Trade, Thẻ Sự kiện)
                          ↕ (Zustand GameStore)
[LỚP 1: WebGL Canvas — Z-Index 0, React Three Fiber]
  → Sa bàn 3D Procedural 40 ô  → Standee 2.5D Billboard  → Xúc Xắc Rapier Physics
  → Pawn Spring Animation       → Tier Marker Cylinders    → Particle VFX (Cấp 3)
```

**Công nghệ chốt:**
| Lớp | Công nghệ |
|---|---|
| 3D Render | `@react-three/fiber` + `@react-three/drei` |
| Spring Animation | `@react-spring/three` |
| Physics Xúc xắc | `@react-three/rapier` |
| DOM Overlay | Tailwind CSS + Framer Motion |
| State Bridge | Zustand (`useGameStore`) |
| Audio | `howler.js` (Spatial Audio) |
| Asset Pipeline | WebP 512×512px, ≤ 45KB/lớp |

---

## Danh Sách 5 Vertical Slices

### Slice UI-01: Sa Bàn 3D Procedural & Standee 2.5D Billboard 40 Ô Địa Phương
- **Use Case Ref:** UC-GAME-004 (Render bàn cờ), UC-GAME-016 (Di chuyển quân cờ), design.md (28 ô tài sản + bảng màu nhóm đất)
- **Flow Paths:**
  - MSS: Khởi tạo Canvas → Render 40 ô Orthographic → Billboard Standee xoay theo camera → Tier Marker hiển thị cấp độ.
  - A1: Ô cạnh góc (GO, Trạm Kiểm Toán, Ân Xá, Bãi Đỗ) render mesh riêng kích thước 2×2.
  - A2: Ô chưa có asset WebP → hiển thị placeholder màu nhóm đất.
- **Value Delivered:** Thay thế hoàn toàn `BoardCellMesh` hộp xám đơn điệu bằng sa bàn 3D có chất liệu gỗ/đá chuẩn mỹ thuật địa phương.
- **Lifecycle Status:** ✅ Hoàn Thành (Done - 2026-09-09) · 451/451 Tests PASS · Visual Smoke Gate Verified
- **Tech Stack:** R3F · Drei (`Billboard`, `OrthographicCamera`, `OrbitControls`, `Image`) · `@react-spring/three`
- **Test Contracts (Visual & Unit):**
  - `TC-UI01.1`: [Khởi tạo GameCanvas] → [40 mesh ô hiển thị đúng tọa độ vòng chu vi, không chồng lấn, camera Orthographic zoom=35]
  - `TC-UI01.2`: [Ô có groupColor] → [Vạch màu nhận diện nhóm đất render đúng HEX trên mặt đế, phân biệt 6 nhóm màu]
  - `TC-UI01.3`: [Billboard Standee] → [Mặt phẳng ảnh luôn xoay hướng camera khi dùng `<Billboard follow>`]
  - `TC-UI01.4`: [currentLevel > 0] → [Tier Marker cylinders xếp chồng đúng số lượng và màu sắc (Teal Cấp1-2, Gold Cấp3)]
  - `TC-UI01.5`: [Ô góc bàn cờ (index 0, 10, 20, 30)] → [Render mesh 2×2 với màu nền riêng biệt (xám đậm)]
- **Tech Debt nếu Defer:** Preloading toàn bộ 28 bộ ảnh bằng `useImage.preload()` → đăng ký vào UI-02 Tech Debt Ledger.
- **LOC Budget:** game_canvas.tsx ≤ 300L · board_tile.tsx [NEW] ≤ 200L · board_layout.tsx [NEW] ≤ 150L

---

### Slice UI-02: Chuyển Động Quân Cờ Lò Xo & Xúc Xắc 3D Rơi Vật Lý
- **Use Case Ref:** UC-GAME-016 (Di chuyển quân cờ), UC-GAME-011 (Đổ xúc xắc), ADR-0002 §4 (Spring Animation), ADR-0002 §3 (Rapier Physics)
- **Flow Paths:**
  - MSS: FSM emit `DICE_ROLLED` → Xúc xắc 3D rơi vật lý → Hiển thị kết quả → Pawn nhảy từng ô theo Spring `tension:170 friction:12`.
  - A1: Đổ đôi (doubles) → Highlight xúc xắc vàng, pawn nhảy liên tiếp không dừng.
  - A2: Vật lý xúc xắc kết thúc (onSleep) → emit kết quả số chấm về FSM.
- **Value Delivered:** Hoạt cảnh bàn cờ sống động — xúc xắc rơi vật lý thật và quân cờ nhảy đàn hồi từng ô.
- **Lifecycle Status:** ✅ Hoàn Thành (Done - 2026-09-09) · 474/474 Tests PASS · Visual Smoke Gate Ready
- **Tech Stack:** `@react-spring/three` (useSpring) · Zustand dispatch · Procedural 3D Dice Tray
- **Test Contracts (Visual & Unit):**
  - `TC-UI02.1`: [calculatePathWaypoints & getParabolicHeight] → [Tính đúng bước nhảy wrap-around qua ô 0 và quỹ đạo parabol]
  - `TC-UI02.2`: [getDiceFaceRotation(1..6)] → [Ánh xạ chính xác 6 góc Euler phân biệt hướng lên camera]
  - `TC-UI02.3`: [useGameStore dice & isRolling] → [Kích hoạt rơi xúc xắc, chặn giá trị ngoài 1-6]
  - `TC-UI02.4`: [startPawnMove & completePawnMove] → [Quản lý hoạt ảnh quân cờ nhảy từng ô, chống ghi đè khi đang chạy]
  - `TC-UI02.5`: [preloadTileAssets] → [Sinh đủ 112 URLs chuẩn format, đóng triệt để DEBT-UI01-01]
- **Tech Debt Nhận từ UI-01:** ✅ Đã đóng `DEBT-UI01-01` qua `src/client/assets/tile_assets.ts`.
- **LOC Budget:** dice_tray.tsx 153L · pawn_animator.tsx 138L · pawn_path.ts 61L · dice_math.ts 33L · tile_assets.ts 43L

---

### Slice UI-03: DOM HUD Tài Chính & Bảng Điều Khiển Tương Tác Người Chơi
- **Use Case Ref:** UC-GAME-002 (Thông tin người chơi), UC-GAME-016 (Hành động lượt chơi), ADR-0002 §2 (DOM Overlay Z-10)
- **Flow Paths:**
  - MSS: Zustand `gameStore` → HUD hiển thị tên, avatar, số dư tiền mặt, danh sách tài sản sở hữu theo thời gian thực.
  - A1: Đến lượt người chơi → Highlight viền HUD card, nút Đổ Xúc Xắc enable.
  - A2: Số dư xuống dưới 0 → Số tiền đổi màu đỏ, icon cảnh báo phá sản.
- **Value Delivered:** Bảng điều khiển tài chính DOM thực dụng — người chơi luôn thấy trạng thái quỹ tiền và tài sản mà không cần click vào bàn cờ.
- **Lifecycle Status:** ✅ Hoàn Thành (Done - 2026-09-09) · 497/497 Tests PASS · Visual Smoke Gate Ready
- **Tech Stack:** Tailwind CSS · Zustand `useGameStore` hook · React DOM Overlay (Z-Index 10)
- **Test Contracts (Visual & Unit):**
  - `TC-UI03.1`: [Format tiền tệ thuần] → [Định dạng số nguyên dương, âm, nợ với phân tách dấu chấm, chặn NaN và -0]
  - `TC-UI03.2`: [Format thời gian đếm ngược] → [Đổi giây sang MM:SS và kẹp số âm/NaN về 00:00]
  - `TC-UI03.3`: [Tính toán Net Worth] → [Tiền mặt + Giá đất C0-C3 theo hệ số 1.0/1.5/2.5/4.0; thế chấp giảm 50% hoặc trừ dư nợ mortgageLoans]
  - `TC-UI03.4`: [Trạng thái Store HUD] → [useGameStore cập nhật playersInfo, timer, roundInfo, treasury, turn player]
  - `TC-UI03.5`: [Trạng thái Nút Action Dock] → [Nút Đổ Xúc Xắc/Hết Lượt disable khi đang gieo, đang di chuyển pawn, khác lượt hoặc phá sản]
  - `TC-UI03.6`: [Nhóm màu sở hữu] → [getOwnedColorGroups lọc đúng 8 nhóm màu không trùng lặp từ BOARD_CONFIG]
- **LOC Budget:** top_bar.tsx (54L) · player_card.tsx (113L) · player_hud_list.tsx (32L) · action_dock.tsx (116L) · hud_container.tsx (47L) · ui_helpers.ts (116L) · game_store.ts (181L)

---

### Slice UI-04: Modals Tương Tác Nghiệp Vụ (Title Deed, Đấu Giá 15s, Đàm Phán P2P, Lật Thẻ Sự Kiện)
- **Use Case Ref:** UC-GAME-020 (Mua đất), UC-GAME-022 (Đấu giá), UC-GAME-028 (P2P Trade), UC-GAME-038-050 (Thẻ sự kiện)
- **Flow Paths:**
  - MSS (Title Deed): Dừng tại ô đất → Modal Title Deed mở → Hiển thị thông tin 4 cấp độ, giá mua, nút Mua / Bỏ Qua.
  - MSS (Đấu Giá): Bỏ qua mua → Modal Auction mở, đồng hồ 15s đếm ngược, danh sách bid realtime.
  - MSS (P2P Trade): Mở modal đàm phán song phương, đề xuất giá, đối phương Chấp Thuận/Từ Chối.
  - MSS (Thẻ Sự Kiện): Rút thẻ → Hoạt ảnh lật thẻ Framer Motion → Hiển thị nội dung + nút Xác Nhận.
  - A1 (Đấu Giá): Hết 15s không ai bid → Auto-close, đất về trạng thái tự do.
- **Value Delivered:** Toàn bộ quyết định kinh doanh quan trọng được trình bày qua Modal UI rõ ràng, không gián đoạn luồng FSM.
- **Lifecycle Status:** ✅ Hoàn Thành (Done - 2026-09-09) · 521/521 Tests PASS · Visual Smoke Gate Ready
- **Tech Stack:** Tailwind CSS · Zustand `useGameStore` · React Modals Overlay (Z-Index 20)
- **Test Contracts (Visual & Unit):**
  - `TC-UI04.1`: [Tra cứu thông tin Sổ Đỏ] → [Bảng giá 4 cấp C0-C3 / 4 bậc ga Railroad, chi phí nâng cấp, ô đặc biệt trả về null]
  - `TC-UI04.2`: [Tính toán bước giá đấu giá] → [Sinh đúng [+50, +100, +200 Tr.], chuẩn hóa giá âm về 0]
  - `TC-UI04.3`: [Thuế chuyển nhượng P2P 5%] → [Tính đúng 5% (hoặc 20% vĩ mô) thuế nộp Kho Bạc, làm tròn chuẩn xác]
  - `TC-UI04.4`: [Kiểm tra hợp lệ đề xuất P2P] → [Chặn đề xuất rỗng, vượt số dư, đất đang thế chấp hoặc xung đột bù tiền]
  - `TC-UI04.5`: [Quản lý vòng đời Zustand Store] → [openModal, updateModalPayload, closeModal reset sạch sẽ]
- **LOC Budget:** modal_helpers.ts 167L · modal_backdrop.tsx 43L · title_deed_modal.tsx 169L · auction_modal.tsx 165L · trade_modal.tsx 179L · event_card_modal.tsx 96L · modal_host.tsx 109L · ui04_business_modals.test.ts 210L

---

### Slice UI-05: Hệ Thống Âm Thanh Không Gian Vùng Miền (howler.js Audio Engine)
- **Use Case Ref:** ADR-0002 §1 (howler.js), design.md §2 (Dynamic Regional Audio 4 cạnh địa lý)
- **Flow Paths:**
  - MSS: Quân cờ dừng ô → Xác định cạnh địa lý (0-9=Cạnh1 Tây Nam Bộ, 10-19=Cạnh2 Miền Trung, 20-29=Cạnh3 Bắc Trung Bộ, 30-39=Cạnh4 Đô thị) → Crossfade nhạc nền 1.5s.
  - A1: Nâng cấp Cấp 3 → Kích hoạt SFX Khánh Thành + Particle VFX.
  - A2: Rút thẻ sự kiện → Phát SFX định danh thẻ (âm thanh micro-audio ô Cần Thơ, Lâm Đồng, v.v.)
- **Value Delivered:** Trải nghiệm âm thanh không gian thích ứng theo vùng miền — người chơi cảm nhận được bản sắc địa phương qua âm nhạc.
- **Lifecycle Status:** ✅ Hoàn Thành (Done - 2026-09-09) · 535/535 Tests PASS · Production Build Verified
- **Tech Stack:** `howler` · `@types/howler` · Zustand `useAudioStore` · AudioEngine Singleton
- **Test Contracts (Visual & Unit):**
  - `TC-UI05.1`: [Pawn dừng ô index 5 (Cạnh 1)] → [howler crossfade 1.5s kích hoạt, track Tây Nam Bộ đang phát]
  - `TC-UI05.2`: [Pawn dừng ô index 15 (Cạnh 2)] → [Crossfade sang track Duyên hải Miền Trung, track cũ dừng]
  - `TC-UI05.3`: [Nâng cấp Cấp 3] → [SFX Khánh Thành phát một lần, không loop]
  - `TC-UI05.4`: [Người dùng tắt âm thanh] → [Tất cả howler.volume(0), không gián đoạn logic FSM]
- **LOC Budget:** audio_types.ts 52L · audio_store.ts 36L · audio_engine.ts 163L · top_bar.tsx 70L · howler_mock.ts 65L · ui05_audio_engine.test.ts 137L

---

## Bảng Tổng Quan Epic 2

| Slice | Tiêu đề | Trạng thái | Use Case Refs | Value Cốt Lõi |
|---|---|:---:|---|---|
| **UI-01** | Sa Bàn 3D & Standee 2.5D | ✅ Hoàn Thành | UC-004, UC-016, design.md | Bàn cờ thật 3D 40 ô địa phương |
| **UI-02** | Spring Pawn & Dice Physics | ✅ Hoàn Thành | UC-011, UC-016, ADR-0002 | Hoạt ảnh lò xo + xúc xắc rơi |
| **UI-03** | HUD Tài Chính DOM | ✅ Hoàn Thành | UC-002, UC-016, ADR-0002 | Bảng điều khiển realtime Zustand |
| **UI-04** | Modals Nghiệp Vụ | ✅ Hoàn Thành | UC-020, UC-022, UC-028, UC-038 | Giao diện quyết định kinh doanh |
| **UI-05** | Audio Engine Vùng Miền | ✅ Hoàn Thành | ADR-0002, design.md §2 | Âm thanh không gian 4 cạnh địa lý |

---

## Sổ Nợ Kỹ Thuật (Tech Debt Ledger)

> Trạng thái khởi điểm: 0 khoản nợ. Các khoản nợ phát sinh sẽ được đăng ký tại đây với Slice nhận.

| Mã Nợ | Mô tả | Slice Phát Sinh | Slice Nhận | Trạng Thái |
|---|---|---|---|:---:|
| DEBT-UI01-01 | Preloading 28 bộ WebP bằng preloadTileAssets() | UI-01 | UI-02 Task 1 | ✅ ĐÃ ĐÓNG |
| DEBT-UI01-02 | Hoạt ảnh nhấp nhô điều hòa sin(omega*t) trên Standee | UI-01 | UI-02 Task 2 | ✅ ĐÃ ĐÓNG |

---

## Chuẩn Nghiệm Thu (Definition of Done — Epic 2)

1. **Visual Tests PASS:** Mỗi Slice có ít nhất 4 Test Contract được kiểm tra adversarial (cố tình phá vỡ để xác nhận test thất bại đúng lý do).
2. **Zero Regression:** Toàn bộ 433 server-side tests từ Epic 1 vẫn PASS sau mỗi Slice.
3. **Performance:** R3F Canvas giữ 60 FPS trên thiết bị mid-range (đo bằng `@react-three/drei` Stats panel).
4. **Độ trễ Delta:** Zustand state update từ FSM event đến re-render HUD ≤ 1 render cycle (~16ms).
5. **Asset Budget:** Tổng tài nguyên mỗi ô ≤ 120KB (3 lớp WebP ≤ 45KB/lớp theo design.md).
6. **Code Quality:** Cyclomatic Complexity ≤ 5, mỗi file ≤ giới hạn LOC đã quy định, zero TypeScript any.

---

## Mốc Nghiệm Thu Bứt Phá: Bán Đảo Đô Thị Biển Nhiệt Đới (Vietnamese Coastal Island Metropolis)
- **Căn cứ nghệ thuật:** Chuẩn tham chiếu quốc tế Retropoly (RetroStyle Games).
- **Hạ tầng hoàn tất:**
  * Perspective Camera (fov 40) và đường ống hậu kỳ điện ảnh Post-Processing Pipeline (Multisampling 4, N8AO, Champagne Bloom, Macro Tilt-Shift DoF, ACES Filmic ToneMapping).
  * Môi trường Bán đảo Nhiệt đới: Bờ cát vàng, biển ngọc bích nhấp nhô sóng động, rặng núi 32 phân đoạn mềm mại, vách đá sườn núi, rừng thông chân núi, dải mây xốp tầng cao Y=19-24 và sương mù chân núi.
  * Sa bàn đô thị trung tâm: Cầu Ba Son & Long Biên, Cảng Cát Lái 2 cần cẩu gantry và bãi container xếp tầng, bến du thuyền và hải đăng, Chợ Bến Thành, Nhà thờ Đông Dương mái ngói đỏ, Sân vận động vát mái lộ sân cỏ kẻ sọc carô, Vòng đu quay đa sắc, tuyến đường sắt hầm đá và tàu hàng 3 toa.
  * Kiến trúc C0-C3: Cọc mốc trắc địa C0, Shophouse C1, Khu thương mại C2, Quần thể Tháp Đôi Landmark C3 Champagne Gold & Ivory vách kính sapphire (loại bỏ hoàn toàn cọc đen và vòng vàng lơ lửng).
  * Sảnh chờ Glassmorphism xuyên thấu nền 3D sống động (`bg-sky-950/20 backdrop-blur-[5px]`).
- **Phán quyết Art Director (`game-3d-visual-critic`):**
  * Đợt 1: 6.8/10 (Vượt khỏi phòng tối 2000 nhưng còn tồn tại 5 điểm nghẽn).
  * Đợt 2: 8.2/10 -> Nghiệm thu toàn diện các điểm nghẽn, bổ sung chi tiết sinh thái bãi biển và cảnh quan địa chất.
- **Gói A: Living Ocean & Autonomous Micro-Traffic (Đã Hoàn Tất - 2026-09-11):**
  * Sóng Gerstner điều hòa 3 pha (biên độ <= 0.070, tính lại pháp tuyến `computeVertexNormals()` bắt nắng lấp lánh).
  * Vi giao thông tự hành: 7 xe buýt/ô tô chạy 2 làn đối xứng chuẩn RHT kèm 2 đèn pha LED vi mô rọi sáng mặt đường.
  * Ca-nô tuần tra vịnh biển phía Nam lướt sóng nhấp nhô, đàn hải âu 5 con bay lượn hướng mỏ chuẩn vận tốc.
  * Cần cẩu Cát Lái 1 & 2 tự xoay trục và nâng hạ cáp cẩu, khung spreader treo đúng dầm cẩu.
  * Sửa lỗi deadlock `skipNextTurn` trong `turn_loop.ts`, bảo đảm 1.000 ván Chaos Monkey Simulator chạy mượt mà.
- **Gói B: Dynamic Time-of-Day & Neon Metropolis Night (Đã Hoàn Tất - 2026-09-11):**
  * Hệ thống chu kỳ 3 pha: Ban Ngày Nhiệt Đới -> Hoàng Hôn Mật Ong -> Đêm Đô Thị Neon.
  * Nội suy mượt mà exponential decay lerp `1 - Math.exp(-dt * 3.0)` qua `useFrame`, quản lý Sun/Ambient/Hemi/Sky/Fog qua `environment_store.ts`.
  * Cửa sổ tòa nhà procedural emissive phát quang vàng/cyan rực rỡ trong đêm.
  * Đèn LED nghệ thuật dây văng Cầu Ba Son (cyan) & vòm Cầu Long Biên (vàng rực).
  * Đỉnh tháp Landmark quét laser 360 độ bầu trời đêm kèm đèn cảnh báo an toàn hàng không nhấp nháy chu kỳ xung.
  * 4 cột đèn pha sân vận động tỏa nón ánh sáng xuống mặt sân cỏ; 8 cabin đu quay phát sáng lung linh.
  * Tương tác linh hoạt: Nút bấm trên TopBar cho phép chọn cố định hoặc xoay vòng tự động 90s.
- **Gói C: Cinematic Action Cam & Construction Slam VFX (Đã Hoàn Tất - 2026-09-11):**
  * Hệ thống Camera State Machine 4 trạng thái (`overview`, `dice_roll`, `pawn_chase`, `tile_focus`) tích hợp vào `AdaptiveCinematicCamera`.
  * Sà xuống góc nghiêng thấp (low-angle cinematic) khi gieo xúc xắc, bám đuổi quân cờ nhảy từng bước, phóng to ô đất khi mở sổ đỏ/modal, và tự động hồi phục góc nhìn `overview` khi hết lượt.
  * Cơ chế suy giảm hàm mũ (exponential decay damping) độc lập tốc độ khung hình, triệt tiêu rung giật.
  * Hiệu ứng khánh thành công trình va đập thể tích (Impact Drop Animation): rơi tự do gia tốc trọng trường từ trên cao cắm mạnh xuống mặt đế ô cờ kèm nén đàn hồi va đập (squash 80ms & rebound 120ms).
  * Rung chấn màn hình vi mô (Camera Screen Shake 300ms - 400ms) tạo cảm giác đanh chắc chân thật.
  * Sóng xung kích vành khăn (Shockwave Ring Expansion) phát sáng lan tỏa trên mặt bàn cờ.
  * Bụi hạt vàng kim và pháo hoa hoàng kim bung tỏa ăn mừng rực rỡ (Celebration Gold Particles & Confetti VFX).
- **Trạng thái kiểm thử:** 94/94 test files PASS (1.123/1.123 unit/contract/simulation tests passed bao gồm 1.000 ván Chaos Monkey Simulator).
- **Tối ưu hóa Gói C hoàn thiện:**
  * Giải quyết xung đột khoảng cách OrbitControls: tinh chỉnh động `minDistance` (3.8 cho chế độ điện ảnh cận cảnh, 14 cho góc nhìn bao quát) giữ vững hợp đồng kiểm thử và loại bỏ triệt để hiện tượng kẹt camera.
  * Tách biệt Screen Shake cộng dồn trực tiếp lên vị trí máy quay thay vì lọc qua bộ suy giảm hàm mũ, bảo toàn 100% biên độ rung chấn vật lý đanh chắc 42Hz.
  * Bù trừ chính xác độ lệch 0.42 trục Z theo 4 cạnh bàn cờ (`getBuildingWorldPosition`), đưa tâm chấn sóng xung kích và chùm pháo hoa về đúng chân đế công trình.
  * Chuẩn hóa hoạt ảnh va đập đàn hồi (harmonic continuous squash), loại bỏ bước nhảy giật gãy 26% tại thời điểm chạm đất.
- **Phúc Khảo Vòng Cuối & Phán Quyết Chính Thức Của Giám Đốc Nghệ Thuật (2026-09-11):**
  * Đánh giá trực tiếp qua 7 ảnh chụp WebGL Runtime thực tế (`audit_01` đến `audit_07`).
  * Khắc phục triệt để 5 điểm yếu chí mạng: Bán đảo hữu cơ uốn lượn tự nhiên, Ánh trăng xanh navy giải cứu black crush đêm, Xúc xắc Acrylic Đỏ Ruby tráng gương mạ vàng Champagne, Chase Cam bám sát gót quân cờ, Thẻ Nổi Sổ Đỏ bảo toàn 75% không gian 3D.
  * **Điểm thẩm định nghệ thuật chính thức:** **9.00 / 10** (Tăng từ 7.62 -> 9.00).
  * **KẾT LUẬN:** **CHẤP THUẬN TOÀN DIỆN — ĐẠT CHUẨN PHÁT HÀNH THƯƠNG MẠI QUỐC TẾ (COMMERCIAL RELEASE READY)** sánh ngang Monopoly Plus.
- **Trạng thái triển khai Container:** Container Docker `vtcoon-vtcoon-1` đã đồng bộ bản build production và phản hồi HTTP 200 OK.

