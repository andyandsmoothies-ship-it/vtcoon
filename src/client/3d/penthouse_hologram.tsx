// [TC-P3.11/MSS][IMP-20] PenthouseHologram — Sa bàn Đảo Vịnh Mini & Hệ Thống Hologram Công Nghệ Cao
import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { AdditiveBlending, DoubleSide, type Group, BufferAttribute, BufferGeometry } from 'three';
import { generateHologramScreenTexture } from './penthouse_texture_generator';

export const HOLOGRAM_COLORS = {
  cyan: '#06B6D4',
  amber: '#F59E0B',
  emerald: '#10B981',
  sky: '#38BDF8',
  gold: '#FBBF24',
} as const;

export function calculateHologramBob(time: number): { y: number; rotY: number } {
  const safeTime = Number.isFinite(time) ? time : 0;
  return {
    y: 1.68 + Math.sin(safeTime * 1.8) * 0.04,
    rotY: safeTime * 0.22,
  };
}

export function calculateRadarRingRotations(time: number): {
  ring1: [number, number, number];
  ring2: [number, number, number];
  ring3: [number, number, number];
} {
  const safeTime = Number.isFinite(time) ? time : 0;
  return {
    ring1: [0, 0, safeTime * 0.65],
    ring2: [Math.sin(safeTime * 0.8) * 0.12, 0, safeTime === 0 ? 0 : -safeTime * 0.48],
    ring3: [0, Math.cos(safeTime * 0.6) * 0.15, safeTime * 0.32],
  };
}

export function generateLaserNanoParticles(count: number = 120): Float32Array {
  const safeCount = Number.isFinite(count) && count > 0 ? Math.min(Math.floor(count), 300) : 120;
  const positions = new Float32Array(safeCount * 3);
  for (let i = 0; i < safeCount; i++) {
    const angle = (i / safeCount) * Math.PI * 2 * 4.3;
    const radius = 0.12 + (((i * 19) % 100) / 100) * 0.58;
    const height = (((i * 37) % 100) / 100) * 0.75 - 0.1;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = height;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
  }
  return positions;
}

export const DIORAMA_SKYSCRAPERS = [
  { id: 'tower-1', x: 0.18, z: 0.12, w: 0.1, h: 0.38, d: 0.1, color: '#FBBF24', emissive: '#F59E0B' },
  { id: 'tower-2', x: 0.32, z: 0.18, w: 0.08, h: 0.28, d: 0.08, color: '#38BDF8', emissive: '#0284C7' },
  { id: 'tower-3', x: 0.15, z: 0.28, w: 0.09, h: 0.22, d: 0.09, color: '#FBBF24', emissive: '#D97706' },
  { id: 'tower-4', x: -0.25, z: 0.15, w: 0.11, h: 0.32, d: 0.11, color: '#38BDF8', emissive: '#0284C7' },
  { id: 'tower-5', x: -0.18, z: 0.3, w: 0.07, h: 0.18, d: 0.07, color: '#FCD34D', emissive: '#F59E0B' },
  { id: 'tower-6', x: -0.32, z: -0.22, w: 0.12, h: 0.42, d: 0.12, color: '#F59E0B', emissive: '#D97706' },
  { id: 'tower-7', x: 0.28, z: -0.25, w: 0.09, h: 0.25, d: 0.09, color: '#38BDF8', emissive: '#0284C7' },
] as const;

export function TownscaperMiniDiorama(): React.ReactElement {
  return (
    <group position={[0, 0, 0]}>
      {/* Đĩa nước vịnh biển phát quang ngọc bích */}
      <mesh position={[0, 0.026, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.38, 32]} />
        <meshStandardMaterial
          color="#065F46"
          emissive="#059669"
          emissiveIntensity={1.2}
          transparent
          opacity={0.82}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>

      {/* Cầu treo dây văng mini vắt qua đảo vịnh */}
      <group position={[0, 0.06, 0]} rotation={[0, Math.PI / 6, 0]}>
        <mesh position={[0, 0.03, 0]}>
          <boxGeometry args={[0.55, 0.015, 0.04]} />
          <meshStandardMaterial color="#FBBF24" emissive="#F59E0B" emissiveIntensity={1.5} />
        </mesh>
        {/* 2 trụ tháp cầu treo mini */}
        {[-0.14, 0.14].map((tx) => (
          <mesh key={`pylon-${tx}`} position={[tx, 0.09, 0]}>
            <cylinderGeometry args={[0.008, 0.014, 0.14, 8]} />
            <meshStandardMaterial color="#38BDF8" emissive="#0284C7" emissiveIntensity={1.8} />
          </mesh>
        ))}
      </group>

      {/* Cụm cao ốc chọc trời vi mô (Micro-Skyscrapers) Townscaper */}
      {DIORAMA_SKYSCRAPERS.map((b) => (
        <mesh key={b.id} position={[b.x, 0.02 + b.h / 2, b.z]}>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <meshStandardMaterial
            color={b.color}
            emissive={b.emissive}
            emissiveIntensity={1.6}
            transparent
            opacity={0.88}
            roughness={0.2}
            metalness={0.7}
          />
        </mesh>
      ))}

      {/* Tháp Landmark trung tâm vươn cao */}
      <mesh position={[0, 0.24, 0]}>
        <cylinderGeometry args={[0.025, 0.07, 0.44, 12]} />
        <meshStandardMaterial
          color={HOLOGRAM_COLORS.amber}
          emissive={HOLOGRAM_COLORS.amber}
          emissiveIntensity={2.0}
          transparent
          opacity={0.92}
        />
      </mesh>
    </group>
  );
}

export function CentralHologram(): React.ReactElement {
  const hologramRef = useRef<Group>(null);
  const ring1Ref = useRef<Group>(null);
  const ring2Ref = useRef<Group>(null);
  const ring3Ref = useRef<Group>(null);

  const hudScreenTexture = useMemo(() => generateHologramScreenTexture(), []);

  const particleGeometry = useMemo(() => {
    const geo = new BufferGeometry();
    const positions = generateLaserNanoParticles(120);
    geo.setAttribute('position', new BufferAttribute(positions, 3));
    return geo;
  }, []);

  useEffect(() => {
    return () => {
      if (typeof hudScreenTexture?.dispose === 'function') {
        hudScreenTexture.dispose();
      }
      particleGeometry.dispose();
    };
  }, [hudScreenTexture, particleGeometry]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (hologramRef.current) {
      const bob = calculateHologramBob(t);
      hologramRef.current.position.y = bob.y;
      hologramRef.current.rotation.y = bob.rotY;
    }
    const rings = calculateRadarRingRotations(t);
    if (ring1Ref.current) {
      ring1Ref.current.rotation.set(...rings.ring1);
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.set(...rings.ring2);
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.set(...rings.ring3);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Hệ thống 3 vòng quét radar đồng tâm đa chiều (Khắc phục P4 3D) */}
      <group position={[0, 1.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <group ref={ring1Ref}>
          <mesh>
            <ringGeometry args={[0.38, 0.42, 48]} />
            <meshBasicMaterial color={HOLOGRAM_COLORS.cyan} transparent opacity={0.65} side={DoubleSide} />
          </mesh>
        </group>
        <group ref={ring2Ref}>
          <mesh>
            <ringGeometry args={[0.54, 0.58, 48]} />
            <meshBasicMaterial color={HOLOGRAM_COLORS.sky} transparent opacity={0.5} side={DoubleSide} />
          </mesh>
        </group>
        <group ref={ring3Ref}>
          <mesh>
            <ringGeometry args={[0.72, 0.76, 48]} />
            <meshBasicMaterial color={HOLOGRAM_COLORS.amber} transparent opacity={0.4} side={DoubleSide} />
          </mesh>
        </group>
      </group>

      {/* 2. Chùm 120 hạt bụi nano laser bồng bềnh phát quang */}
      <group position={[0, 1.45, 0]}>
        <points geometry={particleGeometry}>
          <pointsMaterial
            size={0.024}
            color={HOLOGRAM_COLORS.cyan}
            transparent
            opacity={0.85}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </points>
      </group>

      {/* Ánh sáng điểm hologram dịu nhẹ */}
      <pointLight position={[0, 1.85, 0]} color={HOLOGRAM_COLORS.cyan} intensity={2.4} distance={5} />

      {/* 3. Sa bàn Đảo Vịnh Mini lơ lửng bồng bềnh & tự động xoay 360 độ (Khắc phục P5 3D) */}
      <group ref={hologramRef} position={[0, 1.68, 0]}>
        {/* Tấm nền sa bàn phát quang xanh ngọc Cyan */}
        <RoundedBox args={[1.35, 0.04, 1.35]} radius={0.03} smoothness={3}>
          <meshStandardMaterial
            color="#06B6D4"
            transparent
            opacity={0.8}
            emissive="#06B6D4"
            emissiveIntensity={1.8}
            roughness={0.15}
            metalness={0.85}
          />
        </RoundedBox>

        {/* Khung viền vành đai 40 ô cờ holographic phát quang */}
        <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.56, 0.64, 4]} />
          <meshStandardMaterial
            color="#38BDF8"
            transparent
            opacity={0.9}
            emissive="#06B6D4"
            emissiveIntensity={2.0}
          />
        </mesh>

        {/* 4 khối landmark góc sa bàn phát sáng */}
        {[-0.52, 0.52].map((x) =>
          [-0.52, 0.52].map((z) => (
            <mesh key={`corner-${x}-${z}`} position={[x, 0.05, z]}>
              <boxGeometry args={[0.12, 0.06, 0.12]} />
              <meshStandardMaterial
                color="#FBBF24"
                emissive="#F59E0B"
                emissiveIntensity={1.5}
                transparent
                opacity={0.85}
              />
            </mesh>
          ))
        )}

        {/* Cụm diorama sa bàn đô thị mini */}
        <TownscaperMiniDiorama />
      </group>

      {/* 4. Màn hình HUD holographic kính thấu quang trong suốt (Khắc phục P8 3D) */}
      <group position={[0, 2.38, -0.65]} rotation={[-0.2, 0, 0]}>
        <RoundedBox args={[1.5, 0.94, 0.015]} radius={0.03} smoothness={3}>
          <meshStandardMaterial
            map={hudScreenTexture}
            transparent
            opacity={0.88}
            roughness={0.08}
            metalness={0.2}
            emissive="#06B6D4"
            emissiveIntensity={0.35}
          />
        </RoundedBox>
        {/* Viền neon mảnh bao quanh HUD */}
        <mesh position={[0, 0, 0.01]}>
          <ringGeometry args={[0.74, 0.76, 4]} />
          <meshBasicMaterial color="#06B6D4" transparent opacity={0.6} side={DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}
