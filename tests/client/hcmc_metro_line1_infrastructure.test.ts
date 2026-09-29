// [TC-METRO/MSS][UC-METRO1] IMP-227: HCMC Metro Line 1 Elevated Viaduct, Tensile Stations & Rolling Stock Contract Suite
// Traceability: docs/plans/improvements/IMP-227-hcmc-metro-line1-infrastructure-and-rolling-stock_plan.md § 3
// Universal 5-Facet Behavioral Matrix:
//   Facet 1 (Boundary & Curve Geometry): U-Girder parapets, concrete piers, catenary masts, viaduct elevation
//   Facet 2 (Reactivity & Kinematics): Aero sky blue nose, metallic silver body, roof pantograph, computeTrainPitch pure function
//   Facet 3 (Tensile Canopy Stations): Waterfront sail tensile canopy, PSD screen doors, Landmark cyan trim & LED, coordinates
//   Facet 4 (Error Defense & Preservation): Zero NaN/undefined, core testids, imp134 color preservation, shadow budget

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as RailroadModule from '../../src/client/3d/diorama/diorama_railroad';
import * as KinematicsModule from '../../src/client/3d/diorama/diorama_train_kinematics';
import {
  DioramaBallastBed,
  DioramaModelRailroad,
  DioramaWaterfrontStation,
  DioramaLandmarkNorthStation,
} from '../../src/client/3d/diorama/diorama_railroad';
import { MiniatureCityDiorama } from '../../src/client/3d/miniature_city_diorama';

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

// =========================================================================
// TEST SUITE: HCMC METRO LINE 1 INFRASTRUCTURE & ROLLING STOCK
// =========================================================================

describe('[TC-METRO/MSS][UC-METRO1] HCMC Metro Line 1 Infrastructure & Rolling Stock Contract Suite', () => {
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
      ) {
        return;
      }
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
  // FACET 1: BOUNDARY & CURVE GEOMETRY (CẦU CẠN & TRỤ BÊ TÔNG)
  // =========================================================================
  describe('Facet 1: Boundary & Curve Geometry (Cầu Cạn & Trụ Bê Tông)', () => {
    it('[TC-METRO.01/MSS][UC-METRO1][Facet1-Boundary] DioramaBallastBed kết xuất cầu cạn U-Girder với 2 dải lan can bê tông bảo vệ dọc 4 cạnh', () => {
      expect(ballastMarkup).toContain('data-testid="diorama-railroad-ballast"');
      expect(
        ballastMarkup,
        'DioramaBallastBed must include U-Girder parapets in concrete gray #94A3B8'
      ).toContain('#94A3B8');
    });

    it('[TC-METRO.02/MSS][UC-METRO1][Facet1-Boundary] Tuyến cầu cạn trang bị hệ thống trụ đỡ bê tông cốt thép hình trụ tròn dọc các nhịp', () => {
      const tree = captureRenderedTree(DioramaBallastBed);
      const pierNodes = findNodes(
        tree,
        (n) =>
          (getNodeType(n) === 'mesh' || getNodeType(n) === 'Mesh') &&
          hasGeometry(n, 'cylindergeometry') &&
          getMaterialColor(n) === '#CBD5E1'
      );
      expect(
        pierNodes.length,
        'DioramaBallastBed must render at least 8 cylindrical concrete piers (#CBD5E1)'
      ).toBeGreaterThanOrEqual(8);
    });

    it('[TC-METRO.03/MSS][UC-METRO1][Facet1-Boundary] Tuyến metro trang bị hệ thống cột cần tiếp điện trên cao dọc hành lang đường ray với thanh vươn ở cao độ Y >= 0.15m', () => {
      expect(
        ballastMarkup,
        'DioramaBallastBed must feature catenary masts (#64748B)'
      ).toContain('#64748B');
      const posMatches = Array.from(ballastMarkup.matchAll(/position="([^"]+)"/g));
      const hasCantileverArm = posMatches.some((m) => {
        const y = Number((m[1] ?? '').split(',')[1]);
        return !Number.isNaN(y) && y >= 0.15 && y <= 0.25;
      });
      expect(
        hasCantileverArm,
        'Catenary mast horizontal cantilever arm must be positioned at elevation Y >= 0.15m'
      ).toBe(true);
    });

    it('[TC-METRO.04/MSS][UC-METRO1][Facet1-Boundary] Khổ cầu cạn và cao độ Y đảm bảo tính bảo toàn trong dải [0.015m, 0.035m]', () => {
      const posMatches = Array.from(ballastMarkup.matchAll(/position="([^"]+)"/g));
      const hasValidViaductElevation = posMatches.some((m) => {
        const y = Number((m[1] ?? '').split(',')[1]);
        return !Number.isNaN(y) && y >= 0.015 && y <= 0.035;
      });
      expect(
        hasValidViaductElevation,
        'Viaduct base slab elevation Y must remain within [0.015m, 0.035m]'
      ).toBe(true);
    });
  });

  // =========================================================================
  // FACET 2: REACTIVITY & KINEMATICS (ĐOÀN TÀU METRO & NHỊP NGHIÊNG)
  // =========================================================================
  describe('Facet 2: Reactivity & Kinematics (Đoàn Tàu Metro & Nhịp Nghiêng)', () => {
    it('[TC-METRO.05/MSS][UC-METRO1][Facet2-Kinematics] Đầu tàu Metro khí động học sở hữu mũi vát nhọn màu xanh da trời Metro (#0284C7 / #0EA5E9)', () => {
      const hasSkyBlueNose = railroadMarkup.includes('#0EA5E9');
      expect(
        hasSkyBlueNose,
        'DioramaModelRailroad lead cab must feature aerodynamic sky blue styling (#0EA5E9)'
      ).toBe(true);
    });

    it('[TC-METRO.06/MSS][UC-METRO1][Facet2-Kinematics] Thân tàu sở hữu lớp vỏ kim loại màu bạc sáng (#E2E8F0 / #F8FAFC) phối dải sơn thương hiệu Cyan đặc trưng của Metro TP.HCM', () => {
      const tree = captureRenderedTree(DioramaModelRailroad);
      const carriageMeshes = findNodes(
        tree,
        (n) =>
          (getNodeType(n) === 'mesh' || getNodeType(n) === 'Mesh') &&
          Boolean(n.props?.castShadow)
      );
      const hasMetallicSilverBody = carriageMeshes.some((m) => {
        const color = getMaterialColor(m);
        return color === '#E2E8F0' || color === '#F8FAFC';
      });
      expect(
        hasMetallicSilverBody,
        'Train carriage bodywork must feature metallic silver (#E2E8F0 / #F8FAFC)'
      ).toBe(true);
    });

    it('[TC-METRO.07/MSS][UC-METRO1][Facet2-Kinematics] Toa tàu khách trang bị cụm điều hòa và cần tiếp điện nóc toa (pantograph)', () => {
      const tree = captureRenderedTree(DioramaModelRailroad);
      const carriageGroups = findNodes(
        tree,
        (n) =>
          getNodeType(n) === 'group' &&
          Array.isArray(n.props?.position) &&
          n.props.position[1] === 0.062
      );
      const hasPantographMesh = carriageGroups.some(
        (grp) => findNodes(grp, (m) => getMaterialColor(m) === '#64748B').length > 0
      );
      expect(
        hasPantographMesh,
        'Train carriages must feature rooftop pantograph / AC units (#64748B)'
      ).toBe(true);
    });

    it('[TC-METRO.08/MSS][UC-METRO1][Facet2-Kinematics] Hàm computeTrainPitch(speed, t) tính toán độ nghiêng động lực học chính xác: bằng 0 khi dừng đỗ và dao động hình sin tuần hoàn khi đang chạy cruise', () => {
      const computePitch =
        (KinematicsModule as Record<string, unknown>).computeTrainPitch ??
        (RailroadModule as Record<string, unknown>).computeTrainPitch;

      expect(
        typeof computePitch,
        'computeTrainPitch must be exported as a pure function from diorama_train_kinematics or diorama_railroad'
      ).toBe('function');

      const pitchFn = computePitch as (speed: number, t: number) => number;
      expect(pitchFn(0, 3.5)).toBe(0);
      expect(pitchFn(1.2, 0.25)).toBeCloseTo(Math.sin(0.25 * 12) * 0.005, 5);
    });
  });

  // =========================================================================
  // FACET 3: TENSILE CANOPY STATIONS (KIẾN TRÚC GA MÁI VÒM CÁNH BUỒM)
  // =========================================================================
  describe('Facet 3: Tensile Canopy Stations (Kiến Trúc Ga Mái Vòm Cánh Buồm)', () => {
    it('[TC-METRO.09/MSS][UC-METRO1][Facet3-TensileCanopy] Ga Waterfront sở hữu mái vòm bạt căng hình cánh buồm màu trắng sứ (#F8FAFC) và khung thép uốn cong (#1E293B)', () => {
      expect(
        waterfrontMarkup,
        'Waterfront station must include tensile white canopy (#F8FAFC)'
      ).toContain('#F8FAFC');
      expect(
        waterfrontMarkup,
        'Waterfront station must include dark steel arched frame (#1E293B)'
      ).toContain('#1E293B');
    });

    it('[TC-METRO.10/MSS][UC-METRO1][Facet3-TensileCanopy] Ga Waterfront trang bị vách cửa kính an toàn ke ga mờ (Platform Screen Doors) màu xanh kính biếc (#38BDF8)', () => {
      expect(
        waterfrontMarkup,
        'Waterfront station must include Platform Screen Doors in sky cyan glass (#38BDF8)'
      ).toContain('#38BDF8');
    });

    it('[TC-METRO.11/MSS][UC-METRO1][Facet3-TensileCanopy] Ga Landmark North sở hữu mái vòm hiện đại viền xanh cyan thương hiệu Metro và biển hiệu phát sáng LED', () => {
      expect(
        landmarkMarkup,
        'Landmark station must feature Metro cyan branding (#0284C7)'
      ).toContain('#0284C7');
      expect(
        landmarkMarkup,
        'Landmark station must feature illuminated LED sign (#FEF08A)'
      ).toContain('#FEF08A');
    });

    it('[TC-METRO.12/MSS][UC-METRO1][Facet3-TensileCanopy] Vị trí hai nhà ga được cố định chuẩn mực tại bờ Nam (Z ≈ 6.55) và bờ Bắc (Z <= -5.5)', () => {
      const wfPositions = Array.from(waterfrontMarkup.matchAll(/position="([^"]+)"/g));
      const hasSouthAnchor = wfPositions.some(
        (m) => Math.abs(Number((m[1] ?? '').split(',')[2]) - 6.55) < 0.2
      );
      expect(
        hasSouthAnchor,
        'Waterfront station components must anchor at south bank Z ~ 6.55'
      ).toBe(true);

      const lmPositions = Array.from(landmarkMarkup.matchAll(/position="([^"]+)"/g));
      const hasNorthAnchor = lmPositions.some(
        (m) => Number((m[1] ?? '').split(',')[2]) <= -5.5
      );
      expect(
        hasNorthAnchor,
        'Landmark station must anchor at north bank Z <= -5.5'
      ).toBe(true);
    });
  });

  // =========================================================================
  // FACET 4: ERROR DEFENSE & PRESERVATION (BẢO TỒN BẤT BIẾN & PHÒNG THỦ LỖI)
  // =========================================================================
  describe('Facet 4: Error Defense & Preservation (Bảo Tồn Bất Biến & Phòng Thủ Lỗi)', () => {
    it('[TC-METRO.13/MSS][UC-METRO1][Facet4-ErrorDefense] Kết xuất tĩnh SSR không chứa NaN, undefined, hoặc thuộc tính hỏng', () => {
      expect(railroadMarkup).not.toContain('NaN');
      expect(railroadMarkup).not.toContain('undefined');
      expect(waterfrontMarkup).not.toContain('NaN');
      expect(landmarkMarkup).not.toContain('NaN');
    });

    it('[TC-METRO.14/MSS][UC-METRO1][Facet4-ErrorDefense] Bảo tồn 100% các data-testid cốt lõi', () => {
      const dioramaMarkup = renderToStaticMarkup(React.createElement(MiniatureCityDiorama));
      expect(dioramaMarkup).toContain('data-testid="diorama-railroad-ballast"');
      expect(dioramaMarkup).toContain('data-testid="diorama-model-railroad"');
      expect(dioramaMarkup).toContain('data-testid="diorama-waterfront-station"');
      expect(dioramaMarkup).toContain('data-testid="diorama-landmark-north-station"');
    });

    it('[TC-METRO.15/MSS][UC-METRO1][Facet4-ErrorDefense] Bảo tồn sự hiện diện của màu #DC2626 và #0284C7 trong markup đoàn tàu tĩnh để tương thích hoàn toàn với bộ test cũ imp134', () => {
      expect(
        railroadMarkup,
        'Railroad markup must preserve #DC2626 for imp134 backward compatibility'
      ).toContain('#DC2626');
      expect(
        railroadMarkup,
        'Railroad markup must preserve #0284C7 for imp134 backward compatibility'
      ).toContain('#0284C7');
    });

    it('[TC-METRO.16/MSS][UC-METRO1][Facet4-ErrorDefense] Toàn bộ các mesh tà vẹt và móng cầu cạn tắt hoàn toàn castShadow để tuân thủ ngân sách đổ bóng GPU (IMP-142)', () => {
      const tree = captureRenderedTree(DioramaModelRailroad);
      const foundationMeshes = findNodes(
        tree,
        (n) =>
          (getNodeType(n) === 'mesh' || getNodeType(n) === 'Mesh') &&
          ['#451A03', '#475569', '#CBD5E1'].includes(getMaterialColor(n) ?? '')
      );
      expect(
        foundationMeshes.length,
        'Must locate sleeper and foundation meshes'
      ).toBeGreaterThanOrEqual(4);
      const anyCastsShadow = foundationMeshes.some((m) => Boolean(m.props?.castShadow));
      expect(
        anyCastsShadow,
        'Sleepers and foundations must not cast shadow'
      ).toBe(false);
    });
  });
});
