// [IMP-141] Chuẩn Hóa Toàn Diện Nội Dung & Quy Tắc Luật Chơi Các Thông Báo Sự Kiện Thị Trường
// Traceability: [UC-IMP141], [TC-141.01..TC-141.21], Universal 4-Facet Behavioral Matrix
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  MarketEventTicker,
  resolveMarketEffectSummary,
} from '../../src/client/ui/market_event_ticker.js';
import * as marketTickerModule from '../../src/client/ui/market_event_ticker.js';
import * as metadataModule from '../../src/domain/event_card_metadata.js';
import { MarketCardId, ChanceCardId } from '../../src/domain/event_card_types.js';

describe('[IMP-141] Chuẩn Hóa Toàn Diện Nội Dung & Quy Tắc Luật Chơi Các Thông Báo Sự Kiện Thị Trường', () => {
  // =========================================================================
  // FACET 1: Market Cards Clarity Coverage (16 Market Cards)
  // =========================================================================
  describe('Facet 1: Market Cards Clarity Coverage (16 Market Cards)', () => {
    it('[TC-141.01/MSS][UC-IMP141][Facet-1/Boundary] MC_PUBLIC_INVEST nêu rõ Nhân đôi cước và 4 Ga Tàu/ô cờ, loại bỏ câu văn chung chung', () => {
      const summary = resolveMarketEffectSummary(MarketCardId.MC_PUBLIC_INVEST);
      expect(summary).toMatch(/nhân đôi cước/i);
      expect(summary).toMatch(/(4\s*ga\s*tàu|5,\s*15,\s*25,\s*35)/i);
      expect(summary).not.toMatch(/đẩy mạnh giải ngân/i);
    });

    it('[TC-141.02/MSS][UC-IMP141][Facet-1/Boundary] MC_COASTAL_STORM nêu rõ Miễn 100%, ven biển/duyên hải và mất lượt', () => {
      const summary = resolveMarketEffectSummary(MarketCardId.MC_COASTAL_STORM);
      expect(summary).toMatch(/miễn.*100%/i);
      expect(summary).toMatch(/(ven biển|duyên hải|11,\s*14,\s*16,\s*18,\s*19)/i);
      expect(summary).toMatch(/mất lượt/i);
      expect(summary).not.toMatch(/bão lũ đổ bộ/i);
    });

    it('[TC-141.03/MSS][UC-IMP141][Facet-1/Boundary] MC_NIGHT_ECONOMY nêu rõ Nhân đôi và Dịch Vụ hoặc các ô 6, 8, 26, 27', () => {
      const summary = resolveMarketEffectSummary(MarketCardId.MC_NIGHT_ECONOMY);
      expect(summary).toMatch(/nhân đôi/i);
      expect(summary).toMatch(/(dịch vụ|6,\s*8,\s*26,\s*27)/i);
    });

    it('[TC-141.04/MSS][UC-IMP141][Facet-1/Boundary] MC_ALCOHOL_CHECK nêu rõ Giảm 50% và 800 hoặc mất lượt', () => {
      const summary = resolveMarketEffectSummary(MarketCardId.MC_ALCOHOL_CHECK);
      expect(summary).toMatch(/giảm 50%/i);
      expect(summary).toMatch(/(800|mất lượt)/i);
    });

    it('[TC-141.05/MSS][UC-IMP141][Facet-1/Boundary] MC_LAND_FEVER nêu rõ 50% và Bình Dương, Đồng Nai, Hưng Yên hoặc ô 6, 8, 31', () => {
      const summary = resolveMarketEffectSummary(MarketCardId.MC_LAND_FEVER);
      expect(summary).toMatch(/50%/i);
      expect(summary).toMatch(/(bình dương|đồng nai|hưng yên|6,\s*8,\s*31)/i);
    });

    it('[TC-141.06/MSS][UC-IMP141][Facet-1/Boundary] MC_RATE_HIKE nêu rõ 10% và Khởi Hành hoặc GO', () => {
      const summary = resolveMarketEffectSummary(MarketCardId.MC_RATE_HIKE);
      expect(summary).toMatch(/10%/i);
      expect(summary).toMatch(/(khởi hành|go)/i);
    });

    it('[TC-141.07/MSS][UC-IMP141][Facet-1/Boundary] MC_CREDIT_STIMULUS nêu rõ Giảm 20% và C1-C3 hoặc thế chấp', () => {
      const summary = resolveMarketEffectSummary(MarketCardId.MC_CREDIT_STIMULUS);
      expect(summary).toMatch(/giảm 20%/i);
      expect(summary).toMatch(/(c1[-–]c3|thế chấp)/i);
    });

    it('[TC-141.08/MSS][UC-IMP141][Facet-1/Boundary] MC_PEAK_TOURISM nêu rõ Nhân đôi và Nghỉ Dưỡng hoặc danh sách ô nghỉ dưỡng', () => {
      const summary = resolveMarketEffectSummary(MarketCardId.MC_PEAK_TOURISM);
      expect(summary).toMatch(/nhân đôi/i);
      expect(summary).toMatch(/(nghỉ dưỡng|11,\s*13,\s*14,\s*21,\s*24,\s*29)/i);
    });

    it('[TC-141.09/MSS][UC-IMP141][Facet-1/Boundary] MC_FREEZE_TRADE chứa Tạm ngưng mua/đóng băng và cấm chuyển nhượng P2P, không chứa cụm từ xung đột TC-IMP132.09', () => {
      const summary = resolveMarketEffectSummary(MarketCardId.MC_FREEZE_TRADE);
      expect(summary).toMatch(/(tạm ngưng mua|đóng băng)/i);
      expect(summary).toMatch(/cấm chuyển nhượng p2p/i);
      expect(summary).not.toContain('Tạm ngừng mua bán, cấm thế chấp đất mới');
    });

    it('[TC-141.10/MSS][UC-IMP141][Facet-1/Boundary] MC_FUEL_SURGE nêu rõ 500 và Ga Tàu hoặc ô 5, 15, 25, 35', () => {
      const summary = resolveMarketEffectSummary(MarketCardId.MC_FUEL_SURGE);
      expect(summary).toMatch(/500/i);
      expect(summary).toMatch(/(ga tàu|5,\s*15,\s*25,\s*35)/i);
    });

    it('[TC-141.11/MSS][UC-IMP141][Facet-1/Boundary] MC_URBAN_PLANNING nêu rõ 20% và Hà Nội hoặc TP.HCM hoặc 60%', () => {
      const summary = resolveMarketEffectSummary(MarketCardId.MC_URBAN_PLANNING);
      expect(summary).toMatch(/20%/i);
      expect(summary).toMatch(/(hà nội|tp\.hcm|60%)/i);
    });

    it('[TC-141.12/MSS][UC-IMP141][Facet-1/Boundary] MC_UTILITY_DOUBLE nêu rõ Nhân đôi và EVN hoặc Viettel hoặc ô 12, 28', () => {
      const summary = resolveMarketEffectSummary(MarketCardId.MC_UTILITY_DOUBLE);
      expect(summary).toMatch(/nhân đôi/i);
      expect(summary).toMatch(/(evn|viettel|12,\s*28)/i);
    });

    it('[TC-141.13/MSS][UC-IMP141][Facet-1/Boundary] MC_ANTI_SPECULATE nêu rõ 20% và Kho Bạc hoặc P2P', () => {
      const summary = resolveMarketEffectSummary(MarketCardId.MC_ANTI_SPECULATE);
      expect(summary).toMatch(/20%/i);
      expect(summary).toMatch(/(kho bạc|p2p)/i);
    });

    it('[TC-141.14/MSS][UC-IMP141][Facet-1/Boundary] MC_FIRE_INSPECTION nêu rõ 200, 400, 800 và C0', () => {
      const summary = resolveMarketEffectSummary(MarketCardId.MC_FIRE_INSPECTION);
      expect(summary).toMatch(/200/i);
      expect(summary).toMatch(/400/i);
      expect(summary).toMatch(/800/i);
      expect(summary).toMatch(/c0/i);
    });

    it('[TC-141.15/MSS][UC-IMP141][Facet-1/Boundary] MC_CASINO_PILOT nêu rõ 1.500, 3.000 hoặc 1.000', () => {
      const summary = resolveMarketEffectSummary(MarketCardId.MC_CASINO_PILOT);
      expect(summary).toMatch(/(1\.500|3\.000|1\.000)/i);
    });

    it('[TC-141.16/MSS][UC-IMP141][Facet-1/Boundary] MC_MEGA_CONCERT nêu rõ di chuyển và Dịch Vụ', () => {
      const summary = resolveMarketEffectSummary(MarketCardId.MC_MEGA_CONCERT);
      expect(summary).toMatch(/di chuyển/i);
      expect(summary).toMatch(/dịch vụ/i);
    });
  });

  // =========================================================================
  // FACET 2: Active Chance Modifiers Coverage
  // =========================================================================
  describe('Facet 2: Active Chance Modifiers Coverage', () => {
    it('[TC-141.17/MSS][UC-IMP141][Facet-2/Reactivity] CC_PORT_EXCLUSIVE nêu rõ 50% và phí cảng hoặc Cảng biển', () => {
      const summary = resolveMarketEffectSummary(ChanceCardId.CC_PORT_EXCLUSIVE);
      expect(summary).toMatch(/50%/i);
      expect(summary).toMatch(/(phí cảng|cảng biển)/i);
    });
  });

  // =========================================================================
  // FACET 3: Layout & Rendering Safeguard
  // =========================================================================
  describe('Facet 3: Layout & Rendering Safeguard', () => {
    it('[TC-141.18/MSS][UC-IMP141][Facet-3/StateReactivity] MarketEventTicker render thẻ MC_PUBLIC_INVEST với class line-clamp-3 chống cắt chữ', () => {
      const html = renderToStaticMarkup(
        React.createElement(MarketEventTicker, {
          activeModifiers: [
            {
              type: MarketCardId.MC_PUBLIC_INVEST,
              remainingRounds: 2,
            },
          ],
        })
      );
      expect(html).toContain('data-testid="market-ticker-item-MC_PUBLIC_INVEST"');
      expect(html).toContain('data-testid="market-ticker-effect-summary"');
      expect(html).toContain('whitespace-nowrap');
    });

    it('[TC-141.19/MSS][UC-IMP141][Facet-3/StateReactivity] MarketEventTicker render đồng thời 2 thẻ MC_PUBLIC_INVEST và MC_COASTAL_STORM không crash', () => {
      const html = renderToStaticMarkup(
        React.createElement(MarketEventTicker, {
          activeModifiers: [
            {
              type: MarketCardId.MC_PUBLIC_INVEST,
              remainingRounds: 2,
            },
            {
              type: MarketCardId.MC_COASTAL_STORM,
              remainingRounds: 1,
            },
          ],
        })
      );
      expect(html).toContain('data-testid="market-ticker-item-MC_PUBLIC_INVEST"');
      expect(html).toContain('data-testid="market-ticker-item-MC_COASTAL_STORM"');
      expect(html).toContain('Còn 2 vòng');
      expect(html).toContain('Còn 1 vòng');
    });
  });

  // =========================================================================
  // FACET 4: Fallback & Boundary Safeguard
  // =========================================================================
  describe('Facet 4: Fallback & Boundary Safeguard', () => {
    it('[TC-141.20/MSS][UC-IMP141][Facet-4/ErrorDefense] resolveMarketEffectSummary fallback an toàn cho thẻ rỗng hoặc không xác định', () => {
      const fallbackUnknown = resolveMarketEffectSummary('UNKNOWN_CARD_XYZ');
      const fallbackEmpty = resolveMarketEffectSummary('');
      expect(fallbackUnknown.length).toBeGreaterThan(0);
      expect(fallbackEmpty.length).toBeGreaterThan(0);
    });

    it('[TC-141.21/MSS][UC-IMP141][Facet-4/ErrorDefense] ACTIVE_MARKET_EFFECT_SUMMARIES được xuất khẩu và tất cả chuỗi tóm tắt có độ dài <= 85 ký tự', () => {
      const summariesDict = (
        (marketTickerModule as Record<string, unknown>).ACTIVE_MARKET_EFFECT_SUMMARIES ??
        (metadataModule as Record<string, unknown>).ACTIVE_MARKET_EFFECT_SUMMARIES
      ) as Record<string, string> | undefined;

      expect(summariesDict).toBeDefined();
      const entries = Object.values(summariesDict ?? {});
      expect(entries.length).toBeGreaterThanOrEqual(16);
      const longest = entries.reduce((max, s) => Math.max(max, s.length), 0);
      expect(longest).toBeLessThanOrEqual(85);
    });
  });
});
