// [UC-GAME-020/MSS][UC-GAME-027/MSS][UC-GAME-028/MSS] Property Data — Static deeds, state types, constants
// Extracted from property_manager.ts — Slice 06 refactor (DEBT-S06-05)

import { CellType, BOARD_CONFIG } from './board_config';

// --- Kieu du lieu ---

export interface PropertyDeed {
  readonly price: number;
  readonly rent0: number;
  readonly rent1?: number;
  readonly rent2?: number;
  readonly rent3?: number;
  readonly upgradeCosts?: readonly [number, number, number];
}

export type PropertyRegistry = Map<number, string>;

// --- Bang gia 28 o tai san (Nguon: entity_model.md) ---

export const PROPERTY_DEEDS: ReadonlyMap<number, PropertyDeed> = new Map([
  // Nâu — Đô thị: C0=10%, C1=35%, C2=90%, C3=220%; UC=[50%,75%,100%]
  [1,  { price:  600, rent0:  60, rent1:  210, rent2:  540, rent3: 1320, upgradeCosts: [300, 450, 600] }],
  [3,  { price:  600, rent0:  60, rent1:  210, rent2:  540, rent3: 1320, upgradeCosts: [300, 450, 600] }],
  // Railroad — không có rent1/2/3 (phí lũy tiến theo số ô)
  [5,  { price: 2000, rent0: 500 }],
  [15, { price: 2000, rent0: 500 }],
  [25, { price: 2000, rent0: 500 }],
  [35, { price: 2000, rent0: 500 }],
  // Xanh Da Trời — Dịch vụ: C0=12%, C1=40%, C2=100%, C3=250%; UC=[50%,70%,100%]
  [6,  { price: 1000, rent0: 120, rent1:  400, rent2: 1000, rent3: 2500, upgradeCosts: [500, 700, 1000] }],
  [8,  { price: 1000, rent0: 120, rent1:  400, rent2: 1000, rent3: 2500, upgradeCosts: [500, 700, 1000] }],
  // Xanh Da Trời — Nghỉ dưỡng: C0=10%, C1=30%, C2=80%, C3=250%; UC=[45%,70%,120%]
  [9,  { price: 1200, rent0: 120, rent1:  360, rent2:  960, rent3: 3000, upgradeCosts: [540, 840, 1440] }],
  // Utility — không có rent1/2/3 (phí biến thiên 2D6)
  [12, { price: 1500, rent0: 280 }],
  [28, { price: 1500, rent0: 280 }],
  // Hồng — Nghỉ dưỡng: C0=10%, C1=30%, C2=80%, C3=250%; UC=[45%,70%,120%]
  [11, { price: 1400, rent0: 140, rent1:  420, rent2: 1120, rent3: 3500, upgradeCosts: [630, 980, 1680] }],
  [13, { price: 1400, rent0: 140, rent1:  420, rent2: 1120, rent3: 3500, upgradeCosts: [630, 980, 1680] }],
  [14, { price: 1600, rent0: 160, rent1:  480, rent2: 1280, rent3: 4000, upgradeCosts: [720, 1120, 1920] }],
  // Cam — Nghỉ dưỡng ô 16,18 + Đô thị ô 19
  [16, { price: 1800, rent0: 180, rent1:  540, rent2: 1440, rent3: 4500, upgradeCosts: [810, 1260, 2160] }],
  [18, { price: 1800, rent0: 180, rent1:  540, rent2: 1440, rent3: 4500, upgradeCosts: [810, 1260, 2160] }],
  [19, { price: 2000, rent0: 200, rent1:  700, rent2: 1800, rent3: 4400, upgradeCosts: [1000, 1500, 2000] }],
  // Đỏ — Nghỉ dưỡng ô 21,24 + Đô thị ô 23
  [21, { price: 2200, rent0: 220, rent1:  660, rent2: 1760, rent3: 5500, upgradeCosts: [990, 1540, 2640] }],
  [23, { price: 2200, rent0: 220, rent1:  770, rent2: 1980, rent3: 4840, upgradeCosts: [1100, 1650, 2200] }],
  [24, { price: 2400, rent0: 240, rent1:  720, rent2: 1920, rent3: 6000, upgradeCosts: [1080, 1680, 2880] }],
  // Vàng — Dịch vụ ô 26,27 + Nghỉ dưỡng ô 29
  [26, { price: 2600, rent0: 312, rent1: 1040, rent2: 2600, rent3: 6500, upgradeCosts: [1300, 1820, 2600] }],
  [27, { price: 2600, rent0: 312, rent1: 1040, rent2: 2600, rent3: 6500, upgradeCosts: [1300, 1820, 2600] }],
  [29, { price: 2800, rent0: 280, rent1:  840, rent2: 2240, rent3: 7000, upgradeCosts: [1260, 1960, 3360] }],
  // Xanh Lá — Đô thị: C0=10%, C1=35%, C2=90%, C3=220%; UC=[50%,75%,100%]
  [31, { price: 3000, rent0: 300, rent1: 1050, rent2: 2700, rent3: 6600, upgradeCosts: [1500, 2250, 3000] }],
  [32, { price: 3000, rent0: 300, rent1: 1050, rent2: 2700, rent3: 6600, upgradeCosts: [1500, 2250, 3000] }],
  [34, { price: 3200, rent0: 320, rent1: 1120, rent2: 2880, rent3: 7040, upgradeCosts: [1600, 2400, 3200] }],
  // Tím — Đô thị: C0=10%, C1=35%, C2=90%, C3=220%; UC=[50%,75%,100%]
  [37, { price: 3500, rent0: 350, rent1: 1225, rent2: 3150, rent3: 7700, upgradeCosts: [1750, 2625, 3500] }],
  [39, { price: 4000, rent0: 400, rent1: 1400, rent2: 3600, rent3: 8800, upgradeCosts: [2000, 3000, 4000] }],
]);

// --- O co the mua duoc ---

const PURCHASABLE: ReadonlySet<CellType> = new Set([
  CellType.Property,
  CellType.Railroad,
  CellType.Utility,
]);

export function isPurchasable(cellIndex: number): boolean {
  const cell = BOARD_CONFIG[cellIndex];
  return cell !== undefined && PURCHASABLE.has(cell.type);
}

// --- PropertyState types ---

export interface PropertyState {
  level: number;
  isETC?: boolean;
  isUpgradedUtility?: boolean;
  unbuiltRounds?: number;
  isMortgaged?: boolean;
}
export type PropertyStateMap = Map<number, PropertyState>;

// --- Hang so ---

export const RAILROAD_CELLS = [5, 15, 25, 35] as const;
export const RAILROAD_FEES: Record<number, number> = { 1: 500, 2: 1000, 3: 2000, 4: 4000 };
export const UTILITY_CELLS = [12, 28] as const;
export const ETC_COST_PER_CELL = 1500;
export const UTILITY_UPGRADE_COST = 1000;
