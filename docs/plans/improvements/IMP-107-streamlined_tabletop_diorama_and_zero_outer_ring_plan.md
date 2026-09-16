# Kế Hoạch Cải Tiến Kỹ Thuật: IMP-107 — Tinh Giản Vòng Ngoài Sa Bàn (Streamlined Tabletop Diorama & Zero Outer Ring Clutter)

## 1. Bối Cảnh & Mục Tiêu

### Hiện trạng thực tế (Qua ảnh chụp `media_1789560430524.png`):
- Bàn cờ 40 ô bị "lọt thỏm" giữa một hòn đảo tròn rộng lớn, chỉ chiếm ~40% - 45% diện tích màn hình.
- Vòng ngoài chiếm hơn 55% diện tích với nhiều chi tiết gây nhiễu thị giác:
  1. Thềm sân cỏ tròn khổng lồ (`#22C55E`) đường kính ~35m đơn điệu, cạnh tranh màu sắc với các ô cờ.
  2. Hai hàng cây kẹo mút (hơn 60 cây dừa `TropicalPalmsCluster` và 32 cây `LayeredTropicalFoliage`) mọc sát chân bàn cờ ở góc dưới trái (Tây Nam) và góc dưới phải (Đông Nam), che khuất các ô đất quan trọng (Khởi Hành, Cần Thơ, TP. Hồ Chí Minh).
  3. Khối nhà xưởng/nhà ga xe lửa lớn (`TrainStationLandmark`) ở cạnh phải và đường băng sân bay (`AirportLandmark`) ở góc Tây Bắc choán chỗ.

### Mục tiêu sau cải tiến:
- **Cắt bỏ hoàn toàn vòng ngoài gây nhiễu**: Loại bỏ thềm cỏ tròn, hàng cây ngoại vi, nhà ga xe lửa và đường băng ngoại vi.
- **Bàn cờ trở thành tâm điểm tuyệt đối (Hero Element)**: Toàn bộ 40 ô đất và lõi diorama đô thị trung tâm nổi bật rõ nét, không bị bất kỳ vật thể ngoại vi nào che khuất.
- **Bảo tồn bất biến "Single Cohesive World Invariant"**:
  - Không biến thành phòng tối hay bàn cờ trơ trọi trong hư không.
  - Bàn cờ đặt trên **bệ gỗ óc chó vát cạnh sang trọng** (`19.2 x 19.2`), xung quanh là **Đại dương nhiệt đới sống động** (`Endless Living Ocean` với shader sóng Gerstner `#0284C7`, nước nông ngọc bích `#06B6D4`, bọt sóng trắng dập dềnh `#FFFFFF`), rặng núi chân trời phía Bắc, ca-nô tuần duyên, chim hải âu và mây trắng.

---

## 2. Sơ Đồ Kiến Trúc Logic Trước Khi Code

```
[Trước Cải Tiến: Phân mảnh & Bị che khuất]
┌────────────────────────────────────────────────────────┐
│ [Biển vô cực]                                          │
│   ┌──────────────────────────────────────────────┐     │
│   │ [Thềm cỏ tròn khổng lồ #22C55E - 35m]         │     │
│   │   ┌──────────────────────────────────────┐   │     │
│   │   │  BÀN CỜ 40 Ô & DIORAMA TRUNG TÂM     │   │     │
│   │   └──────────────────────────────────────┘   │     │
│   │ [60 Cây dừa + Nhà ga xe lửa che khuất ô cờ] │     │
│   └──────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────┘

[Sau Cải Tiến: Tinh giản, Đẳng cấp & Nổi bật 100%]
┌────────────────────────────────────────────────────────┐
│ [Đại Dương Nhiệt Đới Sống Động / Rặng Núi Chân Trời]   │
│                                                        │
│     ┌────────────────────────────────────────────┐     │
│     │  BÀN CỜ 40 Ô & DIORAMA TRUNG TÂM           │     │
│     │                                            │     │
│     │  • Lộ diện 100% 40 ô cờ không bị che       │     │
│     │  • Bệ chân đế gỗ óc chó vát kim loại 19.2m │     │
│     │  • Viền nước ngọc bích & bọt sóng ôm sát   │     │
│     │  • Giảm >90 meshes/instances ngoại vi      │     │
│     └────────────────────────────────────────────┘     │
│                                                        │
│ [Hải âu / Ca-nô / Tàu viễn dương tạo hồn đại dương]   │
└────────────────────────────────────────────────────────┘
```

---

## 3. Rà Soát Bán Kính Ảnh Hưởng (Blast Radius Audit)

| Tiêu Chí | Đánh Giá Rủi Ro |
| :--- | :--- |
| **Mức độ rủi ro** | 🟡 **Slice-Bound** (Giới hạn trong tầng hiển thị 3D ngoại cảnh `src/client/3d/`). |
| **Tệp can thiệp trực tiếp** | • `src/client/3d/coastal_island_environment.tsx`<br>• `src/client/3d/board_layout.tsx` |
| **Downstream Consumers** | • `GameBoard` (Gameplay Tabletop)<br>• `SunnyIslandLobbyScene` (Lobby 3D Scene)<br>• Các bộ test hợp đồng: `coastal_dynamics.test.ts`, `coastal_island_environment.test.ts`, `imp80_...test.ts`. |
| **Phòng vệ rủi ro xấu nhất** | Bổ sung cờ `streamlined?: boolean` (mặc định `true`), duy trì đầy đủ các chuỗi ký tự SSOT trong mã nguồn để bảo đảm 100% test contract cũ tiếp tục PASS không bị regression. |

---

## 4. Chi Tiết Thay Đổi Kỹ Thuật

### 4.1. [MODIFY] [`src/client/3d/coastal_island_environment.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/coastal_island_environment.tsx)
- Hỗ trợ prop `streamlined?: boolean` (mặc định `true`).
- **Khi `streamlined === true`**:
  - Ẩn thềm cỏ tròn khổng lồ (`cylinderGeometry args={[15.6, 17.6, 0.26, 64]}` với `#22C55E`).
  - Ẩn các gờ cát ngoại vi (`#EFE5D8`, `#F3EBE1`) và dù bãi biển.
  - Ẩn cụm 60 cây dừa (`TropicalPalmsCluster`) và 32 cây nhiệt đới (`LayeredTropicalFoliage`) ngoại vi.
  - Ẩn nhà ga xe lửa (`TrainStationLandmark`) và đường băng sân bay (`AirportLandmark`) ngoại vi.
  - Tinh chỉnh đường kính nước nông ngọc bích (`shallowRef`) và bọt sóng ven bờ (`waveRef`) ôm sát chu vi bàn cờ (bán kính `13.8 - 15.5m`).
  - Bảo tồn 100% đại dương vô cực (`#0C4A6E`, `#0284C7`, `#0369A1`), rặng núi chân trời (`HorizonMountainRange`), tàu container, du thuyền, hải âu (`CoastalSeagulls`), ca-nô (`CoastalPatrolBoat`), mây trời và máy bay xa.
- **Khi `streamlined === false`**: Render đầy đủ hòn đảo cũ (đảm bảo tương thích ngược 100%).

### 4.2. [MODIFY] [`src/client/3d/board_layout.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_layout.tsx)
- Chuẩn hóa kích thước khung bàn gỗ óc chó `WALNUT_TABLE_Y` từ `args={[32, 0.2, 32]}` thành `args={[19.2, 0.2, 19.2]}`, tạo thành bệ sa bàn vát cạnh thanh lịch ôm gọn bên dưới `DioramaBoardRim` (`args={[18.4, 0.06, 18.4]}`), không bị nhô ra một khối hộp nâu thô 32m giữa biển.
- Giữ nguyên thẻ `<CoastalIslandEnvironment />` (kích hoạt chế độ tinh giản mặc định).

---

## 5. Kế Hoạch Kiểm Thử (Universal 4-Facet Behavioral Matrix)

Tạo test suite mới: `tests/client/imp107_streamlined_tabletop_diorama.test.ts` (16 atomic tests):
- **Facet 1 (Boundary & Range)**: Kiểm tra bệ gỗ óc chó chuẩn `[19.2, 0.2, 19.2]`, bọt sóng và nước nông ôm sát chu vi `r <= 16m`.
- **Facet 2 (Visual De-cluttering)**: Kiểm tra chế độ `streamlined` triệt tiêu 100% `tropical-palms-cluster`, không còn hàng cây 60 cây che khuất dải ô cạnh dưới; không còn nhà ga ngoại vi.
- **Facet 3 (Atmospheric Retention)**: Kiểm tra bảo tồn trọn vẹn đại dương Gerstner sóng động (`#0284C7`), nước ngọc bích (`#06B6D4`), hải âu, ca-nô và rặng núi chân trời.
- **Facet 4 (Center Diorama Integrity)**: Kiểm tra 100% các phân khu diorama trung tâm (`MiniatureCityDiorama`, cầu Ba Son, sông Sài Gòn, Landmark) hoạt động bình thường, không bị ảnh hưởng.

---

## 6. Tiêu Chuẩn Nghiệm Thu (Definition of Done)
1. `tests/client/imp107_streamlined_tabletop_diorama.test.ts`: 16/16 tests PASS.
2. Toàn bộ test suites dự án tiếp tục PASS 100% (213 suites, >4.175 tests).
3. `npx tsc --noEmit`: 0 lỗi TypeScript strict mode.
4. `npm run lint:ui`: 0 vi phạm 4 anti-patterns.
5. Rebuild Docker container và kiểm tra trực tiếp qua `curl http://localhost:3000` (HTTP 200 OK).
6. Bổ sung **Gotcha #139** vào `docs/domain/gotchas.md` và cập nhật `docs/master_roadmap.md`.
