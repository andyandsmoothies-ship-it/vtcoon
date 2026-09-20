// [IMP-132] Desktop UI De-clutter, Streamlined Market Event Ticker & Friendly Event Card Modal
// Contract Test Suite: Locking all requirements across 4 technical locks
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MarketCardId, ChanceCardId } from '../../src/domain/event_card_types.js';
import {
  MARKET_CARD_DETAILS,
  getMarketCardInfo,
  getChanceCardInfo,
} from '../../src/domain/event_card_metadata.js';
import { MarketEventTicker } from '../../src/client/ui/market_event_ticker.js';
import { EventCardModal } from '../../src/client/ui/modals/event_card_modal.js';
import { TopBar } from '../../src/client/ui/top_bar.js';

describe('IMP-132: Desktop UI De-clutter, Streamlined Ticker & Friendly Modal Contract', () => {
  // =========================================================================
  // CHỐT 1: KHỬ MÂU THUẪN DỮ LIỆU & RÀ SOÁT SSOT (src/domain/event_card_metadata.ts)
  // =========================================================================
  describe('Chốt 1: Khử Mâu Thuẫn Dữ Liệu & Rà Soát SSOT Thẻ MC_URBAN_PLANNING', () => {
    it('[TC-IMP132.01/MSS][UC-IMP132][Facet-4/ErrorDefense] Thẻ MC_URBAN_PLANNING không chứa từ ngữ mâu thuẫn tiêu cực Cấm thế chấp trong description', () => {
      const cardInfo = getMarketCardInfo(MarketCardId.MC_URBAN_PLANNING);
      expect(cardInfo.description).not.toMatch(/cấm thế chấp/i);
    });

    it('[TC-IMP132.02/MSS][UC-IMP132][Facet-4/ErrorDefense] Thẻ MC_URBAN_PLANNING không chứa từ ngữ mâu thuẫn Cấm thế chấp trong effectDetail', () => {
      const cardInfo = getMarketCardInfo(MarketCardId.MC_URBAN_PLANNING);
      expect(cardInfo.effectDetail).not.toMatch(/cấm thế chấp/i);
    });

    it('[TC-IMP132.03/MSS][UC-IMP132][Facet-2/Reactivity] Thẻ MC_URBAN_PLANNING description khẳng định rõ quyền lợi gia tăng 20% giá trị khi thế chấp', () => {
      const cardInfo = getMarketCardInfo(MarketCardId.MC_URBAN_PLANNING);
      expect(cardInfo.description).toMatch(/tăng 20% giá trị khi thế chấp/i);
    });

    it('[TC-IMP132.04/MSS][UC-IMP132][Facet-1/Boundary] Thẻ MC_URBAN_PLANNING destination là chuỗi hợp lệ phi rỗng bảo vệ SSOT imp57', () => {
      const cardInfo = getMarketCardInfo(MarketCardId.MC_URBAN_PLANNING);
      expect(cardInfo.destination).toEqual(expect.stringMatching(/\S+/));
      expect(cardInfo.destination?.trim().length).toBeGreaterThan(0);
    });

    it('[TC-IMP132.05/MSS][UC-IMP132][Facet-2/Reactivity] Thẻ MC_URBAN_PLANNING targetScope mô tả thân thiện không liệt kê thô kệch ô cờ', () => {
      const cardInfo = getMarketCardInfo(MarketCardId.MC_URBAN_PLANNING);
      expect(cardInfo.targetScope).toMatch(/Hà Nội|TP\.HCM|Xanh Lá|Tím/i);
      expect(cardInfo.targetScope).not.toMatch(/\(Ô\s*31/i);
    });
  });

  // =========================================================================
  // CHỐT 2: STREAMLINE MARKET EVENT TICKER THÀNH THANH 1 DÒNG (src/client/ui/market_event_ticker.tsx)
  // =========================================================================
  describe('Chốt 2: Streamline Market Event Ticker Thành Thanh 1 Dòng', () => {
    it('[TC-IMP132.06/MSS][UC-IMP132][Facet-1/Boundary] Ticker item hiển thị với layout 1 dòng gọn gàng items-center justify-between', () => {
      const html = renderToStaticMarkup(
        React.createElement(MarketEventTicker, {
          activeModifiers: [{ type: MarketCardId.MC_URBAN_PLANNING, remainingRounds: 1 }],
        })
      );
      expect(html).toContain('data-testid="market-ticker-item-MC_URBAN_PLANNING"');
      expect(html).toContain('items-center justify-between');
    });

    it('[TC-IMP132.07/MSS][UC-IMP132][Facet-2/Reactivity] Countdown pill có độ tương phản cao với đầy đủ class bg-amber-100 text-amber-900 border-amber-400 font-extrabold', () => {
      const html = renderToStaticMarkup(
        React.createElement(MarketEventTicker, {
          activeModifiers: [{ type: MarketCardId.MC_URBAN_PLANNING, remainingRounds: 1 }],
        })
      );
      expect(html).toContain('bg-amber-100');
      expect(html).toContain('text-amber-900');
      expect(html).toContain('border-amber-400');
      expect(html).toContain('font-extrabold');
    });

    it('[TC-IMP132.08/MSS][UC-IMP132][Facet-2/Reactivity] Countdown pill thỏa mãn định dạng regex đếm vòng của TC-IMP128.11', () => {
      const html = renderToStaticMarkup(
        React.createElement(MarketEventTicker, {
          activeModifiers: [{ type: MarketCardId.MC_FREEZE_TRADE, remainingRounds: 1 }],
        })
      );
      expect(html).toMatch(/1\s*vòng|còn\s*1/i);
    });

    it('[TC-IMP132.09/MSS][UC-IMP132][Facet-2/Reactivity] Ticker tinh giản không render đoạn mô tả dài lặp lại khi tiêu đề đã rõ nghĩa', () => {
      const html = renderToStaticMarkup(
        React.createElement(MarketEventTicker, {
          activeModifiers: [{ type: MarketCardId.MC_FREEZE_TRADE, remainingRounds: 2 }],
        })
      );
      expect(html).toContain('Đóng Băng Giao Dịch');
      expect(html).not.toContain('Tạm ngừng mua bán, cấm thế chấp đất mới');
    });

    it('[TC-IMP132.10/MSS][UC-IMP132][Facet-1/Boundary] Ticker không render thẻ span mô tả phụ nhiều chữ gây chật chội 2 dòng', () => {
      const html = renderToStaticMarkup(
        React.createElement(MarketEventTicker, {
          activeModifiers: [{ type: MarketCardId.MC_URBAN_PLANNING, remainingRounds: 1 }],
        })
      );
      expect(html).not.toContain('text-[11px] text-slate-600 truncate');
    });

    it('[TC-IMP132.11/MSS][UC-IMP132][Facet-3/Disposal] Ticker tự động unmount trả về null khi activeModifiers là mảng rỗng', () => {
      const html = renderToStaticMarkup(
        React.createElement(MarketEventTicker, {
          activeModifiers: [],
        })
      );
      expect(html).toBe('');
    });

    it('[TC-IMP132.12/MSS][UC-IMP132][Facet-3/Disposal] Ticker tự động unmount trả về null khi remainingRounds giảm về 0', () => {
      const html = renderToStaticMarkup(
        React.createElement(MarketEventTicker, {
          activeModifiers: [{ type: MarketCardId.MC_URBAN_PLANNING, remainingRounds: 0 }],
        })
      );
      expect(html).toBe('');
    });

    it('[TC-IMP132.13/MSS][UC-IMP132][Facet-4/ErrorDefense] Ticker xử lý an toàn không throw khi activeModifier có custom type', () => {
      expect(() => {
        renderToStaticMarkup(
          React.createElement(MarketEventTicker, {
            activeModifiers: [{ type: 'MC_CUSTOM_EVENT', remainingRounds: 1 }],
          })
        );
      }).not.toThrow();
    });
  });

  // =========================================================================
  // CHỐT 3: TINH GIẢN THẺ BÀI SỰ KIỆN & TRIỆT TIÊU CẮT CỤT CHỮ (src/client/ui/modals/event_card_modal.tsx)
  // =========================================================================
  describe('Chốt 3: Tinh Giản Thẻ Bài Sự Kiện & Triệt Tiêu Cắt Cụt Chữ', () => {
    it('[TC-IMP132.14/MSS][UC-IMP132][Facet-1/Boundary] Modal bảo tồn nguyên vẹn class wrapper responsive hidden sm:block cho description', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: MarketCardId.MC_URBAN_PLANNING,
          description: 'Phê duyệt quy hoạch trục giao thông mới: Tăng 20% giá trị khi thế chấp.',
        })
      );
      expect(html).toContain('hidden sm:block');
    });

    it('[TC-IMP132.15/MSS][UC-IMP132][Facet-1/Boundary] Modal bảo tồn data-testid="event-impact-summary" với class sm:hidden', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: MarketCardId.MC_URBAN_PLANNING,
          description: 'Phê duyệt quy hoạch trục giao thông mới: Tăng 20% giá trị khi thế chấp.',
        })
      );
      expect(html).toContain('data-testid="event-impact-summary"');
      expect(html).toMatch(/data-testid="event-impact-summary"[^>]*sm:hidden/);
    });

    it('[TC-IMP132.16/MSS][UC-IMP132][Facet-1/Boundary] Modal bảo tồn data-testid="event-specs-table" với class hidden sm:flex', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: MarketCardId.MC_URBAN_PLANNING,
          description: 'Phê duyệt quy hoạch trục giao thông mới: Tăng 20% giá trị khi thế chấp.',
        })
      );
      expect(html).toContain('data-testid="event-specs-table"');
      expect(html).toMatch(/data-testid="event-specs-table"[^>]*hidden sm:flex/);
    });

    it('[TC-IMP132.17/MSS][UC-IMP132][Facet-2/Reactivity] Triệt tiêu chip destination rác bị cắt cụt chữ đối với thẻ MC_URBAN_PLANNING', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: MarketCardId.MC_URBAN_PLANNING,
          description: 'Phê duyệt quy hoạch trục giao thông mới: Tăng 20% giá trị khi thế chấp.',
        })
      );
      expect(html).not.toContain('Ngân sách người chơi thực hiện thế chấp');
    });

    it('[TC-IMP132.18/MSS][UC-IMP132][Facet-2/Reactivity] EventCardModal làm nổi bật rõ ràng nội dung tăng 20% giá trị thế chấp cho MC_URBAN_PLANNING', () => {
      const info = getMarketCardInfo(MarketCardId.MC_URBAN_PLANNING);
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: MarketCardId.MC_URBAN_PLANNING,
          description: info.description,
          effectDetail: info.effectDetail,
        })
      );
      expect(html).toMatch(/tăng 20% giá trị khi thế chấp|60% thay vì 50%/i);
    });

    it('[TC-IMP132.19/MSS][UC-IMP132][Facet-4/ErrorDefense] EventCardModal tuyệt đối không render từ ngữ mâu thuẫn Cấm thế chấp khi hiển thị MC_URBAN_PLANNING', () => {
      const info = getMarketCardInfo(MarketCardId.MC_URBAN_PLANNING);
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: MarketCardId.MC_URBAN_PLANNING,
          description: info.description,
          effectDetail: info.effectDetail,
        })
      );
      expect(html).not.toContain('Cấm thế chấp');
    });

    it('[TC-IMP132.20/MSS][UC-IMP132][Facet-3/Disposal] EventCardModal không render cash delta badge khi effectDelta undefined', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: MarketCardId.MC_URBAN_PLANNING,
          description: 'Phê duyệt quy hoạch trục giao thông mới.',
        })
      );
      expect(html).not.toContain('Thu Nhập:');
      expect(html).not.toContain('Khoản Chi:');
    });
  });

  // =========================================================================
  // CHỐT 4: SỬA CẤN MÉP CHỮ VÒNG TRÊN TOPBAR (src/client/ui/top_bar.tsx)
  // =========================================================================
  describe('Chốt 4: Sửa Cấn Mép Chữ VÒNG Trên TopBar', () => {
    it('[TC-IMP132.21/MSS][UC-IMP132][Facet-1/Boundary] match-info-capsule có đệm lề an toàn chống cấn mép bo góc trái (chứa pl-3.5, pl-3 hoặc px-3)', () => {
      const html = renderToStaticMarkup(React.createElement(TopBar));
      expect(html).toContain('data-testid="match-info-capsule"');
      expect(html).toMatch(/data-testid="match-info-capsule"[^>]*(?:pl-3\.5|pl-3|px-3)/);
    });

    it('[TC-IMP132.22/MSS][UC-IMP132][Facet-1/Boundary] match-info-capsule loại bỏ hoàn toàn đệm lề quá hẹp px-2 làm cấn chữ Vòng', () => {
      const html = renderToStaticMarkup(React.createElement(TopBar));
      expect(html).not.toMatch(/data-testid="match-info-capsule"[^>]*\bpx-2\b/);
    });

    it('[TC-IMP132.23/MSS][UC-IMP132][Facet-4/ErrorDefense] TopBar render an toàn không throw exception khi gọi trực tiếp', () => {
      expect(() => {
        renderToStaticMarkup(React.createElement(TopBar));
      }).not.toThrow();
    });
  });
});
