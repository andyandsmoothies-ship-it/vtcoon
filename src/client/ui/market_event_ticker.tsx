// [IMP-128][IMP-135] MarketEventTicker — Real-time Active Market Events Banner
// Displays macro policy, economic events, remaining round countdowns and clear effect summary below TopBar
import React from 'react';
import { useGameStore } from '../store/game_store.js';
import { MarketCardId, ChanceCardId } from '../../domain/event_card_types.js';
import { MARKET_CARD_DETAILS, CHANCE_CARD_DETAILS } from '../../domain/event_card_metadata.js';
import { vi as viTranslations } from '../../domain/i18n/vi.js';
import { getCardHeroStat, getHeroStatStyles } from './modals/event_card_visuals.js';

export interface MarketEventTickerProps {
  readonly activeModifiers?: ReadonlyArray<{
    readonly type: MarketCardId | ChanceCardId | string;
    readonly remainingRounds: number;
    readonly affectedCells?: readonly number[];
    readonly beneficiaryId?: string;
  }>;
}

export function resolveMarketIcon(type: string): string {
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
    case ChanceCardId.CC_PORT_EXCLUSIVE: return '🚢';
    default: return '🎴';
  }
}

export function resolveMarketTitle(type: string): string {
  const marketDict = viTranslations.marketCards as Record<string, string | undefined>;
  const marketTranslated = marketDict[type];
  if (marketTranslated) {
    return marketTranslated;
  }
  const chanceDict = viTranslations.chanceCards as Record<string, string | undefined>;
  const chanceTranslated = chanceDict[type];
  if (chanceTranslated) {
    return chanceTranslated;
  }
  return type || 'Sự Kiện Thị Trường';
}

export const ACTIVE_MARKET_EFFECT_SUMMARIES: Readonly<Record<string, string>> = {
  [MarketCardId.MC_PUBLIC_INVEST]:
    'Nhân đôi cước vận tải tại 4 Ga Tàu trên toàn bàn cờ.',
  [MarketCardId.MC_COASTAL_STORM]:
    'Miễn 100% tiền thuê tại các ô ven biển; dừng chân mất lượt.',
  [MarketCardId.MC_NIGHT_ECONOMY]:
    'Nhân đôi tiền thuê tại các ô Dịch Vụ từ Cấp 1 trở lên.',
  [MarketCardId.MC_ALCOHOL_CHECK]:
    'Giảm 50% tiền thuê ô Dịch Vụ; dừng chân phạt 800 Tr. và mất lượt.',
  [MarketCardId.MC_MEGA_CONCERT]:
    'Mọi người chơi lập tức di chuyển đến ô Dịch Vụ có cấp nhà cao nhất.',
  [MarketCardId.MC_RATE_HIKE]:
    'Thu lãi vay thế chấp 10% khi người chơi đi qua ô Khởi Hành (GO).',
  [MarketCardId.MC_CREDIT_STIMULUS]:
    'Giảm 20% chi phí xây nhà C1-C3 và miễn 100% lãi suất vay thế chấp.',
  [MarketCardId.MC_LAND_FEVER]:
    'Tăng 50% tiền thuê & giá chuyển nhượng (Bình Dương, Đồng Nai, Hưng Yên).',
  [MarketCardId.MC_FIRE_INSPECTION]:
    'Phạt 200 Tr./C1, 400 Tr./C2, 800 Tr./C3 nộp Kho Bạc. Đất C0 miễn phạt.',
  [MarketCardId.MC_ANTI_SPECULATE]:
    'Áp thuế chuyển nhượng bất động sản P2P 20% nộp vào Kho Bạc.',
  [MarketCardId.MC_PEAK_TOURISM]:
    'Nhân đôi doanh thu tiền thuê tại toàn bộ các ô BĐS Nghỉ Dưỡng.',
  [MarketCardId.MC_FREEZE_TRADE]:
    'Tạm ngưng mua ô đất mới, đóng băng đấu giá và cấm chuyển nhượng P2P.',
  [MarketCardId.MC_FUEL_SURGE]:
    'Phụ thu thêm 500 Tr. cước vận tải tại 4 Ga Tàu toàn bàn cờ.',
  [MarketCardId.MC_URBAN_PLANNING]:
    'Tăng 20% giá trị khi thế chấp BĐS Hà Nội & TP.HCM (nhận 60% giá gốc).',
  [MarketCardId.MC_UTILITY_DOUBLE]:
    'Nhân đôi phí dịch vụ tiện ích công cộng (EVN và Viettel).',
  [MarketCardId.MC_CASINO_PILOT]:
    'Thưởng 1.500 Tr./ô Dịch Vụ C2+, 3.000 Tr./ô 27 C3 (hoặc trợ cấp 1.000 Tr.).',
  [ChanceCardId.CC_PORT_EXCLUSIVE]:
    'Trích nhận 50% phí cảng từ người chơi dừng chân tại các ô Cảng biển.',
};

export function resolveMarketEffectSummary(type: string): string {
  const explicit = ACTIVE_MARKET_EFFECT_SUMMARIES[type];
  if (explicit) {
    return explicit;
  }
  const detail =
    MARKET_CARD_DETAILS[type as MarketCardId] ??
    CHANCE_CARD_DETAILS[type as ChanceCardId];
  if (!detail) {
    return 'Chính sách vĩ mô tác động toàn bộ thị trường';
  }
  const colonIndex = detail.description.indexOf(': ');
  if (colonIndex !== -1 && colonIndex < detail.description.length - 2) {
    return detail.description.slice(colonIndex + 2).trim();
  }
  return detail.description || detail.effectDetail || 'Chính sách vĩ mô tác động toàn bộ thị trường';
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
      className="pointer-events-none select-none z-30 flex flex-col items-center gap-1.5 w-full max-w-[90vw] sm:max-w-md md:max-w-xl mx-auto mt-1 px-2"
    >
      {active.map((modifier, index) => {
        const cardType = String(modifier.type ?? '');
        const icon = resolveMarketIcon(cardType);
        const title = resolveMarketTitle(cardType);
        const effectSummary = resolveMarketEffectSummary(cardType);
        const heroStat = getCardHeroStat(cardType);
        const heroStyles = getHeroStatStyles(heroStat.variant);

        const handleCardClick = () => {
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

        return (
          <div
            key={`${cardType}_${index}`}
            data-testid={`market-ticker-item-${cardType}`}
            onClick={handleCardClick}
            title="Bấm để xem chi tiết thẻ"
            className="w-full pointer-events-auto cursor-pointer flex flex-col gap-1 px-3 py-1.5 sm:py-2 bg-[#FFFDF8] border-2 border-slate-900 rounded-xl shadow-[0_3px_0_0_#0f172a] hover:border-amber-500 hover:shadow-[0_4px_0_0_#d97706] text-slate-900 transition-all duration-150 animate-in fade-in slide-in-from-top-1"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-base sm:text-lg shrink-0" aria-hidden="true">
                  {icon}
                </span>
                <span className="font-black text-xs sm:text-sm truncate text-slate-900 leading-tight">
                  {title}
                </span>
                {heroStat.value && (
                  <span className={`px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-black uppercase tracking-wider shrink-0 ${heroStyles.badge}`}>
                    {heroStat.value}
                  </span>
                )}
              </div>

              <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold border bg-amber-100 text-amber-900 border-amber-400 shrink-0">
                Còn {modifier.remainingRounds} vòng
              </span>
            </div>

            <p
              data-testid="market-ticker-effect-summary"
              className="text-[11px] sm:text-xs text-slate-600 font-semibold leading-tight line-clamp-3 pl-6 sm:pl-7 text-left"
            >
              {effectSummary}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default MarketEventTicker;
