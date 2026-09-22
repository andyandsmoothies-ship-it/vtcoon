// [UI-S04/MSS][IMP-145] Compulsory Buyout Modal (130% Compensation & Self-Determination)
import React, { useEffect, useState } from 'react';
import { BOARD_CONFIG } from '../../../domain/board_config.js';
import { COLOR_GROUP_HEX } from '../../../domain/theme.js';
import { formatCurrency } from '../ui_helpers.js';
import { useGameStore } from '../../store/game_store.js';

export interface CompulsoryBuyoutModalProps {
  readonly buyerId: string;
  readonly sellerId: string;
  readonly cellIndex: number;
  readonly cost: number;
  readonly basePrice: number;
  readonly expiresAt: number;
  readonly onBuyout: (cellIndex: number) => void;
  readonly onDecline: () => void;
  readonly onClose?: () => void;
}

export function CompulsoryBuyoutModal({
  buyerId,
  sellerId,
  cellIndex,
  cost,
  basePrice,
  expiresAt,
  onBuyout,
  onDecline,
}: CompulsoryBuyoutModalProps): React.ReactElement {
  const playersInfo = useGameStore((state) => state.playersInfo);
  const buyer = playersInfo[buyerId];
  const seller = playersInfo[sellerId];
  const sellerName = seller?.name ?? 'Đối thủ';

  const cell = BOARD_CONFIG[cellIndex];
  const propertyName = cell?.name ?? `Ô Đất #${cellIndex}`;
  const cellColor = cell?.colorGroup ? COLOR_GROUP_HEX[cell.colorGroup] : '#3b82f6';

  const [remainingMs, setRemainingMs] = useState(() => Math.max(0, expiresAt - Date.now()));

  useEffect(() => {
    const timer = setInterval(() => {
      const left = Math.max(0, expiresAt - Date.now());
      setRemainingMs(left);
      if (left <= 0) {
        clearInterval(timer);
        onDecline();
      }
    }, 100);
    return () => clearInterval(timer);
  }, [expiresAt, onDecline]);

  const secondsLeft = Math.ceil(remainingMs / 1000);
  const progressPercent = Math.min(100, Math.max(0, (remainingMs / 15_000) * 100));
  const isUrgent = secondsLeft <= 5;
  const canAfford = (buyer?.balance ?? 0) >= cost;

  return (
    <div
      data-testid="compulsory-buyout-modal"
      className="w-full max-w-md bg-[#FFFDF8] border-2 border-amber-900/25 rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compulsory-buyout-modal-title"
    >
      {/* Header */}
      <header className="p-4 bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-amber-950/60 border border-amber-400/40 flex items-center justify-center text-lg shrink-0 shadow-inner">
            🏛️
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 id="compulsory-buyout-modal-title" className="text-sm font-black uppercase tracking-wider text-white">
                Quyền Ưu Tiên Mua Lại Dự Án
              </h2>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-400 text-amber-950 tracking-wider">
                ĐỀN BÙ 130%
              </span>
            </div>
            <p className="text-[11px] text-amber-200 font-medium">
              Chủ sở hữu hiện tại: <span className="font-bold text-white">{sellerName}</span>
            </p>
          </div>
        </div>
        <div
          data-testid="buyout-timer"
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold border transition-colors ${
            isUrgent
              ? 'bg-rose-950/80 text-rose-200 border-rose-400/50 animate-pulse'
              : 'bg-black/30 text-amber-200 border-amber-400/30'
          }`}
        >
          <span>⏱️</span>
          <span>{secondsLeft}s</span>
        </div>
      </header>

      {/* Progress Bar 15s */}
      <div className="w-full bg-amber-950/20 h-1.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-100 ease-linear ${
            isUrgent ? 'bg-rose-500 animate-pulse' : 'bg-amber-400'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="p-4 flex flex-col gap-3">
        {/* Chi tiết ô đất & Giá đền bù */}
        <div className="p-3.5 bg-[#F7F2E7] border border-amber-900/15 rounded-xl flex flex-col gap-2.5 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2.5">
              {cell?.colorGroup && (
                <span
                  className="w-3 h-8 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: cellColor }}
                />
              )}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ô Đất C0 Mục Tiêu</span>
                <p className="text-base font-black text-slate-900 leading-tight">{propertyName}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Giá Gốc</span>
              <p className="text-xs font-bold text-slate-600 line-through">{formatCurrency(basePrice)}</p>
            </div>
          </div>

          <div className="h-px bg-amber-900/10" />

          <div className="flex justify-between items-center bg-white/70 p-2.5 rounded-lg border border-amber-900/10">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Chi Phí Mua Lại (130%)</span>
              <p className="text-xs text-slate-500 font-medium">Bao gồm 30% thặng dư đền bù chủ sở hữu</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-emerald-700 tracking-tight">{formatCurrency(cost)}</span>
            </div>
          </div>
        </div>

        {/* Thông tin ví tiền người chơi */}
        <div className="flex justify-between items-center px-1 text-xs">
          <span className="text-slate-600 font-medium">Số dư khả dụng của bạn:</span>
          <span className={`font-mono font-bold ${canAfford ? 'text-slate-800' : 'text-rose-600'}`}>
            {formatCurrency(buyer?.balance ?? 0)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            data-testid="buyout-decline-btn"
            onClick={onDecline}
            className="h-full min-h-[48px] px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors active:translate-y-0.5 shadow-sm inline-flex items-center justify-center cursor-pointer"
          >
            ✕ Bỏ Qua
          </button>
          <button
            type="button"
            data-testid="buyout-confirm-btn"
            onClick={() => onBuyout(cellIndex)}
            disabled={!canAfford}
            className={`h-full min-h-[48px] px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-md transition-all active:translate-y-0.5 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 leading-tight cursor-pointer ${
              canAfford
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-700/20'
                : 'bg-slate-400 cursor-not-allowed opacity-60'
            }`}
          >
            <span>💰</span>
            <span>Mua Lại ({formatCurrency(cost)})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
