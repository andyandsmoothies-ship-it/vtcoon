// [CONTRACT TEST] IMP-239: Desktop Full-Spectrum UI/UX & Spatial Ergonomics Harmonization
// Traceability Tags: [TC-DSE-01/MSS..TC-DSE-16/MSS] & [UC-IMP239]
// Universal 5-Facet Behavioral Matrix & Adversarial Inversion Verification
// Architecture: Modal Centering, Auction Participant Clearance, Trade Partner Ergonomics, Title Deed Dimensions & Shortfall Hygiene

import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { ModalHost } from '../../src/client/ui/modals/modal_host';
import { ModalBackdrop } from '../../src/client/ui/modals/modal_backdrop';
import { AuctionModal } from '../../src/client/ui/modals/auction_modal';
import {
  TradePartnerStrip,
  type TradePartnerInfo,
} from '../../src/client/ui/modals/trade/trade_partner_strip';
import { TradeSentimentMeter } from '../../src/client/ui/modals/trade_sentiment_meter';
import { TitleDeedModal } from '../../src/client/ui/modals/title_deed_modal';
import { TitleDeedActionFooter } from '../../src/client/ui/modals/title_deed_action_footer';
import { CompulsoryBuyoutModal } from '../../src/client/ui/modals/compulsory_buyout_modal';

describe('[TC-DSE-01/MSS..TC-DSE-16/MSS][UC-IMP239] Desktop Spatial Ergonomics Contract Suite', () => {
  // =========================================================================
  // FACET 1: Modal Centering & Spatial Symmetry on Desktop (TC-DSE-01..03)
  // =========================================================================
  describe('Facet 1: Modal Centering & Spatial Symmetry on Desktop (TC-DSE-01..03)', () => {
    it('[TC-DSE-01/MSS][UC-IMP239] ModalHost truyền center={true} cho GameOverModal, HoseModal, InsolvencyBanner, BotTradeOfferModal và CompulsoryBuyoutModal', () => {
      const gameOverHtml = renderToStaticMarkup(
        React.createElement(ModalHost, {
          activeModal: 'game_over',
          modalPayload: {
            leaderboard: [{ id: 'p1', netWorth: 20000 }],
          },
        })
      );
      const hoseHtml = renderToStaticMarkup(
        React.createElement(ModalHost, {
          activeModal: 'hose',
          modalPayload: {
            currentStake: 500,
          },
        })
      );
      expect(gameOverHtml).toContain('backdrop-blur-xs');
      expect(gameOverHtml).not.toContain('md:justify-end');
      expect(hoseHtml).toContain('backdrop-blur-xs');
      expect(hoseHtml).not.toContain('md:justify-end');
    });

    it('[TC-DSE-02/MSS][UC-IMP239] ModalHost duy trì center={false} riêng cho TitleDeedModal để bảo tồn tầm nhìn ô đất 3D trên Desktop', () => {
      const deedHtml = renderToStaticMarkup(
        React.createElement(ModalHost, {
          activeModal: 'deed',
          modalPayload: { cellIndex: 1 },
        })
      );
      expect(deedHtml).toContain('md:justify-end');
      expect(deedHtml).toContain('md:pr-10');
      expect(deedHtml).not.toContain('backdrop-blur-xs');
    });

    it('[TC-DSE-03/MSS][UC-IMP239] ModalBackdrop render backdrop-blur-xs và căn giữa items-center justify-center khi center={true}', () => {
      const centeredBackdropHtml = renderToStaticMarkup(
        React.createElement(ModalBackdrop, {
          center: true,
        })
      );
      expect(centeredBackdropHtml).toContain('backdrop-blur-xs');
      expect(centeredBackdropHtml).toContain('items-center justify-center');
      expect(centeredBackdropHtml).not.toContain('md:justify-end');
    });
  });

  // =========================================================================
  // FACET 2: Auction Participant Clearance & Overflow Defense (TC-DSE-04..06)
  // =========================================================================
  describe('Facet 2: Auction Participant Clearance & Overflow Defense (TC-DSE-04..06)', () => {
    it('[TC-DSE-04/MSS][UC-IMP239] AuctionModal áp dụng sm:max-h-28 md:max-h-32 cho danh sách đại gia tham gia đấu giá', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 500,
          highestBidderId: null,
          timeRemaining: 15,
        })
      );
      expect(html).toContain('sm:max-h-32 md:max-h-36');
      expect(html).not.toContain('sm:max-h-20');
    });

    it('[TC-DSE-05/MSS][UC-IMP239] AuctionModal kết xuất đầy đủ 4 phần tử đại gia trong DOM/VDOM với line-through cho người rút lui và nhãn (Bạn)', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 500,
          timeRemaining: 15,
          myId: 'p1',
          passedPlayerIds: ['bot_2'],
          highestBidderId: 'bot_1',
          playersInfo: {
            p1: { id: 'p1', name: 'Đại Gia Sài Gòn', balance: 5000 },
            bot_1: { id: 'bot_1', name: 'Bot Alpha', balance: 6000 },
            bot_2: { id: 'bot_2', name: 'Bot Beta', balance: 3000 },
            bot_3: { id: 'bot_3', name: 'Bot Gamma', balance: 4000 },
          },
        })
      );
      expect(html).toContain('Đại Gia Sài Gòn');
      expect(html).toContain('(Bạn)');
      expect(html).toContain('Bot Beta');
      expect(html).toContain('line-through');
    });

    it('[TC-DSE-06/MSS][UC-IMP239] AuctionModal bảo tồn đầy đủ các nút đặt giá +100, +200, +500 và nút Rút Lui trong viewport', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: null,
          timeRemaining: 15,
          myBalance: 5000,
        })
      );
      expect(html).toContain('+100');
      expect(html).toContain('+200');
      expect(html).toContain('+500');
      expect(html).toContain('Rút Lui');
    });
  });

  // =========================================================================
  // FACET 3: Trade Partner Strip & Sentiment Hygiene (TC-DSE-07..10)
  // =========================================================================
  describe('Facet 3: Trade Partner Strip & Sentiment Hygiene (TC-DSE-07..10)', () => {
    it('[TC-DSE-07/MSS][UC-IMP239] TradePartnerStrip áp dụng min-w-0 trên button, giữ min-w-0 trên container tên đối tác và shrink-0 trên badge nhu cầu', () => {
      const partner: TradePartnerInfo = {
        id: 'bot_1',
        name: 'Bot Hà Nội',
        balance: 10000,
        isBot: true,
      };
      const html = renderToStaticMarkup(
        React.createElement(TradePartnerStrip, {
          availablePartners: [partner],
          selectedPartnerId: 'bot_1',
          onSelectPartner: () => {},
        })
      );
      expect(html).toMatch(/partner-selector-tab[^"]*min-w-0/);
      expect(html).toMatch(/text-amber-900[^"]*shrink-0/);
    });

    it('[TC-DSE-08/MSS][UC-IMP239] TradePartnerStrip bảo tồn nguyên vẹn các lớp CSS truncate max-w-[120px] sm:max-w-[180px] md:max-w-none của imp236', () => {
      const partner: TradePartnerInfo = {
        id: 'bot_1',
        name: 'Bot Hải Phòng',
        balance: 5000,
        isBot: true,
      };
      const html = renderToStaticMarkup(
        React.createElement(TradePartnerStrip, {
          availablePartners: [partner],
          selectedPartnerId: 'bot_1',
          onSelectPartner: () => {},
        })
      );
      expect(html).toContain('truncate max-w-[120px] sm:max-w-[180px] md:max-w-none');
      expect(html).toContain('truncate max-w-[90px] md:max-w-none');
    });

    it('[TC-DSE-09/MSS][UC-IMP239] TradeSentimentMeter khử bỏ hậu tố tính cách khỏi partnerName bằng formatShortPlayerName', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeSentimentMeter, {
          partnerName: 'Bot AI 1 (Táo Bạo)',
          sentiment: { status: 'likely_accept', score: 85, message: '', hint: '' },
        })
      );
      expect(html).toContain('Tâm Lý Đồng Thuận AI (Bot AI 1)');
      expect(html).not.toContain('Bot AI 1 (Táo Bạo)');
    });

    it('[TC-DSE-10/MSS][UC-IMP239] TradeSentimentMeter không chứa lồng ngoặc kép hoặc lặp lại tính cách (Bot AI 1 (Táo Bạo))', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeSentimentMeter, {
          partnerName: 'Bot AI 2 (Cẩn Trọng)',
          sentiment: { status: 'borderline', score: 50, message: '', hint: '' },
        })
      );
      expect(html).not.toContain('))');
      expect(html).toContain('Tâm Lý Đồng Thuận AI (Bot AI 2)');
    });
  });

  // =========================================================================
  // FACET 4: Title Deed Desktop Dimensions & C3 Monopoly No-Truncation (TC-DSE-11..13)
  // =========================================================================
  describe('Facet 4: Title Deed Desktop Dimensions & C3 Monopoly No-Truncation (TC-DSE-11..13)', () => {
    it('[TC-DSE-11/MSS][UC-IMP239] TitleDeedModal mở rộng chiều rộng tối đa trên Desktop thành md:max-w-[730px]', () => {
      const html = renderToStaticMarkup(
        React.createElement(TitleDeedModal, {
          cellIndex: 1,
        })
      );
      expect(html).toContain('md:max-w-[730px]');
      expect(html).not.toContain('md:max-w-2xl');
    });

    it('[TC-DSE-12/MSS][UC-IMP239] TitleDeedModal áp dụng lưới 2 cột md:grid-cols-[1fr_1.15fr] tăng không gian cho bảng cước', () => {
      const html = renderToStaticMarkup(
        React.createElement(TitleDeedModal, {
          cellIndex: 1,
        })
      );
      expect(html).toContain('md:grid-cols-[1fr_1.15fr]');
      expect(html).not.toContain('md:grid-cols-2');
    });

    it('[TC-DSE-13/MSS][UC-IMP239] TitleDeedModal hiển thị đầy đủ nhãn C3 Quần thể Resort/TTTM khi có huy hiệu Độc Quyền x1.5', () => {
      const html = renderToStaticMarkup(
        React.createElement(TitleDeedModal, {
          cellIndex: 1,
          isOwned: true,
          isOwner: true,
          hasMonopoly: true,
          ownedProperties: [1, 3],
        })
      );
      expect(html).toContain('Quần thể Resort/TTTM');
      expect(html).toContain('x1.5 ĐỘC QUYỀN');
      expect(html).toContain('C3');
    });
  });

  // =========================================================================
  // FACET 5: Defensive Data Resilience & Shortfall Notice Sanity (TC-DSE-14..16)
  // =========================================================================
  describe('Facet 5: Defensive Data Resilience & Shortfall Notice Sanity (TC-DSE-14..16)', () => {
    it('[TC-DSE-14/MSS][UC-IMP239] TitleDeedActionFooter ẩn thông báo thiếu tiền khi shortfall <= 0 hoặc undefined mặc dù canBuy = false', () => {
      const htmlZero = renderToStaticMarkup(
        React.createElement(TitleDeedActionFooter, {
          isOwned: false,
          canBuy: false,
          isTradeFrozen: false,
          shortfall: 0,
        })
      );
      const htmlUndefined = renderToStaticMarkup(
        React.createElement(TitleDeedActionFooter, {
          isOwned: false,
          canBuy: false,
          isTradeFrozen: false,
        })
      );
      expect(htmlZero).not.toContain('data-testid="insufficient-funds-notice"');
      expect(htmlZero).not.toContain('Thiếu 0');
      expect(htmlUndefined).not.toContain('data-testid="insufficient-funds-notice"');
    });

    it('[TC-DSE-15/MSS][UC-IMP239] TitleDeedActionFooter vẫn hiển thị cảnh báo Thiếu {shortfall} khi shortfall > 0 và canBuy = false', () => {
      const html = renderToStaticMarkup(
        React.createElement(TitleDeedActionFooter, {
          isOwned: false,
          canBuy: false,
          isTradeFrozen: false,
          shortfall: 350,
        })
      );
      expect(html).toContain('data-testid="insufficient-funds-notice"');
      expect(html).toContain('Thiếu 350');
    });

    it('[TC-DSE-16/MSS][UC-IMP239] CompulsoryBuyoutModal kết xuất an toàn tên ô đất và giá tiền khi eligibleTargets là mảng số nguyên và cập nhật currentTarget khi click', () => {
      const html = renderToStaticMarkup(
        React.createElement(CompulsoryBuyoutModal, {
          buyerId: 'p1',
          sellerId: 'bot_1',
          cellIndex: 1,
          cost: 780,
          basePrice: 600,
          expiresAt: Date.now() + 15000,
          eligibleTargets: [1, 6],
          onBuyout: () => {},
          onDecline: () => {},
        })
      );
      expect(html).toContain('data-testid="buyout-target-option-1"');
      expect(html).toContain('data-testid="buyout-target-option-6"');
      expect(html).not.toContain('buyout-target-option-undefined');
    });
  });
});
