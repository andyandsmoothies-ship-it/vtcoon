// [IMP-132/IMP-137] MasterplanModal — Sa Bàn Quy Hoạch Đô Thị & Ma Trận 8 Phân Khu (Urban Masterplan Minimap & District Monopoly Radar)
// Tuân thủ chuẩn Antigravity 2.0, Tabletop tactile depth, WCAG touch targets >= 44px
import React, { useState, useMemo } from 'react';
import { BOARD_CONFIG, CellType } from '../../../domain/board_config';
import { COLOR_GROUP_HEX } from '../../../domain/theme';
import { getDeedDisplayInfo } from './modal_helpers';
import { useGameStore } from '../../store/game_store';
import {
  GRID_TILE_COORDS,
  DISTRICT_GROUPS,
  resolveSpecialIcon,
  classifyDistrict,
  type DistrictGroupDef,
  type DistrictClassification,
} from './masterplan_constants';
import {
  MasterplanInspectorCard,
  MasterplanDistrictCard,
  MasterplanEmptyState,
} from './masterplan_components';

export {
  GRID_TILE_COORDS,
  DISTRICT_GROUPS,
  resolveSpecialIcon,
  classifyDistrict,
  type DistrictGroupDef,
  type DistrictClassification,
};

export interface MasterplanModalProps {
  readonly initialTab?: 'blueprint' | 'districts';
  readonly selectedCellIndex?: number;
  readonly playersInfo?: Record<string, any>;
  readonly propertyStates?: Record<number, {
    readonly ownerId?: string | null;
    readonly level?: number;
    readonly isMortgaged?: boolean;
  }>;
  readonly levelMap?: Record<number, number>;
  readonly onClose?: () => void;
  readonly myPlayerId?: string;
  readonly districtFilter?: 'all' | 'near-monopoly' | 'monopoly' | 'vacant';
  readonly initialFilter?: 'all' | 'near-monopoly' | 'monopoly' | 'vacant';
  readonly districts?: readonly DistrictGroupDef[];
  readonly onFilterChange?: (filter: 'all' | 'near-monopoly' | 'monopoly' | 'vacant') => void;
  readonly onQuickTrade?: (payload: {
    readonly targetPlayerId: string;
    readonly offeredProperties: readonly number[];
    readonly requestedProperties: readonly number[];
    readonly cashOffer: number;
    readonly cashRequest: number;
  }) => void;
  readonly onSelectCell?: (cellIndex: number) => void;
}

const FILTER_OPTIONS = [
  { id: 'all', label: 'Tất Cả' },
  { id: 'near-monopoly', label: '⚡ Sắp Độc Quyền' },
  { id: 'monopoly', label: '👑 Đã Độc Quyền' },
  { id: 'vacant', label: '🌱 Còn Đất Trống' },
] as const;

export function MasterplanModal({
  initialTab,
  selectedCellIndex: initialSelectedCellIndex,
  playersInfo: propPlayersInfo,
  propertyStates: propPropertyStates,
  levelMap: propLevelMap,
  onClose,
  myPlayerId,
  districtFilter,
  initialFilter,
  districts: propDistricts,
  onFilterChange: propOnFilterChange,
  onQuickTrade: propOnQuickTrade,
  onSelectCell: propOnSelectCell,
}: MasterplanModalProps): React.ReactElement {
  const storePlayersInfo = useGameStore((s) => s.playersInfo);
  const storeLevelMap = useGameStore((s) => s.levelMap);

  const players = propPlayersInfo !== undefined ? propPlayersInfo : (storePlayersInfo ?? {});
  const propStates = propPropertyStates ?? {};
  const levels = propLevelMap !== undefined ? propLevelMap : (storeLevelMap ?? {});

  const defaultTab = initialTab ?? (initialSelectedCellIndex !== undefined ? 'blueprint' : 'districts');
  const [activeTab, setActiveTab] = useState<'blueprint' | 'districts'>(defaultTab);
  const [inspectedIndex, setInspectedIndex] = useState<number | null>(initialSelectedCellIndex ?? null);

  const [filterState, setFilterState] = useState<'all' | 'near-monopoly' | 'monopoly' | 'vacant'>(
    initialFilter ?? districtFilter ?? 'all'
  );

  React.useEffect(() => {
    if (districtFilter) {
      setFilterState(districtFilter);
    }
  }, [districtFilter]);

  const activeFilter = filterState;

  const contentContainerRef = React.useRef<HTMLDivElement>(null);

  const handleFilterChange = (filterId: typeof activeFilter) => {
    setFilterState(filterId);
    propOnFilterChange?.(filterId);
    if (contentContainerRef.current) {
      contentContainerRef.current.scrollTop = 0;
      if (typeof contentContainerRef.current.scrollTo === 'function') {
        try {
          contentContainerRef.current.scrollTo({ top: 0, behavior: 'instant' });
        } catch {
          // Fallback an toàn nếu JSDOM/trình duyệt không hỗ trợ options object
        }
      }
    }
  };

  const handleTabChange = (tab: 'blueprint' | 'districts') => {
    setActiveTab(tab);
    if (contentContainerRef.current) {
      contentContainerRef.current.scrollTop = 0;
      if (typeof contentContainerRef.current.scrollTo === 'function') {
        try {
          contentContainerRef.current.scrollTo({ top: 0, behavior: 'instant' });
        } catch {
          // Fallback an toàn nếu JSDOM/trình duyệt không hỗ trợ options object
        }
      }
    }
  };

  const currentInspected = initialSelectedCellIndex !== undefined ? initialSelectedCellIndex : inspectedIndex;

  const getCellOwnership = (cellIndex: number) => {
    const pState = propStates[cellIndex];
    let owner: any = null;
    if (pState?.ownerId && players[pState.ownerId]) {
      owner = players[pState.ownerId];
    } else {
      for (const p of Object.values(players)) {
        if (p?.ownedProperties?.includes(cellIndex)) {
          owner = p;
          break;
        }
      }
    }
    const isMortgaged = Boolean(pState?.isMortgaged || (owner?.mortgagedProperties && owner.mortgagedProperties.includes(cellIndex)));
    const level = levels[cellIndex] ?? pState?.level ?? 0;
    return { owner, isMortgaged, level };
  };

  const handleQuickTrade = (payload: {
    readonly targetPlayerId: string;
    readonly offeredProperties: readonly number[];
    readonly requestedProperties: readonly number[];
    readonly cashOffer: number;
    readonly cashRequest: number;
  }) => {
    if (propOnQuickTrade) {
      propOnQuickTrade(payload);
    } else {
      useGameStore.getState().openModal('trade', {
        targetPlayerId: payload.targetPlayerId,
        offeredProperties: [...payload.offeredProperties],
        requestedProperties: [...payload.requestedProperties],
        cashOffer: payload.cashOffer,
        cashRequest: payload.cashRequest,
      });
      onClose?.();
    }
  };

  const handleSelectCell = (cellIndex: number) => {
    if (propOnSelectCell) {
      propOnSelectCell(cellIndex);
    } else {
      useGameStore.getState().setCameraFocusCell(cellIndex);
    }
  };

  const stats = useMemo(() => {
    let ownedCount = 0;
    let totalPurchasable = 0;
    for (const cell of BOARD_CONFIG) {
      if (cell.type === CellType.Property || cell.type === CellType.Railroad || cell.type === CellType.Utility) {
        totalPurchasable++;
        const { owner } = getCellOwnership(cell.index);
        if (owner) ownedCount++;
      }
    }
    return { ownedCount, vacantCount: totalPurchasable - ownedCount, totalPurchasable };
  }, [players, propStates, levels]);

  const districts = propDistricts ?? DISTRICT_GROUPS;

  const filterCounts = useMemo(() => {
    let nearMonopolyCount = 0;
    let monopolyCount = 0;
    let vacantCount = 0;
    for (const district of districts) {
      const { isMonopoly, isNearMonopoly, hasVacant } = classifyDistrict(district, getCellOwnership);
      if (isMonopoly) monopolyCount++;
      if (isNearMonopoly) nearMonopolyCount++;
      if (hasVacant) vacantCount++;
    }
    return {
      all: districts.length,
      'near-monopoly': nearMonopolyCount,
      monopoly: monopolyCount,
      vacant: vacantCount,
    };
  }, [districts, players, propStates, levels]);

  const filteredDistricts = useMemo(() => {
    return districts.filter((district) => {
      if (activeFilter === 'all') return true;
      const { isMonopoly, isNearMonopoly, hasVacant } = classifyDistrict(district, getCellOwnership);
      if (activeFilter === 'near-monopoly') return isNearMonopoly;
      if (activeFilter === 'monopoly') return isMonopoly;
      if (activeFilter === 'vacant') return hasVacant;
      return true;
    });
  }, [districts, activeFilter, players, propStates, levels]);

  const inspectedDeedInfo = currentInspected !== null ? getDeedDisplayInfo(currentInspected) : null;
  const inspectedOwnership = currentInspected !== null ? getCellOwnership(currentInspected) : null;

  return (
    <div
      role="dialog"
      aria-label="Bản đồ quy hoạch đô thị"
      data-testid="masterplan-modal"
      className="relative w-full max-w-4xl h-[88vh] max-h-[92vh] min-h-[520px] bg-[#FFFDF9] border-2 border-slate-900 rounded-3xl shadow-[0_8px_0_0_#0f172a] shadow-[0_8px_0_0_#0f172a,0_16px_36px_rgba(15,23,42,0.18)] flex flex-col overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-200 pointer-events-auto select-none"
    >
      {/* Header */}
      <header className="px-4 py-3 bg-[#FBF8F1] border-b border-amber-900/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl" aria-hidden="true">🗺️</span>
          <div>
            <h2 className="text-base font-black uppercase text-slate-900 tracking-wider">
              BẢN ĐỒ QUY HOẠCH ĐÔ THỊ
            </h2>
            <p className="text-xs text-slate-600 font-semibold">
              Toàn cảnh 40 ô sa bàn • Đã bán {stats.ownedCount}/{stats.totalPurchasable} BĐS
            </p>
          </div>
        </div>

        {/* Tab switcher & Close button */}
        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-1.5 p-1 bg-amber-950/5 border border-amber-900/10 rounded-2xl">
            <button
              type="button"
              data-testid="tab-blueprint"
              onClick={() => handleTabChange('blueprint')}
              className={`min-h-[44px] min-w-[44px] px-3.5 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'blueprint'
                  ? 'bg-slate-900 text-amber-300 shadow-xs border border-slate-700/50 font-black'
                  : 'text-slate-600 hover:text-slate-900 font-bold'
              }`}
            >
              <span>🗺️</span>
              <span className="hidden sm:inline">Sa Bàn 40 Ô</span>
            </button>
            <button
              type="button"
              data-testid="tab-districts"
              onClick={() => handleTabChange('districts')}
              className={`min-h-[44px] min-w-[44px] px-3.5 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'districts'
                  ? 'bg-slate-900 text-amber-300 shadow-xs border border-slate-700/50 font-black'
                  : 'text-slate-600 hover:text-slate-900 font-bold'
              }`}
            >
              <span>🏛️</span>
              <span className="hidden sm:inline">8 Phân Khu &amp; Độc Quyền</span>
            </button>
          </nav>

          {onClose && (
            <button
              type="button"
              data-testid="masterplan-close-btn"
              aria-label="Đóng"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl bg-white/90 hover:bg-amber-50 text-slate-700 hover:text-slate-900 font-black border border-amber-900/15 shadow-2xs transition-colors cursor-pointer text-base"
            >
              ✕
            </button>
          )}
        </div>
      </header>

      {/* Body Content */}
      <div ref={contentContainerRef} className="flex-1 overflow-y-auto p-3 sm:p-4">
        {/* ================================================================= */}
        {/* TAB 1: SA BÀN 40 Ô (BLUEPRINT GRID) */}
        {/* ================================================================= */}
        {activeTab === 'blueprint' && (
          <div
            data-testid="masterplan-blueprint-grid"
            className="grid grid-cols-11 grid-rows-11 gap-1 w-full max-w-[620px] aspect-square mx-auto p-1.5 bg-slate-100 border-2 border-slate-800 rounded-xl"
          >
            {BOARD_CONFIG.map((cell) => {
              const coord = GRID_TILE_COORDS[cell.index] ?? { row: 1, col: 1 };
              const deedInfo = getDeedDisplayInfo(cell.index);
              const { owner, isMortgaged, level } = getCellOwnership(cell.index);
              const isPurchasable = Boolean(deedInfo);
              const isOwned = Boolean(owner);
              const isSelected = currentInspected === cell.index;

              return (
                <button
                  key={cell.index}
                  type="button"
                  data-testid={`masterplan-cell-${cell.index}`}
                  onClick={() => setInspectedIndex(cell.index)}
                  style={{
                    gridRow: coord.row,
                    gridColumn: coord.col,
                  }}
                  className={`relative flex flex-col items-center justify-between p-0.5 rounded-sm transition-transform active:scale-95 cursor-pointer text-[10px] sm:text-xs overflow-hidden ${
                    isSelected ? 'ring-2 ring-blue-500 z-10 scale-105' : ''
                  } ${
                    isPurchasable && !isOwned
                      ? 'border border-dashed border-slate-400 bg-white/90 hover:bg-amber-50'
                      : 'border border-slate-700 bg-white'
                  }`}
                >
                  {/* Dải màu nhóm đất nếu là BĐS */}
                  {cell.colorGroup && (
                    <div
                      className="w-full h-1 sm:h-1.5 shrink-0"
                      style={{ backgroundColor: COLOR_GROUP_HEX[cell.colorGroup] }}
                    />
                  )}

                  {/* Nội dung ô */}
                  <div className="flex-1 flex flex-col items-center justify-center w-full px-0.5 py-0.5 leading-none">
                    {!isPurchasable ? (
                      <span className="text-xs sm:text-sm">{resolveSpecialIcon(cell.type)}</span>
                    ) : isOwned ? (
                      <div className="flex items-center gap-0.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                          style={{ backgroundColor: owner.tokenColor }}
                          title={`Chủ sở hữu: ${owner.name}`}
                        />
                        <span className="text-[11px] leading-none">{owner.avatar || '👤'}</span>
                      </div>
                    ) : (
                      <span className="font-bold text-slate-700 text-[9px] sm:text-[10px]">
                        {deedInfo?.price}
                      </span>
                    )}
                  </div>

                  {/* Footer ô: Cấp nhà C1-C3 hoặc Thế Chấp */}
                  <div className="w-full flex items-center justify-center gap-0.5 text-[8px] sm:text-[9px] font-black leading-none pb-0.5">
                    {isMortgaged ? (
                      <span data-mortgaged="true" className="text-rose-600 font-black">🔒</span>
                    ) : level > 0 ? (
                      <span className="bg-amber-400 text-slate-900 px-0.5 rounded-xs">
                        {`C${level}`}
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}

            {/* Central Area: Tactical Dashboard OR Inspector Card */}
            <div
              style={{
                gridRow: '2 / 11',
                gridColumn: '2 / 11',
              }}
              className="bg-[#FFFDF8] rounded-lg border border-slate-300 p-2 sm:p-4 flex flex-col justify-between overflow-y-auto shadow-inner"
            >
              {inspectedDeedInfo ? (
                <MasterplanInspectorCard
                  deedInfo={inspectedDeedInfo}
                  ownership={inspectedOwnership}
                  onClose={() => setInspectedIndex(null)}
                />
              ) : (
                <div className="flex flex-col justify-between h-full text-xs">
                  <div>
                    <h4 className="font-black text-slate-900 mb-1 flex items-center gap-1.5 text-xs sm:text-sm">
                      <span>📊</span> BÁO CÁO ĐẦU TƯ TOÀN ĐÔ THỊ
                    </h4>
                    <p className="text-[11px] text-slate-600 mb-2">
                      Nhấn vào bất kỳ ô nào quanh viền để xem chi tiết Sổ Đỏ &amp; biểu phí thuê.
                    </p>

                    <div className="space-y-1 mb-2">
                      {Object.values(players).map((p: any) => {
                        const count = p?.ownedProperties?.length ?? 0;
                        return (
                          <div
                            key={p.id}
                            className="flex items-center justify-between p-1.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px]"
                          >
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-2.5 h-2.5 rounded-full inline-block"
                                style={{ backgroundColor: p.tokenColor }}
                              />
                              <span className="font-bold text-slate-800">{p.avatar} {p.name}</span>
                            </div>
                            <span className="font-black text-slate-700">{count} BĐS</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 font-medium">
                    💡 <strong>Mẹo quy hoạch:</strong> Gom đủ 1 nhóm màu để kích hoạt quyền nâng cấp nhà phố (C1), khách sạn (C2) và resort (C3).
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: 8 PHÂN KHU ĐỘC QUYỀN (DISTRICT MONOPOLY MATRIX) */}
        {/* ================================================================= */}
        {activeTab === 'districts' && (
          <div className="flex flex-col min-h-full">
            {/* Filter Bar */}
            <div
              data-testid="district-filter-bar"
              className="flex items-center gap-1.5 p-1.5 bg-amber-950/5 border border-amber-900/10 rounded-2xl mb-3 overflow-x-auto no-scrollbar shrink-0"
            >
              {FILTER_OPTIONS.map((opt) => {
                const isActive = activeFilter === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    data-testid={`district-filter-${opt.id}`}
                    onClick={() => handleFilterChange(opt.id)}
                    className={`min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-amber-500 text-amber-950 font-black shadow-xs'
                        : 'bg-white/90 hover:bg-amber-50/60 text-slate-700 border border-amber-900/15 font-bold'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span
                      data-testid={`district-filter-badge-${opt.id}`}
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-black leading-none ${
                        isActive
                          ? 'bg-amber-950/15 text-amber-950'
                          : 'bg-slate-200/80 text-slate-700'
                      }`}
                    >
                      {filterCounts[opt.id]}
                    </span>
                  </button>
                );
              })}
            </div>

            <div
              data-testid="masterplan-districts-grid"
              className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1"
            >
              {filteredDistricts.length > 0 ? (
                filteredDistricts.map((district) => (
                  <MasterplanDistrictCard
                    key={district.id}
                    district={district}
                    players={players}
                    getCellOwnership={getCellOwnership}
                    myPlayerId={myPlayerId}
                    onQuickTrade={handleQuickTrade}
                    onSelectCell={handleSelectCell}
                    onClose={onClose}
                  />
                ))
              ) : (
                <MasterplanEmptyState
                  filter={activeFilter}
                  totalDistricts={districts.length}
                  onResetFilter={() => handleFilterChange('all')}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MasterplanModal;
