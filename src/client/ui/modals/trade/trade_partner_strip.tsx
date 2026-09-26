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

  return (
    <div className="px-4 py-2 border-b border-slate-200 bg-[#FAF6EE] flex items-center gap-2">
      <span className="text-xs text-slate-700 font-bold shrink-0">Đối tác:</span>
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex-1 min-w-0">
        {availablePartners.map((partner) => {
          const isSelected = partner.id === selectedPartnerId;
          const isBot = Boolean(partner.isBot || partner.id.toLowerCase().includes('bot'));
          const pers = isBot ? resolveBotPersonality(partner) : null;
          const persBadge = pers ? getBotPersonalityBadge(pers) : null;
          const needBadgeText = isBot
            ? getBotNeedBadge(partner, isSelected ? targetProperties : [], partner.balance)
            : null;

          return (
            <button
              key={partner.id}
              type="button"
              onClick={() => onSelectPartner(partner.id)}
              className={`partner-selector-tab min-h-[44px] px-3.5 py-2 rounded-xl border-2 text-xs transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-amber-500 text-amber-950 border-amber-700 shadow-[0_3px_0_0_#b45309] active:shadow-[0_1px_0_0_#b45309] active:translate-y-[2px] font-black'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 shadow-sm active:translate-y-[1px]'
              }`}
            >
              <span>{isBot ? (persBadge?.icon ?? '🤖') : '👤'}</span>
              <span className="truncate max-w-[120px] font-bold">{partner.name}</span>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-black/10 font-bold">
                {formatCurrency(partner.balance)}
              </span>
              {needBadgeText && (
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold truncate max-w-[90px]">
                  {needBadgeText}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
