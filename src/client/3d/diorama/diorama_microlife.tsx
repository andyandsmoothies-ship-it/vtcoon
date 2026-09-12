// [UI-S02/MSS] DioramaMicroLife — Miniature vehicles, leisure boat & tabletop micro-details
import React, { useRef } from 'react';
import type { Group } from 'three';
import { useSafeFrame } from '../safe_frame';

export function DioramaMicroLife(): React.ReactElement {
  const boatRef = useRef<Group>(null);
  const carRef = useRef<Group>(null);

  // Chuyển động nhấp nhô vi mô nhẹ nhàng của thuyền nước và xe cầu cạn (60 FPS diorama drift)
  useSafeFrame((state) => {
    const t = state.clock.elapsedTime;
    if (boatRef.current) {
      boatRef.current.position.z = Math.sin(t * 0.4) * 0.6;
      boatRef.current.rotation.z = Math.sin(t * 0.8) * 0.04;
    }
    if (carRef.current) {
      // Động cơ xe buýt rung nhẹ tại trạm dừng ngắm cảnh ven đại lộ
      carRef.current.position.y = 0.145 + Math.sin(t * 2.5) * 0.001;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ========================================================
          1. XE HƠI & XE BUÝT TÍ HON ĐẬU VEN VỈA HÈ ĐẠI LỘ TÂY
         ======================================================== */}
      {/* Xe buýt vàng hai tầng mini tại trạm đón khách ven đường */}
      <group ref={carRef} position={[-5.32, 0.145, 0.2]}>
        <mesh castShadow position={[0, 0.035, 0]}>
          <boxGeometry args={[0.11, 0.07, 0.22]} />
          <meshStandardMaterial color="#F59E0B" roughness={0.3} />
        </mesh>
        {/* Kính xe buýt */}
        <mesh position={[0, 0.045, 0.04]}>
          <boxGeometry args={[0.102, 0.03, 0.12]} />
          <meshStandardMaterial color="#0F172A" roughness={0.2} />
        </mesh>
      </group>

      {/* Xe hơi đỏ thể thao tí hon đậu ven vỉa hè Đại lộ Tây */}
      <group position={[-5.32, 0.145, -1.2]}>
        <mesh castShadow position={[0, 0.02, 0]}>
          <boxGeometry args={[0.08, 0.04, 0.15]} />
          <meshStandardMaterial color="#DC2626" roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.032, -0.01]}>
          <boxGeometry args={[0.076, 0.025, 0.08]} />
          <meshStandardMaterial color="#0284C7" roughness={0.1} />
        </mesh>
      </group>

      {/* Xe hơi xanh lục đậu ven vỉa hè Đại lộ Tây */}
      <group position={[-5.32, 0.145, 1.4]}>
        <mesh castShadow position={[0, 0.02, 0]}>
          <boxGeometry args={[0.08, 0.04, 0.15]} />
          <meshStandardMaterial color="#16A34A" roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.032, -0.01]}>
          <boxGeometry args={[0.076, 0.025, 0.08]} />
          <meshStandardMaterial color="#0284C7" roughness={0.1} />
        </mesh>
      </group>

      {/* ========================================================
          2. CA-NÔ DU NGOẠN NHẤP NHÔ TRÊN SÔNG (Central River)
         ======================================================== */}
      <group ref={boatRef} position={[0, 0.052, -1.8]}>
        {/* Vỏ ca-nô trắng */}
        <mesh castShadow position={[0, 0.015, 0]}>
          <boxGeometry args={[0.16, 0.03, 0.35]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
        </mesh>
        {/* Mũi thuyền nhọn */}
        <mesh position={[0, 0.015, -0.2]} rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[0.11, 0.03, 0.11]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
        </mesh>
        {/* Mui che ca-nô xanh biển */}
        <mesh position={[0, 0.04, 0.02]}>
          <boxGeometry args={[0.13, 0.02, 0.16]} />
          <meshStandardMaterial color="#0284C7" roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}
