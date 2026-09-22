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
    description: 'Trúng đấu giá biển số siêu đẹp ngũ quý 9. Nộp lệ phí định danh vào Kho Bạc, kích hoạt đặc quyền tăng tốc.',
    targetScope: 'Người chơi rút thẻ',
    effectDetail: 'Nộp lệ phí đấu giá 500 Tr., nhận đặc quyền tung xúc xắc đi tiếp một lượt bổ sung',
    duration: 'Tức thì',
    destination: 'Nộp 500 Tr. vào Kho Bạc Nhà Nước',
    effectDelta: -500,
  },
  [ChanceCardId.CC_TAX_AUDIT]: {
    description: 'Đoàn liên ngành kiểm tra việc sử dụng đất đô thị. Truy thu thuế đối với toàn bộ các lô đất đang bỏ trống.',
    targetScope: 'Người chơi rút thẻ (các ô đất Cấp 0 chưa xây dựng)',
    effectDetail: 'Nộp phạt 500 Tr. cho mỗi ô đất trống Cấp 0 chưa xây dựng công trình vào Kho Bạc Nhà Nước (khung phạt điều chỉnh từ 200 Tr.)',
    duration: 'Tức thì',
    destination: 'Nộp phạt vào Kho Bạc Nhà Nước',
  },
  [ChanceCardId.CC_STOCK_PROFIT]: {
    description: 'Danh mục cổ phiếu blue-chip tăng kịch trần liên tiếp 5 phiên. Thực hiện lệnh chốt lời toàn bộ.',
    targetScope: 'Người chơi rút thẻ',
    effectDetail: 'Chốt lời cổ phiếu danh mục VN30 thành công, nhận ngay 2.500 Tr. tiền mặt',
    duration: 'Tức thì',
    destination: 'Cộng 2.500 Tr. vào số dư tài khoản cá nhân',
    effectDelta: 2500,
  },
  [ChanceCardId.CC_DIPLOMATIC]: {
    description: 'Nhận tấm thẻ đặc quyền quan hệ đối ngoại. Bảo hộ bạn không phải trả bất kỳ đồng phí thuê nào khi dừng chân.',
    targetScope: 'Người chơi rút thẻ (lưu trên tay)',
    effectDetail: 'Miễn 100% tiền thuê tại bất động sản đối thủ Cấp 0-C3 và tự động tiêu thụ thẻ',
    duration: 'Lưu giữ đến khi kích hoạt',
    destination: 'Bảo toàn tài chính cá nhân',
  },
  [ChanceCardId.CC_CONTRACT_PENALTY]: {
    description: 'Công trình trễ hạn nghiệm thu cam kết. Bồi thường hợp đồng và chuyển thẳng nguồn kinh phí cho đối thủ khó khăn nhất.',
    targetScope: 'Người chơi rút thẻ và người chơi nghèo nhất bàn cờ',
    effectDetail: 'Bồi thường vi phạm hợp đồng 1.000 Tr. chuyển trực tiếp cho người chơi có số dư thấp nhất bàn cờ (người nghèo nhất)',
    duration: 'Tức thì',
    destination: 'Trừ 1.000 Tr. chuyển sang tài khoản người nghèo nhất',
    effectDelta: -1000,
  },
  [ChanceCardId.CC_LAND_CHANGE]: {
    description: 'Hồ sơ chuyển đổi mục đích sử dụng đất được phê duyệt. Nâng cấp thẳng dự án lên nhà phố mà không cần gom trọn bộ màu.',
    targetScope: 'Người chơi rút thẻ (các ô đất Cấp 0)',
    effectDetail: 'Nộp lệ phí 500 Tr. vào Kho Bạc, nâng cấp ngay 1 ô đất Cấp 0 lên Cấp 1 không cần hoàn thành nhóm màu. Nếu không có ô Cấp 0, nhận 600 Tr. hỗ trợ từ Kho Bạc',
    duration: 'Tức thì',
    destination: 'Kho Bạc Nhà Nước hoặc Ngân sách người chơi',
    effectDelta: -500,
  },
  [ChanceCardId.CC_BUILD_HALT]: {
    description: 'Thanh tra xây dựng yêu cầu tạm ngưng dự án do thiếu giấy phép PCCC. Nộp phạt hoàn thiện hồ sơ và đình chỉ khai thác.',
    targetScope: '1 ô đất bất kỳ của người chơi rút thẻ',
    effectDetail: 'Phạt ngay 800 Tr. chi phí thanh tra hoàn thiện pháp lý và tạm ngưng thu tiền thuê tại 1 ô đất trong 2 vòng',
    duration: '2 vòng chơi',
    destination: 'Nộp phạt 800 Tr. vào Kho Bạc Nhà Nước',
    effectDelta: -800,
  },
  [ChanceCardId.CC_MA_FORCE]: {
    description: 'Cơ hội thâu tóm khu đất chiến lược của đối thủ với mức giá ưu đãi, hoặc nhận trợ cấp tái cấu trúc từ Kho Bạc.',
    targetScope: '1 ô đất Cấp 0 thuộc quyền sở hữu đối thủ',
    effectDetail: 'Mua lại 1 ô đất cấp 0 của đối thủ theo giá 120%, hoặc nhận 800 Tr. trợ cấp từ Kho Bạc nếu không có mục tiêu hợp lệ',
    duration: 'Tức thì',
    destination: 'Thanh toán trực tiếp cho người chơi sở hữu hoặc nhận từ Kho Bạc',
  },
  [ChanceCardId.CC_COPYRIGHT]: {
    description: 'Chiến dịch quảng bá vi phạm quyền sở hữu trí tuệ âm nhạc và hình ảnh. Cơ quan chức năng ban hành quyết định xử phạt vi phạm hành chính.',
    targetScope: 'Người chơi rút thẻ',
    effectDetail: 'Xử phạt vi phạm hành chính bản quyền thương hiệu và chương trình biểu diễn 1.200 Tr. vào Kho Bạc Nhà Nước',
    duration: 'Tức thì',
    destination: 'Nộp phạt 1.200 Tr. vào Kho Bạc Nhà Nước',
    effectDelta: -1200,
  },
  [ChanceCardId.CC_OVERDRAFT]: {
    description: 'Ngân hàng giải ngân hạn mức thấu chi khẩn cấp để bổ sung vốn lưu động. Bạn cần hoàn trả cả gốc lẫn lãi sau 3 vòng.',
    targetScope: 'Người chơi rút thẻ',
    effectDetail: 'Giải ngân tạm ứng vốn lưu động 3.000 Tr., hoàn trả 3.300 Tr. gồm gốc và lãi sau 3 vòng',
    duration: '3 vòng chơi',
    destination: 'Nhận ngay 3.000 Tr., hoàn trả 3.300 Tr. nộp Kho Bạc sau 3 vòng',
    effectDelta: 3000,
  },
  [ChanceCardId.CC_JUNK_STOCK]: {
    description: 'Thị trường xuất hiện làn sóng bán tháo hàng đầu cơ khiến tài khoản mất trắng thanh khoản. Bạn phải chấp nhận cắt lỗ khẩn cấp.',
    targetScope: 'Người chơi rút thẻ',
    effectDetail: 'Trừ -1.500 Tr. nộp Kho Bạc do kẹp hàng cổ phiếu rác mất thanh khoản',
    duration: 'Tức thì',
    destination: 'Nộp -1.500 Tr. vào Kho Bạc Nhà Nước',
    effectDelta: -1500,
  },
  [ChanceCardId.CC_FRANCHISE]: {
    description: 'Thương hiệu ẩm thực và cà phê của bạn bùng nổ độ phủ sóng. Mỗi đối thủ trên bàn cờ phải thanh toán phí nhượng quyền kỳ này.',
    targetScope: 'Tất cả đối thủ còn lại trên bàn cờ',
    effectDetail: 'Thu phí nhượng quyền kinh doanh chuỗi F&B 800 Tr. từ mỗi đối thủ',
    duration: 'Tức thì',
    destination: 'Chuyển tiền từ các đối thủ về tài khoản cá nhân',
  },
  [ChanceCardId.CC_LAND_RECLAIM]: {
    description: 'Tuyến đường vành đai mới đi xuyên qua lô đất của bạn. Nhà nước thu hồi mặt bằng và chi trả tiền bồi thường thỏa đáng.',
    targetScope: '1 ô đất bất kỳ của người chơi rút thẻ',
    effectDetail: 'Nhà nước thu hồi đất giải phóng mặt bằng, nhận bồi hoàn 150% giá trị niêm yết',
    duration: 'Tức thì',
    destination: 'Kho Bạc chi trả tiền bồi thường vào tài khoản',
  },
  [ChanceCardId.CC_VENUE_INCIDENT]: {
    description: 'Sự cố quá tải hạ tầng kỹ thuật tại điểm kinh doanh dịch vụ. Bạn cần chi trả kinh phí khắc phục hoặc đóng phí bảo an toàn thành phố.',
    targetScope: 'Người chơi rút thẻ',
    effectDetail: 'Chi phí khắc phục sự cố dịch vụ 1.200 Tr.; nếu không có ô Dịch vụ nộp 600 Tr. phí bảo an toàn thành phố vào Kho Bạc Nhà Nước',
    duration: 'Tức thì',
    destination: 'Nộp phạt vào Kho Bạc Nhà Nước',
    effectDelta: -1200,
  },
  [ChanceCardId.CC_CONCERT_SPONSOR]: {
    description: 'Đồng hành tài trợ sự kiện đếm ngược đón năm mới hoành tráng. Tên tuổi thương hiệu lan tỏa giúp bạn bứt phá thần tốc ở lượt tới.',
    targetScope: 'Người chơi rút thẻ',
    effectDetail: 'Chi phí tài trợ lễ hội âm nhạc 600 Tr., nhận hiệu ứng nhân đôi kết quả xúc xắc ở lượt tiếp theo',
    duration: 'Lượt tiếp theo',
    destination: 'Trừ 600 Tr. nộp vào Kho Bạc Nhà Nước',
    effectDelta: -600,
  },
  [ChanceCardId.CC_FREE_CREDIT]: {
    description: 'Chương trình hỗ trợ vốn kinh doanh không thế chấp từ quỹ đổi mới sáng tạo. Kho Bạc giải ngân ngay vốn, hoàn trả lãi nhẹ mỗi khi qua ô Khởi Hành.',
    targetScope: 'Người chơi rút thẻ',
    effectDetail: 'Nhận ngay 2.000 Tr. tiền mặt, nộp lãi 400 Tr. mỗi lần đi qua ô Khởi Hành (GO)',
    duration: 'Duy trì đến hết trận hoặc khi tất toán',
    destination: 'Giải ngân 2.000 Tr. vào tài khoản, nộp lãi 400 Tr. vào Kho Bạc khi qua ô GO',
    effectDelta: 2000,
  },
  [ChanceCardId.CC_PORT_EXCLUSIVE]: {
    description: 'Thương cảng quốc tế đón siêu tàu container cập bến liên tục. Bạn nhận ngay cổ tức logistics và hưởng thêm phí vận tải trong 2 vòng.',
    targetScope: 'Tất cả người chơi dừng chân tại các ô Cảng biển',
    effectDetail: 'Nhận ngay 1.000 Tr. cổ tức logistics từ Kho Bạc và trích nhận 50% doanh thu phí vận tải khi người chơi khác dừng chân tại ô Cảng biển trong 2 vòng',
    duration: '2 vòng chơi',
    destination: 'Kho Bạc giải ngân 1.000 Tr. và trích 50% phí cảng về tài khoản',
    effectDelta: 1000,
  },
  [ChanceCardId.CC_SLOW_BUILD]: {
    description: 'Khu đất trống để hoang quá thời hạn quy định bị cơ quan quản lý lập biên bản xử phạt và phát lệnh cảnh báo thu hồi.',
    targetScope: 'Người chơi rút thẻ và các ô đất Cấp 0',
    effectDetail: 'Phạt 600 Tr. nộp Kho Bạc cho ô đất Cấp 0 và bắt đầu đếm hạn thu hồi; nếu mất khả năng thanh toán (số dư âm), ô đất bị thu hồi tức thì. Không có ô C0 nộp phí hành chính 300 Tr.',
    duration: 'Tức thì & 3 vòng chơi',
    destination: 'Nộp phạt vào Kho Bạc Nhà Nước',
    effectDelta: -600,
  },
  [ChanceCardId.CC_MEDIA_CRISIS]: {
    description: 'Dịch vụ khách hàng phát sinh khiếu nại lan truyền trên mạng xã hội. Doanh nghiệp phải chi ngân sách xử lý truyền thông và tạm đóng cửa chấn chỉnh.',
    targetScope: '1 ô Dịch vụ có cấp nhà cao nhất của người rút thẻ',
    effectDetail: 'Phạt ngay 800 Tr. chi phí xử lý khủng hoảng truyền thông và tạm đình chỉ thu phí tại 1 ô Dịch vụ trong 2 vòng',
    duration: '2 vòng chơi',
    destination: 'Nộp phạt 800 Tr. vào Kho Bạc Nhà Nước',
    effectDelta: -800,
  },
  [ChanceCardId.CC_SWAP_PROJECT]: {
    description: 'Kích hoạt quyền ưu tiên đàm phán mua lại dự án đang bỏ hoang của đối thủ với mức đền bù lợi nhuận 30% giá gốc.',
    targetScope: '1 ô đất Cấp 0 của đối thủ (không thuộc nhóm độc quyền)',
    effectDetail: 'Kích hoạt quyền mua lại dự án đền bù 130% giá gốc từ đối thủ',
    duration: '15 giây đàm phán',
    destination: 'Đền bù 130% giá đất cho đối thủ',
  },
};

export const MARKET_CARD_DETAILS: Readonly<Record<MarketCardId, MarketCardDetail>> = {
  [MarketCardId.MC_NIGHT_ECONOMY]: {
    description: 'Khai trương tuyến phố đi bộ và ẩm thực đêm. Du khách đổ về đông đúc giúp doanh thu tại các khu dịch vụ tăng vọt.',
    targetScope: 'Tất cả người chơi và BĐS Dịch vụ (Ô 6, 8, 26, 27)',
    effectDetail: 'Tất cả người chơi chi tiêu 400 Tr. kích cầu (chia đều cho các chủ ô Dịch vụ hoặc nộp Kho Bạc) và nhân đôi tiền thuê ô Dịch vụ Cấp 1 trở lên trong 2 vòng',
    duration: '2 vòng chơi',
    destination: 'Chủ sở hữu ô Dịch vụ hoặc Kho Bạc Nhà Nước',
  },
  [MarketCardId.MC_MEGA_CONCERT]: {
    description: 'Lễ hội âm nhạc quy mô lớn quy tụ dàn nghệ sĩ hàng đầu. Người hâm mộ và tất cả nhà đầu tư cùng tề tựu về điểm giải trí sầm uất nhất.',
    targetScope: 'Tất cả người chơi trên bàn cờ',
    effectDetail: 'Tập trung toàn bộ người chơi di chuyển ngay đến ô Dịch vụ có cấp công trình cao nhất',
    duration: 'Tức thì',
    destination: 'Chủ sở hữu ô Dịch vụ đón khách',
  },
  [MarketCardId.MC_ALCOHOL_CHECK]: {
    description: 'Chiến dịch tuần tra kiểm soát giao thông toàn thành phố. Lượng khách đi lại sụt giảm, các cơ sở kinh doanh dịch vụ ế ẩm.',
    targetScope: 'Tất cả các ô BĐS Dịch vụ (Ô 6, 8, 26, 27)',
    effectDetail: 'Giảm 50% tiền thuê ô Dịch vụ trong 2 vòng; người dừng chân bị phạt 800 Tr. nộp Kho Bạc Nhà Nước và bị tạm giữ xe (mất lượt kế tiếp)',
    duration: '2 vòng chơi',
    destination: 'Nộp phạt 800 Tr. vào Kho Bạc Nhà Nước',
  },
  [MarketCardId.MC_CASINO_PILOT]: {
    description: 'Nghị quyết mới cho phép người trong nước trải nghiệm tổ hợp giải trí cao cấp. Doanh thu kinh doanh bùng nổ với mức chi thưởng hấp dẫn.',
    targetScope: 'Chủ sở hữu ô 27 (Kiên Giang - Phú Quốc) đạt Cấp 3 hoặc ô Dịch Vụ Cấp 2 trở lên',
    effectDetail: 'Thưởng ngay 1.500 Tr. cho mọi ô Dịch Vụ Cấp 2 trở lên, 3.000 Tr. cho ô 27 đạt Cấp 3; nếu chưa ai có ô Dịch vụ C2+, Kho Bạc giải ngân gói kích cầu 1.000 Tr. cho người có số dư thấp nhất',
    duration: 'Tức thì',
    destination: 'Kho Bạc Nhà Nước chi thưởng về tài khoản cá nhân',
  },
  [MarketCardId.MC_RATE_HIKE]: {
    description: 'Động thái thắt chặt tiền tệ nhằm hạ nhiệt áp lực lạm phát. Lãi suất vay thế chấp tăng cao buộc các nhà đầu tư phải tính toán thận trọng.',
    targetScope: 'Tất cả người chơi đang có khoản vay thế chấp',
    effectDetail: 'Tăng lãi suất vay thế chấp từ 5% lên 10% giá trị vay khi di chuyển qua ô Khởi Hành (GO)',
    duration: '1 vòng chơi',
    destination: 'Nộp vào Kho Bạc Nhà Nước',
  },
  [MarketCardId.MC_CREDIT_STIMULUS]: {
    description: 'Chính sách hạ lãi suất và trợ giá xây lắp nhằm phục hồi thị trường. Đây là thời cơ vàng để mở rộng quy mô các dự án công trình.',
    targetScope: 'Toàn bộ người chơi trên bàn cờ',
    effectDetail: 'Giảm 20% chi phí xây dựng công trình C1-C3 và miễn 100% lãi suất vay thế chấp',
    duration: '1 vòng chơi',
    destination: 'Ngân sách người chơi (tiết kiệm chi phí đầu tư)',
  },
  [MarketCardId.MC_LAND_FEVER]: {
    description: 'Thông tin mở rộng các tuyến giao thông liên vùng kích hoạt làn sóng mua sắm địa ốc. Giá trị chuyển nhượng và tiền thuê đồng loạt tăng mạnh.',
    targetScope: 'Đô thị vệ tinh Bình Dương, Đồng Nai, Hưng Yên (Ô 6, 8, 31)',
    effectDetail: 'Tăng 50% giá trị chuyển nhượng và tiền thuê tại các tâm điểm sốt đất vùng ven',
    duration: '1 vòng chơi',
    destination: 'Chủ sở hữu bất động sản tại vùng sốt đất',
  },
  [MarketCardId.MC_FIRE_INSPECTION]: {
    description: 'Đoàn thanh tra rà soát an toàn cháy nổ trên phạm vi cả nước. Các công trình xây dựng chưa đạt chuẩn kỹ thuật đều phải nộp phạt.',
    targetScope: 'Tất cả người chơi có công trình xây dựng (C1-C3)',
    effectDetail: 'Phạt 200 Tr./nhà C1, 400 Tr./nhà C2, 800 Tr./nhà C3. Đất trống (Cấp 0): Miễn phạt',
    duration: 'Tức thì',
    destination: 'Nộp phạt vào Kho Bạc Nhà Nước',
  },
  [MarketCardId.MC_PUBLIC_INVEST]: {
    description: 'Vốn ngân sách được giải ngân ồ ạt vào các đại dự án hạ tầng giao thông. Mỗi nhà đầu tư đều được thụ hưởng trợ cấp và tăng cước vận tải.',
    targetScope: 'Toàn bộ người chơi và 4 trạm Hạ tầng Giao thông (Ô 5, 15, 25, 35)',
    effectDetail: 'Kho Bạc chi trả ngay 400 Tr. cho mỗi người chơi; thưởng 1.000 Tr. cho mỗi ô Hạ tầng sở hữu và nhân đôi cước phí vận tải trong 2 vòng',
    duration: '2 vòng chơi',
    destination: 'Kho Bạc Nhà Nước chi trả về tài khoản nhà đầu tư',
  },
  [MarketCardId.MC_ANTI_SPECULATE]: {
    description: 'Chính sách siết đầu cơ địa ốc chính thức ban hành. Biểu thuế sang nhượng thứ cấp tăng cao và áp mức thuế tài sản với chủ sở hữu nhiều đất.',
    targetScope: 'Toàn bộ các giao dịch chuyển nhượng bất động sản P2P',
    effectDetail: 'Nâng mức thuế suất chuyển nhượng P2P lên 20% trong 1 vòng và phạt ngay 1.000 Tr. thuế điều tiết tài sản cho người chơi sở hữu từ 4 ô đất trở lên',
    duration: '1 vòng chơi',
    destination: 'Nộp thuế vào Kho Bạc Nhà Nước',
  },
  [MarketCardId.MC_PEAK_TOURISM]: {
    description: 'Kỳ nghỉ hè mang đến làn sóng du khách kỷ lục tại các bãi biển và danh thắng. Các khu nghỉ dưỡng ven biển luôn trong tình trạng kín phòng.',
    targetScope: 'Tất cả các ô BĐS Nghỉ Dưỡng (Ô 11, 13, 14, 21, 24, 29)',
    effectDetail: 'Nhân đôi toàn bộ doanh thu tiền thuê tại các điểm đến du lịch và resort nghỉ dưỡng',
    duration: '1 vòng chơi',
    destination: 'Chủ sở hữu BĐS Nghỉ Dưỡng',
  },
  [MarketCardId.MC_FREEZE_TRADE]: {
    description: 'Dòng vốn chững lại khiến mọi giao dịch mua bán nhà đất tạm ngừng. Mọi kế hoạch huy động vốn qua kênh thế chấp đều bị phong tỏa.',
    targetScope: 'Toàn bộ thị trường bất động sản',
    effectDetail: 'Tạm ngưng mua ô đất mới, đóng băng đấu giá, cấm thế chấp đất mới và phong tỏa giao dịch chuyển nhượng P2P trong 2 vòng',
    duration: '2 vòng chơi',
    destination: 'Đóng băng các kênh thanh khoản thị trường',
  },
  [MarketCardId.MC_FUEL_SURGE]: {
    description: 'Giá dầu thế giới leo thang tác động trực tiếp đến chi phí logistics nội địa. Mọi người chơi đều phải chi trả phụ phí nhiên liệu vận tải.',
    targetScope: '4 ô Hạ tầng Giao thông (Long Thành, Hải Phòng, Đà Nẵng, Nội Bài)',
    effectDetail: 'Mỗi người nộp ngay 500 Tr. phụ phí nhiên liệu (chủ ô Hạ tầng được nhận, hoặc nộp Kho Bạc nếu chưa ai sở hữu). Trong 2 vòng tới, cước giẫm vào ô Hạ tầng tăng thêm 500 Tr.',
    duration: '2 vòng chơi',
    destination: 'Chủ sở hữu ô Hạ tầng giao thông / Kho Bạc',
  },
  [MarketCardId.MC_URBAN_PLANNING]: {
    description: 'Bản đồ quy hoạch trung tâm tài chính mới công bố, tăng 20% giá trị khi thế chấp các BĐS lõi trung tâm.',
    targetScope: 'Bất động sản trung tâm Hà Nội và TP.HCM (Nhóm Xanh Lá & Tím)',
    effectDetail: 'Tăng 20% giá trị khi thế chấp (nhận 60% thay vì 50% giá niêm yết)',
    duration: '1 vòng chơi',
    destination: 'Ngân sách người chơi',
  },
  [MarketCardId.MC_UTILITY_DOUBLE]: {
    description: 'Biểu giá năng lượng và cước viễn thông quốc gia điều chỉnh tăng. Chi phí sinh hoạt định kỳ tăng lên chia về cho các nhà cung cấp.',
    targetScope: '2 ô Tiện ích công cộng (Ô 12 EVN, Ô 28 Viễn thông)',
    effectDetail: 'Nhân đôi phí tiện ích công cộng trong 2 vòng và tất cả người chơi lập tức nộp 400 Tr. tiền điện & cước viễn thông (chia đều cho chủ ô EVN/Viettel hoặc nộp Kho Bạc)',
    duration: '2 vòng chơi',
    destination: 'Chủ sở hữu ô Tiện ích công cộng',
  },
  [MarketCardId.MC_COASTAL_STORM]: {
    description: 'Thiên tai bão nhiệt đới đổ bộ vào dải duyên hải gây ngập lụt nghiêm trọng. Các khu resort ven biển tạm ngưng đón khách du lịch.',
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
