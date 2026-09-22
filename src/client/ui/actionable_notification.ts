// [IMP-134] Actionable In-Game Guidance System & Contextual Notifications
// Universal notification model & error reason mapping

export interface ActionableNotification {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
  readonly tone: 'info' | 'warning' | 'error' | 'success';
  readonly actionHint?: string;
}

const ACTIONABLE_NOTIFICATIONS_MAP: Record<string, ActionableNotification> = {
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
  InsufficientFunds: {
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
  OUT_OF_TURN: {
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
  PROPERTY_HAS_BUILDING: {
    icon: '🏠',
    title: 'Bất Động Sản Đang Có Công Trình',
    description: 'Không thể thế chấp hoặc giao dịch khi vẫn còn công trình xây dựng.',
    tone: 'warning',
    actionHint: 'Hãy hạ cấp dỡ nhà trước khi thế chấp tài sản.',
  },
  ALREADY_MORTGAGED: {
    icon: '🔒',
    title: 'Tài Sản Đã Được Thế Chấp',
    description: 'Ô đất này hiện đang ở trạng thái thế chấp.',
    tone: 'info',
    actionHint: 'Chuộc lại thế chấp để khôi phục quyền thu tiền thuê.',
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
  AlreadyOwned: {
    icon: '🏷️',
    title: 'Bất Động Sản Đã Có Chủ Sở Hữu',
    description: 'Ô đất này đã có người mua, bạn không thể mua trực tiếp từ Ngân hàng.',
    tone: 'warning',
    actionHint: 'Đề xuất đàm phán với chủ sở hữu để mua lại.',
  },
  NotPurchasable: {
    icon: '🚫',
    title: 'Ô Không Thể Mua Bán',
    description: 'Ô này là ô sự kiện hoặc chức năng, không thuộc danh mục mua bán.',
    tone: 'warning',
    actionHint: 'Chỉ có thể mua các ô đất hoặc nhà ga chưa có chủ.',
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
  TradeFrozen: {
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
  ABUSE_DETECTED: {
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
  TOKEN_EXPIRED: {
    icon: '🔑',
    title: 'Phiên Đăng Nhập Hết Hạn',
    description: 'Phiên kết nối đã hết hạn hoặc không hợp lệ. Đang tự động kết nối lại...',
    tone: 'info',
    actionHint: 'Chờ hệ thống tự động làm mới phiên kết nối.',
  },
};

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
  return ACTIONABLE_NOTIFICATIONS_MAP[reasonCode] ?? DEFAULT_FALLBACK_NOTIFICATION;
}

export function formatServerErrorMessage(reasonCode?: string | null): string {
  if (!reasonCode || typeof reasonCode !== 'string') {
    return 'Hướng dẫn trò chơi: Thao tác tạm thời chưa thể thực hiện. Vui lòng kiểm tra lại tình trạng lượt chơi!';
  }
  const match = ACTIONABLE_NOTIFICATIONS_MAP[reasonCode];
  if (!match) {
    return 'Hướng dẫn trò chơi: Thao tác tạm thời chưa thể thực hiện. Vui lòng kiểm tra lại tình trạng lượt chơi!';
  }
  return match.description;
}

export default resolveActionableNotification;
