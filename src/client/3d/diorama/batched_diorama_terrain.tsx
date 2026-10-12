// [UI-S02/MSS][IMP-375] BatchedDioramaTerrain — Consolidated Static Diorama Landmass Geometries
import React, { useMemo } from 'react';
import { BoxGeometry, type BufferGeometry, Matrix4 } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

let cachedTerrainGeoms: {
  soilGeom: BufferGeometry;
  grassGeom: BufferGeometry;
  westBoulevardGeom: BufferGeometry;
  eastPromenadeGeom: BufferGeometry;
  sidewalksGeom: BufferGeometry;
  markingsGeom: BufferGeometry;
} | null = null;

function createBoxWithOffset(w: number, h: number, d: number, x: number, y: number, z: number): BufferGeometry {
  const geom = new BoxGeometry(w, h, d);
  const matrix = new Matrix4().makeTranslation(x, y, z);
  geom.applyMatrix4(matrix);
  return geom;
}

function mergeAndDispose(geometries: BufferGeometry[]): BufferGeometry {
  const merged = mergeGeometries(geometries, false);
  merged.computeBoundingBox();
  merged.computeBoundingSphere();
  geometries.forEach((g) => g.dispose());
  return merged;
}

export function createBatchedTerrainGeometries(): {
  soilGeom: BufferGeometry;
  grassGeom: BufferGeometry;
  westBoulevardGeom: BufferGeometry;
  eastPromenadeGeom: BufferGeometry;
  sidewalksGeom: BufferGeometry;
  markingsGeom: BufferGeometry;
} {
  if (cachedTerrainGeoms) return cachedTerrainGeoms;

  // 1. Foundation Soil (West Peninsula at X = -3.8, East Peninsula at X = 3.8)
  const soilParts = [
    createBoxWithOffset(5.4, 0.04, 13.8, -3.8, -0.02, 0),
    createBoxWithOffset(5.4, 0.04, 13.8, 3.8, -0.02, 0),
  ];
  const soilGeom = mergeAndDispose(soilParts);

  // 2. Green Grass Lawns (West Peninsula at X = -3.8, East Peninsula at X = 3.8)
  const grassParts = [
    createBoxWithOffset(5.2, 0.01, 13.6, -3.8, 0, 0),
    createBoxWithOffset(5.2, 0.01, 13.6, 3.8, 0, 0),
  ];
  const grassGeom = mergeAndDispose(grassParts);

  // 3. Grand West Boulevard (X = -4.8, Y = 0.020)
  const westBoulevardGeom = createBoxWithOffset(0.7, 0.005, 11.6, -4.8, 0.020, 0);
  westBoulevardGeom.computeBoundingBox();
  westBoulevardGeom.computeBoundingSphere();

  // 4. Coastal Promenade East (X = 4.8, Y = 0.020)
  const eastPromenadeGeom = createBoxWithOffset(0.7, 0.005, 11.6, 4.8, 0.020, 0);
  eastPromenadeGeom.computeBoundingBox();
  eastPromenadeGeom.computeBoundingSphere();

  // 5. Granite Sidewalks (West at X = -5.22, -4.38; East at X = 4.38, 5.22)
  const sidewalkParts = [
    createBoxWithOffset(0.14, 0.005, 11.6, -5.22, 0.015, 0),
    createBoxWithOffset(0.14, 0.005, 11.6, -4.38, 0.015, 0),
    createBoxWithOffset(0.14, 0.005, 11.6, 4.38, 0.015, 0),
    createBoxWithOffset(0.14, 0.005, 11.6, 5.22, 0.015, 0),
  ];
  const sidewalksGeom = mergeAndDispose(sidewalkParts);

  // 6. Road Markings (37 items: 7 lane stripes, 20 West zebra stripes, 10 East zebra stripes)
  const markingParts: BufferGeometry[] = [];
  // 7 West lane stripes
  for (const pz of [-4.5, -3.0, -1.5, 0, 1.5, 3.0, 4.5]) {
    markingParts.push(createBoxWithOffset(0.04, 0.002, 0.5, -4.8, 0.022, pz));
  }
  // 4 West zebra crossings (20 stripes)
  for (const cz of [-3.75, -0.75, 0.75, 3.75]) {
    for (const ox of [-0.24, -0.12, 0, 0.12, 0.24]) {
      markingParts.push(createBoxWithOffset(0.07, 0.002, 0.28, -4.8 + ox, 0.022, cz));
    }
  }
  // 2 East zebra crossings (10 stripes)
  for (const cz of [-3.75, 3.75]) {
    for (const ox of [-0.24, -0.12, 0, 0.12, 0.24]) {
      markingParts.push(createBoxWithOffset(0.07, 0.002, 0.28, 4.8 + ox, 0.022, cz));
    }
  }
  const markingsGeom = mergeAndDispose(markingParts);

  cachedTerrainGeoms = {
    soilGeom,
    grassGeom,
    westBoulevardGeom,
    eastPromenadeGeom,
    sidewalksGeom,
    markingsGeom,
  };
  return cachedTerrainGeoms;
}

export function BatchedDioramaLandmasses(): React.ReactElement {
  const geoms = useMemo(() => createBatchedTerrainGeometries(), []);
  const noopRaycast = () => null;
  return (
    <group position={[0, 0, 0]} data-testid="batched-diorama-landmasses">
      <mesh geometry={geoms.soilGeom} receiveShadow raycast={noopRaycast}>
        <meshStandardMaterial color="#D4C5A3" roughness={0.78} />
      </mesh>
      <mesh geometry={geoms.grassGeom} receiveShadow raycast={noopRaycast}>
        <meshStandardMaterial color="#15803D" roughness={0.85} />
      </mesh>
      <mesh geometry={geoms.westBoulevardGeom} receiveShadow raycast={noopRaycast}>
        <meshStandardMaterial color="#1E293B" roughness={0.16} metalness={0.25} />
      </mesh>
      <mesh geometry={geoms.eastPromenadeGeom} receiveShadow raycast={noopRaycast}>
        <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.18} />
      </mesh>
      <mesh geometry={geoms.sidewalksGeom} receiveShadow raycast={noopRaycast}>
        <meshStandardMaterial color="#CBD5E1" roughness={0.35} />
      </mesh>
      <mesh geometry={geoms.markingsGeom} raycast={noopRaycast}>
        <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
      </mesh>
    </group>
  );
}
