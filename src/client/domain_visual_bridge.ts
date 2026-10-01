import { MarketCardId, ChanceCardId } from '../domain/event_card_types.js';
import { MacroCycleType } from '../domain/macro_cycle_types.js';
import type { ClientMarketModifier } from './store/game_store_types.js';

// [DIR-3]: Mở rộng kiểu nghiêm ngặt, triệt tiêu hoàn toàn dirty cast 'as any'
export type EventIdentifiable = MarketCardId | MacroCycleType | ChanceCardId | 'BUILD_HALT';

export interface EventVisualMeta {
  readonly icon: string;
  readonly label: string;
  readonly color: string;
  readonly isBuff: boolean;
}

export const EVENT_ICON_REGISTRY: Readonly<Record<EventIdentifiable, string>> = Object.freeze({
  // 16 Market Cards
  [MarketCardId.MC_FUEL_SURGE]: '⛽',
  [MarketCardId.MC_ALCOHOL_CHECK]: '🚨',
  [MarketCardId.MC_PEAK_TOURISM]: '🏖️',
  [MarketCardId.MC_NIGHT_ECONOMY]: '🌙',
  [MarketCardId.MC_MEGA_CONCERT]: '🎤',
  [MarketCardId.MC_CASINO_PILOT]: '🎰',
  [MarketCardId.MC_RATE_HIKE]: '📈',
  [MarketCardId.MC_CREDIT_STIMULUS]: '📉',
  [MarketCardId.MC_LAND_FEVER]: '🔥',
  [MarketCardId.MC_FIRE_INSPECTION]: '🧯',
  [MarketCardId.MC_PUBLIC_INVEST]: '🏗️',
  [MarketCardId.MC_ANTI_SPECULATE]: '⚖️',
  [MarketCardId.MC_FREEZE_TRADE]: '❄️',
  [MarketCardId.MC_URBAN_PLANNING]: '📐',
  [MarketCardId.MC_UTILITY_DOUBLE]: '⚡',
  [MarketCardId.MC_COASTAL_STORM]: '🌀',

  // 2 Macro Cycles
  [MacroCycleType.MACRO_LAND_FEVER]: '🌋',
  [MacroCycleType.MACRO_LIQUIDITY_FREEZE]: '🧊',

  // 20 Chance Cards & Aliases
  [ChanceCardId.CC_PORT_EXCLUSIVE]: '🚢',
  [ChanceCardId.CC_BUILD_HALT]: '🚧',
  BUILD_HALT: '🚧',
  [ChanceCardId.CC_MEDIA_CRISIS]: '📢',
  [ChanceCardId.CC_PLATE_AUCTION]: '🚘',
  [ChanceCardId.CC_TAX_AUDIT]: '📋',
  [ChanceCardId.CC_STOCK_PROFIT]: '📈',
  [ChanceCardId.CC_DIPLOMATIC]: '🤝',
  [ChanceCardId.CC_CONTRACT_PENALTY]: '📑',
  [ChanceCardId.CC_LAND_CHANGE]: '📜',
  [ChanceCardId.CC_MA_FORCE]: '🏢',
  [ChanceCardId.CC_COPYRIGHT]: '⚖️',
  [ChanceCardId.CC_OVERDRAFT]: '💳',
  [ChanceCardId.CC_JUNK_STOCK]: '📉',
  [ChanceCardId.CC_FRANCHISE]: '🏪',
  [ChanceCardId.CC_LAND_RECLAIM]: '🏗️',
  [ChanceCardId.CC_VENUE_INCIDENT]: '🚨',
  [ChanceCardId.CC_CONCERT_SPONSOR]: '🎵',
  [ChanceCardId.CC_FREE_CREDIT]: '🎁',
  [ChanceCardId.CC_SLOW_BUILD]: '⏳',
  [ChanceCardId.CC_SWAP_PROJECT]: '🔄',
});

// [R4-DIR-1]: Type Predicate Guard & Safe Resolver (Zero Dirty Casts)
export function isEventIdentifiable(id: string): id is EventIdentifiable {
  return Object.prototype.hasOwnProperty.call(EVENT_ICON_REGISTRY, id);
}

export function resolveEventIcon(id: string): string {
  return isEventIdentifiable(id) ? EVENT_ICON_REGISTRY[id] : '🎴';
}

// [DIR-2]: Bổ sung đầy đủ canonical multiplier fallback cho toàn bộ thẻ có tác động tiền thuê
export const CANONICAL_MULTIPLIERS: Partial<Record<EventIdentifiable, number>> = Object.freeze({
  [MacroCycleType.MACRO_LAND_FEVER]: 2.5,
  [MacroCycleType.MACRO_LIQUIDITY_FREEZE]: 0.5,
  [MarketCardId.MC_LAND_FEVER]: 2,
  [MarketCardId.MC_PEAK_TOURISM]: 2,
  [MarketCardId.MC_PUBLIC_INVEST]: 2,
  [MarketCardId.MC_UTILITY_DOUBLE]: 2,
  [MarketCardId.MC_NIGHT_ECONOMY]: 2,
  [MarketCardId.MC_ALCOHOL_CHECK]: 0.5,
  [MarketCardId.MC_COASTAL_STORM]: 0,
});

export type ModifierVisualInput = ClientMarketModifier | {
  readonly type?: string;
  readonly remainingRounds?: number;
  readonly affectedCells?: readonly number[];
  readonly multiplier?: number;
  readonly beneficiaryId?: string;
};

export function deriveModifierVisual(modifier: ModifierVisualInput): EventVisualMeta {
  const cardType = String(modifier.type ?? '');
  const icon = resolveEventIcon(cardType);

  // [DIR-1]: Đưa 100% các nhánh kiểm tra thẻ đặc thù lên trước khối multiplier tổng quát!
  // 1.1. Cước cảng: Quyền lợi thụ hưởng 50% phí cảng (KHÔNG ĐƯỢC tính thành giảm tiền thuê)
  if (cardType === ChanceCardId.CC_PORT_EXCLUSIVE || modifier.beneficiaryId !== undefined) {
    return { icon, label: 'Hưởng 50%', color: '#F59E0B', isBuff: true };
  }

  // 1.2. Đóng băng thanh khoản vĩ mô: Sắc xanh băng giá #06B6D4
  if (cardType === MacroCycleType.MACRO_LIQUIDITY_FREEZE) {
    return { icon, label: 'Thuê -50%', color: '#06B6D4', isBuff: false };
  }

  // 1.3. Phụ phí xăng dầu hạ tầng
  if (cardType === MarketCardId.MC_FUEL_SURGE) {
    return { icon, label: '+500 Phí', color: '#EF4444', isBuff: false };
  }

  // 1.4. Đô thị trung tâm thế chấp ưu đãi
  if (cardType === MarketCardId.MC_URBAN_PLANNING) {
    return { icon, label: 'Thế chấp 60%', color: '#F59E0B', isBuff: true };
  }

  // 1.5. Đình chỉ công trình
  if (cardType === ChanceCardId.CC_BUILD_HALT || cardType === 'BUILD_HALT') {
    return { icon: '🚧', label: 'Đình chỉ', color: '#EF4444', isBuff: false };
  }

  // 1.6. Khủng hoảng truyền thông
  if (cardType === ChanceCardId.CC_MEDIA_CRISIS) {
    return { icon: '📢', label: 'Đình chỉ', color: '#EF4444', isBuff: false };
  }

  // 2. Suy diễn động theo hệ số multiplier tiền thuê thực tế
  const mult = typeof modifier.multiplier === 'number' 
    ? modifier.multiplier 
    : (isEventIdentifiable(cardType) ? CANONICAL_MULTIPLIERS[cardType] : undefined);

  if (typeof mult === 'number') {
    if (mult === 0) {
      return { icon, label: 'Miễn thuê', color: '#EF4444', isBuff: false };
    }
    if (mult < 1) {
      const discountPct = Math.round((1 - mult) * 100);
      return { icon, label: `-${discountPct}%`, color: '#EF4444', isBuff: false };
    }
    if (mult > 1) {
      const formattedMult = Number.isInteger(mult) ? mult.toString() : mult.toFixed(1);
      return { icon, label: `x${formattedMult} Thuê`, color: '#F59E0B', isBuff: true };
    }
  }

  // 3. Fallback an toàn trung tính: Màu xám slate #94A3B8, isBuff: false
  return { icon, label: 'Hiệu lực', color: '#94A3B8', isBuff: false };
}
