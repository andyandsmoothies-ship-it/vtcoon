# KẾ HOẠCH KỸ THUẬT IMP-31: ĐẠI TU LÕI ĐÔ THỊ NÉN & BỜ CÁT HỮU CƠ (DENSE METROPOLIS CORE & LIVING COASTAL ALIGNMENT)

> **Mã số:** IMP-31  
> **Căn cứ pháp lý:** Hiến pháp dự án [`GEMINI.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/GEMINI.md), Định hướng mỹ thuật `docs/domain/design.md`, ADR-0002.  
> **Tác phẩm tham chiếu thương mại:**  
> • [`monop_02.webp`](file:///C:/Users/HP/Downloads/monop_02.webp) — Monopoly Plus: Khai thác 100% diện tích lõi, sông nội đô uốn lượn, cầu nối liền hai bờ, đĩa hào quang quân cờ.  
> • [`Reference_Retropoly...jpg`](file:///C:/Users/HP/Downloads/Reference_Retropoly-City-Builder-Assets-for-game-by-RetroStyle-Games.jpg) — Retropoly: Sa bàn ngoài trời ngập nắng, mật độ công trình cực cao, bờ cát và hàng dừa nhiệt đới nghiêng bóng sát mép ô cờ.  
> **Quy trình áp dụng:** Bắt buộc 3 Trạm (`Mandatory 3-Station Implementation Pipeline`) với kỷ luật ranh giới bước lệnh nghiêm ngặt (dừng lại sau mỗi trạm để người dùng nghiệm thu).

---

## I. 4 CHỐT CHẶN KỸ THUẬT BẤT BIẾN (CRITICAL INVARIANTS)

1. **Chốt chặn 1: Responsive Playmat Invariant (Tránh bẫy Mobile)**:
   - Chỉ kích hoạt hiển thị khu vực chiếu trải Playmat 3D hai cánh (tiền giấy xòe quạt và thẻ bài) trên Desktop / Tablet màn hình ngang (`aspectRatio >= 1.4`).
   - Trên Mobile (`aspectRatio < 1.4`): Khóa trọn vẹn chiều ngang cho sa bàn 40 ô; giữ nguyên HUD 2D và Sideboard trượt siêu nhẹ.
2. **Chốt chặn 2: Single Cohesive World Invariant (Không đưa game vào phòng kín)**:
   - Toàn bộ game thuộc về thế giới sa bàn đảo ngọc ngoài trời ngập tràn nắng hè vàng rực rỡ `#FFFBEB`.
   - Nếu sử dụng chất liệu gỗ, đó phải là Kỳ đài Bến Cảng lát gỗ Teak ngoài trời (Outdoor Teak Promenade Plinth) sát mép biển.
3. **Chốt chặn 3: Extended Depth Layer Stack (Gotcha #49)**:
   - Cưỡng chế thang phân tầng cao độ vật lý triệt tiêu 100% Z-fighting:
     ```text
     [y = +0.025] ── Thềm móng Standee / Shophouse
     [y = +0.021] ── Đĩa hào quang quân cờ (Pawn Halo Disc, depthWrite={false})
     [y = +0.020] ── Mặt trên 40 Ô Cờ & Mặt đường Đại Lộ Sài Gòn
     [y = +0.015] ── Viền chỉ móng ô cờ & Vỉa hè granite xám sáng
     [y =  0.000] ── Nền đất chính (Thảm cỏ & Cát vàng)
     [y = -0.050] ── Lòng kênh / Sông Sài Gòn nội đô (Bờ kè vát từ 0.000 xuống -0.050)
     [y = -0.150] ── Mặt biển Gerstner Wave ngoài khơi
     ```
4. **Chốt chặn 4: Đồng bộ cao độ `diorama_terrain.tsx` & Không xung đột `diorama_skyline.tsx`**:
   - Hạ phẳng toàn bộ đại lộ và vỉa hè trong `diorama_terrain.tsx` từ mức cũ `0.132` về chuẩn `0.020`.
   - Căn chỉnh lòng sông Sài Gòn uốn lượn đi lọt chuẩn xác qua gầm Cầu Ba Son (z ~ -3.5) và Cầu Long Biên (z ~ +3.5).
   - Tái cấu trúc `diorama_skyline.tsx`: Giữ lại cặp Landmark đôi hậu cảnh, chuyển toàn bộ nhà phố và cao ốc đại trà sang 2 module `InstancedMesh` mới để tinh giản LOC từ 317 xuống < 180 LOC.

---

## II. BẢN ĐỒ TỔNG THỂ LÕI ĐÔ THỊ NÉN MỚI (MASTER DENSE CORE LAYOUT)

```text
               [CHÂN TRỜI NÚI XANH MỜ SƯƠNG, THÁP RADAR ĐỈNH NÚI & MÂY TRẮNG]
 ┌────────────────────────────────────────────────────────────────────────────────┐
 │                        40 Ô BÀN CỜ PHẲNG (y = +0.020)                          │
 │  ┌──────────────────────────────────────────────────────────────────────────┐  │
 │  │        BLOCK TÂY BẮC (TÀI CHÍNH)       SÔNG SÀI GÒN      BLOCK ĐÔNG BẮC  │  │
 │  │ • 16 Cao ốc kính Sapphire giật cấp     UỐN LƯỢN NỘI ĐÔ   (THỂ THAO &     │  │
 │  │ • Tháp Landmark Hoàng Kim đỉnh nhọn    (y = -0.050)      GIẢI TRÍ)       │  │
 │  │ • Cẩu cảng container màu vàng & kho bãi  rộng 1.8m       • Sân vận động  │  │
 │  │ ────────────────────────────────────► [CẦU BA SON] ◄──── • Đu quay      │  │
 │  │                                             │            • Công viên hồ  │  │
 │  │                                             │                            │  │
 │  │        BLOCK TÂY NAM (DI SẢN)               │            BLOCK ĐÔNG NAM  │  │
 │  │ • Chợ Bến Thành & Nhà Thờ Đức Bà            │            (NGHỈ DƯỠNG)    │  │
 │  │ • 24 Shophouse ngói đỏ Chợ Lớn xưa          │            • 8 Shophouse   │  │
 │  │ • Phố đi bộ lát gạch men Đông Dương         │            • Khách sạn     │  │
 │  │ ────────────────────────────────────► [CẦU LONG BIÊN] ── • Bến du thuyền │  │
 │  │  ★ ĐẠI LỘ SÀI GÒN & SÀN DIỄN XÚC XẮC NẢY THOÁNG ĐÃNG TRỤC NAM (y = +0.020) ★│  │
 │  └──────────────────────────────────────────────────────────────────────────┘  │
 │     BÃI CÁT VÀNG CÁNH CUNG & HÀNG DỪA 60 CÂY NGHIÊNG BÓNG SÁT Ô CỜ (z = 9.8 .. 13.0)  │
 └────────────────────────────────────────────────────────────────────────────────┘
              [BIỂN NGỌC BÍCH ĐA TẦNG (y = -0.150), TÀU CONTAINER RSG]
```

---

## III. KẾ HOẠCH TRIỂN KHAI CHI TIẾT (3 NHÓM CÔNG VIỆC)

### Nhóm 1: Địa Hình Lòng Bàn Cờ & Kênh Sông Sài Gòn Nội Đô
- **[`src/client/3d/diorama/diorama_terrain.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_terrain.tsx)**:
  - Triển khai **Lòng Sông Sài Gòn uốn lượn** tại `y = -0.050` cắt qua trục giữa (rộng 1.8m), bề mặt nước PBR ngọc bích phản chiếu bầu trời (`#0284C7` / `#00BCD4`).
  - Bờ kè đá granite dốc thoai thoải từ `y = 0.000` xuống `y = -0.050` dọc hai bên mép sông.
  - Hạ phẳng toàn bộ lòng đường đại lộ về `y = 0.020`, vỉa hè về `y = 0.015`.
  - Căn chỉnh dòng nước đi lọt qua thông thuyền của Cầu Ba Son (Bắc) và Cầu Long Biên (Nam).
- **[`src/client/3d/board_layout.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_layout.tsx)**:
  - Cập nhật hằng số `DEPTH_LAYER_STACK` bổ sung `RIVER_BED_Y = -0.050` và `PAWN_HALO_Y = 0.021`.
  - Thu nhỏ mảng cỏ xanh nền hoa viên từ `args={[15.75, 0.02, 15.75]}` để nhường chỗ cho dòng sông và mạng lưới đường phố của `DioramaTerrain`.

### Nhóm 2: Lấp Đầy Mật Độ Đô Thị Nén Bằng InstancedMesh
- **[NEW] [`src/client/3d/diorama/diorama_shophouse_blocks.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_shophouse_blocks.tsx)** (< 150 LOC):
  - 32 khối Shophouse Đông Dương qua `InstancedMesh`:
    - 24 căn tại Phố cổ Chợ Lớn (Block Tây Nam): Tường vàng kem (`#FEF08A`), mái ngói đất nung (`#EA580C`), ban công nâu gỗ.
    - 8 căn Shophouse ven bến du thuyền (Block Đông Nam): Phố ẩm thực dù che đa sắc.
    - Chiều cao thấp (0.4 - 0.75 đơn vị) sát mép ô cờ, tuân thủ nghiêm ngặt *Stepped Height Zoning* để không che chữ ô đất.
    - Chỉ tốn đúng **2 Draw Calls** trên GPU.
- **[NEW] [`src/client/3d/diorama/diorama_highrise_blocks.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_highrise_blocks.tsx)** (< 150 LOC):
  - 16 tháp cao ốc kính Sapphire qua `InstancedMesh`:
    - Bố trí tại Trung tâm Tài chính (Block Tây Bắc) lùi sâu về phía Bắc.
    - Chiều cao giật cấp từ 1.2m đến 2.8m, tạo đường chân trời hiện đại ngoạn mục giống Monopoly Plus.
    - Khung nhôm titan kết hợp kính Sapphire phản chiếu (`#38BDF8`).
    - Chỉ tốn đúng **2 Draw Calls** trên GPU.
- **[`src/client/3d/diorama/diorama_skyline.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_skyline.tsx)**:
  - Tinh giản mã nguồn: Giữ lại cặp Landmark đôi Hoàng Kim, chuyển giao phần nhà phố và cao ốc đại trà sang 2 module InstancedMesh mới. Giảm LOC từ 317 xuống < 180 LOC.
- **[`src/client/3d/miniature_city_diorama.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/miniature_city_diorama.tsx)**:
  - Tích hợp `DioramaShophouseBlocks` và `DioramaHighriseBlocks` vào cây JSX điều phối. Giữ tệp <= 60 LOC.

### Nhóm 3: Hiệu Chỉnh Tọa Độ Hàng Dừa 60 Cây Sát Ô Cờ & Bờ Cát
- **[`src/client/3d/tropical_palms_cluster.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/tropical_palms_cluster.tsx)**:
  - Cập nhật lại mảng tọa độ `PALM_TREES` (60 cây):
    - 40 cây bãi cát phía Nam: `x = -13.5 .. +13.5`, `z = 9.8 .. 13.0`, `y = 0.03 .. 0.06`.
    - 20 cây bờ vịnh Đông Nam: `x = 10.5 .. 14.5`, `z = -3.5 .. +9.5`, `y = 0.02 .. 0.05`.
    - Độ nghiêng thân dừa tự nhiên (tilt 8 - 14 độ) hướng ra biển.
    - Đảm bảo toàn bộ 60 cây dừa xuất hiện sắc nét trên dải cát vàng trong khung hình 38 độ của máy quay.
- **[`src/client/3d/coastal_island_environment.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/coastal_island_environment.tsx)**:
  - Uốn cong bờ cát Tây Nam theo hình lưỡi liềm tự nhiên, dải bọt sóng ôm sát mép cong bờ biển. Giữ tệp <= 300 LOC.

---

## IV. MA TRẬN TEST CONTRACTS & KIỂM CHỨNG TRẠM 1

Tệp kiểm thử hợp đồng: `tests/client/dense_metropolis_core_visual.test.ts`
- `[TC-IMP31/MSS-01]`: Khẳng định sự tồn tại và render hợp lệ của `DioramaShophouseBlocks` (32 instances) và `DioramaHighriseBlocks` (16 instances).
- `[TC-IMP31/MSS-02]`: Khẳng định tọa độ của 60 cây dừa trong `tropical_palms_cluster.tsx` nằm hoàn toàn trong vùng nhìn thấy được của camera sát mép ô cờ (`z <= 13.2` và `z >= 9.8`, `y >= 0.02`).
- `[TC-IMP31/MSS-03]`: Khẳng định thang phân tầng cao độ mở rộng `DEPTH_LAYER_STACK` thỏa mãn:
  `OCEAN_Y (-0.150) < RIVER_BED_Y (-0.050) < TERRAIN_BASE_Y (0.000) < TILE_BORDER_Y (0.015) < TILE_SURFACE_Y (0.020) < PAWN_HALO_Y (0.021) < STANDEE_BASE_Y (0.025)`.
- `[TC-IMP31/MSS-04]`: Khẳng định Stepped Height Zoning (Shophouse sát mép cao <= 0.8; Cao ốc lùi Bắc cao <= 3.2).
- `[TC-IMP31/MSS-05]`: Khẳng định tổng Draw Calls trong giới hạn <= 75 và kiểm tra trần LOC <= 400 cho mọi tệp.
