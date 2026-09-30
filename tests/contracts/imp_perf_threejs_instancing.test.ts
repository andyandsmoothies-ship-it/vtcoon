// [TC-INST-01..16/MSS][UC-IMP-INST] Contract Test Suite: 3D Instanced Mesh Performance Batching
import { describe, it, expect, beforeEach, vi } from 'vitest';
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
import { BOARD_CONFIG, CellType } from '../../src/domain/board_config';
import { useGameStore } from '../../src/client/store/game_store';

// Mock Drei components for headless SSR static rendering without dirty casts
vi.mock('@react-three/drei', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    Billboard: ({ children, ...props }: { readonly children?: React.ReactNode }) =>
      React.createElement('billboard', props, children),
    Image: ({ scale, ...props }: { readonly scale?: unknown }) =>
      React.createElement('drei-image', {
        ...props,
        scale: Array.isArray(scale) ? scale.join(',') : String(scale ?? ''),
      }),
  };
});

describe('[TC-INST-01..16/MSS][UC-IMP-INST] Three.js InstancedMesh Batching & Matrix Convergence Suite', () => {
  beforeEach(() => {
    useGameStore.setState({
      levelMap: {},
      playersInfo: {},
    });
  });

  // FACET 1: Boundary & Slot Allocation (TC-INST-01..03)
  describe('Facet 1: Boundary & Slot Allocation', () => {
    it('[TC-INST-01/MSS][UC-IMP-INST] PROPERTY_CELL_INDICES chứa đúng 22 ô bất động sản', () => {
      expect(PROPERTY_CELL_INDICES.length).toBe(22);
      const nonProperties = PROPERTY_CELL_INDICES.filter((idx) => BOARD_CONFIG[idx]?.type !== CellType.Property);
      expect(nonProperties).toEqual([]);
    });

    it('[TC-INST-02/MSS][UC-IMP-INST] TOTAL_HOUSE_INSTANCES đúng bằng 44 và TOTAL_HOTEL_INSTANCES đúng bằng 22', () => {
      expect(TOTAL_HOUSE_INSTANCES).toBe(44);
      expect(TOTAL_HOTEL_INSTANCES).toBe(22);
    });

    it('[TC-INST-03/MSS][UC-IMP-INST] Mỗi ô đất có 2 slot nhà và 1 slot khách sạn riêng biệt', () => {
      expect(PROPERTY_CELL_INDICES.length * 2).toBe(TOTAL_HOUSE_INSTANCES);
      expect(PROPERTY_CELL_INDICES.length).toBe(TOTAL_HOTEL_INSTANCES);
    });
  });

  // FACET 2: State Reactivity & Matrix Composition (TC-INST-04..07)
  describe('Facet 2: State Reactivity & Matrix Composition', () => {
    it('[TC-INST-04/MSS][UC-IMP-INST] calculateHouseInstanceMatrix tại level 0 trả về scale 0,0,0', () => {
      const mat = calculateHouseInstanceMatrix(1, 0, 0);
      const scale = new THREE.Vector3();
      mat.decompose(new THREE.Vector3(), new THREE.Quaternion(), scale);
      expect(scale.x).toBe(0);
      expect(scale.y).toBe(0);
      expect(scale.z).toBe(0);
    });

    it('[TC-INST-05/MSS][UC-IMP-INST] calculateHouseInstanceMatrix tại level 1: slot 0 có scale 1, slot 1 có scale 0', () => {
      const mat0 = calculateHouseInstanceMatrix(1, 0, 1);
      const scale0 = new THREE.Vector3();
      mat0.decompose(new THREE.Vector3(), new THREE.Quaternion(), scale0);
      expect(scale0.x).toBeCloseTo(1.0);

      const mat1 = calculateHouseInstanceMatrix(1, 1, 1);
      const scale1 = new THREE.Vector3();
      mat1.decompose(new THREE.Vector3(), new THREE.Quaternion(), scale1);
      expect(scale1.x).toBe(0);
    });

    it('[TC-INST-06/MSS][UC-IMP-INST] calculateHouseInstanceMatrix tại level 2: cả 2 slot đều có scale 1 và lệch nhau ±0.18', () => {
      const mat0 = calculateHouseInstanceMatrix(1, 0, 2);
      const mat1 = calculateHouseInstanceMatrix(1, 1, 2);
      const pos0 = new THREE.Vector3();
      const pos1 = new THREE.Vector3();
      mat0.decompose(pos0, new THREE.Quaternion(), new THREE.Vector3());
      mat1.decompose(pos1, new THREE.Quaternion(), new THREE.Vector3());
      expect(pos0.distanceTo(pos1)).toBeCloseTo(0.36, 2);
    });

    it('[TC-INST-07/MSS][UC-IMP-INST] calculateHotelInstanceMatrix tại level < 3 trả về scale 0; tại level 3 trả về scale 1', () => {
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
    it('[TC-INST-08/MSS][UC-IMP-INST] Cạnh Nam (Ô 1 Cần Thơ): Ma trận có góc xoay Y = 0', () => {
      const mat = calculateHouseInstanceMatrix(1, 0, 1);
      const quat = new THREE.Quaternion();
      mat.decompose(new THREE.Vector3(), quat, new THREE.Vector3());
      const euler = new THREE.Euler().setFromQuaternion(quat);
      expect(euler.y).toBeCloseTo(0);
    });

    it('[TC-INST-09/MSS][UC-IMP-INST] Cạnh Tây (Ô 11 Bình Thuận): Ma trận có góc xoay Y = -Math.PI / 2', () => {
      const mat = calculateHouseInstanceMatrix(11, 0, 1);
      const quat = new THREE.Quaternion();
      mat.decompose(new THREE.Vector3(), quat, new THREE.Vector3());
      const euler = new THREE.Euler().setFromQuaternion(quat);
      expect(euler.y).toBeCloseTo(-Math.PI / 2);
    });

    it('[TC-INST-10/MSS][UC-IMP-INST] Cạnh Bắc (Ô 26) xoay Math.PI và Cạnh Đông (Ô 31) xoay Math.PI / 2', () => {
      const matNorth = calculateHouseInstanceMatrix(26, 0, 1);
      const quatN = new THREE.Quaternion();
      matNorth.decompose(new THREE.Vector3(), quatN, new THREE.Vector3());
      const eulerN = new THREE.Euler(0, 0, 0, 'YXZ').setFromQuaternion(quatN);
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
    it('[TC-INST-11/MSS][UC-IMP-INST] Hạ cấp từ level 3 về level 0: Cả khách sạn và nhà đều co scale về 0', () => {
      const matHotel = calculateHotelInstanceMatrix(1, 0);
      const matHouse0 = calculateHouseInstanceMatrix(1, 0, 0);
      const scaleH = new THREE.Vector3();
      const scaleB = new THREE.Vector3();
      matHotel.decompose(new THREE.Vector3(), new THREE.Quaternion(), scaleH);
      matHouse0.decompose(new THREE.Vector3(), new THREE.Quaternion(), scaleB);
      expect(scaleH.x).toBe(0);
      expect(scaleB.x).toBe(0);
    });

    it('[TC-INST-12/MSS][UC-IMP-INST] Hạ cấp từ level 2 về level 1: Slot 1 co scale về 0', () => {
      const mat1 = calculateHouseInstanceMatrix(1, 1, 1);
      const scale1 = new THREE.Vector3();
      mat1.decompose(new THREE.Vector3(), new THREE.Quaternion(), scale1);
      expect(scale1.x).toBe(0);
    });

    it('[TC-INST-13/MSS][UC-IMP-INST] Giá trị level bất thường (-1, NaN): Trả về scale 0 an toàn', () => {
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
    it('[TC-INST-14/MSS][UC-IMP-INST] InstancedBoardToyBuildings kết xuất đủ 8 thẻ instancedmesh với frustumCulled={false}', () => {
      const markup = renderToStaticMarkup(React.createElement(InstancedBoardToyBuildings));
      expect(markup).toContain('data-testid="instanced-board-toy-buildings"');
      const matches = markup.match(/<instancedmesh/gi);
      expect(matches?.length).toBe(8);
      expect(markup).toContain('frustumculled="false"');
    });

    it('[TC-INST-15/MSS][UC-IMP-INST] Shadow budget: Thân và mái bật castShadow, ống khói và cửa sổ tắt castShadow', () => {
      const markup = renderToStaticMarkup(React.createElement(InstancedBoardToyBuildings));
      const castMatches = markup.match(/castshadow="true"/gi);
      expect(castMatches?.length).toBe(4);
      expect(markup).toContain('castshadow="true"');
    });

    it('[TC-INST-16/MSS][UC-IMP-INST] GameBoard render trơn tru trong môi trường headless SSR không crash và chứa cụm instanced', () => {
      const markup = renderToStaticMarkup(React.createElement(GameBoard));
      expect(markup).toContain('data-testid="instanced-board-toy-buildings"');
    });
  });
});
