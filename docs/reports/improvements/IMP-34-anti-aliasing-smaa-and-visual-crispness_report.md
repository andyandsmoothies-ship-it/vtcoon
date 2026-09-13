# BÁO CÁO NGHIỆM THU CẢI TIẾN IMP-34
# KHỬ RĂNG CƯA SUBPIXEL SMAA, TIÊU CỰ SA BÀN TOÀN DIỆN & TỐI ƯU ĐỘ SẮC NÉT 3D

> **Mã số cải tiến:** IMP-34  
> **Ngày hoàn thành:** 13/09/2026  
> **Trạng thái:** ĐÃ DUYỆT & ĐẠT 100% GATES (Visual Critic 8.8/10, Spec Reviewer APPROVED)  
> **Kỹ sư triển khai:** Implementer & Orchestrator  
> **Kiểm thử tự động:** 19/19 tests PASS (`anti_aliasing_and_visual_crispness.test.ts`)  
> **Toàn bộ dự án:** 133/133 test suites PASS (1.666/1.666 tests PASS, 0 hồi quy)  

---

## 1. TỔNG QUAN KẾT QUẢ TRIỂN KHAI

Cải tiến IMP-34 giải quyết dứt điểm phản hồi của người dùng về hiện tượng răng cưa và mờ nhòe đường nét khi zoom trên mặt bàn cờ 3D:

1. **Khử Răng Cưa Subpixel Toàn Diện (SMAA Terminal Pass)**:
   - Tích hợp component `<SMAA />` từ `@react-three/postprocessing` đặt làm pass khử răng cưa cuối cùng sau Tone Mapping trong `EffectComposer`.
   - Khử sạch răng cưa bậc thang trên các đường chéo 45° của mép bàn cờ, dây văng cầu Landmark, cọc cờ Brass và góc khối công trình.

2. **Tiêu Cự Sa Bàn Toàn Diện (Panoramic DoF)**:
   - Mở rộng `dofFocusRange` từ 75.0 lên **160.0** (gấp hơn 2 lần) giúp toàn bộ 40 ô cờ từ trung tâm đến 4 góc đều nằm trọn trong vùng sắc nét tuyệt đối.
   - Giảm `dofBokehScale` từ 1.3 xuống **0.45**, triệt tiêu hiện tượng mờ nhòe rìa bàn cờ, chỉ giữ hiệu ứng tilt-shift mờ nhẹ ở các đỉnh núi xa ngoài vịnh biển.

3. **Triệt Tiêu Double Tone Mapping**:
   - Đổi `toneMapping: NoToneMapping` trên `<Canvas gl={{ ... }}>`, nhường quyền xử lý duy nhất cho `ToneMappingMode.AGX` trong chuỗi hậu kỳ. Khôi phục độ đanh chắc của dải tương phản, làm sáng rõ cẩm thạch trắng và viền khối.

4. **Bóng Đổ Mềm (PCFSoftShadowMap) & Mật Độ Điểm Ảnh Cao (DPR Floor 1.25)**:
   - Cấu hình Canvas `shadows="soft"`, làm mịn các đường biên bóng đổ.
   - Nâng sàn DPR `dpr={[1.25, 2]}`, loại bỏ hiện tượng vỡ hạt điểm ảnh khi zoom gần trên màn hình Full HD.

---

## 2. THÔNG SỐ KỸ THUẬT & NGÂN SÁCH

- **Kiểm thử tự động**: 19 atomic tests đạt chuẩn 5-Facet Behavioral Matrix.
- **Giới hạn số dòng mã (LOC)**:
  - `src/client/3d/post_processing_pipeline.tsx`: **136 LOC** (Trần 3D Logic: <= 400 LOC).
  - `src/client/game_canvas.tsx`: **359 LOC** (Trần UI: <= 500 LOC).
  - `tests/client/anti_aliasing_and_visual_crispness.test.ts`: **208 LOC** (Trần Test: <= 600 LOC).
- **Chất lượng mã nguồn**:
  - `npm run gate:quick`: 0 lỗi type, 0 lỗi cú pháp, 0 vi phạm anti-patterns.
- **Thẩm định mỹ thuật độc lập**:
  - `game-3d-visual-critic`: **8.8 / 10** (Commercial AAA Benchmark), `disposition: ship`.
  - `spec-reviewer`: **APPROVED 100%**.

---

## 3. BẤT BIẾN LƯU VÀO GOTCHAS.MD

- **Gotcha #54**: `[3D/GRAPHICS/POSTPROCESSING] Bất Biến Khử Răng Cưa Subpixel SMAA, Tiêu Cự Sa Bàn Toàn Diện & Triệt Tiêu Double Tone Mapping (Subpixel SMAA, Panoramic DoF & Single-Source Tone Mapping Invariant - IMP-34)`.
