// [UI-S04/MSS] AuctionModal — Glassmorphism Dual-Wing 3D Auction Arena Overlay & Fast Bid Carousel
import React, { useEffect, useState } from 'react';
import { getDeedDisplayInfo, calculateAuctionIncrements } from './modal_helpers';
import { formatCurrency } from '../ui_helpers';
import { COLOR_GROUP_HEX } from '../../../domain/theme';
import { useGameStore } from '../../store/game_store';
import { AuctionDistrictCard } from './auction_district_card';

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
  readonly isConcluded?: boolean;
  readonly winnerId?: string | null;
  readonly finalPrice?: number;
  readonly playersInfo?: Record<string, any>;
  readonly levelMap?: Record<number, number>;
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
  isConcluded = false,
  winnerId,
  finalPrice,
  playersInfo: propPlayersInfo,
  levelMap: propLevelMap,
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

  const storePlayersInfo = useGameStore((s) => s.playersInfo);
  const playersInfo = propPlayersInfo ?? storePlayersInfo;
  const [autoBid, setAutoBid] = useState<boolean>(false);

  // Xử lý tự động đặt giá nếu bật Auto-Bid
  useEffect(() => {
    if (autoBid && !isLeading && !hasPassed && !isDeclinedPlayer && onBid) {
      const minBid = increments[0];
      if (minBid && (myBalance === undefined || minBid <= myBalance)) {
        onBid(minBid);
      }
    }
  }, [autoBid, isLeading, hasPassed, isDeclinedPlayer, currentBid, increments, myBalance, onBid]);

  // Tự động đóng modal sau 2.5s khi phiên đấu giá gõ búa thành công
  useEffect(() => {
    if (isConcluded && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isConcluded, onClose]);

  return (
    <div
      data-testid="auction-modal"
      className="w-full max-w-lg bg-[#FFFBEB] border-2 border-slate-900 rounded-3xl p-5 md:p-6 shadow-[0_6px_0_0_#0f172a] space-y-4 pointer-events-auto relative select-none text-slate-900 max-h-[90vh] overflow-y-auto pr-1"
    >
      {/* Vùng Live Region cho Trình Đọc Màn Hình [WCAG 4.1.3] */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {`Giá thầu cao nhất hiện tại: ${formatCurrency(currentBid)}, người dẫn đầu: ${displayName}, thời gian còn lại: ${timeRemaining} giây`}
      </div>

      {/* Banner Gõ Búa Thành Công khi phiên đấu giá kết thúc */}
      {isConcluded && (
        <div className="bg-amber-100 border-2 border-amber-500 rounded-2xl p-4 text-center shadow-md animate-pulse">
          <div className="text-2xl mb-1" aria-hidden="true">🔨🎉</div>
          <h3 className="font-black text-amber-950 text-base uppercase tracking-wider">
            BÚA GÕ THÀNH CÔNG!
          </h3>
          <p className="text-xs font-bold text-amber-900 mt-1">
            {displayName} đã trúng đấu giá {deed?.name ?? `Ô #${cellIndex}`} với giá {formatCurrency(finalPrice ?? currentBid)}!
          </p>
        </div>
      )}

      {/* Header phiên đấu giá */}
      <div className="flex items-center justify-between border-b border-amber-300/80 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl" aria-hidden="true">🔨</span>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
              SÀN ĐẤU GIÁ TRỰC TUYẾN
            </h2>
            <p className="text-[10px] text-amber-800 font-mono font-bold">LIVE TABLETOP ARENA</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-400">
            ĐANG MỞ
          </span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng sàn đấu giá"
              className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-amber-100 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Tên BĐS & Phân khu quy hoạch */}
      <div className="flex items-center gap-3 bg-[#F7F2E7] p-3 rounded-2xl border border-slate-300">
        <div className="w-3.5 h-10 rounded-md shrink-0 shadow border border-slate-900" style={{ backgroundColor: ribbonColor }} />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 text-sm truncate">{deed?.name ?? `Ô #${cellIndex}`}</h3>
          <p className="text-xs text-slate-600 truncate">
            Giá khởi điểm: <span className="text-slate-900 font-bold">{formatCurrency(deed?.price ?? currentBid)}</span>
          </p>
        </div>
      </div>

      {/* Tình báo phân khu & Radar độc quyền [IMP-138] */}
      <AuctionDistrictCard
        cellIndex={cellIndex}
        currentBid={currentBid}
        myId={myId}
        playersInfo={playersInfo}
        levelMap={propLevelMap}
      />

      {/* Bảng giá hiện tại & Người dẫn đầu */}
      <div className="grid grid-cols-2 gap-2.5 text-center">
        <div className="bg-[#F7F2E7] p-2.5 rounded-xl border border-slate-300 flex flex-col justify-between">
          <span className="text-[10px] text-slate-600 block font-bold">GIÁ THẦU HIỆN TẠI</span>
          <div
            data-testid="flip-counter"
            className="tracking-widest font-mono font-black text-2xl md:text-3xl text-amber-400 bg-slate-900 py-1 px-3 rounded-lg shadow-inner border border-slate-700 mt-1"
          >
            {formatCurrency(currentBid)}
          </div>
        </div>
        <div className="bg-[#F7F2E7] p-2.5 rounded-xl border border-slate-300 flex flex-col justify-between">
          <span className="text-[10px] text-slate-600 block font-bold">DẪN ĐẦU</span>
          <div className="p-2 rounded-lg bg-white/90 border border-slate-200 mt-1">
            <span className={`text-xs font-black truncate block ${isLeading ? 'text-emerald-700' : 'text-slate-900'}`}>
              {displayName}
            </span>
          </div>
        </div>
      </div>

      {/* Danh sách đại gia & Ví tiền */}
      <div className="space-y-1.5 bg-[#F7F2E7] p-3 rounded-2xl border border-slate-300">
        <div className="flex items-center justify-between text-[11px] pb-1 border-b border-slate-300">
          <span className="font-bold text-slate-700 uppercase tracking-wider">
            ĐẠI GIA THAM GIA
          </span>
          <span className="font-medium text-slate-700">
            Ví của bạn: <span className="font-mono font-bold text-emerald-700">{myBalance !== undefined ? formatCurrency(myBalance) : '---'}</span>
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
                      ? 'bg-amber-200 border-amber-400 text-amber-950 font-bold'
                      : 'bg-white/80 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2 h-2 rounded-full shrink-0 border border-slate-900"
                      style={{ backgroundColor: p.tokenColor ?? '#F59E0B' }}
                    />
                    <span className="truncate max-w-[140px] font-medium">{p.name}</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold">{formatCurrency(p.balance)}</span>
                </div>
              );
            })
          ) : (
            <div className="text-[11px] text-slate-600 text-center py-1">
              {displayName ? `Dẫn đầu: ${displayName}` : 'Chưa có người chơi kết nối'}
            </div>
          )}
        </div>
      </div>

      {/* Đồng hồ đếm ngược & Thanh thời gian */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isUrgent ? 'bg-rose-500 animate-ping' : 'bg-amber-500'}`} />
            <span className="text-slate-700 font-bold">THỜI GIAN CÒN LẠI:</span>
          </div>
          <span className={`font-mono font-black text-base ${isUrgent ? 'text-rose-600 animate-pulse' : 'text-amber-800'}`}>
            {timeRemaining.toString().padStart(2, '0')} GIÂY
          </span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
          <div
            className={`h-full transition-all duration-300 ${isUrgent ? 'bg-rose-500' : 'bg-amber-500'}`}
            style={{ width: `${timerPercent}%` }}
          />
        </div>
      </div>

      {/* Trạng thái & Các nút nâng giá nhanh */}
      {isDeclinedPlayer ? (
        <div className="p-3 bg-amber-100 rounded-xl text-center border border-amber-300">
          <p className="text-xs font-bold text-amber-900">
            Bạn đã từ chối mua ô đất này (Luật game cấm tham gia đấu giá). Đang chờ các đối thủ khác đặt giá...
          </p>
        </div>
      ) : hasPassed ? (
        <div className="p-3 bg-slate-200 rounded-xl text-center border border-slate-300">
          <p className="text-xs font-bold text-rose-700">Bạn đã rút lui khỏi phiên đấu giá này.</p>
        </div>
      ) : isLeading ? (
        <div className="p-3 bg-emerald-100 rounded-xl text-center border border-emerald-400 flex items-center justify-center gap-2">
          <span className="text-emerald-700 font-bold text-sm">✓</span>
          <p className="text-xs font-bold text-emerald-800">Bạn đang dẫn đầu mức giá cao nhất!</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {([100, 200, 500] as const).map((step, idx) => {
            const targetBid = increments[idx]!;
            const canAfford = myBalance === undefined || targetBid <= myBalance;
            return (
              <button
                key={step}
                type="button"
                onClick={() => onBid?.(targetBid)}
                disabled={!canAfford}
                className={`min-h-[48px] py-2 px-2 font-bold text-xs rounded-xl border-2 flex flex-col items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  canAfford
                    ? 'bg-amber-500 hover:bg-amber-400 text-amber-950 border-amber-700 font-black shadow-[0_4px_0_0_#b45309] active:shadow-[0_1px_0_0_#b45309] active:translate-y-[3px] cursor-pointer'
                    : 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed opacity-50'
                }`}
              >
                <span className="text-xs md:text-sm font-black tracking-wide">+{step} Tr.</span>
                <span className={`text-[10px] font-semibold mt-0.5 ${canAfford ? 'text-amber-950' : 'text-slate-400'}`}>
                  ({formatCurrency(targetBid)})
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Footer: Công tắc Auto-Bid & Nút Rút lui */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-amber-300/80">
        <button
          type="button"
          onClick={() => setAutoBid((prev) => !prev)}
          disabled={hasPassed || isDeclinedPlayer}
          className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
            autoBid
              ? 'bg-amber-500 text-amber-950 font-black border-amber-700 shadow-[0_2px_0_0_#b45309]'
              : 'bg-slate-200 text-slate-700 border-slate-400 hover:bg-slate-300'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${autoBid ? 'bg-amber-900' : 'bg-slate-400'}`} />
          <span>AUTO-BID</span>
        </button>

        <button
          type="button"
          onClick={onPass ?? onClose}
          disabled={hasPassed || isDeclinedPlayer}
          className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-100 hover:bg-rose-200 border-2 border-rose-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 cursor-pointer"
        >
          {isDeclinedPlayer ? 'Không Thể Tham Gia' : hasPassed ? 'Đã Rút Lui' : 'Rút Lui / Bỏ Cuộc'}
        </button>
      </div>
    </div>
  );
}
