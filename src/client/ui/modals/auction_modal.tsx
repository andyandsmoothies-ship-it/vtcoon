// [UI-S04/MSS] AuctionModal — 15s Real-time property auction floor with fast bid buttons
import React, { useEffect } from 'react';
import { getDeedDisplayInfo, calculateAuctionIncrements } from './modal_helpers';
import { formatCurrency } from '../ui_helpers';
import { COLOR_GROUP_HEX } from '../../../domain/theme';

export interface AuctionModalProps {
  readonly cellIndex: number;
  readonly currentBid: number;
  readonly highestBidderId: string | null;
  readonly timeRemaining: number;
  readonly hasPassed?: boolean;
  readonly bidderName?: string;
  readonly myBalance?: number;
  readonly myId?: string;
  readonly onBid?: (newAmount: number) => void;
  readonly onPass?: () => void;
  readonly onClose?: () => void;
}

export function AuctionModal({
  cellIndex,
  currentBid,
  highestBidderId,
  timeRemaining,
  hasPassed = false,
  bidderName,
  myBalance,
  myId,
  onBid,
  onPass,
  onClose,
}: AuctionModalProps): React.ReactElement {
  const deed = getDeedDisplayInfo(cellIndex);
  const increments = calculateAuctionIncrements(currentBid);
  const isUrgent = timeRemaining <= 5;
  const timerPercent = Math.min(100, Math.max(0, (timeRemaining / 15) * 100));
  const ribbonColor = deed?.colorGroup ? COLOR_GROUP_HEX[deed.colorGroup] : '#eab308';
  const isLeading = Boolean(myId && highestBidderId === myId);
  const displayName = isLeading ? 'Bạn' : (bidderName ?? (highestBidderId ? `Người Chơi (${highestBidderId})` : 'Chưa có ai'));

  // [UC-GAME-022] Sàn tự đóng khi hết 15 giây
  useEffect(() => {
    if (timeRemaining <= 0) {
      onClose?.();
    }
  }, [timeRemaining, onClose]);

  return (
    <div
      className="w-full max-w-sm bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
      data-testid="auction-modal"
    >
      {/* Header sàn đấu giá */}
      <header className="p-3.5 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-white flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">🔨</span>
          <h2 className="text-sm md:text-base font-bold uppercase tracking-wide">
            Sàn Đấu Giá Trực Tuyến
          </h2>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng sàn đấu giá"
            className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-white/80 hover:text-white text-xl font-bold rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            ✕
          </button>
        )}
      </header>

      {/* Vùng Live Region cho Trình Đọc Màn Hình [WCAG 4.1.3] */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {`Giá thầu cao nhất hiện tại: ${formatCurrency(currentBid)}, người dẫn đầu: ${displayName}, thời gian còn lại: ${timeRemaining} giây`}
      </div>

      {/* Thông tin BĐS đang đấu giá */}
      <div className="p-4 space-y-3.5">
        <div className="flex items-center gap-2.5 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
          <div className="w-3.5 h-10 rounded-md shrink-0 shadow" style={{ backgroundColor: ribbonColor }} />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-100 text-sm truncate">{deed?.name ?? `Ô #${cellIndex}`}</h3>
            <p className="text-[11px] text-slate-400">
              Giá khởi điểm: <span className="text-slate-300 font-semibold">{formatCurrency(deed?.price ?? currentBid)}</span>
            </p>
          </div>
        </div>

        {/* Đồng hồ đếm ngược 15 giây & thanh tiến trình */}
        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-center space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Thời gian còn lại</span>
            <span className={`font-mono font-bold text-sm ${isUrgent ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`}>
              {timeRemaining}s
            </span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${isUrgent ? 'bg-rose-500' : 'bg-amber-500'}`}
              style={{ width: `${timerPercent}%` }}
            />
          </div>
        </div>

        {/* Mức giá cao nhất hiện tại */}
        <div className={`text-center py-2 px-3 border rounded-xl ${isLeading ? 'bg-emerald-950/30 border-emerald-500/40' : 'bg-amber-950/20 border-amber-600/30'}`}>
          <p className="text-[11px] text-slate-400">Giá cao nhất hiện tại</p>
          <p className="text-xl font-black text-amber-300">{formatCurrency(currentBid)}</p>
          <p className={`text-[11px] mt-0.5 truncate font-medium ${isLeading ? 'text-emerald-400' : 'text-slate-300'}`}>
            Dẫn đầu: {displayName}
          </p>
        </div>

        {/* Trạng thái đã rút lui hoặc các nút tăng giá nhanh */}
        {hasPassed ? (
          <div className="p-3 bg-slate-800/60 rounded-xl text-center border border-slate-700">
            <p className="text-xs text-slate-400">Bạn đã rút lui khỏi phiên đấu giá này.</p>
          </div>
        ) : isLeading ? (
          <div className="p-2.5 bg-emerald-950/40 rounded-xl text-center border border-emerald-600/30">
            <p className="text-xs font-semibold text-emerald-300">✓ Bạn đang dẫn đầu mức giá!</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[11px] text-slate-400 text-center font-medium">Đặt giá nhanh</p>
            <div className="grid grid-cols-3 gap-2">
              {([50, 100, 200] as const).map((step, idx) => {
                const targetBid = increments[idx]!;
                const canAfford = myBalance === undefined || targetBid <= myBalance;
                return (
                  <button
                    key={step}
                    type="button"
                    onClick={() => onBid?.(targetBid)}
                    disabled={!canAfford}
                    className={`min-h-[48px] py-2 px-1.5 font-bold text-xs rounded-xl shadow border flex flex-col items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                      canAfford
                        ? 'bg-gradient-to-b from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 active:scale-95 text-white border-amber-400/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <span>+{step} Tr.</span>
                    <span className={`text-[9px] font-normal ${canAfford ? 'text-amber-200' : 'text-slate-400'}`}>
                      ({formatCurrency(targetBid)})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer: Rút lui / Bỏ cuộc */}
      <footer className="p-3 bg-slate-900/90 border-t border-slate-800/80 flex justify-end">
        <button
          type="button"
          onClick={onPass ?? onClose}
          disabled={hasPassed}
          className="w-full min-h-[44px] py-2 px-4 rounded-xl text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
        >
          {hasPassed ? 'Đã Rút Lui' : 'Rút Lui / Bỏ Cuộc'}
        </button>
      </footer>
    </div>
  );
}
