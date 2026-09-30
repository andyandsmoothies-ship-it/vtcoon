# KẾ HOẠCH TRIỂN KHAI: IMP-233
# KHỬ GÃY KHÚC GÓC CUA CẦU CẠN METRO TUYẾN SỐ 1 & ĐỒNG BỘ NỀN MÓNG SA BÀN 3D

> **Mã định danh:** IMP-233  
> **Phân loại rủi ro:** Tier 2 (Full Rigor — 3D Geometry, Spline Kinematics & GPU Budget)  
> **Mục tiêu:** Nâng cấp độ phân giải phân đoạn dầm Metro từ 32 lên 96 phân đoạn, chuyển Catmull-Rom spline sang thuật toán Centripetal để triệt tiêu góc gãy 45°, thu gọn 4 thanh đá ba-lát mặt đất từ 14.2m xuống 10.6m để loại bỏ góc vuông 90° nhô ra ngoài khoảng không sa bàn.  
> **Bằng chứng thị giác gốc:** [`.agents/tmp/corner_close_up.png`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/corner_close_up.png)  

---

## 1. PHÂN TÍCH HIỆN TRẠNG & BẰNG CHỨNG HÌNH HỌC

Từ ảnh chụp sa bàn trực tiếp [`.agents/tmp/corner_close_up.png`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/corner_close_up.png):
1. **Khối đá ba-lát mặt đất (`DioramaBallastBed`) tạo góc vuông 90° nhọn:**
   - 4 thanh hộp tĩnh tại $Y = 0.018$ có kích thước `[14.2, 0.016, 0.36]` và `[0.36, 0.016, 14.2]` giao nhau ở $(\pm 7.1, \pm 7.1)$ tạo thành 4 góc vuông 90° nhọn hoắt.
   - Cầu cạn trên cao tại $Y = 0.44$ đã bẻ cong qua góc, làm lộ 4 góc vuông mặt đất chơ vơ bên dưới như một khiếm khuyết đồ họa.
2. **Rời rạc hóa quá thô (`VIADUCT_NUM_SEGMENTS = 32`):**
   - Với chu vi ray $L \approx 51.5\text{m}$, mỗi phân đoạn dài tới $1.69\text{m}$.
   - Tại khúc cua bán kính $1.5\text{m} - 2.0\text{m}$, chỉ có duy nhất 1 phân đoạn hộp chữ nhật cắt xiên $45^\circ$, nối với 2 thanh thẳng hai bên tạo thành góc gấp khúc sắc nhọn.
3. **Thuật toán Spline tham số hóa đồng nhất (`'catmullrom'`) gây vọt góc (Cusp Spikes):**
   - Phân bố điểm kiểm soát không đều khiến đạo hàm tiếp tuyến tại các khúc cua bị biến thiên đột ngột tới $38^\circ - 45^\circ$ giữa 2 bước lân cận.

---

## 2. KIẾN TRÚC GIẢI PHÁP KỸ THUẬT

```
[getRailroadTrackCurve] ──► CatmullRomCurve3 ('centripetal', tension: 0.15)
                                │ (Đạo hàm tiếp tuyến mượt mà, max step <= 22°)
                                ▼
                       [buildViaductGeometry]
                                │ (VIADUCT_NUM_SEGMENTS = 96, segLength ≈ 0.56m)
       ┌────────────────────────┼────────────────────────┐
       ▼                        ▼                        ▼
[VIADUCT_CURVED_SEGMENTS] [VIADUCT_PIERS]       [DioramaBallastBed Ground Slabs]
(96 dầm U-Girder #94A3B8) (16 trụ tròn #CBD5E1)  (4 thanh thẳng thu gọn 10.6m #475569)
(96 cặp ray thép #E2E8F0) (1 trụ vượt sông >=0.45m) (Triệt tiêu 4 góc vuông nhô thừa)
(96 tà vẹt gỗ #451A03)
```

---

## 3. NGÂN SÁCH DÒNG MÃ (LOC BUDGETS)

| Tệp vật lý | Phân loại Tier | LOC hiện tại | Dự kiến thêm/bớt | LOC sau nâng cấp | Trần quy định |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `src/client/3d/diorama/diorama_train_kinematics.ts` | Tier 2 | 266 | +1 / -1 | 266 | <= 500 LOC |
| `src/client/3d/diorama/diorama_railroad.tsx` | Tier 2 | 346 | +1 / -1 | 346 | <= 500 LOC |
| `tests/contracts/imp233_metro_viaduct_smooth_corners.test.ts` | Test Contract | 0 (Mới) | +330 | ~330 | <= 650 LOC |

---

## 4. CHI TIẾT CÁC NHIỆM VỤ THỰC THI (TASKS)

### Task 1: Nâng cấp Tham Số Đường Cong Spline Centripetal
**Target physical file**: `src/client/3d/diorama/diorama_train_kinematics.ts`  
**Enclosing Scope:** `getRailroadTrackCurve()` (dòng 61–66)  
```typescript
<<<<
export function getRailroadTrackCurve(): CatmullRomCurve3 {
  if (!cachedCurve) {
    cachedCurve = new CatmullRomCurve3(TRACK_POINTS.map((p) => p.clone()), true, 'catmullrom', 0.15);
  }
  return cachedCurve;
}
====
export function getRailroadTrackCurve(): CatmullRomCurve3 {
  if (!cachedCurve) {
    cachedCurve = new CatmullRomCurve3(TRACK_POINTS.map((p) => p.clone()), true, 'centripetal', 0.15);
  }
  return cachedCurve;
}
>>>>
```

### Task 2: Nâng Phân Đoạn Cầu Cạn Lên 96 Đoạn, Xuất Hợp Đồng & Tối Ưu Bố Trí Trụ
**Target physical file**: `src/client/3d/diorama/diorama_railroad.tsx`  
**Enclosing Scope 2.1:** Khai báo hằng số phân đoạn (dòng 47)  
```typescript
<<<<
const VIADUCT_NUM_SEGMENTS = 32;
====
export const VIADUCT_NUM_SEGMENTS = 96;
>>>>
```

**Enclosing Scope 2.2:** Vòng lặp bố trí trụ cầu cạn trong `buildViaductGeometry()` (dòng 81–91)  
```typescript
<<<<
    if (i % 2 === 0) {
      const isOverRiver = Math.abs(p.x) < 0.8;
      const baseElevation = isOverRiver ? -0.035 : 0.02;
      const pierHeight = 0.44 - baseElevation;
      const centerElevation = baseElevation + pierHeight / 2;
      pierList.push({
        pos: [p.x, centerElevation, p.z],
        height: pierHeight,
      });
    }
====
    if (i % 6 === 0) {
      const isOverRiver = Math.abs(p.x) < 0.8;
      const baseElevation = isOverRiver ? -0.035 : 0.02;
      const pierHeight = 0.44 - baseElevation;
      const centerElevation = baseElevation + pierHeight / 2;
      pierList.push({
        pos: [p.x, centerElevation, p.z],
        height: pierHeight,
      });
    }
>>>>
```

**Enclosing Scope 2.3:** Xuất hợp đồng dữ liệu hình học cầu cạn module-level (dòng 97)  
```typescript
<<<<
const { segments: VIADUCT_CURVED_SEGMENTS, piers: VIADUCT_PIERS } = buildViaductGeometry();
====
export const { segments: VIADUCT_CURVED_SEGMENTS, piers: VIADUCT_PIERS } = buildViaductGeometry();
>>>>
```

### Task 3: Thu Gọn 4 Dải Đá Ba-lát Mặt Đất Triệt Tiêu Góc Vuông Nhô Thừa
**Target physical file**: `src/client/3d/diorama/diorama_railroad.tsx`  
**Enclosing Scope:** Khối đá ba-lát tĩnh trong `DioramaBallastBed()` (dòng 109–124)  
```tsx
<<<<
      <mesh receiveShadow position={[0, 0.018, -6.9]}>
        <SafeBoxGeometry args={[14.2, 0.016, 0.36]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>
      <mesh receiveShadow position={[0, 0.018, 6.9]}>
        <SafeBoxGeometry args={[14.2, 0.016, 0.36]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>
      <mesh receiveShadow position={[-6.9, 0.018, 0]}>
        <SafeBoxGeometry args={[0.36, 0.016, 14.2]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>
      <mesh receiveShadow position={[6.9, 0.018, 0]}>
        <SafeBoxGeometry args={[0.36, 0.016, 14.2]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>
====
      <mesh receiveShadow position={[0, 0.018, -6.9]}>
        <SafeBoxGeometry args={[10.6, 0.016, 0.36]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>
      <mesh receiveShadow position={[0, 0.018, 6.9]}>
        <SafeBoxGeometry args={[10.6, 0.016, 0.36]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>
      <mesh receiveShadow position={[-6.9, 0.018, 0]}>
        <SafeBoxGeometry args={[0.36, 0.016, 10.6]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>
      <mesh receiveShadow position={[6.9, 0.018, 0]}>
        <SafeBoxGeometry args={[0.36, 0.016, 10.6]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>
>>>>
```

### Task 4: Kiểm Thử Hợp Đồng Trạm 1 (Station 1 QA Contract Suite)
**Target physical file**: `tests/contracts/imp233_metro_viaduct_smooth_corners.test.ts` (create new file)  
**Quy mô:** 16 atomic test cases (TC-233.01..TC-233.16) tuân thủ Universal 5-Facet Matrix:
- **Facet 1: Continuous Spline Smoothness (TC-233.01..TC-233.04)**:
  - `TC-233.01`: `getRailroadTrackCurve()` có max angular delta giữa 500 bước rời rạc $\le 25.0^\circ$ (triệt tiêu góc gãy $38^\circ - 45^\circ$).
  - `TC-233.02`: Chu vi spline $L$ nằm trong chuẩn $[50.0\text{m}, 58.0\text{m}]$.
  - `TC-233.03`: Khoảng đệm an toàn tới Nhà Thờ Đức Bà $(-4.5, 2.9) \ge 1.5\text{m}$.
  - `TC-233.04`: Tĩnh không thông thuyền vượt sông Sài Gòn tại $u = 0.06 \ge 0.45\text{m}$.
- **Facet 2: High-Resolution Viaduct Segmentation (TC-233.05..TC-233.08)**:
  - `TC-233.05`: `VIADUCT_NUM_SEGMENTS` đạt giá trị $96$ và `VIADUCT_CURVED_SEGMENTS.length === 96`.
  - `TC-233.06`: Lan can dầm U-Girder (#94A3B8) kết xuất ít nhất 192 dải lan can (96 cặp) tại cao độ $Y \ge 0.44\text{m}$.
  - `TC-233.07`: Dải ray đôi kim loại (#E2E8F0) kết xuất ít nhất 192 đoạn ray (96 cặp) bám sát spline.
  - `TC-233.08`: Móng tà vẹt (#451A03) kết xuất ít nhất 96 phân đoạn ôm sát spline.
- **Facet 3: Radial Piers & River Pier Superstructure (TC-233.09..TC-233.11)**:
  - `TC-233.09`: `VIADUCT_PIERS` kết xuất ít nhất 12 trụ cầu bê tông tròn (#CBD5E1) vươn tới $Y \ge 0.40\text{m}$.
  - `TC-233.10`: Có ít nhất 1 trụ cầu nhịp vượt sông cắm sâu xuống lòng sông với chiều cao trụ $\ge 0.45\text{m}$.
  - `TC-233.11`: Cột cần tiếp điện dọc hành lang (8 cột) có thanh vươn nằm trong dải $[0.15\text{m}, 0.25\text{m}]$.
- **Facet 4: Ground Ballast Bed De-collision (TC-233.12..TC-233.14)**:
  - `TC-233.12`: 4 thanh đá ba-lát mặt đất (#475569) trong `DioramaBallastBed` được thu gọn chiều dài $\le 11.5\text{m}$ (không còn kéo dài 14.2m tạo góc vuông nhô ra tại $(\pm 7.1, \pm 7.1)$).
  - `TC-233.13`: Cửa sổ 800 ký tự đầu tiên của `DioramaBallastBed` bảo toàn màu `#475569`, bề rộng $[0.30, 0.60]$, cao độ $Y \in [0.015, 0.035]$ cho `TC-230.18` và `TC-RBWS01.02-04`.
  - `TC-233.14`: Toàn bộ mesh dầm, ray, tà vẹt, trụ cầu và đá ba-lát đều tắt `castShadow={false}` (bảo toàn ngân sách GPU IMP-142).
- **Facet 5: Kinematic Stations & Visual Invariants (TC-233.15..TC-233.16)**:
  - `TC-233.15`: Ga Waterfront đỗ tại progress 0.12 (cả 3 toa nằm trên ke ga $[-2.7, -0.5]$) và Ga Landmark Bắc đỗ tại progress 0.62 (cả 3 toa trên ke ga $[0.5, 2.7]$).
  - `TC-233.16`: Bảo tồn 100% các data-testid: `diorama-railroad-ballast`, `diorama-model-railroad`, `diorama-waterfront-station`, `diorama-landmark-north-station`.

### Task 5: Xác Minh Thị Giác Sau Nâng Cấp (Visual Verification)
- Khởi chạy headless browser chụp lại góc cua sa bàn tại cùng tọa độ camera.
- So sánh trước / sau ([`.agents/tmp/corner_close_up.png`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/corner_close_up.png) vs `.agents/tmp/corner_close_up_imp233.png`).
- Thẩm định độ mượt của đường cong và sự triệt tiêu của góc vuông nhô thừa.
