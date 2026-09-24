// [UI-S04/MSS][IMP-134] EventCardModal — Vietnamese Chance & Market event card display with tactile borders and Hero Stat Box
import React from 'react';
import { vi } from '../../../domain/i18n/vi.js';
import { MarketCardId, ChanceCardId } from '../../../domain/event_card_types.js';
import { MARKET_CARD_DETAILS, CHANCE_CARD_DETAILS } from '../../../domain/event_card_metadata.js';
import {
  getCardThemedEmoji,
  getCardHeroStat,
  getHeroStatStyles,
  sanitizeTargetScope,
  sanitizeDestination,
  cleanEventDescription,
  isFinancialDestination,
  getCardCtaButtonText,
} from './event_card_visuals.js';

export interface EventCardModalProps {
  readonly cardType: 'chance' | 'market';
  readonly cardId: string;
  readonly title?: string;
  readonly description?: string;
  readonly effectDelta?: number;
  readonly targetScope?: string;
  readonly effectDetail?: string;
  readonly duration?: string;
  readonly destination?: string;
  readonly ctaButtonText?: string;
  readonly onConfirm?: () => void;
  readonly onClose?: () => void;
}

export function EventCardModal({
  cardType,
  cardId,
  title,
  description,
  effectDelta,
  targetScope,
  effectDetail,
  duration,
  destination,
  ctaButtonText,
  onConfirm,
  onClose,
}: EventCardModalProps): React.ReactElement {
  const isMarket = cardType === 'market';
  const badgeColor = isMarket
    ? 'bg-amber-100 text-amber-900 border-amber-400'
    : 'bg-sky-100 text-sky-900 border-sky-400';
  const categoryLabel = isMarket ? 'Sự Kiện Thị Trường' : 'Cơ Hội Đầu Tư';

  const detail = isMarket
    ? MARKET_CARD_DETAILS[cardId as MarketCardId]
    : CHANCE_CARD_DETAILS[cardId as ChanceCardId];

  const resolvedTitle =
    title ||
    (isMarket
      ? vi.marketCards[cardId as MarketCardId]
      : vi.chanceCards[cardId as ChanceCardId]) ||
    cardId;

  const rawDenseScope = targetScope || detail?.targetScope || (isMarket ? 'Toàn bộ thị trường' : 'Người chơi rút thẻ');
  const isDefaultMacroMarket = isMarket && (cardId === MarketCardId.MC_RATE_HIKE || cardId === 'MC_RATE_HIKE');
  const rawTargetScope = targetScope || (isDefaultMacroMarket ? 'Toàn bộ thị trường' : detail?.targetScope) || (isMarket ? 'Toàn bộ thị trường' : 'Người chơi rút thẻ');
  const resolvedDenseScope = sanitizeTargetScope(rawDenseScope);
  const resolvedTargetScope = sanitizeTargetScope(rawTargetScope);

  const rawDescription = effectDetail || description || detail?.effectDetail || detail?.description || '';
  const singleTruthDescription = cleanEventDescription(rawDescription);

  const resolvedDuration = duration || detail?.duration || (isMarket ? '1 vòng chơi' : 'Tức thì');
  const rawDestination = destination || detail?.destination || (isMarket ? 'Toàn thị trường' : 'Kho Bạc Nhà Nước');
  const resolvedDestination = sanitizeDestination(rawDestination);

  const shouldShowDestination = Boolean(
    isFinancialDestination(rawDestination, effectDelta) &&
    resolvedDestination !== 'Toàn thị trường'
  );

  const iconEmoji = getCardThemedEmoji(cardId, cardType);
  const heroStat = getCardHeroStat(cardId, effectDelta);
  const heroStyles = getHeroStatStyles(heroStat.variant);
  const resolvedCta = ctaButtonText ?? getCardCtaButtonText(cardId);

  return (
    <div
      data-testid="event-card-modal"
      className="w-full max-w-[340px] sm:max-w-[420px] bg-[#FFFDF8] border-2 border-slate-900 rounded-3xl shadow-[0_8px_0_0_#0f172a] pt-7 pb-6 px-5 sm:px-6 max-h-[90vh] overflow-y-auto flex flex-col items-center text-center relative pointer-events-auto transition-all animate-in fade-in zoom-in-95 duration-200 my-auto text-slate-900 select-none"
    >
      {/* Khung viền chỉ mực kép hoài cổ (Double Border) */}
      <div
        className="pointer-events-none absolute inset-1.5 sm:inset-2 rounded-2xl border border-amber-700/20 z-0"
        aria-hidden="true"
      />

      {/* Hoa văn dập chìm Trống Đồng Đông Sơn cổ truyền */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.05] overflow-hidden z-0"
        aria-hidden="true"
      >
        <svg viewBox="0 0 400 400" className="w-[300px] h-[300px] text-slate-900 fill-none stroke-current" strokeWidth="1.5">
          <circle cx="200" cy="200" r="28" fill="currentColor" fillOpacity="0.3" />
          <circle cx="200" cy="200" r="14" fill="currentColor" />
          {Array.from({ length: 14 }).map((_, i) => (
            <polygon
              key={i}
              points="196,160 204,160 200,135"
              fill="currentColor"
              transform={`rotate(${(i * 360) / 14} 200 200)`}
            />
          ))}
          <circle cx="200" cy="200" r="75" strokeDasharray="3 3" />
          <circle cx="200" cy="200" r="95" />
          <circle cx="200" cy="200" r="120" strokeDasharray="6 4" strokeWidth="2" />
          <circle cx="200" cy="200" r="145" />
          <circle cx="200" cy="200" r="165" strokeDasharray="4 2" />
          <circle cx="200" cy="200" r="185" strokeWidth="2.5" />
        </svg>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng thẻ sự kiện"
          className="absolute top-3 right-3 min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-slate-500 hover:text-slate-900 text-lg font-bold rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 z-20 cursor-pointer shadow-xs transition-colors"
        >
          ✕
        </button>
      )}

      {/* Category Badge */}
      <span className={`relative z-10 px-3 py-1 rounded-full text-[10px] sm:text-[11px] uppercase font-black tracking-wider border shadow-xs mb-3 ${badgeColor}`}>
        {categoryLabel}
      </span>

      {/* Hero Icon */}
      <div className="relative z-10 w-16 h-16 rounded-2xl bg-[#F7F2E7] border-2 border-slate-900 flex items-center justify-center text-3xl mb-3 shadow-[0_3px_0_0_#0f172a]">
        <span aria-hidden="true">{iconEmoji}</span>
      </div>

      {/* Card Title */}
      <h2 className="relative z-10 text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight mb-2 leading-tight px-1">
        {resolvedTitle}
      </h2>

      {/* Khối Hero Stat Box to bản — Nhìn là hiểu ngay trong 0.5s */}
      <div
        data-testid="event-hero-stat"
        className={`relative z-10 w-full rounded-2xl border-2 p-2.5 mb-3 flex flex-col items-center justify-center text-center font-mono shadow-xs ${heroStyles.container}`}
      >
        <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider ${heroStyles.label}`}>
          {heroStat.label}
        </span>
        <span className={`text-xl sm:text-2xl font-black tracking-tight tabular-nums mt-0.5 ${heroStyles.value}`}>
          {heroStat.value}
        </span>
      </div>

      {/* Description text — Giữ hidden sm:block cho test contract & hiển thị mô tả gọn gàng */}
      <p className="relative z-10 text-xs text-slate-600 mb-3 leading-relaxed px-1 font-semibold hidden sm:block">
        {singleTruthDescription}
      </p>

      {/* Khối Tóm Tắt Tác Động Nhanh 1 Giây — Mobile (< 640px) */}
      <div
        data-testid="event-impact-summary"
        className="relative z-10 w-full bg-[#F7F2E7] border border-slate-300 rounded-xl p-3 mb-3 text-left sm:hidden flex flex-col gap-2 shadow-xs"
      >
        <div className="flex items-center justify-between gap-1.5 flex-wrap">
          {resolvedTargetScope && resolvedTargetScope !== 'Người chơi rút thẻ' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
              <span>🎯</span>
              <span>{resolvedTargetScope}</span>
            </span>
          )}
          {resolvedDuration && resolvedDuration !== 'Tức thì' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-800 border border-slate-300">
              <span>⏳</span>
              <span>{resolvedDuration}</span>
            </span>
          )}
        </div>
        <p className="text-xs text-slate-800 font-bold leading-relaxed text-center">
          {singleTruthDescription}
        </p>
      </div>

      {/* Khối Thông Số Tác Động Nhanh — Desktop (>= 640px) */}
      <div
        data-testid="event-specs-table"
        className="relative z-10 w-full bg-[#F7F2E7] border border-slate-300 rounded-xl p-3 mb-3 items-center justify-center gap-2 hidden sm:flex flex-wrap shadow-xs"
      >
        {resolvedDenseScope && resolvedDenseScope !== 'Người chơi rút thẻ' && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
            <span>🎯</span>
            <span title={resolvedDenseScope}>{resolvedDenseScope}</span>
          </span>
        )}
        {resolvedDuration && resolvedDuration !== 'Tức thì' && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-800 border border-slate-300">
            <span>⏳</span>
            <span>{resolvedDuration}</span>
          </span>
        )}
        {shouldShowDestination && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <span>🏛️</span>
            <span className="whitespace-nowrap">{resolvedDestination}</span>
          </span>
        )}
      </div>

      {/* CTA Button */}
      <button
        type="button"
        data-testid="event-card-confirm-btn"
        onClick={onConfirm ?? onClose}
        className="relative z-10 w-full min-h-[46px] px-4 py-2.5 rounded-2xl font-black text-white text-xs sm:text-sm uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer bg-emerald-600 hover:bg-emerald-500 border-2 border-emerald-700 shadow-[0_4px_0_0_#065f46] active:shadow-[0_1px_0_0_#065f46] active:translate-y-[3px]"
      >
        {resolvedCta}
      </button>
    </div>
  );
}
