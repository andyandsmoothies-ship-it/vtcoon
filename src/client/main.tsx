import React, { useEffect, useCallback, Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { HudContainer } from './ui/hud_container';
import { useGameStore, type PlayerHudInfo, FloatingTextType } from './store/game_store';
import { useLobbyStore } from './store/lobby_store';
import { LobbyView } from './ui/lobby/lobby_view';
import { PLAYER_TOKEN_PALETTE } from '../domain/theme';
import { AudioEngine } from './audio/audio_engine';
import { SoundEffect } from './audio/audio_types';
import { BOARD_CONFIG, CellType } from '../domain/board_config';
import { useGameWs } from './network/use_game_ws';

export const GameCanvas = lazy(() =>
  import('./game_canvas').then((m) => ({ default: m.GameCanvas }))
);

export function App(): React.ReactElement {
  const gameStarted = useLobbyStore((s) => s.gameStarted);
  const roomCode = useLobbyStore((s) => s.roomCode);
  const initLobby = useLobbyStore((s) => s.initLobby);
  const lobbySlots = useLobbyStore((s) => s.slots);
  const myPlayerId = useLobbyStore((s) => s.myPlayerId);
  const localPlayerId = myPlayerId || 'p1';

  const setPlayersInfo = useGameStore((state) => state.setPlayersInfo);
  const setCurrentTurnPlayerId = useGameStore((state) => state.setCurrentTurnPlayerId);
  const setTreasuryPool = useGameStore((state) => state.setTreasuryPool);
  const setPlayerPositions = useGameStore((state) => state.setPlayerPositions);
  const triggerDiceRoll = useGameStore((state) => state.triggerDiceRoll);
  const startPawnMove = useGameStore((state) => state.startPawnMove);
  const openModal = useGameStore((state) => state.openModal);
  const triggerEmote = useGameStore((state) => state.triggerEmote);
  const currentTurnPlayerId = useGameStore((state) => state.currentTurnPlayerId);
  const playerPositions = useGameStore((state) => state.playerPositions);

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

  const { isConnected, sendIntent, sendEmote } = useGameWs({
    roomCode: roomCode || 'VT8888',
    playerId: localPlayerId,
    autoConnect: true,
    onGameOver: handleGameOver,
    onEmote: handleEmote,
  });

  useEffect(() => {
    AudioEngine.init();

    if (!roomCode) {
      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const roomParam = params?.get('room');
      if (roomParam && /^[A-Z0-9]{6}$/i.test(roomParam)) {
        initLobby(roomParam.toUpperCase(), 'p2', false, 'Khách Mời (P2)');
      } else {
        initLobby('VT8888', 'p1', true, 'Đại Gia Chủ Sảnh (P1)');
      }
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

    const timer = setInterval(() => {
      useGameStore.getState().decrementTurnTimer();
    }, 1000);
    return () => clearInterval(timer);
  }, [gameStarted, lobbySlots, setPlayersInfo, setPlayerPositions, setCurrentTurnPlayerId, setTreasuryPool]);

  // Router xử lý sự kiện khi quân cờ đáp xuống ô [UC-GAME-017]
  const handleCellLanding = useCallback(
    (activeId: string, targetCell: number) => {
      const tile = BOARD_CONFIG[targetCell];
      if (!tile) return;

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

      // Kiểm tra tình trạng nợ / thấu chi âm tiền
      if (activePlayer && activePlayer.balance < 0 && isLocal) {
        openModal('insolvency', { playerId: activeId, deficit: -activePlayer.balance });
      }
    },
    [currentTurnPlayerId, openModal]
  );

  const handleRollDice = () => {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    triggerDiceRoll([d1, d2]);
    AudioEngine.playSfx(SoundEffect.DICE_ROLL);

    if (isConnected) {
      sendIntent({ type: 'INTENT_ROLL' });
    }

    const activeId = currentTurnPlayerId ?? 'p1';
    const currentPos = playerPositions[activeId] ?? 0;
    const targetCell = (currentPos + d1 + d2) % 40;
    const passedGo = currentPos + d1 + d2 >= 40;

    setTimeout(() => {
      startPawnMove(activeId, targetCell);
      AudioEngine.playSfx(SoundEffect.PAWN_STEP);
      AudioEngine.handlePawnLanded(targetCell);

      if (passedGo) {
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

      handleCellLanding(activeId, targetCell);
    }, 650);
  };

  const handleEndTurn = () => {
    if (isConnected) {
      sendIntent({ type: 'INTENT_END_TURN' });
    }
    const activeId = currentTurnPlayerId ?? 'p1';
    const activePlayers = Object.keys(useGameStore.getState().playersInfo);
    const currentIdx = activePlayers.indexOf(activeId);
    const nextId = activePlayers[(currentIdx + 1) % (activePlayers.length || 1)] ?? 'p1';
    setCurrentTurnPlayerId(nextId);
    useGameStore.getState().setTurnTimeRemaining(60);
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

  if (!gameStarted) {
    return <LobbyView />;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950">
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
