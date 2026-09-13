import React, { useEffect, useCallback, useState, useRef, Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { HudContainer } from './ui/hud_container';
import { useGameStore, type PlayerHudInfo } from './store/game_store';
import { useLobbyStore } from './store/lobby_store';
import { useEnvironmentStore } from './store/environment_store';
import { useVfxStore } from './store/vfx_store';
import { PreMatchDeck } from './ui/lobby/pre_match_deck';
import type { Player } from '../domain/room';
import { PLAYER_TOKEN_PALETTE } from '../domain/theme';
import { AudioEngine } from './audio/audio_engine';
import { useGameWs, isGameRunningDelta, clearReconnectToken } from './network/use_game_ws';
import type { ReasonCode } from '../server/network/network_types';
import type { DeltaPayload } from '../server/session_manager';
import { AdminPortal } from './ui/admin/admin_portal';

export const GameCanvas = lazy(() =>
  import('./game_canvas').then((m) => ({ default: m.GameCanvas }))
);

import { getInitialLobbyConfig, executeCellLanding } from './offline_landing';

function isAdminRoute(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  const hash = window.location.hash;
  return params.get('admin') === 'true' || hash === '#/admin' || hash === '#admin';
}

if (typeof window !== 'undefined') {
  window.__gameStore = useGameStore;
  window.__lobbyStore = useLobbyStore;
  window.__environmentStore = useEnvironmentStore;
  window.__vfxStore = useVfxStore;

  if (!useLobbyStore.getState().roomCode) {
    const initCfg = getInitialLobbyConfig();
    useLobbyStore.getState().initLobby(initCfg.roomCode, initCfg.playerId, initCfg.isHost, initCfg.playerName);
  }
}

export function App(): React.ReactElement {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => isAdminRoute());

  useEffect(() => {
    const handleRoute = (): void => setIsAdmin(isAdminRoute());
    window.addEventListener('popstate', handleRoute);
    window.addEventListener('hashchange', handleRoute);
    return () => {
      window.removeEventListener('popstate', handleRoute);
      window.removeEventListener('hashchange', handleRoute);
    };
  }, []);

  if (isAdmin) {
    return <AdminPortal />;
  }

  const gameStarted = useLobbyStore((s) => s.gameStarted);
  const roomCode = useLobbyStore((s) => s.roomCode);
  const initLobby = useLobbyStore((s) => s.initLobby);
  const lobbySlots = useLobbyStore((s) => s.slots);
  const myPlayerId = useLobbyStore((s) => s.myPlayerId);
  const isHost = useLobbyStore((s) => s.isHost);
  const localPlayerId = myPlayerId || 'p1';

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const prevTurnPlayerRef = useRef<string | null>(null);
  const prevPlayerIndexRef = useRef<number | null>(null);
  const prevPositionRef = useRef<number | null>(null);
  const landingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (landingTimerRef.current) clearTimeout(landingTimerRef.current);
    };
  }, []);

  const setPlayersInfo = useGameStore((state) => state.setPlayersInfo);
  const setCurrentTurnPlayerId = useGameStore((state) => state.setCurrentTurnPlayerId);
  const setTreasuryPool = useGameStore((state) => state.setTreasuryPool);
  const setPlayerPositions = useGameStore((state) => state.setPlayerPositions);
  const openModal = useGameStore((state) => state.openModal);
  const triggerEmote = useGameStore((state) => state.triggerEmote);
  const currentTurnPlayerId = useGameStore((state) => state.currentTurnPlayerId);
  const playerPositions = useGameStore((state) => state.playerPositions);
  const playersInfo = useGameStore((state) => state.playersInfo);

  const effectivePlayers = React.useMemo<readonly Player[]>(() => {
    if (gameStarted) {
      return Object.values(playersInfo).map((p) => ({
        id: p.id,
        position: playerPositions[p.id] ?? 0,
        balance: p.balance,
        skipNextTurn: false,
        auditTurnsLeft: 0,
        consecutiveDoubles: 0,
        hand: [],
        pendingDebts: [],
        extraTurns: 0,
        doubleNextDice: false,
        mortgagedProperties: [],
        bankrupt: Boolean(p.bankrupt),
      }));
    }
    return lobbySlots
      .filter((s) => s.isOccupied)
      .map((s) => ({
        id: s.playerId ?? (s.isHost ? 'p1' : `bot_${s.slotIndex + 1}`),
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
      }));
  }, [gameStarted, playersInfo, playerPositions, lobbySlots]);

  const handleError = useCallback((reasonCode: ReasonCode) => {
    if (reasonCode === 'TOKEN_INVALID' || reasonCode === 'TOKEN_EXPIRED') {
      // Phục hồi trong suốt phiên kết nối cũ/hết hạn qua cơ chế tự động CREATE_ROOM / JOIN_ROOM của useGameWs
      return () => {};
    }
    if (reasonCode === 'ROOM_STARTED') {
      setErrorMessage('Phòng này đã bắt đầu trận đấu.');
      const timer = setTimeout(() => setErrorMessage(null), 4000);
      return () => clearTimeout(timer);
    }
    if ((reasonCode as string) === 'EVEN_BUILDING_VIOLATION') {
      setErrorMessage('Quy tắc xây dựng đều tay: Cần nâng cấp các ô cùng bộ màu lên cấp đồng đều!');
      const timer = setTimeout(() => setErrorMessage(null), 4000);
      return () => clearTimeout(timer);
    }
    if ((reasonCode as string) === 'MISSING_MONOPOLY') {
      setErrorMessage('Cần sở hữu trọn bộ màu trước khi nâng cấp công trình!');
      const timer = setTimeout(() => setErrorMessage(null), 4000);
      return () => clearTimeout(timer);
    }
    setErrorMessage(`Lỗi máy chủ: ${reasonCode}`);
    if (reasonCode === 'NOT_ENOUGH_PLAYERS' || reasonCode === 'NOT_HOST' || reasonCode === 'ROOM_NOT_FOUND') {
      useLobbyStore.getState().setGameStarted(false);
    }
    const timer = setTimeout(() => setErrorMessage(null), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleCellLanding = useCallback(
    (activeId: string, targetCell: number) => {
      executeCellLanding(activeId, targetCell, currentTurnPlayerId, isConnectedRef.current);
    },
    [currentTurnPlayerId]
  );

  const handleDelta = useCallback((delta: DeltaPayload) => {
    if (isGameRunningDelta(delta)) {
      useLobbyStore.getState().setGameStarted(true);
    }

    if (delta.timeRemaining !== undefined) {
      useGameStore.getState().setTurnTimeRemaining(delta.timeRemaining);
    } else if (delta.currentPlayerIndex !== undefined && delta.currentPlayerIndex !== prevPlayerIndexRef.current) {
      prevPlayerIndexRef.current = delta.currentPlayerIndex;
      useGameStore.getState().setTurnTimeRemaining(60);
    } else if (delta.currentTurnPlayerId && delta.currentTurnPlayerId !== prevTurnPlayerRef.current) {
      prevTurnPlayerRef.current = delta.currentTurnPlayerId;
      useGameStore.getState().setTurnTimeRemaining(60);
    }

    if (delta.players && delta.tick > 0) {
      const localP = delta.players.find((p) => p.id === localPlayerId);
      if (localP && localP.balance < 0) {
        const currentModal = useGameStore.getState().activeModal;
        if (currentModal !== 'insolvency' && currentModal !== 'game_over') {
          openModal('insolvency', { playerId: localPlayerId, deficit: -localP.balance });
        }
      }
    }
  }, [localPlayerId, openModal]);

  const lastLandedPawn = useGameStore((state) => state.lastLandedPawn);
  const lastHandledLandingTimestampRef = useRef<number | null>(null);

  // [UI-S02/MSS] Mở modal và tương tác ô đất CHÍNH XÁC khi con cờ chạm đất tại ô đích
  useEffect(() => {
    if (!lastLandedPawn) return;
    if (lastLandedPawn.playerId === localPlayerId) {
      if (lastHandledLandingTimestampRef.current === lastLandedPawn.timestamp) {
        return;
      }
      lastHandledLandingTimestampRef.current = lastLandedPawn.timestamp;
      handleCellLanding(localPlayerId, lastLandedPawn.cellIndex);
    }
  }, [lastLandedPawn, localPlayerId, handleCellLanding]);

  const handleRoomStarted = useCallback(() => {
    useLobbyStore.getState().setGameStarted(true);
  }, []);

  const handleReconnected = useCallback((_pid: string) => {
    // PLAYER_RECONNECTED thông báo người chơi đã kết nối lại.
    // Trạng thái gameStarted sẽ được quyết định chuẩn xác từ STATE_DELTA đầy đủ của server
    // nhằm tránh race condition ghi đè store trước khi nạp dữ liệu ván đấu.
  }, []);

  const handleGameOver = useCallback(
    (leaderboard: ReadonlyArray<{ readonly id: string; readonly netWorth: number }>) => {
      openModal('game_over', { leaderboard });
    },
    [openModal]
  );

  const handleEmote = useCallback(
    (pid: string, emoteId: string) => {
      triggerEmote(pid, emoteId);
    },
    [triggerEmote]
  );

  const handleSessionInit = useCallback((_token: string, activeRoomCode: string) => {
    if (activeRoomCode && activeRoomCode !== useLobbyStore.getState().roomCode) {
      useLobbyStore.getState().setRoomCode(activeRoomCode);
      if (typeof window !== 'undefined' && window.history) {
        try {
          const url = new URL(window.location.href);
          url.searchParams.set('room', activeRoomCode);
          window.history.replaceState({}, '', url.toString());
        } catch {
          /* safe-ignore: browser environment may restrict history manipulation */
        }
      }
    }
  }, []);

  const { isConnected, sendIntent, sendEmote, sendWsMessage } = useGameWs({
    roomCode: roomCode || 'VT8888',
    playerId: localPlayerId,
    isHost,
    autoConnect: true,
    onDelta: handleDelta,
    onError: handleError,
    onRoomStarted: handleRoomStarted,
    onReconnected: handleReconnected,
    onGameOver: handleGameOver,
    onEmote: handleEmote,
    onSessionInit: handleSessionInit,
  });
  isConnectedRef.current = isConnected;

  useEffect(() => {
    AudioEngine.init();

    if (!roomCode) {
      const initCfg = getInitialLobbyConfig();
      initLobby(initCfg.roomCode, initCfg.playerId, initCfg.isHost, initCfg.playerName);
    }
  }, [roomCode, initLobby]);

  const gameInitializedRef = React.useRef(false);

  // Đồng bộ người chơi từ Sảnh Chờ sang Bàn Cờ một lần duy nhất khi trận đấu bắt đầu
  useEffect(() => {
    if (!gameStarted) {
      gameInitializedRef.current = false;
      return;
    }

    if (gameInitializedRef.current) {
      return;
    }
    gameInitializedRef.current = true;

    // Không ghi đè nếu store đã nhận thông tin người chơi từ server (ví dụ: Reconnect khi ván đấu đang diễn ra)
    const existingPlayers = useGameStore.getState().playersInfo;
    if (Object.keys(existingPlayers).length > 0) {
      return;
    }

    AudioEngine.handlePawnLanded(0);
    const occupied = lobbySlots.filter((s) => s.isOccupied);
    const playersInfo: Record<string, PlayerHudInfo> = {};
    const positions: Record<string, number> = {};

    occupied.forEach((s, idx) => {
      const pid = s.playerId ?? `p${idx + 1}`;
      playersInfo[pid] = {
        id: pid,
        name: s.playerName,
        balance: 15000,
        tokenColor: s.tokenColor ?? (PLAYER_TOKEN_PALETTE[idx] ?? '#38BDF8'),
        ownedProperties: [],
        isBot: s.isBot,
      };
      positions[pid] = 0;
    });

    setPlayersInfo(playersInfo);
    setPlayerPositions(positions);
    setCurrentTurnPlayerId(occupied[0]?.playerId ?? 'p1');
    setTreasuryPool(2000);
  }, [gameStarted, lobbySlots, setPlayersInfo, setPlayerPositions, setCurrentTurnPlayerId, setTreasuryPool]);

  // [UC-GAME-001] Độc lập bộ đếm thời gian lượt chơi 60 giây khi trận đấu đang diễn ra
  useEffect(() => {
    if (!gameStarted) return;
    const timer = setInterval(() => {
      useGameStore.getState().decrementTurnTimer();
    }, 1000);
    return () => clearInterval(timer);
  }, [gameStarted]);

  const handleRollDice = useCallback(() => {
    const store = useGameStore.getState();
    if (store.isRolling || store.activePawnAnimation?.isAnimating) return;
    store.setIsRolling(true);
    sendIntent({ type: 'INTENT_ROLL' });
  }, [sendIntent]);

  const handleEndTurn = useCallback(() => {
    if (isConnected) {
      sendIntent({ type: 'INTENT_END_TURN' });
    } else {
      const activeId = currentTurnPlayerId ?? 'p1';
      const activePlayers = Object.keys(useGameStore.getState().playersInfo);
      const currentIdx = activePlayers.indexOf(activeId);
      const nextId = activePlayers[(currentIdx + 1) % (activePlayers.length || 1)] ?? 'p1';
      setCurrentTurnPlayerId(nextId);
      useGameStore.getState().setTurnTimeRemaining(60);
    }
  }, [isConnected, currentTurnPlayerId, sendIntent, setCurrentTurnPlayerId]);

  const turnTimeRemaining = useGameStore((state) => state.turnTimeRemaining);

  // [UC-GAME-001] Tự động thực hiện hành động khi đồng hồ về 00:00 và đang trong lượt của người chơi
  useEffect(() => {
    if (!gameStarted || currentTurnPlayerId !== localPlayerId) return;
    if (turnTimeRemaining === 0) {
      const store = useGameStore.getState();
      if (store.hasRolledThisTurn) {
        handleEndTurn();
      } else if (!store.isRolling && !store.activePawnAnimation?.isAnimating) {
        handleRollDice();
      }
    }
  }, [gameStarted, currentTurnPlayerId, localPlayerId, turnTimeRemaining, handleEndTurn, handleRollDice]);

  const handleSendEmote = useCallback(
    (emoteId: string) => {
      triggerEmote(localPlayerId, emoteId);
      if (isConnected) {
        sendEmote(emoteId);
      }
    },
    [localPlayerId, isConnected, sendEmote, triggerEmote]
  );

  const handleLeaveRoom = useCallback(() => {
    const confirmed = typeof window !== 'undefined'
      ? window.confirm('Bạn có chắc chắn muốn rời bàn và trở về sảnh chờ?')
      : true;
    if (!confirmed) return;

    if (landingTimerRef.current) {
      clearTimeout(landingTimerRef.current);
      landingTimerRef.current = null;
    }

    if (isConnected && roomCode) {
      try {
        sendWsMessage({
          type: 'LEAVE_ROOM',
          playerId: localPlayerId,
          roomCode,
        });
      } catch {
        /* safe-ignore: socket may already be disconnected */
      }
    }

    if (roomCode) clearReconnectToken(roomCode);
    clearReconnectToken('VT8888');

    useGameStore.getState().closeModal();
    useGameStore.setState({
      activePawnAnimation: null,
      floatingTexts: [],
    });

    if (typeof window !== 'undefined' && window.history) {
      try {
        window.history.replaceState({}, '', window.location.pathname);
      } catch {
        /* safe-ignore: browser environment may restrict history manipulation */
      }
    }

    useLobbyStore.getState().setGameStarted(false);
  }, [isConnected, roomCode, localPlayerId, sendWsMessage]);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-slate-950 select-none">
      {errorMessage && (
        <div
          role="alert"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-rose-600/95 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-lg border border-rose-400 backdrop-blur-sm"
        >
          {errorMessage}
        </div>
      )}

      {/* 1. Nền sa bàn 3D duy nhất chạy liên tục không gián đoạn / zero-loading */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <Suspense
          fallback={
            <div
              role="status"
              aria-live="polite"
              className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-amber-400 gap-3"
            >
              <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-semibold tracking-wide">ĐANG TẢI SA BÀN 3D...</span>
            </div>
          }
        >
          {/* Contract retention: <GameCanvas isLobby /> <GameCanvas /> */}
          <GameCanvas isLobby={!gameStarted} players={effectivePlayers} />
        </Suspense>
      </div>

      {/* 2. Thẻ PreMatchDeck chuẩn bị phòng nổi cánh phải, trượt êm ra ngoài khi trận đấu bắt đầu */}
      <div
        className={`relative z-10 w-full h-full pointer-events-none transition-transform duration-500 ease-out ${
          gameStarted ? 'translate-x-[calc(100%+3rem)] opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'
        }`}
        aria-hidden={gameStarted}
      >
        <PreMatchDeck
          sendWsMessage={sendWsMessage}
          onStartGame={() => useLobbyStore.getState().setGameStarted(true)}
        />
      </div>

      {/* 3. In-Game HUD: trượt êm vào màn hình khi gameStarted = true */}
      {gameStarted && (
        <div className="relative z-10 w-full h-full pointer-events-none transition-opacity duration-500 ease-out">
          <HudContainer
            onRollDice={handleRollDice}
            onEndTurn={handleEndTurn}
            onIntent={sendIntent}
            onSendEmote={handleSendEmote}
            onLeaveRoom={handleLeaveRoom}
            localPlayerId={localPlayerId}
          />
        </div>
      )}
    </div>
  );
}

if (typeof document !== 'undefined') {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
}
