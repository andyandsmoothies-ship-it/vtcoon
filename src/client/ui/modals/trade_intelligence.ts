// [UI-S04/MSS][IMP-154] Trade Bot Intelligence & Sentiment Analysis
import { DISTRICT_GROUPS } from './masterplan_constants';
import { PROPERTY_DEEDS } from '../../../domain/property_data';

export type BotPersonality = 'Aggressive' | 'Balanced' | 'Passive';

export interface BotPersonalityBadge {
  readonly icon: string;
  readonly label: string;
  readonly colorClass: string;
}

export interface BotNeedBadgeInfo {
  readonly type: 'monopoly_gap' | 'low_cash' | 'high_cash' | 'ready';
  readonly text: string;
  readonly icon: string;
}

export interface EvaluateTradeSentimentParams {
  readonly offeredProperties?: readonly number[];
  readonly requestedProperties?: readonly number[];
  readonly cashOffer?: number;
  readonly cashRequest?: number;
  readonly botBalance?: number;
  readonly botProperties?: readonly number[];
  readonly myProperties?: readonly number[];
  readonly safetyBuffer?: number;
  readonly botPersonality?: BotPersonality | string;
}

export interface BotTradeSentimentResult {
  readonly status: 'likely_accept' | 'borderline' | 'likely_reject';
  readonly score: number;
  readonly message: string;
  readonly reasonCode?: string;
  readonly hint?: string;
  readonly multiplier?: number;
}

const DISTRICT_SHORT_NAMES: Record<string, string> = {
  Nau: 'Cần Thơ',
  XanhDaTroi: 'Đông Nam Bộ',
  Hong: 'Nam Trung Bộ',
  Cam: 'Bắc Duyên Hải',
  Do: 'Bắc Trung Bộ',
  Vang: 'Đông Bắc',
  XanhLa: 'Hà Nội',
  Tim: 'TP.HCM',
};

const getDeedValuation = (id: number): number => {
  const base = PROPERTY_DEEDS.get(id)?.price ?? 1000;
  return Math.max(1000, base);
};

/**
 * Phân giải tính cách Bot theo 3 tầng ưu tiên:
 * 1. Thuộc tính `personality` nếu có.
 * 2. Tên chứa `(Aggressive)`, `(Balanced)`, `(Passive)`.
 * 3. Fallback tất định theo ID đối tác.
 */
export function resolveBotPersonality(
  partner?: { id?: string; name?: string; personality?: string } | null,
): BotPersonality {
  if (!partner) return 'Balanced';

  if (partner.personality) {
    const p = String(partner.personality).trim().toLowerCase();
    if (p === 'aggressive') return 'Aggressive';
    if (p === 'passive') return 'Passive';
    if (p === 'balanced') return 'Balanced';
  }

  if (partner.name) {
    const name = String(partner.name);
    if (/\(Aggressive\)/i.test(name) || /aggressive/i.test(name)) return 'Aggressive';
    if (/\(Passive\)/i.test(name) || /passive/i.test(name)) return 'Passive';
    if (/\(Balanced\)/i.test(name) || /balanced/i.test(name)) return 'Balanced';
  }

  const id = String(partner.id ?? '').toLowerCase();
  if (id.includes('bot_1') || id.includes('bot1')) return 'Aggressive';
  if (id.includes('bot_2') || id.includes('bot2')) return 'Balanced';
  if (id.includes('bot_3') || id.includes('bot3')) return 'Passive';

  if (id.includes('2') && !id.includes('bot')) return 'Aggressive';
  if (id.includes('3') && !id.includes('bot')) return 'Balanced';
  if (id.includes('4') && !id.includes('bot')) return 'Passive';

  if (id.includes('1')) return 'Aggressive';

  return 'Balanced';
}

/**
 * Trả về huy hiệu giao diện tương ứng với tính cách Bot.
 */
export function getBotPersonalityBadge(personality: BotPersonality): BotPersonalityBadge {
  switch (personality) {
    case 'Aggressive':
      return { icon: '🔥', label: 'Táo bạo', colorClass: 'text-rose-700 bg-rose-100 border-rose-300' };
    case 'Passive':
      return { icon: '🛡️', label: 'Thận trọng', colorClass: 'text-blue-700 bg-blue-100 border-blue-300' };
    case 'Balanced':
    default:
      return { icon: '⚖️', label: 'Cân bằng', colorClass: 'text-amber-700 bg-amber-100 border-amber-300' };
  }
}

/**
 * Quét nhu cầu hiện tại của Bot (Monopoly gap, kẹt tiền, dư tiền hoặc sẵn sàng).
 */
export function getBotNeedBadge(
  partnerOrId: { id: string; name?: string; balance?: number; properties?: readonly number[] } | string,
  allOwnedOrProps?: readonly number[] | Record<number, string>,
  balance?: number,
): string {
  let botId = '';
  let effectiveBalance = 0;
  let botOwnedCells: number[] = [];

  if (typeof partnerOrId === 'string') {
    botId = partnerOrId;
    effectiveBalance = balance ?? 0;
  } else if (partnerOrId && typeof partnerOrId === 'object') {
    botId = partnerOrId.id;
    effectiveBalance = partnerOrId.balance ?? balance ?? 0;
    if (Array.isArray(partnerOrId.properties)) {
      botOwnedCells = [...partnerOrId.properties];
    }
  }

  if (Array.isArray(allOwnedOrProps)) {
    botOwnedCells = [...allOwnedOrProps];
  } else if (allOwnedOrProps && typeof allOwnedOrProps === 'object') {
    botOwnedCells = Object.entries(allOwnedOrProps)
      .filter(([_, ownerId]) => ownerId === botId)
      .map(([idx]) => Number(idx));
  }

  if (effectiveBalance < 1500) {
    return '🧊 Kẹt tiền';
  }

  // Quét các phân khu màu có >= 2 ô đất
  for (const group of DISTRICT_GROUPS) {
    if (!group.colorGroup || group.cellIndices.length < 2) continue;
    const count = group.cellIndices.filter((c) => botOwnedCells.includes(c)).length;
    if (count === group.cellIndices.length - 1) {
      const shortName = DISTRICT_SHORT_NAMES[group.id] ?? group.name;
      return `⚡ Cần 1 ô ${shortName}!`;
    }
  }

  if (effectiveBalance >= 8000) {
    return '💰 Dư tiền gom đất';
  }

  return '🤝 Sẵn sàng đàm phán';
}

/**
 * Gắn nhãn `⚡ Mảnh Ghép Cuối` nếu ô đất hoàn thiện nhóm màu cho bên nhận.
 */
export function getPropertySynergyTag(
  cellId: number,
  isMineOrReceiverProps: boolean | readonly number[],
  myProps?: readonly number[],
  targetProps?: readonly number[],
): string | undefined {
  let receiverProps: readonly number[] = [];
  if (typeof isMineOrReceiverProps === 'boolean') {
    receiverProps = isMineOrReceiverProps ? (targetProps ?? []) : (myProps ?? []);
  } else if (Array.isArray(isMineOrReceiverProps)) {
    receiverProps = isMineOrReceiverProps;
  }

  const group = DISTRICT_GROUPS.find(
    (g) => g.cellIndices.includes(cellId) && g.colorGroup !== undefined,
  );
  if (!group || group.cellIndices.length < 2) return undefined;

  const remainingCells = group.cellIndices.filter((id) => id !== cellId);
  const ownsOthers = remainingCells.length > 0 && remainingCells.every((id) => receiverProps.includes(id));
  if (ownsOthers) {
    return '⚡ Mảnh Ghép Cuối';
  }
  return undefined;
}

/**
 * Thẩm định tâm lý và khả năng đồng thuận của Bot đối với đề xuất đàm phán (BUY, SELL, SWAP).
 */
export function evaluateBotTradeSentiment(params: EvaluateTradeSentimentParams): BotTradeSentimentResult {
  const offered = params.offeredProperties ?? [];
  const requested = params.requestedProperties ?? [];
  const cashOffer = params.cashOffer ?? 0;
  const cashRequest = params.cashRequest ?? 0;
  const botBalance = params.botBalance ?? 5000;
  const botProps = params.botProperties ?? [];
  const myProps = params.myProperties ?? [];
  const personality: BotPersonality = resolveBotPersonality({ personality: params.botPersonality });

  const isBuy = requested.length > 0 && offered.length === 0;
  const isSell = offered.length > 0 && requested.length === 0;
  const isSwap = offered.length > 0 && requested.length > 0;

  if (isBuy) {
    const baseCost = requested.reduce((sum, id) => sum + getDeedValuation(id), 0);
    const givesMonopolyToBuyer = requested.some((id) => {
      const group = DISTRICT_GROUPS.find((g) => g.cellIndices.includes(id) && g.colorGroup !== undefined);
      if (!group || group.cellIndices.length < 2) return false;
      const others = group.cellIndices.filter((c) => c !== id);
      return others.every((c) => myProps.includes(c));
    });

    if (givesMonopolyToBuyer) {
      const requiredMultiplier = personality === 'Aggressive' ? 1.75 : personality === 'Balanced' ? 1.5 : 2.0;
      const requiredPrice = Math.round(baseCost * requiredMultiplier);

      if (cashOffer < requiredPrice) {
        return {
          status: 'likely_reject',
          score: Math.max(15, Math.min(35, Math.round((cashOffer / (requiredPrice || 1)) * 50))),
          message: 'Bot không muốn bạn độc quyền (cần thêm tiền)',
          reasonCode: 'PREVENT_MONOPOLY',
        };
      }
      return {
        status: 'likely_accept',
        score: 85,
        message: 'Mức giá đề xuất hậu hĩnh, Bot sẵn sàng nhượng lại mảnh đất độc quyền!',
      };
    }

    const acceptThreshold = personality === 'Passive' ? 1.4 : 1.3;
    const ratio = baseCost > 0 ? cashOffer / baseCost : 1;

    if (ratio >= 1.4 || (ratio >= acceptThreshold && cashOffer >= baseCost * 1.3)) {
      return {
        status: 'likely_accept',
        score: Math.min(95, Math.round(75 + (ratio - 1.3) * 50)),
        message: 'Mức giá hấp dẫn, Bot đồng ý chuyển nhượng!',
      };
    }
    if (ratio >= 1.0) {
      return {
        status: 'borderline',
        score: Math.round(45 + (ratio - 1.0) * 50),
        message: 'Mức giá còn hơi thấp so với kỳ vọng, hãy thêm tiền mặt để Bot đồng ý!',
        hint: 'Bù thêm tiền mặt để tăng khả năng chấp thuận',
      };
    }
    return {
      status: 'likely_reject',
      score: Math.max(10, Math.round(ratio * 30)),
      message: 'Giá đề xuất quá thấp so với giá trị BĐS!',
      reasonCode: 'PRICE_TOO_LOW',
    };
  }

  if (isSell) {
    const baseCost = offered.reduce((sum, id) => sum + getDeedValuation(id), 0);
    const safetyBuffer = params.safetyBuffer ?? (personality === 'Passive' ? 1500 : personality === 'Balanced' ? 800 : 500);

    if (cashRequest > botBalance - safetyBuffer) {
      return {
        status: 'likely_reject',
        score: 15,
        message: 'Yêu cầu tiền mặt vượt quá ngân sách an toàn của Bot!',
        reasonCode: 'INSUFFICIENT_CASH',
      };
    }

    const givesMonopolyToBot = offered.some((id) => {
      const group = DISTRICT_GROUPS.find((g) => g.cellIndices.includes(id) && g.colorGroup !== undefined);
      if (!group || group.cellIndices.length < 2) return false;
      const others = group.cellIndices.filter((c) => c !== id);
      return others.every((c) => botProps.includes(c));
    });

    if (givesMonopolyToBot) {
      if (cashRequest <= baseCost * 1.4) {
        return {
          status: 'likely_accept',
          score: Math.max(75, Math.min(95, Math.round(90 - (cashRequest / (baseCost || 1) - 1.0) * 30))),
          message: 'Mảnh ghép độc quyền quý giá, Bot rất muốn mua!',
        };
      }
      if (cashRequest <= baseCost * 1.8) {
        return {
          status: 'borderline',
          score: 55,
          message: 'Giá hơi cao dù rất cần mảnh ghép này, bạn hãy bớt tiền một chút!',
          hint: 'Bớt tiền yêu cầu để Bot dễ chấp thuận hơn',
        };
      }
      return {
        status: 'likely_reject',
        score: 30,
        message: 'Giá yêu cầu quá đắt cho mảnh ghép này!',
        reasonCode: 'PRICE_TOO_HIGH',
      };
    }

    if (cashRequest <= baseCost * 0.9) {
      return {
        status: 'likely_accept',
        score: 80,
        message: 'Giá bán hời, Bot sẵn sàng gom thêm đất lẻ!',
      };
    }
    if (cashRequest <= baseCost * 1.1) {
      return {
        status: 'borderline',
        score: 50,
        message: 'Bot chỉ gom đất lẻ nếu giá tốt hơn, bạn hãy bớt tiền!',
        hint: 'Bớt tiền yêu cầu',
      };
    }
    return {
      status: 'likely_reject',
      score: 20,
      message: 'Bot không có nhu cầu mua đất lẻ với giá cao.',
      reasonCode: 'PRICE_TOO_HIGH',
    };
  }

  if (isSwap) {
    const offeredVal = offered.reduce((sum, id) => sum + getDeedValuation(id), 0);
    const requestedVal = requested.reduce((sum, id) => sum + getDeedValuation(id), 0);

    const givesMonopolyToBot = offered.some((id) => {
      const group = DISTRICT_GROUPS.find((g) => g.cellIndices.includes(id) && g.colorGroup !== undefined);
      if (!group) return false;
      return group.cellIndices.filter((c) => c !== id).every((c) => botProps.includes(c));
    });
    const givesMonopolyToPartner = requested.some((id) => {
      const group = DISTRICT_GROUPS.find((g) => g.cellIndices.includes(id) && g.colorGroup !== undefined);
      if (!group) return false;
      return group.cellIndices.filter((c) => c !== id).every((c) => myProps.includes(c));
    });

    if (!givesMonopolyToBot && givesMonopolyToPartner) {
      return {
        status: 'likely_reject',
        score: 25,
        message: 'Bot không muốn bạn hoàn tất độc quyền thông qua đổi đất!',
        reasonCode: 'PREVENT_MONOPOLY',
      };
    }

    const netVal = offeredVal + cashOffer - (requestedVal + cashRequest);
    if (netVal >= 0) {
      return {
        status: 'likely_accept',
        score: 75,
        message: 'Đổi đất ngang giá trị hoặc có lợi cho Bot, đề xuất được chấp thuận!',
      };
    }
    if (netVal >= -400) {
      return {
        status: 'borderline',
        score: 55,
        message: 'Có chênh lệch giá trị nhẹ, hãy bù thêm tiền mặt để hoàn tất thương vụ!',
        hint: 'Bù thêm tiền mặt để cân bằng',
      };
    }
    return {
      status: 'likely_reject',
      score: 30,
      message: 'Chênh lệch tài sản quá lớn, đề xuất không có lợi cho Bot!',
      reasonCode: 'UNFAVORABLE_VALUATION',
    };
  }

  return {
    status: 'borderline',
    score: 50,
    message: 'Hãy chọn BĐS hoặc điều chỉnh tiền mặt để bắt đầu đàm phán.',
  };
}
