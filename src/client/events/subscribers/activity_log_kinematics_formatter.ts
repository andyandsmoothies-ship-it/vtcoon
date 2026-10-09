// [IMP-344] Activity Log Kinematics Formatter
// Pure formatting helper converting kinematic & chance domain events into localized activity log messages
import { formatTransitWheelBroadcast } from '../../../domain/transit_wheel.js';
import { SynthesizedGameEventType, type SynthesizedGameEvent } from '../game_event_types.js';

export function formatKinematicActivityLog(
  event: SynthesizedGameEvent,
  playerName: string,
  cellName?: string,
): { message: string; type: 'dice' | 'move' | 'card' | 'transit' } | null {
  switch (event.type) {
    case SynthesizedGameEventType.DICE_ROLLED: {
      const [d1, d2] = event.dice;
      const doubleSuffix = event.isDouble ? ' (Đổ đôi! 🎉)' : '';
      return {
        type: 'dice',
        message: `${playerName} đã gieo xúc xắc được ${d1} + ${d2} = ${event.total} điểm${doubleSuffix}`,
      };
    }
    case SynthesizedGameEventType.PAWN_MOVED:
      return {
        type: 'move',
        message: `${playerName} đã di chuyển đến ${cellName ?? `Ô #${event.toCell}`}`,
      };
    case SynthesizedGameEventType.EVENT_CARD_DRAWN: {
      const isMarket = event.cardType === 'market';
      const msg = isMarket
        ? `🎴 [Thị Trường] ${event.title}: ${event.description}`
        : `⚡ [Cơ Hội] ${playerName ? playerName + ': ' : ''}${event.title} - ${event.description}`;
      return { type: 'card', message: msg };
    }
    case SynthesizedGameEventType.TRANSIT_WHEEL_LANDED:
      return {
        type: 'transit',
        message: formatTransitWheelBroadcast({
          outcome: event.outcome,
          playerName,
          stationName: cellName ?? 'Ga Vận Tải',
          targetCellName: event.targetCell !== undefined ? `Ô #${event.targetCell}` : undefined,
          payout: event.payout,
          boostSteps: event.boostSteps,
        }),
      };
    default:
      return null;
  }
}
