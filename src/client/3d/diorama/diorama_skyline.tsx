// [UI-S02/MSS] DioramaSkyline — Stepped financial towers, Indochine villas, Old Quarter shophouses, central fountain & diorama flora
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group, Mesh } from 'three';
import {
  useEnvironmentStore,
  calculateAviationStrobe,
  calculateLaserRotation,
} from '../../store/environment_store';

function useSafeFrame(callback: (state: Parameters<Parameters<typeof useFrame>[0]>[0], delta: number) => void): void {
  try {
    useFrame(callback);
  } catch {
    // Safe outside Canvas
  }
}

// Toạ độ cây xanh sa bàn tỉa tán đa tầng (20 vị trí phủ xanh mật độ đô thị)
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

export function DioramaSkyline(): React.ReactElement {
  const phase = useEnvironmentStore((s) => s.phase);
  const isNight = phase === 'night';
  const isSunset = phase === 'sunset';

  const beaconRef = useRef<Mesh>(null);
  const laserRef = useRef<Group>(null);

  useSafeFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (beaconRef.current) {
      const isStrobe = calculateAviationStrobe(t, 1.3);
      beaconRef.current.visible = isNight ? isStrobe : false;
    }
    if (laserRef.current) {
      laserRef.current.rotation.y = calculateLaserRotation(t, 0.65);
    }
  });
  return (
    <group position={[0, 0, 0]}>
      {/* ========================================================
          1. KHU TÀI CHÍNH SKYLINE (TÂY BẮC: X ~ -4.5, Z ~ -4.2)
         ======================================================== */}
      <group position={[-4.5, 0.16, -4.2]}>
        {/* Tháp Landmark Búp Sen (Bitexco-styled Financial Tower) */}
        <group position={[-0.4, 0, -0.4]}>
          <mesh castShadow receiveShadow position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.26, 0.38, 1.2, 16]} />
            <meshStandardMaterial color="#0284C7" roughness={0.15} metalness={0.85} />
          </mesh>
          {/* Sân đỗ trực thăng chìa ra ngoài thân tháp (Cantilevered Helipad) */}
          <mesh position={[0.26, 0.8, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.16, 0.03, 16]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.4} metalness={0.6} />
          </mesh>
          <mesh position={[0.26, 0.82, 0]}>
            <ringGeometry args={[0.1, 0.13, 16]} />
            <meshBasicMaterial color="#F59E0B" />
          </mesh>
          {/* Kim thu lôi mạ vàng */}
          <mesh position={[0, 1.3, 0]} castShadow>
            <cylinderGeometry args={[0.008, 0.015, 0.22, 6]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.95} roughness={0.1} />
          </mesh>
          {/* Đèn cảnh báo tĩnh không đỏ nhấp nháy trên đỉnh tháp (Aviation Red Strobe Beacon) */}
          <mesh ref={beaconRef} position={[0, 1.42, 0]}>
            <sphereGeometry args={[0.024, 8, 8]} />
            <meshBasicMaterial color="#EF4444" />
          </mesh>
          {/* Tia laser quét bầu trời đêm xoay nhẹ (Rotating Night Sky Laser) */}
          <group ref={laserRef} position={[0, 1.36, 0]}>
            <mesh position={[1.0, 0.4, 0]} rotation={[0, 0, -Math.PI / 3.2]}>
              <cylinderGeometry args={[0.006, 0.035, 2.4, 6, 1, true]} />
              <meshBasicMaterial
                color="#38BDF8"
                transparent
                opacity={isNight ? 0.35 : 0.0}
                depthWrite={false}
              />
            </mesh>
          </group>
        </group>

        {/* Cao ốc kính Sapphire giật cấp (Stepped Commercial Tower) */}
        <group position={[0.6, 0, 0.3]}>
          <mesh castShadow receiveShadow position={[0, 0.45, 0]}>
            <boxGeometry args={[0.55, 0.9, 0.55]} />
            <meshStandardMaterial color="#0F172A" roughness={0.2} metalness={0.8} />
          </mesh>
          {/* Cửa sổ văn phòng phát quang ban đêm */}
          <mesh position={[0, 0.45, 0.28]}>
            <boxGeometry args={[0.42, 0.04, 0.01]} />
            <meshStandardMaterial
              color="#FEF08A"
              emissive="#FDE047"
              emissiveIntensity={isNight ? 2.8 : isSunset ? 0.6 : 0.0}
            />
          </mesh>
          <mesh castShadow position={[0, 0.98, 0]}>
            <boxGeometry args={[0.38, 0.18, 0.38]} />
            <meshStandardMaterial color="#38BDF8" roughness={0.1} metalness={0.9} />
          </mesh>
          <mesh position={[0, 1.1, 0]}>
            <boxGeometry args={[0.22, 0.06, 0.22]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.3} metalness={0.5} />
          </mesh>
        </group>

        {/* Khối văn phòng thương mại thấp tầng mái xanh */}
        <group position={[-0.8, 0, 0.6]}>
          <mesh castShadow receiveShadow position={[0, 0.25, 0]}>
            <boxGeometry args={[0.48, 0.5, 0.42]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.51, 0]}>
            <boxGeometry args={[0.42, 0.02, 0.36]} />
            <meshStandardMaterial color="#166534" roughness={0.8} />
          </mesh>
        </group>
      </group>

      {/* ========================================================
          2. KHU PHỐ CỔ DI SẢN & BIỆT THỰ ĐÔNG DƯƠNG (TÂY NAM: X ~ -4.5)
         ======================================================== */}
      <group position={[-4.5, 0.16, 4.2]}>
        {/* Biệt thự chính 2 tầng mái ngói đất nung */}
        <group position={[-0.3, 0, 0]}>
          <mesh castShadow receiveShadow position={[0, 0.16, 0]}>
            <boxGeometry args={[0.7, 0.32, 0.55]} />
            <meshStandardMaterial color="#FEF3C7" roughness={0.6} />
          </mesh>
          <mesh castShadow position={[0, 0.38, 0]}>
            <coneGeometry args={[0.55, 0.2, 4]} />
            <meshStandardMaterial color="#B91C1C" roughness={0.45} />
          </mesh>
          <mesh position={[0, 0.15, 0.29]}>
            <boxGeometry args={[0.55, 0.06, 0.04]} />
            <meshStandardMaterial color="#78350F" roughness={0.6} />
          </mesh>
        </group>

        {/* Gian nhà phụ bên hồ sen */}
        <group position={[0.65, 0, 0.4]}>
          <mesh castShadow receiveShadow position={[0, 0.12, 0]}>
            <boxGeometry args={[0.45, 0.24, 0.4]} />
            <meshStandardMaterial color="#FEF3C7" roughness={0.6} />
          </mesh>
          <mesh castShadow position={[0, 0.28, 0]}>
            <coneGeometry args={[0.38, 0.16, 4]} />
            <meshStandardMaterial color="#B91C1C" roughness={0.45} />
          </mesh>
        </group>
      </group>

      {/* 2.1. Dãy nhà phố cổ Hội An mái ngói san sát ven sông (Old Quarter Shophouses) */}
      <group position={[-4.5, 0.16, 1.8]}>
        {[-0.6, 0.1, 0.8].map((ox, idx) => (
          <group key={`shophouse-west-${idx}`} position={[ox, 0, 0]}>
            <mesh castShadow receiveShadow position={[0, 0.15, 0]}>
              <boxGeometry args={[0.42, 0.3, 0.5]} />
              <meshStandardMaterial color={idx === 1 ? '#FDE047' : '#FEF3C7'} roughness={0.5} />
            </mesh>
            <mesh castShadow position={[0, 0.35, 0]} rotation={[0, 0, 0]}>
              <coneGeometry args={[0.38, 0.14, 4]} />
              <meshStandardMaterial color="#B91C1C" roughness={0.4} />
            </mesh>
            {/* Hiên che nắng dốc và đèn lồng đỏ */}
            <mesh position={[0, 0.14, 0.26]} rotation={[0.3, 0, 0]}>
              <boxGeometry args={[0.38, 0.02, 0.12]} />
              <meshStandardMaterial color="#B91C1C" roughness={0.5} />
            </mesh>
            {/* Đèn lồng đỏ Hội An phát sáng ban đêm */}
            <mesh position={[0, 0.09, 0.29]}>
              <sphereGeometry args={[0.025, 8, 8]} />
              <meshStandardMaterial
                color="#DC2626"
                emissive="#EF4444"
                emissiveIntensity={isNight ? 3.0 : isSunset ? 0.8 : 0.1}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* ========================================================
          3. BÙNG BINH & ĐÀI PHUN NƯỚC TRUNG TÂM (Central Roundabout Fountain)
         ======================================================== */}
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
        {/* Mặt nước hồ phun trong xanh với đèn LED ngầm dưới nước ban đêm */}
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

      {/* ========================================================
          4. HỆ THỐNG CÂY XANH TỈA TÁN SA BÀN ĐA TẦNG (Sculpted Trees)
         ======================================================== */}
      {TREE_LOCATIONS.map(([tx, tz], i) => (
        <group key={`tree-${i}`} position={[tx, 0.16, tz]}>
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.035, 0.2, 6]} />
            <meshStandardMaterial color="#78350F" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
            <coneGeometry args={[0.16, 0.18, 7]} />
            <meshStandardMaterial color="#166534" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.32, 0]} castShadow>
            <coneGeometry args={[0.12, 0.15, 7]} />
            <meshStandardMaterial color="#15803D" roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* ========================================================
          5. CỘT ĐÈN ĐƯỜNG ĐÔ THỊ VI MÔ (Micro Streetlamps)
         ======================================================== */}
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
