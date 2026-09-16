import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './3d/r3f_fiber_shield';
import { HudContainer } from './ui/hud_container';
import { useGameStore } from './store/game_store';
import { useLobbyStore } from './store/lobby_store';
import { useEnvironmentStore } from './store/environment_store';
import { useVfxStore } from './store/vfx_store';
import { PreMatchDeck } from './ui/lobby/pre_match_deck';
import { getInitialBalanceForPlayerCount, type Player } from '../domain/room';
import { AdminPortal } from './ui/admin/admin_portal';
import { Suspense, lazy } from 'react';
import { useEffect } from 'react';
import { useAppSession } from './network/use_app_session';
import { useAppTurnControls } from './network/use_app_turn_controls';

export const GameCanvas = lazy(() =>
  import('./game_canvas').then((m) => ({ default: m.GameCanvas }))
);

import { getInitialLobbyConfig } from './offline_landing';
import { AppErrorBoundary } from './ui/error_boundary';
export { AppErrorBoundary };

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const setPlayersInfo = useGameStore((state) => state.setPlayersInfo);
  const setCurrentTurnPlayerId = useGameStore((state) => state.setCurrentTurnPlayerId);
  const setTreasuryPool = useGameStore((state) => state.setTreasuryPool);
  const setPlayerPositions = useGameStore((state) => state.setPlayerPositions);
  const openModal = useGameStore((state) => state.openModal);
  const triggerEmote = useGameStore((state) => state.triggerEmote);
  const currentTurnPlayerId = useGameStore((state) => state.currentTurnPlayerId);
  const playerPositions = useGameStore((state) => state.playerPositions);
  const playersInfo = useGameStore((state) => state.playersInfo);

  const effectivePlayers = useMemo<readonly Player[]>(() => {
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
    const occupiedSlots = lobbySlots.filter((s) => s.isOccupied);
    const initialBalance = getInitialBalanceForPlayerCount(occupiedSlots.length || 2);
    return occupiedSlots
      .map((s) => ({
        id: s.playerId ?? (s.isHost ? 'p1' : `bot_${s.slotIndex + 1}`),
        position: 0,
        balance: initialBalance,
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

  // [UC-GAME-001] Độc lập bộ đếm thời gian lượt chơi 60 giây khi trận đấu đang diễn ra
  useEffect(() => {
    if (!gameStarted) return;
    const timer = setInterval(() => {
      useGameStore.getState().decrementTurnTimer();
    }, 1000);
    return () => clearInterval(timer);
  }, [gameStarted]);

  const session = useAppSession(
    roomCode,
    localPlayerId,
    isHost,
    lobbySlots,
    gameStarted,
    openModal,
    triggerEmote,
    currentTurnPlayerId,
    setPlayersInfo,
    setCurrentTurnPlayerId,
    setTreasuryPool,
    setPlayerPositions,
    initLobby,
    setErrorMessage,
  );

  const { handleRollDice, handleEndTurn, handleSendEmote, handleLeaveRoom } = useAppTurnControls(
    session.isConnected,
    roomCode,
    localPlayerId,
    currentTurnPlayerId,
    gameStarted,
    setCurrentTurnPlayerId,
    triggerEmote,
    session.sendIntent,
    session.sendEmote,
    session.sendWsMessage,
    session.landingTimerRef,
  );

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
          sendWsMessage={session.sendWsMessage}
          onStartGame={() => useLobbyStore.getState().setGameStarted(true)}
        />
      </div>

      {/* 3. In-Game HUD: trượt êm vào màn hình khi gameStarted = true */}
      {gameStarted && (
        <div className="relative z-10 w-full h-full pointer-events-none transition-opacity duration-500 ease-out">
          <HudContainer
            onRollDice={handleRollDice}
            onEndTurn={handleEndTurn}
            onIntent={session.sendIntent}
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
        <AppErrorBoundary>
          <App />
        </AppErrorBoundary>
      </React.StrictMode>
    );
  }
}
