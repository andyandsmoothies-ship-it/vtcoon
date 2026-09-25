// [UI-S05/MSS][IMP-117][IMP-123][IMP-194] FloatingNumbers Component — Contextual Financial Toasts & Milestone Banners
// Responsive layout for Desktop (top-right, max 2) & Mobile (top-center, max 1) without obscuring 3D board
import React from 'react';
import {
  useGameStore,
  type FloatingTextItem,
} from '../store/game_store.js';
import { useLobbyStore } from '../store/lobby_store.js';
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
export function cleanEventDescription(text: string): string {
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
    ? 'border-cyan-500 shadow-[0_4px_0_0_#06b6d4]'
    : 'border-amber-500 shadow-[0_4px_0_0_#d97706]';

  const bannerClasses = [
    'pointer-events-auto cursor-pointer flex items-center gap-2.5 sm:gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl border-2',
    'bg-[#FFFDF8] text-slate-900 select-none animate-in fade-in slide-in-from-top-3 duration-200',
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
    item.actionType === 'market'
  ) {
    return <MilestoneBanner item={item} />;
  }

  const narrative = resolveTransactionNarrative(item, player, playersInfo);

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="contextual-transaction-badge"
      className="pointer-events-none flex flex-col gap-1.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl border-2 border-slate-900 bg-[#FFFDF8] select-none shadow-[0_3px_0_0_#0f172a] animate-in fade-in duration-200 w-full min-w-0 max-w-[82vw] sm:max-w-[340px]"
    >
      {/* Hàng 1: Header định danh danh mục */}
      <div className="flex items-center justify-between gap-1.5 border-b border-slate-200/80 pb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm shrink-0" aria-hidden="true">{narrative.icon}</span>
          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500 truncate">
            {narrative.category}
          </span>
        </div>
        {player && (
          <span
            className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full text-white shadow-xs shrink-0 truncate max-w-[115px]"
            style={{ backgroundColor: player.tokenColor || '#64748B' }}
          >
            {formatShortPlayerName(player.name)}
          </span>
        )}
      </div>

      {/* Hàng 2: Câu văn tự nhiên hoàn chỉnh */}
      <div
        className="text-xs sm:text-[13px] font-semibold text-slate-800 text-left leading-snug break-words line-clamp-2"
        title={item.title}
      >
        <span className="font-bold text-slate-900">{narrative.subject}</span>{' '}
        <span className="text-slate-600 font-medium">{narrative.verb}</span>{' '}
        <span
          data-testid="floating-amount-pill"
          title={item.text}
          className={`px-1.5 py-0.5 rounded-lg text-xs font-extrabold tabular-nums border inline-block ${
            narrative.isPositive
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
              : 'bg-rose-50 text-rose-700 border-rose-300'
          }`}
        >
          {item.text}
        </span>{' '}
        <span className="font-bold text-slate-800">{narrative.target}</span>
        {narrative.detail && (
          <span className="font-normal text-slate-500"> {narrative.detail}</span>
        )}
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

  const latestMilestone = [...floatingTexts].reverse().find(
    (t) =>
      t.actionType === 'monopoly' ||
      t.actionType === 'debt_relief' ||
      t.actionType === 'chance' ||
      t.actionType === 'market',
  );

  const regularTexts = floatingTexts.filter(
    (t) =>
      t.actionType !== 'monopoly' &&
      t.actionType !== 'debt_relief' &&
      t.actionType !== 'chance' &&
      t.actionType !== 'market',
  );

  const stackTopClass =
    activeMarketCount >= 1 ? 'top-28 sm:top-24' : 'top-20';

  const recentTwo = regularTexts.slice(-2);
  let displayItems = [...recentTwo];
  if (displayItems.length === 2 && myPlayerId) {
    const myIdx = displayItems.findIndex((it) => it.playerId === myPlayerId);
    if (myIdx === 0) {
      displayItems = [displayItems[1]!, displayItems[0]!];
    }
  }

  return (
    <aside
      id="vtcoon-floating-numbers"
      data-testid="floating-numbers-overlay"
      aria-label="Thông báo biến động tài chính"
      className="pointer-events-none select-none z-30"
    >
      <div className={"fixed " + stackTopClass + " left-3 sm:left-1/2 translate-x-0 sm:-translate-x-1/2 flex flex-col items-start sm:items-center gap-2 w-auto max-w-[calc(100vw-11.5rem)] md:max-w-md px-1 sm:px-2 z-30 pointer-events-none"}>
        {latestMilestone && (
          <div data-testid="milestone-banner-container" className="w-full flex justify-center pointer-events-auto">
            <MilestoneBanner item={latestMilestone} />
          </div>
        )}
        {displayItems.map((item, idx) => (
          <div
            key={item.id}
            className={
              (latestMilestone || (idx === 0 && displayItems.length > 1))
                ? "w-full flex justify-start sm:justify-center hidden md:flex"
                : "w-full flex justify-start sm:justify-center flex"
            }
          >
            <FloatingBadge item={item} />
          </div>
        ))}
      </div>
    </aside>
  );
}
