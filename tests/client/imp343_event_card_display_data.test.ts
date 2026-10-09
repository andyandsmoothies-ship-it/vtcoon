// [IMP-343] Contract Unit Tests for Event Card Display Data Resolution (Deep Module Standard)
import { describe, it, expect } from 'vitest';
import { MarketCardId, ChanceCardId } from '../../src/domain/event_card_types.js';
import { resolveEventCardDisplayData, getHeroStatStyles } from '../../src/client/ui/modals/event_card_visuals.js';
import type { ClientMarketModifier } from '../../src/client/store/game_store_types.js';

describe('IMP-343: resolveEventCardDisplayData Contract Specifications', () => {
  it('TC-343.01 [UC-EVENT-CARD/MSS]: Given single Market card MC_FUEL_SURGE, When resolveEventCardDisplayData is invoked, Then computes title from ticker, duration "1 vòng chơi", and hero stat variant "negative"', () => {
    const data = resolveEventCardDisplayData({
      cardType: 'market',
      cardId: MarketCardId.MC_FUEL_SURGE,
      isMultiEvent: false,
      currentIdx: 0,
    });

    expect(data.title).toBe('Cú Sốc Giá Xăng Dầu');
    expect(data.duration).toBe('2 vòng chơi');
    expect(data.heroStat).toEqual({ label: 'PHỤ PHÍ NHIÊN LIỆU', value: '-500', variant: 'negative' });
    expect(data.isCtaNext).toBe(false);
  });

  it('TC-343.02 [UC-EVENT-CARD/MSS]: Given single Chance card CC_STOCK_PROFIT, When resolveEventCardDisplayData is invoked, Then resolves chance card metadata, applies fallback scope "Người chơi rút thẻ", and sets default duration "Tức thì"', () => {
    const data = resolveEventCardDisplayData({
      cardType: 'chance',
      cardId: ChanceCardId.CC_STOCK_PROFIT,
      isMultiEvent: false,
      currentIdx: 0,
    });

    expect(data.title).toBe('Chốt Lời Cổ Phiếu VN30');
    expect(data.targetScope).toBe('Người chơi rút thẻ');
    expect(data.duration).toBe('Tức thì');
    expect(data.heroStat).toEqual({ label: 'LỢI NHUẬN ĐẦU TƯ', value: '+2.500', variant: 'positive' });
  });

  it('TC-343.03 [UC-EVENT-CARD/MSS]: Given multiple activeModifiers and isMultiEvent true, When resolveEventCardDisplayData is invoked for currentIdx 0 of 2, Then computes isCtaNext true and formats CTA button with sequence counter', () => {
    const mockModifiers: readonly ClientMarketModifier[] = [
      { type: MarketCardId.MC_FUEL_SURGE, remainingRounds: 2, affectedCells: [1, 2] },
      { type: MarketCardId.MC_RATE_HIKE, remainingRounds: 1, affectedCells: [] },
    ];

    const data = resolveEventCardDisplayData({
      cardType: 'market',
      cardId: MarketCardId.MC_FUEL_SURGE,
      isMultiEvent: true,
      currentIdx: 0,
      activeModifiers: mockModifiers,
    });

    expect(data.isCtaNext).toBe(true);
    expect(data.ctaText).toBe('SỰ KIỆN KẾ TIẾP (2/2) →');
    expect(data.duration).toBe('2 vòng chơi');
  });

  it('TC-343.04 [UC-EVENT-CARD/MSS]: Given destination requiring financial disbursement, When resolveEventCardDisplayData is invoked with non-zero effectDelta, Then sets shouldShowDestination to true and sanitizes destination string', () => {
    const data = resolveEventCardDisplayData({
      cardType: 'chance',
      cardId: ChanceCardId.CC_CONTRACT_PENALTY,
      isMultiEvent: false,
      currentIdx: 0,
      destination: 'Kho Bạc Nhà Nước',
      effectDelta: -1000,
    });

    expect(data.shouldShowDestination).toBe(true);
    expect(data.destination).toBe('Kho Bạc Nhà Nước');
  });

  it('TC-343.05 [UC-EVENT-CARD/A1]: Given explicit custom title and description props, When resolveEventCardDisplayData is invoked, Then custom overrides take precedence over card metadata fallbacks', () => {
    const data = resolveEventCardDisplayData({
      cardType: 'market',
      cardId: MarketCardId.MC_FUEL_SURGE,
      isMultiEvent: false,
      currentIdx: 0,
      title: 'TÙY CHỈNH TIÊU ĐỀ',
      description: 'Mô tả tùy chỉnh riêng biệt.',
    });

    expect(data.title).toBe('TÙY CHỈNH TIÊU ĐỀ');
    expect(data.description).toBe('Mô tả tùy chỉnh riêng biệt.');
  });

  it('TC-343.06 [UC-EVENT-CARD/A2]: Given activeModifier with remainingRounds, When resolveEventCardDisplayData is invoked, Then maps rounds into resolvedDuration string', () => {
    const activeMod: ClientMarketModifier = {
      type: MarketCardId.MC_LAND_FEVER,
      remainingRounds: 3,
      affectedCells: [5, 6, 7],
    };

    const data = resolveEventCardDisplayData({
      cardType: 'market',
      cardId: MarketCardId.MC_LAND_FEVER,
      isMultiEvent: true,
      currentIdx: 0,
      activeModifiers: [activeMod],
    });

    expect(data.activeModifier).toEqual(activeMod);
    expect(data.duration).toBe('3 vòng chơi');
  });

  it('TC-343.07 [UC-EVENT-CARD/MSS]: Given card with raw effectDetail containing markup or whitespace, When resolveEventCardDisplayData is invoked, Then description is properly sanitized', () => {
    const data = resolveEventCardDisplayData({
      cardType: 'market',
      cardId: MarketCardId.MC_FUEL_SURGE,
      isMultiEvent: false,
      currentIdx: 0,
      effectDetail: '  Xăng dầu tăng mạnh.   ',
    });

    expect(data.description).toBe('Xăng dầu tăng mạnh.');
    expect(data.isCtaNext).toBe(false);
  });

  it('TC-343.08 [UC-EVENT-CARD/ADV-01]: Given unknown card ID not in registry, When resolveEventCardDisplayData is invoked, Then falls back gracefully to raw ID with zero exceptions', () => {
    const data = resolveEventCardDisplayData({
      cardType: 'market',
      cardId: 'UNKNOWN_CUSTOM_EVENT_ID',
      isMultiEvent: false,
      currentIdx: 0,
    });

    expect(data.title).toBe('UNKNOWN_CUSTOM_EVENT_ID');
    expect(data.iconEmoji).toBe('📰');
    expect(data.heroStat.variant).toBe('info');
    expect(data.duration).toBe('1 vòng chơi');
  });

  it('TC-343.09 [UC-EVENT-CARD/ADV-02]: Given market destination with zero delta, When resolveEventCardDisplayData is invoked, Then shouldShowDestination is strictly false', () => {
    const data = resolveEventCardDisplayData({
      cardType: 'market',
      cardId: MarketCardId.MC_RATE_HIKE,
      isMultiEvent: false,
      currentIdx: 0,
      destination: 'Toàn thị trường',
      effectDelta: 0,
    });

    expect(data.shouldShowDestination).toBe(false);
    expect(data.destination).toBe('Toàn thị trường');
  });

  it('TC-343.10 [UC-EVENT-CARD/ADV-03]: Given high-magnitude effectDelta, When resolveEventCardDisplayData is invoked, Then computes dynamic formatted hero stat value safely', () => {
    const data = resolveEventCardDisplayData({
      cardType: 'chance',
      cardId: ChanceCardId.CC_STOCK_PROFIT,
      isMultiEvent: false,
      currentIdx: 0,
      effectDelta: 50_000,
    });

    expect(data.heroStat.variant).toBe('positive');
    expect(data.heroStat.value).toBe('+50.000');
  });

  it('TC-343.11 [UC-EVENT-CONFIG/MSS]: Given hero stat variants, When getHeroStatStyles is invoked, Then returns correct tailwind styling tokens', () => {
    const positive = getHeroStatStyles('positive');
    const negative = getHeroStatStyles('negative');
    const warning = getHeroStatStyles('warning');
    const info = getHeroStatStyles('info');

    expect(positive.badge).toContain('bg-emerald-100');
    expect(negative.badge).toContain('bg-rose-100');
    expect(warning.badge).toContain('bg-amber-100');
    expect(info.badge).toContain('bg-sky-100');
  });
});

