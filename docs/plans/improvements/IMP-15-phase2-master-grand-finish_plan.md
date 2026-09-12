# KẾ HOẠCH CẢI TIẾN IMP-15: HOÀN THIỆN ĐỈNH CAO PHA 2 (3D FLIPPING EVENT CARD, GRAND CORONATION STAGE & FINTECH POLISH)

## 1. BỐI CẢNH & MỤC TIÊU CỐT LÕI
- **Tham chiếu nhiệm vụ:** Hoàn thiện toàn bộ 3 bước của **Pha 2 (Hoàn thiện đỉnh cao)**:
  1. **Bước 4: Thẻ Bài Cơ Hội / Khí Vận 3D Lật Không Gian (3D Flipping Event Card)**:
     - Nâng cấp modal sự kiện Cơ Hội & Khí Vận từ 2D phẳng thành Thẻ bài 3D hai mặt lật không gian thật trong Scene 3D (`src/client/3d/event_card_3d.tsx` và `src/client/3d/event_card_texture.ts`).
     - Mặt lưng thẻ: Hoa văn vân rồng / họa tiết trống đồng Đông Sơn mạ vàng Champagne trên nền ngọc bích sẫm (Cơ Hội) hoặc nhung đỏ sẫm (Khí Vận / Thị Trường).
     - Mặt chính thẻ: Nội dung sự kiện kinh tế/địa ốc, giá trị thưởng/phạt rõ nét, biểu tượng 3D dập nổi.
     - Hoạt ảnh lật thẻ vật lý $180^\circ$ mượt mà lơ lửng giữa bàn cờ (Anticipation ➔ Flip ➔ Reveal).
     - Hiệu ứng hạt ánh sáng hạt VFX phân loại theo tính chất sự kiện (Thẻ thưởng/cơ hội tốt: Bụi vàng phát quang; Thẻ phạt/tin xấu: Tia chớp cảnh báo tím/đỏ).
  2. **Bước 5: Lễ Đăng Quang Chiến Thắng & Vinh Danh Đại Gia (Grand Coronation 3D Stage & Trophy)**:
     - Nâng cấp màn hình kết thúc ván đấu (`src/client/ui/modals/game_over_modal.tsx` và `src/client/3d/coronation_3d_stage.tsx`):
     - Sân khấu vinh danh 3D: Bục quán quân mạ vàng với Cúp Vô Địch Đại Gia Địa Ốc 3D xoay hào quang dưới chùm Spotlight điện ảnh rực rỡ.
     - Pháo hoa chiến thắng bùng nổ liên tục chúc mừng người chiến thắng.
     - Thống kê tài chính FinTech: Bảng tổng kết tài sản ròng, danh mục sổ đỏ sở hữu, biểu đồ đường tiền mặt, tỷ suất sinh lời theo phong cách báo cáo tài chính chuyên nghiệp.
  3. **Bước 6: Chuẩn Hóa FinTech UX & Game Juice Toàn Diện (FinTech Polish & 60 FPS Guarantee)**:
     - Đồng bộ âm thanh xúc giác WebAudio Synth: tiếng lật thẻ bài rột rẹt ("Swish / Flip"), tiếng chuông đăng quang ngân vang khi chiến thắng (`sound_synth_recipes.ts`, `sound_engine.ts`, `audio_engine.ts`).
     - Thẩm mỹ Glassmorphism toàn diện: HUD, Modals và bảng điều khiển có độ mờ backdrop-blur đồng nhất, font chữ số tài chính monospace rõ nét.
     - Kiểm soát Draw Call Budget (<85 calls) và bộ đệm tam giác (<150k tris) duy trì 60 FPS cố định trên toàn bộ luồng chơi.

---

## 2. THIẾT KẾ KIẾN TRÚC & PHÂN RÃ MÔ ĐUN

```text
                     ┌──────────────────────────────────────────────┐
                     │          PHA 2: HOÀN THIỆN ĐỈNH CAO           │
                     └──────────────────────┬───────────────────────┘
                                            │
         ┌──────────────────────────────────┼──────────────────────────────────┐
         │                                  │                                  │
         ▼                                  ▼                                  ▼
   [BƯỚC 4: EVENT CARD 3D]       [BƯỚC 5: CORONATION STAGE]        [BƯỚC 6: FINTECH POLISH]
 ┌───────────────────────┐     ┌────────────────────────────┐    ┌───────────────────────────┐
 │ • event_card_texture  │     │ • coronation_3d_stage      │    │ • sound_synth_recipes     │
 │   - Mặt lưng Trống đồng│     │   - Bục vàng đa tầng       │    │   - synthesizeCardFlip    │
 │   - Mặt chính FinTech │     │   - Cúp Vô Địch kim cương  │    │   - coronationChime       │
 │ • event_card_3d       │     │   - Spotlight điện ảnh     │    │ • sound_engine / Audio    │
 │   - Hoạt ảnh 180° lật │     │   - Pháo hoa victory vfx   │    │ • Glassmorphism thống nhất│
 │   - Anticipate➔Flip   │     │ • game_over_modal          │    │ • Draw calls < 85         │
 │   - Bụi vàng / Tia tím│     │   - Bảng tài sản ròng      │    │ • Tris < 150k             │
 └───────────────────────┘     │   - Biểu đồ đường tài sản  │    │ • 60 FPS lock             │
                               │   - Danh mục sổ đỏ sở hữu  │    └───────────────────────────┘
                               └────────────────────────────┘
```

### Danh mục tệp triển khai:
1. `src/client/3d/event_card_texture.ts` (NEW, <= 220 LOC): Sinh Texture Canvas 2D HiDPI mặt lưng họa tiết Trống đồng Đông Sơn / Vân rồng kim loại vàng và mặt chính thẻ sự kiện sắc nét.
2. `src/client/3d/event_card_3d.tsx` (NEW, <= 350 LOC): Component 3D thẻ bài 2 mặt lơ lửng, chuyển động lật 180 độ theo trục Y, kết hợp hệ thống hạt bụi vàng hoặc tia chớp đỏ/tím.
3. `src/client/3d/coronation_3d_stage.tsx` (NEW, <= 380 LOC): Sân khấu đăng quang 3D với bục quán quân nhiều tầng, Cúp Vô Địch Địa Ốc xoay 360 độ, chùm spotlight đỉnh cao và pháo hoa victory liên tục.
4. `src/client/ui/modals/game_over_modal.tsx` (NEW, <= 380 LOC): Màn hình vinh danh và phân tích tài chính FinTech: Bảng tổng kết tài sản ròng, danh mục sổ đỏ theo nhóm màu, biểu đồ biến động tài sản mô phỏng, ROI.
5. `src/client/audio/sound_synth_recipes.ts` (MODIFY, <= 320 LOC): Bổ sung `synthesizeCardFlip` và `synthesizeCoronationChime`.
6. `src/client/audio/sound_engine.ts` (MODIFY, <= 300 LOC): Bổ sung `playCardFlip()` và `playCoronationChime()`.
7. `src/client/audio/audio_types.ts` & `audio_engine.ts` (MODIFY): Khai báo bổ sung SFX keys `CARD_FLIP` và `VICTORY_CHIME`.
8. `src/client/ui/modals/modal_host.tsx` (MODIFY): Tích hợp `GameOverModal` và đồng bộ cùng `EventCard3D`.
9. `src/client/game_canvas.tsx` (MODIFY): Render `EventCard3D` và `Coronation3DStage` trong không gian R3F.
10. `tests/client/event_card_3d.test.ts` (NEW): Kiểm thử unit & contract cho thẻ bài 3D, tính toán góc lật và texture generation.
11. `tests/client/coronation_3d_stage.test.ts` (NEW): Kiểm thử sân khấu vinh danh, cúp vô địch và pháo hoa.
12. `tests/client/fintech_game_over_modal.test.ts` (NEW): Kiểm thử modal kết thúc ván đấu, tính toán ROI và breakdown tài sản.

---

## 3. TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE)
1. TypeScript strict mode biên dịch 0 lỗi (`npx tsc --noEmit`).
2. Toàn bộ test suites tiếp tục PASS 100% không suy suyển (Zero Regression).
3. Tuân thủ Categorized File Limits (UI <= 500 LOC, Core <= 400 LOC, Helper <= 300 LOC).
4. Zero Dirty Casts (`strict: true`, không `as any`).
5. Âm thanh WebAudio phản hồi tức thì độ trễ 0ms.
6. Đo lường và chứng minh Draw Call Budget < 85 calls và bộ đệm tam giác < 150k tris.
7. Lập báo cáo nghiệm thu thực nghiệm `docs/reports/improvements/IMP-15-phase2-master-grand-finish_report.md` và cập nhật `docs/master_roadmap.md`.
8. Chụp ảnh kiểm chứng lưu tại `docs/reports/improvements/screenshots/`.
