# [IMP-125-P3] KẾ HOẠCH TRIỂN KHAI GIAI ĐOẠN 3: HỢP NHẤT QUẦN THỂ ĐÔ THỊ ĐỘC QUYỀN (MONOPOLY PLAZA FUSION)

- **Mã Kế Hoạch**: IMP-125-P3
- **Kế Thừa Báo Cáo**: [`IMP-125 Review Report`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/improvements/IMP-125-gameplay-ui-animation-3d-evolution-review_report.md)
- **Kế Thừa Giai Đoạn 1 & 2**: [`IMP-125-P1 Report`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/improvements/IMP-125-P1-heatmap-toybox-and-mobile-fixes_report.md), [`IMP-125-P2 Report`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/improvements/IMP-125-P2-tension-and-pawn-reactions_report.md)
- **Mục Tiêu**:
  1. *Cải Tiến 5*: Hợp Nhất Quần Thể Đô Thị Khi Đạt Độc Quyền (Monopoly Plaza Fusion) — Khi một người chơi thâu tóm trọn bộ màu (Monopoly Group), kích hoạt hiệu ứng thị giác đỉnh cao biến cụm ô đất thành một quần thể thương mại thống nhất:
     - Dải Huỳnh Quang Hoàng Gia (Emissive Plaza Trim): Viền chân đế phát sáng màu người chơi kết hợp gờ vàng kim `#F59E0B` (`emissiveIntensity = 0.65` liên tục kể cả khi tắt Heatmap).
     - Huy Hiệu Vương Miện Mạ Vàng (Monopoly Crown Crest): Dập nổi trên dải màu đỉnh ô cờ khẳng định chủ quyền tối thượng.
     - Dải Cờ Hoa Vỉa Hè Mép Trong (Inner Bunting Garland): Giăng dọc vỉa hè tiếp giáp sa bàn diorama, kết nối thị giác trọn vẹn bộ màu mà không che khuất các ô sự kiện ở giữa (như ô Cơ Hội).
     - WebAudio Synth Hoan Ca Độc Quyền (Monopoly Fanfare): Kèn đồng hoàng gia F4-A4-C5-F5 vang dội khi một người chơi vừa hoàn tất độc quyền một bộ màu.
- **Ranh Giới Kiến Trúc**:
  - $\Delta \text{Draw Calls} = 0$, không phá vỡ UV, không can thiệp mesh hình học của 40 ô cờ gốc.
  - 100% Client-side Presentation & Pure Math, zero FSM mutation.
  - Tuân thủ nghiêm ngặt Quy trình 3 Trạm chuẩn Antigravity.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          IMP-125 PHASE 3 SLICE PIPELINE                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  [detectPlayerMonopolies] ──(Sở Hữu Trọn Bộ Màu)──► [Monopoly Plaza Fusion] │
│                                                            │                │
│         ┌──────────────────────────────────────────────────┴─────┐          │
│         ▼                                                        ▼          │
│  [Emissive Plaza Trim & Crown Crest]               [Monopoly Brass Fanfare] │
│  • Viền phát quang hoàng kim gờ ô cờ               • WebAudio F4-A4-C5-F5   │
│  • Vương miện vàng 3D dập nổi đỉnh ô               • Floating Toast Vinh Danh│
│  • Cờ hoa vỉa hè mép trong diorama                 • Không giật lag FPS     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. PHẢN BIỆN ĐỐI KHÁNG ZERO-TRUST (ANTI-AI-BIAS AUDIT)

1. **Giả định ngầm sai lầm 1: "Các ô cùng nhóm màu luôn nằm liền kề nhau nên có thể nối cầu vật lý giữa các ô"**:
   - **Vạch trần thực tế**: Trong 8 nhóm màu, đa số nhóm màu bị kẹp giữa bởi các ô phi tài sản:
     - Nhóm Nâu: Ô 1 và Ô 3 kẹp Ô 2 (Cơ Hội).
     - Nhóm Đỏ: Ô 21 và Ô 23 kẹp Ô 22 (Cơ Hội).
     - Nhóm Vàng: Ô 27 và Ô 29 kẹp Ô 28 (Cấp Nước).
     - Nhóm Tím: Ô 37 và Ô 39 kẹp Ô 38 (HOSE).
   - **Hậu quả nếu làm cầu vắt ngang**: Sẽ che khuất tầm nhìn, che lấp quân cờ đỗ trên ô Cơ Hội / HOSE, gây bức xúc thị giác và lỗi click Raycaster.
   - **Giải pháp bắt buộc**: Tuyệt đối KHÔNG dựng cầu vắt ngang ô. Kết nối thị giác thông qua **Dải Huỳnh Quang Chân Đế (Emissive Plaza Trim)**, **Huy Hiệu Vương Miện Vàng (Crown Crest)** trên đỉnh ô, và **Dải Cờ Hoa Vỉa Hè Mép Trong (Inner Bunting)** men theo mép bàn cờ diorama.

2. **Giả định ngầm sai lầm 2: "Cứ gom đủ đất là bật âm thanh Fanfare liên tục mỗi khi re-render"**:
   - **Vạch trần thực tế**: Nếu không lưu trữ trạng thái trước đó (`lastKnownMonopolies`), mỗi lần component re-render hoặc F5 sẽ phát lại tiếng kèn ầm ĩ gây phiền toái.
   - **Giải pháp bắt buộc**: Chỉ phát `playMonopolyFanfare()` khi có sự kiện chuyển đổi trạng thái: Một nhóm màu mới vừa được xác lập độc quyền trong phiên hiện tại (`newlyCompletedGroup`).

3. **Giả định ngầm sai lầm 3: "Viết toàn bộ vào board_tile.tsx sẽ khiến file vượt trần 500 LOC"**:
   - **Vạch trần thực tế**: `board_tile.tsx` hiện đã 411 LOC. Nếu nhồi thêm logic độc quyền sẽ phá vỡ quy định kiến trúc (< 500 LOC).
   - **Giải pháp bắt buộc**: Tách thành 2 module mới độc lập:
     - `src/client/3d/monopoly_plaza_math.ts` (Pure Math, ~120 LOC).
     - `src/client/3d/monopoly_plaza_fusion.tsx` (Component 3D, ~180 LOC).

---

## 2. PHÂN TÍCH VẾT VA CHẠM (PRE-FLIGHT BLAST RADIUS AUDIT)

- **Cấp độ rủi ro**: `Slice-Bound` (Tầng trình diễn đồ họa 3D và âm thanh Client).
- **Vùng chạm trực tiếp (Direct Touch)**:
  1. `[NEW] src/client/3d/monopoly_plaza_math.ts`: Thuật toán pure math `detectPlayerMonopolies(playersInfo, mortgagedMap)` và `getMonopolyColorGroupCells(colorGroup)`.
  2. `[NEW] src/client/3d/monopoly_plaza_fusion.tsx`: Component render dải cờ hoa vỉa hè và huy hiệu vương miện trên các ô độc quyền.
  3. `[MODIFY] src/client/3d/board_tile.tsx`: Bổ sung prop `isMonopolyGroup?: boolean` vào `LayeredDioramaTile` để kích hoạt dải viền sáng hoàng kim chân đế.
  4. `[MODIFY] src/client/3d/board_layout.tsx`: Truyền prop `isMonopolyGroup` từ kết quả `detectPlayerMonopolies` và gắn `<MonopolyPlazaFusion />`.
  5. `[MODIFY] src/client/audio/pawn_tension_sound_recipes.ts`: Bổ sung công thức `synthesizeMonopolyFanfare`.
  6. `[MODIFY] src/client/audio/sound_engine.ts`: Bổ sung method `playMonopolyFanfare()`.
- **Tầng tiêu thụ hạ nguồn (Downstream Consumers)**:
  - FSM Server: 100% không đổi.
  - Heatmap Overlay: Phối hợp hài hòa (Heatmap đẩy intensity lên 1.4, bình thường ở 0.65).
- **Phương án phòng vệ xấu nhất (Worst-Case Defense)**:
  - Nếu không có người chơi nào độc quyền: Toàn bộ component trả về `null`, tiêu thụ 0 CPU/GPU.
  - Nếu âm thanh WebAudio bị chặn: Không throw error, đồ họa vẫn hiển thị mượt mà.

---

## 3. CHI TIẾT CÁC GÓI CÔNG VIỆC THỰC THI

### Gói 1: Thuật Toán Xác Định Độc Quyền (Monopoly Plaza Pure Math)
- File: `src/client/3d/monopoly_plaza_math.ts` (<= 150 LOC).
- Hàm `detectPlayerMonopolies(playersInfo, mortgagedProperties)`:
  - Duyệt qua 8 `ColorGroup` trong `BOARD_CONFIG`.
  - Một nhóm đạt độc quyền khi: Toàn bộ ô thuộc nhóm màu do cùng một `Player` sở hữu và không có ô nào nằm trong danh sách thế chấp (`mortgagedProperties`).
  - Trả về Record:
    ```ts
    export interface MonopolyGroupInfo {
      readonly colorGroup: ColorGroup;
      readonly ownerId: string;
      readonly ownerColor: string;
      readonly ownerName: string;
      readonly cells: readonly number[];
    }
    ```
- Hàm `isCellInMonopolyGroup(cellIndex, monopolyMap)`: Kiểm tra nhanh ô có thuộc nhóm độc quyền hay không.

### Gói 2: Dải Sáng Huỳnh Quang Lãnh Địa & Vương Miện Hoàng Gia (Plaza Trim & Crown Crest)
- Cập nhật `LayeredDioramaTile` trong `board_tile.tsx`:
  - Thêm prop `isMonopolyGroup?: boolean`.
  - Khi `isMonopolyGroup === true`:
    - `OwnerBaseTrim`: Kích hoạt `emissive = ownerColor`, `emissiveIntensity = isHeatmapActive ? 1.4 : 0.65`.
    - Thêm viền gờ hoàng kim `PlazaTrimGoldBorder` (`#F59E0B`, metalness 0.9, roughness 0.2) tạo cảm giác đế sa thạch mạ vàng sang trọng.
    - Đính kèm biểu tượng Vương Miện Vàng 3D (`MonopolyCrownCrest`) dập nổi trên dải màu đỉnh ô cờ.

### Gói 3: Dải Cờ Hoa Vỉa Hè Mép Trong (Inner Bunting Garland)
- File: `src/client/3d/monopoly_plaza_fusion.tsx` (<= 200 LOC).
- Với mỗi nhóm độc quyền:
  - Render dải cờ hoa mini giăng ở mép trong ô cờ (sát vỉa hè diorama tiếp giáp kênh sông và quảng trường).
  - Sử dụng hình nón/tam giác mini đan xen màu người chơi và màu vàng kim, không làm tăng Draw Calls đáng kể.

### Gói 4: WebAudio Synth Hoan Ca Độc Quyền (Monopoly Fanfare)
- File: `src/client/audio/pawn_tension_sound_recipes.ts`.
- `synthesizeMonopolyFanfare(ctx: AudioContext)`:
  - Tạo giai điệu kèn đồng 4 nốt rực rỡ: F4 (349.23Hz) ➔ A4 (440Hz) ➔ C5 (523.25Hz) ➔ F5 (698.46Hz) với hòa âm kèn brass ấm áp.
  - Tích hợp vào `SoundEngine.playMonopolyFanfare()`.
  - Kích hoạt khi phát hiện có nhóm độc quyền mới được thiết lập.

---

## 4. MA TRẬN KIỂM THỬ 4 DIỆN (UNIVERSAL 4-FACET BEHAVIORAL MATRIX)

| Facet | Kịch Bản Kiểm Thử | Trách Nhiệm Trạm 1 (`qa-tester`) |
|---|---|---|
| **1. Boundary** | `detectPlayerMonopolies` cho đủ 8 nhóm màu; xử lý nhóm 2 ô (Nâu, Tím) và nhóm 3 ô; ô vô chủ; ô bị thế chấp loại trừ khỏi độc quyền; nhiều người chơi cùng có độc quyền ở các nhóm khác nhau. | Test toàn diện logic toán học |
| **2. State Reactivity** | Khi đạt độc quyền: `isMonopolyGroup = true`, `emissiveIntensity` đạt 0.65 (hoặc 1.4 khi Heatmap active), vương miện và dải cờ hoa xuất hiện; mất độc quyền (do thế chấp/bán) thì hiệu ứng tự động biến mất. | Test phản ứng trạng thái và render |
| **3. Resource Disposal** | Khi không có monopoly hoặc component unmount: dọn dẹp bộ nhớ, không rò rỉ AudioContext hoặc instance meshes. | Test lifecycle và memory cleanup |
| **4. Error Defense** | `playersInfo` rỗng hoặc null không crash; `mortgagedProperties` undefined không throw; AudioContext bị block chạy fallback an toàn. | Test guard an toàn 100% |

---

## 5. KẾ HOẠCH BÀN GIAO THEO QUY TRÌNH 3 TRẠM

1. **Trạm 1 (RED Contract Test)**:
   - `qa-tester` tạo file `tests/client/imp125_phase3_monopoly_plaza_fusion.test.ts` (>= 30 atomic contract tests).
   - Chạy `npm test` chứng minh Business RED.
2. **Trạm 2 (GREEN Implementation)**:
   - `implementer` tạo `monopoly_plaza_math.ts`, `monopoly_plaza_fusion.tsx`, cập nhật `board_tile.tsx`, `board_layout.tsx`, `pawn_tension_sound_recipes.ts`, `sound_engine.ts`.
   - Đưa toàn bộ 30 tests thành GREEN 100%, bảo đảm toàn hệ thống 238 test suites PASS.
3. **Trạm 3 (Independent Spec Review & Physical Disk Verification)**:
   - `spec-reviewer` đối soát đĩa vật lý, snapshot `.agents/evidence/imp125-p3_snapshot.json`, kiểm tra LOC limits và phê duyệt xuất xưởng.
