// [TC-P3.9/MSS] luxury_pawn_models.tsx — 4 Linh Vật Cờ Thượng Lưu mạ kim loại PBR tinh xảo
import React from 'react';

export interface LuxuryPawnConfig {
  readonly slot: number;
  readonly name: string;
  readonly title: string;
  readonly color: string;
  readonly metalness: number;
  readonly roughness: number;
}

export const LUXURY_PAWN_CONFIGS: readonly LuxuryPawnConfig[] = [
  {
    slot: 0,
    name: 'Tượng Tháp Landmark Hoàng Gia',
    title: 'Đại Gia Sài Gòn (Host)',
    color: '#F59E0B',
    metalness: 0.95,
    roughness: 0.12,
  },
  {
    slot: 1,
    name: 'Tượng Du Thuyền Vịnh Biển',
    title: 'Chú Sáu',
    color: '#E2E8F0',
    metalness: 0.9,
    roughness: 0.15,
  },
  {
    slot: 2,
    name: 'Tượng Xe Cổ Cổ Điển',
    title: 'Cô Tư',
    color: '#B45309',
    metalness: 0.85,
    roughness: 0.18,
  },
  {
    slot: 3,
    name: 'Tượng Ngựa Chiến Kỳ Hạm',
    title: 'Bé Bo',
    color: '#1E3A8A',
    metalness: 0.9,
    roughness: 0.14,
  },
] as const;

/**
 * Tượng Tháp Landmark thu nhỏ mạ Vàng Hoàng Gia (Slot 0)
 */
export function LandmarkTowerPawn({ config }: { config: LuxuryPawnConfig }): React.ReactElement {
  return (
    <group position={[0, 0, 0]}>
      {/* Bệ đế kim loại vát cạnh */}
      <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.2, 0.04, 32]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>
      <mesh position={[0, 0.045, 0]}>
        <cylinderGeometry args={[0.15, 0.17, 0.015, 32]} />
        <meshStandardMaterial color="#FBBF24" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Thân tháp chính 8 mặt thuôn dài vút cao */}
      <mesh position={[0, 0.18, 0]} castShadow>
        <cylinderGeometry args={[0.075, 0.12, 0.26, 8]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>

      {/* 4 cột trụ vệ tinh giật cấp quanh thân */}
      {[-0.075, 0.075].map((x) =>
        [-0.075, 0.075].map((z) => (
          <mesh key={`col-${x}-${z}`} position={[x, 0.14, z]} castShadow>
            <cylinderGeometry args={[0.022, 0.032, 0.18, 6]} />
            <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
          </mesh>
        ))
      )}

      {/* Đỉnh tháp giật cấp hình kim cương vát cạnh */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.07, 0.1, 6]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>

      {/* Kim thu lôi mạ vàng vươn thẳng */}
      <mesh position={[0, 0.44, 0]} castShadow>
        <cylinderGeometry args={[0.005, 0.018, 0.1, 12]} />
        <meshStandardMaterial color="#FEF08A" metalness={0.98} roughness={0.08} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <octahedronGeometry args={[0.018]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#F59E0B" emissiveIntensity={1.2} />
      </mesh>
    </group>
  );
}

/**
 * Tượng Du Thuyền Vịnh Biển mạ Bạc Bạch Kim (Slot 1)
 */
export function BayYachtPawn({ config }: { config: LuxuryPawnConfig }): React.ReactElement {
  return (
    <group position={[0, 0, 0]}>
      {/* Bệ đế kim loại mạ bạc */}
      <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.2, 0.04, 32]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>

      {/* Thân vỏ du thuyền khí động học vuốt nhọn (Hull) */}
      <mesh position={[0, 0.08, -0.02]} castShadow>
        <boxGeometry args={[0.15, 0.08, 0.34]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>
      {/* Mũi tàu vuốt nhọn vươn về phía trước */}
      <mesh position={[0, 0.08, 0.18]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[0.075, 0.12, 4]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>

      {/* Boong tàu tầng 1 (Main Deck) */}
      <mesh position={[0, 0.14, 0.01]} castShadow>
        <boxGeometry args={[0.12, 0.05, 0.22]} />
        <meshStandardMaterial color="#F8FAFC" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Buồng lái Flybridge tầng 2 */}
      <mesh position={[0, 0.18, -0.02]} castShadow>
        <boxGeometry args={[0.08, 0.04, 0.14]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>

      {/* Kính boong tàu nhuộm khói sang trọng */}
      <mesh position={[0, 0.17, 0.04]}>
        <boxGeometry args={[0.076, 0.025, 0.04]} />
        <meshPhysicalMaterial color="#38BDF8" transparent opacity={0.65} roughness={0.1} metalness={0.5} />
      </mesh>

      {/* Cột Radar vòm vòm du thuyền */}
      <mesh position={[0, 0.24, -0.06]}>
        <cylinderGeometry args={[0.006, 0.01, 0.08, 12]} />
        <meshStandardMaterial color="#94A3B8" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.28, -0.06]}>
        <boxGeometry args={[0.08, 0.012, 0.018]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>
    </group>
  );
}

const CLASSIC_CAR_WHEEL_OFFSETS: readonly (readonly [number, number])[] = [
  [-0.09, 0.1],
  [0.09, 0.1],
  [-0.09, -0.1],
  [0.09, -0.1],
] as const;

/**
 * Tượng Xe Cổ Cổ Điển mạ Đồng Đỏ (Slot 2)
 */
export function ClassicCarPawn({ config }: { config: LuxuryPawnConfig }): React.ReactElement {
  return (
    <group position={[0, 0, 0]}>
      {/* Bệ đế kim loại mạ đồng */}
      <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.2, 0.04, 32]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>

      {/* Thân xe cổ thuôn dài dạng Roadster 1930s */}
      <mesh position={[0, 0.09, 0]} castShadow>
        <boxGeometry args={[0.14, 0.065, 0.32]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>

      {/* Ca-pô trước kéo dài */}
      <mesh position={[0, 0.09, 0.08]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.07, 0.16, 16]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>

      {/* Lưới tản nhiệt mạ kim loại dọc cổ điển */}
      <mesh position={[0, 0.09, 0.165]}>
        <boxGeometry args={[0.09, 0.06, 0.015]} />
        <meshStandardMaterial color="#D97706" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* 4 bánh xe vành căm cổ điển */}
      {CLASSIC_CAR_WHEEL_OFFSETS.map(([x, z], i) => (
        <mesh key={`wheel-${i}`} position={[x, 0.06, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.045, 0.045, 0.025, 16]} />
          <meshStandardMaterial color="#1C1917" roughness={0.6} metalness={0.4} />
        </mesh>
      ))}

      {/* Kính chắn gió mui trần nghiêng */}
      <mesh position={[0, 0.14, -0.01]} rotation={[-0.35, 0, 0]}>
        <boxGeometry args={[0.11, 0.04, 0.01]} />
        <meshPhysicalMaterial color="#FEF3C7" transparent opacity={0.6} roughness={0.1} />
      </mesh>

      {/* Cặp đèn pha tròn cổ điển mạ vàng */}
      {[-0.05, 0.05].map((x) => (
        <mesh key={`headlight-${x}`} position={[x, 0.1, 0.17]}>
          <sphereGeometry args={[0.02, 12, 12]} />
          <meshStandardMaterial color="#FEF08A" emissive="#FDE047" emissiveIntensity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Tượng Ngựa Chiến / Kỳ Hạm mạ Titan Xanh Navy (Slot 3)
 */
export function WarhorsePawn({ config }: { config: LuxuryPawnConfig }): React.ReactElement {
  return (
    <group position={[0, 0, 0]}>
      {/* Bệ đế quân cờ vát tròn cổ điển */}
      <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.2, 0.04, 32]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>
      <mesh position={[0, 0.045, 0]}>
        <torusGeometry args={[0.14, 0.015, 12, 32]} />
        <meshStandardMaterial color="#38BDF8" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Cổ và ức ngựa vươn cao đa diện */}
      <mesh position={[0, 0.16, -0.02]} rotation={[0.22, 0, 0]} castShadow>
        <cylinderGeometry args={[0.065, 0.11, 0.22, 6]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>

      {/* Đầu ngựa chiến điêu khắc góc cạnh */}
      <mesh position={[0, 0.28, 0.05]} rotation={[0.38, 0, 0]} castShadow>
        <boxGeometry args={[0.09, 0.1, 0.16]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>

      {/* Mõm ngựa thon gọn kiêu hãnh */}
      <mesh position={[0, 0.23, 0.12]} rotation={[0.45, 0, 0]} castShadow>
        <boxGeometry args={[0.075, 0.07, 0.09]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>

      {/* Đôi tai ngựa vểnh sắc nhọn */}
      {[-0.032, 0.032].map((x) => (
        <mesh key={`ear-${x}`} position={[x, 0.35, 0.01]} rotation={[-0.2, 0, x > 0 ? -0.15 : 0.15]} castShadow>
          <coneGeometry args={[0.018, 0.055, 4]} />
          <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
        </mesh>
      ))}

      {/* Bờm chiến đa diện gân guốc sau gáy */}
      {[-0.04, 0.01, 0.06].map((z, i) => (
        <mesh key={`mane-${i}`} position={[0, 0.23 + i * 0.05, z - 0.07]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.03, 0.04, 0.04]} />
          <meshStandardMaterial color="#60A5FA" metalness={0.92} roughness={0.12} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Component hiển thị linh vật cờ thượng lưu tương ứng với từng slot người chơi
 */
export function LuxuryPawnModel({ slotIndex }: { slotIndex: number }): React.ReactElement {
  const normalized = Number.isFinite(slotIndex) ? Math.floor(slotIndex) : 0;
  const safeIdx = Math.max(0, Math.min(3, normalized));
  const config = LUXURY_PAWN_CONFIGS[safeIdx] ?? LUXURY_PAWN_CONFIGS[0]!;

  return (
    <group position={[0, 0, 0]}>
      {safeIdx === 0 && <LandmarkTowerPawn config={config} />}
      {safeIdx === 1 && <BayYachtPawn config={config} />}
      {safeIdx === 2 && <ClassicCarPawn config={config} />}
      {safeIdx === 3 && <WarhorsePawn config={config} />}
    </group>
  );
}
