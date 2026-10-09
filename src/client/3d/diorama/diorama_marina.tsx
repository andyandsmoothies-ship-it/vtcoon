// [UI-S02/MSS][IMP-221] DioramaMarina — Luxury yacht harbor, wooden piers, sculpted motorboats & heritage lighthouse
import React, { useRef } from 'react';
import type { Group } from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import { SoundEngine } from '../../audio/sound_engine';
import { useSafeFrame } from '../safe_frame';
import { useEnvironmentStore, type TimeOfDayPhase } from '../../store/environment_store';
import { DioramaPerchingBirds } from './diorama_perching_birds';

export function calculateWatercraftBobbing(time: number, phaseOffset: number = 0): { y: number; rotZ: number; rotX: number } {
  if (!Number.isFinite(time)) return { y: 0, rotZ: 0, rotX: 0 };
  const y = Math.sin(time * 2.8 + phaseOffset) * 0.006;
  const rotZ = Math.sin(time * 2.4 + phaseOffset) * 0.022;
  const rotX = Math.cos(time * 2.1 + phaseOffset) * 0.015;
  return { y, rotZ, rotX };
}

export function calculateBeaconIntensity(phase: TimeOfDayPhase): number {
  if (phase === 'night') return 2.2;
  if (phase === 'sunset') return 0.8;
  return 0.1;
}

export function calculateBeaconRotation(time: number, speed: number = 1.2): number {
  if (!Number.isFinite(time)) return 0;
  return time * speed;
}

export function DioramaMarina({ isMobile = false }: { readonly isMobile?: boolean } = {}): React.ReactElement {
  // Phase subscription: Chỉ re-render khi phase thay đổi (vài phút/lần). Không ảnh hưởng 60 FPS frame loop.
  const phase = useEnvironmentStore((s) => s.phase);
  const yacht1Ref = useRef<Group>(null);
  const yacht2Ref = useRef<Group>(null);
  const beaconRef = useRef<Group>(null);

  useSafeFrame((state) => {
    if (isMobile) return;
    const t = state.clock.elapsedTime;
    if (yacht1Ref.current) {
      const b1 = calculateWatercraftBobbing(t, 0.0);
      yacht1Ref.current.position.y = -0.032 + b1.y;
      yacht1Ref.current.rotation.z = b1.rotZ;
      yacht1Ref.current.rotation.x = b1.rotX;
    }
    if (yacht2Ref.current) {
      const b2 = calculateWatercraftBobbing(t, 1.6);
      yacht2Ref.current.position.y = -0.032 + b2.y;
      yacht2Ref.current.rotation.z = b2.rotZ;
      yacht2Ref.current.rotation.x = b2.rotX;
    }
    if (beaconRef.current) {
      beaconRef.current.rotation.y = calculateBeaconRotation(t, 1.2);
    }
  });

  const beaconIntensity = calculateBeaconIntensity(phase);
  const isNightOrSunset = phase === 'night' || phase === 'sunset';

  const handleLighthouseInteraction = (e: ThreeEvent<PointerEvent> | React.MouseEvent | { stopPropagation: () => void }) => {
    e.stopPropagation();
    SoundEngine.playLighthouseHorn();
  };

  return (
    <group position={[4.5, 0.1, 4.2]}>
      {/* 1. CẦU CẢNG GỖ & SÀN PROMENADE VEN VỊNH */}
      <group position={[-1.2, 0.02, 0]}>
        <mesh receiveShadow castShadow position={[0, 0, 0]}>
          <boxGeometry args={[0.36, 0.04, 2.4]} />
          <meshStandardMaterial color="#854D0E" roughness={0.7} />
        </mesh>
        <mesh receiveShadow castShadow position={[-0.4, 0, 0.4]}>
          <boxGeometry args={[0.6, 0.035, 0.22]} />
          <meshStandardMaterial color="#854D0E" roughness={0.7} />
        </mesh>
        <mesh receiveShadow castShadow position={[-0.4, 0, -0.6]}>
          <boxGeometry args={[0.6, 0.035, 0.22]} />
          <meshStandardMaterial color="#854D0E" roughness={0.7} />
        </mesh>
        {[-0.8, -0.2, 0.4, 0.9].map((pz) => (
          <mesh key={`bollard-${pz}`} position={[0.15, 0.035, pz]}>
            <cylinderGeometry args={[0.015, 0.02, 0.04, 6]} />
            <meshStandardMaterial color="#B45309" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* 2. CẶP DU THUYỀN SIÊU SANG ĐIÊU KHẮC */}
      <group ref={yacht1Ref} position={[-1.8, -0.032, -0.6]} rotation={[0, -0.2, 0]}>
        <mesh castShadow receiveShadow position={[0, 0.04, 0]}>
          <boxGeometry args={[0.42, 0.07, 1.1]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.2} metalness={0.1} />
        </mesh>
        <mesh castShadow position={[0, 0.04, -0.62]} rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[0.3, 0.07, 0.3]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.2} metalness={0.1} />
        </mesh>
        <mesh castShadow position={[0, 0.09, -0.05]}>
          <boxGeometry args={[0.3, 0.06, 0.52]} />
          <meshStandardMaterial color="#0284C7" roughness={0.1} metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.13, 0.02]}>
          <boxGeometry args={[0.26, 0.025, 0.38]} />
          <meshStandardMaterial color="#F1F5F9" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.16, 0.1]}>
          <cylinderGeometry args={[0.01, 0.02, 0.04, 4]} />
          <meshStandardMaterial color="#CBD5E1" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      <group ref={yacht2Ref} position={[-1.8, -0.032, 0.5]} rotation={[0, 0.1, 0]}>
        <mesh castShadow receiveShadow position={[0, 0.035, 0]}>
          <boxGeometry args={[0.36, 0.06, 0.85]} />
          <meshStandardMaterial color="#0F172A" roughness={0.3} metalness={0.3} />
        </mesh>
        <mesh castShadow position={[0, 0.035, -0.48]} rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[0.25, 0.06, 0.25]} />
          <meshStandardMaterial color="#0F172A" roughness={0.3} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0.08, -0.05]}>
          <boxGeometry args={[0.26, 0.05, 0.35]} />
          <meshStandardMaterial color="#38BDF8" roughness={0.1} metalness={0.8} />
        </mesh>
      </group>

      {/* 3. NGỌN HẢI ĐĂNG CỔ ĐIỂN BIỂU TƯỢNG */}
      <group
        position={[0.6, 0.06, 0.5]}
        data-testid="heritage-lighthouse"
        onClick={handleLighthouseInteraction}
        onPointerDown={handleLighthouseInteraction}
      >
        <mesh castShadow receiveShadow position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.32, 0.38, 0.08, 16]} />
          <meshStandardMaterial color="#57534E" roughness={0.8} />
        </mesh>
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
        <mesh position={[0, 0.65, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.02, 16]} />
          <meshStandardMaterial color="#1E293B" roughness={0.5} />
        </mesh>

        {/* Thấu kính đèn biển Fresnel pha lê phát sáng vàng ấm (#FEF08A bảo toàn test cũ) */}
        <mesh position={[0, 0.72, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.12, 12]} />
          <meshBasicMaterial color="#FEF08A" />
        </mesh>

        {/* Tia sáng quét 360 độ đặt đúng cao độ Fresnel y = 0.72 */}
        <group ref={beaconRef} position={[0, 0.72, 0]} visible={isNightOrSunset}>
          <mesh
            position={[0, 0, 0.4]}
            rotation={[Math.PI / 2, 0, 0]}
            visible={!isMobile && isNightOrSunset}
          >
            <coneGeometry args={[0.3, 0.8, 12, 1, true]} />
            <meshBasicMaterial
              color={phase === 'sunset' ? '#FDE047' : '#FFFFFF'}
              transparent
              opacity={beaconIntensity * 0.25}
            />
          </mesh>
          <pointLight
            color={phase === 'sunset' ? '#FDE047' : '#FFFFFF'}
            intensity={isMobile ? 0 : beaconIntensity}
            distance={4}
            decay={2}
            castShadow={false}
          />
        </group>

        <mesh position={[0, 0.83, 0]} castShadow>
          <coneGeometry args={[0.14, 0.14, 16]} />
          <meshStandardMaterial color="#065F46" roughness={0.3} metalness={0.6} />
        </mesh>
      </group>

      {/* Đàn hải âu đậu cọc bến thuyền */}
      <DioramaPerchingBirds isMobile={isMobile} />
    </group>
  );
}
