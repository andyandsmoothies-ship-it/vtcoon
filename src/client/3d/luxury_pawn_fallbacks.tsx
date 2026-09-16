// [TC-IMP29.2/MSS] luxury_pawn_fallbacks.tsx — Cơ chế dự phòng thủ tục Zero-Crash cho 4 Quân Cờ VIP
import React from 'react';
import type { LuxuryPawnConfig } from './luxury_pawn_models';

/**
 * Thủ tục dự phòng: Tượng Tháp Landmark Hoàng Gia (Slot 0 - Host P1)
 */
export function LandmarkTowerPawnFallback({ config }: { readonly config: LuxuryPawnConfig }): React.ReactElement {
  return (
    <group position={[0, 0, 0]}>
      {/* Bệ đế kim loại vát cạnh */}
      <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.2, 0.04, 16]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>
      <mesh position={[0, 0.045, 0]}>
        <cylinderGeometry args={[0.15, 0.17, 0.015, 16]} />
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

      {/* Đỉnh tháp giật cấp */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.07, 0.1, 6]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>

      {/* Kim thu lôi */}
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
      {/* Bệ đế kim loại mạ bạc */}
      <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.2, 0.04, 16]} />
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
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>

      {/* Buồng lái Flybridge tầng 2 */}
      <mesh position={[0, 0.18, -0.02]} castShadow>
        <boxGeometry args={[0.08, 0.04, 0.14]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>

      {/* Kính buồng lái */}
      <mesh position={[0, 0.17, 0.04]}>
        <boxGeometry args={[0.076, 0.025, 0.04]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>

      {/* Cột Radar */}
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
      {/* Bệ đế kim loại mạ đồng */}
      <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.2, 0.04, 16]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>

      {/* Thân xe cổ thuôn dài dạng Roadster 1930s */}
      <mesh position={[0, 0.09, 0]} castShadow>
        <boxGeometry args={[0.14, 0.065, 0.32]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>

      {/* Ca-pô trước kéo dài */}
      <mesh position={[0, 0.09, 0.08]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.07, 0.16, 12]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>

      {/* Lưới tản nhiệt mạ kim loại dọc cổ điển */}
      <mesh position={[0, 0.09, 0.165]}>
        <boxGeometry args={[0.09, 0.06, 0.015]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>

      {/* 4 bánh xe vành căm cổ điển */}
      {CLASSIC_CAR_WHEEL_OFFSETS.map(([x, z], i) => (
        <mesh key={`wheel-${i}`} position={[x, 0.06, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.045, 0.045, 0.025, 12]} />
          <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
        </mesh>
      ))}

      {/* Kính chắn gió mui trần nghiêng */}
      <mesh position={[0, 0.14, -0.01]} rotation={[-0.35, 0, 0]}>
        <boxGeometry args={[0.11, 0.04, 0.01]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>

      {/* Cặp đèn pha tròn cổ điển mạ vàng */}
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

/**
 * Thủ tục dự phòng: Tượng Ngựa Chiến Sapphire (Slot 2 - Chibi Warhorse)
 */
export function WarhorsePawnFallback({ config, playerColor }: AnimalPawnFallbackProps): React.ReactElement {
  return (
    <group position={[0, 0, 0]}>
      {/* 4 chân ngắn vững chãi */}
      <group data-testid="pawn-horse-legs">
        {[-0.065, 0.065].map((x) =>
          [-0.07, 0.07].map((z) => (
            <mesh key={`horse-leg-${x}-${z}`} position={[x, 0.04, z]} castShadow>
              <cylinderGeometry args={[0.025, 0.028, 0.08, 12]} />
              <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
            </mesh>
          ))
        )}
      </group>

      {/* Thân ngựa chibi tròn trịa */}
      <mesh position={[0, 0.13, -0.01]} castShadow>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>

      {/* Thảm yên ngựa mang playerColor */}
      <mesh position={[0, 0.19, -0.01]} data-testid="pawn-warhorse-saddle" name="WarhorseSaddle">
        <boxGeometry args={[0.15, 0.035, 0.13]} />
        <meshStandardMaterial color={playerColor || '#10B981'} roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Đầu ngựa chibi hiền hòa */}
      <mesh position={[0, 0.25, 0.08]} castShadow>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>

      {/* Mõm ngựa thon gọn */}
      <mesh position={[0, 0.21, 0.14]} castShadow>
        <boxGeometry args={[0.075, 0.065, 0.08]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>

      {/* Mắt thân thiện */}
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
          <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
        </mesh>
      ))}

      {/* Bờm ngựa sau gáy */}
      {[-0.03, 0.01, 0.05].map((z, i) => (
        <mesh key={`horse-mane-${i}`} position={[0, 0.22 + i * 0.04, z - 0.04]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.025, 0.035, 0.035]} />
          <meshStandardMaterial color="#94A3B8" metalness={0.92} roughness={0.12} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Thủ tục dự phòng: Tượng Chó Bạc Phú Quý (Slot 0 - Chibi Corgi)
 */
export function DogPawnFallback({ config, playerColor }: AnimalPawnFallbackProps): React.ReactElement {
  return (
    <group position={[0, 0, 0]}>
      {/* 4 chân ngắn mập mạp */}
      <group data-testid="pawn-corgi-legs">
        {[-0.065, 0.065].map((x) =>
          [-0.07, 0.07].map((z) => (
            <mesh key={`corgi-leg-${x}-${z}`} position={[x, 0.04, z]} castShadow>
              <cylinderGeometry args={[0.024, 0.028, 0.08, 12]} />
              <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
            </mesh>
          ))
        )}
      </group>

      {/* Thân hình tròn mập mạp */}
      <mesh position={[0, 0.13, 0]} castShadow>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>

      {/* Vòng cổ mang playerColor */}
      <mesh position={[0, 0.18, 0.04]} data-testid="pawn-dog-collar" name="DogCollar">
        <cylinderGeometry args={[0.09, 0.10, 0.025, 16]} />
        <meshStandardMaterial color={playerColor || '#DC2626'} roughness={0.2} metalness={0.4} />
      </mesh>

      {/* Chuông vàng cổ */}
      <mesh position={[0, 0.17, 0.12]} data-testid="pawn-dog-bell" name="DogBell">
        <sphereGeometry args={[0.022, 12, 12]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Đầu to má tròn phúng phính */}
      <mesh position={[0, 0.23, 0.07]} castShadow>
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>

      {/* Mắt đen hạt cườm biểu cảm */}
      <group data-testid="pawn-corgi-eyes">
        {[-0.04, 0.04].map((x) => (
          <mesh key={`corgi-eye-${x}`} position={[x, 0.25, 0.15]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshStandardMaterial color="#0F172A" roughness={0.1} metalness={0.9} />
          </mesh>
        ))}
      </group>

      {/* Mõm ngắn phúng phính */}
      <mesh position={[0, 0.21, 0.14]} castShadow>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>

      {/* Mũi đen nhỏ xinh */}
      <mesh position={[0, 0.22, 0.17]} data-testid="pawn-corgi-nose">
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshStandardMaterial color="#0F172A" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Đôi tai Corgi bo tròn dựng vểnh */}
      {[-0.06, 0.06].map((x) => (
        <mesh key={`corgi-ear-${x}`} position={[x, 0.33, 0.04]} rotation={[-0.1, 0, x > 0 ? -0.15 : 0.15]} castShadow>
          <coneGeometry args={[0.035, 0.08, 12]} />
          <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
        </mesh>
      ))}

      {/* Đuôi ngắn ngoáy */}
      <mesh position={[0, 0.15, -0.12]} rotation={[-0.5, 0, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.025, 0.07, 8]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>
    </group>
  );
}

/**
 * Thủ tục dự phòng: Tượng Mèo Bạc May Mắn (Slot 1 - Chibi Maneki Neko)
 */
export function CatPawnFallback({ config, playerColor }: AnimalPawnFallbackProps): React.ReactElement {
  return (
    <group position={[0, 0, 0]}>
      {/* Thân tròn béo múp ngồi thẳng */}
      <mesh position={[0, 0.13, 0]} castShadow>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>

      {/* Yếm ngực mang playerColor */}
      <mesh position={[0, 0.19, 0.08]} data-testid="pawn-cat-bib" name="CatBib">
        <cylinderGeometry args={[0.065, 0.075, 0.025, 16]} />
        <meshStandardMaterial color={playerColor || '#3B82F6'} roughness={0.2} metalness={0.4} />
      </mesh>

      {/* Đầu tròn phúc hậu */}
      <mesh position={[0, 0.25, 0.02]} castShadow>
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>

      {/* Đôi tai mèo nhọn bo góc */}
      {[-0.06, 0.06].map((x) => (
        <mesh key={`cat-ear-${x}`} position={[x, 0.34, 0.02]} rotation={[0, 0, x > 0 ? -0.18 : 0.18]} castShadow>
          <coneGeometry args={[0.03, 0.065, 8]} />
          <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
        </mesh>
      ))}

      {/* Mắt biểu cảm */}
      <group data-testid="pawn-cat-eyes">
        {[-0.045, 0.045].map((x) => (
          <mesh key={`cat-eye-${x}`} position={[x, 0.26, 0.11]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshStandardMaterial color="#0F172A" roughness={0.1} metalness={0.9} />
          </mesh>
        ))}
      </group>

      {/* Mũi xinh */}
      <mesh position={[0, 0.24, 0.12]} data-testid="pawn-cat-nose">
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial color="#F43F5E" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Tay phải giơ cao vẫy chào may mắn */}
      <group position={[0.085, 0.23, 0.05]} data-testid="pawn-cat-waving-arm">
        <mesh rotation={[0.4, 0, -0.3]} castShadow>
          <cylinderGeometry args={[0.024, 0.03, 0.11, 8]} />
          <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
        </mesh>
        <mesh position={[0.03, 0.06, 0.03]} castShadow>
          <sphereGeometry args={[0.028, 8, 8]} />
          <meshStandardMaterial color="#FFFFFF" metalness={0.2} roughness={0.3} />
        </mesh>
      </group>

      {/* Tay trái ôm đồng tiền vàng Koban phong thủy */}
      <mesh position={[-0.05, 0.14, 0.11]} rotation={[Math.PI / 4, 0, -Math.PI / 6]} data-testid="pawn-cat-coin">
        <cylinderGeometry args={[0.04, 0.04, 0.015, 16]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}

/**
 * Thủ tục dự phòng: Tượng Voi Bạc Thịnh Vượng (Slot 3 - Voi Chibi Hoàng Gia)
 */
export function ElephantPawnFallback({ config, playerColor }: AnimalPawnFallbackProps): React.ReactElement {
  return (
    <group position={[0, 0, 0]}>
      {/* 4 chân trụ dày */}
      <group data-testid="pawn-elephant-legs">
        {[-0.07, 0.07].map((x) =>
          [-0.07, 0.07].map((z) => (
            <mesh key={`ele-leg-${x}-${z}`} position={[x, 0.04, z]} castShadow>
              <cylinderGeometry args={[0.032, 0.035, 0.08, 12]} />
              <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
            </mesh>
          ))
        )}
      </group>

      {/* Thân tròn mập */}
      <mesh position={[0, 0.14, -0.02]} castShadow>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>

      {/* Thảm lưng hoàng gia mang playerColor */}
      <mesh position={[0, 0.22, -0.02]} data-testid="pawn-elephant-blanket" name="ElephantBlanket">
        <boxGeometry args={[0.16, 0.035, 0.14]} />
        <meshStandardMaterial color={playerColor || '#F59E0B'} roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Đầu voi tròn hiền hòa */}
      <mesh position={[0, 0.23, 0.07]} castShadow>
        <sphereGeometry args={[0.10, 16, 16]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>

      {/* Vòi uốn cong giơ cao đắc thắng */}
      <mesh position={[0, 0.28, 0.17]} rotation={[0.8, 0, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.035, 0.16, 8]} />
        <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
      </mesh>

      {/* Đôi tai to mềm mại */}
      <group data-testid="pawn-elephant-ears">
        {[-0.10, 0.10].map((x) => (
          <mesh key={`ele-ear-${x}`} position={[x, 0.24, 0.07]} rotation={[0, x > 0 ? -0.4 : 0.4, 0]} castShadow>
            <boxGeometry args={[0.015, 0.09, 0.07]} />
            <meshStandardMaterial color={config.color} metalness={config.metalness} roughness={config.roughness} />
          </mesh>
        ))}
      </group>

      {/* Mắt thân thiện */}
      <group data-testid="pawn-elephant-eyes">
        {[-0.05, 0.05].map((x) => (
          <mesh key={`ele-eye-${x}`} position={[x, 0.25, 0.13]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshStandardMaterial color="#0F172A" roughness={0.1} metalness={0.9} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export interface LuxuryPawnProceduralFallbackProps {
  readonly slotIndex: number;
  readonly config: LuxuryPawnConfig;
  readonly playerColor?: string;
}

/**
 * Component tập hợp điều phối Fallback thủ tục theo từng Slot (4 Linh Vật Con Vật Bạc)
 */
export function LuxuryPawnProceduralFallback({
  slotIndex,
  config,
  playerColor,
}: LuxuryPawnProceduralFallbackProps): React.ReactElement {
  const safeIdx = Math.max(0, Math.min(3, Math.floor(slotIndex)));

  return (
    <group position={[0, 0, 0]} scale={config.scale}>
      {safeIdx === 0 && <DogPawnFallback config={config} playerColor={playerColor} />}
      {safeIdx === 1 && <CatPawnFallback config={config} playerColor={playerColor} />}
      {safeIdx === 2 && <WarhorsePawnFallback config={config} playerColor={playerColor} />}
      {safeIdx === 3 && <ElephantPawnFallback config={config} playerColor={playerColor} />}
    </group>
  );
}
