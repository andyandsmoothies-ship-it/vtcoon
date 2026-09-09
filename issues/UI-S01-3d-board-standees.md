# Ticket UI-S01: Sa Bàn 3D Procedural & Standee 2.5D Billboard 40 Ô Địa Phương

> **Epic:** 3D Visual & DOM UI/UX Overlay (Giai đoạn 2)
> **Slice:** UI-01 (Slice đầu tiên — Thi công ngay)
> **Ưu tiên:** P0 — Nền tảng bắt buộc cho mọi Slice sau
> **Trạng thái:** 🔵 SẴN SÀNG THI CÔNG
> **Phụ thuộc:** Epic 1 Sign-off (433/433 Tests PASS) ✅

---

## 1. Bối Cảnh & Vấn Đề Hiện Tại

File `src/client/game_canvas.tsx` hiện tại (56 dòng) render bàn cờ bằng **khối hộp hình học thô** (`boxGeometry`) màu xám đơn sắc và quân cờ hình cầu. Toàn bộ 40 ô địa phương không có bản sắc văn hóa — không màu nhóm đất, không tên địa danh, không hình ảnh đại diện.

**Vấn đề cần giải quyết:**
```
[Hiện tại]                          [Mục tiêu UI-01]
BoxGeometry xám đơn sắc        →    Đế 3D có chất liệu gỗ/đá mịn
Camera perspective fov:50       →    OrthographicCamera Isometric zoom:35
Không có màu nhóm đất           →    Vạch màu nhận diện 6 nhóm
Không có Standee                →    Billboard 2.5D xoay theo camera
Quân cờ sphere bất động         →    Standee Pawn placeholder (chuẩn bị UI-02)
Không có Tier Marker            →    Cylinder Marker tương ứng cấp độ
```

---

## 2. Use Case Tham Chiếu

| UC Ref | Tên | Phạm vi UI-01 |
|---|---|---|
| UC-GAME-004 | Hiển thị bàn cờ trạng thái đồng bộ | Render 40 ô đúng tọa độ + cấp độ hiện tại |
| UC-GAME-016 | Di chuyển quân cờ | Vị trí pawn placeholder đặt đúng ô (animation ở UI-02) |
| design.md §1-4 | 28 ô tài sản + màu sắc địa phương | Vạch màu nhóm đất, tên ô, Standee asset mapping |
| ADR-0002 §4-5 | LayeredDioramaTile + OrthographicCamera | Toàn bộ cấu trúc kỹ thuật component |

---

## 3. Phạm Vi Công Việc (Scope)

### 3.1 Xóa Code Cũ (Delete/Replace)

| File | Thay đổi |
|---|---|
| `src/client/game_canvas.tsx` | Xóa `BoardCellMesh` (hộp xám) và `TokenMesh` (sphere). Giữ `cellPosition()` và `GameCanvas` wrapper. Tích hợp component mới. |

### 3.2 Tạo Mới (New Files)

#### [NEW] `src/client/3d/board_tile.tsx`
Component `LayeredDioramaTile` — cấu trúc 3 phần tử theo ADR-0002 §4:

```
LayeredDioramaTile
├── Khối Đế (Base Mesh)
│   ├── boxGeometry [1.8, 0.2, 2.2] — chất liệu gỗ/đá (MeshStandardMaterial + normalMap)
│   └── Vạch Màu Nhóm Đất (PlaneGeometry ngang đỉnh đế)
├── Standee 2.5D (Billboard Entity)
│   ├── <Billboard follow> — xoay theo OrthographicCamera
│   └── <Image url={asset.main}> — WebP 512×512 transparent
└── Tier Marker (Cylinder Group)
    └── N cylinders (N = currentLevel) — Teal cấp 1-2, Gold cấp 3
```

**Props:**
```typescript
interface LayeredDioramaTileProps {
  config: BoardTileConfig;        // Từ BOARD_CONFIG
  position: [number, number, number];
  currentLevel: number;           // 0-3, đọc từ gameStore
  isCornerTile?: boolean;         // Ô góc: GO, Jail, Free Park, Go-To-Jail
  onClick: () => void;
}
```

#### [NEW] `src/client/3d/board_layout.tsx`
Component `GameBoard` — phân phối 40 tile theo tọa độ:
- Gọi `cellPosition(index)` cho mỗi ô (giữ nguyên hàm đã có)
- Render `LayeredDioramaTile` thay cho `BoardCellMesh`
- Render ô góc (index 0, 10, 20, 30) với `isCornerTile=true` và kích thước 2×2

#### [MODIFY] `src/client/game_canvas.tsx`
Nâng cấp:
- Thay `camera={{ position, fov }}` thành `<OrthographicCamera makeDefault position={[25,25,25]} zoom={35} near={-50} far={200} />`
- Thêm `<OrbitControls enableRotate={false} enablePan enableZoom minZoom={25} maxZoom={50} />`
- Thay `BoardCellMesh` thành `<GameBoard />`
- Thêm `shadow` prop vào `<Canvas>`
- Thêm `<directionalLight castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />`

---

## 4. Bảng Màu Nhóm Đất (SSOT — design.md)

| Nhóm | Màu | HEX | Ô thuộc nhóm |
|---|---|---|---|
| Tây Nam Bộ | Nâu Đất | #8B5E3C | 01 Cần Thơ, 03 An Giang |
| Duyên hải Miền Trung | Hồng San Hô | #FF6B6B | 11 Mũi Né, 13 Đà Lạt, 14 Nha Trang |
| Bắc Trung Bộ | Cam Nắng | #FF8C42 | 16 Bình Định, 18 Huế, 19 Đà Nẵng |
| Cửa ngõ Bắc | Đỏ Đô | #C0392B | 21 Sầm Sơn, 23 Nghệ An, 24 Ninh Bình |
| Đô thị Bắc | Vàng Ánh Kim | #F1C40F | 26 Hải Phòng, 27 Phú Quốc, 29 Hạ Long |
| Đô thị lõi HN-HCM | Xanh Lục Bảo / Tím Hoàng Gia | #27AE60 / #8E44AD | 31-32 Hà Nội, 37-39 TP.HCM |
| Hạ tầng Giao thông | Xám Titan viền Cyan | #95A5A6 | 05 Long Thành, 15 Cái Mép, 25 Cao Tốc, 35 Nội Bài |
| Tiện ích Năng lượng | Xanh Coban | #2471A3 | 12 EVN, 28 Viettel |

---

## 5. Cấu Trúc Tọa Độ Sa Bàn (SSOT — cellPosition)

Hàm `cellPosition(index)` hiện có tại `game_canvas.tsx` giữ nguyên không thay đổi — chỉ cần di chuyển vào `board_layout.tsx`:

```
Cạnh 0 (index 0-9):   Z=+GRID, X từ +GRID về -GRID
Cạnh 1 (index 10-19): X=-GRID, Z từ +GRID về -GRID
Cạnh 2 (index 20-29): Z=-GRID, X từ -GRID về +GRID
Cạnh 3 (index 30-39): X=+GRID, Z từ -GRID về +GRID
GRID = 9, CELL_SIZE = 1
```

---

## 6. Asset Pipeline — Slice UI-01 (Placeholder Mode)

Slice UI-01 KHÔNG yêu cầu asset WebP thật. Standee dùng placeholder màu nhóm đất khi chưa có file WebP.

**Quy tắc fallback:**
```typescript
// Nếu asset chưa có → render plane với màu nhóm đất
const hasAsset = !!config.levels[currentLevel]?.assets?.main;
// hasAsset=false → render PlaneGeometry với màu groupColor
// hasAsset=true  → render Billboard + Image
```

**Cấu trúc thư mục asset (chuẩn bị sẵn, nạp dần):**
```
public/assets/tiles/
├── tile_01_lvl0.webp   (Cần Thơ - Cấp 0)
├── tile_01_lvl1.webp
├── tile_01_lvl2.webp
├── tile_01_lvl3.webp
└── ... (28 ô × 4 cấp = 112 files WebP tối đa)
```

---

## 7. Test Contracts (Adversarial Inversion Required)

| Mã TC | Kịch bản | Kết quả Kỳ vọng | Adversarial Check |
|---|---|---|---|
| TC-UI01.1 | Khởi tạo GameCanvas | 40 mesh render, không chồng lấn, camera zoom=35 | Đặt zoom=10 → canvas quá rộng → test FAIL |
| TC-UI01.2 | Ô có groupColor | Vạch màu HEX đúng, phân biệt 6 nhóm | Đặt sai HEX → vạch màu sai → test FAIL |
| TC-UI01.3 | Billboard Standee | Mặt phẳng hướng về camera | Bỏ follow prop → Standee cố định → test FAIL |
| TC-UI01.4 | currentLevel=2 | 2 cylinder Teal, không có Gold | Set level=3 → cylinder Gold xuất hiện → test FAIL nếu expect Teal |
| TC-UI01.5 | Ô góc (index 0,10,20,30) | Mesh 2×2 riêng biệt, nền xám đậm | Dùng mesh thường 1×1 → test FAIL |

---

## 8. Kế Hoạch Thi Công (Thứ Tự Task)

```
Task 1: Tạo board_tile.tsx — LayeredDioramaTile
Task 2: Tạo board_layout.tsx — GameBoard (40 ô + ô góc 2×2)
Task 3: Nâng cấp game_canvas.tsx — OrthographicCamera + OrbitControls + shadows
Task 4: Viết unit tests TC-UI01.1 → TC-UI01.5 + Adversarial Inversion
Task 5: Xác minh 433 server-side tests PASS + build không lỗi TypeScript
```

---

## 9. Điều Kiện Hoàn Thành (Definition of Done)

- [ ] `board_tile.tsx` mới có đủ: đế 3D, vạch màu nhóm đất, Billboard placeholder, Tier Markers.
- [ ] `board_layout.tsx` render đúng 40 ô theo `cellPosition()`, ô góc kích thước 2×2.
- [ ] `game_canvas.tsx` dùng OrthographicCamera zoom=35, không còn `BoxGeometry` thô.
- [ ] TC-UI01.1 → TC-UI01.5 PASS với Adversarial Inversion.
- [ ] 433 server-side tests vẫn PASS (Zero Regression).
- [ ] Zero TypeScript error (strict: true), zero any.
- [ ] Mỗi file trong giới hạn LOC quy định.
- [ ] Fallback placeholder hoạt động khi chưa có WebP asset.

---

## 10. Nợ Kỹ Thuật Dự Kiến Đăng Ký Sang UI-02

| Mã Nợ | Mô tả | Slice Nhận |
|---|---|---|
| DEBT-UI01-01 | Preloading 28 bộ WebP bằng useImage.preload() khi Lobby load | UI-02 Task 1 |
| DEBT-UI01-02 | Hoạt ảnh nhấp nhô điều hòa sin(omega*t) trên Standee | UI-02 Task 2 |
