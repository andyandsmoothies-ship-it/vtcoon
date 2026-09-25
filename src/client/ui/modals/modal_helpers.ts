// [UI-S04/MSS] Modal Helpers — Pure calculation & validation functions for business modals
import { PROPERTY_DEEDS, RAILROAD_FEES } from '../../../domain/property_data';
import { BOARD_CONFIG, ColorGroup, CellType } from '../../../domain/board_config';

export const P2P_TAX_RATE = 0.05;

export interface DeedDisplayInfo {
  readonly cellIndex: number;
  readonly name: string;
  readonly cellType?: CellType;
  readonly colorGroup?: ColorGroup;
  readonly price: number;
  readonly mortgageValue: number;
  readonly rents: [number, number, number, number]; // C0, C1, C2, C3 hoặc theo bậc ga
  readonly upgradeCosts: [number, number, number];
}

/**
 * Tra cứu thông tin hiển thị Sổ Đỏ (Title Deed) theo cellIndex.
 * Trả về null nếu ô không thuộc danh mục mua bán PROPERTY_DEEDS (GO, Thuế, Cơ Hội...).
 */
export function getDeedDisplayInfo(cellIndex: number): DeedDisplayInfo | null {
  if (!Number.isInteger(cellIndex) || cellIndex < 0 || cellIndex >= BOARD_CONFIG.length) {
    return null;
  }
  const deed = PROPERTY_DEEDS.get(cellIndex);
  const cell = BOARD_CONFIG[cellIndex];
  if (!deed || !cell) {
    return null;
  }

  const mortgageValue = Math.floor(deed.price * 0.5);
  let rents: [number, number, number, number];
  let upgradeCosts: [number, number, number];

  if (cell.type === CellType.Railroad) {
    rents = [RAILROAD_FEES[1] ?? 500, RAILROAD_FEES[2] ?? 1000, RAILROAD_FEES[3] ?? 2000, RAILROAD_FEES[4] ?? 4000];
    upgradeCosts = [0, 0, 0];
  } else if (cell.type === CellType.Utility) {
    rents = [deed.rent0, deed.rent0, deed.rent0, deed.rent0];
    upgradeCosts = [0, 0, 0];
  } else {
    rents = [
      deed.rent0,
      deed.rent1 ?? deed.rent0,
      deed.rent2 ?? deed.rent0,
      deed.rent3 ?? deed.rent0,
    ];
    upgradeCosts = deed.upgradeCosts
      ? [deed.upgradeCosts[0], deed.upgradeCosts[1], deed.upgradeCosts[2]]
      : [0, 0, 0];
  }

  return {
    cellIndex,
    name: cell.name,
    cellType: cell.type,
    colorGroup: cell.colorGroup,
    price: deed.price,
    mortgageValue,
    rents,
    upgradeCosts,
  };
}

/**
 * Tính 3 bước giá tăng dần (+100, +200, +500 Tr.) từ mức giá hiện tại (IMP-102).
 * Tự động chuẩn hóa giá âm hoặc không hợp lệ về 0.
 */
export function calculateAuctionIncrements(
  currentBid: number,
  isFireSale?: boolean,
  hasBidder?: boolean,
): [number, number, number] {
  if (isFireSale && !hasBidder) {
    return [0, 50, 100];
  }
  const safeBid = Number.isFinite(currentBid) && currentBid >= 0 ? Math.floor(currentBid) : 0;
  return [safeBid + 100, safeBid + 200, safeBid + 500];
}

/**
 * Tính thuế chuyển nhượng nộp Kho Bạc từ khoản tiền chênh lệch P2P.
 * Clamps giá trị âm hoặc không hợp lệ về 0, hỗ trợ taxRate tùy biến (VD: 20% khi có Macro Card).
 */
export function calculateTradeTax(cashDifference: number, taxRate: number = P2P_TAX_RATE): number {
  if (!Number.isFinite(cashDifference) || cashDifference <= 0) {
    return 0;
  }
  const safeRate = Number.isFinite(taxRate) && taxRate >= 0 ? taxRate : P2P_TAX_RATE;
  return Math.floor(cashDifference * safeRate);
}

export interface TradeValidationParams {
  readonly offeredProperties: readonly number[];
  readonly requestedProperties: readonly number[];
  readonly cashOffer: number;
  readonly cashRequest: number;
  readonly myBalance: number;
  readonly myProperties?: readonly number[];
  readonly targetProperties?: readonly number[];
  readonly myMortgagedProperties?: readonly number[];
  readonly targetMortgagedProperties?: readonly number[];
  readonly targetBalance?: number;
}

/**
 * Kiểm tra tính hợp lệ của đề xuất trao đổi song phương P2P.
 */
export function validateTradeOffer(params: TradeValidationParams): boolean {
  const {
    offeredProperties,
    requestedProperties,
    cashOffer,
    cashRequest,
    myBalance,
    myProperties,
    targetProperties,
    myMortgagedProperties,
    targetMortgagedProperties,
    targetBalance,
  } = params;

  if (!Number.isFinite(cashOffer) || cashOffer < 0) return false;
  if (!Number.isFinite(cashRequest) || cashRequest < 0) return false;
  if (!Number.isFinite(myBalance) || cashOffer > myBalance) return false;
  if (cashOffer > 0 && cashRequest > 0) return false;
  if (targetBalance !== undefined && (!Number.isFinite(targetBalance) || cashRequest > targetBalance)) return false;

  const hasOffer = offeredProperties.length > 0 || cashOffer > 0;
  const hasRequest = requestedProperties.length > 0 || cashRequest > 0;
  if (!hasOffer && !hasRequest) return false;

  const offeredSet = new Set(offeredProperties);
  if (offeredSet.size !== offeredProperties.length) return false;

  const requestedSet = new Set(requestedProperties);
  if (requestedSet.size !== requestedProperties.length) return false;

  for (const id of requestedProperties) {
    if (offeredSet.has(id)) return false;
  }

  if (myProperties) {
    const mySet = new Set(myProperties);
    for (const id of offeredProperties) {
      if (!mySet.has(id)) return false;
    }
  }

  if (targetProperties) {
    const targetSet = new Set(targetProperties);
    for (const id of requestedProperties) {
      if (!targetSet.has(id)) return false;
    }
  }

  if (myMortgagedProperties) {
    const mortgagedSet = new Set(myMortgagedProperties);
    for (const id of offeredProperties) {
      if (mortgagedSet.has(id)) return false;
    }
  }

  if (targetMortgagedProperties) {
    const mortgagedSet = new Set(targetMortgagedProperties);
    for (const id of requestedProperties) {
      if (mortgagedSet.has(id)) return false;
    }
  }

  return true;
}

// [IMP-133] Pure function checking 1-Click Quick Build upgrade eligibility
export interface CheckUpgradeParams {
  readonly cellIndex: number;
  readonly ownerProperties?: readonly number[];
  readonly ownedProperties?: readonly number[];
  readonly mortgagedProperties?: readonly number[];
  readonly levelMap?: Record<number, number>;
  readonly propertyStates?: Record<number, {
    readonly level?: number;
    readonly isMortgaged?: boolean;
    readonly ownerId?: string | null;
  }>;
  readonly balance: number;
  readonly isMyTurn?: boolean;
  readonly turnPhase?: string;
}

export interface UpgradeEligibility {
  readonly canUpgrade: boolean;
  readonly nextLevel?: 1 | 2 | 3;
  readonly upgradeCost?: number;
  readonly reason?: string;
  readonly blockedReason?: string;
  readonly hasMonopoly: boolean;
}

export function checkPropertyUpgradeEligibility(params: CheckUpgradeParams): UpgradeEligibility {
  const { cellIndex, balance, isMyTurn, turnPhase } = params;

  const cell = BOARD_CONFIG[cellIndex];
  const deed = PROPERTY_DEEDS.get(cellIndex);
  if (!cell || cell.type !== CellType.Property || !cell.colorGroup || !deed?.upgradeCosts) {
    return {
      canUpgrade: false,
      reason: 'Không thể nâng cấp ô này',
      blockedReason: 'Không thể nâng cấp ô này',
      hasMonopoly: false,
    };
  }

  const currentLevel = params.propertyStates?.[cellIndex]?.level ?? params.levelMap?.[cellIndex] ?? 0;
  if (currentLevel >= 3) {
    return {
      canUpgrade: false,
      reason: 'Đã đạt cấp tối đa',
      blockedReason: 'Đã đạt cấp tối đa',
      hasMonopoly: true,
    };
  }

  const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === cell.colorGroup);
  const owned = params.ownedProperties ?? params.ownerProperties ?? [];
  const hasMonopoly = groupCells.length > 0 && groupCells.every((c) => owned.includes(c.index));

  if (!hasMonopoly) {
    return {
      canUpgrade: false,
      reason: 'Cần sở hữu trọn bộ màu trước khi nâng cấp',
      blockedReason: 'Cần sở hữu trọn bộ màu trước khi nâng cấp',
      hasMonopoly: false,
    };
  }

  if (isMyTurn === false || (turnPhase !== undefined && turnPhase !== 'PropertyManagement')) {
    return {
      canUpgrade: false,
      reason: 'Chờ đến lượt xây dựng',
      blockedReason: 'Chờ đến lượt xây dựng',
      hasMonopoly: true,
    };
  }

  const hasMortgaged = groupCells.some((c) =>
    (params.mortgagedProperties?.includes(c.index) ?? false) ||
    Boolean(params.propertyStates?.[c.index]?.isMortgaged)
  );
  if (hasMortgaged) {
    return {
      canUpgrade: false,
      reason: 'Không thể nâng cấp khi nhóm có ô thế chấp',
      blockedReason: 'Không thể nâng cấp khi nhóm có ô thế chấp',
      hasMonopoly: true,
    };
  }

  const targetLevel = currentLevel + 1;
  const otherCells = groupCells.filter((c) => c.index !== cellIndex);
  const laggingCells = otherCells.filter((c) => {
    const lvl = params.propertyStates?.[c.index]?.level ?? params.levelMap?.[c.index] ?? 0;
    return lvl < currentLevel;
  });

  if (laggingCells.length > 0) {
    const names = laggingCells.map((c) => c.name).join(', ');
    const reason = `Quy tắc xây dựng đều tay: Cần nâng cấp ${names} trước khi xây C${targetLevel}`;
    return {
      canUpgrade: false,
      reason,
      blockedReason: reason,
      hasMonopoly: true,
    };
  }

  const upgradeCost = deed.upgradeCosts[currentLevel] ?? 0;
  const nextLevel = targetLevel as 1 | 2 | 3;

  if (balance < upgradeCost) {
    return {
      canUpgrade: false,
      reason: 'Số dư không đủ',
      blockedReason: 'Số dư không đủ',
      upgradeCost,
      nextLevel,
      hasMonopoly: true,
    };
  }

  return {
    canUpgrade: true,
    nextLevel,
    upgradeCost,
    hasMonopoly: true,
  };
}

const COLOR_GROUP_ORDER_WEIGHT: Record<ColorGroup, number> = {
  [ColorGroup.Nau]: 100,
  [ColorGroup.XanhDaTroi]: 200,
  [ColorGroup.Hong]: 300,
  [ColorGroup.Cam]: 400,
  [ColorGroup.Do]: 500,
  [ColorGroup.Vang]: 600,
  [ColorGroup.XanhLa]: 700,
  [ColorGroup.Tim]: 800,
};

/**
 * [IMP-188] Tính trọng số sắp xếp theo khu vực/cụm màu:
 * Nâu (100+) -> Xanh Da Trời (200+) -> Hồng (300+) -> Cam (400+) -> Đỏ (500+) -> Vàng (600+) -> Xanh Lá (700+) -> Tím (800+) -> Hạ Tầng/Railroad (900+) -> Tiện Ích (1000+).
 * Trong mỗi cụm, cộng thêm cellIndex để đảm bảo thứ tự tăng dần theo bàn cờ.
 */
export function getPropertySortWeight(cellIndex: number): number {
  const cell = BOARD_CONFIG[cellIndex];
  if (!cell) {
    return 9999 + cellIndex;
  }
  if (cell.colorGroup && COLOR_GROUP_ORDER_WEIGHT[cell.colorGroup] !== undefined) {
    return COLOR_GROUP_ORDER_WEIGHT[cell.colorGroup] + cellIndex;
  }
  if (cell.type === CellType.Railroad) {
    return 900 + cellIndex;
  }
  if (cell.type === CellType.Utility) {
    return 1000 + cellIndex;
  }
  return 9999 + cellIndex;
}

/**
 * [IMP-188] Sắp xếp danh sách cellIndex bất động sản theo nhóm khu vực địa lý bàn cờ.
 */
export function sortPropertiesByRegion(properties: readonly number[]): number[] {
  return [...properties].sort((a, b) => getPropertySortWeight(a) - getPropertySortWeight(b));
}
