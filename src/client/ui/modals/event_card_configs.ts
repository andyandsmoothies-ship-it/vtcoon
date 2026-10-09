// [IMP-343] Event Card Static Configs & Style Mappers
// Pure domain dictionary and presentation styling rules extracted from event_card_visuals
import { MarketCardId, ChanceCardId } from '../../../domain/event_card_types.js';
import { MacroCycleType } from '../../../domain/macro_cycle_types.js';

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

export const KNOWN_HERO_STATS: Readonly<Record<string, HeroStat>> = {
  // Market Cards
  [MarketCardId.MC_FUEL_SURGE]: { label: 'PHỤ PHÍ NHIÊN LIỆU', value: '-500', variant: 'negative' },
  [MarketCardId.MC_ALCOHOL_CHECK]: { label: 'GIẢM 50% THUÊ • PHẠT NỒNG ĐỘ CỒN', value: '-800', variant: 'negative' },
  [MarketCardId.MC_RATE_HIKE]: { label: 'THẮT CHẶT TIỀN TỆ', value: '+20% XÂY • 10% QUA GO', variant: 'warning' },
  [MarketCardId.MC_URBAN_PLANNING]: { label: 'ĐỊNH GIÁ TRUNG TÂM', value: 'x1.5 THUÊ • VAY 60%', variant: 'positive' },
  [MarketCardId.MC_NIGHT_ECONOMY]: { label: 'BÙNG NỔ DOANH THU', value: 'x2 THU TIỀN THUÊ', variant: 'positive' },
  [MarketCardId.MC_MEGA_CONCERT]: { label: 'HỘI TỤ ĐÁM ĐÔNG', value: 'TẬP HỢP TẤT CẢ', variant: 'info' },
  [MarketCardId.MC_CASINO_PILOT]: { label: 'TỔ HỢP CASINO', value: 'THƯỞNG ĐẾN 3.000', variant: 'positive' },
  [MarketCardId.MC_CREDIT_STIMULUS]: { label: 'ƯU ĐÃI XÂY DỰNG', value: '-20% XÂY DỰNG', variant: 'positive' },
  [MarketCardId.MC_LAND_FEVER]: { label: 'SỐT ĐẤT VÙNG VEN', value: 'x2 TIỀN THUÊ', variant: 'positive' },
  [MacroCycleType.MACRO_LAND_FEVER]: { label: 'SỐT ĐẤT VĨ MÔ', value: 'THUÊ x2.5 • XÂY -25%', variant: 'positive' },
  [MacroCycleType.MACRO_LIQUIDITY_FREEZE]: { label: 'ĐÓNG BĂNG THANH KHOẢN', value: 'THUÊ -50% • CẤM VAY', variant: 'warning' },
  [MarketCardId.MC_FIRE_INSPECTION]: { label: 'THANH TRA PCCC', value: 'PHẠT C1-C3', variant: 'negative' },
  [MarketCardId.MC_PUBLIC_INVEST]: { label: 'HẠ TẦNG QUỐC GIA', value: '+400 & x2 VẬN TẢI', variant: 'positive' },
  [MarketCardId.MC_ANTI_SPECULATE]: { label: 'THUẾ CHỐNG ĐẦU CƠ', value: 'THUẾ P2P 20%', variant: 'warning' },
  [MarketCardId.MC_PEAK_TOURISM]: { label: 'BỘI THU NGHỈ DƯỠNG', value: 'x2 TIỀN THUÊ RESORT', variant: 'positive' },
  [MarketCardId.MC_FREEZE_TRADE]: { label: 'HIỆU LỰC', value: 'CẤM THẾ CHẤP & ĐẤU GIÁ', variant: 'warning' },
  [MarketCardId.MC_UTILITY_DOUBLE]: { label: 'BIỂU GIÁ TIỆN ÍCH', value: 'x2 CƯỚC TIỆN ÍCH', variant: 'warning' },
  [MarketCardId.MC_COASTAL_STORM]: { label: 'THIÊN TAI BÃO LŨ', value: 'MIỄN 100% THUÊ', variant: 'warning' },

  // Chance Cards
  [ChanceCardId.CC_STOCK_PROFIT]: { label: 'LỢI NHUẬN ĐẦU TƯ', value: '+2.500', variant: 'positive' },
  [ChanceCardId.CC_TAX_AUDIT]: { label: 'THANH TRA THUẾ', value: '-500 / ĐẤT TRỐNG', variant: 'negative' },
  [ChanceCardId.CC_DIPLOMATIC]: { label: 'MIỄN TRỪ NGOẠI GIAO', value: 'MIỄN 100% THUÊ', variant: 'positive' },
  [ChanceCardId.CC_SWAP_PROJECT]: { label: 'QUYỀN MUA LẠI', value: 'ĐỀN BÙ 130%', variant: 'info' },
  [ChanceCardId.CC_PLATE_AUCTION]: { label: 'ĐẶC QUYỀN ĐUA TỐC', value: '+1 LƯỢT ĐI', variant: 'positive' },
  [ChanceCardId.CC_CONTRACT_PENALTY]: { label: 'BỒI THƯỜNG VI PHẠM', value: '-1.000', variant: 'negative' },
  [ChanceCardId.CC_LAND_CHANGE]: { label: 'QUY HOẠCH ĐÔ THỊ', value: 'LÊN CẤP 1 NGAY', variant: 'positive' },
  [ChanceCardId.CC_BUILD_HALT]: { label: 'ĐÌNH CHỈ KHAI THÁC', value: '-800 & ĐÓNG BĂNG', variant: 'negative' },
  [ChanceCardId.CC_MA_FORCE]: { label: 'THƯƠNG VỤ M&A', value: 'MUA LẠI 120%', variant: 'warning' },
  [ChanceCardId.CC_COPYRIGHT]: { label: 'ÁN PHẠT HÀNH CHÍNH', value: '-1.200', variant: 'negative' },
  [ChanceCardId.CC_OVERDRAFT]: { label: 'GIẢI NGÂN TÍN DỤNG', value: '+3.000', variant: 'positive' },
  [ChanceCardId.CC_JUNK_STOCK]: { label: 'CẮT LỖ ĐẦU CƠ', value: '-1.500', variant: 'negative' },
  [ChanceCardId.CC_FRANCHISE]: { label: 'DOANH THU NHƯỢNG QUYỀN', value: '+800 / NGƯỜI', variant: 'positive' },
  [ChanceCardId.CC_LAND_RECLAIM]: { label: 'TIỀN BỒI HOÀN', value: 'NHẬN 150% SỔ ĐỎ', variant: 'positive' },
  [ChanceCardId.CC_VENUE_INCIDENT]: { label: 'KHẮC PHỤC SỰ CỐ', value: '-1.200', variant: 'negative' },
  [ChanceCardId.CC_CONCERT_SPONSOR]: { label: 'TĂNG TỐC THẦN TỐC', value: 'x2 XÚC XẮC LƯỢT SAU', variant: 'positive' },
  [ChanceCardId.CC_FREE_CREDIT]: { label: 'VỐN ƯU ĐÃI', value: '+2.000', variant: 'positive' },
  [ChanceCardId.CC_PORT_EXCLUSIVE]: { label: 'CỔ TỨC LOGISTICS', value: '+1.000', variant: 'positive' },
  [ChanceCardId.CC_SLOW_BUILD]: { label: 'PHẠT CHẬM TIẾN ĐỘ', value: '-600', variant: 'negative' },
  [ChanceCardId.CC_MEDIA_CRISIS]: { label: 'XỬ LÝ KHỦNG HOẢNG', value: '-800 & TẠM ĐÓNG CỬA', variant: 'negative' },
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
  [ChanceCardId.CC_MA_FORCE]: 'Đã Thâu Tóm BĐS • Đóng',
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
  [ChanceCardId.CC_SWAP_PROJECT]: 'Tiến Hành Mua Lại 🤝',

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
