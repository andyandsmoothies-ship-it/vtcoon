# KẾ HOẠCH CHI TIẾT CẢI TIẾN: IMP-80

## 1. TỔNG QUAN NHIỆM VỤ (TASK OVERVIEW)
- **Tên nhiệm vụ**: Tối Ưu Chiếu Sáng Ban Ngày Khi Phóng To, Bảng Màu Đảo Nhiệt Đới Chuẩn Retropoly & Đồng Nhất Phông Chữ Trắng Sổ Đỏ (Daylight Zoom Illumination, Retropoly Natural Island Palette & Unified Title Deed Typography).
- **Mã định danh**: `IMP-80`
- **Mục tiêu cốt lõi**:
  1. Khắc phục triệt để hiện tượng khi zoom cận cảnh vào bàn cờ ở chế độ Ban ngày bị tối sầm, bóng đổ đen kịt làm mất chi tiết chữ và mô hình.
  2. Triệt tiêu hoàn toàn mảng màu vàng mù tạt (`#FDE68A`) giả tạo bao quanh bàn cờ khi zoom xa; thay thế bằng dải cát ngà mịn tự nhiên (`#EFE5D8`) kết hợp thảm cỏ xanh nhiệt đới mướt mát (`#22C55E` / `#16A34A`), biển ngọc bích trong lành chuẩn phong cách diorama Retropoly (`media_1789473739974.jpg`).
  3. Đồng nhất 100% phông chữ tiêu đề trên dải màu 28 Thẻ Sổ Đỏ (Title Deed Banners) thành chữ TRẮNG IN ĐẬM (`#FFFFFF`) có viền than đậm sắc nét (`#0F172A`), triệt tiêu hiện tượng chữ đen kỳ lạ trên ô Bình Định / Hải Phòng.

---

## 2. KIỂM TOÁN TÁC ĐỘNG & BÁN KÍNH ẢNH HƯỞNG (PRE-FLIGHT BLAST RADIUS AUDIT)
- **Mức độ rủi ro**: `Slice-Bound` (Tập trung hoàn toàn vào tầng đồ họa 3D, chiếu sáng môi trường, hậu kỳ và tạo texture Canvas).
- **Tệp chỉnh sửa trực tiếp**:
  1. `src/client/3d/tile_texture_generator.ts`: Chuẩn hóa `getBannerTextColor` và quy chuẩn vẽ chữ trắng viền than đanh thép cho 100% ô BĐS.
  2. `src/client/store/environment_store.ts`: Tối ưu tham số `TIME_OF_DAY_PRESETS.day` (`ambientIntensity = 0.20`, `hemiIntensity = 0.14`, `hemiGroundColor = '#DCFCE7'`).
  3. `src/client/3d/time_of_day_lighting.tsx`: Tinh chỉnh màu Rim Light ban ngày thành trắng nắng mát (`#F8FAFC`), bổ sung nguồn sáng khuếch tán đỉnh đầu (`daylight top-down fill`) xóa tan bóng đen khi zoom.
  4. `src/client/3d/coastal_island_environment.tsx`: Thay thế màu cát `#FDE68A` bằng cát ngà mịn tự nhiên `#EFE5D8`, bổ sung cao nguyên cỏ xanh nhiệt đới `#22C55E` viền quanh bàn cờ.
  5. `src/client/3d/post_processing_pipeline.tsx`: Hạ dịu độ gắt Ambient Occlusion (`aoIntensity = 0.38`, `aoColor = '#1E293B'`) để chống nuốt sáng khi zoom cận cảnh.
- **Tệp kiểm thử ảnh hưởng**:
  - `tests/client/tile_text_crispness_and_overview_legibility.test.ts`: Cập nhật TC-IMP38.01b từ chữ đen sang chữ trắng đồng nhất.
  - `tests/contracts/imp80_daylight_illumination_and_unified_tile_art.test.ts`: Tạo mới bộ kiểm thử hợp đồng >= 15 ca kiểm thử.
- **Phòng vệ rủi ro tối đa**:
  - Giữ vững 100% ràng buộc kiểm thử IMP-71 và IMP-40: `ambientIntensity <= 0.20`, `hemiIntensity <= 0.14`, `sunIntensity >= 0.75 && <= 0.95`.
  - Giữ nguyên `getBannerTextColor('#FFFDF5') === '#090D1A'` và `getBannerTextColor('#0284C7') === '#FFFFFF'`.

---

## 3. NGUYÊN NHÂN GỐC RỄ & GIẢI PHÁP KỸ THUẬT (ROOT CAUSE & ENGINEERING DIRECTIVES)

### Vấn đề 1: Zoom cận cảnh bị tối sầm (Dark When Zoomed-In)
- **Nguyên nhân**:
  1. Hiệu ứng `N8AO` (Screen-space Ambient Occlusion) cấu hình cường độ `aoIntensity = 0.60` với màu `#0B0F19` (đen thuần). Khi zoom gần, khoảng cách giữa các đỉnh hình học co hẹp trong camera frustum khiến SSAO nhân hệ số tối vào toàn bộ bề mặt ô cờ.
  2. Ánh sáng tán xạ `ambientIntensity = 0.18` và nguồn bù sáng vịnh biển `fillRef = 0.12` quá thấp, không bù đủ sáng cho mặt dải màu và con cờ khi đi vào vùng khuất nắng của mặt trời `[-22, 36, 20]`. Kết hợp bộ lọc màu `ToneMappingMode.AGX` nén dải tương phản làm cho các vùng thiếu sáng biến thành màu xám đục.
- **Giải pháp**:
  1. Hạ dịu `DEFAULT_PIPELINE_CONFIG.aoIntensity` về `0.38` (vẫn đạt độ sâu chân cọc và công trình mà không làm đen mặt thẻ); chuyển màu AO thành than chàm dịu `#1E293B`.
  2. Nâng `ambientIntensity` ban ngày lên `0.20` (ngưỡng tối đa cho phép của hợp đồng IMP-71).
  3. Bổ sung nguồn sáng bù dịu từ thiên đỉnh `<directionalLight position={[0, 30, 0]} intensity={0.25} color="#F8FAFC" />` kích hoạt trong chế độ ban ngày, đảm bảo zoom ở bất kỳ góc nào ô cờ cũng sáng rõ như bàn cờ thật dưới ánh sáng ban ngày.

### Vấn đề 2: Zoom xa ngập tràn màu vàng mù tạt (Excessive Gold Hue In Overview)
- **Nguyên nhân**:
  1. Trong `coastal_island_environment.tsx`, bờ cát bao quanh bàn cờ gồm nhiều tầng hình trụ (`args={[15.6, 18.5, 0.24]}` và `args={[27.8, 28.85, 0.28]}`) đều mang màu `#FDE68A` (vàng chanh / mù tạt), tạo thành chiếc "bánh donut màu vàng rực" nuốt chửng toàn bộ rìa bàn cờ.
  2. Trong `environment_store.ts`, `hemiGroundColor` là `#FEF3C7` (vàng ấm), và trong `time_of_day_lighting.tsx`, Rim Light ban ngày có màu `#FEF08A` (vàng rực), hắt một dải quang sai màu vàng chói lóa lên mặt nước và đảo.
- **Giải pháp**:
  1. Chuyển toàn bộ vật liệu cát sang bảng màu cát ngà nhiệt đới tự nhiên: Cát bờ trên `#EFE5D8`, dải cát ướt tiếp giáp biển `#E8DEC8`, triệt tiêu hoàn toàn màu vàng mù tạt.
  2. Bổ sung một cao nguyên cỏ xanh nhiệt đới bao quanh bàn cờ (`#22C55E` / `#16A34A` với bán kính 15.6m đến 17.6m), tái hiện đúng cảnh quan khu nghỉ dưỡng ven biển nhiệt đới trong ảnh reference Retropoly.
  3. Đổi Rim Light ban ngày từ màu vàng `#FEF08A` sang màu trắng nắng trong trẻo `#F8FAFC`, và `hemiGroundColor` sang màu phản xạ thảm cỏ/biển `#DCFCE7`.

### Vấn đề 3: Phông chữ đen kỳ lạ trên ô cờ (Black vs White Text Inconsistency)
- **Nguyên nhân**:
  1. Trong `tile_texture_generator.ts`, hàm `getBannerTextColor` tính `luminance > 0.60`. Ô màu Cam `#FF8C42` (Bình Định) có luminance = 0.65, ô Vàng `#F1C40F` (Hải Phòng) có luminance = 0.74 ➔ trả về `#090D1A` (chữ đen).
  2. Khi vẽ tiêu đề, mã nguồn thực hiện lệnh `ctx.strokeText` với nét viền đen `#050814` dày 3.5px, sau đó đè `ctx.fillText` màu đen `#090D1A`. Kết quả là chữ đen bị viền đen bọc quanh, biến thành một khối mực đen xì thô kệch, tương phản kỳ quặc so với các ô chữ trắng bên cạnh.
- **Giải pháp**:
  1. Nâng ngưỡng `luminance > 0.85` trong `getBannerTextColor`. Nhờ đó:
     - Toàn bộ 8 nhóm màu BĐS (Nâu, Xanh nhạt, Hồng, Cam, Đỏ, Vàng, Xanh lá, Xanh đậm) đều có luminance <= 0.75 ➔ trả về `#FFFFFF` (chữ trắng đồng nhất 100%).
     - Nền ngà trắng sáng đặc thù (`#FFFDF5`) vẫn trả về `#090D1A` (bảo toàn hợp đồng kiểm thử IMP-71).
  2. Chuẩn hóa nét vẽ chữ trên dải màu: Chữ trắng in đậm font `900 28px` kèm nét viền sắc nét than đậm `ctx.strokeStyle = '#0F172A'` (lineWidth = 3.0), tạo độ tương phản đanh thép, tinh xảo tuyệt đối trên mọi nền màu.

---

## 4. QUY TRÌNH 3 TRẠM (MANDATORY 3-STATION PIPELINE)

### Trạm 1: RED Contract Test (`qa-tester`)
- Tạo tệp kiểm thử hợp đồng: `tests/contracts/imp80_daylight_illumination_and_unified_tile_art.test.ts`.
- Bao gồm tối thiểu 15 atomic tests theo Universal 4-Facet Behavioral Matrix:
  - **Facet 1 (Typography Consistency)**: Khẳng định 100% các ô BĐS (kể cả ô 16 Bình Định, ô 26 Hải Phòng) đều nhận màu chữ tiêu đề `#FFFFFF`.
  - **Facet 2 (Lighting Boundaries)**: Khẳng định `TIME_OF_DAY_PRESETS.day` tuân thủ các ngưỡng độ sáng êm dịu, không rò rỉ ánh vàng (`hemiGroundColor` không chứa sắc vàng).
  - **Facet 3 (Natural Sand & Island Palette)**: Khẳng định vật liệu đảo không còn chứa mã màu `#FDE68A`, bờ biển sử dụng cát ngà tự nhiên `#EFE5D8` và có cao nguyên cỏ xanh.
  - **Facet 4 (Post-Processing AO Comfort)**: Khẳng định `DEFAULT_PIPELINE_CONFIG.aoIntensity <= 0.40` và màu AO dịu mát.
- Cập nhật test cũ `TC-IMP38.01b` sang kỳ vọng `#FFFFFF`.
- Chạy kiểm thử chứng minh trạng thái **RED (Adversarial Inversion)**.

### Trạm 2: GREEN Implementation (`implementer`)
- Thực hiện chỉnh sửa mã nguồn tối thiểu theo đúng thiết kế tại các tệp:
  - `src/client/3d/tile_texture_generator.ts`
  - `src/client/store/environment_store.ts`
  - `src/client/3d/time_of_day_lighting.tsx`
  - `src/client/3d/coastal_island_environment.tsx`
  - `src/client/3d/post_processing_pipeline.tsx`
- Chạy kiểm định cho đến khi toàn bộ kiểm thử đạt **GREEN (100% PASS)**.
- Đảm bảo `npx tsc --noEmit` 0 lỗi và `npm run lint:ui` 0 vi phạm.

### Trạm 3: Independent Physical Disk Verification & Reviewers
- Điều phối các chuyên gia độc lập:
  - `spec-reviewer`: Đối soát 100% yêu cầu người dùng, truy xuất tệp vật lý trên đĩa.
  - `code-reviewer`: Thẩm định chất lượng code, độ sạch và hiệu năng.
  - `game-3d-visual-critic`: Thẩm định trực quan 3D theo ảnh reference Retropoly.
  - `ui-craft-reviewer`: Thẩm định độ tinh xảo 2D của thẻ cờ.

---

## 5. THỰC THI BÀN GIAO & DEPLOYMENT
- Cập nhật Gotcha #108 vào `docs/domain/gotchas.md`.
- Lập báo cáo `docs/reports/improvements/IMP-80-daylight_illumination_and_unified_tile_art_report.md`.
- Cập nhật tiến độ vào `docs/master_roadmap.md`.
- Tái đóng gói và kiểm tra sức khỏe container Docker trên cổng 3000.
