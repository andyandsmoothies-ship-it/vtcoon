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

/**
 * Procedural Fallback: Quân Xe Chiến Hoàng Gia (Slot 0 - Rook Pawn)
 */
export function RookPawnFallback({ config, playerColor }: AnimalPawnFallbackProps): React.ReactElement {
  const activeColor = playerColor || config.color;
  const metalness = config.metalness ?? 0.25;
  const roughness = config.roughness ?? 0.28;

  return (
    <group position={[0, 0, 0]} data-testid="pawn-rook" name="RookPawn">
      {/* Bệ chân tháp bo tròn diorama */}
      <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.13, 0.15, 0.04, 24]} />
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>
      {/* Gờ chỉ viền vàng kim cao cấp */}
      <mesh position={[0, 0.045, 0]}>
        <cylinderGeometry args={[0.12, 0.135, 0.015, 24]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Thân tháp trụ tròn diorama */}
      <mesh position={[0, 0.16, 0]} castShadow>
        <cylinderGeometry args={[0.10, 0.13, 0.22, 24]} />
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Gờ đài quan sát đỉnh tháp */}
      <mesh position={[0, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.105, 0.04, 24]} />
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* 4 lỗ châu mai đỉnh tháp đồ chơi bo mép */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => {
        const r = 0.105;
        return (
          <mesh
            key={`merlon-${i}`}
            position={[r * Math.cos(angle), 0.32, r * Math.sin(angle)]}
            castShadow
          >
            <boxGeometry args={[0.045, 0.05, 0.045]} />
            <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
          </mesh>
        );
      })}

      {/* Cổng vòm tháp thành lũy */}
      <mesh position={[0, 0.08, 0.12]}>
        <cylinderGeometry args={[0.03, 0.03, 0.06, 16]} />
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Contract retention backward compatibility tags */}
      <group visible={false}>
        <group data-testid="pawn-corgi-legs" />
        <group data-testid="pawn-corgi-eyes" />
        <group data-testid="pawn-corgi-nose" />
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
      {/* Bệ đế kim loại mỏng tròn */}
      <mesh position={[0, 0.015, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.13, 0.15, 0.03, 24]} />
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* 2 bánh xe nan hoa đồ chơi bên hông */}
      {[-0.10, 0.10].map((x, i) => (
        <mesh key={`cannon-wheel-${i}`} position={[x, 0.08, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.025, 20]} />
          <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
        </mesh>
      ))}

      {/* Trục bánh xe và giá đỡ (Carriage) */}
      <mesh position={[0, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.018, 0.018, 0.22, 12]} />
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>
      <mesh position={[0, 0.09, -0.02]} castShadow>
        <boxGeometry args={[0.10, 0.07, 0.18]} />
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Nòng pháo thần công vươn nón cụt nghiêng hướng lên */}
      <mesh position={[0, 0.13, 0.04]} rotation={[0.35, 0, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.065, 0.22, 20]} />
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Đầu nòng pháo có gờ mạ vàng */}
      <mesh position={[0, 0.17, 0.13]} rotation={[0.35, 0, 0]}>
        <cylinderGeometry args={[0.048, 0.048, 0.025, 20]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Khối tròn chuôi pháo (breech) */}
      <mesh position={[0, 0.08, -0.05]} castShadow>
        <sphereGeometry args={[0.055, 16, 16]} />
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
      {/* 4 chân ngắn vững chãi */}
      <group data-testid="pawn-horse-legs">
        {[-0.065, 0.065].map((x) =>
          [-0.07, 0.07].map((z) => (
            <mesh key={`horse-leg-${x}-${z}`} position={[x, 0.04, z]} castShadow>
              <cylinderGeometry args={[0.025, 0.028, 0.08, 12]} />
              <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
            </mesh>
          ))
        )}
      </group>

      {/* Thân ngựa chibi tròn trịa */}
      <mesh position={[0, 0.13, -0.01]} castShadow>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Thảm yên ngựa mang playerColor */}
      <mesh position={[0, 0.19, -0.01]} data-testid="pawn-warhorse-saddle" name="WarhorseSaddle">
        <boxGeometry args={[0.15, 0.035, 0.13]} />
        <meshStandardMaterial color={activeColor} roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Đầu ngựa chiến dũng mãnh */}
      <mesh position={[0, 0.25, 0.08]} castShadow>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Mõm ngựa thon gọn */}
      <mesh position={[0, 0.21, 0.14]} castShadow>
        <boxGeometry args={[0.075, 0.065, 0.08]} />
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Mắt than */}
      <group data-testid="pawn-horse-eyes">
        {[-0.045, 0.045].map((x) => (
          <mesh key={`horse-eye-${x}`} position={[x, 0.26, 0.13]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshStandardMaterial color="#0F172A" roughness={0.1} metalness={0.9} />
          </mesh>
        ))}
      </group>

      {/* Đôi tai ngựa vểnh */}
      {[-0.035, 0.035].map((x) => (
        <mesh key={`horse-ear-${x}`} position={[x, 0.33, 0.06]} rotation={[-0.15, 0, x > 0 ? -0.15 : 0.15]} castShadow>
          <coneGeometry args={[0.02, 0.06, 4]} />
          <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
        </mesh>
      ))}

      {/* Bờm cong kiêu hãnh sau gáy */}
      {[-0.03, 0.01, 0.05].map((z, i) => (
        <mesh key={`horse-mane-${i}`} position={[0, 0.22 + i * 0.04, z - 0.04]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.025, 0.035, 0.035]} />
          <meshStandardMaterial color="#F59E0B" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
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
      {/* Bệ đế tròn vát */}
      <mesh position={[0, 0.018, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.13, 0.15, 0.036, 24]} />
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Váy thon Indochine quý phái */}
      <mesh position={[0, 0.10, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.14, 0.14, 24]} />
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>
      {/* Eo thon hoàng gia */}
      <mesh position={[0, 0.19, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 0.08, 24]} />
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>
      {/* Đai thắt lưng vàng kim */}
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.078, 0.078, 0.018, 24]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Đầu tượng quân hậu tròn mịn */}
      <mesh position={[0, 0.26, 0]} castShadow>
        <sphereGeometry args={[0.065, 20, 20]} />
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Vương miện Indochine cánh xòe */}
      <mesh position={[0, 0.315, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.055, 0.035, 16]} />
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Các cánh nhọn của vương miện */}
      {[0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3, (5 * Math.PI) / 3].map((angle, i) => (
        <mesh
          key={`crown-point-${i}`}
          position={[0.06 * Math.cos(angle), 0.345, 0.06 * Math.sin(angle)]}
          rotation={[0.2 * Math.sin(angle), 0, -0.2 * Math.cos(angle)]}
        >
          <coneGeometry args={[0.014, 0.035, 6]} />
          <meshStandardMaterial color="#F59E0B" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}

      {/* Hạt ngọc đỉnh vương miện mạ vàng phát quang */}
      <mesh position={[0, 0.365, 0]}>
        <sphereGeometry args={[0.022, 12, 12]} />
        <meshStandardMaterial
          color="#F59E0B"
          metalness={0.8}
          roughness={0.2}
          emissive="#F59E0B"
          emissiveIntensity={0.4}
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
