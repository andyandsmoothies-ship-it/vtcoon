// [IMP-248] Server Authoritative Handler: Transit Wheel
import { Room, TurnPhase, ActionRejectReason, checkPassedGo, calculateGoSalary, BOARD_SIZE, type Player } from '../domain/room.js';
import { BOARD_CONFIG } from '../domain/board_config.js';
import { handleSpecialCell } from './special_cell_handler.js';
import { handleLanding, type PropertyRegistry, type PropertyStateMap } from '../domain/property_manager.js';
import { checkInsolvency } from './insolvency_manager.js';
import {
  TransitWheelOutcome,
  evaluateTransitWheelOutcome,
  findNextPort,
  findSafeHaven,
} from '../domain/transit_wheel.js';

export interface SpinTransitWheelResult {
  readonly success: boolean;
  readonly reason?: string;
  readonly outcome?: TransitWheelOutcome;
  readonly targetCell?: number;
  readonly payout?: number;
}

export function handleSpinTransitWheel(
  room: Room | undefined,
  playerId: string,
  registry?: PropertyRegistry,
  stateMap?: PropertyStateMap,
  rng: () => number = Math.random,
): SpinTransitWheelResult {
  if (!room || !room.started) {
    return { success: false, reason: ActionRejectReason.INVALID_ROOM };
  }
  if (room.phase !== TurnPhase.PropertyManagement) {
    return { success: false, reason: ActionRejectReason.INVALID_PHASE };
  }
  if (!room.pendingTransitWheel || room.pendingTransitWheel.playerId !== playerId) {
    return { success: false, reason: ActionRejectReason.NOT_YOUR_TURN };
  }
  const current = room.players[room.currentPlayerIndex];
  if (!current || current.id !== playerId || current.balance < 0) {
    return { success: false, reason: ActionRejectReason.INSUFFICIENT_FUNDS };
  }

  // Khóa nguyên tử ngay lập tức để chống double-click racing
  room.pendingTransitWheel = null;
  current.hasSpunTransitThisTurn = true;

  const outcome = evaluateTransitWheelOutcome(rng());
  let targetCell = current.position;
  let payout = 0;

  switch (outcome) {
    case TransitWheelOutcome.NEXT_PORT: {
      const oldPos = current.position;
      targetCell = findNextPort(oldPos);
      current.position = targetCell;
      if (checkPassedGo(oldPos, targetCell)) {
        if (room.passedGoSalary === undefined) {
          const sal = calculateGoSalary(room.roundCount ?? 1);
          current.balance += sal;
          room.passedGoSalary = sal;
        } else {
          // Trợ cấp quá cảnh cố định nếu đã vượt GO trước đó
          const stipend = Math.min(500, Math.max(0, room.treasury ?? 0));
          room.treasury = (room.treasury ?? 0) - stipend;
          current.balance += stipend;
        }
      }
      resolveSecondHopLanding(room, current, targetCell, registry, stateMap, rng);
      break;
    }
    case TransitWheelOutcome.SPEED_BOOST: {
      const boost = Math.floor(rng() * 6) + 1; // 1D6
      const oldPos = current.position;
      targetCell = (oldPos + boost) % BOARD_SIZE;
      current.position = targetCell;
      if (checkPassedGo(oldPos, targetCell)) {
        if (room.passedGoSalary === undefined) {
          const sal = calculateGoSalary(room.roundCount ?? 1);
          current.balance += sal;
          room.passedGoSalary = sal;
        }
      }
      resolveSecondHopLanding(room, current, targetCell, registry, stateMap, rng);
      break;
    }
    case TransitWheelOutcome.SAFE_HAVEN: {
      const oldPos = current.position;
      const ownedProps = current.ownedProperties && current.ownedProperties.length > 0
        ? current.ownedProperties
        : (registry ? Array.from(registry.entries()).filter(([_, ownerId]) => ownerId === current.id).map(([cell]) => cell) : []);
      targetCell = findSafeHaven(oldPos, ownedProps);
      current.position = targetCell;
      if (checkPassedGo(oldPos, targetCell)) {
        if (room.passedGoSalary === undefined) {
          const sal = calculateGoSalary(room.roundCount ?? 1);
          current.balance += sal;
          room.passedGoSalary = sal;
        }
      }
      resolveSecondHopLanding(room, current, targetCell, registry, stateMap, rng);
      break;
    }
    case TransitWheelOutcome.CASH_BACK: {
      payout = Math.min(300, Math.max(0, room.treasury ?? 0));
      room.treasury = (room.treasury ?? 0) - payout;
      current.balance += payout;
      break;
    }
    case TransitWheelOutcome.PASS_GO_FLIGHT: {
      const oldPos = current.position;
      targetCell = 0;
      current.position = 0;
      if (room.passedGoSalary === undefined) {
        const sal = calculateGoSalary(room.roundCount ?? 1);
        current.balance += sal;
        room.passedGoSalary = sal;
      } else {
        const stipend = Math.min(500, Math.max(0, room.treasury ?? 0));
        room.treasury = (room.treasury ?? 0) - stipend;
        current.balance += stipend;
      }
      break;
    }
    case TransitWheelOutcome.FLIGHT_DELAY:
    default:
      // Giữ nguyên vị trí, không thưởng phạt
      break;
  }

  room.lastTransitResult = {
    playerId: current.id,
    cellIndex: targetCell,
    outcome,
    targetCell,
    payout: payout > 0 ? payout : undefined,
  };

  return { success: true, outcome, targetCell, payout };
}

function resolveSecondHopLanding(
  room: Room,
  current: Player,
  targetCell: number,
  registry?: PropertyRegistry,
  stateMap?: PropertyStateMap,
  rng: () => number = Math.random,
): void {
  const cell = BOARD_CONFIG[targetCell];
  if (!cell) return;

  const reg = registry ?? new Map<number, string>();
  const sm = stateMap ?? new Map();

  if (handleSpecialCell(room, current, cell.type, reg, sm, rng)) {
    return;
  }

  handleLanding(
    current,
    targetCell,
    reg,
    room.players,
    sm,
    0, // Second hop không tính xúc xắc cho tiện ích
    room.activeModifiers,
    rng,
    room.chanceDiscard,
    room.permanentRentBonus,
    room.roundCount,
    room,
  );

  if (current.balance < 0) {
    const landlordId = reg.get(targetCell);
    checkInsolvency(room, landlordId);
  }
}
