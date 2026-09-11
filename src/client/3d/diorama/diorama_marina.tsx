// [UI-S02/MSS] DioramaMarina — Luxury yacht harbor, wooden piers, sculpted motorboats & heritage lighthouse
import React from 'react';

export function DioramaMarina(): React.ReactElement {
  return (
    <group position={[4.5, 0.1, 4.2]}>
      {/* ========================================================
          1. CẦU CẢNG GỖ & SÀN PROMENADE VEN VỊNH
         ======================================================== */}
      {/* Cầu cảng chính vươn ra mép nước */}
      <group position={[-1.2, 0.02, 0]}>
        <mesh receiveShadow castShadow position={[0, 0, 0]}>
          <boxGeometry args={[0.36, 0.04, 2.4]} />
          <meshStandardMaterial color="#854D0E" roughness={0.7} />
        </mesh>
        {/* Nhánh cầu cảng nhỏ (Finger Pier) */}
        <mesh receiveShadow castShadow position={[-0.4, 0, 0.4]}>
          <boxGeometry args={[0.6, 0.035, 0.22]} />
          <meshStandardMaterial color="#854D0E" roughness={0.7} />
        </mesh>
        <mesh receiveShadow castShadow position={[-0.4, 0, -0.6]}>
          <boxGeometry args={[0.6, 0.035, 0.22]} />
          <meshStandardMaterial color="#854D0E" roughness={0.7} />
        </mesh>
        {/* 4 Cọc bích neo tàu (Mooring Bollards) mạ đồng */}
        {[-0.8, -0.2, 0.4, 0.9].map((pz) => (
          <mesh key={`bollard-${pz}`} position={[0.15, 0.035, pz]}>
            <cylinderGeometry args={[0.015, 0.02, 0.04, 6]} />
            <meshStandardMaterial color="#B45309" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* ========================================================
          2. CẶP DU THUYỀN SIÊU SANG ĐIÊU KHẮC (Sculpted Luxury Yachts)
         ======================================================== */}
      {/* Du thuyền 1: Neo đậu tại bến phía Bắc */}
      <group position={[-1.8, -0.01, -0.6]} rotation={[0, -0.2, 0]}>
        {/* Đáy thân tàu V-Hull trắng sứ */}
        <mesh castShadow receiveShadow position={[0, 0.04, 0]}>
          <boxGeometry args={[0.42, 0.07, 1.1]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.2} metalness={0.1} />
        </mesh>
        {/* Mũi tàu thon nhọn khí động học */}
        <mesh castShadow position={[0, 0.04, -0.62]} rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[0.3, 0.07, 0.3]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.2} metalness={0.1} />
        </mesh>
        {/* Buồng lái kính sapphire vát nghiêng */}
        <mesh castShadow position={[0, 0.09, -0.05]}>
          <boxGeometry args={[0.3, 0.06, 0.52]} />
          <meshStandardMaterial color="#0284C7" roughness={0.1} metalness={0.9} />
        </mesh>
        {/* Mui tầng trên Flybridge & Vòm radar */}
        <mesh position={[0, 0.13, 0.02]}>
          <boxGeometry args={[0.26, 0.025, 0.38]} />
          <meshStandardMaterial color="#F1F5F9" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.16, 0.1]}>
          <cylinderGeometry args={[0.01, 0.02, 0.04, 4]} />
          <meshStandardMaterial color="#CBD5E1" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Du thuyền 2: Du thuyền thể thao màu xanh navy */}
      <group position={[-1.8, -0.01, 0.5]} rotation={[0, 0.1, 0]}>
        <mesh castShadow receiveShadow position={[0, 0.035, 0]}>
          <boxGeometry args={[0.36, 0.06, 0.85]} />
          <meshStandardMaterial color="#0F172A" roughness={0.3} metalness={0.3} />
        </mesh>
        {/* Mũi tàu thể thao */}
        <mesh castShadow position={[0, 0.035, -0.48]} rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[0.25, 0.06, 0.25]} />
          <meshStandardMaterial color="#0F172A" roughness={0.3} metalness={0.3} />
        </mesh>
        {/* Kính chắn gió vát cong */}
        <mesh position={[0, 0.08, -0.05]}>
          <boxGeometry args={[0.26, 0.05, 0.35]} />
          <meshStandardMaterial color="#38BDF8" roughness={0.1} metalness={0.8} />
        </mesh>
      </group>

      {/* ========================================================
          3. NGỌN HẢI ĐĂNG CỔ ĐIỂN BIỂU TƯỢNG (Heritage Lighthouse)
         ======================================================== */}
      <group position={[0.6, 0.06, 0.5]}>
        {/* Móng đá tròn vững chãi trên mũi vịnh */}
        <mesh castShadow receiveShadow position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.32, 0.38, 0.08, 16]} />
          <meshStandardMaterial color="#57534E" roughness={0.8} />
        </mesh>

        {/* Thân tháp hải đăng thon nhọn phân tầng Đỏ - Trắng */}
        <mesh castShadow position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.22, 0.28, 0.24, 16]} />
          <meshStandardMaterial color="#DC2626" roughness={0.4} />
        </mesh>
        <mesh castShadow position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.17, 0.22, 0.2, 16]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
        </mesh>
        <mesh castShadow position={[0, 0.56, 0]}>
          <cylinderGeometry args={[0.13, 0.17, 0.16, 16]} />
          <meshStandardMaterial color="#DC2626" roughness={0.4} />
        </mesh>

        {/* Đài quan sát & Ban công lan can sắt */}
        <mesh position={[0, 0.65, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.02, 16]} />
          <meshStandardMaterial color="#1E293B" roughness={0.5} />
        </mesh>

        {/* Thấu kính đèn biển Fresnel pha lê phát sáng vàng ấm */}
        <mesh position={[0, 0.72, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.12, 12]} />
          <meshBasicMaterial color="#FEF08A" />
        </mesh>

        {/* Mái vòm nón đỉnh tháp bằng đồng ngả rêu */}
        <mesh position={[0, 0.83, 0]} castShadow>
          <coneGeometry args={[0.14, 0.14, 16]} />
          <meshStandardMaterial color="#065F46" roughness={0.3} metalness={0.6} />
        </mesh>
      </group>
    </group>
  );
}
