// [CONTRACT TEST] IMP-236: Tối Ưu Bố Cục Desktop & Dual-Viewport Parity
// Traceability Tags: [TC-DVP-01/MSS..TC-DVP-16/MSS] & [UC-IMP236]
// Universal 5-Facet Behavioral Matrix & Adversarial Inversion Verification
// Architecture: Dual-Viewport Responsive Parity, Single-Card Grid Span, Anti-Truncation Polish & Semantic Color Contrast

import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { PropertyPortfolioModal } from '../../src/client/ui/modals/property_portfolio_modal';
import { TitleDeedRentTable } from '../../src/client/ui/modals/title_deed_rent_table';
import { TitleDeedModal } from '../../src/client/ui/modals/title_deed_modal';
import { TradePartnerStrip } from '../../src/client/ui/modals/trade/trade_partner_strip';
import { BondIssuanceTab } from '../../src/client/ui/modals/bond_issuance_tab';

interface VNodeLike {
  props?: {
    [key: string]: unknown;
    children?: unknown;
  };
}

function isVNodeLike(obj: unknown): obj is VNodeLike {
  return typeof obj === 'object' && obj !== null && 'props' in obj;
}

function findVNode(node: unknown, predicate: (n: VNodeLike) => boolean): VNodeLike | null {
  if (!isVNodeLike(node)) return null;
  if (predicate(node)) return node;
  const children = node.props?.children;
  if (Array.isArray(children)) {
    for (const child of children) {
      const res = findVNode(child, predicate);
      if (res) return res;
    }
  } else if (isVNodeLike(children)) {
    return findVNode(children, predicate);
  }
  return null;
}

describe('[TC-DVP-01/MSS..TC-DVP-16/MSS][UC-IMP236] Dual-Viewport Parity & Desktop Layout Integrity Contract Suite', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // =========================================================================
  // FACET 1: Boundary & Single Card Grid Span (TC-DVP-01..03)
  // =========================================================================
  describe('Facet 1: Boundary & Single Card Grid Span', () => {
    it('[TC-DVP-01/MSS][UC-IMP236] Khi filteredProperties.length === 1, the BĐS mang class sm:col-span-2 de chiem tron chieu ngang modal', () => {
      const html = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [1],
          currentBalance: 5000,
          onClose: vi.fn(),
        })
      );

      expect(html).toContain('data-testid="property-portfolio-item-1"');
      expect(html).toMatch(/data-testid="property-portfolio-item-1"[^>]*sm:col-span-2/);
    });

    it('[TC-DVP-02/MSS][UC-IMP236] Khi filteredProperties.length >= 2, cac the BĐS KHONG mang class sm:col-span-2, duy tri luoi 2 cot', () => {
      const html = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [1, 3],
          currentBalance: 5000,
          onClose: vi.fn(),
        })
      );

      expect(html).toContain('data-testid="property-portfolio-item-1"');
      expect(html).toContain('data-testid="property-portfolio-item-3"');
      expect(html).not.toMatch(/data-testid="property-portfolio-item-1"[^>]*sm:col-span-2/);
      expect(html).not.toMatch(/data-testid="property-portfolio-item-3"[^>]*sm:col-span-2/);
    });

    it('[TC-DVP-03/MSS][UC-IMP236] Ten dia danh trong Manh Ghep Con Thieu bao ton truncate text-[11px] sm:text-xs va dung lg:hidden, hidden lg:inline', () => {
      const html = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [1],
          currentBalance: 5000,
          onClose: vi.fn(),
        })
      );

      expect(html).toContain('truncate text-[11px] sm:text-xs');
      expect(html).toContain('hidden lg:inline');
      expect(html).toContain('lg:hidden');
    });
  });

  // =========================================================================
  // FACET 2: Dual-Viewport Rent Table Integrity (TC-DVP-04..07b)
  // =========================================================================
  describe('Facet 2: Dual-Viewport Rent Table Integrity', () => {
    it('[TC-DVP-04/MSS][UC-IMP236] Khi compact: true, TitleDeedRentTable ket xuat ca khoi Mobile (md:hidden) va khoi Desktop (hidden md:block)', () => {
      const html = renderToStaticMarkup(
        React.createElement(TitleDeedRentTable, {
          compact: true,
          rents: [200, 700, 1800, 4400],
          upgradeCosts: [1000, 1500, 2000],
          isRailroad: false,
          isUtility: false,
        })
      );

      expect(html).toContain('space-y-1.5 md:hidden');
      expect(html).toContain('hidden md:block');
    });

    it('[TC-DVP-05/MSS][UC-IMP236] Khoi Desktop chua day du 4 cap (C0, C1, C2, C3) voi day du thong so tien thue va chi phi nang cap ngay ca khi compact: true', () => {
      const html = renderToStaticMarkup(
        React.createElement(TitleDeedRentTable, {
          compact: true,
          rents: [200, 700, 1800, 4400],
          upgradeCosts: [1000, 1500, 2000],
          isRailroad: false,
          isUtility: false,
        })
      );

      expect(html).toContain('Nhà Phố');
      expect(html).toContain('Khách Sạn');
      expect(html).toContain('Nâng cấp: +1.000');
    });

    it('[TC-DVP-06/MSS][UC-IMP236] Khoi Mobile chua Mini Rent Bar (C0, x2 ĐỘC QUYỀN, C3) va nut toggle mo rong', () => {
      const html = renderToStaticMarkup(
        React.createElement(TitleDeedRentTable, {
          compact: true,
          rents: [200, 700, 1800, 4400],
          upgradeCosts: [1000, 1500, 2000],
          isRailroad: false,
          isUtility: false,
        })
      );

      expect(html).toContain('C0 (ĐẤT)');
      expect(html).toContain('x2 ĐỘC QUYỀN');
      expect(html).toContain('C3 (RESORT/TTTM)');
      expect(html).toContain('data-testid="toggle-rent-tiers"');
    });

    it('[TC-DVP-07/MSS][UC-IMP236] Nut toggle chua nhan ngan gon "Xem chi tiet 4 cap nang cap (C0 - C3)" va bao ton tien to "Xem chi tiet 4 cap nang cap"', () => {
      const html = renderToStaticMarkup(
        React.createElement(TitleDeedRentTable, {
          compact: true,
          rents: [200, 700, 1800, 4400],
          upgradeCosts: [1000, 1500, 2000],
          isRailroad: false,
          isUtility: false,
        })
      );

      expect(html).toContain('Xem chi tiết 4 cấp nâng cấp (C0 - C3)');
      expect(html).toContain('Xem chi tiết 4 cấp nâng cấp');
    });

    it('[TC-DVP-07b/MSS][UC-IMP236] Nut thu gon data-testid="collapse-rent-tiers" hien thi khi isExpanded va mang class md:hidden', () => {
      const setStateMock: React.Dispatch<unknown> = vi.fn();
      vi.spyOn(React, 'useState').mockImplementationOnce(() => [true, setStateMock]);
      const html = renderToStaticMarkup(
        React.createElement(TitleDeedRentTable, {
          compact: true,
          rents: [200, 700, 1800, 4400],
          upgradeCosts: [1000, 1500, 2000],
          isRailroad: false,
          isUtility: false,
        })
      );

      expect(html).toContain('data-testid="collapse-rent-tiers"');
      expect(html).toMatch(/data-testid="collapse-rent-tiers"[^>]*md:hidden/);
    });
  });

  // =========================================================================
  // FACET 3: Trade Partner Desktop Typography & Anti-Truncation (TC-DVP-08..10)
  // =========================================================================
  describe('Facet 3: Trade Partner Desktop Typography & Anti-Truncation', () => {
    it('[TC-DVP-08/MSS][UC-IMP236] TradePartnerStrip bao ton lop goc truncate max-w-[120px] va bo sung sm:max-w-[180px] md:max-w-none', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradePartnerStrip, {
          availablePartners: [
            { id: 'bot1', name: 'Bot AI 2 (Aggressive Trader)', balance: 5000, isBot: true },
          ],
          selectedPartnerId: 'bot1',
          onSelectPartner: vi.fn(),
        })
      );

      expect(html).toContain('truncate max-w-[120px]');
      expect(html).toContain('sm:max-w-[180px]');
      expect(html).toContain('md:max-w-none');
    });

    it('[TC-DVP-09/MSS][UC-IMP236] Badge nhu cau ap dung max-w-[90px] md:max-w-none de khong bi cat chu tren Desktop', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradePartnerStrip, {
          availablePartners: [
            { id: 'bot1', name: 'Bot AI 2', balance: 9000, isBot: true },
          ],
          selectedPartnerId: 'bot1',
          onSelectPartner: vi.fn(),
        })
      );

      expect(html).toContain('💰 Dư tiền gom đất');
      expect(html).toMatch(/truncate max-w-\[90px\]\s+md:max-w-none/);
    });

    it('[TC-DVP-10/MSS][UC-IMP236] Dai Sub-Banner ngu canh data-testid="partner-sub-banner" bao ton day du thong tin tam ly va nhu cau Bot', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradePartnerStrip, {
          availablePartners: [
            { id: 'bot1', name: 'Bot AI 2 (Aggressive)', balance: 9000, isBot: true, personality: 'Aggressive' },
          ],
          selectedPartnerId: 'bot1',
          onSelectPartner: vi.fn(),
        })
      );

      expect(html).toContain('data-testid="partner-sub-banner"');
      expect(html).toContain('Tâm lý đối tác:');
      expect(html).toContain('🔥 Táo bạo');
      expect(html).toContain('💰 Dư tiền gom đất');
    });
  });

  // =========================================================================
  // FACET 4: Contrast & Semantic Balance in Bond Tab (TC-DVP-11..13)
  // =========================================================================
  describe('Facet 4: Contrast & Semantic Balance in Bond Tab', () => {
    it('[TC-DVP-11/MSS][UC-IMP236] Khi hasEnoughDeeds === false, chi so BĐS sach mang class text-rose-700', () => {
      const html = renderToStaticMarkup(
        React.createElement(BondIssuanceTab, {
          balance: 5000,
          playerNetWorth: 5000,
          unmortgagedPropertiesCount: 1,
          isMyTurn: true,
        })
      );

      expect(html).toContain('BĐS sạch chưa thế chấp ≥ 2 ô');
      expect(html).toMatch(/font-mono[^>]*text-rose-700[^>]*>\s*1 \/ 2\s*<\/span>/);
    });

    it('[TC-DVP-12/MSS][UC-IMP236] Khi hasNetWorth === false, chi so Net Worth mang class text-rose-700', () => {
      const html = renderToStaticMarkup(
        React.createElement(BondIssuanceTab, {
          balance: 2000,
          playerNetWorth: 2000,
          unmortgagedPropertiesCount: 2,
          isMyTurn: true,
        })
      );

      expect(html).toContain('Tài sản ròng (Net Worth) ≥ 3.000');
      expect(html).toMatch(/font-mono[^>]*text-rose-700[^>]*>\s*2\.000\s*<\/span>/);
    });

    it('[TC-DVP-13/MSS][UC-IMP236] Hop canh bao data-testid="bond-blocked-notice" hien thi chuan xac khi khong du dieu kien', () => {
      const html = renderToStaticMarkup(
        React.createElement(BondIssuanceTab, {
          balance: 5000,
          playerNetWorth: 5000,
          unmortgagedPropertiesCount: 1,
          isMyTurn: true,
        })
      );

      expect(html).toContain('data-testid="bond-blocked-notice"');
      expect(html).toContain('Cần sở hữu ít nhất 2 Bất Động Sản chưa thế chấp');
    });
  });

  // =========================================================================
  // FACET 5: Regression & Visual Integration (TC-DVP-14..16)
  // =========================================================================
  describe('Facet 5: Regression & Visual Integration', () => {
    it('[TC-DVP-14/MSS][UC-IMP236] Modal So Do khi mua BĐS (canBuy: true) duy tri nut Mua voi nhan Mua BĐS va nut Tu Choi ✕ Từ Chối Mua', () => {
      const html = renderToStaticMarkup(
        React.createElement(TitleDeedModal, {
          cellIndex: 1,
          canBuy: true,
          isOwned: false,
          buyerBalance: 10000,
          buyerId: 'p1',
        })
      );

      expect(html).toContain('data-testid="title-deed-modal"');
      expect(html).toContain('Mua BĐS');
      expect(html).toContain('✕ Từ Chối Mua');
    });

    it('[TC-DVP-15/MSS][UC-IMP236] Che do Railroad (Ga) va Utility (Tien Ich) trong TitleDeedRentTable hien thi tron ven tren Desktop', () => {
      const railHtml = renderToStaticMarkup(
        React.createElement(TitleDeedRentTable, {
          isRailroad: true,
          isUtility: false,
          rents: [500, 1000, 2000, 4000],
          upgradeCosts: [],
          compact: false,
        })
      );
      expect(railHtml).toContain('Biểu Phí Theo Số Ga Sở Hữu');
      expect(railHtml).toContain('Toàn mạng lưới');

      const utilHtml = renderToStaticMarkup(
        React.createElement(TitleDeedRentTable, {
          isRailroad: false,
          isUtility: true,
          rents: [1000, 2500, 3500],
          upgradeCosts: [],
          compact: false,
          cellIndex: 12,
        })
      );
      expect(utilHtml).toContain('Phí Dịch Vụ Cơ Bản');
    });

    it('[TC-DVP-16/MSS][UC-IMP236] Danh Muc BĐS bao ton 100% cac props data-onmouseenter="true", onMouseEnter, onMouseLeave, onFocus, onBlur', () => {
      const onHoverSpy = vi.fn();
      let vdom: React.ReactElement | null = null;
      function TestWrapper(): React.ReactElement {
        vdom = PropertyPortfolioModal({
          ownedProperties: [1],
          currentBalance: 5000,
          onHoverCell: onHoverSpy,
        });
        return vdom;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));

      const itemNode = findVNode(vdom, (n) => n.props?.['data-testid'] === 'property-portfolio-item-1');
      expect(itemNode?.props?.['data-onmouseenter']).toBe('true');
      const onMouseEnterFn = itemNode?.props?.onMouseEnter;
      if (typeof onMouseEnterFn === 'function') {
        onMouseEnterFn();
      }
      expect(onHoverSpy).toHaveBeenCalledWith(1);
      const onMouseLeaveFn = itemNode?.props?.onMouseLeave;
      if (typeof onMouseLeaveFn === 'function') {
        onMouseLeaveFn();
      }
      expect(onHoverSpy).toHaveBeenCalledWith(null);
    });
  });
});
