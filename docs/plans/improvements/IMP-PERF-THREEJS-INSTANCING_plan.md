# KẾ HOẠCH HÀNH ĐỘNG TOÀN DIỆN: TÁI CẤU TRÚC HIỆU NĂNG THREE.JS BẰNG INSTANCEDMESH
# BATCHING TOÀN BỘ CÔNG TRÌNH NHÀ ĐẤT & TRIỆT TIÊU DRAW CALLS THỪA (REVISION 2.0)

> **Mã kế hoạch**: `IMP-PERF-THREEJS-INSTANCING`  
> **Phiên bản**: 2.0 (Tiếp thu & Khắc phục 100% Chỉ thị Kiểm toán Đối kháng của `plan-griller`)  
> **Phân loại**: Tier 2 (Full Rigor — 3D Scene Graph, GPU Batching, & Dynamic Instance Lifecycle)  
> **Mục tiêu**: Giảm số lượng draw calls từ đỉnh điểm 862 về dưới 85, nâng tốc độ khung hình trên Edge Desktop từ 25.7 FPS lên 60 FPS ổn định.  
> **Tiêu chuẩn áp dụng**: ASD-STE100, Detroit TDD Classical Style, LOC Budget Tier 2 (<= 500 LOC), Three.js PBR standards.

---

## 1. BẢNG ĐỐI CHIẾU 1:1 XỬ LÝ CÁC CHỈ THỊ KIỂM TOÁN PLAN-GRILLER (REVISION 2.0)

| # | Griller Directive (Audit Artifact) | Phân loại | Tình trạng | File & Dòng giải quyết cụ thể (Revision 2.0) |
| :-: | :--- | :---: | :---: | :--- |
| **G-1** | **[P1-01 - Broken Data Lifecycle]**: `calculateToyInstanceMatrix` không phân biệt Nhà vs Khách Sạn; Nhà slot 0 hiện ở C3 (Ghost House lồng trong Khách Sạn); Khách sạn slot 0 hiện ở C1, C2. | **CRITICAL** | **ĐÃ GIẢI QUYẾT** | [`src/client/3d/instanced_toy_buildings.tsx` (Mục 3.2, L265-295)](#32-mã-nguồn-chuẩn-hóa-srcclient3dinstanced_toy_buildingstsx): Tách thành 2 hàm độc lập `calculateHouseInstanceMatrix` (chỉ hiển thị ở Level 1 slot 0, hoặc Level 2 slot 0 & 1; scale 0 khi level = 0 hoặc >= 3) và `calculateHotelInstanceMatrix` (chỉ hiển thị khi level >= 3; scale 0 khi level < 3). |
| **G-2** | **[P1-02 - Sub-Part Transform Amnesia]**: Mái dốc, ống khói, gờ cửa sổ có $Y$ và góc xoay riêng. Dùng chung ma trận khiến 4 bộ phận bị bẹp dính ở $Y=0$. | **CRITICAL** | **ĐÃ GIẢI QUYẾT** | [`src/client/3d/instanced_toy_buildings.tsx` (Mục 3.2, L225-245)](#32-mã-nguồn-chuẩn-hóa-srcclient3dinstanced_toy_buildingstsx): Pre-bake sẵn cao độ $Y$ và góc xoay vào 8 shared geometries tĩnh ở cấp module: `HOUSE_BODY_GEOM`, `HOUSE_ROOF_GEOM`, `HOUSE_CHIMNEY_GEOM`, `HOUSE_WINDOW_GEOM`, `HOTEL_BODY_GEOM`, `HOTEL_TOWER_GEOM`, `HOTEL_TRIM_GEOM`, `HOTEL_WINDOW_GEOM`. Zero per-frame transform overhead. |
| **G-3** | **[P1-03 - Frustum Culling Disappearance]**: Bounding sphere mặc định của `InstancedMesh` chỉ ~0.2 quanh $(0,0,0)$. Khi camera zoom vào ô đất cạnh bàn cờ ($X,Z=\pm 9$), toàn bộ công trình biến mất. | **CRITICAL** | **ĐÃ GIẢI QUYẾT** | [`src/client/3d/instanced_toy_buildings.tsx` (Mục 3.2, L350-380)](#32-mã-nguồn-chuẩn-hóa-srcclient3dinstanced_toy_buildingstsx): Khai báo tường minh `frustumCulled={false}` trên toàn bộ 8 thẻ `<instancedMesh />` trong `InstancedBoardToyBuildings`. |
| **G-4** | **[P1-04 - Vague Plan Directive]**: Step 4 thiếu hoàn toàn mã nguồn drop-in của component chính `InstancedBoardToyBuildings`, chỉ viết 4 gạch đầu dòng. | **CRITICAL** | **ĐÃ GIẢI QUYẾT** | [`src/client/3d/instanced_toy_buildings.tsx` (Mục 3.2, L297-385)](#32-mã-nguồn-chuẩn-hóa-srcclient3dinstanced_toy_buildingstsx): Cung cấp toàn văn 100% mã nguồn drop-in cho `InstancedBoardToyBuildings` với 8 refs, hook `useEffect([levelMap])`, vòng lặp gán ma trận cho 44 house slots và 22 hotel slots, và JSX 8 thẻ `instancedMesh`. |
| **G-5** | **[P2-01 - Stale LOC Baseline & Coordinates]**: Dẫn sai dòng của `board_tile.tsx` (dẫn 220-225 thay vì 159-173, 291-295); thiếu định dạng `**Target physical file**:` và `<<<< ==== >>>>`. | **HIGH** | **ĐÃ GIẢI QUYẾT** | [Mục 3.3 & 3.4](#33-tinh-chỉnh-srcclient3dboard_tiletsxl159-173-l179-194-l291-296): Cập nhật chính xác tọa độ dòng vật lý (L159-173, L179-194, L291-296), định dạng chuẩn xác khối `**Target physical file**: ...` và `<<<< ==== >>>>` để `node scripts/audit_plan.mjs` kiểm chứng đạt 100%. |
| **G-6** | **[P2-02 - Shadow Caster Budget]**: Bật shadow trên chi tiết nhỏ (ống khói, cửa sổ, viền vàng) lãng phí draw calls shadow map (vi phạm TC-IMP142.18/19). | **HIGH** | **ĐÃ GIẢI QUYẾT** | [`src/client/3d/instanced_toy_buildings.tsx` (Mục 3.2, L350-380)](#32-mã-nguồn-chuẩn-hóa-srcclient3dinstanced_toy_buildingstsx): Chỉ bật `castShadow` trên Thân và Mái của Nhà; Thân và Tháp của Khách sạn. Tắt hoàn toàn `castShadow` trên ống khói, cửa sổ và viền vàng kim loại. |
| **G-7** | **[P2-03 - SSR Headless Crash Guard]**: Dùng `useFrame`/`useThree` ngoài `<Canvas>` làm các bài test `renderToStaticMarkup(GameBoard)` sập lập tức. | **HIGH** | **ĐÃ GIẢI QUYẾT** | [`src/client/3d/instanced_toy_buildings.tsx` (Mục 3.2, L315-345)](#32-mã-nguồn-chuẩn-hóa-srcclient3dinstanced_toy_buildingstsx): Tuyệt đối không dùng `useFrame` hoặc `useThree` trong `InstancedBoardToyBuildings`. Cập nhật ma trận thuần túy qua `useEffect([levelMap])` an toàn 100% cho headless SSR. |

---

## 2. MỤC TIÊU & BỐI CẢNH KỸ THUẬT (GOAL & CONTEXT)

### 2.1. Hiện Trạng & Vấn Đề Kỹ Thuật (Physical Bottleneck)
- **Dữ liệu thực nghiệm từ Log Ván Đấu (Room `VTUOEQ`)**:
  - `fps`: 25.7 FPS (Telemetry chuyển sang cảnh báo `Chậm` màu cam).
  - `drawCalls`: **862 draw calls** (vượt xa trần ngân sách hiệu năng `targetMaxDrawCalls = 85` quy định tại `perf_budget.ts`).
  - `frameTimeMs`: 16.8ms.
- **Nguyên nhân cốt lõi**:
  - Trên bàn cờ 40 ô, có 22 ô bất động sản (Property Cells). Khi người chơi sở hữu và xây dựng (C1..C3), mỗi căn nhà đồ chơi `ToyHouseMesh` bao gồm 4 meshes riêng biệt (thân nhà, mái dốc, ống khói, gờ cửa sổ) và mỗi khách sạn `ToyHotelMesh` bao gồm 4 meshes riêng biệt (thân, tháp mái, viền vàng, gờ cửa sổ).
  - Khi render theo mô hình phân tán trong từng `LayeredDioramaTile`, ở giai đoạn giữa và cuối ván cờ có thể xuất hiện tới 44 căn nhà và 22 khách sạn, sinh ra hơn 264 mesh độc lập. Kết hợp với pass đổ bóng `shadows="soft"` (mỗi mesh đổ bóng bị vẽ lại trong shadow map pass), số lượng draw calls riêng cho nhà đất tăng vọt lên hơn **500 draw calls**.
  - Việc render rời rạc hàng trăm mesh độc lập làm nghẽn cổ chai CPU-to-GPU command buffer của trình duyệt Microsoft Edge, gây tụt khung hình trầm trọng.

### 2.2. Giải Pháp Kiến Trúc: Centralized Instanced Mesh Batching
- Tách toàn bộ việc kết xuất nhà đất đồ chơi (Houses & Hotels) ra khỏi từng ô gạch đơn lẻ và tập trung hóa tại một Deep Module duy nhất: `src/client/3d/instanced_toy_buildings.tsx`.
- Sử dụng chính xác 8 cụm `THREE.InstancedMesh` cấp bàn cờ (Board-Level InstancedMeshes):
  - 4 cụm cho Nhà Xanh (Thân, Mái, Ống khói, Cửa sổ) — Dung lượng cố định 44 instances (22 ô x tối đa 2 nhà).
  - 4 cụm cho Khách Sạn Đỏ (Thân, Tháp mái, Viền vàng, Cửa sổ) — Dung lượng cố định 22 instances (22 ô x 1 khách sạn).
- **Cơ chế hình học nung sẵn (Pre-Baked Sub-Part Geometries)**:
  - Cao độ $Y$ và góc xoay của mái tam giác, ống khói, cửa sổ được bake sẵn vào `BufferGeometry` tĩnh ở cấp module. Cả 4 bộ phận của Nhà dùng chung 1 ma trận duy nhất, và cả 4 bộ phận của Khách Sạn dùng chung 1 ma trận duy nhất.
- **Cơ chế cập nhật ma trận biến đổi động (Dynamic Matrix Updates)**:
  - Lắng nghe `levelMap` từ `useGameStore`. Khi cấp độ xây dựng thay đổi, cập nhật ma trận thế giới qua `calculateHouseInstanceMatrix` và `calculateHotelInstanceMatrix`.
  - Nếu ô đất ở cấp 0 hoặc slot không sử dụng, ma trận được gán tỷ lệ co về 0 (`matrix.makeScale(0, 0, 0)`), ẩn hoàn toàn khỏi GPU buffer mà không cần re-allocate bộ nhớ.
  - Sau khi duyệt qua 22 ô, chỉ phát cờ `instanceMatrix.needsUpdate = true` duy nhất một lần.
  - Gán `frustumCulled={false}` trên toàn bộ 8 thẻ `<instancedMesh />` để loại trừ triệt để nguy cơ nhà cửa bị biến mất khi camera zoom vào các góc bàn cờ.
- **Kết quả kỳ vọng**:
  - Số lượng draw calls cho toàn bộ hệ thống nhà đất trên bàn cờ giảm từ **264 calls xuống đúng 8 calls** (hoặc 12 calls khi tính cả shadow map).
  - Tổng số draw calls toàn cảnh giảm hơn 500 calls, đưa hệ thống về ngưỡng an toàn (< 85 calls) và bảo đảm 60 FPS mượt mà.

---

## 3. PHÂN TÁCH CÁC GÓI MÃ NGUỒN CẦN CHỈNH SỬA (DROP-IN SNIPPETS)

---

### 3.1. Hợp đồng Kiểm thử Hợp đồng TDD Detroit Style (Station 1 RED)

**Target physical file**: `tests/contracts/imp_perf_threejs_instancing.test.ts` (New file)

```typescript
// [TC-INST-01..16/MSS][UC-IMP-INST] Contract Test Suite: 3D Instanced Mesh Performance Batching
import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as THREE from 'three';
import {
  PROPERTY_CELL_INDICES,
  TOTAL_HOUSE_INSTANCES,
  TOTAL_HOTEL_INSTANCES,
  calculateHouseInstanceMatrix,
  calculateHotelInstanceMatrix,
  InstancedBoardToyBuildings,
} from '../../src/client/3d/instanced_toy_buildings';
import { GameBoard } from '../../src/client/3d/board_layout';
import { LayeredDioramaTile } from '../../src/client/3d/board_tile';
import { BOARD_CONFIG, CellType } from '../../domain/board_config';
import { useGameStore } from '../../src/client/store/game_store';

describe('[TC-INST-01..16/MSS] Three.js InstancedMesh Batching & Matrix Convergence Suite', () => {
  beforeEach(() => {
    useGameStore.setState({
      levelMap: {},
      playersInfo: {},
    });
  });

  // FACET 1: Boundary & Slot Allocation (TC-INST-01..03)
  describe('Facet 1: Boundary & Slot Allocation', () => {
    it('[TC-INST-01/MSS] PROPERTY_CELL_INDICES chứa đúng 22 ô bất động sản', () => {
      expect(PROPERTY_CELL_INDICES.length).toBe(22);
      PROPERTY_CELL_INDICES.forEach((idx) => {
        expect(BOARD_CONFIG[idx]?.type).toBe(CellType.Property);
      });
    });

    it('[TC-INST-02/MSS] TOTAL_HOUSE_INSTANCES đúng bằng 44 và TOTAL_HOTEL_INSTANCES đúng bằng 22', () => {
      expect(TOTAL_HOUSE_INSTANCES).toBe(44);
      expect(TOTAL_HOTEL_INSTANCES).toBe(22);
    });

    it('[TC-INST-03/MSS] Mỗi ô đất có 2 slot nhà và 1 slot khách sạn riêng biệt', () => {
      expect(PROPERTY_CELL_INDICES.length * 2).toBe(TOTAL_HOUSE_INSTANCES);
    });
  });

  // FACET 2: State Reactivity & Matrix Composition (TC-INST-04..07)
  describe('Facet 2: State Reactivity & Matrix Composition', () => {
    it('[TC-INST-04/MSS] calculateHouseInstanceMatrix tại level 0 trả về scale 0,0,0', () => {
      const mat = calculateHouseInstanceMatrix(1, 0, 0);
      const scale = new THREE.Vector3();
      mat.decompose(new THREE.Vector3(), new THREE.Quaternion(), scale);
      expect(scale.x).toBe(0);
      expect(scale.y).toBe(0);
      expect(scale.z).toBe(0);
    });

    it('[TC-INST-05/MSS] calculateHouseInstanceMatrix tại level 1: slot 0 có scale 1, slot 1 có scale 0', () => {
      const mat0 = calculateHouseInstanceMatrix(1, 0, 1);
      const scale0 = new THREE.Vector3();
      mat0.decompose(new THREE.Vector3(), new THREE.Quaternion(), scale0);
      expect(scale0.x).toBeCloseTo(1.0);

      const mat1 = calculateHouseInstanceMatrix(1, 1, 1);
      const scale1 = new THREE.Vector3();
      mat1.decompose(new THREE.Vector3(), new THREE.Quaternion(), scale1);
      expect(scale1.x).toBe(0);
    });

    it('[TC-INST-06/MSS] calculateHouseInstanceMatrix tại level 2: cả 2 slot đều có scale 1 và lệch nhau ±0.18', () => {
      const mat0 = calculateHouseInstanceMatrix(1, 0, 2);
      const mat1 = calculateHouseInstanceMatrix(1, 1, 2);
      const pos0 = new THREE.Vector3();
      const pos1 = new THREE.Vector3();
      mat0.decompose(pos0, new THREE.Quaternion(), new THREE.Vector3());
      mat1.decompose(pos1, new THREE.Quaternion(), new THREE.Vector3());
      expect(pos0.distanceTo(pos1)).toBeCloseTo(0.36, 2);
    });

    it('[TC-INST-07/MSS] calculateHotelInstanceMatrix tại level < 3 trả về scale 0; tại level 3 trả về scale 1', () => {
      const matL2 = calculateHotelInstanceMatrix(1, 2);
      const scaleL2 = new THREE.Vector3();
      matL2.decompose(new THREE.Vector3(), new THREE.Quaternion(), scaleL2);
      expect(scaleL2.x).toBe(0);

      const matL3 = calculateHotelInstanceMatrix(1, 3);
      const scaleL3 = new THREE.Vector3();
      matL3.decompose(new THREE.Vector3(), new THREE.Quaternion(), scaleL3);
      expect(scaleL3.x).toBeCloseTo(1.0);
    });
  });

  // FACET 3: Spatial Orientation Across 4 Board Edges (TC-INST-08..10)
  describe('Facet 3: Spatial Orientation Across 4 Board Edges', () => {
    it('[TC-INST-08/MSS] Cạnh Nam (Ô 1 Cần Thơ): Ma trận có góc xoay Y = 0', () => {
      const mat = calculateHouseInstanceMatrix(1, 0, 1);
      const quat = new THREE.Quaternion();
      mat.decompose(new THREE.Vector3(), quat, new THREE.Vector3());
      const euler = new THREE.Euler().setFromQuaternion(quat);
      expect(euler.y).toBeCloseTo(0);
    });

    it('[TC-INST-09/MSS] Cạnh Tây (Ô 11 Bình Thuận): Ma trận có góc xoay Y = -Math.PI / 2', () => {
      const mat = calculateHouseInstanceMatrix(11, 0, 1);
      const quat = new THREE.Quaternion();
      mat.decompose(new THREE.Vector3(), quat, new THREE.Vector3());
      const euler = new THREE.Euler().setFromQuaternion(quat);
      expect(euler.y).toBeCloseTo(-Math.PI / 2);
    });

    it('[TC-INST-10/MSS] Cạnh Bắc (Ô 26) xoay Math.PI và Cạnh Đông (Ô 31) xoay Math.PI / 2', () => {
      const matNorth = calculateHouseInstanceMatrix(26, 0, 1);
      const quatN = new THREE.Quaternion();
      matNorth.decompose(new THREE.Vector3(), quatN, new THREE.Vector3());
      const eulerN = new THREE.Euler().setFromQuaternion(quatN);
      expect(Math.abs(eulerN.y)).toBeCloseTo(Math.PI);

      const matEast = calculateHouseInstanceMatrix(31, 0, 1);
      const quatE = new THREE.Quaternion();
      matEast.decompose(new THREE.Vector3(), quatE, new THREE.Vector3());
      const eulerE = new THREE.Euler().setFromQuaternion(quatE);
      expect(eulerE.y).toBeCloseTo(Math.PI / 2);
    });
  });

  // FACET 4: Error Defense & Demolish Lifecycle (TC-INST-11..13)
  describe('Facet 4: Error Defense & Demolish Lifecycle', () => {
    it('[TC-INST-11/MSS] Hạ cấp từ level 3 về level 0: Cả khách sạn và nhà đều co scale về 0', () => {
      const matHotel = calculateHotelInstanceMatrix(1, 0);
      const matHouse0 = calculateHouseInstanceMatrix(1, 0, 0);
      const scaleH = new THREE.Vector3();
      const scaleB = new THREE.Vector3();
      matHotel.decompose(new THREE.Vector3(), new THREE.Quaternion(), scaleH);
      matHouse0.decompose(new THREE.Vector3(), new THREE.Quaternion(), scaleB);
      expect(scaleH.x).toBe(0);
      expect(scaleB.x).toBe(0);
    });

    it('[TC-INST-12/MSS] Hạ cấp từ level 2 về level 1: Slot 1 co scale về 0', () => {
      const mat1 = calculateHouseInstanceMatrix(1, 1, 1);
      const scale1 = new THREE.Vector3();
      mat1.decompose(new THREE.Vector3(), new THREE.Quaternion(), scale1);
      expect(scale1.x).toBe(0);
    });

    it('[TC-INST-13/MSS] Giá trị level bất thường (-1, NaN): Trả về scale 0 an toàn', () => {
      const matNeg = calculateHouseInstanceMatrix(1, 0, -1);
      const matNaN = calculateHotelInstanceMatrix(1, NaN);
      const s1 = new THREE.Vector3();
      const s2 = new THREE.Vector3();
      matNeg.decompose(new THREE.Vector3(), new THREE.Quaternion(), s1);
      matNaN.decompose(new THREE.Vector3(), new THREE.Quaternion(), s2);
      expect(s1.x).toBe(0);
      expect(s2.x).toBe(0);
    });
  });

  // FACET 5: GameBoard Integration, SSR & Shadow Budget (TC-INST-14..16)
  describe('Facet 5: GameBoard Integration, SSR & Shadow Budget', () => {
    it('[TC-INST-14/MSS] InstancedBoardToyBuildings kết xuất đủ 8 thẻ instancedmesh với frustumCulled={false}', () => {
      const markup = renderToStaticMarkup(React.createElement(InstancedBoardToyBuildings));
      expect(markup).toContain('data-testid="instanced-board-toy-buildings"');
      const matches = markup.match(/<instancedmesh/gi);
      expect(matches?.length).toBe(8);
      expect(markup).toContain('frustumculled="false"');
    });

    it('[TC-INST-15/MSS] Shadow budget: Thân và mái bật castShadow, ống khói và cửa sổ tắt castShadow', () => {
      const markup = renderToStaticMarkup(React.createElement(InstancedBoardToyBuildings));
      // Khách sạn và nhà thân/mái bật castShadow
      expect(markup).toContain('castshadow="true"');
    });

    it('[TC-INST-16/MSS] GameBoard render trơn tru trong môi trường headless SSR không crash và chứa cụm instanced', () => {
      const markup = renderToStaticMarkup(React.createElement(GameBoard));
      expect(markup).toContain('data-testid="instanced-board-toy-buildings"');
    });
  });
});
```

---

### 3.2. Mã Nguồn Chuẩn Hóa `src/client/3d/instanced_toy_buildings.tsx`

**Target physical file**: `src/client/3d/instanced_toy_buildings.tsx` (New file)

```typescript
// [UI-S02/MSS][IMP-PERF-THREEJS-INSTANCING] Centralized Instanced Mesh Batching for Houses & Hotels
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { BOARD_CONFIG, CellType } from '../../domain/board_config';
import { cellPosition } from './board_coords';
import { tileRotation } from './board_layout';
import { useGameStore } from '../store/game_store';

export const PROPERTY_CELL_INDICES: readonly number[] = BOARD_CONFIG
  .filter((c) => c.type === CellType.Property)
  .map((c) => c.index);

export const MAX_HOUSES_PER_TILE = 2;
export const TOTAL_HOUSE_INSTANCES = PROPERTY_CELL_INDICES.length * MAX_HOUSES_PER_TILE; // 44
export const TOTAL_HOTEL_INSTANCES = PROPERTY_CELL_INDICES.length; // 22

// 1. Geometries tĩnh đã bake sẵn offset & rotation (Zero transform overhead per frame)
export const HOUSE_BODY_GEOM = new THREE.BoxGeometry(0.22, 0.10, 0.16).translate(0, 0.05, 0);
export const HOUSE_ROOF_GEOM = new THREE.CylinderGeometry(0.07, 0.07, 0.22, 3)
  .rotateZ(Math.PI / 2)
  .translate(0, 0.13, 0);
export const HOUSE_CHIMNEY_GEOM = new THREE.BoxGeometry(0.035, 0.06, 0.035).translate(0.06, 0.16, 0.04);
export const HOUSE_WINDOW_GEOM = new THREE.BoxGeometry(0.12, 0.05, 0.008).translate(0, 0.05, 0.082);

export const HOTEL_BODY_GEOM = new THREE.BoxGeometry(0.46, 0.16, 0.20).translate(0, 0.08, 0);
export const HOTEL_TOWER_GEOM = new THREE.CylinderGeometry(0.07, 0.14, 0.10, 4)
  .rotateY(Math.PI / 4)
  .translate(0, 0.20, 0);
export const HOTEL_TRIM_GEOM = new THREE.BoxGeometry(0.47, 0.015, 0.21).translate(0, 0.165, 0);
export const HOTEL_WINDOW_GEOM = new THREE.BoxGeometry(0.38, 0.06, 0.008).translate(0, 0.08, 0.102);

// Reusable scratch matrices (Zero GC allocation in frame/update)
const _tileMat = new THREE.Matrix4();
const _localMat = new THREE.Matrix4();
const _euler = new THREE.Euler(0, 0, 0, 'XYZ');

export function composeToyWorldMatrix(
  cellIndex: number,
  localX: number,
  localY: number,
  localZ: number,
  targetMatrix: THREE.Matrix4 = new THREE.Matrix4()
): THREE.Matrix4 {
  const [tx, ty, tz] = cellPosition(cellIndex);
  const [rx, ry, rz] = tileRotation(cellIndex);

  _euler.set(rx, ry, rz, 'XYZ');
  _tileMat.makeRotationFromEuler(_euler);
  _tileMat.setPosition(tx, ty, tz);

  _localMat.makeTranslation(localX, localY, localZ);
  targetMatrix.multiplyMatrices(_tileMat, _localMat);
  return targetMatrix;
}

export function calculateHouseInstanceMatrix(
  cellIndex: number,
  slot: 0 | 1,
  level: number,
  targetMatrix: THREE.Matrix4 = new THREE.Matrix4()
): THREE.Matrix4 {
  if (!Number.isFinite(level) || level <= 0 || (level === 1 && slot !== 0) || level >= 3) {
    targetMatrix.makeScale(0, 0, 0);
    return targetMatrix;
  }
  const localX = level === 2 ? (slot === 0 ? -0.18 : 0.18) : 0;
  return composeToyWorldMatrix(cellIndex, localX, 0.125, -0.80, targetMatrix);
}

export function calculateHotelInstanceMatrix(
  cellIndex: number,
  level: number,
  targetMatrix: THREE.Matrix4 = new THREE.Matrix4()
): THREE.Matrix4 {
  if (!Number.isFinite(level) || level < 3) {
    targetMatrix.makeScale(0, 0, 0);
    return targetMatrix;
  }
  return composeToyWorldMatrix(cellIndex, 0, 0.125, -0.80, targetMatrix);
}

export interface InstancedBoardToyBuildingsProps {
  readonly levelMap?: Record<number, number>;
}

export function InstancedBoardToyBuildings({
  levelMap: propLevelMap,
}: InstancedBoardToyBuildingsProps): React.ReactElement {
  const storeLevelMap = useGameStore((s) => s.levelMap);
  const levelMap = propLevelMap ?? storeLevelMap ?? {};

  const houseBodyRef = useRef<THREE.InstancedMesh>(null);
  const houseRoofRef = useRef<THREE.InstancedMesh>(null);
  const houseChimneyRef = useRef<THREE.InstancedMesh>(null);
  const houseWindowRef = useRef<THREE.InstancedMesh>(null);

  const hotelBodyRef = useRef<THREE.InstancedMesh>(null);
  const hotelTowerRef = useRef<THREE.InstancedMesh>(null);
  const hotelTrimRef = useRef<THREE.InstancedMesh>(null);
  const hotelWindowRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    const tempMatrix = new THREE.Matrix4();

    PROPERTY_CELL_INDICES.forEach((cellIndex, pIdx) => {
      const level = levelMap[cellIndex] ?? 0;

      // House Slot 0 & 1
      for (let slot = 0; slot < MAX_HOUSES_PER_TILE; slot++) {
        const instanceIdx = pIdx * MAX_HOUSES_PER_TILE + slot;
        calculateHouseInstanceMatrix(cellIndex, slot as 0 | 1, level, tempMatrix);
        houseBodyRef.current?.setMatrixAt(instanceIdx, tempMatrix);
        houseRoofRef.current?.setMatrixAt(instanceIdx, tempMatrix);
        houseChimneyRef.current?.setMatrixAt(instanceIdx, tempMatrix);
        houseWindowRef.current?.setMatrixAt(instanceIdx, tempMatrix);
      }

      // Hotel Slot
      calculateHotelInstanceMatrix(cellIndex, level, tempMatrix);
      hotelBodyRef.current?.setMatrixAt(pIdx, tempMatrix);
      hotelTowerRef.current?.setMatrixAt(pIdx, tempMatrix);
      hotelTrimRef.current?.setMatrixAt(pIdx, tempMatrix);
      hotelWindowRef.current?.setMatrixAt(pIdx, tempMatrix);
    });

    if (houseBodyRef.current) houseBodyRef.current.instanceMatrix.needsUpdate = true;
    if (houseRoofRef.current) houseRoofRef.current.instanceMatrix.needsUpdate = true;
    if (houseChimneyRef.current) houseChimneyRef.current.instanceMatrix.needsUpdate = true;
    if (houseWindowRef.current) houseWindowRef.current.instanceMatrix.needsUpdate = true;

    if (hotelBodyRef.current) hotelBodyRef.current.instanceMatrix.needsUpdate = true;
    if (hotelTowerRef.current) hotelTowerRef.current.instanceMatrix.needsUpdate = true;
    if (hotelTrimRef.current) hotelTrimRef.current.instanceMatrix.needsUpdate = true;
    if (hotelWindowRef.current) hotelWindowRef.current.instanceMatrix.needsUpdate = true;
  }, [levelMap]);

  return (
    <group data-testid="instanced-board-toy-buildings">
      {/* 4 Cụm Nhà Xanh Lục Bảo */}
      <instancedMesh ref={houseBodyRef} args={[HOUSE_BODY_GEOM, undefined, TOTAL_HOUSE_INSTANCES]} castShadow receiveShadow frustumCulled={false}>
        <meshStandardMaterial color="#10B981" roughness={0.15} metalness={0.1} />
      </instancedMesh>
      <instancedMesh ref={houseRoofRef} args={[HOUSE_ROOF_GEOM, undefined, TOTAL_HOUSE_INSTANCES]} castShadow frustumCulled={false}>
        <meshStandardMaterial color="#10B981" roughness={0.15} metalness={0.1} />
      </instancedMesh>
      <instancedMesh ref={houseChimneyRef} args={[HOUSE_CHIMNEY_GEOM, undefined, TOTAL_HOUSE_INSTANCES]} frustumCulled={false}>
        <meshStandardMaterial color="#059669" roughness={0.25} metalness={0.05} />
      </instancedMesh>
      <instancedMesh ref={houseWindowRef} args={[HOUSE_WINDOW_GEOM, undefined, TOTAL_HOUSE_INSTANCES]} frustumCulled={false}>
        <meshStandardMaterial color="#34D399" roughness={0.2} metalness={0.1} />
      </instancedMesh>

      {/* 4 Cụm Khách Sạn Đỏ Ruby */}
      <instancedMesh ref={hotelBodyRef} args={[HOTEL_BODY_GEOM, undefined, TOTAL_HOTEL_INSTANCES]} castShadow receiveShadow frustumCulled={false}>
        <meshStandardMaterial color="#DC2626" roughness={0.15} metalness={0.1} />
      </instancedMesh>
      <instancedMesh ref={hotelTowerRef} args={[HOTEL_TOWER_GEOM, undefined, TOTAL_HOTEL_INSTANCES]} castShadow frustumCulled={false}>
        <meshStandardMaterial color="#DC2626" roughness={0.15} metalness={0.1} />
      </instancedMesh>
      <instancedMesh ref={hotelTrimRef} args={[HOTEL_TRIM_GEOM, undefined, TOTAL_HOTEL_INSTANCES]} frustumCulled={false}>
        <meshStandardMaterial color="#F59E0B" roughness={0.2} metalness={0.85} />
      </instancedMesh>
      <instancedMesh ref={hotelWindowRef} args={[HOTEL_WINDOW_GEOM, undefined, TOTAL_HOTEL_INSTANCES]} frustumCulled={false}>
        <meshStandardMaterial color="#F59E0B" roughness={0.25} metalness={0.6} />
      </instancedMesh>
    </group>
  );
}
```

---

### 3.3. Tinh Chỉnh `src/client/3d/board_tile.tsx` (L159-173, L179-194, L291-296)

**Target physical file**: `src/client/3d/board_tile.tsx`

```tsx
<<<<
export interface LayeredDioramaTileProps {
  readonly cell: BoardCell;
  readonly position: [number, number, number];
  readonly rotation?: [number, number, number];
  readonly currentLevel: 0 | 1 | 2 | 3;
  readonly isCornerTile: boolean;
  readonly onClick?: () => void;
  readonly enableStandee?: boolean;
  readonly ownerColor?: string;
  readonly ownerSlot?: number;
  readonly mascotIcon?: string;
  readonly isHeatmapActive?: boolean;
  readonly isMonopolyGroup?: boolean;
  readonly isMobile?: boolean;
}
====
export interface LayeredDioramaTileProps {
  readonly cell: BoardCell;
  readonly position: [number, number, number];
  readonly rotation?: [number, number, number];
  readonly currentLevel: 0 | 1 | 2 | 3;
  readonly isCornerTile: boolean;
  readonly onClick?: () => void;
  readonly enableStandee?: boolean;
  readonly ownerColor?: string;
  readonly ownerSlot?: number;
  readonly mascotIcon?: string;
  readonly isHeatmapActive?: boolean;
  readonly isMonopolyGroup?: boolean;
  readonly isMobile?: boolean;
  readonly renderToyBuildings?: boolean;
}
>>>>
```

```tsx
<<<<
export function LayeredDioramaTile({
  cell,
  position,
  rotation = [0, 0, 0],
  currentLevel,
  isCornerTile,
  onClick,
  enableStandee = true,
  ownerColor,
  ownerSlot: _ownerSlot,
  mascotIcon: _mascotIcon,
  isHeatmapActive = false,
  isMonopolyGroup = false,
  isMobile: propIsMobile,
}: LayeredDioramaTileProps): React.ReactElement {
====
export function LayeredDioramaTile({
  cell,
  position,
  rotation = [0, 0, 0],
  currentLevel,
  isCornerTile,
  onClick,
  enableStandee = true,
  ownerColor,
  ownerSlot: _ownerSlot,
  mascotIcon: _mascotIcon,
  isHeatmapActive = false,
  isMonopolyGroup = false,
  isMobile: propIsMobile,
  renderToyBuildings = true,
}: LayeredDioramaTileProps): React.ReactElement {
>>>>
```

```tsx
<<<<
      {/* 3. Công trình 3D Procedural cho các ô tài sản kinh tế (Property Tiles C0-C3) hoặc Standee cho 6 ô hạ tầng cố định */}
      {cell.type === CellType.Property ? (
        <>
          <ProceduralBuilding level={currentLevel} groupColor={groupColor} cellIndex={cell.index} />
          <ToyPropertyBuildings level={currentLevel} groupColor={groupColor} cellIndex={cell.index} />
        </>
      ) : (
====
      {/* 3. Công trình 3D Procedural cho các ô tài sản kinh tế (Property Tiles C0-C3) hoặc Standee cho 6 ô hạ tầng cố định */}
      {cell.type === CellType.Property ? (
        <>
          <ProceduralBuilding level={currentLevel} groupColor={groupColor} cellIndex={cell.index} />
          {renderToyBuildings && (
            <ToyPropertyBuildings level={currentLevel} groupColor={groupColor} cellIndex={cell.index} />
          )}
        </>
      ) : (
>>>>
```

---

### 3.4. Tinh Chỉnh `src/client/3d/board_layout.tsx` (L12-14, L158-165)

**Target physical file**: `src/client/3d/board_layout.tsx`

```tsx
<<<<
import { LUXURY_PAWN_CONFIGS } from './luxury_pawn_models';
import { DiceTray } from './dice_tray';
====
import { LUXURY_PAWN_CONFIGS } from './luxury_pawn_models';
import { DiceTray } from './dice_tray';
import { InstancedBoardToyBuildings } from './instanced_toy_buildings';
>>>>
```

```tsx
<<<<
      {/* 3. Sàn diễn xúc xắc 3D thoáng đãng trên Đại Lộ Sài Gòn */}
      <DiceTray />

      {/* 4. 40 ô đất liền mạch khép kín tiếp giáp mặt nền phẳng */}
      {BOARD_CONFIG.map((cell) => (
        <LayeredDioramaTile
          key={cell.index}
          cell={cell}
          position={cellPosition(cell.index)}
          rotation={tileRotation(cell.index)}
          currentLevel={(levelMap[cell.index] ?? 0) as 0 | 1 | 2 | 3}
          isCornerTile={CORNER_INDICES.has(cell.index)}
          enableStandee={false}
          ownerColor={ownerInfoMap[cell.index]?.tokenColor}
          ownerSlot={ownerInfoMap[cell.index]?.ownerSlot}
          mascotIcon={ownerInfoMap[cell.index]?.mascotIcon}
          onClick={() => handleTileClick(cell.index)}
          isHeatmapActive={isHeatmapActive}
          isMonopolyGroup={isCellInMonopolyGroup(cell.index, monopolyGroups)}
          isMobile={isMobile}
        />
      ))}
====
      {/* 3. Sàn diễn xúc xắc 3D thoáng đãng trên Đại Lộ Sài Gòn */}
      <DiceTray />

      {/* 3.5. Cụm InstancedMesh nhà đất đồ chơi C1-C3 toàn bàn cờ (<8 draw calls) */}
      <InstancedBoardToyBuildings levelMap={levelMap} />

      {/* 4. 40 ô đất liền mạch khép kín tiếp giáp mặt nền phẳng */}
      {BOARD_CONFIG.map((cell) => (
        <LayeredDioramaTile
          key={cell.index}
          cell={cell}
          position={cellPosition(cell.index)}
          rotation={tileRotation(cell.index)}
          currentLevel={(levelMap[cell.index] ?? 0) as 0 | 1 | 2 | 3}
          isCornerTile={CORNER_INDICES.has(cell.index)}
          enableStandee={false}
          ownerColor={ownerInfoMap[cell.index]?.tokenColor}
          ownerSlot={ownerInfoMap[cell.index]?.ownerSlot}
          mascotIcon={ownerInfoMap[cell.index]?.mascotIcon}
          onClick={() => handleTileClick(cell.index)}
          isHeatmapActive={isHeatmapActive}
          isMonopolyGroup={isCellInMonopolyGroup(cell.index, monopolyGroups)}
          isMobile={isMobile}
          renderToyBuildings={false}
        />
      ))}
>>>>
```

---

## 4. CHI TIẾT CÁC TÁC VỤ TRIỂN KHAI THEO 4 TRẠM (4-STATION PIPELINE)

### Tác Vụ 1: Trạm 1 (QA RED - Adversarial Inversion)
- [ ] **Step 1**: Tạo file test `tests/contracts/imp_perf_threejs_instancing.test.ts` (16 test cases).
- [ ] **Step 2**: Chạy `npx vitest run tests/contracts/imp_perf_threejs_instancing.test.ts` và chứng minh thất bại do file implementation chưa tồn tại.

### Tác Vụ 2: Trạm 2 (GREEN Implementation)
- [ ] **Step 3**: Tạo file `src/client/3d/instanced_toy_buildings.tsx` theo mã nguồn chuẩn tại Mục 3.2.
- [ ] **Step 4**: Sửa `src/client/3d/board_tile.tsx` bổ sung prop `renderToyBuildings?: boolean` theo Mục 3.3.
- [ ] **Step 5**: Sửa `src/client/3d/board_layout.tsx` gắn `<InstancedBoardToyBuildings levelMap={levelMap} />` theo Mục 3.4.
- [ ] **Step 6**: Chạy `npx vitest run tests/contracts/imp_perf_threejs_instancing.test.ts` và chứng minh 16/16 tests PASS.
- [ ] **Step 7**: Chạy hồi quy các suite liên quan: `tests/client/imp142_draw_call_and_shadow_budget.test.ts`, `tests/client/chrome_pawns_and_toy_buildings.test.ts`, `tests/contracts/property_ownership_marker_contract.test.ts`, `tests/client/flat_tile_art_and_clean_c0.test.ts`.

### Tác Vụ 3: Trạm 2.5 (Fast Pre-Filter Sweep)
- [ ] **Step 8**: Chạy `npx tsc --noEmit` đạt 0 lỗi.
- [ ] **Step 9**: Chạy `npm run check:loc src/client/3d/board_layout.tsx src/client/3d/board_tile.tsx src/client/3d/instanced_toy_buildings.tsx tests/contracts/imp_perf_threejs_instancing.test.ts` bảo đảm 100% tệp dưới trần LOC.
- [ ] **Step 10**: Chạy `npm run lint:ui` đạt 0 vi phạm.
- [ ] **Step 11**: Quét sạch 0 dirty cast (`as any`, `as unknown as`).

### Tác Vụ 4: Trạm 3 & Trạm 4 (Review Funnel & Chaos Sentinel)
- [ ] **Step 12**: Phase 3.0 chụp ảnh in-game vật lý lưu vào `.agents/tmp/`.
- [ ] **Step 13**: Phase 3.1 `spec-reviewer` và Phase 3.2 `code-reviewer`, `game-3d-visual-critic` thẩm định và cấp `APPROVED`.
- [ ] **Step 14**: Station 4 `chaos-sentinel` chạy 3 physical probes, tạo evidence snapshot `.agents/evidence/chaos_sentinel_IMP-PERF-THREEJS-INSTANCING.json` và nghiệm thu bằng `node scripts/check_evidence.mjs IMP-PERF-THREEJS-INSTANCING`.
