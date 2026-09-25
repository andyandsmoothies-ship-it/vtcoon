// [IMP-138] Auction District Card — Tactile District Intelligence & Monopoly Radar
import React from 'react';
import {
  resolveAuctionDistrictInfo,
  type DistrictCellChip,
  type StrategicHintTone,
} from './auction_intelligence';
import { formatCurrency } from '../ui_helpers';
import { useGameStore } from '../../store/game_store';
import type { PlayerInfo } from '../../store/game_store_types';

export interface AuctionDistrictCardProps {
  readonly cellIndex: number;
  readonly currentBid: number;
  readonly myId?: string;
  readonly playersInfo?: Record<string, Partial<PlayerInfo>>;
  readonly levelMap?: Record<number, number>;
  readonly isForeclosure?: boolean;
  readonly badgeMaxWidth?: string;
}

function getToneTheme(tone: StrategicHintTone): { container: string; badge: string } {
  switch (tone) {
    case 'emerald':
      return { container: 'bg-emerald-50/90 border-emerald-300 text-emerald-950', badge: 'bg-emerald-200 text-emerald-950 border-emerald-400' };
    case 'rose':
      return { container: 'bg-rose-50/90 border-rose-300 text-rose-950', badge: 'bg-rose-200 text-rose-950 border-rose-400' };
    case 'amber':
      return { container: 'bg-amber-50/90 border-amber-300 text-amber-950', badge: 'bg-amber-200 text-amber-950 border-amber-400' };
    case 'blue':
    default:
      return { container: 'bg-sky-50/90 border-sky-300 text-sky-950', badge: 'bg-sky-200 text-sky-950 border-sky-400' };
  }
}

const COLOR_GROUP_NAMES: Record<string, string> = {
  Nau: 'Nâu', XanhDaTroi: 'Xanh Da Trời', Hong: 'Hồng', Cam: 'Cam',
  Do: 'Đỏ', Vang: 'Vàng', XanhLa: 'Xanh Lá', Tim: 'Tím',
  Railroad: 'Hạ Tầng', Utility: 'Tiện Ích',
};

function renderCellChip(cell: DistrictCellChip): React.ReactElement {
  let badgeClasses = 'border-amber-900/10 bg-white/90 text-slate-600';
  let badgeLabel = '⚪ Trống';

  if (cell.isTarget) {
    badgeClasses = 'bg-amber-400 text-amber-950 font-black border-amber-600 shadow-sm';
    badgeLabel = '🔨 ĐANG ĐẤU';
  } else if (cell.isMine) {
    badgeClasses = 'bg-emerald-100 text-emerald-900 font-bold border-emerald-400';
    badgeLabel = '✓ Bạn';
  } else if (cell.isOpponent) {
    badgeClasses = 'bg-rose-100 text-rose-900 font-medium border-rose-300';
    badgeLabel = cell.ownerName ? cell.ownerName.slice(0, 10) : 'Đối thủ';
  } else {
    badgeClasses = 'border-dashed border-amber-900/20 bg-amber-50/30 text-slate-500';
  }

  return (
    <div
      key={cell.cellIndex}
      data-testid={`district-cell-chip-${cell.cellIndex}`}
      className={`px-1.5 sm:px-2 py-1 rounded-xl border text-[10px] sm:text-[11px] min-w-0 flex flex-col justify-between transition-all min-h-[3rem] ${
        cell.isTarget ? 'ring-2 ring-amber-400 bg-amber-50/80 border-amber-400' : 'bg-amber-50/60 border-amber-900/10'
      }`}
    >
      <div className="flex items-center justify-between gap-1 mb-1 min-w-0">
        <span className="font-bold text-slate-900 line-clamp-2 leading-tight text-[11px] sm:text-xs block" title={cell.name}>
          {cell.name}
        </span>
        {cell.level > 0 && (
          <span
            className="text-[11px] font-bold px-1 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 shrink-0 inline-flex items-center gap-0.5"
            title={`Cấp công trình: ${cell.level}`}
          >
            🏠 {cell.level}
          </span>
        )}
      </div>
      <div className={`text-xs py-0.5 rounded-lg text-center truncate border ${badgeClasses}`}>
        {badgeLabel}
      </div>
    </div>
  );
}

export function AuctionDistrictCard({
  cellIndex,
  currentBid,
  myId,
  playersInfo: propPlayersInfo,
  levelMap: propLevelMap,
  isForeclosure,
  badgeMaxWidth,
}: AuctionDistrictCardProps): React.ReactElement | null {
  const storePlayersInfo = useGameStore((s) => s.playersInfo);
  const storeLevelMap = useGameStore((s) => s.levelMap);
  const effectivePlayers = propPlayersInfo ?? storePlayersInfo;
  const effectiveLevels = propLevelMap ?? storeLevelMap;

  const info = resolveAuctionDistrictInfo({
    cellIndex,
    currentBid,
    myId,
    playersInfo: effectivePlayers,
    levelMap: effectiveLevels,
  });

  if (!info) {
    return null;
  }

  const toneTheme = getToneTheme(info.strategicHint.tone);
  const badgeWidthClass = badgeMaxWidth ?? 'max-w-[140px]';

  const gridColsClass =
    info.totalCells === 2
      ? 'grid-cols-2'
      : info.totalCells === 3
        ? 'grid-cols-3'
        : 'grid-cols-2 sm:grid-cols-4';

  return (
    <div
      data-testid="auction-district-intelligence"
      className="bg-amber-50/40 p-2.5 sm:p-3 rounded-2xl border border-amber-900/10 space-y-2 shadow-sm"
    >
      {/* Header phân khu */}
      <div className="flex items-center justify-between flex-wrap gap-1.5 border-b border-amber-900/10 pb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className="w-3 h-3 rounded-full border border-slate-800 shrink-0"
            style={{ backgroundColor: info.hexColor }}
          />
          <h4 className="text-xs md:text-sm font-black uppercase tracking-wider text-slate-900 truncate">
            {COLOR_GROUP_NAMES[info.districtId] ? `Nhóm ${COLOR_GROUP_NAMES[info.districtId]}` : info.districtName}
          </h4>
          <span
            data-testid="auction-strategic-hint"
            className={`px-2 py-0.5 rounded-md text-xs font-black uppercase tracking-wide border shrink-0 ${badgeWidthClass} truncate sm:max-w-none ${toneTheme.badge}`}
          >
            {info.strategicHint.badgeText}
          </span>
          {isForeclosure && (
            <span
              data-testid="foreclosure-distressed-badge"
              className="px-2 py-0.5 rounded-md text-xs font-black uppercase tracking-wide bg-rose-100 text-rose-900 border border-rose-400 shrink-0"
            >
              🔥 BẮT ĐÁY -30%
            </span>
          )}
        </div>
      </div>

      {/* Lưới chips các ô trong phân khu */}
      <div className={`grid ${gridColsClass} gap-1.5`}>
        {info.cells.map((cell) => renderCellChip(cell))}
      </div>

      {/* Thanh tiền thuê mini (Mini Rent Bar) */}
      <div className="space-y-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-0.5">
          BIỂU PHÍ THUÊ Ô ĐẤU GIÁ
        </div>
        <div className="bg-white/70 rounded-xl p-2 border border-amber-900/10 flex items-center justify-between text-xs">
          {info.rentPreview.type === 'property' && (
            <>
              <div className="text-center flex-1 border-r border-amber-900/10 pr-1">
                <span className="text-[11px] text-slate-500 block font-semibold">C0 (ĐẤT)</span>
                <span className="font-mono text-xs font-bold text-slate-800">
                  {formatCurrency(info.rentPreview.rent0 ?? 0)}
                </span>
              </div>
              <div className="text-center flex-1 border-r border-amber-900/10 px-1">
                <span className="text-[11px] text-emerald-700 block font-black">2x (ĐỘC QUYỀN)</span>
                <span className="font-mono text-xs font-bold text-emerald-700">
                  {formatCurrency(info.rentPreview.rentMonopoly ?? 0)}
                </span>
              </div>
              <div className="text-center flex-1 pl-1">
                <span className="text-[11px] text-amber-700 block font-semibold">C3 (KHÁCH SẠN)</span>
                <span className="font-mono text-xs font-bold text-amber-800">
                  {formatCurrency(info.rentPreview.rentC3 ?? 0)}
                </span>
              </div>
            </>
          )}

          {info.rentPreview.type === 'railroad' && (
            <div className="w-full flex items-center justify-between px-1">
              <span className="text-xs text-slate-600 font-bold">CƯỚC 1-4 GA:</span>
              <span className="font-mono text-xs font-bold text-slate-800">
                500 / 1.000 / 2.000 / 4.000 Tr.
              </span>
            </div>
          )}

          {info.rentPreview.type === 'utility' && (
            <div className="w-full flex items-center justify-between px-1">
              <span className="text-xs text-slate-600 font-bold">CƯỚC TIỆN ÍCH:</span>
              <span className="font-mono text-xs font-bold text-slate-800">
                Điểm xúc xắc x40 Tr. (1 ô) | x100 Tr. (2 ô)
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
