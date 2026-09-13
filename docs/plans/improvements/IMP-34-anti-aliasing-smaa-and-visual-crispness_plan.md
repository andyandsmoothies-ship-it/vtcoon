# Kế Hoạch Kỹ Thuật IMP-34: Khử Răng Cưa Subpixel SMAA, Tinh Chỉnh DoF & Tối Ưu Độ Sắc Nét Sa Bàn 3D

## I. TỔNG QUAN & BỐI CẢNH (CONTEXT & ROOT CAUSES)

Người dùng phản ánh qua 5 ảnh chụp màn hình thực tế:
1. **Răng cưa (Aliasing / Jaggies)**: Các đường chéo trên mặt bàn cờ, cạnh ô đất, dây văng cầu, viền mái nhà, cọc cờ và bóng đổ bị răng cưa giật bậc thang pixel rõ rệt khi zoom.
2. **Đường nét vật thể chưa rõ ràng (Lack of Edge Definition & Crispness)**: Vật thể bị mờ mềm, thiếu độ tương phản khối, cảm giác như phủ một lớp sương mờ.

### Nguyên Nhân Gốc Rễ Đồ Họa:
1. **Bỏ quên pass khử răng cưa hậu kỳ (Lack of Post-processing Anti-Aliasing)**: Khi sử dụng `EffectComposer` (`@react-three/postprocessing`), WebGL vô hiệu hóa tính năng khử răng cưa phần cứng mặc định (`gl.antialias: true`) trên các FBO trung gian. Trong khi đó, `PostProcessingPipeline` hoàn toàn chưa tích hợp `<SMAA />` (Subpixel Morphological Anti-Aliasing).
2. **Xóa phông (Depth of Field - DoF) gây mờ nhòe bàn cờ**: DoF đang khóa cứng tiêu cự tại tâm `[0, 0, 0]` với độ cao buffer `height={480}` (480p). Khi người chơi nghiêng camera hoặc zoom vào các ô cờ ở cạnh bàn cờ, DoF áp kernel làm mờ (bokeh blur) lên các chi tiết, làm nhòe văn bản, số tiền và góc cạnh công trình.
3. **Hiện tượng Double Tone Mapping**: `<Canvas>` đang cấu hình `toneMapping: ACESFilmicToneMapping` trong khi `EffectComposer` lại cấu hình `<ToneMapping mode={ToneMappingMode.AGX} />`, dẫn đến việc xử lý dải tương phản 2 lần, làm bợt màu và mất độ tương phản viền sắc nét.
4. **Bóng đổ bậc thang (Hard Shadow Jagged Edges)**: `<Canvas shadows>` mặc định sử dụng `PCFShadowMap` tạo bóng đổ răng cưa pixel trên diện tích sa bàn rộng 28m x 28m.
5. **DPR (Device Pixel Ratio) bị trần 1.0 trên màn hình thông thường**: `dpr={[1, 2]}` khiến màn hình Full HD 1080p chỉ render ở tỷ lệ 1x, lộ rõ lưới pixel thô.

---

## II. SƠ ĐỒ LUỒNG ĐỒ HỌA TRƯỚC VÀ SAU CẢI TIẾN

```
TRƯỚC CẢI TIẾN:
[Scene 3D] ──> [FBO Render (MSAA bị tắt)] ──> [DoF (Mờ 480p ngoài tâm)] ──> [ToneMapping kép] ──> [Màn hình: Răng cưa + Nhòe]

SAU CẢI TIẾN (IMP-34):
[Scene 3D (PCFSoftShadowMap + dpr 1.25..2.0)]
       │
       ▼
[Canvas gl: NoToneMapping (Triệt tiêu xử lý màu kép)]
       │
       ▼
[EffectComposer: N8AO (Tăng độ đanh khối contact crease)]
       │
       ▼
[DoF Cân Chỉnh (Mở rộng focusRange 160.0 / Giảm bokehScale 0.45 để giữ nét bàn cờ)]
       │
       ▼
[Single AgX ToneMapping (Dải tương phản điện ảnh chuẩn)]
       │
       ▼
[SMAA Pass (Khử răng cưa vector subpixel sắc lẹm)] ──> [Màn hình: Nét căng, bóng mịn, sạch răng cưa]
```

---

## III. CHI TIẾT THAY ĐỔI MÃ NGUỒN (PROPOSED CHANGES)

### 1. Đường Ống Hậu Kỳ: `PostProcessingPipeline`

#### [MODIFY] [`src/client/3d/post_processing_pipeline.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/post_processing_pipeline.tsx)
- Import `<SMAA />` từ `@react-three/postprocessing`.
- Đặt `<SMAA />` ở cuối `EffectComposer` làm chốt chặn khử răng cưa subpixel toàn diện cho mọi đường nét hình học và highlight.
- Cân chỉnh `DepthOfField`:
  - Mở rộng `dofFocusRange` mặc định từ 75.0 lên 160.0 để toàn bộ mặt bàn cờ 40 ô nằm trọn trong vùng nét căng.
  - Giảm `dofBokehScale` từ 1.3 xuống 0.45 để hiệu ứng tilt-shift chỉ làm mờ nhẹ các ngọn núi xa tít ngoài biển, không làm mờ bất kỳ ô cờ hay công trình nào.
- Cân chỉnh `N8AO`:
  - Tăng nhẹ `aoIntensity` (1.35) và tối ưu `aoRadius` (0.85) để tạo đường viền tiếp xúc khối đanh chắc giữa chân nhà, cọc cờ và mặt ô cờ.
- Đảm bảo giữ vững trần LOC: 136 LOC (<= 400 LOC 3D logic).

---

### 2. Canvas & Render Engine: `GameCanvas`

#### [MODIFY] [`src/client/game_canvas.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/game_canvas.tsx)
- Khắc phục Double Tone Mapping:
  - Trong `gl={{ ... }}`, chuyển `toneMapping: NoToneMapping` để nhường toàn quyền xử lý màu sắc điện ảnh cho `ToneMapping AgX` trong `PostProcessingPipeline`.
- Bật bóng đổ mềm cao cấp:
  - Cấu hình `shadows="soft"` (Three.js `PCFSoftShadowMap`) thay vì bóng cứng mặc định `shadows={true}`.
- Tối ưu `dpr`:
  - Điều chỉnh `dpr={[1.25, 2]}` trên môi trường có GPU để tăng mật độ điểm ảnh lên tối thiểu 1.25x trên màn Full HD, triệt tiêu hoàn toàn hiện tượng pixelation khi zoom.
- Đảm bảo giữ vững trần LOC: 359 LOC (<= 500 LOC UI component).

---

### 3. Tập Kiểm Thử Hợp Đồng (Contract Tests)

#### [NEW] [`tests/client/anti_aliasing_and_visual_crispness.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/anti_aliasing_and_visual_crispness.test.ts)
- 19 atomic assertions bảo vệ 5 khía cạnh:
  - SMAA post-processing integration & terminal position.
  - DoF `focusRange >= 150.0` và `bokehScale <= 0.6`.
  - Soft shadows (`shadows="soft"`) & `NoToneMapping`.
  - DPR floor >= 1.25 và ceiling >= 2.0.
  - State reactivity & resource disposal khi disable các pass.
