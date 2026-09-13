// [UI-S03/MSS] SurveyorPlotBoundary — Cấp 0: Khu Đất Quy Hoạch Thu Nhỏ
import React from 'react';

const BOUNDARY_PEG_OFFSETS: ReadonlyArray<readonly [number, number]> = [
  [-0.24, -0.19],
  [0.24, -0.19],
  [-0.24, 0.19],
  [0.24, 0.19],
];

export interface SurveyorPlotBoundaryProps {
  readonly groupColor: string;
}

/**
 * Cấp 0: Khu Đất Quy Hoạch Thu Nhỏ (Surveyor Plot Boundary)
 */
export function SurveyorPlotBoundary({ groupColor }: SurveyorPlotBoundaryProps): React.ReactElement {
  return (
    <group position={[0, 0, 0]}>
      {/* Bệ sa thạch phẳng viền quanh ô đất */}
      <mesh position={[0, 0.008, 0]} receiveShadow>
        <boxGeometry args={[0.58, 0.016, 0.48]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.7} />
      </mesh>

      {/* 4 Cọc mốc chỉ giới bê tông cắm tại 4 góc ô đất (sơn sọc Đỏ - Trắng) */}
      {BOUNDARY_PEG_OFFSETS.map(([px, pz], i) => (
        <group key={`peg-${i}`} position={[px, 0.04, pz]}>
          <mesh castShadow receiveShadow position={[0, 0, 0]}>
            <cylinderGeometry args={[0.018, 0.024, 0.08, 6]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.02, 0.022, 0.025, 6]} />
            <meshStandardMaterial color="#DC2626" roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Dây căng mốc chỉ giới mạ vàng đồng viền quanh 4 cọc */}
      <mesh position={[0, 0.065, -0.19]}>
        <boxGeometry args={[0.48, 0.006, 0.006]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.065, 0.19]}>
        <boxGeometry args={[0.48, 0.006, 0.006]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-0.24, 0.065, 0]}>
        <boxGeometry args={[0.006, 0.006, 0.38]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.24, 0.065, 0]}>
        <boxGeometry args={[0.006, 0.006, 0.38]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Biển cọc gỗ cắm tí hon: Bảng mốc quy hoạch thương mại */}
      <group position={[0, 0.07, 0.05]} rotation={[0.08, 0, 0]}>
        <mesh castShadow position={[0, 0, 0]}>
          <cylinderGeometry args={[0.008, 0.01, 0.12, 6]} />
          <meshStandardMaterial color="#78350F" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.06, 0.008]} castShadow>
          <boxGeometry args={[0.2, 0.08, 0.015]} />
          <meshStandardMaterial color="#FEF3C7" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.085, 0.016]}>
          <boxGeometry args={[0.18, 0.015, 0.004]} />
          <meshStandardMaterial color={groupColor} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}
