// [IMP-134] Event Card Visuals — Themed emojis, hero stat formatting & sanitizers for Fintech Card overhaul
import { MarketCardId, ChanceCardId } from '../../../domain/event_card_types.js';
import { MacroCycleType } from '../../../domain/macro_cycle_types.js';
import { formatCurrency } from '../ui_helpers.js';
import { EVENT_ICON_REGISTRY, isEventIdentifiable } from '../../domain_visual_bridge.js';
import { MARKET_CARD_DETAILS, CHANCE_CARD_DETAILS } from '../../../domain/event_card_metadata.js';
import { vi } from '../../../domain/i18n/vi.js';
import { resolveMarketTitle, resolveMarketEffectSummary } from '../market_event_ticker.js';
import type { ClientMarketModifier } from '../../store/game_store_types.js';

import {
  type HeroStatVariant,
  type HeroStat,
  type HeroStatStyles,
  KNOWN_HERO_STATS,
  KNOWN_CARD_CTA_BUTTONS,
  getHeroStatStyles,
} from './event_card_configs.js';

export type { HeroStatVariant, HeroStat, HeroStatStyles };
export { KNOWN_HERO_STATS, KNOWN_CARD_CTA_BUTTONS, getHeroStatStyles };

export function getCardCtaButtonText(cardId?: string, effectDelta?: number): string {
  if (cardId === ChanceCardId.CC_MA_FORCE) {
    if (typeof effectDelta === 'number' && effectDelta > 0) {
      return 'Nhận Trợ Cấp M&A • Đóng';
    }
    return 'Đã Thâu Tóm BĐS • Đóng';
  }
  if (cardId && KNOWN_CARD_CTA_BUTTONS[cardId]) {
    return KNOWN_CARD_CTA_BUTTONS[cardId];
  }
  return 'Đã Hiểu / Tiếp Tục';
}

function formatDeltaString(delta: number): string {
  const formatted = formatCurrency(delta);
  if (delta > 0 && !formatted.startsWith('+')) {
    return `+${formatted}`;
  }
  return formatted;
}

export function getCardThemedEmoji(cardId: string, cardType: 'chance' | 'market'): string {
  if (cardId && isEventIdentifiable(cardId)) {
    return EVENT_ICON_REGISTRY[cardId];
  }
  return cardType === 'market' ? '📰' : '⚡';
}

export function getCardHeroStat(cardId: string, effectDelta?: number): HeroStat {
  if (typeof effectDelta === 'number') {
    if (cardId === ChanceCardId.CC_LAND_CHANGE) {
      if (effectDelta > 0) {
        return { label: 'TRỢ CẤP QUY HOẠCH', value: formatDeltaString(effectDelta), variant: 'positive' };
      }
      if (effectDelta < 0) {
        return { label: 'CHI PHÍ QUY HOẠCH', value: formatDeltaString(effectDelta), variant: 'positive' };
      }
    } else if (cardId === ChanceCardId.CC_TAX_AUDIT) {
      if (effectDelta !== 0) {
        return { label: 'THANH TRA THUẾ', value: formatDeltaString(effectDelta), variant: 'negative' };
      }
    } else if (cardId === ChanceCardId.CC_LAND_RECLAIM) {
      if (effectDelta > 0) {
        return { label: 'TIỀN BỒI HOÀN', value: formatDeltaString(effectDelta), variant: 'positive' };
      }
    } else if (cardId === ChanceCardId.CC_MA_FORCE) {
      if (effectDelta > 0) {
        return { label: 'TRỢ CẤP M&A', value: formatDeltaString(effectDelta), variant: 'positive' };
      }
      if (effectDelta < 0) {
        return { label: 'THÂU TÓM BĐS', value: formatDeltaString(effectDelta), variant: 'warning' };
      }
    } else if (cardId === ChanceCardId.CC_SWAP_PROJECT) {
      if (effectDelta > 0) {
        return { label: 'TRỢ CẤP DỰ ÁN', value: formatDeltaString(effectDelta), variant: 'positive' };
      }
      if (effectDelta < 0) {
        return { label: 'QUYỀN MUA LẠI', value: formatDeltaString(effectDelta), variant: 'warning' };
      }
    }
  }

  const base = KNOWN_HERO_STATS[cardId];
  if (base) {
    if (typeof effectDelta === 'number' && effectDelta !== 0) {
      const isSpecialNonCurrency =
        base.value.includes('%') ||
        base.value.includes('Ô') ||
        base.value.includes('LƯỢT') ||
        base.value.includes('x2') ||
        base.value.includes('ĐẤT TRỐNG');
      if (!isSpecialNonCurrency) {
        return {
          label: base.label,
          value: formatDeltaString(effectDelta),
          variant: effectDelta > 0 ? 'positive' : 'negative',
        };
      }
    }
    return base;
  }

  if (typeof effectDelta === 'number' && effectDelta !== 0) {
    return {
      label: effectDelta > 0 ? 'BIẾN ĐỘNG TÀI CHÍNH' : 'KHOẢN NỘP PHẠT',
      value: formatDeltaString(effectDelta),
      variant: effectDelta > 0 ? 'positive' : 'negative',
    };
  }

  return {
    label: 'HIỆU ỨNG ĐẶC BIỆT',
    value: 'KÍCH HOẠT',
    variant: 'info',
  };
}

export function sanitizeTargetScope(scope?: string): string {
  if (!scope) return '';
  return scope.replace(/\s*\([ÔO0-9,\s]+\)/gi, '').trim();
}

export function sanitizeDestination(destination?: string): string {
  if (!destination) return '';
  const lower = destination.toLowerCase();
  if (lower.includes('kho bạc')) return 'Kho Bạc Nhà Nước';
  if (lower.includes('chủ sở hữu') || lower.includes('chủ ô')) return 'Chủ Sở Hữu Ô';
  if (lower.includes('tài khoản') || lower.includes('cá nhân')) return 'Tài Khoản Cá Nhân';
  return destination.trim();
}

export function cleanEventDescription(text?: string): string {
  if (!text) return '';
  const trimmed = text.trim();
  const colonIndex = trimmed.indexOf(':');
  if (colonIndex !== -1 && colonIndex < trimmed.length - 1) {
    const remainder = trimmed.slice(colonIndex + 1).trim();
    if (remainder.length > 0) {
      return remainder.charAt(0).toUpperCase() + remainder.slice(1);
    }
  }
  return trimmed;
}

export function isFinancialDestination(destination?: string, effectDelta?: number): boolean {
  if (!destination) return false;
  const lower = destination.toLowerCase().trim();
  if (!lower) return false;

  if (
    lower.includes('đóng băng') ||
    lower.includes('thanh khoản') ||
    lower.includes('bảo toàn') ||
    lower === 'toàn thị trường' ||
    lower === 'toàn bộ thị trường'
  ) {
    return false;
  }

  if (
    lower.includes('kho bạc') ||
    lower.includes('chủ sở hữu') ||
    lower.includes('chủ ô') ||
    lower.includes('đối thủ') ||
    lower.includes('chuyển nhượng') ||
    lower.includes('thanh toán') ||
    lower.includes('người nghèo nhất') ||
    lower.includes('bồi thường') ||
    lower.includes('nộp phạt') ||
    lower.includes('chi thưởng') ||
    lower.includes('giải ngân')
  ) {
    return true;
  }

  if (lower.includes('tài khoản') || lower.includes('ngân sách')) {
    if (typeof effectDelta === 'number' && effectDelta !== 0) return true;
    if (lower.includes('cộng') || lower.includes('trừ') || lower.includes('chuyển')) return true;
  }

  return false;
}


export interface EventCardDisplayData {
  readonly title: string;
  readonly denseScope: string;
  readonly targetScope: string;
  readonly description: string;
  readonly duration: string;
  readonly destination: string;
  readonly shouldShowDestination: boolean;
  readonly activeModifier?: ClientMarketModifier;
  readonly iconEmoji: string;
  readonly heroStat: HeroStat;
  readonly heroStyles: HeroStatStyles;
  readonly ctaText: string;
  readonly isCtaNext: boolean;
}

export interface ResolveEventCardDisplayParams {
  readonly cardType: 'chance' | 'market';
  readonly cardId: string;
  readonly isMultiEvent: boolean;
  readonly currentIdx: number;
  readonly activeModifiers?: readonly ClientMarketModifier[];
  readonly propsActiveModifier?: ClientMarketModifier;
  readonly title?: string;
  readonly description?: string;
  readonly effectDelta?: number;
  readonly targetScope?: string;
  readonly effectDetail?: string;
  readonly duration?: string;
  readonly destination?: string;
  readonly ctaButtonText?: string;
}

export function resolveEventCardDisplayData(params: ResolveEventCardDisplayParams): EventCardDisplayData {
  const {
    cardType,
    cardId,
    isMultiEvent,
    currentIdx,
    activeModifiers = [],
    propsActiveModifier,
    title,
    description,
    effectDelta,
    targetScope,
    effectDetail,
    duration,
    destination,
    ctaButtonText,
  } = params;

  const isMarket = cardType === 'market';
  const currentModifier = isMultiEvent ? activeModifiers[currentIdx] : undefined;
  const currentCardId = currentModifier ? String(currentModifier.type) : cardId;

  const detail = isMarket
    ? MARKET_CARD_DETAILS[cardId as MarketCardId]
    : CHANCE_CARD_DETAILS[cardId as ChanceCardId];

  const currentDetail = isMultiEvent
    ? MARKET_CARD_DETAILS[currentCardId as MarketCardId]
    : detail;

  const resolvedTitle = isMultiEvent
    ? resolveMarketTitle(currentCardId)
    : (title ||
        (isMarket
          ? (resolveMarketTitle(cardId) || vi.marketCards[cardId as MarketCardId])
          : vi.chanceCards[cardId as ChanceCardId]) ||
        cardId);

  const rawDenseScope = isMultiEvent
    ? (currentDetail?.targetScope ?? 'Toàn bộ thị trường')
    : (targetScope || detail?.targetScope || (isMarket ? 'Toàn bộ thị trường' : 'Người chơi rút thẻ'));

  const rawTargetScope = isMultiEvent
    ? (currentDetail?.targetScope ?? 'Toàn bộ thị trường')
    : (targetScope || detail?.targetScope || (isMarket ? 'Toàn bộ thị trường' : 'Người chơi rút thẻ'));

  const resolvedDenseScope = sanitizeTargetScope(rawDenseScope);
  const resolvedTargetScope = sanitizeTargetScope(rawTargetScope);

  const singleTruthDescription = cleanEventDescription(
    isMultiEvent
      ? (currentDetail?.effectDetail ?? currentDetail?.description ?? resolveMarketEffectSummary(currentCardId))
      : (effectDetail || description || detail?.effectDetail || detail?.description || '')
  );

  const resolvedDuration = currentModifier
    ? `${currentModifier.remainingRounds} vòng chơi`
    : (duration || detail?.duration || (isMarket ? '1 vòng chơi' : 'Tức thì'));

  const rawDestination = isMultiEvent
    ? (currentDetail?.destination || 'Toàn thị trường')
    : (destination || detail?.destination || (isMarket ? 'Toàn thị trường' : 'Kho Bạc Nhà Nước'));
  const resolvedDestination = sanitizeDestination(rawDestination);

  const shouldShowDestination = Boolean(
    isFinancialDestination(rawDestination, isMultiEvent ? undefined : effectDelta) &&
    resolvedDestination !== 'Toàn thị trường'
  );

  const storeActiveModifier = !isMultiEvent
    ? activeModifiers.find((m) => String(m.type) === cardId)
    : undefined;
  const activeModifier = isMultiEvent ? currentModifier : (propsActiveModifier ?? storeActiveModifier);

  const iconEmoji = isMultiEvent
    ? getCardThemedEmoji(currentCardId, 'market')
    : getCardThemedEmoji(cardId, cardType);

  const heroStat = isMultiEvent
    ? getCardHeroStat(currentCardId)
    : getCardHeroStat(cardId, effectDelta);

  const heroStyles = getHeroStatStyles(heroStat.variant);

  const isCtaNext = isMultiEvent && currentIdx < activeModifiers.length - 1;
  const resolvedCta = isCtaNext
    ? `SỰ KIỆN KẾ TIẾP (${currentIdx + 2}/${activeModifiers.length}) →`
    : (ctaButtonText ?? (isMultiEvent ? 'ĐÃ HIỂU TẤT CẢ' : getCardCtaButtonText(cardId, effectDelta)));

  return {
    title: resolvedTitle,
    denseScope: resolvedDenseScope,
    targetScope: resolvedTargetScope,
    description: singleTruthDescription,
    duration: resolvedDuration,
    destination: resolvedDestination,
    shouldShowDestination,
    activeModifier,
    iconEmoji,
    heroStat,
    heroStyles,
    ctaText: resolvedCta,
    isCtaNext,
  };
}
