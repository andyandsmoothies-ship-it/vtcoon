import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  FloatingBadge,
  MilestoneBanner,
} from '../../src/client/ui/floating_numbers.js';
import {
  useGameStore,
  FloatingTextType,
  type FloatingTextItem,
  type PlayerHudInfo,
} from '../../src/client/store/game_store.js';
import { useLobbyStore } from '../../src/client/store/lobby_store.js';

const samplePlayer: PlayerHudInfo = {
  id: 'p1',
  name: 'Chủ Tịch Sài Thành',
  balance: 20000,
  tokenColor: '#38BDF8',
  ownedProperties: [1],
};

const sampleOtherPlayer: PlayerHudInfo = {
  id: 'p2',
  name: 'Đại Gia Hà Thành',
  balance: 15000,
  tokenColor: '#F59E0B',
  ownedProperties: [3],
};

const sampleBuyItem: FloatingTextItem = {
  id: 'ft_buy_1',
  playerId: 'p1',
  text: '-2.000 Tr.',
  type: FloatingTextType.Penalty,
  actionType: 'buy',
  title: 'Mua đất đầu tư',
  cellIndex: 1,
  timestamp: 1000,
};

const sampleRentItem: FloatingTextItem = {
  id: 'ft_rent_1',
  playerId: 'p1',
  text: '+1.500 Tr.',
  type: FloatingTextType.Reward,
  actionType: 'rent_receive',
  title: 'Thu tiền thuê',
  cellIndex: 3,
  formula: '1.000 × 1.5',
  timestamp: 1001,
};

const sampleMilestoneItem: FloatingTextItem = {
  id: 'ft_market_1',
  playerId: 'p1',
  text: 'Quy hoạch khu Đông: Giá đất tăng 20%',
  type: FloatingTextType.Reward,
  actionType: 'market',
  title: 'Sự Kiện Thị Trường',
  timestamp: 1002,
};

describe('[TC-IMP278] Compact Floating Badges & Milestone Banners Contract Suite', () => {
  beforeEach(() => {
    useGameStore.getState().resetGameState();
    useLobbyStore.setState({ myPlayerId: 'p1' });
    useGameStore.setState({
      playersInfo: {
        p1: samplePlayer,
        p2: sampleOtherPlayer,
      },
      playerPositions: { p1: 1, p2: 3 },
      activeModal: null,
      activeModifiers: [],
      floatingTexts: [],
    });
  });

  it('[TC-278.01/MSS][UC-IMP278] FloatingBadge đặt transaction-flow-line ở hàng đầu tiên trước nút đóng', () => {
    const html = renderToStaticMarkup(React.createElement(FloatingBadge, { item: sampleBuyItem }));
    const flowIndex = html.indexOf('data-testid="transaction-flow-line"');
    const closeIndex = html.indexOf('aria-label="Đóng thông báo"');

    expect(flowIndex).toBeGreaterThan(-1);
    expect(closeIndex).toBeGreaterThan(-1);
    expect(flowIndex).toBeLessThan(closeIndex);
  });

  it('[TC-278.02/MSS][UC-IMP278] FloatingBadge đặt icon nhận diện ở đầu transaction-flow-line và tối ưu thẻ đơn dòng khi không có công thức', () => {
    const html = renderToStaticMarkup(React.createElement(FloatingBadge, { item: sampleBuyItem }));
    const flowIndex = html.indexOf('data-testid="transaction-flow-line"');
    const iconIndex = html.indexOf('🏷️');

    expect(flowIndex).toBeGreaterThan(-1);
    expect(iconIndex).toBeGreaterThan(-1);
    expect(iconIndex).toBeGreaterThan(flowIndex);
    expect(html).not.toContain('data-testid="transaction-formula-line"');
  });

  it('[TC-278.03/MSS][UC-IMP278] FloatingBadge đặt transaction-formula-line ở hàng phụ sau transaction-flow-line', () => {
    const html = renderToStaticMarkup(React.createElement(FloatingBadge, { item: sampleRentItem }));
    const flowIndex = html.indexOf('data-testid="transaction-flow-line"');
    const formulaIndex = html.indexOf('data-testid="transaction-formula-line"');

    expect(flowIndex).toBeGreaterThan(-1);
    expect(formulaIndex).toBeGreaterThan(-1);
    expect(formulaIndex).toBeGreaterThan(flowIndex);
  });

  it('[TC-278.04/MSS][UC-IMP278] MilestoneBanner đặt milestone-card-title ở hàng đầu tiên trước nút đóng', () => {
    const html = renderToStaticMarkup(React.createElement(MilestoneBanner, { item: sampleMilestoneItem }));
    const titleIndex = html.indexOf('data-testid="milestone-card-title"');
    const closeIndex = html.indexOf('aria-label="Đóng thông báo"');

    expect(titleIndex).toBeGreaterThan(-1);
    expect(closeIndex).toBeGreaterThan(-1);
    expect(titleIndex).toBeLessThan(closeIndex);
  });

  it('[TC-278.05/MSS][UC-IMP278] MilestoneBanner đặt nhãn danh mục ở hàng phụ bên dưới tiêu đề', () => {
    const html = renderToStaticMarkup(React.createElement(MilestoneBanner, { item: sampleMilestoneItem }));
    const titleIndex = html.indexOf('data-testid="milestone-card-title"');
    const categoryIndex = html.lastIndexOf('SỰ KIỆN THỊ TRƯỜNG');

    expect(titleIndex).toBeGreaterThan(-1);
    expect(categoryIndex).toBeGreaterThan(-1);
    expect(categoryIndex).toBeGreaterThan(titleIndex);
  });

  it('[TC-278.06/MSS][UC-IMP278] Cả hai thẻ bảo toàn kích thước chạm WCAG và CSS Hit-Slop của nút đóng', () => {
    const htmlBadge = renderToStaticMarkup(React.createElement(FloatingBadge, { item: sampleBuyItem }));
    const htmlBanner = renderToStaticMarkup(React.createElement(MilestoneBanner, { item: sampleMilestoneItem }));

    expect(htmlBadge).toContain('min-w-[24px]');
    expect(htmlBadge).toContain('after:-inset-2');
    expect(htmlBanner).toContain('min-w-[24px]');
    expect(htmlBanner).toContain('after:-inset-2');
  });

  it('[TC-278.07/MSS][UC-IMP278] Container của cả hai thẻ bảo toàn định dạng aria-label nhấn để đóng', () => {
    const htmlBadge = renderToStaticMarkup(React.createElement(FloatingBadge, { item: sampleBuyItem }));
    const htmlBanner = renderToStaticMarkup(React.createElement(MilestoneBanner, { item: sampleMilestoneItem }));

    expect(htmlBadge).toContain('aria-label="MUA ĐẤT ĐẦU TƯ: nhấn để đóng"');
    expect(htmlBanner).toContain('aria-label="SỰ KIỆN THỊ TRƯỜNG: nhấn để đóng"');
  });

  it('[TC-278.08/MSS][UC-IMP278] Cả hai thẻ loại bỏ hoàn toàn dải phân cách ngang border-b border-slate-200/80', () => {
    const htmlBadge = renderToStaticMarkup(React.createElement(FloatingBadge, { item: sampleBuyItem }));
    const htmlBanner = renderToStaticMarkup(React.createElement(MilestoneBanner, { item: sampleMilestoneItem }));

    expect(htmlBadge).not.toContain('border-b border-slate-200/80');
    expect(htmlBanner).not.toContain('border-b border-slate-200/80');
  });

  it('[TC-278.09/MSS][UC-IMP278] MilestoneBanner cho Vòng Xoay Vận Tải hiển thị tiêu đề kết quả cụ thể và mô tả không lặp lại', () => {
    const transitItem: FloatingTextItem = {
      id: 'transit_banner_1',
      playerId: 'p1',
      type: FloatingTextType.Bonus,
      actionType: 'transit',
      title: 'VÒNG XOAY VẬN TẢI',
      text: '⚡ Bot AI 2 (Aggressive) quay trúng Tốc Hành! Bay thêm 6 ô tới Thanh Hóa (Sầm Sơn).',
    };
    const html = renderToStaticMarkup(React.createElement(MilestoneBanner, { item: transitItem }));
    expect(html).toContain('⚡ Tốc Hành');
    expect(html).toContain('Bay thêm 6 ô tới Thanh Hóa (Sầm Sơn).');
    expect(html).toContain('VÒNG XOAY VẬN TẢI');
  });
});
