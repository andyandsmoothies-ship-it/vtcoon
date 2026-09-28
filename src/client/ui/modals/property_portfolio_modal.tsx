// [UI-IMP75/MSS][IMP-133][IMP-136] PropertyPortfolioModal — Danh Mục Bất Động Sản Toàn Diện, 1-Click Quick Build & Strategic Insights
import React, { useState } from 'react';
import { getDeedDisplayInfo, checkPropertyUpgradeEligibility, sortPropertiesByRegion } from './modal_helpers';
import { formatCurrency } from '../ui_helpers';
import { COLOR_GROUP_HEX } from '../../../domain/theme';
import { analyzePropertyMonopolyInsight, resolvePropertyCardActionState } from './portfolio_monopoly_analytics';
import { PortfolioTabHeader, type PortfolioTab } from './portfolio_tab_header';
import { PortfolioDeficitBanner } from './portfolio_deficit_banner';
import { BondIssuanceTab } from './bond_issuance_tab';
import type { BondContract } from '../../../domain/bond_types';
import { MacroCycleType } from '../../../domain/macro_cycle_types';

export interface PropertyPortfolioModalProps {
  readonly ownedProperties: readonly number[];
  readonly isTradeFrozen?: boolean;
  readonly activeModifiers?: readonly { readonly type: string; readonly remainingRounds: number; readonly affectedCells?: readonly number[] }[];
  readonly propertyStates?: Record<number, { readonly ownerId?: string | null; readonly level?: number; readonly isMortgaged?: boolean }>;
  readonly currentBalance?: number;
  readonly isInInsolvency?: boolean;
  readonly isMyTurn?: boolean;
  readonly turnPhase?: string;
  readonly allPlayers?: Record<string, { readonly id: string; readonly name?: string; readonly balance?: number; readonly tokenColor?: string; readonly isBot?: boolean; readonly ownedProperties?: readonly number[] }>;
  readonly onQuickTrade?: (targetPlayerId: string, targetPropertyIndex: number) => void;
  readonly onViewVacantCell?: (cellIndex: number) => void;
  readonly onUpgrade?: (cellIndex: number) => void;
  readonly onHoverCell?: (cellIndex: number | null) => void;
  readonly onSelectDeed?: (cellIndex: number) => void;
  readonly onMortgage?: (cellIndex: number) => void;
  readonly onRedeem?: (cellIndex: number) => void;
  readonly onDowngrade?: (cellIndex: number) => void;
  readonly onClose?: () => void;
  readonly bondContract?: BondContract | null;
  readonly onIssueBond?: () => void;
  readonly onRepayBond?: () => void;
  readonly onAutoSolvency?: () => void;
}

const TIER_NAMES = ['Đất Nền', 'Nhà Phố C1', 'Khách Sạn C2', 'Resort C3'];

export function PropertyPortfolioModal({
  ownedProperties, isTradeFrozen, activeModifiers = [], propertyStates = {}, currentBalance = 0, isInInsolvency = false,
  isMyTurn, turnPhase, allPlayers, onQuickTrade, onViewVacantCell, onUpgrade, onHoverCell,
  onSelectDeed, onMortgage, onRedeem, onDowngrade, onClose, bondContract, onIssueBond, onRepayBond, onAutoSolvency,
}: PropertyPortfolioModalProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState<PortfolioTab>('properties');
  const isNegative = currentBalance < 0 || isInInsolvency;
  const deficitAmount = currentBalance < 0 ? Math.abs(currentBalance) : 0;
  const [filter, setFilter] = useState<'all' | 'nearMonopoly' | 'upgradeable' | 'mortgaged'>('all');

  const filteredProperties = ownedProperties.filter((cellIndex) => {
    if (filter === 'mortgaged') return Boolean(propertyStates[cellIndex]?.isMortgaged);
    if (filter === 'upgradeable') {
      return checkPropertyUpgradeEligibility({ cellIndex, ownedProperties, propertyStates, balance: currentBalance, isMyTurn, turnPhase }).canUpgrade;
    }
    if (filter === 'nearMonopoly') {
      return analyzePropertyMonopolyInsight({ cellIndex, ownedProperties, allPlayers }).isNearMonopoly;
    }
    return true;
  });

  return (
    <div
      role="dialog"
      aria-label="Danh mục bất động sản"
      className="w-full max-w-2xl max-h-[90dvh] h-auto bg-[#FFFDF8] border-2 border-slate-900 rounded-2xl shadow-[0_6px_0_0_#0f172a] flex flex-col pointer-events-auto text-slate-900 select-none overflow-hidden"
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
              Quản lý {ownedProperties.length} tài sản sở hữu • Nâng cấp nhanh 1-click
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

      <div className="px-4 pt-3 shrink-0">
        <PortfolioTabHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          hasBond={Boolean(bondContract?.isActive)}
        />
      </div>

      {activeTab === 'bonds' ? (
        <div className="p-4 flex-1 overflow-y-auto">
          <BondIssuanceTab
            bondContract={bondContract}
            balance={currentBalance}
            isMyTurn={isMyTurn}
            onIssueBond={onIssueBond}
            onRepayBond={onRepayBond}
          />
        </div>
      ) : (
        <>
          <PortfolioDeficitBanner
            isNegative={isNegative}
            currentBalance={currentBalance}
            deficitAmount={deficitAmount}
            onAutoSolvency={onAutoSolvency}
          />

      {/* Filter bar */}
      {ownedProperties.length > 0 && (
        <div className="px-4 pt-3 shrink-0">
          <div data-testid="portfolio-filter-bar" className="grid grid-cols-4 gap-1 p-1 bg-slate-200/80 rounded-xl overflow-x-auto whitespace-nowrap">
            {(
              [
                ['all', 'Tất Cả', 'Tất Cả'],
                ['nearMonopoly', 'Sắp Đủ 🔥', 'Sắp Đủ Bộ 🔥'],
                ['upgradeable', 'Có Thể Xây', 'Có Thể Xây'],
                ['mortgaged', 'Thế Chấp', 'Đang Thế Chấp'],
              ] as const
            ).map(([key, shortLabel, fullLabel]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`min-h-[44px] px-1 py-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer truncate flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  filter === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="sm:hidden">{shortLabel}</span>
                <span className="hidden sm:inline">{fullLabel}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Danh sách BĐS */}
      <div className={`p-4 pb-8 overflow-y-auto ${filteredProperties.length === 0 ? 'shrink-0' : 'flex-1'} space-y-3`}>
        {filteredProperties.length === 0 ? (
          <div className="py-8 px-4 text-center flex flex-col items-center justify-center gap-2">
            <span className="text-3xl" aria-hidden="true">
              {filter === 'upgradeable' ? '🏗️' : filter === 'nearMonopoly' ? '🔥' : filter === 'mortgaged' ? '🏦' : '🏛️'}
            </span>
            <p className="font-bold text-slate-800 text-sm">
              {ownedProperties.length === 0
                ? 'Chưa sở hữu bất động sản nào trên bàn cờ.'
                : filter === 'upgradeable'
                ? 'Chưa Có Bất Động Sản Đủ Điều Kiện Xây'
                : 'Không có bất động sản nào phù hợp với bộ lọc.'}
            </p>
            {filter === 'upgradeable' && (
              <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                Để xây công trình, bạn cần độc quyền trọn bộ màu, đến lượt đi của mình và đủ tiền mặt.
              </p>
            )}
            {ownedProperties.length > 0 && filter !== 'all' && (
              <button
                type="button"
                onClick={() => setFilter('all')}
                className="min-h-[44px] px-4 py-2 mt-1 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs rounded-xl shadow-[0_2px_0_0_#b45309] active:translate-y-[1px] cursor-pointer"
              >
                Xem Tất Cả ({ownedProperties.length} BĐS)
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sortPropertiesByRegion(filteredProperties).map((cellIndex) => {
              const deed = getDeedDisplayInfo(cellIndex);
              const state = propertyStates[cellIndex];
              const isMort = Boolean(state?.isMortgaged);
              const level = state?.level ?? 0;
              const ribbonColor = deed?.colorGroup ? COLOR_GROUP_HEX[deed.colorGroup] : '#64748b';
              const mortgageVal = deed?.mortgageValue ?? 0;
              const redeemCost = Math.round(mortgageVal * 1.1);
              const isLiquidityFrozen = Boolean(activeModifiers?.some(
                (m) => (m.type === 'MACRO_LIQUIDITY_FREEZE' || m.type === MacroCycleType.MACRO_LIQUIDITY_FREEZE) &&
                       m.remainingRounds > 0 &&
                       (m.affectedCells as readonly number[] | undefined)?.includes(cellIndex)
              ));
              const actionState = resolvePropertyCardActionState({
                cellIndex,
                level,
                isMortgaged: isMort,
                isTradeFrozen,
                isLiquidityFrozen,
                levelMap: Object.fromEntries(Object.entries(propertyStates).map(([k, v]) => [Number(k), v.level ?? 0])),
                ownedProperties,
              });

              const insight = analyzePropertyMonopolyInsight({
                cellIndex,
                ownedProperties,
                allPlayers,
              });
              const isMonopoly = insight.isMonopoly;
              const ownedCount = insight.ownedCount;
              const totalInGroup = insight.totalCells;

              const upgradeInfo = checkPropertyUpgradeEligibility({
                cellIndex,
                ownedProperties,
                propertyStates,
                balance: currentBalance,
                isMyTurn,
                turnPhase,
              });

              return (
                <div
                  key={cellIndex}
                  data-testid={`property-portfolio-item-${cellIndex}`}
                  data-onmouseenter="true"
                  onMouseEnter={() => onHoverCell?.(cellIndex)}
                  onMouseLeave={() => onHoverCell?.(null)}
                  onFocus={() => onHoverCell?.(cellIndex)}
                  onBlur={() => onHoverCell?.(null)}
                  className={`border-2 rounded-xl p-3 flex flex-col justify-between transition-all ${
                    isMort
                      ? 'bg-slate-100/80 border-slate-300 opacity-90'
                      : 'bg-white border-slate-300 shadow-sm hover:border-slate-400'
                  }`}
                >
                  {/* Dải ruy băng màu trên đỉnh thẻ */}
                  <div
                    data-testid="property-color-ribbon"
                    className="h-2 w-full rounded-t-md mb-2.5"
                    style={{ backgroundColor: ribbonColor }}
                  />

                  {/* Thông tin cơ bản */}
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {deed?.name ?? `Ô #${cellIndex}`}
                        </span>
                        {totalInGroup > 0 && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-bold shrink-0 ${
                              isMonopoly
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {isMonopoly ? `[${ownedCount}/${totalInGroup}] ★` : `[${ownedCount}/${totalInGroup}]`}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 shrink-0">
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

                    {/* Thông tin Tiền Thuê & Giá */}
                    <div className="flex items-center justify-between text-[11px] text-slate-600 mb-2">
                      <span>
                        Tiền Thuê: <strong data-testid="property-rent-val" className="font-mono text-slate-900 font-bold">{deed ? formatCurrency(deed.rents[level] ?? deed.rents[0] ?? 0) : '0'}</strong>
                      </span>
                      <span>
                        Giá: <strong className="font-mono text-slate-900 font-bold">{deed ? formatCurrency(deed.price) : '0'}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Huy hiệu Độc Quyền hoặc Khối Mảnh Ghép Còn Thiếu */}
                  {isMonopoly ? (
                    <div className="my-2 p-2 bg-amber-50/90 border border-amber-200 rounded-xl flex items-center gap-1.5 text-xs font-bold text-amber-900">
                      <span className="text-base" aria-hidden="true">👑</span>
                      <span>Độc Quyền Trọn Bộ</span>
                    </div>
                  ) : (
                    insight.missingPieces.length > 0 && (
                      <div data-testid="property-missing-pieces" className="my-2 p-2 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          <span>Mảnh Ghép Còn Thiếu ({insight.missingPieces.length})</span>
                          <span className="font-mono">{insight.ownedCount}/{insight.totalCells}</span>
                        </div>
                        {insight.missingPieces.map((piece) => (
                          <div key={piece.cellIndex} className="flex items-center justify-between gap-1.5 p-1.5 bg-white border border-slate-200 rounded-lg text-xs">
                            <div className="flex items-center gap-1 min-w-0 flex-1">
                              <span className="text-[11px] font-mono text-slate-400 shrink-0">#{piece.cellIndex}</span>
                              <span className="font-bold text-slate-800 truncate text-[11px] sm:text-xs">{piece.name}</span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {piece.isVacant ? (
                                <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-medium whitespace-nowrap">
                                  <span className="sm:hidden">{piece.price ? formatCurrency(piece.price) : 'Trống'}</span>
                                  <span className="hidden sm:inline">Đất trống {piece.price ? `(${formatCurrency(piece.price)})` : ''}</span>
                                </span>
                              ) : (
                                <div className="flex items-center gap-1 text-[11px] text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                                  {piece.ownerTokenColor && (
                                    <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ backgroundColor: piece.ownerTokenColor }} />
                                  )}
                                  <span className="truncate max-w-[70px] sm:max-w-[90px] font-semibold">{piece.ownerName ?? piece.ownerId}</span>
                                </div>
                              )}

                              {piece.isVacant ? (
                                <button
                                  type="button"
                                  data-testid={`view-vacant-cell-btn-${piece.cellIndex}`}
                                  onClick={() => onViewVacantCell ? onViewVacantCell(piece.cellIndex) : onSelectDeed?.(piece.cellIndex)}
                                  className="min-h-[44px] min-w-[44px] px-2 py-1.5 text-xs inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-md border border-slate-300 transition-all cursor-pointer"
                                  title="Xem ô trên bàn cờ"
                                >
                                  <span aria-hidden="true">🔍</span>
                                  <span className="hidden sm:inline ml-1">Xem Ô</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  data-testid={`quick-trade-btn-${piece.cellIndex}`}
                                  disabled={isTradeFrozen}
                                  title={isTradeFrozen ? 'Thị trường đang đóng băng giao dịch' : undefined}
                                  onClick={() => !isTradeFrozen && piece.ownerId && onQuickTrade?.(piece.ownerId, piece.cellIndex)}
                                  className={`min-h-[44px] min-w-[44px] px-3 py-1.5 text-xs inline-flex items-center justify-center font-bold rounded-md border transition-all ${
                                    isTradeFrozen
                                      ? 'bg-slate-100 text-slate-400 border-slate-300 cursor-not-allowed shadow-none'
                                      : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300 shadow-[0_1px_0_0_#93c5fd] active:translate-y-[1px] cursor-pointer'
                                  }`}
                                >
                                  <span>🤝</span>
                                  <span className="hidden sm:inline ml-1">Đàm Phán</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}

                  {/* Cụm Nút Nâng Cấp Nhanh 1-Click */}
                  {deed?.upgradeCosts && !isMort && (
                    <div className="my-2">
                      <button
                        type="button"
                        data-testid="property-quick-build-btn"
                        disabled={!upgradeInfo.canUpgrade}
                        title={upgradeInfo.blockedReason ?? upgradeInfo.reason}
                        onClick={() => {
                          if (upgradeInfo.canUpgrade) {
                            onUpgrade?.(cellIndex);
                          }
                        }}
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

                  {/* Nút hành động khác */}
                  <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-1.5 text-xs">
                    {!isMort && (
                      <button
                        type="button"
                        data-testid={`mortgage-btn-${cellIndex}`}
                        onClick={() => actionState.canMortgage && onMortgage?.(cellIndex)}
                        disabled={!actionState.canMortgage}
                        title={actionState.mortgageBlockedReason}
                        className={`col-span-2 min-h-[44px] px-3 py-2 font-bold rounded-lg border-2 text-xs transition-all inline-flex items-center justify-center ${
                          actionState.canMortgage
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-300 shadow-[0_2px_0_0_#fecdd3] active:translate-y-[1px] cursor-pointer'
                            : 'bg-slate-100 text-slate-400 border-slate-200 shadow-none cursor-not-allowed opacity-75'
                        }`}
                      >
                        {actionState.canMortgage
                          ? `Thế Chấp (+${formatCurrency(mortgageVal)})`
                          : `${actionState.mortgageButtonLabel} (+${formatCurrency(mortgageVal)})`}
                      </button>
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
                      <button
                        type="button"
                        data-testid={`downgrade-btn-${cellIndex}`}
                        onClick={() => actionState.canDowngrade && onDowngrade(cellIndex)}
                        disabled={!actionState.canDowngrade}
                        title={actionState.downgradeBlockedReason}
                        className={`col-span-1 min-h-[44px] px-3 py-2 font-bold rounded-lg border-2 text-xs transition-all inline-flex items-center justify-center ${
                          actionState.canDowngrade
                            ? 'bg-rose-100 hover:bg-rose-200 text-rose-800 border-rose-300 shadow-[0_2px_0_0_#fecdd3] active:translate-y-[1px] cursor-pointer'
                            : 'bg-slate-100 text-slate-400 border-slate-200 shadow-none cursor-not-allowed opacity-75'
                        }`}
                      >
                        Hạ Cấp
                      </button>
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
            })}
          </div>
        )}
      </div>
      </>
      )}

    </div>
  );
}
