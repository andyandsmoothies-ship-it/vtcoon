// [UI-S04/MSS][IMP-154] TradeSentimentMeter — AI Acceptance Sentiment Gauge
import React from 'react';
import type { BotTradeSentimentResult } from './trade_intelligence';

export interface TradeSentimentMeterProps {
  readonly sentiment: BotTradeSentimentResult;
  readonly partnerName?: string;
  readonly className?: string;
}

export function TradeSentimentMeter({
  sentiment,
  partnerName = 'Bot AI',
  className = '',
}: TradeSentimentMeterProps): React.ReactElement {
  const { status, score, message, hint } = sentiment;

  const moodConfig = (() => {
    switch (status) {
      case 'likely_accept':
        return {
          icon: '🟢 😃',
          label: 'Rất Khả Thi',
          badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          barColor: 'bg-emerald-500',
          textColor: 'text-emerald-800',
        };
      case 'borderline':
        return {
          icon: '🟡 🤔',
          label: 'Cân Nhắc',
          badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
          barColor: 'bg-amber-500',
          textColor: 'text-amber-800',
        };
      case 'likely_reject':
      default:
        return {
          icon: '🔴 🤨',
          label: 'Khó Đồng Thuận',
          badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
          barColor: 'bg-rose-500',
          textColor: 'text-rose-800',
        };
    }
  })();

  const clampedScore = Math.max(5, Math.min(100, score));

  return (
    <div
      data-testid="bot-sentiment-meter"
      data-trade-meter="true"
      className={`p-3 bg-[#F7F2E7] border border-slate-300 rounded-xl flex flex-col gap-2 text-xs text-slate-800 select-none ${className}`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between font-bold">
        <div className="flex items-center gap-1.5">
          <span className="text-sm" aria-hidden="true">🤖</span>
          <span className="text-slate-900 tracking-tight">Tâm Lý Đồng Thuận AI ({partnerName})</span>
        </div>
        <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
          <span className="font-mono text-xs font-black text-slate-700">{score}%</span>
          <span className={`px-2 py-0.5 rounded-md border text-[10px] font-black ${moodConfig.badgeClass}`}>
            {moodConfig.icon} {moodConfig.label}
          </span>
        </div>
      </div>

      {/* Progress meter bar */}
      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex border border-slate-300">
        <div
          className={`h-full transition-all duration-300 ${moodConfig.barColor}`}
          style={{ width: `${clampedScore}%` }}
        />
      </div>

      {/* Dynamic reaction message */}
      <div className="flex items-start justify-between gap-2 text-[11px]">
        <p className={`font-semibold ${moodConfig.textColor}`}>
          💬 &ldquo;{message}&rdquo;
        </p>
      </div>
      {hint && (
        <p className="text-[10px] text-slate-500 font-medium italic">
          💡 Gợi ý: {hint}
        </p>
      )}
    </div>
  );
}
