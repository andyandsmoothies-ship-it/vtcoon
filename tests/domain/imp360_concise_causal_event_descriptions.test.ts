// [IMP-360] Contract Unit Tests for Concise Causal Event Card Descriptions
import { describe, it, expect } from 'vitest';
import { MARKET_CARD_DETAILS, CHANCE_CARD_DETAILS } from '../../src/domain/event_card_metadata.js';
import { MarketCardId } from '../../src/domain/event_card_types.js';

describe('IMP-360: Concise Causal Event Descriptions Specifications', () => {
  it('TC-360.01 [UC-META/MSS]: Given MARKET_CARD_DETAILS, When checking effectDetail length, Then all 16 market cards have length <= 78 characters', () => {
    const marketEntries = Object.entries(MARKET_CARD_DETAILS);
    const oversized = marketEntries.filter(([, detail]) => detail.effectDetail.length > 78);
    expect(marketEntries.length).toBe(16);
    expect(oversized.map(([k, d]) => `${k} (${d.effectDetail.length}c): "${d.effectDetail}"`)).toEqual([]);
  });

  it('TC-360.02 [UC-META/MSS]: Given CHANCE_CARD_DETAILS, When checking effectDetail length, Then all 20 chance cards have length <= 78 characters', () => {
    const chanceEntries = Object.entries(CHANCE_CARD_DETAILS);
    const oversized = chanceEntries.filter(([, detail]) => detail.effectDetail.length > 78);
    expect(chanceEntries.length).toBe(20);
    expect(oversized.map(([k, d]) => `${k} (${d.effectDetail.length}c): "${d.effectDetail}"`)).toEqual([]);
  });

  it('TC-360.03 [UC-META/A1]: Given MC_FUEL_SURGE, When inspecting effectDetail, Then specifies immediate surcharge 500 and 2-round transit hike', () => {
    const detail = MARKET_CARD_DETAILS[MarketCardId.MC_FUEL_SURGE];
    expect(detail.effectDetail.length).toBeLessThanOrEqual(78);
    expect(detail.effectDetail).toContain('500');
    expect(detail.effectDetail).toContain('2 vòng');
    expect(detail.effectDetail).toMatch(/Ga Tàu|Hạ tầng/);
  });

  it('TC-360.04 [UC-META/A2]: Given MC_CASINO_PILOT, When inspecting effectDetail, Then retains tier rewards 1.500, 3.000, and lowest balance stimulus 1.000', () => {
    const detail = MARKET_CARD_DETAILS[MarketCardId.MC_CASINO_PILOT];
    expect(detail.effectDetail.length).toBeLessThanOrEqual(78);
    expect(detail.effectDetail).toContain('1.500');
    expect(detail.effectDetail).toContain('3.000');
    expect(detail.effectDetail).toContain('1.000');
  });

  it('TC-360.05 [UC-META/A3]: Given MC_RATE_HIKE, When inspecting effectDetail, Then preserves all statutory percentages', () => {
    const rateHike = MARKET_CARD_DETAILS[MarketCardId.MC_RATE_HIKE];
    expect(rateHike.effectDetail.length).toBeLessThanOrEqual(78);
    expect(rateHike.effectDetail).toContain('20% chi phí xây dựng');
    expect(rateHike.effectDetail).toContain('10% khi vượt GO');
  });

  it('TC-360.06 [UC-META/A4]: Given MC_URBAN_PLANNING, When inspecting effectDetail, Then preserves all statutory percentages', () => {
    const urban = MARKET_CARD_DETAILS[MarketCardId.MC_URBAN_PLANNING];
    expect(urban.effectDetail.length).toBeLessThanOrEqual(78);
    expect(urban.effectDetail).toContain('1.5x tiền thuê');
    expect(urban.effectDetail).toContain('60% thay vì 50%');
  });

  it('TC-360.07 [UC-META/A5]: Given all 36 cards, When joined together, Then zero occurrences of forbidden unit "Tr."', () => {
    const combinedTexts = [
      ...Object.values(MARKET_CARD_DETAILS).map((d) => d.effectDetail),
      ...Object.values(CHANCE_CARD_DETAILS).map((d) => d.effectDetail),
    ].join(' --- ');
    expect(combinedTexts).not.toMatch(/\bTr\./);
  });
});
