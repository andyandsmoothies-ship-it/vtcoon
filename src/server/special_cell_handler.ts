// [UC-GAME-001,008/MSS] Special Cell Handler
import { CellType } from '../domain/board_config';
import type { Room, Player } from '../domain/room';
import { TurnPhase } from '../domain/room';
import type { PropertyRegistry, PropertyStateMap } from '../domain/property_manager';
import { drawMarketCard, drawChanceCard } from '../domain/event_card_engine';
import { sendToAudit } from './audit_manager';

export function handleSpecialCell(
  room: Room,
  cur: Player,
  type: CellType,
  reg: PropertyRegistry,
  sm: PropertyStateMap,
  deckRng: () => number,
): boolean {
  switch (type) {
    case CellType.Market:
      drawMarketCard(room, reg, sm, deckRng);
      return true;
    case CellType.Chance:
      drawChanceCard(room, cur, deckRng, reg, sm);
      return true;
    case CellType.Hose:
      room.phase = TurnPhase.HosePhase;
      return true;
    case CellType.TaxOrder:
      sendToAudit(room, cur.id);
      return true;
    case CellType.Audit:
      room.phase = TurnPhase.PropertyManagement;
      return true;
    case CellType.Tax: {
      const tax = Math.min(2000, Math.max(0, Math.floor(cur.balance * 0.1)));
      cur.balance -= tax;
      room.phase = TurnPhase.PropertyManagement;
      return true;
    }
    default:
      return false;
  }
}
