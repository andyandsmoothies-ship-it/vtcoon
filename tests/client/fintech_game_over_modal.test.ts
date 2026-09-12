import { describe, it, expect } from 'vitest';
import {
  calculateRoi,
  calculatePortfolioMetrics,
  calculateLeaderboardRanks,
  generateNetWorthChartPath,
  INITIAL_CAPITAL,
  TOTAL_PURCHASABLE_PROPERTIES,
} from '../../src/client/ui/modals/game_over_modal';

describe('[UI-S05/MSS] FinTech GameOverModal — Financial Calculation Logic', () => {
  it('calculateRoi tính toán tỷ suất sinh lời chuẩn xác so với vốn ban đầu (15.000k)', () => {
    // Nhân đôi tài sản 30.000k -> ROI = +100%
    expect(calculateRoi(30_000, INITIAL_CAPITAL)).toBe(100.0);

    // Tăng trưởng 45.000k -> ROI = +200%
    expect(calculateRoi(45_000, INITIAL_CAPITAL)).toBe(200.0);

    // Hòa vốn 15.000k -> ROI = 0%
    expect(calculateRoi(15_000, INITIAL_CAPITAL)).toBe(0.0);

    // Mất 50% tài sản còn 7.500k -> ROI = -50%
    expect(calculateRoi(7_500, INITIAL_CAPITAL)).toBe(-50.0);

    // Phá sản 0k -> ROI = -100%
    expect(calculateRoi(0, INITIAL_CAPITAL)).toBe(-100.0);
  });

  it('calculateRoi xử lý an toàn biên chia cho 0', () => {
    expect(calculateRoi(10_000, 0)).toBe(0);
    expect(calculateRoi(10_000, -1000)).toBe(0);
  });

  it('calculatePortfolioMetrics tính toán thị phần sở hữu đất (%)', () => {
    // Sở hữu 14/28 BĐS -> 50%
    const half = calculatePortfolioMetrics(14, TOTAL_PURCHASABLE_PROPERTIES);
    expect(half.ownershipPercentage).toBe(50.0);

    // Độc quyền toàn bộ 28/28 BĐS -> 100%
    const full = calculatePortfolioMetrics(28, TOTAL_PURCHASABLE_PROPERTIES);
    expect(full.ownershipPercentage).toBe(100.0);

    // Chưa sở hữu ô nào -> 0%
    const zero = calculatePortfolioMetrics(0, TOTAL_PURCHASABLE_PROPERTIES);
    expect(zero.ownershipPercentage).toBe(0.0);

    // Xử lý giá trị âm an toàn
    const neg = calculatePortfolioMetrics(-5, TOTAL_PURCHASABLE_PROPERTIES);
    expect(neg.ownershipPercentage).toBe(0.0);
  });

  it('Bảo toàn hằng số hệ thống tài chính VTCOON', () => {
    expect(INITIAL_CAPITAL).toBe(15_000);
    expect(TOTAL_PURCHASABLE_PROPERTIES).toBe(28);
  });
});

describe('[UI-S05/MSS] FinTech GameOverModal — Dynamic Chart Path & Tie-Breaking Ranks', () => {
  it('generateNetWorthChartPath: Tăng trưởng tài sản sinh đường cong đi lên màu xanh lục ngọc (#10B981)', () => {
    const chart = generateNetWorthChartPath(15_000, 30_000);
    expect(chart.isPositive).toBe(true);
    expect(chart.strokeColor).toBe('#10B981');
    expect(chart.linePath).toContain('M 10 54');
    expect(chart.areaPath).toContain('L 390 75 L 10 75 Z');
    // Điểm kết thúc ở vị trí cao hơn (y nhỏ hơn) so với điểm khởi đầu y=54
    expect(chart.finalPoint.y).toBeLessThan(54);
  });

  it('generateNetWorthChartPath: Thua lỗ tài sản sinh đường cong đi xuống màu hồng đỏ (#F43F5E)', () => {
    const chart = generateNetWorthChartPath(15_000, 6_000);
    expect(chart.isPositive).toBe(false);
    expect(chart.strokeColor).toBe('#F43F5E');
    // Điểm kết thúc ở vị trí thấp hơn (y lớn hơn) so với điểm khởi đầu y=54
    expect(chart.finalPoint.y).toBeGreaterThan(54);
  });

  it('calculateLeaderboardRanks: Xử lý xếp hạng chính xác khi có người chơi đồng hạng (Tie-breaking)', () => {
    const tiedLeaderboard = [
      { id: 'p1', netWorth: 30_000 },
      { id: 'p2', netWorth: 30_000 }, // Đồng hạng 1 với p1
      { id: 'p3', netWorth: 20_000 }, // Hạng 3
      { id: 'p4', netWorth: 10_000 }, // Hạng 4
    ];
    const ranks = calculateLeaderboardRanks(tiedLeaderboard);
    expect(ranks).toEqual([1, 1, 3, 4]);

    const allTied = [
      { id: 'p1', netWorth: 15_000 },
      { id: 'p2', netWorth: 15_000 },
      { id: 'p3', netWorth: 15_000 },
    ];
    expect(calculateLeaderboardRanks(allTied)).toEqual([1, 1, 1]);

    const distinct = [
      { id: 'p1', netWorth: 40_000 },
      { id: 'p2', netWorth: 30_000 },
      { id: 'p3', netWorth: 20_000 },
    ];
    expect(calculateLeaderboardRanks(distinct)).toEqual([1, 2, 3]);

    expect(calculateLeaderboardRanks([])).toEqual([]);
  });
});

