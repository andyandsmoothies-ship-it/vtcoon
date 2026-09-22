import React from 'react';
import { formatCurrency } from '../ui_helpers';

export interface TitleDeedActionFooterProps {
  readonly isOwned: boolean;
  readonly isOwner?: boolean;
  readonly isMortgaged?: boolean;
  readonly ownerName?: string;
  readonly canBuy?: boolean;
  readonly isTradeFrozen?: boolean;
  readonly hasUpgrades?: boolean;
  readonly currentLevel?: 0 | 1 | 2 | 3;
  readonly upgradeCost?: number;
  readonly upgradeBlockedReason?: string;
  readonly downgradeBlockedReason?: string;
  readonly deedPrice: number;
  readonly onBuy?: () => void;
  readonly onPass?: () => void;
  readonly onClose?: () => void;
  readonly onMortgage?: () => void;
  readonly onRedeem?: () => void;
  readonly onUpgrade?: () => void;
  readonly onDowngrade?: () => void;
}

export function TitleDeedActionFooter({
  isOwned,
  isOwner,
  isMortgaged,
  ownerName,
  canBuy = true,
  isTradeFrozen,
  hasUpgrades,
  currentLevel,
  upgradeCost,
  upgradeBlockedReason,
  downgradeBlockedReason,
  deedPrice,
  onBuy,
  onPass,
  onClose,
  onMortgage,
  onRedeem,
  onUpgrade,
  onDowngrade,
}: TitleDeedActionFooterProps): React.ReactElement {
  const showUpgrade = Boolean(isOwner && !isMortgaged && hasUpgrades && (currentLevel ?? 0) < 3 && onUpgrade);
  const showDowngrade = Boolean(isOwner && !isMortgaged && hasUpgrades && (currentLevel ?? 0) > 0 && onDowngrade);
  const showMortgage = Boolean(isOwner && (isMortgaged ? onRedeem : onMortgage));
  const actionCount = (showUpgrade ? 1 : 0) + (showDowngrade ? 1 : 0) + (showMortgage ? 1 : 0);
  const closeButtonSpan = (!isOwner || actionCount === 0 || actionCount === 2) ? 'col-span-2' : '';

  return (
    <footer className="relative z-10 p-4 pt-2 bg-[#F7F2E7] border-t border-slate-300 grid grid-cols-2 gap-2 shrink-0">
      {isOwned ? (
        <>
          <div className="col-span-2 min-h-[48px] py-2 px-3 rounded-xl font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-400 text-xs text-center flex items-center justify-center shadow-sm truncate">
            ✓ Đã Sở Hữu {ownerName ? `(${ownerName})` : ''}
          </div>
          {showUpgrade && (
            <button
              type="button"
              onClick={onUpgrade}
              disabled={Boolean(upgradeBlockedReason)}
              title={upgradeBlockedReason}
              className={`min-h-[48px] flex flex-col items-center justify-center py-2 px-2 text-center leading-tight min-w-0 rounded-xl font-bold text-xs transition-all focus-visible:outline-none focus-visible:ring-2 ${
                upgradeBlockedReason
                  ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed shadow-none'
                  : 'bg-teal-600 hover:bg-teal-500 text-white border-2 border-teal-800 shadow-[0_4px_0_0_#115e59] active:shadow-[0_1px_0_0_#115e59] active:translate-y-[3px] focus-visible:ring-teal-400 cursor-pointer'
              }`}
            >
              Nâng Cấp (+{formatCurrency(upgradeCost ?? 0)})
            </button>
          )}
          {showDowngrade && (
            <button
              type="button"
              onClick={onDowngrade}
              disabled={Boolean(downgradeBlockedReason)}
              title={downgradeBlockedReason}
              className={`min-h-[48px] whitespace-nowrap px-3.5 py-2 rounded-xl font-bold text-xs transition-all focus-visible:outline-none focus-visible:ring-2 ${
                downgradeBlockedReason
                  ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed shadow-none'
                  : 'bg-orange-600 hover:bg-orange-500 text-white border-2 border-orange-800 shadow-[0_4px_0_0_#7c2d12] active:shadow-[0_1px_0_0_#7c2d12] active:translate-y-[3px] focus-visible:ring-orange-400 cursor-pointer'
              }`}
            >
              Hạ Cấp (-50%)
            </button>
          )}
          {showMortgage && (
            <button
              type="button"
              onClick={isTradeFrozen && !isMortgaged ? undefined : (isMortgaged ? onRedeem : onMortgage)}
              disabled={Boolean(isTradeFrozen && !isMortgaged)}
              title={isTradeFrozen && !isMortgaged ? 'Thị trường đang đóng băng giao dịch' : undefined}
              className={`min-h-[48px] whitespace-nowrap px-3.5 py-2 rounded-xl font-black text-xs border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                isTradeFrozen && !isMortgaged
                  ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed opacity-60'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-900 border-amber-700 shadow-[0_4px_0_0_#b45309] active:shadow-[0_1px_0_0_#b45309] active:translate-y-[3px] cursor-pointer'
              }`}
            >
              {isMortgaged ? 'Giải Chấp' : 'Thế Chấp'}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className={`${closeButtonSpan} min-h-[48px] whitespace-nowrap px-4 py-2 rounded-xl font-bold text-slate-900 bg-slate-200 hover:bg-slate-300 border-2 border-slate-400 shadow-[0_4px_0_0_#64748b] active:shadow-[0_1px_0_0_#64748b] active:translate-y-[3px] text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer`}
          >
            Đóng
          </button>
          {upgradeBlockedReason && (
            <div className="col-span-2 w-full p-2 rounded-xl bg-amber-100 border border-amber-400 text-amber-900 text-[11px] font-bold text-center">
              ⚠️ {upgradeBlockedReason}
            </div>
          )}
          {downgradeBlockedReason && (
            <div className="col-span-2 w-full p-2 rounded-xl bg-orange-100 border border-orange-400 text-orange-900 text-[11px] font-bold text-center">
              ⚠️ {downgradeBlockedReason}
            </div>
          )}
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={isTradeFrozen ? undefined : onBuy}
            disabled={isTradeFrozen || !canBuy}
            className={`min-h-[48px] flex flex-col items-center justify-center py-2 px-2 text-center leading-tight min-w-0 rounded-xl font-black tracking-wide uppercase text-xs sm:text-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
              isTradeFrozen
                ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                : canBuy
                ? 'bg-emerald-700 hover:bg-emerald-600 border-2 border-emerald-700 shadow-[0_4px_0_0_#065f46] active:shadow-[0_1px_0_0_#065f46] active:translate-y-[3px] text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
            }`}
          >
            {isTradeFrozen ? 'Thị Trường Đóng Băng' : canBuy ? `Mua BĐS (${formatCurrency(deedPrice)})` : 'Không Đủ Tiền'}
          </button>

          <button
            type="button"
            onClick={isTradeFrozen ? onClose : (onPass ?? onClose)}
            className="min-h-[48px] whitespace-nowrap py-3 px-3.5 sm:px-6 rounded-xl uppercase text-xs sm:text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer bg-[#FFFDF8] hover:bg-slate-100 text-slate-800 font-black border-2 border-slate-800 shadow-[0_4px_0_0_#1e293b] active:shadow-none active:translate-y-[3px]"
          >
            {isTradeFrozen ? 'Đóng' : 'Bỏ Qua'}
          </button>
        </>
      )}
    </footer>
  );
}
