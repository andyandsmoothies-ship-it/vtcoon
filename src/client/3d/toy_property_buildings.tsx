// [UI-S02/MSS][BR-UI-002][IMP-93] toy_property_buildings.tsx — Toy Property Buildings (Houses & Hotels)
import React from 'react';

export interface ToyPropertyBuildingsProps {
  readonly level: number;
  readonly groupColor?: string;
  readonly position?: [number, number, number];
  readonly cellIndex?: number;
}

interface ToyHouseMeshProps {
  readonly position?: [number, number, number];
}

interface ToyHotelMeshProps {
  readonly position?: [number, number, number];
}

/**
 * Khối nhà đồ chơi nhựa bóng ngọc lục bảo #10B981 (mái dốc tam giác, ống khói tí hon, gờ cửa sổ dập nổi)
 */
export function ToyHouseMesh({ position = [0, 0, 0] }: ToyHouseMeshProps): React.ReactElement {
  return (
    <group data-testid="toy-house" position={position}>
      {/* Thân nhà nhựa bóng ngọc lục bảo */}
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.22, 0.10, 0.16]} />
        <meshStandardMaterial color="#10B981" roughness={0.15} metalness={0.1} />
      </mesh>

      {/* Mái dốc tam giác */}
      <mesh position={[0, 0.13, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.22, 3]} />
        <meshStandardMaterial color="#10B981" roughness={0.15} metalness={0.1} />
      </mesh>

      {/* Ống khói tí hon */}
      <mesh position={[0.06, 0.16, 0.04]} castShadow>
        <boxGeometry args={[0.035, 0.06, 0.035]} />
        <meshStandardMaterial color="#059669" roughness={0.25} metalness={0.05} />
      </mesh>

      {/* Gờ cửa sổ dập nổi */}
      <mesh position={[0, 0.05, 0.082]}>
        <boxGeometry args={[0.12, 0.05, 0.008]} />
        <meshStandardMaterial color="#34D399" roughness={0.2} metalness={0.1} />
      </mesh>
    </group>
  );
}

/**
 * Khối khách sạn đỏ Ruby #DC2626 (kích thước lớn gấp đôi, tháp mái vát, viền vàng hoàng kim #F59E0B)
 */
export function ToyHotelMesh({ position = [0, 0, 0] }: ToyHotelMeshProps): React.ReactElement {
  return (
    <group data-testid="toy-hotel" position={position}>
      {/* Thân khách sạn đỏ Ruby đồ chơi bề thế */}
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.46, 0.16, 0.20]} />
        <meshStandardMaterial color="#DC2626" roughness={0.15} metalness={0.1} />
      </mesh>

      {/* Tháp mái vát trung tâm */}
      <mesh position={[0, 0.20, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.14, 0.10, 4]} />
        <meshStandardMaterial color="#DC2626" roughness={0.15} metalness={0.1} />
      </mesh>

      {/* Đường viền vàng hoàng kim kim loại #F59E0B */}
      <mesh position={[0, 0.165, 0]}>
        <boxGeometry args={[0.47, 0.015, 0.21]} />
        <meshStandardMaterial color="#F59E0B" roughness={0.2} metalness={0.85} />
      </mesh>

      {/* Gờ cửa sổ & ban công khách sạn sang trọng */}
      <mesh position={[0, 0.08, 0.102]}>
        <boxGeometry args={[0.38, 0.06, 0.008]} />
        <meshStandardMaterial color="#F59E0B" roughness={0.25} metalness={0.6} />
      </mesh>
    </group>
  );
}

/**
 * Cụm nhà/khách sạn đồ chơi trên dải màu đỉnh ô cờ
 */
export function ToyPropertyBuildings({
  level,
  position = [0, 0.125, -0.80],
}: ToyPropertyBuildingsProps): React.ReactElement | null {
  if (level <= 0) {
    return null;
  }

  return (
    <group position={position} data-testid="toy-property-building">
      {level === 1 && <ToyHouseMesh position={[0, 0, 0]} />}
      {level === 2 && (
        <>
          <ToyHouseMesh position={[-0.18, 0, 0]} />
          <ToyHouseMesh position={[0.18, 0, 0]} />
        </>
      )}
      {level >= 3 && <ToyHotelMesh position={[0, 0, 0]} />}
    </group>
  );
}
