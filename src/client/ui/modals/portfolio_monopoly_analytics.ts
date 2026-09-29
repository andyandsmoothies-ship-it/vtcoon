// [IMP-136] Portfolio Monopoly Analytics & Missing Piece Resolution
// Traceability: [UC-IMP136], [TC-IMP136.01..TC-IMP136.04], Gotcha #179
import { BOARD_CONFIG, CellType } from '../../../domain/board_config';
import { PROPERTY_DEEDS } from '../../../domain/property_data';

export interface MissingPieceInfo {
  readonly cellIndex: number;
  readonly name: string;
  readonly ownerId: string | null;
  readonly ownerName?: string;
  readonly ownerTokenColor?: string;
  readonly isVacant: boolean;
  readonly price?: number;
}

export interface MonopolyGroupInsight {
  readonly colorGroup?: string;
  readonly totalCells: number;
  readonly ownedCount: number;
  readonly isMonopoly: boolean;
  readonly isNearMonopoly: boolean;
  readonly missingPieces: readonly MissingPieceInfo[];
}

export interface AnalyzeMonopolyParams {
  readonly cellIndex: number;
  readonly ownedProperties: readonly number[];
  readonly allPlayers?: Record<string, {
    readonly id: string;
    readonly name?: string;
    readonly balance?: number;
    readonly tokenColor?: string;
    readonly isBot?: boolean;
    readonly ownedProperties?: readonly number[];
  }>;
}

/**
 * Phân tích hiện trạng độc quyền (Monopoly) và phát hiện các mảnh ghép còn thiếu
 * của nhóm màu hoặc phân khúc hạ tầng/tiện ích tương ứng với ô BĐS được chỉ định.
 */
export function analyzePropertyMonopolyInsight(params: AnalyzeMonopolyParams): MonopolyGroupInsight {
  const { cellIndex, ownedProperties, allPlayers } = params;
  const targetCell = BOARD_CONFIG[cellIndex];

  if (!targetCell) {
    return {
      totalCells: 0,
      ownedCount: 0,
      isMonopoly: false,
      isNearMonopoly: false,
      missingPieces: [],
    };
  }

  // Xác định tập hợp ô cùng nhóm màu hoặc cùng loại hạ tầng/tiện ích
  let groupCells = BOARD_CONFIG.filter((c) => {
    if (targetCell.colorGroup && c.colorGroup === targetCell.colorGroup) {
      return true;
    }
    if (!targetCell.colorGroup) {
      if (targetCell.type === CellType.Railroad && c.type === CellType.Railroad) {
        return true;
      }
      if (targetCell.type === CellType.Utility && c.type === CellType.Utility) {
        return true;
      }
    }
    return false;
  });

  if (groupCells.length === 0) {
    groupCells = [targetCell];
  }

  const totalCells = groupCells.length;
  const ownedCount = groupCells.filter((c) => ownedProperties.includes(c.index)).length;
  const isMonopoly = totalCells > 0 && ownedCount === totalCells;
  const isNearMonopoly = !isMonopoly && totalCells > 0 && (ownedCount / totalCells >= 0.5);

  if (isMonopoly) {
    return {
      colorGroup: targetCell.colorGroup,
      totalCells,
      ownedCount,
      isMonopoly: true,
      isNearMonopoly: false,
      missingPieces: [],
    };
  }

  const missingCells = groupCells.filter((c) => !ownedProperties.includes(c.index));
  const missingPieces: MissingPieceInfo[] = missingCells.map((cell) => {
    let ownerId: string | null = null;
    let ownerName: string | undefined = undefined;
    let ownerTokenColor: string | undefined = undefined;
    let isVacant = true;

    if (allPlayers) {
      for (const [id, player] of Object.entries(allPlayers)) {
        if (player?.ownedProperties?.includes(cell.index)) {
          ownerId = id;
          ownerName = player.name;
          ownerTokenColor = player.tokenColor;
          isVacant = false;
          break;
        }
      }
    }

    const deed = PROPERTY_DEEDS.get(cell.index);
    const price = deed?.price;

    return {
      cellIndex: cell.index,
      name: cell.name,
      ownerId,
      ownerName,
      ownerTokenColor,
      isVacant,
      price,
    };
  });

  return {
    colorGroup: targetCell.colorGroup,
    totalCells,
    ownedCount,
    isMonopoly: false,
    isNearMonopoly,
    missingPieces,
  };
}

export interface PropertyCardActionState {
  readonly canMortgage: boolean;
  readonly mortgageBlockedReason?: string;
  readonly mortgageButtonLabel: string;
  readonly mortgageSubHint?: string;
  readonly canDowngrade: boolean;
  readonly downgradeBlockedReason?: string;
}

export function resolvePropertyCardActionState(params: {
  readonly cellIndex: number;
  readonly level: number;
  readonly isMortgaged: boolean;
  readonly isTradeFrozen?: boolean;
  readonly isLiquidityFrozen?: boolean;
  readonly levelMap?: Record<number, number>;
  readonly ownedProperties?: readonly number[];
}): PropertyCardActionState {
  const { cellIndex, level, isMortgaged, isTradeFrozen, isLiquidityFrozen, levelMap, ownedProperties } = params;

  // 1. Phân giải Thế Chấp
  let canMortgage = false;
  let mortgageBlockedReason: string | undefined = undefined;
  let mortgageButtonLabel = 'Thế Chấp';
  let mortgageSubHint: string | undefined = undefined;

  if (isMortgaged) {
    canMortgage = false;
    mortgageBlockedReason = 'Bất động sản đã được thế chấp';
    mortgageButtonLabel = 'Đã Thế Chấp';
    mortgageSubHint = 'Cần chuộc nợ để khôi phục quyền thế chấp';
  } else if (level > 0) {
    canMortgage = false;
    mortgageBlockedReason = 'Phải hạ cấp hết nhà về Cấp 0 trước khi thế chấp';
    mortgageButtonLabel = 'Cần Hạ Cấp';
    mortgageSubHint = 'Phải hạ cấp hết nhà về Cấp 0 trước khi thế chấp';
  } else if (isLiquidityFrozen) {
    canMortgage = false;
    mortgageBlockedReason = 'Bất động sản đang bị đóng băng thanh khoản';
    mortgageButtonLabel = 'Đóng Băng';
    mortgageSubHint = 'Đang trong chu kỳ đóng băng thanh khoản';
  } else if (isTradeFrozen) {
    canMortgage = false;
    mortgageBlockedReason = 'Thị trường đang đóng băng giao dịch & thế chấp';
    mortgageButtonLabel = 'Đóng Băng';
    mortgageSubHint = 'Thị trường đang đóng băng giao dịch & thế chấp';
  } else {
    canMortgage = true;
  }

  // 2. Phân giải Hạ Cấp (Chuẩn SSOT checkEvenDowngrading từ src/domain/property_upgrade.ts)
  let canDowngrade = false;
  let downgradeBlockedReason: string | undefined = undefined;

  if (level <= 0) {
    canDowngrade = false;
    downgradeBlockedReason = 'Bất động sản chưa xây dựng công trình';
  } else if (isMortgaged) {
    canDowngrade = false;
    downgradeBlockedReason = 'Bất động sản đang thế chấp không thể hạ cấp';
  } else {
    const targetCell = BOARD_CONFIG[cellIndex];
    if (targetCell?.colorGroup && levelMap && ownedProperties) {
      // Tìm các ô cùng nhóm màu do người chơi sở hữu
      const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === targetCell.colorGroup && ownedProperties.includes(c.index) && c.index !== cellIndex);
      // Quy tắc Even Downgrading: Chỉ bị chặn khi có ô khác trong nhóm đang ở cấp CAO HƠN nó
      const leadingCells = groupCells.filter((c) => (levelMap[c.index] ?? 0) > level);

      if (leadingCells.length > 0) {
        canDowngrade = false;
        downgradeBlockedReason = 'Cần hạ cấp các ô có cấp độ cao hơn trước';
      } else {
        canDowngrade = true;
      }
    } else {
      canDowngrade = true;
    }
  }

  return {
    canMortgage,
    mortgageBlockedReason,
    mortgageButtonLabel,
    mortgageSubHint,
    canDowngrade,
    downgradeBlockedReason,
  };
}
