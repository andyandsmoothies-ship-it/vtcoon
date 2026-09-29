import React, { useState } from 'react';
import { type BondContract, BondTrancheId, BOND_TRANCHES } from '../../../domain/bond_types';
import { formatCurrency } from '../ui_helpers';

interface BondIssuanceTabProps {
  readonly bondContract?: BondContract | null;
  readonly balance: number;
  readonly isMyTurn?: boolean;
  readonly playerNetWorth?: number;
  readonly unmortgagedPropertiesCount?: number;
  readonly isInInsolvency?: boolean;
  readonly onIssueBond?: (trancheId?: BondTrancheId) => void;
  readonly onRepayBond?: () => void;
}

export function BondIssuanceTab({
  bondContract,
  balance,
  isMyTurn,
  playerNetWorth = 0,
  unmortgagedPropertiesCount = 0,
  isInInsolvency,
  onIssueBond,
  onRepayBond,
}: BondIssuanceTabProps): React.ReactElement {
  const [selectedTranche, setSelectedTranche] = useState<BondTrancheId>(BondTrancheId.WORKING_CAPITAL);

  if (bondContract?.isActive) {
    const canRepay = balance >= bondContract.repayAmount && Boolean(isMyTurn);
    const activeTrancheName = bondContract.trancheId ? BOND_TRANCHES[bondContract.trancheId]?.name : 'Trái Phiếu Doanh Nghiệp';

    return (
      <div className="space-y-4 p-4 bg-amber-500/10 rounded-2xl border border-amber-500/30 text-slate-900">
        <div className="flex items-center justify-between border-b border-amber-900/10 pb-2">
          <div>
            <h4 className="font-black text-sm text-amber-950 uppercase">Hợp Đồng Trái Phiếu Đang Hoạt Động</h4>
            <span className="text-[11px] font-bold text-amber-800">{activeTrancheName}</span>
          </div>
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

  const hasNetWorth = playerNetWorth >= 3000;
  const hasEnoughDeeds = unmortgagedPropertiesCount >= 2;
  const isTurnValid = Boolean(isMyTurn || isInInsolvency);
  const canIssue = isTurnValid && hasNetWorth && hasEnoughDeeds;

  const blockedReason = !isTurnValid
    ? 'Chỉ có thể phát hành trong lượt của bạn hoặc khi giải cứu nợ'
    : !hasNetWorth
    ? 'Cần tối thiểu 3.000 Net Worth để phát hành trái phiếu'
    : !hasEnoughDeeds
    ? 'Cần sở hữu ít nhất 2 Bất Động Sản chưa thế chấp'
    : undefined;

  const trancheConfig = BOND_TRANCHES[selectedTranche];
  const loanPrincipal = Math.floor(playerNetWorth * trancheConfig.loanRatio);

  return (
    <div className="space-y-4 p-4 bg-amber-500/10 rounded-2xl border border-amber-500/30 text-slate-900 text-xs">
      <div className="border-b border-amber-900/10 pb-2">
        <h4 className="font-black text-sm text-amber-950 uppercase">Đòn Bẩy Trái Phiếu Doanh Nghiệp</h4>
        <p className="text-slate-600 mt-1">Chọn gói đòn bẩy vốn phù hợp với chiến lược tài chính của bạn.</p>
      </div>

      {/* 3 Tranches Cards: Dọc trên Mobile 360px, Ngang trên sm */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {(Object.values(BOND_TRANCHES)).map((t) => {
          const isSelected = selectedTranche === t.id;
          const estPrincipal = Math.floor(playerNetWorth * t.loanRatio);
          const estInterest = Math.round(t.interestRate * 100);

          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedTranche(t.id)}
              className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between min-h-[46px] sm:min-h-[96px] ${
                isSelected
                  ? 'border-amber-600 bg-amber-50 shadow-sm ring-2 ring-amber-400/50'
                  : 'border-slate-300 bg-white/80 hover:bg-white text-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-slate-900">{t.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    t.id === BondTrancheId.ALL_IN ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {Math.round(t.loanRatio * 100)}% NW
                  </span>
                </div>
                <div className="mt-1 font-mono font-bold text-amber-950 text-sm">
                  {formatCurrency(estPrincipal)}
                </div>
              </div>
              <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-200 pt-1">
                <span>Kỳ hạn: <strong>{t.durationRounds} vòng</strong></span>
                <span>Lãi: <strong className="text-rose-600">+{estInterest}%</strong></span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="text-[11px] font-semibold text-amber-900">
        Gói đã chọn: <strong className="text-slate-900">{trancheConfig.name}</strong>
      </div>

      {/* Checklist 3 Điều Kiện Phát Hành Trực Quan (Thay thế L130 - L134) */}
      <div className="p-3 bg-white/90 rounded-xl border border-amber-200 space-y-2">
        <h5 className="font-bold text-[11px] text-slate-700 uppercase tracking-wider">Điều Kiện Phát Hành Trái Phiếu</h5>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <span className="flex items-center gap-1.5 min-w-0">
              <span className="shrink-0">{hasNetWorth ? '✔️' : '❌'}</span>
              <span className={`truncate ${hasNetWorth ? 'text-slate-800 font-medium' : 'text-rose-700 font-bold'}`}>
                Tài sản ròng (Net Worth) ≥ 3.000
              </span>
            </span>
            <span className="font-mono text-slate-600 shrink-0">{formatCurrency(playerNetWorth)}</span>
          </div>
          <div className="flex items-center justify-between gap-2 min-w-0">
            <span className="flex items-center gap-1.5 min-w-0">
              <span className="shrink-0">{hasEnoughDeeds ? '✔️' : '❌'}</span>
              <span className={`truncate ${hasEnoughDeeds ? 'text-slate-800 font-medium' : 'text-rose-700 font-bold'}`}>
                BĐS sạch chưa thế chấp ≥ 2 ô
              </span>
            </span>
            <span className="font-mono text-slate-600 shrink-0">{unmortgagedPropertiesCount} / 2</span>
          </div>
          <div className="flex items-center justify-between gap-2 min-w-0">
            <span className="flex items-center gap-1.5 min-w-0">
              <span className="shrink-0">{isTurnValid ? '✔️' : '❌'}</span>
              <span className={`truncate ${isTurnValid ? 'text-slate-800 font-medium' : 'text-rose-700 font-bold'}`}>
                Trong lượt hoặc giải cứu nợ
              </span>
            </span>
            <span className={`font-semibold shrink-0 ${isTurnValid ? 'text-emerald-700' : 'text-slate-500'}`}>
              {isTurnValid ? 'Hợp lệ' : 'Ngoài lượt'}
            </span>
          </div>
        </div>
      </div>

      {blockedReason && (
        <div
          data-testid="bond-blocked-notice"
          className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs font-semibold flex items-center gap-1.5"
        >
          <span>⚠️</span>
          <span>{blockedReason}</span>
        </div>
      )}

      {isInInsolvency && (
        <div
          data-testid="bond-insolvency-restructuring-badge"
          className="p-3 bg-rose-50 border-2 border-rose-300 rounded-xl text-rose-900 text-xs font-semibold flex items-center gap-2"
        >
          <span className="text-base" aria-hidden="true">⚡</span>
          <div>
            <strong className="block text-rose-950 font-black">TÁI CƠ CẤU NỢ KHẨN CẤP</strong>
            <span>Phát hành trái phiếu sẽ lập tức bơm vốn lưu động để xóa thâm hụt và khôi phục hoạt động kinh doanh!</span>
          </div>
        </div>
      )}

      <button
        type="button"
        data-testid="issue-bond-btn"
        onClick={() => canIssue && onIssueBond?.(selectedTranche)}
        disabled={!canIssue}
        className={`w-full min-h-[46px] py-2.5 px-4 rounded-xl font-black text-xs transition-all ${
          canIssue
            ? 'bg-amber-500 hover:bg-amber-400 text-amber-950 border-2 border-amber-700 shadow-[0_4px_0_0_#b45309] active:translate-y-[3px] cursor-pointer'
            : 'bg-slate-200 text-slate-400 border border-slate-300 shadow-none cursor-not-allowed'
        }`}
      >
        {canIssue
          ? (isInInsolvency
              ? `CỨU NGUY TÀI CHÍNH: PHÁT HÀNH ${trancheConfig.name.toUpperCase()} (+${formatCurrency(loanPrincipal)})`
              : `PHÁT HÀNH TRÁI PHIẾU: ${trancheConfig.name.toUpperCase()} (+${formatCurrency(loanPrincipal)})`)
          : 'PHÁT HÀNH TRÁI PHIẾU'}
      </button>
    </div>
  );
}
