// [IMP-31] DioramaShophouseBlocks — 32 Shophouses Batched via InstancedMesh (2 Draw Calls)
import React, { useRef, useEffect, useMemo } from 'react';
import { Object3D, type InstancedMesh } from 'three';

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

// 24 Căn Phố cổ Chợ Lớn (Tây Nam: X in [-5.6, -3.4], Z in [2.2, 5.7])
const CHO_LON_SHOPHOUSES: ShophouseConfig[] = Array.from({ length: 24 }, (_, i) => {
  const row = Math.floor(i / 8);
  const col = i % 8;
  const x = Number((-5.4 + row * 0.9).toFixed(3));
  const z = Number((2.2 + col * 0.5).toFixed(3));
  const heightCycles = [0.42, 0.48, 0.55, 0.62, 0.50, 0.68, 0.45, 0.58];
  const height = heightCycles[col % heightCycles.length]!;
  return { id: `sh-cl-${i}`, x, y: 0.025, z, width: 0.42, height, depth: 0.44, rotationY: 0 };
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

export const SHOPHOUSES = SHOPHOUSE_CONFIGS;

export function DioramaShophouseBlocks(): React.ReactElement {
  const dummy = useMemo(() => new Object3D(), []);
  const wallsRef = useRef<InstancedMesh>(null);
  const roofsRef = useRef<InstancedMesh>(null);

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
        <meshStandardMaterial color="#FEF08A" roughness={0.55} />
      </instancedMesh>

      {/* Mái ngói đất nung đỏ cam (#EA580C) */}
      <instancedMesh ref={roofsRef} args={[undefined, undefined, SHOPHOUSE_CONFIGS.length]} castShadow>
        <coneGeometry args={[0.36, 0.2, 4]} />
        <meshStandardMaterial color="#EA580C" roughness={0.45} />
      </instancedMesh>
    </group>
  );
}
