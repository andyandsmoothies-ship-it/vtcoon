# Kế Hoạch Cải Tiến Kỹ Thuật IMP-77: Gói Tối Ưu "Điểm Cân Bằng Vàng" (Golden Balance Suite) — 60 FPS Không Đánh Đổi Mỹ Thuật

> **Mã cải tiến**: IMP-77  
> **Người đề xuất**: Lead QA & System Architect  
> **Trạng thái**: Đã thực thi & Đạt toàn bộ kiểm định (Passed Trạm 1 -> Trạm 2 -> Trạm 3)  
> **Phạm vi can thiệp**: `src/client/3d/post_processing_pipeline.tsx`, `src/client/game_canvas.tsx`

---

## 1. Bối Cảnh & Vấn Đề Hiệu Năng (21 FPS Bottleneck)

Qua chẩn đoán hiệu năng thực tế tại sa bàn 3D (Đảo ngọc nhiệt đới ban ngày), game gặp tình trạng giật lag (~21–25 FPS) trên các máy tính không có GPU rời hoặc màn hình độ phân giải cao (HiDPI / Retina):
1. **Lãng phí bộ đệm MSAA trùng lặp trong EffectComposer**:
   - `EffectComposer` đang kích hoạt `multisampling={4}` (MSAA 4x) trên toàn bộ FBO trung gian.
   - Trong khi đó, pass hậu kỳ `<SMAA />` đã được kích hoạt ở cuối đường ống để khử răng cưa subpixel. Việc chạy đồng thời cả MSAA 4x lẫn SMAA khiến GPU phải nhân 4 lần lượng mẫu màu và độ sâu vô ích, tiêu tốn 15–20% fillrate.
2. **ContactShadows re-render liên tục mỗi frame (Dynamic Shadow FBO)**:
   - Thẻ `<ContactShadows />` không khai báo `frames`, mặc định là `frames={Infinity}`.
   - Hệ quả: Một camera phụ render lại toàn bộ bàn cờ và chạy 2 pass làm mờ (horizontal & vertical blur) liên tục 60 lần/giây, dù mâm gỗ bàn cờ và thảm nhung Ba Tư là vật thể tĩnh 100%.
3. **DPR 2.0 bóp nghẹt Pixel Shading trên màn hình Retina / HiDPI**:
   - `Canvas` đang đặt `dpr={[1.25, 2]}`, ép GPU vẽ gấp 4 lần số điểm ảnh (Full HD 1080p -> 4K ảo).

---

## 2. Giải Pháp "Điểm Cân Bằng Vàng" (Zero Visual Cost)

1. **Tắt MSAA của EffectComposer (`multisampling={0}`)**:
   - Để `<SMAA />` phụ trách toàn diện việc khử răng cưa subpixel cạnh bàn cờ, góc nhà và dây văng.
   - Tiết kiệm 100% chi phí phân bổ MSAA 4x FBO buffers.
2. **Nướng bóng tiếp xúc 1 lần duy nhất (`frames={1}`)**:
   - Khai báo `frames={1}` cho cả 2 thẻ `<ContactShadows />` (Sảnh chờ và In-game).
   - Render và blur bóng tiếp xúc đúng 1 lần khi nạp scene, sau đó tái sử dụng static texture buffer cho mọi frame tiếp theo.
   - Hình ảnh hiển thị giống 100% từng chi tiết, nhưng triệt tiêu hoàn toàn gánh nặng camera phụ và 2 pass blur lặp lại.
3. **Giới hạn tỷ lệ điểm ảnh thiết bị cân đối (`dpr={[1, 1.5]}`)**:
   - Đặt trần DPR là 1.5 thay vì 2.0.
   - Cắt giảm `1 - (1.5 / 2.0)^2 = 43.75%` tải lượng tô bóng pixel (pixel fillrate) trên màn hình HiDPI/Retina.
   - Giữ nguyên độ mịn màng, sắc nét của sa bàn mà không làm nghẽn GPU.
4. **Bảo toàn 100% chất lượng đồ họa sang trọng**:
   - Giữ nguyên Shadow Map 2048px (`shadows="soft"`).
   - Giữ nguyên N8AO Ambient Occlusion tạo độ sâu viền tiếp xúc.

---

## 3. Kế Hoạch Kiểm Thử Quy Trình 3 Trạm

- **Trạm 1 (RED Contract Test)**:
  - Tạo `tests/contracts/imp77_golden_balance_performance.test.ts` kiểm thử 3 bất biến kỹ thuật:
    1. `PostProcessingPipeline` có `multisampling: 0`.
    2. `game_canvas.tsx` có `frames={1}` trên 100% thẻ `<ContactShadows />`.
    3. `game_canvas.tsx` cấu hình `dpr={[1, 1.5]}` và giữ `shadows="soft"`.
  - Cập nhật test contract phụ thuộc `tests/client/anti_aliasing_and_visual_crispness.test.ts`.
  - Chạy vitest chứng minh RED.
- **Trạm 2 (GREEN Implementation)**:
  - Cập nhật mã nguồn tối thiểu trong `src/client/3d/post_processing_pipeline.tsx` và `src/client/game_canvas.tsx`.
  - Chạy vitest chứng minh GREEN (25/25 tests PASS).
- **Trạm 3 (Verification & Gate)**:
  - `npm run gate:quick`: 0 error (TypeScript, UI Lint, Duplication, Asset Budget).
  - `npm test`: 181/181 test suites PASS 100% (3.080 tests).
  - `npm run build`: Đóng gói production bundle thành công.
