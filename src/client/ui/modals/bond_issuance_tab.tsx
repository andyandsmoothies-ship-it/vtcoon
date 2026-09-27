import React from 'react';
import type { BondContract } from '../../../domain/bond_types';
import { formatCurrency } from '../ui_helpers';

interface BondIssuanceTabProps {
  readonly bondContract?: BondContract | null;
  readonly balance: number;
  readonly isMyTurn?: boolean;
  readonly playerNetWorth?: number;
  readonly unmortgagedPropertiesCount?: number;
  readonly onIssueBond?: () => void;
  readonly onRepayBond?: () => void;
}

export function BondIssuanceTab({
  bondContract,
  balance,
  isMyTurn,
  playerNetWorth,
  unmortgagedPropertiesCount,
  onIssueBond,
  onRepayBond,
}: BondIssuanceTabProps): React.ReactElement {
  if (bondContract?.isActive) {
    const canRepay = balance >= bondContract.repayAmount && Boolean(isMyTurn);
    return (
      <div className="space-y-4 p-4 bg-amber-500/10 rounded-2xl border border-amber-500/30 text-slate-900">
        <div className="flex items-center justify-between border-b border-amber-900/10 pb-2">
          <h4 className="font-black text-sm text-amber-950 uppercase">Hợp Đồng Trái Phiếu Đang Hoạt Động</h4>
          <span className="text-xs bg-amber-500 text-amber-950 px-2 py-0.5 rounded-full font-bold">
            Còn {bondContract.roundsLeft} vòng
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div><span className="text-slate-500">Khoản Vay Gốc:</span> <strong className="font-mono">{formatCurrency(bondContract.principal)}</strong></div>
          <div><span className="text-slate-500">Số Tiền Đáo Hạn:</span> <strong className="font-mono text-rose-700">{formatCurrency(bondContract.repayAmount)}</strong></div>
          <div className="col-span-2"><span className="text-slate-500">Tài Sản Đảm Bảo:</span> <strong>{bondContract.collateralCells.length} BĐS (Đang Khóa)</strong></div>
        </div>
        <button
          type="button"
          onClick={onRepayBond}
          disabled={!canRepay}
          className={`w-full min-h-[46px] py-2.5 px-4 rounded-xl font-bold text-xs transition-all ${
            canRepay
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-2 border-emerald-800 shadow-[0_4px_0_0_#065f46] active:translate-y-[3px] cursor-pointer'
              : 'bg-slate-200 text-slate-400 border border-slate-300 shadow-none cursor-not-allowed'
          }`}
        >
          {`Tất Toán Trước Hạn (${formatCurrency(bondContract.repayAmount)})`}
        </button>
      </div>
    );
  }

  const hasNetWorth = (playerNetWorth ?? 0) >= 3000;
  const hasEnoughDeeds = (unmortgagedPropertiesCount ?? 0) >= 2;
  const canIssue = Boolean(isMyTurn) && hasNetWorth && hasEnoughDeeds;

  const blockedReason = !isMyTurn
    ? 'Chỉ có thể phát hành trong lượt của bạn'
    : !hasNetWorth
    ? 'Cần tối thiểu 3.000 Net Worth để phát hành trái phiếu'
    : !hasEnoughDeeds
    ? 'Cần sở hữu ít nhất 2 Bất Động Sản chưa thế chấp'
    : undefined;

  return (
    <div className="space-y-4 p-4 bg-amber-500/10 rounded-2xl border border-amber-500/30 text-slate-900 text-xs">
      <div className="border-b border-amber-900/10 pb-2">
        <h4 className="font-black text-sm text-amber-950 uppercase">Đòn Bẩy Trái Phiếu Doanh Nghiệp</h4>
        <p className="text-slate-600 mt-1">Vay 80% Net Worth, kỳ hạn 3 vòng, lãi suất 20% nộp Kho Bạc.</p>
      </div>
      <ul className="space-y-1.5 list-disc pl-4 text-slate-700">
        <li>Tối thiểu Net Worth 3.000.</li>
        <li>Sở hữu ít nhất 2 Bất Động Sản chưa thế chấp.</li>
        <li>Tổng giá trị BĐS đảm bảo phải đạt tối thiểu 50% khoản vay.</li>
        <li>Tài sản đảm bảo bị khóa giao dịch & thế chấp trong thời gian hợp đồng.</li>
      </ul>
      {blockedReason && (
        <div
          data-testid="bond-blocked-notice"
          className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs font-semibold flex items-center gap-1.5"
        >
          <span>⚠️</span>
          <span>{blockedReason}</span>
        </div>
      )}
      <button
        type="button"
        data-testid="issue-bond-btn"
        onClick={() => canIssue && onIssueBond?.()}
        disabled={!canIssue}
        className={`w-full min-h-[46px] py-2.5 px-4 rounded-xl font-black text-xs transition-all ${
          canIssue
            ? 'bg-amber-500 hover:bg-amber-400 text-amber-950 border-2 border-amber-700 shadow-[0_4px_0_0_#b45309] active:translate-y-[3px] cursor-pointer'
            : 'bg-slate-200 text-slate-400 border border-slate-300 shadow-none cursor-not-allowed'
        }`}
      >
        PHÁT HÀNH TRÁI PHIẾU
      </button>
    </div>
  );
}
