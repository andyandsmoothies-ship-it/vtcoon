// [UI-S02/MSS][IMP-377] instanced_cell_markers_helpers.ts — Pure helper logic for instanced cell borders & price pill trays
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { BOARD_CONFIG, CellType } from '../../domain/board_config';
import { cellPosition, tileRotation } from './board_coords';
import { getPricePillAtlasUVs } from './price_pill_texture_atlas';


export const PURCHASABLE_CELL_INDICES: readonly number[] = BOARD_CONFIG
  .filter((c) => c.type === CellType.Property || c.type === CellType.Railroad || c.type === CellType.Utility)
  .map((c) => c.index);

export const TOTAL_PURCHASABLE_CELLS = PURCHASABLE_CELL_INDICES.length; // 28

export const PURCHASABLE_INDEX_TO_SLOT: ReadonlyMap<number, number> = new Map(
  PURCHASABLE_CELL_INDICES.map((cellIdx, slot) => [cellIdx, slot])
);

export function getPurchasableCellSlot(cellIndex: number): number | undefined {
  return PURCHASABLE_INDEX_TO_SLOT.get(cellIndex);
}

// 1. Static Geometries (Pre-baked box dimensions matching board_tile.tsx & owner_property_markers.tsx)
export const OWNER_BASE_TRIM_BORDER_GEOM = new THREE.BoxGeometry(1.78, 0.10, 2.30);
export const OWNER_BASE_TRIM_GEOM = new THREE.BoxGeometry(1.74, 0.10, 2.26);
export const PLAZA_TRIM_BORDER_GEOM = new THREE.BoxGeometry(1.76, 0.10, 2.28);
export const PRICE_PILL_OUTER_FRAME_GEOM = new THREE.BoxGeometry(1.42, 0.010, 0.34);
export const PRICE_PILL_BASE_GEOM = new THREE.BoxGeometry(1.38, 0.012, 0.30);

// Reusable scratch variables (Zero GC allocation in frame/update)
const _tileMat = new THREE.Matrix4();
const _localMat = new THREE.Matrix4();
const _euler = new THREE.Euler(0, 0, 0, 'XYZ');

export function composeCellMarkerWorldMatrix(
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

export function computeCellMarkerMatrices(
  cellIndex: number,
  isOwned: boolean,
  isMonopoly: boolean,
  target: {
    ownerBaseTrimBorder: THREE.Matrix4;
    ownerBaseTrim: THREE.Matrix4;
    plazaTrimBorder: THREE.Matrix4;
    pricePillOuterFrame: THREE.Matrix4;
    pricePillBase: THREE.Matrix4;
  }
): void {
  if (!isOwned) {
    target.ownerBaseTrimBorder.makeScale(0, 0, 0);
    target.ownerBaseTrim.makeScale(0, 0, 0);
    target.plazaTrimBorder.makeScale(0, 0, 0);
  } else {
    // 1. Viền ngoài chân đế (OwnerBaseTrimBorder y = 0.035)
    composeCellMarkerWorldMatrix(cellIndex, 0, 0.035, 0, target.ownerBaseTrimBorder);

    // 2. Viền màu chân đế (OwnerBaseTrim y = 0.040)
    composeCellMarkerWorldMatrix(cellIndex, 0, 0.040, 0, target.ownerBaseTrim);

    // 3. Viền độc quyền ánh kim (PlazaTrimBorder y = 0.038)
    if (isMonopoly) {
      composeCellMarkerWorldMatrix(cellIndex, 0, 0.038, 0, target.plazaTrimBorder);
    } else {
      target.plazaTrimBorder.makeScale(0, 0, 0);
    }
  }

  // 4 & 5. Khay giá tiền 3D luôn hiển thị trên tất cả 28 ô tài sản
  composeCellMarkerWorldMatrix(cellIndex, 0, 0.114, 0.70, target.pricePillOuterFrame);
  composeCellMarkerWorldMatrix(cellIndex, 0, 0.115, 0.70, target.pricePillBase);
}

export function createBatchedPricePillLabelsGeometry(): THREE.BufferGeometry {
  const geometries: THREE.BufferGeometry[] = [];
  const rotX = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
  PURCHASABLE_CELL_INDICES.forEach((cellIndex) => {
    const geom = new THREE.PlaneGeometry(1.08, 0.27);
    const uvs = getPricePillAtlasUVs(cellIndex);
    const uvAttr = geom.getAttribute('uv');
    if (uvAttr instanceof THREE.BufferAttribute) {
      uvAttr.setXY(0, uvs.uMin, uvs.vMax);
      uvAttr.setXY(1, uvs.uMax, uvs.vMax);
      uvAttr.setXY(2, uvs.uMin, uvs.vMin);
      uvAttr.setXY(3, uvs.uMax, uvs.vMin);
    }
    const matrix = new THREE.Matrix4();
    composeCellMarkerWorldMatrix(cellIndex, 0, 0.123, 0.70, matrix);
    matrix.multiply(rotX);
    geom.applyMatrix4(matrix);
    geometries.push(geom);
  });
  return mergeGeometries(geometries, false) ?? new THREE.BufferGeometry();
}

export const PRICE_PILL_LABELS_BATCHED_GEOM = createBatchedPricePillLabelsGeometry();


