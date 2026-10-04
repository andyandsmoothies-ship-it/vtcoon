import {
  Vector3,
  BufferGeometry,
  Float32BufferAttribute,
  TubeGeometry,
  CatmullRomCurve3,
  QuadraticBezierCurve3,
  Material,
  type WebGLProgramParametersWithUniforms,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export interface CurveLike {
  readonly getPointAt: (u: number, target?: Vector3) => Vector3;
  readonly getPoint?: (u: number, target?: Vector3) => Vector3;
}

export interface CurvedRailOptions {
  readonly segments?: number;
  readonly radialSegments?: number;
  readonly railRadius?: number;
  readonly gaugeOffset?: number;
  readonly railElevation?: number;
}

/**
 * [HEAPSCAPE-INSPIRED] Bộ đệm mảng định kiểu cho các đường cong phân đoạn.
 * Tránh việc cấp phát hàng nghìn mảng JavaScript nhỏ gây áp lực lên GC.
 */
export class CurveLineBuffer {
  readonly capacity: number;
  readonly chunks: Float32Array[] = [];
  current: Float32Array | null = null;
  used: number = 0;
  segmentCount: number = 0;
  private readonly previous: Vector3 = new Vector3();
  private readonly next: Vector3 = new Vector3();

  constructor(segmentsPerChunk: number = 1024) {
    const safeSegments = Math.max(16, Number.isFinite(segmentsPerChunk) ? segmentsPerChunk : 1024);
    this.capacity = safeSegments * 6;
  }

  add(curve: CurveLike, segments: number): void {
    const safeSegments = Math.max(1, Number.isFinite(segments) ? Math.floor(segments) : 1);
    const getPt = curve.getPoint ? curve.getPoint.bind(curve) : curve.getPointAt.bind(curve);

    getPt(0, this.previous);
    for (let i = 1; i <= safeSegments; i++) {
      getPt(i / safeSegments, this.next);

      if (!this.current || this.used === this.capacity) {
        this.current = new Float32Array(this.capacity);
        this.chunks.push(this.current);
        this.used = 0;
      }

      const values = this.current;
      const offset = this.used;
      values[offset] = this.previous.x;
      values[offset + 1] = this.previous.y;
      values[offset + 2] = this.previous.z;
      values[offset + 3] = this.next.x;
      values[offset + 4] = this.next.y;
      values[offset + 5] = this.next.z;

      this.used += 6;
      this.segmentCount++;
      this.previous.copy(this.next);
    }
  }

  toBufferGeometry(): BufferGeometry {
    const geometry = new BufferGeometry();
    if (this.segmentCount === 0) {
      geometry.setAttribute('position', new Float32BufferAttribute(new Float32Array(0), 3));
      return geometry;
    }

    const totalFloats = this.segmentCount * 6;
    const combined = new Float32Array(totalFloats);
    let written = 0;

    for (let i = 0; i < this.chunks.length; i++) {
      const chunk = this.chunks[i];
      if (!chunk) continue;
      const length = i === this.chunks.length - 1 ? this.used : chunk.length;
      combined.set(chunk.subarray(0, length), written);
      written += length;
    }

    geometry.setAttribute('position', new Float32BufferAttribute(combined, 3));
    return geometry;
  }

  clear(): void {
    this.used = 0;
    this.segmentCount = 0;
    if (this.chunks.length > 1) {
      this.chunks.length = 1;
    }
    // [DIR-IMP259-06] Reset con trỏ current về chunk đầu tiên đã cấp phát
    this.current = this.chunks[0] ?? null;
  }

  dispose(): void {
    this.chunks.length = 0;
    this.current = null;
    this.used = 0;
    this.segmentCount = 0;
  }
}

/**
 * [HEAPSCAPE-INSPIRED] Tiện ích kiến tạo BufferGeometry từ đường cong thông qua CurveLineBuffer.
 */
export function buildCurveLineGeometry(curve: CurveLike, segments: number): BufferGeometry {
  const buffer = new CurveLineBuffer(segments);
  buffer.add(curve, segments);
  return buffer.toBufferGeometry();
}

/**
 * [HEAPSCAPE-INSPIRED] Gắn tọa độ tim đường cong vào từng đỉnh của hình học ống 3D.
 */
export function addTubeCenters(
  geometry: BufferGeometry,
  curve: CurveLike,
  segments: number
): BufferGeometry {
  const positionAttr = geometry.attributes['position'];
  if (!positionAttr || positionAttr.count === 0) {
    return geometry;
  }

  const safeSegments = Math.max(1, Number.isFinite(segments) ? Math.floor(segments) : 1);
  const count = positionAttr.count;
  const centers = new Float32Array(count * 3);
  const ringSize = Math.max(1, Math.floor(count / (safeSegments + 1)));
  const point = new Vector3();

  for (let i = 0; i <= safeSegments; i++) {
    const u = i / safeSegments;
    curve.getPointAt(u, point);

    const safeX = Number.isFinite(point.x) ? point.x : 0;
    const safeY = Number.isFinite(point.y) ? point.y : 0;
    const safeZ = Number.isFinite(point.z) ? point.z : 0;

    for (let ring = 0; ring < ringSize; ring++) {
      const offset = (i * ringSize + ring) * 3;
      if (offset + 2 < centers.length) {
        centers[offset] = safeX;
        centers[offset + 1] = safeY;
        centers[offset + 2] = safeZ;
      }
    }
  }

  geometry.setAttribute('tubeCenter', new Float32BufferAttribute(centers, 3));
  return geometry;
}

interface TubeUniformRef {
  value: number;
}

/**
 * [HEAPSCAPE-INSPIRED] Can thiệp Vertex Shader mở rộng bán kính ống động trên GPU.
 * [DIR-IMP259-05] Lưu trữ tham chiếu uniform vào material.userData để đồng bộ O(1) thời gian thực.
 */
export function applyTubeWidth<T extends Material>(material: T, width: number = 1.0): T {
  const safeWidth = Number.isFinite(width) ? Math.max(0.001, width) : 1.0;

  if (!material.userData.referenceWidth) {
    material.userData.referenceWidth = { value: safeWidth };
  } else {
    material.userData.referenceWidth.value = safeWidth;
  }

  const uniformRef: TubeUniformRef = material.userData.referenceWidth;

  material.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
    shader.uniforms['referenceWidth'] = uniformRef;
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        '#include <common>\nattribute vec3 tubeCenter;\nuniform float referenceWidth;'
      )
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\ntransformed = tubeCenter + (transformed - tubeCenter) * referenceWidth;'
      );
  };

  material.customProgramCacheKey = () => `vtcoon-tube-width-${material.type}`;
  return material;
}

/**
 * Kiến tạo hình học ray kim loại đôi cong uốn lượn mượt mà cho sa bàn diorama.
 * [DIR-IMP259-07] Khử bỏ điểm lặp thừa u=1.0 khi trackCurve.closed === true.
 */
export function createCurvedRailGeometry(
  trackCurve: CatmullRomCurve3,
  options: CurvedRailOptions = {}
): BufferGeometry {
  const segments = options.segments ?? 96;
  const radialSegments = options.radialSegments ?? 4;
  const railRadius = options.railRadius ?? 0.008;
  const gaugeOffset = options.gaugeOffset ?? 0.05;
  const railElevation = options.railElevation ?? 0.45;

  const leftPoints: Vector3[] = [];
  const rightPoints: Vector3[] = [];

  const numSamplePoints = trackCurve.closed ? segments : segments + 1;
  for (let i = 0; i < numSamplePoints; i++) {
    const u = i / segments;
    const p = trackCurve.getPointAt(u);
    const tan = trackCurve.getTangentAt(u);

    const nx = -tan.z;
    const nz = tan.x;
    const nLen = Math.sqrt(nx * nx + nz * nz) || 1;
    const normX = nx / nLen;
    const normZ = nz / nLen;

    leftPoints.push(new Vector3(p.x + normX * gaugeOffset, railElevation, p.z + normZ * gaugeOffset));
    rightPoints.push(new Vector3(p.x - normX * gaugeOffset, railElevation, p.z - normZ * gaugeOffset));
  }

  const leftCurve = new CatmullRomCurve3(leftPoints, trackCurve.closed, trackCurve.curveType, trackCurve.tension);
  const rightCurve = new CatmullRomCurve3(rightPoints, trackCurve.closed, trackCurve.curveType, trackCurve.tension);

  const leftGeom = new TubeGeometry(leftCurve, segments, railRadius, radialSegments, trackCurve.closed);
  const rightGeom = new TubeGeometry(rightCurve, segments, railRadius, radialSegments, trackCurve.closed);

  addTubeCenters(leftGeom, leftCurve, segments);
  addTubeCenters(rightGeom, rightCurve, segments);

  const merged = mergeGeometries([leftGeom, rightGeom], false) ?? new BufferGeometry();

  leftGeom.dispose();
  rightGeom.dispose();

  // [DIR-CHALLENGE-01] Phòng thủ Frame-0 hitch trên mobile do thiếu bounding box/sphere
  merged.computeBoundingSphere();
  merged.computeBoundingBox();

  return merged;
}

/**
 * Tạo đường cong quỹ đạo nhảy parabol bậc hai giữa 2 vị trí cờ.
 */
export function createHopTrajectoryCurve(
  fromPos: readonly [number, number, number],
  toPos: readonly [number, number, number],
  arcHeight: number = 0.8
): QuadraticBezierCurve3 {
  const safeArc = Number.isFinite(arcHeight) ? Math.max(0.1, arcHeight) : 0.8;
  const p0 = new Vector3(fromPos[0], fromPos[1], fromPos[2]);
  const p2 = new Vector3(toPos[0], toPos[1], toPos[2]);
  const p1 = new Vector3(
    (p0.x + p2.x) / 2,
    Math.max(p0.y, p2.y) + safeArc * 2,
    (p0.z + p2.z) / 2
  );

  return new QuadraticBezierCurve3(p0, p1, p2);
}
