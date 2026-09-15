import React, { useRef } from 'react';
import type { Group, Mesh } from 'three';
import { useEnvironmentStore } from '../store/environment_store';
import { useSafeFrame } from './safe_frame';

/**
 * Tính toán góc xoay đèn quét hải đăng theo thời gian
 */
export function calculateBeaconRotation(time: number, speed: number = 1.2): number {
  if (!Number.isFinite(time)) return 0;
  return time * speed;
}

/**
 * Tính toán độ sáng nhịp thở hào quang đỉnh tháp Landmark C3
 */
export function calculateSpirePulse(time: number, freq: number = 2.4): number {
  if (!Number.isFinite(time)) return 1.0;
  return 0.85 + Math.sin(time * freq) * 0.15;
}

/**
 * 3D Lighting Accents — Hào quang chóp tháp Landmark, đèn quét hải đăng & ánh sáng sân vận động
 */
export function CinematicLightingAccents(): React.ReactElement {
  const phase = useEnvironmentStore((s) => s.phase);
  const isNight = phase === 'night';
  const isSunset = phase === 'sunset';

  const beaconRef = useRef<Group>(null);
  const spireGlowRef = useRef<Mesh>(null);

  useSafeFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (beaconRef.current) {
      beaconRef.current.rotation.y = calculateBeaconRotation(t, 1.5);
    }
    if (spireGlowRef.current) {
      const s = calculateSpirePulse(t, 2.5);
      spireGlowRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Đèn cảnh báo hàng không đỏ tinh tế trên đỉnh Bitexco [-4.3, 1.45, -4.2] */}
      <mesh ref={spireGlowRef} position={[-4.3, 1.45, -4.2]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#EF4444" />
      </mesh>

      {/* 2. Đèn xoay pha lê ngọn hải đăng Vịnh Du Thuyền [4.5, 0.9, 4.2] */}
      <group ref={beaconRef} position={[4.5, 0.9, 4.2]}>
        {/* Tâm đèn pha lê phát sáng trắng tự nhiên */}
        <mesh>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        {/* Chóp vòm lồng đèn hải đăng thanh lịch */}
        <mesh position={[0, 0.08, 0]}>
          <coneGeometry args={[0.09, 0.07, 8]} />
          <meshBasicMaterial color="#94A3B8" />
        </mesh>
      </group>

      {/* 3. Vòm sáng mờ ấm áp trên Đấu trường Sân Vận Động [4.5, 0.35, -4.5] */}
      <mesh position={[4.5, 0.35, -4.5]}>
        <cylinderGeometry args={[1.2, 1.4, 0.1, 16]} />
        <meshBasicMaterial
          color="#BAE6FD"
          transparent
          opacity={isNight ? 0.25 : isSunset ? 0.18 : 0.12}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/**
 * 2D Cinematic Overlay — Lớp phủ quang học Tilt-Shift Macro & Lens Vignette cao cấp
 */
export function CinematicOverlay(): React.ReactElement {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Lens Vignette: Tối góc quang học mô phỏng ống kính máy ảnh Cine chuyên nghiệp */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 70%, rgba(14, 116, 144, 0.12) 88%, rgba(12, 74, 110, 0.32) 100%)',
        }}
      />

      {/* 2. Tilt-Shift Macro Defocus Bands: Dải mờ quang học viền trên & viền dưới sa bàn đồ chơi */}
      <div
        className="absolute top-0 left-0 right-0 h-20 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(12, 74, 110, 0.18) 0%, transparent 100%)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(12, 74, 110, 0.22) 0%, transparent 100%)',
        }}
      />

      {/* 3. Golden Hour Color Grade: Dải lọc màu nắng vàng ấm kết hợp trời xanh dịu */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(254, 243, 199, 0.035) 0%, transparent 50%, rgba(186, 230, 253, 0.025) 100%)',
          mixBlendMode: 'screen',
        }}
      />
    </div>
  );
}
