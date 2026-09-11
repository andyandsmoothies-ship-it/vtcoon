// [UI-S02/MSS] DioramaTerrain — Unified sculpted tabletop landmass for Vtcoon diorama
import React from 'react';

export function DioramaTerrain(): React.ReactElement {
  return (
    <group position={[0, 0, 0]}>
      {/* ========================================================
          1. BÁN ĐẢO PHÍA TÂY (West Peninsula: X ~ -4.5)
          Bao trùm Khu Tài chính (Bắc), Đại lộ Trung tâm và Khu Di sản (Nam)
         ======================================================== */}
      <group position={[-4.5, 0, 0]}>
        {/* Tầng 1: Móng đá sa thạch ngà giật cấp liền khối */}
        <mesh receiveShadow position={[0, 0.05, 0]}>
          <boxGeometry args={[3.8, 0.08, 12.2]} />
          <meshStandardMaterial color="#D4C5A3" roughness={0.78} />
        </mesh>

        {/* Tầng 2: Thảm cỏ xanh rêu đô thị tự nhiên */}
        <mesh receiveShadow position={[0, 0.1, 0]}>
          <boxGeometry args={[3.5, 0.06, 11.8]} />
          <meshStandardMaterial color="#2D5A27" roughness={0.85} />
        </mesh>

        {/* Đại lộ Trục Tây (Grand West Boulevard): Nhựa đường bóng bẩy & vỉa hè */}
        <mesh receiveShadow position={[-0.3, 0.132, 0]}>
          <boxGeometry args={[0.7, 0.015, 11.6]} />
          <meshStandardMaterial color="#1E293B" roughness={0.16} metalness={0.25} />
        </mesh>
        {/* Vỉa hè lát đá hoa cương hai bên đại lộ */}
        <mesh receiveShadow position={[-0.72, 0.134, 0]}>
          <boxGeometry args={[0.14, 0.016, 11.6]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.3} metalness={0.1} />
        </mesh>
        <mesh receiveShadow position={[0.12, 0.134, 0]}>
          <boxGeometry args={[0.14, 0.016, 11.6]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.3} metalness={0.1} />
        </mesh>
        {/* Vạch kẻ phân làn trắng gián đoạn */}
        {[-4.5, -3.0, -1.5, 0, 1.5, 3.0, 4.5].map((pz) => (
          <mesh key={`west-lane-${pz}`} position={[-0.3, 0.142, pz]}>
            <boxGeometry args={[0.04, 0.005, 0.5]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.25} />
          </mesh>
        ))}
        {/* Vạch kẻ người đi bộ qua đường tại các giao lộ (Zebra Crossings) */}
        {[-3.75, -0.75, 0.75, 3.75].map((cz) => (
          <group key={`zebra-${cz}`} position={[-0.3, 0.142, cz]}>
            {[-0.24, -0.12, 0, 0.12, 0.24].map((ox, sIdx) => (
              <mesh key={`stripe-${sIdx}`} position={[ox, 0, 0]}>
                <boxGeometry args={[0.07, 0.005, 0.28]} />
                <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* ========================================================
          2. BÁN ĐẢO PHÍA ĐÔNG (East Peninsula: X ~ 4.5)
          Bao trùm Sân Vận Động (Bắc), Đường ven vịnh và Bến Du Thuyền (Nam)
         ======================================================== */}
      <group position={[4.5, 0, 0]}>
        {/* Tầng 1: Móng đá sa thạch ngà giật cấp liền khối */}
        <mesh receiveShadow position={[0, 0.05, 0]}>
          <boxGeometry args={[3.8, 0.08, 12.2]} />
          <meshStandardMaterial color="#D4C5A3" roughness={0.78} />
        </mesh>

        {/* Tầng 2: Thảm cỏ xanh rêu đô thị */}
        <mesh receiveShadow position={[0, 0.1, 0]}>
          <boxGeometry args={[3.5, 0.06, 11.8]} />
          <meshStandardMaterial color="#2D5A27" roughness={0.85} />
        </mesh>

        {/* Tuyến dạo ven vịnh (Coastal Promenade) lát đá sa mộc sẫm bóng */}
        <mesh receiveShadow position={[0.3, 0.132, 0]}>
          <boxGeometry args={[0.7, 0.015, 11.6]} />
          <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.18} />
        </mesh>
        <mesh receiveShadow position={[-0.12, 0.134, 0]}>
          <boxGeometry args={[0.14, 0.016, 11.6]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.35} />
        </mesh>
        <mesh receiveShadow position={[0.72, 0.134, 0]}>
          <boxGeometry args={[0.14, 0.016, 11.6]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.35} />
        </mesh>
        {/* Vạch kẻ người đi bộ qua đường tại các đầu cầu (East Zebra Crossings) */}
        {[-3.75, 3.75].map((cz) => (
          <group key={`east-zebra-${cz}`} position={[0.3, 0.142, cz]}>
            {[-0.24, -0.12, 0, 0.12, 0.24].map((ox, sIdx) => (
              <mesh key={`east-stripe-${sIdx}`} position={[ox, 0, 0]}>
                <boxGeometry args={[0.07, 0.005, 0.28]} />
                <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* ========================================================
          3. CÁC BẬC THỀM ĐÁ HOA CƯƠNG KẾT NỐI VÀO QUẢNG TRƯỜNG CHÌM
         ======================================================== */}
      {/* Lối bậc thang Bắc (North Plaza Stairway) */}
      <group position={[0, 0.06, -2.4]}>
        <mesh receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[1.4, 0.06, 0.4]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.5} />
        </mesh>
        <mesh receiveShadow position={[0, -0.025, 0.25]}>
          <boxGeometry args={[1.2, 0.04, 0.3]} />
          <meshStandardMaterial color="#94A3B8" roughness={0.6} />
        </mesh>
      </group>

      {/* Lối bậc thang Nam (South Plaza Stairway) */}
      <group position={[0, 0.06, 2.4]}>
        <mesh receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[1.4, 0.06, 0.4]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.5} />
        </mesh>
        <mesh receiveShadow position={[0, -0.025, -0.25]}>
          <boxGeometry args={[1.2, 0.04, 0.3]} />
          <meshStandardMaterial color="#94A3B8" roughness={0.6} />
        </mesh>
      </group>

      {/* Lối bậc thang Tây (West Plaza Stairway) */}
      <group position={[-2.4, 0.06, 0]}>
        <mesh receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[0.4, 0.06, 1.4]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.5} />
        </mesh>
        <mesh receiveShadow position={[0.25, -0.025, 0]}>
          <boxGeometry args={[0.3, 0.04, 1.2]} />
          <meshStandardMaterial color="#94A3B8" roughness={0.6} />
        </mesh>
      </group>

      {/* Lối bậc thang Đông (East Plaza Stairway) */}
      <group position={[2.4, 0.06, 0]}>
        <mesh receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[0.4, 0.06, 1.4]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.5} />
        </mesh>
        <mesh receiveShadow position={[-0.25, -0.025, 0]}>
          <boxGeometry args={[0.3, 0.04, 1.2]} />
          <meshStandardMaterial color="#94A3B8" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}
