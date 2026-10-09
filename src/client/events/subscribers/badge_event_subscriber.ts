// [IMP-333] Badge Event Presentation Subscriber — Maps SynthesizedGameEvent to FloatingText & Pawn VFX
import { useGameStore, type GameState, FloatingTextType } from '../../store/game_store.js';
import { useVfxStore } from '../../store/vfx_store.js';
import { SynthesizedGameEventType, type SynthesizedGameEvent } from '../game_event_types.js';
import type { GameEventContext, GameEventListener } from '../game_event_bus.js';
import type { PacingContext } from '../pacing_context.js';
import { createDefaultPacingContext } from '../pacing_context.js';
import { formatCurrency } from '../../ui/ui_helpers.js';
import {
  handlePropertyBadges,
  handleMarketBadges,
  getCellName,
  resolvePlayerName,
} from './property_market_badge_handler.js';

function handleRentBadges(
  event: SynthesizedGameEvent,
  context: GameEventContext,
  state: GameState,
  pacing: PacingContext,
  vfx: typeof useVfxStore,
): void {
  switch (event.type) {
    case SynthesizedGameEventType.RENT_PAID: {
      const cellName = getCellName(event.cellIndex);
      const payerName = resolvePlayerName(context, event.payerId);
      const receiverName = resolvePlayerName(context, event.receiverId);
      const groupId = `rent_${event.timestamp}_${event.payerId}_${event.receiverId}`;
      const delay = pacing.getPawnLandingDelay(event.payerId);

      pacing.scheduleAction(() => {
        vfx.getState().triggerPawnReaction(event.payerId, 'slump_recoil', 400);
        state.addFloatingText({
          text: formatCurrency(-event.amount),
          type: FloatingTextType.Penalty,
          playerId: event.payerId,
          actionType: 'rent_pay',
          title: `Trả thuê ${cellName}`,
          targetPlayerId: event.receiverId,
          targetPlayerName: receiverName,
          cellIndex: event.cellIndex,
          groupId,
        });

        vfx.getState().triggerPawnReaction(event.receiverId, 'victory_spin', 600);
        state.addFloatingText({
          text: `+${formatCurrency(event.amount)}`,
          type: FloatingTextType.Reward,
          playerId: event.receiverId,
          actionType: 'rent_receive',
          title: `Thu thuê ${cellName}`,
          targetPlayerId: event.payerId,
          targetPlayerName: payerName,
          cellIndex: event.cellIndex,
          groupId,
        });
      }, delay);
      break;
    }

    case SynthesizedGameEventType.PARTIAL_RENT: {
      const cellName = getCellName(event.cellIndex);
      const payerName = resolvePlayerName(context, event.payerId);
      const receiverName = resolvePlayerName(context, event.receiverId);
      const groupId = `partial_rent_${event.timestamp}_${event.payerId}_${event.receiverId}`;
      const delay = pacing.getPawnLandingDelay(event.payerId);

      pacing.scheduleAction(() => {
        vfx.getState().triggerPawnReaction(event.payerId, 'slump_recoil', 400);
        state.addFloatingText({
          text: formatCurrency(-event.paidAmount),
          type: FloatingTextType.Penalty,
          playerId: event.payerId,
          actionType: 'rent_pay',
          title: `Trả thiếu tiền thuê ${cellName}`,
          formula: `Còn nợ: ${formatCurrency(event.remainingDebt)}`,
          targetPlayerId: event.receiverId,
          targetPlayerName: receiverName,
          cellIndex: event.cellIndex,
          groupId,
        });

        vfx.getState().triggerPawnReaction(event.receiverId, 'victory_spin', 600);
        state.addFloatingText({
          text: `+${formatCurrency(event.paidAmount)}`,
          type: FloatingTextType.Reward,
          playerId: event.receiverId,
          actionType: 'rent_receive',
          title: `Thu một phần thuê ${cellName}`,
          targetPlayerId: event.payerId,
          targetPlayerName: payerName,
          cellIndex: event.cellIndex,
          groupId,
        });
      }, delay);
      break;
    }

    case SynthesizedGameEventType.PORT_SPLIT_RENT: {
      const cellName = getCellName(event.cellIndex);
      const delay = pacing.getPawnLandingDelay(event.payerId);

      pacing.scheduleAction(() => {
        vfx.getState().triggerPawnReaction(event.payerId, 'slump_recoil', 400);
        state.addFloatingText({
          text: formatCurrency(-event.totalAmount),
          type: FloatingTextType.Penalty,
          playerId: event.payerId,
          actionType: 'rent_pay',
          title: `Trả phí cảng ${cellName}`,
          cellIndex: event.cellIndex,
          groupId: `port_split_payer_${event.timestamp}_${event.payerId}`,
        });

        for (const receiverId of event.receiverIds) {
          vfx.getState().triggerPawnReaction(receiverId, 'victory_spin', 600);
          state.addFloatingText({
            text: `+${formatCurrency(event.amountPerReceiver)}`,
            type: FloatingTextType.Reward,
            playerId: receiverId,
            actionType: 'rent_receive',
            title: `Thu phí cảng ${cellName}`,
            cellIndex: event.cellIndex,
            // ADV-01 / Mũi 4: Distinct non-collapsing groupId per receiver
            groupId: `port_split_rec_${event.cellIndex}_${event.payerId}_${receiverId}`,
          });
        }
      }, delay);
      break;
    }

    default:
      break;
  }
}

function handleSalaryAndFeeBadges(
  event: SynthesizedGameEvent,
  context: GameEventContext,
  state: GameState,
  pacing: PacingContext,
): void {
  switch (event.type) {
    case SynthesizedGameEventType.GO_SALARY: {
      const delay = pacing.getPawnPassGoDelay(event.playerId);
      const taxFormula = event.taxDeduction > 0 ? ` (thuế: -${formatCurrency(event.taxDeduction)})` : '';

      pacing.scheduleAction(() => {
        state.addFloatingText({
          text: `+${formatCurrency(event.netAmount)}`,
          type: FloatingTextType.Reward,
          playerId: event.playerId,
          actionType: 'salary',
          title: 'Lương Vượt Ô Bắt Đầu',
          formula: `Hoàn thành 1 vòng sa bàn (+${formatCurrency(event.grossSalary)} Tr.)${taxFormula}`,
        });
      }, delay);
      break;
    }

    case SynthesizedGameEventType.FEE_PAID: {
      const delay = pacing.getPawnLandingDelay(event.payerId);
      const isBail = event.feeType === 'BAIL';
      const isLandTax = event.feeType === 'LAND_TAX';
      const title = isBail
        ? 'Bảo lãnh kiểm toán (Ô 10) ➔ Nộp Kho Bạc'
        : isLandTax
        ? 'Lệ Phí Đất Đai ➔ Kho Bạc'
        : `Nộp ${event.feeType} ➔ Kho Bạc`;
      const formula = isBail
        ? `Bảo lãnh chuẩn: Khung ${formatCurrency(event.amount)} Tr. ➔ Kho Bạc`
        : 'Nộp ngân sách nhà nước';

      pacing.scheduleAction(() => {
        state.addFloatingText({
          text: formatCurrency(-event.amount),
          type: FloatingTextType.Penalty,
          playerId: event.payerId,
          actionType: isBail ? 'bail' : 'tax',
          title,
          formula,
          cellIndex: event.cellIndex,
        });
      }, delay);
      break;
    }

    case SynthesizedGameEventType.DIPLOMATIC_WAIVER: {
      const cellName = getCellName(event.cellIndex);
      const tenantName = resolvePlayerName(context, event.payerId);
      const landlordName = resolvePlayerName(context, event.landlordId);
      const groupId = `diplo_${event.cellIndex}_${event.payerId}_${event.landlordId}_${event.timestamp}`;

      state.addFloatingText({
        text: `+${formatCurrency(event.waivedAmount)} Tr.`,
        type: FloatingTextType.Reward,
        playerId: event.payerId,
        actionType: 'diplomatic',
        title: 'Miễn Trừ Ngoại Giao',
        cellIndex: event.cellIndex,
        targetPlayerId: event.landlordId,
        targetPlayerName: landlordName,
        groupId,
      });

      state.addFloatingText({
        text: `-${formatCurrency(event.waivedAmount)} Tr.`,
        type: FloatingTextType.Penalty,
        playerId: event.landlordId,
        actionType: 'diplomatic',
        title: `${tenantName} dùng Thẻ Ngoại Giao`,
        cellIndex: event.cellIndex,
        targetPlayerId: event.payerId,
        targetPlayerName: tenantName,
        groupId,
      });
      break;
    }

    default:
      break;
  }
}

function handleFinancialBadges(
  event: SynthesizedGameEvent,
  context: GameEventContext,
  state: GameState,
  pacing: PacingContext,
  vfx: typeof useVfxStore,
): void {
  handleRentBadges(event, context, state, pacing, vfx);
  handleSalaryAndFeeBadges(event, context, state, pacing);
}


export function createBadgeEventSubscriber(
  gameStore?: typeof useGameStore,
  pacingContext?: PacingContext,
  vfxStore?: typeof useVfxStore,
): GameEventListener {
  const store = gameStore ?? useGameStore;
  const pacing = pacingContext ?? createDefaultPacingContext(store);
  const vfx = vfxStore ?? useVfxStore;

  return (events: readonly SynthesizedGameEvent[], context: GameEventContext) => {
    if (!events || events.length === 0) return;
    const state = store.getState();

    for (const ev of events) {
      try {
        handleFinancialBadges(ev, context, state, pacing, vfx);
        handlePropertyBadges(ev, state, pacing);
        handleMarketBadges(ev, context, state, vfx);
      } catch (err) {
        console.warn('[BadgeEventSubscriber] Error handling badge event:', err);
      }
    }
  };
}
