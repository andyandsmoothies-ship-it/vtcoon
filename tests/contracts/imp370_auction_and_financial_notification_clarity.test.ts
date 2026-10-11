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
});
