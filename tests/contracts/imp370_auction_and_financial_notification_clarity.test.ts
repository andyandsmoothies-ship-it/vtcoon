import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  resolveTransactionNarrative,
  resolveFriendlyReason,
  extractCleanAmount,
} from '../../src/client/ui/transaction_narrative.js';
import { resolveFormulaText } from '../../src/client/ui/transaction_formula.js';
import { FloatingBadge } from '../../src/client/ui/floating_numbers.js';
import {
  FloatingTextType,
  type FloatingTextItem,
  type PlayerHudInfo,
  useGameStore,
} from '../../src/client/store/game_store.js';
import { dispatchActivityFloatingBadges } from '../../src/client/network/activity_badge_dispatcher.js';
import { handleMarketBadges, handlePropertyBadges } from '../../src/client/events/subscribers/property_market_badge_handler.js';
import { createDefaultPacingContext } from '../../src/client/events/pacing_context.js';
import { deduplicateFloatingTexts } from '../../src/client/ui/notification_deduplicator.js';
import { getCardCtaButtonText } from '../../src/client/ui/modals/event_card_visuals.js';
import { MarketCardId } from '../../src/domain/event_card_types.js';
import { SynthesizedGameEventType, type SynthesizedGameEvent } from '../../src/client/events/game_event_types.js';
import { useVfxStore } from '../../src/client/store/vfx_store.js';
import type { ActivityLogEntry } from '../../src/client/store/activity_store.js';
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

describe('[CONTRACT] IMP-370: Disambiguate Auction Win & Unmortgage Notifications From Treasury Artifacts', () => {
  it('[TC-370.01/MSS][UC-IMP370] Given floating text item with actionType auction_win, When resolveTransactionNarrative is executed, Then returns narrative verb "thanh toán" and target without "Kho Bạc"', () => {
    const item: FloatingTextItem = {
      id: 'auc-win-1',
      text: '-2.350',
      type: FloatingTextType.Penalty,
      playerId: 'bot_4',
      actionType: 'auction_win',
      cellIndex: 3,
      title: 'Thắng đấu giá Cần Thơ',
      timestamp: Date.now(),
    };

    const narrative = resolveTransactionNarrative(item, mockPlayer, mockPlayersInfo, 'human_1');
    expect(narrative.verb).toBe('thanh toán');
    expect(narrative.target).toBe('tiền trúng đấu giá Cần Thơ');
    expect(narrative.target).not.toContain('Kho Bạc');
  });

  it('[TC-370.02/MSS][UC-IMP370] Given floating text item with text "-2.350", When rendered in FloatingBadge, Then amount pill displays clean positive string "2.350" without negative sign', () => {
    useGameStore.setState({ playersInfo: mockPlayersInfo });
    const item: FloatingTextItem = {
      id: 'auc-win-pill',
      text: '-2.350',
      type: FloatingTextType.Penalty,
      playerId: 'bot_4',
      actionType: 'auction_win',
      cellIndex: 3,
      title: 'Thắng đấu giá Cần Thơ',
      timestamp: Date.now(),
    };
    const html = renderToStaticMarkup(React.createElement(FloatingBadge, { item }));
    expect(html).toContain('data-testid="floating-amount-pill"');
    expect(html).toContain('>2.350</span>');
    expect(html).not.toContain('>-2.350</span>');
  });

  it('[TC-370.03/MSS][UC-IMP370] Given floating text item with actionType unmortgage, When resolveTransactionNarrative is executed, Then returns detail containing "Ngân Hàng" and not "Kho Bạc"', () => {
    const item: FloatingTextItem = {
      id: 'unmortgage-1',
      text: '-1.100',
      type: FloatingTextType.Penalty,
      playerId: 'bot_4',
      actionType: 'unmortgage',
      cellIndex: 3,
      timestamp: Date.now(),
    };

    const narrative = resolveTransactionNarrative(item, mockPlayer, mockPlayersInfo, 'human_1');
    expect(narrative.detail).toBe('(Phí 10% ➔ Ngân Hàng)');
    expect(narrative.detail).not.toContain('Kho Bạc');
  });

  it('[TC-370.04/MSS][UC-IMP370] Given floating text item with actionType unmortgage, When resolveFormulaText is executed, Then returns formula pointing to Ngân Hàng instead of Kho Bạc', () => {
    const item: FloatingTextItem = {
      id: 'unmortgage-formula',
      text: '-1.100',
      type: FloatingTextType.Penalty,
      playerId: 'bot_4',
      actionType: 'unmortgage',
      cellIndex: 3,
      timestamp: Date.now(),
    };

    const formula = resolveFormulaText(item, 'Bến Bạch Đằng', false);
    expect(formula).toBe('Chuộc lại đất thế chấp (Gốc + 10% phí giải chấp Ngân Hàng)');
    expect(formula).not.toContain('Kho Bạc');
  });

  it('[TC-370.05/MSS][UC-IMP370] Given floating text item with actionType bail, When resolveTransactionNarrative is executed, Then returns target without "Kho Bạc"', () => {
    const item: FloatingTextItem = {
      id: 'bail-1',
      text: '-500',
      type: FloatingTextType.Penalty,
      playerId: 'bot_4',
      actionType: 'bail',
      cellIndex: 10,
      timestamp: Date.now(),
    };

    const narrative = resolveTransactionNarrative(item, mockPlayer, mockPlayersInfo, 'human_1');
    expect(narrative.target).toBe('bảo lãnh Trạm Kiểm Toán (Ô 10)');
    expect(narrative.target).not.toContain('Kho Bạc');
  });

  it('[TC-370.06/MSS][UC-IMP370] Given floating text item with actionType auction_win, When resolveFriendlyReason is executed, Then returns friendly title without "Kho Bạc"', () => {
    const item: FloatingTextItem = {
      id: 'auc-win-friendly',
      text: '-2.350',
      type: FloatingTextType.Penalty,
      playerId: 'bot_4',
      actionType: 'auction_win',
      title: 'Thắng đấu giá Cần Thơ ➔ Nộp Kho Bạc',
      timestamp: Date.now(),
    };

    const friendly = resolveFriendlyReason(item, mockPlayer);
    expect(friendly).toBe('Thắng đấu giá Cần Thơ');
    expect(friendly).not.toContain('Kho Bạc');
  });

  it('[TC-370.07/MSS][UC-IMP370] Given activity log entry with auction_win, When dispatchActivityFloatingBadges is executed, Then floating text title omits Kho Bạc and sets groupId', () => {
    useGameStore.setState({ floatingTexts: [] });
    const act: ActivityLogEntry = {
      id: 'auction_win_act_1',
      timestamp: Date.now(),
      type: 'auction',
      playerId: 'bot_4',
      playerName: 'Bot AI 4',
      message: 'trúng đấu giá Bến Bạch Đằng với giá 2.350',
      cellIndex: 3,
      amount: -2350,
    };
    dispatchActivityFloatingBadges([act], useGameStore.getState());
    const texts = useGameStore.getState().floatingTexts;
    expect(texts.length).toBe(1);
    expect(texts[0]?.title).toBe('Thắng đấu giá An Giang (Châu Đốc)');
    expect(texts[0]?.title).not.toContain('Kho Bạc');
    expect(texts[0]?.groupId).toBe('auction_win_3');
  });

  it('[TC-370.08/MSS][UC-IMP370] Given synthesized event AUCTION_WON, When property market badge handler processes it, Then floating text title omits Kho Bạc and sets groupId', () => {
    useGameStore.setState({ floatingTexts: [] });
    const event: SynthesizedGameEvent = {
      type: SynthesizedGameEventType.AUCTION_WON,
      timestamp: Date.now(),
      cellIndex: 3,
      winnerId: 'bot_4',
      winningBid: 2350,
    };
    const mockContext: GameEventContext = {
      prevState: useGameStore.getState(),
      nextState: useGameStore.getState(),
      delta: { tick: 1, cells: [] },
    };
    handleMarketBadges(event, mockContext, useGameStore.getState(), useVfxStore);
    const texts = useGameStore.getState().floatingTexts;
    expect(texts.length).toBe(1);
    expect(texts[0]?.title).toBe('Thắng đấu giá An Giang (Châu Đốc)');
    expect(texts[0]?.title).not.toContain('Kho Bạc');
    expect(texts[0]?.groupId).toBe('auction_win_3');
  });

  it('[TC-370.09/MSS][UC-IMP370] Given multiple auction win items with same groupId, When deduplicateFloatingTexts is executed, Then returns exactly one deduplicated item', () => {
    const item1: FloatingTextItem = {
      id: 'auc-win-badge-1',
      text: '-2.350',
      type: FloatingTextType.Penalty,
      playerId: 'bot_4',
      actionType: 'auction_win',
      title: 'Thắng đấu giá Bến Bạch Đằng',
      cellIndex: 3,
      groupId: 'auction_win_3',
      timestamp: Date.now(),
    };
    const item2: FloatingTextItem = {
      id: 'auc-win-badge-2',
      text: '-2.350',
      type: FloatingTextType.Penalty,
      playerId: 'bot_4',
      actionType: 'auction_win',
      title: 'Thắng đấu giá Bến Bạch Đằng',
      cellIndex: 3,
      groupId: 'auction_win_3',
      timestamp: Date.now(),
    };
    const deduped = deduplicateFloatingTexts([item1, item2], 'bot_4');
    expect(deduped.length).toBe(1);
    expect(deduped[0]?.groupId).toBe('auction_win_3');
  });

  it('[TC-370.10/MSS][UC-IMP370] Given cardId MC_FIRE_INSPECTION and effectDelta 0, When getCardCtaButtonText is executed, Then returns Tiếp Tục (Miễn Phạt) 🧯', () => {
    const ctaZero = getCardCtaButtonText(MarketCardId.MC_FIRE_INSPECTION, 0);
    const ctaFine = getCardCtaButtonText(MarketCardId.MC_FIRE_INSPECTION, -500);
    expect(ctaZero).toBe('Tiếp Tục (Miễn Phạt) 🧯');
    expect(ctaFine).toBe('Chấp Hành Nộp Phạt 🧯');
  });

  it('[TC-370.11/MSS][UC-IMP370] Given activity log entry with unmortgage, When dispatchActivityFloatingBadges is executed, Then floating text title points to Ngân Hàng and sets groupId', () => {
    useGameStore.setState({ floatingTexts: [] });
    const act: ActivityLogEntry = {
      id: 'unmortgage_act_1',
      timestamp: Date.now(),
      type: 'unmortgage',
      playerId: 'bot_4',
      playerName: 'Bot AI 4',
      message: 'giải chấp Bến Bạch Đằng với phí 10%',
      cellIndex: 3,
      amount: -1100,
    };
    dispatchActivityFloatingBadges([act], useGameStore.getState());
    const texts = useGameStore.getState().floatingTexts;
    expect(texts.length).toBe(1);
    expect(texts[0]?.title).toBe('Giải chấp Bến Bạch Đằng (Phí 10% ➔ Ngân Hàng)');
    expect(texts[0]?.title).not.toContain('Kho Bạc');
    expect(texts[0]?.groupId).toBe('unmortgage_3');
  });

  it('[TC-370.12/MSS][UC-IMP370] Given synthesized event PROPERTY_UNMORTGAGED, When property market badge handler processes it, Then floating text title points to Ngân Hàng and sets groupId', () => {
    useGameStore.setState({ floatingTexts: [] });
    const event: SynthesizedGameEvent = {
      type: SynthesizedGameEventType.PROPERTY_UNMORTGAGED,
      timestamp: Date.now(),
      cellIndex: 3,
      ownerId: 'bot_4',
      cost: 1100,
    };
    const pacing = createDefaultPacingContext(useGameStore);
    handlePropertyBadges(event, useGameStore.getState(), pacing);
    const texts = useGameStore.getState().floatingTexts;
    expect(texts.length).toBe(1);
    expect(texts[0]?.title).toBe('Giải chấp An Giang (Châu Đốc) (Phí 10% ➔ Ngân Hàng)');
    expect(texts[0]?.title).not.toContain('Kho Bạc');
    expect(texts[0]?.groupId).toBe('unmortgage_3');
  });

  it('[TC-370.13/MSS][UC-IMP370] Given concurrent identical groupId additions, When addFloatingText is called twice within cooldown, Then store keeps exactly one item', () => {
    useGameStore.setState({ floatingTexts: [] });
    useGameStore.getState().addFloatingText({
      text: '-2.350',
      type: FloatingTextType.Penalty,
      playerId: 'bot_4',
      actionType: 'auction_win',
      title: 'Thắng đấu giá An Giang (Châu Đốc)',
      cellIndex: 3,
      groupId: 'auction_win_3',
    });
    useGameStore.getState().addFloatingText({
      text: '-2.350',
      type: FloatingTextType.Penalty,
      playerId: 'bot_4',
      actionType: 'auction_win',
      title: 'Thắng đấu giá An Giang (Châu Đốc)',
      cellIndex: 3,
      groupId: 'auction_win_3',
    });
    const texts = useGameStore.getState().floatingTexts;
    expect(texts.length).toBe(1);
    expect(texts[0]?.groupId).toBe('auction_win_3');
  });
});
