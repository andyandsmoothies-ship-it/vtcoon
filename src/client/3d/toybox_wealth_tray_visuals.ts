// [UI-S01/MSS][IMP-402] ToyboxWealthTrayVisuals — Poka-Yoke Sanctuary Wealth Trays & 5-Stage Diorama Chain-Reaction Math
import { PerspectiveCamera, Vector3 } from 'three';
import { calculatePlayerNetWorth } from '../ui/ui_helpers';
import type { PlayerHudInfo } from '../store/game_store_types';
import { CAMERA_CONFIG } from './camera_state_machine';
import { type CornerSanctuaryDescriptor, getCornerSanctuaryDescriptors } from './coastal_sanctuary_visuals';

export type WealthTrayTier = 0 | 1 | 2 | 3 | 4;

export const WEALTH_TRAY_MODEL_URLS: Record<1 | 2 | 3 | 4, string> = {
  1: '/models/landmarks/wealth_tray_tier1.glb',
  2: '/models/landmarks/wealth_tray_tier2.glb',
  3: '/models/landmarks/wealth_tray_tier3.glb',
  4: '/models/landmarks/wealth_tray_tier4.glb',
} as const;

export const WEALTH_TRAY_BASE_DIMENSIONS = { width: 0.36, height: 0.44, depth: 0.48 } as const;
export const WEALTH_TRAY_TIER_THRESHOLDS = { tier2: 10000, tier3: 12000, tier4: 30000 } as const;
export const CHAIN_REACTION_TTL_MS = 2800;
export const CHAIN_REACTION_STAGE_DELAY_MS = 180;

export interface SanctuaryWealthTrayDescriptor {
  readonly id: string;
  readonly sanctuaryId: string;
  readonly playerId: string;
  readonly playerSlot: number;
  readonly tier: WealthTrayTier;
  readonly netWorth: number;
  readonly propertyCount: number;
  readonly modelUrl: string | null;
  readonly worldPosition: readonly [number, number, number];
  readonly trayScale: readonly [number, number, number];
  readonly rotationY: number;
  readonly bottomY: number;
  readonly topY: number;
  readonly embedDepth: number;
  readonly aabbMinX: number;
  readonly aabbMaxX: number;
  readonly aabbMinZ: number;
  readonly aabbMaxZ: number;
  readonly maxRadialExtent: number;
  readonly ndcX: number;
  readonly ndcY: number;
}

export interface ChainReactionStageSpec {
  readonly stageIndex: number;
  readonly id: 'saigon-river-cruiser' | 'metro-line-station' | 'bitexco-tower' | 'bason-bridge' | 'notre-dame-cathedral';
  readonly delayMs: number;
  readonly worldPosition: readonly [number, number, number];
  readonly baseRadius: number;
  readonly accentColor: string;
}

export interface ChainReactionStageState {
  stageIndex: number;
  id: ChainReactionStageSpec['id'];
  isTriggered: boolean;
  intensity: number;
  ringScale: number;
  yOffset: number;
}

export interface DioramaChainReactionSnapshot {
  isActive: boolean;
  isExpired: boolean;
  elapsedMs: number;
  stages: ChainReactionStageState[];
}

export const CHAIN_REACTION_STAGE_SPECS: ReadonlyArray<ChainReactionStageSpec> = [
  { stageIndex: 0, id: 'saigon-river-cruiser', delayMs: 0, worldPosition: [0, 0.04, 2.2], baseRadius: 0.48, accentColor: '#06B6D4' },
  { stageIndex: 1, id: 'metro-line-station', delayMs: 180, worldPosition: [0, 0.45, -6.9], baseRadius: 0.44, accentColor: '#38BDF8' },
  { stageIndex: 2, id: 'bitexco-tower', delayMs: 360, worldPosition: [-4.5, 0.20, -4.4], baseRadius: 0.62, accentColor: '#F59E0B' },
  { stageIndex: 3, id: 'bason-bridge', delayMs: 540, worldPosition: [-0.8, 0.18, -3.8], baseRadius: 0.52, accentColor: '#22D3EE' },
  { stageIndex: 4, id: 'notre-dame-cathedral', delayMs: 720, worldPosition: [4.4, 0.20, -3.32], baseRadius: 0.56, accentColor: '#FDE047' },
];

const OVERVIEW_ASPECT = 1.6;
const APRON_OFFSET_X = 0.88;
const APRON_OFFSET_Z = 0.23;
const TRAY_BOTTOM_Y = -0.24;
const TRAY_ROTATION_Y = -0.15;
const TRAY_SCALE: readonly [number, number, number] = [1.10, 1.35, 1.10];
let cachedTrayCamera: PerspectiveCamera | null = null;

function projectTrayToOverviewNdc(pos: readonly [number, number, number]): readonly [number, number] {
  if (!cachedTrayCamera) {
    cachedTrayCamera = new PerspectiveCamera(CAMERA_CONFIG.overview.fov, OVERVIEW_ASPECT, 0.1, 200);
    cachedTrayCamera.position.set(
      CAMERA_CONFIG.overview.position[0],
      CAMERA_CONFIG.overview.position[1],
      CAMERA_CONFIG.overview.position[2]
    );
    cachedTrayCamera.lookAt(
      CAMERA_CONFIG.overview.target[0],
      CAMERA_CONFIG.overview.target[1],
      CAMERA_CONFIG.overview.target[2]
    );
    cachedTrayCamera.updateMatrixWorld(true);
    cachedTrayCamera.updateProjectionMatrix();
  }
  const projected = new Vector3(pos[0], pos[1], pos[2]).project(cachedTrayCamera);
  return [Number(projected.x.toFixed(4)), Number(projected.y.toFixed(4))];
}

export function resolvePlayerWealthTier(
  cash: number,
  ownedCellIndices: ReadonlyArray<number> = [],
  levelMap: Record<number, 0 | 1 | 2 | 3> = {},
  mortgagedCellIndices: ReadonlyArray<number> = [],
  mortgageLoans: Record<number, number> = {},
  isBankrupt: boolean = false
): { readonly tier: WealthTrayTier; readonly netWorth: number; readonly propertyCount: number } {
  if (isBankrupt) {
    return { tier: 0, netWorth: 0, propertyCount: 0 };
  }
  const rawNetWorth = calculatePlayerNetWorth(cash, ownedCellIndices, levelMap, mortgagedCellIndices, mortgageLoans);
  const netWorth = Math.max(0, Number.isFinite(rawNetWorth) ? rawNetWorth : 0);
  let tier: WealthTrayTier = 1;
  if (netWorth >= WEALTH_TRAY_TIER_THRESHOLDS.tier4) {
    tier = 4;
  } else if (netWorth >= WEALTH_TRAY_TIER_THRESHOLDS.tier3) {
    tier = 3;
  } else if (netWorth >= WEALTH_TRAY_TIER_THRESHOLDS.tier2) {
    tier = 2;
  }
  return { tier, netWorth, propertyCount: ownedCellIndices.length };
}

export function getSanctuaryWealthTrayDescriptors(
  playersInfo?: Readonly<Record<string, PlayerHudInfo>> | null,
  levelMap: Record<number, 0 | 1 | 2 | 3> = {},
  sanctuaries: ReadonlyArray<CornerSanctuaryDescriptor> = getCornerSanctuaryDescriptors()
): ReadonlyArray<SanctuaryWealthTrayDescriptor> {
  const playerEntries = playersInfo ? Object.values(playersInfo) : [];
  const sortedPlayers = [...playerEntries].sort((a, b) => (a.ownerSlot ?? a.pawnSlot ?? 99) - (b.ownerSlot ?? b.pawnSlot ?? 99));
  const scaledHalfW = WEALTH_TRAY_BASE_DIMENSIONS.width * TRAY_SCALE[0] * 0.5;
  const scaledHalfD = WEALTH_TRAY_BASE_DIMENSIONS.depth * TRAY_SCALE[2] * 0.5;
  const cosR = Math.abs(Math.cos(TRAY_ROTATION_Y));
  const sinR = Math.abs(Math.sin(TRAY_ROTATION_Y));
  const halfW = scaledHalfW * cosR + scaledHalfD * sinR;
  const halfD = scaledHalfW * sinR + scaledHalfD * cosR;
  const maxRadialExtent = Number(Math.hypot(APRON_OFFSET_X + halfW, APRON_OFFSET_Z + halfD).toFixed(4));
  const topY = Number((TRAY_BOTTOM_Y + WEALTH_TRAY_BASE_DIMENSIONS.height * TRAY_SCALE[1]).toFixed(4));

  return sanctuaries.slice(0, 4).map((sanctuary, slotIndex) => {
    const player = sortedPlayers[slotIndex];
    const playerId = player?.id ?? `p${slotIndex + 1}`;
    const isBankrupt = player ? Boolean(player.bankrupt || player.isBankrupt) : false;
    const resolved = player
      ? resolvePlayerWealthTier(
          player.balance ?? 0,
          player.ownedProperties ?? [],
          levelMap,
          player.mortgagedProperties ?? [],
          player.mortgageLoans ?? {},
          isBankrupt
        )
      : resolvePlayerWealthTier(1500, [], levelMap, [], {}, false);

    const worldX = Number((sanctuary.position[0] + APRON_OFFSET_X).toFixed(4));
    const worldZ = Number((sanctuary.position[2] + APRON_OFFSET_Z).toFixed(4));
    const worldPosition: readonly [number, number, number] = [worldX, TRAY_BOTTOM_Y, worldZ];
    const [ndcX, ndcY] = projectTrayToOverviewNdc(worldPosition);

    return {
      id: `wealth-tray-${sanctuary.id}`,
      sanctuaryId: sanctuary.id,
      playerId,
      playerSlot: slotIndex,
      tier: resolved.tier,
      netWorth: resolved.netWorth,
      propertyCount: resolved.propertyCount,
      modelUrl: resolved.tier === 0 ? null : WEALTH_TRAY_MODEL_URLS[resolved.tier],
      worldPosition,
      trayScale: TRAY_SCALE,
      rotationY: TRAY_ROTATION_Y,
      bottomY: TRAY_BOTTOM_Y,
      topY,
      embedDepth: Number((sanctuary.baseTopY - TRAY_BOTTOM_Y).toFixed(4)),
      aabbMinX: Number((worldX - halfW).toFixed(4)),
      aabbMaxX: Number((worldX + halfW).toFixed(4)),
      aabbMinZ: Number((worldZ - halfD).toFixed(4)),
      aabbMaxZ: Number((worldZ + halfD).toFixed(4)),
      maxRadialExtent,
      ndcX,
      ndcY,
    };
  });
}

export function createScratchChainReactionSnapshot(): DioramaChainReactionSnapshot {
  return {
    isActive: false,
    isExpired: false,
    elapsedMs: 0,
    stages: CHAIN_REACTION_STAGE_SPECS.map((s) => ({
      stageIndex: s.stageIndex,
      id: s.id,
      isTriggered: false,
      intensity: 0,
      ringScale: 1,
      yOffset: 0,
    })),
  };
}

export function evaluateDioramaChainReaction(
  elapsedMs: number,
  ttlMs: number = CHAIN_REACTION_TTL_MS,
  outSnapshot?: DioramaChainReactionSnapshot
): DioramaChainReactionSnapshot {
  const target = outSnapshot ?? createScratchChainReactionSnapshot();

  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) {
    target.isActive = false;
    target.isExpired = false;
    target.elapsedMs = 0;
    for (let i = 0; i < CHAIN_REACTION_STAGE_SPECS.length; i++) {
      const spec = CHAIN_REACTION_STAGE_SPECS[i]!;
      const st = target.stages[i];
      if (st) {
        st.stageIndex = spec.stageIndex;
        st.id = spec.id;
        st.isTriggered = false;
        st.intensity = 0;
        st.ringScale = 1;
        st.yOffset = 0;
      }
    }
    return target;
  }

  if (elapsedMs >= ttlMs) {
    target.isActive = false;
    target.isExpired = true;
    target.elapsedMs = elapsedMs;
    for (let i = 0; i < CHAIN_REACTION_STAGE_SPECS.length; i++) {
      const spec = CHAIN_REACTION_STAGE_SPECS[i]!;
      const st = target.stages[i];
      if (st) {
        st.stageIndex = spec.stageIndex;
        st.id = spec.id;
        st.isTriggered = false;
        st.intensity = 0;
        st.ringScale = 1;
        st.yOffset = 0;
      }
    }
    return target;
  }

  target.isActive = true;
  target.isExpired = false;
  target.elapsedMs = elapsedMs;
  for (let i = 0; i < CHAIN_REACTION_STAGE_SPECS.length; i++) {
    const spec = CHAIN_REACTION_STAGE_SPECS[i]!;
    const st = target.stages[i];
    if (!st) continue;
    st.stageIndex = spec.stageIndex;
    st.id = spec.id;
    if (elapsedMs < spec.delayMs) {
      st.isTriggered = false;
      st.intensity = 0;
      st.ringScale = 1;
      st.yOffset = 0;
      continue;
    }
    const localT = elapsedMs - spec.delayMs;
    const stageWindow = Math.max(1, ttlMs - spec.delayMs);
    const progress = Math.min(1, Math.max(0, localT / stageWindow));
    const envelope = Math.sin(progress * Math.PI);
    st.isTriggered = true;
    st.intensity = Number(Math.max(0.05, envelope).toFixed(4));
    st.ringScale = Number((1 + progress * 0.85).toFixed(4));
    st.yOffset = Number((envelope * 0.08).toFixed(4));
  }
  return target;
}

export function computeEconomicAwakeningSignature(
  playersInfo?: Readonly<Record<string, PlayerHudInfo>> | null,
  levelMap?: Record<number, 0 | 1 | 2 | 3>,
  lastHoseTuple?: readonly [string | number | null | undefined, number | null | undefined]
): string {
  const playerPart = playersInfo
    ? Object.values(playersInfo)
        .sort((a, b) => a.id.localeCompare(b.id))
        .map((p) => {
          const props = [...(p.ownedProperties ?? [])].sort((x, y) => x - y).join(',');
          const bFlag = p.bankrupt || p.isBankrupt ? '1' : '0';
          return `${p.id}:[${props}]:${bFlag}`;
        })
        .join('|')
    : 'none';
  const levelPart = levelMap
    ? Object.entries(levelMap)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([k, v]) => `${k}=${v}`)
        .join(',')
    : 'none';
  const hosePart = lastHoseTuple ? `${lastHoseTuple[0] ?? ''}:${lastHoseTuple[1] ?? ''}` : 'none';
  return `P(${playerPart})_L(${levelPart})_H(${hosePart})`;
}
