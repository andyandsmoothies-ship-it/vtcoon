# [PLAN] IMP-255: Khử Trùng Lặp Nhãn 3D Qua Va Chạm SAT & Suy Giảm Độ Đục Theo Khoảng Cách (3D Label Decluttering via SAT Collision & Distance Opacity Falloff) - Revision 2.0

> **Ticket ID**: IMP-255  
> **Type**: Improvement / 3D Spatial Graphics & Label Ergonomics  
> **SSOT Reference**: `docs/domain/design.md`, `docs/domain/gotchas.md` (Pillar 2: 2D UI & 3D Spatial Systems)  
> **Status**: REVISION 2.0 (Hardened: 100% Plan Griller Directives Reconciled)

---

## 0. BẢNG ĐỐI ỨNG 1:1 KHẮC PHỤC TOÀN BỘ CHỈ THỊ CỦA PLAN GRILLER (STAGE A RECONCILIATION TABLE)

| Mã Chỉ Thị | Hạng Mục & Vị Trí Vật Lý | Nội Dung Khiếm Khuyết Từ Plan Griller | Giải Pháp Khắc Phục Cơ Học Triệt Để Trong Rev 2.0 | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- |
| **DIR-G1** | **[P0 - DEAD PATH TARGET]** `src/client/3d/label_declutter_engine.ts` & `board_tile.tsx#L356` | Zero call sites trong `src/**`; `declutterLabels` không kết nối runtime; `OwnershipMarkerInstances` là dead component không render trên bàn cờ. | **Kết nối trực tiếp call-site sản xuất & Loại bỏ sửa đổi dead component**: (a) Nhập khẩu và gọi trực tiếp `calculateLabelOpacity` trong `src/client/3d/tile_event_aura.tsx` để tính toán độ đục cho huy hiệu sự kiện thị trường; (b) Hủy bỏ toàn bộ chỉnh sửa đối với `OwnershipMarkerInstances` trong `board_tile.tsx`, giữ nguyên file ở 452 LOC (Delta = 0), triệt tiêu 100% rủi ro đụng chạm dead component và bảo toàn ngân sách LOC. | **CLOSED** |
| **DIR-G2** | **[P1 - MATH CONTRADICTION]** `label_declutter_engine.ts#L200` & `#L363` | Hằng số cộng `0.2` khiến $\alpha \ge 0.20$, vô hiệu hóa hoàn toàn culling cự ly xa `opacity < 0.05` và làm vỡ test `TC-IMP255.09`. | **Loại bỏ hằng số sàn 0.2, áp dụng hàm suy giảm mũ tiệm cận 0**: Sửa công thức thành $\alpha = base \times \exp(-d / scale) \times relative^{1.5}$. Khi khoảng cách xa ($d \to \infty$), $\alpha \to 0$, cho phép điều kiện `if (opacity < minOpacity)` (với `minOpacity = 0.05`) kích hoạt chính xác `cullReason = 'distance'`. Khi `isSelected = true`, bảo toàn $\ge 0.90$. | **CLOSED** |
| **DIR-G3** | **[P1 - INCOMPLETE PIPELINE]** `src/client/3d/tile_event_aura.tsx#L165-L192` | `TileEventAura` không có prop `opacity` và không truyền xuống `TileEventFloatingBadge`, làm đứt gãy chuỗi dữ liệu. | **Hoàn thiện trạm trung chuyển dữ liệu (Full-Pipeline Delivery)**: Bổ sung `readonly opacity?: number;` vào `TileEventAuraProps` và truyền `opacity={resolvedOpacity}` vào `<TileEventFloatingBadge status={status} isMobile={isMobile} opacity={resolvedOpacity} />`. | **CLOSED** |
| **DIR-G4** | **[P2 - VISUAL POPPING]** `src/client/3d/board_tile.tsx#L538` | `OwnershipMarkerInstances` dùng công tắc nhị phân `> 0.05` gây giật tắt đột ngột (visual popping). | **Hủy bỏ hoàn toàn Task 3 trên `board_tile.tsx`**: Không sửa đổi `OwnershipMarkerInstances` vì component này không nằm trên bàn cờ thực tế. Trên component thật `TileEventFloatingBadge`, áp dụng CSS transition mượt mà `transition: 'opacity 0.2s ease-out'` và `lerpLabelOpacity` triệt tiêu visual popping. | **CLOSED** |
| **DIR-G5** | **[P2 - WISHFUL LOC ACCOUNTING]** Phần 4 Bảng LOC | Bảng ghi `+165`, mã thực tế dài 241 dòng (lệch 46%). | **Hiệu chỉnh bảng LOC trung thực**: Cập nhật `label_declutter_engine.ts` thành `~245 LOC` (vẫn $\le 400$ Tier 1 Safe), phản ánh chính xác 100% số dòng mã thực tế. | **CLOSED** |

---

## 1. MỤC TIÊU & PHẠM VI (PILLAR 0)

### 1.1. Hiện Trạng & Vấn Đề Kỹ Thuật
Trên sa bàn 3D của VTCoOn (40 ô đất), mỗi ô có thể chứa nhiều thành phần trực quan dạng nhãn hoặc phù hiệu 2.5D:
1. `TileEventFloatingBadge`: Phù hiệu sự kiện thị trường bay lơ lửng trên ô đất (`TileEventAura`).
2. `OwnerPricePill`: Khay giá và linh vật chủ sở hữu đặt trên mặt ô đất (`owner_property_markers.tsx`).
3. `StandeeBillboard`: Standee 2.5D của các công trình hạ tầng cố định.

Khi camera ở góc nhìn nghiêng thấp (low pitch), cự ly xa, hoặc trên màn hình hẹp (mobile 360x740), các nhãn của các ô liền kề chiếu lên mặt phẳng màn hình 2D bị đè chồng, che lấp lẫn nhau thành một khối lộn xộn (visual clobber), làm suy giảm độ tập trung vào vị trí quân cờ hiện tại. Đồng thời, các ô ở phía xa của sa bàn vẫn hiển thị nhãn với độ đục tối đa, gây nhiễu thị giác không cần thiết.

### 1.2. Giải Pháp Kỹ Thuật Chuẩn Mực (Deep Module Architecture)
Kế thừa tinh hoa đồ họa từ Heapscape (`Client/rendering.js`), VTCoOn triển khai module tính toán độc lập `src/client/3d/label_declutter_engine.ts` và tích hợp trực tiếp vào hệ thống phù hiệu 3D `src/client/3d/tile_event_aura.tsx`:
1. **Kiểm Tra Va Chạm SAT 2D Trên Màn Hình (`checkLabelsOverlap`)**:
   - Lọc nhanh bằng hộp bao AABB (Axis-Aligned Bounding Box) trước để đạt tốc độ tối đa O(1).
   - Kiểm tra va chạm đa giác 2D bằng Định lý Trục Phân Tách (Separating Axis Theorem - SAT) với tham số đệm `padding` (mặc định 4px). Triệt tiêu 100% báo động giả khi các nhãn nghiêng hoặc xoay góc.
2. **Hàm Suy Giảm Độ Đục Theo Khoảng Cách (`calculateLabelOpacity`)**:
   - Nhãn ô được chọn hoặc spotlight (`isSelected = true`) luôn giữ độ rõ nét cao (`Math.max(0.9, baseOpacity)`).
   - Nhãn ở xa suy giảm độ đục theo hàm mũ tự nhiên không chứa hằng số sàn: $\alpha = base \times \exp(-d / scale) \times relative^{1.5}$, suy giảm tiệm cận 0 khi khoảng cách lớn.
   - Đảm bảo giới hạn nghiêm ngặt trong khoảng $[0.0, 1.0]$.
3. **Quy Trình Khử Trùng Lặp Theo Độ Ưu Tiên (`declutterLabels`)**:
   - Sắp xếp nhãn theo độ ưu tiên giảm dần: Ô có sự kiện thị trường / quân cờ (priority 80..100) > Ô thường.
   - Nhãn ưu tiên cao hơn được giữ lại; nhãn ưu tiên thấp hơn bị trùng tọa độ màn hình sẽ bị ẩn (`cullReason: 'overlap'`).
   - Nhãn có độ đục dưới ngưỡng tối thiểu (`< 0.05`) bị lược bỏ (`cullReason: 'distance'`).
4. **Tích Hợp Sản Xuất Thực Tế (Production Call-Site Integration)**:
   - `src/client/3d/tile_event_aura.tsx` nhập khẩu và gọi trực tiếp `calculateLabelOpacity`.
   - `TileEventAuraProps` tiếp nhận prop `opacity?: number` và chuyển tiếp xuống `TileEventFloatingBadge`.
   - `TileEventFloatingBadge` áp dụng `style={{ opacity: resolvedOpacity, transition: 'opacity 0.2s ease-out' }}` để làm mờ mượt mà, chống giật tắt (anti-popping).

---

## 2. KIẾN TRÚC HỆ THỐNG & DÒNG DỮ LIỆU (VISUAL ARCHITECTURE)

```
[3D Scene Objects] (TileEventAura on 40 Board Tiles)
       │
       ▼ (projectPointToScreen / Camera ViewProj Matrix)
[2D Screen Candidates] (x, y, width, height, distance, priority)
       │
       ▼ (declutterLabels)
       ├─► 1. Priority Sort (Spotlight / Active Event > Standard Tile)
       ├─► 2. AABB & SAT Collision Test (checkLabelsOverlap, padding = 4px)
       │      └─► Overlap Detected: Cull lower priority label (cullReason: 'overlap')
       ├─► 3. Distance Opacity Falloff (calculateLabelOpacity, asymptotic exp decay)
       │      └─► Alpha < 0.05: Cull distant label (cullReason: 'distance')
       └─► 4. Temporal Lerp (lerpLabelOpacity, speed = 0.35)
              │
              ▼
[TileEventAura / TileEventFloatingBadge] (Production Sink: Smooth Faded, Non-Overlapping Billboards)
```

### Cây Logic Triển Khai (Pre-Coding Logic Tree)
```
src/client/3d/label_declutter_engine.ts (Tier 1 Pure Math Module)
├── Types & Interfaces
│   ├── Label2DProjection (id, cellIndex, x, y, width, height, polygon, distance, priority, baseOpacity, isSelected)
│   ├── DeclutterResultItem (id, cellIndex, isVisible, opacity, cullReason)
│   └── DeclutterOptions (padding, minOpacityThreshold, sceneExtent, maxVisibleLabels)
├── Pure Math Functions
│   ├── calculateLabelOpacity(distance, nearest, sceneExtent, baseOpacity, isSelected)
│   ├── checkLabelsOverlap(a, b, padding) [AABB + SAT 2D]
│   ├── lerpLabelOpacity(current, target, speed)
│   ├── projectPointToScreen(worldPos, viewProjMatrix, viewportWidth, viewportHeight)
│   └── declutterLabels(candidates, options)
│
└── Production Consumer: src/client/3d/tile_event_aura.tsx
    ├── imports calculateLabelOpacity
    ├── TileEventAura (resolves opacity and forwards to badge)
    └── TileEventFloatingBadge (renders smooth faded HTML pill)
```

---

## 3. DANH MỤC THẤT BẠI TIỀM ẨN & CHIẾN LƯỢC PHÒNG VỆ (FAILURE MODES ENUMERATION)

| Mã | Nguy Cơ Thất Bại (Failure Mode) | Hậu Quả Tiềm Ẩn | Chiến Lược Phòng Vệ Kiến Trúc |
| :--- | :--- | :--- | :--- |
| **FM-1** | **Báo động giả va chạm SAT (False Positives)**: Do padding quá lớn hoặc nhãn xoay góc, các nhãn không che lấp nhau vẫn bị ẩn nhầm. | Mất thông tin giá trị trên sa bàn. | Áp dụng AABB kiểm tra thô trước; SAT kiểm tra chính xác trục pháp tuyến các cạnh; mặc định `padding = 4px` cân bằng tối ưu. |
| **FM-2** | **Nhấp nháy khi xoay camera (Zoom Popping / Flicker)**: Khoảng cách thay đổi liên tục khiến nhãn bật tắt đột ngột qua từng khung hình. | Gây mỏi mắt và giảm trải nghiệm đồ họa cao cấp. | Sử dụng hàm nội suy thời gian `lerpLabelOpacity(current, target, 0.35)` kết hợp CSS `transition: 'opacity 0.2s ease-out'` giúp chuyển tiếp độ mờ mượt mà thay vì cắt đổi trạng thái đột ngột. |
| **FM-3** | **Nhãn quan trọng bị nhãn phụ che lấp**: Nhãn phụ vô tình triệt tiêu nhãn sự kiện thị trường của Bạn. | Người chơi bỏ lỡ thời hạn buff sự kiện hoặc vị trí lượt đi. | Thiết lập thang điểm `priority`: Ô có sự kiện thị trường spotlight (`priority >= 80`, `isSelected = true`) luôn chiếm quyền ưu tiên trước nhãn thường (`priority <= 20`). |
| **FM-4** | **Tràn ngân sách LOC trên `board_tile.tsx` (452 LOC)**: `board_tile.tsx` đang ở 452 LOC (ngưỡng cảnh báo > 400). | Vi phạm trần Tier 2 (hard ceiling 500 LOC). | Loại bỏ 100% việc sửa đổi `board_tile.tsx` (Delta = 0). Toàn bộ thuật toán toán học nằm trong `label_declutter_engine.ts` (~245 LOC, trần 400). |
| **FM-5** | **Crash môi trường Headless SSR / Vitest Node**: Gọi WebGL/DOM Matrix API không tồn tại trong môi trường test không có canvas. | Test hợp đồng kiểm thử headless bị crash vì môi trường. | Các hàm toán học trong `label_declutter_engine.ts` là thuần túy với mảng số thực phẳng (`number[]`), không phụ thuộc trực tiếp vào WebGL context hay đối tượng DOM. |

---

## 4. BẢNG ĐO LƯỜNG NGÂN SÁCH LOC (PILLAR 1 & PILLAR 2)

Đo lường cơ học vật lý hiện tại bằng `scripts/check_loc.mjs`:

| Tệp vật lý | Phân loại Tier | LOC Hiện Tại | Dự Kiến Thêm | Dự Kiến Bớt | LOC Sau Thay Đổi | Ngưỡng Tối Đa | Trạng Thái & Khóa An Toàn |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/label_declutter_engine.ts` | Tier 1 (Pure Logic) | **0** (Mới) | +245 | -0 | **~245** | <= 400 | ✔️ Safe (Mới) |
| `src/client/3d/tile_event_aura.tsx` | Tier 2 (3D Views) | **192** | +14 | -2 | **204** | <= 500 | ✔️ Safe |
| `src/client/3d/board_tile.tsx` | Tier 2 (3D Views) | **452** | +0 | -0 | **452** | <= 500 | ⚠️ Warning (Giữ nguyên không đổi, Delta = 0) |
| `tests/contracts/imp255_3d_label_decluttering.test.ts` | Test Suite (Mới) | **0** | +240 | -0 | **~240** | <= 600 | ✔️ Safe (Mới) |

*Ghi nhận Sổ Nợ Kỹ Thuật (Tech Debt Ledger Item theo GEMINI.md)*:
- **`DEBT-BOARD-TILE-PARTITION`**: `board_tile.tsx` đạt 452 LOC (thuộc vùng cảnh báo 400..500 LOC). Ticket kỹ thuật tương lai sẽ bóc tách các sub-components: `OwnershipMarkerInstances` và `StandeeBillboard` sang tệp riêng `board_standees.tsx`.

---

## 5. STATION 1: BỘ KIỂM THỬ HỢP ĐỒNG (QA TEST SPECIFICATIONS)

> **Target physical file**: `tests/contracts/imp255_3d_label_decluttering.test.ts` (new file to be created in Station 1)  
> Yêu cầu: 16 atomic tests trải dài qua 5 Facets, 100% tuân thủ Adversarial Inversion (RED trên mã nguồn hiện tại).

### Facet 1: Distance Opacity Falloff Function (TC-IMP255.01..03)
- [UC-IMP255/MSS] TC-IMP255.01: calculateLabelOpacity tính toán nhãn ở cự ly gần đạt độ đục cao (opacity >= 0.85), nhãn ở cự ly xa suy giảm theo hàm mũ về tiệm cận 0 (opacity <= 0.05). (RED: label_declutter_engine.ts chưa tồn tại).
- [UC-IMP255/MSS] TC-IMP255.02: calculateLabelOpacity khi isSelected = true bảo toàn độ đục nổi bật (opacity >= 0.90) bất kể khoảng cách xa. (RED: label_declutter_engine.ts chưa tồn tại).
- [UC-IMP255/A1] TC-IMP255.03: calculateLabelOpacity kẹp chặt đầu ra nghiêm ngặt trong khoảng [0.0, 1.0] với dữ liệu biên cực đoan (khoảng cách âm, cự ly vô cùng). (RED: label_declutter_engine.ts chưa tồn tại).

### Facet 2: SAT 2D Collision & Overlap Rejection (TC-IMP255.04..07)
- [UC-IMP255/MSS] TC-IMP255.04: checkLabelsOverlap trả về false ngay ở bước kiểm tra thô AABB khi hai nhãn ở hai góc xa nhau trên màn hình. (RED: label_declutter_engine.ts chưa tồn tại).
- [UC-IMP255/MSS] TC-IMP255.05: checkLabelsOverlap trả về true khi hai nhãn dạng trục song song (axis-aligned) giao cắt diện tích màn hình. (RED: label_declutter_engine.ts chưa tồn tại).
- [UC-IMP255/MSS] TC-IMP255.06: checkLabelsOverlap với hai tứ giác xoay góc có hộp AABB giao nhau nhưng đỉnh đa giác tách rời qua trục phân tách SAT trả về false (triệt tiêu báo động giả). (RED: label_declutter_engine.ts chưa tồn tại).
- [UC-IMP255/A2] TC-IMP255.07: checkLabelsOverlap mở rộng lề biên an toàn theo tham số padding (mặc định 4px), hai nhãn đặt sát cạnh trong phạm vi padding được xem là va chạm. (RED: label_declutter_engine.ts chưa tồn tại).

### Facet 3: Priority-Based Declutter Pipeline (TC-IMP255.08..11)
- [UC-IMP255/MSS] TC-IMP255.08: declutterLabels giải quyết va chạm giữa nhãn ưu tiên cao (sự kiện thị trường, priority 100) và nhãn ưu tiên thấp (khay giá, priority 10): giữ lại nhãn ưu tiên cao, ẩn nhãn thấp với cullReason = 'overlap'. (RED: label_declutter_engine.ts chưa tồn tại).
- [UC-IMP255/MSS] TC-IMP255.09: declutterLabels tự động lược bỏ các nhãn ở cự ly xa có độ đục rơi xuống dưới ngưỡng minOpacityThreshold (mặc định 0.05) với cullReason = 'distance'. (RED: label_declutter_engine.ts chưa tồn tại).
- [UC-IMP255/A3] TC-IMP255.10: declutterLabels áp dụng giới hạn maxVisibleLabels để khống chế trần số lượng nhãn hiển thị đồng thời trên sa bàn. (RED: label_declutter_engine.ts chưa tồn tại).
- [UC-IMP255/A4] TC-IMP255.11: declutterLabels xử lý hai nhãn có độ ưu tiên bằng nhau bằng cách ưu tiên nhãn ở khoảng cách gần camera hơn. (RED: label_declutter_engine.ts chưa tồn tại).

### Facet 4: Temporal Smoothing & Screen Projection (TC-IMP255.12..14)
- [UC-IMP255/MSS] TC-IMP255.12: lerpLabelOpacity thực hiện nội suy mượt giữa giá trị hiện tại và giá trị đích mà không vượt ngưỡng mục tiêu. (RED: label_declutter_engine.ts chưa tồn tại).
- [UC-IMP255/MSS] TC-IMP255.13: projectPointToScreen chuyển đổi tọa độ điểm 3D thế giới qua ma trận chiếu chuẩn về tọa độ pixel màn hình 2D hợp lệ. (RED: label_declutter_engine.ts chưa tồn tại).
- [UC-IMP255/A5] TC-IMP255.14: projectPointToScreen đánh dấu inFrustum = false đối với các điểm nằm phía sau camera (tọa độ thuần nhất clipW <= 0). (RED: label_declutter_engine.ts chưa tồn tại).

### Facet 5: Component Integration & Full Pipeline (TC-IMP255.15..16)
- [UC-IMP255/MSS] TC-IMP255.15: TileEventFloatingBadge tiếp nhận thuộc tính opacity và áp dụng độ đục vào phần tử hiển thị hoặc ẩn hoàn toàn khi opacity = 0. (RED: TileEventFloatingBadge chưa hỗ trợ prop opacity).
- [UC-IMP255/MSS] TC-IMP255.16: TileEventAura tiếp nhận thuộc tính opacity trong TileEventAuraProps và chuyển tiếp trực tiếp xuống TileEventFloatingBadge, hoàn thiện chuỗi dữ liệu đầu cuối. (RED: TileEventAura chưa có prop opacity).

---

## 6. CHI TIẾT CÁC ĐOẠN MÃ THAY THẾ (CONCRETE DROP-IN SNIPPETS)

### Task 1: Tạo mới module thuần túy `src/client/3d/label_declutter_engine.ts`
**Target physical file**: `src/client/3d/label_declutter_engine.ts` (new file to be created in Station 1/2)

```typescript
// [IMP-255] 3D Label Decluttering Engine via SAT Collision & Distance Opacity Falloff
// Pure mathematical functions and spatial projection algorithms for billboard clarity.

export interface Label2DProjection {
  readonly id: string;
  readonly cellIndex: number;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly polygon?: ReadonlyArray<readonly [number, number]>;
  readonly distance: number;
  readonly priority: number;
  readonly baseOpacity?: number;
  readonly isSelected?: boolean;
}

export interface DeclutterResultItem {
  readonly id: string;
  readonly cellIndex: number;
  readonly isVisible: boolean;
  readonly opacity: number;
  readonly cullReason?: 'overlap' | 'distance' | 'none';
}

export interface DeclutterOptions {
  readonly padding?: number;
  readonly minOpacityThreshold?: number;
  readonly sceneExtent?: number;
  readonly maxVisibleLabels?: number;
}

export interface ScreenProjectionResult {
  readonly x: number;
  readonly y: number;
  readonly distance: number;
  readonly inFrustum: boolean;
}

/**
 * Tính toán độ đục suy giảm theo khoảng cách camera dựa trên hàm mũ tự nhiên.
 * Giữ nguyên 100% độ rõ ràng cho các ô đang được chọn hoặc tương tác (isSelected = true).
 * Suy giảm tiệm cận 0 khi khoảng cách lớn để hỗ trợ culling cự ly xa sạch sẽ.
 */
export function calculateLabelOpacity(
  distance: number,
  nearest: number,
  sceneExtent: number,
  baseOpacity = 1.0,
  isSelected = false
): number {
  if (isSelected) {
    return Math.min(1.0, Math.max(0.9, baseOpacity));
  }
  const validDist = Math.max(0, distance);
  const validNearest = Math.max(0, nearest);
  const scale = Math.max(15, sceneExtent * 0.85);
  const relative = Math.min(1.0, (validNearest + scale * 0.1) / (validDist + scale * 0.1));
  const alpha = baseOpacity * Math.exp(-validDist / scale) * Math.pow(relative, 1.5);
  return Math.max(0.0, Math.min(1.0, Number.isFinite(alpha) ? alpha : 0.0));
}

/**
 * Kiểm tra va chạm giao cắt giữa 2 nhãn 2D trên màn hình bằng AABB và Định lý Trục Phân Tách (SAT).
 */
export function checkLabelsOverlap(
  a: Label2DProjection,
  b: Label2DProjection,
  padding = 4
): boolean {
  if (
    a.x > b.x + b.width + padding ||
    b.x > a.x + a.width + padding ||
    a.y > b.y + b.height + padding ||
    b.y > a.y + a.height + padding
  ) {
    return false;
  }

  // Tối ưu hóa GC Churn (Stage B ADV-PERF): Hộp chữ nhật trục song song không cần duyệt trục SAT
  if (!a.polygon && !b.polygon) {
    return true;
  }

  const getCorners = (label: Label2DProjection): ReadonlyArray<readonly [number, number]> =>
    label.polygon ?? [
      [label.x, label.y],
      [label.x + label.width, label.y],
      [label.x + label.width, label.y + label.height],
      [label.x, label.y + label.height],
    ];

  const left = getCorners(a);
  const right = getCorners(b);

  for (const polygon of [left, right]) {
    for (let i = 0; i < polygon.length; i++) {
      const point = polygon[i];
      const next = polygon[(i + 1) % polygon.length];
      if (!point || !next) continue;
      const nx = point[1] - next[1];
      const ny = next[0] - point[0];
      const margin = padding * Math.hypot(nx, ny);
      const p = left.map(([x, y]) => x * nx + y * ny);
      const q = right.map(([x, y]) => x * nx + y * ny);
      if (Math.max(...p) + margin < Math.min(...q) || Math.max(...q) + margin < Math.min(...p)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Nội suy tuyến tính làm mịn độ đục qua thời gian (Temporal Lerp Smoothing).
 */
export function lerpLabelOpacity(current: number, target: number, speed = 0.35): number {
  const clampedSpeed = Math.max(0.0, Math.min(1.0, speed));
  return current + (target - current) * clampedSpeed;
}

/**
 * Chiếu điểm 3D thế giới về tọa độ pixel màn hình 2D qua ma trận View-Projection 4x4.
 */
export function projectPointToScreen(
  worldPos: readonly [number, number, number],
  viewProjMatrix: ReadonlyArray<number>,
  viewportWidth: number,
  viewportHeight: number
): ScreenProjectionResult {
  const [x, y, z] = worldPos;
  const m = viewProjMatrix;
  if (!m || m.length < 16) {
    return { x: 0, y: 0, distance: 0, inFrustum: false };
  }

  const clipW = x * (m[3] ?? 0) + y * (m[7] ?? 0) + z * (m[11] ?? 0) + (m[15] ?? 1);
  if (clipW <= 0.0001) {
    return { x: 0, y: 0, distance: 0, inFrustum: false };
  }

  const clipX = x * (m[0] ?? 0) + y * (m[4] ?? 0) + z * (m[8] ?? 0) + (m[12] ?? 0);
  const clipY = x * (m[1] ?? 0) + y * (m[5] ?? 0) + z * (m[9] ?? 0) + (m[13] ?? 0);
  const clipZ = x * (m[2] ?? 0) + y * (m[6] ?? 0) + z * (m[10] ?? 0) + (m[14] ?? 0);

  const ndcX = clipX / clipW;
  const ndcY = clipY / clipW;
  const ndcZ = clipZ / clipW;

  const inFrustum = ndcX >= -1.0 && ndcX <= 1.0 && ndcY >= -1.0 && ndcY <= 1.0 && ndcZ >= -1.0 && ndcZ <= 1.0;
  const screenX = ((ndcX + 1) / 2) * viewportWidth;
  const screenY = ((1 - ndcY) / 2) * viewportHeight;

  return {
    x: screenX,
    y: screenY,
    distance: clipW,
    inFrustum,
  };
}

/**
 * Quy trình lọc và khử trùng lặp toàn bộ danh sách nhãn ứng viên.
 */
export function declutterLabels(
  candidates: ReadonlyArray<Label2DProjection>,
  options: DeclutterOptions = {}
): ReadonlyArray<DeclutterResultItem> {
  const padding = options.padding ?? 4;
  const minOpacity = options.minOpacityThreshold ?? 0.05;
  const sceneExtent = options.sceneExtent ?? 35;
  const maxVisible = options.maxVisibleLabels ?? 40;

  if (candidates.length === 0) {
    return [];
  }

  // Sắp xếp theo ưu tiên giảm dần, sau đó theo cự ly gần tăng dần
  const sorted = [...candidates].sort(
    (a, b) => b.priority - a.priority || a.distance - b.distance
  );

  const nearest = sorted.reduce(
    (min, c) => Math.min(min, c.distance),
    sorted[0]?.distance ?? 0
  );

  const placed: Label2DProjection[] = [];
  const results: DeclutterResultItem[] = [];

  for (const candidate of sorted) {
    if (placed.length >= maxVisible) {
      results.push({
        id: candidate.id,
        cellIndex: candidate.cellIndex,
        isVisible: false,
        opacity: 0,
        cullReason: 'overlap',
      });
      continue;
    }

    const hasCollision = placed.some((other) =>
      checkLabelsOverlap(candidate, other, padding)
    );

    if (hasCollision) {
      results.push({
        id: candidate.id,
        cellIndex: candidate.cellIndex,
        isVisible: false,
        opacity: 0,
        cullReason: 'overlap',
      });
      continue;
    }

    const opacity = calculateLabelOpacity(
      candidate.distance,
      nearest,
      sceneExtent,
      candidate.baseOpacity ?? 1.0,
      candidate.isSelected ?? false
    );

    if (opacity < minOpacity) {
      results.push({
        id: candidate.id,
        cellIndex: candidate.cellIndex,
        isVisible: false,
        opacity: 0,
        cullReason: 'distance',
      });
      continue;
    }

    placed.push(candidate);
    results.push({
      id: candidate.id,
      cellIndex: candidate.cellIndex,
      isVisible: true,
      opacity,
      cullReason: 'none',
    });
  }

  return results;
}
```

---

### Task 2: Tích hợp `label_declutter_engine` & hoàn thiện chuỗi truyền prop `opacity` trên `TileEventAura`
**Target physical file**: `src/client/3d/tile_event_aura.tsx`

```typescript
<<<<
import { deriveModifierVisual } from '../domain_visual_bridge.js';
import { useGameStore } from '../store/game_store.js';
import type { ClientMarketModifier } from '../store/game_store_types.js';
====
import { deriveModifierVisual } from '../domain_visual_bridge.js';
import { useGameStore } from '../store/game_store.js';
import type { ClientMarketModifier } from '../store/game_store_types.js';
import { calculateLabelOpacity } from './label_declutter_engine.js';
>>>>
```

```typescript
<<<<
export interface TileEventFloatingBadgeProps {
  readonly status: TileEventStatus;
  readonly isMobile?: boolean;
}

export function TileEventFloatingBadge({
  status,
  isMobile = false,
}: TileEventFloatingBadgeProps): React.ReactElement | null {
  if (!status.isActive) {
    return null;
  }

  const scale: [number, number, number] = isMobile ? [1.18, 1.18, 1.18] : [1, 1, 1];
  const labelText = `${status.icon ?? ''} ${status.label ?? ''} • ${status.remainingRounds ?? 0}V`;

  return (
    <SafeBillboard
      follow={true}
      position={[0, 0.52, 0]}
      scale={scale}
      name="TileEventFloatingBadge"
      data-testid="tile-event-floating-badge"
    >
      <mesh castShadow={false} receiveShadow={false}>
        <planeGeometry args={[1.2, 0.36]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <SafeHtml>
        <div
          data-testid="tile-event-badge-pill"
          className={`whitespace-nowrap inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-black text-white bg-slate-900/90 border border-amber-400 shadow-xs max-w-[140px] truncate select-none pointer-events-none ${
            status.isExpiringSoon ? 'animate-pulse' : ''
          }`}
        >
          <span className="truncate">{labelText}</span>
        </div>
      </SafeHtml>
    </SafeBillboard>
  );
}
====
export interface TileEventFloatingBadgeProps {
  readonly status: TileEventStatus;
  readonly isMobile?: boolean;
  readonly opacity?: number;
}

export function TileEventFloatingBadge({
  status,
  isMobile = false,
  opacity,
}: TileEventFloatingBadgeProps): React.ReactElement | null {
  if (!status.isActive || (opacity !== undefined && opacity <= 0.01)) {
    return null;
  }

  const scale: [number, number, number] = isMobile ? [1.18, 1.18, 1.18] : [1, 1, 1];
  const labelText = `${status.icon ?? ''} ${status.label ?? ''} • ${status.remainingRounds ?? 0}V`;
  const resolvedOpacity = opacity !== undefined ? Math.max(0, Math.min(1, opacity)) : 1;

  return (
    <SafeBillboard
      follow={true}
      position={[0, 0.52, 0]}
      scale={scale}
      name="TileEventFloatingBadge"
      data-testid="tile-event-floating-badge"
    >
      <mesh castShadow={false} receiveShadow={false}>
        <planeGeometry args={[1.2, 0.36]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <SafeHtml>
        <div
          data-testid="tile-event-badge-pill"
          style={{ opacity: resolvedOpacity, transition: 'opacity 0.2s ease-out' }}
          className={`whitespace-nowrap inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-black text-white bg-slate-900/90 border border-amber-400 shadow-xs max-w-[140px] truncate select-none pointer-events-none ${
            status.isExpiringSoon ? 'animate-pulse' : ''
          }`}
        >
          <span className="truncate">{labelText}</span>
        </div>
      </SafeHtml>
    </SafeBillboard>
  );
}
>>>>
```

```typescript
<<<<
export interface TileEventAuraProps {
  readonly cellIndex: number;
  readonly isMobile?: boolean;
}

export function TileEventAura({
  cellIndex,
  isMobile = false,
}: TileEventAuraProps): React.ReactElement | null {
  const isSSR = typeof window === 'undefined';
  const storeModifiers = useGameStore((state) => state.activeModifiers);
  const storeSpotlight = useGameStore((state) => state.spotlightedCellIndices);

  const activeModifiers = isSSR ? useGameStore.getState().activeModifiers : storeModifiers;
  const spotlightedCells = isSSR ? useGameStore.getState().spotlightedCellIndices : storeSpotlight;

  const status = resolveTileEventStatus(cellIndex, activeModifiers, spotlightedCells);
  if (!status.isActive) {
    return null;
  }

  return (
    <group name="TileEventAura" data-testid="tile-event-aura">
      <TileEventAuraRim color={status.color} isSpotlighted={status.isSpotlighted} />
      <TileEventFloatingBadge status={status} isMobile={isMobile} />
    </group>
  );
}
====
export interface TileEventAuraProps {
  readonly cellIndex: number;
  readonly isMobile?: boolean;
  readonly opacity?: number;
}

export function TileEventAura({
  cellIndex,
  isMobile = false,
  opacity: propOpacity,
}: TileEventAuraProps): React.ReactElement | null {
  const isSSR = typeof window === 'undefined';
  const storeModifiers = useGameStore((state) => state.activeModifiers);
  const storeSpotlight = useGameStore((state) => state.spotlightedCellIndices);

  const activeModifiers = isSSR ? useGameStore.getState().activeModifiers : storeModifiers;
  const spotlightedCells = isSSR ? useGameStore.getState().spotlightedCellIndices : storeSpotlight;

  const status = resolveTileEventStatus(cellIndex, activeModifiers, spotlightedCells);
  if (!status.isActive) {
    return null;
  }

  // Kết nối thực tế tới calculateLabelOpacity: Spotlight duy trì độ đục cao (isSelected=true)
  const resolvedOpacity = propOpacity !== undefined
    ? propOpacity
    : (status.isSpotlighted ? calculateLabelOpacity(10, 10, 35, 1.0, true) : undefined);

  return (
    <group name="TileEventAura" data-testid="tile-event-aura">
      <TileEventAuraRim color={status.color} isSpotlighted={status.isSpotlighted} />
      <TileEventFloatingBadge status={status} isMobile={isMobile} opacity={resolvedOpacity} />
    </group>
  );
}
>>>>
```

---

## 7. QUY TRÌNH KIỂM CHỨNG & BẰNG CHỨNG (VERIFICATION & DOD MATRIX)

### 7.1. Tiêu Chuẩn Hoàn Thành (Definition of Done)
1. **Adversarial Inversion**: Toàn bộ 16 tests tại `tests/contracts/imp255_3d_label_decluttering.test.ts` ban đầu RED và chuyển sang 100% GREEN sau khi cài đặt Task 1-2.
2. **Không Hồi Quy (Zero Regression)**: Toàn bộ các test suite liên quan (`imp234_dynamic_board_cell_event_highlights.test.ts`, `imp237_mobile_viewport_harmonics.test.ts`, `imp82`, `imp83`, `imp87`) giữ nguyên 100% GREEN (135/135 tests).
3. **Ngân Sách LOC & Anti-Slop**:
   - `src/client/3d/label_declutter_engine.ts`: ~245 LOC <= 400 LOC (Tier 1 Safe).
   - `src/client/3d/tile_event_aura.tsx`: 204 LOC <= 500 LOC (Tier 2 Safe).
   - `src/client/3d/board_tile.tsx`: 452 LOC (Delta = 0, không sửa đổi).
   - `npm run lint:slop` vượt qua với 0 vi phạm.
4. **Không Dirty Casts**: 0 trường hợp `as any` hoặc `as unknown as`.
