// [UI-S03/MSS] ActionDock Component — Player action toolbar (Roll, Manage, Trade, End Turn)
import React from 'react';
import { useGameStore } from '../store/game_store';
import { isRollActionDisabled, isEndTurnDisabled } from './ui_helpers';

export interface ActionDockProps {
  readonly onRollDice?: () => void;
  readonly onOpenProperties?: () => void;
  readonly onOpenTrade?: () => void;
  readonly onOpenUpgrade?: () => void;
  readonly onEndTurn?: () => void;
  readonly localPlayerId?: string;
}

export function ActionDock({
  onRollDice,
  onOpenProperties,
  onOpenTrade,
  onOpenUpgrade,
  onEndTurn,
  localPlayerId,
}: ActionDockProps): React.ReactElement {
  const isRolling = useGameStore((state) => state.isRolling);
  const activePawnAnimation = useGameStore((state) => state.activePawnAnimation);
  const currentTurnPlayerId = useGameStore((state) => state.currentTurnPlayerId);
  const playersInfo = useGameStore((state) => state.playersInfo);
  const triggerDiceRoll = useGameStore((state) => state.triggerDiceRoll);
  const openModal = useGameStore((state) => state.openModal);

  const actingPlayerId = localPlayerId ?? currentTurnPlayerId;
  const isMyTurn = !localPlayerId || currentTurnPlayerId === localPlayerId;
  const isPawnMoving = Boolean(activePawnAnimation?.isAnimating);
  const isBankrupt = Boolean(actingPlayerId && playersInfo[actingPlayerId]?.bankrupt);

  const isRollDisabled = isRollActionDisabled({
    isRolling,
    isPawnMoving,
    isMyTurn,
    isBankrupt,
  });

  const isEndDisabled = isEndTurnDisabled({
    isRolling,
    isPawnMoving,
    isMyTurn,
    isBankrupt,
  });

  const handleRollClick = () => {
    if (isRollDisabled) return;
    if (onRollDice) {
      onRollDice();
    } else {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      triggerDiceRoll([d1, d2]);
    }
  };

  const handleOpenProperties = () => {
    if (onOpenProperties) {
      onOpenProperties();
    } else {
      const activeInfo = actingPlayerId ? playersInfo[actingPlayerId] : undefined;
      const firstProp = activeInfo?.ownedProperties?.[0] ?? 1;
      const isOwned = Boolean(activeInfo?.ownedProperties?.includes(firstProp));
      openModal('deed', { cellIndex: firstProp, canBuy: !isOwned });
    }
  };

  const handleOpenTrade = () => {
    if (onOpenTrade) {
      onOpenTrade();
    } else {
      const otherId = Object.keys(playersInfo).find((id) => id !== actingPlayerId) ?? 'p2';
      openModal('trade', {
        targetPlayerId: otherId,
        offeredProperties: [],
        requestedProperties: [],
        cashOffer: 0,
        cashRequest: 0,
      });
    }
  };

  const handleOpenUpgrade = () => {
    if (onOpenUpgrade) {
      onOpenUpgrade();
    } else {
      const activeInfo = actingPlayerId ? playersInfo[actingPlayerId] : undefined;
      const firstProp = activeInfo?.ownedProperties?.[0] ?? 1;
      openModal('deed', { cellIndex: firstProp, canBuy: false });
    }
  };

  const isGlowActive = isMyTurn && !isRollDisabled;

  return (
    <nav
      className="pointer-events-auto flex items-center gap-2 md:gap-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/70 rounded-2xl p-2 px-4 shadow-2xl"
      aria-label="Thanh điều khiển tác vụ"
    >
      {/* Nút Đổ Xúc Xắc (CTA chính có hiệu ứng nhịp thở hào quang vàng kim & nút bấm nổi 3D) */}
      <button
        type="button"
        onClick={handleRollClick}
        disabled={isRollDisabled}
        className={`min-h-[44px] flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
          isRollDisabled
            ? 'bg-slate-700/60 text-slate-400 cursor-not-allowed opacity-60 border-b-4 border-slate-900'
            : `bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 shadow-emerald-900/30 ${
                isGlowActive ? 'ring-4 ring-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-pulse' : ''
              }`
        }`}
        aria-label="Đổ xúc xắc"
      >
        <span className="text-xl" aria-hidden="true">🎲</span>
        <span className="text-sm md:text-base">
          {isRolling ? 'Đang Đổ...' : isPawnMoving ? 'Đang Đi...' : isBankrupt ? 'Đã Phá Sản' : 'Đổ Xúc Xắc'}
        </span>
      </button>

      <div className="h-6 w-px bg-slate-700/80" aria-hidden="true" />

      {/* Nút Quản Lý Tài Sản với hiệu ứng nổi 3D */}
      <button
        type="button"
        onClick={handleOpenProperties}
        disabled={isBankrupt}
        className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700/60 border-b-2 border-b-slate-950 active:border-b-0 active:translate-y-0.5 transition-all text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        aria-label="Quản lý tài sản"
      >
        <span aria-hidden="true">🏛️</span>
        <span className="hidden sm:inline">Tài Sản</span>
      </button>

      {/* Nút Xây Dựng / Nâng Cấp với hiệu ứng nổi 3D */}
      <button
        type="button"
        onClick={handleOpenUpgrade}
        disabled={isBankrupt || !actingPlayerId || !(playersInfo[actingPlayerId]?.ownedProperties?.length)}
        className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700/60 border-b-2 border-b-slate-950 active:border-b-0 active:translate-y-0.5 transition-all text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        aria-label="Xây dựng và nâng cấp bất động sản"
      >
        <span aria-hidden="true">🏗️</span>
        <span className="hidden sm:inline">Xây Dựng</span>
      </button>

      {/* Nút Đàm Phán P2P với hiệu ứng nổi 3D */}
      <button
        type="button"
        onClick={handleOpenTrade}
        disabled={isBankrupt}
        className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700/60 border-b-2 border-b-slate-950 active:border-b-0 active:translate-y-0.5 transition-all text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        aria-label="Đàm phán thương lượng"
      >
        <span aria-hidden="true">🤝</span>
        <span className="hidden sm:inline">Đàm Phán</span>
      </button>

      {/* Nút Kết Thúc Lượt với hiệu ứng nổi 3D */}
      <button
        type="button"
        onClick={onEndTurn}
        disabled={isEndDisabled}
        className={`min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl border transition-all text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
          isEndDisabled
            ? 'bg-slate-800/40 text-slate-500 border-slate-800 cursor-not-allowed'
            : 'text-amber-300 hover:text-amber-200 bg-amber-950/30 hover:bg-amber-900/40 border-amber-600/40 border-b-2 border-b-amber-950 active:border-b-0 active:translate-y-0.5'
        }`}
        aria-label="Kết thúc lượt"
      >
        <span aria-hidden="true">⏭️</span>
        <span className="hidden sm:inline">Hết Lượt</span>
      </button>
    </nav>
  );
}
