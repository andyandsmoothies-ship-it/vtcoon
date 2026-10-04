// [UI-S05/MSS][IMP-117][IMP-123][IMP-194][IMP-201] FloatingNumbers Component — Contextual Financial Toasts & Milestone Banners
// Responsive layout for Desktop (top-right, max 2) & Mobile (bottom-center, max 1) without obscuring 3D board
import React from 'react';
import {
  useGameStore,
  type FloatingTextItem,
} from '../store/game_store.js';
import { useLobbyStore } from '../store/lobby_store.js';
import { deduplicateFloatingTexts } from './notification_deduplicator.js';
import { formatShortPlayerName } from './ui_helpers.js';
import {
  resolveTransactionNarrative,
  resolveFriendlyReason,
  resolveActionIcon,
  resolveCellName,
} from './transaction_narrative.js';

export { formatShortPlayerName, resolveFriendlyReason, resolveActionIcon, resolveCellName };

/**
 * Strips redundant thematic prefix before colon (e.g. "Quy hoạch trục đô thị mới: ")
 * to present punchy, actionable financial summaries without truncation.
 */
export function cleanEventDescription(text?: string | null): string {
  if (!text) return '';
  const trimmed = text.trim();
  const colonIndex = trimmed.indexOf(': ');
  if (colonIndex !== -1 && colonIndex < trimmed.length - 2) {
    return trimmed.slice(colonIndex + 2).trim();
  }
  return trimmed;
}

export function MilestoneBanner({ item }: { readonly item: FloatingTextItem }): React.ReactElement {
  const isSSR = typeof window === 'undefined';
  const storePlayersInfo = useGameStore((state) => state.playersInfo);
  const playersInfo = isSSR ? useGameStore.getState().playersInfo : storePlayersInfo;
  const player = playersInfo[item.playerId];
  const icon = resolveActionIcon(item.actionType, true);

  const isEventCard = item.actionType === 'chance' || item.actionType === 'market';
  const testId = isEventCard ? 'event-card-notification-banner' : 'milestone-celebration-banner';
  const borderShadowStyle = item.actionType === 'market'
    ? 'border-cyan-500/80 shadow-md shadow-cyan-900/15'
    : item.actionType === 'bankrupt'
    ? 'border-rose-500/80 shadow-md shadow-rose-900/15'
    : 'border-amber-500/80 shadow-md shadow-amber-900/15';

  const bannerClasses = [
    'pointer-events-auto cursor-pointer flex items-center gap-2.5 sm:gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl border-2',
    'bg-[#FFFDF8] text-slate-900 select-none animate-in fade-in slide-in-from-bottom-3 md:slide-in-from-top-3 duration-200',
    'max-w-[88vw] sm:max-w-[380px]',
    borderShadowStyle,
  ].join(' ');

  const titleText =
    item.title ||
    (isEventCard ? (item.actionType === 'market' ? 'Sự Kiện Thị Trường' : 'Thẻ Cơ Hội') : item.text);
  const rawDescText = item.title ? item.text : null;
  const descText = rawDescText ? cleanEventDescription(rawDescText) : null;

  const handleDismiss = () => {
    useGameStore.getState().removeFloatingText(item.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDismiss();
    }
  };

  return (
    <div
      role="status"
      tabIndex={0}
      aria-label="Thông báo sự kiện: nhấn để đóng"
      aria-live="polite"
      data-testid={testId}
      className={bannerClasses}
      onClick={handleDismiss}
      onKeyDown={handleKeyDown}
    >
      <span className="text-2xl shrink-0 truncate" aria-hidden="true">{icon}</span>
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap min-w-0">
          {player && (
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white shadow-xs shrink-0 truncate max-w-[120px] sm:max-w-[150px]"
              style={{ backgroundColor: player.tokenColor || '#64748B' }}
            >
              {formatShortPlayerName(player.name)}
            </span>
          )}
          <span
            data-testid="milestone-card-title"
            className="font-extrabold text-xs sm:text-sm text-slate-900 tracking-tight min-w-0 flex-1 truncate"
            title={titleText}
          >
            {titleText}
          </span>
        </div>
        {descText && (
          <span className="truncate min-w-0 text-[11px] sm:text-xs text-slate-600 font-semibold leading-tight mt-0.5 pt-0.5 pb-0.5">
            {descText}
          </span>
        )}
      </div>
    </div>
  );
}

export function FloatingBadge({ item }: { readonly item: FloatingTextItem }): React.ReactElement {
  const isSSR = typeof window === 'undefined';
  const storePlayersInfo = useGameStore((state) => state.playersInfo);
  const playersInfo = isSSR ? useGameStore.getState().playersInfo : storePlayersInfo;
  const player = playersInfo[item.playerId];

  if (
    item.actionType === 'monopoly' ||
    item.actionType === 'debt_relief' ||
    item.actionType === 'chance' ||
    item.actionType === 'market' ||
    item.actionType === 'bankrupt' ||
    item.actionType === 'transit'
  ) {
    return <MilestoneBanner item={item} />;
  }

  const storeMyPlayerId = useLobbyStore((state) => state.myPlayerId);
  const myPlayerId = isSSR ? useLobbyStore.getState().myPlayerId : storeMyPlayerId;
  const narrative = resolveTransactionNarrative(item, player, playersInfo, myPlayerId);

  const handleDismiss = () => {
    useGameStore.getState().removeFloatingText(item.id);
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDismiss();
    }
  };

  return (
    <div
      role="status"
      tabIndex={0}
      aria-label={`${narrative.category}: nhấn để đóng`}
      aria-live="polite"
      data-testid="contextual-transaction-badge"
      onClick={handleDismiss}
      onKeyDown={handleKeyDown}
      className="pointer-events-auto cursor-pointer flex flex-col gap-1 px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-2xl border border-slate-300 bg-[#FFFDF8] select-none shadow-md shadow-slate-900/10 active:scale-95 animate-in fade-in duration-200 w-full min-w-0"
    >
      {/* Tầng 1: Header định danh danh mục & nút đóng */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-0.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm shrink-0" aria-hidden="true">{narrative.icon}</span>
          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500 truncate">
            {narrative.category}
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="text-slate-400 hover:text-slate-700 text-xs font-bold leading-none min-w-[24px] min-h-[24px] flex items-center justify-center p-1 rounded-lg hover:bg-slate-200/50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          aria-label="Đóng thông báo"
        >
          ✕
        </button>
      </div>

      {/* Tầng 2 (Dòng 1): Lý do / Công thức rõ nghĩa, súc tích (chỉ hiển thị khi có công thức thực tế) */}
      {Boolean(narrative.formula?.trim()) ? (
        <div
          data-testid="transaction-formula-line"
          className="text-[11px] sm:text-xs font-medium text-slate-600 text-left leading-tight truncate flex items-center gap-1"
          title={narrative.formula}
        >
          <span className="text-slate-400 text-[10px]" aria-hidden="true">📐</span>
          <span className="truncate">{narrative.formula}</span>
        </div>
      ) : null}

      {/* Tầng 3 (Dòng 2): Biến động tài chính & Dòng tiền tự nhiên */}
      <div
        data-testid="transaction-flow-line"
        className="text-xs sm:text-[13px] font-semibold text-slate-800 text-left leading-snug break-words"
        title={item.title}
      >
        <span className="font-bold text-slate-900">{narrative.subject}</span>{' '}
        <span className="text-slate-600 font-medium">{narrative.verb}</span>{' '}
        <span
          data-testid="floating-amount-pill"
          title={item.text}
          className={`px-1.5 py-0.5 rounded-lg text-xs font-extrabold font-mono tabular-nums border inline-block ${
            narrative.isPositive
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
              : 'bg-rose-50 text-rose-700 border-rose-300'
          }`}
        >
          {item.text}
        </span>{' '}
        <span className="font-bold text-slate-800">{narrative.target}</span>
      </div>
    </div>
  );
}

export function FloatingNumbersOverlay(): React.ReactElement | null {
  const isSSR = typeof window === 'undefined';
  const storeFloatingTexts = useGameStore((state) => state.floatingTexts);
  const floatingTexts = isSSR ? useGameStore.getState().floatingTexts : storeFloatingTexts;

  const storeActiveModal = useGameStore((state) => state.activeModal);
  const activeModal = isSSR ? useGameStore.getState().activeModal : storeActiveModal;

  const storeModifiers = useGameStore((state) => state.activeModifiers);
  const activeModifiers = isSSR ? useGameStore.getState().activeModifiers : storeModifiers;
  const activeMarketCount = (activeModifiers ?? []).filter((m) => Boolean(m && m.remainingRounds > 0)).length;

  const storeMyPlayerId = useLobbyStore((state) => state.myPlayerId);
  const myPlayerId = isSSR ? useLobbyStore.getState().myPlayerId : storeMyPlayerId;

  if (floatingTexts.length === 0 || activeModal !== null) {
    return null;
  }

  const isMilestone = (action?: string) =>
    action === 'monopoly' || action === 'debt_relief' || action === 'chance' || action === 'market' || action === 'bankrupt' || action === 'transit';
  const latestMilestone = [...floatingTexts].reverse().find((t) => isMilestone(t.actionType));
  const regularTexts = floatingTexts.filter((t) => !isMilestone(t.actionType));

  const stackTopClass =
    activeMarketCount >= 3
      ? 'bottom-[calc(8rem+env(safe-area-inset-bottom))] md:bottom-auto md:top-44'
      : activeMarketCount === 2
      ? 'bottom-[calc(8rem+env(safe-area-inset-bottom))] md:bottom-auto md:top-36'
      : activeMarketCount >= 1
      ? 'bottom-[calc(8rem+env(safe-area-inset-bottom))] md:bottom-auto md:top-28'
      : 'bottom-[calc(8rem+env(safe-area-inset-bottom))] md:bottom-auto md:top-20';

  const deduplicated = deduplicateFloatingTexts(regularTexts, myPlayerId);
  const recentTwo = deduplicated.slice(-2);
  let displayItems = [...recentTwo];
  if (
    displayItems.length === 2 &&
    myPlayerId &&
    displayItems[0]?.playerId === myPlayerId &&
    displayItems[1]?.playerId !== myPlayerId
  ) {
    displayItems = [displayItems[1]!, displayItems[0]!];
  }

  return (
    <aside
      id="vtcoon-floating-numbers"
      data-testid="floating-numbers-overlay"
      aria-label="Thông báo biến động tài chính"
      className="pointer-events-none select-none z-30"
    >
      <div className={"fixed " + stackTopClass + " left-1/2 -translate-x-1/2 md:left-auto md:right-[18.5rem] md:translate-x-0 flex flex-col items-center md:items-end gap-1.5 w-[calc(100vw-1.5rem)] max-w-sm sm:max-w-md md:max-w-md px-1 z-30 pointer-events-none"}>
        {latestMilestone && (
          <div data-testid="milestone-banner-container" className="w-full flex justify-center pointer-events-auto">
            <MilestoneBanner item={latestMilestone} />
          </div>
        )}
        {displayItems.map((item, idx) => {
          const isHiddenOnMobile = Boolean(
            latestMilestone && displayItems.length > 1 && idx < displayItems.length - 1
          );
          return (
            <div
              key={item.id}
              className={
                isHiddenOnMobile
                  ? 'w-full justify-start sm:justify-center hidden md:flex'
                  : 'w-full flex justify-start sm:justify-center'
              }
            >
              <FloatingBadge item={item} />
            </div>
          );
        })}
      </div>
    </aside>
  );
}
