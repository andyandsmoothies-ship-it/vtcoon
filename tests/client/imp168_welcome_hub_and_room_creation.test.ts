// [TC-IMP168/MSS][UC-IMP168] Station 1 RED Contract Test Suite:
// Welcome Hub & Controlled Intentional Room Creation
// Traceability: docs/plans/improvements/IMP-168-welcome-hub-and-controlled-room-creation_plan.md
// Enforces Universal 4-Facet Behavioral Matrix & Atomic Test Mandate (1-4 asserts/test, zero loops in it())

import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as offlineLanding from '../../src/client/offline_landing.js';
import { useLobbyStore } from '../../src/client/store/lobby_store.js';
import { PreMatchDeck, type PreMatchDeckProps } from '../../src/client/ui/lobby/pre_match_deck.js';
import {
  useGameWs,
  handleWsMessage,
  type WsMessageHandlerContext,
} from '../../src/client/network/use_game_ws.js';
import { AudioEngine } from '../../src/client/audio/audio_engine.js';
import { handleSessionServerError } from '../../src/client/network/use_app_session.js';

// Declaration merging for future implementation types
declare module '../../src/client/ui/lobby/pre_match_deck.js' {
  interface PreMatchDeckProps {
    readonly onLeaveRoom?: () => void;
  }
}

const { getInitialLobbyConfig } = offlineLanding;
const createNewRoomConfig = (offlineLanding as Record<string, any>).createNewRoomConfig as
  | ((isHost?: boolean) => { roomCode: string; playerId: string; isHost: boolean; playerName: string })
  | undefined;

// Dynamic import for WelcomeHubModal to ensure clean Business RED if file is not yet created
let WelcomeHubModal: React.ComponentType<any> | null = null;

beforeAll(async () => {
  try {
    // @ts-ignore - TS2307: Module will be created in Station 2 (Implementation)
    const mod = await import('../../src/client/ui/lobby/welcome_hub_modal.js');
    WelcomeHubModal = mod.WelcomeHubModal ?? null;
  } catch {
    WelcomeHubModal = null;
  }
});

function mockWindow(overrides?: {
  search?: string;
  href?: string;
  replaceState?: (...args: unknown[]) => void;
  sessionStorageGetItem?: (key: string) => string | null;
  sessionStorageSetItem?: (key: string, val: string) => void;
  sessionStorageRemoveItem?: (key: string) => void;
}): void {
  const replaceState = overrides?.replaceState ?? vi.fn();
  const getItem = overrides?.sessionStorageGetItem ?? (() => null);
  const setItem = overrides?.sessionStorageSetItem ?? vi.fn();
  const removeItem = overrides?.sessionStorageRemoveItem ?? vi.fn();
  const g = globalThis as Record<string, unknown>;
  g['_originalWindow'] = g['window'];
  g['window'] = {
    location: {
      search: overrides?.search ?? '',
      href: overrides?.href ?? 'http://localhost/',
      protocol: 'http:',
      host: 'localhost:3000',
      hostname: 'localhost',
      pathname: '/',
    },
    history: { replaceState },
    sessionStorage: { getItem, setItem, removeItem },
  };
}

function restoreWindow(): void {
  const g = globalThis as Record<string, unknown>;
  if (g['_originalWindow'] !== undefined) {
    g['window'] = g['_originalWindow'];
    delete g['_originalWindow'];
  }
}

function findElementByTestId(node: any, testId: string): any {
  if (!node || typeof node !== 'object') return null;
  if (node.props?.['data-testid'] === testId) return node;
  const children = node.props?.children;
  if (Array.isArray(children)) {
    for (const child of children) {
      const found = findElementByTestId(child, testId);
      if (found) return found;
    }
  } else if (children && typeof children === 'object') {
    return findElementByTestId(children, testId);
  }
  return null;
}

describe('[IMP-168: Trạm 1 RED] Welcome Hub & Controlled Room Creation Contract Suite', () => {
  afterEach(() => {
    restoreWindow();
    useLobbyStore.getState().resetLobby();
    vi.restoreAllMocks();
  });

  // =========================================================================
  // FACET 1: Boundary & Range
  // =========================================================================
  describe('Facet 1: Boundary & Range', () => {
    it('[TC-IMP168.01/MSS][UC-IMP168][Facet-1/Boundary] getInitialLobbyConfig() khi URL không có query param (?room=) trả về { roomCode: null, playerId: "", isHost: false, playerName: "" } và KHÔNG gọi replaceState', () => {
      const replaceSpy = vi.fn();
      mockWindow({ search: '', replaceState: replaceSpy });

      const config = getInitialLobbyConfig();
      expect(config.roomCode).toBeNull();
      expect(config.playerId).toBe('');
      expect(config.isHost).toBe(false);
      expect(replaceSpy).not.toHaveBeenCalled();
    });

    it('[TC-IMP168.02/MSS][UC-IMP168][Facet-1/Boundary] getInitialLobbyConfig() khi URL có ?room=VT8899 trả về { roomCode: "VT8899", playerId: "p2", isHost: false }', () => {
      mockWindow({ search: '?room=VT8899' });

      const config = getInitialLobbyConfig('?room=VT8899');
      expect(config.roomCode).toBe('VT8899');
      expect(config.playerId).toBe('p2');
      expect(config.isHost).toBe(false);
    });

    it('[TC-IMP168.03/MSS][UC-IMP168][Facet-1/Boundary] createNewRoomConfig(true) sinh mã 6 ký tự khớp /^[A-Z0-9]{6}$/, playerId: "p1", isHost: true', () => {
      expect(createNewRoomConfig, 'createNewRoomConfig must be exported from offline_landing').toBeDefined();
      const config = createNewRoomConfig!(true);
      expect(config.roomCode).toMatch(/^[A-Z0-9]{6}$/);
      expect(config.playerId).toBe('p1');
      expect(config.isHost).toBe(true);
    });

    it('[TC-IMP168.04/MSS][UC-IMP168][Facet-1/Boundary] createNewRoomConfig(false) sinh mã 6 ký tự khớp /^[A-Z0-9]{6}$/, playerId: "p2", isHost: false', () => {
      expect(createNewRoomConfig, 'createNewRoomConfig must be exported from offline_landing').toBeDefined();
      const config = createNewRoomConfig!(false);
      expect(config.roomCode).toMatch(/^[A-Z0-9]{6}$/);
      expect(config.playerId).toBe('p2');
      expect(config.isHost).toBe(false);
    });

    it('[TC-IMP168.05/MSS][UC-IMP168][Facet-1/Boundary] WelcomeHubModal input validation: từ chối chuỗi có độ dài < 6 hoặc chứa ký tự đặc biệt, nút [Vào Bàn] bị disabled cho đến khi nhập đúng 6 ký tự hợp lệ', () => {
      expect(WelcomeHubModal, 'WelcomeHubModal component must be implemented and exported').toBeDefined();
      expect(WelcomeHubModal).not.toBeNull();

      const html = renderToStaticMarkup(React.createElement(WelcomeHubModal!));
      expect(html).toContain('data-testid="join-room-input"');
      expect(html).toContain('data-testid="join-room-btn"');
      expect(html).toMatch(/<button[^>]*data-testid="join-room-btn"[^>]*disabled/);
    });
  });

  // =========================================================================
  // FACET 2: State Reactivity & Multi-Turn Teardown
  // =========================================================================
  describe('Facet 2: State Reactivity & Multi-Turn Teardown', () => {
    it('[TC-IMP168.06/MSS][UC-IMP168][Facet-2/Reactivity] useGameWs khi roomCode là null hoặc empty string: hàm connect() KHÔNG mở socket (Network Silence Invariant)', () => {
      const socketFactorySpy = vi.fn();
      let capturedWs: ReturnType<typeof useGameWs> | null = null;

      function TestHook() {
        capturedWs = useGameWs({
          roomCode: '',
          playerId: '',
          autoConnect: false,
          webSocketFactory: socketFactorySpy,
        });
        return null;
      }

      renderToStaticMarkup(React.createElement(TestHook));
      expect(capturedWs).not.toBeNull();
      if (capturedWs) {
        (capturedWs as { connect: () => void }).connect();
      }
      expect(socketFactorySpy).not.toHaveBeenCalled();
    });

    it('[TC-IMP168.07/MSS][UC-IMP168][Facet-2/Reactivity] useLobbyStore.getState().createCustomRoom(false): tạo phòng mới, cập nhật roomCode, myPlayerId="p1", isHost=true, slot 0 occupied, slots 1-3 empty', () => {
      const store = useLobbyStore.getState() as any;
      expect(store.createCustomRoom, 'createCustomRoom action must exist on useLobbyStore').toBeDefined();

      const result = store.createCustomRoom(false);
      expect(result.roomCode).toMatch(/^[A-Z0-9]{6}$/);

      const state = useLobbyStore.getState();
      expect(state.isHost).toBe(true);
      expect(Boolean(state.slots[0]?.isOccupied && !state.slots[1]?.isOccupied)).toBe(true);
    });

    it('[TC-IMP168.08/MSS][UC-IMP168][Facet-2/Reactivity] useLobbyStore.getState().createCustomRoom(true) (Solo Bot): tạo phòng mới, tự động lấp đầy 3 slot 1, 2, 3 với Bot AI (isBot=true, isReady=true)', () => {
      const store = useLobbyStore.getState() as any;
      expect(store.createCustomRoom, 'createCustomRoom action must exist on useLobbyStore').toBeDefined();

      store.createCustomRoom(true);
      const state = useLobbyStore.getState();
      expect(Boolean(state.slots[1]?.isBot && state.slots[1]?.isReady)).toBe(true);
      expect(Boolean(state.slots[2]?.isBot && state.slots[2]?.isReady)).toBe(true);
      expect(Boolean(state.slots[3]?.isBot && state.slots[3]?.isReady)).toBe(true);
    });

    it('[TC-IMP168.09/MSS][UC-IMP168][Facet-2/Reactivity] useLobbyStore.getState().joinCustomRoom("VT1234"): cập nhật roomCode="VT1234", myPlayerId="p2", isHost=false', () => {
      const store = useLobbyStore.getState() as any;
      expect(store.joinCustomRoom, 'joinCustomRoom action must exist on useLobbyStore').toBeDefined();

      const result = store.joinCustomRoom('VT1234');
      expect(result.success).toBe(true);

      const state = useLobbyStore.getState();
      expect(state.roomCode).toBe('VT1234');
      expect(state.myPlayerId).toBe('p2');
      expect(state.isHost).toBe(false);
    });

    it('[TC-IMP168.10/MSS][UC-IMP168][Facet-2/Reactivity] useLobbyStore.getState().joinCustomRoom("INVALID"): thất bại với reasonCode="INVALID_ROOM_CODE"', () => {
      const store = useLobbyStore.getState() as any;
      expect(store.joinCustomRoom, 'joinCustomRoom action must exist on useLobbyStore').toBeDefined();

      const result = store.joinCustomRoom('INVALID');
      expect(result.success).toBe(false);
      expect(result.reasonCode).toBe('INVALID_ROOM_CODE');
      expect(useLobbyStore.getState().roomCode).toBeNull();
    });

    it('[TC-IMP168.11/MSS][UC-IMP168][Facet-2/Reactivity] WelcomeHubModal: click [Tạo Phòng Mới] gọi createCustomRoom(false)', () => {
      expect(WelcomeHubModal, 'WelcomeHubModal component must be defined').toBeDefined();
      expect(WelcomeHubModal).not.toBeNull();

      const createRoomSpy = vi.fn();
      useLobbyStore.setState({ createCustomRoom: createRoomSpy } as any);

      let capturedTree: any;
      function TestWrapper() {
        capturedTree = React.createElement(WelcomeHubModal!);
        return capturedTree;
      }
      const html = renderToStaticMarkup(React.createElement(TestWrapper));
      expect(html).toContain('data-testid="create-room-btn"');

      const btn = findElementByTestId(capturedTree, 'create-room-btn');
      btn?.props?.onClick?.();
      expect(createRoomSpy).toHaveBeenCalledWith(false);
    });

    it('[TC-IMP168.12/MSS][UC-IMP168][Facet-2/Reactivity] WelcomeHubModal: click [Chơi Với Bot] gọi createCustomRoom(true)', () => {
      expect(WelcomeHubModal, 'WelcomeHubModal component must be defined').toBeDefined();
      expect(WelcomeHubModal).not.toBeNull();

      const createRoomSpy = vi.fn();
      useLobbyStore.setState({ createCustomRoom: createRoomSpy } as any);

      let capturedTree: any;
      function TestWrapper() {
        capturedTree = React.createElement(WelcomeHubModal!);
        return capturedTree;
      }
      const html = renderToStaticMarkup(React.createElement(TestWrapper));
      expect(html).toContain('data-testid="play-with-bots-btn"');

      const btn = findElementByTestId(capturedTree, 'play-with-bots-btn');
      btn?.props?.onClick?.();
      expect(createRoomSpy).toHaveBeenCalledWith(true);
    });

    it('[TC-IMP168.13/MSS][UC-IMP168][Facet-2/Reactivity] WelcomeHubModal: nhập "VT6789" và click [Vào Bàn] gọi joinCustomRoom("VT6789")', () => {
      expect(WelcomeHubModal, 'WelcomeHubModal component must be defined').toBeDefined();
      expect(WelcomeHubModal).not.toBeNull();

      const joinRoomSpy = vi.fn();
      useLobbyStore.setState({ joinCustomRoom: joinRoomSpy } as any);

      let capturedTree: any;
      function TestWrapper() {
        capturedTree = React.createElement(WelcomeHubModal!);
        return capturedTree;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));

      const input = findElementByTestId(capturedTree, 'join-room-input');
      input?.props?.onChange?.({ target: { value: 'VT6789' } });

      const btn = findElementByTestId(capturedTree, 'join-room-btn');
      btn?.props?.onClick?.();
      expect(joinRoomSpy).toHaveBeenCalledWith('VT6789');
    });
  });

  // =========================================================================
  // FACET 3: Resource Disposal & Timer Isolation
  // =========================================================================
  describe('Facet 3: Resource Disposal & Timer Isolation', () => {
    it('[TC-IMP168.14/MSS][UC-IMP168][Facet-3/Disposal] PreMatchDeck hiển thị nút data-testid="back-to-hub-btn" ("🏠 Về Menu") và gọi prop onLeaveRoom khi click', () => {
      const onLeaveSpy = vi.fn();
      let capturedDeck: any;

      function TestDeck() {
        capturedDeck = React.createElement(PreMatchDeck, {
          roomCode: 'VT1234',
          isHost: true,
          onLeaveRoom: onLeaveSpy,
        });
        return capturedDeck;
      }

      const html = renderToStaticMarkup(React.createElement(TestDeck));
      expect(html).toContain('data-testid="back-to-hub-btn"');
      expect(html).toContain('🏠');

      const btn = findElementByTestId(capturedDeck, 'back-to-hub-btn');
      btn?.props?.onClick?.();
      expect(onLeaveSpy).toHaveBeenCalledTimes(1);
    });

    it('[TC-IMP168.15/MSS][UC-IMP168][Facet-3/Disposal] PreMatchDeck tuân thủ IMP-74 purge contract (KHÔNG chứa data-testid="leave-lobby-btn", KHÔNG chứa "Rời Phòng", "Rời Sảnh")', () => {
      const html = renderToStaticMarkup(
        React.createElement(PreMatchDeck, {
          roomCode: 'VT1234',
          isHost: true,
        })
      );
      expect(html).not.toContain('data-testid="leave-lobby-btn"');
      expect(html).not.toContain('Rời Phòng');
      expect(html).not.toContain('Rời Sảnh');
      expect(html).not.toContain('aria-label="Rời sảnh chờ"');
    });

    it('[TC-IMP168.16/MSS][UC-IMP168][Facet-3/Disposal] useLobbyStore.getState().resetLobby() đưa roomCode về null, myPlayerId="", isHost=false, slots về default', () => {
      useLobbyStore.setState({
        roomCode: 'VT7777',
        myPlayerId: 'p1',
        isHost: true,
        isReady: true,
        gameStarted: true,
      });

      useLobbyStore.getState().resetLobby();
      const s = useLobbyStore.getState();
      expect(s.roomCode).toBeNull();
      expect(s.myPlayerId).toBe('');
      expect(s.isHost).toBe(false);
      expect(Boolean(s.slots[0]?.isOccupied)).toBe(false);
    });

    it('[TC-IMP168.20/MSS][UC-IMP168][Facet-3/Disposal] PreMatchDeck nút back-to-hub-btn ẩn nhãn text trên màn hình nhỏ (hidden sm:inline) tránh tràn viền 360px', () => {
      const html = renderToStaticMarkup(
        React.createElement(PreMatchDeck, {
          roomCode: 'VT1234',
          isHost: true,
          onLeaveRoom: () => {},
        })
      );
      expect(html).toContain('data-testid="back-to-hub-btn"');
      expect(html).toContain('hidden sm:inline');
    });
  });

  // =========================================================================
  // FACET 4: Error Defense & Terminal Invariants
  // =========================================================================
  describe('Facet 4: Error Defense & Terminal Invariants', () => {
    it('[TC-IMP168.17/MSS][UC-IMP168][Facet-4/Error Defense] handleWsError khi nhận reasonCode="ROOM_NOT_FOUND" KHÔNG tự động gửi lại JOIN_ROOM (chống vòng lặp vô tận, gọi onError)', () => {
      const sentMessages: string[] = [];
      const mockSocket = {
        send: (data: string) => {
          sentMessages.push(data);
        },
        close: vi.fn(),
      };
      let capturedError: string | null = null;
      const ctx: WsMessageHandlerContext = {
        roomCode: 'VT9999',
        playerId: 'p2',
        isHost: false,
        socket: mockSocket as any,
        onError: (code) => {
          capturedError = code;
        },
        setErrorReason: vi.fn(),
      };

      handleWsMessage(
        {
          type: 'ERROR',
          reasonCode: 'ROOM_NOT_FOUND',
        },
        ctx
      );

      expect(sentMessages).toHaveLength(0);
      expect(capturedError).toBe('ROOM_NOT_FOUND');
    });

    it('[TC-IMP168.18/MSS][UC-IMP168][Facet-4/Error Defense] WelcomeHubModal layout tuân thủ ngân sách 360px: max-w-[420px], max-h-[90dvh], 100% touch targets >= 44px', () => {
      expect(WelcomeHubModal, 'WelcomeHubModal component must be defined').toBeDefined();
      expect(WelcomeHubModal).not.toBeNull();

      const html = renderToStaticMarkup(React.createElement(WelcomeHubModal!));
      expect(html).toContain('max-h-[90dvh]');
      expect(html).toMatch(/max-w-\[(380px|400px|420px)\]/);
      expect(html).toContain('overflow-y-auto');

      const buttons = html.match(/<button[^>]*>/g) ?? [];
      const invalidButtons = buttons.filter((b) => !b.includes('min-h-[44px]') && !b.includes('min-h-[48px]'));
      expect(invalidButtons).toHaveLength(0);
    });

    it('[TC-IMP168.19/MSS][UC-IMP168][Facet-4/Error Defense] handleWsError khi nhận TOKEN_EXPIRED vẫn kích hoạt fallback reconnect dọn token cũ', () => {
      const sentMessages: string[] = [];
      const mockSocket = {
        send: (data: string) => {
          sentMessages.push(data);
        },
      };
      const ctx: WsMessageHandlerContext = {
        roomCode: 'VT1111',
        playerId: 'p2',
        isHost: false,
        socket: mockSocket as any,
      };

      handleWsMessage(
        {
          type: 'ERROR',
          reasonCode: 'TOKEN_EXPIRED',
        },
        ctx
      );

      expect(sentMessages).toHaveLength(1);
      const parsed = JSON.parse(sentMessages[0]!);
      expect(parsed.type).toBe('JOIN_ROOM');
    });

    it('[TC-IMP168.20/MSS][UC-IMP168][Facet-1/Boundary] WelcomeHubModal: nhập "VT6789" và ấn phím Enter trên input sẽ tự động gọi joinCustomRoom("VT6789")', () => {
      expect(WelcomeHubModal).toBeDefined();
      const joinRoomSpy = vi.fn();
      useLobbyStore.setState({ joinCustomRoom: joinRoomSpy } as any);

      let capturedTree: any;
      function TestWrapper() {
        capturedTree = React.createElement(WelcomeHubModal!);
        return capturedTree;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));

      const input = findElementByTestId(capturedTree, 'join-room-input');
      expect(input, 'join-room-input element must exist').not.toBeNull();
      input?.props?.onChange?.({ target: { value: 'VT6789' } });
      input?.props?.onKeyDown?.({ key: 'Enter' });
      expect(joinRoomSpy).toHaveBeenCalledWith('VT6789');
    });

    it('[TC-IMP168.21/MSS][UC-IMP168][Facet-1/Boundary] WelcomeHubModal: ấn phím Enter khi mã chưa đủ 6 ký tự ("VT1") thì KHÔNG gọi joinCustomRoom', () => {
      const joinRoomSpy = vi.fn();
      useLobbyStore.setState({ joinCustomRoom: joinRoomSpy } as any);

      let capturedTree: any;
      function TestWrapper() {
        capturedTree = React.createElement(WelcomeHubModal!);
        return capturedTree;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));

      const input = findElementByTestId(capturedTree, 'join-room-input');
      expect(input, 'join-room-input element must exist').not.toBeNull();
      input?.props?.onChange?.({ target: { value: 'VT1' } });
      input?.props?.onKeyDown?.({ key: 'Enter' });
      expect(joinRoomSpy).not.toHaveBeenCalled();
    });

    it('[TC-IMP168.22/MSS][UC-IMP168][Facet-2/Reactivity] WelcomeHubModal: kích hoạt các hành động tạo/vào phòng đều gọi AudioEngine.resumeAudioContext() để mở khóa âm thanh trên mobile', () => {
      const resumeSpy = vi.spyOn(AudioEngine, 'resumeAudioContext').mockImplementation(() => {});
      let capturedTree: any;
      function TestWrapper() {
        capturedTree = React.createElement(WelcomeHubModal!);
        return capturedTree;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));

      // Click Tạo Phòng
      const createBtn = findElementByTestId(capturedTree, 'create-room-btn');
      createBtn?.props?.onClick?.();
      expect(resumeSpy).toHaveBeenCalledTimes(1);

      // Click Chơi Với Bot
      const botsBtn = findElementByTestId(capturedTree, 'play-with-bots-btn');
      botsBtn?.props?.onClick?.();
      expect(resumeSpy).toHaveBeenCalledTimes(2);

      // Vào Bàn
      const input = findElementByTestId(capturedTree, 'join-room-input');
      input?.props?.onChange?.({ target: { value: 'VT8888' } });
      const joinBtn = findElementByTestId(capturedTree, 'join-room-btn');
      joinBtn?.props?.onClick?.();
      expect(resumeSpy).toHaveBeenCalledTimes(3);

      resumeSpy.mockRestore();
    });

    it('[TC-IMP168.23/MSS][UC-IMP168][Facet-4/Error Defense] handleSessionServerError: khi gặp ROOM_NOT_FOUND hoặc ROOM_FULL sẽ gọi resetLobby() và dọn URL query param về pathname', () => {
      const replaceStateSpy = vi.fn();
      mockWindow({
        search: '?room=VT9999',
        href: 'http://localhost/?room=VT9999',
        replaceState: replaceStateSpy,
      });

      useLobbyStore.getState().initLobby('VT9999', 'p2', false);
      expect(useLobbyStore.getState().roomCode).toBe('VT9999');

      const setErrorMessageSpy = vi.fn();
      handleSessionServerError('ROOM_NOT_FOUND', setErrorMessageSpy);

      expect(useLobbyStore.getState().roomCode).toBeNull();
      expect(replaceStateSpy).toHaveBeenCalledWith({}, '', '/');
      expect(setErrorMessageSpy).toHaveBeenCalled();
    });

    it('[TC-IMP168.24/MSS][UC-IMP168][Facet-4/Error Defense] handleSessionServerError: khi gặp ROOM_FULL cũng resetLobby() và dọn URL query param', () => {
      const replaceStateSpy = vi.fn();
      mockWindow({
        search: '?room=VT4444',
        href: 'http://localhost/?room=VT4444',
        replaceState: replaceStateSpy,
      });

      useLobbyStore.getState().initLobby('VT4444', 'p3', false);
      expect(useLobbyStore.getState().roomCode).toBe('VT4444');

      const setErrorMessageSpy = vi.fn();
      handleSessionServerError('ROOM_FULL', setErrorMessageSpy);

      expect(useLobbyStore.getState().roomCode).toBeNull();
      expect(replaceStateSpy).toHaveBeenCalledWith({}, '', '/');
      expect(setErrorMessageSpy).toHaveBeenCalled();
    });
  });
});

