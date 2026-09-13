# [IMP-40] Báo Cáo Nghiệm Thu Triệt Tiêu Phản Quang Lóa Mặt Nước & Cân Bằng Ánh Sáng Dịu Mắt (Anti-Glare Specular & Gentle Daylight)

## 1. TỔNG QUAN KẾT QUẢ THỰC HIỆN

| Chỉ số | Mục tiêu / Đặc tả | Kết quả thực tế | Trạng thái |
| :--- | :--- | :--- | :---: |
| **Phản quang mặt nước (Sông & Biển)** | Triệt tiêu 100% đốm chói gương, chuyển sang Toy Diorama Matte Water | `roughness = 0.75 - 0.80`, `metalness = 0.02` | ✔️ ĐẠT |
| **Quầng sáng Bloom** | Chỉ phát quang đèn đêm/laser, không lóa thẻ cờ & nước ban ngày | `bloomThreshold: 2.5`, `bloomIntensity: 0.20` | ✔️ ĐẠT |
| **Cường độ nắng ban ngày (Daylight)** | Ánh sáng ban ngày dịu mắt, ấm áp tự nhiên | `sunIntensity: 0.92`, `ambientIntensity: 0.18`, `hemiIntensity: 0.14` | ✔️ ĐẠT |
| **Đèn phụ (Fill & Rim Lights)** | Tách khối mềm mại, không tranh chấp nguồn sáng | `fillIntensity = 0.12`, `rimIntensity = 0.12` | ✔️ ĐẠT |
| **Phơi sáng dải tương phản (Exposure)** | Chống cháy sáng highlight (white clipping) | `toneMappingExposure: 0.94` | ✔️ ĐẠT |
| **Nền thẻ cờ giấy ngà cổ ấm** | Dịu mắt, tương phản cao với chữ đanh nét | `ctx.fillStyle = '#F3EEDF'` (thay thế `#F8F5EE`) | ✔️ ĐẠT |
| **Bộ kiểm thử hợp đồng IMP-40** | >= 15 atomic tests theo Ma trận 4 khía cạnh | 17 / 17 tests PASS (`imp40_anti_glare_and_gentle_daylight.test.ts`) | ✔️ ĐẠT |
| **Toàn bộ hệ thống test dự án** | >= 138 test suites | 148 / 148 test suites PASS (2.041 tests) | ✔️ ĐẠT |
| **Chất lượng mã nguồn & Linter** | 0 lỗi TypeScript, 0 UI anti-patterns | 0 lỗi linter, 0 vi phạm gate:quick | ✔️ ĐẠT |

---

## 2. BẰNG CHỨNG THỰC TẾ & NGHIỆM THU DOCKER LIVE

- **Docker Container**: Container `vtcoon-vtcoon-1` đã được rebuild (`docker compose build vtcoon`) và restart phục vụ trực tiếp tại `http://localhost:3000/`.
- **Ảnh chụp live nghiệm thu**: `docs/reports/improvements/screenshots/imp40_anti_glare_verified.jpg` chứng minh:
  - Đốm phản quang chói lóa trên sông Sài Gòn (giữa Long Thành và Cầu Ba Son) đã biến mất 100%, trở thành mặt nước ngọc bích êm đềm, đậm chất sa bàn đồ chơi cao cấp.
  - Toàn bộ 40 ô cờ với nền giấy ngà cổ `#F3EEDF` hiển thị dịu mắt, chữ tiêu đề viền đen than đanh chắc, giá tiền vàng hổ phách nổi bật.
  - Ánh sáng tổng thể hài hòa, no màu, không còn cảm giác chói gắt hay bợt trắng.

---

## 3. ĐÁNH GIÁ ĐỘC LẬP TỪ CÁC CHUYÊN GIA (TRẠM 3)

### Game 3D Visual Critic (`game-3d-visual-critic`)
- **Điểm số**: **9.2 / 10**
- **Phán quyết**: **DISPOSITION: ship**
- **Nhận xét chuyên môn**:
  > *"Hiện tượng đốm phản quang chói lóa trên mặt nước sông Sài Gòn đã được triệt tiêu 100%. Nước sông chuyển sang chất liệu nhung ngọc bích êm đềm đúng tinh thần sa bàn diorama. Tone mapping exposure 0.94 và sun intensity 0.92 đưa tổng thể bàn cờ về độ sáng ban ngày tự nhiên, không còn chói lóa. Nền thẻ cờ giấy ngà #F3EEDF đem lại độ tương phản tuyệt vời cho typography và tranh di sản. Đạt chuẩn phát hành thương mại cao cấp."*

### Spec Reviewer (`spec-reviewer`)
- **Phán quyết**: **APPROVED (100%)**
- **Nhận xét chuyên môn**:
  > *"Ticket IMP-40 đã vượt qua Cổng 1 (Spec Reconciliation Gate). Toàn bộ 12 tiêu chí kỹ thuật đạt chuẩn 100%. Mã nguồn, kế hoạch thực thi và bộ kiểm thử hợp đồng đã đạt sự nhất quán tuyệt đối 3 chiều (Implementation <-> Plan <-> SSOT), không còn bất kỳ dấu hiệu gian lận test hay che giấu lỗi runtime nào."*

---

## 4. CHI TIẾT CÁC TỆP MÃ NGUỒN ĐÃ CHỈNH SỬA

1. `src/client/3d/diorama/diorama_terrain.tsx`: Sông Sài Gòn đặt `roughness: 0.80`, `metalness: 0.02`.
2. `src/client/3d/centerpiece_water.tsx`: `WATER_MATERIAL_PROPS` đặt `roughness: 0.75`, `metalness: 0.02`.
3. `src/client/3d/coastal_island_environment.tsx`: Mặt biển đặt `roughness: 0.75`, `metalness: 0.02`.
4. `src/client/3d/post_processing_pipeline.tsx`: `bloomThreshold: 2.5`, `bloomIntensity: 0.20`.
5. `src/client/store/environment_store.ts`: Preset `day` đặt `sunIntensity: 0.92`, `ambientIntensity: 0.18`, `hemiIntensity: 0.14`.
6. `src/client/3d/time_of_day_lighting.tsx`: Xuất bản hàm `calculateBaseFill(phase)` và `calculateBaseRim(phase)` trả về `0.12` cho ban ngày, tích hợp vào `useSafeFrame` lerp.
7. `src/client/game_canvas.tsx`: `toneMappingExposure: 0.94`.
8. `src/client/3d/tile_texture_generator.ts`: Đổi màu nền thẻ cờ thường sang `#F3EEDF`.

---

## 5. CÁC ĐIỂM KHẮC PHỤC TRONG ĐỢT TÁI THẨM ĐỊNH (RE-REVIEW)

1. **Lỗi Runtime Lerp Fill/Rim Light**: Phát hiện hàm lerp trong `time_of_day_lighting.tsx` nội suy lên giá trị cũ 0.22. Đã xuất bản và tích hợp `calculateBaseFill` / `calculateBaseRim` đảm bảo giá trị 0.12 duy trì ổn định 60 FPS.
2. **Đồng bộ SSOT Thẻ Góc**: Cập nhật plan giải trình rõ việc bảo toàn theme sẫm tương phản cao cho 4 ô góc đặc biệt (GO: `#0F172A`, Trạm Kiểm Toán: `#1E1B4B`, Nghỉ Dưỡng: `#064E3B`, Thanh Tra Thuế: `#450A0A`).
3. **Triệt tiêu Smuggled Regex Test**: Xóa bỏ các test đọc file regex tĩnh; thay thế bằng việc import và gọi trực tiếp các hàm domain tính toán runtime.
4. **Loại bỏ Static Checklist Assertions**: Chuyển đổi các bài kiểm tra `getTileTexture` sang assert hành vi canvas thực tế (`recordedStrokeTexts`, `recordedStrokeRects`, `recordedFillTexts`).

---

## 6. BẤT BIẾN ĐƯỢC GHI NHẬN

- Gotcha #61 trong `docs/domain/gotchas.md`: `[3D/MATERIAL/LIGHTING] Bất Biến Triệt Tiêu Phản Quang Mặt Nước, Bloom Lóa Mắt & Cân Bằng Nắng Dịu Dải Tương Phản Đầm (Toy Diorama Velvet Water & Anti-Glare Invariant - IMP-40)`.
