import React, { useState, useEffect } from 'react';
import { useGameStore, type GameState } from '../store/game_store';
import {
  isRollActionDisabled,
  isEndTurnDisabled,
  resolveManagePropertyTarget,
  resolveBotPacingStatus,
  resolveEndTurnButtonLabel,
  shouldShowSkipTurnNotice,
  resolveActionDockNotice,
} from './ui_helpers';
import { BOARD_CONFIG, CellType } from '../../domain/board_config';
import { MarketCardId } from '../../domain/event_card_types';

export interface ActionDockProps {
  readonly onRollDice?: () => void;
  readonly onOpenProperties?: () => void;
  readonly onOpenTrade?: () => void;
  readonly onOpenUpgrade?: () => void;
  readonly onOpenManageProperty?: () => void;
  readonly onEndTurn?: () => void;
  readonly onBailOut?: () => void;
  readonly localPlayerId?: string;
  readonly isPawnMoving?: boolean;
  readonly canRollAgain?: boolean;
  readonly hasRolledThisTurn?: boolean;
  readonly isMyTurn?: boolean;
  readonly ssrState?: GameState | null;
  readonly isTradeFrozen?: boolean;
  readonly onOpenMasterplan?: () => void;
}

export function ActionDock({
  onRollDice,
  onOpenProperties,
  onOpenTrade,
  onOpenUpgrade,
  onOpenManageProperty,
  onEndTurn,
  onBailOut,
  localPlayerId,
  isPawnMoving: isPawnMovingProp,
  canRollAgain: canRollAgainProp,
  hasRolledThisTurn: hasRolledThisTurnProp,
  isMyTurn: isMyTurnProp,
  ssrState: ssrStateProp,
  isTradeFrozen: isTradeFrozenProp,
  onOpenMasterplan,
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
  const turnPhaseStore = useGameStore((state) => state.turnPhase);
  const storeIsHeatmapActive = useGameStore((state) => state.isHeatmapActive);
  const toggleHeatmap = useGameStore((state) => state.toggleHeatmap);

  const isSSR = typeof window === 'undefined';
  const ssrState = ssrStateProp ?? (isSSR ? useGameStore.getState() : null);

  const isRolling = ssrState ? ssrState.isRolling : isRollingStore;
  const activePawnAnimation = ssrState ? ssrState.activePawnAnimation : activePawnAnimationStore;
  const pawnAnimationQueue = ssrState ? ssrState.pawnAnimationQueue : pawnAnimationQueueStore;
  const currentTurnPlayerId = ssrState ? ssrState.currentTurnPlayerId : currentTurnPlayerIdStore;
  const playersInfo = ssrState ? ssrState.playersInfo : playersInfoStore;
  const dice = ssrState ? ssrState.dice : diceStore;
  const storeHasRolledThisTurn = ssrState ? ssrState.hasRolledThisTurn : storeHasRolledThisTurnStore;
  const playerPositions = ssrState ? ssrState.playerPositions : playerPositionsStore;
  const turnPhase = ssrState ? ssrState.turnPhase : turnPhaseStore;
  const isHeatmapActive = ssrState ? (ssrState.isHeatmapActive ?? false) : storeIsHeatmapActive;
  const storeActiveModifiers = useGameStore((state) => state.activeModifiers);
  const activeModifiers = ssrState ? (ssrState.activeModifiers ?? []) : (isSSR ? useGameStore.getState().activeModifiers : storeActiveModifiers);
  const isTradeFrozen = isTradeFrozenProp ??
    (activeModifiers ?? []).some(
      (m) => m.type === MarketCardId.MC_FREEZE_TRADE && m.remainingRounds > 0
    );

  const queueHasTasks = Boolean(pawnAnimationQueue && pawnAnimationQueue.length > 0);
  const actingPlayerId = localPlayerId ?? currentTurnPlayerId;
  const isMyTurn = isMyTurnProp !== undefined ? isMyTurnProp : (!localPlayerId || currentTurnPlayerId === localPlayerId);
  const isPawnMoving = (isPawnMovingProp ?? Boolean(activePawnAnimation?.isAnimating)) || queueHasTasks;
  const actingPlayer = actingPlayerId ? playersInfo[actingPlayerId] : undefined;
  const isBankrupt = Boolean(actingPlayer?.bankrupt);
  const inAudit = Boolean(actingPlayer?.inAudit);
  const isInsolvent = Boolean(actingPlayer && actingPlayer.balance < 0);
  const storeConsecutiveDoubles = actingPlayer ? actingPlayer.consecutiveDoubles : undefined;
  const storeCanRollAgain = (
    storeConsecutiveDoubles !== undefined
      ? storeConsecutiveDoubles > 0
      : (dice[0] === dice[1] && dice[0] > 0)
  ) && !inAudit && !actingPlayer?.skipNextTurn;
  const canRollAgain = canRollAgainProp !== undefined ? canRollAgainProp : storeCanRollAgain;
  const hasRolledThisTurn = hasRolledThisTurnProp !== undefined ? hasRolledThisTurnProp : storeHasRolledThisTurn;
  const [isRollPending, setIsRollPending] = useState(false);
  const botPacing = resolveBotPacingStatus(currentTurnPlayerId, localPlayerId ?? 'p1', playersInfo, turnPhase);

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
    inAudit,
    turnPhase,
  });

  const isEndDisabled = isEndTurnDisabled({
    isRolling,
    isPawnMoving,
    isMyTurn,
    isBankrupt,
    hasRolledThisTurn,
    canRollAgain,
    isInsolvent,
    inAudit,
    turnPhase,
  });

  const handleRollClick = () => {
    if (isRollDisabled || isRollPending) return;
    setIsRollPending(true);
    onRollDice?.();
    setTimeout(() => {
      setIsRollPending(false);
    }, 1500);
  };

  const currentPos = actingPlayerId ? (playerPositions[actingPlayerId] ?? 0) : 0;
  const currentCell = BOARD_CONFIG[currentPos];
  const isPropertyCell = currentCell && (currentCell.type === CellType.Property || currentCell.type === CellType.Railroad);
  const isOwnedByAnyone = Object.values(playersInfo).some((p) => p.ownedProperties?.includes(currentPos));
  const isStandingOnBuyable = Boolean(isMyTurn && hasRolledThisTurn && isPropertyCell && !isOwnedByAnyone);

  const handleOpenManageProperty = () => {
    if (onOpenManageProperty) {
      onOpenManageProperty();
    } else if (onOpenProperties) {
      onOpenProperties();
    } else {
      openModal('portfolio', { playerId: actingPlayerId ?? undefined });
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

  const isSkippedTurn = Boolean(isMyTurn && turnPhase === 'PropertyManagement' && !hasRolledThisTurn && !inAudit);
  const isGlowActive = (isMyTurn && !isRollDisabled) || isSkippedTurn;
  const actionDockNotice = resolveActionDockNotice({
    isMyTurn,
    isInsolvent,
    inAudit,
    auditTurnsLeft: actingPlayer?.auditTurnsLeft,
    balance: actingPlayer?.balance,
    turnPhase,
    hasRolledThisTurn,
    isSkippedTurn: Boolean(actingPlayer?.skipNextTurn),
    botPacing,
  });

  return (
    <nav
      className="relative pointer-events-auto flex items-center gap-2 md:gap-3 bg-[#FFFDF8] border-2 border-slate-900 shadow-[0_4px_0_0_#0f172a] rounded-2xl p-2 px-4"
      aria-label="Thanh điều khiển tác vụ"
    >
      {/* Chip Thông Báo Ngữ Cảnh Độc Quyền (Actionable Guidance Chip) */}
      {actionDockNotice && (
        <div
          data-testid={actionDockNotice.type === 'bot_pacing' ? 'bot-pacing-chip' : `${actionDockNotice.type === 'skip_turn' ? 'skip-turn-notice-chip' : `${actionDockNotice.type}-notice-chip`}`}
          className={`absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-md animate-pulse select-none ${
            actionDockNotice.tone === 'error'
              ? 'bg-rose-950 text-rose-300 border border-rose-500/60'
              : actionDockNotice.tone === 'warning'
              ? 'bg-amber-950 text-amber-300 border border-amber-500/60'
              : 'bg-slate-850 text-amber-300 border border-amber-500/40'
          }`}
        >
          <span aria-hidden="true">{actionDockNotice.icon}</span>
          <span className="sm:hidden">{actionDockNotice.mobileText}</span>
          <span className="hidden sm:inline">{actionDockNotice.desktopText}</span>
        </div>
      )}

      {/* Nút Đổ Xúc Xắc (CTA chính mang sắc đỏ/cam rực rỡ phong cách Retropoly với viền vàng & nút bấm nổi 3D) */}
      <button
        type="button"
        onClick={handleRollClick}
        disabled={isRollDisabled}
        data-testid="roll-dice-btn"
        className={`min-h-[44px] flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-white shadow-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 ${
          isRollDisabled
            ? 'bg-slate-200 text-slate-600 cursor-not-allowed border-2 border-slate-400 shadow-none'
            : `bg-gradient-to-b from-rose-500 via-red-600 to-red-700 hover:from-rose-400 hover:to-red-600 border-2 border-emerald-800 shadow-[0_4px_0_0_#064e3b] active:shadow-none active:translate-y-[3px] ${
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
            : (actingPlayer?.extraTurns ?? 0) > 0
            ? (
              <>
                <span className="sm:hidden">Đổ Tiếp</span>
                <span className="hidden sm:inline">Đổ Tiếp (+1 Lượt)</span>
              </>
            )
            : canRollAgain && hasRolledThisTurn
            ? (
              <>
                <span className="sm:hidden">Đổ Tiếp</span>
                <span className="hidden sm:inline">Đổ Tiếp (Đôi)</span>
              </>
            )
            : 'Đổ Xúc Xắc'}
        </span>
      </button>

      <div className="h-6 w-px bg-slate-300 rounded-full" aria-hidden="true" />

      {/* Nút Nộp Bảo Lãnh Kiểm Toán khi đang ở trong Trạm Kiểm Toán */}
      {inAudit && isMyTurn && !isBankrupt && (
        <button
          type="button"
          onClick={() => onBailOut?.()}
          disabled={Boolean((actingPlayer?.balance ?? 0) < 500)}
          className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-white font-bold bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-amber-800 shadow-[0_4px_0_0_#0f172a] active:shadow-none active:translate-y-[3px] transition-all text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          aria-label="Nộp 500 Tr. bảo lãnh kiểm toán để rời trạm ngay"
        >
          <span aria-hidden="true">⚖️</span>
          <span>Bảo Lãnh (500 Tr.)</span>
          <span className="text-[11px] bg-amber-900/40 px-1.5 py-0.5 rounded font-mono">
            {`${actingPlayer?.auditTurnsLeft ?? 0} lượt`}
          </span>
        </button>
      )}

      {/* Nút Mua Đất nhanh khi đang đứng trên ô chưa có chủ trong lượt mình */}
      {isStandingOnBuyable && (
        <button
          type="button"
          onClick={isTradeFrozen ? undefined : () => openModal('deed', { cellIndex: currentPos, canBuy: true })}
          disabled={isTradeFrozen}
          className={`min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-bold border-2 transition-all text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
            isTradeFrozen
              ? 'bg-slate-200 text-slate-500 border-slate-400 cursor-not-allowed'
              : 'text-white bg-amber-500 hover:bg-amber-600 border-amber-700 shadow-[0_4px_0_0_#0f172a] active:shadow-none active:translate-y-[3px] animate-pulse'
          }`}
          aria-label={isTradeFrozen ? `Thị trường đóng băng (#${currentPos})` : `Mua ô đất số ${currentPos}`}
        >
          <span aria-hidden="true">{isTradeFrozen ? '🔒' : '🏷️'}</span>
          <span>{isTradeFrozen ? `🔒 Đóng Băng (#${currentPos})` : `Mua Đất (#${currentPos})`}</span>
        </button>
      )}

      {/* Nút Quản Lý BĐS (gộp Tài Sản & Xây Dựng) với hiệu ứng nổi 3D và viền xanh */}
      <button
        type="button"
        aria-label="Quản lý và nâng cấp bất động sản"
        onClick={handleOpenManageProperty}
        disabled={isBankrupt}
        className="min-w-[44px] min-h-[44px] flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold border-2 border-blue-800 shadow-[0_4px_0_0_#0f172a] active:translate-y-[3px] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      >
        <span aria-hidden="true">🏛️</span>
        <span className="hidden sm:inline">Quản Lý BĐS</span>
      </button>

      {/* Nút Đàm Phán P2P với hiệu ứng nổi 3D và viền cam */}
      <button
        type="button"
        aria-label="Đàm phán thương lượng"
        onClick={handleOpenTrade}
        disabled={isBankrupt || isTradeFrozen}
        title={isTradeFrozen ? 'Thị trường đang đóng băng giao dịch' : undefined}
        className={`min-w-[44px] min-h-[44px] flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-2xl font-bold border-2 transition-all text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
          isBankrupt || isTradeFrozen
            ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed opacity-50'
            : 'bg-amber-500 hover:bg-amber-600 text-white border-amber-700 shadow-[0_4px_0_0_#0f172a] active:translate-y-[3px]'
        }`}
      >
        <span aria-hidden="true">🤝</span>
        <span className="hidden sm:inline">Đàm Phán</span>
      </button>

      {/* Nút Sa Bàn & Bản Đồ Quy Hoạch Đô Thị */}
      <button
        type="button"
        data-testid="heatmap-toggle-btn"
        aria-label="Quy Hoạch"
        title="Bản Đồ Quy Hoạch Đô Thị"
        onClick={() => {
          toggleHeatmap?.();
          if (onOpenMasterplan) {
            onOpenMasterplan();
          } else {
            useGameStore.getState().openModal('masterplan', {});
          }
        }}
        className={`min-w-[44px] min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-2xl bg-[#F7F2E7] hover:bg-amber-100 text-slate-900 font-bold border-2 border-slate-900 shadow-[0_4px_0_0_#0f172a] active:translate-y-[3px] transition-all text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
          isHeatmapActive ? 'ring-2 ring-amber-400 bg-amber-100 shadow-[0_0_12px_rgba(245,158,11,0.5)]' : ''
        }`}
      >
        <span aria-hidden="true">🗺️</span>
        <span className="hidden sm:inline">Quy Hoạch</span>
      </button>

      {/* Nút Kết Thúc Lượt với hiệu ứng nổi 3D */}
      <button
        type="button"
        aria-label="Kết thúc lượt"
        onClick={onEndTurn}
        disabled={isEndDisabled}
        title={
          isInsolvent
            ? 'Bạn đang bị âm tiền, hãy thế chấp/hạ cấp BĐS hoặc phá sản trước khi kết thúc lượt'
            : canRollAgain
            ? 'Bạn vừa đổ đôi, hãy tung xúc xắc tiếp để hoàn thành lượt'
            : undefined
        }
        className={`min-w-[44px] min-h-[44px] flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-2xl transition-all text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
          isEndDisabled
            ? isInsolvent
              ? 'bg-rose-100 text-rose-500 border-2 border-rose-300 cursor-not-allowed'
              : 'bg-slate-200 text-slate-400 border-2 border-slate-300 cursor-not-allowed'
            : `bg-emerald-600 hover:bg-emerald-700 text-white font-bold border-2 border-emerald-800 shadow-[0_4px_0_0_#0f172a] active:translate-y-[3px] ${
                isSkippedTurn ? 'ring-4 ring-amber-400/80 shadow-[0_0_24px_rgba(245,158,11,0.55)] animate-pulse' : ''
              }`
        }`}
      >
        <span aria-hidden="true">⏭️</span>
        <span className="hidden sm:inline">
          {resolveEndTurnButtonLabel(turnPhase, hasRolledThisTurn, inAudit)}
        </span>
      </button>
    </nav>
  );
}
