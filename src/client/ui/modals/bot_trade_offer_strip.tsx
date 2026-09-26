// [IMP-195] InlineBotTradeStrip — 1-Tap Unobtrusive Bot Trade Offer Bar
import React, { useEffect, useState, useRef } from 'react';
import { useGameStore } from '../../store/game_store.js';
import { useLobbyStore } from '../../store/lobby_store.js';
import { BOARD_CONFIG } from '../../../domain/board_config.js';
import { formatCurrency, formatShortPlayerName } from '../ui_helpers.js';
import { AudioEngine } from '../../audio/audio_engine.js';
import { SoundEffect } from '../../audio/audio_types.js';
import type { PlayerIntent } from '../../../server/intent_dispatcher.js';

export interface InlineBotTradeStripProps {
  readonly onIntent?: (intent: PlayerIntent) => void;
  readonly localPlayerId?: string;
}

export function InlineBotTradeStrip({
  onIntent,
  localPlayerId,
}: InlineBotTradeStripProps): React.ReactElement | null {
  const isSSR = typeof window === 'undefined';
  const storeOffer = useGameStore((state) => state.pendingTradeOffer);
  const pendingTradeOffer = isSSR ? useGameStore.getState().pendingTradeOffer : storeOffer;

  const storeActiveModal = useGameStore((state) => state.activeModal);
  const activeModal = isSSR ? useGameStore.getState().activeModal : storeActiveModal;

  const storePlayers = useGameStore((state) => state.playersInfo);
  const playersInfo = isSSR ? useGameStore.getState().playersInfo : storePlayers;

  const storePid = useLobbyStore((state) => state.myPlayerId);
  const lobbyPid = isSSR ? useLobbyStore.getState().myPlayerId : storePid;
  const myId = localPlayerId || lobbyPid || 'p1';

  const [remainingMs, setRemainingMs] = useState<number>(() =>
    pendingTradeOffer ? Math.max(0, pendingTradeOffer.expiresAt - Date.now()) : 0
  );
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!pendingTradeOffer) {
      setRemainingMs(0);
      return;
    }

    const updateTimer = () => {
      if (pendingTradeOffer.sellerId !== myId) return;
      const left = Math.max(0, pendingTradeOffer.expiresAt - Date.now());
      setRemainingMs(left);
      if (left <= 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        onIntent?.({
          type: 'INTENT_RESPOND_TRADE_OFFER',
          offerId: pendingTradeOffer.offerId,
          accept: false,
        });
        useGameStore.getState().setPendingTradeOffer(null);
      }
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 100);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [pendingTradeOffer, onIntent, myId]);

  if (!pendingTradeOffer || pendingTradeOffer.sellerId !== myId || activeModal === 'bot_trade_offer') {
    return null;
  }

  const buyer = playersInfo[pendingTradeOffer.buyerId];
  const buyerName = buyer?.name ? formatShortPlayerName(buyer.name) : 'Bot AI';
  const isSwap = pendingTradeOffer.offeredCellIndex !== undefined;

  const targetCell = BOARD_CONFIG[pendingTradeOffer.cellIndex];
  const targetName = targetCell?.name ? targetCell.name.split(' (')[0] : `Ô #${pendingTradeOffer.cellIndex}`;

  const offeredCell = isSwap && pendingTradeOffer.offeredCellIndex !== undefined
    ? BOARD_CONFIG[pendingTradeOffer.offeredCellIndex]
    : undefined;
  const offeredName = offeredCell?.name ? offeredCell.name.split(' (')[0] : `Ô #${pendingTradeOffer.offeredCellIndex}`;

  const myPlayer = playersInfo[myId];
  const myBalance = myPlayer?.balance ?? 0;
  const price = pendingTradeOffer.price;
  const isNegativeCash = price < 0;
  const absCash = Math.abs(price);
  // Invariant [IMP-199]: Phá sản hoặc âm tiền không thể chấp nhận giao dịch bất lợi/ngang giá (Server Guard)
  const isSolventForTrade = !isNegativeCash ? (myBalance >= 0 || price > 0) : myBalance >= absCash;
  const canAfford = isSolventForTrade && !myPlayer?.bankrupt;

  const secondsLeft = Math.ceil(remainingMs / 1000);

  const handleAccept = () => {
    if (!canAfford) return;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    AudioEngine.playSfx(SoundEffect.BUY_PROPERTY);
    onIntent?.({
      type: 'INTENT_RESPOND_TRADE_OFFER',
      offerId: pendingTradeOffer.offerId,
      accept: true,
    });
    useGameStore.getState().setPendingTradeOffer(null);
  };

  const handleReject = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    AudioEngine.playSfx(SoundEffect.CARD_FLIP);
    onIntent?.({
      type: 'INTENT_RESPOND_TRADE_OFFER',
      offerId: pendingTradeOffer.offerId,
      accept: false,
    });
    useGameStore.getState().setPendingTradeOffer(null);
  };

  const handleInspect = () => {
    useGameStore.getState().openModal('bot_trade_offer', pendingTradeOffer);
  };

  return (
    <div
      data-testid="inline-bot-trade-strip"
      role="region"
      aria-label="Đề xuất giao dịch từ Bot"
      className="w-full sm:max-w-md flex flex-col gap-1.5 p-2 bg-[#FFFDF8] border-2 border-amber-500 rounded-xl shadow-[0_3px_0_0_#d97706] text-slate-900 pointer-events-auto select-none animate-in fade-in slide-in-from-bottom-2 duration-150"
    >
      {/* Tầng 1: Metadata, Đếm ngược & Xem chi tiết */}
      <div className="flex items-center justify-between gap-1.5 min-w-0 text-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm shrink-0" aria-hidden="true">🤖</span>
          <span className="text-[11px] font-black text-amber-800 truncate">
            {buyerName} <span className="font-semibold text-slate-600">{isSwap ? 'đề xuất đổi đất' : 'muốn mua đất'}</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full border border-amber-300">
            {secondsLeft}s
          </span>
          <button
            type="button"
            onClick={handleInspect}
            data-testid="inline-bot-inspect-btn"
            title="Xem chi tiết & nguy cơ độc quyền"
            className="flex items-center gap-0.5 px-1.5 py-0.5 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md transition-colors cursor-pointer"
          >
            <span>ℹ️</span>
            <span className="text-[10px]">Chi tiết</span>
          </button>
        </div>
      </div>

      {/* Tầng 2: Thông tin BĐS & Cặp nút xúc giác công thái học */}
      <div className="flex items-center justify-between gap-2 min-w-0 pt-1 border-t border-amber-200/60">
        <div className="flex items-center gap-1.5 min-w-0 flex-1 text-xs">
          {!isSwap ? (
            <div className="flex items-center gap-1.5 min-w-0 truncate">
              <span className="truncate font-extrabold text-slate-900">{targetName}</span>
              <span className="shrink-0 font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                +{formatCurrency(price)}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 min-w-0 truncate text-[11px]">
              <span className="text-slate-600 shrink-0">Đổi:</span>
              <span className="font-extrabold text-slate-900 truncate">{targetName}</span>
              <span className="text-amber-600 font-bold shrink-0">⇄</span>
              <span className="font-extrabold text-slate-900 truncate">{offeredName}</span>
              {isNegativeCash ? (
                <span className="text-rose-600 font-black whitespace-nowrap shrink-0">
                  (Bù {formatCurrency(absCash)})
                </span>
              ) : price > 0 ? (
                <span className="shrink-0 font-black text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">
                  +{formatCurrency(price)}
                </span>
              ) : (
                <span className="text-slate-600 whitespace-nowrap shrink-0">(Ngang)</span>
              )}
            </div>
          )}
        </div>

        {/* Cặp nút hành động xúc giác lớn */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleReject}
            data-testid="inline-bot-reject-btn"
            aria-label="Từ chối đề xuất"
            className="min-h-[38px] sm:min-h-[40px] px-2.5 sm:px-3 py-1 bg-slate-200 hover:bg-slate-300 border-2 border-slate-400 text-slate-800 rounded-lg text-xs font-black shadow-[0_2px_0_0_#94a3b8] active:shadow-none active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-1"
          >
            <span>✕</span>
            <span>TỪ CHỐI</span>
          </button>

          <button
            type="button"
            onClick={handleAccept}
            disabled={!canAfford}
            data-testid="inline-bot-accept-btn"
            title={!canAfford ? 'Thiếu tiền bù' : undefined}
            className={`min-h-[38px] sm:min-h-[40px] px-3 sm:px-3.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer border-2 flex items-center justify-center gap-1 ${
              !canAfford
                ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed shadow-none'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-800 shadow-[0_2px_0_0_#065f46] active:shadow-none active:translate-y-0.5'
            }`}
          >
            <span>✓</span>
            <span>{!canAfford ? 'Thiếu tiền' : isSwap ? 'ĐỔI' : 'BÁN'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
