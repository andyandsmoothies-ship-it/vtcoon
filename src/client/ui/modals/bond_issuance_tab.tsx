import React from 'react';
import type { BondContract } from '../../../domain/bond_types';
import { formatCurrency } from '../ui_helpers';

interface BondIssuanceTabProps {
  readonly bondContract?: BondContract | null;
  readonly balance: number;
  readonly isMyTurn?: boolean;
  readonly onIssueBond?: () => void;
  readonly onRepayBond?: () => void;
}

export function BondIssuanceTab({
  bondContract,
  balance,
  isMyTurn,
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
          className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all ${
            canRepay ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:translate-y-0.5' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {canRepay ? `Tất Toán Trước Hạn (${formatCurrency(bondContract.repayAmount)})` : `Chưa đủ tiền tất toán (${formatCurrency(bondContract.repayAmount)})`}
        </button>
      </div>
    );
  }

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
      <button
        type="button"
        onClick={onIssueBond}
        disabled={!isMyTurn}
        className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all ${
          isMyTurn ? 'bg-amber-500 hover:bg-amber-400 text-amber-950 shadow-md active:translate-y-0.5 font-black' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
        }`}
      >
        {isMyTurn ? 'Phát Hành Trái Phiếu' : 'Chỉ có thể phát hành trong lượt của bạn'}
      </button>
    </div>
  );
}
