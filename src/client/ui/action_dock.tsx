// [UI-S03/MSS] ActionDock Component — Player action toolbar (Roll, Manage, Trade, End Turn)
import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/game_store';
import { isRollActionDisabled, isEndTurnDisabled, resolveManagePropertyTarget } from './ui_helpers';

export interface ActionDockProps {
  readonly onRollDice?: () => void;
  readonly onOpenProperties?: () => void;
  readonly onOpenTrade?: () => void;
  readonly onOpenUpgrade?: () => void;
  readonly onOpenManageProperty?: () => void;
  readonly onEndTurn?: () => void;
  readonly localPlayerId?: string;
  readonly isPawnMoving?: boolean;
  readonly canRollAgain?: boolean;
  readonly hasRolledThisTurn?: boolean;
  readonly isMyTurn?: boolean;
}

export function ActionDock({
  onRollDice,
  onOpenProperties,
  onOpenTrade,
  onOpenUpgrade,
  onOpenManageProperty,
  onEndTurn,
  localPlayerId,
  isPawnMoving: isPawnMovingProp,
  canRollAgain: canRollAgainProp,
  hasRolledThisTurn: hasRolledThisTurnProp,
  isMyTurn: isMyTurnProp,
}: ActionDockProps): React.ReactElement {
  const isRollingStore = useGameStore((state) => state.isRolling);
  const activePawnAnimationStore = useGameStore((state) => state.activePawnAnimation);
  const pawnAnimationQueueStore = useGameStore((state) => state.pawnAnimationQueue);
  const currentTurnPlayerIdStore = useGameStore((state) => state.currentTurnPlayerId);
  const playersInfoStore = useGameStore((state) => state.playersInfo);
  const openModal = useGameStore((state) => state.openModal);
  const diceStore = useGameStore((state) => state.dice);
  const storeHasRolledThisTurnStore = useGameStore((state) => state.hasRolledThisTurn);
  const playerPositionsStore = useGameStore((state) => state.playerPositions);

  const isSSR = typeof window === 'undefined';
  const ssrState = isSSR ? useGameStore.getState() : null;

  const isRolling = ssrState ? ssrState.isRolling : isRollingStore;
  const activePawnAnimation = ssrState ? ssrState.activePawnAnimation : activePawnAnimationStore;
  const pawnAnimationQueue = ssrState ? ssrState.pawnAnimationQueue : pawnAnimationQueueStore;
  const currentTurnPlayerId = ssrState ? ssrState.currentTurnPlayerId : currentTurnPlayerIdStore;
  const playersInfo = ssrState ? ssrState.playersInfo : playersInfoStore;
  const dice = ssrState ? ssrState.dice : diceStore;
  const storeHasRolledThisTurn = ssrState ? ssrState.hasRolledThisTurn : storeHasRolledThisTurnStore;
  const playerPositions = ssrState ? ssrState.playerPositions : playerPositionsStore;

  const queueHasTasks = Boolean(pawnAnimationQueue && pawnAnimationQueue.length > 0);
  const actingPlayerId = localPlayerId ?? currentTurnPlayerId;
  const isMyTurn = isMyTurnProp !== undefined ? isMyTurnProp : (!localPlayerId || currentTurnPlayerId === localPlayerId);
  const isPawnMoving = (isPawnMovingProp ?? Boolean(activePawnAnimation?.isAnimating)) || queueHasTasks;
  const actingPlayer = actingPlayerId ? playersInfo[actingPlayerId] : undefined;
  const isBankrupt = Boolean(actingPlayer?.bankrupt);
  const inAudit = Boolean(actingPlayer?.inAudit);
  const isInsolvent = Boolean(actingPlayer && actingPlayer.balance < 0);
  const storeConsecutiveDoubles = actingPlayer ? (actingPlayer.consecutiveDoubles ?? 0) : 0;
  const storeCanRollAgain = ((dice[0] === dice[1] && dice[0] > 0) || storeConsecutiveDoubles > 0) && !inAudit;
  const canRollAgain = canRollAgainProp !== undefined ? canRollAgainProp : storeCanRollAgain;
  const hasRolledThisTurn = hasRolledThisTurnProp !== undefined ? hasRolledThisTurnProp : storeHasRolledThisTurn;
  const [isRollPending, setIsRollPending] = useState(false);

  useEffect(() => {
    if (hasRolledThisTurn || isRolling || !isMyTurn) {
      setIsRollPending(false);
    }
  }, [hasRolledThisTurn, isRolling, isMyTurn]);

  const isRollDisabled = isRollActionDisabled({
    isRolling,
    isPawnMoving,
    isMyTurn,
    isBankrupt,
    hasRolledThisTurn,
    canRollAgain,
    isRollPending,
  });

  const isEndDisabled = isEndTurnDisabled({
    isRolling,
    isPawnMoving,
    isMyTurn,
    isBankrupt,
    hasRolledThisTurn,
    canRollAgain,
    isInsolvent,
  });

  const handleRollClick = () => {
    if (isRollDisabled || isRollPending) return;
    setIsRollPending(true);
    onRollDice?.();
    setTimeout(() => {
      setIsRollPending(false);
    }, 1500);
  };

  const handleOpenManageProperty = () => {
    if (onOpenManageProperty) {
      onOpenManageProperty();
    } else if (onOpenProperties) {
      onOpenProperties();
    } else {
      const activeInfo = actingPlayerId ? playersInfo[actingPlayerId] : undefined;
      const currentPos = actingPlayerId ? (playerPositions[actingPlayerId] ?? 0) : 0;
      const target = resolveManagePropertyTarget(activeInfo?.ownedProperties, currentPos);
      openModal('deed', target);
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

  const isGlowActive = isMyTurn && !isRollDisabled;

  return (
    <nav
      className="pointer-events-auto flex items-center gap-2 md:gap-3 bg-slate-900/90 backdrop-blur-md border border-amber-500/30 ring-1 ring-amber-400/10 rounded-2xl p-2 px-4 shadow-2xl"
      aria-label="Thanh điều khiển tác vụ"
    >
      {/* Nút Đổ Xúc Xắc (CTA chính mang sắc đỏ/cam rực rỡ phong cách Retropoly với viền vàng & nút bấm nổi 3D) */}
      <button
        type="button"
        onClick={handleRollClick}
        disabled={isRollDisabled}
        data-legacy-style="border-emerald-800 shadow-[0_4px_0_0_#064e3b]"
        className={`min-h-[44px] flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-white shadow-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
          isRollDisabled
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60 shadow-[0_3px_0_0_#1e293b]'
            : `bg-gradient-to-b from-rose-500 via-red-600 to-red-700 hover:from-rose-400 hover:to-red-600 border border-red-400/60 shadow-[0_4px_0_0_#991b1b,0_8px_20px_rgba(239,68,68,0.35)] active:shadow-none active:translate-y-[4px] ${
                isGlowActive ? 'ring-4 ring-amber-400/60 shadow-[0_0_24px_rgba(245,158,11,0.55)] animate-pulse' : ''
              }`
        }`}
        aria-label="Đổ xúc xắc"
      >
        <span className="text-xl" aria-hidden="true">🎲</span>
        <span className="text-sm md:text-base">
          {isRollPending || isRolling
            ? 'Đang Đổ...'
            : isPawnMoving
            ? 'Đang Đi...'
            : isBankrupt
            ? 'Đã Phá Sản'
            : canRollAgain && hasRolledThisTurn
            ? 'Đổ Tiếp (Đôi)'
            : 'Đổ Xúc Xắc'}
        </span>
      </button>

      <div className="h-6 w-px bg-slate-700/80" aria-hidden="true" />

      {/* Nút Quản Lý BĐS (gộp Tài Sản & Xây Dựng) với hiệu ứng nổi 3D và viền vàng */}
      <button
        type="button"
        onClick={handleOpenManageProperty}
        disabled={isBankrupt}
        className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-slate-100 hover:text-white bg-slate-800/90 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-amber-500/30 hover:border-amber-400/60 shadow-[0_4px_0_0_#020617] active:shadow-none active:translate-y-[3px] transition-all text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        aria-label="Quản lý và nâng cấp bất động sản"
      >
        <span aria-hidden="true">🏛️</span>
        <span className="hidden sm:inline">Quản Lý BĐS</span>
      </button>

      {/* Nút Đàm Phán P2P với hiệu ứng nổi 3D và viền vàng */}
      <button
        type="button"
        onClick={handleOpenTrade}
        disabled={isBankrupt}
        className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-slate-100 hover:text-white bg-slate-800/90 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-amber-500/30 hover:border-amber-400/60 shadow-[0_4px_0_0_#020617] active:shadow-none active:translate-y-[3px] transition-all text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
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
        title={
          isInsolvent
            ? 'Bạn đang bị âm tiền, hãy thế chấp/hạ cấp BĐS hoặc phá sản trước khi kết thúc lượt'
            : canRollAgain
            ? 'Bạn vừa đổ đôi, hãy tung xúc xắc tiếp để hoàn thành lượt'
            : undefined
        }
        className={`min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl border transition-all text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
          isEndDisabled
            ? isInsolvent
              ? 'bg-rose-950/40 text-rose-400 border-rose-800/80 cursor-not-allowed shadow-[0_0_12px_rgba(225,29,72,0.3)]'
              : 'bg-slate-800/40 text-slate-500 border-slate-800 cursor-not-allowed'
            : 'text-amber-300 hover:text-amber-200 bg-amber-950/40 hover:bg-amber-900/50 border-amber-600/50 shadow-[0_4px_0_0_#451a03] active:shadow-none active:translate-y-[3px]'
        }`}
        aria-label="Kết thúc lượt"
      >
        <span aria-hidden="true">⏭️</span>
        <span className="hidden sm:inline">Hết Lượt</span>
      </button>
    </nav>
  );
}
