// [TC-CONV-01..15/MSS][UC-IMP235] UI/UX & Engine Convergence Contract Test Suite
// Standard: Detroit TDD Classical Style, Universal 5-Facet Behavioral Matrix
//
// Facet 1: Boundary & Range (TC-CONV-01..03)
// Facet 2: State Reactivity & Multi-Turn Teardown (TC-CONV-04..06)
// Facet 3: Resource Disposal & Timer Isolation (TC-CONV-07..09)
// Facet 4: Error Defense & Terminal Invariants (TC-CONV-10..12)
// Facet 5: Cross-Coupling Blast Radius & Exceptional Lifecycles (TC-CONV-13..15)

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Ensure Zustand stores evaluate live state instead of stale initial snapshot during Node.js SSR test rendering
const origUseSyncExternalStore = React.useSyncExternalStore;
React.useSyncExternalStore = ((subscribe, getSnapshot, _getServerSnapshot) => {
  return origUseSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}) as typeof React.useSyncExternalStore;

import { buildDeltaFromRoom } from '../../src/server/session_manager.js';
import { updateCellLevel } from '../../src/client/network/apply_delta_cells.js';
import { AuctionDistrictCard } from '../../src/client/ui/modals/auction_district_card.js';
import { TitleDeedModal } from '../../src/client/ui/modals/title_deed_modal.js';
import { TitleDeedRentTable } from '../../src/client/ui/modals/title_deed_rent_table.js';
import { AuctionModal } from '../../src/client/ui/modals/auction_modal.js';
import { FloatingNumbersOverlay } from '../../src/client/ui/floating_numbers.js';
import { PlayerCard } from '../../src/client/ui/player_card.js';
import { ServerToast } from '../../src/client/main.js';
import { processBondTurnTransition } from '../../src/server/bond_manager.js';
import { TurnPhase, type Room, type Player } from '../../src/domain/room.js';
import { useGameStore, type GameState, type PlayerHudInfo, FloatingTextType } from '../../src/client/store/game_store.js';
import { useLobbyStore } from '../../src/client/store/lobby_store.js';
import { PurchaseDecisionCard } from '../../src/client/ui/modals/purchase_decision_card.js';
import { PropertyPortfolioModal } from '../../src/client/ui/modals/property_portfolio_modal.js';
import { ModalHost } from '../../src/client/ui/modals/modal_host.js';
import * as uiHelpers from '../../src/client/ui/ui_helpers.js';
import { formatLocalizedBotPersonality } from '../../src/client/ui/ui_helpers.js';

describe('[TC-CONV-01..20/MSS][UC-IMP235] UI/UX & Engine Convergence Contract Suite', () => {
  beforeEach(() => {
    useGameStore.setState({
      currentTurnPlayerId: 'p1',
      activeModal: null,
      modalPayload: null,
      floatingTexts: [],
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Chủ Tịch Hưng',
          balance: 15000,
          tokenColor: '#ef4444',
          ownedProperties: [1],
          mortgagedProperties: [],
          mortgageLoans: {},
          isBot: false,
          bankrupt: false,
          inAudit: false,
        } as PlayerHudInfo,
      },
    });

    useLobbyStore.setState({
      myPlayerId: 'p1',
      roomCode: 'TEST01',
    });
  });

  // =========================================================================
  // FACET 1: Boundary & Range (TC-CONV-01..03)
  // =========================================================================
  describe('Facet 1: Boundary & Range', () => {
    it('[TC-CONV-01/MSS][UC-IMP235] buildDeltaFromRoom trong session_manager.ts emit level: 0 tường minh khi ô đất bị xóa/tịch thu khỏi stateMap', () => {
      const room: Room = {
        roomCode: 'TEST01',
        phase: TurnPhase.PropertyManagement,
        players: [
          {
            id: 'p1',
            name: 'Chủ Tịch Hưng',
            position: 0,
            balance: 15000,
            skipNextTurn: false,
            auditTurnsLeft: 0,
            consecutiveDoubles: 0,
            hand: [],
            pendingDebts: [],
            extraTurns: 0,
            doubleNextDice: false,
            mortgagedProperties: [],
            bankrupt: false,
          },
        ],
        hostId: 'p1',
        currentPlayerIndex: 0,
        diceSeq: 1,
        started: true,
        treasury: 0,
        activeModifiers: [],
        marketDeck: [],
        marketDiscard: [],
        chanceDeck: [],
        chanceDiscard: [],
        permanentRentBonus: {},
      };

      const registry = new Map<number, string>();
      const stateMap = new Map<number, { level: 0 | 1 | 2 | 3 }>();
      // Ô 19 bị tịch thu/xóa hoàn toàn khỏi stateMap
      stateMap.delete(19);

      const delta = buildDeltaFromRoom(room, registry, stateMap);
      const cell19 = delta.cells?.find((c) => c.index === 19);

      expect(cell19?.level).toBe(0);
    });

    it('[TC-CONV-02/MSS][UC-IMP235] updateCellLevel trong apply_delta_cells.ts reset client levelMap về 0 và triệt tiêu delta trùng lặp', () => {
      const state = {
        levelMap: { 19: 3 },
      } as unknown as GameState;
      const nextLevelMap: Record<number, 0 | 1 | 2 | 3> = { 19: 3 };

      const changed = updateCellLevel({ index: 19, level: 0 }, state, nextLevelMap, false);
      expect(nextLevelMap[19]).toBe(0);

      // Khi oldLevel === targetLevel (0 === 0) và đã có trong nextLevelMap, phải trả về false (Zero-Delta Suppression)
      const stateZero = {
        levelMap: { 19: 0 },
      } as unknown as GameState;
      const suppressed = updateCellLevel({ index: 19, level: 0 }, stateZero, nextLevelMap, false);
      expect(suppressed).toBe(false);
    });

    it('[TC-CONV-03/MSS][UC-IMP235] AuctionDistrictCard với ô đất isVacant: true nhưng mang level: 3 không được render 🏠 3', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionDistrictCard, {
          cellIndex: 1,
          currentBid: 1000,
          myId: 'p1',
          playersInfo: {},
          levelMap: { 1: 3 },
          isForeclosure: false,
        })
      );

      expect(html).not.toContain('🏠 3');
    });

    it('[TC-CONV-19/MSS][UC-IMP235] AuctionModal công nhận mức giá khởi điểm 0đ trong Fire Sale với vương miện 👑 và nhãn Bạn dẫn đầu', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 15,
          currentBid: 0,
          startingBid: 0,
          highestBidderId: 'p1',
          myId: 'p1',
          isFireSale: true,
          timeRemaining: 15,
        })
      );

      expect(html).toContain('👑');
      expect(html).toContain('text-emerald-700 font-black');
      expect(html).toContain('Bạn');
      expect(html).not.toContain('Chưa có ai đặt giá');
    });
  });

  // =========================================================================
  // FACET 2: State Reactivity & Multi-Turn Teardown (TC-CONV-04..06)
  // =========================================================================
  describe('Facet 2: State Reactivity & Multi-Turn Teardown', () => {
    it('[TC-CONV-04/MSS][UC-IMP235] Header TitleDeedModal với ribbonColor: #F1C40F (nhóm Vàng SSOT) áp dụng class chữ tối text-slate-950', () => {
      // Ô 26: Quảng Ninh thuộc ColorGroup.Vang với ribbonColor: '#F1C40F'
      const html = renderToStaticMarkup(
        React.createElement(TitleDeedModal, {
          cellIndex: 26,
          onClose: () => {},
        })
      );

      expect(html).toContain('text-slate-950');
    });

    it('[TC-CONV-05/MSS][UC-IMP235] TitleDeedRentTable hiển thị chuẩn nhãn C3 (RESORT/TTTM) thay cho nhãn cũ', () => {
      const html = renderToStaticMarkup(
        React.createElement(TitleDeedRentTable, {
          isRailroad: false,
          isUtility: false,
          rents: [100, 200, 400, 1000],
          upgradeCosts: [500, 500, 1000],
          compact: true,
          currentLevel: 0,
        })
      );

      expect(html).toContain('C3 (RESORT/TTTM)');
    });

    it('[TC-CONV-06/MSS][UC-IMP235] formatShortPlayerName và chip phân khu không bị cụt dấu mở ngoặc Bot AI 4 (', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionDistrictCard, {
          cellIndex: 1,
          currentBid: 1000,
          myId: 'p1',
          playersInfo: {
            bot4: {
              id: 'bot4',
              name: 'Bot AI 4 (Balanced)',
              ownedProperties: [3],
              tokenColor: '#f59e0b',
            },
          },
          levelMap: {},
          isForeclosure: false,
        })
      );

      expect(html).not.toContain('Bot AI 4 (');
      expect(html).toContain('Bot AI 4');
    });

    it('[TC-CONV-16/MSS][UC-IMP235] PurchaseDecisionCard bẻ dòng tên tỉnh và phân khu độc lập trong thẻ span với text-[11px]', () => {
      const html = renderToStaticMarkup(
        React.createElement(PurchaseDecisionCard, {
          cellIndex: 26,
        })
      );

      expect(html).toContain('Hải Phòng');
      expect(html).toContain('(Phố Ẩm Thực &amp; Kinh Tế Đêm)');
      expect(html).toContain('text-[11px] font-medium text-slate-600 block truncate');
    });
  });

  // =========================================================================
  // FACET 3: Resource Disposal & Timer Isolation (TC-CONV-07..09)
  // =========================================================================
  describe('Facet 3: Resource Disposal & Timer Isolation', () => {
    it('[TC-CONV-07/MSS][UC-IMP235] AuctionModal dẫn đầu hiển thị Chưa có ai đặt giá khi highestBidderId === null và currentBid === 0', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 0,
          highestBidderId: null,
          timeRemaining: 15,
        })
      );

      expect(html).toContain('Chưa có ai đặt giá');
    });

    it('[TC-CONV-08/MSS][UC-IMP235] AuctionDistrictCard hiển thị nhãn HẠ TẦNG GIAO THÔNG QUỐC GIA khi info.districtId === Railroad', () => {
      // Ô 5: Ga Hà Nội thuộc nhóm Railroad
      const html = renderToStaticMarkup(
        React.createElement(AuctionDistrictCard, {
          cellIndex: 5,
          currentBid: 1000,
          myId: 'p1',
          playersInfo: {},
          levelMap: {},
        })
      );

      expect(html).toContain('HẠ TẦNG GIAO THÔNG QUỐC GIA');
    });

    it('[TC-CONV-09/MSS][UC-IMP235] AuctionModal ribbonColor cho ô Railroad dùng màu xám thép #475569', () => {
      // Ô 5: Ga Hà Nội thuộc nhóm Railroad
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 5,
          currentBid: 1000,
          highestBidderId: 'p1',
          timeRemaining: 15,
        })
      );

      const heroHeader = html.slice(
        html.indexOf('data-testid="auction-hero-header"'),
        html.indexOf('data-testid="auction-hero-header"') + 350
      );
      expect(heroHeader).toMatch(/background-color:\s*(?:#475569|rgb\(71,\s*85,\s*105\))/i);
    });

    it('[TC-CONV-17/MSS][UC-IMP235] PropertyPortfolioModal áp dụng vùng đệm đáy pb-20 chống che khuất nút điều khiển', () => {
      const html = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [1, 3],
        })
      );

      expect(html).toContain('pb-20');
      expect(html).toContain('overflow-y-auto');
    });
  });

  // =========================================================================
  // FACET 4: Error Defense & Terminal Invariants (TC-CONV-10..12)
  // =========================================================================
  describe('Facet 4: Error Defense & Terminal Invariants', () => {
    it('[TC-CONV-10/MSS][UC-IMP235] formatLocalizedBotPersonality chuyển đổi đúng toàn bộ 3 nhóm tính cách Bot AI sang tiếng Việt', () => {
      expect(formatLocalizedBotPersonality('Bot AI 1 (Passive)')).toBe('Bot AI 1 (Phòng Thủ)');
      expect(formatLocalizedBotPersonality('Bot AI 2 (Aggressive)')).toBe('Bot AI 2 (Tấn Công)');
      expect(formatLocalizedBotPersonality('Bot AI 3 (Balanced)')).toBe('Bot AI 3 (Cân Bằng)');
    });

    it('[TC-CONV-11/MSS][UC-IMP235] FloatingNumbers overlay container có class md:right-6 md:left-auto md:translate-x-0 trên Desktop', () => {
      useGameStore.setState({
        floatingTexts: [
          {
            id: 'toast_1',
            text: '+1.000 Tr. VNĐ',
            type: FloatingTextType.Reward,
            playerId: 'p1',
            timestamp: Date.now(),
          },
        ],
        activeModal: null,
      });

      const html = renderToStaticMarkup(
        React.createElement(FloatingNumbersOverlay)
      );

      expect(html).toContain('md:right-6');
      expect(html).toContain('md:left-auto');
      expect(html).toContain('md:translate-x-0');
    });

    it('[TC-CONV-12/MSS][UC-IMP235] isRollActionDisabled trả về true khi turnPhase === AuctionPhase', () => {
      const result = uiHelpers.isRollActionDisabled({
        turnPhase: 'AuctionPhase',
        isMyTurn: true,
        hasRolledThisTurn: false,
        isRolling: false,
        isPawnMoving: false,
        isRollPending: false,
        inAudit: false,
        isBankrupt: false,
        canRollAgain: false,
      });

      expect(result).toBe(true);
    });

    it('[TC-CONV-18/MSS][UC-IMP235] ModalHost áp dụng center={true} cho portfolio modal, loại bỏ class lệch phải md:justify-end md:pr-10', () => {
      const html = renderToStaticMarkup(
        React.createElement(ModalHost, {
          activeModal: 'portfolio',
          modalPayload: { playerId: 'p1' },
        })
      );

      expect(html).toContain('backdrop-blur-xs');
      expect(html).toContain('justify-center');
      expect(html).not.toContain('md:justify-end');
      expect(html).not.toContain('md:pr-10');
    });
  });

  // =========================================================================
  // FACET 5: Cross-Coupling Blast Radius & Exceptional Lifecycles (TC-CONV-13..15)
  // =========================================================================
  describe('Facet 5: Cross-Coupling Blast Radius & Exceptional Lifecycles', () => {
    it('[TC-CONV-13/MSS][UC-IMP235] PlayerCard tài sản ròng render với class text-slate-700 font-black', () => {
      const player: PlayerHudInfo = {
        id: 'p1',
        name: 'Chủ Tịch Hưng',
        balance: 15000,
        tokenColor: '#ef4444',
        ownedProperties: [1],
        mortgagedProperties: [],
        mortgageLoans: {},
        isBot: false,
        bankrupt: false,
        inAudit: false,
      };

      const html = renderToStaticMarkup(
        React.createElement(PlayerCard, {
          player,
          isCurrentTurn: true,
          levelMap: {},
        })
      );

      expect(html).toContain('text-slate-700 font-black');
    });

    it('[TC-CONV-14/MSS][UC-IMP235] ServerToast container có class z-60 và vị trí cố định góc phải màn hình', () => {
      const html = renderToStaticMarkup(
        React.createElement(ServerToast, {
          message: 'Mất kết nối máy chủ',
          onClose: () => {},
        })
      );

      expect(html).toContain('z-60');
      expect(html).toMatch(/right-(?:4|6)/);
    });

    it('[TC-CONV-15/MSS][UC-IMP235] processBondTurnTransition khi vỡ nợ trái phiếu gán room.lastEventCard.id === EVENT_BOND_DEFAULT và chuyển pha TurnPhase.AuctionPhase', () => {
      const player: Player = {
        id: 'p1',
        name: 'Nguyễn Văn A',
        position: 0,
        balance: 50,
        skipNextTurn: false,
        auditTurnsLeft: 0,
        consecutiveDoubles: 0,
        hand: [],
        pendingDebts: [],
        extraTurns: 0,
        doubleNextDice: false,
        mortgagedProperties: [],
        bankrupt: false,
        bondContract: {
          isActive: true,
          principal: 1000,
          repayAmount: 1100,
          roundsLeft: 1,
          collateralCells: [1],
        },
      };

      const room: Room = {
        roomCode: 'TEST01',
        hostId: 'p1',
        phase: TurnPhase.PropertyManagement,
        players: [player],
        currentPlayerIndex: 0,
        diceSeq: 1,
        started: true,
        treasury: 500,
        fireSaleQueue: [],
        activeModifiers: [],
        marketDeck: [],
        marketDiscard: [],
        chanceDeck: [],
        chanceDiscard: [],
        permanentRentBonus: {},
      };

      const registry = new Map<number, string>([[1, 'p1']]);
      const stateMap = new Map<number, { level: 0 | 1 | 2 | 3 }>([[1, { level: 0 }]]);
      const auctions = new Map<string, any>();

      processBondTurnTransition(room, player, registry, stateMap, auctions, room.roomCode);

      expect(room.lastEventCard?.id).toBe('EVENT_BOND_DEFAULT');
      expect(room.phase).toBe(TurnPhase.AuctionPhase);
    });

    it('[TC-CONV-20/MSS][UC-IMP235] TitleDeedRentTable hiển thị chip GRID cho Ô 12 (EVN) và chip 5G cho Ô 28 (Viettel)', () => {
      const htmlEvn = renderToStaticMarkup(
        React.createElement(TitleDeedRentTable, {
          cellIndex: 12,
          isRailroad: false,
          isUtility: true,
          rents: [1000, 2500, 3500],
          upgradeCosts: [1000],
        })
      );
      expect(htmlEvn).toContain('GRID');
      expect(htmlEvn).toContain('Lưới Điện Thông Minh (Smart Grid)');

      const htmlViettel = renderToStaticMarkup(
        React.createElement(TitleDeedRentTable, {
          cellIndex: 28,
          isRailroad: false,
          isUtility: true,
          rents: [1000, 2500, 3500],
          upgradeCosts: [1000],
        })
      );
      expect(htmlViettel).toContain('5G');
      expect(htmlViettel).toContain('Nâng Cấp Trạm Phát 5G');
    });
  });
});
