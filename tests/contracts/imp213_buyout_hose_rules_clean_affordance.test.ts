// [CONTRACT TEST] IMP-213: Chuẩn Hóa Thu Hồi Cưỡng Chế 130%, Sàn HOSE & Thể Lệ (Gói 3)
// Traceability Tags: [TC-213.01/MSS..TC-213.16/MSS] & [UC-IMP213]
// Universal 5-Facet Behavioral Matrix & Adversarial Inversion Verification

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { CompulsoryBuyoutModal } from '../../src/client/ui/modals/compulsory_buyout_modal';
import { HoseModal } from '../../src/client/ui/modals/hose_modal';
import { GameRulesModal } from '../../src/client/ui/modals/game_rules_modal';
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

describe('[TC-213.01/MSS..TC-213.16/MSS][UC-IMP213] Chuẩn Hóa Thu Hồi Cưỡng Chế 130%, Sàn HOSE & Thể Lệ Suite', () => {
  beforeEach(() => {
    useGameStore.setState({
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Chủ Tịch Sài Thành',
          balance: 15000,
          tokenColor: '#38BDF8',
          ownedProperties: [1],
          mortgagedProperties: [],
          isBot: false,
          bankrupt: false,
        } as any,
        p2: {
          id: 'p2',
          name: 'Đại Gia Phố Cổ',
          balance: 20000,
          tokenColor: '#10B981',
          ownedProperties: [2],
          mortgagedProperties: [],
          isBot: false,
          bankrupt: false,
        } as any,
      },
    });
  });

  // =========================================================================
  // FACET 1: Compulsory Buyout Commercial Precision & True Affordance (TC-213.01 - 04)
  // =========================================================================
  describe('Facet 1: Compulsory Buyout Commercial Precision & True Affordance', () => {
    it('[TC-213.01/MSS][UC-IMP213] Nút từ chối mang nhãn chính thức "✕ Từ Chối Mua" và không còn chứa "✕ Bỏ Qua"', () => {
      const html = renderToStaticMarkup(
        React.createElement(CompulsoryBuyoutModal, {
          buyerId: 'p1',
          sellerId: 'p2',
          cellIndex: 1,
          cost: 1300,
          basePrice: 1000,
          expiresAt: Date.now() + 15000,
          onBuyout: vi.fn(),
          onDecline: vi.fn(),
        })
      );

      expect(html).toContain('✕ Từ Chối Mua');
      expect(html).not.toContain('✕ Bỏ Qua');
    });

    it('[TC-213.02/MSS][UC-IMP213] Bấm "✕ Từ Chối Mua" kích hoạt chính xác onDecline', () => {
      const onDeclineSpy = vi.fn();
      let vdom: any;
      function TestWrapper() {
        vdom = CompulsoryBuyoutModal({
          buyerId: 'p1',
          sellerId: 'p2',
          cellIndex: 1,
          cost: 1300,
          basePrice: 1000,
          expiresAt: Date.now() + 15000,
          onBuyout: vi.fn(),
          onDecline: onDeclineSpy,
        });
        return vdom;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));

      const declineBtn = findVNode(vdom, (n) => n?.props?.['data-testid'] === 'buyout-decline-btn');
      declineBtn?.props?.onClick?.();
      expect(onDeclineSpy).toHaveBeenCalledTimes(1);
    });

    it('[TC-213.03/MSS][UC-IMP213] Khi thiếu tiền mặt, nút Mua Lại mang nhãn định danh ở trạng thái disabled mờ (cursor-not-allowed, bg-slate-200)', () => {
      useGameStore.setState({
        playersInfo: {
          p1: {
            id: 'p1',
            name: 'Chủ Tịch Sài Thành',
            balance: 500,
          } as any,
          p2: {
            id: 'p2',
            name: 'Đại Gia Phố Cổ',
            balance: 20000,
          } as any,
        },
      });

      let vdom: any;
      function TestWrapper() {
        vdom = CompulsoryBuyoutModal({
          buyerId: 'p1',
          sellerId: 'p2',
          cellIndex: 1,
          cost: 1300,
          basePrice: 1000,
          expiresAt: Date.now() + 15000,
          onBuyout: vi.fn(),
          onDecline: vi.fn(),
        });
        return vdom;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));

      const confirmBtn = findVNode(vdom, (n) => n?.props?.['data-testid'] === 'buyout-confirm-btn');
      expect(confirmBtn?.props?.disabled).toBe(true);
      expect(confirmBtn?.props?.className).toContain('cursor-not-allowed');
      expect(confirmBtn?.props?.className).toContain('bg-slate-200');
    });

    it('[TC-213.04/MSS][UC-IMP213] Khi thiếu tiền mặt, render thẻ cảnh báo buyout-shortfall-notice với số tiền thiếu chính xác', () => {
      useGameStore.setState({
        playersInfo: {
          p1: {
            id: 'p1',
            name: 'Chủ Tịch Sài Thành',
            balance: 500,
          } as any,
          p2: {
            id: 'p2',
            name: 'Đại Gia Phố Cổ',
            balance: 20000,
          } as any,
        },
      });

      const html = renderToStaticMarkup(
        React.createElement(CompulsoryBuyoutModal, {
          buyerId: 'p1',
          sellerId: 'p2',
          cellIndex: 1,
          cost: 1300,
          basePrice: 1000,
          expiresAt: Date.now() + 15000,
          onBuyout: vi.fn(),
          onDecline: vi.fn(),
        })
      );

      expect(html).toContain('data-testid="buyout-shortfall-notice"');
      expect(html).toContain('Số dư ví không đủ đền bù 130%');
      expect(html).toContain('Thiếu: 800');
    });
  });

  // =========================================================================
  // FACET 2: Hose Stock Market Affordance & Clean DOM (TC-213.05 - 08)
  // =========================================================================
  describe('Facet 2: Hose Stock Market Affordance & Clean DOM', () => {
    it('[TC-213.05/MSS][UC-IMP213] Nút bỏ qua trong HoseModal mang nhãn chuẩn "✕ Không Cược"', () => {
      const html = renderToStaticMarkup(
        React.createElement(HoseModal, {
          myBalance: 15000,
          onInvest: vi.fn(),
          onSkip: vi.fn(),
          onClose: vi.fn(),
        })
      );

      expect(html).toContain('✕ Không Cược');
      expect(html).not.toMatch(/>\s*Bỏ Qua\s*</);
    });

    it('[TC-213.06/MSS][UC-IMP213] Khẳng định DOM của HoseModal không còn thẻ ẩn data-legacy-rates', () => {
      const html = renderToStaticMarkup(
        React.createElement(HoseModal, {
          myBalance: 15000,
          onInvest: vi.fn(),
          onSkip: vi.fn(),
          onClose: vi.fn(),
        })
      );

      expect(html).not.toContain('data-legacy-rates');
    });

    it('[TC-213.07/MSS][UC-IMP213] Bấm "✕ Không Cược" kích hoạt chính xác onSkip', () => {
      const onSkipSpy = vi.fn();
      let vdom: any;
      function TestWrapper() {
        vdom = HoseModal({
          myBalance: 15000,
          onInvest: vi.fn(),
          onSkip: onSkipSpy,
          onClose: vi.fn(),
        });
        return vdom;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));

      const skipBtn = findVNode(vdom, (n) => n?.props?.['data-testid'] === 'hose-skip-btn')
        ?? findVNode(vdom, (n) => n?.props?.onClick === onSkipSpy);
      skipBtn?.props?.onClick?.();
      expect(onSkipSpy).toHaveBeenCalledTimes(1);
    });

    it('[TC-213.08/MSS][UC-IMP213] Nút Cược và Không Cược đạt chuẩn min-h-[46px], đổ bóng xúc giác gờ đáy', () => {
      let vdom: any;
      function TestWrapper() {
        vdom = HoseModal({
          myBalance: 15000,
          defaultStake: 500,
          onInvest: vi.fn(),
          onSkip: vi.fn(),
          onClose: vi.fn(),
        });
        return vdom;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));

      const skipBtn = findVNode(vdom, (n) => n?.props?.['data-testid'] === 'hose-skip-btn')
        ?? findVNode(vdom, (n) => n?.props?.children === '✕ Không Cược');
      const investBtn = findVNode(vdom, (n) => n?.props?.['data-testid'] === 'hose-invest-btn')
        ?? findVNode(vdom, (n) => typeof n?.props?.children === 'string' && n?.props?.children.includes('Cược'));

      expect(skipBtn?.props?.className).toContain('min-h-[46px]');
      expect(skipBtn?.props?.className).toContain('shadow-[0_4px_0_0_#fca5a5]');
      expect(investBtn?.props?.className).toContain('min-h-[46px]');
      expect(investBtn?.props?.className).toContain('shadow-[0_4px_0_0_#b45309]');
    });
  });

  // =========================================================================
  // FACET 3: Game Rules Maximum Viewport Space (TC-213.09 - 12)
  // =========================================================================
  describe('Facet 3: Game Rules Maximum Viewport Space', () => {
    it('[TC-213.09/MSS][UC-IMP213] Modal Thể Lệ không còn render thanh footer chứa nút "Đã Hiểu"', () => {
      const html = renderToStaticMarkup(
        React.createElement(GameRulesModal, {
          isOpen: true,
          onClose: vi.fn(),
        })
      );

      expect(html).not.toMatch(/<footer[\s>]/);
      expect(html).not.toContain('Đã Hiểu');
    });

    it('[TC-213.10/MSS][UC-IMP213] Nút [X] Header mang touch target >= 44x44px và gọi onClose', () => {
      const onCloseSpy = vi.fn();
      let vdom: any;
      function TestWrapper() {
        vdom = GameRulesModal({
          isOpen: true,
          onClose: onCloseSpy,
        });
        return vdom;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));

      const closeBtn = findVNode(vdom, (n) => n?.props?.['data-testid'] === 'close-rules-modal-btn');
      expect(closeBtn?.props?.className).toContain('min-w-[44px]');
      expect(closeBtn?.props?.className).toContain('min-h-[44px]');
      closeBtn?.props?.onClick?.();
      expect(onCloseSpy).toHaveBeenCalledTimes(1);
    });

    it('[TC-213.11/MSS][UC-IMP213] Nút Header [X] sở hữu tooltip giải thích rõ cách đóng modal', () => {
      let vdom: any;
      function TestWrapper() {
        vdom = GameRulesModal({
          isOpen: true,
          onClose: vi.fn(),
        });
        return vdom;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));

      const closeBtn = findVNode(vdom, (n) => n?.props?.['data-testid'] === 'close-rules-modal-btn');
      expect(closeBtn?.props?.title).toBe('Đóng hướng dẫn (Phím Esc hoặc click nền)');
    });

    it('[TC-213.12/MSS][UC-IMP213] Vùng nội dung đọc thể lệ giữ nguyên vùng cuộn độc lập overflow-y-auto và min-h-0', () => {
      let vdom: any;
      function TestWrapper() {
        vdom = GameRulesModal({
          isOpen: true,
          onClose: vi.fn(),
        });
        return vdom;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));

      const mainContent = findVNode(vdom, (n) => n?.type === 'main');
      expect(mainContent?.props?.className).toContain('overflow-y-auto');
      expect(mainContent?.props?.className).toContain('min-h-0');
      expect(mainContent?.props?.className).toContain('flex-1');
    });
  });

  // =========================================================================
  // FACET 4: Negative Assertions & Strict Callback Isolation (TC-213.13 - 16)
  // =========================================================================
  describe('Facet 4: Negative Assertions & Strict Callback Isolation', () => {
    it('[TC-213.13/MSS][UC-IMP213] Bấm "✕ Từ Chối Mua" trong Buyout không kích hoạt onBuyout', () => {
      const onBuyoutSpy = vi.fn();
      const onDeclineSpy = vi.fn();
      let vdom: any;
      function TestWrapper() {
        vdom = CompulsoryBuyoutModal({
          buyerId: 'p1',
          sellerId: 'p2',
          cellIndex: 1,
          cost: 1300,
          basePrice: 1000,
          expiresAt: Date.now() + 15000,
          onBuyout: onBuyoutSpy,
          onDecline: onDeclineSpy,
        });
        return vdom;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));

      const declineBtn = findVNode(vdom, (n) => n?.props?.['data-testid'] === 'buyout-decline-btn');
      declineBtn?.props?.onClick?.();
      expect(onBuyoutSpy).toHaveBeenCalledTimes(0);
      expect(onDeclineSpy).toHaveBeenCalledTimes(1);
    });

    it('[TC-213.14/MSS][UC-IMP213] Bấm nút Cược disabled trong Hose khi không đủ tiền không kích hoạt onInvest', () => {
      const onInvestSpy = vi.fn();
      let vdom: any;
      function TestWrapper() {
        vdom = HoseModal({
          myBalance: 0,
          defaultStake: 500,
          onInvest: onInvestSpy,
          onSkip: vi.fn(),
          onClose: vi.fn(),
        });
        return vdom;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));

      const investBtn = findVNode(vdom, (n) => n?.props?.['data-testid'] === 'hose-invest-btn')
        ?? findVNode(vdom, (n) => typeof n?.props?.children === 'string' && n?.props?.children.includes('Cược'));
      expect(investBtn?.props?.disabled).toBe(true);
      investBtn?.props?.onClick?.();
      expect(onInvestSpy).toHaveBeenCalledTimes(0);
    });

    it('[TC-213.15/MSS][UC-IMP213] Bấm "✕ Không Cược" trong Hose không kích hoạt onInvest', () => {
      const onInvestSpy = vi.fn();
      const onSkipSpy = vi.fn();
      let vdom: any;
      function TestWrapper() {
        vdom = HoseModal({
          myBalance: 15000,
          defaultStake: 500,
          onInvest: onInvestSpy,
          onSkip: onSkipSpy,
          onClose: vi.fn(),
        });
        return vdom;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));

      const skipBtn = findVNode(vdom, (n) => n?.props?.['data-testid'] === 'hose-skip-btn')
        ?? findVNode(vdom, (n) => n?.props?.onClick === onSkipSpy);
      skipBtn?.props?.onClick?.();
      expect(onInvestSpy).toHaveBeenCalledTimes(0);
      expect(onSkipSpy).toHaveBeenCalledTimes(1);
    });

    it('[TC-213.16/MSS][UC-IMP213] Mọi nút bấm trong cả 3 modal đều đạt touch target tối thiểu >= 44px', () => {
      let buyoutVdom: any;
      function BuyoutWrapper() {
        buyoutVdom = CompulsoryBuyoutModal({
          buyerId: 'p1',
          sellerId: 'p2',
          cellIndex: 1,
          cost: 1300,
          basePrice: 1000,
          expiresAt: Date.now() + 15000,
          onBuyout: vi.fn(),
          onDecline: vi.fn(),
        });
        return buyoutVdom;
      }
      renderToStaticMarkup(React.createElement(BuyoutWrapper));
      const buyoutDecline = findVNode(buyoutVdom, (n) => n?.props?.['data-testid'] === 'buyout-decline-btn');

      let hoseVdom: any;
      function HoseWrapper() {
        hoseVdom = HoseModal({
          myBalance: 15000,
          defaultStake: 500,
          onInvest: vi.fn(),
          onSkip: vi.fn(),
          onClose: vi.fn(),
        });
        return hoseVdom;
      }
      renderToStaticMarkup(React.createElement(HoseWrapper));
      const hoseSkip = findVNode(hoseVdom, (n) => n?.props?.['data-testid'] === 'hose-skip-btn')
        ?? findVNode(hoseVdom, (n) => typeof n?.props?.onClick === 'function' && n?.props?.children === 'Bỏ Qua');

      let rulesVdom: any;
      function RulesWrapper() {
        rulesVdom = GameRulesModal({
          isOpen: true,
          onClose: vi.fn(),
        });
        return rulesVdom;
      }
      renderToStaticMarkup(React.createElement(RulesWrapper));
      const rulesClose = findVNode(rulesVdom, (n) => n?.props?.['data-testid'] === 'close-rules-modal-btn');

      expect(buyoutDecline?.props?.className).toContain('min-h-[48px]');
      expect(hoseSkip?.props?.className).toMatch(/min-h-\[(4[4-9]|[5-9]\d)px\]/);
      expect(rulesClose?.props?.className).toContain('min-h-[44px]');
    });
  });
});
