// [IMP-445] PlayerHudMiniChips — Tactile mini avatar rail for compact player HUD
import React from 'react';
import type { PlayerHudInfo } from '../store/game_store_types.js';

export interface PlayerHudMiniChipsProps {
  readonly playerList: readonly PlayerHudInfo[];
  readonly currentTurnPlayerId?: string | null;
  readonly onExpand?: () => void;
}

export function formatCompactBalance(balance: number): string {
  const abs = Math.abs(balance);
  const sign = balance < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}M`;
  return `${sign}${Math.round(abs / 1_000)}k`;
}

export function getPlayerMonogram(name: string): string {
  if (!name) return '??';
  const trimmed = name.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length === 0) return '??';
  if (words.length === 1) {
    return trimmed.slice(0, 2).toUpperCase();
  }
  const lastWord = words[words.length - 1]!;
  if (/^\d+$/.test(lastWord)) {
    const firstChar = words[0]!.charAt(0).toUpperCase();
    return `${firstChar}${lastWord}`;
  }
  return (words[0]!.charAt(0) + words[1]!.charAt(0)).toUpperCase();
}

export function PlayerHudMiniChips({
  playerList,
  currentTurnPlayerId,
  onExpand,
}: PlayerHudMiniChipsProps): React.ReactElement {
  return (
    <div className="flex flex-col gap-2 w-full items-end" data-testid="player-hud-mini-chips-container">
      {playerList.map((player) => {
        const isCurrentTurn = player.id === currentTurnPlayerId;
        const formattedCash = formatCompactBalance(player.balance);
        const isBankrupt = Boolean(player.bankrupt || player.isBankrupt);

        return (
          <button
            key={player.id}
            type="button"
            data-testid={`player-mini-chip-${player.id}`}
            onClick={onExpand}
            title={`${player.name} (${isBankrupt ? 'Phá sản' : formattedCash})`}
            aria-label={`${player.name}, ${isBankrupt ? 'đã phá sản' : formattedCash}`}
            className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center p-1 rounded-xl backdrop-blur-md transition-all cursor-pointer pointer-events-auto ${
              isBankrupt
                ? 'opacity-40 grayscale bg-slate-900/60 border border-slate-800'
                : isCurrentTurn
                ? 'bg-amber-500/20 border-2 border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                : 'bg-slate-900/80 border border-slate-700'
            }`}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-inner"
              style={{ backgroundColor: player.tokenColor || '#38BDF8' }}
            >
              {getPlayerMonogram(player.name)}
            </div>
            <span className="text-[9px] font-mono font-bold text-amber-300 mt-0.5">
              {isBankrupt ? '💀' : formattedCash}
            </span>
          </button>
        );
      })}
    </div>
  );
}
