import React, { useEffect, useCallback, useState, useRef, Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { HudContainer } from './ui/hud_container';
import { useGameStore, type PlayerHudInfo, FloatingTextType } from './store/game_store';
import { useLobbyStore } from './store/lobby_store';
import { useEnvironmentStore } from './store/environment_store';
import { useVfxStore } from './store/vfx_store';
import { LobbyView } from './ui/lobby/lobby_view';
import { PLAYER_TOKEN_PALETTE } from '../domain/theme';
import { AudioEngine } from './audio/audio_engine';
import { SoundEffect } from './audio/audio_types';
import { BOARD_CONFIG, CellType } from '../domain/board_config';
import { useGameWs, isGameRunningDelta, clearReconnectToken } from './network/use_game_ws';
import type { ReasonCode } from '../server/network/network_types';
import type { DeltaPayload } from '../server/session_manager';

export const GameCanvas = lazy(() =>
  import('./game_canvas').then((m) => ({ default: m.GameCanvas }))
);

function getInitialLobbyConfig(): { roomCode: string; playerId: string; isHost: boolean; playerName: string } {
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const roomParam = params?.get('room');
  if (roomParam && /^[A-Z0-9]{6}$/i.test(roomParam)) {
    const isGuest = params?.get('host') !== 'true';
    return {
      roomCode: roomParam.toUpperCase(),
      playerId: isGuest ? 'p2' : 'p1',
      isHost: !isGuest,
      playerName: isGuest ? 'Khách Mời (P2)' : 'Đại Gia Chủ Sảnh (P1)',
    };
  }
  return {
    roomCode: 'VT8888',
    playerId: 'p1',
    isHost: true,
    playerName: 'Đại Gia Chủ Sảnh (P1)',
  };
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

  const handleError = useCallback((reasonCode: ReasonCode) => {
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
      const tile = BOARD_CONFIG[targetCell];
      if (!tile) return;

      try {
        AudioEngine.handlePawnLanded(targetCell);
      } catch {
        /* safe-ignore: audio may be uninitialized or muted in headless environment */
      }

      const state = useGameStore.getState();
      const activePlayer = state.playersInfo[activeId];
      const isLocal = activeId === (currentTurnPlayerId ?? 'p1');

      if (tile.type === CellType.Property || tile.type === CellType.Railroad || tile.type === CellType.Utility) {
        const ownerEntry = Object.entries(state.playersInfo).find(([_, p]) =>
          p.ownedProperties?.includes(targetCell)
        );
        if (!ownerEntry) {
          if (isLocal) {
            openModal('deed', { cellIndex: targetCell, canBuy: (activePlayer?.balance ?? 0) >= 600 });
          }
        } else if (ownerEntry[0] !== activeId) {
          AudioEngine.playSfx(SoundEffect.TAX_PENALTY);
          if (!isConnected) {
            useGameStore.getState().addFloatingText({
              text: '-500 Tr.',
              type: FloatingTextType.Penalty,
              playerId: activeId,
            });
          }
        }
      } else if (tile.type === CellType.Chance) {
        if (isLocal) {
          openModal('event', {
            cardType: 'chance',
            cardId: `chance_${targetCell}`,
            title: 'PHIẾU CƠ HỘI',
            description: 'Cơ hội phát triển kinh doanh và mở rộng mạng lưới địa ốc.',
          });
        }
      } else if (tile.type === CellType.Market) {
        if (isLocal) {
          openModal('event', {
            cardType: 'market',
            cardId: `market_${targetCell}`,
            title: 'PHIẾU THỊ TRƯỜNG',
            description: 'Biến động chính sách vĩ mô và dòng vốn đầu tư toàn quốc.',
          });
        }
      } else if (tile.type === CellType.Hose) {
        if (isLocal) {
          openModal('hose', { currentStake: 500 });
        }
      } else if (tile.type === CellType.Tax || tile.type === CellType.TaxOrder) {
        AudioEngine.playSfx(SoundEffect.TAX_PENALTY);
        if (!isConnected) {
          useGameStore.getState().addFloatingText({
            text: '-1.000 Tr.',
            type: FloatingTextType.Penalty,
            playerId: activeId,
          });
        }
      } else if (tile.type === CellType.Go) {
        AudioEngine.playSfx(SoundEffect.BUY_PROPERTY);
        if (!isConnected) {
          useGameStore.getState().addFloatingText({
            text: '+2.000 Tr.',
            type: FloatingTextType.Reward,
            playerId: activeId,
          });
          const p = useGameStore.getState().playersInfo[activeId];
          if (p) {
            useGameStore.getState().updatePlayerInfo(activeId, { balance: p.balance + 2000 });
          }
        }
      }

      if (activePlayer && activePlayer.balance < 0 && isLocal) {
        openModal('insolvency', { playerId: activeId, deficit: -activePlayer.balance });
      }
    },
    [currentTurnPlayerId, openModal]
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
      if (localP) {
        if (localP.balance < 0) {
          const currentModal = useGameStore.getState().activeModal;
          if (currentModal !== 'insolvency' && currentModal !== 'game_over') {
            openModal('insolvency', { playerId: localPlayerId, deficit: -localP.balance });
          }
        }

        if (prevPositionRef.current !== null && localP.position !== prevPositionRef.current) {
          const fromPos = prevPositionRef.current;
          prevPositionRef.current = localP.position;
          let steps = (localP.position - fromPos) % 40;
          if (steps <= 0) steps += 40;
          // Mỗi bước nhảy gồm HOP_DURATION (0.22s) + LANDING_DURATION (0.12s) = 0.34s
          // Đợi toàn bộ chuỗi nhảy kết thúc và con cờ chạm đất trước khi mở modal
          const animDelayMs = steps * 340 + 120;
          if (landingTimerRef.current) clearTimeout(landingTimerRef.current);
          landingTimerRef.current = setTimeout(() => {
            handleCellLanding(localPlayerId, localP.position);
          }, animDelayMs);
        } else if (prevPositionRef.current === null) {
          prevPositionRef.current = localP.position;
        }
      }
    }
  }, [localPlayerId, handleCellLanding, openModal]);

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

  const handleEndTurn = () => {
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
  };

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

  if (!gameStarted) {
    return (
      <div className="relative w-screen h-screen overflow-hidden bg-slate-950">
        {errorMessage && (
          <div
            role="alert"
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-rose-600/95 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-lg border border-rose-400 backdrop-blur-sm"
          >
            {errorMessage}
          </div>
        )}
        {/* Nền sa bàn 3D Sảnh Chờ Penthouse Lounge ngắm hoàng hôn vịnh biển */}
        <div className="absolute inset-0 z-0 pointer-events-auto">
          <Suspense fallback={null}>
            <GameCanvas isLobby />
          </Suspense>
        </div>
        {/* Lớp giao diện Sảnh Chờ Glassmorphism mỏng nổi bên cánh phải */}
        <div className="relative z-10 w-full h-full pointer-events-none">
          <LobbyView sendWsMessage={sendWsMessage} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950">
      {errorMessage && (
        <div
          role="alert"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-rose-600/95 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-lg border border-rose-400 backdrop-blur-sm"
        >
          {errorMessage}
        </div>
      )}
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
        <GameCanvas />
      </Suspense>
      <HudContainer
        onRollDice={handleRollDice}
        onEndTurn={handleEndTurn}
        onIntent={sendIntent}
        onSendEmote={handleSendEmote}
        onLeaveRoom={handleLeaveRoom}
        localPlayerId={localPlayerId}
      />
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
