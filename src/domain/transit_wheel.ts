// [IMP-248][IMP-250] Domain Model: Transit Wheel / Flight Navigator (5 kết quả)
export enum TransitWheelOutcome {
  SPEED_BOOST = 'SPEED_BOOST',       // Tốc Hành 1D6 (35%)
  SAFE_HAVEN = 'SAFE_HAVEN',         // Vé VIP Hồi Hương (20%)
  CASH_BACK = 'CASH_BACK',           // Hoàn Cước Cảng (20%)
  PASS_GO_FLIGHT = 'PASS_GO_FLIGHT', // Bay Xuyên Việt (10%)
  FLIGHT_DELAY = 'FLIGHT_DELAY',     // Hoãn Chuyến (15%)
}

export interface TransitWheelConfig {
  readonly outcome: TransitWheelOutcome;
  readonly weight: number; // Tỷ lệ trên 100%
  readonly labelVi: string;
  readonly shortLabelVi: string;
  readonly icon: string;
  readonly color: string;
  readonly descriptionVi: string;
}

export const TRANSIT_WHEEL_CONFIGS: readonly TransitWheelConfig[] = [
  {
    outcome: TransitWheelOutcome.SPEED_BOOST,
    weight: 35,
    labelVi: 'Tốc Hành',
    shortLabelVi: 'TỐC HÀNH',
    icon: '⚡',
    color: '#f59e0b',
    descriptionVi: 'Gia tốc phản lực, bay thêm 1 - 6 ô về phía trước.',
  },
  {
    outcome: TransitWheelOutcome.SAFE_HAVEN,
    weight: 20,
    labelVi: 'Vé VIP Hồi Hương',
    shortLabelVi: 'HỒI HƯƠNG',
    icon: '🛡️',
    color: '#10b981',
    descriptionVi: 'Bay thẳng về bất động sản gần nhất. Nếu chưa có BĐS, bạn an toàn ở lại trạm.',
  },
  {
    outcome: TransitWheelOutcome.CASH_BACK,
    weight: 20,
    labelVi: 'Hoàn Cước Dịch Vụ',
    shortLabelVi: 'HOÀN CƯỚC',
    icon: '💰',
    color: '#8b5cf6',
    descriptionVi: 'Kho Bạc trợ cấp chi phí hành trình lên tới 300 Tr. VNĐ.',
  },
  {
    outcome: TransitWheelOutcome.PASS_GO_FLIGHT,
    weight: 10,
    labelVi: 'Bay Xuyên Việt',
    shortLabelVi: 'VỀ Ô GO',
    icon: '✈️',
    color: '#ec4899',
    descriptionVi: 'Bay thẳng về ô Khởi Hành (GO), nhận trọn vẹn lương vòng.',
  },
  {
    outcome: TransitWheelOutcome.FLIGHT_DELAY,
    weight: 15,
    labelVi: 'Hoãn Chuyến Bay',
    shortLabelVi: 'HOÃN CHUYẾN',
    icon: '⏳',
    color: '#64748b',
    descriptionVi: 'Thời tiết xấu, quân cờ tạm thời lưu lại trạm hiện tại.',
  },
] as const;

const WHEEL_FULL_SPINS_DEG = 1800;

/** Góc quay (độ, chiều kim đồng hồ) để tâm nan `outcomeIndex` dừng đúng vị trí kim 12 giờ. */
export function getWheelTargetDeg(outcomeIndex: number, segmentCount: number): number {
  const segmentDeg = 360 / segmentCount;
  return WHEEL_FULL_SPINS_DEG + (360 - outcomeIndex * segmentDeg - segmentDeg / 2);
}

export function evaluateTransitWheelOutcome(random01: number): TransitWheelOutcome {
  const roll = Math.min(0.999999, Math.max(0, random01)) * 100;
  let accumulated = 0;
  for (const cfg of TRANSIT_WHEEL_CONFIGS) {
    accumulated += cfg.weight;
    if (roll < accumulated) {
      return cfg.outcome;
    }
  }
  return TransitWheelOutcome.FLIGHT_DELAY;
}

export function findSafeHaven(currentCell: number, ownedProperties: readonly number[] = []): number {
  if (ownedProperties.length === 0) {
    return currentCell; // An toàn tại chỗ, không nhảy bừa vào BĐS đối thủ
  }
  const forwardOwned = ownedProperties.filter((c) => c > currentCell).sort((a, b) => a - b);
  if (forwardOwned.length > 0) return forwardOwned[0]!;
  const wrapOwned = [...ownedProperties].sort((a, b) => a - b);
  return wrapOwned[0]!;
}

export interface TransitWheelBroadcastParams {
  readonly outcome: TransitWheelOutcome | string;
  readonly playerName: string;
  readonly stationName: string;
  readonly targetCellName?: string;
  readonly payout?: number;
  readonly boostSteps?: number;
}

export function formatTransitWheelBroadcast(params: TransitWheelBroadcastParams): string {
  const { outcome, playerName, stationName, targetCellName, payout, boostSteps } = params;
  switch (outcome) {
    case TransitWheelOutcome.SPEED_BOOST: {
      const stepText = boostSteps !== undefined ? ` ${boostSteps}` : '';
      const destText = targetCellName ? ` tới ${targetCellName}` : '';
      return `⚡ ${playerName} quay trúng Tốc Hành! Bay thêm${stepText} ô${destText}.`;
    }
    case TransitWheelOutcome.SAFE_HAVEN: {
      if (targetCellName && targetCellName !== stationName) {
        return `🛡️ ${playerName} kích hoạt Vé VIP Hồi Hương! Bay về BĐS an toàn tại ${targetCellName}.`;
      }
      return `🛡️ ${playerName} kích hoạt Vé VIP Hồi Hương! An toàn ở lại ${stationName}.`;
    }
    case TransitWheelOutcome.CASH_BACK: {
      const amtText = payout && payout > 0 ? ` +${payout} Tr.` : '';
      return `💰 ${playerName} quay trúng Hoàn Cước Cảng! Nhận hoàn tiền${amtText} từ Kho Bạc.`;
    }
    case TransitWheelOutcome.PASS_GO_FLIGHT: {
      const amtText = payout && payout > 0 ? ` (+${payout} Tr.)` : '';
      return `✈️ ${playerName} quay trúng Bay Xuyên Việt! Bay thẳng về ô Khởi Hành (GO) nhận thưởng${amtText}.`;
    }
    case TransitWheelOutcome.FLIGHT_DELAY:
    default:
      return `⏳ Chuyến bay của ${playerName} bị hoãn (Delay)! Quân cờ giữ nguyên tại ${stationName}.`;
  }
}

