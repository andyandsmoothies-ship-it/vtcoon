// [IMP-234] TileEventAura — Dynamic 3D Event Highlight & Countdown Crest
// Displays PBR glowing aura rim around affected cells and hovering billboard crest with remaining rounds
import React from 'react';
import { Billboard } from '@react-three/drei';
import { MarketCardId, ChanceCardId } from '../../domain/event_card_types.js';
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

interface EventVisualMeta {
  readonly icon: string;
  readonly label: string;
  readonly color: string;
  readonly isBuff: boolean;
}

const EVENT_VISUAL_MAP: Record<string, EventVisualMeta> = {
  [MarketCardId.MC_NIGHT_ECONOMY]: { icon: '🌙', label: 'x2 Thuê', color: '#F59E0B', isBuff: true },
  [MarketCardId.MC_LAND_FEVER]: { icon: '🔥', label: '+50%', color: '#F59E0B', isBuff: true },
  [MarketCardId.MC_PEAK_TOURISM]: { icon: '🏖️', label: '+50%', color: '#F59E0B', isBuff: true },
  [MarketCardId.MC_ALCOHOL_CHECK]: { icon: '🚨', label: '-50%', color: '#EF4444', isBuff: false },
  [MarketCardId.MC_FREEZE_TRADE]: { icon: '❄️', label: 'Đóng băng', color: '#06B6D4', isBuff: false },
  [MarketCardId.MC_PUBLIC_INVEST]: { icon: '🏗️', label: '+30%', color: '#F59E0B', isBuff: true },
  [MarketCardId.MC_URBAN_PLANNING]: { icon: '📐', label: 'Quy hoạch', color: '#F59E0B', isBuff: true },
  [MarketCardId.MC_UTILITY_DOUBLE]: { icon: '⚡', label: 'x2 Tiện ích', color: '#F59E0B', isBuff: true },
  [MarketCardId.MC_FIRE_INSPECTION]: { icon: '🧯', label: 'Thanh tra', color: '#EF4444', isBuff: false },
  [MarketCardId.MC_ANTI_SPECULATE]: { icon: '⚖️', label: 'Bình ổn', color: '#F59E0B', isBuff: true },
  [MarketCardId.MC_FUEL_SURGE]: { icon: '⛽', label: 'Phí cao', color: '#EF4444', isBuff: false },
  [ChanceCardId.CC_BUILD_HALT]: { icon: '🚧', label: 'Đình chỉ', color: '#EF4444', isBuff: false },
  BUILD_HALT: { icon: '🚧', label: 'Đình chỉ', color: '#EF4444', isBuff: false },
  MACRO_LAND_FEVER: { icon: '🌋', label: '+50%', color: '#F59E0B', isBuff: true },
  MACRO_LIQUIDITY_FREEZE: { icon: '🧊', label: 'Khóa', color: '#06B6D4', isBuff: false },
};

const DEFAULT_EVENT_META: EventVisualMeta = {
  icon: '🎴',
  label: 'Hiệu lực',
  color: '#F59E0B',
  isBuff: true,
};

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
  const meta = EVENT_VISUAL_MAP[cardType] ?? DEFAULT_EVENT_META;
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
    <Billboard
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
      <div
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-black text-white bg-slate-900/90 border border-amber-400 shadow-xs select-none ${
          status.isExpiringSoon ? 'animate-pulse' : ''
        }`}
      >
        <span>{labelText}</span>
      </div>
    </Billboard>
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
