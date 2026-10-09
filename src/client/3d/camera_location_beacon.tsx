// [IMP-294] Camera Location Beacon — 3.5m Glowing Vertical Beacon for Decoupled Free-Roam
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, type Group, type MeshBasicMaterial } from 'three';
import { useGameStore } from '../store/game_store';
import { cellPosition } from './board_coords';

export function calculateBeaconPulseOpacity(elapsedSeconds: number, baseOpacity: number = 0.55): number {
  if (!Number.isFinite(elapsedSeconds)) return baseOpacity;
  const pulseFactor = 0.8 + 0.4 * (0.5 + 0.5 * Math.sin(elapsedSeconds * 4));
  return Math.min(1, Math.max(0, baseOpacity * pulseFactor));
}

export function resolveBeaconCoordinates(
  waypoints?: readonly number[],
  currentIndex: number = 0,
  targetCell: number = 0
): [number, number, number] {
  const currentCell = (waypoints && waypoints.length > 0)
    ? (waypoints[currentIndex] ?? waypoints[waypoints.length - 1] ?? targetCell)
    : targetCell;
  const pos = cellPosition(currentCell);
  return [pos[0], 0, pos[2]];
}

export function CameraLocationBeacon(): React.ReactElement {
  const hasUserCustomCamera = useGameStore((s) => s.hasUserCustomCamera);
  const activeAnimation = useGameStore((s) => s.activePawnAnimation);
  const playersInfo = useGameStore((s) => s.playersInfo);

  const groupRef = useRef<Group>(null);
  const currentXRef = useRef<number | null>(null);
  const currentZRef = useRef<number | null>(null);
  const cylinderMatRef = useRef<MeshBasicMaterial>(null);
  const diamondMatRef = useRef<MeshBasicMaterial>(null);
  const ringMatRef = useRef<MeshBasicMaterial>(null);

  const isVisible = Boolean(hasUserCustomCamera && activeAnimation?.isAnimating);

  useFrame((state, delta) => {
    if (!groupRef.current || !isVisible) {
      currentXRef.current = null;
      currentZRef.current = null;
      return;
    }
    const targetCoords = resolveBeaconCoordinates(
      activeAnimation?.waypoints,
      activeAnimation?.currentIndex,
      activeAnimation?.targetCell
    );
    if (currentXRef.current === null || currentZRef.current === null) {
      currentXRef.current = targetCoords[0];
      currentZRef.current = targetCoords[2];
      groupRef.current.position.set(targetCoords[0], 0, targetCoords[2]);
    } else {
      const dt = Math.min(delta, 0.1);
      const lerpFactor = 1 - Math.exp(-dt * 12);
      currentXRef.current += (targetCoords[0] - currentXRef.current) * lerpFactor;
      currentZRef.current += (targetCoords[2] - currentZRef.current) * lerpFactor;
      groupRef.current.position.set(currentXRef.current, 0, currentZRef.current);
    }

    const t = state.clock.getElapsedTime();
    if (cylinderMatRef.current) cylinderMatRef.current.opacity = calculateBeaconPulseOpacity(t, 0.55);
    if (diamondMatRef.current) diamondMatRef.current.opacity = calculateBeaconPulseOpacity(t, 0.75);
    if (ringMatRef.current) ringMatRef.current.opacity = calculateBeaconPulseOpacity(t, 0.45);
  });

  const pInfo = activeAnimation?.playerId ? playersInfo[activeAnimation.playerId] : undefined;
  const tokenColor = pInfo?.tokenColor ?? '#38BDF8';

  return (
    <group ref={groupRef} position={[0, 0, 0]} visible={isVisible}>
      <mesh position={[0, 1.75, 0]}>
        <cylinderGeometry args={[0.08, 0.28, 3.5, 16, 1, true]} />
        <meshBasicMaterial ref={cylinderMatRef} color={tokenColor} transparent={true} opacity={0.55} depthWrite={false} blending={AdditiveBlending} />
      </mesh>
      <mesh position={[0, 3.65, 0]}>
        <octahedronGeometry args={[0.22, 0]} />
        <meshBasicMaterial ref={diamondMatRef} color={tokenColor} transparent={true} opacity={0.75} depthWrite={false} blending={AdditiveBlending} />
      </mesh>
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.65, 24]} />
        <meshBasicMaterial ref={ringMatRef} color={tokenColor} transparent={true} opacity={0.45} depthWrite={false} blending={AdditiveBlending} />
      </mesh>
    </group>
  );
}
