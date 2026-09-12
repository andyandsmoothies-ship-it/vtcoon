// [UI-S02/MSS] DioramaContainerPort — Cat Lai container seaport, gantry cranes & colored intermodal container stacks
import React, { useRef } from 'react';
import { RoundedBox } from '@react-three/drei';
import type { Group, Mesh } from 'three';
import { useEnvironmentStore, calculateAviationStrobe } from '../../store/environment_store';
import { useSafeFrame } from '../safe_frame';

// Cụm các container xếp chồng tại bãi cảng Cát Lái (chuẩn màu sơn công nghiệp hàng hải PBR)
interface ContainerBlockDef {
  readonly pos: [number, number, number];
  readonly size: [number, number, number];
  readonly color: string;
}

const CONTAINER_BLOCKS: readonly ContainerBlockDef[] = [
  // Hàng 1 (Tầng trệt)
  { pos: [-0.6, 0.08, -0.4], size: [0.3, 0.14, 0.65], color: '#0284C7' }, // Maersk Maritime Blue
  { pos: [-0.6, 0.08, 0.35], size: [0.3, 0.14, 0.65], color: '#991B1B' }, // Yang Ming Brick Red
  { pos: [-0.25, 0.08, -0.2], size: [0.3, 0.14, 0.65], color: '#15803D' }, // Evergreen Shipping Green
  { pos: [-0.25, 0.08, 0.5], size: [0.3, 0.14, 0.65], color: '#C2410C' }, // Hapag-Lloyd Rust
  { pos: [0.1, 0.08, -0.4], size: [0.3, 0.14, 0.65], color: '#D97706' }, // DHL Industrial Amber
  { pos: [0.1, 0.08, 0.35], size: [0.3, 0.14, 0.65], color: '#334155' }, // Slate Charcoal

  // Hàng 2 (Tầng 2 xếp chồng)
  { pos: [-0.6, 0.22, -0.1], size: [0.3, 0.14, 0.65], color: '#15803D' },
  { pos: [-0.25, 0.22, 0.2], size: [0.3, 0.14, 0.65], color: '#0284C7' },
  { pos: [0.1, 0.22, -0.2], size: [0.3, 0.14, 0.65], color: '#991B1B' },

  // Hàng 3 (Tầng 3 ngẫu nhiên)
  { pos: [-0.42, 0.36, 0.05], size: [0.3, 0.14, 0.65], color: '#D97706' },
];

export function DioramaContainerPort(): React.ReactElement {
  const phase = useEnvironmentStore((s) => s.phase);
  const isNight = phase === 'night';
  const isSunset = phase === 'sunset';

  const boom1Ref = useRef<Group>(null);
  const hoist1Ref = useRef<Group>(null);
  const boom2Ref = useRef<Group>(null);
  const hoist2Ref = useRef<Group>(null);
  const beacon1Ref = useRef<Mesh>(null);
  const beacon2Ref = useRef<Mesh>(null);

  useSafeFrame((state) => {
    const t = state.clock.elapsedTime;
    // Cần cẩu 1: Tự động xoay góc cần trục yaw từ -25 độ đến +25 độ (0.436 rad)
    if (boom1Ref.current) {
      boom1Ref.current.rotation.y = Math.sin(t * 0.7) * 0.436;
    }
    // Cáp cẩu container 1 nhấp nhô dưới dầm cẩu theo chu kỳ thời gian thực
    if (hoist1Ref.current) {
      hoist1Ref.current.position.y = -0.27 + Math.sin(t * 1.5) * 0.08;
    }

    // Cần cẩu 2: Xoay yaw lệch pha
    if (boom2Ref.current) {
      boom2Ref.current.rotation.y = Math.sin(t * 0.6 + 1.2) * 0.436;
    }
    // Cáp cẩu container 2 nâng hạ dưới dầm cẩu
    if (hoist2Ref.current) {
      hoist2Ref.current.position.y = -0.32 + Math.cos(t * 1.3) * 0.07;
    }

    // Đèn chớp cảnh báo tĩnh không đỏ trên đỉnh cẩu
    const isStrobe = calculateAviationStrobe(t, 1.25);
    if (beacon1Ref.current) beacon1Ref.current.visible = isNight ? isStrobe : false;
    if (beacon2Ref.current) beacon2Ref.current.visible = isNight ? isStrobe : false;
  });

  return (
    <group position={[4.5, 0.16, 2.0]} data-testid="diorama-container-port">
      {/* 1. MẶT BẰNG CẦU CẢNG BÊ TÔNG (Seaport Concrete Apron với Bo Viền) */}
      <RoundedBox args={[1.8, 0.08, 2.2]} radius={0.016} smoothness={2} receiveShadow position={[0, 0.04, 0]}>
        <meshStandardMaterial color="#475569" roughness={0.7} envMapIntensity={0.6} />
      </RoundedBox>
      {/* Vạch sơn cảnh báo an toàn màu vàng ở mép bến */}
      <mesh position={[-0.85, 0.082, 0]}>
        <boxGeometry args={[0.06, 0.005, 2.16]} />
        <meshBasicMaterial color="#FACC15" />
      </mesh>

      {/* 2. CẦN CẨU GIÀN CONTAINER KHỔNG LỒ (Gantry Crane 1 - Phía Bắc) */}
      <group position={[-0.8, 0.08, -0.6]}>
        {/* Chân cẩu chữ A (Portal Frame) màu cam công nghiệp */}
        <mesh castShadow position={[0, 0.45, -0.3]}>
          <boxGeometry args={[0.08, 0.9, 0.08]} />
          <meshStandardMaterial color="#EA580C" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh castShadow position={[0, 0.45, 0.3]}>
          <boxGeometry args={[0.08, 0.9, 0.08]} />
          <meshStandardMaterial color="#EA580C" metalness={0.6} roughness={0.3} />
        </mesh>

        {/* Đèn cảnh báo tĩnh không đỏ nhấp nháy đỉnh cẩu 1 */}
        <mesh ref={beacon1Ref} position={[0, 0.98, 0]}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshBasicMaterial color="#EF4444" />
        </mesh>

        {/* Cụm dầm xoay quanh trục Yaw (-25 độ đến +25 độ) */}
        <group ref={boom1Ref} position={[0, 0.92, 0]}>
          {/* Dầm ngang chính vươn dài ra mép nước (Crane Boom) */}
          <mesh castShadow position={[-0.2, 0, 0]}>
            <boxGeometry args={[0.85, 0.09, 0.7]} />
            <meshStandardMaterial color="#EA580C" metalness={0.6} roughness={0.3} />
          </mesh>
          {/* Cabin điều khiển cẩu màu trắng với đèn cabin ban đêm */}
          <mesh position={[0.05, -0.1, -0.2]}>
            <boxGeometry args={[0.12, 0.1, 0.14]} />
            <meshStandardMaterial
              color="#F8FAFC"
              roughness={0.2}
              emissive="#FEF08A"
              emissiveIntensity={isNight ? 1.0 : 0.0}
            />
          </mesh>

          {/* Cáp cẩu & khung chụp spreader nhấp nhô theo chu kỳ */}
          <group ref={hoist1Ref} position={[-0.35, -0.27, 0]}>
            {/* Dây cáp cẩu thép */}
            <mesh position={[0, 0.12, 0]}>
              <cylinderGeometry args={[0.004, 0.004, 0.24, 4]} />
              <meshStandardMaterial color="#334155" metalness={0.9} />
            </mesh>
            {/* Khung chụp container treo cáp (Spreader) */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.18, 0.04, 0.35]} />
              <meshStandardMaterial color="#FACC15" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        </group>
      </group>

      {/* CẦN CẨU GIÀN CONTAINER (Gantry Crane 2 - Phía Nam) */}
      <group position={[-0.8, 0.08, 0.6]}>
        <mesh castShadow position={[0, 0.45, -0.3]}>
          <boxGeometry args={[0.08, 0.9, 0.08]} />
          <meshStandardMaterial color="#F59E0B" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh castShadow position={[0, 0.45, 0.3]}>
          <boxGeometry args={[0.08, 0.9, 0.08]} />
          <meshStandardMaterial color="#F59E0B" metalness={0.6} roughness={0.3} />
        </mesh>

        {/* Đèn cảnh báo tĩnh không đỏ nhấp nháy đỉnh cẩu 2 */}
        <mesh ref={beacon2Ref} position={[0, 0.98, 0]}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshBasicMaterial color="#EF4444" />
        </mesh>

        {/* Cụm dầm xoay quanh trục Yaw cẩu 2 */}
        <group ref={boom2Ref} position={[0, 0.92, 0]}>
          <mesh castShadow position={[-0.2, 0, 0]}>
            <boxGeometry args={[0.85, 0.09, 0.7]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0.05, -0.1, 0.2]}>
            <boxGeometry args={[0.12, 0.1, 0.14]} />
            <meshStandardMaterial
              color="#F8FAFC"
              roughness={0.2}
              emissive="#FEF08A"
              emissiveIntensity={isNight ? 1.0 : 0.0}
            />
          </mesh>

          {/* Cáp cẩu & Container đang được nhấc bổng */}
          <group ref={hoist2Ref} position={[-0.35, -0.35, 0]}>
            <mesh position={[0, 0.16, 0]}>
              <cylinderGeometry args={[0.004, 0.004, 0.32, 4]} />
              <meshStandardMaterial color="#334155" metalness={0.9} />
            </mesh>
            <mesh castShadow position={[0, 0, 0]}>
              <boxGeometry args={[0.26, 0.12, 0.55]} />
              <meshStandardMaterial color="#0284C7" roughness={0.4} />
            </mesh>
          </group>
        </group>
      </group>

      {/* 3. BÃI CONTAINER XẾP CHỒNG (Intermodal Container Stacks với Beveled Edges) */}
      <group position={[0.2, 0.08, 0]}>
        {/* Đệm mặt sàn bãi tối màu tạo độ sâu và bóng tiếp xúc chân bãi */}
        <mesh receiveShadow position={[-0.25, 0.003, 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.25, 1.7]} />
          <meshStandardMaterial color="#1E293B" roughness={0.9} />
        </mesh>
        {CONTAINER_BLOCKS.map((cb, idx) => (
          <group key={`container-${idx}`} position={cb.pos}>
            {/* Khối hộp container chính bo viền vát cạnh */}
            <RoundedBox
              args={cb.size}
              radius={0.008}
              smoothness={2}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial
                color={cb.color}
                roughness={0.65}
                metalness={0.4}
                envMapIntensity={0.8}
              />
            </RoundedBox>
            {/* Nẹp viền nóc container kim loại */}
            <RoundedBox
              args={[cb.size[0] * 0.94, 0.006, cb.size[2] * 0.94]}
              radius={0.002}
              smoothness={1}
              position={[0, cb.size[1] / 2 + 0.002, 0]}
            >
              <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.5} />
            </RoundedBox>
          </group>
        ))}
      </group>

      {/* 4. XE ĐẦU KÉO CONTAINER CHỞ HÀNG (Port Container Tractor với Bo Mép) */}
      <group position={[0.65, 0.11, -0.65]}>
        {/* Cabin đầu kéo màu vàng hổ phách bo góc */}
        <RoundedBox args={[0.12, 0.12, 0.14]} radius={0.012} smoothness={2} castShadow position={[0, 0.06, -0.16]}>
          <meshStandardMaterial color="#D97706" roughness={0.4} metalness={0.3} />
        </RoundedBox>
        {/* Rơ-moóc chở container */}
        <mesh castShadow position={[0, 0.04, 0.1]}>
          <boxGeometry args={[0.12, 0.04, 0.36]} />
          <meshStandardMaterial color="#1E293B" roughness={0.7} />
        </mesh>
        {/* Container trên rơ-moóc bo viền */}
        <RoundedBox args={[0.14, 0.12, 0.34]} radius={0.008} smoothness={2} castShadow position={[0, 0.12, 0.1]}>
          <meshStandardMaterial color="#991B1B" roughness={0.65} metalness={0.4} />
        </RoundedBox>
      </group>
    </group>
  );
}
