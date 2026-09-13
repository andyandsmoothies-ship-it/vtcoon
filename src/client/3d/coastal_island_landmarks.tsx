// [UI-S01/MSS][IMP-23] CoastalIslandLandmarks — Retropoly Iconic Landmarks
// Airport Terminal & Runway (NW), Grand Arched Train Station (East) & Rolling Emerald Mountains
import React from 'react';

/**
 * Rặng đồi núi xanh biếc ôm trọn đường chân trời phía Bắc chuẩn phong cách Retropoly
 */
export function RollingEmeraldMountains(): React.ReactElement {
  return (
    <group position={[0, 0, 0]}>
      {/* 1. Núi trung tâm phía Bắc hùng vĩ nơi chân trời xa */}
      <mesh castShadow receiveShadow position={[-6, 12.0, -52]}>
        <coneGeometry args={[22, 24, 32]} />
        <meshStandardMaterial color="#166534" roughness={0.86} />
      </mesh>
      {/* Núi đỉnh cao chọc trời phía sau tạo chiều sâu hậu cảnh */}
      <mesh castShadow receiveShadow position={[6, 14.5, -62]}>
        <coneGeometry args={[26, 29, 32]} />
        <meshStandardMaterial color="#14532D" roughness={0.9} />
      </mesh>
      {/* 2. Núi Đông Bắc ở cự ly xa, không xâm lấn sườn Đông */}
      <mesh castShadow receiveShadow position={[26, 10.5, -55]}>
        <coneGeometry args={[18, 21, 32]} />
        <meshStandardMaterial color="#15803D" roughness={0.84} />
      </mesh>
      <mesh castShadow receiveShadow position={[42, 8.5, -58]}>
        <coneGeometry args={[16, 17, 28]} />
        <meshStandardMaterial color="#22C55E" roughness={0.82} />
      </mesh>
      {/* 3. Núi Tây Bắc hậu cảnh che chắn vịnh */}
      <mesh castShadow receiveShadow position={[-28, 11.0, -50]}>
        <coneGeometry args={[19, 22, 32]} />
        <meshStandardMaterial color="#166534" roughness={0.85} />
      </mesh>
      <mesh castShadow receiveShadow position={[-44, 9.0, -54]}>
        <coneGeometry args={[16, 18, 28]} />
        <meshStandardMaterial color="#15803D" roughness={0.83} />
      </mesh>

      {/* 4. Vách đá xám sườn núi kiến tạo địa chất */}
      {([
        [-12, 5.0, -42, 0.25, 0.4],
        [18, 4.5, -45, -0.2, 0.35],
        [-25, 4.2, -43, 0.15, -0.3],
        [32, 4.0, -48, -0.1, 0.5],
      ] as const).map(([rx, ry, rz, rotX, rotY], idx) => (
        <mesh key={`mtn-rock-${idx}`} position={[rx, ry, rz]} rotation={[rotX, rotY, 0.1]}>
          <boxGeometry args={[5.5, 6.5, 3.5]} />
          <meshStandardMaterial color="#64748B" roughness={0.92} />
        </mesh>
      ))}

      {/* 5. Mây trắng xốp bồng bềnh ôm quanh sườn núi chuẩn phong cách Retropoly */}
      {([
        [-18, 16, -44, 1.8],
        [14, 18, -48, 2.0],
        [0, 20, -54, 2.2],
        [32, 15, -46, 1.6],
        [-34, 15, -45, 1.7],
      ] as const).map(([cx, cy, cz, scale], cIdx) => (
        <group key={`mtn-cloud-${cIdx}`} position={[cx, cy, cz]} scale={scale}>
          <mesh>
            <sphereGeometry args={[2.2, 16, 16]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.95} transparent opacity={0.86} />
          </mesh>
          <mesh position={[1.6, -0.2, 0.4]}>
            <sphereGeometry args={[1.7, 16, 16]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.95} transparent opacity={0.86} />
          </mesh>
          <mesh position={[-1.5, -0.2, -0.4]}>
            <sphereGeometry args={[1.8, 16, 16]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.95} transparent opacity={0.86} />
          </mesh>
          <mesh position={[0.2, 0.8, 0]}>
            <sphereGeometry args={[1.5, 16, 16]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.95} transparent opacity={0.86} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * Bán đảo Sân bay Quốc tế Thu nhỏ (NW Airport Peninsula)
 * Tọa lạc góc Tây Bắc bàn cờ, nhô cao vững chãi trên thềm đảo
 */
export function AirportLandmark(): React.ReactElement {
  return (
    <group position={[-15.2, 0.02, -13.8]} rotation={[0, 0.65, 0]}>
      {/* Thềm đất bán đảo sân bay cao trên mặt nước */}
      <mesh receiveShadow position={[0, -0.15, 0]}>
        <boxGeometry args={[13.5, 0.32, 7.5]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.7} />
      </mesh>

      {/* Đường băng chính (Runway tarmac) */}
      <mesh receiveShadow position={[0, 0.03, 1.0]}>
        <boxGeometry args={[12.2, 0.06, 2.4]} />
        <meshStandardMaterial color="#334155" roughness={0.65} />
      </mesh>
      {/* Vạch kẻ trắng tim đường băng */}
      {[-4.5, -2.25, 0, 2.25, 4.5].map((x, i) => (
        <mesh key={`rwy-mark-${i}`} position={[x, 0.07, 1.0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.3, 0.14]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      ))}

      {/* Nhà ga sân bay hiện đại (Airport Terminal) */}
      <group position={[0, 0.04, -1.8]}>
        <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
          <boxGeometry args={[5.6, 0.8, 2.0]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.3} metalness={0.2} />
        </mesh>
        {/* Mái vòm kính xanh ngọc */}
        <mesh position={[0, 0.92, 0]}>
          <boxGeometry args={[5.4, 0.14, 2.1]} />
          <meshStandardMaterial color="#0284C7" roughness={0.15} metalness={0.4} />
        </mesh>
        {/* Cầu ống lồng đón khách (Jet bridges) */}
        {[-1.8, 1.8].map((jx) => (
          <mesh key={`jetbridge-${jx}`} position={[jx, 0.38, 1.3]}>
            <boxGeometry args={[0.55, 0.38, 1.0]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.5} />
          </mesh>
        ))}
      </group>

      {/* Đài kiểm soát không lưu (Control Tower) */}
      <group position={[4.6, 0.04, -1.8]}>
        <mesh castShadow position={[0, 1.0, 0]}>
          <cylinderGeometry args={[0.24, 0.35, 2.0, 12]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.4} />
        </mesh>
        <mesh position={[0, 2.05, 0]}>
          <cylinderGeometry args={[0.5, 0.38, 0.4, 12]} />
          <meshStandardMaterial color="#0284C7" roughness={0.2} metalness={0.3} />
        </mesh>
        <mesh position={[0, 2.3, 0]}>
          <octahedronGeometry args={[0.07]} />
          <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={1.5} />
        </mesh>
      </group>

      {/* 2 Máy bay dân dụng mini đậu tại bãi đỗ */}
      {([-1.8, 1.8] as const).map((px, idx) => (
        <group key={`parked-jet-${idx}`} position={[px, 0.16, -0.4]} rotation={[0, Math.PI, 0]} scale={[0.7, 0.7, 0.7]}>
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.24, 0.24, 2.6, 12]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.25} />
          </mesh>
          <mesh position={[0, 0, 0.1]}>
            <boxGeometry args={[3.0, 0.05, 0.6]} />
            <meshStandardMaterial color={idx === 0 ? '#DC2626' : '#0284C7'} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.38, 1.1]}>
            <boxGeometry args={[0.06, 0.55, 0.38]} />
            <meshStandardMaterial color={idx === 0 ? '#DC2626' : '#0284C7'} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * Nhà ga xe lửa trung tâm mái vòm kính & Tàu cao tốc hiện đại (East Grand Station)
 * Chạy dọc sườn Đông bàn cờ song song tuyến phố Đông, tầm nhìn khoáng đạt
 */
export function TrainStationLandmark(): React.ReactElement {
  return (
    <group position={[14.8, 0.02, 0.0]} rotation={[0, -Math.PI / 2, 0]}>
      {/* Sân ga & Thềm đá granite kiên cố trên thềm đảo */}
      <mesh receiveShadow position={[0, -0.15, 0]}>
        <boxGeometry args={[13.2, 0.32, 5.4]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.6} />
      </mesh>

      {/* Tuyến đường ray đôi song song sườn Đông */}
      <group position={[0, 0.04, 0.8]}>
        <mesh receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[12.8, 0.04, 1.3]} />
          <meshStandardMaterial color="#475569" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.04, -0.28]}>
          <boxGeometry args={[12.8, 0.03, 0.08]} />
          <meshStandardMaterial color="#94A3B8" metalness={0.9} roughness={0.15} />
        </mesh>
        <mesh position={[0, 0.04, 0.28]}>
          <boxGeometry args={[12.8, 0.03, 0.08]} />
          <meshStandardMaterial color="#94A3B8" metalness={0.9} roughness={0.15} />
        </mesh>
      </group>

      {/* Nhà ga mái vòm kính hình cánh cung chuẩn Retropoly */}
      <group position={[0, 0.04, -1.2]}>
        {/* Khung thân nhà ga */}
        <mesh castShadow receiveShadow position={[0, 0.65, 0]}>
          <boxGeometry args={[7.2, 1.1, 2.2]} />
          <meshStandardMaterial color="#F1F5F9" roughness={0.35} />
        </mesh>
        {/* Mái vòm kính bán nguyệt xanh lơ kiệt tác */}
        <mesh position={[0, 1.25, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.15, 1.15, 7.2, 24, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color="#0284C7" roughness={0.15} metalness={0.4} transparent opacity={0.75} />
        </mesh>
        {/* Tháp đồng hồ nhà ga trung tâm */}
        <mesh position={[0, 1.75, 1.0]}>
          <boxGeometry args={[0.65, 1.0, 0.35]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.9, 1.18]}>
          <circleGeometry args={[0.18, 16]} />
          <meshBasicMaterial color="#FEF08A" />
        </mesh>
      </group>

      {/* Đoàn tàu cao tốc Shinkansen / Bullet Train trắng - xanh dương */}
      <group position={[-0.8, 0.12, 0.8]}>
        {/* Đầu tàu vuốt nhọn khí động học */}
        <mesh castShadow position={[3.0, 0.22, 0]}>
          <boxGeometry args={[1.5, 0.35, 0.38]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.2} metalness={0.1} />
        </mesh>
        <mesh position={[3.85, 0.18, 0]} rotation={[0, 0, -0.4]}>
          <boxGeometry args={[0.55, 0.26, 0.36]} />
          <meshStandardMaterial color="#0284C7" roughness={0.2} />
        </mesh>
        {/* 3 Toa hành khách nối đuôi */}
        {[-2.0, -0.5, 1.1].map((tx, idx) => (
          <group key={`bullet-coach-${idx}`} position={[tx, 0.22, 0]}>
            <mesh castShadow>
              <boxGeometry args={[1.3, 0.35, 0.38]} />
              <meshStandardMaterial color="#FFFFFF" roughness={0.2} metalness={0.1} />
            </mesh>
            <mesh position={[0, 0.07, 0]}>
              <boxGeometry args={[1.32, 0.07, 0.39]} />
              <meshStandardMaterial color="#0284C7" roughness={0.3} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
