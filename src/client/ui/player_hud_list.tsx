// [UI-S03/MSS] PlayerHudList Component — Vertical list of PlayerCards
import React from 'react';
import { useGameStore } from '../store/game_store';
import { PlayerCard } from './player_card';

export function PlayerHudList(): React.ReactElement | null {
  const playersInfo = useGameStore((state) => state.playersInfo);
  const currentTurnPlayerId = useGameStore((state) => state.currentTurnPlayerId);
  const levelMap = useGameStore((state) => state.levelMap);

  const playerList = Object.values(playersInfo);
  if (playerList.length === 0) {
    return null;
  }

  return (
    <aside
      className="pointer-events-none flex flex-col gap-2.5 w-60 md:w-64 select-none"
      aria-label="Danh sách người chơi"
    >
      {playerList.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          isCurrentTurn={player.id === currentTurnPlayerId}
          levelMap={levelMap}
        />
      ))}
    </aside>
  );
}
