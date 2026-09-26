// [UI-S04/MSS][IMP-200] TradeDealHud — Cán cân thương vụ, Tâm lý AI & Thuế kho bạc
import React from 'react';
import { formatCurrency } from '../../ui_helpers';
import type { BotTradeSentimentResult } from '../trade_intelligence';
import { TradeSentimentMeter } from '../trade_sentiment_meter';

export interface TradeDealHudProps {
  readonly isBotPartner: boolean;
  readonly botSentiment: BotTradeSentimentResult;
  readonly effectiveTargetName: string;
  readonly myTotalValue: number;
  readonly partnerTotalValue: number;
  readonly myPercent: number;
  readonly taxAmount: number;
  readonly netReceived: number;
  readonly cashRequest: number;
}

export function TradeDealHud({
  isBotPartner,
  botSentiment,
  effectiveTargetName,
  myTotalValue,
  partnerTotalValue,
  myPercent,
  taxAmount,
  netReceived,
  cashRequest,
}: TradeDealHudProps): React.ReactElement {
  const isZeroDeal = myTotalValue === 0 && partnerTotalValue === 0;

  return (
    <div className="px-4">
      <div
        data-testid="deal-cockpit"
        className="p-3 bg-[#F7F2E7] border-2 border-slate-300 rounded-xl flex flex-col gap-2.5 text-xs text-slate-800 shadow-xs"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          {/* [IMP-154] Thước Đo Tâm Lý AI */}
          {isBotPartner ? (
            <TradeSentimentMeter
              sentiment={botSentiment}
              partnerName={effectiveTargetName}
              isZeroDeal={isZeroDeal}
            />
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-700 py-1">
              <span className="text-xl" aria-hidden="true">🤝</span>
              <div>
                <p className="font-bold text-slate-900">Đàm phán trực tiếp với {effectiveTargetName}</p>
                <p className="text-[11px] text-slate-500">Đối tác sẽ nhận và phản hồi đề xuất đàm phán của bạn.</p>
              </div>
            </div>
          )}

          {/* [IMP-133] Thanh Cán Cân Thương Vụ */}
          <div data-testid="deal-balance-meter" className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center font-bold">
              <span className="text-slate-900">⚖️ Cán Cân Thương Vụ</span>
              <span className="text-[11px] font-mono text-slate-700 font-semibold">
                {formatCurrency(myTotalValue)} vs {formatCurrency(partnerTotalValue)}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex border border-slate-300">
              {isZeroDeal ? (
                <div className="w-full h-full bg-slate-300/80" />
              ) : (
                <>
                  <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${myPercent}%` }} />
                  <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${100 - myPercent}%` }} />
                </>
              )}
            </div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-600">
              <span>Bạn đưa: {isZeroDeal ? '0%' : `${myPercent}%`}</span>
              <span>Đối tác: {isZeroDeal ? '0%' : `${100 - myPercent}%`}</span>
            </div>
          </div>
        </div>

        {/* Tóm tắt thỏa thuận & Thuế kho bạc */}
        <div className="pt-2 border-t border-slate-300/70 flex justify-between items-center text-[11px]">
          <span className="font-semibold text-slate-700">Thuế nộp Kho Bạc (5%):</span>
          <span className="font-bold text-amber-900 font-mono">{formatCurrency(taxAmount)}</span>
        </div>
        {cashRequest > 0 && (
          <div className="flex justify-between items-center text-[11px] font-bold">
            <span className="text-slate-800">Thực nhận:</span>
            <span className="text-emerald-700 font-mono font-black">{formatCurrency(netReceived)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
