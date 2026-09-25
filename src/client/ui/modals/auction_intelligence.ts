// [IMP-138] Auction District Intelligence & Monopoly Radar
// Pure calculation engine for auction district ownership & strategic hint reactivity
import { PROPERTY_DEEDS } from '../../../domain/property_data';
import { BOARD_CONFIG } from '../../../domain/board_config';
import { DISTRICT_GROUPS, type DistrictGroupDef } from './masterplan_constants';

export type StrategicHintType =
  | 'my_monopoly'
  | 'block_opponent'
  | 'first_piece'
  | 'contested'
  | 'railroad'
  | 'utility';

export type StrategicHintTone = 'emerald' | 'rose' | 'blue' | 'amber';

export interface StrategicHint {
  readonly type: StrategicHintType;
  readonly tone: StrategicHintTone;
  readonly badgeText: string;
  readonly badge: string;
  readonly description: string;
}

export interface DistrictCellChip {
  readonly cellIndex: number;
  readonly name: string;
  readonly isMine: boolean;
  readonly isOpponent: boolean;
  readonly isVacant: boolean;
  readonly isTarget: boolean;
  readonly isCurrentAuction: boolean;
  readonly isMortgaged: boolean;
  readonly ownerId?: string;
  readonly ownerName?: string;
  readonly ownerColor?: string;
  readonly level: number;
}

export type DistrictCellStatus = DistrictCellChip;

export interface RentPreviewInfo {
  readonly type: 'property' | 'railroad' | 'utility';
  readonly rent0?: number;
  readonly rentMonopoly?: number;
  readonly rentC3?: number;
  readonly railroadTiers?: readonly number[];
}

export interface AuctionDistrictInfo {
  readonly districtId: string;
  readonly districtName: string;
  readonly hexColor: string;
  readonly totalCells: number;
  readonly cells: readonly DistrictCellChip[];
  readonly ownedByMeCount: number;
  readonly maxOpponentCount: number;
  readonly opponentMax?: { id: string; name: string; count: number };
  readonly strategicHint: StrategicHint;
  readonly rentTiers?: readonly number[];
  readonly rentPreview: RentPreviewInfo;
  readonly valuationPercent: number;
  readonly adjacentCells: { prev: number; next: number };
}

export type AuctionDistrictIntelligence = AuctionDistrictInfo;

export interface ResolveAuctionDistrictParams {
  readonly cellIndex: number;
  readonly currentBid?: number;
  readonly playersInfo?: Record<string, any>;
  readonly levelMap?: Record<number, number>;
  readonly myId?: string;
}

function resolveStrategicHint(
  districtId: string,
  myCount: number,
  totalCount: number,
  hasMyId: boolean,
  totalOwned: number,
  opponentMax?: { id: string; name: string; count: number }
): StrategicHint {
  if (districtId === 'Railroad') {
    return {
      type: 'railroad',
      tone: 'blue',
      badgeText: '🚂 MẠNG LƯỚI ĐƯỜNG SẮT',
      badge: '🚂 MẠNG LƯỚI ĐƯỜNG SẮT',
      description: 'Lũy tiến cước phí 4 bậc (500 Tr. - 4.000 Tr.). Thu cước mỗi khi đối thủ ghé thăm ga tàu.',
    };
  }

  if (districtId === 'Utility') {
    return {
      type: 'utility',
      tone: 'blue',
      badgeText: '⚡ TIỆN ÍCH NĂNG LƯỢNG',
      badge: '⚡ TIỆN ÍCH NĂNG LƯỢNG',
      description: 'Cước phí tính theo điểm xúc xắc x40 Tr. (1 tiện ích) hoặc x100 Tr. (khi gom đủ 2 tiện ích quốc gia).',
    };
  }

  if (hasMyId && myCount === totalCount - 1) {
    return {
      type: 'my_monopoly',
      tone: 'emerald',
      badgeText: '🎯 ĐỘC QUYỀN',
      badge: '🎯 ĐỘC QUYỀN',
      description: 'Hoàn tất phân khu để kích hoạt x2 tiền thuê đất nền & mở quyền xây dựng công trình C1-C3.',
    };
  }

  if (opponentMax && opponentMax.count === totalCount - 1) {
    return {
      type: 'block_opponent',
      tone: 'rose',
      badgeText: '🛡️ CHẶN ĐỐI THỦ',
      badge: '🛡️ CHẶN ĐỐI THỦ',
      description: `Chặn ${opponentMax.name} hoàn tất độc quyền phân khu để tránh nguy cơ phá sản khi dẫm vào.`,
    };
  }

  if (totalOwned === 0) {
    return {
      type: 'first_piece',
      tone: 'blue',
      badgeText: '🧩 KHỞI ĐẦU',
      badge: '🧩 KHỞI ĐẦU',
      description: 'Đặt nền móng đầu tiên cho phân khu để tạo tiền đề gom trọn bộ độc quyền.',
    };
  }

  return {
    type: 'contested',
    tone: 'amber',
    badgeText: '⚔️ TRANH CHẤP',
    badge: '⚔️ TRANH CHẤP',
    description: 'Phân khu đang bị phân mảnh sở hữu, hãy cân nhắc giá trị đàm phán P2P sau này.',
  };
}

function resolveRentPreview(
  districtId: string,
  deed: { rent0: number; rent1?: number; rent2?: number; rent3?: number }
): { preview: RentPreviewInfo; tiers?: readonly number[] } {
  if (districtId === 'Railroad') {
    const railroadTiers = [500, 1000, 2000, 4000] as const;
    return {
      preview: { type: 'railroad', railroadTiers },
      tiers: railroadTiers,
    };
  }

  if (districtId === 'Utility') {
    return {
      preview: { type: 'utility' },
    };
  }

  const rent0 = deed.rent0;
  return {
    preview: {
      type: 'property',
      rent0,
      rentMonopoly: rent0 * 2,
      rentC3: deed.rent3 ?? rent0 * 10,
    },
  };
}

function parseInputParams(
  paramOrCellIndex: number | ResolveAuctionDistrictParams,
  playersInfoArg?: Record<string, any>,
  myIdArg?: string,
  currentBidArg?: number,
  levelMapArg?: Record<number, number>
): {
  cellIndex: number;
  playersInfo: Record<string, any>;
  myId?: string;
  currentBid?: number;
  levelMap: Record<number, number>;
} {
  if (typeof paramOrCellIndex === 'number') {
    return {
      cellIndex: paramOrCellIndex,
      playersInfo: playersInfoArg ?? {},
      myId: myIdArg,
      currentBid: currentBidArg,
      levelMap: levelMapArg ?? {},
    };
  }

  return {
    cellIndex: paramOrCellIndex.cellIndex,
    playersInfo: paramOrCellIndex.playersInfo ?? {},
    myId: paramOrCellIndex.myId,
    currentBid: paramOrCellIndex.currentBid,
    levelMap: paramOrCellIndex.levelMap ?? {},
  };
}

export function resolveAuctionDistrictInfo(
  cellIndex: number,
  playersInfo?: Record<string, any>,
  myId?: string,
  currentBid?: number,
  levelMap?: Record<number, number>
): AuctionDistrictInfo | null;
export function resolveAuctionDistrictInfo(
  params: ResolveAuctionDistrictParams
): AuctionDistrictInfo | null;
export function resolveAuctionDistrictInfo(
  paramOrCellIndex: number | ResolveAuctionDistrictParams,
  playersInfoArg?: Record<string, any>,
  myIdArg?: string,
  currentBidArg?: number,
  levelMapArg?: Record<number, number>
): AuctionDistrictInfo | null {
  if (paramOrCellIndex === null || paramOrCellIndex === undefined) {
    return null;
  }

  const { cellIndex, playersInfo, myId, currentBid, levelMap } = parseInputParams(
    paramOrCellIndex,
    playersInfoArg,
    myIdArg,
    currentBidArg,
    levelMapArg
  );

  if (!Number.isInteger(cellIndex) || cellIndex < 0 || cellIndex >= 40) {
    return null;
  }

  const deed = PROPERTY_DEEDS.get(cellIndex);
  if (!deed) {
    return null;
  }

  const district: DistrictGroupDef | undefined = DISTRICT_GROUPS.find((g) =>
    g.cellIndices.includes(cellIndex)
  );
  if (!district) {
    return null;
  }

  const playersList = Object.values(playersInfo);
  const cells: DistrictCellChip[] = district.cellIndices.map((cIdx) => {
    const boardCell = BOARD_CONFIG[cIdx];
    const owner = playersList.find((p: any) =>
      Boolean(p && Array.isArray(p.ownedProperties) && p.ownedProperties.includes(cIdx))
    );
    const ownerId = owner?.id;
    const isMine = Boolean(myId && ownerId === myId);
    const isOpponent = Boolean(ownerId && (!myId || ownerId !== myId));
    const isTarget = cIdx === cellIndex;

    return {
      cellIndex: cIdx,
      name: boardCell?.name ?? `Ô ${cIdx}`,
      isMine,
      isOpponent,
      isVacant: !ownerId,
      isTarget,
      isCurrentAuction: isTarget,
      isMortgaged: Boolean(
        owner && Array.isArray(owner.mortgagedProperties) && owner.mortgagedProperties.includes(cIdx)
      ),
      ownerId,
      ownerName: owner?.name,
      ownerColor: owner?.tokenColor,
      level: levelMap[cIdx] ?? 0,
    };
  });

  const ownedByMeCount = cells.filter((c) => c.isMine).length;
  const opponentCounts: Record<string, { id: string; name: string; count: number }> = {};

  for (const c of cells) {
    if (c.isOpponent && c.ownerId) {
      if (!opponentCounts[c.ownerId]) {
        opponentCounts[c.ownerId] = {
          id: c.ownerId,
          name: c.ownerName ?? c.ownerId,
          count: 0,
        };
      }
      opponentCounts[c.ownerId]!.count += 1;
    }
  }

  const sortedOpponents = Object.values(opponentCounts).sort((a, b) => b.count - a.count);
  const opponentMax = sortedOpponents[0];
  const maxOpponentCount = opponentMax ? opponentMax.count : 0;
  const totalOwned = cells.filter((c) => !c.isVacant).length;

  const strategicHint = resolveStrategicHint(
    district.id,
    ownedByMeCount,
    district.cellIndices.length,
    Boolean(myId),
    totalOwned,
    opponentMax
  );

  const rentResult = resolveRentPreview(district.id, deed);
  const effectiveBid = Number.isFinite(currentBid) && (currentBid ?? 0) > 0 ? (currentBid as number) : deed.price;
  const valuationPercent = Math.round((effectiveBid / deed.price) * 100);

  return {
    districtId: district.id,
    districtName: district.name,
    hexColor: district.hexColor,
    totalCells: district.cellIndices.length,
    cells,
    ownedByMeCount,
    maxOpponentCount,
    opponentMax,
    strategicHint,
    rentTiers: rentResult.tiers,
    rentPreview: rentResult.preview,
    valuationPercent,
    adjacentCells: {
      prev: (cellIndex - 1 + 40) % 40,
      next: (cellIndex + 1) % 40,
    },
  };
}
