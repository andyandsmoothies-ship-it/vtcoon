// [UI-S05/MSS] FloatingNumbers Component — Micro-VFX Floating financial badges
// Bay lên số tiền thưởng +2.000 Tr. khi qua GO hoặc chữ đỏ trừ tiền khi nộp thuế / tiền thuê
import React from 'react';
import { useGameStore, FloatingTextType, type FloatingTextItem } from '../store/game_store';

export function FloatingBadge({ item }: { readonly item: FloatingTextItem }): React.ReactElement {
  const isReward = item.type === FloatingTextType.Reward;
  const player = useGameStore((state) => state.playersInfo[item.playerId]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`animate-float-up-fade pointer-events-none flex items-center gap-2 px-4 py-2 rounded-2xl border backdrop-blur-md shadow-2xl select-none ${
        isReward
          ? 'bg-emerald-950/90 border-emerald-400/80 text-emerald-300 shadow-emerald-500/40 ring-1 ring-emerald-400/50'
          : 'bg-rose-950/90 border-rose-500/80 text-rose-300 shadow-rose-500/40 ring-1 ring-rose-400/50'
      }`}
    >
      <span className="text-xl" aria-hidden="true">
        {isReward ? '✨' : '💸'}
      </span>
      {player && (
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full text-white/95 border border-white/20 shadow-xs"
          style={{ backgroundColor: player.tokenColor || '#64748B' }}
        >
          {player.name}
        </span>
      )}
      <span className="font-black text-base md:text-lg tabular-nums tracking-wide">
        {item.text}
      </span>
    </div>
  );
}

export function FloatingNumbersOverlay(): React.ReactElement | null {
  const floatingTexts = useGameStore((state) => state.floatingTexts);

  if (floatingTexts.length === 0) {
    return null;
  }

  return (
    <aside
      className="fixed top-24 left-1/2 -translate-x-1/2 z-40 pointer-events-none flex flex-col items-center gap-2 select-none"
      id="vtcoon-floating-numbers"
      aria-label="Thông báo biến động tài chính"
    >
      {floatingTexts.map((item) => (
        <FloatingBadge key={item.id} item={item} />
      ))}
    </aside>
  );
}
