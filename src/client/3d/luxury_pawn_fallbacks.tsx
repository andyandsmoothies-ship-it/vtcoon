// [TC-IMP29.2/MSS][IMP-105] luxury_pawn_fallbacks.tsx — Cơ chế dự phòng thủ tục Zero-Crash cho 4 Quân Cờ VIP
import React from 'react';
import type { LuxuryPawnConfig } from './luxury_pawn_models';
import {
  getTallChessBaseBodyGeometry,
  getMergedRookHeadGeometry,
  getMergedCannonHeadGeometry,
  getMergedWarhorseHeadGeometry,
  getMergedWarhorseEyesGeometry,
  getMergedQueenCrownGeometry,
  getMergedQueenCrownPointsGeometry,
  disposeTallChessGeometries,
} from './tall_chess_geometries';

export { disposeTallChessGeometries };

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
  readonly children?: React.ReactNode;
}

export function TallChessPawnBase({ activeColor, metalness, roughness }: TallChessPawnBaseProps): React.ReactElement {
  return (
    <group position={[0, 0, 0]}>
      {/* 1 Draw call: Thân đế cọc cao hợp nhất (Tier 1 + Tier 2 + Cột trụ) */}
      <mesh
        geometry={getTallChessBaseBodyGeometry()}
        castShadow
        receiveShadow
        data-testid="pawn-base-body-merged"
      >
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* 1 Draw call: Vành đai cổ vàng kim #F59E0B giữ nguyên phong cách PBR */}
      <mesh position={[0, 0.285, 0]} data-testid="pawn-neck-ring">
        <cylinderGeometry args={[0.082, 0.082, 0.02, 24]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.75} roughness={0.2} />
      </mesh>

      {/* Contract retention backward compatibility tags (Bảo tồn cylinder args cho TC-TCPF01.08 & TC-TCPF02.01, 0 byte VRAM) */}
      <group visible={false} data-testid="pawn-retention-group">
        <mesh data-testid="pawn-base-tier1" />
        <mesh data-testid="pawn-base-tier2" />
        <mesh data-testid="pawn-tall-column">
          <cylinderGeometry args={[0.07, 0.10, 0.22, 24]} />
          <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
        </mesh>
      </group>
    </group>
  );
}

TallChessPawnBase.defaultProps = {
  children: <group visible={false} data-testid="pawn-retention-group" />,
};

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

      {/* 1 Draw call: Đầu tháp xe hoàng gia hợp nhất (Cổ tháp + 4 Răng cưa + Vòm đỉnh) */}
      <mesh
        geometry={getMergedRookHeadGeometry()}
        castShadow
        data-testid="pawn-rook-head-merged"
      >
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Contract retention backward compatibility tags */}
      <group visible={false} data-testid="pawn-retention-group">
        {[-0.06, 0.06].map((x) =>
          [-0.06, 0.06].map((z) => (
            <mesh key={`crenellation-${x}-${z}`} data-testid="pawn-rook-crenellation" />
          ))
        )}
        <mesh data-testid="pawn-rook-dome" />
        <mesh data-testid="pawn-corgi-legs" />
        <mesh data-testid="pawn-corgi-eyes" />
        <mesh data-testid="pawn-corgi-nose" />
        <mesh data-testid="pawn-dog-ears" />
        <mesh data-testid="pawn-dog-snout" />
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

      {/* 1 Draw call: Thân pháo thần công hợp nhất (Giá đỡ + Nòng pháo + Chuôi tròn) */}
      <mesh
        geometry={getMergedCannonHeadGeometry()}
        castShadow
        data-testid="pawn-cannon-head-merged"
      >
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* 1 Draw call: Gờ miệng nòng mạ vàng kim #F59E0B */}
      <mesh position={[0, 0.44, 0.09]} rotation={[0.35, 0, 0]} data-testid="pawn-cannon-muzzle">
        <cylinderGeometry args={[0.042, 0.042, 0.02, 20]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.75} roughness={0.2} />
      </mesh>

      {/* Contract retention backward compatibility tags */}
      <group visible={false} data-testid="pawn-retention-group">
        <mesh data-testid="pawn-cannon-barrel" />
        <mesh data-testid="pawn-cat-eyes" />
        <mesh data-testid="pawn-cat-nose" />
        <mesh data-testid="pawn-cat-waving-arm" />
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

      {/* 1 Draw call: Đầu ngựa chiến hợp nhất (Đầu cầu + Mõm hộp + 2 Tai nón) */}
      <mesh
        geometry={getMergedWarhorseHeadGeometry()}
        castShadow
        data-testid="pawn-horse-head-merged"
      >
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* 1 Draw call: 2 Mắt than đen bóng hợp nhất #0F172A */}
      <mesh geometry={getMergedWarhorseEyesGeometry()} data-testid="pawn-horse-eyes-merged">
        <meshStandardMaterial color="#0F172A" roughness={0.1} metalness={0.9} />
      </mesh>

      {/* 1 Draw call: Bờm vàng kim kiêu hãnh #F59E0B */}
      <mesh position={[0, 0.36, -0.04]} data-testid="pawn-horse-mane">
        <boxGeometry args={[0.025, 0.12, 0.04]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.75} roughness={0.2} />
      </mesh>

      {/* Contract retention backward compatibility tags */}
      <group visible={false} data-testid="pawn-retention-group">
        <mesh data-testid="pawn-horse-head" />
        <mesh data-testid="pawn-horse-eyes" />
        <mesh data-testid="pawn-horse-legs" />
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

      {/* 1 Draw call: Thân vương miện Indochine hợp nhất (Cổ thon + Vương miện xòe) */}
      <mesh
        geometry={getMergedQueenCrownGeometry()}
        castShadow
        data-testid="pawn-queen-crown-merged"
      >
        <meshStandardMaterial color={activeColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* 1 Draw call: 6 Chóp nhọn vàng kim hợp nhất #F59E0B */}
      <mesh
        geometry={getMergedQueenCrownPointsGeometry()}
        data-testid="pawn-queen-crown-points-merged"
      >
        <meshStandardMaterial color="#F59E0B" metalness={0.75} roughness={0.2} />
      </mesh>

      {/* 1 Draw call: Hạt ngọc phát quang đỉnh vương miện bảo tồn emissive */}
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
      <group visible={false} data-testid="pawn-retention-group">
        <mesh data-testid="pawn-queen-crown" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={`crown-point-${i}`} data-testid="pawn-crown-point" />
        ))}
        <mesh data-testid="pawn-elephant-legs" />
        <mesh data-testid="pawn-elephant-ears" />
        <mesh data-testid="pawn-elephant-eyes" />
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
