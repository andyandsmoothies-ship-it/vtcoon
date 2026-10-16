// [IMP-369] Activity Log Financial Formatter — Decoupled financial narrative formatting and card guard
import type { EventCardInfo } from '../../../domain/index.js';

import type { ActivityLogType } from '../../store/activity_store.js';
import type { SynthesizedGameEvent } from '../game_event_types.js';
import { SynthesizedGameEventType } from '../game_event_types.js';
import type { GameEventContext } from '../game_event_bus_types.js';
import { formatCurrency } from '../../ui/ui_helpers.js';

export function isCardPenaltyForPayer(card: EventCardInfo | null | undefined, payerId: string): boolean {
  if (!card) return false;
  // 1. Must be a penalty/tax/fine card (negative effectDelta or penalty keywords)
  const hasNegativeDelta = card.effectDelta !== undefined && card.effectDelta < 0;
  const hasPenaltyAction = card.action === 'pay_fine' || card.action === 'tax' || card.action === 'pay';
  const hasPenaltyText = Boolean(
    (card.destination && /Kho Bạc|nộp phạt|truy thu|phạt/i.test(card.destination)) ||
    (card.effectDetail && /nộp phạt|truy thu|phạt|lệ phí/i.test(card.effectDetail)) ||
    (card.description && /truy thu thuế|phạt|bồi thường/i.test(card.description)),
  );
  if (!hasNegativeDelta && !hasPenaltyAction && !hasPenaltyText) {
    return false;
  }
  // 2. Must target this player (drawnBy / affectedPlayerId for targeted cards, or global Market cards)
  const isTargeted = card.drawnBy === payerId || card.playerId === payerId || card.affectedPlayerId === payerId;
  const isGlobalMarket = card.type === 'Market' || card.cardType === 'market';
  return isTargeted || isGlobalMarket;
}

export function formatGoSalaryDeductionSuffix(
  deductions?: { propertyTax?: number; mortgageInterest?: number; overdraft?: number; creditFee?: number },
  fallbackTax = 0,
): string {
  const parts: string[] = [];
  const tax = deductions?.propertyTax ?? fallbackTax;
  if (tax > 0) parts.push(`thuế ${formatCurrency(tax)}`);
  if (deductions?.mortgageInterest && deductions.mortgageInterest > 0) parts.push(`lãi thế chấp ${formatCurrency(deductions.mortgageInterest)}`);
  if (deductions?.overdraft && deductions.overdraft > 0) parts.push(`thấu chi ${formatCurrency(deductions.overdraft)}`);
  if (deductions?.creditFee && deductions.creditFee > 0) parts.push(`phí thẻ ${formatCurrency(deductions.creditFee)}`);
  return parts.length > 0 ? ` (khấu trừ: ${parts.join(', ')})` : '';
}

export function resolveFeePaidDetails(
  event: Extract<SynthesizedGameEvent, { type: SynthesizedGameEventType.FEE_PAID }>,
  context: GameEventContext,
  playerName: string,
  targetPlayerName?: string,
): { logType: ActivityLogType; message: string } {
  const isTelecom = event.feeType === 'TELECOM_DATA';
  const isLand = event.feeType === 'LAND_TAX' || event.cellIndex === 4;
  const isBail = event.feeType === 'BAIL' || event.cellIndex === 10;
  const card = context.delta.lastEventCard;
  const hasValidCardPenalty = isCardPenaltyForPayer(card, event.payerId);
  const cardTitle = hasValidCardPenalty ? card?.title : undefined;

  const logType: ActivityLogType = isTelecom ? 'utility' : isBail ? 'bail' : 'tax';
  const receiverSuffix = targetPlayerName ? ` cho ${targetPlayerName} (Viettel Post)` : ' (Viettel Post)';
  const message = isTelecom
    ? `${playerName} đã thanh toán ${formatCurrency(event.amount)} cước viễn thông${receiverSuffix}`
    : isLand
    ? `${playerName} đã nộp ${formatCurrency(event.amount)} Lệ Phí Đất (Ô 04) vào Kho Bạc`
    : isBail
    ? `${playerName} đã nộp ${formatCurrency(event.amount)} bảo lãnh Kiểm Toán (Ô 10) vào Kho Bạc`
    : cardTitle
    ? `${playerName} đã nộp phạt ${formatCurrency(event.amount)} (${cardTitle}) vào Kho Bạc`
    : `${playerName} đã nộp ${formatCurrency(event.amount)} thuế/phạt vào Kho Bạc Nhà Nước`;
  return { logType, message };
}

export function formatBondRepaidMessage(
  playerName: string,
  repayAmount: number,
  principal: number,
  interest: number,
): string {
  return `${playerName} đã tất toán Trái Phiếu Doanh Nghiệp ${formatCurrency(repayAmount)} (gốc ${formatCurrency(principal)} + lãi ${formatCurrency(interest)})`;
}

export function formatBondIssuedMessage(
  playerName: string,
  principal: number,
  roundsLeft: number,
  interestRate: number,
  trancheId?: string,
): string {
  const trancheLabel = trancheId ? `[${trancheId}] ` : '';
  const percent = Math.round(interestRate * 100);
  return `${playerName} đã phát hành Trái Phiếu ${trancheLabel}+${formatCurrency(principal)} (kỳ hạn ${roundsLeft} vòng, lãi suất ${percent}%)`;
}

export function formatBondDefaultMessage(
  playerName: string,
  principal: number,
  repayAmount: number,
  cashSeized?: number,
): string {
  const seizedPart = cashSeized && cashSeized > 0 ? `, bị tịch thu ${formatCurrency(cashSeized)} tiền mặt` : '';
  return `${playerName} vỡ nợ gói Trái Phiếu ${formatCurrency(principal)} (phải trả ${formatCurrency(repayAmount)}${seizedPart})`;
}

export function formatCompulsoryBuyoutMessage(
  buyerName: string,
  sellerName: string,
  cellName: string,
  cost: number,
  premiumRatio: number,
): string {
  const percent = Math.round(premiumRatio * 100);
  return `🤝 ${buyerName} đã thâu tóm cưỡng bức ${cellName} từ ${sellerName} với giá ${formatCurrency(cost)} (${percent}% giá gốc)`;
}

export function formatHoseSettledMessage(
  playerName: string,
  profit: number,
  stake: number,
  roll: number,
  multiplier: number,
): string {
  if (profit > 0) {
    return `📈 ${playerName} khớp lệnh HOSE: Mặt ${roll} (x${multiplier}) - LÃI +${formatCurrency(profit)}`;
  }
  if (profit < 0) {
    return `📉 ${playerName} khớp lệnh HOSE: Mặt ${roll} (x${multiplier}) - THUA LỖ ${formatCurrency(Math.abs(profit))}`;
  }
  return `📊 ${playerName} khớp lệnh HOSE: Mặt ${roll} (x${multiplier}) - HÒA VỐN (hoàn ${formatCurrency(stake)})`;
}

