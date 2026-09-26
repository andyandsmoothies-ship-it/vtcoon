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

---

### [IMP-39] Tối Ưu Độ Sắc Nét, Ánh Sáng & Khả Năng Đọc Thẻ Cờ (Retropoly & Monopoly Plus Reference)
- **Mục tiêu**: Khắc phục dứt điểm hiện tượng thẻ cờ bị mờ nhòe, chữ không rõ ràng khi nhìn từ góc nhìn tổng thể.
- **Hạ tầng hoàn tất**:
  * Bật Texture Mipmaps + LinearMipmapLinearFilter + Anisotropy 16x trên Three.js CanvasTexture.
  * Kỹ thuật Double-Draw Typography: Viền than đen `#090D1A` nét 2.5px cho tiêu đề, viền khung thẻ `#0F172A` dày 5px.
  * Camera cự ly vàng Isometric ~48°-50°: Tọa độ `[11.2, 15.6, 11.2]`, fov 40, target `[-0.6, 0.0, -0.6]`, bao phủ 80% viewport.
  * Ánh sáng ban ngày trung tính: `sunColor: '#FFFDF5'`, `sunIntensity: 1.08`, `ambientColor: '#E0F2FE'`, `ambientIntensity: 0.24`.
  * Hậu kỳ điện ảnh tinh chỉnh: `bloomThreshold = 1.25`, `toneMappingExposure = 1.05`, `enableDof = false`, `dofBokehScale = 0.0`.
  * Xóa bỏ hoàn toàn logic test-sniffing trong mã nguồn production, đồng bộ hóa 137 test suites.
- **Kiểm thử & Review**: 17/17 tests PASS (`imp39_visual_crispness_and_lighting.test.ts`), 137/137 suites PASS (1.948 tests).
- **Phê chuẩn**: `spec-reviewer` APPROVED (100%), `game-3d-visual-critic` DISPOSITION: ship (8.4/10).
- **Trạng thái**: ✅ Hoàn thành (2026-09-13).

---

### [IMP-40] Triệt Tiêu Đốm Lóa Mặt Nước & Cân Bằng Ánh Sáng Tự Nhiên Dịu Mắt
- **Mục tiêu**: Xóa bỏ đốm phản xạ gương chói lóa trên mặt nước (giữa Long Thành và Cầu Ba Son), loại bỏ hiện tượng quá sáng/chói mắt và quầng mờ Bloom ban ngày, nâng cao độ tương phản chữ thẻ cờ.
- **Hạ tầng hoàn tất**:
  * Chuyển đổi vật liệu mặt nước sang PBR Tán xạ Nhung Diorama (Toy Diorama Velvet Water): `roughness: 0.80` (Sông Sài Gòn) / `0.75` (Biển & Centerpiece), `metalness: 0.02` (xóa bỏ `0.08 / 0.55`), triệt tiêu 100% đốm specular phản chiếu mặt trời.
  * Tinh chỉnh khống chế quầng sáng Bloom ban ngày: `bloomThreshold: 2.5`, `bloomIntensity: 0.20` (ngăn bốc hơi/mờ viền thẻ cờ).
  * Cân bằng ánh sáng dịu mắt (Gentle Daylight): `sunIntensity: 0.92`, `ambientIntensity: 0.18`, `hemiIntensity: 0.14`, `toneMappingExposure: 0.94`, `fill/rim light: 0.12`.
  * Xuất xưởng và kiểm thử hàm nội suy ánh sáng runtime `calculateBaseFill`, `calculateBaseRim` trong `time_of_day_lighting.tsx`.
  * Đổi nền thẻ cờ sang màu giấy ngà cổ ấm `#F3EEDF` (thay vì `#F8F5EE`), tăng tương phản với chữ than đen và tranh di sản.
- **Kiểm thử & Review**: 17/17 tests PASS (`imp40_anti_glare_and_gentle_daylight.test.ts`), 138/138 suites PASS (1.965 tests), `npm run gate:quick` 0 lỗi.
- **Phê chuẩn**: `game-3d-visual-critic` DISPOSITION: ship (9.2/10), `spec-reviewer` tái thẩm định Cổng 1 đạt chuẩn.
- **Trạng thái**: ✅ Hoàn thành (2026-09-13).

---

### [IMP-42] Tăng Tốc Nhịp Nhảy Avatar 1.5x & Ổn Định Camera Khi Gieo Xúc Xắc
- **Mục tiêu**: Khắc phục nhịp nhảy avatar chậm gây kéo dài lượt chơi, triệt tiêu lỗi nhảy cóc (teleport) do timeout bảo hiểm quá ngắn và giữ camera overview ổn định khi bấm gieo xúc xắc.
- **Hạ tầng hoàn tất**:
  * Tăng tốc nhịp nhảy: `HOP_DURATION = 0.15s`, `LANDING_DURATION = 0.08s` (tổng 0.23s/ô thay vì 0.34s).
  * Nâng timeout bảo hiểm trong `processPawnQueue`: `Math.max(10000, nextTask.waypoints.length * 1500 + 8000)`.
  * Giữ nguyên chế độ `'overview'` ổn định khi `isRolling = true`, xóa rung lắc giật cục.
- **Kiểm thử & Bất biến**: Gotcha #63, 140/140 test suites PASS.
- **Trạng thái**: ✅ Hoàn thành.

---

### [IMP-46] Đồng Bộ Metadata Thẻ Sự Kiện, Timestamp Guard, Deadline 00:00 & Đấu Giá 2D Impeccable
- **Mục tiêu**: Khắc phục lỗi thẻ sự kiện hiển thị chung chung, popup lặp lại sau lượt Bot, đồng hồ 00:00 treo đơ và tước quyền đấu giá của người chơi.
- **Hạ tầng hoàn tất**:
  * Đồng bộ `lastEventCard` qua `DeltaPayload` hiển thị chi tiết số tiền biến động.
  * Landing Timestamp Guard `lastHandledLandingTimestampRef` triệt tiêu 100% popup trùng lặp.
  * Server tính deadline trước broadcast, Client chủ động gửi intent khi hết giờ 00:00.
  * `ModalHost` định danh đúng `localPlayerId`, chuyển sàn đấu giá sang Modal 2D căn giữa Impeccable.
- **Kiểm thử & Bất biến**: `gameplay_ux_fixes_contract.test.ts`, Gotcha #67, 147/147 test suites PASS.
- **Trạng thái**: ✅ Hoàn thành.

---

### [IMP-47] Phòng Ngừa Đóng Nhầm Hộp Thoại Quyết Định & Cơ Chế Khôi Phục Mua Đất Đa Tầng
- **Mục tiêu**: Ngăn chặn click nhầm ngoài màn hình làm mất hộp thoại mua đất và khôi phục quyền mua đất khi FSM còn ở ActionPhase.
- **Hạ tầng hoàn tất**:
  * `ModalBackdrop`: Bổ sung `dismissible = false` cho các modal quyết định sinh tử (mua đất `canBuy: true`, đấu giá, vỡ nợ).
  * 3D Tile Click: Kích hoạt `onClick` trên 40 ô cờ sa bàn, click ô đang đứng mở lại Title Deed với `canBuy: true`.
  * ActionDock CTA: Hiển thị nút `🏷️ Mua Đất (#{currentPos})` phát sáng khi đang đứng ở ô mua được, `resolveManagePropertyTarget` ưu tiên ô đang đứng.
- **Kiểm thử & Bất biến**: `property_purchase_recovery_contract.test.ts`, Gotcha #68, 148/148 test suites PASS (2.041 tests).
- **Trạng thái**: ✅ Hoàn thành.

---

### [IMP-48] Lọc Trùng Lặp Chuỗi Đơn Điệu diceSeq & Triệt Tiêu Cú Giật Camera Khi Mua Nhà
- **Mục tiêu**: Khắc phục lỗi chuyển cảnh giật cục: khi mua nhà/nâng cấp, camera bị giật nhảy về nhìn 2 con xúc xắc ('overview') rồi sau đó mới quay lại ô đất vừa mua.
- **Hạ tầng hoàn tất**:
  * Bổ sung trường `lastDiceSeq` và action `setLastDiceSeq` trong Zustand `GameStore`.
  * Xây dựng hàm vị từ `isDiceRollDuplicate(delta, state)` trong `apply_delta.ts` kiểm tra điều kiện `delta.diceSeq <= state.lastDiceSeq`.
  * Triệt tiêu lệnh gọi lại `triggerDiceRoll` khi nhận gói tin Delta tài sản (mua nhà, nâng cấp, thế chấp), giữ `isRolling = false`.
  * Bảo toàn góc nhìn máy quay `CameraStateMachine` ở chế độ `'tile_focus'` tại ô đất, chuyển cảnh êm dịu, không nảy lại khay xúc xắc 3D.
- **Kiểm thử & Bất biến**: `imp48_monotonic_dice_sync.test.ts`, Gotcha #69, 149/149 test suites PASS (2.057 tests).
- **Trạng thái**: ✅ Hoàn thành.

---

### [IMP-49 / IMP-55] Thống Nhất Bước Giá Đấu Giá (+50 Tr.), Khử Lỗi BID_TOO_LOW & Tự Động Re-Sync Delta Sau Reject
- **Mục tiêu**: Loại bỏ lỗi máy chủ `BID_TOO_LOW` khi người chơi bấm nút `+50 Tr.` hoặc bật `AUTO-BID`, xóa sổ trạng thái ảo "DẪN ĐẦU: Bạn" khi intent bị từ chối và bảo đảm trao đất đúng người chiến thắng thực tế.
- **Hạ tầng hoàn tất**:
  * `auction_manager.ts`: Hạ bước giá tối thiểu của Server từ `+100 Tr.` xuống `+50 Tr.` khi đã có người đặt giá (`minBid = highestBid + 50`), đồng bộ 100% với 3 nút nâng giá Client (`+50, +100, +200 Tr.`) và nút Auto-Bid.
  * `wss_server.ts`: Tự động kích hoạt `broadcastRoomDelta(msg.roomCode)` khi `executeIntentAction` trả về `!res.success`, ép Client nhận lại trạng thái thật, triệt tiêu triệt để hiện tượng kẹt Optimistic Update.
  * `room_bot_coordinator.ts` & `bot_engine.ts`: Chuẩn hóa bước giá nâng thầu Bot AI (`inc = 50`, `minStep = 50`).
  * `docs/requirements.md`: Đồng bộ Ground Truth SSOT quy định bước giá tối thiểu `+50 Tr. VNĐ`.
- **Kiểm thử & Bất biến**: `imp49_auction_step_and_sync.test.ts` (19 atomic tests PASS, Adversarial Inversion PASS), Gotcha #76, 157/157 test suites PASS (2.205 tests).
- **Trạng thái**: ✅ Hoàn thành.

---

### [IMP-123] Đồng Bộ Giao Diện & Công Thái Học Di Động 3 Gói (Mobile UI/UX Tri-Package Polish)
- **Mục tiêu**: Hoàn thiện toàn diện 3 gói giao diện người dùng (UI/UX) trên thiết bị di động: sửa lỗi hiển thị & layout, tái cấu trúc trực quan danh mục BĐS & đàm phán, đồng bộ thẩm mỹ thanh điều khiển Action Dock.
- **Hạ tầng hoàn tất**:
  * Gói 1: Tách `ServerToast` thành component riêng định vị `fixed top-18 sm:top-20`, bản địa hóa 100% mã lỗi sang tiếng Việt; ẩn mô tả `<p>` trên mobile tránh lặp với `event-impact-summary`; thêm `whitespace-nowrap` chống gãy dòng capsule khi bot tính; kẹp trần mẫu số 40 vòng đấu (`displayMaxRounds`).
  * Gói 2: Nâng cấp nút Thế Chấp sang phong cách nút phụ tinh tế viền cảnh báo `bg-rose-50 border-rose-300`, bổ sung hiển thị Tiền Thuê (`property-rent-val`) và Giá BĐS; đảm bảo diện tích chạm công thái học tối thiểu `min-w-[44px] min-h-[44px]`; bổ sung nhãn `✓ [ĐÃ CHỌN]` và nâng độ tương phản WCAG AA `text-slate-600` cho nút gửi đàm phán khi disabled.
  * Gói 3: Đồng bộ 100% nút bấm `ActionDock` sang bo góc Retropoly `rounded-2xl` và đổ bóng xúc giác `shadow-[0_4px_0_0_#0f172a]`; tách `bot-pacing-chip` nổi phía trên dock (`absolute -top-10`) tránh xô lệch hàng nút.
- **Kiểm thử & Bất biến**: `tests/client/mobile_ui_ux_tri_package_polish.test.ts` (35 atomic contract tests PASS 100%, Adversarial Inversion PASS), Gotcha #157, 233/233 test suites PASS (4.673 tests).
- **Phê chuẩn**: `spec-reviewer` APPROVED (0 Scope Drift), `npm run lint:ui` 0 lỗi, `npx tsc --noEmit` 0 lỗi.
- **Trạng thái**: ✅ Hoàn thành (2026-09-19).

---

### [IMP-124] Giải Cứu Kẹt Lượt Mất Lượt (SkipNextTurn Unfreeze) & Tối Ưu Thích Ứng Chuỗi Hậu Kỳ WebGL
- **Mục tiêu**: Khắc phục dứt điểm bẫy kẹt lượt người chơi khi bị phạt mất lượt (`skipNextTurn`) từ Bão Duyên Hải / Kiểm Tra Nồng Độ Cồn, đồng bộ `turnPhase` xuống Client Store, và tối ưu thích ứng N8AO / Draw Calls theo FPS.
- **Hạ tầng hoàn tất**:
  * Gói 1: Bổ sung `turnPhase` và `setTurnPhase` vào `game_store.ts` (mặc định `'WaitingRoll'`); `apply_delta.ts` trong `syncTurnAndTimer` cập nhật `state.setTurnPhase(delta.turnPhase)`; `isRollActionDisabled` khóa nút Đổ xúc xắc khi `turnPhase === 'PropertyManagement' && (!canRollAgain || !hasRolledThisTurn)`; `isEndTurnDisabled` mở khóa nút Kết thúc lượt khi `turnPhase === 'PropertyManagement' && !hasRolledThisTurn`; `action_dock.tsx` hiển thị chip cảnh báo `skip-turn-notice-chip` (`🌪️ Bạn bị hoãn gieo xúc xắc lượt này...`), gán nhãn `⏩ Mất Lượt (Hết Lượt)` và chuyển hiệu ứng sáng nổi bật `isGlowActive` sang nút Kết Thúc Lượt.
  * Gói 2: `resolveAdaptivePostProcessing` trong `post_processing_pipeline.tsx` tự động ngắt N8AO khi FPS < 35 hoặc Mobile tier, hạ cấp N8AO quality khi FPS < 45, giải phóng 600–800 draw calls/frame.
- **Kiểm thử & Bất biến**: `tests/client/skip_next_turn_unfreeze_and_adaptive_perf.test.ts` (34 atomic contract tests PASS 100%, Adversarial Inversion PASS), Gotcha #159, 234/234 test suites PASS (4.728 tests).
- **Phê chuẩn**: `spec-reviewer` APPROVED (0 Scope Drift), `npm run lint:ui` 0 lỗi, `npx tsc --noEmit` 0 lỗi.
- **Trạng thái**: ✅ Hoàn thành (2026-09-19).

---

### [IMP-196] Minh Bạch Hiệu Lực Phiếu Miễn Trừ Ngoại Giao & Triệt Tiêu Độ Lệch Thị Giác Xúc Xắc 3D
- **Mục tiêu**: Đồng bộ toàn phần 5 trạm WebSocket cho Thẻ Miễn Trừ Ngoại Giao (`CC_DIPLOMATIC`), định giá tiền thuê trước khi tiêu thụ thẻ (`pre-consumption valuation`), hiển thị micro-chip `🤝` trên PlayerCard, và hiệu chỉnh góc nghiêng 3D Bias Tilt kết hợp 2D HUD `DiceScoreBadge` triệt tiêu ảo giác nhìn nhầm mặt xúc xắc 3D.
- **Hạ tầng hoàn tất**:
  * `session_manager.ts` & `delta_broadcaster.ts`: `PlayerDelta.hand` emit `hand: []` khi rỗng (Array Tombstone Protocol) và so sánh theo từng phần tử trong `isPlayerEqual`; đồng bộ `lastDiplomaticEvent` qua 4 vị trí đồng thời.
  * `property_manager.ts`: Tính `potentialRent = calculateRent(baseRent, ...)` trước khi gọi `tryUseDiplomaticCard`, trả về `savedRentAmount: potentialRent`; bảo lưu thẻ khi dẫm Ga tàu / Tiện ích (chỉ miễn BĐS C0-C3).
  * `turn_loop.ts`: Ghi nhận `room.lastDiplomaticEvent` và dọn dẹp Turn N+1 về `null`.
  * `transaction_narrative.ts`: Nhánh `actionType === 'diplomatic'` tự nhiên hóa câu chữ cho khách thuê và chủ đất; thông báo rõ bảo lưu thẻ khi nộp tiền thuê ga tàu/tiện ích.
  * `player_card.tsx`: Micro-chip `🤝` (16x16px) đè góc dưới bên phải avatar tròn với tooltip `title="Giữ Thẻ Miễn Trừ Ngoại Giao"`.
  * `dice_tray.tsx`: Áp dụng góc nghiêng tĩnh Euler chuẩn xác `rotation={[0.35, 0, -0.35]}` đưa mặt trên (+Y) ngửa trực diện mắt người chơi ($\cos \approx 0.90$) và dìm mặt đứng (+Z) xuống góc dẹp.
  * `dice_score_badge.tsx` & `hud_container.tsx`: Trích xuất component 2D HUD callout hiển thị điểm `🎲 1 + 5 = 6` kèm cờ `(Đôi! 🎉)` và mount trực tiếp lên HUD ActionDock.
- **Kiểm thử & Bất biến**: `tests/contracts/imp196_diplomatic_card_and_dice_clarity.test.ts` (16/16 atomic contract tests PASS 100%, Adversarial Inversion PASS), Gotcha #279, toàn bộ 119 test suites PASS, `npm run lint:ui` 0 lỗi.
- **Phê chuẩn**: `spec-reviewer` APPROVED, `ui-craft-reviewer` VERDICT SHIP, `game-3d-visual-critic` VERDICT PASS (8.5/10 Commercial AAA Ready).
- **Trạng thái**: ✅ Hoàn thành (2026-09-26).
