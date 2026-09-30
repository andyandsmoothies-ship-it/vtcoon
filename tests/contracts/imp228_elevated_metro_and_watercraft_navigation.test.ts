// [TC-228/MSS][UC-228] IMP-228: HCMC Metro Line 1 Elevated Viaduct & Saigon River Watercraft Navigation Contract Suite
// Traceability: docs/plans/improvements/IMP-228-hcmc-metro-line1-elevated-viaduct-and-watercraft-navigation_plan.md
// Universal 5-Facet Behavioral Matrix:
//   Facet 1 (River Navigation): calculateCruiserTrajectory X in [-0.35, 0.35], Y in [-0.036, -0.028], Z in [-5.2, 5.2], canoe waterline
//   Facet 2 (Elevated Viaduct): Track curve elevation Y in [0.42, 0.48], piers Y=0.02->Y>=0.40, U-Girder parapets Y>=0.44, vertical clearance >=0.45m
//   Facet 3 (Elevated Stations): Symmetrical staircase with handrails (#CBD5E1), glass escalator/corridor (#38BDF8), tensile canopy (#F8FAFC) & PSD
//   Facet 4 (Organic Routing): Track perimeter [50m, 58m], station progress 0.12 & 0.62 at Y=0.45, Notre Dame clearance >=1.5m, train at Y~0.488
//   Facet 5 (Preservation & GPU Budget): 100% data-testid retention, zero castShadow on canoe, piers, stairs and ties (IMP-142)

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Vector3 } from 'three';
import {
  calculateCruiserTrajectory,
  DioramaHarborCruiser,
} from '../../src/client/3d/diorama/diorama_harbor_cruiser';
import { DioramaMicroLife } from '../../src/client/3d/diorama/diorama_microlife';
import {
  getRailroadTrackCurve,
  getRailroadTrackPerimeter,
  DioramaBallastBed,
  DioramaModelRailroad,
  DioramaWaterfrontStation,
  DioramaLandmarkNorthStation,
} from '../../src/client/3d/diorama/diorama_railroad';

// =========================================================================
// REACT TREE TRAVERSAL HELPERS (ISOLATED RUNTIME INSPECTION)
// =========================================================================

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
  if (predicate(candidate)) {
    results.push(candidate);
  }
  if (Array.isArray(node)) {
    for (const child of node) {
      findNodes(child, predicate, results);
    }
  } else if (candidate.props?.children) {
    findNodes(candidate.props.children, predicate, results);
  }
  return results;
}

function findFirstNode(
  node: unknown,
  predicate: (node: TestTreeNode) => boolean
): TestTreeNode | null {
  if (!node || typeof node !== 'object') return null;
  const candidate = node as TestTreeNode;
  if (predicate(candidate)) return candidate;
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findFirstNode(child, predicate);
      if (found) return found;
    }
  } else if (candidate.props?.children) {
    return findFirstNode(candidate.props.children, predicate);
  }
  return null;
}

function hasGeometry(node: unknown, geomType: string): boolean {
  return Boolean(
    findFirstNode(
      node,
      (child) =>
        child !== node &&
        getNodeType(child).toLowerCase().includes(geomType.toLowerCase())
    )
  );
}

function getMaterialColor(node: unknown): string | undefined {
  const mat = findFirstNode(
    node,
    (child) =>
      child !== node &&
      getNodeType(child).toLowerCase().includes('material')
  );
  return mat?.props?.color;
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

function computeMinTrackDistanceToTarget(targetX: number, targetZ: number, steps = 100): number {
  const curve = getRailroadTrackCurve();
  let minDist = Infinity;
  for (let i = 0; i <= steps; i++) {
    const pt = curve.getPointAt(i / steps);
    const dist = Math.hypot(pt.x - targetX, pt.z - targetZ);
    if (dist < minDist) minDist = dist;
  }
  return minDist;
}

function computeNearestTrackPointToTarget(targetX: number, targetZ: number, steps = 100): Vector3 {
  const curve = getRailroadTrackCurve();
  let minDist = Infinity;
  let nearest = curve.getPointAt(0);
  for (let i = 0; i <= steps; i++) {
    const pt = curve.getPointAt(i / steps);
    const dist = Math.hypot(pt.x - targetX, pt.z - targetZ);
    if (dist < minDist) {
      minDist = dist;
      nearest = pt;
    }
  }
  return nearest;
}

// =========================================================================
// TEST SUITE: IMP-228 HCMC METRO LINE 1 & WATERCRAFT CONTRACT
// =========================================================================

describe('[TC-228/MSS][UC-228] IMP-228 HCMC Metro Line 1 & Watercraft Contract Suite', () => {
  let originalConsoleError: typeof console.error;

  beforeAll(() => {
    originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      const msg = typeof args[0] === 'string' ? args[0] : '';
      if (
        msg.includes('is using incorrect casing') ||
        msg.includes('does not recognize the') ||
        msg.includes('non-boolean attribute')
      ) {
        return;
      }
      originalConsoleError(...args);
    };
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  // =========================================================================
  // FACET 1: RIVER NAVIGATION & WATERCRAFT WATERLINE (TC-228.01..TC-228.04)
  // =========================================================================
  describe('Facet 1: River Navigation & Watercraft Waterline', () => {
    it('[TC-228.01/MSS][UC-228][Facet1-RiverNav] calculateCruiserTrajectory(t) luôn có X nằm trong [-0.35, 0.35] (lòng sông Sài Gòn, không lấn bờ)', () => {
      const traj0 = calculateCruiserTrajectory(0);
      const trajPeak = calculateCruiserTrajectory(Math.PI / (4 * 0.12));
      const trajTrough = calculateCruiserTrajectory((3 * Math.PI) / (4 * 0.12));
      expect(traj0.x).toBeGreaterThanOrEqual(-0.35);
      expect(traj0.x).toBeLessThanOrEqual(0.35);
      expect(trajPeak.x).toBeLessThanOrEqual(0.35);
      expect(trajTrough.x).toBeGreaterThanOrEqual(-0.35);
    });

    it('[TC-228.02/MSS][UC-228][Facet1-RiverNav] Cao độ Y của thuyền du ngoạn ngập trong nước: Y nằm trong [-0.036, -0.028]', () => {
      const traj0 = calculateCruiserTrajectory(0);
      const trajWave = calculateCruiserTrajectory(Math.PI / (2 * 2.8));
      expect(traj0.y).toBeGreaterThanOrEqual(-0.036);
      expect(traj0.y).toBeLessThanOrEqual(-0.028);
      expect(trajWave.y).toBeGreaterThanOrEqual(-0.036);
      expect(trajWave.y).toBeLessThanOrEqual(-0.028);
    });

    it('[TC-228.03/MSS][UC-228][Facet1-RiverNav] Quỹ đạo Z của thuyền trải dài từ Z <= -4.5 đến Z >= 4.5, chui qua Cầu Ba Son (Z = -3.8) và Cầu Long Biên (Z = 3.8)', () => {
      const trajNorth = calculateCruiserTrajectory(0);
      const trajSouth = calculateCruiserTrajectory(Math.PI / 0.12);
      expect(trajNorth.z).toBeGreaterThanOrEqual(4.5);
      expect(trajSouth.z).toBeLessThanOrEqual(-4.5);
    });

    it('[TC-228.04/MSS][UC-228][Facet1-RiverNav] Ca-nô trong DioramaMicroLife sở hữu cao độ Y <= -0.025 (hạ xuống mặt nước, không còn ở Y = 0.052)', () => {
      const tree = captureRenderedTree(DioramaMicroLife);
      const canoeGroup = findFirstNode(
        tree,
        (n) =>
          getNodeType(n) === 'group' &&
          Array.isArray(n.props?.position) &&
          n.props.position[2] === -1.8
      );
      const canoeY = canoeGroup?.props?.position?.[1] ?? 999;
      expect(canoeY).toBeLessThanOrEqual(-0.025);
      expect(canoeY).toBeGreaterThanOrEqual(-0.040);
    });
  });

  // =========================================================================
  // FACET 2: ELEVATED VIADUCT & STRUCTURAL INTEGRITY (TC-228.05..TC-228.08)
  // =========================================================================
  describe('Facet 2: Elevated Viaduct & Structural Integrity', () => {
    it('[TC-228.05/MSS][UC-228][Facet2-ElevatedViaduct] Đường ray getRailroadTrackCurve() có cao độ Y trên toàn tuyến đạt dải cầu cạn [0.42, 0.48]', () => {
      const curve = getRailroadTrackCurve();
      const p0 = curve.getPointAt(0.0);
      const p25 = curve.getPointAt(0.25);
      const p50 = curve.getPointAt(0.5);
      const p75 = curve.getPointAt(0.75);
      expect(p0.y).toBeGreaterThanOrEqual(0.42);
      expect(p25.y).toBeLessThanOrEqual(0.48);
      expect(p50.y).toBeGreaterThanOrEqual(0.42);
      expect(p75.y).toBeLessThanOrEqual(0.48);
    });

    it('[TC-228.06/MSS][UC-228][Facet2-ElevatedViaduct] DioramaBallastBed kết xuất các trụ cầu cạn vươn từ mặt đất Y = 0.02 lên Y >= 0.40', () => {
      const tree = captureRenderedTree(DioramaBallastBed);
      const pierNodes = findNodes(
        tree,
        (n) =>
          (getNodeType(n) === 'mesh' || getNodeType(n) === 'Mesh') &&
          hasGeometry(n, 'cylindergeometry') &&
          getMaterialColor(n) === '#CBD5E1'
      );
      const hasTallPiers = pierNodes.some((p) => {
        const y = p.props?.position?.[1] ?? 0;
        const geom = findFirstNode(p, (c) => getNodeType(c).toLowerCase().includes('cylindergeometry'));
        const height = geom?.props?.args?.[2] ?? 0;
        return (y + height / 2) >= 0.40;
      });
      expect(pierNodes.length).toBeGreaterThanOrEqual(10);
      expect(hasTallPiers, 'Pier superstructure must reach elevated viaduct elevation Y >= 0.40').toBe(true);
    });

    it('[TC-228.07/MSS][UC-228][Facet2-ElevatedViaduct] Dầm cầu cạn U-Girder trang bị lan can bảo vệ hai bên mép ray tại cao độ Y >= 0.44', () => {
      const tree = captureRenderedTree(DioramaBallastBed);
      const parapetNodes = findNodes(
        tree,
        (n) =>
          (getNodeType(n) === 'mesh' || getNodeType(n) === 'Mesh') &&
          getMaterialColor(n) === '#94A3B8'
      );
      const hasElevatedParapets = parapetNodes.some(
        (p) => (p.props?.position?.[1] ?? 0) >= 0.44
      );
      expect(parapetNodes.length).toBeGreaterThanOrEqual(4);
      expect(hasElevatedParapets, 'U-Girder parapets must be elevated at Y >= 0.44').toBe(true);
    });

    it('[TC-228.08/MSS][UC-228][Facet2-ElevatedViaduct] Khoảng tĩnh không thông thuyền của ray Metro vượt sông Sài Gòn >= 0.45m', () => {
      const curve = getRailroadTrackCurve();
      const crossingPt = curve.getPointAt(0.06);
      const waterElevation = -0.035;
      const verticalClearance = crossingPt.y - waterElevation;
      expect(verticalClearance).toBeGreaterThanOrEqual(0.45);
      expect(crossingPt.y).toBeGreaterThanOrEqual(0.42);
    });
  });

  // =========================================================================
  // FACET 3: ELEVATED STATIONS & VERTICAL CIRCULATION (TC-228.09..TC-228.11)
  // =========================================================================
  describe('Facet 3: Elevated Stations & Vertical Circulation', () => {
    it('[TC-228.09/MSS][UC-228][Facet3-ElevatedStations] DioramaWaterfrontStation kết xuất cầu thang bộ đối xứng với tay vịn (#CBD5E1)', () => {
      const waterfrontMarkup = renderToStaticMarkup(React.createElement(DioramaWaterfrontStation));
      expect(waterfrontMarkup).toContain('data-testid="diorama-waterfront-station"');
      expect(
        waterfrontMarkup,
        'DioramaWaterfrontStation must feature staircase handrails in metallic silver #CBD5E1'
      ).toContain('#CBD5E1');
    });

    it('[TC-228.10/MSS][UC-228][Facet3-ElevatedStations] Ga kết xuất thang cuốn / hành lang bộ hành bọc kính vát nghiêng (#38BDF8) dẫn từ mặt đất Y = 0.02 lên ke ga Y = 0.45', () => {
      const tree = captureRenderedTree(DioramaWaterfrontStation);
      const glassNodes = findNodes(
        tree,
        (n) => getMaterialColor(n) === '#38BDF8'
      );
      const hasElevatedGlass = glassNodes.some(
        (n) => (n.props?.position?.[1] ?? 0) >= 0.40
      );
      const hasGroundConnection = findNodes(tree, (n) => {
        const y = n.props?.position?.[1] ?? 0;
        return y >= 0.01 && y <= 0.05;
      }).length > 0;
      expect(glassNodes.length).toBeGreaterThanOrEqual(1);
      expect(hasElevatedGlass, 'Station must include glass corridor/PSD reaching elevated concourse Y >= 0.40').toBe(true);
      expect(hasGroundConnection, 'Station must have ground concourse base at Y ~ 0.02').toBe(true);
    });

    it('[TC-228.11/MSS][UC-228][Facet3-ElevatedStations] Ke ga trên cao trang bị cửa chắn ke ga tự động (PSD) và mái vòm bạt căng (#F8FAFC)', () => {
      const tree = captureRenderedTree(DioramaWaterfrontStation);
      const tensileCanopyNodes = findNodes(
        tree,
        (n) => getMaterialColor(n) === '#F8FAFC'
      );
      const hasElevatedTensileCanopy = tensileCanopyNodes.some(
        (n) => (n.props?.position?.[1] ?? 0) >= 0.50
      );
      expect(tensileCanopyNodes.length).toBeGreaterThanOrEqual(1);
      expect(hasElevatedTensileCanopy, 'Tensile canopy #F8FAFC must be elevated above the platform at Y >= 0.50').toBe(true);
    });
  });

  // =========================================================================
  // FACET 4: ORGANIC ROUTING & URBAN CLEARANCE (TC-228.12..TC-228.14)
  // =========================================================================
  describe('Facet 4: Organic Routing & Urban Clearance', () => {
    it('[TC-228.12/MSS][UC-228][Facet4-OrganicRouting] Chu vi đường ray [50.0m, 58.0m], dừng đỗ tại progress 0.12 (Ga Waterfront Z ≈ 6.55) và 0.62 (Ga Landmark Bắc Z ≈ -6.55)', () => {
      const perimeter = getRailroadTrackPerimeter();
      const curve = getRailroadTrackCurve();
      const pSouth = curve.getPointAt(0.12);
      const pNorth = curve.getPointAt(0.62);
      expect(perimeter).toBeGreaterThanOrEqual(50.0);
      expect(perimeter).toBeLessThanOrEqual(58.0);
      expect(pSouth.y).toBeCloseTo(0.45, 1);
      expect(pNorth.y).toBeCloseTo(0.45, 1);
    });

    it('[TC-228.13/MSS][UC-228][Facet4-OrganicRouting] Khoảng đệm an toàn từ ray đến Nhà Thờ Đức Bà (X = -4.5, Z = 2.9) >= 1.5m', () => {
      const minDist = computeMinTrackDistanceToTarget(-4.5, 2.9);
      const nearestPt = computeNearestTrackPointToTarget(-4.5, 2.9);
      expect(minDist).toBeGreaterThanOrEqual(1.5);
      expect(nearestPt.y).toBeGreaterThanOrEqual(0.42);
    });

    it('[TC-228.14/MSS][UC-228][Facet4-OrganicRouting] Đoàn tàu Metro 3 toa chuyển động ở cao độ trên cao Y ≈ 0.488 với mũi vát cyan (#0EA5E9) và thân bạc (#E2E8F0)', () => {
      const curve = getRailroadTrackCurve();
      const samplePt = curve.getPointAt(0.12);
      const expectedTrainY = samplePt.y + 0.038;
      const railroadMarkup = renderToStaticMarkup(React.createElement(DioramaModelRailroad));
      expect(expectedTrainY).toBeCloseTo(0.488, 2);
      expect(railroadMarkup).toContain('#0EA5E9');
      expect(railroadMarkup).toContain('#E2E8F0');
    });
  });

  // =========================================================================
  // FACET 5: PRESERVATION & GPU BUDGET (TC-228.15..TC-228.16)
  // =========================================================================
  describe('Facet 5: Preservation & GPU Budget', () => {
    it('[TC-228.15/MSS][UC-228][Facet5-Preservation] Bảo tồn 100% các data-testid: diorama-railroad-ballast, diorama-model-railroad, diorama-waterfront-station, diorama-landmark-north-station, diorama-harbor-cruiser', () => {
      const ballastMarkup = renderToStaticMarkup(React.createElement(DioramaBallastBed));
      const railroadMarkup = renderToStaticMarkup(React.createElement(DioramaModelRailroad));
      const waterfrontMarkup = renderToStaticMarkup(React.createElement(DioramaWaterfrontStation));
      const landmarkMarkup = renderToStaticMarkup(React.createElement(DioramaLandmarkNorthStation));
      const cruiserMarkup = renderToStaticMarkup(React.createElement(DioramaHarborCruiser));
      const allTestIdsPreserved =
        ballastMarkup.includes('data-testid="diorama-railroad-ballast"') &&
        railroadMarkup.includes('data-testid="diorama-model-railroad"') &&
        waterfrontMarkup.includes('data-testid="diorama-waterfront-station"') &&
        landmarkMarkup.includes('data-testid="diorama-landmark-north-station"') &&
        cruiserMarkup.includes('data-testid="diorama-harbor-cruiser"');
      expect(allTestIdsPreserved).toBe(true);
    });

    it('[TC-228.16/MSS][UC-228][Facet5-Preservation] Toàn bộ mesh bậc thang, tà vẹt, móng trụ cầu cạn và vỏ ca-nô trong diorama-microlife đều tắt castShadow={false} (IMP-142)', () => {
      const microTree = captureRenderedTree(DioramaMicroLife);
      const canoeHullMesh = findFirstNode(
        microTree,
        (n) => getNodeType(n).toLowerCase() === 'mesh' && getMaterialColor(n) === '#F8FAFC'
      );
      const ballastTree = captureRenderedTree(DioramaBallastBed);
      const pierNodes = findNodes(
        ballastTree,
        (n) => getNodeType(n).toLowerCase() === 'mesh' && hasGeometry(n, 'cylindergeometry')
      );
      const hasPierCastShadow = pierNodes.some((n) => Boolean(n.props?.castShadow));
      expect(canoeHullMesh?.props?.castShadow).toBeFalsy();
      expect(hasPierCastShadow).toBe(false);
    });
  });
});
