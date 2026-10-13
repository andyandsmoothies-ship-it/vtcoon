// [UI-S02/MSS] DioramaMicroLife — Miniature vehicles, leisure boat & tabletop micro-details
import React, { useRef } from 'react';
import type { Group } from 'three';
import { useSafeFrame } from '../safe_frame';

export interface DioramaMicroLifeProps {
  readonly isMobile?: boolean;
  readonly isVisible?: boolean;
}

export function DioramaMicroLife({ isMobile = false, isVisible = true }: DioramaMicroLifeProps = {}): React.ReactElement {
  const boatRef = useRef<Group>(null);
  const carRef = useRef<Group>(null);

  return (
    <group position={[0, 0, 0]}>
      {!isMobile && (
        <DioramaMicroLifeFrameLoop
          isVisible={isVisible}
          boatRef={boatRef}
          carRef={carRef}
        />
      )}
      {/* ========================================================
          1. XE BUÝT TÍ HON ĐẬU VEN VỈA HÈ ĐẠI LỘ TÂY
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

      {/* ========================================================
          2. CA-NÔ DU NGOẠN NHẤP NHÔ TRÊN SÔNG (Central River)
         ======================================================== */}
      <group ref={boatRef} position={[0, -0.030, -1.8]}>
        {/* Vỏ ca-nô trắng - Tắt castShadow theo chuẩn Zero Shadow Budget [P3] */}
        <mesh position={[0, 0.015, 0]}>
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

export interface DioramaMicroLifeFrameLoopProps {
  readonly isVisible?: boolean;
  readonly boatRef: React.RefObject<Group | null>;
  readonly carRef: React.RefObject<Group | null>;
}

export function DioramaMicroLifeFrameLoop({
  isVisible = true,
  boatRef,
  carRef,
}: DioramaMicroLifeFrameLoopProps): null {
  const timeAccumRef = useRef<number>(0);

  useSafeFrame((_, delta) => {
    if (!isVisible) return;
    const clampedDelta = Math.min(delta, 0.1);
    timeAccumRef.current += clampedDelta;
    const t = timeAccumRef.current;

    if (boatRef.current) {
      boatRef.current.position.z = Math.sin(t * 0.4) * 0.6;
      boatRef.current.rotation.z = Math.sin(t * 0.8) * 0.04;
    }
    if (carRef.current) {
      // Động cơ xe buýt rung nhẹ tại trạm dừng ngắm cảnh ven đại lộ
      carRef.current.position.y = 0.145 + Math.sin(t * 2.5) * 0.001;
    }
  });

  return null;
}


