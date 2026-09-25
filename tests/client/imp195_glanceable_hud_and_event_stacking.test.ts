// [IMP-195] Glanceable HUD & Mobile Event Stacking Contract Tests
// Universal 5-Facet Adversarial Matrix:
// Facet 1: Boundary & Compact Formulas (Single-row aggregated strip, no prose paragraphs)
// Facet 2: Behavioral Layout & Container Unification (1 unified container for multiple events)
// Facet 3: Data Lifecycle & Modal Preservation (No clobbering of activeModal: 'deed')
// Facet 4: Actor Inversion & Role Symmetry (Swap vs Buy, Negative Cash Guard)
// Facet 5: Transient Teardown (Clean wipe when pendingTradeOffer is null)

import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  useGameStore,
  FloatingTextType,
  type ActiveModalType,
} from '../../src/client/store/game_store.js';
import { MarketEventTicker } from '../../src/client/ui/market_event_ticker.js';
import { FloatingNumbersOverlay } from '../../src/client/ui/floating_numbers.js';
import { InlineBotTradeStrip } from '../../src/client/ui/modals/bot_trade_offer_strip.js';
import { applyDelta } from '../../src/client/network/apply_delta.js';
import { useLobbyStore } from '../../src/client/store/lobby_store.js';
import { MarketCardId } from '../../src/domain/event_card_types.js';
import type { PendingTradeOfferDelta } from '../../src/server/session_manager.js';

describe('[IMP-195] Glanceable HUD & Mobile Event Stacking', () => {
  beforeEach(() => {
    useGameStore.setState({
      activeModal: null,
      modalPayload: null,
      pendingTradeOffer: null,
      activeModifiers: [],
      floatingTexts: [],
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Bạn (P1)',
          balance: 10000,
          tokenColor: '#38BDF8',
          ownedProperties: [5],
        },
        bot1: {
          id: 'bot1',
          name: 'Bot Nam',
          balance: 20000,
          tokenColor: '#F59E0B',
          isBot: true,
          ownedProperties: [15],
        },
      },
    });
    useLobbyStore.setState({ myPlayerId: 'p1' });
  });

  it('[TC-HUD.01/MSS][Facet-1/Boundary] MarketEventTicker với 1 sự kiện hiển thị capsule cô đọng, không chứa đoạn văn giải thích dài dòng > 60 ký tự', () => {
    const html = renderToStaticMarkup(
      React.createElement(MarketEventTicker, {
        activeModifiers: [
          { type: MarketCardId.MC_PUBLIC_INVEST, remainingRounds: 2 },
        ],
      })
    );
    expect(html).toContain('data-testid="market-event-ticker"');
    expect(html).toContain('data-testid="market-ticker-item-MC_PUBLIC_INVEST"');
    // Chứa công thức cô đọng
    expect(html).toMatch(/4 Ga|Ga Tàu|x2/i);
    // Không chứa đoạn văn hành chính dài
    expect(html).not.toContain('Nhân đôi cước vận tải tại 4 Ga Tàu trên toàn bàn cờ.');
  });

  it('[TC-HUD.02/MSS][Facet-2/Layout] MarketEventTicker với 3 sự kiện kết xuất trong 1 container gộp duy nhất chứa 3 chip inline', () => {
    const html = renderToStaticMarkup(
      React.createElement(MarketEventTicker, {
        activeModifiers: [
          { type: 'MACRO_LAND_FEVER', remainingRounds: 2 },
          { type: MarketCardId.MC_PUBLIC_INVEST, remainingRounds: 1 },
          { type: MarketCardId.MC_RATE_HIKE, remainingRounds: 3 },
        ],
      })
    );
    // Chỉ có 1 container region chính
    const regionMatches = html.match(/role="region"/g);
    expect(regionMatches?.length).toBe(1);

    // Cả 3 sự kiện đều hiện diện đồng thời
    expect(html).toContain('data-testid="market-ticker-item-MACRO_LAND_FEVER"');
    expect(html).toContain('data-testid="market-ticker-item-MC_PUBLIC_INVEST"');
    expect(html).toContain('data-testid="market-ticker-item-MC_RATE_HIKE"');

    // Không render thành các thẻ riêng biệt có viền dày độc lập dạng thẻ bài lớn
    expect(html).not.toContain('line-clamp-3');
  });

  it('[TC-HUD.03/MSS][Facet-1/Boundary] FloatingNumbersOverlay định vị ở top-28 sm:top-24 khi có sự kiện thị trường (không đẩy sâu top-[17rem])', () => {
    useGameStore.setState({
      activeModifiers: [
        { type: MarketCardId.MC_RATE_HIKE, remainingRounds: 2 },
        { type: MarketCardId.MC_PUBLIC_INVEST, remainingRounds: 1 },
      ],
      floatingTexts: [
        {
          id: 'ft_1',
          text: '-500 Tr.',
          type: FloatingTextType.Penalty,
          playerId: 'p1',
          actionType: 'rent_pay',
          title: 'Trả cước dừng chân',
          timestamp: Date.now(),
        },
      ],
    });
    const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
    expect(html).toContain('top-28');
    expect(html).not.toContain('top-[17rem]');
    expect(html).not.toContain('top-[15.5rem]');
  });

  it('[TC-HUD.04/MSS][Facet-3/Lifecycle] Khi activeModal đang là deed, apply_delta nhận pendingTradeOffer không làm clobber activeModal', () => {
    useGameStore.setState({
      activeModal: 'deed' as ActiveModalType,
      modalPayload: { cellIndex: 1, canBuy: true },
    });

    const offer: PendingTradeOfferDelta = {
      offerId: 'offer_123',
      cellIndex: 5,
      price: 2500,
      buyerId: 'bot1',
      sellerId: 'p1',
      expiresAt: Date.now() + 15000,
    };

    applyDelta({
      tick: 1,
      cells: [],
      pendingTradeOffer: offer,
    });

    // activeModal vẫn giữ nguyên là 'deed'
    expect(useGameStore.getState().activeModal).toBe('deed');
    // Store ghi nhận pendingTradeOffer cho thanh strip
    expect(useGameStore.getState().pendingTradeOffer).toEqual(offer);
  });

  it('[TC-HUD.05/MSS][Facet-4/ActorInversion] InlineBotTradeStrip hiển thị đúng nhãn BÁN khi mua đứt và ĐỔI khi hoán đổi ô đất', () => {
    // 1. Trường hợp mua đứt (!isSwap)
    const buyOffer: PendingTradeOfferDelta = {
      offerId: 'offer_buy',
      cellIndex: 5,
      price: 3000,
      buyerId: 'bot1',
      sellerId: 'p1',
      expiresAt: Date.now() + 15000,
    };
    useGameStore.setState({ pendingTradeOffer: buyOffer });

    const buyHtml = renderToStaticMarkup(
      React.createElement(InlineBotTradeStrip, { localPlayerId: 'p1' })
    );
    expect(buyHtml).toContain('data-testid="inline-bot-trade-strip"');
    expect(buyHtml).toContain('BÁN');
    expect(buyHtml).toContain('3.000 Tr.');

    // 2. Trường hợp hoán đổi ô đất (isSwap = true)
    const swapOffer: PendingTradeOfferDelta = {
      offerId: 'offer_swap',
      cellIndex: 5,
      price: 500,
      buyerId: 'bot1',
      sellerId: 'p1',
      expiresAt: Date.now() + 15000,
      offeredCellIndex: 15,
    };
    useGameStore.setState({ pendingTradeOffer: swapOffer });

    const swapHtml = renderToStaticMarkup(
      React.createElement(InlineBotTradeStrip, { localPlayerId: 'p1' })
    );
    expect(swapHtml).toContain('ĐỔI');
  });

  it('[TC-HUD.06/MSS][Facet-5/Teardown] Khi apply_delta nhận pendingTradeOffer=null, store dọn sạch về null', () => {
    useGameStore.setState({
      pendingTradeOffer: {
        offerId: 'offer_temp',
        cellIndex: 5,
        price: 1000,
        buyerId: 'bot1',
        sellerId: 'p1',
        expiresAt: Date.now() + 15000,
      },
    });

    applyDelta({
      tick: 2,
      cells: [],
      pendingTradeOffer: null,
    });

    expect(useGameStore.getState().pendingTradeOffer).toBeNull();
  });

  it('[TC-HUD.07/MSS][Facet-3/Security] Khi pendingTradeOffer có sellerId khác mình, store không ghi nhận', () => {
    const offerForSomeoneElse: PendingTradeOfferDelta = {
      offerId: 'offer_other',
      cellIndex: 7,
      price: 2000,
      buyerId: 'bot1',
      sellerId: 'p2_other',
      expiresAt: Date.now() + 15000,
    };

    applyDelta({
      tick: 3,
      cells: [],
      pendingTradeOffer: offerForSomeoneElse,
    });

    expect(useGameStore.getState().pendingTradeOffer).toBeNull();
  });

  it('[TC-HUD.08/MSS][Facet-4/ActorInversion] Khi deal bù tiền âm (price < 0) và số dư không đủ, nút chấp thuận bị disable', () => {
    // Người chơi chỉ có 1.000 Tr. nhưng deal đòi bù 5.000 Tr.
    useGameStore.setState({
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Bạn (P1)',
          balance: 1000,
          tokenColor: '#38BDF8',
          ownedProperties: [5],
        },
        bot1: {
          id: 'bot1',
          name: 'Bot Nam',
          balance: 20000,
          tokenColor: '#F59E0B',
          isBot: true,
          ownedProperties: [15],
        },
      },
      pendingTradeOffer: {
        offerId: 'offer_negative',
        cellIndex: 5,
        price: -5000,
        buyerId: 'bot1',
        sellerId: 'p1',
        expiresAt: Date.now() + 15000,
        offeredCellIndex: 15,
      },
    });

    const html = renderToStaticMarkup(
      React.createElement(InlineBotTradeStrip, { localPlayerId: 'p1' })
    );
    expect(html).toContain('disabled');
    expect(html).toMatch(/Bù|Thiếu tiền/i);
  });
});
