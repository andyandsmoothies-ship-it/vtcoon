// [UI-S02/MSS][IMP-53] DioramaBridges — Cầu Ba Son (Cable-stayed) & Cầu Long Biên (Steel truss)
import React, { useRef, useMemo } from 'react';
import { Color, Vector3, Quaternion, type MeshStandardMaterial as ThreeMeshStandardMaterial } from 'three';
import { useEnvironmentStore } from '../../store/environment_store';
import { useSafeFrame } from '../safe_frame';

interface CableTransformResult {
  readonly position: [number, number, number];
  readonly length: number;
  readonly rotation?: [number, number, number];
  readonly quaternion?: [number, number, number, number];
  readonly topEnd: [number, number, number];
  readonly bottomEnd: [number, number, number];
}

export function calculateCableTransform(
  pylonAnchor: [number, number, number],
  deckAnchor: [number, number, number]
): CableTransformResult {
  const dx = deckAnchor[0] - pylonAnchor[0];
  const dy = deckAnchor[1] - pylonAnchor[1];
  const dz = deckAnchor[2] - pylonAnchor[2];
  const length = Math.hypot(dx, dy, dz);

  const position: [number, number, number] = [
    (pylonAnchor[0] + deckAnchor[0]) / 2,
    (pylonAnchor[1] + deckAnchor[1]) / 2,
    (pylonAnchor[2] + deckAnchor[2]) / 2,
  ];

  const v = new Vector3(
    pylonAnchor[0] - deckAnchor[0],
    pylonAnchor[1] - deckAnchor[1],
    pylonAnchor[2] - deckAnchor[2]
  );
  if (length > 0) {
    v.normalize();
  } else {
    v.set(0, 1, 0);
  }

  const quat = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), v);

  return {
    position,
    length,
    quaternion: [quat.x, quat.y, quat.z, quat.w],
    topEnd: pylonAnchor,
    bottomEnd: deckAnchor,
  };
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

  const basonCables = useMemo(() => {
    const pylonAnchor: [number, number, number] = [-0.8, 0.95, 0];
    const deckAnchorsX = [-2.0, -1.5, -0.2, 0.4, 1.0, 1.6];
    return deckAnchorsX.map((cx) => ({
      west: calculateCableTransform(pylonAnchor, [cx, 0.12, 0.18]),
      east: calculateCableTransform(pylonAnchor, [cx, 0.12, -0.18]),
    }));
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* ========================================================
          1. CẦU BA SON (Phía Bắc: Z = -3.8, nối Tây Bắc & Đông Bắc)
          Kiến trúc cầu dây văng hiện đại với tháp nghiêng thanh thoát
         ======================================================== */}
      <group position={[0, 0, -3.8]}>
        {/* Mặt cầu bê tông nhựa đen nhẵn bóng bẩy & vạch sơn tim đường */}
        <mesh receiveShadow castShadow position={[0, 0.12, 0]}>
          <boxGeometry args={[5.4, 0.04, 0.52]} />
          <meshStandardMaterial color="#1E293B" roughness={0.18} metalness={0.25} />
        </mesh>
        {/* Gờ phân cách vàng kim */}
        <mesh position={[0, 0.142, 0]}>
          <boxGeometry args={[5.2, 0.005, 0.02]} />
          <meshStandardMaterial color="#F59E0B" roughness={0.3} />
        </mesh>
        {/* Lan can hợp kim chống rỉ hai bên thành cầu */}
        <mesh position={[0, 0.165, 0.24]} castShadow>
          <boxGeometry args={[5.4, 0.05, 0.02]} />
          <meshStandardMaterial color="#CBD5E1" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.165, -0.24]} castShadow>
          <boxGeometry args={[5.4, 0.05, 0.02]} />
          <meshStandardMaterial color="#CBD5E1" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Dải đèn LED nghệ thuật viền thành cầu Ba Son đổi sắc lung linh trong đêm */}
        <mesh position={[0, 0.192, 0.24]}>
          <boxGeometry args={[5.38, 0.012, 0.012]} />
          <meshStandardMaterial
            ref={basonLedRef1}
            color="#06B6D4"
            emissive="#00F5FF"
            emissiveIntensity={isNight ? 3.2 : isSunset ? 0.8 : 0.0}
          />
        </mesh>
        <mesh position={[0, 0.192, -0.24]}>
          <boxGeometry args={[5.38, 0.012, 0.012]} />
          <meshStandardMaterial
            ref={basonLedRef2}
            color="#06B6D4"
            emissive="#00F5FF"
            emissiveIntensity={isNight ? 3.2 : isSunset ? 0.8 : 0.0}
          />
        </mesh>

        {/* Mố cầu bờ kênh (Abutments): Bờ Tây và Bờ Đông */}
        <mesh
          name="bason-abutment-west"
          data-bason-abutment="west"
          position={[-2.7, 0.04, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.36, 0.16, 0.6]} />
          <meshStandardMaterial color="#64748B" roughness={0.7} />
        </mesh>
        <mesh
          name="bason-abutment-east"
          data-bason-abutment="east"
          position={[2.7, 0.04, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.36, 0.16, 0.6]} />
          <meshStandardMaterial color="#64748B" roughness={0.7} />
        </mesh>

        {/* Tháp Ba Son: Điêu khắc A-pylon cong thanh thoát, bệ trụ bê tông vững chãi đặt dưới lòng sông tại X = -0.8, Y = 0.0, Z = 0; cổ vòng neo cáp mạ vàng tại [-0.8, 0.95, 0] */}
        <group position={[-0.8, 0, 0]}>
          {/* Bệ trụ bê tông vững chãi đặt dưới lòng sông */}
          <mesh position={[0, 0.0, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.18, 0.22, 0.2, 8]} />
            <meshStandardMaterial color="#64748B" roughness={0.7} />
          </mesh>
          {/* Trụ tháp chính mạ bạc titan */}
          <mesh position={[0, 0.48, 0]} rotation={[0, 0, -0.15]} castShadow>
            <boxGeometry args={[0.12, 0.96, 0.18]} />
            <meshStandardMaterial color="#F8FAFC" metalness={0.6} roughness={0.25} />
          </mesh>
          {/* Cổ vòng neo cáp mạ vàng */}
          <mesh position={[0, 0.95, 0]}>
            <cylinderGeometry args={[0.07, 0.09, 0.06, 12]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Đỉnh tháp cách điệu */}
          <mesh position={[0, 1.02, 0]}>
            <coneGeometry args={[0.06, 0.14, 6]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>

        {/* 6 cặp Dây văng rẻ quạt (Stay Cables) đan từ đỉnh tháp xuống mặt cầu */}
        {basonCables.map((cable, i) => (
          <group key={`bason-cable-pair-${i}`}>
            <mesh
              position={cable.west.position}
              quaternion={cable.west.quaternion}
              castShadow
            >
              <cylinderGeometry args={[0.005, 0.005, cable.west.length, 6]} />
              <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh
              position={cable.east.position}
              quaternion={cable.east.quaternion}
              castShadow
            >
              <cylinderGeometry args={[0.005, 0.005, cable.east.length, 6]} />
              <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        ))}

        {/* 3 Trụ mố đá hoa cương đỡ nhịp cầu */}
        {[-1.8, 0.6, 1.8].map((px, i) => (
          <mesh key={`bason-pier-${i}`} position={[px, 0.03, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.10, 0.14, 0.18, 8]} />
            <meshStandardMaterial color="#64748B" roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* ========================================================
          2. CẦU LONG BIÊN (Phía Nam: Z = +3.8, nối Tây Nam & Đông Nam)
          Kiến trúc cầu giàn thép nhịp vòm kép di sản cổ kính
         ======================================================== */}
      <group position={[0, 0.12, 3.8]}>
        {/* Bản mặt cầu đường sắt & đường bộ hỗn hợp bóng bẩy */}
        <mesh receiveShadow castShadow position={[0, 0, 0]}>
          <boxGeometry args={[5.4, 0.04, 0.5]} />
          <meshStandardMaterial color="#334155" roughness={0.28} metalness={0.3} />
        </mesh>
        {/* Tà vẹt gỗ sồi sẫm đỡ thanh ray đường sắt */}
        <mesh position={[0, 0.016, 0]} receiveShadow>
          <boxGeometry args={[5.2, 0.008, 0.16]} />
          <meshStandardMaterial color="#78350F" roughness={0.7} />
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
            {/* Giàn thép vòm cong phía trước màu thép than tự nhiên */}
            <mesh position={[0, 0.08, 0.23]} castShadow>
              <boxGeometry args={[2.2, 0.03, 0.02]} />
              <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.6} />
            </mesh>
            {/* Các thanh chéo giàn thép */}
            {[-0.8, -0.4, 0, 0.4, 0.8].map((tx, ti) => (
              <mesh key={`truss-strut-f-${ti}`} position={[tx, 0.04, 0.23]} rotation={[0, 0, (ti % 2 === 0 ? 1 : -1) * 0.45]} castShadow>
                <boxGeometry args={[0.02, 0.16, 0.02]} />
                <meshStandardMaterial color="#475569" roughness={0.5} metalness={0.6} />
              </mesh>
            ))}

            {/* Giàn thép vòm cong phía sau màu thép than tự nhiên */}
            <mesh position={[0, 0.08, -0.23]} castShadow>
              <boxGeometry args={[2.2, 0.03, 0.02]} />
              <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.6} />
            </mesh>
            {[-0.8, -0.4, 0, 0.4, 0.8].map((tx, ti) => (
              <mesh key={`truss-strut-b-${ti}`} position={[tx, 0.04, -0.23]} rotation={[0, 0, (ti % 2 === 0 ? 1 : -1) * 0.45]} castShadow>
                <boxGeometry args={[0.02, 0.16, 0.02]} />
                <meshStandardMaterial color="#475569" roughness={0.5} metalness={0.6} />
              </mesh>
            ))}

            {/* Giàn thanh ngang kết nối đỉnh vòm */}
            <mesh position={[0, 0.15, 0]}>
              <boxGeometry args={[2.0, 0.02, 0.46]} />
              <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.6} />
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
