import React, { useState } from 'react';
import { HOSE_OUTCOMES } from '../../../domain/event_card_types';
import { formatCurrency } from '../ui_helpers';

export interface HoseModalProps {
  readonly myBalance?: number;
  readonly defaultStake?: number;
  readonly lastDiceRoll?: number;
  readonly lastPayout?: number;
  readonly onInvest: (stake: number) => void;
  readonly onSkip: () => void;
  readonly onClose: () => void;
}

const STAKE_PRESETS = [500, 1000, 2000, 3000] as const;

export function HoseModal({
  myBalance = 15000,
  defaultStake = 500,
  lastDiceRoll,
  lastPayout,
  onInvest,
  onSkip,
  onClose,
}: HoseModalProps): React.ReactElement {
  const initialStake = STAKE_PRESETS.includes(defaultStake as (typeof STAKE_PRESETS)[number])
    ? defaultStake
    : 500;
  const [stake, setStake] = useState<number>(initialStake);

  const canAfford = Number.isFinite(myBalance) && myBalance >= stake;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sàn Giao Dịch Chứng Khoán HOSE"
      className="bg-slate-900 border-2 border-amber-500/40 rounded-2xl shadow-2xl p-6 w-full max-w-md text-white select-none flex flex-col gap-4"
    >
      {/* Tiêu đề & Thông tin Sàn */}
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg">
            📈
          </div>
          <div>
            <h2 className="text-lg font-bold text-amber-300 tracking-wide">SÀN CHỨNG KHOÁN HOSE</h2>
            <p className="text-xs text-slate-400">Ô 38 — Đầu tư lướt sóng theo xúc xắc 1D6</p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Đóng"
          className="text-slate-400 hover:text-white text-xl font-bold p-1 cursor-pointer transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Kết quả ván trước nếu có */}
      {lastDiceRoll !== undefined && (
        <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between">
          <span className="text-xs text-slate-300">Điểm xúc xắc 1D6: <strong className="text-amber-400">{lastDiceRoll}</strong></span>
          <span className="text-xs font-semibold text-emerald-400">
            Tiền thu về: {formatCurrency(lastPayout ?? 0)}
          </span>
        </div>
      )}

      {/* Bảng tỷ lệ khớp lệnh HOSE 1D6 */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Bảng Tỷ Lệ Khớp Lệnh (1D6)
        </span>
        <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
          {Object.entries(HOSE_OUTCOMES).map(([face, mult]) => {
            const isProfit = mult > 1;
            const isLoss = mult < 1;
            const colorClass = isProfit ? 'text-emerald-400 bg-emerald-950/40 border-emerald-700/40' :
              isLoss ? 'text-rose-400 bg-rose-950/40 border-rose-700/40' :
              'text-amber-300 bg-amber-950/40 border-amber-700/40';
            const label = isProfit ? `+${Math.round((mult - 1) * 100)}%` :
              isLoss ? `${Math.round((mult - 1) * 100)}%` : 'Hoà';
            return (
              <div key={face} className={`p-1.5 rounded-lg border flex flex-col items-center ${colorClass}`}>
                <span className="font-bold">Mặt {face}</span>
                <span className="text-[10px] font-medium">{mult.toFixed(2)}x ({label})</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chọn mức cược */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-300 font-medium">Hạn mức cược:</span>
          <span className="text-slate-400">Số dư: <strong className="text-amber-300">{formatCurrency(myBalance)}</strong></span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {STAKE_PRESETS.map((amount) => {
            const isSelected = stake === amount;
            const disabled = !Number.isFinite(myBalance) || myBalance < amount;
            return (
              <button
                key={amount}
                disabled={disabled}
                onClick={() => setStake(amount)}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                    : disabled
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {formatCurrency(amount)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Nút hành động */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onSkip}
          className="flex-1 py-2.5 rounded-xl border border-slate-600 hover:bg-slate-800 text-slate-300 font-semibold text-sm cursor-pointer transition-colors"
        >
          Bỏ Qua
        </button>
        <button
          disabled={!canAfford}
          onClick={() => onInvest(stake)}
          className={`flex-1 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-all shadow-md ${
            canAfford
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          Đặt Cược {formatCurrency(stake)}
        </button>
      </div>
    </div>
  );
}
