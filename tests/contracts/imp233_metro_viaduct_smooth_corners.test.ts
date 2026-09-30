// [TC-233/MSS][UC-IMP233] IMP-233: Metro Viaduct Smooth Corners & Diorama Ballast Alignment Contract Suite
// Traceability: docs/plans/improvements/IMP-233-metro-curved-viaduct-smooth-corners-and-ballast-alignment_plan.md
// Domain Invariants: docs/domain/gotchas.md (Pillar V / #19, #23; Pillar VI Detroit Classical)
// 5-Facet Universal Matrix:
//   Facet 1: Continuous Spline Smoothness (TC-233.01..TC-233.04)
//   Facet 2: High-Resolution Viaduct Segmentation (TC-233.05..TC-233.08)
//   Facet 3: Radial Piers & River Pier Superstructure (TC-233.09..TC-233.11)
//   Facet 4: Ground Ballast Bed De-collision (TC-233.12..TC-233.14)
//   Facet 5: Kinematic Stations & Visual Invariants (TC-233.15..TC-233.16)

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Vector3, CatmullRomCurve3 } from 'three';
import {
  getRailroadTrackCurve,
  getRailroadTrackPerimeter,
  computeCarriageProgress,
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
import * as RailroadModule from '../../src/client/3d/diorama/diorama_railroad';

// Contract-level accessor for Task 2 exports (clean type-safe resolution before & after implementation)
interface ViaductContractExports {
  readonly VIADUCT_NUM_SEGMENTS?: number;
  readonly VIADUCT_CURVED_SEGMENTS?: readonly unknown[];
  readonly VIADUCT_PIERS?: readonly unknown[];
}

const contractExports = RailroadModule as unknown as ViaductContractExports;
const VIADUCT_NUM_SEGMENTS = contractExports.VIADUCT_NUM_SEGMENTS;
const VIADUCT_CURVED_SEGMENTS = contractExports.VIADUCT_CURVED_SEGMENTS;
const VIADUCT_PIERS = contractExports.VIADUCT_PIERS;

interface TestTreeNode {
  readonly type?: unknown;
  readonly props?: {
    readonly children?: unknown;
    readonly color?: string;
    readonly castShadow?: boolean;
    readonly receiveShadow?: boolean;
    readonly position?: readonly number[];
    readonly args?: readonly number[];
    readonly metalness?: number;
    readonly roughness?: number;
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

// Pure math helper functions outside test bodies (Atomic Test Mandate: no loops inside it())
function computeMaxAngularDelta(curve: CatmullRomCurve3, steps = 500): number {
  let maxDeg = 0;
  for (let i = 0; i < steps; i++) {
    const t1 = curve.getTangentAt(i / steps);
    const t2 = curve.getTangentAt(((i + 1) % steps) / steps);
    const deg = (t1.angleTo(t2) * 180) / Math.PI;
    if (deg > maxDeg) maxDeg = deg;
  }
  return maxDeg;
}

function computeMinDistanceToPoint(curve: CatmullRomCurve3, target: Vector3, steps = 500): number {
  let minDist = Infinity;
  for (let i = 0; i <= steps; i++) {
    const pt = curve.getPointAt(i / steps);
    const d = pt.distanceTo(target);
    if (d < minDist) minDist = d;
  }
  return minDist;
}

function findElevatedParapets(tree: TestTreeNode | null): TestTreeNode[] {
  return findNodes(
    tree,
    (n) =>
      (getNodeType(n) === 'mesh' || getNodeType(n) === 'Mesh') &&
      findNodes(n, (c) => getNodeType(c).toLowerCase().includes('material')).some(
        (m) => m?.props?.color === '#94A3B8'
      )
  );
}

function findRailMeshes(tree: TestTreeNode | null): TestTreeNode[] {
  return findNodes(
    tree,
    (n) =>
      (getNodeType(n) === 'mesh' || getNodeType(n) === 'Mesh') &&
      findNodes(n, (c) => getNodeType(c).toLowerCase().includes('material')).some(
        (m) => m?.props?.color === '#E2E8F0' && Number(m?.props?.metalness ?? 0) >= 0.8
      )
  );
}

function findSleeperMeshes(tree: TestTreeNode | null): TestTreeNode[] {
  return findNodes(
    tree,
    (n) =>
      (getNodeType(n) === 'mesh' || getNodeType(n) === 'Mesh') &&
      findNodes(n, (c) => getNodeType(c).toLowerCase().includes('material')).some(
        (m) => m?.props?.color === '#451A03'
      )
  );
}

function findPierMeshes(tree: TestTreeNode | null): TestTreeNode[] {
  return findNodes(
    tree,
    (n) =>
      (getNodeType(n) === 'mesh' || getNodeType(n) === 'Mesh') &&
      findNodes(n, (c) => getNodeType(c).toLowerCase().includes('cylindergeometry')).length > 0 &&
      findNodes(n, (c) => getNodeType(c).toLowerCase().includes('material')).some(
        (m) => m?.props?.color === '#CBD5E1'
      )
  );
}

function findBallastSlabs(tree: TestTreeNode | null): TestTreeNode[] {
  return findNodes(
    tree,
    (n) =>
      (getNodeType(n) === 'mesh' || getNodeType(n) === 'Mesh') &&
      findNodes(n, (c) => getNodeType(c).toLowerCase().includes('material')).some(
        (m) => m?.props?.color === '#475569'
      )
  );
}

function computeMaxBallastLength(tree: TestTreeNode | null): number {
  const slabs = findBallastSlabs(tree);
  let maxLen = 0;
  for (const slab of slabs) {
    const geom = findNodes(slab, (c) => {
      const type = getNodeType(c).toLowerCase();
      return type.includes('boxgeometry') || type.includes('safeboxgeometry');
    })[0];
    const args = geom?.props?.args ?? [];
    const len = Math.max(Number(args[0] ?? 0), Number(args[2] ?? 0));
    if (len > maxLen) maxLen = len;
  }
  return maxLen;
}

function findCatenaryCantilevers(tree: TestTreeNode | null): TestTreeNode[] {
  return findNodes(
    tree,
    (n) =>
      (getNodeType(n) === 'mesh' || getNodeType(n) === 'Mesh') &&
      Number(n.props?.position?.[1] ?? 0) >= 0.15 &&
      Number(n.props?.position?.[1] ?? 0) <= 0.25 &&
      findNodes(n, (c) => getNodeType(c).toLowerCase().includes('material')).some(
        (m) => m?.props?.color === '#64748B'
      )
  );
}

function checkAnyCastShadowInInfrastructure(
  ballastTree: TestTreeNode | null,
  railroadTree: TestTreeNode | null
): boolean {
  const infraMeshes = [
    ...findBallastSlabs(ballastTree),
    ...findElevatedParapets(ballastTree),
    ...findPierMeshes(ballastTree),
    ...findSleeperMeshes(railroadTree),
    ...findRailMeshes(railroadTree),
  ];
  return infraMeshes.some((m) => Boolean(m.props?.castShadow));
}

function getCarriageStationBounds(progress: number): { minX: number; maxX: number } {
  const curve = getRailroadTrackCurve();
  const L = getRailroadTrackPerimeter();
  const leadPos = curve.getPointAt(progress);
  const c1Pos = curve.getPointAt(computeCarriageProgress(progress, TRAIN_CARRIAGE_OFFSETS[1], L));
  const c2Pos = curve.getPointAt(computeCarriageProgress(progress, TRAIN_CARRIAGE_OFFSETS[2], L));
  return {
    minX: Math.min(leadPos.x, c1Pos.x, c2Pos.x),
    maxX: Math.max(leadPos.x, c1Pos.x, c2Pos.x),
  };
}

describe('[TC-233/MSS][UC-IMP233] Metro Viaduct Smooth Corners & Diorama Ballast Alignment Contract Suite', () => {
  let originalConsoleError: typeof console.error;
  let railroadMarkup = '';
  let ballastMarkup = '';
  let waterfrontMarkup = '';
  let landmarkMarkup = '';

  let ballastTree: TestTreeNode | null = null;
  let railroadTree: TestTreeNode | null = null;

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

    ballastTree = captureRenderedTree(DioramaBallastBed);
    railroadTree = captureRenderedTree(DioramaModelRailroad);
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  // =========================================================================
  // FACET 1: CONTINUOUS SPLINE SMOOTHNESS (TC-233.01..TC-233.04)
  // =========================================================================
  describe('Facet 1: Continuous Spline Smoothness (TC-233.01..TC-233.04)', () => {
    it('[TC-233.01/MSS][UC-IMP233][Facet1-Spline] getRailroadTrackCurve() áp dụng thuật toán centripetal với max angular delta giữa 500 bước rời rạc <= 6.0°', () => {
      const curve = getRailroadTrackCurve();
      const maxAngularDelta = computeMaxAngularDelta(curve, 500);
      expect(curve.curveType).toBe('centripetal');
      expect(maxAngularDelta).toBeLessThanOrEqual(6.0);
    });

    it('[TC-233.02/MSS][UC-IMP233][Facet1-Spline] Chu vi spline L nằm trong giới hạn chuẩn [50.0m, 58.0m]', () => {
      const L = getRailroadTrackPerimeter();
      expect(L).toBeGreaterThanOrEqual(50.0);
      expect(L).toBeLessThanOrEqual(58.0);
    });

    it('[TC-233.03/MSS][UC-IMP233][Facet1-Spline] Tuyến đường sắt duy trì khoảng đệm an toàn tới Nhà Thờ Đức Bà (-4.5, 2.9) >= 1.5m', () => {
      const curve = getRailroadTrackCurve();
      const notreDame = new Vector3(-4.5, 0.45, 2.9);
      const minDist = computeMinDistanceToPoint(curve, notreDame, 500);
      expect(minDist).toBeGreaterThanOrEqual(1.5);
    });

    it('[TC-233.04/MSS][UC-IMP233][Facet1-Spline] Tĩnh không thông thuyền của ray Metro vượt sông Sài Gòn tại u = 0.06 đạt >= 0.45m so với mặt nước', () => {
      const curve = getRailroadTrackCurve();
      const pt = curve.getPointAt(0.06);
      const waterElevation = -0.035;
      expect(pt.y - waterElevation).toBeGreaterThanOrEqual(0.45);
    });
  });

  // =========================================================================
  // FACET 2: HIGH-RESOLUTION VIADUCT SEGMENTATION (TC-233.05..TC-233.08)
  // =========================================================================
  describe('Facet 2: High-Resolution Viaduct Segmentation (TC-233.05..TC-233.08)', () => {
    it('[TC-233.05/MSS][UC-IMP233][Facet2-Segmentation] VIADUCT_NUM_SEGMENTS đạt giá trị 96 và VIADUCT_CURVED_SEGMENTS.length === 96', () => {
      expect(VIADUCT_NUM_SEGMENTS).toBe(96);
      expect(VIADUCT_CURVED_SEGMENTS?.length).toBe(96);
    });

    it('[TC-233.06/MSS][UC-IMP233][Facet2-Segmentation] Lan can dầm U-Girder (#94A3B8) kết xuất ít nhất 192 dải lan can (96 cặp) tại cao độ Y >= 0.44m', () => {
      const elevatedParapets = findElevatedParapets(ballastTree);
      expect(elevatedParapets.length).toBeGreaterThanOrEqual(192);
      expect(elevatedParapets[0]?.props?.position?.[1]).toBeGreaterThanOrEqual(0.44);
    });

    it('[TC-233.07/MSS][UC-IMP233][Facet2-Segmentation] Dải ray đôi kim loại (#E2E8F0) kết xuất ít nhất 192 đoạn ray (96 cặp) bám sát spline', () => {
      const railMeshes = findRailMeshes(railroadTree);
      expect(railMeshes.length).toBeGreaterThanOrEqual(192);
      expect(railMeshes[0]?.props?.position?.[1]).toBeGreaterThanOrEqual(0.44);
    });

    it('[TC-233.08/MSS][UC-IMP233][Facet2-Segmentation] Móng tà vẹt (#451A03) kết xuất ít nhất 96 phân đoạn ôm sát spline', () => {
      const sleeperMeshes = findSleeperMeshes(railroadTree);
      expect(sleeperMeshes.length).toBeGreaterThanOrEqual(96);
      expect(sleeperMeshes[0]?.props?.position?.[1]).toBeGreaterThanOrEqual(0.44);
    });
  });

  // =========================================================================
  // FACET 3: RADIAL PIERS & RIVER PIER SUPERSTRUCTURE (TC-233.09..TC-233.11)
  // =========================================================================
  describe('Facet 3: Radial Piers & River Pier Superstructure (TC-233.09..TC-233.11)', () => {
    it('[TC-233.09/MSS][UC-IMP233][Facet3-Piers] VIADUCT_PIERS kết xuất ít nhất 12 trụ cầu bê tông tròn (#CBD5E1) vươn tới Y >= 0.40m', () => {
      const pierNodes = findPierMeshes(ballastTree);
      expect(pierNodes.length).toBeGreaterThanOrEqual(12);
      const hasTallPier = pierNodes.some((p) => {
        const y = Number(p.props?.position?.[1] ?? 0);
        const geom = findNodes(p, (c) => getNodeType(c).toLowerCase().includes('cylindergeometry'))[0];
        const h = Number(geom?.props?.args?.[2] ?? 0);
        return (y + h / 2) >= 0.40;
      });
      expect(hasTallPier).toBe(true);
    });

    it('[TC-233.10/MSS][UC-IMP233][Facet3-Piers] Trụ cầu nhịp vượt sông cắm sâu xuống lòng sông với chiều cao trụ >= 0.45m', () => {
      const pierNodes = findPierMeshes(ballastTree);
      const riverPier = pierNodes.find((p) => {
        const geom = findNodes(p, (c) => getNodeType(c).toLowerCase().includes('cylindergeometry'))[0];
        return Number(geom?.props?.args?.[2] ?? 0) >= 0.45;
      });
      expect(riverPier).toBeDefined();
      const geom = findNodes(riverPier, (c) => getNodeType(c).toLowerCase().includes('cylindergeometry'))[0];
      expect(Number(geom?.props?.args?.[2] ?? 0)).toBeGreaterThanOrEqual(0.45);
    });

    it('[TC-233.11/MSS][UC-IMP233][Facet3-Piers] Cột cần tiếp điện dọc hành lang (8 cột) có thanh vươn nằm trong dải [0.15m, 0.25m]', () => {
      const cantilevers = findCatenaryCantilevers(ballastTree);
      expect(cantilevers.length).toBe(8);
      expect(Number(cantilevers[0]?.props?.position?.[1] ?? 0)).toBeGreaterThanOrEqual(0.15);
      expect(Number(cantilevers[0]?.props?.position?.[1] ?? 0)).toBeLessThanOrEqual(0.25);
    });
  });

  // =========================================================================
  // FACET 4: GROUND BALLAST BED DE-COLLISION (TC-233.12..TC-233.14)
  // =========================================================================
  describe('Facet 4: Ground Ballast Bed De-collision (TC-233.12..TC-233.14)', () => {
    it('[TC-233.12/MSS][UC-IMP233][Facet4-Ballast] 4 thanh đá ba-lát mặt đất (#475569) trong DioramaBallastBed được thu gọn chiều dài <= 11.5m', () => {
      const ballastSlabs = findBallastSlabs(ballastTree);
      const maxBallastLength = computeMaxBallastLength(ballastTree);
      expect(ballastSlabs.length).toBe(4);
      expect(maxBallastLength).toBeLessThanOrEqual(11.5);
    });

    it('[TC-233.13/MSS][UC-IMP233][Facet4-Ballast] Cửa sổ 800 ký tự đầu tiên của DioramaBallastBed bảo toàn màu #475569, bề rộng [0.30, 0.60], cao độ Y trong [0.015, 0.035]', () => {
      const idx = ballastMarkup.indexOf('data-testid="diorama-railroad-ballast"');
      const window800 = ballastMarkup.slice(idx, idx + 800);
      expect(window800).toContain('#475569');

      const boxMatches = Array.from(window800.matchAll(/args="([^"]+)"/g));
      const hasValidWidth = boxMatches.some((m) => {
        const dims = (m[1] ?? '').split(',').map(Number);
        return dims.some((d) => !Number.isNaN(d) && d >= 0.30 && d <= 0.60);
      });
      expect(hasValidWidth).toBe(true);

      const posMatches = Array.from(window800.matchAll(/position="([^"]+)"/g));
      const hasValidElevation = posMatches.some((m) => {
        const y = Number((m[1] ?? '').split(',')[1]);
        return !Number.isNaN(y) && y >= 0.015 && y <= 0.035;
      });
      expect(hasValidElevation).toBe(true);
    });

    it('[TC-233.14/MSS][UC-IMP233][Facet4-Ballast] Toàn bộ mesh dầm, ray, tà vẹt, trụ cầu và đá ba-lát đều tắt castShadow={false} (bảo toàn ngân sách GPU IMP-142)', () => {
      const anyCastShadow = checkAnyCastShadowInInfrastructure(ballastTree, railroadTree);
      expect(anyCastShadow).toBe(false);
    });
  });

  // =========================================================================
  // FACET 5: KINEMATIC STATIONS & VISUAL INVARIANTS (TC-233.15..TC-233.16)
  // =========================================================================
  describe('Facet 5: Kinematic Stations & Visual Invariants (TC-233.15..TC-233.16)', () => {
    it('[TC-233.15/MSS][UC-IMP233][Facet5-Kinematics] Ga Waterfront đỗ tại progress 0.12 (ke ga [-2.7, -0.5]) và Ga Landmark Bắc đỗ tại progress 0.62 (ke ga [0.5, 2.7])', () => {
      const wfBounds = getCarriageStationBounds(SOUTH_STATION_PROGRESS);
      const lmBounds = getCarriageStationBounds(NORTH_STATION_PROGRESS);

      expect(wfBounds.minX).toBeGreaterThanOrEqual(-2.7);
      expect(wfBounds.maxX).toBeLessThanOrEqual(-0.5);
      expect(lmBounds.minX).toBeGreaterThanOrEqual(0.5);
      expect(lmBounds.maxX).toBeLessThanOrEqual(2.7);
    });

    it('[TC-233.16/MSS][UC-IMP233][Facet5-Kinematics] Bảo tồn 100% các data-testid: diorama-railroad-ballast, diorama-model-railroad, diorama-waterfront-station, diorama-landmark-north-station', () => {
      expect(ballastMarkup).toContain('data-testid="diorama-railroad-ballast"');
      expect(railroadMarkup).toContain('data-testid="diorama-model-railroad"');
      expect(waterfrontMarkup).toContain('data-testid="diorama-waterfront-station"');
      expect(landmarkMarkup).toContain('data-testid="diorama-landmark-north-station"');
    });
  });
});
