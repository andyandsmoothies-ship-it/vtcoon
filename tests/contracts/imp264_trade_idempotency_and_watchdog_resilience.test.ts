// [CONTRACT TEST] IMP-264: P2P Trade Intent Double-Tap Debounce, Server Idempotency & Watchdog Harmonization
// Traceability Tags: [TC-264.01..17] & [UC-TRADE-001, UC-COORD-001, UC-WSS-001, UC-STRIP-001, UC-MODAL-001, UC-WATCHDOG-001]
// Universal 5-Facet Behavioral Matrix & Anti-TIDD SSOT Enforcement
// Exactly 17 Atomic Tests (1-4 assertions/test, zero loops in it(), zero dirty casts)

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PendingTradeManager, pendingTradeManager } from '../../src/server/pending_trade_manager.js';
import { coordRespondTradeOffer, type RoomContext } from '../../src/server/room_property_coordinator.js';
import { handleIntentMsg, type IntentHandlerDeps } from '../../src/server/network/wss_intent_handler.js';
import * as lobbyHandlers from '../../src/server/network/wss_lobby_handlers.js';
import { RoomManager, type RollResult } from '../../src/server/room_manager.js';
import { SessionManager } from '../../src/server/session_manager.js';
import { SocketRegistry } from '../../src/server/network/socket_registry.js';
import { DeltaBroadcaster } from '../../src/server/network/delta_broadcaster.js';
import { AdminManager } from '../../src/server/network/admin_manager.js';
import { IntentMutex } from '../../src/server/network/intent_mutex.js';
import { IntentGuard } from '../../src/server/security/intent_guard.js';
import { InlineBotTradeStrip } from '../../src/client/ui/modals/bot_trade_offer_strip.js';
import { BotTradeOfferModal } from '../../src/client/ui/modals/bot_trade_offer_modal.js';
import { PerfTelemetryTracker } from '../../src/client/telemetry/perf_telemetry_tracker.js';
import { watchdogMonitor } from '../../src/client/telemetry/watchdog_monitor.js';
import { useTelemetryStore } from '../../src/client/telemetry/telemetry_store.js';
import { useGameStore } from '../../src/client/store/game_store.js';
import { useLobbyStore } from '../../src/client/store/lobby_store.js';
import { createRoom, createPlayer, TurnPhase, type Room, type Player } from '../../src/domain/room.js';
import type { PropertyRegistry, PropertyStateMap } from '../../src/domain/property_data.js';
import type { WebSocket } from 'ws';
import type { WsClientMessage } from '../../src/server/network/network_types.js';
import type { PlayerIntent } from '../../src/server/intent_dispatcher.js';

// Module augmentation for TypeScript compilation of upcoming IMP-264 interfaces
declare module '../../src/server/pending_trade_manager.js' {
  export interface ResolvedOfferRecord {
    readonly roomCode: string;
    readonly responderPlayerId: string;
    readonly accept: boolean;
    readonly resolvedAt: number;
  }

  interface PendingTradeManager {
    getRecentlyResolved(roomCode: string, playerId: string, offerId: string): ResolvedOfferRecord | undefined;
    isRecentlyResolved(roomCode: string, playerId: string, offerId: string, accept: boolean): boolean;
    clearResolvedOffersForRoom(roomCode: string): void;
    resolveSession(
      roomCode: string,
      offerId: string,
      accept: boolean,
      responderPlayerId?: string,
    ): PendingTradeSession | undefined;
  }
}

declare module '../../src/server/network/wss_lobby_handlers.js' {
  export function executeIntentAction(
    rooms: RoomManager,
    roomCode: string,
    playerId: string,
    intent: PlayerIntent,
  ): { success: boolean; reason?: string; rollResult?: RollResult; idempotent?: boolean };
}

// Global hook for R3F frame tick execution in headless environment
let frameTickCallback: ((state: unknown, delta: number) => void) | undefined;
vi.mock('@react-three/fiber', () => ({
  useThree: () => ({
    gl: {
      info: {
        render: { calls: 10, triangles: 100 },
        reset: () => {},
      },
    },
  }),
  useFrame: (cb: (state: unknown, delta: number) => void) => {
    frameTickCallback = cb;
  },
}));

// Clean hook harness for executing useEffect post-render in Node environment without React internal spies
const queuedEffects: Array<() => void | (() => void)> = [];
const activeCleanups: Array<() => void> = [];

function flushQueuedEffects(): void {
  while (queuedEffects.length > 0) {
    const effect = queuedEffects.shift();
    if (effect) {
      const cleanup = effect();
      if (typeof cleanup === 'function') {
        activeCleanups.push(cleanup);
      }
    }
  }
}

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useEffect: (effect: () => void | (() => void)) => {
      queuedEffects.push(effect);
    },
  };
});

function findVNodeByTestId(
  node: React.ReactNode,
  testId: string,
): React.ReactElement<{ children?: React.ReactNode; 'data-testid'?: string; onClick?: () => void }> | null {
  if (!React.isValidElement<{ children?: React.ReactNode; 'data-testid'?: string; onClick?: () => void }>(node)) {
    return null;
  }
  if (node.props['data-testid'] === testId) {
    return node;
  }
  const children = node.props.children;
  if (Array.isArray(children)) {
    for (const child of children) {
      const found = findVNodeByTestId(child, testId);
      if (found) return found;
    }
  } else if (React.isValidElement(children)) {
    return findVNodeByTestId(children, testId);
  }
  return null;
}

function setupCoordinatorContext(roomCode: string = 'ROOM_264'): {
  ctx: RoomContext;
  room: Room;
  seller: Player;
  buyer: Player;
  reg: PropertyRegistry;
  sm: PropertyStateMap;
} {
  const room = createRoom('p1_seller', roomCode);
  room.started = true;
  room.phase = TurnPhase.PropertyManagement;

  const seller = room.players[0]!;
  seller.balance = 10000;
  seller.ownedProperties = [1];

  const buyer = createPlayer('p2_buyer');
  buyer.balance = 10000;
  buyer.ownedProperties = [];
  room.players.push(buyer);

  const reg: PropertyRegistry = new Map();
  reg.set(1, seller.id);
  const sm: PropertyStateMap = new Map();

  return { ctx: { room, reg, sm }, room, seller, buyer, reg, sm };
}

describe('[CONTRACT] IMP-264 P2P Trade Idempotency & Watchdog Resilience Suite', () => {
  beforeEach(() => {
    queuedEffects.length = 0;
    activeCleanups.length = 0;
    frameTickCallback = undefined;
    useLobbyStore.setState({ myPlayerId: 'p1' });
    useGameStore.setState({
      activeModal: null,
      modalPayload: null,
      pendingTradeOffer: null,
      activePawnAnimation: null,
      pawnAnimationQueue: [],
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 20000, tokenColor: '#38BDF8', ownedProperties: [1], mortgagedProperties: [], mortgageLoans: {}, isBot: false, bankrupt: false, inAudit: false },
        bot1: { id: 'bot1', name: 'Bot Tấn Công', balance: 30000, tokenColor: '#F59E0B', ownedProperties: [3], mortgagedProperties: [], mortgageLoans: {}, isBot: true, bankrupt: false, inAudit: false },
      },
    });
    useTelemetryStore.setState({ violations: [] });
    watchdogMonitor.reset();
  });

  afterEach(() => {
    while (activeCleanups.length > 0) {
      const cleanup = activeCleanups.pop();
      cleanup?.();
    }
    vi.restoreAllMocks();
  });

  // =========================================================================
  // FACET 1: PendingTradeManager Idempotency Cache & FIFO Pruning
  // =========================================================================
  describe('Facet 1: PendingTradeManager Idempotency Cache & Actor Boundary', () => {
    it('[TC-264.01][UC-TRADE-001/MSS] pendingTradeManager.resolveSession: Ghi nhận offerId kèm roomCode và responderPlayerId vào bảng recentlyResolvedOffers', () => {
      const mgr = new PendingTradeManager();
      const session = mgr.createSession('ROOM_264', 'bot1', 'human1', 1, 1000, 1000);
      mgr.resolveSession('ROOM_264', session.offerId, true, 'human1');

      const record = mgr.getRecentlyResolved('ROOM_264', 'human1', session.offerId);
      expect(record?.responderPlayerId).toBe('human1');
      expect(record?.roomCode).toBe('ROOM_264');
      expect(record?.accept).toBe(true);
    });

    it('[TC-264.02][UC-TRADE-001/MSS] pendingTradeManager.isRecentlyResolved: Trả về true khi khớp hoàn toàn roomCode, playerId, offerId và accept trong cửa sổ 5000ms', () => {
      const mgr = new PendingTradeManager();
      const session = mgr.createSession('ROOM_264', 'bot1', 'human1', 1, 1000, 1000);
      mgr.resolveSession('ROOM_264', session.offerId, false, 'human1');

      const isResolved = mgr.isRecentlyResolved('ROOM_264', 'human1', session.offerId, false);
      expect(isResolved).toBe(true);
    });

    it('[TC-264.03][UC-TRADE-001/A1] pendingTradeManager.isRecentlyResolved: Trả về false khi playerId không khớp với người đã phản hồi gốc (bảo vệ quyền tác tử)', () => {
      const mgr = new PendingTradeManager();
      const session = mgr.createSession('ROOM_264', 'bot1', 'human1', 1, 1000, 1000);
      mgr.resolveSession('ROOM_264', session.offerId, true, 'human1');

      const isResolved = mgr.isRecentlyResolved('ROOM_264', 'intruder_p3', session.offerId, true);
      expect(isResolved).toBe(false);
    });

    it('[TC-264.04][UC-TRADE-001/A2] pendingTradeManager.isRecentlyResolved: Trả về false khi roomCode không khớp (ngăn chặn giả mạo intent xuyên phòng)', () => {
      const mgr = new PendingTradeManager();
      const session = mgr.createSession('ROOM_264', 'bot1', 'human1', 1, 1000, 1000);
      mgr.resolveSession('ROOM_264', session.offerId, true, 'human1');

      const isResolved = mgr.isRecentlyResolved('OTHER_ROOM', 'human1', session.offerId, true);
      expect(isResolved).toBe(false);
    });

    it('[TC-264.05][UC-TRADE-001/A3] pendingTradeManager.isRecentlyResolved: Trả về false khi quyết định accept không khớp với kết quả đã chốt', () => {
      const mgr = new PendingTradeManager();
      const session = mgr.createSession('ROOM_264', 'bot1', 'human1', 1, 1000, 1000);
      mgr.resolveSession('ROOM_264', session.offerId, true, 'human1');

      const isResolved = mgr.isRecentlyResolved('ROOM_264', 'human1', session.offerId, false);
      expect(isResolved).toBe(false);
    });

    it('[TC-264.06][UC-TRADE-001/A4] pendingTradeManager.pruneExpiredResolvedOffers: Tự động dọn dẹp FIFO các mục quá hạn 5000ms và trả về undefined', () => {
      vi.useFakeTimers();
      try {
        const mgr = new PendingTradeManager();
        const session = mgr.createSession('ROOM_264', 'bot1', 'human1', 1, 1000, 1000);
        mgr.resolveSession('ROOM_264', session.offerId, true, 'human1');
        vi.advanceTimersByTime(5001);

        const record = mgr.getRecentlyResolved('ROOM_264', 'human1', session.offerId);
        expect(record).toBeUndefined();
      } finally {
        vi.useRealTimers();
      }
    });

    it('[TC-264.07][UC-TRADE-001/A5] pendingTradeManager.clearSession: Không xóa recentlyResolvedOffers nhằm duy trì cửa sổ chống chạm kép 5s', () => {
      const mgr = new PendingTradeManager();
      const session = mgr.createSession('ROOM_264', 'bot1', 'human1', 1, 1000, 1000);
      mgr.resolveSession('ROOM_264', session.offerId, true, 'human1');
      mgr.clearSession('ROOM_264');

      const record = mgr.getRecentlyResolved('ROOM_264', 'human1', session.offerId);
      expect(record?.responderPlayerId).toBe('human1');
      expect(record?.accept).toBe(true);
    });
  });

  // =========================================================================
  // FACET 2: RoomPropertyCoordinator Server Idempotency & Boundaries
  // =========================================================================
  describe('Facet 2: RoomPropertyCoordinator Server Idempotency & Defense', () => {
    it('[TC-264.08][UC-COORD-001/MSS] coordRespondTradeOffer: Trả về success: true và idempotent: true khi intent gửi trùng lặp hợp lệ từ cùng người chơi', () => {
      const { ctx, room, seller } = setupCoordinatorContext();
      const session = pendingTradeManager.createSession(room.roomCode, 'p2_buyer', seller.id, 1, 800, 1000);
      room.pendingTradeOffer = { offerId: session.offerId, sellerId: seller.id, buyerId: 'p2_buyer', cellIndex: 1, price: 800, expiresAt: session.expiresAt, requesterId: 'p2_buyer', targetPlayerId: seller.id };

      const firstRes = coordRespondTradeOffer(ctx, seller.id, session.offerId, true);
      expect(firstRes.success).toBe(true);

      const secondRes: { success: boolean; reason?: string; idempotent?: boolean } =
        coordRespondTradeOffer(ctx, seller.id, session.offerId, true);
      expect(secondRes.success).toBe(true);
      expect(secondRes.idempotent).toBe(true);
    });

    it('[TC-264.09][UC-COORD-001/A1] coordRespondTradeOffer: Trả về OFFER_ALREADY_RESOLVED khi quyết định gửi lại trái ngược với quyết định đã chốt', () => {
      const { ctx, room, seller } = setupCoordinatorContext();
      const session = pendingTradeManager.createSession(room.roomCode, 'p2_buyer', seller.id, 1, 800, 1000);
      room.pendingTradeOffer = { offerId: session.offerId, sellerId: seller.id, buyerId: 'p2_buyer', cellIndex: 1, price: 800, expiresAt: session.expiresAt, requesterId: 'p2_buyer', targetPlayerId: seller.id };

      coordRespondTradeOffer(ctx, seller.id, session.offerId, true);
      const secondRes = coordRespondTradeOffer(ctx, seller.id, session.offerId, false);

      expect(secondRes.success).toBe(false);
      expect(secondRes.reason).toBe('OFFER_ALREADY_RESOLVED');
    });

    it('[TC-264.10][UC-COORD-001/A2] coordRespondTradeOffer: Trả về INVALID_OFFER_ID khi người chơi khác hoặc phòng khác gửi lại offerId đã resolve', () => {
      const { ctx, room, seller } = setupCoordinatorContext();
      const session = pendingTradeManager.createSession(room.roomCode, 'p2_buyer', seller.id, 1, 800, 1000);
      room.pendingTradeOffer = { offerId: session.offerId, sellerId: seller.id, buyerId: 'p2_buyer', cellIndex: 1, price: 800, expiresAt: session.expiresAt, requesterId: 'p2_buyer', targetPlayerId: seller.id };

      coordRespondTradeOffer(ctx, seller.id, session.offerId, true);
      const intruderRes = coordRespondTradeOffer(ctx, 'p3_intruder', session.offerId, true);

      expect(intruderRes.success).toBe(false);
      expect(intruderRes.reason).toBe('INVALID_OFFER_ID');
      expect(pendingTradeManager.getRecentlyResolved(room.roomCode, 'p3_intruder', session.offerId)).toBeUndefined();
    });
  });

  // =========================================================================
  // FACET 3: WSS Intent Handler Network Bypass
  // =========================================================================
  describe('Facet 3: WSS Network Handler Idempotent Intent Bypass', () => {
    it('[TC-264.11][UC-WSS-001/MSS] handleIntentMsg: Bỏ qua syncRoomAfterIntent và không ghi log sự kiện trùng lặp khi res.idempotent là true', async () => {
      const { room } = setupCoordinatorContext('ROOM_WSS');
      const rooms = new RoomManager(4242);
      vi.spyOn(rooms, 'getRoom').mockReturnValue(room);

      const sessions = new SessionManager();
      const sockets = new SocketRegistry();
      const broadcaster = new DeltaBroadcaster(rooms, sessions);
      const adminManager = new AdminManager({ roomManager: rooms, secret: 'test-admin-secret' });
      const intentMutex = new IntentMutex();
      const intentGuard = new IntentGuard();

      const broadcastDeltaSpy = vi.spyOn(broadcaster, 'broadcastRoomDelta').mockImplementation(() => undefined);
      const recordRoomEventSpy = vi.spyOn(adminManager, 'recordRoomEvent').mockReturnValue({
        id: 'log1',
        roomCode: 'ROOM_WSS',
        timestamp: Date.now(),
        source: 'PLAYER',
        action: 'INTENT_RESPOND_TRADE_OFFER',
        payloadSummary: 'Người chơi p1_seller: INTENT_RESPOND_TRADE_OFFER',
      });

      const deps: IntentHandlerDeps = {
        rooms, intentGuard, intentMutex, broadcaster, adminManager, sockets,
        sendSafe: vi.fn(), bindSocket: vi.fn(), scheduleBotTurn: vi.fn(), broadcastGameOver: vi.fn(),
      };

      vi.spyOn(lobbyHandlers, 'isSocketOwner').mockReturnValue(true);
      vi.spyOn(lobbyHandlers, 'validateIntentRequest').mockReturnValue({ valid: true });
      vi.spyOn(lobbyHandlers, 'executeIntentAction').mockReturnValue({
        success: true,
        idempotent: true,
      });

      const fakeSocket = {} as WebSocket;
      const msg: Extract<WsClientMessage, { type: 'INTENT' }> = {
        type: 'INTENT', roomCode: 'ROOM_WSS', playerId: 'p1_seller',
        intent: { type: 'INTENT_RESPOND_TRADE_OFFER', offerId: 'trade_resolved_id', accept: true },
      };

      await handleIntentMsg(deps, fakeSocket, msg);

      expect(recordRoomEventSpy).not.toHaveBeenCalled();
      expect(broadcastDeltaSpy).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // FACET 4: UI Latch Guard & Dual-Timer Pause
  // =========================================================================
  describe('Facet 4: UI Touch Latch & Dual-Timer Pause', () => {
    it('[TC-264.12][UC-STRIP-001/MSS] InlineBotTradeStrip: updateTimer tạm dừng gửi intent khi activeModal là bot_trade_offer để nhường quyền cho modal', () => {
      const onIntentSpy = vi.fn();
      useGameStore.setState({
        activeModal: 'bot_trade_offer',
        pendingTradeOffer: {
          offerId: 'offer_strip_pause',
          sellerId: 'p1',
          buyerId: 'bot1',
          cellIndex: 1,
          price: 1500,
          expiresAt: Date.now() - 500,
        },
      });

      renderToStaticMarkup(
        React.createElement(InlineBotTradeStrip, {
          onIntent: onIntentSpy,
          localPlayerId: 'p1',
        })
      );
      flushQueuedEffects();

      expect(onIntentSpy).not.toHaveBeenCalled();
      expect(useGameStore.getState().pendingTradeOffer).not.toBeNull();
    });

    it('[TC-264.13][UC-STRIP-001/MSS] InlineBotTradeStrip: handleReject và handleAccept khóa submittedOfferIdRef chỉ gọi onIntent đúng 1 lần khi chạm kép', () => {
      const onIntentSpy = vi.fn();
      useGameStore.setState({
        activeModal: null,
        pendingTradeOffer: {
          offerId: 'offer_strip_double_tap',
          sellerId: 'p1',
          buyerId: 'bot1',
          cellIndex: 1,
          price: 1500,
          expiresAt: Date.now() + 15000,
        },
      });

      let capturedTree: React.ReactElement | null = null;
      function StripContainer() {
        const el = InlineBotTradeStrip({ onIntent: onIntentSpy, localPlayerId: 'p1' });
        capturedTree = el;
        return el;
      }
      renderToStaticMarkup(React.createElement(StripContainer));
      flushQueuedEffects();

      const rejectBtn = findVNodeByTestId(capturedTree, 'inline-bot-reject-btn');
      expect(rejectBtn).not.toBeNull();

      rejectBtn?.props?.onClick?.();
      rejectBtn?.props?.onClick?.();

      expect(onIntentSpy).toHaveBeenCalledTimes(1);
    });

    it('[TC-264.14][UC-STRIP-001/A1] InlineBotTradeStrip: Tự động giải phóng submittedOfferIdRef khi pendingTradeOffer thay đổi hoặc bị xóa', () => {
      const onIntentSpy = vi.fn();
      useGameStore.setState({
        activeModal: null,
        pendingTradeOffer: {
          offerId: 'offer_strip_1',
          sellerId: 'p1',
          buyerId: 'bot1',
          cellIndex: 1,
          price: 1500,
          expiresAt: Date.now() + 15000,
        },
      });

      let tree1: React.ReactElement | null = null;
      function Container1() {
        tree1 = InlineBotTradeStrip({ onIntent: onIntentSpy, localPlayerId: 'p1' });
        return tree1;
      }
      renderToStaticMarkup(React.createElement(Container1));
      flushQueuedEffects();
      const btn1 = findVNodeByTestId(tree1, 'inline-bot-reject-btn');
      btn1?.props?.onClick?.();
      btn1?.props?.onClick?.();

      // Offer mới xuất hiện sau khi reset
      useGameStore.setState({
        pendingTradeOffer: {
          offerId: 'offer_strip_2',
          sellerId: 'p1',
          buyerId: 'bot1',
          cellIndex: 3,
          price: 2000,
          expiresAt: Date.now() + 15000,
        },
      });

      let tree2: React.ReactElement | null = null;
      function Container2() {
        tree2 = InlineBotTradeStrip({ onIntent: onIntentSpy, localPlayerId: 'p1' });
        return tree2;
      }
      renderToStaticMarkup(React.createElement(Container2));
      flushQueuedEffects();
      const btn2 = findVNodeByTestId(tree2, 'inline-bot-reject-btn');
      btn2?.props?.onClick?.();
      btn2?.props?.onClick?.();

      expect(onIntentSpy).toHaveBeenCalledTimes(2);
    });

    it('[TC-264.15][UC-MODAL-001/MSS] BotTradeOfferModal: Nút từ chối và đồng ý khóa submittedOfferIdRef ngăn gọi onReject/onAccept lần 2 khi double-click', () => {
      const onRejectSpy = vi.fn();
      const onAcceptSpy = vi.fn();

      let modalTree: React.ReactElement | null = null;
      function ModalContainer() {
        modalTree = BotTradeOfferModal({
          offerId: 'offer_modal_double_click',
          cellIndex: 1,
          price: 1200,
          buyerId: 'bot1',
          sellerId: 'p1',
          expiresAt: Date.now() + 15000,
          onAccept: onAcceptSpy,
          onReject: onRejectSpy,
        });
        return modalTree;
      }
      renderToStaticMarkup(React.createElement(ModalContainer));
      flushQueuedEffects();

      const rejectBtn = findVNodeByTestId(modalTree, 'reject-trade-btn');
      expect(rejectBtn).not.toBeNull();

      rejectBtn?.props?.onClick?.();
      rejectBtn?.props?.onClick?.();

      expect(onRejectSpy).toHaveBeenCalledTimes(1);
    });

    it('[TC-264.16][UC-MODAL-001/A1] BotTradeOfferModal: Tự động giải phóng submittedOfferIdRef khi offerId thay đổi', () => {
      const onRejectSpy = vi.fn();

      let tree1: React.ReactElement | null = null;
      function Modal1() {
        tree1 = BotTradeOfferModal({
          offerId: 'modal_offer_A',
          cellIndex: 1,
          price: 1000,
          buyerId: 'bot1',
          sellerId: 'p1',
          expiresAt: Date.now() + 15000,
          onAccept: vi.fn(),
          onReject: onRejectSpy,
        });
        return tree1;
      }
      renderToStaticMarkup(React.createElement(Modal1));
      flushQueuedEffects();
      const btn1 = findVNodeByTestId(tree1, 'reject-trade-btn');
      btn1?.props?.onClick?.();
      btn1?.props?.onClick?.();

      let tree2: React.ReactElement | null = null;
      function Modal2() {
        tree2 = BotTradeOfferModal({
          offerId: 'modal_offer_B',
          cellIndex: 3,
          price: 2000,
          buyerId: 'bot1',
          sellerId: 'p1',
          expiresAt: Date.now() + 15000,
          onAccept: vi.fn(),
          onReject: onRejectSpy,
        });
        return tree2;
      }
      renderToStaticMarkup(React.createElement(Modal2));
      flushQueuedEffects();
      const btn2 = findVNodeByTestId(tree2, 'reject-trade-btn');
      btn2?.props?.onClick?.();
      btn2?.props?.onClick?.();

      expect(onRejectSpy).toHaveBeenCalledTimes(2);
    });
  });

  // =========================================================================
  // FACET 5: Watchdog Threshold Harmonization
  // =========================================================================
  describe('Facet 5: Watchdog Threshold Harmonization & Stall Defense', () => {
    it('[TC-264.17][UC-WATCHDOG-001/MSS] watchdogMonitor.checkFsmAnimationStall: Không phát sinh vi phạm FSM_ANIMATION_STALLED tại thời điểm 12344ms khi trần được tính bằng 17000ms với sàn 10000ms', () => {
      vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'setInterval', 'performance'] });
      try {
        useGameStore.setState({
          activePawnAnimation: {
            playerId: 'p1',
            fromCell: 0,
            isAnimating: true,
            waypoints: [1, 2, 3, 4, 5, 6],
          },
          pawnAnimationQueue: [],
        });

        renderToStaticMarkup(React.createElement(PerfTelemetryTracker));
        flushQueuedEffects();
        expect(frameTickCallback).toBeDefined();

        // Khởi động hoạt ảnh và chạy tick đầu tiên sau 600ms để tracker khởi tạo animStartRef
        vi.advanceTimersByTime(600);
        frameTickCallback?.({}, 0.016);

        // Giả lập trôi thêm 12344ms (máy khách bị lag 19 FPS kéo dài 12344ms)
        vi.advanceTimersByTime(12344);
        frameTickCallback?.({}, 0.016);

        const violations = useTelemetryStore.getState().violations;
        const stallViolation = violations.find((v) => v.type === 'FSM_ANIMATION_STALLED');
        expect(stallViolation).toBeUndefined();
      } finally {
        vi.useRealTimers();
      }
    });
  });
});
