// [UI-S02/MSS] DioramaBridges — Cầu Ba Son (Cable-stayed) & Cầu Long Biên (Steel truss)
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, type MeshStandardMaterial as ThreeMeshStandardMaterial } from 'three';
import { useEnvironmentStore } from '../../store/environment_store';

function useSafeFrame(callback: (state: Parameters<Parameters<typeof useFrame>[0]>[0], delta: number) => void): void {
  try {
    useFrame(callback);
  } catch {
    // Safe outside Canvas in test environment
  }
}

export function DioramaBridges(): React.ReactElement {
  const phase = useEnvironmentStore((s) => s.phase);
  const isNight = phase === 'night';
  const isSunset = phase === 'sunset';

  const basonLedRef1 = useRef<ThreeMeshStandardMaterial>(null);
  const basonLedRef2 = useRef<ThreeMeshStandardMaterial>(null);
  const tempColor = useMemo(() => new Color(), []);

  useSafeFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (isNight && basonLedRef1.current && basonLedRef2.current) {
      tempColor.setHSL(0.5 + Math.sin(t * 0.5) * 0.12, 0.95, 0.55);
      basonLedRef1.current.color.copy(tempColor);
      basonLedRef1.current.emissive.copy(tempColor);
      basonLedRef2.current.color.copy(tempColor);
      basonLedRef2.current.emissive.copy(tempColor);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ========================================================
          1. CẦU BA SON (Phía Bắc: Z = -3.8, nối Tây Bắc & Đông Bắc)
          Kiến trúc cầu dây văng hiện đại với tháp nghiêng thanh thoát
         ======================================================== */}
      <group position={[0, 0.12, -3.8]}>
        {/* Mặt cầu bê tông nhựa đen nhẵn & vạch sơn tim đường */}
        <mesh receiveShadow castShadow position={[0, 0, 0]}>
          <boxGeometry args={[5.4, 0.04, 0.52]} />
          <meshStandardMaterial color="#334155" roughness={0.65} />
        </mesh>
        {/* Gờ phân cách vàng kim */}
        <mesh position={[0, 0.022, 0]}>
          <boxGeometry args={[5.2, 0.005, 0.02]} />
          <meshStandardMaterial color="#F59E0B" roughness={0.3} />
        </mesh>
        {/* Lan can hợp kim chống rỉ hai bên thành cầu */}
        <mesh position={[0, 0.045, 0.24]} castShadow>
          <boxGeometry args={[5.4, 0.05, 0.02]} />
          <meshStandardMaterial color="#CBD5E1" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.045, -0.24]} castShadow>
          <boxGeometry args={[5.4, 0.05, 0.02]} />
          <meshStandardMaterial color="#CBD5E1" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Dải đèn LED nghệ thuật viền thành cầu Ba Son đổi sắc lung linh trong đêm */}
        <mesh position={[0, 0.072, 0.24]}>
          <boxGeometry args={[5.38, 0.012, 0.012]} />
          <meshStandardMaterial
            ref={basonLedRef1}
            color="#06B6D4"
            emissive="#00F5FF"
            emissiveIntensity={isNight ? 1.4 : isSunset ? 0.6 : 0.0}
          />
        </mesh>
        <mesh position={[0, 0.072, -0.24]}>
          <boxGeometry args={[5.38, 0.012, 0.012]} />
          <meshStandardMaterial
            ref={basonLedRef2}
            color="#06B6D4"
            emissive="#00F5FF"
            emissiveIntensity={isNight ? 1.4 : isSunset ? 0.6 : 0.0}
          />
        </mesh>

        {/* Tháp cầu dây văng nghiêng biểu tượng (A-Pylon cách điệu) */}
        <group position={[-0.8, 0.45, 0]} rotation={[0, 0, -0.15]}>
          {/* Trụ tháp chính mạ bạc titan */}
          <mesh castShadow>
            <boxGeometry args={[0.12, 0.95, 0.16]} />
            <meshStandardMaterial color="#F8FAFC" metalness={0.6} roughness={0.25} />
          </mesh>
          {/* Đỉnh tháp mạ vàng đồng */}
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.01, 0.08, 0.14, 4]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>

        {/* Dây văng rẻ quạt (Stay Cables) đan từ đỉnh tháp xuống mặt cầu */}
        {[-2.0, -1.5, -0.2, 0.4, 1.0, 1.6].map((cx, i) => (
          <group key={`bason-cable-${i}`}>
            <mesh position={[(cx - 0.8) / 2, 0.4, 0.18]} rotation={[0, 0, Math.atan2(0.8, cx - (-0.8)) - Math.PI / 2]}>
              <cylinderGeometry args={[0.006, 0.006, Math.hypot(cx - (-0.8), 0.75), 4]} />
              <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[(cx - 0.8) / 2, 0.4, -0.18]} rotation={[0, 0, Math.atan2(0.8, cx - (-0.8)) - Math.PI / 2]}>
              <cylinderGeometry args={[0.006, 0.006, Math.hypot(cx - (-0.8), 0.75), 4]} />
              <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        ))}

        {/* 3 Mố cầu đá hoa cương kiên cố đỡ nhịp cầu */}
        {[-1.8, 0, 1.8].map((px, i) => (
          <mesh key={`bason-pier-${i}`} position={[px, -0.09, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.12, 0.16, 0.18, 8]} />
            <meshStandardMaterial color="#64748B" roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* ========================================================
          2. CẦU LONG BIÊN (Phía Nam: Z = +3.8, nối Tây Nam & Đông Nam)
          Kiến trúc cầu giàn thép nhịp vòm kép di sản cổ kính
         ======================================================== */}
      <group position={[0, 0.12, 3.8]}>
        {/* Bản mặt cầu đường sắt & đường bộ hỗn hợp */}
        <mesh receiveShadow castShadow position={[0, 0, 0]}>
          <boxGeometry args={[5.4, 0.04, 0.5]} />
          <meshStandardMaterial color="#475569" roughness={0.75} />
        </mesh>
        {/* Đường ray xe lửa trung tâm */}
        <mesh position={[0, 0.024, -0.04]}>
          <boxGeometry args={[5.2, 0.008, 0.015]} />
          <meshStandardMaterial color="#94A3B8" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.024, 0.04]}>
          <boxGeometry args={[5.2, 0.008, 0.015]} />
          <meshStandardMaterial color="#94A3B8" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Khung giàn thép nhịp vòm đôi biểu tượng (Double Steel Truss Arches) */}
        {[-1.3, 1.3].map((spanX, idx) => (
          <group key={`longbien-span-${idx}`} position={[spanX, 0.16, 0]}>
            {/* Giàn thép vòm cong phía trước */}
            <mesh position={[0, 0.08, 0.23]} castShadow>
              <boxGeometry args={[2.2, 0.03, 0.02]} />
              <meshStandardMaterial color="#78350F" roughness={0.6} metalness={0.4} />
            </mesh>
            {/* Các thanh chéo giàn thép */}
            {[-0.8, -0.4, 0, 0.4, 0.8].map((tx, ti) => (
              <mesh key={`truss-strut-f-${ti}`} position={[tx, 0.04, 0.23]} rotation={[0, 0, (ti % 2 === 0 ? 1 : -1) * 0.45]} castShadow>
                <boxGeometry args={[0.02, 0.16, 0.02]} />
                <meshStandardMaterial color="#78350F" roughness={0.6} metalness={0.4} />
              </mesh>
            ))}

            {/* Giàn thép vòm cong phía sau */}
            <mesh position={[0, 0.08, -0.23]} castShadow>
              <boxGeometry args={[2.2, 0.03, 0.02]} />
              <meshStandardMaterial color="#78350F" roughness={0.6} metalness={0.4} />
            </mesh>
            {[-0.8, -0.4, 0, 0.4, 0.8].map((tx, ti) => (
              <mesh key={`truss-strut-b-${ti}`} position={[tx, 0.04, -0.23]} rotation={[0, 0, (ti % 2 === 0 ? 1 : -1) * 0.45]} castShadow>
                <boxGeometry args={[0.02, 0.16, 0.02]} />
                <meshStandardMaterial color="#78350F" roughness={0.6} metalness={0.4} />
              </mesh>
            ))}

            {/* Giàn thanh ngang kết nối đỉnh vòm */}
            <mesh position={[0, 0.15, 0]}>
              <boxGeometry args={[2.0, 0.02, 0.46]} />
              <meshStandardMaterial color="#78350F" roughness={0.6} metalness={0.4} />
            </mesh>

            {/* Dải đèn LED vàng hoài niệm thắp sáng đỉnh vòm cầu Long Biên trong đêm */}
            <mesh position={[0, 0.165, 0]}>
              <boxGeometry args={[1.98, 0.01, 0.44]} />
              <meshStandardMaterial
                color="#F59E0B"
                emissive="#F59E0B"
                emissiveIntensity={isNight ? 1.15 : isSunset ? 0.5 : 0.0}
              />
            </mesh>
          </group>
        ))}

        {/* 3 Trụ mố đá sa thạch rêu phong đỡ cầu */}
        {[-1.8, 0, 1.8].map((px, i) => (
          <mesh key={`longbien-pier-${i}`} position={[px, -0.09, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.26, 0.18, 0.44]} />
            <meshStandardMaterial color="#57534E" roughness={0.8} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
