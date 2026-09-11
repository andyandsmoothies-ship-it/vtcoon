// [UI-S01/MSS][UI-S04/MSS] CoastalIslandEnvironment — Vietnamese Coastal Island Metropolis (Retropoly Reference)
// Tropical ocean bay, sandy beaches, lush emerald hills, cargo ships, seaport causeways & fluffy clouds
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh, PlaneGeometry } from 'three';
import { CoastalPatrolBoat } from './coastal_patrol_boat';
import { CoastalSeagulls } from './coastal_seagulls';

function useSafeFrame(callback: (state: Parameters<Parameters<typeof useFrame>[0]>[0], delta: number) => void): void {
  try {
    useFrame(callback);
  } catch {
    // Safe outside Canvas in test environment
  }
}

export function CoastalIslandEnvironment(): React.ReactElement {
  const waveRef = useRef<Mesh>(null);
  const shallowRef = useRef<Mesh>(null);
  const oceanGeomRef = useRef<PlaneGeometry>(null);

  useSafeFrame((state) => {
    const t = state.clock.getElapsedTime();

    // 1. Biến thiên độ cao vertex lưới sóng Gerstner / điều hòa thời gian thực
    if (oceanGeomRef.current) {
      const pos = oceanGeomRef.current.attributes.position;
      if (pos) {
        const count = pos.count;
        for (let i = 0; i < count; i++) {
          const u = pos.getX(i);
          const v = pos.getY(i);
          // Sóng Gerstner đa hài kết hợp chu kỳ sóng điều hòa (độ cao kiểm soát tránh ngập thềm cát)
          const w1 = Math.sin(u * 0.06 + t * 1.4) * 0.032;
          const w2 = Math.cos(v * 0.07 + t * 1.1) * 0.024;
          const w3 = Math.sin((u + v) * 0.04 + t * 1.8) * 0.014;
          pos.setZ(i, w1 + w2 + w3);
        }
        pos.needsUpdate = true;
        oceanGeomRef.current.computeVertexNormals();
      }
    }

    // 2. Dải bọt sóng ven bờ co giãn nhịp nhàng theo chu kỳ thủy triều 3.5s
    if (waveRef.current) {
      const tideCycle = Math.sin(t * (Math.PI * 2 / 3.5));
      const s = 1 + tideCycle * 0.038;
      waveRef.current.scale.set(s, s, 1);
    }

    // 3. Tầng nước nông nhấp nhô theo nhịp thở đại dương
    if (shallowRef.current) {
      shallowRef.current.position.y = -0.56 + Math.sin(t * (Math.PI * 2 / 3.5)) * 0.015;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. ĐẠI DƯƠNG NHIỆT ĐỚI VÔ TẬN (Infinite Tropical Ocean - Optical Stratification) */}
      {/* 1.0. Tầng đáy vực đại dương thẳm (#0C4A6E) */}
      <mesh receiveShadow position={[0, -0.66, 0]}>
        <boxGeometry args={[260, 0.16, 260]} />
        <meshStandardMaterial color="#0C4A6E" roughness={0.15} metalness={0.4} />
      </mesh>

      {/* 1.1. Lưới sóng động nhiệt đới (#0284C7) với biến thiên độ cao vertex Gerstner */}
      <mesh receiveShadow position={[0, -0.60, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry ref={oceanGeomRef} args={[180, 180, 36, 36]} />
        <meshStandardMaterial
          color="#0284C7"
          roughness={0.16}
          metalness={0.35}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* 1.2. Tầng nước nông ngọc bích sát bờ đảo (#06B6D4) */}
      <mesh ref={shallowRef} receiveShadow position={[0, -0.56, 0]}>
        <boxGeometry args={[82, 0.14, 82]} />
        <meshStandardMaterial
          color="#06B6D4"
          roughness={0.2}
          metalness={0.2}
          transparent
          opacity={0.86}
        />
      </mesh>

      {/* 1.3. Dải bọt sóng trắng viền bãi cát dập dềnh (Shoreline Dynamic Foam - 3.5s cycle) */}
      <mesh ref={waveRef} position={[0, -0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[27.2, 33.6, 64]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.55} />
      </mesh>

      {/* 2. BÃI CÁT VÀNG NHIỆT ĐỚI (Tropical Warm Sand Peninsula: 58 x 58) */}
      <mesh receiveShadow position={[0, -0.44, 0]}>
        <boxGeometry args={[56, 0.28, 56]} />
        <meshStandardMaterial color="#F6D5A8" roughness={0.82} metalness={0.05} />
      </mesh>

      {/* 2.1. Thềm cỏ ngọc lục bảo bao quanh chân bàn cờ (Lush Green Coastal Plateau: 42 x 42) */}
      <mesh receiveShadow position={[0, -0.26, 0]}>
        <boxGeometry args={[42, 0.22, 42]} />
        <meshStandardMaterial color="#22C55E" roughness={0.75} metalness={0.02} />
      </mesh>

      {/* 2.2. Đại lộ ven biển & Vỉa hè bao quanh bàn cờ (Coastal Boulevard & Promenade) */}
      <mesh receiveShadow position={[0, -0.14, 0]}>
        <boxGeometry args={[23.6, 0.2, 23.6]} />
        <meshStandardMaterial color="#334155" roughness={0.7} metalness={0.1} />
      </mesh>
      <mesh receiveShadow position={[0, -0.06, 0]}>
        <boxGeometry args={[24.2, 0.08, 24.2]} />
        <meshStandardMaterial color="#64748B" roughness={0.6} />
      </mesh>

      {/* 3. BỜ BIỂN PHÍA NAM & TÂY (South-West Sandy Beach with Palm Trees) */}
      {/* Cụm dừa nhiệt đới nghiêng ven biển */}
      {([
        [-17, -19], [-13, -22], [-21, -14], [-24, -8],
        [16, 21], [21, 16], [23, 10], [-19, 18],
      ] as const).map(([px, pz], idx) => (
        <group key={`palm-${idx}`} position={[px, -0.3, pz]}>
          {/* Thân dừa uốn cong nhẹ */}
          <mesh castShadow position={[0, 0.6, 0]} rotation={[0.08, 0, -0.05]}>
            <cylinderGeometry args={[0.08, 0.14, 1.2, 8]} />
            <meshStandardMaterial color="#78350F" roughness={0.9} />
          </mesh>
          {/* Tán lá dừa xanh mướt xòe tròn */}
          <mesh castShadow position={[0, 1.2, 0]}>
            <coneGeometry args={[0.9, 0.45, 7]} />
            <meshStandardMaterial color="#15803D" roughness={0.6} />
          </mesh>
          <mesh castShadow position={[0, 1.35, 0]}>
            <coneGeometry args={[0.65, 0.35, 6]} />
            <meshStandardMaterial color="#16A34A" roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* 3.1. KHU NGHỈ DƯỠNG BÃI BIỂN: DÙ CHE NẮNG & GHẾ NẰM (Tropical Beach Resort) */}
      {([
        [-17.5, 11, '#EF4444'],
        [-19.0, 13, '#F59E0B'],
        [-16.0, 16, '#3B82F6'],
        [-14.5, 12, '#10B981'],
      ] as const).map(([bx, bz, color], uIdx) => (
        <group key={`umbrella-${uIdx}`} position={[bx, -0.36, bz]}>
          {/* Cột dù cắm cát */}
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.8, 6]} />
            <meshStandardMaterial color="#F8FAFC" metalness={0.7} />
          </mesh>
          {/* Tán dù sọc màu xoè tròn */}
          <mesh position={[0, 0.78, 0]} rotation={[0.1, 0, 0.1]}>
            <coneGeometry args={[0.55, 0.25, 8]} />
            <meshStandardMaterial color={color} roughness={0.3} />
          </mesh>
          {/* Ghế nằm bãi biển */}
          <mesh position={[0.2, 0.04, 0]} rotation={[0, 0.3, -0.1]}>
            <boxGeometry args={[0.42, 0.05, 0.22]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* 4. RẶNG ĐỒI NÚI XANH MAJESTIC PHÍA BẮC & ĐÔNG (Rolling Emerald Hills & Mountains) */}
      {/* Núi chính Đông Bắc 1 (Đỉnh cao sừng sững) */}
      <mesh castShadow receiveShadow position={[42, 8.5, -42]}>
        <coneGeometry args={[26, 22, 32]} />
        <meshStandardMaterial color="#166534" roughness={0.85} />
      </mesh>
      {/* Núi phụ Đông Bắc 2 */}
      <mesh castShadow receiveShadow position={[54, 7.0, -22]}>
        <coneGeometry args={[22, 18, 32]} />
        <meshStandardMaterial color="#15803D" roughness={0.82} />
      </mesh>
      {/* Núi trung tâm phía Bắc (Hậu cảnh che kín chân trời) */}
      <mesh castShadow receiveShadow position={[-8, 9.5, -52]}>
        <coneGeometry args={[30, 24, 32]} />
        <meshStandardMaterial color="#14532D" roughness={0.88} />
      </mesh>
      {/* Núi Tây Bắc 1 */}
      <mesh castShadow receiveShadow position={[-46, 8.0, -44]}>
        <coneGeometry args={[26, 20, 32]} />
        <meshStandardMaterial color="#166534" roughness={0.85} />
      </mesh>
      {/* Núi Tây Bắc 2 (Góc nhìn Hero nhìn thẳng vào) */}
      <mesh castShadow receiveShadow position={[-48, 6.5, -18]}>
        <coneGeometry args={[22, 17, 32]} />
        <meshStandardMaterial color="#15803D" roughness={0.85} />
      </mesh>
      {/* Đồi xanh thoai thoải phía Đông Nam */}
      <mesh castShadow receiveShadow position={[48, 4.5, 18]}>
        <coneGeometry args={[18, 12, 32]} />
        <meshStandardMaterial color="#22C55E" roughness={0.8} />
      </mesh>

      {/* 4.1. Vách đá xám sườn núi (Mountain Cliff Rocks) */}
      {([
        [-12, 3.5, -42, 0.3, 0.5],
        [36, 3.0, -35, -0.2, 0.4],
        [-38, 2.8, -25, 0.15, -0.3],
      ] as const).map(([rx, ry, rz, rotX, rotY], idx) => (
        <mesh key={`rock-${idx}`} position={[rx, ry, rz]} rotation={[rotX, rotY, 0.1]}>
          <boxGeometry args={[4.5, 6.0, 2.5]} />
          <meshStandardMaterial color="#64748B" roughness={0.9} />
        </mesh>
      ))}

      {/* 4.2. Rừng cây xanh che phủ chân núi phía Bắc (Foothill Forest Dense Belt) */}
      {([
        [-35, -24], [-30, -26], [-25, -28], [-20, -32], [-15, -34],
        [-10, -36], [-5, -35], [0, -34], [5, -32], [10, -30],
        [15, -28], [20, -26], [25, -25], [30, -22], [35, -20],
      ] as const).map(([tx, tz], tIdx) => (
        <group key={`mountain-tree-${tIdx}`} position={[tx, -0.2, tz]}>
          <mesh castShadow position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 1.2, 6]} />
            <meshStandardMaterial color="#78350F" roughness={0.8} />
          </mesh>
          <mesh castShadow position={[0, 1.3, 0]}>
            <coneGeometry args={[0.75, 1.4, 7]} />
            <meshStandardMaterial color={tIdx % 2 === 0 ? '#14532D' : '#166534'} roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* 4.3. Dải sương mù chân núi thấp tạo độ sâu không gian (Foothill Mist) */}
      {([
        [-20, 3.2, -32, 14, 1.5, 5],
        [15, 3.6, -28, 16, 1.8, 6],
      ] as const).map(([fx, fy, fz, sx, sy, sz], fIdx) => (
        <mesh key={`fog-${fIdx}`} position={[fx, fy, fz]}>
          <boxGeometry args={[sx, sy, sz]} />
          <meshStandardMaterial color="#E0F2FE" roughness={1.0} transparent opacity={0.4} />
        </mesh>
      ))}

      {/* 5. CẢNG BIỂN & TÀU CONTAINER NGOÀI KHƠI (Cargo Ships & Seaport Infrastructure) */}
      {/* Tàu Container Lớn Số 1 (Vịnh biển Tây Nam: [-28, 0, 26]) */}
      <group position={[-28, -0.55, 26]} rotation={[0, 0.45, 0]}>
        {/* Thân tàu màu đỏ thẫm */}
        <mesh castShadow position={[0, 0.5, 0]}>
          <boxGeometry args={[11.0, 0.9, 2.6]} />
          <meshStandardMaterial color="#DC2626" roughness={0.6} metalness={0.2} />
        </mesh>
        {/* Boong tàu và vách mạn trắng */}
        <mesh castShadow position={[0, 0.96, 0]}>
          <boxGeometry args={[10.6, 0.15, 2.4]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.4} />
        </mesh>
        {/* Khối cabin chỉ huy tháp đuôi */}
        <mesh castShadow position={[4.0, 1.5, 0]}>
          <boxGeometry args={[1.8, 1.1, 2.0]} />
          <meshStandardMaterial color="#F1F5F9" roughness={0.3} />
        </mesh>
        {/* Ống khói tàu */}
        <mesh position={[4.3, 2.2, 0]}>
          <cylinderGeometry args={[0.2, 0.25, 0.6, 8]} />
          <meshStandardMaterial color="#EF4444" roughness={0.5} />
        </mesh>
        {/* Các dãy thùng container xếp tầng (Xanh lá, Xanh dương, Vàng) */}
        {[-3.6, -1.8, 0.0, 1.8].map((cx, i) => (
          <group key={`container-stack-${i}`} position={[cx, 1.3, 0]}>
            <mesh castShadow position={[0, 0, -0.5]}>
              <boxGeometry args={[1.5, 0.6, 0.9]} />
              <meshStandardMaterial color={i % 2 === 0 ? '#10B981' : '#3B82F6'} roughness={0.5} />
            </mesh>
            <mesh castShadow position={[0, 0, 0.5]}>
              <boxGeometry args={[1.5, 0.6, 0.9]} />
              <meshStandardMaterial color={i % 3 === 0 ? '#F59E0B' : '#0284C7'} roughness={0.5} />
            </mesh>
            {/* Tầng 2 */}
            <mesh castShadow position={[0, 0.6, 0]}>
              <boxGeometry args={[1.4, 0.55, 1.6]} />
              <meshStandardMaterial color={i % 2 === 0 ? '#22C55E' : '#E11D48'} roughness={0.5} />
            </mesh>
          </group>
        ))}
        {/* Vệt bọt sóng trắng sau đuôi tàu (Ship Wake Trail) */}
        <mesh position={[-6.2, 0.05, 0]}>
          <planeGeometry args={[4.2, 1.8]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.4} />
        </mesh>
      </group>

      {/* Tàu Container Số 2 (Phía Nam ngoài khơi: [8, 0, 36]) */}
      <group position={[8, -0.55, 36]} rotation={[0, -0.2, 0]}>
        <mesh castShadow position={[0, 0.45, 0]}>
          <boxGeometry args={[9.0, 0.8, 2.2]} />
          <meshStandardMaterial color="#1E3A8A" roughness={0.5} metalness={0.3} />
        </mesh>
        <mesh castShadow position={[3.2, 1.3, 0]}>
          <boxGeometry args={[1.5, 1.0, 1.8]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
        </mesh>
        {/* Container */}
        {[-2.5, -0.8, 0.9].map((cx, idx) => (
          <mesh key={`c2-${idx}`} castShadow position={[cx, 1.1, 0]}>
            <boxGeometry args={[1.4, 0.55, 1.5]} />
            <meshStandardMaterial color={idx === 0 ? '#F59E0B' : idx === 1 ? '#10B981' : '#EF4444'} />
          </mesh>
        ))}
        {/* Vệt bọt sóng trắng sau đuôi tàu số 2 */}
        <mesh position={[-5.2, 0.05, 0]}>
          <planeGeometry args={[3.8, 1.6]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.38} />
        </mesh>
      </group>

      {/* Du thuyền sang trọng neo gần bãi tắm */}
      <group position={[-16, -0.55, 14]} rotation={[0, 1.1, 0]}>
        <mesh castShadow position={[0, 0.25, 0]}>
          <boxGeometry args={[3.2, 0.4, 1.0]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.2} metalness={0.1} />
        </mesh>
        <mesh castShadow position={[0.2, 0.55, 0]}>
          <boxGeometry args={[1.6, 0.35, 0.7]} />
          <meshStandardMaterial color="#0284C7" roughness={0.2} />
        </mesh>
      </group>

      {/* 6. HẠ TẦNG KẾT NỐI: CẦU CẠN & ĐƯỜNG CAO TỐC NGOẠI ĐẢO (Causeway Bridges) */}
      {/* Cầu vượt biển phía Tây Nam nối ra cảng container */}
      <group position={[-18, -0.3, 18]} rotation={[0, 0.78, 0]}>
        <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
          <boxGeometry args={[12, 0.18, 1.4]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.5} />
        </mesh>
        {/* Trụ cầu cắm xuống biển */}
        {[-4, 0, 4].map((px) => (
          <mesh key={`pier-${px}`} position={[px, -0.2, 0]}>
            <cylinderGeometry args={[0.25, 0.3, 0.6, 8]} />
            <meshStandardMaterial color="#94A3B8" roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* Tuyến đường ray xe lửa nối về núi phía Bắc */}
      <group position={[14, -0.3, -18]} rotation={[0, -0.55, 0]}>
        <mesh receiveShadow position={[0, 0.08, 0]}>
          <boxGeometry args={[16, 0.12, 1.2]} />
          <meshStandardMaterial color="#64748B" roughness={0.6} />
        </mesh>
        {/* Ray xe lửa đôi màu thép */}
        <mesh position={[0, 0.16, -0.25]}>
          <boxGeometry args={[16, 0.04, 0.08]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.16, 0.25]}>
          <boxGeometry args={[16, 0.04, 0.08]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>

        {/* Cổng hầm đường sắt xuyên núi (Stone Arch Railway Tunnel Portal) */}
        <group position={[7.6, 0.5, 0]}>
          {/* Vòm cổng đá xám bo quanh hầm */}
          <mesh position={[0, 0.35, 0]}>
            <boxGeometry args={[1.6, 1.3, 1.8]} />
            <meshStandardMaterial color="#475569" roughness={0.8} />
          </mesh>
          {/* Miệng hầm đen hun hút */}
          <mesh position={[-0.05, 0.28, 0]}>
            <boxGeometry args={[1.52, 1.1, 1.1]} />
            <meshStandardMaterial color="#0F172A" roughness={0.9} />
          </mesh>
          {/* Mái đồi đá xanh phủ nóc hầm */}
          <mesh position={[0.4, 0.9, 0]}>
            <coneGeometry args={[1.6, 0.9, 12]} />
            <meshStandardMaterial color="#166534" roughness={0.85} />
          </mesh>
        </group>

        {/* Đoàn tàu chở hàng mini 3 toa chạy trên ray (Mini Cargo Train) */}
        <group position={[-1.2, 0.28, -0.25]}>
          {/* Đầu máy xe lửa đỏ cam */}
          <mesh castShadow position={[1.6, 0.16, 0]}>
            <boxGeometry args={[1.0, 0.3, 0.26]} />
            <meshStandardMaterial color="#EA580C" roughness={0.3} metalness={0.5} />
          </mesh>
          {/* Buồng lái đầu máy */}
          <mesh position={[1.85, 0.36, 0]}>
            <boxGeometry args={[0.35, 0.18, 0.24]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.2} />
          </mesh>
          {/* Ống khói đầu máy */}
          <mesh position={[1.3, 0.38, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.16, 6]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          {/* Toa 1: Container Maersk Xanh Dương */}
          <mesh castShadow position={[0.3, 0.15, 0]}>
            <boxGeometry args={[1.1, 0.26, 0.24]} />
            <meshStandardMaterial color="#0284C7" roughness={0.4} />
          </mesh>
          {/* Toa 2: Container DHL Vàng */}
          <mesh castShadow position={[-0.9, 0.15, 0]}>
            <boxGeometry args={[1.1, 0.26, 0.24]} />
            <meshStandardMaterial color="#EAB308" roughness={0.4} />
          </mesh>
          {/* Toa 3: Container Evergreen Xanh Lá */}
          <mesh castShadow position={[-2.1, 0.15, 0]}>
            <boxGeometry args={[1.1, 0.26, 0.24]} />
            <meshStandardMaterial color="#15803D" roughness={0.4} />
          </mesh>
        </group>
      </group>

      {/* 7. MÂY TRẮNG XỐP BỒNG BỀNH VEN TRỜI (Fluffy Stylized Clouds) */}
      {([
        [-34, 22, -38, 1.4],
        [16, 24, -45, 1.6],
        [38, 21, -24, 1.3],
        [-42, 19, 18, 1.5],
        [34, 19, 32, 1.2],
        [-14, 23, 42, 1.4],
      ] as const).map(([cx, cy, cz, scale], cIdx) => (
        <group key={`cloud-${cIdx}`} position={[cx, cy, cz]} scale={scale}>
          {/* Cụm 4 hình cầu trắng tạo khối mây xốp tự nhiên */}
          <mesh>
            <sphereGeometry args={[2.2, 16, 16]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.95} transparent opacity={0.82} />
          </mesh>
          <mesh position={[1.5, -0.2, 0.4]}>
            <sphereGeometry args={[1.7, 16, 16]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.95} transparent opacity={0.82} />
          </mesh>
          <mesh position={[-1.4, -0.2, -0.4]}>
            <sphereGeometry args={[1.8, 16, 16]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.95} transparent opacity={0.82} />
          </mesh>
          <mesh position={[0.3, 0.8, 0]}>
            <sphereGeometry args={[1.5, 16, 16]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.95} transparent opacity={0.82} />
          </mesh>
        </group>
      ))}

      {/* Máy bay dân dụng tí hon bay trên vịnh biển */}
      <group position={[-14, 14, 8]} rotation={[0, -0.8, 0]}>
        {/* Thân máy bay */}
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 2.6, 8]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
        </mesh>
        {/* Cánh máy bay */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[3.2, 0.05, 0.6]} />
          <meshStandardMaterial color="#38BDF8" roughness={0.4} />
        </mesh>
        {/* Đuôi máy bay */}
        <mesh position={[0, 0.4, 1.1]}>
          <boxGeometry args={[0.06, 0.6, 0.4]} />
          <meshStandardMaterial color="#0284C7" />
        </mesh>
      </group>

      {/* 8. HOẠT CẢNH HÀNG HẢI: CA-NÔ TUẦN DUYÊN LƯỚT SÓNG & ĐÀN HẢI ÂU BAY LƯỢN */}
      <CoastalPatrolBoat />
      <CoastalSeagulls />
    </group>
  );
}
