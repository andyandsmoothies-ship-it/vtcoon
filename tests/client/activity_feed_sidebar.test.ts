// [TC-UI06.3/MSS] Test Suite ActivityFeedSidebar & TopBar Activity Toggle
import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ActivityFeedSidebar, handleActivityFeedKeyDown } from '../../src/client/ui/activity_feed_sidebar';
import { TopBar } from '../../src/client/ui/top_bar';
import { useActivityStore } from '../../src/client/store/activity_store';
import { useGameStore } from '../../src/client/store/game_store';

describe('[TC-UI-ACT01/MSS] ActivityFeedSidebar Component Tests', () => {
  beforeEach(() => {
    useActivityStore.setState({
      activityLogs: [],
      isActivityFeedOpen: false,
      unreadCount: 0,
      activeFilter: 'all',
    });
    useGameStore.setState({
      roundNumber: 1,
      maxRounds: 30,
      turnTimeRemaining: 60,
      treasuryPool: 2000,
    });
  });

  it('Khi Sideboard dong: Drawer render voi class translate-x-full va aria-hidden=true khong bi xung dot pointer-events-auto', () => {
    const html = renderToStaticMarkup(
      React.createElement(ActivityFeedSidebar, { isOpen: false }),
    );
    expect(html).toContain('data-testid="activity-feed-sidebar"');
    expect(html).toContain('translate-x-full');
    expect(html).toContain('pointer-events-none');
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain('pointer-events-auto');
  });

  it('Khi Sideboard mo: Drawer render voi class translate-x-0 va aria-hidden=false', () => {
    const html = renderToStaticMarkup(
      React.createElement(ActivityFeedSidebar, { isOpen: true }),
    );
    expect(html).toContain('translate-x-0');
    expect(html).toContain('aria-hidden="false"');
    expect(html).toContain('Nhật Ký Ván Đấu');
    expect(html).toContain('data-testid="close-activity-feed"');
  });

  it('Hien thi day du cac filter chips: Tat Ca, Giao Dich, Nha Dat', () => {
    const html = renderToStaticMarkup(
      React.createElement(ActivityFeedSidebar, { isOpen: true }),
    );
    expect(html).toContain('data-testid="filter-all"');
    expect(html).toContain('data-testid="filter-money"');
    expect(html).toContain('data-testid="filter-property"');
    expect(html).toContain('Tất Cả');
    expect(html).toContain('Giao Dịch');
    expect(html).toContain('Nhà Đất');
  });

  it('Hien thi empty state khi danh sach log rong', () => {
    const html = renderToStaticMarkup(
      React.createElement(ActivityFeedSidebar, { isOpen: true, logs: [] }),
    );
    expect(html).toContain('Chưa có hoạt động nào được ghi nhận');
  });

  it('Loc chinh xac theo filter money va property', () => {
    const mockLogs = [
      {
        id: 'log_dice',
        timestamp: 1000,
        type: 'dice' as const,
        message: 'Đổ xúc xắc 7 điểm',
      },
      {
        id: 'log_rent',
        timestamp: 2000,
        type: 'rent' as const,
        message: 'Trả tiền thuê 500 Tr.',
        amount: -500,
      },
      {
        id: 'log_upgrade',
        timestamp: 3000,
        type: 'upgrade' as const,
        message: 'Nâng cấp lên C1',
        cellIndex: 1,
      },
    ];

    // Loc money: chi co log_rent
    let html = renderToStaticMarkup(
      React.createElement(ActivityFeedSidebar, {
        isOpen: true,
        logs: mockLogs,
        filter: 'money',
      }),
    );
    expect(html).toContain('Trả tiền thuê 500 Tr.');
    expect(html).not.toContain('Đổ xúc xắc 7 điểm');
    expect(html).not.toContain('Nâng cấp lên C1');

    // Loc property: chi co log_upgrade
    html = renderToStaticMarkup(
      React.createElement(ActivityFeedSidebar, {
        isOpen: true,
        logs: mockLogs,
        filter: 'property',
      }),
    );
    expect(html).toContain('Nâng cấp lên C1');
    expect(html).not.toContain('Đổ xúc xắc 7 điểm');
    expect(html).not.toContain('Trả tiền thuê 500 Tr.');

    // Loc all: ca 3 logs
    html = renderToStaticMarkup(
      React.createElement(ActivityFeedSidebar, {
        isOpen: true,
        logs: mockLogs,
        filter: 'all',
      }),
    );
    expect(html).toContain('Đổ xúc xắc 7 điểm');
    expect(html).toContain('Trả tiền thuê 500 Tr.');
    expect(html).toContain('Nâng cấp lên C1');
  });

  it('Dinh dang dung so tien bien dong: + Emerald khi duong, - Rose khi am', () => {
    const mockLogs = [
      {
        id: 'log_plus',
        timestamp: 1000,
        type: 'system' as const,
        message: 'Nhận thưởng',
        amount: 2000,
      },
      {
        id: 'log_minus',
        timestamp: 2000,
        type: 'tax' as const,
        message: 'Nộp phạt',
        amount: -500,
      },
    ];

    const html = renderToStaticMarkup(
      React.createElement(ActivityFeedSidebar, {
        isOpen: true,
        logs: mockLogs,
        filter: 'all',
      }),
    );
    expect(html).toContain('+2.000 Tr.');
    expect(html).toContain('text-emerald-400');
    expect(html).toContain('-500 Tr.');
    expect(html).toContain('text-rose-400');
  });
});

describe('[TC-UI-ACT02/MSS] TopBar Activity Feed Toggle & Badge Tests', () => {
  beforeEach(() => {
    useActivityStore.setState({
      activityLogs: [],
      isActivityFeedOpen: false,
      unreadCount: 0,
      activeFilter: 'all',
    });
    useGameStore.setState({
      roundNumber: 2,
      maxRounds: 30,
      turnTimeRemaining: 45,
      treasuryPool: 2500,
    });
  });

  it('TopBar render nut Nhat Ky thanh cong', () => {
    const html = renderToStaticMarkup(React.createElement(TopBar));
    expect(html).toContain('data-testid="activity-feed-toggle-button"');
    expect(html).toContain('Nhật Ký');
  });

  it('Khi unreadCount = 0, khong render unread badge', () => {
    const html = renderToStaticMarkup(
      React.createElement(TopBar, { unreadCount: 0 }),
    );
    expect(html).not.toContain('data-testid="activity-unread-badge"');
  });

  it('Khi unreadCount > 0, render unread badge voi so luong chinh xac', () => {
    let html = renderToStaticMarkup(
      React.createElement(TopBar, { unreadCount: 5 }),
    );
    expect(html).toContain('data-testid="activity-unread-badge"');
    expect(html).toContain('>5<');

    // Unread > 99 hien thi 99+
    html = renderToStaticMarkup(
      React.createElement(TopBar, { unreadCount: 150 }),
    );
    expect(html).toContain('>99+<');
  });

  it('handleActivityFeedKeyDown dong sideboard khi nhan phim Escape va bo qua cac phim khac', () => {
    let closed = false;
    const handledEscape = handleActivityFeedKeyDown({ key: 'Escape' }, (open) => {
      closed = !open;
    });
    expect(handledEscape).toBe(true);
    expect(closed).toBe(true);

    const handledEnter = handleActivityFeedKeyDown({ key: 'Enter' }, () => {
      throw new Error('Should not be called');
    });
    expect(handledEnter).toBe(false);
  });
});
