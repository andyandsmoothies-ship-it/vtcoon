// [UI-S05/MSS][IMP-194] Natural Narrative Engine — Formats financial events into natural sentences
import {
  FloatingTextType,
  type FloatingTextItem,
  type PlayerHudInfo,
  type FloatingActionType,
} from '../store/game_store.js';
import { getCellName } from '../network/activity_property_tracker.js';
import { formatShortPlayerName } from './ui_helpers.js';

export interface TransactionNarrative {
  readonly category: string;
  readonly icon: string;
  readonly subject: string;
  readonly verb: string;
  readonly amountText: string;
  readonly isPositive: boolean;
  readonly target: string;
  readonly detail?: string;
}

export function extractCleanAmount(text: string): { amountText: string; isNumeric: boolean } {
  if (!text) return { amountText: '', isNumeric: false };
  const cleaned = text.trim();
  const match = cleaned.match(/^[+-]?\s*(\d+(?:[.,]\d+)*(?:\s*(?:Tr\.|Tỷ|VND|₫|k|K))?)/i);
  return match && match[1] ? { amountText: match[1].trim(), isNumeric: true } : { amountText: cleaned, isNumeric: false };
}

export function resolveCellName(cellIndex?: number): string {
  if (cellIndex === 3) return 'Bến Bạch Đằng';
  return cellIndex !== undefined ? getCellName(cellIndex) : '';
}

const ACTION_ICONS: Record<string, string> = {
  buy: '🏷️', upgrade: '🏗️', rent_pay: '🏠', rent_receive: '💰', salary: '🚩',
  tax: '🏛️', bail: '🚨', mortgage: '🏦', unmortgage: '🔓', monopoly: '👑',
  debt_relief: '🎉', stimulus: '📈', chance: '⚡', market: '🎴',
  auction_win: '🔨', hose: '📊', teleport: '✈️', audit_jail: '🚨', ma_buyout: '🤝',
};

export function resolveActionIcon(actionType?: string, isReward?: boolean): string {
  if (actionType && ACTION_ICONS[actionType]) return ACTION_ICONS[actionType];
  return isReward ? '✨' : '💸';
}

function formatRentPay(item: FloatingTextItem): string {
  const cell = resolveCellName(item.cellIndex) || item.title?.replace(/^Tiền\s+thuê\s*/i, '').trim() || 'BĐS';
  const partner = item.targetPlayerName ? ` cho ${formatShortPlayerName(item.targetPlayerName, 10)}` : '';
  return `Trả thuê ${cell}${partner}`;
}

function formatRentReceive(item: FloatingTextItem): string {
  const cell = resolveCellName(item.cellIndex) || item.title?.replace(/^Thu\s+(?:tiền\s+)?thuê\s*/i, '').trim() || 'BĐS';
  const partner = item.targetPlayerName ? ` từ ${formatShortPlayerName(item.targetPlayerName, 10)}` : '';
  return `Thu thuê ${cell}${partner}`;
}

function formatBuy(item: FloatingTextItem): string {
  const cell = (item.cellIndex !== undefined ? getCellName(item.cellIndex) : '') || item.title?.replace(/^Mua\s+/i, '').trim() || 'BĐS';
  return `Mua sở hữu ${cell}`;
}

function formatUpgrade(item: FloatingTextItem): string {
  const level = item.title?.match(/(C[1-3]|Nhà Phố|Khách Sạn|Biệt Thự)/i)?.[0] || 'C1';
  let cell = item.cellIndex !== undefined ? getCellName(item.cellIndex) : '';
  if (!cell && item.title) {
    cell = item.title.replace(/^Nâng\s+(?:cấp\s+)?/i, '')
      .replace(/(C[1-3]|\((?:Nhà Phố|Khách Sạn|Biệt Thự)\)|Nhà Phố|Khách Sạn|Biệt Thự)/gi, '')
      .replace(/^(?:tại|ở)\s+/i, '').trim();
  }
  return `Xây ${level} ${cell || 'công trình'}`;
}

function formatTax(item: FloatingTextItem): string {
  const clean = (item.title || 'Lệ Phí Đất Đai (Ô 04)').replace(/^Nộp\s+/i, '').replace(/\s*➔\s*(?:Vào\s+)?Kho\s+Bạc/i, '').trim();
  return `Nộp ${clean} ➔ Kho Bạc`;
}

function formatMortgage(item: FloatingTextItem): string {
  const cell = resolveCellName(item.cellIndex) || item.title?.replace(/^(?:Vay\s+)?thế\s+chấp\s+/i, '').replace(/\s*(?:➔\s*Vay\s+Ngân\s+Hàng|từ\s+Ngân\s+Hàng)/i, '').trim() || 'BĐS';
  return `Thế chấp ${cell} ➔ Vay Ngân Hàng`;
}

function formatUnmortgage(item: FloatingTextItem): string {
  const cell = resolveCellName(item.cellIndex) || item.title?.replace(/^Giải\s+chấp\s+/i, '').replace(/\s*\(Phí\s+10%\s*➔\s*(?:Vào\s+)?Kho\s+Bạc\)/i, '').trim() || 'BĐS';
  return `Giải chấp ${cell} (Phí 10% ➔ Kho Bạc)`;
}

function formatAuction(item: FloatingTextItem): string {
  const cell = resolveCellName(item.cellIndex) || item.title?.replace(/^(?:Thắng\s+)?(?:đấu\s+giá|Đấu\s+Giá)\s+/i, '').replace(/\s*➔\s*(?:Vào\s+|Nộp\s+)?Kho\s+Bạc/i, '').trim() || 'BĐS';
  return `Thắng đấu giá ${cell} ➔ Nộp Kho Bạc`;
}

const ACTION_REASON_FORMATTERS: Partial<Record<FloatingActionType, (item: FloatingTextItem) => string>> = {
  rent_pay: formatRentPay,
  rent_receive: formatRentReceive,
  buy: formatBuy,
  upgrade: formatUpgrade,
  salary: () => 'Thưởng lương qua ô Khởi Hành',
  tax: formatTax,
  bail: (item) => item.title && item.title.includes('Bảo lãnh kiểm toán') ? item.title : 'Bảo lãnh kiểm toán (Ô 10) ➔ Nộp Kho Bạc',
  mortgage: formatMortgage,
  unmortgage: formatUnmortgage,
  auction_win: formatAuction,
  stimulus: () => 'Nhận trợ cấp Quỹ Kho Bạc',
  hose: (item) => (item.title ? `Giao dịch HOSE: ${item.title}` : 'Giao dịch sàn chứng khoán HOSE'),
  chance: (item) => `Cơ Hội: ${item.title?.replace(/^Cơ\s+Hội:\s*/i, '').trim() || 'Phiếu Cơ Hội'}`,
  market: (item) => `Thị Trường: ${item.title?.replace(/^Thị\s+Trường:\s*/i, '').trim() || 'Phiếu Thị Trường'}`,
  monopoly: (item) => item.text || 'Độc quyền nhóm màu!',
  debt_relief: () => 'Thoát vỡ nợ thành công!',
  teleport: (item) => `Dịch chuyển: ${item.title || 'Di chuyển đặc biệt'}`,
  audit_jail: () => 'Vào Trạm Kiểm Toán',
  ma_buyout: (item) => item.title || 'Thương vụ M&A',
};

export function resolveFriendlyReason(item: FloatingTextItem, _player?: PlayerHudInfo): string {
  const formatter = item.actionType ? ACTION_REASON_FORMATTERS[item.actionType] : undefined;
  if (formatter) return formatter(item);
  return item.title || (item.text ? `Giao dịch ${item.text}` : 'Biến động tài chính');
}

export function resolveTransactionNarrative(
  item: FloatingTextItem,
  player?: PlayerHudInfo,
  _allPlayers?: Record<string, PlayerHudInfo>
): TransactionNarrative {
  const isPositive = item.type === FloatingTextType.Reward;
  const subject = formatShortPlayerName(player?.name || 'Người chơi');
  const { amountText } = extractCleanAmount(item.text);
  let targetName = item.targetPlayerName ? formatShortPlayerName(item.targetPlayerName) : 'đối thủ';
  let cellName = resolveCellName(item.cellIndex);

  let category = isPositive ? 'THU NHẬP' : 'CHI PHÍ';
  let icon = resolveActionIcon(item.actionType, isPositive);
  let verb = isPositive ? 'nhận' : 'thanh toán';
  let target = item.title || 'giao dịch tài chính';
  let detail: string | undefined;

  switch (item.actionType) {
    case 'rent_pay':
      category = 'TIỀN THUÊ BẤT ĐỘNG SẢN';
      verb = 'trả';
      target = `cho ${targetName}`;
      detail = cellName ? `(Tiền thuê ${cellName})` : '(Tiền thuê BĐS)';
      break;
    case 'rent_receive':
      category = 'TIỀN THUÊ BẤT ĐỘNG SẢN';
      verb = 'thu';
      target = `từ ${targetName}`;
      detail = cellName ? `(Tiền thuê ${cellName})` : '(Tiền thuê BĐS)';
      break;
    case 'ma_buyout':
      category = 'THƯƠNG VỤ M&A';
      verb = isPositive ? 'nhận' : 'chi';
      target = isPositive ? `bồi hoàn M&A từ ${targetName}` : `thâu tóm M&A từ ${targetName}`;
      detail = isPositive ? (cellName ? `(Chuyển nhượng ${cellName})` : '(Bồi hoàn M&A)') : (cellName ? `(${cellName})` : '(Thâu tóm M&A)');
      break;
    case 'auction_win': {
      category = 'ĐẤU GIÁ BẤT ĐỘNG SẢN';
      verb = 'nộp';
      target = 'vào Kho Bạc';
      let aucProp = cellName;
      if (item.title && item.title.includes('Thắng đấu giá')) {
        const m = item.title.match(/Thắng\s+đấu\s+giá\s+(.+?)(?:\s*➔|$)/i);
        if (m && m[1]) aucProp = m[1].trim();
      }
      detail = aucProp ? `(Trúng đấu giá ${aucProp})` : '(Trúng đấu giá)';
      break;
    }
    case 'tax': {
      category = 'KHO BẠC NHÀ NƯỚC';
      verb = 'nộp';
      target = 'vào Kho Bạc';
      const cleanTax = item.title ? item.title.replace(/^Nộp\s+/i, '').replace(/\s*➔\s*(?:Vào\s+)?Kho\s+Bạc/i, '').trim() : '';
      detail = cleanTax ? `(${cleanTax})` : '(Nộp thuế)';
      break;
    }
    case 'bail':
      category = 'BẢO LÃNH KIỂM TOÁN';
      verb = 'nộp';
      target = 'vào Kho Bạc';
      detail = '(Rời Trạm Kiểm Toán)';
      break;
    case 'audit_jail':
      category = 'TRẠM KIỂM TOÁN';
      verb = 'vào';
      target = 'Trạm Kiểm Toán';
      detail = '(Bị kiểm toán thuế)';
      break;
    case 'mortgage':
      category = 'TÍN DỤNG NGÂN HÀNG';
      verb = 'vay';
      target = 'từ Ngân Hàng';
      detail = cellName ? `(Thế chấp ${cellName})` : '(Thế chấp BĐS)';
      break;
    case 'unmortgage':
      category = 'GIẢI CHẤP BẤT ĐỘNG SẢN';
      verb = 'trả';
      target = `giải chấp ${cellName || 'BĐS'}`;
      detail = '(Phí 10% ➔ Kho Bạc)';
      break;
    case 'buy':
      category = 'MUA ĐẤT ĐẦU TƯ';
      verb = 'thanh toán';
      if (!cellName && item.title) cellName = item.title.replace(/^Mua\s+/i, '').trim();
      target = `mua ${cellName || 'BĐS'} từ Ngân Hàng`;
      break;
    case 'upgrade': {
      category = 'NÂNG CẤP CÔNG TRÌNH';
      verb = 'thanh toán';
      if (!cellName && item.title) {
        cellName = item.title.replace(/^Nâng\s+(?:cấp\s+)?/i, '')
          .replace(/(C[1-3]|\((?:Nhà Phố|Khách Sạn|Biệt Thự)\)|Nhà Phố|Khách Sạn|Biệt Thự)/gi, '')
          .replace(/^(?:tại|ở)\s+/i, '').trim();
      }
      const levelStr = item.title?.match(/(C[1-3]|Nhà Phố|Khách Sạn|Biệt Thự)/i)?.[0];
      target = `nâng cấp nhà ${cellName || 'công trình'}`;
      detail = levelStr ? `(${levelStr})` : undefined;
      break;
    }
    case 'salary':
      category = 'LƯƠNG KHỞI HÀNH';
      verb = 'nhận';
      target = 'tiền lương qua ô Khởi Hành';
      break;
    case 'hose':
      category = 'THỊ TRƯỜNG CHỨNG KHOÁN';
      verb = isPositive ? 'nhận cổ tức' : 'đầu tư cổ phiếu';
      target = isPositive ? 'từ sàn HOSE' : 'vào sàn HOSE';
      detail = item.title ? `(${item.title})` : undefined;
      break;
    case 'stimulus':
      category = 'TRỢ CẤP QUỸ KHO BẠC';
      verb = 'nhận';
      target = 'từ Quỹ Kho Bạc';
      detail = item.title ? `(${item.title})` : undefined;
      break;
    case 'teleport':
      category = 'DỊCH CHUYỂN BẾN BÃI';
      verb = 'thanh toán';
      target = 'vé dịch chuyển';
      detail = item.title ? `(${item.title})` : undefined;
      break;
    default:
      break;
  }

  // Sentence length guard (<= 95 characters)
  if (detail && `${subject} ${verb} ${item.text} ${target} ${detail}`.length > 95) {
    const maxDetailLen = Math.max(8, 95 - (`${subject} ${verb} ${item.text} ${target}`.length + 5));
    detail = `${detail.slice(0, maxDetailLen - 3)}...)`;
  }

  return { category, icon, subject, verb, amountText, isPositive, target, detail };
}
