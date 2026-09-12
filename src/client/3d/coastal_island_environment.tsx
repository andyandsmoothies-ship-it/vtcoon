// [UI-S01/MSS][UI-S04/MSS][IMP-13] CoastalIslandEnvironment — Vietnamese Coastal Island Metropolis
// Endless Living Ocean, 15-degree Sloped Sand Shoreline & Layered Tropical Foliage
import React, { useRef } from 'react';
import type { Mesh, PlaneGeometry } from 'three';
import { CoastalPatrolBoat } from './coastal_patrol_boat';
import { CoastalSeagulls } from './coastal_seagulls';
import { LayeredTropicalFoliage } from './layered_tropical_foliage';
import { useSafeFrame } from './safe_frame';

export function CoastalIslandEnvironment(): React.ReactElement {
  const waveRef = useRef<Mesh>(null);
  const shallowRef = useRef<Mesh>(null);
  const oceanGeomRef = useRef<PlaneGeometry>(null);

  useSafeFrame((state) => {
    const t = state.clock.getElapsedTime();

    // 1. Biến thiên độ cao vertex lưới sóng Gerstner / điều hòa thời gian thực
    if (oceanGeomRef.current) {
      const pos = oceanGeomRef.current.attributes.position;
      if (pos && pos.array instanceof Float32Array) {
        const arr = pos.array;
        const len = arr.length;
        for (let k = 0; k < len; k += 3) {
          const u = arr[k]!;
          const v = arr[k + 1]!;
          // Sóng Gerstner đa hài kết hợp chu kỳ sóng điều hòa (độ cao kiểm soát tránh ngập thềm cát)
          const w1 = Math.sin(u * 0.055 + t * 1.4) * 0.034;
          const w2 = Math.cos(v * 0.065 + t * 1.1) * 0.026;
          const w3 = Math.sin((u + v) * 0.038 + t * 1.8) * 0.015;
          arr[k + 2] = w1 + w2 + w3;
        }
        pos.needsUpdate = true;
        oceanGeomRef.current.computeVertexNormals();
      }
    }

    // 2. Dải bọt sóng ven bờ co giãn nhịp nhàng theo chu kỳ thủy triều 3.5s
    if (waveRef.current) {
      const tideCycle = Math.sin(t * (Math.PI * 2 / 3.5));
      const s = 1 + tideCycle * 0.042;
      waveRef.current.scale.set(s, s, 1);
    }

    // 3. Tầng nước nông ngọc bích nhấp nhô theo nhịp thở đại dương
    if (shallowRef.current) {
      shallowRef.current.position.y = -0.56 + Math.sin(t * (Math.PI * 2 / 3.5)) * 0.015;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ========================================================
          1. ĐẠI DƯƠNG NHIỆT ĐỚI VÔ CỰC (ENDLESS LIVING OCEAN)
          Phân tầng màu quang học: Ngọc bích (#06B6D4) -> Đại dương (#0369A1 / #0284C7) -> Đáy thẳm (#0C4A6E)
         ======================================================== */}
      {/* 1.0. Tầng đáy vực đại dương thẳm nơi chân trời (#0C4A6E) */}
      <mesh receiveShadow position={[0, -0.66, 0]}>
        <boxGeometry args={[260, 0.16, 260]} />
        <meshStandardMaterial color="#0C4A6E" roughness={0.15} metalness={0.4} />
      </mesh>

      {/* 1.1. Lưới sóng Gerstner vô cực PlaneGeometry(240, 240, 96, 96) */}
      <mesh receiveShadow position={[0, -0.60, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry ref={oceanGeomRef} args={[240, 240, 96, 96]} />
        <meshStandardMaterial
          color="#0284C7"
          roughness={0.08}
          metalness={0.55}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* 1.2. Tầng chuyển tiếp xanh thẳm đại dương (#0369A1) */}
      <mesh receiveShadow position={[0, -0.62, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[180, 180, 32, 32]} />
        <meshStandardMaterial
          color="#0369A1"
          roughness={0.1}
          metalness={0.5}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* 1.3. Tầng nước nông ngọc bích sát bờ đảo (#06B6D4) ôm đường bờ biển tự nhiên */}
      <mesh ref={shallowRef} receiveShadow position={[0, -0.56, 0]}>
        <cylinderGeometry args={[36, 43, 0.14, 48]} />
        <meshStandardMaterial
          color="#06B6D4"
          roughness={0.08}
          metalness={0.45}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* 1.4. Dải bọt sóng trắng ven bờ cát dập dềnh (Shoreline Dynamic Foam - chu kỳ 3.5s) */}
      <mesh ref={waveRef} position={[0, -0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[27.2, 34.2, 64]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.58} />
      </mesh>

      {/* ========================================================
          2. BỜ BIỂN CÁT VÁT NGHIÊNG TỰ NHIÊN 15 ĐỘ (SLOPED SAND SHORELINE)
          Cát vàng biển nhiệt đới (#FDE68A, roughness: 0.85) thay thế hoàn toàn đĩa xám & thảm cỏ phẳng
         ======================================================== */}
      {/* 2.1. Thềm bờ cát chính vát nghiêng bao quanh chân bệ bàn cờ sa bàn */}
      <mesh receiveShadow position={[0, -0.32, 0]}>
        <cylinderGeometry args={[16.2, 27.8, 0.32, 64]} />
        <meshStandardMaterial color="#FDE68A" roughness={0.85} metalness={0.02} />
      </mesh>

      {/* 2.1b. Gờ vát nghiêng bờ cát chuẩn 15 độ tiếp giáp nước biển (15-degree Sloped Sand Shoreline Skirt: tan(15°)=0.2679, Δy=0.28, Δr=1.045) */}
      <mesh receiveShadow position={[0, -0.46, 0]}>
        <cylinderGeometry args={[27.8, 28.85, 0.28, 64]} />
        <meshStandardMaterial color="#FDE68A" roughness={0.85} metalness={0.02} />
      </mesh>

      {/* 2.2. Thềm cát thoải mép nước biển tiếp xúc triều dâng (cát ẩm nhiệt đới) */}
      <mesh receiveShadow position={[0, -0.52, 0]}>
        <cylinderGeometry args={[27.5, 33.8, 0.16, 64]} />
        <meshStandardMaterial color="#F6D5A8" roughness={0.85} metalness={0.02} />
      </mesh>

      {/* 2.3. Mũi bãi tắm cong phía Tây Nam ôm lấy khu nghỉ dưỡng */}
      <mesh receiveShadow position={[-16, -0.42, 13]}>
        <cylinderGeometry args={[7.5, 9.8, 0.24, 32]} />
        <meshStandardMaterial color="#FDE68A" roughness={0.85} metalness={0.02} />
      </mesh>

      {/* 2.4. Mũi cát tự nhiên vươn ra biển phía Đông Nam */}
      <mesh receiveShadow position={[16, -0.44, 16]}>
        <cylinderGeometry args={[6.5, 8.8, 0.22, 32]} />
        <meshStandardMaterial color="#FDE68A" roughness={0.85} metalness={0.02} />
      </mesh>

      {/* 2.5. Đồi cát thoải phía Tây Bắc tạo đường cong bờ biển hữu cơ */}
      <mesh receiveShadow position={[-18, -0.40, -14]}>
        <cylinderGeometry args={[8.0, 10.5, 0.22, 32]} />
        <meshStandardMaterial color="#FDE68A" roughness={0.85} metalness={0.02} />
      </mesh>

      {/* 2.6. Khu nghỉ dưỡng bãi biển: Dù che nắng đa sắc & ghế nằm */}
      {([
        [-17.5, 11, '#EF4444'],
        [-19.0, 13, '#F59E0B'],
        [-16.0, 16, '#3B82F6'],
        [-14.5, 12, '#10B981'],
      ] as const).map(([bx, bz, color], uIdx) => (
        <group key={`umbrella-${uIdx}`} position={[bx, -0.36, bz]}>
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.8, 6]} />
            <meshStandardMaterial color="#F8FAFC" metalness={0.7} />
          </mesh>
          <mesh position={[0, 0.78, 0]} rotation={[0.1, 0, 0.1]}>
            <coneGeometry args={[0.55, 0.25, 8]} />
            <meshStandardMaterial color={color} roughness={0.3} />
          </mesh>
          <mesh position={[0.2, 0.04, 0]} rotation={[0, 0.3, -0.1]}>
            <boxGeometry args={[0.42, 0.05, 0.22]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* ========================================================
          3. CÂY NHIỆT ĐỚI ĐA TẦNG (LAYERED TROPICAL FOLIAGE)
          Thân cong tự nhiên, 3 tầng nón lệch góc (#15803D, #4ADE80), gom vào InstancedMesh (<85 calls)
         ======================================================== */}
      <LayeredTropicalFoliage />

      {/* ========================================================
          4. RẶNG ĐỒI NÚI XANH MAJESTIC PHÍA BẮC & ĐÔNG (ROLLING EMERALD MOUNTAINS)
         ======================================================== */}
      {/* Núi chính Đông Bắc 1 */}
      <mesh castShadow receiveShadow position={[42, 8.5, -42]}>
        <coneGeometry args={[26, 22, 32]} />
        <meshStandardMaterial color="#166534" roughness={0.85} />
      </mesh>
      {/* Núi phụ Đông Bắc 2 */}
      <mesh castShadow receiveShadow position={[54, 7.0, -22]}>
        <coneGeometry args={[22, 18, 32]} />
        <meshStandardMaterial color="#15803D" roughness={0.82} />
      </mesh>
      {/* Núi trung tâm phía Bắc */}
      <mesh castShadow receiveShadow position={[-8, 9.5, -52]}>
        <coneGeometry args={[30, 24, 32]} />
        <meshStandardMaterial color="#14532D" roughness={0.88} />
      </mesh>
      {/* Núi Tây Bắc 1 */}
      <mesh castShadow receiveShadow position={[-46, 8.0, -44]}>
        <coneGeometry args={[26, 20, 32]} />
        <meshStandardMaterial color="#166534" roughness={0.85} />
      </mesh>
      {/* Núi Tây Bắc 2 */}
      <mesh castShadow receiveShadow position={[-48, 6.5, -18]}>
        <coneGeometry args={[22, 17, 32]} />
        <meshStandardMaterial color="#15803D" roughness={0.85} />
      </mesh>
      {/* Đồi xanh thoai thoải phía Đông Nam */}
      <mesh castShadow receiveShadow position={[48, 4.5, 18]}>
        <coneGeometry args={[18, 12, 32]} />
        <meshStandardMaterial color="#22C55E" roughness={0.8} />
      </mesh>

      {/* 4.1. Vách đá xám sườn núi */}
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

      {/* 4.2. Dải sương mù chân núi thấp */}
      {([
        [-20, 3.2, -32, 14, 1.5, 5],
        [15, 3.6, -28, 16, 1.8, 6],
      ] as const).map(([fx, fy, fz, sx, sy, sz], fIdx) => (
        <mesh key={`fog-${fIdx}`} position={[fx, fy, fz]}>
          <boxGeometry args={[sx, sy, sz]} />
          <meshStandardMaterial color="#E0F2FE" roughness={1.0} transparent opacity={0.4} />
        </mesh>
      ))}

      {/* ========================================================
          5. CẢNG BIỂN & TÀU CONTAINER NGOÀI KHƠI (CARGO SHIPS & SEAPORT)
         ======================================================== */}
      {/* Tàu Container Lớn Số 1 (Vịnh biển Tây Nam: [-28, 0, 26]) */}
      <group position={[-28, -0.55, 26]} rotation={[0, 0.45, 0]}>
        <mesh castShadow position={[0, 0.5, 0]}>
          <boxGeometry args={[11.0, 0.9, 2.6]} />
          <meshStandardMaterial color="#DC2626" roughness={0.6} metalness={0.2} />
        </mesh>
        <mesh castShadow position={[0, 0.96, 0]}>
          <boxGeometry args={[10.6, 0.15, 2.4]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.4} />
        </mesh>
        <mesh castShadow position={[4.0, 1.5, 0]}>
          <boxGeometry args={[1.8, 1.1, 2.0]} />
          <meshStandardMaterial color="#F1F5F9" roughness={0.3} />
        </mesh>
        <mesh position={[4.3, 2.2, 0]}>
          <cylinderGeometry args={[0.2, 0.25, 0.6, 8]} />
          <meshStandardMaterial color="#EF4444" roughness={0.5} />
        </mesh>
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
            <mesh castShadow position={[0, 0.6, 0]}>
              <boxGeometry args={[1.4, 0.55, 1.6]} />
              <meshStandardMaterial color={i % 2 === 0 ? '#22C55E' : '#E11D48'} roughness={0.5} />
            </mesh>
          </group>
        ))}
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
        {[-2.5, -0.8, 0.9].map((cx, idx) => (
          <mesh key={`c2-${idx}`} castShadow position={[cx, 1.1, 0]}>
            <boxGeometry args={[1.4, 0.55, 1.5]} />
            <meshStandardMaterial color={idx === 0 ? '#F59E0B' : idx === 1 ? '#10B981' : '#EF4444'} />
          </mesh>
        ))}
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

      {/* ========================================================
          6. HẠ TẦNG KẾT NỐI: CẦU CẠN & ĐƯỜNG CAO TỐC NGOẠI ĐẢO (CAUSEWAYS)
         ======================================================== */}
      {/* Cầu vượt biển phía Tây Nam */}
      <group position={[-18, -0.3, 18]} rotation={[0, 0.78, 0]}>
        <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
          <boxGeometry args={[12, 0.18, 1.4]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.5} />
        </mesh>
        {/* Trụ cầu cắm xuống biển */}
        {[-4, 0, 4].map((px) => (
          <mesh key={`pier-${px}`} position={[px, -0.2, 0]}>
            <cylinderGeometry args={[0.25, 0.3, 0.6, 8]} />
            <meshStandardMaterial color="#64748B" roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* Tuyến đường ray xe lửa nối về núi phía Bắc */}
      <group position={[14, -0.3, -18]} rotation={[0, -0.55, 0]}>
        <mesh receiveShadow position={[0, 0.08, 0]}>
          <boxGeometry args={[16, 0.12, 1.2]} />
          <meshStandardMaterial color="#64748B" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.16, -0.25]}>
          <boxGeometry args={[16, 0.04, 0.08]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.16, 0.25]}>
          <boxGeometry args={[16, 0.04, 0.08]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>

        {/* Cổng hầm đường sắt xuyên núi */}
        <group position={[7.6, 0.5, 0]}>
          <mesh position={[0, 0.35, 0]}>
            <boxGeometry args={[1.6, 1.3, 1.8]} />
            <meshStandardMaterial color="#475569" roughness={0.8} />
          </mesh>
          <mesh position={[-0.05, 0.28, 0]}>
            <boxGeometry args={[1.52, 1.1, 1.1]} />
            <meshStandardMaterial color="#0F172A" roughness={0.9} />
          </mesh>
          <mesh position={[0.4, 0.9, 0]}>
            <coneGeometry args={[1.6, 0.9, 12]} />
            <meshStandardMaterial color="#166534" roughness={0.85} />
          </mesh>
        </group>

        {/* Đoàn tàu chở hàng mini 3 toa */}
        <group position={[-1.2, 0.28, -0.25]}>
          <mesh castShadow position={[1.6, 0.16, 0]}>
            <boxGeometry args={[1.0, 0.3, 0.26]} />
            <meshStandardMaterial color="#EA580C" roughness={0.3} metalness={0.5} />
          </mesh>
          <mesh position={[1.85, 0.36, 0]}>
            <boxGeometry args={[0.35, 0.18, 0.24]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.2} />
          </mesh>
          <mesh position={[1.3, 0.38, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.16, 6]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          <mesh castShadow position={[0.3, 0.15, 0]}>
            <boxGeometry args={[1.1, 0.26, 0.24]} />
            <meshStandardMaterial color="#0284C7" roughness={0.4} />
          </mesh>
          <mesh castShadow position={[-0.9, 0.15, 0]}>
            <boxGeometry args={[1.1, 0.26, 0.24]} />
            <meshStandardMaterial color="#EAB308" roughness={0.4} />
          </mesh>
          <mesh castShadow position={[-2.1, 0.15, 0]}>
            <boxGeometry args={[1.1, 0.26, 0.24]} />
            <meshStandardMaterial color="#15803D" roughness={0.4} />
          </mesh>
        </group>
      </group>

      {/* ========================================================
          7. MÂY TRẮNG XỐP BỒNG BỀNH VEN TRỜI & MÁY BAY DÂN DỤNG
         ======================================================== */}
      {([
        [-34, 22, -38, 1.4],
        [16, 24, -45, 1.6],
        [38, 21, -24, 1.3],
        [-42, 19, 18, 1.5],
        [34, 19, 32, 1.2],
        [-14, 23, 42, 1.4],
      ] as const).map(([cx, cy, cz, scale], cIdx) => (
        <group key={`cloud-${cIdx}`} position={[cx, cy, cz]} scale={scale}>
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
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 2.6, 8]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[3.2, 0.05, 0.6]} />
          <meshStandardMaterial color="#38BDF8" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.4, 1.1]}>
          <boxGeometry args={[0.06, 0.6, 0.4]} />
          <meshStandardMaterial color="#0284C7" />
        </mesh>
      </group>

      {/* ========================================================
          8. HOẠT CẢNH HÀNG HẢI: CA-NÔ TUẦN DUYÊN LƯỚT SÓNG & ĐÀN HẢI ÂU BAY LƯỢN
         ======================================================== */}
      <CoastalPatrolBoat />
      <CoastalSeagulls />
    </group>
  );
}
