// [IMP-31] DioramaHighriseBlocks — 16 Financial Towers Batched via InstancedMesh (2 Draw Calls)
import React, { useRef, useEffect, useMemo } from 'react';
import { Object3D, type InstancedMesh } from 'three';

export interface HighriseConfig {
  id: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  rotationY: number;
}

// 16 Tháp cao ốc tài chính Tây Bắc lùi sâu về phía Bắc (X in [-5.8, -3.2], Z in [-6.4, -2.4])
export const HIGHRISE_CONFIGS: ReadonlyArray<HighriseConfig> = [
  // Hàng 1 (Hậu cảnh sâu Z = -5.8, cao nhất 2.3 - 2.8)
  { id: 'tower-1', x: -5.4, y: 0.025, z: -5.8, width: 0.55, height: 2.7, depth: 0.55, rotationY: 0 },
  { id: 'tower-2', x: -4.7, y: 0.025, z: -5.8, width: 0.50, height: 2.8, depth: 0.50, rotationY: 0 },
  { id: 'tower-3', x: -3.9, y: 0.025, z: -5.8, width: 0.52, height: 2.5, depth: 0.52, rotationY: 0 },
  { id: 'tower-4', x: -3.2, y: 0.025, z: -5.8, width: 0.48, height: 2.3, depth: 0.48, rotationY: 0 },

  // Hàng 2 (Tầm trung sâu Z = -4.8, cao 1.9 - 2.4)
  { id: 'tower-5', x: -5.5, y: 0.025, z: -4.8, width: 0.52, height: 2.2, depth: 0.52, rotationY: 0 },
  { id: 'tower-6', x: -4.7, y: 0.025, z: -4.8, width: 0.56, height: 2.4, depth: 0.56, rotationY: 0 },
  { id: 'tower-7', x: -3.9, y: 0.025, z: -4.8, width: 0.50, height: 2.1, depth: 0.50, rotationY: 0 },
  { id: 'tower-8', x: -3.2, y: 0.025, z: -4.8, width: 0.46, height: 1.9, depth: 0.46, rotationY: 0 },

  // Hàng 3 (Tầm trung cận Z = -3.8, cao 1.5 - 2.0)
  { id: 'tower-9', x: -5.4, y: 0.025, z: -3.8, width: 0.48, height: 1.8, depth: 0.48, rotationY: 0 },
  { id: 'tower-10', x: -4.6, y: 0.025, z: -3.8, width: 0.52, height: 2.0, depth: 0.52, rotationY: 0 },
  { id: 'tower-11', x: -3.8, y: 0.025, z: -3.8, width: 0.48, height: 1.7, depth: 0.48, rotationY: 0 },
  { id: 'tower-12', x: -3.2, y: 0.025, z: -3.8, width: 0.45, height: 1.5, depth: 0.45, rotationY: 0 },

  // Hàng 4 (Tiền cảnh tiến về trung tâm Z = -2.8, hạ dần 1.2 - 1.6)
  { id: 'tower-13', x: -5.3, y: 0.025, z: -2.8, width: 0.46, height: 1.4, depth: 0.46, rotationY: 0 },
  { id: 'tower-14', x: -4.6, y: 0.025, z: -2.8, width: 0.50, height: 1.6, depth: 0.50, rotationY: 0 },
  { id: 'tower-15', x: -3.9, y: 0.025, z: -2.8, width: 0.45, height: 1.3, depth: 0.45, rotationY: 0 },
  { id: 'tower-16', x: -3.2, y: 0.025, z: -2.8, width: 0.42, height: 1.2, depth: 0.42, rotationY: 0 },
];

export const HIGHRISE_TOWERS = HIGHRISE_CONFIGS;

export function DioramaHighriseBlocks(): React.ReactElement {
  const dummy = useMemo(() => new Object3D(), []);
  const bodyRef = useRef<InstancedMesh>(null);
  const crownRef = useRef<InstancedMesh>(null);

  useEffect(() => {
    const body = bodyRef.current;
    const crown = crownRef.current;
    if (!body || !crown) return;

    HIGHRISE_CONFIGS.forEach((tower, i) => {
      // 1. Thân tháp kính sapphire (#0284C7)
      dummy.position.set(tower.x, tower.y + (tower.height * 0.9) / 2, tower.z);
      dummy.rotation.set(0, tower.rotationY, 0);
      dummy.scale.set(tower.width, tower.height * 0.9, tower.depth);
      dummy.updateMatrix();
      body.setMatrixAt(i, dummy.matrix);

      // 2. Đỉnh tháp chóp kính sapphire phản quang bầu trời (#38BDF8)
      dummy.position.set(tower.x, tower.y + tower.height * 0.95, tower.z);
      dummy.rotation.set(0, tower.rotationY, 0);
      dummy.scale.set(tower.width * 0.82, tower.height * 0.1, tower.depth * 0.82);
      dummy.updateMatrix();
      crown.setMatrixAt(i, dummy.matrix);
    });

    body.instanceMatrix.needsUpdate = true;
    crown.instanceMatrix.needsUpdate = true;
  }, [dummy]);

  return (
    <group data-testid="diorama-highrise-blocks">
      {/* Khung thân tháp kính sapphire biển (#0284C7) */}
      <instancedMesh ref={bodyRef} args={[undefined, undefined, HIGHRISE_CONFIGS.length]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#0284C7" roughness={0.15} metalness={0.7} />
      </instancedMesh>

      {/* Đỉnh chóp sapphire phản quang rực rỡ (#38BDF8) */}
      <instancedMesh ref={crownRef} args={[undefined, undefined, HIGHRISE_CONFIGS.length]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#38BDF8" roughness={0.1} metalness={0.9} />
      </instancedMesh>
    </group>
  );
}
