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
  readonly reqPrice100?: number;
  readonly reqPrice130?: number;
  readonly reqPrice150?: number;
}

export function TradeColumn({
  title,
  isMine,
  properties,
  mortgagedProperties,
  selectedProperties,
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
  reqPrice100 = 0,
  reqPrice130 = 0,
  reqPrice150 = 0,
}: TradeColumnProps): React.ReactElement {
  const matClass = isMine
    ? 'bg-blue-50/80 border-2 border-blue-300 shadow-sm text-slate-900'
    : 'bg-amber-50/80 border-2 border-amber-300 shadow-sm text-slate-900';

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
        data-legacy-style="max-h-36 sm:max-h-52 md:max-h-72"
        className="flex-1 max-h-52 sm:max-h-72 overflow-y-auto space-y-1.5 pr-1"
      >
        {properties.length === 0 ? (
          <div className="min-h-[100px] flex flex-col items-center justify-center p-3 text-center rounded-lg border border-dashed border-slate-300 bg-white/60">
            <span className="text-xl mb-1" aria-hidden="true">🏛️</span>
            <p className="text-[11px] text-slate-500 font-medium">Chưa sở hữu BĐS</p>
            <span className="sr-only">🏛️ Chưa sở hữu BĐS</span>
          </div>
        ) : (
          properties.map((id) => {
            const deed = getDeedDisplayInfo(id);
            const color = deed?.colorGroup ? COLOR_GROUP_HEX[deed.colorGroup] : '#64748b';
            const isMort = mortgagedProperties.includes(id);
            const checked = selectedProperties.includes(id);
            const synergyTag = getPropertySynergyTag(id, isMine, myProperties, targetProperties);
            const rawName = deed?.name ?? `Ô #${id}`;
            const match = rawName.match(/^(.*?)\s*(\(.*?\))$/);
            const mainName = match ? match[1] : rawName;
            const subName = match ? match[2] : null;

            return (
              <button
                key={id}
                type="button"
                disabled={isMort}
                data-selected={checked ? 'true' : undefined}
                onClick={() => onToggleProperty(id)}
                className={`w-full text-left rounded-xl border transition-all overflow-hidden flex items-center min-h-[44px] text-xs cursor-pointer ${
                  isMort
                    ? 'opacity-50 cursor-not-allowed bg-slate-100 border-slate-300 text-slate-400'
                    : checked
                    ? 'bg-amber-100 text-slate-900 border-2 border-amber-500 font-bold shadow-xs'
                    : 'bg-white text-slate-900 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
                }`}
              >
                <div className="w-2.5 sm:w-3 self-stretch shrink-0" style={{ backgroundColor: color }} />
                <div className="px-2.5 py-1.5 flex-1 min-w-0 flex items-center justify-between gap-1.5 overflow-hidden">
                  <div className="flex flex-col flex-1 min-w-0 pr-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate min-w-0 font-bold text-slate-900 text-xs sm:text-sm">{mainName}</span>
                      <span className="text-xs font-mono font-bold text-amber-900 shrink-0">{deed ? formatCurrency(deed.price) : ''}</span>
                    </div>
                    {subName && (
                      <span className="text-[11px] text-slate-500 truncate min-w-0">{subName}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {synergyTag && (
                      <span className="px-1.5 py-0.5 rounded-md bg-amber-400 text-amber-950 font-black text-[11px] shadow-2xs border border-amber-600 animate-pulse">
                        {synergyTag}
                      </span>
                    )}
                    {checked && (
                      <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-amber-950 font-black text-[11px] shadow-2xs">✓ [ĐÃ CHỌN]</span>
                    )}
                    {isMort && (
                      <span className="px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 font-black text-[11px] border border-rose-300">Thế chấp</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
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
              disabled={cashVal <= 0}
              onClick={() => onCashChange(Math.max(0, cashVal - 100))}
              className="min-h-[44px] min-w-[44px] px-3 py-1.5 bg-slate-200 hover:bg-slate-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-900 font-mono text-base font-black rounded-lg border-2 border-slate-400 shadow-[0_2px_0_0_#94a3b8] active:shadow-none active:translate-y-[2px] transition-all cursor-pointer inline-flex items-center justify-center shrink-0"
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
              className="flex-1 min-w-0 min-h-[44px] bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 text-center"
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
              disabled={maxCash === undefined || maxCash <= 0}
              onClick={() => maxCash !== undefined && onCashChange(maxCash)}
              className="flex-1 min-w-[55px] min-h-[44px] px-2 py-1.5 bg-slate-100 hover:bg-amber-100 text-slate-900 font-bold text-xs rounded-lg border-2 border-slate-300 hover:border-amber-400 shadow-sm active:scale-95 transition-all cursor-pointer inline-flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
            >Tối đa</button>
            <button
              type="button"
              data-testid="cash-stepper-clear"
              disabled={cashVal <= 0}
              onClick={() => onCashChange(0)}
              className="flex-1 min-w-[45px] min-h-[44px] px-2 py-1.5 bg-slate-100 hover:bg-rose-100 text-slate-900 font-bold text-xs rounded-lg border-2 border-slate-300 hover:border-rose-400 shadow-sm active:scale-95 transition-all cursor-pointer inline-flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
            >Xóa</button>
          </div>
        </div>

        {!isMine && offeredCount > 0 && (
          <div className="mt-1.5 pt-1.5 border-t border-amber-200/60 flex items-center gap-1.5 flex-wrap text-[11px]">
            <span className="text-slate-500 font-medium">Gợi ý giá bán:</span>
            <button type="button" onClick={() => onCashChange(price70)} className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center border transition-all cursor-pointer touch-manipulation bg-white hover:bg-amber-100 border-amber-300 text-amber-900">70% Sàn ({formatCurrency(price70)})</button>
            <button type="button" onClick={() => onCashChange(price100)} className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center border transition-all cursor-pointer touch-manipulation bg-white hover:bg-amber-100 border-amber-300 text-amber-900">100% Gốc ({formatCurrency(price100)})</button>
            <button type="button" onClick={() => onCashChange(price120)} className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center border transition-all cursor-pointer touch-manipulation bg-white hover:bg-amber-100 border-amber-300 text-amber-900">120% ({formatCurrency(price120)})</button>
          </div>
        )}

        {isMine && requestedCount > 0 && (
          <div className="mt-1.5 pt-1.5 border-t border-blue-200/60 flex items-center gap-1.5 flex-wrap text-[11px]">
            <span className="text-slate-500 font-medium">Gợi ý giá mua:</span>
            <button type="button" onClick={() => onCashChange(reqPrice100)} className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center border transition-all cursor-pointer touch-manipulation bg-white hover:bg-blue-100 border-blue-300 text-blue-900">100% Gốc ({formatCurrency(reqPrice100)})</button>
            <button type="button" onClick={() => onCashChange(reqPrice130)} className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center border transition-all cursor-pointer touch-manipulation bg-white hover:bg-blue-100 border-blue-300 text-blue-900">130% ({formatCurrency(reqPrice130)})</button>
            <button type="button" onClick={() => onCashChange(reqPrice150)} className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center border transition-all cursor-pointer touch-manipulation bg-white hover:bg-blue-100 border-blue-300 text-blue-900">150% ({formatCurrency(reqPrice150)})</button>
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
