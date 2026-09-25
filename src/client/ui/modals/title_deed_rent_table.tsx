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
  readonly compact?: boolean;
}

export function TitleDeedRentTable({
  isRailroad,
  isUtility,
  rents,
  upgradeCosts,
  hasMonopoly = false,
  currentLevel,
  isOwner = false,
  compact = false,
}: TitleDeedRentTableProps): React.ReactElement {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const tiers = isRailroad ? RAILROAD_TIERS : PROPERTY_TIERS;
  const hasUpgrades = upgradeCosts.some((cost) => cost > 0);

  const rentsKey = rents.join(',');
  // Transient Teardown: Reset trạng thái mở rộng khi đổi ô BĐS
  React.useEffect(() => {
    setIsExpanded(false);
  }, [rentsKey, isRailroad, isUtility]);

  const showCompact = compact && !isExpanded;

  return (
    <div className="bg-[#F7F2E7] rounded-xl border border-slate-300 p-2 sm:p-2.5 space-y-1.5 sm:space-y-2" data-testid="title-deed-rent-table">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
          {isRailroad ? 'Biểu Phí Theo Số Ga Sở Hữu' : isUtility ? 'Phí Dịch Vụ Cơ Bản' : 'Biểu Phí Dừng Chân'}
        </p>
        <span className="text-[10px] text-slate-600 font-bold">VNĐ</span>
      </div>

      {showCompact ? (
        /* Mini Rent Bar (~40px) kế thừa từ AuctionDistrictCard */
        <div className="space-y-1.5">
          <div className="bg-white/90 rounded-xl p-1.5 sm:p-2 border border-slate-200 flex items-center justify-between text-xs">
            {!isRailroad && !isUtility && (
              <>
                <div className="text-center flex-1 border-r border-slate-200 pr-1">
                  <span className="text-[10px] sm:text-[11px] text-slate-500 block font-semibold">C0 (ĐẤT)</span>
                  <span className="font-mono text-[11px] sm:text-xs font-bold text-slate-800 whitespace-nowrap">
                    {formatCurrency(rents[0] ?? 0)}
                  </span>
                </div>
                <div className="text-center flex-1 border-r border-slate-200 px-1">
                  <span className="text-[10px] sm:text-[11px] text-emerald-700 block font-black whitespace-nowrap">x2 ĐỘC QUYỀN</span>
                  <span className="font-mono text-[11px] sm:text-xs font-bold text-emerald-700 whitespace-nowrap">
                    {formatCurrency((rents[0] ?? 0) * 2)}
                  </span>
                </div>
                <div className="text-center flex-1 pl-1">
                  <span className="text-[10px] sm:text-[11px] text-amber-700 block font-semibold whitespace-nowrap">C3 (KHÁCH SẠN)</span>
                  <span className="font-mono text-[11px] sm:text-xs font-bold text-amber-800 whitespace-nowrap">
                    {formatCurrency(rents[3] ?? 0)}
                  </span>
                </div>
              </>
            )}

            {isRailroad && (
              <div className="w-full flex items-center justify-between px-2 py-1">
                <span className="text-[10px] sm:text-[11px] text-slate-600 font-bold whitespace-nowrap">CƯỚC 1-4 GA: (Toàn mạng lưới)</span>
                <span className="font-mono text-[10px] sm:text-[11px] font-bold text-slate-800 whitespace-nowrap">
                  {rents.map((r) => formatCurrency(r).replace(' Tr.', '')).join(' / ')} Tr.
                </span>
              </div>
            )}

            {isUtility && (
              <div className="w-full flex items-center justify-between px-1">
                <span className="text-[10px] sm:text-[11px] text-slate-600 font-bold whitespace-nowrap">CƯỚC TIỆN ÍCH:</span>
                <span className="font-mono text-[10px] sm:text-[11px] font-bold text-slate-800 whitespace-nowrap">
                  4× điểm xúc xắc (1 trạm) | 10× điểm xúc xắc (2 trạm)
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="w-full text-center py-1 text-[10px] sm:text-[11px] font-bold text-amber-800 hover:text-amber-900 bg-amber-100/60 hover:bg-amber-100 border border-amber-300/80 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
            data-testid="toggle-rent-tiers"
          >
            <span>▾</span>
            <span>
              {isRailroad
                ? 'Xem chi tiết biểu phí 1 Ga - 4 Ga'
                : isUtility
                  ? 'Xem chi tiết cước tiện ích'
                  : 'Xem chi tiết 4 cấp nâng cấp (C0 Đất Nền, C1 Nhà Phố, C2 Khách Sạn, C3 Quần thể Resort/TTTM)'}
            </span>
          </button>
        </div>
      ) : (
        <div className="space-y-1.5 sm:space-y-2">
          {isUtility ? (
            <div className="space-y-1.5 sm:space-y-2 text-xs text-slate-900">
              <div className="flex justify-between items-center p-1.5 sm:p-2 rounded-lg bg-white/90 border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base" aria-hidden="true">⚡</span>
                  <span className="font-semibold text-slate-900">Phí cơ sở (1 trạm):</span>
                </div>
                <span className="font-bold text-slate-900">{formatCurrency(rents[0] ?? 0)}</span>
              </div>
              <p className="text-[10px] text-slate-600 italic px-1">
                * Thu 4× điểm xúc xắc (1 trạm) hoặc 10× điểm xúc xắc (khi sở hữu cả 2 trạm).
              </p>
            </div>
          ) : (
            <div className="space-y-1 sm:space-y-1.5">
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
                    className={`flex justify-between items-center px-2 py-1 sm:p-2 rounded-lg sm:rounded-xl border transition-all ${tierClass}`}
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                      <span className="text-sm sm:text-base shrink-0" aria-hidden="true">
                        {tier?.icon}
                      </span>
                      <span
                        className={`text-[9px] sm:text-[10px] font-black px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded border shrink-0 ${
                          isMax
                            ? 'bg-amber-200 text-amber-900 border-amber-400'
                            : 'bg-slate-100 text-slate-900 border-slate-300'
                        }`}
                      >
                        {tier?.chip}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-[11px] sm:text-xs text-slate-900 truncate">
                          {tier?.label}
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-slate-600 font-medium truncate">
                          {cost && cost > 0 ? `Nâng cấp: +${formatCurrency(cost)}` : tier?.sub}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0 pl-1">
                      <span className="font-black text-[11px] sm:text-xs text-slate-900 font-mono">
                        {formatCurrency(
                          idx === 0 && hasMonopoly && !isRailroad && !isUtility
                            ? rent * 2
                            : idx === 3 && hasMonopoly && !isRailroad && !isUtility
                            ? Math.floor(rent * 1.5)
                            : rent
                        )}
                      </span>
                      {idx === 0 && hasMonopoly && !isRailroad && !isUtility && (
                        <span className="text-[8px] sm:text-[9px] font-extrabold text-emerald-700">x2 ĐỘC QUYỀN</span>
                      )}
                      {idx === 3 && hasMonopoly && !isRailroad && !isUtility && (
                        <span className="text-[8px] sm:text-[9px] font-extrabold text-amber-700">x1.5 ĐỘC QUYỀN</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {isExpanded && (
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="w-full text-center py-1 text-[10px] sm:text-[11px] font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
              data-testid="collapse-rent-tiers"
            >
              <span>▴</span>
              <span>Thu gọn biểu phí</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
