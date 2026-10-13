// [IMP-380] Badge Financial Helpers — Dedicated floating text badge handlers for bonds, buyouts, and investments
import { type GameState, FloatingTextType } from '../../store/game_store.js';
import { SynthesizedGameEventType, type SynthesizedGameEvent } from '../game_event_types.js';
import type { GameEventContext } from '../game_event_bus.js';
import type { PacingContext } from '../pacing_context.js';
import { formatCurrency } from '../../ui/ui_helpers.js';
import { getCellName, resolvePlayerName } from './property_market_badge_handler.js';

export function handleBondAndInvestmentBadges(
  event: SynthesizedGameEvent,
  context: GameEventContext,
  state: GameState,
  pacing: PacingContext,
): void {
  switch (event.type) {
    case SynthesizedGameEventType.BOND_REPAID: {
      const delay = pacing.getPawnLandingDelay(event.playerId);
      pacing.scheduleAction(() => {
        state.addFloatingText({
          text: formatCurrency(-event.repayAmount),
          type: FloatingTextType.Penalty,
          playerId: event.playerId,
          actionType: 'bond',
          title: 'Tất Toán Trái Phiếu Doanh Nghiệp',
          formula: `Gốc: ${formatCurrency(event.principal)} Tr. + Lãi: ${formatCurrency(event.interest)} Tr.`,
        });
      }, delay);
      break;
    }

    case SynthesizedGameEventType.BOND_ISSUED: {
      const delay = pacing.getPawnLandingDelay(event.playerId);
      pacing.scheduleAction(() => {
        state.addFloatingText({
          text: `+${formatCurrency(event.principal)}`,
          type: FloatingTextType.Reward,
          playerId: event.playerId,
          actionType: 'bond',
          title: 'Phát Hành Trái Phiếu Doanh Nghiệp',
          formula: `Kỳ hạn: ${event.roundsLeft} vòng, Lãi suất: ${Math.round(event.interestRate * 100)}%`,
        });
      }, delay);
      break;
    }

    case SynthesizedGameEventType.COMPULSORY_BUYOUT: {
      const delay = pacing.getPawnLandingDelay(event.buyerId);
      const cellName = getCellName(event.cellIndex);
      const sellerName = resolvePlayerName(context, event.sellerId);
      const buyerName = resolvePlayerName(context, event.buyerId);
      const groupId = `buyout_${event.cellIndex}_${event.buyerId}_${event.sellerId}_${event.timestamp}`;

      pacing.scheduleAction(() => {
        state.addFloatingText({
          text: formatCurrency(-event.cost),
          type: FloatingTextType.Penalty,
          playerId: event.buyerId,
          actionType: 'ma_buyout',
          title: 'Thâu Tóm M&A Cưỡng Bức',
          formula: `Mua lại ${cellName} (${Math.round(event.premiumRatio * 100)}% giá gốc)`,
          cellIndex: event.cellIndex,
          targetPlayerId: event.sellerId,
          targetPlayerName: sellerName,
          groupId,
        });

        if (event.sellerId) {
          state.addFloatingText({
            text: `+${formatCurrency(event.cost)}`,
            type: FloatingTextType.Reward,
            playerId: event.sellerId,
            actionType: 'ma_buyout',
            title: 'Bán Cưỡng Bức M&A',
            formula: `Chuyển nhượng ${cellName} nhận ${formatCurrency(event.cost)} Tr.`,
            cellIndex: event.cellIndex,
            targetPlayerId: event.buyerId,
            targetPlayerName: buyerName,
            groupId,
          });
        }
      }, delay);
      break;
    }

    case SynthesizedGameEventType.HOSE_SETTLED: {
      const delay = pacing.getPawnLandingDelay(event.playerId);
      const isWin = event.profit > 0;
      const isLoss = event.profit < 0;
      pacing.scheduleAction(() => {
        state.addFloatingText({
          text: isWin ? `+${formatCurrency(event.profit)}` : isLoss ? formatCurrency(event.profit) : '±0',
          type: isLoss ? FloatingTextType.Penalty : FloatingTextType.Reward,
          playerId: event.playerId,
          actionType: 'hose',
          title: isWin ? 'HOSE: Khớp Lệnh Có Lãi' : isLoss ? 'HOSE: Khớp Lệnh Thua Lỗ' : 'HOSE: Khớp Lệnh Hòa Vốn',
          formula: `Mặt ${event.roll} (x${event.multiplier}) - ${isLoss ? 'Mất' : 'Nhận'} ${formatCurrency(Math.abs(event.profit || event.stake))} Tr.`,
        });
      }, delay);
      break;
    }

    default:
      break;
  }
}
