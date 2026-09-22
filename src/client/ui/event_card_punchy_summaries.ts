// [IMP-169][MSS] Event Card Punchy Summaries & Normalizer
import { MarketCardId, ChanceCardId } from '../../domain/event_card_types.js';

export const PUNCHY_EVENT_SUMMARIES: Readonly<Record<string, string>> = Object.freeze({
  // 16 Market cards
  [MarketCardId.MC_MEGA_CONCERT]: 'Di chuyển đến ô Dịch Vụ cao nhất',
  [MarketCardId.MC_FREEZE_TRADE]: 'Đóng băng mua bán & đấu giá',
  [MarketCardId.MC_RATE_HIKE]: 'Thu lãi vay thế chấp 10% tại GO',
  [MarketCardId.MC_CREDIT_STIMULUS]: 'Giảm 20% xây nhà, miễn lãi vay',
  [MarketCardId.MC_COASTAL_STORM]: 'Miễn thuê ven biển & mất lượt',
  [MarketCardId.MC_NIGHT_ECONOMY]: 'Nhân đôi thuê ô Dịch Vụ (C1+)',
  [MarketCardId.MC_ALCOHOL_CHECK]: 'Giảm 50% thuê ô DV, phạt 800 Tr.',
  [MarketCardId.MC_PUBLIC_INVEST]: 'Nhân đôi cước 4 Ga Tàu',
  [MarketCardId.MC_FUEL_SURGE]: 'Phụ thu 500 Tr. cước 4 Ga Tàu',
  [MarketCardId.MC_FIRE_INSPECTION]: 'Phạt PCCC công trình C1-C3',
  [MarketCardId.MC_LAND_FEVER]: 'Tăng 50% tiền thuê & sang nhượng',
  [MarketCardId.MC_ANTI_SPECULATE]: 'Thuế sang nhượng P2P 20%',
  [MarketCardId.MC_PEAK_TOURISM]: 'Nhân đôi thuê BĐS Nghỉ Dưỡng',
  [MarketCardId.MC_URBAN_PLANNING]: 'Tăng 20% giá trị thế chấp HN/HCM',
  [MarketCardId.MC_UTILITY_DOUBLE]: 'Nhân đôi phí EVN & Viettel',
  [MarketCardId.MC_CASINO_PILOT]: 'Thưởng ô Dịch Vụ C2+ tới 3.000 Tr.',

  // 20 Chance cards
  [ChanceCardId.CC_PLATE_AUCTION]: 'Thêm 1 lượt gieo xúc xắc',
  [ChanceCardId.CC_TAX_AUDIT]: 'Phạt 500 Tr./đất trống C0',
  [ChanceCardId.CC_STOCK_PROFIT]: 'Chốt lời cổ phiếu +2.500 Tr.',
  [ChanceCardId.CC_DIPLOMATIC]: 'Miễn 100% tiền thuê BĐS đối thủ',
  [ChanceCardId.CC_CONTRACT_PENALTY]: 'Phạt vi phạm hợp đồng 1.000 Tr.',
  [ChanceCardId.CC_LAND_CHANGE]: 'Nâng thẳng 1 ô C0 lên C1',
  [ChanceCardId.CC_BUILD_HALT]: 'Phạt 800 Tr. & phong tỏa thu tiền',
  [ChanceCardId.CC_MA_FORCE]: 'Thâu tóm 1 ô đất C0 đối thủ (120%)',
  [ChanceCardId.CC_COPYRIGHT]: 'Phạt vi phạm bản quyền 1.200 Tr.',
  [ChanceCardId.CC_OVERDRAFT]: 'Tạm ứng 3.000 Tr., hoàn trả 3.300',
  [ChanceCardId.CC_JUNK_STOCK]: 'Lỗ cổ phiếu đầu cơ -1.500 Tr.',
  [ChanceCardId.CC_FRANCHISE]: 'Thu phí nhượng quyền +1.200 Tr.',
  [ChanceCardId.CC_LAND_RECLAIM]: 'Thu hồi đất quy hoạch, nhận 2.000',
  [ChanceCardId.CC_VENUE_INCIDENT]: 'Sự cố sân khấu, bồi thường 600 Tr.',
  [ChanceCardId.CC_CONCERT_SPONSOR]: 'Tài trợ sự kiện âm nhạc +800 Tr.',
  [ChanceCardId.CC_FREE_CREDIT]: 'Gói tín dụng 0% lãi suất tại GO',
  [ChanceCardId.CC_PORT_EXCLUSIVE]: 'Thu 50% phí cảng dừng chân',
  [ChanceCardId.CC_SLOW_BUILD]: 'Chậm tiến độ, phạt 400 Tr./c.trình',
  [ChanceCardId.CC_MEDIA_CRISIS]: 'Khủng hoảng truyền thông, phạt 700',
  [ChanceCardId.CC_SWAP_PROJECT]: 'Đổi 1 ô đất dự án với đối thủ',
});

/**
 * Strips redundant thematic prefix before colon (e.g. "Quy hoạch trục đô thị mới: ")
 * to present punchy, actionable financial summaries without truncation.
 */
export function cleanEventDescription(text: string): string {
  if (!text) return '';
  const trimmed = text.trim();
  const colonIndex = trimmed.indexOf(': ');
  if (colonIndex !== -1 && colonIndex < trimmed.length - 2) {
    return trimmed.slice(colonIndex + 2).trim();
  }
  return trimmed;
}

export function resolvePunchyEventSummary(
  cardIdOrTitle?: string | null,
  rawText?: string | null,
): string {
  if (cardIdOrTitle && PUNCHY_EVENT_SUMMARIES[cardIdOrTitle]) {
    return PUNCHY_EVENT_SUMMARIES[cardIdOrTitle];
  }

  const rawCandidate = (rawText || cardIdOrTitle || '').trim();
  if (!rawCandidate) return '';

  let cleaned = cleanEventDescription(rawCandidate);
  if (!cleaned) return '';

  if (cleaned.length > 38) {
    const semiIdx = cleaned.indexOf(';');
    const dotIdx = cleaned.indexOf('.');
    let splitIdx = -1;
    if (semiIdx !== -1 && dotIdx !== -1) {
      splitIdx = Math.min(semiIdx, dotIdx);
    } else if (semiIdx !== -1) {
      splitIdx = semiIdx;
    } else if (dotIdx !== -1) {
      splitIdx = dotIdx;
    }

    if (splitIdx !== -1) {
      cleaned = cleaned.slice(0, splitIdx).trim();
    }

    if (cleaned.length > 38) {
      cleaned = cleaned.slice(0, 38).trim();
    }
  }

  return cleaned;
}
