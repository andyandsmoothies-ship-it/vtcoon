// [UI-S05/MSS] GameOverModal Helpers — Pure FinTech Calculations, ROI & SVG Chart Metrics
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
