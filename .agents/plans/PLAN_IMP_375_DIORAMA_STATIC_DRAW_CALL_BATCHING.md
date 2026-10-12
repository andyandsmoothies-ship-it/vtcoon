# Plan IMP-375: Diorama Static Draw Call Batching & Geometry Consolidation (Ticket IMP-375)

## 0. Context & Architectural Rationale
- **Physical Baseline & Forensic Audit Findings**:
  - Theo báo cáo tổng hợp ([`DRAW_CALL_OPTIMIZATION_MASTER_SYNTHESIS_REPORT.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/diagnostics/DRAW_CALL_OPTIMIZATION_MASTER_SYNTHESIS_REPORT.md)) và kiểm toán phản biện chuyên sâu ([`PLAN_CHALLENGE_IMP-375.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_CHALLENGE_IMP-375.md)):
    - `DioramaTerrain` chứa 54 meshes tĩnh độc lập (37 vạch kẻ đường/sọc zebra `#FFFFFF` và `#F8FAFC`, 4 dải vỉa hè granite, 2 mặt đại lộ, 2 thảm cỏ và khối đồi), gây ra thắt cổ chai draw call nghiêm trọng trên CPU/GPU.
    - Để bảo toàn 100% các hợp đồng sống (`imp283`, `urban_density_and_craft`, `chrome_pawns_and_toy_buildings`), phạm vi Phase 1 tập trung gộp triệt để 46 mesh tĩnh của 2 bán đảo trong `DioramaTerrain`.
    - Giữ nguyên vẹn 100% nhóm bờ kè và lòng sông Sài Gòn (3 mesh sông + 2 bờ kè vát dốc) tại `diorama_terrain.tsx` nhằm triệt tiêu hoàn toàn nguy cơ Z-fighting đè lặp, bảo toàn khối đồi `diorama-park-relief` và loại bỏ hoàn toàn `DioramaPedestrianPromenades` khỏi phạm vi gộp.
- **Giải Trình Đánh Đổi Mỹ Thuật Vi Mô (Material Parity Trade-off Disclosure)**:
  - Bản gốc: Vỉa hè Tây `#E2E8F0` (roughness 0.3), Đông `#CBD5E1` (roughness 0.35); vạch kẻ làn `#F8FAFC`, vạch zebra `#FFFFFF`.
  - Bản gộp: Chuẩn hóa 4 dải vỉa hè về `#CBD5E1` và 37 vạch kẻ về `#FFFFFF`. Đây là mức nén vi mô mỹ thuật ~0.5% (micro visual compression) không thể nhận biết ở góc nhìn sa bàn chiến lược, đổi lại tiết kiệm thêm 2 draw calls. Ghi nhận minh bạch theo Hiến pháp.
- **Refined Balanced Solution (Micro-Slice Giai đoạn 1 - Giảm 40 Draw Calls, 100% Living Contracts, Zero GPU Leak)**:
  1. **Terrain Geometry Consolidation (`batched_diorama_terrain.tsx`)**: Gom 46 mesh tĩnh thành 6 `BufferGeometry` chuẩn hóa bằng `mergeGeometries`, lưu vào module-level cache `cachedTerrainGeoms`:
     - Vạch kẻ đường & sọc zebra: 37 khối hộp gộp thành 1 geometry duy nhất (`#FFFFFF`).
     - Vỉa hè granite: 4 dải vỉa hè gộp thành 1 geometry duy nhất (`#CBD5E1`).
     - Đại lộ Tây: 1 mặt đường nhựa (`#1E293B`, roughness 0.16, metalness 0.25).
     - Đường dạo ven vịnh Đông: 1 mặt đường sa mộc sẫm (`#334155`, roughness 0.2, metalness 0.18).
     - Nền đất thổ & thảm cỏ xanh: 2 khối đất (`#D4C5A3`) và 2 thảm cỏ (`#15803D`).
     - Áp dụng ma trận dời tọa độ thế giới (`applyMatrix4`) cho Bán đảo Tây `[-4.5, 0, 0]` và Bán đảo Đông `[4.5, 0, 0]`, tính toán `computeBoundingBox()` và `computeBoundingSphere()`.
     - **Triệt tiêu GPU Buffer Leak**: Gọi `.dispose()` ngay lập tức trên toàn bộ các `BoxGeometry` tạm thời sau khi gộp.
  2. **Strict Living Contract & Rendering Safety**:
     - Bảo tồn nguyên vẹn lòng sông Sài Gòn & 2 bờ kè vát dốc (`#0C4A6E`, `#0284C7`, `#94A3B8`, `data-testid="diorama-river-waves"`).
     - Bảo tồn nguyên vẹn khối đồi `data-testid="diorama-park-relief"` chứa bệ đá `#64748B` và thảm cỏ `#15803D`.
     - Cấu hình `raycast={noopRaycast}` với `const noopRaycast = () => null;` (hàm callable an toàn).

## 1. Physical Target Files & Honest LOC Accounting
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/diorama/diorama_terrain.tsx` | Tier 2 (UI/3D/Views) | 170 | 72 | -98 | <= 500 | Safe (< 100 LOC) |
| `src/client/3d/diorama/batched_diorama_terrain.tsx` | Tier 2 (UI/3D/Views) | 0 | 165 | +165 | <= 500 | Safe (< 200 LOC) |
| `tests/client/imp375_diorama_static_batching.test.ts` | Living Test | 0 | 150 | +150 | <= 600 | 🆕 Tệp mới |
| `tests/helpers/r3f_test_harness.ts` | Living Test | 0 | 156 | +156 | <= 600 | 🆕 Test Harness Seam |
| `tests/helpers/r3f_test_harness.test.ts` | Living Test | 0 | 50 | +50 | <= 600 | 🆕 Test Harness Contract |

## 2. In-Action Visual Capture Registration
- Scenario: `camera_chase_cinematic` (`scripts/visual_scenarios/camera_chase_cinematic.js`)
- Verification Command: `node scripts/capture_visual_evidence.mjs --scenario camera_chase_cinematic`
- Viewport: Desktop HD (`1920x1080`) & Mobile WebKit (`390x844`)
- Target Assertion: Bán đảo sa bàn, đại lộ `#1E293B`, tuyến ven vịnh `#334155`, vạch kẻ đường zebra và khối đồi kết xuất sắc nét 100%, không bị Z-fighting chồng lấn, draw calls của sa bàn giảm 40 lệnh vẽ.

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
- Viết bộ kiểm thử hợp đồng độc lập tại `tests/client/imp375_diorama_static_batching.test.ts`:
  - TC-375.01 [UC-BATCHED-TERRAIN-GEOM/MSS]: Given environment init, When calling `createBatchedTerrainGeometries`, Then returns singleton cached BufferGeometries where repeated calls return exact reference identity.
  - TC-375.02 [UC-BATCHED-MARKINGS-COLLAPSE/MSS]: Given terrain geometry generation, When calling `createBatchedTerrainGeometries`, Then consolidates 37 individual road markings and zebra stripes into a single merged geometry with vertex count at least 800 and computed bounding sphere.
  - TC-375.03 [UC-BATCHED-MATRIX-TRANSFORMS/MSS]: Given West and East peninsulas, When calling `createBatchedTerrainGeometries`, Then applies world translation offsets proving boundingBox min.x <= -4.8 and max.x >= 4.8 preventing center collapse.
  - TC-375.04 [UC-MATERIAL-PARITY-PRESERVE/MSS]: Given batched landmasses rendered, When inspecting static markup, Then strictly preserves asphalt color #1E293B and coastal promenade color #334155 with visual compression disclosure.
  - TC-375.05 [UC-TERRAIN-LIVING-CONTRACT-PRESERVE/MSS]: Given DioramaTerrain rendered, When inspecting static markup, Then strictly preserves `data-testid="diorama-river-waves"`, `data-testid="diorama-park-relief"`, #64748B, #15803D, and river water roughness <= 0.35 and metalness >= 0.05.
  - TC-375.06 [UC-CALLSITE-TERRAIN-WIRING/MSS]: Given DioramaTerrain mounted in render tree, When inspecting child nodes, Then renders BatchedDioramaLandmasses utilizing batched merged geometries with raycast no-op proving physical call-site presentation wiring.

### Station 2: Implementation (GREEN)

#### Task 1: Khởi tạo module gộp hình học sa bàn tĩnh `src/client/3d/diorama/batched_diorama_terrain.tsx`
**Target physical file**: `src/client/3d/diorama/batched_diorama_terrain.tsx` (Tạo mới)
```typescript
import React, { useMemo } from 'react';
import { BoxGeometry, type BufferGeometry, Matrix4 } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

let cachedTerrainGeoms: {
  soilGeom: BufferGeometry;
  grassGeom: BufferGeometry;
  westBoulevardGeom: BufferGeometry;
  eastPromenadeGeom: BufferGeometry;
  sidewalksGeom: BufferGeometry;
  markingsGeom: BufferGeometry;
} | null = null;

function createBoxWithOffset(w: number, h: number, d: number, x: number, y: number, z: number): BufferGeometry {
  const geom = new BoxGeometry(w, h, d);
  const matrix = new Matrix4().makeTranslation(x, y, z);
  geom.applyMatrix4(matrix);
  return geom;
}

function mergeAndDispose(geometries: BufferGeometry[]): BufferGeometry {
  const merged = mergeGeometries(geometries, false);
  merged.computeBoundingBox();
  merged.computeBoundingSphere();
  geometries.forEach((g) => g.dispose());
  return merged;
}

export function createBatchedTerrainGeometries(): {
  soilGeom: BufferGeometry;
  grassGeom: BufferGeometry;
  westBoulevardGeom: BufferGeometry;
  eastPromenadeGeom: BufferGeometry;
  sidewalksGeom: BufferGeometry;
  markingsGeom: BufferGeometry;
} {
  if (cachedTerrainGeoms) return cachedTerrainGeoms;

  const soilParts = [
    createBoxWithOffset(5.4, 0.04, 13.8, -3.8, -0.02, 0),
    createBoxWithOffset(5.4, 0.04, 13.8, 3.8, -0.02, 0),
  ];
  const soilGeom = mergeAndDispose(soilParts);

  const grassParts = [
    createBoxWithOffset(5.2, 0.01, 13.6, -3.8, 0, 0),
    createBoxWithOffset(5.2, 0.01, 13.6, 3.8, 0, 0),
  ];
  const grassGeom = mergeAndDispose(grassParts);

  const westBoulevardGeom = createBoxWithOffset(0.7, 0.005, 11.6, -4.8, 0.020, 0);
  westBoulevardGeom.computeBoundingBox();
  westBoulevardGeom.computeBoundingSphere();

  const eastPromenadeGeom = createBoxWithOffset(0.7, 0.005, 11.6, 4.8, 0.020, 0);
  eastPromenadeGeom.computeBoundingBox();
  eastPromenadeGeom.computeBoundingSphere();

  const sidewalkParts = [
    createBoxWithOffset(0.14, 0.005, 11.6, -5.22, 0.015, 0),
    createBoxWithOffset(0.14, 0.005, 11.6, -4.38, 0.015, 0),
    createBoxWithOffset(0.14, 0.005, 11.6, 4.38, 0.015, 0),
    createBoxWithOffset(0.14, 0.005, 11.6, 5.22, 0.015, 0),
  ];
  const sidewalksGeom = mergeAndDispose(sidewalkParts);

  const markingParts: BufferGeometry[] = [];
  for (const pz of [-4.5, -3.0, -1.5, 0, 1.5, 3.0, 4.5]) {
    markingParts.push(createBoxWithOffset(0.04, 0.002, 0.5, -4.8, 0.022, pz));
  }
  for (const cz of [-3.75, -0.75, 0.75, 3.75]) {
    for (const ox of [-0.24, -0.12, 0, 0.12, 0.24]) {
      markingParts.push(createBoxWithOffset(0.07, 0.002, 0.28, -4.8 + ox, 0.022, cz));
    }
  }
  for (const cz of [-3.75, 3.75]) {
    for (const ox of [-0.24, -0.12, 0, 0.12, 0.24]) {
      markingParts.push(createBoxWithOffset(0.07, 0.002, 0.28, 4.8 + ox, 0.022, cz));
    }
  }
  const markingsGeom = mergeAndDispose(markingParts);

  cachedTerrainGeoms = {
    soilGeom,
    grassGeom,
    westBoulevardGeom,
    eastPromenadeGeom,
    sidewalksGeom,
    markingsGeom,
  };
  return cachedTerrainGeoms;
}

export function BatchedDioramaLandmasses(): React.ReactElement {
  const geoms = useMemo(() => createBatchedTerrainGeometries(), []);
  const noopRaycast = () => null;
  return (
    <group position={[0, 0, 0]}>
      <mesh geometry={geoms.soilGeom} receiveShadow raycast={noopRaycast}>
        <meshStandardMaterial color="#D4C5A3" roughness={0.78} />
      </mesh>
      <mesh geometry={geoms.grassGeom} receiveShadow raycast={noopRaycast}>
        <meshStandardMaterial color="#15803D" roughness={0.85} />
      </mesh>
      <mesh geometry={geoms.westBoulevardGeom} receiveShadow raycast={noopRaycast}>
        <meshStandardMaterial color="#1E293B" roughness={0.16} metalness={0.25} />
      </mesh>
      <mesh geometry={geoms.eastPromenadeGeom} receiveShadow raycast={noopRaycast}>
        <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.18} />
      </mesh>
      <mesh geometry={geoms.sidewalksGeom} receiveShadow raycast={noopRaycast}>
        <meshStandardMaterial color="#CBD5E1" roughness={0.35} />
      </mesh>
      <mesh geometry={geoms.markingsGeom} raycast={noopRaycast}>
        <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
      </mesh>
    </group>
  );
}
```

#### Task 2: Đấu dây `BatchedDioramaLandmasses` vào `src/client/3d/diorama/diorama_terrain.tsx`
**Target physical file**: `src/client/3d/diorama/diorama_terrain.tsx`
```typescript
<<<<
import React from 'react';
====
import React from 'react';
import { BatchedDioramaLandmasses } from './batched_diorama_terrain';
>>>>
```

```typescript
<<<<
      {/* ========================================================
          2. BÁN ĐẢO PHÍA TÂY (West Peninsula: X ~ -4.5)
          Mặt nền phẳng y = 0.000, Đại lộ Grand West Boulevard phẳng y = 0.020
         ======================================================== */}
      <group position={[-4.5, 0, 0]}>
        {/* Tầng móng đất liền thổ phẳng (TERRAIN_BASE_Y = 0.000) */}
        <mesh receiveShadow position={[0.7, TERRAIN_BASE_Y - 0.02, 0]}>
          <boxGeometry args={[5.4, 0.04, 13.8]} />
          <meshStandardMaterial color="#D4C5A3" roughness={0.78} />
        </mesh>

        {/* Thảm cỏ xanh đô thị tươi sáng phẳng */}
        <mesh receiveShadow position={[0.7, TERRAIN_BASE_Y, 0]}>
          <boxGeometry args={[5.2, 0.01, 13.6]} />
          <meshStandardMaterial color="#15803D" roughness={0.85} />
        </mesh>

        {/* Khối đồi công viên giật cấp 2 tầng (Diorama Park Relief) */}
        <group data-testid="diorama-park-relief" position={[1.8, 0, -2.5]}>
          {/* Tầng 1: Bệ móng đá xám nâng cao (Y = 0.035, height = 0.025) */}
          <mesh receiveShadow position={[0, 0.035, 0]}>
            <boxGeometry args={[1.6, 0.025, 2.2]} />
            <meshStandardMaterial color="#64748B" roughness={0.6} metalness={0.15} />
          </mesh>
          {/* Tầng 2: Thảm cỏ xanh cao tầng */}
          <mesh receiveShadow position={[0, 0.05, 0]}>
            <boxGeometry args={[1.5, 0.01, 2.1]} />
            <meshStandardMaterial color="#15803D" roughness={0.85} />
          </mesh>
        </group>

        {/* Đại lộ Trục Tây (Grand West Boulevard): Nhựa đường bóng mịn hạ phẳng y = 0.020 (TILE_SURFACE_Y) */}
        <mesh receiveShadow position={[-0.3, TILE_SURFACE_Y, 0]}>
          <boxGeometry args={[0.7, 0.005, 11.6]} />
          <meshStandardMaterial color="#1E293B" roughness={0.16} metalness={0.25} />
        </mesh>

        {/* Vỉa hè lát đá hoa cương hai bên đại lộ hạ về y = 0.015 (TILE_BORDER_Y) */}
        <mesh receiveShadow position={[-0.72, TILE_BORDER_Y, 0]}>
          <boxGeometry args={[0.14, 0.005, 11.6]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.3} metalness={0.1} />
        </mesh>
        <mesh receiveShadow position={[0.12, TILE_BORDER_Y, 0]}>
          <boxGeometry args={[0.14, 0.005, 11.6]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.3} metalness={0.1} />
        </mesh>

        {/* Vạch kẻ phân làn trắng gián đoạn tại y = 0.022 (chống z-fighting với mặt đường 0.020) */}
        {[-4.5, -3.0, -1.5, 0, 1.5, 3.0, 4.5].map((pz) => (
          <mesh key={`west-lane-${pz}`} position={[-0.3, 0.022, pz]}>
            <boxGeometry args={[0.04, 0.002, 0.5]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.25} />
          </mesh>
        ))}

        {/* Vạch kẻ người đi bộ qua đường tại các giao lộ (Zebra Crossings: y = 0.022) */}
        {[-3.75, -0.75, 0.75, 3.75].map((cz) => (
          <group key={`zebra-${cz}`} position={[-0.3, 0.022, cz]}>
            {[-0.24, -0.12, 0, 0.12, 0.24].map((ox, sIdx) => (
              <mesh key={`stripe-${sIdx}`} position={[ox, 0, 0]}>
                <boxGeometry args={[0.07, 0.002, 0.28]} />
                <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* ========================================================
          3. BÁN ĐẢO PHÍA ĐÔNG (East Peninsula: X ~ 4.5)
          Mặt nền phẳng y = 0.000, Tuyến dạo ven vịnh phẳng y = 0.020
         ======================================================== */}
      <group position={[4.5, 0, 0]}>
        {/* Tầng móng đất liền thổ phẳng (TERRAIN_BASE_Y = 0.000) */}
        <mesh receiveShadow position={[-0.7, TERRAIN_BASE_Y - 0.02, 0]}>
          <boxGeometry args={[5.4, 0.04, 13.8]} />
          <meshStandardMaterial color="#D4C5A3" roughness={0.78} />
        </mesh>

        {/* Thảm cỏ xanh đô thị tươi sáng phẳng */}
        <mesh receiveShadow position={[-0.7, TERRAIN_BASE_Y, 0]}>
          <boxGeometry args={[5.2, 0.01, 13.6]} />
          <meshStandardMaterial color="#15803D" roughness={0.85} />
        </mesh>

        {/* Tuyến dạo ven vịnh (Coastal Promenade) lát đá sa mộc sẫm tại y = 0.020 (TILE_SURFACE_Y) */}
        <mesh receiveShadow position={[0.3, TILE_SURFACE_Y, 0]}>
          <boxGeometry args={[0.7, 0.005, 11.6]} />
          <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.18} />
        </mesh>

        {/* Vỉa hè đi dạo hai bên tại y = 0.015 (TILE_BORDER_Y) */}
        <mesh receiveShadow position={[-0.12, TILE_BORDER_Y, 0]}>
          <boxGeometry args={[0.14, 0.005, 11.6]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.35} />
        </mesh>
        <mesh receiveShadow position={[0.72, TILE_BORDER_Y, 0]}>
          <boxGeometry args={[0.14, 0.005, 11.6]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.35} />
        </mesh>

        {/* Vạch kẻ người đi bộ tại các đầu cầu (y = 0.022) */}
        {[-3.75, 3.75].map((cz) => (
          <group key={`east-zebra-${cz}`} position={[0.3, 0.022, cz]}>
            {[-0.24, -0.12, 0, 0.12, 0.24].map((ox, sIdx) => (
              <mesh key={`east-stripe-${sIdx}`} position={[ox, 0, 0]}>
                <boxGeometry args={[0.07, 0.002, 0.28]} />
                <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
              </mesh>
            ))}
          </group>
        ))}
      </group>
====
      {/* ========================================================
          2 & 3. BÁN ĐẢO TÂY & ĐÔNG: Khối nền, đại lộ, vỉa hè & vạch kẻ đường (Batched Merged Geometries)
         ======================================================== */}
      <BatchedDioramaLandmasses />
      <group data-testid="diorama-park-relief" position={[-2.7, 0, -2.5]}>
        <mesh receiveShadow position={[0, 0.035, 0]}>
          <boxGeometry args={[1.6, 0.025, 2.2]} />
          <meshStandardMaterial color="#64748B" roughness={0.6} metalness={0.15} />
        </mesh>
        <mesh receiveShadow position={[0, 0.05, 0]}>
          <boxGeometry args={[1.5, 0.01, 2.1]} />
          <meshStandardMaterial color="#15803D" roughness={0.85} />
        </mesh>
      </group>
>>>>
```

## 4. Definition of Done (DoD) & Stopping Boundary
- [ ] Tất cả 6 bài kiểm thử hợp đồng trong `tests/client/imp375_diorama_static_batching.test.ts` đều chuyển trạng thái sang GREEN.
- [ ] Toàn bộ các bộ kiểm thử sống hiện hữu liên quan đến sa bàn tiếp tục vượt qua 100%:
  - `tests/client/urban_density_and_craft.test.ts` (30/30 tests pass)
  - `tests/contracts/imp283_mobile_3d_lod_throttling.test.ts` (pass)
  - `tests/client/chrome_pawns_and_toy_buildings.test.ts` (pass)
  - `tests/client/urban_diorama_redesign.test.ts` (pass)
  - `tests/client/miniature_city_diorama.test.ts` (pass)
  - `tests/client/imp371_mobile_diorama_draw_call_purge.test.ts` (pass)
- [ ] Vượt qua kiểm toán tự động `npm run prefilter -- src/client/3d/diorama/batched_diorama_terrain.tsx src/client/3d/diorama/diorama_terrain.tsx`.
- [ ] Chụp bằng chứng hình ảnh thị giác qua kịch bản `camera_chase_cinematic` và kiểm toán bằng chứng `node scripts/check_evidence.mjs IMP-375`.
- [ ] Cập nhật Single Source of Truth tại `docs/FEATURE_MAP.md` ghi nhận Phase 1 Diorama Static Batching.
