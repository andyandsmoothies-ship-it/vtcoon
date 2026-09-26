// [TC-199.01/MSS..TC-199.18/MSS][UC-IMP199] Ergonomic 2-Row Tactile Micro-Card for Bot Trade Strip Contract Suite
// Universal 5-Facet Behavioral Matrix:
// Facet 1: Boundary & Container Contract (w-full sm:max-w-md preservation, flex-col 2-row layout, ARIA attributes)
// Facet 2: Ergonomic Touch Targets & Tactile Buttons (min-h-[38px] touch targets, TỪ CHỐI label on all screens, BÁN / ĐỔI labels, data-testid="inline-bot-inspect-btn")
// Facet 3: Information Completeness & Price Shrink-0 Invariant (property name visibility, price shrink-0 anti-truncation, currency format +3.000)
// Facet 4: Actor Inversion, Swap Notation & Insolvency Guard (bidirectional swap notation ⇄, negative balance guard on price=0, cash deficit guard, bankrupt player lockout)
// Facet 5: Modal Synchronization & Observable Teardown (activeModal === 'bot_trade_offer' suppression, pendingTradeOffer null teardown, non-seller filter, countdown timer badge)

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { InlineBotTradeStrip } from '../../src/client/ui/modals/bot_trade_offer_strip';
import { useGameStore } from '../../src/client/store/game_store';
import { useLobbyStore } from '../../src/client/store/lobby_store';

describe('[TC-199.01/MSS..TC-199.18/MSS][UC-IMP199] Ergonomic 2-Row Tactile Micro-Card for Bot Trade Strip Contract Suite', () => {
  beforeEach(() => {
    useLobbyStore.setState({ myPlayerId: 'p1' });
    useGameStore.setState({
      activeModal: null,
      modalPayload: null,
      pendingTradeOffer: null,
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Chủ Tịch Sài Thành',
          balance: 20000,
          tokenColor: '#38BDF8',
          ownedProperties: [1],
          mortgagedProperties: [],
          mortgageLoans: {},
          isBot: false,
          bankrupt: false,
          inAudit: false,
        },
        bot1: {
          id: 'bot1',
          name: 'Bot Tỷ Phú',
          balance: 30000,
          tokenColor: '#F59E0B',
          ownedProperties: [3],
          mortgagedProperties: [],
          mortgageLoans: {},
          isBot: true,
          bankrupt: false,
          inAudit: false,
        },
      },
    });
  });

  // =========================================================================
  // FACET 1: Boundary & Container Contract
  // =========================================================================
  describe('Facet 1: Boundary & Container Contract', () => {
    it('[TC-199.01/MSS][UC-IMP199] Container có data-testid="inline-bot-trade-strip", bảo toàn kích thước w-full sm:max-w-md', () => {
      useGameStore.setState({
        pendingTradeOffer: {
          offerId: 'offer_f1_01',
          cellIndex: 1,
          price: 2500,
          buyerId: 'bot1',
          sellerId: 'p1',
          expiresAt: Date.now() + 15000,
        },
      });

      const html = renderToStaticMarkup(
        React.createElement(InlineBotTradeStrip, { localPlayerId: 'p1' })
      );
      const strip = html.match(/<div[^>]*data-testid="inline-bot-trade-strip"[^>]*>/)?.[0] ?? '';

      expect(strip).toContain('w-full');
      expect(strip).toContain('sm:max-w-md');
    });

    it('[TC-199.02/MSS][UC-IMP199] Container khai báo cấu trúc 2 tầng flex flex-col gap-1.5 và padding p-2', () => {
      useGameStore.setState({
        pendingTradeOffer: {
          offerId: 'offer_f1_02',
          cellIndex: 1,
          price: 2500,
          buyerId: 'bot1',
          sellerId: 'p1',
          expiresAt: Date.now() + 15000,
        },
      });

      const html = renderToStaticMarkup(
        React.createElement(InlineBotTradeStrip, { localPlayerId: 'p1' })
      );
      const strip = html.match(/<div[^>]*data-testid="inline-bot-trade-strip"[^>]*>/)?.[0] ?? '';

      expect(strip).toContain('flex-col');
      expect(strip).toContain('gap-1.5');
      expect(strip).toContain('p-2');
    });

    it('[TC-199.03/MSS][UC-IMP199] Container khai báo đầy đủ ARIA attributes role="region" và aria-label="Đề xuất giao dịch từ Bot"', () => {
      useGameStore.setState({
        pendingTradeOffer: {
          offerId: 'offer_f1_03',
          cellIndex: 1,
          price: 2500,
          buyerId: 'bot1',
          sellerId: 'p1',
          expiresAt: Date.now() + 15000,
        },
      });

      const html = renderToStaticMarkup(
        React.createElement(InlineBotTradeStrip, { localPlayerId: 'p1' })
      );
      const strip = html.match(/<div[^>]*data-testid="inline-bot-trade-strip"[^>]*>/)?.[0] ?? '';

      expect(strip).toContain('role="region"');
      expect(strip).toContain('aria-label="Đề xuất giao dịch từ Bot"');
    });
  });

  // =========================================================================
  // FACET 2: Ergonomic Touch Targets & Tactile Buttons
  // =========================================================================
  describe('Facet 2: Ergonomic Touch Targets & Tactile Buttons', () => {
    it('[TC-199.04/MSS][UC-IMP199] Nút từ chối inline-bot-reject-btn có min-h-[38px], nhãn TỪ CHỐI hiển thị mọi màn hình không chứa hidden sm:inline', () => {
      useGameStore.setState({
        pendingTradeOffer: {
          offerId: 'offer_f2_04',
          cellIndex: 1,
          price: 2500,
          buyerId: 'bot1',
          sellerId: 'p1',
          expiresAt: Date.now() + 15000,
        },
      });

      const html = renderToStaticMarkup(
        React.createElement(InlineBotTradeStrip, { localPlayerId: 'p1' })
      );
      const rejectBtn = html.match(/<button[^>]*data-testid="inline-bot-reject-btn"[^>]*>[\s\S]*?<\/button>/)?.[0] ?? '';

      expect(rejectBtn).toContain('min-h-[38px]');
      expect(rejectBtn).toContain('TỪ CHỐI');
      expect(rejectBtn).not.toContain('hidden sm:inline');
    });

    it('[TC-199.05/MSS][UC-IMP199] Nút đồng ý mua inline-bot-accept-btn có min-h-[38px] và chứa chữ BÁN khi bot mua BĐS', () => {
      useGameStore.setState({
        pendingTradeOffer: {
          offerId: 'offer_f2_05',
          cellIndex: 1,
          price: 2500,
          buyerId: 'bot1',
          sellerId: 'p1',
          expiresAt: Date.now() + 15000,
        },
      });

      const html = renderToStaticMarkup(
        React.createElement(InlineBotTradeStrip, { localPlayerId: 'p1' })
      );
      const acceptBtn = html.match(/<button[^>]*data-testid="inline-bot-accept-btn"[^>]*>[\s\S]*?<\/button>/)?.[0] ?? '';

      expect(acceptBtn).toContain('min-h-[38px]');
      expect(acceptBtn).toContain('BÁN');
    });

    it('[TC-199.06/MSS][UC-IMP199] Nút đồng ý đổi inline-bot-accept-btn có min-h-[38px] và chứa chữ ĐỔI khi bot đề xuất hoán đổi', () => {
      useGameStore.setState({
        pendingTradeOffer: {
          offerId: 'offer_f2_06',
          cellIndex: 1,
          offeredCellIndex: 3,
          price: 1000,
          buyerId: 'bot1',
          sellerId: 'p1',
          expiresAt: Date.now() + 15000,
        },
      });

      const html = renderToStaticMarkup(
        React.createElement(InlineBotTradeStrip, { localPlayerId: 'p1' })
      );
      const acceptBtn = html.match(/<button[^>]*data-testid="inline-bot-accept-btn"[^>]*>[\s\S]*?<\/button>/)?.[0] ?? '';

      expect(acceptBtn).toContain('min-h-[38px]');
      expect(acceptBtn).toContain('ĐỔI');
    });

    it('[TC-199.07/MSS][UC-IMP199] Nút chi tiết có data-testid="inline-bot-inspect-btn" và hiển thị nhãn text Chi tiết', () => {
      useGameStore.setState({
        pendingTradeOffer: {
          offerId: 'offer_f2_07',
          cellIndex: 1,
          price: 2500,
          buyerId: 'bot1',
          sellerId: 'p1',
          expiresAt: Date.now() + 15000,
        },
      });

      const html = renderToStaticMarkup(
        React.createElement(InlineBotTradeStrip, { localPlayerId: 'p1' })
      );
      const inspectBtn = html.match(/<button[^>]*data-testid="inline-bot-inspect-btn"[^>]*>[\s\S]*?<\/button>/)?.[0] ?? '';

      expect(inspectBtn).not.toBe('');
      expect(inspectBtn).toContain('Chi tiết');
    });
  });

  // =========================================================================
  // FACET 3: Information Completeness & Price Shrink-0 Invariant
  // =========================================================================
  describe('Facet 3: Information Completeness & Price Shrink-0 Invariant', () => {
    it('[TC-199.08/MSS][UC-IMP199] Hiển thị tên BĐS mục tiêu trọn vẹn trong markup HTML không bị cắt cụt', () => {
      useGameStore.setState({
        pendingTradeOffer: {
          offerId: 'offer_f3_08',
          cellIndex: 1,
          price: 2500,
          buyerId: 'bot1',
          sellerId: 'p1',
          expiresAt: Date.now() + 15000,
        },
      });

      const html = renderToStaticMarkup(
        React.createElement(InlineBotTradeStrip, { localPlayerId: 'p1' })
      );

      expect(html).toContain('Cần Thơ');
    });

    it('[TC-199.09/MSS][UC-IMP199] Huy hiệu giá tiền có class shrink-0 bảo đảm không bị co rút vỡ layout trên Mobile 360px', () => {
      useGameStore.setState({
        pendingTradeOffer: {
          offerId: 'offer_f3_09',
          cellIndex: 1,
          price: 2500,
          buyerId: 'bot1',
          sellerId: 'p1',
          expiresAt: Date.now() + 15000,
        },
      });

      const html = renderToStaticMarkup(
        React.createElement(InlineBotTradeStrip, { localPlayerId: 'p1' })
      );
      const priceElement = html.match(/<([a-z0-9]+)[^>]*class="[^"]*"[^>]*>[^<]*2\.500[^<]*<\/\1>/i)?.[0] ?? '';

      expect(priceElement).toContain('shrink-0');
    });

    it('[TC-199.10/MSS][UC-IMP199] Định dạng tiền tệ hiển thị tiền nhận dạng +3.000 khi bot đề xuất đổi BĐS kèm tiền bù', () => {
      useGameStore.setState({
        pendingTradeOffer: {
          offerId: 'offer_f3_10',
          cellIndex: 1,
          offeredCellIndex: 3,
          price: 3000,
          buyerId: 'bot1',
          sellerId: 'p1',
          expiresAt: Date.now() + 15000,
        },
      });

      const html = renderToStaticMarkup(
        React.createElement(InlineBotTradeStrip, { localPlayerId: 'p1' })
      );

      expect(html).toContain('+3.000');
    });
  });

  // =========================================================================
  // FACET 4: Actor Inversion, Swap Notation & Insolvency Guard
  // =========================================================================
  describe('Facet 4: Actor Inversion, Swap Notation & Insolvency Guard', () => {
    it('[TC-199.11/MSS][UC-IMP199] Chế độ Swap hiển thị ký hiệu 2 chiều ⇄ hoặc Đổi ... lấy ..., không dùng mũi tên 1 chiều', () => {
      useGameStore.setState({
        pendingTradeOffer: {
          offerId: 'offer_f4_11',
          cellIndex: 1,
          offeredCellIndex: 3,
          price: 0,
          buyerId: 'bot1',
          sellerId: 'p1',
          expiresAt: Date.now() + 15000,
        },
      });

      const html = renderToStaticMarkup(
        React.createElement(InlineBotTradeStrip, { localPlayerId: 'p1' })
      );
      const hasSwapNotation = html.includes('⇄') || (html.includes('Đổi') && html.includes('lấy'));

      expect(hasSwapNotation).toBe(true);
      expect(html).not.toMatch(/→|->|➔/);
    });

    it('[TC-199.12/MSS][UC-IMP199] Insolvency Guard: Khi myBalance < 0 (-500) và price === 0 (swap ngang giá), nút accept bị disabled và có text Thiếu tiền', () => {
      useGameStore.setState({
        playersInfo: {
          p1: {
            id: 'p1',
            name: 'Chủ Tịch Sài Thành',
            balance: -500,
            tokenColor: '#38BDF8',
            ownedProperties: [1],
            isBot: false,
            bankrupt: false,
          },
          bot1: {
            id: 'bot1',
            name: 'Bot Tỷ Phú',
            balance: 30000,
            tokenColor: '#F59E0B',
            ownedProperties: [3],
            isBot: true,
            bankrupt: false,
          },
        },
        pendingTradeOffer: {
          offerId: 'offer_f4_12',
          cellIndex: 1,
          offeredCellIndex: 3,
          price: 0,
          buyerId: 'bot1',
          sellerId: 'p1',
          expiresAt: Date.now() + 15000,
        },
      });

      const html = renderToStaticMarkup(
        React.createElement(InlineBotTradeStrip, { localPlayerId: 'p1' })
      );
      const acceptBtn = html.match(/<button[^>]*data-testid="inline-bot-accept-btn"[^>]*>[\s\S]*?<\/button>/)?.[0] ?? '';

      expect(acceptBtn).toContain('disabled');
      expect(acceptBtn).toContain('Thiếu tiền');
    });

    it('[TC-199.13/MSS][UC-IMP199] Khi price < 0 (-1000) và myBalance < absCash (500), nút accept bị disabled và có text Thiếu tiền', () => {
      useGameStore.setState({
        playersInfo: {
          p1: {
            id: 'p1',
            name: 'Chủ Tịch Sài Thành',
            balance: 500,
            tokenColor: '#38BDF8',
            ownedProperties: [1],
            isBot: false,
            bankrupt: false,
          },
          bot1: {
            id: 'bot1',
            name: 'Bot Tỷ Phú',
            balance: 30000,
            tokenColor: '#F59E0B',
            ownedProperties: [3],
            isBot: true,
            bankrupt: false,
          },
        },
        pendingTradeOffer: {
          offerId: 'offer_f4_13',
          cellIndex: 1,
          offeredCellIndex: 3,
          price: -1000,
          buyerId: 'bot1',
          sellerId: 'p1',
          expiresAt: Date.now() + 15000,
        },
      });

      const html = renderToStaticMarkup(
        React.createElement(InlineBotTradeStrip, { localPlayerId: 'p1' })
      );
      const acceptBtn = html.match(/<button[^>]*data-testid="inline-bot-accept-btn"[^>]*>[\s\S]*?<\/button>/)?.[0] ?? '';

      expect(acceptBtn).toContain('disabled');
      expect(acceptBtn).toContain('Thiếu tiền');
    });

    it('[TC-199.14/MSS][UC-IMP199] Khi myPlayer.bankrupt === true, nút accept bị disabled', () => {
      useGameStore.setState({
        playersInfo: {
          p1: {
            id: 'p1',
            name: 'Chủ Tịch Sài Thành',
            balance: 10000,
            tokenColor: '#38BDF8',
            ownedProperties: [1],
            isBot: false,
            bankrupt: true,
          },
          bot1: {
            id: 'bot1',
            name: 'Bot Tỷ Phú',
            balance: 30000,
            tokenColor: '#F59E0B',
            ownedProperties: [3],
            isBot: true,
            bankrupt: false,
          },
        },
        pendingTradeOffer: {
          offerId: 'offer_f4_14',
          cellIndex: 1,
          price: 2500,
          buyerId: 'bot1',
          sellerId: 'p1',
          expiresAt: Date.now() + 15000,
        },
      });

      const html = renderToStaticMarkup(
        React.createElement(InlineBotTradeStrip, { localPlayerId: 'p1' })
      );
      const acceptBtn = html.match(/<button[^>]*data-testid="inline-bot-accept-btn"[^>]*>[\s\S]*?<\/button>/)?.[0] ?? '';

      expect(acceptBtn).toContain('disabled');
    });
  });

  // =========================================================================
  // FACET 5: Modal Synchronization & Observable Teardown
  // =========================================================================
  describe('Facet 5: Modal Synchronization & Observable Teardown', () => {
    it('[TC-199.15/MSS][UC-IMP199] Khi activeModal === "bot_trade_offer", InlineBotTradeStrip trả về null chống race condition và đè lấn', () => {
      useGameStore.setState({
        activeModal: 'bot_trade_offer',
        pendingTradeOffer: {
          offerId: 'offer_f5_15',
          cellIndex: 1,
          price: 2500,
          buyerId: 'bot1',
          sellerId: 'p1',
          expiresAt: Date.now() + 15000,
        },
      });

      const html = renderToStaticMarkup(
        React.createElement(InlineBotTradeStrip, { localPlayerId: 'p1' })
      );

      expect(html).toBe('');
    });

    it('[TC-199.16/MSS][UC-IMP199] Khi pendingTradeOffer === null, strip trả về null', () => {
      useGameStore.setState({
        activeModal: null,
        pendingTradeOffer: null,
      });

      const html = renderToStaticMarkup(
        React.createElement(InlineBotTradeStrip, { localPlayerId: 'p1' })
      );

      expect(html).toBe('');
    });

    it('[TC-199.17/MSS][UC-IMP199] Khi sellerId !== myId, strip trả về null', () => {
      useGameStore.setState({
        activeModal: null,
        pendingTradeOffer: {
          offerId: 'offer_f5_17',
          cellIndex: 1,
          price: 2500,
          buyerId: 'bot1',
          sellerId: 'p2',
          expiresAt: Date.now() + 15000,
        },
      });

      const html = renderToStaticMarkup(
        React.createElement(InlineBotTradeStrip, { localPlayerId: 'p1' })
      );

      expect(html).toBe('');
    });

    it('[TC-199.18/MSS][UC-IMP199] Huy hiệu đếm ngược hiển thị dạng {secondsLeft}s với bg-amber-100 text-amber-700', () => {
      useGameStore.setState({
        activeModal: null,
        pendingTradeOffer: {
          offerId: 'offer_f5_18',
          cellIndex: 1,
          price: 2500,
          buyerId: 'bot1',
          sellerId: 'p1',
          expiresAt: Date.now() + 12000,
        },
      });

      const html = renderToStaticMarkup(
        React.createElement(InlineBotTradeStrip, { localPlayerId: 'p1' })
      );
      const timerBadge = html.match(/<span[^>]*class="[^"]*bg-amber-100[^"]*"[^>]*>[\s\S]*?<\/span>/)?.[0] ?? '';

      expect(timerBadge).toContain('text-amber-700');
      expect(timerBadge).toMatch(/\d+s/);
    });
  });
});
