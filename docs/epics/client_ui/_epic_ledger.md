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
| DEBT-IMP208-01 | ui_helpers.ts đạt 445 LOC (vượt ngưỡng cảnh báo 400 LOC Tier 2) -> Bóc tách action_dock_helpers.ts | IMP-208B | Slice UI Kế Tiếp | ⏳ CHỜ BÓC TÁCH |
| DEBT-ROOM-MGR-01 | room_manager.ts gom 10 Map phân tán vào GameRoomSession Aggregate Root, đưa file về 378 LOC (<= 400 LOC Tier 1) | IMP-205 / IMP-209 | IMP-210 (Bước 2) | ✅ ĐÃ ĐÓNG |
| DEBT-IMP208P-01 | trade_modal.tsx:28 branch cash-only thiếu suffix "Tr." | IMP-208P | IMP-208P (Active Remediation) | ✅ ĐÃ KHẮC PHỤC (Inoculated TC-208P.09) |
| DEBT-IMP220-01 | Chuẩn hóa magic string 'INVALID_PHASE' tại L143 (INTENT_AUTO_SOLVENCY) và L157 (INTENT_END_TURN) sang ActionRejectReason.INVALID_PHASE trong đợt refactor toàn bộ dispatcher | IMP-220 | Dispatcher Refactor Sprint | ⏳ ĐÃ GHI NHẬN |

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

---

### [IMP-204] Năng Lực Mua BĐS Bền Vững & Điểm Neo Mua Đất ActionDock (Resilient Purchase Affordance)
- **Mục tiêu**: Xóa bỏ hoàn toàn hiện tượng bấm nút Mua bị văng modal do thiếu tiền; triệt tiêu lỗi hardcode 600 tại 3 vị trí; khắc phục lỗi kẹt nút Mua khi đổ đôi; xây dựng phân tầng công thái học 3 hàng tại Footer Sổ Đỏ (Dòng tài chính -> Cầm cố để mua -> Đóng xoay vốn / Bỏ qua); thiết lập nút vàng ActionDock làm điểm neo bảo toàn quyền mua.
- **Hạ tầng hoàn tất**:
  * `title_deed_affordance.ts`: Module SSOT tính toán `resolvePurchaseAffordance`, `resolveMonopolyGroupInfo`, `resolveEvenBuildRules`, và `resolveTitleDeedModalState` (216 LOC, Tier 1 <= 400 LOC).
  * `modal_host.tsx`: Tinh gọn sâu từ 475 dòng xuống **447 LOC** (Tier 2 <= 500 LOC), ủy quyền 100% logic Sổ Đỏ sang helper.
  * `action_dock.tsx`: Siết `turnPhase === TurnPhase.ActionPhase` cho `isStandingOnBuyable`; ưu tiên nút `[🏷️ Mua Đất]` không truyền `canBuy` cứng để SSOT tự tính toán; chống deadlock kẹt nút khi đổ đôi; thêm notice `buy_opportunity` cảnh báo vị trí và giá đất.
  * `title_deed_action_footer.tsx`: Phân tầng 3 hàng (Dòng đệm tài chính khi thiếu tiền -> CTA Mua / `[🏛️ Cầm Cố Để Mua]` -> Nút phụ `[Đóng Xoay Vốn]` vs `[Bỏ Qua (Pass)]` strictly gọi `onPass`; sa bàn chỉ hiện `[Đóng]`).
  * `offline_landing.ts` & `board_layout.tsx`: Xóa bỏ triệt để hardcode 600, lấy giá từ `PROPERTY_DEEDS`.
- **Kiểm thử & Bất biến**: `tests/contracts/imp204_property_purchase_affordance.test.ts` (17/17 atomic contract tests PASS 100%, Adversarial Inversion PASS), Gotcha #289, 93/93 regression tests PASS, `npm run lint:ui` 0 lỗi.
- **Tech Debt**: `DEBT-IMP204-01` (Render Goal Badge & Auto-Return trong `property_portfolio_modal.tsx` khi có `targetPurchaseCellIndex`, hoãn do Portfolio đang 493 LOC).
- **Phê chuẩn**: `spec-reviewer` SPEC_PASS, `ui-craft-reviewer` VERDICT SHIP, `scout` Station 2.5 PASS.
- **Trạng thái**: ✅ Hoàn thành (2026-09-27).

---

### [IMP-205] Thông Báo Rút Thẻ Cho Bot & Nút Toggle Bảng Điểm TopBar (Bot Card Toast & Scoreboard Toggle)
- **Mục tiêu**: Minh bạch hóa hành động bốc thẻ Cơ Hội / Thị Trường của Bot thông qua MilestoneBanner 2.5s; chuyển đổi nút Ẩn/Hiện Bảng Điểm từ nút thô ở sườn phải sang icon gọn `[👥 Bảng Điểm]` trên TopBar.
- **Hạ tầng hoàn tất**:
  * `top_bar.tsx`: Bổ sung nút `[👥 Bảng Điểm]` trong cụm hud-utilities-cluster, chữ ẩn trên mobile 360px (`hidden sm:inline`).
  * `player_hud_list.tsx`: Xóa bỏ hoàn toàn nút fixed sườn phải, giải phóng 100% tầm nhìn 3D sa bàn; dọn dẹp padding dư thừa `pt-28`.
  * `apply_delta.ts` & `offline_landing.ts`: Bắn `MilestoneBanner` tự biến mất sau 2.5s khi Bot bốc thẻ Cơ Hội / Thị Trường; khắc phục Actor Inversion trong chế độ offline.
- **Kiểm thử & Bất biến**: `tests/contracts/imp205_bot_card_toast_and_hud_toggle.test.ts` (17/17 atomic tests PASS 100%), `npm run lint:ui` 0 vi phạm.
- **Phê chuẩn**: `spec-reviewer` SPEC_PASS, `ui-craft-reviewer` VERDICT SHIP, `code-reviewer` CODE_PASS.
- **Trạng thái**: ✅ Hoàn thành (2026-09-27).

---

### [IMP-207] Phòng Vệ Chuyển Trạng Thái & Công Thái Học Khi Thị Trường Đóng Băng (Freeze Trade FSM & Affordance Defenses)
- **Mục tiêu**: Khắc phục triệt để hiện tượng false affordance nút bấm xanh và deadlock kẹt vòng lặp lượt khi thẻ Thị Trường Đóng Băng (`MC_FREEZE_TRADE`) có hiệu lực.
- **Hạ tầng hoàn tất**:
  * `src/server/turn_loop.ts`: Khi `isTradeFrozen(room)` kích hoạt và người chơi hạ cánh ô đất chưa ai mua, chuyển thẳng sang `TurnPhase.PropertyManagement`, loại bỏ hoàn toàn bẫy kẹt tại `TurnPhase.ActionPhase`.
  * `src/server/auction_manager.ts`: `handleDecline` chuyển sang `TurnPhase.PropertyManagement` khi đóng băng, ngăn chặn tạo phiên đấu giá không hợp lệ.
  * `src/client/network/apply_delta.ts`: Đồng bộ `hasRolledThisTurn: true` khi nhận `turnPhase: ActionPhase` hoặc `PropertyManagement` có bằng chứng xúc xắc thật, phá vỡ bẫy kẹt nút Gieo và mở khóa nút Kết Thúc Lượt.
  * `src/client/ui/modals/title_deed_affordance.ts`: Tính toán `canBuy: false` khi đóng băng, bảo toàn `isBuyOpportunity` để footer render đúng trạng thái đóng băng.
  * `src/client/ui/modals/title_deed_action_footer.tsx`: Nút Mua chuyển sang style disabled xám xúc giác `bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed shadow-none active:translate-y-0` với nhãn `❄️ Thị Trường Đóng Băng (Cấm Mua)`; nút `Bỏ Qua` ẩn hoàn toàn, chỉ giữ nút `Đóng` an toàn.
  * `src/client/ui/modals/title_deed_modal.tsx` & `purchase_decision_card.tsx`: Guard render card duy trì khi đóng băng; chip mục tiêu chuyển thành `❄️ ĐÓNG BĂNG` (sky/slate); banner cảnh báo đóng băng thay thế khối thanh khoản sau mua.
  * `src/client/ui/action_dock.tsx`: `isStandingOnBuyable = false` khi đóng băng, giải phóng nút `[🎲 Đổ Tiếp (Đôi)]` khi đổ đôi và kích hoạt nút `[⏭️ Kết Thúc Lượt]` bình thường.
- **Kiểm thử & Bất biến**: `tests/contracts/imp207_freeze_trade_fsm_and_affordance.test.ts` (16/16 atomic contract tests PASS 100%, Adversarial Inversion PASS), 61/61 regression tests PASS, `npm run lint:ui` 0 lỗi, `tsc --noEmit` 0 lỗi.
- **Phê chuẩn**: `spec-reviewer` SPEC_PASS, `ui-craft-reviewer` VERDICT SHIP, `code-reviewer` CODE_PASS.
- **Trạng thái**: ✅ Hoàn thành (2026-09-27).

### [IMP-208] Khắc Phục Toàn Diện 7 Tình Huống Bẫy Nút Bấm & Chuẩn Hóa Công Thái Học Ngữ Cảnh (Comprehensive Button Affordance & Interaction Hardening)
- **Mục tiêu**: Rà soát và triệt tiêu toàn bộ 7 tình huống False Affordance trên toàn bộ 195 tệp UI người dùng theo triết lý Công thái học Ngữ cảnh (Contextual True Affordance), không giấu nút cực đoan, bảo toàn nhận diện tài sản với disabled xám xúc giác và hướng dẫn hành động.
- **Hạ tầng hoàn tất**:
  * `src/client/ui/modals/title_deed_action_footer.tsx`: Khóa nút Thế Chấp sang xám disabled `bg-slate-200 text-slate-400 cursor-not-allowed` khi BĐS có công trình (`currentLevel > 0`), hiển thị tooltip hướng dẫn hạ cấp hết nhà về Cấp 0 trước khi thế chấp; triệt tiêu gray-on-color sang `text-amber-950 font-black`.
  * `src/client/ui/modals/portfolio_monopoly_analytics.ts`: Trích xuất module thuần `resolvePropertyCardActionState` chuẩn SRP, đồng bộ 100% với Server SSOT `checkEvenDowngrading` (`src/domain/property_upgrade.ts`), bảo vệ bất biến hạ cấp đồng đều và triệt tiêu bẫy kẹt Deadlock khi nhiều ô cùng C3.
  * `src/client/ui/modals/property_portfolio_modal.tsx`: Khai báo và truyền `isTradeFrozen`, áp dụng `actionState` cho nút Thế Chấp (`Cần Hạ Cấp`, `Đóng Băng`), nút Giải Chấp, nút Hạ Cấp và nút Đàm Phán Nhanh; thực hiện Subtractive Refactoring thành công giảm tệp từ 493 dòng xuống còn **465 dòng** (dưới trần nghiêm ngặt 483 LOC).
  * `src/client/ui/modals/trade/trade_column.tsx` & `trade_modal.tsx`: Nhận reactive `levelMap` từ Zustand store; hiển thị thẻ BĐS có công trình ở dạng mờ `opacity-60 bg-slate-50 cursor-not-allowed` với huy hiệu chuẩn chữ `🏠 C{level} (Có nhà)` (`text-[11px] font-bold`) và khóa không cho tick chọn vào giao dịch P2P.
  * `src/client/ui/modals/masterplan_components.tsx`: Nhận `isTradeFrozen` và vô hiệu hóa nút `[🤝 Đổi Ô]` khi thị trường đóng băng; đổi badge cấp độ sang `text-amber-950 font-black`.
  * `src/client/ui/modals/bot_trade_offer_modal.tsx`: Nhận diện số dư ví người chơi từ `sellerId` có sẵn trong props mà không cần import thêm `useLobbyStore`; vô hiệu hóa nút Đồng Ý Đổi và đổi nhãn thành `Thiếu Tiền Bù (-X Tr.)` khi ví thiếu tiền bù.
  * `src/client/ui/modals/bond_issuance_tab.tsx`: Kiểm tra điều kiện Net Worth >= 3000 và >= 2 BĐS chưa thế chấp; khóa nút phát hành kèm lý do rõ ràng; nâng chuẩn touch target min-h-[44px] cho 2 nút thao tác.
  * `src/client/ui/action_dock.tsx`: Nút Nộp Bảo Lãnh Kiểm Toán chuyển sang xám tĩnh không nảy `bg-slate-200 text-slate-400 border-slate-300 shadow-none cursor-not-allowed active:scale-100` khi số dư ví < 500; badge lượt chuyển sang `bg-slate-300 text-slate-500`.
  * `src/client/ui/modals/modal_host.tsx`: Truyền `isTradeFrozen` xuống `PropertyPortfolioModal`.
- **Kiểm thử & Bất biến**: `tests/contracts/imp208_comprehensive_button_affordance.test.ts` (21/21 atomic contract tests PASS 100%, Adversarial Inversion PASS), 49/49 regression tests PASS, `npm run lint:ui` 0 vi phạm trên toàn codebase, `tsc --noEmit` 0 lỗi.
- **Phê chuẩn**: `spec-reviewer` SPEC_PASS, `ui-craft-reviewer` VERDICT SHIP (4/4 điểm P1-P4 khắc phục triệt để), `code-reviewer` CODE_PASS.
- **Trạng thái**: ✅ Hoàn thành (2026-09-27).

---

### [IMP-208B] Cải Thiện Công Thái Học Chức Năng Ra Tù, Khử Xung Đột Đè Chữ Xúc Xắc & Tràn Nút ActionDock Mobile
- **Mục tiêu**: Khắc phục triệt để lỗi xung đột đè chữ giữa `actionDockNotice` và `DiceScoreBadge`, giải tỏa tình trạng chật chội tràn nút trên mobile 360px cho nút Nộp Bảo Lãnh, phá vỡ bẫy kẹt cảm xúc "không biết làm gì tiếp theo" khi gieo không ra đôi bằng hiệu ứng kêu gọi hành động (Callout Affordance) cho nút Kết Thúc Lượt, và ngữ cảnh hóa nút đóng Sổ Đỏ (`Tạm Đóng` vs `Đóng Xoay Vốn`).
- **Hạ tầng hoàn tất**:
  * `src/client/ui/action_dock.tsx`:
    - Di dời `actionDockNotice` ra khỏi positioning `absolute -top-10` sang luồng tài liệu tự nhiên (`flex flex-col items-center gap-1.5`), triệt tiêu 100% va chạm hình học với `DiceScoreBadge`.
    - Rút gọn nút Nộp Bảo Lãnh: Xóa bỏ badge `${turns} lượt` bên trong nút, giữ lại icon `⚖️` và nhãn `Bảo Lãnh (500)`, tiết kiệm không gian ngang trên màn hình di động 360px.
    - Kích hoạt Callout Affordance: Thêm class `ring-4 ring-emerald-400/90 shadow-[0_0_18px_rgba(16,185,129,0.6)] animate-pulse` cho nút Kết Thúc Lượt khi `inAudit && hasRolledThisTurn && !canRollAgain`. Cơ chế Reactive Teardown đảm bảo gỡ bỏ animation ngay tức khắc khi chuyển lượt hoặc nộp bảo lãnh.
    - Subtractive Refactoring đưa kích thước file từ 393 LOC xuống **379 LOC** (<= 385 LOC).
  * `src/client/ui/ui_helpers.ts`:
    - Ràng buộc `isMyTurn` chống Actor Inversion cho thông báo `inAudit`.
    - Đồng bộ ngữ nghĩa thông báo sau khi đổ xúc xắc không ra đôi: hiển thị `Không ra đôi: Nộp bảo lãnh hoặc Xong lượt`.
  * `src/client/ui/modals/title_deed_action_footer.tsx`:
    - Phân nhánh ngữ nghĩa thông minh cho nút phụ: hiển thị `Tạm Đóng` khi `canBuy = true` (đủ tiền mua đất nhưng muốn xem xét thêm) và `Đóng Xoay Vốn` khi `canBuy = false` (thiếu tiền, cần ra ngoài huy động vốn).
- **Kiểm thử & Bất biến**:
  - `tests/contracts/imp208_audit_bailout_and_dock_ergonomics.test.ts`: 16/16 atomic contract tests PASS 100%.
  - Adversarial Inversion Gate đã kiểm chứng: Station 1 FAILED 7 tests trước khi implement, Station 2 PASSED 16 tests sau khi implement.
  - Regression: `mobile_ui_ux_tri_package_polish.test.ts` (35/35 PASS), `imp204_property_purchase_affordance.test.ts` (17/17 PASS).
  - Snapshot: `.agents/evidence/imp-208b_snapshot.json` (`executed: true`, `inversionGate.verified: true`).
  - Linter: `npm run lint:ui` đạt 0 vi phạm.
- **Tech Debt**: Ghi nhận `DEBT-IMP208-01` (`ui_helpers.ts` đạt 445 LOC, cần tách `action_dock_helpers.ts` trong slice tới).
- **Phê chuẩn**: `spec-reviewer` SPEC_PASS, `ui-craft-reviewer` VERDICT SHIP, `scout` Station 2.5 PASS.
- **Trạng thái**: ✅ Hoàn thành (2026-09-27).

---

### [IMP-205] Làm Sạch Thế Chấp Khi Đấu Giá & Bảo Toàn Kho Bạc Bất Biến (Auction Mortgage Sanitization & Treasury Conservation)
- **Mục tiêu**: Khắc phục dứt điểm nguyên nhân người chơi mua đất tại đấu giá nhưng lại bị tính trừ/thế chấp 600 Tr và bị kẹt đất vào thế chấp; triệt tiêu vòng lặp vô tận thu hồi đất dự án treo (`CC_SLOW_BUILD`); bảo toàn bất biến quỹ Kho Bạc khi đấu giá đất công/thu hồi; và khử log chuộc đất ma trên Client.
- **Hạ tầng hoàn tất**:
  * `src/server/turn_loop.ts`: Khi `nextRounds > 2`, xóa hoàn toàn `unbuiltRounds` (`delete nextState.unbuiltRounds` -> `undefined`) thay vì reset về `0`; giải chấp nguyên tử ô đất bị thu hồi (`isMortgaged = false`, dọn dẹp `mortgagedProperties` và `mortgageLoans` của cựu chủ sở hữu); bổ sung `endTime: Date.now() + 20_000` và `currentBid: startingBid` chống lệch đồng hồ 00:00; thêm `break;` bảo vệ phiên đấu giá đơn lẻ.
  * `src/server/auction_manager.ts`: Truyền tham số `stateMap?: PropertyStateMap` qua `handleAuctionBid` và `handleAuctionPass` xuống `handleAuctionClose`; bàn giao Clean Title (`isMortgaged = false`, `delete unbuiltRounds`, xóa sạch khỏi `mortgagedProperties` trong phòng); xóa bỏ hoàn toàn monkey-patch toàn cục `knownStateMaps` loại bỏ rò rỉ bộ nhớ vĩnh viễn và ô nhiễm đa phòng; nộp 100% tiền trúng đấu giá đất công vào `room.treasury`; ưu tiên thu hồi nợ gốc thế chấp cho Kho Bạc khi phát mãi tài sản của con nợ trước khi hoàn trả thặng dư.
  * `src/server/room_manager.ts`: Truyền `this.propertyStates.get(roomCode)` vào `handleAuctionBid`, `handleAuctionPass` và `handleAuctionClose`; đồng bộ `this.syncAuction(roomCode)` vào cuối `handleEndTurn`.
  * `src/client/network/activity_property_tracker.ts`: `detectCellMortgage` nhận `isOwnerChanged` và kiểm tra an toàn sau khi resolve `ownerId`, chặn đứng hoàn toàn `ReferenceError` và chặn phát sinh log chuộc lại đất ma cho chủ mới khi nhận BĐS sạch nợ từ sàn đấu giá.
- **Kiểm thử & Bất biến**:
  * `tests/contracts/imp205_auction_mortgage_sanitization_and_treasury_conservation.test.ts`: 19/19 atomic contract tests PASS 100%.
  * Adversarial Inversion Gate đã kiểm chứng: Station 1 FAILED 15 tests trước khi implement, Station 2 PASSED 19 tests sau khi implement.
  * Toàn bộ 52 test files trong `tests/server/` (676 tests) PASS 100%.
  * `npx tsc --noEmit` thoát mã 0 không lỗi.
  * Snapshot: `.agents/evidence/imp205_snapshot.json` (`executed: true`, `contractTestsPassed: true`).
  * Ghi nhận Invariant 4 (Pillar I) và Invariant 6 (Pillar II) vào `docs/domain/gotchas.md`.
- **Tech Debt**: Ghi nhận `DEBT-ROOM-MGR-01` (`src/server/room_manager.ts` đạt 533 LOC, vượt trần Tier 1 <= 400 LOC do dồn nén dead delegate surface và 10 Map phân tán; lộ trình xử lý 2 bước: Bước 1 Fast-Track khử ping-pong wrappers giữa `intent_dispatcher` và `room_manager`; Bước 2 Full Rigor One-Way Door chuyển đổi sang `GameRoomSession` Aggregate Root để đưa file về < 180 LOC).
- **Phê chuẩn**: `plan-griller` (P1-P5 hardened), `qa-tester` (Station 1 RED), `implementer` (Station 2 GREEN), `scout` (Station 2.5 PASS), `spec-reviewer` (Station 3 APPROVED), `code-reviewer` (Station 3 APPROVED).
- **Trạng thái**: ✅ Hoàn thành (2026-09-27).

---

### [IMP-209] Bẻ Gãy Chuỗi Dội Ngược Intent & Tinh Giản Bề Mặt Delegate An Toàn (Decouple Intent Ping-Pong & Safe Delegate Pruning - Bước 1)
- **Mục tiêu**: Bẻ gãy chuỗi dội ngược (Ping-Pong Antipattern) giữa `intent_dispatcher` và `room_manager`, chuyển `intent_dispatcher` sang gọi trực tiếp Domain Coordinators (`room_property_coordinator`, `property_actions`, `hose_actions`, `bond_manager`), bảo vệ tính tương thích ngược cho 54 call sites trong 18 test suite cũ, bảo toàn 100% thân hàm auction & watchdog, và dọn dẹp sạch bề mặt điều phối để chuẩn bị cho Bước 2 (`GameRoomSession` Aggregate Root).
- **Hạ tầng hoàn tất**:
  * `src/server/intent_dispatcher.ts`:
    - Nhận `const ctx = m.getContext(rc)` và gọi trực tiếp các Domain Coordinators & Handlers (`coordMortgage`, `coordRedeem`, `coordDowngrade`, `coordTrade`, `coordRespondTradeOffer`, `coordBankruptcy`, `coordExecuteCompulsoryBuyout`, `coordDeclineCompulsoryBuyout`, `handleUpgrade`, `handleUpgradeETC`, `handleUpgradeUtility`, `handleBuyProperty`, `handleHoseInvest`, `handleHoseSkip`, `handleIssueBond`, `handleRepayBond`).
    - Bổ sung Context Null Guard an toàn tuyệt đối: `if (!ctx) return { success: false, reason: ActionRejectReason.INVALID_ROOM }`.
    - Đưa file từ 108 lên **162 LOC** (Tier 1 <= 400 LOC, hoàn toàn an toàn).
  * `src/server/room_manager.ts`:
    - Thêm public getter `rolledThisTurnMap` để `coordBankruptcy` truy cập an toàn mà không cần dirty casts `(m as any)`.
    - Tinh giản `handleTradeOffer` với logic phân nhánh gọn gàng, giảm 16 dòng cồng kềnh.
    - Bảo toàn 100% thân hàm `handleAuctionBid`, `handleAuctionPass`, `handleAuctionClose` (`auction_manager`, `this.syncAuction`, `this.lastAuctionResults.set`) bảo vệ Bot AI và Turn Watchdog.
    - Giữ nguyên 100% public signatures cho 54 call sites trong 18 test suite cũ.
    - Hạ kích thước file từ 533 LOC xuống **518 LOC** (SLOC 440).
  * `src/server/network/afk_recovery.ts`:
    - Giữ nguyên 100% (0 dòng sửa đổi), triệt tiêu hoàn toàn rủi ro vòng lặp cứu nguy AFK kích hoạt 50 lần `touchActivity` trong 1 tick.
- **Kiểm thử & Bất biến**:
  * `npx tsc --noEmit`: 0 lỗi, 0 cảnh báo.
  * Toàn bộ 52 test files trong `tests/server/` (676 tests) PASS 100%.
  * `tests/contracts/imp205_auction_mortgage_sanitization_and_treasury_conservation.test.ts`: 19/19 tests PASS 100%.
  * Snapshot: `.agents/evidence/imp209_snapshot.json`.
- **Tech Debt**: Khoản nợ `DEBT-ROOM-MGR-01` chuyển sang trạng thái ⏳ CHỜ BƯỚC 2 (One-Way Door chuyển đổi sang `GameRoomSession` Aggregate Root để đưa file về < 180 LOC).
- **Phê chuẩn**: Kế hoạch `docs/plans/improvements/IMP-209-decouple-intent-ping-pong-and-delegate-pruning_plan.md`; Báo cáo `docs/reports/improvements/IMP-209-decouple-intent-ping-pong-and-delegate-pruning_report.md`.
- **Trạng thái**: ✅ Hoàn thành Bước 1 (2026-09-27).

---

### [IMP-209-UI] Giao Diện Sổ Đỏ Tinh Giản & Khử Anti-Pattern (Clean Single-Row Purchase Footer & Semantic Disambiguation)
- **Mục tiêu**: Loại bỏ triệt để các anti-pattern giao diện trên popup Sổ Đỏ (`TitleDeedActionFooter`): xóa bỏ nút `[✕ Đóng]` trùng lặp ở đáy footer; đổi nhãn mơ hồ `Bỏ Qua (Pass)` thành **`✕ Từ Chối Mua`** dứt khoát; xóa bỏ các nút giả lập trạng thái (`CẦM CỐ ĐỂ MUA (+10.050)` gây hiểu lầm cắm sạch tài sản, nút xám `[Không Đủ Tiền]`), thay bằng dòng text cảnh báo nhẹ nhàng `⚠️ Số dư không đủ (Thiếu ...)`; gom 2 nút quyết định chính vào **1 hàng duy nhất** (`grid-cols-2`); cân bằng quang học Header Sổ Đỏ (`px-12 sm:px-14`, nút đóng mờ `bg-black/25`); và ẩn chip thông báo ActionDock khi modal mở.
- **Hạ tầng hoàn tất**:
  * `src/client/ui/modals/title_deed_action_footer.tsx`:
    - Tái cấu trúc Single Row: 2 nút đối xứng ngang bằng chiều cao `min-h-[48px]`, bo góc `rounded-xl`, xúc giác lún nảy `active:translate-y-[3px]`.
    - Cột 1: Nút `Mua BĐS (X Tr.)` bảo toàn định danh khi thiếu tiền (`bg-slate-200 text-slate-400 cursor-not-allowed`) và khi đủ tiền (`bg-emerald-700 hover:bg-emerald-600 text-white`). Khi đóng băng: `❄️ Đóng Băng (Cấm Mua)`.
    - Cột 2: Nút `✕ Từ Chối Mua` màu hồng phấn tao nhã (`bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-rose-300`). Khi đóng băng: `✕ Đóng` (gọi `onClose`).
    - Dòng text cảnh báo thiếu tiền: `data-testid="insufficient-funds-notice"` với layout linh hoạt `flex flex-col sm:flex-row` chống tràn chữ trên màn hình 360px.
    - Subtractive Refactoring: Rút gọn kích thước file từ 222 xuống **215 LOC** (Tier 2 <= 500 LOC).
  * `src/client/ui/modals/title_deed_modal.tsx`:
    - Cân đối đối xứng padding tiêu đề `px-12 sm:px-14`.
    - Nút đóng `[X]` tròn trên ruy-băng đổi sang kính mờ quang học `bg-black/25 hover:bg-black/45 backdrop-blur-sm border border-white/30 text-white min-w-[44px] min-h-[44px]`.
  * `src/client/ui/action_dock.tsx`:
    - Thêm guard `!activeModal` vào `actionDockNotice`, triệt tiêu hoàn toàn hiện tượng lem nhem xuyên thấu sau modal.
- **Kiểm thử & Bất biến**:
  - `tests/contracts/imp209_clean_single_row_purchase_footer.test.ts`: 17/17 atomic contract tests PASS 100%.
  - Adversarial Inversion Gate: Station 1 FAILED 14/17 tests trước khi code, Station 2 PASSED 17/17 tests sau khi implement.
  - Tuân thủ Domain Invariant **Strict Intent Callback Isolation** (TC-209.04b): Bấm `✕ Từ Chối Mua` gọi độc lập `onPass`, khẳng định `onClose` KHÔNG bị gọi (`toHaveBeenCalledTimes(0)`).
  - Điều hòa 6 suites cũ: `imp204`, `imp207`, `imp208`, `imp110`, `imp128`, `imp140`, `phase4` (241/241 tests PASS).
  - Linter: `npm run lint:ui` = 0 vi phạm; `npx tsc --noEmit` = 0 lỗi.
  - Production Build: `npm run build` hoàn thành trong 6.8s; client bundle xác thực chứa `Từ Chối Mua: true`, loại trừ hoàn toàn `Đóng Xoay Vốn: false`, `Bỏ Qua (Pass): false`.
- **Phê chuẩn**: `plan-griller` (P1-P5 hardened), `qa-tester` (Station 1 RED verified), `implementer` (Station 2 GREEN verified), `scout` (Station 2.5 PASS), `spec-reviewer` (SPEC_PASS), `code-reviewer` (CODE_PASS), `ui-craft-reviewer` (VERDICT SHIP).
- **Trạng thái**: ✅ Hoàn thành (2026-09-27).

---

### [IMP-210] GameRoomSession Aggregate Root & RoomManager Structural Pruning
- **Mục tiêu**: Bước 2 của Chiến lược Tái Cấu Trúc `RoomManager` (One-Way Door). Gom toàn bộ 10 `Map<string, T>` phân tán cấp class vào Domain-Driven Design (DDD) Aggregate Root `GameRoomSession`, cung cấp cơ chế Dynamic Map Facades (`SessionFieldProxy`, `BotPersonalityMapFacade`) tuân thủ 100% Map protocol parity (tất cả 11 methods), bóc tách composite key bot personality, dọn dẹp timers qua `session.clearTimers()`, chuyển `doHandleEndTurnSession` sang nhận trực tiếp session, đưa `room_manager.ts` về 378 LOC (<= 400 LOC Tier 1), và đóng vĩnh viễn nợ kỹ thuật `DEBT-ROOM-MGR-01`.
- **Hạ tầng hoàn tất**:
  * `src/server/game_room_session.ts` (MỚI - 118 LOC):
    - Đóng gói toàn bộ vi trạng thái phòng chơi (`Room`, `PropertyRegistry`, `PropertyStateMap`, `AuctionSession`, `rolledThisTurn`, `lastAuctionResult`, `activeTimers`, `lastActivity`, `botPersonalities`).
    - Getter/setter hai chiều nguyên tử cho `auction` và `lastAuctionResult` tự động đồng bộ sang `room`.
    - Methods: `toContext()`, `touchActivity()`, `registerTimer()`, `clearTimers()`, `destroy()`.
  * `src/server/session_proxy_facade.ts` (MỚI - 288 LOC):
    - `createSessionFieldProxy`: Full Map Protocol (11/11 methods: `[Symbol.iterator]`, `entries`, `keys`, `values`, `size`, `forEach`, `clear`, `get`, `set`, `has`, `delete`), hỗ trợ two-way write-through và phân định trường tùy chọn (`auction`, `lastAuctionResult`).
    - `createBotPersonalityMapFacade`: Composite key facade bóc tách `${roomCode}:${botId}` chuẩn mực.
  * `src/server/room_manager.ts` (REFACTOR SÂU - 378 LOC, giảm 140 LOC):
    - Triệt tiêu 10 Map phân tán, lưu trữ duy nhất `private readonly sessions = new Map<string, GameRoomSession>()`.
    - Cung cấp `getSession(roomCode)` hỗ trợ case-insensitive lookup (`vtd8j8` == `VTD8J8`).
    - Dynamic map getters bảo toàn 100% tương thích ngược cho 54 call sites trong 18 test suite cũ.
    - Bảo toàn thứ tự Teardown: Hooks (bọc `try...catch`) -> PendingTrade -> Destroy -> Delete.
  * `src/server/room_manager_lifecycle.ts` (335 LOC):
    - Thêm `doCreateRoomSession` (trả về `GameRoomSession`).
    - Thêm `doHandleEndTurnSession` (dùng local single-entry maps, truyền `session.rolledThisTurn`, zero proxy overhead).
    - Bảo toàn 100% các adapter exported cũ.
- **Kiểm thử & Bất biến**:
  - `tests/contracts/imp210_game_room_session_aggregate_root.test.ts`: 20/20 atomic contract tests PASS 100% (5 facets).
  - Adversarial Inversion Gate: Station 1 FAILED 20/20 tests trước khi code, Station 2 PASSED 20/20 tests sau khi implement.
  - Toàn bộ 52 test files server (676 tests) PASS 100%.
  - `tests/contracts/imp205_...test.ts`: 19/19 tests PASS 100%.
  - `npx tsc --noEmit`: 0 lỗi, 0 cảnh báo.
  - Đo LOC: `room_manager.ts` = 378 LOC (đạt chuẩn Tier 1 <= 400 LOC). ĐÓNG NỢ `DEBT-ROOM-MGR-01`.
  - Evidence Snapshot: `.agents/evidence/imp210_snapshot.json` (`executed: true`).
- **Phê chuẩn**: `plan-griller` (P1-P5 audit), `qa-tester` (Station 1 RED), `implementer` (Station 2 GREEN), `scout` (Station 2.5 PASS), `spec-reviewer` (APPROVED), `code-reviewer` (APPROVED).
- **Trạng thái**: ✅ Hoàn thành Bước 2 (2026-09-27).

### [IMP-211] Tinh Giản Sàn Đấu Giá 15s & Đề Xuất Đổi Đất Bot (Gói 1 Modernization)
- **Mục tiêu**: Gói 1 trong kế hoạch cải tổ toàn diện UI game VTCoOn. Chuẩn hóa Clean Tactile Affordance, khử anti-pattern nút biến dạng thành biển báo nợ nần, loại bỏ fallback ngầm `onPass ?? onClose` (bảo vệ ADR-0001 Strict Intent Callback Isolation), chuẩn hóa SSOT thuần Việt (`✕ Rút Lui`, `TỰ ĐỘNG ĐẶT GIÁ: BẬT / TẮT`, `🚫 Từ chối mua`), và phân định minh bạch 4 trạng thái footer của sàn đấu giá.
- **Hạ tầng hoàn tất**:
  * `src/client/ui/modals/auction_modal.tsx` (442 LOC — Tier 2 <= 500 LOC):
    - Khử hoàn toàn `onPass ?? onClose`, phân lập 100% callback intent (`onPass`) và dismiss handler (`onClose`).
    - Lưới 2 cột đối xứng `grid-cols-2`: Cột 1 = Auto-Bid toggle button; Cột 2 = 4 trạng thái phân minh (`auction-pass-btn`, `auction-passed-close-btn`, `auction-declined-close-btn`, `auction-concluded-close-btn`).
    - Chuẩn hóa nhãn SSOT: `✕ Rút Lui` (assert chuỗi tại TC-211.02), `TỰ ĐỘNG ĐẶT GIÁ: BẬT / TẮT`, badge `🚫 Từ chối mua`; các nút đóng phụ được kiểm thử định danh theo `data-testid` độc lập với copy text.
  * `src/client/ui/modals/bot_trade_offer_modal.tsx` (283 LOC — Tier 2 <= 500 LOC):
    - Tách biệt dòng thông báo thiếu tiền bù giao dịch ra thẻ riêng `data-testid="trade-shortfall-notice"`.
    - Bảo toàn định danh nút `✓ ĐỒNG Ý ĐỔI` / `✓ ĐỒNG Ý BÁN` ở trạng thái disabled mờ khi thiếu tiền.
    - Nút từ chối mang phong cách hồng phấn `bg-rose-50 border-rose-300`, touch target min-h-[46px].
- **Kiểm thử & Bất biến**:
  * `tests/contracts/imp211_auction_and_bot_trade_clean_affordance.test.ts`: 16/16 atomic tests PASS 100% (4 facets).
  * Adversarial Inversion: Station 1 RED (12 failed / 4 passed), Station 2 GREEN (16/16 passed).
  * Điều hòa đặc tả tiến hóa (Specification Evolution): Reconcile sạch 108 tests (`imp211`, `auction_modal`, `imp156`, `imp138`, `imp196`, `imp106`, `imp208`).
  * `npx tsc --noEmit`: 0 lỗi. `npm run lint:ui`: 0 vi phạm (195 files scanned).
  * Production Build: `npm run build` thành công, SSR bundle 430.80 kB.
  * Evidence Snapshot: `.agents/evidence/imp211_snapshot.json` (`executed: true`).
- **Phê chuẩn**: `qa-tester` (Station 1 RED), `implementer` (Station 2 GREEN), `scout` (Station 2.5 PASS), `spec-reviewer` (SPEC_PASS APPROVED), `ui-craft-reviewer` (VERDICT SHIP), `code-reviewer` (CODE_PASS APPROVED).
- **Trạng thái**: ✅ Hoàn thành Gói 1 (2026-09-27).

### [IMP-212] Tinh Giản Danh Mục BĐS, Trái Phiếu & Đàm Phán P2P (Gói 2 Modernization)
- **Mục tiêu**: Gói 2 trong chiến dịch cải tổ UI toàn diện. Khử nút [✕ Đóng] footer trùng lặp tại Danh Mục BĐS (`PropertyPortfolioModal`) giải phóng 50px diện tích cuộn; hiển thị số liệu BĐS trên Header subtitle; chuẩn hóa True Affordance tab Trái Phiếu (`BondIssuanceTab`) với nhãn cố định `PHÁT HÀNH TRÁI PHIẾU`, thẻ cảnh báo điều kiện `bond-blocked-notice`, nút tất toán gờ bóng tactile `shadow-[0_4px_0_0_#065f46]` đạt touch target min-h-[46px]; thanh lọc sạch sẽ nút ma tàng hình `className="hidden"` và `data-legacy-style` trong Đàm Phán P2P (`TradeModal`), loại bỏ nút Hủy footer để nút gửi chiếm 100% bề ngang (`w-full min-h-[48px]`).
- **Hạ tầng hoàn tất**:
  * `src/client/ui/modals/property_portfolio_modal.tsx` (450 LOC — Tier 2 <= 500 LOC):
    - Đưa thông kê tài sản lên tiêu đề phụ: `Quản lý {ownedProperties.length} tài sản sở hữu • Nâng cấp nhanh 1-click`.
    - Xóa bỏ hoàn toàn thẻ `<footer>` ở chân modal, giải phóng không gian cuộn cho cả danh mục và tab trái phiếu.
  * `src/client/ui/modals/bond_issuance_tab.tsx` (102 LOC — Tier 2 <= 500 LOC):
    - Tách cảnh báo điều kiện phát hành ra thẻ riêng `data-testid="bond-blocked-notice"` tone amber trang nhã.
    - Cố định nhãn `PHÁT HÀNH TRÁI PHIẾU` khi disabled; nút tất toán đạt chuẩn tactile button `shadow-[0_4px_0_0_#065f46]` min-h-[46px].
  * `src/client/ui/modals/trade_modal.tsx` (279 LOC — Tier 2 <= 500 LOC) & `trade_column.tsx` (246 LOC):
    - Quét sạch nút ma `hidden` 'Thế chấp' và thuộc tính `data-legacy-style`.
    - Chân modal tinh gọn 1 nút duy nhất `data-testid="submit-trade-btn"` chiếm `w-full min-h-[48px]` với gờ bóng ngọc lục bảo `shadow-[0_4px_0_0_#065f46]`.
- **Kiểm thử & Bất biến**:
  * `tests/contracts/imp212_portfolio_bond_and_trade_clean_affordance.test.ts`: 16/16 atomic contract tests PASS 100% (4 facets).
  * Adversarial Inversion: Station 1 RED (14 failed / 2 passed), Station 2 GREEN (16/16 passed).
  * Điều hòa đặc tả tiến hóa (Specification Evolution): Reconcile sạch 172 tests thuộc 10 test suites (`imp212`, `imp153`, `imp202`, `imp200`, `imp211`, `imp209`, `imp208`, `imp75`, `imp188`, `imp199`).
  * `npx tsc --noEmit`: 0 lỗi. `npm run lint:ui`: 0 vi phạm (195 files scanned).
  * Production Build: `npm run build` thành công, SSR bundle 430.80 kB.
  * Evidence Snapshot: `.agents/evidence/imp212_snapshot.json` (`executed: true`).
- **Phê chuẩn**: `qa-tester` (Station 1 RED), `implementer` (Station 2 GREEN), `scout` (Station 2.5 PASS), `spec-reviewer` (SPEC_PASS APPROVED), `ui-craft-reviewer` (VERDICT SHIP), `code-reviewer` (CODE_PASS APPROVED).
- **Trạng thái**: ✅ Hoàn thành Gói 2 (2026-09-27).

### [IMP-213] Chuẩn Hóa Thu Hồi Cưỡng Chế 130%, Sàn HOSE & Thể Lệ (Gói 3 Modernization)
- **Mục tiêu**: Gói 3 trong chiến dịch cải tổ UI toàn diện. Chuẩn hóa dứt khoát nhãn `✕ Từ Chối Mua` (loại bỏ `✕ Bỏ Qua`), giữ nguyên định danh nút `Mua Lại ({cost})` disabled mờ khi thiếu tiền đền bù 130% kèm thẻ cảnh báo `buyout-shortfall-notice`; đổi nhãn `✕ Bỏ Qua` thành `✕ Không Cược` chuẩn ngữ cảnh cá cược chứng khoán tại Sàn HOSE, quét sạch thuộc tính ma `data-legacy-rates`, nâng cấp nút bấm đạt `min-h-[46px]` với gờ bóng tactile chân thực; giải phóng 50px diện tích đọc thể lệ tại Modal Hướng Dẫn (`GameRulesModal`) bằng cách tháo gỡ hoàn toàn footer thừa, gắn tooltip rõ ràng (`title="Đóng hướng dẫn (Phím Esc hoặc click nền)"`) vào nút Header `[X]` với touch target min-h-[44px] min-w-[44px].
- **Hạ tầng hoàn tất**:
  * `src/client/ui/modals/compulsory_buyout_modal.tsx` (192 LOC — Tier 2 <= 500 LOC):
    - Đổi nhãn `✕ Bỏ Qua` sang `✕ Từ Chối Mua` với tone hồng phấn tao nhã `bg-rose-50 border-rose-300 text-rose-700 shadow-[0_4px_0_0_#fca5a5]`.
    - Bảo toàn định danh nút `Mua Lại ({cost})` khi không đủ tiền mặt ở trạng thái disabled mờ (`cursor-not-allowed bg-slate-200 text-slate-400`).
    - Bổ sung thẻ cảnh báo riêng `data-testid="buyout-shortfall-notice"` tone amber hiển thị số tiền thiếu chính xác.
    - Cả 2 nút đạt `h-full min-h-[48px]`, dàn trang 2 cột đối xứng `grid-cols-2`.
    - Thêm cơ chế fallback SSR cho store Zustand để tương thích hoàn hảo `renderToStaticMarkup`.
  * `src/client/ui/modals/hose_modal.tsx` (333 LOC — Tier 2 <= 500 LOC):
    - Đổi nhãn `✕ Bỏ Qua` thành `✕ Không Cược` chuẩn ngữ cảnh giao dịch chứng khoán.
    - Quét sạch 100% thuộc tính ma `data-legacy-rates` trong DOM.
    - Nút Cược và Không Cược đều đạt touch target `min-h-[46px]` kèm gờ bóng tactile 3D (`shadow-[0_4px_0_0_#065f46]` và `shadow-[0_4px_0_0_#fca5a5]`), độ lún cơ học `active:translate-y-[3px]`.
    - Dọn dẹp an toàn AudioContext types và timer unmount.
  * `src/client/ui/modals/game_rules_modal.tsx` (333 LOC — Tier 2 <= 500 LOC):
    - Loại bỏ hoàn toàn thanh `footer` chứa nút `Đã Hiểu` thừa thãi, giải phóng 50px diện tích cuộn cho toàn bộ các tab hướng dẫn.
    - Nút đóng Header `[X]` đạt touch target chuẩn `min-w-[44px] min-h-[44px]`, bổ sung tooltip chỉ dẫn trực quan `title="Đóng hướng dẫn (Phím Esc hoặc click nền)"`.
- **Kiểm thử & Bất biến**:
  * `tests/contracts/imp213_buyout_hose_rules_clean_affordance.test.ts`: 16/16 atomic contract tests PASS 100% (4 facets).
  * Adversarial Inversion: Station 1 RED (8 failed / 8 passed), Station 2 GREEN (16/16 passed).
  * Điều hòa đặc tả tiến hóa (Specification Evolution): Reconcile sạch 108 tests thuộc 7 test suites (`imp213`, `imp212`, `imp211`, `imp209`, `imp161`, `imp172`, `auction_modal`).
  * `npx tsc --noEmit`: 0 lỗi. `npm run lint:ui`: 0 vi phạm (195 files scanned).
  * Production Build: `npm run build` thành công, SSR bundle 430.80 kB.
  * Evidence Snapshot: `.agents/evidence/imp213_snapshot.json` (`executed: true`).
- **Phê chuẩn**: `qa-tester` (Station 1 RED), `implementer` (Station 2 GREEN), `scout` (Station 2.5 PASS), `spec-reviewer` (SPEC_PASS APPROVED), `ui-craft-reviewer` (VERDICT SHIP), `code-reviewer` (CODE_PASS APPROVED).
- **Trạng thái**: ✅ Hoàn thành Gói 3 (2026-09-27) — **HOÀN TẤT 100% CHIẾN DỊCH CẢI TỔ UI TOÀN GAME (IMP-209, IMP-211, IMP-212, IMP-213)**.

### [IMP-214] Minh Bạch Hóa Thâu Tóm M&A & Cải Thiện Affordance Thẻ Sự Kiện
- **Mục tiêu**: Xóa bỏ hoàn toàn sự mập mờ và ức chế của người chơi khi rút trúng thẻ Cơ Hội `CC_MA_FORCE` (Thâu Tóm Doanh Nghiệp M&A). Minh bạch hóa kết quả giao dịch trên Server & DTO (tên ô đất đã mua, chủ cũ bị thâu tóm, số tiền chuyển nhượng 120% thực tế, bên nhận tiền); cải thiện Client UI Affordance với nhãn nút `ĐÃ THÂU TÓM BĐS • ĐÓNG` (hoặc `NHẬN TRỢ CẤP M&A • ĐÓNG`) triệt tiêu 100% ngộ nhận mở giao diện đàm phán P2P.
- **Hạ tầng hoàn tất**:
  * `src/domain/room.ts` (265 LOC — Tier 1 <= 400 LOC): Định nghĩa interface `MaBuyoutResult` và trường `lastMaBuyout` trên `Room`.
  * `src/domain/chance_card_handlers.ts` (362 LOC — Tier 1 <= 400 LOC): Trong `handleMaForce`, ghi nhận thông tin ô đất và đối thủ bị mua lại khi thâu tóm thành công; dọn sạch state khi fallback.
  * `src/domain/event_card_engine.ts` (147 LOC — Tier 1 <= 400 LOC): Áp dụng mẫu Take-and-Clear Pattern, cấu tạo mô tả chi tiết `"Đã thâu tóm thành công [${cellName}] từ ${sellerName} với giá 120% (${cost.toLocaleString('vi-VN')})."`. Tuân thủ Clean Architecture không import `formatCurrency` client vào domain.
  * `src/server/turn_loop.ts` (302 LOC — Tier 1 <= 400 LOC): Dọn dẹp `room.lastMaBuyout = undefined;` tại cả 2 pha chuyển lượt `executeRollDice` và `executeTurnEnd` để chống rò rỉ Turn N+1.
  * `src/client/ui/modals/event_card_visuals.ts` (342 LOC — Tier 2 <= 500 LOC): Mở rộng `getCardCtaButtonText` nhận `effectDelta`, trả về `ĐÃ THÂU TÓM BĐS • ĐÓNG` hoặc `NHẬN TRỢ CẤP M&A • ĐÓNG`; cập nhật Hero Stat `THÂU TÓM BĐS`; bổ sung từ khóa "chuyển nhượng" và "thanh toán" cho destination pill.
  * `src/client/ui/modals/event_card_modal.tsx` (226 LOC — Tier 2 <= 500 LOC): Kết nối `effectDelta` vào nút CTA, touch target min-h-[46px].
- **Kiểm thử & Bất biến**:
  * `tests/contracts/imp214_ma_event_card_transparency.test.ts`: 16/16 atomic contract tests PASS 100% (4 facets).
  * Adversarial Inversion: Station 1 RED (9 failed / 7 passed), Station 2 GREEN (16/16 passed).
  * `npx tsc --noEmit`: 0 lỗi. `npm run lint:ui`: 0 vi phạm (195 files scanned).
  * Production Build: `npm run build` thành công, SSR bundle 432.53 kB.
  * Evidence Snapshot: `.agents/evidence/imp214_snapshot.json` (`executed: true`).
- **Phê chuẩn**: `plan-griller` (AUDITED), `qa-tester` (Station 1 RED), `implementer` (Station 2 GREEN), `scout` (Station 2.5 PASS), `spec-reviewer` (SPEC_PASS APPROVED), `ui-craft-reviewer` (VERDICT SHIP), `code-reviewer` (CODE_PASS APPROVED).
- **Trạng thái**: ✅ Hoàn thành IMP-214 (2026-09-27).

### [IMP-208P] Nâng Cấp Công Thái Học Giao Diện Giao Dịch BĐS Trên Mobile
- **Mục tiêu**: Chuẩn hóa toàn diện công thái học 2D UI/UX cho toàn bộ luồng giao dịch Bất Động Sản (Sổ Đỏ, Mua BĐS, Sàn Đàm Phán P2P, Quản Lý Danh Mục & Thế Chấp) trên thiết bị di động (viewport 360px - 414px), đảm bảo zero-regression trên Desktop, thỏa mãn 100% Impeccable Craft Standards và bảo toàn nghiêm ngặt ngân sách LOC.
- **Hạ tầng hoàn tất**:
  * `src/client/ui/modals/purchase_decision_card.tsx` (155 LOC — Tier 2 <= 500 LOC): Nâng toàn bộ sàn cỡ chữ (radar badge, cell chips, building level, freeze banner, cash buffer) lên >= 11px, sạch hoàn toàn micro-text < 11px.
  * `src/client/ui/modals/title_deed_rent_table.tsx` (263 LOC — Tier 2 <= 500 LOC): Nâng nhãn độc quyền `x2 ĐỘC QUYỀN`, `x1.5 ĐỘC QUYỀN`, các chip cấp bậc và mini-bar lên text-[11px] font-black; nút mở rộng và thu gọn biểu phí nâng đạt chuẩn `min-h-[44px]`.
  * `src/client/ui/modals/portfolio_tab_header.tsx` (34 LOC — Tier 2 <= 500 LOC): Nâng các nút tab BĐS và Trái Phiếu lên `min-h-[44px]`, bổ sung `focus-visible:ring-2 focus-visible:ring-amber-400`.
  * `src/client/ui/modals/trade_sentiment_meter.tsx` (104 LOC — Tier 2 <= 500 LOC): Chống tràn văn bản với `min-w-0 flex-1` và `truncate min-w-0` kèm thuộc tính `title`.
  * `src/client/ui/modals/trade/trade_partner_strip.tsx` (74 LOC — Tier 2 <= 500 LOC): Bổ sung `focus-visible:ring-2 focus-visible:ring-amber-400` cho các tab chọn đối tác.
  * `src/client/ui/modals/trade_modal.tsx` (279 LOC — Tier 2 <= 500 LOC): Tinh giản nhãn deal compound ` (1 • 5.000)` và thuần tiền mặt ` (5.000)` triệt tiêu hoàn toàn hậu tố `Tr.` theo bất biến IMP-197, chống rớt dòng trên màn 360px nhưng bảo toàn 100% test TC-202.07 ` (2 BĐS)` khi thuần tài sản; thêm span truncate và focus-visible.
  * `src/client/ui/modals/trade/trade_column.tsx` (246 LOC — Tier 2 <= 500 LOC): Nâng cấp các phím gợi ý giá bán/mua đạt hiệu ứng bóng xúc giác 3D `shadow-[0_2px_0_0_#fcd34d]` (bán) và `shadow-[0_2px_0_0_#93c5fd]` (mua) kèm độ lún `active:translate-y-[2px]`.
  * `src/client/ui/modals/property_portfolio_modal.tsx` (475 LOC — Tier 2 <= 500 LOC): Triệt tiêu cuộn ngang thanh lọc với `grid grid-cols-4 gap-1` (nhãn responsive: Sắp Đủ 🔥, Thế Chấp); thiết lập Rich Empty State kèm giải thích luật và Recovery CTA [Xem Tất Cả (N BĐS)]; co giãn chiều cao `h-auto` tự nhiên khi rỗng; thu gọn hàng mảnh ghép còn thiếu chống xén tên tỉnh thành; bố cục lưới 2 cột cho các nút hành động thẻ BĐS.
- **Kiểm thử & Bất biến**:
  * `tests/contracts/imp208_mobile_real_estate_ui_polish.test.ts`: 18/18 atomic contract tests PASS 100%.
  * Toàn bộ 9 suites liên quan (179 tests): PASS 100%.
  * `npx tsc --noEmit`: 0 lỗi. `npm run lint:ui`: 0 vi phạm (195 files scanned).
  * Evidence Snapshot: `.agents/evidence/imp208p_snapshot.json` (`executed: true`).
- **Phê chuẩn**: `plan-griller` (AUDITED), `qa-tester` (Station 1 RED), `implementer` (Station 2 GREEN), `scout` (Station 2.5 PASS), `spec-reviewer` (SPEC_PASS APPROVED), `ui-craft-reviewer` (VERDICT SHIP).
- **Trạng thái**: ✅ Hoàn thành IMP-208P (2026-09-28).

### [IMP-210] 1-Click Smart Auto-Solvency (⚡ Cân Đối Tự Động / Cứu Nguy Nhanh 1-Chạm)
- **Mục tiêu**: Bổ sung cơ chế giải cứu tự động 1-chạm (`INTENT_AUTO_SOLVENCY`) khi người chơi rơi vào trạng thái thâm hụt số dư trong `InsolvencyPhase`. Thay vì người chơi phải mở từng miếng đất và tính toán hạ cấp / thế chấp thủ công trong 45s đếm ngược, người chơi có thể bấm 1 nút để máy tự động tính toán phương án thanh lý tối ưu (hạ cấp công trình đồng đều từ thấp lên cao, sau đó thế chấp các ô đất rẻ nhất chưa thế chấp, bỏ qua ô đóng băng thanh khoản) đưa số dư về $\ge 0$ ngay lập tức.
- **Hạ tầng hoàn tất**:
  * `src/server/intent_dispatcher.ts` (179 LOC — Tier 1 <= 400 LOC): Mở rộng `PlayerIntent` với `{ type: 'INTENT_AUTO_SOLVENCY' }`. Thiết lập Single Authoritative Guard: FSM Phase Guard (`room.phase === TurnPhase.InsolvencyPhase`) và Off-Turn Hijack Guard (`current.id === p && current.balance < 0`) ngay trong handler, kết nối `executeInsolvencyAfkRecovery`. Loại bỏ double guard dư thừa.
  * `src/client/ui/modals/portfolio_deficit_banner.tsx` (58 LOC — Tier 2 <= 500 LOC): Submodule mới tách ra từ `property_portfolio_modal.tsx`, hiển thị thông tin thâm hụt và nút bấm 1-chạm xúc giác 3D `min-h-[44px]` kèm `focus-visible:ring-2`.
  * `src/client/ui/modals/property_portfolio_modal.tsx` (466 LOC — Tier 2 <= 500 LOC): Thực hiện tái cấu trúc trừu tượng (subtractive refactoring) trích xuất khối banner nợ, giúp tệp giảm từ 483 LOC xuống 466 LOC (giảm 17 dòng, an toàn dưới trần 470 LOC theo Hiến pháp).
  * `src/client/ui/modals/insolvency_banner.tsx` (108 LOC — Tier 2 <= 500 LOC): Bổ sung nút "⚡ CÂN ĐỐI TỰ ĐỘNG (CỨU NGUY NHANH)" với kích thước `min-h-[44px]`, bóng xúc giác 3D, bảo toàn 100% markup và text của 2 nút cũ để bảo vệ các contract tests hồi quy.
  * `src/client/ui/modals/modal_host.tsx` (454 LOC — Tier 2 <= 500 LOC): Truyền `onAutoSolvency` phát intent `INTENT_AUTO_SOLVENCY` thông suốt từ cả 2 modal.
  * `src/client/network/use_app_session.ts` (272 LOC — Tier 1 <= 400 LOC): Bổ sung cơ chế auto-close modal `insolvency` khi nhận delta cập nhật số dư $\ge 0$.
- **Kiểm thử & Bất biến**:
  * `tests/contracts/imp210_auto_solvency_intent.test.ts`: 16/16 atomic contract tests PASS 100% (5 facets).
  * `npx tsc --noEmit`: 0 lỗi. `npm run lint:ui`: 0 vi phạm (197 files scanned).
  * Evidence Snapshot: `.agents/evidence/imp210_snapshot.json` (`executed: true`).
- **Phê chuẩn**: `plan-griller` (P1-P5 REVISED & APPROVED), `qa-tester` (Station 1 RED), `implementer` (Station 2 GREEN), `scout` (Station 2.5 PASS), `spec-reviewer` (SPEC_PASS APPROVED), `ui-craft-reviewer` (APPROVE).
- **Trạng thái**: ✅ Hoàn thành IMP-210 (2026-09-28).

### [IMP-216] Minh Bạch Hóa Công Thức Biến Động Tài Chính & Mở Rộng Badge Mobile Full-Width
- **Mục tiêu**: Xóa bỏ hoàn toàn giới hạn co cụm 1/2 màn hình mobile của thẻ thông báo tài chính (`FloatingBadge` & `FloatingNumbersOverlay`), mở rộng ra gần trọn bề ngang màn hình (`w-[calc(100vw-1.5rem)]` căn giữa trục màn hình); tái cấu trúc thẻ thành 3 tầng phân cấp thị giác chuẩn công thái học (Header + Dòng 1 Công thức súc tích dưới 50 ký tự + Dòng 2 Dòng tiền tự nhiên); đồng thời khóa chặt tính nhất quán với SSOT Domain Constants (`MIN_BAIL_AMOUNT`, `TELECOM_DATA_FEE`, `GO_PROPERTY_TAX_CAP`), chống rò rỉ dữ liệu hoặc sai lệch khi cập nhật luật tính tiền trong tương lai.
- **Hạ tầng hoàn tất**:
  * `src/domain/property_rent.ts` (186 LOC — Tier 1 <= 400 LOC): Xuất khẩu các hằng số SSOT tập trung `TELECOM_DATA_FEE = 150`, `MIN_BAIL_AMOUNT = 500`, `BAIL_NET_WORTH_RATIO = 0.10`.
  * `src/server/special_cell_handler.ts` (72 LOC — Tier 1 <= 400 LOC): Nhập `TELECOM_DATA_FEE` từ domain SSOT, xóa bỏ khai báo trùng lặp.
  * `src/server/audit_manager.ts` (150 LOC — Tier 1 <= 400 LOC): Sử dụng `MIN_BAIL_AMOUNT` và `BAIL_NET_WORTH_RATIO` từ domain SSOT.
  * `src/client/store/game_store_types.ts` (380 LOC — Tier 1 <= 400 LOC): Bổ sung `readonly formula?: string;` vào `FloatingTextItem`.
  * `src/client/store/game_store.ts` (387 LOC — Tier 1 <= 400 LOC): Vá lỗ hổng lifecycle trong `addFloatingText`, bảo toàn trường `formula` vào store.
  * `src/client/ui/transaction_formula.ts` (76 LOC — Tier 2 <= 500 LOC): Submodule độc lập phân giải công thức rõ nghĩa, súc tích từ domain SSOT cho các tình huống (Bảo lãnh tự nguyện vs Cưỡng chế 3 lượt vs Đổ đôi; Điện EVN qua GO; Cước Viettel; Thuế đất đai ô 4; Thuế tài sản vượt GO; Thuê x2 độc quyền; Thẻ Ngoại Giao đối xứng 2 chiều; Vay và Chuộc thế chấp).
  * `src/client/ui/transaction_narrative.ts` (260 LOC — Tier 2 <= 280 LOC): Tích hợp trường `formula` vào `TransactionNarrative`, giữ nguyên ngân sách LOC dưới trần của hợp đồng `TC-194.18`.
  * `src/client/ui/floating_numbers.tsx` (290 LOC — Tier 2 <= 500 LOC): Mở rộng container mobile sang `w-[calc(100vw-1.5rem)] max-w-sm sm:max-w-md` căn giữa `left-1/2 -translate-x-1/2`; cấu trúc `FloatingBadge` thành 3 tầng rõ rệt: Tầng 1 Header + Tầng 2 Dòng 1 (`data-testid="transaction-formula-line"`) + Tầng 3 Dòng 2 (`data-testid="transaction-flow-line"`).
  * `src/client/network/activity_financial_tracker.ts` (314 LOC — Tier 1 <= 400 LOC): Bóc tách bảo lãnh kiểm toán (không so sánh cứng 500, phân biệt bảo lãnh sớm vs cưỡng chế dựa trên số lượt còn lại).
  * `src/client/network/activity_badge_dispatcher.ts` (243 LOC — Tier 1 <= 400 LOC): Truyền `formula` qua `addFloatingText`, sửa lỗi tính bước modular distance khi vượt GO.
- **Kiểm thử & Bất biến**:
  * `tests/contracts/imp216_financial_notification_formula_and_badge.test.ts`: 16/16 atomic contract tests PASS 100% (5 facets).
  * Toàn bộ 9 suites liên quan (189 tests): PASS 100%.
  * `npx tsc --noEmit`: 0 lỗi. `npm run lint:ui`: 0 vi phạm (197 files scanned).
  * Evidence Snapshot: `.agents/evidence/imp216_snapshot.json` (`executed: true`).
- **Phê chuẩn**: `plan-griller` (P1-P5 REVISED & APPROVED), `qa-tester` (Station 1 RED), `implementer` (Station 2 GREEN), `scout` (Station 2.5 PASS), `spec-reviewer` (SPEC_PASS APPROVED), `code-reviewer` (CODE_PASS APPROVED), `ui-craft-reviewer` (VERDICT SHIP APPROVED).
- **Trạng thái**: ✅ Hoàn thành IMP-216 (2026-09-28).

### [IMP-215 (Phần 2)] Chiến Dịch Gia Cố & Tối Ưu Hóa UI/UX Đa Nền Tảng & Trình Duyệt (Cross-Platform UI/UX & Browser Hardening)
- **Mục tiêu**: Giải quyết triệt để 8 khuyết tật phát hiện trong Báo Cáo Kiểm Toán Đa Nền Tảng (DEF-01 đến DEF-08) và các phát hiện tối ưu từ Station 2.5 Scout, bảo đảm độ ổn định và hiển thị hoàn hảo trên Desktop (1920x1080, 1366x768, 1280x720) và Mobile (360px, 390px, 414px) cùng 4 trình duyệt chính (Chrome, Edge, Firefox, Safari iOS).
- **Hạ tầng hoàn tất**:
  * `src/client/ui/lobby/welcome_hub_modal.tsx` (169 LOC — Tier 2 <= 500 LOC): Nâng cấp font input mã phòng lên `text-base sm:text-sm` chống auto-zoom lệch tâm sa bàn 3D trên Safari iOS; loại bỏ triệt để đột biến props `(props as any).children = rendered`.
  * `src/client/ui/modals/trade/trade_column.tsx` (246 LOC — Tier 2 <= 500 LOC): Nâng cấp input số tiền đàm phán lên `text-base sm:text-xs` chống auto-zoom trên mobile.
  * `src/client/ui/modals/masterplan_modal.tsx` (274 LOC — Tier 2 <= 500 LOC): Chuyển đổi sang `h-[88dvh] max-h-[92dvh] min-h-0 sm:min-h-[480px]` chống tràn đáy trên mobile và thích ứng dynamic address bar của iOS Safari; bổ sung fallback key `key={p?.id ?? p?.name}` chống React key warning.
  * `src/client/ui/activity_feed_sidebar.tsx` (332 LOC — Tier 2 <= 500 LOC): Giới hạn bề ngang drawer `w-[85vw] max-w-xs sm:w-80 md:w-96` và `h-[100dvh]`, luôn chừa tối thiểu 15vw vùng backdrop cho thao tác đóng 1 chạm trên mobile.
  * `src/client/ui/market_event_ticker.tsx` (263 LOC — Tier 2 <= 500 LOC): Loại bỏ class xung đột `truncate`, áp dụng `line-clamp-2 break-words` khôi phục ngắt 2 dòng tự nhiên cho thẻ tóm tắt tác động thị trường.
  * `src/client/ui/modals/auction_district_card.tsx` (223 LOC — Tier 2 <= 500 LOC): Loại bỏ `truncate`, áp dụng `line-clamp-2 break-words` cho tiêu đề ô đất.
  * `src/client/ui/modals/game_over_modal.tsx` (403 LOC — Tier 2 <= 500 LOC): Tinh chỉnh khoảng đệm ngang `p-3.5 sm:p-6` giải phóng 20px không gian hữu dụng trên mobile 360px; bảo toàn touch targets $\ge 44$px cho toàn bộ các tab FinTech.
  * `src/client/ui/modals/auction_modal.tsx` (442 LOC — Tier 2 <= 500 LOC): Chống cắt cụt subtitle giá sàn với `line-clamp-1 sm:whitespace-nowrap`; sửa lỗi falsy `minBid !== undefined` cho phép Auto-Bid đặt giá 0đ khi Bắt Đáy / Fire Sale; bổ sung fallback key `p.id || p.name`.
  * `src/client/index.css` (129 LOC — Tier 1 <= 400 LOC): Bổ sung thanh cuộn mảnh toàn cục trên Firefox (`scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent`) trong `@layer base`, bảo toàn hoàn hảo các utility classes ẩn thanh cuộn chuyên biệt.
  * `tests/client/impeccable_tactile_modals.test.ts` (204 LOC): Hòa giải 2 test suite cũ theo Specification Evolution: đồng bộ responsive bounds `max-w-md md:max-w-2xl lg:max-w-4xl` và bảo toàn 100% visual cue của disabled button (`cursor-not-allowed`, `shadow-none`, `text-slate-400`, `disabled=""`).
- **Kiểm thử & Bất biến**:
  * `tests/contracts/imp215_cross_platform_and_browser_hardening.test.ts`: 16/16 atomic contract tests PASS 100% (5 facets: Safari Auto-Zoom, Dynamic Viewport & Clamping, Typography & Multi-Line Clamping, Mobile Ergonomics & Scrollbar, Spec Evolution).
  * `tests/client/impeccable_tactile_modals.test.ts`: 11/11 tests PASS 100%.
  * `npx tsc --noEmit`: 0 lỗi. `npm run lint:ui`: 0 vi phạm (197 files scanned).
  * Evidence Snapshot: `.agents/evidence/imp215_cross_platform_and_browser_hardening_snapshot.json` (`executed: true`, 16 tests passed).
- **Phê chuẩn**: `plan-griller` (P1-P5 APPROVED), `qa-tester` (Station 1 RED), `implementer` (Station 2 GREEN), `scout` (Station 2.5 PASS), `spec-reviewer` (SPEC_PASS APPROVED), `code-reviewer` (CODE_PASS APPROVED), `ui-craft-reviewer` (UI_CRAFT APPROVED).
- **Trạng thái**: ✅ Hoàn thành IMP-215 (Cross-Platform UI/UX & Browser Hardening) (2026-09-28).

---

### [IMP-217] Trái Phiếu Doanh Nghiệp Theo Gói Tranches & Nối Dây Toàn Trọn Pipeline (Corporate Bond Tranches, Collateral Selection & Pipeline Wiring)
- **Mục tiêu**: Xóa bỏ rào cản bó cứng "Vay 80% Net Worth - All or Nothing" và vá vết đứt gãy kết nối (Wire Gap) khiến modal báo sai thiếu Net Worth; phân hóa thành 3 gói Tranches định sẵn (20% - 40% - 60% NW) với thuật toán tham lam tự động chọn các ô đất rẻ nhất làm tài sản bảo đảm, bảo toàn quyền thế chấp/P2P các ô đất đắt đỏ ngoài danh mục; bảo toàn dòng tiền Kho Bạc (`repayAmount - principal`), và hoàn thiện dây nối Intent từ Client UI qua WebSocket xuống FSM và Fire Sale Queue.
- **Hạ tầng hoàn tất**:
  * `src/domain/bond_types.ts` (57 LOC — Tier 1 <= 400 LOC): Định nghĩa enum `BondTrancheId`, interface `BondTrancheConfig` và cấu hình 3 gói `BOND_TRANCHES` (`WORKING_CAPITAL` 20% NW/2 vòng/lãi 8%, `EXPANSION` 40% NW/3 vòng/lãi 15%, `ALL_IN` 60% NW/3 vòng/lãi 20%); giữ nguyên hằng số legacy tương thích ngược.
  * `src/server/bond_manager.ts` (223 LOC — Tier 1 <= 400 LOC): Cài đặt thuật toán tham lam `priceA - priceB` gom ô đất rẻ nhất; bảo toàn Kho Bạc chỉ nhận đúng tiền lãi chênh lệch thực tế; đếm lùi `roundsLeft` mỗi vòng; vỡ nợ chỉ phát mãi ô trong `collateralCells`.
  * `src/server/intent_dispatcher.ts` (180 LOC — Tier 1 <= 400 LOC): Mở rộng `PlayerIntent` hỗ trợ `trancheId`, điều hướng `INTENT_ISSUE_BOND` và `INTENT_REPAY_BOND`, chặn gọi ngoài pha khi đang ở `InsolvencyPhase`.
  * `src/server/room_manager.ts` (379 LOC — Tier 1 <= 400 LOC): Phương thức Facade ủy thác context session xuống `bond_manager`.
  * `src/client/ui/modals/modal_host.tsx` (473 LOC — Tier 2 <= 500 LOC): Tính toán `playerNetWorth` thực tế và đếm `unmortgagedPropertiesCount` truyền xuống modal; nối dây 2 intent callback `onIssueBond` và `onRepayBond`.
  * `src/client/ui/modals/property_portfolio_modal.tsx` (471 LOC — Tier 2 <= 500 LOC): Luân chuyển props toàn vẹn xuống Tab Trái Phiếu; áp dụng `React.useState` chuẩn cơ chế bẫy unit test.
  * `src/client/ui/modals/bond_issuance_tab.tsx` (159 LOC — Tier 2 <= 500 LOC): Tái cấu trúc 3 thẻ Tranches dọc trên mobile 360px (`grid-cols-1 gap-2.5`), 3 cột trên desktop (`sm:grid-cols-3`); touch target $\ge 46$px; nhãn nút thích ứng chuẩn `TC-208.15` và `TC-217.16`.
- **Kiểm thử & Bất biến**:
  * `tests/contracts/imp217_corporate_bond_tranches_and_pipeline.test.ts`: 18/18 atomic contract tests PASS 100% (5 facets: Cấu hình 3 gói, Thuật toán chọn TSĐB rẻ nhất, Bảo toàn Kho Bạc & Vỡ nợ, Dây nối Pipeline, Công thái học UI Mobile 360px).
  * Bảo toàn 100% các suite hồi quy liên quan: `imp192c` (22 tests), `imp212` (16 tests), `imp216` (16 tests), `imp208` (21 tests).
  * `npx tsc --noEmit`: 0 lỗi. `npm run lint:ui`: 0 vi phạm (198 files scanned).
  * Evidence Snapshot: `.agents/evidence/imp217_snapshot.json` (`executed: true`, 18 tests passed, 0 typecheck errors).
- **Tech Debt**: Ghi nhận `DEBT-IMP217-01` (Hàm `validateIssueBond` tại `src/server/bond_manager.ts:26` đạt 74 SLOC, vượt ngưỡng cảnh báo 50 SLOC của `lint:slop` do tích hợp cả 3 gói và thuật toán gom đất; đề xuất tách `_resolveCollateral()` và `_validateTrancheEligibility()` ở slice sau).
- **Phê chuẩn**: `plan-griller` (P1-P5 APPROVED), `qa-tester` (Station 1 RED), `implementer` (Station 2 GREEN), `scout` (Station 2.5 PASS & Remediation), `spec-reviewer` (SPEC_PASS APPROVED), `code-reviewer` (CODE_PASS APPROVED), `ui-craft-reviewer` (UI_CRAFT APPROVED).
- **Trạng thái**: ✅ Hoàn thành IMP-217 (2026-09-28).

---

### [IMP-219] Minh Bạch Hóa Thông Báo Thao Tác Của Bot & Tối Ưu Nhịp Độ Bàn Cờ (Bot Action Pacing & Visual Feedback Hardening)
- **Mục tiêu**: Khắc phục hiện tượng Bot đi quá nhanh làm người chơi khó theo dõi sa bàn 3D và thiếu thông báo pop-up nổi: bổ sung nhịp thở quan sát 1500ms sau khi Bot nâng cấp nhà; phân định rạch ròi giao dịch P2P sinh thẻ nổi song phương (Reward/Penalty) và triệt tiêu lỗi Ghost Rent; bổ sung phản hồi thị giác sàn HOSE với khóa chống trùng lặp badge; phát sinh thông báo khi Bot từ chối mua đất kích hoạt đấu giá (loại trừ các trường hợp phát mãi nợ); và tinh chỉnh câu văn tự nhiên chuẩn Impeccable không vấp ngữ.
- **Hạ tầng hoàn tất**:
  * `src/client/store/game_store_types.ts` (383 LOC — Tier 1 <= 400 LOC): Mở rộng `FloatingActionType` hỗ trợ `'trade' | 'decline_auction'`.
  * `src/client/store/activity_store.ts` (140 LOC — Tier 1 <= 400 LOC): Mở rộng `ActivityLogType` hỗ trợ `'trade' | 'hose'`.
  * `src/client/network/activity_property_tracker.ts` (252 LOC — Tier 1 <= 400 LOC): Cập nhật `detectCellTrade` phân định `trade` (khi có `prevOwnerId` và `winningBid === undefined`), gán `targetPlayerId`, `targetPlayerName`; bảo lưu `type: 'buy'` cho trúng đấu giá theo SSOT `TC-54.18`; `processCellOwnerDiff` tính `prevOwnerName`.
  * `src/client/network/activity_financial_tracker.ts` (337 LOC — Tier 1 <= 400 LOC): Bổ sung `lastProcessedHoseKey` và `resetHoseActivityTracker()`; đưa `buyerId` và `prevOwnerId` từ `boughtCellIndices` vào `handledPayerIds`/`handledReceiverIds` trước `matchRentTransactions` triệt tiêu lỗi Ghost Rent; cập nhật HOSE sang `type: 'hose'`.
  * `src/client/network/activity_tracker.ts` (354 LOC — Tier 1 <= 400 LOC): Bắt sự kiện Bot bỏ mua đất trong `detectAuctionActivities` (loại trừ `!isForeclosure && !insolvencyPlayerId`); xuất khẩu `resetHoseActivityTracker`.
  * `src/client/network/activity_badge_dispatcher.ts` (276 LOC — Cứng <= 300 LOC `TC-193.16`): Thêm `handleTradeBadge` (phát FloatingBadge song phương cho bên mua và bên bán), `handleHoseBadge` (phát thẻ lãi/lỗ kèm icon); cập nhật `handleAuctionBadge` hỗ trợ `decline_auction`; đăng ký vào `BADGE_HANDLERS` và luân chuyển delta.
  * `src/client/ui/transaction_narrative.ts` (268 LOC — Cứng <= 280 LOC `TC-194.18`): Thêm icon, formatters, compact inline cases; loại bỏ lặp từ cellName tạo câu tự nhiên ("Bạn nhận [Phố Huế] từ Bot 1" / "Bot 1 nhượng [Phố Huế] cho Bạn" / "Bot 1 bỏ qua [Phố Huế] để mở đấu giá").
  * `src/server/network/turn_orchestrator.ts` (358 LOC — Tier 1 <= 400 LOC): Xuất khẩu `BOT_UPGRADE_OBSERVATION_DELAY_MS = 1500`; quản lý Map `botJustUpgraded` bảo toàn qua `clearRoom()` và chỉ xóa khi tiêu thụ trong `scheduleBotStep` hoặc giải phóng rò rỉ tại `destroyRoom`, khi chuyển sang lượt người chơi thật và khi `onGameOver`.
- **Kiểm thử & Bất biến**:
  * `tests/contracts/imp219_bot_action_pacing_and_visual_feedback.test.ts`: 16/16 atomic contract tests PASS 100% (5 facets: Giao dịch P2P song phương, Phản hồi thị giác HOSE & Khử trùng lặp, Bot bỏ qua đất mở đấu giá, Nhịp thở quan sát nâng cấp 1500ms, Khử Ghost Rent & Dispatcher Parity).
  * Bảo toàn 100% các suite hồi quy: `imp193` (18 tests), `imp194` (20 tests), `imp208` (21 tests), `imp216` (16 tests), `imp217` (18 tests), `telemetry_watchdog` (24 tests), `imp205` (19 tests), `imp215` (17 tests).
  * `npx tsc --noEmit`: 0 lỗi. `npm run lint:ui`: 0 vi phạm (201 files scanned).
  * Evidence Snapshot: `.agents/evidence/imp219_bot_pacing_and_visual_feedback_snapshot.json` (`executed: true`, 8 physical files, 0 typecheck errors).
- **Phê chuẩn**: `plan-griller` (P1-P5 HARDENED_APPROVED), `qa-tester` (Station 1 RED), `implementer` (Station 2 GREEN), `scout` (Station 2.5 Sweeping Audit & Remediation), `code-reviewer` (Station 3 ACCEPTANCE APPROVED), `spec-reviewer` (Station 3 SPEC APPROVED), `re-reviewer` (Station 3 FIX ROUND ALL ADDRESSED APPROVED).
- **Trạng thái**: ✅ Hoàn thành IMP-219 (2026-09-29).

---

### [IMP-220] Tropical Island Water Shader & Atmospheric Lighting Lerp (Bước 2)
- **Mục tiêu**: Nâng cấp đồ họa mặt biển sa bàn 3D nhiệt đới: Water Shader GLSL tích hợp phản xạ góc nhìn Fresnel Schlick, Gradient hấp thụ độ sâu (Depth Absorption) từ xanh ngọc bích ven bờ sang xanh thẳm đại dương, 3 sóng Gerstner GPU nhấp nhô hữu cơ, phản xạ lấp lánh Specular Glint theo mặt trời; cấu trúc phân tầng Depth Stack 5 tầng cao độ Y triệt tiêu 100% Z-fighting; thích ứng màu nước theo 3 pha ánh sáng Day/Sunset/Night với nội suy mượt mà Zero-Alloc Three.js Color.lerp trong frame loop.
- **Hạ tầng hoàn tất**:
  * `src/client/store/environment_store.ts` (145 LOC — Tier 1 <= 400 LOC): Bổ sung `waterShallowColor`, `waterDeepColor`, `waterFoamColor` vào `LightingPreset` và `TIME_OF_DAY_PRESETS`.
  * `src/client/3d/shaders/tropical_water_material.ts` (117 LOC — Tier 2 <= 500 LOC): Xuất khẩu `createTropicalWaterUniforms`, `calculateFresnelFactor`, `calculateWaterWaveOffset`, `calculateDepthBlend`, `lerpWaterColor`, GLSL Vertex & Fragment Shaders.
  * `src/client/3d/tropical_water.tsx` (99 LOC — Tier 2 <= 500 LOC): Component mặt biển GPU Shader, tự động giải phóng tài nguyên Three.js khi unmount, nội suy uniforms Zero-Alloc.
  * `src/client/3d/coastal_island_environment.tsx` (228 LOC — Tier 2 <= 500 LOC): Thiết lập Depth Stack 5 tầng (-0.420 Abyss Box, -0.310 Mid Ocean, -0.300 TropicalWater Shader, -0.298 Shallow Jade, -0.292 Macro Foam).
- **Kiểm thử & Bất biến**:
  * `tests/client/tropical_water_and_lighting.test.ts`: 16/16 atomic tests PASS 100% (Universal 5-Facet Matrix).
  * Bảo toàn 100% tests di sản: `coastal_island_environment` (11 tests), `imp107_streamlined_tabletop_diorama` (17 tests), `imp39_visual_crispness_and_lighting` (12 tests).
  * Domain Invariant: Gotcha #13 (5-Layer Ocean Depth Stack & Zero-Alloc Shader Uniforms).
  * Evidence Snapshot: `.agents/evidence/imp220_execution.json` (`executed: true`).
- **Phê chuẩn**: `spec-reviewer` (APPROVED), `game-3d-visual-critic` (APPROVED 8.8/10, disposition: ship).
- **Trạng thái**: ✅ Hoàn thành IMP-220 (2026-09-29).

---

### [IMP-221] Living Diorama Dynamics: Harbor Watercraft, Perching Birds & Lighthouse Sweep (Bước 3)
- **Mục tiêu**: Thổi hồn vào sa bàn đảo ngọc lấy cảm hứng từ "Virtual Yosemite Photo Tour" (Trond Wuellner): Cặp du thuyền bến cảng nhấp nhô pitch & roll lệch pha $\Delta\phi = 1.6$ rad, thuyền gỗ bến Bạch Đằng lướt ven vịnh kéo vệt bọt rẽ sóng chữ V co giãn, đàn hải âu mini đậu cọc bến tàu với micro-FSM 4 trạng thái cất cánh/hạ cánh mượt mà tính liên tục $C^1$ chống giật hình giữa không trung, ngọn hải đăng quét chùm sáng $360^\circ$ huyền ảo vào ban đêm đặt đúng cao độ thấu kính Fresnel $y=0.72$, tối ưu Zero React re-render 60 FPS qua `useRef` và Zero `castShadow` bảo vệ GPU mobile.
- **Hạ tầng hoàn tất**:
  * `src/client/3d/diorama/diorama_perching_birds.tsx` (263 LOC — Tier 2 <= 500 LOC): Micro-FSM đàn chim đậu cọc (`PERCHED` -> `TAKE_OFF` -> `CIRCLING` -> `LANDING`), `landingFromRef` + `calculateCirclingExitPosition` khử giật hình đứt gãy, Zero React re-render 60 FPS (`useRef`), Zero `castShadow`.
  * `src/client/3d/diorama/diorama_harbor_cruiser.tsx` (67 LOC — Tier 2 <= 500 LOC): Thuyền tuần du bám tiếp tuyến quỹ đạo elip ven vịnh đảo, vệt bọt nước rẽ sóng chữ V co giãn điều hòa $\pm 12\%$, Zero `castShadow`.
  * `src/client/3d/diorama/diorama_marina.tsx` (193 LOC — Tier 2 <= 500 LOC): Cặp du thuyền bập bềnh lệch pha $1.6$ rad, cụm đèn hải đăng đặt tại tâm thấu kính Fresnel $y=0.72$ xoay quét $360^\circ$ thích ứng ban đêm/hoàng hôn, âm thanh còi tàu có `e.stopPropagation()`.
- **Kiểm thử & Bất biến**:
  * `tests/client/living_diorama_dynamics.test.ts`: 16/16 atomic contract tests PASS 100% (Universal 5-Facet Matrix).
  * Bảo toàn 100% tests di sản: `miniature_city_diorama` (11 tests), `imp107_streamlined_tabletop_diorama` (17 tests).
  * Domain Invariant: Gotcha Invariant 14 (`Living Diorama Micro-FSM & 3D Spatial Continuity`).
  * Evidence Snapshot: `.agents/evidence/imp221_execution.json` (`executed: true`).
- **Phê chuẩn**: `plan-griller` (REVISE_REQUIRED -> v3 HARDENED), `qa-tester` (Station 1 RED 15/16), `implementer` (Station 2 GREEN 16/16), `scout` (Station 2.5 PASS 100%), `spec-reviewer` (Station 3 APPROVED), `game-3d-visual-critic` (Station 3 APPROVED 9.2/10, disposition: ship).
- **Trạng thái**: ✅ Hoàn thành IMP-221 (2026-09-29).

---

### [IMP-222] Atmospheric Immersion & Living Tropical Breeze (Bước 4)
- **Mục tiêu**: Nâng tầm trải nghiệm điện ảnh và sức sống tự nhiên cho sa bàn 3D đảo ngọc nhiệt đới bằng 3 kỹ thuật đồ họa bổ trợ:
  1. Auto-lerp `toneMappingExposure`: Giả lập cơ chế điều tiết võng mạc mắt người (Pupil Dilation / Exposure Adaptation) khi chuyển giao mượt mà giữa Day (1.00), Sunset (1.06), Night (1.14) và Auction (0.94) qua hàm thuần túy `lerpExposure` có guard an toàn `Number.isFinite`.
  2. Sương Mù Kịch Nghệ Đấu Giá & Đồng Bộ Nền Trời (Theatrical Spotlight Fog & Horizon Sky): Khi đấu giá (`isAuctionActive = true`), sương mù thu hẹp từ (45m, 180m) về (18m, 55m) và đồng bộ cả `scene.fog` lẫn `scene.background` cùng lerp sang sắc tím than `#0F172A`, triệt tiêu 100% lỗi đứt gãy chân trời (Horizon Cutout Discontinuity).
  3. Tán Dừa Đung Đưa Trong Gió Biển (Living Tropical Breeze on Palm Canopies): Vành đai 32 cây dừa (`LayeredTropicalFoliage`) đung đưa theo sóng gió biển Lissajous hai trục `swayZ, swayX` với phân tầng giảm chấn `PALM_TIER_SWAY_FACTORS = { 1: 0.6, 2: 0.8, 3: 1.0 }`, giữ thân dừa cố định cắm đất, bảo toàn 100% `useEffect` khởi tạo và 4 lệnh `computeBoundingSphere`, tối ưu 4 Draw Calls qua GPU `InstancedMesh` và Zero-GC churn.
- **Hạ tầng hoàn tất**:
  * `src/client/3d/time_of_day_lighting.tsx` (290 LOC — Tier 2 <= 500 LOC): Xuất khẩu `calculateTargetExposure`, `lerpExposure`, `calculateFogTargets`, tự động lerp `gl.toneMappingExposure`, `scene.fog` và `scene.background`.
  * `src/client/3d/layered_tropical_foliage.tsx` (220 LOC — Tier 2 <= 500 LOC): Xuất khẩu `PALM_TIER_SWAY_FACTORS`, `calculatePalmSwayAngles`, bảo toàn `useEffect` và 4 lệnh `computeBoundingSphere`, thêm `useSafeFrame` đung đưa 3 tầng tán lá trên 32 cây dừa.
- **Kiểm thử & Bất biến**:
  * `tests/client/atmospheric_immersion_and_breeze.test.ts`: 16/16 atomic contract tests PASS 100% (Universal 5-Facet Matrix & Detroit Style).
  * Bảo toàn 100% tests di sản: `layered_tropical_foliage` (5 tests), `imp196_golden_sunset_and_neon_night_lighting` (18 tests), `tropical_water_and_lighting` (16 tests) -> Tổng 55/55 tests PASS.
  * Domain Invariant: Gotcha Invariant 15 (`Atmospheric Exposure Adaptation & Instanced Canopy Wind Sway`).
  * Evidence Snapshot: `.agents/evidence/imp222_execution.json` (`executed: true`).
- **Trạng thái**: ✅ Hoàn thành IMP-222 (2026-09-29).

---

### [IMP-223] Auction Theatrical FX: Bid Flash, Champagne Bloom & Focus Vignette
- **Mục tiêu**: Đưa cảm xúc và tính kịch nghệ của sàn đấu giá BĐS lên đỉnh điểm thông qua bộ 3 hiệu ứng ánh sáng và quang học phản hồi đa tầng (Multimodal Theatrical Feedback):
  1. Bid Flash Reaction Lighting: Mỗi khi mức giá thầu tăng (`currentBid > prevBid`), bùng nổ xung ánh sáng chớp rực trực tiếp trên hệ thống đèn sa bàn 3D (`TimeOfDayLighting`) với phân rã bậc hai $(1 - t/0.35)^2$, đồng bộ chính xác từng mili-giây với tiếng búa gõ đanh thép `AudioEngine.playSfx(SoundEffect.AUCTION_BID)`.
  2. Hào Quang Vàng Kim Phân Tầng (Champagne Bloom Tuning): Khi `isAuctionActive = true`, hạ `bloomThreshold` từ `2.5` xuống `1.2` (trên Desktop PostProcessingPipeline), làm cho các chi tiết kim loại vàng champagne, búa gõ và đèn spotlight tỏa quầng sáng huyền ảo lộng lẫy giữa bóng tối rạp hát.
  3. Tối Góc Tập Trung Thị Giác (Contextual Focus Vignette - 2 Tầng Song Phương): Tăng độ tối viền quang học `vignetteDarkness` từ `0.15` lên `0.35` (WebGL Desktop) kết hợp lớp phủ chuyển tiếp opacity 2 lớp tách biệt trong `CinematicOverlay` (2D DOM Mobile), loại bỏ 100% giật khựng CSS gradient và tập trung tuyệt đối ánh mắt người chơi vào sàn đấu giá.
- **Hạ tầng hoàn tất**:
  * `src/client/3d/time_of_day_lighting.tsx` (323 LOC — Tier 2 <= 500 LOC): Xuất khẩu `calculateBidFlashIntensity`, đọc trực tiếp `s.auction?.currentBid` (Zero Dirty Cast C1), kích hoạt xung flash $t=0$ khi giá thầu tăng và cộng hưởng ánh sáng trong render loop 60 FPS.
  * `src/client/3d/post_processing_pipeline.tsx` (200 LOC — Tier 2 <= 500 LOC): Xuất khẩu `calculateDynamicBloomThreshold` và `calculateDynamicVignetteDarkness`, khắc phục ES6 default param shadowing (P1).
  * `src/client/3d/cinematic_effects.tsx` (135 LOC — Tier 2 <= 500 LOC): Dual-layer 2D Vignette CSS opacity cross-fade (Cyan tiêu chuẩn vs Midnight Slate `#0F172A`).
  * `src/client/game_canvas.tsx` (452 LOC — Tier 2 <= 500 LOC): Truyền `isAuctionActive` vào nhánh inGame (L437); nhánh preMatch (L424) giữ nguyên; bảo toàn 100% comment `{/* <PostProcessingPipeline /> */}` ở cả 2 nhánh (C2).
- **Kiểm thử & Bất biến**:
  * `tests/client/auction_theatrical_fx.test.ts`: 16/16 atomic contract tests PASS 100% (Universal 5-Facet Matrix & Detroit Style).
  * Bảo toàn 100% tests di sản: `post_processing_pipeline` (9 tests), `cinematic_effects` (5 tests), `time_of_day` (11 tests), `atmospheric_immersion_and_breeze` (16 tests) -> Tổng 57/57 tests PASS.
  * Domain Invariant: Gotcha Invariant 16 (`Auction Theatrical FX & Dual-Layer Vignette Optical Tunneling`).
  * Evidence Snapshot: `.agents/evidence/imp223_execution.json` (`executed: true`).
- **Phê chuẩn**: `plan-griller` (P1-P5 HARDENED v3 APPROVED), `qa-tester` (Station 1 RED 15/16), `implementer` (Station 2 GREEN 16/16), `scout` (Station 2.5 PASS 100%), `spec-reviewer` (Station 3 APPROVED), `game-3d-visual-critic` (Station 3 APPROVED 9.5/10, disposition: ship).
- **Trạng thái**: ✅ Hoàn thành IMP-223 (2026-09-29).

---

### [IMP-220] Corporate Bond Issuance in InsolvencyPhase & Auto-Solvency Transition
- **Mục tiêu**: Tái cơ cấu nợ khẩn cấp bằng Trái phiếu Doanh nghiệp trong giai đoạn nguy cấp (`TurnPhase.InsolvencyPhase`), giải quyết triệt để vấn đề người chơi có tài sản ròng lớn nhưng âm tiền mặt bị kẹt không thể tự động cân đối hay phát hành trái phiếu; đồng thời tái đóng gói server bundle và giải quyết lỗi hồi quy touch target TC-212.14.
- **Hạ tầng hoàn tất**:
  * `src/domain/action_reasons.ts` (44 LOC — Tier 1 <= 400 LOC): Bổ sung hằng số `CANNOT_RECOVER: 'CANNOT_RECOVER'` vào `ActionRejectReason`.
  * `src/server/intent_dispatcher.ts` (185 LOC — Tier 1 <= 400 LOC): Cho phép `INTENT_ISSUE_BOND` trong `InsolvencyPhase`, xóa bỏ magic string `'CANNOT_RECOVER'`, bổ sung chốt bảo vệ bản quyền lượt (Off-Turn Hijack Guard) từ chối `NOT_YOUR_TURN` nếu người chơi ngoài lượt can thiệp.
  * `src/server/bond_manager.ts` (232 LOC — Tier 1 <= 400 LOC): Tự động chuyển pha FSM từ `InsolvencyPhase` sang `PropertyManagement` khi tiền vay từ trái phiếu giúp `balance >= 0` cho người chơi hiện tại; duy trì `InsolvencyPhase` nếu thâm hụt vẫn còn (`balance < 0`).
  * `src/client/ui/actionable_notification.ts` (356 LOC — Tier 2 <= 500 LOC): Bổ sung 4 ánh xạ mã lỗi chi tiết `BOND_NOT_ELIGIBLE`, `CANNOT_RECOVER`, `BOND_COLLATERAL_LOCKED`, `ASSET_LOCKED`.
  * `src/client/ui/modals/bond_issuance_tab.tsx` (178 LOC — Tier 2 <= 500 LOC): Nâng sàn chạm 3 thẻ tranche lên `min-h-[46px]` (giải quyết triệt để TC-212.14), hiển thị huy hiệu tái cơ cấu nợ `bond-insolvency-restructuring-badge`, đổi nhãn nút phát hành sang `CỨU NGUY TÀI CHÍNH` khi `isInInsolvency = true`.
  * `src/client/ui/modals/property_portfolio_modal.tsx` (471 LOC — Tier 2 <= 480 LOC): Truyền cờ `isInInsolvency={isNegative}` trên cùng dòng prop (0-delta seam).
  * `src/client/ui/modals/insolvency_banner.tsx` (108 LOC — Tier 2 <= 500 LOC): Cập nhật văn bản hướng dẫn bao gồm phương án phát hành trái phiếu doanh nghiệp.
  * `dist/server/index.js`: Tái đóng gói thành công (`npm run build`), đồng bộ đầy đủ các intent mới.
- **Kiểm thử & Bất biến**:
  * `tests/contracts/imp220_insolvency_bond_and_auto_solvency_sync.test.ts`: 18/18 atomic contract tests PASS 100% (Universal 5-Facet Matrix).
  * `tests/contracts/imp212_portfolio_bond_and_trade_clean_affordance.test.ts`: 16/16 atomic contract tests PASS 100% (TC-212.14 resolved).
  * Adversarial Inversion: Station 1 RED (16 failed / 2 passed) -> Station 2 GREEN (18/18 passed).
  * Typecheck: `tsc` 0 lỗi. UI Linter: `npm run lint:ui` 0 violations (203 files scanned).
  * Domain Invariant: Gotcha Pillar I Invariant 6 (`Corporate Bond Restructuring & Insolvency FSM Solvency Auto-Transition`).
  * Evidence Snapshot: `.agents/evidence/imp220_snapshot.json` (`executed: true`).
- **Phê chuẩn**: `plan-griller` (P1-P5 Stress-Test), `qa-tester` (Station 1 RED), `implementer` (Station 2 GREEN), `scout` (Station 2.5 PASS), `spec-reviewer` (Station 3 APPROVED), `ui-craft-reviewer` (Station 3 APPROVED).
- **Tech Debt**: Ghi nhận `DEBT-IMP220-01` (Chuẩn hóa magic string `'INVALID_PHASE'` tại `intent_dispatcher.ts` L143 & L157 sang `ActionRejectReason.INVALID_PHASE` trong đợt refactor toàn bộ dispatcher).
- **Trạng thái**: ✅ Hoàn thành IMP-220 (2026-09-29).

---

### [IMP-224] Dynamic Depth of Field: Tilt-Shift Macro Điện Ảnh Theo Camera State
- **Mục tiêu**: Kích hoạt hiệu ứng Depth of Field (DoF) có điều kiện theo trạng thái camera — bảo toàn 100% độ rõ nét 40 ô cờ ở góc nhìn tổng quan (Gotcha #54), mang lại cảm xúc thị giác sa bàn đồ chơi thủ công cao cấp kiểu Townscaper khi soi ô đất/xem sổ đỏ, và không gian điện ảnh cao trào Sotheby's khi đấu giá BĐS.
  1. Overview & Motion Gate (`off`): Khi gieo xúc xắc (`isRolling = true`) hoặc quân cờ nhảy (`isPawnAnimating = true`), DoF ngắt tức thì (`enableDof: false`, `bokehScale: 0.0`, `focusRange: 320.0m`). Khi ở chế độ tổng quan bàn cờ không modal/focus, DoF tắt 100% để giữ nét căng 40 ô cờ và biểu giá niêm yết (bảo toàn Gotcha #54).
  2. Tile Focus & Dynamic Focal Target (`tile`): Khi xem thẻ cờ (`activeModal`) hoặc khảo sát ô đất (`cameraFocusCell`), kích hoạt DoF nhẹ (`bokehScale: 0.28`, `focusRange: 9.0m`), tiêu cự quang học bám đúng tọa độ ô cờ `cellPosition(targetCell)` thay vì khóa cứng tâm bàn cờ [0, 0, 0] gây lệch mặt phẳng nét 7.63m.
  3. Auction Theatrical Focus (`auction`): Khi mở sàn đấu giá (`activeModal === 'auction'`), áp dụng chuẩn Sotheby's (`bokehScale: 0.45`, `focusRange: 6.0m`), focal target khóa bục đấu giá trung tâm `[0, 3.0, 0]` (`CAMERA_CONFIG.auction_focus.target`), cộng hưởng với Champagne Bloom (threshold 1.2) và Focus Vignette (darkness 0.35) từ IMP-223.
  4. GameOver Guard: Khi trận đấu kết thúc (`activeModal === 'game_over'`), cưỡng chế tắt DoF (`DOF_PROFILES.off`) và đưa target về `[0, 0, 0]`, triệt tiêu hoàn toàn rò rỉ làm mờ bảng vàng vinh danh.
- **Hạ tầng hoàn tất**:
  * `src/client/3d/post_processing_pipeline.tsx` (295 LOC — Tier 2 <= 500 LOC): Xuất khẩu `calculateDofConfig`, `resolveDofTarget`, `DOF_PROFILES`, `DofConfigParams`, `DofConfig`, `DofTargetParams`; destructure `dofBokehScale: propDofBokehScale`, memoize `targetVector` an toàn qua dispatcher guard; tuân thủ nghiêm ngặt Rules of Hooks.
  * `src/client/game_canvas.tsx` (473 LOC — Tier 2 <= 500 LOC): Kết nối selectors Zustand (`isRolling`, `activePawnAnimation`, `cameraFocusCell`, `modalPayload`, `activeModal`) tính toán `dofConfig` & `dofTarget` và truyền vào `<PostProcessingPipeline />` nhánh inGame; bảo toàn 100% `isAuctionActive` và comment kiểm thử `{/* <PostProcessingPipeline /> */}` ở cả 2 nhánh.
- **Kiểm thử & Bất biến**:
  * `tests/client/dynamic_dof.test.ts` (201 LOC): 16/16 atomic contract tests PASS 100% (Universal 5-Facet Matrix, Detroit Classical TDD).
  * Bảo toàn 100% tests di sản: `post_processing_pipeline` (9 tests), `anti_aliasing_and_visual_crispness` (19 tests), `auction_theatrical_fx` (16 tests), `imp150_mobile_ios_3d_perf_hardening` (18 tests) -> Tổng 78/78 tests PASS.
  * TypeScript typecheck: `tsc --noEmit` 0 errors. UI Linter: `npm run lint:ui` 0 violations.
  * Domain Invariant: Gotcha Invariant 17 (`Dynamic Depth of Field, Optical Focal Grounding & GameOver Guard`).
  * Evidence Snapshot: `.agents/evidence/imp-224_snapshot.json` (`executed: true`, `contractTestsPassed: true`).
- **Phê chuẩn**: `plan-griller` (P1-P5 HARDENED v3 APPROVED), `qa-tester` (Station 1 RED 14/16), `implementer` (Station 2 GREEN 16/16), `scout` (Station 2.5 PASS 100%), `code-reviewer` (Station 3 APPROVED), `game-3d-visual-critic` (Station 3 APPROVED 9.5/10), `spec-reviewer` (Station 3 APPROVED).
- **Trạng thái**: ✅ Hoàn thành IMP-224 (2026-09-29).

---

### [IMP-225] Actionable In-Game Feedback & Deep Contextual Messages System
- **Mục tiêu**: Nâng cấp toàn diện hệ thống phản hồi ngữ cảnh trong trận đấu, giải quyết triệt để vấn đề phản hồi chung chung, silent intent rejection, các nút bị vô hiệu hóa mà không rõ nguyên nhân (như thế chấp đất có nhà C1-C3, phát hành trái phiếu thiếu điều kiện), bảo đảm công thái học di động 360px và ngăn chặn ô nhiễm thông báo lỗi từ Bot.
  1. *Actionable Guidance 3 Tầng*: Kết hợp Tiêu đề + Mô tả chi tiết + Hướng dẫn hành động cụ thể (`actionHint` kèm icon `👉`), hiển thị qua `ServerToast` (z-50) nổi bật trên tất cả các modal.
  2. *Bot Error Guard (C1) & Throttle Anti-Spam (C2)*: Lọc triệt để các phản hồi `INTENT_REJECTED` từ Bot (`msg.playerId !== myPlayerId`), dập tắt spam click với bộ đệm throttle 1500ms cấp module, và xuất khẩu `resetWsErrorThrottle()` để cách ly hoàn toàn trạng thái giữa các test suite.
  3. *Subcomponent Extraction & Visual Mortgage Hint*: Trích xuất `PropertyCardActions` (150 LOC) khỏi `property_portfolio_modal.tsx`, giảm LOC modal từ 472 xuống 395 LOC (< 500 LOC ceiling); bổ sung `mortgageSubHint` cảnh báo trực quan hạ cấp nhà về C0 trước khi thế chấp; bảo toàn hợp đồng bố cục lưới 2 cột `col-span-2` cho Thế Chấp và `col-span-1` cho Hạ Cấp (IMP-208 regex).
  4. *Visual Bond Eligibility Checklist*: Tab phát hành trái phiếu (`BondIssuanceTab`) chuyển đổi danh sách tĩnh 3 gạch đầu dòng thành cụm thẻ Checklist 3 tiêu chí trực quan UTF-8 (`✔️` / `❌`: Net Worth ≥ 3.000, BĐS sạch ≥ 2, Trong lượt hoặc giải cứu nợ `isTurnValid`), bảo đảm người chơi nhận diện tức thì điều kiện còn thiếu.
- **Hạ tầng hoàn tất**:
  * `src/client/ui/actionable_notification.ts` (343 LOC — Tier 2 <= 500 LOC): Nâng cấp `formatServerErrorMessage` hiển thị thông điệp 3 tầng kèm `👉 ${match.actionHint}`, fallback ngoại lệ an toàn; tái cấu trúc DRY triệt tiêu duplication bằng alias mapping (P1).
  * `src/client/network/ws_message_handler.ts` (189 LOC — Tier 1 <= 400 LOC): Bổ sung `lastErrorTimeMap`, xuất khẩu `resetWsErrorThrottle()`, tích hợp C1 Bot Filter Guard và Throttle Anti-Spam 1500ms, bảo toàn 100% floating text `TradeFrozen` và `LIQUIDITY_FROZEN`.
  * `src/client/ui/modals/portfolio_monopoly_analytics.ts` (222 LOC — Tier 1 <= 400 LOC): Bổ sung `mortgageSubHint?: string`, cập nhật `mortgageButtonLabel = 'Đã Thế Chấp'` khi `isMortgaged` (P2), bảo toàn `'Cần Hạ Cấp'` khi `level > 0` (hợp đồng IMP-208), đồng bộ lý do chặn dỡ nhà đều tay (Even Downgrading).
  * `src/client/ui/modals/property_card_actions.tsx` (149 LOC — Tier 2 <= 500 LOC): Component độc lập quản trị hành động thẻ BĐS, chuẩn hóa sàn chạm cảm ứng $\ge 44$px (`min-h-[44px]`), bảo toàn data-testid và lớp cảnh báo trực quan.
  * `src/client/ui/modals/property_portfolio_modal.tsx` (394 LOC — Tier 2 <= 500 LOC): Tái cấu trúc tinh gọn (subtractive refactoring) đưa modal về 394 LOC (giảm từ 472 LOC, an toàn dưới trần 500 LOC).
  * `src/client/ui/modals/bond_issuance_tab.tsx` (209 LOC — Tier 2 <= 500 LOC): Đồng bộ hóa `isTurnValid = Boolean(isMyTurn || isInInsolvency)` và thay thế danh sách tĩnh bằng cụm Checklist 3 tiêu chí trực quan UTF-8 (flexbox responsive, `truncate min-w-0`, không tràn màn hình 360px).
  * `src/server/network/network_types.ts` (205 LOC — Tier 1 <= 400 LOC): Mở rộng `ReasonCode = ... | ActionRejectReason` giải quyết triệt để type-safety gap và Zero Dirty Casts (P3).
- **Kiểm thử & Bất biến**:
  * `tests/client/actionable_feedback_and_messaging.test.ts` (292 LOC): 16/16 atomic contract tests PASS 100% (Universal 5-Facet Matrix, Detroit Classical TDD, 0 `as any` casts - P3).
  * Bảo toàn 100% tests di sản: `imp208_comprehensive_button_affordance` (21 tests), `actionable_guidance_system` (41 tests), `imp193_mobile_ergonomics_auction_and_copy_polish` (18 tests), `imp220_insolvency_bond_and_auto_solvency_sync` (18 tests) -> Tổng 114/114 tests PASS.
  * TypeScript typecheck: `tsc --noEmit` 0 errors. UI Linter: `npm run lint:ui` 0 violations (204 files scanned).
  * Domain Invariant: Gotcha Invariant 18 (`Actionable Contextual Feedback & Deep Mobile Action Affordance [IMP-225]`).
  * Evidence Snapshot: `.agents/evidence/imp-225_snapshot.json` & `.agents/evidence/imp225_actionable_feedback_and_messaging_snapshot.json` (`executed: true`, `contractTestsPassed: true`, 16 tests passed).
- **Phê chuẩn & Active Remediation**:
  * `plan-griller` (P1-P5 HARDENED v5 APPROVED), `qa-tester` (Station 1 RED 14/16), `implementer` (Station 2 GREEN 16/16), `scout` (Station 2.5 PASS 100%), `ui-craft-reviewer` (Station 3 APPROVED), `spec-reviewer` (Station 3 APPROVED), `code-reviewer` (Station 3 APPROVED).
  * Tiếp thu và hoàn tất 3 phản biện kỹ thuật (P1 DRY Notification Aliases, P2 'Đã Thế Chấp' Label, P3 Zero Dirty Casts & Type Union).
- **Trạng thái**: ✅ Hoàn thành IMP-225 (2026-09-29).

---

### [IMP-227] Tuyến Cầu Cạn Metro Số 1 TP.HCM, Ga Mái Vòm Cánh Buồm Bạt Căng & Đoàn Tàu Siêu Tốc Xanh Cyan - Bạc Kim Loại
- **Mục tiêu**: Tái thiết kế toàn diện hạ tầng đường tàu hỏa và nhà ga 3D diorama sa bàn thành tuyến Metro Số 1 TP.HCM (Tuyến Bến Thành – Suối Tiên) dựa trên 3 ảnh chụp thực tế (`media_1790673767997.jpg`, `media_1790673778059.jpg`, `media_1790673789428.jpg`):
  1. *Cầu Cạn U-Girder & Trụ Tròn Bê Tông*: Nâng cấp bệ đá dăm phẳng cũ thành kết cấu cầu cạn U-Girder bê tông đúc sẵn với gờ lan can bảo vệ hai bên (`#94A3B8`), hệ thống 12 trụ đỡ bê tông hình trụ tròn (`#CBD5E1`) phân bổ dọc 4 cạnh sa bàn.
  2. *Cột Cần Tiếp Điện Trên Cao (Catenary Masts)*: Bổ sung 8 cột tiếp điện OCS (`#64748B`, cột đứng cao $0.17m$, thanh vươn ngang tại cao độ $Y = 0.155m$) ôm sát đường ray, chạm khít đỉnh pantograph trên nóc toa mà không gây xuyên thấu hình học (mesh clipping).
  3. *Ga Mái Vòm Bạt Căng Cánh Buồm Trắng Sứ & Ke Ga PSD*: Tái hiện kiến trúc Ga Khu Công Nghệ Cao / Tân Cảng với mái vòm bạt căng cánh buồm màu trắng sứ (`#F8FAFC`), khung sườn thép uốn cong than sẫm (`#1E293B`), thềm granite sáng bóng (`#E2E8F0`), và vách kính an toàn ke ga Platform Screen Doors (`#38BDF8`, opacity 0.65). Ga Landmark North bờ Bắc giữ vững viền xanh cyan thương hiệu Metro (`#0284C7`) và biển hiệu phát quang LED (`#FEF08A`).
  4. *Đoàn Tàu Metro Tuyến 1 Xanh Cyan - Bạc Kim Loại*: Thay thế đầu máy xe lửa hơi nước đỏ thô sơ bằng đoàn tàu siêu tốc Metro: Đầu tàu vát nhọn khí động học màu xanh da trời (`#0EA5E9` / `#0284C7`), thân xe nhôm bạc ánh kim (`#E2E8F0`, metalness 0.7), dải sọc xanh cyan thương hiệu, kính buồng lái sẫm màu (`#0F172A`), đèn pha LED hoàng kim (`#FEF08A`), điểm nhấn đèn an toàn đỏ đuôi tàu (`#DC2626` - bảo vệ `TC-IMP134.21`), và cần tiếp điện nóc toa pantograph (`#64748B`).
  5. *Tối Ưu 60 FPS & Bất Biến Kiểm Thử Di Sản*: Sử dụng vector singleton `tempVec` & `tempTangent` triệt tiêu GC allocation loop; xuất khẩu hàm thuần khiết `computeTrainPitch(speed, t)` độc lập SSR; bảo vệ thứ tự JSX (4 dải ballast chính đầu tiên khớp cửa sổ cắt chuỗi 800 ký tự); bảo tồn 4 mesh tà vẹt `#451A03` làm direct children tắt hoàn toàn `castShadow` (bảo vệ `TC-IMP142.09`).
- **Hạ tầng hoàn tất**:
  * `src/client/3d/diorama/diorama_train_kinematics.ts` (258 LOC — Tier 1 <= 400 LOC): Bổ sung và xuất khẩu hàm thuần khiết `computeTrainPitch(speed, elapsedTime)`.
  * `src/client/3d/diorama/diorama_railroad.tsx` (398 LOC — Tier 2 <= 500 LOC): Hiện thực hóa toàn bộ cầu cạn U-Girder, hệ trụ tròn, cột tiếp điện, ga bạt căng cánh buồm và đoàn tàu Metro Số 1 3 toa tinh gọn; tái cấu trúc nén qua mảng cấu hình (`VIADUCT_PIER_POSITIONS`, `U_GIRDER_PARAPETS`, `CATENARY_MAST_POSITIONS`, `METALLIC_RAIL_SPECS`).
  * `docs/domain/gotchas.md`: Ghi nhận Invariant 19 về bảo toàn thứ tự JSX cắt chuỗi và direct children cho AST inspection trong 3D diorama.
- **Kiểm thử & Bất biến**:
  * `tests/client/hcmc_metro_line1_infrastructure.test.ts` (362 LOC): 16/16 atomic contract tests PASS 100% (Universal 5-Facet Matrix, Adversarial Inversion PASS: Station 1 RED 9/16 -> Station 2 GREEN 16/16).
  * Bảo toàn 100% 4 bộ test di sản: `imp134_model_train_and_stations` (21 tests), `railroad_ballast_and_waterfront_station` (28 tests), `imp142_draw_call_and_shadow_budget` (25 tests), `model_railroad_and_tactile_lobby` (26 tests) -> Tổng **116/116 tests PASS 100% (Zero Regression)**.
  * TypeScript typecheck: `tsc --noEmit` 0 errors. UI Linter: `npm run lint:ui` 0 violations (205 files scanned).
  * Evidence Snapshot: `.agents/evidence/imp-227_snapshot.json` (`executed: true`, `status: PASSED`, 16 tests passed).
- **Phê chuẩn**:
  * `plan-griller`: P1-P5 HARDENED APPROVED (giải quyết 3 Blocker P1 và 2 Warning P2).
  * `qa-tester`: Station 1 RED verified (9/16 failures proven under Adversarial Inversion).
  * `implementer`: Station 2 GREEN verified (16/16 tests pass, 398 LOC).
  * `scout`: Station 2.5 PASS (0 defects qua 5 universal defect archetypes).
  * `code-reviewer`: Station 3 APPROVED (Zero dirty casts, deep modules, 60 FPS zero-allocation).
  * `game-3d-visual-critic`: Station 3 APPROVED (Điểm số 9.2 / 10, disposition: ship, đạt chuẩn thương mại AAA Monopoly Plus).
  * `spec-reviewer`: Station 3 APPROVED (100% spec reconciliation, 0 scope drift).
- **Trạng thái**: ✅ Hoàn thành IMP-227 (2026-09-29).

---

### [IMP-228 / IMP-224-FIX] Auto-Solvency & Corporate Bond Wire Protocol Security Parity (Khắc Phục Lỗi INVALID_INTENT)
- **Mục tiêu**: Khắc phục dứt điểm sự cố người chơi nhấn nút **"⚡ CÂN ĐỐI TỰ ĐỘNG (CỨU NGUY NHANH)"** trong modal `InsolvencyPhase` nhưng bị chặn với banner `INVALID_INTENT`, đồng bộ 100% Wire Protocol cho Trái Phiếu Doanh Nghiệp và đóng gói lại bản build server production `dist/server/index.js`.
  1. *Cổng an ninh mạng WebSocket*: `EnvelopeValidator` cập nhật tập hợp `VALID_INTENTS` bổ sung đầy đủ 3 intent thiếu hụt: `INTENT_AUTO_SOLVENCY`, `INTENT_ISSUE_BOND`, `INTENT_REPAY_BOND`.
  2. *Zero-Allocation Hot Path Schema Guard*: Khởi tạo static Set tĩnh `VALID_BOND_TRANCHES = new Set<string>(Object.values(BondTrancheId))` ở cấp module, kiểm chuẩn $O(1)$ không cấp phát heap trên đường truyền WebSocket; số âm bị chặn bởi number sanity guard với `INVALID_VALUE`, string lạ bị chặn với `INVALID_ENVELOPE`.
  3. *Insolvency Repay Guard*: Khẳng định FSM từ chối `INTENT_REPAY_BOND` trong `InsolvencyPhase` với `INVALID_PHASE` (khi đang âm vốn không thể tất toán nợ).
  4. *2-Way Closed-Loop Parity*: Thiết lập test đối soát 2 chiều tự động đảm bảo 100% trong 24 intents nghiệp vụ được hỗ trợ đồng bộ giữa `EnvelopeValidator` và `intent_dispatcher.ts` (triệt tiêu hoàn toàn lớp lỗi silent intent drop).
  5. *Tái đóng gói Server Bundle*: Chạy `npm run build` tái đóng gói `dist/server/index.js` (441 kB) và xác thực physical file chứa cả 3 intents mới.
- **Hạ tầng hoàn tất**:
  * `src/server/security/envelope_validator.ts` (239 LOC — Tier 1 <= 400 LOC): Bổ sung 3 intents vào `VALID_INTENTS`, export set, thêm `VALID_BOND_TRANCHES` và schema guard $O(1)$.
  * `docs/domain/gotchas.md`: Ghi nhận Invariant 7 (Pillar IV: Mạng WebSocket & Đồng Bộ Delta) về Wire Protocol Intent Whitelist Parity.
  * `dist/server/index.js`: Đã rebuild và chứa đầy đủ logic xử lý mới.
- **Kiểm thử & Bất biến**:
  * `tests/contracts/imp224_auto_solvency_wire_envelope.test.ts` (428 LOC): 18/18 atomic contract tests PASS 100% (Universal 5-Facet Matrix, Detroit Classical TDD).
  * Bảo toàn 100% tests di sản: `ops03_security` (13 tests), `imp210_auto_solvency_intent` (16 tests), `imp220_insolvency_bond_and_auto_solvency_sync` (18 tests) -> Tổng **65/65 tests PASS (Zero Regression)**.
  * TypeScript typecheck: `tsc --noEmit` 0 errors. UI Linter: `npm run lint:ui` 0 violations.
  * Evidence Snapshot: `.agents/evidence/imp224_execution.json` (`executed: true`).
- **Phê chuẩn**:
  * `plan-griller`: P1-P5 HARDENED v3 APPROVED.
  * `qa-tester`: Station 1 RED verified (11/18 tests failed as expected under Adversarial Inversion).
  * `implementer`: Station 2 GREEN verified (18/18 tests pass, 239 LOC).
  * `scout`: Station 2.5 PASS (0 defects qua 5 universal defect archetypes, LOC safe, binary verified).
  * `spec-reviewer`: Station 3 APPROVED (100% spec reconciliation, 0 scope drift).
- **Trạng thái**: ✅ Hoàn thành IMP-228 / IMP-224-FIX (2026-09-29).

---

### [IMP-228] Subtle Property Trading Indicators on Player Cards (Chỉ Báo BĐS Đang Giao Dịch Tinh Tế)
- **Mục tiêu**: Hiển thị chỉ báo trực quan tinh tế, vừa đủ, dịu mắt trên các chấm đại diện BĐS (28 property dots) của 4 thẻ người chơi (PlayerCards trong Player HUD) khi các ô đất đó đang nằm trong giao dịch mua bán / trao đổi (P2P Trade hoặc Bot Trade Offer), giúp người chơi nhận biết ngay tài sản nào đang được đàm phán mà tuyệt đối không làm quá nổi bật hay gây rối mắt.
  1. *Khử Tailwind Purge CSS (P1)*: Bỏ arbitrary class `ring-offset-[#FFFDF8]` trong template string động, dùng class tĩnh `ring-offset-1` phối hợp inline CSS variable `style={{ '--tw-ring-offset-color': '#FFFDF8' }}`. Đã kiểm chứng qua production build `npm run build` thành công 100%.
  2. *React Pure Updater & Stale Closure (P2)*: Trong `trade_modal.tsx`, tính toán `nextOffered`/`nextRequested` trước, gọi `setOffered`/`setRequested`, sau đó gọi `updateModalPayload` đồng bộ ở ngoài callback updater của `setState`.
  3. *Khử Magic String 'p1' (P3)*: Hàm thuần túy `resolvePlayerTradingCells` trả về Set rỗng khi `localPlayerId` là `undefined` (chưa join phòng hoặc SSR headless), bảo vệ tính tương thích đa người chơi UUID.
  4. *Công thái học 360px & Trợ năng đa kênh*: Chống tràn ngang trên mobile 360px (chỉ chiếm 116px/300px khả dụng); `scale-110 relative z-10` là GPU Transform không làm vỡ lưới; `animate-pulse` đập êm 2s; tooltip bổ sung `(Đang trong giao dịch 🤝)`; đánh dấu DOM `data-trading="true"/"false"`.
- **Hạ tầng hoàn tất**:
  * `src/client/ui/player_card.tsx` (398 LOC — Tier 2 <= 500 LOC): Export `resolvePlayerTradingCells`, `PlayerTradingCellsTradeState`, thêm prop `tradingCells`, useMemo kết nối store, cập nhật cả 22 chấm BĐS màu và 6 chấm hạ tầng.
  * `src/client/ui/modals/trade_modal.tsx` (305 LOC — Tier 2 <= 500 LOC): Tách biệt side-effect `updateModalPayload` ngoài `setState`.
  * `docs/domain/gotchas.md`: Ghi nhận Bất biến số 20 (Pillar V: Giao diện 2D & Công thái học Retropoly).
  * `docs/reports/improvements/IMP-228-subtle-property-trading-indicators_report.md`: Báo cáo nghiệm thu hoàn chỉnh.
- **Kiểm thử & Bất biến**:
  * `tests/client/imp228_subtle_property_trading_indicators.test.ts` (374 LOC): 16/16 atomic contract tests PASS (Universal 5-Facet Matrix, Detroit Classical TDD, 1-4 asserts/test, zero dirty casts).
  * Bảo toàn 100% tests di sản: `imp173_player_card_property_clusters.test.ts` (16 tests), `imp187_player_card_compact_hud.test.ts` (7 tests) -> Tổng **39/39 tests PASS (Zero Regression)**.
  * TypeScript typecheck: `tsc --noEmit` 0 errors. UI Linter: `npm run lint:ui` 0 violations / 205 files.
  * Evidence Snapshot: `.agents/evidence/imp228_execution.json` (`executed: true`).
- **Phê chuẩn**:
  * `qa-tester`: Station 1 RED verified (15/16 tests failed as expected under Adversarial Inversion).
  * `implementer`: Station 2 GREEN verified (16/16 tests pass, 398 LOC & 305 LOC).
  * `scout`: Station 2.5 PASS (0 defects qua 5 universal defect archetypes, LOC safe, build safe).
  * `spec-reviewer` & `re-reviewer`: Station 3.1 APPROVED (100% spec reconciliation, 0 scope drift, 0 dirty casts, <= 4 asserts/test).
  * `ui-craft-reviewer`: Station 3.2 APPROVED (Điểm số 10/10, công thái học 360px hoàn hảo, visual restraint đạt chuẩn).
  * `code-reviewer`: Station 3.2 APPROVED (7/7 tiêu chí ma trận định lượng đạt chuẩn, Deep Architecture, SRP clean, zero timer/memory leak).
- **Trạng thái**: ✅ Hoàn thành IMP-228 (2026-09-29).

---

### [IMP-229] Lean Flow Financial Notifications & Conditional Formula Rendering
- **Mục tiêu**: Tinh giản thẻ thông báo giao dịch tài chính (`FloatingBadge`), triệt tiêu 100% trùng lặp tên ô đất và động từ, chuyển đổi dòng công thức `📐` sang cơ chế hiển thị có điều kiện (`Boolean(narrative.formula?.trim())`), giảm ~32% chiều cao chiếm dụng trên màn hình di động 360px.
  1. *Cơ chế hiển thị có điều kiện*: Bọc dòng `transaction-formula-line` bằng guard kiểm tra nội dung thực tế, tự động co về 2 tầng thanh thoát đối với các hành động niêm yết cố định (`buy`, `upgrade`).
  2. *Tôn trọng explicit formula*: Hàm `resolveFormulaText` kiểm tra `item.formula !== undefined` để bảo toàn quyền tắt công thức trực tiếp của caller.
  3. *Bảo tồn công thức phức tạp*: Giữ nguyên 100% dòng thước kẻ `📐` cho Thuế 10%, Độc quyền x2, Cước Viettel 150 Tr., Thế chấp 50%, Bảo lãnh kiểm toán.
  4. *Câu văn tự nhiên & Chống lặp*: Mua đất đổi thành `"Bạn thanh toán [-4.000] mua sở hữu TP.HCM (Quận 1 - Nguyễn Huệ)"`, xóa đuôi `"từ Ngân Hàng"`, regex bóc tách phòng vệ triệt tiêu lỗi lặp từ ngữ.
- **Hạ tầng hoàn tất**:
  * `src/client/ui/floating_numbers.tsx` (293 LOC — Tier 2 <= 500 LOC): Conditional rendering guard với trim.
  * `src/client/ui/transaction_formula.ts` (77 LOC — Tier 2 <= 300 LOC): Trả về `''` cho `buy`/`upgrade`.
  * `src/client/ui/transaction_narrative.ts` (271 LOC — Tier 2 <= 300 LOC): Regex phòng vệ, target `"mua sở hữu [Tên Ô]"`.
  * `docs/domain/gotchas.md`: Ghi nhận Bất biến số 21 (Pillar V: Giao diện 2D & Công thái học Retropoly).
  * `docs/reports/improvements/IMP-229-lean_flow_financial_notification_report.md`: Báo cáo nghiệm thu hoàn chỉnh.
- **Kiểm thử & Bất biến**:
  * `tests/contracts/imp229_lean_flow_financial_notification.test.ts` (428 LOC): 18/18 atomic contract tests PASS (Universal 5-Facet Matrix, 1-4 asserts/test, zero dirty casts).
  * Bảo toàn 100% tests di sản: `imp216` (16 tests), `imp194` (20 tests) -> Tổng **54/54 tests PASS (Zero Regression)**.
  * TypeScript typecheck: `tsc --noEmit` 0 errors. UI Linter: `npm run lint:ui` 0 violations / 205 files.
  * Evidence Snapshot: `.agents/evidence/chaos_sentinel_IMP229.json` (`executed: true`).
- **Phê chuẩn**:
  * `plan-griller`: P1-P5 AUDIT APPROVED (giải quyết 3 Blocker P1 và 1 Warning P2).
  * `qa-tester`: Station 1 RED verified (9/18 tests failed as expected under Adversarial Inversion).
  * `implementer`: Station 2 GREEN verified (18/18 tests pass, 293, 77, 271 LOC).
  * `scout`: Station 2.5 PASS (0 defects qua 5 universal defect archetypes, LOC safe).
  * `spec-reviewer`: Station 3.1 APPROVED (100% spec reconciliation, 0 scope drift).
  * `ui-craft-reviewer`: Station 3.2 APPROVED (2-tier layout tiết kiệm 32% chiều cao, chuẩn 360px, 0 anti-patterns).
  * `code-reviewer`: Station 3.2 APPROVED (Deep Architecture, clean SRP, zero timer/memory leak).
  * `chaos-sentinel`: Station 4 APPROVED (24/24 Intent parity, port 50144 boundary probe clean, diệt 3/3 mutants 100%).
- **Trạng thái**: ✅ Hoàn thành IMP-229 (2026-09-30).

