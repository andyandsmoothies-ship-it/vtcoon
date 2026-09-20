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
