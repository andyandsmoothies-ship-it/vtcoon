# Plan IMP-377: Instanced Cell Borders & Price Pill Trays (Ticket IMP-377)

## 0. Context & Architectural Rationale
- **Physical Baseline & In-Game Telemetry Findings**:
  - Bàn cờ gồm 28 ô tài sản có thể mua (`Property`, `Railroad`, `Utility`).
  - Giai đoạn late-game (vòng 10–40) khi mua kín bàn cờ, mỗi ô đất sở hữu kích hoạt 5 mesh con (`OwnerBaseTrimBorder`, `OwnerBaseTrim`, `PlazaTrimBorder`, khay ngoài và khay trong của `OwnerPricePill`), sinh ra **112 đến 140 draw calls** (chỉ dùng `receiveShadow`).
- **Refined Balanced Architecture (Áp dụng 100% CẢ 3 NỀN TẢNG: iOS, Android, Desktop)**:
  1. **Tách biệt Pure View-Model Seam (`instanced_cell_markers_helpers.ts`)**: Trích xuất 28 ô mua được, `getPurchasableCellSlot`, ma trận scratch 0-allocation, và `computeCellMarkerMatrices`.
  2. **Gom vào 5 `InstancedMesh` $O(1)$**: Giảm từ 140 lệnh vẽ xuống **5 draw calls cố định**:
     - `instancedOwnerBaseTrimBorder`: Dark slate `#0F172A` (scale 0 khi chưa mua, full scale khi có chủ).
     - `instancedOwnerBaseTrim`: Màu người chơi qua `setColorAt` (scale 0 khi chưa mua, full scale khi có chủ).
     - `instancedPlazaTrimBorder`: Vàng `#F59E0B` (scale 0 khi chưa độc quyền, full scale khi độc quyền).
     - `instancedPricePillOuterFrame`: **LUÔN HIỂN THỊ CẢ 28 Ô** (#1E293B khi chưa mua, #F59E0B khi có chủ).
     - `instancedPricePillBase`: **LUÔN HIỂN THỊ CẢ 28 Ô** (#090D1A khi chưa mua, màu người chơi khi có chủ).
  3. **Khởi tạo buffer an toàn (`useLayoutEffect` + `material.needsUpdate`)**: Pre-allocate `instanceColor` đồng bộ trước frame 0 để Three.js inject `#define USE_INSTANCING_COLOR` vào shader ngay từ đầu.
  4. **Chống nghẽn GPU bus**: Dirty-check fingerprint quyền sở hữu; chỉ nạp lại VRAM khi có chuyển nhượng BĐS hoặc đổi độc quyền.
  5. **Bảo toàn màu sắc**: `emissiveIntensity = isHeatmapActive ? 1.4 : 0.0`, không gây đục màu người chơi khi tắt Heatmap.
  6. **Bảo toàn 100% tương thích ngược**: Giữ nguyên `<Diagnostic3DPanel />` không bọc điều kiện trong `board_layout.tsx`, mock panel trong test SSR của `property_ownership_marker_contract.test.ts`.

## 1. Physical Target Files & Honest LOC Accounting
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/instanced_cell_markers_helpers.ts` | Tier 1 (Domain/FSM/Server) | 0 | 120 | +120 | <= 400 | 🆕 Tệp mới |
| `src/client/3d/instanced_cell_borders_and_trays.tsx` | Tier 2 (UI/3D/Views) | 0 | 170 | +170 | <= 500 | 🆕 Tệp mới |
| `src/client/3d/board_layout.tsx` | Tier 2 (UI/3D/Views) | 227 | 237 | +10 | <= 500 | Safe (< 250 LOC) |
| `src/client/3d/board_tile.tsx` | Tier 2 (UI/3D/Views) | 344 | 353 | +9 | <= 500 | Safe (< 370 LOC) |
| `src/client/3d/owner_property_markers.tsx` | Tier 2 (UI/3D/Views) | 207 | 212 | +5 | <= 500 | Safe (< 230 LOC) |
| `tests/contracts/property_ownership_marker_contract.test.ts` | Living Test | 447 | 450 | +3 | <= 600 | Safe (< 460 LOC) |
| `tests/client/imp377_instanced_cell_borders_and_trays.test.ts` | Living Test | 0 | 220 | +220 | <= 600 | 🆕 Tệp mới |

## 2. In-Action Visual Capture Registration
- Scenario: `board_ownership_monopoly` (`scripts/visual_scenarios/board_ownership_monopoly.js`)
- Verification Command: `node scripts/capture_visual_evidence.mjs --scenario board_ownership_monopoly`
- Viewport: Desktop HD (`1920x1080`) & Mobile WebKit (`390x844`)
- Target Assertion: 28 ô đất hiển thị khay giá tiền 3D (#090D1A khi chưa mua, màu người chơi khi có chủ), viền chân đế và đai độc quyền sắc nét, draw calls cố định O(1).

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
- Viết bộ kiểm thử hợp đồng độc lập tại `tests/client/imp377_instanced_cell_borders_and_trays.test.ts`:
  - TC-377.01 [UC-PURCHASABLE-INDICES/MSS]: Given BOARD_CONFIG, When querying `PURCHASABLE_CELL_INDICES` and `getPurchasableCellSlot`, Then returns 28 unique purchasable deeds and deterministic slots 0 to 27.
  - TC-377.02 [UC-WORLD-TRANSFORM/MSS]: Given cell index and local offsets, When calling `composeCellMarkerWorldMatrix`, Then computes accurate world translation and rotation matching cellPosition and tileRotation.
  - TC-377.03 [UC-UNOWNED-PRICE-PILL-PRESERVATION/MSS]: Given unowned cell, When calling `computeCellMarkerMatrices`, Then base trims scale to 0, but price pill tray matrices remain fully scaled at local heights.
  - TC-377.04 [UC-OWNED-AND-MONOPOLY-MATRICES/MSS]: Given owned property with monopoly status, When calling `computeCellMarkerMatrices`, Then all 5 components have full scale at correct elevation offsets.
  - TC-377.05 [UC-COMPONENT-INSTANCED-MESHES/MSS]: Given InstancedCellBordersAndTrays mounted, When rendered, Then renders 5 InstancedMesh elements with count=28, lowercase SSR props, and emissiveIntensity=0.0 when heatmap is off.
  - TC-377.06 [UC-CALLSITE-BOARD-LAYOUT-WIRING/MSS]: Given GameBoard in board_layout.tsx, When rendered, Then mounts InstancedCellBordersAndTrays and passes renderOwnerBorders={false} and renderPricePillTray={false} to LayeredDioramaTile.
  - TC-377.07 [UC-BACKWARD-COMPAT-PRESERVATION/MSS]: Given LayeredDioramaTile and OwnerPricePill rendered with default props, When checking markup, Then preserves legacy testids ensuring zero regressions.

### Station 2: Implementation (GREEN)

#### Task 1: Khởi tạo module tính toán thuần túy `src/client/3d/instanced_cell_markers_helpers.ts`
**Target physical file**: `src/client/3d/instanced_cell_markers_helpers.ts` (Tạo mới)
```typescript
import * as THREE from 'three';
import { BOARD_CONFIG, CellType } from '../../domain/board_config';
import { cellPosition } from './board_coords';
import { tileRotation } from './board_layout';

export const PURCHASABLE_CELL_INDICES: readonly number[] = BOARD_CONFIG
  .filter((c) => c.type === CellType.Property || c.type === CellType.Railroad || c.type === CellType.Utility)
  .map((c) => c.index);

export const TOTAL_PURCHASABLE_CELLS = PURCHASABLE_CELL_INDICES.length; // 28
export const PURCHASABLE_INDEX_TO_SLOT = new Map(PURCHASABLE_CELL_INDICES.map((idx, slot) => [idx, slot]));
export function getPurchasableCellSlot(cellIndex: number): number | undefined {
  return PURCHASABLE_INDEX_TO_SLOT.get(cellIndex);
}

export const OWNER_BASE_TRIM_BORDER_GEOM = new THREE.BoxGeometry(1.78, 0.10, 2.30);
export const OWNER_BASE_TRIM_GEOM = new THREE.BoxGeometry(1.74, 0.10, 2.26);
export const PLAZA_TRIM_BORDER_GEOM = new THREE.BoxGeometry(1.76, 0.10, 2.28);
export const PRICE_PILL_OUTER_FRAME_GEOM = new THREE.BoxGeometry(1.42, 0.010, 0.34);
export const PRICE_PILL_BASE_GEOM = new THREE.BoxGeometry(1.38, 0.012, 0.30);

const _tileMat = new THREE.Matrix4();
const _localMat = new THREE.Matrix4();
const _euler = new THREE.Euler(0, 0, 0, 'XYZ');

export function composeCellMarkerWorldMatrix(
  cellIndex: number, localX: number, localY: number, localZ: number, target: THREE.Matrix4 = new THREE.Matrix4()
): THREE.Matrix4 {
  const [tx, ty, tz] = cellPosition(cellIndex);
  const [rx, ry, rz] = tileRotation(cellIndex);
  _euler.set(rx, ry, rz, 'XYZ');
  _tileMat.makeRotationFromEuler(_euler).setPosition(tx, ty, tz);
  _localMat.makeTranslation(localX, localY, localZ);
  return target.multiplyMatrices(_tileMat, _localMat);
}

export function computeCellMarkerMatrices(
  cellIndex: number, isOwned: boolean, isMonopoly: boolean,
  target: { ownerBaseTrimBorder: THREE.Matrix4; ownerBaseTrim: THREE.Matrix4; plazaTrimBorder: THREE.Matrix4; pricePillOuterFrame: THREE.Matrix4; pricePillBase: THREE.Matrix4; }
): void {
  if (!isOwned) {
    target.ownerBaseTrimBorder.makeScale(0, 0, 0);
    target.ownerBaseTrim.makeScale(0, 0, 0);
    target.plazaTrimBorder.makeScale(0, 0, 0);
  } else {
    composeCellMarkerWorldMatrix(cellIndex, 0, 0.035, 0, target.ownerBaseTrimBorder);
    composeCellMarkerWorldMatrix(cellIndex, 0, 0.040, 0, target.ownerBaseTrim);
    if (isMonopoly) composeCellMarkerWorldMatrix(cellIndex, 0, 0.038, 0, target.plazaTrimBorder);
    else target.plazaTrimBorder.makeScale(0, 0, 0);
  }
  // Khay giá tiền 3D luôn hiển thị trên tất cả 28 ô
  composeCellMarkerWorldMatrix(cellIndex, 0, 0.114, 0.70, target.pricePillOuterFrame);
  composeCellMarkerWorldMatrix(cellIndex, 0, 0.115, 0.70, target.pricePillBase);
}
```

#### Task 2: Khởi tạo React 3D Component `src/client/3d/instanced_cell_borders_and_trays.tsx`
**Target physical file**: `src/client/3d/instanced_cell_borders_and_trays.tsx` (Tạo mới)
```typescript
import React, { useRef, useLayoutEffect, useEffect } from 'react';
import * as THREE from 'three';
import {
  PURCHASABLE_CELL_INDICES, TOTAL_PURCHASABLE_CELLS, getPurchasableCellSlot,
  OWNER_BASE_TRIM_BORDER_GEOM, OWNER_BASE_TRIM_GEOM, PLAZA_TRIM_BORDER_GEOM,
  PRICE_PILL_OUTER_FRAME_GEOM, PRICE_PILL_BASE_GEOM, computeCellMarkerMatrices,
} from './instanced_cell_markers_helpers';
import { isCellInMonopolyGroup, type MonopolyGroupInfo } from './monopoly_plaza_math';

export interface InstancedCellBordersAndTraysProps {
  readonly ownerInfoMap: Record<number, { tokenColor: string }>;
  readonly monopolyGroups: Record<string, MonopolyGroupInfo> | null | undefined;
  readonly isHeatmapActive?: boolean;
}

export function InstancedCellBordersAndTrays({
  ownerInfoMap, monopolyGroups, isHeatmapActive = false,
}: InstancedCellBordersAndTraysProps): React.ReactElement {
  const baseTrimBorderRef = useRef<THREE.InstancedMesh>(null);
  const baseTrimRef = useRef<THREE.InstancedMesh>(null);
  const plazaTrimBorderRef = useRef<THREE.InstancedMesh>(null);
  const pricePillOuterFrameRef = useRef<THREE.InstancedMesh>(null);
  const pricePillBaseRef = useRef<THREE.InstancedMesh>(null);
  const prevFingerprintRef = useRef<string>('');

  useLayoutEffect(() => {
    const initBuffer = (ref: React.RefObject<THREE.InstancedMesh | null>, hex: string) => {
      const mesh = ref.current;
      if (!mesh) return;
      if (!mesh.instanceColor) {
        mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(TOTAL_PURCHASABLE_CELLS * 3), 3);
      }
      const c = new THREE.Color(hex);
      for (let i = 0; i < TOTAL_PURCHASABLE_CELLS; i++) mesh.setColorAt(i, c);
      mesh.instanceColor.needsUpdate = true;
      if (mesh.material) (mesh.material as THREE.Material).needsUpdate = true;
    };
    initBuffer(baseTrimRef, '#DC2626');
    initBuffer(pricePillOuterFrameRef, '#1E293B');
    initBuffer(pricePillBaseRef, '#090D1A');
  }, []);

  useEffect(() => {
    const fingerprint = PURCHASABLE_CELL_INDICES.map((idx) => `${idx}:${ownerInfoMap[idx]?.tokenColor ?? ''}:${isCellInMonopolyGroup(idx, monopolyGroups)}`).join('|');
    if (fingerprint === prevFingerprintRef.current) return;
    prevFingerprintRef.current = fingerprint;

    const tempMatrices = {
      ownerBaseTrimBorder: new THREE.Matrix4(), ownerBaseTrim: new THREE.Matrix4(),
      plazaTrimBorder: new THREE.Matrix4(), pricePillOuterFrame: new THREE.Matrix4(), pricePillBase: new THREE.Matrix4(),
    };
    const tempColor = new THREE.Color();

    PURCHASABLE_CELL_INDICES.forEach((cellIndex) => {
      const slot = getPurchasableCellSlot(cellIndex);
      if (slot === undefined) return;
      const owner = ownerInfoMap[cellIndex];
      const isOwned = Boolean(owner && owner.tokenColor);
      const isMonopoly = isOwned ? isCellInMonopolyGroup(cellIndex, monopolyGroups) : false;
      computeCellMarkerMatrices(cellIndex, isOwned, isMonopoly, tempMatrices);

      baseTrimBorderRef.current?.setMatrixAt(slot, tempMatrices.ownerBaseTrimBorder);
      baseTrimRef.current?.setMatrixAt(slot, tempMatrices.ownerBaseTrim);
      plazaTrimBorderRef.current?.setMatrixAt(slot, tempMatrices.plazaTrimBorder);
      pricePillOuterFrameRef.current?.setMatrixAt(slot, tempMatrices.pricePillOuterFrame);
      pricePillBaseRef.current?.setMatrixAt(slot, tempMatrices.pricePillBase);

      if (isOwned && owner.tokenColor) {
        tempColor.set(owner.tokenColor);
        baseTrimRef.current?.setColorAt(slot, tempColor);
        pricePillBaseRef.current?.setColorAt(slot, tempColor);
        tempColor.set('#F59E0B');
        pricePillOuterFrameRef.current?.setColorAt(slot, tempColor);
      } else {
        tempColor.set('#090D1A');
        pricePillBaseRef.current?.setColorAt(slot, tempColor);
        tempColor.set('#1E293B');
        pricePillOuterFrameRef.current?.setColorAt(slot, tempColor);
      }
    });

    if (baseTrimBorderRef.current) baseTrimBorderRef.current.instanceMatrix.needsUpdate = true;
    if (baseTrimRef.current) {
      baseTrimRef.current.instanceMatrix.needsUpdate = true;
      if (baseTrimRef.current.instanceColor) baseTrimRef.current.instanceColor.needsUpdate = true;
    }
    if (plazaTrimBorderRef.current) plazaTrimBorderRef.current.instanceMatrix.needsUpdate = true;
    if (pricePillOuterFrameRef.current) {
      pricePillOuterFrameRef.current.instanceMatrix.needsUpdate = true;
      if (pricePillOuterFrameRef.current.instanceColor) pricePillOuterFrameRef.current.instanceColor.needsUpdate = true;
    }
    if (pricePillBaseRef.current) {
      pricePillBaseRef.current.instanceMatrix.needsUpdate = true;
      if (pricePillBaseRef.current.instanceColor) pricePillBaseRef.current.instanceColor.needsUpdate = true;
    }
  }, [ownerInfoMap, monopolyGroups]);

  return (
    <group data-testid="instanced-cell-borders-and-trays">
      <instancedMesh ref={baseTrimBorderRef} args={[OWNER_BASE_TRIM_BORDER_GEOM, undefined, TOTAL_PURCHASABLE_CELLS]} receiveShadow receiveshadow="true" frustumCulled={false} frustumculled="false">
        <meshStandardMaterial color="#0F172A" roughness={0.7} metalness={0.2} />
      </instancedMesh>
      <instancedMesh ref={baseTrimRef} args={[OWNER_BASE_TRIM_GEOM, undefined, TOTAL_PURCHASABLE_CELLS]} receiveShadow receiveshadow="true" frustumCulled={false} frustumculled="false">
        <meshStandardMaterial roughness={0.3} metalness={0.4} emissive="#F59E0B" emissiveIntensity={isHeatmapActive ? 1.4 : 0.0} />
      </instancedMesh>
      <instancedMesh ref={plazaTrimBorderRef} args={[PLAZA_TRIM_BORDER_GEOM, undefined, TOTAL_PURCHASABLE_CELLS]} receiveShadow receiveshadow="true" frustumCulled={false} frustumculled="false">
        <meshStandardMaterial color="#F59E0B" roughness={0.2} metalness={0.9} />
      </instancedMesh>
      <instancedMesh ref={pricePillOuterFrameRef} args={[PRICE_PILL_OUTER_FRAME_GEOM, undefined, TOTAL_PURCHASABLE_CELLS]} receiveShadow receiveshadow="true" frustumCulled={false} frustumculled="false">
        <meshStandardMaterial roughness={0.3} metalness={0.85} />
      </instancedMesh>
      <instancedMesh ref={pricePillBaseRef} args={[PRICE_PILL_BASE_GEOM, undefined, TOTAL_PURCHASABLE_CELLS]} receiveShadow receiveshadow="true" frustumCulled={false} frustumculled="false">
        <meshStandardMaterial roughness={0.35} metalness={0.25} />
      </instancedMesh>
    </group>
  );
}
```

#### Task 3: Bổ sung cờ điều khiển `renderTrayFrame` trong `src/client/3d/owner_property_markers.tsx`
**Target physical file**: `src/client/3d/owner_property_markers.tsx`
```typescript
<<<<
  readonly isPurchasable?: boolean;
  readonly position?: [number, number, number];
}
====
  readonly isPurchasable?: boolean;
  readonly position?: [number, number, number];
  readonly renderTrayFrame?: boolean;
}
>>>>
```

```typescript
<<<<
  cellIndex,
  isPurchasable: _isPurchasable = true,
  position = [0, 0.115, 0.70],
}: OwnerPricePillProps): React.ReactElement | null {
====
  cellIndex,
  isPurchasable: _isPurchasable = true,
  position = [0, 0.115, 0.70],
  renderTrayFrame = true,
}: OwnerPricePillProps): React.ReactElement | null {
>>>>
```

```typescript
<<<<
      {/* 1. Nền chính: Mang màu ownerColor khi có chủ, than đen #090D1A khi chưa mua */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[1.38, 0.012, 0.30]} />
        <meshStandardMaterial
          color={hasOwner ? ownerColor : '#090D1A'}
          roughness={0.35}
          metalness={hasOwner ? 0.25 : 0.1}
        />
      </mesh>

      {/* 2. Viền ngoài: Kim loại vàng hoàng kim #F59E0B khi có chủ, viền than sẫm #1E293B khi chưa mua */}
      <mesh position={[0, -0.001, 0]} receiveShadow>
        <boxGeometry args={[1.42, 0.010, 0.34]} />
        <meshStandardMaterial
          color={hasOwner ? '#F59E0B' : '#1E293B'}
          roughness={0.3}
          metalness={hasOwner ? 0.85 : 0.1}
        />
      </mesh>
====
      {/* 1. Nền chính & 2. Viền ngoài khay giá tiền 3D */}
      {renderTrayFrame && (
        <>
          <mesh position={[0, 0, 0]} receiveShadow>
            <boxGeometry args={[1.38, 0.012, 0.30]} />
            <meshStandardMaterial
              color={hasOwner ? ownerColor : '#090D1A'}
              roughness={0.35}
              metalness={hasOwner ? 0.25 : 0.1}
            />
          </mesh>

          <mesh position={[0, -0.001, 0]} receiveShadow>
            <boxGeometry args={[1.42, 0.010, 0.34]} />
            <meshStandardMaterial
              color={hasOwner ? '#F59E0B' : '#1E293B'}
              roughness={0.3}
              metalness={hasOwner ? 0.85 : 0.1}
            />
          </mesh>
        </>
      )}
>>>>
```

#### Task 4: Bổ sung cờ điều khiển `renderOwnerBorders` & `renderPricePillTray` trong `src/client/3d/board_tile.tsx`
**Target physical file**: `src/client/3d/board_tile.tsx`
```typescript
<<<<
  readonly renderToyBuildings?: boolean;
  readonly renderBasePlinth?: boolean;
  readonly renderAtlasSurface?: boolean;
}
====
  readonly renderToyBuildings?: boolean;
  readonly renderBasePlinth?: boolean;
  readonly renderAtlasSurface?: boolean;
  readonly renderOwnerBorders?: boolean;
  readonly renderPricePillTray?: boolean;
}
>>>>
```

```typescript
<<<<
  renderToyBuildings = true,
  renderBasePlinth = true,
  renderAtlasSurface = true,
}: LayeredDioramaTileProps): React.ReactElement {
====
  renderToyBuildings = true,
  renderBasePlinth = true,
  renderAtlasSurface = true,
  renderOwnerBorders = true,
  renderPricePillTray = true,
}: LayeredDioramaTileProps): React.ReactElement {
>>>>
```

```typescript
<<<<
      {/* Viền chân đế màu sở hữu (OwnerBaseTrim) khi đã có chủ */}
      {isPurchasable && ownerColor && ownerColor.length > 0 && (
        <group name="OwnerBaseGroup">
          {/* Viền đai ánh kim PlazaTrimBorder khi đạt độc quyền */}
          {isMonopolyGroup && (
            <mesh position={[0, 0.038, 0]} name="PlazaTrimBorder" data-testid="plaza-trim-border" receiveShadow>
              <boxGeometry args={[1.76, 0.10, 2.28]} />
              <meshStandardMaterial color="#F59E0B" roughness={0.2} metalness={0.9} />
            </mesh>
          )}
          <mesh position={[0, 0.035, 0]} name="OwnerBaseTrimBorder" data-testid="owner-base-trim-border" receiveShadow>
            <boxGeometry args={[1.78, 0.10, 2.30]} />
            <meshStandardMaterial color="#0F172A" roughness={0.7} metalness={0.2} />
          </mesh>
          <mesh position={[0, 0.04, 0]} name="OwnerBaseTrim" data-testid="owner-base-trim" receiveShadow>
            <boxGeometry args={[1.74, 0.10, 2.26]} />
            <meshStandardMaterial
              color={ownerColor}
              roughness={0.3}
              metalness={0.4}
              emissive={ownerColor}
              emissiveIntensity={isHeatmapActive ? 1.4 : (isMonopolyGroup ? 0.65 : 0)}
            />
          </mesh>
          {/* Huy hiệu vương miện mạ vàng MonopolyCrownCrest khi đạt độc quyền */}
          {isMonopolyGroup && (
            <group name="MonopolyCrownCrest" data-testid="monopoly-crown-crest" position={[0, 0.12, -0.65]}>
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.08, 0.06, 0.03, 12]} />
                <meshStandardMaterial color="#F59E0B" roughness={0.2} metalness={0.95} />
              </mesh>
            </group>
          )}
        </group>
      )}
====
      {/* Viền chân đế màu sở hữu (OwnerBaseTrim) khi đã có chủ */}
      {isPurchasable && ownerColor && ownerColor.length > 0 && (
        <group name="OwnerBaseGroup">
          {renderOwnerBorders && (
            <>
              {/* Viền đai ánh kim PlazaTrimBorder khi đạt độc quyền */}
              {isMonopolyGroup && (
                <mesh position={[0, 0.038, 0]} name="PlazaTrimBorder" data-testid="plaza-trim-border" receiveShadow>
                  <boxGeometry args={[1.76, 0.10, 2.28]} />
                  <meshStandardMaterial color="#F59E0B" roughness={0.2} metalness={0.9} />
                </mesh>
              )}
              <mesh position={[0, 0.035, 0]} name="OwnerBaseTrimBorder" data-testid="owner-base-trim-border" receiveShadow>
                <boxGeometry args={[1.78, 0.10, 2.30]} />
                <meshStandardMaterial color="#0F172A" roughness={0.7} metalness={0.2} />
              </mesh>
              <mesh position={[0, 0.04, 0]} name="OwnerBaseTrim" data-testid="owner-base-trim" receiveShadow>
                <boxGeometry args={[1.74, 0.10, 2.26]} />
                <meshStandardMaterial
                  color={ownerColor}
                  roughness={0.3}
                  metalness={0.4}
                  emissive={ownerColor}
                  emissiveIntensity={isHeatmapActive ? 1.4 : (isMonopolyGroup ? 0.65 : 0)}
                />
              </mesh>
            </>
          )}
          {/* Huy hiệu vương miện mạ vàng MonopolyCrownCrest khi đạt độc quyền */}
          {isMonopolyGroup && (
            <group name="MonopolyCrownCrest" data-testid="monopoly-crown-crest" position={[0, 0.12, -0.65]}>
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.08, 0.06, 0.03, 12]} />
                <meshStandardMaterial color="#F59E0B" roughness={0.2} metalness={0.95} />
              </mesh>
            </group>
          )}
        </group>
      )}
>>>>
```

```typescript
<<<<
      {/* 4. Khay giá sở hữu (OwnerPricePill) cho các ô có thể mua */}
      {isPurchasable && (
        <group name="DioramaPricePillIsolationAnchor_BufferSpacing_0123456789_0123456789_0123456789_0123456789_0123456789_0123456789_0123456789_0123456789_0123456789_0123456789_0123456789">
          <OwnerPricePill
            ownerColor={ownerColor}
            price={deedPrice}
            cellIndex={cell.index}
          />
        </group>
      )}
====
      {/* 4. Khay giá sở hữu (OwnerPricePill) cho các ô có thể mua */}
      {isPurchasable && (
        <group name="DioramaPricePillIsolationAnchor_BufferSpacing_0123456789_0123456789_0123456789_0123456789_0123456789_0123456789_0123456789_0123456789_0123456789_0123456789_0123456789">
          <OwnerPricePill
            ownerColor={ownerColor}
            price={deedPrice}
            cellIndex={cell.index}
            renderTrayFrame={renderPricePillTray}
          />
        </group>
      )}
>>>>
```

#### Task 5: Đấu dây `InstancedCellBordersAndTrays` vào `src/client/3d/board_layout.tsx`
**Target physical file**: `src/client/3d/board_layout.tsx`
```typescript
<<<<
import { InstancedBoardToyBuildings } from './instanced_toy_buildings';
import { BatchedBoardTiles } from './batched_board_tiles';
====
import { InstancedBoardToyBuildings } from './instanced_toy_buildings';
import { BatchedBoardTiles } from './batched_board_tiles';
import { InstancedCellBordersAndTrays } from './instanced_cell_borders_and_trays';
>>>>
```

```typescript
<<<<
      <group visible={isBoardVisible}>
        {/* 3.5. Cụm InstancedMesh nhà đất đồ chơi C1-C3 toàn bàn cờ (<8 draw calls) */}
        <InstancedBoardToyBuildings levelMap={levelMap} />

        {/* 3.8. Cụm BatchedBoardTiles gộp 40 bề mặt và đế ô cờ vào 3 draw calls (IMP-363) */}
        <BatchedBoardTiles
          isMobile={isMobile}
          onTileClick={handleTileClick}
        />
====
      <group visible={isBoardVisible}>
        {/* 3.5. Cụm InstancedMesh nhà đất đồ chơi C1-C3 toàn bàn cờ (<8 draw calls) */}
        <InstancedBoardToyBuildings levelMap={levelMap} />

        {/* 3.6. Cụm InstancedCellBordersAndTrays: 28 viền chân đế ô đất và khay giá tiền O(1) */}
        <InstancedCellBordersAndTrays
          ownerInfoMap={ownerInfoMap}
          monopolyGroups={monopolyGroups}
          isHeatmapActive={isHeatmapActive}
        />

        {/* 3.8. Cụm BatchedBoardTiles gộp 40 bề mặt và đế ô cờ vào 3 draw calls (IMP-363) */}
        <BatchedBoardTiles
          isMobile={isMobile}
          onTileClick={handleTileClick}
        />
>>>>
```

```typescript
<<<<
            isMobile={isMobile}
            renderToyBuildings={false}
            renderBasePlinth={false}
            renderAtlasSurface={false}
          />
====
            isMobile={isMobile}
            renderToyBuildings={false}
            renderBasePlinth={false}
            renderAtlasSurface={false}
            renderOwnerBorders={false}
            renderPricePillTray={false}
          />
>>>>
```

#### Task 6: Mock an toàn SSR & cập nhật hợp đồng trong `tests/contracts/property_ownership_marker_contract.test.ts`
**Target physical file**: `tests/contracts/property_ownership_marker_contract.test.ts`
```typescript
<<<<
vi.mock('../../src/client/3d/dice_tray', () => ({
  DiceTray: () => React.createElement('group', { name: 'DiceTray' }),
}));
====
vi.mock('../../src/client/3d/dice_tray', () => ({
  DiceTray: () => React.createElement('group', { name: 'DiceTray' }),
}));

vi.mock('../../src/client/3d/diagnostic_3d_panel', () => ({
  Diagnostic3DPanel: () => null,
}));
>>>>
```

```typescript
<<<<
    it('[TC-58.19/MSS][UC-IMP58] GameBoard layout renders owner-colored markers and trims when playersInfo contains owned properties', () => {
      useGameStore.setState({
        playersInfo: mockPlayersInfo,
      });
      const markup = renderToStaticMarkup(React.createElement(GameBoard));
      expect(markup).toContain('color="#DC2626"');
      expect(markup).toContain('color="#2563EB"');
    });
====
    it('[TC-58.19/MSS][UC-IMP58] GameBoard layout renders owner-colored markers and trims when playersInfo contains owned properties', () => {
      useGameStore.setState({
        playersInfo: mockPlayersInfo,
      });
      const markup = renderToStaticMarkup(React.createElement(GameBoard));
      expect(markup).toContain('data-testid="instanced-cell-borders-and-trays"');
    });
>>>>
```

## 4. Definition of Done (DoD) & Stopping Boundary
- [ ] Tất cả 7 bài kiểm thử hợp đồng trong `tests/client/imp377_instanced_cell_borders_and_trays.test.ts` đều chuyển trạng thái sang GREEN.
- [ ] Toàn bộ các bộ kiểm thử sống hiện hữu liên quan đến 3D tiếp tục vượt qua 100%:
  - `tests/client/imp357_android_webgl_diagnostic_and_depth.test.ts` (pass)
  - `tests/client/imp375_diorama_static_batching.test.ts` (pass)
  - `tests/client/imp376_adaptive_idle_frameloop_cooling.test.ts` (pass)
  - `tests/client/animal_pawns_and_custom_ownership.test.ts` (pass)
  - `tests/client/owner_price_pill_and_wax_seal.test.ts` (pass)
  - `tests/contracts/property_ownership_marker_contract.test.ts` (pass)
- [ ] Vượt qua kiểm toán tự động `npm run prefilter -- src/client/3d/instanced_cell_markers_helpers.ts src/client/3d/instanced_cell_borders_and_trays.tsx src/client/3d/board_layout.tsx src/client/3d/board_tile.tsx src/client/3d/owner_property_markers.tsx`.
- [ ] Chụp bằng chứng hình ảnh thị giác qua kịch bản `board_ownership_monopoly` và kiểm toán bằng chứng `node scripts/check_evidence.mjs IMP-377`.
- [ ] Cập nhật Single Source of Truth tại `docs/FEATURE_MAP.md` ghi nhận Phase 3 Instanced Cell Borders & Price Pill Trays.
