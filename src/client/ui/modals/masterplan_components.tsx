// [IMP-132/IMP-137] Masterplan Sub-components — Inspector Card & District Cards
import React from 'react';
import { COLOR_GROUP_HEX } from '../../../domain/theme';
import { BOARD_CONFIG } from '../../../domain/board_config';
import { getDeedDisplayInfo, type DeedDisplayInfo } from './modal_helpers';
import type { DistrictGroupDef } from './masterplan_constants';

export interface MasterplanInspectorCardProps {
  readonly deedInfo: DeedDisplayInfo;
  readonly ownership: { owner: any; isMortgaged: boolean; level: number } | null;
  readonly onClose: () => void;
}

export function MasterplanInspectorCard({
  deedInfo,
  ownership,
  onClose,
}: MasterplanInspectorCardProps): React.ReactElement {
  return (
    <div
      data-testid="masterplan-cell-inspector"
      className="flex flex-col h-full justify-between"
    >
      <div className="flex items-start justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          {deedInfo.colorGroup && (
            <div
              className="w-3.5 h-3.5 rounded-md shrink-0"
              style={{ backgroundColor: COLOR_GROUP_HEX[deedInfo.colorGroup] }}
            />
          )}
          <div>
            <h3 className="font-black text-xs sm:text-sm text-slate-900 leading-tight">
              {deedInfo.name}
            </h3>
            <p className="text-[10px] text-slate-500 font-semibold">
              Ô số {deedInfo.cellIndex} • Giá mua {deedInfo.price} Tr.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold cursor-pointer"
        >
          ✕ Thu Gọn
        </button>
      </div>

      {/* Thông số Sổ Đỏ */}
      <div className="grid grid-cols-2 gap-2 my-2 text-xs">
        <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
          <span className="text-[10px] text-slate-500 block">Chủ Sở Hữu</span>
          <span className="font-bold text-slate-900">
            {ownership?.owner ? (
              <span className="flex items-center gap-1">
                <span>{ownership.owner.avatar}</span>
                <span>{ownership.owner.name}</span>
              </span>
            ) : (
              'Chưa ai mua (Trống)'
            )}
          </span>
        </div>
        <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
          <span className="text-[10px] text-slate-500 block">Tiền Thuê Cơ Bản (C0)</span>
          <span className="font-bold text-emerald-600">
            {deedInfo.rents[0]} Tr.
          </span>
        </div>
        <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
          <span className="text-[10px] text-slate-500 block">Cấp Công Trình</span>
          <span className="font-bold text-amber-700">
            {ownership?.level ? `Cấp ${ownership.level}` : 'Đất Nền (C0)'}
          </span>
        </div>
        <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
          <span className="text-[10px] text-slate-500 block">Giá Trị Thế Chấp</span>
          <span className="font-bold text-slate-700">
            {deedInfo.mortgageValue} Tr.
          </span>
        </div>
      </div>

      {/* Biểu phí thuê theo cấp */}
      <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-[10px]">
        <div className="font-bold text-slate-700 mb-1">Biểu Phí Dừng Chân:</div>
        <div className="grid grid-cols-4 gap-1 text-center font-semibold">
          <div className="bg-white p-1 rounded border border-slate-200">C0: {deedInfo.rents[0]} Tr.</div>
          <div className="bg-white p-1 rounded border border-slate-200">C1: {deedInfo.rents[1]} Tr.</div>
          <div className="bg-white p-1 rounded border border-slate-200">C2: {deedInfo.rents[2]} Tr.</div>
          <div className="bg-white p-1 rounded border border-slate-200">C3: {deedInfo.rents[3]} Tr.</div>
        </div>
      </div>
    </div>
  );
}

export interface MasterplanDistrictCardProps {
  readonly district: DistrictGroupDef;
  readonly players: Record<string, any>;
  readonly getCellOwnership: (cellIndex: number) => { owner: any; isMortgaged: boolean; level: number };
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
}

export function MasterplanDistrictCard({
  district,
  players,
  getCellOwnership,
  myPlayerId,
  onQuickTrade,
  onSelectCell,
  onClose,
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

  let monopolyPlayer: any = null;
  let leadingPlayer: any = null;
  let leadingCount = 0;
  for (const [pid, count] of Object.entries(playerOwnershipCounts)) {
    if (count > leadingCount) {
      leadingCount = count;
      leadingPlayer = players[pid];
    }
    if (count === totalCells) {
      monopolyPlayer = players[pid];
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
                    {deed?.price ? `${deed.price} Tr.` : ''}
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
                    <span className="text-[10px] font-black bg-amber-400 text-slate-900 px-1 py-0.5 rounded">
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
                    title="Xem trên sa bàn 3D"
                    onClick={(e) => {
                      e?.stopPropagation?.();
                      onSelectCell?.(cellIndex);
                      onClose?.();
                    }}
                    className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl bg-white/90 hover:bg-amber-50 text-slate-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                  >
                    👁️
                  </button>
                  {owner && owner.id !== myPlayerId && (
                    <button
                      type="button"
                      data-testid={`quick-trade-btn-${cellIndex}`}
                      title="Đàm phán P2P đổi ô này"
                      onClick={(e) => {
                        e?.stopPropagation?.();
                        onQuickTrade?.({
                          targetPlayerId: owner.id,
                          offeredProperties: [],
                          requestedProperties: [cellIndex],
                          cashOffer: 0,
                          cashRequest: 0,
                        });
                      }}
                      className="min-h-[36px] min-w-[36px] px-2 flex items-center justify-center gap-1 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-black border border-amber-600 shadow-[0_2px_0_0_#b45309] text-xs transition-transform active:translate-y-[1px] cursor-pointer"
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

export interface MasterplanEmptyStateProps {
  readonly filter?: 'all' | 'near-monopoly' | 'monopoly' | 'vacant';
  readonly activeFilter?: 'all' | 'near-monopoly' | 'monopoly' | 'vacant';
  readonly onResetFilter?: () => void;
  readonly onReset?: () => void;
  readonly totalDistricts?: number;
}

export function MasterplanEmptyState(props: MasterplanEmptyStateProps): React.ReactElement {
  const filter = props.filter ?? props.activeFilter ?? 'all';
  const onResetFilter = props.onResetFilter ?? props.onReset ?? (() => {});

  const config = {
    'near-monopoly': {
      icon: '🛡️',
      title: 'Chưa Có Phân Khu Cận Kề Độc Quyền',
      description:
        'Hiện không có phân khu nào đang ở thế giằng co cận kề độc quyền (thiếu 1 ô). Thị trường đang ở trạng thái cạnh tranh mở hoặc đã hoàn tất quy hoạch.',
      hint: '💡 Hãy quan sát các nước đi tiếp theo của đối thủ để kịp thời chặn đà thâu tóm.',
    },
    monopoly: {
      icon: '🏛️',
      title: 'Chưa Có Phân Khu Nào Đạt Độc Quyền',
      description:
        'Chưa người chơi nào thâu tóm trọn vẹn 1 nhóm màu. Quyền nâng cấp nhà C1-C3 vẫn đang rộng mở cho tất cả mọi người!',
      hint: '💡 Hãy mở thương lượng (Trade) để gom đủ bộ màu trước khi đối thủ làm điều đó.',
    },
    vacant: {
      icon: '🏙️',
      title: 'Toàn Bộ Đô Thị Đã Được Phủ Kín!',
      description:
        '100% các ô đất và cơ sở hạ tầng đã có chủ sở hữu. Không còn ô đất hoang nào để mua trực tiếp từ ngân hàng.',
      hint: '💡 Tận dụng các phiên Đấu Giá Phát Mãi Cưỡng Chế (-30%) khi đối thủ thiếu hụt thanh khoản.',
    },
    all: {
      icon: '🗺️',
      title: 'Không Có Dữ Liệu Phân Khu',
      description: 'Hệ thống chưa ghi nhận thông tin phân khu nào trên sa bàn.',
      hint: '💡 Bấm làm mới để tải lại dữ liệu.',
    },
  }[filter] ?? {
    icon: '🗺️',
    title: 'Không Có Dữ Liệu Phân Khu',
    description: 'Hệ thống chưa ghi nhận thông tin phân khu nào.',
    hint: '',
  };

  return (
    <div
      data-testid="masterplan-empty-state"
      className="col-span-full border-2 border-dashed border-amber-900/20 bg-[#FDFBF7] rounded-3xl p-6 sm:p-8 text-center flex flex-col items-center justify-center min-h-[260px] shadow-inner"
    >
      <div
        className="w-16 h-16 rounded-2xl bg-amber-100/70 border border-amber-900/15 flex items-center justify-center text-3xl mb-3 shadow-xs"
        aria-hidden="true"
      >
        {config.icon}
      </div>
      <h3 className="text-base font-black text-slate-900 mb-1.5 uppercase tracking-wide">
        {config.title}
      </h3>
      <p className="text-xs text-slate-600 max-w-md mb-2 leading-relaxed font-medium">
        {config.description}
      </p>
      {config.hint && (
        <p className="text-[11px] text-amber-900/80 bg-amber-50 border border-amber-900/10 rounded-xl px-3 py-1.5 max-w-md mb-5 font-semibold">
          {config.hint}
        </p>
      )}
      <button
        type="button"
        data-testid="masterplan-empty-reset-btn"
        onClick={onResetFilter}
        className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-amber-950 font-black text-xs shadow-[0_3px_0_0_#b45309] flex items-center gap-2 cursor-pointer transition-all border border-amber-600/30"
      >
        <span>🗺️</span>
        <span>Xem Tất Cả 10 Phân Khu</span>
      </button>
    </div>
  );
}

export { classifyDistrict, type DistrictClassification } from './masterplan_constants';

