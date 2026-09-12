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
    if (autoBid && !isLeading && !hasPassed && onBid) {
      const minBid = increments[0];
      if (minBid && (myBalance === undefined || minBid <= myBalance)) {
        onBid(minBid);
      }
    }
  }, [autoBid, isLeading, hasPassed, currentBid, increments, myBalance, onBid]);

  return (
    <div
      className="w-full h-full p-3 md:p-6 flex flex-col justify-between pointer-events-none relative select-none"
      data-testid="auction-modal"
    >
      {/* Vùng Live Region cho Trình Đọc Màn Hình [WCAG 4.1.3] */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {`Giá thầu cao nhất hiện tại: ${formatCurrency(currentBid)}, người dẫn đầu: ${displayName}, thời gian còn lại: ${timeRemaining} giây`}
      </div>

      {/* 1. KHU VỰC TRÊN: CÁNH TRÁI & CÁNH PHẢI GLASSMORPHISM (GIỮ TRỐNG TÂM CHO SỔ ĐỎ 3D) */}
      <div className="w-full flex flex-col md:flex-row justify-between items-start gap-4 pointer-events-none">
        {/* CÁNH TRÁI: Bảng giá hiện tại & Trạng thái BĐS */}
        <section
          aria-label="Thông tin giá thầu hiện tại"
          className="w-full md:w-80 bg-slate-900/80 backdrop-blur-md border border-amber-500/40 rounded-2xl p-4 shadow-2xl space-y-3 pointer-events-auto"
        >
          {/* Header phiên đấu giá */}
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden="true">🔨</span>
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-amber-400">
                  SÀN ĐẤU GIÁ TRỰC TUYẾN
                </h2>
                <p className="text-[10px] text-slate-400 font-mono">LIVE 3D ARENA</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              ĐANG MỞ
            </span>
          </div>

          {/* Tên BĐS & Phân khu quy hoạch */}
          <div className="flex items-center gap-2.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div className="w-3 h-9 rounded-md shrink-0 shadow" style={{ backgroundColor: ribbonColor }} />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-100 text-xs truncate">{deed?.name ?? `Ô #${cellIndex}`}</h3>
              <p className="text-[10px] text-slate-400">
                Giá khởi điểm: <span className="text-slate-300 font-semibold">{formatCurrency(deed?.price ?? currentBid)}</span>
              </p>
            </div>
          </div>

          {/* Bảng giá cao nhất hiện tại (CURRENT BID) */}
          <div className={`p-3 rounded-xl border text-center transition-all ${isLeading ? 'bg-emerald-950/40 border-emerald-500/50 shadow-emerald-900/20' : 'bg-slate-950/80 border-amber-500/30'}`}>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              GIÁ THẦU HIỆN TẠI
            </p>
            <p className="text-2xl font-black text-amber-300 tracking-tight tabular-nums mt-0.5">
              {formatCurrency(currentBid)}
            </p>
            <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-xs">
              <span className="text-slate-400 text-[11px]">Dẫn đầu:</span>
              <span className={`font-bold truncate max-w-[160px] ${isLeading ? 'text-emerald-400' : 'text-slate-200'}`}>
                {displayName}
              </span>
            </div>
          </div>
        </section>

        {/* CÁNH PHẢI: Đại gia tham gia & Lịch sử trả giá */}
        <section
          aria-label="Danh sách người tham gia đấu giá"
          className="w-full md:w-80 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-2xl p-4 shadow-2xl space-y-3 pointer-events-auto"
        >
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-base" aria-hidden="true">👥</span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                ĐẠI GIA THAM GIA
              </h3>
            </div>
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

          {/* Danh sách người chơi trong phòng */}
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {Object.values(playersInfo).length > 0 ? (
              Object.values(playersInfo).map((p) => {
                const isThisLeading = p.id === highestBidderId;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs border ${
                      isThisLeading
                        ? 'bg-amber-950/30 border-amber-500/40 text-amber-200 font-semibold'
                        : 'bg-slate-950/50 border-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: p.tokenColor ?? '#F59E0B' }}
                      />
                      <span className="truncate">{p.name}</span>
                    </div>
                    {isThisLeading && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500 text-amber-950">
                        TOP 1
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-[11px] text-slate-400 text-center py-2">
                {displayName ? `Dẫn đầu: ${displayName}` : 'Chưa có người chơi kết nối'}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 2. BĂNG CHUYỀN DƯỚI CHÂN GLASSMORPHISM (BOTTOM CAROUSEL DOCK) */}
      <footer
        aria-label="Bảng điều khiển đặt giá nhanh và đếm ngược"
        className="w-full max-w-3xl mx-auto bg-slate-900/85 backdrop-blur-md border border-amber-500/40 rounded-2xl p-3.5 md:p-4 shadow-2xl pointer-events-auto space-y-3"
      >
        {/* Hàng 1: Đồng hồ đếm ngược 15s rực lửa & Thanh thời gian co dãn */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isUrgent ? 'bg-rose-500 animate-ping' : 'bg-amber-400'}`} />
            <span className="text-slate-300 font-medium">THỜI GIAN CÒN LẠI:</span>
          </div>
          <span className={`font-mono font-black text-base md:text-lg ${isUrgent ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`}>
            {timeRemaining.toString().padStart(2, '0')} GIÂY
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${isUrgent ? 'bg-rose-500' : 'bg-amber-400'}`}
            style={{ width: `${timerPercent}%` }}
          />
        </div>

        {/* Hàng 2: Trạng thái & Các nút nâng giá nhanh */}
        {hasPassed ? (
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
                      ? 'bg-gradient-to-b from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 active:scale-95 text-white border-amber-400/40 shadow-amber-950/40 cursor-pointer'
                      : 'bg-slate-800/70 text-slate-500 border-slate-700/60 cursor-not-allowed opacity-50'
                  }`}
                >
                  <span className="text-xs md:text-sm font-black tracking-wide">+{step} Tr.</span>
                  <span className={`text-[10px] font-normal mt-0.5 ${canAfford ? 'text-amber-100' : 'text-slate-500'}`}>
                    ({formatCurrency(targetBid)})
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Hàng 3: Công tắc Auto-Bid & Nút Rút lui */}
        <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => setAutoBid((prev) => !prev)}
            disabled={hasPassed}
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
            disabled={hasPassed}
            className="min-h-[38px] px-4 py-1.5 rounded-xl text-xs font-bold text-rose-300 hover:text-rose-200 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            {hasPassed ? 'Đã Rút Lui' : 'Rút Lui / Bỏ Cuộc'}
          </button>
        </div>
      </footer>
    </div>
  );
}
