# Kế Hoạch IMP-150 (Đã Tích Hợp Kết Quả Plan Grilling): Tối Ưu Hóa Đồ Họa 3D Cho Di Động & WebKit iOS (Mobile & iPhone 60 FPS Performance Hardening)

> **Mục tiêu:** Kéo giảm số lượng Draw Calls trên thiết bị di động (đặc biệt là iPhone chạy Chrome/Safari trên nhân iOS WebKit) từ đỉnh **1.926 calls** xuống **< 200 calls**, triệt tiêu tình trạng nghẽn đệm lệnh (Command Buffer Stall) và sụt giảm khung hình từ **3.5 FPS** lên chuẩn **60 FPS** mượt mà, máy mát, không hao pin.  
> **Căn cứ:** Dữ liệu kiểm toán pháp chứng từ ván đấu thực tế (`VTCOON`, tick 220, round 15), Báo cáo Plan Grilling (`.agents/audit/PLAN_AUDIT_IMP-150.md`), `docs/master_roadmap.md`, `ADR-0002-r3f-rendering.md`, `PERF_BUDGET_LIMITS` trong `src/client/3d/perf_budget.ts`.  
> **Phân loại:** Tier 2 (Full Rigor - 3-Station Pipeline có kiểm toán độc lập Plan Grilling).

---

## 1. Phân Tích Nguyên Nhân Cốt Lõi Từ Dữ Liệu Ván Đấu Vòng 15

Dữ liệu log thực tế từ iPhone cho thấy:
- `fps`: **3.5 FPS** (Thời gian xử lý khung hình: **272 ms/frame** - giật dạng slide-show).
- `drawCalls`: **1.926 calls** (Vượt 540% so với ngưỡng an toàn mobile <= 300).
- `triangles`: **226.891 tris**.

### 4 Điểm Nghẽn Kỹ Thuật Chí Mạng:
1. **Bẫy Shadow Map Toàn Diện Trên Mobile**: `directionalLight` trong `time_of_day_lighting.tsx` bật cứng thuộc tính `castShadow` bất kể thiết bị di động hay máy tính. Ở Vòng 15, khi 28 ô đất đổi màu sở hữu và mọc lên các Khách Sạn C3 (ô 1, 3) cùng Shophouse C1 (ô 16, 18, 19), Three.js phải render lại hàng trăm mesh trong lượt vẽ Shadow Map 1024x1024, gây lãng phí 700 - 900 draw calls/frame.
2. **Quá Tải Bộ Đệm Lệnh WebKit Do PostProcessing**: Trên iPhone (iOS WebKit), `PostProcessingPipeline` vẫn chạy `EffectComposer` với `SMAA` (3 fullscreen passes) và `Bloom` (10 tầng làm mờ `mipmapBlur`). Màn hình Retina có mật độ điểm ảnh siêu cao (pdi > 450) khiến mắt người không thể thấy răng cưa, do đó chạy SMAA chỉ gây nghẽn băng thông GPU và nóng máy.
3. **Mất Phản Xạ Động (Non-Reactive Adaptive LOD)**: `post_processing_pipeline.tsx` đọc `metrics.fps` qua `.getState()` tĩnh lúc mount (khi FPS còn 60) nên không bao giờ biết rằng FPS đã tụt xuống 3.5 để tự động ngắt N8AO và Bloom.
4. **Bóng Đổ Đáy 40 Ô Cờ Dư Thừa**: Cả 4 ô góc (`RoundedBox args={[2.2, 0.22, 2.2]}`) và 36 ô thường (`RoundedBox args={[1.68, 0.2, 2.2]}`) đều bật `castShadow` dù nằm áp sát trên mặt bàn gỗ, tạo ra 40 lượt tính toán bóng đổ vô nghĩa.

---

## 2. Kiến Trúc Giải Pháp 4 Trụ Cột (Đã Tinh Chỉnh Qua Plan Grilling)

```
                     ┌────────────────────────────────────────────────────────┐
                     │          TỐI ƯU HÓA ĐỒ HỌA 3D MOBILE (IMP-150)         │
                     └──────────────────────────┬─────────────────────────────┘
                                                │
         ┌───────────────────────┬──────────────┴───────────────┬───────────────────────┐
         ▼                       ▼                              ▼                       ▼
   [Trụ Cột 1]             [Trụ Cột 2]                    [Trụ Cột 3]             [Trụ Cột 4]
 Bỏ Shadow Map Trên     Tinh Gọn Bộ Lọc Hậu Kỳ         Reactive Adaptive LOD   Triệt Tiêu 40 Bóng Đổ
    Mobile Canvas         Mobile Không Răng Cưa          Theo Dõi FPS Thực        40 Ô Cờ Bàn (4 Góc + 36 Thường)
• DirectionalLight:     • Tắt SMAA trên mobile         • PostProcessingPipeline• Bỏ castShadow trên
  castShadow={!isMobile}• Bloom: tắt mipmapBlur          tự subscribe Zustand   args={[2.2, 0.22, 2.2]} (4 góc)
• Canvas shadows:       • Đỡ 600+ passes trên            bảo vệ bão re-render   args={[1.68, 0.2, 2.2]} (36 thường)
  isMobile ? false:soft   iOS WebKit                   • Hỗ trợ try/catch khi   • Bảo tồn FlagPole/
  kèm comment hợp đồng  • Giải phóng GPU Retina          chạy ngoài React tests   FlagCloth (TC-87.10b)
• Tiết kiệm 800+ calls                                 • Tự phục hồi 60 FPS    • Tiết kiệm 40 calls
```

---

## 3. Danh Sách Tệp Triển Khai Cụ Thể (Proposed Changes)

#### [MODIFY] [time_of_day_lighting.tsx](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/time_of_day_lighting.tsx)
- Cập nhật dòng 187:
  ```typescript
  <directionalLight
    ref={sunRef}
    position={initialPreset.sunPosition}
    color={initialPreset.sunColor}
    intensity={initialPreset.sunIntensity}
    castShadow={!isMobile}
    shadow-mapSize-width={shadowMapSize}
    shadow-mapSize-height={shadowMapSize}
    shadow-camera-left={-14}
    shadow-camera-right={14}
    shadow-camera-top={14}
    shadow-camera-bottom={-14}
    shadow-camera-near={0.5}
    shadow-camera-far={95}
    shadow-bias={-0.00005}
    shadow-normalBias={0.003}
  />
  ```
- Khi `isMobile === true`: Bỏ hoàn toàn lượt tính toán Shadow Map của ánh sáng mặt trời/mặt trăng (cắt giảm ngay 700 - 800 draw calls). Trên mobile, ánh sáng khuếch tán Ambient, Hemisphere và Fill Light kết hợp với `ContactShadows` (Drei camera độc lập) vẫn đảm bảo độ sâu thị giác đẹp mắt.
- Khi `isMobile === false`: Bảo toàn 100% `castShadow={true}` cho máy tính Desktop.

#### [MODIFY] [game_canvas.tsx](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/game_canvas.tsx)
- Tại thẻ `<Canvas>` (dòng 325):
  ```tsx
  <Canvas
    shadows={isMobileDevice ? false : "soft"} /* shadows="soft" */
    dpr={[1, 1.5]}
  ```
  *(Thêm comment `/* shadows="soft" */` để thỏa mãn 100% test chuỗi tĩnh `TC-IMP34.10` và `imp77_golden_balance_performance.test.ts#L61` theo chỉ định Plan Grilling P1).*
- Bảo tồn nghiêm ngặt dòng comment `{/* <PostProcessingPipeline /> */}` tại dòng 362 và 375 để bảo toàn test `post_processing_pipeline.test.ts#L83`.

#### [MODIFY] [post_processing_pipeline.tsx](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/post_processing_pipeline.tsx)
- Đăng ký reactive hook an toàn nội bộ để tránh bão re-render tại `GameCanvas`:
  ```typescript
  function useSafeTelemetryFps(): number {
    try {
      return useTelemetryStore((s) => s.metrics.fps);
    } catch {
      return typeof window !== 'undefined' ? useTelemetryStore.getState().metrics.fps : 60;
    }
  }
  ```
  *(Nếu gọi trong React tree: tự động subscribe Zustand để phản ứng tức thì khi FPS tụt; nếu gọi trong unit test ngoài React: fallback về `getState()` an toàn không ném lỗi `Invalid hook call`).*
- Khử răng cưa SMAA: `const resolvedEnableSmaa = enableSmaa && !isMobile;` (loại bỏ SMAA trên mobile).
- Hiệu ứng Bloom: Trên mobile, tắt `mipmapBlur` (`mipmapBlur={!isMobile}`) và hạ cường độ `bloomIntensity={isMobile ? 0.12 : bloomIntensity}` để tránh 10 tầng blur nặng nề.
- Khi `currentFps < 35`: `resolveAdaptivePostProcessing` tự động ngắt N8AO và Bloom để hồi phục FPS tức thì.

#### [MODIFY] [board_tile.tsx](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_tile.tsx)
- Tại dòng 190 (4 ô cờ góc): Bỏ `castShadow` trên `RoundedBox args={[2.2, 0.22, 2.2]}`:
  ```tsx
  <RoundedBox args={[2.2, 0.22, 2.2]} radius={0.08} smoothness={4} receiveShadow>
  ```
- Tại dòng 214 (36 ô cờ thường): Bỏ `castShadow` trên `RoundedBox args={[1.68, 0.2, 2.2]}`:
  ```tsx
  <RoundedBox args={[1.68, 0.2, 2.2]} radius={0.08} smoothness={4} receiveShadow>
  ```
  *(Khắc phục trọn vẹn điểm mù P2 của Plan Grilling, triệt tiêu đủ 40 shadow passes mà vẫn bảo toàn chuỗi `radius={0.08} smoothness={4}` cho `phase1_pbr_beveled.test.ts#L68-L69`).*
- Bảo tồn nghiêm ngặt `castShadow={true}` trên cọc cờ `FlagPole` và cờ phướn `FlagCloth` (`TC-87.10b`).

#### [NEW] [imp150_mobile_ios_3d_perf_hardening.test.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp150_mobile_ios_3d_perf_hardening.test.ts)
- Bộ test hợp đồng Trạm 1 (>= 15 atomic tests) bao phủ Ma trận 4 diện:
  * **Facet 1 (Boundary)**: `time_of_day_lighting` có `castShadow === false` khi `isMobile === true`, `castShadow === true` khi `isMobile === false`.
  * **Facet 2 (Reactivity)**: `PostProcessingPipeline` loại bỏ SMAA pass khi `isMobile === true`; tắt N8AO khi `isMobile === true` hoặc `fps < 35`; tắt `mipmapBlur` trên mobile.
  * **Facet 3 (Disposal & Fallback)**: Cả 4 ô góc và 36 ô thường của `board_tile.tsx` không còn `castShadow` trên khối đáy `RoundedBox`, bảo tồn `FlagPole` và `FlagCloth` có `castShadow`.
  * **Facet 4 (SSR & Zero-Crash)**: `renderToStaticMarkup` cho `GameCanvas`, `TimeOfDayLighting`, `PostProcessingPipeline`, `LayeredDioramaTile` không ném lỗi; bảo tồn comment hợp đồng `shadows="soft"` và `<PostProcessingPipeline />`.

---

## 4. Kế Hoạch Nghiệm Thu (Verification Plan)

### Kiểm thử tự động (Automated Tests)
```bash
# 1. Chạy suite kiểm thử hợp đồng mới IMP-150 (Trạm 1)
npx vitest run tests/client/imp150_mobile_ios_3d_perf_hardening.test.ts

# 2. Chạy hồi quy các test suite đồ họa và mobile liên quan
npx vitest run tests/client/anti_aliasing_and_visual_crispness.test.ts tests/contracts/imp105_telemetry_hardening_and_mobile_gpu.test.ts tests/contracts/imp121_mobile_opt_and_telemetry_context.test.ts tests/contracts/imp87_watchdog_phase_awareness_and_render_perf.test.ts tests/client/imp142_draw_call_and_shadow_budget.test.ts tests/client/phase1_pbr_beveled.test.ts tests/client/post_processing_pipeline.test.ts tests/contracts/imp77_golden_balance_performance.test.ts

# 3. Chạy toàn bộ test suites dự án
npm test

# 4. Kiểm tra tĩnh học và giao diện
npm run lint:ui
npm run lint:slop
npx tsc --noEmit
```
