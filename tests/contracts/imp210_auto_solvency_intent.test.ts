// @vitest-environment happy-dom
// [TC-210.01/MSS..TC-210.16/MSS][UC-IMP210] 1-Click Smart Auto-Solvency Contract Suite
// Universal 5-Facet Behavioral Matrix:
// Facet 1: Boundary & Range (Biên & Phạm Vi Pha Chơi) (TC-210.01 - 03)
// Facet 2: Touch Targets & Accessibility (Công Thái Học & Sàn Chạm 44px) (TC-210.04 - 06)
// Facet 3: Formatting & Responsive Layout (Định Dạng Tiền Tệ & Tràn Khung) (TC-210.07 - 09)
// Facet 4: Feedback & Tactile Depth (Độ Nảy Xúc Giác & Callbacks) (TC-210.10 - 12)
// Facet 5: Invariant State Transitions & Edge Cases (Bảo Toàn Luật Chơi & Bất Biến) (TC-210.13 - 16)

import { describe, it, expect, beforeEach, vi } from 'vitest';
import React, { act } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createRoot } from 'react-dom/client';

import { RoomManager } from '../../src/server/room_manager.js';
import { dispatchPlayerIntent } from '../../src/server/intent_dispatcher.js';
import { TurnPhase, ActionRejectReason } from '../../src/domain/room.js';
import { MacroCycleType } from '../../src/domain/macro_cycle_types.js';
import { InsolvencyBanner } from '../../src/client/ui/modals/insolvency_banner.js';
import { formatCurrency } from '../../src/client/ui/ui_helpers.js';
import { useGameStore } from '../../src/client/store/game_store.js';
import { useLobbyStore } from '../../src/client/store/lobby_store.js';
import { useAppSession } from '../../src/client/network/use_app_session.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Safe dynamic resolution for Station 1 Business RED contract gate
const DEFICIT_BANNER_PATH = '../../src/client/ui/modals/portfolio_deficit_banner';
let deficitBannerMod: any = null;
try {
  deficitBannerMod = await import(/* @vite-ignore */ DEFICIT_BANNER_PATH);
} catch {
  try {
    deficitBannerMod = await import(/* @vite-ignore */ `${DEFICIT_BANNER_PATH}.js`);
  } catch {
    deficitBannerMod = null;
  }
}
const PortfolioDeficitBanner = deficitBannerMod?.PortfolioDeficitBanner;

function setup(rng = () => 0) {
  const mgr = new RoomManager(rng);
  const room = mgr.createRoom('player_alpha');
  mgr.joinRoom(room.roomCode, 'player_beta');
  mgr.startGame(room.roomCode);
  const reg = mgr.getRegistry(room.roomCode)!;
  const sm = mgr.getPropertyStates(room.roomCode)!;
  return { mgr, room, reg, sm };
}

function findVNode(node: any, predicate: (n: any) => boolean): any {
  if (!node) return null;
  if (predicate(node)) return node;
  const children = node.props?.children;
  if (Array.isArray(children)) {
    for (const child of children) {
      const res = findVNode(child, predicate);
      if (res) return res;
    }
  } else if (children) {
    return findVNode(children, predicate);
  }
  return null;
}

describe('[TC-210.01/MSS..TC-210.16/MSS][UC-IMP210] 1-Click Smart Auto-Solvency Contract Suite', () => {
  beforeEach(() => {
    useGameStore.getState().resetGameState();
    useGameStore.getState().closeModal();
    useLobbyStore.setState({
      roomCode: null,
      myPlayerId: 'player_alpha',
      isHost: true,
      gameStarted: true,
    });
  });

  // =========================================================================
  // FACET 1: BOUNDARY & RANGE (BIÊN & PHẠM VI PHA CHƠI)
  // =========================================================================
  describe('Facet 1: Boundary & Range (Biên & Phạm Vi Pha Chơi)', () => {
    it('[TC-210.01/MSS][UC-IMP210] INTENT_AUTO_SOLVENCY bị từ chối nếu phòng chơi không ở trong TurnPhase.InsolvencyPhase', () => {
      const { mgr, room } = setup();
      room.phase = TurnPhase.WaitingRoll;
      const resWaiting = dispatchPlayerIntent(mgr, room.roomCode, 'player_alpha', { type: 'INTENT_AUTO_SOLVENCY' });
      expect(resWaiting.success).toBe(false);
      expect(resWaiting.reason).toBe('INVALID_PHASE');

      room.phase = TurnPhase.ActionPhase;
      const resAction = dispatchPlayerIntent(mgr, room.roomCode, 'player_alpha', { type: 'INTENT_AUTO_SOLVENCY' });
      expect(resAction.success).toBe(false);
      expect(resAction.reason).toBe('INVALID_PHASE');
    });

    it('[TC-210.02/MSS][UC-IMP210] INTENT_AUTO_SOLVENCY cứu nguy thành công người chơi âm tiền có nhà phố/khách sạn thông qua hạ cấp đồng đều', () => {
      const { mgr, room, reg, sm } = setup();
      const alpha = room.players[0]!;
      reg.set(1, alpha.id);
      sm.set(1, { level: 2 });
      reg.set(3, alpha.id);
      sm.set(3, { level: 2 });
      alpha.balance = -300;
      room.phase = TurnPhase.InsolvencyPhase;
      room.currentPlayerIndex = 0;

      const res = dispatchPlayerIntent(mgr, room.roomCode, alpha.id, { type: 'INTENT_AUTO_SOLVENCY' });
      expect(res.success).toBe(true);
      expect(room.phase).toBe(TurnPhase.PropertyManagement);
      expect(alpha.balance).toBeGreaterThanOrEqual(0);
    });

    it('[TC-210.03/MSS][UC-IMP210] INTENT_AUTO_SOLVENCY cứu nguy thành công người chơi âm tiền bằng cách thế chấp các lô đất chưa thế chấp từ giá thấp nhất đến cao nhất', () => {
      const { mgr, room, reg, sm } = setup();
      const alpha = room.players[0]!;
      reg.set(1, alpha.id);
      sm.set(1, { level: 0 });
      reg.set(6, alpha.id);
      sm.set(6, { level: 0 });
      alpha.balance = -250;
      room.phase = TurnPhase.InsolvencyPhase;
      room.currentPlayerIndex = 0;

      const res = dispatchPlayerIntent(mgr, room.roomCode, alpha.id, { type: 'INTENT_AUTO_SOLVENCY' });
      expect(res.success).toBe(true);
      expect(alpha.mortgagedProperties).toContain(1);
      expect(alpha.mortgagedProperties).not.toContain(6);
      expect(alpha.balance).toBeGreaterThanOrEqual(0);
    });
  });

  // =========================================================================
  // FACET 2: TOUCH TARGETS & ACCESSIBILITY (CÔNG THÁI HỌC & SÀN CHẠM 44PX)
  // =========================================================================
  describe('Facet 2: Touch Targets & Accessibility (Công Thái Học & Sàn Chạm 44px)', () => {
    it('[TC-210.04/MSS][UC-IMP210] Nút "⚡ Cân Đối Tự Động" trong PortfolioDeficitBanner đạt chiều cao sàn min-h-[44px], có focus-visible:ring-2 và data-testid="portfolio-auto-solvency-btn"', () => {
      expect(PortfolioDeficitBanner).toBeTruthy();
      const html = renderToStaticMarkup(
        React.createElement(PortfolioDeficitBanner, {
          isNegative: true,
          currentBalance: -500,
          deficitAmount: 500,
          onAutoSolvency: () => {},
        })
      );
      expect(html).toContain('data-testid="portfolio-auto-solvency-btn"');
      expect(html).toContain('min-h-[44px]');
      expect(html).toContain('focus-visible:ring-2');
    });

    it('[TC-210.05/MSS][UC-IMP210] Nút "⚡ Cứu Nguy Nhanh (Cân Đối Tự Động)" trong InsolvencyBanner đạt chiều cao sàn min-h-[44px], có focus-visible:ring-2 và data-testid="insolvency-auto-solvency-btn"', () => {
      const html = renderToStaticMarkup(
        React.createElement(InsolvencyBanner, {
          playerId: 'player_alpha',
          playerName: 'Đại Gia Sài Gòn',
          deficit: 775,
          onAutoSolvency: () => {},
          onManageProperties: () => {},
          onDeclareBankruptcy: () => {},
        })
      );
      expect(html).toContain('data-testid="insolvency-auto-solvency-btn"');
      expect(html).toContain('min-h-[44px]');
      expect(html).toContain('focus-visible:ring-2');
    });

    it('[TC-210.06/MSS][UC-IMP210] Toàn bộ các nút hành động trong InsolvencyBanner duy trì min-h-[44px] và phông chữ rõ ràng >= 12px', () => {
      const html = renderToStaticMarkup(
        React.createElement(InsolvencyBanner, {
          playerId: 'player_alpha',
          playerName: 'Đại Gia Sài Gòn',
          deficit: 775,
          onAutoSolvency: () => {},
          onManageProperties: () => {},
          onDeclareBankruptcy: () => {},
        })
      );
      expect(html).toMatch(/data-testid="insolvency-auto-solvency-btn"[^>]*min-h-\[44px\]/);
      expect(html).toMatch(/min-h-\[44px\][^>]*text-sm[^>]*>[^<]*Quản Lý BĐS/);
      expect(html).toMatch(/min-h-\[44px\][^>]*text-xs[^>]*>[^<]*Tuyên Bố Phá Sản/);
    });
  });

  // =========================================================================
  // FACET 3: FORMATTING & RESPONSIVE LAYOUT (ĐỊNH DẠNG TIỀN TỆ & TRÀN KHUNG)
  // =========================================================================
  describe('Facet 3: Formatting & Responsive Layout (Định Dạng Tiền Tệ & Tràn Khung)', () => {
    it('[TC-210.07/MSS][UC-IMP210] PortfolioDeficitBanner định dạng số tiền âm chính xác thông qua formatCurrency và hiển thị nhãn số tiền còn thiếu dạng số phân tách hàng nghìn vi-VN', () => {
      expect(PortfolioDeficitBanner).toBeTruthy();
      const html = renderToStaticMarkup(
        React.createElement(PortfolioDeficitBanner, {
          isNegative: true,
          currentBalance: -775,
          deficitAmount: 775,
          onAutoSolvency: () => {},
        })
      );
      expect(html).toContain(formatCurrency(-775));
      expect(html).toContain((775).toLocaleString('vi-VN'));
      expect(html).toContain('Số tiền còn thiếu');
    });

    it('[TC-210.08/MSS][UC-IMP210] PortfolioDeficitBanner không render bất kỳ phần tử DOM nào khi isNegative = false HOẶC deficitAmount <= 0', () => {
      expect(PortfolioDeficitBanner).toBeTruthy();
      const htmlPositive = renderToStaticMarkup(
        React.createElement(PortfolioDeficitBanner, {
          isNegative: false,
          currentBalance: 500,
          deficitAmount: 0,
        })
      );
      const htmlZeroDeficit = renderToStaticMarkup(
        React.createElement(PortfolioDeficitBanner, {
          isNegative: true,
          currentBalance: -500,
          deficitAmount: 0,
        })
      );
      expect(htmlPositive).toBe('');
      expect(htmlZeroDeficit).toBe('');
    });

    it('[TC-210.09/MSS][UC-IMP210] InsolvencyBanner hiển thị đúng tên người chơi playerName (hoặc fallback "Bạn") và định dạng số tiền thâm hụt với màu đỏ nổi bật', () => {
      const htmlNamed = renderToStaticMarkup(
        React.createElement(InsolvencyBanner, {
          playerId: 'player_alpha',
          playerName: 'Đại Gia Hà Thành',
          deficit: 1250,
        })
      );
      expect(htmlNamed).toContain('Đại Gia Hà Thành');
      expect(htmlNamed).toContain(formatCurrency(-1250));
      expect(htmlNamed).toContain('text-rose-700');

      const htmlFallback = renderToStaticMarkup(
        React.createElement(InsolvencyBanner, {
          playerId: 'player_alpha',
          playerName: undefined,
          deficit: 500,
        })
      );
      expect(htmlFallback).toContain('Bạn');
    });
  });

  // =========================================================================
  // FACET 4: FEEDBACK & TACTILE DEPTH (ĐỘ NẢY XÚC GIÁC & CALLBACKS)
  // =========================================================================
  describe('Facet 4: Feedback & Tactile Depth (Độ Nảy Xúc Giác & Callbacks)', () => {
    it('[TC-210.10/MSS][UC-IMP210] Nút cân đối tự động trong PortfolioDeficitBanner chứa bóng xúc giác 3D shadow-[0_3px_0_0_#b45309] và hiệu ứng nhấn active:translate-y-[2px] active:shadow-none', () => {
      expect(PortfolioDeficitBanner).toBeTruthy();
      const html = renderToStaticMarkup(
        React.createElement(PortfolioDeficitBanner, {
          isNegative: true,
          currentBalance: -500,
          deficitAmount: 500,
          onAutoSolvency: () => {},
        })
      );
      expect(html).toContain('shadow-[0_3px_0_0_#b45309]');
      expect(html).toContain('active:translate-y-[2px]');
      expect(html).toContain('active:shadow-none');
    });

    it('[TC-210.11/MSS][UC-IMP210] Nhấp nút cân đối tự động trong PortfolioDeficitBanner kích hoạt onAutoSolvency callback chính xác 1 lần', () => {
      expect(PortfolioDeficitBanner).toBeTruthy();
      const onAutoSolvency = vi.fn();
      const vdom = PortfolioDeficitBanner({
        isNegative: true,
        currentBalance: -500,
        deficitAmount: 500,
        onAutoSolvency,
      });
      const btn = findVNode(vdom, (n) => n?.props?.['data-testid'] === 'portfolio-auto-solvency-btn');
      expect(btn).not.toBeNull();
      btn?.props?.onClick?.();
      expect(onAutoSolvency).toHaveBeenCalledTimes(1);
    });

    it('[TC-210.12/MSS][UC-IMP210] Nhấp nút cân đối tự động trong InsolvencyBanner kích hoạt onAutoSolvency callback chính xác 1 lần', () => {
      const onAutoSolvency = vi.fn();
      const vdom = InsolvencyBanner({
        playerId: 'player_alpha',
        playerName: 'Đại Gia',
        deficit: 500,
        onAutoSolvency,
      });
      const btn = findVNode(vdom, (n) => n?.props?.['data-testid'] === 'insolvency-auto-solvency-btn');
      expect(btn).not.toBeNull();
      btn?.props?.onClick?.();
      expect(onAutoSolvency).toHaveBeenCalledTimes(1);
    });
  });

  // =========================================================================
  // FACET 5: INVARIANT STATE TRANSITIONS & EDGE CASES (BẢO TOÀN LUẬT CHƠI & BẤT BIẾN)
  // =========================================================================
  describe('Facet 5: Invariant State Transitions & Edge Cases (Bảo Toàn Luật Chơi & Bất Biến)', () => {
    it('[TC-210.13/MSS][UC-IMP210] INTENT_AUTO_SOLVENCY tuyên bố phá sản nếu tổng giá trị thanh lý toàn bộ tài sản không đủ bù đắp thâm hụt', () => {
      const { mgr, room } = setup();
      const alpha = room.players[0]!;
      alpha.balance = -999999;
      room.phase = TurnPhase.InsolvencyPhase;
      room.currentPlayerIndex = 0;

      const res = dispatchPlayerIntent(mgr, room.roomCode, alpha.id, { type: 'INTENT_AUTO_SOLVENCY' });
      expect(res.success).toBe(true);
      expect(alpha.bankrupt).toBe(true);
    });

    it('[TC-210.14/MSS][UC-IMP210] INTENT_AUTO_SOLVENCY bỏ qua các ô đất đang chịu hiệu ứng đóng băng thanh khoản (MACRO_LIQUIDITY_FREEZE)', () => {
      const { mgr, room, reg, sm } = setup();
      const alpha = room.players[0]!;
      reg.set(1, alpha.id);
      sm.set(1, { level: 0 });
      reg.set(3, alpha.id);
      sm.set(3, { level: 0 });

      room.activeModifiers = [
        {
          type: MacroCycleType.MACRO_LIQUIDITY_FREEZE,
          remainingRounds: 2,
          affectedCells: [1],
        },
      ];
      alpha.balance = -200;
      room.phase = TurnPhase.InsolvencyPhase;
      room.currentPlayerIndex = 0;

      const res = dispatchPlayerIntent(mgr, room.roomCode, alpha.id, { type: 'INTENT_AUTO_SOLVENCY' });
      expect(res.success).toBe(true);
      expect(alpha.mortgagedProperties).not.toContain(1);
      expect(alpha.mortgagedProperties).toContain(3);
      expect(alpha.balance).toBeGreaterThanOrEqual(0);
    });

    it('[TC-210.15/MSS][UC-IMP210] Chống chiếm quyền giải cứu ngoài lượt (Off-Turn Hijack Guard): từ chối nếu không phải lượt hoặc không bị âm tiền', () => {
      const { mgr, room } = setup();
      room.phase = TurnPhase.InsolvencyPhase;
      room.currentPlayerIndex = 0;

      const resBeta = dispatchPlayerIntent(mgr, room.roomCode, 'player_beta', { type: 'INTENT_AUTO_SOLVENCY' });
      expect(resBeta.success).toBe(false);
      expect(resBeta.reason).toBe(ActionRejectReason.NOT_YOUR_TURN);

      const alpha = room.players[0]!;
      alpha.balance = 500;
      const resSolvent = dispatchPlayerIntent(mgr, room.roomCode, alpha.id, { type: 'INTENT_AUTO_SOLVENCY' });
      expect(resSolvent.success).toBe(false);
      expect(resSolvent.reason).toBe(ActionRejectReason.NOT_YOUR_TURN);
    });

    it('[TC-210.16/MSS][UC-IMP210] Khi nhận được delta cập nhật số dư >= 0, client session tự động đóng InsolvencyBanner', () => {
      useGameStore.setState({
        activeModal: 'insolvency',
        modalPayload: { playerId: 'player_alpha', deficit: 500 },
        playersInfo: {
          player_alpha: {
            id: 'player_alpha',
            name: 'Player Alpha',
            balance: 0,
            tokenColor: '#ef4444',
            ownedProperties: [],
            mortgagedProperties: [],
            isBot: false,
            bankrupt: false,
          },
        },
      });

      const socketRef: { current: MockWebSocket | null } = { current: null };
      class MockWebSocket {
        readyState = 1;
        send = vi.fn();
        close = vi.fn();
        onopen: ((event: Event) => void) | null = null;
        onmessage: ((event: { data: string }) => void) | null = null;
        onerror: ((event: Event) => void) | null = null;
        onclose: ((event: CloseEvent) => void) | null = null;
        constructor() {
          socketRef.current = this;
        }
      }
      const origWs = globalThis.WebSocket;
      vi.stubGlobal('WebSocket', MockWebSocket);

      function SessionHarness() {
        useAppSession(
          'ROOM_TEST',
          'player_alpha',
          true,
          [],
          true,
          useGameStore.getState().openModal,
          useGameStore.getState().triggerEmote,
          'player_alpha',
          useGameStore.getState().setPlayersInfo,
          useGameStore.getState().setCurrentTurnPlayerId,
          useGameStore.getState().setTreasuryPool,
          useGameStore.getState().setPlayerPositions,
          useLobbyStore.getState().initLobby,
          () => {},
        );
        return null;
      }

      const container = document.createElement('div');
      document.body.appendChild(container);
      const root = createRoot(container);

      try {
        act(() => {
          root.render(React.createElement(SessionHarness));
        });
        expect(socketRef.current).not.toBeNull();

        act(() => {
          socketRef.current?.onmessage?.({
            data: JSON.stringify({
              type: 'STATE_DELTA',
              delta: {
                tick: 42,
                cells: [],
                players: [{ id: 'player_alpha', balance: 350, bankrupt: false }],
                turnPhase: TurnPhase.InsolvencyPhase,
                roomStarted: true,
              },
            }),
          });
        });

        expect(useGameStore.getState().activeModal).toBeNull();
      } finally {
        act(() => {
          root.unmount();
        });
        container.remove();
        if (origWs) {
          vi.stubGlobal('WebSocket', origWs);
        } else {
          vi.unstubAllGlobals();
        }
      }
    });
  });
});
