# BÁO CÁO NGHIỆM THU THỰC NGHIỆM: CẢI TIẾN IMP-18
# KHỬ BỎ CẢM GIÁC LEGO: BO VIỀN GÓC VÁT 3D (BEVELED ARCHITECTURE) & ĐỔ BÓNG TIẾP XÚC SA BÀN (CONTACT DEPTH & SHARP SHADOWS)

> **Mã số cải tiến:** IMP-18  
> **Thuộc chu trình:** Continuous Improvement & Ad-hoc Persistence (Hiến pháp `GEMINI.md`)  
> **Kế hoạch tham chiếu:** [`docs/plans/improvements/IMP-18-beveled-architecture-and-contact-shadows_plan.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/plans/improvements/IMP-18-beveled-architecture-and-contact-shadows_plan.md)  
> **Trạng thái:** HOÀN TẤT THÀNH CÔNG (COMPLETED / 100% PASS)  
> **Ngày nghiệm thu:** 12/09/2026  

---

## 1. MỤC TIÊU VÀ BỐI CẢNH

Sau khi tích hợp Sideboard (IMP-17) và chụp ảnh kiểm chứng Retina 2x (3840x2160), người dùng nhận thấy giao diện 2D rất sắc nét nhưng cảnh quan 3D trên sa bàn vẫn còn cảm giác "mảnh nhựa lego ráp nối" thô cứng do:
1. **Góc vuông 90° nhân tạo**: Các khối nhà, container cảng biển và phương tiện giao thông sử dụng hình học `boxGeometry` phẳng sắc cạnh, không bắt được dải highlight viền bo.
2. **Hiện tượng Peter-Panning**: Đèn DirectionalLight có góc phủ shadow camera quá rộng (64x64 units) và `shadow-normalBias: 0.02` đẩy bóng tách rời chân công trình, làm các vật thể như đang lơ lửng, thiếu trọng lượng bám sàn.
3. **Màu sắc container thô sơ**: Các khối container xếp như gạch đồ chơi Duplo.

Cải tiến **IMP-18** giải quyết triệt để các vấn đề trên, biến sa bàn thành một tác phẩm **Mô hình Kiến trúc Thu nhỏ Cao cấp (Luxury Architectural Miniature Diorama)**.

---

## 2. KẾT QUẢ TRIỂN KHAI CHI TIẾT

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ CẢI TIẾN IMP-18: KIẾN TRÚC BO VIỀN & ĐỔ BÓNG TIẾP XÚC SẮC NÉT               │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. ÁNH SÁNG & ĐỔ BÓNG TIẾP XÚC (Zero Peter-Panning)                         │
│    - Thu hẹp Shadow Frustum từ [-32, 32] còn [-14, 14] (mật độ x5.2).       │
│    - shadow-normalBias: 0.003, shadow-bias: -0.00005.                       │
│    - Bổ sung Contact Shadow Plinths dưới chân công trình và bến cảng.       │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. CẢNG CONTAINER HÀNG HẢI PBR (Seaport Miniature)                          │
│    - Nền cầu cảng và container chuyển sang RoundedBox (R=0.008, PBR nhám).  │
│    - Màu sắc chuẩn hàng hải (Maersk, Yang Ming, Evergreen, Hapag, DHL).    │
│    - Cabin xe kéo bến cảng bo góc khí động học.                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. CÔNG TRÌNH ĐỊA ỐC C0 - C3 (Procedural Building)                          │
│    - C1 Nhà phố: Cửa gỗ, cửa sổ, phào chỉ, bảng hiệu bo viền mềm mại.       │
│    - C2 Cao ốc: Sảnh đón kính Sapphire, mái hiên canopy, lam nhôm bo viền.  │
│    - C3 Landmark: Tháp đôi, vương miện, skybridge kính bo cong sang trọng.  │
│    - Mỗi cấp công trình đều có tấm tiếp xúc bóng chân bệ (Contact Shadow).  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. KHU DI SẢN & GIAO THÔNG VI MÔ (Heritage & Traffic)                       │
│    - Chợ Bến Thành & Nhà thờ Đức Bà: Nền móng, thân nhà lồng bo viền.       │
│    - Xe buýt, taxi, sedan, SUV: Thân vỏ và cabin chuyển sang RoundedBox.    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Chi tiết các tệp đã cập nhật:
1. [`src/client/3d/time_of_day_lighting.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/time_of_day_lighting.tsx):
   - Thu hẹp shadow frustum từ `[-32, 32]` về `[-14, 14]` tập trung hoàn toàn vào bàn cờ, nâng mật độ texel bóng đổ gấp 5.2 lần.
   - Giảm `shadow-normalBias` từ `0.02` xuống `0.003` và `shadow-bias` từ `-0.0001` xuống `-0.00005`, triệt tiêu hoàn toàn hiện tượng bóng bay Peter-panning.
2. [`src/client/3d/diorama/diorama_container_port.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_container_port.tsx):
   - Cầu cảng bến chuyển sang `RoundedBox` (R=0.016).
   - Container chuyển sang `RoundedBox` (R=0.008) với PBR roughness 0.65, metalness 0.4.
   - Thêm tấm tiếp xúc đổ bóng `Contact Shadow Plinth` dưới chân bãi container.
   - Cabin xe đầu kéo bo góc khí động học.
3. [`src/client/3d/procedural_building.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/procedural_building.tsx):
   - Cấp 1 (Nhà phố shophouse): Cửa đi, cửa sổ tầng trên, gờ phào chỉ phân tầng, bảng hiệu đổi sang `RoundedBox`. Thêm tấm tiếp xúc bóng chân đế.
   - Cấp 2 (Cao ốc thương mại): Sảnh đón kính Sapphire (`ior=1.52`), mái hiên đón khách Canopy, các dải lam nhôm chắn nắng Titan, viền LED đổi sang `RoundedBox`. Thêm tấm tiếp xúc bóng chân đế.
   - Cấp 3 (Quần thể Landmark): Cửa sổ kính Sapphire tháp chính/phụ, cầu kính Skybridge trên không đổi sang `RoundedBox`. Thêm tấm tiếp xúc bóng chân bệ cẩm thạch đá hoa cương.
4. [`src/client/3d/diorama/diorama_heritage_district.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_heritage_district.tsx):
   - Chợ Bến Thành: Nền móng vỉa hè, khối nhà lồng và chân tháp đồng hồ chuyển sang `RoundedBox`, thêm contact shadow plinth.
   - Nhà thờ Đức Bà: Gian thánh đường chính và hai tháp chuông vuông chuyển sang `RoundedBox`, thêm contact shadow plinth.
5. [`src/client/3d/diorama/diorama_traffic.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_traffic.tsx):
   - Thân vỏ xe (`RoundedBox args={[w, h * 0.7, l]} radius={0.008}`) và cabin kính tối màu (`radius={0.005}`) bo cong khí động học.

---

## 3. KẾT QUẢ KIỂM THỬ THỰC NGHIỆM

### 3.1. Biên dịch TypeScript Strict & Quality Gates
- `npx tsc --noEmit`: **0 lỗi** (Thành công 100%).
- `npm run gate:quick`:
  * UI Linter: **0 anti-patterns**.
  * Slop AST Linter: **0 violations**.
  * Code Duplication: **1.88%** (ngưỡng cho phép <= 4.0%).

### 3.2. Kiểm thử Tự động Toàn diện (Full Automated Test Suite)
- Lệnh chạy: `npm test`
- Số lượng tệp kiểm thử: **117/117 test files PASS (100%)**.
- Tổng số bài test: **1.387/1.387 tests PASS (100%)**.
- Thời gian chạy: 119.71s (bao gồm toàn bộ kịch bản mô phỏng UAT ván đấu 2, 3, 4 người chơi).

### 3.3. Giới hạn Quy chuẩn Kích thước Tệp (Categorized File Limits)
- [`src/client/3d/procedural_building.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/procedural_building.tsx): 426 dòng (ngưỡng quy chuẩn UI/3D <= 500 dòng).
- [`src/client/3d/diorama/diorama_container_port.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_container_port.tsx): 238 dòng (ngưỡng quy chuẩn <= 400 dòng).
- [`src/client/3d/diorama/diorama_heritage_district.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_heritage_district.tsx): 154 dòng (ngưỡng quy chuẩn <= 400 dòng).
- [`src/client/3d/diorama/diorama_traffic.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_traffic.tsx): 190 dòng (ngưỡng quy chuẩn <= 400 dòng).
- [`src/client/3d/time_of_day_lighting.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/time_of_day_lighting.tsx): 185 dòng (ngưỡng quy chuẩn <= 400 dòng).

---

## 4. BẰNG CHỨNG HÌNH ẢNH 4K RETINA 2X (EVIDENCE)

Toàn bộ ảnh chụp thực tế từ Edge Headless CDP harness ở độ phân giải 3840x2160 (Retina 2x Lossless):

1. **Toàn cảnh sa bàn bàn cờ 3D với Beveled Architecture & Contact Shadows**:  
   ![Toàn cảnh sa bàn bàn cờ 3D](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/improvements/screenshots/imp18_01_beveled_board_overview.png)
   * *Đánh giá trực quan*: Bóng đổ dưới chân bệ tháp Landmark C3, bãi cảng container, bánh xe đu quay và xúc xắc trung tâm sắc sảo, cắm đanh thép xuống nền sa bàn. Các cạnh khối nhà đều bắt dải sáng specular tinh tế thay vì cạnh hộp lego thô.

2. **Toàn cảnh bàn cờ kết hợp Sideboard mở**:  
   ![Toàn cảnh bàn cờ kết hợp Sideboard mở](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/improvements/screenshots/imp18_02_board_and_sideboard_retina.png)
   * *Đánh giá trực quan*: Phối cảnh hài hòa giữa giao diện 2D sắc nét (Sideboard) và chiều sâu 3D sang trọng của sa bàn kiến trúc.

---

## 5. KẾT LUẬN

Cải tiến **IMP-18** đã hoàn thành xuất sắc mục tiêu đề ra:
- Khử bỏ triệt để cảm giác "mảnh nhựa lego nhỏ ráp vào".
- Đưa diện mạo sa bàn 3D lên chuẩn mô hình kiến trúc đô thị thu nhỏ cao cấp, tiệm cận tiêu chuẩn game thương mại quốc tế.
- Đảm bảo 100% Zero Regression trên toàn bộ 117 bộ kiểm thử của dự án.
