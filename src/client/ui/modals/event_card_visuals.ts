// [IMP-134] Event Card Visuals — Themed emojis, hero stat formatting & sanitizers for Fintech Card overhaul
import { MarketCardId, ChanceCardId } from '../../../domain/event_card_types.js';
import { formatCurrency } from '../ui_helpers.js';

export type HeroStatVariant = 'positive' | 'negative' | 'warning' | 'info';

export interface HeroStat {
  readonly label: string;
  readonly value: string;
  readonly variant: HeroStatVariant;
}

export interface HeroStatStyles {
  readonly container: string;
  readonly label: string;
  readonly value: string;
}

const THEMED_EMOJIS: Readonly<Record<string, string>> = {
  // Market cards
  [MarketCardId.MC_FUEL_SURGE]: '⛽',
  [MarketCardId.MC_ALCOHOL_CHECK]: '🚨',
  [MarketCardId.MC_PEAK_TOURISM]: '🏖️',
  [MarketCardId.MC_NIGHT_ECONOMY]: '🍸',
  [MarketCardId.MC_MEGA_CONCERT]: '🎤',
  [MarketCardId.MC_CASINO_PILOT]: '🎰',
  [MarketCardId.MC_RATE_HIKE]: '📈',
  [MarketCardId.MC_CREDIT_STIMULUS]: '🏦',
  [MarketCardId.MC_LAND_FEVER]: '🔥',
  [MarketCardId.MC_FIRE_INSPECTION]: '🧯',
  [MarketCardId.MC_PUBLIC_INVEST]: '🏗️',
  [MarketCardId.MC_ANTI_SPECULATE]: '🛡️',
  [MarketCardId.MC_FREEZE_TRADE]: '❄️',
  [MarketCardId.MC_URBAN_PLANNING]: '🏙️',
  [MarketCardId.MC_UTILITY_DOUBLE]: '💡',
  [MarketCardId.MC_COASTAL_STORM]: '🌪️',

  // Chance cards
  [ChanceCardId.CC_PLATE_AUCTION]: '🚘',
  [ChanceCardId.CC_TAX_AUDIT]: '📋',
  [ChanceCardId.CC_STOCK_PROFIT]: '📈',
  [ChanceCardId.CC_DIPLOMATIC]: '🤝',
  [ChanceCardId.CC_CONTRACT_PENALTY]: '📑',
  [ChanceCardId.CC_LAND_CHANGE]: '📜',
  [ChanceCardId.CC_BUILD_HALT]: '🚧',
  [ChanceCardId.CC_MA_FORCE]: '🏢',
  [ChanceCardId.CC_COPYRIGHT]: '⚖️',
  [ChanceCardId.CC_OVERDRAFT]: '💳',
  [ChanceCardId.CC_JUNK_STOCK]: '📉',
  [ChanceCardId.CC_FRANCHISE]: '🏪',
  [ChanceCardId.CC_LAND_RECLAIM]: '🏗️',
  [ChanceCardId.CC_VENUE_INCIDENT]: '🚨',
  [ChanceCardId.CC_CONCERT_SPONSOR]: '🎵',
  [ChanceCardId.CC_FREE_CREDIT]: '🎁',
  [ChanceCardId.CC_PORT_EXCLUSIVE]: '🚢',
  [ChanceCardId.CC_SLOW_BUILD]: '⏳',
  [ChanceCardId.CC_MEDIA_CRISIS]: '📢',
  [ChanceCardId.CC_SWAP_PROJECT]: '🔄',
};

const KNOWN_HERO_STATS: Readonly<Record<string, HeroStat>> = {
  // Market Cards
  [MarketCardId.MC_FUEL_SURGE]: { label: 'PHỤ PHÍ NHIÊN LIỆU', value: '-500 Tr.', variant: 'negative' },
  [MarketCardId.MC_ALCOHOL_CHECK]: { label: 'PHẠT NỒNG ĐỘ CỒN', value: '-800 Tr.', variant: 'negative' },
  [MarketCardId.MC_RATE_HIKE]: { label: 'LÃI SUẤT VAY', value: '10% QUA GO', variant: 'warning' },
  [MarketCardId.MC_URBAN_PLANNING]: { label: 'QUY HOẠCH ĐÔ THỊ', value: '+20% THẾ CHẤP', variant: 'positive' },
  [MarketCardId.MC_NIGHT_ECONOMY]: { label: 'KINH TẾ BAN ĐÊM', value: 'x2 TIỀN THUÊ', variant: 'positive' },
  [MarketCardId.MC_MEGA_CONCERT]: { label: 'ĐẠI NHẠC HỘI', value: 'TỤ HỘI KHÁCH', variant: 'info' },
  [MarketCardId.MC_CASINO_PILOT]: { label: 'THÍ ĐIỂM CASINO', value: '+3.000 Tr.', variant: 'positive' },
  [MarketCardId.MC_CREDIT_STIMULUS]: { label: 'KÍCH CẦU TÍN DỤNG', value: '-20% XÂY DỰNG', variant: 'positive' },
  [MarketCardId.MC_LAND_FEVER]: { label: 'SỐT ĐẤT VÙNG VEN', value: '+50% GIÁ TRỊ', variant: 'positive' },
  [MarketCardId.MC_FIRE_INSPECTION]: { label: 'THANH TRA PCCC', value: 'PHẠT C1-C3', variant: 'negative' },
  [MarketCardId.MC_PUBLIC_INVEST]: { label: 'ĐẦU TƯ CÔNG', value: '+400 Tr. & x2', variant: 'positive' },
  [MarketCardId.MC_ANTI_SPECULATE]: { label: 'THUẾ CHỐNG ĐẦU CƠ', value: '20% GIAO DỊCH', variant: 'warning' },
  [MarketCardId.MC_PEAK_TOURISM]: { label: 'CAO ĐIỂM DU LỊCH', value: 'x2 PHÍ NGHỈ DƯỠNG', variant: 'positive' },
  [MarketCardId.MC_FREEZE_TRADE]: { label: 'ĐÓNG BĂNG THỊ TRƯỜNG', value: 'CẤM THẾ CHẤP', variant: 'warning' },
  [MarketCardId.MC_UTILITY_DOUBLE]: { label: 'GIÁ ĐIỆN & CƯỚC PHÍ', value: 'x2 TIỆN ÍCH', variant: 'warning' },
  [MarketCardId.MC_COASTAL_STORM]: { label: 'BÃO LŨ DUYÊN HẢI', value: 'MIỄN 100% THUÊ', variant: 'warning' },

  // Chance Cards
  [ChanceCardId.CC_STOCK_PROFIT]: { label: 'CHỐT LỜI CỔ PHIẾU', value: '+2.500 Tr.', variant: 'positive' },
  [ChanceCardId.CC_TAX_AUDIT]: { label: 'THANH TRA THUẾ', value: '-500 Tr. / ĐẤT TRỐNG', variant: 'negative' },
  [ChanceCardId.CC_DIPLOMATIC]: { label: 'MIỄN TRỪ NGOẠI GIAO', value: 'MIỄN 100% THUÊ', variant: 'positive' },
  [ChanceCardId.CC_SWAP_PROJECT]: { label: 'MUA LẠI DỰ ÁN', value: 'ĐỀN BÙ 130%', variant: 'info' },
  [ChanceCardId.CC_PLATE_AUCTION]: { label: 'ĐẤU GIÁ BIỂN SỐ', value: '+1 LƯỢT ĐI', variant: 'positive' },
  [ChanceCardId.CC_CONTRACT_PENALTY]: { label: 'BỒI THƯỜNG HỢP ĐỒNG', value: '-1.000 Tr.', variant: 'negative' },
  [ChanceCardId.CC_LAND_CHANGE]: { label: 'CHUYỂN MỤC ĐÍCH ĐẤT', value: 'LÊN THỔ CƯ', variant: 'positive' },
  [ChanceCardId.CC_BUILD_HALT]: { label: 'ĐÌNH CHỈ XÂY DỰNG', value: '-800 Tr.', variant: 'negative' },
  [ChanceCardId.CC_MA_FORCE]: { label: 'THƯƠNG VỤ M&A', value: 'THÔN TÍNH C0', variant: 'warning' },
  [ChanceCardId.CC_COPYRIGHT]: { label: 'VI PHẠM BẢN QUYỀN', value: '-1.200 Tr.', variant: 'negative' },
  [ChanceCardId.CC_OVERDRAFT]: { label: 'THẤU CHI DOANH NGHIỆP', value: '+3.000 Tr.', variant: 'positive' },
  [ChanceCardId.CC_JUNK_STOCK]: { label: 'CỔ PHIẾU ĐẦU CƠ', value: '-1.500 Tr.', variant: 'negative' },
  [ChanceCardId.CC_FRANCHISE]: { label: 'NHƯỢNG QUYỀN F&B', value: '+800 Tr.', variant: 'positive' },
  [ChanceCardId.CC_LAND_RECLAIM]: { label: 'THU HỒI ĐẤT', value: 'ĐỀN BÙ 150%', variant: 'positive' },
  [ChanceCardId.CC_VENUE_INCIDENT]: { label: 'SỰ CỐ AN NINH', value: '-1.200 Tr.', variant: 'negative' },
  [ChanceCardId.CC_CONCERT_SPONSOR]: { label: 'TÀI TRỢ NHẠC HỘI', value: 'x2 XÚC XẮC', variant: 'positive' },
  [ChanceCardId.CC_FREE_CREDIT]: { label: 'TÍN DỤNG ƯU ĐÃI', value: '+2.000 Tr.', variant: 'positive' },
  [ChanceCardId.CC_PORT_EXCLUSIVE]: { label: 'ĐỘC QUYỀN CẢNG BIỂN', value: '+1.000 Tr.', variant: 'positive' },
  [ChanceCardId.CC_SLOW_BUILD]: { label: 'TIẾN ĐỘ CHẬM', value: '-600 Tr.', variant: 'negative' },
  [ChanceCardId.CC_MEDIA_CRISIS]: { label: 'KHỦNG HOẢNG TRUYỀN THÔNG', value: '-800 Tr.', variant: 'negative' },
};

function formatDeltaString(delta: number): string {
  const formatted = formatCurrency(delta);
  if (delta > 0 && !formatted.startsWith('+')) {
    return `+${formatted}`;
  }
  return formatted;
}

export function getCardThemedEmoji(cardId: string, cardType: 'chance' | 'market'): string {
  if (cardId && THEMED_EMOJIS[cardId]) {
    return THEMED_EMOJIS[cardId];
  }
  return cardType === 'market' ? '📰' : '⚡';
}

export function getCardHeroStat(cardId: string, effectDelta?: number): HeroStat {
  const base = KNOWN_HERO_STATS[cardId];
  if (base) {
    if (typeof effectDelta === 'number' && effectDelta !== 0) {
      const isSpecialNonCurrency =
        base.value.includes('%') ||
        base.value.includes('Ô') ||
        base.value.includes('LƯỢT') ||
        base.value.includes('x2') ||
        base.value.includes('ĐẤT TRỐNG');
      if (!isSpecialNonCurrency) {
        return {
          label: base.label,
          value: formatDeltaString(effectDelta),
          variant: effectDelta > 0 ? 'positive' : 'negative',
        };
      }
    }
    return base;
  }

  if (typeof effectDelta === 'number' && effectDelta !== 0) {
    return {
      label: effectDelta > 0 ? 'BIẾN ĐỘNG TÀI CHÍNH' : 'KHOẢN NỘP PHẠT',
      value: formatDeltaString(effectDelta),
      variant: effectDelta > 0 ? 'positive' : 'negative',
    };
  }

  return {
    label: 'HIỆU ỨNG ĐẶC BIỆT',
    value: 'KÍCH HOẠT',
    variant: 'info',
  };
}

export function sanitizeTargetScope(scope?: string): string {
  if (!scope) return '';
  return scope.replace(/\s*\([ÔO0-9,\s]+\)/gi, '').trim();
}

export function sanitizeDestination(destination?: string): string {
  if (!destination) return '';
  const lower = destination.toLowerCase();
  if (lower.includes('kho bạc')) return 'Kho Bạc Nhà Nước';
  if (lower.includes('chủ sở hữu') || lower.includes('chủ ô')) return 'Chủ Sở Hữu Ô';
  if (lower.includes('tài khoản') || lower.includes('cá nhân')) return 'Tài Khoản Cá Nhân';
  return destination.trim();
}

export function getHeroStatStyles(variant: HeroStatVariant): HeroStatStyles {
  switch (variant) {
    case 'positive':
      return {
        container: 'bg-emerald-50 border-emerald-400 text-emerald-950',
        label: 'text-emerald-700',
        value: 'text-emerald-900',
      };
    case 'negative':
      return {
        container: 'bg-rose-50 border-rose-400 text-rose-950',
        label: 'text-rose-700',
        value: 'text-rose-900',
      };
    case 'warning':
      return {
        container: 'bg-amber-50 border-amber-400 text-amber-950',
        label: 'text-amber-700',
        value: 'text-amber-900',
      };
    case 'info':
    default:
      return {
        container: 'bg-sky-50 border-sky-400 text-sky-950',
        label: 'text-sky-700',
        value: 'text-sky-900',
      };
  }
}
