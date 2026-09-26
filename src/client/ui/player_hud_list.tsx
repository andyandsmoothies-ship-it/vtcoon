// [UI-S03/MSS][IMP-201][IMP-202] PlayerHudList Component — Vertical list of PlayerCards
import React, { useState } from 'react';
import { useGameStore } from '../store/game_store';
import { PlayerCard } from './player_card';

export function PlayerHudList({ initialCollapsed = false }: { initialCollapsed?: boolean } = {}): React.ReactElement | null {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const isSSR = typeof window === 'undefined';
  const storePlayersInfo = useGameStore((state) => state.playersInfo);
  const playersInfo = isSSR ? useGameStore.getState().playersInfo : storePlayersInfo;
  const storeCurrentTurnPlayerId = useGameStore((state) => state.currentTurnPlayerId);
  const currentTurnPlayerId = isSSR ? useGameStore.getState().currentTurnPlayerId : storeCurrentTurnPlayerId;
  const storeLevelMap = useGameStore((state) => state.levelMap);
  const levelMap = isSSR ? useGameStore.getState().levelMap : storeLevelMap;

  const playerList = Object.values(playersInfo);
  if (playerList.length === 0) return null;

  return (
    <aside
      className="pointer-events-none flex flex-col gap-2 w-40 sm:w-48 md:w-64 max-w-[calc(100vw-8rem)] select-none items-end"
      aria-label="Danh sách người chơi"
    >
      <button
        type="button"
        onClick={() => setIsCollapsed((prev) => !prev)}
        className="pointer-events-auto sm:hidden fixed top-28 sm:top-32 right-0 z-20 min-h-[38px] inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-l-xl rounded-r-none bg-[#FFFDF8] border-2 border-r-0 border-slate-900 shadow-sm active:scale-95 text-slate-900 text-xs font-black transition-all cursor-pointer"
        data-testid="toggle-player-hud-btn"
        aria-label={isCollapsed ? 'Mở Bảng Điểm' : 'Thu gọn Bảng Điểm'}
        title={isCollapsed ? 'Hiện Bảng Điểm' : 'Thu gọn'}
      >
        <span aria-hidden="true">{isCollapsed ? '👥 Hiện' : '👥 Ẩn'}</span>
        <span className="text-[11px] font-extrabold">{isCollapsed ? 'Bảng Điểm' : 'Đóng'}</span>
      </button>

      {!isCollapsed && (
        <div className="flex flex-col gap-2 w-full pt-28 sm:pt-0">
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
