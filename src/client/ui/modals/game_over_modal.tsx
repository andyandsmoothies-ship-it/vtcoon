// [UI-S05/MSS] GameOverModal — Professional FinTech Net Worth Report, Asset Portfolio & Coronation View
import React, { useState, useMemo } from 'react';
import { formatCurrency } from '../ui_helpers';
import { useGameStore, type PlayerHudInfo } from '../../store/game_store';
import { BOARD_CONFIG } from '../../../domain/board_config';
import { COLOR_GROUP_HEX } from '../../../domain/theme';
import { getDeedDisplayInfo } from './modal_helpers';

export interface GameOverModalProps {
  readonly leaderboard?: ReadonlyArray<{ readonly id: string; readonly netWorth: number }>;
  readonly onClose: () => void;
  readonly onPlayAgain?: () => void;
}

export const INITIAL_CAPITAL = 15_000 as const;
export const TOTAL_PURCHASABLE_PROPERTIES = 28 as const;

/**
 * Tính toán Tỷ suất sinh lời (ROI) so với vốn khởi đầu (15.000k VNĐ)
 */
export function calculateRoi(
  finalNetWorth: number,
  initialCapital: number = INITIAL_CAPITAL
): number {
  if (initialCapital <= 0) return 0;
  const roi = ((finalNetWorth - initialCapital) / initialCapital) * 100;
  return Number.isFinite(roi) ? Number(roi.toFixed(1)) : 0;
}

/**
 * Tính toán thị phần sở hữu đất (%)
 */
export function calculatePortfolioMetrics(
  ownedCount: number,
  total = TOTAL_PURCHASABLE_PROPERTIES
): { ownershipPercentage: number } {
  const safeCount = Math.max(0, ownedCount);
  const safeTotal = Math.max(1, total);
  const pct = (safeCount / safeTotal) * 100;
  return {
    ownershipPercentage: Number(pct.toFixed(1)),
  };
}

/**
 * Tính thứ hạng hiển thị có xử lý đồng hạng (Tie-breaking)
 */
export function calculateLeaderboardRanks(
  leaderboard: ReadonlyArray<{ readonly id: string; readonly netWorth: number }>
): number[] {
  const ranks: number[] = [];
  for (let i = 0; i < leaderboard.length; i++) {
    if (i > 0 && leaderboard[i]!.netWorth === leaderboard[i - 1]!.netWorth) {
      ranks.push(ranks[i - 1]!);
    } else {
      ranks.push(i + 1);
    }
  }
  return ranks;
}

export interface ChartPathResult {
  readonly linePath: string;
  readonly areaPath: string;
  readonly strokeColor: string;
  readonly stopColor: string;
  readonly isPositive: boolean;
  readonly finalPoint: { x: number; y: number };
}

/**
 * Tạo đường cong SVG động cho biểu đồ tài sản dựa trên biến động so với vốn ban đầu
 */
export function generateNetWorthChartPath(
  initialCapital: number = INITIAL_CAPITAL,
  finalNetWorth: number = INITIAL_CAPITAL
): ChartPathResult {
  const isPositive = finalNetWorth >= initialCapital;
  const strokeColor = isPositive ? '#10B981' : '#F43F5E';
  const stopColor = isPositive ? '#10B981' : '#F43F5E';

  const deltaRatio = initialCapital > 0 ? (finalNetWorth - initialCapital) / initialCapital : 0;
  const clampedRatio = Math.max(-1, Math.min(2, deltaRatio));
  const finalY = Math.round(52 - clampedRatio * 20);
  const midY1 = Math.round(53 - clampedRatio * 6);
  const midY2 = Math.round(52 - clampedRatio * 13);
  const midY3 = Math.round((midY2 + finalY) / 2);

  const linePath = `M 10 54 Q 100 ${midY1}, 180 ${midY2} T 320 ${midY3} T 390 ${finalY}`;
  const areaPath = `${linePath} L 390 75 L 10 75 Z`;

  return {
    linePath,
    areaPath,
    strokeColor,
    stopColor,
    isPositive,
    finalPoint: { x: 390, y: finalY },
  };
}

export function GameOverModal({
  leaderboard = [],
  onClose,
  onPlayAgain,
}: GameOverModalProps): React.ReactElement {
  const playersInfo = useGameStore((s) => s.playersInfo);
  const levelMap = useGameStore((s) => s.levelMap);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'fintech' | 'portfolio'>('leaderboard');

  const winner = leaderboard[0];
  const winnerInfo = winner ? playersInfo[winner.id] : undefined;
  const winnerNetWorth = winner?.netWorth ?? 0;
  const winnerRoi = winner ? calculateRoi(winnerNetWorth) : 0;

  const portfolioMetrics = calculatePortfolioMetrics(
    winnerInfo?.ownedProperties?.length ?? 0,
    TOTAL_PURCHASABLE_PROPERTIES
  );

  const chartData = useMemo(() => {
    return generateNetWorthChartPath(INITIAL_CAPITAL, winnerNetWorth);
  }, [winnerNetWorth]);

  const leaderboardRanks = useMemo(() => {
    return calculateLeaderboardRanks(leaderboard);
  }, [leaderboard]);

  // Tính toán phân rã tài sản của người thắng cuộc
  const winnerBreakdown = useMemo(() => {
    if (!winnerInfo) {
      return { cash: 0, propertyValue: 0, buildingValue: 0 };
    }
    const cash = Math.max(0, winnerInfo.balance);
    const owned = winnerInfo.ownedProperties ?? [];
    let propertyValue = 0;
    let buildingValue = 0;

    owned.forEach((idx) => {
      const deed = getDeedDisplayInfo(idx);
      if (deed) {
        propertyValue += deed.price;
        const lvl = levelMap[idx] ?? 0;
        if (lvl > 0 && deed.upgradeCosts) {
          for (let i = 0; i < lvl && i < deed.upgradeCosts.length; i++) {
            buildingValue += deed.upgradeCosts[i] ?? 0;
          }
        }
      }
    });

    return { cash, propertyValue, buildingValue };
  }, [winnerInfo, levelMap]);

  return (
    <div
      className="w-full max-w-xl bg-slate-900/95 backdrop-blur-xl border border-amber-500/50 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col relative animate-in fade-in zoom-in-95 duration-200"
      data-testid="game-over-modal"
    >
      {/* Header Vinh Danh Quán Quân */}
      <div className="text-center pb-4 border-b border-slate-800">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400/50 mb-2 shadow-inner">
          <span className="text-2xl" aria-hidden="true">🏆</span>
        </div>
        <span className="block text-[11px] font-extrabold uppercase tracking-widest text-amber-400">
          VÔ ĐỊCH ĐẠI GIA ĐỊA ỐC
        </span>
        <h1 className="text-2xl font-black text-white tracking-wide mt-0.5">
          {winnerInfo?.name ?? winner?.id ?? 'ĐẠI GIA VTCOON'}
        </h1>
        <div className="flex items-center justify-center gap-3 mt-2 text-xs">
          <span className="text-slate-400">Tài sản ròng:</span>
          <span className="font-mono font-bold text-emerald-400 text-sm">
            {formatCurrency(winnerNetWorth)}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              winnerRoi >= 0
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/80 border-rose-500/40 text-rose-300'
            }`}
          >
            ROI: {winnerRoi >= 0 ? `+${winnerRoi}%` : `${winnerRoi}%`}
          </span>
        </div>
      </div>

      {/* Thanh chuyển Tab FinTech */}
      <div className="flex p-1 bg-slate-800/80 rounded-xl my-4 border border-slate-700/60">
        <button
          type="button"
          onClick={() => setActiveTab('leaderboard')}
          className={`flex-1 min-h-[44px] text-xs font-bold rounded-lg transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
            activeTab === 'leaderboard'
              ? 'bg-amber-500 text-amber-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Bảng Xếp Hạng
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('fintech')}
          className={`flex-1 min-h-[44px] text-xs font-bold rounded-lg transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
            activeTab === 'fintech'
              ? 'bg-amber-500 text-amber-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Báo Cáo FinTech
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('portfolio')}
          className={`flex-1 min-h-[44px] text-xs font-bold rounded-lg transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
            activeTab === 'portfolio'
              ? 'bg-amber-500 text-amber-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Danh Mục Sổ Đỏ
        </button>
      </div>

      {/* Nội dung Tab 1: Bảng Xếp Hạng */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-2 mb-6 max-h-56 overflow-y-auto pr-1">
          {leaderboard.map((entry, idx) => {
            const pInfo = playersInfo[entry.id];
            const rank = leaderboardRanks[idx] ?? idx + 1;
            const isTopRank = rank === 1;
            const roi = calculateRoi(entry.netWorth);
            return (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isTopRank
                    ? 'bg-amber-950/40 border-amber-500/60 shadow-md'
                    : 'bg-slate-800/60 border-slate-700/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
                      isTopRank
                        ? 'bg-amber-400 text-amber-950 font-black shadow'
                        : rank === 2
                        ? 'bg-slate-300 text-slate-950'
                        : rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {rank}
                  </span>
                  <div>
                    <span className="font-bold text-sm text-white block leading-tight">
                      {pInfo?.name ?? entry.id}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Sở hữu: {pInfo?.ownedProperties?.length ?? 0} BĐS
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-emerald-400 text-sm">
                    {formatCurrency(entry.netWorth)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    ROI: {roi >= 0 ? `+${roi}%` : `${roi}%`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Nội dung Tab 2: Báo Cáo Tài Chính FinTech */}
      {activeTab === 'fintech' && (
        <div className="space-y-4 mb-6">
          {/* Biểu đồ đường tài sản SVG phong cách TradingView */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center text-[10px] text-slate-400 mb-2">
              <span className="font-bold uppercase tracking-wider text-amber-400">
                Xu Hướng Tăng Trưởng Tài Sản
              </span>
              <span className={chartData.isPositive ? 'text-emerald-400 font-mono font-bold' : 'text-rose-400 font-mono font-bold'}>
                15.000k ➔ {formatCurrency(winnerNetWorth)}
              </span>
            </div>
            <svg viewBox="0 0 400 80" className="w-full h-20 overflow-visible">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartData.stopColor} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={chartData.stopColor} stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d={chartData.areaPath} fill="url(#areaGrad)" />
              <path
                d={chartData.linePath}
                fill="none"
                stroke={chartData.strokeColor}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle
                cx={chartData.finalPoint.x}
                cy={chartData.finalPoint.y}
                r="4"
                fill={chartData.strokeColor}
                stroke="#0F172A"
                strokeWidth="2"
              />
            </svg>
          </div>

          {/* Phân rã cơ cấu tài sản FinTech 4 chiều */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block mb-1">Tiền Mặt Khả Dụng</span>
              <span className="font-mono font-bold text-sky-400 block text-xs">
                {formatCurrency(winnerBreakdown.cash)}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block mb-1">Giá Trị Đất Nền</span>
              <span className="font-mono font-bold text-amber-400 block text-xs">
                {formatCurrency(winnerBreakdown.propertyValue)}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block mb-1">Công Trình Xây Dựng</span>
              <span className="font-mono font-bold text-emerald-400 block text-xs">
                {formatCurrency(winnerBreakdown.buildingValue)}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block mb-1">Thị Phần Địa Ốc</span>
              <span className="font-mono font-bold text-cyan-400 block text-xs">
                {portfolioMetrics.ownershipPercentage}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Nội dung Tab 3: Danh Mục Sổ Đỏ Sở Hữu */}
      {activeTab === 'portfolio' && (
        <div className="mb-6">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-3">
            <span>Danh mục sổ đỏ của {winnerInfo?.name ?? 'Quán quân'}:</span>
            <span className="font-bold text-amber-400">
              {winnerInfo?.ownedProperties?.length ?? 0}/{TOTAL_PURCHASABLE_PROPERTIES} Sổ Đỏ ({portfolioMetrics.ownershipPercentage}% thị phần)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
            {(winnerInfo?.ownedProperties ?? []).map((cellIdx) => {
              const tile = BOARD_CONFIG[cellIdx];
              const colorHex = tile?.colorGroup ? COLOR_GROUP_HEX[tile.colorGroup] : '#94A3B8';
              const lvl = levelMap[cellIdx] ?? 0;
              return (
                <div
                  key={cellIdx}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-xs"
                >
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: colorHex }}
                  />
                  <span className="font-semibold text-slate-200 truncate flex-1">
                    {tile?.name ?? `Ô ${cellIdx}`}
                  </span>
                  {lvl > 0 && (
                    <span className="text-[10px] px-1 rounded bg-amber-500/20 text-amber-300 font-bold">
                      {lvl === 3 ? '★ C3' : `C${lvl}`}
                    </span>
                  )}
                </div>
              );
            })}
            {(!winnerInfo?.ownedProperties || winnerInfo.ownedProperties.length === 0) && (
              <div className="col-span-2 text-center text-xs text-slate-500 py-6">
                Chưa có bất động sản nào trong danh mục.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Nút hành động */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onPlayAgain ?? onClose}
          className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-amber-950 font-black text-xs border border-amber-600 shadow-[0_4px_0_0_#b45309] active:shadow-[0_1px_0_0_#b45309] active:translate-y-[3px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer"
        >
          Về Sảnh Chờ
        </button>
      </div>
    </div>
  );
}
