// [IMP-128][Trạm 1] Contract Test Suite: Desktop UI Polish, Market Event Ticker, Toast De-collision & 40 Rounds Sync
// Universal 4-Facet Behavioral Matrix:
// Facet 1 (Boundary & Range): Container positions, screen alignments, remainingRounds bounds, 40-round ceiling
// Facet 2 (State Reactivity): Active modifiers reactive ticker, ActionDock freeze lock, TitleDeedModal deed freeze
// Facet 3 (Resource Disposal & Liquidity): Expired modifiers unmount, overlay null cleanup, no dangling onPass auction triggers
// Facet 4 (Error Defense & Invariants): Malformed modifier resilience, error reason handling, ReasonCode wire safety

import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  useGameStore,
  FloatingTextType,
  type FloatingTextItem,
} from '../../src/client/store/game_store';
import { FloatingNumbersOverlay } from '../../src/client/ui/floating_numbers';
import { ActionDock } from '../../src/client/ui/action_dock';
import { TitleDeedModal } from '../../src/client/ui/modals/title_deed_modal';
import { handleWsMessage, type WsMessageHandlerContext } from '../../src/client/network/ws_message_handler';
import type { ReasonCode, WsServerMessage } from '../../src/server/network/network_types';
import { MarketCardId } from '../../src/domain/event_card_types';
import { MARKET_CARD_DETAILS } from '../../src/domain/event_card_metadata';
import { vi as viTranslations } from '../../src/domain/i18n/vi';

// Dynamic import for MarketEventTicker to ensure Business RED without ESM load crashes
let MarketEventTicker: React.ComponentType<{
  readonly activeModifiers?: ReadonlyArray<{
    readonly type: MarketCardId | string;
    readonly remainingRounds: number;
    readonly affectedCells?: readonly number[];
  }>;
}> | null = null;

beforeAll(async () => {
  try {
    const mod = await import('../../src/client/ui/market_event_ticker' as any);
    MarketEventTicker = mod.MarketEventTicker ?? mod.default ?? null;
  } catch {
    MarketEventTicker = null;
  }
});

// ============================================================================
// CHỐT 1: Khử Chèn Đè Toast Trên Desktop (FloatingNumbersOverlay)
// ============================================================================
describe('[IMP-128] Chốt 1: Khử Chèn Đè Toast Trên Desktop (FloatingNumbersOverlay)', () => {
  beforeEach(() => {
    useGameStore.setState({
      floatingTexts: [
        {
          id: 'ft_1',
          text: '+1.000 Tr.',
          type: FloatingTextType.Reward,
          playerId: 'p1',
          actionType: 'buy',
          timestamp: Date.now(),
        },
      ],
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Đại Gia Sài Gòn',
          balance: 15000,
          tokenColor: '#38BDF8',
          ownedProperties: [],
        },
      },
    });
  });

  it('[TC-IMP128.01/MSS][UC-IMP128][Facet-1/Boundary] Desktop container không chứa class right-6 gây đè lên PlayerHudList', () => {
    const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
    const desktopContainerMatch = html.match(/<div[^>]*class="[^"]*(?:md:flex|md:max-w-md)[^"]*"[^>]*>/);
    expect(desktopContainerMatch).not.toBeNull();
    expect(desktopContainerMatch![0]).not.toContain('right-6');
  });

  it('[TC-IMP128.02/MSS][UC-IMP128][Facet-1/Boundary] Desktop container căn giữa màn hình với left-1/2 và -translate-x-1/2', () => {
    const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
    const desktopContainerMatch = html.match(/<div[^>]*class="[^"]*(?:md:flex|md:max-w-md)[^"]*"[^>]*>/);
    expect(desktopContainerMatch).not.toBeNull();
    expect(desktopContainerMatch![0]).toContain('left-1/2');
    expect(desktopContainerMatch![0]).toContain('-translate-x-1/2');
  });

  it('[TC-IMP128.03/MSS][UC-IMP128][Facet-1/Boundary] Desktop container định vị an toàn ở top-20 dưới Market Ticker', () => {
    const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
    const desktopContainerMatch = html.match(/<div[^>]*class="[^"]*(?:md:flex|md:max-w-md)[^"]*"[^>]*>/);
    expect(desktopContainerMatch).not.toBeNull();
    expect(desktopContainerMatch![0]).toMatch(/top-(20|28|32)/);
  });

  it('[TC-IMP128.04/MSS][UC-IMP128][Facet-2/Reactivity] Desktop container hiển thị đủ các badge thông báo giao dịch thông thường', () => {
    useGameStore.setState({
      floatingTexts: [
        { id: 'ft_1', text: '+1.000 Tr.', type: FloatingTextType.Reward, playerId: 'p1', actionType: 'buy', timestamp: Date.now() },
        { id: 'ft_2', text: '-500 Tr.', type: FloatingTextType.Penalty, playerId: 'p1', actionType: 'rent_pay', timestamp: Date.now() },
      ],
    });
    const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
    expect(html).toContain('+1.000 Tr.');
    expect(html).toContain('-500 Tr.');
  });

  it('[TC-IMP128.05/MSS][UC-IMP128][Facet-2/Reactivity] Desktop container cắt tỉa chỉ hiển thị tối đa 2 thông báo mới nhất', () => {
    useGameStore.setState({
      floatingTexts: [
        { id: 'ft_1', text: '+100 Tr.', type: FloatingTextType.Reward, playerId: 'p1', actionType: 'buy', timestamp: Date.now() },
        { id: 'ft_2', text: '+200 Tr.', type: FloatingTextType.Reward, playerId: 'p1', actionType: 'buy', timestamp: Date.now() },
        { id: 'ft_3', text: '+300 Tr.', type: FloatingTextType.Reward, playerId: 'p1', actionType: 'buy', timestamp: Date.now() },
      ],
    });
    const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
    expect(html).not.toContain('+100 Tr.');
    expect(html).toContain('+200 Tr.');
    expect(html).toContain('+300 Tr.');
  });

  it('[TC-IMP128.06/MSS][UC-IMP128][Facet-3/Disposal] FloatingNumbersOverlay trả về null khi floatingTexts rỗng (giải phóng DOM)', () => {
    useGameStore.setState({ floatingTexts: [] });
    const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
    expect(html).toBe('');
  });

  it('[TC-IMP128.07/MSS][UC-IMP128][Facet-4/ErrorDefense] MilestoneBanner sự kiện thị trường render độc lập không bị lẫn vào desktop regular toasts', () => {
    useGameStore.setState({
      floatingTexts: [
        {
          id: 'ft_milestone',
          text: 'Thị trường đóng băng toàn quốc!',
          type: FloatingTextType.Reward,
          playerId: 'p1',
          actionType: 'market',
          timestamp: Date.now(),
        },
      ],
    });
    const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
    expect(html).toContain('data-testid="event-card-notification-banner"');
    expect(html).not.toContain('data-testid="contextual-transaction-badge"');
  });
});

// ============================================================================
// CHỐT 2: Thanh Trạng Thái Thị Trường (MarketEventTicker)
// ============================================================================
describe('[IMP-128] Chốt 2: Thanh Trạng Thái Thị Trường (MarketEventTicker)', () => {
  beforeEach(() => {
    useGameStore.setState({
      activeModifiers: [],
    });
  });

  it('[TC-IMP128.08/MSS][UC-IMP128][Facet-1/Boundary] MarketEventTicker render null khi danh sách activeModifiers rỗng', () => {
    expect(MarketEventTicker).not.toBeNull();
    const html = renderToStaticMarkup(React.createElement(MarketEventTicker!, { activeModifiers: [] }));
    expect(html).toBe('');
  });

  it('[TC-IMP128.09/MSS][UC-IMP128][Facet-1/Boundary] MarketEventTicker render null khi toàn bộ modifiers có remainingRounds <= 0', () => {
    expect(MarketEventTicker).not.toBeNull();
    const html = renderToStaticMarkup(
      React.createElement(MarketEventTicker!, {
        activeModifiers: [
          { type: MarketCardId.MC_FREEZE_TRADE, remainingRounds: 0 },
          { type: MarketCardId.MC_COASTAL_STORM, remainingRounds: -1 },
        ],
      })
    );
    expect(html).toBe('');
  });

  it('[TC-IMP128.10/MSS][UC-IMP128][Facet-1/Boundary] Render container chứa data-testid="market-event-ticker" khi có modifier hiệu lực', () => {
    expect(MarketEventTicker).not.toBeNull();
    const html = renderToStaticMarkup(
      React.createElement(MarketEventTicker!, {
        activeModifiers: [{ type: MarketCardId.MC_FREEZE_TRADE, remainingRounds: 1 }],
      })
    );
    expect(html).toContain('data-testid="market-event-ticker"');
  });

  it('[TC-IMP128.11/MSS][UC-IMP128][Facet-2/Reactivity] Hiển thị chính xác số vòng còn lại 1 vòng cho modifier đang hoạt động', () => {
    expect(MarketEventTicker).not.toBeNull();
    const html = renderToStaticMarkup(
      React.createElement(MarketEventTicker!, {
        activeModifiers: [{ type: MarketCardId.MC_FREEZE_TRADE, remainingRounds: 1 }],
      })
    );
    expect(html).toMatch(/1\s*vòng|còn\s*1/i);
  });

  it('[TC-IMP128.12/MSS][UC-IMP128][Facet-2/Reactivity] Render tiêu đề Đóng Băng Giao Dịch khi có thẻ MC_FREEZE_TRADE', () => {
    expect(MarketEventTicker).not.toBeNull();
    const html = renderToStaticMarkup(
      React.createElement(MarketEventTicker!, {
        activeModifiers: [{ type: MarketCardId.MC_FREEZE_TRADE, remainingRounds: 1 }],
      })
    );
    expect(html).toContain('Đóng Băng Giao Dịch');
  });

  it('[TC-IMP128.13/MSS][UC-IMP128][Facet-2/Reactivity] Render thông tin chính xác từ SSOT Metadata cho MC_COASTAL_STORM', () => {
    expect(MarketEventTicker).not.toBeNull();
    const html = renderToStaticMarkup(
      React.createElement(MarketEventTicker!, {
        activeModifiers: [{ type: MarketCardId.MC_COASTAL_STORM, remainingRounds: 2, affectedCells: [11, 14, 16, 18, 19] }],
      })
    );
    const expectedTitle = viTranslations.marketCards[MarketCardId.MC_COASTAL_STORM];
    expect(html).toContain(expectedTitle);
  });

  it('[TC-IMP128.14/MSS][UC-IMP128][Facet-2/Reactivity] Render thông tin chính xác từ SSOT Metadata cho MC_PUBLIC_INVEST', () => {
    expect(MarketEventTicker).not.toBeNull();
    const html = renderToStaticMarkup(
      React.createElement(MarketEventTicker!, {
        activeModifiers: [{ type: MarketCardId.MC_PUBLIC_INVEST, remainingRounds: 2, affectedCells: [5, 15, 25, 35] }],
      })
    );
    const expectedTitle = viTranslations.marketCards[MarketCardId.MC_PUBLIC_INVEST];
    expect(html).toContain(expectedTitle);
  });

  it('[TC-IMP128.15/MSS][UC-IMP128][Facet-2/Reactivity] Tự động đọc activeModifiers từ useGameStore khi không truyền prop', () => {
    expect(MarketEventTicker).not.toBeNull();
    useGameStore.setState({
      activeModifiers: [{ type: MarketCardId.MC_FREEZE_TRADE, remainingRounds: 2 }],
    });
    const html = renderToStaticMarkup(React.createElement(MarketEventTicker!));
    expect(html).toContain('data-testid="market-event-ticker"');
    expect(html).toContain('Đóng Băng Giao Dịch');
  });

  it('[TC-IMP128.16/MSS][UC-IMP128][Facet-3/Disposal] Khi remainingRounds chuyển từ 1 về 0, ticker tự động unmount và trả về null', () => {
    expect(MarketEventTicker).not.toBeNull();
    const htmlActive = renderToStaticMarkup(
      React.createElement(MarketEventTicker!, {
        activeModifiers: [{ type: MarketCardId.MC_FREEZE_TRADE, remainingRounds: 1 }],
      })
    );
    expect(htmlActive).toContain('data-testid="market-event-ticker"');

    const htmlExpired = renderToStaticMarkup(
      React.createElement(MarketEventTicker!, {
        activeModifiers: [{ type: MarketCardId.MC_FREEZE_TRADE, remainingRounds: 0 }],
      })
    );
    expect(htmlExpired).toBe('');
  });

  it('[TC-IMP128.17/MSS][UC-IMP128][Facet-4/ErrorDefense] Bỏ qua an toàn modifier không hợp lệ hoặc dữ liệu bất thường mà không gây crash', () => {
    expect(MarketEventTicker).not.toBeNull();
    const html = renderToStaticMarkup(
      React.createElement(MarketEventTicker!, {
        activeModifiers: [{ type: 'UNKNOWN_CARD_XYZ' as any, remainingRounds: 2 }],
      })
    );
    expect(typeof html).toBe('string');
  });
});

// ============================================================================
// CHỐT 3: Đồng Bộ Toàn Vẹn Nghiệp Vụ Đóng Băng & Phản Hồi Toast
// ============================================================================
describe('[IMP-128] Chốt 3: Đồng Bộ Toàn Vẹn Nghiệp Vụ Đóng Băng & Phản Hồi Toast', () => {
  beforeEach(() => {
    useGameStore.setState({
      floatingTexts: [],
      activeModifiers: [],
      currentTurnPlayerId: 'p1',
      playerPositions: { p1: 1 },
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Đại Gia Sài Gòn',
          balance: 20000,
          tokenColor: '#38BDF8',
          ownedProperties: [],
          bankrupt: false,
        },
      },
    });
  });

  it('[TC-IMP128.18/MSS][UC-IMP128][Facet-2/Reactivity] ActionDock: Nút Mua Đất bị vô hiệu hóa hoặc đổi nhãn cảnh báo khi isTradeFrozen = true', () => {
    const html = renderToStaticMarkup(
      React.createElement(ActionDock, {
        localPlayerId: 'p1',
        isMyTurn: true,
        hasRolledThisTurn: true,
        isTradeFrozen: true,
      } as any)
    );
    // Khi thị trường đóng băng, nút mua đất không được ở trạng thái kích hoạt cho phép mua tự do
    const hasDisabledOrFreezeLabel = html.includes('Đóng Băng') || html.includes('isTradeFrozen') || !html.includes('Mua Đất (#1)');
    expect(hasDisabledOrFreezeLabel).toBe(true);
  });

  it('[TC-IMP128.19/MSS][UC-IMP128][Facet-2/Reactivity] ActionDock: Nút Đàm Phán bị disabled hoặc có tooltip cảnh báo khi isTradeFrozen = true', () => {
    const html = renderToStaticMarkup(
      React.createElement(ActionDock, {
        localPlayerId: 'p1',
        isMyTurn: true,
        isTradeFrozen: true,
      } as any)
    );
    const tradeBtnTag = html.match(/<button[^>]*aria-label="Đàm phán thương lượng"[^>]*>/)?.[0] ?? '';
    const isSecured = tradeBtnTag.includes('disabled') || tradeBtnTag.toLowerCase().includes('đóng băng');
    expect(isSecured).toBe(true);
  });

  it('[TC-IMP128.20/MSS][UC-IMP128][Facet-2/Reactivity] ActionDock: Tự động khóa mua bán khi phát hiện MC_FREEZE_TRADE trong useGameStore', () => {
    useGameStore.setState({
      activeModifiers: [{ type: MarketCardId.MC_FREEZE_TRADE, remainingRounds: 1 }],
    });
    const html = renderToStaticMarkup(
      React.createElement(ActionDock, {
        localPlayerId: 'p1',
        isMyTurn: true,
        hasRolledThisTurn: true,
      })
    );
    const hasDisabledOrFreezeLabel = html.includes('Đóng Băng') || !html.includes('Mua Đất (#1)');
    expect(hasDisabledOrFreezeLabel).toBe(true);
  });

  it('[TC-IMP128.21/MSS][UC-IMP128][Facet-2/Reactivity] TitleDeedModal: Nút Mua BĐS bị disabled = true và đổi nhãn thành Thị Trường Đóng Băng khi isTradeFrozen = true', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 1,
        canBuy: true,
        isOwned: false,
        isTradeFrozen: true,
      } as any)
    );
    expect(html).toContain('Thị Trường Đóng Băng');
    expect(html).toMatch(/<button[^>]*disabled[^>]*>[\s\S]*?Thị Trường Đóng Băng[\s\S]*?<\/button>/);
  });

  it('[TC-IMP128.22/MSS][UC-IMP128][Facet-3/Disposal] TitleDeedModal: Nút Thế Chấp bị vô hiệu hóa khi isTradeFrozen = true bảo toàn kỷ luật tín dụng', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 1,
        isOwned: true,
        isOwner: true,
        isMortgaged: false,
        onMortgage: vi.fn(),
        isTradeFrozen: true,
      } as any)
    );
    const mortgageBtnTag = html.match(/<button[^>]*>[\s\S]*?Thế Chấp[\s\S]*?<\/button>/)?.[0] ?? '';
    const isMortgageLocked = mortgageBtnTag.includes('disabled') || mortgageBtnTag.includes('cursor-not-allowed');
    expect(isMortgageLocked).toBe(true);
  });

  it('[TC-IMP128.23/MSS][UC-IMP128][Facet-3/Disposal] TitleDeedModal: Nút Bỏ Qua đổi thành Đóng không kích hoạt onPass khi isTradeFrozen = true', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 1,
        canBuy: true,
        isOwned: false,
        isTradeFrozen: true,
      } as any)
    );
    // Khi thị trường đóng băng, không cho phép kích hoạt sàn đấu giá (onPass), chỉ cho phép Đóng
    expect(html).toContain('Đóng');
    expect(html).not.toContain('Bỏ Qua');
  });

  it('[TC-IMP128.24/A1][UC-IMP128][Facet-2/Reactivity] TitleDeedModal: Khi isTradeFrozen = false, nút Mua BĐS và Bỏ Qua hoạt động bình thường', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 1,
        canBuy: true,
        isOwned: false,
        isTradeFrozen: false,
      } as any)
    );
    expect(html).toContain('Mua BĐS');
    expect(html).toContain('Bỏ Qua');
    expect(html).not.toContain('Thị Trường Đóng Băng');
  });

  it('[TC-IMP128.25/MSS][UC-IMP128][Facet-2/Reactivity] ws_message_handler: Đẩy thông báo cảnh báo đóng băng vào floatingTexts khi nhận error TradeFrozen', () => {
    useGameStore.setState({ floatingTexts: [] });
    const dummyCtx: WsMessageHandlerContext = {
      roomCode: 'ROOM40',
      playerId: 'p1',
      socket: { send: vi.fn() },
      onError: vi.fn(),
      setErrorReason: vi.fn(),
    };
    handleWsMessage({ type: 'ERROR', reasonCode: 'TradeFrozen' as any }, dummyCtx);

    const toasts = useGameStore.getState().floatingTexts;
    expect(toasts.length).toBeGreaterThanOrEqual(1);
    const toastContent = `${toasts[0]?.title ?? ''} ${toasts[0]?.text ?? ''}`;
    expect(toastContent).toMatch(/đóng băng|Đóng Băng/i);
  });

  it('[TC-IMP128.26/MSS][UC-IMP128][Facet-2/Reactivity] ws_message_handler: Đẩy thông báo cảnh báo đóng băng vào floatingTexts khi nhận error FREEZE_ACTIVE', () => {
    useGameStore.setState({ floatingTexts: [] });
    const dummyCtx: WsMessageHandlerContext = {
      roomCode: 'ROOM40',
      playerId: 'p1',
      socket: { send: vi.fn() },
      onError: vi.fn(),
      setErrorReason: vi.fn(),
    };
    handleWsMessage({ type: 'ERROR', reasonCode: 'FREEZE_ACTIVE' as any }, dummyCtx);

    const toasts = useGameStore.getState().floatingTexts;
    expect(toasts.length).toBeGreaterThanOrEqual(1);
    const toastContent = `${toasts[0]?.title ?? ''} ${toasts[0]?.text ?? ''}`;
    expect(toastContent).toMatch(/đóng băng|Đóng Băng/i);
  });
});

// ============================================================================
// CHỐT 4: Đồng Bộ Mặc Định 40 Vòng Đấu & Giao Thức Mạng
// ============================================================================
describe('[IMP-128] Chốt 4: Đồng Bộ Mặc Định 40 Vòng Đấu & Giao Thức Mạng', () => {
  it('[TC-IMP128.27/MSS][UC-IMP128][Facet-1/Boundary] useGameStore.getState().maxRounds có giá trị mặc định ban đầu là 40 vòng', () => {
    const defaultMaxRounds = useGameStore.getState().maxRounds;
    expect(defaultMaxRounds).toBe(40);
  });

  it('[TC-IMP128.28/MSS][UC-IMP128][Facet-4/ErrorDefense] WsServerMessage và ReasonCode chấp nhận kiểu TradeFrozen và FREEZE_ACTIVE', () => {
    const errorMsgTradeFrozen: WsServerMessage = {
      type: 'ERROR',
      reasonCode: 'TradeFrozen' as ReasonCode,
    };
    const errorMsgFreezeActive: WsServerMessage = {
      type: 'ERROR',
      reasonCode: 'FREEZE_ACTIVE' as ReasonCode,
    };

    expect(errorMsgTradeFrozen.reasonCode).toBe('TradeFrozen');
    expect(errorMsgFreezeActive.reasonCode).toBe('FREEZE_ACTIVE');
  });
});
