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
      className={`animate-float-up-fade pointer-events-none flex items-center gap-2 px-4 py-2 rounded-2xl border-2 border-slate-900 bg-[#FFFDF8] select-none ${
        isReward
          ? 'text-emerald-800 shadow-[0_4px_0_0_#047857]'
          : 'text-rose-800 shadow-[0_4px_0_0_#b91c1c]'
      }`}
    >
      <span className="text-xl" aria-hidden="true">
        {isReward ? '✨' : '💸'}
      </span>
      {player && (
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full text-white/95 border border-slate-900/30 shadow-xs"
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
