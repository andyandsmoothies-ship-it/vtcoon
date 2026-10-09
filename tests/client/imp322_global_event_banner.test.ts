// [TC-322.01/MSS..TC-322.06/A2][UC-GLOB-BAN] Global Event Banner for Board-Wide Cards Contract Suite
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { useGameStore, FloatingTextType } from '../../src/client/store/game_store';
import { useLobbyStore } from '../../src/client/store/lobby_store';
import type { FloatingTextItem } from '../../src/client/store/game_store_subtypes';
import * as applyDeltaModule from '../../src/client/network/apply_delta';
import { MilestoneBanner } from '../../src/client/ui/floating_numbers';
import type { DeltaPayload } from '../../src/server/session_manager';

declare module '../../src/client/store/game_store_subtypes' {
  interface FloatingTextItem {
    readonly isBoardWide?: boolean;
  }
}

interface ApplyDeltaContractExports {
  readonly syncEventCard: typeof applyDeltaModule.syncEventCard;
  readonly isBoardWideCard?: (cardId?: string) => boolean;
  readonly BOARD_WIDE_CARDS?: ReadonlySet<string>;
}

const deltaModule: ApplyDeltaContractExports = applyDeltaModule;
const isBoardWideCard = deltaModule.isBoardWideCard;

describe('[TC-322.01..06][UC-GLOB-BAN] Global Event Banner for Board-Wide Cards', () => {
  beforeEach(() => {
    useGameStore.getState().resetGameState();
    useGameStore.setState({
      floatingTexts: [],
      currentTurnPlayerId: 'p1',
      lastEventCard: null,
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Player 1',
          balance: 10000,
          tokenColor: '#ef4444',
          isBankrupt: false,
          isBot: false,
          ownedProperties: [],
        },
        bot_4: {
          id: 'bot_4',
          name: 'Bot 4',
          balance: 10000,
          tokenColor: '#3b82f6',
          isBankrupt: false,
          isBot: true,
          ownedProperties: [],
        },
      },
    });
    useLobbyStore.setState({
      myPlayerId: 'p1',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('[TC-322.01/MSS][UC-GLOB-BAN/MSS] Given MC_MEGA_CONCERT event card, When isBoardWideCard is queried, Then returns true identifying board-wide scope', () => {
    expect(isBoardWideCard?.('MC_MEGA_CONCERT')).toBe(true);
    expect(isBoardWideCard?.('MC_FIRE_INSPECTION')).toBe(true);
    expect(isBoardWideCard?.('CC_COMMUNITY_CHEST')).toBe(false);
    expect(isBoardWideCard?.(undefined)).toBe(false);
  });

  it('[TC-322.02/MSS][UC-GLOB-BAN/MSS] Given delta with MC_MEGA_CONCERT drawn by bot_4, When syncEventCard executes, Then adds floating text with isBoardWide=true, 5000ms duration, and prioritized effectDetail', () => {
    const delta: DeltaPayload = {
      roomCode: 'VT_322',
      tick: 20,
      cells: [],
      currentTurnPlayerId: 'bot_4',
      lastEventCard: {
        id: 'card_mc_mega_concert',
        type: 'Market',
        cardType: 'market',
        cardId: 'MC_MEGA_CONCERT',
        title: 'ĐẠI NHẠC HỘI',
        description: 'Mô tả sự kiện chung chung',
        effectDetail: 'Tất cả người chơi di chuyển đến Nhà Hát Lớn',
        drawnBy: 'bot_4',
      },
    };

    applyDeltaModule.syncEventCard(delta.lastEventCard, useGameStore.getState(), delta);

    const items = useGameStore.getState().floatingTexts;
    const banner = items.find((t) => t.actionType === 'market');

    expect(banner?.isBoardWide).toBe(true);
    expect(banner?.durationMs).toBe(5000);
    expect(banner?.text).toBe('Tất cả người chơi di chuyển đến Nhà Hát Lớn');
  });

  it('[TC-322.03/MSS][UC-GLOB-BAN/MSS] Given delta with board-wide card drawn by local player (myPid), When syncEventCard executes, Then adds floating text without dropping notification', () => {
    const delta: DeltaPayload = {
      roomCode: 'VT_322',
      tick: 21,
      cells: [],
      currentTurnPlayerId: 'p1',
      lastEventCard: {
        id: 'card_mc_rate_hike',
        type: 'Market',
        cardType: 'market',
        cardId: 'MC_RATE_HIKE',
        title: 'TĂNG LÃI SUẤT',
        description: 'Ngân hàng tăng lãi suất vay lên 15%',
        effectDetail: 'Tất cả người chơi phải trả phí lãi suất bổ sung',
        drawnBy: 'p1',
      },
    };

    applyDeltaModule.syncEventCard(delta.lastEventCard, useGameStore.getState(), delta);

    const items = useGameStore.getState().floatingTexts;

    expect(items.length).toBe(1);
    expect(items[0]?.isBoardWide).toBe(true);
    expect(items[0]?.playerId).toBe('p1');
  });

  it('[TC-322.04/A1][UC-GLOB-BAN/A1] Given standard non-board-wide event card, When syncEventCard executes, Then sets isBoardWide=false and 2500ms duration', () => {
    const delta: DeltaPayload = {
      roomCode: 'VT_322',
      tick: 22,
      cells: [],
      currentTurnPlayerId: 'bot_4',
      lastEventCard: {
        id: 'card_std_bonus',
        type: 'Market',
        cardType: 'market',
        cardId: 'MC_STANDARD_BONUS',
        title: 'CỔ TỨC BẤT ĐỘNG SẢN',
        description: 'Người rút thẻ nhận cổ tức 500 Tr.',
        drawnBy: 'bot_4',
      },
    };

    applyDeltaModule.syncEventCard(delta.lastEventCard, useGameStore.getState(), delta);

    const items = useGameStore.getState().floatingTexts;
    const banner = items.find((t) => t.actionType === 'market');

    expect(banner?.isBoardWide).toBe(false);
    expect(banner?.durationMs).toBe(2500);
  });

  it('[TC-322.05/MSS][UC-GLOB-BAN/MSS] Given floating text item with isBoardWide=true, When MilestoneBanner renders, Then renders with testid \'global-event-banner\' and category \'SỰ KIỆN TOÀN BÀN CỜ\'', () => {
    const item: FloatingTextItem = {
      id: 'ft_boardwide_concert',
      text: 'Tất cả người chơi di chuyển đến Nhà Hát Lớn',
      type: FloatingTextType.Bonus,
      playerId: 'bot_4',
      actionType: 'market',
      title: 'ĐẠI NHẠC HỘI',
      durationMs: 5000,
      isBoardWide: true,
      timestamp: Date.now(),
    };

    const html = renderToStaticMarkup(React.createElement(MilestoneBanner, { item }));

    expect(html).toContain('data-testid="global-event-banner"');
    expect(html).toContain('SỰ KIỆN TOÀN BÀN CỜ');
  });

  it('[TC-322.06/A2][UC-GLOB-BAN/A2] Given MilestoneBanner with standard market card, When rendered, Then maintains category \'SỰ KIỆN THỊ TRƯỜNG\' and testid \'event-card-notification-banner\'', () => {
    const item: FloatingTextItem = {
      id: 'ft_standard_market',
      text: 'Giá trị tiền thuê toàn bản đồ tăng 20%',
      type: FloatingTextType.Bonus,
      playerId: 'bot_4',
      actionType: 'market',
      title: 'BÙNG NỔ ĐỊA ỐC',
      durationMs: 4000,
      isBoardWide: false,
      timestamp: Date.now(),
    };

    const html = renderToStaticMarkup(React.createElement(MilestoneBanner, { item }));

    expect(html).toContain('data-testid="event-card-notification-banner"');
    expect(html).toContain('SỰ KIỆN THỊ TRƯỜNG');
  });

  it('[TC-322.07/MSS][UC-GLOB-BAN/MSS] Given CC_FRANCHISE chance card affecting all opponents, When isBoardWideCard is queried, Then returns true', () => {
    expect(applyDeltaModule.isBoardWideCard('CC_FRANCHISE')).toBe(true);
    expect(applyDeltaModule.isBoardWideCard('CC_CONTRACT_PENALTY')).toBe(true);
  });
});
