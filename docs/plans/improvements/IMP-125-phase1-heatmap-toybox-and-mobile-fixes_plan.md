# [IMP-125-P1] KẾ HOẠCH TRIỂN KHAI GIAI ĐOẠN 1: BẢN ĐỒ NHIỆT, SA BÀN ĐỒ CHƠI & KHẮC PHỤC HIỂN THỊ DI ĐỘNG

- **Mã Kế Hoạch**: IMP-125-P1
- **Kế Thừa Báo Cáo**: `docs/reports/improvements/IMP-125-gameplay-ui-animation-3d-evolution-review_report.md`
- **Mục Tiêu**: Xuất xưởng 4 gói việc cốt lõi của Giai đoạn 1 gồm 2 tính năng tăng cường xúc giác sa bàn 3D (Bản đồ nhiệt & Sa bàn đồ chơi) và khắc phục 2 lỗi hiển thị phát hiện trên mobile (Lộn chữ 180° & Tràn mép phải TopBar).
- **Ranh Giới Kiến Trúc**: 100% Client-side UI/3D/Audio. Zero FSM mutation. Zero WSS delta packet increase. $\Delta \text{Draw Calls} = 0$.
- **Quy Trình Áp Dụng**: Quy trình 3 Trạm chuẩn Antigravity (Trạm 1 RED Test ➔ Trạm 2 GREEN Implementation ➔ Trạm 3 Independent Physical Verification).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          IMP-125 PHASE 1 SLICE PIPELINE                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Gói 1: Fix Chữ Ô Cờ 180°]     ──► Chuẩn hóa tileRotation & góc nhìn Cam   │
│  [Gói 2: Fix Tràn TopBar]       ──► Co giãn responsive TopBar < 390px       │
│  [Gói 3: Heatmap Overlay]       ──► Nút 🗺️ ActionDock + Emissive PBR        │
│  [Gói 4: Interactive Toy-Box]   ──► Click Hải đăng, Xe vi mô, Mặt biển     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. PHÂN TÍCH VẾT VA CHẠM (PRE-FLIGHT BLAST RADIUS AUDIT)

- **Cấp độ rủi ro**: `Slice-Bound` (Giới hạn trong tầng hiển thị Client 2D/3D).
- **Vùng chạm trực tiếp (Direct Touch)**:
  1. `src/client/3d/board_layout.tsx` (Hàm `tileRotation`)
  2. `src/client/ui/top_bar.tsx` (Layout responsive và padding)
  3. `src/client/ui/hud_container.tsx` (Top padding an toàn)
  4. `src/client/store/game_store.ts` (Thêm state `isHeatmapActive`)
  5. `src/client/ui/action_dock.tsx` (Thêm nút `🗺️ Quy Hoạch`)
  6. `src/client/3d/board_tile.tsx` (Hiệu ứng Emissive theo chủ sở hữu khi Heatmap bật)
  7. `src/client/3d/diorama/diorama_marina.tsx` (Bắt sự kiện click ngọn hải đăng)
  8. `src/client/3d/diorama/diorama_traffic.tsx` (Bắt sự kiện click xe vi mô)
  9. `src/client/3d/coastal_island_environment.tsx` (Bắt sự kiện click mặt biển)
  10. `src/client/audio/sound_synth_recipes.ts` & `sound_engine.ts` (Bộ công thức âm thanh WebAudio Synth cho còi hải đăng, còi xe, tiếng nước)
- **Tầng tiêu thụ hạ nguồn (Downstream Consumers)**:
  - GameCanvas và OrbitControls: Không bị xung đột cử chỉ (không có kéo thả xúc xắc).
  - WebAudio AudioContext: Sử dụng chung singleton `SoundEngine`.
- **Phương án phòng vệ xấu nhất (Worst-Case Defense)**:
  - Nếu trình duyệt không hỗ trợ WebAudio hoặc người chơi tắt tiếng: Tự động fallback im lặng an toàn (`try/catch` + `isMuted` guard).
  - Nếu thiết bị yếu (< 50 FPS): `resolveAdaptivePostProcessing` giữ nguyên hiệu năng, không bị ảnh hưởng do Heatmap không sinh thêm Mesh nào.

---

## 2. CHI TIẾT 4 GÓI CÔNG VIỆC THỰC THI

### Gói 1 (Fix): Chuẩn Hóa Góc Xoay Chữ Ô Cờ (Khử Lộn Ngược 180°)
- **Hiện trạng**: Hàm `tileRotation(index)` hiện tại xoay các ô cờ ở Cạnh 1 (`-Math.PI / 2`) và Cạnh 2 (`Math.PI`) hướng vào trong tâm bàn cờ. Khi camera Overview đặt tại góc Đông-Nam nhìn sang Tây-Bắc, toàn bộ chữ trên Cạnh 1 và Cạnh 2 bị lộn ngược 180° so với mắt người chơi. Ô số 0 (Khởi Hành) chưa quay chếch thuận mắt theo góc máy.
- **Giải pháp**:
  - Cập nhật hàm `tileRotation` và hướng xoay bề mặt ô cờ:
    * Cạnh 0 (0..9): giữ nguyên `[0, 0, 0]`.
    * Cạnh 1 (10..19): đổi góc quay để chữ đọc thuận từ dưới lên theo trục nhìn camera (`[0, Math.PI / 2, 0]` hoặc chuẩn hóa trục đọc).
    * Cạnh 2 (20..29): đổi góc quay về `[0, 0, 0]` (ngược lại với hướng cũ) để toàn bộ tiêu đề và tranh vẽ quay về phía người chơi.
    * Cạnh 3 (30..39): giữ nguyên `[0, Math.PI / 2, 0]`.
    * Ô góc Khởi Hành (Ô 0): tinh chỉnh góc xoay `[0, Math.PI / 4, 0]` (hoặc góc tối ưu) để chữ `KHỞI HÀNH` đối diện trực tiếp với camera.
  - Viết test hợp đồng kiểm tra ma trận góc xoay cho 40 ô cờ.

### Gói 2 (Fix): Sửa Lỗi Tràn Mép Phải TopBar Trên Di Động (< 390px)
- **Hiện trạng**: Trên màn hình hẹp (360px - 390px), cụm thông tin trận đấu (`match-info-capsule`) và cụm tiện ích HUD (`hud-utilities-cluster`) có tổng chiều ngang > 450px, đẩy mép phải tràn ra ngoài khung nhìn khiến nút bật nhật ký và âm thanh bị xén.
- **Giải pháp**:
  - Trong `top_bar.tsx`:
    * Thêm `max-w-full overflow-hidden` vào thẻ `<header>`.
    * Trên màn hình nhỏ (`< sm`):
      - Giảm padding của capsule thông tin xuống `px-1.5 py-1 gap-1`.
      - Rút gọn nhãn thời gian và kho bạc, hiển thị dạng số ngắn gọn kèm icon.
      - Nút đổi ngày/đêm (`time-of-day-toggle-button`): kích thước `min-h-[36px] min-w-[36px]`, chỉ hiển thị icon trên mobile.
      - Nút âm thanh (`mute-toggle-button`) và nút nhật ký (`activity-feed-toggle-button`): kích thước `min-h-[36px] min-w-[36px]`, padding gọn gàng.
  - Trong `hud_container.tsx`: Điều chỉnh padding phía trên thành `p-1.5 sm:p-3 md:p-6`.
  - Đảm bảo tổng chiều rộng trên màn hình 360px luôn <= 345px, 0% tràn ngang.

### Gói 3 (Feature): Bản Đồ Nhiệt Quy Hoạch Đô Thị (Monopoly Heatmap Overlay)
- **Kiến trúc**:
  - Thêm state vào `game_store.ts`:
    * `isHeatmapActive: boolean` (mặc định `false`).
    * `toggleHeatmap: () => void`.
  - Giao diện `ActionDock`:
    * Thêm nút `🗺️ Quy Hoạch` (icon 🗺️, chữ ẩn trên mobile `hidden sm:inline`).
    * Khi bật: nút có viền phát sáng màu hổ phách (`ring-2 ring-amber-400`).
  - Hiển thị 3D trong `board_tile.tsx` & `board_layout.tsx`:
    * Khi `isHeatmapActive === true`:
      - Các ô đất có chủ sở hữu: Kích hoạt `emissive={ownerColor}` với `emissiveIntensity={1.2}` trên phần viền `OwnerBaseTrim` và bề mặt ô.
      - Nếu chủ sở hữu nắm trọn bộ màu (Monopoly Completed Set): Kích hoạt hiệu ứng nhấp nháy huỳnh quang nhẹ (`emissiveIntensity={1.8}`).
      - Bàn cờ gỗ và sa bàn xung quanh dịu sáng nhẹ 25% để các dải màu quy hoạch nổi bật rực rỡ.
    * Khi tắt: Hoàn nguyên trạng thái PBR ban đầu.
    * Đảm bảo $\Delta \text{Draw Calls} = 0$.

### Gói 4 (Feature): Sa Bàn Tương Tác Xúc Giác Dạng Hộp Đồ Chơi (Interactive Toy-Box Diorama)
- **Kiến trúc**:
  - Bộ tổng hợp âm thanh WebAudio Synth trong `sound_synth_recipes.ts` & `sound_engine.ts`:
    * `synthesizeLighthouseFoghorn`: Còi sương mù trầm ấm (Sawtooth + Bandpass 110Hz).
    * `synthesizeCarHorn`: Còi xe hai âm sắc "bíp bíp" (440Hz + 554Hz).
    * `synthesizeWaterSplash`: Tiếng nước vỗ nhẹ (Noise + Resonant Lowpass).
  - Tương tác 3D:
    * *Hải đăng (`diorama_marina.tsx`)*: Bắt sự kiện click -> đèn pha quét nhanh 1 vòng 360° (0.8s) + phát còi sương mù.
    * *Xe vi mô (`diorama_traffic.tsx`)*: Bắt sự kiện click -> xe nhún nhẹ bốc đà tăng tốc trong 1.2s + phát còi xe "bíp bíp".
    * *Mặt biển (`coastal_island_environment.tsx`)*: Bắt sự kiện click -> tạo gợn sóng lan tỏa cục bộ + phát tiếng nước vỗ.
  - Phản hồi tức thì < 16ms, client-only.

---

## 3. MA TRẬN KIỂM THỬ 4 DIỆN (UNIVERSAL 4-FACET BEHAVIORAL MATRIX)

| Facet | Kịch Bản Kiểm Thử | Trách Nhiệm Trạm 1 (`qa-tester`) |
|---|---|---|
| **1. Boundary** | TopBar không tràn trên màn hình 320px, 360px, 375px, 390px, 412px. Góc quay `tileRotation` cho 40 ô cờ nằm chính xác trong `[0, 2*PI]`. | Test responsive CSS classes & góc xoay toán học |
| **2. State Reactivity** | Click nút `🗺️` bật/tắt `isHeatmapActive` tức thì trong store. Thuộc tính emissive trên ô cờ phản hồi ngay lập tức theo state. | Test reactivity Zustand store & render props |
| **3. Resource Disposal** | Khi unmount hoặc tắt modal, các timer tương tác (quét đèn, xe bốc đà, audio nodes) được dọn dẹp sạch, không rò rỉ bộ nhớ. | Test cleanup lifecycles & unmount safety |
| **4. Error Defense** | Khi WebAudio Context bị chặn hoặc mute, các tương tác Toy-box vẫn hoạt động visual trơn tru, không throw exception. | Test guard `try/catch` & fallback im lặng |

---

## 4. KẾ HOẠCH BÀN GIAO & TIẾN ĐỘ

1. Trạm 1: `qa-tester` tạo test suites tại `tests/client/imp125_phase1_heatmap_toybox_fixes.test.ts` (>= 25 atomic contract tests, chứng minh RED).
2. Trạm 2: `implementer` hiện thực hóa mã nguồn trong `src/client/**`, chuyển toàn bộ test sang GREEN, kiểm tra `npm run lint:ui` đạt 0 lỗi.
3. Trạm 3: `spec-reviewer` và các chuyên gia độc lập thẩm định vật lý trên đĩa, đối soát 0 Scope Drift.
4. Đóng gói Docker container và kiểm tra live.
