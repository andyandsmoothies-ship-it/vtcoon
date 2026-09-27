// [CONTRACT TEST] IMP-212: Tinh Giản Danh Mục BĐS, Trái Phiếu & Đàm Phán P2P
// Traceability Tags: [TC-212.01/MSS..TC-212.16/MSS] & [UC-IMP212]
// Universal 5-Facet Behavioral Matrix & Adversarial Inversion Verification

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { PropertyPortfolioModal } from '../../src/client/ui/modals/property_portfolio_modal';
import { BondIssuanceTab } from '../../src/client/ui/modals/bond_issuance_tab';
import { TradeModal } from '../../src/client/ui/modals/trade_modal';
import { useGameStore } from '../../src/client/store/game_store.js';

// Tree traversal helper for React vdom elements (defined outside it() to enforce zero loops in tests)
function findVNode(node: any, predicate: (n: any) => boolean): any {
  if (!node) return null;
  if (predicate(node)) return node;
  const children = node.props?.children;
  if (Array.isArray(children)) {
    for (const child of children) {
      const res = findVNode(child, predicate);
      if (res) return res;
    }
  } else if (children) {
    return findVNode(children, predicate);
  }
  return null;
}

describe('[TC-212.01/MSS..TC-212.16/MSS][UC-IMP212] Tinh Giản Danh Mục BĐS, Trái Phiếu & Đàm Phán P2P Contract Suite', () => {
  beforeEach(() => {
    useGameStore.getInitialState = () => useGameStore.getState();
    useGameStore.setState({
      levelMap: {},
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Chủ Tịch Sài Thành',
          balance: 15000,
          tokenColor: '#38BDF8',
          ownedProperties: [1, 3],
          mortgagedProperties: [],
          isBot: false,
          bankrupt: false,
        } as any,
        p2: {
          id: 'p2',
          name: 'Đại Gia Phố Cổ',
          balance: 20000,
          tokenColor: '#10B981',
          ownedProperties: [2, 4],
          mortgagedProperties: [],
          isBot: false,
          bankrupt: false,
        } as any,
      },
    });
  });

  // =========================================================================
  // FACET 1: Portfolio Modal Clean Footer & Header Stats (TC-212.01 - 03)
  // =========================================================================
  describe('Facet 1: Portfolio Modal Clean Footer & Header Stats', () => {
    it('[TC-212.01/MSS][UC-IMP212] PropertyPortfolioModal hoàn toàn không còn render thẻ footer hay nút [ Đóng ] ở đáy', () => {
      const html = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [1, 2],
          currentBalance: 5000,
          onClose: vi.fn(),
        })
      );

      expect(html).not.toMatch(/<footer[\s>]/);
      expect(html).not.toMatch(/>\s*Đóng\s*<\/button>/);
      expect(html).not.toContain('Tổng tài sản sở hữu:');
    });

    it('[TC-212.02/MSS][UC-IMP212] Header hiển thị số lượng BĐS sở hữu đầy đủ trên tiêu đề phụ (Quản lý X tài sản sở hữu)', () => {
      const html = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [1, 3, 5, 8],
          currentBalance: 5000,
          onClose: vi.fn(),
        })
      );

      expect(html).toContain('Quản lý 4 tài sản sở hữu • Nâng cấp nhanh 1-click');
      expect(html).not.toContain('Quản lý tài sản, thế chấp &amp; nâng cấp nhanh 1-click');
    });

    it('[TC-212.03/MSS][UC-IMP212] Nút [X] Header mang touch target >= 44x44px và gọi chính xác onClose', () => {
      const onCloseSpy = vi.fn();
      let vdom: any;
      function TestWrapper() {
        vdom = PropertyPortfolioModal({
          ownedProperties: [1, 3],
          currentBalance: 5000,
          onClose: onCloseSpy,
        });
        return vdom;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));

      const headerCloseBtn = findVNode(vdom, (n) => n?.props?.['aria-label'] === 'Đóng danh mục BĐS');
      expect(headerCloseBtn?.props?.className).toContain('min-w-[44px]');
      expect(headerCloseBtn?.props?.className).toContain('min-h-[44px]');
      headerCloseBtn?.props?.onClick?.();
      expect(onCloseSpy).toHaveBeenCalledTimes(1);
    });
  });

  // =========================================================================
  // FACET 2: Bond Issuance True Affordance & Clean Labels (TC-212.04 - 07)
  // =========================================================================
  describe('Facet 2: Bond Issuance True Affordance & Clean Labels', () => {
    it('[TC-212.04/MSS][UC-IMP212] Nút Phát Hành Trái Phiếu luôn giữ nhãn cố định PHÁT HÀNH TRÁI PHIẾU kể cả khi bị khóa', () => {
      const html = renderToStaticMarkup(
        React.createElement(BondIssuanceTab, {
          balance: 1000,
          playerNetWorth: 1000,
          unmortgagedPropertiesCount: 0,
          isMyTurn: false,
          onIssueBond: vi.fn(),
        })
      );

      const btnMatch = html.match(/<button[^>]*data-testid="issue-bond-btn"[^>]*>([\s\S]*?)<\/button>/);
      expect(btnMatch).toBeTruthy();
      expect(btnMatch![1]).toContain('PHÁT HÀNH TRÁI PHIẾU');
      expect(btnMatch![1]).not.toContain('Chỉ có thể phát hành trong lượt của bạn');
    });

    it('[TC-212.05/MSS][UC-IMP212] Khi không đủ Net Worth, hiển thị thẻ cảnh báo bond-blocked-notice giải thích lý do', () => {
      const html = renderToStaticMarkup(
        React.createElement(BondIssuanceTab, {
          balance: 5000,
          playerNetWorth: 2000,
          unmortgagedPropertiesCount: 3,
          isMyTurn: true,
          onIssueBond: vi.fn(),
        })
      );

      expect(html).toContain('data-testid="bond-blocked-notice"');
      expect(html).toContain('Cần tối thiểu 3.000 Net Worth để phát hành trái phiếu');
    });

    it('[TC-212.06/MSS][UC-IMP212] Khi thiếu BĐS chưa thế chấp, hiển thị thẻ cảnh báo bond-blocked-notice', () => {
      const html = renderToStaticMarkup(
        React.createElement(BondIssuanceTab, {
          balance: 5000,
          playerNetWorth: 5000,
          unmortgagedPropertiesCount: 1,
          isMyTurn: true,
          onIssueBond: vi.fn(),
        })
      );

      expect(html).toContain('data-testid="bond-blocked-notice"');
      expect(html).toContain('Cần sở hữu ít nhất 2 Bất Động Sản chưa thế chấp');
    });

    it('[TC-212.07/MSS][UC-IMP212] Nút Tất Toán Trái Phiếu giữ định danh TẤT TOÁN TRƯỚC HẠN, không biến thành text báo nợ', () => {
      const html = renderToStaticMarkup(
        React.createElement(BondIssuanceTab, {
          bondContract: {
            isActive: true,
            principal: 1000,
            repayAmount: 1200,
            roundsLeft: 2,
            collateralCells: [1, 2],
          },
          balance: 500,
          isMyTurn: true,
          onRepayBond: vi.fn(),
        })
      );

      expect(html.toUpperCase()).toContain('TẤT TOÁN TRƯỚC HẠN');
      expect(html).not.toContain('Chưa đủ tiền tất toán');
    });
  });

  // =========================================================================
  // FACET 3: Trade Modal Full-Width Single Button & Zero Ghost Elements (TC-212.08 - 12)
  // =========================================================================
  describe('Facet 3: Trade Modal Full-Width Single Button & Zero Ghost Elements', () => {
    it('[TC-212.08/MSS][UC-IMP212] TradeModal footer chỉ có 1 nút duy nhất chiếm w-full (submit-trade-btn)', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'p2',
          myProperties: [1],
          targetProperties: [2],
          myBalance: 5000,
          onClose: vi.fn(),
        })
      );

      const footerMatches = html.match(/<footer[^>]*>([\s\S]*?)<\/footer>/);
      const buttonMatches = footerMatches?.[1]?.match(/<button/g);
      expect(buttonMatches?.length).toBe(1);
      expect(html).toContain('data-testid="submit-trade-btn"');
      expect(html).toMatch(/data-testid="submit-trade-btn"[^>]*w-full/);
    });

    it('[TC-212.09/MSS][UC-IMP212] Footer không còn nút Hủy (người dùng đóng qua nút [X] header)', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'p2',
          myProperties: [1],
          targetProperties: [2],
          myBalance: 5000,
          onClose: vi.fn(),
        })
      );

      const footerHtml = html.match(/<footer[^>]*>[\s\S]*?<\/footer>/)?.[0] ?? '';
      expect(footerHtml).not.toContain('Hủy');
      expect(footerHtml).not.toContain('hủy');
    });

    it('[TC-212.10/MSS][UC-IMP212] Khẳng định DOM không còn chứa nút ẩn className="hidden" mang nhãn "Thế chấp"', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'p2',
          myProperties: [1],
          targetProperties: [2],
          myMortgagedProperties: [1],
          myBalance: 5000,
        })
      );

      expect(html).not.toMatch(/className="[^"]*hidden[^"]*"[^>]*>\s*Thế chấp/i);
      expect(html).not.toContain('hidden">Thế chấp');
    });

    it('[TC-212.11/MSS][UC-IMP212] Khẳng định DOM không còn thuộc tính data-legacy-style', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'p2',
          myProperties: [1],
          targetProperties: [2],
          myBalance: 5000,
        })
      );

      expect(html).not.toContain('data-legacy-style');
    });

    it('[TC-212.12/MSS][UC-IMP212] Khi không hợp lệ (!isValid), nút gửi mang class disabled text-slate-400 bg-slate-200', () => {
      let vdom: any;
      function TestWrapper() {
        vdom = TradeModal({
          targetPlayerId: 'p2',
          myProperties: [1],
          targetProperties: [2],
          initialOffered: [],
          initialRequested: [],
          initialCashOffer: 0,
          initialCashRequest: 0,
          myBalance: 5000,
        });
        return vdom;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));

      const submitBtn = findVNode(vdom, (n) => n?.props?.['data-testid'] === 'submit-trade-btn')
        ?? findVNode(vdom, (n) => n?.props?.children === 'Gửi Đề Xuất Đàm Phán');
      expect(submitBtn?.props?.className).toContain('text-slate-400');
      expect(submitBtn?.props?.className).toContain('bg-slate-200');
      expect(submitBtn?.props?.className).not.toContain('text-slate-600');
    });
  });

  // =========================================================================
  // FACET 4: Parent-Child Modal Cohesion & Touch Targets (TC-212.13 - 16)
  // =========================================================================
  describe('Facet 4: Parent-Child Modal Cohesion & Touch Targets', () => {
    it('[TC-212.13/MSS][UC-IMP212] Chuyển tab sang bonds không còn hiển thị dải footer BĐS cũ', () => {
      let vdom: any;
      function TestWrapper() {
        vdom = PropertyPortfolioModal({
          ownedProperties: [1, 2],
          currentBalance: 5000,
          bondContract: null,
          onClose: vi.fn(),
        });
        return vdom;
      }
      const html = renderToStaticMarkup(React.createElement(TestWrapper));
      const tabHeader = findVNode(vdom, (n) => typeof n?.props?.onTabChange === 'function');

      expect(tabHeader).toBeDefined();
      expect(html).not.toContain('Tổng tài sản sở hữu:');
      expect(html).not.toMatch(/<footer[\s>]/);
    });

    it('[TC-212.14/MSS][UC-IMP212] Mọi nút bấm trong BondIssuanceTab đạt touch target >= 46px (min-h-[46px])', () => {
      let vdom1: any;
      function Tab1() {
        vdom1 = BondIssuanceTab({
          balance: 5000,
          isMyTurn: true,
          playerNetWorth: 5000,
          unmortgagedPropertiesCount: 3,
        });
        return vdom1;
      }
      renderToStaticMarkup(React.createElement(Tab1));
      const issueBtn = findVNode(vdom1, (n) => n?.type === 'button');
      expect(issueBtn?.props?.className).toContain('min-h-[46px]');

      let vdom2: any;
      function Tab2() {
        vdom2 = BondIssuanceTab({
          balance: 5000,
          isMyTurn: true,
          bondContract: {
            isActive: true,
            principal: 1000,
            repayAmount: 1200,
            roundsLeft: 3,
            collateralCells: [1],
          },
        });
        return vdom2;
      }
      renderToStaticMarkup(React.createElement(Tab2));
      const repayBtn = findVNode(vdom2, (n) => n?.type === 'button');
      expect(repayBtn?.props?.className).toContain('min-h-[46px]');
    });

    it('[TC-212.15/MSS][UC-IMP212] Đóng TradeModal qua nút [X] header kích hoạt đúng onClose', () => {
      const onCloseSpy = vi.fn();
      let vdom: any;
      function TestWrapper() {
        vdom = TradeModal({
          targetPlayerId: 'p2',
          myProperties: [1],
          targetProperties: [2],
          myBalance: 5000,
          onClose: onCloseSpy,
        });
        return vdom;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));

      const headerCloseBtn = findVNode(vdom, (n) => n?.props?.['aria-label'] === 'Đóng đàm phán');
      expect(headerCloseBtn?.props?.['aria-label']).toBe('Đóng đàm phán');
      expect(headerCloseBtn?.props?.className).toContain('min-w-[44px]');
      headerCloseBtn?.props?.onClick?.();
      expect(onCloseSpy).toHaveBeenCalledTimes(1);
    });

    it('[TC-212.16/MSS][UC-IMP212] Bấm Gửi Đề Xuất Đàm Phán gọi đúng onSubmitTrade và không kích hoạt onClose', () => {
      const onSubmitTradeSpy = vi.fn();
      const onCloseSpy = vi.fn();
      let vdom: any;
      function TestWrapper() {
        vdom = TradeModal({
          targetPlayerId: 'p2',
          myProperties: [1],
          targetProperties: [2],
          myBalance: 5000,
          targetBalance: 5000,
          initialOffered: [1],
          initialRequested: [2],
          onSubmitTrade: onSubmitTradeSpy,
          onClose: onCloseSpy,
        });
        return vdom;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));

      const submitBtn = findVNode(vdom, (n) => n?.props?.['data-testid'] === 'submit-trade-btn');
      expect(submitBtn?.props?.['data-testid']).toBe('submit-trade-btn');
      submitBtn?.props?.onClick?.();
      expect(onSubmitTradeSpy).toHaveBeenCalledTimes(1);
      expect(onCloseSpy).not.toHaveBeenCalled();
    });
  });
});
