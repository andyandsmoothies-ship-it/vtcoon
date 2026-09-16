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
      className="bg-[#FFFDF8] border-4 border-red-500 rounded-2xl shadow-[0_6px_0_0_#0f172a] p-6 w-full max-w-md text-slate-900 select-none flex flex-col gap-4 animate-pulse-subtle"
    >
      {/* Tiêu đề cảnh báo khẩn cấp */}
      <div className="flex items-center justify-between border-b border-rose-300 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 border border-rose-300 flex items-center justify-center font-bold text-xl">
            ⚠️
          </div>
          <div>
            <h2 className="text-base font-black text-rose-700 tracking-wider uppercase">
              Thanh Lý Cưỡng Chế
            </h2>
            <p className="text-xs text-rose-700 font-bold">Cảnh Báo Thanh Khoản Doanh Nghiệp</p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cảnh báo"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-500 hover:text-slate-900 text-lg font-bold p-1 rounded-lg cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
          >
            ✕
          </button>
        )}
      </div>

      {/* Thông tin thâm hụt nợ */}
      <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 flex flex-col gap-1">
        <div className="flex justify-between items-center text-xs text-rose-800 font-semibold">
          <span>Người chơi:</span>
          <span className="font-bold text-slate-900">{playerName ?? 'Bạn'}</span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-slate-700 font-bold">Số tiền thâm hụt:</span>
          <span className="text-2xl sm:text-3xl font-black text-rose-700 tracking-tight font-mono">
            {formattedDeficit}
          </span>
        </div>
      </div>

      {/* Hướng dẫn thoát nợ */}
      <p className="text-xs text-slate-700 leading-relaxed font-medium">
        Bạn phải thế chấp bất động sản hoặc hạ cấp công trình để đưa số dư tài khoản về mức dương trước khi kết thúc lượt!
      </p>

      {/* Các nút hành động */}
      <div className="flex flex-col gap-2 pt-1">
        {onManageProperties && (
          <button
            type="button"
            onClick={onManageProperties}
            className="w-full min-h-[44px] py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-sm cursor-pointer transition-all border-2 border-amber-700 shadow-[0_4px_0_0_#b45309] active:shadow-[0_1px_0_0_#b45309] active:translate-y-[3px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            Quản Lý BĐS / Thế Chấp
          </button>
        )}
        {onDeclareBankruptcy && (
          <button
            type="button"
            onClick={onDeclareBankruptcy}
            className="w-full min-h-[44px] py-2.5 rounded-xl border-2 border-rose-400 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs cursor-pointer transition-all shadow-[0_4px_0_0_#fda4af] active:shadow-[0_1px_0_0_#fda4af] active:translate-y-[3px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            Tuyên Bố Phá Sản (Rời Bàn)
          </button>
        )}
      </div>
    </div>
  );
}
