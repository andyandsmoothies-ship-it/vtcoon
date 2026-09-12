// [UI-S03/MSS] ProceduralBuilding — High-Fidelity 3D procedural architecture for tiers C0-C3
// Stylized Tabletop Miniature: Surveyor pegs, Indochine shophouse, Sapphire complex & Golden Landmark
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import type { Mesh, Group } from 'three';
import { GoldenGlowVFX } from './golden_glow_vfx';
import { useEnvironmentStore } from '../store/environment_store';
import { useVfxStore } from '../store/vfx_store';
import { calculateImpactDrop } from './construction_slam_vfx';

export interface ProceduralBuildingProps {
  readonly level: 0 | 1 | 2 | 3;
  readonly groupColor?: string;
  readonly cellIndex?: number;
}

function useSafeFrame(callback: (state: Parameters<Parameters<typeof useFrame>[0]>[0], delta: number) => void): void {
  try {
    useFrame(callback);
  } catch {
    // An toàn khi chạy ngoài Canvas (SSR hoặc test renderToStaticMarkup)
  }
}

const BOUNDARY_PEG_OFFSETS: ReadonlyArray<readonly [number, number]> = [
  [-0.24, -0.19],
  [0.24, -0.19],
  [-0.24, 0.19],
  [0.24, 0.19],
];

export function ProceduralBuilding({
  level,
  groupColor = '#3B82F6',
  cellIndex,
}: ProceduralBuildingProps): React.ReactElement {
  const rootGroupRef = useRef<Group>(null);
  const crownRef = useRef<Mesh>(null);
  const phase = useEnvironmentStore((s) => s.phase);
  const isNight = phase === 'night';
  const isSunset = phase === 'sunset';
  const activeSlam = useVfxStore((s) => (cellIndex !== undefined ? s.activeSlams[cellIndex] : undefined));

  // Đỉnh chóp hoàng kim của C3 xoay nhẹ và áp dụng hiệu ứng va đập khánh thành (Impact Drop)
  useSafeFrame((_, delta) => {
    if (level === 3 && crownRef.current) {
      crownRef.current.rotation.y += delta * 0.8;
    }
    if (rootGroupRef.current) {
      if (activeSlam) {
        const elapsed = Date.now() - activeSlam.startTime;
        const drop = calculateImpactDrop(elapsed, activeSlam.impactTimeMs);
        rootGroupRef.current.position.y = 0.22 + drop.yOffset;
        rootGroupRef.current.scale.set(drop.scaleXZ, drop.scaleY, drop.scaleXZ);
      } else {
        rootGroupRef.current.position.y = 0.22;
        rootGroupRef.current.scale.set(1, 1, 1);
      }
    }
  });

  return (
    <group ref={rootGroupRef} position={[0, 0.22, -0.42]}>
      {/* ========================================================
          CẤP 0: Khu Đất Quy Hoạch Thu Nhỏ (Surveyor Plot Boundary)
          Triệt tiêu hoàn toàn Standee 2.5D bằng mô hình cọc mốc 3D
         ======================================================== */}
      {level === 0 && (
        <group position={[0, 0, 0]}>
          {/* Bệ sa thạch phẳng viền quanh ô đất */}
          <mesh receiveShadow position={[0, 0.008, 0]}>
            <boxGeometry args={[0.58, 0.016, 0.48]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.7} />
          </mesh>

          {/* 4 Cọc mốc chỉ giới bê tông cắm tại 4 góc ô đất (sơn sọc Đỏ - Trắng) */}
          {BOUNDARY_PEG_OFFSETS.map(([px, pz], i) => (
            <group key={`peg-${i}`} position={[px, 0.04, pz]}>
              {/* Thân cọc bê tông trắng */}
              <mesh castShadow receiveShadow position={[0, 0, 0]}>
                <cylinderGeometry args={[0.018, 0.024, 0.08, 6]} />
                <meshStandardMaterial color="#F8FAFC" roughness={0.4} />
              </mesh>
              {/* Vạch sơn đỏ phản quang cảnh báo quy hoạch */}
              <mesh position={[0, 0.02, 0]}>
                <cylinderGeometry args={[0.02, 0.022, 0.025, 6]} />
                <meshStandardMaterial color="#DC2626" roughness={0.3} />
              </mesh>
            </group>
          ))}

          {/* Dây căng mốc chỉ giới mạ vàng đồng viền quanh 4 cọc */}
          <mesh position={[0, 0.065, -0.19]}>
            <boxGeometry args={[0.48, 0.006, 0.006]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.065, 0.19]}>
            <boxGeometry args={[0.48, 0.006, 0.006]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[-0.24, 0.065, 0]}>
            <boxGeometry args={[0.006, 0.006, 0.38]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0.24, 0.065, 0]}>
            <boxGeometry args={[0.006, 0.006, 0.38]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
          </mesh>

          {/* Biển cọc gỗ cắm tí hon: Bảng mốc quy hoạch thương mại */}
          <group position={[0, 0.07, 0.05]} rotation={[0.08, 0, 0]}>
            <mesh castShadow position={[0, 0, 0]}>
              <cylinderGeometry args={[0.008, 0.01, 0.12, 6]} />
              <meshStandardMaterial color="#78350F" roughness={0.7} />
            </mesh>
            <mesh position={[0, 0.06, 0.008]} castShadow>
              <boxGeometry args={[0.2, 0.08, 0.015]} />
              <meshStandardMaterial color="#FEF3C7" roughness={0.5} />
            </mesh>
            {/* Vạch màu nhận diện nhóm đất trên biển mốc */}
            <mesh position={[0, 0.085, 0.016]}>
              <boxGeometry args={[0.18, 0.015, 0.004]} />
              <meshStandardMaterial color={groupColor} roughness={0.3} />
            </mesh>
          </group>
        </group>
      )}

      {/* ========================================================
          CẤP 1: Nhà Phố Thương Mại Đông Dương (Indochine Shophouse)
         ======================================================== */}
      {level === 1 && (
        <group>
          {/* Chân móng đá bệ xám bo mép */}
          <RoundedBox args={[0.58, 0.05, 0.48]} radius={0.012} smoothness={2} position={[0, 0.025, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#475569" roughness={0.7} envMapIntensity={0.8} />
          </RoundedBox>

          {/* Thân nhà vàng kem Indochine bo vát mép */}
          <RoundedBox args={[0.52, 0.28, 0.42]} radius={0.015} smoothness={3} position={[0, 0.18, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#FEF3C7" roughness={0.45} envMapIntensity={0.8} />
          </RoundedBox>

          {/* Mặt tiền: Khung cửa gỗ gụ chính lõm */}
          <mesh position={[-0.12, 0.14, 0.212]} castShadow receiveShadow>
            <boxGeometry args={[0.15, 0.19, 0.02]} />
            <meshStandardMaterial color="#451A03" roughness={0.5} />
          </mesh>

          {/* Mặt tiền: Ô cửa kính ấm trưng bày sản phẩm với chỉ số khúc xạ ior = 1.52 */}
          <mesh position={[0.12, 0.14, 0.212]}>
            <boxGeometry args={[0.17, 0.15, 0.02]} />
            <meshPhysicalMaterial
              color="#FDE68A"
              roughness={0.04}
              ior={1.52}
              reflectivity={0.9}
              clearcoat={1.0}
              envMapIntensity={1.8}
              emissive="#F59E0B"
              emissiveIntensity={isNight ? 2.8 : isSunset ? 0.7 : 0.25}
            />
          </mesh>

          {/* Cửa sổ tầng trên phát quang ấm áp trong đêm */}
          <mesh position={[-0.12, 0.25, 0.212]}>
            <boxGeometry args={[0.12, 0.07, 0.02]} />
            <meshStandardMaterial
              color="#FDE68A"
              emissive="#FBBF24"
              emissiveIntensity={isNight ? 2.6 : isSunset ? 0.6 : 0.1}
            />
          </mesh>

          {/* Gờ phào chỉ trắng sứ phân tầng */}
          <mesh position={[0, 0.325, 0]} castShadow>
            <boxGeometry args={[0.55, 0.025, 0.45]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
          </mesh>

          {/* Mái ngói đỏ Bát Tràng dốc vươn ra ngoài mép tường */}
          <mesh position={[0, 0.44, 0]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0, 0.46, 0.22, 4]} />
            <meshStandardMaterial color="#B91C1C" roughness={0.38} />
          </mesh>

          {/* Gờ sống nóc ngói đắp nổi sẫm màu bắt sáng */}
          <mesh position={[0, 0.54, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.016, 0.016, 0.46, 8]} />
            <meshStandardMaterial color="#7F1D1D" roughness={0.4} />
          </mesh>

          {/* Biển hiệu shophouse mini mang màu nhóm đất */}
          <RoundedBox args={[0.36, 0.045, 0.02]} radius={0.008} smoothness={2} position={[0, 0.3, 0.22]} castShadow>
            <meshStandardMaterial
              color={groupColor}
              roughness={0.3}
              metalness={0.2}
              emissive={groupColor}
              emissiveIntensity={isNight ? 2.5 : isSunset ? 0.45 : 0.0}
              envMapIntensity={1.2}
            />
          </RoundedBox>
        </group>
      )}

      {/* ========================================================
          CẤP 2: Khối Cao Ốc Thương Mại Kính Sapphire Hiện Đại
         ======================================================== */}
      {level === 2 && (
        <group>
          {/* Khối đế thương mại mang màu nhóm đất bo viền vát */}
          <RoundedBox args={[0.6, 0.16, 0.5]} radius={0.02} smoothness={3} position={[0, 0.08, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={groupColor} roughness={0.3} metalness={0.3} envMapIntensity={1.0} />
          </RoundedBox>

          {/* Sảnh đón kính Sapphire tầng trệt với chỉ số khúc xạ ior = 1.52 */}
          <mesh position={[0, 0.07, 0.252]} castShadow receiveShadow>
            <boxGeometry args={[0.3, 0.12, 0.02]} />
            <meshPhysicalMaterial
              color="#0284C7"
              roughness={0.04}
              metalness={0.85}
              ior={1.52}
              reflectivity={0.9}
              clearcoat={1.0}
              clearcoatRoughness={0.02}
              envMapIntensity={1.8}
              emissive="#38BDF8"
              emissiveIntensity={isNight ? 2.6 : isSunset ? 0.45 : 0.0}
            />
          </mesh>

          {/* Mái hiên đón khách (Canopy) nhô ra phía trước */}
          <mesh position={[0, 0.14, 0.28]} castShadow>
            <boxGeometry args={[0.34, 0.02, 0.07]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.2} metalness={0.5} envMapIntensity={1.2} />
          </mesh>

          {/* Thân tháp kính Sapphire PBR bo mép phản chiếu môi trường IBL */}
          <RoundedBox args={[0.52, 0.52, 0.42]} radius={0.025} smoothness={4} position={[0, 0.42, 0]} castShadow receiveShadow>
            <meshPhysicalMaterial
              color="#0284C7"
              roughness={0.04}
              metalness={0.85}
              ior={1.52}
              reflectivity={0.95}
              clearcoat={1.0}
              clearcoatRoughness={0.02}
              envMapIntensity={2.0}
            />
          </RoundedBox>

          {/* Dải ô cửa sổ văn phòng sáng đèn phát quang trong đêm (Luminous Office Windows) */}
          <mesh position={[0, 0.35, 0.212]}>
            <boxGeometry args={[0.44, 0.05, 0.01]} />
            <meshStandardMaterial
              color="#FEF08A"
              emissive="#FDE047"
              emissiveIntensity={isNight ? 3.0 : isSunset ? 0.7 : 0.1}
            />
          </mesh>
          <mesh position={[0, 0.49, 0.212]}>
            <boxGeometry args={[0.44, 0.05, 0.01]} />
            <meshStandardMaterial
              color="#38BDF8"
              emissive="#00F5FF"
              emissiveIntensity={isNight ? 3.2 : isSunset ? 0.7 : 0.1}
            />
          </mesh>

          {/* Các dải lam nhôm chắn nắng Titan chia tầng */}
          {[0.28, 0.42, 0.56].map((ly, idx) => (
            <mesh key={`louver-${idx}`} position={[0, ly, 0]} castShadow>
              <boxGeometry args={[0.54, 0.02, 0.44]} />
              <meshStandardMaterial color="#CBD5E1" roughness={0.2} metalness={0.75} envMapIntensity={1.6} />
            </mesh>
          ))}

          {/* Viền LED Neon nóc tòa nhà Sapphire */}
          <mesh position={[0, 0.69, 0]}>
            <boxGeometry args={[0.53, 0.015, 0.43]} />
            <meshStandardMaterial
              color="#38BDF8"
              emissive="#00F5FF"
              emissiveIntensity={isNight ? 3.5 : isSunset ? 0.8 : 0.0}
            />
          </mesh>

          {/* Buồng kỹ thuật thang máy trên nóc */}
          <RoundedBox args={[0.2, 0.1, 0.2]} radius={0.01} smoothness={2} position={[-0.08, 0.72, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#475569" roughness={0.5} envMapIntensity={0.8} />
          </RoundedBox>

          {/* Cột ăng-ten kim loại trên đỉnh */}
          <mesh position={[0.1, 0.74, 0]} castShadow>
            <cylinderGeometry args={[0.007, 0.012, 0.18, 6]} />
            <meshStandardMaterial color="#94A3B8" metalness={0.9} roughness={0.2} envMapIntensity={1.8} />
          </mesh>
        </group>
      )}

      {/* ========================================================
          CẤP 3: Quần Thể Landmark Hoàng Kim (Khống chế chiều cao an toàn Y <= 0.92)
         ======================================================== */}
      {level === 3 && (
        <group>
          {/* Bệ cảnh quan cẩm thạch đá hoa cương chân tháp bo mép vát */}
          <RoundedBox args={[0.62, 0.06, 0.5]} radius={0.015} smoothness={3} position={[0, 0.03, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#1E293B" roughness={0.25} metalness={0.3} envMapIntensity={1.2} />
          </RoundedBox>

          {/* Tháp phụ (bên trái, thấp hơn) - phong cách Champagne Gold & Kính Sapphire bo góc */}
          <RoundedBox args={[0.24, 0.52, 0.36]} radius={0.02} smoothness={3} position={[-0.14, 0.32, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#FEF3C7" roughness={0.25} metalness={0.3} envMapIntensity={1.4} />
          </RoundedBox>
          {/* Cửa sổ kính sapphire tháp phụ với chỉ số khúc xạ ior = 1.52 */}
          <mesh position={[-0.14, 0.32, 0.185]}>
            <boxGeometry args={[0.18, 0.42, 0.01]} />
            <meshPhysicalMaterial
              color="#0284C7"
              roughness={0.04}
              metalness={0.85}
              ior={1.52}
              reflectivity={0.9}
              clearcoat={1.0}
              clearcoatRoughness={0.02}
              envMapIntensity={1.8}
              emissive="#38BDF8"
              emissiveIntensity={isNight ? 2.8 : isSunset ? 0.55 : 0.0}
            />
          </mesh>

          {/* Vương miện vàng tháp phụ */}
          <RoundedBox args={[0.22, 0.03, 0.34]} radius={0.008} smoothness={2} position={[-0.14, 0.6, 0]} castShadow>
            <meshStandardMaterial
              color="#F59E0B"
              roughness={0.1}
              metalness={0.95}
              envMapIntensity={2.0}
              emissive="#F59E0B"
              emissiveIntensity={isNight ? 2.8 : isSunset ? 0.55 : 0.0}
            />
          </RoundedBox>

          {/* Tháp chính (bên phải) - tháp ngà Art Deco vươn cao bo góc */}
          <RoundedBox args={[0.24, 0.72, 0.36]} radius={0.02} smoothness={3} position={[0.14, 0.42, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#FDE68A" roughness={0.2} metalness={0.4} envMapIntensity={1.5} />
          </RoundedBox>
          {/* Cửa sổ kính sapphire tháp chính với chỉ số khúc xạ ior = 1.52 */}
          <mesh position={[0.14, 0.42, 0.185]}>
            <boxGeometry args={[0.18, 0.58, 0.01]} />
            <meshPhysicalMaterial
              color="#0284C7"
              roughness={0.04}
              metalness={0.85}
              ior={1.52}
              reflectivity={0.9}
              clearcoat={1.0}
              clearcoatRoughness={0.02}
              envMapIntensity={1.8}
              emissive="#38BDF8"
              emissiveIntensity={isNight ? 3.0 : isSunset ? 0.6 : 0.0}
            />
          </mesh>

          {/* Cầu kính trên không (Skybridge) kết nối 2 tháp ở tầng giữa */}
          <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.1, 0.06, 0.16]} />
            <meshPhysicalMaterial
              color="#38BDF8"
              roughness={0.04}
              metalness={0.8}
              ior={1.52}
              clearcoat={1.0}
              envMapIntensity={2.0}
              emissive="#00F5FF"
              emissiveIntensity={isNight ? 3.2 : isSunset ? 0.7 : 0.1}
            />
          </mesh>
          <RoundedBox args={[0.12, 0.015, 0.18]} radius={0.004} smoothness={2} position={[0, 0.42, 0]} castShadow>
            <meshStandardMaterial
              color="#F59E0B"
              roughness={0.1}
              metalness={0.95}
              envMapIntensity={2.0}
              emissive="#F59E0B"
              emissiveIntensity={isNight ? 2.8 : 0.0}
            />
          </RoundedBox>

          {/* Đường viền LED Neon vàng champagne đứng dọc góc tháp chính */}
          <mesh position={[0.262, 0.42, 0.182]}>
            <boxGeometry args={[0.008, 0.68, 0.008]} />
            <meshStandardMaterial
              color="#F59E0B"
              emissive="#F59E0B"
              emissiveIntensity={isNight ? 3.5 : isSunset ? 0.8 : 0.0}
            />
          </mesh>

          {/* Đỉnh kim tự tháp mạ vàng 24K Champagne tự xoay trên tháp chính */}
          <mesh ref={crownRef} position={[0.14, 0.84, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <cylinderGeometry args={[0, 0.18, 0.16, 4]} />
            <meshStandardMaterial
              color="#F59E0B"
              roughness={0.06}
              metalness={0.98}
              envMapIntensity={2.2}
              emissive="#F59E0B"
              emissiveIntensity={isNight ? 2.8 : isSunset ? 0.6 : 0.1}
            />
          </mesh>

          {/* Cột kim thu lôi mạ vàng đón sáng */}
          <mesh position={[0.14, 0.94, 0]} castShadow>
            <cylinderGeometry args={[0.005, 0.012, 0.12, 6]} />
            <meshStandardMaterial color="#FBBF24" roughness={0.08} metalness={1.0} envMapIntensity={2.0} />
          </mesh>

          {/* Hạt bụi vàng lấp lánh đỉnh tháp */}
          <GoldenGlowVFX position={[0.14, 0.88, 0]} />
        </group>
      )}
    </group>
  );
}
