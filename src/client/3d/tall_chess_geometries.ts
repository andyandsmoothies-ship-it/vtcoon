/// <reference types="vite/client" />
import {
  CylinderGeometry,
  BoxGeometry,
  SphereGeometry,
  ConeGeometry,
  Euler,
  Matrix4,
  type BufferGeometry,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

let cachedBaseBodyGeom: BufferGeometry | null = null;
let cachedRookHeadGeom: BufferGeometry | null = null;
let cachedCannonHeadGeom: BufferGeometry | null = null;
let cachedWarhorseHeadGeom: BufferGeometry | null = null;
let cachedWarhorseEyesGeom: BufferGeometry | null = null;
let cachedQueenCrownGeom: BufferGeometry | null = null;
let cachedQueenCrownPointsGeom: BufferGeometry | null = null;

/**
 * Hợp nhất thân đế cọc cao: Tầng 1 + Tầng 2 + Cột trụ thon dài
 */
export function getTallChessBaseBodyGeometry(): BufferGeometry {
  if (cachedBaseBodyGeom) return cachedBaseBodyGeom;

  const tier1 = new CylinderGeometry(0.13, 0.15, 0.036, 24);
  tier1.translate(0, 0.018, 0);

  const tier2 = new CylinderGeometry(0.10, 0.125, 0.02, 24);
  tier2.translate(0, 0.045, 0);

  const col = new CylinderGeometry(0.07, 0.10, 0.22, 24);
  col.translate(0, 0.165, 0);

  const merged = mergeGeometries([tier1, tier2, col], false);
  tier1.dispose();
  tier2.dispose();
  col.dispose();

  merged.computeBoundingSphere();
  merged.computeBoundingBox();

  cachedBaseBodyGeom = merged;
  return cachedBaseBodyGeom;
}

/**
 * Hợp nhất đầu xe chiến: Cổ tháp + 4 Khối răng cưa + Vòm cầu đỉnh
 */
export function getMergedRookHeadGeometry(): BufferGeometry {
  if (cachedRookHeadGeom) return cachedRookHeadGeom;

  const neck = new CylinderGeometry(0.09, 0.08, 0.05, 24);
  neck.translate(0, 0.32, 0);

  const crenellations: BufferGeometry[] = [];
  for (const x of [-0.06, 0.06]) {
    for (const z of [-0.06, 0.06]) {
      const box = new BoxGeometry(0.035, 0.045, 0.035);
      box.translate(x, 0.36, z);
      crenellations.push(box);
    }
  }

  const dome = new SphereGeometry(0.045, 16, 16);
  dome.translate(0, 0.35, 0);

  const parts = [neck, ...crenellations, dome];
  const merged = mergeGeometries(parts, false);

  for (const part of parts) {
    part.dispose();
  }

  merged.computeBoundingSphere();
  merged.computeBoundingBox();

  cachedRookHeadGeom = merged;
  return cachedRookHeadGeom;
}

/**
 * Hợp nhất thân pháo thần công: Giá đỡ + Nòng pháo + Chuôi tròn
 */
export function getMergedCannonHeadGeometry(): BufferGeometry {
  if (cachedCannonHeadGeom) return cachedCannonHeadGeom;

  const mount = new CylinderGeometry(0.075, 0.08, 0.05, 16);
  mount.translate(0, 0.32, 0);

  const barrel = new CylinderGeometry(0.035, 0.048, 0.16, 20);
  const barrelMatrix = new Matrix4()
    .makeRotationFromEuler(new Euler(0.35, 0, 0, 'XYZ'))
    .setPosition(0, 0.38, 0.03);
  barrel.applyMatrix4(barrelMatrix);

  const knob = new SphereGeometry(0.045, 16, 16);
  knob.translate(0, 0.33, -0.04);

  const parts = [mount, barrel, knob];
  const merged = mergeGeometries(parts, false);

  for (const part of parts) {
    part.dispose();
  }

  merged.computeBoundingSphere();
  merged.computeBoundingBox();

  cachedCannonHeadGeom = merged;
  return cachedCannonHeadGeom;
}

/**
 * Hợp nhất thân ngựa chiến: Đầu ngựa + Mõm + 2 Tai nón (Dùng Matrix4 affine transform chuẩn)
 */
export function getMergedWarhorseHeadGeometry(): BufferGeometry {
  if (cachedWarhorseHeadGeom) return cachedWarhorseHeadGeom;

  const head = new SphereGeometry(0.08, 16, 16);
  head.translate(0, 0.38, 0.04);

  const snout = new BoxGeometry(0.065, 0.065, 0.08);
  snout.translate(0, 0.34, 0.10);

  const earLeft = new ConeGeometry(0.018, 0.05, 4);
  const earLeftMatrix = new Matrix4()
    .makeRotationFromEuler(new Euler(-0.15, 0, 0.15, 'XYZ'))
    .setPosition(-0.03, 0.45, 0.03);
  earLeft.applyMatrix4(earLeftMatrix);

  const earRight = new ConeGeometry(0.018, 0.05, 4);
  const earRightMatrix = new Matrix4()
    .makeRotationFromEuler(new Euler(-0.15, 0, -0.15, 'XYZ'))
    .setPosition(0.03, 0.45, 0.03);
  earRight.applyMatrix4(earRightMatrix);

  const parts = [head, snout, earLeft, earRight];
  const merged = mergeGeometries(parts, false);

  for (const part of parts) {
    part.dispose();
  }

  merged.computeBoundingSphere();
  merged.computeBoundingBox();

  cachedWarhorseHeadGeom = merged;
  return cachedWarhorseHeadGeom;
}

/**
 * Hợp nhất 2 mắt than đen bóng ngựa chiến
 */
export function getMergedWarhorseEyesGeometry(): BufferGeometry {
  if (cachedWarhorseEyesGeom) return cachedWarhorseEyesGeom;

  const eyeLeft = new SphereGeometry(0.012, 8, 8);
  eyeLeft.translate(-0.04, 0.39, 0.09);

  const eyeRight = new SphereGeometry(0.012, 8, 8);
  eyeRight.translate(0.04, 0.39, 0.09);

  const parts = [eyeLeft, eyeRight];
  const merged = mergeGeometries(parts, false);

  for (const part of parts) {
    part.dispose();
  }

  merged.computeBoundingSphere();
  merged.computeBoundingBox();

  cachedWarhorseEyesGeom = merged;
  return cachedWarhorseEyesGeom;
}

/**
 * Hợp nhất cổ và thân vương miện Indochine (activeColor)
 */
export function getMergedQueenCrownGeometry(): BufferGeometry {
  if (cachedQueenCrownGeom) return cachedQueenCrownGeom;

  const neck = new CylinderGeometry(0.07, 0.08, 0.05, 20);
  neck.translate(0, 0.32, 0);

  const crown = new CylinderGeometry(0.08, 0.065, 0.05, 16);
  crown.translate(0, 0.37, 0);

  const parts = [neck, crown];
  const merged = mergeGeometries(parts, false);

  for (const part of parts) {
    part.dispose();
  }

  merged.computeBoundingSphere();
  merged.computeBoundingBox();

  cachedQueenCrownGeom = merged;
  return cachedQueenCrownGeom;
}

/**
 * Hợp nhất 6 chóp nhọn vàng kim vương miện #F59E0B (không gộp gem để giữ emissive)
 */
export function getMergedQueenCrownPointsGeometry(): BufferGeometry {
  if (cachedQueenCrownPointsGeom) return cachedQueenCrownPointsGeom;

  const points: BufferGeometry[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const cone = new ConeGeometry(0.014, 0.035, 6);
    const coneMatrix = new Matrix4()
      .makeRotationFromEuler(new Euler(0.2 * Math.sin(angle), 0, -0.2 * Math.cos(angle), 'XYZ'))
      .setPosition(0.07 * Math.cos(angle), 0.40, 0.07 * Math.sin(angle));
    cone.applyMatrix4(coneMatrix);
    points.push(cone);
  }

  const merged = mergeGeometries(points, false);

  for (const p of points) {
    p.dispose();
  }

  merged.computeBoundingSphere();
  merged.computeBoundingBox();

  cachedQueenCrownPointsGeom = merged;
  return cachedQueenCrownPointsGeom;
}

/**
 * Giải phóng toàn bộ bộ nhớ GPU và reset singleton cache.
 * CHÚ Ý: BỊ CẤM gọi trong React component lifecycle (useEffect/unmount).
 * CHỈ dùng cho Vite HMR và Vitest test teardown.
 */
export function disposeTallChessGeometries(): void {
  cachedBaseBodyGeom?.dispose();
  cachedBaseBodyGeom = null;

  cachedRookHeadGeom?.dispose();
  cachedRookHeadGeom = null;

  cachedCannonHeadGeom?.dispose();
  cachedCannonHeadGeom = null;

  cachedWarhorseHeadGeom?.dispose();
  cachedWarhorseHeadGeom = null;

  cachedWarhorseEyesGeom?.dispose();
  cachedWarhorseEyesGeom = null;

  cachedQueenCrownGeom?.dispose();
  cachedQueenCrownGeom = null;

  cachedQueenCrownPointsGeom?.dispose();
  cachedQueenCrownPointsGeom = null;
}

// Dọn sạch VRAM trên Vite Hot Module Replacement (HMR)
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    disposeTallChessGeometries();
  });
}
