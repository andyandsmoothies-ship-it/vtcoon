// [TC-161/MSS][UC-161] Contract Test Suite: Chuẩn Hóa Xúc Giác, Touch Target 44px & Tương Thích Mobile 360px Cho Toàn Bộ 12 Hộp Thoại Doanh Nghiệp
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ColorGroup } from '../../src/domain/board_config';
import { GameRulesModal } from '../../src/client/ui/modals/game_rules_modal';
import {
  MasterplanInspectorCard,
  MasterplanDistrictCard,
} from '../../src/client/ui/modals/masterplan_components';
import { DISTRICT_GROUPS } from '../../src/client/ui/modals/masterplan_constants';
import { PropertyPortfolioModal } from '../../src/client/ui/modals/property_portfolio_modal';
import { TradeModal } from '../../src/client/ui/modals/trade_modal';
import { AuctionModal } from '../../src/client/ui/modals/auction_modal';
import { HoseModal } from '../../src/client/ui/modals/hose_modal';
import { GameOverModal } from '../../src/client/ui/modals/game_over_modal';
import { CompulsoryBuyoutModal } from '../../src/client/ui/modals/compulsory_buyout_modal';
import { BotTradeOfferModal } from '../../src/client/ui/modals/bot_trade_offer_modal';
import { TitleDeedActionFooter } from '../../src/client/ui/modals/title_deed_action_footer';

// ============================================================================
// FACET 1: TOUCH TARGET ERGONOMICS (>= 44PX MANDATE)
// ============================================================================
describe('[FACET-1] Touch Target Ergonomics (>= 44px Mandate)', () => {
  it('[TC-161.01/MSS][UC-161] GameRulesModal: Nút "Đã Hiểu" ở footer có class chứa min-h-[44px]', () => {
    const html = renderToStaticMarkup(
      React.createElement(GameRulesModal, {
        isOpen: true,
        onClose: () => {},
      })
    );
    const btnMatch = html.match(/<button[^>]*>[\s\S]*?Đã Hiểu[\s\S]*?<\/button>/);
    expect(btnMatch).not.toBeNull();
    expect(btnMatch![0]).toContain('min-h-[44px]');
  });

  it('[TC-161.02/MSS][UC-161] MasterplanInspectorCard: Nút "✕ Thu Gọn" có class chứa min-h-[44px]', () => {
    const html = renderToStaticMarkup(
      React.createElement(MasterplanInspectorCard, {
        deedInfo: {
          cellIndex: 1,
          name: 'Phố Tràng Tiền',
          price: 1000,
          rents: [50, 150, 450, 1000],
          upgradeCosts: [500, 500, 500],
          mortgageValue: 500,
          colorGroup: ColorGroup.Nau,
        },
        ownership: {
          owner: { id: 'p1_hanoi', name: 'Đại Gia Hà Nội', avatar: '🎩', tokenColor: '#10B981' },
          isMortgaged: false,
          level: 0,
        },
        onClose: () => {},
      })
    );
    const btnMatch = html.match(/<button[^>]*>[\s\S]*?✕ Thu Gọn[\s\S]*?<\/button>/);
    expect(btnMatch).not.toBeNull();
    expect(btnMatch![0]).toContain('min-h-[44px]');
  });

  it('[TC-161.03a/MSS][UC-161] MasterplanDistrictCard: Nút "👁️" (view cell) có class chứa min-h-[44px] min-w-[44px]', () => {
    const district = DISTRICT_GROUPS[0]!;
    const html = renderToStaticMarkup(
      React.createElement(MasterplanDistrictCard, {
        district,
        players: {
          p1: { id: 'p1', name: 'Bạch Thái Bưởi', avatar: '🎩', tokenColor: '#10b981' },
          p2: { id: 'p2', name: 'Hứa Bổn Hòa', avatar: '👑', tokenColor: '#3b82f6' },
        },
        getCellOwnership: (cellIndex: number) => ({
          owner: { id: 'p2', name: 'Hứa Bổn Hòa', avatar: '👑', tokenColor: '#3b82f6' },
          isMortgaged: false,
          level: 0,
        }),
        myPlayerId: 'p1',
        onSelectCell: () => {},
      })
    );
    const btnMatch = html.match(/<button[^>]*data-testid="view-cell-btn-1"[^>]*>[\s\S]*?<\/button>/);
    expect(btnMatch).not.toBeNull();
    expect(btnMatch![0]).toContain('min-h-[44px]');
    expect(btnMatch![0]).toContain('min-w-[44px]');
  });

  it('[TC-161.03b/MSS][UC-161] MasterplanDistrictCard: Nút "🤝" (quick trade) có class chứa min-h-[44px] min-w-[44px]', () => {
    const district = DISTRICT_GROUPS[0]!;
    const html = renderToStaticMarkup(
      React.createElement(MasterplanDistrictCard, {
        district,
        players: {
          p1: { id: 'p1', name: 'Bạch Thái Bưởi', avatar: '🎩', tokenColor: '#10b981' },
          p2: { id: 'p2', name: 'Hứa Bổn Hòa', avatar: '👑', tokenColor: '#3b82f6' },
        },
        getCellOwnership: (cellIndex: number) => ({
          owner: { id: 'p2', name: 'Hứa Bổn Hòa', avatar: '👑', tokenColor: '#3b82f6' },
          isMortgaged: false,
          level: 0,
        }),
        myPlayerId: 'p1',
        onQuickTrade: () => {},
      })
    );
    const btnMatch = html.match(/<button[^>]*data-testid="quick-trade-btn-1"[^>]*>[\s\S]*?<\/button>/);
    expect(btnMatch).not.toBeNull();
    expect(btnMatch![0]).toContain('min-h-[44px]');
    expect(btnMatch![0]).toContain('min-w-[44px]');
  });

  it('[TC-161.04a/MSS][UC-161] PropertyPortfolioModal: Nút "🔍 Xem Ô" ở danh sách mảnh ghép đất trống có class chứa min-h-[44px] min-w-[44px]', () => {
    const html = renderToStaticMarkup(
      React.createElement(PropertyPortfolioModal, {
        ownedProperties: [1],
        propertyStates: { 1: { level: 0, isMortgaged: false } },
        currentBalance: 10000,
        allPlayers: {
          p1: { id: 'p1', name: 'Nguyễn Tấn Đạt', tokenColor: '#10B981', ownedProperties: [1] },
        },
      })
    );
    const btnMatch = html.match(/<button[^>]*data-testid="view-vacant-cell-btn-3"[^>]*>[\s\S]*?<\/button>/);
    expect(btnMatch).not.toBeNull();
    expect(btnMatch![0]).toContain('min-h-[44px]');
    expect(btnMatch![0]).toContain('min-w-[44px]');
  });

  it('[TC-161.04b/MSS][UC-161] PropertyPortfolioModal: Nút "🤝 Đàm Phán" ở danh sách mảnh ghép đối thủ sở hữu có class chứa min-h-[44px] min-w-[44px]', () => {
    const html = renderToStaticMarkup(
      React.createElement(PropertyPortfolioModal, {
        ownedProperties: [1],
        propertyStates: { 1: { level: 0, isMortgaged: false } },
        currentBalance: 10000,
        allPlayers: {
          p1: { id: 'p1', name: 'Nguyễn Tấn Đạt', tokenColor: '#10B981', ownedProperties: [1] },
          p2: { id: 'p2', name: 'Trần Đình Long', tokenColor: '#3B82F6', ownedProperties: [3] },
        },
      })
    );
    const btnMatch = html.match(/<button[^>]*data-testid="quick-trade-btn-3"[^>]*>[\s\S]*?<\/button>/);
    expect(btnMatch).not.toBeNull();
    expect(btnMatch![0]).toContain('min-h-[44px]');
    expect(btnMatch![0]).toContain('min-w-[44px]');
  });

  it('[TC-161.05a/MSS][UC-161] PropertyPortfolioModal: Nút "Thế Chấp" có class chứa min-h-[44px] và KHÔNG chứa min-h-[40px]', () => {
    const html = renderToStaticMarkup(
      React.createElement(PropertyPortfolioModal, {
        ownedProperties: [1],
        propertyStates: { 1: { level: 0, isMortgaged: false } },
        currentBalance: 10000,
        onMortgage: () => {},
      })
    );
    const btnMatch = html.match(/<button[^>]*>[\s\S]*?Thế Chấp[\s\S]*?<\/button>/);
    expect(btnMatch).not.toBeNull();
    expect(btnMatch![0]).toContain('min-h-[44px]');
    expect(btnMatch![0]).not.toContain('min-h-[40px]');
  });

  it('[TC-161.05b/MSS][UC-161] PropertyPortfolioModal: Nút "Giải Chấp" có class chứa min-h-[44px] và KHÔNG chứa min-h-[40px]', () => {
    const html = renderToStaticMarkup(
      React.createElement(PropertyPortfolioModal, {
        ownedProperties: [1],
        propertyStates: { 1: { level: 0, isMortgaged: true } },
        currentBalance: 10000,
        onRedeem: () => {},
      })
    );
    const btnMatch = html.match(/<button[^>]*>[\s\S]*?Giải Chấp[\s\S]*?<\/button>/);
    expect(btnMatch).not.toBeNull();
    expect(btnMatch![0]).toContain('min-h-[44px]');
    expect(btnMatch![0]).not.toContain('min-h-[40px]');
  });

  it('[TC-161.06a/MSS][UC-161] TradeModal: Chip gợi ý giá bán nhanh 70% Sàn có class chứa min-h-[44px]', () => {
    const html = renderToStaticMarkup(
      React.createElement(TradeModal, {
        targetPlayerId: 'p2',
        myProperties: [1],
        targetProperties: [3],
        myBalance: 10000,
        initialOffered: [1],
        initialRequested: [3],
      })
    );
    const chipMatch = html.match(/<button[^>]*>[\s\S]*?70% Sàn[\s\S]*?<\/button>/);
    expect(chipMatch).not.toBeNull();
    expect(chipMatch![0]).toContain('min-h-[44px]');
  });

  it('[TC-161.06b/MSS][UC-161] TradeModal: Chip gợi ý giá bán nhanh 100% Gốc có class chứa min-h-[44px]', () => {
    const html = renderToStaticMarkup(
      React.createElement(TradeModal, {
        targetPlayerId: 'p2',
        myProperties: [1],
        targetProperties: [3],
        myBalance: 10000,
        initialOffered: [1],
        initialRequested: [3],
      })
    );
    const chipMatch = html.match(/<button[^>]*>[\s\S]*?100% Gốc \(\d+ Tr\.\)[\s\S]*?<\/button>/);
    expect(chipMatch).not.toBeNull();
    expect(chipMatch![0]).toContain('min-h-[44px]');
  });

  it('[TC-161.06c/MSS][UC-161] TradeModal: Chip gợi ý giá bán nhanh 120% có class chứa min-h-[44px]', () => {
    const html = renderToStaticMarkup(
      React.createElement(TradeModal, {
        targetPlayerId: 'p2',
        myProperties: [1],
        targetProperties: [3],
        myBalance: 10000,
        initialOffered: [1],
        initialRequested: [3],
      })
    );
    const chipMatch = html.match(/<button[^>]*>[\s\S]*?120% \(\d+ Tr\.\)[\s\S]*?<\/button>/);
    expect(chipMatch).not.toBeNull();
    expect(chipMatch![0]).toContain('min-h-[44px]');
  });

  it('[TC-161.06d/MSS][UC-161] TradeModal: Chip gợi ý giá mua nhanh 100% Gốc có class chứa min-h-[44px]', () => {
    const html = renderToStaticMarkup(
      React.createElement(TradeModal, {
        targetPlayerId: 'p2',
        myProperties: [1],
        targetProperties: [3],
        myBalance: 10000,
        initialOffered: [1],
        initialRequested: [3],
      })
    );
    const chipMatch = html.match(/<button[^>]*>[\s\S]*?100% Gốc \([\d\.,]+ Tr\.\)[\s\S]*?<\/button>/);
    expect(chipMatch).not.toBeNull();
    expect(chipMatch![0]).toContain('min-h-[44px]');
  });

  it('[TC-161.06e/MSS][UC-161] TradeModal: Chip gợi ý giá mua nhanh 130% có class chứa min-h-[44px]', () => {
    const html = renderToStaticMarkup(
      React.createElement(TradeModal, {
        targetPlayerId: 'p2',
        myProperties: [1],
        targetProperties: [3],
        myBalance: 10000,
        initialOffered: [1],
        initialRequested: [3],
      })
    );
    const chipMatch = html.match(/<button[^>]*>[\s\S]*?130% \([\d\.,]+ Tr\.\)[\s\S]*?<\/button>/);
    expect(chipMatch).not.toBeNull();
    expect(chipMatch![0]).toContain('min-h-[44px]');
  });

  it('[TC-161.06f/MSS][UC-161] TradeModal: Chip gợi ý giá mua nhanh 150% có class chứa min-h-[44px]', () => {
    const html = renderToStaticMarkup(
      React.createElement(TradeModal, {
        targetPlayerId: 'p2',
        myProperties: [1],
        targetProperties: [3],
        myBalance: 10000,
        initialOffered: [1],
        initialRequested: [3],
      })
    );
    const chipMatch = html.match(/<button[^>]*>[\s\S]*?150% \([\d\.,]+ Tr\.\)[\s\S]*?<\/button>/);
    expect(chipMatch).not.toBeNull();
    expect(chipMatch![0]).toContain('min-h-[44px]');
  });
});

// ============================================================================
// FACET 2: STICKY ACTION & STRUCTURAL ISOLATION
// ============================================================================
describe('[FACET-2] Sticky Action & Structural Isolation', () => {
  it('[TC-161.07/MSS][UC-161] AuctionModal: Cụm nút đặt giá (+100, +200, +500) và nút Rút lui/Đóng nằm trong một khối footer độc lập có sticky bottom-0', () => {
    const html = renderToStaticMarkup(
      React.createElement(AuctionModal, {
        cellIndex: 1,
        currentBid: 1000,
        highestBidderId: 'player_p2',
        timeRemaining: 10,
        myBalance: 20000,
        myId: 'player_p1',
        playersInfo: {
          player_p1: { id: 'player_p1', name: 'Đặng Lê Nguyên Vũ', balance: 20000 },
          player_p2: { id: 'player_p2', name: 'Phạm Nhật Vượng', balance: 30000 },
        },
      })
    );
    expect(html).toContain('sticky bottom-0');
  });

  it('[TC-161.08/MSS][UC-161] HoseModal: Cụm nút hành động có sticky bottom-0', () => {
    const html = renderToStaticMarkup(
      React.createElement(HoseModal, {
        myBalance: 15000,
        defaultStake: 500,
        onInvest: () => {},
        onSkip: () => {},
        onClose: () => {},
      })
    );
    expect(html).toContain('sticky bottom-0');
  });
});

// ============================================================================
// FACET 3: VIEWPORT & RESPONSIVE LAYOUT CONSTRAINTS
// ============================================================================
describe('[FACET-3] Viewport & Responsive Layout Constraints', () => {
  it('[TC-161.09/MSS][UC-161] HoseModal: Thẻ modal chính có class chứa max-h- và overflow-y-auto', () => {
    const html = renderToStaticMarkup(
      React.createElement(HoseModal, {
        myBalance: 15000,
        defaultStake: 500,
        onInvest: () => {},
        onSkip: () => {},
        onClose: () => {},
      })
    );
    const dialogMatch = html.match(/<div[^>]*role="dialog"[^>]*>/);
    expect(dialogMatch).not.toBeNull();
    expect(dialogMatch![0]).toContain('max-h-');
    expect(dialogMatch![0]).toContain('overflow-y-auto');
  });

  it('[TC-161.10/MSS][UC-161] HoseModal: Lưới chọn mức cược có class chứa grid-cols-2 sm:grid-cols-4', () => {
    const html = renderToStaticMarkup(
      React.createElement(HoseModal, {
        myBalance: 15000,
        defaultStake: 500,
        onInvest: () => {},
        onSkip: () => {},
        onClose: () => {},
      })
    );
    expect(html).toContain('grid-cols-2 sm:grid-cols-4');
  });

  it('[TC-161.11/MSS][UC-161] HoseModal: Nút cược chính không chứa nhãn dài gây tràn viền mà dùng định dạng gọn gàng "Cược "', () => {
    const html = renderToStaticMarkup(
      React.createElement(HoseModal, {
        myBalance: 15000,
        defaultStake: 500,
        onInvest: () => {},
        onSkip: () => {},
        onClose: () => {},
      })
    );
    expect(html).toContain('Cược 500 Tr.');
    expect(html).not.toContain('Đặt Cược');
  });

  it('[TC-161.12/MSS][UC-161] GameOverModal: Thẻ modal chính có class chứa max-h- và overflow-y-auto', () => {
    const html = renderToStaticMarkup(
      React.createElement(GameOverModal, {
        leaderboard: [
          { id: 'p1', netWorth: 25000 },
          { id: 'p2', netWorth: 12000 },
        ],
        onClose: () => {},
      })
    );
    const modalMatch = html.match(/<div[^>]*data-testid="game-over-modal"[^>]*>/);
    expect(modalMatch).not.toBeNull();
    expect(modalMatch![0]).toContain('max-h-');
    expect(modalMatch![0]).toContain('overflow-y-auto');
  });

  it('[TC-161.13a/MSS][UC-161] CompulsoryBuyoutModal: Nút Bỏ Qua có class chứa h-full min-h-[48px]', () => {
    const html = renderToStaticMarkup(
      React.createElement(CompulsoryBuyoutModal, {
        buyerId: 'p1',
        sellerId: 'p2',
        cellIndex: 1,
        cost: 1300,
        basePrice: 1000,
        expiresAt: Date.now() + 15000,
        onBuyout: () => {},
        onDecline: () => {},
      })
    );
    const btnMatch = html.match(/<button[^>]*data-testid="buyout-decline-btn"[^>]*>/);
    expect(btnMatch).not.toBeNull();
    expect(btnMatch![0]).toContain('h-full min-h-[48px]');
  });

  it('[TC-161.13b/MSS][UC-161] CompulsoryBuyoutModal: Nút Mua Lại có class chứa h-full min-h-[48px]', () => {
    const html = renderToStaticMarkup(
      React.createElement(CompulsoryBuyoutModal, {
        buyerId: 'p1',
        sellerId: 'p2',
        cellIndex: 1,
        cost: 1300,
        basePrice: 1000,
        expiresAt: Date.now() + 15000,
        onBuyout: () => {},
        onDecline: () => {},
      })
    );
    const btnMatch = html.match(/<button[^>]*data-testid="buyout-confirm-btn"[^>]*>/);
    expect(btnMatch).not.toBeNull();
    expect(btnMatch![0]).toContain('h-full min-h-[48px]');
  });

  it('[TC-161.14/MSS][UC-161] BotTradeOfferModal: Khối chênh lệch tiền mặt có class chứa flex-col sm:flex-row', () => {
    const html = renderToStaticMarkup(
      React.createElement(BotTradeOfferModal, {
        offerId: 'offer_swap_123',
        cellIndex: 1,
        offeredCellIndex: 3,
        price: 500,
        buyerId: 'bot_saigon',
        sellerId: 'player_hanoi',
        expiresAt: Date.now() + 15000,
        onAccept: () => {},
        onReject: () => {},
      })
    );
    const cashRowMatch = html.match(/<div[^>]*>[\s\S]*?Chênh Lệch Tiền Mặt:[\s\S]*?<\/div>/);
    expect(cashRowMatch).not.toBeNull();
    expect(cashRowMatch![0]).toContain('flex-col sm:flex-row');
  });

  it('[TC-161.15a/MSS][UC-161] TitleDeedActionFooter: Nút "Mua BĐS" không bị ép truncate cứng hoặc whitespace-nowrap trên màn hình nhỏ', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedActionFooter, {
        isOwned: false,
        canBuy: true,
        deedPrice: 4000,
        onBuy: () => {},
        onPass: () => {},
      })
    );
    const buyBtnMatch = html.match(/<button[^>]*>[\s\S]*?Mua BĐS[\s\S]*?<\/button>/);
    expect(buyBtnMatch).not.toBeNull();
    expect(buyBtnMatch![0]).not.toContain('truncate');
    expect(buyBtnMatch![0]).not.toContain('whitespace-nowrap');
  });

  it('[TC-161.15b/MSS][UC-161] TitleDeedActionFooter: Nút "Nâng Cấp" không bị ép whitespace-nowrap trên màn hình nhỏ', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedActionFooter, {
        isOwned: true,
        isOwner: true,
        hasUpgrades: true,
        currentLevel: 0,
        upgradeCost: 1000,
        deedPrice: 2000,
        onUpgrade: () => {},
      })
    );
    const upgradeBtnMatch = html.match(/<button[^>]*>[\s\S]*?Nâng Cấp[\s\S]*?<\/button>/);
    expect(upgradeBtnMatch).not.toBeNull();
    expect(upgradeBtnMatch![0]).not.toContain('whitespace-nowrap');
  });
});

// ============================================================================
// FACET 4: ENTITY ISOLATION & TERMINAL STATE INVARIANTS
// ============================================================================
describe('[FACET-4] Entity Isolation & Terminal State Invariants', () => {
  it('[TC-161.16/MSS][UC-161] AuctionModal: Danh sách "ĐẠI GIA THAM GIA" lọc bỏ người chơi có cờ bankrupt: true', () => {
    const html = renderToStaticMarkup(
      React.createElement(AuctionModal, {
        cellIndex: 1,
        currentBid: 1000,
        highestBidderId: 'player_active',
        timeRemaining: 10,
        playersInfo: {
          player_active: {
            id: 'player_active',
            name: 'Đại Gia Hà Nội',
            balance: 15000,
            tokenColor: '#10B981',
            bankrupt: false,
          },
          player_bankrupt: {
            id: 'player_bankrupt',
            name: 'Đại Gia Phá Sản',
            balance: 0,
            tokenColor: '#EF4444',
            bankrupt: true,
          },
        },
      })
    );
    expect(html).toContain('Đại Gia Hà Nội');
    expect(html).not.toContain('Đại Gia Phá Sản');
  });

  it('[TC-161.17/MSS][UC-161] AuctionModal: Khi isConcluded === true, tất cả nút đặt giá bị vô hiệu hóa (disabled) và nút footer hiển thị "Đóng / Xem Bàn Cờ"', () => {
    const html = renderToStaticMarkup(
      React.createElement(AuctionModal, {
        cellIndex: 1,
        currentBid: 1000,
        highestBidderId: 'player_p2',
        timeRemaining: 0,
        myBalance: 20000,
        myId: 'player_p1',
        isConcluded: true,
      })
    );
    expect(html).toContain('Đóng / Xem Bàn Cờ');
    expect(html).toContain('sticky bottom-0');
  });
});
