// [UI-S03/MSS][UI-S05/MSS] TopBar Component — Round info, turn timer, treasury pool & audio toggle
import React from 'react';
import { useGameStore } from '../store/game_store';
import { useAudioStore } from '../store/audio_store';
import { formatCurrency, formatTimeRemaining } from './ui_helpers';

export function TopBar(): React.ReactElement {
  const roundNumber = useGameStore((state) => state.roundNumber);
  const maxRounds = useGameStore((state) => state.maxRounds);
  const turnTimeRemaining = useGameStore((state) => state.turnTimeRemaining);
  const treasuryPool = useGameStore((state) => state.treasuryPool);
  const isMuted = useAudioStore((state) => state.isMuted);
  const toggleMute = useAudioStore((state) => state.toggleMute);

  const isLowTime = turnTimeRemaining <= 10;
  const timerColorClass = isLowTime
    ? 'text-rose-400 font-extrabold animate-pulse'
    : 'text-emerald-400 font-semibold';

  return (
    <header className="w-full flex justify-center items-center pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-6 bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-2xl px-6 py-2.5 shadow-2xl text-slate-100 text-sm md:text-base font-medium">
        {/* Vòng đấu */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs uppercase tracking-wider">Vòng</span>
          <span className="font-bold text-amber-300">
            {roundNumber}
            <span className="text-slate-400 text-xs font-normal">/{maxRounds}</span>
          </span>
        </div>

        <div className="h-4 w-px bg-slate-700" aria-hidden="true" />

        {/* Đồng hồ đếm ngược */}
        <div className="flex items-center gap-2" role="timer" aria-live="polite">
          <span className="text-base" aria-hidden="true">⏱️</span>
          <span className="text-xs text-slate-400">Thời gian:</span>
          <span className={`tabular-nums font-mono text-base ${timerColorClass}`}>
            {formatTimeRemaining(turnTimeRemaining)}
          </span>
        </div>

        <div className="h-4 w-px bg-slate-700" aria-hidden="true" />

        {/* Quỹ Kho Bạc */}
        <div className="flex items-center gap-2">
          <span className="text-base" aria-hidden="true">🏦</span>
          <span className="text-xs text-slate-400">Kho Bạc:</span>
          <span className="font-bold text-amber-400">
            {formatCurrency(treasuryPool)}
          </span>
        </div>

        <div className="h-4 w-px bg-slate-700" aria-hidden="true" />

        {/* Nút Bật / Tắt âm thanh */}
        <button
          type="button"
          onClick={toggleMute}
          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer text-xs font-medium border border-slate-600/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          aria-label={isMuted ? 'Bật âm thanh trò chơi' : 'Tắt âm thanh trò chơi'}
          data-testid="mute-toggle-button"
        >
          <span className="text-sm" aria-hidden="true">{isMuted ? '🔇' : '🔊'}</span>
          <span className="hidden sm:inline">{isMuted ? 'Tắt' : 'Bật'}</span>
        </button>
      </div>
    </header>
  );
}
