// [IMP-369] Contract Test Suite: Activity Feed Financial Narrative & Timestamp Hardening
import { describe, it, expect, beforeEach } from 'vitest';
import { mapEventToActivityLog } from '../../src/client/events/subscribers/activity_log_subscriber.js';
import { formatGoSalaryDeductionSuffix } from '../../src/client/events/subscribers/activity_log_financial_formatter.js';
import { createBadgeEventSubscriber } from '../../src/client/events/subscribers/badge_event_subscriber.js';
import { getActivityIcon } from '../../src/client/ui/activity_feed_sidebar.js';
import {
  SynthesizedGameEventType,
  type FeePaidEvent,
} from '../../src/client/events/game_event_types.js';
import type { GameEventContext } from '../../src/client/events/game_event_bus.js';
import { useGameStore, FloatingTextType } from '../../src/client/store/game_store.js';
import { useActivityStore } from '../../src/client/store/activity_store.js';
import { useVfxStore } from '../../src/client/store/vfx_store.js';

function createMockContext(overrides?: Partial<GameEventContext['delta']>): GameEventContext {
  return {
    prevState: {
      ...useGameStore.getState(),
      playersInfo: {
        p1: { id: 'p1', name: 'Breezy Badger', balance: 4484, tokenColor: '#3b82f6', ownedProperties: [] },
        bot_2: { id: 'bot_2', name: 'Bot AI 2', balance: 14546, tokenColor: '#f97316', ownedProperties: [28] },
        bot_4: { id: 'bot_4', name: 'Bot AI 4 (Aggressive)', balance: 725, tokenColor: '#22c55e', ownedProperties: [37] },
      },
    },
    nextState: {
      ...useGameStore.getState(),
      playersInfo: {
        p1: { id: 'p1', name: 'Breezy Badger', balance: 4334, tokenColor: '#3b82f6', ownedProperties: [] },
        bot_2: { id: 'bot_2', name: 'Bot AI 2', balance: 14696, tokenColor: '#f97316', ownedProperties: [28] },
        bot_4: { id: 'bot_4', name: 'Bot AI 4 (Aggressive)', balance: 525, tokenColor: '#22c55e', ownedProperties: [37] },
      },
    },
    delta: {
      roomCode: 'VT11K6',
      tick: 294,
      cells: [],
      players: [],
      ...overrides,
    },
  };
}

describe('Station 1 (RED): Activity Feed Financial Narrative & Timestamp Hardening [IMP-369]', () => {
  beforeEach(() => {
    useActivityStore.setState({ activityLogs: [] });
    useGameStore.setState({
      floatingTexts: [],
      playersInfo: {
        p1: { id: 'p1', name: 'Breezy Badger', balance: 4484, tokenColor: '#3b82f6', ownedProperties: [] },
        bot_2: { id: 'bot_2', name: 'Bot AI 2', balance: 14546, tokenColor: '#f97316', ownedProperties: [28] },
        bot_4: { id: 'bot_4', name: 'Bot AI 4 (Aggressive)', balance: 725, tokenColor: '#22c55e', ownedProperties: [37] },
      },
    });
    useVfxStore.setState({ activePawnReactions: {} });
  });

  it('[TC-369.01/MSS][UC-IMP369] TELECOM_DATA fee paid formats natural Vietnamese message and assigns utility type', () => {
    const context = createMockContext();
    const event: FeePaidEvent = {
      type: SynthesizedGameEventType.FEE_PAID,
      timestamp: Date.now(),
      payerId: 'p1',
      receiverId: 'bot_2',
      feeType: 'TELECOM_DATA',
      amount: 150,
      cellIndex: 28,
    };

    const log = mapEventToActivityLog(event, context);
    expect(log).not.toBeNull();
    expect(log?.type).toBe('utility');
    expect(log?.message).toContain('cước viễn thông cho Bot AI 2 (Viettel Post)');
    expect(log?.amount).toBe(-150);
  });

  it('[TC-369.02/MSS][UC-IMP369] LAND_TAX fee paid at cell 4 formats natural message with cell 4 and tax type', () => {
    const context = createMockContext();
    const event: FeePaidEvent = {
      type: SynthesizedGameEventType.FEE_PAID,
      timestamp: Date.now(),
      payerId: 'bot_4',
      feeType: 'LAND_TAX',
      amount: 1002,
      cellIndex: 4,
    };

    const log = mapEventToActivityLog(event, context);
    expect(log).not.toBeNull();
    expect(log?.type).toBe('tax');
    expect(log?.message).toContain('Lệ Phí Đất (Ô 04) vào Kho Bạc');
    expect(log?.amount).toBe(-1002);
  });

  it('[TC-369.03/MSS][UC-IMP369] BAIL fee paid at cell 10 formats natural message with bail cell 10 and bail type', () => {
    const context = createMockContext();
    const event: FeePaidEvent = {
      type: SynthesizedGameEventType.FEE_PAID,
      timestamp: Date.now(),
      payerId: 'bot_4',
      feeType: 'BAIL',
      amount: 500,
      cellIndex: 10,
    };

    const log = mapEventToActivityLog(event, context);
    expect(log).not.toBeNull();
    expect(log?.type).toBe('bail');
    expect(log?.message).toContain('bảo lãnh Kiểm Toán (Ô 10) vào Kho Bạc');
    expect(log?.amount).toBe(-500);
  });

  it('[TC-369.04/A1][UC-IMP369] Event Card penalty TAX formats event title and tax type', () => {
    const context = createMockContext({
      lastEventCard: {
        id: 'MC_FIRE_INSPECTION',
        type: 'Market',
        cardType: 'market',
        cardId: 'MC_FIRE_INSPECTION',
        title: 'Tổng Thanh Tra PCCC',
        description: 'Phạt 200/nhà C1',
        targetScope: 'Công trình C1-C3',
        effectDetail: 'Phạt 200/nhà C1',
        duration: 'Tức thì',
        destination: 'Kho Bạc Nhà Nước',
      },
    });
    const event: FeePaidEvent = {
      type: SynthesizedGameEventType.FEE_PAID,
      timestamp: Date.now(),
      payerId: 'bot_4',
      feeType: 'TAX',
      amount: 200,
    };

    const log = mapEventToActivityLog(event, context);
    expect(log).not.toBeNull();
    expect(log?.type).toBe('tax');
    expect(log?.message).toContain('nộp phạt 200 (Tổng Thanh Tra PCCC) vào Kho Bạc');
    expect(log?.amount).toBe(-200);
  });

  it('[TC-369.05/A2][UC-IMP369] Generic TAX without event card fallback formats clear tax message with tax type', () => {
    const context = createMockContext({ lastEventCard: null });
    const event: FeePaidEvent = {
      type: SynthesizedGameEventType.FEE_PAID,
      timestamp: Date.now(),
      payerId: 'bot_4',
      feeType: 'TAX',
      amount: 200,
    };

    const log = mapEventToActivityLog(event, context);
    expect(log).not.toBeNull();
    expect(log?.type).toBe('tax');
    expect(log?.message).toContain('thuế/phạt vào Kho Bạc Nhà Nước');
    expect(log?.amount).toBe(-200);
  });

  it('[TC-369.06/MSS][UC-IMP369] Activity Feed Sidebar icon and filter parity for bail, utility, trade, unmortgage, and hose', () => {
    expect(getActivityIcon('bail')).toBe('🚨');
    expect(getActivityIcon('utility')).toBe('📡');
    expect(getActivityIcon('trade')).toBe('🤝');
    expect(getActivityIcon('unmortgage')).toBe('📑');
  });

  it('[TC-369.07/A3][UC-IMP369] Event timestamp defaults to Date.now() when missing or zero preventing 08:00:00 display', () => {
    const context = createMockContext();
    const event: FeePaidEvent = {
      type: SynthesizedGameEventType.FEE_PAID,
      timestamp: 0,
      payerId: 'p1',
      feeType: 'LAND_TAX',
      amount: 1002,
      cellIndex: 4,
    };

    const nowBefore = Date.now();
    const log = mapEventToActivityLog(event, context);
    expect(log).not.toBeNull();
    expect(log!.timestamp).toBeGreaterThanOrEqual(nowBefore);
  });

  it('[TC-369.08/A4][UC-IMP369] Positive reward event card does NOT misattribute card title to fine log', () => {
    const context = createMockContext({
      lastEventCard: {
        id: 'CC_STOCK_PROFIT',
        type: 'Chance',
        title: 'Chốt Lời Cổ Phiếu',
        description: 'Nhận 2.500 tiền mặt',
        effectDelta: 2500,
      },
    });
    const event: FeePaidEvent = {
      type: SynthesizedGameEventType.FEE_PAID,
      timestamp: Date.now(),
      payerId: 'bot_4',
      feeType: 'TAX',
      amount: 200,
    };

    const log = mapEventToActivityLog(event, context);
    expect(log).not.toBeNull();
    expect(log?.type).toBe('tax');
    expect(log?.message).not.toContain('Chốt Lời Cổ Phiếu');
    expect(log?.message).toContain('thuế/phạt vào Kho Bạc Nhà Nước');
  });

  it('[TC-369.09/A5][UC-IMP369] Card targeted to another player does NOT misattribute to payer fee log', () => {
    const context = createMockContext({
      lastEventCard: {
        id: 'CC_PLATE_AUCTION',
        type: 'Chance',
        title: 'Đấu Giá Biển Số',
        description: 'Nộp 500 lệ phí',
        effectDelta: -500,
        drawnBy: 'p1',
      },
    });
    const event: FeePaidEvent = {
      type: SynthesizedGameEventType.FEE_PAID,
      timestamp: Date.now(),
      payerId: 'bot_4',
      feeType: 'TAX',
      amount: 200,
    };

    const log = mapEventToActivityLog(event, context);
    expect(log).not.toBeNull();
    expect(log?.type).toBe('tax');
    expect(log?.message).not.toContain('Đấu Giá Biển Số');
    expect(log?.message).toContain('thuế/phạt vào Kho Bạc Nhà Nước');
  });

  it('[TC-369.10/MSS][UC-IMP369] formatGoSalaryDeductionSuffix formats all 4 deductions itemized correctly', () => {
    const fullSuffix = formatGoSalaryDeductionSuffix({
      propertyTax: 1000,
      mortgageInterest: 150,
      overdraft: 3300,
      creditFee: 400,
    });
    expect(fullSuffix).toBe(' (khấu trừ: thuế 1.000, lãi thế chấp 150, thấu chi 3.300, phí thẻ 400)');

    const emptySuffix = formatGoSalaryDeductionSuffix({});
    expect(emptySuffix).toBe('');

    const fallbackSuffix = formatGoSalaryDeductionSuffix(undefined, 500);
    expect(fallbackSuffix).toBe(' (khấu trừ: thuế 500)');
  });

  it('[TC-369.11/MSS][UC-IMP369] Badge subscriber emits utility actionType and Viettel Post for TELECOM_DATA fee', () => {
    const context = createMockContext();
    const subscriber = createBadgeEventSubscriber(useGameStore, {
      getPawnLandingDelay: () => 0,
      getPawnPassGoDelay: () => 0,
      scheduleAction: (fn) => { fn(); return null; },
      clearPendingTimers: () => {},
    }, useVfxStore);

    const event: FeePaidEvent = {
      type: SynthesizedGameEventType.FEE_PAID,
      timestamp: Date.now(),
      payerId: 'p1',
      receiverId: 'bot_2',
      feeType: 'TELECOM_DATA',
      amount: 150,
      cellIndex: 28,
    };

    subscriber([event], context);

    const badges = useGameStore.getState().floatingTexts;
    const badge = badges.find((b) => b.playerId === 'p1');
    expect(badge).toBeDefined();
    expect(badge?.actionType).toBe('utility');
    expect(badge?.title).toContain('Cước Viễn Thông cho Bot AI 2 (Viettel Post)');
    expect(badge?.formula).toContain('cước data cho Bot AI 2');
  });
});
