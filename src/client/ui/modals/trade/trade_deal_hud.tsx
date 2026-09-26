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
  return (
    <div className="flex flex-col gap-2">
      {/* [IMP-154] Thước Đo Tâm Lý AI */}
      {isBotPartner && (
        <div className="px-4">
          <TradeSentimentMeter sentiment={botSentiment} partnerName={effectiveTargetName} />
        </div>
      )}

      {/* [IMP-133] Thanh Cán Cân Thương Vụ */}
      <div className="px-4">
        <div data-testid="deal-balance-meter" className="p-3 bg-[#F7F2E7] border border-slate-300 rounded-xl flex flex-col gap-1.5 text-xs text-slate-800">
          <div className="flex justify-between items-center font-bold">
            <span>⚖️ Cán Cân Thương Vụ</span>
            <span className="text-[11px] font-mono text-slate-600 font-semibold">
              {formatCurrency(myTotalValue)} vs {formatCurrency(partnerTotalValue)}
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex border border-slate-300">
            <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${myPercent}%` }} />
            <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${100 - myPercent}%` }} />
          </div>
          <div className="flex justify-between text-[10px] font-semibold text-slate-500">
            <span>Bạn đưa: {myPercent}%</span>
            <span>Đối tác: {100 - myPercent}%</span>
          </div>
        </div>
      </div>

      {/* Tóm tắt thỏa thuận & Thuế kho bạc */}
      <div className="px-4">
        <div className="p-2.5 bg-[#F7F2E7] border border-slate-300 rounded-xl flex flex-col gap-1 text-[11px] text-slate-800">
          <div className="flex justify-between items-center">
            <span className="font-medium">Thuế nộp Kho Bạc (5%):</span>
            <span className="font-bold text-amber-800">{formatCurrency(taxAmount)}</span>
          </div>
          {cashRequest > 0 && (
            <div className="flex justify-between items-center pt-1 border-t border-slate-300/60 font-bold">
              <span>Thực nhận:</span>
              <span className="text-emerald-700 font-black">{formatCurrency(netReceived)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
