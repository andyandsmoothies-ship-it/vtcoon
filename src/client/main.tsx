// [UI-S01/MSS][UI-S03/MSS] Client Entrypoint — Hybrid Viewport (WebGL Canvas Z-0 + DOM HUD Z-10)
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { GameCanvas } from './game_canvas';
import { HudContainer } from './ui/hud_container';
import { useGameStore } from './store/game_store';
import { PLAYER_TOKEN_PALETTE } from '../domain/theme';

export function App(): React.ReactElement {
  const setPlayersInfo = useGameStore((state) => state.setPlayersInfo);
  const setCurrentTurnPlayerId = useGameStore((state) => state.setCurrentTurnPlayerId);
  const setTreasuryPool = useGameStore((state) => state.setTreasuryPool);
  const setPlayerPositions = useGameStore((state) => state.setPlayerPositions);
  const triggerDiceRoll = useGameStore((state) => state.triggerDiceRoll);
  const startPawnMove = useGameStore((state) => state.startPawnMove);
  const currentTurnPlayerId = useGameStore((state) => state.currentTurnPlayerId);
  const playerPositions = useGameStore((state) => state.playerPositions);

  useEffect(() => {
    // Initial demo setup for visual inspection
    setPlayersInfo({
      p1: {
        id: 'p1',
        name: 'Người Chơi 1',
        balance: 12500,
        tokenColor: PLAYER_TOKEN_PALETTE[0] ?? '#c0392b',
        ownedProperties: [1, 3],
      },
      p2: {
        id: 'p2',
        name: 'Người Chơi 2',
        balance: 8200,
        tokenColor: PLAYER_TOKEN_PALETTE[1] ?? '#2980b9',
        ownedProperties: [6, 8],
      },
    });
    setCurrentTurnPlayerId('p1');
    setTreasuryPool(2000);
    setPlayerPositions({ p1: 0, p2: 0 });

    const timer = setInterval(() => {
      useGameStore.getState().decrementTurnTimer();
    }, 1000);
    return () => clearInterval(timer);
  }, [setPlayersInfo, setCurrentTurnPlayerId, setTreasuryPool, setPlayerPositions]);

  const handleRollDice = () => {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    triggerDiceRoll([d1, d2]);
    const activeId = currentTurnPlayerId ?? 'p1';
    const currentPos = playerPositions[activeId] ?? 0;
    const targetCell = (currentPos + d1 + d2) % 40;
    setTimeout(() => {
      startPawnMove(activeId, targetCell);
    }, 650);
  };

  const handleEndTurn = () => {
    const activeId = currentTurnPlayerId ?? 'p1';
    const nextId = activeId === 'p1' ? 'p2' : 'p1';
    setCurrentTurnPlayerId(nextId);
    useGameStore.getState().setTurnTimeRemaining(60);
  };

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
