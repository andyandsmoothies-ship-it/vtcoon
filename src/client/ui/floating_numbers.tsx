// [UI-S05/MSS][IMP-117][IMP-123] FloatingNumbers Component — Contextual Financial Toasts & Milestone Banners
// Responsive layout for Desktop (top-right, max 2) & Mobile (top-center, max 1) without obscuring 3D board
import React from 'react';
import {
  useGameStore,
  FloatingTextType,
  type FloatingTextItem,
  type PlayerHudInfo,
  type FloatingActionType,
} from '../store/game_store.js';
import { getCellName } from '../network/activity_property_tracker.js';

export function resolveActionIcon(actionType?: string, isReward?: boolean): string {
  switch (actionType) {
    case 'buy': return '🏷️';
    case 'upgrade': return '🏗️';
    case 'rent_pay': return '🏠';
    case 'rent_receive': return '💰';
    case 'salary': return '🚩';
    case 'tax': return '🏛️';
    case 'bail': return '⚖️';
    case 'monopoly': return '👑';
    case 'debt_relief': return '🎉';
    case 'stimulus': return '📈';
    case 'chance': return '⚡';
    case 'market': return '🎴';
    case 'auction_win': return '🔨';
    case 'hose': return '📊';
    case 'teleport': return '✈️';
    case 'audit_jail': return '🚨';
    default: return isReward ? '✨' : '💸';
  }
}

function formatRentPay(item: FloatingTextItem): string {
  let cellName = item.cellIndex !== undefined ? getCellName(item.cellIndex) : '';
  if (!cellName && item.title) {
    cellName = item.title.replace(/^Tiền\s+thuê\s*/i, '').trim();
  }
  if (!cellName) {
    cellName = 'BĐS';
  }
  const partner = item.targetPlayerName ? ` cho ${item.targetPlayerName}` : '';
  return `Trả thuê ${cellName}${partner}`;
}

function formatRentReceive(item: FloatingTextItem): string {
  let cellName = item.cellIndex !== undefined ? getCellName(item.cellIndex) : '';
  if (!cellName && item.title) {
    cellName = item.title.replace(/^Thu\s+(?:tiền\s+)?thuê\s*/i, '').trim();
  }
  if (!cellName) {
    cellName = 'BĐS';
  }
  const partner = item.targetPlayerName ? ` từ ${item.targetPlayerName}` : '';
  return `Thu thuê ${cellName}${partner}`;
}

function formatBuy(item: FloatingTextItem): string {
  let cellName = item.cellIndex !== undefined ? getCellName(item.cellIndex) : '';
  if (!cellName && item.title) {
    cellName = item.title.replace(/^Mua\s+/i, '').trim();
  }
  if (!cellName) {
    cellName = 'BĐS';
  }
  return `Mua sở hữu ${cellName}`;
}

function formatUpgrade(item: FloatingTextItem): string {
  const levelStr = item.title?.match(/(C[1-3]|Nhà Phố|Khách Sạn|Biệt Thự)/i)?.[0] || 'C1';
  let cellName = item.cellIndex !== undefined ? getCellName(item.cellIndex) : '';
  if (!cellName && item.title) {
    cellName = item.title
      .replace(/^Nâng\s+(?:cấp\s+)?/i, '')
      .replace(/(C[1-3]|\((?:Nhà Phố|Khách Sạn|Biệt Thự)\)|Nhà Phố|Khách Sạn|Biệt Thự)/gi, '')
      .replace(/^(?:tại|ở)\s+/i, '')
      .trim();
  }
  if (!cellName) {
    cellName = 'công trình';
  }
  return `Xây ${levelStr} ${cellName}`;
}

function formatTax(item: FloatingTextItem): string {
  if (item.title && /Lệ Phí|Thuế/i.test(item.title)) {
    const cleanTitle = item.title.replace(/^Nộp\s+/i, '').trim();
    return `Nộp ${cleanTitle}`;
  }
  return 'Nộp Lệ Phí Đất Đai (Ô 04)';
}

function formatAuction(item: FloatingTextItem): string {
  let cellName = item.cellIndex !== undefined ? getCellName(item.cellIndex) : '';
  if (!cellName && item.title) {
    cellName = item.title.replace(/^(?:Thắng\s+)?Đấu\s+Giá\s+/i, '').trim();
  }
  if (!cellName) {
    cellName = 'BĐS';
  }
  return `Thắng đấu giá ${cellName}`;
}

const ACTION_REASON_FORMATTERS: Partial<Record<FloatingActionType, (item: FloatingTextItem) => string>> = {
  rent_pay: formatRentPay,
  rent_receive: formatRentReceive,
  buy: formatBuy,
  upgrade: formatUpgrade,
  salary: () => 'Thưởng lương qua ô Khởi Hành',
  tax: formatTax,
  bail: () => 'Phí bảo lãnh Trạm Kiểm Toán',
  auction_win: formatAuction,
  stimulus: () => 'Nhận trợ cấp Quỹ Kho Bạc',
  hose: (item) => (item.title ? `Giao dịch HOSE: ${item.title}` : 'Giao dịch sàn chứng khoán HOSE'),
  chance: (item) => `Cơ Hội: ${item.title?.replace(/^Cơ\s+Hội:\s*/i, '').trim() || 'Phiếu Cơ Hội'}`,
  market: (item) => `Thị Trường: ${item.title?.replace(/^Thị\s+Trường:\s*/i, '').trim() || 'Phiếu Thị Trường'}`,
  monopoly: (item) => item.text || 'Độc quyền nhóm màu!',
  debt_relief: () => 'Thoát vỡ nợ thành công!',
  teleport: (item) => `Dịch chuyển: ${item.title || 'Di chuyển đặc biệt'}`,
  audit_jail: () => 'Vào Trạm Kiểm Toán',
};

export function resolveFriendlyReason(item: FloatingTextItem, _player?: PlayerHudInfo): string {
  const formatter = item.actionType ? ACTION_REASON_FORMATTERS[item.actionType] : undefined;
  if (formatter) {
    return formatter(item);
  }
  return item.title || (item.text ? `Giao dịch ${item.text}` : 'Biến động tài chính');
}

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

/**
 * Formats player names for compact popup pills, stripping bot personality tags like (Aggressive).
 */
export function formatShortPlayerName(name: string): string {
  if (!name) return '';
  return name.replace(/\s*\((?:Aggressive|Cautious|Balanced|Bot)\)/i, '').trim();
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
    'pointer-events-auto cursor-pointer flex items-center gap-2.5 sm:gap-3 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl border-2',
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
          <span className="truncate min-w-0 text-[11px] sm:text-xs text-slate-600 font-semibold leading-tight mt-0.5">
            {descText}
          </span>
        )}
      </div>
    </div>
  );
}

export function FloatingBadge({ item }: { readonly item: FloatingTextItem }): React.ReactElement {
  const isReward = item.type === FloatingTextType.Reward;
  const isSSR = typeof window === 'undefined';
  const storePlayersInfo = useGameStore((state) => state.playersInfo);
  const playersInfo = isSSR ? useGameStore.getState().playersInfo : storePlayersInfo;
  const player = playersInfo[item.playerId];
  const icon = resolveActionIcon(item.actionType, isReward);

  if (
    item.actionType === 'monopoly' ||
    item.actionType === 'debt_relief' ||
    item.actionType === 'chance' ||
    item.actionType === 'market'
  ) {
    return <MilestoneBanner item={item} />;
  }

  const reason = resolveFriendlyReason(item, player);

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="contextual-transaction-badge"
      className="pointer-events-none flex flex-col gap-1 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl border-2 border-slate-900 bg-[#FFFDF8] select-none shadow-[0_3px_0_0_#0f172a] animate-in fade-in duration-200 max-w-[92vw] sm:max-w-none"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className="text-base sm:text-lg shrink-0" aria-hidden="true">
            {icon}
          </span>
          {player && (
            <span
              className="text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded-full text-white shadow-xs shrink-0 truncate max-w-[110px] sm:max-w-[150px]"
              style={{ backgroundColor: player.tokenColor || '#64748B' }}
            >
              {formatShortPlayerName(player.name)}
            </span>
          )}
        </div>
        <span
          data-testid="floating-amount-pill"
          className={`px-2.5 py-0.5 rounded-xl text-xs sm:text-sm font-extrabold tabular-nums shrink-0 border ${
            isReward
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
              : 'bg-rose-50 text-rose-700 border-rose-300'
          }`}
        >
          {item.text}
        </span>
      </div>
      <div
        className="text-xs sm:text-sm font-bold text-slate-800 text-left pl-6 sm:pl-7 leading-snug"
        title={item.title ?? reason}
      >
        {reason}
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

  if (floatingTexts.length === 0 || activeModal !== null) {
    return null;
  }

  // Tách riêng milestone nếu có
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
    activeMarketCount >= 2 ? 'top-[15.5rem]' : activeMarketCount === 1 ? 'top-[10.5rem]' : 'top-20';

  return (
    <aside
      id="vtcoon-floating-numbers"
      data-testid="floating-numbers-overlay"
      aria-label="Thông báo biến động tài chính"
      className="pointer-events-none select-none z-30"
    >
      <div className={"fixed " + stackTopClass + " left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 w-full max-w-[92vw] md:max-w-md px-2 z-30 pointer-events-none"}>
        {latestMilestone && (
          <div data-testid="milestone-banner-container" className="w-full flex justify-center pointer-events-auto">
            <MilestoneBanner item={latestMilestone} />
          </div>
        )}
        {regularTexts.slice(-2).map((item, idx) => (
          <div key={item.id} className={"w-full flex justify-center " + (idx === 0 && regularTexts.length > 1 ? "hidden md:flex" : "flex")}>
            <FloatingBadge item={item} />
          </div>
        ))}
      </div>
    </aside>
  );
}
