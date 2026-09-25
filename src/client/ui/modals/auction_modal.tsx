// [UI-S04/MSS] AuctionModal — Glassmorphism Dual-Wing 3D Auction Arena Overlay & Fast Bid Carousel
import React, { useEffect, useMemo, useState } from 'react';
import { getDeedDisplayInfo, calculateAuctionIncrements } from './modal_helpers';
import { formatCurrency } from '../ui_helpers';
import { COLOR_GROUP_HEX } from '../../../domain/theme';
import { useGameStore } from '../../store/game_store';
import type { PlayerInfo } from '../../store/game_store_types';
import { AuctionDistrictCard } from './auction_district_card';

export interface AuctionModalProps {
  readonly cellIndex: number;
  readonly currentBid: number;
  readonly startingBid?: number;
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
  readonly isForeclosure?: boolean;
  readonly isFireSale?: boolean;
  readonly insolvencyPlayerId?: string;
  readonly playersInfo?: Record<string, Partial<PlayerInfo>>;
  readonly levelMap?: Record<number, number>;
  readonly onBid?: (newAmount: number) => void;
  readonly onPass?: () => void;
  readonly onClose?: () => void;
}

export function AuctionModal({
  cellIndex,
  currentBid,
  startingBid,
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
  isForeclosure = false,
  isFireSale = false,
  insolvencyPlayerId,
  playersInfo: propPlayersInfo,
  levelMap: propLevelMap,
  onBid,
  onPass,
  onClose,
}: AuctionModalProps): React.ReactElement {
  const deed = getDeedDisplayInfo(cellIndex);
  const basePrice = deed?.price ?? (startingBid ? Math.round(startingBid / 0.70) : currentBid);
  const floorPrice = startingBid ?? Math.floor(basePrice * 0.70);
  const hasBidder = Boolean(highestBidderId);
  const increments = useMemo(
    () => calculateAuctionIncrements(currentBid, isFireSale, hasBidder),
    [currentBid, isFireSale, hasBidder]
  );
  const isUrgent = timeRemaining <= 5;
  const timerPercent = Math.min(100, Math.max(0, (timeRemaining / Math.max(20, timeRemaining)) * 100));
  const ribbonColor = deed?.colorGroup ? COLOR_GROUP_HEX[deed.colorGroup] : '#eab308';
  const isLeading = Boolean(myId && highestBidderId === myId);
  const displayName = isLeading ? 'Bạn' : (bidderName ?? (highestBidderId ? `Người Chơi (${highestBidderId})` : 'Chưa có ai'));

  const storePlayersInfo = useGameStore((s) => s.playersInfo);
  const playersInfo = propPlayersInfo ?? storePlayersInfo;
  const debtor = insolvencyPlayerId ? playersInfo?.[insolvencyPlayerId] : undefined;
  const debtorName = debtor?.name;
  const [autoBid, setAutoBid] = useState<boolean>(false);

  // Xử lý tự động đặt giá nếu bật Auto-Bid
  useEffect(() => {
    if (autoBid && !isConcluded && !isLeading && !hasPassed && !isDeclinedPlayer && onBid) {
      const minBid = increments[0];
      if (minBid && (myBalance === undefined || minBid <= myBalance)) {
        onBid(minBid);
      }
    }
  }, [autoBid, isConcluded, isLeading, hasPassed, isDeclinedPlayer, currentBid, increments, myBalance, onBid]);

  // Tự động đóng modal sau 2.5s khi phiên đấu giá gõ búa thành công
  useEffect(() => {
    if (isConcluded && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isConcluded, onClose]);

  const activePlayers = Object.values(playersInfo ?? {}).filter((p) => !p.bankrupt && !p.isBankrupt);

  return (
    <div
      data-testid="auction-modal"
      className="w-full max-w-lg md:max-w-3xl lg:max-w-4xl bg-[#FFFBEB] border-2 border-slate-900 rounded-3xl p-3 sm:p-4 md:p-5 shadow-[0_4px_0_0_#b45309] space-y-1.5 sm:space-y-2.5 pointer-events-auto relative select-none text-slate-900 max-h-[90dvh] flex flex-col overflow-hidden"
    >
      {/* Vùng Live Region cho Trình Đọc Màn Hình [WCAG 4.1.3] */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {`Giá thầu cao nhất hiện tại: ${formatCurrency(currentBid)}, người dẫn đầu: ${displayName}, thời gian còn lại: ${timeRemaining} giây`}
      </div>

      {/* Banner kết luận phiên đấu giá */}
      {isConcluded && (
        (winnerId ?? highestBidderId) ? (
          <div className="bg-amber-100 border-2 border-amber-500 rounded-2xl p-2 sm:p-2.5 text-center shadow-md animate-pulse shrink-0">
            <div className="text-lg sm:text-2xl mb-0.5" aria-hidden="true">🔨🎉</div>
            <h3 className="font-black text-amber-950 text-xs sm:text-sm uppercase tracking-wider">
              BÚA GÕ THÀNH CÔNG!
            </h3>
            <p className="text-[11px] sm:text-xs font-bold text-amber-900 mt-0.5">
              {isForeclosure
                ? (myId && insolvencyPlayerId === myId
                    ? `${displayName} đã trúng đấu giá giải cứu ${deed?.name ?? `Ô #${cellIndex}`} với giá ${formatCurrency(finalPrice ?? currentBid)}. Khoản tiền này đã được cấn trừ vào nợ của bạn!`
                    : `${displayName} đã trúng đấu giá giải cứu ${deed?.name ?? `Ô #${cellIndex}`} với giá ${formatCurrency(finalPrice ?? currentBid)}!`)
                : `${displayName} đã trúng đấu giá ${deed?.name ?? `Ô #${cellIndex}`} với giá ${formatCurrency(finalPrice ?? currentBid)}!`}
            </p>
          </div>
        ) : (
          <div className="bg-slate-100 border-2 border-slate-400 rounded-2xl p-2 sm:p-2.5 text-center shadow-md shrink-0">
            <div className="text-lg sm:text-2xl mb-0.5" aria-hidden="true">⚠️🏛️</div>
            <h3 className="font-black text-slate-800 text-xs sm:text-sm uppercase tracking-wider">
              ĐẤU GIÁ BẤT THÀNH
            </h3>
            <p className="text-[11px] sm:text-xs font-bold text-slate-600 mt-0.5">
              Không có người chơi nào đặt giá. Bất động sản {deed?.name ?? `Ô #${cellIndex}`} được chuyển sang phát mãi Kho Bạc 70% giá trị ({formatCurrency(floorPrice)}).
            </p>
          </div>
        )
      )}

      {/* Header phiên đấu giá */}
      <div className="flex items-center justify-between border-b border-amber-300/80 pb-1.5 sm:pb-2.5 shrink-0">
        <div className="flex items-center gap-2 min-w-0 shrink-0">
          <span className="text-xl sm:text-2xl shrink-0" aria-hidden="true">🔨</span>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 whitespace-nowrap">
              SÀN ĐẤU GIÁ TRỰC TUYẾN
            </h2>
            <p className="text-[10px] sm:text-xs text-amber-800 font-mono font-bold leading-none">LIVE TABLETOP ARENA</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {isConcluded ? (
            <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-400 whitespace-nowrap">
              ĐÃ KẾT THÚC
            </span>
          ) : isForeclosure ? (
            <span className="px-1.5 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-400 flex items-center gap-0.5 sm:gap-1 animate-pulse whitespace-nowrap shrink-0">
              <span>⚠️ PHÁT MÃI CƯỠNG CHẾ (-30%)</span>
            </span>
          ) : (
            <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-400 whitespace-nowrap">
              ĐANG MỞ
            </span>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng sàn đấu giá"
              className="min-w-[44px] min-h-[44px] w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-100 hover:bg-amber-200 border border-amber-300 text-slate-800 font-black shadow-sm flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 transition-colors cursor-pointer shrink-0"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Banner cảnh báo thanh lý nợ */}
      {isForeclosure && (
        <div className="bg-rose-50 border border-rose-300 rounded-xl p-1.5 sm:p-2 text-xs text-rose-900 flex items-center gap-1.5 sm:gap-2 shrink-0">
          <span className="text-base sm:text-lg shrink-0" aria-hidden="true">🚨</span>
          <div className="min-w-0">
            <span className="font-bold block uppercase tracking-wider text-rose-950 text-[10px] sm:text-xs truncate">
              {`TÀI SẢN PHÁT MẠI THANH LÝ NỢ${debtorName ? ` • ${debtorName}` : ''}`}
            </span>
            <span className="text-[10px] sm:text-xs text-rose-700 block truncate">
              {myId && insolvencyPlayerId === myId
                ? 'Phát mãi giá sàn 70% để cấn trừ nợ. Tiền thặng dư (nếu có) sẽ được hoàn trả.'
                : 'Khởi điểm 70% giá gốc bắt đáy sinh lời! Tiền đấu giá dùng để cấn trừ nợ.'}
            </span>
          </div>
        </div>
      )}

      {/* Tên BĐS & Phân khu quy hoạch (Hero Header Chung - Đặt bên ngoài 2 cột để luôn hiển thị trên mobile) */}
      <div data-testid="auction-hero-header" className="flex items-center gap-2 bg-amber-50/40 p-1.5 sm:p-2 rounded-xl border border-amber-900/10 shrink-0">
        <div className="w-2.5 h-7 sm:w-3.5 sm:h-9 rounded-md shrink-0 shadow border border-slate-900" style={{ backgroundColor: ribbonColor }} />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm md:text-base truncate">{deed?.name ?? `Ô #${cellIndex}`}</h3>
          <p className="text-[10px] sm:text-xs text-slate-600 truncate">
            {isForeclosure ? (
              <>
                Giá gốc: <span className="line-through text-slate-400 mr-1">{formatCurrency(basePrice)}</span>
                ➔ Giá sàn: <span className="text-rose-600 font-bold">{formatCurrency(floorPrice)} (-30%)</span>
              </>
            ) : (
              <>
                Giá khởi điểm: <span className="text-slate-900 font-bold">{formatCurrency(basePrice)}</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Vùng nội dung cuộn độc lập [P1/P4] */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-0.5 sm:pr-1 space-y-1.5 sm:space-y-2.5 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* Bố cục 2 cột Desktop & Thứ tự hiển thị tối ưu trên Mobile [Zero-Scroll Tabletop] */}
        <div className="flex flex-col md:grid md:grid-cols-2 gap-1.5 sm:gap-2.5 md:gap-4 items-start">
          {/* Khối 1: Bục Đấu Giá (Trên Mobile hiển thị ĐẦU TIÊN: order-1 md:order-2) */}
          <div
            data-testid="auction-unified-podium"
            className="w-full bg-amber-50/40 p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl border border-amber-900/10 space-y-1 sm:space-y-1.5 order-1 md:order-2 md:col-start-2 md:row-start-1 md:pl-5"
          >
            {/* Dòng trên: Giá thầu hiện tại & Thời gian còn lại */}
            <div className="flex items-center justify-between text-xs whitespace-nowrap gap-2">
              <span className="font-bold text-slate-600 uppercase tracking-wider text-[10px] sm:text-xs whitespace-nowrap shrink-0">
                GIÁ THẦU HIỆN TẠI
              </span>
              <div className="flex items-center gap-1 sm:gap-1.5 whitespace-nowrap shrink-0">
                <span className={`w-2 h-2 rounded-full shrink-0 ${isUrgent ? 'bg-rose-500 animate-ping' : 'bg-amber-500'}`} />
                <span className="text-slate-600 font-bold text-[10px] sm:text-xs whitespace-nowrap">
                  THỜI GIAN CÒN LẠI:
                </span>
                <span className={`font-mono font-black text-xs md:text-sm ${isUrgent ? 'text-rose-600 animate-pulse' : 'text-amber-800'}`}>
                  {timeRemaining.toString().padStart(2, '0')} GIÂY
                </span>
              </div>
            </div>

            {/* Thanh thời gian mini */}
            <div className="w-full h-1 sm:h-1.5 bg-slate-200 rounded-full overflow-hidden border border-slate-300/60">
              <div
                className={`h-full transition-all duration-300 ${isUrgent ? 'bg-rose-500' : 'bg-amber-500'}`}
                style={{ width: `${timerPercent}%` }}
              />
            </div>

            {/* Ở giữa: data-testid="flip-counter" */}
            <div
              data-testid="flip-counter"
              className="tracking-widest font-mono font-black text-base sm:text-2xl md:text-3xl text-amber-400 bg-slate-900 py-0.5 sm:py-1 px-3 sm:px-4 rounded-xl shadow-inner border border-slate-700 text-center whitespace-nowrap"
            >
              {formatCurrency(currentBid)}
            </div>

            {/* Dòng dưới: Dẫn đầu */}
            <div className="flex items-center justify-between text-xs pt-0.5 whitespace-nowrap">
              <span className="font-bold text-slate-600 text-[10px] sm:text-xs shrink-0">DẪN ĐẦU:</span>
              <div className="flex items-center gap-1 truncate max-w-[200px]">
                {highestBidderId ? (
                  <>
                    <span aria-hidden="true" className="shrink-0">👑</span>
                    <span className={`font-bold truncate text-[11px] sm:text-xs ${isLeading ? 'text-emerald-700 font-black' : 'text-slate-900'}`}>
                      {displayName}
                    </span>
                  </>
                ) : (
                  <span className="text-slate-500 font-medium text-[11px] sm:text-xs">Chưa có ai</span>
                )}
              </div>
            </div>
          </div>

          {/* Khối 2: Tình Báo Phân Khu & Biểu Phí Thuê (Trên Mobile hiển thị THỨ HAI: order-2 md:order-1) */}
          <div className="w-full order-2 md:order-1 md:col-start-1 md:row-start-1 md:row-span-2">
            <AuctionDistrictCard
              cellIndex={cellIndex}
              currentBid={currentBid}
              myId={myId}
              playersInfo={playersInfo}
              levelMap={propLevelMap}
              isForeclosure={isForeclosure}
            />
          </div>

          {/* Khối 3: Danh sách đại gia & Ví tiền (Trên Mobile hiển thị THỨ BA: order-3 md:order-2) */}
          <div className="w-full space-y-1 bg-amber-50/40 p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl border border-amber-900/10 order-3 md:order-2 md:col-start-2 md:row-start-2 md:pl-5">
            <div className="flex items-center justify-between text-xs pb-0.5 border-b border-amber-900/10">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] sm:text-xs">
                ĐẠI GIA THAM GIA
              </span>
              <span className="font-medium text-slate-700 text-[10px] sm:text-xs">
                Ví của bạn: <span className="font-mono font-bold text-emerald-700">{myBalance !== undefined ? formatCurrency(myBalance) : '---'}</span>
              </span>
            </div>
            <div className="space-y-0.5 sm:space-y-1 max-h-16 sm:max-h-20 overflow-y-auto pr-1 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {activePlayers.length > 0 ? (
                activePlayers.map((p) => {
                  const isBidder = p.id === highestBidderId;
                  const isMe = p.id === myId;
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between text-xs px-2 py-0.5 rounded-lg ${
                        isBidder
                          ? 'bg-amber-100/80 text-amber-950 font-bold'
                          : 'bg-white/60 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full shrink-0 border border-slate-900"
                          style={{ backgroundColor: p.tokenColor ?? '#F59E0B' }}
                        />
                        <span className="truncate max-w-[100px] sm:max-w-[160px] font-medium min-w-0 text-[11px] sm:text-xs">{p.name}</span>
                        {isMe && (
                          <span className="text-[10px] font-bold text-amber-800 shrink-0">(Bạn)</span>
                        )}
                        {isBidder && (
                          <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-1 py-0.2 rounded border border-amber-300 shrink-0">
                            👑 Dẫn đầu
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[11px] sm:text-xs font-bold shrink-0">{formatCurrency(p.balance ?? 0)}</span>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-slate-600 text-center py-0.5">
                  {displayName ? `Dẫn đầu: ${displayName}` : 'Chưa có người chơi kết nối'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer cố định chân modal [P1]: Trạng thái, Cụm nút nâng giá & Footer Auto-Bid / Rút lui / Đóng */}
      <div className="sticky bottom-0 shrink-0 -mx-3 sm:-mx-4 md:-mx-5 -mb-3 sm:-mb-4 md:-mb-5 p-2 sm:p-3 md:p-3.5 bg-[#FFFBEB] border-t border-amber-300/80 z-20 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] space-y-1.5 sm:space-y-2">
        {/* Trạng thái & Các nút nâng giá nhanh */}
        {isDeclinedPlayer ? (
          <div className="p-1.5 sm:p-2.5 bg-amber-100 rounded-xl text-center border border-amber-300">
            <p className="text-[11px] sm:text-xs font-bold text-amber-900 leading-tight">
              {isForeclosure
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
                    {targetBid === 0 ? 'Bắt Đáy (0 Tr.)' : (diff > 0 ? `+${diff} Tr.` : `${targetBid} Tr.`)}
                  </span>
                  <span className={`text-[10px] sm:text-xs font-semibold mt-0.5 whitespace-nowrap ${canAfford && !isConcluded ? 'text-amber-950' : 'text-slate-400'}`}>
                    ({formatCurrency(targetBid)})
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Footer: Công tắc Auto-Bid & Nút Rút lui */}
        <div className="flex items-center justify-between gap-2 sm:gap-3 pt-1.5 sm:pt-2 border-t border-amber-300/80">
          <button
            type="button"
            onClick={() => setAutoBid((prev) => !prev)}
            disabled={hasPassed || isDeclinedPlayer || isConcluded}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 whitespace-nowrap ${
              hasPassed || isDeclinedPlayer || isConcluded
                ? 'bg-slate-200 text-slate-400 border-slate-300 opacity-50 cursor-not-allowed'
                : autoBid
                  ? 'bg-amber-500 text-amber-950 font-black border-amber-700 shadow-[0_2px_0_0_#b45309] cursor-pointer'
                  : 'bg-slate-200 text-slate-700 border-slate-400 hover:bg-slate-300 cursor-pointer'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${autoBid ? 'bg-amber-900' : 'bg-slate-400'}`} />
            <span>AUTO-BID</span>
          </button>

          {isConcluded ? (
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 border-2 border-amber-600 shadow-[0_2px_0_0_#b45309] transition-all active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer whitespace-nowrap"
            >
              Đóng / Xem Bàn Cờ
            </button>
          ) : hasPassed ? (
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 sm:px-5 py-1.5 sm:py-2 rounded-xl text-xs font-black text-amber-950 bg-amber-400 hover:bg-amber-300 border-2 border-amber-600 shadow-[0_2px_0_0_#b45309] transition-all active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer whitespace-nowrap"
            >
              Đã Rút Lui • Đóng
            </button>
          ) : isDeclinedPlayer ? (
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 sm:px-5 py-1.5 sm:py-2 rounded-xl text-xs font-black text-amber-950 bg-amber-400 hover:bg-amber-300 border-2 border-amber-600 shadow-[0_2px_0_0_#b45309] transition-all active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer whitespace-nowrap"
            >
              Đóng / Xem Bàn Cờ
            </button>
          ) : (
            <button
              type="button"
              onClick={onPass ?? onClose}
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-100 hover:bg-rose-200 border-2 border-rose-300 transition-all active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 cursor-pointer whitespace-nowrap"
            >
              Rút Lui / Bỏ Cuộc
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
