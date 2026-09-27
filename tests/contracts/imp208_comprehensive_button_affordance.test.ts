// [TC-208.01/MSS..TC-208.18/MSS][UC-IMP208]
// Contract Test Suite: Comprehensive Button Affordance & Interaction Hardening (IMP-208)
// Universal 5-Facet Matrix:
// Facet 1: Sổ Đỏ & Portfolio Mortgage / Downgrade Invariants (TC-208.01..TC-208.05b)
// Facet 2: P2P Trade & Quick Trade Affordance (TC-208.06..TC-208.09)
// Facet 3: Bot Trade Offer Cash Buffer Affordance (TC-208.10..TC-208.12)
// Facet 4: Bond Issuance, ActionDock Bailout & E2E Reactivity (TC-208.13..TC-208.18)

import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Ensure Zustand stores evaluate live state instead of stale initial snapshot during Node.js SSR test rendering
const origUseSyncExternalStore = React.useSyncExternalStore;
React.useSyncExternalStore = ((subscribe, getSnapshot, _getServerSnapshot) => {
  return origUseSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}) as typeof React.useSyncExternalStore;

import { TitleDeedActionFooter } from '../../src/client/ui/modals/title_deed_action_footer.js';
import * as analyticsModule from '../../src/client/ui/modals/portfolio_monopoly_analytics.js';
import { PropertyPortfolioModal } from '../../src/client/ui/modals/property_portfolio_modal.js';
import { TradeColumn } from '../../src/client/ui/modals/trade/trade_column.js';
import { MasterplanDistrictCard } from '../../src/client/ui/modals/masterplan_components.js';
import { DISTRICT_GROUPS } from '../../src/client/ui/modals/masterplan_constants.js';
import { BotTradeOfferModal } from '../../src/client/ui/modals/bot_trade_offer_modal.js';
import { BondIssuanceTab } from '../../src/client/ui/modals/bond_issuance_tab.js';
import { ActionDock } from '../../src/client/ui/action_dock.js';
import { useGameStore } from '../../src/client/store/game_store.js';

// Resolve function dynamically from module as it will be authored in Station 2 per IMP-208 contract
const resolvePropertyCardActionState = (analyticsModule as any).resolvePropertyCardActionState as (
  params: {
    readonly cellIndex: number;
    readonly level: number;
    readonly isMortgaged: boolean;
    readonly isTradeFrozen?: boolean;
    readonly isLiquidityFrozen?: boolean;
    readonly levelMap?: Record<number, number>;
    readonly ownedProperties?: readonly number[];
  }
) => {
  readonly canMortgage: boolean;
  readonly mortgageBlockedReason?: string;
  readonly mortgageButtonLabel: string;
  readonly canDowngrade: boolean;
  readonly downgradeBlockedReason?: string;
} | undefined;

describe('[TC-208.01/MSS..TC-208.18/MSS][UC-IMP208] Comprehensive Button Affordance Contract Suite', () => {
  beforeEach(() => {
    useGameStore.setState({
      roundNumber: 1,
      currentTurnPlayerId: 'p1',
      hasRolledThisTurn: false,
      isRolling: false,
      dice: [1, 2],
      activeModal: null,
      activeModifiers: [],
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
        },
        p2: {
          id: 'p2',
          name: 'Bot AI 2',
          balance: 8000,
          tokenColor: '#3b82f6',
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
  // Facet 1: Sổ Đỏ & Portfolio Mortgage / Downgrade Invariants
  // =========================================================================
  it('[TC-208.01/MSS][UC-IMP208] TitleDeedActionFooter khóa nút Thế Chấp khi currentLevel > 0 (C1–C3) kèm tooltip hướng dẫn hạ cấp về C0', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedActionFooter, {
        isOwned: true,
        isOwner: true,
        isMortgaged: false,
        currentLevel: 1,
        deedPrice: 1000,
        onMortgage: vi.fn(),
      })
    );

    expect(html).toContain('disabled=""');
    expect(html).toContain('cursor-not-allowed');
    expect(html).toContain('Phải hạ cấp hết công trình về Cấp 0 trước khi thế chấp');
    expect(html).not.toContain('bg-amber-500');
  });

  it('[TC-208.02/MSS][UC-IMP208] TitleDeedActionFooter mở nút Thế Chấp sáng cam khi currentLevel === 0 và không có hiệu ứng đóng băng', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedActionFooter, {
        isOwned: true,
        isOwner: true,
        isMortgaged: false,
        currentLevel: 0,
        isTradeFrozen: false,
        isLiquidityFrozen: false,
        deedPrice: 1000,
        onMortgage: vi.fn(),
      })
    );

    expect(html).toContain('bg-amber-500');
    expect(html).toContain('cursor-pointer');
    expect(html).not.toContain('cursor-not-allowed');
  });

  it('[TC-208.03/MSS][UC-IMP208] resolvePropertyCardActionState trả về canMortgage = false và mortgageButtonLabel = "Cần Hạ Cấp" khi BĐS có level > 0', () => {
    const state = resolvePropertyCardActionState?.({
      cellIndex: 1,
      level: 2,
      isMortgaged: false,
    });

    expect(state?.canMortgage).toBe(false);
    expect(state?.mortgageButtonLabel).toBe('Cần Hạ Cấp');
    expect(state?.mortgageBlockedReason).toBe('Phải hạ cấp hết nhà về Cấp 0 trước khi thế chấp');
  });

  it('[TC-208.04/MSS][UC-IMP208] resolvePropertyCardActionState trả về canMortgage = false và mortgageButtonLabel = "Đóng Băng" khi isTradeFrozen = true', () => {
    const state = resolvePropertyCardActionState?.({
      cellIndex: 1,
      level: 0,
      isMortgaged: false,
      isTradeFrozen: true,
    });

    expect(state?.canMortgage).toBe(false);
    expect(state?.mortgageButtonLabel).toBe('Đóng Băng');
    expect(state?.mortgageBlockedReason).toBe('Thị trường đang đóng băng giao dịch & thế chấp');
  });

  it('[TC-208.05/MSS][UC-IMP208] resolvePropertyCardActionState trả về canDowngrade = false khi BĐS vi phạm quy tắc hạ cấp đồng đều (level < maxGroupLevel)', () => {
    const state = resolvePropertyCardActionState?.({
      cellIndex: 1,
      level: 1,
      isMortgaged: false,
      levelMap: { 1: 1, 3: 2 },
      ownedProperties: [1, 3],
    });

    expect(state?.canDowngrade).toBe(false);
    expect(state?.downgradeBlockedReason).toBe('Cần hạ cấp các ô có cấp độ cao hơn trước');
  });

  it('[TC-208.05b/MSS][UC-IMP208] Khi 2 BĐS trong nhóm cùng đạt C3 -> cả 2 đều canDowngrade = true. Khi 1 ô đã hạ về C2 trong khi ô kia vẫn C3 -> ô C2 bị canDowngrade = false', () => {
    const cell1AtC3 = resolvePropertyCardActionState?.({
      cellIndex: 1,
      level: 3,
      isMortgaged: false,
      levelMap: { 1: 3, 3: 3 },
      ownedProperties: [1, 3],
    });
    const cell3AtC3 = resolvePropertyCardActionState?.({
      cellIndex: 3,
      level: 3,
      isMortgaged: false,
      levelMap: { 1: 3, 3: 3 },
      ownedProperties: [1, 3],
    });
    expect(cell1AtC3?.canDowngrade).toBe(true);
    expect(cell3AtC3?.canDowngrade).toBe(true);

    const cell1AtC2 = resolvePropertyCardActionState?.({
      cellIndex: 1,
      level: 2,
      isMortgaged: false,
      levelMap: { 1: 2, 3: 3 },
      ownedProperties: [1, 3],
    });
    expect(cell1AtC2?.canDowngrade).toBe(false);
  });

  // =========================================================================
  // Facet 2: P2P Trade & Quick Trade Affordance
  // =========================================================================
  it('[TC-208.06/MSS][UC-IMP208] TradeColumn hiển thị BĐS có công trình (level > 0) ở trạng thái disabled và không cho phép tick chọn', () => {
    const html = renderToStaticMarkup(
      React.createElement(TradeColumn, {
        title: 'Tài Sản Bạn Đề Xuất',
        properties: [1],
        selectedProperties: [],
        onToggleProperty: vi.fn(),
        isMine: true,
        levelMap: { 1: 2 },
      } as any)
    );

    expect(html).toContain('disabled=""');
    expect(html).toContain('cursor-not-allowed');
    expect(html).toContain('Cần hạ cấp hết công trình về Cấp 0 trước khi trao đổi');
  });

  it('[TC-208.06b/MSS][UC-IMP208] Khi levelMap là undefined hoặc rỗng -> mặc định level = 0, BĐS không bị khóa oan (Safe Fallback)', () => {
    const html = renderToStaticMarkup(
      React.createElement(TradeColumn, {
        title: 'Tài Sản Bạn Đề Xuất',
        properties: [1],
        selectedProperties: [],
        onToggleProperty: vi.fn(),
        isMine: true,
        levelMap: undefined,
      } as any)
    );

    expect(html).not.toContain('disabled=""');
    expect(html).toContain('cursor-pointer');
    expect(html).not.toContain('cursor-not-allowed');
  });

  it('[TC-208.07/MSS][UC-IMP208] TradeColumn hiển thị huy hiệu 🏠 C{level} (Có nhà) rõ ràng cho BĐS có công trình', () => {
    const html = renderToStaticMarkup(
      React.createElement(TradeColumn, {
        title: 'Tài Sản Bạn Đề Xuất',
        properties: [1],
        selectedProperties: [],
        onToggleProperty: vi.fn(),
        isMine: true,
        levelMap: { 1: 2 },
      } as any)
    );

    expect(html).toContain('🏠 C2 (Có nhà)');
    expect(html).toContain('bg-slate-200');
  });

  it('[TC-208.08/MSS][UC-IMP208] PropertyPortfolioModal nút Đàm Phán Nhanh (quick-trade-btn) bị disabled khi isTradeFrozen = true', () => {
    const html = renderToStaticMarkup(
      React.createElement(PropertyPortfolioModal, {
        ownedProperties: [1],
        allPlayers: {
          p1: { id: 'p1', name: 'Chủ Tịch Hưng', balance: 5000, ownedProperties: [1] },
          p2: { id: 'p2', name: 'Bot P2', balance: 5000, ownedProperties: [3], tokenColor: '#3b82f6' },
        },
        isTradeFrozen: true,
      } as any)
    );

    expect(html).toContain('data-testid="quick-trade-btn-3"');
    expect(html).toContain('disabled=""');
    expect(html).toContain('cursor-not-allowed');
    expect(html).toContain('Thị trường đang đóng băng giao dịch');
  });

  it('[TC-208.09/MSS][UC-IMP208] MasterplanDistrictCard nút Đổi Ô Nhanh bị disabled khi isTradeFrozen = true', () => {
    const html = renderToStaticMarkup(
      React.createElement(MasterplanDistrictCard, {
        district: DISTRICT_GROUPS[0],
        players: {
          p1: { id: 'p1', name: 'P1', tokenColor: '#ef4444', avatar: '🦁' },
          p2: { id: 'p2', name: 'P2', tokenColor: '#3b82f6', avatar: '🤖' },
        },
        myPlayerId: 'p1',
        getCellOwnership: (cellIndex: number) => {
          if (cellIndex === 1) {
            return { owner: { id: 'p2', name: 'P2', tokenColor: '#3b82f6', avatar: '🤖' }, isMortgaged: false, level: 0 };
          }
          return { owner: null, isMortgaged: false, level: 0 };
        },
        isTradeFrozen: true,
      } as any)
    );

    expect(html).toContain('data-testid="quick-trade-btn-1"');
    expect(html).toContain('disabled=""');
    expect(html).toContain('cursor-not-allowed');
    expect(html).toContain('Thị trường đang đóng băng giao dịch');
  });

  // =========================================================================
  // Facet 3: Bot Trade Offer Cash Buffer Affordance
  // =========================================================================
  it('[TC-208.10/MSS][UC-IMP208] BotTradeOfferModal vô hiệu hóa nút Đồng Ý Đổi khi người chơi thiếu tiền bù (price < 0 và balance < absPrice)', () => {
    useGameStore.setState({
      playersInfo: {
        p1: { id: 'p1', name: 'Chủ Tịch Hưng', balance: 200 } as any,
        bot_2: { id: 'bot_2', name: 'Bot AI 2', balance: 5000 } as any,
      },
    });

    const html = renderToStaticMarkup(
      React.createElement(BotTradeOfferModal, {
        offerId: 'offer_imp208_1',
        cellIndex: 1,
        buyerId: 'bot_2',
        sellerId: 'p1',
        price: -500,
        expiresAt: Date.now() + 60000,
        offeredCellIndex: 3,
        onAccept: vi.fn(),
        onReject: vi.fn(),
      })
    );

    expect(html).toContain('data-testid="accept-trade-btn"');
    expect(html).toContain('disabled=""');
    expect(html).toContain('cursor-not-allowed');
    expect(html).toContain('bg-slate-200');
  });

  it('[TC-208.10b/MSS][UC-IMP208] Khi price === 0 (đổi ngang không bù tiền) -> Nút Đồng Ý luôn sáng xanh cho phép bấm', () => {
    useGameStore.setState({
      playersInfo: {
        p1: { id: 'p1', name: 'Chủ Tịch Hưng', balance: 0 } as any,
        bot_2: { id: 'bot_2', name: 'Bot AI 2', balance: 5000 } as any,
      },
    });

    const html = renderToStaticMarkup(
      React.createElement(BotTradeOfferModal, {
        offerId: 'offer_imp208_2',
        cellIndex: 1,
        buyerId: 'bot_2',
        sellerId: 'p1',
        price: 0,
        expiresAt: Date.now() + 60000,
        offeredCellIndex: 3,
        onAccept: vi.fn(),
        onReject: vi.fn(),
      })
    );

    expect(html).not.toContain('disabled=""');
    expect(html).toContain('bg-emerald-600');
    expect(html).toContain('cursor-pointer');
  });

  it('[TC-208.11/MSS][UC-IMP208] BotTradeOfferModal đổi nhãn nút thành Thiếu Tiền Bù (-X Tr.) khi thiếu tiền mặt', () => {
    useGameStore.setState({
      playersInfo: {
        p1: { id: 'p1', name: 'Chủ Tịch Hưng', balance: 100 } as any,
        bot_2: { id: 'bot_2', name: 'Bot AI 2', balance: 5000 } as any,
      },
    });

    const html = renderToStaticMarkup(
      React.createElement(BotTradeOfferModal, {
        offerId: 'offer_imp208_3',
        cellIndex: 1,
        buyerId: 'bot_2',
        sellerId: 'p1',
        price: -500,
        expiresAt: Date.now() + 60000,
        offeredCellIndex: 3,
        onAccept: vi.fn(),
        onReject: vi.fn(),
      })
    );

    expect(html).toContain('Thiếu Tiền Bù');
    expect(html).toContain('500');
  });

  it('[TC-208.12/MSS][UC-IMP208] BotTradeOfferModal mở nút Đồng Ý Đổi sáng xanh khi người chơi đủ tiền bù hoặc nhận tiền (price >= 0)', () => {
    useGameStore.setState({
      playersInfo: {
        p1: { id: 'p1', name: 'Chủ Tịch Hưng', balance: 2500 } as any,
        bot_2: { id: 'bot_2', name: 'Bot AI 2', balance: 5000 } as any,
      },
    });

    const html = renderToStaticMarkup(
      React.createElement(BotTradeOfferModal, {
        offerId: 'offer_imp208_4',
        cellIndex: 1,
        buyerId: 'bot_2',
        sellerId: 'p1',
        price: -500,
        expiresAt: Date.now() + 60000,
        offeredCellIndex: 3,
        onAccept: vi.fn(),
        onReject: vi.fn(),
      })
    );

    expect(html).not.toContain('disabled=""');
    expect(html).toContain('bg-emerald-600');
    expect(html).toContain('✓ ĐỒNG Ý ĐỔI');
  });

  // =========================================================================
  // Facet 4: Bond Issuance, ActionDock Bailout & E2E Reactivity
  // =========================================================================
  it('[TC-208.13/MSS][UC-IMP208] BondIssuanceTab vô hiệu hóa nút Phát Hành khi Net Worth < 3.000 dù đang trong lượt', () => {
    const html = renderToStaticMarkup(
      React.createElement(BondIssuanceTab, {
        balance: 1000,
        isMyTurn: true,
        playerNetWorth: 2500,
        unmortgagedPropertiesCount: 3,
      } as any)
    );

    expect(html).toContain('disabled=""');
    expect(html).toContain('cursor-not-allowed');
    expect(html).toContain('Cần tối thiểu 3.000 Net Worth để phát hành trái phiếu');
  });

  it('[TC-208.14/MSS][UC-IMP208] BondIssuanceTab vô hiệu hóa nút Phát Hành khi sở hữu < 2 BĐS chưa thế chấp', () => {
    const html = renderToStaticMarkup(
      React.createElement(BondIssuanceTab, {
        balance: 1000,
        isMyTurn: true,
        playerNetWorth: 4500,
        unmortgagedPropertiesCount: 1,
      } as any)
    );

    expect(html).toContain('disabled=""');
    expect(html).toContain('cursor-not-allowed');
    expect(html).toContain('Cần sở hữu ít nhất 2 Bất Động Sản chưa thế chấp');
  });

  it('[TC-208.15/MSS][UC-IMP208] BondIssuanceTab mở nút Phát Hành sáng vàng khi đủ điều kiện quy chế', () => {
    const html = renderToStaticMarkup(
      React.createElement(BondIssuanceTab, {
        balance: 1000,
        isMyTurn: true,
        playerNetWorth: 4500,
        unmortgagedPropertiesCount: 2,
      } as any)
    );

    expect(html).not.toContain('disabled=""');
    expect(html).toContain('bg-amber-500');
    expect(html).toContain('Phát Hành Trái Phiếu');
  });

  it('[TC-208.16/MSS][UC-IMP208] ActionDock nút Bảo Lãnh chuyển sang màu xám mờ không nảy (bg-slate-200 cursor-not-allowed) khi số dư ví < 500', () => {
    useGameStore.setState({
      currentTurnPlayerId: 'p1',
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Chủ Tịch Hưng',
          balance: 350,
          inAudit: true,
          auditTurnsLeft: 2,
          bankrupt: false,
        } as any,
      },
    });

    const html = renderToStaticMarkup(
      React.createElement(ActionDock, {
        localPlayerId: 'p1',
        isMyTurn: true,
      })
    );

    expect(html).toContain('Bảo Lãnh (500)');
    expect(html).toContain('bg-slate-200');
    expect(html).toContain('cursor-not-allowed');
    expect(html).not.toContain('bg-amber-600');
  });

  it('[TC-208.17/MSS][UC-IMP208] ActionDock nút Bảo Lãnh sáng màu cam hổ phách khi số dư ví >= 500', () => {
    useGameStore.setState({
      currentTurnPlayerId: 'p1',
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Chủ Tịch Hưng',
          balance: 750,
          inAudit: true,
          auditTurnsLeft: 2,
          bankrupt: false,
        } as any,
      },
    });

    const html = renderToStaticMarkup(
      React.createElement(ActionDock, {
        localPlayerId: 'p1',
        isMyTurn: true,
      })
    );

    expect(html).toContain('Bảo Lãnh (500)');
    expect(html).toContain('bg-amber-600');
    expect(html).toContain('cursor-pointer');
    expect(html).not.toContain('cursor-not-allowed');
  });

  it('[TC-208.18/MSS][UC-IMP208] E2E Reactivity: Khi người chơi hạ cấp hết nhà đưa BĐS về Cấp 0, nút Thế Chấp lập tức chuyển từ xám sang sáng hoạt động', () => {
    const stage1State = resolvePropertyCardActionState?.({
      cellIndex: 1,
      level: 1,
      isMortgaged: false,
    });
    expect(stage1State?.canMortgage).toBe(false);
    expect(stage1State?.mortgageButtonLabel).toBe('Cần Hạ Cấp');

    const stage2State = resolvePropertyCardActionState?.({
      cellIndex: 1,
      level: 0,
      isMortgaged: false,
    });
    expect(stage2State?.canMortgage).toBe(true);
    expect(stage2State?.mortgageButtonLabel).toBe('Thế Chấp');
  });
});
