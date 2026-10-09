// [IMP-132/IMP-137] Masterplan Sub-components — Inspector Card & District Cards
import React from 'react';
import { COLOR_GROUP_HEX } from '../../../domain/theme';
import { BOARD_CONFIG } from '../../../domain/board_config';
import { formatCurrency } from '../ui_helpers';
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
              Ô số {deedInfo.cellIndex} • Giá mua {formatCurrency(deedInfo.price)}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] min-w-[44px] px-3 py-2 text-xs font-bold rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
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
            {formatCurrency(deedInfo.rents[0])}
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
            {formatCurrency(deedInfo.mortgageValue)}
          </span>
        </div>
      </div>

      {/* Biểu phí thuê theo cấp */}
      <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-[10px]">
        <div className="font-bold text-slate-700 mb-1">Biểu Phí Dừng Chân:</div>
        <div className="grid grid-cols-4 gap-1 text-center font-semibold">
          <div className="bg-white p-1 rounded border border-slate-200">C0: {formatCurrency(deedInfo.rents[0])}</div>
          <div className="bg-white p-1 rounded border border-slate-200">C1: {formatCurrency(deedInfo.rents[1])}</div>
          <div className="bg-white p-1 rounded border border-slate-200">C2: {formatCurrency(deedInfo.rents[2])}</div>
          <div className="bg-white p-1 rounded border border-slate-200">C3: {formatCurrency(deedInfo.rents[3])}</div>
        </div>
      </div>
    </div>
  );
}

export {
  MasterplanDistrictCard,
  type MasterplanDistrictCardProps,
  type DistrictCardPlayer,
  type CellOwnershipInfo,
} from './masterplan_district_card.js';


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
      className="col-span-full border-2 border-dashed border-amber-900/20 bg-[#FDFBF7] rounded-3xl p-6 sm:p-8 text-center flex flex-col items-center justify-center min-h-[260px] md:min-h-[340px] h-full shadow-inner my-auto"
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

