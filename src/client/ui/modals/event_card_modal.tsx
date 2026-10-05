// [UI-S04/MSS][IMP-134] EventCardModal — Vietnamese Chance & Market event card display with tactile borders and Hero Stat Box
import React from 'react';
import { vi } from '../../../domain/i18n/vi.js';
import { MarketCardId, ChanceCardId } from '../../../domain/event_card_types.js';
import { MARKET_CARD_DETAILS, CHANCE_CARD_DETAILS } from '../../../domain/event_card_metadata.js';
import { BOARD_CONFIG } from '../../../domain/board_config.js';
import { useGameStore } from '../../store/game_store.js';
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
import {
  resolveMarketTitle,
  resolveMarketShortTag,
  resolveMarketEffectSummary,
} from '../market_event_ticker.js';

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
  readonly activeModifier?: import('../../store/game_store_types.js').ClientMarketModifier;
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
  activeModifier: propsActiveModifier,
  onConfirm,
  onClose,
}: EventCardModalProps): React.ReactElement {
  const isMarket = cardType === 'market';
  const badgeColor = isMarket
    ? 'bg-amber-100 text-amber-900 border-amber-400'
    : 'bg-sky-100 text-sky-900 border-sky-400';
  const categoryLabel = isMarket ? 'Sự Kiện Thị Trường' : 'Cơ Hội Đầu Tư';

  const storeModifiers = useGameStore((s) => s.activeModifiers);
  const activeModifiers = (storeModifiers ?? []).filter((m) => Boolean(m && m.remainingRounds > 0));
  const isMultiEvent = isMarket && activeModifiers.length > 1;
  const initialIdx = Math.max(0, activeModifiers.findIndex((m) => String(m.type) === cardId));

  const [activeIdx, setActiveIdx] = React.useState<number>(initialIdx);

  React.useEffect(() => {
    setActiveIdx(initialIdx);
  }, [initialIdx]);

  React.useEffect(() => {
    if (!isMultiEvent || activeModifiers.length <= 1) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx((prev) => (prev + 1) % activeModifiers.length);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx((prev) => (prev - 1 + activeModifiers.length) % activeModifiers.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMultiEvent, activeModifiers.length]);

  const currentIdx = isMultiEvent
    ? Math.min(Math.max(0, activeIdx), activeModifiers.length - 1)
    : 0;

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

  const isDefaultMacroMarket = isMarket && (cardId === MarketCardId.MC_RATE_HIKE || cardId === 'MC_RATE_HIKE');
  const rawTargetScope = isMultiEvent
    ? (currentDetail?.targetScope ?? 'Toàn bộ thị trường')
    : (targetScope || (isDefaultMacroMarket ? 'Toàn bộ thị trường' : detail?.targetScope) || (isMarket ? 'Toàn bộ thị trường' : 'Người chơi rút thẻ'));

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

  const handleCtaClick = isCtaNext
    ? () => setActiveIdx((prev) => prev + 1)
    : (onConfirm ?? onClose);

  return (
    <div
      data-testid="event-card-modal"
      className="w-full max-w-[340px] sm:max-w-[420px] bg-[#FFFDF8] border-2 border-slate-900 rounded-3xl shadow-[0_8px_0_0_#0f172a] pt-7 pb-5 px-5 sm:px-6 max-h-[85dvh] sm:max-h-[90dvh] overflow-hidden sm:overflow-y-auto flex flex-col justify-between items-center text-center relative pointer-events-auto transition-all animate-in fade-in zoom-in-95 duration-200 my-auto text-slate-900 select-none"
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

      {/* Vùng cuộn nội dung giữa (Scrollable Content Container - giải quyết dứt điểm P1-C) */}
      <div
        data-testid="event-card-scroll-container"
        className="w-full overflow-y-auto max-h-[calc(85dvh-130px)] sm:max-h-[calc(90dvh-140px)] pr-0.5 flex flex-col items-center z-10"
      >
        {/* Category Badge */}
        <span className={`px-3 py-1 rounded-full text-[10px] sm:text-[11px] uppercase font-black tracking-wider border shadow-xs mb-3 ${badgeColor}`}>
          {categoryLabel}
        </span>

        {/* Thanh Điều Hướng Đơn Hàng (Single-Row Carousel Nav) khi có nhiều sự kiện */}
        {isMultiEvent && (
          <div
            data-testid="event-card-carousel-nav"
            className="w-full flex items-center justify-between gap-1 mb-3 px-1.5 py-1 bg-amber-100/70 border border-amber-300/80 rounded-xl shrink-0"
          >
            <button
              type="button"
              data-testid="carousel-prev-btn"
              onClick={() => setActiveIdx((prev) => (prev - 1 + activeModifiers.length) % activeModifiers.length)}
              aria-label="Sự kiện trước"
              className="relative min-w-[32px] h-[32px] flex items-center justify-center rounded-lg bg-white hover:bg-amber-50 border border-slate-300 font-black text-slate-800 text-sm shadow-xs cursor-pointer active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 after:absolute after:-inset-1.5 after:content-['']"
            >
              ‹
            </button>
            <div
              role="tablist"
              aria-label="Danh sách sự kiện thị trường"
              className="flex items-center justify-center gap-1 overflow-x-auto py-0.5 max-w-[220px] [mask-image:linear-gradient(to_right,transparent,black_6px,black_calc(100%-6px),transparent)]"
            >
              {activeModifiers.map((mod, idx) => {
                const modType = String(mod.type);
                const tag = resolveMarketShortTag(modType);
                const isCurrent = idx === currentIdx;
                return (
                  <button
                    key={`${modType}_${idx}`}
                    type="button"
                    role="tab"
                    aria-selected={isCurrent}
                    data-testid={`carousel-tab-pill-${idx}`}
                    onClick={() => setActiveIdx(idx)}
                    className={`px-2 py-1 rounded-md text-[11px] font-black border transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                      isCurrent
                        ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                        : 'bg-white/80 text-slate-700 border-slate-300 hover:bg-white'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              data-testid="carousel-next-btn"
              onClick={() => setActiveIdx((prev) => (prev + 1) % activeModifiers.length)}
              aria-label="Sự kiện tiếp theo"
              className="relative min-w-[32px] h-[32px] flex items-center justify-center rounded-lg bg-white hover:bg-amber-50 border border-slate-300 font-black text-slate-800 text-sm shadow-xs cursor-pointer active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 after:absolute after:-inset-1.5 after:content-['']"
            >
              ›
            </button>
          </div>
        )}

        {/* Hero Icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#F7F2E7] border-2 border-slate-900 flex items-center justify-center text-3xl mb-3 shadow-[0_3px_0_0_#0f172a]">
          <span aria-hidden="true">{iconEmoji}</span>
        </div>

        {/* Card Title */}
        <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight mb-2 leading-tight px-1">
          {resolvedTitle}
        </h2>

        {/* Khối Hero Stat Box to bản */}
        <div
          data-testid="event-hero-stat"
          className={`w-full rounded-2xl border-2 p-2.5 mb-3 flex flex-col items-center justify-center text-center font-mono shadow-xs ${heroStyles.container}`}
        >
          <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider ${heroStyles.label}`}>
            {heroStat.label}
          </span>
          <span className={`text-xl sm:text-2xl font-black tracking-tight tabular-nums mt-0.5 ${heroStyles.value}`}>
            {heroStat.value}
          </span>
        </div>

        {/* Description text */}
        <p className="text-xs text-slate-600 mb-3 leading-relaxed px-1 font-semibold hidden sm:block">
          {singleTruthDescription}
        </p>

        {/* Khối Tóm Tắt Tác Động Nhanh 1 Giây — Mobile (< 640px) */}
        <div
          data-testid="event-impact-summary"
          className="w-full bg-[#F7F2E7] border border-slate-300 rounded-xl p-3 mb-3 text-left sm:hidden flex flex-col gap-2 shadow-xs"
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
          className="w-full bg-[#F7F2E7] border border-slate-300 rounded-xl p-3 mb-3 items-center justify-center gap-2 hidden sm:flex flex-wrap shadow-xs"
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

        {/* Khối Hiển Thị Ô Đất Bị Ảnh Hưởng (IMP-234) */}
        {activeModifier?.affectedCells && activeModifier.affectedCells.length > 0 && (
          <div
            data-testid="event-affected-cells-list"
            className="w-full bg-amber-50/80 border border-amber-300 rounded-xl p-2.5 mb-3 flex flex-col items-center gap-1.5 shadow-xs"
          >
            <span className="text-[10px] sm:text-[11px] font-black uppercase text-amber-900 tracking-wider">
              📍 Ô đất chịu tác động trực tiếp:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-1.5 max-h-24 overflow-y-auto pr-1">
              {activeModifier.affectedCells.slice(0, 12).map((idx) => {
                const cellName = BOARD_CONFIG[idx]?.name ?? `Ô ${idx}`;
                return (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold bg-white text-slate-800 border border-slate-300 shadow-xs"
                  >
                    {cellName}
                  </span>
                );
              })}
              {activeModifier.affectedCells.length > 12 && (
                <span className="text-[10px] font-extrabold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md">
                  +{activeModifier.affectedCells.length - 12} ô khác
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CTA Button Cố Định Luôn Nhìn Thấy Ở Đáy */}
      <button
        type="button"
        data-testid="event-card-confirm-btn"
        onClick={handleCtaClick}
        className="relative z-10 w-full min-h-[46px] px-4 py-2.5 rounded-2xl font-black text-white text-xs sm:text-sm uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer bg-emerald-600 hover:bg-emerald-500 border-2 border-emerald-700 shadow-[0_4px_0_0_#065f46] active:shadow-[0_1px_0_0_#065f46] active:translate-y-[3px] shrink-0 mt-2"
        dangerouslySetInnerHTML={{ __html: resolvedCta }}
      />
      {isCtaNext && (
        <button
          type="button"
          data-testid="event-skip-all-btn"
          onClick={onConfirm ?? onClose}
          className="relative z-10 text-[11px] font-bold text-slate-500 hover:text-slate-800 underline decoration-slate-300 hover:decoration-slate-600 cursor-pointer mt-1.5 shrink-0 transition-colors"
        >
          Bỏ qua &amp; Đóng tất cả
        </button>
      )}
    </div>
  );
}
