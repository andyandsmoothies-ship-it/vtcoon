// [UI-IMP75/MSS] PropertyPortfolioModal — Danh Mục Bất Động Sản Toàn Diện & Cứu Nợ Khẩn Cấp
import React from 'react';
import { getDeedDisplayInfo } from './modal_helpers';
import { formatCurrency } from '../ui_helpers';
import { COLOR_GROUP_HEX } from '../../../domain/theme';

export interface PropertyPortfolioModalProps {
  readonly ownedProperties: readonly number[];
  readonly propertyStates?: Record<number, {
    readonly ownerId?: string | null;
    readonly level?: number;
    readonly isMortgaged?: boolean;
  }>;
  readonly currentBalance?: number;
  readonly isInInsolvency?: boolean;
  readonly onSelectDeed?: (cellIndex: number) => void;
  readonly onMortgage?: (cellIndex: number) => void;
  readonly onRedeem?: (cellIndex: number) => void;
  readonly onDowngrade?: (cellIndex: number) => void;
  readonly onClose?: () => void;
}

const TIER_NAMES = ['Đất Nền', 'Nhà Phố C1', 'Khách Sạn C2', 'Resort C3'];

export function PropertyPortfolioModal({
  ownedProperties,
  propertyStates = {},
  currentBalance = 0,
  isInInsolvency = false,
  onSelectDeed,
  onMortgage,
  onRedeem,
  onDowngrade,
  onClose,
}: PropertyPortfolioModalProps): React.ReactElement {
  const isNegative = currentBalance < 0 || isInInsolvency;
  const deficitAmount = currentBalance < 0 ? Math.abs(currentBalance) : 0;

  return (
    <div
      role="dialog"
      aria-label="Danh mục bất động sản"
      className="w-full max-w-2xl max-h-[90vh] bg-[#FFFDF8] border-2 border-slate-900 rounded-2xl shadow-[0_6px_0_0_#0f172a] flex flex-col pointer-events-auto text-slate-900 select-none overflow-hidden"
      data-testid="property-portfolio-modal"
    >
      {/* Header */}
      <header className="p-4 bg-[#F7F2E7] border-b border-slate-300 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl" aria-hidden="true">🏛️</span>
          <div>
            <h2 className="text-base font-black uppercase text-slate-900 tracking-wider">
              DANH MỤC BẤT ĐỘNG SẢN
            </h2>
            <p className="text-xs text-slate-600 font-semibold">
              Quản lý tài sản, thế chấp &amp; hạ cấp công trình
            </p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng danh mục BĐS"
            className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-slate-500 hover:text-slate-900 text-xl font-bold rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer"
          >
            ✕
          </button>
        )}
      </header>

      {/* Banner Cứu Nợ Khẩn Cấp nếu đang âm tiền */}
      {isNegative && (
        <div className="bg-rose-50 border-b border-rose-300 p-3.5 flex items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <div>
              <span className="font-bold text-rose-800">Cần Giải Tỏa Thâm Hụt: </span>
              <span className="font-black text-rose-700 text-sm">
                {formatCurrency(currentBalance)}
              </span>
              <p className="text-[11px] text-rose-700 mt-0.5">
                Hãy thế chấp đất hoặc hạ cấp công trình để số dư không còn âm trước khi hết lượt!
              </p>
            </div>
          </div>
          <div className="bg-white border border-rose-300 rounded-lg px-2.5 py-1 text-right shrink-0">
            <span className="text-[10px] text-slate-500 block">Số tiền còn thiếu</span>
            <span className="font-mono font-black text-rose-600 text-xs">
              {deficitAmount.toLocaleString('vi-VN')} Tr.
            </span>
          </div>
        </div>
      )}

      {/* Danh sách BĐS */}
      <div className="p-4 pb-8 overflow-y-auto flex-1 space-y-3">
        {ownedProperties.length === 0 ? (
          <div className="py-12 text-center text-slate-500 italic text-sm">
            Chưa sở hữu bất động sản nào trên bàn cờ.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ownedProperties.map((cellIndex) => {
              const deed = getDeedDisplayInfo(cellIndex);
              const state = propertyStates[cellIndex];
              const isMort = Boolean(state?.isMortgaged);
              const level = state?.level ?? 0;
              const ribbonColor = deed?.colorGroup ? COLOR_GROUP_HEX[deed.colorGroup] : '#64748b';
              const mortgageVal = deed?.mortgageValue ?? 0;
              const redeemCost = Math.round(mortgageVal * 1.1);

              return (
                <div
                  key={cellIndex}
                  data-testid={`property-portfolio-item-${cellIndex}`}
                  className={`border-2 rounded-xl p-3 flex flex-col justify-between transition-all ${
                    isMort
                      ? 'bg-slate-100/80 border-slate-300 opacity-90'
                      : 'bg-white border-slate-300 shadow-sm hover:border-slate-400'
                  }`}
                >
                  {/* Ruy băng & Thông tin cơ bản */}
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-3.5 h-3.5 rounded-full shrink-0 border border-slate-900/30"
                          style={{ backgroundColor: ribbonColor }}
                        />
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {deed?.name ?? `Ô #${cellIndex}`}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">
                        #{cellIndex}
                      </span>
                    </div>

                    {/* Huy hiệu cấp & trạng thái */}
                    <div className="flex items-center gap-2 mb-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold border border-slate-200">
                        {TIER_NAMES[level] ?? 'Đất Nền'}
                      </span>
                      {isMort ? (
                        <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 font-bold border border-rose-300">
                          Đã thế chấp
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                          Hoạt động
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Nút hành động */}
                  <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-1.5 text-xs">
                    {!isMort && (
                      <button
                        type="button"
                        onClick={() => onMortgage?.(cellIndex)}
                        className="flex-1 min-h-[40px] sm:min-h-[44px] px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black rounded-lg border-2 border-amber-700 shadow-[0_3px_0_0_#b45309] active:shadow-[0_1px_0_0_#b45309] active:translate-y-[2px] transition-all text-xs cursor-pointer inline-flex items-center justify-center"
                      >
                        Thế Chấp (+{mortgageVal} Tr.)
                      </button>
                    )}

                    {isMort && (
                      <button
                        type="button"
                        onClick={() => onRedeem?.(cellIndex)}
                        disabled={currentBalance < redeemCost}
                        className="flex-1 min-h-[40px] sm:min-h-[44px] px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-lg border-2 border-emerald-800 shadow-[0_3px_0_0_#065f46] active:shadow-[0_1px_0_0_#065f46] active:translate-y-[2px] transition-all text-xs cursor-pointer disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0 inline-flex items-center justify-center"
                      >
                        Giải Chấp (-{redeemCost} Tr.)
                      </button>
                    )}

                    {level > 0 && !isMort && onDowngrade && (
                      <button
                        type="button"
                        onClick={() => onDowngrade(cellIndex)}
                        className="min-h-[40px] sm:min-h-[44px] px-2.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-lg border-2 border-rose-300 shadow-[0_2px_0_0_#fecdd3] active:shadow-[0_1px_0_0_#fecdd3] active:translate-y-[1px] text-xs cursor-pointer inline-flex items-center justify-center"
                      >
                        Hạ Cấp
                      </button>
                    )}

                    {onSelectDeed && (
                      <button
                        type="button"
                        onClick={() => onSelectDeed(cellIndex)}
                        className="min-h-[44px] px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg border-2 border-slate-300 shadow-[0_2px_0_0_#cbd5e1] active:shadow-none active:translate-y-[1px] text-xs cursor-pointer inline-flex items-center justify-center"
                      >
                        Sổ Đỏ ↗
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="p-3 pb-8 sm:pb-3 bg-[#F7F2E7] border-t border-slate-300 flex items-center justify-between text-xs shrink-0">
        <span className="text-slate-600 font-medium">
          Tổng tài sản sở hữu: <strong className="text-slate-900 font-bold">{ownedProperties.length}</strong> BĐS
        </span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold rounded-xl border-2 border-slate-400 shadow-[0_3px_0_0_#64748b] active:shadow-[0_1px_0_0_#64748b] active:translate-y-[2px] text-xs transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            Đóng
          </button>
        )}
      </footer>
    </div>
  );
}
