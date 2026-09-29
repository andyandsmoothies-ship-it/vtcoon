import React from 'react';
import { formatCurrency } from '../ui_helpers';
import type { PropertyCardActionState } from './portfolio_monopoly_analytics';

export interface PropertyCardActionsProps {
  readonly cellIndex: number;
  readonly level: number;
  readonly isMort: boolean;
  readonly mortgageVal: number;
  readonly redeemCost: number;
  readonly currentBalance: number;
  readonly actionState: PropertyCardActionState;
  readonly upgradeInfo?: {
    readonly canUpgrade: boolean;
    readonly nextLevel?: number;
    readonly upgradeCost?: number;
    readonly blockedReason?: string;
    readonly reason?: string;
  };
  readonly onUpgrade?: (cellIndex: number) => void;
  readonly onMortgage?: (cellIndex: number) => void;
  readonly onRedeem?: (cellIndex: number) => void;
  readonly onDowngrade?: (cellIndex: number) => void;
  readonly onSelectDeed?: (cellIndex: number) => void;
}

export function PropertyCardActions({
  cellIndex,
  level,
  isMort,
  mortgageVal,
  redeemCost,
  currentBalance,
  actionState,
  upgradeInfo,
  onUpgrade,
  onMortgage,
  onRedeem,
  onDowngrade,
  onSelectDeed,
}: PropertyCardActionsProps): React.ReactElement {
  return (
    <div className="space-y-2">
      {/* Cụm Nút Nâng Cấp Nhanh 1-Click */}
      {upgradeInfo && !isMort && (
        <div className="my-2">
          <button
            type="button"
            data-testid="property-quick-build-btn"
            disabled={!upgradeInfo.canUpgrade}
            title={upgradeInfo.blockedReason ?? upgradeInfo.reason}
            onClick={() => upgradeInfo.canUpgrade && onUpgrade?.(cellIndex)}
            className={`w-full min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              upgradeInfo.canUpgrade
                ? 'bg-amber-400 hover:bg-amber-300 text-amber-950 border-2 border-amber-600 shadow-[0_3px_0_0_#d97706] active:translate-y-[2px] cursor-pointer'
                : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-70'
            }`}
          >
            <span>
              {upgradeInfo.canUpgrade
                ? `🏗️ Xây C${upgradeInfo.nextLevel} (${formatCurrency(upgradeInfo.upgradeCost ?? 0)})`
                : (level >= 3 ? 'Cấp Tối Đa' : `🏗️ Xây C${upgradeInfo.nextLevel ?? (level + 1)}`)}
            </span>
          </button>
          {!upgradeInfo.canUpgrade && (upgradeInfo.blockedReason ?? upgradeInfo.reason) && (
            <span className="text-[11px] text-slate-500 italic mt-1 block text-center truncate" title={upgradeInfo.blockedReason ?? upgradeInfo.reason}>
              {upgradeInfo.blockedReason ?? upgradeInfo.reason}
            </span>
          )}
        </div>
      )}

      {/* Cụm Nút Thế Chấp / Giải Chấp / Hạ Cấp */}
      <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-1.5 text-xs">
        {!isMort && (
          <div className="col-span-2 space-y-1">
            <button
              type="button"
              data-testid={`mortgage-btn-${cellIndex}`}
              onClick={() => actionState.canMortgage && onMortgage?.(cellIndex)}
              disabled={!actionState.canMortgage}
              title={actionState.mortgageBlockedReason}
              className={`col-span-2 w-full min-h-[44px] px-3 py-2 font-bold rounded-lg border-2 text-xs transition-all inline-flex items-center justify-center ${
                actionState.canMortgage
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-300 shadow-[0_2px_0_0_#fecdd3] active:translate-y-[1px] cursor-pointer'
                  : 'bg-slate-100 text-slate-400 border-slate-200 shadow-none cursor-not-allowed opacity-75'
              }`}
            >
              {actionState.canMortgage
                ? `Thế Chấp (+${formatCurrency(mortgageVal)})`
                : `${actionState.mortgageButtonLabel} (+${formatCurrency(mortgageVal)})`}
            </button>
            {!actionState.canMortgage && (actionState.mortgageSubHint ?? actionState.mortgageBlockedReason) && (
              <span className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 py-1 block text-center font-medium">
                ⚠️ {actionState.mortgageSubHint ?? actionState.mortgageBlockedReason}
              </span>
            )}
          </div>
        )}

        {isMort && (
          <button
            type="button"
            data-testid={`redeem-btn-${cellIndex}`}
            onClick={() => onRedeem?.(cellIndex)}
            disabled={currentBalance < redeemCost}
            className="col-span-2 min-h-[44px] px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-lg border-2 border-emerald-800 shadow-[0_3px_0_0_#065f46] active:translate-y-[2px] transition-all text-xs cursor-pointer disabled:cursor-not-allowed disabled:shadow-none inline-flex items-center justify-center"
          >
            Giải Chấp (-{formatCurrency(redeemCost)})
          </button>
        )}

        {level > 0 && !isMort && onDowngrade && (
          <div className="col-span-1 space-y-1">
            <button
              type="button"
              data-testid={`downgrade-btn-${cellIndex}`}
              onClick={() => actionState.canDowngrade && onDowngrade(cellIndex)}
              disabled={!actionState.canDowngrade}
              title={actionState.downgradeBlockedReason}
              className={`col-span-1 w-full min-h-[44px] px-3 py-2 font-bold rounded-lg border-2 text-xs transition-all inline-flex items-center justify-center ${
                actionState.canDowngrade
                  ? 'bg-rose-100 hover:bg-rose-200 text-rose-800 border-rose-300 shadow-[0_2px_0_0_#fecdd3] active:translate-y-[1px] cursor-pointer'
                  : 'bg-slate-100 text-slate-400 border-slate-200 shadow-none cursor-not-allowed opacity-75'
              }`}
            >
              Hạ Cấp
            </button>
            {!actionState.canDowngrade && actionState.downgradeBlockedReason && (
              <span className="text-[10px] text-slate-500 italic block text-center truncate" title={actionState.downgradeBlockedReason}>
                {actionState.downgradeBlockedReason}
              </span>
            )}
          </div>
        )}

        {onSelectDeed && (
          <button
            type="button"
            onClick={() => onSelectDeed(cellIndex)}
            className={`${level > 0 && !isMort && onDowngrade ? 'col-span-1' : 'col-span-2'} min-h-[44px] px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg border-2 border-slate-300 shadow-[0_2px_0_0_#cbd5e1] active:shadow-none active:translate-y-[1px] text-xs cursor-pointer inline-flex items-center justify-center`}
          >
            Sổ Đỏ ↗
          </button>
        )}
      </div>
    </div>
  );
}
