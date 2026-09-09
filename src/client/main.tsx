// [UI-S01/MSS][UI-S03/MSS][UI-S05/MSS][TC-NET02/MSS] Client Entrypoint — Sảnh Chờ & Sa Bàn 3D
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { GameCanvas } from './game_canvas';
import { HudContainer } from './ui/hud_container';
import { useGameStore, type PlayerHudInfo } from './store/game_store';
import { useLobbyStore } from './store/lobby_store';
import { LobbyView } from './ui/lobby/lobby_view';
import { PLAYER_TOKEN_PALETTE } from '../domain/theme';
import { AudioEngine } from './audio/audio_engine';
import { SoundEffect } from './audio/audio_types';

export function App(): React.ReactElement {
  const gameStarted = useLobbyStore((s) => s.gameStarted);
  const roomCode = useLobbyStore((s) => s.roomCode);
  const initLobby = useLobbyStore((s) => s.initLobby);
  const lobbySlots = useLobbyStore((s) => s.slots);

  const setPlayersInfo = useGameStore((state) => state.setPlayersInfo);
  const setCurrentTurnPlayerId = useGameStore((state) => state.setCurrentTurnPlayerId);
  const setTreasuryPool = useGameStore((state) => state.setTreasuryPool);
  const setPlayerPositions = useGameStore((state) => state.setPlayerPositions);
  const triggerDiceRoll = useGameStore((state) => state.triggerDiceRoll);
  const startPawnMove = useGameStore((state) => state.startPawnMove);
  const currentTurnPlayerId = useGameStore((state) => state.currentTurnPlayerId);
  const playerPositions = useGameStore((state) => state.playerPositions);

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

  const handleRollDice = () => {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    triggerDiceRoll([d1, d2]);
    AudioEngine.playSfx(SoundEffect.DICE_ROLL);

    const activeId = currentTurnPlayerId ?? 'p1';
    const currentPos = playerPositions[activeId] ?? 0;
    const targetCell = (currentPos + d1 + d2) % 40;
    setTimeout(() => {
      startPawnMove(activeId, targetCell);
      AudioEngine.playSfx(SoundEffect.PAWN_STEP);
      AudioEngine.handlePawnLanded(targetCell);
    }, 650);
  };

  const handleEndTurn = () => {
    const activeId = currentTurnPlayerId ?? 'p1';
    const activePlayers = Object.keys(useGameStore.getState().playersInfo);
    const currentIdx = activePlayers.indexOf(activeId);
    const nextId = activePlayers[(currentIdx + 1) % (activePlayers.length || 1)] ?? 'p1';
    setCurrentTurnPlayerId(nextId);
    useGameStore.getState().setTurnTimeRemaining(60);
  };

  if (!gameStarted) {
    return <LobbyView />;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950">
      <GameCanvas />
      <HudContainer onRollDice={handleRollDice} onEndTurn={handleEndTurn} />
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
