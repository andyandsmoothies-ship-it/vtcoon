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
  readonly badge: string;
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
  [MarketCardId.MC_ALCOHOL_CHECK]: { label: 'GIẢM 50% THUÊ • PHẠT NỒNG ĐỘ CỒN', value: '-800 Tr.', variant: 'negative' },
  [MarketCardId.MC_RATE_HIKE]: { label: 'LÃI SUẤT VAY MỚI', value: '10% QUA GO', variant: 'warning' },
  [MarketCardId.MC_URBAN_PLANNING]: { label: 'ĐỊNH GIÁ TRUNG TÂM', value: '+20% THẾ CHẤP', variant: 'positive' },
  [MarketCardId.MC_NIGHT_ECONOMY]: { label: 'BÙNG NỔ DOANH THU', value: 'x2 THU TIỀN THUÊ', variant: 'positive' },
  [MarketCardId.MC_MEGA_CONCERT]: { label: 'HỘI TỤ ĐÁM ĐÔNG', value: 'TẬP HỢP TẤT CẢ', variant: 'info' },
  [MarketCardId.MC_CASINO_PILOT]: { label: 'TỔ HỢP CASINO', value: 'THƯỞNG ĐẾN 3.000 TR.', variant: 'positive' },
  [MarketCardId.MC_CREDIT_STIMULUS]: { label: 'ƯU ĐÃI XÂY DỰNG', value: '-20% XÂY DỰNG', variant: 'positive' },
  [MarketCardId.MC_LAND_FEVER]: { label: 'SỐT ĐẤT VÙNG VEN', value: '+50% THUÊ & GIÁ BÁN', variant: 'positive' },
  [MarketCardId.MC_FIRE_INSPECTION]: { label: 'THANH TRA PCCC', value: 'PHẠT C1-C3', variant: 'negative' },
  [MarketCardId.MC_PUBLIC_INVEST]: { label: 'HẠ TẦNG QUỐC GIA', value: '+400 TR. & x2 VẬN TẢI', variant: 'positive' },
  [MarketCardId.MC_ANTI_SPECULATE]: { label: 'THUẾ CHỐNG ĐẦU CƠ', value: 'THUẾ P2P 20%', variant: 'warning' },
  [MarketCardId.MC_PEAK_TOURISM]: { label: 'BỘI THU NGHỈ DƯỠNG', value: 'x2 TIỀN THUÊ RESORT', variant: 'positive' },
  [MarketCardId.MC_FREEZE_TRADE]: { label: 'HIỆU LỰC', value: 'CẤM THẾ CHẤP & ĐẤU GIÁ', variant: 'warning' },
  [MarketCardId.MC_UTILITY_DOUBLE]: { label: 'BIỂU GIÁ TIỆN ÍCH', value: 'x2 CƯỚC TIỆN ÍCH', variant: 'warning' },
  [MarketCardId.MC_COASTAL_STORM]: { label: 'THIÊN TAI BÃO LŨ', value: 'MIỄN 100% THUÊ', variant: 'warning' },

  // Chance Cards
  [ChanceCardId.CC_STOCK_PROFIT]: { label: 'LỢI NHUẬN ĐẦU TƯ', value: '+2.500 Tr.', variant: 'positive' },
  [ChanceCardId.CC_TAX_AUDIT]: { label: 'THANH TRA THUẾ', value: '-500 Tr. / ĐẤT TRỐNG', variant: 'negative' },
  [ChanceCardId.CC_DIPLOMATIC]: { label: 'MIỄN TRỪ NGOẠI GIAO', value: 'MIỄN 100% THUÊ', variant: 'positive' },
  [ChanceCardId.CC_SWAP_PROJECT]: { label: 'QUYỀN MUA LẠI', value: 'ĐỀN BÙ 130%', variant: 'info' },
  [ChanceCardId.CC_PLATE_AUCTION]: { label: 'ĐẶC QUYỀN ĐUA TỐC', value: '+1 LƯỢT ĐI', variant: 'positive' },
  [ChanceCardId.CC_CONTRACT_PENALTY]: { label: 'BỒI THƯỜNG VI PHẠM', value: '-1.000 Tr.', variant: 'negative' },
  [ChanceCardId.CC_LAND_CHANGE]: { label: 'QUY HOẠCH ĐÔ THỊ', value: 'LÊN CẤP 1 NGAY', variant: 'positive' },
  [ChanceCardId.CC_BUILD_HALT]: { label: 'ĐÌNH CHỈ KHAI THÁC', value: '-800 Tr. & ĐÓNG BĂNG', variant: 'negative' },
  [ChanceCardId.CC_MA_FORCE]: { label: 'THƯƠNG VỤ M&A', value: 'MUA LẠI 120%', variant: 'warning' },
  [ChanceCardId.CC_COPYRIGHT]: { label: 'ÁN PHẠT HÀNH CHÍNH', value: '-1.200 Tr.', variant: 'negative' },
  [ChanceCardId.CC_OVERDRAFT]: { label: 'GIẢI NGÂN TÍN DỤNG', value: '+3.000 Tr.', variant: 'positive' },
  [ChanceCardId.CC_JUNK_STOCK]: { label: 'CẮT LỖ ĐẦU CƠ', value: '-1.500 Tr.', variant: 'negative' },
  [ChanceCardId.CC_FRANCHISE]: { label: 'DOANH THU NHƯỢNG QUYỀN', value: '+800 Tr. / NGƯỜI', variant: 'positive' },
  [ChanceCardId.CC_LAND_RECLAIM]: { label: 'TIỀN BỒI HOÀN', value: 'NHẬN 150% SỔ ĐỎ', variant: 'positive' },
  [ChanceCardId.CC_VENUE_INCIDENT]: { label: 'KHẮC PHỤC SỰ CỐ', value: '-1.200 Tr.', variant: 'negative' },
  [ChanceCardId.CC_CONCERT_SPONSOR]: { label: 'TĂNG TỐC THẦN TỐC', value: 'x2 XÚC XẮC LƯỢT SAU', variant: 'positive' },
  [ChanceCardId.CC_FREE_CREDIT]: { label: 'VỐN ƯU ĐÃI', value: '+2.000 Tr.', variant: 'positive' },
  [ChanceCardId.CC_PORT_EXCLUSIVE]: { label: 'CỔ TỨC LOGISTICS', value: '+1.000 Tr.', variant: 'positive' },
  [ChanceCardId.CC_SLOW_BUILD]: { label: 'PHẠT CHẬM TIẾN ĐỘ', value: '-600 Tr.', variant: 'negative' },
  [ChanceCardId.CC_MEDIA_CRISIS]: { label: 'XỬ LÝ KHỦNG HOẢNG', value: '-800 Tr. & TẠM ĐÓNG CỬA', variant: 'negative' },
};

export const KNOWN_CARD_CTA_BUTTONS: Readonly<Record<string, string>> = {
  // Chance Cards
  [ChanceCardId.CC_PLATE_AUCTION]: 'Lên Xe Đi Tiếp! 🎲',
  [ChanceCardId.CC_TAX_AUDIT]: 'Nộp Truy Thu 💸',
  [ChanceCardId.CC_STOCK_PROFIT]: 'Bỏ Túi Ngay 💰',
  [ChanceCardId.CC_DIPLOMATIC]: 'Cất Vào Túi 🎴',
  [ChanceCardId.CC_CONTRACT_PENALTY]: 'Chấp Nhận Đền Bù 📉',
  [ChanceCardId.CC_LAND_CHANGE]: 'Duyệt Quy Hoạch 🏗️',
  [ChanceCardId.CC_BUILD_HALT]: 'Chấp Hành Thanh Tra ⚠️',
  [ChanceCardId.CC_MA_FORCE]: 'Ký Hợp Đồng M&A 🤝',
  [ChanceCardId.CC_COPYRIGHT]: 'Nộp Án Phạt 🏛️',
  [ChanceCardId.CC_OVERDRAFT]: 'Giải Ngân Ngay 💵',
  [ChanceCardId.CC_JUNK_STOCK]: 'Cắt Lỗ Ngay 💸',
  [ChanceCardId.CC_FRANCHISE]: 'Thu Tiền Bản Quyền ☕',
  [ChanceCardId.CC_LAND_RECLAIM]: 'Bàn Giao Mặt Bằng 🏗️',
  [ChanceCardId.CC_VENUE_INCIDENT]: 'Xử Lý Sự Cố 🛠️',
  [ChanceCardId.CC_CONCERT_SPONSOR]: 'Bùng Nổ Sân Khấu 🎤',
  [ChanceCardId.CC_FREE_CREDIT]: 'Rút Vốn Ngay 🏦',
  [ChanceCardId.CC_PORT_EXCLUSIVE]: 'Cập Cảng Nhận Tiền ⚓',
  [ChanceCardId.CC_SLOW_BUILD]: 'Cam Kết Tiến Độ 📋',
  [ChanceCardId.CC_MEDIA_CRISIS]: 'Dập Tắt Khủng Hoảng 🧯',
  [ChanceCardId.CC_SWAP_PROJECT]: 'Chốt Mua Dự Án 🤝',

  // Market Cards
  [MarketCardId.MC_NIGHT_ECONOMY]: 'Hòa Vào Phố Đêm 🍸',
  [MarketCardId.MC_MEGA_CONCERT]: 'Đi Xem Nhạc Hội 🎫',
  [MarketCardId.MC_ALCOHOL_CHECK]: 'Chấp Hành Kiểm Tra 🛑',
  [MarketCardId.MC_CASINO_PILOT]: 'Nhận Thưởng Ngay 🎰',
  [MarketCardId.MC_RATE_HIKE]: 'Thắt Chặt Chi Tiêu 🏦',
  [MarketCardId.MC_CREDIT_STIMULUS]: 'Tranh Thủ Nâng Cấp 🏗️',
  [MarketCardId.MC_LAND_FEVER]: 'Đón Sóng BĐS 🔥',
  [MarketCardId.MC_FIRE_INSPECTION]: 'Chấp Hành Nộp Phạt 🧯',
  [MarketCardId.MC_PUBLIC_INVEST]: 'Nhận Trợ Cấp Hạ Tầng 🚆',
  [MarketCardId.MC_ANTI_SPECULATE]: 'Chấp Hành Thuế Suất 🏛️',
  [MarketCardId.MC_PEAK_TOURISM]: 'Bội Thu Du Lịch 🏖️',
  [MarketCardId.MC_FREEZE_TRADE]: 'Bảo Toàn Tiền Mặt ❄️',
  [MarketCardId.MC_FUEL_SURGE]: 'Trả Phụ Phí Xăng ⛽',
  [MarketCardId.MC_URBAN_PLANNING]: 'Nắm Bắt Thời Cơ 🏙️',
  [MarketCardId.MC_UTILITY_DOUBLE]: 'Thanh Toán Hóa Đơn 💡',
  [MarketCardId.MC_COASTAL_STORM]: 'Chống Bão Khẩn Cấp 🌪️',
};

export function getCardCtaButtonText(cardId?: string): string {
  if (cardId && KNOWN_CARD_CTA_BUTTONS[cardId]) {
    return KNOWN_CARD_CTA_BUTTONS[cardId];
  }
  return 'Đã Hiểu / Tiếp Tục';
}

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
  if (typeof effectDelta === 'number') {
    if (cardId === ChanceCardId.CC_LAND_CHANGE) {
      if (effectDelta > 0) {
        return { label: 'TRỢ CẤP QUY HOẠCH', value: formatDeltaString(effectDelta), variant: 'positive' };
      }
      if (effectDelta < 0) {
        return { label: 'CHI PHÍ QUY HOẠCH', value: formatDeltaString(effectDelta), variant: 'positive' };
      }
    } else if (cardId === ChanceCardId.CC_TAX_AUDIT) {
      if (effectDelta !== 0) {
        return { label: 'THANH TRA THUẾ', value: formatDeltaString(effectDelta), variant: 'negative' };
      }
    } else if (cardId === ChanceCardId.CC_LAND_RECLAIM) {
      if (effectDelta > 0) {
        return { label: 'TIỀN BỒI HOÀN', value: formatDeltaString(effectDelta), variant: 'positive' };
      }
    } else if (cardId === ChanceCardId.CC_MA_FORCE) {
      if (effectDelta > 0) {
        return { label: 'TRỢ CẤP M&A', value: formatDeltaString(effectDelta), variant: 'positive' };
      }
      if (effectDelta < 0) {
        return { label: 'THƯƠNG VỤ M&A', value: formatDeltaString(effectDelta), variant: 'warning' };
      }
    } else if (cardId === ChanceCardId.CC_SWAP_PROJECT) {
      if (effectDelta > 0) {
        return { label: 'TRỢ CẤP DỰ ÁN', value: formatDeltaString(effectDelta), variant: 'positive' };
      }
      if (effectDelta < 0) {
        return { label: 'QUYỀN MUA LẠI', value: formatDeltaString(effectDelta), variant: 'warning' };
      }
    }
  }

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

export function cleanEventDescription(text?: string): string {
  if (!text) return '';
  const trimmed = text.trim();
  const colonIndex = trimmed.indexOf(':');
  if (colonIndex !== -1 && colonIndex < trimmed.length - 1) {
    const remainder = trimmed.slice(colonIndex + 1).trim();
    if (remainder.length > 0) {
      return remainder.charAt(0).toUpperCase() + remainder.slice(1);
    }
  }
  return trimmed;
}

export function isFinancialDestination(destination?: string, effectDelta?: number): boolean {
  if (!destination) return false;
  const lower = destination.toLowerCase().trim();
  if (!lower) return false;

  if (
    lower.includes('đóng băng') ||
    lower.includes('thanh khoản') ||
    lower.includes('bảo toàn') ||
    lower === 'toàn thị trường' ||
    lower === 'toàn bộ thị trường'
  ) {
    return false;
  }

  if (
    lower.includes('kho bạc') ||
    lower.includes('chủ sở hữu') ||
    lower.includes('chủ ô') ||
    lower.includes('đối thủ') ||
    lower.includes('người nghèo nhất') ||
    lower.includes('bồi thường') ||
    lower.includes('nộp phạt') ||
    lower.includes('chi thưởng') ||
    lower.includes('giải ngân')
  ) {
    return true;
  }

  if (lower.includes('tài khoản') || lower.includes('ngân sách')) {
    if (typeof effectDelta === 'number' && effectDelta !== 0) return true;
    if (lower.includes('cộng') || lower.includes('trừ') || lower.includes('chuyển')) return true;
  }

  return false;
}

export function getHeroStatStyles(variant: HeroStatVariant): HeroStatStyles {
  switch (variant) {
    case 'positive':
      return {
        container: 'bg-emerald-50 border-emerald-400 text-emerald-950',
        label: 'text-emerald-700',
        value: 'text-emerald-900',
        badge: 'bg-emerald-100 text-emerald-950 border border-emerald-400',
      };
    case 'negative':
      return {
        container: 'bg-rose-50 border-rose-400 text-rose-950',
        label: 'text-rose-700',
        value: 'text-rose-900',
        badge: 'bg-rose-100 text-rose-950 border border-rose-400',
      };
    case 'warning':
      return {
        container: 'bg-amber-50 border-amber-400 text-amber-950',
        label: 'text-amber-700',
        value: 'text-amber-900',
        badge: 'bg-amber-100 text-amber-950 border border-amber-400',
      };
    case 'info':
    default:
      return {
        container: 'bg-sky-50 border-sky-400 text-sky-950',
        label: 'text-sky-700',
        value: 'text-sky-900',
        badge: 'bg-sky-100 text-sky-950 border border-sky-400',
      };
  }
}
