// [UI-S03/MSS][IMP-201][IMP-202][IMP-205] PlayerHudList Component — Vertical list of PlayerCards
import React from 'react';
import { useGameStore } from '../store/game_store';
import { PlayerCard } from './player_card';

export function PlayerHudList({ initialCollapsed = false }: { initialCollapsed?: boolean } = {}): React.ReactElement | null {
  const isSSR = typeof window === 'undefined';
  const storePlayersInfo = useGameStore((state) => state.playersInfo);
  const playersInfo = isSSR ? useGameStore.getState().playersInfo : storePlayersInfo;
  const storeCurrentTurnPlayerId = useGameStore((state) => state.currentTurnPlayerId);
  const currentTurnPlayerId = isSSR ? useGameStore.getState().currentTurnPlayerId : storeCurrentTurnPlayerId;
  const storeLevelMap = useGameStore((state) => state.levelMap);
  const levelMap = isSSR ? useGameStore.getState().levelMap : storeLevelMap;
  const storeIsPlayerHudVisible = useGameStore((state) => state.isPlayerHudVisible);
  const isPlayerHudVisible = isSSR ? useGameStore.getState().isPlayerHudVisible : storeIsPlayerHudVisible;

  const playerList = Object.values(playersInfo);
  if (playerList.length === 0 || !isPlayerHudVisible || initialCollapsed) return null;

  return (
    <aside
      className="pointer-events-none flex flex-col gap-2 w-40 sm:w-48 md:w-64 max-w-[calc(100vw-8rem)] select-none items-end"
      aria-label="Danh sách người chơi"
    >
      <div className="flex flex-col gap-2 w-full pt-16 sm:pt-0">
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
    </aside>
  );
}
