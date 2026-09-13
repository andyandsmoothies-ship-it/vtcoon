// [IMP-30] TropicalPalmsCluster — 60 Tropical Coconut Palms Batched via InstancedMesh
import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { InstancedMesh } from 'three';

const PALM_COUNT = 60;

// 60 Vị trí cây dừa: 40 cây bờ Nam trên bãi cát (Z in [12.0, 14.2]) & 20 cây bờ Đông Nam (X in [12.2, 14.8])
export const PALM_TREES = Array.from({ length: PALM_COUNT }, (_, i) => {
  const isSouth = i < 40;
  if (isSouth) {
    const t = i / 39;
    const x = Number((-13.5 + t * 27.0).toFixed(3));
    const z = Number((12.2 + ((i * 7) % 11) * 0.18).toFixed(3));
    const y = Number((0.03 + ((i * 3) % 4) * 0.01).toFixed(3));
    const scale = 0.85 + ((i * 7) % 10) * 0.04;
    const tiltX = Math.sin(i * 3.1) * 0.12 - 0.05;
    const tiltZ = Math.cos(i * 2.7) * 0.12 + 0.05;
    const yaw = (i * 1.37) % (Math.PI * 2);
    return { x, y, z, scale, tiltX, tiltZ, yaw };
  } else {
    const j = i - 40;
    const t = j / 19;
    const z = Number((-3.5 + t * 13.0).toFixed(3));
    const x = Number((12.4 + ((j * 7) % 11) * 0.22).toFixed(3));
    const y = Number((0.02 + ((j * 3) % 4) * 0.01).toFixed(3));
    const scale = 0.85 + ((i * 7) % 10) * 0.04;
    const tiltX = Math.sin(i * 3.1) * 0.12 - 0.05;
    const tiltZ = Math.cos(i * 2.7) * 0.12 + 0.05;
    const yaw = (i * 1.37) % (Math.PI * 2);
    return { x, y, z, scale, tiltX, tiltZ, yaw };
  }
});

/**
 * Cụm 60 cây dừa nhiệt đới nghiêng bóng mát dọc bãi cát phía Nam và bờ vịnh Đông Nam
 * Tối ưu hóa GPU tuyệt đối thông qua InstancedMesh (chỉ tốn 3 draw calls).
 */
export function TropicalPalmsCluster(): React.ReactElement {
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const trunkRef = useRef<InstancedMesh>(null);
  const frondTier1Ref = useRef<InstancedMesh>(null);
  const frondTier2Ref = useRef<InstancedMesh>(null);

  useEffect(() => {
    const trunk = trunkRef.current;
    const frond1 = frondTier1Ref.current;
    const frond2 = frondTier2Ref.current;
    if (!trunk || !frond1 || !frond2) return;

    for (let i = 0; i < PALM_COUNT; i++) {
      const p = PALM_TREES[i];
      if (!p) continue;
      const s = p.scale;

      // 1. Thân cây dừa nâu cong nghiêng tự nhiên
      dummy.position.set(p.x, p.y + 0.70 * s, p.z);
      dummy.rotation.set(p.tiltX, p.yaw, p.tiltZ);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      trunk.setMatrixAt(i, dummy.matrix);

      // 2. Chùm lá dừa tán dưới (#15803D)
      const topY = p.y + 1.35 * s;
      dummy.position.set(p.x + Math.sin(p.tiltZ) * 0.25, topY, p.z + Math.sin(p.tiltX) * 0.25);
      dummy.rotation.set(p.tiltX * 0.5, p.yaw, p.tiltZ * 0.5);
      dummy.scale.set(s, s * 0.85, s);
      dummy.updateMatrix();
      frond1.setMatrixAt(i, dummy.matrix);

      // 3. Chùm lá dừa non đón nắng tán trên (#22C55E)
      dummy.position.set(p.x + Math.sin(p.tiltZ) * 0.3, topY + 0.25 * s, p.z + Math.sin(p.tiltX) * 0.3);
      dummy.rotation.set(p.tiltX * 0.4, p.yaw + Math.PI / 4, p.tiltZ * 0.4);
      dummy.scale.set(s * 0.85, s * 0.75, s * 0.85);
      dummy.updateMatrix();
      frond2.setMatrixAt(i, dummy.matrix);
    }

    trunk.instanceMatrix.needsUpdate = true;
    frond1.instanceMatrix.needsUpdate = true;
    frond2.instanceMatrix.needsUpdate = true;
  }, [dummy]);

  return (
    <group position={[0, 0, 0]} data-testid="tropical-palms-cluster">
      {/* Thân cây dừa nâu cong thanh mảnh */}
      <instancedMesh ref={trunkRef} args={[undefined, undefined, PALM_COUNT]} castShadow receiveShadow>
        <cylinderGeometry args={[0.04, 0.08, 1.4, 6]} />
        <meshStandardMaterial color="#78350F" roughness={0.88} />
      </instancedMesh>

      {/* Tán lá dừa xòe rộng xanh thẫm tỉ lệ đồ chơi sa bàn (#15803D) */}
      <instancedMesh ref={frondTier1Ref} args={[undefined, undefined, PALM_COUNT]} castShadow>
        <coneGeometry args={[0.42, 0.32, 7]} />
        <meshStandardMaterial color="#15803D" roughness={0.75} />
      </instancedMesh>

      {/* Chùm lá non xanh sáng trên đỉnh (#22C55E) */}
      <instancedMesh ref={frondTier2Ref} args={[undefined, undefined, PALM_COUNT]} castShadow>
        <coneGeometry args={[0.30, 0.24, 6]} />
        <meshStandardMaterial color="#22C55E" roughness={0.7} />
      </instancedMesh>
    </group>
  );
}
