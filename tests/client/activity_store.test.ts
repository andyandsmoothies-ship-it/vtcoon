// [TC-UI06.1/MSS] Test Suite ActivityStore — FIFO 50 limits, unread counter & filter states
import { describe, it, expect, beforeEach } from 'vitest';
import { useActivityStore, MAX_ACTIVITY_LOGS } from '../../src/client/store/activity_store';

describe('[TC-ACT01/MSS] ActivityStore Tests', () => {
  beforeEach(() => {
    useActivityStore.setState({
      activityLogs: [],
      isActivityFeedOpen: false,
      unreadCount: 0,
      activeFilter: 'all',
    });
  });

  it('Khoi tao mac dinh dung trang thai rong, feed dong, unread 0', () => {
    const state = useActivityStore.getState();
    expect(state.activityLogs).toHaveLength(0);
    expect(state.isActivityFeedOpen).toBe(false);
    expect(state.unreadCount).toBe(0);
    expect(state.activeFilter).toBe('all');
  });

  it('Them 1 log khi feed dong se tang unreadCount len 1', () => {
    useActivityStore.getState().addActivityLog({
      type: 'dice',
      message: 'Player 1 gieo 3 + 4 = 7 diem',
      playerId: 'p1',
    });

    const state = useActivityStore.getState();
    expect(state.activityLogs).toHaveLength(1);
    expect(state.activityLogs[0]?.message).toBe('Player 1 gieo 3 + 4 = 7 diem');
    expect(state.unreadCount).toBe(1);
  });

  it('Them log khi feed dang mo thi unreadCount luon giu o muc 0', () => {
    useActivityStore.getState().setOpen(true);
    expect(useActivityStore.getState().isActivityFeedOpen).toBe(true);

    useActivityStore.getState().addActivityLog({
      type: 'move',
      message: 'Player 1 di den Cho Ben Thanh',
      playerId: 'p1',
    });

    const state = useActivityStore.getState();
    expect(state.activityLogs).toHaveLength(1);
    expect(state.unreadCount).toBe(0);
  });

  it('Mo sidebar bang setOpen(true) hoac toggleOpen() se reset unreadCount ve 0', () => {
    useActivityStore.getState().addActivityLog({ type: 'dice', message: 'Log 1' });
    useActivityStore.getState().addActivityLog({ type: 'dice', message: 'Log 2' });
    expect(useActivityStore.getState().unreadCount).toBe(2);

    useActivityStore.getState().toggleOpen();
    expect(useActivityStore.getState().isActivityFeedOpen).toBe(true);
    expect(useActivityStore.getState().unreadCount).toBe(0);

    // Dong lai va them log
    useActivityStore.getState().toggleOpen();
    expect(useActivityStore.getState().isActivityFeedOpen).toBe(false);
    useActivityStore.getState().addActivityLog({ type: 'dice', message: 'Log 3' });
    expect(useActivityStore.getState().unreadCount).toBe(1);

    // Mo lai bang setOpen
    useActivityStore.getState().setOpen(true);
    expect(useActivityStore.getState().unreadCount).toBe(0);
  });

  it('[Adversarial FIFO] Them 60 log vuot tran 50 se tu dong cat bo 10 log cu nhat', () => {
    for (let i = 1; i <= 60; i++) {
      useActivityStore.getState().addActivityLog({
        id: `log_${i}`,
        type: 'move',
        message: `Hanh dong thu ${i}`,
      });
    }

    const logs = useActivityStore.getState().activityLogs;
    expect(logs).toHaveLength(MAX_ACTIVITY_LOGS);
    // Phan tu dau tien phai la phan tu thu 11 (cac phan tu 1..10 da bi eviction)
    expect(logs[0]?.id).toBe('log_11');
    expect(logs[0]?.message).toBe('Hanh dong thu 11');
    // Phan tu cuoi cung phai la phan tu thu 60
    expect(logs[49]?.id).toBe('log_60');
    expect(logs[49]?.message).toBe('Hanh dong thu 60');
  });

  it('Chuyen doi filter qua setFilter cap nhat activeFilter dung dan', () => {
    useActivityStore.getState().setFilter('money');
    expect(useActivityStore.getState().activeFilter).toBe('money');

    useActivityStore.getState().setFilter('property');
    expect(useActivityStore.getState().activeFilter).toBe('property');

    useActivityStore.getState().setFilter('all');
    expect(useActivityStore.getState().activeFilter).toBe('all');
  });

  it('clearLogs xoa sach activityLogs va reset unreadCount', () => {
    useActivityStore.getState().addActivityLog({ type: 'dice', message: 'Log 1' });
    useActivityStore.getState().addActivityLog({ type: 'dice', message: 'Log 2' });
    expect(useActivityStore.getState().activityLogs).toHaveLength(2);

    useActivityStore.getState().clearLogs();
    const state = useActivityStore.getState();
    expect(state.activityLogs).toHaveLength(0);
    expect(state.unreadCount).toBe(0);
  });
});
