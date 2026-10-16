// [IMP-411] MarketEventHelpers — Pure calculation and formatting seam for market events & macro cycles
// Decoupled from React JSX presentation to eliminate circular dependency [SCC-6]
import { MarketCardId, ChanceCardId } from '../../domain/event_card_types.js';
import { MARKET_CARD_DETAILS, CHANCE_CARD_DETAILS } from '../../domain/event_card_metadata.js';
import { vi as viTranslations } from '../../domain/i18n/vi.js';
import { resolveEventIcon } from '../domain_visual_bridge.js';

export function resolveMarketIcon(type: string): string {
  return resolveEventIcon(type);
}

export const ALL_MARKET_TITLES: Readonly<Record<string, string>> = {
  ...viTranslations.macroCycles,
  ...viTranslations.marketCards,
  ...viTranslations.chanceCards,
};

export function resolveMarketTitle(type: string): string {
  return ALL_MARKET_TITLES[type] ?? (type || 'Sự Kiện Thị Trường');
}

export function resolveMarketShortTag(type: string): string {
  switch (type) {
    case 'MACRO_LAND_FEVER': return 'Sốt Đất';
    case 'MACRO_LIQUIDITY_FREEZE': return 'Đóng Băng';
    case MarketCardId.MC_PUBLIC_INVEST: return 'Đầu Tư Công';
    case MarketCardId.MC_COASTAL_STORM: return 'Bão Lũ';
    case MarketCardId.MC_NIGHT_ECONOMY: return 'Dịch Vụ Đêm';
    case MarketCardId.MC_ALCOHOL_CHECK: return 'Nồng Độ Cồn';
    case MarketCardId.MC_MEGA_CONCERT: return 'Đại Nhạc Hội';
    case MarketCardId.MC_RATE_HIKE: return 'Tăng Lãi Suất';
    case MarketCardId.MC_CREDIT_STIMULUS: return 'Kích Cầu';
    case MarketCardId.MC_LAND_FEVER: return 'Sốt Ven Đô';
    case MarketCardId.MC_FIRE_INSPECTION: return 'Kiểm Tra PCCC';
    case MarketCardId.MC_ANTI_SPECULATE: return 'Chống Đầu Cơ';
    case MarketCardId.MC_PEAK_TOURISM: return 'Mùa Du Lịch';
    case MarketCardId.MC_FREEZE_TRADE: return 'Đóng Băng GD';
    case MarketCardId.MC_FUEL_SURGE: return 'Tăng Giá Xăng';
    case MarketCardId.MC_URBAN_PLANNING: return 'Quy Hoạch';
    case MarketCardId.MC_UTILITY_DOUBLE: return 'Biểu Giá Điện';
    case MarketCardId.MC_CASINO_PILOT: return 'Casino';
    case ChanceCardId.CC_PORT_EXCLUSIVE: return 'Cảng Biển';
    default: return 'Sự Kiện';
  }
}

export const ACTIVE_MARKET_EFFECT_SUMMARIES: Readonly<Record<string, string>> = {
  MACRO_LAND_FEVER:
    'Sốt đất vĩ mô: Thuê x2.5 (+150%) và giảm 25% chi phí xây dựng cho nhóm màu.',
  MACRO_LIQUIDITY_FREEZE:
    'Đóng băng thanh khoản: Giảm 50% tiền thuê và cấm thế chấp BĐS trong nhóm màu.',
  [MarketCardId.MC_PUBLIC_INVEST]:
    'Nhân đôi cước vận tải tại 4 Ga Tàu trên toàn bàn cờ.',
  [MarketCardId.MC_COASTAL_STORM]:
    'Miễn 100% tiền thuê tại các ô ven biển; dừng chân mất lượt.',
  [MarketCardId.MC_NIGHT_ECONOMY]:
    'Nhân đôi tiền thuê tại các ô Dịch Vụ từ Cấp 1 trở lên.',
  [MarketCardId.MC_ALCOHOL_CHECK]:
    'Giảm 50% tiền thuê ô Dịch Vụ; dừng chân phạt 800 và mất lượt.',
  [MarketCardId.MC_MEGA_CONCERT]:
    'Mọi người chơi lập tức di chuyển đến ô Dịch Vụ có cấp nhà cao nhất.',
  [MarketCardId.MC_RATE_HIKE]:
    'Tăng 20% chi phí xây nhà C1-C3 và thu lãi vay thế chấp 10% khi qua GO.',
  [MarketCardId.MC_CREDIT_STIMULUS]:
    'Giảm 20% chi phí xây nhà C1-C3 và miễn 100% lãi suất vay thế chấp.',
  [MarketCardId.MC_LAND_FEVER]:
    'Nhân đôi tiền thuê (x2) & giá chuyển nhượng (Bình Dương, Đồng Nai, Hưng Yên).',
  [MarketCardId.MC_FIRE_INSPECTION]:
    'Phạt 200/C1, 400/C2, 800/C3 nộp Kho Bạc. Đất C0 miễn phạt.',
  [MarketCardId.MC_ANTI_SPECULATE]:
    'Áp thuế chuyển nhượng bất động sản P2P 20% nộp vào Kho Bạc.',
  [MarketCardId.MC_PEAK_TOURISM]:
    'Nhân đôi doanh thu tiền thuê tại toàn bộ các ô BĐS Nghỉ Dưỡng.',
  [MarketCardId.MC_FREEZE_TRADE]:
    'Tạm ngưng mua ô đất mới, đóng băng đấu giá và cấm chuyển nhượng P2P.',
  [MarketCardId.MC_FUEL_SURGE]:
    'Phụ thu thêm 500 cước vận tải tại 4 Ga Tàu toàn bàn cờ.',
  [MarketCardId.MC_URBAN_PLANNING]:
    'Nhân 1.5x tiền thuê & tăng 20% giá trị khi thế chấp BĐS Hà Nội & TP.HCM.',
  [MarketCardId.MC_UTILITY_DOUBLE]:
    'Nhân đôi phí dịch vụ tiện ích công cộng (EVN và Viettel).',
  [MarketCardId.MC_CASINO_PILOT]:
    'Thưởng 1.500/ô Dịch Vụ C2+, 3.000/ô 27 C3 (hoặc trợ cấp 1.000).',
  [ChanceCardId.CC_PORT_EXCLUSIVE]:
    'Trích nhận 50% phí cảng từ người chơi dừng chân tại các ô Cảng biển.',
};

export function resolveMarketEffectSummary(type: string): string {
  const explicit = ACTIVE_MARKET_EFFECT_SUMMARIES[type];
  if (explicit) {
    return explicit;
  }
  const detail =
    MARKET_CARD_DETAILS[type as MarketCardId] ??
    CHANCE_CARD_DETAILS[type as ChanceCardId];
  if (!detail) {
    return 'Chính sách vĩ mô tác động toàn bộ thị trường';
  }
  const colonIndex = detail.description.indexOf(': ');
  if (colonIndex !== -1 && colonIndex < detail.description.length - 2) {
    return detail.description.slice(colonIndex + 2).trim();
  }
  return detail.description || detail.effectDetail || 'Chính sách vĩ mô tác động toàn bộ thị trường';
}

export const ACTIVE_MARKET_COMPACT_FORMULAS: Readonly<Record<string, string>> = {
  MACRO_LAND_FEVER: 'Thuê x2.5, Xây nhà -25%',
  MACRO_LIQUIDITY_FREEZE: 'Thuê -50%, Cấm thế chấp',
  [MarketCardId.MC_PUBLIC_INVEST]: '4 Ga Tàu: Nhân đôi cước',
  [MarketCardId.MC_COASTAL_STORM]: 'Ven biển: Miễn thuê, mất lượt',
  [MarketCardId.MC_NIGHT_ECONOMY]: 'Dịch vụ C1+: Cước thuê x2',
  [MarketCardId.MC_ALCOHOL_CHECK]: 'Dịch vụ: Thuê -50%, Phạt 800',
  [MarketCardId.MC_MEGA_CONCERT]: 'Đến ô Dịch vụ cấp cao nhất',
  [MarketCardId.MC_RATE_HIKE]: 'Xây nhà +20%, Lãi vay 10%',
  [MarketCardId.MC_CREDIT_STIMULUS]: 'Xây nhà -20%, Miễn lãi vay',
  [MarketCardId.MC_LAND_FEVER]: 'Ven đô: Cước thuê x2',
  [MarketCardId.MC_FIRE_INSPECTION]: 'Phạt PCCC 200 - 800 Tr.',
  [MarketCardId.MC_ANTI_SPECULATE]: 'Thuế chuyển nhượng P2P 20%',
  [MarketCardId.MC_PEAK_TOURISM]: 'Nghỉ dưỡng: Nhân đôi thuê',
  [MarketCardId.MC_FREEZE_TRADE]: 'Cấm mua đất, đấu giá & P2P',
  [MarketCardId.MC_FUEL_SURGE]: '4 Ga Tàu: Phụ thu thêm 500',
  [MarketCardId.MC_URBAN_PLANNING]: 'Thuê HN/HCM x1.5 & Vay 60%',
  [MarketCardId.MC_UTILITY_DOUBLE]: 'Điện & Viễn thông: Cước x2',
  [MarketCardId.MC_CASINO_PILOT]: 'Thưởng 1.500 - 3.000 khi dừng',
  [ChanceCardId.CC_PORT_EXCLUSIVE]: 'Cảng biển: Hưởng 50% cước',
};

export function resolveMarketCompactFormula(type: string): string {
  const explicit = ACTIVE_MARKET_COMPACT_FORMULAS[type];
  if (explicit) {
    return explicit;
  }
  return resolveMarketEffectSummary(type);
}
