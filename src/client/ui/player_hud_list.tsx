// [UI-S03/MSS][IMP-201][IMP-202][IMP-205][IMP-445] PlayerHudList Component — Collapsible vertical list of PlayerCards
import React from 'react';
import { useGameStore } from '../store/game_store.js';
import { PlayerCard } from './player_card.js';
import { PlayerHudMiniChips } from './player_hud_mini_chips.js';

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
  const storeIsCompact = useGameStore((state) => state.isPlayerHudCompact);
  const isPlayerHudCompact = isSSR ? useGameStore.getState().isPlayerHudCompact : storeIsCompact;
  const togglePlayerHudCompact = useGameStore((state) => state.togglePlayerHudCompact);

  const playerList = Object.values(playersInfo);
  if (playerList.length === 0 || !isPlayerHudVisible || initialCollapsed) return null;

  return (
    <aside
      className={`pointer-events-none flex flex-col gap-2 transition-[width] duration-300 ease-in-out ${
        isPlayerHudCompact ? 'w-14 sm:w-16' : 'w-44 sm:w-48 md:w-56 max-w-[calc(100vw-6rem)]'
      } select-none items-end pt-1 sm:pt-0 relative z-20 max-h-full overflow-y-auto scrollbar-none`}
      aria-label="Danh sách người chơi"
    >
      <div className="flex flex-col gap-2 w-full pointer-events-auto items-end">
        <button
          type="button"
          data-testid="player-hud-collapse-btn"
          onClick={togglePlayerHudCompact}
          aria-expanded={!isPlayerHudCompact}
          aria-label={isPlayerHudCompact ? 'Mở rộng bảng điểm' : 'Thu gọn bảng điểm'}
          className="min-h-[44px] min-w-[44px] pointer-events-auto flex items-center justify-center rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 shadow-md backdrop-blur-md transition-all cursor-pointer mb-1"
        >
          <span className="text-xs">{isPlayerHudCompact ? '◀' : '▶'}</span>
        </button>
        {isPlayerHudCompact ? (
          <PlayerHudMiniChips playerList={playerList} currentTurnPlayerId={currentTurnPlayerId} onExpand={togglePlayerHudCompact} />
        ) : (
          playerList.map((player, index) => (
            <PlayerCard key={player.id} player={player} isCurrentTurn={player.id === currentTurnPlayerId} levelMap={levelMap} slotIndex={index} />
          ))
        )}
      </div>
    </aside>
  );
}
