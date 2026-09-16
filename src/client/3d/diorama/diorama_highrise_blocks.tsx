import React, { useMemo } from 'react';
import { createHighriseFacadeTexture } from '../facade_texture_generator';

export interface HighriseConfig {
  id: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  rotationY: number;
  typology?: 'prismatic' | 'stepped' | 'curved' | 'crowned';
}

// 10 Tháp cao ốc tài chính Tây Bắc thiết kế giật cấp bao bọc quanh tháp Bitexco
// Quy hoạch mở toang hành lang hướng Đông ra sông Sài Gòn (X >= -3.8, Z: -4.8 .. -3.6)
export const HIGHRISE_CONFIGS: ReadonlyArray<HighriseConfig> = [
  // Hàng 1 Bắc (Hậu cảnh sâu Z = -5.8 .. -5.9, cao 2.3 - 2.6m)
  { id: 'tower-1', x: -5.4, y: 0.025, z: -5.8, width: 0.52, height: 2.4, depth: 0.52, rotationY: 0, typology: 'prismatic' },
  { id: 'tower-2', x: -4.5, y: 0.025, z: -5.9, width: 0.50, height: 2.6, depth: 0.50, rotationY: 0, typology: 'crowned' },
  { id: 'tower-3', x: -3.5, y: 0.025, z: -5.8, width: 0.50, height: 2.3, depth: 0.50, rotationY: 0, typology: 'stepped' },

  // Cánh Tây (Z = -4.7 .. -3.7, cao 1.7 - 2.0m)
  { id: 'tower-4', x: -5.5, y: 0.025, z: -4.7, width: 0.48, height: 2.0, depth: 0.48, rotationY: 0, typology: 'curved' },
  { id: 'tower-5', x: -5.5, y: 0.025, z: -3.7, width: 0.46, height: 1.7, depth: 0.46, rotationY: 0, typology: 'prismatic' },

  // Cánh Đông Bắc & Đông Nam (Hành lang Đông mở toang đón gió sông, Z <= -5.0 hoặc Z >= -3.2)
  { id: 'tower-6', x: -3.5, y: 0.025, z: -5.2, width: 0.48, height: 1.9, depth: 0.48, rotationY: 0, typology: 'curved' },
  { id: 'tower-7', x: -3.5, y: 0.025, z: -3.0, width: 0.46, height: 1.6, depth: 0.46, rotationY: 0, typology: 'stepped' },

  // Hàng Nam (Tiền cảnh Z = -2.8 .. -2.9, cao 1.3 - 1.5m)
  { id: 'tower-8', x: -5.3, y: 0.025, z: -2.8, width: 0.44, height: 1.4, depth: 0.44, rotationY: 0, typology: 'stepped' },
  { id: 'tower-9', x: -4.5, y: 0.025, z: -2.9, width: 0.46, height: 1.5, depth: 0.46, rotationY: 0, typology: 'crowned' },
  { id: 'tower-10', x: -3.7, y: 0.025, z: -2.8, width: 0.42, height: 1.3, depth: 0.42, rotationY: 0, typology: 'prismatic' },
];

export function DioramaHighriseBlocks(): React.ReactElement {
  const facadeTexture = useMemo(() => createHighriseFacadeTexture(), []);

  const prismaticTowers = useMemo(() => HIGHRISE_CONFIGS.filter((t) => t.typology === 'prismatic'), []);
  const steppedTowers = useMemo(() => HIGHRISE_CONFIGS.filter((t) => t.typology === 'stepped'), []);
  const curvedTowers = useMemo(() => HIGHRISE_CONFIGS.filter((t) => t.typology === 'curved'), []);
  const crownedTowers = useMemo(() => HIGHRISE_CONFIGS.filter((t) => t.typology === 'crowned'), []);

  return (
    <group data-testid="diorama-highrise-blocks">
      {/* 1. Trường phái Tháp Lăng Kính Vát Góc (Prismatic Faceted Towers) */}
      <group data-testid="highrise-prismatic">
        {prismaticTowers.map((tower) => {
          const isEast = tower.x > -4.0;
          return (
            <group key={tower.id} position={[tower.x, tower.y, tower.z]} rotation={[0, tower.rotationY, 0]}>
              {/* Thân tháp: Cánh phải kính ngọc bích Bitraco (#0D9488), cánh trái trắng ngà (#FFFFFF) */}
              <mesh castShadow receiveShadow position={[0, (tower.height * 0.84) / 2, 0]}>
                <cylinderGeometry args={[tower.width * 0.48, tower.width * 0.54, tower.height * 0.84, 8]} />
                <meshStandardMaterial
                  map={facadeTexture}
                  color={isEast ? '#0D9488' : '#FFFFFF'}
                  roughness={0.2}
                  metalness={isEast ? 0.6 : 0.3}
                />
              </mesh>
              {/* Khung viền trắng cho cánh phải phong cách Bitraco */}
              {isEast && (
                <mesh position={[0, (tower.height * 0.84) / 2, 0]}>
                  <boxGeometry args={[tower.width * 0.72, tower.height * 0.82, tower.width * 0.72]} />
                  <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
                </mesh>
              )}
              {/* Cánh trái: Lam đứng chắn nắng xám trung tính (#64748B) */}
              {!isEast && (
                <group position={[0, (tower.height * 0.84) / 2, 0]}>
                  {[-0.14, 0.14].map((lx, lIdx) => (
                    <mesh key={`p-louver-${lIdx}`} position={[lx, 0, tower.depth * 0.42]}>
                      <boxGeometry args={[0.015, tower.height * 0.80, 0.03]} />
                      <meshStandardMaterial color="#64748B" roughness={0.5} metalness={0.6} />
                    </mesh>
                  ))}
                </group>
              )}
              {/* Vườn trên cao & đỉnh vát */}
              <mesh castShadow receiveShadow position={[0, tower.height * 0.84 + 0.02, 0]}>
                <cylinderGeometry args={[tower.width * 0.44, tower.width * 0.46, 0.04, 8]} />
                <meshStandardMaterial color="#15803D" roughness={0.7} />
              </mesh>
              <mesh castShadow position={[0, tower.height * 0.84 + 0.04 + (tower.height * 0.14) / 2, 0]}>
                <coneGeometry args={[tower.width * 0.35, tower.height * 0.14, 8]} />
                <meshStandardMaterial color="#F59E0B" roughness={0.2} metalness={0.8} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* 2. Trường phái Tháp Đôi Giật Cấp Vườn Treo (Stepped Terraces) */}
      <group data-testid="highrise-stepped">
        {steppedTowers.map((tower) => {
          const isEast = tower.x > -4.0;
          return (
            <group key={tower.id} position={[tower.x, tower.y, tower.z]} rotation={[0, tower.rotationY, 0]}>
              {/* Khối đế tầng 1: Cánh phải Bitraco xanh ngọc bích (#0D9488), cánh trái trắng (#FFFFFF) */}
              <mesh castShadow receiveShadow position={[0, (tower.height * 0.48) / 2, 0]}>
                <boxGeometry args={[tower.width, tower.height * 0.48, tower.depth]} />
                <meshStandardMaterial
                  map={facadeTexture}
                  color={isEast ? '#0D9488' : '#FFFFFF'}
                  roughness={0.2}
                  metalness={isEast ? 0.6 : 0.3}
                />
              </mesh>
              {/* Khung trắng cho cánh phải Bitraco */}
              {isEast && (
                <mesh position={[0, tower.height * 0.24, 0]}>
                  <boxGeometry args={[tower.width + 0.01, 0.02, tower.depth + 0.01]} />
                  <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
                </mesh>
              )}
              {/* Lam chắn nắng xám trung tính cho cánh trái (#94A3B8) */}
              {!isEast && (
                <group position={[0, (tower.height * 0.48) / 2, tower.depth * 0.51]}>
                  {[-0.12, 0, 0.12].map((lx, lIdx) => (
                    <mesh key={`s-louver-${lIdx}`} position={[lx, 0, 0]}>
                      <boxGeometry args={[0.012, tower.height * 0.44, 0.02]} />
                      <meshStandardMaterial color="#94A3B8" roughness={0.5} />
                    </mesh>
                  ))}
                </group>
              )}
              <mesh position={[0, tower.height * 0.48 + 0.015, 0]}>
                <boxGeometry args={[tower.width * 0.96, 0.03, tower.depth * 0.96]} />
                <meshStandardMaterial color="#15803D" roughness={0.7} />
              </mesh>
              {/* Khối tầng 2 giật cấp */}
              <mesh castShadow receiveShadow position={[0, tower.height * 0.48 + 0.03 + (tower.height * 0.36) / 2, 0]}>
                <boxGeometry args={[tower.width * 0.78, tower.height * 0.36, tower.depth * 0.78]} />
                <meshStandardMaterial
                  map={facadeTexture}
                  color={isEast ? '#0D9488' : '#FFFFFF'}
                  roughness={0.2}
                  metalness={isEast ? 0.6 : 0.3}
                />
              </mesh>
              <mesh position={[0, tower.height * 0.84 + 0.045, 0]}>
                <boxGeometry args={[tower.width * 0.75, 0.03, tower.depth * 0.75]} />
                <meshStandardMaterial color="#15803D" roughness={0.7} />
              </mesh>
              <mesh castShadow position={[0, tower.height * 0.87 + (tower.height * 0.13) / 2, 0]}>
                <boxGeometry args={[tower.width * 0.54, tower.height * 0.13, tower.depth * 0.54]} />
                <meshStandardMaterial color="#F59E0B" roughness={0.2} metalness={0.8} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* 3. Trường phái Tháp Mặt Kính Uốn Cong Ven Sông (Curved Towers) */}
      <group data-testid="highrise-curved">
        {curvedTowers.map((tower) => {
          const isEast = tower.x > -4.0;
          return (
            <group key={tower.id} position={[tower.x, tower.y, tower.z]} rotation={[0, tower.rotationY, 0]}>
              <mesh castShadow receiveShadow position={[0, (tower.height * 0.86) / 2, 0]}>
                <cylinderGeometry args={[tower.width * 0.46, tower.width * 0.52, tower.height * 0.86, 24]} />
                <meshStandardMaterial
                  map={facadeTexture}
                  color={isEast ? '#0D9488' : '#FFFFFF'}
                  roughness={0.2}
                  metalness={isEast ? 0.6 : 0.3}
                />
              </mesh>
              {/* Cánh phải Bitraco: vành đai khung trắng (#F8FAFC) */}
              {isEast && (
                <mesh position={[0, (tower.height * 0.86) / 2, 0]}>
                  <cylinderGeometry args={[tower.width * 0.47, tower.width * 0.53, 0.02, 24]} />
                  <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
                </mesh>
              )}
              {/* Cánh trái: Lam đứng chắn nắng xám trung tính (#64748B) */}
              {!isEast && (
                <group position={[0, (tower.height * 0.86) / 2, 0]}>
                  {[-0.15, 0, 0.15].map((lx, lIdx) => (
                    <mesh key={`c-louver-${lIdx}`} position={[lx, 0, tower.width * 0.48]}>
                      <boxGeometry args={[0.015, tower.height * 0.82, 0.025]} />
                      <meshStandardMaterial color="#64748B" roughness={0.5} metalness={0.6} />
                    </mesh>
                  ))}
                </group>
              )}
              <mesh position={[0, tower.height * 0.86 + 0.015, 0]}>
                <cylinderGeometry args={[tower.width * 0.52, tower.width * 0.52, 0.03, 24]} />
                <meshStandardMaterial color="#15803D" roughness={0.7} />
              </mesh>
              <mesh castShadow position={[0, tower.height * 0.86 + 0.03 + (tower.height * 0.12) / 2, 0]}>
                <cylinderGeometry args={[tower.width * 0.36, tower.width * 0.44, tower.height * 0.12, 24]} />
                <meshStandardMaterial color="#F59E0B" roughness={0.2} metalness={0.8} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* 4. Trường phái Tháp Chóp Vương Miện Art Deco (Crowned Towers) */}
      <group data-testid="highrise-crowned">
        {crownedTowers.map((tower) => (
          <group key={tower.id} position={[tower.x, tower.y, tower.z]} rotation={[0, tower.rotationY, 0]}>
            <mesh castShadow receiveShadow position={[0, (tower.height * 0.82) / 2, 0]}>
              <boxGeometry args={[tower.width, tower.height * 0.82, tower.depth]} />
              <meshStandardMaterial map={facadeTexture} color="#FFFFFF" roughness={0.2} metalness={0.3} />
            </mesh>
            <mesh position={[0, tower.height * 0.82 + 0.02, 0]}>
              <boxGeometry args={[tower.width * 0.88, 0.04, tower.depth * 0.88]} />
              <meshStandardMaterial color="#15803D" roughness={0.7} />
            </mesh>
            <mesh castShadow position={[0, tower.height * 0.82 + 0.04 + (tower.height * 0.08) / 2, 0]}>
              <boxGeometry args={[tower.width * 0.72, tower.height * 0.08, tower.depth * 0.72]} />
              <meshStandardMaterial color="#F59E0B" roughness={0.2} metalness={0.8} />
            </mesh>
            <mesh castShadow position={[0, tower.height * 0.90 + (tower.height * 0.10) / 2, 0]}>
              <coneGeometry args={[tower.width * 0.32, tower.height * 0.10, 4]} />
              <meshStandardMaterial color="#F59E0B" roughness={0.2} metalness={0.8} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
