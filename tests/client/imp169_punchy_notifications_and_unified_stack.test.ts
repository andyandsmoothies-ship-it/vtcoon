// [IMP-169][Trạm 1] Contract Test Suite: Punchy Event Notifications & Unified Pop-up Stack Architecture
// Universal 4-Facet Behavioral Matrix:
// Facet 1 (Boundary & Range): 100% 36 event cards punchy summary <= 35 chars, MC_MEGA_CONCERT, fallback <= 38 chars
// Facet 2 (Reactivity & Content Rendering): MilestoneBanner truncate (no line-clamp-2), unified flex stack with gap-2 (no top-[11.5rem]), dynamic top offsets
// Facet 3 (Disposal, SSR & A11y): Singleton milestone-banner-container in SSR DOM, touch & keydown dismiss
// Facet 4 (Error Defense): Safe handling of empty, undefined, and null inputs without throwing

import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  FloatingNumbersOverlay,
  MilestoneBanner,
} from '../../src/client/ui/floating_numbers.js';
import {
  useGameStore,
  FloatingTextType,
  type FloatingTextItem,
} from '../../src/client/store/game_store.js';
import { MarketCardId, ChanceCardId } from '../../src/domain/event_card_types.js';

type PunchyResolver = (cardIdOrTitle?: string, rawText?: string) => string;

let resolvePunchyEventSummary: PunchyResolver | undefined;
let PUNCHY_EVENT_SUMMARIES: Record<string, string> | undefined;

beforeAll(async () => {
  try {
    const mod = await import('../../src/client/ui/event_card_punchy_summaries.js');
    resolvePunchyEventSummary = mod.resolvePunchyEventSummary;
    PUNCHY_EVENT_SUMMARIES = mod.PUNCHY_EVENT_SUMMARIES;
  } catch {
    // Expected fallback when module not yet created in Phase 2 RED stage
    resolvePunchyEventSummary = undefined;
    PUNCHY_EVENT_SUMMARIES = undefined;
  }
});

const BASE_REGULAR_TOAST: FloatingTextItem = {
  id: 'ft_reg_1',
  text: '+2.000 Tr.',
  type: FloatingTextType.Reward,
  playerId: 'p1',
  actionType: 'salary',
  title: 'Thưởng qua ô Khởi Hành',
  timestamp: 1700000000000,
};

const BASE_MILESTONE_ITEM: FloatingTextItem = {
  id: 'ft_ms_1',
  text: 'Di chuyển đến ô Dịch Vụ cao nhất',
  type: FloatingTextType.Reward,
  playerId: 'p1',
  actionType: 'market',
  title: 'Đại Nhạc Hội Quốc Tế',
  timestamp: 1700000000001,
};

const ALL_MARKET_CARDS = Object.values(MarketCardId);
const ALL_CHANCE_CARDS = Object.values(ChanceCardId);

describe('[IMP-169] Punchy Event Notifications & Unified Pop-up Stack Architecture', () => {
  beforeEach(() => {
    useGameStore.setState({
      floatingTexts: [BASE_REGULAR_TOAST],
      activeModifiers: [],
      activeModal: null,
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Bot AI 3 (Aggressive)',
          tokenColor: '#ef4444',
          balance: 28000,
          ownedProperties: [],
        },
      },
    });
  });

  // ============================================================================
  // FACET 1: Boundary & Range
  // ============================================================================
  describe('[Facet-1/Boundary] Thẻ Sự Kiện Rút Gọn & Giới Hạn Ký Tự', () => {
    it('[TC-IMP169.01/MSS][UC-GAME-023][Facet-1/Boundary] Từ điển PUNCHY_EVENT_SUMMARIES bao phủ đủ 36 thẻ sự kiện', () => {
      expect(PUNCHY_EVENT_SUMMARIES, 'PUNCHY_EVENT_SUMMARIES must be exported from event_card_punchy_summaries.ts').toBeDefined();
      const cardKeys = Object.keys(PUNCHY_EVENT_SUMMARIES ?? {});
      expect(cardKeys.length).toBe(36);
    });

    it.each(ALL_MARKET_CARDS)(
      '[TC-IMP169.01/MSS][UC-GAME-023][Facet-1/Boundary] Market Card %s trả về summary rút gọn có độ dài <= 35 ký tự',
      (cardId) => {
        expect(resolvePunchyEventSummary, 'resolvePunchyEventSummary must be exported').toBeDefined();
        const summary = resolvePunchyEventSummary!(cardId);
        expect(summary.length).toBeGreaterThan(0);
        expect(summary.length).toBeLessThanOrEqual(35);
      },
    );

    it.each(ALL_CHANCE_CARDS)(
      '[TC-IMP169.01/MSS][UC-GAME-023][Facet-1/Boundary] Chance Card %s trả về summary rút gọn có độ dài <= 35 ký tự',
      (cardId) => {
        expect(resolvePunchyEventSummary, 'resolvePunchyEventSummary must be exported').toBeDefined();
        const summary = resolvePunchyEventSummary!(cardId);
        expect(summary.length).toBeGreaterThan(0);
        expect(summary.length).toBeLessThanOrEqual(35);
      },
    );

    it('[TC-IMP169.02/MSS][UC-GAME-023][Facet-1/Boundary] MC_MEGA_CONCERT trả về đúng "Di chuyển đến ô Dịch Vụ cao nhất" (32 ký tự) không chứa chuỗi dài cũ', () => {
      expect(resolvePunchyEventSummary, 'resolvePunchyEventSummary must be exported').toBeDefined();
      const summary = resolvePunchyEventSummary!(MarketCardId.MC_MEGA_CONCERT);
      expect(summary).toBe('Di chuyển đến ô Dịch Vụ cao nhất');
      expect(summary.length).toBe(32);
      expect(summary).not.toContain('Mọi người chơi lập tức di chuyển');
    });

    it('[TC-IMP169.03/A1][UC-GAME-023][Facet-1/Boundary] Thẻ ngoài từ điển có dấu chấm phẩy được fallback rút gọn vế đầu trước dấu ; với độ dài <= 38 ký tự', () => {
      expect(resolvePunchyEventSummary, 'resolvePunchyEventSummary must be exported').toBeDefined();
      const rawText = 'Tập đoàn mở rộng quy mô kinh doanh; thưởng ngay 500 Tr. cho người sở hữu nhiều BĐS nhất.';
      const summary = resolvePunchyEventSummary!('UNKNOWN_CARD_SEMICOLON', rawText);
      expect(summary).toBe('Tập đoàn mở rộng quy mô kinh doanh');
      expect(summary.length).toBeLessThanOrEqual(38);
    });

    it('[TC-IMP169.03/A2][UC-GAME-023][Facet-1/Boundary] Thẻ ngoài từ điển có dấu chấm được fallback rút gọn vế đầu trước dấu . với độ dài <= 38 ký tự', () => {
      expect(resolvePunchyEventSummary, 'resolvePunchyEventSummary must be exported').toBeDefined();
      const rawText = 'Cơn bão thị trường đổ bộ vào đất liền. Toàn bộ tiền thuê bị đình chỉ trong 1 vòng.';
      const summary = resolvePunchyEventSummary!('UNKNOWN_CARD_DOT', rawText);
      expect(summary).toBe('Cơn bão thị trường đổ bộ vào đất liền');
      expect(summary.length).toBeLessThanOrEqual(38);
    });

    it('[TC-IMP169.03/A3][UC-GAME-023][Facet-1/Boundary] Thẻ ngoài từ điển không có dấu phân cách được cắt gọn an toàn <= 38 ký tự', () => {
      expect(resolvePunchyEventSummary, 'resolvePunchyEventSummary must be exported').toBeDefined();
      const rawText = 'Một sự kiện vô cùng bất ngờ đã xảy ra trên toàn bộ các thành phố lớn và gây ảnh hưởng nghiêm trọng';
      const summary = resolvePunchyEventSummary!('UNKNOWN_CARD_LONG', rawText);
      expect(summary.length).toBeGreaterThan(0);
      expect(summary.length).toBeLessThanOrEqual(38);
    });
  });

  // ============================================================================
  // FACET 2: Reactivity & Content Rendering
  // ============================================================================
  describe('[Facet-2/Reactivity] Reactivity & Content Rendering (MilestoneBanner & Unified Stack)', () => {
    it('[TC-IMP169.04/MSS][UC-GAME-023][Facet-2/Reactivity] MilestoneBanner subtitle hiển thị 1 dòng với class truncate', () => {
      const item: FloatingTextItem = {
        id: 'ft_test_desc',
        type: FloatingTextType.Reward,
        playerId: 'p1',
        actionType: 'market',
        title: 'Đại Nhạc Hội Quốc Tế',
        text: 'Mọi người chơi lập tức di chuyển đến ô Dịch Vụ có cấp nhà cao nhất',
        timestamp: Date.now(),
      };
      const html = renderToStaticMarkup(React.createElement(MilestoneBanner, { item }));
      const descMatch = html.match(/<span[^>]*class="([^"]*)"[^>]*>[\s\S]*?di chuyển[\s\S]*?<\/span>/i)?.[1] ?? '';
      expect(descMatch).toContain('truncate');
    });

    it('[TC-IMP169.04/A1][UC-GAME-023][Facet-2/Reactivity] MilestoneBanner subtitle không còn sử dụng class line-clamp-2', () => {
      const item: FloatingTextItem = {
        id: 'ft_test_desc_clamp',
        type: FloatingTextType.Reward,
        playerId: 'p1',
        actionType: 'market',
        title: 'Đại Nhạc Hội Quốc Tế',
        text: 'Mọi người chơi lập tức di chuyển đến ô Dịch Vụ có cấp nhà cao nhất',
        timestamp: Date.now(),
      };
      const html = renderToStaticMarkup(React.createElement(MilestoneBanner, { item }));
      const descMatch = html.match(/<span[^>]*class="([^"]*)"[^>]*>[\s\S]*?di chuyển[\s\S]*?<\/span>/i)?.[1] ?? '';
      expect(descMatch).not.toContain('line-clamp-2');
    });

    it('[TC-IMP169.05/MSS][UC-GAME-023][Facet-2/Reactivity] FloatingNumbersOverlay chứa cả milestone và regular toast trong container flexbox chung có gap-2', () => {
      useGameStore.setState({
        floatingTexts: [BASE_MILESTONE_ITEM, BASE_REGULAR_TOAST],
        activeModifiers: [],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const unifiedContainerMatch = /<div[^>]*class="[^"]*gap-2[^"]*"[^>]*>[\s\S]*?data-testid="milestone-banner-container"[\s\S]*?data-testid="contextual-transaction-badge"/;
      expect(unifiedContainerMatch.test(html)).toBe(true);
    });

    it('[TC-IMP169.05/A1][UC-GAME-023][Facet-2/Reactivity] FloatingNumbersOverlay triệt tiêu hoàn toàn khoảng cách 52px (không chứa class top-[11.5rem])', () => {
      useGameStore.setState({
        floatingTexts: [BASE_MILESTONE_ITEM, BASE_REGULAR_TOAST],
        activeModifiers: [],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).not.toContain('top-[11.5rem]');
    });

    it('[TC-IMP169.06/MSS][UC-GAME-023][Facet-2/Reactivity] activeMarketCount === 0: Unified Stack Container định vị tại top-20', () => {
      useGameStore.setState({
        floatingTexts: [BASE_REGULAR_TOAST],
        activeModifiers: [],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toContain('top-20');
      expect(html).not.toContain('top-[4.25rem]');
    });

    it('[TC-IMP169.06/A1][UC-GAME-023][Facet-2/Reactivity] activeMarketCount === 1: Unified Stack Container định vị tại top-[10.5rem]', () => {
      useGameStore.setState({
        floatingTexts: [BASE_MILESTONE_ITEM, BASE_REGULAR_TOAST],
        activeModifiers: [{ type: MarketCardId.MC_ANTI_SPECULATE, remainingRounds: 2 }],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toContain('top-[10.5rem]');
      expect(html).not.toContain('top-[16.5rem]');
    });

    it('[TC-IMP169.06/A2][UC-GAME-023][Facet-2/Reactivity] activeMarketCount >= 2: Unified Stack Container định vị tại top-[15.5rem]', () => {
      useGameStore.setState({
        floatingTexts: [BASE_MILESTONE_ITEM, BASE_REGULAR_TOAST],
        activeModifiers: [
          { type: MarketCardId.MC_ANTI_SPECULATE, remainingRounds: 2 },
          { type: MarketCardId.MC_RATE_HIKE, remainingRounds: 1 },
        ],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toContain('top-[15.5rem]');
      expect(html).not.toContain('top-[21.5rem]');
    });
  });

  // ============================================================================
  // FACET 3: Disposal, SSR & A11y
  // ============================================================================
  describe('[Facet-3/Disposal] Disposal, SSR & A11y Interaction', () => {
    it('[TC-IMP169.07/MSS][UC-GAME-023][Facet-3/Disposal] milestone-banner-container chỉ xuất hiện DUY NHẤT 1 lần trong SSR DOM', () => {
      useGameStore.setState({
        floatingTexts: [BASE_MILESTONE_ITEM, BASE_REGULAR_TOAST],
        activeModifiers: [],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const matches = html.match(/data-testid="milestone-banner-container"/g);
      expect(matches).not.toBeNull();
      expect(matches?.length).toBe(1);
    });

    it('[TC-IMP169.08/MSS][UC-GAME-023][Facet-3/A11y] Chạm/Click vào MilestoneBanner kích hoạt removeFloatingText', () => {
      const removeSpy = vi.fn();
      useGameStore.setState({ removeFloatingText: removeSpy });

      const item: FloatingTextItem = {
        id: 'ft_click_dismiss_169',
        type: FloatingTextType.Reward,
        playerId: 'p1',
        actionType: 'chance',
        title: 'Phiếu Cơ Hội',
        text: '+500 Tr.',
        timestamp: Date.now(),
      };

      type InteractiveVdom = {
        props: {
          onClick?: () => void;
          onKeyDown?: (e: { key: string; preventDefault?: () => void }) => void;
        };
      };
      let vdom: InteractiveVdom | undefined;
      function TestWrapper() {
        vdom = MilestoneBanner({ item }) as unknown as InteractiveVdom;
        return vdom as unknown as React.ReactElement;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));
      expect(vdom).toBeDefined();
      expect(vdom?.props.onClick).toBeDefined();
      vdom?.props.onClick?.();
      expect(removeSpy).toHaveBeenCalledWith('ft_click_dismiss_169');
    });

    it('[TC-IMP169.08/A1][UC-GAME-023][Facet-3/A11y] Nhấn Enter trên MilestoneBanner kích hoạt removeFloatingText', () => {
      const removeSpy = vi.fn();
      useGameStore.setState({ removeFloatingText: removeSpy });

      const item: FloatingTextItem = {
        id: 'ft_enter_dismiss_169',
        type: FloatingTextType.Reward,
        playerId: 'p1',
        actionType: 'market',
        title: 'Thẻ Thị Trường',
        text: 'Nội dung ngắn',
        timestamp: Date.now(),
      };

      type InteractiveVdom = {
        props: {
          onClick?: () => void;
          onKeyDown?: (e: { key: string; preventDefault?: () => void }) => void;
        };
      };
      let vdom: InteractiveVdom | undefined;
      function TestWrapper() {
        vdom = MilestoneBanner({ item }) as unknown as InteractiveVdom;
        return vdom as unknown as React.ReactElement;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));
      expect(vdom?.props.onKeyDown).toBeDefined();
      vdom?.props.onKeyDown?.({ key: 'Enter', preventDefault: vi.fn() });
      expect(removeSpy).toHaveBeenCalledWith('ft_enter_dismiss_169');
    });

    it('[TC-IMP169.08/A2][UC-GAME-023][Facet-3/A11y] Nhấn phím Space trên MilestoneBanner kích hoạt removeFloatingText', () => {
      const removeSpy = vi.fn();
      useGameStore.setState({ removeFloatingText: removeSpy });

      const item: FloatingTextItem = {
        id: 'ft_space_dismiss_169',
        type: FloatingTextType.Reward,
        playerId: 'p1',
        actionType: 'market',
        title: 'Thẻ Thị Trường',
        text: 'Nội dung ngắn',
        timestamp: Date.now(),
      };

      type InteractiveVdom = {
        props: {
          onClick?: () => void;
          onKeyDown?: (e: { key: string; preventDefault?: () => void }) => void;
        };
      };
      let vdom: InteractiveVdom | undefined;
      function TestWrapper() {
        vdom = MilestoneBanner({ item }) as unknown as InteractiveVdom;
        return vdom as unknown as React.ReactElement;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));
      expect(vdom?.props.onKeyDown).toBeDefined();
      vdom?.props.onKeyDown?.({ key: ' ', preventDefault: vi.fn() });
      expect(removeSpy).toHaveBeenCalledWith('ft_space_dismiss_169');
    });

    it('[TC-IMP169.08/A3][UC-GAME-023][Facet-3/A11y] Nhấn các phím khác (Escape, Tab) trên MilestoneBanner không kích hoạt removeFloatingText', () => {
      const removeSpy = vi.fn();
      useGameStore.setState({ removeFloatingText: removeSpy });

      const item: FloatingTextItem = {
        id: 'ft_other_key_169',
        type: FloatingTextType.Reward,
        playerId: 'p1',
        actionType: 'market',
        title: 'Thẻ Thị Trường',
        text: 'Nội dung ngắn',
        timestamp: Date.now(),
      };

      type InteractiveVdom = {
        props: {
          onClick?: () => void;
          onKeyDown?: (e: { key: string; preventDefault?: () => void }) => void;
        };
      };
      let vdom: InteractiveVdom | undefined;
      function TestWrapper() {
        vdom = MilestoneBanner({ item }) as unknown as InteractiveVdom;
        return vdom as unknown as React.ReactElement;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));
      expect(vdom?.props.onKeyDown).toBeDefined();
      vdom?.props.onKeyDown?.({ key: 'Escape', preventDefault: vi.fn() });
      vdom?.props.onKeyDown?.({ key: 'Tab', preventDefault: vi.fn() });
      expect(removeSpy).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // FACET 4: Error Defense
  // ============================================================================
  describe('[Facet-4/ErrorDefense] Error Defense & Edge Values', () => {
    it('[TC-IMP169.09/MSS][UC-GAME-023][Facet-4/ErrorDefense] resolvePunchyEventSummary xử lý chuỗi rỗng trả về rỗng không bị throw', () => {
      expect(resolvePunchyEventSummary, 'resolvePunchyEventSummary must be exported').toBeDefined();
      expect(resolvePunchyEventSummary!('', '')).toBe('');
    });

    it('[TC-IMP169.09/A1][UC-GAME-023][Facet-4/ErrorDefense] resolvePunchyEventSummary xử lý undefined trả về rỗng không bị throw', () => {
      expect(resolvePunchyEventSummary, 'resolvePunchyEventSummary must be exported').toBeDefined();
      expect(resolvePunchyEventSummary!(undefined, undefined)).toBe('');
    });

    it('[TC-IMP169.09/A2][UC-GAME-023][Facet-4/ErrorDefense] resolvePunchyEventSummary xử lý null an toàn không bị throw', () => {
      expect(resolvePunchyEventSummary, 'resolvePunchyEventSummary must be exported').toBeDefined();
      expect(resolvePunchyEventSummary!(null as unknown as string, null as unknown as string)).toBe('');
    });

    it('[TC-IMP169.09/A3][UC-GAME-023][Facet-4/ErrorDefense] resolvePunchyEventSummary với cardId lạ và rawText undefined không bị throw', () => {
      expect(resolvePunchyEventSummary, 'resolvePunchyEventSummary must be exported').toBeDefined();
      expect(() => resolvePunchyEventSummary!('NON_EXISTENT_CARD_ID', undefined)).not.toThrow();
    });
  });
});
