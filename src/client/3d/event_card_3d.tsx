// [UI-S04/MSS] EventCard3D — 3D Spatial Flipping Event Card with Anticipation, Physical Flip & Particle VFX
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, Object3D, Color, type Group, type Mesh, type InstancedMesh } from 'three';
import { useGameStore, type ModalPayloadMap } from '../store/game_store';
import { AudioEngine } from '../audio/audio_engine';
import { SoundEffect } from '../audio/audio_types';
import { vi } from '../../domain/i18n/vi';
import type { MarketCardId, ChanceCardId } from '../../domain/event_card_types';
import {
  generateEventCardBackTexture,
  generateEventCardFrontTexture,
} from './event_card_texture';

export const EVENT_CARD_DIMENSIONS = {
  width: 2.6,
  height: 3.62,
  thickness: 0.06,
} as const;

export const MAX_CARD_PARTICLES = 36 as const;

export type EventCardVfxType = 'golden_dust' | 'warning_sparks';

export interface CardParticle {
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

/**
 * Phân loại hiệu ứng hạt VFX dựa trên tính chất sự kiện (Thưởng/Phạt)
 */
export function resolveCardVfxType(
  cardType: 'chance' | 'market',
  effectDelta?: number
): EventCardVfxType {
  if (typeof effectDelta === 'number' && effectDelta < 0) {
    return 'warning_sparks';
  }
  return 'golden_dust';
}

/**
 * Tính toán trạng thái động học lật thẻ 3D theo thời gian (Anticipation ➔ Flip ➔ Reveal)
 */
export function calculateCardFlipTransform(elapsedSec: number): {
  phase: 'anticipation' | 'flip' | 'reveal';
  rotY: number;
  scale: number;
  heightY: number;
} {
  const safeTime = Math.max(0, elapsedSec);

  // Giai đoạn 1: Anticipation (0.0s - 0.45s) — Thẻ bay bổng lên cao, mặt lưng hướng về camera
  if (safeTime < 0.45) {
    const t = safeTime / 0.45;
    const easeOut = Math.sin((t * Math.PI) / 2);
    return {
      phase: 'anticipation',
      rotY: Math.PI,
      scale: 0.7 + easeOut * 0.35,
      heightY: 0.5 + easeOut * 2.7,
    };
  }

  // Giai đoạn 2: Flip (0.45s - 1.15s) — Lật 180 độ mượt mà từ PI về 0
  if (safeTime < 1.15) {
    const t = (safeTime - 0.45) / 0.7;
    // Cubic ease-in-out
    const easeFlip = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    return {
      phase: 'flip',
      rotY: Math.PI * (1 - easeFlip),
      scale: 1.05 - Math.sin(t * Math.PI) * 0.08,
      heightY: 3.2 + Math.sin(t * Math.PI) * 0.25,
    };
  }

  // Giai đoạn 3: Reveal (1.15s+) — Mặt chính lộ diện, lơ lửng bồng bềnh
  const floatTime = safeTime - 1.15;
  return {
    phase: 'reveal',
    rotY: 0,
    scale: 1.0,
    heightY: 3.2 + Math.sin(floatTime * 2.2) * 0.08,
  };
}

export function EventCard3D(): React.ReactElement | null {
  const activeModal = useGameStore((s) => s.activeModal);
  const modalPayload = useGameStore((s) => s.modalPayload);

  const isEventActive = activeModal === 'event' && modalPayload !== null;
  const eventPayload = isEventActive ? (modalPayload as ModalPayloadMap['event']) : null;

  const groupRef = useRef<Group>(null);
  const cardMeshRef = useRef<Group>(null);
  const instancedMeshRef = useRef<InstancedMesh>(null);
  const particlesRef = useRef<CardParticle[]>([]);
  const hasTriggeredFlipSoundRef = useRef(false);
  const startTimeRef = useRef(0);

  const dummy = useMemo(() => new Object3D(), []);
  const tempColor = useMemo(() => new Color(), []);

  const resolvedTitle = useMemo(() => {
    if (!eventPayload) return '';
    if (eventPayload.title) return eventPayload.title;
    if (eventPayload.cardType === 'market') {
      return vi.marketCards[eventPayload.cardId as MarketCardId] ?? eventPayload.cardId;
    }
    return vi.chanceCards[eventPayload.cardId as ChanceCardId] ?? eventPayload.cardId;
  }, [eventPayload]);

  const vfxType = useMemo(() => {
    if (!eventPayload) return 'golden_dust';
    return resolveCardVfxType(eventPayload.cardType, eventPayload.effectDelta);
  }, [eventPayload]);

  // Sinh textures 2 mặt thẻ bài
  const backTexture = useMemo(() => {
    if (!eventPayload) return null;
    return generateEventCardBackTexture(eventPayload.cardType);
  }, [eventPayload?.cardType]);

  const frontTexture = useMemo(() => {
    if (!eventPayload) return null;
    return generateEventCardFrontTexture({
      cardType: eventPayload.cardType,
      cardId: eventPayload.cardId,
      title: resolvedTitle,
      description: eventPayload.description,
      effectDelta: eventPayload.effectDelta,
    });
  }, [eventPayload, resolvedTitle]);

  // Giải phóng bộ nhớ GPU CanvasTexture tránh rò rỉ WebGL
  useEffect(() => {
    return () => {
      backTexture?.dispose();
      frontTexture?.dispose();
    };
  }, [backTexture, frontTexture]);

  // Reset animation timer khi modal mở
  useEffect(() => {
    if (isEventActive) {
      startTimeRef.current = Date.now();
      hasTriggeredFlipSoundRef.current = false;
      particlesRef.current = [];
    }
  }, [isEventActive]);

  useFrame((state, delta) => {
    if (!groupRef.current || !isEventActive) return;

    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const transform = calculateCardFlipTransform(elapsed);

    // Kích hoạt âm thanh lật bài đúng nhịp khởi động lật (0.45s)
    if (elapsed >= 0.45 && !hasTriggeredFlipSoundRef.current) {
      hasTriggeredFlipSoundRef.current = true;
      AudioEngine.playSfx(SoundEffect.CARD_FLIP);
    }

    // Tọa độ và xoay
    groupRef.current.position.y = transform.heightY;
    groupRef.current.scale.setScalar(transform.scale);

    // Góc nghiêng Parallax nhẹ theo con trỏ chuột khi ở pha Reveal
    const parallaxX = transform.phase === 'reveal' ? state.pointer.x * 0.18 : 0;
    const parallaxY = transform.phase === 'reveal' ? state.pointer.y * -0.12 : 0;

    groupRef.current.rotation.y = transform.rotY + parallaxX;
    groupRef.current.rotation.x = 0.12 + parallaxY;

    // Cập nhật hiệu ứng hạt VFX
    const dt = Math.min(delta, 0.1);
    const particles = particlesRef.current;

    // Sinh hạt mới (tối đa 36 hạt duy trì ngân sách Draw Call & 60 FPS)
    if (particles.length < MAX_CARD_PARTICLES && Math.random() < 0.6) {
      const isDust = vfxType === 'golden_dust';
      particles.push({
        x: (Math.random() - 0.5) * EVENT_CARD_DIMENSIONS.width * 1.1,
        y: (Math.random() - 0.5) * EVENT_CARD_DIMENSIONS.height * 0.8,
        z: (Math.random() - 0.5) * 0.4,
        vx: (Math.random() - 0.5) * 0.4,
        vy: isDust ? 0.3 + Math.random() * 0.6 : (Math.random() - 0.5) * 1.2,
        vz: (Math.random() - 0.5) * 0.4,
        size: isDust ? 0.05 + Math.random() * 0.04 : 0.06 + Math.random() * 0.05,
        life: 0,
        maxLife: isDust ? 1.2 + Math.random() * 0.6 : 0.6 + Math.random() * 0.4,
        color: isDust
          ? Math.random() > 0.4 ? '#FDE047' : '#F59E0B'
          : Math.random() > 0.4 ? '#F43F5E' : '#A855F7',
      });
    }

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
    }

    // Cập nhật thực thể InstancedMesh hiển thị hạt thực tế (1 Draw Call)
    const instMesh = instancedMeshRef.current;
    if (instMesh) {
      for (let i = 0; i < MAX_CARD_PARTICLES; i++) {
        const p = particles[i];
        if (p) {
          dummy.position.set(p.x, p.y, p.z);
          const lifeRatio = p.life / p.maxLife;
          const scale = p.size * Math.sin(lifeRatio * Math.PI);
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

  if (!isEventActive || !eventPayload) {
    return null;
  }

  const { width: w, height: h, thickness: d } = EVENT_CARD_DIMENSIONS;

  return (
    <group ref={groupRef} position={[0, 3.2, 0]}>
      {/* Đèn rọi cục bộ tăng cường ánh sáng điện ảnh cho thẻ */}
      <pointLight
        position={[0, 1.5, 2.5]}
        intensity={vfxType === 'golden_dust' ? 3.5 : 4.2}
        color={vfxType === 'golden_dust' ? '#FEF08A' : '#FDA4AF'}
        distance={7}
      />
      <pointLight
        position={[0, -1.0, -2.5]}
        intensity={2.0}
        color="#FDE047"
        distance={5}
      />

      {/* Thân thẻ bài 3D hai mặt có xúc giác click trực tiếp */}
      <group
        ref={cardMeshRef}
        onClick={(e) => {
          e.stopPropagation();
          useGameStore.getState().closeModal();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
        }}
      >
        {/* Viền mạ vàng Champagne quanh thẻ bài */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[w + 0.04, h + 0.04, d]} />
          <meshStandardMaterial
            color="#F59E0B"
            metalness={0.92}
            roughness={0.2}
            emissive="#D97706"
            emissiveIntensity={0.15}
          />
        </mesh>

        {/* Mặt trước (Front Face, +Z) */}
        <mesh position={[0, 0, d / 2 + 0.002]}>
          <planeGeometry args={[w, h]} />
          {frontTexture ? (
            <meshStandardMaterial
              map={frontTexture}
              metalness={0.15}
              roughness={0.4}
              transparent
            />
          ) : (
            <meshStandardMaterial color="#0F172A" />
          )}
        </mesh>

        {/* Mặt sau (Back Face, -Z) xoay 180 độ quanh Y */}
        <mesh position={[0, 0, -d / 2 - 0.002]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[w, h]} />
          {backTexture ? (
            <meshStandardMaterial
              map={backTexture}
              metalness={0.3}
              roughness={0.35}
              transparent
            />
          ) : (
            <meshStandardMaterial color="#022C22" />
          )}
        </mesh>
      </group>

      {/* Hiệu ứng hạt VFX bồng bềnh bằng InstancedMesh (1 Draw Call, 60 FPS cố định) */}
      <instancedMesh
        ref={instancedMeshRef}
        args={[undefined, undefined, MAX_CARD_PARTICLES]}
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
