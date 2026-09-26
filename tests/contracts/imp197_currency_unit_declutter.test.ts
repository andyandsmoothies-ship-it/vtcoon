// [TC-197.01..20/MSS][UC-IMP197] Contract Tests — Currency Unit Declutter & Clean Numerical Display
// 5-Facet Universal Behavioral Matrix: Format Boundary, 3D Board Art, Hero Stats, Punchy Summaries, Card Metadata
// Strict Atomic Mandate: 1-4 assertions per test, zero loops or forEach inside it()

import { describe, it, expect } from 'vitest';
import { formatCurrency } from '../../src/client/ui/ui_helpers';
import { formatPriceLabel, TILE_METADATA_MAP } from '../../src/client/3d/tile_texture_data';
import { getCardHeroStat } from '../../src/client/ui/modals/event_card_visuals';
import { PUNCHY_EVENT_SUMMARIES } from '../../src/client/ui/event_card_punchy_summaries';
import { CHANCE_CARD_DETAILS, MARKET_CARD_DETAILS } from '../../src/domain/event_card_metadata';
import { ChanceCardId, MarketCardId } from '../../src/domain/event_card_types';

describe('[IMP-197] Currency Unit Declutter Contract Tests', () => {
  // =========================================================================
  // Facet 1: formatCurrency SSOT (Boundary & Range)
  // =========================================================================
  it('[TC-197.01/MSS][UC-IMP197] formatCurrency formats large positive numbers without "Tr."', () => {
    expect(formatCurrency(12500)).toBe('12.500');
    expect(formatCurrency(1000)).toBe('1.000');
  });

  it('[TC-197.02/MSS][UC-IMP197] formatCurrency formats small positive numbers without "Tr."', () => {
    expect(formatCurrency(50)).toBe('50');
  });

  it('[TC-197.03/MSS][UC-IMP197] formatCurrency formats zero as "0" without "Tr."', () => {
    expect(formatCurrency(0)).toBe('0');
  });

  it('[TC-197.04/MSS][UC-IMP197] formatCurrency formats negative numbers with minus prefix and no "Tr."', () => {
    expect(formatCurrency(-1200)).toBe('-1.200');
    expect(formatCurrency(-500)).toBe('-500');
  });

  it('[TC-197.05/MSS][UC-IMP197] formatCurrency clamps negative rounding near zero to "0"', () => {
    expect(formatCurrency(-0.2)).toBe('0');
  });

  // =========================================================================
  // Facet 2: 3D Board Tile Texture Labels (State Reactivity & 3D Art)
  // =========================================================================
  it('[TC-197.06/MSS][UC-IMP197] formatPriceLabel formats prices as clean dot-separated numbers without "Tr."', () => {
    expect(formatPriceLabel(2000)).toBe('2.000');
    expect(formatPriceLabel(500)).toBe('500');
  });

  it('[TC-197.07/MSS][UC-IMP197] TILE_METADATA_MAP Tile 0 (GO) priceLabel is "+2.000" without "Tr."', () => {
    expect(TILE_METADATA_MAP[0]?.priceLabel).toBe('+2.000');
  });

  it('[TC-197.08/MSS][UC-IMP197] TILE_METADATA_MAP Tile 4 (Tax) priceLabel and actionLabel are "NỘP 1.000" without "TR."', () => {
    expect(TILE_METADATA_MAP[4]?.priceLabel).toBe('NỘP 1.000');
    expect(TILE_METADATA_MAP[4]?.actionLabel).toBe('NỘP 1.000');
  });

  // =========================================================================
  // Facet 3: Event Card Hero Stats (Resource Disposal & Visual Contracts)
  // =========================================================================
  it('[TC-197.09/MSS][UC-IMP197] getCardHeroStat CC_STOCK_PROFIT value is "+2.500" without "Tr."', () => {
    const heroStat = getCardHeroStat(ChanceCardId.CC_STOCK_PROFIT);
    expect(heroStat?.value).toBe('+2.500');
  });

  it('[TC-197.10/MSS][UC-IMP197] getCardHeroStat CC_TAX_AUDIT value is "-500 / ĐẤT TRỐNG" without "Tr."', () => {
    const heroStat = getCardHeroStat(ChanceCardId.CC_TAX_AUDIT);
    expect(heroStat?.value).toBe('-500 / ĐẤT TRỐNG');
  });

  it('[TC-197.11/MSS][UC-IMP197] getCardHeroStat MC_FUEL_SURGE value is "-500" without "Tr."', () => {
    const heroStat = getCardHeroStat(MarketCardId.MC_FUEL_SURGE);
    expect(heroStat?.value).toBe('-500');
  });

  it('[TC-197.12/MSS][UC-IMP197] getCardHeroStat CC_OVERDRAFT value is "+3.000" without "Tr."', () => {
    const heroStat = getCardHeroStat(ChanceCardId.CC_OVERDRAFT);
    expect(heroStat?.value).toBe('+3.000');
  });

  // =========================================================================
  // Facet 4: Event Card Punchy Summaries (Error Defense & Terminal Invariants)
  // =========================================================================
  it('[TC-197.13/MSS][UC-IMP197] PUNCHY_EVENT_SUMMARIES MC_ALCOHOL_CHECK contains no "Tr." or "Tr"', () => {
    const summary = PUNCHY_EVENT_SUMMARIES[MarketCardId.MC_ALCOHOL_CHECK];
    expect(summary).toBeDefined();
    expect(summary).not.toMatch(/\bTr\./);
    expect(summary).not.toMatch(/\bTr\b/);
  });

  it('[TC-197.14/MSS][UC-IMP197] PUNCHY_EVENT_SUMMARIES CC_CONTRACT_PENALTY contains no "Tr." or "Tr"', () => {
    const summary = PUNCHY_EVENT_SUMMARIES[ChanceCardId.CC_CONTRACT_PENALTY];
    expect(summary).toBeDefined();
    expect(summary).not.toMatch(/\bTr\./);
    expect(summary).not.toMatch(/\bTr\b/);
  });

  it('[TC-197.15/MSS][UC-IMP197] PUNCHY_EVENT_SUMMARIES CC_COPYRIGHT contains no "Tr." or "Tr"', () => {
    const summary = PUNCHY_EVENT_SUMMARIES[ChanceCardId.CC_COPYRIGHT];
    expect(summary).toBeDefined();
    expect(summary).not.toMatch(/\bTr\./);
    expect(summary).not.toMatch(/\bTr\b/);
  });

  it('[TC-197.16/MSS][UC-IMP197] PUNCHY_EVENT_SUMMARIES CC_FREE_CREDIT contains no "Tr." or "Tr"', () => {
    const summary = PUNCHY_EVENT_SUMMARIES[ChanceCardId.CC_FREE_CREDIT];
    expect(summary).toBeDefined();
    expect(summary).not.toMatch(/\bTr\./);
    expect(summary).not.toMatch(/\bTr\b/);
  });

  // =========================================================================
  // Facet 5: Event Card Metadata Descriptions (Cross-Coupling Blast Radius)
  // =========================================================================
  it('[TC-197.17/MSS][UC-IMP197] CHANCE_CARD_DETAILS CC_TAX_AUDIT effectDetail contains no "Tr."', () => {
    const detail = CHANCE_CARD_DETAILS[ChanceCardId.CC_TAX_AUDIT];
    expect(detail).toBeDefined();
    expect(detail.effectDetail).not.toMatch(/\bTr\./);
  });

  it('[TC-197.18/MSS][UC-IMP197] CHANCE_CARD_DETAILS CC_STOCK_PROFIT destination contains no "Tr."', () => {
    const detail = CHANCE_CARD_DETAILS[ChanceCardId.CC_STOCK_PROFIT];
    expect(detail).toBeDefined();
    expect(detail.destination).not.toMatch(/\bTr\./);
  });

  it('[TC-197.19/MSS][UC-IMP197] MARKET_CARD_DETAILS MC_FUEL_SURGE effectDetail contains no "Tr."', () => {
    const detail = MARKET_CARD_DETAILS[MarketCardId.MC_FUEL_SURGE];
    expect(detail).toBeDefined();
    expect(detail.effectDetail).not.toMatch(/\bTr\./);
  });

  it('[TC-197.20/MSS][UC-IMP197] MARKET_CARD_DETAILS MC_ALCOHOL_CHECK destination contains no "Tr."', () => {
    const detail = MARKET_CARD_DETAILS[MarketCardId.MC_ALCOHOL_CHECK];
    expect(detail).toBeDefined();
    expect(detail.destination).not.toMatch(/\bTr\./);
  });
});
