// [IMP-332] Activity Log Subscriber — Maps SynthesizedGameEvent to ActivityLogEntry
import type { ActivityLogEntry, useActivityStore } from '../../store/activity_store.js';
import { SynthesizedGameEventType, type SynthesizedGameEvent } from '../game_event_types.js';
import type { GameEventContext, GameEventListener } from '../game_event_bus.js';
import { BOARD_CONFIG } from '../../../domain/board_config.js';
import { formatCurrency } from '../../ui/ui_helpers.js';

function getCellName(cellIndex: number): string {
  return BOARD_CONFIG[cellIndex]?.name ?? `Ô #${cellIndex}`;
}

function resolvePlayerName(context: GameEventContext, playerId?: string): string {
  if (!playerId) return '';
  const p = context.nextState.playersInfo[playerId] ?? context.prevState.playersInfo[playerId];
  return p?.name || playerId.toUpperCase();
}

function resolvePlayerTokenColor(context: GameEventContext, playerId?: string): string | undefined {
  if (!playerId) return undefined;
  const p = context.nextState.playersInfo[playerId] ?? context.prevState.playersInfo[playerId];
  return p?.tokenColor;
}

function mapFinancialEventToActivityLog(
  event: SynthesizedGameEvent,
  context: GameEventContext,
  id: string,
  timestamp: number,
): ActivityLogEntry | null {
  switch (event.type) {
    case SynthesizedGameEventType.RENT_PAID: {
      const payerName = resolvePlayerName(context, event.payerId);
      const receiverName = resolvePlayerName(context, event.receiverId);
      const cellName = getCellName(event.cellIndex);
      return {
        id,
        timestamp,
        type: 'rent',
        message: `${payerName} đã trả ${formatCurrency(event.amount)} tiền thuê tại ${cellName} cho ${receiverName}`,
        playerId: event.payerId,
        playerName: payerName,
        targetPlayerId: event.receiverId,
        targetPlayerName: receiverName,
        amount: -event.amount,
        cellIndex: event.cellIndex,
        playerTokenColor: resolvePlayerTokenColor(context, event.payerId),
      };
    }

    case SynthesizedGameEventType.PARTIAL_RENT: {
      const payerName = resolvePlayerName(context, event.payerId);
      const receiverName = resolvePlayerName(context, event.receiverId);
      const cellName = event.cellIndex !== undefined ? getCellName(event.cellIndex) : 'BĐS';
      return {
        id,
        timestamp,
        type: 'rent',
        message: `${payerName} vỡ nợ, chỉ trả được ${formatCurrency(event.paidAmount)} tiền thuê tại ${cellName} cho ${receiverName} (còn nợ ${formatCurrency(event.remainingDebt)})`,
        playerId: event.payerId,
        playerName: payerName,
        targetPlayerId: event.receiverId,
        targetPlayerName: receiverName,
        amount: -event.paidAmount,
        cellIndex: event.cellIndex,
        playerTokenColor: resolvePlayerTokenColor(context, event.payerId),
      };
    }

    case SynthesizedGameEventType.PORT_SPLIT_RENT: {
      const payerName = resolvePlayerName(context, event.payerId);
      const cellName = getCellName(event.cellIndex);
      return {
        id,
        timestamp,
        type: 'rent',
        message: `${payerName} đã trả ${formatCurrency(event.totalAmount)} phí cảng biển tại ${cellName} (chia đều ${formatCurrency(event.amountPerReceiver)})`,
        playerId: event.payerId,
        playerName: payerName,
        amount: -event.totalAmount,
        cellIndex: event.cellIndex,
        playerTokenColor: resolvePlayerTokenColor(context, event.payerId),
      };
    }

    case SynthesizedGameEventType.GO_SALARY: {
      const playerName = resolvePlayerName(context, event.playerId);
      const taxStr = event.taxDeduction > 0 ? ` (khấu trừ thuế: ${formatCurrency(event.taxDeduction)})` : '';
      return {
        id,
        timestamp,
        type: 'salary',
        message: `${playerName} nhận lương vượt GO ${formatCurrency(event.grossSalary)}${taxStr}`,
        playerId: event.playerId,
        playerName,
        amount: event.netAmount,
        playerTokenColor: resolvePlayerTokenColor(context, event.playerId),
      };
    }

    case SynthesizedGameEventType.FEE_PAID: {
      const playerName = resolvePlayerName(context, event.payerId);
      const isTaxOrBail = event.feeType === 'LAND_TAX' || event.feeType === 'BAIL';
      return {
        id,
        timestamp,
        type: isTaxOrBail ? 'tax' : 'system',
        message: `${playerName} đã nộp ${event.feeType} ${formatCurrency(event.amount)}`,
        playerId: event.payerId,
        playerName,
        targetPlayerId: event.receiverId,
        targetPlayerName: resolvePlayerName(context, event.receiverId),
        amount: -event.amount,
        cellIndex: event.cellIndex,
        playerTokenColor: resolvePlayerTokenColor(context, event.payerId),
      };
    }

    case SynthesizedGameEventType.DIPLOMATIC_WAIVER: {
      const payerName = resolvePlayerName(context, event.payerId);
      const landlordName = resolvePlayerName(context, event.landlordId);
      const cellName = getCellName(event.cellIndex);
      return {
        id,
        timestamp,
        type: 'system',
        message: `${payerName} dùng Thẻ Ngoại Giao, được miễn trừ ${formatCurrency(event.waivedAmount)} tiền thuê tại ${cellName} của ${landlordName}`,
        playerId: event.payerId,
        playerName: payerName,
        targetPlayerId: event.landlordId,
        targetPlayerName: landlordName,
        cellIndex: event.cellIndex,
        playerTokenColor: resolvePlayerTokenColor(context, event.payerId),
      };
    }

    default:
      return null;
  }
}

function mapPropertyEventToActivityLog(
  event: SynthesizedGameEvent,
  context: GameEventContext,
  id: string,
  timestamp: number,
): ActivityLogEntry | null {
  switch (event.type) {
    case SynthesizedGameEventType.PROPERTY_BOUGHT: {
      const buyerName = resolvePlayerName(context, event.buyerId);
      const cellName = getCellName(event.cellIndex);
      return {
        id,
        timestamp,
        type: 'buy',
        message: `${buyerName} đã mua ${cellName} với giá ${formatCurrency(event.price)}`,
        playerId: event.buyerId,
        playerName: buyerName,
        amount: -event.price,
        cellIndex: event.cellIndex,
        playerTokenColor: resolvePlayerTokenColor(context, event.buyerId),
      };
    }

    case SynthesizedGameEventType.PROPERTY_UPGRADED: {
      const ownerName = resolvePlayerName(context, event.ownerId);
      const cellName = getCellName(event.cellIndex);
      return {
        id,
        timestamp,
        type: 'upgrade',
        message: `${ownerName} đã nâng cấp ${cellName} lên cấp ${event.targetLevel} với chi phí ${formatCurrency(event.cost)}`,
        playerId: event.ownerId,
        playerName: ownerName,
        amount: -event.cost,
        cellIndex: event.cellIndex,
        playerTokenColor: resolvePlayerTokenColor(context, event.ownerId),
      };
    }

    case SynthesizedGameEventType.PROPERTY_MORTGAGED: {
      const ownerName = resolvePlayerName(context, event.ownerId);
      const cellName = getCellName(event.cellIndex);
      return {
        id,
        timestamp,
        type: 'mortgage',
        message: `${ownerName} đã thế chấp ${cellName} vào ngân hàng, nhận khoản vay ${formatCurrency(event.loanAmount)}`,
        playerId: event.ownerId,
        playerName: ownerName,
        amount: event.loanAmount,
        cellIndex: event.cellIndex,
        playerTokenColor: resolvePlayerTokenColor(context, event.ownerId),
      };
    }

    case SynthesizedGameEventType.PROPERTY_UNMORTGAGED: {
      const ownerName = resolvePlayerName(context, event.ownerId);
      const cellName = getCellName(event.cellIndex);
      return {
        id,
        timestamp,
        type: 'unmortgage',
        message: `${ownerName} đã chuộc lại ${cellName} từ ngân hàng với số tiền ${formatCurrency(event.cost)}`,
        playerId: event.ownerId,
        playerName: ownerName,
        amount: -event.cost,
        cellIndex: event.cellIndex,
        playerTokenColor: resolvePlayerTokenColor(context, event.ownerId),
      };
    }

    default:
      return null;
  }
}

function mapMarketEventToActivityLog(
  event: SynthesizedGameEvent,
  context: GameEventContext,
  id: string,
  timestamp: number,
): ActivityLogEntry | null {
  switch (event.type) {
    case SynthesizedGameEventType.TRADE_COMPLETED: {
      const buyerName = resolvePlayerName(context, event.buyerId);
      const sellerName = resolvePlayerName(context, event.sellerId);
      const cellName = getCellName(event.cellIndex);
      const message = event.offeredCellIndex !== undefined
        ? `🤝 ${buyerName} và ${sellerName} đã hoán đổi ${cellName} ⇄ ${getCellName(event.offeredCellIndex)}${event.price > 0 ? ` (kèm bù ${formatCurrency(event.price)})` : ''}`
        : `🤝 ${buyerName} đã mua ${cellName} từ ${sellerName} với giá ${formatCurrency(event.price)}`;
      return {
        id,
        timestamp,
        type: 'trade',
        message,
        playerId: event.buyerId,
        playerName: buyerName,
        targetPlayerId: event.sellerId,
        targetPlayerName: sellerName,
        amount: event.price > 0 ? -event.price : undefined,
        cellIndex: event.cellIndex,
        playerTokenColor: resolvePlayerTokenColor(context, event.buyerId),
      };
    }

    case SynthesizedGameEventType.AUCTION_WON: {
      const winnerName = resolvePlayerName(context, event.winnerId);
      const cellName = getCellName(event.cellIndex);
      return {
        id,
        timestamp,
        type: 'buy',
        message: `🔨 Búa gõ thành công! ${winnerName} đã trúng đấu giá ${cellName} với giá ${formatCurrency(event.winningBid)}!`,
        playerId: event.winnerId,
        playerName: winnerName,
        amount: -event.winningBid,
        cellIndex: event.cellIndex,
        playerTokenColor: resolvePlayerTokenColor(context, event.winnerId),
      };
    }

    case SynthesizedGameEventType.AUCTION_BID_PLACED: {
      const bidderName = resolvePlayerName(context, event.bidderId);
      const cellName = getCellName(event.cellIndex);
      return {
        id,
        timestamp,
        type: 'auction',
        message: `${bidderName} đã đặt giá ${formatCurrency(event.bidAmount)} cho ${cellName}`,
        playerId: event.bidderId,
        playerName: bidderName,
        amount: -event.bidAmount,
        cellIndex: event.cellIndex,
        playerTokenColor: resolvePlayerTokenColor(context, event.bidderId),
      };
    }

    default:
      return null;
  }
}

let activitySequence = 0;

export function mapEventToActivityLog(
  event: SynthesizedGameEvent,
  context: GameEventContext,
): ActivityLogEntry | null {
  const timestamp = event.timestamp ?? Date.now();
  const id = `act_${event.type}_${timestamp}_${++activitySequence}`;

  const financialEntry = mapFinancialEventToActivityLog(event, context, id, timestamp);
  if (financialEntry) return financialEntry;

  const propertyEntry = mapPropertyEventToActivityLog(event, context, id, timestamp);
  if (propertyEntry) return propertyEntry;

  return mapMarketEventToActivityLog(event, context, id, timestamp);
}

export function createActivityLogSubscriber(
  store?: typeof useActivityStore,
): GameEventListener {
  return (events: readonly SynthesizedGameEvent[], context: GameEventContext) => {
    if (!events || events.length === 0) return;
    for (const ev of events) {
      try {
        const entry = mapEventToActivityLog(ev, context);
        if (entry && store) {
          store.getState().addActivityLog(entry);
        }
      } catch (err) {
        console.warn('[ActivityLogSubscriber] Per-event mapping error isolated:', err);
      }
    }
  };
}
