// [UI-S05/MSS] GoldenGlowVFX — Micro-VFX for Level 3 (C3 Resort / Hotel) Properties
// Hào quang Golden Glow & nảy hạt nhẹ ở 60 FPS
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh, Group } from 'three';

export interface GoldenGlowOptions {
  readonly freq?: number;
  readonly amplitude?: number;
  readonly baseScale?: number;
}

export interface SparkOptions {
  readonly radius?: number;
  readonly speed?: number;
  readonly baseHeight?: number;
  readonly hopHeight?: number;
  readonly hopFreq?: number;
}

function useSafeFrame(callback: (state: Parameters<Parameters<typeof useFrame>[0]>[0], delta: number) => void): void {
  try {
    useFrame(callback);
  } catch {
    // An toàn khi chạy ngoài Canvas (SSR hoặc test renderToStaticMarkup)
  }
}

/**
 * Tính toán tỷ lệ co giãn hào quang nhấp nhô sin(omega*t) thuần túy
 */
export function calculateGoldenGlowScale(
  time: number,
  options: GoldenGlowOptions = {},
): number {
  const baseScale = Number.isFinite(options.baseScale) ? options.baseScale! : 1.0;
  if (!Number.isFinite(time)) return baseScale;
  const freq = Number.isFinite(options.freq) ? options.freq! : 3.0;
  const amplitude = Number.isFinite(options.amplitude) ? options.amplitude! : 0.08;
  return baseScale + Math.sin(time * freq) * amplitude;
}

/**
 * Tính toán độ mờ hào quang sin(omega*t) thuần túy
 */
export function calculateGoldenGlowOpacity(
  time: number,
  baseOpacity = 0.6,
  amplitude = 0.25,
): number {
  if (!Number.isFinite(time)) return baseOpacity;
  return Math.max(0.1, Math.min(1.0, baseOpacity + Math.sin(time * 3.0) * amplitude));
}

/**
 * Tính toán tọa độ hạt nảy nhẹ dạng quỹ đạo xoay và nhấp nhô
 */
export function calculateSparkPosition(
  time: number,
  sparkIndex: number,
  totalSparks = 5,
  options: SparkOptions = {},
): [number, number, number] {
  const radius = Number.isFinite(options.radius) ? options.radius! : 0.22;
  const speed = Number.isFinite(options.speed) ? options.speed! : 2.5;
  const baseHeight = Number.isFinite(options.baseHeight) ? options.baseHeight! : 0.1;
  const hopHeight = Number.isFinite(options.hopHeight) ? options.hopHeight! : 0.14;
  const hopFreq = Number.isFinite(options.hopFreq) ? options.hopFreq! : 4.0;

  if (!Number.isFinite(time)) {
    const angle = (2 * Math.PI * sparkIndex) / Math.max(1, totalSparks);
    return [radius * Math.cos(angle), baseHeight, radius * Math.sin(angle)];
  }

  const angle = (2 * Math.PI * sparkIndex) / Math.max(1, totalSparks) + time * speed;
  const x = radius * Math.cos(angle);
  const z = radius * Math.sin(angle);
  const y = baseHeight + Math.abs(Math.sin(time * hopFreq + sparkIndex * 1.2)) * hopHeight;

  return [x, y, z];
}

export function GoldenGlowRing(): React.ReactElement {
  const meshRef = useRef<Mesh>(null);

  useSafeFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      const s = calculateGoldenGlowScale(t, { baseScale: 1.0, freq: 3.2, amplitude: 0.1 });
      meshRef.current.scale.set(s, s, s);
      const mat = meshRef.current.material;
      if (mat && 'opacity' in mat) {
        (mat as { opacity: number }).opacity = calculateGoldenGlowOpacity(t, 0.7, 0.2);
      }
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.16, 0.28, 24]} />
      <meshBasicMaterial
        color="#F59E0B"
        transparent
        opacity={0.7}
        depthWrite={false}
      />
    </mesh>
  );
}

export function GoldenSparks({ count = 5 }: { readonly count?: number }): React.ReactElement {
  const groupRef = useRef<Group>(null);
  const sparkRefs = useRef<(Mesh | null)[]>([]);

  useSafeFrame((state) => {
    const t = state.clock.getElapsedTime();
    for (let i = 0; i < count; i++) {
      const spark = sparkRefs.current[i];
      if (spark) {
        const [x, y, z] = calculateSparkPosition(t, i, count);
        spark.position.set(x, y, z);
        const rot = t * 3 + i;
        spark.rotation.set(rot, rot, rot);
      }
    }
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: count }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            sparkRefs.current[i] = el;
          }}
        >
          <octahedronGeometry args={[0.032, 0]} />
          <meshBasicMaterial color="#FEF08A" />
        </mesh>
      ))}
    </group>
  );
}

export interface GoldenGlowVFXProps {
  readonly position?: [number, number, number];
}

export function GoldenGlowVFX({ position = [0, 0, 0] }: GoldenGlowVFXProps): React.ReactElement {
  return (
    <group position={position}>
      {/* Hạt bụi vàng lấp lánh bay xoay quanh đỉnh tháp */}
      <GoldenSparks count={5} />
    </group>
  );
}
