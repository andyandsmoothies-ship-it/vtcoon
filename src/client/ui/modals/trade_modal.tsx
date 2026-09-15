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
  ) => {
    const matClass = isMine
      ? 'bg-slate-900 border-2 border-blue-500 shadow-md text-white'
      : 'bg-red-900 border-2 border-rose-500 shadow-md text-white';

    return (
      <div className={`p-3 rounded-xl flex flex-col space-y-2.5 ${matClass}`}>
        <h3 className="font-bold text-[11px] uppercase tracking-wider text-white">
          {title}
        </h3>
        <div className="flex-1 max-h-40 overflow-y-auto space-y-1.5 pr-1">
          {props.length === 0 ? (
            <p className="text-[11px] text-white/70 italic">Không có BĐS</p>
          ) : (
            props.map((id) => {
              const deed = getDeedDisplayInfo(id);
              const color = deed?.colorGroup ? COLOR_GROUP_HEX[deed.colorGroup] : '#64748b';
              const isMort = mortgaged.includes(id);
              const checked = selected.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  disabled={isMort}
                  onClick={() => toggleProperty(id, isMine)}
                  className={`w-full text-left rounded-lg border transition-all overflow-hidden flex flex-col text-[11px] ${
                    isMort
                      ? 'opacity-50 cursor-not-allowed bg-slate-800 border-slate-700 text-slate-400'
                      : checked
                      ? 'bg-amber-100 text-slate-900 border-2 border-amber-400 font-bold shadow-sm'
                      : 'bg-white text-slate-900 border border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <div
                    className="w-full h-2"
                    style={{ backgroundColor: color }}
                  />
                  <div className="p-1.5 flex items-center justify-between gap-1">
                    <span className="truncate flex-1 font-semibold">{deed?.name ?? `Ô #${id}`}</span>
                    {checked && <span className="text-amber-800 font-black">✓</span>}
                    {isMort && <span className="text-[9px] text-rose-600 font-medium">Thế chấp</span>}
                  </div>
                </button>
              );
            })
          )}
        </div>
        <div>
          <label className="text-[10px] text-white/80 block mb-0.5 font-medium">
            {isMine ? `Bù tiền mặt (Tối đa ${formatCurrency(myBalance)})` : 'Yêu cầu đối tác bù tiền'}
          </label>
          <div className="flex items-center gap-1.5">
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
              className="flex-1 bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              type="button"
              onClick={() => {
                const next = cashVal + 100;
                const val = maxCash !== undefined ? Math.min(maxCash, next) : next;
                onCash(val);
              }}
              className="px-2 py-1.5 bg-white/20 hover:bg-white/30 text-white font-mono text-[10px] font-bold rounded-lg border border-white/30 cursor-pointer"
            >
              +100
            </button>
            <button
              type="button"
              onClick={() => {
                const next = cashVal + 500;
                const val = maxCash !== undefined ? Math.min(maxCash, next) : next;
                onCash(val);
              }}
              className="px-2 py-1.5 bg-white/20 hover:bg-white/30 text-white font-mono text-[10px] font-bold rounded-lg border border-white/30 cursor-pointer"
            >
              +500
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-md lg:max-w-lg max-h-[90vh] overflow-y-auto bg-[#FFFDF8] border-2 border-slate-900 rounded-2xl shadow-[0_6px_0_0_#0f172a] flex flex-col pointer-events-auto text-slate-900 select-none" data-testid="trade-modal">
      <header className="p-3.5 bg-[#F7F2E7] border-b border-slate-300 flex items-center justify-between sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">🤝</span>
          <h2 className="text-sm font-black uppercase text-slate-900 tracking-wide">
            Đàm Phán P2P {targetPlayerName ? `với ${targetPlayerName}` : ''}
          </h2>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng đàm phán"
            className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-slate-500 hover:text-slate-900 text-xl font-bold rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer transition-colors"
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
        <div className="p-2 bg-[#F7F2E7] border border-slate-300 rounded-xl flex items-center justify-between text-[11px] text-slate-800">
          <span className="font-medium">Khấu trừ 5% thuế nộp Kho Bạc:</span>
          <span className="font-black text-amber-800">{formatCurrency(taxAmount)}</span>
        </div>
      </div>

      <footer className="p-4 pt-2 bg-[#F7F2E7] border-t border-slate-300 flex gap-2 sticky bottom-0 z-10 shrink-0">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid}
          className={`flex-1 min-h-[44px] py-2 px-3 rounded-xl font-bold text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
            isValid
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-2 border-emerald-700 shadow-[0_4px_0_0_#065f46] active:shadow-[0_1px_0_0_#065f46] active:translate-y-[3px] cursor-pointer font-black'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
          }`}
        >
          Gửi Đề Xuất Đàm Phán
        </button>
        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold text-slate-900 bg-slate-200 hover:bg-slate-300 border-2 border-slate-400 shadow-[0_4px_0_0_#64748b] active:shadow-[0_1px_0_0_#64748b] active:translate-y-[3px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer"
        >
          Hủy
        </button>
      </footer>
    </div>
  );
}
