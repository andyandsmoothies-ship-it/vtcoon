// [UI-S04/MSS] TradeModal — Two-column P2P property and cash trade table with 5% treasury tax
import React, { useState } from 'react';
import { getDeedDisplayInfo, calculateTradeTax, validateTradeOffer } from './modal_helpers';
import { formatCurrency } from '../ui_helpers';
import { COLOR_GROUP_HEX } from '../../../domain/theme';

export interface TradeModalProps {
  readonly targetPlayerId: string;
  readonly myProperties: readonly number[];
  readonly targetProperties: readonly number[];
  readonly myMortgagedProperties?: readonly number[];
  readonly targetMortgagedProperties?: readonly number[];
  readonly myBalance: number;
  readonly targetPlayerName?: string;
  readonly initialOffered?: readonly number[];
  readonly initialRequested?: readonly number[];
  readonly initialCashOffer?: number;
  readonly initialCashRequest?: number;
  readonly onSubmitTrade?: (trade: {
    targetPlayerId: string;
    offeredProperties: number[];
    requestedProperties: number[];
    cashOffer: number;
    cashRequest: number;
  }) => void;
  readonly onClose?: () => void;
}

export function TradeModal({
  targetPlayerId, myProperties, targetProperties,
  myMortgagedProperties = [], targetMortgagedProperties = [],
  myBalance, targetPlayerName, initialOffered = [], initialRequested = [],
  initialCashOffer = 0, initialCashRequest = 0, onSubmitTrade, onClose,
}: TradeModalProps): React.ReactElement {
  const [offered, setOffered] = useState<number[]>([...initialOffered]);
  const [requested, setRequested] = useState<number[]>([...initialRequested]);
  const [cashOffer, setCashOffer] = useState<number>(initialCashOffer);
  const [cashRequest, setCashRequest] = useState<number>(initialCashRequest);

  const toggleProperty = (cellId: number, isMine: boolean) => {
    const setter = isMine ? setOffered : setRequested;
    setter((prev) => (prev.includes(cellId) ? prev.filter((id) => id !== cellId) : [...prev, cellId]));
  };

  const cashDiff = Math.max(cashOffer, cashRequest);
  const taxAmount = calculateTradeTax(cashDiff);
  const isValid = validateTradeOffer({
    offeredProperties: offered,
    requestedProperties: requested,
    cashOffer,
    cashRequest,
    myBalance,
    myProperties,
    targetProperties,
    myMortgagedProperties,
    targetMortgagedProperties,
  });

  const handleSubmit = () => {
    if (!isValid || !onSubmitTrade) return;
    onSubmitTrade({ targetPlayerId, offeredProperties: offered, requestedProperties: requested, cashOffer, cashRequest });
  };

  const renderCol = (
    title: string,
    isMine: boolean,
    props: readonly number[],
    mortgaged: readonly number[],
    selected: number[],
    cashVal: number,
    onCash: (v: number) => void,
    maxCash?: number,
  ) => (
    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex flex-col space-y-2.5">
      <h3 className={`font-bold text-[11px] uppercase tracking-wider ${isMine ? 'text-emerald-400' : 'text-amber-400'}`}>
        {title}
      </h3>
      <div className="flex-1 max-h-36 overflow-y-auto space-y-1 pr-1">
        {props.length === 0 ? (
          <p className="text-[11px] text-slate-400 italic">Không có BĐS</p>
        ) : (
          props.map((id) => {
            const deed = getDeedDisplayInfo(id);
            const color = deed?.colorGroup ? COLOR_GROUP_HEX[deed.colorGroup] : '#64748b';
            const isMort = mortgaged.includes(id);
            const checked = selected.includes(id);
            return (
              <label
                key={id}
                className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-[11px] transition-all ${
                  isMort
                    ? 'opacity-50 cursor-not-allowed bg-slate-950 border-slate-800 text-slate-500'
                    : checked
                      ? isMine ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-200 cursor-pointer' : 'bg-amber-950/40 border-amber-600/50 text-amber-200 cursor-pointer'
                      : 'bg-slate-900 border-slate-800 text-slate-300 cursor-pointer'
                }`}
              >
                <input
                  type="checkbox"
                  disabled={isMort}
                  checked={checked}
                  onChange={() => toggleProperty(id, isMine)}
                  className="rounded accent-emerald-500 disabled:opacity-30"
                />
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="truncate flex-1">{deed?.name ?? `Ô #${id}`}</span>
                {isMort && <span className="text-[9px] text-rose-400 font-medium">Thế chấp</span>}
              </label>
            );
          })
        )}
      </div>
      <div>
        <label className="text-[10px] text-slate-400 block mb-0.5">
          {isMine ? `Bù tiền mặt (Tối đa ${formatCurrency(myBalance)})` : 'Yêu cầu đối tác bù tiền'}
        </label>
        <input
          type="number"
          min={0}
          max={maxCash}
          value={cashVal === 0 ? '' : cashVal}
          placeholder="0 Tr."
          onChange={(e) => {
            const val = Math.max(0, maxCash !== undefined ? Math.min(maxCash, Number(e.target.value) || 0) : Number(e.target.value) || 0);
            onCash(val);
          }}
          className={`w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-100 focus:outline-none ${isMine ? 'focus:border-emerald-500' : 'focus:border-amber-500'}`}
        />
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-md lg:max-w-lg max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col pointer-events-auto" data-testid="trade-modal">
      <header className="p-3.5 bg-slate-800 border-b border-slate-700 flex items-center justify-between sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">🤝</span>
          <h2 className="text-sm font-bold uppercase text-white tracking-wide">
            Đàm Phán P2P {targetPlayerName ? `với ${targetPlayerName}` : ''}
          </h2>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng đàm phán"
            className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-white/80 hover:text-white text-xl font-bold rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer transition-colors"
          >
            ✕
          </button>
        )}
      </header>

      <div className="p-4 grid grid-cols-2 gap-3 text-xs">
        {renderCol('Tài Sản Bạn Đề Xuất', true, myProperties, myMortgagedProperties, offered, cashOffer, (v) => { setCashOffer(v); if (v > 0) setCashRequest(0); }, myBalance)}
        {renderCol('Tài Sản Đối Tác', false, targetProperties, targetMortgagedProperties, requested, cashRequest, (v) => { setCashRequest(v); if (v > 0) setCashOffer(0); })}
      </div>

      <div className="px-4 pb-2">
        <div className="p-2 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Khấu trừ 5% thuế nộp Kho Bạc:</span>
          <span className="font-bold text-amber-300">{formatCurrency(taxAmount)}</span>
        </div>
      </div>

      <footer className="p-4 pt-2 bg-slate-900/95 border-t border-slate-800 flex gap-2 sticky bottom-0 z-10 shrink-0">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid}
          className={`flex-1 min-h-[44px] py-2 px-3 rounded-xl font-bold text-white text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
            isValid
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 border border-emerald-800 shadow-[0_4px_0_0_#064e3b] active:shadow-[0_1px_0_0_#064e3b] active:translate-y-[3px] cursor-pointer'
              : 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
          }`}
        >
          Gửi Đề Xuất Đàm Phán
        </button>
        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 shadow-[0_4px_0_0_#020617] active:shadow-[0_1px_0_0_#020617] active:translate-y-[3px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer"
        >
          Hủy
        </button>
      </footer>
    </div>
  );
}
