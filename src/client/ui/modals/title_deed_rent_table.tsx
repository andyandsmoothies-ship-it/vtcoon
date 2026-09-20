import React from 'react';
import { formatCurrency } from '../ui_helpers';

export const PROPERTY_TIERS = [
  { chip: 'C0', label: 'Đất Nền', icon: '🚩', sub: 'Phí dừng chân cơ bản' },
  { chip: 'C1', label: 'Nhà Phố', icon: '🏡', sub: 'Phí thuê + chi phí nâng cấp' },
  { chip: 'C2', label: 'Khách Sạn', icon: '🏨', sub: 'Phí thuê + chi phí nâng cấp' },
  { chip: 'C3', label: 'Quần thể Resort/TTTM', icon: '👑', sub: 'Phí thuê tối đa' },
] as const;

export const RAILROAD_TIERS = [
  { chip: '1 Ga', label: '1 Bến / Ga', icon: '🚊', sub: '1 trạm vận tải' },
  { chip: '2 Ga', label: '2 Bến / Ga', icon: '🚊', sub: '2 trạm kết nối' },
  { chip: '3 Ga', label: '3 Bến / Ga', icon: '🚊', sub: '3 trạm liên kết' },
  { chip: '4 Ga', label: '4 Bến / Ga', icon: '👑', sub: 'Toàn mạng lưới' },
] as const;

export interface TitleDeedRentTableProps {
  readonly isRailroad: boolean;
  readonly isUtility: boolean;
  readonly rents: readonly number[];
  readonly upgradeCosts: readonly number[];
  readonly hasMonopoly?: boolean;
  readonly currentLevel?: 0 | 1 | 2 | 3;
  readonly isOwner?: boolean;
}

export function TitleDeedRentTable({
  isRailroad,
  isUtility,
  rents,
  upgradeCosts,
  hasMonopoly = false,
  currentLevel,
  isOwner = false,
}: TitleDeedRentTableProps): React.ReactElement {
  const tiers = isRailroad ? RAILROAD_TIERS : PROPERTY_TIERS;
  const hasUpgrades = upgradeCosts.some((cost) => cost > 0);

  return (
    <div className="bg-[#F7F2E7] rounded-xl border border-slate-300 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
          {isRailroad ? 'Biểu Phí Theo Số Ga Sở Hữu' : isUtility ? 'Phí Dịch Vụ Cơ Bản' : 'Biểu Phí Dừng Chân'}
        </p>
        <span className="text-[10px] text-slate-600 font-bold">VNĐ</span>
      </div>

      {isUtility ? (
        <div className="space-y-2 text-xs text-slate-900">
          <div className="flex justify-between items-center p-2 rounded-lg bg-white/90 border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-base" aria-hidden="true">⚡</span>
              <span className="font-semibold text-slate-900">Phí cơ sở (1 trạm):</span>
            </div>
            <span className="font-bold text-slate-900">{formatCurrency(rents[0] ?? 0)}</span>
          </div>
          <p className="text-[10px] text-slate-600 italic px-1">
            * Thu 4× điểm xúc xắc (1 trạm) hoặc 10× điểm xúc xắc (khi sở hữu cả 2 trạm).
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {rents.map((rent, idx) => {
            const tier = tiers[idx];
            const isMax = idx === 3;
            const isCurrent = isOwner && currentLevel === idx && !isRailroad && !isUtility;
            const cost = hasUpgrades && idx > 0 ? upgradeCosts[idx - 1] : undefined;
            const tierClass = isCurrent
              ? 'bg-emerald-50/80 border-emerald-400 ring-1 ring-emerald-400'
              : isMax
              ? 'bg-amber-100/70 border-amber-400'
              : 'bg-white/90 border-slate-200';

            return (
              <div
                key={tier ? tier.chip : idx}
                className={`flex justify-between items-center p-2 rounded-xl border transition-all ${tierClass}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base" aria-hidden="true">
                    {tier?.icon}
                  </span>
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${
                      isMax
                        ? 'bg-amber-200 text-amber-900 border-amber-400'
                        : 'bg-slate-100 text-slate-900 border-slate-300'
                    }`}
                  >
                    {tier?.chip}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-slate-900">
                      {tier?.label}
                    </span>
                    <span className="text-[10px] text-slate-600 font-medium">
                      {cost && cost > 0 ? `Nâng cấp: +${formatCurrency(cost)}` : tier?.sub}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-black text-xs text-slate-900">
                    {formatCurrency(idx === 0 && hasMonopoly && !isRailroad && !isUtility ? rent * 2 : rent)}
                  </span>
                  {idx === 0 && hasMonopoly && !isRailroad && !isUtility && (
                    <span className="text-[9px] font-extrabold text-emerald-700">x2 ĐỘC QUYỀN</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
