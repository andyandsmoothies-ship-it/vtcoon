// [IMP-204] Title Deed Affordance & Even Build Rules Calculation
import { PROPERTY_DEEDS } from '../../../domain/property_data.js';
import { BOARD_CONFIG, type ColorGroup } from '../../../domain/board_config.js';
import type { Player } from '../../../domain/types.js';

export interface PurchaseAffordance {
  readonly deedPrice: number;
  readonly canAffordCash: boolean;
  readonly shortfall: number;
  readonly hasMortgageableProperties: boolean;
  readonly totalMortgageCapacity: number;
  readonly canCoverWithMortgage: boolean;
}

export function resolvePurchaseAffordance(params: {
  cellIndex: number;
  buyerBalance: number;
  ownedProperties?: readonly number[];
  mortgagedProperties?: readonly number[];
  levelMap?: Record<number, number>;
  isTradeFrozen?: boolean;
}): PurchaseAffordance {
  const deed = PROPERTY_DEEDS.get(params.cellIndex);
  const deedPrice = deed?.price ?? 0;
  const canAffordCash = params.buyerBalance >= deedPrice;
  const shortfall = Math.max(0, deedPrice - params.buyerBalance);

  if (params.isTradeFrozen) {
    return {
      deedPrice,
      canAffordCash,
      shortfall,
      hasMortgageableProperties: false,
      totalMortgageCapacity: 0,
      canCoverWithMortgage: false,
    };
  }

  const owned = params.ownedProperties ?? [];
  const mortgaged = new Set(params.mortgagedProperties ?? []);
  const levels = params.levelMap ?? {};

  let totalMortgageCapacity = 0;
  let hasMortgageableProperties = false;

  for (const idx of owned) {
    if (idx === params.cellIndex) continue;
    if (mortgaged.has(idx)) continue;
    if ((levels[idx] ?? 0) > 0) continue; // BĐS có công trình phải hạ cấp trước
    const d = PROPERTY_DEEDS.get(idx);
    if (d) {
      totalMortgageCapacity += Math.floor(d.price * 0.5);
      hasMortgageableProperties = true;
    }
  }

  const canCoverWithMortgage = (params.buyerBalance + totalMortgageCapacity) >= deedPrice;

  return {
    deedPrice,
    canAffordCash,
    shortfall,
    hasMortgageableProperties,
    totalMortgageCapacity,
    canCoverWithMortgage,
  };
}

export function resolveMonopolyGroupInfo(params: {
  colorGroup?: ColorGroup;
  ownerProperties?: readonly number[];
  ownerMortgaged?: readonly number[];
}): { hasAllProperties: boolean; hasAnyGroupMortgaged: boolean; hasMonopoly: boolean; groupCells: readonly number[] } {
  if (!params.colorGroup) {
    return { hasAllProperties: false, hasAnyGroupMortgaged: false, hasMonopoly: false, groupCells: [] };
  }
  const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === params.colorGroup).map((c) => c.index);
  const owned = params.ownerProperties ?? [];
  const mortgaged = params.ownerMortgaged ?? [];
  const hasAllProperties = groupCells.length > 0 && groupCells.every((idx) => owned.includes(idx));
  const hasAnyGroupMortgaged = groupCells.some((idx) => mortgaged.includes(idx));
  const hasMonopoly = hasAllProperties && !hasAnyGroupMortgaged;
  return { hasAllProperties, hasAnyGroupMortgaged, hasMonopoly, groupCells };
}

export function resolveEvenBuildRules(params: {
  isOwner: boolean;
  isMortgaged: boolean;
  hasAllProperties: boolean;
  hasAnyGroupMortgaged: boolean;
  currentLevel: number;
  cellIndex: number;
  groupCells: readonly number[];
  levelMap: Record<number, number>;
}): { upgradeBlockedReason?: string; downgradeBlockedReason?: string } {
  let upgradeBlockedReason: string | undefined = undefined;
  if (params.isOwner && !params.isMortgaged) {
    if (params.currentLevel >= 3) {
      upgradeBlockedReason = 'Đã đạt cấp độ tối đa';
    } else if (!params.hasAllProperties) {
      upgradeBlockedReason = 'Cần sở hữu trọn bộ màu trước khi nâng cấp';
    } else if (params.hasAnyGroupMortgaged) {
      upgradeBlockedReason = 'Không thể nâng cấp khi nhóm có ô thế chấp';
    } else if (params.groupCells.length > 0) {
      const targetLevel = params.currentLevel + 1;
      const laggingCells = params.groupCells
        .filter((idx) => idx !== params.cellIndex)
        .filter((idx) => (params.levelMap[idx] ?? 0) < targetLevel - 1);
      if (laggingCells.length > 0) {
        const names = laggingCells.map((idx) => BOARD_CONFIG[idx]?.name ?? `Ô ${idx}`).join(', ');
        upgradeBlockedReason = `Quy tắc xây dựng đều tay: Cần nâng cấp ${names} lên C${targetLevel - 1} trước khi xây C${targetLevel}`;
      }
    }
  }

  let downgradeBlockedReason: string | undefined = undefined;
  if (params.isOwner && !params.isMortgaged && params.currentLevel > 0 && params.groupCells.length > 0) {
    const higherCells = params.groupCells
      .filter((idx) => idx !== params.cellIndex)
      .filter((idx) => (params.levelMap[idx] ?? 0) > params.currentLevel);
    if (higherCells.length > 0) {
      const names = higherCells.map((idx) => BOARD_CONFIG[idx]?.name ?? `Ô ${idx}`).join(', ');
      downgradeBlockedReason = `Quy tắc hạ cấp đều tay: Cần hạ cấp ${names} trước khi hạ tiếp ô này`;
    }
  }

  return { upgradeBlockedReason, downgradeBlockedReason };
}

export interface AffordancePlayer {
  readonly id: string;
  readonly name?: string;
  readonly balance?: number;
  readonly position?: number;
  readonly ownedProperties?: readonly number[];
  readonly mortgagedProperties?: readonly number[];
  readonly isBot?: boolean;
  readonly bankrupt?: boolean;
}

export function resolveTitleDeedModalState(params: {
  cellIndex: number;
  canBuyOverride?: boolean;
  isBuyOpportunityOverride?: boolean;
  myId: string;
  myPlayer?: AffordancePlayer | Player | null;
  playersInfo: Record<string, AffordancePlayer | Player | any>;
  levelMap: Record<number, number>;
  activeModifiers?: readonly { readonly type: string; readonly remainingRounds: number }[];
  turnPhase?: string | null;
  currentTurnPlayerId?: string | null;
}) {
  const ownerId = Object.keys(params.playersInfo).find((id) => (params.playersInfo[id] as AffordancePlayer)?.ownedProperties?.includes(params.cellIndex));
  const owner = ownerId ? (params.playersInfo[ownerId] as AffordancePlayer) : undefined;
  const isOwner = ownerId === params.myId;
  const isMortgaged = Boolean(owner?.mortgagedProperties?.includes(params.cellIndex));
  const deed = PROPERTY_DEEDS.get(params.cellIndex);
  const currentLevel = (params.levelMap[params.cellIndex] ?? 0) as 0 | 1 | 2 | 3;
  const upgradeCost = deed?.upgradeCosts && currentLevel < 3 ? deed.upgradeCosts[currentLevel as 0 | 1 | 2] : 0;

  const cell = BOARD_CONFIG[params.cellIndex];
  const groupInfo = resolveMonopolyGroupInfo({
    colorGroup: cell?.colorGroup,
    ownerProperties: owner?.ownedProperties,
    ownerMortgaged: owner?.mortgagedProperties,
  });

  const buildRules = resolveEvenBuildRules({
    isOwner,
    isMortgaged,
    hasAllProperties: groupInfo.hasAllProperties,
    hasAnyGroupMortgaged: groupInfo.hasAnyGroupMortgaged,
    currentLevel,
    cellIndex: params.cellIndex,
    groupCells: groupInfo.groupCells,
    levelMap: params.levelMap,
  });

  const isTradeFrozen = Boolean(params.activeModifiers?.some((m) => m.type === 'MC_FREEZE_TRADE' && m.remainingRounds > 0));

  const affordance = resolvePurchaseAffordance({
    cellIndex: params.cellIndex,
    buyerBalance: params.myPlayer?.balance ?? 0,
    ownedProperties: (params.myPlayer as AffordancePlayer)?.ownedProperties,
    mortgagedProperties: (params.myPlayer as AffordancePlayer)?.mortgagedProperties,
    levelMap: params.levelMap,
    isTradeFrozen,
  });

  const currentPos = params.myPlayer?.position ?? 0;
  const isStandingHere = currentPos === params.cellIndex;
  const isBuyOpportunity = params.isBuyOpportunityOverride ?? (
    params.canBuyOverride !== undefined
      ? Boolean(params.canBuyOverride)
      : Boolean(
          isStandingHere &&
          !owner &&
          params.turnPhase === 'ActionPhase' &&
          params.myId === params.currentTurnPlayerId
        )
  );

  return {
    owner,
    isOwner,
    isMortgaged,
    ownerName: owner?.name,
    currentLevel,
    upgradeCost,
    hasMonopoly: groupInfo.hasMonopoly,
    upgradeBlockedReason: buildRules.upgradeBlockedReason,
    downgradeBlockedReason: buildRules.downgradeBlockedReason,
    canBuy: params.canBuyOverride ?? affordance.canAffordCash,
    isBuyOpportunity,
    shortfall: affordance.shortfall,
    canCoverWithMortgage: affordance.canCoverWithMortgage,
    totalMortgageCapacity: affordance.totalMortgageCapacity,
  };
}
