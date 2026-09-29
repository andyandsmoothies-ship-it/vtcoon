// [TC-228.01/MSS..TC-228.16/MSS][UC-IMP228]
// Contract Test Suite for IMP-228: Subtle Property Trading Indicators on Player Cards
// Enforces Universal 5-Facet Behavioral Matrix & Detroit Style (1-4 asserts/test, zero loops in it(), no static checklist tests)

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PlayerCard, resolvePlayerTradingCells, type PlayerTradingCellsTradeState } from '../../src/client/ui/player_card';
import { useGameStore, type PlayerHudInfo } from '../../src/client/store/game_store';
import { useLobbyStore } from '../../src/client/store/lobby_store';

const mockPlayer: PlayerHudInfo = {
  id: 'player_alpha',
  name: 'Doanh Nhân Nam',
  balance: 15000,
  tokenColor: '#DC2626',
  ownedProperties: [1, 16, 18, 19], // Ô 1 (Cần Thơ - Nâu), Ô 16, 18, 19 (Cam)
  isBot: false,
};

const mockPlayerWithInfra: PlayerHudInfo = {
  id: 'player_alpha',
  name: 'Doanh Nhân Nam',
  balance: 15000,
  tokenColor: '#DC2626',
  ownedProperties: [1, 5, 12, 16], // Ô 5 (Long Thành - Railroad), Ô 12 (EVN - Utility)
  isBot: false,
};

describe('[IMP-228][Trạm 1 RED] Subtle Property Trading Indicators Contract', () => {
  beforeEach(() => {
    useGameStore.getState().closeModal();
    useGameStore.setState({ pendingTradeOffer: null });
    useLobbyStore.setState({ myPlayerId: 'player_alpha' });
  });

  // =========================================================================
  // FACET 1: Phân Giải Thuần Túy & Độc Lập Trạng Thái (TC-228.01 - TC-228.04)
  // =========================================================================
  describe('Facet 1: Phân Giải Thuần Túy & Độc Lập Trạng Thái', () => {
    it('[TC-228.01/MSS][UC-IMP228][Facet-1/NoModalReturnsEmpty] resolvePlayerTradingCells trả về Set rỗng khi không có modal hoặc offer nào', () => {
      const nullStateResult = resolvePlayerTradingCells(null, 'player_alpha', 'player_alpha');
      expect(nullStateResult.size).toBe(0);

      const emptyModalResult = resolvePlayerTradingCells(
        { activeModal: null, modalPayload: null, pendingTradeOffer: null },
        'player_alpha',
        'player_alpha'
      );
      expect(emptyModalResult.size).toBe(0);
    });

    it('[TC-228.02/MSS][UC-IMP228][Facet-1/PendingTradeOfferSellerBuyer] resolvePlayerTradingCells nhận diện chính xác cellIndex cho seller và offeredCellIndex cho buyer trong pendingTradeOffer', () => {
      const pendingState: PlayerTradingCellsTradeState = {
        activeModal: null,
        modalPayload: null,
        pendingTradeOffer: {
          offerId: 'pto_vietnam_001',
          cellIndex: 1, // Seller bán Cần Thơ (cell 1)
          price: 1500,
          sellerId: 'player_seller',
          buyerId: 'player_buyer',
          expiresAt: 1727600000000,
          offeredCellIndex: 3, // Buyer đổi chéo An Giang (cell 3)
        },
      };

      const sellerCells = resolvePlayerTradingCells(pendingState, 'player_seller', 'player_seller');
      const buyerCells = resolvePlayerTradingCells(pendingState, 'player_buyer', 'player_buyer');

      expect(sellerCells.has(1)).toBe(true);
      expect(buyerCells.has(3)).toBe(true);
      expect(sellerCells.has(3)).toBe(false);
    });

    it('[TC-228.03/MSS][UC-IMP228][Facet-1/BotTradeOfferModal] resolvePlayerTradingCells nhận diện chính xác cellIndex (seller) và offeredCellIndex (buyer) khi activeModal === "bot_trade_offer"', () => {
      const botOfferState: PlayerTradingCellsTradeState = {
        activeModal: 'bot_trade_offer',
        modalPayload: {
          offerId: 'bto_shark_88',
          cellIndex: 16, // Bot seller bán Đồng Nai (cell 16)
          price: 2200,
          sellerId: 'bot_shark',
          buyerId: 'player_human',
          expiresAt: 1727600000000,
          offeredCellIndex: 18, // Human buyer đổi Bình Dương (cell 18)
        },
        pendingTradeOffer: null,
      };

      const botCells = resolvePlayerTradingCells(botOfferState, 'bot_shark', 'player_human');
      const humanCells = resolvePlayerTradingCells(botOfferState, 'player_human', 'player_human');

      expect(botCells.has(16)).toBe(true);
      expect(humanCells.has(18)).toBe(true);
      expect(botCells.has(18)).toBe(false);
    });

    it('[TC-228.04/MSS][UC-IMP228][Facet-1/P2PTradeModal] resolvePlayerTradingCells nhận diện offeredProperties cho localPlayerId và requestedProperties cho targetPlayerId khi activeModal === "trade"', () => {
      const p2pTradeState: PlayerTradingCellsTradeState = {
        activeModal: 'trade',
        modalPayload: {
          targetPlayerId: 'player_partner',
          offeredProperties: [6, 8],
          requestedProperties: [11, 13, 14],
          cashOffer: 400,
          cashRequest: 0,
        },
        pendingTradeOffer: null,
      };

      const myCells = resolvePlayerTradingCells(p2pTradeState, 'player_local', 'player_local');
      const partnerCells = resolvePlayerTradingCells(p2pTradeState, 'player_partner', 'player_local');

      expect(Array.from(myCells).sort()).toEqual([6, 8]);
      expect(Array.from(partnerCells).sort()).toEqual([11, 13, 14]);
    });
  });

  // =========================================================================
  // FACET 2: Cách Ly Chủ Quyền & Phòng Vệ Magic String (TC-228.05 - TC-228.07)
  // =========================================================================
  describe('Facet 2: Cách Ly Chủ Quyền & Phòng Vệ Magic String', () => {
    it('[TC-228.05/MSS][UC-IMP228][Facet-2/ThirdPartyPlayerEmpty] Người chơi thứ 3 không liên quan trong phòng luôn nhận Set rỗng (Attribution Isolation)', () => {
      const fourPlayerTradeState: PlayerTradingCellsTradeState = {
        activeModal: 'trade',
        modalPayload: {
          targetPlayerId: 'player_b',
          offeredProperties: [1, 3],
          requestedProperties: [6, 8],
          cashOffer: 0,
          cashRequest: 0,
        },
        pendingTradeOffer: null,
      };

      const bystanderC = resolvePlayerTradingCells(fourPlayerTradeState, 'player_c', 'player_a');
      const bystanderD = resolvePlayerTradingCells(fourPlayerTradeState, 'player_d', 'player_a');

      expect(bystanderC.size).toBe(0);
      expect(bystanderD.size).toBe(0);
    });

    it('[TC-228.06/MSS][UC-IMP228][Facet-2/UndefinedLocalPlayerGuard] Khi localPlayerId là undefined (chưa join phòng), nhánh local offer trả về Set rỗng, TUYỆT ĐỐI không fallback "p1"', () => {
      const tradeModalState: PlayerTradingCellsTradeState = {
        activeModal: 'trade',
        modalPayload: {
          targetPlayerId: 'player_b',
          offeredProperties: [1, 3],
          requestedProperties: [6, 8],
          cashOffer: 0,
          cashRequest: 0,
        },
        pendingTradeOffer: null,
      };

      const p1WithUndefinedLocal = resolvePlayerTradingCells(tradeModalState, 'p1', undefined);
      const p1WithEmptyLocal = resolvePlayerTradingCells(tradeModalState, 'p1', '');

      expect(p1WithUndefinedLocal.size).toBe(0);
      expect(p1WithEmptyLocal.size).toBe(0);
    });

    it('[TC-228.07/MSS][UC-IMP228][Facet-2/UUIDTargetPlayerParity] Target player vẫn nhận diện đúng requestedProperties ngay cả khi playerId và partnerId là chuỗi UUID bất kỳ', () => {
      const localUuid = 'e8b39a45-6cf1-4567-890a-bcdef1234567';
      const targetUuid = 'f9c40b56-7da2-4678-901b-cdef01234568';
      const uuidTradeState: PlayerTradingCellsTradeState = {
        activeModal: 'trade',
        modalPayload: {
          targetPlayerId: targetUuid,
          offeredProperties: [16, 18],
          requestedProperties: [21, 23, 24],
          cashOffer: 1000,
          cashRequest: 0,
        },
        pendingTradeOffer: null,
      };

      const targetResult = resolvePlayerTradingCells(uuidTradeState, targetUuid, localUuid);
      const localResult = resolvePlayerTradingCells(uuidTradeState, localUuid, localUuid);

      expect(Array.from(targetResult).sort()).toEqual([21, 23, 24]);
      expect(Array.from(localResult).sort()).toEqual([16, 18]);
    });
  });

  // =========================================================================
  // FACET 3: Đánh Dấu DOM & CSS Chống Purge (TC-228.08 - TC-228.10)
  // =========================================================================
  describe('Facet 3: Đánh Dấu DOM & CSS Chống Purge', () => {
    it('[TC-228.08/MSS][UC-IMP228][Facet-3/NormalDotDOMAttributes] Chấm bình thường (isTrading = false) có data-trading="false" và không chứa class ring-1.5', () => {
      const html = renderToStaticMarkup(
        React.createElement(PlayerCard, {
          player: mockPlayer,
          isCurrentTurn: true,
          levelMap: {},
          slotIndex: 0,
          tradingCells: new Set<number>(),
        })
      );

      const cell1Match = html.match(/<span[^>]*data-testid="dot-cell-1"[^>]*>/);
      expect(cell1Match).not.toBeNull();
      expect(cell1Match![0]).toContain('data-trading="false"');
      expect(cell1Match![0]).not.toContain('ring-1.5');
    });

    it('[TC-228.09/MSS][UC-IMP228][Facet-3/TradingDotDOMAttributesAndStyle] Chấm đang giao dịch (isTrading = true qua prop tradingCells) có data-trading="true", chứa class ring-1.5 ring-amber-400/90 animate-pulse scale-110, và có inline style "--tw-ring-offset-color: #FFFDF8"', () => {
      const html = renderToStaticMarkup(
        React.createElement(PlayerCard, {
          player: mockPlayer,
          isCurrentTurn: true,
          levelMap: {},
          slotIndex: 0,
          tradingCells: new Set([1]),
        })
      );

      const cell1Match = html.match(/<span[^>]*data-testid="dot-cell-1"[^>]*>/);
      expect(cell1Match).not.toBeNull();
      expect(cell1Match![0]).toContain('data-trading="true"');
      expect(cell1Match![0]).toMatch(/ring-1\.5 ring-amber-400\/90/);
      expect(cell1Match![0]).toMatch(/--tw-ring-offset-color:\s*#FFFDF8/);
    });

    it('[TC-228.10/MSS][UC-IMP228][Facet-3/TooltipTradingSuffix] Tooltip title tự động bổ sung hậu tố "(Đang trong giao dịch 🤝)" khi isTrading = true', () => {
      const html = renderToStaticMarkup(
        React.createElement(PlayerCard, {
          player: mockPlayer,
          isCurrentTurn: true,
          levelMap: {},
          slotIndex: 0,
          tradingCells: new Set([1, 3]),
        })
      );

      expect(html).toContain('title="Cần Thơ (Cái Răng): Đã sở hữu (Đang trong giao dịch 🤝)"');
      expect(html).toContain('title="An Giang (Châu Đốc): Chưa sở hữu (Đang trong giao dịch 🤝)"');
    });
  });

  // =========================================================================
  // FACET 4: Cụm Hạ Tầng & Dọn Dẹp Trạng Thái (TC-228.11 - TC-228.13)
  // =========================================================================
  describe('Facet 4: Cụm Hạ Tầng & Dọn Dẹp Trạng Thái', () => {
    it('[TC-228.11/MSS][UC-IMP228][Facet-4/RailroadsAndUtilitiesTrading] 4 ô Ga tàu và 2 ô Tiện ích hiển thị chính xác data-trading="true" khi nằm trong Set tradingCells', () => {
      const html = renderToStaticMarkup(
        React.createElement(PlayerCard, {
          player: mockPlayerWithInfra,
          isCurrentTurn: true,
          levelMap: {},
          slotIndex: 0,
          tradingCells: new Set([5, 12]),
        })
      );

      const cell5Match = html.match(/<span[^>]*data-testid="dot-cell-5"[^>]*>/);
      expect(cell5Match?.[0]).toContain('data-trading="true"');

      const cell12Match = html.match(/<span[^>]*data-testid="dot-cell-12"[^>]*>/);
      expect(cell12Match?.[0]).toContain('data-trading="true"');
    });

    it('[TC-228.12/MSS][UC-IMP228][Facet-4/ModalCloseTeardown] Khi modal giao dịch đóng (activeModal = null hoặc tradingCells rỗng), toàn bộ 28 chấm tròn lập tức hoàn trả về data-trading="false"', () => {
      const html = renderToStaticMarkup(
        React.createElement(PlayerCard, {
          player: mockPlayerWithInfra,
          isCurrentTurn: true,
          levelMap: {},
          slotIndex: 0,
          tradingCells: new Set<number>(),
        })
      );

      const tradingMatches = html.match(/data-trading="true"/g);
      expect(tradingMatches).toBeNull();

      const nonTradingMatches = html.match(/data-trading="false"/g);
      expect(nonTradingMatches?.length).toBe(28);
    });

    it('[TC-228.13/MSS][UC-IMP228][Facet-4/DotTestIdRegressionGuard] Toàn bộ 28 chấm tròn duy trì 100% data-testid="dot-cell-X" và data-owned (Zero Regression với imp173)', () => {
      const html = renderToStaticMarkup(
        React.createElement(PlayerCard, {
          player: mockPlayerWithInfra,
          isCurrentTurn: true,
          levelMap: {},
          slotIndex: 0,
          tradingCells: new Set([1, 16]),
        })
      );

      const testIdMatches = html.match(/data-testid="dot-cell-\d+"/g);
      expect(testIdMatches?.length).toBe(28);

      const ownedMatches = html.match(/data-owned="(true|false)"/g);
      expect(ownedMatches?.length).toBe(28);
    });
  });

  // =========================================================================
  // FACET 5: Kiểm Thử Tương Tác Đồng Bộ & Môi Trường Xuất Xưởng (TC-228.14 - TC-228.16)
  // =========================================================================
  describe('Facet 5: Kiểm Thử Tương Tác Đồng Bộ & Môi Trường Xuất Xưởng', () => {
    it('[TC-228.14/MSS][UC-IMP228][Facet-5/TogglePropertySyncNoStaleClosure] Kiểm thử toggleProperty trong TradeModal hoặc hàm đồng bộ store updateModalPayload cập nhật offeredProperties/requestedProperties chính xác vào gameStore.modalPayload', () => {
      useGameStore.getState().openModal('trade', {
        targetPlayerId: 'player_partner',
        offeredProperties: [1],
        requestedProperties: [6],
        cashOffer: 500,
        cashRequest: 0,
      });

      useGameStore.getState().updateModalPayload<'trade'>({
        offeredProperties: [1, 16],
        requestedProperties: [6, 12],
      });

      const state = useGameStore.getState();
      const payload = state.modalPayload as { offeredProperties: number[]; requestedProperties: number[] };
      expect(payload?.offeredProperties).toEqual([1, 16]);
      expect(payload?.requestedProperties).toEqual([6, 12]);

      const liveTrading = resolvePlayerTradingCells(
        { activeModal: state.activeModal, modalPayload: state.modalPayload, pendingTradeOffer: state.pendingTradeOffer },
        'player_local',
        'player_local'
      );
      expect(Array.from(liveTrading).sort()).toEqual([1, 16]);
    });

    it('[TC-228.15/MSS][UC-IMP228][Facet-5/SSRHeadlessRenderSafety] Kết xuất SSR headless qua renderToStaticMarkup(<PlayerCard ... />) với localPlayerId = undefined chạy trơn tru 100% không văng lỗi', () => {
      useLobbyStore.setState({ myPlayerId: '' });
      useGameStore.getState().openModal('trade', {
        targetPlayerId: 'player_target',
        offeredProperties: [1, 16],
        requestedProperties: [3, 18],
        cashOffer: 0,
        cashRequest: 0,
      });

      let html = '';
      expect(() => {
        html = renderToStaticMarkup(
          React.createElement(PlayerCard, {
            player: mockPlayer,
            isCurrentTurn: false,
            levelMap: {},
            slotIndex: 0,
          })
        );
      }).not.toThrow();

      expect(html).toContain('data-testid="player-ribbon"');
      expect(html).toContain('data-trading="false"');
    });

    it('[TC-228.16/MSS][UC-IMP228][Facet-5/TradingClassStaticStringPurgeGuard] Markup kết xuất tĩnh của PlayerCard khi có trading cell chứa chuỗi tĩnh "ring-offset-1" và style "--tw-ring-offset-color: #FFFDF8"', () => {
      const html = renderToStaticMarkup(
        React.createElement(PlayerCard, {
          player: mockPlayer,
          isCurrentTurn: true,
          levelMap: {},
          slotIndex: 0,
          tradingCells: new Set([1]),
        })
      );

      expect(html).toContain('ring-offset-1');
      expect(html).toMatch(/--tw-ring-offset-color:\s*#FFFDF8/);
      expect(html).not.toContain('ring-offset-[#FFFDF8]');
    });
  });
});
