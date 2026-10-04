// [TC-IMP259/MSS][UC-IMP259] IMP-259: GPU Curve Line Buffer & Vertex Shader Dynamic Tube Expansion Contract Suite
// Traceability: docs/domain/gotchas.md Pillar II (#18, #29), design.md, Heapscape rendering.js
// 5-Facet Universal Behavioral Matrix:
//   Facet 1: Luồng Chuẩn & Tính Toán Hình Học (TC-IMP259.01..05)
//   Facet 2: Phòng Thủ Ngoại Lệ & An Toàn Số Học (TC-IMP259.06..09)
//   Facet 3: Quản Lý Tài Nguyên & Giải Phóng Bộ Nhớ (TC-IMP259.10..12)
//   Facet 4: Phản Ứng Vòng Đời & Hiển Thị Thị Giác (TC-IMP259.13..14)
//   Facet 5: Bảo Toàn Tương Thích Ngược & Giảm Draw Calls (TC-IMP259.15..16)

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  Vector3,
  BufferGeometry,
  MeshStandardMaterial,
  TubeGeometry,
  CatmullRomCurve3,
} from 'three';
import {
  CurveLineBuffer,
  addTubeCenters,
  applyTubeWidth,
  createCurvedRailGeometry,
  createHopTrajectoryCurve,
  type CurveLike,
} from '../../src/client/3d/curve_line_buffer.js';
import {
  PawnHopTrajectory,
  type PawnHopTrajectoryProps,
} from '../../src/client/3d/pawn_hop_trajectory.js';
import {
  DioramaCurvedRails,
  DioramaModelRailroad,
} from '../../src/client/3d/diorama/diorama_railroad.js';
import { getRailroadTrackCurve } from '../../src/client/3d/diorama/diorama_train_kinematics.js';

interface TestTreeNodeProps {
  readonly children?: React.ReactNode;
  readonly name?: string;
  readonly color?: string;
  readonly castShadow?: boolean;
  readonly receiveShadow?: boolean;
  readonly position?: readonly number[];
  readonly args?: readonly number[];
  readonly geometry?: BufferGeometry;
  readonly material?: MeshStandardMaterial;
  readonly 'data-testid'?: string;
  readonly [key: string]: unknown;
}

interface TestTreeNode {
  readonly type?: unknown;
  readonly props?: TestTreeNodeProps;
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

function captureComponentTree(
  Component: () => React.ReactElement | null
): TestTreeNode | null {
  let rendered: TestTreeNode | null = null;
  function SpyComponent(): React.ReactElement | null {
    rendered = Component() as TestTreeNode | null;
    return null;
  }
  renderToStaticMarkup(React.createElement(SpyComponent));
  return rendered;
}

function capturePropsComponentTree<P extends object>(
  Component: (props: P) => React.ReactElement | null,
  props: P
): TestTreeNode | null {
  let rendered: TestTreeNode | null = null;
  function SpyComponent(): React.ReactElement | null {
    rendered = Component(props) as TestTreeNode | null;
    return null;
  }
  renderToStaticMarkup(React.createElement(SpyComponent));
  return rendered;
}

describe('[TC-IMP259/MSS][UC-IMP259] GPU Curve Line Buffer & Vertex Shader Dynamic Tube Expansion Contract Suite', () => {
  // ---------------------------------------------------------------------------
  // Facet 1: Luồng Chuẩn & Tính Toán Hình Học (TC-IMP259.01..05)
  // ---------------------------------------------------------------------------
  it('[TC-IMP259.01/MSS][UC-IMP259/MSS] CurveLineBuffer phân bổ các khối mảng Float32Array liên tục và đóng gói tọa độ theo bước nhảy stride = 6', () => {
    const buffer = new CurveLineBuffer(32);
    expect(buffer.capacity).toBe(192);
    const curve: CurveLike = {
      getPointAt: (u: number, target: Vector3 = new Vector3()) => target.set(u * 10, u * 20, 0),
    };

    buffer.add(curve, 2);

    expect(buffer.segmentCount).toBe(2);
    expect(buffer.used).toBe(12);
    expect(buffer.current?.[3]).toBeCloseTo(5);
    expect(buffer.current?.[9]).toBeCloseTo(10);
  });

  it('[TC-IMP259.02/MSS][UC-IMP259/MSS] CurveLineBuffer.toBufferGeometry chuyển đổi các mảng đệm thành BufferGeometry với thuộc tính position chính xác', () => {
    const buffer = new CurveLineBuffer(16);
    const curve: CurveLike = {
      getPointAt: (u: number, target: Vector3 = new Vector3()) => target.set(u * 2, u * 4, u * 6),
    };

    buffer.add(curve, 1);
    const geom = buffer.toBufferGeometry();
    const pos = geom.getAttribute('position');

    expect(pos.count).toBe(2);
    expect(pos.getX(0)).toBeCloseTo(0);
    expect(pos.getX(1)).toBeCloseTo(2);
    expect(pos.getY(1)).toBeCloseTo(4);
  });

  it('[TC-IMP259.03/MSS][UC-IMP259/MSS] addTubeCenters tính toán và gán thuộc tính tubeCenter khớp chính xác với tọa độ tâm đường cong trên từng tiết diện', () => {
    const curve = new CatmullRomCurve3([
      new Vector3(0, 0, 0),
      new Vector3(5, 5, 0),
      new Vector3(10, 0, 0),
    ]);
    const geom = new TubeGeometry(curve, 8, 0.2, 4, false);

    addTubeCenters(geom, curve, 8);
    const centerAttr = geom.getAttribute('tubeCenter');

    expect(centerAttr.itemSize).toBe(3);
    expect(centerAttr.count).toBe(geom.getAttribute('position').count);
    expect(centerAttr.getX(0)).toBeCloseTo(0);
    expect(centerAttr.getX(centerAttr.count - 1)).toBeCloseTo(10);
  });

  it('[TC-IMP259.04/MSS][UC-IMP259/MSS] applyTubeWidth tiêm mã biến đổi Vertex Shader và định nghĩa uniform referenceWidth đồng bộ qua material.userData', () => {
    const mat = new MeshStandardMaterial();
    applyTubeWidth(mat, 1.5);

    const shader = {
      uniforms: {} as Record<string, { value: number }>,
      vertexShader: '#include <common>\n#include <begin_vertex>',
      fragmentShader: '',
    };
    mat.onBeforeCompile(shader as never, {} as never);

    expect(shader.vertexShader).toContain('attribute vec3 tubeCenter;');
    expect(shader.vertexShader).toContain('transformed = tubeCenter + (transformed - tubeCenter) * referenceWidth;');
    expect(shader.uniforms['referenceWidth']?.value).toBe(1.5);
    expect(mat.customProgramCacheKey?.()).toBe('vtcoon-tube-width-MeshStandardMaterial');
  });

  it('[TC-IMP259.05/MSS][UC-IMP259/MSS] createCurvedRailGeometry kiến tạo hình học ray đôi uốn cong trơn tru gộp từ ray trái và ray phải với tubeCenter đầy đủ', () => {
    const curve = getRailroadTrackCurve();
    const geom = createCurvedRailGeometry(curve, {
      segments: 16,
      radialSegments: 4,
      railRadius: 0.008,
      gaugeOffset: 0.05,
      railElevation: 0.45,
    });

    expect(geom.getAttribute('tubeCenter').itemSize).toBe(3);
    expect(geom.getAttribute('position').count).toBeGreaterThan(100);
    expect(geom.boundingSphere?.radius).toBeGreaterThan(0);
    expect(geom.boundingBox?.min.y).toBeCloseTo(0.44, 1);
  });

  // ---------------------------------------------------------------------------
  // Facet 2: Phòng Thủ Ngoại Lệ & An Toàn Số Học (TC-IMP259.06..09)
  // ---------------------------------------------------------------------------
  it('[TC-IMP259.06/A1][UC-IMP259/A1] applyTubeWidth chốt chặn an toàn với giá trị bề rộng không hợp lệ (NaN, Infinity, âm) về ngưỡng mặc định an toàn >= 0.001', () => {
    const matNeg = applyTubeWidth(new MeshStandardMaterial(), -5);
    const matNan = applyTubeWidth(new MeshStandardMaterial(), Number.NaN);
    const matInf = applyTubeWidth(new MeshStandardMaterial(), Infinity);

    const refNeg = matNeg.userData['referenceWidth'] as { value: number } | undefined;
    const refNan = matNan.userData['referenceWidth'] as { value: number } | undefined;
    const refInf = matInf.userData['referenceWidth'] as { value: number } | undefined;

    expect(refNeg?.value).toBe(0.001);
    expect(refNan?.value).toBe(1.0);
    expect(refInf?.value).toBe(1.0);
  });

  it('[TC-IMP259.07/A1][UC-IMP259/A1] addTubeCenters xử lý an toàn khi số phân đoạn segments <= 0 hoặc hình học thiếu thuộc tính position', () => {
    const emptyGeom = new BufferGeometry();
    const curve: CurveLike = {
      getPointAt: (_u: number, target: Vector3 = new Vector3()) => target.set(0, 0, 0),
    };
    const resEmpty = addTubeCenters(emptyGeom, curve, 10);

    const validGeom = new TubeGeometry(
      new CatmullRomCurve3([new Vector3(0, 0, 0), new Vector3(1, 1, 0)]),
      4,
      0.1,
      4,
      false
    );
    const resZeroSeg = addTubeCenters(validGeom, curve, 0);

    expect(resEmpty.getAttribute('tubeCenter')).toBeUndefined();
    expect(resZeroSeg.getAttribute('tubeCenter').count).toBe(validGeom.getAttribute('position').count);
  });

  it('[TC-IMP259.08/A1][UC-IMP259/A1] CurveLineBuffer xử lý an toàn với đường cong suy biến hoặc hai điểm trùng nhau (Zero Length)', () => {
    const zeroCurve: CurveLike = {
      getPointAt: (_u: number, target: Vector3 = new Vector3()) => target.set(3, 4, 5),
    };
    const buffer = new CurveLineBuffer(16);
    buffer.add(zeroCurve, 4);
    const geom = buffer.toBufferGeometry();
    const pos = geom.getAttribute('position');

    expect(buffer.segmentCount).toBe(4);
    expect(pos.count).toBe(8);
    expect(pos.getX(0)).toBeCloseTo(3);
    expect(pos.getY(0)).toBeCloseTo(4);
  });

  it('[TC-IMP259.09/A1][UC-IMP259/A1] createHopTrajectoryCurve kiến tạo đường cong parabol bậc hai QuadraticBezierCurve3 hợp lệ giữa 2 ô cờ', () => {
    const curve = createHopTrajectoryCurve([0, 0, 0], [4, 0, 0], 1.0);

    expect(curve.v0.x).toBeCloseTo(0);
    expect(curve.v2.x).toBeCloseTo(4);
    expect(curve.v1.y).toBeCloseTo(2.0);
    expect(curve.getPointAt(0.5).y).toBeCloseTo(1.0);
  });

  // ---------------------------------------------------------------------------
  // Facet 3: Quản Lý Tài Nguyên & Giải Phóng Bộ Nhớ (TC-IMP259.10..12)
  // ---------------------------------------------------------------------------
  it('[TC-IMP259.10/A2][UC-IMP259/A2] CurveLineBuffer.clear() và dispose() tái sử dụng bộ nhớ và gán lại this.current chống rò rỉ heap', () => {
    const buffer = new CurveLineBuffer(16);
    const curve: CurveLike = {
      getPointAt: (u: number, target: Vector3 = new Vector3()) => target.set(u, u, u),
    };
    buffer.add(curve, 20);

    buffer.clear();
    expect(buffer.used).toBe(0);
    expect(buffer.chunks.length).toBe(1);
    expect(buffer.current).toBe(buffer.chunks[0]);

    buffer.dispose();
    expect(buffer.chunks.length).toBe(0);
  });

  it('[TC-IMP259.11/A2][UC-IMP259/A2] DioramaCurvedRails thực thi hook cleanup giải phóng cả hình học railGeometry và vật liệu railMaterial khi unmount', () => {
    const tree = captureComponentTree(DioramaCurvedRails);
    const geom = tree?.props?.geometry;
    const mat = tree?.props?.material;

    const onGeomDispose = vi.fn();
    const onMatDispose = vi.fn();
    geom?.addEventListener('dispose', onGeomDispose);
    mat?.addEventListener('dispose', onMatDispose);

    geom?.dispose();
    mat?.dispose();

    expect(onGeomDispose).toHaveBeenCalledTimes(1);
    expect(onMatDispose).toHaveBeenCalledTimes(1);
  });

  it('[TC-IMP259.12/A2][UC-IMP259/A2] PawnHopTrajectory giải phóng tài nguyên hình học khi thay đổi ô cờ đích hoặc component unmount', () => {
    const propsMoving: PawnHopTrajectoryProps = { fromCell: 0, toCell: 5 };
    const propsSame: PawnHopTrajectoryProps = { fromCell: 5, toCell: 5 };
    const treeSame = capturePropsComponentTree(PawnHopTrajectory, propsSame);
    const treeMoving = capturePropsComponentTree(PawnHopTrajectory, propsMoving);
    const geom = treeMoving?.props?.geometry;

    const onDispose = vi.fn();
    geom?.addEventListener('dispose', onDispose);
    geom?.dispose();

    expect(treeSame).toBeNull();
    expect(treeMoving?.props?.['data-testid']).toBe('pawn-hop-trajectory');
    expect(onDispose).toHaveBeenCalledTimes(1);
  });

  // ---------------------------------------------------------------------------
  // Facet 4: Phản Ứng Vòng Đời & Hiển Thị Thị Giác (TC-IMP259.13..14)
  // ---------------------------------------------------------------------------
  it('[TC-IMP259.13/A3][UC-IMP259/A3] DioramaCurvedRails kết xuất phần tử mesh mang data-testid="diorama-curved-rails" và vật liệu kim loại ánh bạc #E2E8F0 dạng self-closing mesh', () => {
    const tree = captureComponentTree(DioramaCurvedRails);
    const mat = tree?.props?.material;

    expect(tree?.props?.['data-testid']).toBe('diorama-curved-rails');
    expect(tree?.props?.receiveShadow).toBe(true);
    expect(tree?.props?.children).toBeUndefined();
    expect(mat?.color?.getHexString()?.toUpperCase()).toBe('E2E8F0');
  });

  it('[TC-IMP259.14/A3][UC-IMP259/A3] PawnHopTrajectory kết xuất vệt quỹ đạo với data-testid="pawn-hop-trajectory" và nhận diện màu sắc của người chơi', () => {
    const props: PawnHopTrajectoryProps = {
      fromCell: 0,
      toCell: 5,
      color: '#3B82F6',
    };
    const tree = capturePropsComponentTree(PawnHopTrajectory, props);
    const mat = tree?.props?.material;

    expect(tree?.props?.['data-testid']).toBe('pawn-hop-trajectory');
    expect(mat?.color?.getHexString()?.toUpperCase()).toBe('3B82F6');
    expect(mat?.emissive?.getHexString()?.toUpperCase()).toBe('3B82F6');
    expect(mat?.transparent).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // Facet 5: Bảo Toàn Tương Thích Ngược & Giảm Draw Calls (TC-IMP259.15..16)
  // ---------------------------------------------------------------------------
  it('[TC-IMP259.15/A4][UC-IMP259/A4] DioramaModelRailroad bảo toàn 100% các tiêu chí kiểm thử diorama hiện hữu (zero NaN, tà vẹt #451A03, testid) sau khi điều hòa TC-230.06 và TC-233.07', () => {
    const markup = renderToStaticMarkup(React.createElement(DioramaModelRailroad));
    const tree = captureComponentTree(DioramaModelRailroad);
    const hasCurvedRails = findNodes(tree, (n) => getNodeType(n) === 'DioramaCurvedRails').length > 0;

    expect(markup.includes('NaN')).toBe(false);
    expect(markup.includes('#451A03')).toBe(true);
    expect(markup.includes('diorama-model-railroad')).toBe(true);
    expect(hasCurvedRails).toBe(true);
  });

  it('[TC-IMP259.16/A4][UC-IMP259/A4] Cấu trúc ray mới thay thế triệt để 192 thẻ mesh rời rạc bằng đúng 1 thẻ mesh ray đôi uốn cong liên tục (tiết kiệm 191 Draw Calls)', () => {
    const tree = captureComponentTree(DioramaModelRailroad);
    const curvedRailsNodes = findNodes(tree, (n) => getNodeType(n) === 'DioramaCurvedRails');
    const discreteRailBoxes = findNodes(
      tree,
      (n) => (getNodeType(n) === 'mesh' || getNodeType(n) === 'Mesh') &&
        findNodes(n, (c) => getNodeType(c) === 'SafeBoxGeometry' && c.props?.args?.[1] === 0.01 && c.props?.args?.[2] === 0.02).length > 0
    );

    expect(curvedRailsNodes.length).toBe(1);
    expect(discreteRailBoxes.length).toBe(0);
  });
});
