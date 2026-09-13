// [UI-S04/MSS] AuctionModal — Glassmorphism Dual-Wing 3D Auction Arena Overlay & Fast Bid Carousel
import React, { useEffect, useState } from 'react';
import { getDeedDisplayInfo, calculateAuctionIncrements } from './modal_helpers';
import { formatCurrency } from '../ui_helpers';
import { COLOR_GROUP_HEX } from '../../../domain/theme';
import { useGameStore } from '../../store/game_store';

export interface AuctionModalProps {
  readonly cellIndex: number;
  readonly currentBid: number;
  readonly highestBidderId: string | null;
  readonly timeRemaining: number;
  readonly hasPassed?: boolean;
  readonly isDeclinedPlayer?: boolean;
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
  isDeclinedPlayer = false,
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

  const playersInfo = useGameStore((s) => s.playersInfo);
  const [autoBid, setAutoBid] = useState<boolean>(false);

  // [UC-GAME-022] Sàn tự đóng khi hết thời gian
  useEffect(() => {
    if (timeRemaining <= 0) {
      onClose?.();
    }
  }, [timeRemaining, onClose]);

  // Xử lý tự động đặt giá nếu bật Auto-Bid
  useEffect(() => {
    if (autoBid && !isLeading && !hasPassed && !isDeclinedPlayer && onBid) {
      const minBid = increments[0];
      if (minBid && (myBalance === undefined || minBid <= myBalance)) {
        onBid(minBid);
      }
    }
  }, [autoBid, isLeading, hasPassed, isDeclinedPlayer, currentBid, increments, myBalance, onBid]);

  return (
    <div
      className="w-full max-w-lg bg-slate-900/95 backdrop-blur-xl border border-amber-500/40 rounded-3xl p-5 md:p-6 shadow-2xl space-y-4 pointer-events-auto relative select-none"
      data-testid="auction-modal"
    >
      {/* Vùng Live Region cho Trình Đọc Màn Hình [WCAG 4.1.3] */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {`Giá thầu cao nhất hiện tại: ${formatCurrency(currentBid)}, người dẫn đầu: ${displayName}, thời gian còn lại: ${timeRemaining} giây`}
      </div>

      {/* Header phiên đấu giá */}
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl" aria-hidden="true">🔨</span>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-amber-400">
              SÀN ĐẤU GIÁ TRỰC TUYẾN
            </h2>
            <p className="text-[10px] text-slate-400 font-mono">LIVE 3D ARENA</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            ĐANG MỞ
          </span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng sàn đấu giá"
              className="w-7 h-7 inline-flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Tên BĐS & Phân khu quy hoạch */}
      <div className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
        <div className="w-3.5 h-10 rounded-md shrink-0 shadow" style={{ backgroundColor: ribbonColor }} />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-100 text-sm truncate">{deed?.name ?? `Ô #${cellIndex}`}</h3>
          <p className="text-xs text-slate-400 truncate">
            Giá khởi điểm: <span className="text-slate-200 font-semibold">{formatCurrency(deed?.price ?? currentBid)}</span>
          </p>
        </div>
      </div>

      {/* Bảng giá hiện tại & Người dẫn đầu */}
      <div className="grid grid-cols-2 gap-2.5 text-center">
        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
          <span className="text-[10px] text-slate-400 block font-medium">GIÁ THẦU HIỆN TẠI</span>
          <span className="text-base font-black text-amber-400 font-mono block mt-0.5">
            {formatCurrency(currentBid)}
          </span>
        </div>
        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
          <span className="text-[10px] text-slate-400 block font-medium">DẪN ĐẦU</span>
          <span className={`text-xs font-bold truncate block mt-1 ${isLeading ? 'text-emerald-400' : 'text-slate-200'}`}>
            {displayName}
          </span>
        </div>
      </div>

      {/* Danh sách đại gia & Ví tiền */}
      <div className="space-y-1.5 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/60">
        <div className="flex items-center justify-between text-[11px] pb-1 border-b border-slate-800/60">
          <span className="font-semibold text-slate-400 uppercase tracking-wider">
            ĐẠI GIA THAM GIA
          </span>
          <span className="font-medium text-slate-300">
            Ví của bạn: <span className="font-mono font-bold text-emerald-400">{myBalance !== undefined ? formatCurrency(myBalance) : '---'}</span>
          </span>
        </div>
        <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
          {Object.values(playersInfo).length > 0 ? (
            Object.values(playersInfo).map((p) => {
              const isBidder = p.id === highestBidderId;
              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between text-xs px-2.5 py-1 rounded-lg border ${
                    isBidder
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold'
                      : 'bg-slate-950/40 border-slate-800/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: p.tokenColor ?? '#F59E0B' }}
                    />
                    <span className="truncate max-w-[140px]">{p.name}</span>
                  </div>
                  <span className="font-mono text-[11px]">{formatCurrency(p.balance)}</span>
                </div>
              );
            })
          ) : (
            <div className="text-[11px] text-slate-400 text-center py-1">
              {displayName ? `Dẫn đầu: ${displayName}` : 'Chưa có người chơi kết nối'}
            </div>
          )}
        </div>
      </div>

      {/* Đồng hồ đếm ngược & Thanh thời gian */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isUrgent ? 'bg-rose-500 animate-ping' : 'bg-amber-400'}`} />
            <span className="text-slate-300 font-medium">THỜI GIAN CÒN LẠI:</span>
          </div>
          <span className={`font-mono font-black text-base ${isUrgent ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`}>
            {timeRemaining.toString().padStart(2, '0')} GIÂY
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${isUrgent ? 'bg-rose-500' : 'bg-amber-400'}`}
            style={{ width: `${timerPercent}%` }}
          />
        </div>
      </div>

      {/* Trạng thái & Các nút nâng giá nhanh */}
      {isDeclinedPlayer ? (
        <div className="p-3 bg-amber-950/40 rounded-xl text-center border border-amber-600/40">
          <p className="text-xs font-semibold text-amber-200">
            Bạn đã từ chối mua ô đất này (Luật game cấm tham gia đấu giá). Đang chờ các đối thủ khác đặt giá...
          </p>
        </div>
      ) : hasPassed ? (
        <div className="p-3 bg-slate-800/60 rounded-xl text-center border border-slate-700">
          <p className="text-xs font-semibold text-rose-300">Bạn đã rút lui khỏi phiên đấu giá này.</p>
        </div>
      ) : isLeading ? (
        <div className="p-3 bg-emerald-950/40 rounded-xl text-center border border-emerald-600/40 flex items-center justify-center gap-2">
          <span className="text-emerald-400 font-bold text-sm">✓</span>
          <p className="text-xs font-bold text-emerald-300">Bạn đang dẫn đầu mức giá cao nhất!</p>
        </div>
      ) : (
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
                className={`min-h-[48px] py-2 px-2 font-bold text-xs rounded-xl shadow-lg border flex flex-col items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  canAfford
                    ? 'bg-amber-500 hover:bg-amber-400 active:scale-95 text-amber-950 border-amber-400 font-black cursor-pointer'
                    : 'bg-slate-800/70 text-slate-500 border-slate-700/60 cursor-not-allowed opacity-50'
                }`}
              >
                <span className="text-xs md:text-sm font-black tracking-wide">+{step} Tr.</span>
                <span className={`text-[10px] font-semibold mt-0.5 ${canAfford ? 'text-amber-900' : 'text-slate-500'}`}>
                  ({formatCurrency(targetBid)})
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Footer: Công tắc Auto-Bid & Nút Rút lui */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
        <button
          type="button"
          onClick={() => setAutoBid((prev) => !prev)}
          disabled={hasPassed || isDeclinedPlayer}
          className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
            autoBid
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-slate-800/50 text-slate-400 border-slate-700/50 hover:text-slate-200'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${autoBid ? 'bg-amber-400' : 'bg-slate-500'}`} />
          <span>AUTO-BID</span>
        </button>

        <button
          type="button"
          onClick={onPass ?? onClose}
          disabled={hasPassed || isDeclinedPlayer}
          className="min-h-[38px] px-4 py-1.5 rounded-xl text-xs font-bold text-rose-300 hover:text-rose-200 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
        >
          {isDeclinedPlayer ? 'Không Thể Tham Gia' : hasPassed ? 'Đã Rút Lui' : 'Rút Lui / Bỏ Cuộc'}
        </button>
      </div>
    </div>
  );
}
