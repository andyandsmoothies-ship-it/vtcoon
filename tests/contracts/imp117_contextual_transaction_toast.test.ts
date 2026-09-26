// [IMP-117] Contract Tests: Contextual Transaction Toast & Responsive Multi-Platform HUD Notifications
// Universal 4-Facet Behavioral Matrix Verification (Boundary, Reactivity, Segregation, Error Defense)

import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  useGameStore,
  FloatingTextType,
  type FloatingTextItem,
  type FloatingActionType,
  FLOATING_TEXT_DURATION_MS,
  MAX_FLOATING_TEXTS,
} from '../../src/client/store/game_store.js';
import { FloatingBadge, FloatingNumbersOverlay } from '../../src/client/ui/floating_numbers.js';
import { notifyBalanceChange } from '../../src/client/network/apply_delta_players.js';
import { checkMonopolyReward, updateCellLevel } from '../../src/client/network/apply_delta_cells.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';

describe('[IMP-117] Contextual Transaction Toast & Responsive HUD Notifications', () => {
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
        },
        p2: {
          id: 'p2',
          name: 'Tỷ Phú Hà Nội',
          balance: 15000,
          tokenColor: '#F43F5E',
          ownedProperties: [],
        },
      },
      playerPositions: { p1: 0, p2: 0 },
      levelMap: {},
    });
  });

  // =========================================================================
  // FACET 1: Boundary & Capacity Invariants (Giới hạn và Thời lượng)
  // =========================================================================
  describe('FACET 1: Boundary & Capacity Invariants', () => {
    it('[TC-117.01] FLOATING_TEXT_DURATION_MS chuẩn hóa ở mức 2200ms', () => {
      expect(FLOATING_TEXT_DURATION_MS).toBe(2200);
    });

    it('[TC-117.02] MAX_FLOATING_TEXTS giới hạn tối đa 6 phần tử trong bộ nhớ store', () => {
      expect(MAX_FLOATING_TEXTS).toBe(6);
    });

    it('[TC-117.03] addFloatingText cắt tỉa chỉ lưu trữ tối đa 6 phần tử gần nhất', () => {
      const store = useGameStore.getState();
      for (let i = 1; i <= 8; i++) {
        store.addFloatingText({
          text: `+${i}00 Tr.`,
          type: FloatingTextType.Reward,
          playerId: 'p1',
          actionType: 'general',
          title: `Giao dịch ${i}`,
        });
      }
      expect(useGameStore.getState().floatingTexts.length).toBe(6);
      expect(useGameStore.getState().floatingTexts[5]?.title).toBe('Giao dịch 8');
    });

    it('[TC-117.04] FloatingNumbersOverlay trả về null khi không có thông báo nào', () => {
      useGameStore.setState({ floatingTexts: [] });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toBe('');
    });
  });

  // =========================================================================
  // FACET 2: State Reactivity & Contextual Action Mapping (Ngữ Cảnh Giao Dịch)
  // =========================================================================
  describe('FACET 2: State Reactivity & Contextual Action Mapping', () => {
    it('[TC-117.05] Mua đất gắn actionType=buy và ghi rõ tên ô đất đã mua', () => {
      const store = useGameStore.getState();
      store.addFloatingText({
        text: '-1.800 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'p1',
        actionType: 'buy',
        title: 'Mua Đà Nẵng',
        cellIndex: 16,
      });

      const item = useGameStore.getState().floatingTexts[0];
      expect(item?.actionType).toBe('buy');
      expect(item?.title).toBe('Mua Đà Nẵng');
      expect(item?.cellIndex).toBe(16);
    });

    it('[TC-117.06] Nâng cấp nhà gắn actionType=upgrade và tên cấp công trình C1..C3', () => {
      const store = useGameStore.getState();
      store.addFloatingText({
        text: '-450 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'p1',
        actionType: 'upgrade',
        title: 'Nâng C1 (Nhà Phố)',
        cellIndex: 1,
      });

      const item = useGameStore.getState().floatingTexts[0];
      expect(item?.actionType).toBe('upgrade');
      expect(item?.title).toBe('Nâng C1 (Nhà Phố)');
    });

    it('[TC-117.07] Trả tiền thuê đất gắn actionType=rent_pay và ghi rõ đối thủ nhận tiền', () => {
      const store = useGameStore.getState();
      store.addFloatingText({
        text: '-700 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'p1',
        actionType: 'rent_pay',
        title: 'Trả tiền thuê Ô 19',
        targetPlayerName: 'Tỷ Phú Hà Nội',
      });

      const item = useGameStore.getState().floatingTexts[0];
      expect(item?.actionType).toBe('rent_pay');
      expect(item?.targetPlayerName).toBe('Tỷ Phú Hà Nội');
    });

    it('[TC-117.08] Nhận tiền thuê đất gắn actionType=rent_receive và ghi rõ người trả tiền', () => {
      const store = useGameStore.getState();
      store.addFloatingText({
        text: '+700 Tr.',
        type: FloatingTextType.Reward,
        playerId: 'p2',
        actionType: 'rent_receive',
        title: 'Nhận tiền thuê Ô 19',
        targetPlayerName: 'Đại Gia Sài Gòn',
      });

      const item = useGameStore.getState().floatingTexts[0];
      expect(item?.actionType).toBe('rent_receive');
      expect(item?.targetPlayerName).toBe('Đại Gia Sài Gòn');
    });

    it('[TC-117.09] Lương qua GO gắn actionType=salary và title Lương Vượt GO', () => {
      const state = useGameStore.getState();
      notifyBalanceChange(state, 'p1', 2000, 15000, 17000, { isPassingGo: true });

      const item = useGameStore.getState().floatingTexts.find((t) => t.actionType === 'salary');
      expect(item).toBeDefined();
      expect(item?.text).toBe('+2.000');
      expect(item?.title).toContain('GO');
    });

    it('[TC-117.10] Nộp thuế ô 04 gắn actionType=tax và title Lệ Phí Đất Đai', () => {
      const state = useGameStore.getState();
      notifyBalanceChange(state, 'p1', -500, 15000, 14500, { cellIndex: 4 });

      const item = useGameStore.getState().floatingTexts.find((t) => t.actionType === 'tax');
      expect(item).toBeDefined();
      expect(item?.text).toBe('-500');
      expect(item?.title).toContain('Lệ Phí');
    });

    it('[TC-117.11] Tiền bảo lãnh ô 10 gắn actionType=bail và title Bảo Lãnh Kiểm Toán', () => {
      const state = useGameStore.getState();
      notifyBalanceChange(state, 'p1', -500, 15000, 14500, { cellIndex: 10, isBail: true });

      const item = useGameStore.getState().floatingTexts.find((t) => t.actionType === 'bail');
      expect(item).toBeDefined();
      expect(item?.text).toBe('-500');
      expect(item?.title).toContain('Bảo Lãnh');
    });
  });

  // =========================================================================
  // FACET 3: Milestone Banner Segregation (Tách Biệt Sự Kiện Cột Mốc)
  // =========================================================================
  describe('FACET 3: Milestone Banner Segregation', () => {
    it('[TC-117.12] Độc quyền màu tạo toast mang actionType=monopoly và huy hiệu vinh danh', () => {
      const p1 = { ...useGameStore.getState().playersInfo.p1!, ownedProperties: [1] };
      useGameStore.setState((s) => ({ playersInfo: { ...s.playersInfo, p1 } }));
      checkMonopolyReward(3, 'p1', p1, useGameStore.getState());

      const item = useGameStore.getState().floatingTexts.find((t) => t.actionType === 'monopoly');
      expect(item).toBeDefined();
      expect(item?.type).toBe(FloatingTextType.Reward);
      expect(item?.text).toContain('ĐỘC QUYỀN');
    });

    it('[TC-117.13] Thoát vỡ nợ tạo thông báo mang actionType=debt_relief', () => {
      const state = useGameStore.getState();
      notifyBalanceChange(state, 'p1', 1000, -500, 500);

      const item = useGameStore.getState().floatingTexts.find((t) => t.actionType === 'debt_relief');
      expect(item).toBeDefined();
      expect(item?.title).toContain('Thoát vỡ nợ');
    });
  });

  // =========================================================================
  // FACET 4: UI Rendering & Responsive Layout Invariants (Giao Diện & Chống Che Khuất)
  // =========================================================================
  describe('FACET 4: UI Rendering & Responsive Layout Invariants', () => {
    it('[TC-117.14] FloatingBadge render đầy đủ icon, nhãn ngữ cảnh và số tiền', () => {
      const item: FloatingTextItem = {
        id: 'ft_test_1',
        text: '-1.800 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'p1',
        actionType: 'buy',
        title: 'Mua Đà Nẵng',
        timestamp: Date.now(),
      };

      const html = renderToStaticMarkup(React.createElement(FloatingBadge, { item }));
      expect(html).toContain('Mua Đà Nẵng');
      expect(html).toContain('-1.800 Tr.');
      expect(html).toContain('Đại Gia Sài Gòn');
      expect(html).toContain('🏷️');
    });

    it('[TC-117.15] FloatingBadge tự động hiển thị icon tương ứng theo actionType', () => {
      const upgradeItem: FloatingTextItem = {
        id: 'ft_test_2',
        text: '-450 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'p1',
        actionType: 'upgrade',
        title: 'Nâng C1 (Nhà Phố)',
        timestamp: Date.now(),
      };
      const html = renderToStaticMarkup(React.createElement(FloatingBadge, { item: upgradeItem }));
      expect(html).toContain('🏗️');
      expect(html).toContain('Nâng C1 (Nhà Phố)');
    });

    it('[TC-117.16] Error Defense: Thiếu title vẫn hiển thị an toàn số tiền và tên người chơi', () => {
      const fallbackItem: FloatingTextItem = {
        id: 'ft_test_fallback',
        text: '+500 Tr.',
        type: FloatingTextType.Reward,
        playerId: 'p1',
        timestamp: Date.now(),
      };
      const html = renderToStaticMarkup(React.createElement(FloatingBadge, { item: fallbackItem }));
      expect(html).toContain('+500 Tr.');
      expect(html).toContain('Đại Gia Sài Gòn');
    });

    it('[TC-117.17] FloatingNumbersOverlay chứa cấu trúc responsive cho cả Desktop và Mobile', () => {
      useGameStore.setState({
        floatingTexts: [
          {
            id: 'ft_1',
            text: '-600 Tr.',
            type: FloatingTextType.Penalty,
            playerId: 'p1',
            actionType: 'buy',
            title: 'Mua Cần Thơ',
            timestamp: Date.now(),
          },
        ],
      });

      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toContain('data-testid="floating-numbers-overlay"');
      expect(html).toContain('Mua Cần Thơ');
    });
  });
});
