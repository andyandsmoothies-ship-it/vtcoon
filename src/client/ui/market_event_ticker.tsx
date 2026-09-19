// [IMP-128] MarketEventTicker — Real-time Active Market Events Banner
// Displays macro policy, economic events, and remaining round countdowns below TopBar
import React from 'react';
import { useGameStore } from '../store/game_store.js';
import { MarketCardId } from '../../domain/event_card_types.js';
import { MARKET_CARD_DETAILS } from '../../domain/event_card_metadata.js';
import { vi as viTranslations } from '../../domain/i18n/vi.js';

export interface MarketEventTickerProps {
  readonly activeModifiers?: ReadonlyArray<{
    readonly type: MarketCardId | string;
    readonly remainingRounds: number;
    readonly affectedCells?: readonly number[];
  }>;
}

function resolveMarketIcon(type: string): string {
  switch (type) {
    case MarketCardId.MC_FREEZE_TRADE: return '❄️';
    case MarketCardId.MC_COASTAL_STORM: return '🌀';
    case MarketCardId.MC_PUBLIC_INVEST: return '🏗️';
    case MarketCardId.MC_RATE_HIKE: return '📈';
    case MarketCardId.MC_CREDIT_STIMULUS: return '📉';
    case MarketCardId.MC_PEAK_TOURISM: return '🏖️';
    case MarketCardId.MC_NIGHT_ECONOMY: return '🌙';
    case MarketCardId.MC_ALCOHOL_CHECK: return '🚨';
    case MarketCardId.MC_CASINO_PILOT: return '🎰';
    case MarketCardId.MC_LAND_FEVER: return '🔥';
    case MarketCardId.MC_FIRE_INSPECTION: return '🧯';
    case MarketCardId.MC_ANTI_SPECULATE: return '⚖️';
    case MarketCardId.MC_FUEL_SURGE: return '⛽';
    case MarketCardId.MC_URBAN_PLANNING: return '📐';
    case MarketCardId.MC_UTILITY_DOUBLE: return '⚡';
    default: return '🎴';
  }
}

function resolveMarketTitle(type: string): string {
  const dict = viTranslations.marketCards as Record<string, string | undefined>;
  const translated = dict[type];
  if (translated) {
    return translated;
  }
  return type || 'Sự Kiện Thị Trường';
}

function resolveMarketDescription(type: string): string {
  const dict = MARKET_CARD_DETAILS as Record<string, { readonly description?: string } | undefined>;
  const detail = dict[type];
  return detail?.description ?? '';
}

export const MarketEventTicker: React.FC<MarketEventTickerProps> = ({
  activeModifiers: propsModifiers,
}) => {
  const isSSR = typeof window === 'undefined';
  const storeModifiers = useGameStore((state) => state.activeModifiers);
  const activeModifiers = propsModifiers ?? (isSSR ? useGameStore.getState().activeModifiers : storeModifiers);

  const active = (activeModifiers ?? []).filter((m) => Boolean(m && m.remainingRounds > 0));

  if (active.length === 0) {
    return null;
  }

  return (
    <div
      data-testid="market-event-ticker"
      role="region"
      aria-label="Sự kiện thị trường đang hiệu lực"
      className="pointer-events-none select-none z-30 flex flex-col items-center gap-1.5 w-full max-w-[94vw] md:max-w-xl mx-auto mt-1 px-2"
    >
      {active.map((modifier, index) => {
        const cardType = String(modifier.type ?? '');
        const icon = resolveMarketIcon(cardType);
        const title = resolveMarketTitle(cardType);
        const desc = resolveMarketDescription(cardType);

        return (
          <div
            key={`${cardType}_${index}`}
            data-testid={`market-ticker-item-${cardType}`}
            className="w-full pointer-events-auto flex items-center justify-between gap-2 px-3 py-1.5 bg-[#FFFDF8] border-2 border-slate-900 rounded-xl shadow-[0_3px_0_0_#0f172a] text-slate-900 transition-all duration-150 animate-in fade-in slide-in-from-top-1"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-base sm:text-lg shrink-0" aria-hidden="true">
                {icon}
              </span>
              <div className="flex flex-col min-w-0">
                <span className="font-black text-xs sm:text-sm truncate text-slate-900 leading-tight">
                  {title}
                </span>
                {desc ? (
                  <span className="text-[11px] text-slate-600 truncate leading-tight mt-0.5">
                    {desc}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-1">
              <span className="px-2 py-0.5 rounded-lg text-[11px] font-extrabold border bg-amber-50 text-amber-900 border-amber-300">
                Còn {modifier.remainingRounds} vòng
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MarketEventTicker;
