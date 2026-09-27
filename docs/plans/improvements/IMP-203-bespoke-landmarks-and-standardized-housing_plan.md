# [PLAN] IMP-203: Chuẩn Hóa Nhà Cấp 1-2 & Kiến Trúc Tòa Nhà Landmark Độc Bản Cấp 3 Cho 22 Ô Đất

## 1. MỤC TIÊU & PHẠM VI (SCOPE & OBJECTIVES)
- **Mục tiêu**:
  1. Chuẩn hóa mô hình Nhà Cấp 1 (`building_c1.glb`) và Cấp 2 (`building_c2.glb`) dùng chung cho toàn bộ các ô đất trên bàn cờ.
  2. Xây dựng 22 mô hình kiến trúc Landmark Độc Bản Cấp 3 cho 22 ô đất mua được trên bàn cờ Việt Nam (`bld_c3_cell_${cellIndex}.glb`).
  3. Định vị bằng Bộ 3 Mỏ Neo Bất Biến: Đai vàng chân đế, Vương miện bảo ngọc tự xoay, Khách sạn đồ chơi đỏ ruby.
  4. Bóc tách submodule procedural fallback để đưa `procedural_building.tsx` xuống dưới 300 LOC.
- **Phân loại**: Tier 2 (Full Rigor) — Tuân thủ Quy trình 3 Trạm.

---

## 2. THIẾT KẾ KIẾN TRÚC & DÒNG ĐỜI DỮ LIỆU
```text
[building_typology.ts] 
       │ 
       ├─ level === 1 ➔ /models/buildings/building_c1.glb
       ├─ level === 2 ➔ /models/buildings/building_c2.glb
       └─ level === 3 ➔ /models/landmarks/bld_c3_cell_${cellIndex}.glb
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
       [SafeGLTFModel]              [BespokeLandmarkFallback]
    (Load 22 GLB Assets)            (Procedural SSR Fallback)
               │                               │
               └───────────────┬───────────────┘
                               ▼
            [ProceduralBuilding: Persistent Anchors]
          - Anchor 1: Đai vàng chân đế [0.57, 0.02, 0.57]
          - Anchor 2: Vương miện xoay Y=1.05m (#F59E0B)
          - Anchor 3: ToyHotelMesh đỏ ruby trên dải màu
```

---

## 3. DANH MỤC 22 ĐỊA DANH LANDMARK CẤP 3 (`landmark_registry.ts`)
1. Ô 1: Dinh Thự Cổ Bình Thủy (Cần Thơ)
2. Ô 3: Điện Thờ Bà Chúa Xứ (Châu Đốc)
3. Ô 6: Tòa Tháp Đôi Hành Chính (Bình Dương)
4. Ô 8: Lâu Đài Kỳ Quan Hoàng Gia (Đồng Nai)
5. Ô 9: Hải Đăng Vũng Tàu (Bà Rịa - Vũng Tàu)
6. Ô 11: Resort Cánh Buồm Đồi Cát (Bình Thuận)
7. Ô 13: Ga Xe Lửa Art Deco Đà Lạt (Lâm Đồng)
8. Ô 14: Tháp Trầm Hương Biển (Nha Trang)
9. Ô 16: Tháp Đôi Chăm Pa Di Sản (Quy Nhơn)
10. Ô 18: Lầu Ngũ Phụng - Ngọ Môn (Huế)
11. Ô 19: Cao Ốc Khí Động Học Bắp Ngô (Đà Nẵng)
12. Ô 21: Khách Sạn Vỏ Sò Hoàng Gia (Sầm Sơn)
13. Ô 23: Nhà Hát Thành Cổ Lam Sơn (Vinh)
14. Ô 24: Đại Bảo Tháp Bái Đính (Ninh Bình)
15. Ô 26: Nhà Hát Lớn Thành Phố Cảng (Hải Phòng)
16. Ô 27: Tháp Chuông Venice Đảo Ngọc (Phú Quốc)
17. Ô 29: Bảo Tàng Than Kính Đen (Quảng Ninh)
18. Ô 31: Biệt Thự Rừng Cọ Ecopark (Hưng Yên)
19. Ô 32: Tháp Keangnam Landmark 72 (Cầu Giấy)
20. Ô 34: Nhà Hát Lớn Hà Nội (Hoàn Kiếm)
21. Ô 37: Tháp Xanh Empire Thủ Thiêm (Thủ Đức)
22. Ô 39: Tháp Bitexco Búp Sen Sài Gòn (Quận 1)

---

## 4. MA TRẬN KIỂM THỬ HỢP ĐỒNG (5 FACETS - 55 TESTS)
- **Facet 1: URL Resolution & Hierarchy SSOT**: Phân giải đúng URL theo cấp và ô đất.
- **Facet 2: Bounding Box & Spatial Clearance**: Chân đế 0.55m x 0.55m, khoảng cách an toàn với cột cờ và toy hotel.
- **Facet 3: Persistent Tactile Anchors**: 3 mỏ neo nhận diện Cấp 3 bất biến.
- **Facet 4: Landmark Registry SSOT**: 22 địa danh văn hóa, hàm `getLandmarkInfo`.
- **Facet 5: Zero-Crash Fallback**: Xử lý an toàn khi thiếu GLB hoặc môi trường SSR/test.
