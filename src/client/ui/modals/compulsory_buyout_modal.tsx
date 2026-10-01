// [UI-S04/MSS][IMP-145][IMP-231] Compulsory Buyout Modal (130% Compensation & Target Selection)
import React, { useEffect, useState } from 'react';
import { BOARD_CONFIG } from '../../../domain/board_config.js';
import { COLOR_GROUP_HEX } from '../../../domain/theme.js';
import { formatCurrency } from '../ui_helpers.js';
import { useGameStore } from '../../store/game_store.js';
import type { BuyoutTargetOption } from '../../../domain/room.js';

export interface CompulsoryBuyoutModalProps {
  readonly buyerId: string;
  readonly sellerId: string;
  readonly cellIndex: number;
  readonly cost: number;
  readonly basePrice: number;
  readonly expiresAt: number;
  readonly eligibleTargets?: readonly BuyoutTargetOption[];
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
  eligibleTargets,
  onBuyout,
  onDecline,
}: CompulsoryBuyoutModalProps): React.ReactElement {
  const [selectedCell, setSelectedCell] = useState(cellIndex);
  // [SSR & Test Harness Hydration Guard]
  // Trong Browser (CSR): useGameStore hook reactive 100%, tự động re-render khi playersInfo thay đổi.
  // Trong SSR / renderToStaticMarkup: useSyncExternalStore trả về getServerSnapshot (initial state rỗng),
  // nên cần fallback về getState().playersInfo để phục vụ các bài kiểm thử headless contract.
  const storePlayersInfo = useGameStore((state) => state.playersInfo);
  const playersInfo = (storePlayersInfo && Object.keys(storePlayersInfo).length > 0
    ? storePlayersInfo
    : useGameStore.getState().playersInfo) ?? {};
  const buyer = playersInfo[buyerId];

  const currentTarget = eligibleTargets?.find((t) => t.cellIndex === selectedCell) ?? {
    cellIndex,
    sellerId,
    cost,
    basePrice,
  };

  const seller = playersInfo[currentTarget.sellerId];
  const sellerName = seller?.name ?? 'Đối thủ';

  const cell = BOARD_CONFIG[currentTarget.cellIndex];
  const propertyName = cell?.name ?? `Ô Đất #${currentTarget.cellIndex}`;
  const cellColor = cell?.colorGroup ? COLOR_GROUP_HEX[cell.colorGroup] : '#3b82f6';

  // [IMP-229][IMP-231] Relative Countdown & Dynamic Progress Bar (Server Authoritative)
  const initialTimeLeft = Math.max(0, expiresAt - Date.now());
  const safeInitialMs = initialTimeLeft > 0 ? initialTimeLeft : 15_000;
  const [totalMs] = useState(safeInitialMs);
  const [remainingMs, setRemainingMs] = useState(safeInitialMs);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingMs((prev) => {
        const next = Math.max(0, prev - 100);
        if (next <= 0) {
          clearInterval(timer);
        }
        return next;
      });
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const secondsLeft = Math.ceil(remainingMs / 1000);
  const progressPercent = totalMs > 0 ? Math.min(100, Math.max(0, (remainingMs / totalMs) * 100)) : 0;
  const isUrgent = secondsLeft <= 5;
  const canAfford = (buyer?.balance ?? 0) >= currentTarget.cost;

  return (
    <div
      data-testid="compulsory-buyout-modal"
      className="w-full max-w-md max-h-[90dvh] overflow-y-auto bg-[#FFFDF8] border-2 border-amber-900/25 rounded-2xl shadow-2xl flex flex-col pointer-events-auto"
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

      {/* Progress Bar Dynamic */}
      <div className="w-full bg-amber-950/20 h-1.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-100 ease-linear ${
            isUrgent ? 'bg-rose-500 animate-pulse' : 'bg-amber-400'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="p-4 flex flex-col gap-3">
        {/* Selector nếu có nhiều hơn 1 ô đất C0 hợp lệ */}
        {eligibleTargets && eligibleTargets.length > 1 && (
          <div data-testid="buyout-cell-selector" className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Chọn Ô Đất Mục Tiêu ({eligibleTargets.length} ô C0):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {eligibleTargets.map((target) => {
                const isSelected = target.cellIndex === selectedCell;
                const targetCell = BOARD_CONFIG[target.cellIndex];
                const targetColor = targetCell?.colorGroup ? COLOR_GROUP_HEX[targetCell.colorGroup] : '#3b82f6';
                return (
                  <button
                    key={target.cellIndex}
                    type="button"
                    data-testid={`buyout-target-option-${target.cellIndex}`}
                    onClick={() => setSelectedCell(target.cellIndex)}
                    className={`min-h-[44px] p-2 rounded-xl border-2 text-left flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-600 bg-amber-100/90 shadow-[0_2px_0_0_#d97706] text-amber-950 font-black'
                        : 'border-amber-900/20 bg-white/80 hover:bg-amber-50 text-slate-700 font-semibold'
                    }`}
                  >
                    <span
                      className="w-2.5 h-6 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: targetColor }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] truncate leading-tight">
                        {targetCell?.name ?? `Ô #${target.cellIndex}`}
                      </div>
                      <div className="text-[10px] font-mono font-bold text-emerald-700">
                        {formatCurrency(target.cost)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Chi tiết ô đất & Giá đền bù */}
        <div className="p-3.5 bg-[#F7F2E7] border border-amber-900/15 rounded-xl flex flex-col gap-2.5 shadow-sm">
          <div className="flex justify-between items-start gap-2">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {cell?.colorGroup && (
                <span
                  className="w-3 h-8 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: cellColor }}
                />
              )}
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Ô Đất C0 Mục Tiêu</span>
                <p className="text-base font-black text-slate-900 leading-tight truncate">{propertyName}</p>
              </div>
            </div>
            <div className="text-right shrink-0 whitespace-nowrap ml-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Giá Gốc</span>
              <p className="text-xs font-bold text-slate-600 line-through">{formatCurrency(currentTarget.basePrice)}</p>
            </div>
          </div>

          <div className="h-px bg-amber-900/10" />

          <div className="flex justify-between items-center bg-white/70 p-2.5 rounded-lg border border-amber-900/10">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Chi Phí Mua Lại (130%)</span>
              <p className="text-xs text-slate-500 font-medium">Bao gồm 30% thặng dư đền bù chủ sở hữu</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-emerald-700 tracking-tight">{formatCurrency(currentTarget.cost)}</span>
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

        {/* Cảnh báo thiếu tiền nếu không đủ trả 130% */}
        {!canAfford && (
          <div
            data-testid="buyout-shortfall-notice"
            className="p-2 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between text-xs text-amber-900 font-semibold"
          >
            <span>⚠️ Số dư ví không đủ đền bù 130%</span>
            <span className="font-bold text-rose-700">Thiếu: {formatCurrency(currentTarget.cost - (buyer?.balance ?? 0))}</span>
          </div>
        )}

        {/* Action Buttons: 2 Cột đối xứng 1 hàng */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            data-testid="buyout-confirm-btn"
            onClick={() => canAfford && remainingMs > 0 && onBuyout(selectedCell)}
            disabled={!canAfford || remainingMs <= 0}
            className={`h-full min-h-[48px] px-3 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              canAfford && remainingMs > 0
                ? 'text-white bg-emerald-600 hover:bg-emerald-700 border-2 border-emerald-800 shadow-[0_4px_0_0_#065f46] active:translate-y-[3px] cursor-pointer'
                : 'bg-slate-200 text-slate-400 border border-slate-300 shadow-none cursor-not-allowed'
            }`}
          >
            <span>💰</span>
            <span>{remainingMs <= 0 ? 'Hết Thời Gian Mua' : `Mua Lại (${formatCurrency(currentTarget.cost)})`}</span>
          </button>
          <button
            type="button"
            data-testid="buyout-decline-btn"
            onClick={onDecline}
            className="h-full min-h-[48px] px-3 py-2 rounded-xl border-2 border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 font-black text-xs uppercase tracking-wider shadow-[0_4px_0_0_#fca5a5] active:translate-y-[3px] transition-all inline-flex items-center justify-center cursor-pointer"
          >
            ✕ Từ Chối Mua
          </button>
        </div>
      </div>
    </div>
  );
}
