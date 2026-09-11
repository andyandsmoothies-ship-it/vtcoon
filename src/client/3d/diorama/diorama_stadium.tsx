// [UI-S02/MSS] DioramaStadium — Modern oval arena with tiered crimson grandstands, striped pitch & sail canopy
import React from 'react';
import { useEnvironmentStore } from '../../store/environment_store';

const FLOODLIGHT_OFFSETS: ReadonlyArray<readonly [number, number]> = [
  [-1.3, -1.1],
  [1.3, -1.1],
  [-1.3, 1.1],
  [1.3, 1.1],
];

export function DioramaStadium(): React.ReactElement {
  const phase = useEnvironmentStore((s) => s.phase);
  const isNight = phase === 'night';
  const isSunset = phase === 'sunset';
  return (
    <group position={[4.5, 0.16, -4.5]}>
      {/* 1. Móng khán đài đa tầng hình oval (Tiered Grandstand Outer Bowl) */}
      <mesh castShadow receiveShadow position={[0, 0.08, 0]}>
        <cylinderGeometry args={[1.2, 1.35, 0.16, 28]} />
        <meshStandardMaterial color="#334155" roughness={0.4} />
      </mesh>

      {/* Tầng khán đài trên với các cổng vào (Concourse Level) */}
      <mesh castShadow position={[0, 0.2, 0]}>
        <cylinderGeometry args={[1.25, 1.18, 0.08, 28]} />
        <meshStandardMaterial color="#64748B" roughness={0.45} />
      </mesh>

      {/* Ghế ngồi khán đài màu đỏ mận & điểm xuyết rực rỡ */}
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[1.02, 1.14, 0.06, 28]} />
        <meshStandardMaterial color="#DC2626" roughness={0.55} />
      </mesh>

      {/* 2. Lòng sân thi đấu thể thao hình chữ nhật (Sports Pitch) */}
      <mesh receiveShadow position={[0, 0.19, 0]}>
        <boxGeometry args={[1.24, 0.02, 0.84]} />
        <meshStandardMaterial color="#166534" roughness={0.7} />
      </mesh>

      {/* Các sọc cỏ thi đấu xen kẽ hai tông xanh (Pitch Stripes) */}
      {[-0.45, -0.15, 0.15, 0.45].map((sx) => (
        <mesh key={`pitch-stripe-${sx}`} receiveShadow position={[sx, 0.202, 0]}>
          <boxGeometry args={[0.15, 0.005, 0.82]} />
          <meshStandardMaterial color="#15803D" roughness={0.7} />
        </mesh>
      ))}

      {/* Vòng tròn trung tâm & vạch kẻ sân bóng đá */}
      <mesh position={[0, 0.204, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.14, 0.16, 16]} />
        <meshBasicMaterial color="#F8FAFC" />
      </mesh>
      <mesh position={[0, 0.203, 0]}>
        <boxGeometry args={[0.015, 0.002, 0.82]} />
        <meshBasicMaterial color="#F8FAFC" />
      </mesh>

      {/* 3. Mái che kiến trúc cánh buồm uốn lượn (Tensile Arched Canopy) */}
      <group position={[0, 0.36, -0.68]} rotation={[0.35, 0, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[1.2, 1.2, 0.035, 20, 1, false, Math.PI * 0.28, Math.PI * 0.44]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.25} metalness={0.1} />
        </mesh>
        {/* Khung dầm chịu lực mạ titan xanh ngọc phát sáng ban đêm */}
        <mesh position={[0, -0.015, 0]}>
          <cylinderGeometry args={[1.21, 1.21, 0.02, 12, 1, false, Math.PI * 0.28, Math.PI * 0.44]} />
          <meshStandardMaterial
            color="#0284C7"
            metalness={0.8}
            roughness={0.2}
            emissive="#00F5FF"
            emissiveIntensity={isNight ? 0.9 : isSunset ? 0.35 : 0.0}
          />
        </mesh>
      </group>

      {/* 4. 4 Trụ đèn pha LED thể thao hiện đại vươn cao (Floodlights) */}
      {FLOODLIGHT_OFFSETS.map(([fx, fz], idx) => (
        <group key={`stadium-light-${idx}`} position={[fx, 0, fz]}>
          {/* Cột tháp mắt cáo hợp kim nghiêng 45 độ hướng về tâm sân */}
          <mesh position={[0, 0.38, 0]} rotation={[0.12 * (fz > 0 ? -1 : 1), 0, 0.12 * (fx > 0 ? -1 : 1)]} castShadow>
            <cylinderGeometry args={[0.016, 0.038, 0.76, 4]} />
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.25} />
          </mesh>
          {/* Cụm bảng đèn LED chiếu sáng */}
          <mesh position={[0, 0.78, 0]} rotation={[0.25 * (fz > 0 ? -1 : 1), 0, 0.25 * (fx > 0 ? -1 : 1)]}>
            <boxGeometry args={[0.18, 0.09, 0.04]} />
            <meshStandardMaterial color="#0369A1" metalness={0.7} roughness={0.2} />
          </mesh>
          {/* Mặt đèn phát sáng rực rỡ */}
          <mesh position={[0, 0.78, 0.02]} rotation={[0.25 * (fz > 0 ? -1 : 1), 0, 0.25 * (fx > 0 ? -1 : 1)]}>
            <boxGeometry args={[0.16, 0.07, 0.01]} />
            <meshBasicMaterial color="#E0F2FE" />
          </mesh>
          {/* Luồng sáng nón rọi xuống mặt sân (Floodlight Light Beam Cone) */}
          <mesh
            position={[0.15 * (fx > 0 ? -1 : 1), 0.45, 0.15 * (fz > 0 ? -1 : 1)]}
            rotation={[0.5 * (fz > 0 ? 1 : -1), 0, 0.5 * (fx > 0 ? -1 : 1)]}
          >
            <coneGeometry args={[0.32, 0.7, 8, 1, true]} />
            <meshBasicMaterial
              color="#E0F2FE"
              transparent
              opacity={isNight ? 0.25 : isSunset ? 0.1 : 0.0}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
