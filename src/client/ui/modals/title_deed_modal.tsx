// [UI-S04/MSS] TitleDeedModal — Thẻ bài Game Vật Lý Sổ Đỏ (Tactile Game Card Title Deed)
import React from 'react';
import { getDeedDisplayInfo } from './modal_helpers';
import { formatCurrency } from '../ui_helpers';
import { COLOR_GROUP_HEX } from '../../../domain/theme';
import { CellType } from '../../../domain/board_config';

export interface TitleDeedModalProps {
  readonly cellIndex: number;
  readonly canBuy?: boolean;
  readonly isOwned?: boolean;
  readonly isOwner?: boolean;
  readonly isMortgaged?: boolean;
  readonly ownerName?: string;
  readonly currentLevel?: 0 | 1 | 2 | 3;
  readonly upgradeCost?: number;
  readonly onBuy?: () => void;
  readonly onPass?: () => void;
  readonly onClose?: () => void;
  readonly onMortgage?: () => void;
  readonly onRedeem?: () => void;
  readonly onUpgrade?: () => void;
  readonly onDowngrade?: () => void;
}

const PROPERTY_TIERS = [
  { chip: 'C0', label: 'Đất Nền', icon: '🚩', sub: 'Phí dừng chân cơ bản' },
  { chip: 'C1', label: 'Nhà Phố', icon: '🏡', sub: 'Phí thuê + chi phí nâng cấp' },
  { chip: 'C2', label: 'Khách Sạn', icon: '🏨', sub: 'Phí thuê + chi phí nâng cấp' },
  { chip: 'C3', label: 'Quần thể Resort/TTTM', icon: '👑', sub: 'Phí thuê tối đa' },
] as const;

const RAILROAD_TIERS = [
  { chip: '1 Ga', label: '1 Bến / Ga', icon: '🚊', sub: '1 trạm vận tải' },
  { chip: '2 Ga', label: '2 Bến / Ga', icon: '🚊', sub: '2 trạm kết nối' },
  { chip: '3 Ga', label: '3 Bến / Ga', icon: '🚊', sub: '3 trạm liên kết' },
  { chip: '4 Ga', label: '4 Bến / Ga', icon: '👑', sub: 'Toàn mạng lưới' },
] as const;

export function TitleDeedModal({
  cellIndex,
  canBuy = true,
  isOwned = false,
  isOwner = false,
  isMortgaged = false,
  ownerName,
  currentLevel,
  upgradeCost,
  onBuy,
  onPass,
  onClose,
  onMortgage,
  onRedeem,
  onUpgrade,
  onDowngrade,
}: TitleDeedModalProps): React.ReactElement {
  const deed = getDeedDisplayInfo(cellIndex);

  if (!deed) {
    return (
      <div className="bg-slate-900 border-2 border-amber-400/50 p-6 rounded-2xl text-center max-w-sm text-slate-200 shadow-2xl">
        <p className="text-sm">Không tìm thấy thông tin Sổ Đỏ cho ô #{cellIndex}.</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 min-h-[48px] px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 transition-all inline-flex items-center justify-center whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
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
  const tiers = isRailroad ? RAILROAD_TIERS : PROPERTY_TIERS;

  return (
    <div
      className="relative w-full max-w-sm max-h-[90vh] md:max-h-[85vh] bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.3)] ring-2 ring-amber-500/40 ring-offset-2 ring-offset-slate-950 rounded-2xl overflow-hidden flex flex-col pointer-events-auto animate-in zoom-in-90 fade-in duration-200 ease-out select-none"
      data-testid="title-deed-modal"
    >
      {/* Khung viền mạ vàng kép dập nổi bên trong (Double Embossed Metallic Rim) */}
      <div
        className="pointer-events-none absolute inset-1.5 rounded-xl border border-amber-400/40 z-10 shadow-[inset_0_0_12px_rgba(245,158,11,0.15)]"
        aria-hidden="true"
      />

      {/* Hoa văn dập chìm Trống Đồng Đông Sơn cổ truyền */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.06] overflow-hidden z-0"
        aria-hidden="true"
      >
        <svg viewBox="0 0 400 400" className="w-[360px] h-[360px] text-amber-300 fill-none stroke-current" strokeWidth="1.5">
          <circle cx="200" cy="200" r="28" fill="currentColor" fillOpacity="0.3" />
          <circle cx="200" cy="200" r="14" fill="currentColor" />
          {Array.from({ length: 14 }).map((_, i) => (
            <polygon
              key={i}
              points="196,160 204,160 200,135"
              fill="currentColor"
              transform={`rotate(${(i * 360) / 14} 200 200)`}
            />
          ))}
          <circle cx="200" cy="200" r="75" strokeDasharray="3 3" />
          <circle cx="200" cy="200" r="95" />
          <circle cx="200" cy="200" r="120" strokeDasharray="6 4" strokeWidth="2" />
          <circle cx="200" cy="200" r="145" />
          <circle cx="200" cy="200" r="165" strokeDasharray="4 2" />
          <circle cx="200" cy="200" r="185" strokeWidth="2.5" />
        </svg>
      </div>

      {/* Ruy-băng tiêu đề (Ribbon Header) bo cong viền vàng dập nổi */}
      <header
        className="p-4 pr-14 pl-14 text-center relative border-b-2 border-amber-400 shadow-lg rounded-b-2xl mx-1.5 mt-1.5 rounded-t-xl shrink-0 z-10"
        style={{ backgroundColor: ribbonColor }}
      >
        <div className="absolute top-2.5 left-2.5 w-2 h-2 rounded-full bg-amber-300 border border-amber-600 shadow-[0_0_4px_rgba(245,158,11,0.8)]" aria-hidden="true" />
        <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-amber-300 border border-amber-600 shadow-[0_0_4px_rgba(245,158,11,0.8)]" aria-hidden="true" />
        <p className="text-[10px] uppercase tracking-widest text-white/95 font-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          {isRailroad ? 'Hạ Tầng Giao Thông' : isUtility ? 'Tiện Ích Quốc Gia' : 'Giấy Chứng Nhận Quyền Sở Hữu'}
        </p>
        <h2 className="text-xl font-black uppercase tracking-wide text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] mt-0.5 break-words">
          {deed.name}
        </h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng Sổ Đỏ"
            className="absolute top-2 right-2 min-w-[48px] min-h-[48px] flex items-center justify-center text-white/80 hover:text-white text-xl font-black rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 transition-colors cursor-pointer"
          >
            ✕
          </button>
        )}
      </header>

      {/* Thông tin giá niêm yết & thế chấp */}
      <div className="relative z-10 flex-1 min-h-0 overflow-y-auto pr-1 p-4 space-y-3 text-xs md:text-sm">
        <div className="grid grid-cols-2 gap-2.5 bg-slate-950/70 p-2.5 rounded-xl border border-amber-400/30 shadow-inner">
          <div className="bg-slate-900/60 p-2 rounded-lg">
            <span className="text-slate-400 block text-[11px] font-medium">Giá niêm yết</span>
            <span className="text-emerald-400 font-extrabold text-sm">{formatCurrency(deed.price)}</span>
          </div>
          <div className="bg-slate-900/60 p-2 rounded-lg">
            <span className="text-slate-400 block text-[11px] font-medium">Giá trị thế chấp</span>
            <span className="text-amber-400 font-extrabold text-sm">{formatCurrency(deed.mortgageValue)}</span>
          </div>
        </div>

        {isMortgaged && (
          <div className="p-2 rounded-xl bg-rose-950/70 border border-rose-600/50 text-rose-300 text-xs text-center font-bold flex items-center justify-center gap-1.5 shadow-sm">
            <span aria-hidden="true">⚠️</span>
            <span>Tài sản đang thế chấp — Tạm ngưng thu phí thuê</span>
          </div>
        )}

        {/* Biểu phí dừng chân C0–C3 dạng Badge Cards có icon và chip phân cấp */}
        <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
              {isRailroad ? 'Biểu Phí Theo Số Ga Sở Hữu' : isUtility ? 'Phí Dịch Vụ Cơ Bản' : 'Biểu Phí Dừng Chân'}
            </p>
            <span className="text-[10px] text-slate-400">VNĐ</span>
          </div>

          {isUtility ? (
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-base" aria-hidden="true">⚡</span>
                  <span className="font-semibold text-slate-200">Phí cơ sở (1 trạm):</span>
                </div>
                <span className="font-bold text-amber-300">{formatCurrency(deed.rents[0])}</span>
              </div>
              <p className="text-[10px] text-slate-400 italic px-1">
                * Thu 4× điểm xúc xắc (1 trạm) hoặc 10× điểm xúc xắc (khi sở hữu cả 2 trạm).
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {deed.rents.map((rent, idx) => {
                const tier = tiers[idx];
                const isMax = idx === 3;
                const cost = hasUpgrades && idx > 0 ? deed.upgradeCosts[idx - 1] : undefined;
                const tierClass = isMax ? 'bg-amber-950/25 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.15)]' : 'bg-slate-900/70 border-slate-800/80';
                return (
                  <div key={tier ? tier.chip : idx} className={`flex justify-between items-center p-2 rounded-xl border transition-all ${tierClass}`}>
                    <div className="flex items-center gap-2">
                      <span className={`text-base ${isMax ? 'drop-shadow-[0_0_8px_rgba(245,158,11,0.9)]' : ''}`} aria-hidden="true">
                        {tier?.icon}
                      </span>
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${
                        isMax ? 'bg-amber-500/20 text-amber-300 border-amber-400/50' : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {tier?.chip}
                      </span>
                      <div className="flex flex-col">
                        <span className={`font-bold text-xs ${isMax ? 'text-amber-300' : 'text-slate-200'}`}>
                          {tier?.label}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {cost && cost > 0 ? `Nâng cấp: +${formatCurrency(cost)}` : tier?.sub}
                        </span>
                      </div>
                    </div>
                    <span className={`font-black text-xs ${isMax ? 'text-amber-400 drop-shadow-[0_1px_4px_rgba(245,158,11,0.5)]' : 'text-slate-100'}`}>
                      {formatCurrency(rent)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Nút hành động 3D tactile vật lý */}
      <footer className="relative z-10 p-4 pt-2 bg-slate-900/90 border-t border-slate-800/90 flex flex-wrap gap-2 shrink-0">
        {isOwned ? (
          <>
            <div className="flex-1 min-h-[48px] py-2 px-3 rounded-xl font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-600/40 text-xs text-center flex items-center justify-center shadow-inner truncate">
              ✓ Đã Sở Hữu {ownerName ? `(${ownerName})` : ''}
            </div>
            {isOwner && !isMortgaged && hasUpgrades && (currentLevel ?? 0) < 3 && onUpgrade && (
              <button
                type="button"
                onClick={onUpgrade}
                className="min-h-[48px] whitespace-nowrap px-3.5 py-2 rounded-xl font-bold text-xs bg-gradient-to-b from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white border-b-4 border-teal-800 active:border-b-0 active:translate-y-1 shadow-lg shadow-teal-950/40 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 cursor-pointer"
              >
                Nâng Cấp (+{formatCurrency(upgradeCost ?? 0)})
              </button>
            )}
            {isOwner && !isMortgaged && hasUpgrades && (currentLevel ?? 0) > 0 && onDowngrade && (
              <button
                type="button"
                onClick={onDowngrade}
                className="min-h-[48px] whitespace-nowrap px-3.5 py-2 rounded-xl font-bold text-xs bg-gradient-to-b from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white border-b-4 border-orange-900 active:border-b-0 active:translate-y-1 shadow-lg shadow-orange-950/40 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 cursor-pointer"
              >
                Hạ Cấp (-50%)
              </button>
            )}
            {isOwner && (isMortgaged ? onRedeem : onMortgage) && (
              <button
                type="button"
                onClick={isMortgaged ? onRedeem : onMortgage}
                className="min-h-[48px] whitespace-nowrap px-3.5 py-2 rounded-xl font-bold text-xs bg-amber-600 hover:bg-amber-500 text-white border-b-4 border-amber-900 active:border-b-0 active:translate-y-1 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer"
              >
                {isMortgaged ? 'Giải Chấp' : 'Thế Chấp'}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] whitespace-nowrap px-4 py-2 rounded-xl font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer"
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
              className={`flex-1 min-h-[48px] whitespace-nowrap py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 truncate cursor-pointer ${
                canBuy
                  ? 'bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 text-white shadow-lg shadow-emerald-950/50'
                  : 'bg-slate-800 text-slate-500 border-b-4 border-slate-900 cursor-not-allowed'
              }`}
            >
              {canBuy ? `Mua BĐS (${formatCurrency(deed.price)})` : 'Không Đủ Tiền'}
            </button>

            <button
              type="button"
              onClick={onPass ?? onClose}
              className="min-h-[48px] whitespace-nowrap px-4 py-2.5 rounded-xl font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer"
            >
              Bỏ Qua
            </button>
          </>
        )}
      </footer>
    </div>
  );
}
