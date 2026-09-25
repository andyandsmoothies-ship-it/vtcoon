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
  readonly levelMap?: Record<number, number>;
}

const TONE_CLASSES = {
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  amber: 'bg-amber-100 text-amber-800 border-amber-300',
  rose: 'bg-rose-100 text-rose-800 border-rose-300',
};

export function PurchaseDecisionCard({
  cellIndex, deedPrice, buyerBalance, buyerId, allPlayers, levelMap,
}: PurchaseDecisionCardProps): React.ReactElement {
  const isSSR = typeof window === 'undefined';
  const storePlayers = useGameStore((s) => s.playersInfo);
  const storeBuyerId = useGameStore((s) => s.currentTurnPlayerId ?? '');
  const storeLevels = useGameStore((s) => s.levelMap);
  const effectivePlayers = allPlayers ?? (isSSR ? useGameStore.getState().playersInfo : storePlayers) ?? {};
  const effectiveBuyerId = buyerId ?? storeBuyerId;
  const effectiveBalance = buyerBalance ?? effectivePlayers[effectiveBuyerId]?.balance ?? 0;
  const effectiveLevels = levelMap ?? (isSSR ? {} : storeLevels) ?? {};
  const price = deedPrice ?? PROPERTY_DEEDS.get(cellIndex)?.price ?? 0;

  const insight = resolvePurchaseDecisionInsight({ cellIndex, buyerId: effectiveBuyerId, buyerBalance: effectiveBalance, allPlayers: effectivePlayers });
  const cashBuffer = deedPrice !== undefined ? resolveCashBufferSafety({ buyerBalance: effectiveBalance, deedPrice: price }) : insight.cashBuffer;
  const { radar } = insight;

  const gridColsClass =
    radar.totalCells === 2
      ? 'grid-cols-2'
      : radar.totalCells === 3
        ? 'grid-cols-3'
        : 'grid-cols-2 sm:grid-cols-4';

  return (
    <div className="bg-[#F8F5ED] border border-amber-900/15 rounded-xl p-2 sm:p-2.5 space-y-1.5 sm:space-y-2 select-none text-xs text-slate-800" data-testid="purchase-decision-card">
      {/* Khối 1: Radar nhóm & Tiến độ độc quyền */}
      <div className="space-y-1 sm:space-y-1.5">
        <div className="flex items-center justify-between gap-1 text-[11px]">
          <span className="font-bold text-slate-700 flex items-center gap-1">
            <span>🧭</span>
            <span>{radar.isRailroad ? 'Hạ Tầng' : radar.isUtility ? 'Tiện Ích' : 'Bộ Màu Quy Hoạch'} ({radar.ownedCount}/{radar.totalCells})</span>
          </span>
          <span className="px-2 py-0.5 rounded-full font-black text-[10px] bg-white border border-slate-300 shadow-sm text-slate-800 whitespace-nowrap shrink-0" data-testid="radar-strategy-badge">
            {radar.badge}
          </span>
        </div>
        <div className={`grid ${gridColsClass} gap-1 sm:gap-1.5`} data-testid="radar-group-chips">
          {radar.groupCells.map((c) => {
            const level = effectiveLevels[c.cellIndex] ?? 0;
            let badgeClasses = 'border-amber-900/10 bg-white/90 text-slate-600';
            let badgeLabel = '⚪ Trống';

            if (c.isTarget) {
              if (cashBuffer.canAfford) {
                badgeClasses = 'bg-amber-400 text-amber-950 font-black border-amber-600 shadow-sm';
                badgeLabel = '🎯 MUA NGAY';
              } else {
                badgeClasses = 'bg-amber-200 text-amber-900 font-bold border-amber-400';
                badgeLabel = '🎯 ĐANG XÉT';
              }
            } else if (c.isMine) {
              badgeClasses = 'bg-emerald-100 text-emerald-900 font-bold border-emerald-400';
              badgeLabel = '✓ Bạn';
            } else if (c.isOpponent) {
              badgeClasses = 'bg-rose-100 text-rose-900 font-medium border-rose-300';
              badgeLabel = c.ownerName ? c.ownerName.slice(0, 10) : 'Đối thủ';
            } else {
              badgeClasses = 'border-dashed border-amber-900/20 bg-amber-50/30 text-slate-500';
            }

            return (
              <div
                key={c.cellIndex}
                data-testid={`district-cell-chip-${c.cellIndex}`}
                className={`px-1 sm:px-2 py-1 rounded-xl border text-[9.5px] sm:text-[11px] min-w-0 flex flex-col justify-between transition-all min-h-[3.25rem] sm:min-h-[3.5rem] ${
                  c.isTarget ? 'ring-2 ring-amber-400 bg-amber-50/80 border-amber-400' : 'bg-amber-50/60 border-amber-900/10'
                }`}
                title={c.ownerName ? `Sở hữu: ${c.ownerName}` : c.isTarget ? 'Ô mục tiêu' : 'Chưa có chủ'}
              >
                <div className="flex items-center justify-between gap-1 mb-1 min-w-0">
                  <span className="font-bold text-slate-900 line-clamp-2 leading-tight text-[9.5px] sm:text-xs block" title={c.name}>
                    {c.name}
                  </span>
                  {level > 0 && (
                    <span
                      className="text-[9px] font-bold px-1 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 shrink-0 inline-flex items-center gap-0.5"
                      title={`Cấp công trình: ${level}`}
                    >
                      🏠 {level}
                    </span>
                  )}
                </div>
                <div className={`text-[9.5px] sm:text-xs py-0.5 rounded-lg text-center whitespace-nowrap border mt-auto ${badgeClasses}`}>
                  {badgeLabel}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Khối 2: Đệm tiền mặt & An toàn thanh khoản */}
      <div className="pt-1.5 border-t border-amber-900/10 space-y-1">
        <div className="flex items-center justify-between gap-1 text-[11px]">
          <span className="text-slate-600 font-medium whitespace-nowrap">Thanh khoản sau mua:</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black border whitespace-nowrap shrink-0 ${TONE_CLASSES[cashBuffer.tone]}`}
            data-testid="cash-buffer-badge"
          >
            {cashBuffer.tone === 'emerald' ? '🟢' : cashBuffer.tone === 'amber' ? '🟡' : '🔴'} {cashBuffer.label}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-white/70 border border-slate-200/80">
          <span className="text-slate-500 whitespace-nowrap text-[11px] sm:text-xs">
            Ví: {formatCurrency(effectiveBalance)}
          </span>
          <span className="text-slate-400 font-normal text-[11px]">➔ Còn lại:</span>
          <span className={`whitespace-nowrap text-[11px] sm:text-xs ${cashBuffer.tone === 'rose' ? 'text-rose-700 font-black' : 'text-slate-900 font-black'}`}>
            {formatCurrency(cashBuffer.balanceAfterBuy)}
          </span>
        </div>
      </div>
    </div>
  );
}
