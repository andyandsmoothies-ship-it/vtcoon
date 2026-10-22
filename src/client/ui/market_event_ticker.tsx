// [IMP-128][IMP-135][IMP-411] MarketEventTicker — Real-time Active Market Events Banner
// Displays macro policy, economic events, remaining round countdowns and clear effect summary below TopBar
import React, { useRef, useEffect } from 'react';
import { useGameStore } from '../store/index.js';
import type { MarketCardId, ChanceCardId } from '../../domain/event_card_types.js';
import { MARKET_CARD_DETAILS, CHANCE_CARD_DETAILS } from '../../domain/event_card_metadata.js';
import { getCardHeroStat, getHeroStatStyles } from './modals/event_card_visuals.js';
import {
  ALL_MARKET_TITLES,
  ACTIVE_MARKET_EFFECT_SUMMARIES,
  ACTIVE_MARKET_COMPACT_FORMULAS,
  resolveMarketIcon,
  resolveMarketTitle,
  resolveMarketShortTag,
  resolveMarketEffectSummary,
  resolveMarketCompactFormula,
} from './market_event_helpers.js';

// Direct ESM re-exports maintaining 100% backward-compatibility and referential identity
export {
  ALL_MARKET_TITLES,
  ACTIVE_MARKET_EFFECT_SUMMARIES,
  ACTIVE_MARKET_COMPACT_FORMULAS,
  resolveMarketIcon,
  resolveMarketTitle,
  resolveMarketShortTag,
  resolveMarketEffectSummary,
  resolveMarketCompactFormula,
} from './market_event_helpers.js';

export interface MarketEventTickerProps {
  readonly activeModifiers?: ReadonlyArray<{
    readonly type: MarketCardId | ChanceCardId | string;
    readonly remainingRounds: number;
    readonly affectedCells?: readonly number[];
    readonly beneficiaryId?: string;
    readonly colorGroup?: string;
  }>;
}

export const MarketEventTicker: React.FC<MarketEventTickerProps> = ({
  activeModifiers: propsModifiers,
}) => {
  const spotlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (spotlightTimerRef.current) {
        clearTimeout(spotlightTimerRef.current);
        spotlightTimerRef.current = null;
        useGameStore.getState().setSpotlightedCells(null);
      }
    };
  }, []);

  const isSSR = typeof window === 'undefined';
  const storeModifiers = useGameStore((state) => state.activeModifiers);
  const activeModifiers = propsModifiers ?? (isSSR ? useGameStore.getState().activeModifiers : storeModifiers);

  const active = (activeModifiers ?? []).filter((m) => Boolean(m && m.remainingRounds > 0));

  if (active.length === 0) {
    return null;
  }

  const displayedActive = active.slice(0, 3);

  return (
    <div
      data-testid="market-event-ticker"
      role="region"
      aria-label="Sự kiện thị trường đang hiệu lực"
      className="pointer-events-none select-none z-30 flex flex-col items-center md:items-start justify-center md:justify-start w-full md:w-fit max-w-[90vw] min-[360px]:max-w-[calc(100vw-8px)] sm:max-w-md md:max-w-2xl mx-auto md:mx-0 mt-1 px-0.5 min-[360px]:px-1 sm:px-2 md:px-0 gap-1"
    >
      {displayedActive.map((modifier, index) => {
        const cardType = String(modifier.type ?? '');
        const icon = resolveMarketIcon(cardType);
        const title = resolveMarketTitle(cardType);
        const shortTag = resolveMarketShortTag(cardType);
        const formula = resolveMarketCompactFormula(cardType);
        const effectSummary = resolveMarketEffectSummary(cardType);
        const heroStat = getCardHeroStat(cardType);
        const heroStyles = getHeroStatStyles(heroStat.variant);

        const handleCardClick = () => {
          if (spotlightTimerRef.current) {
            clearTimeout(spotlightTimerRef.current);
            spotlightTimerRef.current = null;
          }

          if (modifier.affectedCells && modifier.affectedCells.length > 0) {
            useGameStore.getState().setSpotlightedCells(modifier.affectedCells);
            spotlightTimerRef.current = setTimeout(() => {
              useGameStore.getState().setSpotlightedCells(null);
              spotlightTimerRef.current = null;
            }, 3000);
          }

          const detail =
            MARKET_CARD_DETAILS[cardType as MarketCardId] ??
            CHANCE_CARD_DETAILS[cardType as ChanceCardId];
          useGameStore.getState().openModal('event', {
            cardType: cardType.startsWith('CC_') ? 'chance' : 'market',
            cardId: cardType,
            title,
            description: detail?.description ?? effectSummary,
            targetScope: detail?.targetScope,
            effectDetail: detail?.effectDetail ?? effectSummary,
            duration: `${modifier.remainingRounds} vòng chơi`,
            destination: detail?.destination,
          });
        };

        const itemVisibilityClass = index === 0 ? 'flex' : 'hidden sm:flex';

        return (
          <div
            key={`${cardType}_${index}`}
            data-testid={`market-ticker-item-${cardType}`}
            onClick={handleCardClick}
            title={`${title}: ${formula} (Bấm xem chi tiết)`}
            className={`w-full md:w-[360px] pointer-events-auto min-h-[36px] sm:min-h-[44px] ${itemVisibilityClass} flex-col justify-center gap-0.5 sm:gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-[#FFFDF8]/98 hover:bg-amber-50/98 backdrop-blur-none md:backdrop-blur-xs border-2 border-slate-900 rounded-lg sm:rounded-xl shadow-[0_1.5px_0_0_#0f172a] sm:shadow-[0_2px_0_0_#0f172a] text-xs font-bold transition-colors cursor-pointer select-none text-slate-900 leading-none`}
          >
            {/* Dòng 1: Icon, Tiêu đề, và Đếm ngược vòng */}
            <div className="flex items-center justify-between w-full min-w-0 gap-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm shrink-0" aria-hidden="true">
                  {icon}
                </span>
                <span className="font-extrabold text-[11px] sm:text-xs text-slate-900 truncate">
                  <span className="sm:hidden">{shortTag}:</span>
                  <span className="hidden sm:inline">{title}:</span>
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-1">
                {index === 0 && active.length > 1 && (
                  <span
                    data-testid="market-ticker-more-badge"
                    className="sm:hidden text-[10px] font-extrabold text-amber-950 bg-amber-200/90 px-1.5 py-0.5 rounded-full border border-amber-400 whitespace-nowrap"
                  >
                    +{active.length - 1} khác
                  </span>
                )}
                <span className="text-[10px] font-extrabold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded-full border border-amber-400 whitespace-nowrap">
                  Còn {modifier.remainingRounds} vòng
                </span>
              </div>
            </div>

            {/* Dòng 2: Huy hiệu chỉ số nổi bật & Nội dung công thức hiệu lực đầy đủ (bảo toàn 100% ngữ nghĩa) */}
            <div className="flex items-center flex-wrap gap-1.5 w-full min-w-0 pl-5">
              {heroStat.value && (
                <span className={`inline-flex px-1 py-0.5 rounded text-[10px] sm:text-[11px] font-black uppercase tracking-wider shrink-0 ${heroStyles.badge}`}>
                  {heroStat.value}
                </span>
              )}
              <span
                data-testid="market-ticker-effect-summary"
                className="font-semibold text-[11px] sm:text-xs text-slate-700 min-w-0 line-clamp-2 break-words leading-tight"
              >
                {formula}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MarketEventTicker;
