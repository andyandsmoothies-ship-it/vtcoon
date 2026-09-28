// [UI-S02/MSS][IMP-221] DioramaPerchingBirds — Dynamic perching seagulls with takeoff & landing FSM
import React, { useRef } from 'react';
import type { Group } from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import { useSafeFrame } from '../safe_frame';

export type BirdFlightState = 'PERCHED' | 'TAKE_OFF' | 'CIRCLING' | 'LANDING';

export interface PerchSpot {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly baseRotY: number;
}

export interface BirdVector3Rot {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly rotY: number;
}

export const PERCH_SPOTS: readonly PerchSpot[] = [
  { x: -1.05, y: 0.055, z: 0.4, baseRotY: Math.PI / 2 },
  { x: -1.05, y: 0.055, z: -0.6, baseRotY: Math.PI / 2 },
  { x: 0.35, y: 0.12, z: 0.7, baseRotY: -Math.PI / 4 },
];

export const BIRD_FSM_DURATIONS = {
  TAKE_OFF: 1.5,
  CIRCLING: 5.0,
  LANDING: 1.8,
  AUTO_TAKEOFF_INTERVAL: 18.0,
} as const;

/**
 * Calculates exact exit coordinates of circling path at t = CIRCLING duration
 * to ensure 100% continuous Hermite landing without mid-air teleport.
 */
export function calculateCirclingExitPosition(spot: PerchSpot, birdIndex: number): BirdVector3Rot {
  const theta = BIRD_FSM_DURATIONS.CIRCLING * 1.5 + birdIndex * 0.8;
  const r = 1.2 + birdIndex * 0.3;
  return {
    x: spot.x + Math.cos(theta) * r,
    y: spot.y + 0.8 + Math.sin(BIRD_FSM_DURATIONS.CIRCLING * 2.0) * 0.15,
    z: spot.z + Math.sin(theta) * r,
    rotY: -theta,
  };
}

/**
 * Pure FSM transition helper for 100% testability outside R3F Canvas
 */
export function advanceBirdFlightFSM(
  currentState: BirdFlightState,
  elapsedStateTime: number
): { nextState: BirdFlightState; resetTime: boolean } {
  if (currentState === 'TAKE_OFF' && elapsedStateTime >= BIRD_FSM_DURATIONS.TAKE_OFF) {
    return { nextState: 'CIRCLING', resetTime: true };
  }
  if (currentState === 'CIRCLING' && elapsedStateTime >= BIRD_FSM_DURATIONS.CIRCLING) {
    return { nextState: 'LANDING', resetTime: true };
  }
  if (currentState === 'LANDING' && elapsedStateTime >= BIRD_FSM_DURATIONS.LANDING) {
    return { nextState: 'PERCHED', resetTime: true };
  }
  return { nextState: currentState, resetTime: false };
}

/**
 * Pure trigger function with anti-midair-teleport guard
 */
export function triggerBirdScare(currentState: BirdFlightState): BirdFlightState {
  if (currentState !== 'PERCHED') {
    return currentState; // Guard: No teleport if already in flight
  }
  return 'TAKE_OFF';
}

export function calculateBirdFlightPosition(
  state: BirdFlightState,
  elapsedStateTime: number,
  spot: PerchSpot,
  birdIndex: number,
  landingFrom?: BirdVector3Rot
): { x: number; y: number; z: number; rotY: number; wingFlap: number } {
  if (!Number.isFinite(elapsedStateTime)) {
    return { x: spot.x, y: spot.y, z: spot.z, rotY: spot.baseRotY, wingFlap: 0 };
  }

  if (state === 'PERCHED') {
    const breathe = Math.sin(elapsedStateTime * 3.0 + birdIndex) * 0.003;
    const headTurn = Math.sin(elapsedStateTime * 0.8 + birdIndex * 2) * 0.15;
    return {
      x: spot.x,
      y: spot.y + breathe,
      z: spot.z,
      rotY: spot.baseRotY + headTurn,
      wingFlap: 0,
    };
  }

  if (state === 'TAKE_OFF') {
    const progress = Math.min(1.0, elapsedStateTime / BIRD_FSM_DURATIONS.TAKE_OFF);
    const ease = progress * progress;
    const flap = Math.sin(elapsedStateTime * 14.0) * 0.45;
    return {
      x: spot.x + Math.sin(spot.baseRotY) * ease * 0.8,
      y: spot.y + ease * 0.8,
      z: spot.z + Math.cos(spot.baseRotY) * ease * 0.8,
      rotY: spot.baseRotY,
      wingFlap: flap,
    };
  }

  if (state === 'CIRCLING') {
    const theta = elapsedStateTime * 1.5 + birdIndex * 0.8;
    const r = 1.2 + birdIndex * 0.3;
    const flap = Math.sin(elapsedStateTime * 8.0) * 0.35;
    return {
      x: spot.x + Math.cos(theta) * r,
      y: spot.y + 0.8 + Math.sin(elapsedStateTime * 2.0) * 0.15,
      z: spot.z + Math.sin(theta) * r,
      rotY: -theta,
      wingFlap: flap,
    };
  }

  // LANDING: Continuous interpolation from actual exit location to perch spot
  const progress = Math.min(1.0, elapsedStateTime / BIRD_FSM_DURATIONS.LANDING);
  const smooth = 1.0 - Math.cos(progress * Math.PI * 0.5); // 0 at start, 1 at destination
  const start = landingFrom ?? calculateCirclingExitPosition(spot, birdIndex);

  const currentX = start.x + (spot.x - start.x) * smooth;
  const currentY = start.y + (spot.y - start.y) * smooth;
  const currentZ = start.z + (spot.z - start.z) * smooth;
  const currentRotY = start.rotY + (spot.baseRotY - start.rotY) * smooth;
  const flap = Math.sin(elapsedStateTime * 6.0) * (1.0 - progress) * 0.3;

  return {
    x: currentX,
    y: currentY,
    z: currentZ,
    rotY: currentRotY,
    wingFlap: flap,
  };
}

export function DioramaPerchingBirds(): React.ReactElement {
  const flightStateRef = useRef<BirdFlightState>('PERCHED');
  const stateTimeRef = useRef<number>(0);
  const idleTimeRef = useRef<number>(0);
  const landingFromRef = useRef<(BirdVector3Rot | null)[]>([null, null, null]);
  const birdsRef = useRef<(Group | null)[]>([]);
  const wingsRef = useRef<(Group | null)[]>([]);

  const handlePointerDown = (e: ThreeEvent<PointerEvent> | React.PointerEvent | { stopPropagation: () => void }) => {
    e.stopPropagation();
    if (flightStateRef.current === 'PERCHED') {
      flightStateRef.current = triggerBirdScare(flightStateRef.current);
      stateTimeRef.current = 0;
      idleTimeRef.current = 0;
      // Note: Không gọi còi hải đăng tại đây
    }
  };

  useSafeFrame((_, delta) => {
    const clampedDelta = Math.min(delta, 0.1);
    stateTimeRef.current += clampedDelta;

    const transition = advanceBirdFlightFSM(flightStateRef.current, stateTimeRef.current);
    if (transition.resetTime) {
      if (transition.nextState === 'LANDING') {
        // Ghi lại vị trí kết thúc lượn vòng của từng chim để hạ cánh liên tục
        PERCH_SPOTS.forEach((spot, idx) => {
          const bird = birdsRef.current[idx];
          if (bird) {
            landingFromRef.current[idx] = {
              x: bird.position.x,
              y: bird.position.y,
              z: bird.position.z,
              rotY: bird.rotation.y,
            };
          } else {
            landingFromRef.current[idx] = calculateCirclingExitPosition(spot, idx);
          }
        });
      }
      flightStateRef.current = transition.nextState;
      stateTimeRef.current = 0;
    }

    if (flightStateRef.current === 'PERCHED') {
      idleTimeRef.current += clampedDelta;
      if (idleTimeRef.current >= BIRD_FSM_DURATIONS.AUTO_TAKEOFF_INTERVAL) {
        flightStateRef.current = triggerBirdScare(flightStateRef.current);
        stateTimeRef.current = 0;
        idleTimeRef.current = 0;
      }
    }

    PERCH_SPOTS.forEach((spot, idx) => {
      const bird = birdsRef.current[idx];
      const wing = wingsRef.current[idx];
      if (!bird) return;

      const pos = calculateBirdFlightPosition(
        flightStateRef.current,
        stateTimeRef.current,
        spot,
        idx,
        landingFromRef.current[idx] ?? undefined
      );
      bird.position.set(pos.x, pos.y, pos.z);
      bird.rotation.y = pos.rotY;

      if (wing) {
        wing.rotation.z = pos.wingFlap;
      }
    });
  });

  return (
    <group data-testid="diorama-perching-birds" onPointerDown={handlePointerDown}>
      {PERCH_SPOTS.map((_, idx) => (
        <group
          key={`perching-bird-${idx}`}
          ref={(el) => {
            birdsRef.current[idx] = el;
          }}
          scale={[0.22, 0.22, 0.22]}
        >
          {/* Thân chim bồ câu / hải âu mini (Zero castShadow theo [TC-221.15]) */}
          <mesh position={[0, 0.08, 0]}>
            <boxGeometry args={[0.12, 0.1, 0.28]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.5} />
          </mesh>
          {/* Mỏ chim vàng cam */}
          <mesh position={[0, 0.08, 0.16]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.03, 0.08, 4]} />
            <meshStandardMaterial color="#F59E0B" roughness={0.3} />
          </mesh>
          {/* Cánh chim */}
          <group
            ref={(el) => {
              wingsRef.current[idx] = el;
            }}
            position={[0, 0.11, 0]}
          >
            <mesh position={[-0.14, 0, 0]}>
              <boxGeometry args={[0.22, 0.015, 0.14]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.4} />
            </mesh>
            <mesh position={[0.14, 0, 0]}>
              <boxGeometry args={[0.22, 0.015, 0.14]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.4} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}
