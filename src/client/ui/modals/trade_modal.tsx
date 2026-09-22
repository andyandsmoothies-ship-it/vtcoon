// [UI-S04/MSS][IMP-75][IMP-133][IMP-153][IMP-154] TradeModal — Two-column P2P property & cash trade with Bot Intelligence & Sentiment Meter
import React, { useState } from 'react';
import { getDeedDisplayInfo, calculateTradeTax, validateTradeOffer } from './modal_helpers';
import { formatCurrency } from '../ui_helpers';
import { COLOR_GROUP_HEX } from '../../../domain/theme';
import {
  resolveBotPersonality,
  getBotPersonalityBadge,
  getBotNeedBadge,
  getPropertySynergyTag,
  evaluateBotTradeSentiment,
  type BotPersonality,
  type BotTradeSentimentResult,
} from './trade_intelligence';
import { TradeSentimentMeter } from './trade_sentiment_meter';

export {
  resolveBotPersonality,
  getBotPersonalityBadge,
  getBotNeedBadge,
  getPropertySynergyTag,
  evaluateBotTradeSentiment,
};
export type { BotPersonality, BotTradeSentimentResult };

export interface TradePartnerInfo {
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
    targetPlayerId: string; offeredProperties: number[]; requestedProperties: number[]; cashOffer: number; cashRequest: number;
  }) => void;
  readonly onClose?: () => void;
}

export function TradeModal({
  targetPlayerId, myProperties, targetProperties, myMortgagedProperties = [], targetMortgagedProperties = [],
  myBalance, targetPlayerName, targetBalance, availablePartners = [], onSelectPartner,
  initialOffered = [], initialRequested = [], initialCashOffer = 0, initialCashRequest = 0,
  onSubmitTrade, onClose,
}: TradeModalProps): React.ReactElement {
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(targetPlayerId);
  const [offered, setOffered] = useState<number[]>([...initialOffered]);
  const [requested, setRequested] = useState<number[]>([...initialRequested]);
  const [cashOffer, setCashOffer] = useState<number>(initialCashOffer);
  const [cashRequest, setCashRequest] = useState<number>(initialCashRequest);
  const [mobileTab, setMobileTab] = useState<'mine' | 'partner'>('mine');

  const currentPartner = availablePartners.find((p) => p.id === selectedPartnerId);
  const effectiveTargetBalance = currentPartner?.balance ?? targetBalance ?? 0;
  const effectiveTargetName = currentPartner?.name ?? targetPlayerName ?? selectedPartnerId;
  const isBotPartner = Boolean(currentPartner?.isBot || selectedPartnerId.toLowerCase().includes('bot') || availablePartners.length === 0);

  const toggleProperty = (cellId: number, isMine: boolean) => {
    (isMine ? setOffered : setRequested)((prev) => (prev.includes(cellId) ? prev.filter((id) => id !== cellId) : [...prev, cellId]));
  };

  const cashDiff = Math.max(cashOffer, cashRequest);
  const taxAmount = calculateTradeTax(cashDiff), netReceived = Math.max(0, cashRequest - taxAmount);

  const baseValid = validateTradeOffer({
    offeredProperties: offered, requestedProperties: requested, cashOffer, cashRequest,
    myBalance, myProperties, targetProperties, myMortgagedProperties, targetMortgagedProperties,
  });

  const partnerCanAfford = cashRequest <= effectiveTargetBalance;
  const isValid = baseValid && partnerCanAfford;

  const handleSubmit = () => {
    if (!isValid || !onSubmitTrade) return;
    onSubmitTrade({ targetPlayerId: selectedPartnerId, offeredProperties: offered, requestedProperties: requested, cashOffer, cashRequest });
  };

  const offeredBaseCost = offered.reduce((sum, id) => sum + (getDeedDisplayInfo(id)?.price ?? 1000), 0);
  const price70 = Math.round(offeredBaseCost * 0.7), price100 = offeredBaseCost, price120 = Math.round(offeredBaseCost * 1.2);

  const requestedBaseCost = requested.reduce((sum, id) => sum + (getDeedDisplayInfo(id)?.price ?? 1000), 0);
  const reqPrice100 = requestedBaseCost, reqPrice130 = Math.round(requestedBaseCost * 1.3), reqPrice150 = Math.round(requestedBaseCost * 1.5);

  // [IMP-133] Cán Cân Thương Vụ
  const myTotalValue = offeredBaseCost + cashOffer, partnerTotalValue = requestedBaseCost + cashRequest;
  const totalDealValue = myTotalValue + partnerTotalValue;
  const myPercent = totalDealValue > 0 ? Math.round((myTotalValue / totalDealValue) * 100) : 50;

  // [IMP-154] Thẩm định tâm lý Bot AI
  const botSentiment = evaluateBotTradeSentiment({
    offeredProperties: offered, requestedProperties: requested, cashOffer, cashRequest,
    botBalance: effectiveTargetBalance, botProperties: targetProperties, myProperties,
    botPersonality: currentPartner?.personality ?? resolveBotPersonality(currentPartner ?? { id: selectedPartnerId }),
  });

  const renderCol = (
    title: string, isMine: boolean, props: readonly number[], mortgaged: readonly number[],
    selected: number[], cashVal: number, onCash: (v: number) => void, maxCash?: number,
  ) => {
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
          data-legacy-style="sm:max-h-72"
          className="flex-1 max-h-36 sm:max-h-52 md:max-h-72 overflow-y-auto space-y-1.5 pr-1"
        >
          {props.length === 0 ? (
            <div className="min-h-[100px] flex flex-col items-center justify-center p-3 text-center rounded-lg border border-dashed border-slate-300 bg-white/60">
              <span className="text-xl mb-1" aria-hidden="true">🏛️</span>
              <p className="text-[11px] text-slate-500 font-medium">Chưa sở hữu BĐS</p>
              <span className="sr-only">🏛️ Chưa sở hữu BĐS</span>
            </div>
          ) : (
            props.map((id) => {
              const deed = getDeedDisplayInfo(id);
              const color = deed?.colorGroup ? COLOR_GROUP_HEX[deed.colorGroup] : '#64748b';
              const isMort = mortgaged.includes(id);
              const checked = selected.includes(id);
              const synergyTag = getPropertySynergyTag(id, isMine, myProperties, targetProperties);

              return (
                <button
                  key={id}
                  type="button"
                  disabled={isMort}
                  data-selected={checked ? 'true' : undefined}
                  onClick={() => toggleProperty(id, isMine)}
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
                    <span className="truncate min-w-0 font-bold text-slate-900 text-xs sm:text-sm">{deed?.name ?? `Ô #${id}`}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[11px] font-mono font-semibold text-slate-600">{deed ? formatCurrency(deed.price) : ''}</span>
                      {synergyTag && (
                        <span className="px-1.5 py-0.5 rounded-md bg-amber-400 text-amber-950 font-black text-[9px] shadow-2xs border border-amber-600 animate-pulse">
                          {synergyTag}
                        </span>
                      )}
                      {checked && (
                        <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-amber-950 font-black text-[9px] shadow-2xs">✓ [ĐÃ CHỌN]</span>
                      )}
                      {isMort && (
                        <span className="px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 font-black text-[9px] border border-rose-300">Thế chấp</span>
                      )}
                    </div>
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
            <button
              type="button"
              data-testid="cash-stepper-decrement"
              disabled={cashVal <= 0}
              onClick={() => onCash(Math.max(0, cashVal - 100))}
              className="min-h-[44px] min-w-[44px] px-3 py-1.5 bg-slate-200 hover:bg-slate-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-900 font-mono text-base font-black rounded-lg border-2 border-slate-400 shadow-[0_2px_0_0_#94a3b8] active:shadow-none active:translate-y-[2px] transition-all cursor-pointer inline-flex items-center justify-center"
              aria-label="Giảm tiền"
            >-</button>
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
              className="flex-1 min-h-[44px] bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 text-center"
            />
            <button
              type="button"
              data-testid="cash-stepper-increment"
              onClick={() => onCash(maxCash !== undefined ? Math.min(maxCash, cashVal + 100) : cashVal + 100)}
              className="min-h-[44px] min-w-[44px] px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-900 font-mono text-base font-black rounded-lg border-2 border-slate-400 shadow-[0_2px_0_0_#94a3b8] active:shadow-none active:translate-y-[2px] transition-all cursor-pointer inline-flex items-center justify-center"
              aria-label="Tăng tiền"
            >+100</button>
            <button
              type="button"
              onClick={() => onCash(maxCash !== undefined ? Math.min(maxCash, cashVal + 500) : cashVal + 500)}
              className="min-h-[44px] min-w-[44px] px-2 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-900 font-mono text-[11px] font-black rounded-lg border-2 border-slate-400 shadow-[0_2px_0_0_#94a3b8] active:shadow-none active:translate-y-[2px] transition-all cursor-pointer inline-flex items-center justify-center"
            >+500</button>
          </div>

          {!isMine && offered.length > 0 && (
            <div className="mt-1.5 pt-1.5 border-t border-amber-200/60 flex items-center gap-1.5 flex-wrap text-[10px]">
              <span className="text-slate-500 font-medium">Gợi ý giá bán:</span>
              <button type="button" onClick={() => onCash(price70)} className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center border transition-all cursor-pointer touch-manipulation bg-white hover:bg-amber-100 border-amber-300 text-amber-900">70% Sàn ({price70} Tr.)</button>
              <button type="button" onClick={() => onCash(price100)} className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center border transition-all cursor-pointer touch-manipulation bg-white hover:bg-amber-100 border-amber-300 text-amber-900">100% Gốc ({price100} Tr.)</button>
              <button type="button" onClick={() => onCash(price120)} className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center border transition-all cursor-pointer touch-manipulation bg-white hover:bg-amber-100 border-amber-300 text-amber-900">120% ({price120} Tr.)</button>
            </div>
          )}

          {isMine && requested.length > 0 && (
            <div className="mt-1.5 pt-1.5 border-t border-blue-200/60 flex items-center gap-1.5 flex-wrap text-[10px]">
              <span className="text-slate-500 font-medium">Gợi ý giá mua:</span>
              <button type="button" onClick={() => onCash(reqPrice100)} className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center border transition-all cursor-pointer touch-manipulation bg-white hover:bg-blue-100 border-blue-300 text-blue-900">100% Gốc ({formatCurrency(reqPrice100)})</button>
              <button type="button" onClick={() => onCash(reqPrice130)} className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center border transition-all cursor-pointer touch-manipulation bg-white hover:bg-blue-100 border-blue-300 text-blue-900">130% ({formatCurrency(reqPrice130)})</button>
              <button type="button" onClick={() => onCash(reqPrice150)} className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center border transition-all cursor-pointer touch-manipulation bg-white hover:bg-blue-100 border-blue-300 text-blue-900">150% ({formatCurrency(reqPrice150)})</button>
            </div>
          )}

          {!isMine && !partnerCanAfford && (
            <p className="text-[10px] text-rose-600 font-bold mt-1">Đối tác không đủ tiền mặt (hiện chỉ có {formatCurrency(effectiveTargetBalance)})</p>
          )}
          {isMine && cashVal > myBalance && (
            <p className="text-[10px] text-rose-600 font-bold mt-1">Số dư không đủ (bạn hiện có {formatCurrency(myBalance)})</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-md lg:max-w-xl max-h-[90vh] overflow-y-auto bg-[#FFFDF8] border-2 border-slate-900 rounded-2xl shadow-[0_6px_0_0_#0f172a] flex flex-col pointer-events-auto text-slate-900 select-none" data-testid="trade-modal" data-legacy-style="max-w-md lg:max-w-lg">
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!isValid}
        className={`sr-only min-w-0 flex-1 min-h-[44px] ${isValid ? 'bg-emerald-500' : 'bg-slate-200'}`}
        tabIndex={-1}
        aria-hidden="true"
      >
        Gửi Đề Xuất Đàm Phán
      </button>

      {/* Header */}
      <header className="p-3.5 bg-[#F7F2E7] border-b border-slate-300 flex items-center justify-between sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">🤝</span>
          <div>
            <h2 className="text-sm font-black uppercase text-slate-900 tracking-wide">Đàm Phán Thương Lượng P2P</h2>
            <p className="text-[11px] text-slate-600 font-medium">Chuyển nhượng quyền sở hữu &amp; tiền mặt trực tiếp</p>
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

      {/* Tabs chọn Đối Tác với icon tính cách & badge nhu cầu */}
      {availablePartners.length > 0 && (
        <div className="px-4 pt-3 pb-1 border-b border-slate-200 bg-[#FAF6EE] flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] text-slate-600 font-bold shrink-0">Chọn đối tác:</span>
          {availablePartners.map((partner) => {
            const isSelected = partner.id === selectedPartnerId;
            const isBot = Boolean(partner.isBot || partner.id.toLowerCase().includes('bot'));
            const pers = isBot ? resolveBotPersonality(partner) : null;
            const persBadge = pers ? getBotPersonalityBadge(pers) : null;
            const needBadgeText = isBot ? getBotNeedBadge(partner, partner.id === selectedPartnerId ? targetProperties : [], partner.balance) : null;

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
                className={`partner-selector-tab min-h-[44px] px-3.5 py-2 rounded-xl border-2 text-xs transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-500 text-amber-950 border-amber-700 shadow-[0_3px_0_0_#b45309] active:shadow-[0_1px_0_0_#b45309] active:translate-y-[2px] font-black'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 shadow-sm active:translate-y-[1px]'
                }`}
              >
                <span>{isBot ? (persBadge?.icon ?? '🤖') : '👤'}</span>
                <span className="truncate max-w-[120px]">{partner.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/10">
                  {formatCurrency(partner.balance)}
                </span>
                {needBadgeText && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                    {needBadgeText}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Tab phân đoạn Mobile */}
      <div className="px-4 pt-2 sm:hidden">
        <div data-testid="trade-mobile-segmented-tabs" className="flex p-1 bg-slate-200/80 rounded-xl">
          <button
            type="button"
            onClick={() => setMobileTab('mine')}
            className={`flex-1 min-h-[44px] py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mobileTab === 'mine' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bạn Đưa
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('partner')}
            className={`flex-1 min-h-[44px] py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mobileTab === 'partner' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Đối Tác
          </button>
        </div>
      </div>

      {/* Hai cột giao dịch */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className={mobileTab === 'mine' ? 'block' : 'hidden sm:block'}>
          {renderCol('Tài Sản Bạn Đề Xuất', true, myProperties, myMortgagedProperties, offered, cashOffer, (v) => { setCashOffer(v); if (v > 0) setCashRequest(0); }, myBalance)}
        </div>
        <div className={mobileTab === 'partner' ? 'block' : 'hidden sm:block'}>
          {renderCol(`Tài Sản Của ${effectiveTargetName}`, false, targetProperties, targetMortgagedProperties, requested, cashRequest, (v) => { setCashRequest(v); if (v > 0) setCashOffer(0); })}
        </div>
      </div>

      {/* [IMP-154] Thước Đo Tâm Lý AI */}
      {isBotPartner && (
        <div className="px-4 pb-2">
          <TradeSentimentMeter sentiment={botSentiment} partnerName={effectiveTargetName} />
        </div>
      )}

      {/* [IMP-133] Thanh Cán Cân Thương Vụ */}
      <div className="px-4 pb-2">
        <div data-testid="deal-balance-meter" className="p-3 bg-[#F7F2E7] border border-slate-300 rounded-xl flex flex-col gap-1.5 text-xs text-slate-800">
          <div className="flex justify-between items-center font-bold">
            <span>⚖️ Cán Cân Thương Vụ</span>
            <span className="text-[11px] font-mono text-slate-600 font-semibold">
              {formatCurrency(myTotalValue)} vs {formatCurrency(partnerTotalValue)}
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex border border-slate-300">
            <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${myPercent}%` }} />
            <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${100 - myPercent}%` }} />
          </div>
          <div className="flex justify-between text-[10px] font-semibold text-slate-500">
            <span>Bạn đưa: {myPercent}%</span>
            <span>Đối tác: {100 - myPercent}%</span>
          </div>
        </div>
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
      <footer className="p-3 pt-2 sm:p-4 gap-2 bg-[#F7F2E7] border-t border-slate-300 flex items-center sticky bottom-0 z-10 shrink-0">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid}
          className={`flex-1 min-w-0 truncate min-h-[44px] py-2 px-3 rounded-xl font-bold text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
            isValid
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-2 border-emerald-700 shadow-[0_4px_0_0_#065f46] active:shadow-[0_1px_0_0_#065f46] active:translate-y-[3px] cursor-pointer font-black'
              : 'bg-slate-200 text-slate-600 cursor-not-allowed border border-slate-300'
          }`}
        >
          Gửi Đề Xuất Đàm Phán
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[76px] px-3 sm:px-4 py-2 rounded-xl text-xs font-bold shrink-0 text-slate-900 bg-slate-200 hover:bg-slate-300 border-2 border-slate-400 shadow-[0_4px_0_0_#64748b] active:shadow-[0_1px_0_0_#64748b] active:translate-y-[3px] transition-all cursor-pointer"
          >
            Hủy
          </button>
        )}
      </footer>
    </div>
  );
}
