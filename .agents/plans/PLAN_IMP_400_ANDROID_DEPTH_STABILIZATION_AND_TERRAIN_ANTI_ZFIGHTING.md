# Plan IMP-400: Android Depth Stabilization & Terrain Anti-Z-Fighting (Ticket IMP-400)

## 0. Auto-Slicing Roadmap & Context
- **Ticket Objective**: Triệt tiêu dứt điểm hiện tượng nền sa bàn 3D bị chớp nháy sọc vàng - trắng và rách đa giác (Z-fighting) trên Android WebGL / Mali & Adreno GPU (tuân thủ Gotcha 24 tại `docs/domain/gotchas/3d_cinematics.md` & kết quả phản biện tại `.agents/audit/PLAN_CHALLENGE_IMP-400.md`):
  1. *Terrain Depth Separation & Continuity*: Trong `batched_diorama_terrain.tsx`, hạ sâu nền đất móng xuống $Y = -0.04$ (mặt trên $Y = -0.02$). Thảm cỏ xanh được mở rộng thành khối đặc 3D dày 4.5cm ($h = 0.045$, tâm $Y = -0.0025$, mặt trên $Y = +0.02$, mặt đáy $Y = -0.025$ ăn sâu 5mm vào nền đất móng, triệt tiêu khe hở lơ lửng 1cm theo [ADV-03]). Vạch kẻ đường (`markingsGeom`) nâng lên $Y = 0.0255$ và gán vật liệu `polygonOffset` chống chớp trắng. Đồng bộ `TERRAIN_BASE_Y = -0.015` trong `diorama_terrain.tsx` để khớp khít bờ kè sông Sài Gòn ([ADV-05]).
  2. *Heritage District Downward Volumetric Extrusion*: Trong `diorama_heritage_district.tsx`, thềm gạch bông (`Heritage Plaza`) thay thế bằng khối đá 3D `boxGeometry args={[1.7, 0.024, 2.6]}` đặt tại `position={[0.35, -0.009, 0.02]}` (mặt trên giữ chuẩn $+0.003$, mặt đáy sâu $-0.021$, khối đặc 2.4cm, bảo toàn 100% cao độ các công trình con và triệt tiêu nguy cơ co-planar Z-fighting tại $Y = 0.030$ theo [ADV-02]). Bổ sung `forceFallback={isMobile ? true : undefined}` vào `<SafeGLTFModel>` Nhà Thờ Cổ; loại bỏ can thiệp vào dead code Chợ Bến Thành ([ADV-01]).
  3. *Traffic Headlight Depth Mask*: Trong `diorama_traffic.tsx`, vệt đèn pha LED (`#FEF08A` vàng) bổ sung `depthWrite={false}` chống đè depth buffer mặt đường.
  4. *Container Port Plinth Guard*: Trong `diorama_container_port.tsx`, tấm bóng tiếp xúc chân bãi container được bọc bằng `{!isMobile && (...) }`.
- **Subsystem Confinement**: Toàn bộ thay đổi nằm trọn trong `client-3d` (`src/client/3d/diorama/*`), 0 file ngoài lề.

## 1. Physical Target Files & Honest LOC Accounting
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| `src/client/3d/diorama/batched_diorama_terrain.tsx` | Tier 2 (UI/3D/Views) | 129 | 134 | +5 | <= 500 | Safe (< 500 LOC) |
| `src/client/3d/diorama/diorama_heritage_district.tsx` | Tier 2 (UI/3D/Views) | 325 | 336 | +11 | <= 500 | Warning (>= 300 LOC, Tech Debt logged) |
| `src/client/3d/diorama/diorama_traffic.tsx` | Tier 2 (UI/3D/Views) | 303 | 304 | +1 | <= 500 | Warning (>= 300 LOC, Tech Debt logged) |
| `src/client/3d/diorama/diorama_container_port.tsx` | Tier 2 (UI/3D/Views) | 289 | 291 | +2 | <= 500 | Safe (< 500 LOC) |
| `src/client/3d/diorama/diorama_terrain.tsx` | Tier 2 (UI/3D/Views) | 73 | 73 | 0 | <= 500 | Safe (< 500 LOC) |
| `tests/client/imp400_android_depth_and_terrain_zfighting.test.ts` | Living Test | 0 | 120 | +120 | <= 600 | Contract Test Suite |
| `docs/FEATURE_MAP.md` | SSOT Matrix | 92 | 93 | +1 | N/A | Cập nhật Section Gotchas Pillar 14 |

## 2. In-Action Visual Capture Registration
- Visual evidence registration: `npm run capture:visual -- --ticket IMP-400 --scenario camera_chase_cinematic` (elevation <= 20.0m) và kiểm tra qua `imp400_android_depth_and_terrain_zfighting.test.ts`.

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
- **TC-400.01 [UC-TERRAIN-VOLUMETRIC-DEPTH/MSS]:** Given `createBatchedTerrainGeometries`, When inspecting `soilGeom` and `grassGeom`, Then soil top face is at $Y \le -0.02\text{m}$, grass top face is at $Y \ge 0.02\text{m}$, and grass bottom face satisfies `grassGeom.boundingBox.min.y <= soilGeom.boundingBox.max.y` guaranteeing volumetric continuity ([ADV-04]).
- **TC-400.02 [UC-TERRAIN-HARDWARE-POLYGON-OFFSET/MSS]:** Given `BatchedDioramaLandmasses`, When rendered, Then markings mesh material declares `polygonOffset: true`, `polygonOffsetFactor: -1.0`, and `polygonOffsetUnits: -4.0`.
- **TC-400.03 [UC-HERITAGE-VOLUMETRIC-PLAZA/MSS]:** Given `DioramaHeritageDistrict` with `isMobile: true`, When rendered, Then eliminates flat 2D `planeGeometry` for Heritage Plaza and renders 3D solid `boxGeometry` terrace with physical height $\ge 0.02\text{m}$ and top face at $Y \le 0.005\text{m}$ preserving child model elevations ([ADV-02]).
- **TC-400.04 [UC-HERITAGE-FALLBACK-FORCE/MSS]:** Given `DioramaHeritageDistrict` with `isMobile: true`, When inspecting `SafeGLTFModel`, Then passes `forceFallback={true}` avoiding network and GLTF Z-fighting on mobile.
- **TC-400.05 [UC-TRAFFIC-HEADLIGHT-DEPTH-WRITE/MSS]:** Given `DioramaTraffic`, When inspecting headlight fan plane mesh material, Then explicitly sets `depthWrite={false}`.
- **TC-400.06 [UC-PORT-CONTACT-SHADOW-OMISSION/MSS]:** Given `DioramaContainerPort` with `isMobile: true`, When rendered, Then omits flat 2D contact shadow `planeGeometry`.

### Station 2: Implementation (GREEN)

#### Task 1: Nền đất móng chìm, thảm cỏ 3D liền khối ăn sâu móng & PolygonOffset vạch kẻ
**Target physical file**: `src/client/3d/diorama/batched_diorama_terrain.tsx`
```typescript
<<<<
  // 1. Foundation Soil (West Peninsula at X = -3.8, East Peninsula at X = 3.8)
  const soilParts = [
    createBoxWithOffset(5.4, 0.04, 13.8, -3.8, -0.02, 0),
    createBoxWithOffset(5.4, 0.04, 13.8, 3.8, -0.02, 0),
  ];
  const soilGeom = mergeAndDispose(soilParts);

  // 2. Green Grass Lawns (West Peninsula at X = -3.8, East Peninsula at X = 3.8)
  const grassParts = [
    createBoxWithOffset(5.2, 0.01, 13.6, -3.8, 0, 0),
    createBoxWithOffset(5.2, 0.01, 13.6, 3.8, 0, 0),
  ];
  const grassGeom = mergeAndDispose(grassParts);

  // 3. Grand West Boulevard (X = -4.8, Y = 0.020)
  const westBoulevardGeom = createBoxWithOffset(0.7, 0.005, 11.6, -4.8, 0.020, 0);
  westBoulevardGeom.computeBoundingBox();
  westBoulevardGeom.computeBoundingSphere();

  // 4. Coastal Promenade East (X = 4.8, Y = 0.020)
  const eastPromenadeGeom = createBoxWithOffset(0.7, 0.005, 11.6, 4.8, 0.020, 0);
  eastPromenadeGeom.computeBoundingBox();
  eastPromenadeGeom.computeBoundingSphere();

  // 5. Granite Sidewalks (West at X = -5.22, -4.38; East at X = 4.38, 5.22)
  const sidewalkParts = [
    createBoxWithOffset(0.14, 0.005, 11.6, -5.22, 0.015, 0),
    createBoxWithOffset(0.14, 0.005, 11.6, -4.38, 0.015, 0),
    createBoxWithOffset(0.14, 0.005, 11.6, 4.38, 0.015, 0),
    createBoxWithOffset(0.14, 0.005, 11.6, 5.22, 0.015, 0),
  ];
  const sidewalksGeom = mergeAndDispose(sidewalkParts);

  // 6. Road Markings (37 items: 7 lane stripes, 20 West zebra stripes, 10 East zebra stripes)
  const markingParts: BufferGeometry[] = [];
  // 7 West lane stripes
  for (const pz of [-4.5, -3.0, -1.5, 0, 1.5, 3.0, 4.5]) {
    markingParts.push(createBoxWithOffset(0.04, 0.002, 0.5, -4.8, 0.022, pz));
  }
  // 4 West zebra crossings (20 stripes)
  for (const cz of [-3.75, -0.75, 0.75, 3.75]) {
    for (const ox of [-0.24, -0.12, 0, 0.12, 0.24]) {
      markingParts.push(createBoxWithOffset(0.07, 0.002, 0.28, -4.8 + ox, 0.022, cz));
    }
  }
  // 2 East zebra crossings (10 stripes)
  for (const cz of [-3.75, 3.75]) {
    for (const ox of [-0.24, -0.12, 0, 0.12, 0.24]) {
      markingParts.push(createBoxWithOffset(0.07, 0.002, 0.28, 4.8 + ox, 0.022, cz));
    }
  }
====
  // 1. Foundation Soil (West Peninsula at X = -3.8, East Peninsula at X = 3.8) - Sunk to prevent Z-fighting
  const soilParts = [
    createBoxWithOffset(5.4, 0.04, 13.8, -3.8, -0.04, 0),
    createBoxWithOffset(5.4, 0.04, 13.8, 3.8, -0.04, 0),
  ];
  const soilGeom = mergeAndDispose(soilParts);

  // 2. Green Grass Lawns (West Peninsula at X = -3.8, East Peninsula at X = 3.8) - 4.5cm solid slab embeds 5mm into soil
  const grassParts = [
    createBoxWithOffset(5.2, 0.045, 13.6, -3.8, -0.0025, 0),
    createBoxWithOffset(5.2, 0.045, 13.6, 3.8, -0.0025, 0),
  ];
  const grassGeom = mergeAndDispose(grassParts);

  // 3. Grand West Boulevard (X = -4.8, Y = 0.022, top face 0.025)
  const westBoulevardGeom = createBoxWithOffset(0.7, 0.006, 11.6, -4.8, 0.022, 0);
  westBoulevardGeom.computeBoundingBox();
  westBoulevardGeom.computeBoundingSphere();

  // 4. Coastal Promenade East (X = 4.8, Y = 0.022, top face 0.025)
  const eastPromenadeGeom = createBoxWithOffset(0.7, 0.006, 11.6, 4.8, 0.022, 0);
  eastPromenadeGeom.computeBoundingBox();
  eastPromenadeGeom.computeBoundingSphere();

  // 5. Granite Sidewalks (West at X = -5.22, -4.38; East at X = 4.38, 5.22, elevated curb)
  const sidewalkParts = [
    createBoxWithOffset(0.14, 0.010, 11.6, -5.22, 0.025, 0),
    createBoxWithOffset(0.14, 0.010, 11.6, -4.38, 0.025, 0),
    createBoxWithOffset(0.14, 0.010, 11.6, 4.38, 0.025, 0),
    createBoxWithOffset(0.14, 0.010, 11.6, 5.22, 0.025, 0),
  ];
  const sidewalksGeom = mergeAndDispose(sidewalkParts);

  // 6. Road Markings (37 items: 7 lane stripes, 20 West zebra stripes, 10 East zebra stripes)
  const markingParts: BufferGeometry[] = [];
  // 7 West lane stripes
  for (const pz of [-4.5, -3.0, -1.5, 0, 1.5, 3.0, 4.5]) {
    markingParts.push(createBoxWithOffset(0.04, 0.002, 0.5, -4.8, 0.0255, pz));
  }
  // 4 West zebra crossings (20 stripes)
  for (const cz of [-3.75, -0.75, 0.75, 3.75]) {
    for (const ox of [-0.24, -0.12, 0, 0.12, 0.24]) {
      markingParts.push(createBoxWithOffset(0.07, 0.002, 0.28, -4.8 + ox, 0.0255, cz));
    }
  }
  // 2 East zebra crossings (10 stripes)
  for (const cz of [-3.75, 3.75]) {
    for (const ox of [-0.24, -0.12, 0, 0.12, 0.24]) {
      markingParts.push(createBoxWithOffset(0.07, 0.002, 0.28, 4.8 + ox, 0.0255, cz));
    }
  }
>>>>
```

```typescript
<<<<
      <mesh geometry={geoms.markingsGeom} raycast={noopRaycast}>
        <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
      </mesh>
====
      <mesh geometry={geoms.markingsGeom} raycast={noopRaycast}>
        <meshStandardMaterial
          color="#FFFFFF"
          roughness={0.2}
          polygonOffset
          polygonOffsetFactor={-1.0}
          polygonOffsetUnits={-4.0}
        />
      </mesh>
>>>>
```

#### Task 2: Thềm gạch bông 3D khoét chìm xuống móng & Force Fallback di sản mobile
**Target physical file**: `src/client/3d/diorama/diorama_heritage_district.tsx`
```typescript
<<<<
      {/* ========================================================
          THỀM QUẢNG TRƯỜNG GẠCH BÔNG ĐÔNG DƯƠNG (Heritage Plaza)
         ======================================================== */}
      <mesh position={[0.35, 0.003, 0.02]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.7, 2.6]} />
        <meshStandardMaterial
          color="#FAF5EE"
          roughness={0.6}
          map={encausticTexture ?? undefined}
        />
      </mesh>

      {/* ========================================================
          1. NHÀ THỜ ĐỨC BÀ CỔ GẠCH ĐỎ ĐÔNG DƯƠNG (Heritage Cathedral)
             Đứng độc tôn, uy nghi, tráng lệ trên trục di sản
         ======================================================== */}
      <group position={[0.2, 0, 0.75]} name="HeritageCathedralGroup" data-model-url={LANDMARK_MODEL_URLS.cathedral}>
        <SafeGLTFModel
          url={LANDMARK_MODEL_URLS.cathedral}
          fallback={<CathedralProceduralFallback isNight={isNight} isSunset={isSunset} isMobile={isMobile} />}
          castShadow={!isMobile}
          receiveShadow
        />
      </group>
====
      {/* ========================================================
          THỀM QUẢNG TRƯỜNG GẠCH BÔNG ĐÔNG DƯƠNG (Heritage Plaza)
         ======================================================== */}
      {isMobile ? (
        <mesh position={[0.35, -0.009, 0.02]} receiveShadow>
          <boxGeometry args={[1.7, 0.024, 2.6]} />
          <meshStandardMaterial
            color="#FAF5EE"
            roughness={0.6}
            map={encausticTexture ?? undefined}
          />
        </mesh>
      ) : (
        <mesh position={[0.35, 0.003, 0.02]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.7, 2.6]} />
          <meshStandardMaterial
            color="#FAF5EE"
            roughness={0.6}
            map={encausticTexture ?? undefined}
          />
        </mesh>
      )}

      {/* ========================================================
          1. NHÀ THỜ ĐỨC BÀ CỔ GẠCH ĐỎ ĐÔNG DƯƠNG (Heritage Cathedral)
             Đứng độc tôn, uy nghi, tráng lệ trên trục di sản
         ======================================================== */}
      <group position={[0.2, 0, 0.75]} name="HeritageCathedralGroup" data-model-url={LANDMARK_MODEL_URLS.cathedral}>
        <SafeGLTFModel
          url={LANDMARK_MODEL_URLS.cathedral}
          fallback={<CathedralProceduralFallback isNight={isNight} isSunset={isSunset} isMobile={isMobile} />}
          castShadow={!isMobile}
          receiveShadow
          forceFallback={isMobile ? true : undefined}
        />
      </group>
>>>>
```

#### Task 3: Bổ sung depthWrite={false} cho vệt đèn pha LED vi mô
**Target physical file**: `src/client/3d/diorama/diorama_traffic.tsx`
```typescript
<<<<
              {/* Vệt sáng quạt đèn LED rọi xuống mặt đường nhựa */}
              <mesh position={[0, 0.004, l / 2 + 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[w * 2.2, 0.38]} />
                <meshBasicMaterial
                  color="#FEF08A"
                  transparent
                  opacity={isNight ? 0.65 : isSunset ? 0.42 : 0.28}
                />
              </mesh>
====
              {/* Vệt sáng quạt đèn LED rọi xuống mặt đường nhựa */}
              <mesh position={[0, 0.004, l / 2 + 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[w * 2.2, 0.38]} />
                <meshBasicMaterial
                  color="#FEF08A"
                  transparent
                  opacity={isNight ? 0.65 : isSunset ? 0.42 : 0.28}
                  depthWrite={false}
                />
              </mesh>
>>>>
```

#### Task 4: Miễn nhiễm tấm bóng tiếp xúc 2D bãi container trên mobile
**Target physical file**: `src/client/3d/diorama/diorama_container_port.tsx`
```typescript
<<<<
        {/* Đệm mặt sàn bãi tối màu tạo độ sâu và bóng tiếp xúc chân bãi */}
        <mesh receiveShadow position={[-0.25, 0.003, 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.25, 1.7]} />
          <meshStandardMaterial color="#1E293B" roughness={0.9} />
        </mesh>
====
        {/* Đệm mặt sàn bãi tối màu tạo độ sâu và bóng tiếp xúc chân bãi (Desktop 24-bit depth) */}
        {!isMobile && (
          <mesh receiveShadow position={[-0.25, 0.003, 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.25, 1.7]} />
            <meshStandardMaterial color="#1E293B" roughness={0.9} />
          </mesh>
        )}
>>>>
```

#### Task 5: Đồng bộ cao độ bờ kè sông Sài Gòn
**Target physical file**: `src/client/3d/diorama/diorama_terrain.tsx`
```typescript
<<<<
const RIVER_BED_Y = -0.035;
const TERRAIN_BASE_Y = 0.000;
====
const RIVER_BED_Y = -0.035;
const TERRAIN_BASE_Y = -0.015;
>>>>
```

#### Task 6: Cập nhật SSOT Feature Map
**Target physical file**: `docs/FEATURE_MAP.md`
```markdown
<<<<
| Pillar 13 (Kinematics & Smooth Camera) | `src/client/3d/pawn_path.ts`<br>`src/client/3d/camera_state_machine.ts`<br>`src/client/events/pacing_context.ts` | • `tests/client/imp398_cinematic_pacing_and_smooth_camera.test.ts`<br>• `tests/client/cinematic_chase_camera.test.ts` |
====
| Pillar 13 (Kinematics & Smooth Camera) | `src/client/3d/pawn_path.ts`<br>`src/client/3d/camera_state_machine.ts`<br>`src/client/events/pacing_context.ts` | • `tests/client/imp398_cinematic_pacing_and_smooth_camera.test.ts`<br>• `tests/client/cinematic_chase_camera.test.ts` |
| Pillar 14 (Mobile Anti-Z-Fighting & Volumetric Terrain) | `src/client/3d/diorama/batched_diorama_terrain.tsx`<br>`src/client/3d/diorama/diorama_heritage_district.tsx`<br>`src/client/3d/diorama/diorama_traffic.tsx`<br>`src/client/3d/diorama/diorama_container_port.tsx`<br>`src/client/3d/diorama/diorama_terrain.tsx` | • `tests/client/imp400_android_depth_and_terrain_zfighting.test.ts`<br>• `tests/client/imp375_diorama_static_batching.test.ts` |
>>>>
```

## 4. Definition of Done (DoD) & Stopping Criteria
1. Bộ kiểm thử hợp đồng `tests/client/imp400_android_depth_and_terrain_zfighting.test.ts` (6 TCs) vượt qua 100% (green).
2. Các living test suites liên quan (`imp375_diorama_static_batching.test.ts`, `imp371_mobile_diorama_draw_call_purge.test.ts`) không bị hồi quy.
3. `npm run prefilter` đạt exit code 0 với 0 dirty casts, 0 type errors, tuân thủ LOC limits.
4. Sentinel mutation testing `npm run sentinel -- --ticket IMP-400` hoàn tất thành công.
5. Evidence check `node scripts/check_evidence.mjs 400` báo cáo hợp lệ 100%.
