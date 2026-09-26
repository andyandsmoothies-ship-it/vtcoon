// [IMP-134] Thẻ Bài Fintech "Hiểu Ngay Trong 1 Giây" / Event Card Hero Stat Visual Overhaul
// Universal 4-Facet Behavioral Matrix Contract Test Suite
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MarketCardId, ChanceCardId } from '../../src/domain/event_card_types.js';
import { EventCardModal } from '../../src/client/ui/modals/event_card_modal.js';

/**
 * Helper tìm kiếm ReactElement con theo thuộc tính/predicate để kiểm tra handler ở điểm tiêu thụ
 */
function findElementByProp(node: any, predicate: (props: any) => boolean): any {
  if (!node || typeof node !== 'object') return null;
  if (node.props && predicate(node.props)) return node;
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findElementByProp(child, predicate);
      if (found) return found;
    }
  }
  if (node.props && node.props.children) {
    return findElementByProp(node.props.children, predicate);
  }
  return null;
}

describe('[IMP-134] Thẻ Bài Fintech "Hiểu Ngay Trong 1 Giây" / Event Card Hero Stat Visual Overhaul', () => {
  // =========================================================================
  // CHỐT 1: KHỐI HERO STAT TO BẢN & 0.5 GIÂY NẮM BẮT (FACET 2 - REACTIVITY)
  // =========================================================================
  describe('Chốt 1: Khối Hero Stat To Bản & 0.5 Giây Nắm Bắt', () => {
    it('[TC-IMP134.01/MSS][UC-IMP134][Facet-2/Reactivity] Render thẻ có khối data-testid="event-hero-stat" với định dạng số Mono nổi bật', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: MarketCardId.MC_FUEL_SURGE,
          description: 'Biến động giá xăng dầu: Phụ thu thêm 500 Tr. cước vận tải tại mọi ô hạ tầng.',
        })
      );
      expect(html).toContain('data-testid="event-hero-stat"');
      expect(html).toMatch(/data-testid="event-hero-stat"[^>]*font-mono/);
    });

    it('[TC-IMP134.02/MSS][UC-IMP134][Facet-2/Reactivity] Thẻ MC_FUEL_SURGE hiển thị Hero Stat định mức 500 Tr. kèm nhãn phụ phí nhiên liệu / phụ thu', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: MarketCardId.MC_FUEL_SURGE,
          description: 'Biến động giá xăng dầu: Phụ thu thêm 500 Tr. cước vận tải tại mọi ô hạ tầng.',
        })
      );
      expect(html).toContain('data-testid="event-hero-stat"');
      expect(html).toMatch(/data-testid="event-hero-stat"[\s\S]*?[+-]?500/);
      expect(html).toMatch(/data-testid="event-hero-stat"[\s\S]*?(?:Phụ thu|Phụ phí|Cảnh báo|Nhiên liệu)/i);
    });

    it('[TC-IMP134.03/MSS][UC-IMP134][Facet-2/Reactivity] Thẻ MC_ALCOHOL_CHECK hiển thị Hero Stat -800 với biến thể cảnh báo hoặc phạt', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: MarketCardId.MC_ALCOHOL_CHECK,
          description: 'Chiến dịch kiểm tra nồng độ cồn: Khách dừng chân bị phạt 800 Tr. nộp Kho Bạc và tạm giữ xe.',
        })
      );
      expect(html).toContain('data-testid="event-hero-stat"');
      expect(html).toMatch(/data-testid="event-hero-stat"[\s\S]*?-800/);
    });

    it('[TC-IMP134.04/MSS][UC-IMP134][Facet-2/Reactivity] Thẻ MC_RATE_HIKE hiển thị Hero Stat 10% QUA GO hoặc tỷ lệ lãi suất', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: MarketCardId.MC_RATE_HIKE,
          description: 'Ngân Hàng Nhà Nước tăng lãi suất: Thu lãi thế chấp 10% khi người chơi qua ô GO.',
        })
      );
      expect(html).toContain('data-testid="event-hero-stat"');
      expect(html).toMatch(/data-testid="event-hero-stat"[\s\S]*?10%\s*(?:QUA GO|LÃI SUẤT|THẾ CHẤP)?/i);
    });

    it('[TC-IMP134.05/MSS][UC-IMP134][Facet-2/Reactivity] Thẻ MC_URBAN_PLANNING hiển thị Hero Stat +20% THẾ CHẤP hoặc tương đương', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: MarketCardId.MC_URBAN_PLANNING,
          description: 'Quy hoạch trục đô thị mới: Tăng 20% giá trị khi thế chấp BĐS trung tâm Hà Nội & TP.HCM.',
        })
      );
      expect(html).toContain('data-testid="event-hero-stat"');
      expect(html).toMatch(/data-testid="event-hero-stat"[\s\S]*?\+20%\s*(?:THẾ CHẤP)?/i);
    });

    it('[TC-IMP134.06/MSS][UC-IMP134][Facet-2/Reactivity] Thẻ CC_STOCK_PROFIT hiển thị Hero Stat +2.500 Tr. tiền mặt', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'chance',
          cardId: ChanceCardId.CC_STOCK_PROFIT,
          description: 'Chốt lời danh mục đầu tư tăng trưởng nóng. Nhận ngay 2.500 Tr. tiền mặt.',
          effectDelta: 2500,
        })
      );
      expect(html).toContain('data-testid="event-hero-stat"');
      expect(html).toMatch(/data-testid="event-hero-stat"[\s\S]*?\+2\.500/);
    });

    it('[TC-IMP134.07/MSS][UC-IMP134][Facet-2/Reactivity] Thẻ CC_TAX_AUDIT hiển thị Hero Stat định mức thanh tra -500 / ĐẤT TRỐNG', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'chance',
          cardId: ChanceCardId.CC_TAX_AUDIT,
          description: 'Thanh tra thuế doanh nghiệp đột xuất. Nộp phạt 500 Tr. cho mỗi ô đất trống chưa xây dựng.',
        })
      );
      expect(html).toContain('data-testid="event-hero-stat"');
      expect(html).toMatch(/data-testid="event-hero-stat"[\s\S]*?-500(?:\s*\/\s*ĐẤT TRỐNG)?/i);
    });

    it('[TC-IMP134.08/MSS][UC-IMP134][Facet-2/Reactivity] Thẻ CC_DIPLOMATIC hiển thị Hero Stat MIỄN 100% THUÊ', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'chance',
          cardId: ChanceCardId.CC_DIPLOMATIC,
          description: 'Nhận Thẻ Miễn Trừ Ngoại Giao trên tay. Tự động miễn phí 100% tiền thuê khi dẫm BĐS đối thủ.',
        })
      );
      expect(html).toContain('data-testid="event-hero-stat"');
      expect(html).toMatch(/data-testid="event-hero-stat"[\s\S]*?MIỄN\s*100%\s*THUÊ/i);
    });

    it('[TC-IMP134.09/MSS][UC-IMP134][Facet-2/Reactivity] Thẻ CC_SWAP_PROJECT hiển thị Hero Stat ĐỀN BÙ 130%', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'chance',
          cardId: ChanceCardId.CC_SWAP_PROJECT,
          description: 'Quyền ưu tiên mua lại dự án C0 đền bù 130% giá gốc từ đối thủ.',
        })
      );
      expect(html).toContain('data-testid="event-hero-stat"');
      expect(html).toMatch(/data-testid="event-hero-stat"[\s\S]*?ĐỀN\s*BÙ\s*130%/i);
    });

    it('[TC-IMP134.10/MSS][UC-IMP134][Facet-2/Reactivity] Thẻ có effectDelta tùy biến tự động phản ánh số liệu vào event-hero-stat', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'chance',
          cardId: ChanceCardId.CC_COPYRIGHT,
          description: 'Vi phạm bản quyền chương trình nghệ thuật.',
          effectDelta: -1200,
        })
      );
      expect(html).toContain('data-testid="event-hero-stat"');
      expect(html).toMatch(/data-testid="event-hero-stat"[\s\S]*?-1\.200/);
    });
  });

  // =========================================================================
  // CHỐT 2: ICON MINH HỌA CHUYÊN ĐỀ & TÁCH BIỆT EMOJI (FACET 2 & FACET 4)
  // =========================================================================
  describe('Chốt 2: Icon Minh Họa Chuyên Đề & Tách Biệt Emoji', () => {
    it('[TC-IMP134.11/MSS][UC-IMP134][Facet-2/Reactivity] Thẻ MC_FUEL_SURGE hiển thị emoji xăng xe ⛽ chuyên đề thay vì icon mặc định', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: MarketCardId.MC_FUEL_SURGE,
          description: 'Biến động giá xăng dầu: Phụ thu thêm 500 Tr. cước vận tải.',
        })
      );
      expect(html).toContain('⛽');
      expect(html).not.toContain('📰');
    });

    it('[TC-IMP134.12/MSS][UC-IMP134][Facet-2/Reactivity] Thẻ MC_ALCOHOL_CHECK hiển thị emoji còi cảnh sát 🚨 chuyên đề thay vì icon mặc định', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: MarketCardId.MC_ALCOHOL_CHECK,
          description: 'Chiến dịch kiểm tra nồng độ cồn',
        })
      );
      expect(html).toContain('🚨');
      expect(html).not.toContain('📰');
    });

    it('[TC-IMP134.13/MSS][UC-IMP134][Facet-2/Reactivity] Thẻ MC_PEAK_TOURISM hiển thị emoji bãi biển 🏖️ chuyên đề thay vì icon mặc định', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: MarketCardId.MC_PEAK_TOURISM,
          description: 'Mùa cao điểm du lịch ven biển',
        })
      );
      expect(html).toContain('🏖️');
      expect(html).not.toContain('📰');
    });

    it('[TC-IMP134.14/MSS][UC-IMP134][Facet-2/Reactivity] Thẻ CC_PLATE_AUCTION hiển thị emoji ô tô 🚘 chuyên đề thay vì icon mặc định', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'chance',
          cardId: ChanceCardId.CC_PLATE_AUCTION,
          description: 'Đấu giá thành công biển số định danh VIP',
        })
      );
      expect(html).toContain('🚘');
      expect(html).not.toContain('⚡');
    });

    it('[TC-IMP134.15/MSS][UC-IMP134][Facet-4/ErrorDefense] Thẻ Market với dummy ID MC_01 tự động fallback về icon mặc định 📰 không throw', () => {
      let html = '';
      expect(() => {
        html = renderToStaticMarkup(
          React.createElement(EventCardModal, {
            cardType: 'market',
            cardId: 'MC_01',
            description: 'Sự kiện thị trường giả lập',
          })
        );
      }).not.toThrow();
      expect(html).toContain('📰');
    });

    it('[TC-IMP134.16/MSS][UC-IMP134][Facet-4/ErrorDefense] Thẻ Chance với dummy ID CC_01 tự động fallback về icon mặc định ⚡ không throw', () => {
      let html = '';
      expect(() => {
        html = renderToStaticMarkup(
          React.createElement(EventCardModal, {
            cardType: 'chance',
            cardId: 'CC_01',
            description: 'Cơ hội đầu tư giả lập',
          })
        );
      }).not.toThrow();
      expect(html).toContain('⚡');
    });
  });

  // =========================================================================
  // CHỐT 3: BẢO TỒN WRAPPER HỢP ĐỒNG & RESPONSIVE ERGONOMICS (FACET 1 - BOUNDARY)
  // =========================================================================
  describe('Chốt 3: Bảo Tồn Wrapper Hợp Đồng & Responsive Ergonomics', () => {
    it('[TC-IMP134.17/MSS][UC-IMP134][Facet-1/Boundary] Container modal chứa class đệm thoáng pt-7 chống cấn nút đóng', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: MarketCardId.MC_URBAN_PLANNING,
          description: 'Quy hoạch trục đô thị mới.',
        })
      );
      expect(html).toContain('data-testid="event-card-modal"');
      expect(html).toMatch(/data-testid="event-card-modal"[^>]*\bpt-7\b/);
    });

    it('[TC-IMP134.18/MSS][UC-IMP134][Facet-1/Boundary] Container modal chứa max-h-[90vh] và overflow-y-auto chống tràn màn hình mobile', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: MarketCardId.MC_URBAN_PLANNING,
          description: 'Quy hoạch trục đô thị mới.',
        })
      );
      expect(html).toMatch(/data-testid="event-card-modal"[^>]*max-h-\[90vh\]/);
      expect(html).toMatch(/data-testid="event-card-modal"[^>]*overflow-y-auto/);
    });

    it('[TC-IMP134.19/MSS][UC-IMP134][Facet-1/Boundary] Modal bảo tồn wrapper mô tả desktop với class hidden sm:block', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: MarketCardId.MC_FUEL_SURGE,
          description: 'Biến động giá xăng dầu: Phụ thu thêm 500 Tr.',
        })
      );
      expect(html).toContain('hidden sm:block');
    });

    it('[TC-IMP134.20/MSS][UC-IMP134][Facet-1/Boundary] Modal bảo tồn data-testid="event-impact-summary" với class sm:hidden cho mobile', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: MarketCardId.MC_FUEL_SURGE,
          description: 'Biến động giá xăng dầu: Phụ thu thêm 500 Tr.',
        })
      );
      expect(html).toContain('data-testid="event-impact-summary"');
      expect(html).toMatch(/data-testid="event-impact-summary"[^>]*sm:hidden/);
    });

    it('[TC-IMP134.21/MSS][UC-IMP134][Facet-1/Boundary] Modal bảo tồn data-testid="event-specs-table" với class hidden sm:flex cho desktop', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: MarketCardId.MC_FUEL_SURGE,
          description: 'Biến động giá xăng dầu: Phụ thu thêm 500 Tr.',
        })
      );
      expect(html).toContain('data-testid="event-specs-table"');
      expect(html).toMatch(/data-testid="event-specs-table"[^>]*hidden sm:flex/);
    });

    it('[TC-IMP134.22/MSS][UC-IMP134][Facet-1/Boundary] event-impact-summary bảo tồn nguyên vẹn chuỗi Toàn bộ thị trường và 1 vòng chơi cho thẻ thị trường mặc định', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: MarketCardId.MC_RATE_HIKE,
          description: 'Ngân Hàng Nhà Nước tăng lãi suất.',
        })
      );
      expect(html).toContain('Toàn bộ thị trường');
      expect(html).toContain('1 vòng chơi');
    });
  });

  // =========================================================================
  // CHỐT 4: TRIỆT TIÊU SỐ Ô THÔ KỆCH, VĂN BẢN LẶP ĐÚP & NÚT BẤM (FACET 3 & FACET 4)
  // =========================================================================
  describe('Chốt 4: Triệt Tiêu Số Ô Thô Kệch, Văn Bản Lặp Đúp & Nút Bấm Xử Lý', () => {
    it('[TC-IMP134.23/MSS][UC-IMP134][Facet-4/ErrorDefense] Triệt tiêu dãy số ô thô kệch (Ô 5, 15, 25, 35) khỏi nhãn phạm vi thanh thông số capsule của MC_FUEL_SURGE', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: MarketCardId.MC_FUEL_SURGE,
          description: 'Biến động giá xăng dầu: Phụ thu thêm 500 Tr.',
        })
      );
      expect(html).not.toContain('(Ô 5, 15, 25, 35)');
      expect(html).toContain('Hạ tầng Giao thông');
    });

    it('[TC-IMP134.24/MSS][UC-IMP134][Facet-4/ErrorDefense] Triệt tiêu dãy số ô thô kệch (Ô 6, 8, 26, 27) khỏi nhãn phạm vi thanh thông số capsule của MC_ALCOHOL_CHECK', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: MarketCardId.MC_ALCOHOL_CHECK,
          description: 'Chiến dịch kiểm tra nồng độ cồn',
        })
      );
      expect(html).not.toContain('(Ô 6, 8, 26, 27)');
      expect(html).toContain('BĐS Dịch vụ');
    });

    it('[TC-IMP134.25/MSS][UC-IMP134][Facet-3/Disposal] Không render chuỗi Thu Nhập: hay Khoản Chi: khi effectDelta === undefined', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: MarketCardId.MC_URBAN_PLANNING,
          description: 'Quy hoạch trục đô thị mới.',
        })
      );
      expect(html).not.toContain('Thu Nhập:');
      expect(html).not.toContain('Khoản Chi:');
    });

    it('[TC-IMP134.26/MSS][UC-IMP134][Facet-3/Disposal] Bấm nút CTA xác nhận gọi onConfirm khi được cung cấp', () => {
      const onConfirm = vi.fn();
      const vdom = EventCardModal({
        cardType: 'market',
        cardId: MarketCardId.MC_URBAN_PLANNING,
        description: 'Quy hoạch trục đô thị mới.',
        onConfirm,
      });
      const ctaBtn = findElementByProp(vdom, (p: any) => p['data-testid'] === 'event-card-confirm-btn' || p.children === 'Nắm Bắt Thời Cơ 🏙️' || p.children === 'Đã Hiểu / Tiếp Tục');
      expect(ctaBtn).not.toBeNull();
      ctaBtn.props.onClick();
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('[TC-IMP134.27/MSS][UC-IMP134][Facet-3/Disposal] Bấm nút CTA xác nhận fallback gọi onClose khi onConfirm không được cung cấp', () => {
      const onClose = vi.fn();
      const vdom = EventCardModal({
        cardType: 'market',
        cardId: MarketCardId.MC_URBAN_PLANNING,
        description: 'Quy hoạch trục đô thị mới.',
        onClose,
      });
      const ctaBtn = findElementByProp(vdom, (p: any) => p['data-testid'] === 'event-card-confirm-btn' || p.children === 'Nắm Bắt Thời Cơ 🏙️' || p.children === 'Đã Hiểu / Tiếp Tục');
      expect(ctaBtn).not.toBeNull();
      ctaBtn.props.onClick();
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('[TC-IMP134.28/MSS][UC-IMP134][Facet-3/Disposal] Bấm nút Đóng (✕) gọi onClose giải phóng modal khỏi giao diện', () => {
      const onClose = vi.fn();
      const vdom = EventCardModal({
        cardType: 'market',
        cardId: MarketCardId.MC_URBAN_PLANNING,
        description: 'Quy hoạch trục đô thị mới.',
        onClose,
      });
      const closeBtn = findElementByProp(vdom, (p: any) => p['aria-label'] === 'Đóng thẻ sự kiện');
      expect(closeBtn).not.toBeNull();
      closeBtn.props.onClick();
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
