# [IMP-39] Tối Ưu Độ Sắc Nét, Ánh Sáng & Khả Năng Đọc Thẻ Cờ (Theo Reference Retropoly & Monopoly Plus)

## 1. MỤC TIÊU & BỐI CẢNH
- **Hiện trạng**: Giao diện thẻ cờ bị nhòe, mờ ảo, mất nét ở góc nhìn tổng quan, chỉ nhìn rõ khi zoom sát.
- **Nguyên nhân cốt lõi**:
  1. `generateMipmaps = false` và `LinearFilter` khiến WebGL vô hiệu hóa Anisotropy 16x, bỏ qua 95% texel khi thu nhỏ.
  2. Camera `overview` cự ly xa (24.5m) với góc nghiêng thấp 37° làm nén phối cảnh 40%, diện tích thẻ chỉ còn 90x75 px, chữ chỉ cao 4-8 px.
  3. Bộ lọc hậu kỳ SMAA làm nhòe viền chữ 1px; ToneMapping AgX làm phẳng tương phản.
  4. Ánh sáng vàng ám `#FEF08A` làm thẻ kem `#EDE5D8` bị bạc màu trên nền cát.
- **Chuẩn tham chiếu**:
  - Reference 1: Retropoly (Isometric ~48°, bàn cờ chiếm ~80% khung hình, ánh sáng trong trẻo, bóng đổ sắc sảo).
  - Reference 2: Monopoly Plus (Top-Down hoặc góc nghiêng cao, chữ đen đanh trên nền sáng ngà, viền phân cách đen tuyền).

---

## 2. KIẾN TRÚC GIẢI PHÁP 4 TẦNG

```text
[Tầng 1: Texture Engine]
  • Bật generateMipmaps = true + LinearMipmapLinearFilter + Anisotropy 16x.
  • Double Draw viền đen lineWidth = 2.5px cho tiêu đề chính.
  • Viền bao quanh ô cờ stroke đen đanh #0F172A dày 5px.

[Tầng 2: Camera Calibration]
  • Góc nâng camera ~48°-50° (Tọa độ overview: [11.2, 15.6, 11.2], target: [-0.6, 0.0, -0.6], fov: 40).
  • Bàn cờ chiếm 78%-82% khung hình, giảm 65% độ méo phối cảnh.

[Tầng 3: Post-Processing & Tone Mapping]
  • Bloom threshold = 1.25 (chống lóa mặt thẻ).
  • Kiểm soát toneMappingExposure = 1.05.

[Tầng 4: Lighting Balance]
  • Ánh sáng mặt trời tinh khiết #FFFDF5, triệt tiêu sắc vàng ám.
  • Tăng độ tương phản giữa bàn cờ và bàn gỗ óc chó / cát đảo.
```

---

## 3. LỘ TRÌNH QUY TRÌNH 3 TRẠM (MANDATORY 3-STATION IMPLEMENTATION)

1. **Trạm 1 (RED Contract Test)**:
   - Viết test suite mới `tests/client/imp39_visual_crispness_and_lighting.test.ts` kiểm thử 4 khía cạnh hành vi:
     - Mipmap generation & LinearMipmapLinearFilter & Anisotropy 16x.
     - Double-draw strokeText cho tiêu đề chính.
     - Cấu hình Camera overview góc nâng mới [11.2, 15.6, 11.2].
     - Ánh sáng ban ngày trong trẻo #FFFDF5.
   - Chạy test để xác nhận BÁO ĐỎ (Adversarial Inversion).
2. **Trạm 2 (GREEN Implementation)**:
   - Cập nhật `src/client/3d/tile_texture_generator.ts`.
   - Cập nhật `src/client/3d/camera_state_machine.ts`.
   - Cập nhật `src/client/store/environment_store.ts` và `src/client/3d/time_of_day_lighting.tsx`.
   - Cập nhật `src/client/game_canvas.tsx` và `src/client/3d/post_processing_pipeline.tsx`.
   - Cập nhật các test suite cũ để đồng bộ.
   - Chạy toàn bộ test đảm bảo XANH 100%.
3. **Trạm 3 (Independent Review & Verification)**:
   - Thẩm định độc lập 2 Cổng: Spec Integrity & Code Quality.
   - Chụp ảnh màn hình nghiệm thu live 1920x1080.
   - Cập nhật tài liệu `docs/master_roadmap.md`, `docs/reports/improvements/IMP-39-visual-crispness-and-overview-legibility-alignment_report.md` và `docs/domain/gotchas.md`.
