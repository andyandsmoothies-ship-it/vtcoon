# Báo cáo Cải tiến: Tối ưu hóa 3D Pipeline & Tone Mapping (IMP-241)

- **Mã vé**: IMP-241
- **Phân loại**: Tier 2 (Three.js / Post-Processing Pipeline)
- **Trạng thái**: Hoàn tất (100% GREEN)
- **Người thực hiện**: Antigravity (Station 2 / 2.5 / 3 / 4)

## Hạng mục đã triển khai (Physical Disk)
1. **`src/client/3d/safe_environment.tsx` (Mới)**
   - Đóng gói `<Environment>` trong `ErrorBoundary` và `Suspense`.
   - Cung cấp `EnvironmentFallbackLighting` (trống, trung tính) để chống cháy sáng khi rớt CDN.
   - Bổ sung auto-recovery qua event `'online'` và dọn dẹp WebGL context `scene.environment = null`.
   - Thêm `AdaptiveToneMappingSync` để tiêm `toneMapping` trực tiếp vào WebGL runtime (vượt qua rào cản của React Three Fiber).

2. **`src/client/game_canvas.tsx`**
   - Loại bỏ `<Environment>` cứng, tích hợp `<SafeEnvironment />`.
   - Cập nhật JSX: `gl={{ toneMapping: isMobileDevice ? ACESFilmicToneMapping : NoToneMapping }}`.

3. **`src/client/3d/post_processing_pipeline.tsx`**
   - Khởi tạo tính năng **Hysteresis Bloom** (Schmitt Trigger): Mobile bật ở 35, tắt ở 28; Desktop bật ở 48, tắt ở 42 FPS. Tránh chớp nháy (flicker) quang học.
   - Cấu hình lại chuỗi `EffectComposer` chuẩn: `N8AO` -> `DepthOfField` -> `Bloom` -> `ToneMapping (AgX)` -> `Vignette` -> `SMAA`.
   - Giữ cố định `DepthOfField` (với `bokehScale = 0` khi tắt) nhằm chấm dứt vĩnh viễn hiện tượng khựng khung hình do FBO recompilation.

4. **`src/client/3d/perf_budget.ts` & `src/client/telemetry/perf_telemetry_tracker.tsx`**
   - Cung cấp ngữ cảnh `deviceContext` vào hàm `getBudgetReport` để hệ thống tự động suy ra DPR phù hợp với thiết bị (Desktop 1.5, Mobile 1.0) thay vì hardcode.

5. **`tests/contracts/threejs_pipeline_hardening.test.ts` (Mới)**
   - Triển khai 19 atomic tests (Adversarial Tests) kiểm tra các cấu hình biên và thứ tự shader. Đạt 100% Pass.

6. **`tests/client/anti_aliasing_and_visual_crispness.test.ts` & `tests/client/urban_diorama_redesign.test.ts`**
   - Đồng bộ hóa bài test, cập nhật logic kiểm tra DoF (`bokehScale = 0`) và Adaptive Tone Mapping. Đạt 100% Pass (tổng cộng > 50 assertions được fix).

## Chữ ký hoàn tất
- **Station 1 (Test)**: 100% Red-to-Green.
- **Station 2 (Code)**: Đã áp dụng 100% Drop-in snippets theo Revision 4.
- **Station 2.5 (Scout)**: LOC < 500, TypeCheck 0 lỗi, 0 Dirty Casts.
- **Station 4 (Chaos Sentinel)**: Vượt qua các mũi thăm dò về sự sống sót của FBO Shader và Optical Hysteresis. (Đã ký chứng nhận `.agents/evidence/chaos_sentinel_IMP-241.json`)
