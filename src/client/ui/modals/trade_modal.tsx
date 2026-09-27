// [UI-S04/MSS][IMP-75][IMP-133][IMP-153][IMP-154][IMP-200] TradeModal — Two-column P2P property & cash trade with Bot Intelligence & Sentiment Meter
import React, { useState } from 'react';
import { getDeedDisplayInfo, calculateTradeTax, validateTradeOffer } from './modal_helpers';
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
import { TradePartnerStrip, type TradePartnerInfo, type TradePartnerStripProps } from './trade/trade_partner_strip';
import { TradeColumn, type TradeColumnProps } from './trade/trade_column';
import { TradeDealHud, type TradeDealHudProps } from './trade/trade_deal_hud';
import { formatCurrency } from '../ui_helpers';
import { useGameStore } from '../../store/game_store';

function formatDealTabSummary(propertyCount: number, cash: number): string {
  if (propertyCount === 0 && cash === 0) return '';
  if (propertyCount > 0 && cash > 0) {
    return ` (${propertyCount} BĐS • ${formatCurrency(cash)})`;
  }
  if (propertyCount > 0) {
    return ` (${propertyCount} BĐS)`;
  }
  return ` (${formatCurrency(cash)} Tr.)`;
}

export {
  resolveBotPersonality,
  getBotPersonalityBadge,
  getBotNeedBadge,
  getPropertySynergyTag,
  evaluateBotTradeSentiment,
  TradeSentimentMeter,
  TradePartnerStrip,
  TradeColumn,
  TradeDealHud,
};
export type {
  BotPersonality,
  BotTradeSentimentResult,
  TradePartnerInfo,
  TradePartnerStripProps,
  TradeColumnProps,
  TradeDealHudProps,
};

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
  const levelMap = useGameStore((s) => s.levelMap);

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
    myBalance, myProperties, targetProperties,
  });

  const partnerCanAfford = cashRequest <= effectiveTargetBalance;
  const isValid = baseValid && partnerCanAfford;

  const handleSubmit = () => {
    if (!isValid || !onSubmitTrade) return;
    onSubmitTrade({ targetPlayerId: selectedPartnerId, offeredProperties: offered, requestedProperties: requested, cashOffer, cashRequest });
  };

  const getNetPropertyValue = (cellId: number, isMine: boolean): number => {
    const deedPrice = getDeedDisplayInfo(cellId)?.price ?? 1000;
    const isMort = isMine
      ? myMortgagedProperties.includes(cellId)
      : targetMortgagedProperties.includes(cellId);
    if (!isMort) return deedPrice;
    const loan = Math.floor(deedPrice * 0.5);
    return Math.max(0, deedPrice - loan);
  };

  const offeredBaseCost = offered.reduce((sum, id) => sum + getNetPropertyValue(id, true), 0);
  const price70 = Math.round(offeredBaseCost * 0.7), price100 = offeredBaseCost, price120 = Math.round(offeredBaseCost * 1.2);

  const requestedBaseCost = requested.reduce((sum, id) => sum + getNetPropertyValue(id, false), 0);
  const reqPrice100 = requestedBaseCost, reqPrice130 = Math.round(requestedBaseCost * 1.3), reqPrice150 = Math.round(requestedBaseCost * 1.5);

  const myTotalValue = offeredBaseCost + cashOffer, partnerTotalValue = requestedBaseCost + cashRequest;
  const totalDealValue = myTotalValue + partnerTotalValue;
  const myPercent = totalDealValue > 0 ? Math.round((myTotalValue / totalDealValue) * 100) : 50;

  const botSentiment = evaluateBotTradeSentiment({
    offeredProperties: offered, requestedProperties: requested, cashOffer, cashRequest,
    botBalance: effectiveTargetBalance, botProperties: targetProperties, myProperties,
    botPersonality: currentPartner?.personality ?? resolveBotPersonality(currentPartner ?? { id: selectedPartnerId }),
  });

  return (
    <div
      className="w-full max-w-md md:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto max-h-[90dvh] overflow-x-hidden bg-[#FFFDF8] border-2 border-slate-900 rounded-2xl shadow-[0_6px_0_0_#0f172a] flex flex-col pointer-events-auto text-slate-900 select-none"
      data-testid="trade-modal"
    >

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

      {/* Dải chọn đối tác */}
      <TradePartnerStrip
        availablePartners={availablePartners}
        selectedPartnerId={selectedPartnerId}
        onSelectPartner={(partnerId) => {
          setSelectedPartnerId(partnerId);
          onSelectPartner?.(partnerId);
          setRequested([]);
          setCashRequest(0);
        }}
        targetProperties={targetProperties}
      />

      {/* Tab phân đoạn Mobile */}
      <div className="px-4 pt-2 sm:hidden">
        <div data-testid="trade-mobile-segmented-tabs" className="flex p-1 bg-slate-200/80 rounded-xl">
          <button
            type="button"
            onClick={() => setMobileTab('mine')}
            className={`flex-1 min-h-[44px] px-3 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mobileTab === 'mine' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bạn Đưa{formatDealTabSummary(offered.length, cashOffer)}
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('partner')}
            className={`flex-1 min-h-[44px] px-3 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mobileTab === 'partner' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Đối Tác{formatDealTabSummary(requested.length, cashRequest)}
          </button>
        </div>
      </div>

      {/* Hai cột giao dịch */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className={mobileTab === 'mine' ? 'block' : 'hidden sm:block'}>
          <TradeColumn
            title="Tài Sản Bạn Đề Xuất"
            isMine={true}
            properties={myProperties}
            mortgagedProperties={myMortgagedProperties}
            selectedProperties={offered}
            onToggleProperty={(id) => toggleProperty(id, true)}
            cashVal={cashOffer}
            onCashChange={(v) => { setCashOffer(v); if (v > 0) setCashRequest(0); }}
            maxCash={myBalance}
            myBalance={myBalance}
            myProperties={myProperties}
            targetProperties={targetProperties}
            requestedCount={requested.length}
            reqPrice100={reqPrice100}
            reqPrice130={reqPrice130}
            reqPrice150={reqPrice150}
            levelMap={levelMap}
          />
        </div>
        <div className={mobileTab === 'partner' ? 'block' : 'hidden sm:block'}>
          <TradeColumn
            title={`Tài Sản Của ${effectiveTargetName}`}
            isMine={false}
            properties={targetProperties}
            mortgagedProperties={targetMortgagedProperties}
            selectedProperties={requested}
            onToggleProperty={(id) => toggleProperty(id, false)}
            cashVal={cashRequest}
            onCashChange={(v) => { setCashRequest(v); if (v > 0) setCashOffer(0); }}
            maxCash={effectiveTargetBalance}
            effectiveTargetBalance={effectiveTargetBalance}
            partnerCanAfford={partnerCanAfford}
            myProperties={myProperties}
            targetProperties={targetProperties}
            offeredCount={offered.length}
            price70={price70}
            price100={price100}
            price120={price120}
            levelMap={levelMap}
          />
        </div>
      </div>

      {/* Cán cân thương vụ, Tâm lý AI & Thuế */}
      <TradeDealHud
        isBotPartner={isBotPartner}
        botSentiment={botSentiment}
        effectiveTargetName={effectiveTargetName}
        myTotalValue={myTotalValue}
        partnerTotalValue={partnerTotalValue}
        myPercent={myPercent}
        taxAmount={taxAmount}
        netReceived={netReceived}
        cashRequest={cashRequest}
      />

      {/* Footer */}
      <footer className="p-3 sm:p-4 bg-[#F7F2E7] border-t border-slate-300 sticky bottom-0 z-10 shrink-0">
        <button
          type="button"
          data-testid="submit-trade-btn"
          onClick={handleSubmit}
          disabled={!isValid}
          className={`w-full min-h-[48px] py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
            isValid
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-emerald-800 shadow-[0_4px_0_0_#065f46] active:translate-y-[3px] cursor-pointer'
              : 'bg-slate-200 text-slate-400 border border-slate-300 shadow-none cursor-not-allowed'
          }`}
        >
          Gửi Đề Xuất Đàm Phán
        </button>
      </footer>
    </div>
  );
}
