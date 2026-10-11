// [IMP-367] Contract Test Suite: Financial Narrative Clarity & Disambiguation
import { describe, it, expect, beforeEach } from 'vitest';
import { resolveTransactionNarrative } from '../../src/client/ui/transaction_narrative.js';
import {
  FloatingTextType,
  type FloatingTextItem,
  type PlayerHudInfo,
  useGameStore,
} from '../../src/client/store/game_store.js';
import { useVfxStore } from '../../src/client/store/vfx_store.js';
import { createBadgeEventSubscriber } from '../../src/client/events/subscribers/badge_event_subscriber.js';
import { SynthesizedGameEventType, type FeePaidEvent } from '../../src/client/events/game_event_types.js';
import type { PacingContext } from '../../src/client/events/pacing_context.js';
import type { GameEventContext } from '../../src/client/events/game_event_bus.js';

const mockPlayer: PlayerHudInfo = {
  id: 'bot_4',
  name: 'Bot AI 4',
  balance: 10020,
  tokenColor: '#22c55e',
  ownedProperties: [],
};

const mockPlayersInfo: Record<string, PlayerHudInfo> = {
  bot_4: mockPlayer,
};

const synchronousPacing: PacingContext = {
  getPawnLandingDelay: () => 0,
  getPawnPassGoDelay: () => 0,
  scheduleAction: (action) => {
    action();
    return null;
  },
  clearPendingTimers: () => {},
};

describe('Station 1 (RED): Financial Narrative Clarity & Disambiguation [IMP-367]', () => {
  beforeEach(() => {
    useGameStore.setState({
      floatingTexts: [],
      playersInfo: mockPlayersInfo,
    });
    useVfxStore.setState({ activePawnReactions: {} });
  });

  it('[TC-367.01/MSS][UC-IMP367] Lệ Phí Đất Đai (Ô 04): resolveTransactionNarrative actionType tax at cell 4 formats target as "Lệ Phí Đất (Ô 04) ➔ Kho Bạc"', () => {
    const item: FloatingTextItem = {
      id: 'tax-cell-4',
      text: '-1.002',
      type: FloatingTextType.Penalty,
      playerId: 'bot_4',
      actionType: 'tax',
      cellIndex: 4,
      title: 'Lệ Phí Đất Đai ➔ Kho Bạc',
      timestamp: Date.now(),
    };

    const narrative = resolveTransactionNarrative(item, mockPlayer, mockPlayersInfo, 'human_1');
    expect(narrative.category).toBe('KHO BẠC NHÀ NƯỚC');
    expect(narrative.icon).toBe('🏛️');
    expect(narrative.verb).toBe('nộp');
    expect(narrative.target).toBe('Lệ Phí Đất (Ô 04) ➔ Kho Bạc');
  });

  it('[TC-367.02/MSS][UC-IMP367] Bảo Lãnh Kiểm Toán (Ô 10): resolveTransactionNarrative actionType bail formats target as "bảo lãnh Kiểm Toán (Ô 10) ➔ Kho Bạc"', () => {
    const item: FloatingTextItem = {
      id: 'bail-cell-10',
      text: '-500',
      type: FloatingTextType.Penalty,
      playerId: 'bot_4',
      actionType: 'bail',
      cellIndex: 10,
      title: 'Bảo lãnh kiểm toán (Ô 10) ➔ Nộp Kho Bạc',
      timestamp: Date.now(),
    };

    const narrative = resolveTransactionNarrative(item, mockPlayer, mockPlayersInfo, 'human_1');
    expect(narrative.category).toBe('BẢO LÃNH KIỂM TOÁN');
    expect(narrative.icon).toBe('🚨');
    expect(narrative.verb).toBe('nộp');
    expect(narrative.target).toBe('bảo lãnh Trạm Kiểm Toán (Ô 10)');
  });

  it('[TC-367.03/MSS][UC-IMP367] Thắng Đấu Giá BĐS: resolveTransactionNarrative actionType auction_win formats target with property name', () => {
    const item: FloatingTextItem = {
      id: 'auction-win-can-tho',
      text: '-3.500',
      type: FloatingTextType.Penalty,
      playerId: 'bot_4',
      actionType: 'auction_win',
      cellIndex: 3,
      title: 'Thắng đấu giá Cần Thơ ➔ Nộp Kho Bạc',
      timestamp: Date.now(),
    };

    const narrative = resolveTransactionNarrative(item, mockPlayer, mockPlayersInfo, 'human_1');
    expect(narrative.category).toBe('ĐẤU GIÁ BẤT ĐỘNG SẢN');
    expect(narrative.verb).toBe('thanh toán');
    expect(narrative.target).toBe('tiền trúng đấu giá Cần Thơ');
  });

  it('[TC-367.04/MSS][UC-IMP367] Thế Chấp Ngân Hàng: resolveTransactionNarrative actionType mortgage formats target with mortgaged property name', () => {
    const item: FloatingTextItem = {
      id: 'mortgage-can-tho',
      text: '+1.000',
      type: FloatingTextType.Reward,
      playerId: 'bot_4',
      actionType: 'mortgage',
      cellIndex: 3,
      title: 'Thế chấp Bến Bạch Đằng ➔ Vay Ngân Hàng',
      timestamp: Date.now(),
    };

    const narrative = resolveTransactionNarrative(item, mockPlayer, mockPlayersInfo, 'human_1');
    expect(narrative.category).toBe('TÍN DỤNG NGÂN HÀNG');
    expect(narrative.verb).toBe('vay');
    expect(narrative.target).toBe('thế chấp Bến Bạch Đằng từ Ngân Hàng');
  });

  it('[TC-367.05/MSS][UC-IMP367] Thuế Tài Sản Qua GO: resolveTransactionNarrative actionType tax with GO property tax formats target clearly', () => {
    const item: FloatingTextItem = {
      id: 'tax-go-property',
      text: '-750',
      type: FloatingTextType.Penalty,
      playerId: 'bot_4',
      actionType: 'tax',
      title: 'Nộp Thuế Tài Sản Qua GO ➔ Kho Bạc',
      timestamp: Date.now(),
    };

    const narrative = resolveTransactionNarrative(item, mockPlayer, mockPlayersInfo, 'human_1');
    expect(narrative.category).toBe('KHO BẠC NHÀ NƯỚC');
    expect(narrative.verb).toBe('nộp');
    expect(narrative.target).toBe('thuế tài sản qua GO ➔ Kho Bạc');
  });

  it('[TC-367.06/MSS][UC-IMP367] Formula Lệ Phí Đất Đai Ô 04: badge_event_subscriber emits legal formula for LAND_TAX', () => {
    const subscriber = createBadgeEventSubscriber(useGameStore, synchronousPacing, useVfxStore);
    const event: FeePaidEvent = {
      type: SynthesizedGameEventType.FEE_PAID,
      timestamp: Date.now(),
      payerId: 'bot_4',
      feeType: 'LAND_TAX',
      amount: 1002,
      cellIndex: 4,
    };

    const mockContext: GameEventContext = {
      prevState: useGameStore.getState(),
      nextState: useGameStore.getState(),
      delta: { roomCode: 'ROOM_TEST', tick: 1, players: [], cells: [] },
    };

    subscriber([event], mockContext);

    const texts = useGameStore.getState().floatingTexts;
    expect(texts.length).toBe(1);
    expect(texts[0]!.title).toBe('Lệ Phí Đất Đai ➔ Kho Bạc');
    expect(texts[0]!.formula).toBe('Lệ phí trước bạ: 10% tiền mặt (Tối đa 2.000 Tr.)');
  });
});
