// [UI-S04/MSS][IMP-75] TradeModal — Two-column P2P property and cash trade table with multi-partner tabs & transparent diorama styling
import React, { useState } from 'react';
import { getDeedDisplayInfo, calculateTradeTax, validateTradeOffer } from './modal_helpers';
import { formatCurrency } from '../ui_helpers';
import { COLOR_GROUP_HEX } from '../../../domain/theme';

interface TradePartnerInfo {
  readonly id: string;
  readonly name: string;
  readonly balance: number;
  readonly isBot?: boolean;
  readonly avatar?: string;
  readonly personality?: string;
}

export interface TradeModalProps {
  readonly targetPlayerId: string;
  readonly myProperties: readonly number[];
  readonly targetProperties: readonly number[];
  readonly myMortgagedProperties?: readonly number[];
  readonly targetMortgagedProperties?: readonly number[];
  readonly myBalance: number;
  readonly targetPlayerName?: string;
  readonly targetBalance?: number;
  readonly availablePartners?: ReadonlyArray<TradePartnerInfo>;
  readonly onSelectPartner?: (partnerId: string) => void;
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
  myBalance, targetPlayerName, targetBalance,
  availablePartners = [], onSelectPartner,
  initialOffered = [], initialRequested = [],
  initialCashOffer = 0, initialCashRequest = 0, onSubmitTrade, onClose,
}: TradeModalProps): React.ReactElement {
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(targetPlayerId);
  const [offered, setOffered] = useState<number[]>([...initialOffered]);
  const [requested, setRequested] = useState<number[]>([...initialRequested]);
  const [cashOffer, setCashOffer] = useState<number>(initialCashOffer);
  const [cashRequest, setCashRequest] = useState<number>(initialCashRequest);

  const currentPartner = availablePartners.find((p) => p.id === selectedPartnerId);
  const effectiveTargetBalance = currentPartner?.balance ?? targetBalance ?? 0;
  const effectiveTargetName = currentPartner?.name ?? targetPlayerName ?? selectedPartnerId;

  const toggleProperty = (cellId: number, isMine: boolean) => {
    const setter = isMine ? setOffered : setRequested;
    setter((prev) => (prev.includes(cellId) ? prev.filter((id) => id !== cellId) : [...prev, cellId]));
  };

  const cashDiff = Math.max(cashOffer, cashRequest);
  const taxAmount = calculateTradeTax(cashDiff);
  const netReceived = Math.max(0, cashRequest - taxAmount);

  const baseValid = validateTradeOffer({
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

  // Kiểm tra đối tác có đủ tiền mặt đáp ứng yêu cầu không
  const partnerCanAfford = cashRequest <= effectiveTargetBalance;
  const isValid = baseValid && partnerCanAfford;

  const handleSubmit = () => {
    if (!isValid || !onSubmitTrade) return;
    onSubmitTrade({
      targetPlayerId: selectedPartnerId,
      offeredProperties: offered,
      requestedProperties: requested,
      cashOffer,
      cashRequest,
    });
  };

  // Tính giá niêm yết của các BĐS được đề xuất để hiển thị gợi ý giá nhanh
  const offeredBaseCost = offered.reduce((sum, id) => {
    const deed = getDeedDisplayInfo(id);
    return sum + (deed?.price ?? 1000);
  }, 0);

  const price70 = Math.round(offeredBaseCost * 0.7);
  const price100 = offeredBaseCost;
  const price120 = Math.round(offeredBaseCost * 1.2);

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
      ? 'bg-blue-50/80 border-2 border-blue-300 shadow-sm text-slate-900'
      : 'bg-amber-50/80 border-2 border-amber-300 shadow-sm text-slate-900';

    return (
      <div className={`p-3 rounded-xl flex flex-col space-y-2.5 ${matClass}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
            {title}
          </h3>
          {!isMine && (
            <span className="text-[11px] text-slate-600 font-medium">
              Tiền mặt đối tác: <strong className="font-mono text-slate-900 font-bold">{formatCurrency(effectiveTargetBalance)}</strong>
            </span>
          )}
        </div>

        <div className="flex-1 max-h-44 overflow-y-auto space-y-1.5 pr-1">
          {props.length === 0 ? (
            <p className="text-[11px] text-slate-500 italic py-2">Không có BĐS</p>
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
                      ? 'opacity-50 cursor-not-allowed bg-slate-200 border-slate-300 text-slate-400'
                      : checked
                      ? 'bg-amber-100 text-slate-900 border-2 border-amber-500 font-bold shadow-sm'
                      : 'bg-white text-slate-900 border border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className="w-full h-1.5"
                    style={{ backgroundColor: color }}
                  />
                  <div className="p-1.5 flex items-center justify-between gap-1">
                    <span className="truncate flex-1 font-semibold">{deed?.name ?? `Ô #${id}`}</span>
                    <span className="text-[10px] text-slate-500 font-mono font-medium">{deed ? formatCurrency(deed.price) : ''}</span>
                    {checked && <span className="text-amber-800 font-black ml-1">✓</span>}
                    {isMort && <span className="text-[9px] text-rose-600 font-medium ml-1">Thế chấp</span>}
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div>
          <label className="text-[10px] text-slate-700 block mb-1 font-semibold">
            {isMine ? `Bù tiền mặt (Tối đa ${formatCurrency(myBalance)})` : 'Yêu cầu đối tác trả tiền:'}
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
              className="min-h-[38px] px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-900 font-mono text-[11px] font-black rounded-lg border-2 border-slate-400 shadow-[0_2px_0_0_#94a3b8] active:shadow-none active:translate-y-[2px] transition-all cursor-pointer inline-flex items-center justify-center"
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
              className="min-h-[38px] px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-900 font-mono text-[11px] font-black rounded-lg border-2 border-slate-400 shadow-[0_2px_0_0_#94a3b8] active:shadow-none active:translate-y-[2px] transition-all cursor-pointer inline-flex items-center justify-center"
            >
              +500
            </button>
          </div>

          {/* Gợi ý giá nhanh theo tỷ lệ sàn & gốc khi bán BĐS */}
          {!isMine && offered.length > 0 && (
            <div className="mt-1.5 pt-1.5 border-t border-amber-200/60 flex items-center gap-1 flex-wrap text-[10px]">
              <span className="text-slate-500 font-medium">Gợi ý giá:</span>
              <button
                type="button"
                onClick={() => onCash(price70)}
                className="px-1.5 py-0.5 bg-white hover:bg-amber-100 border border-amber-300 rounded text-amber-900 font-bold cursor-pointer"
              >
                70% Sàn ({price70} Tr.)
              </button>
              <button
                type="button"
                onClick={() => onCash(price100)}
                className="px-1.5 py-0.5 bg-white hover:bg-amber-100 border border-amber-300 rounded text-amber-900 font-bold cursor-pointer"
              >
                100% Gốc ({price100} Tr.)
              </button>
              <button
                type="button"
                onClick={() => onCash(price120)}
                className="px-1.5 py-0.5 bg-white hover:bg-amber-100 border border-amber-300 rounded text-amber-900 font-bold cursor-pointer"
              >
                120% ({price120} Tr.)
              </button>
            </div>
          )}

          {!isMine && !partnerCanAfford && (
            <p className="text-[10px] text-rose-600 font-bold mt-1">
              Đối tác không đủ tiền mặt (hiện chỉ có {formatCurrency(effectiveTargetBalance)})
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-md lg:max-w-lg max-h-[90vh] overflow-y-auto bg-[#FFFDF8] border-2 border-slate-900 rounded-2xl shadow-[0_6px_0_0_#0f172a] flex flex-col pointer-events-auto text-slate-900 select-none" data-testid="trade-modal">
      {/* Header */}
      <header className="p-3.5 bg-[#F7F2E7] border-b border-slate-300 flex items-center justify-between sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">🤝</span>
          <div>
            <h2 className="text-sm font-black uppercase text-slate-900 tracking-wide">
              Đàm Phán Thương Lượng P2P
            </h2>
            <p className="text-[11px] text-slate-600 font-medium">
              Chuyển nhượng quyền sở hữu &amp; tiền mặt trực tiếp
            </p>
          </div>
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

      {/* Tabs chọn Đối Tác */}
      {availablePartners.length > 0 && (
        <div className="px-4 pt-3 pb-1 border-b border-slate-200 bg-[#FAF6EE] flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] text-slate-600 font-bold shrink-0">Chọn đối tác:</span>
          {availablePartners.map((partner) => {
            const isSelected = partner.id === selectedPartnerId;
            return (
              <button
                key={partner.id}
                type="button"
                onClick={() => {
                  setSelectedPartnerId(partner.id);
                  onSelectPartner?.(partner.id);
                  setRequested([]);
                  setCashRequest(0);
                }}
                className={`partner-selector-tab min-h-[44px] px-3.5 py-2 rounded-xl border-2 text-xs transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-amber-500 text-amber-950 border-amber-700 shadow-[0_3px_0_0_#b45309] active:shadow-[0_1px_0_0_#b45309] active:translate-y-[2px] font-black'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 shadow-sm active:translate-y-[1px]'
                }`}
              >
                <span>{partner.isBot ? '🤖' : '👤'}</span>
                <span>{partner.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/10">
                  {formatCurrency(partner.balance)}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Hai cột giao dịch */}
      <div className="p-4 grid grid-cols-2 gap-3 text-xs">
        {renderCol('Tài Sản Bạn Đề Xuất', true, myProperties, myMortgagedProperties, offered, cashOffer, (v) => { setCashOffer(v); if (v > 0) setCashRequest(0); }, myBalance)}
        {renderCol(`Tài Sản Của ${effectiveTargetName}`, false, targetProperties, targetMortgagedProperties, requested, cashRequest, (v) => { setCashRequest(v); if (v > 0) setCashOffer(0); })}
      </div>

      {/* Tóm tắt thỏa thuận & Thuế kho bạc */}
      <div className="px-4 pb-2">
        <div className="p-2.5 bg-[#F7F2E7] border border-slate-300 rounded-xl flex flex-col gap-1 text-[11px] text-slate-800">
          <div className="flex justify-between items-center">
            <span className="font-medium">Thuế nộp Kho Bạc (5%):</span>
            <span className="font-bold text-amber-800">{formatCurrency(taxAmount)}</span>
          </div>
          {cashRequest > 0 && (
            <div className="flex justify-between items-center pt-1 border-t border-slate-300/60 font-bold">
              <span>Thực nhận:</span>
              <span className="text-emerald-700 font-black">{formatCurrency(netReceived)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
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
