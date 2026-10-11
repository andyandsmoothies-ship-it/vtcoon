// [IMP-368] Contract Test Suite: Go Salary Multi-Deduction Narrative Transparency
import { describe, it, expect, beforeEach } from 'vitest';
import { createActivityLogSubscriber } from '../../src/client/events/subscribers/activity_log_subscriber.js';
import { createBadgeEventSubscriber } from '../../src/client/events/subscribers/badge_event_subscriber.js';
import { useActivityStore } from '../../src/client/store/activity_store.js';
import { useGameStore, FloatingTextType } from '../../src/client/store/game_store.js';
import { useVfxStore } from '../../src/client/store/vfx_store.js';
import {
  SynthesizedGameEventType,
  type GoSalaryEvent,
} from '../../src/client/events/game_event_types.js';
import type { GameEventContext } from '../../src/client/events/game_event_bus.js';
import type { PacingContext } from '../../src/client/events/pacing_context.js';

const synchronousPacing: PacingContext = {
  getPawnLandingDelay: () => 0,
  getPawnPassGoDelay: () => 0,
  scheduleAction: (action) => {
    action();
    return null;
  },
  clearPendingTimers: () => {},
};

function createMockContext(): GameEventContext {
  return {
    prevState: {
      ...useGameStore.getState(),
      playersInfo: {
        player_1: {
          id: 'player_1',
          name: 'Breezy Badger',
          balance: 10000,
          tokenColor: '#3b82f6',
          ownedProperties: [],
        },
      },
    },
    nextState: useGameStore.getState(),
    delta: { roomCode: 'ROOM_TEST', tick: 1, players: [], cells: [] },
  };
}

describe('Station 1 (RED): Go Salary Multi-Deduction Narrative Transparency [IMP-368]', () => {
  beforeEach(() => {
    useActivityStore.setState({ activityLogs: [] });
    useGameStore.setState({
      floatingTexts: [],
      playersInfo: {
        player_1: {
          id: 'player_1',
          name: 'Breezy Badger',
          balance: 10000,
          tokenColor: '#3b82f6',
          ownedProperties: [],
        },
      },
    });
    useVfxStore.setState({ activePawnReactions: {} });
  });

  it('[TC-368.01/MSS][UC-IMP368] Multi-Deduction Log: GO_SALARY với thuế và lãi thế chấp sinh dòng nhật ký itemized đầy đủ', () => {
    const subscriber = createActivityLogSubscriber(useActivityStore);
    const event: GoSalaryEvent = {
      type: SynthesizedGameEventType.GO_SALARY,
      playerId: 'player_1',
      grossSalary: 1500,
      taxDeduction: 1000,
      deductions: {
        propertyTax: 1000,
        mortgageInterest: 75,
      },
      netAmount: 425,
      timestamp: 1000,
    };

    subscriber([event], createMockContext());

    const logs = useActivityStore.getState().activityLogs;
    expect(logs.length).toBe(1);
    expect(logs[0]?.message).toBe('Breezy Badger nhận lương vượt GO 1.500 (khấu trừ: thuế 1.000, lãi thế chấp 75)');
    expect(logs[0]?.amount).toBe(425);
  });

  it('[TC-368.02/MSS][UC-IMP368] Tax-Only Log: GO_SALARY chỉ có khấu trừ thuế sinh dòng nhật ký chuẩn', () => {
    const subscriber = createActivityLogSubscriber(useActivityStore);
    const event: GoSalaryEvent = {
      type: SynthesizedGameEventType.GO_SALARY,
      playerId: 'player_1',
      grossSalary: 2000,
      taxDeduction: 1000,
      deductions: {
        propertyTax: 1000,
      },
      netAmount: 1000,
      timestamp: 1001,
    };

    subscriber([event], createMockContext());

    const logs = useActivityStore.getState().activityLogs;
    expect(logs.length).toBe(1);
    expect(logs[0]?.message).toBe('Breezy Badger nhận lương vượt GO 2.000 (khấu trừ: thuế 1.000)');
    expect(logs[0]?.amount).toBe(1000);
  });

  it('[TC-368.03/MSS][UC-IMP368] Zero-Deduction Log: GO_SALARY không khấu trừ sinh câu nhận lương trọn vẹn', () => {
    const subscriber = createActivityLogSubscriber(useActivityStore);
    const event: GoSalaryEvent = {
      type: SynthesizedGameEventType.GO_SALARY,
      playerId: 'player_1',
      grossSalary: 2000,
      taxDeduction: 0,
      netAmount: 2000,
      timestamp: 1002,
    };

    subscriber([event], createMockContext());

    const logs = useActivityStore.getState().activityLogs;
    expect(logs.length).toBe(1);
    expect(logs[0]?.message).toBe('Breezy Badger nhận lương vượt GO 2.000');
    expect(logs[0]?.amount).toBe(2000);
  });

  it('[TC-368.04/MSS][UC-IMP368] Multi-Deduction Badge Formula: Badge formula hiển thị chi tiết các khoản trừ thuế và lãi thế chấp', () => {
    const subscriber = createBadgeEventSubscriber(useGameStore, synchronousPacing, useVfxStore);
    const event: GoSalaryEvent = {
      type: SynthesizedGameEventType.GO_SALARY,
      playerId: 'player_1',
      grossSalary: 1500,
      taxDeduction: 1000,
      deductions: {
        propertyTax: 1000,
        mortgageInterest: 75,
      },
      netAmount: 425,
      timestamp: 1003,
    };

    subscriber([event], createMockContext());

    const badges = useGameStore.getState().floatingTexts;
    expect(badges.length).toBe(1);
    expect(badges[0]?.type).toBe(FloatingTextType.Reward);
    expect(badges[0]?.text).toBe('+425');
    expect(badges[0]?.formula).toBe('Hoàn thành 1 vòng sa bàn (+1.500 Tr.) (thuế: -1.000, lãi thế chấp: -75)');
  });

  it('[TC-368.05/MSS][UC-IMP368] Overdraft & Credit Card Deductions: GO_SALARY phản ánh phí thấu chi và phí thường niên thẻ', () => {
    const subscriber = createActivityLogSubscriber(useActivityStore);
    const event: GoSalaryEvent = {
      type: SynthesizedGameEventType.GO_SALARY,
      playerId: 'player_1',
      grossSalary: 2000,
      taxDeduction: 0,
      deductions: {
        overdraft: 3300,
        creditFee: 400,
      },
      netAmount: -1700,
      timestamp: 1004,
    };

    subscriber([event], createMockContext());

    const logs = useActivityStore.getState().activityLogs;
    expect(logs.length).toBe(1);
    expect(logs[0]?.message).toBe('Breezy Badger nhận lương vượt GO 2.000 (khấu trừ: thấu chi 3.300, phí thẻ 400)');
    expect(logs[0]?.amount).toBe(-1700);
  });
});
