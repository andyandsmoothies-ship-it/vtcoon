// [UI-S02/MSS] DioramaTraffic — Autonomous micro-traffic on coastal boulevards & iconic bridges
import React, { useMemo, useRef } from 'react';
import { Vector3, CatmullRomCurve3, type Group } from 'three';
import { RoundedBox } from '@react-three/drei';
import { useEnvironmentStore } from '../../store/environment_store';
import { useSafeFrame } from '../safe_frame';

export interface MicroVehicleDef {
  readonly id: string;
  readonly name: string;
  readonly type: 'bus' | 'sedan' | 'suv' | 'sports' | 'taxi' | 'van';
  readonly color: string;
  readonly track: 'outer' | 'inner';
  readonly speed: number;
  readonly offset: number;
  readonly size: [number, number, number]; // [width, height, length]
}

export const MICRO_VEHICLES: readonly MicroVehicleDef[] = [
  // Làn ngoài (Outer Track - Chiều thuận kim đồng hồ, chuẩn quy tắc giao thông bên phải Việt Nam)
  { id: 'bus-yellow', name: 'Xe Buýt Vàng Sài Gòn', type: 'bus', color: '#F59E0B', track: 'outer', speed: 0.035, offset: 0.05, size: [0.11, 0.11, 0.32] },
  { id: 'sedan-blue', name: 'Sedan Sapphire', type: 'sedan', color: '#0284C7', track: 'outer', speed: 0.035, offset: 0.30, size: [0.09, 0.06, 0.19] },
  { id: 'suv-white', name: 'SUV Bạch Kim', type: 'suv', color: '#F8FAFC', track: 'outer', speed: 0.035, offset: 0.55, size: [0.10, 0.07, 0.22] },
  { id: 'sports-orange', name: 'Coupe Thể Thao Cam', type: 'sports', color: '#EA580C', track: 'outer', speed: 0.035, offset: 0.80, size: [0.09, 0.05, 0.18] },

  // Làn trong (Inner Track - Chiều ngược kim đồng hồ đối ứng, chuẩn quy tắc giao thông bên phải)
  { id: 'bus-red', name: 'Xe Buýt Đỏ VinBus', type: 'bus', color: '#DC2626', track: 'inner', speed: 0.032, offset: 0.15, size: [0.11, 0.11, 0.30] },
  { id: 'taxi-green', name: 'Taxi Xanh Mai Linh', type: 'taxi', color: '#10B981', track: 'inner', speed: 0.032, offset: 0.48, size: [0.09, 0.06, 0.19] },
  { id: 'van-yellow', name: 'Xe Vận Tải DHL', type: 'van', color: '#EAB308', track: 'inner', speed: 0.032, offset: 0.81, size: [0.10, 0.08, 0.23] },
];

export function DioramaTraffic(): React.ReactElement {
  const phase = useEnvironmentStore((s) => s.phase);
  const isNight = phase === 'night';
  const isSunset = phase === 'sunset';
  const vehicleRefs = useRef<(Group | null)[]>([]);

  // 1. Quỹ đạo Làn Ngoài (Outer Loop: Chiều thuận kim đồng hồ, Tây -> Long Biên -> Đông -> Ba Son -> Tây)
  const outerCurve = useMemo(() => {
    const points = [
      new Vector3(-4.95, 0.142, -3.3),  // Đại lộ Tây (hướng Nam)
      new Vector3(-4.95, 0.142, 0.0),
      new Vector3(-4.95, 0.142, 3.3),
      new Vector3(-4.65, 0.142, 3.85),  // Cua vào Cầu Long Biên
      new Vector3(-3.2, 0.142, 3.95),   // Cầu Long Biên (hướng Đông)
      new Vector3(0.0, 0.142, 3.95),
      new Vector3(3.2, 0.142, 3.95),
      new Vector3(4.65, 0.142, 3.85),   // Cua vào Tuyến Đông
      new Vector3(4.95, 0.142, 3.3),    // Tuyến ven vịnh Đông (hướng Bắc)
      new Vector3(4.95, 0.142, 0.0),
      new Vector3(4.95, 0.142, -3.3),
      new Vector3(4.65, 0.142, -3.85),  // Cua vào Cầu Ba Son
      new Vector3(3.2, 0.142, -3.95),   // Cầu Ba Son (hướng Tây)
      new Vector3(0.0, 0.142, -3.95),
      new Vector3(-3.2, 0.142, -3.95),
      new Vector3(-4.65, 0.142, -3.85), // Cua về Đại lộ Tây
    ];
    return new CatmullRomCurve3(points, true, 'catmullrom', 0.15);
  }, []);

  // 2. Quỹ đạo Làn Trong (Inner Loop: Chiều ngược kim đồng hồ đối ứng, phân làn an toàn)
  const innerCurve = useMemo(() => {
    const points = [
      new Vector3(-4.65, 0.142, 3.3),   // Đại lộ Tây (hướng Bắc)
      new Vector3(-4.65, 0.142, 0.0),
      new Vector3(-4.65, 0.142, -3.3),
      new Vector3(-4.35, 0.142, -3.65), // Cua vào Cầu Ba Son
      new Vector3(-3.2, 0.142, -3.65),  // Cầu Ba Son (hướng Đông)
      new Vector3(0.0, 0.142, -3.65),
      new Vector3(3.2, 0.142, -3.65),
      new Vector3(4.35, 0.142, -3.65),  // Cua vào Tuyến Đông
      new Vector3(4.65, 0.142, -3.3),   // Tuyến Đông (hướng Nam)
      new Vector3(4.65, 0.142, 0.0),
      new Vector3(4.65, 0.142, 3.3),
      new Vector3(4.35, 0.142, 3.65),   // Cua vào Cầu Long Biên
      new Vector3(3.2, 0.142, 3.65),    // Cầu Long Biên (hướng Tây)
      new Vector3(0.0, 0.142, 3.65),
      new Vector3(-3.2, 0.142, 3.65),
      new Vector3(-4.35, 0.142, 3.65),  // Cua về Đại lộ Tây
    ];
    return new CatmullRomCurve3(points, true, 'catmullrom', 0.15);
  }, []);

  // Di chuyển liên tục tuần hoàn & tự động tính góc xoay yaw mượt mà khi rẽ cua
  useSafeFrame((state) => {
    const t = state.clock.elapsedTime;
    MICRO_VEHICLES.forEach((v, idx) => {
      const grp = vehicleRefs.current[idx];
      if (!grp) return;

      const curve = v.track === 'outer' ? outerCurve : innerCurve;
      const progress = ((t * v.speed + v.offset) % 1 + 1) % 1;

      const pt = curve.getPointAt(progress);
      const tangent = curve.getTangentAt(progress);
      const yaw = Math.atan2(tangent.x, tangent.z);

      grp.position.set(pt.x, pt.y, pt.z);
      grp.rotation.set(0, yaw, 0);
    });
  });

  return (
    <group data-testid="diorama-traffic">
      {MICRO_VEHICLES.map((v, idx) => {
        const [w, h, l] = v.size;
        return (
          <group
            key={v.id}
            ref={(el) => {
              vehicleRefs.current[idx] = el;
            }}
          >
            {/* 1. Thân vỏ xe chính bo cong khí động học */}
            <RoundedBox args={[w, h * 0.7, l]} radius={0.008} smoothness={2} castShadow position={[0, h / 2, 0]}>
              <meshStandardMaterial color={v.color} roughness={0.35} metalness={0.2} />
            </RoundedBox>

            {/* 2. Cabin kính xe tối màu bo góc */}
            <RoundedBox args={[w * 0.88, h * 0.45, l * 0.6]} radius={0.005} smoothness={2} position={[0, h * 0.72, 0]}>
              <meshStandardMaterial color="#0F172A" roughness={0.2} />
            </RoundedBox>

            {/* Bảng hiệu nóc đặc trưng cho Taxi */}
            {v.type === 'taxi' && (
              <mesh position={[0, h + 0.015, 0]}>
                <boxGeometry args={[0.04, 0.02, 0.03]} />
                <meshBasicMaterial color="#FEF08A" />
              </mesh>
            )}

            {/* 3. Bốn bánh xe cao su */}
            {([-1, 1] as const).map((sideX) =>
              ([-1, 1] as const).map((sideZ) => (
                <mesh
                  key={`wheel-${sideX}-${sideZ}`}
                  position={[sideX * (w / 2 + 0.004), 0.018, sideZ * (l * 0.28)]}
                  rotation={[0, 0, Math.PI / 2]}
                >
                  <cylinderGeometry args={[0.018, 0.018, 0.014, 6]} />
                  <meshStandardMaterial color="#1E293B" roughness={0.9} />
                </mesh>
              ))
            )}

            {/* 4. Đèn pha LED vi mô rọi sáng mặt đường phía trước */}
            {/* Bóng đèn LED trái */}
            <mesh position={[-w * 0.32, h * 0.3, l / 2 + 0.002]}>
              <boxGeometry args={[0.02, 0.016, 0.006]} />
              <meshBasicMaterial color="#FEF08A" />
            </mesh>
            {/* Bóng đèn LED phải */}
            <mesh position={[w * 0.32, h * 0.3, l / 2 + 0.002]}>
              <boxGeometry args={[0.02, 0.016, 0.006]} />
              <meshBasicMaterial color="#FEF08A" />
            </mesh>

            {/* Vệt sáng quạt đèn LED rọi xuống mặt đường nhựa */}
            <mesh position={[0, 0.004, l / 2 + 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[w * 2.2, 0.38]} />
              <meshBasicMaterial
                color="#FEF08A"
                transparent
                opacity={isNight ? 0.65 : isSunset ? 0.42 : 0.28}
              />
            </mesh>

            {/* 5. Đèn hậu đỏ phía đuôi */}
            <mesh position={[-w * 0.32, h * 0.3, -l / 2 - 0.002]}>
              <boxGeometry args={[0.02, 0.014, 0.006]} />
              <meshBasicMaterial color="#EF4444" />
            </mesh>
            <mesh position={[w * 0.32, h * 0.3, -l / 2 - 0.002]}>
              <boxGeometry args={[0.02, 0.014, 0.006]} />
              <meshBasicMaterial color="#EF4444" />
            </mesh>

            {/* Vệt sáng đỏ đèn hậu chiếu xuống mặt đường ban đêm */}
            {isNight && (
              <mesh position={[0, 0.004, -l / 2 - 0.08]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[w * 1.6, 0.16]} />
                <meshBasicMaterial color="#EF4444" transparent opacity={0.35} depthWrite={false} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}
