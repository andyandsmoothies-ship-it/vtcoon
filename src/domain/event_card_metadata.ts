// [UC-GAME-038..041/MSS] Metadata, descriptions and financial deltas for Chance & Market cards
import { ChanceCardId, MarketCardId } from './event_card_types.js';
import { vi } from './i18n/vi.js';
import type { EventCardInfo } from './room.js';

export interface CardDetail {
  readonly description: string;
  readonly targetScope: string;
  readonly effectDetail: string;
  readonly duration: string;
  readonly destination: string;
  readonly effectDelta?: number;
}

type ChanceCardDetail = CardDetail;
type MarketCardDetail = Omit<CardDetail, 'effectDelta'>;

export const CHANCE_CARD_DETAILS: Readonly<Record<ChanceCardId, CardDetail>> = {
  [ChanceCardId.CC_PLATE_AUCTION]: {
    description: 'Đấu giá thành công biển số định danh VIP. Nộp lệ phí 500 Tr., nhận đặc quyền đi thêm một lượt.',
    targetScope: 'Người chơi rút thẻ',
    effectDetail: 'Nộp lệ phí đấu giá 500 Tr., nhận đặc quyền tung xúc xắc đi tiếp một lượt bổ sung',
    duration: 'Tức thì',
    destination: 'Nộp 500 Tr. vào Kho Bạc Nhà Nước',
    effectDelta: -500,
  },
  [ChanceCardId.CC_TAX_AUDIT]: {
    description: 'Thanh tra thuế doanh nghiệp đột xuất. Nộp phạt 500 Tr. cho mỗi ô đất trống chưa xây dựng.',
    targetScope: 'Người chơi rút thẻ (các ô đất Cấp 0 chưa xây dựng)',
    effectDetail: 'Nộp phạt 500 Tr. cho mỗi ô đất trống Cấp 0 chưa xây dựng công trình vào Kho Bạc Nhà Nước (khung phạt điều chỉnh từ 200 Tr.)',
    duration: 'Tức thì',
    destination: 'Nộp phạt vào Kho Bạc Nhà Nước',
  },
  [ChanceCardId.CC_STOCK_PROFIT]: {
    description: 'Chốt lời danh mục đầu tư tăng trưởng nóng. Nhận ngay 2.500 Tr. tiền mặt.',
    targetScope: 'Người chơi rút thẻ',
    effectDetail: 'Chốt lời cổ phiếu danh mục VN30 thành công, nhận ngay 2.500 Tr. tiền mặt',
    duration: 'Tức thì',
    destination: 'Cộng 2.500 Tr. vào số dư tài khoản cá nhân',
    effectDelta: 2500,
  },
  [ChanceCardId.CC_DIPLOMATIC]: {
    description: 'Nhận Thẻ Miễn Trừ Ngoại Giao trên tay. Tự động miễn phí 100% tiền thuê khi dẫm BĐS đối thủ.',
    targetScope: 'Người chơi rút thẻ (lưu trên tay)',
    effectDetail: 'Miễn 100% tiền thuê tại bất động sản đối thủ Cấp 0-C3 và tự động tiêu thụ thẻ',
    duration: 'Lưu giữ đến khi kích hoạt',
    destination: 'Bảo toàn tài chính cá nhân',
  },
  [ChanceCardId.CC_CONTRACT_PENALTY]: {
    description: 'Bồi thường hợp đồng chậm tiến độ. Nộp phạt 1.000 Tr. chuyển cho người chơi nghèo nhất.',
    targetScope: 'Người chơi rút thẻ và người chơi nghèo nhất bàn cờ',
    effectDetail: 'Bồi thường vi phạm hợp đồng 1.000 Tr. chuyển trực tiếp cho người chơi có số dư thấp nhất bàn cờ',
    duration: 'Tức thì',
    destination: 'Trừ 1.000 Tr. chuyển sang tài khoản người nghèo nhất',
    effectDelta: -1000,
  },
  [ChanceCardId.CC_LAND_CHANGE]: {
    description: 'Chuyển mục đích sử dụng đất lên thổ cư: Nộp 500 Tr. nâng thẳng 1 ô C0 lên Cấp 1 không cần đủ bộ màu (hoặc nhận 600 Tr. hỗ trợ quy hoạch).',
    targetScope: 'Người chơi rút thẻ (các ô đất Cấp 0)',
    effectDetail: 'Nộp lệ phí 500 Tr. vào Kho Bạc, nâng cấp ngay 1 ô đất Cấp 0 lên Cấp 1 không cần hoàn thành nhóm màu. Nếu không có ô Cấp 0, nhận 600 Tr. hỗ trợ từ Kho Bạc',
    duration: 'Tức thì',
    destination: 'Kho Bạc Nhà Nước hoặc Ngân sách người chơi',
    effectDelta: -500,
  },
  [ChanceCardId.CC_BUILD_HALT]: {
    description: 'Đình chỉ xây dựng để hoàn thiện pháp lý. Phạt 800 Tr. và 1 ô đất bị phong tỏa thu tiền trong 2 vòng.',
    targetScope: '1 ô đất bất kỳ của người chơi rút thẻ',
    effectDetail: 'Phạt ngay 800 Tr. chi phí thanh tra hoàn thiện pháp lý và tạm ngưng thu tiền thuê tại 1 ô đất trong 2 vòng',
    duration: '2 vòng chơi',
    destination: 'Nộp phạt 800 Tr. vào Kho Bạc Nhà Nước',
    effectDelta: -800,
  },
  [ChanceCardId.CC_MA_FORCE]: {
    description: 'Thương vụ M&A bắt buộc. Thôn tính ô đất cấp 0 của đối thủ theo giá 120% (hoặc nhận 800 Tr. trợ cấp M&A từ Kho Bạc nếu không thể thâu tóm).',
    targetScope: '1 ô đất Cấp 0 thuộc quyền sở hữu đối thủ',
    effectDetail: 'Mua lại 1 ô đất cấp 0 của đối thủ theo giá 120%, hoặc nhận 800 Tr. trợ cấp từ Kho Bạc nếu không có mục tiêu hợp lệ',
    duration: 'Tức thì',
    destination: 'Thanh toán trực tiếp cho người chơi sở hữu hoặc nhận từ Kho Bạc',
  },
  [ChanceCardId.CC_COPYRIGHT]: {
    description: 'Vi phạm bản quyền chương trình nghệ thuật. Nộp phạt vi phạm hành chính 1.200 Tr. vào Kho Bạc Nhà Nước.',
    targetScope: 'Người chơi rút thẻ',
    effectDetail: 'Xử phạt vi phạm hành chính bản quyền thương hiệu và chương trình biểu diễn 1.200 Tr. vào Kho Bạc Nhà Nước',
    duration: 'Tức thì',
    destination: 'Nộp phạt 1.200 Tr. vào Kho Bạc Nhà Nước',
    effectDelta: -1200,
  },
  [ChanceCardId.CC_OVERDRAFT]: {
    description: 'Mở hạn mức thấu chi doanh nghiệp. Nhận tạm ứng 3.000 Tr., hoàn trả 3.300 Tr. sau 3 vòng.',
    targetScope: 'Người chơi rút thẻ',
    effectDetail: 'Giải ngân tạm ứng vốn lưu động 3.000 Tr., hoàn trả 3.300 Tr. gồm gốc và lãi sau 3 vòng',
    duration: '3 vòng chơi',
    destination: 'Nhận ngay 3.000 Tr., hoàn trả 3.300 Tr. nộp Kho Bạc sau 3 vòng',
    effectDelta: 3000,
  },
  [ChanceCardId.CC_JUNK_STOCK]: {
    description: 'Kẹp thanh khoản cổ phiếu đầu cơ. Thua lỗ tài chính 1.500 Tr. nộp Kho Bạc do kẹp hàng cổ phiếu rác.',
    targetScope: 'Người chơi rút thẻ',
    effectDetail: 'Trừ -1.500 Tr. nộp Kho Bạc do kẹp hàng cổ phiếu rác mất thanh khoản',
    duration: 'Tức thì',
    destination: 'Nộp -1.500 Tr. vào Kho Bạc Nhà Nước',
    effectDelta: -1500,
  },
  [ChanceCardId.CC_FRANCHISE]: {
    description: 'Nhượng quyền thương hiệu F&B thành công. Thu phí bản quyền từ mỗi đối thủ.',
    targetScope: 'Tất cả đối thủ còn lại trên bàn cờ',
    effectDetail: 'Thu phí nhượng quyền kinh doanh chuỗi F&B 800 Tr. từ mỗi đối thủ',
    duration: 'Tức thì',
    destination: 'Chuyển tiền từ các đối thủ về tài khoản cá nhân',
  },
  [ChanceCardId.CC_LAND_RECLAIM]: {
    description: 'Nhà nước thu hồi đất phục vụ công cộng. Nhận đền bù thỏa đáng theo định giá.',
    targetScope: '1 ô đất bất kỳ của người chơi rút thẻ',
    effectDetail: 'Nhà nước thu hồi đất giải phóng mặt bằng, nhận bồi hoàn 150% giá trị niêm yết',
    duration: 'Tức thì',
    destination: 'Kho Bạc chi trả tiền bồi thường vào tài khoản',
  },
  [ChanceCardId.CC_VENUE_INCIDENT]: {
    description: 'Sự cố an ninh tại khu dịch vụ. Phạt 1.200 Tr. khắc phục sự cố; nếu không có ô Dịch vụ nộp 600 Tr. phí bảo an vào Kho Bạc.',
    targetScope: 'Người chơi rút thẻ',
    effectDetail: 'Chi phí khắc phục sự cố dịch vụ 1.200 Tr.; nếu không có ô Dịch vụ nộp 600 Tr. phí bảo an toàn thành phố vào Kho Bạc Nhà Nước',
    duration: 'Tức thì',
    destination: 'Nộp phạt vào Kho Bạc Nhà Nước',
    effectDelta: -1200,
  },
  [ChanceCardId.CC_CONCERT_SPONSOR]: {
    description: 'Tài trợ đại nhạc hội Countdown. Chi 600 Tr., nhân đôi điểm xúc xắc lượt tiếp theo.',
    targetScope: 'Người chơi rút thẻ',
    effectDetail: 'Chi phí tài trợ lễ hội âm nhạc 600 Tr., nhận hiệu ứng nhân đôi kết quả xúc xắc ở lượt tiếp theo',
    duration: 'Lượt tiếp theo',
    destination: 'Trừ 600 Tr. nộp vào Kho Bạc Nhà Nước',
    effectDelta: -600,
  },
  [ChanceCardId.CC_FREE_CREDIT]: {
    description: 'Huy động vốn tín dụng ưu đãi lãi suất 0%. Nhận 2.000 Tr. tiền mặt, nộp lãi 400 Tr. khi qua ô GO.',
    targetScope: 'Người chơi rút thẻ',
    effectDetail: 'Nhận ngay 2.000 Tr. tiền mặt, nộp lãi 400 Tr. mỗi lần đi qua ô Khởi Hành (GO)',
    duration: 'Duy trì đến hết trận hoặc khi tất toán',
    destination: 'Giải ngân 2.000 Tr. vào tài khoản, nộp lãi 400 Tr. vào Kho Bạc khi qua ô GO',
    effectDelta: 2000,
  },
  [ChanceCardId.CC_PORT_EXCLUSIVE]: {
    description: 'Hợp tác độc quyền Cảng biển quốc tế. Nhận ngay 1.000 Tr. cổ tức và 50% phí cảng từ mọi người chơi trong 2 vòng.',
    targetScope: 'Tất cả người chơi dừng chân tại các ô Cảng biển',
    effectDetail: 'Nhận ngay 1.000 Tr. cổ tức logistics từ Kho Bạc và trích nhận 50% doanh thu phí vận tải khi người chơi khác dừng chân tại ô Cảng biển trong 2 vòng',
    duration: '2 vòng chơi',
    destination: 'Kho Bạc giải ngân 1.000 Tr. và trích 50% phí cảng về tài khoản',
    effectDelta: 1000,
  },
  [ChanceCardId.CC_SLOW_BUILD]: {
    description: 'Tối hậu thư xử lý dự án chậm tiến độ: Phạt 600 Tr. vào Kho Bạc và cảnh báo thu hồi ô C0 (thu hồi ngay nếu âm tiền). Không có C0 nộp phí 300 Tr.',
    targetScope: 'Người chơi rút thẻ và các ô đất Cấp 0',
    effectDetail: 'Phạt 600 Tr. nộp Kho Bạc cho ô đất Cấp 0 và bắt đầu đếm hạn thu hồi; nếu mất khả năng thanh toán (số dư âm), ô đất bị thu hồi tức thì. Không có ô C0 nộp phí hành chính 300 Tr.',
    duration: 'Tức thì & 3 vòng chơi',
    destination: 'Nộp phạt vào Kho Bạc Nhà Nước',
    effectDelta: -600,
  },
  [ChanceCardId.CC_MEDIA_CRISIS]: {
    description: 'Khủng hoảng truyền thông dịch vụ. Phạt 800 Tr. và tạm đình chỉ hoạt động 1 ô dịch vụ trong 2 vòng.',
    targetScope: '1 ô Dịch vụ có cấp nhà cao nhất của người rút thẻ',
    effectDetail: 'Phạt ngay 800 Tr. chi phí xử lý khủng hoảng truyền thông và tạm đình chỉ thu phí tại 1 ô Dịch vụ trong 2 vòng',
    duration: '2 vòng chơi',
    destination: 'Nộp phạt 800 Tr. vào Kho Bạc Nhà Nước',
    effectDelta: -800,
  },
  [ChanceCardId.CC_SWAP_PROJECT]: {
    description: 'Quyền ưu tiên hoán đổi vị trí dự án chiến lược với người chơi khác.',
    targetScope: '1 ô đất Cấp 0 của người chơi và 1 ô đất Cấp 0 của đối thủ',
    effectDetail: 'Kích hoạt quyền hoán đổi quyền sở hữu 1 ô đất Cấp 0 của đối thủ',
    duration: 'Tức thì',
    destination: 'Chuyển đổi quyền sở hữu tài sản tương hỗ',
  },
};

export const MARKET_CARD_DETAILS: Readonly<Record<MarketCardId, MarketCardDetail>> = {
  [MarketCardId.MC_NIGHT_ECONOMY]: {
    description: 'Phát triển kinh tế ban đêm kích cầu du lịch, ẩm thực và dịch vụ giải trí.',
    targetScope: 'Tất cả người chơi và BĐS Dịch vụ (Ô 6, 8, 26, 27)',
    effectDetail: 'Tất cả người chơi chi tiêu 400 Tr. kích cầu (chia đều cho các chủ ô Dịch vụ hoặc nộp Kho Bạc) và nhân đôi tiền thuê ô Dịch vụ Cấp 1 trở lên trong 2 vòng',
    duration: '2 vòng chơi',
    destination: 'Chủ sở hữu ô Dịch vụ hoặc Kho Bạc Nhà Nước',
  },
  [MarketCardId.MC_MEGA_CONCERT]: {
    description: 'Đại nhạc hội quốc tế quy tụ mọi người chơi đổ về ô dịch vụ cao cấp nhất.',
    targetScope: 'Tất cả người chơi trên bàn cờ',
    effectDetail: 'Tập trung toàn bộ người chơi di chuyển ngay đến ô Dịch vụ có cấp công trình cao nhất',
    duration: 'Tức thì',
    destination: 'Chủ sở hữu ô Dịch vụ đón khách',
  },
  [MarketCardId.MC_ALCOHOL_CHECK]: {
    description: 'Chiến dịch kiểm tra nồng độ cồn diện rộng theo Nghị Định 100 tại các tuyến phố kinh doanh dịch vụ.',
    targetScope: 'Tất cả các ô BĐS Dịch vụ (Ô 6, 8, 26, 27)',
    effectDetail: 'Giảm 50% tiền thuê ô Dịch vụ trong 2 vòng; người dừng chân bị phạt 800 Tr. nộp Kho Bạc Nhà Nước và bị tạm giữ xe (mất lượt kế tiếp)',
    duration: '2 vòng chơi',
    destination: 'Nộp phạt 800 Tr. vào Kho Bạc Nhà Nước',
  },
  [MarketCardId.MC_CASINO_PILOT]: {
    description: 'Thí điểm Casino: Thưởng 1.500 Tr. cho ô Dịch vụ C2+, 3.000 Tr. cho ô 27 C3, hoặc kích cầu 1.000 Tr. cho người nghèo nhất.',
    targetScope: 'Chủ sở hữu ô 27 (Kiên Giang - Phú Quốc) đạt Cấp 3 hoặc ô Dịch Vụ Cấp 2 trở lên',
    effectDetail: 'Thưởng ngay 1.500 Tr. cho mọi ô Dịch Vụ Cấp 2 trở lên, 3.000 Tr. cho ô 27 đạt Cấp 3; nếu chưa ai có ô Dịch vụ C2+, Kho Bạc giải ngân gói kích cầu 1.000 Tr. cho người có số dư thấp nhất',
    duration: 'Tức thì',
    destination: 'Kho Bạc Nhà Nước chi thưởng về tài khoản cá nhân',
  },
  [MarketCardId.MC_RATE_HIKE]: {
    description: 'Ngân Hàng Nhà Nước tăng lãi suất: Thu lãi thế chấp 10% khi người chơi qua ô GO.',
    targetScope: 'Tất cả người chơi đang có khoản vay thế chấp',
    effectDetail: 'Tăng lãi suất vay thế chấp từ 5% lên 10% giá trị vay khi di chuyển qua ô Khởi Hành (GO)',
    duration: '1 vòng chơi',
    destination: 'Nộp vào Kho Bạc Nhà Nước',
  },
  [MarketCardId.MC_CREDIT_STIMULUS]: {
    description: 'Gói kích cầu tín dụng: Giảm 20% chi phí xây dựng và nâng cấp nhà toàn quốc.',
    targetScope: 'Toàn bộ người chơi trên bàn cờ',
    effectDetail: 'Giảm 20% chi phí xây dựng công trình C1-C3 và miễn 100% lãi suất vay thế chấp',
    duration: '1 vòng chơi',
    destination: 'Ngân sách người chơi (tiết kiệm chi phí đầu tư)',
  },
  [MarketCardId.MC_LAND_FEVER]: {
    description: 'Sốt đất quy hoạch đô thị vệ tinh: Giá trị chuyển nhượng BĐS tăng phi mã.',
    targetScope: 'Đô thị vệ tinh Bình Dương, Đồng Nai, Hưng Yên (Ô 6, 8, 31)',
    effectDetail: 'Tăng 50% giá trị chuyển nhượng và tiền thuê tại các tâm điểm sốt đất vùng ven',
    duration: '1 vòng chơi',
    destination: 'Chủ sở hữu bất động sản tại vùng sốt đất',
  },
  [MarketCardId.MC_FIRE_INSPECTION]: {
    description: 'Tổng thanh tra PCCC: Xử phạt các tòa nhà chưa nghiệm thu an toàn phòng cháy.',
    targetScope: 'Tất cả người chơi có công trình xây dựng (C1-C3)',
    effectDetail: 'Phạt 200 Tr./nhà C1, 400 Tr./nhà C2, 800 Tr./nhà C3. Đất trống (Cấp 0): Miễn phạt',
    duration: 'Tức thì',
    destination: 'Nộp phạt vào Kho Bạc Nhà Nước',
  },
  [MarketCardId.MC_PUBLIC_INVEST]: {
    description: 'Đẩy mạnh giải ngân các gói vốn đầu tư công phát triển hạ tầng giao thông trọng điểm.',
    targetScope: 'Toàn bộ người chơi và 4 trạm Hạ tầng Giao thông (Ô 5, 15, 25, 35)',
    effectDetail: 'Kho Bạc chi trả ngay 400 Tr. cho mỗi người chơi; thưởng 1.000 Tr. cho mỗi ô Hạ tầng sở hữu và nhân đôi cước phí vận tải trong 2 vòng',
    duration: '2 vòng chơi',
    destination: 'Kho Bạc Nhà Nước chi trả về tài khoản nhà đầu tư',
  },
  [MarketCardId.MC_ANTI_SPECULATE]: {
    description: 'Áp thuế chống đầu cơ: Tăng thuế chuyển nhượng bất động sản lên 20% nộp Kho Bạc.',
    targetScope: 'Toàn bộ các giao dịch chuyển nhượng bất động sản P2P',
    effectDetail: 'Nâng mức thuế suất chuyển nhượng P2P lên 20% trong 1 vòng và phạt ngay 1.000 Tr. thuế điều tiết tài sản cho người chơi sở hữu từ 4 ô đất trở lên',
    duration: '1 vòng chơi',
    destination: 'Nộp thuế vào Kho Bạc Nhà Nước',
  },
  [MarketCardId.MC_PEAK_TOURISM]: {
    description: 'Mùa cao điểm du lịch: Nhân đôi phí thuê tại tất cả các điểm nghỉ dưỡng ven biển.',
    targetScope: 'Tất cả các ô BĐS Nghỉ Dưỡng (Ô 11, 13, 14, 21, 24, 29)',
    effectDetail: 'Nhân đôi toàn bộ doanh thu tiền thuê tại các điểm đến du lịch và resort nghỉ dưỡng',
    duration: '1 vòng chơi',
    destination: 'Chủ sở hữu BĐS Nghỉ Dưỡng',
  },
  [MarketCardId.MC_FREEZE_TRADE]: {
    description: 'Đóng băng thị trường & siết tín dụng BĐS: Tạm ngừng mua bán, cấm thế chấp đất mới và phong tỏa chuyển nhượng P2P trong 2 vòng.',
    targetScope: 'Toàn bộ thị trường bất động sản',
    effectDetail: 'Tạm ngưng mua ô đất mới, đóng băng đấu giá, cấm thế chấp đất mới và phong tỏa giao dịch chuyển nhượng P2P trong 2 vòng',
    duration: '2 vòng chơi',
    destination: 'Đóng băng các kênh thanh khoản thị trường',
  },
  [MarketCardId.MC_FUEL_SURGE]: {
    description: 'Biến động giá xăng dầu: Mỗi người nộp 500 Tr. phụ phí nhiên liệu và cước vận tải tại ô hạ tầng tăng 500 Tr.',
    targetScope: '4 ô Hạ tầng Giao thông (Long Thành, Hải Phòng, Đà Nẵng, Nội Bài)',
    effectDetail: 'Mỗi người nộp ngay 500 Tr. phụ phí nhiên liệu (chủ ô Hạ tầng được nhận, hoặc nộp Kho Bạc nếu chưa ai sở hữu). Trong 2 vòng tới, cước giẫm vào ô Hạ tầng tăng thêm 500 Tr.',
    duration: '2 vòng chơi',
    destination: 'Chủ sở hữu ô Hạ tầng giao thông / Kho Bạc',
  },
  [MarketCardId.MC_URBAN_PLANNING]: {
    description: 'Quy hoạch trục đô thị mới: Tăng 20% giá trị khi thế chấp BĐS trung tâm Hà Nội & TP.HCM.',
    targetScope: 'Bất động sản trung tâm Hà Nội và TP.HCM (Nhóm Xanh Lá & Tím)',
    effectDetail: 'Tăng 20% giá trị khi thế chấp (nhận 60% thay vì 50% giá niêm yết)',
    duration: '1 vòng chơi',
    destination: 'Ngân sách người chơi',
  },
  [MarketCardId.MC_UTILITY_DOUBLE]: {
    description: 'Tăng khung giá bán lẻ điện & viễn thông: Nhân đôi phí dịch vụ tiện ích công cộng.',
    targetScope: '2 ô Tiện ích công cộng (Ô 12 EVN, Ô 28 Viễn thông)',
    effectDetail: 'Nhân đôi phí tiện ích công cộng trong 2 vòng và tất cả người chơi lập tức nộp 400 Tr. tiền điện & cước viễn thông (chia đều cho chủ ô EVN/Viettel hoặc nộp Kho Bạc)',
    duration: '2 vòng chơi',
    destination: 'Chủ sở hữu ô Tiện ích công cộng',
  },
  [MarketCardId.MC_COASTAL_STORM]: {
    description: 'Bão lũ đổ bộ diện rộng dải duyên hải gây ngập lụt và cô lập giao thông ven biển.',
    targetScope: 'Các ô BĐS Duyên Hải ven biển (Ô 11, 14, 16, 18, 19)',
    effectDetail: 'Chủ sở hữu nộp 400 Tr./cấp nhà vào Kho Bạc khắc phục bão lũ; miễn 100% tiền thuê và người dừng chân bị cô lập giao thông (mất lượt kế tiếp) trong 2 vòng',
    duration: '2 vòng chơi',
    destination: 'Kho Bạc Nhà Nước khắc phục bão lũ',
  },
};

export function getChanceCardInfo(card: ChanceCardId, playerId?: string): EventCardInfo {
  const detail = CHANCE_CARD_DETAILS[card];
  return {
    id: card,
    type: 'Chance',
    cardType: 'chance',
    cardId: card,
    title: vi.chanceCards[card] ?? card,
    description: detail?.description ?? 'Cơ hội phát triển kinh doanh và mở rộng mạng lưới địa ốc.',
    targetScope: detail?.targetScope ?? 'Toàn bộ người chơi',
    effectDetail: detail?.effectDetail ?? detail?.description ?? '',
    duration: detail?.duration ?? 'Tức thì',
    destination: detail?.destination ?? 'Ngân sách cá nhân',
    ...(detail?.effectDelta !== undefined ? { effectDelta: detail.effectDelta } : {}),
    ...(playerId ? { playerId, drawnBy: playerId } : {}),
  };
}

export function getMarketCardInfo(card: MarketCardId): EventCardInfo {
  const detail = MARKET_CARD_DETAILS[card];
  return {
    id: card,
    type: 'Market',
    cardType: 'market',
    cardId: card,
    title: vi.marketCards[card] ?? card,
    description: detail?.description ?? 'Biến động chính sách vĩ mô và dòng vốn đầu tư toàn quốc.',
    targetScope: detail?.targetScope ?? 'Toàn bàn cờ',
    effectDetail: detail?.effectDetail ?? detail?.description ?? '',
    duration: detail?.duration ?? '1 vòng',
    destination: detail?.destination ?? 'Toàn thị trường',
  };
}
