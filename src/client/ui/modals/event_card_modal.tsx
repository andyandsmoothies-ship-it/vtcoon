// [UI-S04/MSS] EventCardModal — Vietnamese Chance & Market event card display with neon borders
import React from 'react';
import { formatCurrency } from '../ui_helpers';
import { vi } from '../../../domain/i18n/vi';
import { MarketCardId, ChanceCardId } from '../../../domain/event_card_types';

export interface EventCardModalProps {
  readonly cardType: 'chance' | 'market';
  readonly cardId: string;
  readonly title?: string;
  readonly description: string;
  readonly effectDelta?: number;
  readonly onConfirm?: () => void;
  readonly onClose?: () => void;
}

export function EventCardModal({
  cardType,
  cardId,
  title,
  description,
  effectDelta,
  onConfirm,
  onClose,
}: EventCardModalProps): React.ReactElement {
  const isMarket = cardType === 'market';
  const borderColor = isMarket ? 'border-amber-400 shadow-amber-500/20' : 'border-cyan-400 shadow-cyan-500/20';
  const badgeColor = isMarket ? 'bg-amber-950/80 text-amber-300 border-amber-500/40' : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40';
  const categoryLabel = isMarket ? 'Phiếu Thị Trường (Vĩ Mô)' : 'Phiếu Cơ Hội';
  const iconEmoji = isMarket ? '📰' : '⚡';

  const resolvedTitle =
    title ||
    (isMarket
      ? vi.marketCards[cardId as MarketCardId]
      : vi.chanceCards[cardId as ChanceCardId]) ||
    cardId;

  const hasDelta = typeof effectDelta === 'number' && effectDelta !== 0;
  const isPositiveDelta = hasDelta && effectDelta! > 0;

  return (
    <div
      className={`w-full max-w-xs bg-slate-900 border-2 rounded-2xl shadow-2xl p-5 flex flex-col items-center text-center relative pointer-events-auto transition-all animate-in fade-in zoom-in-95 duration-200 ${borderColor}`}
      data-testid="event-card-modal"
    >
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng thẻ sự kiện"
          className="absolute top-2 right-2 min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-white/80 hover:text-white text-xl font-bold rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          ✕
        </button>
      )}

      {/* Category Badge */}
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border mb-3 ${badgeColor}`}>
        {categoryLabel}
      </span>

      {/* Card Icon */}
      <div className="w-14 h-14 rounded-2xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-2xl mb-3 shadow-inner">
        <span aria-hidden="true">{iconEmoji}</span>
      </div>

      {/* Card Title */}
      <h2 className="text-base font-bold text-slate-100 uppercase tracking-wide mb-2 leading-snug">
        {resolvedTitle}
      </h2>

      {/* Description */}
      <p className="text-xs text-slate-300 mb-4 leading-relaxed px-1">
        {description}
      </p>

      {/* Cash Delta Badge (nếu có biến động tiền tệ) */}
      {hasDelta && (
        <div
          className={`mb-4 px-3 py-1.5 rounded-xl border text-xs font-bold tracking-wide ${
            isPositiveDelta
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
              : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
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
        className={`w-full min-h-[44px] py-2.5 rounded-xl font-bold text-white text-xs shadow-lg transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
          isMarket
            ? 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500'
            : 'bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500'
        }`}
      >
        Đã Hiểu / Tiếp Tục
      </button>
    </div>
  );
}
