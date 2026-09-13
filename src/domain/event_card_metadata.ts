// [UC-GAME-038..041/MSS] Metadata, descriptions and financial deltas for Chance & Market cards
import { ChanceCardId, MarketCardId } from './event_card_types.js';
import { vi } from './i18n/vi.js';
import type { EventCardInfo } from './room.js';

export const CHANCE_CARD_DETAILS: Readonly<Record<ChanceCardId, { readonly description: string; readonly effectDelta?: number }>> = {
  [ChanceCardId.CC_PLATE_AUCTION]: {
    description: 'Đấu giá thành công biển số định danh VIP. Nộp lệ phí 500 Tr., nhận đặc quyền đi thêm một lượt.',
    effectDelta: -500,
  },
  [ChanceCardId.CC_TAX_AUDIT]: {
    description: 'Thanh tra thuế đột xuất. Nộp phạt dựa trên quy mô số lượng công trình đang sở hữu.',
  },
  [ChanceCardId.CC_STOCK_PROFIT]: {
    description: 'Chốt lời danh mục đầu tư tăng trưởng nóng. Nhận ngay 2.500 Tr. tiền mặt.',
    effectDelta: 2500,
  },
  [ChanceCardId.CC_DIPLOMATIC]: {
    description: 'Nhận Thẻ Miễn Trừ Ngoại Giao trên tay. Tự động miễn phí 100% tiền thuê khi dẫm BĐS đối thủ.',
  },
  [ChanceCardId.CC_CONTRACT_PENALTY]: {
    description: 'Bồi thường hợp đồng chậm tiến độ. Chuyển 500 Tr. cho người chơi đối thủ.',
    effectDelta: -500,
  },
  [ChanceCardId.CC_LAND_CHANGE]: {
    description: 'Chuyển mục đích sử dụng đất thành công. Nộp 800 Tr., tăng vĩnh viễn +50% tiền thuê ô đất trống.',
    effectDelta: -800,
  },
  [ChanceCardId.CC_BUILD_HALT]: {
    description: 'Đình chỉ xây dựng để hoàn thiện pháp lý. 1 ô đất bị phong tỏa thu tiền trong 2 vòng.',
  },
  [ChanceCardId.CC_MA_FORCE]: {
    description: 'Thương vụ M&A bắt buộc. Thôn tính ô đất cấp 0 của đối thủ theo giá thị trường.',
  },
  [ChanceCardId.CC_COPYRIGHT]: {
    description: 'Vi phạm bản quyền chương trình nghệ thuật. Nộp phạt 400 Tr. vào Kho Bạc.',
    effectDelta: -400,
  },
  [ChanceCardId.CC_OVERDRAFT]: {
    description: 'Mở hạn mức thấu chi doanh nghiệp. Nhận tạm ứng 3.000 Tr., hoàn trả sau 3 vòng.',
    effectDelta: 3000,
  },
  [ChanceCardId.CC_JUNK_STOCK]: {
    description: 'Kẹp thanh khoản cổ phiếu đầu cơ. Thua lỗ tài chính 1.500 Tr.',
    effectDelta: -1500,
  },
  [ChanceCardId.CC_FRANCHISE]: {
    description: 'Nhượng quyền thương hiệu F&B thành công. Thu phí bản quyền từ mỗi đối thủ.',
  },
  [ChanceCardId.CC_LAND_RECLAIM]: {
    description: 'Nhà nước thu hồi đất phục vụ công cộng. Nhận đền bù thỏa đáng theo định giá.',
  },
  [ChanceCardId.CC_VENUE_INCIDENT]: {
    description: 'Sự cố an ninh tại khu dịch vụ. Khắc phục thiệt hại 800 Tr.',
    effectDelta: -800,
  },
  [ChanceCardId.CC_CONCERT_SPONSOR]: {
    description: 'Tài trợ đại nhạc hội Countdown. Chi 600 Tr., nhân đôi điểm xúc xắc lượt tiếp theo.',
    effectDelta: -600,
  },
  [ChanceCardId.CC_FREE_CREDIT]: {
    description: 'Huy động vốn tín dụng ưu đãi lãi suất 0%. Nhận 2.000 Tr. tiền mặt.',
    effectDelta: 2000,
  },
  [ChanceCardId.CC_PORT_EXCLUSIVE]: {
    description: 'Hợp tác độc quyền Cảng biển quốc tế. Nhận 50% phí cảng từ mọi người chơi trong 2 vòng.',
  },
  [ChanceCardId.CC_SLOW_BUILD]: {
    description: 'Dự án chậm triển khai 24 tháng. Đất trống bị cảnh báo thu hồi nếu không khởi công.',
  },
  [ChanceCardId.CC_MEDIA_CRISIS]: {
    description: 'Khủng hoảng truyền thông dịch vụ. Tạm đình chỉ hoạt động 1 ô dịch vụ trong 1 vòng.',
  },
  [ChanceCardId.CC_SWAP_PROJECT]: {
    description: 'Quyền ưu tiên hoán đổi vị trí dự án chiến lược với người chơi khác.',
  },
};

export const MARKET_CARD_DETAILS: Readonly<Record<MarketCardId, { readonly description: string }>> = {
  [MarketCardId.MC_NIGHT_ECONOMY]:   { description: 'Phát triển kinh tế đêm: Nhân đôi tiền thuê tại các ô đất có công trình C1-C3.' },
  [MarketCardId.MC_MEGA_CONCERT]:    { description: 'Đại nhạc hội quốc tế quy tụ mọi người chơi đổ về ô dịch vụ cao cấp nhất.' },
  [MarketCardId.MC_ALCOHOL_CHECK]:   { description: 'Tăng cường kiểm tra nồng độ cồn: Giảm 50% doanh thu các điểm vui chơi giải trí.' },
  [MarketCardId.MC_CASINO_PILOT]:    { description: 'Thí điểm mở rộng Casino: Tăng đột biến phí dịch vụ du lịch nghỉ dưỡng.' },
  [MarketCardId.MC_RATE_HIKE]:       { description: 'Ngân Hàng Nhà Nước tăng lãi suất: Thu lãi thế chấp 10% khi người chơi qua ô GO.' },
  [MarketCardId.MC_CREDIT_STIMULUS]: { description: 'Gói kích cầu tín dụng: Giảm 20% chi phí xây dựng và nâng cấp nhà toàn quốc.' },
  [MarketCardId.MC_LAND_FEVER]:      { description: 'Sốt đất quy hoạch đô thị vệ tinh: Giá trị chuyển nhượng BĐS tăng phi mã.' },
  [MarketCardId.MC_FIRE_INSPECTION]: { description: 'Tổng thanh tra PCCC: Xử phạt các tòa nhà chưa nghiệm thu an toàn phòng cháy.' },
  [MarketCardId.MC_PUBLIC_INVEST]:   { description: 'Đẩy mạnh giải ngân vốn đầu tư công: Chi trả cổ tức hạ tầng cho các nhà đầu tư Ga/Cảng.' },
  [MarketCardId.MC_ANTI_SPECULATE]:  { description: 'Áp thuế chống đầu cơ: Tăng thuế chuyển nhượng bất động sản lên 20% nộp Kho Bạc.' },
  [MarketCardId.MC_PEAK_TOURISM]:    { description: 'Mùa cao điểm du lịch: Nhân đôi phí thuê tại tất cả các điểm nghỉ dưỡng ven biển.' },
  [MarketCardId.MC_FREEZE_TRADE]:    { description: 'Đóng băng thị trường bất động sản: Tạm ngừng toàn bộ giao dịch mua bán và chuyển nhượng.' },
  [MarketCardId.MC_FUEL_SURGE]:      { description: 'Biến động giá xăng dầu: Phụ thu thêm 500 Tr. cước vận tải tại mọi ô hạ tầng.' },
  [MarketCardId.MC_URBAN_PLANNING]:  { description: 'Phê duyệt quy hoạch trục giao thông mới: Cấm thế chấp đất dọc hành lang quy hoạch.' },
  [MarketCardId.MC_UTILITY_DOUBLE]:  { description: 'Tăng khung giá bán lẻ điện & viễn thông: Nhân đôi phí dịch vụ tiện ích công cộng.' },
  [MarketCardId.MC_COASTAL_STORM]:   { description: 'Thời tiết cực đoan duyên hải: Miễn phí tiền thuê đất tại toàn bộ dải bờ biển.' },
};

export function getChanceCardInfo(card: ChanceCardId, playerId?: string): EventCardInfo {
  const detail = CHANCE_CARD_DETAILS[card];
  return {
    cardType: 'chance',
    cardId: card,
    title: vi.chanceCards[card] ?? card,
    description: detail?.description ?? 'Cơ hội phát triển kinh doanh và mở rộng mạng lưới địa ốc.',
    ...(detail?.effectDelta !== undefined ? { effectDelta: detail.effectDelta } : {}),
    ...(playerId ? { playerId } : {}),
  };
}

export function getMarketCardInfo(card: MarketCardId): EventCardInfo {
  const detail = MARKET_CARD_DETAILS[card];
  return {
    cardType: 'market',
    cardId: card,
    title: vi.marketCards[card] ?? card,
    description: detail?.description ?? 'Biến động chính sách vĩ mô và dòng vốn đầu tư toàn quốc.',
  };
}
