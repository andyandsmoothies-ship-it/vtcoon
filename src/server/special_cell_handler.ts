// [UC-GAME-001,008/MSS] Special Cell Handler
import { CellType } from '../domain/board_config';
import type { Room, Player } from '../domain/room';
import { TurnPhase } from '../domain/room';
import type { PropertyRegistry, PropertyStateMap } from '../domain/property_manager';
import { drawMarketCard, drawChanceCard } from '../domain/event_card_engine';
import { sendToAudit } from './audit_manager';
import { TELECOM_DATA_FEE } from '../domain/property_rent';

function processViettelTelecomFee(
  room: Room,
  cur: Player,
  reg: PropertyRegistry,
  sm: PropertyStateMap,
): void {
  const viettelOwnerId = reg.get(28);
  if (!viettelOwnerId || viettelOwnerId === cur.id) return;
  const viettelOwner = room.players.find((p) => p.id === viettelOwnerId);
  if (!viettelOwner || viettelOwner.bankrupt) return;
  if (viettelOwner.inAudit || (viettelOwner.auditTurnsLeft ?? 0) > 0) return;
  const isMortgaged = Boolean(
    viettelOwner.mortgagedProperties?.includes(28) || sm.get(28)?.isMortgaged,
  );
  if (isMortgaged) return;

  const actualPaid = Math.max(0, cur.balance);
  cur.balance -= TELECOM_DATA_FEE;
  viettelOwner.balance += Math.min(TELECOM_DATA_FEE, actualPaid);
}

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
      processViettelTelecomFee(room, cur, reg, sm);
      drawMarketCard(room, reg, sm, deckRng);
      return true;
    case CellType.Chance:
      processViettelTelecomFee(room, cur, reg, sm);
      drawChanceCard(room, cur, deckRng, reg, sm, room.permanentRentBonus);
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
      room.treasury = (room.treasury ?? 0) + tax;
      room.phase = TurnPhase.PropertyManagement;
      return true;
    }
    case CellType.FreeParking:
      room.phase = TurnPhase.PropertyManagement;
      return true;
    default:
      return false;
  }
}
