// [TC-IMP123/MSS][UC-IMP123] Contract Tests: Nâng Cấp Pop-Up Hiển Thị Lý Do Ngắn Gọn & Giao Diện Thân Thiện
// Universal 4-Facet Behavioral Matrix Verification (Boundary, Reactivity, Segregation, Responsive UI)

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  useGameStore,
  FloatingTextType,
  type FloatingTextItem,
  type PlayerHudInfo,
  type FloatingActionType,
} from '../../src/client/store/game_store.js';
import {
  FloatingBadge,
  MilestoneBanner,
} from '../../src/client/ui/floating_numbers.js';
import * as floatingNumbersModule from '../../src/client/ui/floating_numbers.js';

// Khởi tạo hàm hợp đồng từ production module
const resolveFriendlyReason = (floatingNumbersModule as Record<string, unknown>).resolveFriendlyReason as
  | ((item: FloatingTextItem, player?: PlayerHudInfo) => string)
  | undefined;

describe('[IMP-123] Friendly Pop-Up Reason & Responsive Capsule Contract Suite', () => {
  beforeEach(() => {
    useGameStore.setState({
      floatingTexts: [],
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Đại Gia Sài Gòn',
          balance: 15000,
          tokenColor: '#38BDF8',
          ownedProperties: [],
          isBot: false,
        },
        p2: {
          id: 'p2',
          name: 'Hoàng Nam',
          balance: 12000,
          tokenColor: '#F43F5E',
          ownedProperties: [],
          isBot: true,
        },
        p3: {
          id: 'p3',
          name: 'Huy',
          balance: 8000,
          tokenColor: '#10B981',
          ownedProperties: [],
          isBot: false,
        },
      },
    });
  });

  // =========================================================================
  // FACET 1: Friendly Reason Resolution & Contract Interface
  // =========================================================================
  describe('FACET 1: Friendly Reason Resolution & Contract Interface', () => {
    it('[TC-IMP123.01/MSS][UC-IMP123] resolveFriendlyReason contract: hàm xử lý lý do phải được export từ floating_numbers', () => {
      expect(typeof resolveFriendlyReason).toBe('function');
    });

    it('[TC-IMP123.02/MSS][UC-IMP123] rent_pay: định dạng lý do trả tiền thuê rõ tên BĐS và người nhận', () => {
      const item: FloatingTextItem = {
        id: 'ft_rent_pay_1',
        text: '-500 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'p1',
        actionType: 'rent_pay',
        title: 'Bến Thành',
        targetPlayerName: 'Hoàng Nam',
        timestamp: Date.now(),
      };
      const reason = resolveFriendlyReason?.(item);
      expect(reason).toBeDefined();
      expect(reason).toMatch(/Trả thuê|Tiền thuê/);
      expect(reason).toContain('Bến Thành');
      expect(reason).toContain('Hoàng Nam');
    });

    it('[TC-IMP123.03/MSS][UC-IMP123] rent_receive: định dạng lý do thu tiền thuê rõ tên BĐS và người trả', () => {
      const item: FloatingTextItem = {
        id: 'ft_rent_recv_1',
        text: '+500 Tr.',
        type: FloatingTextType.Reward,
        playerId: 'p2',
        actionType: 'rent_receive',
        title: 'Bến Thành',
        targetPlayerName: 'Huy',
        timestamp: Date.now(),
      };
      const reason = resolveFriendlyReason?.(item);
      expect(reason).toBeDefined();
      expect(reason).toMatch(/Thu thuê|Thu tiền thuê/);
      expect(reason).toContain('Bến Thành');
      expect(reason).toContain('Huy');
    });

    it('[TC-IMP123.04/MSS][UC-IMP123] buy: định dạng lý do mua sở hữu bất động sản', () => {
      const item: FloatingTextItem = {
        id: 'ft_buy_1',
        text: '-1.800 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'p1',
        actionType: 'buy',
        title: 'Đà Nẵng',
        timestamp: Date.now(),
      };
      const reason = resolveFriendlyReason?.(item);
      expect(reason).toBeDefined();
      expect(reason).toContain('Mua');
      expect(reason).toContain('Đà Nẵng');
    });

    it('[TC-IMP123.05/MSS][UC-IMP123] upgrade: định dạng lý do xây dựng hoặc nâng cấp công trình', () => {
      const item: FloatingTextItem = {
        id: 'ft_upg_1',
        text: '-1.200 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'p1',
        actionType: 'upgrade',
        title: 'Ba Đình',
        timestamp: Date.now(),
      };
      const reason = resolveFriendlyReason?.(item);
      expect(reason).toBeDefined();
      expect(reason).toMatch(/Xây|Nâng/);
      expect(reason).toMatch(/C1|C2|C3|Nhà Phố|Khách Sạn/);
      expect(reason).toContain('Ba Đình');
    });

    it('[TC-IMP123.06/MSS][UC-IMP123] salary: định dạng lý do thưởng lương khi qua ô Khởi Hành', () => {
      const item: FloatingTextItem = {
        id: 'ft_sal_1',
        text: '+2.000 Tr.',
        type: FloatingTextType.Reward,
        playerId: 'p1',
        actionType: 'salary',
        title: 'Lương Khởi Hành',
        timestamp: Date.now(),
      };
      const reason = resolveFriendlyReason?.(item);
      expect(reason).toBeDefined();
      expect(reason).toMatch(/Khởi Hành|Bắt Đầu/);
    });

    it('[TC-IMP123.07/MSS][UC-IMP123] tax: định dạng lý do nộp thuế hoặc lệ phí đất đai', () => {
      const item: FloatingTextItem = {
        id: 'ft_tax_1',
        text: '-500 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'p1',
        actionType: 'tax',
        title: 'Lệ Phí Đăng Ký Đất Đai',
        timestamp: Date.now(),
      };
      const reason = resolveFriendlyReason?.(item);
      expect(reason).toBeDefined();
      expect(reason).toMatch(/Lệ Phí|Thuế/);
    });

    it('[TC-IMP123.08/MSS][UC-IMP123] bail: định dạng lý do nộp phí bảo lãnh Trạm Kiểm Toán', () => {
      const item: FloatingTextItem = {
        id: 'ft_bail_1',
        text: '-500 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'p1',
        actionType: 'bail',
        title: 'Bảo lãnh thanh tra',
        timestamp: Date.now(),
      };
      const reason = resolveFriendlyReason?.(item);
      expect(reason).toBeDefined();
      expect(reason).toMatch(/bảo lãnh|Kiểm Toán/i);
    });

    it('[TC-IMP123.09/MSS][UC-IMP123] auction_win: định dạng lý do thắng đấu giá BĐS', () => {
      const item: FloatingTextItem = {
        id: 'ft_auc_1',
        text: '-3.200 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'p1',
        actionType: 'auction_win',
        title: 'Tràng Tiền',
        timestamp: Date.now(),
      };
      const reason = resolveFriendlyReason?.(item);
      expect(reason).toBeDefined();
      expect(reason).toMatch(/Đấu giá|Thắng đấu giá/i);
      expect(reason).toContain('Tràng Tiền');
    });

    it('[TC-IMP123.10/MSS][UC-IMP123] stimulus: định dạng lý do nhận trợ cấp từ Kho Bạc', () => {
      const item: FloatingTextItem = {
        id: 'ft_stim_1',
        text: '+1.000 Tr.',
        type: FloatingTextType.Reward,
        playerId: 'p1',
        actionType: 'stimulus',
        title: 'Gói Kích Cầu',
        timestamp: Date.now(),
      };
      const reason = resolveFriendlyReason?.(item);
      expect(reason).toBeDefined();
      expect(reason).toMatch(/trợ cấp|Kho Bạc/i);
    });

    it('[TC-IMP123.11/MSS][UC-IMP123] hose: định dạng lý do giao dịch hoặc cổ tức sàn HOSE', () => {
      const item: FloatingTextItem = {
        id: 'ft_hose_1',
        text: '+800 Tr.',
        type: FloatingTextType.Reward,
        playerId: 'p1',
        actionType: 'hose',
        title: 'Cổ tức cổ phiếu',
        timestamp: Date.now(),
      };
      const reason = resolveFriendlyReason?.(item);
      expect(reason).toBeDefined();
      expect(reason).toMatch(/HOSE|chứng khoán/i);
    });

    it('[TC-IMP123.12/MSS][UC-IMP123] Fallback an toàn khi actionType hoặc title không xác định', () => {
      const item: FloatingTextItem = {
        id: 'ft_gen_1',
        text: '+500 Tr.',
        type: FloatingTextType.Reward,
        playerId: 'p1',
        timestamp: Date.now(),
      };
      const reason = resolveFriendlyReason?.(item);
      expect(typeof reason).toBe('string');
      expect(reason!.length).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // FACET 2: Two-Segment Responsive Structure & Zero Hidden Target
  // =========================================================================
  describe('FACET 2: Two-Segment Responsive Structure & Zero Hidden Target', () => {
    it('[TC-IMP123.13/MSS][UC-IMP123] FloatingBadge hiển thị lý do thân thiện đầy đủ từ resolveFriendlyReason', () => {
      const item: FloatingTextItem = {
        id: 'ft_badge_rent',
        text: '-500 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'p1',
        actionType: 'rent_pay',
        title: 'Bến Thành',
        targetPlayerName: 'Hoàng Nam',
        timestamp: Date.now(),
      };

      const markup = renderToStaticMarkup(React.createElement(FloatingBadge, { item }));
      expect(markup).toMatch(/Trả thuê|Tiền thuê/);
      expect(markup).toContain('Bến Thành');
      expect(markup).toContain('Hoàng Nam');
    });

    it('[TC-IMP123.14/MSS][UC-IMP123] Zero Hidden Target: Thông tin đối tác không bị giấu bởi class hidden sm:inline', () => {
      const item: FloatingTextItem = {
        id: 'ft_badge_partner',
        text: '-600 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'p1',
        actionType: 'rent_pay',
        title: 'Cần Thơ',
        targetPlayerName: 'Hoàng Nam',
        timestamp: Date.now(),
      };

      const markup = renderToStaticMarkup(React.createElement(FloatingBadge, { item }));
      expect(markup).not.toContain('hidden sm:inline');
      expect(markup).toContain('Hoàng Nam');
    });

    it('[TC-IMP123.15/MSS][UC-IMP123] Zero Truncation: Nhãn lý do không bị giới hạn cụt chữ bởi class max-w-[120px]', () => {
      const item: FloatingTextItem = {
        id: 'ft_badge_trunc',
        text: '-1.500 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'p1',
        actionType: 'buy',
        title: 'Đà Nẵng (Hải Châu - Sơn Trà)',
        timestamp: Date.now(),
      };

      const markup = renderToStaticMarkup(React.createElement(FloatingBadge, { item }));
      expect(markup).not.toContain('max-w-[120px]');
    });
  });

  // =========================================================================
  // FACET 3: Visual Delta Capsule Styling
  // =========================================================================
  describe('FACET 3: Visual Delta Capsule Styling', () => {
    it('[TC-IMP123.16/MSS][UC-IMP123] Phần số tiền biến động được bọc trong capsule riêng biệt với data-testid="floating-amount-pill"', () => {
      const item: FloatingTextItem = {
        id: 'ft_pill_test',
        text: '+2.000 Tr.',
        type: FloatingTextType.Reward,
        playerId: 'p1',
        actionType: 'salary',
        timestamp: Date.now(),
      };

      const markup = renderToStaticMarkup(React.createElement(FloatingBadge, { item }));
      expect(markup).toContain('data-testid="floating-amount-pill"');
      expect(markup).toContain('+2.000 Tr.');
    });

    it('[TC-IMP123.17/MSS][UC-IMP123] Reward Capsule: Số tiền thưởng mang capsule nền sáng/viền emerald (bg-emerald-50 hoặc text-emerald-700 hoặc border-emerald-300)', () => {
      const item: FloatingTextItem = {
        id: 'ft_pill_reward',
        text: '+1.000 Tr.',
        type: FloatingTextType.Reward,
        playerId: 'p1',
        actionType: 'stimulus',
        timestamp: Date.now(),
      };

      const markup = renderToStaticMarkup(React.createElement(FloatingBadge, { item }));
      expect(markup).toContain('data-testid="floating-amount-pill"');
      expect(markup).toMatch(/bg-emerald-50|text-emerald-700|border-emerald-300/);
    });

    it('[TC-IMP123.18/MSS][UC-IMP123] Penalty Capsule: Số tiền phạt mang capsule nền sáng/viền rose (bg-rose-50 hoặc text-rose-700 hoặc border-rose-300)', () => {
      const item: FloatingTextItem = {
        id: 'ft_pill_penalty',
        text: '-500 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'p1',
        actionType: 'tax',
        timestamp: Date.now(),
      };

      const markup = renderToStaticMarkup(React.createElement(FloatingBadge, { item }));
      expect(markup).toContain('data-testid="floating-amount-pill"');
      expect(markup).toMatch(/bg-rose-50|text-rose-700|border-rose-300/);
    });
  });

  // =========================================================================
  // FACET 4: Milestone Banner Semantic Structure
  // =========================================================================
  describe('FACET 4: Milestone Banner Semantic Structure', () => {
    it('[TC-IMP123.19/MSS][UC-IMP123] MilestoneBanner thẻ Cơ Hội: Tiêu đề hiển thị tên thẻ và nội dung mô tả hiệu lực', () => {
      const item: FloatingTextItem = {
        id: 'ft_banner_chance',
        text: '+1.500 Tr.',
        type: FloatingTextType.Reward,
        playerId: 'p1',
        actionType: 'chance',
        title: 'Hoàn Thuế Doanh Nghiệp',
        timestamp: Date.now(),
      };

      const markup = renderToStaticMarkup(React.createElement(MilestoneBanner, { item }));
      expect(markup).toContain('data-testid="event-card-notification-banner"');
      expect(markup).toContain('data-testid="milestone-card-title"');
      expect(markup).toContain('Hoàn Thuế Doanh Nghiệp');
      expect(markup).toContain('+1.500 Tr.');
    });

    it('[TC-IMP123.20/MSS][UC-IMP123] MilestoneBanner thẻ Thị Trường: Tiêu đề hiển thị tên sự kiện và nội dung mô tả tác động vĩ mô', () => {
      const item: FloatingTextItem = {
        id: 'ft_banner_market',
        text: 'Đóng Băng Bất Động Sản',
        type: FloatingTextType.Penalty,
        playerId: 'p1',
        actionType: 'market',
        title: 'Khủng Hoảng Thanh Khoản',
        timestamp: Date.now(),
      };

      const markup = renderToStaticMarkup(React.createElement(MilestoneBanner, { item }));
      expect(markup).toContain('data-testid="event-card-notification-banner"');
      expect(markup).toContain('data-testid="milestone-card-title"');
      expect(markup).toContain('Khủng Hoảng Thanh Khoản');
      expect(markup).toContain('Đóng Băng Bất Động Sản');
    });

    it('[TC-IMP123.21/MSS][UC-IMP123] MilestoneBanner thẻ phi tiền tệ: Hiển thị tên thẻ và hành động hiệu lực không bị rỗng hay ẩn', () => {
      const item: FloatingTextItem = {
        id: 'ft_banner_non_monetary',
        text: 'Vào Trạm Kiểm Toán & Thanh Tra',
        type: FloatingTextType.Penalty,
        playerId: 'p1',
        actionType: 'chance',
        title: 'Lệnh Thanh Tra Khẩn Cấp',
        timestamp: Date.now(),
      };

      const markup = renderToStaticMarkup(React.createElement(MilestoneBanner, { item }));
      expect(markup).toContain('data-testid="event-card-notification-banner"');
      expect(markup).toContain('data-testid="milestone-card-title"');
      expect(markup).toContain('Lệnh Thanh Tra Khẩn Cấp');
      expect(markup).toMatch(/Vào Trạm Kiểm Toán (&amp;|&) Thanh Tra/);
    });
  });
});
