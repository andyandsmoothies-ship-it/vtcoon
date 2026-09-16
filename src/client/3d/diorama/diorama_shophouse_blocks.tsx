import React, { useRef, useEffect, useMemo } from 'react';
import { Object3D, type InstancedMesh } from 'three';
import { createShophouseFacadeTexture } from '../facade_texture_generator';

export interface ShophouseConfig {
  id: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  rotationY: number;
}

// 24 Căn Phố cổ Chợ Lớn (Tây Nam: X in [-6.0, -3.0], Z in [1.5, 6.5], giải phóng Nhà Thờ Đức Bà >= 1.0m)
const CHO_LON_SHOPHOUSES: ShophouseConfig[] = Array.from({ length: 24 }, (_, i) => {
  const heightCycles = [0.42, 0.48, 0.55, 0.62, 0.50, 0.68, 0.45, 0.58];
  const height = heightCycles[i % heightCycles.length]!;

  if (i < 16) {
    // Block 1 (Phố Nam): 16 căn chia thành 2 hàng lùi sâu về phía Nam (Z = 5.35 & 5.95, giải phóng không gian Nhà Thờ Z=3.65 >= 1.7m)
    const row = Math.floor(i / 8);
    const col = i % 8;
    const x = Number((-5.35 + col * 0.28).toFixed(3));
    const z = Number((row === 0 ? 5.35 : 5.95).toFixed(3));
    return { id: `sh-cl-${i}`, x, y: 0.025, z, width: 0.42, height, depth: 0.44, rotationY: 0 };
  } else {
    // Block 2 (Phố Tây): 8 căn chạy dọc đại lộ Tây (X = -5.6, cách Nhà Thờ X=-4.3 >= 1.3m)
    const idx = i - 16;
    const x = -5.6;
    const z = Number((1.8 + idx * 0.38).toFixed(3));
    return { id: `sh-cl-${i}`, x, y: 0.025, z, width: 0.42, height, depth: 0.44, rotationY: 0 };
  }
});

// 8 Căn Phố ẩm thực ven Bến du thuyền (Đông Nam: X in [3.8, 5.2], Z in [2.6, 6.1])
const MARINA_SHOPHOUSES: ShophouseConfig[] = Array.from({ length: 8 }, (_, i) => {
  const z = Number((2.6 + i * 0.5).toFixed(3));
  const heightCycles = [0.38, 0.45, 0.52, 0.40, 0.48, 0.55, 0.42, 0.50];
  const height = heightCycles[i % heightCycles.length]!;
  return { id: `sh-marina-${i}`, x: 4.2, y: 0.025, z, width: 0.42, height, depth: 0.44, rotationY: 0 };
});

export const SHOPHOUSE_CONFIGS: ReadonlyArray<ShophouseConfig> = [
  ...CHO_LON_SHOPHOUSES,
  ...MARINA_SHOPHOUSES,
];

export function DioramaShophouseBlocks(): React.ReactElement {
  const dummy = useMemo(() => new Object3D(), []);
  const wallsRef = useRef<InstancedMesh>(null);
  const roofsRef = useRef<InstancedMesh>(null);
  const facadeTexture = useMemo(() => createShophouseFacadeTexture(), []);

  useEffect(() => {
    const walls = wallsRef.current;
    const roofs = roofsRef.current;
    if (!walls || !roofs) return;

    SHOPHOUSE_CONFIGS.forEach((sh, i) => {
      // 1. Tường nhà Indochine vàng kem (#FEF08A)
      dummy.position.set(sh.x, sh.y + sh.height / 2, sh.z);
      dummy.rotation.set(0, sh.rotationY, 0);
      dummy.scale.set(sh.width, sh.height, sh.depth);
      dummy.updateMatrix();
      walls.setMatrixAt(i, dummy.matrix);

      // 2. Mái ngói đất nung Chợ Lớn (#EA580C)
      dummy.position.set(sh.x, sh.y + sh.height + 0.07, sh.z);
      dummy.rotation.set(0, sh.rotationY + Math.PI / 4, 0);
      dummy.scale.set(sh.width * 1.08, 0.14, sh.depth * 1.08);
      dummy.updateMatrix();
      roofs.setMatrixAt(i, dummy.matrix);
    });

    walls.instanceMatrix.needsUpdate = true;
    roofs.instanceMatrix.needsUpdate = true;
  }, [dummy]);

  return (
    <group data-testid="diorama-shophouse-blocks">
      {/* Tường nhà Indochine vàng kem (#FEF08A) */}
      <instancedMesh ref={wallsRef} args={[undefined, undefined, SHOPHOUSE_CONFIGS.length]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial map={facadeTexture} color="#FEF08A" roughness={0.55} />
      </instancedMesh>

      {/* Mái ngói đất nung đỏ cam (#EA580C) */}
      <instancedMesh ref={roofsRef} args={[undefined, undefined, SHOPHOUSE_CONFIGS.length]} castShadow>
        <coneGeometry args={[0.36, 0.2, 4]} />
        <meshStandardMaterial color="#EA580C" roughness={0.45} />
      </instancedMesh>

      {/* Cụm biển hiệu nóc nhà 3D thương mại đặc trưng (Rooftop Signs) */}
      <group data-testid="diorama-rooftop-signs">
        {/* Biển 3D Ly cà phê màu #F59E0B */}
        <group position={[-5.35, 0.72, 5.35]} name="Biển cà phê ☕">
          <mesh castShadow>
            <cylinderGeometry args={[0.06, 0.045, 0.10, 12]} />
            <meshStandardMaterial color="#F59E0B" roughness={0.25} metalness={0.6} />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <torusGeometry args={[0.04, 0.01, 8, 16]} />
            <meshStandardMaterial color="#FDE68A" roughness={0.3} />
          </mesh>
        </group>

        {/* Biển 3D Bánh donut màu #EC4899 */}
        <group position={[-4.51, 0.78, 5.35]} name="Biển bánh donut 🍩">
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.07, 0.035, 12, 24]} />
            <meshStandardMaterial color="#EC4899" roughness={0.3} metalness={0.2} />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <sphereGeometry args={[0.015, 6, 6]} />
            <meshStandardMaterial color="#FEF08A" />
          </mesh>
        </group>

        {/* Biển 3D Sàn chứng khoán HOSE màu #10B981 */}
        <group position={[-5.6, 0.75, 2.56]} name="Biển Sàn HOSE">
          <mesh castShadow>
            <boxGeometry args={[0.22, 0.08, 0.04]} />
            <meshStandardMaterial color="#10B981" roughness={0.2} metalness={0.7} />
          </mesh>
          <mesh position={[0, 0, 0.022]}>
            <planeGeometry args={[0.18, 0.05]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        </group>
      </group>
    </group>
  );
}
