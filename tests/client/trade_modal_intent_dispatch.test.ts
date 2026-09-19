// [TC-IMP127/MSS][UC-UI-S04] P2P Trade Intent Dispatch & Buy/Sell Contract
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TradeModal } from '../../src/client/ui/modals/trade_modal';
import type { PlayerIntent } from '../../src/server/intent_dispatcher';

describe('[TC-IMP127/MSS] P2P Trade Intent Dispatch for Both Buy and Sell Offers', () => {
  it('[TC-IMP127.01] Khi đề xuất mua đất đối tác, submit trade chuyển tải requestedProperties thành INTENT_TRADE_OFFER', () => {
    let dispatchedIntent: PlayerIntent | undefined;
    const onIntent = (intent: PlayerIntent) => {
      dispatchedIntent = intent;
    };

    const myId = 'p1';
    const partnerId = 'bot_4';

    // Mô phỏng callback onSubmitTrade trong modal_host.tsx
    const onSubmitTrade = (tradeData: {
      targetPlayerId: string;
      offeredProperties: number[];
      requestedProperties: number[];
      cashOffer: number;
      cashRequest: number;
    }) => {
      if (tradeData) {
        if (tradeData.offeredProperties[0] !== undefined) {
          onIntent({
            type: 'INTENT_TRADE_OFFER',
            sellerId: myId,
            buyerId: tradeData.targetPlayerId,
            cellIndex: tradeData.offeredProperties[0],
            price: tradeData.cashRequest || tradeData.cashOffer || 1000,
          });
        } else if (tradeData.requestedProperties[0] !== undefined) {
          onIntent({
            type: 'INTENT_TRADE_OFFER',
            sellerId: tradeData.targetPlayerId,
            buyerId: myId,
            cellIndex: tradeData.requestedProperties[0],
            price: tradeData.cashOffer || tradeData.cashRequest || 1000,
          });
        }
      }
    };

    // Người chơi p1 muốn mua ô 8 của bot_4 với giá 2.500 Tr.
    onSubmitTrade({
      targetPlayerId: partnerId,
      offeredProperties: [],
      requestedProperties: [8],
      cashOffer: 2500,
      cashRequest: 0,
    });

    expect(dispatchedIntent).toBeDefined();
    expect(dispatchedIntent).toEqual({
      type: 'INTENT_TRADE_OFFER',
      sellerId: 'bot_4',
      buyerId: 'p1',
      cellIndex: 8,
      price: 2500,
    });
  });

  it('[TC-IMP127.02] Khi đề xuất bán đất cho đối tác, submit trade chuyển tải offeredProperties thành INTENT_TRADE_OFFER', () => {
    let dispatchedIntent: PlayerIntent | undefined;
    const onIntent = (intent: PlayerIntent) => {
      dispatchedIntent = intent;
    };

    const myId = 'p1';
    const partnerId = 'bot_2';

    const onSubmitTrade = (tradeData: {
      targetPlayerId: string;
      offeredProperties: number[];
      requestedProperties: number[];
      cashOffer: number;
      cashRequest: number;
    }) => {
      if (tradeData) {
        if (tradeData.offeredProperties[0] !== undefined) {
          onIntent({
            type: 'INTENT_TRADE_OFFER',
            sellerId: myId,
            buyerId: tradeData.targetPlayerId,
            cellIndex: tradeData.offeredProperties[0],
            price: tradeData.cashRequest || tradeData.cashOffer || 1000,
          });
        } else if (tradeData.requestedProperties[0] !== undefined) {
          onIntent({
            type: 'INTENT_TRADE_OFFER',
            sellerId: tradeData.targetPlayerId,
            buyerId: myId,
            cellIndex: tradeData.requestedProperties[0],
            price: tradeData.cashOffer || tradeData.cashRequest || 1000,
          });
        }
      }
    };

    // Người chơi p1 muốn bán ô 6 cho bot_2 với giá 1.800 Tr.
    onSubmitTrade({
      targetPlayerId: partnerId,
      offeredProperties: [6],
      requestedProperties: [],
      cashOffer: 0,
      cashRequest: 1800,
    });

    expect(dispatchedIntent).toBeDefined();
    expect(dispatchedIntent).toEqual({
      type: 'INTENT_TRADE_OFFER',
      sellerId: 'p1',
      buyerId: 'bot_2',
      cellIndex: 6,
      price: 1800,
    });
  });

  it('[TC-IMP127.03] TradeModal hiển thị gợi ý giá mua (100% Gốc, 130%, 150%) khi chọn BĐS của đối tác', () => {
    const html = renderToStaticMarkup(
      React.createElement(TradeModal, {
        targetPlayerId: 'bot_4',
        myProperties: [],
        targetProperties: [6], // Ô 6 (Đà Nẵng, giá 1.000 Tr.)
        myBalance: 10000,
        targetBalance: 5000,
        initialOffered: [],
        initialRequested: [6],
      })
    );

    expect(html).toContain('Gợi ý giá mua:');
    expect(html).toContain('100% Gốc (1.000 Tr.)');
    expect(html).toContain('130% (1.300 Tr.)');
    expect(html).toContain('150% (1.500 Tr.)');
  });
});
