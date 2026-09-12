// [UI-S01/MSS] CoastalSeagulls — Flock of 5 animated seagulls circling the coastal bay
import React, { useRef } from 'react';
import type { Group } from 'three';
import { useSafeFrame } from './safe_frame';

interface SeagullFlightConfig {
  readonly radius: number;
  readonly baseHeight: number;
  readonly speed: number;
  readonly phaseOffset: number;
  readonly centerX: number;
  readonly centerZ: number;
}

const SEAGULL_CONFIGS: readonly SeagullFlightConfig[] = [
  { radius: 24, baseHeight: 16.5, speed: 0.38, phaseOffset: 0.0, centerX: 0, centerZ: 0 },
  { radius: 26, baseHeight: 17.2, speed: 0.38, phaseOffset: 0.35, centerX: 2, centerZ: -2 },
  { radius: 22, baseHeight: 15.8, speed: 0.38, phaseOffset: 0.7, centerX: -2, centerZ: 2 },
  { radius: 29, baseHeight: 18.2, speed: 0.32, phaseOffset: 2.2, centerX: 1, centerZ: 1 },
  { radius: 31, baseHeight: 17.6, speed: 0.32, phaseOffset: 2.55, centerX: -1, centerZ: -1 },
];

export function CoastalSeagulls(): React.ReactElement {
  const birdsRef = useRef<(Group | null)[]>([]);
  const leftWingsRef = useRef<(Group | null)[]>([]);
  const rightWingsRef = useRef<(Group | null)[]>([]);

  useSafeFrame((state) => {
    const t = state.clock.elapsedTime;

    SEAGULL_CONFIGS.forEach((cfg, idx) => {
      const bird = birdsRef.current[idx];
      const leftWing = leftWingsRef.current[idx];
      const rightWing = rightWingsRef.current[idx];

      if (bird) {
        const theta = t * cfg.speed + cfg.phaseOffset;
        const x = cfg.centerX + Math.cos(theta) * cfg.radius;
        const z = cfg.centerZ + Math.sin(theta) * cfg.radius;
        const y = cfg.baseHeight + Math.sin(t * 1.5 + cfg.phaseOffset) * 0.45;

        bird.position.set(x, y, z);
        // Tangent heading angle (beak points forward along velocity vector)
        bird.rotation.y = -theta;
        // Banking roll when circling
        bird.rotation.z = -0.15;
      }

      // Wing flapping animation (~7 Hz)
      const flap = Math.sin(t * 7.5 + cfg.phaseOffset * 4) * 0.38;
      if (leftWing) {
        leftWing.rotation.z = flap;
      }
      if (rightWing) {
        rightWing.rotation.z = -flap;
      }
    });
  });

  return (
    <group data-testid="coastal-seagulls">
      {SEAGULL_CONFIGS.map((_, idx) => (
        <group
          key={`seagull-${idx}`}
          ref={(el) => {
            birdsRef.current[idx] = el;
          }}
          scale={[0.55, 0.55, 0.55]}
        >
          {/* Thân chim thon gọn màu trắng sứ */}
          <mesh castShadow position={[0, 0, 0]}>
            <boxGeometry args={[0.14, 0.1, 0.44]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.4} />
          </mesh>

          {/* Mỏ chim vàng rực */}
          <mesh position={[0, -0.01, 0.26]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.04, 0.12, 4]} />
            <meshStandardMaterial color="#F59E0B" roughness={0.3} />
          </mesh>

          {/* Đuôi chim xòe nhẹ */}
          <mesh position={[0, 0.02, -0.26]}>
            <boxGeometry args={[0.1, 0.02, 0.14]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.4} />
          </mesh>

          {/* Cánh trái (vẫy đập) */}
          <group
            ref={(el) => {
              leftWingsRef.current[idx] = el;
            }}
            position={[-0.07, 0.03, 0]}
          >
            <mesh position={[-0.32, 0, 0]} rotation={[0, 0.1, 0]}>
              <boxGeometry args={[0.62, 0.018, 0.18]} />
              <meshStandardMaterial color="#F8FAFC" roughness={0.4} />
            </mesh>
            {/* Đầu cánh sẫm màu đặc trưng hải âu */}
            <mesh position={[-0.64, 0, 0]}>
              <boxGeometry args={[0.1, 0.016, 0.14]} />
              <meshStandardMaterial color="#334155" roughness={0.5} />
            </mesh>
          </group>

          {/* Cánh phải (vẫy đập) */}
          <group
            ref={(el) => {
              rightWingsRef.current[idx] = el;
            }}
            position={[0.07, 0.03, 0]}
          >
            <mesh position={[0.32, 0, 0]} rotation={[0, -0.1, 0]}>
              <boxGeometry args={[0.62, 0.018, 0.18]} />
              <meshStandardMaterial color="#F8FAFC" roughness={0.4} />
            </mesh>
            {/* Đầu cánh sẫm màu */}
            <mesh position={[0.64, 0, 0]}>
              <boxGeometry args={[0.1, 0.016, 0.14]} />
              <meshStandardMaterial color="#334155" roughness={0.5} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}
