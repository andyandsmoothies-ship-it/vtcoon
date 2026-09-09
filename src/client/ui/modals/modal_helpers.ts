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
 * Tính 3 bước giá tăng dần (+50, +100, +200 Tr.) từ mức giá hiện tại.
 * Tự động chuẩn hóa giá âm hoặc không hợp lệ về 0.
 */
export function calculateAuctionIncrements(currentBid: number): [number, number, number] {
  const safeBid = Number.isFinite(currentBid) && currentBid >= 0 ? Math.floor(currentBid) : 0;
  return [safeBid + 50, safeBid + 100, safeBid + 200];
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
