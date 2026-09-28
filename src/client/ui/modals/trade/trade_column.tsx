// [UI-S04/MSS][IMP-200] TradeColumn — Cột hiển thị BĐS và Stepper tiền tệ P2P
import React from 'react';
import { getDeedDisplayInfo } from '../modal_helpers';
import { formatCurrency } from '../../ui_helpers';
import { COLOR_GROUP_HEX } from '../../../../domain/theme';
import { getPropertySynergyTag } from '../trade_intelligence';

export interface TradeColumnProps {
  readonly title: string;
  readonly isMine: boolean;
  readonly properties: readonly number[];
  readonly mortgagedProperties: readonly number[];
  readonly mortgageLoans?: Record<number, number>;
  readonly selectedProperties: readonly number[];
  readonly onToggleProperty: (cellId: number) => void;
  readonly cashVal: number;
  readonly onCashChange: (val: number) => void;
  readonly maxCash?: number;
  readonly effectiveTargetBalance?: number;
  readonly partnerCanAfford?: boolean;
  readonly myBalance?: number;
  readonly myProperties?: readonly number[];
  readonly targetProperties?: readonly number[];
  readonly offeredCount?: number;
  readonly requestedCount?: number;
  readonly price70?: number;
  readonly price100?: number;
  readonly price120?: number;
  readonly price150?: number;
  readonly reqPrice100?: number;
  readonly reqPrice120?: number;
  readonly reqPrice150?: number;
  readonly reqPrice200?: number;
  readonly levelMap?: Record<number, number>;
}

export function TradeColumn({
  title,
  isMine,
  properties = [],
  mortgagedProperties = [],
  mortgageLoans,
  selectedProperties = [],
  onToggleProperty,
  cashVal,
  onCashChange,
  maxCash,
  effectiveTargetBalance = 0,
  partnerCanAfford = true,
  myBalance = 0,
  myProperties = [],
  targetProperties = [],
  offeredCount = 0,
  requestedCount = 0,
  price70 = 0,
  price100 = 0,
  price120 = 0,
  price150 = 0,
  reqPrice100 = 0,
  reqPrice120 = 0,
  reqPrice150 = 0,
  reqPrice200 = 0,
  levelMap,
}: TradeColumnProps): React.ReactElement {
  const matClass = isMine
    ? 'bg-blue-50/80 border-2 border-blue-300 shadow-sm text-slate-900'
    : 'bg-amber-50/80 border-2 border-amber-300 shadow-sm text-slate-900';

  const synergyProps = properties.filter((id) =>
    Boolean(getPropertySynergyTag(id, isMine, myProperties, targetProperties))
  );
  const standardProps = properties.filter((id) =>
    !getPropertySynergyTag(id, isMine, myProperties, targetProperties)
  );

  const renderPropertyCard = (id: number) => {
    const deed = getDeedDisplayInfo(id);
    const color = deed?.colorGroup ? COLOR_GROUP_HEX[deed.colorGroup] : '#64748b';
    const isMort = mortgagedProperties?.includes(id) ?? false;
    const loan = mortgageLoans?.[id] ?? Math.floor((deed?.price ?? 0) * 0.5);
    const checked = selectedProperties?.includes(id) ?? false;
    const synergyTag = getPropertySynergyTag(id, isMine, myProperties, targetProperties);
    const rawName = deed?.name ?? `Ô #${id}`;
    const match = rawName.match(/^(.*?)\s*(\(.*?\))$/);
    const mainName = match ? match[1] : rawName;
    const subName = match ? match[2] : null;
    const bldLevel = levelMap?.[id] ?? 0;
    const hasBuilding = bldLevel > 0;

    return (
      <button
        key={id}
        type="button"
        data-selected={checked ? 'true' : undefined}
        disabled={hasBuilding}
        onClick={() => !hasBuilding && onToggleProperty(id)}
        title={hasBuilding ? 'Cần hạ cấp hết công trình về Cấp 0 trước khi trao đổi' : `Ô #${id} - ${rawName}`}
        className={`w-full text-left rounded-xl border transition-all overflow-hidden flex items-center min-h-[44px] text-xs ${
          hasBuilding
            ? 'opacity-60 bg-slate-50 text-slate-500 border-slate-200 cursor-not-allowed'
            : checked
            ? 'bg-amber-100 text-slate-900 border-2 border-amber-500 font-bold shadow-xs cursor-pointer'
            : isMort
            ? 'bg-slate-50 text-slate-900 border border-amber-200 hover:bg-slate-100 shadow-2xs cursor-pointer'
            : 'bg-white text-slate-900 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-2xs cursor-pointer'
        }`}
      >
        <div className="w-2.5 sm:w-3 self-stretch shrink-0" style={{ backgroundColor: color }} />
        <div className="px-2.5 py-1.5 flex-1 min-w-0 flex items-center justify-between gap-1.5 overflow-hidden">
          <div className="flex flex-col flex-1 min-w-0 pr-1">
            <div className="flex items-center justify-between gap-1">
              <span className="truncate min-w-0 font-bold text-slate-900 text-xs sm:text-sm">{mainName}</span>
              <span className="text-xs font-mono font-bold text-amber-900 shrink-0">{deed ? formatCurrency(deed.price) : ''}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 min-w-0">
              <span className="font-mono font-bold text-slate-400 shrink-0">Ô #{id}</span>
              {subName && (
                <span className="truncate min-w-0">{subName}</span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-1 items-center shrink-0">
            {hasBuilding ? (
              <span className="px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-700 font-bold text-[11px] border border-slate-300">
                🏠 C{bldLevel} (Có nhà)
              </span>
            ) : synergyTag ? (
              <span className="px-1.5 py-0.5 rounded-md bg-amber-400 text-amber-950 font-black text-[11px] shadow-2xs border border-amber-600 animate-pulse">
                {synergyTag}
              </span>
            ) : null}
            {!hasBuilding && checked && (
              <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-amber-950 font-black text-[11px] shadow-2xs">✓ [ĐÃ CHỌN]</span>
            )}
            {!hasBuilding && isMort && (
              <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[11px] whitespace-nowrap">
                ⚠️ Nợ -{formatCurrency(loan)} (Thế chấp)
              </span>
            )}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className={`p-3 rounded-xl flex flex-col space-y-2.5 ${matClass}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">{title}</h3>
        {!isMine && (
          <span className="text-[11px] text-slate-600 font-medium">
            Tiền mặt đối tác: <strong className="font-mono text-slate-900 font-bold">{formatCurrency(effectiveTargetBalance)}</strong>
          </span>
        )}
      </div>

      <div
        className="flex-1 max-h-52 sm:max-h-72 overflow-y-auto space-y-2 pr-1"
      >
        {properties.length === 0 ? (
          <div className="min-h-[100px] flex flex-col items-center justify-center p-3 text-center rounded-lg border border-dashed border-slate-300 bg-white/60">
            <span className="text-xl mb-1" aria-hidden="true">🏛️</span>
            <p className="text-[11px] text-slate-500 font-medium">Chưa sở hữu BĐS</p>
            <span className="sr-only">🏛️ Chưa sở hữu BĐS</span>
          </div>
        ) : (
          <>
            {synergyProps.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 px-1 py-0.5 text-[11px] font-black text-amber-800 tracking-wide uppercase">
                  <span>⭐ CƠ HỘI ĐỘC QUYỀN (WIN-WIN)</span>
                </div>
                <div className="space-y-1.5">
                  {synergyProps.map(renderPropertyCard)}
                </div>
              </div>
            )}
            {standardProps.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 px-1 py-0.5 text-[11px] font-black text-slate-600 tracking-wide uppercase">
                  <span>📁 TÀI SẢN KHÁC (THEO BỘ MÀU)</span>
                </div>
                <div className="space-y-1.5">
                  {standardProps.map(renderPropertyCard)}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div>
        <label className="text-[11px] text-slate-700 block mb-1 font-semibold">
          {isMine ? `Bù tiền mặt (Tối đa ${formatCurrency(myBalance)})` : 'Yêu cầu đối tác trả tiền:'}
        </label>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              data-testid="cash-stepper-decrement"
              disabled={maxCash !== undefined && cashVal <= 0}
              onClick={() => onCashChange(Math.max(0, cashVal - 100))}
              className={`min-h-[44px] min-w-[44px] px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-900 font-mono text-base font-black rounded-lg border-2 border-slate-400 shadow-[0_2px_0_0_#94a3b8] active:shadow-none active:translate-y-[2px] transition-all cursor-pointer inline-flex items-center justify-center shrink-0 ${maxCash !== undefined && cashVal <= 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
              aria-label="Giảm tiền"
            >-</button>
            <input
              type="number"
              min={0}
              max={maxCash}
              value={cashVal === 0 ? '' : cashVal}
              placeholder="0"
              onChange={(e) => {
                const val = Math.max(0, maxCash !== undefined ? Math.min(maxCash, Number(e.target.value) || 0) : Number(e.target.value) || 0);
                onCashChange(val);
              }}
              className="flex-1 min-w-0 min-h-[44px] bg-white border border-slate-300 rounded-lg p-2 text-base sm:text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 text-center"
            />
            <button
              type="button"
              data-testid="cash-stepper-plus"
              onClick={() => onCashChange(maxCash !== undefined ? Math.min(maxCash, cashVal + 100) : cashVal + 100)}
              className="min-h-[44px] min-w-[44px] px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-900 font-mono text-base font-black rounded-lg border-2 border-slate-400 shadow-[0_2px_0_0_#94a3b8] active:shadow-none active:translate-y-[2px] transition-all cursor-pointer inline-flex items-center justify-center shrink-0"
              aria-label="Tăng tiền"
            >+</button>
          </div>
          <div data-testid="cash-stepper-shortcuts" className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              data-testid="cash-stepper-increment"
              onClick={() => onCashChange(maxCash !== undefined ? Math.min(maxCash, cashVal + 100) : cashVal + 100)}
              className="flex-1 min-w-[50px] min-h-[44px] px-2 py-1.5 bg-slate-100 hover:bg-amber-100 text-slate-900 font-mono text-xs font-black rounded-lg border-2 border-slate-300 hover:border-amber-400 shadow-sm active:scale-95 transition-all cursor-pointer inline-flex items-center justify-center"
              aria-label="Tăng tiền 100"
            >+100</button>
            <button
              type="button"
              onClick={() => onCashChange(maxCash !== undefined ? Math.min(maxCash, cashVal + 500) : cashVal + 500)}
              className="flex-1 min-w-[50px] min-h-[44px] px-2 py-1.5 bg-slate-100 hover:bg-amber-100 text-slate-900 font-mono text-xs font-black rounded-lg border-2 border-slate-300 hover:border-amber-400 shadow-sm active:scale-95 transition-all cursor-pointer inline-flex items-center justify-center"
            >+500</button>
            <button
              type="button"
              data-testid="cash-stepper-max"
              disabled={maxCash !== undefined && maxCash <= 0}
              onClick={() => maxCash !== undefined && onCashChange(maxCash)}
              className={`flex-1 min-w-[55px] min-h-[44px] px-2 py-1.5 bg-slate-100 hover:bg-amber-100 text-slate-900 font-bold text-xs rounded-lg border-2 border-slate-300 hover:border-amber-400 shadow-sm active:scale-95 transition-all cursor-pointer inline-flex items-center justify-center ${maxCash !== undefined && maxCash <= 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
            >Tối đa</button>
            <button
              type="button"
              data-testid="cash-stepper-clear"
              disabled={maxCash !== undefined && cashVal <= 0}
              onClick={() => onCashChange(0)}
              className={`flex-1 min-w-[45px] min-h-[44px] px-2 py-1.5 bg-slate-100 hover:bg-rose-100 text-slate-900 font-bold text-xs rounded-lg border-2 border-slate-300 hover:border-rose-400 shadow-sm active:scale-95 transition-all cursor-pointer inline-flex items-center justify-center ${maxCash !== undefined && cashVal <= 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
            >Xóa</button>
          </div>
        </div>

        {!isMine && offeredCount > 0 && (
          <div className="mt-1.5 pt-1.5 border-t border-amber-200/60 text-[11px] space-y-1">
            <span className="text-slate-500 font-medium block">Gợi ý giá bán:</span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => onCashChange(price70)}
                className="min-h-[44px] px-2 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center border-2 transition-all cursor-pointer touch-manipulation bg-white hover:bg-amber-50 border-amber-300 text-amber-950 shadow-[0_2px_0_0_#fcd34d] active:shadow-none active:translate-y-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                70% Sàn ({formatCurrency(price70)})
              </button>
              <button
                type="button"
                onClick={() => onCashChange(price100)}
                className="min-h-[44px] px-2 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center border-2 transition-all cursor-pointer touch-manipulation bg-white hover:bg-amber-50 border-amber-300 text-amber-950 shadow-[0_2px_0_0_#fcd34d] active:shadow-none active:translate-y-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                100% Gốc ({formatCurrency(price100)})
              </button>
              <button
                type="button"
                onClick={() => onCashChange(price120)}
                className="min-h-[44px] px-2 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center border-2 transition-all cursor-pointer touch-manipulation bg-white hover:bg-amber-50 border-amber-300 text-amber-950 shadow-[0_2px_0_0_#fcd34d] active:shadow-none active:translate-y-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                120% Lãi chuẩn ({formatCurrency(price120)})
              </button>
              <button
                type="button"
                onClick={() => onCashChange(price150)}
                className="min-h-[44px] px-2 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center border-2 transition-all cursor-pointer touch-manipulation bg-white hover:bg-amber-50 border-amber-300 text-amber-950 shadow-[0_2px_0_0_#fcd34d] active:shadow-none active:translate-y-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                150% Thắng lớn ({formatCurrency(price150)})
              </button>
            </div>
          </div>
        )}

        {isMine && requestedCount > 0 && (
          <div className="mt-1.5 pt-1.5 border-t border-blue-200/60 text-[11px] space-y-1">
            <span className="text-slate-500 font-medium block">Gợi ý giá mua:</span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => onCashChange(reqPrice100)}
                className="min-h-[44px] px-2 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center border-2 transition-all cursor-pointer touch-manipulation bg-white hover:bg-blue-50 border-blue-300 text-blue-950 shadow-[0_2px_0_0_#93c5fd] active:shadow-none active:translate-y-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                100% Gốc ({formatCurrency(reqPrice100)})
              </button>
              <button
                type="button"
                onClick={() => onCashChange(reqPrice120)}
                className="min-h-[44px] px-2 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center border-2 transition-all cursor-pointer touch-manipulation bg-white hover:bg-blue-50 border-blue-300 text-blue-950 shadow-[0_2px_0_0_#93c5fd] active:shadow-none active:translate-y-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                120% Lãi nhẹ ({formatCurrency(reqPrice120)})
              </button>
              <button
                type="button"
                onClick={() => onCashChange(reqPrice150)}
                className="min-h-[44px] px-2 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center border-2 transition-all cursor-pointer touch-manipulation bg-white hover:bg-blue-50 border-blue-300 text-blue-950 shadow-[0_2px_0_0_#93c5fd] active:shadow-none active:translate-y-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                150% Hấp dẫn ({formatCurrency(reqPrice150)})
              </button>
              <button
                type="button"
                onClick={() => onCashChange(reqPrice200)}
                className="min-h-[44px] px-2 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center border-2 transition-all cursor-pointer touch-manipulation bg-white hover:bg-blue-50 border-blue-300 text-blue-950 shadow-[0_2px_0_0_#93c5fd] active:shadow-none active:translate-y-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                200% Ép bán ({formatCurrency(reqPrice200)})
              </button>
            </div>
          </div>
        )}

        {!isMine && !partnerCanAfford && (
          <p className="text-[11px] text-rose-600 font-bold mt-1">Đối tác không đủ tiền mặt (hiện chỉ có {formatCurrency(effectiveTargetBalance)})</p>
        )}
        {isMine && cashVal > myBalance && (
          <p className="text-[11px] text-rose-600 font-bold mt-1">Số dư không đủ (bạn hiện có {formatCurrency(myBalance)})</p>
        )}
      </div>
    </div>
  );
}
