// [IMP-60][UC-GAME-008/MSS] Safe AFK Insolvency Recovery
// Tự động hạ cấp công trình & thế chấp tài sản rẻ nhất cứu nguy khi người chơi AFK ở InsolvencyPhase
import type { RoomManager } from '../room_manager.js';
import { TurnPhase, type Player } from '../../domain/room.js';
import { PROPERTY_DEEDS, type PropertyState } from '../../domain/property_data.js';

export interface AfkRecoveryResult {
  readonly rescued: boolean;
  readonly bankrupt: boolean;
}

function getSortedDowngradableProperties(
  reg: Map<number, string> | undefined,
  sm: Map<number, PropertyState> | undefined,
  playerId: string,
): number[] {
  if (!reg || !sm) return [];
  const candidates: number[] = [];
  for (const [cellIndex, owner] of reg.entries()) {
    if (owner === playerId) {
      const state = sm.get(cellIndex);
      if (state && (state.level ?? 0) > 0) {
        candidates.push(cellIndex);
      }
    }
  }
  return candidates.sort((a, b) => {
    const levelA = sm.get(a)?.level ?? 0;
    const levelB = sm.get(b)?.level ?? 0;
    if (levelB !== levelA) return levelB - levelA;
    const priceA = PROPERTY_DEEDS.get(a)?.price ?? 0;
    const priceB = PROPERTY_DEEDS.get(b)?.price ?? 0;
    return priceA - priceB;
  });
}

function downgradeUntilSolvent(
  rooms: RoomManager,
  roomCode: string,
  player: Player,
): void {
  let attempts = 0;
  while (player.balance < 0 && attempts < 50) {
    attempts++;
    const candidates = getSortedDowngradableProperties(
      rooms.getRegistry(roomCode),
      rooms.getPropertyStates(roomCode),
      player.id,
    );
    if (candidates.length === 0) break;

    let progressed = false;
    for (const cellIndex of candidates) {
      const res = rooms.handleDowngrade(roomCode, player.id, cellIndex, {
        stepByStep: true,
        enforceEvenDowngrading: true,
      });
      if (res.success) {
        progressed = true;
        break;
      }
    }

    if (!progressed) {
      for (const cellIndex of candidates) {
        const res = rooms.handleDowngrade(roomCode, player.id, cellIndex, {
          stepByStep: true,
          enforceEvenDowngrading: false,
        });
        if (res.success) {
          progressed = true;
          break;
        }
      }
    }

    if (!progressed) break;
  }
}

function getSortedUnmortgagedProperties(
  reg: Map<number, string> | undefined,
  sm: Map<number, PropertyState> | undefined,
  player: Player,
): number[] {
  if (!reg) return [];
  const unmortgaged: number[] = [];
  for (const [cellIndex, owner] of reg.entries()) {
    if (owner === player.id && !player.mortgagedProperties.includes(cellIndex)) {
      const state = sm?.get(cellIndex);
      if (!state || ((state.level ?? 0) === 0 && !state.isETC && !state.isUpgradedUtility)) {
        unmortgaged.push(cellIndex);
      }
    }
  }
  return unmortgaged.sort((a, b) => {
    const priceA = PROPERTY_DEEDS.get(a)?.price ?? 0;
    const priceB = PROPERTY_DEEDS.get(b)?.price ?? 0;
    return priceA - priceB;
  });
}

export function executeInsolvencyAfkRecovery(
  rooms: RoomManager,
  roomCode: string,
  playerId: string,
): AfkRecoveryResult {
  const room = rooms.getRoom(roomCode);
  if (!room || room.phase !== TurnPhase.InsolvencyPhase) {
    return { rescued: false, bankrupt: false };
  }
  const player = room.players.find((p) => p.id === playerId);
  if (!player) {
    return { rescued: false, bankrupt: false };
  }
  if (player.balance >= 0) {
    room.phase = TurnPhase.PropertyManagement;
    return { rescued: true, bankrupt: false };
  }

  downgradeUntilSolvent(rooms, roomCode, player);

  if (player.balance >= 0) {
    room.phase = TurnPhase.PropertyManagement;
    return { rescued: true, bankrupt: false };
  }

  const unmortgaged = getSortedUnmortgagedProperties(
    rooms.getRegistry(roomCode),
    rooms.getPropertyStates(roomCode),
    player,
  );
  for (const cellIndex of unmortgaged) {
    if (player.balance >= 0) break;
    rooms.handleMortgage(roomCode, playerId, cellIndex);
  }

  if (player.balance >= 0) {
    room.phase = TurnPhase.PropertyManagement;
    return { rescued: true, bankrupt: false };
  }

  rooms.handlePlayerIntent(roomCode, playerId, { type: 'INTENT_BANKRUPTCY' });
  return { rescued: false, bankrupt: true };
}
