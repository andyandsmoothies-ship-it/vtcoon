// [IMP-334] Property & Market Badge Handler
// Pure extracted presentation handlers for property lifecycle and market exchange badges
import { type GameState, FloatingTextType } from '../../store/game_store.js';
import type { useVfxStore } from '../../store/vfx_store.js';
import { SynthesizedGameEventType, type SynthesizedGameEvent } from '../game_event_types.js';
import type { GameEventContext } from '../game_event_bus.js';
import type { PacingContext } from '../pacing_context.js';
import { BOARD_CONFIG } from '../../../domain/board_config.js';
import { formatCurrency } from '../../ui/ui_helpers.js';

export function getCellName(cellIndex?: number): string {
  if (cellIndex === undefined) return 'BĐS';
  return BOARD_CONFIG[cellIndex]?.name ?? `Ô #${cellIndex}`;
}

export function resolvePlayerName(context: GameEventContext, playerId?: string): string {
  if (!playerId) return '';
  const p = context.nextState.playersInfo[playerId] ?? context.prevState.playersInfo[playerId];
  return p?.name || playerId.toUpperCase();
}

export function handlePropertyBadges(
  event: SynthesizedGameEvent,
  state: GameState,
  pacing: PacingContext,
): void {
  switch (event.type) {
    case SynthesizedGameEventType.PROPERTY_BOUGHT: {
      const cellName = getCellName(event.cellIndex);
      const delay = pacing.getPawnLandingDelay(event.buyerId);
      pacing.scheduleAction(() => {
        state.addFloatingText({
          text: formatCurrency(-event.price),
          type: FloatingTextType.Penalty,
          playerId: event.buyerId,
          actionType: 'buy',
          title: `Mua ${cellName}`,
          cellIndex: event.cellIndex,
          formula: undefined, // Mũi 5: 2-tier lean ergonomics on mobile 360px
        });
      }, delay);
      break;
    }

    case SynthesizedGameEventType.PROPERTY_UPGRADED: {
      const cellName = getCellName(event.cellIndex);
      const delay = pacing.getPawnLandingDelay(event.ownerId);
      pacing.scheduleAction(() => {
        state.addFloatingText({
          text: formatCurrency(-event.cost),
          type: FloatingTextType.Penalty,
          playerId: event.ownerId,
          actionType: 'upgrade',
          title: `Nâng cấp ${cellName}`,
          cellIndex: event.cellIndex,
          formula: undefined, // Mũi 5: 2-tier lean ergonomics on mobile 360px
        });
      }, delay);
      break;
    }

    case SynthesizedGameEventType.PROPERTY_MORTGAGED: {
      const cellName = getCellName(event.cellIndex);
      state.addFloatingText({
        text: `+${formatCurrency(event.loanAmount)}`,
        type: FloatingTextType.Reward,
        playerId: event.ownerId,
        actionType: 'mortgage',
        title: `Thế chấp ${cellName} ➔ Vay Ngân Hàng`,
        cellIndex: event.cellIndex,
      });
      break;
    }

    case SynthesizedGameEventType.PROPERTY_UNMORTGAGED: {
      const cellName = getCellName(event.cellIndex);
      state.addFloatingText({
        text: formatCurrency(-event.cost),
        type: FloatingTextType.Penalty,
        playerId: event.ownerId,
        actionType: 'unmortgage',
        title: `Giải chấp ${cellName} (Phí 10% ➔ Kho Bạc)`,
        cellIndex: event.cellIndex,
      });
      break;
    }

    default:
      break;
  }
}

export function handleMarketBadges(
  event: SynthesizedGameEvent,
  context: GameEventContext,
  state: GameState,
  vfx: typeof useVfxStore,
): void {
  switch (event.type) {
    case SynthesizedGameEventType.TRADE_COMPLETED: {
      const cellName = getCellName(event.cellIndex);
      const sellerName = resolvePlayerName(context, event.sellerId);
      const buyerName = resolvePlayerName(context, event.buyerId);
      const groupId = `trade_${event.timestamp}_${event.sellerId}_${event.buyerId}`;

      const title = event.offeredCellIndex !== undefined
        ? `${cellName} ⇄ ${getCellName(event.offeredCellIndex)}`
        : `Chuyển nhượng ${cellName}`;

      state.addFloatingText({
        text: cellName,
        type: FloatingTextType.Reward,
        playerId: event.buyerId,
        actionType: 'trade',
        title,
        targetPlayerId: event.sellerId,
        targetPlayerName: sellerName,
        cellIndex: event.cellIndex,
        groupId,
      });

      state.addFloatingText({
        text: cellName,
        type: FloatingTextType.Penalty,
        playerId: event.sellerId,
        actionType: 'trade',
        title,
        targetPlayerId: event.buyerId,
        targetPlayerName: buyerName,
        cellIndex: event.cellIndex,
        groupId,
      });
      break;
    }

    case SynthesizedGameEventType.AUCTION_WON: {
      const cellName = getCellName(event.cellIndex);
      vfx.getState().triggerPawnReaction(event.winnerId, 'victory_spin', 600);
      state.addFloatingText({
        text: formatCurrency(-event.winningBid),
        type: FloatingTextType.Penalty,
        playerId: event.winnerId,
        actionType: 'auction_win',
        title: `Thắng đấu giá ${cellName} ➔ Nộp Kho Bạc`,
        cellIndex: event.cellIndex,
      });
      break;
    }

    default:
      break;
  }
}
