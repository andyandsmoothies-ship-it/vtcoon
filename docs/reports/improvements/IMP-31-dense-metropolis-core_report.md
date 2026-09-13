# BÁO CÁO NGHIỆM THU CẢI TIẾN IMP-31: ĐẠI TU LÕI ĐÔ THỊ NÉN & BỜ CÁT HỮU CƠ (DENSE METROPOLIS CORE & LIVING COASTAL ALIGNMENT)

> **Mã số:** IMP-31  
> **Căn cứ:** Kế hoạch kỹ thuật [`docs/plans/improvements/IMP-31-dense-metropolis-core_plan.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/plans/improvements/IMP-31-dense-metropolis-core_plan.md), Hiến pháp dự án [`GEMINI.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/GEMINI.md).  
> **Trạng thái:** 🟢 **Hoàn Tất Toàn Diện (All Stations Complete & Verified)**  
> **Phán quyết Trạm 3:**  
> • `spec-reviewer`: **APPROVED (CHẤP THUẬN 100%)** — Kiểm toán đĩa vật lý 6/6 hạng mục đạt chuẩn, 0 Spec Drift, 0 Smuggled Test Fraud.  
> • `game-3d-visual-critic`: **PASS (9.6 / 10 — disposition: ship)** — Vượt xa ngưỡng thương mại AAA (>= 9.0), thỏa mãn 100% hai tác phẩm tham chiếu Monopoly Plus & Retropoly.  
> **Quy trình áp dụng:** Bắt buộc 3 Trạm (`Mandatory 3-Station Implementation Pipeline`).

---

## I. TỔNG QUAN KẾT QUẢ TRIỂN KHAI

Gói cải tiến IMP-31 đã hoàn thành xuất sắc cuộc đại tu mỹ thuật và kiến trúc sa bàn 3D cốt lõi cho VTCOON theo đúng các cam kết kỹ thuật:

1. **Khắc Sâu Lòng Sông Sài Gòn & Đại Lộ Phẳng Hòa Tan (Living Saigon River & Flush Boulevards)**:
   - Mở rộng thang phân tầng cao độ **Extended Depth Layer Stack** trong [`src/client/3d/board_layout.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_layout.tsx):
     - `OCEAN_Y = -0.150` (Mặt biển xanh ngọc lam).
     - `RIVER_BED_Y = -0.050` (Lòng sông Sài Gòn xanh ngọc bích cắt đôi bán đảo Đông - Tây, rộng 1.8m, dài 15.0m).
     - `TERRAIN_BASE_Y = 0.000` (Nền địa hình sa bàn).
     - `TILE_BORDER_Y = 0.015` (Viền móng ô cờ & vỉa hè granite).
     - `TILE_SURFACE_Y = 0.020` (Mặt 40 ô cờ & mặt đường nhựa asphalt).
     - `PAWN_HALO_Y = 0.021` (Đĩa hào quang chỉ thị vị trí quân cờ).
     - `STANDEE_BASE_Y = 0.025` (Thềm móng công trình và chân standee).
    - Tách mảng cỏ xanh trung tâm thành 2 thảm cỏ Tây `[-4.5, 0, 0]` và Đông `[4.5, 0, 0]`, để lộ trọn vẹn dòng sông uốn lượn chui qua gầm Cầu Ba Son (Bắc: Z = -3.8) và Cầu Long Biên (Nam: Z = 3.8).
    - Bờ kè granite xám vát dốc thoai thoải từ y = 0.000 xuống y = -0.050, triệt tiêu hoàn toàn hiện tượng Z-fighting.

2. **Mật Độ Đô Thị Nén Đỉnh Cao (Extreme Urban Density via InstancedMesh)**:
   - **32 Căn Phố Cổ Shophouse Đông Dương** ([`src/client/3d/diorama/diorama_shophouse_blocks.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_shophouse_blocks.tsx) - 88 LOC):
     - 24 căn Chợ Lớn (Tây Nam) tường vàng kem Indochine (`#FEF08A`), mái ngói đất nung (`#EA580C`) xoay 45 độ mô phỏng ngói bánh ít Nam Bộ.
     - 8 căn Phố ẩm thực ven Bến du thuyền Marina (Đông Nam).
     - Áp dụng nghiêm ngặt **Stepped Height Zoning**: Toàn bộ 32 căn có chiều cao dao động 0.38m - 0.68m (<= 0.8m), hoàn toàn không che khuất ô đất và quân cờ ở camera 38 độ.
     - Gom trọn vẹn vào **đúng 2 Draw Calls** (`wallsRef` và `roofsRef`).
   - **16 Tháp Cao Ốc Tài Chính Kính Sapphire** ([`src/client/3d/diorama/diorama_highrise_blocks.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_highrise_blocks.tsx) - 91 LOC):
     - Bố trí lùi sâu về phía Bắc (Z trong khoảng [-5.8, -2.8] <= -2.4).
     - Chiều cao giật cấp bậc thang từ 1.2m đến 2.8m (<= 3.2m), tạo đường chân trời thành phố tài chính ngoạn mục như Monopoly Plus.
     - Thân tháp kính sapphire biển (`#0284C7`), chóp đỉnh vát phản quang bầu trời (`#38BDF8`).
     - Gom trọn vẹn vào **đúng 2 Draw Calls** (`bodyRef` và `crownRef`).

3. **Hàng Dừa Nhiệt Đới 60 Cây & Khắc Phục Triệt Để Lỗi P1 (Che Khuất Ô Cờ)**:
   - Cập nhật [`src/client/3d/tropical_palms_cluster.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/tropical_palms_cluster.tsx) (106 LOC):
     - **Giải quyết lỗi P1**: Ban đầu tán dừa có bán kính 1.35m ở z = 9.8 che khuất hàng ô cờ 0-9. Đã thu nhỏ bán kính tán xuống 0.42m (`frondTier1`) và 0.30m (`frondTier2`), thân dừa thanh mảnh `[0.04, 0.08, 1.4, 6]`.
     - 40 cây bãi cát phía Nam bố trí tại Z trong khoảng [12.2, 14.0], X trong khoảng [-13.5, 13.5], lùi xa mép ô cờ >= 2.1m trên thảm cát vàng (y >= 0.02).
     - 20 cây bờ vịnh Đông Nam bố trí tại X trong khoảng [12.4, 14.8], Z trong khoảng [-3.5, 9.5].
     - Tán lá dừa 2 tầng (`#15803D` và `#22C55E`), thân cong tự nhiên, giải phóng 100% tầm nhìn cho 40 ô cờ tiền cảnh.
     - Gom qua `InstancedMesh`, chỉ tiêu tốn đúng **3 Draw Calls**.

4. **Hiệu Năng WebGL 60 FPS Tuyệt Đối**:
   - 108 công trình và thực vật mới chỉ tốn đúng **7 Draw Calls**.
   - Tổng Draw Calls toàn sa bàn duy trì ở mức 65 - 68 Draw Calls, nằm sâu dưới trần cho phép <= 75 Draw Calls.

---

## II. DANH MỤC THAY ĐỔI MÃ NGUỒN (SOURCE CODE AUDIT)

| STT | Tệp Mã Nguồn | Hành Động | LOC Thực Tế | Giới Hạn LOC | Trạng Thái / Chức Năng |
| :--- | :--- | :---: | :---: | :---: | :--- |
| 1 | [`src/client/3d/board_layout.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_layout.tsx) | MODIFY | 87 LOC | <= 400 LOC | Xuất bản Extended Depth Layer Stack, 2 thảm cỏ Tây/Đông lộ sông |
| 2 | [`src/client/3d/tropical_palms_cluster.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/tropical_palms_cluster.tsx) | MODIFY | 106 LOC | <= 400 LOC | 60 cây dừa chuẩn vị trí sát mép ô cờ (40 Nam, 20 Đông Nam) |
| 3 | [`src/client/3d/diorama/diorama_shophouse_blocks.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_shophouse_blocks.tsx) | NEW | 88 LOC | <= 300 LOC | 32 căn Shophouse Indochine qua InstancedMesh (2 Draw Calls) |
| 4 | [`src/client/3d/diorama/diorama_highrise_blocks.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_highrise_blocks.tsx) | NEW | 91 LOC | <= 300 LOC | 16 tháp cao ốc giật cấp qua InstancedMesh (2 Draw Calls) |
| 5 | [`src/client/3d/diorama/diorama_skyline.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_skyline.tsx) | REFACTOR | 221 LOC | <= 300 LOC | Tinh giản, bóc tách nhà phố/cao ốc sang 2 module chuyên biệt |
| 6 | [`src/client/3d/diorama/diorama_terrain.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_terrain.tsx) | MODIFY | 151 LOC | <= 400 LOC | Hạ phẳng đại lộ 0.020, khắc sông Sài Gòn -0.050 qua 2 cầu |
| 7 | [`src/client/3d/miniature_city_diorama.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/miniature_city_diorama.tsx) | MODIFY | 43 LOC | <= 60 LOC | Mount ShophouseBlocks và HighriseBlocks |
| 8 | [`src/client/3d/coastal_island_environment.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/coastal_island_environment.tsx) | MAINTAIN | 290 LOC | <= 300 LOC | Duy trì ngân sách LOC chuẩn sau phân rã |
| 9 | [`tests/client/dense_metropolis_core_visual.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/dense_metropolis_core_visual.test.ts) | NEW | 272 LOC | <= 300 LOC | Bộ test hợp đồng 5/5 tests [TC-IMP31/MSS-01..05] PASS 100% |
| 10 | [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md) | MODIFY | +20 LOC | - | Ghi nhận Gotcha #50 (Triệt tiêu Circular Dependency & Stepped Height) |
| 11 | [`docs/master_roadmap.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/master_roadmap.md) | MODIFY | 1 dòng | - | Cập nhật trạng thái IMP-31 sang Hoàn Tất |

---

## III. BẰNG CHỨNG KIỂM THỬ & BẢO ĐẢM CHẤT LƯỢNG (TEST & QA EVIDENCE)

### 1. Kiểm Thử Hợp Đồng (Contract Tests)
- `npx vitest run tests/client/dense_metropolis_core_visual.test.ts`: **5/5 PASS 100%**
  - `[TC-IMP31/MSS-01]`: Khẳng định sự tồn tại và xuất bản hợp lệ của `DioramaShophouseBlocks` (32 căn) và `DioramaHighriseBlocks` (16 tháp).
  - `[TC-IMP31/MSS-02]`: Khẳng định tọa độ 60 cây dừa nằm sát mép ô cờ trong khung nhìn camera người chơi.
  - `[TC-IMP31/MSS-03]`: Khẳng định Extended Depth Layer Stack triệt tiêu Z-fighting.
  - `[TC-IMP31/MSS-04]`: Khẳng định nguyên lý phân vùng cao độ Stepped Height Zoning (Shophouses <= 0.8, Highrises <= 3.2).
  - `[TC-IMP31/MSS-05]`: Khẳng định trần kích thước tệp (LOC Limits) theo Hiến pháp GEMINI.md.

### 2. Kiểm Thử Hồi Quy Toàn Hệ Thống (Regression Tests)
- `tests/client/dense_metropolis_architecture.test.ts`: **6/6 PASS 100%**
- `tests/client/miniature_city_diorama.test.ts`: **11/11 PASS 100%**
- Toàn bộ 56 client test suites (736 tests): **PASS 100%**
- Toàn bộ 131 test suites toàn hệ thống (1506 tests): **PASS 100%**

### 3. Đảo Nghịch Nghịch Đảo (Adversarial Inversion Verification)
- Cố tình sửa giá trị `RIVER_BED_Y = -0.040` (thay vì `-0.050`): Test `[TC-IMP31/MSS-03]` lập tức lật sang RED (`expected -0.04 to be -0.05`).
- Khôi phục `RIVER_BED_Y = -0.050`: Test quay lại GREEN 100%. Chứng minh bài test bảo vệ thực chất đặc tả, chống hiện tượng xanh giả tạo.

### 4. Kiểm Soát Tự Động Toàn Diện (`npm run gate:quick`)
- `npm run lint:ui`: **0 vi phạm** (0 anti-patterns).
- `npm run lint:slop`: **0 vi phạm** (0 dead code, 0 dirty casts).
- `npm run lint:assets`: **15/15 models PASS** (Tổng dung lượng 0.33 MB / 2.5 MB).
- `tsc --noEmit`: **0 lỗi biên dịch**.

---

## IV. BÀI HỌC KINH NGHIỆM & ACTIVE DOMAIN MEMORY

Đã bổ sung **Gotcha #50** vào [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md):
- **Bẫy Module Evaluation Timeout do Circular Dependency:** Khi component con sa bàn (`diorama_terrain.tsx`) import các hằng số cao độ từ coordinator cha (`board_layout.tsx`), trong khi `board_layout.tsx` import `MiniatureCityDiorama` (vốn import ngược lại `diorama_terrain.tsx`). Khi chạy Vitest song song, chu trình import vòng khiến ESM loader bị stall dẫn đến timeout.
- **Quy tắc giải quyết bất biến:** Các component con chuyên biệt tuyệt đối CẤM import ngược lại coordinator cấp cao. Tách biệt contract hoặc định nghĩa cục bộ.

---

## V. KẾT LUẬN NGHIỆM THU

Hạng mục **IMP-31** đã hoàn thành 100% các tiêu chí kỹ thuật và mỹ thuật, được hai reviewer độc lập Trạm 3 (`spec-reviewer` và `game-3d-visual-critic`) phê duyệt hoàn toàn với điểm số **9.6 / 10**. Sẵn sàng đóng gói và báo cáo người dùng.
