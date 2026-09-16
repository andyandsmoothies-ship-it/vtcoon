// [IMP-64] Extracted pure constants, types, and math functions from auction_3d_stage.tsx
// ZERO LOGIC CHANGE — code moved verbatim from auction_3d_stage.tsx L16–L187

export const CARD_DIMENSIONS = {
  width: 2.8,
  height: 3.9,
  thickness: 0.08,
  aspectRatio: 3.9 / 2.8,
} as const;

export const AUCTION_COLORS = {
  goldBezel: '#F59E0B',
  goldParticleA: '#FBBF24',
  goldParticleB: '#FEF08A',
  goldParticleC: '#D97706',
  cyanGlow: '#06B6D4',
  cyanLight: '#22D3EE',
  urgentGlow: '#F43F5E',
  urgentLight: '#FDA4AF',
  pedestalBase: '#0F172A',
  spotlightYellow: '#FDE047',
} as const;

export const THEATRICAL_LIGHTING_CONFIG = {
  spotLight: {
    position: [0, 10, 5] as const,
    target: [0, 2.5, 0] as const,
    angle: 0.35,
    penumbra: 0.8,
    intensity: 5.0,
    color: '#FDE047',
  },
  rimLight: {
    position: [0, 0.4, 0] as const,
    intensity: 2.0,
    color: '#06B6D4',
    distance: 8.0,
  },
  ambientDimming: {
    baseAmbient: 0.85,
    darkAmbient: 0.15,
    reductionRatio: 0.85,
  },
} as const;

export interface GoldParticle {
  id: number;
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

export function calculateTheatricalAmbientIntensity(
  currentIntensity: number,
  isAuctionActive: boolean,
  delta: number,
  baseAmbient: number = 0.85,
  targetDarkAmbient: number = 0.15
): number {
  const safeDt = Math.min(Math.max(delta, 0), 0.1);
  const target = isAuctionActive ? targetDarkAmbient : baseAmbient;
  const lerpFactor = 1 - Math.exp(-safeDt * 3.5);
  const next = currentIntensity + (target - currentIntensity) * lerpFactor;
  return Number.isFinite(next) ? Math.max(0, next) : target;
}

export function calculateParallaxTilt(
  pointerX: number,
  pointerY: number
): { rotX: number; rotY: number } {
  const safeX = Number.isFinite(pointerX) ? Math.max(-1, Math.min(1, pointerX)) : 0;
  const safeY = Number.isFinite(pointerY) ? Math.max(-1, Math.min(1, pointerY)) : 0;
  const rx = -safeY * 0.25;
  const ry = safeX * 0.35;
  return {
    rotX: rx === 0 ? 0 : rx,
    rotY: ry === 0 ? 0 : ry,
  };
}

export function calculateUrgentAuraColor(
  timeRemaining: number,
  elapsedTime: number
): { color: string; emissiveIntensity: number } {
  if (!Number.isFinite(timeRemaining) || timeRemaining > 5) {
    return { color: AUCTION_COLORS.cyanGlow, emissiveIntensity: 3.2 };
  }
  const safeTime = Math.max(0, timeRemaining);
  const safeElapsed = Number.isFinite(elapsedTime) ? elapsedTime : 0;
  const pulse = Math.sin(safeElapsed * (8.0 + (5 - safeTime) * 1.5));
  const intensity = 4.2 + Math.max(0, pulse) * 3.5;
  const color = pulse > 0 ? AUCTION_COLORS.urgentGlow : AUCTION_COLORS.urgentLight;
  return { color, emissiveIntensity: Number.isFinite(intensity) ? intensity : 4.2 };
}

export function calculateCardSpringRecoil(elapsedSinceStrike: number): number {
  if (!Number.isFinite(elapsedSinceStrike) || elapsedSinceStrike < 0 || elapsedSinceStrike > 0.6) {
    return 1.0;
  }
  const envelope = Math.exp(-elapsedSinceStrike * 8.0);
  const oscillation = Math.sin(elapsedSinceStrike * 28.0);
  return 1.0 + 0.08 * envelope * oscillation;
}

export function createInitialParticles(count: number = 72): GoldParticle[] {
  const safeCount = Number.isFinite(count) && count > 0 ? Math.min(Math.floor(count), 200) : 0;
  if (safeCount === 0) return [];
  const colors = [
    AUCTION_COLORS.goldParticleA,
    AUCTION_COLORS.goldParticleB,
    AUCTION_COLORS.goldParticleC,
  ];
  return Array.from({ length: safeCount }, (_, i) => {
    const angle = (i / safeCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const speed = 1.6 + Math.random() * 2.8;
    const maxLife = 1.0 + Math.random() * 0.8;
    return {
      id: i,
      x: (Math.random() - 0.5) * 0.5,
      y: 3.1 + (Math.random() - 0.5) * 0.5,
      z: (Math.random() - 0.5) * 0.5,
      vx: Math.cos(angle) * speed,
      vy: 2.2 + Math.random() * 2.5,
      vz: Math.sin(angle) * speed,
      size: 0.035 + Math.random() * 0.045,
      life: maxLife,
      maxLife,
      color: colors[i % colors.length] ?? AUCTION_COLORS.goldParticleA,
    };
  });
}

export function updateParticles(particles: GoldParticle[], delta: number): GoldParticle[] {
  const safeDt = Math.min(Math.max(delta, 0), 0.1);
  return particles
    .map((p) => {
      const nextLife = p.life - safeDt;
      return {
        ...p,
        x: p.x + p.vx * safeDt,
        y: p.y + p.vy * safeDt,
        z: p.z + p.vz * safeDt,
        vy: p.vy - 4.2 * safeDt,
        life: Math.max(0, nextLife),
      };
    })
    .filter((p) => p.life > 0);
}
