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

  if (!pendingTradeOffer || pendingTradeOffer.sellerId !== myId) {
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
  const canAfford = !isNegativeCash || myBalance >= absCash;

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
      className="w-full flex items-center justify-between gap-1.5 sm:gap-2 px-2.5 py-1.5 bg-[#FFFDF8] border-2 border-amber-500 rounded-xl shadow-[0_3px_0_0_#d97706] text-slate-900 pointer-events-auto select-none animate-in fade-in slide-in-from-bottom-2 duration-150"
    >
      {/* Tóm tắt đề xuất */}
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <span className="text-base shrink-0" aria-hidden="true">🤖</span>
        <div className="flex items-center gap-1 min-w-0 truncate text-xs font-bold">
          <span className="text-amber-800 shrink-0 font-extrabold">{buyerName}:</span>
          {!isSwap ? (
            <span className="truncate">
              Mua <span className="text-slate-900 font-extrabold">{targetName}</span> (
              <span className="text-emerald-700 font-black">{formatCurrency(price)}</span>)
            </span>
          ) : (
            <span className="truncate">
              Đổi <span className="text-slate-900 font-extrabold">{offeredName}</span> lấy{' '}
              <span className="text-slate-900 font-extrabold">{targetName}</span>{' '}
              {isNegativeCash ? (
                <span className="text-rose-600 font-black whitespace-nowrap">
                  (Bù {formatCurrency(absCash)})
                </span>
              ) : price > 0 ? (
                <span className="text-emerald-700 font-black whitespace-nowrap">
                  (+{formatCurrency(price)})
                </span>
              ) : (
                <span className="text-slate-600 whitespace-nowrap">(Ngang giá)</span>
              )}
            </span>
          )}
        </div>
        <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full shrink-0 border border-amber-300">
          {secondsLeft}s
        </span>
      </div>

      {/* Cụm nút hành động 1-chạm */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={handleInspect}
          title="Xem chi tiết & nguy cơ độc quyền"
          className="px-1.5 py-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
        >
          ℹ️
        </button>

        <button
          type="button"
          onClick={handleReject}
          data-testid="inline-bot-reject-btn"
          aria-label="Bỏ qua đề xuất"
          className="px-2 py-1 bg-slate-200 hover:bg-slate-300 border border-slate-400 text-slate-800 rounded-lg text-xs font-black transition-colors cursor-pointer"
        >
          ✕<span className="hidden sm:inline"> BỎ QUA</span>
        </button>

        <button
          type="button"
          onClick={handleAccept}
          disabled={!canAfford}
          data-testid="inline-bot-accept-btn"
          title={!canAfford ? 'Thiếu tiền bù' : undefined}
          className={`px-2.5 py-1 rounded-lg text-xs font-black transition-transform cursor-pointer border ${
            !canAfford
              ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-700 active:translate-y-0.5'
          }`}
        >
          {!canAfford ? 'Thiếu tiền' : isSwap ? '✓ ĐỔI' : '✓ BÁN'}
        </button>
      </div>
    </div>
  );
}
