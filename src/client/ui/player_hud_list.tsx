// [UI-S03/MSS] PlayerHudList Component — Vertical list of PlayerCards
import React, { useState } from 'react';
import { useGameStore } from '../store/game_store';
import { PlayerCard } from './player_card';

export function PlayerHudList(): React.ReactElement | null {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const playersInfo = useGameStore((state) => state.playersInfo);
  const currentTurnPlayerId = useGameStore((state) => state.currentTurnPlayerId);
  const levelMap = useGameStore((state) => state.levelMap);

  const playerList = Object.values(playersInfo);
  if (playerList.length === 0) {
    return null;
  }

  return (
    <aside
      className="pointer-events-none flex flex-col gap-2 w-36 sm:w-48 md:w-64 select-none items-end"
      aria-label="Danh sách người chơi"
    >
      <button
        type="button"
        onClick={() => setIsCollapsed((prev) => !prev)}
        className="pointer-events-auto sm:hidden min-h-[36px] min-w-[36px] inline-flex items-center justify-center p-1.5 rounded-xl bg-[#FFFDF8] border-2 border-slate-900 shadow-[0_2px_0_0_#0f172a] text-slate-800 text-xs font-bold active:translate-y-0.5 cursor-pointer self-end"
        data-testid="toggle-player-hud-btn"
        aria-label={isCollapsed ? 'Mở danh sách người chơi' : 'Thu gọn danh sách người chơi'}
        title={isCollapsed ? 'Hiện người chơi' : 'Thu gọn'}
      >
        <span aria-hidden="true">{isCollapsed ? '👥' : '✕ 👥'}</span>
      </button>

      {!isCollapsed && (
        <div className="flex flex-col gap-2 w-full">
          {playerList.map((player, index) => (
            <PlayerCard
              key={player.id}
              player={player}
              isCurrentTurn={player.id === currentTurnPlayerId}
              levelMap={levelMap}
              slotIndex={index}
            />
          ))}
        </div>
      )}
    </aside>
  );
}
