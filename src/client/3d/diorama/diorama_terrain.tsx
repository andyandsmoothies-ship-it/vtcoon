// [UI-S02/MSS][IMP-31] DioramaTerrain — Flush Metropolis Landmass, Sunken Saigon River & Flat Boulevards
import React, { useMemo } from 'react';
import { BufferGeometry, Float32BufferAttribute, DoubleSide } from 'three';
import { BatchedDioramaLandmasses } from './batched_diorama_terrain';

import { SafeGLTFModel } from '../asset_loader/safe_gltf_model';

const RIVER_BED_Y = -0.035;
const TERRAIN_BASE_Y = 0.000;
const TILE_BORDER_Y = 0.015;
const TILE_SURFACE_Y = 0.020;

export const SAIGON_RIVER_SPLINE_MODEL_URL = '/models/board/saigon_river_spline.glb';
export const PAVED_ESPLANADE_MODEL_URL = '/models/board/indochine_paved_esplanade.glb';

export function getSereneTerrainInfillGeometry(): BufferGeometry {
  const geom = new BufferGeometry();
  const baseSlices = [
    { z: -3.80, wx: -0.96, ex: 0.96 },
    { z: -3.30, wx: -0.40, ex: 1.05 },
    { z: -2.80, wx: 0.10, ex: 1.20 },
    { z: -1.90, wx: 0.91, ex: 1.20 },
    { z: 0.00, wx: 1.69, ex: 1.20 },
    { z: 1.90, wx: 0.76, ex: 1.20 },
    { z: 2.80, wx: 0.03, ex: 1.20 },
    { z: 3.30, wx: -0.40, ex: 1.05 },
    { z: 3.80, wx: -0.96, ex: 0.96 },
  ];

  function interpolateSlice(z: number): { z: number; wx: number; ex: number } {
    if (z <= baseSlices[0]!.z) return baseSlices[0]!;
    if (z >= baseSlices[baseSlices.length - 1]!.z) return baseSlices[baseSlices.length - 1]!;
    for (let i = 0; i < baseSlices.length - 1; i += 1) {
      const b1 = baseSlices[i]!;
      const b2 = baseSlices[i + 1]!;
      if (z >= b1.z && z <= b2.z) {
        const t = (z - b1.z) / (b2.z - b1.z);
        return {
          z,
          wx: b1.wx + t * (b2.wx - b1.wx),
          ex: b1.ex + t * (b2.ex - b1.ex),
        };
      }
    }
    return baseSlices[0]!;
  }

  const numSteps = 32;
  const slices: Array<{ z: number; wx: number; ex: number }> = [];
  for (let i = 0; i <= numSteps; i += 1) {
    const z = -3.80 + (i / numSteps) * 7.60;
    slices.push(interpolateSlice(z));
  }

  const positions: number[] = [];
  const y = 0.005;
  const rCollar = 1.78; // Exact outer radius of dice arena brass lip collar (r_outer = 1.78)

  for (let i = 0; i < slices.length - 1; i += 1) {
    const s1 = slices[i]!;
    const s2 = slices[i + 1]!;
    const zMid = (s1.z + s2.z) / 2;
    if (Math.abs(zMid) < rCollar) {
      const xCollar1 = Math.sqrt(Math.max(0, rCollar * rCollar - s1.z * s1.z));
      const xCollar2 = Math.sqrt(Math.max(0, rCollar * rCollar - s2.z * s2.z));
      if (s1.wx > xCollar1 && s2.wx > xCollar2) {
        positions.push(s1.wx, y, s1.z, xCollar1, y, s1.z, s2.wx, y, s2.z);
        positions.push(xCollar1, y, s1.z, xCollar2, y, s2.z, s2.wx, y, s2.z);
      }
    } else {
      positions.push(s1.wx, y, s1.z, -1.20, y, s1.z, s2.wx, y, s2.z);
      positions.push(-1.20, y, s1.z, -1.20, y, s2.z, s2.wx, y, s2.z);
    }

    // East strip: connects river east curb ex to X = 1.20 (CCW from +Y)
    if (s1.ex < 1.20 || s2.ex < 1.20) {
      positions.push(1.20, y, s1.z, s1.ex, y, s1.z, 1.20, y, s2.z);
      positions.push(s1.ex, y, s1.z, s2.ex, y, s2.z, 1.20, y, s2.z);
    }
  }

  geom.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geom.computeVertexNormals();
  return geom;
}

export interface DioramaTerrainProps {
  readonly isSereneTabletop?: boolean;
  readonly mossPalette?: boolean;
}

export function DioramaTerrain({
  isSereneTabletop = false,
  mossPalette = false,
}: DioramaTerrainProps = {}): React.ReactElement {
  const infillGeom = useMemo(() => (isSereneTabletop ? getSereneTerrainInfillGeometry() : null), [isSereneTabletop]);

  return (
    <group position={[0, 0, 0]}>
      {/* ========================================================
          1. LÒNG SÔNG SÀI GÒN KHẮC SÂU (Sunken Saigon Riverbed: Y = -0.035)
          Cắt giữa 2 bán đảo Đông - Tây (X: [-0.9, 0.9]), rộng 1.8m,
          đi lọt qua khẩu độ thông thuyền Cầu Ba Son (Z = -3.8) & Long Biên (Z = 3.8)
         ======================================================== */}
      {isSereneTabletop ? (
        <>
          <SafeGLTFModel
            url={SAIGON_RIVER_SPLINE_MODEL_URL}
            position={[0, 0, 0]}
            receiveShadow
            forceFallback
            fallback={
              <group position={[0, 0, 0]}>
                <mesh receiveShadow position={[0, RIVER_BED_Y, 0]}>
                  <boxGeometry args={[1.8, 0.008, 15.0]} />
                  <meshStandardMaterial color="#0284C7" roughness={0.25} metalness={0.10} transparent opacity={0.88} />
                </mesh>
                <mesh position={[0, RIVER_BED_Y + 0.005, 0]} data-testid="diorama-river-waves">
                  <boxGeometry args={[1.6, 0.002, 14.8]} />
                  <meshStandardMaterial color="#E0F2FE" transparent opacity={0.35} roughness={0.2} />
                </mesh>
              </group>
            }
          />
          {/* Lớp thảm cỏ trung tâm nối liền bán đảo Tây/Đông với bờ kè đá S-Curve */}
          {infillGeom && (
            <mesh
              receiveShadow
              position={[0, 0, 0]}
              geometry={infillGeom}
              data-testid="diorama-tabletop-infill"
            >
              <meshStandardMaterial color={mossPalette ? '#1B4332' : '#15803D'} roughness={mossPalette ? 0.78 : 0.85} side={DoubleSide} />
            </mesh>
          )}
          {/* Tấm chắn đáy chống hở void cho góc nhìn dốc trên thiết bị di động */}
          <mesh
            receiveShadow
            position={[0, -0.080, 0]}
            data-testid="diorama-void-guard"
          >
            <boxGeometry args={[13.2, 0.010, 14.0]} />
            <meshStandardMaterial color={mossPalette ? '#1B4332' : '#15803D'} roughness={mossPalette ? 0.78 : 0.85} />
          </mesh>
        </>
      ) : (
        <group position={[0, 0, 0]}>
          {/* Đáy sông Sài Gòn trầm tích sẫm */}
          <mesh receiveShadow position={[0, RIVER_BED_Y - 0.015, 0]}>
            <boxGeometry args={[2.4, 0.03, 15.2]} />
            <meshStandardMaterial color="#0C4A6E" roughness={0.9} />
          </mesh>

          {/* Bề mặt nước ngọc bích sa bàn đồ chơi (Toy Diorama Water) */}
          <mesh receiveShadow position={[0, RIVER_BED_Y, 0]}>
            <boxGeometry args={[1.8, 0.008, 15.0]} />
            <meshStandardMaterial
              color="#0284C7"
              roughness={0.25}
              metalness={0.10}
              transparent
              opacity={0.88}
            />
          </mesh>

          {/* Gờ sóng nước/bọt sóng dập dềnh */}
          <mesh position={[0, RIVER_BED_Y + 0.005, 0]} data-testid="diorama-river-waves">
            <boxGeometry args={[1.6, 0.002, 14.8]} />
            <meshStandardMaterial color="#E0F2FE" transparent opacity={0.35} roughness={0.2} />
          </mesh>

          {/* Bờ kè vát dốc Tây (Embankment slope from 0.000 down to -0.035) */}
          <mesh receiveShadow position={[-1.05, (TERRAIN_BASE_Y + RIVER_BED_Y) / 2, 0]} rotation={[0, 0, 0.16]}>
            <boxGeometry args={[0.35, 0.02, 15.0]} />
            <meshStandardMaterial color="#94A3B8" roughness={0.65} metalness={0.1} />
          </mesh>

          {/* Bờ kè vát dốc Đông (Embankment slope from 0.000 down to -0.035) */}
          <mesh receiveShadow position={[1.05, (TERRAIN_BASE_Y + RIVER_BED_Y) / 2, 0]} rotation={[0, 0, -0.16]}>
            <boxGeometry args={[0.35, 0.02, 15.0]} />
            <meshStandardMaterial color="#94A3B8" roughness={0.65} metalness={0.1} />
          </mesh>
        </group>
      )}

      {/* ========================================================
          2 & 3. BÁN ĐẢO TÂY & ĐÔNG: Khối nền, đại lộ, vỉa hè & vạch kẻ đường (Batched Merged Geometries)
         ======================================================== */}
      <BatchedDioramaLandmasses isSereneTabletop={isSereneTabletop} mossPalette={mossPalette} />
      <group data-testid="diorama-park-relief" position={[-2.7, 0, -2.5]}>
        <mesh receiveShadow position={[0, 0.035, 0]}>
          <boxGeometry args={[1.6, 0.025, 2.2]} />
          <meshStandardMaterial color="#64748B" roughness={0.6} metalness={0.15} />
        </mesh>
        <mesh receiveShadow position={[0, 0.05, 0]}>
          <boxGeometry args={[1.5, 0.01, 2.1]} />
          <meshStandardMaterial color={mossPalette ? '#1B4332' : '#15803D'} roughness={mossPalette ? 0.78 : 0.85} />
        </mesh>
      </group>
    </group>
  );
}
