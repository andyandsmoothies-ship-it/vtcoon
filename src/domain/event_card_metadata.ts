// [UC-GAME-038..041/MSS][IMP-360] Metadata, descriptions and financial deltas for Chance & Market cards
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
    description: 'Trúng đấu giá biển số xe ngũ quý, nhận đặc quyền tăng tốc thêm một lượt đi.',
    targetScope: 'Người chơi rút thẻ',
    effectDetail: 'Nộp 500 lệ phí đấu giá biển số, nhận thêm 1 lượt gieo xúc xắc đi tiếp.',
    duration: 'Tức thì',
    destination: 'Nộp 500 vào Kho Bạc Nhà Nước',
    effectDelta: -500,
  },
  [ChanceCardId.CC_TAX_AUDIT]: {
    description: 'Đoàn kiểm tra liên ngành truy thu thuế đối với các lô đất chưa xây dựng.',
    targetScope: 'Người chơi rút thẻ (các ô đất Cấp 0 chưa xây dựng)',
    effectDetail: 'Truy thu thuế: Phạt 500/ô đất trống Cấp 0 vào Kho Bạc (tăng từ 200).',
    duration: 'Tức thì',
    destination: 'Nộp phạt vào Kho Bạc Nhà Nước',
  },
  [ChanceCardId.CC_STOCK_PROFIT]: {
    description: 'Danh mục cổ phiếu blue-chip tăng kịch trần, thực hiện lệnh chốt lời toàn bộ.',
    targetScope: 'Người chơi rút thẻ',
    effectDetail: 'Chốt lời cổ phiếu danh mục VN30 thành công, nhận ngay 2.500 tiền mặt',
    duration: 'Tức thì',
    destination: 'Cộng 2.500 vào số dư tài khoản cá nhân',
    effectDelta: 2500,
  },
  [ChanceCardId.CC_DIPLOMATIC]: {
    description: 'Đặc quyền ngoại giao giúp bạn được miễn phí thuê khi ghé thăm đối thủ.',
    targetScope: 'Người chơi rút thẻ (lưu trên tay)',
    effectDetail: 'Đặc quyền ngoại giao: Miễn 100% tiền thuê khi ghé thăm BĐS đối thủ.',
    duration: 'Lưu giữ đến khi kích hoạt',
    destination: 'Bảo toàn tài chính cá nhân',
  },
  [ChanceCardId.CC_CONTRACT_PENALTY]: {
    description: 'Dự án chậm tiến độ cam kết, phải bồi thường hợp đồng cho đối thủ khó khăn nhất.',
    targetScope: 'Người chơi rút thẻ và người chơi nghèo nhất bàn cờ',
    effectDetail: 'Chậm tiến độ: Bồi thường vi phạm hợp đồng 1.000 cho người nghèo nhất.',
    duration: 'Tức thì',
    destination: 'Trừ 1.000 chuyển sang tài khoản người nghèo nhất',
    effectDelta: -1000,
  },
  [ChanceCardId.CC_LAND_CHANGE]: {
    description: 'Duyệt chuyển đổi mục đích sử dụng đất, nâng cấp thẳng lên nhà phố không cần đủ bộ màu.',
    targetScope: 'Người chơi rút thẻ (các ô đất Cấp 0)',
    effectDetail: 'Nộp 500 nâng 1 ô C0 lên C1 (hoặc nhận 600 hỗ trợ nếu không có ô C0).',
    duration: 'Tức thì',
    destination: 'Kho Bạc Nhà Nước hoặc Ngân sách người chơi',
    effectDelta: -500,
  },
  [ChanceCardId.CC_BUILD_HALT]: {
    description: 'Công trình chưa đạt chuẩn an toàn, tạm dừng khai thác và nộp phạt hoàn thiện hồ sơ.',
    targetScope: '1 ô đất bất kỳ của người chơi rút thẻ',
    effectDetail: 'Vi phạm an toàn: Phạt 800 và tạm ngưng thu tiền thuê 1 ô đất 2 vòng.',
    duration: '2 vòng chơi',
    destination: 'Nộp phạt 800 vào Kho Bạc Nhà Nước',
    effectDelta: -800,
  },
  [ChanceCardId.CC_MA_FORCE]: {
    description: 'Kích hoạt thương vụ mua lại khu đất chiến lược của đối thủ hoặc nhận trợ cấp Kho Bạc.',
    targetScope: '1 ô đất Cấp 0 thuộc quyền sở hữu đối thủ',
    effectDetail: 'Kích hoạt M&A: Mua 1 ô đất C0 đối thủ giá 120%, hoặc nhận 800 Kho Bạc.',
    duration: 'Tức thì',
    destination: 'Thanh toán trực tiếp cho người chơi sở hữu hoặc nhận từ Kho Bạc',
  },
  [ChanceCardId.CC_COPYRIGHT]: {
    description: 'Vi phạm bản quyền hình ảnh quảng bá, nộp án phạt theo quyết định thanh tra.',
    targetScope: 'Người chơi rút thẻ',
    effectDetail: 'Vi phạm bản quyền thương hiệu: Nộp phạt hành chính 1.200 vào Kho Bạc.',
    duration: 'Tức thì',
    destination: 'Nộp phạt 1.200 vào Kho Bạc Nhà Nước',
    effectDelta: -1200,
  },
  [ChanceCardId.CC_OVERDRAFT]: {
    description: 'Giải ngân hạn mức thấu chi bổ sung vốn lưu động, hoàn trả gốc và lãi sau 3 vòng.',
    targetScope: 'Người chơi rút thẻ',
    effectDetail: 'Thấu chi vốn lưu động: Nhận ngay 3.000, hoàn trả 3.300 sau 3 vòng chơi.',
    duration: '3 vòng chơi',
    destination: 'Nhận ngay 3.000, hoàn trả 3.300 nộp Kho Bạc sau 3 vòng',
    effectDelta: 3000,
  },
  [ChanceCardId.CC_JUNK_STOCK]: {
    description: 'Làn sóng bán tháo diện rộng làm mất thanh khoản, buộc bạn phải cắt lỗ danh mục.',
    targetScope: 'Người chơi rút thẻ',
    effectDetail: 'Trừ -1.500 nộp Kho Bạc do kẹp hàng cổ phiếu rác mất thanh khoản',
    duration: 'Tức thì',
    destination: 'Nộp -1.500 vào Kho Bạc Nhà Nước',
    effectDelta: -1500,
  },
  [ChanceCardId.CC_FRANCHISE]: {
    description: 'Chuỗi F&B mở rộng thần tốc, thu phí nhượng quyền thương hiệu từ tất cả đối thủ.',
    targetScope: 'Tất cả đối thủ còn lại trên bàn cờ',
    effectDetail: 'Thu phí nhượng quyền kinh doanh chuỗi F&B 800 từ mỗi đối thủ',
    duration: 'Tức thì',
    destination: 'Chuyển tiền từ các đối thủ về tài khoản cá nhân',
  },
  [ChanceCardId.CC_LAND_RECLAIM]: {
    description: 'Quy hoạch đường vành đai đi qua khu đất, nhận tiền bồi thường giải phóng mặt bằng thỏa đáng.',
    targetScope: '1 ô đất bất kỳ của người chơi rút thẻ',
    effectDetail: 'Thu hồi đất giải phóng mặt bằng: Nhận bồi hoàn 150% giá trị niêm yết.',
    duration: 'Tức thì',
    destination: 'Kho Bạc chi trả tiền bồi thường vào tài khoản',
  },
  [ChanceCardId.CC_VENUE_INCIDENT]: {
    description: 'Khu dịch vụ gặp sự cố kỹ thuật, chi trả kinh phí sửa chữa và đảm bảo an toàn.',
    targetScope: 'Người chơi rút thẻ',
    effectDetail: 'Sự cố cơ sở dịch vụ: Phạt khắc phục 1.200 (hoặc nộp 600 phí an toàn).',
    duration: 'Tức thì',
    destination: 'Nộp phạt vào Kho Bạc Nhà Nước',
    effectDelta: -1200,
  },
  [ChanceCardId.CC_CONCERT_SPONSOR]: {
    description: 'Tài trợ sự kiện đếm ngược đón năm mới, nhận đặc quyền tăng tốc gấp đôi ở lượt tới.',
    targetScope: 'Người chơi rút thẻ',
    effectDetail: 'Tài trợ âm nhạc 600, nhân đôi kết quả xúc xắc ở lượt tiếp theo.',
    duration: 'Lượt tiếp theo',
    destination: 'Trừ 600 nộp vào Kho Bạc Nhà Nước',
    effectDelta: -600,
  },
  [ChanceCardId.CC_FREE_CREDIT]: {
    description: 'Quỹ đổi mới sáng tạo giải ngân vốn kinh doanh, hoàn trả lãi nhẹ khi qua ô Khởi Hành.',
    targetScope: 'Người chơi rút thẻ',
    effectDetail: 'Nhận ngay 2.000 tiền mặt, nộp lãi 400 mỗi lần đi qua ô Khởi Hành (GO)',
    duration: 'Duy trì đến hết trận hoặc khi tất toán',
    destination: 'Giải ngân 2.000 vào tài khoản, nộp lãi 400 vào Kho Bạc khi qua ô GO',
    effectDelta: 2000,
  },
  [ChanceCardId.CC_PORT_EXCLUSIVE]: {
    description: 'Thương cảng đón tàu hàng tấp nập, nhận ngay cổ tức logistics và chia sẻ cước vận tải.',
    targetScope: 'Tất cả người chơi dừng chân tại các ô Cảng biển',
    effectDetail: 'Nhận 1.000 cổ tức logistics và hưởng 50% phí khi ai ghé Cảng biển 2 vòng.',
    duration: '2 vòng chơi',
    destination: 'Kho Bạc giải ngân 1.000 và trích 50% phí cảng về tài khoản',
    effectDelta: 1000,
  },
  [ChanceCardId.CC_SLOW_BUILD]: {
    description: 'Đất trống bỏ hoang quá hạn quy định, bị lập biên bản phạt và cảnh báo thu hồi.',
    targetScope: 'Người chơi rút thẻ và các ô đất Cấp 0',
    effectDetail: 'Chậm tiến độ: Phạt 600/ô C0 và đếm hạn thu hồi (hoặc nộp 300 phí nếu 0 ô).',
    duration: 'Tức thì & 3 vòng chơi',
    destination: 'Nộp phạt vào Kho Bạc Nhà Nước',
    effectDelta: -600,
  },
  [ChanceCardId.CC_MEDIA_CRISIS]: {
    description: 'Khiếu nại khách hàng lan truyền trên mạng, chi phí xử lý truyền thông và tạm ngưng phục vụ.',
    targetScope: '1 ô Dịch vụ có cấp nhà cao nhất của người rút thẻ',
    effectDetail: 'Khủng hoảng truyền thông: Phạt 800 và tạm đình chỉ thu phí 1 ô DV 2 vòng.',
    duration: '2 vòng chơi',
    destination: 'Nộp phạt 800 vào Kho Bạc Nhà Nước',
    effectDelta: -800,
  },
  [ChanceCardId.CC_SWAP_PROJECT]: {
    description: 'Ưu tiên đàm phán mua lại dự án đối thủ đang bỏ hoang kèm 30% lợi nhuận bù đắp.',
    targetScope: '1 ô đất Cấp 0 của đối thủ (không thuộc nhóm độc quyền)',
    effectDetail: 'Kích hoạt quyền mua lại dự án đền bù 130% giá gốc từ đối thủ',
    duration: '15 giây đàm phán',
    destination: 'Đền bù 130% giá đất cho đối thủ',
  },
};

export const MARKET_CARD_DETAILS: Readonly<Record<MarketCardId, MarketCardDetail>> = {
  [MarketCardId.MC_NIGHT_ECONOMY]: {
    description: 'Khai trương tuyến phố ẩm thực đêm, du khách đông đúc nhân đôi doanh thu các khu dịch vụ.',
    targetScope: 'Tất cả người chơi và BĐS Dịch vụ (Ô 6, 8, 26, 27)',
    effectDetail: 'Chi tiêu 400 kích cầu. Nhân đôi tiền thuê ô Dịch vụ (C1+) trong 2 vòng.',
    duration: '2 vòng chơi',
    destination: 'Chủ sở hữu ô Dịch vụ hoặc Kho Bạc Nhà Nước',
  },
  [MarketCardId.MC_MEGA_CONCERT]: {
    description: 'Đại nhạc hội quy tụ dàn sao quốc tế, tập hợp toàn bộ người chơi về điểm giải trí sầm uất nhất.',
    targetScope: 'Tất cả người chơi trên bàn cờ',
    effectDetail: 'Tập trung toàn bộ người chơi đến ô Dịch vụ có cấp nhà cao nhất.',
    duration: 'Tức thì',
    destination: 'Chủ sở hữu ô Dịch vụ đón khách',
  },
  [MarketCardId.MC_ALCOHOL_CHECK]: {
    description: 'Tổng kiểm tra nồng độ cồn diện rộng tại các tổ hợp dịch vụ giải trí, vắng khách và phạt nặng các phương tiện vi phạm.',
    targetScope: '4 ô BĐS Dịch vụ: Bình Dương, Đồng Nai, Hải Phòng, Phú Quốc',
    effectDetail: 'Giảm 50% tiền thuê ô Dịch vụ 2 vòng. Ai ghé phạt 800 và mất lượt.',
    duration: '2 vòng chơi',
    destination: 'Nộp phạt 800 vào Kho Bạc Nhà Nước',
  },
  [MarketCardId.MC_CASINO_PILOT]: {
    description: 'Nghị quyết thí điểm tổ hợp casino, chi thưởng hấp dẫn cho các cơ sở dịch vụ cao cấp.',
    targetScope: 'Chủ sở hữu ô 27 (Kiên Giang - Phú Quốc) đạt Cấp 3 hoặc ô Dịch Vụ Cấp 2 trở lên',
    effectDetail: 'Thưởng 1.500 ô DV C2+, 3.000 ô 27 C3; hoặc trợ cấp 1.000 người nghèo nhất.',
    duration: 'Tức thì',
    destination: 'Kho Bạc Nhà Nước chi thưởng về tài khoản cá nhân',
  },
  [MarketCardId.MC_RATE_HIKE]: {
    description: 'Ngân hàng thắt chặt tiền tệ kiềm chế lạm phát, tăng 20% chi phí xây nhà và tăng lãi suất thế chấp khi qua ô Khởi Hành.',
    targetScope: 'Toàn bộ thị trường',
    effectDetail: 'Tăng 20% chi phí xây dựng và thu lãi vay 10% khi vượt GO trong 2 vòng.',
    duration: '2 vòng chơi',
    destination: 'Nộp vào Kho Bạc Nhà Nước',
  },
  [MarketCardId.MC_CREDIT_STIMULUS]: {
    description: 'Chính sách hạ lãi suất phục hồi thị trường, giảm chi phí xây dựng và miễn lãi vay thế chấp.',
    targetScope: 'Toàn bộ người chơi trên bàn cờ',
    effectDetail: 'Giảm 20% chi phí xây dựng và miễn 100% lãi suất thế chấp trong 1 vòng.',
    duration: '1 vòng chơi',
    destination: 'Ngân sách người chơi (tiết kiệm chi phí đầu tư)',
  },
  [MarketCardId.MC_LAND_FEVER]: {
    description: 'Quy hoạch hạ tầng liên vùng kích hoạt làn sóng sốt đất, nhân đôi doanh thu tiền thuê (x2) và tăng giá chuyển nhượng.',
    targetScope: 'Đô thị vệ tinh Bình Dương, Đồng Nai, Hưng Yên (Ô 6, 8, 31)',
    effectDetail: 'Sốt đất vùng ven: Nhân đôi tiền thuê (x2) tại Bình Dương, Đồng Nai, Hưng Yên.',
    duration: '1 vòng chơi',
    destination: 'Chủ sở hữu bất động sản tại vùng sốt đất',
  },
  [MarketCardId.MC_FIRE_INSPECTION]: {
    description: 'Rà soát an toàn phòng cháy toàn quốc, xử phạt các công trình xây dựng chưa đạt chuẩn kỹ thuật.',
    targetScope: 'Tất cả người chơi có công trình xây dựng (C1-C3)',
    effectDetail: 'Phạt 200/nhà C1, 400/nhà C2, 800/nhà C3. Đất trống (Cấp 0): Miễn phạt',
    duration: 'Tức thì',
    destination: 'Nộp phạt vào Kho Bạc Nhà Nước',
  },
  [MarketCardId.MC_PUBLIC_INVEST]: {
    description: 'Giải ngân vốn ngân sách vào đại dự án giao thông, trợ cấp nhà đầu tư và nhân đôi cước vận tải.',
    targetScope: 'Toàn bộ người chơi và 4 trạm Hạ tầng Giao thông (Ô 5, 15, 25, 35)',
    effectDetail: 'Thưởng 400 mỗi người, 1.000/ô Hạ tầng và nhân đôi cước Ga Tàu trong 2 vòng.',
    duration: '2 vòng chơi',
    destination: 'Kho Bạc Nhà Nước chi trả về tài khoản nhà đầu tư',
  },
  [MarketCardId.MC_ANTI_SPECULATE]: {
    description: 'Ban hành chính sách siết đầu cơ địa ốc, tăng thuế sang nhượng thứ cấp và đánh thuế người ôm nhiều đất.',
    targetScope: 'Toàn bộ các giao dịch chuyển nhượng bất động sản P2P',
    effectDetail: 'Siết đầu cơ: Thuế chuyển nhượng P2P 20% và phạt 1.000 nếu sở hữu ≥4 ô đất.',
    duration: '1 vòng chơi',
    destination: 'Nộp thuế vào Kho Bạc Nhà Nước',
  },
  [MarketCardId.MC_PEAK_TOURISM]: {
    description: 'Du khách quốc tế tăng trưởng kỷ lục, các khu nghỉ dưỡng ven biển nhân đôi doanh thu tiền thuê.',
    targetScope: 'Tất cả các ô BĐS Nghỉ Dưỡng (Ô 11, 13, 14, 21, 24, 29)',
    effectDetail: 'Cao điểm du lịch: Nhân đôi toàn bộ tiền thuê BĐS Nghỉ Dưỡng trong 1 vòng.',
    duration: '1 vòng chơi',
    destination: 'Chủ sở hữu BĐS Nghỉ Dưỡng',
  },
  [MarketCardId.MC_FREEZE_TRADE]: {
    description: 'Thị trường bất động sản đóng băng thanh khoản, tạm dừng mua bán và phong tỏa thế chấp.',
    targetScope: 'Toàn bộ thị trường bất động sản',
    effectDetail: 'Đóng băng thị trường: Cấm mua đất, đấu giá, thế chấp và chuyển nhượng 2 vòng.',
    duration: '2 vòng chơi',
    destination: 'Đóng băng các kênh thanh khoản thị trường',
  },
  [MarketCardId.MC_FUEL_SURGE]: {
    description: 'Giá dầu thế giới leo thang, áp phụ phí nhiên liệu lên toàn bộ mạng lưới vận tải.',
    targetScope: '4 ô Hạ tầng Giao thông (Long Thành, Hải Phòng, Đà Nẵng, Nội Bài)',
    effectDetail: 'Nộp ngay 500 phụ phí nhiên liệu. Cước 4 Ga Tàu tăng +500 trong 2 vòng.',
    duration: '2 vòng chơi',
    destination: 'Chủ sở hữu ô Hạ tầng giao thông / Kho Bạc',
  },
  [MarketCardId.MC_URBAN_PLANNING]: {
    description: 'Quy hoạch trung tâm tài chính mới công bố, nhân 1.5x tiền thuê và tăng 20% giá trị khi thế chấp các BĐS lõi trung tâm.',
    targetScope: 'Bất động sản trung tâm Hà Nội và TP.HCM (Nhóm Xanh Lá & Tím)',
    effectDetail: 'Quy hoạch TT: Nhân 1.5x tiền thuê và thế chấp nhận 60% thay vì 50% tại HN/HCM.',
    duration: '2 vòng chơi',
    destination: 'Chủ sở hữu BĐS Hà Nội/TP.HCM & Ngân sách người chơi',
  },
  [MarketCardId.MC_UTILITY_DOUBLE]: {
    description: 'Biểu giá điện và cước viễn thông điều chỉnh tăng, nâng chi phí tiện ích định kỳ toàn thành phố.',
    targetScope: '2 ô Tiện ích công cộng (Ô 12 EVN, Ô 28 Viễn thông)',
    effectDetail: 'Nộp ngay 400 tiền điện nước. Nhân đôi cước EVN & Viettel trong 2 vòng.',
    duration: '2 vòng chơi',
    destination: 'Chủ sở hữu ô Tiện ích công cộng',
  },
  [MarketCardId.MC_COASTAL_STORM]: {
    description: 'Bão nhiệt đới đổ bộ dải duyên hải, các khu nghỉ dưỡng ven biển tạm ngưng đón khách du lịch.',
    targetScope: 'Các ô BĐS Duyên Hải ven biển (Ô 11, 14, 16, 18, 19)',
    effectDetail: 'Bão biển: Nộp 400/cấp nhà; miễn 100% thuê ven biển và mất lượt trong 2 vòng.',
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
