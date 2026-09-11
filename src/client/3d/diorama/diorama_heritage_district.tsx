// [UI-S02/MSS] DioramaHeritageDistrict — Ben Thanh Market clock tower & Red-brick Indochine Cathedral
import React from 'react';
import { useEnvironmentStore } from '../../store/environment_store';

export function DioramaHeritageDistrict(): React.ReactElement {
  const phase = useEnvironmentStore((s) => s.phase);
  const isNight = phase === 'night';
  const isSunset = phase === 'sunset';

  return (
    <group position={[-4.5, 0.16, 2.9]} data-testid="diorama-heritage-district">
      {/* ========================================================
          1. CHỢ BẾN THÀNH BIỂU TƯỢNG (Iconic Ben Thanh Market)
         ======================================================== */}
      <group position={[0.2, 0, -0.7]}>
        {/* Nền móng chợ lát gạch vỉa hè */}
        <mesh receiveShadow position={[0, 0.02, 0]}>
          <boxGeometry args={[1.2, 0.04, 1.0]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.6} />
        </mesh>

        {/* Khối nhà lồng chợ phía sau mái ngói đất nung đỏ */}
        <mesh castShadow receiveShadow position={[0, 0.12, 0.2]}>
          <boxGeometry args={[1.0, 0.18, 0.55]} />
          <meshStandardMaterial color="#FEF3C7" roughness={0.5} />
        </mesh>
        <mesh castShadow position={[0, 0.25, 0.2]}>
          <coneGeometry args={[0.7, 0.14, 4]} />
          <meshStandardMaterial color="#B91C1C" roughness={0.4} />
        </mesh>

        {/* Tháp đồng hồ trung tâm mặt tiền vươn cao */}
        <group position={[0, 0, -0.2]}>
          {/* Chân tháp vàng kem Indochine */}
          <mesh castShadow receiveShadow position={[0, 0.22, 0]}>
            <boxGeometry args={[0.42, 0.4, 0.42]} />
            <meshStandardMaterial
              color="#FDE047"
              roughness={0.45}
              emissive="#FDE047"
              emissiveIntensity={isNight ? 0.6 : isSunset ? 0.25 : 0.0}
            />
          </mesh>
          {/* Cổng vòm chợ phía dưới */}
          <mesh position={[0, 0.1, -0.215]}>
            <boxGeometry args={[0.2, 0.18, 0.02]} />
            <meshStandardMaterial color="#1E293B" roughness={0.8} />
          </mesh>
          {/* Mặt đồng hồ tròn phía trước phát sáng vàng ấm ban đêm */}
          <mesh position={[0, 0.32, -0.215]}>
            <circleGeometry args={[0.08, 16]} />
            <meshBasicMaterial color={isNight ? '#FEF08A' : '#FFFFFF'} />
          </mesh>
          <mesh position={[0, 0.32, -0.218]}>
            <ringGeometry args={[0.075, 0.085, 16]} />
            <meshBasicMaterial color="#78350F" />
          </mesh>
          {/* Kim đồng hồ chỉ 10h10 */}
          <mesh position={[0, 0.32, -0.22]}>
            <boxGeometry args={[0.008, 0.06, 0.002]} />
            <meshBasicMaterial color="#0F172A" />
          </mesh>
          {/* Mái chóp ngói đỏ tam giác 3 tầng giật cấp đặc trưng */}
          <mesh castShadow position={[0, 0.48, 0]}>
            <coneGeometry args={[0.34, 0.18, 4]} />
            <meshStandardMaterial color="#DC2626" roughness={0.35} />
          </mesh>
          <mesh castShadow position={[0, 0.58, 0]}>
            <coneGeometry args={[0.22, 0.12, 4]} />
            <meshStandardMaterial color="#B91C1C" roughness={0.35} />
          </mesh>
          {/* Cột cờ đỉnh tháp */}
          <mesh position={[0, 0.68, 0]}>
            <cylinderGeometry args={[0.006, 0.008, 0.12, 4]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.9} />
          </mesh>
        </group>
      </group>

      {/* ========================================================
          2. NHÀ THỜ CỔ GẠCH ĐỎ ĐÔNG DƯƠNG (Heritage Cathedral)
         ======================================================== */}
      <group position={[0.2, 0, 0.75]}>
        {/* Gian thánh đường chính bằng gạch đỏ trần */}
        <mesh castShadow receiveShadow position={[0, 0.22, 0.1]}>
          <boxGeometry args={[0.62, 0.4, 0.7]} />
          <meshStandardMaterial color="#B45309" roughness={0.65} />
        </mesh>
        {/* Mái ngói thánh đường chữ V vát dốc */}
        <mesh castShadow position={[0, 0.48, 0.1]} rotation={[0, 0, 0]}>
          <coneGeometry args={[0.48, 0.2, 4]} />
          <meshStandardMaterial color="#78350F" roughness={0.5} />
        </mesh>

        {/* Cửa sổ hoa hồng tròn (Rose Window) ở mặt tiền phát quang kính màu đêm */}
        <mesh position={[0, 0.3, -0.26]}>
          <circleGeometry args={[0.09, 16]} />
          <meshStandardMaterial
            color="#0284C7"
            roughness={0.1}
            metalness={0.8}
            emissive="#38BDF8"
            emissiveIntensity={isNight ? 1.1 : isSunset ? 0.45 : 0.0}
          />
        </mesh>
        <mesh position={[0, 0.3, -0.262]}>
          <ringGeometry args={[0.085, 0.095, 16]} />
          <meshBasicMaterial color="#F59E0B" />
        </mesh>

        {/* Hai tháp chuông đối xứng vút cao */}
        {[-0.24, 0.24].map((tx) => (
          <group key={`cathedral-spire-${tx}`} position={[tx, 0, -0.2]}>
            {/* Thân tháp vuông */}
            <mesh castShadow receiveShadow position={[0, 0.35, 0]}>
              <boxGeometry args={[0.2, 0.68, 0.2]} />
              <meshStandardMaterial color="#B45309" roughness={0.65} />
            </mesh>
            {/* Chóp nhọn Gothic vươn lên bầu trời */}
            <mesh castShadow position={[0, 0.82, 0]}>
              <coneGeometry args={[0.16, 0.32, 4]} />
              <meshStandardMaterial color="#451A03" roughness={0.4} />
            </mesh>
            {/* Thánh giá đồng thau trên đỉnh tháp thắp sáng ban đêm */}
            <mesh position={[0, 1.02, 0]}>
              <boxGeometry args={[0.012, 0.08, 0.012]} />
              <meshStandardMaterial
                color="#F59E0B"
                metalness={0.9}
                emissive="#F59E0B"
                emissiveIntensity={isNight ? 0.95 : 0.0}
              />
            </mesh>
            <mesh position={[0, 1.04, 0]}>
              <boxGeometry args={[0.05, 0.012, 0.012]} />
              <meshStandardMaterial
                color="#F59E0B"
                metalness={0.9}
                emissive="#F59E0B"
                emissiveIntensity={isNight ? 0.95 : 0.0}
              />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
