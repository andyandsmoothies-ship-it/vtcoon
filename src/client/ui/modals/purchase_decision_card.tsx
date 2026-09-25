import React from 'react';
import { useGameStore } from '../../store/game_store';
import { formatCurrency } from '../ui_helpers';
import { PROPERTY_DEEDS } from '../../../domain/property_data';
import {
  resolvePurchaseDecisionInsight,
  resolveCashBufferSafety,
  type PurchaseDecisionPlayer,
} from './purchase_decision_logic';

export interface PurchaseDecisionCardProps {
  readonly cellIndex: number;
  readonly deedPrice?: number;
  readonly buyerBalance?: number;
  readonly buyerId?: string;
  readonly allPlayers?: Record<string, PurchaseDecisionPlayer>;
}

const TONE_CLASSES = {
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  amber: 'bg-amber-100 text-amber-800 border-amber-300',
  rose: 'bg-rose-100 text-rose-800 border-rose-300',
};

export function PurchaseDecisionCard({
  cellIndex, deedPrice, buyerBalance, buyerId, allPlayers,
}: PurchaseDecisionCardProps): React.ReactElement {
  const isSSR = typeof window === 'undefined';
  const storePlayers = useGameStore((s) => s.playersInfo);
  const storeBuyerId = useGameStore((s) => s.currentTurnPlayerId ?? '');
  const effectivePlayers = allPlayers ?? (isSSR ? useGameStore.getState().playersInfo : storePlayers) ?? {};
  const effectiveBuyerId = buyerId ?? storeBuyerId;
  const effectiveBalance = buyerBalance ?? effectivePlayers[effectiveBuyerId]?.balance ?? 0;
  const price = deedPrice ?? PROPERTY_DEEDS.get(cellIndex)?.price ?? 0;

  const insight = resolvePurchaseDecisionInsight({ cellIndex, buyerId: effectiveBuyerId, buyerBalance: effectiveBalance, allPlayers: effectivePlayers });
  const cashBuffer = deedPrice !== undefined ? resolveCashBufferSafety({ buyerBalance: effectiveBalance, deedPrice: price }) : insight.cashBuffer;
  const { radar } = insight;

  return (
    <div className="bg-[#F8F5ED] border border-amber-900/15 rounded-xl p-2.5 space-y-2 select-none text-xs text-slate-800" data-testid="purchase-decision-card">
      {/* Khối 1: Radar nhóm & Tiến độ độc quyền */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-1 text-[11px]">
          <span className="font-bold text-slate-700 flex items-center gap-1">
            <span>🧭</span>
            <span>{radar.isRailroad ? 'Hạ Tầng' : radar.isUtility ? 'Tiện Ích' : 'Bộ Màu Quy Hoạch'} ({radar.ownedCount}/{radar.totalCells})</span>
          </span>
          <span className="px-2 py-0.5 rounded-full font-black text-[10px] bg-white border border-slate-300 shadow-sm text-slate-800" data-testid="radar-strategy-badge">
            {radar.badge}
          </span>
        </div>
        <div className="flex flex-wrap gap-1" data-testid="radar-group-chips">
          {radar.groupCells.map((c) => (
            <span
              key={c.cellIndex}
              className={`px-1.5 py-0.5 rounded text-[10px] border flex items-center gap-1 ${
                c.isTarget
                  ? 'border-amber-600 bg-amber-100 font-bold text-amber-900 ring-1 ring-amber-500/50'
                  : c.isMine
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium'
                    : c.isOpponent
                      ? 'border-rose-300 bg-rose-50 text-rose-800 font-medium'
                      : 'border-slate-300 bg-white text-slate-500 border-dashed'
              }`}
              title={c.ownerName ? `Sở hữu: ${c.ownerName}` : c.isTarget ? 'Ô mục tiêu' : 'Chưa có chủ'}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: c.ownerColor ?? (c.isTarget ? '#D97706' : '#94A3B8') }} />
              <span className="truncate max-w-[80px]">{c.name}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Khối 2: Đệm tiền mặt & An toàn thanh khoản */}
      <div className="pt-2 border-t border-amber-900/10 space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-600 font-medium">Thanh khoản sau mua:</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${TONE_CLASSES[cashBuffer.tone]}`} data-testid="cash-buffer-badge">
            {cashBuffer.tone === 'emerald' ? '🟢' : cashBuffer.tone === 'amber' ? '🟡' : '🔴'} {cashBuffer.label}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs font-mono font-bold">
          <span className="text-slate-500">{formatCurrency(effectiveBalance)}</span>
          <span className="text-slate-400">➔</span>
          <span className={cashBuffer.tone === 'rose' ? 'text-rose-700' : 'text-slate-900'}>{formatCurrency(cashBuffer.balanceAfterBuy)}</span>
        </div>
        <p className="text-[10px] text-slate-500 italic leading-tight">{cashBuffer.description}</p>
        <div className="flex items-center justify-between text-[10px] text-amber-900/80 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-600/20">
          <span>🛡️ Phao thế chấp 50%:</span>
          <span className="font-bold font-mono">+{formatCurrency(cashBuffer.mortgageValue)}</span>
        </div>
      </div>
    </div>
  );
}
