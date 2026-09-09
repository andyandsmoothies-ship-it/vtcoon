// [UI-S04/MSS] TitleDeedModal — Vietnamese land use certificate (Giấy chứng nhận quyền sử dụng đất)
import React from 'react';
import { getDeedDisplayInfo } from './modal_helpers';
import { formatCurrency } from '../ui_helpers';
import { COLOR_GROUP_HEX } from '../../../domain/theme';
import { CellType } from '../../../domain/board_config';

export interface TitleDeedModalProps {
  readonly cellIndex: number;
  readonly canBuy?: boolean;
  readonly isOwned?: boolean;
  readonly ownerName?: string;
  readonly onBuy?: () => void;
  readonly onPass?: () => void;
  readonly onClose?: () => void;
}

const PROPERTY_LEVELS = ['Đất Nền (C0)', 'Nhà Phố (C1)', 'Khách Sạn (C2)', 'TTTM (C3)'] as const;
const RAILROAD_LEVELS = ['1 Bến / Ga', '2 Bến / Ga', '3 Bến / Ga', '4 Bến / Ga'] as const;

export function TitleDeedModal({
  cellIndex,
  canBuy = true,
  isOwned = false,
  ownerName,
  onBuy,
  onPass,
  onClose,
}: TitleDeedModalProps): React.ReactElement {
  const deed = getDeedDisplayInfo(cellIndex);

  if (!deed) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl text-center max-w-sm text-slate-200">
        <p className="text-sm">Không tìm thấy thông tin Sổ Đỏ cho ô #{cellIndex}.</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs"
        >
          Đóng
        </button>
      </div>
    );
  }

  const ribbonColor = deed.colorGroup ? COLOR_GROUP_HEX[deed.colorGroup] : '#334155';
  const hasUpgrades = deed.upgradeCosts.some((cost) => cost > 0);
  const isRailroad = deed.cellType === CellType.Railroad;
  const isUtility = deed.cellType === CellType.Utility;
  const levelLabels = isRailroad ? RAILROAD_LEVELS : PROPERTY_LEVELS;

  return (
    <div
      className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
      data-testid="title-deed-modal"
    >
      {/* Băng màu nhóm đất & tên địa danh */}
      <header className="p-4 text-center shadow-md relative" style={{ backgroundColor: ribbonColor }}>
        <p className="text-[10px] uppercase tracking-widest text-white/80 font-medium">
          {isRailroad ? 'Giấy Chứng Nhận Hạ Tầng Giao Thông' : isUtility ? 'Giấy Phép Khai Thác Tiện Ích' : 'Giấy Chứng Nhận Quyền Sở Hữu'}
        </p>
        <h2 className="text-lg font-black uppercase tracking-wide text-white drop-shadow-sm mt-0.5">
          {deed.name}
        </h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng Sổ Đỏ"
            className="absolute top-3 right-3 text-white/70 hover:text-white text-lg font-bold leading-none p-1"
          >
            ✕
          </button>
        )}
      </header>

      {/* Thông tin giá niêm yết & thế chấp */}
      <div className="p-4 space-y-3 text-xs md:text-sm">
        <div className="grid grid-cols-2 gap-2 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50">
          <div>
            <span className="text-slate-400 block text-[11px]">Giá niêm yết</span>
            <span className="text-emerald-400 font-bold">{formatCurrency(deed.price)}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Giá trị thế chấp</span>
            <span className="text-amber-400 font-bold">{formatCurrency(deed.mortgageValue)}</span>
          </div>
        </div>

        {/* Bảng giá thuê / phí dịch vụ */}
        <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-3 space-y-2">
          <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
            {isRailroad ? 'Biểu Phí Theo Số Ga Sở Hữu' : isUtility ? 'Phí Dịch Vụ Cơ Bản' : 'Biểu Phí Dừng Chân'}
          </p>
          {isUtility ? (
            <div className="text-xs space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span>Phí cơ sở (1 trạm):</span>
                <span className="font-bold text-slate-100">{formatCurrency(deed.rents[0])}</span>
              </div>
              <p className="text-[10px] text-slate-500 italic mt-1">
                * Thu 4× điểm xúc xắc (1 trạm) hoặc 10× điểm xúc xắc (khi sở hữu cả 2 trạm).
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {deed.rents.map((rent, idx) => (
                <div key={levelLabels[idx]} className="flex justify-between items-center text-xs">
                  <div className="flex flex-col">
                    <span className="text-slate-300 font-medium">{levelLabels[idx]}</span>
                    {hasUpgrades && idx > 0 && deed.upgradeCosts[idx - 1]! > 0 && (
                      <span className="text-[10px] text-slate-500">
                        Nâng cấp: +{formatCurrency(deed.upgradeCosts[idx - 1]!)}
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-slate-100">{formatCurrency(rent)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Nút hành động Mua / Bỏ qua hoặc Trạng thái đã sở hữu */}
      <footer className="p-4 pt-1 bg-slate-900/90 border-t border-slate-800/80 flex gap-2">
        {isOwned ? (
          <>
            <div className="flex-1 py-2 px-3 rounded-xl font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-600/40 text-xs text-center flex items-center justify-center">
              ✓ Đã Sở Hữu {ownerName ? `(${ownerName})` : ''}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs transition-all active:scale-95"
            >
              Đóng
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onBuy}
              disabled={!canBuy}
              className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-white shadow-md text-sm transition-all duration-150 ${
                canBuy
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              {canBuy ? `Mua BĐS (${formatCurrency(deed.price)})` : 'Không Đủ Tiền'}
            </button>

            <button
              type="button"
              onClick={onPass ?? onClose}
              className="px-4 py-2.5 rounded-xl font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-sm transition-all active:scale-95"
            >
              Bỏ Qua
            </button>
          </>
        )}
      </footer>
    </div>
  );
}
