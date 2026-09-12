# KẾ HOẠCH CẢI TIẾN IMP-20: ĐẠI TU TOÀN DIỆN SẢNH CHỜ PENTHOUSE LOUNGE 3D & THỦ CÔNG GIAO DIỆN 2D (LOBBY UI CRAFT & 3D ENVIRONMENT OVERHAUL)

## 1. BỐI CẢNH & NGUYÊN NHÂN GỐC RỄ (ROOT CAUSES & CONFLICT AUDIT)

Qua đợt thẩm định đối kháng chuyên sâu từ **2 Chuyên Gia Độc Lập** (`ui-craft-reviewer` cho giao diện 2D và `game-3d-visual-critic` cho không gian 3D), cùng việc rà soát lịch sử phát triển các lát cắt trước đó (`NET-02`, `IMP-09`, `IMP-10`, `IMP-12`), chúng tôi xác định 3 xung đột cốt lõi đã gây ra hiện tượng chỉnh sửa qua lại nhiều lần:

1. **Xung đột Bố Cục 2D (Container Overflow vs Drawer Width):**
   - Lát cắt `NET-02` đặt ra yêu cầu đầy đủ các trường cấu hình phòng, danh sách 4 slot người chơi và thể lệ thi đấu.
   - Khi đưa vào khung `w-96` (`aside` cố định `top-4 right-4 bottom-4`), thẻ cha `div` tại `src/client/ui/lobby/lobby_view.tsx#L114` vẫn giữ padding `p-4 md:p-6`.
   - Hệ quả: Chiều rộng tổng thể vượt quá 100vw, cạnh phải bảng điều khiển bị đẩy văng ra ngoài mép màn hình, cắt xén nút `Sao chép`, huy hiệu `ALL READY` và các nút chức năng.
2. **Xung đột Đặc Tả Màu Sàn 3D & Khóa Cứng Test (Spec Lock-in vs WebGL Reality):**
   - Kế hoạch `IMP-12` trước đây đặc tả sàn đá cẩm thạch trắng Carrara (`#F8FAFC`) và mã màu này bị khóa cứng tại test `tests/client/penthouse_lobby_scene.test.ts#L46`.
   - Trong môi trường WebGL, màu `#F8FAFC` khi nhận ánh sáng môi trường `ambientLight`, đèn rọi `pointLight` và bộ phản chiếu `MeshReflectorMaterial` bị cháy sáng lóa (white blowout), biến mặt sàn thành một mảng trắng bệch mất toàn bộ chiều sâu không gian.
   - Lập trình viên không thể hạ tông màu sàn mà không làm hỏng test hợp đồng cũ nếu chưa có sự chuẩn hóa từ cấp đặc tả.
3. **Đánh Đổi Hiệu Năng Cực Đoan Làm Mất Toàn Bộ Chiều Sâu 3D (Post-Processing Strip):**
   - Đợt tối ưu `IMP-10` đã tách nhánh `isLobby` trong `src/client/game_canvas.tsx` và gỡ bỏ hoàn toàn `<PostProcessingPipeline />` cùng `<ContactShadows />` khỏi sảnh chờ.
   - Hệ quả: Toàn bộ bàn cờ, ghế da và linh vật cờ bị bay lơ lửng không có bóng đổ tiếp xúc (Contact AO), đèn neon và chùm hologram mất hoàn toàn quầng sáng huyền ảo (UnrealBloom).

---

## 2. NÉT TINH HOA BẮT BUỘC GIỮ LẠI (PRESERVATION MANIFESTO - `KEEP`)

Theo đánh giá của cả hai chuyên gia thẩm định, các giá trị sau đã đạt chuẩn xuất sắc và **TUYỆT ĐỐI KHÔNG ĐƯỢC LÀM MẤT**:
- **2D UI**:
  1. Thẻ nhận diện thương hiệu góc trên bên trái `header` (`bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl`, nút mute 36x36, tag Penthouse Tầng 80).
  2. Sự phân tách trạng thái mạch lạc của `PlayerSlotCard` qua 4 chế độ: Chủ phòng (Crown 👑), Bot AI (kèm tính cách), Đã sẵn sàng (Emerald ✓), Chưa sẵn sàng (Amber ⏳).
  3. Bộ 3 huy hiệu quy tắc trận đấu (Vốn 15 Tỷ, 30 Vòng, Điều kiện thắng) giàu biểu tượng trực quan.
- **3D Environment**:
  1. Bộ 4 Linh Vật Cờ Thượng Lưu mạ kim loại PBR (`LuxuryPawnModel`: Tháp Landmark vàng, Du thuyền bạc, Xe cổ đồng, Ngựa chiến navy).
  2. Góc máy quay và tính năng tự động xoay mượt mà của `OrbitControls` với cự ly `[3.8, 3.2, 5.2]`.
  3. Tỷ lệ vàng của bàn tròn với vành gỗ óc chó và trụ đồng vững chãi.

---

## 3. DANH SÁCH KHẮC PHỤC 16 TỬ ĐIỂM (P1-P8 2D & P1-P8 3D)

### A. Tầng Giao Diện 2D UI Craft (`LobbyView` & `PlayerSlotCard`)

| STT | Mã Lỗi | Hiện Tượng Mắt Thấy | Giải Pháp Kỹ Thuật (Tailwind CSS / React) |
| :--- | :--- | :--- | :--- |
| 1 | **P1 (2D)** | **Tràn màn hình & xén mép:** Bảng điều khiển bị đẩy ra ngoài mép phải, cắt nút `Sao chép` và badge | Bỏ `p-4 md:p-6` ở container cha (`lobby_view.tsx#L114`). Định vị `aside` với `top-3 bottom-3 right-3 md:right-5 w-[calc(100%-1.5rem)] sm:w-[380px] max-w-[380px] overflow-hidden`. |
| 2 | **P2 (2D)** | **Viền nét đứt admin rẻ tiền:** Thẻ vị trí trống dùng `border-dashed` phá hỏng phong cách VIP Penthouse | Chuyển sang **Hốc ngồi chìm VIP (Sunken VIP Berth)**: `border border-white/5 bg-slate-950/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] rounded-2xl`. Nút "+ Thêm Bot AI" nâng cấp sang tông cyan phát quang `bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30`. |
| 3 | **P3 (2D)** | **Nút CTA Bắt Đầu bị nhão (Mushy Button):** Nút CTA lớn nhất thiếu gờ xúc giác và độ nảy khi click | Áp dụng chuẩn **Tactile 3D Button**: `shadow-[0_4px_0_0_#b45309,0_8px_16px_rgba(245,158,11,0.25)] hover:shadow-[0_2px_0_0_#b45309] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px]`. |
| 4 | **P4 (2D)** | **Nút Bot AI phẳng lì:** Nút đổi tính cách và xóa bot thiếu phản hồi cơ học | Nâng cấp thành **Tactile Micro-Pill**: Nút đổi tính cách `bg-cyan-950/80 border border-cyan-500/40 shadow-[0_2px_0_0_#0e7490] active:translate-y-0.5 active:shadow-none`. Nút xóa bot `shadow-[0_2px_0_0_#9f1239] active:translate-y-0.5`. |
| 5 | **P5 (2D)** | **Chữ vi mô không đọc được (7.5px - 8px):** Nhãn thể lệ quá nhỏ và xám xịt, không đạt WCAG AAA | Nâng kích thước tối thiểu `text-[10px]` cho nhãn phụ và `text-[11px] font-bold` cho số liệu chính, dùng màu tương phản cao `text-slate-300`, `text-amber-300`, `text-emerald-400`. |
| 6 | **P6 (2D)** | **Vùng bấm nút sao chép quá nhỏ (< 30px):** Khó chạm trên màn hình cảm ứng | Nâng vùng bấm lên tối thiểu 38px: `min-h-[38px] px-3 py-2 rounded-xl`, bổ sung phản hồi khi sao chép thành công với hiệu ứng phát quang viền hổ phách. |
| 7 | **P7 (2D)** | **Hộp mã phòng đơn điệu:** Mã phòng thiếu sự sang trọng của sảnh chờ cao cấp | Thiết kế hộp mạ vàng hổ phách tinh xảo: `border border-amber-500/30 bg-gradient-to-r from-slate-950/90 via-amber-950/20 to-slate-950/90 shadow-[inset_0_1px_0_rgba(251,191,36,0.15)]`, mã phòng `text-2xl font-black font-mono tracking-[0.25em] text-amber-300 drop-shadow-[0_2px_8px_rgba(245,158,11,0.3)]`. |
| 8 | **P8 (2D)** | **Bẫy cuộn lồng nhau (Nested Scroll Trap):** Cả bảng điều khiển và danh sách slot đều có scrollbar gây giật chuột | Thiết lập cấu hình cuộn một tầng duy nhất cho danh sách slot: `aside flex flex-col justify-between overflow-hidden`, chỉ cho phép phần giữa danh sách cuộn tự nhiên (`flex-1 min-h-0 overflow-y-auto`). |

---

### B. Tầng Không Gian 3D Environment & R3F Rendering (`PenthouseScene` & `Canvas`)

| STT | Mã Lỗi | Hiện Tượng Mắt Thấy | Giải Pháp Kỹ Thuật (Three.js / R3F) |
| :--- | :--- | :--- | :--- |
| 1 | **P1 (3D)** | **Thiếu Post-Processing & Contact Shadows:** Vật thể bay lơ lửng, đèn neon không phát sáng | Tái kích hoạt `<ContactShadows />` (tiếp xúc sàn & chân ghế) và `<PostProcessingPipeline />` (Bloom mềm dệt quầng sáng hologram) cho nhánh `isLobby` trong `GameCanvas.tsx`. |
| 2 | **P2 (3D)** | **Sàn cẩm thạch trắng Carrara cháy sáng lóa:** Trắng bệch mất chi tiết và chiều sâu | Chuyển đổi sang **Đá Cẩm Thạch Đen Nero Marquina Hoàng Gia** (`#0B0F19`): `roughness: 0.18`, `metalness: 0.15`, `mirror: 0.60`. Mặt sàn phản chiếu bầu trời hoàng hôn vịnh biển và vầng sáng hologram rực rỡ. |
| 3 | **P3 (3D)** | **Hậu cảnh hoàng hôn 2D phẳng như bạt nilon:** Thiếu gợn sóng đại dương và ánh đèn thành phố | Nâng cấp bộ sinh texture thủ tục `penthouse_texture_generator.ts`: vẽ mặt biển hoàng hôn lấp lánh sóng ánh vàng (specular highlights), đường chân trời cao ốc đô thị lung linh đèn (city lights), và dải mây chiều tím thẫm hòa ráng chiều vàng óng. |
| 4 | **P4 (3D)** | **Chùm tia Hologram nón cụt thô kệch:** Khối nón nhựa đục úp ngược che khuất tầm nhìn | Thay thế nón cụt bằng **Hệ Thống 3 Vòng Quét Radar Đồng Tâm Đa Chiều** (`ringGeometry`) kết hợp chùm 120 hạt bụi laser nano phát quang bồng bềnh (`Points` / `PointsMaterial`), tạo cảm giác sa bàn công nghệ điện tử chuẩn viễn tưởng. |
| 5 | **P5 (3D)** | **Sa bàn trung tâm 4 khối hộp lego vàng thô sơ:** Không toát lên quy mô đại đô thị | Nâng cấp thành **Sa bàn Đảo Vịnh Mini (Townscaper Mini Diorama)**: Dựng cụm cao ốc chọc trời vi mô (micro-skyscrapers) phát sáng, cầu treo dây văng mini vắt qua đảo và mặt vịnh biển phát quang ngọc bích. |
| 6 | **P6 (3D)** | **Ghế da mỏng manh, 4 chân que tăm đen xịt:** Trông nghèo nàn, thiếu cảm giác sofa thượng lưu | Thiết kế **Ghế Bành VIP Club Armchair**: Đệm nhung dập múi phồng sang trọng (`#334155` hoặc da cognac `#78350F`), 4 chân mạ vàng Champagne choãi 8 độ vững chãi đón bóng tiếp xúc. |
| 7 | **P7 (3D)** | **9 nan nẹp cửa sổ đen xì như song sắt nhà tù:** Chắn ngang tầm mắt ngắm cảnh vịnh biển | Giảm số nan nẹp từ 9 xuống 7 nan mở rộng nhịp cửa sổ; giảm đường kính nan từ `0.06` xuống `0.025` thanh thoát; đổi chất liệu sang hợp kim đồng mạ vàng Champagne (`#D97706`, `metalness: 0.9`, `roughness: 0.2`). |
| 8 | **P8 (3D)** | **Màn hình HUD phòng dạng tấm phẳng 2D thô sơ:** Che khuất không gian bàn cờ | Chuyển đổi màn hình HUD thành **Hologram Kính Thấu Quang Trong Suốt (Glassmorphic Holographic Mesh)** mỏng nhẹ, viền neon cyan nhấp nháy tinh tế. |

---

## 4. QUY HOẠCH CẤU TRÚC FILE & ĐỊNH MỨC DÒNG MÃ (LOC BUDGETS & ARCHETYPES)

Để tuân thủ tuyệt đối quy định phân loại file 5 bậc của `GEMINI.md` và ngăn ngừa hiện tượng phình to file (`penthouse_lobby_scene.tsx` hiện tại đã đạt 406 LOC):

```text
src/client/
  ├── 3d/
  │    ├── penthouse_lobby_scene.tsx       (Scene Orchestrator, Camera & Lights: ~250 LOC <= 300 LOC)
  │    ├── penthouse_hologram.tsx          (NEW: Central Hologram, Radar Rings, Diorama: ~220 LOC <= 300 LOC)
  │    ├── penthouse_enclosure.tsx         (Architecture, 7 Thin Gold Mullions, Nero Marquina Floor: ~230 LOC <= 300 LOC)
  │    ├── penthouse_texture_generator.ts  (Living Ocean Sunset & Twinkling Skyline Canvas: ~210 LOC <= 300 LOC)
  │    ├── luxury_pawn_models.tsx          (Existing 4 Luxury Pawn models: ~200 LOC <= 300 LOC)
  │    └── game_canvas.tsx                 (Enable ContactShadows & Bloom for isLobby: ~280 LOC <= 300 LOC)
  └── ui/
       └── lobby/
            ├── lobby_view.tsx             (Fix P1, P3, P5, P6, P7, P8: ~310 LOC <= 400 LOC)
            ├── player_slot_card.tsx       (Fix P2, P4 Sunken Berth & Tactile Pills: ~150 LOC <= 200 LOC)
            └── qr_code_card.tsx           (Existing: ~75 LOC)
```

- **Tách Module Chuẩn Mực (`penthouse_hologram.tsx`)**: Bóc tách `CentralHologram` ra khỏi `penthouse_lobby_scene.tsx`. Điều này giúp `penthouse_lobby_scene.tsx` giảm từ 406 LOC xuống còn ~250 LOC (dưới ngưỡng cảnh báo 300 LOC), hoàn toàn miễn nhiễm với "code golf" và việc xóa comment.

---

## 5. ĐỒNG BỘ ĐẶC TẢ VÀ TEST HỢP ĐỒNG (SPEC & TEST RECONCILIATION)

1. **Khắc phục Test Lock-in tại `tests/client/penthouse_lobby_scene.test.ts`**:
   - Thay thế khẳng định sàn trắng cũ:
     - CŨ: `expect(PENTHOUSE_COLORS.marbleFloor).toBe('#F8FAFC');`
     - MỚI: `expect(PENTHOUSE_COLORS.marbleFloor).toBe('#0B0F19');`
   - Cập nhật mô tả kiểm thử từ *"đá cẩm thạch trắng Carrara"* sang *"đá cẩm thạch đen hoàng gia Nero Marquina"*.
2. **Kiểm Thử Hợp Đồng Bổ Sung (`tests/client/penthouse_hologram.test.ts`)**:
   - Thẩm định hệ thống 3 vòng quét radar đồng tâm (`ringGeometry`).
   - Thẩm định sa bàn Townscaper diorama mini có đủ các khối chọc trời vi mô và đảo ngọc.
   - Thẩm định dao động điều hòa an toàn với `NaN` và `Infinity`.
3. **Bảo toàn 100% Test Giao Diện (`tests/client/ui06_lobby_screen.test.ts`)**:
   - Toàn bộ các `data-testid` (`lobby-slot-X-empty`, `lobby-slot-X-occupied`, `add-bot-slot-X-btn`, `cycle-bot-X-btn`, `start-game-btn`, `lobby-room-code`, `lobby-rules-card`, `lobby-mute-toggle-button`) được bảo toàn tuyệt đối.

---

## 6. KẾ HOẠCH XÁC THỰC & NGHIỆM THU (VERIFICATION GATES)

1. **Gate 1 - Static Types & Linting**:
   - `npx tsc --noEmit` đạt 0 lỗi.
   - `npm run lint:ui` đạt 0 lỗi (kiểm tra 4 anti-patterns: `border-accent-on-rounded`, `bounce-easing`, `gray-on-color`, `gradient-text`).
2. **Gate 2 - Unit & Contract Test Suite**:
   - `npx vitest run tests/client/penthouse_lobby_scene.test.ts` PASS 100%.
   - `npx vitest run tests/client/ui06_lobby_screen.test.ts` PASS 100%.
   - `npm run gate:quick` PASS 100% toàn bộ test suites của dự án (Zero Regression).
3. **Gate 3 - Visual Proof via CDP Screenshot**:
   - Chạy script chụp ảnh headless Edge tại cổng 5173 trên cả 2 độ phân giải (1600x1000 và 1920x1080).
   - Kiểm chứng thực tế: Mép phải bảng điều khiển không bị cắt xén, sàn đá đen Nero Marquina phản chiếu ánh hoàng hôn êm dịu không bị chói lóa, sa bàn hologram phát quang sống động.
4. **Gate 4 - Báo cáo Nghiệm thu Hoàn tất**:
   - Lập báo cáo `docs/reports/improvements/IMP-20-penthouse-lobby-and-ui-craft-overhaul_report.md` kèm ảnh chụp kiểm chứng.
   - Cập nhật `docs/master_roadmap.md`.
