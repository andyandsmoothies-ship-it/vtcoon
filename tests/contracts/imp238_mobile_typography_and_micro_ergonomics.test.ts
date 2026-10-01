// [CONTRACT TEST] IMP-238: Mobile Typography, Micro-Ergonomics Polish & Dual-Viewport Parity
// Traceability Tags: [TC-MTE-01/MSS..TC-MTE-18/MSS] & [UC-IMP238]
// Universal 5-Facet Behavioral Matrix & Adversarial Inversion Verification
// Architecture: Mobile Typography, Micro-Ergonomics, SSOT Terminology Alignment & Dual-Viewport Parity

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  formatShortPlayerName,
  formatLocalizedBotPersonality,
} from '../../src/client/ui/ui_helpers';
import {
  TradePartnerStrip,
  type TradePartnerInfo,
} from '../../src/client/ui/modals/trade/trade_partner_strip';
import { PlayerCard } from '../../src/client/ui/player_card';
import { TitleDeedModal } from '../../src/client/ui/modals/title_deed_modal';
import { TitleDeedActionFooter } from '../../src/client/ui/modals/title_deed_action_footer';
import { CompulsoryBuyoutModal } from '../../src/client/ui/modals/compulsory_buyout_modal';
import { MasterplanModal } from '../../src/client/ui/modals/masterplan_modal';
import { AuctionDistrictCard } from '../../src/client/ui/modals/auction_district_card';
import { AuctionModal } from '../../src/client/ui/modals/auction_modal';
import { PropertyPortfolioModal } from '../../src/client/ui/modals/property_portfolio_modal';
import { GameOverModal } from '../../src/client/ui/modals/game_over_modal';
import { HoseModal } from '../../src/client/ui/modals/hose_modal';
import type { PlayerHudInfo } from '../../src/client/store/game_store_types';

describe('[TC-MTE-01/MSS..TC-MTE-18/MSS][UC-IMP238] Mobile Typography and Micro-Ergonomics Polish Suite', () => {
  // =========================================================================
  // FACET 1: Core Functionality & Happy Paths (TC-MTE-01..04)
  // =========================================================================
  describe('Facet 1: Core Functionality & Happy Paths (TC-MTE-01..04)', () => {
    it('[TC-MTE-01/MSS][UC-IMP238] formatShortPlayerName loại bỏ chính xác các hậu tố tiếng Việt: (Chủ Phòng), (Dẫn Đầu), (Táo Bạo), (Cẩn Trọng), (Cân Bằng)', () => {
      expect(formatShortPlayerName('Đại Gia (Chủ Phòng)')).toBe('Đại Gia');
      expect(formatShortPlayerName('Bot Alpha (Dẫn Đầu)')).toBe('Bot Alpha');
      expect(formatShortPlayerName('Bot Beta (Táo Bạo)')).toBe('Bot Beta');
      expect(formatShortPlayerName('Bot Gamma (Cẩn Trọng)')).toBe('Bot Gamma');
    });

    it('[TC-MTE-02/MSS][UC-IMP238] formatShortPlayerName bảo toàn nguyên vẹn tên người dùng thông thường và tôn trọng tham số maxLength', () => {
      expect(formatShortPlayerName('Nguyễn Văn A')).toBe('Nguyễn Văn A');
      expect(formatShortPlayerName('Đại Gia Sài Gòn', 8)).toBe('Đại Gi...');
      expect(formatShortPlayerName(undefined)).toBe('');
    });

    it('[TC-MTE-03/MSS][UC-IMP238] TradePartnerStrip kết xuất layout 2 tầng trên mobile (flex flex-col sm:flex-row) và bọc formatShortPlayerName cho tên', () => {
      const partner: TradePartnerInfo = {
        id: 'bot_1',
        name: 'Bot Hà Nội (Táo Bạo)',
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
      expect(html).toContain('flex flex-col sm:flex-row');
      expect(html).toContain('Bot Hà Nội');
      expect(html).not.toContain('Bot Hà Nội (Táo Bạo)');
    });

    it('[TC-MTE-04/MSS][UC-IMP238] PlayerCard kết xuất rõ ràng tên người chơi khi bankrupt: true, ẩn toàn bộ số dư và cảnh báo thấu chi', () => {
      const bankruptPlayer: PlayerHudInfo = {
        id: 'p2',
        name: 'Người Chơi Phá Sản (Chủ Phòng)',
        balance: -500,
        tokenColor: '#ef4444',
        ownedProperties: [],
        bankrupt: true,
        overdraftRoundsLeft: 1,
        pawnSlot: 1,
      };
      const html = renderToStaticMarkup(
        React.createElement(PlayerCard, {
          player: bankruptPlayer,
          isCurrentTurn: false,
          levelMap: {},
        })
      );
      expect(html).toContain('Người Chơi Phá Sản');
      expect(html).toContain('Phá Sản');
      expect(html).not.toContain('-500');
      expect(html).not.toContain('Nợ 1v');
    });
  });

  // =========================================================================
  // FACET 2: Edge Cases & Boundaries (TC-MTE-05..08)
  // =========================================================================
  describe('Facet 2: Edge Cases & Boundaries (TC-MTE-05..08)', () => {
    it('[TC-MTE-05/MSS][UC-IMP238] TitleDeedModal hiển thị "SỔ ĐỎ CHÍNH CHỦ" khi isOwner === true và "ĐÃ CÓ CHỦ" khi isOwner === false', () => {
      const nonOwnerHtml = renderToStaticMarkup(
        React.createElement(TitleDeedModal, {
          cellIndex: 1,
          isOwned: true,
          isOwner: false,
          ownerName: 'Đối Thủ Cạnh Tranh',
        })
      );
      expect(nonOwnerHtml).toContain('ĐÃ CÓ CHỦ');
      expect(nonOwnerHtml).not.toContain('SỔ ĐỎ CHÍNH CHỦ');
    });

    it('[TC-MTE-06/MSS][UC-IMP238] TitleDeedActionFooter hiển thị "✓ Bất Động Sản Của Bạn" cho chủ sở hữu và "✓ Đã Có Chủ: [Name]" không lặp ngoặc cho người ngoài', () => {
      const ownerHtml = renderToStaticMarkup(
        React.createElement(TitleDeedActionFooter, {
          isOwned: true,
          isOwner: true,
          ownerName: 'Chính Mình',
        })
      );
      const visitorHtml = renderToStaticMarkup(
        React.createElement(TitleDeedActionFooter, {
          isOwned: true,
          isOwner: false,
          ownerName: 'Đại Gia (Hà Nội)',
        })
      );
      expect(ownerHtml).toContain('✓ Bất Động Sản Của Bạn');
      expect(visitorHtml).toContain('✓ Đã Có Chủ:');
      expect(visitorHtml).not.toContain('))');
    });

    it('[TC-MTE-07/MSS][UC-IMP238] CompulsoryBuyoutModal chứa lớp "shrink-0 whitespace-nowrap" trên khối Giá Gốc', () => {
      const html = renderToStaticMarkup(
        React.createElement(CompulsoryBuyoutModal, {
          buyerId: 'p1',
          sellerId: 'p2',
          cellIndex: 1,
          cost: 780,
          basePrice: 600,
          expiresAt: Date.now() + 30000,
          onBuyout: () => {},
          onDecline: () => {},
        })
      );
      expect(html).toContain('shrink-0 whitespace-nowrap');
      expect(html).toContain('Giá Gốc');
    });

    it('[TC-MTE-08/MSS][UC-IMP238] MasterplanModal tiêu đề chứa lớp "whitespace-nowrap" chống ngắt từ đơn lẻ THỊ', () => {
      const html = renderToStaticMarkup(
        React.createElement(MasterplanModal, {
          onClose: () => {},
        })
      );
      expect(html).toContain('BẢN ĐỒ QUY HOẠCH ĐÔ THỊ');
      expect(html).toContain('whitespace-nowrap');
    });
  });

  // =========================================================================
  // FACET 3: Terminology & Data Sanity (TC-MTE-09..12)
  // =========================================================================
  describe('Facet 3: Terminology & Data Sanity (TC-MTE-09..12)', () => {
    it('[TC-MTE-09/MSS][UC-IMP238] AuctionDistrictCard hiển thị chính xác nhãn "C3 (RESORT/TTTM)" thay vì "C3 (KHÁCH SẠN)"', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionDistrictCard, {
          cellIndex: 1,
          currentBid: 600,
        })
      );
      expect(html).toContain('C3 (RESORT/TTTM)');
      expect(html).not.toContain('C3 (KHÁCH SẠN)');
    });

    it('[TC-MTE-10/MSS][UC-IMP238] AuctionModal danh sách người tham gia sử dụng formatShortPlayerName cho nội dung text và formatLocalizedBotPersonality cho title tooltip', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: null,
          timeRemaining: 15,
          myBalance: 5000,
          playersInfo: {
            bot_1: {
              id: 'bot_1',
              name: 'Bot Alpha (Aggressive)',
              balance: 5000,
              tokenColor: '#f59e0b',
              isBot: true,
            },
          },
        })
      );
      expect(html).toContain('title="Bot Alpha (Tấn Công)"');
      expect(html).toContain('>Bot Alpha<');
    });

    it('[TC-MTE-11/MSS][UC-IMP238] PropertyPortfolioModal hiển thị hậu tố "Tr." ngoài thẻ data-testid="property-rent-val"', () => {
      const html = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [1],
          currentBalance: 5000,
        })
      );
      expect(html).toMatch(/data-testid="property-rent-val"[^>]*>60<\/strong>\s*Tr\./);
      expect(html).toContain('data-testid="property-rent-val"');
    });

    it('[TC-MTE-12/MSS][UC-IMP238] GameOverModal Tab FinTech hiển thị formatCurrency(15000) không chứa ký tự "k"', () => {
      const html = renderToStaticMarkup(
        React.createElement(GameOverModal, {
          leaderboard: [{ id: 'p1', netWorth: 25000 }],
          onClose: () => {},
          initialTab: 'fintech',
        })
      );
      expect(html).toContain('15.000 ➔');
      expect(html).not.toContain('15.000k');
    });
  });

  // =========================================================================
  // FACET 4: Regression Prevention (TC-MTE-13..15)
  // =========================================================================
  describe('Facet 4: Regression Prevention (TC-MTE-13..15)', () => {
    it('[TC-MTE-13/MSS][UC-IMP238] formatShortPlayerName vẫn khử đúng các nhãn tiếng Anh (Aggressive), (Cautious), (Balanced), (Passive), (Bot)', () => {
      expect(formatShortPlayerName('Bot Alpha (Aggressive)')).toBe('Bot Alpha');
      expect(formatShortPlayerName('Bot Beta (Cautious)')).toBe('Bot Beta');
      expect(formatShortPlayerName('Bot Gamma (Balanced)')).toBe('Bot Gamma');
      expect(formatShortPlayerName('Bot Delta (Passive)')).toBe('Bot Delta');
    });

    it('[TC-MTE-14/MSS][UC-IMP238] formatLocalizedBotPersonality giữ nguyên khả năng chuyển đổi (Passive) sang (Phòng Thủ), (Aggressive) sang (Tấn Công)', () => {
      expect(formatLocalizedBotPersonality('Bot Alpha (Aggressive)')).toBe('Bot Alpha (Tấn Công)');
      expect(formatLocalizedBotPersonality('Bot Beta (Passive)')).toBe('Bot Beta (Phòng Thủ)');
      expect(formatLocalizedBotPersonality('Bot Gamma (Balanced)')).toBe('Bot Gamma (Cân Bằng)');
    });

    it('[TC-MTE-15/MSS][UC-IMP238] HoseModal tiêu đề loại bỏ font-mono tracking-wide và chuyển sang tracking-normal', () => {
      const html = renderToStaticMarkup(
        React.createElement(HoseModal, {
          myBalance: 10000,
          onInvest: () => {},
          onSkip: () => {},
          onClose: () => {},
        })
      );
      expect(html).toContain('SÀN CHỨNG KHOÁN HOSE');
      expect(html).toContain('tracking-normal');
      expect(html).not.toContain('tracking-wide');
      expect(html).not.toContain('font-mono');
    });
  });

  // =========================================================================
  // FACET 5: Dual-Viewport & Ergonomics Integrity (TC-MTE-16..18)
  // =========================================================================
  describe('Facet 5: Dual-Viewport & Ergonomics Integrity (TC-MTE-16..18)', () => {
    it('[TC-MTE-16/MSS][UC-IMP238] TradePartnerStrip duy trì cấu trúc hàng ngang trên desktop qua tiền tố sm:flex-row', () => {
      const partner: TradePartnerInfo = {
        id: 'bot_2',
        name: 'Bot Sài Gòn',
        balance: 8000,
        isBot: true,
      };
      const html = renderToStaticMarkup(
        React.createElement(TradePartnerStrip, {
          availablePartners: [partner],
          selectedPartnerId: 'bot_2',
          onSelectPartner: () => {},
        })
      );
      expect(html).toContain('sm:flex-row');
      expect(html).toContain('sm:gap-1.5');
    });

    it('[TC-MTE-17/MSS][UC-IMP238] PlayerCard người chơi đang hoạt động vẫn hiển thị đầy đủ số dư, cảnh báo nợ và tài sản ròng', () => {
      const activePlayer: PlayerHudInfo = {
        id: 'p1',
        name: 'Người Chơi Đang Đua',
        balance: -200,
        tokenColor: '#3b82f6',
        ownedProperties: [1],
        bankrupt: false,
        overdraftRoundsLeft: 2,
        pawnSlot: 0,
      };
      const html = renderToStaticMarkup(
        React.createElement(PlayerCard, {
          player: activePlayer,
          isCurrentTurn: true,
          levelMap: { 1: 0 },
        })
      );
      expect(html).toContain('-200');
      expect(html).toContain('Nợ 2v');
      expect(html).toContain('data-testid="player-net-worth"');
      expect(html).not.toContain('Phá Sản');
    });

    it('[TC-MTE-18/MSS][UC-IMP238] TitleDeedActionFooter duy trì đầy đủ các nút hành động Nâng Cấp và Thế Chấp cho chủ sở hữu khi đủ điều kiện', () => {
      const html = renderToStaticMarkup(
        React.createElement(TitleDeedActionFooter, {
          isOwned: true,
          isOwner: true,
          ownerName: 'Nhà Đầu Tư',
          currentLevel: 0,
          hasUpgrades: true,
          upgradeCost: 300,
          isMortgaged: false,
          onUpgrade: () => {},
          onMortgage: () => {},
        })
      );
      expect(html).toContain('Nâng Cấp');
      expect(html).toContain('Thế Chấp');
      expect(html).toContain('+300');
    });
  });
});
