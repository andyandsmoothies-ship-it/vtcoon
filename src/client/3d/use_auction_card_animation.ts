// [IMP-64] Extracted AuctionAnimationRefs and useAuctionCardAnimation from auction_3d_stage.tsx
// ZERO LOGIC CHANGE — code moved verbatim from auction_3d_stage.tsx L197–L258
import React from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group, SpotLight, PointLight, MeshStandardMaterial } from 'three';
import {
  calculateUrgentAuraColor,
  calculateParallaxTilt,
  calculateCardSpringRecoil,
  updateParticles,
  THEATRICAL_LIGHTING_CONFIG,
  type GoldParticle,
} from './auction_particle_engine.js';

export interface AuctionAnimationRefs {
  readonly cardGroupRef: React.RefObject<Group | null>;
  readonly pedestalRef: React.RefObject<Group | null>;
  readonly spotLightRef: React.RefObject<SpotLight | null>;
  readonly rimLightRef: React.RefObject<PointLight | null>;
  readonly auraMaterialRef: React.RefObject<MeshStandardMaterial | null>;
  readonly strikeTimerRef: React.MutableRefObject<number>;
}

export function useAuctionCardAnimation(
  isAuctionOpen: boolean,
  refs: AuctionAnimationRefs,
  setParticles: React.Dispatch<React.SetStateAction<GoldParticle[]>>,
  timeRemaining: number
): void {
  useFrame((state, delta) => {
    if (!isAuctionOpen) return;

    if (refs.pedestalRef.current) {
      refs.pedestalRef.current.rotation.y += delta * 0.35;
    }

    const aura = calculateUrgentAuraColor(timeRemaining, state.clock.elapsedTime);
    if (refs.rimLightRef.current) {
      refs.rimLightRef.current.color.set(aura.color);
    }
    if (refs.auraMaterialRef.current) {
      refs.auraMaterialRef.current.color.set(aura.color);
      refs.auraMaterialRef.current.emissive.set(aura.color);
      refs.auraMaterialRef.current.emissiveIntensity = aura.emissiveIntensity;
    }
    if (refs.spotLightRef.current && timeRemaining <= 5) {
      const pulse = Math.sin(state.clock.elapsedTime * 8.0) * 0.6;
      refs.spotLightRef.current.intensity = THEATRICAL_LIGHTING_CONFIG.spotLight.intensity + pulse;
    }

    if (refs.cardGroupRef.current) {
      const tilt = calculateParallaxTilt(state.pointer.x, state.pointer.y);
      const targetY = 3.2 + Math.sin(state.clock.elapsedTime * 2.2) * 0.08;
      const targetRotX = -0.15 + tilt.rotX;
      const targetRotY = 0.12 + tilt.rotY;

      refs.strikeTimerRef.current += delta;
      const recoilScale = calculateCardSpringRecoil(refs.strikeTimerRef.current);
      refs.cardGroupRef.current.scale.set(recoilScale, recoilScale, recoilScale);

      refs.cardGroupRef.current.rotation.y += (targetRotY - refs.cardGroupRef.current.rotation.y) * 0.08;
      refs.cardGroupRef.current.rotation.x += (targetRotX - refs.cardGroupRef.current.rotation.x) * 0.08;
      refs.cardGroupRef.current.position.y += (targetY - refs.cardGroupRef.current.position.y) * 0.1;
    }

    setParticles((prev) => (prev.length > 0 ? updateParticles(prev, delta) : prev));
  });
}
