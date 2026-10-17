// [UI-S02/MSS][IMP-431] DioramaSkyline — Bitexco Landmark, Central Fountain, Instanced Trees & Streetlamps
import React, { useRef, useEffect } from 'react';
import { type Mesh, type InstancedMesh, Object3D } from 'three';
import {
  useEnvironmentStore,
  calculateAviationStrobe,
} from '../../store/environment_store';
import { useSafeFrame } from '../safe_frame';
import {
  createBitexcoLotusBudGeometry,
  createBitexcoLotusSheathGeometry,
  createBitexcoHelipadSaucerGeometry,
  createBitexcoCrescentCrownGeometry,
} from './bitexco_tower_visuals';

// Contract retention (Gotcha #31): calculateLaserRotation
const TREE_LOCATIONS: ReadonlyArray<readonly [number, number]> = [
  [-5.8, -3.6], [-5.8, -2.2], [-5.8, -0.8], [-5.8, 0.8], [-5.8, 2.2], [-5.8, 3.6],
  [-3.4, -3.2], [-3.4, -1.2], [-3.4, 1.2], [-3.4, 3.2], [3.4, -3.2], [3.4, -1.2],
  [3.4, 1.2], [3.4, 3.2], [5.8, -3.6], [5.8, -2.2], [5.8, -0.8], [5.8, 0.8], [5.8, 2.2], [5.8, 3.6],
];

const STREETLAMP_LOCATIONS: ReadonlyArray<readonly [number, number]> = [
  [-4.1, -4.0], [-4.1, -2.0], [-4.1, 0], [-4.1, 2.0], [-4.1, 4.0],
  [3.4, -4.0], [4.1, -2.0], [4.1, 0], [4.1, 2.0], [4.1, 4.0],
];

export function InstancedDioramaTrees(): React.ReactElement {
  const trunkRef = useRef<InstancedMesh>(null);
  const lowerConeRef = useRef<InstancedMesh>(null);
  const upperConeRef = useRef<InstancedMesh>(null);

  useEffect(() => {
    const dummy = new Object3D();
    TREE_LOCATIONS.forEach(([tx, tz], i) => {
      dummy.position.set(tx, 0.26, tz);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      trunkRef.current?.setMatrixAt(i, dummy.matrix);
      dummy.position.set(tx, 0.38, tz);
      dummy.updateMatrix();
      lowerConeRef.current?.setMatrixAt(i, dummy.matrix);
      dummy.position.set(tx, 0.48, tz);
      dummy.updateMatrix();
      upperConeRef.current?.setMatrixAt(i, dummy.matrix);
    });

    if (trunkRef.current) trunkRef.current.instanceMatrix.needsUpdate = true;
    if (lowerConeRef.current) lowerConeRef.current.instanceMatrix.needsUpdate = true;
    if (upperConeRef.current) upperConeRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <group data-testid="instanced-diorama-trees">
      <instancedMesh ref={trunkRef} args={[undefined, undefined, TREE_LOCATIONS.length]} castShadow>
        <cylinderGeometry args={[0.02, 0.035, 0.2, 6]} />
        <meshStandardMaterial color="#78350F" roughness={0.8} />
      </instancedMesh>
      <instancedMesh ref={lowerConeRef} args={[undefined, undefined, TREE_LOCATIONS.length]} castShadow receiveShadow>
        <coneGeometry args={[0.16, 0.18, 7]} />
        <meshStandardMaterial color="#166534" roughness={0.7} />
      </instancedMesh>
      <instancedMesh ref={upperConeRef} args={[undefined, undefined, TREE_LOCATIONS.length]} castShadow>
        <coneGeometry args={[0.12, 0.15, 7]} />
        <meshStandardMaterial color="#15803D" roughness={0.6} />
      </instancedMesh>
    </group>
  );
}

export interface DioramaSkylineProps {
  readonly isMobile?: boolean;
  readonly isVisible?: boolean;
}

export function DioramaSkyline({
  isMobile = false,
  isVisible = true,
}: DioramaSkylineProps = {}): React.ReactElement {
  const phase = useEnvironmentStore((s) => s.phase);
  const isNight = phase === 'night';
  const isSunset = phase === 'sunset';
  const beaconRef = useRef<Mesh>(null);

  return (
    <group position={[0, 0, 0]} data-contract-heritage="#B91C1C">
      {!isMobile && isNight && (
        <DioramaSkylineFrameLoop isVisible={isVisible} beaconRef={beaconRef} />
      )}
      {/* 1. Tháp Landmark Búp Sen (Bitexco Financial Landmark Tower) */}
      <group position={[-4.5, 0.16, -4.4]} data-testid="bitexco-tower">
        {/* Khối đế thương mại Podium giật cấp vát cong cánh sen */}
        <group data-testid="bitexco-podium" position={[0, 0, 0]}>
          <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.62, 0.70, 0.24, 16]} />
            <meshStandardMaterial color="#0284C7" roughness={0.2} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.52, 0.60, 0.16, 16]} />
            <meshStandardMaterial color="#38BDF8" roughness={0.15} metalness={0.85} />
          </mesh>
          <mesh position={[0, 0.08, 0.58]} castShadow>
            <boxGeometry args={[0.36, 0.02, 0.22]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.3} metalness={0.7} />
          </mesh>
        </group>

        {/* Quảng trường Bitexco Plaza lát đá granite rẻ quạt, bồn cây & tiểu cảnh */}
        <group data-testid="bitexco-plaza" position={[0, 0.01, 0]}>
          <mesh receiveShadow position={[0, 0.005, 0.35]}>
            <cylinderGeometry args={[0.95, 1.05, 0.02, 24]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.6} />
          </mesh>
          {[-0.55, 0.55].map((px, idx) => (
            <group key={`plaza-planter-${idx}`} position={[px, 0.02, 0.5]}>
              <mesh castShadow receiveShadow position={[0, 0.02, 0]}><boxGeometry args={[0.18, 0.04, 0.18]} /><meshStandardMaterial color="#475569" roughness={0.5} /></mesh>
              <mesh castShadow position={[0, 0.06, 0]}><sphereGeometry args={[0.07, 8, 8]} /><meshStandardMaterial color="#166534" roughness={0.7} /></mesh>
            </group>
          ))}
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
          {/* Thân tháp búp sen khí động học 3D Lathe kính Sapphire */}
          <mesh geometry={createBitexcoLotusBudGeometry()} castShadow receiveShadow position={[0, 0, 0]}>
            <meshStandardMaterial color="#0284C7" roughness={0.15} metalness={0.85} />
          </mesh>

          {/* Lớp vỏ cánh sen uốn lượn ôm thân tháp (Lotus Sheath) */}
          <group data-testid="bitexco-lotus-sheath" position={[0, 0, 0]}>
            <mesh geometry={createBitexcoLotusSheathGeometry()} castShadow receiveShadow position={[0, 0, 0]}>
              <meshStandardMaterial color="#7DD3FC" roughness={0.12} metalness={0.85} side={2} />
            </mesh>
            <mesh position={[0.16, 1.15, 0.22]}>
              <cylinderGeometry args={[0.012, 0.016, 1.95, 8]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.25} metalness={0.85} />
            </mesh>
            <mesh position={[-0.16, 1.15, 0.22]}>
              <cylinderGeometry args={[0.012, 0.016, 1.95, 8]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.25} metalness={0.85} />
            </mesh>
          </group>

          {/* Tầng quan sát Saigon Skydeck kính Sapphire */}
          <mesh position={[0, 1.48, 0]}>
            <cylinderGeometry args={[0.34, 0.34, 0.12, 16]} />
            <meshStandardMaterial color="#38BDF8" roughness={0.1} metalness={0.9} />
          </mesh>

          {/* Sân đỗ trực thăng Helipad Cantilever vươn ra hướng sông Sài Gòn */}
          <group data-testid="bitexco-helipad" position={[0.38, 1.68, 0]}>
            <mesh data-testid="helipad-truss" position={[0, -0.06, 0]} castShadow>
              <cylinderGeometry args={[0.20, 0.08, 0.10, 16]} />
              <meshStandardMaterial color="#64748B" roughness={0.4} metalness={0.7} />
            </mesh>
            <mesh geometry={createBitexcoHelipadSaucerGeometry()} castShadow position={[0, 0, 0]}>
              <meshStandardMaterial color="#E2E8F0" roughness={0.4} metalness={0.6} />
            </mesh>
            <mesh position={[0, 0.016, 0]}>
              <ringGeometry args={[0.13, 0.17, 16]} />
              <meshBasicMaterial color="#F59E0B" />
            </mesh>
            <mesh position={[0, 0.016, 0]}>
              <boxGeometry args={[0.02, 0.001, 0.09]} />
              <meshBasicMaterial color="#F8FAFC" />
            </mesh>

            {/* Trực thăng siêu vi mô đậu trên bãi đỗ */}
            <group data-testid="micro-helicopter" position={[0, 0.03, 0]}>
              <mesh position={[0, 0.005, 0]}><boxGeometry args={[0.06, 0.006, 0.08]} /><meshStandardMaterial color="#334155" roughness={0.5} /></mesh>
              <mesh position={[0, 0.025, 0]} castShadow><boxGeometry args={[0.05, 0.03, 0.09]} /><meshStandardMaterial color="#EF4444" roughness={0.3} /></mesh>
              <mesh position={[0, 0.032, 0.02]}><boxGeometry args={[0.04, 0.018, 0.04]} /><meshStandardMaterial color="#F8FAFC" roughness={0.2} /></mesh>
              <mesh position={[0, 0.028, -0.06]}><boxGeometry args={[0.015, 0.015, 0.06]} /><meshStandardMaterial color="#EF4444" /></mesh>
              <mesh position={[0, 0.045, 0]} rotation={[0, 0.4, 0]}><boxGeometry args={[0.14, 0.004, 0.015]} /><meshStandardMaterial color="#334155" roughness={0.4} /></mesh>
            </group>
          </group>

          {/* Đỉnh tháp cắt vát chéo cánh sen hé nở (Bitexco Crown) */}
          <group data-testid="bitexco-crown" position={[0, 0, 0]}>
            <mesh geometry={createBitexcoCrescentCrownGeometry()} position={[0, 2.45, 0]} castShadow>
              <meshStandardMaterial color="#7DD3FC" roughness={0.1} metalness={0.8} side={2} />
            </mesh>
            <mesh position={[0, 2.45, 0]}>
              <cylinderGeometry args={[0.10, 0.14, 0.32, 16]} />
              <meshStandardMaterial color="#1E293B" roughness={0.4} metalness={0.8} />
            </mesh>
            <mesh position={[0, 2.85, 0]} castShadow>
              <cylinderGeometry args={[0.01, 0.02, 0.3, 6]} />
              <meshStandardMaterial color="#F59E0B" metalness={0.95} roughness={0.1} />
            </mesh>
            <mesh ref={beaconRef} position={[0, 2.95, 0]} visible={isNight}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshBasicMaterial color="#EF4444" />
            </mesh>
          </group>
        </group>
      </group>

      {/* 2. Tòa Nhà Di Sản Bờ Sông Phong Cách Pháp Cổ (Colonial Waterfront Heritage) */}
      <group data-testid="colonial-waterfront-heritage" position={[-3.7, 0.16, -3.7]}>
        <mesh castShadow receiveShadow position={[0, 0.14, 0]}>
          <boxGeometry args={[0.68, 0.28, 0.38]} />
          <meshStandardMaterial color="#FEF08A" roughness={0.7} />
        </mesh>
        {[-0.22, 0, 0.22].map((cx, i) => (
          <group key={`arch-window-${i}`} position={[cx, 0.15, 0.195]}>
            <mesh><boxGeometry args={[0.08, 0.12, 0.01]} /><meshStandardMaterial color="#F8FAFC" roughness={0.4} /></mesh>
            <mesh position={[0, 0.06, 0]}><cylinderGeometry args={[0.04, 0.04, 0.01, 8, 1, false, 0, Math.PI]} /><meshStandardMaterial color="#F8FAFC" roughness={0.4} /></mesh>
          </group>
        ))}
        <mesh castShadow position={[0, 0.35, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[0.48, 0.18, 4]} />
          <meshStandardMaterial color="#EA580C" roughness={0.6} />
        </mesh>
      </group>

      {/* 3. Bến tàu thủy buýt Saigon Waterbus (Waterfront Waterbus Station) */}
      <group data-testid="waterfront-waterbus" position={[-3.3, 0.14, -3.4]}>
        <mesh receiveShadow position={[0, 0.02, 0]}>
          <boxGeometry args={[0.42, 0.03, 0.26]} />
          <meshStandardMaterial color="#94A3B8" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.09, 0.04]}>
          <boxGeometry args={[0.28, 0.015, 0.16]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
        </mesh>
        <group position={[0.22, 0.01, -0.05]}>
          <mesh castShadow position={[0, 0.015, 0]}><boxGeometry args={[0.12, 0.025, 0.28]} /><meshStandardMaterial color="#F8FAFC" roughness={0.3} /></mesh>
          <mesh position={[0, 0.01, 0]}><boxGeometry args={[0.122, 0.008, 0.282]} /><meshStandardMaterial color="#0284C7" roughness={0.2} /></mesh>
          <mesh position={[0, 0.035, -0.02]}><boxGeometry args={[0.09, 0.02, 0.16]} /><meshStandardMaterial color="#38BDF8" roughness={0.1} metalness={0.7} /></mesh>
        </group>
      </group>

      {/* 4. Bùng binh & Đài phun nước trung tâm (Central Roundabout Fountain) */}
      <group position={[-4.5, 0.14, 0]}>
        <mesh receiveShadow position={[0, 0.02, 0]}><cylinderGeometry args={[0.65, 0.72, 0.04, 24]} /><meshStandardMaterial color="#CBD5E1" roughness={0.5} /></mesh>
        <mesh receiveShadow position={[0, 0.06, 0]}><cylinderGeometry args={[0.42, 0.46, 0.05, 20]} /><meshStandardMaterial color="#E2E8F0" roughness={0.3} /></mesh>
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
        <mesh castShadow position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.04, 0.08, 0.16, 12]} />
          <meshStandardMaterial color="#F59E0B" roughness={0.2} metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.28, 0]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color="#F59E0B" roughness={0.15} metalness={0.95} />
        </mesh>
      </group>

      {/* 5. Cây xanh sa bàn đa tầng (Instanced Sculpted Trees) */}
      <InstancedDioramaTrees />

      {/* 6. Cột đèn đường đô thị vi mô (Micro Streetlamps) */}
      {!isMobile && STREETLAMP_LOCATIONS.map(([lx, lz], i) => (
        <group key={`lamp-${i}`} position={[lx, 0.16, lz]}>
          <mesh position={[0, 0.14, 0]}>
            <cylinderGeometry args={[0.008, 0.012, 0.28, 5]} />
            <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.29, 0]}>
            <boxGeometry args={[0.035, 0.02, 0.035]} />
            <meshBasicMaterial color="#FEF08A" />
          </mesh>
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

export interface DioramaSkylineFrameLoopProps {
  readonly isVisible?: boolean;
  readonly beaconRef: React.RefObject<Mesh | null>;
}

export function DioramaSkylineFrameLoop({
  isVisible = true,
  beaconRef,
}: DioramaSkylineFrameLoopProps): null {
  useSafeFrame((state) => {
    if (!isVisible) return;
    const t = state.clock.getElapsedTime();
    if (beaconRef.current) {
      beaconRef.current.visible = calculateAviationStrobe(t, 1.3);
    }
  });

  return null;
}
