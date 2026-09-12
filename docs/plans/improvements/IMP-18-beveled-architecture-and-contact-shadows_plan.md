# KẾ HOẠCH KỸ THUẬT: CẢI TIẾN IMP-18
# KHỬ BỎ CẢM GIÁC LEGO: BO VIỀN GÓC VÁT 3D (BEVELED ARCHITECTURE) & ĐỔ BÓNG TIẾP XÚC SA BÀN (CONTACT DEPTH & SHARP SHADOWS)

> **Mã số cải tiến:** IMP-18  
> **Thuộc chu trình:** Continuous Improvement & Ad-hoc Persistence (Hiến pháp `GEMINI.md`)  
> **Trạng thái:** ĐANG TRIỂN KHAI (IN PROGRESS)  
> **Mục tiêu:** Chuyển đổi toàn diện diện mạo sa bàn 3D từ cảm giác "mảnh nhựa lego đồ chơi ráp nối" sang chuẩn "Sa bàn Kiến trúc Đô thị Cao cấp (Architectural Miniature Diorama)", với các góc vát mềm mại (Bevel), bệ móng cắm sâu vào nền đất (Grounding Plinths) và bóng đổ tiếp xúc sắc nét không bị trôi (Zero Peter-Panning).

---

## 1. PHÂN TÍCH NGUYÊN NHÂN GỐC RỄ (ROOT CAUSE)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3 NGUYÊN NHÂN KỸ THUẬT KHIẾN SA BÀN BỊ LIÊN TƯỞNG ĐẾN ĐỒ CHƠI LEGO           │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Hình học BoxGeometry 90° sắc nhọn                                        │
│    - Các khối container cảng biển, xe cộ, toa tàu, nhà cửa dùng boxGeometry. │
│    - Cạnh góc vuông phẳng lì không bắt được dải highlight phản chiếu ánh sáng│
│    ──> Mắt người lập tức liên tưởng đến các khối gạch nhựa Lego tiêu chuẩn.  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. Màu sắc bão hòa nguyên bản (Primary Colors) không có gân PBR             │
│    - Cụm container bãi cảng dùng màu cơ bản: Đỏ cờ, Vàng chanh, Xanh dương.  │
│    - Không có rãnh kim loại dập sóng, không có đệm pallet, xếp như gạch Duplo│
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. Hiện tượng bóng bay (Peter-Panning) & Shadow Camera quá rộng             │
│    - DirectionalLight có shadow camera phủ diện tích 64x64 units (quá thừa). │
│    - Độ phân giải bóng trên mỗi công trình chỉ đạt 10-15 pixels.            │
│    - shadow-normalBias = 0.02 đẩy bóng rời xa chân công trình 2-3cm         │
│    ──> Các khối nhà trông như cắm hờ hững lơ lửng, không có trọng lượng.     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. GIẢI PHÁP KỸ THUẬT CHI TIẾT (4 TRỌNG TÂM ĐỘT PHÁ)

### 2.1. Trọng tâm 1: Tối Ưu Nguồn Sáng & Shadow Map Sắc Nét (`time_of_day_lighting.tsx`)
- **Thu hẹp Shadow Frustum**:
  * Hiện tại: `left: -32, right: 32, top: 32, bottom: -32` (bao quát cả biển xa không có vật thể đổ bóng).
  * Nâng cấp: `left: -14, right: 14, top: 14, bottom: -14`.
  * Hiệu quả: Toàn bộ 2048x2048 shadow map dồn trọn vẹn vào bàn cờ và sa bàn trung tâm, tăng mật độ pixel bóng lên gấp **5.2 lần**! Từng gờ mái nhà, thân cây và cọc mốc sẽ có bóng đổ sắc sảo.
- **Khử Hiện Tượng Peter-Panning**:
  * Giảm `shadow-normalBias` từ `0.02` xuống `0.003`.
  * Giảm `shadow-bias` từ `-0.0001` về `-0.00005`.
  * Chân các khối nhà, container và xúc xắc sẽ bám chặt đanh thép xuống mặt sàn, không còn khoảng hở trôi nổi.

### 2.2. Trọng tâm 2: Tái Thiết Kế Bãi Container Cảng Biển (`diorama_container_port.tsx`)
- Thay thế toàn bộ `boxGeometry` của các khối container bằng `RoundedBox args={[w, h, l]} radius={0.008} smoothness={2}`.
- Bổ sung chi tiết rãnh kim loại dập sóng (corrugated ribs) bằng vật liệu PBR có độ nhám tự nhiên (`roughness: 0.65`, `metalness: 0.45`).
- Tinh chỉnh bảng màu container theo chuẩn hàng hải quốc tế:
  * Xanh Maersk (#1E40AF pha ghi xám)
  * Đỏ Yang Ming (#991B1B đỏ trầm gạch)
  * Xanh rêu Evergreen (#166534)
  * Vàng đồng DHL (#D97706)
  * Trắng bạc Hapag-Lloyd (#E2E8F0)
- Bổ sung chân pallet kê hàng và vạch phân ô sơn sàn bến cảng, biến cụm container thành mô hình sa bàn cảng biển chuyên nghiệp.

### 2.3. Trọng tâm 3: Hoàn Thiện Bo Viền & Bệ Móng Cho Nhà C1, C2, C3 (`procedural_building.tsx`)
- **Nhà Phố C1 (Indochine Shophouse)**:
  * Thay thế các khối cửa gỗ gụ, cửa sổ kính và phào chỉ từ `boxGeometry` thành `RoundedBox` có mép bo siêu nhỏ (`radius: 0.005`).
  * Bổ sung chân vỉa hè lát đá vát mép tiếp xúc mặt đất giúp khối nhà hòa nhập hoàn hảo vào ô cờ.
- **Cao Ốc Sapphire C2 (Modern Commercial Complex)**:
  * Mái hiên đón khách (Canopy) và dải lam nhôm Titan chắn nắng chia tầng được chuyển sang `RoundedBox`.
  * Thân tháp kính có nẹp chỉ viền sắc nét, kính phản xạ IBL môi trường rực rỡ.
- **Quần Thể Landmark C3 (Art Deco Golden Landmark)**:
  * Cầu kính Skybridge trên không và các đường gờ trang trí được bo vát mép.
  * Bệ đá hoa cương đen chân tháp được nhấn sâu vào mặt bàn cờ.

### 2.4. Trọng tâm 4: Bo Góc Xe Cộ & Toa Tàu Ngoại Vi (`diorama_traffic.tsx` & `coastal_island_environment.tsx`)
- Xe buýt, taxi, xe tải mini trên các đại lộ ven vịnh: Thân vỏ xe dùng `RoundedBox` bo mép mềm mại, loại bỏ hình chữ nhật góc nhọn.
- Các toa tàu hàng trên đường ray ven đảo: Bo viền nóc toa và bổ sung khớp nối kim loại giữa các toa.

---

## 3. DANH MỤC TỆP THỰC THI & QUY CHUẨN LOC

| Thao tác | Đường dẫn tệp | LOC Hiện Tại | LOC Dự Kiến Sau Đổi | Ngưỡng Cho Phép |
| :--- | :--- | :--- | :--- | :--- |
| **[MODIFY]** | [`src/client/3d/time_of_day_lighting.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/time_of_day_lighting.tsx) | 185 LOC | ~190 LOC | <= 400 LOC |
| **[MODIFY]** | [`src/client/3d/diorama/diorama_container_port.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_container_port.tsx) | 221 LOC | ~245 LOC | <= 400 LOC |
| **[MODIFY]** | [`src/client/3d/procedural_building.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/procedural_building.tsx) | 422 LOC | ~445 LOC | <= 500 LOC |
| **[MODIFY]** | [`src/client/3d/diorama/diorama_heritage_district.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_heritage_district.tsx) | 149 LOC | ~165 LOC | <= 400 LOC |
| **[MODIFY]** | [`src/client/3d/diorama/diorama_traffic.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_traffic.tsx) | 192 LOC | ~205 LOC | <= 400 LOC |
| **[NEW]** | [`docs/plans/improvements/IMP-18-beveled-architecture-and-contact-shadows_plan.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/plans/improvements/IMP-18-beveled-architecture-and-contact-shadows_plan.md) | - | ~150 LOC | Documentation |
| **[NEW]** | [`docs/reports/improvements/IMP-18-beveled-architecture-and-contact-shadows_report.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/improvements/IMP-18-beveled-architecture-and-contact-shadows_report.md) | - | ~120 LOC | Documentation |

---

## 4. KẾ HOẠCH NGHIỆM THU (VERIFICATION PLAN)

1. **Kiểm tra biên dịch & Strict Type**: `npx tsc --noEmit` đạt 0 lỗi.
2. **Kiểm tra Quality Gates**: `npm run gate:quick` đạt 100% PASS (0 UI anti-patterns, 0 slop AST violations, duplication <= 4%).
3. **Kiểm tra hồi quy toàn diện**: `npm test` 117/117 test files PASS.
4. **Kiểm tra thị giác thực tế**: Chụp lại ảnh toàn cảnh 4K Retina 2x để xác minh sa bàn đã biến đổi thành mô hình kiến trúc thu nhỏ cao cấp, xóa bỏ triệt để cảm giác mảnh ghép Lego.
