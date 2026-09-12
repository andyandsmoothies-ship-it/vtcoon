// [UI-S05/MSS] Coronation3DStage — Grand Coronation 3D Stage, Champion Pedestal, Rotating Tycoon Trophy & Victory Fireworks
import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, Object3D, Color, type Group, type SpotLight, type Mesh, type InstancedMesh } from 'three';
import { useGameStore } from '../store/game_store';
import { AudioEngine } from '../audio/audio_engine';
import { SoundEffect } from '../audio/audio_types';

export const MAX_FIREWORK_PARTICLES = 90 as const;

export const CORONATION_CONFIG = {
  pedestalHeight: 1.2,
  trophyBaseY: 1.2,
  spotlightPos: [0, 11, 4] as const,
  spotlightTarget: [0, 2.2, 0] as const,
  spotlightColor: '#FDE047',
  spotlightIntensity: 6.0,
} as const;

export interface VictoryParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
}

const VICTORY_COLORS = ['#FBBF24', '#F43F5E', '#38BDF8', '#34D399', '#C084FC', '#FDE047'];

/**
 * Sinh chùm pháo hoa chiến thắng tỏa đều hình cầu
 */
export function spawnFireworkBurst(
  origin: readonly [number, number, number],
  count = 24
): VictoryParticle[] {
  const burst: VictoryParticle[] = [];
  const baseColor = VICTORY_COLORS[Math.floor(Math.random() * VICTORY_COLORS.length)] ?? '#FBBF24';

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    const speed = 1.2 + Math.random() * 1.8;

    burst.push({
      x: origin[0],
      y: origin[1],
      z: origin[2],
      vx: Math.sin(phi) * Math.cos(theta) * speed,
      vy: Math.sin(phi) * Math.sin(theta) * speed + 0.5,
      vz: Math.cos(phi) * speed,
      size: 0.06 + Math.random() * 0.05,
      life: 0,
      maxLife: 1.2 + Math.random() * 0.6,
      color: Math.random() > 0.3 ? baseColor : '#FFFFFF',
    });
  }
  return burst;
}

/**
 * Tính toán động học chuyển động xoay và bồng bềnh của Cúp Vô Địch
 */
export function calculateTrophyMotion(timeSec: number): {
  rotY: number;
  floatY: number;
  gemRotY: number;
} {
  const safeTime = Math.max(0, timeSec);
  return {
    rotY: safeTime * 0.85,
    floatY: Math.sin(safeTime * 2.0) * 0.08,
    gemRotY: -safeTime * 1.5,
  };
}

export function Coronation3DStage(): React.ReactElement | null {
  const activeModal = useGameStore((s) => s.activeModal);
  const isGameOver = activeModal === 'game_over';

  const groupRef = useRef<Group>(null);
  const trophyRef = useRef<Group>(null);
  const gemRef = useRef<Mesh>(null);
  const spotlightRef = useRef<SpotLight>(null);
  const instancedMeshRef = useRef<InstancedMesh>(null);
  const particlesRef = useRef<VictoryParticle[]>([]);
  const lastBurstTimeRef = useRef(0);
  const hasTriggeredChimeRef = useRef(false);

  const dummy = useMemo(() => new Object3D(), []);
  const tempColor = useMemo(() => new Color(), []);

  // Kích hoạt âm thanh chuông đăng quang và cấu hình spotlight target
  useEffect(() => {
    if (isGameOver && !hasTriggeredChimeRef.current) {
      hasTriggeredChimeRef.current = true;
      AudioEngine.playSfx(SoundEffect.VICTORY_CHIME);
      particlesRef.current = spawnFireworkBurst([0, 4.5, 0], 36);
    } else if (!isGameOver) {
      hasTriggeredChimeRef.current = false;
      particlesRef.current = [];
    }

    if (spotlightRef.current && groupRef.current) {
      const targetObj = spotlightRef.current.target;
      targetObj.position.set(...CORONATION_CONFIG.spotlightTarget);
      if (!targetObj.parent) {
        groupRef.current.add(targetObj);
      }
      targetObj.updateMatrixWorld();
    }

    return () => {
      if (spotlightRef.current?.target?.parent) {
        spotlightRef.current.target.parent.remove(spotlightRef.current.target);
      }
    };
  }, [isGameOver]);

  useFrame((state, delta) => {
    if (!isGameOver) return;
    const time = state.clock.elapsedTime;
    const motion = calculateTrophyMotion(time);

    if (trophyRef.current) {
      trophyRef.current.rotation.y = motion.rotY;
      trophyRef.current.position.y = CORONATION_CONFIG.trophyBaseY + motion.floatY;
    }

    if (gemRef.current) {
      gemRef.current.rotation.y = motion.gemRotY;
      gemRef.current.rotation.x = Math.sin(time * 1.5) * 0.2;
    }

    // Sinh pháo hoa định kỳ mỗi 0.9s quanh sân khấu
    const dt = Math.min(delta, 0.1);
    const now = Date.now();
    if (now - lastBurstTimeRef.current > 850 && particlesRef.current.length < MAX_FIREWORK_PARTICLES) {
      lastBurstTimeRef.current = now;
      const ox = (Math.random() - 0.5) * 6.0;
      const oy = 3.5 + Math.random() * 2.5;
      const oz = (Math.random() - 0.5) * 6.0;
      particlesRef.current.push(...spawnFireworkBurst([ox, oy, oz], 20));
    }

    // Cập nhật hạt pháo hoa
    const particles = particlesRef.current;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]!;
      p.life += dt;
      if (p.life >= p.maxLife) {
        particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      p.vy -= 1.6 * dt; // Trọng lực nhẹ kéo hạt rơi lấp lánh
    }

    // Cập nhật thực thể InstancedMesh hiển thị pháo hoa chiến thắng (1 Draw Call)
    const instMesh = instancedMeshRef.current;
    if (instMesh) {
      for (let i = 0; i < MAX_FIREWORK_PARTICLES; i++) {
        const p = particles[i];
        if (p) {
          dummy.position.set(p.x, p.y, p.z);
          const lifeRatio = p.life / p.maxLife;
          const scale = p.size * Math.max(0, 1 - lifeRatio);
          dummy.scale.set(scale, scale, scale);
          dummy.updateMatrix();
          instMesh.setMatrixAt(i, dummy.matrix);
          tempColor.set(p.color);
          instMesh.setColorAt(i, tempColor);
        } else {
          dummy.scale.set(0, 0, 0);
          dummy.updateMatrix();
          instMesh.setMatrixAt(i, dummy.matrix);
        }
      }
      instMesh.instanceMatrix.needsUpdate = true;
      if (instMesh.instanceColor) {
        instMesh.instanceColor.needsUpdate = true;
      }
    }
  });

  if (!isGameOver) {
    return null;
  }

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* 1. Chùm Spotlight điện ảnh vàng rực rọi bục đăng quang */}
      <spotLight
        ref={spotlightRef}
        position={CORONATION_CONFIG.spotlightPos}
        color={CORONATION_CONFIG.spotlightColor}
        intensity={CORONATION_CONFIG.spotlightIntensity}
        angle={0.42}
        penumbra={0.75}
        castShadow
      />
      <pointLight position={[0, 3.5, 0]} intensity={3.5} color="#FEF08A" distance={8} />

      {/* 2. Bục Quán Quân Đa Tầng Mạ Vàng (Tiered Grand Champion Pedestal) */}
      <group position={[0, 0, 0]}>
        {/* Tầng 1: Đế đá đen Obsidian viền vàng */}
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[2.8, 3.2, 0.4, 32]} />
          <meshStandardMaterial color="#0B0F19" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.41, 0]}>
          <torusGeometry args={[2.8, 0.05, 16, 32]} />
          <meshStandardMaterial color="#F59E0B" roughness={0.15} metalness={0.95} />
        </mesh>

        {/* Tầng 2: Thân bục vàng hoàng gia */}
        <mesh position={[0, 0.65, 0]}>
          <cylinderGeometry args={[2.1, 2.5, 0.5, 32]} />
          <meshStandardMaterial
            color="#D97706"
            roughness={0.2}
            metalness={0.92}
            emissive="#B45309"
            emissiveIntensity={0.2}
          />
        </mesh>
        <mesh position={[0, 0.91, 0]}>
          <torusGeometry args={[2.1, 0.04, 16, 32]} />
          <meshStandardMaterial color="#FEF08A" roughness={0.1} metalness={0.98} />
        </mesh>

        {/* Tầng 3: Mặt bục cẩm thạch ngọc lục bảo dập hoa văn */}
        <mesh position={[0, 1.05, 0]}>
          <cylinderGeometry args={[1.6, 1.9, 0.3, 32]} />
          <meshStandardMaterial color="#064E3B" roughness={0.25} metalness={0.6} />
        </mesh>

        {/* Vòng hào quang phát quang chân bục */}
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.2, 3.6, 32]} />
          <meshBasicMaterial color="#FBBF24" transparent opacity={0.65} blending={AdditiveBlending} />
        </mesh>
      </group>

      {/* 3. Cúp Vô Địch Đại Gia Địa Ốc 3D (Grand Tycoon Trophy) */}
      <group ref={trophyRef} position={[0, CORONATION_CONFIG.trophyBaseY, 0]}>
        {/* Đế cúp hình bát giác mạ vàng */}
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.55, 0.65, 0.3, 8]} />
          <meshStandardMaterial color="#F59E0B" roughness={0.15} metalness={0.95} />
        </mesh>

        {/* Cột trụ cúp thon gọn */}
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.2, 0.32, 0.35, 16]} />
          <meshStandardMaterial color="#FEF08A" roughness={0.1} metalness={0.98} />
        </mesh>

        {/* Thân cúp lớn uốn cong mạ vàng bóng bẩy */}
        <mesh position={[0, 1.0, 0]}>
          <cylinderGeometry args={[0.75, 0.35, 0.8, 24]} />
          <meshStandardMaterial
            color="#FBBF24"
            roughness={0.12}
            metalness={0.96}
            emissive="#D97706"
            emissiveIntensity={0.15}
          />
        </mesh>

        {/* Miệng cúp mạ vàng tròn bóng loáng */}
        <mesh position={[0, 1.41, 0]}>
          <torusGeometry args={[0.75, 0.05, 16, 24]} />
          <meshStandardMaterial color="#FEF08A" roughness={0.08} metalness={0.98} />
        </mesh>

        {/* Hai quai cầm cúp uốn lượn phong cách cúp quốc tế */}
        <mesh position={[-0.85, 0.95, 0]} rotation={[0, 0, Math.PI / 5]}>
          <torusGeometry args={[0.35, 0.045, 12, 20, Math.PI * 1.3]} />
          <meshStandardMaterial color="#F59E0B" roughness={0.15} metalness={0.95} />
        </mesh>
        <mesh position={[0.85, 0.95, 0]} rotation={[0, 0, -Math.PI / 5]}>
          <torusGeometry args={[0.35, 0.045, 12, 20, Math.PI * 1.3]} />
          <meshStandardMaterial color="#F59E0B" roughness={0.15} metalness={0.95} />
        </mesh>

        {/* Viên Kim Cương Đỉnh Cúp / Sapphire Landmark xoay hào quang */}
        <mesh ref={gemRef} position={[0, 1.75, 0]}>
          <octahedronGeometry args={[0.35, 0]} />
          <meshStandardMaterial
            color="#22D3EE"
            roughness={0.05}
            metalness={0.2}
            emissive="#06B6D4"
            emissiveIntensity={0.8}
            transparent
            opacity={0.92}
          />
        </mesh>
      </group>

      {/* 4. Hệ thống pháo hoa chiến thắng bằng InstancedMesh (1 Draw Call, 60 FPS cố định) */}
      <instancedMesh
        ref={instancedMeshRef}
        args={[undefined, undefined, MAX_FIREWORK_PARTICLES]}
      >
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial
          transparent
          opacity={0.85}
          blending={AdditiveBlending}
        />
      </instancedMesh>
    </group>
  );
}
