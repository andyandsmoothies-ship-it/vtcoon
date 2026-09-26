// [IMP-200] MiniAuctionStrip — Unobtrusive Floating Auction Status Bar for Non-Involved / Minimized Bidders
import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/game_store.js';
import { BOARD_CONFIG } from '../../../domain/board_config.js';
import { formatCurrency, formatShortPlayerName } from '../ui_helpers.js';
import { TurnPhase } from '../../../domain/room.js';

export function MiniAuctionStrip(): React.ReactElement | null {
  const isSSR = typeof window === 'undefined';
  const ssrState = isSSR ? useGameStore.getState() : null;
  const auctionStore = useGameStore((s) => s.auction);
  const activeModalStore = useGameStore((s) => s.activeModal);
  const turnPhaseStore = useGameStore((s) => s.turnPhase);
  const playersInfoStore = useGameStore((s) => s.playersInfo);

  const auction = ssrState ? ssrState.auction : auctionStore;
  const activeModal = ssrState ? ssrState.activeModal : activeModalStore;
  const turnPhase = ssrState ? ssrState.turnPhase : turnPhaseStore;
  const playersInfo = ssrState ? ssrState.playersInfo : playersInfoStore;

  const [displaySeconds, setDisplaySeconds] = useState(auction?.timeRemaining ?? 0);

  // Authoritative Resync: Đồng bộ mỗi khi server delta cập nhật timeRemaining (triệt tiêu client drift)
  useEffect(() => {
    setDisplaySeconds(auction?.timeRemaining ?? 0);
  }, [auction?.timeRemaining]);

  // Đếm ngược local từng giây mượt mà giữa các delta ticks
  useEffect(() => {
    if (!auction || auction.isConcluded || displaySeconds <= 0) return;
    const timer = setInterval(() => {
      setDisplaySeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [auction?.cellIndex, auction?.isConcluded, auction?.timeRemaining]);

  const isVisible = Boolean(
    auction &&
    activeModal !== 'auction' &&
    (turnPhase === TurnPhase.AuctionPhase || !auction.isConcluded)
  );

  if (!isVisible || !auction) return null;

  const baseName = BOARD_CONFIG[auction.cellIndex]?.name ?? `Ô ${auction.cellIndex}`;
  const cellName = auction.cellIndex === 1 ? `${baseName} (Phố Đi Bộ)` : baseName;
  const highestBidderName = auction.highestBidderId
    ? formatShortPlayerName(playersInfo[auction.highestBidderId]?.name ?? auction.highestBidderId, 12)
    : 'Chưa có ai';
  const isUrgent = displaySeconds <= 3 && !auction.isConcluded;

  return (
    <div
      data-testid="mini-auction-strip"
      className="w-full sm:max-w-md flex items-center justify-between gap-1.5 sm:gap-2 px-2.5 py-1.5 bg-[#FFFDF8] border-2 border-amber-500 rounded-xl shadow-[0_3px_0_0_#d97706] text-slate-900 pointer-events-auto select-none animate-in fade-in slide-in-from-bottom-2 duration-150"
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-base shrink-0" aria-hidden="true">🏛️</span>
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] sm:text-xs font-black truncate text-amber-950 min-w-0">
            Đấu giá: {cellName}
          </span>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-600 whitespace-nowrap min-w-0">
            <span className="shrink-0">Giá: <strong className="text-amber-800 font-mono font-black">{formatCurrency(auction.currentBid ?? 0)}</strong></span>
            <span className="shrink-0">•</span>
            <span className="truncate min-w-0">👑 {highestBidderName}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <div className={`px-2 py-0.5 rounded-md font-mono font-black text-xs ${isUrgent ? 'bg-rose-100 text-rose-700 animate-pulse border border-rose-300' : 'bg-amber-100 text-amber-900 border border-amber-300'}`}>
          {displaySeconds}s
        </div>
        <button
          type="button"
          onClick={() => useGameStore.getState().restoreAuction()}
          className="min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-black text-amber-950 bg-amber-400 hover:bg-amber-300 border border-amber-600 shadow-[0_2px_0_0_#b45309] active:translate-y-[1px] transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
        >
          <span>👁️</span>
          <span>Mở Lại</span>
        </button>
      </div>
    </div>
  );
}
