// [UI-S04/MSS] AuctionBidControls — Tactical Bid Increments, Auto-Bid Toggle & Action Banners
import React from 'react';
import { formatCurrency } from '../ui_helpers.js';

export interface AuctionBidControlsProps {
  readonly currentBid: number;
  readonly increments: readonly number[];
  readonly myBalance?: number;
  readonly isConcluded: boolean;
  readonly isLeading: boolean;
  readonly hasPassed: boolean;
  readonly isDeclinedPlayer: boolean;
  readonly isMyPlayerBankrupt: boolean;
  readonly isForeclosure: boolean;
  readonly autoBid: boolean;
  readonly setAutoBid: React.Dispatch<React.SetStateAction<boolean>>;
  readonly onBid?: (newAmount: number) => void;
  readonly onPass?: () => void;
  readonly onClose?: () => void;
}

export function renderAuctionBidControls(props: AuctionBidControlsProps): React.ReactElement {
  const {
    currentBid,
    increments,
    myBalance,
    isConcluded,
    isLeading,
    hasPassed,
    isDeclinedPlayer,
    isMyPlayerBankrupt,
    isForeclosure,
    autoBid,
    setAutoBid,
    onBid,
    onPass,
    onClose,
  } = props;
  return (
    <div className="sticky bottom-0 shrink-0 -mx-3 sm:-mx-4 md:-mx-5 -mb-3 sm:-mb-4 md:-mb-5 p-2 sm:p-3 md:p-3.5 bg-[#FFFBEB] border-t border-amber-300/80 z-20 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] space-y-1.5 sm:space-y-2">
      {/* Trạng thái & Các nút nâng giá nhanh */}
      {(isDeclinedPlayer || isMyPlayerBankrupt) ? (
        <div className="p-1.5 sm:p-2.5 bg-amber-100 rounded-xl text-center border border-amber-300">
          <p className="text-[11px] sm:text-xs font-bold text-amber-900 leading-tight">
            {isMyPlayerBankrupt
              ? 'Bạn đã phá sản và đang theo dõi phiên đấu giá tài sản phát mãi.'
              : isForeclosure
              ? 'Tài sản của bạn đang được phát mãi cưỡng chế để cấn trừ nợ xấu. Bạn không thể tự đấu giá tài sản của chính mình.'
              : 'Bạn đã từ chối mua ô đất này (Luật game cấm tham gia đấu giá). Đang chờ các đối thủ khác đặt giá...'}
          </p>
        </div>
      ) : hasPassed ? (
        <div className="p-1.5 sm:p-2 bg-slate-200 rounded-xl text-center border border-slate-300">
          <p className="text-xs font-bold text-rose-700">Bạn đã rút lui khỏi phiên đấu giá này.</p>
        </div>
      ) : isLeading ? (
        <div className="p-1.5 sm:p-2 bg-emerald-100 rounded-xl text-center border border-emerald-400 flex items-center justify-center gap-1.5">
          <span className="text-emerald-700 font-bold text-sm">✓</span>
          <p className="text-xs font-bold text-emerald-800">Bạn đang dẫn đầu mức giá cao nhất!</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {increments.map((targetBid, idx) => {
            const diff = targetBid - currentBid;
            const canAfford = !isConcluded && (myBalance === undefined || targetBid <= myBalance);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onBid?.(targetBid)}
                disabled={!canAfford || isConcluded}
                className={`min-h-[44px] sm:min-h-[48px] py-1 px-1.5 sm:py-1.5 sm:px-2 font-bold text-xs rounded-xl border-2 flex flex-col items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 whitespace-nowrap ${
                  canAfford && !isConcluded
                    ? 'bg-amber-500 hover:bg-amber-400 text-amber-950 border-amber-700 font-black shadow-[0_3px_0_0_#b45309] active:shadow-[0_1px_0_0_#b45309] active:translate-y-[2px] cursor-pointer'
                    : 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed opacity-50'
                }`}
              >
                <span className="text-[11px] sm:text-xs md:text-sm font-black tracking-wide whitespace-nowrap">
                  {targetBid === 0 ? 'Bắt Đáy (0)' : (diff > 0 ? `+${formatCurrency(diff)}` : `${formatCurrency(targetBid)}`)}
                </span>
                <span className={`text-[10px] sm:text-xs font-semibold mt-0.5 whitespace-nowrap ${canAfford && !isConcluded ? 'text-amber-950' : 'text-slate-400'}`}>
                  ({formatCurrency(targetBid)})
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Footer: Công tắc Tự động đặt giá & Nút Hành Động (Single Row Grid 2 cột đối xứng) */}
      <div className="grid grid-cols-2 gap-2 pt-1.5 sm:pt-2 border-t border-amber-300/80">
        <button
          type="button"
          onClick={() => setAutoBid((prev) => !prev)}
          disabled={hasPassed || isDeclinedPlayer || isMyPlayerBankrupt || isConcluded}
          data-testid="auction-autobid-btn"
          className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
            hasPassed || isDeclinedPlayer || isMyPlayerBankrupt || isConcluded
              ? 'bg-slate-200 text-slate-400 border-slate-300 opacity-50 cursor-not-allowed shadow-none'
              : autoBid
                ? 'bg-amber-500 text-amber-950 font-black border-amber-700 shadow-[0_3px_0_0_#b45309] active:translate-y-[2px] cursor-pointer'
                : 'bg-[#F7F2E7] text-slate-700 border-slate-300 hover:bg-amber-100 cursor-pointer shadow-xs active:translate-y-[1px]'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${autoBid ? 'bg-amber-900 animate-pulse' : 'bg-slate-400'}`} />
          <span>{autoBid ? 'TỰ ĐỘNG ĐẶT GIÁ: BẬT' : 'TỰ ĐỘNG ĐẶT GIÁ: TẮT'}</span>
        </button>

        {isConcluded ? (
          <button
            type="button"
            onClick={onClose}
            data-testid="auction-concluded-close-btn"
            className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-black text-amber-950 bg-amber-400 hover:bg-amber-300 border-2 border-amber-600 shadow-[0_3px_0_0_#b45309] active:translate-y-[2px] transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            ✕ Đóng / Xem Bàn Cờ
          </button>
        ) : hasPassed ? (
          <button
            type="button"
            onClick={onClose}
            data-testid="auction-passed-close-btn"
            className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-black text-slate-700 bg-slate-200 hover:bg-slate-300 border-2 border-slate-400 shadow-[0_3px_0_0_#94a3b8] active:translate-y-[2px] transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            ✕ Đã Rút Lui • Đóng
          </button>
        ) : (isDeclinedPlayer || isMyPlayerBankrupt) ? (
          <button
            type="button"
            onClick={onClose}
            data-testid="auction-declined-close-btn"
            className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-black text-amber-950 bg-amber-100 hover:bg-amber-200 border-2 border-amber-400 shadow-[0_3px_0_0_#d97706] active:translate-y-[2px] transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            ✕ Đóng / Xem Bàn Cờ
          </button>
        ) : isLeading ? (
          <button
            type="button"
            onClick={onClose}
            data-testid="auction-leading-close-btn"
            className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-black text-amber-950 bg-amber-400 hover:bg-amber-300 border-2 border-amber-600 shadow-[0_3px_0_0_#b45309] active:translate-y-[2px] transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            ✕ Đóng / Xem Bàn Cờ
          </button>
        ) : (
          <button
            type="button"
            data-testid="auction-pass-btn"
            onClick={() => onPass?.()}
            className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-black text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border-2 border-rose-300 shadow-[0_3px_0_0_#fca5a5] active:translate-y-[2px] transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            ✕ Rút Lui
          </button>
        )}
      </div>
    </div>
  );
}

export function AuctionBidControls(props: AuctionBidControlsProps): React.ReactElement {
  return renderAuctionBidControls(props);
}
