// [UI-S04/MSS][IMP-200] TradePartnerStrip — Dải chọn đối tác thương lượng P2P
import React from 'react';
import { formatCurrency } from '../../ui_helpers';
import {
  resolveBotPersonality,
  getBotPersonalityBadge,
  getBotNeedBadge,
} from '../trade_intelligence';

export interface TradePartnerInfo {
  readonly id: string;
  readonly name: string;
  readonly balance: number;
  readonly isBot?: boolean;
  readonly avatar?: string;
  readonly personality?: string;
  readonly properties?: readonly number[];
}

export function getPartnerGridColsClass(count: number): string {
  if (count <= 1) return 'grid-cols-1';
  if (count === 2) return 'grid-cols-2';
  if (count === 3) return 'grid-cols-3';
  return 'grid-cols-4';
}

export interface TradePartnerStripProps {
  readonly availablePartners: ReadonlyArray<TradePartnerInfo>;
  readonly selectedPartnerId: string;
  readonly onSelectPartner: (partnerId: string) => void;
  readonly targetProperties?: readonly number[];
}

export function TradePartnerStrip({
  availablePartners,
  selectedPartnerId,
  onSelectPartner,
  targetProperties = [],
}: TradePartnerStripProps): React.ReactElement | null {
  if (availablePartners.length === 0) return null;

  const selectedPartner = availablePartners.find((p) => p.id === selectedPartnerId);
  const selectedIsBot = Boolean(selectedPartner?.isBot || selectedPartner?.id.toLowerCase().includes('bot'));
  const selectedPers = selectedIsBot && selectedPartner ? resolveBotPersonality(selectedPartner) : null;
  const selectedPersBadge = selectedPers ? getBotPersonalityBadge(selectedPers) : null;
  const selectedNeedBadge = selectedIsBot && selectedPartner
    ? getBotNeedBadge(
        selectedPartner,
        selectedPartner.properties ?? targetProperties,
        selectedPartner.balance
      )
    : null;

  return (
    <div className="px-4 py-2 border-b border-slate-200 bg-[#FAF6EE] flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-700 font-bold shrink-0">Đối tác:</span>
        <div className={`grid ${getPartnerGridColsClass(availablePartners.length)} gap-1.5 flex-1 min-w-0`}>
          {availablePartners.map((partner) => {
            const isSelected = partner.id === selectedPartnerId;
            const isBot = Boolean(partner.isBot || partner.id.toLowerCase().includes('bot'));
            const pers = isBot ? resolveBotPersonality(partner) : null;
            const persBadge = pers ? getBotPersonalityBadge(pers) : null;
            const needBadgeText = isBot
              ? getBotNeedBadge(partner, isSelected ? (partner.properties ?? targetProperties) : (partner.properties ?? []), partner.balance)
              : null;

            return (
              <button
                key={partner.id}
                type="button"
                onClick={() => onSelectPartner(partner.id)}
                className={`partner-selector-tab min-h-[44px] px-2 py-2 rounded-xl border-2 text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  isSelected
                    ? 'bg-amber-500 text-amber-950 border-amber-700 shadow-[0_3px_0_0_#b45309] active:shadow-[0_1px_0_0_#b45309] active:translate-y-[2px] font-black'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 shadow-sm active:translate-y-[1px]'
                }`}
              >
                <span>{isBot ? (persBadge?.icon ?? '🤖') : '👤'}</span>
                <span className="truncate max-w-[120px] sm:max-w-[180px] md:max-w-none font-bold">{partner.name}</span>
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-black/10 font-bold shrink-0">
                  {formatCurrency(partner.balance)}
                </span>
                {needBadgeText && (
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold truncate max-w-[90px] md:max-w-none hidden sm:inline-block">
                    {needBadgeText}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedIsBot && selectedPartner && (
        <div
          data-testid="partner-sub-banner"
          className="flex items-center gap-2 px-3 py-1.5 bg-amber-50/80 border border-amber-200 rounded-lg text-xs"
        >
          <span className="font-bold text-slate-700">Tâm lý đối tác:</span>
          {selectedPersBadge && (
            <span className={`px-2 py-0.5 rounded-full font-bold border ${selectedPersBadge.colorClass}`}>
              {selectedPersBadge.icon} {selectedPersBadge.label}
            </span>
          )}
          {selectedNeedBadge && (
            <span className="px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-300">
              {selectedNeedBadge}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
