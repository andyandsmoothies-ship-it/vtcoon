// [UI-S01/MSS][IMP-13] LayeredTropicalFoliage — 3-Tier Foliage & InstancedMesh Batching (<85 Draw Calls)
import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { InstancedMesh } from 'three';

export interface TropicalTreeConfig {
  x: number;
  y: number;
  z: number;
  scale: number;
  tiltX: number;
  tiltZ: number;
  yaw: number;
}

// 32 Vị trí cây nhiệt đới phân bổ tự nhiên ven bờ cát, sườn đồi và chân núi
export const TROPICAL_TREES: readonly TropicalTreeConfig[] = [
  // 1. Cụm dừa bãi cát bờ Tây & Nam
  { x: -17, y: -0.36, z: -19, scale: 1.05, tiltX: 0.08, tiltZ: -0.06, yaw: 0.2 },
  { x: -13, y: -0.38, z: -22, scale: 0.95, tiltX: -0.05, tiltZ: -0.08, yaw: 1.1 },
  { x: -21, y: -0.35, z: -14, scale: 1.15, tiltX: 0.07, tiltZ: 0.05, yaw: 2.3 },
  { x: -24, y: -0.36, z: -8, scale: 1.0, tiltX: -0.06, tiltZ: 0.08, yaw: 0.8 },
  { x: 16, y: -0.37, z: 21, scale: 1.1, tiltX: 0.05, tiltZ: 0.07, yaw: 1.7 },
  { x: 21, y: -0.36, z: 16, scale: 0.9, tiltX: -0.08, tiltZ: -0.05, yaw: 2.9 },
  { x: 23, y: -0.35, z: 10, scale: 1.0, tiltX: 0.06, tiltZ: -0.06, yaw: 0.4 },
  { x: -19, y: -0.36, z: 18, scale: 1.2, tiltX: -0.07, tiltZ: 0.06, yaw: 3.1 },
  // 2. Cụm dừa khu nghỉ dưỡng ven biển & mũi bãi tắm
  { x: -22, y: -0.36, z: 12, scale: 1.15, tiltX: 0.06, tiltZ: 0.08, yaw: 1.4 },
  { x: -25, y: -0.38, z: 6, scale: 0.95, tiltX: -0.08, tiltZ: 0.04, yaw: 0.6 },
  { x: 18, y: -0.36, z: 25, scale: 1.05, tiltX: 0.07, tiltZ: -0.05, yaw: 2.2 },
  { x: 25, y: -0.37, z: 14, scale: 1.0, tiltX: -0.05, tiltZ: 0.06, yaw: 1.9 },
  // 3. Vành đai rừng rậm nhiệt đới chân núi phía Bắc & Đông Bắc
  { x: -35, y: -0.22, z: -24, scale: 1.1, tiltX: 0.04, tiltZ: -0.04, yaw: 0.5 },
  { x: -30, y: -0.22, z: -26, scale: 1.2, tiltX: -0.04, tiltZ: 0.05, yaw: 1.2 },
  { x: -25, y: -0.22, z: -28, scale: 1.0, tiltX: 0.05, tiltZ: -0.03, yaw: 2.1 },
  { x: -20, y: -0.22, z: -32, scale: 1.25, tiltX: -0.03, tiltZ: -0.05, yaw: 0.9 },
  { x: -15, y: -0.22, z: -34, scale: 1.15, tiltX: 0.06, tiltZ: 0.03, yaw: 1.8 },
  { x: -10, y: -0.22, z: -36, scale: 1.3, tiltX: -0.05, tiltZ: 0.04, yaw: 2.7 },
  { x: -5, y: -0.22, z: -35, scale: 1.05, tiltX: 0.03, tiltZ: -0.05, yaw: 0.3 },
  { x: 0, y: -0.22, z: -34, scale: 1.2, tiltX: -0.04, tiltZ: 0.03, yaw: 1.5 },
  { x: 5, y: -0.22, z: -32, scale: 1.15, tiltX: 0.05, tiltZ: -0.04, yaw: 2.4 },
  { x: 10, y: -0.22, z: -30, scale: 1.25, tiltX: -0.04, tiltZ: 0.05, yaw: 0.7 },
  { x: 15, y: -0.22, z: -28, scale: 1.0, tiltX: 0.06, tiltZ: -0.03, yaw: 1.6 },
  { x: 20, y: -0.22, z: -26, scale: 1.2, tiltX: -0.05, tiltZ: -0.04, yaw: 2.8 },
  { x: 25, y: -0.22, z: -25, scale: 1.1, tiltX: 0.04, tiltZ: 0.05, yaw: 0.4 },
  { x: 30, y: -0.22, z: -22, scale: 1.05, tiltX: -0.03, tiltZ: -0.05, yaw: 1.3 },
  { x: 35, y: -0.22, z: -20, scale: 1.15, tiltX: 0.05, tiltZ: 0.04, yaw: 2.5 },
  // 4. Các cụm cây sườn đồi xanh phía Đông & Đông Nam
  { x: -38, y: -0.24, z: -18, scale: 1.1, tiltX: -0.05, tiltZ: 0.05, yaw: 0.8 },
  { x: 38, y: -0.24, z: -16, scale: 1.2, tiltX: 0.04, tiltZ: -0.06, yaw: 2.0 },
  { x: 42, y: -0.24, z: -12, scale: 1.0, tiltX: -0.04, tiltZ: 0.04, yaw: 1.1 },
  { x: 45, y: -0.25, z: 12, scale: 1.15, tiltX: 0.05, tiltZ: -0.04, yaw: 2.6 },
  { x: 43, y: -0.25, z: 20, scale: 1.05, tiltX: -0.06, tiltZ: 0.05, yaw: 0.5 },
] as const;

export function LayeredTropicalFoliage(): React.ReactElement {
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const trunkRef = useRef<InstancedMesh>(null);
  const tier1Ref = useRef<InstancedMesh>(null);
  const tier2Ref = useRef<InstancedMesh>(null);
  const tier3Ref = useRef<InstancedMesh>(null);

  useEffect(() => {
    const trunk = trunkRef.current;
    const tier1 = tier1Ref.current;
    const tier2 = tier2Ref.current;
    const tier3 = tier3Ref.current;
    if (!trunk || !tier1 || !tier2 || !tier3) return;

    for (let i = 0; i < TROPICAL_TREES.length; i++) {
      const tree = TROPICAL_TREES[i];
      if (!tree) continue;

      const s = tree.scale;

      // 1. Thân dừa uốn cong nhẹ tự nhiên
      dummy.position.set(tree.x, tree.y + 0.6 * s, tree.z);
      dummy.rotation.set(tree.tiltX, tree.yaw, tree.tiltZ);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      trunk.setMatrixAt(i, dummy.matrix);

      // 2. Tầng 1 (Đáy): Tán nón rộng rêu đậm (#15803D)
      dummy.position.set(tree.x, tree.y + 1.15 * s, tree.z);
      dummy.rotation.set(tree.tiltX * 0.5, tree.yaw, tree.tiltZ * 0.5);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      tier1.setMatrixAt(i, dummy.matrix);

      // 3. Tầng 2 (Giữa): Tán nón xoay lệch góc 30 độ (#16A34A)
      dummy.position.set(tree.x, tree.y + 1.48 * s, tree.z);
      dummy.rotation.set(tree.tiltX * 0.3, tree.yaw + Math.PI / 6, tree.tiltZ * 0.3);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      tier2.setMatrixAt(i, dummy.matrix);

      // 4. Tầng 3 (Chóp đỉnh): Tán nón xoay lệch 60 độ ánh vàng nắng (#4ADE80)
      dummy.position.set(tree.x, tree.y + 1.78 * s, tree.z);
      dummy.rotation.set(tree.tiltX * 0.2, tree.yaw + Math.PI / 3, tree.tiltZ * 0.2);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      tier3.setMatrixAt(i, dummy.matrix);
    }

    trunk.instanceMatrix.needsUpdate = true;
    tier1.instanceMatrix.needsUpdate = true;
    tier2.instanceMatrix.needsUpdate = true;
    tier3.instanceMatrix.needsUpdate = true;

    trunk.computeBoundingSphere?.();
    tier1.computeBoundingSphere?.();
    tier2.computeBoundingSphere?.();
    tier3.computeBoundingSphere?.();
  }, [dummy]);

  return (
    <group data-testid="layered-tropical-foliage">
      {/* 1. Thân cây nhiệt đới uốn cong tự nhiên (Instanced Trunk) */}
      <instancedMesh
        ref={trunkRef}
        args={[undefined, undefined, TROPICAL_TREES.length]}
        castShadow
      >
        <cylinderGeometry args={[0.08, 0.14, 1.2, 8]} />
        <meshStandardMaterial color="#78350F" roughness={0.85} />
      </instancedMesh>

      {/* 2. Tầng nón đáy tán rộng: Xanh rêu đậm (#15803D) */}
      <instancedMesh
        ref={tier1Ref}
        args={[undefined, undefined, TROPICAL_TREES.length]}
        castShadow
        receiveShadow
      >
        <coneGeometry args={[0.95, 0.55, 8]} />
        <meshStandardMaterial color="#15803D" roughness={0.65} />
      </instancedMesh>

      {/* 3. Tầng nón giữa xoay lệch góc: Xanh rậm rạp (#16A34A) */}
      <instancedMesh
        ref={tier2Ref}
        args={[undefined, undefined, TROPICAL_TREES.length]}
        castShadow
        receiveShadow
      >
        <coneGeometry args={[0.72, 0.45, 8]} />
        <meshStandardMaterial color="#16A34A" roughness={0.65} />
      </instancedMesh>

      {/* 4. Tầng nón đỉnh xoay lệch góc: Xanh rêu đậm pha ánh vàng nắng (#4ADE80) */}
      <instancedMesh
        ref={tier3Ref}
        args={[undefined, undefined, TROPICAL_TREES.length]}
        castShadow
        receiveShadow
      >
        <coneGeometry args={[0.48, 0.38, 8]} />
        <meshStandardMaterial color="#4ADE80" roughness={0.55} />
      </instancedMesh>
    </group>
  );
}
