// [IMP-30] HorizonMountainRange — Northern Horizon Mountain Range with Observatory Radar & Clouds
import React from 'react';

/**
 * Rặng núi xanh biếc nhấp nhô phía Bắc, vách đá sườn núi,
 * cụm mây trắng bồng bềnh và tháp radar vi mô ngắm sao trên đỉnh núi (Retropoly Style).
 */
export function HorizonMountainRange(): React.ReactElement {
  return (
    <group position={[0, 0, 0]} data-testid="horizon-mountain-range">
      {/* 1. Rặng núi xanh nhấp nhô phía Bắc (#166534, #15803D) tuân thủ z <= -50 */}
      <mesh castShadow receiveShadow position={[-6, 12.0, -52]}>
        <coneGeometry args={[22, 24, 32]} />
        <meshStandardMaterial color="#166534" roughness={0.86} />
      </mesh>
      <mesh castShadow receiveShadow position={[6, 14.5, -62]}>
        <coneGeometry args={[26, 29, 32]} />
        <meshStandardMaterial color="#14532D" roughness={0.9} />
      </mesh>
      <mesh castShadow receiveShadow position={[26, 10.5, -55]}>
        <coneGeometry args={[18, 21, 32]} />
        <meshStandardMaterial color="#15803D" roughness={0.84} />
      </mesh>
      <mesh castShadow receiveShadow position={[-28, 11.0, -50]}>
        <coneGeometry args={[19, 22, 32]} />
        <meshStandardMaterial color="#166534" roughness={0.85} />
      </mesh>
      <mesh castShadow receiveShadow position={[-44, 9.0, -54]}>
        <coneGeometry args={[16, 18, 28]} />
        <meshStandardMaterial color="#15803D" roughness={0.83} />
      </mesh>
      <mesh castShadow receiveShadow position={[42, 8.5, -58]}>
        <coneGeometry args={[16, 17, 28]} />
        <meshStandardMaterial color="#22C55E" roughness={0.82} />
      </mesh>

      {/* 2. Vách đá xám sườn núi kiến tạo địa chất */}
      {([
        [-12, 5.0, -42, 0.25, 0.4],
        [18, 4.5, -45, -0.2, 0.35],
        [-25, 4.2, -43, 0.15, -0.3],
        [32, 4.0, -48, -0.1, 0.5],
      ] as const).map(([rx, ry, rz, rotX, rotY], idx) => (
        <mesh key={`rock-${idx}`} position={[rx, ry, rz]} rotation={[rotX, rotY, 0.1]}>
          <boxGeometry args={[5.5, 6.5, 3.5]} />
          <meshStandardMaterial color="#64748B" roughness={0.92} />
        </mesh>
      ))}

      {/* 3. Tháp radar vi mô & đài thiên văn trên đỉnh núi ngắm sao (Peak Observatory Radar) */}
      <group position={[6, 29.2, -62]}>
        {/* Chân đế tháp đài ngắm sao */}
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.9, 1.2, 1.2, 16]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.3} metalness={0.6} />
        </mesh>
        {/* Vòm đài thiên văn */}
        <mesh position={[0, 1.4, 0]}>
          <sphereGeometry args={[0.85, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
          <meshStandardMaterial color="#38BDF8" roughness={0.15} metalness={0.7} />
        </mesh>
        {/* Chảo radar vi mô xoay nghiêng */}
        <mesh position={[0, 2.3, 0]} rotation={[0.4, 0.6, 0]}>
          <cylinderGeometry args={[0.65, 0.1, 0.2, 12]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.25} metalness={0.8} />
        </mesh>
        {/* Đèn tín hiệu nhấp nháy đỏ trên đỉnh */}
        <mesh position={[0, 2.8, 0]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={1.2} />
        </mesh>
      </group>
    </group>
  );
}
