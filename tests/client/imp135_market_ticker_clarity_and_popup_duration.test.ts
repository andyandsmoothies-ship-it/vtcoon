// [IMP-135] Market Event Ticker Clarity & Extended Pop-up Duration Contract Suite
// Traceability: [UC-IMP135], [TC-IMP135.01..TC-IMP135.20], Gotcha #177
import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  MarketEventTicker,
  resolveMarketEffectSummary,
  resolveMarketTitle,
  resolveMarketIcon,
} from '../../src/client/ui/market_event_ticker.js';
import {
  useGameStore,
  FLOATING_TEXT_DURATION_MS,
  EVENT_BANNER_DURATION_MS,
  TRANSACTION_POPUP_DURATION_MS,
  FloatingTextType,
} from '../../src/client/store/game_store.js';
import { MilestoneBanner } from '../../src/client/ui/floating_numbers.js';
import { EventCardModal } from '../../src/client/ui/modals/event_card_modal.js';
import { SERVER_ERROR_TOAST_TIMEOUT_MS } from '../../src/client/network/use_app_session.js';
import { MarketCardId, ChanceCardId } from '../../src/domain/event_card_types.js';

describe('[IMP-135] Market Event Ticker Clarity & Extended Pop-up Duration Contract Suite', () => {
  beforeEach(() => {
    useGameStore.setState({
      floatingTexts: [],
      activeModifiers: [],
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Hoàng Nam',
          balance: 10000,
          tokenColor: '#3B82F6',
          ownedProperties: [],
        },
      },
    });
  });

  // =========================================================================
  // FACET 1: Market Effect Summary Resolution & Coverage (16 Market Cards)
  // =========================================================================
  describe('FACET 1: Market Effect Summary Resolution & Coverage', () => {
    it('[TC-IMP135.01] MC_PEAK_TOURISM giải thích hiệu lực nhân đôi phí thuê du lịch/nghỉ dưỡng', () => {
      const summary = resolveMarketEffectSummary(MarketCardId.MC_PEAK_TOURISM);
      expect(summary).toMatch(/nhân đôi.*(thuê|du lịch|nghỉ dưỡng)/i);
    });

    it('[TC-IMP135.02] MC_FREEZE_TRADE giải thích hiệu lực tạm dừng mua bán/thế chấp BĐS', () => {
      const summary = resolveMarketEffectSummary(MarketCardId.MC_FREEZE_TRADE);
      expect(summary).toMatch(/(tạm ngưng|đóng băng|cấm thế chấp|mua bán)/i);
    });

    it('[TC-IMP135.03] MC_FUEL_SURGE giải thích phụ thu cước vận tải tại ô hạ tầng', () => {
      const summary = resolveMarketEffectSummary(MarketCardId.MC_FUEL_SURGE);
      expect(summary).toMatch(/(phụ thu|cước|vận tải|hạ tầng|500 Tr)/i);
    });

    it('[TC-IMP135.04] MC_ANTI_SPECULATE giải thích thuế chuyển nhượng BĐS 20%', () => {
      const summary = resolveMarketEffectSummary(MarketCardId.MC_ANTI_SPECULATE);
      expect(summary).toMatch(/(thuế|chuyển nhượng|20%)/i);
    });

    it('[TC-IMP135.05] MC_RATE_HIKE giải thích lãi thế chấp qua ô Khởi Hành', () => {
      const summary = resolveMarketEffectSummary(MarketCardId.MC_RATE_HIKE);
      expect(summary).toMatch(/(lãi|thế chấp|GO|Khởi Hành|10%)/i);
    });

    it('[TC-IMP135.06] MC_CREDIT_STIMULUS giải thích giảm 20% chi phí xây dựng toàn quốc', () => {
      const summary = resolveMarketEffectSummary(MarketCardId.MC_CREDIT_STIMULUS);
      expect(summary).toMatch(/(giảm 20%|chi phí xây dựng|tín dụng)/i);
    });

    it('[TC-IMP135.07] MC_LAND_FEVER giải thích tăng 50% tiền thuê & chuyển nhượng vùng ven', () => {
      const summary = resolveMarketEffectSummary(MarketCardId.MC_LAND_FEVER);
      expect(summary).toMatch(/(sốt đất|chuyển nhượng|tiền thuê|50%|vùng ven)/i);
    });

    it('[TC-IMP135.08] MC_FIRE_INSPECTION giải thích tổng thanh tra PCCC xử phạt công trình', () => {
      const summary = resolveMarketEffectSummary(MarketCardId.MC_FIRE_INSPECTION);
      expect(summary).toMatch(/(thanh tra|PCCC|an toàn|phạt|công trình)/i);
    });

    it('[TC-IMP135.09] MC_COASTAL_STORM giải thích miễn 100% tiền thuê và cô lập giao thông ven biển', () => {
      const summary = resolveMarketEffectSummary(MarketCardId.MC_COASTAL_STORM);
      expect(summary).toMatch(/(bão lũ|ven biển|miễn 100%|mất lượt)/i);
    });

    it('[TC-IMP135.10] resolveMarketEffectSummary fallback an toàn cho thẻ rỗng hoặc không xác định', () => {
      const fallbackUnknown = resolveMarketEffectSummary('UNKNOWN_CARD_XYZ');
      const fallbackEmpty = resolveMarketEffectSummary('');
      expect(fallbackUnknown.length).toBeGreaterThan(0);
      expect(fallbackEmpty.length).toBeGreaterThan(0);
    });

    it('[TC-IMP135.22] CC_PORT_EXCLUSIVE giải thích hiệu lực độc quyền cảng biển và trích nhận 50% cước phí', () => {
      const title = resolveMarketTitle(ChanceCardId.CC_PORT_EXCLUSIVE);
      expect(title).toBe('Hợp Tác Độc Quyền Cảng Quốc Tế');
      const icon = resolveMarketIcon(ChanceCardId.CC_PORT_EXCLUSIVE);
      expect(icon).toBe('🚢');
      const summary = resolveMarketEffectSummary(ChanceCardId.CC_PORT_EXCLUSIVE);
      expect(summary).toMatch(/(cảng|vận tải|50%|logistics)/i);
    });
  });

  // =========================================================================
  // FACET 2: Market Event Ticker 2-Tier Responsive Layout
  // =========================================================================
  describe('FACET 2: Market Event Ticker 2-Tier Responsive Layout', () => {
    it('[TC-IMP135.11] MarketEventTicker render thẻ sự kiện gồm tiêu đề và tóm tắt hiệu lực', () => {
      const markup = renderToStaticMarkup(
        React.createElement(MarketEventTicker, {
          activeModifiers: [
            {
              type: MarketCardId.MC_PEAK_TOURISM,
              remainingRounds: 1,
            },
          ],
        })
      );

      expect(markup).toContain('Mùa Cao Điểm Du Lịch Quốc Tế');
      expect(markup).toContain('Còn 1 vòng');
      expect(markup).toContain('data-testid="market-ticker-effect-summary"');
      expect(markup).toMatch(/nhân đôi/i);
    });

    it('[TC-IMP135.12] MarketEventTicker render tóm tắt hiệu lực có class line-clamp-2 hoặc line-clamp-3 cho mobile', () => {
      const markup = renderToStaticMarkup(
        React.createElement(MarketEventTicker, {
          activeModifiers: [
            {
              type: MarketCardId.MC_FREEZE_TRADE,
              remainingRounds: 2,
            },
          ],
        })
      );

      expect(markup).toMatch(/line-clamp-[23]/);
      expect(markup).toContain('Còn 2 vòng');
    });

    it('[TC-IMP135.13] MarketEventTicker không render gì khi không có active modifier nào', () => {
      const markup = renderToStaticMarkup(
        React.createElement(MarketEventTicker, {
          activeModifiers: [],
        })
      );
      expect(markup).toBe('');
    });

    it('[TC-IMP135.23] MarketEventTicker render thẻ Cơ hội độc quyền cảng biển CC_PORT_EXCLUSIVE hiển thị đúng tên tiếng Việt và biểu tượng 🚢', () => {
      const markup = renderToStaticMarkup(
        React.createElement(MarketEventTicker, {
          activeModifiers: [
            {
              type: ChanceCardId.CC_PORT_EXCLUSIVE,
              remainingRounds: 1,
            },
          ],
        })
      );

      expect(markup).toContain('Hợp Tác Độc Quyền Cảng Quốc Tế');
      expect(markup).not.toContain('>CC_PORT_EXCLUSIVE<');
      expect(markup).toContain('🚢');
      expect(markup).not.toContain('Chính sách vĩ mô tác động toàn bộ thị trường');
      expect(markup).toMatch(/(cảng|vận tải|50%|logistics)/i);
    });
  });

  // =========================================================================
  // FACET 3: Extended Pop-up & Milestone Banner Durations
  // =========================================================================
  describe('FACET 3: Extended Pop-up & Milestone Banner Durations', () => {
    it('[TC-IMP135.14] Bảo toàn FLOATING_TEXT_DURATION_MS = 2200 theo hợp đồng [TC-117.01]', () => {
      expect(FLOATING_TEXT_DURATION_MS).toBe(2200);
    });

    it('[TC-IMP135.15] EVENT_BANNER_DURATION_MS chuẩn hóa ở mức 4500ms cho thẻ Cơ Hội / Thị Trường', () => {
      expect(EVENT_BANNER_DURATION_MS).toBe(4500);
    });

    it('[TC-IMP135.16] TRANSACTION_POPUP_DURATION_MS chuẩn hóa ở mức 3600ms cho giao dịch tiền tệ', () => {
      expect(TRANSACTION_POPUP_DURATION_MS).toBe(3600);
    });

    it('[TC-IMP135.17] addFloatingText tự động gán durationMs = 4500 cho thẻ Cơ hội và Thị trường', () => {
      const store = useGameStore.getState();
      store.addFloatingText({
        text: 'Nhận 2.500 Tr.',
        type: FloatingTextType.Reward,
        playerId: 'p1',
        actionType: 'chance',
        title: 'Cổ Phiếu Tăng Trưởng',
      });

      const items = useGameStore.getState().floatingTexts;
      expect(items.length).toBe(1);
      expect(items[0]?.durationMs).toBe(4500);
    });

    it('[TC-IMP135.18] addFloatingText tự động gán durationMs = 3600 cho giao dịch mua bán, trả thuê', () => {
      const store = useGameStore.getState();
      store.addFloatingText({
        text: '-2.000 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'p1',
        actionType: 'rent_pay',
        title: 'Bến Thành',
      });

      const items = useGameStore.getState().floatingTexts;
      expect(items.length).toBe(1);
      expect(items[0]?.durationMs).toBe(3600);
    });

    it('[TC-IMP135.19] addFloatingText ưu tiên durationMs tùy chỉnh nếu được truyền tường minh', () => {
      const store = useGameStore.getState();
      store.addFloatingText({
        text: '+500 Tr.',
        type: FloatingTextType.Reward,
        playerId: 'p1',
        actionType: 'salary',
        durationMs: 5500,
      });

      const items = useGameStore.getState().floatingTexts;
      expect(items.length).toBe(1);
      expect(items[0]?.durationMs).toBe(5500);
    });
  });

  // =========================================================================
  // FACET 4: ServerToast Extended Timeout & Milestone Text Wrapping
  // =========================================================================
  describe('FACET 4: ServerToast Extended Timeout & Milestone Text Wrapping', () => {
    it('[TC-IMP135.20] SERVER_ERROR_TOAST_TIMEOUT_MS chuẩn hóa ở mức 6000ms', () => {
      expect(SERVER_ERROR_TOAST_TIMEOUT_MS).toBe(6000);
    });

    it('[TC-IMP135.21] MilestoneBanner hiển thị mô tả thẻ bài hỗ trợ nhiều dòng không bị truncate cụt chữ', () => {
      const markup = renderToStaticMarkup(
        React.createElement(MilestoneBanner, {
          item: {
            id: 'ft_card_1',
            text: 'Nhân đôi tiền thuê tại tất cả các điểm nghỉ dưỡng ven biển trong 1 vòng chơi tiếp theo',
            type: FloatingTextType.Reward,
            playerId: 'p1',
            timestamp: Date.now(),
            actionType: 'market',
            title: 'Mùa Cao Điểm Du Lịch',
          },
        })
      );

      expect(markup).toContain('Mùa Cao Điểm Du Lịch');
      expect(markup).toContain('Nhân đôi tiền thuê');
      // Đảm bảo không còn class truncate cứng trên mô tả thẻ bài sự kiện
      expect(markup).not.toMatch(/text-slate-600[^"]*truncate/);
    });
  });

  // =========================================================================
  // FACET 5: Ticker Hero Stat Badge, Clickable Details & Unambiguous Scope
  // =========================================================================
  describe('FACET 5: Ticker Hero Stat Badge, Clickable Details & Unambiguous Scope', () => {
    it('[TC-IMP135.24] MarketEventTicker render huy hiệu Hero Stat đậm nét, hỗ trợ click và không chứa mã ô kỹ thuật', () => {
      const markup = renderToStaticMarkup(
        React.createElement(MarketEventTicker, {
          activeModifiers: [
            {
              type: MarketCardId.MC_COASTAL_STORM,
              remainingRounds: 2,
            },
            {
              type: MarketCardId.MC_CREDIT_STIMULUS,
              remainingRounds: 1,
            },
          ],
        })
      );

      // Hero Stat Badges
      expect(markup).toContain('MIỄN 100% THUÊ');
      expect(markup).toContain('-20% XÂY DỰNG');

      // Clickable affordance
      expect(markup).toContain('cursor-pointer');

      // Không chứa mã ô kỹ thuật như (Ô 11, 14, 16...)
      expect(markup).not.toMatch(/\(Ô\s*\d+/);
    });

    it('[TC-IMP135.25] EventCardModal bảo toàn phạm vi mục tiêu BĐS Duyên Hải thay vì fallback Toàn bộ thị trường', () => {
      const markup = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: MarketCardId.MC_COASTAL_STORM,
          onClose: () => {},
        })
      );

      // Chip phạm vi mục tiêu phải hiển thị BĐS Duyên Hải, không được hiển thị sai thành Toàn bộ thị trường
      expect(markup).toContain('BĐS Duyên Hải');
      expect(markup).not.toContain('Toàn bộ thị trường');
    });
  });
});
