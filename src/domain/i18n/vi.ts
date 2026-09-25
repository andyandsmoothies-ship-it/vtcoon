// [DEBT-S06-10] Từ điển tiếng Việt — Domain-only module
// Consumer: card_handlers (log), action_reasons (reject), bot_engine (log Bot action)
// Đường đi phụ thuộc: Domain → Server → Client (một chiều)

import { MarketCardId, ChanceCardId } from '../event_card_types';
import { ActionRejectReason } from '../action_reasons';
import { TurnPhase } from '../room';
import { MacroCycleType } from '../macro_cycle_types';

export const vi = {
  marketCards: {
    [MarketCardId.MC_NIGHT_ECONOMY]:   'Phố Đêm Không Ngủ',
    [MarketCardId.MC_MEGA_CONCERT]:    'Đại Nhạc Hội Quốc Tế',
    [MarketCardId.MC_ALCOHOL_CHECK]:   'Siết Chặt Nồng Độ Cồn',
    [MarketCardId.MC_CASINO_PILOT]:    'Thí Điểm Tổ Hợp Casino',
    [MarketCardId.MC_RATE_HIKE]:       'Tăng Lãi Suất Tín Dụng',
    [MarketCardId.MC_CREDIT_STIMULUS]: 'Gói Kích Cầu Tín Dụng',
    [MarketCardId.MC_LAND_FEVER]:      'Sốt Đất Đô Thị Vệ Tinh',
    [MarketCardId.MC_FIRE_INSPECTION]: 'Tổng Thanh Tra PCCC',
    [MarketCardId.MC_PUBLIC_INVEST]:   'Đẩy Mạnh Đầu Tư Công',
    [MarketCardId.MC_ANTI_SPECULATE]:  'Sắc Thuế Chống Đầu Cơ',
    [MarketCardId.MC_PEAK_TOURISM]:    'Mùa Cao Điểm Du Lịch Quốc Tế',
    [MarketCardId.MC_FREEZE_TRADE]:    'Đóng Băng Giao Dịch Bất Động Sản',
    [MarketCardId.MC_FUEL_SURGE]:      'Cú Sốc Giá Xăng Dầu',
    [MarketCardId.MC_URBAN_PLANNING]:  'Quy Hoạch Trục Vàng Đô Thị',
    [MarketCardId.MC_UTILITY_DOUBLE]:  'Tăng Biểu Giá Điện & Viễn Thông',
    [MarketCardId.MC_COASTAL_STORM]:   'Bão Lũ Duyên Hải',
  } as Record<MarketCardId, string>,

  chanceCards: {
    [ChanceCardId.CC_PLATE_AUCTION]:    'Đấu Giá Biển Số Đẹp',
    [ChanceCardId.CC_TAX_AUDIT]:        'Thanh Tra Thuế Đột Xuất',
    [ChanceCardId.CC_STOCK_PROFIT]:     'Chốt Lời Cổ Phiếu VN30',
    [ChanceCardId.CC_DIPLOMATIC]:       'Miễn Trừ Ngoại Giao',
    [ChanceCardId.CC_CONTRACT_PENALTY]: 'Chậm Tiến Độ Bàn Giao',
    [ChanceCardId.CC_LAND_CHANGE]:      'Chuyển Đổi Mục Đích Đất',
    [ChanceCardId.CC_BUILD_HALT]:       'Tạm Dừng Thi Công',
    [ChanceCardId.CC_MA_FORCE]:         'Thâu Tóm Doanh Nghiệp (M&A)',
    [ChanceCardId.CC_COPYRIGHT]:        'Tranh Chấp Bản Quyền',
    [ChanceCardId.CC_OVERDRAFT]:        'Gói Vay Thấu Chi',
    [ChanceCardId.CC_JUNK_STOCK]:       'Bán Tháo Cổ Phiếu',
    [ChanceCardId.CC_FRANCHISE]:        'Chuỗi Nhượng Quyền F&B',
    [ChanceCardId.CC_LAND_RECLAIM]:     'Đền Bù Giải Tỏa Mặt Bằng',
    [ChanceCardId.CC_VENUE_INCIDENT]:   'Sự Cố Khu Phức Hợp',
    [ChanceCardId.CC_CONCERT_SPONSOR]:  'Tài Trợ Nhạc Hội Giao Thừa',
    [ChanceCardId.CC_FREE_CREDIT]:      'Gói Tín Dụng Khởi Nghiệp',
    [ChanceCardId.CC_PORT_EXCLUSIVE]:   'Hợp Tác Độc Quyền Cảng Quốc Tế',
    [ChanceCardId.CC_SLOW_BUILD]:       'Chậm Tiến Độ Động Thổ',
    [ChanceCardId.CC_MEDIA_CRISIS]:     'Khủng Hoảng Truyền Thông',
    [ChanceCardId.CC_SWAP_PROJECT]:     'Mua Lại Dự Án Tiềm Năng',
  } as Record<ChanceCardId, string>,

  rejectReasons: {
    [ActionRejectReason.GAME_NOT_STARTED]:           'Trò chơi chưa bắt đầu',
    [ActionRejectReason.NOT_YOUR_TURN]:              'Chưa đến lượt của bạn',
    [ActionRejectReason.INVALID_PHASE]:              'Giai đoạn không hợp lệ',
    [ActionRejectReason.FREEZE_ACTIVE]:              'Giao dịch đang bị đóng băng',
    [ActionRejectReason.NOT_OWNER]:                  'Bạn không phải chủ sở hữu',
    [ActionRejectReason.HAS_BUILDING]:               'Ô đất đang có công trình',
    [ActionRejectReason.ALREADY_MORTGAGED]:          'Ô đất đã thế chấp',
    [ActionRejectReason.NOT_MORTGAGEABLE]:           'Ô đất không thể thế chấp',
    [ActionRejectReason.PLAYER_NOT_FOUND]:           'Không tìm thấy người chơi',
    [ActionRejectReason.NOT_MORTGAGED]:              'Ô đất chưa được thế chấp',
    [ActionRejectReason.INSUFFICIENT_FUNDS]:         'Không đủ tiền',
    [ActionRejectReason.INVALID_TRADE]:              'Giao dịch không hợp lệ',
    [ActionRejectReason.INVALID_PRICE]:              'Giá không hợp lệ',
    [ActionRejectReason.PROPERTY_HAS_BUILDING]:      'Bất động sản có công trình',
    [ActionRejectReason.NOT_PURCHASABLE]:            'Không thể mua ô đất này',
    [ActionRejectReason.PLAYER_BANKRUPT]:            'Người chơi đã phá sản',
    [ActionRejectReason.PROPERTY_MORTGAGED]:         'Bất động sản đang thế chấp',
    [ActionRejectReason.UNAUTHORIZED]:               'Không có quyền thực hiện',
    [ActionRejectReason.NOT_UPGRADEABLE]:            'Không thể nâng cấp ô đất này',
    [ActionRejectReason.INVALID_ROOM]:               'Phòng không hợp lệ',
    [ActionRejectReason.PRICE_BELOW_FLOOR]:          'Giá chuyển nhượng thấp hơn sàn tối thiểu 70%',
    [ActionRejectReason.MISSING_MONOPOLY]:           'Chưa độc quyền nhóm màu',
    [ActionRejectReason.MAX_LEVEL]:                  'Đã đạt cấp độ tối đa',
    [ActionRejectReason.NEED_2_RAILROADS]:           'Cần sở hữu ít nhất 2 hạ tầng',
    [ActionRejectReason.NOT_UTILITY]:                'Ô không phải Tiện ích',
    [ActionRejectReason.INVALID_PLAYER]:             'Người chơi không hợp lệ',
    [ActionRejectReason.DECLINED_PLAYER_CANNOT_BID]: 'Người chơi đã bỏ qua không được đặt giá',
    [ActionRejectReason.LIQUIDITY_FROZEN]:           'Bất động sản đang trong chu kỳ đóng băng thanh khoản',
    [ActionRejectReason.BOND_COLLATERAL_LOCKED]:    'Bất động sản đang là tài sản đảm bảo trái phiếu',
    [ActionRejectReason.BOND_NOT_ELIGIBLE]:         'Chưa đủ điều kiện phát hành trái phiếu doanh nghiệp',
    [ActionRejectReason.BOND_ALREADY_ACTIVE]:       'Người chơi đang có hợp đồng trái phiếu chưa tất toán',
  } as Record<string, string>,

  macroCycles: {
    [MacroCycleType.MACRO_LAND_FEVER]:        'Sốt Đất Vĩ Mô',
    [MacroCycleType.MACRO_LIQUIDITY_FREEZE]:  'Đóng Băng Thanh Khoản',
  } as Record<MacroCycleType, string>,

  turnPhases: {
    [TurnPhase.WaitingRoll]:        'Chờ Đổ Xúc Xắc',
    [TurnPhase.ActionPhase]:        'Giai Đoạn Hành Động',
    [TurnPhase.AuctionPhase]:       'Giai Đoạn Đấu Giá',
    [TurnPhase.PropertyManagement]: 'Quản Lý Tài Sản',
    [TurnPhase.InsolvencyPhase]:    'Giai Đoạn Mất Khả Năng',
    [TurnPhase.BankruptcyCheck]:    'Kiểm Tra Phá Sản',
    [TurnPhase.TurnEnd]:            'Kết Thúc Lượt',
    [TurnPhase.HosePhase]:          'Giai Đoạn Đầu Tư HOSE',
  } as Record<TurnPhase, string>,
} as const;
