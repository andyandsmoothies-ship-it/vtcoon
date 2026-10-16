// [UI-S01/MSS][IMP-403] WarRoomStageVisuals — Poka-Yoke Bot Trade Scale, Auction Gavel & Tycoon Diplomacy Halos
import { CanvasTexture } from 'three';
import {
  BotPersonality, BotPosture, evaluateBotTradeDecision, evaluatePlayerNetWorth, type BotNegotiationContext,
} from '../../domain/bot/index';
import {
  TurnPhase, createPlayer, createRoom, type Player, type PropertyRegistry, type PropertyStateMap,
} from '../../domain/index';
import type { PendingTradeOfferDelta } from '../../domain/protocol/index';
import type { ModalPayloadMap, PlayerHudInfo } from '../store/game_store_types';
import { type CornerSanctuaryDescriptor, getCornerSanctuaryDescriptors } from './coastal_sanctuary_visuals';
import {
  projectToOverviewNdc, computeTransformedAABB2D, checkAABBCollision2D,
} from './spatial_geometry_helpers';
import { sanitizeCanvasText } from './canvas_text_sanitizer';

export const WAR_ROOM_MODEL_URLS = {
  gavel: '/models/landmarks/auction_gavel.glb',
  scale: '/models/landmarks/trade_balance_scale.glb',
} as const;

export const WAR_ROOM_GAVEL_BASE_DIMENSIONS = { width: 0.44, height: 0.42, depth: 0.44 } as const;
export const WAR_ROOM_SCALE_BASE_DIMENSIONS = { width: 0.52, height: 0.48, depth: 0.32 } as const;
/** Footprint base dimension ratio representing bottom pedestal contact area rather than upper swing clearance */
export const WAR_ROOM_PEDESTAL_FOOTPRINT_RATIO = 0.5;
export const WAR_ROOM_TTL_MS = 2600;
export const WAR_ROOM_MAX_SCALE_TILT_RAD = 0.35;

export type TycoonTacticalMode = 'MONOPOLY_OVERLORD' | 'EXPANSION' | 'DEFENSIVE' | 'RESCUE';

export interface WarRoomStageDescriptor {
  readonly daisPosition: readonly [number, number, number];
  readonly daisRadius: number; readonly sandRadius: number;
  readonly rimWidth: number; readonly deckWidth: number;
  readonly daisBottomY: number; readonly sandTopY: number;
  readonly rimTopY: number; readonly daisTopY: number; readonly embedDepth: number;
  readonly gavelWorldPosition: readonly [number, number, number];
  readonly gavelScale: readonly [number, number, number]; readonly gavelRotationY: number;
  readonly scaleWorldPosition: readonly [number, number, number];
  readonly scaleModelScale: readonly [number, number, number]; readonly scaleRotationY: number;
  readonly ndcX: number; readonly ndcY: number;
  readonly isEquipmentClearanceSafe: boolean;
}

export interface WarRoomTradeScaleState {
  readonly isActive: boolean; readonly accept: boolean; readonly reason: string;
  readonly scaleTiltRad: number; readonly leftPanYOffset: number; readonly rightPanYOffset: number;
}

export interface WarRoomAuctionGavelState {
  readonly isActive: boolean; readonly isExpired: boolean;
  readonly gavelStrikeAngleRad: number; readonly gavelYOffset: number; readonly soundBlockPulseScale: number;
}

export interface TycoonDiplomacyHaloDescriptor {
  readonly id: string; readonly sanctuaryId: string; readonly playerId: string;
  readonly isVisible: boolean; readonly posture: BotPosture;
  readonly tacticalMode: TycoonTacticalMode; readonly viSlogan: string; readonly accentColor: string;
  readonly worldPosition: readonly [number, number, number];
  readonly bubbleWorldPosition: readonly [number, number, number];
  readonly bubbleRotation: readonly [number, number, number];
  readonly bubbleSize: readonly [number, number];
  readonly innerRadius: number; readonly outerRadius: number;
  readonly bottomY: number; readonly topY: number; readonly aabbMaxX: number;
  readonly ndcX: number; readonly ndcY: number;
  readonly bubbleNdcX: number; readonly bubbleNdcY: number;
}

const IDLE_TRADE_SCALE_STATE: WarRoomTradeScaleState = {
  isActive: false, accept: false, reason: '', scaleTiltRad: 0, leftPanYOffset: 0, rightPanYOffset: 0,
};
const IDLE_AUCTION_GAVEL_STATE: WarRoomAuctionGavelState = {
  isActive: false, isExpired: false, gavelStrikeAngleRad: 0, gavelYOffset: 0, soundBlockPulseScale: 1,
};
const EXPIRED_AUCTION_GAVEL_STATE: WarRoomAuctionGavelState = {
  isActive: false, isExpired: true, gavelStrikeAngleRad: 0, gavelYOffset: 0, soundBlockPulseScale: 1,
};

let cachedTradeSignature = '';
let cachedTradeResult: WarRoomTradeScaleState = IDLE_TRADE_SCALE_STATE;
const speechBubbleTextureCache = new Map<string, CanvasTexture>();

export function getWarRoomStageDescriptor(): WarRoomStageDescriptor {
  const daisPosition: readonly [number, number, number] = [11.5, -0.28, 2.2];
  const [ndcX, ndcY] = projectToOverviewNdc(daisPosition);
  const gavelWorldPosition: readonly [number, number, number] = [11.12, -0.08, 2.02];
  const gavelScale: readonly [number, number, number] = [1.4, 1.4, 1.4];
  const scaleWorldPosition: readonly [number, number, number] = [11.88, -0.08, 2.38];
  const scaleModelScale: readonly [number, number, number] = [1.4, 1.4, 1.4];
  const gavelBox = computeTransformedAABB2D({
    center: gavelWorldPosition, scale: gavelScale, rotationY: 0.38,
    baseSize: {
      width: WAR_ROOM_GAVEL_BASE_DIMENSIONS.width * WAR_ROOM_PEDESTAL_FOOTPRINT_RATIO,
      depth: WAR_ROOM_GAVEL_BASE_DIMENSIONS.depth * WAR_ROOM_PEDESTAL_FOOTPRINT_RATIO,
    },
  });
  const scaleBox = computeTransformedAABB2D({
    center: scaleWorldPosition, scale: scaleModelScale, rotationY: -0.28,
    baseSize: {
      width: WAR_ROOM_SCALE_BASE_DIMENSIONS.width * WAR_ROOM_PEDESTAL_FOOTPRINT_RATIO,
      depth: WAR_ROOM_SCALE_BASE_DIMENSIONS.depth * WAR_ROOM_PEDESTAL_FOOTPRINT_RATIO,
    },
  });

  return {
    daisPosition,
    daisRadius: 1.18, sandRadius: 1.06, rimWidth: 1.56, deckWidth: 1.42,
    daisBottomY: -0.34, sandTopY: -0.22, rimTopY: -0.16, daisTopY: -0.08, embedDepth: 0.02,
    gavelWorldPosition, gavelScale, gavelRotationY: 0.38,
    scaleWorldPosition, scaleModelScale, scaleRotationY: -0.28,
    ndcX, ndcY,
    isEquipmentClearanceSafe: !checkAABBCollision2D(gavelBox, scaleBox, 0.20),
  };
}

function toDomainPlayer(hud: PlayerHudInfo | undefined, fallbackId: string, defaultBalance: number): Player {
  const rawBal = hud?.balance;
  const balance = typeof rawBal === 'number' && rawBal > 0 ? rawBal : defaultBalance;
  const p = createPlayer(hud?.id ?? fallbackId);
  p.balance = balance;
  p.name = hud?.name ?? fallbackId;
  p.mortgagedProperties = [...(hud?.mortgagedProperties ?? [])];
  p.bankrupt = Boolean(hud?.bankrupt || hud?.isBankrupt);
  p.mortgageLoans = hud?.mortgageLoans ? { ...hud.mortgageLoans } : {};
  p.isBot = false;
  return p;
}

function buildDomainValuationContext(
  playersInfo: Readonly<Record<string, PlayerHudInfo>> | null | undefined,
  levelMap: Record<number, 0 | 1 | 2 | 3> = {},
  defaultBalance: number = 0
): { readonly players: Player[]; readonly registry: PropertyRegistry; readonly stateMap: PropertyStateMap } {
  const hudList = playersInfo ? Object.values(playersInfo) : [];
  const registry: PropertyRegistry = new Map<number, string>();
  const stateMap: PropertyStateMap = new Map();
  const players: Player[] = hudList.map((hud) => {
    const p = toDomainPlayer(hud, hud.id, defaultBalance);
    for (const cellIdx of hud.ownedProperties ?? []) {
      registry.set(cellIdx, p.id);
      stateMap.set(cellIdx, {
        level: levelMap[cellIdx] ?? 0,
        isMortgaged: Boolean(hud.mortgagedProperties?.includes(cellIdx)),
      });
    }
    return p;
  });
  return { players, registry, stateMap };
}

export function evaluateWarRoomTradeScale(
  pendingTradeOffer?: PendingTradeOfferDelta | null,
  playersInfo?: Readonly<Record<string, PlayerHudInfo>> | null,
  levelMap: Record<number, 0 | 1 | 2 | 3> = {}
): WarRoomTradeScaleState {
  if (!pendingTradeOffer) return IDLE_TRADE_SCALE_STATE;

  const pKeys = playersInfo
    ? Object.values(playersInfo).map((p) => `${p.id}:${p.balance}:${(p.ownedProperties ?? []).join(',')}`).join('|')
    : '';
  const lKeys = Object.entries(levelMap).map(([k, v]) => `${k}=${v}`).join(',');
  const sig = `${pendingTradeOffer.offerId}:${pendingTradeOffer.cellIndex}:${pendingTradeOffer.price}:${pendingTradeOffer.buyerId}:${pendingTradeOffer.sellerId}:${pKeys}:${lKeys}`;
  if (sig === cachedTradeSignature) return cachedTradeResult;

  const { players, registry, stateMap } = buildDomainValuationContext(playersInfo, levelMap, 2500);
  let seller = players.find((p) => p.id === pendingTradeOffer.sellerId);
  if (!seller) {
    seller = toDomainPlayer(playersInfo?.[pendingTradeOffer.sellerId], pendingTradeOffer.sellerId, 2500);
    players.push(seller);
  } else if (seller.balance <= 0) {
    seller.balance = 2500;
  }

  let buyer = players.find((p) => p.id === pendingTradeOffer.buyerId);
  if (!buyer) {
    buyer = toDomainPlayer(playersInfo?.[pendingTradeOffer.buyerId], pendingTradeOffer.buyerId, 2500);
    players.push(buyer);
  }

  while (players.length < 3) {
    players.push(toDomainPlayer(undefined, `__observer_${players.length}`, 2500));
  }

  if (!registry.has(pendingTradeOffer.cellIndex)) {
    registry.set(pendingTradeOffer.cellIndex, seller.id);
    stateMap.set(pendingTradeOffer.cellIndex, { level: levelMap[pendingTradeOffer.cellIndex] ?? 0, isMortgaged: false });
  }

  const room = createRoom(players[0]?.id ?? 'p1', 'WARRM0');
  room.players = players;
  room.phase = TurnPhase.ActionPhase;
  room.started = true;
  room.round = 8;
  room.roundCount = 8;

  const botPersonalities = new Map<string, BotPersonality>([[seller.id, BotPersonality.Balanced]]);
  const context: BotNegotiationContext = { room, registry, stateMap, botPersonalities };
  const decision = evaluateBotTradeDecision(
    context,
    seller,
    buyer,
    pendingTradeOffer.cellIndex,
    pendingTradeOffer.price,
    pendingTradeOffer.offeredCellIndex
  );

  let normalizedReason = decision.reason ?? (decision.accept ? 'ACCEPTED' : 'REJECTED');
  if (!decision.accept && normalizedReason === 'EMBARGO_LEADER' && (buyer.balance >= 30000 || buyer.balance > seller.balance * 3)) {
    normalizedReason = 'KINGMAKING_DEFENSE';
  }

  const scaleTiltRad = decision.accept ? 0.24 : -0.26;
  cachedTradeSignature = sig;
  cachedTradeResult = {
    isActive: true,
    accept: decision.accept,
    reason: normalizedReason,
    scaleTiltRad: Math.max(-WAR_ROOM_MAX_SCALE_TILT_RAD, Math.min(WAR_ROOM_MAX_SCALE_TILT_RAD, scaleTiltRad)),
    leftPanYOffset: decision.accept ? -0.06 : 0.065,
    rightPanYOffset: decision.accept ? 0.06 : -0.065,
  };
  return cachedTradeResult;
}

export function evaluateWarRoomAuctionGavel(
  auction?: ModalPayloadMap['auction'] | null,
  elapsedMs: number = 0,
  ttlMs: number = WAR_ROOM_TTL_MS
): WarRoomAuctionGavelState {
  if (!auction || !Number.isFinite(elapsedMs) || elapsedMs < 0) return IDLE_AUCTION_GAVEL_STATE;
  if (elapsedMs >= ttlMs) return EXPIRED_AUCTION_GAVEL_STATE;

  const progress = Math.min(1, Math.max(0, elapsedMs / Math.max(1, ttlMs)));
  const decay = Math.exp(-progress * 2.4);
  const wave = Math.sin(((elapsedMs + 80) / 180) * Math.PI);
  const rawAngle = (-0.13 - 0.32 * wave) * decay;
  const gavelStrikeAngleRad = Number(Math.max(-0.48, Math.min(0.22, rawAngle)).toFixed(4));
  return {
    isActive: true,
    isExpired: false,
    gavelStrikeAngleRad: gavelStrikeAngleRad === 0 ? -0.08 : gavelStrikeAngleRad,
    gavelYOffset: Number((0.015 + Math.abs(wave) * 0.065 * decay).toFixed(4)),
    soundBlockPulseScale: Number((1.01 + (1 - Math.abs(wave)) * 0.07 * decay).toFixed(4)),
  };
}

export function resolveTycoonDiplomacyPosture(
  playerId: string,
  playersInfo?: Readonly<Record<string, PlayerHudInfo>> | null,
  levelMap: Record<number, 0 | 1 | 2 | 3> = {}
): {
  readonly isVisible: boolean;
  readonly posture: BotPosture;
  readonly tacticalMode: TycoonTacticalMode;
  readonly viSlogan: string;
  readonly accentColor: string;
  readonly netWorth: number;
} {
  const hud = playersInfo?.[playerId];
  if (!hud || Boolean(hud.bankrupt || hud.isBankrupt)) {
    return { isVisible: false, posture: BotPosture.Trailing, tacticalMode: 'RESCUE', viSlogan: '', accentColor: '#64748B', netWorth: 0 };
  }
  const { players, registry, stateMap } = buildDomainValuationContext(playersInfo, levelMap, 0);
  const netWorth = evaluatePlayerNetWorth(playerId, players, registry, stateMap);

  if (netWorth >= 30000) {
    return { isVisible: true, posture: BotPosture.Leading, tacticalMode: 'MONOPOLY_OVERLORD', viSlogan: 'Vị Thế Chi Phối', accentColor: '#F59E0B', netWorth };
  }
  if (netWorth >= 12000) {
    return { isVisible: true, posture: BotPosture.Parity, tacticalMode: 'EXPANSION', viSlogan: 'Tích Lũy Tài Sản', accentColor: '#10B981', netWorth };
  }
  if (netWorth >= 6000) {
    return { isVisible: true, posture: BotPosture.Trailing, tacticalMode: 'DEFENSIVE', viSlogan: 'Bảo Toàn Thanh Khoản', accentColor: '#38BDF8', netWorth };
  }
  return { isVisible: true, posture: BotPosture.Trailing, tacticalMode: 'RESCUE', viSlogan: 'Tái Cơ Cấu Vốn', accentColor: '#EF4444', netWorth };
}

export function getTycoonDiplomacyHaloDescriptors(
  playersInfo?: Readonly<Record<string, PlayerHudInfo>> | null,
  levelMap: Record<number, 0 | 1 | 2 | 3> = {},
  sanctuaries: ReadonlyArray<CornerSanctuaryDescriptor> = getCornerSanctuaryDescriptors()
): ReadonlyArray<TycoonDiplomacyHaloDescriptor> {
  const playerEntries = playersInfo ? Object.values(playersInfo) : [];
  const sortedPlayers = [...playerEntries].sort((a, b) => (a.ownerSlot ?? a.pawnSlot ?? 99) - (b.ownerSlot ?? b.pawnSlot ?? 99));
  const bubbleRotation: readonly [number, number, number] = [-0.55, Number((Math.PI / 4).toFixed(4)), 0];
  const bubbleSize: readonly [number, number] = [1.65, 0.52];

  return sanctuaries.slice(0, 4).map((sanctuary, slotIndex) => {
    const player = sortedPlayers[slotIndex];
    const playerId = player?.id ?? `p${slotIndex + 1}`;
    const resolved = player
      ? resolveTycoonDiplomacyPosture(player.id, playersInfo, levelMap)
      : { isVisible: true, posture: BotPosture.Parity, tacticalMode: 'EXPANSION' as const, viSlogan: 'Tích Lũy Tài Sản', accentColor: '#10B981', netWorth: 15000 };

    const [cx, , cz] = sanctuary.position;
    const worldPosition: readonly [number, number, number] = [cx, 0.086, cz];
    const [bx, bz] =
      sanctuary.id === 'sanctuary-southwest' ? [cx + 0.85, cz - 0.65]
      : sanctuary.id === 'sanctuary-west-north' ? [cx + 1.55, cz + 0.95]
      : sanctuary.id === 'sanctuary-west-south' ? [cx + 1.95, cz - 0.65]
      : sanctuary.id === 'sanctuary-north-east' ? [cx + 0.35, cz + 3.35]
      : [cx, cz];
    const bubbleWorldPosition: readonly [number, number, number] = [Number(bx.toFixed(4)), 1.48, Number(bz.toFixed(4))];
    const [ndcX, ndcY] = projectToOverviewNdc(worldPosition);
    const [bubbleNdcX, bubbleNdcY] = projectToOverviewNdc(bubbleWorldPosition);

    return {
      id: `diplomacy-halo-${sanctuary.id}`,
      sanctuaryId: sanctuary.id,
      playerId,
      isVisible: resolved.isVisible,
      posture: resolved.posture,
      tacticalMode: resolved.tacticalMode,
      viSlogan: resolved.viSlogan,
      accentColor: resolved.accentColor,
      worldPosition,
      bubbleWorldPosition,
      bubbleRotation,
      bubbleSize,
      innerRadius: 0.36,
      outerRadius: 0.46,
      bottomY: 0.078,
      topY: 0.094,
      aabbMaxX: Number((cx + 0.46).toFixed(4)),
      ndcX,
      ndcY,
      bubbleNdcX,
      bubbleNdcY,
    };
  });
}

export function createDiplomacySpeechBubbleTexture(
  viSlogan: string,
  accentColor: string,
  tacticalMode: TycoonTacticalMode
): CanvasTexture {
  const renderedText = sanitizeCanvasText(viSlogan);
  const backgroundHex = '#0F172A';
  const key = `${tacticalMode}:${accentColor}:${renderedText}`;
  const cached = speechBubbleTextureCache.get(key);
  if (cached && cached.userData?.backgroundHex === backgroundHex && cached.userData?.renderedText === renderedText) {
    return cached;
  }

  const domCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : undefined;
  if (domCanvas) {
    domCanvas.width = 512;
    domCanvas.height = 160;
    const ctx = domCanvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, 512, 160);
      ctx.fillStyle = backgroundHex;
      ctx.fillRect(12, 14, 488, 132);
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 10;
      ctx.strokeRect(12, 14, 488, 132);
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 4;
      ctx.strokeRect(24, 26, 464, 108);
      ctx.fillStyle = '#FFFBEB';
      ctx.font = 'bold 40px "Be Vietnam Pro", "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(renderedText, 256, 82);
    }
  }

  const tex = new CanvasTexture(domCanvas);
  tex.userData = { ...tex.userData, renderedText, backgroundHex };
  tex.needsUpdate = true;
  speechBubbleTextureCache.set(key, tex);
  return tex;
}

export function disposeDiplomacySpeechBubbleTextures(): void {
  for (const tex of speechBubbleTextureCache.values()) {
    tex.dispose();
  }
  speechBubbleTextureCache.clear();
}
