// [IMP-308] Masterplan District Card Sub-component
import React from 'react';
import { BOARD_CONFIG } from '../../../domain/board_config.js';
import { formatCurrency } from '../ui_helpers.js';
import { getDeedDisplayInfo } from './modal_helpers.js';
import type { DistrictGroupDef } from './masterplan_constants.js';

export interface DistrictCardPlayer {
  readonly id: string;
  readonly name: string;
  readonly avatar?: string;
  readonly tokenColor?: string;
}

export interface CellOwnershipInfo {
  readonly owner: DistrictCardPlayer | null;
  readonly isMortgaged: boolean;
  readonly level: number;
}

export interface MasterplanDistrictCardProps {
  readonly district: DistrictGroupDef;
  readonly players: Record<string, DistrictCardPlayer>;
  readonly getCellOwnership: (cellIndex: number) => CellOwnershipInfo;
  readonly myPlayerId?: string;
  readonly onQuickTrade?: (payload: {
    readonly targetPlayerId: string;
    readonly offeredProperties: readonly number[];
    readonly requestedProperties: readonly number[];
    readonly cashOffer: number;
    readonly cashRequest: number;
  }) => void;
  readonly onSelectCell?: (cellIndex: number) => void;
  readonly onClose?: () => void;
  readonly isTradeFrozen?: boolean;
}

export function MasterplanDistrictCard({
  district,
  players,
  getCellOwnership,
  myPlayerId,
  onQuickTrade,
  onSelectCell,
  onClose,
  isTradeFrozen,
}: MasterplanDistrictCardProps): React.ReactElement {
  const totalCells = district.cellIndices.length;

  const playerOwnershipCounts: Record<string, number> = {};
  let vacantCount = 0;
  for (const cellIndex of district.cellIndices) {
    const { owner } = getCellOwnership(cellIndex);
    if (owner?.id) {
      playerOwnershipCounts[owner.id] = (playerOwnershipCounts[owner.id] ?? 0) + 1;
    } else {
      vacantCount++;
    }
  }

  let monopolyPlayer: DistrictCardPlayer | null = null;
  let leadingPlayer: DistrictCardPlayer | null = null;
  let leadingCount = 0;
  for (const [pid, count] of Object.entries(playerOwnershipCounts)) {
    if (count > leadingCount) {
      leadingCount = count;
      leadingPlayer = players[pid] ?? null;
    }
    if (count === totalCells) {
      monopolyPlayer = players[pid] ?? null;
    }
  }
  const isNearMonopoly = totalCells > 1 && leadingCount === totalCells - 1 && !monopolyPlayer;

  return (
    <section
      data-district={district.id}
      className="bg-white border border-amber-900/15 rounded-2xl shadow-[0_4px_16px_rgba(15,23,42,0.04)] overflow-hidden flex flex-col justify-between transition-all"
    >
      {/* Dải ruy-băng phân khu ở đỉnh card */}
      <div
        data-testid="district-ribbon"
        className="h-1.5 w-full shrink-0"
        style={{ backgroundColor: district.hexColor }}
      />

      <div className="p-3 flex flex-col justify-between gap-2.5 flex-1">
        {/* Tiêu đề phân khu & Trạng thái độc quyền */}
        <div className="flex items-center justify-between border-b border-amber-900/10 pb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-3.5 h-3.5 rounded-full shrink-0"
              style={{ backgroundColor: district.hexColor }}
            />
            <div>
              <h3 className="font-black text-xs sm:text-sm text-slate-900">
                {district.name}
              </h3>
              <span className="text-[10px] text-slate-500 font-semibold">
                Quy mô: {totalCells} BĐS
              </span>
            </div>
          </div>

          {monopolyPlayer ? (
            <span
              data-monopoly="true"
              className="flex items-center gap-1 text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full"
            >
              👑 Độc Quyền ({monopolyPlayer.name})
            </span>
          ) : isNearMonopoly && leadingPlayer ? (
            <span
              data-near-monopoly="true"
              className="flex items-center gap-1 text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full"
            >
              ⚡ Sắp Độc Quyền ({leadingPlayer.avatar ?? '👤'} <span className="hidden sm:inline">{leadingPlayer.name} </span>{leadingCount}/{totalCells})
            </span>
          ) : vacantCount === totalCells ? (
            <span
              data-testid={`district-status-vacant-${district.id}`}
              className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800"
            >
              🌱 Đất Trống
            </span>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px]">
              {Object.entries(playerOwnershipCounts).map(([pid, count]) => {
                const p = players[pid];
                if (!p) return null;
                return (
                  <span
                    key={pid}
                    className="font-bold px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800"
                    title={`${p.name}: ${count}/${totalCells}`}
                  >
                    {p.avatar} {count}/{totalCells}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Segmented Progress Bar */}
        <div
          data-testid={`district-progress-bar-${district.id}`}
          className="flex items-center gap-1.5 w-full my-1.5 h-2.5 bg-slate-100/80 rounded-full p-0.5 border border-slate-200"
        >
          {district.cellIndices.map((cellIndex) => {
            const cell = BOARD_CONFIG[cellIndex];
            const { owner } = getCellOwnership(cellIndex);
            const cellName = cell?.name ?? `Ô ${cellIndex}`;

            if (owner) {
              return (
                <div
                  key={cellIndex}
                  data-testid={`district-progress-segment-${cellIndex}`}
                  className="flex-1 h-full rounded-full transition-all"
                  style={{ backgroundColor: owner.tokenColor }}
                  title={`${cellName}: ${owner.name}`}
                />
              );
            }
            return (
              <div
                key={cellIndex}
                data-testid={`district-progress-segment-${cellIndex}`}
                data-vacant="true"
                className="flex-1 h-full rounded-full bg-slate-100 border border-dashed border-slate-300"
                title={`${cellName}: Còn trống`}
              />
            );
          })}
        </div>

        {/* Danh sách các ô trong phân khu */}
        <div className="flex flex-col gap-1.5">
          {district.cellIndices.map((cellIndex) => {
            const cell = BOARD_CONFIG[cellIndex];
            const deed = getDeedDisplayInfo(cellIndex);
            const { owner, isMortgaged, level } = getCellOwnership(cellIndex);

            if (!cell) return null;

            return (
              <div
                key={cellIndex}
                role="button"
                tabIndex={0}
                data-testid={`district-cell-${cellIndex}`}
                onClick={() => {
                  onSelectCell?.(cellIndex);
                  onClose?.();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectCell?.(cellIndex);
                    onClose?.();
                  }
                }}
                style={
                  owner
                    ? {
                        backgroundColor: `${owner.tokenColor}0a`,
                        borderColor: `${owner.tokenColor}40`,
                      }
                    : undefined
                }
                className={`min-h-[44px] flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                  owner
                    ? 'bg-slate-50/60 hover:bg-amber-50/40 border-slate-200'
                    : 'bg-white hover:bg-slate-50 border-dashed border-slate-300'
                }`}
              >
                <div className="flex flex-col min-w-0 pr-1">
                  <span className="font-black text-slate-900 truncate text-[11px] sm:text-xs">
                    {cell.name}
                  </span>
                  <span className="text-[10px] text-amber-800 font-bold">
                    {deed?.price ? `${formatCurrency(deed.price)}` : ''}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {isMortgaged && (
                    <span
                      data-mortgaged="true"
                      className="text-[10px] text-rose-700 font-bold bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded"
                      title="Đang thế chấp"
                    >
                      🔒 Thế Chấp
                    </span>
                  )}
                  {level > 0 && (
                    <span className="text-[10px] font-black bg-amber-400 text-amber-950 px-1 py-0.5 rounded">
                      {`C${level}`}
                    </span>
                  )}
                  {owner ? (
                    <div
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-bold text-white shrink-0"
                      style={{ backgroundColor: owner.tokenColor }}
                      title={`Chủ: ${owner.name}`}
                    >
                      <span>{owner.avatar}</span>
                      <span className="hidden sm:inline max-w-[80px] sm:max-w-[120px] truncate">
                        {owner.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                      Trống
                    </span>
                  )}

                  {/* Cụm nút hành động */}
                  <button
                    type="button"
                    data-testid={`view-cell-btn-${cellIndex}`}
                    data-legacy-style="min-h-[36px]"
                    title="Xem trên sa bàn 3D"
                    onClick={(e) => {
                      e?.stopPropagation?.();
                      onSelectCell?.(cellIndex);
                      onClose?.();
                    }}
                    className="min-h-[44px] min-w-[44px] text-sm flex items-center justify-center rounded-xl bg-white/90 hover:bg-amber-50 text-slate-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                  >
                    👁️
                  </button>
                  {owner && owner.id !== myPlayerId && (
                    <button
                      type="button"
                      data-testid={`quick-trade-btn-${cellIndex}`}
                      data-legacy-style="min-h-[36px]"
                      disabled={isTradeFrozen}
                      title={isTradeFrozen ? 'Thị trường đang đóng băng giao dịch' : 'Đàm phán P2P đổi ô này'}
                      onClick={(e) => {
                        e?.stopPropagation?.();
                        if (isTradeFrozen) return;
                        onQuickTrade?.({
                          targetPlayerId: owner.id,
                          offeredProperties: [],
                          requestedProperties: [cellIndex],
                          cashOffer: 0,
                          cashRequest: 0,
                        });
                      }}
                      className={`min-h-[44px] min-w-[44px] px-2.5 text-xs flex items-center justify-center gap-1 rounded-xl font-black border transition-all ${
                        isTradeFrozen
                          ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed shadow-none active:translate-y-0'
                          : 'bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 border-amber-600 shadow-[0_2px_0_0_#b45309] active:translate-y-[1px] cursor-pointer'
                      }`}
                    >
                      <span>🤝</span>
                      <span className="hidden md:inline text-[11px]">Đổi Ô</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
