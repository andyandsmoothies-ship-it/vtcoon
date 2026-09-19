# [IMP-125-P1] BÁO CÁO NGHIỆM THU GIAI ĐOẠN 1: BẢN ĐỒ NHIỆT, SA BÀN ĐỒ CHƠI & KHẮC PHỤC HIỂN THỊ DI ĐỘNG

- **Mã Báo Cáo**: IMP-125-P1
- **Kế Hoạch Tham Chiếu**: [`IMP-125-phase1-heatmap-toybox-and-mobile-fixes_plan.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/plans/improvements/IMP-125-phase1-heatmap-toybox-and-mobile-fixes_plan.md)
- **Báo Cáo Tổng Thể**: [`IMP-125 Review Report`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/improvements/IMP-125-gameplay-ui-animation-3d-evolution-review_report.md)
- **Trạng Thái Nghiệm Thu**: 🟢 **HOÀN THÀNH XUẤT SẮC · 100% PHÊ DUYỆT TRẠM 3 (SHIP READY)**
- **Ngày Hoàn Thành**: 2026-09-19
- **Bất Biến Kỹ Thuật Đạt Được**:
  * $\Delta \text{Draw Calls} = 0$ (Không sinh thêm mesh độc lập, tận dụng PBR emissive & WebAudio API synth).
  * 100% Client-side reactivity, zero FSM mutation, zero WSS payload inflation.
  * 0 lỗi UI anti-patterns (`npm run lint:ui` trên 146 files).
  * 43/43 tests atomic contract PASS trong `tests/client/imp125_phase1_heatmap_toybox_fixes.test.ts`.

---

## 1. TỔNG HỢP KẾT QUẢ THỰC THI 4 GÓI CÔNG VIỆC

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          KẾT QUẢ NGHIỆM THU GIAI ĐOẠN 1                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Gói 1: Fix Chữ Ô Cờ 180°]     ──► tileRotation camera-friendly · PASS    │
│  [Gói 2: Fix Tràn TopBar]       ──► max-w-full overflow-hidden · PASS       │
│  [Gói 3: Heatmap Overlay]       ──► Nút 🗺️ ActionDock + Emissive PBR · PASS │
│  [Gói 4: Interactive Toy-Box]   ──► Click Hải đăng, Xe, Mặt biển · PASS     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.1. Gói 1 (Fix): Chuẩn Hóa Góc Xoay Chữ Ô Cờ (Khử Lộn Ngược 180°)
- **Tệp chỉnh sửa**: `src/client/3d/board_layout.tsx`, `tests/client/ui01_board.test.ts`.
- **Thực thi vật lý**:
  * Ô số 0 (Khởi Hành): Chếch góc 45° `[0, Math.PI / 4, 0]`, đối diện trực diện với camera Overview ở tọa độ `[24.6, 25.3, 24.6]`.
  * Cạnh 0 (1..9) và Cạnh 2 (20..29): Góc quay `[0, 0, 0]`. Khử hoàn toàn tình trạng chữ bị lộn ngược 180° trên Cạnh 2 khi nhìn từ camera tổng quan.
  * Cạnh 1 (10..19) và Cạnh 3 (30..39): Góc quay `[0, Math.PI / 2, 0]` vuông góc đọc chuẩn từ trục nhìn camera.
  * Phòng thủ biên: Giá trị index ngoài phạm vi `[0, 39]` hoặc `NaN` tự động fallback an toàn `[0, 0, 0]`.
  * Reconcile `tests/client/ui01_board.test.ts` (32/32 tests PASS).

### 1.2. Gói 2 (Fix): Sửa Lỗi Tràn Mép Phải TopBar Mobile (< 390px)
- **Tệp chỉnh sửa**: `src/client/ui/top_bar.tsx`, `src/client/ui/hud_container.tsx`.
- **Thực thi vật lý**:
  * Thẻ `<header>` trong `top_bar.tsx` bổ sung `max-w-full overflow-hidden`.
  * Ba nút tiện ích (`time-of-day-toggle-button`, `mute-toggle-button`, `activity-feed-toggle-button`) bổ sung kích thước an toàn di động `min-h-[36px] min-w-[36px] sm:min-h-[44px] sm:min-w-[44px]`.
  * Ẩn nhãn chữ nút đổi thời gian trên mobile (`hidden sm:inline`), chỉ giữ icon trực quan.
  * `hud_container.tsx` áp dụng fluid padding `p-1.5 sm:p-3 md:p-6`.

### 1.3. Gói 3 (Feature): Bản Đồ Nhiệt Quy Hoạch Đô Thị (Monopoly Heatmap Overlay)
- **Tệp chỉnh sửa**: `src/client/store/game_store_types.ts`, `src/client/store/game_store.ts`, `src/client/ui/action_dock.tsx`, `src/client/3d/board_tile.tsx`.
- **Thực thi vật lý**:
  * Bổ sung state `isHeatmapActive: boolean` (default `false`) và actions `toggleHeatmap`, `setHeatmapActive`.
  * Thêm nút `🗺️ Quy Hoạch` (`data-testid="heatmap-toggle-btn"`) trên `ActionDock` với viền hổ phách `ring-2 ring-amber-400 bg-amber-100` khi kích hoạt.
  * Trong `LayeredDioramaTile`: Khi `isHeatmapActive === true`, các ô đất có chủ sở hữu kích hoạt dải đèn neon PBR `emissive = ownerColor`, `emissiveIntensity = 1.2`. Khi tắt hoàn nguyên `#000000` intensity `0`.

### 1.4. Gói 4 (Feature): Sa Bàn Tương Tác Xúc Giác Hộp Đồ Chơi (Toy-Box Diorama)
- **Tệp chỉnh sửa**: `src/client/audio/sound_synth_recipes.ts`, `src/client/audio/sound_engine.ts`, `src/client/3d/diorama/diorama_marina.tsx`, `src/client/3d/diorama/diorama_traffic.tsx`, `src/client/3d/coastal_island_environment.tsx`.
- **Thực thi vật lý**:
  * 3 công thức tổng hợp WebAudio Synth thuần túy:
    - `synthesizeLighthouseFoghorn`: Còi sương mù trầm ấm (Sawtooth + Bandpass 110Hz).
    - `synthesizeCarHorn`: Còi xe hai âm sắc (440Hz + 554Hz, short envelope).
    - `synthesizeWaterSplash`: Tiếng nước vỗ nhẹ (Noise + Resonant lowpass sweep).
  * `SoundEngine`: Bổ sung `playLighthouseHorn()`, `playCarHorn()`, `playWaterRipple()`, `dispose()` với cơ chế phòng thủ Zero-Crash.
  * Gắn điểm bắt tương tác `data-testid="heritage-lighthouse"`, `data-testid="micro-traffic-group"`, `data-testid="living-ocean-water"`.

---

## 2. BẰNG CHỨNG KIỂM THỬ & CHẤT LƯỢNG (TEST EVIDENCE)

1. **Bộ Test Hợp Đồng Phase 1**:
   - Lệnh: `cmd /c npm test tests/client/imp125_phase1_heatmap_toybox_fixes.test.ts`
   - Kết quả: **43/43 atomic tests PASS 100% (68ms)**.
2. **Hồi Quy Bộ Test Bàn Cờ**:
   - Lệnh: `cmd /c npm test tests/client/ui01_board.test.ts`
   - Kết quả: **32/32 tests PASS 100%**.
3. **Bảo Toàn Giới Hạn Kiến Trúc Sa Bàn**:
   - Lệnh: `cmd /c npm test tests/client/dense_metropolis_architecture.test.ts`
   - Kết quả: **6/6 tests PASS** (`coastal_island_environment.tsx` đạt 288 LOC <= 300 LOC).
4. **Kiểm Tra UI Linter**:
   - Lệnh: `cmd /c node scripts/lint_ui.mjs src/client`
   - Kết quả: **0 Anti-patterns detected across 146 files**.
5. **Kiểm Tra TypeScript Compiler**:
   - Lệnh: `cmd /c npx tsc --noEmit`
   - Kết quả: **Exit code 0 (0 compilation errors)**.
6. **Môi Trường Container Thực Tế**:
   - Container `vtcoon-vtcoon-1` đã được rebuild và kích hoạt trạng thái **healthy**.
   - `curl -I http://localhost:3000` trả về **HTTP/1.1 200 OK**.

---

## 3. BÀI HỌC KINH NGHIỆM ĐÃ GHI NHẬN (GOTCHAS)

- Đã trích xuất và bổ sung **Gotcha #161** trong [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md):
  * *Bẫy xoay ô cờ*: Cạnh 2 phải có rotation `[0, 0, 0]` thay vì `Math.PI` để đọc thuận từ góc nhìn camera Overview [24.6, 25.3, 24.6].
  * *Bẫy tràn TopBar*: Cần `max-w-full overflow-hidden` và `min-h-[36px]` trên mobile breakpoint.
  * *Bẫy Heatmap Emissive*: Không sinh thêm mesh mới; dùng `emissive` và `emissiveIntensity` trực tiếp trên mesh chân đế có sẵn.
  * *Bẫy giới hạn LOC*: `coastal_island_environment.tsx` chịu ràng buộc kiến trúc <= 300 LOC bởi `dense_metropolis_architecture.test.ts`.
