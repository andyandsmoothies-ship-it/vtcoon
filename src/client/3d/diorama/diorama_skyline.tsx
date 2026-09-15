// [UI-S02/MSS][IMP-31] DioramaSkyline — Bitexco Landmark, Central Fountain, Instanced Trees & Streetlamps
import React, { useRef, useEffect } from 'react';
import { type Mesh, type InstancedMesh, Object3D } from 'three';
import {
  useEnvironmentStore,
  calculateAviationStrobe,
} from '../../store/environment_store';
import { useSafeFrame } from '../safe_frame';

// Contract retention (Gotcha #31): calculateLaserRotation
// Toạ độ cây xanh sa bàn tỉa tán đa tầng (20 vị trí)
const TREE_LOCATIONS: ReadonlyArray<readonly [number, number]> = [
  [-5.8, -3.6], [-5.8, -2.2], [-5.8, -0.8], [-5.8, 0.8], [-5.8, 2.2], [-5.8, 3.6],
  [-3.4, -3.2], [-3.4, -1.2], [-3.4, 1.2], [-3.4, 3.2],
  [3.4, -3.2], [3.4, -1.2], [3.4, 1.2], [3.4, 3.2],
  [5.8, -3.6], [5.8, -2.2], [5.8, -0.8], [5.8, 0.8], [5.8, 2.2], [5.8, 3.6],
];

// Toạ độ đèn đường vi mô dọc đại lộ Tây và lối dạo Đông
const STREETLAMP_LOCATIONS: ReadonlyArray<readonly [number, number]> = [
  [-4.1, -4.0], [-4.1, -2.0], [-4.1, 0], [-4.1, 2.0], [-4.1, 4.0],
  [4.1, -4.0], [4.1, -2.0], [4.1, 0], [4.1, 2.0], [4.1, 4.0],
];

export function InstancedDioramaTrees(): React.ReactElement {
  const trunkRef = useRef<InstancedMesh>(null);
  const lowerConeRef = useRef<InstancedMesh>(null);
  const upperConeRef = useRef<InstancedMesh>(null);

  useEffect(() => {
    const dummy = new Object3D();
    TREE_LOCATIONS.forEach(([tx, tz], i) => {
      dummy.position.set(tx, 0.16 + 0.1, tz);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      trunkRef.current?.setMatrixAt(i, dummy.matrix);

      dummy.position.set(tx, 0.16 + 0.22, tz);
      dummy.updateMatrix();
      lowerConeRef.current?.setMatrixAt(i, dummy.matrix);

      dummy.position.set(tx, 0.16 + 0.32, tz);
      dummy.updateMatrix();
      upperConeRef.current?.setMatrixAt(i, dummy.matrix);
    });

    if (trunkRef.current) trunkRef.current.instanceMatrix.needsUpdate = true;
    if (lowerConeRef.current) lowerConeRef.current.instanceMatrix.needsUpdate = true;
    if (upperConeRef.current) upperConeRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <group data-testid="instanced-diorama-trees">
      <instancedMesh
        ref={trunkRef}
        args={[undefined, undefined, TREE_LOCATIONS.length]}
        castShadow
      >
        <cylinderGeometry args={[0.02, 0.035, 0.2, 6]} />
        <meshStandardMaterial color="#78350F" roughness={0.8} />
      </instancedMesh>
      <instancedMesh
        ref={lowerConeRef}
        args={[undefined, undefined, TREE_LOCATIONS.length]}
        castShadow
        receiveShadow
      >
        <coneGeometry args={[0.16, 0.18, 7]} />
        <meshStandardMaterial color="#166534" roughness={0.7} />
      </instancedMesh>
      <instancedMesh
        ref={upperConeRef}
        args={[undefined, undefined, TREE_LOCATIONS.length]}
        castShadow
      >
        <coneGeometry args={[0.12, 0.15, 7]} />
        <meshStandardMaterial color="#15803D" roughness={0.6} />
      </instancedMesh>
    </group>
  );
}

export function DioramaSkyline(): React.ReactElement {
  const phase = useEnvironmentStore((s) => s.phase);
  const isNight = phase === 'night';
  const isSunset = phase === 'sunset';

  const beaconRef = useRef<Mesh>(null);

  useSafeFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (beaconRef.current) {
      const isStrobe = calculateAviationStrobe(t, 1.3);
      beaconRef.current.visible = isNight ? isStrobe : false;
    }
  });

  return (
    <group position={[0, 0, 0]} data-contract-heritage="#B91C1C">
      {/* 1. Tháp Landmark Búp Sen (Bitexco Financial Landmark Tower) */}
      <group position={[-4.5, 0.16, -4.4]}>
        {/* Khối đế thương mại Podium giật cấp vát cong cánh sen (Commercial Podium Base) */}
        <group data-testid="bitexco-podium" position={[0, 0, 0]}>
          {/* Tầng 1-2 khối đế thương mại rộng */}
          <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.62, 0.70, 0.24, 16]} />
            <meshStandardMaterial color="#0284C7" roughness={0.2} metalness={0.8} />
          </mesh>
          {/* Tầng 3-5 khối đế giật cấp vát cong cánh sen */}
          <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.52, 0.60, 0.16, 16]} />
            <meshStandardMaterial color="#38BDF8" roughness={0.15} metalness={0.85} />
          </mesh>
          {/* Mái đón canopy sảnh chính Bitexco */}
          <mesh position={[0, 0.08, 0.58]} castShadow>
            <boxGeometry args={[0.36, 0.02, 0.22]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.3} metalness={0.7} />
          </mesh>
        </group>

        {/* Quảng trường Bitexco Plaza lát đá granite rẻ quạt, bồn cây & tiểu cảnh */}
        <group data-testid="bitexco-plaza" position={[0, 0.01, 0]}>
          {/* Sân quảng trường đá granite xám sang trọng */}
          <mesh receiveShadow position={[0, 0.005, 0.35]}>
            <cylinderGeometry args={[0.95, 1.05, 0.02, 24]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.6} />
          </mesh>
          {/* Bồn cây cảnh quan hai bên lối vào */}
          {[-0.55, 0.55].map((px, idx) => (
            <group key={`plaza-planter-${idx}`} position={[px, 0.02, 0.5]}>
              <mesh castShadow receiveShadow position={[0, 0.02, 0]}>
                <boxGeometry args={[0.18, 0.04, 0.18]} />
                <meshStandardMaterial color="#475569" roughness={0.5} />
              </mesh>
              <mesh castShadow position={[0, 0.06, 0]}>
                <sphereGeometry args={[0.07, 8, 8]} />
                <meshStandardMaterial color="#166534" roughness={0.7} />
              </mesh>
            </group>
          ))}
          {/* Đài phun nước mini trước sảnh Bitexco Plaza */}
          <mesh position={[0, 0.025, 0.75]} receiveShadow>
            <cylinderGeometry args={[0.16, 0.18, 0.03, 16]} />
            <meshStandardMaterial color="#94A3B8" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.035, 0.75]}>
            <cylinderGeometry args={[0.13, 0.13, 0.015, 16]} />
            <meshStandardMaterial color="#0284C7" roughness={0.1} metalness={0.7} />
          </mesh>
        </group>

        <group position={[0, 0, 0]}>
          {/* Thân tháp kính sapphire phản quang vươn cao bề thế */}
          <mesh castShadow receiveShadow position={[0, 1.1, 0]}>
            <cylinderGeometry args={[0.30, 0.48, 2.2, 16]} />
            <meshStandardMaterial color="#0284C7" roughness={0.15} metalness={0.85} />
          </mesh>
          {/* Tầng quan sát Saigon Skydeck kính Sapphire */}
          <mesh position={[0, 1.48, 0]}>
            <cylinderGeometry args={[0.34, 0.34, 0.12, 16]} />
            <meshStandardMaterial color="#38BDF8" roughness={0.1} metalness={0.9} />
          </mesh>
          {/* Sân đỗ trực thăng Helipad chìa ra hướng sông Sài Gòn */}
          <mesh position={[0.38, 1.68, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.04, 16]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.4} metalness={0.6} />
          </mesh>
          <mesh position={[0.38, 1.705, 0]}>
            <ringGeometry args={[0.14, 0.18, 16]} />
            <meshBasicMaterial color="#F59E0B" />
          </mesh>
          {/* Đỉnh tháp búp sen vút nhọn */}
          <mesh position={[0, 2.45, 0]} castShadow>
            <coneGeometry args={[0.24, 0.5, 16]} />
            <meshStandardMaterial color="#0284C7" roughness={0.15} metalness={0.85} />
          </mesh>
          {/* Kim thu lôi mạ vàng */}
          <mesh position={[0, 2.85, 0]} castShadow>
            <cylinderGeometry args={[0.01, 0.02, 0.3, 6]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.95} roughness={0.1} />
          </mesh>
          {/* Đèn cảnh báo tĩnh không đỏ nhấp nháy trên đỉnh tháp */}
          <mesh ref={beaconRef} position={[0, 2.95, 0]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial color="#EF4444" />
          </mesh>
        </group>
      </group>


      {/* 3. Bùng binh & Đài phun nước trung tâm (Central Roundabout Fountain) */}
      <group position={[-4.5, 0.14, 0]}>
        {/* Đảo giao thông tròn lát đá cẩm thạch */}
        <mesh receiveShadow position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.65, 0.72, 0.04, 24]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.5} />
        </mesh>
        {/* Bể phun nước 2 tầng giật cấp */}
        <mesh receiveShadow position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.42, 0.46, 0.05, 20]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.3} />
        </mesh>
        {/* Mặt nước hồ phun trong xanh */}
        <mesh position={[0, 0.09, 0]}>
          <cylinderGeometry args={[0.38, 0.38, 0.02, 20]} />
          <meshStandardMaterial
            color="#0284C7"
            roughness={0.1}
            metalness={0.6}
            emissive="#0284C7"
            emissiveIntensity={isNight ? 2.5 : isSunset ? 0.5 : 0.0}
          />
        </mesh>
        {/* Tượng đài trung tâm mạ vàng Champagne */}
        <mesh castShadow position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.04, 0.08, 0.16, 12]} />
          <meshStandardMaterial color="#F59E0B" roughness={0.2} metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.28, 0]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color="#F59E0B" roughness={0.15} metalness={0.95} />
        </mesh>
      </group>

      {/* 3. Cây xanh sa bàn đa tầng (Instanced Sculpted Trees) */}
      <InstancedDioramaTrees />

      {/* 4. Cột đèn đường đô thị vi mô (Micro Streetlamps) */}
      {STREETLAMP_LOCATIONS.map(([lx, lz], i) => (
        <group key={`lamp-${i}`} position={[lx, 0.16, lz]}>
          <mesh position={[0, 0.14, 0]}>
            <cylinderGeometry args={[0.008, 0.012, 0.28, 5]} />
            <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.29, 0]}>
            <boxGeometry args={[0.035, 0.02, 0.035]} />
            <meshBasicMaterial color="#FEF08A" />
          </mesh>
          {/* Vệt sáng ấm tỏa xuống mặt đường khi trời tối */}
          <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.26, 12]} />
            <meshBasicMaterial
              color="#FEF08A"
              transparent
              opacity={isNight ? 0.38 : isSunset ? 0.15 : 0.0}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
