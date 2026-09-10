// [UI-S02/MSS] CenterpieceWater — 3D Centerpiece water oasis, sandstone embankment & stylized flora
import React, { useMemo } from 'react';
import { Shape, Path } from 'three';

export const WATER_SURFACE_Y = 0.05;

export const WATER_MATERIAL_PROPS = {
  color: '#0284C7',
  roughness: 0.1,
  metalness: 0.2,
  transparent: true,
  opacity: 0.85,
} as const;

export const EMBANKMENT_MATERIAL_PROPS = {
  color: '#78716C',
  roughness: 0.6,
} as const;

function buildOuterContour(
  shape: Shape,
  x: number,
  y: number,
  size: number,
  radius: number
): void {
  if (radius <= 0) {
    shape.moveTo(x, y);
    shape.lineTo(x, y + size);
    shape.lineTo(x + size, y + size);
    shape.lineTo(x + size, y);
    shape.closePath();
    return;
  }
  shape.moveTo(x, y + radius);
  shape.lineTo(x, y + size - radius);
  shape.quadraticCurveTo(x, y + size, x + radius, y + size);
  shape.lineTo(x + size - radius, y + size);
  shape.quadraticCurveTo(x + size, y + size, x + size, y + size - radius);
  shape.lineTo(x + size, y + radius);
  shape.quadraticCurveTo(x + size, y, x + size - radius, y);
  shape.lineTo(x + radius, y);
  shape.quadraticCurveTo(x, y, x, y + radius);
}

export function createWaterOasisShape(
  size = 15.0,
  cornerRadius = 1.0,
  holeSize = 4.4
): Shape {
  const shape = new Shape();
  const half = size / 2;
  const radius = Math.max(0, Math.min(cornerRadius, half));

  buildOuterContour(shape, -half, -half, size, radius);

  if (holeSize > 0 && holeSize < size) {
    const hole = new Path();
    const hHalf = holeSize / 2;
    hole.moveTo(-hHalf, -hHalf);
    hole.lineTo(hHalf, -hHalf);
    hole.lineTo(hHalf, hHalf);
    hole.lineTo(-hHalf, hHalf);
    hole.closePath();
    shape.holes.push(hole);
  }

  return shape;
}

export const EMBANKMENT_SEGMENTS = [
  // 4 outer stone walls along inner edge of the 40 tiles
  { pos: [0, 0.07, -7.65] as const, args: [15.4, 0.14, 0.3] as const },
  { pos: [0, 0.07, 7.65] as const, args: [15.4, 0.14, 0.3] as const },
  { pos: [-7.65, 0.07, 0] as const, args: [0.3, 0.14, 15.0] as const },
  { pos: [7.65, 0.07, 0] as const, args: [0.3, 0.14, 15.0] as const },
  // 4 corner stone piers
  { pos: [-7.65, 0.09, -7.65] as const, args: [0.55, 0.18, 0.55] as const },
  { pos: [7.65, 0.09, -7.65] as const, args: [0.55, 0.18, 0.55] as const },
  { pos: [-7.65, 0.09, 7.65] as const, args: [0.55, 0.18, 0.55] as const },
  { pos: [7.65, 0.09, 7.65] as const, args: [0.55, 0.18, 0.55] as const },
  // Central island pedestal integrating the dice tray
  { pos: [0, 0.025, 0] as const, args: [4.4, 0.07, 4.4] as const },
];

export const LOTUS_CLUSTERS = [
  { pos: [-4.6, 0.055, 4.2] as const },
  { pos: [4.8, 0.055, -4.4] as const },
  { pos: [-4.4, 0.055, -4.6] as const },
  { pos: [4.5, 0.055, 4.5] as const },
];

export const CORNER_BUSHES = [
  { pos: [-6.8, 0.08, -6.8] as const, r: 0.32 },
  { pos: [6.8, 0.08, -6.8] as const, r: 0.28 },
  { pos: [-6.8, 0.08, 6.8] as const, r: 0.3 },
  { pos: [6.8, 0.08, 6.8] as const, r: 0.34 },
];

export function CenterpieceWater(): React.ReactElement {
  const waterShape = useMemo(() => createWaterOasisShape(15.0, 1.0, 4.4), []);

  return (
    <group data-testid="centerpiece-water">
      {/* 1. Đáy hồ sâu thẳm phản chiếu nền xanh lam PBR */}
      <mesh receiveShadow position={[0, 0.01, 0]}>
        <boxGeometry args={[15.0, 0.04, 15.0]} />
        <meshStandardMaterial color="#0369A1" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* 2. Mặt hồ nước nhân tạo phản chiếu môi trường PBR */}
      <mesh
        receiveShadow
        position={[0, WATER_SURFACE_Y, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <shapeGeometry args={[waterShape]} />
        <meshStandardMaterial
          color={WATER_MATERIAL_PROPS.color}
          roughness={WATER_MATERIAL_PROPS.roughness}
          metalness={WATER_MATERIAL_PROPS.metalness}
          transparent={WATER_MATERIAL_PROPS.transparent}
          opacity={WATER_MATERIAL_PROPS.opacity}
        />
      </mesh>

      {/* 3. Khung bờ kè đá sa thạch viền quanh mép hồ & bệ đảo xúc xắc */}
      {EMBANKMENT_SEGMENTS.map((seg, idx) => (
        <mesh
          key={`embankment-${idx}`}
          position={seg.pos}
          receiveShadow
          castShadow
        >
          <boxGeometry args={seg.args} />
          <meshStandardMaterial
            color={EMBANKMENT_MATERIAL_PROPS.color}
            roughness={EMBANKMENT_MATERIAL_PROPS.roughness}
          />
        </mesh>
      ))}

      {/* 4. Khóm hoa sen cách điệu điểm xuyết trên mặt hồ */}
      {LOTUS_CLUSTERS.map((lotus, idx) => (
        <group key={`lotus-${idx}`} position={lotus.pos}>
          {/* Lá sen lớn */}
          <mesh receiveShadow>
            <cylinderGeometry args={[0.26, 0.26, 0.012, 12]} />
            <meshStandardMaterial color="#15803D" roughness={0.4} />
          </mesh>
          {/* Lá sen nhỏ bên cạnh */}
          <mesh position={[0.22, 0.002, 0.12]}>
            <cylinderGeometry args={[0.18, 0.18, 0.01, 12]} />
            <meshStandardMaterial color="#16A34A" roughness={0.4} />
          </mesh>
          {/* Búp hoa sen hồng */}
          <mesh position={[-0.06, 0.06, -0.06]}>
            <coneGeometry args={[0.07, 0.12, 6]} />
            <meshStandardMaterial color="#F472B6" roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* 5. Khóm cây xanh sinh thái điểm xuyết tại các góc bờ kè */}
      {CORNER_BUSHES.map((bush, idx) => (
        <group key={`bush-${idx}`} position={bush.pos}>
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[bush.r, 8, 8]} />
            <meshStandardMaterial color="#166534" roughness={0.8} />
          </mesh>
          <mesh position={[bush.r * 0.25, bush.r * 0.3, 0]}>
            <sphereGeometry args={[bush.r * 0.65, 6, 6]} />
            <meshStandardMaterial color="#22C55E" roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
