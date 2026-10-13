import { useActivityStore, type ActivityLogEntry, type ActivityLogType } from '../../store/activity_store.js';
import { SynthesizedGameEventType, type SynthesizedGameEvent } from '../game_event_types.js';
import type { GameEventContext, GameEventListener } from '../game_event_bus.js';
import { BOARD_CONFIG } from '../../../domain/board_config.js';
import { formatCurrency } from '../../ui/ui_helpers.js';
import { formatKinematicActivityLog } from './activity_log_kinematics_formatter.js';
import {
  formatGoSalaryDeductionSuffix,
  resolveFeePaidDetails,
  formatBondRepaidMessage,
  formatBondIssuedMessage,
  formatCompulsoryBuyoutMessage,
  formatHoseSettledMessage,
} from './activity_log_financial_formatter.js';

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

function createFinancialLogEntry(
  id: string,
  timestamp: number,
  type: ActivityLogType,
  message: string,
  playerId: string,
  playerName: string,
  amount: number | undefined,
  playerTokenColor: string | undefined,
  targetPlayerId?: string,
  targetPlayerName?: string,
  cellIndex?: number,
): ActivityLogEntry {
  return {
    id, timestamp, type, message, playerId, playerName, amount, playerTokenColor,
    ...(targetPlayerId ? { targetPlayerId } : {}),
    ...(targetPlayerName ? { targetPlayerName } : {}),
    ...(cellIndex !== undefined ? { cellIndex } : {}),
  };
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
      const message = `${payerName} đã trả ${formatCurrency(event.amount)} tiền thuê tại ${cellName} cho ${receiverName}`;
      return createFinancialLogEntry(id, timestamp, 'rent', message, event.payerId, payerName, -event.amount, resolvePlayerTokenColor(context, event.payerId), event.receiverId, receiverName, event.cellIndex);
    }

    case SynthesizedGameEventType.PARTIAL_RENT: {
      const payerName = resolvePlayerName(context, event.payerId);
      const receiverName = resolvePlayerName(context, event.receiverId);
      const cellName = event.cellIndex !== undefined ? getCellName(event.cellIndex) : 'BĐS';
      const message = `${payerName} vỡ nợ, chỉ trả được ${formatCurrency(event.paidAmount)} tiền thuê tại ${cellName} cho ${receiverName} (còn nợ ${formatCurrency(event.remainingDebt)})`;
      return createFinancialLogEntry(id, timestamp, 'rent', message, event.payerId, payerName, -event.paidAmount, resolvePlayerTokenColor(context, event.payerId), event.receiverId, receiverName, event.cellIndex);
    }

    case SynthesizedGameEventType.PORT_SPLIT_RENT: {
      const payerName = resolvePlayerName(context, event.payerId);
      const cellName = getCellName(event.cellIndex);
      const message = `${payerName} đã trả ${formatCurrency(event.totalAmount)} phí cảng biển tại ${cellName} (chia đều ${formatCurrency(event.amountPerReceiver)})`;
      return createFinancialLogEntry(id, timestamp, 'rent', message, event.payerId, payerName, -event.totalAmount, resolvePlayerTokenColor(context, event.payerId), undefined, undefined, event.cellIndex);
    }

    case SynthesizedGameEventType.GO_SALARY: {
      const playerName = resolvePlayerName(context, event.playerId);
      const deductionStr = formatGoSalaryDeductionSuffix(event.deductions, event.taxDeduction);
      const message = `${playerName} nhận lương vượt GO ${formatCurrency(event.grossSalary)}${deductionStr}`;
      return createFinancialLogEntry(id, timestamp, 'salary', message, event.playerId, playerName, event.netAmount, resolvePlayerTokenColor(context, event.playerId));
    }

    case SynthesizedGameEventType.FEE_PAID: {
      const playerName = resolvePlayerName(context, event.payerId);
      const targetPlayerName = resolvePlayerName(context, event.receiverId);
      const { logType, message } = resolveFeePaidDetails(event, context, playerName, targetPlayerName);
      return createFinancialLogEntry(id, timestamp, logType, message, event.payerId, playerName, -event.amount, resolvePlayerTokenColor(context, event.payerId), event.receiverId, targetPlayerName, event.cellIndex);
    }

    case SynthesizedGameEventType.DIPLOMATIC_WAIVER: {
      const payerName = resolvePlayerName(context, event.payerId);
      const landlordName = resolvePlayerName(context, event.landlordId);
      const cellName = getCellName(event.cellIndex);
      const message = `${payerName} dùng Thẻ Ngoại Giao, được miễn trừ ${formatCurrency(event.waivedAmount)} tiền thuê tại ${cellName} của ${landlordName}`;
      return createFinancialLogEntry(id, timestamp, 'system', message, event.payerId, payerName, undefined, resolvePlayerTokenColor(context, event.payerId), event.landlordId, landlordName, event.cellIndex);
    }

    case SynthesizedGameEventType.BOND_REPAID: {
      const playerName = resolvePlayerName(context, event.playerId);
      const message = formatBondRepaidMessage(playerName, event.repayAmount, event.principal, event.interest);
      return createFinancialLogEntry(id, timestamp, 'bond', message, event.playerId, playerName, -event.repayAmount, resolvePlayerTokenColor(context, event.playerId));
    }

    case SynthesizedGameEventType.BOND_ISSUED: {
      const playerName = resolvePlayerName(context, event.playerId);
      const message = formatBondIssuedMessage(playerName, event.principal, event.roundsLeft, event.interestRate, event.trancheId);
      return createFinancialLogEntry(id, timestamp, 'bond', message, event.playerId, playerName, event.principal, resolvePlayerTokenColor(context, event.playerId));
    }

    case SynthesizedGameEventType.COMPULSORY_BUYOUT: {
      const buyerName = resolvePlayerName(context, event.buyerId);
      const sellerName = resolvePlayerName(context, event.sellerId);
      const cellName = getCellName(event.cellIndex);
      const message = formatCompulsoryBuyoutMessage(buyerName, sellerName, cellName, event.cost, event.premiumRatio);
      return createFinancialLogEntry(id, timestamp, 'trade', message, event.buyerId, buyerName, -event.cost, resolvePlayerTokenColor(context, event.buyerId), event.sellerId, sellerName, event.cellIndex);
    }

    case SynthesizedGameEventType.HOSE_SETTLED: {
      const playerName = resolvePlayerName(context, event.playerId);
      const message = formatHoseSettledMessage(playerName, event.profit, event.stake, event.roll, event.multiplier);
      return createFinancialLogEntry(id, timestamp, 'hose', message, event.playerId, playerName, event.profit !== 0 ? event.profit : undefined, resolvePlayerTokenColor(context, event.playerId));
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

function mapKinematicEventToActivityLog(
  event: SynthesizedGameEvent,
  context: GameEventContext,
  id: string,
  timestamp: number,
): ActivityLogEntry | null {
  const playerId = 'playerId' in event ? event.playerId : undefined;
  const playerName = resolvePlayerName(context, playerId);
  const cellIndex = 'cellIndex' in event ? event.cellIndex : ('toCell' in event ? event.toCell : undefined);
  const cellName = cellIndex !== undefined ? getCellName(cellIndex) : undefined;
  const formatted = formatKinematicActivityLog(event, playerName, cellName);
  if (!formatted) return null;

  return {
    id,
    timestamp,
    type: formatted.type,
    message: formatted.message,
    playerId,
    playerName,
    cellIndex,
    playerTokenColor: resolvePlayerTokenColor(context, playerId),
  };
}

export function mapEventToActivityLog(
  event: SynthesizedGameEvent,
  context: GameEventContext,
): ActivityLogEntry | null {
  const timestamp = event.timestamp ? event.timestamp : Date.now();
  const id = `act_${event.type}_${timestamp}_${++activitySequence}`;

  const kinematicEntry = mapKinematicEventToActivityLog(event, context, id, timestamp);
  if (kinematicEntry) return kinematicEntry;

  const financialEntry = mapFinancialEventToActivityLog(event, context, id, timestamp);
  if (financialEntry) return financialEntry;

  const propertyEntry = mapPropertyEventToActivityLog(event, context, id, timestamp);
  if (propertyEntry) return propertyEntry;

  return mapMarketEventToActivityLog(event, context, id, timestamp);
}

export function createActivityLogSubscriber(
  store?: typeof useActivityStore,
): GameEventListener {
  const targetStore = store ?? useActivityStore;
  return (events: readonly SynthesizedGameEvent[], context: GameEventContext) => {
    if (!events || events.length === 0) return;
    for (const ev of events) {
      try {
        const entry = mapEventToActivityLog(ev, context);
        if (entry) {
          targetStore.getState().addActivityLog(entry);
        }
      } catch (err) {
        console.warn('[ActivityLogSubscriber] Per-event mapping error isolated:', err);
      }
    }
  };
}
