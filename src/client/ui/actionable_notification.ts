// [IMP-134] Actionable In-Game Guidance System & Contextual Notifications
// Universal notification model & error reason mapping

import { vi } from '../../domain/i18n/vi.js';

export interface ActionableNotification {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
  readonly tone: 'info' | 'warning' | 'error' | 'success';
  readonly actionHint?: string;
}

const ACTIONABLE_NOTIFICATIONS_MAP: Record<string, ActionableNotification> = {
  GAME_NOT_STARTED: {
    icon: '⏳',
    title: 'Trận Đấu Chưa Bắt Đầu',
    description: 'Trò chơi đang ở sảnh chờ và chưa chính thức bắt đầu.',
    tone: 'info',
    actionHint: 'Vui lòng chờ chủ phòng khởi động ván đấu.',
  },
  INVALID_PHASE: {
    icon: '⏱️',
    title: 'Chưa Đúng Giai Đoạn Lượt Chơi',
    description: 'Thao tác này không thể thực hiện trong giai đoạn hiện tại.',
    tone: 'warning',
    actionHint: 'Vui lòng chờ đến giai đoạn lượt chơi phù hợp.',
  },
  INSUFFICIENT_FUNDS: {
    icon: '💰',
    title: 'Ngân Sách Không Đủ',
    description: 'Số dư khả dụng không đủ để hoàn tất giao dịch này.',
    tone: 'error',
    actionHint: 'Hãy thế chấp tài sản hoặc hạ cấp công trình để bổ sung vốn.',
  },
  CANNOT_ROLL: {
    icon: '🎲',
    title: 'Chưa Thể Đổ Xúc Xắc',
    description: 'Chưa tới lượt đổ xúc xắc hoặc đang trong bước di chuyển.',
    tone: 'info',
    actionHint: 'Vui lòng chờ đến lượt gieo xúc xắc của bạn.',
  },
  NOT_YOUR_TURN: {
    icon: '⏳',
    title: 'Chưa Tới Lượt Chơi',
    description: 'Hiện tại chưa tới lượt của bạn. Vui lòng chờ đối thủ hoàn thành lượt!',
    tone: 'info',
    actionHint: 'Quan sát diễn biến bàn cờ trong khi chờ đối thủ.',
  },
  MISSING_MONOPOLY: {
    icon: '👑',
    title: 'Chưa Đạt Độc Quyền Bộ Màu',
    description: 'Cần sở hữu trọn bộ màu trước khi nâng cấp công trình!',
    tone: 'warning',
    actionHint: 'Hãy mua hoặc đàm phán các ô đất cùng bộ màu còn lại.',
  },
  EVEN_BUILDING_VIOLATION: {
    icon: '🏗️',
    title: 'Quy Tắc Xây Đều Tay',
    description: 'Quy tắc xây dựng đều tay: Cần nâng cấp các ô cùng bộ màu lên cấp đồng đều!',
    tone: 'warning',
    actionHint: 'Nâng cấp các ô đất có cấp thấp hơn trước.',
  },
  EVEN_DOWNGRADE_VIOLATION: {
    icon: '🔨',
    title: 'Quy Tắc Dỡ Nhà Đều Tay',
    description: 'Quy tắc dỡ nhà đều tay: Cần hạ cấp các công trình trong cùng bộ màu đồng đều!',
    tone: 'warning',
    actionHint: 'Hạ cấp các ô có công trình cấp cao hơn trước.',
  },
  NOT_OWNER: {
    icon: '🚫',
    title: 'Không Phải Chủ Sở Hữu',
    description: 'Bạn không sở hữu bất động sản này để thực hiện thao tác.',
    tone: 'error',
    actionHint: 'Chỉ chủ sở hữu mới có quyền quản lý tài sản này.',
  },
  MAX_LEVEL: {
    icon: '🏢',
    title: 'Công Trình Đạt Cấp Tối Đa',
    description: 'Bất động sản đã đạt cấp độ tối đa, không thể nâng cấp thêm.',
    tone: 'info',
    actionHint: 'Không thể nâng cấp thêm cho ô đất này.',
  },
  HAS_BUILDING: {
    icon: '🏠',
    title: 'Bất Động Sản Đang Có Công Trình',
    description: 'Không thể thế chấp hoặc giao dịch khi vẫn còn công trình xây dựng.',
    tone: 'warning',
    actionHint: 'Hãy hạ cấp dỡ nhà trước khi thế chấp tài sản.',
  },
  NOT_MORTGAGEABLE: {
    icon: '🚫',
    title: 'Ô Đất Không Thể Thế Chấp',
    description: 'Bất động sản này không thuộc danh mục có thể thế chấp cho Ngân hàng.',
    tone: 'error',
    actionHint: 'Hãy chọn bất động sản thông thường khác để thế chấp.',
  },
  PROPERTY_MORTGAGED: {
    icon: '🔒',
    title: 'Bất Động Sản Đang Thế Chấp',
    description: 'Không thể nâng cấp hoặc giao dịch ô đất khi đang bị thế chấp.',
    tone: 'warning',
    actionHint: 'Hãy chuộc lại bất động sản trước khi thực hiện thao tác.',
  },
  NOT_UPGRADEABLE: {
    icon: '🚫',
    title: 'Không Thể Nâng Cấp',
    description: 'Ô đất này không hỗ trợ xây dựng thêm công trình.',
    tone: 'info',
    actionHint: 'Chỉ có thể nâng cấp các ô đất thuộc nhóm màu độc quyền.',
  },
  NEED_2_RAILROADS: {
    icon: '🚆',
    title: 'Chưa Đủ Cơ Sở Hạ Tầng',
    description: 'Cần sở hữu ít nhất 2 cơ sở hạ tầng giao thông (Bến xe / Cảng / Ga).',
    tone: 'warning',
    actionHint: 'Hãy mua thêm hoặc đàm phán đổi lấy cơ sở hạ tầng khác.',
  },
  NOT_UTILITY: {
    icon: '⚡',
    title: 'Không Phải Ô Tiện Ích',
    description: 'Thao tác này chỉ áp dụng cho các ô Tiện Ích công cộng (EVN / Viettel).',
    tone: 'warning',
    actionHint: 'Vui lòng chọn đúng ô tiện ích để thao tác.',
  },
  ALREADY_MORTGAGED: {
    icon: '🔒',
    title: 'Tài Sản Đã Được Thế Chấp',
    description: 'Ô đất này hiện đang ở trạng thái thế chấp.',
    tone: 'info',
    actionHint: 'Chuộc lại thế chấp để khôi phục quyền thu tiền thuê.',
  },
  LIQUIDITY_FROZEN: {
    icon: '🧊',
    title: 'Đóng Băng Thanh Khoản',
    description: 'Bất động sản đang trong chu kỳ đóng băng thanh khoản, không thể thế chấp!',
    tone: 'warning',
    actionHint: 'Chờ chu kỳ đóng băng kết thúc hoặc thế chấp bất động sản thuộc nhóm khác.',
  },
  NOT_MORTGAGED: {
    icon: '🔓',
    title: 'Tài Sản Chưa Thế Chấp',
    description: 'Tài sản này chưa được thế chấp nên không thể chuộc lại.',
    tone: 'info',
    actionHint: 'Chỉ có thể chuộc lại tài sản đang bị thế chấp.',
  },
  GROUP_MORTGAGED: {
    icon: '⚠️',
    title: 'Bộ Màu Có Tài Sản Đang Thế Chấp',
    description: 'Không thể nâng cấp khi có ô cùng bộ màu đang bị thế chấp.',
    tone: 'warning',
    actionHint: 'Hãy giải chấp toàn bộ các ô trong bộ màu trước khi xây dựng.',
  },
  NEED_ALL_UTILITIES: {
    icon: '⚡',
    title: 'Chưa Độc Quyền Tiện Ích',
    description: 'Bắt buộc sở hữu trọn bộ cả 2 Tiện ích (EVN & Viettel) mới có thể nâng cấp Smart Grid hoặc 5G.',
    tone: 'warning',
    actionHint: 'Hãy mua hoặc đàm phán P2P đổi chéo để hoàn thiện bộ đôi tiện ích.',
  },
  AlreadyOwned: {
    icon: '🏷️',
    title: 'Bất Động Sản Đã Có Chủ Sở Hữu',
    description: 'Ô đất này đã có người mua, bạn không thể mua trực tiếp từ Ngân hàng.',
    tone: 'warning',
    actionHint: 'Đề xuất đàm phán với chủ sở hữu để mua lại.',
  },
  NOT_PURCHASABLE: {
    icon: '🚫',
    title: 'Ô Không Thể Mua Bán',
    description: 'Ô này là ô sự kiện hoặc chức năng, không thuộc danh mục mua bán.',
    tone: 'warning',
    actionHint: 'Chỉ có thể mua các ô đất hoặc nhà ga chưa có chủ.',
  },
  DECLINED_PLAYER_CANNOT_BID: {
    icon: '🚫',
    title: 'Không Thể Tham Gia Đấu Giá',
    description: 'Người chơi đã từ chối mua không được phép tham gia đấu giá ô đất này.',
    tone: 'error',
    actionHint: 'Chờ phiên đấu giá giữa các đối thủ kết thúc.',
  },
  PRICE_BELOW_FLOOR: {
    icon: '📉',
    title: 'Giá Đấu Dưới Giá Sàn',
    description: 'Mức giá đấu đưa ra thấp hơn giá sàn quy định của phiên đấu giá.',
    tone: 'warning',
    actionHint: 'Đặt mức giá tối thiểu bằng hoặc cao hơn giá sàn.',
  },
  TRADE_REJECTED: {
    icon: '🤝',
    title: 'Đàm Phán Bị Từ Chối',
    description: 'Đối tác đã từ chối đề xuất đàm phán mua/bán đất!',
    tone: 'info',
    actionHint: 'Điều chỉnh điều kiện trao đổi hấp dẫn hơn và thử lại.',
  },
  FREEZE_ACTIVE: {
    icon: '❄️',
    title: 'Thị Trường Đang Đóng Băng',
    description: 'Hiệu ứng đóng băng thị trường đang hoạt động, tạm dừng mọi giao dịch mua bán và thế chấp.',
    tone: 'warning',
    actionHint: 'Chờ hiệu ứng đóng băng thị trường kết thúc sau các vòng quy định.',
  },
  IN_AUDIT: {
    icon: '⚖️',
    title: 'Đang Trong Trạm Kiểm Toán',
    description: 'Bạn đang bị lưu giữ tại Trạm Kiểm Toán, không thể di chuyển tự do.',
    tone: 'warning',
    actionHint: 'Đổ xí ngầu đôi hoặc nộp tiền bảo lãnh để thoát.',
  },
  NOT_IN_AUDIT: {
    icon: '⚖️',
    title: 'Không Ở Trong Trạm Kiểm Toán',
    description: 'Bạn hiện không bị tạm giữ tại Trạm Kiểm Toán.',
    tone: 'info',
    actionHint: 'Tiếp tục lượt chơi bình thường.',
  },
  SKIPPED_BY_SERVICE_C3: {
    icon: '🌪️',
    title: 'Lượt Chơi Bị Hoãn',
    description: 'Bạn bị hoãn lượt do hiệu ứng bão duyên hải hoặc dịch vụ công C3.',
    tone: 'warning',
    actionHint: 'Nhấn Kết Thúc Lượt để chuyển giao lượt cho người tiếp theo.',
  },
  ROOM_FULL: {
    icon: '🚪',
    title: 'Phòng Đã Đủ Người Chơi',
    description: 'Phòng thi đấu đã đủ 4 người chơi. Vui lòng tạo phòng mới hoặc chờ ván sau!',
    tone: 'warning',
    actionHint: 'Tạo phòng mới để bắt đầu ván đấu cùng bạn bè.',
  },
  ROOM_CODE_COLLISION: {
    icon: '⚠️',
    title: 'Mã Phòng Đã Tồn Tại',
    description: 'Mã phòng này đang được sử dụng. Vui lòng thử lại với mã phòng khác!',
    tone: 'warning',
    actionHint: 'Hệ thống sẽ tự động tạo mã phòng mới.',
  },
  SLOT_CONFLICT: {
    icon: '🪑',
    title: 'Vị Trí Đã Có Người',
    description: 'Vị trí này đã có người chơi hoặc Bot AI tiếp quản.',
    tone: 'warning',
    actionHint: 'Vui lòng chọn vị trí khác trong sảnh chờ.',
  },
  INVALID_ROOM: {
    icon: '🔍',
    title: 'Mã Phòng Không Hợp Lệ',
    description: 'Mã phòng không đúng định dạng quy định.',
    tone: 'error',
    actionHint: 'Kiểm tra lại liên kết mời hoặc mã phòng gồm 6 ký tự.',
  },
  ROOM_NOT_FOUND: {
    icon: '🔍',
    title: 'Không Tìm Thấy Phòng',
    description: 'Không tìm thấy phòng thi đấu. Vui lòng kiểm tra lại mã phòng!',
    tone: 'error',
    actionHint: 'Kiểm tra lại mã phòng hoặc tạo phòng mới.',
  },
  NOT_ENOUGH_PLAYERS: {
    icon: '👥',
    title: 'Chưa Đủ Người Chơi',
    description: 'Chưa đủ người chơi để bắt đầu. Cần tối thiểu 2 người chơi hoặc thêm Bot!',
    tone: 'info',
    actionHint: 'Mời thêm bạn bè hoặc thêm Bot AI vào phòng.',
  },
  NOT_HOST: {
    icon: '👑',
    title: 'Chỉ Chủ Phòng Mới Có Quyền',
    description: 'Chỉ chủ phòng mới có quyền thực hiện thao tác',
    tone: 'info',
    actionHint: 'Chờ chủ phòng bắt đầu trận đấu.',
  },
  ROOM_STARTED: {
    icon: '🎮',
    title: 'Phòng Thi Đấu Đã Bắt Đầu',
    description: 'Phòng này đã bắt đầu trận đấu.',
    tone: 'info',
    actionHint: 'Vui lòng chọn hoặc tạo phòng thi đấu khác.',
  },
  RATE_LIMIT_EXCEEDED: {
    icon: '🛡️',
    title: 'Thao Tác Quá Nhanh',
    description: 'Hệ thống phát hiện thao tác gửi đi quá nhanh. Vui lòng thử lại sau giây lát!',
    tone: 'error',
    actionHint: 'Chờ 1-2 giây trước khi thực hiện thao tác tiếp theo.',
  },
  PLAYER_BANKRUPT: {
    icon: '🪦',
    title: 'Người Chơi Đã Phá Sản',
    description: 'Tài khoản đã phá sản và không thể thực hiện thêm hành động trong trận đấu.',
    tone: 'error',
    actionHint: 'Bạn có thể quan sát tiếp trận đấu hoặc rời phòng.',
  },
  TOKEN_INVALID: {
    icon: '🔑',
    title: 'Phiên Đăng Nhập Hết Hạn',
    description: 'Phiên kết nối đã hết hạn hoặc không hợp lệ. Đang tự động kết nối lại...',
    tone: 'info',
    actionHint: 'Chờ hệ thống tự động làm mới phiên kết nối.',
  },
  BOND_NOT_ELIGIBLE: {
    icon: '📜',
    title: 'Chưa Đủ Điều Kiện Phát Hành Trái Phiếu',
    description: 'Cần tối thiểu 3.000 Net Worth và 2 bất động sản chưa thế chấp để làm tài sản bảo đảm.',
    tone: 'warning',
    actionHint: 'Tích lũy thêm tài sản hoặc giải chấp bớt bất động sản trước khi phát hành trái phiếu.',
  },
  CANNOT_RECOVER: {
    icon: '📉',
    title: 'Không Thể Cân Đối Tài Chính Tự Động',
    description: 'Tổng giá trị tài sản có thể giải tỏa hoặc thế chấp không đủ để bù đắp số dư âm.',
    tone: 'error',
    actionHint: 'Hãy cân nhắc phát hành trái phiếu doanh nghiệp hoặc tuyên bố phá sản.',
  },
  BOND_COLLATERAL_LOCKED: {
    icon: '🔒',
    title: 'Tài Sản Bảo Đảm Trái Phiếu',
    description: 'Bất động sản này đang dùng làm tài sản bảo đảm cho hợp đồng trái phiếu doanh nghiệp!',
    tone: 'warning',
    actionHint: 'Cần tất toán khoản nợ trái phiếu để giải tỏa tài sản bảo đảm.',
  },
  ASSET_LOCKED: {
    icon: '🔒',
    title: 'Tài Sản Đang Trong Giao Dịch',
    description: 'Bất động sản này đang nằm trong đề xuất đàm phán hoặc giao dịch chờ duyệt.',
    tone: 'warning',
    actionHint: 'Vui lòng chờ giao dịch hiện tại hoàn tất hoặc hủy đề xuất.',
  },
  HIGHEST_BIDDER_CANNOT_PASS: {
    icon: '👑',
    title: 'Đang Dẫn Đầu Đấu Giá',
    description: 'Bạn đang là người trả giá cao nhất nên không thể rút lui khỏi phiên đấu giá.',
    tone: 'info',
    actionHint: 'Bạn có thể nhấn "✕ Đóng / Xem Bàn Cờ" để tạm ẩn và theo dõi trận đấu.',
  },
  INTENT_REJECTED: {
    icon: '⚠️',
    title: 'Hành Động Chưa Thể Thực Hiện',
    description: 'Thao tác không phù hợp với giai đoạn lượt chơi hiện tại hoặc tài sản không khả dụng.',
    tone: 'warning',
    actionHint: 'Vui lòng kiểm tra trạng thái lượt chơi hoặc bấm Kết Thúc Lượt.',
  },
  PLAYER_NOT_FOUND: {
    icon: '🔍',
    title: 'Không Tìm Thấy Người Chơi',
    description: 'Người chơi mục tiêu không tồn tại hoặc đã rời trận đấu.',
    tone: 'error',
    actionHint: 'Kiểm tra lại danh sách người chơi trong phòng.',
  },
  INVALID_PLAYER: {
    icon: '👤',
    title: 'Người Chơi Không Hợp Lệ',
    description: 'Đối tượng chỉ định không hợp lệ trong ngữ cảnh này.',
    tone: 'error',
    actionHint: 'Vui lòng chọn lại người chơi hợp lệ trong phòng.',
  },
  UNAUTHORIZED: {
    icon: '🚫',
    title: 'Không Có Quyền Thực Hiện',
    description: 'Bạn không có quyền hạn để thực thi hành động này.',
    tone: 'error',
    actionHint: 'Chỉ người chơi có quyền tương ứng mới có thể thao tác.',
  },
  INVALID_TRADE: {
    icon: '🤝',
    title: 'Đề Xuất Đàm Phán Không Hợp Lệ',
    description: 'Điều kiện trao đổi hoặc danh mục tài sản không hợp lệ.',
    tone: 'warning',
    actionHint: 'Kiểm tra lại tài sản và số tiền trong đề xuất đàm phán.',
  },
  INVALID_PRICE: {
    icon: '📉',
    title: 'Mức Giá Không Hợp Lệ',
    description: 'Mức giá đưa ra không nằm trong khung quy định của phòng chơi.',
    tone: 'warning',
    actionHint: 'Điều chỉnh lại mức giá phù hợp với quy định.',
  },
  TRADE_ALREADY_PENDING: {
    icon: '🤝',
    title: 'Đàm Phán Đang Diễn Ra',
    description: 'Phòng chơi đang có một phiên đàm phán chưa giải quyết giữa các người chơi.',
    tone: 'warning',
    actionHint: 'Vui lòng chờ phiên đàm phán hiện tại kết thúc hoặc phản hồi đề xuất.',
  },
  BOND_ALREADY_ACTIVE: {
    icon: '📜',
    title: 'Đã Có Trái Phiếu Chưa Tất Toán',
    description: 'Người chơi đang có hợp đồng trái phiếu doanh nghiệp đang hoạt động.',
    tone: 'warning',
    actionHint: 'Cần tất toán khoản nợ trái phiếu cũ trước khi phát hành mới.',
  },
  BID_TOO_LOW: {
    icon: '📉',
    title: 'Mức Giá Đấu Quá Thấp',
    description: 'Mức giá đấu đưa ra phải cao hơn giá dẫn đầu hiện tại tối thiểu 50 Tr.',
    tone: 'warning',
    actionHint: 'Tăng mức đặt giá để vượt qua giá dẫn đầu.',
  },
  ALREADY_HIGHEST_BIDDER: {
    icon: '👑',
    title: 'Đang Dẫn Đầu Đấu Giá',
    description: 'Bạn đã là người trả giá cao nhất cho tài sản này.',
    tone: 'info',
    actionHint: 'Chờ các người chơi khác phản hồi hoặc hết thời gian đấu giá.',
  },
  PLAYER_ALREADY_PASSED: {
    icon: '⏹️',
    title: 'Đã Bỏ Qua Đấu Giá',
    description: 'Bạn đã chọn bỏ qua phiên đấu giá này và không thể đặt giá lại.',
    tone: 'info',
    actionHint: 'Theo dõi kết quả phiên đấu giá giữa các người chơi còn lại.',
  },
  AUCTION_EXPIRED: {
    icon: '⌛',
    title: 'Hết Thời Gian Đấu Giá',
    description: 'Phiên đấu giá đã kết thúc thời gian đếm ngược.',
    tone: 'warning',
    actionHint: 'Đang chuyển giao quyền sở hữu tài sản cho người thắng cuộc.',
  },
  OFFER_ALREADY_RESOLVED: {
    icon: '🤝', title: 'Đề Xuất Đã Giải Quyết',
    description: 'Đề xuất giao dịch này đã được phản hồi hoặc đã hoàn tất trước đó.',
    tone: 'warning', actionHint: 'Kiểm tra biến động tài sản trên bàn cờ.',
  },
  BANKRUPT: {
    icon: '🚨', title: 'Đã Tuyên Bố Phá Sản',
    description: 'Bạn đã hoàn tất thanh lý tài sản và rời cuộc chơi.',
    tone: 'info', actionHint: 'Theo dõi ván đấu ở chế độ khán giả.',
  },
};

// Aliases for legacy/alternative casing reason codes (DRY SSOT)
ACTIONABLE_NOTIFICATIONS_MAP['InsufficientFunds'] = ACTIONABLE_NOTIFICATIONS_MAP['INSUFFICIENT_FUNDS']!;
ACTIONABLE_NOTIFICATIONS_MAP['NotPurchasable'] = ACTIONABLE_NOTIFICATIONS_MAP['NOT_PURCHASABLE']!;
ACTIONABLE_NOTIFICATIONS_MAP['TradeFrozen'] = ACTIONABLE_NOTIFICATIONS_MAP['FREEZE_ACTIVE']!;
ACTIONABLE_NOTIFICATIONS_MAP['highest_bidder cannot pass'] = ACTIONABLE_NOTIFICATIONS_MAP['HIGHEST_BIDDER_CANNOT_PASS']!;
ACTIONABLE_NOTIFICATIONS_MAP['highest_bidder_cannot_pass'] = ACTIONABLE_NOTIFICATIONS_MAP['HIGHEST_BIDDER_CANNOT_PASS']!;
ACTIONABLE_NOTIFICATIONS_MAP['HighestBidderCannotPass'] = ACTIONABLE_NOTIFICATIONS_MAP['HIGHEST_BIDDER_CANNOT_PASS']!;
ACTIONABLE_NOTIFICATIONS_MAP['intent_rejected'] = ACTIONABLE_NOTIFICATIONS_MAP['INTENT_REJECTED']!;
ACTIONABLE_NOTIFICATIONS_MAP['IntentRejected'] = ACTIONABLE_NOTIFICATIONS_MAP['INTENT_REJECTED']!;
ACTIONABLE_NOTIFICATIONS_MAP['OUT_OF_TURN'] = ACTIONABLE_NOTIFICATIONS_MAP['NOT_YOUR_TURN']!;
ACTIONABLE_NOTIFICATIONS_MAP['PROPERTY_HAS_BUILDING'] = ACTIONABLE_NOTIFICATIONS_MAP['HAS_BUILDING']!;
ACTIONABLE_NOTIFICATIONS_MAP['ABUSE_DETECTED'] = ACTIONABLE_NOTIFICATIONS_MAP['RATE_LIMIT_EXCEEDED']!;
ACTIONABLE_NOTIFICATIONS_MAP['TOKEN_EXPIRED'] = ACTIONABLE_NOTIFICATIONS_MAP['TOKEN_INVALID']!;
ACTIONABLE_NOTIFICATIONS_MAP['PLAYER_BANKRUPT'] = ACTIONABLE_NOTIFICATIONS_MAP['BANKRUPT']!;
ACTIONABLE_NOTIFICATIONS_MAP['INVALID_INTENT'] = ACTIONABLE_NOTIFICATIONS_MAP['INTENT_REJECTED']!;

const DEFAULT_FALLBACK_NOTIFICATION: ActionableNotification = {
  icon: 'ℹ️',
  title: 'Hướng Dẫn Trò Chơi',
  description: 'Thao tác tạm thời chưa thể thực hiện. Vui lòng kiểm tra lại tình trạng lượt chơi của bạn!',
  tone: 'info',
  actionHint: 'Kiểm tra trạng thái lượt chơi trên thanh điều khiển.',
};

export function resolveActionableNotification(reasonCode?: string | null): ActionableNotification {
  if (!reasonCode || typeof reasonCode !== 'string') {
    return DEFAULT_FALLBACK_NOTIFICATION;
  }
  const match = ACTIONABLE_NOTIFICATIONS_MAP[reasonCode];
  if (match) return match;

  const viText = (vi.rejectReasons as Record<string, string>)[reasonCode];
  if (viText) {
    return {
      icon: 'ℹ️',
      title: 'Hướng Dẫn Trò Chơi',
      description: viText,
      tone: 'info',
      actionHint: 'Vui lòng kiểm tra lại tình trạng lượt chơi trên thanh điều khiển.',
    };
  }
  return DEFAULT_FALLBACK_NOTIFICATION;
}

export function formatServerErrorMessage(reasonCode?: string | null): string {
  if (!reasonCode || typeof reasonCode !== 'string') {
    return 'Hướng dẫn trò chơi: Thao tác tạm thời chưa thể thực hiện. Vui lòng kiểm tra lại tình trạng lượt chơi!';
  }
  const notif = resolveActionableNotification(reasonCode);
  if (notif === DEFAULT_FALLBACK_NOTIFICATION) {
    return `Hướng dẫn trò chơi: Thao tác tạm thời chưa thể thực hiện (${reasonCode}). Vui lòng kiểm tra lại tình trạng lượt chơi!`;
  }
  if (notif.actionHint) {
    return `${notif.title}: ${notif.description} 👉 ${notif.actionHint}`;
  }
  return `${notif.title}: ${notif.description}`;
}

export default resolveActionableNotification;
