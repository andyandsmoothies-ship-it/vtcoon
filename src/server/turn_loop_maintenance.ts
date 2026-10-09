// [IMP-310] Turn Loop Maintenance & GO Pass Debt Handlers
import type { Room, Player } from '../domain/room.js';
import { TurnPhase } from '../domain/room.js';
import type { PropertyRegistry, PropertyStateMap, PropertyState } from '../domain/property_manager.js';
import { PROPERTY_DEEDS } from '../domain/property_manager.js';
import { calculateElectricBill } from '../domain/property_rent.js';
import { checkInsolvency } from './insolvency_manager.js';
import type { AuctionSession } from './auction_manager.js';
import { ChanceCardId, MarketCardId } from '../domain/event_card_types.js';

export function isTradeFrozen(room: Room): boolean {
  return (room.activeModifiers ?? []).some(
    (m) => m.type === MarketCardId.MC_FREEZE_TRADE && m.remainingRounds > 0,
  );
}

// [DEBT-S06-01][DEBT-S06-02] Xử lý nợ định kỳ khi player vượt GO (TRƯỚC GO_BONUS)
export function processPendingDebts(room: Room, player: Player): void {
  // CC_FREE_CREDIT: trích lãi 400 vào kho bạc
  if (player.hand.includes(ChanceCardId.CC_FREE_CREDIT)) {
    player.balance -= 400;
    room.treasury = (room.treasury ?? 0) + 400;
  }

  // CC_OVERDRAFT: đếm ngược, thu hồi 3.300 khi hết hạn
  if ((player.overdraftRoundsLeft ?? 0) > 0) {
    player.overdraftRoundsLeft! -= 1;
    if (player.overdraftRoundsLeft === 0) {
      player.balance -= 3_300;
      player.pendingDebts = player.pendingDebts.filter(
        (d) => d !== ChanceCardId.CC_OVERDRAFT,
      );
      if (player.balance < 0) checkInsolvency(room);
    }
  }
}

// IMP-214: Thu hóa đơn tiền điện EVN khi đối thủ vượt GO
export function processGoElectricBilling(
  room: Room,
  player: Player,
  registry: PropertyRegistry,
  stateMap?: PropertyStateMap,
): void {
  const evnOwnerId = registry.get(12);
  if (!evnOwnerId || evnOwnerId === player.id) return;
  const evnOwner = room.players.find((p) => p.id === evnOwnerId);
  if (!evnOwner || evnOwner.bankrupt) return;
  if (evnOwner.inAudit || (evnOwner.auditTurnsLeft ?? 0) > 0) return;
  const isMortgaged = Boolean(
    evnOwner.mortgagedProperties?.includes(12) || stateMap?.get(12)?.isMortgaged,
  );
  if (isMortgaged) return;

  const electricBill = calculateElectricBill(player.id, registry, stateMap);
  if (electricBill <= 0) return;

  const actualPaid = Math.max(0, player.balance);
  player.balance -= electricBill;
  evnOwner.balance += Math.min(electricBill, actualPaid);
}

// [DEBT-S06-03] CC_SLOW_BUILD: kiểm tra và xử lý unbuiltRounds sau mỗi lượt
export function processUnbuiltRounds(
  room: Room,
  current: Player,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  auctions: Map<string, AuctionSession>,
  roomCode: string,
): void {
  for (const [cellIndex, ownerId] of registry.entries()) {
    if (ownerId !== current.id) continue;
    const state = stateMap.get(cellIndex);
    if (!state || state.level !== 0 || state.unbuiltRounds === undefined) continue;

    const nextRounds = state.unbuiltRounds + 1;
    stateMap.set(cellIndex, { ...state, unbuiltRounds: nextRounds });

    if (nextRounds > 2) {
      // Thu hồi ô đất và mở auction 50%
      registry.delete(cellIndex);
      const nextState: PropertyState = { ...state, isMortgaged: false };
      delete (nextState as { unbuiltRounds?: number }).unbuiltRounds;
      stateMap.set(cellIndex, nextState);

      if (current.mortgagedProperties?.includes(cellIndex)) {
        current.mortgagedProperties = current.mortgagedProperties.filter((c) => c !== cellIndex);
      }
      if (current.mortgageLoans?.[cellIndex] !== undefined) {
        delete current.mortgageLoans[cellIndex];
      }

      const deed = PROPERTY_DEEDS.get(cellIndex);
      if (deed) {
        const startingBid = Math.floor(deed.price * 0.50);
        auctions.set(roomCode, {
          cellIndex,
          declinedPlayerId: '',
          highestBid: startingBid,
          startingBid,
          currentBid: startingBid,
          endTime: Date.now() + 20_000,
          passedPlayers: new Set<string>(),
        });
        room.phase = TurnPhase.AuctionPhase;
      }
      break; // [P2-DEFENSE] Chỉ mở 1 auction tại một thời điểm, chống đè session
    }
  }
}
