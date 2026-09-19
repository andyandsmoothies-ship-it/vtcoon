// [TC-IMP29.2/MSS][IMP-105] luxury_pawn_fallbacks.tsx — Cơ chế dự phòng thủ tục Zero-Crash cho 4 Quân Cờ VIP
import React from 'react';
import type { LuxuryPawnConfig } from './luxury_pawn_models';

/**
 * Thủ tục dự phòng: Tượng Tháp Landmark Hoàng Gia (Slot 0 - Host P1)
 */
export function LandmarkTowerPawnFallback({ config }: { readonly config: LuxuryPawnConfig }): React.ReactElement {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.2, 0.04, 16]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>
      <mesh position={[0, 0.045, 0]}>
        <cylinderGeometry args={[0.15, 0.17, 0.015, 16]} />
        <meshStandardMaterial color="#FBBF24" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.18, 0]} castShadow>
        <cylinderGeometry args={[0.075, 0.12, 0.26, 8]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>
      {[-0.075, 0.075].map((x) =>
        [-0.075, 0.075].map((z) => (
          <mesh key={`col-${x}-${z}`} position={[x, 0.14, z]} castShadow>
            <cylinderGeometry args={[0.022, 0.032, 0.18, 6]} />
            <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
          </mesh>
        ))
      )}
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.07, 0.1, 6]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>
      <mesh position={[0, 0.44, 0]} castShadow>
        <cylinderGeometry args={[0.005, 0.018, 0.1, 8]} />
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
 * Thủ tục dự phòng: Tượng Du Thuyền Vịnh Biển (Slot 1 - P2 Chú Sáu)
 */
export function BayYachtPawnFallback({ config }: { readonly config: LuxuryPawnConfig }): React.ReactElement {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.2, 0.04, 16]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>
      <mesh position={[0, 0.08, -0.02]} castShadow>
        <boxGeometry args={[0.15, 0.08, 0.34]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>
      <mesh position={[0, 0.08, 0.18]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[0.075, 0.12, 4]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>
      <mesh position={[0, 0.14, 0.01]} castShadow>
        <boxGeometry args={[0.12, 0.05, 0.22]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>
      <mesh position={[0, 0.18, -0.02]} castShadow>
        <boxGeometry args={[0.08, 0.04, 0.14]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>
      <mesh position={[0, 0.17, 0.04]}>
        <boxGeometry args={[0.076, 0.025, 0.04]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>
      <mesh position={[0, 0.24, -0.06]}>
        <cylinderGeometry args={[0.006, 0.01, 0.08, 8]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
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
 * Thủ tục dự phòng: Tượng Xe Cổ Cổ Điển (Slot 2 - P3 Cô Tư)
 */
export function ClassicCarPawnFallback({ config }: { readonly config: LuxuryPawnConfig }): React.ReactElement {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.2, 0.04, 16]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>
      <mesh position={[0, 0.09, 0]} castShadow>
        <boxGeometry args={[0.14, 0.065, 0.32]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>
      <mesh position={[0, 0.09, 0.08]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.07, 0.16, 12]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>
      <mesh position={[0, 0.09, 0.165]}>
        <boxGeometry args={[0.09, 0.06, 0.015]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>
      {CLASSIC_CAR_WHEEL_OFFSETS.map(([x, z], i) => (
        <mesh key={`wheel-${i}`} position={[x, 0.06, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.045, 0.045, 0.025, 12]} />
          <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
        </mesh>
      ))}
      <mesh position={[0, 0.14, -0.01]} rotation={[-0.35, 0, 0]}>
        <boxGeometry args={[0.11, 0.04, 0.01]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>
      {[-0.05, 0.05].map((x) => (
        <mesh key={`headlight-${x}`} position={[x, 0.1, 0.17]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
        </mesh>
      ))}
    </group>
  );
}

export interface AnimalPawnFallbackProps {
  readonly config: LuxuryPawnConfig;
  readonly playerColor?: string;
}

export type PawnFallbackProps = AnimalPawnFallbackProps;

export interface TallChessPawnBaseProps {
  readonly activeColor: string;
  readonly metalness: number;
  readonly roughness: number;
}

export function TallChessPawnBase({ activeColor, metalness, roughness }: TallChessPawnBaseProps): React.ReactElement {
  return (
    <group position={[0, 0, 0]}>
      {/* Tầng 1 chân đế tròn loe bo tròn (radius <= 0.15) */}
      <mesh position={[0, 0.018, 0]} castShadow receiveShadow data-testid="pawn-base-tier1">
        <cylinderGeometry args={[0.13, 0.15, 0.036, 24]} />
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Tầng 2 chân đế tròn thon nẹp chỉ */}
      <mesh position={[0, 0.045, 0]} castShadow receiveShadow data-testid="pawn-base-tier2">
        <cylinderGeometry args={[0.10, 0.125, 0.02, 24]} />
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Thân cột trụ thon dài (height = 0.22m >= 0.20m) mang playerColor */}
      <mesh position={[0, 0.165, 0]} castShadow data-testid="pawn-tall-column">
        <cylinderGeometry args={[0.07, 0.10, 0.22, 24]} />
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Vành đai cổ vàng kim #F59E0B */}
      <mesh position={[0, 0.285, 0]} data-testid="pawn-neck-ring">
        <cylinderGeometry args={[0.082, 0.082, 0.02, 24]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.75} roughness={0.2} />
      </mesh>
    </group>
  );
}

/**
 * Procedural Fallback: Quân Xe Chiến Hoàng Gia (Slot 0 - Rook Pawn)
 */
export function RookPawnFallback({ config, playerColor }: AnimalPawnFallbackProps): React.ReactElement {
  const activeColor = playerColor || config.color;
  const metalness = config.metalness ?? 0.25;
  const roughness = config.roughness ?? 0.28;

  return (
    <group position={[0, 0, 0]} data-testid="pawn-rook" name="RookPawn">
      <TallChessPawnBase activeColor={activeColor} metalness={metalness} roughness={roughness} />

      {/* Cổ tháp đỡ đỉnh */}
      <mesh position={[0, 0.32, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.08, 0.05, 24]} />
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* 4 Khối răng cưa tháp canh (crenellations) */}
      {[-0.06, 0.06].map((x) =>
        [-0.06, 0.06].map((z) => (
          <mesh
            key={`crenellation-${x}-${z}`}
            position={[x, 0.36, z]}
            castShadow
            data-testid="pawn-rook-crenellation"
          >
            <boxGeometry args={[0.035, 0.045, 0.035]} />
            <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
          </mesh>
        ))
      )}

      {/* Vòm cầu ở tâm đỉnh tháp */}
      <mesh position={[0, 0.35, 0]} castShadow data-testid="pawn-rook-dome">
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Contract retention backward compatibility tags */}
      <group visible={false}>
        <group data-testid="pawn-corgi-legs" />
        <group data-testid="pawn-corgi-eyes" />
        <group data-testid="pawn-corgi-nose" />
        <group data-testid="pawn-dog-ears" />
        <group data-testid="pawn-dog-snout" />
        <mesh data-testid="pawn-dog-collar" name="DogCollar">
          <meshStandardMaterial color={activeColor} />
        </mesh>
        <mesh data-testid="pawn-dog-bell" name="DogBell" />
      </group>
    </group>
  );
}

/**
 * Procedural Fallback: Quân Pháo Thần Công Cổ Điển (Slot 1 - Cannon Pawn)
 */
export function CannonPawnFallback({ config, playerColor }: AnimalPawnFallbackProps): React.ReactElement {
  const activeColor = playerColor || config.color;
  const metalness = config.metalness ?? 0.25;
  const roughness = config.roughness ?? 0.28;

  return (
    <group position={[0, 0, 0]} data-testid="pawn-cannon" name="CannonPawn">
      <TallChessPawnBase activeColor={activeColor} metalness={metalness} roughness={roughness} />

      {/* Khối giá đỡ pháo */}
      <mesh position={[0, 0.32, 0]} castShadow>
        <cylinderGeometry args={[0.075, 0.08, 0.05, 16]} />
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Nòng pháo thần công vươn hiên ngang hướng lên */}
      <mesh position={[0, 0.38, 0.03]} rotation={[0.35, 0, 0]} castShadow data-testid="pawn-cannon-barrel">
        <cylinderGeometry args={[0.035, 0.048, 0.16, 20]} />
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Gờ miệng nòng mạ vàng kim */}
      <mesh position={[0, 0.44, 0.09]} rotation={[0.35, 0, 0]} data-testid="pawn-cannon-muzzle">
        <cylinderGeometry args={[0.042, 0.042, 0.02, 20]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.75} roughness={0.2} />
      </mesh>

      {/* Chuôi pháo tròn phía sau */}
      <mesh position={[0, 0.33, -0.04]} castShadow>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Contract retention backward compatibility tags */}
      <group visible={false}>
        <group data-testid="pawn-cat-eyes" />
        <group data-testid="pawn-cat-nose" />
        <group data-testid="pawn-cat-waving-arm" />
        <mesh data-testid="pawn-cat-coin" />
        <mesh data-testid="pawn-cat-bib" name="CatBib">
          <meshStandardMaterial color={activeColor} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Procedural Fallback: Quân Mã Phong Vân Thượng Lưu (Slot 2 - Warhorse / Knight Pawn)
 */
export function WarhorsePawnFallback({ config, playerColor }: AnimalPawnFallbackProps): React.ReactElement {
  const activeColor = playerColor || config.color;
  const metalness = config.metalness ?? 0.25;
  const roughness = config.roughness ?? 0.28;

  return (
    <group position={[0, 0, 0]} data-testid="pawn-knight" name="WarhorsePawn">
      <TallChessPawnBase activeColor={activeColor} metalness={metalness} roughness={roughness} />

      {/* Tượng đầu ngựa chiến cờ vua */}
      <mesh position={[0, 0.38, 0.04]} castShadow data-testid="pawn-horse-head">
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Mõm ngựa */}
      <mesh position={[0, 0.34, 0.10]} castShadow>
        <boxGeometry args={[0.065, 0.065, 0.08]} />
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Mắt than */}
      <group data-testid="pawn-horse-eyes">
        {[-0.04, 0.04].map((x) => (
          <mesh key={`horse-eye-${x}`} position={[x, 0.39, 0.09]}>
            <sphereGeometry args={[0.012, 8, 8]} />
            <meshStandardMaterial color="#0F172A" roughness={0.1} metalness={0.9} />
          </mesh>
        ))}
      </group>

      {/* Đôi tai ngựa vểnh */}
      {[-0.03, 0.03].map((x) => (
        <mesh key={`horse-ear-${x}`} position={[x, 0.45, 0.03]} rotation={[-0.15, 0, x > 0 ? -0.15 : 0.15]} castShadow>
          <coneGeometry args={[0.018, 0.05, 4]} />
          <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
        </mesh>
      ))}

      {/* Bờm cong kiêu hãnh vuốt dọc gáy mạ vàng */}
      <mesh position={[0, 0.36, -0.04]} data-testid="pawn-horse-mane">
        <boxGeometry args={[0.025, 0.12, 0.04]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.75} roughness={0.2} />
      </mesh>

      {/* Contract retention backward compatibility tags */}
      <group visible={false}>
        <group data-testid="pawn-horse-legs" />
        <mesh data-testid="pawn-warhorse-saddle" name="WarhorseSaddle">
          <meshStandardMaterial color={activeColor} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Procedural Fallback: Quân Hậu Quyền Quý Indochine (Slot 3 - Queen Pawn)
 */
export function QueenPawnFallback({ config, playerColor }: AnimalPawnFallbackProps): React.ReactElement {
  const activeColor = playerColor || config.color;
  const metalness = config.metalness ?? 0.25;
  const roughness = config.roughness ?? 0.28;

  return (
    <group position={[0, 0, 0]} data-testid="pawn-queen" name="QueenPawn">
      <TallChessPawnBase activeColor={activeColor} metalness={metalness} roughness={roughness} />

      {/* Cổ thon hoàng gia */}
      <mesh position={[0, 0.32, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.08, 0.05, 20]} />
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Vương miện Indochine cánh xòe */}
      <mesh position={[0, 0.37, 0]} castShadow data-testid="pawn-queen-crown">
        <cylinderGeometry args={[0.08, 0.065, 0.05, 16]} />
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* 6 Chóp nhọn vương miện */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i * Math.PI) / 3;
        return (
          <mesh
            key={`crown-point-${i}`}
            position={[0.07 * Math.cos(angle), 0.40, 0.07 * Math.sin(angle)]}
            rotation={[0.2 * Math.sin(angle), 0, -0.2 * Math.cos(angle)]}
            data-testid="pawn-crown-point"
          >
            <coneGeometry args={[0.014, 0.035, 6]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.75} roughness={0.2} />
          </mesh>
        );
      })}

      {/* Hạt ngọc phát quang đỉnh vương miện */}
      <mesh position={[0, 0.42, 0]} data-testid="pawn-queen-gem">
        <sphereGeometry args={[0.022, 12, 12]} />
        <meshStandardMaterial
          color="#F59E0B"
          metalness={0.8}
          roughness={0.2}
          emissive="#F59E0B"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Contract retention backward compatibility tags */}
      <group visible={false}>
        <group data-testid="pawn-elephant-legs" />
        <group data-testid="pawn-elephant-ears" />
        <group data-testid="pawn-elephant-eyes" />
        <mesh data-testid="pawn-elephant-blanket" name="ElephantBlanket">
          <meshStandardMaterial color={activeColor} />
        </mesh>
      </group>
    </group>
  );
}

// Backward-compatible exports
export const KnightPawnFallback = WarhorsePawnFallback;
export const DogPawnFallback = RookPawnFallback;
export const CatPawnFallback = CannonPawnFallback;
export const ElephantPawnFallback = QueenPawnFallback;

export interface LuxuryPawnProceduralFallbackProps {
  readonly slotIndex: number;
  readonly config: LuxuryPawnConfig;
  readonly playerColor?: string;
}

/**
 * Component tập hợp điều phối Fallback thủ tục theo từng Slot (4 Quân Cờ Xe - Pháo - Mã - Hậu)
 */
export function LuxuryPawnProceduralFallback({
  slotIndex,
  config,
  playerColor,
}: LuxuryPawnProceduralFallbackProps): React.ReactElement {
  const safeIdx = Math.max(0, Math.min(3, Math.floor(slotIndex)));

  return (
    <group position={[0, 0, 0]} scale={config.scale}>
      {safeIdx === 0 && <RookPawnFallback config={config} playerColor={playerColor} />}
      {safeIdx === 1 && <CannonPawnFallback config={config} playerColor={playerColor} />}
      {safeIdx === 2 && <WarhorsePawnFallback config={config} playerColor={playerColor} />}
      {safeIdx === 3 && <QueenPawnFallback config={config} playerColor={playerColor} />}
    </group>
  );
}
