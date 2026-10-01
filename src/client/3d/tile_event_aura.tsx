// [IMP-234] TileEventAura — Dynamic 3D Event Highlight & Countdown Crest
// Displays PBR glowing aura rim around affected cells and hovering billboard crest with remaining rounds
import React from 'react';
import { Billboard, Html } from '@react-three/drei';
import { deriveModifierVisual } from '../domain_visual_bridge.js';
import { useGameStore } from '../store/game_store.js';
import type { ClientMarketModifier } from '../store/game_store_types.js';

export interface TileEventStatus {
  readonly isActive: boolean;
  readonly type?: string;
  readonly icon?: string;
  readonly label?: string;
  readonly color?: string;
  readonly isBuff?: boolean;
  readonly remainingRounds?: number;
  readonly isExpiringSoon?: boolean;
  readonly isSpotlighted?: boolean;
}

export function resolveTileEventStatus(
  cellIndex: number,
  activeModifiers?: ReadonlyArray<ClientMarketModifier>,
  spotlightedCells?: ReadonlyArray<number> | null
): TileEventStatus {
  if (!activeModifiers || activeModifiers.length === 0) {
    return { isActive: false };
  }

  const matchingModifier = activeModifiers.find(
    (m) =>
      Boolean(m) &&
      m.remainingRounds > 0 &&
      Array.isArray(m.affectedCells) &&
      m.affectedCells.includes(cellIndex)
  );

  if (!matchingModifier) {
    return { isActive: false };
  }

  const cardType = String(matchingModifier.type ?? '');
  const meta = deriveModifierVisual(matchingModifier);
  const isSpotlighted = Boolean(spotlightedCells && spotlightedCells.includes(cellIndex));

  return {
    isActive: true,
    type: cardType,
    icon: meta.icon,
    label: meta.label,
    color: meta.color,
    isBuff: meta.isBuff,
    remainingRounds: matchingModifier.remainingRounds,
    isExpiringSoon: matchingModifier.remainingRounds === 1,
    isSpotlighted,
  };
}

export interface TileEventAuraRimProps {
  readonly color?: string;
  readonly isSpotlighted?: boolean;
}

export function TileEventAuraRim({
  color = '#F59E0B',
  isSpotlighted = false,
}: TileEventAuraRimProps): React.ReactElement {
  return (
    <mesh
      name="TileEventAuraRim"
      data-testid="tile-event-aura-rim"
      position={[0, 0.042, 0]}
      castShadow={false}
      receiveShadow={true}
    >
      <boxGeometry args={[1.82, 0.08, 2.34]} />
      <meshStandardMaterial
        color={color}
        roughness={0.2}
        metalness={0.8}
        emissive={color}
        emissiveIntensity={isSpotlighted ? 1.6 : 0.65}
      />
    </mesh>
  );
}

/**
 * Safe wrapper cho Billboard tránh crash khi render trong môi trường SSR/Node test không có Canvas
 */
export function SafeBillboard({
  follow = true,
  children,
  ...props
}: React.ComponentProps<typeof Billboard>): React.ReactElement {
  if (typeof window === 'undefined') {
    return React.createElement('billboard', { follow: String(follow), ...props }, children);
  }
  return (
    <Billboard follow={follow} {...props}>
      {children}
    </Billboard>
  );
}

/**
 * Safe wrapper cho Drei Html tránh crash trong môi trường SSR/Node test không có Canvas
 */
export function SafeHtml({
  children,
  ...props
}: React.ComponentProps<typeof Html>): React.ReactElement {
  if (typeof window === 'undefined') {
    return React.createElement(React.Fragment, null, children);
  }
  return (
    <Html center pointerEvents="none" {...props}>
      {children}
    </Html>
  );
}

export interface TileEventFloatingBadgeProps {
  readonly status: TileEventStatus;
  readonly isMobile?: boolean;
}

export function TileEventFloatingBadge({
  status,
  isMobile = false,
}: TileEventFloatingBadgeProps): React.ReactElement | null {
  if (!status.isActive) {
    return null;
  }

  const scale: [number, number, number] = isMobile ? [1.18, 1.18, 1.18] : [1, 1, 1];
  const labelText = `${status.icon ?? ''} ${status.label ?? ''} • ${status.remainingRounds ?? 0}V`;

  return (
    <SafeBillboard
      follow={true}
      position={[0, 0.52, 0]}
      scale={scale}
      name="TileEventFloatingBadge"
      data-testid="tile-event-floating-badge"
    >
      <mesh castShadow={false} receiveShadow={false}>
        <planeGeometry args={[1.2, 0.36]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <SafeHtml>
        <div
          data-testid="tile-event-badge-pill"
          className={`whitespace-nowrap inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-black text-white bg-slate-900/90 border border-amber-400 shadow-xs max-w-[140px] truncate select-none pointer-events-none ${
            status.isExpiringSoon ? 'animate-pulse' : ''
          }`}
        >
          <span className="truncate">{labelText}</span>
        </div>
      </SafeHtml>
    </SafeBillboard>
  );
}

export interface TileEventAuraProps {
  readonly cellIndex: number;
  readonly isMobile?: boolean;
}

export function TileEventAura({
  cellIndex,
  isMobile = false,
}: TileEventAuraProps): React.ReactElement | null {
  const isSSR = typeof window === 'undefined';
  const storeModifiers = useGameStore((state) => state.activeModifiers);
  const storeSpotlight = useGameStore((state) => state.spotlightedCellIndices);

  const activeModifiers = isSSR ? useGameStore.getState().activeModifiers : storeModifiers;
  const spotlightedCells = isSSR ? useGameStore.getState().spotlightedCellIndices : storeSpotlight;

  const status = resolveTileEventStatus(cellIndex, activeModifiers, spotlightedCells);
  if (!status.isActive) {
    return null;
  }

  return (
    <group name="TileEventAura" data-testid="tile-event-aura">
      <TileEventAuraRim color={status.color} isSpotlighted={status.isSpotlighted} />
      <TileEventFloatingBadge status={status} isMobile={isMobile} />
    </group>
  );
}
