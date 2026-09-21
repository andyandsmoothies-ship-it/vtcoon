// [IMP-156: Trạm 1 RED] Event Cards Visual De-Clutter & Single-Truth UX Overhaul
// Universal 4-Facet Behavioral Matrix Contract Test Suite
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MarketCardId, ChanceCardId } from '../../src/domain/event_card_types.js';
import { EventCardModal } from '../../src/client/ui/modals/event_card_modal.js';
import {
  cleanEventDescription,
  isFinancialDestination,
  sanitizeDestination,
  getCardHeroStat,
} from '../../src/client/ui/modals/event_card_visuals.js';

describe('[IMP-156: Trạm 1 RED] Event Cards Visual De-Clutter & Single-Truth UX Overhaul', () => {
  // =========================================================================
  // Facet 1: Boundary & Formatting (cleanEventDescription & isFinancialDestination)
  // =========================================================================
  describe('Facet 1: Boundary & Formatting', () => {
    it('[TC-156.01/MSS][UC-IMP156][Facet-1/Boundary] cleanEventDescription bóc tách tiền tố lặp trước dấu hai chấm và viết hoa chữ cái đầu', () => {
      const raw = 'Đóng băng thị trường & siết tín dụng BĐS: Tạm ngưng mua bán, cấm thế chấp đất mới.';
      expect(cleanEventDescription(raw)).toBe('Tạm ngưng mua bán, cấm thế chấp đất mới.');
    });

    it('[TC-156.02/MSS][UC-IMP156][Facet-1/Boundary] cleanEventDescription giữ nguyên chuỗi không chứa dấu hai chấm', () => {
      const raw = 'Nhận ngay 2.500 Tr. tiền mặt vào tài khoản';
      expect(cleanEventDescription(raw)).toBe(raw);
    });

    it('[TC-156.03/MSS][UC-IMP156][Facet-1/Boundary] cleanEventDescription xử lý an toàn chuỗi rỗng hoặc undefined', () => {
      expect(cleanEventDescription('')).toBe('');
      expect(cleanEventDescription(undefined)).toBe('');
    });

    it('[TC-156.04/MSS][UC-IMP156][Facet-1/Boundary] isFinancialDestination nhận diện chuẩn các thực thể luân chuyển tiền tệ có thực', () => {
      expect(isFinancialDestination('Kho Bạc Nhà Nước')).toBe(true);
      expect(isFinancialDestination('Nộp phạt vào Kho Bạc Nhà Nước')).toBe(true);
      expect(isFinancialDestination('Chủ sở hữu ô Dịch vụ')).toBe(true);
      expect(isFinancialDestination('Tài khoản cá nhân', 2000)).toBe(true);
    });

    it('[TC-156.05/MSS][UC-IMP156][Facet-1/Boundary] isFinancialDestination chặn đứng các câu văn mô tả chính sách phi tiền tệ', () => {
      expect(isFinancialDestination('Đóng băng các kênh thanh khoản thị trường')).toBe(false);
      expect(isFinancialDestination('Bảo toàn tài chính cá nhân')).toBe(false);
      expect(isFinancialDestination('Toàn thị trường')).toBe(false);
      expect(isFinancialDestination('')).toBe(false);
    });
  });

  // =========================================================================
  // Facet 2: State Reactivity & Single-Truth Desktop/Mobile Rendering
  // =========================================================================
  describe('Facet 2: State Reactivity & Single-Truth Rendering', () => {
    it('[TC-156.06/MSS][UC-IMP156][Facet-2/Reactivity] Desktop specs-table không chứa thẻ paragraph lặp lại văn bản mô tả lần 2', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: MarketCardId.MC_FREEZE_TRADE,
        })
      );
      // Khối event-specs-table không được chứa thẻ <p>
      const specsTableMatch = html.match(/<div[^>]*data-testid="event-specs-table"[^>]*>([\s\S]*?)<\/div>/)?.[1] ?? '';
      expect(specsTableMatch).not.toContain('<p');
    });

    it('[TC-156.07/MSS][UC-IMP156][Facet-2/Reactivity] Single-Truth description hiển thị trên Desktop qua class hidden sm:block', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: MarketCardId.MC_FREEZE_TRADE,
        })
      );
      expect(html).toContain('hidden sm:block');
      expect(html).toContain('Tạm ngưng mua ô đất mới');
    });

    it('[TC-156.08/MSS][UC-IMP156][Facet-2/Reactivity] Thẻ MC_FREEZE_TRADE đổi Hero Stat từ ĐÓNG BĂNG THỊ TRƯỜNG sang HIỆU LỰC để tránh lặp từ', () => {
      const hero = getCardHeroStat(MarketCardId.MC_FREEZE_TRADE);
      expect(hero.label).toBe('HIỆU LỰC');
      expect(hero.value).toContain('CẤM THẾ CHẤP & ĐẤU GIÁ');
    });

    it('[TC-156.09/MSS][UC-IMP156][Facet-2/Reactivity] Thẻ MC_FREEZE_TRADE triệt tiêu hoàn toàn chip 🏛️ chứa câu văn 43 ký tự', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: MarketCardId.MC_FREEZE_TRADE,
        })
      );
      expect(html).not.toContain('Đóng băng các kênh thanh khoản thị trường');
    });

    it('[TC-156.10/MSS][UC-IMP156][Facet-2/Reactivity] Single-Truth: khi caller chỉ truyền effectDetail, Desktop vẫn hiển thị nội dung', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: 'CUSTOM_TEST_CARD',
          title: 'Sự Kiện Đặc Biệt',
          effectDetail: 'Nội dung tác động duy nhất cho cả mobile và desktop',
        })
      );
      expect(html).toContain('Nội dung tác động duy nhất cho cả mobile và desktop');
    });
  });

  // =========================================================================
  // Facet 3: Disposal, Touch Target & Interaction Ergonomics
  // =========================================================================
  describe('Facet 3: Disposal & Touch Target Ergonomics', () => {
    it('[TC-156.11/MSS][UC-IMP156][Facet-3/Disposal] Nút Đóng ✕ đạt chuẩn kích thước tối thiểu 44px (min-w-[44px] min-h-[44px])', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: MarketCardId.MC_FREEZE_TRADE,
          onClose: vi.fn(),
        })
      );
      expect(html).toContain('min-w-[44px]');
      expect(html).toContain('min-h-[44px]');
    });

    it('[TC-156.12/MSS][UC-IMP156][Facet-3/Disposal] Nút CTA [ĐÃ HIỂU / TIẾP TỤC] kích hoạt onConfirm callback khi nhấn', () => {
      const confirmSpy = vi.fn();
      let vdom: any;
      function TestWrapper() {
        vdom = EventCardModal({
          cardType: 'chance',
          cardId: ChanceCardId.CC_STOCK_PROFIT,
          onConfirm: confirmSpy,
        });
        return vdom;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));
      const btn = vdom.props.children.find((child: any) => child?.type === 'button' && child?.props?.children?.includes?.('Đã Hiểu'));
      expect(btn).toBeDefined();
      btn.props.onClick();
      expect(confirmSpy).toHaveBeenCalledOnce();
    });
  });

  // =========================================================================
  // Facet 4: Layout Budget, Safe Areas & Invariant Defense
  // =========================================================================
  describe('Facet 4: Layout Budget, Safe Areas & Invariant Defense', () => {
    it('[TC-156.13/MSS][UC-IMP156][Facet-4/LayoutBudget] Modal mở rộng chiều rộng Desktop lên sm:max-w-[420px]', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: MarketCardId.MC_FREEZE_TRADE,
        })
      );
      expect(html).toContain('sm:max-w-[420px]');
    });

    it('[TC-156.14/MSS][UC-IMP156][Facet-4/LayoutBudget] Mobile event-impact-summary chỉ chứa đúng 2 badge (🎯 Phạm vi và ⏳ Thời hạn)', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: MarketCardId.MC_FREEZE_TRADE,
        })
      );
      const summaryMatch = html.match(/<div[^>]*data-testid="event-impact-summary"[^>]*>([\s\S]*?)<\/div>/)?.[1] ?? '';
      expect(summaryMatch).toContain('🎯');
      expect(summaryMatch).toContain('⏳');
      expect(summaryMatch).not.toContain('🏛️');
    });

    it('[TC-156.15/MSS][UC-IMP156][Facet-4/LayoutBudget] Desktop specs-table hiển thị chip 🏛️ Kho Bạc khi thẻ thực sự có phát sinh tài chính', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'chance',
          cardId: ChanceCardId.CC_TAX_AUDIT,
          effectDelta: -500,
        })
      );
      expect(html).toContain('data-testid="event-specs-table"');
      expect(html).toContain('🏛️');
      expect(html).toContain('Kho Bạc');
    });

    it('[TC-156.16/MSS][UC-IMP156][Facet-4/ErrorDefense] Bảo toàn nguyên vẹn 8 Hero Stats đã được kiểm thử hợp đồng trong imp134', () => {
      expect(getCardHeroStat(MarketCardId.MC_FUEL_SURGE).value).toMatch(/500\s*Tr\./);
      expect(getCardHeroStat(MarketCardId.MC_ALCOHOL_CHECK).value).toBe('-800 Tr.');
      expect(getCardHeroStat(MarketCardId.MC_RATE_HIKE).value).toContain('10%');
      expect(getCardHeroStat(MarketCardId.MC_URBAN_PLANNING).value).toContain('+20%');
      expect(getCardHeroStat(ChanceCardId.CC_STOCK_PROFIT).value).toContain('+2.500 Tr.');
      expect(getCardHeroStat(ChanceCardId.CC_TAX_AUDIT).value).toContain('-500 Tr.');
      expect(getCardHeroStat(ChanceCardId.CC_DIPLOMATIC).value).toBe('MIỄN 100% THUÊ');
      expect(getCardHeroStat(ChanceCardId.CC_SWAP_PROJECT).value).toBe('ĐỀN BÙ 130%');
    });
  });
});
