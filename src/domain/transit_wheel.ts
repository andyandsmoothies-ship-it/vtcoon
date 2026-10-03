// [IMP-248] Domain Model: Transit Wheel / Flight Navigator (4 Trạm Hạ Tầng)
export enum TransitWheelOutcome {
  NEXT_PORT = 'NEXT_PORT',           // Chuyến Bay Kế Tiếp (25%)
  SPEED_BOOST = 'SPEED_BOOST',       // Tốc Hành 1D6 (25%)
  SAFE_HAVEN = 'SAFE_HAVEN',         // Vé VIP Hồi Hương (15%)
  CASH_BACK = 'CASH_BACK',           // Hoàn Cước Cảng (15%)
  PASS_GO_FLIGHT = 'PASS_GO_FLIGHT', // Bay Xuyên Việt (10%)
  FLIGHT_DELAY = 'FLIGHT_DELAY',     // Hoãn Chuyến (10%)
}

export interface TransitWheelConfig {
  readonly outcome: TransitWheelOutcome;
  readonly weight: number; // Tỷ lệ trên 100%
  readonly labelVi: string;
  readonly descriptionVi: string;
}

export const TRANSIT_WHEEL_CONFIGS: readonly TransitWheelConfig[] = [
  {
    outcome: TransitWheelOutcome.NEXT_PORT,
    weight: 25,
    labelVi: 'Chuyến Bay Kế Tiếp',
    descriptionVi: 'Bay thẳng tới trạm hạ tầng tiếp theo theo chiều kim đồng hồ.',
  },
  {
    outcome: TransitWheelOutcome.SPEED_BOOST,
    weight: 25,
    labelVi: 'Tốc Hành',
    descriptionVi: 'Gieo xúc xắc tốc hành, bay thêm 1 - 6 ô về phía trước.',
  },
  {
    outcome: TransitWheelOutcome.SAFE_HAVEN,
    weight: 15,
    labelVi: 'Vé VIP Hồi Hương',
    descriptionVi: 'Bay thẳng về bất động sản gần nhất của bạn để tránh phí phạt.',
  },
  {
    outcome: TransitWheelOutcome.CASH_BACK,
    weight: 15,
    labelVi: 'Hoàn Cước Cảng',
    descriptionVi: 'Nhận hoàn tiền cước dịch vụ từ Kho Bạc lên tới 300 Tr. VNĐ.',
  },
  {
    outcome: TransitWheelOutcome.PASS_GO_FLIGHT,
    weight: 10,
    labelVi: 'Bay Xuyên Việt',
    descriptionVi: 'Bay thẳng một mạch tới ô Khởi Hành (GO), nhận trọn vẹn lương vòng.',
  },
  {
    outcome: TransitWheelOutcome.FLIGHT_DELAY,
    weight: 10,
    labelVi: 'Delay Chuyến Bay',
    descriptionVi: 'Thời tiết xấu, chuyến bay bị hoãn. Quân cờ giữ nguyên vị trí.',
  },
] as const;

export const TRANSIT_CELLS: readonly number[] = [5, 15, 25, 35] as const;

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

export function findNextPort(currentCell: number): number {
  const forwardPorts = TRANSIT_CELLS.filter((c) => c > currentCell);
  return forwardPorts.length > 0 ? forwardPorts[0]! : TRANSIT_CELLS[0]!;
}

export function findSafeHaven(currentCell: number, ownedProperties: readonly number[] = []): number {
  if (ownedProperties.length === 0) {
    return (currentCell + 2) % 40; // Fallback an toàn tiến 2 ô
  }
  const forwardOwned = ownedProperties.filter((c) => c > currentCell).sort((a, b) => a - b);
  if (forwardOwned.length > 0) return forwardOwned[0]!;
  const wrapOwned = [...ownedProperties].sort((a, b) => a - b);
  return wrapOwned[0]!;
}
