import React from 'react';
import { formatCurrency } from '../ui_helpers';

export interface PortfolioDeficitBannerProps {
  readonly isNegative: boolean;
  readonly currentBalance: number;
  readonly deficitAmount: number;
  readonly onAutoSolvency?: () => void;
}

export function PortfolioDeficitBanner({
  isNegative,
  currentBalance,
  deficitAmount,
  onAutoSolvency,
}: PortfolioDeficitBannerProps): React.ReactElement | null {
  if (!isNegative || deficitAmount <= 0) return null;

  return (
    <div
      data-testid="portfolio-deficit-alert"
      className="bg-rose-50 border-b border-rose-300 p-3.5 flex flex-col gap-2.5 text-xs shrink-0 select-none"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">⚠️</span>
          <div>
            <span className="font-bold text-rose-800">Cần Giải Tỏa Thâm Hụt: </span>
            <span className="font-black text-rose-700 text-sm">
              {formatCurrency(currentBalance)}
            </span>
            <p className="text-[11px] text-rose-700 mt-0.5">
              Thế chấp đất hoặc hạ cấp công trình để số dư dương trước khi hết lượt!
            </p>
          </div>
        </div>
        <div className="bg-white border border-rose-300 rounded-lg px-2.5 py-1 text-right shrink-0">
          <span className="text-[11px] text-slate-500 block">Số tiền còn thiếu</span>
          <span className="font-mono font-black text-rose-600 text-xs">
            {deficitAmount.toLocaleString('vi-VN')}
          </span>
        </div>
      </div>

      {onAutoSolvency && (
        <button
          type="button"
          data-testid="portfolio-auto-solvency-btn"
          onClick={onAutoSolvency}
          aria-label="Cân đối tự động đưa số dư về mức an toàn"
          className="w-full min-h-[44px] py-2 px-3 rounded-xl font-black text-xs bg-amber-500 hover:bg-amber-400 text-slate-900 border-2 border-amber-700 shadow-[0_3px_0_0_#b45309] active:shadow-none active:translate-y-[2px] transition-all flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <span aria-hidden="true">⚡</span> CÂN ĐỐI TỰ ĐỘNG (CỨU NGUY NHANH 1-CHẠM)
        </button>
      )}
    </div>
  );
}
