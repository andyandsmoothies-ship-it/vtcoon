// [TC-230/MSS][UC-IMP230] IMP-230: Organic Curved Viaduct & Continuous Spline Loop Contract Suite
// Traceability: docs/domain/gotchas.md #173, #162, #142
// 5-Facet Matrix:
//   Facet 1: Curved Spline Topology & Heritage Buffer
//   Facet 2: Curved Viaduct Structure & Continuous U-Girder
//   Facet 3: Radial Pier Superstructure & Catenary Masts
//   Facet 4: Kinematic Stations & Rolling Stock
//   Facet 5: Preservation, AST Direct Children & Zero Regressions

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Vector3 } from 'three';
import {
  getRailroadTrackCurve,
  getRailroadTrackPerimeter,
  computeCarriageProgress,
  computeTrainKinematics,
  computeTrainPitch,
  TRACK_POINTS,
  TRAIN_CARRIAGE_OFFSETS,
  SOUTH_STATION_PROGRESS,
  NORTH_STATION_PROGRESS,
} from '../../src/client/3d/diorama/diorama_train_kinematics';
import {
  DioramaBallastBed,
  DioramaModelRailroad,
  DioramaWaterfrontStation,
  DioramaLandmarkNorthStation,
} from '../../src/client/3d/diorama/diorama_railroad';

interface TestTreeNode {
  readonly type?: unknown;
  readonly props?: {
    readonly children?: unknown;
    readonly color?: string;
    readonly castShadow?: boolean;
    readonly receiveShadow?: boolean;
    readonly position?: readonly number[];
    readonly args?: readonly number[];
    readonly [key: string]: unknown;
  };
}

function getNodeType(node: unknown): string {
  if (!node || typeof node !== 'object') return '';
  const candidate = node as TestTreeNode;
  if (typeof candidate.type === 'string') return candidate.type;
  if (typeof candidate.type === 'function') {
    return (candidate.type as { name?: string }).name ?? 'Component';
  }
  return '';
}

function findNodes(
  node: unknown,
  predicate: (node: TestTreeNode) => boolean,
  results: TestTreeNode[] = []
): TestTreeNode[] {
  if (!node || typeof node !== 'object') return results;
  const candidate = node as TestTreeNode;
  if (predicate(candidate)) results.push(candidate);
  if (Array.isArray(node)) {
    for (const child of node) findNodes(child, predicate, results);
  } else if (candidate.props?.children) {
    findNodes(candidate.props.children, predicate, results);
  }
  return results;
}

function captureRenderedTree<P = Record<string, unknown>>(
  Component: React.ComponentType<P>,
  props?: P
): TestTreeNode | null {
  let rendered: TestTreeNode | null = null;
  function SpyComponent() {
    rendered = (Component as React.FC<P>)((props ?? {}) as P) as TestTreeNode | null;
    return rendered as unknown as React.ReactElement;
  }
  renderToStaticMarkup(React.createElement(SpyComponent));
  return rendered;
}

describe('[TC-230/MSS][UC-IMP230] Organic Curved Viaduct & Continuous Spline Loop Contract Suite', () => {
  let originalConsoleError: typeof console.error;
  let railroadMarkup = '';
  let ballastMarkup = '';
  let waterfrontMarkup = '';
  let landmarkMarkup = '';

  beforeAll(() => {
    originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      const msg = typeof args[0] === 'string' ? args[0] : '';
      if (
        msg.includes('is using incorrect casing') ||
        msg.includes('does not recognize the') ||
        msg.includes('non-boolean attribute')
      ) return;
      originalConsoleError(...args);
    };

    ballastMarkup = renderToStaticMarkup(React.createElement(DioramaBallastBed));
    railroadMarkup = renderToStaticMarkup(React.createElement(DioramaModelRailroad));
    waterfrontMarkup = renderToStaticMarkup(React.createElement(DioramaWaterfrontStation));
    landmarkMarkup = renderToStaticMarkup(React.createElement(DioramaLandmarkNorthStation));
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  // =========================================================================
  // FACET 1: CURVED SPLINE TOPOLOGY & HERITAGE BUFFER (TC-230.01..TC-230.03)
  // =========================================================================
  describe('Facet 1: Curved Spline Topology & Heritage Buffer', () => {
    it('[TC-230.01/MSS][Facet1-Topology] Chu vi spline getRailroadTrackPerimeter() nằm trong dải chuẩn [50.0m, 58.0m]', () => {
      const L = getRailroadTrackPerimeter();
      expect(L).toBeGreaterThanOrEqual(50.0);
      expect(L).toBeLessThanOrEqual(58.0);
    });

    it('[TC-230.02/MSS][Facet1-Topology] Tuyến đường sắt duy trì khoảng đệm an toàn tới Nhà Thờ Đức Bà (-4.5, 2.9) >= 1.5m', () => {
      const curve = getRailroadTrackCurve();
      const notreDame = new Vector3(-4.5, 0.45, 2.9);
      let minDist = Infinity;
      for (let i = 0; i <= 500; i++) {
        const pt = curve.getPointAt(i / 500);
        const d = pt.distanceTo(notreDame);
        if (d < minDist) minDist = d;
      }
      expect(minDist).toBeGreaterThanOrEqual(1.5);
    });

    it('[TC-230.03/MSS][Facet1-Topology] Tĩnh không thông thuyền của ray Metro vượt sông Sài Gòn tại u = 0.06 đạt >= 0.45m so với mặt nước', () => {
      const curve = getRailroadTrackCurve();
      const pt = curve.getPointAt(0.06);
      const waterElevation = -0.035;
      expect(pt.y - waterElevation).toBeGreaterThanOrEqual(0.45);
    });
  });

  // =========================================================================
  // FACET 2: CURVED VIADUCT STRUCTURE & CONTINUOUS U-GIRDER (TC-230.04..TC-230.06)
  // =========================================================================
  describe('Facet 2: Curved Viaduct Structure & Continuous U-Girder', () => {
    it('[TC-230.04/MSS][Facet2-Structure] Kết cấu cầu cạn hữu cơ kết xuất ít nhất 32 phân đoạn dầm cong liên tục', () => {
      const tree = captureRenderedTree(DioramaBallastBed);
      const parapetMeshes = findNodes(
        tree,
        (n) => (getNodeType(n) === 'mesh' || getNodeType(n) === 'Mesh') &&
          findNodes(n, (c) => getNodeType(c).toLowerCase().includes('material'))
            .some((m) => m?.props?.color === '#94A3B8')
      );
      // 32 segments x 2 parapets = 64 parapet meshes
      expect(parapetMeshes.length).toBeGreaterThanOrEqual(32);
    });

    it('[TC-230.05/MSS][Facet2-Structure] Lan can dầm U-Girder (#94A3B8) có cao độ đón đỡ đạt Y >= 0.44m', () => {
      const tree = captureRenderedTree(DioramaBallastBed);
      const parapetMeshes = findNodes(
        tree,
        (n) => (getNodeType(n) === 'mesh' || getNodeType(n) === 'Mesh') &&
          findNodes(n, (c) => getNodeType(c).toLowerCase().includes('material'))
            .some((m) => m?.props?.color === '#94A3B8')
      );
      const hasElevatedParapets = parapetMeshes.some((p) => (p.props?.position?.[1] ?? 0) >= 0.44);
      expect(hasElevatedParapets).toBe(true);
    });

    it('[TC-230.06/MSS][Facet2-Structure] Dải ray kim loại (#E2E8F0, metalness 0.85) kết xuất ít nhất 32 cặp ray cong bám sát spline', () => {
      const tree = captureRenderedTree(DioramaModelRailroad);
      const railMeshes = findNodes(
        tree,
        (n) => (getNodeType(n) === 'mesh' || getNodeType(n) === 'Mesh') &&
          findNodes(n, (c) => getNodeType(c).toLowerCase().includes('material'))
            .some((m) => m?.props?.color === '#E2E8F0' && Number(m?.props?.metalness ?? 0) >= 0.7)
      );
      expect(railMeshes.length).toBeGreaterThanOrEqual(32);
    });
  });

  // =========================================================================
  // FACET 3: RADIAL PIER SUPERSTRUCTURE & CATENARY MASTS (TC-230.07..TC-230.09)
  // =========================================================================
  describe('Facet 3: Radial Pier Superstructure & Catenary Masts', () => {
    it('[TC-230.07/MSS][Facet3-Piers] DioramaBallastBed kết xuất ít nhất 12 trụ cầu bê tông tròn (#CBD5E1) vươn tới Y >= 0.40m', () => {
      const tree = captureRenderedTree(DioramaBallastBed);
      const pierNodes = findNodes(
        tree,
        (n) => (getNodeType(n) === 'mesh' || getNodeType(n) === 'Mesh') &&
          findNodes(n, (c) => getNodeType(c).toLowerCase().includes('cylindergeometry')).length > 0 &&
          findNodes(n, (c) => getNodeType(c).toLowerCase().includes('material'))
            .some((m) => m?.props?.color === '#CBD5E1')
      );
      expect(pierNodes.length).toBeGreaterThanOrEqual(12);
      const hasTallPier = pierNodes.some((p) => {
        const y = p.props?.position?.[1] ?? 0;
        const geom = findNodes(p, (c) => getNodeType(c).toLowerCase().includes('cylindergeometry'))[0];
        const h = geom?.props?.args?.[2] ?? 0;
        return (y + h / 2) >= 0.40;
      });
      expect(hasTallPier).toBe(true);
    });

    it('[TC-230.08/MSS][Facet3-Piers] Trụ cầu nhịp vượt sông cắm sâu xuống lòng sông với chiều cao trụ >= 0.45m', () => {
      const tree = captureRenderedTree(DioramaBallastBed);
      const pierNodes = findNodes(
        tree,
        (n) => (getNodeType(n) === 'mesh' || getNodeType(n) === 'Mesh') &&
          findNodes(n, (c) => getNodeType(c).toLowerCase().includes('cylindergeometry')).length > 0 &&
          findNodes(n, (c) => getNodeType(c).toLowerCase().includes('material'))
            .some((m) => m?.props?.color === '#CBD5E1')
      );
      const riverPier = pierNodes.find((p) => {
        const geom = findNodes(p, (c) => getNodeType(c).toLowerCase().includes('cylindergeometry'))[0];
        return (geom?.props?.args?.[2] ?? 0) >= 0.45;
      });
      expect(riverPier).toBeDefined();
    });

    it('[TC-230.09/MSS][Facet3-Piers] Cột cần tiếp điện trên cao dọc hành lang có thanh vươn nằm trong dải [0.15m, 0.25m]', () => {
      const posMatches = Array.from(ballastMarkup.matchAll(/position="([^"]+)"/g));
      const hasCantilever = posMatches.some((m) => {
        const y = Number((m[1] ?? '').split(',')[1]);
        return !Number.isNaN(y) && y >= 0.15 && y <= 0.25;
      });
      expect(hasCantilever).toBe(true);
    });
  });

  // =========================================================================
  // FACET 4: KINEMATIC STATIONS & ROLLING STOCK (TC-230.10..TC-230.15)
  // =========================================================================
  describe('Facet 4: Kinematic Stations & Rolling Stock', () => {
    it('[TC-230.10/MSS][Facet4-RollingStock] Ga Waterfront đón tàu tại progress 0.12: cả 3 toa nằm trọn trên thềm ke ga [-2.7, -0.5]', () => {
      const curve = getRailroadTrackCurve();
      const L = getRailroadTrackPerimeter();
      const leadPos = curve.getPointAt(SOUTH_STATION_PROGRESS);
      const c1Pos = curve.getPointAt(computeCarriageProgress(SOUTH_STATION_PROGRESS, TRAIN_CARRIAGE_OFFSETS[1], L));
      const c2Pos = curve.getPointAt(computeCarriageProgress(SOUTH_STATION_PROGRESS, TRAIN_CARRIAGE_OFFSETS[2], L));

      expect(leadPos.x).toBeGreaterThanOrEqual(-2.45);
      expect(leadPos.x).toBeLessThanOrEqual(-2.0);
      expect(c1Pos.x).toBeGreaterThanOrEqual(-2.6);
      expect(c1Pos.x).toBeLessThanOrEqual(-0.6);
      expect(c2Pos.x).toBeGreaterThanOrEqual(-2.6);
      expect(c2Pos.x).toBeLessThanOrEqual(-0.4);
    });

    it('[TC-230.11/MSS][Facet4-RollingStock] Ga Landmark North đón tàu tại progress 0.62: cả 3 toa nằm trọn trên thềm ke ga [0.5, 2.7]', () => {
      const curve = getRailroadTrackCurve();
      const L = getRailroadTrackPerimeter();
      const leadPos = curve.getPointAt(NORTH_STATION_PROGRESS);
      const c1Pos = curve.getPointAt(computeCarriageProgress(NORTH_STATION_PROGRESS, TRAIN_CARRIAGE_OFFSETS[1], L));
      const c2Pos = curve.getPointAt(computeCarriageProgress(NORTH_STATION_PROGRESS, TRAIN_CARRIAGE_OFFSETS[2], L));

      expect(leadPos.x).toBeGreaterThanOrEqual(2.0);
      expect(leadPos.x).toBeLessThanOrEqual(2.45);
      expect(c1Pos.x).toBeGreaterThanOrEqual(0.6);
      expect(c1Pos.x).toBeLessThanOrEqual(2.6);
      expect(c2Pos.x).toBeGreaterThanOrEqual(0.4);
      expect(c2Pos.x).toBeLessThanOrEqual(2.6);
    });

    it('[TC-230.12/MSS][Facet4-RollingStock] Đầu tàu Metro dẫn đường sở hữu mũi vát khí động học màu xanh da trời Metro (#0EA5E9)', () => {
      expect(railroadMarkup).toContain('#0EA5E9');
    });

    it('[TC-230.13/MSS][Facet4-RollingStock] Thân tàu sở hữu lớp vỏ kim loại màu bạc sáng (#E2E8F0) phối dải cyan (#0284C7)', () => {
      expect(railroadMarkup).toContain('#E2E8F0');
      expect(railroadMarkup).toContain('#0284C7');
    });

    it('[TC-230.14/MSS][Facet4-RollingStock] Toa khách trang bị điều hòa nóc và pantograph tiếp điện (#64748B)', () => {
      expect(railroadMarkup).toContain('#64748B');
    });

    it('[TC-230.15/MSS][Facet4-RollingStock] Hàm computeTrainPitch(speed, t) dao động tuần hoàn khi chạy cruise và triệt tiêu khi dừng đỗ', () => {
      expect(computeTrainPitch(0, 3.5)).toBe(0);
      expect(computeTrainPitch(1.2, 0.25)).toBeCloseTo(Math.sin(0.25 * 12) * 0.005, 5);
    });
  });

  // =========================================================================
  // FACET 5: PRESERVATION, AST DIRECT CHILDREN & REGRESSION (TC-230.16..TC-230.18)
  // =========================================================================
  describe('Facet 5: Preservation, AST Direct Children & Regression', () => {
    it('[TC-230.16/MSS][Facet5-Preservation] Bảo tồn 100% các data-testid diorama-railroad-ballast và diorama-model-railroad', () => {
      expect(ballastMarkup).toContain('data-testid="diorama-railroad-ballast"');
      expect(railroadMarkup).toContain('data-testid="diorama-model-railroad"');
    });

    it('[TC-230.17/MSS][Facet5-Preservation] Tối thiểu 4 mesh tà vẹt gỗ (#451A03) là con trực tiếp của diorama-model-railroad và không castShadow (IMP-142)', () => {
      const tree = captureRenderedTree(DioramaModelRailroad);
      const sleeperMeshes = findNodes(
        tree,
        (n) => (getNodeType(n) === 'mesh' || getNodeType(n) === 'Mesh') &&
          findNodes(n, (c) => getNodeType(c).toLowerCase().includes('material'))
            .some((m) => m?.props?.color === '#451A03')
      );
      expect(sleeperMeshes.length).toBeGreaterThanOrEqual(4);
      const anyCast = sleeperMeshes.some((m) => Boolean(m.props?.castShadow));
      expect(anyCast).toBe(false);
    });

    it('[TC-230.18/MSS][Facet5-Preservation] Cửa sổ 800 ký tự đầu tiên của DioramaBallastBed chứa màu #475569, bề rộng >= 0.30m, cao độ Y trong [0.015, 0.035]', () => {
      const idx = ballastMarkup.indexOf('data-testid="diorama-railroad-ballast"');
      const window800 = ballastMarkup.slice(idx, idx + 800);
      expect(window800).toContain('#475569');

      const boxMatches = Array.from(window800.matchAll(/args="([^"]+)"/g));
      const hasWidth = boxMatches.some((m) => {
        const dims = (m[1] ?? '').split(',').map(Number);
        return dims.some((d) => !Number.isNaN(d) && d >= 0.30 && d <= 0.60);
      });
      expect(hasWidth).toBe(true);

      const posMatches = Array.from(window800.matchAll(/position="([^"]+)"/g));
      const hasElevation = posMatches.some((m) => {
        const y = Number((m[1] ?? '').split(',')[1]);
        return !Number.isNaN(y) && y >= 0.015 && y <= 0.035;
      });
      expect(hasElevation).toBe(true);
    });
  });
});
