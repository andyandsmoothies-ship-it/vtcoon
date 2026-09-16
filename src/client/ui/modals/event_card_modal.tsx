// [UI-S04/MSS] EventCardModal — Vietnamese Chance & Market event card display with neon borders
import React from 'react';
import { formatCurrency } from '../ui_helpers';
import { vi } from '../../../domain/i18n/vi';
import { MarketCardId, ChanceCardId } from '../../../domain/event_card_types';
import { MARKET_CARD_DETAILS, CHANCE_CARD_DETAILS } from '../../../domain/event_card_metadata';

export interface EventCardModalProps {
  readonly cardType: 'chance' | 'market';
  readonly cardId: string;
  readonly title?: string;
  readonly description: string;
  readonly effectDelta?: number;
  readonly targetScope?: string;
  readonly effectDetail?: string;
  readonly duration?: string;
  readonly destination?: string;
  readonly onConfirm?: () => void;
  readonly onClose?: () => void;
}

export function EventCardModal({
  cardType,
  cardId,
  title,
  description,
  effectDelta,
  targetScope,
  effectDetail,
  duration,
  destination,
  onConfirm,
  onClose,
}: EventCardModalProps): React.ReactElement {
  const isMarket = cardType === 'market';
  const badgeColor = isMarket ? 'bg-amber-100 text-amber-900 border-amber-400' : 'bg-sky-100 text-sky-900 border-sky-400';
  const categoryLabel = isMarket ? 'Phiếu Thị Trường (Vĩ Mô)' : 'Phiếu Cơ Hội';
  const iconEmoji = isMarket ? '📰' : '⚡';

  const detail = isMarket
    ? MARKET_CARD_DETAILS[cardId as MarketCardId]
    : CHANCE_CARD_DETAILS[cardId as ChanceCardId];

  const resolvedTitle =
    title ||
    (isMarket
      ? vi.marketCards[cardId as MarketCardId]
      : vi.chanceCards[cardId as ChanceCardId]) ||
    cardId;

  const resolvedDenseScope = targetScope || detail?.targetScope || (isMarket ? 'Toàn bộ thị trường' : 'Người chơi rút thẻ');
  const resolvedTargetScope = targetScope || (isMarket ? 'Toàn bộ thị trường' : (detail?.targetScope || 'Người chơi rút thẻ'));
  const resolvedEffectDetail = effectDetail || detail?.effectDetail || description;
  const resolvedDuration = duration || detail?.duration || (isMarket ? '1 vòng chơi' : 'Tức thì');
  const resolvedDestination = destination || detail?.destination || (isMarket ? 'Toàn thị trường' : 'Kho Bạc Nhà Nước');

  const hasDelta = typeof effectDelta === 'number' && effectDelta !== 0;
  const isPositiveDelta = hasDelta && effectDelta! > 0;

  return (
    <div
      className="w-full max-w-xs sm:max-w-sm bg-[#FFFDF8] border-2 border-slate-900 rounded-2xl shadow-[0_6px_0_0_#0f172a] p-5 flex flex-col items-center text-center relative pointer-events-auto transition-all animate-in fade-in zoom-in-95 duration-200 mt-auto md:my-auto overflow-hidden text-slate-900"
      data-testid="event-card-modal"
    >
      {/* Hoa văn dập chìm Trống Đồng Đông Sơn cổ truyền */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.05] overflow-hidden z-0"
        aria-hidden="true"
      >
        <svg viewBox="0 0 400 400" className="w-[280px] h-[280px] text-slate-900 fill-none stroke-current" strokeWidth="1.5">
          <circle cx="200" cy="200" r="28" fill="currentColor" fillOpacity="0.3" />
          <circle cx="200" cy="200" r="14" fill="currentColor" />
          {Array.from({ length: 14 }).map((_, i) => (
            <polygon
              key={i}
              points="196,160 204,160 200,135"
              fill="currentColor"
              transform={`rotate(${(i * 360) / 14} 200 200)`}
            />
          ))}
          <circle cx="200" cy="200" r="75" strokeDasharray="3 3" />
          <circle cx="200" cy="200" r="95" />
          <circle cx="200" cy="200" r="120" strokeDasharray="6 4" strokeWidth="2" />
          <circle cx="200" cy="200" r="145" />
          <circle cx="200" cy="200" r="165" strokeDasharray="4 2" />
          <circle cx="200" cy="200" r="185" strokeWidth="2.5" />
        </svg>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng thẻ sự kiện"
          className="absolute top-2 right-2 min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-slate-500 hover:text-slate-900 text-xl font-bold rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 z-20 cursor-pointer"
        >
          ✕
        </button>
      )}

      {/* Category Badge */}
      <span className={`relative z-10 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border mb-3 ${badgeColor}`}>
        {categoryLabel}
      </span>

      {/* Card Icon */}
      <div className="relative z-10 w-14 h-14 rounded-2xl bg-[#F7F2E7] border border-slate-300 flex items-center justify-center text-2xl mb-3 shadow-inner">
        <span aria-hidden="true">{iconEmoji}</span>
      </div>

      {/* Card Title */}
      <h2 className="relative z-10 text-base font-black text-slate-900 uppercase tracking-wide mb-2 leading-snug">
        {resolvedTitle}
      </h2>

      {/* Description */}
      <p className="relative z-10 text-xs text-slate-700 mb-3 leading-relaxed px-1 font-medium">
        {description}
      </p>

      {/* Khối Tóm Tắt Tác Động Nhanh 1 Giây — Mobile Only */}
      <div
        data-testid="event-impact-summary"
        className="relative z-10 w-full bg-[#F7F2E7] border border-slate-300 rounded-xl p-3 mb-3 text-left sm:hidden flex flex-col gap-2"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <span>🎯</span>
            <span>{resolvedTargetScope}</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
            <span>⏳</span>
            <span>{resolvedDuration}</span>
          </span>
        </div>
        <p className="text-xs text-slate-800 font-medium leading-relaxed">
          {resolvedEffectDetail}
        </p>
      </div>

      {/* Bảng thông số minh bạch (Impact Specs Matrix) */}
      <div
        data-testid="event-specs-table"
        className="relative z-10 w-full bg-[#F7F2E7] border border-slate-300 rounded-xl p-3 mb-3 text-left hidden sm:flex flex-col gap-2"
      >
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-600 font-bold border-b border-slate-300 pb-1.5 flex items-center justify-between">
          <span>Thông Số Minh Bạch</span>
          <span className="text-amber-800 font-mono font-bold">SSOT §IV</span>
        </div>
        <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-900">
          <div className="flex items-start justify-between gap-2">
            <span className="text-[11px] text-slate-600 font-medium shrink-0">Phạm vi:</span>
            <span className="text-slate-900 font-bold text-right">{resolvedDenseScope}</span>
          </div>
          <div className="flex items-start justify-between gap-2">
            <span className="text-[11px] text-slate-600 font-medium shrink-0">Thời hạn:</span>
            <span className="text-slate-900 font-bold text-right">{resolvedDuration}</span>
          </div>
          <div className="flex flex-col gap-0.5 pt-1 border-t border-slate-300/80">
            <span className="text-[11px] text-slate-600 font-medium">Quy tắc hiệu ứng:</span>
            <span className="text-slate-800 font-normal leading-relaxed">{resolvedEffectDetail}</span>
          </div>
          <div className="flex flex-col gap-0.5 pt-1 border-t border-slate-300/80">
            <span className="text-[11px] text-slate-600 font-medium">Dòng tiền tác động:</span>
            <span className="text-amber-900 font-bold leading-relaxed">{resolvedDestination}</span>
          </div>
        </div>
      </div>

      {/* Cash Delta Badge (nếu có biến động tiền tệ) */}
      {hasDelta && (
        <div
          className={`relative z-10 mb-4 px-3 py-1.5 rounded-xl border text-xs font-bold tracking-wide font-mono tabular-nums ${
            isPositiveDelta
              ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
              : 'bg-rose-100 border-rose-400 text-rose-800'
          }`}
        >
          {isPositiveDelta ? 'Thu Nhập: ' : 'Khoản Chi: '}
          <span>{formatCurrency(effectDelta!)}</span>
        </div>
      )}

      {/* CTA Button */}
      <button
        type="button"
        onClick={onConfirm ?? onClose}
        className="relative z-10 w-full min-h-[44px] py-2.5 rounded-xl font-bold text-white text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer bg-emerald-500 hover:bg-emerald-600 border-2 border-emerald-700 shadow-[0_4px_0_0_#065f46] active:shadow-[0_1px_0_0_#065f46] active:translate-y-[3px]"
      >
        Đã Hiểu / Tiếp Tục
      </button>
    </div>
  );
}
