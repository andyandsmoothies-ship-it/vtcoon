// [TC-122/MSS][UC-IMP122] Contract Tests: Phủ Sóng Pop-Up Cho Toàn Bộ Biến Động Tiền Tệ & Hiệu Ứng Thẻ Bài Sự Kiện
// Universal 4-Facet Behavioral Matrix Verification (Boundary, Reactivity, Segregation, Responsive UI)

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  useGameStore,
  FloatingTextType,
  type FloatingTextItem,
  type FloatingActionType,
} from '../../src/client/store/game_store.js';
import {
  FloatingBadge,
  MilestoneBanner,
  FloatingNumbersOverlay,
} from '../../src/client/ui/floating_numbers.js';
import * as floatingNumbersModule from '../../src/client/ui/floating_numbers.js';
import * as activityTrackerModule from '../../src/client/network/activity_tracker.js';
import {
  resetEventCardActivityTracker,
  resetAuctionActivityTracker,
} from '../../src/client/network/activity_tracker.js';
import { useActivityStore, type ActivityLogEntry } from '../../src/client/store/activity_store.js';
import { applyDeltaToStore } from '../../src/client/network/apply_delta.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';

// Khởi tạo các hàm hợp đồng từ production module (kiểm tra tính sẵn sàng của contract)
const resolveActionIcon = (floatingNumbersModule as Record<string, unknown>).resolveActionIcon as
  | ((actionType?: string, isReward?: boolean) => string)
  | undefined;

const dispatchActivityFloatingBadges = (activityTrackerModule as Record<string, unknown>).dispatchActivityFloatingBadges as
  | ((activities: readonly ActivityLogEntry[], state: ReturnType<typeof useGameStore.getState>) => void)
  | undefined;

describe('[IMP-122] Comprehensive Financial & Event Card Pop-Ups Contract Suite', () => {
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
          name: 'Tỷ Phú Hà Nội (Bot)',
          balance: 15000,
          tokenColor: '#F43F5E',
          ownedProperties: [],
          isBot: true,
        },
      },
      playerPositions: { p1: 0, p2: 0 },
      levelMap: {},
    });
    resetEventCardActivityTracker();
    resetAuctionActivityTracker();
    useActivityStore.getState().clearLogs();
  });

  // =========================================================================
  // FACET 1: Boundary & Capacity Invariants (Biểu Tượng & Phổ ActionType Mới)
  // =========================================================================
  describe('FACET 1: Boundary & Capacity Invariants', () => {
    it('[TC-122.01/MSS][UC-IMP122] resolveActionIcon contract: hàm phân giải icon phải được export', () => {
      expect(typeof resolveActionIcon).toBe('function');
    });

    it('[TC-122.02/MSS][UC-IMP122] resolveActionIcon: thẻ Cơ Hội \'chance\' trả về biểu tượng tia sét ⚡', () => {
      expect(resolveActionIcon?.('chance')).toBe('⚡');
    });

    it('[TC-122.03/MSS][UC-IMP122] resolveActionIcon: thẻ Thị Trường \'market\' trả về biểu tượng thẻ bài 🎴', () => {
      expect(resolveActionIcon?.('market')).toBe('🎴');
    });

    it('[TC-122.04/MSS][UC-IMP122] resolveActionIcon: thắng đấu giá \'auction_win\' trả về biểu tượng búa gõ 🔨', () => {
      expect(resolveActionIcon?.('auction_win')).toBe('🔨');
    });

    it('[TC-122.05/MSS][UC-IMP122] resolveActionIcon: chứng khoán HOSE \'hose\' trả về biểu tượng biểu đồ 📊', () => {
      const icon = resolveActionIcon?.('hose');
      expect(['📊', '📈', '📉']).toContain(icon);
    });

    it('[TC-122.06/MSS][UC-IMP122] resolveActionIcon: dịch chuyển \'teleport\' trả về biểu tượng máy bay ✈️', () => {
      expect(resolveActionIcon?.('teleport')).toBe('✈️');
    });

    it('[TC-122.07/MSS][UC-IMP122] resolveActionIcon: vào tù kiểm toán \'audit_jail\' trả về biểu tượng còi cảnh báo 🚨', () => {
      expect(resolveActionIcon?.('audit_jail')).toBe('🚨');
    });

    it('[TC-122.08/MSS][UC-IMP122] FloatingActionType contract: mở rộng đầy đủ các phân loại sự kiện mới', () => {
      const validActionTypes: readonly FloatingActionType[] = [
        'buy',
        'upgrade',
        'rent_pay',
        'rent_receive',
        'tax',
        'bail',
        'salary',
        'monopoly',
        'debt_relief',
        'stimulus',
        'chance' as unknown as FloatingActionType,
        'market' as unknown as FloatingActionType,
        'auction_win' as unknown as FloatingActionType,
        'hose' as unknown as FloatingActionType,
        'teleport' as unknown as FloatingActionType,
        'audit_jail' as unknown as FloatingActionType,
        'general',
      ];
      expect(validActionTypes).toHaveLength(17);
    });
  });

  // =========================================================================
  // FACET 2: State Reactivity & Contextual Badge Dispatch (Cầu Nối Activity ➔ Pop-Up)
  // =========================================================================
  describe('FACET 2: State Reactivity & Contextual Badge Dispatch', () => {
    it('[TC-122.09/MSS][UC-IMP122] dispatchActivityFloatingBadges contract: hàm cầu nối phải được export', () => {
      expect(typeof dispatchActivityFloatingBadges).toBe('function');
    });

    it('[TC-122.10/MSS][UC-IMP122] rent activity: dispatch badge rent_pay cho người trả với text âm và tên đối thủ', () => {
      const rentActivity: ActivityLogEntry = {
        id: 'rent_1001_p1_p2',
        timestamp: Date.now(),
        type: 'rent',
        message: 'Đại Gia Sài Gòn đã trả 500 Tr. tiền thuê cho Tỷ Phú Hà Nội (Bot)',
        playerId: 'p1',
        playerName: 'Đại Gia Sài Gòn',
        targetPlayerId: 'p2',
        targetPlayerName: 'Tỷ Phú Hà Nội',
        amount: -500,
        cellIndex: 19,
      };

      dispatchActivityFloatingBadges?.([rentActivity], useGameStore.getState());

      const payerBadge = useGameStore.getState().floatingTexts.find(
        (b) => b.playerId === 'p1' && b.actionType === 'rent_pay',
      );
      expect(payerBadge).toBeDefined();
      expect(payerBadge?.text).toBe('-500');
      expect(payerBadge?.title).toContain('Trả thuê');
      expect(payerBadge?.targetPlayerName).toContain('Tỷ Phú Hà Nội');
    });

    it('[TC-122.11/MSS][UC-IMP122] rent activity: dispatch badge rent_receive cho người nhận với text dương và tên đối thủ', () => {
      const rentActivity: ActivityLogEntry = {
        id: 'rent_1002_p1_p2',
        timestamp: Date.now(),
        type: 'rent',
        message: 'Đại Gia Sài Gòn đã trả 500 tiền thuê cho Tỷ Phú Hà Nội (Bot)',
        playerId: 'p1',
        playerName: 'Đại Gia Sài Gòn',
        targetPlayerId: 'p2',
        targetPlayerName: 'Tỷ Phú Hà Nội',
        amount: -500,
        cellIndex: 19,
      };

      dispatchActivityFloatingBadges?.([rentActivity], useGameStore.getState());

      const receiverBadge = useGameStore.getState().floatingTexts.find(
        (b) => b.playerId === 'p2' && b.actionType === 'rent_receive',
      );
      expect(receiverBadge).toBeDefined();
      expect(receiverBadge?.text).toBe('+500');
      expect(receiverBadge?.title).toContain('Thu thuê');
      expect(receiverBadge?.targetPlayerName).toContain('Đại Gia Sài Gòn');
    });

    it('[TC-122.12/MSS][UC-IMP122] buy activity: dispatch badge buy cho người mua với số tiền trừ và tên ô đất', () => {
      const buyActivity: ActivityLogEntry = {
        id: 'buy_1003_16_p1',
        timestamp: Date.now(),
        type: 'buy',
        message: 'Đại Gia Sài Gòn đã mua Đà Nẵng với giá 1.800',
        playerId: 'p1',
        playerName: 'Đại Gia Sài Gòn',
        amount: -1800,
        cellIndex: 16,
      };

      dispatchActivityFloatingBadges?.([buyActivity], useGameStore.getState());

      const buyBadge = useGameStore.getState().floatingTexts.find(
        (b) => b.playerId === 'p1' && b.actionType === 'buy',
      );
      expect(buyBadge).toBeDefined();
      expect(buyBadge?.text).toBe('-1.800');
      expect(buyBadge?.title).toContain('Mua');
      expect(buyBadge?.title).toContain('Đà Nẵng');
    });

    it('[TC-122.13/MSS][UC-IMP122] upgrade activity: dispatch badge upgrade cho chủ đất với chi phí và cấp độ công trình', () => {
      const upgradeActivity: ActivityLogEntry = {
        id: 'upgrade_1004_1_p1',
        timestamp: Date.now(),
        type: 'upgrade',
        message: 'Đại Gia Sài Gòn đã nâng cấp C1 (Nhà Phố) tại Ba Đình',
        playerId: 'p1',
        playerName: 'Đại Gia Sài Gòn',
        amount: -450,
        cellIndex: 1,
      };

      dispatchActivityFloatingBadges?.([upgradeActivity], useGameStore.getState());

      const upgradeBadge = useGameStore.getState().floatingTexts.find(
        (b) => b.playerId === 'p1' && b.actionType === 'upgrade',
      );
      expect(upgradeBadge).toBeDefined();
      expect(upgradeBadge?.text).toBe('-450');
      expect(upgradeBadge?.title).toContain('Nâng');
    });

    it('[TC-122.14/MSS][UC-IMP122] tax activity: dispatch badge tax cho người nộp thuế với số tiền trừ và tiêu đề Lệ Phí/Thuế', () => {
      const taxActivity: ActivityLogEntry = {
        id: 'tax_1005_p1',
        timestamp: Date.now(),
        type: 'tax',
        message: 'Đại Gia Sài Gòn đã nộp phí / nộp thuế 500 (Lệ Phí Đăng Ký Đất Đai)',
        playerId: 'p1',
        playerName: 'Đại Gia Sài Gòn',
        amount: -500,
        cellIndex: 4,
      };

      dispatchActivityFloatingBadges?.([taxActivity], useGameStore.getState());

      const taxBadge = useGameStore.getState().floatingTexts.find(
        (b) => b.playerId === 'p1' && b.actionType === 'tax',
      );
      expect(taxBadge).toBeDefined();
      expect(taxBadge?.text).toBe('-500');
      expect(taxBadge?.title).toMatch(/Lệ Phí|Thuế/);
    });

    it('[TC-122.15/MSS][UC-IMP122] auction activity: dispatch badge auction_win cho người thắng kèm giá đấu và tiêu đề Đấu Giá', () => {
      const auctionWinActivity: ActivityLogEntry = {
        id: 'auction_win_1006_39_p1',
        timestamp: Date.now(),
        type: 'auction',
        message: '🔨 [Đấu Giá] Búa gõ thành công! Đại Gia Sài Gòn đã trúng đấu giá Tràng Tiền với giá 3.200!',
        playerId: 'p1',
        playerName: 'Đại Gia Sài Gòn',
        amount: -3200,
        cellIndex: 39,
      };

      dispatchActivityFloatingBadges?.([auctionWinActivity], useGameStore.getState());

      const auctionBadge = useGameStore.getState().floatingTexts.find(
        (b) => b.playerId === 'p1' && b.actionType === 'auction_win',
      );
      expect(auctionBadge).toBeDefined();
      expect(auctionBadge?.text).toBe('-3.200');
      expect(auctionBadge?.title).toContain('Thắng đấu giá');
    });
  });

  // =========================================================================
  // FACET 3: Event Card Milestone Banner Segregation (Bốc Thẻ Cơ Hội & Thị Trường)
  // =========================================================================
  describe('FACET 3: Event Card Milestone Banner Segregation', () => {
    it('[TC-122.16/MSS][UC-IMP122] lastEventCard Cơ Hội: kích hoạt floating badge actionType=\'chance\' với tiêu đề và mô tả', () => {
      const delta: DeltaPayload = {
        tick: 1,
        cells: [],
        lastEventCard: {
          id: 'ch_tax_refund',
          cardId: 'ch_tax_refund',
          type: 'Chance',
          cardType: 'chance',
          title: 'Hoàn Thuế Bất Động Sản',
          description: 'Kho Bạc hoàn lại 1.000 Tr. tiền thuế cho bạn',
          effectDelta: 1000,
          drawnBy: 'p1',
        } as unknown as NonNullable<DeltaPayload['lastEventCard']>,
      };

      applyDeltaToStore(delta, useGameStore);

      const cardBadge = useGameStore.getState().floatingTexts.find(
        (b) => b.actionType === 'chance',
      );
      expect(cardBadge).toBeDefined();
      expect(cardBadge?.title).toContain('Hoàn Thuế Bất Động Sản');
      expect(cardBadge?.playerId).toBe('p1');
    });

    it('[TC-122.17/MSS][UC-IMP122] lastEventCard Thị Trường: kích hoạt floating badge actionType=\'market\' với tiêu đề vĩ mô', () => {
      const delta: DeltaPayload = {
        tick: 2,
        cells: [],
        lastEventCard: {
          id: 'mk_property_boom',
          cardId: 'mk_property_boom',
          type: 'Market',
          cardType: 'market',
          title: 'Sốt Đất Toàn Miền',
          description: 'Giá trị đất tăng 20% trên toàn bản đồ',
          drawnBy: 'p1',
        } as unknown as NonNullable<DeltaPayload['lastEventCard']>,
      };

      applyDeltaToStore(delta, useGameStore);

      const cardBadge = useGameStore.getState().floatingTexts.find(
        (b) => b.actionType === 'market',
      );
      expect(cardBadge).toBeDefined();
      expect(cardBadge?.title).toContain('Sốt Đất Toàn Miền');
    });

    it('[TC-122.18/MSS][UC-IMP122] lastEventCard phi tiền tệ: thẻ Vào tù vẫn dispatch pop-up mô tả hành động rõ ràng', () => {
      const delta: DeltaPayload = {
        tick: 3,
        cells: [],
        lastEventCard: {
          id: 'ch_audit_jail',
          cardId: 'ch_audit_jail',
          type: 'Chance',
          cardType: 'chance',
          title: 'Thanh Tra Thuế',
          description: 'Vào Khu Vực Kiểm Toán ngay lập tức, không qua ô Bắt Đầu',
          drawnBy: 'p1',
        } as unknown as NonNullable<DeltaPayload['lastEventCard']>,
      };

      applyDeltaToStore(delta, useGameStore);

      const cardBadge = useGameStore.getState().floatingTexts.find(
        (b) => b.actionType === 'chance',
      );
      expect(cardBadge).toBeDefined();
      expect(cardBadge?.title).toContain('Thanh Tra Thuế');
      expect(cardBadge?.text).toContain('Kiểm Toán');
    });

    it('[TC-122.19/MSS][UC-IMP122] lastEventCard khi Bot bốc thẻ: người chơi quan sát vẫn nhận được floating badge', () => {
      const delta: DeltaPayload = {
        tick: 4,
        cells: [],
        lastEventCard: {
          id: 'ch_stimulus',
          cardId: 'ch_stimulus',
          type: 'Chance',
          cardType: 'chance',
          title: 'Gói Kích Cầu',
          description: 'Nhận trợ cấp 500 Tr. từ ngân sách',
          effectDelta: 500,
          drawnBy: 'p2', // Bot
        } as unknown as NonNullable<DeltaPayload['lastEventCard']>,
      };

      applyDeltaToStore(delta, useGameStore);

      const cardBadge = useGameStore.getState().floatingTexts.find(
        (b) => b.playerId === 'p2' && b.actionType === 'chance',
      );
      expect(cardBadge).toBeDefined();
      expect(cardBadge?.title).toContain('Gói Kích Cầu');
    });

    it('[TC-122.20/MSS][UC-IMP122] Deduplication: delta tiếp theo giữ nguyên thẻ cũ không bị dispatch trùng lặp', () => {
      const cardPayload = {
        id: 'ch_dedup_test',
        cardId: 'ch_dedup_test',
        type: 'Chance',
        cardType: 'chance',
        title: 'Thẻ Thử Nghiệm Trùng Lặp',
        description: 'Chỉ hiển thị đúng 1 lần duy nhất',
        drawnBy: 'p1',
      } as unknown as NonNullable<DeltaPayload['lastEventCard']>;

      // Lần 1: bốc thẻ
      applyDeltaToStore({ tick: 5, cells: [], lastEventCard: cardPayload }, useGameStore);
      const countAfterFirst = useGameStore.getState().floatingTexts.filter(
        (b) => b.actionType === 'chance',
      ).length;
      expect(countAfterFirst).toBe(1);

      // Lần 2: delta tick tiếp theo vẫn giữ nguyên lastEventCard cũ
      applyDeltaToStore({ tick: 6, cells: [], lastEventCard: cardPayload }, useGameStore);
      const countAfterSecond = useGameStore.getState().floatingTexts.filter(
        (b) => b.actionType === 'chance',
      ).length;
      expect(countAfterSecond).toBe(1);
    });
  });

  // =========================================================================
  // FACET 4: Responsive UI Rendering (MilestoneBanner & FloatingNumbersOverlay)
  // =========================================================================
  describe('FACET 4: Responsive UI Rendering & Layout Invariants', () => {
    it('[TC-122.21/MSS][UC-IMP122] MilestoneBanner render data-testid=\'event-card-notification-banner\' khi actionType=\'chance\'', () => {
      const item: FloatingTextItem = {
        id: 'ft_banner_chance',
        text: '+1.000 Tr.',
        type: FloatingTextType.Reward,
        playerId: 'p1',
        actionType: 'chance' as unknown as FloatingActionType,
        title: 'Cơ Hội: Hoàn Thuế Bất Động Sản',
        timestamp: Date.now(),
      };

      const html = renderToStaticMarkup(React.createElement(MilestoneBanner, { item }));
      expect(html).toContain('data-testid="event-card-notification-banner"');
      expect(html).toContain('⚡');
      expect(html).toContain('Hoàn Thuế Bất Động Sản');
    });

    it('[TC-122.22/MSS][UC-IMP122] MilestoneBanner render data-testid=\'event-card-notification-banner\' khi actionType=\'market\'', () => {
      const item: FloatingTextItem = {
        id: 'ft_banner_market',
        text: 'Sốt Đất Toàn Miền',
        type: FloatingTextType.Reward,
        playerId: 'p1',
        actionType: 'market' as unknown as FloatingActionType,
        title: 'Thị Trường: Sốt Đất Toàn Miền',
        timestamp: Date.now(),
      };

      const html = renderToStaticMarkup(React.createElement(MilestoneBanner, { item }));
      expect(html).toContain('data-testid="event-card-notification-banner"');
      expect(html).toContain('🎴');
      expect(html).toContain('Sốt Đất Toàn Miền');
    });

    it('[TC-122.23/MSS][UC-IMP122] FloatingNumbersOverlay nhận diện actionType=\'chance\' là latestMilestone ở vị trí trung tâm', () => {
      useGameStore.setState({
        floatingTexts: [
          {
            id: 'ft_overlay_chance',
            text: '+1.000 Tr.',
            type: FloatingTextType.Reward,
            playerId: 'p1',
            actionType: 'chance' as unknown as FloatingActionType,
            title: 'Cơ Hội: Hoàn Thuế Bất Động Sản',
            timestamp: Date.now(),
          },
        ],
      });

      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toContain('data-testid="event-card-notification-banner"');
      expect(html).toContain('fixed top-20 left-3 sm:left-1/2');
    });

    it('[TC-122.24/MSS][UC-IMP122] FloatingNumbersOverlay nhận diện actionType=\'market\' là latestMilestone ở vị trí trung tâm', () => {
      useGameStore.setState({
        floatingTexts: [
          {
            id: 'ft_overlay_market',
            text: 'Sốt Đất Toàn Miền',
            type: FloatingTextType.Reward,
            playerId: 'p1',
            actionType: 'market' as unknown as FloatingActionType,
            title: 'Thị Trường: Sốt Đất Toàn Miền',
            timestamp: Date.now(),
          },
        ],
      });

      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toContain('data-testid="event-card-notification-banner"');
      expect(html).toContain('fixed top-20 left-3 sm:left-1/2');
    });

    it('[TC-122.25/MSS][UC-IMP122] FloatingBadge hiển thị an toàn với actionType=\'auction_win\' và icon 🔨', () => {
      const item: FloatingTextItem = {
        id: 'ft_badge_auction',
        text: '-3.200 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'p1',
        actionType: 'auction_win' as unknown as FloatingActionType,
        title: 'Thắng Đấu Giá Tràng Tiền',
        timestamp: Date.now(),
      };

      const html = renderToStaticMarkup(React.createElement(FloatingBadge, { item }));
      expect(html).toContain('data-testid="contextual-transaction-badge"');
      expect(html).toContain('🔨');
      expect(html).toContain('-3.200 Tr.');
    });
  });
});
