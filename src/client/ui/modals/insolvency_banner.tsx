import React from 'react';
import { formatCurrency } from '../ui_helpers';

export interface InsolvencyBannerProps {
  readonly playerId: string;
  readonly playerName?: string;
  readonly deficit: number;
  readonly onManageProperties?: () => void;
  readonly onDeclareBankruptcy?: () => void;
  readonly onClose?: () => void;
}

export function InsolvencyBanner({
  playerName,
  deficit,
  onManageProperties,
  onDeclareBankruptcy,
  onClose,
}: InsolvencyBannerProps): React.ReactElement {
  const absDeficit = Math.abs(Number.isFinite(deficit) ? deficit : 0);
  const formattedDeficit = formatCurrency(absDeficit > 0 ? -absDeficit : 0);

  return (
    <div
      role="alert"
      aria-label="Cảnh báo thanh lý cưỡng chế"
      className="bg-slate-950 border-2 border-rose-600/80 rounded-2xl shadow-2xl shadow-rose-950/60 p-6 w-full max-w-md text-white select-none flex flex-col gap-4 animate-pulse-subtle"
    >
      {/* Tiêu đề cảnh báo khẩn cấp */}
      <div className="flex items-center justify-between border-b border-rose-900/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-600/20 text-rose-500 flex items-center justify-center font-bold text-xl">
            ⚠️
          </div>
          <div>
            <h2 className="text-base font-extrabold text-rose-400 tracking-wider uppercase">
              Thanh Lý Cưỡng Chế
            </h2>
            <p className="text-xs text-slate-400">UC-GAME-055 — Mất khả năng thanh toán</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Đóng cảnh báo"
            className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Thông tin thâm hụt nợ */}
      <div className="bg-rose-950/30 border border-rose-800/40 rounded-xl p-4 flex flex-col gap-1">
        <div className="flex justify-between items-center text-xs text-rose-300">
          <span>Người chơi:</span>
          <span className="font-semibold text-white">{playerName ?? 'Bạn'}</span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-slate-300 font-medium">Số tiền thâm hụt:</span>
          <span className="text-lg font-black text-rose-400 tracking-tight">
            {formattedDeficit}
          </span>
        </div>
      </div>

      {/* Hướng dẫn thoát nợ */}
      <p className="text-xs text-slate-300 leading-relaxed">
        Bạn phải thế chấp bất động sản hoặc hạ cấp công trình để đưa số dư tài khoản về mức dương trước khi kết thúc lượt!
      </p>

      {/* Các nút hành động */}
      <div className="flex flex-col gap-2 pt-1">
        {onManageProperties && (
          <button
            onClick={onManageProperties}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-black text-sm cursor-pointer transition-all shadow-md shadow-amber-500/20"
          >
            Quản Lý BĐS / Thế Chấp
          </button>
        )}
        {onDeclareBankruptcy && (
          <button
            onClick={onDeclareBankruptcy}
            className="w-full py-2.5 rounded-xl border border-rose-700/60 hover:bg-rose-950/50 text-rose-400 font-semibold text-xs cursor-pointer transition-colors"
          >
            Tuyên Bố Phá Sản (Rời Bàn)
          </button>
        )}
      </div>
    </div>
  );
}
