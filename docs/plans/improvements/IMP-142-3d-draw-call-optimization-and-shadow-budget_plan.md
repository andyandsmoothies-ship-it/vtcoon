# Kế Hoạch IMP-142: Tối Ưu Hóa Draw Calls Sa Bàn 3D, Gom Instancing & Kiểm Soát Ngân Sách Bóng Đổ (3D Diorama Draw Call Optimization & Shadow Caster Budget Hardening)

> **Mục tiêu:** Kéo giảm số lượng Draw Calls từ đỉnh **1.741 calls** về dưới **150 calls** (< 85 calls cho scene tĩnh), giảm số lượng tam giác dưới **150.000 tris**, rút ngắn thời gian xử lý khung hình từ **25.5 ms** xuống **<= 16.6 ms**, khôi phục chuẩn **60 FPS** mượt mà cho ván đấu trên cả Desktop và Mobile.  
> **Căn cứ:** Dữ liệu telemetry ván đấu thực tế (`VTCOON`, tick 399), `docs/master_roadmap.md`, `ADR-0002-r3f-rendering.md`, `PERF_BUDGET_LIMITS` trong `src/client/3d/perf_budget.ts`.  
> **Trạng thái thẩm định:** ĐÃ THÔNG QUA PHẢN BIỆN ĐỐI KHÁNG (`plan-griller` VERDICT: REVISED & STABILIZED).

---

## 1. Phân Tích Hiện Trạng & Kết Quả Thẩm Định Điểm Mù (Plan Grilling)

Dựa trên dữ liệu telemetry kiểm toán ván đấu:
- `drawCalls`: **1.741 calls** (Vượt 2.048% so với ngân sách chuẩn 85 calls).
- `triangles`: **202.139 tris** (Vượt 134% so với trần 150.000 tris).
- `fps`: **34.2 FPS** (Tụt 43% so với mục tiêu 60 FPS).
- `frameTimeMs`: **25.5 ms** (Vượt trần 16.6 ms của chuẩn 60 FPS).

### 3 Điểm Mù Kỹ Thuật Đã Được Nhận Diện & Khắc Phục:
1. **[P1 - Bảo tồn SSR cho Luống Hoa]**: Test `TC-RBWS01.10/11/12` trong `railroad_ballast_and_waterfront_station.test.ts` kiểm tra các chuỗi màu `#F43F5E`, `#F59E0B`, `#A855F7` trong static markup SSR của `DioramaTropicalFlora`.  
   $\rightarrow$ **Giải pháp**: Giữ nguyên cấu trúc JSX của `DioramaTropicalFlora` (chỉ 20 mesh nhỏ), CHỈ tắt `castShadow` ở khối cầu bụi cây, giúp bảo toàn 100% hợp đồng màu sắc SSR.
2. **[P2 - Bảo tồn Test Hợp Đồng FlagPole / FlagCloth]**: Test `TC-87.10b` trong `imp87_watchdog_phase_awareness_and_render_perf.test.ts` yêu cầu `FlagPole` và `FlagCloth` trên `board_tile.tsx` BẮT BUỘC giữ `castShadow={true}`.  
   $\rightarrow$ **Giải pháp**: GIỮ NGUYÊN `castShadow={true}` cho cọc cờ và cờ phướn, TUYỆT ĐỐI không tắt để tránh gây hồi quy kiểm thử.
3. **[P3 - Bảo tồn Testid & Màu Mặc Định Tán Cây Đô Thị]**: Test `TC-MRL02.01/02` trong `model_railroad_and_tactile_lobby.test.ts` yêu cầu bọc `data-testid="diorama-urban-canopy"` và màu `#15803D`.  
   $\rightarrow$ **Giải pháp**: Khi gom `DioramaUrbanCanopy` thành `InstancedMesh`, bọc trong `<group data-testid="diorama-urban-canopy">` và gán màu tĩnh mặc định `color="#15803D"` trên `meshStandardMaterial`.

---

## 2. Kiến Trúc Giải Pháp 4 Trụ Cột Đã Tinh Chỉnh (Refined 4-Pillar Architecture)

```
                     ┌────────────────────────────────────────────────────────┐
                     │          TỐI ƯU HÓA DRAW CALLS 3D (IMP-142)            │
                     └──────────────────────────┬─────────────────────────────┘
                                                │
         ┌───────────────────────┬──────────────┴───────────────┬───────────────────────┐
         ▼                       ▼                              ▼                       ▼
   [Trụ Cột 1]             [Trụ Cột 2]                    [Trụ Cột 3]             [Trụ Cột 4]
Gom InstancedMesh       Thắt Chặt Ngân Sách             Tinh Gọn Khối Nhà       Thích Ứng Tự Động
  Tán Cây Đô Thị          Bóng Đổ Chi Tiết Nhỏ            Đồ Chơi 28 Ô Cờ         Adaptive Dynamic LOD
• Canopy: 54 ➔ 3 meshes • Cáp cầu 5mm (12 cáp) ➔ TẮT    • Gộp ToyHouseMesh      • Tắt N8AO khi <45 FPS
• Giữ SSR colors an toàn• Tà vẹt ray, móng ray ➔ TẮT      từ 4 mesh ➔ 1-2 mesh  • Shadow map 512 mobile
• Containers: Tinh gọn  • Nẹp container, rơ-moóc ➔ TẮT  • Bảo tồn testids       • Duy trì 60 FPS
• Tiết kiệm 50+ calls   • Tiết kiệm 600+ shadow calls   • Tiết kiệm 80+ calls   • Zero giật lag
```

### Trụ Cột 1: Gom `InstancedMesh` Cho Tán Cây Đô Thị (`DioramaUrbanCanopy`)
- **`src/client/3d/miniature_city_diorama.tsx`**:
  - Chuyển đổi 18 cây xanh `URBAN_TREES` sang 3 `instancedMesh`:
    1. `instancedMesh` cho thân cây gỗ (`cylinderGeometry`, `count: 18`).
    2. `instancedMesh` cho tầng tán dưới (`sphereGeometry`, `color="#15803D"`, `count: 18`).
    3. `instancedMesh` cho tầng tán trên (`sphereGeometry`, `color="#15803D"`, `count: 18`).
  - Gán ma trận tọa độ `matrix` ngay trong `useMemo` hoặc `useEffect`, đảm bảo render SSR static markup không bị lỗi.
  - Cắt giảm ngay **51 draw calls** trong main pass.

### Trụ Cột 2: Rà Soát & Thắt Chặt Ngân Sách Bóng Đổ (Targeted Shadow Caster Audit)
- **Tắt `castShadow` ở các chi tiết siêu nhỏ không thể nhìn thấy bóng ở cự ly bàn cờ**:
  - `src/client/3d/diorama/diorama_bridges.tsx`: Tắt `castShadow` trên 12 dây văng rẻ quạt 5mm (`basonCables`), mố cầu bờ kênh và trụ mố đá (Tiết kiệm 24 calls).
  - `src/client/3d/diorama/diorama_railroad.tsx`: Tắt `castShadow` trên móng tà vẹt gỗ, cung ray cua góc, và bụi hoa nhiệt đới `DioramaTropicalFlora` (Tiết kiệm ~20 calls).
  - `src/client/3d/diorama/diorama_container_port.tsx`: Tắt `castShadow` trên nẹp viền nóc container, rơ-moóc xe kéo, chân cẩu phụ (Tiết kiệm ~15 calls).
  - `src/client/3d/toy_property_buildings.tsx`: Tắt `castShadow` trên ống khói tí hon, gờ cửa sổ dập nổi, mái vát (Tiết kiệm ~30 calls).
  - `src/client/3d/miniature_city_diorama.tsx`: Tắt `castShadow` trên ghế đá nghỉ chân, bồn hoa công viên.
- **Bảo tồn nghiêm ngặt `castShadow`**:
  - 4 Quân cờ người chơi (`luxury_pawn_models.tsx`).
  - `FlagPole` và `FlagCloth` (`board_tile.tsx`) theo chuẩn hợp đồng `TC-87.10b`.
  - Khối tháp chính Bitexco & Sapphire Landmark (`diorama_skyline.tsx`).
  - Trụ tháp chính Cầu Ba Son & Vòm thép Cầu Long Biên (`diorama_bridges.tsx`).
  - Thân đầu tàu hỏa mini (`diorama_railroad.tsx`).
  - Khối kiến trúc chính (`ProceduralBuilding`).
- **Hiệu quả định lượng**: Giảm từ ~850 calls trong Shadow Map Pass xuống **dưới 120 calls** (Tiết kiệm > 700 calls).

### Trụ Cột 3: Tinh Gọn Khối Nhà Đồ Chơi Ô Cờ (`ToyPropertyBuildings`)
- Trong `src/client/3d/toy_property_buildings.tsx`:
  - `ToyHouseMesh`: Giữ lại thân nhà và mái dốc chính, tinh gọn gờ cửa/ống khói hoặc loại bỏ `castShadow`, giảm số lượng mesh con.
  - `ToyHotelMesh`: Tinh giản khối khách sạn Ruby đỏ.
  - Bảo tồn tuyệt đối các testids: `data-testid="toy-property-building"`, `data-testid="toy-house"`, `data-testid="toy-hotel"`.

### Trụ Cột 4: Cơ Chế Thích Ứng Hiệu Năng Động (Dynamic Adaptive LOD)
- Trong `src/client/3d/post_processing_pipeline.tsx` & `src/client/3d/perf_budget.ts`:
  - Khi `fps < 45` hoặc trên môi trường Mobile: Tự động hạ cấp N8AO hoặc tắt Ambient Occlusion (vốn tốn nhiều pass), đảm bảo duy trì 60 FPS.

---

## 3. Danh Sách Tệp Thay Đổi Cụ Thể

### Cụm 3D Cảnh Quan & Sa Bàn
#### [MODIFY] [miniature_city_diorama.tsx](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/miniature_city_diorama.tsx)
- Chuyển đổi `DioramaUrbanCanopy` thành 3 `instancedMesh`, gán `color="#15803D"` mặc định.
- Tắt `castShadow` trên ghế đá và bồn hoa tiểu cảnh.

#### [MODIFY] [diorama_railroad.tsx](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_railroad.tsx)
- Tắt `castShadow` trên tà vẹt móng ray và bụi hoa `DioramaTropicalFlora`. Giữ nguyên cấu trúc JSX và chuỗi màu để bảo toàn SSR.

#### [MODIFY] [diorama_bridges.tsx](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_bridges.tsx)
- Tắt `castShadow` trên 12 dây văng 5mm `basonCables` và mố cầu phụ.

#### [MODIFY] [diorama_container_port.tsx](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_container_port.tsx)
- Tắt `castShadow` trên nẹp viền nóc container, rơ-moóc xe kéo, chân cẩu phụ.

### Cụm Bàn Cờ & BĐS
#### [MODIFY] [toy_property_buildings.tsx](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/toy_property_buildings.tsx)
- Tinh giản `ToyHouseMesh` và `ToyHotelMesh`, tắt `castShadow` trên các chi tiết nhỏ.
- Bảo tồn toàn bộ `data-testid` phục vụ test contract.

### Cụm Tài Liệu & Tri Thức Miền
#### [NEW] [IMP-142-3d-draw-call-optimization-and-shadow-budget_plan.md](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/plans/improvements/IMP-142-3d-draw-call-optimization-and-shadow-budget_plan.md)
- Kế hoạch chi tiết lưu trữ theo chuẩn Continuous Improvement.

#### [MODIFY] [gotchas.md](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md)
- Thêm Gotcha #189: `[3D/RENDER] Tối Ưu Hóa Draw Calls Sa Bàn, Gom Instancing & Kiểm Soát Shadow Caster Budget (IMP-142)`.

---

## 4. Kế Hoạch Kiểm Thử & Nghiệm Thu (Verification Plan)

### Automated Contract Tests
1. **Station 1 RED Contract Test**:
   - Tạo mới: `tests/client/imp142_draw_call_and_shadow_budget.test.ts`.
   - Universal 4-Facet Behavioral Matrix:
     * *Facet 1 (Boundary & Instancing)*: `DioramaUrbanCanopy` sử dụng `instancedMesh` cho thân và tán cây, số lượng instance đúng 18.
     * *Facet 2 (Reactivity & Shadow Caster Budget)*: Cáp cầu Ba Son 5mm, tà vẹt ray, nẹp container không chứa thuộc tính `castshadow="true"`.
     * *Facet 3 (Toy Buildings & Preservation)*: `ToyPropertyBuildings` kết xuất đúng cấu trúc nhà đồ chơi, bảo tồn đầy đủ `data-testid="toy-property-building"`, `data-testid="toy-house"`, `data-testid="toy-hotel"`.
     * *Facet 4 (SSR & Error Defense)*: Toàn bộ các component kết xuất hợp lệ qua `renderToStaticMarkup`, zero crash, zero NaN.
2. **Regression Testing (100% PASS)**:
   - `tests/client/miniature_city_diorama.test.ts`
   - `tests/client/imp134_model_train_and_stations.test.ts`
   - `tests/client/railroad_ballast_and_waterfront_station.test.ts`
   - `tests/client/model_railroad_and_tactile_lobby.test.ts`
   - `tests/contracts/imp87_watchdog_phase_awareness_and_render_perf.test.ts`
   - `tests/client/owner_price_pill_and_wax_seal.test.ts`
   - `tests/client/animal_pawns_and_custom_ownership.test.ts`
   - `npm run lint:ui` -> 0 vi phạm.

---

## 5. Đánh Giá Tác Động & Vùng Ảnh Hưởng (Blast Radius Audit)
- **Mức độ rủi ro**: `Slice-Bound (Low)`.
- **Chạm trực tiếp**: Các component 3D trong `src/client/3d/`.
- **Tiêu thụ hạ tầng**: Không can thiệp FSM, không can thiệp Server WebSocket, không can thiệp tính toán tài chính.
- **Phòng thủ xấu nhất**: Bảo tồn 100% màu sắc SSR và cờ `castShadow` trên `FlagPole`/`FlagCloth`, đảm bảo mọi test suite hiện hữu không bị suy giảm.
